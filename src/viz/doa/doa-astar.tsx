import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, type Tone } from '../kit/primitives'
import { CellGrid } from '../kit/algo'
import { stagger, t } from '../kit/motion'
import './doa-astar.css'

/* Lecture10.pdf s. 28 (gitteret 10 × 10: S (2,7), T (6,5), muren (3,3), (4,3),
   (5,3), (5,4), (5,5), (5,6); Manhattan, 4-vejs, naboer med uret), s. 30 (S udvides:
   op og højre g 1, h 5, f 6; ned og venstre g 1, h 7, f 8), s. 31–50
   (udvidelsesrækkefølgen 1–12, alle udvidede f = 6, frontier f = 8, “Target found”
   når T tages ud på s. 50) og s. 23 (Dijkstra: stor rød plet, A*: smalt bånd).
   Dijkstras udvidelser på samme gitter står ikke på slides — egen udregning (BFS-lag,
   alle kanter koster 1), mærket i figuren. Indhold: src/content/doa/p6-grafer.ts. */

type P = readonly [number, number] // (x, y)

const N = 10
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
const key = (p: P) => `${p[0]},${p[1]}`
const isWall = new Set(WALL.map(key))
const h = (p: P) => Math.abs(p[0] - T[0]) + Math.abs(p[1] - T[1])

// Udvidelsesrækkefølgen fra slidene (s. 31–50); nr. 12 er T.
const ORDER: P[] = [
  [2, 6],
  [3, 7],
  [2, 5],
  [3, 6],
  [4, 7],
  [3, 5],
  [4, 6],
  [5, 7],
  [4, 5],
  [6, 7],
  [6, 6],
  T,
]
// Hvor mange af ORDER der er udvidet efter trin 0..7 (S udvides i trin 1).
const DONE = [0, 0, 2, 5, 8, 11, 12, 12]
const PATH = new Set([S, [3, 7], [4, 7], [5, 7], [6, 7], [6, 6], T].map((p) => key(p as P)))

const nbrs = (p: P): P[] =>
  (
    [
      [p[0], p[1] - 1],
      [p[0] + 1, p[1]],
      [p[0], p[1] + 1],
      [p[0] - 1, p[1]],
    ] as P[]
  ).filter(([x, y]) => x >= 0 && y >= 0 && x < N && y < N && !isWall.has(`${x},${y}`))

// Egen udregning: sand afstand g fra S (BFS; alle kanter koster 1).
const G: Record<string, number> = { [key(S)]: 0 }
{
  const q: P[] = [S]
  while (q.length) {
    const c = q.shift()!
    for (const n of nbrs(c)) {
      if (G[key(n)] !== undefined) continue
      G[key(n)] = G[key(c)] + 1
      q.push(n)
    }
  }
}
const DIJ_EXPANDED = Object.values(G).filter((g) => g <= 5).length // 40 inkl. S

type State = 'none' | 'frontier' | 'done' | 'new' | 'path' | 'target'

/** A*-tilstand efter et trin: udvidede felter og frontier med g. */
function astarState(step: number) {
  const st = new Map<string, State>()
  const gOf = new Map<string, number>()
  if (step < 1) return { st, gOf }
  const done = ORDER.slice(0, DONE[step])
  const prevDone = new Set(ORDER.slice(0, DONE[step - 1]).map(key))
  const expanded: P[] = [S, ...done.filter((p) => key(p) !== key(T))]
  st.set(key(S), step === 1 ? 'new' : 'done')
  gOf.set(key(S), 0)
  for (const p of done) {
    gOf.set(key(p), G[key(p)])
    st.set(key(p), key(p) === key(T) ? 'target' : prevDone.has(key(p)) ? 'done' : 'new')
  }
  for (const p of expanded) {
    for (const n of nbrs(p)) {
      const k = key(n)
      if (st.has(k)) continue
      const g = G[key(p)] + 1
      if (!gOf.has(k) || g < gOf.get(k)!) gOf.set(k, g)
    }
  }
  for (const k of gOf.keys()) if (!st.has(k)) st.set(k, 'frontier')
  if (step >= 7) for (const k of PATH) st.set(k, 'path')
  return { st, gOf }
}

