export type LunchSection = {
  key: string
  label: string
}

export type LunchCoverageItem = {
  key: string
  label: string
  header: string | null
  completedRows: number
}

export type LunchGroupKey =
  | 'entrada'
  | 'principal'
  | 'acompanamiento'
  | 'postre'
  | 'bebida'

export type LunchProductCount = {
  name: string
  count: number
}

export type LunchVarietyDetail = LunchProductCount & {
  samples: string[]
}

export type LunchGroupSummary = {
  group: LunchGroupKey
  label: string
  total: number
  recognized: number
  unrecognized: number
  topProducts: LunchProductCount[]
  byProductBase: LunchProductCount[]
  byVariety: Array<{
    productBase: string
    items: LunchVarietyDetail[]
  }>
}

export type LunchUnrecognizedItem = {
  group: LunchGroupKey
  text: string
  normalizedText: string
  count: number
}

export type LunchAnalysisRow = {
  group: LunchGroupKey
  label: string
  text: string
  normalizedText: string
  recognized: boolean
  productBase: string | null
  variety: string | null
}
