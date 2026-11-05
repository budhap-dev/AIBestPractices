import { createContext, Fragment, useContext, useLayoutEffect, useRef, type ReactNode } from 'react'
import type { Ink } from '../content/types'

// A pen ring around the words that matter, drawn on the slide as the presenter gets to them.
// Rings only exist inside a slide: on guide pages there is no context, so text renders as usual.
interface Rings {
  // Finds the slide's marked phrases (src/content/marks.json); the first group is the phrase.
  pattern: RegExp | null
  // The colour of pen for each phrase.
  inks: Map<string, Ink>
  // The slide was already seen, so what's on screen is drawn at once.
  still: boolean
}

export const RingContext = createContext<Rings | null>(null)

const escape = (s: string) => s.replace(/[.*+?^${}()|[\]\\/-]/g, '\\$&')

export function ringsFor(marks: Partial<Record<Ink, string[]>> = {}, still = false): Rings {
  const inks = new Map(Object.entries(marks).flatMap(([ink, phrases]) => phrases.map((p) => [p, ink as Ink] as const)))
  return { pattern: ringPattern([...inks.keys()]), inks, still }
}

function ringPattern(phrases: string[]): RegExp | null {
  if (!phrases.length) return null
  // Longest first, so a phrase wins over a shorter one inside it. Whole words only, and punctuation
  // right after the phrase stays with it rather than being left outside the ring.
  const list = [...phrases].sort((a, b) => b.length - a.length).map(escape)
  return new RegExp(`(?<!\\w)(${list.join('|')})(?!\\w)(?:[.,;:!?)”]+(?=\\s|$))?`, 'g')
}

