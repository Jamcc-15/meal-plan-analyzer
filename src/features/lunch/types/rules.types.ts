import type {
  Nivel,
  Rule as GenericRule,
  RulesSection,
  SummaryData,
  ValidationResult,
} from '../../rules/types.ts'
import type { LunchGroupKey } from './analysis.types.ts'

export type {
  AtomicRule,
  CompositeRule,
  FrecuenciaRule,
  Limite,
  Nivel,
  Rule,
  RuleCondition,
  RuleOperator,
  SummaryData,
  ValidationResult,
  VariedadRule,
} from '../../rules/types.ts'

export interface LunchRuleFile extends RulesSection {
  grupo: LunchGroupKey
  transicion: GenericRule[]
  basica: GenericRule[]
  media: GenericRule[]
  pendientes: string[]
}

export type LunchRulesByGroup = Record<LunchGroupKey, LunchRuleFile>

export interface LunchGroupValidation {
  grupo: LunchGroupKey
  nivel: Nivel
  resultados: ValidationResult[]
  pendientes: string[]
}

export interface LunchValidation {
  nivel: Nivel
  grupos: Record<LunchGroupKey, LunchGroupValidation>
  all: ValidationResult[]
  pendientes: string[]
}

export type LunchSummaryByGroup = Record<LunchGroupKey, SummaryData>
