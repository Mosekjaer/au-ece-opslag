import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t, stagger } from '../kit/motion'
import './doa-decision-tree.css'

/* Lecture06.pdf s. 25 (indre knuder = sammenligninger, blade = svar), s. 26
   (beslutningstræet for a, b, c med knuderne 1–11, samme som Weiss figur 7.20
   s. 324) og s. 27 (N! blade, højde ⌈log L⌉ → mindst ⌈log(N!)⌉ sammenligninger);
   Weiss s. 324–325 (Lemma 7.1–7.2, Theorem 7.6–7.7: log(N!) = Ω(N log N)).
   Indhold: src/content/doa/p4-sortering.ts. */

// Geometri i viewBox 340 × 368. Tekst er 13 enheder, så den er ≥ 11 px ved 375.
const W = 340
const H = 368
const LH = 15 // linjehøjde i en boks
const BW = 53 // boksbredde (5 tegn mono)
const CR = 11 // cirkel med knudenummer

interface DNode {
  id: number
  x: number
  top: number
  lines: string[]
  at: number // trinet hvor knuden kommer
  leaf?: boolean
}

const NODES: DNode[] = [
  { id: 1, x: 184, top: 4, lines: ['a<b<c', 'a<c<b', 'b<a<c', 'b<c<a', 'c<a<b', 'c<b<a'], at: 0 },
  { id: 2, x: 98, top: 146, lines: ['a<b<c', 'a<c<b', 'c<a<b'], at: 1 },
  { id: 3, x: 270, top: 146, lines: ['b<a<c', 'b<c<a', 'c<b<a'], at: 1 },
  { id: 4, x: 56, top: 243, lines: ['a<b<c', 'a<c<b'], at: 2 },
  { id: 5, x: 140, top: 243, lines: ['c<a<b'], at: 2, leaf: true },
  { id: 6, x: 228, top: 243, lines: ['b<a<c', 'b<c<a'], at: 3 },
  { id: 7, x: 312, top: 243, lines: ['c<b<a'], at: 3, leaf: true },
  { id: 8, x: 28, top: 323, lines: ['a<b<c'], at: 2, leaf: true },
  { id: 9, x: 84, top: 323, lines: ['a<c<b'], at: 2, leaf: true },
  { id: 10, x: 200, top: 323, lines: ['b<a<c'], at: 3, leaf: true },
  { id: 11, x: 256, top: 323, lines: ['b<c<a'], at: 3, leaf: true },
]
const byId = Object.fromEntries(NODES.map((n) => [n.id, n]))
const boxH = (n: DNode) => n.lines.length * LH + 8
/** Midtpunkt for cirklen med knudenummeret; den sidder på boksens underkant. */
const numY = (n: DNode) => n.top + boxH(n) + CR - 2

// Kanter med sammenligningen som label (slidets ordlyd og side).
const EDGES = [
  { from: 1, to: 2, label: 'a<b' },
  { from: 1, to: 3, label: 'b<a' },
  { from: 2, to: 4, label: 'a<c' },
  { from: 2, to: 5, label: 'c<a' },
  { from: 4, to: 8, label: 'b<c' },
  { from: 4, to: 9, label: 'c<b' },
  { from: 3, to: 6, label: 'b<c' },
  { from: 3, to: 7, label: 'c<b' },
  { from: 6, to: 10, label: 'a<c' },
  { from: 6, to: 11, label: 'c<a' },
]

const FINAL = 4
const PATH = new Set([1, 2, 4, 8]) // én længste vej, markeres i slutrammen

