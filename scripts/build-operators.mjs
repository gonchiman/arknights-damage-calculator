import { mkdir, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const SOURCE_BASE =
  'https://github.com/ArknightsAssets/ArknightsGamedata/raw/refs/heads/master/jp/gamedata/excel'

const SOURCE_URLS = {
  characters: `${SOURCE_BASE}/character_table.json`,
  patches: `${SOURCE_BASE}/char_patch_table.json`,
}

const PLAYABLE_PROFESSIONS = new Set([
  'PIONEER',
  'WARRIOR',
  'SNIPER',
  'TANK',
  'MEDIC',
  'SUPPORT',
  'CASTER',
  'SPECIAL',
])

async function fetchJson(url) {
  const response = await fetch(url)

  if (!response.ok) {
    throw new Error(`データを取得できませんでした: ${response.status} ${url}`)
  }

  return response.json()
}

function getAttackInterval(attribute) {
  const attackSpeed = attribute.attackSpeed || 100
  return Math.round((attribute.baseAttackTime * 100 * 1000) / attackSpeed) / 1000
}

function getNormalAttackType(character) {
  const description = character.description ?? ''

  if (/攻撃しない|攻撃せず/.test(description)) {
    return 'none'
  }

  if (description.includes('術ダメージ') || description.includes('術攻撃')) {
    return 'arts'
  }

  if (
    character.profession === 'MEDIC' ||
    description.includes('味方のHPを回復') ||
    description.includes('味方を治療') ||
    description.includes('継続回復')
  ) {
    return 'healing'
  }

  if (
    character.profession === 'CASTER' ||
    character.profession === 'SUPPORT'
  ) {
    return 'arts'
  }

  return 'physical'
}

function toOperator([id, character]) {
  const phases = character.phases.map((phase, phaseIndex) => {
    const keyFrames = [...phase.attributesKeyFrames].sort(
      (left, right) => left.level - right.level,
    )
    const firstFrame = keyFrames[0]
    const lastFrame = keyFrames.at(-1)

    if (!firstFrame || !lastFrame) {
      throw new Error(`${id} のステータスデータが不足しています`)
    }

    return {
      phase: phaseIndex,
      maxLevel: phase.maxLevel,
      attackAtLevel1: firstFrame.data.atk,
      attackAtMaxLevel: lastFrame.data.atk,
      attackInterval: getAttackInterval(firstFrame.data),
    }
  })

  return {
    id,
    name: character.name,
    rarity: Number(character.rarity.replace('TIER_', '')),
    profession: character.profession,
    subProfessionId: character.subProfessionId,
    normalAttackType: getNormalAttackType(character),
    phases,
  }
}

const [characterTable, patchTable] = await Promise.all([
  fetchJson(SOURCE_URLS.characters),
  fetchJson(SOURCE_URLS.patches),
])

const operators = Object.entries({
  ...characterTable,
  ...(patchTable.patchChars ?? {}),
})
  .filter(
    ([id, character]) =>
      id.startsWith('char_') &&
      character.isNotObtainable === false &&
      PLAYABLE_PROFESSIONS.has(character.profession) &&
      Array.isArray(character.phases) &&
      character.phases.length > 0,
  )
  .map(toOperator)
  .sort((left, right) => left.name.localeCompare(right.name, 'ja'))

const outputPath = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/data/operators.json',
)

await mkdir(dirname(outputPath), { recursive: true })
await writeFile(
  outputPath,
  `${JSON.stringify(
    {
      sources: Object.values(SOURCE_URLS),
      operators,
    },
    null,
    2,
  )}\n`,
  'utf8',
)

console.log(`${operators.length}人のオペレーターデータを生成しました`)
