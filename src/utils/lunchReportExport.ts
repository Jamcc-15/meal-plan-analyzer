import type { LunchGroupKey, LunchGroupSummary, LunchUnrecognizedItem } from '../features/lunch/types/analysis.types.ts'
import type { LunchValidation, ValidationResult } from '../features/lunch/types/rules.types.ts'
import {
  addReportContinuationPage,
  drawReportFooters,
  drawReportHeader,
  drawReportSectionTitle,
  getReportTableOptions,
  REPORT_COLORS,
  styleReportStatusCell,
} from './pdfReportTheme.ts'

export type LunchPdfInput = {
  lunchSummary: LunchGroupSummary[]
  lunchUnrecognized: LunchUnrecognizedItem[]
  lunchValidation: LunchValidation
}

const GROUP_LABELS: Record<LunchGroupKey, string> = {
  entrada: 'Entrada',
  principal: 'Principal',
  acompanamiento: 'Acompañamiento',
  postre: 'Postre',
  bebida: 'Agua',
}

const formatNivel = (nivel: LunchValidation['nivel']) => {
  if (nivel === 'transicion') return 'Transición'
  if (nivel === 'basica') return 'Básica'
  return 'Media'
}

const formatCriterion = (rule: ValidationResult): string => {
  if (rule.producto_base === 'Agua') return 'Diario'
  if (rule.tipo === 'frecuencia') {
    return rule.producto_base === 'Agua' ? 'Frecuencia diaria' : 'Frecuencia mensual'
  }
  if (rule.tipo === 'variedad') return 'Variedad mínima'
  if ('condiciones' in rule) {
    return rule.condiciones.map(formatCriterion).join(`\n${rule.operador}\n`)
  }
  return String(rule.tipo)
}

const formatRule = (rule: ValidationResult): string => {
  if (rule.producto_base === 'Agua') return 'Cumple'
  if (rule.tipo === 'frecuencia') {
    return `${rule.meta.veces} (${rule.meta.limite === 'max' ? 'máx.' : 'mín.'})`
  }
  if (rule.tipo === 'variedad') return `${rule.meta.minima} (mín.)`
  if ('condiciones' in rule) {
    return rule.condiciones.map(formatRule).join(`\n${rule.operador}\n`)
  }
  return String(rule.esperado)
}

const formatVariety = (rule: ValidationResult): string => {
  if (rule.producto_base === 'Agua') return '--'
  if ('variedad' in rule && rule.variedad) return rule.variedad
  return '--'
}

const formatObtained = (rule: ValidationResult): string => {
  if (rule.producto_base === 'Agua' && rule.tipo === 'frecuencia') {
    return `${rule.obtenido} de ${rule.meta.veces}`
  }
  if (rule.tipo === 'frecuencia' || rule.tipo === 'variedad') return String(rule.obtenido)
  if ('condiciones' in rule) {
    return rule.condiciones.map(formatObtained).join(`\n${rule.operador}\n`)
  }
  return String(rule.obtenido)
}

const flattenValidationResult = (rule: ValidationResult): ValidationResult[] => {
  if (rule.tipo !== 'compuesta') return [rule]
  return rule.condiciones.flatMap(flattenValidationResult)
}

