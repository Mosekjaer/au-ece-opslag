import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './doa-growth.css'

/* Lecture02.pdf s. 19 (tabellen “Growth of functions”, n = 2 … 1024: log n, √n, n,
   n log n, n², n³, 2ⁿ — 2ⁿ stopper ved n = 512 med 1.34 × 10¹⁵⁴), s. 23 (vækstklasserne
   1, log N, N, N log N, N², N³, 2ᴺ), s. 25–26 (kurverne skærer hinanden for små N;
   rækkefølgen ligger fast for store N — asymptotisk opførsel). Kurverne er tegnet her
   (log med grundtal 2, som i tabellen); tallene i tabellen er slidets.
   Indhold: src/content/doa/p1-grundlag.ts (big-o). */

// Plot: n ∈ [1, 12], y ∈ [0, 48], viewBox 320 × 236.
const X0 = 34
const X1 = 262
const Y0 = 204 // y = 0
const Y1 = 18 // y = YMAX
const NMAX = 12
const YMAX = 48
const px = (n: number) => X0 + ((n - 1) / (NMAX - 1)) * (X1 - X0)
const py = (y: number) => Y0 - (y / YMAX) * (Y0 - Y1)

interface Curve {
  id: string
  label: ReactNode
  f: (n: number) => number
  at: number
  /** Labelens placering (viewBox), sat i hånden så de ikke overlapper. */
  lx: number
  ly: number
  anchor: 'start' | 'middle'
}

const lg = Math.log2

function path(f: (n: number) => number) {
  const pts: string[] = []
  for (let n = 1; n <= NMAX + 1e-9; n += 0.05) {
    const y = f(n)
    if (y > YMAX) {
      // Skær kurven præcis ved toppen (bisektion), så animationen ikke tegner uden for plottet.
      let lo = n - 0.05
      let hi = n
      for (let k = 0; k < 20; k++) {
        const m = (lo + hi) / 2
        if (f(m) > YMAX) hi = m
        else lo = m
      }
      pts.push(`${px(lo).toFixed(2)} ${py(YMAX).toFixed(2)}`)
      break
    }
    pts.push(`${px(n).toFixed(2)} ${py(y).toFixed(2)}`)
  }
  return 'M' + pts.join(' L')
}

const CURVES: Curve[] = [
  { id: 'c1', label: '1', f: () => 1, at: 1, lx: X1 + 6, ly: py(1) + 1, anchor: 'start' },
  { id: 'log', label: 'log n', f: lg, at: 1, lx: X1 + 6, ly: py(lg(NMAX)) - 5, anchor: 'start' },
  { id: 'n', label: 'n', f: (n) => n, at: 2, lx: X1 + 6, ly: py(NMAX), anchor: 'start' },
  { id: 'nlog', label: 'n log n', f: (n) => n * lg(n), at: 3, lx: X1 + 6, ly: py(NMAX * lg(NMAX)), anchor: 'start' },
  { id: 'n2', label: 'n²', f: (n) => n * n, at: 4, lx: px(Math.sqrt(YMAX)) + 4, ly: Y1 - 8, anchor: 'middle' },
  { id: 'exp', label: '2ⁿ', f: (n) => 2 ** n, at: 5, lx: px(lg(YMAX)) - 4, ly: Y1 - 8, anchor: 'middle' },
]

const D = Object.fromEntries(CURVES.map((c) => [c.id, path(c.f)]))

// L02 s. 19 — udvalgte rækker. 2ⁿ ved 1024 står ikke i tabellen.
const COLS: { key: string; head: ReactNode; at: number }[] = [
  { key: 'log', head: 'log n', at: 1 },
  { key: 'nlog', head: 'n log n', at: 3 },
  { key: 'n2', head: 'n²', at: 4 },
  { key: 'exp', head: '2ⁿ', at: 5 },
]
const ROWS: { n: string; v: ReactNode[] }[] = [
  { n: '16', v: ['4', '64', '256', '65536'] },
  { n: '64', v: ['6', '384', '4096', <>1,84·10<sup>19</sup></>] },
  { n: '512', v: ['9', '4608', '262144', <>1,34·10<sup>154</sup></>] },
  { n: '1024', v: ['10', '10240', '1048576', '—'] },
]

const XT = [2, 4, 6, 8, 10, 12]
const YT = [0, 16, 32, 48]

