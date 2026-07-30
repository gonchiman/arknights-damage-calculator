export type DamageType = 'physical' | 'arts' | 'true'

export type DamageInput = {
  attack: number
  enemyDefense: number
  enemyResistance: number
  damageType: DamageType
}

export type DamageResult = {
  damage: number
  reduction: number
  damageRate: number
  formula: string
  minimumDamageApplied: boolean
}

const normalize = (value: number, min: number, max = Number.MAX_SAFE_INTEGER) =>
  Math.min(Math.max(Number.isFinite(value) ? value : min, min), max)

export function calculateDamage(input: DamageInput): DamageResult {
  const attack = normalize(input.attack, 0)
  const defense = normalize(input.enemyDefense, 0)
  const resistance = normalize(input.enemyResistance, 0, 100)

  let rawDamage = attack
  let formula = `${attack}`
  let minimumDamageApplied = false

  if (input.damageType === 'physical') {
    const normalDamage = attack - defense
    const minimumDamage = attack * 0.05
    rawDamage = Math.max(normalDamage, minimumDamage)
    minimumDamageApplied = minimumDamage > normalDamage
    formula = `max(${attack} − ${defense}, ${attack} × 5%)`
  }

  if (input.damageType === 'arts') {
    rawDamage = attack * (1 - resistance / 100)
    formula = `${attack} × (1 − ${resistance}%)`
  }

  const damage = Math.round(rawDamage)
  const reduction = Math.max(0, Math.round(attack - rawDamage))
  const damageRate = attack === 0 ? 0 : Math.round((rawDamage / attack) * 1000) / 10

  return {
    damage,
    reduction,
    damageRate,
    formula,
    minimumDamageApplied,
  }
}
