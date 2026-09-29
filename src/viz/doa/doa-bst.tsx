import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Graph, type GEdge, type GNode } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-bst.css'

/* Lecture08.pdf s. 19 (BST-egenskaben, træet 6 / 2 8 / 1 4 / 3), s. 25 (findMin og findMax),
   s. 26 (contains: søg 4, 6 → 2 → 4), s. 27 (insert 5 som højre barn af 4), s. 28 (de tre
   sletningstilfælde), s. 29 (remove 5: blad), s. 30 (remove 4: ét barn, 2 peger på 3) og
   s. 31 (remove 2: to børn, “smallest larger value” 3 kopieres op). Slidene s. 30 og s. 31
   starter hver fra udgangstræet 6 / 2 8 / 1 4 / 3; figuren gør det samme.
   Indhold: src/content/doa/p5-traeer.ts (bst). */

// x efter in-order-rang for alle knuder, der nogensinde er i træet, så intet hopper sidelæns.
const ORDER = [1, 2, 3, 4, 5, 6, 8]
const DX = 40
const DY = 52
const PAD = 22
const W = PAD * 2 + (ORDER.length - 1) * DX
const H = PAD * 2 + 3 * DY
const X = (v: number) => PAD + ORDER.indexOf(v) * DX
const Y = (d: number) => PAD + d * DY

interface Frame {
  /** Dybde pr. synlig knude. */
  depth: Record<number, number>
  /** Kanter som [forælder, barn]. */
  edges: [number, number][]
  tone?: Record<number, Tone>
  edgeTone?: Record<string, Tone>
  /** Etiket på knuden `2`, når værdien er kopieret. */
  label2?: string
  badge?: Record<number, string>
}

const BASE_DEPTH = { 6: 0, 2: 1, 8: 1, 1: 2, 4: 2, 3: 3 }
const BASE_EDGES: [number, number][] = [
  [6, 2],
  [6, 8],
  [2, 1],
  [2, 4],
  [4, 3],
]

const F: Frame[] = [
  { depth: BASE_DEPTH, edges: BASE_EDGES },
  {
    depth: BASE_DEPTH,
    edges: BASE_EDGES,
    tone: { 6: 'focus', 2: 'focus', 4: 'ok' },
    edgeTone: { '6-2': 'focus', '2-4': 'focus' },
  },
  {
    depth: BASE_DEPTH,
    edges: BASE_EDGES,
    tone: { 1: 'ok', 8: 'ok' },
    edgeTone: { '6-2': 'focus', '2-1': 'focus', '6-8': 'focus' },
    badge: { 1: 'min', 8: 'max' },
  },
  {
    depth: { ...BASE_DEPTH, 5: 3 },
    edges: [...BASE_EDGES, [4, 5]],
    tone: { 6: 'focus', 2: 'focus', 4: 'focus', 5: 'ok' },
    edgeTone: { '6-2': 'focus', '2-4': 'focus', '4-5': 'focus' },
  },
  {
    depth: { ...BASE_DEPTH, 5: 3 },
    edges: [...BASE_EDGES, [4, 5]],
    tone: { 5: 'neg' },
    edgeTone: { '4-5': 'neg' },
  },
  {
    depth: { 6: 0, 2: 1, 8: 1, 1: 2, 4: 2, 3: 2 },
    edges: [
      [6, 2],
      [6, 8],
      [2, 1],
      [2, 4],
      [2, 3],
    ],
    tone: { 4: 'neg', 3: 'focus' },
    edgeTone: { '2-4': 'neg', '2-3': 'focus' },
  },
  {
    depth: BASE_DEPTH,
    edges: BASE_EDGES,
    tone: { 2: 'focus', 3: 'focus' },
    edgeTone: { '2-4': 'focus', '4-3': 'focus' },
    badge: { 3: 'min i højre' },
  },
  {
    depth: { 6: 0, 2: 1, 8: 1, 1: 2, 4: 2 },
    edges: [
      [6, 2],
      [6, 8],
      [2, 1],
      [2, 4],
    ],
    tone: { 2: 'ok' },
    label2: '3',
  },
]

// Kanter der nogensinde tegnes (stabile nøgler i Graph).
const ALL_EDGES: [number, number][] = [...BASE_EDGES, [4, 5], [2, 3]]

