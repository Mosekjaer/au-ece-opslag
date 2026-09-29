import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Swap } from '../kit/primitives'
import { ArrayRow, Graph, type ArrayPointer, type GEdge, type GNode } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-buildheap.css'

/* Lecture07.pdf s. 40 ([33, 31, 18, 7, 19, 10]; bladene 7, 19, 10 “do all fulfil the heap
   property”), s. 41 (trin 1: 18 ↔ 10), s. 42 (trin 2: 31 ↔ 7), s. 43 (trin 3: 33 ↔ 7),
   s. 44 (trin 3b: 33 ↔ 19, “untouched sub-trees”) og s. 46 (buildHeap fra currentSize / 2).
   Heapsort: Weiss s. 300–301, input 31, 41, 59, 26, 53, 58, 97; max-heap efter buildHeap
   97, 53, 59, 26, 41, 58, 31 (figur 7.8) og efter første deleteMax 59, 53, 58, 26, 41, 31 | 97
   (figur 7.9). Indhold: src/content/doa/p5-traeer.ts (heapify-heapsort). */

// Pladser efter position i heapen (1 = rod), som i et komplet træ.
const W = 300
const H = 158
const POS: Record<number, { x: number; y: number }> = {
  1: { x: 150, y: 24 },
  2: { x: 80, y: 80 },
  3: { x: 220, y: 80 },
  4: { x: 45, y: 136 },
  5: { x: 115, y: 136 },
  6: { x: 185, y: 136 },
  7: { x: 255, y: 136 },
}

interface Frame {
  /** Værdierne i arrayets rækkefølge. */
  a: number[]
  tone: Record<number, Tone>
  /** Position (1-baseret) der heapificeres; −1 = ingen. */
  i: number
  /** Antal elementer der stadig er i heapen (resten er sorteret). */
  heap: number
  line: ReactNode
}

// L07: min-heap, rod på indeks 1. Trin 0–4.
const A: Frame[] = [
  {
    a: [33, 31, 18, 7, 19, 10],
    tone: { 7: 'focus', 19: 'focus', 10: 'focus' },
    i: 3,
    heap: 6,
    line: <>blade 7, 19, 10 er heaps; start i = 6 / 2 = 3</>,
  },
  { a: [33, 31, 10, 7, 19, 18], tone: { 10: 'focus', 18: 'focus' }, i: 3, heap: 6, line: <>i = 3: 18 &gt; 10 → byt</> },
  { a: [33, 7, 10, 31, 19, 18], tone: { 7: 'focus', 31: 'focus' }, i: 2, heap: 6, line: <>i = 2: mindste barn 7 &lt; 31 → byt</> },
  { a: [7, 33, 10, 31, 19, 18], tone: { 7: 'focus', 33: 'focus' }, i: 1, heap: 6, line: <>i = 1: mindste barn 7 &lt; 33 → byt</> },
  {
    a: [7, 19, 10, 31, 33, 18],
    tone: { 19: 'focus', 33: 'focus' },
    i: 1,
    heap: 6,
    line: (
      <>
        33 &gt; 19 → byt igen: <code>[7, 19, 10, 31, 33, 18]</code>
      </>
    ),
  },
]

// Slutbilledet for L07, mens bogens heapsort kører.
const A_DONE: Frame = { ...A[4], tone: { 7: 'ok', 19: 'ok', 10: 'ok', 31: 'ok', 33: 'ok', 18: 'ok' }, i: -1 }

// Weiss: max-heap, rod på indeks 0. Trin 5–8.
const B: Frame[] = [
  { a: [31, 41, 59, 26, 53, 58, 97], tone: {}, i: -1, heap: 7, line: <>input 31, 41, 59, 26, 53, 58, 97</> },
  { a: [97, 53, 59, 26, 41, 58, 31], tone: { 97: 'focus' }, i: -1, heap: 7, line: <>buildHeap (max): 97 øverst</> },
  {
    a: [31, 53, 59, 26, 41, 58, 97],
    tone: { 31: 'focus', 97: 'ok' },
    i: -1,
    heap: 6,
    line: <>deleteMax: byt 97 med sidste; heapen er nu 6</>,
  },
  {
    a: [59, 53, 58, 26, 41, 31, 97],
    tone: { 59: 'focus', 58: 'focus', 31: 'focus', 97: 'ok' },
    i: -1,
    heap: 6,
    line: (
      <>
        percDown(31): <code>59, 53, 58, 26, 41, 31 | 97</code>
      </>
    ),
  },
]

