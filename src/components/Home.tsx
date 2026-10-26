import { meta, sections } from '../content'
import { href } from '../router'

export function Home() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <p className="eyebrow">{meta.company} · Engineering</p>
      <h1 id="hero-title" tabIndex={-1}>
        {meta.headline}
      </h1>
      <p className="hero__lede">{meta.tagline}</p>
      <dl className="hero__audience">
        <div>
          <dt>Built for</dt>
          <dd>{meta.endUsers}</dd>
        </div>
        <div>
          <dt>Demo audience</dt>
          <dd>{meta.demoAudience}</dd>
        </div>
      </dl>
      <div className="hero__cta">
        <a className="btn btn--primary" href={href({ kind: 'section', id: 'workflow' })}>
          Start with the daily workflow
        </a>
        <a className="btn btn--outline" href={href({ kind: 'section', id: 'cheat-sheet' })}>
          Open the cheat sheet
        </a>
        <a className="btn btn--outline" href={href({ kind: 'section', id: 'key-terms' })}>
          New to AI? Start with the key terms
        </a>
        <a className="btn btn--ghost" href={href({ kind: 'present', slide: 1 })}>
          Present the guide
        </a>
      </div>
      <h2 className="hero__toc-title">In this guide</h2>
      <ol className="hero__toc">
        {sections.map((s, i) => (
          <li key={s.id} style={{ '--i': i } as React.CSSProperties}>
            <a href={href({ kind: 'section', id: s.id })}>
              <span className="hero__toc-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="hero__toc-nav">{s.nav}</span>
              <span className="hero__toc-title-text">{s.title}</span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  )
}
