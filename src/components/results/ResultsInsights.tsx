type ResultsInsightsProps = {
  topProduct: { name: string; value: number }
  topPanAddon: { name: string; value: number }
  unrecognizedTotal: number
}

const ResultsInsights = ({
  topProduct,
  topPanAddon,
  unrecognizedTotal,
}: ResultsInsightsProps) => {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top producto</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{topProduct.name}</p>
        <p className="text-sm text-slate-600">Frecuencia total: {topProduct.value}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Top agregado pan</p>
        <p className="mt-2 text-lg font-semibold text-slate-900">{topPanAddon.name}</p>
        <p className="text-sm text-slate-600">Frecuencia: {topPanAddon.value}</p>
      </article>

      <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">No reconocidos</p>
        <p className="mt-2 text-lg font-semibold text-rose-600">{unrecognizedTotal}</p>
        <p className="text-sm text-slate-600">Total entre liquida y solida</p>
      </article>
    </section>
  )
}

export default ResultsInsights
