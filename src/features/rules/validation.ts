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

const getProductCount = (summary: SummaryData, productBase: string): number => {
  const productMap = getProductBaseMap(summary)
  return productMap[productBase] ?? findNormalizedEntry(productMap, productBase) ?? 0
}

const getDistinctVarietiesCount = (summary: SummaryData, productBase: string): number => {
  const direct = new Set(
    Object.entries(getVarietiesForProduct(summary, productBase))
      .filter(([, count]) => count > 0)
      .map(([name]) => normalizeText(name)),
  )

  return direct.size
}

const buildStatus = (meets: boolean, warning: boolean) =>
  meets ? (warning ? 'advertencia' as const : 'cumple' as const) : 'no_cumple' as const

const validateFrequency = (
  rule: Omit<FrecuenciaRule, 'id'> & { id?: string },
  summary: SummaryData,
  ruleId: string,
): AtomicValidationResult => {
  const obtained = rule.variedad
    ? getVarietyCount(summary, rule.producto_base, rule.variedad)
    : getProductCount(summary, rule.producto_base)
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
): AtomicValidationResult => {
  const obtained = getDistinctVarietiesCount(summary, rule.producto_base)
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
): ValidationResult => {
  const ruleId = 'id' in rule ? rule.id : fallbackId
  if (rule.tipo === 'frecuencia') return validateFrequency(rule, summary, ruleId)
  if (rule.tipo === 'variedad') return validateVariety(rule, summary, ruleId)

  const conditions = rule.condiciones.map((condition, index) =>
    validateRuleDefinition(condition, summary, `${ruleId}:condicion:${index + 1}`),
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

export const validateRule = (rule: Rule, summary: SummaryData): ValidationResult =>
  validateRuleDefinition(rule, summary, rule.id)

export const validateRules = (
  sectionRules: RulesSection | undefined,
  nivel: Nivel,
  summary: SummaryData,
): ValidationResult[] => (sectionRules?.[nivel] ?? []).map((rule) => validateRule(rule, summary))
