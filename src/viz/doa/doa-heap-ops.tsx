import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Swap } from '../kit/primitives'
import { ArrayRow, Graph, type ArrayPointer, type GEdge, type GNode } from '../kit/algo'
import './doa-heap-ops.css'

/* Lecture07.pdf s. 31 (arrayet [-, 13, 21, 16, 24, 31, 19, -] på indeks 0–7, rod på 1),
   s. 34 (børn 2i og 2i + 1, forælder i / 2), s. 22 (insert 14: ny plads som højre barn af
   16, byt, stop under 13), s. 25 (deleteMin: hul i roden, sidste element 16 skal placeres)
   og s. 26 (percolate down mod mindste barn: 14 op, 16 over 19 → [14, 21, 16, 24, 31, 19]).
   Kode: s. 36 (insert) og s. 37/46 (deleteMin, minHeapify). Indhold: src/content/doa/p5-traeer.ts
   (binaer-heap). */

// Træet tegnes efter array-indeks: pladserne ligger fast, værdierne flytter.
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
const OUT = { x: 34, y: 24 } // hvor det udtrukne minimum lægges

interface Frame {
  /** indeks → værdi */
  slots: Record<number, number>
  /** Hullets indeks. */
  hole?: number
  /** Værdi der venter på sin plads (uden for heapen). */
  waiting?: number
  tone: Record<number, Tone>
  /** Kant (til barnets indeks) der er i fokus. */
  edge?: number
  node: number
  other?: { at: number; label: string }
  line: ReactNode
}

const BASE = { 1: 13, 2: 21, 3: 16, 4: 24, 5: 31, 6: 19 }

const F: Frame[] = [
  {
    slots: BASE,
    tone: {},
    node: -1,
    line: (
      <>
        <code>currentSize = 6</code> · børn af <code>i</code>: <code>2i</code>, <code>2i + 1</code> · forælder: <code>i / 2</code>
      </>
    ),
  },
  {
    slots: { ...BASE, 7: 14 },
    tone: { 14: 'focus', 16: 'focus' },
    edge: 7,
    node: 7,
    other: { at: 3, label: 'node/2' },
    line: (
      <>
        <code>insert(14)</code>: første ledige plads er 7; forælder 7 / 2 = 3 (16)
      </>
    ),
  },
  {
    slots: { ...BASE, 3: 14, 7: 16 },
    tone: { 14: 'focus' },
    edge: 3,
    node: 3,
    other: { at: 1, label: 'node/2' },
    line: <>14 &lt; 16: 16 flytter ned, hullet op til 3</>,
  },
  {
    slots: { ...BASE, 3: 14, 7: 16 },
    tone: { 14: 'ok' },
    node: -1,
    line: (
      <>
        14 &gt; 13: stop → <code>[13, 21, 14, 24, 31, 19, 16]</code>
      </>
    ),
  },
  {
    slots: { 2: 21, 3: 14, 4: 24, 5: 31, 6: 19, 7: 16 },
    hole: 1,
    waiting: 16,
    tone: { 16: 'focus', 13: 'muted' },
    node: 1,
    line: (
      <>
        <code>deleteMin</code>: hul i roden, <code>currentSize = 6</code>; 16 skal placeres
      </>
    ),
  },
  {
    slots: { 1: 14, 2: 21, 4: 24, 5: 31, 6: 19, 7: 16 },
    hole: 3,
    waiting: 16,
    tone: { 14: 'focus', 16: 'focus', 13: 'muted' },
    edge: 3,
    node: 3,
    line: <>børn 21 og 14: mindste er 14 &lt; 16 → 14 op</>,
  },
  {
    slots: { 1: 14, 2: 21, 3: 16, 4: 24, 5: 31, 6: 19 },
    tone: { 16: 'ok', 13: 'muted' },
    node: -1,
    line: (
      <>
        eneste barn 19 &gt; 16: 16 i hullet → <code>[14, 21, 16, 24, 31, 19]</code>
      </>
    ),
  },
]

