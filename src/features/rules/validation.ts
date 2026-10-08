import { normalizeText } from '../../utils/normalizeText.ts'
import type {
  AtomicValidationResult,
  FrecuenciaRule,
  Nivel,
  Rule,
  RuleCondition,
  RulesSection,
  SummaryData,
  ValidationResult,
  VariedadRule,
} from './types.ts'

const getProductBaseMap = (summary: SummaryData): Record<string, number> =>
  summary.productoBase ?? summary.byProductBase ?? {}

const getVarietyMap = (
  summary: SummaryData,
): Record<string, Record<string, number>> => summary.variedades ?? summary.byVariety ?? {}

const findNormalizedEntry = <T>(source: Record<string, T>, key: string): T | undefined => {
  const normalizedKey = normalizeText(key)
  return Object.entries(source).find(([candidate]) => normalizeText(candidate) === normalizedKey)?.[1]
}

const getVarietiesForProduct = (
  summary: SummaryData,
  productBase: string,
): Record<string, number> => {
  const map = getVarietyMap(summary)
  return map[productBase] ?? findNormalizedEntry(map, productBase) ?? {}
}

const getVarietyCount = (
  summary: SummaryData,
  productBase: string,
  variety: string,
): number => {
  const varieties = getVarietiesForProduct(summary, productBase)
  return varieties[variety] ?? findNormalizedEntry(varieties, variety) ?? 0
}

type ValidationOptions = {
  allowCrossProductAliases?: boolean
}

const splitAlternatives = (value: string): string[] => {
  const normalized = normalizeText(value)
  if (!normalized) return []
  return normalized.split(/\s+o\s+/).map((item) => item.trim()).filter(Boolean)
}

const matchesTarget = (candidate: string, target: string): boolean => {
  const normalizedCandidate = normalizeText(candidate)
  const normalizedTarget = normalizeText(target)
  return (
    normalizedCandidate === normalizedTarget ||
    normalizedCandidate.includes(normalizedTarget) ||
    normalizedTarget.includes(normalizedCandidate)
  )
}

const buildMatchTargets = (value: string): string[] => {
  const targets = new Set(splitAlternatives(value))
  Array.from(targets).forEach((target) => {
    if (target.includes('mermelada')) targets.add('mermelada')
    if (target.includes('membrillo')) {
      targets.add('membrillo')
      targets.add('dulce membrillo')
    }
  })
  return Array.from(targets)
}

const countExternalMentions = (summary: SummaryData, productBase: string): number => {
  const varietyMap = getVarietyMap(summary)
  const ownVarieties = getVarietiesForProduct(summary, productBase)
  const ownTotal = Object.values(ownVarieties).reduce((total, count) => total + count, 0)
  const targets = buildMatchTargets(productBase)
  const allMatches = Object.values(varietyMap).reduce(
    (total, varieties) =>
      total +
      Object.entries(varieties).reduce(
        (subtotal, [name, count]) =>
          targets.some((target) => matchesTarget(name, target)) ? subtotal + count : subtotal,
        0,
      ),
    0,
  )
  return Math.max(allMatches - ownTotal, 0)
}

const getProductCount = (
  summary: SummaryData,
  productBase: string,
  options: ValidationOptions,
): number => {
  const productMap = getProductBaseMap(summary)
  const direct = productMap[productBase] ?? findNormalizedEntry(productMap, productBase) ?? 0
  return options.allowCrossProductAliases
    ? direct + countExternalMentions(summary, productBase)
    : direct
}

const getDistinctVarietiesCount = (
  summary: SummaryData,
  productBase: string,
  options: ValidationOptions,
): number => {
  const direct = new Set(
    Object.entries(getVarietiesForProduct(summary, productBase))
      .filter(([, count]) => count > 0)
      .map(([name]) => normalizeText(name)),
  )

  if (direct.size > 0 || !options.allowCrossProductAliases) return direct.size

  const targets = buildMatchTargets(productBase)
  Object.values(getVarietyMap(summary)).forEach((varieties) => {
    Object.entries(varieties).forEach(([name, count]) => {
      if (count > 0 && targets.some((target) => matchesTarget(name, target))) {
        direct.add(normalizeText(name))
      }
    })
  })
  return direct.size
}

