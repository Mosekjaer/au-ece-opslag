import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './doa-heuristics.css'

/* Lecture10.pdf s. 24 (Manhattan |Δx| + |Δy| som en L-formet linje, euklidisk
   sqrt(|Δx|^2 + |Δy|^2) som en ret linje gennem muren), s. 26 (admissible: h ≤ sand
   cost), s. 28 (gitteret: S (2,7), T (6,5), muren) og s. 50 (sand cost 6).
   Heuristics.pdf s. 1 (spektret h = 0 → Dijkstra … h ≫ g → greedy best-first),
   s. 8–9 (diagonal/octile: D = 1, D2 = √2), s. 10 (“Euclidean squared” — “Do not do
   this!”) og s. 13 (tie-breaking: heuristic *= 1.0 + p, p = 1/1000).
   Linjerne tegnes på s. 28-gitteret frem for s. 24’s (som ikke har akser), så tallene
   passer til A*-eksemplet. Octile ≈ 4,83, euklid √20 ≈ 4,47, euklid² = 20 og
   6 · 1,001 = 6,006 er egne udregninger — mærket i figuren. Indhold: p6-grafer.ts. */

type P = readonly [number, number]
const N = 10
const C = 28 // cellestørrelse i viewBox
const OX = 18 // plads til y-aksen
const OY = 4
const S: P = [2, 7]
const T: P = [6, 5]
const WALL: P[] = [
  [3, 3],
  [4, 3],
  [5, 3],
  [5, 4],
  [5, 5],
  [5, 6],
]
const cx = (x: number) => OX + x * C + C / 2
const cy = (y: number) => OY + y * C + C / 2
const pts = (ps: P[]) => ps.map(([x, y]) => `${cx(x)},${cy(y)}`).join(' ')

type LineId = 'man' | 'diag' | 'euc'
const LINES: { id: LineId; at: number; pts: P[] }[] = [
  // Manhattan: 4 vandret + 2 lodret (her samme L som den faktiske sti)
  { id: 'man', at: 1, pts: [S, [6, 7], T] },
  // Diagonal: 2 diagonale skridt + 2 vandrette
  { id: 'diag', at: 2, pts: [S, [4, 5], T] },
  // Euklid: ret linje
  { id: 'euc', at: 3, pts: [S, T] },
]

interface Row {
  id: string
  at: number
  line?: LineId
  name: ReactNode
  calc: ReactNode
  v: number
  shown: string
  own?: boolean
  verdict: 'ok' | 'exact' | 'over' | 'slight'
}

// Sorteret efter værdi, så rækkerne selv danner spektret.
const ROWS: Row[] = [
  { id: 'zero', at: 4, name: <>h = 0</>, calc: <>kun g tæller</>, v: 0, shown: '0', verdict: 'ok' },
  {
    id: 'euc',
    at: 3,
    line: 'euc',
    name: 'euklid',
    calc: <>√(4² + 2²) = √20</>,
    v: Math.sqrt(20),
    shown: '4,47',
    own: true,
    verdict: 'ok',
  },
  {
    id: 'diag',
    at: 2,
    line: 'diag',
    name: 'diagonal (octile)',
    calc: <>4 + (√2 − 1) · 2</>,
    v: 4 + 2 * (Math.SQRT2 - 1),
    shown: '4,83',
    own: true,
    verdict: 'ok',
  },
  { id: 'man', at: 1, line: 'man', name: 'Manhattan', calc: <>|4| + |2|</>, v: 6, shown: '6', verdict: 'exact' },
  {
    id: 'tie',
    at: 6,
    name: 'Manhattan · 1,001',
    calc: <>tie-breaking, p = 1/1000</>,
    v: 6.006,
    shown: '6,006',
    own: true,
    verdict: 'slight',
  },
  {
    id: 'sq',
    at: 5,
    name: 'euklid²',
    calc: <>4² + 2², ingen rod</>,
    v: 20,
    shown: '20',
    own: true,
    verdict: 'over',
  },
]

const MAX = 8 // aksen går til 8; større værdier knækkes
const pct = (v: number) => `${(Math.min(v, MAX) / MAX) * 100}%`
const FINAL = 7

const VERDICT: Record<Row['verdict'], { tone: 'ok' | 'neg' | 'idle'; text: string }> = {
  ok: { tone: 'idle', text: 'admissible' },
  exact: { tone: 'ok', text: 'eksakt her' },
  slight: { tone: 'idle', text: 'en smule over' },
  over: { tone: 'neg', text: 'overestimerer' },
}

function GridSvg({ step }: { step: number }) {
  const active = LINES.find((l) => l.at === step)?.id
  return (
    <svg className="dhe-svg" viewBox={`0 0 ${OX + N * C + 4} ${OY + N * C + 18}`} aria-hidden="true">
      {Array.from({ length: N }, (_, y) =>
        Array.from({ length: N }, (_, x) => {
          const wall = WALL.some((w) => w[0] === x && w[1] === y)
          const end = (x === S[0] && y === S[1]) || (x === T[0] && y === T[1])
          return (
            <rect
              key={`${x}-${y}`}
              x={OX + x * C + 1}
              y={OY + y * C + 1}
              width={C - 2}
              height={C - 2}
              rx={2}
              className={wall ? 'dhe-wall' : end ? 'dhe-end' : 'dhe-cell'}
            />
          )
        }),
      )}
      {Array.from({ length: N }, (_, i) => (
        <g key={i} className="dhe-axis">
          <text x={cx(i)} y={OY + N * C + 12} textAnchor="middle">
            {i}
          </text>
          <text x={OX - 5} y={cy(i)} textAnchor="end" dominantBaseline="central">
            {i}
          </text>
        </g>
      ))}
      {LINES.map((l) => {
        const on = step >= l.at
        return (
          <motion.polyline
            key={l.id}
            points={pts(l.pts)}
            className="dhe-line"
            data-line={l.id}
            data-active={active === l.id || step >= FINAL || undefined}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? t.settle : t.fade}
          />
        )
      })}
      <text x={cx(S[0])} y={cy(S[1])} className="dhe-st" textAnchor="middle" dominantBaseline="central">
        S
      </text>
      <text x={cx(T[0])} y={cy(T[1])} className="dhe-st" textAnchor="middle" dominantBaseline="central">
        T
      </text>
    </svg>
  )
}

