import type { ExcelData } from '../types/excel.types.ts'
import type {
  DictionaryPattern,
  DictionaryProduct,
  LiquidDictionary,
  LiquidAnalysisRow,
  PortionType,
  LiquidSummary,
  UnrecognizedItem,
} from '../types/liquid-analysis.types.ts'
import { normalizeText } from './normalizeText.ts'

const findHeader = (headers: string[], expected: string[]) => {
  return (
    headers.find((header) => {
      const normalized = normalizeText(header)
      return expected.some((token) => normalized.includes(token))
    }) ?? null
  )
}

const buildNormalizedDictionary = (
  dictionary: LiquidDictionary,
  portion: PortionType,
) => {
  const filteredProducts = dictionary.products.filter(
    (item) => item.porcion === portion,
  )
  const productById = new Map(filteredProducts.map((item) => [item.id, item]))

  const entryByKey = new Map<
    string,
    {
      productId: string
      productoBase: string
      variedad: string
      normalizedPattern: string
    }
  >()

  const appendEntry = (product: DictionaryProduct, sourcePattern: string) => {
    const normalizedPattern = normalizeText(sourcePattern)
    if (!normalizedPattern) return

    const key = `${product.id}::${normalizedPattern}`
    if (entryByKey.has(key)) return

    entryByKey.set(key, {
      productId: product.id,
      productoBase: product.producto_base,
      variedad: product.variedad,
      normalizedPattern,
    })
  }

  dictionary.patterns.forEach((pattern) => {
    const product = productById.get(pattern.producto_id)
    if (!product) return
    appendEntry(product, pattern.patron)
  })

  filteredProducts.forEach((product) => {
    if (!Array.isArray(product.sinonimos)) return

    product.sinonimos.forEach((synonym) => {
      if (typeof synonym !== 'string') return
      appendEntry(product, synonym)
    })
  })

  return Array.from(entryByKey.values())
}

const matchDictionary = (
  normalizedValue: string,
  dictionary: ReturnType<typeof buildNormalizedDictionary>,
) => {
  return (
    dictionary.find((entry) =>
      normalizedValue === entry.normalizedPattern ||
      normalizedValue.includes(entry.normalizedPattern) ||
      entry.normalizedPattern.includes(normalizedValue),
    ) ?? null
  )
}

const toDisplayCase = (value: string) =>
  value
    .split(' ')
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(' ')

const SOLID_ADDON_BASES = new Set([
  'Tomate',
  'Queso',
  'Huevo',
  'Pechuga de pavo o pollo',
  'Palta',
  'Miel',
  'Mermelada con fruta o Dulce de membrillo',
])

const buildSolidAddonDictionary = (dictionary: LiquidDictionary) => {
  const addonProducts = dictionary.products.filter(
    (item) => item.porcion === 'porcion_solida' && SOLID_ADDON_BASES.has(item.producto_base),
  )

  const productById = new Map(addonProducts.map((item) => [item.id, item]))
  const entries: Array<{ normalizedPattern: string; variedad: string; productoBase: string }> = []

  dictionary.patterns.forEach((pattern) => {
    const product = productById.get(pattern.producto_id)
    if (!product) return
    const normalizedPattern = normalizeText(pattern.patron)
    if (!normalizedPattern) return
    entries.push({
      normalizedPattern,
      variedad: product.variedad,
      productoBase: product.producto_base,
    })
  })

  addonProducts.forEach((product) => {
    if (!Array.isArray(product.sinonimos)) return
    product.sinonimos.forEach((synonym) => {
      const normalizedPattern = normalizeText(String(synonym))
      if (!normalizedPattern) return
      entries.push({
        normalizedPattern,
        variedad: product.variedad,
        productoBase: product.producto_base,
      })
    })
  })

  return entries
}

