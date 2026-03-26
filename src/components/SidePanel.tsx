import type {
  PortionType,
  LiquidSummary,
  UnrecognizedItem,
} from '../types/liquid-analysis.types.ts'
import { APP_THEME } from '../themes/appTheme.ts'

type SidePanelProps = {
  summary: LiquidSummary
  selectedText: string | null
  selectedCount: number
  selectedDays: string[]
  hoveredText: string | null
  hoveredCount: number
  hoveredDays: string[]
  unrecognizedItems: UnrecognizedItem[]
  selectedPortion: PortionType
  hasData: boolean
  onViewResults: () => void
}

const toSortedEntries = (input: Record<string, number>) => {
  return Object.entries(input).sort((a, b) => b[1] - a[1])
}

const SidePanel = ({
  summary,
  selectedText,
  selectedCount,
  selectedDays,
  hoveredText,
  hoveredCount,
  hoveredDays,
  unrecognizedItems,
  selectedPortion,
  hasData,
  onViewResults,
}: SidePanelProps) => {
  const byProductBase = toSortedEntries(summary.byProductBase)
  const byVariety = Object.entries(summary.byVariety)
  const showHoverCard = Boolean(hoveredText) && hoveredText !== selectedText
  const showSelectedCard = Boolean(selectedText)

  return (
    <aside className={`p-4 sm:p-6 lg:sticky lg:top-6 ${APP_THEME.surface.aside}`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${APP_THEME.text.title}`}>Resumen</h2>
        <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-semibold text-orange-700">
          {selectedPortion === 'porcion_liquida'
            ? 'Desayuno / Líquida'
            : 'Desayuno / Sólida'}
        </span>
      </div>
      <p className={`mt-2 text-sm ${APP_THEME.text.body}`}>Selección y resumen rápido de desayuno.</p>

      {!hasData ? (
        <div className={`mt-6 space-y-3 ${APP_THEME.block.info}`}>
          <p className={`text-xs font-semibold uppercase tracking-wide ${APP_THEME.text.muted}`}>Guía rápida</p>
          <ol className="space-y-2 text-sm text-slate-700">
            <li>1. Carga una minuta mensual.</li>
            <li>2. Selecciona una porción (líquida o sólida).</li>
            <li>3. Haz clic en una celda para ver frecuencia y días.</li>
          </ol>
          <p className={`text-xs ${APP_THEME.text.muted}`}>
            Cuando existan datos, aquí verás resumen por producto base, variedad y no reconocidos.
          </p>
        </div>
      ) : null}

      <div className={`mt-6 space-y-4 ${!hasData ? 'opacity-60' : ''}`}>
        {showSelectedCard ? (
          <div className={APP_THEME.block.info}>
            <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Seleccionado</p>
            <p className={`mt-2 text-sm font-semibold ${APP_THEME.text.title}`}>{selectedText}</p>
            <p className="mt-2 text-xs text-slate-600">Frecuencia: {selectedCount}</p>
            <p className="mt-1 text-xs text-slate-600">
              Días: {selectedDays.length > 0 ? selectedDays.join(', ') : '--'}
            </p>
          </div>
        ) : null}

        {showHoverCard ? (
          <div className={APP_THEME.block.info}>
            <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Hover</p>
            <p className={`mt-2 text-sm font-semibold ${APP_THEME.text.title}`}>{hoveredText}</p>
            <p className="mt-2 text-xs text-slate-600">Frecuencia: {hoveredCount}</p>
            <p className="mt-1 text-xs text-slate-600">
              Días: {hoveredDays.length > 0 ? hoveredDays.join(', ') : '--'}
            </p>
          </div>
        ) : null}

        {!showSelectedCard && !showHoverCard ? (
          <div className={APP_THEME.block.info}>
            <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Interacción</p>
            <p className={`mt-2 text-sm font-semibold ${APP_THEME.text.title}`}>Sin selección</p>
            <p className="mt-2 text-xs text-slate-600">
              Haz clic en una celda para ver frecuencia y días.
            </p>
          </div>
        ) : null}

        {summary.unrecognizedCount > 0 ? (
          <div className={APP_THEME.block.info}>
            <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>No reconocidos</p>
            <p className="mt-2 text-2xl font-semibold text-rose-600">
              {summary.unrecognizedCount}
            </p>
            {unrecognizedItems.length > 0 ? (
              <ul className="mt-3 space-y-1 text-xs text-slate-700">
                {unrecognizedItems.slice(0, 5).map((item) => (
                  <li key={item.text} className="flex items-center justify-between rounded-lg bg-rose-50 px-2 py-1">
                    <span>{item.text}</span>
                    <strong>{item.count}</strong>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        ) : null}

        <div className={APP_THEME.block.info}>
          <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Por producto base</p>
          {byProductBase.length > 0 ? (
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              {byProductBase.map(([key, value]) => (
                <li key={key} className={`flex items-center justify-between ${APP_THEME.block.subtleItem}`}>
                  <span>{key}</span>
                  <strong className="text-slate-900">{value}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-slate-500">--</p>
          )}
        </div>

        <div className={APP_THEME.block.info}>
          <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Por variedad</p>
          {byVariety.length > 0 ? (
            <div className="mt-3 space-y-3">
              {byVariety.map(([productBase, varieties]) => (
                <div key={productBase} className={APP_THEME.block.nested}>
                  <p className={`text-xs font-semibold uppercase tracking-wide ${APP_THEME.text.body}`}>
                    {productBase}
                  </p>
                  <ul className="mt-2 space-y-1 text-sm text-slate-700">
                    {Object.entries(varieties)
                      .sort((a, b) => b[1] - a[1])
                      .map(([variety, count]) => (
                        <li key={`${productBase}-${variety}`} className="flex items-center justify-between">
                          <span>{variety}</span>
                          <strong className="text-slate-900">{count}</strong>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-2 text-sm text-slate-500">--</p>
          )}
        </div>

        <button
          type="button"
          disabled={!hasData}
          onClick={onViewResults}
          className={`w-full px-3 py-3 ${APP_THEME.button.primary} ${APP_THEME.button.disabled}`}
        >
          Ver análisis completo {'->'}
        </button>
      </div>
    </aside>
  )
}

export default SidePanel
