import type { LiquidSummary } from '../types/liquid-analysis.types.ts'
import type { BreakfastValidation, Nivel, ValidationResult } from '../types/breakfast-rules.types.ts'

type ReportExportInput = {
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
  breakfastValidation: BreakfastValidation
  selectedNivel: Nivel
}

type PdfInput = Pick<
  ReportExportInput,
  'liquidSummary' | 'solidSummary' | 'breakfastValidation' | 'selectedNivel'
>

type CsvInput = Pick<
  ReportExportInput,
  'liquidSummary' | 'solidSummary' | 'breakfastRawLiquid' | 'breakfastRawSolid'
>

const PDF_COLORS = {
  slate900: [15, 23, 42] as const,
  slate700: [51, 65, 85] as const,
  slate500: [100, 116, 139] as const,
  slate300: [203, 213, 225] as const,
  slate200: [226, 232, 240] as const,
  slate100: [241, 245, 249] as const,
  slate50: [249, 250, 251] as const,
  white: [255, 255, 255] as const,
  liquid: [71, 85, 105] as const,
  solid: [100, 116, 139] as const,
  successDark: [22, 101, 52] as const,
  success: [74, 181, 90] as const,
  successSoft: [209, 250, 229] as const,
  dangerDark: [153, 27, 27] as const,
  danger: [220, 38, 38] as const,
  dangerSoft: [254, 226, 226] as const,
  gray300: [209, 213, 219] as const,
}

const PDF_CONTENT_BOTTOM = 282
const PDF_SECTION_MIN_SPACE = 42

  const formatNivelLabel = (nivel: Nivel) => {
    if (nivel === 'transicion') return 'Transición'
    if (nivel === 'basica') return 'Básica'
    return 'Media'
  }

const formatCount = (value: number) => new Intl.NumberFormat('es-CL').format(value)

// Remove empty rows - show section header without dummy table
// const ensureRows = (rows: Array<Array<string>>, fallbackColumns: number) => {
//   if (rows.length > 0) return rows
//   return [] // Return empty array - no dummy rows
// }

const complianceStatus = (items: ValidationResult[]) => {
  const total = items.length
  const passed = items.filter((item) => item.cumple).length

  if (total === 0) return 'Cumple'
  return passed === total ? 'Cumple' : 'No cumple'
}

const complianceComparison = (items: ValidationResult[]) => {
  const total = items.length
  const passed = items.filter((item) => item.cumple).length
  return `${passed} de ${total}`
}

const simpleRuleStatus = (item: ValidationResult) => (item.cumple ? 'Cumple' : 'No cumple')

const buildRuleCriteriaText = (item: ValidationResult) => {
  if (item.tipo === 'frecuencia') {
    const limite = item.meta.limite === 'min' ? 'Mín' : item.meta.limite === 'max' ? 'Máx' : '--'
    const veces = typeof item.meta.veces === 'number' ? item.meta.veces : item.esperado
    return `${limite} ${veces}/mes`
  }

  const minima = typeof item.meta.minima === 'number' ? item.meta.minima : item.esperado
  return `Mín ${minima} variedad`
}

const formatObtained = (value: string | number) =>
  typeof value === 'number' ? formatCount(value) : String(value)

const buildRulesRows = (items: ValidationResult[]) =>
  items.map((item) => [
    item.producto_base,
    item.tipo === 'frecuencia' ? 'Frec./mes' : 'Variedad',
    buildRuleCriteriaText(item),
    formatObtained(item.obtenido),
    simpleRuleStatus(item),
  ])

type FailureType = 'exceso' | 'deficit' | 'variedad'

const classifyFailure = (item: ValidationResult): FailureType => {
  if (item.tipo === 'frecuencia') {
    const isMax = item.meta.limite === 'max'
    const expected = typeof item.meta.veces === 'number' ? item.meta.veces : item.esperado
    const obtained = typeof item.obtenido === 'number' ? item.obtenido : 0
    return isMax && Number(obtained) > Number(expected) ? 'exceso' : 'deficit'
  }
  return 'variedad'
}

const buildFailuresSummary = (items: ValidationResult[]) => {
  const failed = items.filter((item) => !item.cumple)
  const grouped = { exceso: [] as ValidationResult[], deficit: [] as ValidationResult[], variedad: [] as ValidationResult[] }
  failed.forEach((item) => {
    const type = classifyFailure(item)
    grouped[type].push(item)
  })
  return grouped
}

