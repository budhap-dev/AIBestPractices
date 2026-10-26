import { useMemo } from 'react'
import { create } from 'qrcode'

// A QR code drawn as one SVG path, always dark on light so every phone camera can read it.
export function QrCode({ value, label }: { value: string; label: string }) {
  const { size, path } = useMemo(() => {
    const { modules } = create(value, { errorCorrectionLevel: 'M' })
    let d = ''
    for (let r = 0; r < modules.size; r++) for (let c = 0; c < modules.size; c++) if (modules.get(r, c)) d += `M${c + 4} ${r + 4}h1v1h-1z`
    return { size: modules.size + 8, path: d }
  }, [value])

  return (
    <svg className="qr" viewBox={`0 0 ${size} ${size}`} role="img" aria-label={label} shapeRendering="crispEdges">
      <rect width={size} height={size} fill="#fff" />
      <path d={path} fill="#000" />
    </svg>
  )
}
