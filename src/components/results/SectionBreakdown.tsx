import type { ValidationResult } from '../../features/breakfast/index.ts'
import {
  findMermeladaVariedadRule,
  findRuleByLabel,
  shouldForceFrecuenciaForAddon,
  shouldPreferVariedadForAddon,
} from '../../features/breakfast/utils/ruleMatching.ts'

type SectionBreakdownProps = {
  title: string
  data: Record<string, Record<string, number>>
  rules: ValidationResult[]
  preferredRuleType?: ValidationResult['tipo']
  strictPreferredRuleType?: boolean
  showRowStatus?: boolean
  showGroupStatus?: boolean
  showGroupRuleSummary?: boolean
}

export const SectionBreakdown = ({
  title,
  data,
  rules,
  preferredRuleType,
  strictPreferredRuleType = false,
  showRowStatus = false,
  showGroupStatus = true,
  showGroupRuleSummary = true,
}: SectionBreakdownProps) => {
  const productGroups = Object.entries(data)

  if (productGroups.length === 0) {
    return null
  }

  const getPriority = (rule: ValidationResult | undefined) => {
    if (!rule) return 3
    if (rule.estado === 'no_cumple') return 0
    if (rule.estado === 'advertencia') return 1
    return 2
  }

  const getState = (rule: ValidationResult | undefined) => {
    if (!rule) {
      return {
        label: 'Sin regla',
        badgeClass: 'bg-slate-100 text-slate-600',
      }
    }

    if (rule.estado === 'no_cumple') {
      return {
        label: 'No cumple',
        badgeClass: 'bg-rose-100 text-rose-700',
      }
    }

    return {
      label: 'Cumple',
      badgeClass: 'bg-emerald-100 text-emerald-700',
    }
  }

  const getRuleSummary = (
    rule: ValidationResult | undefined,
    productTotal: number,
    distinctVarieties: number,
  ) => {
    if (!rule) {
      if (preferredRuleType === 'variedad') {
        return `${distinctVarieties} detectada(s)`
      }

      return `Total: ${productTotal}`
    }

    if (rule.tipo === 'variedad') {
      return `${distinctVarieties} / mínimo ${rule.meta.minima ?? '--'}`
    }

    const limitLabel = rule.meta.limite === 'min' ? 'mínimo' : 'máximo'
    return `Total: ${productTotal} (${limitLabel} ${rule.meta.veces ?? '--'})`
  }

  const getRowSummary = (rule: ValidationResult | undefined, localCount: number) => {
    if (!rule) {
      return `${localCount} local · sin regla global`
    }

    if (rule.tipo === 'variedad') {
      return `${localCount} local · ${rule.obtenido} total · mínimo ${rule.meta.minima ?? '--'}`
    }

    return `${localCount} local · ${rule.obtenido} total · ${rule.meta.limite === 'min' ? 'mínimo' : 'máximo'} ${rule.meta.veces ?? '--'}`
  }

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4">
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">{title}</h3>
      <div className="mt-2 divide-y divide-slate-200">
        {productGroups
          .sort((a, b) => a[0].localeCompare(b[0]))
          .map(([productBase, varieties]) => {
            const baseRule = findRuleByLabel(
              rules,
              productBase,
              preferredRuleType,
              strictPreferredRuleType,
            )
            const varietyEntries = Object.entries(varieties).sort((a, b) => b[1] - a[1])
            const productTotal = varietyEntries.reduce((sum, [, count]) => sum + count, 0)
            const distinctVarieties = varietyEntries.filter(([, count]) => count > 0).length
            const state = getState(baseRule)
            const ruleSummary = getRuleSummary(baseRule, productTotal, distinctVarieties)
            const isPanGroup = productBase === 'Pan blanco' || productBase === 'Pan integral'

            return (
              <article
                key={productBase}
                className={`${isPanGroup ? 'my-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5' : 'py-3'}`}
              >
                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <h4 className="text-xs font-semibold uppercase tracking-wide text-slate-800">
                    {productBase}
                  </h4>
                  {showGroupStatus ? (
                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${state.badgeClass}`} title={state.label}>
                      {state.label}
                    </span>
                  ) : null}
                </div>
                {showGroupRuleSummary ? (
                  <p className="mt-1 text-xs text-slate-500">{ruleSummary}</p>
                ) : null}

                <ul className="mt-3 divide-y divide-slate-200 border-t border-slate-200">
                  {!showRowStatus
                    ? varietyEntries.map(([variety, count]) => (
                        <li
                          key={`${productBase}-${variety}`}
                          className="grid grid-cols-[1fr_auto] items-center gap-2 py-2 text-sm text-slate-700"
                        >
                          <span>{variety}</span>
                          <strong className="font-semibold text-slate-900">{count}</strong>
                        </li>
                      ))
                    : varietyEntries
                        .map(([variety, count]) => {
                          const mermeladaVariedadRule = shouldPreferVariedadForAddon(variety)
                            ? findMermeladaVariedadRule(rules)
                            : undefined

                          const rowPreferredType = shouldForceFrecuenciaForAddon(variety)
                            ? 'frecuencia'
                            : shouldPreferVariedadForAddon(variety)
                              ? 'variedad'
                              : preferredRuleType

                          const rowRule =
                            mermeladaVariedadRule ??
                            findRuleByLabel(rules, variety, rowPreferredType) ??
                            findRuleByLabel(rules, variety)

                          const rowState = rowRule ? getState(rowRule) : null
                          const rowPriority = getPriority(rowRule)
                          const isFail = rowRule?.estado === 'no_cumple'

                          return {
                            key: `${productBase}-${variety}`,
                            priority: rowPriority,
                            node: (
                              <li
                                key={`${productBase}-${variety}`}
                                className="py-2 text-sm text-slate-700"
                                title={rowRule ? `${rowRule.obtenido} / ${rowRule.esperado}` : 'Sin regla normativa'}
                              >
                                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-2">
                                  <span>{variety}</span>
                                  <strong className={isFail ? 'font-bold text-rose-600' : 'font-semibold text-slate-900'}>{count}</strong>
                                  {rowState ? (
                                    <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${rowState.badgeClass}`} title={rowState.label}>
                                      {rowState.label}
                                    </span>
                                  ) : null}
                                </div>
                                <p className="mt-0.5 text-[11px] text-slate-400">{getRowSummary(rowRule, count)}</p>
                              </li>
                            ),
                          }
                        })
                        .sort((a, b) => a.priority - b.priority || a.key.localeCompare(b.key))
                        .map((item) => item.node)}
                </ul>
              </article>
            )
          })}
      </div>
    </section>
  )
}
