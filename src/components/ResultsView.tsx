import type { LiquidSummary } from '../types/liquid-analysis.types.ts'
import type { UnrecognizedItem } from '../types/liquid-analysis.types.ts'
import type { BreakfastValidation, Nivel, ProductDrilldownMap, ValidationResult } from '../features/breakfast/index.ts'
import {
  canonicalizeAddonVarieties,
  splitSolidVarieties,
  summarizeVarietiesTotals,
} from '../features/breakfast/utils/addonAggregation.ts'
import { normalizeText } from '../utils/normalizeText.ts'
import ResultsActions from './results/ResultsActions.tsx'
import ResultsColumn from './results/ResultsColumn.tsx'
import ResultsInsights from './results/ResultsInsights.tsx'
import { PendingSection } from './results/PendingSection.tsx'

type ResultsViewProps = {
  liquidSummary: LiquidSummary
  solidSummary: LiquidSummary
  liquidRaw: Record<string, number>
  solidRaw: Record<string, number>
  unrecognizedItems?: UnrecognizedItem[]
  selectedNivel: Nivel
  breakfastValidation: BreakfastValidation
  liquidDrilldown: ProductDrilldownMap
  solidDrilldown: ProductDrilldownMap
  onInspectProduct: (productBase: string) => void
  onExportPdf: () => Promise<void> | void
  onPreviewPdf: () => Promise<void> | void
}

const separatePendingProducts = (
  varieties: Record<string, Record<string, number>>,
  rules: ValidationResult[],
) => {
  const ruleNames = rules.map((r) => normalizeText(r.producto_base))

  // Accept exact match and close textual matches (contains either way).
  // This avoids sending obvious variants like "yogurt batido" to pending.
  const hasRuleMatch = (normalizedProduct: string) =>
    ruleNames.some(
      (ruleName) =>
        normalizedProduct === ruleName ||
        normalizedProduct.includes(ruleName) ||
        ruleName.includes(normalizedProduct),
    )

  const validated: Record<string, Record<string, number>> = {}
  const pending: Array<{ name: string; count: number }> = []

  Object.entries(varieties).forEach(([productBase, varietyData]) => {
    const normalized = normalizeText(productBase)
    const hasRule = hasRuleMatch(normalized)

    if (hasRule) {
      validated[productBase] = varietyData
    } else {
      const total = Object.values(varietyData).reduce((sum, count) => sum + count, 0)
      pending.push({ name: productBase, count: total })
    }
  })

  return { validated, pending }
}

const ResultsView = ({
  liquidSummary,
  solidSummary,
  liquidRaw,
  solidRaw,
  unrecognizedItems = [],
  selectedNivel,
  breakfastValidation,
  liquidDrilldown,
  solidDrilldown,
  onInspectProduct,
  onExportPdf,
  onPreviewPdf,
}: ResultsViewProps) => {
  const solidVarietySections = splitSolidVarieties(solidSummary.byVariety)
  const canonicalSolidAddons = canonicalizeAddonVarieties(
    solidVarietySections.addons,
    breakfastValidation.porcion_solida,
  )
  const panAddons = summarizeVarietiesTotals(canonicalSolidAddons)
  const unrecognizedTotal = liquidSummary.unrecognizedCount + solidSummary.unrecognizedCount

  // Separar validados vs pendientes
  const liquidSeparated = separatePendingProducts(liquidSummary.byVariety, breakfastValidation.porcion_liquida)
  const solidSeparated = separatePendingProducts(solidVarietySections.structure, breakfastValidation.porcion_solida)
  const allPending = [...liquidSeparated.pending, ...solidSeparated.pending].sort((a, b) =>
    a.name.localeCompare(b.name),
  )

  return (
    <main className="space-y-6">
      <ResultsActions onExportPdf={onExportPdf} onPreviewPdf={onPreviewPdf} />
      <ResultsInsights
        unrecognizedTotal={unrecognizedTotal}
        selectedNivel={selectedNivel}
        breakfastValidation={breakfastValidation}
      />

      {unrecognizedItems.length > 0 ? (
        <section className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm">
          <h3 className="text-sm font-semibold text-rose-800">No reconocidos (diccionario)</h3>
          <p className="mt-1 text-xs text-rose-700">
            Estos textos no tienen mapeo automático en el diccionario actual:
          </p>
          <ul className="mt-3 divide-y divide-rose-200 border-t border-rose-200">
            {unrecognizedItems.map((item) => (
              <li
                key={item.text}
                className="grid grid-cols-[1fr_auto] items-center gap-3 py-2 text-sm"
              >
                <span className="text-slate-800">{item.text}</span>
                <strong className="font-semibold text-rose-700">{item.count}</strong>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-slate-900">Resumen de analisis</h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <ResultsColumn
            title="Porción líquida"
            productTitle="Producto base"
            productData={liquidSummary.byProductBase}
            productRules={breakfastValidation.porcion_liquida}
            productDrilldown={liquidDrilldown}
            accent="liquid"
            varietyTitle="Variedades"
            varietyData={liquidSeparated.validated}
            varietyRuleType="variedad"
            varietyStrictPreferredRuleType
            literalTitle="Detalle literal"
            literalData={liquidRaw}
            onInspectProduct={onInspectProduct}
          />
          <ResultsColumn
            title="Porción sólida"
            productTitle="Producto base"
            productData={solidSummary.byProductBase}
            productRules={breakfastValidation.porcion_solida}
            productDrilldown={solidDrilldown}
            accent="solid"
            varietyTitle="Estructura (variedades)"
            varietyData={solidSeparated.validated}
            varietyRuleType="variedad"
            varietyStrictPreferredRuleType
            detailVarietyTitle="Detalle por pan (informativo)"
            detailVarietyData={canonicalSolidAddons}
            detailVarietyRuleType="frecuencia"
            detailVarietyShowRowStatus
            detailVarietyShowGroupStatus={false}
            detailVarietyShowGroupRuleSummary={false}
            extraLiteralTitle="Agregados globales (decisión)"
            extraLiteralData={panAddons}
            literalTitle="Detalle literal"
            literalData={solidRaw}
            onInspectProduct={onInspectProduct}
          />
        </div>
        {allPending.length > 0 && <PendingSection products={allPending} />}
      </section>
    </main>
  )
}

export default ResultsView
