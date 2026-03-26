import type { LiquidSummary } from '../types/liquid-analysis.types.ts'

type ReportExportInput = {
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
}

type PdfInput = Pick<ReportExportInput, 'liquidSummary' | 'solidSummary' | 'breakfastRawSolid'>

const PDF_COLORS = {
  slate900: [15, 23, 42] as const,
  slate700: [51, 65, 85] as const,
  slate500: [100, 116, 139] as const,
  slate200: [226, 232, 240] as const,
  white: [255, 255, 255] as const,
  liquid: [249, 115, 22] as const,
  solid: [37, 99, 235] as const,
  success: [16, 185, 129] as const,
  warning: [245, 158, 11] as const,
}

const sortEntries = (input: Record<string, number>) =>
  Object.entries(input).sort((a, b) => b[1] - a[1])

const flattenVarieties = (input: Record<string, Record<string, number>>) =>
  Object.entries(input).flatMap(([productBase, varieties]) =>
    Object.entries(varieties)
      .sort((a, b) => b[1] - a[1])
      .map(([variety, count]) => [productBase, variety, count] as [string, string, number]),
  )

const getPanAddons = (rawSolid: Record<string, number>) => {
  const normalizeForPan = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')

  const panAddons: Record<string, number> = {}
  Object.entries(rawSolid).forEach(([literal, count]) => {
    const normalized = normalizeForPan(literal)
    if (!normalized.includes('pan')) return

    const withCon = literal.match(/\bcon\s+(.+)$/i)
    const withShort = literal.match(/\bc\/(.+)$/i)
    const addon = withCon?.[1]?.trim() ?? withShort?.[1]?.trim() ?? ''
    if (!addon) return

    panAddons[addon] = (panAddons[addon] ?? 0) + count
  })

  return panAddons
}

const totalFromRecord = (input: Record<string, number>) =>
  Object.values(input).reduce((acc, value) => acc + value, 0)

const formatCount = (value: number) => new Intl.NumberFormat('es-CL').format(value)

const ensureRows = (rows: Array<Array<string>>, fallbackColumns: number) => {
  if (rows.length > 0) return rows
  return [Array.from({ length: fallbackColumns }, (_, idx) => (idx === 0 ? '--' : '0'))]
}

