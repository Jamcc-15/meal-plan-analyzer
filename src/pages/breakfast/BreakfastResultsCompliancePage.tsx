import { type ReactNode } from 'react'
import EmptyStateCard from '../../components/ui/EmptyStateCard.tsx'
import type { BreakfastValidation, Nivel, ProductDrilldownMap } from '../../features/breakfast/index.ts'
import type { ExcelData } from '../../types/excel.types.ts'
import type { LiquidSummary, UnrecognizedItem } from '../../types/liquid-analysis.types.ts'

type BreakfastResultsCompliancePageProps = {
  data: ExcelData | null
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  breakfastRawLiquid: Record<string, number>
  breakfastRawSolid: Record<string, number>
  unrecognizedItems: UnrecognizedItem[]
  selectedNivel: Nivel
  breakfastValidation: BreakfastValidation
  liquidDrilldown: ProductDrilldownMap
  solidDrilldown: ProductDrilldownMap
  onExportPdf: () => void
  onPreviewPdf: () => void
  onBackToExploration: () => void
  onInspectProduct: (productBase: string) => void
}

type ComplianceRow = {
  section: string
  status: string
  compliance: string
  passed: number
  total: number
}

type ValidationRowData = {
  productoBase: string
  criterio: string
  regla: string
  obtenido: string
  estado: string
}

const numberFormatter = new Intl.NumberFormat('es-CL')

const formatNivelLabel = (nivel: Nivel) => {
  if (nivel === 'transicion') return 'Transición'
  if (nivel === 'basica') return 'Básica'
  return 'Media'
}

const formatCount = (value: number) => numberFormatter.format(value)

const getRuleLabel = (tipo: string) => (tipo === 'frecuencia' ? 'Frec./mes' : 'Variedad')

const getRuleText = (item: BreakfastValidation['porcion_liquida'][number]) => {
  if (item.tipo === 'frecuencia') {
    const prefix = item.meta.limite === 'max' ? 'Máx' : 'Mín'
    const value = typeof item.meta.veces === 'number' ? item.meta.veces : item.esperado
    return `${prefix} ${value}/mes`
  }

  const minimum = typeof item.meta.minima === 'number' ? item.meta.minima : item.esperado
  return `Mín ${minimum} variedad`
}

const getValidationRows = (items: BreakfastValidation['porcion_liquida']) =>
  items.map<ValidationRowData>((item) => ({
    productoBase: item.producto_base,
    criterio: getRuleLabel(item.tipo),
    regla: getRuleText(item),
    obtenido: typeof item.obtenido === 'number' ? formatCount(item.obtenido) : String(item.obtenido),
    estado: item.cumple ? 'Cumple' : 'No cumple',
  }))

const getSectionCompliance = (label: string, items: BreakfastValidation['porcion_liquida']): ComplianceRow => {
  const total = items.length
  const passed = items.filter((item) => item.cumple).length

  return {
    section: label,
    status: passed === total ? 'Cumple' : 'No cumple',
    compliance: `${passed} de ${total}`,
    passed,
    total,
  }
}

const getFinalStatus = (items: Array<BreakfastValidation['porcion_liquida'][number]>) => {
  const total = items.length
  const passed = items.filter((item) => item.cumple).length
  const rejected = passed !== total

  return {
    result: rejected ? 'RECHAZADO' : 'ACEPTADO',
    status: rejected ? 'No cumple' : 'Cumple',
    compliance: `${passed} de ${total}`,
    passed,
    total,
  }
}

const StatusPill = ({ status }: { status: string }) => {
  const normalized = status.toLowerCase()

  if (normalized === 'cumple') {
    return (
      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-semibold text-emerald-700">
        Cumple
      </span>
    )
  }

  return (
    <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-semibold text-rose-700">
      No cumple
    </span>
  )
}

