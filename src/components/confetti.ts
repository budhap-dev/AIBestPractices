// A short burst of confetti for small wins. No library: one canvas, removed when the pieces land.
// Skipped entirely for people who ask for reduced motion.

const COLOURS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4', '#6250d6']

interface Piece {
  x: number
  y: number
  vx: number
  vy: number
  spin: number
  angle: number
  size: number
  colour: string
}

export function celebrate({ size = 'small', from }: { size?: 'small' | 'big'; from?: Element | null } = {}) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const canvas = document.createElement('canvas')
  canvas.className = 'confetti'
  canvas.setAttribute('aria-hidden', 'true')
  const dpr = Math.min(window.devicePixelRatio || 1, 2)
  canvas.width = innerWidth * dpr
  canvas.height = innerHeight * dpr
  document.body.append(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) return canvas.remove()
  ctx.scale(dpr, dpr)

  // Small bursts fan out from the element that earned them; big ones rain from the top edge.
  const box = from?.getBoundingClientRect()
  const count = size === 'big' ? 160 : 60
  const pieces: Piece[] = Array.from({ length: count }, () => {
    const big = size === 'big'
    const angle = big ? Math.PI / 2 + (Math.random() - 0.5) * 1.2 : -Math.PI / 2 + (Math.random() - 0.5) * 2.2
    const speed = big ? 2 + Math.random() * 4 : 5 + Math.random() * 7
    return {
      x: big ? Math.random() * innerWidth : box ? box.left + box.width / 2 : innerWidth / 2,
      y: big ? -20 - Math.random() * innerHeight * 0.3 : box ? box.top + box.height / 2 : innerHeight / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spin: (Math.random() - 0.5) * 0.3,
      angle: Math.random() * Math.PI,
      size: 6 + Math.random() * 6,
      colour: COLOURS[Math.floor(Math.random() * COLOURS.length)],
    }
  })

  const start = performance.now()
  const life = size === 'big' ? 3200 : 1600
  const frame = (now: number) => {
    const t = now - start
    ctx.clearRect(0, 0, innerWidth, innerHeight)
    ctx.globalAlpha = Math.max(0, 1 - Math.max(0, t - life * 0.6) / (life * 0.4))
    for (const p of pieces) {
      p.vy += 0.18
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.angle += p.spin
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.angle)
      ctx.fillStyle = p.colour
      ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2)
      ctx.restore()
    }
    if (t < life) requestAnimationFrame(frame)
    else canvas.remove()
  }
  requestAnimationFrame(frame)
}
