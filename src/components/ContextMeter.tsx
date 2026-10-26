import { useState } from 'react'
import { meter } from '../content'
import type { MeterAction, MeterKind } from '../content/types'

interface Chunk {
  kind: MeterKind
  tokens: number
}

interface State {
  chunks: Chunk[]
  drift: number
  cost: number
  lastCost: number
  log: string[]
}

const KIND_LABEL: Record<MeterKind, string> = {
  instructions: 'Instructions',
  history: 'Chat history',
  files: 'Files & #refs',
  tools: 'Tool output',
}

const fresh = (): State => ({
  chunks: [{ kind: 'instructions', tokens: meter.baseline }],
  drift: 0,
  cost: 0,
  lastCost: 0,
  log: ['New chat: only your instruction files are loaded.'],
})

const total = (s: State) => s.chunks.reduce((n, c) => n + c.tokens, 0)

// Illustrative only: quality holds until the window is half full, then falls,
// and every unrelated topic left in the thread costs a little more.
function quality(s: State) {
  const fill = total(s) / meter.capacity
  const fillPenalty = fill <= 0.5 ? 0 : ((fill - 0.5) / 0.5) * 55
  return Math.max(5, Math.round(100 - fillPenalty - s.drift * 20))
}

const fmt = (n: number) => (n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1)}k` : String(n))

export function ContextMeter() {
  const [state, setState] = useState<State>(fresh)
  const [modelId, setModelId] = useState(meter.models[0].id)
  const model = meter.models.find((m) => m.id === modelId) ?? meter.models[0]

  const used = total(state)
  const fill = Math.min(used / meter.capacity, 1)
  const q = quality(state)

  function act(a: MeterAction) {
    setState((s) => {
      const before = total(s)
      let chunks = [...s.chunks, { kind: a.kind, tokens: a.tokens }]
      const log = [`${a.label}: +${fmt(a.tokens)} tokens`, ...s.log]
      // Full window: the oldest history is summarised away automatically, and detail is lost.
      if (chunks.reduce((n, c) => n + c.tokens, 0) > meter.capacity) {
        chunks = compress(chunks)
        log.unshift('Window full: older turns were squeezed into a summary. Early details are now fuzzy.')
      }
      // Each model call is billed on everything in the window at that moment.
      const after = chunks.reduce((n, c) => n + c.tokens, 0)
      const spent = a.calls * ((before + after) / 2 / 1000) * model.relativeCost
      log[0] += `, ${a.calls > 1 ? `${a.calls} model calls, ` : ''}cost ${spent.toFixed(1)}`
      return {
        chunks,
        drift: s.drift + (a.drift ? 1 : 0),
        cost: s.cost + spent,
        lastCost: spent,
        log: log.slice(0, 6),
      }
    })
  }

  function summarise() {
    setState((s) => ({
      ...s,
      chunks: compress(s.chunks),
      drift: Math.max(0, s.drift - 1),
      log: ['Summarised: decisions kept, exact code and logs dropped.', ...s.log].slice(0, 6),
    }))
  }

  const verdict =
    state.drift > 0 && q >= 55
      ? 'Mixed topics in one chat. Old work now steers new answers: start a new chat.'
      : q >= 80
        ? 'Sharp. Copilot sees what matters.' : q >= 55 ? 'Getting crowded. Consider summarising or a new chat.' : 'Muddled. Start a new chat with a focused prompt.'

  return (
    <div className="meter card" aria-labelledby="meter-title">
      <div className="meter__head">
        <div>
          <h3 id="meter-title">Try it: context meter</h3>
          <p className="muted">Click what you would do in a real chat. Every prompt re-sends the whole window, so the same question costs more in a bloated chat. Numbers are illustrative units, not real limits or prices.</p>
        </div>
        <label className="field field--inline">
          <span>Model</span>
          <select value={modelId} onChange={(e) => setModelId(e.target.value)}>
            {meter.models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.label} ({m.relativeCost}×)
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="meter__bar" role="img" aria-label={`Context window ${Math.round(fill * 100)} percent full`}>
        {state.chunks.map((c, i) => (
          <span key={i} className={`meter__seg meter__seg--${c.kind}`} style={{ width: `${(c.tokens / meter.capacity) * 100}%` }} />
        ))}
        <span className="meter__half" aria-hidden="true" />
      </div>
      <ul className="meter__legend" aria-label="Legend">
        {(Object.keys(KIND_LABEL) as MeterKind[]).map((k) => (
          <li key={k}>
            <span className={`dot meter__seg--${k}`} aria-hidden="true" />
            {KIND_LABEL[k]}
          </li>
        ))}
      </ul>

      <dl className="meter__stats">
        <div>
          <dt>Context used</dt>
          <dd>
            {fmt(used)} / {fmt(meter.capacity)}
          </dd>
        </div>
        <div>
          <dt>Answer quality</dt>
          <dd className={q >= 80 ? 'good' : q >= 55 ? 'warn' : 'bad'}>{q}%</dd>
        </div>
        <div>
          <dt>Cost so far</dt>
          <dd>{state.cost.toFixed(1)}</dd>
        </div>
        <div>
          <dt>Last prompt cost</dt>
          <dd>{state.lastCost.toFixed(1)}</dd>
        </div>
      </dl>
      <p className="meter__verdict" aria-live="polite">
        {verdict}
      </p>

      <div className="meter__actions">
        {meter.actions.map((a) => (
          <button key={a.id} type="button" className="btn btn--soft" onClick={() => act(a)} title={a.detail}>
            {a.label}
            <span className="btn__meta">+{fmt(a.tokens)}</span>
          </button>
        ))}
      </div>
      <div className="meter__resets">
        <button type="button" className="btn btn--primary" onClick={() => setState(fresh())}>
          New chat
        </button>
        <button type="button" className="btn btn--outline" onClick={summarise} disabled={state.chunks.length < 3}>
          Summarise and continue
        </button>
      </div>

      <ol className="meter__log" aria-label="What happened">
        {state.log.map((l, i) => (
          <li key={`${i}-${l}`}>{l}</li>
        ))}
      </ol>
    </div>
  )
}

function compress(chunks: Chunk[]): Chunk[] {
  const [first, ...rest] = chunks
  const kept = rest.slice(-1)
  const squeezed = rest.slice(0, -1).reduce((n, c) => n + c.tokens, 0)
  return [first, { kind: 'history', tokens: Math.round(squeezed * 0.15) }, ...kept]
}
