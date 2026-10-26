import { useEffect, useEffectEvent, useRef, useState, type CSSProperties } from 'react'
import { meta, sections } from '../content'
import { celebrate } from '../components/confetti'
import { ThemeMenu } from '../components/ThemeMenu'
import { CopyButton } from '../components/ui'
import { navigate } from '../router'
import { defaultTalk, deckFor, formatDuration, fullDeck, indexIn, secondsFrom, slideSeconds, totalSeconds, type Length, type Slide } from './deck'
import { DESIGNS, DeckControlsContext, LENGTHS, TRANSITIONS, readLength, readTalk, sameTalk, saveLength, saveTalk, type Design, type Transition } from './controls'
import { SlideView } from './Slide'
import './presenter.css'

type Effect = Exclude<Transition, 'random'>

const EFFECTS = TRANSITIONS.map((t) => t.id).filter((id): id is Effect => id !== 'random')
// Random picks a fresh effect for every slide change, never the same one twice in a row.
const randomEffect = (not: Effect) => {
  const pool = EFFECTS.filter((e) => e !== not)
  return pool[Math.floor(Math.random() * pool.length)]
}

type Overlay = 'none' | 'overview' | 'help'

const TRANSITION_KEY = 'cfg-transition'
const DESIGN_KEY = 'cfg-design'
const navOf = (id?: string) => sections.find((s) => s.id === id)?.nav

const SHORTCUTS: [string, string][] = [
  ['→  Space  PgDn', 'Next point or slide'],
  ['←  Shift+Space  PgUp', 'Previous point or slide'],
  ['Home  End', 'First or last slide'],
  ['O', 'Overview of all slides'],
  ['S', 'Switch between the short talk and the full deck'],
  ['F', 'Fullscreen'],
  ['T', 'Next transition style'],
  ['D', 'Next slide design'],
  ['B', 'Blank the screen'],
  ['?', 'Show these shortcuts'],
  ['Esc', 'Close a panel, or leave presenter mode'],
]

function readTransition(): Transition {
  try {
    const t = localStorage.getItem(TRANSITION_KEY)
    return TRANSITIONS.some((x) => x.id === t) ? (t as Transition) : 'slide'
  } catch {
    return 'slide'
  }
}

function readDesign(): Design {
  try {
    const d = localStorage.getItem(DESIGN_KEY)
    return DESIGNS.some((x) => x.id === d) ? (d as Design) : 'classic'
  } catch {
    return 'classic'
  }
}

function save(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Storage blocked: the choice lasts for this visit.
  }
}