const formatFailureLine = (item: ValidationResult): string => {
  if (item.tipo === 'frecuencia') {
    const isMax = item.meta.limite === 'max'
    const expected = typeof item.meta.veces === 'number' ? item.meta.veces : item.esperado
    const obtained = typeof item.obtenido === 'number' ? item.obtenido : item.esperado
    const comp = isMax ? `máx ${expected}` : `mín ${expected}`
    return `${item.producto_base} — ${obtained} (${comp})`
  }
  const minima = typeof item.meta.minima === 'number' ? item.meta.minima : item.esperado
  const obtained = typeof item.obtenido === 'number' ? item.obtenido : item.esperado
  return `${item.producto_base} — ${obtained} (mín ${minima})`
}

const applyStatusCellStyle = (
  data: { section: 'body' | string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> } },
  statusColumnIndex: number,
  failureValueColumnIndex?: number,
) => {
  if (data.section !== 'body') return

  // Highlight obtained value if failure
  if (failureValueColumnIndex !== undefined && data.column.index === failureValueColumnIndex) {
    const row = data.cell?.styles?._row
    if (row && typeof row === 'object') {
      const statusInRow = (row as Record<string, unknown>)[statusColumnIndex]
      if (String(statusInRow ?? '').toLowerCase() === 'no cumple') {
        data.cell.styles.textColor = [...PDF_COLORS.danger]
        data.cell.styles.fontStyle = 'bold'
      }
    }
  }

  if (data.column.index !== statusColumnIndex) return

  const raw = String(data.cell.raw ?? '').toLowerCase()
  if (raw === 'cumple') {
    data.cell.styles.fillColor = [...PDF_COLORS.successSoft]
    data.cell.styles.textColor = [...PDF_COLORS.success]
    data.cell.styles.fontStyle = 'bold'
    return
  }

  if (raw === 'no cumple') {
    data.cell.styles.fillColor = [...PDF_COLORS.dangerSoft]
    data.cell.styles.textColor = [...PDF_COLORS.danger]
    data.cell.styles.fontStyle = 'bold'
  }
}

