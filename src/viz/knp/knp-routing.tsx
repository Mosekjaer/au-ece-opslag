import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Graph, type GEdge, type GNode } from '../kit/algo'
import { t } from '../kit/motion'
import './knp-routing.css'

/* Kurose & Ross fig. 5.3 (s. 411; kanter og costs aflæst af billedet: u–v 2, u–x 1,
   u–w 5 (buen over v), v–w 3, v–x 2, x–w 3, x–y 1, w–y 1, w–z 5, y–z 2), tabel 5.1
   (s. 415) med N′ og D(·), p(·) pr. trin, uafgjort mellem v og y i trin 2 brudt
   “arbitrarily” til y (s. 415), og fig. 5.4 (s. 416): forwarding-tabellen i u —
   v via (u, v), w, x, y, z via (u, x). Rækkerne herunder er tabellens, ikke beregnet. */

type V = 'u' | 'v' | 'w' | 'x' | 'y' | 'z'
const DEST: V[] = ['v', 'w', 'x', 'y', 'z']

// Aflæst af fig. 5.3, skaleret til en 340 bred viewBox (tekst ≥ 11 px på 375).
const POS: Record<V, { x: number; y: number }> = {
  u: { x: 28, y: 125 },
  v: { x: 118, y: 70 },
  w: { x: 222, y: 70 },
  x: { x: 118, y: 180 },
  y: { x: 222, y: 180 },
  z: { x: 312, y: 125 },
}
const BADGE_AT: Record<V, 'n' | 's' | 'w' | 'e'> = { u: 's', v: 'n', w: 'e', x: 's', y: 's', z: 'n' }

// Lige kanter; u–w tegnes som bue over v, som i bogen.
const E: [V, V, number][] = [
  ['u', 'v', 2],
  ['u', 'x', 1],
  ['v', 'w', 3],
  ['v', 'x', 2],
  ['x', 'w', 3],
  ['x', 'y', 1],
  ['w', 'y', 1],
  ['w', 'z', 5],
  ['y', 'z', 2],
]
const ek = (a: V, b: V) => [a, b].sort().join('')

interface Row {
  /** Knuden, der kom i N′ i dette trin. */
  add: V
  n: string
  /** D, p for knuder uden for N′ (tomt felt i bogen = allerede i N′). */
  d: Partial<Record<V, [number, V] | null>>
  /** Kanter fra `add`, der blev prøvet: forbedring (ok) eller ej (neg). */
  tried: [V, boolean][]
}

// Tabel 5.1, række for række.
const ROWS: Row[] = [
  { add: 'u', n: 'u', d: { v: [2, 'u'], w: [5, 'u'], x: [1, 'u'], y: null, z: null }, tried: [['v', true], ['w', true], ['x', true]] },
  { add: 'x', n: 'ux', d: { v: [2, 'u'], w: [4, 'x'], y: [2, 'x'], z: null }, tried: [['v', false], ['w', true], ['y', true]] },
  { add: 'y', n: 'uxy', d: { v: [2, 'u'], w: [3, 'y'], z: [4, 'y'] }, tried: [['w', true], ['z', true]] },
  { add: 'v', n: 'uxyv', d: { w: [3, 'y'], z: [4, 'y'] }, tried: [['w', false]] },
  { add: 'w', n: 'uxyvw', d: { z: [4, 'y'] }, tried: [['z', false]] },
  { add: 'z', n: 'uxyvwz', d: {}, tried: [] },
]
const LAST_ROW = ROWS.length - 1
const FINAL = { v: 'u', w: 'y', x: 'u', y: 'x', z: 'y' } as Record<V, V>
const TREE = new Set(DEST.map((v) => ek(v, FINAL[v])))
const FWD: [V, string][] = [
  ['v', '(u, v)'],
  ['w', '(u, x)'],
  ['x', '(u, x)'],
  ['y', '(u, x)'],
  ['z', '(u, x)'],
]

/** Seneste kendte (D, p) for v frem til og med række r. */
function latest(v: V, r: number): [number, V] | null {
  for (let i = r; i >= 0; i--) {
    const c = ROWS[i].d[v]
    if (c !== undefined) return c
  }
  return null
}

