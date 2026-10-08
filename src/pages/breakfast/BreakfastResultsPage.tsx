import BreakfastResultsCompliancePage from './BreakfastResultsCompliancePage.tsx'
import AnalysisBlockSelector from '../../components/AnalysisBlockSelector.tsx'
import AnalysisRulesSelector from '../../components/AnalysisRulesSelector.tsx'
import type { MealScope } from '../../types/app.types.ts'
import EmptyStateCard from '../../components/ui/EmptyStateCard.tsx'
import type { BreakfastValidation, Nivel, ProductDrilldownMap } from '../../features/breakfast/index.ts'
import type { ExcelData } from '../../types/excel.types.ts'
import type {
  LiquidAnalysisRow,
  LiquidSummary,
  UnrecognizedItem,
} from '../../types/liquid-analysis.types.ts'

type BreakfastResultsPageProps = {
  data: ExcelData | null
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
  unrecognizedItems: UnrecognizedItem[]
  selectedNivel: Nivel
  onChangeNivel: (nivel: Nivel) => void
  breakfastValidation: BreakfastValidation
  liquidDrilldown: ProductDrilldownMap
  solidDrilldown: ProductDrilldownMap
  breakfastRows: LiquidAnalysisRow[]
  onExportPdf: () => void
  onPreviewPdf: () => void
  onBackToExploration: () => void
  onInspectProduct: (productBase: string) => void
  selectedMeal: MealScope
  onChangeMeal: (meal: MealScope) => void
}

const BreakfastResultsPage = ({
  data,
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
  unrecognizedItems,
  selectedNivel,
  onChangeNivel,
  breakfastValidation,
  liquidDrilldown,
  solidDrilldown,
  breakfastRows,
  onExportPdf,
  onPreviewPdf,
  onBackToExploration,
  onInspectProduct,
  selectedMeal,
  onChangeMeal,
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
    <>
      <div className="mx-auto w-full max-w-6xl px-4 pt-6 sm:px-6 lg:px-8">
        <AnalysisRulesSelector
          selectedNivel={selectedNivel}
          onChangeNivel={onChangeNivel}
          detectedNivel={data.detectedNivel}
        />
        <div className="mt-3">
        <AnalysisBlockSelector selectedMeal={selectedMeal} onChangeMeal={onChangeMeal} />
        </div>
      </div>
      <BreakfastResultsCompliancePage
        liquidSummary={liquidSummary}
        solidSummary={solidSummary}
        breakfastRawLiquid={breakfastRawLiquid}
        breakfastRawSolid={breakfastRawSolid}
        unrecognizedItems={unrecognizedItems}
        selectedNivel={selectedNivel}
        breakfastValidation={breakfastValidation}
        liquidDrilldown={liquidDrilldown}
        solidDrilldown={solidDrilldown}
        breakfastRows={breakfastRows}
        onExportPdf={onExportPdf}
        onPreviewPdf={onPreviewPdf}
        onBackToExploration={onBackToExploration}
        onInspectProduct={onInspectProduct}
        data={data}
      />
    </>
  )
}

export default BreakfastResultsPage