const buildStatus = (meets: boolean, warning: boolean) =>
  meets ? (warning ? 'advertencia' as const : 'cumple' as const) : 'no_cumple' as const

const validateFrequency = (
  rule: Omit<FrecuenciaRule, 'id'> & { id?: string },
  summary: SummaryData,
  ruleId: string,
  options: ValidationOptions,
): AtomicValidationResult => {
  const obtained = rule.variedad
    ? getVarietyCount(summary, rule.producto_base, rule.variedad)
    : getProductCount(summary, rule.producto_base, options)
  const meets = rule.limite === 'min' ? obtained >= rule.veces : obtained <= rule.veces
  const warning = meets && (rule.limite === 'min' ? obtained === rule.veces : obtained === rule.veces)

  return {
    id: ruleId,
    ruleId,
    producto_base: rule.producto_base,
    ...(rule.variedad ? { variedad: rule.variedad } : {}),
    tipo: 'frecuencia',
    cumple: meets,
    estado: buildStatus(meets, warning),
    esperado: `${rule.limite === 'min' ? '>=' : '<='} ${rule.veces}`,
    obtenido: obtained,
    meta: { limite: rule.limite, veces: rule.veces },
  }
}

const validateVariety = (
  rule: Omit<VariedadRule, 'id'> & { id?: string },
  summary: SummaryData,
  ruleId: string,
  options: ValidationOptions,
): AtomicValidationResult => {
  const obtained = getDistinctVarietiesCount(summary, rule.producto_base, options)
  const meets = obtained >= rule.minima
  return {
    id: ruleId,
    ruleId,
    producto_base: rule.producto_base,
    tipo: 'variedad',
    cumple: meets,
    estado: buildStatus(meets, meets && obtained === rule.minima),
    esperado: `>= ${rule.minima}`,
    obtenido: obtained,
    meta: { minima: rule.minima },
  }
}

const validateRuleDefinition = (
  rule: Rule | RuleCondition,
  summary: SummaryData,
  fallbackId: string,
  options: ValidationOptions,
): ValidationResult => {
  const ruleId = 'id' in rule ? rule.id : fallbackId
  if (rule.tipo === 'frecuencia') return validateFrequency(rule, summary, ruleId, options)
  if (rule.tipo === 'variedad') return validateVariety(rule, summary, ruleId, options)

  const conditions = rule.condiciones.map((condition, index) =>
    validateRuleDefinition(condition, summary, `${ruleId}:condicion:${index + 1}`, options),
  )
  const meets = rule.operador === 'AND'
    ? conditions.every((condition) => condition.cumple)
    : conditions.some((condition) => condition.cumple)
  const passed = conditions.filter((condition) => condition.cumple).length

  return {
    id: ruleId,
    ruleId,
    producto_base: rule.producto_base,
    tipo: 'compuesta',
    cumple: meets,
    estado: meets ? 'cumple' : 'no_cumple',
    esperado: `${rule.operador}: ${conditions.length} condiciones`,
    obtenido: `${passed}/${conditions.length}`,
    meta: {},
    operador: rule.operador,
    condiciones: conditions,
  }
}

export const validateRule = (
  rule: Rule,
  summary: SummaryData,
  options: ValidationOptions = {},
): ValidationResult => validateRuleDefinition(rule, summary, rule.id, options)

export const validateRules = (
  sectionRules: RulesSection | undefined,
  nivel: Nivel,
  summary: SummaryData,
  options: ValidationOptions = {},
): ValidationResult[] => (sectionRules?.[nivel] ?? []).map((rule) =>
  validateRule(rule, summary, options),
)
