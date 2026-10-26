// Builds the presenter deck from the guide content. Edit the JSON in src/content, not this file.
import {
  beyond,
  commands,
  contextSources,
  facts,
  finale,
  glossary,
  memoryFiles,
  meta,
  modes,
  opening,
  quiz,
  rules,
  sections,
  security,
  stories,
  takeaways,
  talk,
  templates,
  termsIn,
  textOf,
  workflow,
} from '../content'
import { ACTION_LABEL, GROUPS, RULE_GROUPS } from '../content/labels'
import type { Command, Factor, Finding, FunFact, GlossaryTerm, QuizQuestion, Rule, SceneId, SlideStory, Takeaway } from '../content/types'
import { diagramSteps, diagramText, type DiagramId } from '../components/diagramData'

export interface Card {
  id: string
  title: string
  body: string
  kicker?: string
  example?: string
  code?: string
  list?: string[]
}

export type NewWord = Pick<GlossaryTerm, 'id' | 'title' | 'short'>

interface Base {
  id: string
  // Section this slide belongs to; exiting the presenter returns to its page.
  section?: string
  title: string
  // Number of reveal steps: each press of → shows one more fragment before moving on.
  steps: number
  // Estimated time to read the slide once every step is shown, in seconds. Filled in by timed().
  readSeconds?: number
  // The picture, and for teaching slides the two-line story, from stories.json.
  scene?: SceneId
  story?: SlideStory
  // Glossary terms this slide is the first to use, shown as "New word" notes.
  newWords?: NewWord[]
  // Glossary terms the slide itself defines (the Key terms cards), so they need no note.
  defines?: string[]
}

export type Slide = Base &
  (
    | { kind: 'title' }
    | { kind: 'agenda' }
    | { kind: 'section'; number: number; intro: string }
    | { kind: 'cards'; part?: string; cards: Card[] }
    | { kind: 'detail'; eyebrow: string; body: string; points: { label: string; text: string }[]; code?: { label: string; text: string }; tag?: string }
    | { kind: 'table'; part?: string; group: string; rows: Command[] }
    | { kind: 'steps'; part?: string; start: number; items: Card[] }
    | { kind: 'compare'; part?: string; group: string; dos: Rule[]; donts: Rule[] }
    | { kind: 'quiz'; number: number; total: number; question: QuizQuestion }
    | { kind: 'diagram'; eyebrow: string; diagram: DiagramId }
    | { kind: 'facts'; facts: FunFact[] }
    | { kind: 'stats'; tone: 'up' | 'down'; findings: Finding[] }
    | { kind: 'summary'; items: (Takeaway | Factor)[] }
    | { kind: 'statement'; text: string }
    | { kind: 'end' }
    // The surprise after "Questions?".
    | { kind: 'teaser' }
    | { kind: 'live' }
    | { kind: 'controls' }
    | { kind: 'prompt' }
    | { kind: 'thanks' }
  )

// Slides that frame the session rather than teach a habit: they get a picture but no story.
const FRAMING = new Set<Slide['kind']>(['title', 'agenda', 'section', 'quiz', 'end', 'teaser', 'live', 'controls', 'prompt', 'thanks'])
export const isTeaching = (slide: Slide) => !FRAMING.has(slide.kind)

function chunk<T>(list: T[], size: number): T[][] {
  // Spread items evenly: 7 in chunks of 3 becomes 3 + 2 + 2, 10 in chunks of 4 becomes 4 + 3 + 3.
  const count = Math.ceil(list.length / size)
  const base = Math.floor(list.length / count)
  const extra = list.length % count
  const out: T[][] = []
  let at = 0
  for (let i = 0; i < count; i++) {
    const n = base + (i < extra ? 1 : 0)
    out.push(list.slice(at, at + n))
    at += n
  }
  return out
}

