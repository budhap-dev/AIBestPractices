import { useEffect, useRef, useState } from 'react'
import { meta, sections } from './content'
import { Header } from './components/Header'
import { Home } from './components/Home'
import { Nav, printCheatSheet, PRINT_EVENT } from './components/Nav'
import { Pager } from './components/Pager'
import { CheatSheet, DosDonts, SECTION_PAGES } from './components/Sections'
import { ToastProvider } from './components/ui'
import { Presenter } from './presenter/Presenter'
import { readLength } from './presenter/controls'
import { deckFor, sectionStart } from './presenter/deck'
import { parse, upgradeLegacyHash, useLocation } from './router'

const order = (key: string) => sections.findIndex((s) => s.id === key)

function usePrintMode() {
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    const start = () => setPrinting(true)
    window.addEventListener(PRINT_EVENT, start)
    return () => window.removeEventListener(PRINT_EVENT, start)
  }, [])

  // Render the print view first, then open the dialog, then go back to the page.
  useEffect(() => {
    if (!printing) return
    document.body.classList.add('print-cheatsheet')
    const done = () => {
      document.body.classList.remove('print-cheatsheet')
      setPrinting(false)
    }
    window.addEventListener('afterprint', done, { once: true })
    window.print()
    return () => window.removeEventListener('afterprint', done)
  }, [printing])

  return printing
}

export default function App() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { hash, tick } = useLocation()
  const route = parse(hash)
  const pageKey = route.kind === 'section' ? route.id : route.kind
  const item = route.kind === 'section' ? route.item : undefined
  const printing = usePrintMode()
  const firstRender = useRef(true)

  // Remember which way we moved so the page slides in from the matching side.
  const [view, setView] = useState({ key: pageKey, dir: 'none' as 'none' | 'forward' | 'back' })
  if (view.key !== pageKey) setView({ key: pageKey, dir: order(pageKey) > order(view.key) ? 'forward' : 'back' })

  useEffect(upgradeLegacyHash, [hash])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setMenuOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  useEffect(() => {
    if (pageKey === 'present') return
    const info = sections.find((s) => s.id === pageKey)
    document.title = info ? `${info.nav} · ${meta.product}` : meta.product
  }, [pageKey])

  // After each navigation: scroll to the item (and highlight it), or to the top of the new page.
  useEffect(() => {
    if (pageKey === 'present') return
    const initial = firstRender.current
    firstRender.current = false
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches
    const el = item ? document.getElementById(item) : null
    if (el) {
      if (el instanceof HTMLDetailsElement) el.open = true
      el.scrollIntoView({ behavior: reduce || initial ? 'auto' : 'smooth', block: 'start' })
      el.classList.remove('flash')
      void el.offsetWidth
      el.classList.add('flash')
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '-1')
      el.focus({ preventScroll: true })
      return
    }
    window.scrollTo({ top: 0, behavior: 'auto' })
    // Move focus to the new page's heading so screen readers announce it, but not on first load.
    if (!initial) document.querySelector<HTMLElement>('main h1, main h2')?.focus({ preventScroll: true })
  }, [pageKey, item, tick])

  const Page = route.kind === 'section' ? SECTION_PAGES[route.id] : null
  // Present from this section in whichever deck was used last: the short talk or the full deck.
  const presentFrom = route.kind === 'section' ? sectionStart(route.id, deckFor(readLength())) + 1 : 1

  if (route.kind === 'present') {
    return (
      <ToastProvider>
        <Presenter slide={route.slide} />
      </ToastProvider>
    )
  }

  return (
    <ToastProvider>
      <a
        className="skip-link"
        href="#main"
        onClick={(e) => {
          e.preventDefault()
          document.getElementById('main')?.focus()
        }}
      >
        Skip to content
      </a>
      <Header menuOpen={menuOpen} onMenu={() => setMenuOpen((o) => !o)} presentFrom={presentFrom} />
      <div className="layout">
        <Nav open={menuOpen} current={pageKey} onNavigate={() => setMenuOpen(false)} />
        {menuOpen && <div className="scrim" onClick={() => setMenuOpen(false)} aria-hidden="true" />}
        <main id="main" tabIndex={-1}>
          {printing ? (
            <>
              <CheatSheet />
              <DosDonts />
            </>
          ) : (
            <div className="page" key={pageKey} data-dir={view.dir}>
              {Page ? <Page /> : <Home />}
              <Pager current={route.kind === 'section' ? route.id : null} />
            </div>
          )}
          <footer className="footer">
            <p>
              <strong>{meta.product}</strong> · Last reviewed {meta.lastReviewed} · Owner {meta.owner}
            </p>
            <p className="muted">{meta.copilotVersionNote}</p>
            <button type="button" className="btn btn--ghost btn--sm" onClick={printCheatSheet}>
              Print cheat sheet
            </button>
          </footer>
        </main>
      </div>
    </ToastProvider>
  )
}
