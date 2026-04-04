import type { BreakfastValidation, Nivel } from '../../features/breakfast/index.ts'

type ResultsInsightsProps = {
  unrecognizedTotal: number
  selectedNivel: Nivel
  breakfastValidation: BreakfastValidation
}

const formatNivel = (nivel: Nivel) => {
  if (nivel === 'transicion') return 'Transición'
  if (nivel === 'basica') return 'Básica'
  return 'Media'
}

const ResultsInsights = ({
  unrecognizedTotal,
  selectedNivel,
  breakfastValidation,
}: ResultsInsightsProps) => {
  const nivelLabel = formatNivel(selectedNivel)
  const passedRules = breakfastValidation.all.filter(
    (item) => item.estado === 'cumple' || item.estado === 'advertencia',
  ).length
  const failedRules = breakfastValidation.all.filter((item) => item.estado === 'no_cumple').length
  const totalRules = breakfastValidation.all.length
  const isRejected = failedRules > 0
  const finalLabel = isRejected ? 'RECHAZADO' : 'ACEPTADO'
  const finalIcon = isRejected ? '❌' : '✅'
  const finalSummary = isRejected
    ? `${failedRules} de ${totalRules} reglas no cumplen`
    : `${totalRules} de ${totalRules} reglas cumplen`

  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <article
        className={`rounded-2xl border p-4 shadow-sm md:col-span-2 lg:col-span-4 ${
          isRejected ? 'border-rose-300 bg-rose-50' : 'border-emerald-300 bg-emerald-50'
        }`}
      >
        <p
          className={`text-xs font-semibold uppercase tracking-wide ${
            isRejected ? 'text-rose-700' : 'text-emerald-700'
          }`}
        >
          Resultado final
        </p>
        <p
          className={`mt-2 text-xl font-extrabold ${
            isRejected ? 'text-rose-700' : 'text-emerald-700'
          }`}
        >
          {finalIcon} {finalLabel} - {finalSummary}
        </p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Nivel</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{nivelLabel}</p>
        <p className="text-sm text-slate-600">Aplicado a reglas</p>
      </article>

      <article className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Cumple</p>
        <p className="mt-2 text-lg font-semibold text-emerald-800">{passedRules}</p>
        <p className="text-sm text-emerald-700">Reglas OK</p>
      </article>

      <article className="rounded-2xl border border-rose-200 bg-rose-50 p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">No cumple</p>
        <p className="mt-2 text-lg font-semibold text-rose-800">{failedRules}</p>
        <p className="text-sm text-rose-700">Requiere acción</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">No reconocidos (diccionario)</p>
        <p className="mt-2 text-lg font-semibold text-rose-600">{unrecognizedTotal}</p>
        <p className="text-sm text-slate-600">Total líquida + sólida sin mapeo automático</p>
      </article>

      <article className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4 shadow-sm md:col-span-2 lg:col-span-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Resultado general</p>
        <p className="mt-2 text-sm text-slate-600">
          {failedRules > 0
            ? `Hay ${failedRules} regla(s) no cumplida(s) sobre ${totalRules}.`
            : `Todas las reglas cumplen para el nivel ${nivelLabel}.`}
        </p>
      </article>
    </section>
  )
}

export default ResultsInsights
