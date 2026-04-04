type RuleBarProps = {
  label: string
  value: number
  min?: number
  max?: number
  scaleMax?: number
  hasDetail?: boolean
  onInspect?: () => void
}

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(n, max))

const getStatus = (value: number, min?: number, max?: number) => {
  if (min == null && max == null) return 'neutral'
  if (min != null && value < min) return 'below'
  if (max != null && value > max) return 'above'
  return 'ok'
}

const getStatusText = (value: number, min?: number, max?: number) => {
  const status = getStatus(value, min, max)
  switch (status) {
    case 'ok':
      return 'Cumple'
    case 'below':
    case 'above':
      return 'No cumple'
    default:
      return 'Sin regla'
  }
}

const getStatusClasses = (value: number, min?: number, max?: number) => {
  const status = getStatus(value, min, max)

  switch (status) {
    case 'ok':
      return {
        badge: 'bg-emerald-50 text-emerald-700',
        bar: 'bg-emerald-400',
        marker: 'border-emerald-500 text-emerald-700',
      }
    case 'below':
    case 'above':
      return {
        badge: 'bg-rose-50 text-rose-700',
        bar: 'bg-rose-400',
        marker: 'border-rose-500 text-rose-700',
      }
    default:
      return {
        badge: 'bg-slate-100 text-slate-500',
        bar: 'bg-slate-300',
        marker: 'border-slate-300 text-slate-500',
      }
  }
}

const RuleBar = ({
  label,
  value,
  min,
  max,
  scaleMax,
  hasDetail = false,
  onInspect,
}: RuleBarProps) => {
  const computedScaleMax = Math.max(scaleMax ?? 0, value, min ?? 0, max ?? 0, 1)
  const statusText = getStatusText(value, min, max)
  const classes = getStatusClasses(value, min, max)
  const status = getStatus(value, min, max)

  const valuePercent = clamp((value / computedScaleMax) * 100, 0, 100)
  const safePercent = clamp(valuePercent, 2, 98)
  const minPercent = min != null ? clamp((min / computedScaleMax) * 100, 0, 100) : null
  const maxPercent = max != null ? clamp((max / computedScaleMax) * 100, 0, 100) : null
  const safeMinLabelPercent = minPercent != null ? clamp(minPercent, 6, 94) : null
  const safeMaxLabelPercent = maxPercent != null ? clamp(maxPercent, 6, 94) : null

  const trackHeightClass = status === 'neutral' ? 'h-2.5' : 'h-3'
  const markerSizeClass = status === 'neutral' ? 'h-2.5 w-2.5' : 'h-3 w-3'

  let validLeft = 0
  let validWidth = 100

  if (minPercent != null && maxPercent != null) {
    validLeft = minPercent
    validWidth = Math.max(maxPercent - minPercent, 0)
  } else if (minPercent != null) {
    validLeft = minPercent
    validWidth = 100 - minPercent
  } else if (maxPercent != null) {
    validLeft = 0
    validWidth = maxPercent
  }

  return (
    <li className="group rounded-xl bg-slate-50 px-3 py-2">
      <div className="flex items-center justify-between gap-2 text-sm text-slate-800">
        <button
          type="button"
          className={`text-left font-medium underline-offset-2 ${
            hasDetail ? 'text-slate-900 hover:underline' : 'cursor-default text-slate-500'
          }`}
          onClick={onInspect}
          disabled={!hasDetail}
        >
          {label}
        </button>

        <div className="flex items-center gap-2">
          <strong>{value}</strong>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${classes.badge}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="relative mt-2 pt-2">
        <div className={`relative ${trackHeightClass} rounded-full bg-slate-200 ${status === 'ok' ? 'rulebar-glow-ok' : ''}`}>
          {(min != null || max != null) && (
            <div
              className={`absolute top-0 ${trackHeightClass} rounded-full bg-emerald-100`}
              style={{ left: `${validLeft}%`, width: `${validWidth}%` }}
            />
          )}

          <div
            className={`absolute top-0 left-0 ${trackHeightClass} rounded-full rulebar-progress ${classes.bar}`}
            style={{ width: `${Math.max(valuePercent, 2)}%` }}
          />

          {minPercent != null && (
            <div className="absolute -top-0.5 h-4 w-0.5 rounded bg-slate-600" style={{ left: `${minPercent}%` }} />
          )}
          {maxPercent != null && (
            <>
              <div className="absolute -top-0.5 h-4 w-0.5 rounded bg-slate-700" style={{ left: `${maxPercent}%` }} />
              <div className="absolute -top-1 h-5 w-1 -translate-x-1/2 rounded-full bg-slate-700/65" style={{ left: `${maxPercent}%` }} />
            </>
          )}
        </div>

        <div className={`absolute top-0 -translate-x-1/2 ${status === 'below' || status === 'above' ? 'rulebar-shake-fail' : ''}`} style={{ left: `${safePercent}%` }}>
          <span className={`block ${markerSizeClass} rounded-full border-2 bg-white shadow-sm ${classes.marker}`} />
        </div>

        {(minPercent != null || maxPercent != null) ? (
          <div className="relative mt-1 h-4 text-[10px] text-slate-600">
            {safeMinLabelPercent != null ? (
              <span className="absolute -translate-x-1/2 font-semibold text-slate-700" style={{ left: `${safeMinLabelPercent}%` }}>
                Min. {min}
              </span>
            ) : null}
            {safeMaxLabelPercent != null ? (
              <span className="absolute -translate-x-1/2 font-semibold text-slate-700" style={{ left: `${safeMaxLabelPercent}%` }}>
                Máx. {max}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>

    </li>
  )
}

export default RuleBar
