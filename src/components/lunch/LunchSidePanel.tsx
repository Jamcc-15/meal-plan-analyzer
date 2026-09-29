import type {
  LunchGroupSummary,
  LunchUnrecognizedItem,
} from '../../features/lunch/types/analysis.types.ts'
import { APP_THEME } from '../../themes/appTheme.ts'

type LunchSidePanelProps = {
  lunchSummary: LunchGroupSummary[]
  lunchUnrecognized: LunchUnrecognizedItem[]
  selectedText: string | null
  selectedCount: number
  hoveredText: string | null
  hoveredCount: number
  hasData: boolean
  onViewResults: () => void
}

const LunchSidePanel = ({
  lunchSummary,
  lunchUnrecognized,
  selectedText,
  selectedCount,
  hoveredText,
  hoveredCount,
  hasData,
  onViewResults,
}: LunchSidePanelProps) => {
  const totalRows = lunchSummary.reduce((sum, item) => sum + item.total, 0)
  const totalRecognized = lunchSummary.reduce((sum, item) => sum + item.recognized, 0)
  const totalUnrecognized = lunchSummary.reduce((sum, item) => sum + item.unrecognized, 0)
  const recognitionRate = totalRows === 0 ? 0 : Math.round((totalRecognized / totalRows) * 100)

  return (
    <aside className={`p-4 sm:p-5 lg:sticky lg:top-6 ${APP_THEME.surface.aside}`}>
      <div className="flex items-center justify-between">
        <h2 className={`text-lg font-semibold ${APP_THEME.text.title}`}>Resumen</h2>
        <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
          Almuerzo
        </span>
      </div>

      <p className={`mt-2 text-sm ${APP_THEME.text.body}`}>
        Resumen descriptivo por secciones, sin validación de reglas.
      </p>

      <div className={`mt-6 space-y-4 ${!hasData ? 'opacity-60' : ''}`}>
        <div className={APP_THEME.block.info}>
          <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Cobertura general</p>
          <p className="mt-2 text-sm text-slate-700">Registros analizados: {totalRows}</p>
          <p className="mt-1 text-sm text-emerald-700">Reconocidos: {totalRecognized}</p>
          <p className="mt-1 text-sm text-rose-700">No reconocidos: {totalUnrecognized}</p>
          <p className="mt-1 text-xs text-slate-600">Reconocimiento: {recognitionRate}%</p>
        </div>

        {selectedText ? (
          <div className={APP_THEME.block.info}>
            <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Seleccionado</p>
            <p className={`mt-2 text-sm font-semibold ${APP_THEME.text.title}`}>{selectedText}</p>
            <p className="mt-1 text-xs text-slate-600">Frecuencia en bloque almuerzo: {selectedCount}</p>
          </div>
        ) : null}

        {hoveredText && hoveredText !== selectedText ? (
          <div className={APP_THEME.block.info}>
            <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Hover</p>
            <p className={`mt-2 text-sm font-semibold ${APP_THEME.text.title}`}>{hoveredText}</p>
            <p className="mt-1 text-xs text-slate-600">Frecuencia en bloque almuerzo: {hoveredCount}</p>
          </div>
        ) : null}

        <div className={APP_THEME.block.info}>
          <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>Por sección</p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {lunchSummary.map((item) => (
              <li key={item.group} className="flex items-center justify-between">
                <span>{item.label}</span>
                <strong>{item.recognized}/{item.total}</strong>
              </li>
            ))}
          </ul>
        </div>

        <div className={APP_THEME.block.info}>
          <p className={`text-xs uppercase tracking-wide ${APP_THEME.text.muted}`}>No reconocidos</p>
          {lunchUnrecognized.length > 0 ? (
            <ul className="mt-2 space-y-1 text-xs text-slate-700">
              {lunchUnrecognized.slice(0, 5).map((item) => (
                <li key={`${item.group}-${item.text}`} className="flex items-center justify-between">
                  <span>[{item.group}] {item.text}</span>
                  <strong>{item.count}</strong>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-xs text-emerald-700">Sin pendientes de clasificación.</p>
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

export default LunchSidePanel
