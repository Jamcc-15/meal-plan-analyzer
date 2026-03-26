export type PortionType = 'porcion_liquida' | 'porcion_solida'

export type DictionaryProduct = {
  id: string
  producto_base: string
  variedad: string
  tiempo: 'desayuno'
  porcion: PortionType
}

export type DictionaryPattern = {
  producto_id: string
  patron: string
}

export type LiquidDictionary = {
  products: DictionaryProduct[]
  patterns: DictionaryPattern[]
}

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
