import { useMemo } from 'react'
import type { MealScope } from '../types/app.types.ts'
import type { ExcelData } from '../types/excel.types.ts'
import type { LiquidDictionary, PortionType } from '../types/liquid-analysis.types.ts'
import { buildLunchCoverage } from '../utils/lunchAnalysis.ts'
import {
  countBreakfastLiquidsRaw,
  countLiquidSummary,
  extractBreakfastLiquidRows,
  getUnrecognizedItems,
} from '../utils/liquidAnalysis.ts'
import { normalizeText } from '../utils/normalizeText.ts'

type UseAnalysisStateInput = {
  data: ExcelData | null
  dictionary: LiquidDictionary
  selectedPortion: PortionType
  selectedMeal: MealScope
  tableFilter: string
  selectedText: string | null
  hoveredText: string | null
}

export const useAnalysisState = ({
  data,
  dictionary,
  selectedPortion,
  selectedMeal,
  tableFilter,
  selectedText,
  hoveredText,
}: UseAnalysisStateInput) => {
  const liquidRows = useMemo(
    () => extractBreakfastLiquidRows(data, dictionary, 'porcion_liquida'),
    [data, dictionary],
  )
  const solidRows = useMemo(
    () => extractBreakfastLiquidRows(data, dictionary, 'porcion_solida'),
    [data, dictionary],
  )

  const analyzedRows = useMemo(
    () => extractBreakfastLiquidRows(data, dictionary, selectedPortion),
    [data, dictionary, selectedPortion],
  )

  const summary = useMemo(() => countLiquidSummary(analyzedRows), [analyzedRows])
  const liquidSummary = useMemo(() => countLiquidSummary(liquidRows), [liquidRows])
  const solidSummary = useMemo(() => countLiquidSummary(solidRows), [solidRows])

  const breakfastRawLiquid = useMemo(
    () => countBreakfastLiquidsRaw(liquidRows),
    [liquidRows],
  )
  const breakfastRawSolid = useMemo(
    () => countBreakfastLiquidsRaw(solidRows),
    [solidRows],
  )

  const unrecognizedItems = useMemo(
    () => getUnrecognizedItems(analyzedRows),
    [analyzedRows],
  )

  const dayHeader = useMemo(() => {
    if (!data) return null
    return data.headers.find((header) => normalizeText(header) === 'dia') ?? null
  }, [data])

  const focusHeader = useMemo(() => {
    if (selectedMeal === 'almuerzo') return null
    if (!data) return null
    return selectedPortion === 'porcion_liquida'
      ? data.headers.find((header) => normalizeText(header).includes('porcion liquida')) ?? null
      : data.headers.find((header) => normalizeText(header).includes('porcion solida')) ?? null
  }, [data, selectedMeal, selectedPortion])

  const productBaseByText = useMemo(() => {
    const map: Record<string, string> = {}
    analyzedRows.forEach((row) => {
      if (!row.productoBase) return
      map[row.textoNormalizado] = row.productoBase
    })
    return map
  }, [analyzedRows])

  const getTextStats = (value: string | null) => {
    if (!data || !value) {
      return { count: 0, days: [] as string[] }
    }

    const target = normalizeText(value)
    let count = 0
    const days = new Set<string>()

    data.rows.forEach((row) => {
      let hasMatchInRow = false

      data.headers.forEach((header) => {
        const cell = String(row[header] ?? '').trim()
        if (normalizeText(cell) === target) {
          count += 1
          hasMatchInRow = true
        }
      })

      if (hasMatchInRow && dayHeader) {
        const day = String(row[dayHeader] ?? '').trim()
        if (day) days.add(day)
      }
    })

    return { count, days: Array.from(days) }
  }

  const selectedStats = useMemo(() => getTextStats(selectedText), [selectedText, data, dayHeader])
  const hoveredStats = useMemo(() => getTextStats(hoveredText), [hoveredText, data, dayHeader])

  const selectedProductBase = useMemo(() => {
    if (selectedMeal === 'almuerzo') return null
    if (!selectedText) return null
    return productBaseByText[normalizeText(selectedText)] ?? null
  }, [selectedMeal, selectedText, productBaseByText])

  const lunchCoverage = useMemo(() => buildLunchCoverage(data), [data])

  const rowCount = data?.rows.length ?? 0
  const analyzedCount = analyzedRows.length
  const recognizedCount = analyzedRows.filter((row) => row.reconocido).length

  const filteredRowCount = useMemo(() => {
    if (!data) return 0

    const normalizedFilter = normalizeText(tableFilter)
    if (!normalizedFilter) return data.rows.length

    return data.rows.filter((row) =>
      data.headers.some((header) =>
        normalizeText(String(row[header] ?? '')).includes(normalizedFilter),
      ),
    ).length
  }, [data, tableFilter])

  return {
    summary,
    liquidSummary,
    solidSummary,
    breakfastRawLiquid,
    breakfastRawSolid,
    unrecognizedItems,
    focusHeader,
    productBaseByText,
    selectedProductBase,
    lunchCoverage,
    rowCount,
    analyzedCount,
    recognizedCount,
    filteredRowCount,
    selectedStats,
    hoveredStats,
  }
}

export default useAnalysisState
