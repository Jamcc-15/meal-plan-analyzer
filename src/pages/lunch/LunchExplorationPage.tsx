import DataTable from '../../components/DataTable.tsx'
import LunchSidePanel from '../../components/lunch/LunchSidePanel.tsx'
import LunchCoveragePanel from '../../components/lunch/LunchCoveragePanel.tsx'
import type { TableDensity } from '../../types/app.types.ts'
import type {
  LunchCoverageItem,
  LunchGroupSummary,
  LunchUnrecognizedItem,
} from '../../features/lunch/types/analysis.types.ts'
import type { ExcelData } from '../../types/excel.types.ts'
import EmptyStateCard from '../../components/ui/EmptyStateCard.tsx'
import { APP_THEME } from '../../themes/appTheme.ts'
import { normalizeText } from '../../utils/normalizeText.ts'

type LunchExplorationPageProps = {
  data: ExcelData | null
  lunchCoverage: LunchCoverageItem[]
  lunchSummary: LunchGroupSummary[]
  lunchUnrecognized: LunchUnrecognizedItem[]
  tableFilter: string
  setTableFilter: (value: string) => void
  rowCount: number
  filteredRowCount: number
  selectedText: string | null
  setSelectedText: (value: string | null) => void
  hoveredText: string | null
  setHoveredText: (value: string | null) => void
  tableDensity: TableDensity
  productBaseByText: Record<string, string>
  selectedCount: number
  hoveredCount: number
  onViewResults: () => void
}

const LunchExplorationPage = ({
  data,
  lunchCoverage,
  lunchSummary,
  lunchUnrecognized,
  tableFilter,
  setTableFilter,
  rowCount,
  filteredRowCount,
  selectedText,
  setSelectedText,
  hoveredText,
  setHoveredText,
  tableDensity,
  productBaseByText,
  selectedCount,
  hoveredCount,
  onViewResults,
}: LunchExplorationPageProps) => {
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
              <label htmlFor="table-filter-lunch" className={`text-xs font-semibold uppercase tracking-wide ${APP_THEME.text.muted}`}>
                Filtro rápido en tabla
              </label>
              <input
                id="table-filter-lunch"
                type="text"
                value={tableFilter}
                onChange={(event) => setTableFilter(event.target.value)}
                placeholder="Buscar en la tabla..."
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
              selectedProductBase={null}
              productBaseByText={productBaseByText}
              tableDensity={tableDensity}
              onSelect={(value) => setSelectedText(value)}
              onHover={(value) => setHoveredText(value)}
              onHoverEnd={() => setHoveredText(null)}
            />
          </div>

          <div className="mt-6">
            <LunchCoveragePanel
              title="Cobertura de columnas de almuerzo"
              description="Verificación de columnas detectadas para Entrada, Principal, Acompañamiento, Postre y Bebida."
              items={lunchCoverage}
            />
          </div>
        </section>

        <LunchSidePanel
          lunchSummary={lunchSummary}
          lunchUnrecognized={lunchUnrecognized}
          selectedText={selectedText}
          selectedCount={selectedCount}
          hoveredText={hoveredText}
          hoveredCount={hoveredCount}
          hasData={Boolean(data)}
          onViewResults={onViewResults}
        />
      </div>

      <section className="rounded-3xl border border-white/70 bg-white/90 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] sm:p-6">
        <h2 className="text-lg font-semibold text-slate-900">Resumen rápido de análisis</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {lunchSummary.map((item) => (
            <article key={item.group} className="rounded-xl border border-slate-200 bg-white p-3">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <p className="mt-2 text-xs text-slate-600">Total detectado: {item.total}</p>
              <p className="mt-1 text-xs text-emerald-700">Reconocidos: {item.recognized}</p>
              <p className="mt-1 text-xs text-rose-700">No reconocidos: {item.unrecognized}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}

export default LunchExplorationPage
