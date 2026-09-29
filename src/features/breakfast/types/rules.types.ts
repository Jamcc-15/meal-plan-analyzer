import type {
  RulesSection,
  SummaryData,
  ValidationResult,
} from '../../rules/types.ts'

export type {
  AtomicRule,
  CompositeRule,
  FrecuenciaRule,
  Limite,
  Nivel,
  Rule,
  RuleCondition,
  RuleOperator,
  RulesSection,
  SummaryData,
  ValidationResult,
  VariedadRule,
} from '../../rules/types.ts'

export interface DesayunoRules {
  desayuno: {
    porcion_liquida: RulesSection
    porcion_solida: RulesSection
    adicionales?: RulesSection
  }
}

export interface BreakfastValidation {
  porcion_liquida: ValidationResult[]
  porcion_solida: ValidationResult[]
  adicionales: ValidationResult[]
  all: ValidationResult[]
}

export interface ProductDrilldown {
  total: number
  days: string[]
  varieties: Array<{ name: string; count: number }>
}

export type ProductDrilldownMap = Record<string, ProductDrilldown>

export type BreakfastSummaryData = SummaryData
