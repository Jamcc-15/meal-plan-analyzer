import type { jsPDF } from 'jspdf'

type PdfColor = readonly [number, number, number]

export const REPORT_COLORS = {
  navy: [15, 23, 42] as const,
  slate700: [51, 65, 85] as const,
  slate500: [100, 116, 139] as const,
  slate300: [203, 213, 225] as const,
  slate200: [226, 232, 240] as const,
  slate100: [241, 245, 249] as const,
  slate50: [248, 250, 252] as const,
  white: [255, 255, 255] as const,
  orange: [234, 88, 12] as const,
  orangeSoft: [255, 247, 237] as const,
  success: [5, 150, 105] as const,
  successDark: [4, 120, 87] as const,
  successSoft: [236, 253, 245] as const,
  danger: [225, 29, 72] as const,
  dangerDark: [190, 18, 60] as const,
  dangerSoft: [255, 241, 242] as const,
  warning: [217, 119, 6] as const,
  warningSoft: [255, 251, 235] as const,
}

type ReportHeaderInput = {
  mealLabel: string
  nivelLabel: string
  total: number
  passed: number
  pending?: number
}

const drawMetricCard = (
  doc: jsPDF,
  x: number,
  label: string,
  value: string,
  tone: 'neutral' | 'success' | 'danger' | 'warning',
) => {
  const palette: { fill: PdfColor; text: PdfColor } = tone === 'success'
    ? { fill: REPORT_COLORS.successSoft, text: REPORT_COLORS.successDark }
    : tone === 'danger'
      ? { fill: REPORT_COLORS.dangerSoft, text: REPORT_COLORS.dangerDark }
      : tone === 'warning'
        ? { fill: REPORT_COLORS.warningSoft, text: REPORT_COLORS.warning }
        : { fill: REPORT_COLORS.slate50, text: REPORT_COLORS.slate700 }

  doc.setFillColor(...palette.fill)
  doc.setDrawColor(...REPORT_COLORS.slate200)
  doc.roundedRect(x, 38, 44, 17, 2, 2, 'FD')
  doc.setFontSize(6.8)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(...REPORT_COLORS.slate500)
  doc.text(label.toUpperCase(), x + 3, 43)
  doc.setFontSize(12)
  doc.setTextColor(...palette.text)
  doc.text(value, x + 3, 50.5)
}

export const drawReportHeader = (doc: jsPDF, input: ReportHeaderInput) => {
  const failed = Math.max(input.total - input.passed, 0)
  const hasRules = input.total > 0
  const accepted = hasRules && failed === 0
  const result = !hasRules ? 'SIN EVALUACIÓN' : accepted ? 'ACEPTADO' : 'RECHAZADO'
  const resultColor: PdfColor = !hasRules
    ? REPORT_COLORS.warning
    : accepted ? REPORT_COLORS.successDark : REPORT_COLORS.dangerDark
  const resultFill: PdfColor = !hasRules
    ? REPORT_COLORS.warningSoft
    : accepted ? REPORT_COLORS.successSoft : REPORT_COLORS.dangerSoft

  doc.setFillColor(...REPORT_COLORS.navy)
  doc.rect(0, 0, 210, 29, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7.5)
  doc.setTextColor(...REPORT_COLORS.slate300)
  doc.text('ANÁLISIS DE RESULTADOS', 14, 8)
  doc.setFontSize(17)
  doc.setTextColor(...REPORT_COLORS.white)
  doc.text('Cumplimiento de reglas', 14, 18)
  doc.setFontSize(7.5)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(...REPORT_COLORS.slate300)
  doc.text(`Evaluación mensual - ${new Date().toLocaleDateString('es-CL')}`, 14, 24)

  const badgeWidth = Math.max(35, doc.getTextWidth(input.mealLabel.toUpperCase()) + 10)
  doc.setFillColor(...REPORT_COLORS.orange)
  doc.roundedRect(196 - badgeWidth, 9, badgeWidth, 9, 2, 2, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(7)
  doc.setTextColor(...REPORT_COLORS.white)
  doc.text(input.mealLabel.toUpperCase(), 196 - badgeWidth / 2, 14.7, { align: 'center' })

  drawMetricCard(doc, 14, 'Nivel', input.nivelLabel, 'neutral')
  drawMetricCard(doc, 60, 'Evaluadas', String(input.total), 'neutral')
  drawMetricCard(doc, 106, 'Cumplen', String(input.passed), 'success')
  drawMetricCard(doc, 152, input.pending ? 'No cumplen / pendientes' : 'No cumplen', input.pending ? `${failed} / ${input.pending}` : String(failed), input.pending ? 'warning' : 'danger')

  doc.setFillColor(...resultFill)
  doc.setDrawColor(...resultColor)
  doc.setLineWidth(0.8)
  doc.roundedRect(14, 61, 182, 14, 2, 2, 'F')
  doc.line(14, 63, 14, 73)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...resultColor)
  doc.text(`RESULTADO FINAL: ${result}`, 20, 67)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(7.8)
  doc.setTextColor(...REPORT_COLORS.slate700)
  const detail = hasRules
    ? `${input.passed} de ${input.total} reglas cumplen para el nivel ${input.nivelLabel}.`
    : `No hay reglas cuantificadas para el nivel ${input.nivelLabel}.`
  doc.text(detail, 20, 71.5)

  return { contentStartY: 82, result }
}

