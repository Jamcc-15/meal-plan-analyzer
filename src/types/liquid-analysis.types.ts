export type PortionType = 'porcion_liquida' | 'porcion_solida'

export type DictionaryProduct = {
  id: string
  producto_base: string
  variedad: string
  tiempo: 'desayuno'
  porcion: PortionType
  sinonimos?: string[]
}

export type DictionaryPattern = {
  producto_id: string
  patron: string
}

export type BreakfastDictionary = {
  products: DictionaryProduct[]
  patterns: DictionaryPattern[]
}

// Legacy alias kept to avoid broad refactors in existing modules.
export type LiquidDictionary = BreakfastDictionary

export type LiquidAnalysisRow = {
  dia: string
  porcionTexto: string
  textoNormalizado: string
  productoBase: string | null
  variedad: string | null
  productId: string | null
  porcion: PortionType
  reconocido: boolean
}

export type LiquidSummary = {
  byProductBase: Record<string, number>
  byVariety: Record<string, Record<string, number>>
  unrecognizedCount: number
}

export type UnrecognizedItem = {
  text: string
  count: number
}

export type MealSectionSummary = {
  breakfast: Record<string, number>
  lunch: Record<string, number>
}