const createBreakfastPdf = async ({ liquidSummary, solidSummary, breakfastRawSolid }: PdfInput) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const autoTableFn = autoTable as unknown as (doc: unknown, options: Record<string, unknown>) => void

  const panAddons = getPanAddons(breakfastRawSolid)
  const liquidTotal = totalFromRecord(liquidSummary.byProductBase)
  const solidTotal = totalFromRecord(solidSummary.byProductBase)
  const unrecognizedTotal = liquidSummary.unrecognizedCount + solidSummary.unrecognizedCount

  const topLiquid = sortEntries(liquidSummary.byProductBase)[0] ?? ['--', 0]
  const topSolid = sortEntries(solidSummary.byProductBase)[0] ?? ['--', 0]
  const topAddon = sortEntries(panAddons)[0] ?? ['--', 0]

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const now = new Date().toLocaleString('es-CL')
  const pdfDoc = doc as unknown as { lastAutoTable?: { finalY: number } }

  const nextY = () => (pdfDoc.lastAutoTable?.finalY ?? 74) + 8
  const ensurePageSpace = (y: number) => {
    if (y <= 282) return y
    doc.addPage()
    doc.setFillColor(...PDF_COLORS.slate900)
    doc.rect(0, 0, 210, 16, 'F')
    doc.setFontSize(9)
    doc.setTextColor(...PDF_COLORS.white)
    doc.text('Resumen de Minuta - Continuacion', 14, 10)
    return 22
  }

  const addSectionTitle = (title: string, color: readonly [number, number, number]) => {
    const y = ensurePageSpace(nextY())
    doc.setFontSize(11)
    doc.setTextColor(...PDF_COLORS.slate900)
    doc.text(title, 14, y)
    doc.setDrawColor(...color)
    doc.setLineWidth(0.7)
    doc.line(14, y + 1.8, 86, y + 1.8)
    return y + 4
  }

  const addKpiCard = (
    x: number,
    y: number,
    width: number,
    title: string,
    value: string,
    accent: readonly [number, number, number],
  ) => {
    doc.setDrawColor(...PDF_COLORS.slate200)
    doc.setFillColor(...PDF_COLORS.white)
    doc.roundedRect(x, y, width, 18, 2, 2, 'FD')
    doc.setFillColor(...accent)
    doc.rect(x, y, width, 3, 'F')

    doc.setFontSize(8)
    doc.setTextColor(...PDF_COLORS.slate500)
    doc.text(title, x + 2.5, y + 8)

    doc.setFontSize(11)
    doc.setTextColor(...PDF_COLORS.slate900)
    doc.text(value, x + 2.5, y + 14)
  }

  const tableBaseOptions = {
    theme: 'striped',
    styles: {
      fontSize: 9,
      textColor: PDF_COLORS.slate900,
      lineColor: PDF_COLORS.slate200,
      lineWidth: 0.1,
      cellPadding: 2.2,
    },
    headStyles: {
      textColor: PDF_COLORS.white,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    bodyStyles: {
      fillColor: PDF_COLORS.white,
    },
    margin: { left: 14, right: 14 },
  }

  doc.setFillColor(...PDF_COLORS.slate900)
  doc.rect(0, 0, 210, 36, 'F')

  doc.setFontSize(16)
  doc.setTextColor(...PDF_COLORS.white)
  doc.text('Resultados de Minuta - Desayuno', 14, 14)

  doc.setFontSize(10)
  doc.setTextColor(203, 213, 225)
  doc.text(`Generado: ${now}`, 14, 22)
  doc.text('Informe de porcion liquida, porcion solida y agregados', 14, 28)

  addKpiCard(14, 40, 44, 'Total liquida', formatCount(liquidTotal), PDF_COLORS.liquid)
  addKpiCard(61, 40, 44, 'Total solida', formatCount(solidTotal), PDF_COLORS.solid)
  addKpiCard(108, 40, 44, 'No reconocidos', formatCount(unrecognizedTotal), PDF_COLORS.warning)
  addKpiCard(155, 40, 41, 'Pan agregados', formatCount(totalFromRecord(panAddons)), PDF_COLORS.success)

  doc.setFontSize(9)
  doc.setTextColor(...PDF_COLORS.slate700)
  doc.text(`Top liquida: ${topLiquid[0]} (${formatCount(topLiquid[1])})`, 14, 64)
  doc.text(`Top solida: ${topSolid[0]} (${formatCount(topSolid[1])})`, 14, 69)
  doc.text(`Top agregado pan: ${topAddon[0]} (${formatCount(topAddon[1])})`, 14, 74)

  autoTableFn(doc, {
    ...tableBaseOptions,
    startY: addSectionTitle('Indicadores generales', PDF_COLORS.slate900),
    head: [['Indicador', 'Valor']],
    body: [
      ['No reconocidos (liquida)', formatCount(liquidSummary.unrecognizedCount)],
      ['No reconocidos (solida)', formatCount(solidSummary.unrecognizedCount)],
      ['Total porciones liquidas', formatCount(liquidTotal)],
      ['Total porciones solidas', formatCount(solidTotal)],
    ],
    headStyles: { ...tableBaseOptions.headStyles, fillColor: PDF_COLORS.slate900 },
    columnStyles: { 1: { halign: 'right' } },
  })

  autoTableFn(doc, {
    ...tableBaseOptions,
    startY: addSectionTitle('Porcion liquida (producto base)', PDF_COLORS.liquid),
    head: [['Producto base', 'Cantidad']],
    body: ensureRows(
      sortEntries(liquidSummary.byProductBase).map(([name, count]) => [name, formatCount(count)]),
      2,
    ),
    headStyles: { ...tableBaseOptions.headStyles, fillColor: PDF_COLORS.liquid },
    columnStyles: { 1: { halign: 'right' } },
  })

  autoTableFn(doc, {
    ...tableBaseOptions,
    startY: addSectionTitle('Por variedad (porcion liquida)', PDF_COLORS.liquid),
    head: [['Producto base', 'Variedad', 'Cantidad']],
    body: ensureRows(
      flattenVarieties(liquidSummary.byVariety).map(([base, variety, count]) => [
        base,
        variety,
        formatCount(count),
      ]),
      3,
    ),
    headStyles: { ...tableBaseOptions.headStyles, fillColor: PDF_COLORS.liquid },
    columnStyles: { 2: { halign: 'right' } },
  })

  autoTableFn(doc, {
    ...tableBaseOptions,
    startY: addSectionTitle('Porcion solida (producto base)', PDF_COLORS.solid),
    head: [['Producto base', 'Cantidad']],
    body: ensureRows(
      sortEntries(solidSummary.byProductBase).map(([name, count]) => [name, formatCount(count)]),
      2,
    ),
    headStyles: { ...tableBaseOptions.headStyles, fillColor: PDF_COLORS.solid },
    columnStyles: { 1: { halign: 'right' } },
  })

  autoTableFn(doc, {
    ...tableBaseOptions,
    startY: addSectionTitle('Por variedad / agregados (porcion solida)', PDF_COLORS.solid),
    head: [['Producto base', 'Variedad', 'Cantidad']],
    body: ensureRows(
      flattenVarieties(solidSummary.byVariety).map(([base, variety, count]) => [
        base,
        variety,
        formatCount(count),
      ]),
      3,
    ),
    headStyles: { ...tableBaseOptions.headStyles, fillColor: PDF_COLORS.solid },
    columnStyles: { 2: { halign: 'right' } },
  })

  autoTableFn(doc, {
    ...tableBaseOptions,
    startY: addSectionTitle('Agregados de Pan (porcion solida)', PDF_COLORS.success),
    head: [['Agregado', 'Cantidad']],
    body: ensureRows(sortEntries(panAddons).map(([name, count]) => [name, formatCount(count)]), 2),
    headStyles: { ...tableBaseOptions.headStyles, fillColor: PDF_COLORS.success },
    columnStyles: { 1: { halign: 'right' } },
  })

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...PDF_COLORS.slate200)
    doc.setLineWidth(0.2)
    doc.line(14, 287, 196, 287)
    doc.setFontSize(8)
    doc.setTextColor(...PDF_COLORS.slate500)
    doc.text(`Pagina ${page} de ${pageCount}`, 196, 291, { align: 'right' })
  }

  return doc
}