export const createLunchPdf = async ({ lunchSummary, lunchUnrecognized, lunchValidation }: LunchPdfInput) => {
  const [{ jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ])
  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pdfDoc = doc as unknown as { lastAutoTable?: { finalY: number } }
  const autoTableFn = autoTable as unknown as (document: unknown, options: Record<string, unknown>) => void
  const tableOptions = getReportTableOptions()
  const total = lunchValidation.all.length
  const passed = lunchValidation.all.filter((rule) => rule.cumple).length
  const nivelLabel = formatNivel(lunchValidation.nivel)
  const header = drawReportHeader(doc, {
    mealLabel: 'Bloque Almuerzo',
    nivelLabel,
    total,
    passed,
  })

  const summaryStartY = drawReportSectionTitle(doc, 'Cumplimiento por grupo', header.contentStartY)
  autoTableFn(doc, {
    ...tableOptions,
    startY: summaryStartY,
    head: [['Grupo', 'Reglas', 'Cumplen', 'Estado']],
    body: Object.values(lunchValidation.grupos).map((group) => {
      const groupPassed = group.resultados.filter((rule) => rule.cumple).length
      return [
        GROUP_LABELS[group.grupo],
        group.resultados.length,
        groupPassed,
        group.resultados.length === 0
          ? 'Pendiente'
          : groupPassed === group.resultados.length ? 'Cumple' : 'No cumple',
      ]
    }),
    columnStyles: {
      0: { cellWidth: 76 },
      1: { halign: 'right', cellWidth: 30 },
      2: { halign: 'right', cellWidth: 30 },
      3: { cellWidth: 46 },
    },
    didParseCell: (data: { section: string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> } }) => {
      styleReportStatusCell(data, 3)
    },
  })

  const nextSectionY = () => {
    const candidate = (pdfDoc.lastAutoTable?.finalY ?? header.contentStartY) + 11
    if (candidate <= 255) return candidate
    return addReportContinuationPage(doc, 'Bloque Almuerzo')
  }

  Object.values(lunchValidation.grupos).forEach((group) => {
    if (group.resultados.length === 0) return
    const title = group.grupo === 'bebida' ? 'Porción de agua' : `Criterios - ${GROUP_LABELS[group.grupo]}`
    const titleY = drawReportSectionTitle(doc, title, nextSectionY())
    autoTableFn(doc, {
      ...tableOptions,
      startY: titleY,
      head: [['Producto base', 'Formato', 'Criterio', 'Regla', 'Obtenido', 'Estado']],
      body: group.resultados.flatMap(flattenValidationResult).map((rule) => [
        rule.producto_base,
        formatVariety(rule),
        formatCriterion(rule),
        formatRule(rule),
        formatObtained(rule),
        rule.cumple ? 'Cumple' : 'No cumple',
      ]),
      columnStyles: {
        0: { cellWidth: 34 },
        1: { cellWidth: 46 },
        2: { cellWidth: 31 },
        3: { cellWidth: 31 },
        4: { halign: 'right', cellWidth: 22 },
        5: { cellWidth: 18 },
      },
      didParseCell: (data: { section: string; column: { index: number }; cell: { raw: unknown; styles: Record<string, unknown> } }) => {
        styleReportStatusCell(data, 4)
      },
    })
  })

  const coverageCandidate = (pdfDoc.lastAutoTable?.finalY ?? 260) + 11
  const coverageSectionY = coverageCandidate <= 230
    ? coverageCandidate
    : addReportContinuationPage(doc, 'Bloque Almuerzo')
  const coverageY = drawReportSectionTitle(doc, 'Cobertura del diccionario', coverageSectionY)
  autoTableFn(doc, {
    ...tableOptions,
    startY: coverageY,
    head: [['Grupo', 'Total', 'Reconocidos', 'No reconocidos', 'Cobertura']],
    body: lunchSummary.map((item) => [
      item.label,
      item.total,
      item.recognized,
      item.unrecognized,
      item.total === 0 ? '0%' : `${Math.round((item.recognized / item.total) * 100)}%`,
    ]),
    columnStyles: {
      0: { cellWidth: 57 },
      1: { halign: 'right', cellWidth: 27 },
      2: { halign: 'right', cellWidth: 35 },
      3: { halign: 'right', cellWidth: 40 },
      4: { halign: 'right', cellWidth: 23 },
    },
  })

  if (lunchUnrecognized.length > 0) {
    const unrecognizedCandidate = (pdfDoc.lastAutoTable?.finalY ?? coverageY) + 11
    const unrecognizedSectionY = unrecognizedCandidate <= 245
      ? unrecognizedCandidate
      : addReportContinuationPage(doc, 'Bloque Almuerzo')
    const unrecognizedY = drawReportSectionTitle(doc, 'Textos no reconocidos', unrecognizedSectionY)
    autoTableFn(doc, {
      ...tableOptions,
      startY: unrecognizedY,
      head: [['Grupo', 'Texto original', 'Cantidad']],
      body: lunchUnrecognized.map((item) => [GROUP_LABELS[item.group], item.text, item.count]),
      headStyles: {
        ...tableOptions.headStyles,
        fillColor: REPORT_COLORS.dangerDark,
      },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 107 },
        2: { halign: 'right', cellWidth: 30 },
      },
    })
  }

  drawReportFooters(doc, 'Bloque Almuerzo', nivelLabel)
  return doc
}

export const exportLunchPdf = async (input: LunchPdfInput) => {
  const doc = await createLunchPdf(input)
  doc.save(`resultados_almuerzo_${new Date().toISOString().slice(0, 10)}.pdf`)
}

export const previewLunchPdf = async (input: LunchPdfInput) => {
  const doc = await createLunchPdf(input)
  const blobUrl = URL.createObjectURL(doc.output('blob'))
  window.open(blobUrl, '_blank', 'noopener,noreferrer')
  window.setTimeout(() => URL.revokeObjectURL(blobUrl), 60_000)
}
