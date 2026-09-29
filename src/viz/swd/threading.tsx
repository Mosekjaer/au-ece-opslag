import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './threading.css'

/* 11 Threading in C#.pdf s. 12 (“Context switching (not considered by Ahmdal’s law!)”,
   “theoretical upper bound”), s. 13 (formlen, P og N, eksemplet P = 0.9, N = 2 → 1.818,
   “As N→∞, S(N) →?”) og s. 14 (grafen “Amdahl’s Law”: Speedup 0–20 mod Number of
   Processors 1–65536, log-skala, Parallel Portion 50/75/90/95 %). Kurverne er beregnet
   med formlen fra s. 13; slidets farver er ikke brugt. Markdown:
   swd/markdown/slides/SW4SWD-01_W10_Threading_in_CSharp.md, afsnit 3. */

interface Curve {
  id: string
  p: number
  pct: string
  calc: string
  roof: number
  /** Trin hvor kurven tegnes, og forsinkelse inden for trinnet (s). */
  at: number
  delay: number
}
const CURVES: Curve[] = [
  { id: 'c50', p: 0.5, pct: '50 %', calc: '1 / (1 − 0.5)', roof: 2, at: 1, delay: 0 },
  { id: 'c75', p: 0.75, pct: '75 %', calc: '1 / (1 − 0.75)', roof: 4, at: 2, delay: 0 },
  { id: 'c90', p: 0.9, pct: '90 %', calc: '1 / (1 − 0.9)', roof: 10, at: 2, delay: 0.9 },
  { id: 'c95', p: 0.95, pct: '95 %', calc: '1 / (1 − 0.95)', roof: 20, at: 3, delay: 0 },
]
const DRAW = 1.5

const S = (p: number, n: number) => 1 / (1 - p + p / n)

interface Layout {
  w: number
  h: number
  font: number
  x0: number
  x1: number
  yTop: number
  yBot: number
  /** Eksponenter (2^k) der får en label. */
  xLabels: number[]
  yLabels: number[]
  wide: boolean
}
const WIDE: Layout = {
  w: 600,
  h: 322,
  font: 13,
  x0: 44,
  x1: 500,
  yTop: 14,
  yBot: 268,
  xLabels: Array.from({ length: 17 }, (_, k) => k),
  yLabels: [0, 2, 4, 6, 8, 10, 12, 14, 16, 18, 20],
  wide: true,
}
const NARROW: Layout = {
  w: 300,
  h: 262,
  font: 12,
  x0: 26,
  x1: 262,
  yTop: 22,
  yBot: 212,
  xLabels: [0, 2, 4, 6, 8, 10, 12, 14, 16],
  yLabels: [0, 4, 8, 12, 16, 20],
  wide: false,
}

const nLabel = (k: number) => {
  const n = 2 ** k
  return n >= 1024 ? `${n / 1024}K` : String(n)
}

