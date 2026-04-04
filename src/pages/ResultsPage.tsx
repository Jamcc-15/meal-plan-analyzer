import LunchCoveragePanel from '../components/lunch/LunchCoveragePanel.tsx'
import ResultsView from '../components/ResultsView.tsx'
import EmptyStateCard from '../components/ui/EmptyStateCard.tsx'
import type { LunchCoverageItem, MealScope } from '../types/app.types.ts'
import type { BreakfastValidation, Nivel, ProductDrilldownMap } from '../features/breakfast/index.ts'
import type { ExcelData } from '../types/excel.types.ts'
import type { LiquidSummary } from '../types/liquid-analysis.types.ts'

type ResultsPageProps = {
  data: ExcelData | null
  selectedMeal: MealScope
  lunchCoverage: LunchCoverageItem[]
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
  selectedNivel: Nivel
  breakfastValidation: BreakfastValidation
  liquidDrilldown: ProductDrilldownMap
  solidDrilldown: ProductDrilldownMap
  onExportPdf: () => void
  onPreviewPdf: () => void
  onBackToExploration: () => void
  onInspectProduct: (productBase: string) => void
}

const ResultsPage = ({
  data,
  selectedMeal,
  lunchCoverage,
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
  selectedNivel,
  breakfastValidation,
  liquidDrilldown,
  solidDrilldown,
  onExportPdf,
  onPreviewPdf,
  onBackToExploration,
  onInspectProduct,
}: ResultsPageProps) => {
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

  if (selectedMeal === 'desayuno') {
    return (
      <ResultsView
        liquidSummary={liquidSummary}
        solidSummary={solidSummary}
        liquidRaw={breakfastRawLiquid}
        solidRaw={breakfastRawSolid}
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

  return (
    <main className="mx-auto w-full max-w-4xl">
      <LunchCoveragePanel
        title="Resultados de Almuerzo en construcción"
        description="Ya detectamos columnas del bloque almuerzo. El siguiente paso es implementar reglas de clasificación para Entrada, Principal, Acompañamiento, Postre y Agua."
        items={lunchCoverage}
      />
    </main>
  )
}

export default ResultsPage
