import type { ValidationResult } from '../types/rules.types.ts'
import { findRuleByLabel, isMermeladaLike } from './ruleMatching.ts'

const MERMELADA_CANONICAL_LABEL = 'Mermelada con fruta o Dulce de membrillo'

export const splitSolidVarieties = (input: Record<string, Record<string, number>>) => {
  const structure: Record<string, Record<string, number>> = {}
  const addons: Record<string, Record<string, number>> = {}

  Object.entries(input).forEach(([productBase, varieties]) => {
    if (productBase === 'Pan blanco' || productBase === 'Pan integral') {
      addons[productBase] = varieties
      return
    }

    structure[productBase] = varieties
  })

  return { structure, addons }
}

const resolveMermeladaCanonicalLabel = (rules: ValidationResult[], label: string): string | null => {
  if (!isMermeladaLike(label)) return null

  const mermeladaRule = rules.find((rule) => isMermeladaLike(rule.producto_base))
  return mermeladaRule?.producto_base ?? MERMELADA_CANONICAL_LABEL
}

const findCanonicalRuleLabel = (rules: ValidationResult[], label: string): string | null => {
  const preferred = findRuleByLabel(rules, label, 'frecuencia') ?? findRuleByLabel(rules, label)
  return preferred?.producto_base ?? null
}

export const canonicalizeAddonVarieties = (
  addons: Record<string, Record<string, number>>,
  rules: ValidationResult[],
) => {
  const result: Record<string, Record<string, number>> = {}

  Object.entries(addons).forEach(([productBase, varieties]) => {
    const normalizedVarieties: Record<string, number> = {}

    Object.entries(varieties).forEach(([label, count]) => {
      const canonicalLabel =
        findCanonicalRuleLabel(rules, label) ??
        resolveMermeladaCanonicalLabel(rules, label) ??
        label

      normalizedVarieties[canonicalLabel] = (normalizedVarieties[canonicalLabel] ?? 0) + count
    })

    result[productBase] = normalizedVarieties
  })

  return result
}

export const summarizeVarietiesTotals = (input: Record<string, Record<string, number>>) => {
  const totals: Record<string, number> = {}

  Object.values(input).forEach((varieties) => {
    Object.entries(varieties).forEach(([variety, count]) => {
      totals[variety] = (totals[variety] ?? 0) + count
    })
  })

  return totals
}
