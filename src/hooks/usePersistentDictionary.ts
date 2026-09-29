import { useCallback, useState } from 'react'
import useDictionary from './useDictionary.ts'
import type { BreakfastDictionary } from '../types/liquid-analysis.types.ts'

const DICTIONARY_STORAGE_KEY = 'minuta-analyzer:desayuno-dictionary'

export const usePersistentDictionary = () => {
  const seed = useDictionary()
  const [dictionary, setDictionaryState] = useState<BreakfastDictionary>(seed)

  const setDictionary = useCallback((next: BreakfastDictionary) => {
    setDictionaryState(next)
    try {
      localStorage.setItem(DICTIONARY_STORAGE_KEY, JSON.stringify(next))
    } catch {
      // ignore storage errors
    }
  }, [])

  return { dictionary, setDictionary }
}

export default usePersistentDictionary
