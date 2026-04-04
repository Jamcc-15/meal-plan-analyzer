import type { ExcelData, HeaderGroup } from '../types/excel.types.ts'

type ParsedDate = { y: number; m: number; d: number }
type ParseDateCode = (value: number) => ParsedDate | null

const HEADER_TOKENS = [
  'dia',
  'desayuno',
  'porcion liquida',
  'porcion solida',
  'almuerzo',
  'entrada',
  'principal',
  'acompanamiento',
  'postre',
  'agua',
]

const REQUIRED_COLUMNS = [
  'dia',
  'porcion liquida',
  'porcion solida',
  'entrada',
  'principal',
  'acompanamiento',
  'postre',
  'agua',
]

const normalizeCell = (value: string) =>
  value
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')

const toNivel = (value: string): ExcelData['detectedNivel'] | undefined => {
  const normalized = normalizeCell(value)
  if (!normalized) return undefined

  if (normalized.includes('transicion')) return 'transicion'
  if (normalized.includes('basica')) return 'basica'
  if (normalized.includes('media')) return 'media'

  return undefined
}

const detectNivelFromRawRows = (
  rows: (string | number | boolean | null)[][],
): ExcelData['detectedNivel'] | undefined => {
  const scanLimit = Math.min(rows.length, 15)

  // Prefer explicit metadata pattern: col C = "Nivel/Programa" and col D = value.
  for (let i = 0; i < scanLimit; i += 1) {
    const row = rows[i] ?? []
    const colC = String(row[2] ?? '')
    const colD = String(row[3] ?? '')
    const label = normalizeCell(colC)

    if (label.includes('nivel/programa') || (label.includes('nivel') && label.includes('programa'))) {
      const nivel = toNivel(colD)
      if (nivel) return nivel
    }
  }

  // Fallback: search any cell with "nivel" and use adjacent right cell as value.
  for (let i = 0; i < scanLimit; i += 1) {
    const row = rows[i] ?? []
    for (let j = 0; j < row.length; j += 1) {
      const cell = normalizeCell(String(row[j] ?? ''))
      if (!cell.includes('nivel')) continue

      const rightValue = String(row[j + 1] ?? '')
      const nivel = toNivel(rightValue)
      if (nivel) return nivel
    }
  }

  return undefined
}

const formatSimpleDate = (date: Date) => {
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = String(date.getFullYear())
  return `${day}-${month}-${year}`
}

const formatExcelDate = (value: number, parseDateCode: ParseDateCode) => {
  const parsed = parseDateCode(value)
  if (!parsed) return String(value)
  const date = new Date(parsed.y, parsed.m - 1, parsed.d)
  return formatSimpleDate(date)
}

const formatDateValue = (value: unknown, parseDateCode: ParseDateCode) => {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return formatSimpleDate(value)
  }

  if (typeof value === 'number') {
    return formatExcelDate(value, parseDateCode)
  }

  const asString = String(value ?? '').trim()
  const asNumber = Number(asString)
  if (!Number.isNaN(asNumber) && asNumber > 30000) {
    return formatExcelDate(asNumber, parseDateCode)
  }

  if (asString) {
    const looksLikeDate =
      /(Mon|Tue|Wed|Thu|Fri|Sat|Sun)\s+[A-Za-z]{3}\s+\d{1,2}\s+\d{4}/.test(
        asString,
      ) || asString.includes('GMT')

    if (looksLikeDate) {
      const parsed = new Date(asString)
      if (!Number.isNaN(parsed.getTime())) {
        return formatSimpleDate(parsed)
      }
    }
  }

  return asString
}

const isValidFormattedDate = (value: string) => /^\d{2}-\d{2}-\d{4}$/.test(value)

const shouldKeepColumn = (header: string, rows: (string | number | boolean | null)[][], index: number) => {
  const normalized = normalizeCell(header)
  const isRequired = REQUIRED_COLUMNS.some((token) => normalized.includes(token))
  if (isRequired) return true

  return rows.some((row) => {
    const value = row?.[index]
    return String(value ?? '').trim().length > 0
  })
}

const scoreHeaderRow = (row: (string | number | boolean | null)[]) => {
  return row.reduce<number>((score, cell) => {
    const normalized = normalizeCell(String(cell ?? ''))
    if (!normalized) return score
    const matches = HEADER_TOKENS.some((token) => normalized.includes(token))
    return matches ? score + 1 : score
  }, 0)
}

const findHeaderRowIndex = (
  rows: (string | number | boolean | null)[][],
) => {
  const scanLimit = Math.min(rows.length, 20)
  let bestIndex = 0
  let bestScore = -1

  for (let i = 0; i < scanLimit; i += 1) {
    const score = scoreHeaderRow(rows[i])
    if (score > bestScore) {
      bestScore = score
      bestIndex = i
    }
  }

  return bestScore >= 2 ? bestIndex : 0
}

const buildGroupsFromRow = (
  groupRow: (string | number | boolean | null)[],
  headers: string[],
): HeaderGroup[] => {
  if (groupRow.length === 0) return []

  const groups: HeaderGroup[] = []
  let currentLabel = String(groupRow[0] ?? '').trim()
  let currentSpan = 0

  headers.forEach((_, index) => {
    const headerNormalized = normalizeCell(headers[index] ?? '')
    const rawLabel = String(groupRow[index] ?? '').trim()
    const label = headerNormalized === 'dia' ? '' : rawLabel
    if (label === currentLabel) {
      currentSpan += 1
      return
    }

    groups.push({ label: currentLabel, span: currentSpan })
    currentLabel = label
    currentSpan = 1
  })

  groups.push({ label: currentLabel, span: currentSpan })
  return groups
}

