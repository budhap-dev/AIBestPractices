import type { CSSProperties, ReactNode } from 'react'
import { facts, finale, glossary, meta, sections } from '../content'
import { CountUp, DiagramView } from '../components/Diagrams'
import { DIAGRAM_IDS } from '../components/diagramData'
import { Avatar, Illustration, SCENE_IDS } from '../components/Illustrations'
import { QrCode } from '../components/QrCode'
import { BulbIcon, CodeBlock, Kbd } from '../components/ui'
import { PALETTES, setTheme, useTheme, type Mode } from '../theme'
import { DESIGNS, TRANSITIONS, useDeckControls, type Design, type Transition } from './controls'
import { formatDuration, fullDeck, totalSeconds, type NewWord, type Slide } from './deck'
import { RichText } from '../components/RichText'

// A fragment is shown once the step count passes its position.
const frag = (step: number, k: number, extra = '') => `frag${step > k ? ' is-in' : ''}${extra ? ` ${extra}` : ''}`

// Counted from the app as it runs, for the finale.
const CONTENT_FILES = Object.keys(import.meta.glob('../content/*.json', { eager: true })).length
const LIVE: Record<string, number> = {
  slides: fullDeck.length,
  diagrams: DIAGRAM_IDS.length,
  pictures: SCENE_IDS.length,
  content: CONTENT_FILES,
  terms: glossary.length,
  facts: facts.length,
}

const siteUrl = () => meta.siteUrl || `${location.origin}${location.pathname}`
const promptUrl = `${meta.repoUrl}/blob/main/${meta.buildPrompt}`

function Head({ eyebrow, title, part }: { eyebrow?: string; title: string; part?: string }) {
  return (
    <header className="slide__head">
      {eyebrow && (
        <p className="slide__eyebrow intro">
          {eyebrow}
          {part && <span className="slide__part"> · {part}</span>}
        </p>
      )}
      <h2 className="slide__title intro">
        <RichText text={title} />
      </h2>
    </header>
  )
}