const part = (i: number, n: number) => (n > 1 ? `${i + 1} of ${n}` : undefined)
const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function diagramSlide(section: string, eyebrow: string, title: string, diagram: DiagramId): Slide {
  return { kind: 'diagram', id: `diagram-${diagram}`, section, eyebrow, title, diagram, steps: diagramSteps(diagram) }
}

function cardSlides(section: string, title: string, cards: Card[], size = 3): Slide[] {
  const parts = chunk(cards, size)
  return parts.map((c, i) => ({ kind: 'cards', id: `${section}-cards-${i}`, section, title, part: part(i, parts.length), cards: c, steps: c.length }))
}

function build(): Slide[] {
  const deck: Slide[] = [
    { kind: 'title', id: 'title', title: meta.headline, steps: 0 },
    { kind: 'agenda', id: 'agenda', title: 'In this session', steps: sections.length },
  ]

  sections.forEach((s, i) => {
    deck.push({ kind: 'section', id: `section-${s.id}`, section: s.id, title: s.title, number: i + 1, intro: s.intro, steps: 1 })

    switch (s.id) {
      case 'why':
        deck.push({
          kind: 'steps',
          id: 'why-then',
          section: s.id,
          title: 'How a feature used to get built',
          start: 1,
          items: opening.then.map((t) => ({ id: t.id, title: t.title, body: t.body })),
          steps: opening.then.length,
        })
        deck.push(diagramSlide(s.id, s.nav, 'Then and now', 'then-now'))
        deck.push({ kind: 'stats', id: 'why-research', section: s.id, title: 'What the research says', tone: 'up', findings: opening.research, steps: opening.research.length })
        deck.push({ kind: 'stats', id: 'why-catch', section: s.id, title: 'The catch', tone: 'down', findings: opening.catch, steps: opening.catch.length })
        deck.push({ kind: 'summary', id: 'why-factors', section: s.id, title: 'What decides which side you land on', items: opening.factors, steps: opening.factors.length })
        deck.push({ kind: 'statement', id: 'why-handover', section: s.id, title: 'So…', text: opening.handover, steps: 0 })
        break

      case 'key-terms': {
        deck.push(diagramSlide(s.id, s.nav, 'What happens when you press Enter', 'request'))
        // The deck teaches the AI words up front; Copilot and coding words get a "New word" note where they first appear.
        const cards = cardSlides(
          s.id,
          'The words, in plain English',
          glossary.filter((t) => t.group === 'ai').map((t) => ({ id: t.id, title: t.title, body: t.body, example: `Think of it as: ${t.analogy}` })),
        )
        for (const c of cards) if (c.kind === 'cards') c.defines = c.cards.map((x) => x.id)
        deck.push(...cards)
        break
      }

      case 'mental-model':
        // Two per slide: these cards each carry an example.
        deck.push(
          ...cardSlides(
            s.id,
            'What fills the context',
            contextSources.map((c) => ({ id: c.id, title: c.title, body: c.body, example: c.example })),
            2,
          ),
        )
        deck.push(diagramSlide(s.id, s.nav, 'The whiteboard fills up as you chat', 'context-stack'))
        break

      case 'prompt-cost':
        deck.push(diagramSlide(s.id, s.nav, 'Same bug, two prompts', 'snowball'), diagramSlide(s.id, s.nav, 'Anatomy of a prompt that lands', 'anatomy'))
        break

      case 'modes':
        deck.push(diagramSlide(s.id, s.nav, 'More power, more cost', 'modes'))
        for (const m of modes) {
          deck.push({
            kind: 'detail',
            id: m.id,
            section: s.id,
            eyebrow: s.nav,
            title: m.title,
            body: m.body,
            points: [{ label: 'Use it when', text: m.useWhen }],
            code: { label: 'Example', text: m.example },
            steps: 2,
          })
        }
        break

      case 'cheat-sheet':
        deck.push(diagramSlide(s.id, s.nav, 'Three characters to know', 'prefixes'))
        for (const g of GROUPS) {
          const rows = commands.filter((c) => c.group === g.id)
          const parts = chunk(rows, 4)
          parts.forEach((r, j) =>
            deck.push({ kind: 'table', id: `cheat-${g.id}-${j}`, section: s.id, title: g.label, group: g.id, part: part(j, parts.length), rows: r, steps: r.length }),
          )
        }
        break

      case 'workflow': {
        deck.push(diagramSlide(s.id, s.nav, 'The daily loop', 'daily-loop'))
        const steps = workflow.steps.map((w) => ({ id: w.id, title: w.title, body: w.body, code: w.prompt }))
        // Three per slide: steps with a "Try" prompt need the room.
        const parts = chunk(steps, 3)
        let start = 1
        parts.forEach((items, j) => {
          deck.push({ kind: 'steps', id: `workflow-steps-${j}`, section: s.id, title: s.title, part: part(j, parts.length), start, items, steps: items.length })
          start += items.length
        })
        deck.push(diagramSlide(s.id, s.nav, 'When the chat gets long', 'chat-flow'))
        deck.push(
          ...cardSlides(
            s.id,
            'When the chat gets long',
            workflow.decisions.map((d) => ({ id: d.id, title: d.title, body: d.body, kicker: ACTION_LABEL[d.action], list: d.signals })),
          ),
        )
        break
      }

      case 'dos-donts':
        for (const g of RULE_GROUPS) {
          const dos = rules.filter((r) => r.group === g && r.kind === 'do')
          const donts = rules.filter((r) => r.group === g && r.kind === 'dont')
          // At most three per column, so long groups split over two slides.
          const n = Math.max(Math.ceil(dos.length / 3), Math.ceil(donts.length / 3))
          const split = <T>(list: T[], i: number) => list.slice(Math.ceil((list.length * i) / n), Math.ceil((list.length * (i + 1)) / n))
          for (let i = 0; i < n; i++) {
            const d = split(dos, i)
            const x = split(donts, i)
            deck.push({ kind: 'compare', id: `dd-${slug(g)}-${i}`, section: s.id, title: g, part: part(i, n), group: g, dos: d, donts: x, steps: d.length + x.length })
          }
        }
        break

      case 'team-memory':
        deck.push(diagramSlide(s.id, s.nav, 'What gets sent, and when', 'memory'))
        deck.push(
          ...cardSlides(
            s.id,
            s.nav,
            memoryFiles.map((m) => ({ id: m.id, title: m.title, body: m.when, code: m.path })),
          ),
        )
        break

      case 'templates':
        for (const t of templates) {
          deck.push({
            kind: 'detail',
            id: t.id,
            section: s.id,
            eyebrow: s.nav,
            title: t.title,
            body: t.body,
            tag: t.mode,
            points: [],
            code: { label: 'Prompt', text: t.prompt },
            steps: 1,
          })
        }
        break

      case 'quiz':
        quiz.forEach((q, j) => deck.push({ kind: 'quiz', id: q.id, section: s.id, title: q.scenario, number: j + 1, total: quiz.length, question: q, steps: q.options.length + 1 }))
        break

      case 'security':
        deck.push(diagramSlide(s.id, s.nav, 'The approval gate', 'approval'))
        deck.push(
          ...cardSlides(
            s.id,
            s.nav,
            security.map((c) => ({ id: c.id, title: c.title, body: c.body })),
          ),
        )
        break

      case 'beyond':
        deck.push(
          ...cardSlides(
            s.id,
            s.nav,
            beyond.map((c) => ({ id: c.id, title: c.title, body: c.body })),
          ),
        )
        break

      case 'wrap-up':
        deck.push({ kind: 'summary', id: 'summary', section: s.id, title: s.title, items: takeaways, steps: takeaways.length })
        break
    }

    // A "Did you know?" break at the end of each section that has facts.
    const own = facts.filter((f) => f.section === s.id)
    if (own.length) deck.push({ kind: 'facts', id: `facts-${s.id}`, section: s.id, title: 'Did you know?', facts: own, steps: own.length })
  })

  deck.push(
    { kind: 'end', id: 'end', title: 'Questions?', steps: 0 },
    { kind: 'teaser', id: 'one-more-thing', title: finale.teaser.title, steps: 0 },
    { kind: 'live', id: 'live-numbers', title: finale.live.title, steps: finale.live.stats.length },
    { kind: 'controls', id: 'live-controls', title: finale.controls.title, steps: 0 },
    { kind: 'prompt', id: 'build-prompt', title: finale.prompt.title, steps: 0 },
    { kind: 'thanks', id: 'thanks', title: finale.thanks.title, steps: 0 },
  )
  return deck
}

