import type { LunchCoverageItem } from '../../types/app.types.ts'

type LunchCoveragePanelProps = {
  title: string
  description: string
  items: LunchCoverageItem[]
  showAction?: boolean
}

const LunchCoveragePanel = ({
  title,
  description,
  items,
  showAction = false,
}: LunchCoveragePanelProps) => {
  return (
    <section className="rounded-3xl border border-white/70 bg-linear-to-b from-white/90 via-white/80 to-slate-50/90 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm text-slate-600">{description}</p>

      <div className="mt-4 space-y-3">
        {items.map((item) => (
          <div key={item.key} className="rounded-xl border border-slate-200 bg-white p-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-900">{item.label}</p>
              <span
                className={`rounded-full px-2 py-1 text-[11px] font-semibold ${
                  item.header
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {item.header ? 'Detectada' : 'Pendiente'}
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {item.header ? `Columna: ${item.header}` : 'No se encontro columna equivalente'}
            </p>
            <p className="mt-1 text-xs text-slate-600">
              Registros con datos: <strong className="text-slate-800">{item.completedRows}</strong>
            </p>
          </div>
        ))}
      </div>

      {showAction ? (
        <button
          type="button"
          disabled
          className="mt-4 w-full rounded-xl bg-slate-400 px-3 py-3 text-sm font-semibold text-white"
        >
          Analisis de almuerzo (proximamente)
        </button>
      ) : null}
    </section>
  )
}

export default LunchCoveragePanel