export const drawReportSectionTitle = (doc: jsPDF, title: string, y: number) => {
  doc.setDrawColor(...REPORT_COLORS.orange)
  doc.setLineWidth(1.1)
  doc.line(14, y - 4, 14, y + 2)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(10)
  doc.setTextColor(...REPORT_COLORS.navy)
  doc.text(title, 18, y)
  return y + 4
}

export const addReportContinuationPage = (doc: jsPDF, mealLabel: string) => {
  doc.addPage()
  doc.setFillColor(...REPORT_COLORS.navy)
  doc.rect(0, 0, 210, 12, 'F')
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8)
  doc.setTextColor(...REPORT_COLORS.white)
  doc.text(`CUMPLIMIENTO DE REGLAS - ${mealLabel.toUpperCase()}`, 14, 7.5)
  return 23
}

export const getReportTableOptions = () => ({
  theme: 'plain',
  showHead: 'everyPage',
  rowPageBreak: 'avoid',
  styles: {
    font: 'helvetica',
    fontSize: 7.6,
    textColor: REPORT_COLORS.slate700,
    lineColor: REPORT_COLORS.slate200,
    lineWidth: { bottom: 0.12 },
    cellPadding: { top: 3.2, right: 2.5, bottom: 3.2, left: 2.5 },
    overflow: 'linebreak',
    valign: 'middle',
  },
  headStyles: {
    fillColor: REPORT_COLORS.navy,
    textColor: REPORT_COLORS.white,
    fontStyle: 'bold',
    fontSize: 7.2,
    minCellHeight: 8,
  },
  alternateRowStyles: { fillColor: REPORT_COLORS.slate50 },
  bodyStyles: { fillColor: REPORT_COLORS.white, minCellHeight: 8 },
  margin: { top: 16, right: 14, bottom: 18, left: 14 },
})

export const styleReportStatusCell = (data: {
  section: string
  column: { index: number }
  cell: { raw: unknown; styles: Record<string, unknown> }
}, statusColumnIndex: number) => {
  if (data.section !== 'body' || data.column.index !== statusColumnIndex) return
  const status = String(data.cell.raw ?? '').toLowerCase()
  if (status === 'cumple') {
    data.cell.styles.fillColor = [...REPORT_COLORS.successSoft]
    data.cell.styles.textColor = [...REPORT_COLORS.successDark]
    data.cell.styles.fontStyle = 'bold'
  } else if (status === 'no cumple') {
    data.cell.styles.fillColor = [...REPORT_COLORS.dangerSoft]
    data.cell.styles.textColor = [...REPORT_COLORS.dangerDark]
    data.cell.styles.fontStyle = 'bold'
  } else if (status === 'pendiente') {
    data.cell.styles.fillColor = [...REPORT_COLORS.warningSoft]
    data.cell.styles.textColor = [...REPORT_COLORS.warning]
    data.cell.styles.fontStyle = 'bold'
  }
}

export const drawReportFooters = (doc: jsPDF, mealLabel: string, nivelLabel: string) => {
  const pages = doc.getNumberOfPages()
  for (let page = 1; page <= pages; page += 1) {
    doc.setPage(page)
    doc.setDrawColor(...REPORT_COLORS.slate200)
    doc.setLineWidth(0.25)
    doc.line(14, 284, 196, 284)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.2)
    doc.setTextColor(...REPORT_COLORS.slate500)
    doc.text(`Informe mensual - ${mealLabel} - ${nivelLabel}`, 14, 289)
    doc.text(`Página ${page} de ${pages}`, 196, 289, { align: 'right' })
  }
}
