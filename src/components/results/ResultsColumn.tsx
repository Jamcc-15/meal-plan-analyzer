import type {
  ProductDrilldownMap,
  ValidationResult,
} from '../../features/breakfast/index.ts'
import { findRuleByLabel } from '../../features/breakfast/utils/ruleMatching.ts'
import { SectionBreakdown } from './SectionBreakdown.tsx'
import RuleBar from './RuleBar.tsx'

type ResultsColumnProps = {
  title: string
  productTitle: string
  productData: Record<string, number>
  productRules: ValidationResult[]
  productDrilldown: ProductDrilldownMap
  accent: 'liquid' | 'solid'
  varietyTitle: string
  varietyData: Record<string, Record<string, number>>
  varietyRuleType?: ValidationResult['tipo']
  varietyStrictPreferredRuleType?: boolean
  detailVarietyTitle?: string
  detailVarietyData?: Record<string, Record<string, number>>
  detailVarietyRuleType?: ValidationResult['tipo']
  detailVarietyShowRowStatus?: boolean
  detailVarietyShowGroupStatus?: boolean
  detailVarietyShowGroupRuleSummary?: boolean
  extraLiteralTitle?: string
  extraLiteralData?: Record<string, number>
  literalTitle: string
  literalData: Record<string, number>
  onInspectProduct: (productBase: string) => void
}

const toSortedEntries = (input: Record<string, number>) =>
  Object.entries(input).sort((a, b) => b[1] - a[1])

const getMax = (items: Array<[string, number]>) =>
  items.reduce((max, [, value]) => Math.max(max, value), 1)

const getStatusMeta = (estado: ValidationResult['estado']) => {
  // Simplificar a 3 estados: cumple (✅), no_cumple (❌), advertencia → cumple
  if (estado === 'cumple' || estado === 'advertencia') {
    return {
      badge: 'bg-emerald-100 text-emerald-700',
      bar: 'bg-emerald-400',
      text: 'Cumple',
      icon: '✅',
    }
  }

  return {
    badge: 'bg-rose-100 text-rose-700',
    bar: 'bg-rose-400',
    text: 'No cumple',
    icon: '❌',
  }
}

const getSeverity = (rule?: ValidationResult) => {
  if (!rule) return 3
  if (rule.estado === 'no_cumple') return 0
  if (rule.estado === 'advertencia') return 1
  return 2
}

const getDetailedStatusText = (rule: ValidationResult) => {
  const baseLabel = rule.estado === 'no_cumple' ? 'No cumple' : 'Cumple'

  const criterionTypeLabel = rule.tipo === 'variedad' ? 'variedad' : 'frecuencia'
  return `${baseLabel} (${criterionTypeLabel})`
}

const getAccentTone = (accent: 'liquid' | 'solid') =>
  accent === 'liquid'
    ? {
        title: 'text-slate-700',
        marker: 'bg-slate-500',
      }
    : {
        title: 'text-slate-700',
        marker: 'bg-slate-500',
      }

