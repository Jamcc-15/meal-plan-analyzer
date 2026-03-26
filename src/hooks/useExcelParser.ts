import { useCallback, useEffect, useState } from 'react'
import type { ExcelData } from '../types/excel.types.ts'
import { parseExcelFile } from '../utils/excel.ts'

const STORAGE_KEY = 'minuta-analyzer:data'

const useExcelParser = () => {
  const [data, setData] = useState<ExcelData | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    try {
      const parsed = JSON.parse(stored) as ExcelData
      setData(parsed)
    } catch (err) {
      localStorage.removeItem(STORAGE_KEY)
      setError(err instanceof Error ? err.message : 'Error al restaurar datos')
    }
  }, [])

  const parseFile = useCallback(async (file: File) => {
    setIsLoading(true)
    setError(null)

    try {
      const parsed = await parseExcelFile(file)
      setData(parsed)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
    } catch (err) {
      setData(null)
      localStorage.removeItem(STORAGE_KEY)
      setError(err instanceof Error ? err.message : 'Error al leer el archivo')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const clearData = useCallback(() => {
    setData(null)
    setError(null)
    localStorage.removeItem(STORAGE_KEY)
  }, [])

  return { data, error, isLoading, parseFile, clearData }
}

export default useExcelParser