const extractSolidAddon = (
  text: string,
  solidAddonDictionary: ReturnType<typeof buildSolidAddonDictionary>,
) => {
  const normalized = normalizeText(text)

  const withCon = normalized.match(/\bcon\s+(.+)$/)
  if (withCon?.[1]) {
    const addon = withCon[1].trim()
    const match = solidAddonDictionary.find((entry) => {
      const pattern = entry.normalizedPattern
      return addon === pattern || addon.includes(pattern) || pattern.includes(addon)
    })
    if (match) {
      const isMermeladaBase = normalizeText(match.productoBase).includes('mermelada con fruta')
      const isFlavorMermelada = addon.startsWith('mermelada ') && !addon.includes('con fruta')

      // Keep flavor labels (e.g., mermelada frutilla/durazno) as distinct varieties.
      if (isMermeladaBase && isFlavorMermelada) {
        return toDisplayCase(addon)
      }

      return match.variedad
    }
    return toDisplayCase(addon)
  }

  const withSlash = normalized.match(/\bc\/(.+)$/)
  if (withSlash?.[1]) {
    const addon = withSlash[1].trim()
    const match = solidAddonDictionary.find((entry) => {
      const pattern = entry.normalizedPattern
      return addon === pattern || addon.includes(pattern) || pattern.includes(addon)
    })
    if (match) {
      const isMermeladaBase = normalizeText(match.productoBase).includes('mermelada con fruta')
      const isFlavorMermelada = addon.startsWith('mermelada ') && !addon.includes('con fruta')

      // Keep flavor labels (e.g., mermelada frutilla/durazno) as distinct varieties.
      if (isMermeladaBase && isFlavorMermelada) {
        return toDisplayCase(addon)
      }

      return match.variedad
    }
    return toDisplayCase(addon)
  }

  return null
}

export const extractBreakfastLiquidRows = (
  data: ExcelData | null,
  dictionary: LiquidDictionary,
  portion: PortionType,
): LiquidAnalysisRow[] => {
  if (!data) return []

  const dayHeader = findHeader(data.headers, ['dia'])
  const portionHeader =
    portion === 'porcion_liquida'
      ? findHeader(data.headers, ['porcion liquida'])
      : findHeader(data.headers, ['porcion solida'])
  if (!dayHeader || !portionHeader) return []

  const normalizedDictionary = buildNormalizedDictionary(dictionary, portion)
  const solidAddonDictionary =
    portion === 'porcion_solida' ? buildSolidAddonDictionary(dictionary) : []

  return data.rows
    .map((row) => {
      const dia = String(row[dayHeader] ?? '').trim()
      const porcionTexto = String(row[portionHeader] ?? '').trim()
      const textoNormalizado = normalizeText(porcionTexto)

      if (!dia || !porcionTexto || porcionTexto === '-') {
        return null
      }

      const match = matchDictionary(textoNormalizado, normalizedDictionary)

      const solidAddon =
        portion === 'porcion_solida' &&
        (match?.productoBase === 'Pan blanco' || match?.productoBase === 'Pan integral')
          ? extractSolidAddon(porcionTexto, solidAddonDictionary)
          : null

      return {
        dia,
        porcionTexto,
        textoNormalizado,
        productoBase: match?.productoBase ?? null,
        variedad: solidAddon ?? match?.variedad ?? null,
        productId: match?.productId ?? null,
        porcion: portion,
        reconocido: Boolean(match),
      } satisfies LiquidAnalysisRow
    })
    .filter((row): row is LiquidAnalysisRow => row !== null)
}

export const countLiquidSummary = (rows: LiquidAnalysisRow[]): LiquidSummary => {
  const byProductBase: Record<string, number> = {}
  const byVariety: Record<string, Record<string, number>> = {}
  let unrecognizedCount = 0

  rows.forEach((row) => {
    if (!row.reconocido || !row.productoBase || !row.variedad) {
      unrecognizedCount += 1
      return
    }

    byProductBase[row.productoBase] = (byProductBase[row.productoBase] ?? 0) + 1

    if (!byVariety[row.productoBase]) {
      byVariety[row.productoBase] = {}
    }

    byVariety[row.productoBase][row.variedad] =
      (byVariety[row.productoBase][row.variedad] ?? 0) + 1
  })

  return { byProductBase, byVariety, unrecognizedCount }
}

