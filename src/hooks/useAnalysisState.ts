import { useMemo } from 'react'
import type { MealScope } from '../types/app.types.ts'
import type {
  BreakfastValidation,
  DesayunoRules,
  Nivel,
  ProductDrilldownMap,
  SummaryData,
} from '../types/breakfast-rules.types.ts'
import type { ExcelData } from '../types/excel.types.ts'
import type { LiquidDictionary, PortionType } from '../types/liquid-analysis.types.ts'
import breakfastRulesData from '../features/breakfast/data/desayuno.rules.json'
import { validateRules } from '../features/breakfast/rules/validation.ts'
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
  selectedNivel: Nivel
  tableFilter: string
  selectedText: string | null
  hoveredText: string | null
}

export const useAnalysisState = ({
  data,
  dictionary,
  selectedPortion,
  selectedMeal,
  selectedNivel,
  tableFilter,
  selectedText,
  hoveredText,
}: UseAnalysisStateInput) => {
  const buildProductDrilldown = (
    rows: ReturnType<typeof extractBreakfastLiquidRows>,
  ): ProductDrilldownMap => {
    const map: ProductDrilldownMap = {}

    rows.forEach((row) => {
      if (!row.reconocido || !row.productoBase) return

      if (!map[row.productoBase]) {
        map[row.productoBase] = {
          total: 0,
          days: [],
          varieties: [],
        }
      }

      const target = map[row.productoBase]
      target.total += 1

      if (row.dia && !target.days.includes(row.dia)) {
        target.days.push(row.dia)
      }

      if (row.variedad) {
        const existingVariety = target.varieties.find((item) => item.name === row.variedad)
        if (existingVariety) {
          existingVariety.count += 1
        } else {
          target.varieties.push({ name: row.variedad, count: 1 })
        }
      }
    })

    Object.values(map).forEach((item) => {
      item.days.sort((a, b) => a.localeCompare(b, 'es'))
      item.varieties.sort((a, b) => b.count - a.count)
    })

    return map
  }

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
  const liquidDrilldown = useMemo(() => buildProductDrilldown(liquidRows), [liquidRows])
  const solidDrilldown = useMemo(() => buildProductDrilldown(solidRows), [solidRows])

  const breakfastValidation = useMemo<BreakfastValidation>(() => {
    const toSummary = (source: typeof liquidSummary): SummaryData => ({
      productoBase: source.byProductBase,
      variedades: source.byVariety,
    })

    const mergeProductBase = (
      left: Record<string, number>,
      right: Record<string, number>,
    ): Record<string, number> => {
      const merged: Record<string, number> = { ...left }
      Object.entries(right).forEach(([key, value]) => {
        merged[key] = (merged[key] ?? 0) + value
      })
      return merged
    }

    const mergeVarieties = (
      left: Record<string, Record<string, number>>,
      right: Record<string, Record<string, number>>,
    ): Record<string, Record<string, number>> => {
      const merged: Record<string, Record<string, number>> = { ...left }
      Object.entries(right).forEach(([productBase, varieties]) => {
        if (!merged[productBase]) {
          merged[productBase] = { ...varieties }
          return
        }

        Object.entries(varieties).forEach(([variety, count]) => {
          merged[productBase][variety] = (merged[productBase][variety] ?? 0) + count
        })
      })
      return merged
    }

    const liquidSummaryData = toSummary(liquidSummary)
    const solidSummaryData = toSummary(solidSummary)
    const mergedSummary: SummaryData = {
      productoBase: mergeProductBase(
        liquidSummaryData.productoBase ?? {},
        solidSummaryData.productoBase ?? {},
      ),
      variedades: mergeVarieties(
        liquidSummaryData.variedades ?? {},
        solidSummaryData.variedades ?? {},
      ),
    }

    const rules = breakfastRulesData as DesayunoRules
    const porcionLiquida = validateRules(
      rules.desayuno.porcion_liquida,
      selectedNivel,
      liquidSummaryData,
    )
    const porcionSolida = validateRules(
      rules.desayuno.porcion_solida,
      selectedNivel,
      solidSummaryData,
    )
    const adicionales = validateRules(rules.desayuno.adicionales, selectedNivel, mergedSummary).filter(
      (item) => {
        if (typeof item.obtenido === 'number') {
          return item.obtenido > 0
        }

        const parsed = Number(item.obtenido)
        return Number.isFinite(parsed) && parsed > 0
      },
    )

    return {
      porcion_liquida: porcionLiquida,
      porcion_solida: porcionSolida,
      adicionales,
      all: [...porcionLiquida, ...porcionSolida, ...adicionales],
    }
  }, [liquidSummary, solidSummary, selectedNivel])

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

  const unrecognizedItemsCombined = useMemo(
    () => getUnrecognizedItems([...liquidRows, ...solidRows]),
    [liquidRows, solidRows],
  )

  const dayHeader = useMemo(() => {
    if (!data) return null
    return data.headers.find((header) => normalizeText(header) === 'dia') ?? null
  }, [data])

  const productBaseByText = useMemo(() => {
    const map: Record<string, string> = {}
    const breakfastRows = [...liquidRows, ...solidRows]
    breakfastRows.forEach((row) => {
      if (!row.productoBase) return
      if (!map[row.textoNormalizado]) {
        map[row.textoNormalizado] = row.productoBase
      }
    })
    return map
  }, [liquidRows, solidRows])

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
    unrecognizedItemsCombined,
    productBaseByText,
    selectedProductBase,
    lunchCoverage,
    rowCount,
    analyzedCount,
    recognizedCount,
    filteredRowCount,
    selectedStats,
    hoveredStats,
    breakfastValidation,
    liquidDrilldown,
    solidDrilldown,
  }
}

export default useAnalysisState
