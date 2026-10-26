import { useSyncExternalStore } from 'react'
import { flushSync } from 'react-dom'

export type Mode = 'system' | 'light' | 'dark'

// Accent families. Colours live in styles.css; every pair passes WCAG AA in light and dark.
export const PALETTES = [
  { id: 'teal', label: 'Teal' },
  { id: 'ocean', label: 'Ocean' },
  { id: 'grape', label: 'Grape' },
  { id: 'rose', label: 'Rose' },
  { id: 'ember', label: 'Ember' },
  { id: 'graphite', label: 'Graphite' },
] as const

export type Palette = (typeof PALETTES)[number]['id']

export interface Theme {
  mode: Mode
  palette: Palette
}

const MODE_KEY = 'cfg-theme'
const PALETTE_KEY = 'cfg-palette'

function read(): Theme {
  try {
    const m = localStorage.getItem(MODE_KEY)
    const p = localStorage.getItem(PALETTE_KEY)
    return {
      mode: m === 'light' || m === 'dark' ? m : 'system',
      palette: PALETTES.some((x) => x.id === p) ? (p as Palette) : 'teal',
    }
  } catch {
    return { mode: 'system', palette: 'teal' }
  }
}

let current = read()
const listeners = new Set<() => void>()

function apply(theme: Theme) {
  const root = document.documentElement
  if (theme.mode === 'system') delete root.dataset.theme
  else root.dataset.theme = theme.mode
  if (theme.palette === 'teal') delete root.dataset.palette
  else root.dataset.palette = theme.palette
  try {
    if (theme.mode === 'system') localStorage.removeItem(MODE_KEY)
    else localStorage.setItem(MODE_KEY, theme.mode)
    if (theme.palette === 'teal') localStorage.removeItem(PALETTE_KEY)
    else localStorage.setItem(PALETTE_KEY, theme.palette)
  } catch {
    // Storage blocked: the choice still applies for this visit.
  }
}

// Changes the theme with a circular reveal from the point the user clicked, where supported.
export function setTheme(change: Partial<Theme>, origin?: { x: number; y: number }) {
  const next = { ...current, ...change }
  if (next.mode === current.mode && next.palette === current.palette) return
  const commit = () => {
    current = next
    apply(next)
    flushSync(() => listeners.forEach((l) => l()))
  }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
  if (!document.startViewTransition || reduce) {
    commit()
    return
  }
  const x = origin?.x ?? innerWidth / 2
  const y = origin?.y ?? 0
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const transition = document.startViewTransition(commit)
  transition.ready
    .then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 600, easing: 'cubic-bezier(0.4, 0, 0.2, 1)', pseudoElement: '::view-transition-new(root)' },
      )
    })
    .catch(() => {})
}

function subscribe(cb: () => void) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export function useTheme() {
  return useSyncExternalStore(subscribe, () => current)
}
