export type ExcelRow = Record<string, string>

export type HeaderGroup = {
  label: string
  span: number
}

export type ExcelData = {
  headers: string[]
  rows: ExcelRow[]
  headerGroups?: HeaderGroup[]
  detectedNivel?: 'transicion' | 'basica' | 'media'
}
