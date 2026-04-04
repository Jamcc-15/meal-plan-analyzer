import type {
  BreakfastValidation,
  DesayunoRules,
  FrecuenciaRule,
  Nivel,
  Rule,
  RulesSection,
  SummaryData,
  ValidationResult,
  VariedadRule,
} from '../types/rules.types.ts'
import { normalizeText } from '../../../utils/normalizeText.ts'

const getProductBaseMap = (summary: SummaryData): Record<string, number> => {
  return summary.productoBase ?? summary.byProductBase ?? {}
}

const getVarietyMap = (
  summary: SummaryData,
): Record<string, Record<string, number>> => {
  return summary.variedades ?? summary.byVariety ?? {}
}

const splitAlternatives = (value: string): string[] => {
  const normalized = normalizeText(value)
  if (!normalized) return []

  const alternatives = normalized
    .split(/\s+o\s+/)
    .map((item) => item.trim())
    .filter(Boolean)

  return alternatives.length > 0 ? alternatives : [normalized]
}

const buildMatchTargets = (value: string): string[] => {
  const baseTargets = splitAlternatives(value)
  const expanded = new Set(baseTargets)

  baseTargets.forEach((target) => {
    if (target.includes('mermelada')) {
      expanded.add('mermelada')
    }

    if (target.includes('membrillo')) {
      expanded.add('membrillo')
      expanded.add('dulce membrillo')
    }
  })

  return Array.from(expanded)
}

const matchesTarget = (candidate: string, target: string) => {
  const normalizedCandidate = normalizeText(candidate)
  const normalizedTarget = normalizeText(target)

  return (
    normalizedCandidate === normalizedTarget ||
    normalizedCandidate.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedCandidate)
  )
}

const countFromVarietyValues = (summary: SummaryData, productBase: string): number => {
  const varietyMap = getVarietyMap(summary)
  const targets = buildMatchTargets(productBase)

  return Object.values(varietyMap).reduce((acc, varieties) => {
    const subtotal = Object.entries(varieties).reduce((innerAcc, [varietyName, count]) => {
      const hasMatch = targets.some((target) => matchesTarget(varietyName, target))
      return hasMatch ? innerAcc + count : innerAcc
    }, 0)

    return acc + subtotal
  }, 0)
}

const getOwnVarietyTotal = (summary: SummaryData, productBase: string): number => {
  const varietyMap = getVarietyMap(summary)
  const ownVarieties =
    varietyMap[productBase] ??
    Object.entries(varietyMap).find(([key]) => normalizeText(key) === normalizeText(productBase))?.[1] ??
    {}

  return Object.values(ownVarieties).reduce((acc, count) => acc + count, 0)
}

const collectDistinctVarietiesFromValues = (summary: SummaryData, productBase: string): Set<string> => {
  const varietyMap = getVarietyMap(summary)
  const targets = buildMatchTargets(productBase)
  const matchedNames = new Set<string>()

  Object.values(varietyMap).forEach((varieties) => {
    Object.entries(varieties).forEach(([varietyName, count]) => {
      if (count <= 0) return

      const hasMatch = targets.some((target) => matchesTarget(varietyName, target))
      if (hasMatch) {
        matchedNames.add(normalizeText(varietyName))
      }
    })
  })

  return matchedNames
}

const countDistinctVarietiesFromValues = (summary: SummaryData, productBase: string): number => {
  const varietyMap = getVarietyMap(summary)
  const targets = buildMatchTargets(productBase)
  const matchedNames = new Set<string>()

  Object.values(varietyMap).forEach((varieties) => {
    Object.entries(varieties).forEach(([varietyName, count]) => {
      if (count <= 0) return

      const hasMatch = targets.some((target) => matchesTarget(varietyName, target))
      if (hasMatch) {
        matchedNames.add(normalizeText(varietyName))
      }
    })
  })

  return matchedNames.size
}