// The same words always get the same ring, whatever the screen size.
function random(seed: string) {
  let h = 2166136261
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 16777619)
  return () => {
    h = (h + 0x6d2b79f5) | 0
    let t = Math.imul(h ^ (h >>> 15), 1 | h)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// One loop and a bit, as a hand draws it: anticlockwise from the top right, wobbling, at a slight slant, and
// overshooting where it began without quite meeting itself.
function ringPath(w: number, h: number, seed: string) {
  const rand = random(seed)
  const between = (a: number, b: number) => a + (b - a) * rand()
  const cx = w / 2
  const cy = h / 2
  const drift = Math.min(between(0.7, 1.4), h * 0.05)
  const rx = Math.max(1, cx - drift - 1.5)
  const start = between(-1.25, -0.65)
  const sweep = Math.PI * 2 + between(0.4, 0.8)
  // Some rings run nearly level, others lean up or down. Long ones lean less, so their ends stay near the line.
  const slant = between(-1, 1) * Math.min(0.14, (0.3 * h) / Math.max(1, rx))
  const [sin, cos] = [Math.sin(slant), Math.cos(slant)]
  // Slanted, the ring needs more height to keep the words inside it.
  const ry = Math.max(1, cy - drift - 1.5) + Math.abs(sin) * rx * 0.5
  const [p1, p2] = [between(0, 6), between(0, 6)]
  const [w1, w2] = [between(0.4, 0.9), between(0.2, 0.5)]
  // A round loop, with fuller ends on a long line so it still clears the first and last letters.
  const square = w / h > 12 ? 0.5 : 0.72
  const curve = (v: number) => Math.sign(v) * Math.abs(v) ** square

  const COUNT = 28
  const points = Array.from({ length: COUNT + 1 }, (_, i) => {
    const t = i / COUNT
    // Angles run clockwise on screen, so anticlockwise counts down.
    const a = start - sweep * t
    // Starts a little outside the line and finishes a little inside it, so the ends pass each other.
    const off = drift * (1 - 2 * t) + Math.sin(a * 2 + p1) * w1 + Math.sin(a * 3 + p2) * w2
    const x = (rx + off) * curve(Math.cos(a))
    const y = (ry + off) * curve(Math.sin(a))
    return [cx + x * cos - y * sin, cy + x * sin + y * cos]
  })

  // A smooth line through the points (Catmull-Rom as cubic Béziers).
  const n = (v: number) => v.toFixed(1)
  let d = `M${n(points[0][0])} ${n(points[0][1])}`
  for (let i = 0; i < COUNT; i++) {
    const [a, b, c, e] = [points[Math.max(0, i - 1)], points[i], points[i + 1], points[Math.min(COUNT, i + 2)]]
    d += `C${n(b[0] + (c[0] - a[0]) / 6)} ${n(b[1] + (c[1] - a[1]) / 6)} ${n(c[0] - (e[0] - b[0]) / 6)} ${n(c[1] - (e[1] - b[1]) / 6)} ${n(c[0])} ${n(c[1])}`
  }
  return d
}

// The parts of a slide that wait for a key press.
const REVEAL = '.frag, .dg-r'

// Just the ring: it circles its parent, which needs position: relative.
export function RingLine({ seed, ink = 'key' }: { seed: string; ink?: Ink }) {
  const rings = useContext(RingContext)
  const svg = useRef<SVGSVGElement>(null)
  const still = !!rings?.still

  useLayoutEffect(() => {
    const el = svg.current
    const host = el?.parentElement
    if (!el || !host) return
    const stage = el.closest(REVEAL)
    const scope = stage ?? el.closest('.slide__frame') ?? host
    // Rings that appear together are drawn one after another.
    const peers = [...scope.querySelectorAll('.ring')].filter((r) => r.closest(REVEAL) === stage)
    el.style.setProperty('--ring-n', String(peers.indexOf(el)))
    if (still && (!stage || stage.classList.contains('is-in'))) el.classList.add('ring--drawn')

    // Sized from the layout, not the screen, so it is right even while the slide is mid-transition.
    const draw = () => {
      const w = el.clientWidth
      const h = el.clientHeight
      if (!w || !h) return
      el.setAttribute('viewBox', `0 0 ${w} ${h}`)
      el.firstElementChild?.setAttribute('d', ringPath(w, h, seed))
    }
    draw()
    const watch = new ResizeObserver(draw)
    watch.observe(host)
    return () => watch.disconnect()
  }, [seed, still])

  // Stepping back hides a point; when it comes back its ring is drawn again.
  useLayoutEffect(() => {
    const el = svg.current
    const stage = el?.closest(REVEAL)
    if (stage && !stage.classList.contains('is-in')) el?.classList.remove('ring--drawn')
  })

  if (!rings) return null
  return (
    <svg ref={svg} className={`ring ring--${ink}`} aria-hidden="true" focusable="false">
      <path pathLength={1} />
    </svg>
  )
}

// Rings whatever it wraps, for numbers worked out by the app.
export function Ring({ seed, ink, children }: { seed: string; ink?: Ink; children: ReactNode }) {
  const rings = useContext(RingContext)
  if (!rings) return children
  return (
    <mark className="ringed">
      {children}
      <RingLine seed={seed} ink={ink} />
    </mark>
  )
}

// Text with the slide's marked phrases ringed. `render` styles each piece, for RichText.
export function Marked({ text, render = (t) => t }: { text: string; render?: (text: string) => ReactNode }) {
  const rings = useContext(RingContext)
  if (!rings?.pattern) return render(text)
  const parts: ReactNode[] = []
  let last = 0
  for (const m of text.matchAll(rings.pattern)) {
    const at = m.index ?? 0
    if (at > last) parts.push(render(text.slice(last, at)))
    parts.push(
      <Ring seed={m[1]} ink={rings.inks.get(m[1])}>
        {render(m[0])}
      </Ring>,
    )
    last = at + m[0].length
  }
  if (last === 0) return render(text)
  if (last < text.length) parts.push(render(text.slice(last)))
  return parts.map((p, i) => <Fragment key={i}>{p}</Fragment>)
}
