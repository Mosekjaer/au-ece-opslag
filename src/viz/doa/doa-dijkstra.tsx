import { AnimatePresence, motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Graph, type GEdge, type GNode } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-dijkstra.css'

/* Lecture9.pdf s. 52 (grafen = Weiss fig. 9.20, layoutet aflæst af billedet, og tabellen
   v | known | dv | pv), s. 53–58 (hvert trin: “Investigate …’s neighbours”, “Calculate the
   cost of progressing”, “Then remove … and prioritize again: V4, V2” osv.; v6 går 9 → 8
   → 6 på s. 54, 56 og 57; sluttabellen på s. 58) og s. 52 (dijkstra_pq: min-heap på
   (afstand, knude), relax dist[u] + weight[u][v] < dist[v]). Slutstien v1 → v4 → v7 → v6
   læses baglæns via pv (p6-teksten; Weiss s. 398). Køen vises som slidets sorterede
   liste, ikke som heapens interne rækkefølge. Indhold: src/content/doa/p6-grafer.ts. */

type Vx = 'v1' | 'v2' | 'v3' | 'v4' | 'v5' | 'v6' | 'v7'
const VS: Vx[] = ['v1', 'v2', 'v3', 'v4', 'v5', 'v6', 'v7']

// Aflæst af slidets billede; vandret afstand 58, så viewBox’en er 300 bred og teksten
// holder sig ≥ 11 px på en 375-skærm.
const POS: Record<Vx, { x: number; y: number }> = {
  v1: { x: 92, y: 34 },
  v2: { x: 208, y: 34 },
  v3: { x: 34, y: 104 },
  v4: { x: 150, y: 104 },
  v5: { x: 266, y: 104 },
  v6: { x: 92, y: 174 },
  v7: { x: 208, y: 174 },
}
const BADGE_AT: Record<Vx, 'n' | 's' | 'w' | 'e'> = {
  v1: 'n',
  v2: 'n',
  v3: 'w',
  v4: 'n',
  v5: 'e',
  v6: 's',
  v7: 's',
}

// Kanterne i den rækkefølge, de står i adjacency-listen (s. 52).
const W: [Vx, Vx, number][] = [
  ['v1', 'v2', 2],
  ['v1', 'v4', 1],
  ['v2', 'v4', 3],
  ['v2', 'v5', 10],
  ['v3', 'v1', 4],
  ['v3', 'v6', 5],
  ['v4', 'v3', 2],
  ['v4', 'v5', 2],
  ['v4', 'v7', 4],
  ['v4', 'v6', 8],
  ['v5', 'v7', 6],
  ['v7', 'v6', 1],
]
const ek = (a: Vx, b: Vx) => `${a}-${b}`

type Check = 'better' | 'worse' | 'known'
interface Frame {
  dist: Record<Vx, number>
  prev: Partial<Record<Vx, Vx>>
  known: Vx[]
  cur: Vx | null
  checks: Record<string, Check>
  /** Knuder hvis dv blev forbedret i dette trin. */
  improved: Vx[]
  /** Tidligere dv-værdier (overstreget i tabellen). */
  hist: Partial<Record<Vx, number[]>>
  queue: Vx[]
}

/* Kører algoritmen én gang og gemmer en ramme pr. udtagning. Ved lige afstand vælges
   laveste nummer (v3 før v5), som på s. 56. */
function run(): Frame[] {
  const dist = Object.fromEntries(VS.map((v) => [v, Infinity])) as Record<Vx, number>
  const prev: Partial<Record<Vx, Vx>> = {}
  const hist: Partial<Record<Vx, number[]>> = {}
  const known: Vx[] = []
  dist.v1 = 0
  const queue = () =>
    VS.filter((v) => !known.includes(v) && dist[v] < Infinity).sort(
      (a, b) => dist[a] - dist[b] || VS.indexOf(a) - VS.indexOf(b),
    )
  const snap = (cur: Vx | null, checks: Record<string, Check>, improved: Vx[]): Frame => ({
    dist: { ...dist },
    prev: { ...prev },
    known: [...known],
    cur,
    checks,
    improved,
    hist: Object.fromEntries(Object.entries(hist).map(([k, v]) => [k, [...v!]])),
    queue: queue(),
  })
  const frames = [snap(null, {}, [])]
  while (queue().length) {
    const u = queue()[0]
    known.push(u)
    const checks: Record<string, Check> = {}
    const improved: Vx[] = []
    for (const [a, b, w] of W) {
      if (a !== u) continue
      if (known.includes(b)) checks[ek(a, b)] = 'known'
      else if (dist[u] + w < dist[b]) {
        if (dist[b] < Infinity) (hist[b] ??= []).push(dist[b])
        dist[b] = dist[u] + w
        prev[b] = u
        checks[ek(a, b)] = 'better'
        improved.push(b)
      } else checks[ek(a, b)] = 'worse'
    }
    frames.push(snap(u, checks, improved))
  }
  return frames
}
const FRAMES = run()
const LAST = FRAMES.length - 1
const PATH = ['v1-v4', 'v4-v7', 'v7-v6']

const fmt = (d: number) => (d === Infinity ? '∞' : String(d))