// ---------- Pictures and stories ----------
const FALLBACK_SCENE: SceneId = 'sparkle'

function storied(slides: Slide[]): Slide[] {
  let sectionScene: SceneId = FALLBACK_SCENE
  return slides.map((slide) => {
    const story = stories[slide.id]
    if (slide.kind === 'section') sectionScene = story?.scene ?? FALLBACK_SCENE
    const scene = story?.scene ?? sectionScene
    const teaching = isTeaching(slide)
    const told = teaching && !!story?.helps && !!story?.wrong
    if (import.meta.env?.DEV && teaching && !told) console.warn(`[deck] Teaching slide "${slide.id}" has no story in stories.json.`)
    if (import.meta.env?.DEV && !story) console.warn(`[deck] Slide "${slide.id}" has no picture in stories.json; using the section's.`)
    // The story is the last thing revealed on a teaching slide.
    return { ...slide, scene, story, steps: slide.steps + (told ? 1 : 0) }
  })
}

// ---------- New words ----------
// The words a slide shows that live outside its own data (meta.json, section names, diagrams).
function sharedText(slide: Slide): string[] {
  switch (slide.kind) {
    case 'title':
      return [meta.company, meta.headline, meta.tagline, meta.demoAudience, meta.product, meta.owner]
    case 'agenda':
      return [meta.product, meta.demoAudience, ...sections.map((s) => s.nav)]
    case 'end':
      return [meta.closing, meta.product, meta.lastReviewed, meta.owner]
    case 'teaser':
      return [finale.teaser.eyebrow]
    case 'live':
      return [finale.live.eyebrow, finale.live.body, ...finale.live.stats.map((s) => s.label)]
    case 'controls':
      return textOf(finale.controls)
    case 'prompt':
      return textOf(finale.prompt)
    case 'thanks':
      return [finale.thanks.eyebrow, finale.thanks.body, meta.product, meta.owner]
    case 'diagram':
      return diagramText(slide.diagram)
    default:
      return [sections.find((s) => s.id === slide.section)?.nav ?? '']
  }
}