function Graph({ L, step }: { L: Layout; step: number }) {
  const X = (k: number) => L.x0 + ((L.x1 - L.x0) * k) / 16
  const Y = (s: number) => L.yBot - ((L.yBot - L.yTop) * s) / 20
  const path = (p: number) => {
    const pts: string[] = []
    for (let i = 0; i <= 128; i++) {
      const k = i / 8
      pts.push(`${i === 0 ? 'M' : 'L'}${X(k).toFixed(1)} ${Y(S(p, 2 ** k)).toFixed(1)}`)
    }
    return pts.join(' ')
  }
  const grid = Array.from({ length: 11 }, (_, i) => i * 2)
  const dot = { x: X(1), y: Y(S(0.9, 2)) }
  const showDot = step >= 2
  const final = step >= 4

  return (
    <svg
      className={`thr-svg ${L.wide ? 'thr-wide' : 'thr-narrow'}`}
      viewBox={`0 0 ${L.w} ${L.h}`}
      style={{ fontSize: L.font }}
      aria-hidden="true"
    >
      {/* Gitter hver 2.00 som på s. 14 */}
      {grid.map((g) => (
        <line key={g} className={g === 0 ? 'thr-axis' : 'thr-grid'} x1={L.x0} x2={L.x1} y1={Y(g)} y2={Y(g)} />
      ))}
      {Array.from({ length: 17 }, (_, k) => (
        <line key={k} className="thr-tick" x1={X(k)} x2={X(k)} y1={L.yBot} y2={L.yBot + 4} />
      ))}
      <line className="thr-axis" x1={L.x0} x2={L.x0} y1={L.yTop} y2={L.yBot} />

      {L.yLabels.map((g) => (
        <text key={g} className="thr-num" x={L.x0 - 6} y={Y(g)} textAnchor="end" dominantBaseline="central">
          {g}
        </text>
      ))}
      {L.xLabels.map((k) => (
        <text key={k} className="thr-num" x={X(k)} y={L.yBot + 17} textAnchor="middle">
          {nLabel(k)}
        </text>
      ))}
      <text className="thr-axis-title" x={(L.x0 + L.x1) / 2} y={L.h - 4} textAnchor="middle">
        Number of Processors (log₂)
      </text>
      {L.wide ? (
        <text className="thr-axis-title" transform={`translate(12 ${(L.yTop + L.yBot) / 2}) rotate(-90)`} textAnchor="middle">
          Speedup
        </text>
      ) : (
        <text className="thr-axis-title" x={L.x0 - 6} y={9} textAnchor="start">
          Speedup
        </text>
      )}

      {/* Loftlinjer: 1 / (1 − P) */}
      {CURVES.map((c) => {
        const on = step >= c.at
        return (
          <motion.line
            key={`roof-${c.id}`}
            className="thr-roof"
            data-c={c.id}
            x1={L.x0}
            x2={L.x1}
            y1={Y(c.roof)}
            y2={Y(c.roof)}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: c.delay + DRAW - 0.2 } : t.fade}
          />
        )
      })}

      {/* Kurverne, tegnet fra N = 1 mod højre */}
      {CURVES.map((c) => {
        const on = step >= c.at
        const now = step === c.at
        return (
          <motion.path
            key={c.id}
            className="thr-curve"
            data-c={c.id}
            data-now={now || undefined}
            d={path(c.p)}
            initial={false}
            animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
            transition={on ? { pathLength: { ...t.travel, duration: DRAW, delay: c.delay }, opacity: { ...t.fade, delay: c.delay } } : t.fade}
          />
        )
      })}

      {/* Kurvelabel ved højre ende, loftet efter pilen */}
      {CURVES.map((c) => {
        const on = step >= c.at
        const y = Y(c.roof) + (c.id === 'c50' ? 5 : c.id === 'c75' ? -3 : 0)
        return (
          <motion.text
            key={`lab-${c.id}`}
            className="thr-end"
            data-c={c.id}
            x={L.x1 + 6}
            y={y}
            dominantBaseline="central"
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: c.delay + DRAW - 0.3 } : t.fade}
          >
            <tspan className="thr-end-pct">{c.pct}</tspan>
            {L.wide && <tspan className="thr-end-roof">{` → ${c.roof}`}</tspan>}
          </motion.text>
        )
      })}

      {/* Slidets eksempel: P = 0.9, N = 2 → 1.818 */}
      <motion.g
        className="thr-dot"
        data-now={step === 2 || undefined}
        initial={false}
        animate={{ opacity: showDot ? 1 : 0 }}
        transition={showDot ? { ...t.fade, delay: step === 2 ? 1.1 : 0 } : t.fade}
      >
        <path d={`M${dot.x} ${dot.y + 4} L${dot.x + 12} ${Y(0.35) - 11}`} className="thr-leader" />
        <circle cx={dot.x} cy={dot.y} r={3.6} />
        <text x={dot.x + 12} y={Y(0.35)} textAnchor="start">
          1.818 <tspan className="thr-dot-sub">(P = 0.9, N = 2)</tspan>
        </text>
      </motion.g>

      <motion.text
        className="thr-inf"
        x={L.wide ? L.x0 + 10 : X(7.4)}
        y={L.wide ? Y(17.6) : Y(14.4)}
        initial={false}
        animate={{ opacity: final ? 1 : 0 }}
        transition={t.fade}
      >
        S(∞) = 1 / (1 − P)
      </motion.text>
    </svg>
  )
}

/** Rækker i tabellen der er i fokus pr. trin. */
const HOT: Record<number, string[]> = { 1: ['c50'], 2: ['c75', 'c90'], 3: ['c95'] }

function Amdahl({ step }: { step: number }) {
  const final = step >= 4
  return (
    <div className="thr">
      <div className="thr-formula">
        <span className="thr-kicker">Amdahl’s Law</span>
        <code className="thr-f">S(N) = 1 / ((1 − P) + P / N)</code>
        <dl className="thr-def">
          <dt>
            <code>P</code>
          </dt>
          <dd>fraction of the algorithm that can be parallelized</dd>
          <dt>
            <code>N</code>
          </dt>
          <dd>number of CPU cores</dd>
        </dl>
        <p className="thr-ex" data-now={step === 2 || undefined}>
          <code>P = 0.9, N = 2 → S(N) = 1.818</code>
        </p>
      </div>

      <div className="thr-graph">
        <Graph L={WIDE} step={step} />
        <Graph L={NARROW} step={step} />
      </div>

      <div className="thr-side">
        <table className="thr-table">
          <thead>
            <tr>
              <th>Parallel Portion</th>
              <th>
                <code>S(N)</code>, <code>N → ∞</code>
              </th>
            </tr>
          </thead>
          <tbody>
            {CURVES.map((c) => {
              const on = step >= c.at
              const hot = HOT[step]?.includes(c.id)
              return (
                <tr key={c.id} data-c={c.id} data-on={on || undefined} data-now={hot || undefined}>
                  <td>
                    <span className="thr-swatch" />
                    {c.pct}
                  </td>
                  <td>
                    <motion.code
                      initial={false}
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={on ? { ...t.fade, delay: c.delay + DRAW - 0.2 } : t.fade}
                    >
                      {c.calc} = <b>{c.roof}</b>
                    </motion.code>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <motion.p className="thr-note" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
          Context switching er ikke med i loven — den giver en teoretisk øvre grænse.
        </motion.p>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'threading',
  title: 'Den sekventielle del sætter loftet',
  steps: [
    { caption: 'Speedup afhænger af den parallelle andel `P` og antallet af cores `N`.', hold: 2200 },
    { caption: 'Med halvdelen parallel når man aldrig over 2 — uanset antal cores.', hold: 2800 },
    { caption: '90 % parallel på to cores giver 1,818 — og loftet er 10.', hold: 3200 },
    { caption: 'Selv 95 % parallel når kun 20 — de sidste 5 % sekventiel kode bestemmer loftet.', hold: 2800 },
    { caption: 'Når `N → ∞`, går `S(N)` mod `1 / (1 − P)`. Cores ain’t all.', hold: 3000 },
  ],
  Component: Amdahl,
}

export default viz
