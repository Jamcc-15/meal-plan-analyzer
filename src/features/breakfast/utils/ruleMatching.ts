import type { ValidationResult } from '../types/rules.types.ts'
import { normalizeText } from '../../../utils/normalizeText.ts'

const RULE_FALLBACK_TOKENS = [
  'huevo',
  'tomate',
  'queso',
  'pechuga',
  'pavo',
  'pollo',
  'palta',
  'miel',
  'mermelada',
  'membrillo',
] as const

const FORCED_FRECUENCIA_TOKENS = [
  'huevo',
  'tomate',
  'queso',
  'pechuga',
  'pavo',
  'pollo',
  'palta',
  'miel',
] as const

export const splitAlternatives = (value: string): string[] => {
  const normalized = normalizeText(value)
  if (!normalized) return []

  const alternatives = normalized
    .split(/\s+o\s+/)
    .map((item) => item.trim())
    .filter(Boolean)

  return alternatives.length > 0 ? alternatives : [normalized]
}

export const isMermeladaLike = (label: string): boolean => {
  const normalized = normalizeText(label)
  return normalized.includes('mermelada') || normalized.includes('membrillo')
}

const normalizeComparable = (value: string): string => {
  const normalized = normalizeText(value).trim()
  if (!normalized) return normalized

  // Singular/plural normalization for robust matching (e.g., cereal/cereales).
  const words = normalized.split(/\s+/).map((word) => {
    if (word.length > 4 && word.endsWith('es')) return word.slice(0, -2)
    if (word.length > 3 && word.endsWith('s')) return word.slice(0, -1)
    return word
  })

  return words.join(' ')
}

const extractMatchingToken = <T extends readonly string[]>(
  label: string,
  tokens: T,
): T[number] | undefined => {
  const normalized = normalizeText(label)
  if (!normalized) return undefined
  return tokens.find((item) => normalized.includes(item))
}

const findExactMatches = (rules: ValidationResult[], label: string): ValidationResult[] => {
  const normalizedLabel = normalizeComparable(label)
  if (!normalizedLabel) return []

  return rules.filter((rule) =>
    splitAlternatives(rule.producto_base).some(
      (token) => normalizeComparable(token) === normalizedLabel,
    ),
  )
}

const findFallbackMatches = (rules: ValidationResult[], label: string): ValidationResult[] => {
  const token = extractMatchingToken(label, RULE_FALLBACK_TOKENS)
  if (!token) return []

  return rules.filter((rule) => normalizeText(rule.producto_base).includes(token))
}

export const findRuleByLabel = (
  rules: ValidationResult[],
  label: string,
  preferredRuleType?: ValidationResult['tipo'],
  strictPreferredRuleType = false,
): ValidationResult | undefined => {
  const exactMatches = findExactMatches(rules, label)
  const matches = exactMatches.length > 0 ? exactMatches : findFallbackMatches(rules, label)

  if (matches.length === 0) return undefined
  if (!preferredRuleType) return matches[0]

  const preferredMatch = matches.find((item) => item.tipo === preferredRuleType)
  if (strictPreferredRuleType) return preferredMatch
  return preferredMatch ?? matches[0]
}

export const shouldPreferVariedadForAddon = (label: string): boolean => {
  return isMermeladaLike(label)
}

export const shouldForceFrecuenciaForAddon = (label: string): boolean => {
  return Boolean(extractMatchingToken(label, FORCED_FRECUENCIA_TOKENS))
}

export const findMermeladaVariedadRule = (rules: ValidationResult[]): ValidationResult | undefined =>
  rules.find((rule) => {
    if (rule.tipo !== 'variedad') return false
    return isMermeladaLike(rule.producto_base)
  })
