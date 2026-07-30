import operatorData from './data/operators.json'

export type Profession =
  | 'PIONEER'
  | 'WARRIOR'
  | 'SNIPER'
  | 'TANK'
  | 'MEDIC'
  | 'SUPPORT'
  | 'CASTER'
  | 'SPECIAL'

export type NormalAttackType = 'physical' | 'arts' | 'healing' | 'none'

export type OperatorPhase = {
  phase: number
  maxLevel: number
  attackAtLevel1: number
  attackAtMaxLevel: number
  attackInterval: number
}

export type Operator = {
  id: string
  name: string
  rarity: number
  profession: Profession
  subProfessionId: string
  normalAttackType: NormalAttackType
  phases: OperatorPhase[]
}

export const professionLabels: Record<Profession, string> = {
  PIONEER: '先鋒',
  WARRIOR: '前衛',
  SNIPER: '狙撃',
  TANK: '重装',
  MEDIC: '医療',
  SUPPORT: '補助',
  CASTER: '術師',
  SPECIAL: '特殊',
}

export const operators = operatorData.operators as Operator[]

export function calculateOperatorAttack(
  phase: OperatorPhase,
  requestedLevel: number,
) {
  const level = Math.min(Math.max(Math.round(requestedLevel), 1), phase.maxLevel)

  if (phase.maxLevel === 1) {
    return Math.round(phase.attackAtLevel1)
  }

  const progress = (level - 1) / (phase.maxLevel - 1)
  return Math.round(
    phase.attackAtLevel1 +
      (phase.attackAtMaxLevel - phase.attackAtLevel1) * progress,
  )
}
