import { useEffect, useState } from 'react'
import { searchIndex, sections } from './content'

// Hash routes keep the build fully static: no server rewrites needed on any host.
//   #/                    home
//   #/<section>           one section per page
//   #/<section>/<item>    a section page, scrolled to one item
//   #/present/<n>         presenter mode, slide n (1-based)
export type Route =
  | { kind: 'home' }
  | { kind: 'section'; id: string; item?: string }
  | { kind: 'present'; slide: number }

const sectionIds = new Set(sections.map((s) => s.id))

export function parse(hash: string): Route {
  const raw = decodeURIComponent(hash.replace(/^#/, ''))
  if (!raw.startsWith('/')) return { kind: 'home' }
  const [first, second] = raw.slice(1).split('/')
  if (first === 'present') {
    const n = Number.parseInt(second ?? '1', 10)
    return { kind: 'present', slide: Number.isFinite(n) && n > 0 ? n : 1 }
  }
  if (first && sectionIds.has(first)) return { kind: 'section', id: first, item: second || undefined }
  return { kind: 'home' }
}

export function href(route: Route): string {
  if (route.kind === 'home') return '#/'
  if (route.kind === 'present') return `#/present/${route.slide}`
  return `#/${route.id}${route.item ? `/${route.item}` : ''}`
}

export function navigate(route: Route, { replace = false } = {}) {
  const next = href(route)
  if (location.hash === next) {
    // Same page: still scroll to the item, as a fresh click would expect.
    window.dispatchEvent(new HashChangeEvent('hashchange'))
    return
  }
  if (replace) {
    history.replaceState(null, '', next)
    window.dispatchEvent(new HashChangeEvent('hashchange'))
  } else {
    location.hash = next
  }
}

// Links from the old single-page guide (#cmd-clear, #workflow) still land on the right page.
export function upgradeLegacyHash() {
  const raw = decodeURIComponent(location.hash.slice(1))
  if (!raw || raw.startsWith('/')) return
  const entry = searchIndex.find((e) => e.id === raw)
  if (entry) navigate(target(entry.id), { replace: true })
}

// Every searchable id (a section or an item in it) maps to a page.
export function target(id: string): Route {
  if (sectionIds.has(id)) return { kind: 'section', id }
  const entry = searchIndex.find((e) => e.id === id)
  return entry ? { kind: 'section', id: entry.sectionId, item: id } : { kind: 'home' }
}

export const goTo = (id: string) => navigate(target(id))

// The tick changes on every navigation, even to the same hash, so a repeat click still scrolls.
export function useLocation() {
  const [state, setState] = useState(() => ({ hash: location.hash, tick: 0 }))
  useEffect(() => {
    const onChange = () => setState((s) => ({ hash: location.hash, tick: s.tick + 1 }))
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])
  return state
}
