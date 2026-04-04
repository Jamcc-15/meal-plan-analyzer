type PendingSectionProps = {
  title?: string
  products: Array<{
    name: string
    count: number
  }>
}

export const PendingSection = ({
  title = 'Pendientes de confirmación',
  products,
}: PendingSectionProps) => {
  if (products.length === 0) return null

  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50/40 p-4 shadow-sm">
      <div className="grid grid-cols-[1fr_auto] items-center gap-3">
        <h3 className="text-sm font-semibold text-slate-600">{title}</h3>
        <span className="text-sm font-semibold text-slate-400" title="Pendiente">
          ⚪
        </span>
      </div>
      <p className="mt-1 text-xs text-slate-500">Sin regla normativa confirmada</p>
      <ul className="mt-3 divide-y divide-slate-200 border-t border-slate-200">
        {products.map((product) => (
          <li
            key={product.name}
            className="grid grid-cols-[1fr_auto] items-center gap-3 py-2 text-sm"
          >
            <span className="text-slate-700">{product.name}</span>
            <strong className="font-semibold text-slate-900">{product.count}</strong>
          </li>
        ))}
      </ul>
    </section>
  )
}