function Routing({ step }: { step: number }) {
  const end = step > LAST_ROW
  const r = Math.min(step, LAST_ROW)
  const row = ROWS[r]
  const inN = new Set(row.n.split('') as V[])
  const tried = end ? new Map<string, boolean>() : new Map(row.tried.map(([v, ok]) => [ek(row.add, v), ok]))

  const nodes: GNode[] = (Object.keys(POS) as V[]).map((v) => {
    const c = v === 'u' ? null : latest(v, r)
    const tone: Tone = v === row.add && !end ? 'focus' : inN.has(v) ? 'ok' : 'idle'
    return {
      id: v,
      label: v,
      ...POS[v],
      tone,
      badge: v === 'u' ? 'kilde' : c ? `${c[0]}, ${c[1]}` : '∞',
      badgeTone: v === 'u' ? 'idle' : c ? 'focus' : 'idle',
      badgeAt: BADGE_AT[v],
    }
  })

  const toneFor = (a: V, b: V): Tone => {
    const k = ek(a, b)
    if (tried.has(k)) return tried.get(k) ? 'ok' : 'neg'
    if (end) return TREE.has(k) ? 'ok' : 'muted'
    // Træet indtil nu: kanten fra p(v) til hver knude i N′.
    const inTree = [...inN].some((v) => v !== 'u' && ek(v, latest(v, r)![1]) === k)
    return inTree ? 'focus' : 'idle'
  }
  const edges: GEdge[] = E.map(([a, b, w]) => ({
    from: a,
    to: b,
    w,
    tone: toneFor(a, b),
    wOffset: a === 'v' && b === 'w' ? -9 : a === 'x' && b === 'y' ? 9 : 0,
  }))
  const uw = toneFor('u', 'w')

  return (
    <div className="lsr">
      <section className="lsr-graph">
        <span className="vcaps">Fig. 5.3 — kilde u, badge = D(v), p(v)</span>
        <Graph nodes={nodes} edges={edges} width={340} height={220} maxScale={1.25}>
          <g className="vg-edge" data-tone={uw}>
            <path className="vg-line" d="M 36 112 Q 110 -50 211 60" fill="none" />
            <text className="vg-w" x={117} y={18} textAnchor="middle" dominantBaseline="central">
              5
            </text>
          </g>
        </Graph>
      </section>

      <section className="lsr-side">
        <div className="lsr-scroll">
          <table className="lsr-table">
            <thead>
              <tr>
                <th>step</th>
                <th>N′</th>
                {DEST.map((v) => (
                  <th key={v}>
                    D({v}),p({v})
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((rw, i) => {
                const show = i <= step
                const cur = i === step && !end
                return (
                  <motion.tr
                    key={i}
                    data-cur={cur || undefined}
                    initial={false}
                    animate={{ opacity: show ? 1 : 0 }}
                    transition={show ? t.settle : t.fade}
                  >
                    <td className="mono">{i}</td>
                    <td className="mono lsr-n">{rw.n}</td>
                    {DEST.map((v) => {
                      const c = rw.d[v]
                      const prev = i > 0 ? latest(v, i - 1) : undefined
                      const changed = i > 0 && c && (!prev || prev[0] !== c[0] || prev[1] !== c[1])
                      return (
                        <td key={v} className="mono" data-hi={changed || undefined}>
                          {c === undefined ? '' : c === null ? '∞' : `${c[0]}, ${c[1]}`}
                        </td>
                      )
                    })}
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <motion.div
          className="lsr-fwd"
          initial={false}
          animate={{ opacity: end ? 1 : 0, y: end ? 0 : 4 }}
          transition={end ? t.settle : t.fade}
          aria-hidden={!end || undefined}
        >
          <span className="vcaps">Forwarding-tabel i u (fig. 5.4)</span>
          <div className="lsr-fwd-grid">
            <span className="lsr-fwd-h">Destination</span>
            <span className="lsr-fwd-h">Link</span>
            {FWD.map(([d, l]) => (
              <span key={d} className="lsr-fwd-row">
                <span className="mono">{d}</span>
                <span className="mono">{l}</span>
              </span>
            ))}
          </div>
        </motion.div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-routing',
  title: 'Dijkstra fra u på bogens graf, trin for trin',
  steps: [
    {
      caption:
        'Initialisering: `N′ = {u}`. Naboerne får cost af det direkte link — `D(v) = 2`, `D(w) = 5`, `D(x) = 1` — og y og z står på ∞.',
      hold: 2600,
    },
    {
      caption:
        'x har mindst D og kommer i N′. Via x: `w = 1 + 3 = 4 < 5` og `y = 1 + 1 = 2` opdateres; `v = 1 + 2 = 3` er ikke bedre end 2.',
      hold: 3000,
    },
    {
      caption:
        'v og y har begge D = 2. Bogen bryder uafgjort “arbitrarily” og tager y. Via y: `w = 3`, `z = 4`.',
      hold: 3000,
    },
    { caption: 'v kommer i N′. `2 + 3 = 5` til w er ikke bedre end 3.', hold: 2000 },
    { caption: 'w kommer i N′. `3 + 5 = 8` til z er ikke bedre end 4.', hold: 2000 },
    { caption: 'z kommer i N′, og `N′ = N`: algoritmen stopper efter én runde pr. knude.', hold: 2000 },
    {
      caption:
        'p(v) giver træet af billigste stier. u gemmer kun **next hop**: v via `(u, v)`, alle andre via `(u, x)`.',
      hold: 3200,
    },
  ],
  Component: Routing,
}

export default viz
