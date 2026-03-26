import { useState } from 'react'
import type {
  DictionaryProduct,
  UnrecognizedItem,
} from '../types/liquid-analysis.types.ts'

type UnrecognizedListProps = {
  items: UnrecognizedItem[]
  products: DictionaryProduct[]
  onAssign: (text: string, productId: string) => void
}

const UnrecognizedList = ({ items, products, onAssign }: UnrecognizedListProps) => {
  const [selectedByText, setSelectedByText] = useState<Record<string, string>>({})

  if (products.length === 0) {
    return (
      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        No hay productos en el diccionario para esta porcion. Crea uno en la vista de diccionario.
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
        No hay textos no reconocidos.
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">No reconocidos</h3>
      <div className="mt-3 space-y-3">
        {items.map((item) => {
          const selectedProductId = selectedByText[item.text] ?? products[0]?.id ?? ''

          return (
            <div key={item.text} className="rounded-xl border border-slate-200 p-3">
              <p className="text-sm font-medium text-slate-900">{item.text}</p>
              <p className="mt-1 text-xs text-slate-600">Apariciones: {item.count}</p>
              <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
                <select
                  className="w-full rounded-lg border border-slate-300 bg-white px-2 py-2 text-sm text-slate-700 sm:w-auto"
                  value={selectedProductId}
                  onChange={(event) =>
                    setSelectedByText((prev) => ({
                      ...prev,
                      [item.text]: event.target.value,
                    }))
                  }
                >
                  {products.map((product) => (
                    <option key={product.id} value={product.id}>
                      {product.producto_base} - {product.variedad}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                  onClick={() => {
                    if (!selectedProductId) return
                    onAssign(item.text, selectedProductId)
                  }}
                >
                  Asignar
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default UnrecognizedList
