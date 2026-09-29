import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Swap } from '../kit/primitives'
import { Graph, layoutTree, type GEdge, type TreeIn } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-avl-rotation.css'

/* Lecture08.pdf s. 40 (insert 6 i 5 / 2 8 / 1 4 7 / 3; ved 8 står “2” og “0”, “Imbalance at
   LEFT subtree of LEFT child”, “Single right rotation”). Slidets efter-billede viser ikke
   rotationen; resultatet 5 / 2 7 / 1 4 6 8 / 3 er fra Weiss figur 4.35 (s. 148) og kursets
   AvlTree.h. s. 41 (dobbeltrotation: først mellem barn og barnebarn, så ved roden) og s. 44
   (refleksion: insert 25 i 20 / 10 40 / 30 50; svaret 30 / 20 40 / 10 25 – 50 er udregnet
   med AvlTree.h, jf. content-gaps). Højder på slidet tælles i niveauer; figuren gør det samme.
   Indhold: src/content/doa/p5-traeer.ts (avl). */

type Spec = [id: number, l?: Spec | null, r?: Spec | null]

/** Bygger TreeIn fra en kompakt [værdi, venstre, højre]-notation. */
function build(s: Spec | null | undefined, tone: Record<number, Tone>, badge: Record<number, string>): TreeIn | null {
  if (!s) return null
  const [v, l, r] = s
  return { id: `n${v}`, label: String(v), tone: tone[v], badge: badge[v], badgeTone: 'neg', l: build(l, tone, badge), r: build(r, tone, badge) }
}

interface Frame {
  tree: Spec
  tone?: Record<number, Tone>
  badge?: Record<number, string>
  /** Kanter i fokus som [forælder, barn]. */
  hot?: [number, number][]
}

// Alle knuder, der indgår på et tidspunkt; skjulte knuder får stadig deres x-plads,
// så intet flytter sidelæns, når den nye knude dukker op.
const A_ALL = [1, 2, 3, 4, 5, 6, 7, 8]
const B_ALL = [10, 20, 25, 30, 40, 50]

const A: Frame[] = [
  { tree: [5, [2, [1], [4, [3]]], [8, [7]]] },
  {
    tree: [5, [2, [1], [4, [3]]], [8, [7, [6]]]],
    tone: { 8: 'neg', 7: 'focus', 6: 'focus' },
    badge: { 8: '2 | 0' },
    hot: [
      [8, 7],
      [7, 6],
    ],
  },
  { tree: [5, [2, [1], [4, [3]]], [7, [6], [8]]], tone: { 7: 'ok' } },
]

const B: Frame[] = [
  { tree: [20, [10], [40, [30], [50]]] },
  {
    tree: [20, [10], [40, [30, [25]], [50]]],
    tone: { 20: 'neg', 40: 'focus', 30: 'focus', 25: 'focus' },
    badge: { 20: '1 | 3' },
    hot: [
      [20, 40],
      [40, 30],
      [30, 25],
    ],
  },
  {
    tree: [20, [10], [30, [25], [40, null, [50]]]],
    tone: { 20: 'neg', 30: 'focus', 40: 'focus' },
    hot: [[30, 40]],
  },
  { tree: [30, [20, [10], [25]], [40, null, [50]]], tone: { 30: 'ok' } },
]

const DX = 34
const DY = 50
const PAD = 22
/** Begge paneler får samme viewBox-bredde (8 pladser), så knuderne er lige store. */
const SLOTS = 8

function draw(f: Frame, frames: Frame[], all: number[], badgeAt: 'n' | 'w') {
  const lay = (x: Frame) => layoutTree(build(x.tree, x.tone ?? {}, x.badge ?? {}), { dx: DX, dy: DY, pad: PAD })
  const cur = lay(f)
  const depthMax = Math.max(...frames.map((x) => (lay(x).height - PAD * 2) / DY))
  const byId = Object.fromEntries(cur.nodes.map((n) => [n.id, n]))
  const off = PAD + ((SLOTS - all.length) * DX) / 2
  // x fra den faste in-order-rang blandt alle knuder; y fra layoutet.
  const nodes = all.map((v, rank) => {
    const n = byId[`n${v}`]
    return n
      ? { ...n, x: off + rank * DX, badgeAt }
      : { id: `n${v}`, label: String(v), x: off + rank * DX, y: PAD + depthMax * DY, show: false }
  })
  // Alle kanter, der optræder i panelet, med stabile nøgler; kun de aktuelle vises.
  const key = (e: { from: string; to: string }) => `${e.from}-${e.to}`
  const union = [...new Set(frames.flatMap((x) => lay(x).edges.map(key)))]
  const now = new Set(cur.edges.map(key))
  const hot = new Set((f.hot ?? []).map(([a, b]) => `n${a}-n${b}`))
  const edges: GEdge[] = union.map((k) => {
    const [from, to] = k.split('-')
    return { from, to, show: now.has(k), tone: hot.has(k) ? 'focus' : 'idle' }
  })
  return { nodes, edges, width: PAD * 2 + (SLOTS - 1) * DX, height: PAD * 2 + depthMax * DY }
}

