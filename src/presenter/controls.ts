import { createContext, useContext } from 'react'
import { talk } from '../content'
import { defaultTalk, slideIds, type Length, type Slide } from './deck'

// Slide transitions and designs live in the presenter, but the finale lets people change them from a slide.
export const TRANSITIONS = [
  { id: 'slide', label: 'Slide' },
  { id: 'fade', label: 'Fade' },
  { id: 'zoom', label: 'Zoom' },
  { id: 'flip', label: 'Flip' },
  { id: 'page', label: 'Page turn' },
  { id: 'cube', label: 'Cube' },
  { id: 'wipe', label: 'Wipe' },
  { id: 'circle', label: 'Circle' },
  { id: 'rise', label: 'Rise' },
  { id: 'random', label: 'Random' },
] as const

export type Transition = (typeof TRANSITIONS)[number]['id']

// Slide designs, like a presentation template: each sets the slide background, title bar and footer.
export const DESIGNS = [
  { id: 'classic', label: 'Classic' },
  { id: 'bold', label: 'Bold' },
  { id: 'paper', label: 'Paper' },
  { id: 'blueprint', label: 'Blueprint' },
  { id: 'spotlight', label: 'Spotlight' },
] as const

export type Design = (typeof DESIGNS)[number]['id']

// How much of the deck to present: the short talk for a live session, or every slide.
export const LENGTHS: { id: Length; label: string }[] = [
  { id: 'short', label: talk.label },
  { id: 'full', label: 'Full deck' },
]

const LENGTH_KEY = 'cfg-length'

// A live session starts with the short talk; the choice is remembered.
export function readLength(): Length {
  try {
    return localStorage.getItem(LENGTH_KEY) === 'full' ? 'full' : 'short'
  } catch {
    return 'short'
  }
}

export function saveLength(length: Length) {
  try {
    localStorage.setItem(LENGTH_KEY, length)
  } catch {
    // Storage blocked: the choice lasts for this visit.
  }
}

const TALK_KEY = 'cfg-talk'

// The slides in the short talk: the presenter's own pick if they made one, else talk.json.
// Ids that are no longer slides (the content changed) are dropped.
export function readTalk(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(TALK_KEY) ?? 'null')
    if (!Array.isArray(saved)) return defaultTalk
    const ids = slideIds.filter((id) => saved.includes(id))
    return ids.length ? ids : defaultTalk
  } catch {
    return defaultTalk
  }
}

// Saving the default pick clears the saved one, so later changes to talk.json show up.
export function saveTalk(ids: readonly string[]) {
  try {
    if (sameTalk(ids, defaultTalk)) localStorage.removeItem(TALK_KEY)
    else localStorage.setItem(TALK_KEY, JSON.stringify(ids))
  } catch {
    // Storage blocked: the pick lasts for this visit.
  }
}

export const sameTalk = (a: readonly string[], b: readonly string[]) => a.length === b.length && a.every((id, i) => id === b[i])

export interface DeckControls {
  // The slides being presented, short or full.
  slides: Slide[]
  length: Length
  transition: Transition
  setTransition: (t: Transition) => void
  design: Design
  setDesign: (d: Design) => void
}

export const DeckControlsContext = createContext<DeckControls | null>(null)

export const useDeckControls = () => useContext(DeckControlsContext)