export function Presenter({ slide }: { slide: number }) {
  const [length, setLength] = useState<Length>(readLength)
  const [talk, setTalk] = useState<string[]>(readTalk)
  const deck = deckFor(length, talk)
  const LAST = deck.length - 1
  const clamp = (n: number) => Math.min(Math.max(n, 0), LAST)
  const index = clamp(slide - 1)
  const [pos, setPos] = useState({ index, step: 0, dir: 1 })
  const [leaving, setLeaving] = useState<{ slide: Slide; number: number; step: number; key: number } | null>(null)
  const [overlay, setOverlay] = useState<Overlay>('none')
  const [blank, setBlank] = useState(false)
  const [transition, setTransition] = useState<Transition>(readTransition)
  const [design, setDesign] = useState<Design>(readDesign)
  const [effect, setEffect] = useState<Effect>('slide')
  const [idle, setIdle] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const leaveKey = useRef(0)
  const swipe = useRef<{ x: number; y: number } | null>(null)

  // The URL changed from outside (typed, or the back button): show that slide from its first step.
  if (pos.index !== index) setPos({ index, step: 0, dir: index > pos.index ? 1 : -1 })

  const current = deck[index]
  const step = Math.min(pos.step, current.steps)

  function go(to: number, toStep: number) {
    to = clamp(to)
    setBlank(false)
    if (to === index) {
      setPos({ index, step: toStep, dir: pos.dir })
      return
    }
    leaveKey.current += 1
    if (transition === 'random') setEffect(randomEffect(effect))
    setLeaving({ slide: current, number: index + 1, step, key: leaveKey.current })
    setPos({ index: to, step: toStep, dir: to > index ? 1 : -1 })
    navigate({ kind: 'present', slide: to + 1 }, { replace: true })
  }

  function next() {
    if (step < current.steps) {
      go(index, step + 1)
      // The quiz answer is revealed on its last step.
      if (current.kind === 'quiz' && step + 1 === current.steps) celebrate()
    } else if (index < LAST) {
      go(index + 1, 0)
      if (deck[index + 1].kind === 'end' || index + 1 === LAST) celebrate({ size: 'big' })
    }
  }
  const prev = () => (step > 0 ? go(index, step - 1) : index > 0 && go(index - 1, deck[index - 1].steps))

  function exit() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    navigate(current.section ? { kind: 'section', id: current.section } : { kind: 'home' })
  }

  function toggleFullscreen() {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void document.documentElement.requestFullscreen?.().catch(() => {})
  }

  // Switch between the short talk and the full deck, staying on the same slide (or the next one in the talk).
  function chooseLength(l: Length, at = current.id) {
    if (l === length && at === current.id) return
    const to = indexIn(deckFor(l, talk), at)
    setLength(l)
    saveLength(l)
    setBlank(false)
    setPos({ index: to, step: 0, dir: pos.dir })
    navigate({ kind: 'present', slide: to + 1 }, { replace: true })
  }

  // Change which slides the short talk plays. While presenting it, stay on this slide, or the next one still in it.
  function chooseTalk(ids: string[]) {
    setTalk(ids)
    saveTalk(ids)
    if (length !== 'short') return
    const next = deckFor('short', ids)
    const to = indexIn(next, current.id)
    setPos({ index: to, step: next[to].id === current.id ? pos.step : 0, dir: pos.dir })
    navigate({ kind: 'present', slide: to + 1 }, { replace: true })
  }

  function cycleTransition() {
    const i = TRANSITIONS.findIndex((t) => t.id === transition)
    chooseTransition(TRANSITIONS[(i + 1) % TRANSITIONS.length].id)
  }

  function chooseTransition(t: Transition) {
    setTransition(t)
    save(TRANSITION_KEY, t)
  }

  function chooseDesign(d: Design) {
    setDesign(d)
    save(DESIGN_KEY, d)
  }

  function cycleDesign() {
    const i = DESIGNS.findIndex((d) => d.id === design)
    chooseDesign(DESIGNS[(i + 1) % DESIGNS.length].id)
  }

  const onKey = useEffectEvent((e: KeyboardEvent) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return
    const el = e.target as HTMLElement
    if (/^(input|select|textarea)$/i.test(el.tagName)) return
    // Space and Enter already "click" a focused button; don't double up.
    const onButton = el.closest('button, a, summary') !== null

    if (overlay !== 'none') {
      if (e.key === 'Escape' || (overlay === 'overview' && /^[og]$/i.test(e.key)) || (overlay === 'help' && e.key === '?')) {
        e.preventDefault()
        setOverlay('none')
      }
      return
    }

    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
      case 'PageDown':
        e.preventDefault()
        next()
        break
      case ' ':
        if (onButton) return
        e.preventDefault()
        if (e.shiftKey) prev()
        else next()
        break
      case 'ArrowLeft':
      case 'ArrowUp':
      case 'PageUp':
        e.preventDefault()
        prev()
        break
      case 'Home':
        e.preventDefault()
        go(0, 0)
        break
      case 'End':
        e.preventDefault()
        go(LAST, deck[LAST].steps)
        break
      case 'o':
      case 'O':
      case 'g':
        setOverlay('overview')
        break
      case 'f':
      case 'F':
        toggleFullscreen()
        break
      case 't':
      case 'T':
        cycleTransition()
        break
      case 'd':
      case 'D':
        cycleDesign()
        break
      case 's':
      case 'S':
        chooseLength(length === 'short' ? 'full' : 'short')
        break
      case 'b':
      case 'B':
      case '.':
        setBlank((b) => !b)
        break
      case '?':
        setOverlay('help')
        break
      case 'Escape':
        if (blank) setBlank(false)
        else exit()
        break
    }
  })

  useEffect(() => {
    const handler = (e: KeyboardEvent) => onKey(e)
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  // Hide the toolbar and cursor after a few seconds without mouse movement.
  useEffect(() => {
    let timer = window.setTimeout(() => setIdle(true), 2500)
    const wake = () => {
      setIdle(false)
      window.clearTimeout(timer)
      timer = window.setTimeout(() => setIdle(true), 2500)
    }
    window.addEventListener('pointermove', wake)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('pointermove', wake)
    }
  }, [])

  useEffect(() => {
    const onChange = () => setFullscreen(document.fullscreenElement !== null)
    document.addEventListener('fullscreenchange', onChange)
    document.documentElement.classList.add('presenting')
    root.current?.focus({ preventScroll: true })
    return () => {
      document.removeEventListener('fullscreenchange', onChange)
      document.documentElement.classList.remove('presenting')
    }
  }, [])

  useEffect(() => {
    document.title = `${index + 1}/${deck.length} · ${current.title} · ${meta.product}`
  }, [index, current.title, deck.length])

  const progress = (index + (current.steps ? step / (current.steps + 1) : 0)) / LAST

  return (
    <DeckControlsContext.Provider value={{ slides: deck, length, transition, setTransition: chooseTransition, design, setDesign: chooseDesign }}>
      <div
        ref={root}
        data-design={design}
        className={`presenter${idle && overlay === 'none' ? ' is-idle' : ''}`}
        data-transition={transition === 'random' ? effect : transition}
        data-dir={pos.dir > 0 ? 'next' : 'prev'}
        style={{ '--dir': pos.dir } as CSSProperties}
        tabIndex={-1}
        role="region"
        aria-label="Presenter mode"
        aria-roledescription="slide deck"
        onPointerDown={(e) => {
          if (e.pointerType !== 'mouse') swipe.current = { x: e.clientX, y: e.clientY }
        }}
        onPointerUp={(e) => {
          const start = swipe.current
          swipe.current = null
          if (!start) return
          const dx = e.clientX - start.x
          if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(e.clientY - start.y)) {
            if (dx < 0) next()
            else prev()
          }
        }}
      >
        <div className="presenter__bar presenter__bar--top">
          <p className="presenter__where">
            <span className="presenter__product">{meta.product}</span>
            {current.section && <span className="presenter__section">{navOf(current.section)}</span>}
          </p>
          <div className="presenter__tools">
            <div className="presenter__pickers">
              <label className="presenter__select" title="Short talk or full deck (S)">
                <svg className="presenter__select-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M4 6h16M4 12h10M4 18h6" />
                </svg>
                <span className="visually-hidden">Slides to present</span>
                <select value={length} onChange={(e) => chooseLength(e.target.value as Length)}>
                  {LENGTHS.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.label} ({deckFor(l.id, talk).length})
                    </option>
                  ))}
                </select>
                <svg className="presenter__chevron" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </label>
              <label className="presenter__select" title="Slide design (D)">
                <svg className="presenter__select-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="3" y="4" width="18" height="16" rx="2" />
                  <path d="M3 9h18M8 13h8M8 16h5" />
                </svg>
                <span className="visually-hidden">Slide design</span>
                <select value={design} onChange={(e) => chooseDesign(e.target.value as Design)}>
                  {DESIGNS.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.label}
                    </option>
                  ))}
                </select>
                <svg className="presenter__chevron" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </label>
              <label className="presenter__select" title="Transition (T)">
                <svg className="presenter__select-icon" viewBox="0 0 24 24" aria-hidden="true">
                  <rect x="2" y="6" width="12" height="12" rx="2" />
                  <path d="M17 6h3a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-3M14 12h5m-2-2 2 2-2 2" />
                </svg>
                <span className="visually-hidden">Transition</span>
                <select value={transition} onChange={(e) => chooseTransition(e.target.value as Transition)}>
                  {TRANSITIONS.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <svg className="presenter__chevron" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </label>
            </div>
            <ThemeMenu />
            <button type="button" className="btn btn--icon" onClick={() => setOverlay('overview')} aria-label="Overview of all slides (O)" title="Overview (O)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <button type="button" className="btn btn--icon" onClick={toggleFullscreen} aria-label={fullscreen ? 'Exit fullscreen (F)' : 'Fullscreen (F)'} title="Fullscreen (F)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                {fullscreen ? <path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5" /> : <path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" />}
              </svg>
            </button>
            <button type="button" className="btn btn--icon" onClick={() => setOverlay('help')} aria-label="Keyboard shortcuts (?)" title="Shortcuts (?)">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <rect x="2" y="6" width="20" height="12" rx="2" />
                <path d="M6 10h.01M10 10h.01M14 10h.01M18 10h.01M7 14h10" />
              </svg>
            </button>
            <button type="button" className="btn btn--outline btn--sm presenter__exit" onClick={exit}>
              Exit
              <kbd>Esc</kbd>
            </button>
          </div>
        </div>

        <div className="presenter__stage">
          {leaving && (
            <section key={`leave-${leaving.key}`} className="slide slide--leave" aria-hidden="true" inert onAnimationEnd={(e) => e.target === e.currentTarget && setLeaving(null)}>
              <SlideView slide={leaving.slide} step={leaving.step} number={leaving.number} still />
            </section>
          )}
          <section key={index} className="slide slide--enter" aria-roledescription="slide" aria-label={`${index + 1} of ${deck.length}: ${current.title}`}>
            <SlideView slide={current} step={step} number={index + 1} still={pos.dir < 0} />
          </section>
          {blank && <div className="presenter__blank" onClick={() => setBlank(false)} aria-hidden="true" />}
        </div>

        <p className="visually-hidden" aria-live="polite">
          Slide {index + 1} of {deck.length}: {current.title}. About {formatDuration(slideSeconds(current))} to read
          {current.steps > 0 && step < current.steps ? `. ${current.steps - step} more points.` : ''}
        </p>

        <div className="presenter__bar presenter__bar--bottom">
          <div className="presenter__progress" aria-hidden="true">
            <span className="presenter__progress-fill" style={{ transform: `scaleX(${progress})` }} />
            {sections.map((s) => {
              // A tick where each section starts; a short talk may skip a section entirely.
              const at = deck.findIndex((d) => d.section === s.id)
              return at > 0 && <span key={s.id} className="presenter__tick" style={{ left: `${(at / LAST) * 100}%` }} />
            })}
          </div>
          <div className="presenter__nav">
            <span className="presenter__time" title={`Estimated time to read this slide. About ${formatDuration(secondsFrom(deck, index))} of reading left.`}>
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 2" />
              </svg>
              <span>{formatDuration(slideSeconds(current))} read</span>
              <span className="presenter__left">· {formatDuration(secondsFrom(deck, index))} left</span>
            </span>
            <button type="button" className="btn btn--icon" onClick={prev} disabled={index === 0 && step === 0} aria-label="Previous">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </button>
            <span className="presenter__count">
              {index + 1} / {deck.length}
            </span>
            <button type="button" className="btn btn--icon" onClick={next} disabled={index === LAST && step === current.steps} aria-label="Next">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="m9 18 6-6-6-6" />
              </svg>
            </button>
          </div>
        </div>

        {overlay === 'overview' && (
          <Overview
            deck={deck}
            length={length}
            talk={talk}
            onTalk={chooseTalk}
            current={current.id}
            onPick={(id) => {
              setOverlay('none')
              // A slide the short talk skips switches to the full deck at that slide.
              const i = deck.findIndex((s) => s.id === id)
              if (i === -1) chooseLength('full', id)
              else go(i, 0)
              root.current?.focus({ preventScroll: true })
            }}
            onClose={() => {
              setOverlay('none')
              root.current?.focus({ preventScroll: true })
            }}
          />
        )}
        {overlay === 'help' && (
          <div className="presenter__overlay" role="dialog" aria-modal="true" aria-label="Keyboard shortcuts" onClick={() => setOverlay('none')}>
            <div className="presenter__help" onClick={(e) => e.stopPropagation()}>
              <h2>Keyboard shortcuts</h2>
              <dl>
                {SHORTCUTS.map(([keys, what]) => (
                  <div key={keys}>
                    <dt>
                      {keys.split('  ').map((k) => (
                        <kbd key={k}>{k}</kbd>
                      ))}
                    </dt>
                    <dd>{what}</dd>
                  </div>
                ))}
              </dl>
              <p className="muted">On a touch screen, swipe left or right.</p>
              <button type="button" className="btn btn--primary" onClick={() => setOverlay('none')} autoFocus>
                Got it
              </button>
            </div>
          </div>
        )}
      </div>
    </DeckControlsContext.Provider>
  )
}