function Panel({
  head,
  frames,
  at,
  all,
  badgeAt,
  lines,
}: {
  head: ReactNode
  frames: Frame[]
  at: number
  all: number[]
  badgeAt: 'n' | 'w'
  lines: ReactNode[]
}) {
  const g = draw(frames[at], frames, all, badgeAt)
  return (
    <>
      <span className="vcaps">{head}</span>
      <div className="davl-tree">
        <Graph nodes={g.nodes} edges={g.edges} width={g.width} height={g.height} />
      </div>
      <Swap show={at} className="davl-line" items={lines.map((l, i) => <span key={i}>{l}</span>)} />
    </>
  )
}

const A_LINES: ReactNode[] = [
  <>AVL-træ: alle knuder afviger højst 1</>,
  <>ved 8: venstre 2, højre 0 → venstre–venstre, ydre</>,
  <>
    højrerotation mellem 7 og 8: <code>5 / 2 7 / 1 4 6 8 / 3</code>
  </>,
]
const B_LINES: ReactNode[] = [
  <>AVL-træ: alle knuder afviger højst 1</>,
  <>ved 20: venstre 1, højre 3 → højre–venstre, indre</>,
  <>rotation 1 (højre) mellem 40 og 30</>,
  <>
    rotation 2 (venstre) mellem 20 og 30: <code>30 / 20 40 / 10 25 – 50</code>
  </>,
]

function Avl({ step }: { step: number }) {
  const ai = Math.min(step, A.length - 1)
  const bOn = step >= 3
  const bi = bOn ? step - 2 : 0
  return (
    <div className="davl">
      <section className="davl-case">
        <Panel head={<>L08 s. 40 · <code>insert(6)</code> · enkeltrotation</>} frames={A} at={ai} all={A_ALL} badgeAt="n" lines={A_LINES} />
      </section>
      <motion.section
        className="davl-case"
        initial={false}
        animate={{ opacity: bOn ? 1 : 0.35 }}
        transition={bOn ? t.settle : t.fade}
      >
        <Panel head={<>L08 s. 44 · <code>insert(25)</code> · dobbeltrotation</>} frames={B} at={bi} all={B_ALL} badgeAt="w" lines={B_LINES} />
      </motion.section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-avl-rotation',
  title: 'Enkelt- og dobbeltrotation i et AVL-træ',
  steps: [
    {
      caption:
        'Slidets AVL-træ. I hver knude afviger venstre og højre undertræs højde højst med 1. Nu indsættes 6.',
      hold: 2200,
    },
    {
      caption:
        '6 lander som venstre barn af 7. Ved 8 er venstre side nu 2 niveauer og højre 0 — ubalance i **venstre undertræ af venstre barn**. Det er den ydre ubalance.',
      hold: 3000,
    },
    {
      caption:
        'En **enkeltrotation** til højre mellem 7 og 8: 7 rykker op, 8 bliver højre barn. Undertræet er lige så højt som før indsættelsen, så resten af træet er uberørt.',
      hold: 3000,
    },
    {
      caption:
        'Refleksionsopgaven: 25 indsættes i `20 / 10 40 / 30 50` og lander under 30. Ved 20 er det 1 mod 3, og vejen ned går højre, så venstre — **indre** ubalance.',
      hold: 3000,
    },
    {
      caption:
        'En enkeltrotation ville lade det dybe undertræ blive i samme dybde. Først roteres barn og barnebarn: 30 rykker op over 40.',
      hold: 2800,
    },
    {
      caption:
        'Så roteres ved 20: 30 bliver rod med 20 og 40 som børn, og 25 flytter over til 20. Resultatet `30 / 20 40 / 10 25 – 50` er i balance igen.',
      hold: 3000,
    },
  ],
  Component: Avl,
}

export default viz
