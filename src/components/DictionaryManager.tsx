import { useMemo, useState } from 'react'
import type {
  DictionaryProduct,
  LiquidDictionary,
  PortionType,
} from '../types/liquid-analysis.types.ts'
import {
  addPattern,
  createProduct,
  deletePattern,
  deleteProduct,
  patternsByProduct,
  updatePattern,
  updateProduct,
} from '../utils/liquidAnalysis.ts'

type DictionaryManagerProps = {
  dictionary: LiquidDictionary
  selectedPortion: PortionType
  onChange: (next: LiquidDictionary) => void
}

const DictionaryManager = ({ dictionary, selectedPortion, onChange }: DictionaryManagerProps) => {
  const [newBase, setNewBase] = useState('')
  const [newVariety, setNewVariety] = useState('')
  const [newPortion, setNewPortion] = useState<PortionType>(selectedPortion)
  const [newPatternByProduct, setNewPatternByProduct] = useState<Record<string, string>>({})

  const groupedPatterns = useMemo(
    () => patternsByProduct(dictionary.patterns),
    [dictionary.patterns],
  )

  const handleAddProduct = () => {
    const base = newBase.trim()
    const variety = newVariety.trim()
    if (!base || !variety) return

    const next = createProduct(dictionary, {
      producto_base: base,
      variedad: variety,
      tiempo: 'desayuno',
      porcion: newPortion,
    })

    onChange(next)
    setNewBase('')
    setNewVariety('')
    setNewPortion(selectedPortion)
  }

  const handleAddPattern = (productId: string) => {
    const value = (newPatternByProduct[productId] ?? '').trim()
    if (!value) return

    onChange(addPattern(dictionary, productId, value))
    setNewPatternByProduct((prev) => ({ ...prev, [productId]: '' }))
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold text-slate-900">Diccionario editable</h3>
      <p className="mt-1 text-xs text-slate-600">
        Cada producto esta ligado a una variedad y a una porcion especifica.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_1fr_180px_auto]">
        <input
          value={newBase}
          onChange={(event) => setNewBase(event.target.value)}
          placeholder="Producto base"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <input
          value={newVariety}
          onChange={(event) => setNewVariety(event.target.value)}
          placeholder="Variedad"
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={newPortion}
          onChange={(event) => setNewPortion(event.target.value as PortionType)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="porcion_liquida">Porcion liquida</option>
          <option value="porcion_solida">Porcion solida</option>
        </select>
        <button
          type="button"
          onClick={handleAddProduct}
          className="rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
        >
          Crear producto
        </button>
      </div>

      <div className="mt-4 space-y-3">
        {dictionary.products
          .filter((product) => product.porcion === selectedPortion)
          .map((product: DictionaryProduct) => {
          const productPatterns = groupedPatterns[product.id] ?? []

          return (
            <article key={product.id} className="rounded-xl border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_170px_auto]">
                <input
                  value={product.producto_base}
                  onChange={(event) =>
                    onChange(
                      updateProduct(dictionary, product.id, {
                        producto_base: event.target.value,
                      }),
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
                <input
                  value={product.variedad}
                  onChange={(event) =>
                    onChange(
                      updateProduct(dictionary, product.id, {
                        variedad: event.target.value,
                      }),
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
                <select
                  value={product.porcion}
                  onChange={(event) =>
                    onChange(
                      updateProduct(dictionary, product.id, {
                        porcion: event.target.value as PortionType,
                      }),
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="porcion_liquida">Porcion liquida</option>
                  <option value="porcion_solida">Porcion solida</option>
                </select>
                <button
                  type="button"
                  onClick={() => onChange(deleteProduct(dictionary, product.id))}
                  className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                >
                  Eliminar
                </button>
              </div>

              <div className="mt-3 space-y-2">
                {productPatterns.map((item) => (
                  <div key={`${product.id}-${item.index}`} className="flex items-center gap-2">
                    <input
                      value={item.pattern}
                      onChange={(event) =>
                        onChange(updatePattern(dictionary, item.index, event.target.value))
                      }
                      className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => onChange(deletePattern(dictionary, item.index))}
                      className="rounded-lg border border-rose-300 px-2 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-50"
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <input
                  value={newPatternByProduct[product.id] ?? ''}
                  onChange={(event) =>
                    setNewPatternByProduct((prev) => ({
                      ...prev,
                      [product.id]: event.target.value,
                    }))
                  }
                  placeholder="+ agregar patron"
                  className="flex-1 rounded-lg border border-slate-300 px-2 py-1 text-sm"
                />
                <button
                  type="button"
                  onClick={() => handleAddPattern(product.id)}
                  className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Agregar
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default DictionaryManager
