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
import { createDirectSummaryMetrics, type SummaryMetrics } from './summaryMetrics.ts'

const buildStatus = (meets: boolean, warning: boolean) =>
  meets ? (warning ? 'advertencia' as const : 'cumple' as const) : 'no_cumple' as const

const validateFrequency = (
  rule: Omit<FrecuenciaRule, 'id'> & { id?: string },
  summary: SummaryData,
  ruleId: string,
  metrics: SummaryMetrics,
): AtomicValidationResult => {
  const obtained = rule.variedad
    ? metrics.varietyCount(summary, rule.producto_base, rule.variedad)
    : metrics.productCount(summary, rule.producto_base)
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
  metrics: SummaryMetrics,
): AtomicValidationResult => {
  const obtained = metrics.distinctVarietiesCount(summary, rule.producto_base)
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
  metrics: SummaryMetrics,
): ValidationResult => {
  const ruleId = 'id' in rule ? rule.id : fallbackId
  if (rule.tipo === 'frecuencia') return validateFrequency(rule, summary, ruleId, metrics)
  if (rule.tipo === 'variedad') return validateVariety(rule, summary, ruleId, metrics)

  const conditions = rule.condiciones.map((condition, index) =>
    validateRuleDefinition(condition, summary, `${ruleId}:condicion:${index + 1}`, metrics),
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
  metrics: SummaryMetrics = createDirectSummaryMetrics(),
): ValidationResult => validateRuleDefinition(rule, summary, rule.id, metrics)

export const validateRules = (
  sectionRules: RulesSection | undefined,
  nivel: Nivel,
  summary: SummaryData,
  metrics: SummaryMetrics = createDirectSummaryMetrics(),
): ValidationResult[] => (sectionRules?.[nivel] ?? []).map((rule) =>
  validateRule(rule, summary, metrics),
)
