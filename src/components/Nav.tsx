import { sections } from '../content'
import { href } from '../router'

export const PRINT_EVENT = 'cfg:print'

export function Nav({ open, current, onNavigate }: { open: boolean; current: string; onNavigate: () => void }) {
  return (
    <nav id="site-nav" className={`sidenav${open ? ' sidenav--open' : ''}`} aria-label="Sections">
      <a className={`sidenav__home${current === 'home' ? ' is-current' : ''}`} href={href({ kind: 'home' })} aria-current={current === 'home' ? 'page' : undefined} onClick={onNavigate}>
        Overview
      </a>
      <ol>
        {sections.map((s, i) => (
          <li key={s.id}>
            <a href={href({ kind: 'section', id: s.id })} aria-current={current === s.id ? 'page' : undefined} onClick={onNavigate}>
              <span className="sidenav__num">{String(i + 1).padStart(2, '0')}</span>
              {s.nav}
            </a>
          </li>
        ))}
      </ol>
      <button type="button" className="btn btn--ghost btn--sm sidenav__print" onClick={printCheatSheet}>
        Print cheat sheet
      </button>
    </nav>
  )
}

// The cheat sheet and the do's and don'ts live on separate pages, so the app renders a print view first.
export function printCheatSheet() {
  window.dispatchEvent(new Event(PRINT_EVENT))
}
