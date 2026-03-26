import { useEffect, useState } from 'react'
import type { MealScope, TableDensity } from '../types/app.types.ts'
import type { PortionType } from '../types/liquid-analysis.types.ts'

const TABLE_FILTER_STORAGE_KEY = 'minuta-analyzer:table-filter'
const PORTION_STORAGE_KEY = 'minuta-analyzer:selected-portion'
const MEAL_STORAGE_KEY = 'minuta-analyzer:selected-meal'
const TABLE_DENSITY_STORAGE_KEY = 'minuta-analyzer:table-density'

const getStoredPortion = (): PortionType => {
  const stored = localStorage.getItem(PORTION_STORAGE_KEY)
  return stored === 'porcion_solida' || stored === 'porcion_liquida'
    ? stored
    : 'porcion_liquida'
}

const getStoredMeal = (): MealScope => {
  const stored = localStorage.getItem(MEAL_STORAGE_KEY)
  return stored === 'almuerzo' ? 'almuerzo' : 'desayuno'
}

const getStoredTableDensity = (): TableDensity => {
  const stored = localStorage.getItem(TABLE_DENSITY_STORAGE_KEY)
  return stored === 'compacto' ? 'compacto' : 'comodo'
}

export const useAppPreferences = () => {
  const [tableFilter, setTableFilter] = useState(() =>
    localStorage.getItem(TABLE_FILTER_STORAGE_KEY) ?? '',
  )
  const [selectedPortion, setSelectedPortion] = useState<PortionType>(getStoredPortion)
  const [selectedMeal, setSelectedMeal] = useState<MealScope>(getStoredMeal)
  const [tableDensity, setTableDensity] = useState<TableDensity>(getStoredTableDensity)

  useEffect(() => {
    localStorage.setItem(TABLE_FILTER_STORAGE_KEY, tableFilter)
  }, [tableFilter])

  useEffect(() => {
    localStorage.setItem(PORTION_STORAGE_KEY, selectedPortion)
  }, [selectedPortion])

  useEffect(() => {
    localStorage.setItem(MEAL_STORAGE_KEY, selectedMeal)
  }, [selectedMeal])

  useEffect(() => {
    localStorage.setItem(TABLE_DENSITY_STORAGE_KEY, tableDensity)
  }, [tableDensity])

  const clearStoredFilter = () => {
    setTableFilter('')
    localStorage.removeItem(TABLE_FILTER_STORAGE_KEY)
  }

  return {
    tableFilter,
    setTableFilter,
    selectedPortion,
    setSelectedPortion,
    selectedMeal,
    setSelectedMeal,
    tableDensity,
    setTableDensity,
    clearStoredFilter,
  }
}

export default useAppPreferences
