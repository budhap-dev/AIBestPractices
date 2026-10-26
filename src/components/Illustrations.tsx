import type { ReactNode } from 'react'
import type { SceneId } from '../content/types'

// The shared picture set for slides and pages. Each scene is a small flat drawing on a 160 × 120
// canvas, filled from the diagram palette (--dg-1..5) and outlined in the text colour, so it follows
// the colour theme and light or dark. Pictures are decoration: the words carry the meaning, so every
// scene is hidden from screen readers. Classes starting ill-a animate gently (see styles.css) and stop
// when the system asks for reduced motion.

const Spark = ({ x, y, s = 1, d = 0 }: { x: number; y: number; s?: number; d?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <path className="ill-a-twinkle ill-f4" style={{ animationDelay: `${d}s` }} d="M0 -6 C1 -1 1 -1 6 0 C1 1 1 1 0 6 C-1 1 -1 1 -6 0 C-1 -1 -1 -1 0 -6Z" />
  </g>
)

const SCENES: Record<SceneId, ReactNode> = {
  desk: (
    <>
      <rect x="44" y="34" width="72" height="48" rx="5" className="ill-paper ill-ink" />
      <rect className="ill-f1 ill-a-type" x="53" y="44" width="30" height="5" rx="2.5" />
      <rect className="ill-f3 ill-a-type" style={{ animationDelay: '0.4s' }} x="53" y="54" width="46" height="5" rx="2.5" />
      <rect className="ill-f2 ill-a-type" style={{ animationDelay: '0.8s' }} x="61" y="64" width="26" height="5" rx="2.5" />
      <rect className="ill-f4 ill-a-type" style={{ animationDelay: '1.2s' }} x="53" y="72" width="38" height="5" rx="2.5" />
      <path className="ill-paper ill-ink" d="M34 86h92l-7 9H41z" />
      <rect x="122" y="72" width="15" height="17" rx="3" className="ill-f2 ill-ink" />
      <path className="ill-ink" fill="none" d="M137 76q6 0 6 5t-6 5" />
      <path className="ill-ink ill-a-sway" fill="none" d="M127 66q-3-4 0-8t0-8" />
      <Spark x={30} y={34} d={0.3} />
    </>
  ),
  map: (
    <>
      <path className="ill-paper ill-ink" d="M30 34l32-8 36 8 32-8v62l-32 8-36-8-32 8z" />
      <path className="ill-ink" d="M62 26v62M98 34v62" opacity="0.35" />
      <path className="ill-a-draw ill-route" d="M42 80c14-4 14-28 30-28s18 22 34 18 12-26 14-30" />
      <g className="ill-a-bob">
        <path className="ill-f2 ill-ink" d="M120 30c-6 0-9 4-9 8 0 6 9 14 9 14s9-8 9-14c0-4-3-8-9-8z" />
        <circle cx="120" cy="38" r="3" className="ill-paper" />
      </g>
      <circle cx="42" cy="80" r="5" className="ill-f3 ill-ink" />
    </>
  ),
  clock: (
    <>
      <circle cx="80" cy="60" r="34" className="ill-paper ill-ink" />
      <circle cx="80" cy="60" r="27" className="ill-soft" />
      {[0, 90, 180, 270].map((a) => (
        <rect key={a} x="78.5" y="31" width="3" height="7" rx="1.5" className="ill-ink-fill" transform={`rotate(${a} 80 60)`} />
      ))}
      <rect x="78" y="44" width="4" height="18" rx="2" className="ill-f2 ill-a-spin-slow ill-pivot" />
      <rect x="79" y="36" width="2.5" height="26" rx="1.25" className="ill-ink-fill ill-a-spin ill-pivot" />
      <circle cx="80" cy="60" r="4" className="ill-f1 ill-ink" />
      <path className="ill-f3 ill-ink" d="M112 26l8-6 4 6-8 6zM48 26l-8-6-4 6 8 6z" />
      <Spark x={128} y={86} d={0.6} />
    </>
  ),
  rocket: (
    <>
      <g className="ill-a-float">
        <path className="ill-paper ill-ink" d="M80 18c14 12 18 32 14 54H66c-4-22 0-42 14-54z" />
        <circle cx="80" cy="44" r="7" className="ill-f1 ill-ink" />
        <path className="ill-f2 ill-ink" d="M66 60l-12 16 14-2zM94 60l12 16-14-2z" />
        <path className="ill-f4 ill-a-flicker" d="M70 74h20l-10 20z" />
      </g>
      <path className="ill-ink" fill="none" d="M38 96h20M104 100h22M30 104h14" opacity="0.5" />
      <Spark x={120} y={30} d={0.2} />
      <Spark x={40} y={44} s={0.7} d={0.9} />
    </>
  ),
  fork: (
    <>
      <rect x="77" y="30" width="6" height="70" rx="2" className="ill-ink-fill" />
      <g className="ill-a-sway-slow">
        <path className="ill-f3 ill-ink" d="M84 34h40l8 8-8 8H84z" />
        <path className="ill-paper" d="M94 40h24v4H94z" opacity="0.8" />
      </g>
      <g className="ill-a-sway-slow" style={{ animationDelay: '0.6s' }}>
        <path className="ill-f2 ill-ink" d="M76 56H36l-8 8 8 8h40z" />
        <path className="ill-paper" d="M42 62h24v4H42z" opacity="0.8" />
      </g>
      <path className="ill-ink" fill="none" d="M80 100c-10 0-24 4-40 10M80 100c10 0 26 4 44 10" opacity="0.4" />
    </>
  ),
  book: (
    <>
      <path className="ill-paper ill-ink" d="M80 34c-12-8-30-8-44-4v58c14-4 32-4 44 4z" />
      <path className="ill-paper ill-ink" d="M80 34c12-8 30-8 44-4v58c-14-4-32-4-44 4z" />
      {[46, 56, 66, 76].map((y, i) => (
        <path key={y} className={`ill-a-type ill-line-${(i % 3) + 1}`} style={{ animationDelay: `${i * 0.35}s` }} d={`M44 ${y}h26M90 ${y}h${i % 2 ? 18 : 26}`} />
      ))}
      <path className="ill-f2" d="M108 28h8v20l-4-4-4 4z" />
      <Spark x={130} y={26} d={0.4} />
      <Spark x={28} y={92} s={0.7} d={1.1} />
    </>
  ),
  whiteboard: (
    <>
      <rect x="28" y="22" width="104" height="66" rx="4" className="ill-paper ill-ink" />
      <path className="ill-ink" fill="none" d="M52 88l-8 18M108 88l8 18" />
      <g transform="rotate(-4 49 42)">
        <rect className="ill-f4 ill-a-pop" x="38" y="32" width="22" height="20" rx="2" />
      </g>
      <g transform="rotate(3 77 40)">
        <rect className="ill-f1 ill-a-pop" style={{ animationDelay: '0.5s' }} x="66" y="30" width="22" height="20" rx="2" />
      </g>
      <g transform="rotate(-2 105 44)">
        <rect className="ill-f3 ill-a-pop" style={{ animationDelay: '1s' }} x="94" y="34" width="22" height="20" rx="2" />
      </g>
      <g transform="rotate(5 63 68)">
        <rect className="ill-f5 ill-a-pop" style={{ animationDelay: '1.5s' }} x="52" y="58" width="22" height="20" rx="2" />
      </g>
      <path className="ill-a-draw ill-route" d="M84 70c6-6 14 4 22-2s10-4 14 0" />
      <rect x="112" y="82" width="20" height="6" rx="3" className="ill-f2 ill-ink" />
    </>
  ),
  snowball: (
    <>
      <path className="ill-soft-strong" d="M14 104c40-6 70-30 132-62v62z" />
      <path className="ill-ink" fill="none" d="M14 104c40-6 70-30 132-62" />
      <circle cx="40" cy="96" r="5" className="ill-paper ill-ink" />
      <circle cx="62" cy="86" r="8" className="ill-paper ill-ink" />
      <g className="ill-a-grow">
        <circle cx="96" cy="64" r="16" className="ill-paper ill-ink" />
        <path className="ill-ink" fill="none" d="M88 58q8 4 14-2M90 70q6-2 12 2" opacity="0.5" />
      </g>
      <path className="ill-ink" fill="none" d="M116 52l8-4M118 60l9-1" opacity="0.5" />
      <Spark x={128} y={26} d={0.5} />
    </>
  ),
  target: (
    <>
      <circle cx="74" cy="62" r="36" className="ill-f2 ill-ink" />
      <circle cx="74" cy="62" r="26" className="ill-paper" />
      <circle cx="74" cy="62" r="16" className="ill-f2" />
      <circle cx="74" cy="62" r="7" className="ill-paper" />
      <g className="ill-a-thud">
        <path className="ill-ink" strokeWidth="4" d="M76 60l48-30" />
        <path className="ill-f1 ill-ink" d="M118 26l14-6-4 14zM124 30l12-2-2 10z" />
      </g>
      <Spark x={30} y={28} d={0.7} />
    </>
  ),
  roles: (
    <>
      <path className="ill-ink" fill="none" d="M24 100h112" />
      <rect x="32" y="74" width="28" height="26" rx="3" className="ill-f1 ill-ink" />
      <rect x="66" y="56" width="28" height="44" rx="3" className="ill-f4 ill-ink" />
      <rect x="100" y="36" width="28" height="64" rx="3" className="ill-f2 ill-ink" />
      <circle className="ill-paper ill-ink ill-a-bob" cx="46" cy="62" r="7" />
      <circle className="ill-paper ill-ink ill-a-bob" style={{ animationDelay: '0.3s' }} cx="80" cy="44" r="7" />
      <circle className="ill-paper ill-ink ill-a-bob" style={{ animationDelay: '0.6s' }} cx="114" cy="24" r="7" />
    </>
  ),
  keyboard: (
    <>
      <rect x="20" y="42" width="120" height="52" rx="6" className="ill-paper ill-ink" />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={`a${i}`} x={30 + i * 17} y="52" width="13" height="11" rx="2" className="ill-soft-strong" />
      ))}
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={`b${i}`} x={38 + i * 17} y="68" width="13" height="11" rx="2" className="ill-soft-strong" />
      ))}
      {[
        ['/', 47, 'ill-f1', 0],
        ['#', 81, 'ill-f3', 0.5],
        ['@', 115, 'ill-f2', 1],
      ].map(([k, x, f, d]) => (
        <g key={k as string} className="ill-a-press" style={{ animationDelay: `${d}s` }}>
          <rect x={(x as number) - 10} y="16" width="20" height="20" rx="4" className={`${f} ill-ink`} />
          <text x={x as number} y="31" className="ill-key">
            {k}
          </text>
        </g>
      ))}
    </>
  ),
  loop: (
    <>
      <circle cx="80" cy="60" r="38" className="ill-soft" />
      <g className="ill-a-spin-slow">
        <path className="ill-ink" fill="none" strokeWidth="5" d="M80 26a34 34 0 0 1 32 46" />
        <path className="ill-f1 ill-ink" d="M104 70l10 10 6-14z" />
        <path className="ill-ink" fill="none" strokeWidth="5" d="M80 94a34 34 0 0 1-32-46" />
        <path className="ill-f3 ill-ink" d="M56 50l-10-10-6 14z" />
      </g>
      <circle cx="80" cy="60" r="14" className="ill-paper ill-ink" />
      <path className="ill-a-draw ill-check" d="M73 60l5 5 9-10" />
    </>
  ),
  scales: (
    <>
      <path className="ill-ink-fill" d="M76 36h8v60h-8zM58 96h44l-4 8H62z" />
      <g className="ill-a-tilt">
        <path className="ill-ink" fill="none" strokeWidth="4" d="M34 40h92" />
        <path className="ill-ink" fill="none" d="M34 40l-12 26M34 40l12 26M126 40l-12 26M126 40l12 26" />
        <path className="ill-f3 ill-ink" d="M18 66h32a16 8 0 0 1-32 0z" />
        <path className="ill-f2 ill-ink" d="M110 66h32a16 8 0 0 1-32 0z" />
      </g>
      <circle cx="80" cy="34" r="6" className="ill-f4 ill-ink" />
    </>
  ),
  folder: (
    <>
      <path className="ill-f4 ill-ink" d="M28 36h34l8 8h62v54H28z" />
      <rect className="ill-paper ill-ink ill-a-bob" x="44" y="24" width="34" height="44" rx="3" />
      <rect className="ill-paper ill-ink ill-a-bob" style={{ animationDelay: '0.4s' }} x="84" y="28" width="34" height="40" rx="3" />
      <path className="ill-line-1" d="M50 34h20M50 42h14" />
      <path className="ill-line-3" d="M90 38h20M90 46h12" />
      <path className="ill-f4 ill-ink" d="M24 56h112l-6 42H30z" />
      <Spark x={136} y={30} d={0.4} />
    </>
  ),
  chat: (
    <>
      <path className="ill-f1 ill-ink" d="M22 28h70a6 6 0 0 1 6 6v26a6 6 0 0 1-6 6H44l-12 10v-10h-10a6 6 0 0 1-6-6V34a6 6 0 0 1 6-6z" />
      <path className="ill-paper ill-ink" d="M66 60h68a6 6 0 0 1 6 6v22a6 6 0 0 1-6 6h-10v10l-12-10H66a6 6 0 0 1-6-6V66a6 6 0 0 1 6-6z" />
      <path className="ill-on-fill" d="M30 40h44M30 50h30" />
      {[0, 1, 2].map((i) => (
        <circle key={i} className="ill-ink-fill ill-a-blink" style={{ animationDelay: `${i * 0.2}s` }} cx={88 + i * 12} cy="77" r="4" />
      ))}
    </>
  ),
  question: (
    <>
      <g className="ill-a-bob">
        <circle cx="80" cy="56" r="36" className="ill-f5 ill-ink" />
        <path className="ill-f5 ill-ink" d="M62 86l-8 16 22-10z" />
        <text x="80" y="72" className="ill-big">
          ?
        </text>
      </g>
      <Spark x={126} y={30} d={0.2} />
      <Spark x={32} y={88} s={0.7} d={0.8} />
    </>
  ),
  shield: (
    <>
      <path className="ill-f1 ill-ink" d="M80 18l38 14v26c0 24-16 40-38 48-22-8-38-24-38-48V32z" />
      <path className="ill-paper" d="M80 28l28 10v20c0 18-12 30-28 36z" opacity="0.25" />
      <path className="ill-a-draw ill-check ill-check--big" d="M64 60l11 11 21-23" />
      <Spark x={128} y={24} d={0.5} />
      <Spark x={30} y={90} s={0.7} d={1} />
    </>
  ),
  cloud: (
    <>
      <path className="ill-paper ill-ink" d="M46 72a18 18 0 0 1 4-35 24 24 0 0 1 45-6 18 18 0 0 1 23 18 12 12 0 0 1-2 23z" />
      <g className="ill-a-float">
        <path className="ill-ink" fill="none" strokeWidth="4" d="M80 44v32" />
        <path className="ill-f3 ill-ink" d="M70 70l10 14 10-14z" />
      </g>
      <rect x="58" y="88" width="44" height="18" rx="3" className="ill-f3 ill-ink" />
      <path className="ill-on-fill" d="M64 97h22" />
    </>
  ),
  flag: (
    <>
      <rect x="46" y="18" width="5" height="88" rx="2" className="ill-ink-fill" />
      <g className="ill-a-wave">
        <path className="ill-paper ill-ink" d="M51 22c18-6 30 6 48 0s30 6 30 6v36s-12-12-30-6-30-6-48 0z" />
        <path
          className="ill-ink-fill"
          d="M51 22c6-2 11-2 16 0v12c-5-2-10-2-16 0zM67 34c5 2 11 2 16 0v12c-5 2-11 2-16 0zM83 22c5-2 11-1 16 0v12c-5-1-11-2-16 0zM99 34c6-2 12-2 16-1v12c-4-1-10-1-16 1zM115 23c5 1 10 3 14 5v12c-4-2-9-4-14-5z"
          opacity="0.85"
        />
      </g>
      <ellipse cx="48" cy="106" rx="18" ry="4" className="ill-soft-strong" />
      <Spark x={124} y={86} d={0.3} />
      <Spark x={30} y={40} s={0.8} d={0.9} />
    </>
  ),
  bulb: (
    <>
      <g className="ill-a-glow">
        {[-60, -30, 0, 30, 60].map((a) => (
          <rect key={a} x="78" y="10" width="4" height="10" rx="2" className="ill-f4" transform={`rotate(${a} 80 52)`} />
        ))}
      </g>
      <path className="ill-f4 ill-ink" d="M80 28a24 24 0 0 0-14 43c3 2 5 6 5 10h18c0-4 2-8 5-10a24 24 0 0 0-14-43z" />
      <rect x="70" y="84" width="20" height="8" rx="2" className="ill-paper ill-ink" />
      <rect x="73" y="94" width="14" height="6" rx="2" className="ill-paper ill-ink" />
      <path className="ill-ink" fill="none" d="M74 64l6 6 6-6" opacity="0.6" />
    </>
  ),
  magnifier: (
    <>
      <rect x="34" y="18" width="70" height="88" rx="4" className="ill-paper ill-ink" />
      <path className="ill-line-3" d="M44 32h40M44 42h30" />
      <path className="ill-line-2" d="M44 54h44M44 64h36" />
      <path className="ill-line-1" d="M44 76h40M44 86h24" />
      <g className="ill-a-scan">
        <circle cx="96" cy="56" r="17" className="ill-soft ill-ink" strokeWidth="5" />
        <path className="ill-ink" strokeWidth="7" d="M108 68l16 16" />
      </g>
    </>
  ),
  broom: (
    <>
      <rect x="22" y="22" width="80" height="62" rx="5" className="ill-paper ill-ink" />
      <path className="ill-line-1" d="M32 36h40" opacity="0.35" />
      <path className="ill-line-2" d="M32 48h52" opacity="0.35" />
      <path className="ill-line-3" d="M32 60h30" opacity="0.35" />
      <g className="ill-a-sweep">
        <path className="ill-ink" strokeWidth="5" d="M132 16l-26 62" />
        <path className="ill-f4 ill-ink" d="M98 72l18 8-6 22-22-10z" />
      </g>
      <Spark x={40} y={96} d={0.2} />
      <Spark x={70} y={100} s={0.7} d={0.7} />
    </>
  ),
  gauge: (
    <>
      <path className="ill-paper ill-ink" d="M22 90a58 58 0 0 1 116 0z" />
      <path className="ill-seg ill-seg-3" d="M34 90a46 46 0 0 1 20-38" />
      <path className="ill-seg ill-seg-4" d="M58 48a46 46 0 0 1 44 0" />
      <path className="ill-seg ill-seg-2" d="M106 52a46 46 0 0 1 20 38" />
      <g className="ill-a-needle">
        <path className="ill-ink-fill" d="M78 90l2-46 4 46z" />
      </g>
      <circle cx="80" cy="90" r="7" className="ill-f1 ill-ink" />
      <path className="ill-ink" fill="none" d="M18 98h124" />
    </>
  ),
  gate: (
    <>
      <rect x="24" y="44" width="12" height="58" rx="2" className="ill-paper ill-ink" />
      <g className="ill-a-lift">
        <rect x="34" y="50" width="96" height="10" rx="3" className="ill-paper ill-ink" />
        <path className="ill-f2" d="M46 51h12l-6 8h-12zM70 51h12l-6 8H64zM94 51h12l-6 8H88zM118 51h10l-4 8h-12z" />
      </g>
      <rect x="128" y="20" width="16" height="34" rx="4" className="ill-ink-fill" />
      <circle cx="136" cy="30" r="5" className="ill-f2 ill-a-blink" />
      <circle cx="136" cy="44" r="5" className="ill-f3 ill-a-blink" style={{ animationDelay: '0.75s' }} />
      <path className="ill-ink" fill="none" d="M14 102h132" />
    </>
  ),
  terminal: (
    <>
      <rect x="20" y="22" width="120" height="78" rx="6" className="ill-term ill-ink" />
      <path className="ill-ink" fill="none" d="M20 36h120" />
      <circle cx="30" cy="29" r="2.5" className="ill-f2" />
      <circle cx="39" cy="29" r="2.5" className="ill-f4" />
      <circle cx="48" cy="29" r="2.5" className="ill-f3" />
      <path className="ill-term-text" d="M32 52l8 6-8 6" />
      <path className="ill-term-text ill-a-type" d="M46 64h40" />
      <path className="ill-term-dim" d="M32 78h60M32 88h38" />
      <rect className="ill-f3 ill-a-cursor" x="74" y="83" width="8" height="10" />
    </>
  ),
  branch: (
    <>
      <path className="ill-ink" fill="none" strokeWidth="4" d="M24 82h112" />
      <path className="ill-ink ill-a-draw" fill="none" strokeWidth="4" d="M48 82c10 0 12-34 30-34h30c18 0 16 34 28 34" />
      {[
        [24, 82, 'ill-f1', 0],
        [48, 82, 'ill-f1', 0.2],
        [78, 48, 'ill-f3', 0.4],
        [108, 48, 'ill-f3', 0.6],
        [136, 82, 'ill-f2', 0.8],
        [92, 82, 'ill-f1', 1],
      ].map(([x, y, f, d]) => (
        <circle key={`${x}-${y}`} cx={x as number} cy={y as number} r="8" className={`${f} ill-ink ill-a-pulse`} style={{ animationDelay: `${d}s` }} />
      ))}
    </>
  ),
  stack: (
    <>
      <path className="ill-ink" fill="none" d="M30 104h100" />
      {[
        ['ill-f1', 90, 0],
        ['ill-f2', 74, 0.4],
        ['ill-f3', 58, 0.8],
        ['ill-f4', 42, 1.2],
        ['ill-f5', 26, 1.6],
      ].map(([f, y, d], i) => (
        <rect key={f as string} x={46 + (i % 2) * 6} y={y as number} width="62" height="14" rx="3" className={`${f} ill-ink ill-a-drop`} style={{ animationDelay: `${d}s` }} />
      ))}
    </>
  ),
  sparkle: (
    <>
      <rect x="30" y="26" width="100" height="70" rx="6" className="ill-paper ill-ink" />
      <path className="ill-ink" fill="none" d="M30 40h100" />
      <rect x="40" y="50" width="24" height="36" rx="3" className="ill-f1" />
      <rect x="70" y="50" width="24" height="16" rx="3" className="ill-f3" />
      <rect x="70" y="70" width="50" height="16" rx="3" className="ill-f2" />
      <rect x="100" y="50" width="20" height="16" rx="3" className="ill-f4" />
      <Spark x={130} y={24} s={1.6} d={0} />
      <Spark x={26} y={96} s={1.2} d={0.5} />
      <Spark x={140} y={84} s={0.8} d={1} />
    </>
  ),
}

