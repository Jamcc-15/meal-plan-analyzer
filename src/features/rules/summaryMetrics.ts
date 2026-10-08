import { normalizeText } from '../../utils/normalizeText.ts'
import type { SummaryData } from './types.ts'

export type SummaryMetrics = {
  productCount: (summary: SummaryData, productBase: string) => number
  varietyCount: (summary: SummaryData, productBase: string, variety: string) => number
  distinctVarietiesCount: (summary: SummaryData, productBase: string) => number
}

const getProductBaseMap = (summary: SummaryData): Record<string, number> =>
  summary.productoBase ?? summary.byProductBase ?? {}

const getVarietyMap = (
  summary: SummaryData,
): Record<string, Record<string, number>> => summary.variedades ?? summary.byVariety ?? {}

const findNormalizedEntry = <T>(source: Record<string, T>, key: string): T | undefined => {
  const normalizedKey = normalizeText(key)
  return Object.entries(source).find(([candidate]) => normalizeText(candidate) === normalizedKey)?.[1]
}

const getVarietiesForProduct = (
  summary: SummaryData,
  productBase: string,
): Record<string, number> => {
  const map = getVarietyMap(summary)
  return map[productBase] ?? findNormalizedEntry(map, productBase) ?? {}
}

const directMetrics: SummaryMetrics = {
  productCount: (summary, productBase) => {
    const productMap = getProductBaseMap(summary)
    return productMap[productBase] ?? findNormalizedEntry(productMap, productBase) ?? 0
  },
  varietyCount: (summary, productBase, variety) => {
    const varieties = getVarietiesForProduct(summary, productBase)
    return varieties[variety] ?? findNormalizedEntry(varieties, variety) ?? 0
  },
  distinctVarietiesCount: (summary, productBase) =>
    new Set(
      Object.entries(getVarietiesForProduct(summary, productBase))
        .filter(([, count]) => count > 0)
        .map(([name]) => normalizeText(name)),
    ).size,
}

export const createDirectSummaryMetrics = (): SummaryMetrics => directMetrics

export const createAliasSummaryMetrics = (): SummaryMetrics => {
  const direct = createDirectSummaryMetrics()

  const splitAlternatives = (value: string) =>
    normalizeText(value).split(/\s+o\s+/).map((item) => item.trim()).filter(Boolean)

  const matchesTarget = (candidate: string, target: string) => {
    const normalizedCandidate = normalizeText(candidate)
    const normalizedTarget = normalizeText(target)
    return (
      normalizedCandidate === normalizedTarget ||
      normalizedCandidate.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedCandidate)
    )
  }

  const buildMatchTargets = (value: string) => {
    const targets = new Set(splitAlternatives(value))
    Array.from(targets).forEach((target) => {
      if (target.includes('mermelada')) targets.add('mermelada')
      if (target.includes('membrillo')) {
        targets.add('membrillo')
        targets.add('dulce membrillo')
      }
    })
    return Array.from(targets)
  }

  const countExternalMentions = (summary: SummaryData, productBase: string) => {
    const varietyMap = getVarietyMap(summary)
    const ownVarieties = getVarietiesForProduct(summary, productBase)
    const ownTotal = Object.values(ownVarieties).reduce((total, count) => total + count, 0)
    const targets = buildMatchTargets(productBase)
    const allMatches = Object.values(varietyMap).reduce(
      (total, varieties) =>
        total +
        Object.entries(varieties).reduce(
          (subtotal, [name, count]) =>
            targets.some((target) => matchesTarget(name, target)) ? subtotal + count : subtotal,
          0,
        ),
      0,
    )
    return Math.max(allMatches - ownTotal, 0)
  }

  return {
    productCount: (summary, productBase) =>
      direct.productCount(summary, productBase) + countExternalMentions(summary, productBase),
    varietyCount: direct.varietyCount,
    distinctVarietiesCount: (summary, productBase) => {
      const directCount = direct.distinctVarietiesCount(summary, productBase)
      if (directCount > 0) return directCount

      const targets = buildMatchTargets(productBase)
      const varieties = getVarietyMap(summary)
      return new Set(
        Object.values(varieties).flatMap((items) =>
          Object.entries(items)
            .filter(([name, count]) => count > 0 && targets.some((target) => matchesTarget(name, target)))
            .map(([name]) => normalizeText(name)),
        ),
      ).size
    },
  }
}
