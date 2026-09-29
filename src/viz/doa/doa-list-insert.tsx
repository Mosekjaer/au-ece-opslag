import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, type Tone } from '../kit/primitives'
import { ArrayRow } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-list-insert.css'

/* Lecture03.pdf s. 7 (“Happy” som array med indeks 0–4 og som linked list med item/next),
   s. 8 (simple_int_list: h → 4 → 6 → 1 → t med markørnoderne head og tail),
   s. 18–20 (push_front: p->next = head->next; head->next = p),
   s. 21–26 (insert(x,2) på h → 4 → 6 → t: p på 4 med pos = 2, p på 6 med pos = 1,
   q->next = p->next, p->next = q → h → 4 → 6 → x → t).
   Arrayets pris: Weiss s. 78–79 (indsættelse på position 0 skubber hele arrayet; ændringer
   i den høje ende flytter intet). Indhold: src/content/doa/p2-lineaere.ts (lister). */

// ------------------------------------------------------------ geometri (viewBox 312 × 112)
const W = 312
const H = 112
const ROW = 36
const LOW = 84
const IW = 24 // item-boks
const NW = 16 // next-boks
const BH = 22
const SLOT = [8, 72, 136, 200, 264]

interface LNode {
  id: string
  label: string
  x: number
  y: number
  sentinel?: boolean
}

const NODES: LNode[] = [
  // Happy (s. 7)
  ...['H', 'a', 'p', 'p', 'y'].map((c, i) => ({ id: `a${i}`, label: c, x: SLOT[i], y: ROW })),
  // push_front på h → 4 → 6 → 1 → t (s. 8, 18–20)
  { id: 'bh', label: 'h', x: SLOT[0], y: ROW, sentinel: true },
  { id: 'b4', label: '4', x: SLOT[1], y: ROW },
  { id: 'b6', label: '6', x: SLOT[2], y: ROW },
  { id: 'b1', label: '1', x: SLOT[3], y: ROW },
  { id: 'bt', label: 't', x: SLOT[4], y: ROW, sentinel: true },
  { id: 'bx', label: 'x', x: (SLOT[0] + SLOT[1]) / 2, y: LOW },
  // insert(x,2) på h → 4 → 6 → t (s. 21–26)
  { id: 'ch', label: 'h', x: SLOT[0], y: ROW, sentinel: true },
  { id: 'c4', label: '4', x: SLOT[1], y: ROW },
  { id: 'c6', label: '6', x: SLOT[2], y: ROW },
  { id: 'ct', label: 't', x: SLOT[3], y: ROW, sentinel: true },
  { id: 'cx', label: 'x', x: (SLOT[2] + SLOT[3]) / 2, y: LOW },
]
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]))

type Phase = 'a' | 'b' | 'c'
const phaseOf = (step: number): Phase => (step === 0 ? 'a' : step <= 3 ? 'b' : 'c')

function nodeState(n: LNode, step: number): { show: boolean; tone: Tone } {
  const ph = phaseOf(step)
  if (n.id[0] !== ph) return { show: false, tone: 'idle' }
  if (n.id === 'bx') return { show: step >= 3, tone: 'ok' }
  if (n.id === 'cx') return { show: step >= 6, tone: 'ok' }
  if (n.id === 'bh' && step === 3) return { show: true, tone: 'focus' }
  if (n.id === 'c4' && step === 4) return { show: true, tone: 'focus' }
  if (n.id === 'c6' && step >= 5) return { show: true, tone: 'focus' }
  return { show: true, tone: 'idle' }
}

interface LEdge {
  id: string
  from: string
  to: string
  /** Trin hvor kanten findes: [fra, til] inklusiv. */
  on: [number, number]
  focus?: number[]
}

const EDGES: LEdge[] = [
  { id: 'a01', from: 'a0', to: 'a1', on: [0, 0] },
  { id: 'a12', from: 'a1', to: 'a2', on: [0, 0] },
  { id: 'a23', from: 'a2', to: 'a3', on: [0, 0] },
  { id: 'a34', from: 'a3', to: 'a4', on: [0, 0] },
  { id: 'bh4', from: 'bh', to: 'b4', on: [1, 2] },
  { id: 'b46', from: 'b4', to: 'b6', on: [1, 3] },
  { id: 'b61', from: 'b6', to: 'b1', on: [1, 3] },
  { id: 'b1t', from: 'b1', to: 'bt', on: [1, 3] },
  { id: 'bhx', from: 'bh', to: 'bx', on: [3, 3], focus: [3] },
  { id: 'bx4', from: 'bx', to: 'b4', on: [3, 3], focus: [3] },
  { id: 'ch4', from: 'ch', to: 'c4', on: [4, 7] },
  { id: 'c46', from: 'c4', to: 'c6', on: [4, 7] },
  { id: 'c6t', from: 'c6', to: 'ct', on: [4, 6] },
  { id: 'cxt', from: 'cx', to: 'ct', on: [6, 7], focus: [6] },
  { id: 'c6x', from: 'c6', to: 'cx', on: [7, 7], focus: [7] },
]