function tree(id: string, f: Frame) {
  const n = f.a.length
  const nodes: GNode[] = f.a.map((v, k) => ({
    id: `${id}-${v}`,
    label: String(v),
    ...POS[k + 1],
    tone: f.tone[v] ?? 'idle',
  }))
  const hot = (pos: number) => f.tone[f.a[pos - 1]] === 'focus'
  const edges: GEdge[] = []
  for (let c = 2; c <= n; c++) {
    const p = Math.floor(c / 2)
    edges.push({
      from: `${id}-s${p}`,
      to: `${id}-s${c}`,
      tone: c > f.heap ? 'ghost' : hot(p) && hot(c) ? 'focus' : 'idle',
    })
  }
  // Usynlige pladsknuder bærer kanterne, så kanterne bliver, når værdierne bytter.
  const slots: GNode[] = f.a.map((_, k) => ({ id: `${id}-s${k + 1}`, label: '', ...POS[k + 1], tone: 'ghost' }))
  return <Graph nodes={[...slots, ...nodes]} edges={edges} width={W} height={H} />
}

function row(id: string, f: Frame, start: number, ptr: ArrayPointer) {
  const tones = (k: number): Tone | undefined => f.tone[f.a[k]]
  const pointers: ArrayPointer[] = [ptr]
  return (
    <ArrayRow
      id={id}
      values={f.a.map(String)}
      keys={f.a.map(String)}
      tones={tones}
      index={start}
      pointers={pointers}
    />
  )
}

function BuildHeap({ step }: { step: number }) {
  const a = step >= A.length ? A_DONE : A[step]
  const bOn = step >= 5
  const bi = bOn ? step - 5 : 0
  const b = B[bi]
  return (
    <div className="dbh">
      <section className="dbh-case">
        <span className="vcaps">L07 · buildHeap, min-heap fra indeks 1</span>
        <div className="dbh-tree">{tree('dbh-a', a)}</div>
        {row('dbh-arr-a', a, 1, { id: 'i', at: a.i - 1, label: 'i', tone: 'focus' })}
        <Swap show={Math.min(step, A.length - 1)} className="dbh-line" items={A.map((f, k) => <span key={k}>{f.line}</span>)} />
      </section>

      <motion.section
        className="dbh-case"
        initial={false}
        animate={{ opacity: bOn ? 1 : 0.35 }}
        transition={bOn ? t.settle : t.fade}
      >
        <span className="vcaps">Weiss 7.5 · heapsort, max-heap fra indeks 0</span>
        <div className="dbh-tree">{tree('dbh-b', b)}</div>
        {row('dbh-arr-b', b, 0, { id: 'j', at: bOn && bi >= 2 ? 6 : -1, label: 'j', tone: 'idle' })}
        <Swap show={bi} className="dbh-line" items={B.map((f, k) => <span key={k}>{f.line}</span>)} />
      </motion.section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-buildheap',
  title: 'buildHeap nedefra og op, heapsort bagfra',
  steps: [
    {
      caption:
        'Slidets array `[33, 31, 18, 7, 19, 10]` som træ. Bladene 7, 19 og 10 er allerede heaps. `buildHeap` starter derfor ved `currentSize / 2 = 3`, den sidste knude med børn.',
      hold: 2800,
    },
    { caption: 'Trin 1: 18 har barnet 10, som er mindre. De bytter, og undertræet under indeks 3 er en heap.', hold: 2200 },
    { caption: 'Trin 2: 31 sammenlignes med det mindste barn, 7, og de bytter.', hold: 2000 },
    { caption: 'Trin 3: roden 33 bytter med det mindste barn, 7. Begge undertræer er allerede heaps.', hold: 2200 },
    {
      caption:
        'Trin 3b: 33 er stadig større end sine nye børn og bytter med 19. Resultatet er `[7, 19, 10, 31, 33, 18]` — fire byt, og de fleste knuder flyttede højst ét niveau. Derfor O(N).',
      hold: 3000,
    },
    {
      caption: 'Heapsort i bogen bruger en **max-heap** med roden på indeks 0. Input: `31, 41, 59, 26, 53, 58, 97`.',
      hold: 2200,
    },
    { caption: '`buildHeap` giver max-heapen `97, 53, 59, 26, 41, 58, 31` (figur 7.8). Maksimum står i roden.', hold: 2400 },
    {
      caption:
        '`deleteMax` bytter roden med sidste element i heapen. Heapen bliver én kortere, og 97 står nu på sin endelige plads bagerst.',
      hold: 2600,
    },
    {
      caption:
        '31 percolerer ned mod det **største** barn: 59 og derefter 58 rykker op. Resultatet `59, 53, 58, 26, 41, 31 | 97` er figur 7.9. Gentaget N − 1 gange står arrayet sorteret.',
      hold: 3000,
    },
  ],
  Component: BuildHeap,
}

export default viz