/** Dijkstra-tilstand (egen udregning): trin k udvider laget g = k − 1. */
function dijkstraState(step: number) {
  const st = new Map<string, State>()
  if (step < 1) return st
  const maxDone = Math.min(step - 1, 5)
  for (const [k, g] of Object.entries(G)) {
    if (g <= maxDone) st.set(k, g === maxDone && step <= 6 ? 'new' : 'done')
    else if (g === maxDone + 1) st.set(k, 'frontier')
  }
  if (step >= 6) st.set(key(T), step >= 7 ? 'path' : 'target')
  if (step >= 7) for (const k of PATH) st.set(k, 'path')
  return st
}

const TONE: Record<State, Tone> = {
  none: 'idle',
  frontier: 'idle',
  done: 'focus',
  new: 'ok',
  target: 'ok',
  path: 'ok',
}

function cellFor(x: number, y: number, s: State, num: ReactNode) {
  const k = `${x},${y}`
  if (isWall.has(k)) return { wall: true }
  const isS = k === key(S)
  const isT = k === key(T)
  const label = isS ? 'S' : isT ? 'T' : s === 'none' ? '' : num
  return {
    tone: TONE[s],
    label: (
      <span className="das-c" data-s={s} data-end={isS || isT || undefined}>
        {label}
      </span>
    ),
  }
}

const axis = (i: number) => i

const popped = (n: number) => {
  const p = ORDER[n - 1]
  const g = G[key(p)]
  return (
    <>
      nr. {n} {key(p) === key(T) ? 'T' : `(${p[0]},${p[1]})`} · g {g} · h {h(p)} · f {g + h(p)}
      {key(p) === key(T) && <strong> — target found</strong>}
    </>
  )
}
// Linjen under gitrene, pr. trin.
const NOW: ReactNode[] = [
  <>frontier = {'{'}S{'}'} · g 0 · h 6 · f 6</>,
  <>S (2,7) · g 0 · h 6 · f 6</>,
  ...DONE.slice(2, 7).map((n) => popped(n)),
  <>sti S → (3,7) → (4,7) → (5,7) → (6,7) → (6,6) → T, cost 6</>,
]

function Reveal({ on, className, children }: { on: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 3 }}
      transition={on ? t.settle : t.fade}
    >
      {children}
    </motion.div>
  )
}

