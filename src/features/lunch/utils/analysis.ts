import type { ExcelData } from '../../../types/excel.types.ts'
import { normalizeText } from '../../../utils/normalizeText.ts'
import almuerzoDictionaryData from '../data/almuerzoDictionary.json'
import type {
  LunchAnalysisRow,
  LunchCoverageItem,
  LunchGroupKey,
  LunchGroupSummary,
  LunchUnrecognizedItem,
  LunchVarietyDetail,
} from '../types/analysis.types.ts'
import type { LunchDictionary } from '../types/dictionary.types.ts'

export const LUNCH_SECTIONS: Array<{ key: string; label: string }> = [
  { key: 'entrada', label: 'Entrada' },
  { key: 'principal', label: 'Principal' },
  { key: 'acompanamiento', label: 'Acompañamiento' },
  { key: 'postre', label: 'Postre' },
  { key: 'bebida', label: 'Bebida' },
]

const LUNCH_HEADER_HINTS: Record<LunchGroupKey, string[]> = {
  entrada: ['entrada'],
  principal: ['principal', 'fondo'],
  acompanamiento: ['acompanamiento', 'acompañamiento', 'guarnicion', 'guarnición'],
  postre: ['postre'],
  bebida: ['bebida', 'agua', 'jugo'],
}

const findLunchHeader = (headers: string[], section: LunchGroupKey) => {
  const expected = LUNCH_HEADER_HINTS[section]
  return (
    headers.find((header) => {
      const normalized = normalizeText(header)
      return expected.some((token) => normalized.includes(normalizeText(token)))
    }) ?? null
  )
}

const buildLunchDictionary = (dictionary: LunchDictionary) => {
  const productById = new Map(dictionary.products.map((item) => [item.id, item]))
  const entriesByGroup: Record<
    LunchGroupKey,
    Array<{ normalizedPattern: string; productBase: string; variety: string }>
  > = {
    entrada: [],
    principal: [],
    acompanamiento: [],
    postre: [],
    bebida: [],
  }

  const appendEntry = (
    group: LunchGroupKey,
    pattern: string,
    productBase: string,
    variety: string,
  ) => {
    const normalizedPattern = normalizeText(pattern)
    if (!normalizedPattern) return

    const exists = entriesByGroup[group].some(
      (item) =>
        item.normalizedPattern === normalizedPattern &&
        item.productBase === productBase &&
        item.variety === variety,
    )
    if (exists) return

    entriesByGroup[group].push({ normalizedPattern, productBase, variety })
  }

  dictionary.patterns.forEach((pattern) => {
    const product = productById.get(pattern.producto_id)
    if (!product) return
    appendEntry(product.grupo, pattern.patron, product.producto_base, product.variedad)
  })

  Object.values(entriesByGroup).forEach((entries) => {
    entries.sort((left, right) => right.normalizedPattern.length - left.normalizedPattern.length)
  })

  return entriesByGroup
}

const lunchDictionary = buildLunchDictionary(almuerzoDictionaryData as LunchDictionary)

const matchLunchDictionary = (normalizedValue: string, group: LunchGroupKey) => {
  if (group === 'entrada') {
    const words = normalizedValue.split(/\s+/)
    const firstWord = words[0] === 'ensalada' ? words[1] : words[0]
    if (firstWord === 'repollo' || firstWord === 'apio') {
      const leafyEntry = lunchDictionary[group].find(
        (entry) =>
          entry.productBase === 'Verduras de hoja' &&
          entry.normalizedPattern === firstWord,
      )
      if (leafyEntry) return leafyEntry
    }
  }

  return (
    lunchDictionary[group].find((entry) => {
      if (
        group === 'acompanamiento' &&
        normalizedValue.includes('tricolor') &&
        entry.productBase === 'Pasta blanca o integral'
      ) {
        return false
      }

      return (
        normalizedValue === entry.normalizedPattern ||
        ` ${normalizedValue} `.includes(` ${entry.normalizedPattern} `)
      )
    }) ?? null
  )
}