function Tree({ step }: { step: number }) {
  return (
    <svg className="ddt-svg" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: `${Math.round(W * 1.2)}px` }} aria-hidden="true">
      {EDGES.map((e) => {
        const a = byId[e.from]
        const b = byId[e.to]
        const on = step >= b.at
        const x1 = a.x
        const y1 = numY(a) + CR
        const x2 = b.x
        const y2 = b.top
        const left = b.x < a.x
        const tone = step >= FINAL && PATH.has(e.to) ? 'path' : step === b.at ? 'focus' : 'idle'
        return (
          <motion.g
            key={`${e.from}-${e.to}`}
            className="ddt-edge"
            data-tone={tone}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? t.settle : t.fade}
          >
            <line x1={x1} y1={y1} x2={x2} y2={y2} className="ddt-line" />
            <text
              x={(x1 + x2) / 2 + (left ? -6 : 6)}
              y={(y1 + y2) / 2 - 8}
              textAnchor={left ? 'end' : 'start'}
              dominantBaseline="central"
              className="ddt-elabel"
            >
              {e.label}
            </text>
          </motion.g>
        )
      })}
      {NODES.map((n, i) => {
        const on = step >= n.at
        const h = boxH(n)
        const tone =
          step >= FINAL && PATH.has(n.id) ? 'path' : n.leaf && step >= FINAL ? 'leaf' : step === n.at ? 'focus' : 'idle'
        return (
          <motion.g
            key={n.id}
            className="ddt-node"
            data-tone={tone}
            data-leaf={n.leaf || undefined}
            initial={false}
            animate={{ opacity: on ? 1 : 0, y: on ? 0 : -6 }}
            transition={on ? stagger(i % 4, 0.1, 0.08) : t.fade}
          >
            <rect x={n.x - BW / 2} y={n.top} width={BW} height={h} rx={3} className="ddt-box" />
            {n.lines.map((l, k) => (
              <text key={k} x={n.x} y={n.top + 4 + LH / 2 + k * LH} textAnchor="middle" dominantBaseline="central" className="ddt-ord">
                {l}
              </text>
            ))}
            <circle cx={n.x} cy={numY(n)} r={CR} className="ddt-num-c" />
            <text x={n.x} y={numY(n)} textAnchor="middle" dominantBaseline="central" className="ddt-num">
              {n.id}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

const FACTS = [
  { at: 0, text: <>Roden rummer alle <strong>3! = 6</strong> mulige ordninger af <code>a</code>, <code>b</code>, <code>c</code>.</> },
  { at: 1, text: <>Hver indre knude er én sammenligning; svaret deler de tilbageværende ordninger i to.</> },
  { at: 3, text: <>Hvert blad er præcis én ordning: <strong>6 blade = 3!</strong></> },
  {
    at: FINAL,
    text: (
      <>
        Længste vej, fx 1 → 2 → 4 → 8: <strong>3 sammenligninger</strong> = ⌈log 6⌉.
      </>
    ),
  },
  {
    at: FINAL,
    text: (
      <>
        N elementer giver N! blade, så højden er mindst ⌈log N!⌉ = <strong>Ω(n log n)</strong> — for enhver sammenligningsbaseret
        sortering.
      </>
    ),
  },
]

function Decision({ step }: { step: number }) {
  return (
    <div className="ddt">
      <div className="ddt-fig">
        <Tree step={step} />
      </div>
      <ol className="ddt-facts">
        {FACTS.map((f, i) => {
          const on = step >= f.at
          return (
            <motion.li
              key={i}
              data-now={step === f.at || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 3 }}
              transition={on ? t.settle : t.fade}
            >
              {f.text}
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-decision-tree',
  title: 'Beslutningstræet for tre elementer',
  steps: [
    { caption: 'Før første sammenligning kan `a`, `b` og `c` stå i alle seks ordninger.', hold: 2200 },
    {
      caption: 'Første sammenligning, `a` mod `b`, deler de seks i to grupper på tre (knude 2 og 3).',
      hold: 2400,
    },
    {
      caption: 'Fra knude 2: `c<a` efterlader én ordning (blad 5); ellers skal `b` mod `c` skille blad 8 og 9 ad.',
      hold: 2800,
    },
    { caption: 'Symmetrisk fra knude 3: blad 7 direkte, blad 10 og 11 efter én sammenligning mere.', hold: 2400 },
    {
      caption: '6 blade kræver dybde 3 = ⌈log 6⌉. Med N! blade er dybden mindst ⌈log N!⌉ = Ω(n log n).',
      hold: 3000,
    },
  ],
  Component: Decision,
}

export default viz
