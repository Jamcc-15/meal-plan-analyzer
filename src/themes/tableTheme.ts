import { normalizeText } from '../utils/normalizeText.ts'

export type TableColumnSection = 'dia' | 'desayuno' | 'almuerzo' | 'otro'

export const TABLE_THEME = {
  group: {
    desayuno: 'bg-orange-100/80 text-orange-900',
    almuerzo: 'bg-sky-100/80 text-sky-900',
    default: 'bg-slate-100/80 text-slate-600',
  },
  header: {
    dia: 'bg-slate-100 text-slate-700',
    desayuno: 'bg-orange-50 text-orange-800',
    almuerzo: 'bg-sky-50 text-sky-800',
    default: 'bg-slate-50 text-slate-500',
  },
  cell: {
    dia: 'bg-slate-50/80',
    desayuno: 'bg-orange-50/35',
    almuerzo: 'bg-sky-50/35',
    default: '',
    hover: 'hover:bg-orange-50/70',
    selected: 'bg-emerald-200/80 text-emerald-950',
    sameBase: 'bg-sky-100/70',
  },
  divider: {
    lunchHeader: 'border-l-2 border-l-sky-200',
    lunchCell: 'border-l-2 border-l-sky-100',
  },
} as const

export const getColumnSection = (header: string): TableColumnSection => {
  const normalized = normalizeText(header)

  if (normalized === 'dia') return 'dia'
  if (normalized.includes('porcion liquida') || normalized.includes('porcion solida')) {
    return 'desayuno'
  }
  if (
    normalized.includes('entrada') ||
    normalized.includes('principal') ||
    normalized.includes('acompanamiento') ||
    normalized.includes('postre') ||
    normalized.includes('agua')
  ) {
    return 'almuerzo'
  }

  return 'otro'
}

export const getGroupTheme = (label: string) => {
  const normalized = normalizeText(label)
  if (normalized.includes('desayuno')) return TABLE_THEME.group.desayuno
  if (normalized.includes('almuerzo')) return TABLE_THEME.group.almuerzo
  return TABLE_THEME.group.default
}

export const getHeaderTheme = (header: string) => {
  const section = getColumnSection(header)
  if (section === 'dia') return TABLE_THEME.header.dia
  if (section === 'desayuno') return TABLE_THEME.header.desayuno
  if (section === 'almuerzo') return TABLE_THEME.header.almuerzo
  return TABLE_THEME.header.default
}

export const getCellTheme = (header: string) => {
  const section = getColumnSection(header)
  if (section === 'dia') return TABLE_THEME.cell.dia
  if (section === 'desayuno') return TABLE_THEME.cell.desayuno
  if (section === 'almuerzo') return TABLE_THEME.cell.almuerzo
  return TABLE_THEME.cell.default
}

export const isLunchStart = (header: string) =>
  normalizeText(header).includes('entrada')
