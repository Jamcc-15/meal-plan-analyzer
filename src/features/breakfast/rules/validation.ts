import {
  validateRule as validateGenericRule,
  validateRules as validateGenericRules,
} from '../../rules/validation.ts'
import type {
  BreakfastValidation,
  DesayunoRules,
  Nivel,
  SummaryData,
} from '../types/rules.types.ts'

export const validateRule = (rule: Parameters<typeof validateGenericRule>[0], summary: SummaryData) =>
  validateGenericRule(rule, summary, { allowCrossProductAliases: true })

export const validateRules = (
  sectionRules: Parameters<typeof validateGenericRules>[0],
  nivel: Nivel,
  summary: SummaryData,
) => validateGenericRules(sectionRules, nivel, summary, { allowCrossProductAliases: true })

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
