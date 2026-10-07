import { validateRules } from '../../rules/validation.ts'
import type { Nivel, SummaryData } from '../../rules/types.ts'
import type { LunchGroupKey, LunchGroupSummary } from '../types/analysis.types.ts'
import type {
  LunchSummaryByGroup,
  LunchValidation,
} from '../types/rules.types.ts'
import { loadAllLunchRules } from './index.ts'

const GROUPS: LunchGroupKey[] = [
  'entrada',
  'principal',
  'acompanamiento',
  'postre',
  'bebida',
]

const emptySummary = (): SummaryData => ({ productoBase: {}, variedades: {} })

export const buildLunchRuleSummaries = (
  summaries: LunchGroupSummary[],
): LunchSummaryByGroup => {
  const result = Object.fromEntries(
    GROUPS.map((group) => [group, emptySummary()]),
  ) as LunchSummaryByGroup

  summaries.forEach((summary) => {
    result[summary.group] = {
      productoBase: Object.fromEntries(
        summary.byProductBase.map((item) => [item.name, item.count]),
      ),
      variedades: Object.fromEntries(
        summary.byVariety.map((item) => [
          item.productBase,
          Object.fromEntries(item.items.map((variety) => [variety.name, variety.count])),
        ]),
      ),
    }
  })

  return result
}

export const validateLunch = (
  nivel: Nivel,
  summaries: LunchGroupSummary[],
): LunchValidation => {
  const rules = loadAllLunchRules()
  const summaryByGroup = buildLunchRuleSummaries(summaries)
  const grupos = Object.fromEntries(
    GROUPS.map((grupo) => {
      const groupRules = rules[grupo]
      return [
        grupo,
        {
          grupo,
          nivel,
          resultados: validateRules(groupRules, nivel, summaryByGroup[grupo]),
          pendientes: groupRules.pendientes,
        },
      ]
    }),
  ) as LunchValidation['grupos']

  return {
    nivel,
    grupos,
    all: GROUPS.flatMap((group) => grupos[group].resultados),
    pendientes: GROUPS.flatMap((group) =>
      grupos[group].pendientes.map((item) => `${group}: ${item}`),
    ),
  }
}
