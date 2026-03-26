import { useMemo } from 'react'
import liquidDictionary from '../data/liquidDictionary.json'
import type { LiquidDictionary } from '../types/liquid-analysis.types.ts'
import { normalizeText } from '../utils/normalizeText.ts'

const DICTIONARY_STORAGE_KEY = 'minuta-analyzer:liquid-dictionary'
const dictionarySeed = liquidDictionary as LiquidDictionary

const isDictionaryShape = (value: unknown): value is LiquidDictionary => {
  if (!value || typeof value !== 'object') return false
  const candidate = value as Record<string, unknown>
  return Array.isArray(candidate.products) && Array.isArray(candidate.patterns)
}

const mergeWithSeed = (stored: LiquidDictionary, seed: LiquidDictionary): LiquidDictionary => {
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
  return useMemo<LiquidDictionary>(() => {
    const stored = localStorage.getItem(DICTIONARY_STORAGE_KEY)
    if (!stored) return dictionarySeed

    try {
      const parsed = JSON.parse(stored)
      if (!isDictionaryShape(parsed)) {
        return dictionarySeed
      }
      return mergeWithSeed(parsed, dictionarySeed)
    } catch {
      return dictionarySeed
    }
  }, [])
}

export default useDictionary