export const countBreakfastLiquidsRaw = (rows: LiquidAnalysisRow[]) => {
  const counter: Record<string, number> = {}

  rows.forEach((row) => {
    const value = row.porcionTexto.trim()
    if (!value || value === '-') return
    counter[value] = (counter[value] ?? 0) + 1
  })

  return counter
}

export const getUnrecognizedItems = (rows: LiquidAnalysisRow[]): UnrecognizedItem[] => {
  const counter: Record<string, number> = {}

  rows.forEach((row) => {
    if (row.reconocido) return
    if (!row.textoNormalizado) return
    counter[row.textoNormalizado] = (counter[row.textoNormalizado] ?? 0) + 1
  })

  return Object.entries(counter)
    .map(([text, count]) => ({ text, count }))
    .sort((a, b) => b.count - a.count)
}

export const assignPatternToProduct = (
  dictionary: LiquidDictionary,
  text: string,
  productId: string,
): LiquidDictionary => {
  const normalized = normalizeText(text)
  if (!normalized) return dictionary

  const exists = dictionary.patterns.some(
    (pattern) =>
      pattern.producto_id === productId && normalizeText(pattern.patron) === normalized,
  )

  if (exists) return dictionary

  return {
    ...dictionary,
    patterns: [...dictionary.patterns, { producto_id: productId, patron: normalized }],
  }
}

export const createProduct = (
  dictionary: LiquidDictionary,
  input: Omit<DictionaryProduct, 'id'>,
): LiquidDictionary => {
  const slug = `${normalizeText(input.producto_base)}_${normalizeText(input.variedad)}`
    .replace(/\s+/g, '_')
    .replace(/[^a-z0-9_]/g, '')
  const id = `${slug}_${Date.now()}`

  return {
    ...dictionary,
    products: [...dictionary.products, { ...input, id }],
  }
}

export const updateProduct = (
  dictionary: LiquidDictionary,
  productId: string,
  patch: Partial<Omit<DictionaryProduct, 'id'>>,
): LiquidDictionary => {
  return {
    ...dictionary,
    products: dictionary.products.map((item) =>
      item.id === productId ? { ...item, ...patch } : item,
    ),
  }
}

export const deleteProduct = (
  dictionary: LiquidDictionary,
  productId: string,
): LiquidDictionary => {
  return {
    products: dictionary.products.filter((item) => item.id !== productId),
    patterns: dictionary.patterns.filter((item) => item.producto_id !== productId),
  }
}

export const addPattern = (
  dictionary: LiquidDictionary,
  productId: string,
  pattern: string,
): LiquidDictionary => {
  const normalized = normalizeText(pattern)
  if (!normalized) return dictionary

  const exists = dictionary.patterns.some(
    (item) => item.producto_id === productId && normalizeText(item.patron) === normalized,
  )
  if (exists) return dictionary

  return {
    ...dictionary,
    patterns: [...dictionary.patterns, { producto_id: productId, patron: normalized }],
  }
}

export const updatePattern = (
  dictionary: LiquidDictionary,
  index: number,
  nextPattern: string,
): LiquidDictionary => {
  const normalized = normalizeText(nextPattern)
  if (!normalized) return dictionary

  const patterns = [...dictionary.patterns]
  if (!patterns[index]) return dictionary
  patterns[index] = { ...patterns[index], patron: normalized }

  return { ...dictionary, patterns }
}

export const deletePattern = (
  dictionary: LiquidDictionary,
  index: number,
): LiquidDictionary => {
  return {
    ...dictionary,
    patterns: dictionary.patterns.filter((_, idx) => idx !== index),
  }
}

export const patternsByProduct = (patterns: DictionaryPattern[]) => {
  const map: Record<string, Array<{ pattern: string; index: number }>> = {}

  patterns.forEach((item, index) => {
    if (!map[item.producto_id]) {
      map[item.producto_id] = []
    }

    map[item.producto_id].push({ pattern: item.patron, index })
  })

  return map
}