const ProductBars = ({
  title,
  data,
  productRules,
  productDrilldown,
  onInspectProduct,
  accent,
}: {
  title: string
  data: Record<string, number>
  productRules: ValidationResult[]
  productDrilldown: ProductDrilldownMap
  onInspectProduct: (productBase: string) => void
  accent: 'liquid' | 'solid'
}) => {
  const rows = toSortedEntries(data)
  const max = getMax(rows)
  const accentTone = getAccentTone(accent)

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className={`text-sm font-semibold uppercase tracking-wide ${accentTone.title}`}>{title}</h3>
      {rows.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {rows.map(([name, value]) => {
            const productRule =
              findRuleByLabel(productRules, name, 'frecuencia', true) ??
              findRuleByLabel(productRules, name, 'frecuencia')
            const hasDetail = Boolean(productDrilldown[name]?.total)
            const threshold = productRule?.meta.veces
            const dynamicMax = Math.max(max, threshold ?? 0, value, 1)
            const min =
              productRule?.meta.limite === 'min' && typeof threshold === 'number'
                ? threshold
                : undefined
            const maxLimit =
              productRule?.meta.limite === 'max' && typeof threshold === 'number'
                ? threshold
                : undefined

            return (
              <RuleBar
                key={name}
                label={name}
                value={value}
                min={min}
                max={maxLimit}
                scaleMax={dynamicMax}
                hasDetail={hasDetail}
                onInspect={() => onInspectProduct(name)}
              />
            )
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">--</p>
      )}
    </section>
  )
}

const VarietyBreakdown = ({
  title,
  data,
  rules,
  preferredRuleType,
  strictPreferredRuleType,
  showRowStatus,
  showGroupStatus,
  showGroupRuleSummary,
}: {
  title: string
  data: Record<string, Record<string, number>>
  rules: ValidationResult[]
  preferredRuleType?: ValidationResult['tipo']
  strictPreferredRuleType?: boolean
  showRowStatus?: boolean
  showGroupStatus?: boolean
  showGroupRuleSummary?: boolean
}) => {
  // Usar el nuevo SectionBreakdown compacto
  return (
    <SectionBreakdown
      title={title}
      data={data}
      rules={rules}
      preferredRuleType={preferredRuleType}
      strictPreferredRuleType={strictPreferredRuleType}
      showRowStatus={showRowStatus}
      showGroupStatus={showGroupStatus}
      showGroupRuleSummary={showGroupRuleSummary}
    />
  )
}

const LiteralTable = ({
  title,
  data,
  rules,
  showRuleSummary = false,
  isKpiMode = false,
  subdued = false,
  collapsible = false,
}: {
  title: string
  data: Record<string, number>
  rules?: ValidationResult[]
  showRuleSummary?: boolean
  isKpiMode?: boolean
  subdued?: boolean
  collapsible?: boolean
}) => {
  const rows = toSortedEntries(data)
    .map(([text, value]) => {
      const frecuenciaRule =
        showRuleSummary && rules
          ? findRuleByLabel(rules, text, 'frecuencia', true)
          : undefined
      const variedadRule =
        showRuleSummary && rules
          ? findRuleByLabel(rules, text, 'variedad', true)
          : undefined

      return {
        text,
        value,
        frecuenciaRule,
        variedadRule,
        severity: Math.min(getSeverity(frecuenciaRule), getSeverity(variedadRule)),
      }
    })
    .sort((a, b) => a.severity - b.severity || b.value - a.value || a.text.localeCompare(b.text))

  const content = (
    <section
      className={`rounded-2xl border p-4 ${
        subdued ? 'border-slate-100 bg-slate-50/40' : 'border-slate-200 bg-white'
      }`}
    >
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
      {rows.length > 0 ? (
        <ul
          className={`mt-3 divide-y border-t text-sm ${
            subdued
              ? 'divide-slate-100 border-slate-100 text-slate-500'
              : 'divide-slate-200 border-slate-200 text-slate-700'
          }`}
        >
          {rows.map(({ text, value, frecuenciaRule, variedadRule }) => {
            const frecuenciaStatus = frecuenciaRule ? getStatusMeta(frecuenciaRule.estado) : null
            const variedadStatus = variedadRule ? getStatusMeta(variedadRule.estado) : null
            const isFail = frecuenciaRule?.estado === 'no_cumple' || variedadRule?.estado === 'no_cumple'

            const freqLabel = frecuenciaRule
              ? `Total: ${frecuenciaRule.obtenido} (${frecuenciaRule.meta.limite === 'min' ? 'mín' : 'máx'} ${frecuenciaRule.meta.veces ?? '--'})`
              : null

            const variedadLabel = variedadRule
              ? `Total: ${variedadRule.obtenido} (mín ${variedadRule.meta.minima ?? '--'})`
              : null

            return (
              <li
                key={text}
                className={`py-3 ${isKpiMode ? `rounded-xl border px-3 ${isFail ? 'border-rose-200 bg-rose-50/60' : 'border-emerald-100 bg-emerald-50/40'}` : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <span>{text}</span>
                  <div className="flex items-center gap-2">
                    <strong
                      className={
                        isFail
                          ? isKpiMode
                            ? 'text-xl font-extrabold leading-none text-rose-600'
                            : 'font-bold text-rose-600'
                          : subdued
                            ? 'font-semibold text-slate-600'
                            : 'font-semibold text-slate-900'
                      }
                    >
                      {value}
                    </strong>
                    {isKpiMode && frecuenciaRule ? (
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${frecuenciaStatus?.badge ?? 'bg-slate-100 text-slate-600'}`}>
                        {getDetailedStatusText(frecuenciaRule)}
                      </span>
                    ) : null}
                  </div>
                </div>

                {showRuleSummary && (frecuenciaRule || variedadRule) ? (
                  <div className="mt-1 space-y-1 text-xs text-slate-400">
                    {frecuenciaRule && frecuenciaStatus ? (
                      <div className="flex items-center justify-between gap-2">
                        <p>{freqLabel}</p>
                        {!isKpiMode ? (
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${frecuenciaStatus.badge}`}>
                            {getDetailedStatusText(frecuenciaRule)}
                          </span>
                        ) : null}
                      </div>
                    ) : null}
                    {variedadRule && variedadStatus ? (
                      <div className="flex items-center justify-between gap-2">
                        <p>{variedadLabel}</p>
                        <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${variedadStatus.badge}`}>
                          {getDetailedStatusText(variedadRule)}
                        </span>
                      </div>
                    ) : null}
                  </div>
                ) : null}

              </li>
            )
          })}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-slate-500">--</p>
      )}
    </section>
  )

  if (!collapsible) {
    return content
  }

  return (
    <details className="rounded-2xl border border-slate-200 bg-white p-2">
      <summary className="cursor-pointer select-none rounded-xl px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-50">
        Mostrar detalle literal
      </summary>
      <div className="mt-2">{content}</div>
    </details>
  )
}

