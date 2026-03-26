import type { LiquidSummary } from '../types/liquid-analysis.types.ts'
import ResultsActions from './results/ResultsActions.tsx'
import ResultsColumn from './results/ResultsColumn.tsx'
import ResultsInsights from './results/ResultsInsights.tsx'

type ResultsViewProps = {
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  liquidRaw: Record<string, number>
  solidRaw: Record<string, number>
  onExportCsv: () => Promise<void> | void
  onExportPdf: () => Promise<void> | void
  onPreviewPdf: () => Promise<void> | void
}

const normalize = (value: string) =>
  value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

const toSortedEntries = (input: Record<string, number>) =>
  Object.entries(input).sort((a, b) => b[1] - a[1])

const getTopEntry = (input: Record<string, number>) => {
  const [name, value] = toSortedEntries(input)[0] ?? ['--', 0]
  return { name, value }
}


const extractPanAddons = (raw: Record<string, number>) => {
  const addons: Record<string, number> = {}

  Object.entries(raw).forEach(([literal, count]) => {
    const normalized = normalize(literal)
    if (!normalized.includes('pan')) return

    let addon = ''
    const withCon = literal.match(/\bcon\s+(.+)$/i)
    const withShort = literal.match(/\bc\/(.+)$/i)

    if (withCon?.[1]) {
      addon = withCon[1].trim()
    } else if (withShort?.[1]) {
      addon = withShort[1].trim()
    }

    if (!addon) return
    addons[addon] = (addons[addon] ?? 0) + count
  })

  return addons
}

const ResultsView = ({
  liquidSummary,
  solidSummary,
  liquidRaw,
  solidRaw,
  onExportCsv,
  onExportPdf,
  onPreviewPdf,
}: ResultsViewProps) => {
  const panAddons = extractPanAddons(solidRaw)
  const combinedProductBase: Record<string, number> = {}

  Object.entries(liquidSummary.byProductBase).forEach(([name, value]) => {
    combinedProductBase[name] = (combinedProductBase[name] ?? 0) + value
  })
  Object.entries(solidSummary.byProductBase).forEach(([name, value]) => {
    combinedProductBase[name] = (combinedProductBase[name] ?? 0) + value
  })

  const topProduct = getTopEntry(combinedProductBase)
  const topPanAddon = getTopEntry(panAddons)
  const unrecognizedTotal = liquidSummary.unrecognizedCount + solidSummary.unrecognizedCount

  return (
    <main className="space-y-6">
      <ResultsActions
        onExportCsv={onExportCsv}
        onExportPdf={onExportPdf}
        onPreviewPdf={onPreviewPdf}
      />
      <ResultsInsights
        topProduct={topProduct}
        topPanAddon={topPanAddon}
        unrecognizedTotal={unrecognizedTotal}
      />

      <section className="grid gap-6 lg:grid-cols-2">
        <ResultsColumn
          title="Resultados análisis - Desayuno"
          productTitle="Porción líquida (producto base)"
          productData={liquidSummary.byProductBase}
          varietyTitle="Por variedad (porción líquida)"
          varietyData={liquidSummary.byVariety}
          literalTitle="Recuento literal completo (porción líquida)"
          literalData={liquidRaw}
        />
        <ResultsColumn
          title="Resultados análisis - Desayuno"
          productTitle="Porción sólida (producto base)"
          productData={solidSummary.byProductBase}
          varietyTitle="Por variedad / agregados (porción sólida)"
          varietyData={solidSummary.byVariety}
          extraLiteralTitle="Agregados de Pan (porción sólida)"
          extraLiteralData={panAddons}
          literalTitle="Recuento literal completo (porción sólida)"
          literalData={solidRaw}
        />
      </section>
    </main>
  )
}

export default ResultsView
