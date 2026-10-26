import { sections } from '../content'
import { href, type Route } from '../router'

// Previous / next links at the foot of every page, in section order.
export function Pager({ current }: { current: string | null }) {
  const index = current ? sections.findIndex((s) => s.id === current) : -1
  const prev: { route: Route; label: string } | null =
    index > 0 ? { route: { kind: 'section', id: sections[index - 1].id }, label: sections[index - 1].nav } : index === 0 ? { route: { kind: 'home' }, label: 'Overview' } : null
  const next = index < sections.length - 1 ? sections[index + 1] : null

  return (
    <nav className="pager" aria-label="Previous and next page">
      {prev ? (
        <a className="pager__link pager__link--prev" href={href(prev.route)} rel="prev">
          <span className="pager__dir">Previous</span>
          <span className="pager__label">{prev.label}</span>
        </a>
      ) : (
        <span />
      )}
      {next && (
        <a className="pager__link pager__link--next" href={href({ kind: 'section', id: next.id })} rel="next">
          <span className="pager__dir">Next</span>
          <span className="pager__label">{next.nav}</span>
        </a>
      )}
    </nav>
  )
}
