export const APP_THEME = {
  surface: {
    card: 'rounded-3xl border border-white/60 bg-white/85 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur',
    panel: 'rounded-2xl border border-slate-200 bg-white shadow-sm',
    section: 'rounded-3xl border border-white/60 bg-white/80 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.55)] backdrop-blur',
    aside:
      'rounded-3xl border border-white/70 bg-linear-to-b from-white/90 via-white/80 to-slate-50/90 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.5)] backdrop-blur',
    softPanel:
      'rounded-2xl border border-orange-100 bg-linear-to-br from-white via-orange-50/60 to-orange-100/70 shadow-[0_18px_45px_-40px_rgba(15,23,42,0.6)]',
  },
  text: {
    title: 'text-slate-900',
    body: 'text-slate-600',
    muted: 'text-slate-500',
    accent: 'text-orange-500',
  },
  button: {
    primary: 'motion-icon motion-lift rounded-xl bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800',
    ghost:
      'motion-icon motion-lift rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-100',
    chipActive: 'bg-slate-900 text-white',
    chipIdle: 'text-slate-700 hover:bg-slate-100',
    disabled: 'disabled:cursor-not-allowed disabled:bg-slate-400',
  },
  input: {
    text:
      'w-full rounded-xl border border-slate-300 px-3 py-2 text-sm text-slate-700 outline-none transition focus:border-orange-400 focus:ring-2 focus:ring-orange-100',
  },
  block: {
    info: 'rounded-2xl border border-slate-200 bg-white p-4',
    subtleItem: 'rounded-xl bg-slate-50 px-3 py-2',
    nested: 'rounded-xl border border-slate-200 bg-slate-50/60 p-3',
  },
  table: {
    emptyState: 'rounded-2xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500',
    container:
      'overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_50px_-45px_rgba(15,23,42,0.6)]',
    scroll: 'max-h-130 overflow-auto',
    base: 'min-w-full border-separate border-spacing-0 text-left',
    head: 'sticky top-0 z-10 bg-linear-to-r from-slate-50 via-white to-slate-50',
    groupHeader:
      'border-b border-slate-200 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.25em] sm:px-4',
    columnHeader:
      'whitespace-nowrap border-b border-slate-200 px-3 text-[11px] font-semibold uppercase tracking-[0.18em] sm:px-4',
    firstHeaderSticky: 'sticky left-0 z-20 shadow-[8px_0_12px_-12px_rgba(15,23,42,0.35)]',
    rowEven: 'bg-white',
    rowOdd: 'bg-slate-50/50',
    cell:
      'cursor-pointer border-b border-slate-100 px-3 text-slate-700 transition sm:px-4',
    firstCellSticky:
      'sticky left-0 z-10 bg-inherit font-semibold text-slate-700 shadow-[8px_0_12px_-12px_rgba(15,23,42,0.25)]',
    noResults: 'px-3 py-6 text-center text-sm text-slate-500',
    density: {
      compacto: {
        tableText: 'text-xs',
        headerY: 'py-1.5 sm:py-2',
        cellY: 'py-1.5 sm:py-2',
      },
      comodo: {
        tableText: 'text-sm',
        headerY: 'py-2 sm:py-3',
        cellY: 'py-2 sm:py-3',
      },
    },
  },
  badge: {
    neutral: 'rounded-full border border-slate-200 bg-white/80 px-3 py-1 shadow-sm',
    success: 'rounded-full bg-emerald-50 px-3 py-1 font-semibold text-emerald-700',
  },
} as const

export type AppTheme = typeof APP_THEME
