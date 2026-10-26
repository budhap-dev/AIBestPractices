import { useEffect, useState } from 'react'
import { workflow } from '../content'
import type { ChecklistItem } from '../content/types'
import { celebrate } from './confetti'
import { useToast } from './ui'

const KEY = 'cfg-checklist'

function load(): string[] {
  try {
    const raw = localStorage.getItem(KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(parsed) ? parsed.filter((x): x is string => typeof x === 'string') : []
  } catch {
    return []
  }
}

export function Checklist() {
  const [done, setDone] = useState<string[]>(load)
  const toast = useToast()

  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(done))
    } catch {
      // Storage blocked: ticks last for this visit only.
    }
  }, [done])

  function toggle(id: string, box: HTMLInputElement) {
    const next = done.includes(id) ? done.filter((x) => x !== id) : [...done, id]
    setDone(next)
    // Ticking the last box is worth a small party.
    if (box.checked && workflow.checklist.every((c) => next.includes(c.id))) {
      celebrate({ size: 'big' })
      toast('Checklist done. Commit, then /clear.')
    }
  }
  const phases: ChecklistItem['phase'][] = ['Start', 'During', 'Finish']
  const count = workflow.checklist.filter((c) => done.includes(c.id)).length

  return (
    <div className="checklist card">
      <div className="checklist__head">
        <div>
          <h3>Daily checklist</h3>
          <p className="muted">Ticks are saved in this browser only.</p>
        </div>
        <div className="checklist__count">
          <strong>{count}</strong>/{workflow.checklist.length}
        </div>
      </div>
      <div className="checklist__cols">
        {phases.map((p) => (
          <fieldset key={p}>
            <legend>{p} of a task</legend>
            {workflow.checklist
              .filter((c) => c.phase === p)
              .map((c) => (
                <label key={c.id} className="check">
                  <input type="checkbox" checked={done.includes(c.id)} onChange={(e) => toggle(c.id, e.currentTarget)} />
                  <span>{c.label}</span>
                </label>
              ))}
          </fieldset>
        ))}
      </div>
      <button type="button" className="btn btn--ghost btn--sm" onClick={() => setDone([])} disabled={!count}>
        Reset for the next task
      </button>
    </div>
  )
}
