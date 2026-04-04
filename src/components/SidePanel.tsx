import type {
  PortionType,
  LiquidSummary,
  UnrecognizedItem,
} from '../types/liquid-analysis.types.ts'
import type { ValidationResult } from '../features/breakfast/index.ts'
import { APP_THEME } from '../themes/appTheme.ts'
import { normalizeText } from '../utils/normalizeText.ts'

type SidePanelProps = {
  summary: LiquidSummary
  selectedText: string | null
  selectedCount: number
  selectedDays: string[]
  hoveredText: string | null
  hoveredCount: number
  hoveredDays: string[]
  selectedProductBase?: string | null
  failingRules?: ValidationResult[]
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
  selectedProductBase = null,
  failingRules = [],
  unrecognizedItems,
  selectedPortion,
  hasData,
  onViewResults,
}: SidePanelProps) => {
  const byProductBase = toSortedEntries(summary.byProductBase)
  const byVariety = Object.entries(summary.byVariety)
  const showHoverCard = Boolean(hoveredText) && hoveredText !== selectedText
  const showSelectedCard = Boolean(selectedText)
  const visibleFailingRules = failingRules.slice(0, 5)
  const extraFailingRules = failingRules.slice(5)
  const selectedIssue =
    selectedProductBase
      ? failingRules.find(
          (rule) => normalizeText(rule.producto_base) === normalizeText(selectedProductBase),
        )
      : undefined

  const formatRuleThreshold = (rule: ValidationResult) => {
    if (rule.tipo === 'variedad') {
      return `${rule.obtenido} / mínimo ${rule.meta.minima ?? '--'}`
    }

    return `${rule.obtenido} / ${rule.meta.limite === 'min' ? 'mín' : 'máx'} ${rule.meta.veces ?? '--'}`
  }

  return (
    <aside className={`p-4 sm:p-5 lg:sticky lg:top-6 ${APP_THEME.surface.aside}`}>
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
        {failingRules.length > 0 ? (
          <div className={APP_THEME.block.info}>
            <div className="flex items-center justify-between gap-2">
              <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Incumplimientos</p>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                {failingRules.length}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
              {visibleFailingRules.map((rule) => (
                <li
                  key={rule.id}
                  className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-2 py-1"
                >
                  <span>{rule.producto_base}</span>
                  <strong className="text-rose-700">{formatRuleThreshold(rule)}</strong>
                </li>
              ))}
            </ul>
            {extraFailingRules.length > 0 ? (
              <details className="mt-2">
                <summary className="cursor-pointer select-none text-xs font-semibold text-slate-500 hover:text-slate-700">
                  Ver {extraFailingRules.length} más
                </summary>
                <ul className="mt-2 space-y-1.5 text-xs text-slate-700">
                  {extraFailingRules.map((rule) => (
                    <li
                      key={rule.id}
                      className="flex items-center justify-between rounded-lg border border-rose-200 bg-rose-50 px-2 py-1"
                    >
                      <span>{rule.producto_base}</span>
                      <strong className="text-rose-700">{formatRuleThreshold(rule)}</strong>
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}

        {showSelectedCard ? (
          <div className={APP_THEME.block.info}>
            <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Seleccionado</p>
            <p className={`mt-2 text-sm font-semibold ${APP_THEME.text.title}`}>
              {selectedText}
              {selectedProductBase ? (
                <span className="ml-1 text-xs font-medium text-slate-500">({selectedProductBase})</span>
              ) : null}
            </p>
            <p className="mt-2 text-xs text-slate-600">Frecuencia: {selectedCount} local</p>
            <p className={`mt-1 text-xs font-semibold ${selectedIssue ? 'text-rose-700' : 'text-emerald-700'}`}>
              Estado: {selectedIssue ? `No cumple (${formatRuleThreshold(selectedIssue)})` : 'Sin incumplimiento detectado'}
            </p>
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
            <p className={`mt-2 text-sm font-semibold ${APP_THEME.text.title}`}>
              Selecciona una celda para ver análisis
            </p>
            <p className="mt-2 text-xs text-slate-600">
              Aquí verás frecuencia local, estado de regla y días asociados.
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
