import type { Nivel } from '../features/breakfast/index.ts'

type AnalysisRulesSelectorProps = {
  selectedNivel: Nivel
  onChangeNivel: (nivel: Nivel) => void
  detectedNivel?: Nivel | null
}

const AnalysisRulesSelector = ({
  selectedNivel,
  onChangeNivel,
  detectedNivel = null,
}: AnalysisRulesSelectorProps) => {
  const detectedNivelLabel =
    detectedNivel === 'transicion' ? 'Transición' : detectedNivel === 'basica' ? 'Básica' : 'Media'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
      <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
        Reglas de detección
      </p>
      {detectedNivel ? (
        <p className="mt-1 inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
          Nivel detectado automáticamente: {detectedNivelLabel}
        </p>
      ) : null}
      <p className="mt-1 text-xs text-slate-600 sm:text-sm">
        {detectedNivel
          ? 'Puedes mantener la detección automática o elegir otro nivel.'
          : 'Elige el nivel que se usará para analizar esta minuta.'}
      </p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {([
          ['transicion', 'Transición'],
          ['basica', 'Básica'],
          ['media', 'Media'],
        ] as const).map(([nivelValue, nivelLabel]) => (
          <button
            key={nivelValue}
            type="button"
            className={`motion-lift rounded-xl border px-3 py-2 text-sm font-semibold ${
              selectedNivel === nivelValue
                ? 'border-orange-300 bg-orange-50 text-orange-700'
                : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            onClick={() => onChangeNivel(nivelValue)}
          >
            {nivelLabel}
          </button>
        ))}
      </div>
    </section>
  )
}

export default AnalysisRulesSelector