const AH = 6
function edgePath(e: LEdge) {
  const a = byId[e.from]
  const b = byId[e.to]
  const x1 = a.x + IW + NW / 2
  const y1 = a.y + BH / 2
  let x2: number
  let y2: number
  if (Math.abs(b.y - a.y) < 4) {
    x2 = b.x
    y2 = b.y + BH / 2
  } else if (b.y > a.y) {
    x2 = b.x + IW / 2
    y2 = b.y
  } else {
    x2 = b.x + IW / 2
    y2 = b.y + BH
  }
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const bx = x2 - ux * AH
  const by = y2 - uy * AH
  return {
    line: `M${x1} ${y1} L${bx} ${by}`,
    head: `M${x2} ${y2} L${bx - uy * 3.6} ${by + ux * 3.6} L${bx + uy * 3.6} ${by - ux * 3.6} Z`,
  }
}

// p-markøren over rækken (s. 26: “p, pos = 1”)
const P_AT: Record<number, { node: string; text: string }> = {
  4: { node: 'c4', text: 'p, pos = 2' },
  5: { node: 'c6', text: 'p, pos = 1' },
  6: { node: 'c6', text: 'p' },
  7: { node: 'c6', text: 'p' },
}

function ListSvg({ step }: { step: number }) {
  const p = P_AT[step]
  const pn = p ? byId[p.node] : byId.c4
  return (
    <svg className="dli-svg" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: `${Math.round(W * 1.35)}px` }} aria-hidden="true">
      {EDGES.map((e) => {
        const on = step >= e.on[0] && step <= e.on[1]
        const tone = e.focus?.includes(step) ? 'focus' : 'idle'
        const { line, head } = edgePath(e)
        return (
          <motion.g
            key={e.id}
            className="dli-edge"
            data-tone={tone}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.settle, delay: e.focus ? 0.25 : 0 } : t.fade}
          >
            <path d={line} className="dli-line" />
            <path d={head} className="dli-head" />
          </motion.g>
        )
      })}

      {NODES.map((n) => {
        const s = nodeState(n, step)
        return (
          <motion.g
            key={n.id}
            className="dli-node"
            data-tone={s.tone}
            data-sentinel={n.sentinel || undefined}
            initial={false}
            animate={{ opacity: s.show ? 1 : 0, y: s.show ? 0 : 6 }}
            transition={s.show ? t.place : t.fade}
          >
            <rect x={n.x} y={n.y} width={IW} height={BH} rx={2} className="dli-item" />
            <rect x={n.x + IW} y={n.y} width={NW} height={BH} rx={2} className="dli-next" />
            <circle cx={n.x + IW + NW / 2} cy={n.y + BH / 2} r={2.4} className="dli-dot" />
            <text x={n.x + IW / 2} y={n.y + BH / 2 + 0.5} className="dli-label" textAnchor="middle" dominantBaseline="central">
              {n.label}
            </text>
          </motion.g>
        )
      })}

      {/* Navnet på den nye node: p i push_front, q i insert */}
      <motion.text
        x={byId.bx.x - 5}
        y={LOW + BH / 2}
        className="dli-var"
        textAnchor="end"
        dominantBaseline="central"
        initial={false}
        animate={{ opacity: step === 3 ? 1 : 0 }}
        transition={t.fade}
      >
        p
      </motion.text>
      <motion.text
        x={byId.cx.x - 5}
        y={LOW + BH / 2}
        className="dli-var"
        textAnchor="end"
        dominantBaseline="central"
        initial={false}
        animate={{ opacity: step >= 6 ? 1 : 0 }}
        transition={t.fade}
      >
        q
      </motion.text>

      {/* p-markør over forgængeren */}
      <motion.g
        className="dli-ptr"
        initial={false}
        animate={{ x: pn.x + IW / 2, opacity: p ? 1 : 0 }}
        transition={{ x: t.travel, opacity: t.fade }}
      >
        <text x={0} y={9} textAnchor="middle" dominantBaseline="central" className="dli-var">
          {p?.text ?? ''}
        </text>
        <path d={`M0 17 L0 ${ROW - 4}`} className="dli-ptr-line" />
        <path d={`M0 ${ROW - 1} L-3.4 ${ROW - 7} L3.4 ${ROW - 7} Z`} className="dli-ptr-head" />
      </motion.g>
    </svg>
  )
}

// ------------------------------------------------------------------ array
function arrayAt(step: number): { values: string[]; keys: string[]; tones: Record<number, Tone> } {
  const ghostFrom = (n: number) => Object.fromEntries(Array.from({ length: 5 - n }, (_, i) => [n + i, 'ghost' as Tone]))
  if (step === 0) return { values: ['H', 'a', 'p', 'p', 'y'], keys: ['a0', 'a1', 'a2', 'a3', 'a4'], tones: {} }
  if (step === 1) return { values: ['4', '6', '1', '', ''], keys: ['b4', 'b6', 'b1', 'e3', 'e4'], tones: ghostFrom(3) }
  if (step <= 3)
    return {
      values: ['x', '4', '6', '1', ''],
      keys: ['bx', 'b4', 'b6', 'b1', 'e4'],
      tones: step === 2 ? { 0: 'ok', 1: 'focus', 2: 'focus', 3: 'focus', 4: 'ghost' } : { 0: 'ok', 4: 'ghost' },
    }
  if (step <= 6) return { values: ['4', '6', '', '', ''], keys: ['c4', 'c6', 'f2', 'f3', 'f4'], tones: ghostFrom(2) }
  return { values: ['4', '6', 'x', '', ''], keys: ['c4', 'c6', 'cx', 'f3', 'f4'], tones: { 2: 'ok', 3: 'ghost', 4: 'ghost' } }
}

