import type { LunchGroupKey } from './analysis.types.ts'

export interface LunchDictionaryProduct {
  id: string
  producto_base: string
  variedad: string
  tiempo: 'almuerzo'
  grupo: LunchGroupKey
}

export interface LunchDictionaryPattern {
  producto_id: string
  patron: string
}

export interface LunchDictionary {
  products: LunchDictionaryProduct[]
  patterns: LunchDictionaryPattern[]
}
