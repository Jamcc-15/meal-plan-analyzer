export type Nivel = 'transicion' | 'basica' | 'media'

export type Limite = 'min' | 'max'

export type RuleOperator = 'AND' | 'OR'

interface BaseRule {
  id: string
  producto_base: string
}

export interface FrecuenciaRule extends BaseRule {
  tipo: 'frecuencia'
  variedad?: string
  limite: Limite
  veces: number
}

export interface VariedadRule extends BaseRule {
  tipo: 'variedad'
  minima: number
}

export type AtomicRule = FrecuenciaRule | VariedadRule

export type RuleCondition =
  | Omit<FrecuenciaRule, 'id'>
  | Omit<VariedadRule, 'id'>
  | Omit<CompositeRule, 'id'>

export interface CompositeRule extends BaseRule {
  tipo: 'compuesta'
  operador: RuleOperator
  condiciones: RuleCondition[]
}

export type Rule = AtomicRule | CompositeRule

export interface RulesSection {
  grupo?: string
  transicion?: Rule[]
  basica?: Rule[]
  media?: Rule[]
  pendientes?: string[]
}

export interface SummaryData {
  productoBase?: Record<string, number>
  variedades?: Record<string, Record<string, number>>
  byProductBase?: Record<string, number>
  byVariety?: Record<string, Record<string, number>>
}

export type ValidationStatus = 'cumple' | 'advertencia' | 'no_cumple'

export interface AtomicValidationResult {
  /** Alias conservado para los consumidores existentes de desayuno. */
  id: string
  ruleId: string
  producto_base: string
  variedad?: string
  tipo: AtomicRule['tipo']
  cumple: boolean
  estado: ValidationStatus
  esperado: string | number
  obtenido: string | number
  meta: {
    limite?: Limite
    veces?: number
    minima?: number
  }
}

export interface CompositeValidationResult {
  id: string
  ruleId: string
  producto_base: string
  tipo: 'compuesta'
  cumple: boolean
  estado: ValidationStatus
  esperado: string
  obtenido: string
  meta: Record<string, never>
  operador: RuleOperator
  condiciones: ValidationResult[]
}

export type ValidationResult = AtomicValidationResult | CompositeValidationResult