const createBreakfastPdf = async ({
  liquidSummary: _liquidSummary,
  solidSummary: _solidSummary,
  breakfastValidation,
  selectedNivel,
}: PdfInput) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])

  const autoTableFn = autoTable as unknown as (doc: unknown, options: Record<string, unknown>) => void

  const SECTION_COLORS = {
    compliance: PDF_COLORS.slate700,
    liquid: PDF_COLORS.slate700,
    solid: PDF_COLORS.slate500,
    adicionales: PDF_COLORS.slate700,
  } as const

  const totalRules = breakfastValidation.all.length
  const passedRules = breakfastValidation.all.filter((item) => item.cumple).length
  const failedRules = Math.max(totalRules - passedRules, 0)
  const adicionalesEvaluados = breakfastValidation.adicionales.length

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfDoc = doc as unknown as { lastAutoTable?: { finalY: number } }
  const nivelLabel = formatNivelLabel(selectedNivel)

  let lastContentY = 24 // Track position of last drawn content

  const nextY = () => lastContentY + 7

  const drawContinuationHeader = () => {
    doc.addPage()
    doc.setFillColor(...PDF_COLORS.white)
    doc.rect(0, 0, 210, 10, 'F')
    doc.setFontSize(9)
    doc.setTextColor(...PDF_COLORS.slate700)
    doc.setFont('', 'normal')
    doc.text('Resumen de Minuta – Continuación', 14, 6)
    doc.setDrawColor(...PDF_COLORS.gray300)
    doc.setLineWidth(0.3)
    doc.line(0, 8, 210, 8)
  }

  const ensurePageSpace = (y: number, minSpace = 0) => {
    if (y + minSpace <= PDF_CONTENT_BOTTOM) return y
    drawContinuationHeader()
    return 20
  }

  const addSectionTitle = (title: string, color: readonly [number, number, number]) => {
    const y = ensurePageSpace(nextY(), PDF_SECTION_MIN_SPACE)
    doc.setFontSize(11)
    doc.setFont('', 'bold')
    doc.setTextColor(...PDF_COLORS.slate900)
    doc.text(title, 14, y)
    doc.setFont('', 'normal')
    doc.setDrawColor(...color)
    doc.setLineWidth(0.4)
    doc.line(14, y + 1.6, 68, y + 1.6)
    return y + 3.6
  }

  const tableBaseOptions = {
    theme: 'striped',
    showHead: 'everyPage',
    rowPageBreak: 'avoid',
    styles: {
      fontSize: 8,
      textColor: PDF_COLORS.slate900,
      lineColor: PDF_COLORS.slate200,
      lineWidth: 0.08,
      cellPadding: 4,
      overflow: 'linebreak',
      valign: 'middle',
    },
    headStyles: {
      textColor: PDF_COLORS.slate900,
      fillColor: PDF_COLORS.slate50,
      fontStyle: 'bold',
      fontSize: 8,
      minCellHeight: 10,
    },
    alternateRowStyles: {
      fillColor: PDF_COLORS.slate100,
    },
    bodyStyles: {
      fillColor: PDF_COLORS.white,
      minCellHeight: 9,
    },
    tableLineColor: PDF_COLORS.slate200,
    tableLineWidth: 0.08,
    margin: { left: 14, right: 14 },
  }

  // MINIMAL PROFESSIONAL HEADER
  doc.setFillColor(...PDF_COLORS.white)
  doc.rect(0, 0, 210, 20, 'F')

  doc.setFontSize(16)
  doc.setTextColor(...PDF_COLORS.slate900)
  doc.setFont('', 'bold')
  doc.text('Informe de Cumplimiento Normativo – Desayuno', 14, 8)

  doc.setFontSize(8.5)
  doc.setFont('', 'normal')
  doc.setTextColor(...PDF_COLORS.slate700)
  const dateStr = new Date().toLocaleDateString('es-CL')
  doc.text(`Fecha: ${dateStr} | Nivel: ${nivelLabel}`, 14, 13)

  // Subtle line under header
  doc.setDrawColor(...PDF_COLORS.gray300)
  doc.setLineWidth(0.3)
  doc.line(0, 16, 210, 16)

  // SIMPLE METRICS LINE (no cards, clean)
  doc.setFontSize(8.5)
  doc.setTextColor(...PDF_COLORS.slate700)
  doc.setFont('', 'normal')
  doc.text(`Resumen: ${totalRules} reglas evaluadas | ${passedRules} cumplen | ${failedRules} no cumplen | ${adicionalesEvaluados} adicionales`, 14, 22)

  // RESULTADO FINAL - Simple text with left border
  const isPassed = failedRules === 0
  const finalResultColor: readonly [number, number, number] = isPassed ? PDF_COLORS.successDark : PDF_COLORS.dangerDark
  const finalResultText = isPassed ? 'ACEPTADO' : 'RECHAZADO'
  const finalResultDetail = isPassed ? 'Todas las reglas cumplen' : `${failedRules} de ${totalRules} reglas no cumplen`

  // RESULT BOX with left border (no background, professional)
  // Track current Y to avoid overlaps
  let currentY = 25

  doc.setDrawColor(...finalResultColor)
  doc.setLineWidth(1)
  doc.line(14, currentY - 2, 14, currentY + 6)

  doc.setFontSize(12)
  doc.setTextColor(...finalResultColor)
  doc.setFont('', 'bold')
  doc.text(`RESULTADO FINAL: ${finalResultText}`, 20, currentY + 2.5)

  doc.setFontSize(8.5)
  doc.setFont('', 'normal')
  doc.setTextColor(...PDF_COLORS.slate700)
  doc.text(finalResultDetail, 20, currentY + 5.5)

  // Move past result box with buffer
  currentY += 10

  // INCUMPLIMIENTOS SECTION
  const allFailures = buildFailuresSummary(breakfastValidation.all)
  const hasFailures = allFailures.exceso.length > 0 || allFailures.deficit.length > 0 || allFailures.variedad.length > 0

  if (hasFailures) {
    let failureY = ensurePageSpace(currentY, PDF_SECTION_MIN_SPACE)
    doc.setFontSize(10.5)
    doc.setTextColor(...PDF_COLORS.slate900)
    doc.setFont('', 'bold')
    doc.text('INCUMPLIMIENTOS DETECTADOS', 14, failureY)
    doc.setFont('', 'normal')
    doc.setDrawColor(...PDF_COLORS.danger)
    doc.setLineWidth(0.4)
    doc.line(14, failureY + 1.6, 100, failureY + 1.6)
    failureY += 5

    if (allFailures.exceso.length > 0) {
      doc.setFontSize(9)
      doc.setTextColor(...PDF_COLORS.slate900)
      doc.setFont('', 'bold')
      doc.text('EXCESOS', 14, failureY)
      failureY += 4
      doc.setFont('', 'normal')
      doc.setFontSize(8.5)
      allFailures.exceso.forEach((item) => {
        const line = formatFailureLine(item)
        doc.setTextColor(...PDF_COLORS.danger)
        doc.text(`• ${line}`, 16, failureY)
        failureY += 3.2
      })
      failureY += 1.5
    }

    if (allFailures.deficit.length > 0) {
      doc.setFontSize(9)
      doc.setTextColor(...PDF_COLORS.slate900)
      doc.setFont('', 'bold')
      doc.text('DÉFICITS', 14, failureY)
      failureY += 4
      doc.setFont('', 'normal')
      doc.setFontSize(8.5)
      allFailures.deficit.forEach((item) => {
        const line = formatFailureLine(item)
        doc.setTextColor(...PDF_COLORS.danger)
        doc.text(`• ${line}`, 16, failureY)
        failureY += 3.2
      })
      failureY += 1.5
    }

    if (allFailures.variedad.length > 0) {
      doc.setFontSize(9)
      doc.setTextColor(...PDF_COLORS.slate900)
      doc.setFont('', 'bold')
      doc.text('VARIEDADES', 14, failureY)
      failureY += 4
      doc.setFont('', 'normal')
      doc.setFontSize(8.5)
      allFailures.variedad.forEach((item) => {
        const line = formatFailureLine(item)
        doc.setTextColor(...PDF_COLORS.danger)
        doc.text(`• ${line}`, 16, failureY)
        failureY += 3.2
      })
    }
    lastContentY = failureY
  } else {
    lastContentY = currentY
  }

  // COMPLIANCE TABLE - IMPROVED
  const complianceTableBody = []
  
  // Only add rows with actual data
  if (breakfastValidation.porcion_liquida.length > 0) {
    complianceTableBody.push([
      'Porción líquida',
      complianceStatus(breakfastValidation.porcion_liquida),
      complianceComparison(breakfastValidation.porcion_liquida),
    ])
  }
  
  if (breakfastValidation.porcion_solida.length > 0) {
    complianceTableBody.push([
      'Porción sólida',
      complianceStatus(breakfastValidation.porcion_solida),
      complianceComparison(breakfastValidation.porcion_solida),
    ])
  }
  
  if (breakfastValidation.adicionales.length > 0) {
    complianceTableBody.push([
      'Adicionales',
      complianceStatus(breakfastValidation.adicionales),
      complianceComparison(breakfastValidation.adicionales),
    ])
  }
  
  // Always show Total
  complianceTableBody.push([
    'Total',
    complianceStatus(breakfastValidation.all),
    complianceComparison(breakfastValidation.all),
  ])

  if (complianceTableBody.length > 1) {
    autoTableFn(doc, {
      ...tableBaseOptions,
      startY: addSectionTitle('Cumplimiento de reglas', SECTION_COLORS.compliance),
      head: [['Seccion', 'Estado', 'Cumplimiento']],
      body: complianceTableBody,
      headStyles: { ...tableBaseOptions.headStyles },
      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 50 },
        2: { halign: 'right', cellWidth: 42 },
      },
      didParseCell: (data: { section: 'body' | string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> } }) => {
        if (data.section === 'body' && data.column.index === 1) {
          applyStatusCellStyle(data, 1)
        }
      },
    })
    lastContentY = pdfDoc.lastAutoTable?.finalY ?? lastContentY
  }

  const liquidRows = buildRulesRows(breakfastValidation.porcion_liquida)
  if (liquidRows.length > 0) {
    autoTableFn(doc, {
      ...tableBaseOptions,
      startY: addSectionTitle('Criterios – Porción líquida', SECTION_COLORS.liquid),
      head: [['Producto base', 'Criterio', 'Regla', 'Obtenido', 'Estado']],
      body: liquidRows,
      headStyles: { ...tableBaseOptions.headStyles },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 38 },
        3: { halign: 'right', cellWidth: 24 },
        4: { cellWidth: 20 },
      },
      didParseCell: (data: { section: 'body' | string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> }; row?: { cells?: Record<string, unknown> } }) => {
        if (data.section === 'body' && data.column.index === 3) {
          const statusCell = data.row?.cells?.[4] as { raw?: unknown } | undefined
          if (statusCell && String(statusCell.raw ?? '').toLowerCase() === 'no cumple') {
            data.cell.styles.textColor = [...PDF_COLORS.danger]
            data.cell.styles.fontStyle = 'bold'
          }
        }
        if (data.column.index === 4) applyStatusCellStyle(data, 4)
      },
    })
    lastContentY = pdfDoc.lastAutoTable?.finalY ?? lastContentY
  }

  const solidRows = buildRulesRows(breakfastValidation.porcion_solida)
  if (solidRows.length > 0) {
    autoTableFn(doc, {
      ...tableBaseOptions,
      startY: addSectionTitle('Criterios – Porción sólida', SECTION_COLORS.solid),
      head: [['Producto base', 'Criterio', 'Regla', 'Obtenido', 'Estado']],
      body: solidRows,
      headStyles: { ...tableBaseOptions.headStyles },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 38 },
        3: { halign: 'right', cellWidth: 24 },
        4: { cellWidth: 20 },
      },
      didParseCell: (data: { section: 'body' | string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> }; row?: { cells?: Record<string, unknown> } }) => {
        if (data.section === 'body' && data.column.index === 3) {
          const statusCell = data.row?.cells?.[4] as { raw?: unknown } | undefined
          if (statusCell && String(statusCell.raw ?? '').toLowerCase() === 'no cumple') {
            data.cell.styles.textColor = [...PDF_COLORS.danger]
            data.cell.styles.fontStyle = 'bold'
          }
        }
        if (data.column.index === 4) applyStatusCellStyle(data, 4)
      },
    })
    lastContentY = pdfDoc.lastAutoTable?.finalY ?? lastContentY
  }

  const additionalRows = buildRulesRows(breakfastValidation.adicionales)
  if (additionalRows.length > 0) {
    autoTableFn(doc, {
      ...tableBaseOptions,
      startY: addSectionTitle('Criterios – Adicionales', SECTION_COLORS.adicionales),
      head: [['Producto base', 'Criterio', 'Regla', 'Obtenido', 'Estado']],
      body: additionalRows,
      headStyles: { ...tableBaseOptions.headStyles },
      columnStyles: {
        0: { cellWidth: 35 },
        1: { cellWidth: 25 },
        2: { cellWidth: 38 },
        3: { halign: 'right', cellWidth: 24 },
        4: { cellWidth: 20 },
      },
      didParseCell: (data: { section: 'body' | string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> }; row?: { cells?: Record<string, unknown> } }) => {
        if (data.section === 'body' && data.column.index === 3) {
          const statusCell = data.row?.cells?.[4] as { raw?: unknown } | undefined
          if (statusCell && String(statusCell.raw ?? '').toLowerCase() === 'no cumple') {
            data.cell.styles.textColor = [...PDF_COLORS.danger]
            data.cell.styles.fontStyle = 'bold'
          }
        }
        if (data.column.index === 4) applyStatusCellStyle(data, 4)
      },
    })
    lastContentY = pdfDoc.lastAutoTable?.finalY ?? lastContentY
  }

  const pageCount = doc.getNumberOfPages()
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...PDF_COLORS.gray300)
    doc.setLineWidth(0.3)
    doc.line(14, 287, 196, 287)
    doc.setFontSize(8.5)
    doc.setTextColor(...PDF_COLORS.slate700)
    doc.setFont('', 'normal')
    doc.text('Evaluacion normativa mensual', 14, 291)
    doc.text(`Resultado final: ${finalResultText} | Nivel: ${nivelLabel}`, 14, 295)
    doc.text(`Pagina ${page} de ${pageCount}`, 196, 291, { align: 'right' })
  }

  return doc
}

export const exportResultsCsv = ({
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
}: CsvInput) => {
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