export const exportResultsCsv = ({
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
}: ReportExportInput) => {
  const rows: Array<[string, string, string, number]> = []

  const pushRecord = (category: string, key: string, detail: string, value: number) => {
    rows.push([category, key, detail, value])
  }

  Object.entries(liquidSummary.byProductBase).forEach(([name, value]) => {
    pushRecord('liquida_producto_base', name, '', value)
  })
  Object.entries(liquidSummary.byVariety).forEach(([productBase, varieties]) => {
    Object.entries(varieties).forEach(([variety, value]) => {
      pushRecord('liquida_variedad', productBase, variety, value)
    })
  })
  Object.entries(breakfastRawLiquid).forEach(([text, value]) => {
    pushRecord('liquida_literal', text, '', value)
  })

  Object.entries(solidSummary.byProductBase).forEach(([name, value]) => {
    pushRecord('solida_producto_base', name, '', value)
  })
  Object.entries(solidSummary.byVariety).forEach(([productBase, varieties]) => {
    Object.entries(varieties).forEach(([variety, value]) => {
      pushRecord('solida_variedad', productBase, variety, value)
    })
  })
  Object.entries(breakfastRawSolid).forEach(([text, value]) => {
    pushRecord('solida_literal', text, '', value)
  })

  pushRecord('meta', 'no_reconocidos_liquida', '', liquidSummary.unrecognizedCount)
  pushRecord('meta', 'no_reconocidos_solida', '', solidSummary.unrecognizedCount)

  const escapeCsv = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`

  const csvContent = [
    'categoria,clave,detalle,cantidad',
    ...rows.map((item) => item.map(escapeCsv).join(',')),
  ].join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `resultados_minuta_${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(link)
  link.click()
  link.remove()
  URL.revokeObjectURL(url)
}

export const exportResultsPdf = async (input: PdfInput) => {
  const doc = await createBreakfastPdf(input)
  doc.save(`resultados_minuta_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export const previewResultsPdf = async (input: PdfInput) => {
  const doc = await createBreakfastPdf(input)
  const pdfBlob = doc.output('blob')
  const blobUrl = URL.createObjectURL(pdfBlob)
  window.open(blobUrl, '_blank', 'noopener,noreferrer')

  window.setTimeout(() => {
    URL.revokeObjectURL(blobUrl)
  }, 60_000)
}
