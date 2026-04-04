import { useMemo, useState } from 'react'
import type { BreakfastValidation, ValidationResult } from '../../features/breakfast/index.ts'

type ValidationFilter = 'todo' | 'errores' | 'liquidos' | 'solidos'

type RulesValidationPanelProps = {
  breakfastValidation: BreakfastValidation
  onInspectProduct: (productBase: string) => void
}

type RuleWithSection = ValidationResult & {
  section: 'porcion_liquida' | 'porcion_solida' | 'adicionales'
}

const sectionLabel: Record<RuleWithSection['section'], string> = {
  porcion_liquida: 'Líquido',
  porcion_solida: 'Sólido',
  adicionales: 'Agregados',
}

const sectionBadge: Record<RuleWithSection['section'], string> = {
  porcion_liquida: 'bg-blue-100 text-blue-700',
  porcion_solida: 'bg-emerald-100 text-emerald-700',
  adicionales: 'bg-violet-100 text-violet-700',
}

const statusUi = (estado: ValidationResult['estado']) => {
  if (estado === 'cumple' || estado === 'advertencia') {
    return {
      icon: 'OK',
      badge: 'bg-emerald-100 text-emerald-700',
      text: 'Cumple',
    }
  }

  return {
    icon: 'NO',
    badge: 'bg-rose-100 text-rose-700',
    text: 'No cumple',
  }
}

const Filters = ({
  value,
  onChange,
}: {
  value: ValidationFilter
  onChange: (next: ValidationFilter) => void
}) => {
  const items: Array<{ value: ValidationFilter; label: string }> = [
    { value: 'todo', label: 'Todo' },
    { value: 'errores', label: 'Solo errores' },
    { value: 'liquidos', label: 'Solo líquidos' },
    { value: 'solidos', label: 'Solo sólidos' },
  ]

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.value}
          type="button"
          onClick={() => onChange(item.value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${
            value === item.value
              ? 'border-slate-900 bg-slate-900 text-white'
              : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

const RulesValidationPanel = ({ breakfastValidation, onInspectProduct }: RulesValidationPanelProps) => {
  const [filter, setFilter] = useState<ValidationFilter>('todo')

  const allRules = useMemo<RuleWithSection[]>(
    () => [
      ...breakfastValidation.porcion_liquida.map((item) => ({ ...item, section: 'porcion_liquida' as const })),
      ...breakfastValidation.porcion_solida.map((item) => ({ ...item, section: 'porcion_solida' as const })),
      ...breakfastValidation.adicionales.map((item) => ({ ...item, section: 'adicionales' as const })),
    ],
    [breakfastValidation],
  )

  const filteredRules = useMemo(() => {
    if (filter === 'errores') {
      return allRules.filter((item) => item.estado === 'no_cumple')
    }

    if (filter === 'liquidos') {
      return allRules.filter((item) => item.section === 'porcion_liquida')
    }

    if (filter === 'solidos') {
      return allRules.filter((item) => item.section === 'porcion_solida')
    }

    return allRules
  }, [allRules, filter])

  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Validación de reglas</h2>
        
        <Filters value={filter} onChange={setFilter} />
      </div>

      <div className="space-y-2">
        {filteredRules.length === 0 ? (
          <p className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            No hay reglas para este filtro.
          </p>
        ) : (
          filteredRules.map((item) => {
            const status = statusUi(item.estado)
            return (
              <article
                key={item.id}
                className="rounded-xl border border-slate-200 bg-slate-50 p-3"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${sectionBadge[item.section]}`}>
                    {sectionLabel[item.section]}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${status.badge}`}>
                    {status.icon} {status.text}
                  </span>
                  <span className="text-sm font-medium text-slate-900">{item.producto_base}</span>
                </div>

                <p className="mt-2 text-sm text-slate-700">
                  {item.tipo === 'frecuencia'
                    ? `${item.meta.limite === 'min' ? 'Mínimo' : 'Máximo'} ${item.meta.veces} -> obtenido ${item.obtenido}`
                    : `Variedades mínimas ${item.meta.minima} -> obtenido ${item.obtenido}`}
                </p>

                <div className="mt-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onInspectProduct(item.producto_base)}
                    className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                  >
                    Inspeccionar en tabla
                  </button>
                </div>
              </article>
            )
          })
        )}
      </div>
    </section>
  )
}

export default RulesValidationPanel
