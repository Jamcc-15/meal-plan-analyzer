import { type ReactNode } from 'react'
import EmptyStateCard from '../../components/ui/EmptyStateCard.tsx'
import type {
  LunchGroupKey,
  LunchGroupSummary,
  LunchAnalysisRow,
  LunchUnrecognizedItem,
} from '../../features/lunch/types/analysis.types.ts'
import type { LunchValidation, ValidationResult } from '../../features/lunch/types/rules.types.ts'
import type { ExcelData } from '../../types/excel.types.ts'

type LunchResultsPageProps = {
  data: ExcelData | null
  lunchSummary: LunchGroupSummary[]
  lunchRows: LunchAnalysisRow[]
  lunchUnrecognized: LunchUnrecognizedItem[]
  lunchValidation: LunchValidation
  onExportPdf: () => Promise<void> | void
  onPreviewPdf: () => Promise<void> | void
}

const GROUP_LABELS: Record<LunchGroupKey, string> = {
  entrada: 'Entrada',
  principal: 'Principal',
  acompanamiento: 'Acompañamiento',
  postre: 'Postre',
  bebida: 'Bebida',
}

const formatNivelLabel = (nivel: LunchValidation['nivel']) => {
  if (nivel === 'transicion') return 'Transición'
  if (nivel === 'basica') return 'Básica'
  return 'Media'
}

const formatRuleType = (rule: ValidationResult): string => {
  if (rule.tipo === 'frecuencia') return 'Frecuencia mensual'
  if (rule.tipo === 'variedad') return 'Variedad mínima'
  if ('condiciones' in rule) {
    return rule.condiciones.map(formatRuleType).join(`\n${rule.operador}\n`)
  }
  return String(rule.tipo)
}

const formatRuleText = (rule: ValidationResult): string => {
  if (rule.tipo === 'frecuencia') {
    return `${rule.meta.limite === 'max' ? 'Máximo' : 'Mínimo'}: ${rule.meta.veces} veces`
  }
  if (rule.tipo === 'variedad') return `Mínimo: ${rule.meta.minima} variedades`
  if ('condiciones' in rule) {
    return rule.condiciones.map(formatRuleText).join(`\n${rule.operador}\n`)
  }
  return String(rule.esperado)
}

const formatObtained = (rule: ValidationResult): string => {
  if (rule.tipo === 'frecuencia') return `${rule.obtenido} veces`
  if (rule.tipo === 'variedad') return `${rule.obtenido} variedades`
  if ('condiciones' in rule) {
    return rule.condiciones.map(formatObtained).join(`\n${rule.operador}\n`)
  }
  return String(rule.obtenido)
}

const flattenValidationResult = (rule: ValidationResult): ValidationResult[] => {
  if (rule.tipo !== 'compuesta') return [rule]
  return rule.condiciones.flatMap(flattenValidationResult)
}

const groupValidationResults = (rules: ValidationResult[]): ValidationResult[][] => {
  const groups = new Map<string, ValidationResult[]>()
  rules.forEach((rule) => {
    const group = groups.get(rule.producto_base) ?? []
    group.push(rule)
    groups.set(rule.producto_base, group)
  })
  return Array.from(groups.values())
}

