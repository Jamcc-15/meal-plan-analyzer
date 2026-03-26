import { useCallback } from 'react'
import type { LiquidSummary } from '../types/liquid-analysis.types.ts'

type UseReportExportInput = {
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
}

export const useReportExport = ({
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
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
      breakfastRawSolid,
    })
  }, [liquidSummary, solidSummary, breakfastRawSolid])

  const previewResultsPdf = useCallback(async () => {
    const { previewResultsPdf } = await import('../utils/reportExport.ts')
    await previewResultsPdf({
      liquidSummary,
      solidSummary,
      breakfastRawSolid,
    })
  }, [liquidSummary, solidSummary, breakfastRawSolid])

  return { exportResultsCsv, exportResultsPdf, previewResultsPdf }
}

export default useReportExport
