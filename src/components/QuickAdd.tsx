import { useEffect, useMemo, useState } from 'react'
import type { PortionType, ProductGroup } from '../types/liquid-analysis.types.ts'
import { createProduct } from '../utils/liquidAnalysis.ts'
import { normalizeText } from '../utils/normalizeText.ts'

type QuickAddProps = {
  selectedPortion: PortionType
  onAdd: (next: any) => void
  onClose: () => void
  dictionary: any
}

const QuickAdd = ({ selectedPortion, onAdd, onClose, dictionary }: QuickAddProps) => {
  const [portion, setPortion] = useState<PortionType>(selectedPortion)
  const [group, setGroup] = useState<ProductGroup | string>(
    portion === 'porcion_liquida' ? 'liquida' : 'solida',
  )
  const [base, setBase] = useState('')
  const [variety, setVariety] = useState('')
  

  const productBaseOptions = useMemo(() => {
    const set = new Set<string>()
    const products = Array.isArray(dictionary?.products) ? dictionary.products : []
    products.forEach((p: any) => {
      if (!p || typeof p.producto_base !== 'string') return

      // map product to portion
      const portionOfProduct =
        p.porcion === 'porcion_liquida' || p.porcion === 'porcion_solida'
          ? p.porcion
          : p.grupo === 'liquida'
          ? 'porcion_liquida'
          : p.grupo === 'solida' || p.grupo === 'agregado_pan'
          ? 'porcion_solida'
          : null

      if (portionOfProduct !== portion) return

      // filter by selected group if provided
      if (group) {
        if (group === 'solida') {
          // include agregado_pan as part of solid options for UX
          if (!(p.grupo === 'solida' || p.grupo === 'agregado_pan')) return
        } else {
          if (p.grupo !== group) return
        }
      }

      set.add(p.producto_base)
    })
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
  }, [dictionary, portion, group])

  const debugProducts = Array.isArray(dictionary?.products) ? dictionary.products : []
  const debugSample = debugProducts.slice(0, 6).map((p: any) => p.producto_base).join(', ')

  useEffect(() => {
    if (!base && productBaseOptions.length > 0) setBase(productBaseOptions[0])
  }, [base, productBaseOptions])

  // Keep `group` in sync with local `portion` by default.
  useEffect(() => {
    const defaultGroup = portion === 'porcion_liquida' ? 'liquida' : 'solida'
    setGroup(defaultGroup)
    // reset selection when portion changes
    setBase('')
    setVariety('')
  }, [portion])

  // Reset base when group changes so the default base corresponds to the new group
  useEffect(() => {
    setBase('')
  }, [group])

  // If current group yields no options but the default group for the portion does,
  // switch to the default group and pick the first available base.
  useEffect(() => {
    if (productBaseOptions.length > 0) return

    const defaultGroup = portion === 'porcion_liquida' ? 'liquida' : 'solida'
    if (group === defaultGroup) return

    const products = Array.isArray(dictionary?.products) ? dictionary.products : []
    const set = new Set<string>()
    products.forEach((p: any) => {
      if (!p || typeof p.producto_base !== 'string') return

      const portionOfProduct =
        p.porcion === 'porcion_liquida' || p.porcion === 'porcion_solida'
          ? p.porcion
          : p.grupo === 'liquida'
          ? 'porcion_liquida'
          : p.grupo === 'solida' || p.grupo === 'agregado_pan'
          ? 'porcion_solida'
          : null

      if (portionOfProduct !== portion) return

      if (defaultGroup === 'solida') {
        if (!(p.grupo === 'solida' || p.grupo === 'agregado_pan')) return
      } else {
        if (p.grupo !== defaultGroup) return
      }

      set.add(p.producto_base)
    })

    const optionsForDefault = Array.from(set).sort((a, b) => a.localeCompare(b, 'es'))
    if (optionsForDefault.length > 0) {
      setGroup(defaultGroup)
      setBase(optionsForDefault[0])
    }
  }, [productBaseOptions, portion, dictionary, group])

  const previewItems = useMemo(() => {
    const producto_base = base.trim()
    const variedad = variety.trim()
    if (!producto_base || !variedad) return []

    const productsArr = Array.isArray(dictionary?.products) ? dictionary.products : []
    const exists = Boolean(
      productsArr.find(
        (p: any) =>
          normalizeText(p.producto_base) === normalizeText(producto_base) &&
          normalizeText(p.variedad) === normalizeText(variedad),
      ),
    )

    return [{ variedad, exists }]
  }, [base, variety, dictionary])

  const handleAdd = () => {
    const producto_base = base.trim()
    const variedad = variety.trim()
    if (!producto_base || !variedad) return

    onAdd((dictionary: any) => {
      let next = dictionary
      next = createProduct(next, {
        producto_base,
        variedad,
        tiempo: 'desayuno',
        grupo: group as any,
      })

      // do not add pattern automatically from QuickAdd

      return next
    })

    setBase('')
    setVariety('')
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-4">
        <h4 className="text-sm font-semibold">Agregar variedad rápida</h4>
        <p className="mt-1 text-xs text-slate-600">Porción: <strong className="ml-1">{portion === 'porcion_liquida' ? 'Líquida' : 'Sólida'}</strong></p>
        <p className="mt-1 text-xs text-slate-600">Selecciona un producto base y añade una variedad nueva.</p>
        <div className="mt-3 grid gap-2">
          <div className="text-xs text-slate-500">Debug: productos en diccionario: {debugProducts.length}{debugSample ? ` — muestras: ${debugSample}` : ''}</div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Porción</label>
            <select value={portion} onChange={(e) => setPortion(e.target.value as PortionType)} className="rounded border px-2 py-1 text-sm">
              <option value="porcion_liquida">Líquida</option>
              <option value="porcion_solida">Sólida</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <label className="text-xs text-slate-600">Grupo</label>
            <select value={group} onChange={(e) => setGroup(e.target.value)} className="rounded border px-2 py-1 text-sm">
              <option value="liquida">Liquida</option>
              <option value="solida">Solida</option>
              <option value="agregado_pan">Agregado pan</option>
            </select>
          </div>

          {productBaseOptions.length > 0 ? (
            <select value={base} onChange={(e) => setBase(e.target.value)} className="rounded border px-2 py-1 text-sm">
              {productBaseOptions.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          ) : (
            <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
              No hay productos disponibles para esta porción/grupo.
            </div>
          )}

          <input value={variety} onChange={(e) => setVariety(e.target.value)} placeholder="Variedad (ej. Trigo inflado)" className="rounded border px-2 py-1 text-sm" />
          {/* Quick add only creates a variety under the selected product base */}
        </div>

        {previewItems.length > 0 ? (
          <div className="mt-3 rounded border border-slate-200 bg-slate-50 p-3 text-sm">
            <p className="font-semibold">Previsualización</p>
            <ul className="mt-2 space-y-1">
              {previewItems.map((item) => (
                <li key={item.variedad} className="flex items-center justify-between">
                  <span>{base.trim()} — {item.variedad}</span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${item.exists ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700'}`}>
                    {item.exists ? 'Existe' : 'Nuevo'}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        <div className="mt-3 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded border px-3 py-1 text-sm">Cancelar</button>
          <button type="button" onClick={handleAdd} className="rounded bg-slate-900 px-3 py-1 text-sm font-semibold text-white">Agregar</button>
        </div>
      </div>
    </div>
  )
}

export default QuickAdd