// The first slide to use a glossary term explains it here, before the audience needs it.
function NewWords({ words }: { words?: NewWord[] }) {
  if (!words?.length) return null
  return (
    <div className="newwords intro">
      <p className="newwords__label">{words.length > 1 ? 'New words' : 'New word'}</p>
      <ul>
        {words.map((w) => (
          <li key={w.id} className="newword">
            <dfn>{w.title}</dfn>
            <span className="newword__short">
              <RichText text={w.short} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

// Asha builds the habit, Ben falls into the trap. Revealed last, after the slide's own points.
function Story({ slide, step }: { slide: Slide; step: number }) {
  const s = slide.story
  if (!s?.helps || !s.wrong) return null
  return (
    <div className={frag(step, slide.steps - 1, 'story')}>
      <p className="story__side story__side--helps">
        <Avatar who="asha" />
        <span>
          <span className="story__label">How it helps</span>
          <RichText text={s.helps} />
        </span>
      </p>
      <p className="story__side story__side--wrong">
        <Avatar who="ben" />
        <span>
          <span className="story__label">Wrong practice</span>
          <RichText text={s.wrong} />
        </span>
      </p>
    </div>
  )
}

const navOf = (id?: string) => sections.find((s) => s.id === id)?.nav

const MODES: { id: Mode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

// The finale's live controls: they change the whole app, so the audience sees it isn't a recording.
function LiveControls() {
  const theme = useTheme()
  const deckControls = useDeckControls()
  const c = finale.controls
  const from = (e: React.MouseEvent) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
  }
  return (
    <div className="live-controls">
      <div className="live-controls__pickers">
        <fieldset>
          <legend>{c.colour}</legend>
          <div className="live-controls__swatches">
            {PALETTES.map((p) => (
              <button key={p.id} type="button" data-swatch={p.id} className="swatch" aria-pressed={theme.palette === p.id} onClick={(e) => setTheme({ palette: p.id }, from(e))}>
                <span className="swatch__chip" aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend>{c.appearance}</legend>
          <div className="seg">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={theme.mode === m.id}
                className={theme.mode === m.id ? 'is-on' : undefined}
                onClick={(e) => setTheme({ mode: m.id }, from(e))}
              >
                {m.label}
              </button>
            ))}
          </div>
        </fieldset>
        {deckControls && (
          <div className="live-controls__selects">
            <label>
              <span>{c.design}</span>
              <select value={deckControls.design} onChange={(e) => deckControls.setDesign(e.target.value as Design)}>
                {DESIGNS.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              <span>{c.transition}</span>
              <select value={deckControls.transition} onChange={(e) => deckControls.setTransition(e.target.value as Transition)}>
                {TRANSITIONS.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}
      </div>
      <figure className="live-controls__qr">
        <QrCode value={`${siteUrl()}#/`} label={`QR code: ${c.phone}`} />
        <figcaption>{c.phone}</figcaption>
      </figure>
    </div>
  )
}

// `still` draws the slide without its one-off entrance effects: for the copy that animates out,
// and when stepping back to a slide.
export function SlideView({ slide, step, number, still }: { slide: Slide; step: number; number?: number; still?: boolean }) {
  // The slides being presented: the short talk or the full deck.
  const slides = useDeckControls()?.slides ?? fullDeck
  let body: ReactNode
  switch (slide.kind) {
    case 'title':
      body = (
        <div className="slide__center slide--title-body">
          <p className="slide__eyebrow intro">{meta.company} · Engineering</p>
          <h1 className="slide__hero intro">{meta.headline}</h1>
          <p className="slide__lede intro">{meta.tagline}</p>
          <p className="slide__audience intro">
            <strong>For</strong> {meta.demoAudience}
          </p>
          <p className="slide__by intro">
            {meta.product} · {meta.owner}
          </p>
        </div>
      )
      break

    case 'agenda':
      body = (
        <>
          <Head eyebrow={meta.product} title={slide.title} />
          <p className="slide__lede agenda__time intro">About {formatDuration(totalSeconds(slides))} to read, one point at a time.</p>
          <NewWords words={slide.newWords} />
          <ol className="agenda">
            {sections.map((s, i) => (
              <li key={s.id} className={frag(step, i)}>
                <span className="agenda__num">{String(i + 1).padStart(2, '0')}</span>
                <span className="agenda__nav">{s.nav}</span>
              </li>
            ))}
          </ol>
        </>
      )
      break

    case 'section':
      body = (
        <div className="slide__center divider">
          <span className="divider__num intro" aria-hidden="true">
            {String(slide.number).padStart(2, '0')}
          </span>
          <p className="slide__eyebrow intro">{navOf(slide.section)}</p>
          <h2 className="slide__hero intro">{slide.title}</h2>
          <p className={frag(step, 0, 'slide__lede')}>
            <RichText text={slide.intro} />
          </p>
          {slide.story?.hook && (
            <p className={frag(step, 0, 'divider__hook')}>
              <RichText text={slide.story.hook} />
            </p>
          )}
          <NewWords words={slide.newWords} />
        </div>
      )
      break

    case 'cards':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <NewWords words={slide.newWords} />
          <div className="deck-cards" style={{ '--cols': slide.cards.length } as CSSProperties}>
            {slide.cards.map((c, i) => (
              <article key={c.id} className={frag(step, i, 'deck-card')}>
                {c.kicker && <p className="deck-card__kicker">{c.kicker}</p>}
                <h3>
                  <RichText text={c.title} />
                </h3>
                {c.code && <code className="deck-card__code">{c.code}</code>}
                {c.list && (
                  <ul>
                    {c.list.map((l) => (
                      <li key={l}>
                        <RichText text={l} />
                      </li>
                    ))}
                  </ul>
                )}
                <p>
                  <RichText text={c.body} />
                </p>
                {c.example && (
                  <p className="deck-card__example">
                    <RichText text={c.example} />
                  </p>
                )}
              </article>
            ))}
          </div>
        </>
      )
      break

    case 'detail':
      body = (
        <>
          <Head eyebrow={slide.eyebrow} title={slide.title} />
          <NewWords words={slide.newWords} />
          {slide.tag && <span className="tag slide__tag intro">{slide.tag}</span>}
          <p className="slide__lede intro">
            <RichText text={slide.body} />
          </p>
          {slide.points.map((p, i) => (
            <p key={p.label} className={frag(step, i, 'detail__point')}>
              <strong>{p.label}</strong> <RichText text={p.text} />
            </p>
          ))}
          {slide.code && (
            <div className={frag(step, slide.points.length, 'detail__code')}>
              <CodeBlock code={slide.code.text} label={slide.code.label} />
            </div>
          )}
        </>
      )
      break

    case 'table':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <NewWords words={slide.newWords} />
          <dl className="deck-table">
            {slide.rows.map((r, i) => (
              <div key={r.id} className={frag(step, i, 'deck-table__row')}>
                <dt>
                  {slide.group === 'shortcut' ? (
                    <>
                      <span className="deck-table__action">{r.title}</span>
                      <span className="deck-table__keys">
                        {r.mac && <Kbd keys={r.mac} />}
                        {r.win && <Kbd keys={r.win} />}
                        {!r.mac && !r.win && <code>{r.code}</code>}
                      </span>
                    </>
                  ) : (
                    <code>{r.code}</code>
                  )}
                </dt>
                <dd>
                  <RichText text={r.body} />
                </dd>
              </div>
            ))}
          </dl>
        </>
      )
      break

    case 'steps':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <NewWords words={slide.newWords} />
          <ol className="deck-steps" start={slide.start}>
            {slide.items.map((s, i) => (
              <li key={s.id} className={frag(step, i, 'deck-step')}>
                <span className="deck-step__num" aria-hidden="true">
                  {slide.start + i}
                </span>
                <div>
                  <h3>
                    <RichText text={s.title} />
                  </h3>
                  <p>
                    <RichText text={s.body} />
                  </p>
                  {s.code && (
                    <p className="deck-step__try">
                      <span className="deck-step__try-label">Try</span>
                      <code>{s.code}</code>
                    </p>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </>
      )
      break

    case 'compare':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} part={slide.part} />
          <NewWords words={slide.newWords} />
          <div className="deck-compare">
            {(['do', 'dont'] as const).map((kind) => {
              const list = kind === 'do' ? slide.dos : slide.donts
              const offset = kind === 'do' ? 0 : slide.dos.length
              return (
                <div key={kind} className={`deck-compare__col deck-compare__col--${kind} intro`}>
                  <h3>
                    <span className="dd__icon" aria-hidden="true">
                      {kind === 'do' ? '✓' : '✕'}
                    </span>
                    {kind === 'do' ? 'Do' : 'Don’t'}
                  </h3>
                  <ul>
                    {list.map((r, i) => (
                      <li key={r.id} className={frag(step, offset + i)}>
                        <strong>
                          <RichText text={r.title} />
                        </strong>
                        <span>
                          <RichText text={r.body} />
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>
        </>
      )
      break

    case 'quiz': {
      const q = slide.question
      const revealed = step > q.options.length
      body = (
        <>
          <Head eyebrow={`${navOf(slide.section)} · Scenario ${slide.number} of ${slide.total}`} title={q.scenario} />
          <NewWords words={slide.newWords} />
          <ol className="deck-quiz">
            {q.options.map((o, i) => (
              <li key={i} className={frag(step, i, revealed ? (o.correct ? 'is-correct' : 'is-dim') : '')}>
                <span className="deck-quiz__letter" aria-hidden="true">
                  {String.fromCharCode(65 + i)}
                </span>
                <span>
                  <RichText text={o.text} />
                </span>
                {revealed && o.correct && <span className="visually-hidden"> (correct answer)</span>}
              </li>
            ))}
          </ol>
          <p className={frag(step, q.options.length, 'deck-quiz__why')}>
            <strong>Why:</strong> <RichText text={q.why} />
          </p>
        </>
      )
      break
    }

    case 'diagram':
      body = (
        <>
          <Head eyebrow={slide.eyebrow} title={slide.title} />
          <NewWords words={slide.newWords} />
          <div className="slide__diagram intro">
            <DiagramView id={slide.diagram} step={step} compact />
          </div>
        </>
      )
      break

    case 'facts':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} />
          <NewWords words={slide.newWords} />
          <div className="deck-facts">
            {slide.facts.map((f, i) => (
              <article key={f.id} className={frag(step, i, 'deck-fact')}>
                <span className="deck-fact__icon" aria-hidden="true">
                  <BulbIcon />
                </span>
                <h3>
                  <RichText text={f.title} />
                </h3>
                <p>
                  <RichText text={f.body} />
                </p>
              </article>
            ))}
          </div>
        </>
      )
      break

    case 'stats':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} />
          <NewWords words={slide.newWords} />
          <div className={`deck-stats deck-stats--${slide.tone}`}>
            {slide.findings.map((f, i) => (
              <article key={f.id} className={frag(step, i, 'deck-stat')}>
                <p className="deck-stat__figure">{f.figure}</p>
                <h3>{f.title}</h3>
                <p>{f.body}</p>
                <p className="deck-stat__source">{f.source}</p>
              </article>
            ))}
          </div>
        </>
      )
      break

    case 'summary':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} />
          <NewWords words={slide.newWords} />
          <ol className="deck-summary">
            {slide.items.map((t, i) => (
              <li key={t.id} className={frag(step, i)}>
                <span className="deck-summary__num" aria-hidden="true">
                  {i + 1}
                </span>
                <div>
                  <strong>{t.title}</strong>
                  <span>
                    <RichText text={t.body} />
                  </span>
                </div>
              </li>
            ))}
          </ol>
        </>
      )
      break

    case 'statement':
      body = (
        <>
          <Head eyebrow={navOf(slide.section)} title={slide.title} />
          <NewWords words={slide.newWords} />
          <blockquote className="statement intro">
            <RichText text={slide.text} />
          </blockquote>
        </>
      )
      break

    case 'end':
      body = (
        <div className="slide__center">
          <p className="slide__eyebrow intro">You made it</p>
          <h2 className="slide__hero intro">{slide.title}</h2>
          <p className="slide__lede intro">{meta.closing}</p>
          <p className="slide__by intro">
            {meta.product} · Last reviewed {meta.lastReviewed} · Owner {meta.owner}
          </p>
        </div>
      )
      break

    case 'teaser':
      body = (
        <div className="slide__center teaser">
          <p className="slide__eyebrow intro">{finale.teaser.eyebrow}</p>
          <h2 className="slide__hero teaser__title intro">{slide.title}</h2>
        </div>
      )
      break

    case 'live':
      body = (
        <>
          {/* The "One more thing…" slide peels off to show the app underneath, once, on the way forward. */}
          {!still && (
            <div className="peel" aria-hidden="true">
              <span className="peel__title">{finale.teaser.title}</span>
            </div>
          )}
          <Head eyebrow={finale.live.eyebrow} title={slide.title} />
          <p className="slide__lede intro">{finale.live.body}</p>
          <ul className="live-stats">
            {finale.live.stats.map((s, i) => (
              <li key={s.id} className={frag(step, i, 'live-stat')}>
                <strong>
                  <CountUp to={LIVE[s.id] ?? 0} active={step > i} format={String} />
                </strong>
                <span>{s.label}</span>
              </li>
            ))}
          </ul>
        </>
      )
      break

    case 'controls':
      body = (
        <>
          <Head eyebrow={finale.controls.eyebrow} title={slide.title} />
          <p className="slide__lede intro">{finale.controls.body}</p>
          <div className="intro">
            <LiveControls />
          </div>
        </>
      )
      break

    case 'prompt':
      body = (
        <div className="prompt-finale">
          <div>
            <Head eyebrow={finale.prompt.eyebrow} title={slide.title} />
            <p className="slide__lede intro">{finale.prompt.body}</p>
            <p className="intro">
              <a className="btn btn--primary prompt-finale__link" href={promptUrl} target="_blank" rel="noreferrer">
                {finale.prompt.link}
                <span className="visually-hidden"> (opens in a new tab)</span>
              </a>
            </p>
            <p className="prompt-finale__url intro">{promptUrl.replace(/^https:\/\//, '')}</p>
          </div>
          <figure className="prompt-finale__qr intro">
            <QrCode value={promptUrl} label={`QR code: ${finale.prompt.scan}`} />
            <figcaption>{finale.prompt.scan}</figcaption>
          </figure>
        </div>
      )
      break

    case 'thanks':
      body = (
        <div className="slide__center thanks">
          <p className="slide__eyebrow intro">{finale.thanks.eyebrow}</p>
          <h2 className="slide__hero intro">{slide.title}</h2>
          <p className="slide__lede intro">{finale.thanks.body}</p>
          <p className="slide__by intro">
            {meta.product} · {meta.owner}
          </p>
        </div>
      )
      break
  }

  const framed = slide.kind !== 'teaser'
  return (
    <div className={`slide__frame slide__frame--${slide.kind}${slide.kind === 'live' && !still ? ' has-peel' : ''}`}>
      {slide.scene && <Illustration scene={slide.scene} className="slide__art intro" />}
      <div className={`slide__inner slide--${slide.kind}${slide.scene ? ' has-art' : ''}${slide.story?.helps && slide.story.wrong ? ' has-story' : ''}`}>
        {body}
        <Story slide={slide} step={step} />
      </div>
      {framed && number !== undefined && (
        <footer className="slide__foot" aria-hidden="true">
          <span>
            {meta.product}
            {slide.section && ` · ${navOf(slide.section)}`}
          </span>
          <span>
            {number} / {slides.length}
          </span>
        </footer>
      )}
    </div>
  )
}