const inferGroupsFromHeaders = (headers: string[]): HeaderGroup[] => {
  const groups: HeaderGroup[] = []
  let currentLabel = ''
  let currentSpan = 0

  headers.forEach((header, index) => {
    const normalized = normalizeCell(header)
    let label = ''

    if (normalized.includes('desayuno')) {
      label = 'Desayuno'
    } else if (
      normalized.includes('almuerzo') ||
      ['entrada', 'principal', 'acompanamiento'].some((token) =>
        normalized.includes(token),
      )
    ) {
      label = 'Almuerzo'
    }

    if (index === 0) {
      currentLabel = label
      currentSpan = 1
      return
    }

    if (label === currentLabel) {
      currentSpan += 1
    } else {
      groups.push({ label: currentLabel, span: currentSpan })
      currentLabel = label
      currentSpan = 1
    }
  })

  if (headers.length > 0) {
    groups.push({ label: currentLabel, span: currentSpan })
  }

  return groups
}

const normalizeHeader = (header: string, index: number, fallback?: string) => {
  const trimmed = header.trim()
  if (trimmed.length > 0) return trimmed
  const fallbackTrimmed = fallback?.trim() ?? ''
  return fallbackTrimmed.length > 0 ? fallbackTrimmed : `Columna ${index + 1}`
}

export const parseExcelFile = async (file: File): Promise<ExcelData> => {
  const XLSX = await import('xlsx')
  const parseDateCode: ParseDateCode = (value) => {
    const parsed = XLSX.SSF.parse_date_code(value) as ParsedDate | null
    if (!parsed || !parsed.y || !parsed.m || !parsed.d) return null
    return parsed
  }

  const buffer = await file.arrayBuffer()
  const workbook = XLSX.read(buffer, { type: 'array', cellDates: true })

  const sheetName = workbook.SheetNames[0]
  if (!sheetName) {
    return { headers: [], rows: [] }
  }

  const worksheet = workbook.Sheets[sheetName]
  const rawRows = XLSX.utils.sheet_to_json<(string | number | boolean | null)[]>(
    worksheet,
    {
      header: 1,
      defval: '',
    },
  )

  if (rawRows.length === 0) {
    return { headers: [], rows: [] }
  }

  const detectedNivel = detectNivelFromRawRows(rawRows)

  const headerRowIndex = findHeaderRowIndex(rawRows)
  const rawHeaders = rawRows[headerRowIndex]
  const rawBody = rawRows.slice(headerRowIndex + 1)
  const groupRow = headerRowIndex > 0 ? rawRows[headerRowIndex - 1] : []
  const headers = rawHeaders.map((header, index) =>
    normalizeHeader(String(header ?? ''), index, String(groupRow[index] ?? '')),
  )

  const keptIndexes = headers
    .map((header, index) => ({ header, index }))
    .filter(({ header, index }) => shouldKeepColumn(header, rawBody, index))

  const keptHeaders = keptIndexes.map(({ header }) => header)

  let headerGroups: HeaderGroup[] = []
  const hasGroupLabels = groupRow.some(
    (cell) => String(cell ?? '').trim().length > 0,
  )

  if (hasGroupLabels) {
    const filteredGroupRow = keptIndexes.map(({ index }, keptPosition) => {
      const label = String(groupRow[index] ?? '')
      if (keptPosition === 0 && normalizeCell(keptHeaders[0] ?? '') === 'dia') {
        return ''
      }
      return label
    })
    headerGroups = buildGroupsFromRow(filteredGroupRow, keptHeaders)
  } else {
    headerGroups = inferGroupsFromHeaders(keptHeaders)
  }

  const rows = rawBody.map((row) => {
    const record: Record<string, string> = {}
    keptIndexes.forEach(({ header, index }) => {
      const cell = row?.[index] ?? ''
      const normalized = normalizeCell(header)
      if (normalized.includes('dia')) {
        record[header] = formatDateValue(cell, parseDateCode)
        return
      }

      record[header] = String(cell)
    })
    return record
  })

  const sanitizedRows = rows.filter((row) => {
    const values = keptHeaders.map((header) => row[header] ?? '')
    const cleaned = values.map((value) => String(value ?? '').trim())
    const hasContent = cleaned.some((value) => value && value !== '-')
    if (!hasContent) return false

    const dayHeader = keptHeaders.find((header) => normalizeCell(header) === 'dia')
    if (!dayHeader) return true

    const dayValue = String(row[dayHeader] ?? '').trim()
    const normalizedDayValue = normalizeCell(dayValue)

    if (!normalizedDayValue || normalizedDayValue === '-') return false

    if (
      normalizedDayValue.includes('numero correlativo') ||
      normalizedDayValue.includes('aprobacion')
    ) {
      return false
    }

    if (!isValidFormattedDate(dayValue)) return false

    return true
  })

  return { headers: keptHeaders, rows: sanitizedRows, headerGroups, detectedNivel }
}
