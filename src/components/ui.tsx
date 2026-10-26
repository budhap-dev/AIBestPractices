import { createContext, useCallback, useContext, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { facts, pageTerms, stories } from '../content'
import type { FunFact, Item, SectionInfo } from '../content/types'
import { href } from '../router'
import { Illustration } from './Illustrations'
import { RichText } from './RichText'

type ShowToast = (message: string) => void

const ToastContext = createContext<ShowToast>(() => {})

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState('')
  const timer = useRef<number | undefined>(undefined)

  const show = useCallback<ShowToast>((text) => {
    setMessage(text)
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => setMessage(''), 2200)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className={`toast${message ? ' toast--on' : ''}`} role="status" aria-live="polite">
        {message}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const toast = useToast()

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
      toast('Copied to clipboard')
    } catch {
      toast('Copy failed: select the text and copy it manually')
    }
  }

  return (
    <button type="button" className="btn btn--ghost btn--sm" onClick={copy} aria-label={`${label}: ${text.slice(0, 60)}`}>
      <CopyIcon />
      <span>{label}</span>
    </button>
  )
}

export function CodeBlock({ code, label }: { code: string; label?: string }) {
  return (
    <div className="code">
      <div className="code__bar">
        <span className="code__label">{label ?? 'Prompt'}</span>
        <CopyButton text={code} />
      </div>
      <pre tabIndex={0}>
        <code>{code}</code>
      </pre>
    </div>
  )
}

export function Source({ item }: { item: Pick<Item, 'sourceUrl' | 'verify'> }) {
  return (
    <span className="source">
      {item.verify && (
        <span className="badge badge--warn" title="Not yet confirmed in the official docs. See VERIFY.md.">
          Needs verification
        </span>
      )}
      {item.sourceUrl && (
        <a href={item.sourceUrl} target="_blank" rel="noreferrer">
          Source<span className="visually-hidden"> (opens in a new tab)</span>
        </a>
      )}
    </span>
  )
}

export function Section({ info, children }: { info: SectionInfo; children: ReactNode }) {
  const scene = stories[`section-${info.id}`]?.scene
  return (
    <section id={info.id} className="section" aria-labelledby={`${info.id}-title`}>
      <header className="section__head">
        {scene && <Illustration scene={scene} className="section__art" />}
        <p className="eyebrow">{info.nav}</p>
        <h2 id={`${info.id}-title`} tabIndex={-1}>
          {info.title}
        </h2>
        <p className="lede">{info.intro}</p>
        <TermLinks id={info.id} />
      </header>
      {children}
      <FunFacts list={facts.filter((f) => f.section === info.id)} />
    </section>
  )
}

// Links every AI or tooling term used anywhere on the page to its plain-English definition.
export function TermLinks({ id }: { id: string }) {
  const terms = pageTerms(id)
  if (!terms.length) return null
  return (
    <p className="term-links">
      <span className="term-links__label">Words on this page</span>
      {terms.map((t) => (
        <a key={t.id} href={href({ kind: 'section', id: 'key-terms', item: t.id })} title={t.short}>
          {t.title}
        </a>
      ))}
    </p>
  )
}

export function FunFacts({ list }: { list: FunFact[] }) {
  if (!list.length) return null
  return (
    <div className="funfacts">
      {list.map((f, i) => (
        <aside key={f.id} id={f.id} className="funfact" aria-labelledby={`${f.id}-title`} style={{ '--i': i } as CSSProperties}>
          <span className="funfact__icon" aria-hidden="true">
            <BulbIcon />
          </span>
          <div>
            <p className="funfact__kicker">Did you know?</p>
            <h3 id={`${f.id}-title`}>{f.title}</h3>
            <p>
              <RichText text={f.body} />
            </p>
            <Source item={f} />
          </div>
        </aside>
      ))}
    </div>
  )
}

export function BulbIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 18h6M10 21h4" />
      <path d="M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1 2V16h5.2v-.2c0-.8.4-1.5 1-2A6 6 0 0 0 12 3Z" />
    </svg>
  )
}

export function Kbd({ keys }: { keys: string }) {
  return (
    <span className="kbd-group">
      {keys.split('+').map((k, i) => (
        <kbd key={i}>{k.trim()}</kbd>
      ))}
    </span>
  )
}

function CopyIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="9" width="12" height="12" rx="2" />
      <path d="M5 15V5a2 2 0 0 1 2-2h10" />
    </svg>
  )
}
