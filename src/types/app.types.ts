export type MealScope = 'desayuno' | 'almuerzo'
export type TableDensity = 'compacto' | 'comodo'

export type LunchSection = {
  key: string
  label: string
}

export type LunchCoverageItem = LunchSection & {
  header: string | null
  completedRows: number
}