const ResultsColumn = ({
  title,
  productTitle,
  productData,
  productRules,
  productDrilldown,
  accent,
  varietyTitle,
  varietyData,
  varietyRuleType,
  varietyStrictPreferredRuleType,
  detailVarietyTitle,
  detailVarietyData,
  detailVarietyRuleType,
  detailVarietyShowRowStatus,
  detailVarietyShowGroupStatus,
  detailVarietyShowGroupRuleSummary,
  extraLiteralTitle,
  extraLiteralData,
  literalTitle,
  literalData,
  onInspectProduct,
}: ResultsColumnProps) => {
  return (
    <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-4 sm:p-6">
      <h2 className="text-lg font-semibold text-slate-900">{title}</h2>

      <ProductBars
        title={productTitle}
        data={productData}
        productRules={productRules}
        productDrilldown={productDrilldown}
        onInspectProduct={onInspectProduct}
        accent={accent}
      />
      <VarietyBreakdown
        title={varietyTitle}
        data={varietyData}
        rules={productRules}
        preferredRuleType={varietyRuleType}
        strictPreferredRuleType={varietyStrictPreferredRuleType}
      />
      {extraLiteralTitle && extraLiteralData ? (
        <LiteralTable
          title={extraLiteralTitle}
          data={extraLiteralData}
          rules={productRules}
          showRuleSummary
          isKpiMode
        />
      ) : null}
      {detailVarietyTitle && detailVarietyData ? (
        <VarietyBreakdown
          title={detailVarietyTitle}
          data={detailVarietyData}
          rules={productRules}
          preferredRuleType={detailVarietyRuleType}
          showRowStatus={detailVarietyShowRowStatus}
          showGroupStatus={detailVarietyShowGroupStatus}
          showGroupRuleSummary={detailVarietyShowGroupRuleSummary}
        />
      ) : null}
      <LiteralTable title={literalTitle} data={literalData} subdued collapsible />
    </section>
  )
}

export default ResultsColumn
