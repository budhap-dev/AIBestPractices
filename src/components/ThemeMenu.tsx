import { useEffect, useId, useRef, useState } from 'react'
import { PALETTES, setTheme, useTheme, type Mode } from '../theme'

const MODES: { id: Mode; label: string }[] = [
  { id: 'system', label: 'System' },
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
]

const origin = (e: React.MouseEvent) => {
  // Keyboard "clicks" report 0,0: start the reveal from the button instead.
  if (e.clientX || e.clientY) return { x: e.clientX, y: e.clientY }
  const r = e.currentTarget.getBoundingClientRect()
  return { x: r.left + r.width / 2, y: r.top + r.height / 2 }
}

export function ThemeMenu({ className = '' }: { className?: string }) {
  const theme = useTheme()
  const [open, setOpen] = useState(false)
  const wrap = useRef<HTMLDivElement>(null)
  const button = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return
      e.stopPropagation()
      setOpen(false)
      button.current?.focus()
    }
    const onDown = (e: PointerEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('keydown', onKey, true)
    window.addEventListener('pointerdown', onDown)
    return () => {
      window.removeEventListener('keydown', onKey, true)
      window.removeEventListener('pointerdown', onDown)
    }
  }, [open])

  return (
    <div className={`theme-menu ${className}`} ref={wrap}>
      <button
        ref={button}
        type="button"
        className="btn btn--icon"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label="Theme"
        title="Theme"
        onClick={() => setOpen((o) => !o)}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true">
          <path d="M12 3a9 9 0 1 0 0 18c1.1 0 1.8-.9 1.8-1.9 0-.5-.2-.9-.5-1.3-.3-.3-.5-.8-.5-1.3 0-1 .8-1.8 1.8-1.8H17a4 4 0 0 0 4-4C21 6.4 17 3 12 3z" />
          <circle cx="7.5" cy="10.5" r="1.2" />
          <circle cx="10.5" cy="7" r="1.2" />
          <circle cx="15" cy="7.5" r="1.2" />
        </svg>
      </button>
      {open && (
        <div className="theme-menu__panel" id={panelId} role="dialog" aria-label="Theme">
          <p className="theme-menu__label" id={`${panelId}-mode`}>
            Appearance
          </p>
          <div className="seg theme-menu__modes" role="group" aria-labelledby={`${panelId}-mode`}>
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                aria-pressed={theme.mode === m.id}
                className={theme.mode === m.id ? 'is-on' : undefined}
                onClick={(e) => setTheme({ mode: m.id }, origin(e))}
              >
                {m.label}
              </button>
            ))}
          </div>
          <p className="theme-menu__label" id={`${panelId}-palette`}>
            Colour
          </p>
          <div className="theme-menu__swatches" role="group" aria-labelledby={`${panelId}-palette`}>
            {PALETTES.map((p) => (
              <button
                key={p.id}
                type="button"
                data-swatch={p.id}
                aria-pressed={theme.palette === p.id}
                className="swatch"
                onClick={(e) => setTheme({ palette: p.id }, origin(e))}
              >
                <span className="swatch__chip" aria-hidden="true" />
                {p.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
