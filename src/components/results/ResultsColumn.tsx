type ResultsColumnProps = {
  title: string
  productTitle: string
  productData: Record<string, number>
  varietyTitle: string
  varietyData: Record<string, Record<string, number>>
  extraLiteralTitle?: string
  extraLiteralData?: Record<string, number>
  literalTitle: string
  literalData: Record<string, number>
}

const toSortedEntries = (input: Record<string, number>) =>
  Object.entries(input).sort((a, b) => b[1] - a[1])

const getMax = (items: Array<[string, number]>) =>
  items.reduce((max, [, value]) => Math.max(max, value), 1)

const ProductBars = ({ title, data }: { title: string; data: Record<string, number> }) => {
  const rows = toSortedEntries(data)
  const max = getMax(rows)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
      {rows.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {rows.map(([name, value]) => (
            <li key={name} className="rounded-xl bg-slate-50 p-2">
              <div className="flex items-center justify-between text-sm text-slate-800">
                <span>{name}</span>
                <strong>{value}</strong>
              </div>
              <div className="mt-2 h-2 rounded-full bg-slate-200">
                <div
                  className="h-2 rounded-full bg-slate-900"
                  style={{ width: `${Math.max((value / max) * 100, 6)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">--</p>
      )}
    </section>
  )
}

const VarietyBreakdown = ({
  title,
  data,
}: {
  title: string
  data: Record<string, Record<string, number>>
}) => {
  const productGroups = Object.entries(data)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
      {productGroups.length > 0 ? (
        <div className="mt-3 space-y-3">
          {productGroups
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([productBase, varieties]) => (
              <article
                key={productBase}
                className="rounded-xl border border-slate-200 bg-slate-50/70 p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-600">
                  {productBase}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  {Object.entries(varieties)
                    .sort((a, b) => b[1] - a[1])
                    .map(([variety, count]) => (
                      <li
                        key={`${productBase}-${variety}`}
                        className="flex items-center justify-between"
                      >
                        <span>{variety}</span>
                        <strong className="text-slate-900">{count}</strong>
                      </li>
                    ))}
                </ul>
              </article>
            ))}
        </div>
      ) : (
        <p className="mt-2 text-sm text-slate-500">--</p>
      )}
    </section>
  )
}

const LiteralTable = ({
  title,
  data,
}: {
  title: string
  data: Record<string, number>
}) => {
  const rows = toSortedEntries(data)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
      {rows.length > 0 ? (
        <ul className="mt-3 space-y-2 text-sm text-slate-700">
          {rows.map(([text, value]) => (
            <li key={text} className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2">
              <span>{text}</span>
              <strong className="text-slate-900">{value}</strong>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">--</p>
      )}
    </section>
  )
}

const ResultsColumn = ({
  title,
  productTitle,
  productData,
  varietyTitle,
  varietyData,
  extraLiteralTitle,
  extraLiteralData,
  literalTitle,
  literalData,
}: ResultsColumnProps) => {
  return (
    <section className="space-y-4 rounded-3xl border border-white/60 bg-white/85 p-4 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      <ProductBars title={productTitle} data={productData} />
      <VarietyBreakdown title={varietyTitle} data={varietyData} />
      {extraLiteralTitle && extraLiteralData ? (
        <LiteralTable title={extraLiteralTitle} data={extraLiteralData} />
      ) : null}
      <LiteralTable title={literalTitle} data={literalData} />
    </section>
  )
}

export default ResultsColumn