export const SCENE_IDS = Object.keys(SCENES) as SceneId[]

export function Illustration({ scene, className = '' }: { scene: SceneId; className?: string }) {
  return (
    <svg className={`ill ${className}`} viewBox="0 0 160 120" aria-hidden="true" focusable="false">
      <circle cx="80" cy="62" r="54" className="ill-backdrop" />
      {SCENES[scene] ?? SCENES.sparkle}
    </svg>
  )
}

// Small portraits for the two developers in the deck's stories: Asha builds the habit, Ben falls into the trap.
export function Avatar({ who }: { who: 'asha' | 'ben' }) {
  const asha = who === 'asha'
  return (
    <svg className={`avatar avatar--${who}`} viewBox="0 0 40 40" aria-hidden="true" focusable="false">
      <circle cx="20" cy="20" r="19" className="avatar__bg" />
      <circle cx="20" cy="17" r="8" className="avatar__face" />
      {asha ? (
        <path className="avatar__hair" d="M11 17c0-7 4-10 9-10s9 3 9 10c-2-3-5-5-9-5s-7 2-9 5zM28 15c2 4 2 10 0 14l-2-10z" />
      ) : (
        <path className="avatar__hair" d="M12 15c0-5 4-8 8-8 5 0 8 3 8 8-3-2-5-3-8-3s-5 1-8 3z" />
      )}
      <path className="avatar__body" d="M7 36c2-6 7-9 13-9s11 3 13 9a19 19 0 0 1-26 0z" />
    </svg>
  )
}