// Every word a slide shows, for the term check and the reading time.
const SLIDE_SKIP = new Set(['newWords', 'defines', 'readSeconds', 'steps', 'number', 'total', 'start', 'part', 'diagram', 'tone', 'scene'])
const slideText = (slide: Slide) => [...textOf(Object.fromEntries(Object.entries(slide).filter(([k]) => !SLIDE_SKIP.has(k)))), ...sharedText(slide)]

// The first slide to use a glossary term explains it in a "New word" note; later slides don't repeat it.
// A note's own definition can use another new term, so that one is explained alongside it.
function withNewWords(slides: Slide[]): Slide[] {
  const known = new Set<string>()
  return slides.map((slide) => {
    for (const id of slide.defines ?? []) known.add(id)
    const fresh: GlossaryTerm[] = []
    const queue = termsIn(slideText(slide).join('\n'))
    while (queue.length) {
      const t = queue.shift()!
      if (known.has(t.id)) continue
      known.add(t.id)
      fresh.push(t)
      queue.push(...termsIn(t.short))
    }
    if (!fresh.length) return slide
    const order = glossary.map((t) => t.id)
    fresh.sort((a, b) => order.indexOf(a.id) - order.indexOf(b.id))
    return { ...slide, newWords: fresh.map(({ id, title, short }) => ({ id, title, short })) }
  })
}

