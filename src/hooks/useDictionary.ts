import { useMemo } from 'react'
import desayunoDictionary from '../features/breakfast/data/desayunoDictionary.json'
import type { BreakfastDictionary } from '../types/liquid-analysis.types.ts'
import { normalizeText } from '../utils/normalizeText.ts'

const DICTIONARY_STORAGE_KEY = 'minuta-analyzer:desayuno-dictionary'
const LEGACY_DICTIONARY_STORAGE_KEY = 'minuta-analyzer:liquid-dictionary'
const dictionarySeed = desayunoDictionary as BreakfastDictionary

const PRODUCT_BASE_MIGRATIONS: Record<string, string> = {
  'leche liquida': 'Leche líquida',
  'formula lactea saborizada': 'Fórmula láctea saborizada',
  avena: 'Cereales',
}

const normalizeProductBaseLabel = (value: string): string => {
  const normalized = normalizeText(value)
  return PRODUCT_BASE_MIGRATIONS[normalized] ?? value
}

const applyProductBaseMigrations = (
  dictionary: BreakfastDictionary,
): BreakfastDictionary => {
  return {
    ...dictionary,
    products: dictionary.products.map((item) => ({
      ...item,
      producto_base: normalizeProductBaseLabel(item.producto_base),
    })),
  }
}

const isDictionaryShape = (value: unknown): value is BreakfastDictionary => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return Array.isArray(candidate.products) && Array.isArray(candidate.patterns)
}

const mergeWithSeed = (
  stored: BreakfastDictionary,
  seed: BreakfastDictionary,
): BreakfastDictionary => {
  const productMap = new Map(stored.products.map((item) => [item.id, item]))
  seed.products.forEach((item) => {
    if (!productMap.has(item.id)) {
      productMap.set(item.id, item)
    }
  })

  const patternSet = new Set(
    stored.patterns.map((item) => `${item.producto_id}::${normalizeText(item.patron)}`),
  )
  const mergedPatterns = [...stored.patterns]

  seed.patterns.forEach((item) => {
    const key = `${item.producto_id}::${normalizeText(item.patron)}`
    if (patternSet.has(key)) return
    patternSet.add(key)
    mergedPatterns.push(item)
  })

  return {
    products: Array.from(productMap.values()),
    patterns: mergedPatterns,
  }
}

export const useDictionary = () => {
  return useMemo<BreakfastDictionary>(() => {
    const stored =
      localStorage.getItem(DICTIONARY_STORAGE_KEY) ??
      localStorage.getItem(LEGACY_DICTIONARY_STORAGE_KEY)

    if (!stored) {
      return applyProductBaseMigrations(dictionarySeed)
    }

    try {
      const parsed = JSON.parse(stored)
      if (!isDictionaryShape(parsed)) {
        return applyProductBaseMigrations(dictionarySeed)
      }
      const merged = mergeWithSeed(
        parsed,
        dictionarySeed,
      )
      localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(merged))
      localStorage.removeItem(LEGACY_DICTIONARY_STORAGE_KEY)
      return applyProductBaseMigrations(merged)
    } catch {
      return applyProductBaseMigrations(dictionarySeed)
    }
  }, [])
}

export default useDictionary