const getProductCount = (summary: SummaryData, productBase: string): number => {
  const productMap = getProductBaseMap(summary)
  const normalizedTarget = normalizeText(productBase)

  const directCount =
    productMap[productBase] ??
    Object.entries(productMap).find(([key]) => normalizeText(key) === normalizedTarget)?.[1] ??
    0

  // Global monthly validation: include mentions coming from other product-base groups
  // (e.g. tomate/huevo/palta appearing as pan addons) without double counting own rows.
  const matchedVarietiesTotal = countFromVarietyValues(summary, productBase)
  const ownVarietyTotal = getOwnVarietyTotal(summary, productBase)
  const externalContribution = Math.max(matchedVarietiesTotal - ownVarietyTotal, 0)

  if (directCount > 0 || externalContribution > 0) {
    return directCount + externalContribution
  }

  return matchedVarietiesTotal
}

const getDistinctVarietiesCount = (summary: SummaryData, productBase: string): number => {
  const varietyMap = getVarietyMap(summary)
  const varietiesByProduct =
    varietyMap[productBase] ??
    Object.entries(varietyMap).find(([key]) => normalizeText(key) === normalizeText(productBase))
      ?.[1] ??
    {}

  const directNames = new Set<string>()
  Object.entries(varietiesByProduct).forEach(([name, count]) => {
    if (count > 0) {
      directNames.add(normalizeText(name))
    }
  })

  const globalNames = collectDistinctVarietiesFromValues(summary, productBase)
  globalNames.forEach((item) => directNames.add(item))

  if (directNames.size > 0) {
    return directNames.size
  }

  return countDistinctVarietiesFromValues(summary, productBase)
}

const validateFrecuenciaRule = (
  rule: FrecuenciaRule,
  summary: SummaryData,
): ValidationResult => {
  const obtained = getProductCount(summary, rule.producto_base)
  const meetsRule = rule.limite === 'min' ? obtained >= rule.veces : obtained <= rule.veces
  const isWarning =
    rule.limite === 'min'
      ? obtained === Math.max(rule.veces - 1, 0)
      : obtained === rule.veces

  return {
    id: rule.id,
    producto_base: rule.producto_base,
    tipo: rule.tipo,
    cumple: meetsRule,
    estado: meetsRule ? (isWarning ? 'advertencia' : 'cumple') : 'no_cumple',
    esperado: rule.limite === 'min' ? `>= ${rule.veces}` : `<= ${rule.veces}`,
    obtenido: obtained,
    meta: {
      limite: rule.limite,
      veces: rule.veces,
    },
  }
}

const validateVariedadRule = (
  rule: VariedadRule,
  summary: SummaryData,
): ValidationResult => {
  const obtained = getDistinctVarietiesCount(summary, rule.producto_base)
  const meetsRule = obtained >= rule.minima
  const isWarning = meetsRule && obtained === rule.minima

  return {
    id: rule.id,
    producto_base: rule.producto_base,
    tipo: rule.tipo,
    cumple: meetsRule,
    estado: isWarning ? 'advertencia' : meetsRule ? 'cumple' : 'no_cumple',
    esperado: `>= ${rule.minima}`,
    obtenido: obtained,
    meta: {
      minima: rule.minima,
    },
  }
}

const validateRule = (rule: Rule, summary: SummaryData): ValidationResult => {
  if (rule.tipo === 'frecuencia') {
    return validateFrecuenciaRule(rule, summary)
  }

  return validateVariedadRule(rule, summary)
}

export const validateRules = (
  sectionRules: RulesSection | undefined,
  nivel: Nivel,
  summary: SummaryData,
): ValidationResult[] => {
  if (!sectionRules) return []

  const rules = sectionRules[nivel] ?? []

  // Defensively ignore malformed/placeholder entries coming from JSON data.
  const supportedRules = rules.filter(
    (rule) => rule.tipo === 'frecuencia' || rule.tipo === 'variedad',
  )

  return supportedRules.map((rule) => validateRule(rule, summary))
}

export const validateBreakfast = (
  rules: DesayunoRules,
  nivel: Nivel,
  summary: SummaryData,
): BreakfastValidation => {
  const porcionLiquida = validateRules(rules.desayuno.porcion_liquida, nivel, summary)
  const porcionSolida = validateRules(rules.desayuno.porcion_solida, nivel, summary)
  const adicionales = validateRules(rules.desayuno.adicionales, nivel, summary)

  return {
    porcion_liquida: porcionLiquida,
    porcion_solida: porcionSolida,
    adicionales,
    all: [...porcionLiquida, ...porcionSolida, ...adicionales],
  }
}
