import ResultsView from '../../components/ResultsView.tsx'
import EmptyStateCard from '../../components/ui/EmptyStateCard.tsx'
import type { BreakfastValidation, Nivel, ProductDrilldownMap } from '../../features/breakfast/index.ts'
import type { ExcelData } from '../../types/excel.types.ts'
import type { LiquidSummary, UnrecognizedItem } from '../../types/liquid-analysis.types.ts'

type BreakfastResultsPageProps = {
  data: ExcelData | null
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
  unrecognizedItems: UnrecognizedItem[]
  selectedNivel: Nivel
  breakfastValidation: BreakfastValidation
  liquidDrilldown: ProductDrilldownMap
  solidDrilldown: ProductDrilldownMap
  onExportPdf: () => void
  onPreviewPdf: () => void
  onBackToExploration: () => void
  onInspectProduct: (productBase: string) => void
}

const BreakfastResultsPage = ({
  data,
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
  unrecognizedItems,
  selectedNivel,
  breakfastValidation,
  liquidDrilldown,
  solidDrilldown,
  onExportPdf,
  onPreviewPdf,
  onBackToExploration,
  onInspectProduct,
}: BreakfastResultsPageProps) => {
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <EmptyStateCard
          title="No hay archivo cargado"
          description="Para ver resultados, primero debes cargar una minuta en Vista Exploración."
          actionLabel="Ir a Vista Exploración"
          onAction={onBackToExploration}
          centered
        />
      </main>
    )
  }

  return (
    <ResultsView
      liquidSummary={liquidSummary}
      solidSummary={solidSummary}
      liquidRaw={breakfastRawLiquid}
      solidRaw={breakfastRawSolid}
      unrecognizedItems={unrecognizedItems}
      selectedNivel={selectedNivel}
      breakfastValidation={breakfastValidation}
      liquidDrilldown={liquidDrilldown}
      solidDrilldown={solidDrilldown}
      onExportPdf={onExportPdf}
      onPreviewPdf={onPreviewPdf}
      onInspectProduct={onInspectProduct}
    />
  )
}

export default BreakfastResultsPage
