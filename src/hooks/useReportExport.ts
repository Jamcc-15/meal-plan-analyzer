import { useCallback } from 'react'
import type { BreakfastValidation, Nivel } from '../types/breakfast-rules.types.ts'
import type { LiquidSummary } from '../types/liquid-analysis.types.ts'
import type { LunchGroupSummary, LunchUnrecognizedItem } from '../features/lunch/types/analysis.types.ts'
import type { LunchValidation } from '../features/lunch/types/rules.types.ts'

type UseReportExportInput = {
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
  breakfastValidation: BreakfastValidation
  selectedNivel: Nivel
  lunchSummary: LunchGroupSummary[]
  lunchUnrecognized: LunchUnrecognizedItem[]
  lunchValidation: LunchValidation
}

export const useReportExport = ({
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
  breakfastValidation,
  selectedNivel,
  lunchSummary,
  lunchUnrecognized,
  lunchValidation,
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

  const exportLunchResultsPdf = useCallback(async () => {
    const { exportLunchPdf } = await import('../utils/lunchReportExport.ts')
    await exportLunchPdf({ lunchSummary, lunchUnrecognized, lunchValidation })
  }, [lunchSummary, lunchUnrecognized, lunchValidation])

  const previewLunchResultsPdf = useCallback(async () => {
    const { previewLunchPdf } = await import('../utils/lunchReportExport.ts')
    await previewLunchPdf({ lunchSummary, lunchUnrecognized, lunchValidation })
  }, [lunchSummary, lunchUnrecognized, lunchValidation])

  return {
    exportResultsCsv,
    exportResultsPdf,
    previewResultsPdf,
    exportLunchResultsPdf,
    previewLunchResultsPdf,
  }
}

export default useReportExport