const TableShell = ({
  title,
  children,
  subtitle,
}: {
  title: string
  children: ReactNode
  subtitle?: string
}) => (
  <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 sm:px-5">
      <h3 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-700">{title}</h3>
      {subtitle ? <p className="mt-1 text-xs text-slate-500">{subtitle}</p> : null}
    </div>
    <div className="p-4 sm:p-5">{children}</div>
  </section>
)

const Table = ({
  columns,
  rows,
}: {
  columns: string[]
  rows: ReactNode[]
}) => (
  <div className="overflow-x-auto">
    <table className="min-w-full border-separate border-spacing-0 text-sm">
      <thead>
        <tr>
          {columns.map((column) => (
            <th
              key={column}
              className="border-b border-slate-200 bg-slate-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500"
            >
              {column}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{rows}</tbody>
    </table>
  </div>
)

const MetricCard = ({
  label,
  value,
  accent,
}: {
  label: string
  value: string
  accent: 'neutral' | 'success' | 'danger'
}) => {
  const tone =
    accent === 'success'
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

const RenderValidationTable = ({
  title,
  items,
  onInspectProduct,
}: {
  title: string
  items: BreakfastValidation['porcion_liquida']
  onInspectProduct: (productBase: string) => void
}) => {
  const rows = getValidationRows(items)

  return (
    <TableShell title={title} subtitle="Producto base, criterio, regla, obtenido y estado">
      <Table
        columns={['Producto base', 'Criterio', 'Regla', 'Obtenido', 'Estado']}
        rows={rows.map((row) => (
          <tr key={`${title}-${row.productoBase}-${row.criterio}`} className="align-top">
            <td className="border-b border-slate-100 px-3 py-2.5 text-slate-900">
              <button
                type="button"
                onClick={() => onInspectProduct(row.productoBase)}
                className="text-left font-medium text-slate-900 underline-offset-4 hover:underline"
              >
                {row.productoBase}
              </button>
            </td>
            <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">{row.criterio}</td>
            <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">{row.regla}</td>
            <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">{row.obtenido}</td>
            <td className="border-b border-slate-100 px-3 py-2.5">
              <StatusPill status={row.estado} />
            </td>
          </tr>
        ))}
      />
    </TableShell>
  )
}

const FooterNote = ({
  finalStatus,
  nivel,
}: {
  finalStatus: ReturnType<typeof getFinalStatus>
  nivel: Nivel
}) => (
  <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-600">
          Evaluación mensual
        </p>
        <p className="mt-2 text-lg font-semibold text-slate-900">
          Resultado final:{' '}
          <span className={finalStatus.result === 'ACEPTADO' ? 'text-emerald-700' : 'text-rose-700'}>
            {finalStatus.result}
          </span>{' '}
          <span className="text-slate-500">| Nivel: {formatNivelLabel(nivel)}</span>
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {finalStatus.passed} de {finalStatus.total} reglas cumplen la evaluación mensual.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
          Página 1 de 2
        </p>
        <p className="mt-1 text-sm font-medium text-slate-700">Vista de revisión mensual</p>
      </div>
    </div>
  </section>
)

const BreakfastResultsCompliancePage = ({
  data,
  liquidSummary,
  solidSummary,
  breakfastRawLiquid,
  breakfastRawSolid,
  unrecognizedItems,
  selectedNivel,
  breakfastValidation,
  liquidDrilldown,
  solidDrilldown,
  onExportPdf,
  onPreviewPdf,
  onBackToExploration,
  onInspectProduct,
}: BreakfastResultsCompliancePageProps) => {
  void liquidSummary
  void solidSummary
  void breakfastRawLiquid
  void breakfastRawSolid
  void liquidDrilldown
  void solidDrilldown

  if (!data) {
    return (
      <main className="mx-auto w-full max-w-4xl">
        <EmptyStateCard
          title="No hay archivo cargado"
          description="Para ver resultados, primero debes cargar una minuta en Vista Exploración."
          actionLabel="Ir a Vista Exploración"
          onAction={onBackToExploration}
          centered
        />
      </main>
    )
  }

  const liquidRows = breakfastValidation.porcion_liquida
  const solidRows = breakfastValidation.porcion_solida
  const totalRows = [...liquidRows, ...solidRows]
  const finalStatus = getFinalStatus(totalRows)
  const summaryRows = [
    getSectionCompliance('Porción líquida', liquidRows),
    getSectionCompliance('Porción sólida', solidRows),
    {
      section: 'Total',
      status: finalStatus.status,
      compliance: finalStatus.compliance,
      passed: finalStatus.passed,
      total: finalStatus.total,
    },
  ] satisfies ComplianceRow[]

  return (
    <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-[1.75rem] border border-slate-200 bg-linear-to-br from-white via-slate-50 to-slate-100 p-5 shadow-sm sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Análisis de resultados
            </p>
              <span className="inline-flex rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-orange-700">
                Bloque Desayuno
              </span>
            <h1 className="mt-2 text-2xl font-semibold text-slate-900 sm:text-3xl">
              Cumplimiento de reglas
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">
              Vista tipo informe para revisar el cumplimiento mensual por porción líquida y sólida,
              con detalle de criterio, regla y estado.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={onPreviewPdf}
              className="rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
            >
              Previsualizar PDF
            </button>
            <button
              type="button"
              onClick={onExportPdf}
              className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
            >
              Exportar PDF
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Nivel" value={formatNivelLabel(selectedNivel)} accent="neutral" />
          <MetricCard label="Reglas evaluadas" value={formatCount(finalStatus.total)} accent="neutral" />
          <MetricCard label="Reglas que cumplen" value={formatCount(finalStatus.passed)} accent="success" />
          <MetricCard
            label="Reglas que no cumplen"
            value={formatCount(finalStatus.total - finalStatus.passed)}
            accent="danger"
          />
        </div>
      </section>

      <div className="space-y-6">
        <TableShell
          title="Cumplimiento de reglas"
          subtitle="Sección, estado y porcentaje de cumplimiento global"
        >
          <Table
            columns={['Sección', 'Estado', 'Cumplimiento']}
            rows={summaryRows.map((row) => (
              <tr key={row.section}>
                <td className="border-b border-slate-100 px-3 py-2.5 font-medium text-slate-900">
                  {row.section}
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5">
                  <StatusPill status={row.status} />
                </td>
                <td className="border-b border-slate-100 px-3 py-2.5 text-slate-700">{row.compliance}</td>
              </tr>
            ))}
          />
        </TableShell>

        <FooterNote finalStatus={finalStatus} nivel={selectedNivel} />

        <RenderValidationTable
          title="Criterios – Porción líquida"
          items={liquidRows}
          onInspectProduct={onInspectProduct}
        />

        <RenderValidationTable
          title="Criterios – Porción sólida"
          items={solidRows}
          onInspectProduct={onInspectProduct}
        />

        {unrecognizedItems.length > 0 ? (
          <section className="rounded-2xl border border-rose-200 bg-rose-50/40 p-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-rose-800">
              No reconocidos
            </h2>
            <div className="mt-3 overflow-hidden rounded-xl border border-rose-200 bg-white">
              <table className="min-w-full border-separate border-spacing-0 text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-rose-100 bg-rose-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">
                      Texto
                    </th>
                    <th className="border-b border-rose-100 bg-rose-50 px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-[0.14em] text-rose-700">
                      Cantidad
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {unrecognizedItems.map((item) => (
                    <tr key={item.text}>
                      <td className="border-b border-rose-100 px-3 py-2.5 text-slate-900">
                        {item.text}
                      </td>
                      <td className="border-b border-rose-100 px-3 py-2.5 font-semibold text-rose-700">
                        {formatCount(item.count)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default BreakfastResultsCompliancePage