function tree(f: Frame, step: number) {
  const nodes: GNode[] = ORDER.map((v) => {
    const d = f.depth[v]
    const on = d !== undefined
    // En slettet knude bliver stående på sin sidste plads, mens den toner ud.
    const lastD = on ? d : v === 5 ? 3 : v === 3 ? 3 : 2
    return {
      id: `n${v}`,
      label: v === 2 && f.label2 ? f.label2 : String(v),
      x: X(v),
      y: Y(lastD),
      tone: f.tone?.[v] ?? 'idle',
      show: on,
      badge: f.badge?.[v],
      badgeAt: 's',
      badgeTone: 'idle',
    }
  })
  // Kopien af 3, der rejser op i knuden `2` i sidste trin.
  nodes.push({
    id: 'copy',
    label: '3',
    x: step >= 7 ? X(2) : X(3),
    y: step >= 7 ? Y(1) : Y(3),
    tone: 'ok',
    show: step >= 7,
  })
  const has = (a: number, b: number) => f.edges.some(([p, c]) => p === a && c === b)
  const edges: GEdge[] = ALL_EDGES.map(([p, c]) => ({
    from: `n${p}`,
    to: `n${c}`,
    show: has(p, c),
    tone: f.edgeTone?.[`${p}-${c}`] ?? 'idle',
  }))
  return <Graph nodes={nodes} edges={edges} width={W} height={H} />
}

const LOG: { at: number; op: ReactNode; res: ReactNode }[] = [
  { at: 1, op: <code>contains(4)</code>, res: <>6 → 2 → 4, fundet</> },
  {
    at: 2,
    op: (
      <>
        <code>findMin</code> / <code>findMax</code>
      </>
    ),
    res: <>helt til venstre 1, helt til højre 8</>,
  },
  { at: 3, op: <code>insert(5)</code>, res: <>6 → 2 → 4, nyt blad til højre for 4</> },
  { at: 4, op: <code>remove(5)</code>, res: <>blad: slettes</> },
  { at: 5, op: <code>remove(4)</code>, res: <>ét barn: 2 peger nu på 3</> },
  { at: 6, op: <code>remove(2)</code>, res: <>to børn: mindste i højre undertræ, 3, kopieres op</> },
]

function Bst({ step }: { step: number }) {
  const f = F[step]
  return (
    <div className="dbst">
      <div className="dbst-tree">{tree(f, step)}</div>
      <ol className="dbst-log">
        {LOG.map((l) => {
          const on = step >= l.at
          const now = step === l.at || (l.at === 6 && step === 7)
          return (
            <motion.li
              key={l.at}
              className="dbst-row"
              data-now={now || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? t.settle : t.fade}
            >
              <span className="dbst-op">{l.op}</span>
              <span className="dbst-res">{l.res}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-bst',
  title: 'Én sti fra roden for hver operation',
  steps: [
    {
      caption:
        'Slidets søgetræ. Alt i venstre undertræ er mindre end knuden, alt i højre er større — for hver knude, ikke kun mellem forælder og barn.',
      hold: 2400,
    },
    { caption: '`contains(4)`: 4 < 6, gå til venstre; 4 > 2, gå til højre; 4 er fundet. Én knude pr. niveau.', hold: 2400 },
    { caption: '`findMin` går til venstre, så længe der er et venstre barn: 1. `findMax` går til højre: 8.', hold: 2200 },
    {
      caption: '`insert(5)` følger samme sti som en søgning, 6 → 2 → 4. 4 har intet højre barn, så 5 bliver et nyt blad dér.',
      hold: 2600,
    },
    { caption: '`remove(5)`: tilfælde 1. Knuden er et blad og slettes bare.', hold: 1800 },
    {
      caption: '`remove(4)`: tilfælde 2. 4 har kun barnet 3, så 2’s højre pointer sættes forbi 4 til 3, og 4 slettes.',
      hold: 2600,
    },
    {
      caption:
        'Slidet går igen fra udgangstræet. `remove(2)`: tilfælde 3, to børn. Den mindste værdi i højre undertræ findes: én gang til højre, så helt til venstre — 3.',
      hold: 3000,
    },
    {
      caption:
        '3 kopieres op i knuden, og det gamle 3 slettes fra højre undertræ som et blad. Resultatet er `6 / 3 8 / 1 4`, og BST-ordenen holder stadig.',
      hold: 3000,
    },
  ],
  Component: Bst,
}

export default viz