const StatusPill = ({ status }: { status: 'cumple' | 'no_cumple' | 'pendiente' }) => {
  const style = status === 'cumple'
    ? 'bg-emerald-100 text-emerald-700'
    : status === 'no_cumple'
      ? 'bg-rose-100 text-rose-700'
      : 'bg-amber-100 text-amber-700'
  const label = status === 'cumple' ? 'Cumple' : status === 'no_cumple' ? 'No cumple' : 'Pendiente'
  return <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${style}`}>{label}</span>
}

const TableShell = ({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>
)

const Table = ({ columns, rows }: { columns: string[]; rows: ReactNode[] }) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column} className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
)

const MetricCard = ({ label, value, accent }: { label: string; value: string; accent: 'neutral' | 'success' | 'danger' }) => {
  const tone = accent === 'success'
    ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
    : accent === 'danger'
      ? 'border-rose-200 bg-rose-50 text-rose-700'
      : 'border-slate-200 bg-white text-slate-700'
  return (
    <div className={`rounded-2xl border px-4 py-3 ${tone}`}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] opacity-80">{label}</p>
      <p className="mt-1 text-lg font-semibold">{value}</p>
    </div>
  )
}

const DetectionLog = ({ rows }: { rows: LunchAnalysisRow[] }) => (
  <details className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50">
    <summary className="cursor-pointer px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
      Ver detección de ruteo ({rows.length} filas)
    </summary>
    <div className="overflow-x-auto border-t border-slate-200 bg-white px-3 py-3">
      {rows.length === 0 ? (
        <p className="text-xs text-slate-500">No hay filas para este grupo.</p>
      ) : (
        <table className="min-w-full text-xs">
          <thead>
            <tr className="text-left text-[10px] uppercase tracking-[0.12em] text-slate-500">
              <th className="px-2 py-2">Texto original</th>
              <th className="px-2 py-2">Normalizado</th>
              <th className="px-2 py-2">Producto base</th>
              <th className="px-2 py-2">Variedad</th>
              <th className="px-2 py-2">Estado</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.normalizedText}-${index}`} className="border-t border-slate-100 align-top">
                <td className="px-2 py-2 text-slate-900">{row.text}</td>
                <td className="px-2 py-2 text-slate-500">{row.normalizedText}</td>
                <td className="px-2 py-2 text-slate-700">{row.productBase ?? 'Sin clasificación'}</td>
                <td className="px-2 py-2 text-slate-700">{row.variety ?? '--'}</td>
                <td className={`px-2 py-2 font-semibold ${row.recognized ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {row.recognized ? 'Reconocido' : 'No reconocido'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  </details>
)

const LunchResultsPage = ({
  data,
  lunchSummary,
  lunchRows,
  lunchUnrecognized,
  lunchValidation,
  onExportPdf,
  onPreviewPdf,
}: LunchResultsPageProps) => {
  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <EmptyStateCard
          title="No hay archivo cargado"
          description="Para ver resultados, primero debes cargar una minuta en Vista Exploración."
          centered
        />
      </main>
    )
  }

  const total = lunchValidation.all.length
  const passed = lunchValidation.all.filter((rule) => rule.cumple).length
  const failed = total - passed
  const finalResult = total === 0 ? 'SIN EVALUACIÓN' : failed === 0 ? 'ACEPTADO' : 'RECHAZADO'
  const summaryRows = Object.values(lunchValidation.grupos).map((group) => {
    const groupTotal = group.resultados.length
    const groupPassed = group.resultados.filter((rule) => rule.cumple).length
    return { ...group, total: groupTotal, passed: groupPassed }
  })

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">Análisis de resultados</p>
            <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
              Bloque Almuerzo
            </span>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">Cumplimiento de reglas</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Vista tipo informe para revisar el cumplimiento mensual por entrada, principal,
              acompañamiento, postre y bebida, con detalle de criterio, regla y estado.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={onPreviewPdf} className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50">
              Previsualizar PDF
            </button>
            <button type="button" onClick={onExportPdf} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800">
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Nivel" value={formatNivelLabel(lunchValidation.nivel)} accent="neutral" />
          <MetricCard label="Reglas evaluadas" value={String(total)} accent="neutral" />
          <MetricCard label="Reglas que cumplen" value={String(passed)} accent="success" />
          <MetricCard label="Reglas que no cumplen" value={String(failed)} accent="danger" />
        </div>
      </section>

      <TableShell title="Cumplimiento de reglas" subtitle="Grupo, estado y cumplimiento global">
        <Table
          columns={['Grupo', 'Estado', 'Cumplimiento']}
          rows={summaryRows.map((group) => (
            <tr key={group.grupo}>
              <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-slate-900">{GROUP_LABELS[group.grupo]}</td>
              <td className="border-b border-slate-100 px-3 py-2.5">
                <StatusPill status={group.total === 0 ? 'pendiente' : group.passed === group.total ? 'cumple' : 'no_cumple'} />
              </td>
              <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">
                {group.total === 0 ? 'Sin reglas definidas' : `${group.passed} de ${group.total}`}
              </td>
            </tr>
          ))}
        />
      </TableShell>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">Evaluación mensual</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              Resultado final:{' '}
              <span className={finalResult === 'ACEPTADO' ? 'text-emerald-700' : finalResult === 'RECHAZADO' ? 'text-rose-700' : 'text-amber-700'}>{finalResult}</span>{' '}
              <span className="text-slate-500">| Nivel: {formatNivelLabel(lunchValidation.nivel)}</span>
            </p>
            <p className="mt-1 text-sm text-slate-600">{passed} de {total} reglas definidas cumplen la evaluación mensual.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">Bloque Almuerzo</p>
            <p className="mt-1 text-sm font-medium text-slate-700">Vista de revisión mensual</p>
          </div>
        </div>
      </section>

      {summaryRows.filter((group) => group.resultados.length > 0).map((group) => (
        <TableShell key={group.grupo} title={`Criterios – ${GROUP_LABELS[group.grupo]}`} subtitle="Producto base, criterio, regla, obtenido y estado">
          <Table
            columns={['Producto base', 'Criterio', 'Regla', 'Obtenido', 'Estado']}
            rows={groupValidationResults(group.resultados.flatMap(flattenValidationResult)).flatMap((rules) => rules.map((rule, index) => (
              <tr key={rule.ruleId} className="align-top">
                {index === 0 ? (
                  <td rowSpan={rules.length} className="border-b border-t-4 border-slate-300 border-l-2 border-l-orange-200 px-3 py-2.5 align-top font-medium text-slate-900">
                    {rule.producto_base}
                  </td>
                ) : null}
                <td className={`whitespace-pre-line border-b border-slate-100 px-3 py-2.5 text-slate-700 ${index === 0 ? 'border-t-4 border-slate-300' : ''}`}>{formatRuleType(rule)}</td>
                <td className={`whitespace-pre-line border-b border-slate-100 px-3 py-2.5 text-slate-700 ${index === 0 ? 'border-t-4 border-slate-300' : ''}`}>{formatRuleText(rule)}</td>
                <td className={`whitespace-pre-line border-b border-slate-100 px-3 py-2.5 text-slate-700 ${index === 0 ? 'border-t-4 border-slate-300' : ''}`}>{formatObtained(rule)}</td>
                <td className={`border-b border-slate-100 px-3 py-2.5 ${index === 0 ? 'border-t-4 border-slate-300' : ''}`}><StatusPill status={rule.cumple ? 'cumple' : 'no_cumple'} /></td>
              </tr>
            )))}
          />
          <DetectionLog rows={lunchRows.filter((row) => row.group === group.grupo)} />
        </TableShell>
      ))}

      {lunchUnrecognized.length > 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
          <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-800">No reconocidos</h2>
          <div className="mt-3 overflow-hidden rounded-xl border border-rose-200 bg-white">
            <Table
              columns={['Grupo', 'Texto', 'Cantidad']}
              rows={lunchUnrecognized.map((item) => (
                <tr key={`${item.group}-${item.normalizedText}`}>
                  <td className="border-b border-rose-100 px-3 py-2.5 text-slate-700">{GROUP_LABELS[item.group]}</td>
                  <td className="border-b border-rose-100 px-3 py-2.5 text-slate-900">{item.text}</td>
                  <td className="border-b border-rose-100 px-3 py-2.5 font-semibold text-rose-700">{item.count}</td>
                </tr>
              ))}
            />
          </div>
        </section>
      ) : null}

      <TableShell title="Resumen de reconocimiento" subtitle="Cobertura del diccionario por grupo de almuerzo">
        <Table
          columns={['Grupo', 'Total', 'Reconocidos', 'No reconocidos']}
          rows={lunchSummary.map((item) => (
            <tr key={item.group}>
              <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-slate-900">{item.label}</td>
              <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">{item.total}</td>
              <td className="border-b border-slate-100 px-3 py-2.5 text-emerald-700">{item.recognized}</td>
              <td className="border-b border-slate-100 px-3 py-2.5 text-rose-700">{item.unrecognized}</td>
            </tr>
          ))}
        />
      </TableShell>
    </main>
  )
}

export default LunchResultsPage
