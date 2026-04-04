export type Nivel = 'transicion' | 'basica' | 'media'

export type Limite = 'min' | 'max'

export interface FrecuenciaRule {
  id: string
  tipo: 'frecuencia'
  producto_base: string
  limite: Limite
  veces: number
}

export interface VariedadRule {
  id: string
  tipo: 'variedad'
  producto_base: string
  minima: number
}

export type Rule = FrecuenciaRule | VariedadRule

export interface RulesSection {
  transicion?: Rule[]
  basica?: Rule[]
  media?: Rule[]
  pendientes?: string[]
}

export interface DesayunoRules {
  desayuno: {
    porcion_liquida: RulesSection
    porcion_solida: RulesSection
    adicionales?: RulesSection
  }
}

export interface SummaryData {
  productoBase?: Record<string, number>
  variedades?: Record<string, Record<string, number>>
  byProductBase?: Record<string, number>
  byVariety?: Record<string, Record<string, number>>
}

export interface ValidationResult {
  id: string
  producto_base: string
  tipo: Rule['tipo']
  cumple: boolean
  estado: 'cumple' | 'advertencia' | 'no_cumple'
  esperado: string | number
  obtenido: string | number
  meta: {
    limite?: Limite
    veces?: number
    minima?: number
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