function Plot({ step }: { step: number }) {
  return (
    <svg className="dgr-svg" viewBox="0 0 320 236" aria-hidden="true">
      {YT.map((y) => (
        <g key={y}>
          <line x1={X0} x2={X1} y1={py(y)} y2={py(y)} className={y === 0 ? 'dgr-axis' : 'dgr-grid'} />
          <text x={X0 - 6} y={py(y)} className="dgr-tick" textAnchor="end" dominantBaseline="central">
            {y}
          </text>
        </g>
      ))}
      <line x1={X0} x2={X0} y1={Y0} y2={Y1} className="dgr-axis" />
      {XT.map((n) => (
        <text key={n} x={px(n)} y={Y0 + 14} className="dgr-tick" textAnchor="middle" dominantBaseline="central">
          {n}
        </text>
      ))}
      <text x={(X0 + X1) / 2} y={Y0 + 28} className="dgr-axt" textAnchor="middle" dominantBaseline="central">
        n
      </text>

      {CURVES.map((c) => {
        const on = step >= c.at
        const tone = step === c.at ? 'focus' : 'idle'
        return (
          <g key={c.id} className="dgr-curve" data-tone={tone}>
            <motion.path
              d={D[c.id]}
              className="dgr-line"
              initial={false}
              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={on ? { ...t.travel, duration: 1.1 } : t.fade}
            />
            <motion.text
              x={c.lx}
              y={c.ly}
              textAnchor={c.anchor}
              dominantBaseline="central"
              className="dgr-label"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: 0.7 } : t.fade}
            >
              {c.label}
            </motion.text>
          </g>
        )
      })}
    </svg>
  )
}

function Growth({ step }: { step: number }) {
  const last = step >= 6
  return (
    <div className="dgr">
      <div className="dgr-plot">
        <Plot step={step} />
        <motion.p
          className="dgr-cross"
          initial={false}
          animate={{ opacity: step >= 5 ? 1 : 0 }}
          transition={step >= 5 ? t.settle : t.fade}
        >
          <span className="mono">2ⁿ</span> ligger under <span className="mono">n²</span> ved n = 3 (8 &lt; 9), men
          fra n = 5 er den over — for altid.
        </motion.p>
      </div>

      <div className="dgr-side">
        <span className="vcaps">L02 s. 19 · antal skridt</span>
        <div className="dgr-tablewrap">
          <table className="dgr-table">
            <thead>
              <tr>
                <th>n</th>
                {COLS.map((c) => (
                  <th key={c.key} data-on={step >= c.at || undefined} data-now={step === c.at || undefined}>
                    {c.head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((r) => (
                <tr key={r.n}>
                  <th scope="row" data-now={step === 2 || undefined}>
                    {r.n}
                  </th>
                  {r.v.map((v, i) => {
                    const on = step >= COLS[i].at
                    return (
                      <td key={i} data-now={step === COLS[i].at || undefined}>
                        <motion.span
                          initial={false}
                          animate={{ opacity: on ? 1 : 0 }}
                          transition={on ? { ...t.settle, delay: 0.1 + ROWS.indexOf(r) * 0.07 } : t.fade}
                        >
                          {v}
                        </motion.span>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="dgr-foot">Slidet stopper 2ⁿ ved n = 512.</p>
        <motion.ol
          className="dgr-rank"
          initial={false}
          animate={{ opacity: last ? 1 : 0 }}
          transition={last ? t.settle : t.fade}
        >
          {['1', 'log n', 'n', 'n log n', 'n²', '2ⁿ'].map((s, i) => (
            <li key={s}>
              {i > 0 && <span className="dgr-lt">&lt;</span>}
              <span className="mono">{s}</span>
            </li>
          ))}
        </motion.ol>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-growth',
  title: 'Vækstklasserne fra 1 til 2ⁿ',
  steps: [
    {
      caption: 'Antal skridt som funktion af problemstørrelsen n. Tabellen fra L02 s. 19 har de præcise tal op til n = 1024.',
      hold: 2000,
    },
    {
      caption: '**Konstant** (1) og **logaritmisk** (log n) er næsten flade. Selv ved n = 1024 er log n kun 10.',
      hold: 2400,
    },
    { caption: '**Lineær** (n): dobbelt så stort input giver dobbelt så mange skridt.', hold: 1800 },
    {
      caption: '**Linearitmisk** (n log n) ligger lidt over n — typisk for rekursive algoritmer. Ved 1024 er det 10240.',
      hold: 2400,
    },
    {
      caption: '**Kvadratisk** (n²) — alle par. Kurven forlader plottet allerede ved n ≈ 7; ved 1024 er den over en million.',
      hold: 2600,
    },
    {
      caption:
        '**Eksponentiel** (2ⁿ) — brute force. Den skærer n² for små n, men ved n = 64 er den 1,84 × 10¹⁹. Kurverne kan krydse for små n.',
      hold: 3000,
    },
    {
      caption:
        'For store n ligger rækkefølgen fast — **asymptotisk opførsel**. Derfor sammenligner O-notation kun den dominerende vækstklasse.',
      hold: 3000,
    },
  ],
  Component: Growth,
}

export default viz