export const buildLunchCoverage = (
  data: ExcelData | null,
  sections = LUNCH_SECTIONS,
): LunchCoverageItem[] => {
  if (!data) {
    return sections.map((item) => ({
      ...item,
      header: null,
      completedRows: 0,
    }))
  }

  return sections.map((section) => {
    const header = findLunchHeader(data.headers, section.key as LunchGroupKey)

    if (!header) {
      return {
        ...section,
        header: null,
        completedRows: 0,
      }
    }

    const completedRows = data.rows.filter((row) => {
      const value = String(row[header] ?? '').trim()
      return value !== '' && value !== '-'
    }).length

    return {
      ...section,
      header,
      completedRows,
    }
  })
}

export const analyzeLunch = (data: ExcelData | null, coverage: LunchCoverageItem[]) => {
  if (!data) {
    return {
      rows: [] as LunchAnalysisRow[],
      summary: [] as LunchGroupSummary[],
      unrecognized: [] as LunchUnrecognizedItem[],
    }
  }

  const rows: LunchAnalysisRow[] = []

  coverage.forEach((section) => {
    if (!section.header) return

    const group = section.key as LunchGroupKey

    data.rows.forEach((row) => {
      const rawText = String(row[section.header ?? ''] ?? '').trim()
      if (!rawText || rawText === '-') return

      const normalizedText = normalizeText(rawText)
      if (!normalizedText) return

      const match = matchLunchDictionary(normalizedText, group)
      rows.push({
        group,
        label: section.label,
        text: rawText,
        normalizedText,
        recognized: Boolean(match),
        productBase: match?.productBase ?? null,
        variety: match?.variety ?? null,
      })
    })
  })

  const summary: LunchGroupSummary[] = coverage.map((section) => {
    const group = section.key as LunchGroupKey
    const groupRows = rows.filter((item) => item.group === group)
    const recognizedRows = groupRows.filter((item) => item.recognized)
    const topCounter: Record<string, number> = {}
    const productCounter: Record<string, number> = {}
    const varietyCounter: Record<string, Record<string, LunchVarietyDetail>> = {}

    const addProductCount = (productBase: string, variety: string, sample: string) => {
      topCounter[productBase] = (topCounter[productBase] ?? 0) + 1
      productCounter[productBase] = (productCounter[productBase] ?? 0) + 1

      if (!varietyCounter[productBase]) {
        varietyCounter[productBase] = {}
      }

      const current = varietyCounter[productBase][variety]
      if (!current) {
        varietyCounter[productBase][variety] = {
          name: variety,
          count: 1,
          samples: [sample],
        }
        return
      }

      current.count += 1
      if (current.samples.length < 3 && !current.samples.includes(sample)) {
        current.samples.push(sample)
      }
    }

    recognizedRows.forEach((item) => {
      if (item.productBase && item.variety) {
        addProductCount(item.productBase, item.variety, item.text)
      }
    })

    groupRows.forEach((item) => {
      const includesLemon = item.group === 'entrada' && item.normalizedText.includes('limon')
      const alreadyCountedAsLemon = item.productBase === 'Limón'
      if (includesLemon && !alreadyCountedAsLemon) {
        addProductCount('Limón', 'Limón', item.text)
      }
    })

    const topProducts = Object.entries(topCounter)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3)

    const byProductBase = Object.entries(productCounter)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)

    const byVariety = Object.entries(varietyCounter)
      .map(([productBase, items]) => ({
        productBase,
        items: Object.values(items)
          .map((item) => ({
            ...item,
            samples: item.samples.slice(0, 3),
          }))
          .sort((a, b) => b.count - a.count),
      }))
      .sort((a, b) => a.productBase.localeCompare(b.productBase, 'es'))

    return {
      group,
      label: section.label,
      total: groupRows.length,
      recognized: recognizedRows.length,
      unrecognized: groupRows.length - recognizedRows.length,
      topProducts,
      byProductBase,
      byVariety,
    }
  })

  const unrecognizedCounter = new Map<
    string,
    { group: LunchGroupKey; text: string; normalizedText: string; count: number }
  >()
  rows.forEach((item) => {
    if (item.recognized) return
    const key = `${item.group}::${item.normalizedText}`
    const existing = unrecognizedCounter.get(key)
    if (existing) {
      existing.count += 1
      return
    }

    unrecognizedCounter.set(key, {
      group: item.group,
      text: item.text,
      normalizedText: item.normalizedText,
      count: 1,
    })
  })

  const unrecognized = Array.from(unrecognizedCounter.values()).sort((a, b) => b.count - a.count)

  return {
    rows,
    summary,
    unrecognized,
  }
}
