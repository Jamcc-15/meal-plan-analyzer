import { useCallback } from 'react'
import type { BreakfastValidation, Nivel } from '../types/breakfast-rules.types.ts'
import type { LiquidSummary } from '../types/liquid-analysis.types.ts'

type UseReportExportInput = {
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
  breakfastValidation: BreakfastValidation
  selectedNivel: Nivel
}

export const useReportExport = ({
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
  breakfastValidation,
  selectedNivel,
}: UseReportExportInput) => {
  const exportResultsCsv = useCallback(async () => {
    const { exportResultsCsv } = await import('../utils/reportExport.ts')
    exportResultsCsv({
      liquidSummary,
      solidSummary,
      breakfastRawLiquid,
      breakfastRawSolid,
    })
  }, [liquidSummary, solidSummary, breakfastRawLiquid, breakfastRawSolid])

  const exportResultsPdf = useCallback(async () => {
    const { exportResultsPdf } = await import('../utils/reportExport.ts')
    await exportResultsPdf({
      liquidSummary,
      solidSummary,
      breakfastValidation,
      selectedNivel,
    })
  }, [liquidSummary, solidSummary, breakfastValidation, selectedNivel])

  const previewResultsPdf = useCallback(async () => {
    const { previewResultsPdf } = await import('../utils/reportExport.ts')
    await previewResultsPdf({
      liquidSummary,
      solidSummary,
      breakfastValidation,
      selectedNivel,
    })
  }, [liquidSummary, solidSummary, breakfastValidation, selectedNivel])

  return { exportResultsCsv, exportResultsPdf, previewResultsPdf }
}

export default useReportExport