function Dijkstra({ step }: { step: number }) {
  const f = FRAMES[Math.min(step, LAST)]
  const end = step >= LAST
  const treeEdges = new Set(Object.entries(f.prev).map(([v, u]) => ek(u as Vx, v as Vx)))

  const nodes: GNode[] = VS.map((v) => ({
    id: v,
    label: v,
    ...POS[v],
    tone: f.known.includes(v) ? 'ok' : f.dist[v] < Infinity ? 'focus' : 'idle',
    badge: fmt(f.dist[v]),
    badgeTone: f.dist[v] === Infinity ? 'idle' : 'focus',
    badgeAt: BADGE_AT[v],
  }))

  const edges: GEdge[] = W.map(([a, b, w]) => {
    const k = ek(a, b)
    const c = f.checks[k]
    let tone: Tone = treeEdges.has(k) ? 'focus' : 'idle'
    if (c === 'better') tone = 'ok'
    else if (c === 'worse') tone = 'neg'
    else if (c === 'known') tone = 'muted'
    if (end) tone = PATH.includes(k) ? 'ok' : treeEdges.has(k) ? 'focus' : 'muted'
    return { from: a, to: b, w, tone }
  })

  return (
    <div className="ddj">
      <section className="ddj-graph">
        <span className="vcaps">Weiss fig. 9.20 (L09 s. 52), start i v1</span>
        <Graph nodes={nodes} edges={edges} width={300} height={214} directed maxScale={1.3} />
        <div className="ddj-q">
          <span className="ddj-k">tages ud</span>
          <div className="ddj-chips">
            <motion.span
              className="ddj-chip is-out mono"
              initial={false}
              animate={{ opacity: f.cur ? 1 : 0 }}
              transition={t.fade}
            >
              {f.cur ?? 'v1'}
              <b>{f.cur ? f.dist[f.cur] : 0}</b>
            </motion.span>
          </div>
          <span className="ddj-k">prioritetskø</span>
          <div className="ddj-chips">
            <AnimatePresence initial={false} mode="popLayout">
              {f.queue.map((v) => (
                <motion.span
                  key={v}
                  layout="position"
                  className="ddj-chip mono"
                  data-hi={f.improved.includes(v) || undefined}
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -6 }}
                  transition={t.settle}
                >
                  {v}
                  <b>{f.dist[v]}</b>
                </motion.span>
              ))}
            </AnimatePresence>
            <motion.span
              className="ddj-empty"
              initial={false}
              animate={{ opacity: f.queue.length === 0 ? 1 : 0 }}
              transition={t.fade}
            >
              tom
            </motion.span>
          </div>
        </div>
      </section>

      <section className="ddj-side">
        <table className="ddj-table">
          <thead>
            <tr>
              <th>v</th>
              <th>known</th>
              <th>
                d<sub>v</sub>
              </th>
              <th>
                p<sub>v</sub>
              </th>
            </tr>
          </thead>
          <tbody>
            {VS.map((v) => {
              const known = f.known.includes(v)
              const cur = f.cur === v && !end
              const onPath = end && ['v1', 'v4', 'v7', 'v6'].includes(v)
              return (
                <tr key={v} data-cur={cur || undefined} data-path={onPath || undefined}>
                  <td className="mono">{v}</td>
                  <td className="mono" data-t={known || undefined}>
                    {known ? 'T' : 'F'}
                  </td>
                  <td className="mono ddj-dv" data-hi={f.improved.includes(v) || undefined}>
                    {(f.hist[v] ?? []).map((h, i) => (
                      <s key={i}>{h}</s>
                    ))}
                    <span>{fmt(f.dist[v])}</span>
                  </td>
                  <td className="mono">{f.prev[v] ?? '0'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <motion.p
          className="ddj-path"
          initial={false}
          animate={{ opacity: end ? 1 : 0 }}
          transition={end ? t.settle : t.fade}
        >
          Sti til <code>v6</code> baglæns via p<sub>v</sub>: <code>v6 ← v7 ← v4 ← v1</code> = 1 + 4 + 1 ={' '}
          <strong>6</strong>
        </motion.p>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-dijkstra',
  title: 'Dijkstra fra v1 med prioritetskø og relaxation',
  steps: [
    {
      caption: 'Alle afstande starter som ∞, undtagen `v1 = 0`. Kun `v1` ligger i prioritetskøen.',
      hold: 2200,
    },
    {
      caption: '`v1` tages ud og bliver kendt. Relax af naboerne: `v2 = 2`, `v4 = 1`. Køen: `v4, v2`.',
      hold: 2400,
    },
    {
      caption:
        '`v4` har mindst afstand. Via `v4`: `v3 = 3`, `v5 = 3`, `v7 = 5`, og `v6 = 1 + 8 = 9`.',
      hold: 2800,
    },
    {
      caption: '`v2` tages ud. `v4` er allerede kendt, og `v5 = 2 + 10 = 12` er dårligere end 3 — ingen opdatering.',
      hold: 2800,
    },
    {
      caption: '`v3` tages ud. `v1` er kendt. `v6 = 3 + 5 = 8 < 9` — **relax**: `v6` opdateres til 8 med `pv = v3`.',
      hold: 3000,
    },
    {
      caption: '`v5` tages ud. `v7 = 3 + 6 = 9` er dårligere end 5, så intet ændres.',
      hold: 2200,
    },
    {
      caption: '`v7` tages ud. `v6 = 5 + 1 = 6 < 8` — `v6` opdateres igen, nu via `v7`.',
      hold: 2800,
    },
    {
      caption:
        '`v6` har ingen udgående kanter, og køen er tom. Følg pv baglæns fra `v6`: stien er v1 → v4 → v7 → v6, længde 6.',
      hold: 3000,
    },
  ],
  Component: Dijkstra,
}

export default viz