function Heuristics({ step }: { step: number }) {
  return (
    <div className="dhe">
      <section className="dhe-left">
        <div className="dhe-head">
          <span className="vcaps">h(S) på L10 s. 28-gitteret</span>
          <span className="dhe-q mono">Δx = 4, Δy = 2</span>
        </div>
        <GridSvg step={step} />
        <p className="dhe-note">Heuristikken ser ikke muren — kun koordinaterne.</p>
      </section>

      <section className="dhe-right">
        <div className="dhe-head">
          <span className="vcaps">Hvor stor er h(S)?</span>
          <span className="dhe-own">* egen udregning</span>
        </div>
        <ol className="dhe-rows">
          {ROWS.map((r) => {
            const on = step >= r.at
            const now = step === r.at
            const v = VERDICT[r.verdict]
            return (
              <li
                key={r.id}
                className="dhe-row"
                data-on={on || undefined}
                data-now={now || undefined}
                data-over={r.verdict === 'over' || r.verdict === 'slight' || undefined}
              >
                <div className="dhe-row-top">
                  {r.line ? <i className="dhe-sw" data-line={r.line} /> : <i className="dhe-sw" data-line="none" />}
                  <span className="dhe-name">{r.name}</span>
                  <span className="dhe-meta">
                  <motion.span
                    className="dhe-calc mono"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={on ? t.settle : t.fade}
                  >
                    {r.calc}
                  </motion.span>
                  <Tag show={step >= FINAL} tone={v.tone}>
                    {v.text}
                  </Tag>
                  </span>
                  <motion.span
                    className="dhe-val mono"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={on ? t.settle : t.fade}
                  >
                    {r.shown}
                    {r.own && <sup className="dhe-star">*</sup>}
                  </motion.span>
                </div>
                <div className="dhe-track">
                  <motion.span
                    className="dhe-bar"
                    initial={false}
                    animate={{ width: on ? pct(r.v) : '0%' }}
                    transition={on ? t.travel : t.fade}
                  />
                  {r.v > MAX && (
                    <motion.span
                      className="dhe-break"
                      initial={false}
                      animate={{ opacity: on ? 1 : 0 }}
                      transition={on ? { ...t.fade, delay: 0.6 } : t.fade}
                    >
                      ≫
                    </motion.span>
                  )}
                  <span className="dhe-true" style={{ left: pct(6) }} />
                </div>
              </li>
            )
          })}
        </ol>
        <div className="dhe-axisrow">
          <span className="dhe-tick" style={{ left: '0%' }}>
            0
          </span>
          <span className="dhe-tick" style={{ left: pct(6) }}>
            sand cost 6
          </span>
          <span className="dhe-tick" style={{ left: '100%' }}>
            8
          </span>
        </div>
        <motion.div
          className="dhe-spectrum"
          initial={false}
          animate={{ opacity: step >= FINAL ? 1 : 0 }}
          transition={step >= FINAL ? t.settle : t.fade}
        >
          <span>
            ← mod <strong>Dijkstra</strong>: korteste vej, flere udvidelser
          </span>
          <span>
            mod <strong className="is-neg">greedy best-first</strong>: hurtig, ingen garanti →
          </span>
        </motion.div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-heuristics',
  title: 'Tre afstandsmål og h-spektret for samme S og T',
  steps: [
    {
      caption:
        'A* skal gætte resten af vejen fra S (2,7) til T (6,5): `Δx = 4`, `Δy = 2`. Den sande cost er 6 — stien fra A*-eksemplet.',
      hold: 2400,
    },
    {
      caption:
        '**Manhattan** `|Δx| + |Δy| = 6` til 4-vejs bevægelse. Fra S rammer den den sande cost præcist; bag muren, fx i (4,5), gætter den for lavt.',
      hold: 2600,
    },
    {
      caption:
        '**Diagonal** (octile, `D2 = √2`) til 8-vejs: to diagonale skridt sparer hver `2 − √2`. `h ≈ 4,83` — under 6, altså admissible.',
      hold: 2800,
    },
    {
      caption:
        '**Euklid** `√(Δx² + Δy²) ≈ 4,47` går lige gennem muren. Kortest af de tre: stadig korteste vej, men A* udvider flere felter.',
      hold: 2800,
    },
    {
      caption: '`h = 0` er den nedre grænse: kun `g` tæller, og A* *er* Dijkstra.',
      hold: 2000,
    },
    {
      caption:
        '**Euklid i anden** sparer roden og giver 20 — over tre gange den sande cost. `g` drukner, og A* bliver greedy. “Do not do this!”',
      hold: 3000,
    },
    {
      caption:
        '**Tie-breaking**: `h *= 1,001` gør lige `f`-værdier forskellige og foretrækker felter nær T. Det bryder admissibility en smule.',
      hold: 2600,
    },
    {
      caption:
        'Spektret: jo tættere på den sande cost nedefra, jo færre udvidelser. Over den sande cost er der ingen garanti for korteste vej.',
      hold: 3000,
    },
  ],
  Component: Heuristics,
}

export default viz
