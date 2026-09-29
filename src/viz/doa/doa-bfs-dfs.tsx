import { AnimatePresence, motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Graph, type GEdge, type GNode } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-bfs-dfs.css'

/* Lecture9.pdf s. 21–22 (grafen r s t u / v w x y og DFS-koden, start i t), s. 22–30
   (DFS fra t: besøg t, u, x, w, s, r, v, y; trækanterne t–u, u–x, x–w, w–s, s–r, r–v,
   x–y ses fremhævet på s. 30), s. 36–46 (BFS fra t: køen {t} → {u w x} → {w x y} →
   {x y s} → {y s} → {s} → {r} → {v} → {}; afstandene t 0, u w x 1, y s 2, r 3, v 4 på
   s. 46). Stakken er DFS’ rekursion (s. 22 og p6-teksten). Kontrasten til y (3 mod 2
   kanter) står i emnets tekst. Indhold: src/content/doa/p6-grafer.ts. */

type Vx = 'r' | 's' | 't' | 'u' | 'v' | 'w' | 'x' | 'y'
const VS: Vx[] = ['r', 's', 't', 'u', 'v', 'w', 'x', 'y']

// Slidets layout: r s t u øverst, v w x y nederst.
const COL = { r: 26, s: 96, t: 166, u: 236, v: 26, w: 96, x: 166, y: 236 }
const TOP = 34
const BOT = 104
const POS = (v: Vx) => ({ x: COL[v], y: 'rstu'.includes(v) ? TOP : BOT })

const E: [Vx, Vx][] = [
  ['r', 's'],
  ['r', 'v'],
  ['s', 'w'],
  ['t', 'u'],
  ['t', 'w'],
  ['t', 'x'],
  ['u', 'x'],
  ['u', 'y'],
  ['w', 'x'],
  ['x', 'y'],
]
const key = (a: Vx, b: Vx) => [a, b].sort().join('')

interface State {
  /** Rækkefølgen knuderne er opdaget i. */
  order: Vx[]
  /** DFS: stakken (rekursionen). BFS: køen. */
  pending: Vx[]
  /** Færdige knuder (poppet af stakken / taget ud af køen). */
  done: Vx[]
  /** Trækanter indtil nu, som nøgler. */
  tree: string[]
}

// DFS pr. trin (s. 22–30). Afslutningsorden: v, r, s, w, y, x, u, t.
const DFS: State[] = [
  { order: ['t'], pending: ['t'], done: [], tree: [] },
  { order: ['t', 'u', 'x'], pending: ['t', 'u', 'x'], done: [], tree: ['tu', 'ux'] },
  {
    order: ['t', 'u', 'x', 'w', 's', 'r'],
    pending: ['t', 'u', 'x', 'w', 's', 'r'],
    done: [],
    tree: ['tu', 'ux', 'wx', 'sw', 'rs'],
  },
  {
    order: ['t', 'u', 'x', 'w', 's', 'r', 'v'],
    pending: ['t', 'u', 'x'],
    done: ['v', 'r', 's', 'w'],
    tree: ['tu', 'ux', 'wx', 'sw', 'rs', 'rv'],
  },
  {
    order: ['t', 'u', 'x', 'w', 's', 'r', 'v', 'y'],
    pending: ['t', 'u', 'x', 'y'],
    done: ['v', 'r', 's', 'w'],
    tree: ['tu', 'ux', 'wx', 'sw', 'rs', 'rv', 'xy'],
  },
]
const DFS_END: State = { ...DFS[4], pending: [], done: ['v', 'r', 's', 'w', 'y', 'x', 'u', 't'] }

// BFS pr. trin (s. 37–46).
const BFS: State[] = [
  { order: ['t'], pending: ['t'], done: [], tree: [] },
  { order: ['t', 'u', 'w', 'x'], pending: ['u', 'w', 'x'], done: ['t'], tree: ['tu', 'tw', 'tx'] },
  { order: ['t', 'u', 'w', 'x', 'y'], pending: ['w', 'x', 'y'], done: ['t', 'u'], tree: ['tu', 'tw', 'tx', 'uy'] },
  {
    order: ['t', 'u', 'w', 'x', 'y', 's'],
    pending: ['x', 'y', 's'],
    done: ['t', 'u', 'w'],
    tree: ['tu', 'tw', 'tx', 'uy', 'sw'],
  },
  {
    order: ['t', 'u', 'w', 'x', 'y', 's'],
    pending: ['s'],
    done: ['t', 'u', 'w', 'x', 'y'],
    tree: ['tu', 'tw', 'tx', 'uy', 'sw'],
  },
]
const BFS_END: State = {
  order: ['t', 'u', 'w', 'x', 'y', 's', 'r', 'v'],
  pending: [],
  done: ['t', 'u', 'w', 'x', 'y', 's', 'r', 'v'],
  tree: ['tu', 'tw', 'tx', 'uy', 'sw', 'rs', 'rv'],
}
const DIST: Record<Vx, number> = { t: 0, u: 1, w: 1, x: 1, y: 2, s: 2, r: 3, v: 4 }

const S_END = 5 // begge færdige
const S_Y = 6 // kontrasten til y

const PATH_DFS = ['tu', 'ux', 'xy']
const PATH_BFS = ['tu', 'uy']

function stateAt(list: State[], end: State, step: number) {
  return step >= S_END ? end : list[Math.min(step, list.length - 1)]
}

