import { useMemo, useState } from 'react'
import './App.css'
import { calculateDamage } from './damage'
import {
  calculateOperatorAttack,
  operators,
  professionLabels,
  type Operator,
  type Profession,
} from './operators'

type ProfessionFilter = 'ALL' | Profession

const defaultOperator =
  operators.find((operator) => operator.id === 'char_002_amiya') ?? operators[0]

if (!defaultOperator) {
  throw new Error('オペレーターデータがありません')
}

function NumericInput({
  id,
  label,
  value,
  onChange,
  min = 0,
  max,
  suffix,
}: {
  id: string
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  suffix?: string
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <span className="number-input">
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(event) => {
            const nextValue = Number(event.target.value)
            onChange(Number.isFinite(nextValue) ? nextValue : min)
          }}
        />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </span>
    </label>
  )
}

function SelectField({
  id,
  label,
  value,
  onChange,
  children,
}: {
  id: string
  label: string
  value: string | number
  onChange: (value: string) => void
  children: React.ReactNode
}) {
  return (
    <label className="field" htmlFor={id}>
      <span>{label}</span>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {children}
      </select>
    </label>
  )
}

function App() {
  const initialPhaseIndex = defaultOperator.phases.length - 1
  const initialPhase = defaultOperator.phases[initialPhaseIndex]

  const [professionFilter, setProfessionFilter] =
    useState<ProfessionFilter>('ALL')
  const [operatorId, setOperatorId] = useState(defaultOperator.id)
  const [phaseIndex, setPhaseIndex] = useState(initialPhaseIndex)
  const [level, setLevel] = useState(initialPhase.maxLevel)
  const [enemyDefense, setEnemyDefense] = useState(300)

  const filteredOperators = useMemo(
    () =>
      professionFilter === 'ALL'
        ? operators
        : operators.filter(
            (operator) => operator.profession === professionFilter,
          ),
    [professionFilter],
  )

  const selectedOperator =
    operators.find((operator) => operator.id === operatorId) ?? defaultOperator
  const selectedPhase =
    selectedOperator.phases[phaseIndex] ?? selectedOperator.phases.at(-1)!
  const attack = calculateOperatorAttack(selectedPhase, level)
  const result = calculateDamage({
    attack,
    enemyDefense,
    enemyResistance: 0,
    damageType: 'physical',
  })
  const dps =
    selectedPhase.attackInterval === 0
      ? 0
      : result.damage / selectedPhase.attackInterval

  const selectOperator = (operator: Operator) => {
    const nextPhaseIndex = operator.phases.length - 1
    setOperatorId(operator.id)
    setPhaseIndex(nextPhaseIndex)
    setLevel(operator.phases[nextPhaseIndex].maxLevel)
  }

  const changeProfession = (value: string) => {
    const nextFilter = value as ProfessionFilter
    setProfessionFilter(nextFilter)

    if (nextFilter !== 'ALL' && selectedOperator.profession !== nextFilter) {
      const firstOperator = operators.find(
        (operator) => operator.profession === nextFilter,
      )

      if (firstOperator) {
        selectOperator(firstOperator)
      }
    }
  }

  const changeOperator = (value: string) => {
    const nextOperator = operators.find((operator) => operator.id === value)

    if (nextOperator) {
      selectOperator(nextOperator)
    }
  }

  const changePhase = (value: string) => {
    const nextPhaseIndex = Number(value)
    const nextPhase = selectedOperator.phases[nextPhaseIndex]

    if (nextPhase) {
      setPhaseIndex(nextPhaseIndex)
      setLevel(nextPhase.maxLevel)
    }
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">ARKNIGHTS TOOL</p>
          <h1>ダメージ計算機</h1>
        </div>
        <span className="version">試作版 v0.2</span>
      </header>

      <div className="calculator-grid">
        <section className="panel input-panel" aria-labelledby="input-title">
          <div className="panel-heading">
            <p className="step">01</p>
            <div>
              <h2 id="input-title">オペレーターと攻撃条件</h2>
              <p>昇進段階とレベルから基礎攻撃力を自動計算します。</p>
            </div>
          </div>

          <div className="fields">
            <SelectField
              id="profession"
              label="職業"
              value={professionFilter}
              onChange={changeProfession}
            >
              <option value="ALL">すべて</option>
              {(Object.entries(professionLabels) as [Profession, string][]).map(
                ([profession, label]) => (
                  <option key={profession} value={profession}>
                    {label}
                  </option>
                ),
              )}
            </SelectField>

            <SelectField
              id="operator"
              label="オペレーター"
              value={selectedOperator.id}
              onChange={changeOperator}
            >
              {filteredOperators.map((operator) => (
                <option key={operator.id} value={operator.id}>
                  ★{operator.rarity} {operator.name}（
                  {professionLabels[operator.profession]}）
                </option>
              ))}
            </SelectField>

            <SelectField
              id="phase"
              label="昇進段階"
              value={phaseIndex}
              onChange={changePhase}
            >
              {selectedOperator.phases.map((phase) => (
                <option key={phase.phase} value={phase.phase}>
                  昇進{phase.phase}
                </option>
              ))}
            </SelectField>

            <NumericInput
              id="level"
              label={`レベル（1〜${selectedPhase.maxLevel}）`}
              value={level}
              onChange={(value) =>
                setLevel(
                  Math.min(
                    Math.max(Math.round(value), 1),
                    selectedPhase.maxLevel,
                  ),
                )
              }
              min={1}
              max={selectedPhase.maxLevel}
            />

            <dl className="operator-stats">
              <div>
                <dt>基礎攻撃力</dt>
                <dd>{attack.toLocaleString('ja-JP')}</dd>
              </div>
              <div>
                <dt>攻撃間隔</dt>
                <dd>{selectedPhase.attackInterval}秒</dd>
              </div>
            </dl>

            <div className="divider" />

            <NumericInput
              id="defense"
              label="敵の防御力"
              value={enemyDefense}
              onChange={setEnemyDefense}
            />
          </div>
        </section>

        <section className="panel result-panel" aria-labelledby="result-title">
          <div className="panel-heading">
            <p className="step">02</p>
            <div>
              <h2 id="result-title">通常攻撃の結果</h2>
              <p>素質・特性・スキルを除いた物理攻撃として計算します。</p>
            </div>
          </div>

          <div className="result-card" aria-live="polite">
            <p className="result-label">単発ダメージ</p>
            <p className="result-value">
              {result.damage.toLocaleString('ja-JP')}
            </p>
            <p className="result-unit">DAMAGE / HIT</p>
          </div>

          <dl className="calculation-details">
            <div>
              <dt>DPS</dt>
              <dd>{dps.toLocaleString('ja-JP', { maximumFractionDigits: 1 })}</dd>
            </div>
            <div>
              <dt>計算式</dt>
              <dd>{result.formula}</dd>
            </div>
            <div>
              <dt>軽減量</dt>
              <dd>{result.reduction.toLocaleString('ja-JP')}</dd>
            </div>
            <div>
              <dt>攻撃力に対する割合</dt>
              <dd>{result.damageRate}%</dd>
            </div>
          </dl>

          {result.minimumDamageApplied && (
            <p className="notice">
              物理ダメージの最低保証（攻撃力の5%）が適用されています。
            </p>
          )}
        </section>
      </div>

      <footer>
        <p>
          基礎ステータスのみを使用し、信頼度・潜在・モジュールも未反映です。
        </p>
      </footer>
    </main>
  )
}

export default App
