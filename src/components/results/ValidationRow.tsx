import type { ValidationResult } from '../../features/breakfast/index.ts'

type ValidationRowProps = {
  name: string
  value: number
  rule?: ValidationResult
  compact?: boolean
}

// Solo 3 estados: cumple, no_cumple, pendiente
// Advertencia siempre se convierte a cumple
const STATE_ICONS = {
  cumple: '✅',
  no_cumple: '❌',
  pendiente: '⚪',
}

const STATE_COLORS = {
  cumple: 'text-emerald-600',
  no_cumple: 'text-rose-600',
  pendiente: 'text-slate-400',
}

const STATE_LABELS = {
  cumple: 'Cumple',
  no_cumple: 'No cumple',
  pendiente: 'Pendiente',
}

const formatExpected = (rule: ValidationResult | undefined) => {
  if (!rule) return '--'

  if (rule.tipo === 'frecuencia') {
    const limit = rule.meta.limite === 'min' ? 'mín' : 'máx'
    return `${limit} ${rule.meta.veces}`
  }

  if (typeof rule.meta.minima === 'number') {
    return `mín. var. ${rule.meta.minima}`
  }

  return '--'
}

const getState = (rule: ValidationResult | undefined): 'cumple' | 'no_cumple' | 'pendiente' => {
  if (!rule) return 'pendiente'
  // Advertencia y cumple se muestran iguales
  if (rule.estado === 'cumple' || rule.estado === 'advertencia') return 'cumple'
  if (rule.estado === 'no_cumple') return 'no_cumple'
  return 'pendiente'
}

export const ValidationRow = ({ name, value, rule, compact = false }: ValidationRowProps) => {
  const state = getState(rule)
  const expected = formatExpected(rule)
  const icon = STATE_ICONS[state]
  const colorClass = STATE_COLORS[state]

  if (compact) {
    return (
      <div className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm">
        <span className="flex-1 text-slate-900">{name}</span>
        <span className="text-slate-600">{value}</span>
        {rule && <span className="text-xs text-slate-500">{expected}</span>}
        <span className={`text-lg ${colorClass}`} title={STATE_LABELS[state]}>
          {icon}
        </span>
      </div>
    )
  }

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg bg-slate-50/50 px-3 py-2 text-sm">
      <span className="flex-1 text-slate-900">{name}</span>
      <div className="flex items-center gap-2">
        <span className="text-right text-slate-600">
          {value}
          {rule && <span className="ml-1 text-xs text-slate-500">/ {expected}</span>}
        </span>
        <span className={`text-base ${colorClass}`} title={STATE_LABELS[state]}>
          {icon}
        </span>
      </div>
    </li>
  )
}