function Side({
  kind,
  st,
  step,
}: {
  kind: 'dfs' | 'bfs'
  st: State
  step: number
}) {
  const bfs = kind === 'bfs'
  const cmp = step >= S_Y
  const path = bfs ? PATH_BFS : PATH_DFS
  const nodes: GNode[] = VS.map((v) => {
    const found = st.order.includes(v)
    const tone: Tone = st.done.includes(v) ? 'ok' : found ? 'focus' : 'idle'
    const badge = bfs && found ? DIST[v] : undefined
    return {
      id: v,
      label: v,
      ...POS(v),
      tone,
      badge,
      badgeTone: 'idle',
      badgeAt: v === 'v' ? 'w' : 'rstu'.includes(v) ? 'n' : 's',
    }
  })
  const edges: GEdge[] = E.map(([a, b]) => {
    const k = key(a, b)
    const inTree = st.tree.includes(k)
    let tone: Tone = inTree ? 'focus' : st.order.length === 8 ? 'muted' : 'idle'
    if (cmp && inTree) tone = path.includes(k) ? 'ok' : 'focus'
    return { from: a, to: b, tone }
  })

  return (
    <section className="dbf-side">
      <div className="dbf-head">
        <span className="dbf-name">{bfs ? 'BFS' : 'DFS'}</span>
        <span className="vcaps">{bfs ? 'kø, én bredde ad gangen (s. 36–46)' : 'rekursion = stak (s. 22–30)'}</span>
      </div>
      <Graph nodes={nodes} edges={edges} width={262} height={136} maxScale={1.25} />

      <div className="dbf-line">
        <span className="dbf-k">{bfs ? 'kø' : 'stak'}</span>
        <div className="dbf-chips" data-kind={kind}>
          <AnimatePresence initial={false} mode="popLayout">
            {st.pending.map((v) => (
              <motion.span
                key={v}
                layout="position"
                className="dbf-chip mono"
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={t.settle}
              >
                {v}
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.span
            className="dbf-empty"
            initial={false}
            animate={{ opacity: st.pending.length === 0 ? 1 : 0 }}
            transition={t.fade}
          >
            tom
          </motion.span>
        </div>
      </div>

      <div className="dbf-line">
        <span className="dbf-k">besøgt</span>
        <ol className="dbf-order">
          {Array.from({ length: 8 }, (_, i) => {
            const v = st.order[i]
            return (
              <motion.li
                key={i}
                className="dbf-slot mono"
                data-on={v ? true : undefined}
                initial={false}
                animate={{ opacity: v ? 1 : 0.5 }}
                transition={t.fade}
              >
                {v ?? ''}
              </motion.li>
            )
          })}
        </ol>
      </div>

      <motion.p
        className="dbf-verdict"
        initial={false}
        animate={{ opacity: cmp ? 1 : 0 }}
        transition={cmp ? t.settle : t.fade}
      >
        {bfs ? (
          <>
            <code>t–u–y</code>: <strong>2 kanter</strong> — korteste vej
          </>
        ) : (
          <>
            <code>t–u–x–y</code>: <strong>3 kanter</strong>
          </>
        )}
      </motion.p>
    </section>
  )
}

function BfsDfs({ step }: { step: number }) {
  return (
    <div className="dbf">
      <div className="dbf-sides">
        <Side kind="dfs" st={stateAt(DFS, DFS_END, step)} step={step} />
        <Side kind="bfs" st={stateAt(BFS, BFS_END, step)} step={step} />
      </div>
      <p className="dbf-legend">
        <span className="dbf-dot" data-tone="idle" /> uopdaget
        <span className="dbf-dot" data-tone="focus" /> på stakken / i køen
        <span className="dbf-dot" data-tone="ok" /> færdig
        <span className="dbf-bar" /> trækant
      </p>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-bfs-dfs',
  title: 'DFS og BFS fra t på samme graf',
  steps: [
    {
      caption: 'Begge starter i `t`. DFS lægger `t` på stakken (rekursionen), BFS lægger `t` i køen.',
      hold: 2200,
    },
    {
      caption:
        'DFS går straks i dybden: `t → u → x`. BFS tager `t` ud og lægger alle tre naboer `u w x` i køen med afstand 1.',
      hold: 2800,
    },
    {
      caption:
        'DFS fortsætter `x → w → s → r`, seks kald dybt. BFS tager `u` ud; kun `y` er ny, afstand 2. Kø `{w x y}`.',
      hold: 2800,
    },
    {
      caption:
        'DFS når `v`, som ingen ubesøgte naboer har. `v, r, s, w` afsluttes, og rekursionen vender tilbage til `x`. BFS: `w` ud, `s` ind. Kø `{x y s}`.',
      hold: 3000,
    },
    {
      caption: 'DFS går fra `x` til `y` — alle otte er besøgt. BFS tager `x` og `y` ud uden nye naboer. Kø `{s}`.',
      hold: 2600,
    },
    {
      caption:
        'DFS afslutter `y, x, u, t`, og stakken er tom. BFS tager `s`, `r` og `v` ud: `r` får 3, `v` får 4. Køen er tom.',
      hold: 2800,
    },
    {
      caption:
        'Samme graf, to forskellige træer. DFS når `y` via tre kanter, BFS via to: BFS’ træ giver korteste veje i antal kanter.',
      hold: 3000,
    },
  ],
  Component: BfsDfs,
}

export default viz
