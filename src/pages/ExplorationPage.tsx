import DataTable from '../components/DataTable.tsx'
import LunchCoveragePanel from '../components/lunch/LunchCoveragePanel.tsx'
import SidePanel from '../components/SidePanel.tsx'
import EmptyStateCard from '../components/ui/EmptyStateCard.tsx'
import type { LunchCoverageItem, MealScope, TableDensity } from '../types/app.types.ts'
import type { ExcelData } from '../types/excel.types.ts'
import type { PortionType, LiquidSummary, UnrecognizedItem } from '../types/liquid-analysis.types.ts'
import { APP_THEME } from '../themes/appTheme.ts'
import { normalizeText } from '../utils/normalizeText.ts'

type ExplorationPageProps = {
  data: ExcelData | null
  tableFilter: string
  setTableFilter: (value: string) => void
  rowCount: number
  filteredRowCount: number
  selectedText: string | null
  setSelectedText: (value: string | null) => void
  hoveredText: string | null
  setHoveredText: (value: string | null) => void
  selectedProductBase: string | null
  productBaseByText: Record<string, string>
  tableDensity: TableDensity
  selectedMeal: MealScope
  lunchCoverage: LunchCoverageItem[]
  summary: LiquidSummary
  selectedCount: number
  selectedDays: string[]
  hoveredCount: number
  hoveredDays: string[]
  unrecognizedItems: UnrecognizedItem[]
  selectedPortion: PortionType
  onViewResults: () => void
}

const ExplorationPage = ({
  data,
  tableFilter,
  setTableFilter,
  rowCount,
  filteredRowCount,
  selectedText,
  setSelectedText,
  hoveredText,
  setHoveredText,
  selectedProductBase,
  productBaseByText,
  tableDensity,
  selectedMeal,
  lunchCoverage,
  summary,
  selectedCount,
  selectedDays,
  hoveredCount,
  hoveredDays,
  unrecognizedItems,
  selectedPortion,
  onViewResults,
}: ExplorationPageProps) => {
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <EmptyStateCard
          title="Carga una minuta"
          description="Sube un archivo Excel para comenzar el análisis."
        />
      </main>
    )
  }

  return (
    <main className="space-y-6">
      <div className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.45fr)_minmax(250px,280px)] xl:grid-cols-[minmax(0,1.55fr)_minmax(260px,300px)]">
        <section className={`w-full p-4 sm:p-6 ${APP_THEME.surface.section}`}>
        <div className={`mt-6 flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between ${APP_THEME.surface.panel}`}>
          <div className="w-full sm:max-w-md">
            <label htmlFor="table-filter" className={`text-xs font-semibold uppercase tracking-wide ${APP_THEME.text.muted}`}>
              Filtro rápido en tabla
            </label>
            <input
              id="table-filter"
              type="text"
              value={tableFilter}
              onChange={(event) => setTableFilter(event.target.value)}
              placeholder="Buscar texto en cualquier columna..."
              className={`mt-2 ${APP_THEME.input.text}`}
            />
            <p className={`mt-2 text-xs ${APP_THEME.text.muted}`}>
              Filas filtradas: <strong className="text-slate-700">{filteredRowCount}</strong> / {rowCount}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSelectedText(null)
                setHoveredText(null)
              }}
              className={`px-3 py-2 ${APP_THEME.button.ghost}`}
            >
              Limpiar selección
            </button>
            <button
              type="button"
              onClick={() => setTableFilter('')}
              className={`px-3 py-2 ${APP_THEME.button.ghost}`}
            >
              Limpiar filtro
            </button>
          </div>
        </div>

        <div className="mt-6">
          <DataTable
            data={data}
            filterText={tableFilter}
            selectedValue={selectedText ? normalizeText(selectedText) : null}
            selectedProductBase={selectedProductBase}
            productBaseByText={productBaseByText}
            tableDensity={tableDensity}
            onSelect={(value) => setSelectedText(value)}
            onHover={(value) => setHoveredText(value)}
            onHoverEnd={() => setHoveredText(null)}
          />
        </div>
        </section>

        {selectedMeal === 'desayuno' ? (
          <SidePanel
            summary={summary}
            selectedText={selectedText}
            selectedCount={selectedCount}
            selectedDays={selectedDays}
            hoveredText={hoveredText}
            hoveredCount={hoveredCount}
            hoveredDays={hoveredDays}
            unrecognizedItems={unrecognizedItems}
            selectedPortion={selectedPortion}
            hasData={Boolean(data)}
            onViewResults={onViewResults}
          />
        ) : (
          <LunchCoveragePanel
            title="Almuerzo en construcción"
            description="Sección preparada para Entrada, Principal, Acompañamiento, Postre y Agua."
            items={lunchCoverage}
            showAction
          />
        )}
      </div>
    </main>
  )
}

export default ExplorationPage