const CODE: ReactNode[] = [
  <>struct Node {'{'} item; Node *next; {'}'}</>,
  <>Node *head, *tail;  // markørnoder h og t</>,
  <>// array: 1, 6 og 4 rykker én plads</>,
  <>p-&gt;next = head-&gt;next;  head-&gt;next = p;</>,
  <>Node *p = head-&gt;next;  // pos = 2</>,
  <>while (pos &gt; 1) {'{'} p = p-&gt;next; pos--; {'}'}</>,
  <>q-&gt;next = p-&gt;next;</>,
  <>p-&gt;next = q;  theSize++;</>,
]

// ------------------------------------------------------------------ pris
interface Cost {
  op: ReactNode
  rows: { who: string; what: ReactNode; at: number; tone: 'neg' | 'ok' }[]
}
const COSTS: Cost[] = [
  {
    op: <code>push_front(x)</code>,
    rows: [
      { who: 'array', what: <>3 elementer flyttes — O(N)</>, at: 2, tone: 'neg' },
      { who: 'liste', what: <>2 pointere ændres — O(1)</>, at: 3, tone: 'ok' },
    ],
  },
  {
    op: <code>insert(x, 2)</code>,
    rows: [
      { who: 'liste', what: <>1 skridt til forgængeren, så 2 pointere</>, at: 7, tone: 'ok' },
      { who: 'array', what: <>x skrives bagerst — intet flyttes</>, at: 7, tone: 'ok' },
    ],
  },
]

function ListInsert({ step }: { step: number }) {
  const arr = arrayAt(step)
  return (
    <div className="dli">
      <div className="dli-main">
        <ArrayRow id="dli-arr" label="array" values={arr.values} keys={arr.keys} tones={arr.tones} />
        <div className="dli-list">
          <span className="varr-label">linked list</span>
          <ListSvg step={step} />
        </div>
        <Swap show={step} className="dli-code" items={CODE.map((c, i) => <code key={i}>{c}</code>)} />
      </div>

      <div className="dli-side">
        <span className="vcaps">Hvad koster indsættelsen?</span>
        {COSTS.map((c, ci) => (
          <div key={ci} className="dli-cost">
            <div className="dli-cost-op">{c.op}</div>
            {c.rows.map((r) => {
              const on = step >= r.at
              return (
                <motion.div
                  key={r.who}
                  className="dli-cost-row"
                  data-tone={r.tone}
                  data-now={step === r.at || undefined}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.28 }}
                  transition={t.fade}
                >
                  <span className="dli-who">{r.who}</span>
                  <motion.span
                    className="dli-what"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={on ? t.settle : t.fade}
                  >
                    {r.what}
                  </motion.span>
                </motion.div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-list-insert',
  title: 'Array flytter elementer, linked list omkobler pointere',
  steps: [
    {
      caption:
        'Slidets “Happy” to gange. Som **array** ligger tegnene side om side med indeks 0–4. Som **linked list** ligger hvert tegn i en node med `item` og en `next`-pointer.',
      hold: 2800,
    },
    {
      caption: 'Kursets `simple_int_list` har markørnoderne `head` og `tail`: `h → 4 → 6 → 1 → t`. Arrayet har de samme tre tal.',
      hold: 2200,
    },
    {
      caption: '`push_front(x)` i arrayet: 1, 6 og 4 skal hver én plads til højre, før `x` kan stå på indeks 0. Det er **O(N)**.',
      hold: 2600,
    },
    {
      caption:
        '`push_front(x)` i listen: ny node `p`, så `p->next = head->next` og `head->next = p`. Ingen node flytter sig, to pointere ændres. Det er **O(1)**.',
      hold: 3000,
    },
    {
      caption: '`insert(x,2)` på `h → 4 → 6 → t` skal først finde **forgængeren**. `p` starter på `head->next`, altså 4, med `pos = 2`.',
      hold: 2400,
    },
    { caption: 'Så længe `pos > 1`: `p = p->next; pos--`. Nu står `p` på 6 med `pos = 1`, og løkken stopper.', hold: 2200 },
    { caption: 'Den nye node `q` får `q->next = p->next`, så den også peger på `t`.', hold: 2000 },
    {
      caption:
        '`p->next = q` hægter `x` ind: `h → 4 → 6 → x → t`. I arrayet lander `x` bagerst, så intet flyttes. Det dyre er ændringer forrest.',
      hold: 3000,
    },
  ],
  Component: ListInsert,
}

export default viz