// Pladser i array-rækken: indeks 0–7.
function arrayRow(f: Frame) {
  const values: ReactNode[] = []
  const keys: string[] = []
  const tones: Record<number, Tone> = {}
  for (let i = 0; i <= 7; i++) {
    const v = f.slots[i]
    if (v !== undefined) {
      values.push(String(v))
      keys.push(String(v))
      const tn = f.tone[v]
      if (tn) tones[i] = tn
    } else {
      values.push(i === f.hole ? '' : '–')
      keys.push(`e${i}`)
      tones[i] = i === f.hole ? 'ghost' : 'muted'
    }
  }
  const pointers: ArrayPointer[] = [
    { id: 'node', at: f.node, label: 'node', tone: 'focus' },
    { id: 'other', at: f.other?.at ?? -1, label: f.other?.label ?? '', tone: 'idle' },
  ]
  return <ArrayRow id="dho-arr" values={values} keys={keys} tones={tones} pointers={pointers} />
}

function tree(f: Frame, step: number) {
  const occupied = (i: number) => f.slots[i] !== undefined || f.hole === i
  const slotNodes: GNode[] = [1, 2, 3, 4, 5, 6, 7].map((i) => ({
    id: `s${i}`,
    label: '',
    ...POS[i],
    tone: 'ghost',
    show: occupied(i),
  }))
  const edges: GEdge[] = [2, 3, 4, 5, 6, 7].map((i) => ({
    from: `s${Math.floor(i / 2)}`,
    to: `s${i}`,
    tone: f.waiting !== undefined && f.slots[i] === f.waiting ? 'ghost' : f.edge === i ? 'focus' : 'idle',
  }))
  const where: Record<number, number> = {}
  Object.entries(f.slots).forEach(([i, v]) => (where[v] = Number(i)))
  const values = [13, 21, 16, 24, 31, 19, 14]
  const valueNodes: GNode[] = values.map((v) => {
    const i = where[v]
    const out = v === 13 && step >= 4
    const p = out ? OUT : i !== undefined ? POS[i] : POS[7]
    return {
      id: `v${v}`,
      label: String(v),
      ...p,
      tone: f.tone[v] ?? 'idle',
      show: i !== undefined || out,
      badge: out ? 'minItem' : undefined,
      badgeAt: 's',
      badgeTone: 'idle',
    }
  })
  return <Graph nodes={[...slotNodes, ...valueNodes]} edges={edges} width={W} height={H} />
}

function HeapOps({ step }: { step: number }) {
  const f = F[step]
  const op = step === 0 ? 0 : step <= 3 ? 1 : 2
  return (
    <div className="dho">
      <div className="dho-tree">{tree(f, step)}</div>
      <div className="dho-side">
        <Swap
          show={op}
          className="dho-op"
          items={[
            <span key="k0" className="vcaps">Min-heap, rod på indeks 1</span>,
            <span key="k1" className="vcaps">
              <code>insert</code> · percolate up
            </span>,
            <span key="k2" className="vcaps">
              <code>deleteMin</code> · percolate down (<code>minHeapify</code>)
            </span>,
          ]}
        />
        {arrayRow(f)}
        <Swap show={step} className="dho-line" items={F.map((x, i) => <span key={i}>{x.line}</span>)} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-heap-ops',
  title: 'Et hul der bobler op og ned',
  steps: [
    {
      caption:
        'Slidets heap som træ og array. Roden står på indeks 1, børnene til `i` på `2i` og `2i + 1`, forælderen på `i / 2`. Træet er komplet, så der er ingen pointere.',
      hold: 2800,
    },
    {
      caption:
        '`insert(14)`: den nye knude lægges på første ledige plads, indeks 7 — højre barn af 16. Forælderen findes på `7 / 2 = 3`.',
      hold: 2400,
    },
    {
      caption: '14 er mindre end 16, så 16 flytter ned i hullet, og hullet går op til indeks 3. Koden flytter et hul i stedet for at bytte.',
      hold: 2600,
    },
    {
      caption: 'Næste forælder er 13 på indeks 1. 14 er større, så **percolate up** stopper. Ordensegenskaben holder igen.',
      hold: 2200,
    },
    {
      caption:
        '`deleteMin`: minimum 13 tages ud af roden, og størrelsen tælles ned til 6. Det sidste element, 16, skal have en ny plads.',
      hold: 2600,
    },
    {
      caption: 'Hullet flytter mod det **mindste** barn. Børnene er 21 og 14; 14 er mindre end 16, så 14 rykker op i roden.',
      hold: 2600,
    },
    {
      caption:
        'Hullet på indeks 3 har kun barnet 19, og 19 er større end 16. 16 lægges i hullet: `[14, 21, 16, 24, 31, 19]`. Begge operationer gik én sti — O(log N).',
      hold: 3000,
    },
  ],
  Component: HeapOps,
}

export default viz