function Overview({
  deck,
  length,
  talk,
  onTalk,
  current,
  onPick,
  onClose,
}: {
  deck: Slide[]
  length: Length
  talk: string[]
  onTalk: (ids: string[]) => void
  current: string
  onPick: (id: string) => void
  onClose: () => void
}) {
  const active = useRef<HTMLButtonElement>(null)
  // Choosing slides: a click adds a slide to the short talk or takes it out, instead of going to it.
  const [choosing, setChoosing] = useState(false)
  const inTalk = new Set(talk)
  const talkSlides = deckFor('short', talk)
  // The short talk still shows every slide, with the ones it skips dimmed, so any of them is one click away.
  const shown = length === 'short' || choosing ? fullDeck : deck
  const listed = choosing ? talkSlides : deck
  const label = choosing ? LENGTHS[0].label : LENGTHS.find((l) => l.id === length)?.label
  const custom = !sameTalk(talk, defaultTalk)

  useEffect(() => {
    active.current?.focus({ preventScroll: true })
    active.current?.scrollIntoView({ block: 'center' })
  }, [])

  function toggle(id: string) {
    // Keep at least one slide, so there is always something to present.
    if (inTalk.has(id) && talk.length === 1) return
    onTalk(fullDeck.map((s) => s.id).filter((x) => (x === id ? !inTalk.has(x) : inTalk.has(x))))
  }

  return (
    <div className="presenter__overlay presenter__overlay--overview" role="dialog" aria-modal="true" aria-label="All slides">
      <div className="overview__head">
        <h2>
          {label}{' '}
          <span className="overview__total">
            · {listed.length} slides, about {formatDuration(totalSeconds(listed))} to read
          </span>
        </h2>
        <div className="overview__actions">
          {choosing && (
            <>
              <CopyButton text={JSON.stringify(talk, null, 2)} label="Copy for talk.json" />
              <button type="button" className="btn btn--ghost btn--sm" onClick={() => onTalk(defaultTalk)} disabled={!custom}>
                Reset
              </button>
            </>
          )}
          <button type="button" className={`btn btn--sm ${choosing ? 'btn--primary' : 'btn--outline'}`} onClick={() => setChoosing((c) => !c)} aria-pressed={choosing}>
            {choosing ? 'Done' : 'Choose slides'}
          </button>
          <button type="button" className="btn btn--outline btn--sm" onClick={onClose}>
            Close
            <kbd>Esc</kbd>
          </button>
        </div>
      </div>
      {choosing ? (
        <p className="overview__note">
          Click a slide to add it to the {LENGTHS[0].label.toLowerCase()} or take it out. Your pick is saved in this browser
          {custom ? '; Reset goes back to the default.' : '.'} To share it, copy it into <code>src/content/talk.json</code>.
        </p>
      ) : (
        length === 'short' && (
          <p className="overview__note">
            {custom ? 'Your own pick of slides. ' : ''}Dimmed slides are in the full deck only. Pick one to switch to the full deck at that slide.
          </p>
        )
      )}
      <ol className={`overview${choosing ? ' is-choosing' : ''}`}>
        {shown.map((s, i) => {
          const at = listed.findIndex((d) => d.id === s.id)
          const skipped = at === -1
          const isCurrent = s.id === current
          return (
            <li key={s.id} style={{ '--i': Math.min(i, 30) } as CSSProperties}>
              <button
                ref={isCurrent ? active : undefined}
                type="button"
                className={`overview__card overview__card--${s.kind}${isCurrent ? ' is-current' : ''}${skipped ? ' is-skipped' : ''}`}
                aria-current={isCurrent ? 'true' : undefined}
                aria-pressed={choosing ? !skipped : undefined}
                onClick={() => (choosing ? toggle(s.id) : onPick(s.id))}
              >
                <span className="overview__meta">
                  <span className="overview__num">
                    {choosing && <span className="overview__check" aria-hidden="true" />}
                    {skipped ? <span className="overview__full">{choosing ? 'Not in talk' : 'Full deck'}</span> : at + 1}
                  </span>
                  <span className="overview__time">
                    <span className="visually-hidden">Time to read: </span>
                    {formatDuration(slideSeconds(s))}
                  </span>
                </span>
                <span className="overview__section">{navOf(s.section) ?? meta.product}</span>
                <span className="overview__title">{s.title}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