function AStar({ step }: { step: number }) {
  const a = astarState(step)
  const d = dijkstraState(step)
  const done = DONE[step]

  return (
    <div className="das">
      <div className="das-grids">
        <section className="das-side">
          <div className="das-head">
            <span className="das-name">Dijkstra</span>
            <span className="das-pri">
              prioritet <code>g</code> · tal = <code>g</code>
            </span>
            <span className="das-own">egen udregning</span>
          </div>
          <CellGrid
            className="das-grid"
            rows={N}
            cols={N}
            size="1.6rem"
            colHead={axis}
            rowHead={axis}
            cell={(y, x) => {
              const s = d.get(`${x},${y}`) ?? 'none'
              return cellFor(x, y, s, G[`${x},${y}`])
            }}
          />
        </section>

        <section className="das-side">
          <div className="das-head">
            <span className="das-name">A*</span>
            <span className="das-pri">
              prioritet <code>f = g + h</code> · tal = <code>f</code>
            </span>
            <span className="das-own">L10 s. 30–50</span>
          </div>
          <CellGrid
            className="das-grid"
            rows={N}
            cols={N}
            size="1.6rem"
            colHead={axis}
            rowHead={axis}
            cell={(y, x) => {
              const k = `${x},${y}`
              const s = a.st.get(k) ?? 'none'
              const g = a.gOf.get(k)
              return cellFor(x, y, s, g === undefined ? '' : g + h([x, y]))
            }}
          />
        </section>
      </div>

      <div className="das-legend">
        <span>
          <i className="das-key" data-k="new" /> {step >= 7 ? 'sti' : 'udvides nu'}
        </span>
        <span>
          <i className="das-key" data-k="done" /> udvidet
        </span>
        <span>
          <i className="das-key" data-k="frontier" /> frontier
        </span>
        <span>
          <i className="das-key" data-k="wall" /> mur
        </span>
      </div>

      <div className="das-log">
        <div className="das-now">
          <span className="vcaps">A* tager ud af frontier</span>
          <Swap
            show={step}
            className="das-now-v mono"
            items={NOW.map((n, i) => (
              <span key={i}>{n}</span>
            ))}
          />
        </div>
        <ol className="das-order">
          {ORDER.map((p, i) => {
            const on = i < done
            return (
              <motion.li
                key={i}
                className="das-chip"
                data-tone={on ? (step >= 7 && PATH.has(key(p)) ? 'path' : i >= DONE[step - 1] ? 'new' : 'done') : 'ghost'}
                initial={false}
                animate={{ opacity: on ? 1 : 0.5 }}
                transition={on ? stagger(i - (DONE[step - 1] ?? 0), 0, 0.08) : t.fade}
              >
                <span className="das-chip-n">{i + 1}</span>
                <span className="mono" style={{ opacity: on ? 1 : 0 }}>
                  {key(p) === key(T) ? 'T' : `(${p[0]},${p[1]})`}
                </span>
              </motion.li>
            )
          })}
        </ol>
        <Reveal on={step >= 6} className="das-verdict">
          Før T tages ud: A* har udvidet <strong>12 felter</strong> (S + 11, alle med <code>f = 6</code>); Dijkstra har
          udvidet <strong className="is-neg">{DIJ_EXPANDED} felter</strong> (alle med <code>g ≤ 5</code>) og skal
          stadig tage flere med <code>g = 6</code> ud.
        </Reveal>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-astar',
  title: 'Dijkstra og A* på kursets gitter',
  steps: [
    {
      caption:
        'Slidets gitter: S i (2,7), T i (6,5) og en mur imellem. 4-vejs bevægelse, hvert skridt koster 1. A* bruger Manhattan `h = |Δx| + |Δy|`.',
      hold: 2600,
    },
    {
      caption:
        'S udvides. Op og højre får `g 1, h 5, f 6`; ned og venstre `g 1, h 7, f 8`. For Dijkstra er alle fire ens: `g = 1`.',
      hold: 2800,
    },
    {
      caption: 'A* tager de to med `f = 6` ud. Dijkstra udvider hele laget `g = 1`, også felterne væk fra T.',
      hold: 2400,
    },
    {
      caption: 'Nr. 3–5 har stadig `f = 6`: hvert skridt mod T øger `g` med 1 og sænker `h` med 1. Felter med `f = 8` venter.',
      hold: 2600,
    },
    {
      caption: 'Nr. 6–8: A* følger muren nedenom til (5,7). Dijkstra breder sig i alle retninger, som en diamant.',
      hold: 2400,
    },
    {
      caption: 'Nr. 9–11: (4,5) er blindgyde mod muren, men har også `f = 6`. Via (6,7) og (6,6) når fronten T.',
      hold: 2400,
    },
    {
      caption:
        '**Target found**, da T *tages ud* med `g 6, h 0` — ikke da den blev lagt i. Dijkstra har da udvidet mere end tre gange så mange felter.',
      hold: 3000,
    },
    {
      caption:
        'Samme sti, cost 6. A* udvider kun et smalt bånd med `f = 6` langs stien; Dijkstra en hel plet — som på L10 s. 23.',
      hold: 3000,
    },
  ],
  Component: AStar,
}

export default viz
