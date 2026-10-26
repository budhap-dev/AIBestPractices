import { useId, useState } from 'react'
import { CodeBlock } from './ui'

const MODES = ['Ask', 'Plan', 'Agent']

interface Fields {
  mode: string
  goal: string
  files: string
  context: string
  constraints: string
  done: string
  reply: string
}

const EMPTY: Fields = {
  mode: 'Agent',
  goal: '',
  files: '',
  context: '',
  constraints: '',
  done: '',
  reply: 'Keep the reply short: what changed and anything I should check.',
}

const EXAMPLE: Fields = {
  mode: 'Agent',
  goal: 'Fix the invoice total rounding bug: totals are off by 1p when a discount applies.',
  files: 'src/billing/invoice.ts, src/billing/invoice.test.ts',
  context: 'Amounts are stored in pence as integers. The discount is a percentage.',
  constraints: 'Don’t change the public API of calculateTotal. No new dependencies.',
  done: 'A failing test reproduces the bug first, then passes. All billing tests pass.',
  reply: 'Keep the reply short: what changed and anything I should check.',
}

function build(f: Fields) {
  const files = f.files
    .split(/[\s,]+/)
    .filter(Boolean)
    .map((p) => p.replace(/^#(file:)?/, ''))
    .join(', ')
  const lines = [
    files && `Look only at: ${files}`,
    f.goal && `Goal: ${f.goal.trim()}`,
    f.context && `Context: ${f.context.trim()}`,
    f.constraints && `Constraints: ${f.constraints.trim()}`,
    f.done && `Done when: ${f.done.trim()}`,
    f.mode === 'Plan' ? 'Propose a plan first. Don’t edit files yet.' : '',
    f.reply && f.reply.trim(),
  ].filter(Boolean)
  return lines.join('\n')
}

export function PromptBuilder() {
  const [f, setF] = useState<Fields>(EMPTY)
  const id = useId()
  const prompt = build(f)
  const set = (k: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => setF({ ...f, [k]: e.target.value })

  return (
    <div className="builder card">
      <div className="builder__head">
        <div>
          <h3>Prompt builder</h3>
          <p className="muted">Fill in what you know. Empty fields are left out.</p>
        </div>
        <div className="builder__btns">
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setF(EXAMPLE)}>
            Fill example
          </button>
          <button type="button" className="btn btn--ghost btn--sm" onClick={() => setF(EMPTY)}>
            Clear
          </button>
        </div>
      </div>
      <div className="builder__grid">
        <form className="builder__form" onSubmit={(e) => e.preventDefault()}>
          <label className="field">
            <span>Chat mode</span>
            <select value={f.mode} onChange={set('mode')}>
              {MODES.map((m) => (
                <option key={m}>{m}</option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Goal</span>
            <textarea rows={2} value={f.goal} onChange={set('goal')} placeholder="What should change, in one or two sentences" />
          </label>
          <label className="field">
            <span>Files</span>
            <input value={f.files} onChange={set('files')} placeholder="src/a.ts, src/a.test.ts" aria-describedby={`${id}-files`} />
            <small id={`${id}-files`}>In chat, also attach each one with # so Copilot reads only these.</small>
          </label>
          <label className="field">
            <span>Context</span>
            <textarea rows={2} value={f.context} onChange={set('context')} placeholder="Facts Copilot can’t see in the code" />
          </label>
          <label className="field">
            <span>Constraints</span>
            <textarea rows={2} value={f.constraints} onChange={set('constraints')} placeholder="What must not change" />
          </label>
          <label className="field">
            <span>Done when</span>
            <textarea rows={2} value={f.done} onChange={set('done')} placeholder="How you’ll know it worked" />
          </label>
          <label className="field">
            <span>Reply style</span>
            <input value={f.reply} onChange={set('reply')} />
          </label>
        </form>
        <div className="builder__out">
          <p className="builder__mode">
            Paste into <strong>{f.mode}</strong> mode
          </p>
          <CodeBlock code={prompt || 'Your prompt appears here.'} label="Your prompt" />
        </div>
      </div>
    </div>
  )
}