// ---------- Time to read ----------
const countWords = (list: string[]) => list.reduce((n, s) => n + s.split(/\s+/).filter(Boolean).length, 0)

function timed(slides: Slide[]): Slide[] {
  const wpm = meta.readingWordsPerMinute > 0 ? meta.readingWordsPerMinute : 200
  return slides.map((slide) => {
    const words = countWords(slideText(slide)) + countWords((slide.newWords ?? []).flatMap((w) => [w.title, w.short]))
    // Round up to the nearest 5 seconds; nothing reads in under 5.
    const readSeconds = Math.max(5, Math.ceil(((words / wpm) * 60) / 5) * 5)
    return { ...slide, readSeconds }
  })
}

// ---------- Full deck and short talk ----------
// The full deck keeps every slide for reading. The short talk plays only the slides picked for it, in deck order,
// and works out its own "New word" notes, quiz numbers and timings. talk.json sets the default pick; the
// presenter's overview lets people choose their own.
export type Length = 'short' | 'full'

const story = storied(build())

export const slideIds = story.map((s) => s.id)

if (import.meta.env?.DEV) for (const id of talk.slides) if (!slideIds.includes(id)) console.warn(`[deck] talk.json lists "${id}", which is not a slide.`)

// The default short talk, in deck order, without ids that are not slides.
export const defaultTalk = slideIds.filter((id) => talk.slides.includes(id))

function shortTalk(ids: readonly string[]): Slide[] {
  const wanted = new Set(ids)
  const picked = story.filter((s) => wanted.has(s.id))
  const quizzes = picked.filter((s) => s.kind === 'quiz')
  return picked.map((s) => (s.kind === 'quiz' ? { ...s, number: quizzes.indexOf(s) + 1, total: quizzes.length } : s))
}

export const fullDeck = timed(withNewWords(story))

// Short talks are rebuilt only when the pick changes.
const talks = new Map<string, Slide[]>()
function talkDeck(ids: readonly string[]): Slide[] {
  const key = ids.join(' ')
  let deck = talks.get(key)
  if (!deck) {
    deck = timed(withNewWords(shortTalk(ids)))
    talks.set(key, deck)
  }
  return deck
}

// An empty pick would leave nothing to present, so it falls back to the default talk.
export const deckFor = (length: Length, ids: readonly string[] = defaultTalk) =>
  length === 'full' ? fullDeck : talkDeck(ids.length ? ids : defaultTalk)

export const slideSeconds = (slide: Slide) => slide.readSeconds ?? 0

export const totalSeconds = (slides: Slide[]) => slides.reduce((n, s) => n + slideSeconds(s), 0)

// Reading time left from this slide (included) to the end.
export const secondsFrom = (slides: Slide[], index: number) => totalSeconds(slides.slice(index))

export function formatDuration(seconds: number): string {
  if (seconds < 60) return `${seconds} s`
  const min = Math.floor(seconds / 60)
  const sec = seconds % 60
  if (seconds >= 600) return `${Math.round(seconds / 60)} min`
  return sec ? `${min} min ${sec} s` : `${min} min`
}

const fullIndex = new Map(fullDeck.map((s, i) => [s.id, i]))

// Where a slide from one deck lands in another: itself, or else the next slide in the target deck (or the last).
export function indexIn(slides: Slide[], id: string): number {
  const at = fullIndex.get(id) ?? 0
  const found = slides.findIndex((s) => (fullIndex.get(s.id) ?? 0) >= at)
  return found === -1 ? slides.length - 1 : found
}

// The first slide of a section in the given deck, or the next slide after it in a short talk.
export const sectionStart = (id: string, slides: Slide[] = fullDeck) => indexIn(slides, `section-${id}`)
