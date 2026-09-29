import acompanamientoRulesData from './acompanamiento.rules.json'
import bebidaRulesData from './bebida.rules.json'
import entradaRulesData from './entrada.rules.json'
import postreRulesData from './postre.rules.json'
import principalRulesData from './principal.rules.json'
import type { LunchGroupKey } from '../types/analysis.types.ts'
import type { LunchRuleFile, LunchRulesByGroup } from '../types/rules.types.ts'

const asRuleFile = (value: unknown, expectedGroup: LunchGroupKey): LunchRuleFile => {
  if (!value || typeof value !== 'object') {
    throw new Error(`Archivo de reglas inválido para ${expectedGroup}`)
  }

  const candidate = value as Record<string, unknown>
  if (
    candidate.grupo !== expectedGroup ||
    !Array.isArray(candidate.transicion) ||
    !Array.isArray(candidate.basica) ||
    !Array.isArray(candidate.media) ||
    !Array.isArray(candidate.pendientes)
  ) {
    throw new Error(`Estructura de reglas inválida para ${expectedGroup}`)
  }

  return candidate as unknown as LunchRuleFile
}

const lunchRules: LunchRulesByGroup = {
  entrada: asRuleFile(entradaRulesData, 'entrada'),
  principal: asRuleFile(principalRulesData, 'principal'),
  acompanamiento: asRuleFile(acompanamientoRulesData, 'acompanamiento'),
  postre: asRuleFile(postreRulesData, 'postre'),
  bebida: asRuleFile(bebidaRulesData, 'bebida'),
}

export const loadLunchRules = (group: LunchGroupKey): LunchRuleFile => lunchRules[group]

export const loadAllLunchRules = (): LunchRulesByGroup => lunchRules
