import type { ExcelData } from '../types/excel.types.ts'
import type { LunchCoverageItem, LunchSection } from '../types/app.types.ts'
import { normalizeText } from './normalizeText.ts'

export const LUNCH_SECTIONS: LunchSection[] = [
  { key: 'entrada', label: 'Entrada' },
  { key: 'principal', label: 'Principal' },
  { key: 'acompanamiento', label: 'Acompanamiento' },
  { key: 'postre', label: 'Postre' },
  { key: 'agua', label: 'Agua' },
]

export const buildLunchCoverage = (
  data: ExcelData | null,
  sections: LunchSection[] = LUNCH_SECTIONS,
): LunchCoverageItem[] => {
  if (!data) {
    return sections.map((item) => ({
      ...item,
      header: null,
      completedRows: 0,
    }))
  }

  return sections.map((section) => {
    const header =
      data.headers.find((item) => normalizeText(item).includes(section.key)) ?? null

    if (!header) {
      return {
        ...section,
        header: null,
        completedRows: 0,
      }
    }

    const completedRows = data.rows.filter((row) => {
      const value = String(row[header] ?? '').trim()
      return value !== '' && value !== '-'
    }).length

    return {
      ...section,
      header,
      completedRows,
    }
  })
}
