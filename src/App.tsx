import { useMemo, useState } from 'react'
import './App.css'
import {
  calculateDamage,
  type DamageInput,
  type DamageType,
} from './damage'

const damageTypeLabels: Record<DamageType, string> = {
  physical: '物理',
  arts: '術',
  true: '確定',
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
            onChange(Number.isFinite(nextValue) ? nextValue : 0)
          }}
        />
        {suffix && <span aria-hidden="true">{suffix}</span>}
      </span>
    </label>
  )
}

function App() {
  const [input, setInput] = useState<DamageInput>({
    attack: 1000,
    enemyDefense: 300,
    enemyResistance: 20,
    damageType: 'physical',
  })

  const result = useMemo(() => calculateDamage(input), [input])

  const updateInput = <Key extends keyof DamageInput>(
    key: Key,
    value: DamageInput[Key],
  ) => {
    setInput((current) => ({ ...current, [key]: value }))
  }

  return (
    <main className="app-shell">
      <header className="site-header">
        <div>
          <p className="eyebrow">ARKNIGHTS TOOL</p>
          <h1>ダメージ計算機</h1>
        </div>
        <span className="version">試作版 v0.1</span>
      </header>

      <div className="calculator-grid">
        <section className="panel input-panel" aria-labelledby="input-title">
          <div className="panel-heading">
            <p className="step">01</p>
            <div>
              <h2 id="input-title">攻撃条件</h2>
              <p>現在は手動入力による単発ダメージ計算に対応しています。</p>
            </div>
          </div>

          <div className="fields">
            <NumericInput
              id="attack"
              label="攻撃力"
              value={input.attack}
              onChange={(value) => updateInput('attack', value)}
            />

            <fieldset className="damage-types">
              <legend>ダメージ種別</legend>
              <div className="segmented-control">
                {(Object.keys(damageTypeLabels) as DamageType[]).map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="damageType"
                      value={type}
                      checked={input.damageType === type}
                      onChange={() => updateInput('damageType', type)}
                    />
                    <span>{damageTypeLabels[type]}</span>
                  </label>
                ))}
              </div>
            </fieldset>

            <div className="divider" />

            <NumericInput
              id="defense"
              label="敵の防御力"
              value={input.enemyDefense}
              onChange={(value) => updateInput('enemyDefense', value)}
            />

            <NumericInput
              id="resistance"
              label="敵の術耐性"
              value={input.enemyResistance}
              onChange={(value) => updateInput('enemyResistance', value)}
              max={100}
              suffix="%"
            />
          </div>
        </section>

        <section className="panel result-panel" aria-labelledby="result-title">
          <div className="panel-heading">
            <p className="step">02</p>
            <div>
              <h2 id="result-title">計算結果</h2>
              <p>1回の攻撃で与える推定ダメージです。</p>
            </div>
          </div>

          <div className="result-card" aria-live="polite">
            <p className="result-label">
              {damageTypeLabels[input.damageType]}ダメージ
            </p>
            <p className="result-value">
              {result.damage.toLocaleString('ja-JP')}
            </p>
            <p className="result-unit">DAMAGE / HIT</p>
          </div>

          <dl className="calculation-details">
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
        <p>通常攻撃の基本式を確認するための初期実装です。</p>
      </footer>
    </main>
  )
}

export default App
