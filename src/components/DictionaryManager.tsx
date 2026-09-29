import { useMemo, useState } from 'react'
import type {
  DictionaryProduct,
  LiquidDictionary,
  PortionType,
  ProductGroup,
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

const portionToDefaultGroup = (portion: PortionType): ProductGroup =>
  portion === 'porcion_liquida' ? 'liquida' : 'solida'

const productBelongsToPortion = (product: DictionaryProduct, portion: PortionType) => {
  if (portion === 'porcion_liquida') {
    return product.grupo === 'liquida' || product.porcion === 'porcion_liquida'
  }

  return (
    product.grupo === 'solida' ||
    product.grupo === 'agregado_pan' ||
    product.porcion === 'porcion_solida'
  )
}

const DictionaryManager = ({ dictionary, selectedPortion, onChange }: DictionaryManagerProps) => {
  const [newBase, setNewBase] = useState('')
  const [newVariety, setNewVariety] = useState('')
  const [newGroup, setNewGroup] = useState<ProductGroup>(portionToDefaultGroup(selectedPortion))
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
      grupo: newGroup,
    })

    onChange(next)
    setNewBase('')
    setNewVariety('')
    setNewGroup(portionToDefaultGroup(selectedPortion))
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
        Cada producto esta ligado a una variedad y a un grupo especifico.
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
          value={newGroup}
          onChange={(event) => setNewGroup(event.target.value as ProductGroup)}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="liquida">Liquida</option>
          <option value="solida">Solida</option>
          <option value="agregado_pan">Agregado pan</option>
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
          .filter((product) => productBelongsToPortion(product, selectedPortion))
          .map((product: DictionaryProduct) => {
          const productPatterns = groupedPatterns[product.id] ?? []

          return (
            <article key={product.id} className="rounded-xl border border-slate-200 p-3">
              <div className="grid gap-2 sm:grid-cols-[1fr_1fr_170px_auto]">
                <input
                  value={product.producto_base}
                  readOnly
                  title="Producto base (no modificable)"
                  className="rounded-lg border border-slate-300 bg-slate-50 px-2 py-1 text-sm text-slate-700"
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
                  value={product.grupo ?? (product.porcion === 'porcion_liquida' ? 'liquida' : 'solida')}
                  onChange={(event) =>
                    onChange(
                      updateProduct(dictionary, product.id, {
                        grupo: event.target.value as ProductGroup,
                      }),
                    )
                  }
                  className="rounded-lg border border-slate-300 px-2 py-1 text-sm"
                >
                  <option value="liquida">Liquida</option>
                  <option value="solida">Solida</option>
                  <option value="agregado_pan">Agregado pan</option>
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
