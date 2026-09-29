import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import { t } from '../kit/motion'
import './futures.css'

/* Concurrency - Dependencies, Futures.pdf s. 4 (ContinueWhenAll), s. 7 (build-eksemplet:
   build1–3 med StartNew, build4–8 med ContinueWhenAll), s. 8 (første kørsel: project1, 3, 2
   kl. 09:07:06; 5, 4 kl. :07; 6, 8 kl. :08; 7 kl. :09), s. 10 (future = Task<TResult>;
   parallel tasks ~ async actions, futures ~ async functions), s. 11 (Main og grafen med
   kanterne a, a, b, c, d, f), s. 12 (futureB = Task.Run(() => F1(a)), futureB.Result) og
   s. 13 (de tre tilfælde ved .Result). Markdown:
   swd/markdown/slides/SW4SWD-01_W12.1_Concurrency_Dependencies_Futures.md, afsnit 2–4.
   Alle pile går fra forudsætning til afhængig som på s. 4 og s. 11 (s. 3 vender dem om).
   F1 står til venstre som på grafen s. 11; slidets “right part of the tree” er ikke brugt.
   Illustrativt: blokkenes længder i de tre .Result-tilfælde (slidene angiver ingen tider). */

/* ------------------------------- F1–F4-grafen ------------------------------ */

type N = 'start' | 'F1' | 'F2' | 'F3' | 'F4' | 'end'
type P = [number, number]
interface DagLayout {
  w: number
  h: number
  font: number
  box: [number, number]
  /** Knudernes placering i de tre faser: sekventiel, DAG, med future-bane. */
  seq: Record<N, P>
  dag: Record<N, P>
  fut: Record<N, P>
  lane: { full: [number, number]; task: [number, number]; main: [number, number] }
}
const DAG_WIDE: DagLayout = {
  w: 432,
  h: 300,
  font: 13,
  box: [66, 28],
  seq: { start: [216, 28], F1: [216, 76], F2: [216, 124], F3: [216, 172], F4: [216, 222], end: [216, 272] },
  dag: { start: [216, 28], F1: [104, 96], F2: [316, 96], F3: [316, 164], F4: [216, 226], end: [216, 278] },
  fut: { start: [318, 28], F1: [94, 96], F2: [318, 96], F3: [318, 164], F4: [318, 226], end: [318, 278] },
  lane: { full: [0, 432], task: [0, 186], main: [196, 432] },
}
const DAG_NARROW: DagLayout = {
  w: 300,
  h: 300,
  font: 12.5,
  box: [60, 26],
  seq: { start: [150, 28], F1: [150, 76], F2: [150, 124], F3: [150, 172], F4: [150, 222], end: [150, 272] },
  dag: { start: [150, 28], F1: [74, 96], F2: [222, 96], F3: [222, 164], F4: [150, 226], end: [150, 278] },
  fut: { start: [222, 28], F1: [64, 96], F2: [222, 96], F3: [222, 164], F4: [222, 226], end: [222, 278] },
  lane: { full: [0, 300], task: [0, 128], main: [138, 300] },
}

interface Edge {
  id: string
  from: N
  to: N
  label?: string
}
const SEQ_EDGES: Edge[] = [
  { id: 's1', from: 'start', to: 'F1' },
  { id: 's2', from: 'F1', to: 'F2' },
  { id: 's3', from: 'F2', to: 'F3' },
  { id: 's4', from: 'F3', to: 'F4' },
  { id: 's5', from: 'F4', to: 'end' },
]
const DAG_EDGES: Edge[] = [
  { id: 'a1', from: 'start', to: 'F1', label: 'a' },
  { id: 'a2', from: 'start', to: 'F2', label: 'a' },
  { id: 'c', from: 'F2', to: 'F3', label: 'c' },
  { id: 'b', from: 'F1', to: 'F4', label: 'b' },
  { id: 'd', from: 'F3', to: 'F4', label: 'd' },
  { id: 'f', from: 'F4', to: 'end', label: 'f' },
]

const R = 6
/** Pilens endepunkter: klippes ved kildens og målets kant (boks eller cirkel). */
function ends(L: DagLayout, pos: Record<N, P>, e: Edge) {
  const [ax, ay] = pos[e.from]
  const [bx, by] = pos[e.to]
  const dx = bx - ax
  const dy = by - ay
  const len = Math.hypot(dx, dy) || 1
  const [hw, hh] = [L.box[0] / 2, L.box[1] / 2]
  /** Andel af linjen fra centrum til kanten. */
  const clip = (n: N, gap: number) => {
    if (n === 'start' || n === 'end') return (R + gap) / len
    const tx = dx === 0 ? Infinity : hw / Math.abs(dx)
    const ty = dy === 0 ? Infinity : hh / Math.abs(dy)
    return Math.min(tx, ty) + gap / len
  }
  const k1 = clip(e.from, 0)
  const k2 = clip(e.to, 2)
  // Label på den side af linjen, der vender opad/udad.
  const [nx, ny] = dx < 0 ? [-dy / len, dx / len] : [dy / len, -dx / len]
  return {
    x1: ax + dx * k1,
    y1: ay + dy * k1,
    x2: bx - dx * k2,
    y2: by - dy * k2,
    lx: (ax + bx) / 2 + nx * 9,
    ly: (ay + by) / 2 + ny * 9,
  }
}

function Dag({ L, step, id }: { L: DagLayout; step: number; id: string }) {
  const phase = step === 0 ? 'seq' : step === 1 ? 'dag' : 'fut'
  const pos = L[phase]
  const split = step >= 2
  const [bw, bh] = L.box
  const hot = (n: N) =>
    (step === 2 && (n === 'F1' || n === 'F2' || n === 'F3')) || (step === 3 && n === 'F4') ? true : undefined
  const laneFor = (n: N) => (split && n === 'F1' ? 'task' : 'main')
  return (
    <svg className={`fut-dag ${id}`} viewBox={`0 0 ${L.w} ${L.h}`} style={{ fontSize: L.font }} aria-hidden="true">
      <defs>
        <marker id={`${id}-arr`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9 Z" className="fut-arrhead" />
        </marker>
        <marker id={`${id}-arr-hot`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9 Z" className="fut-arrhead is-hot" />
        </marker>
      </defs>

      {/* Baner: én “main”, der deles, når F1 bliver en future */}
      <motion.rect
        className="fut-lane"
        y={4}
        height={L.h - 8}
        rx={8}
        initial={false}
        animate={{ x: split ? L.lane.main[0] : L.lane.full[0], width: (split ? L.lane.main[1] - L.lane.main[0] : L.lane.full[1] - L.lane.full[0]) }}
        transition={t.travel}
      />
      <motion.text
        className="fut-lane-name"
        y={20}
        initial={false}
        animate={{ x: (split ? L.lane.main[0] : L.lane.full[0]) + 8 }}
        transition={t.travel}
      >
        main
      </motion.text>
      <motion.rect
        className="fut-lane is-task"
        x={L.lane.task[0]}
        y={4}
        width={L.lane.task[1] - L.lane.task[0]}
        height={L.h - 8}
        rx={8}
        initial={false}
        animate={{ opacity: split ? 1 : 0 }}
        transition={split ? { ...t.fade, delay: 0.2 } : t.fade}
      />
      <motion.text className="fut-lane-name is-task" x={L.lane.task[0] + 8} y={20} initial={false} animate={{ opacity: split ? 1 : 0 }} transition={t.fade}>
        task (futureB)
      </motion.text>

      {/* Kanter: sekventiel rækkefølge (trin 0) og datastrømmen (trin 1+) */}
      {[...SEQ_EDGES.map((e) => ({ e, on: step === 0 })), ...DAG_EDGES.map((e) => ({ e, on: step >= 1 }))].map(({ e, on }) => {
        const p = ends(L, pos, e)
        const isHot = (step === 2 && (e.id === 'a1' || e.id === 'c')) || (step === 3 && e.id === 'b')
        return (
          <g key={e.id}>
            <motion.line
              className="fut-edge"
              data-hot={isHot || undefined}
              markerEnd={`url(#${id}-arr${isHot ? '-hot' : ''})`}
              initial={false}
              animate={{ x1: p.x1, y1: p.y1, x2: p.x2, y2: p.y2, opacity: on ? 1 : 0 }}
              transition={{ ...t.travel, opacity: on ? { ...t.fade, delay: 0.35 } : t.fade }}
            />
            {e.label && (
              <motion.text
                className="fut-elabel"
                data-hot={isHot || undefined}
                textAnchor="middle"
                initial={false}
                animate={{ x: p.lx, y: p.ly + 4, opacity: on ? 1 : 0 }}
                transition={{ ...t.travel, opacity: on ? { ...t.fade, delay: 0.5 } : t.fade }}
              >
                {e.label}
              </motion.text>
            )}
          </g>
        )
      })}

      {/* Start og slut */}
      {(['start', 'end'] as const).map((n) => (
        <motion.circle key={n} className="fut-term" r={R} initial={false} animate={{ cx: pos[n][0], cy: pos[n][1] }} transition={t.travel} />
      ))}

      {/* F1–F4 */}
      {(['F1', 'F2', 'F3', 'F4'] as const).map((n) => (
        <motion.g
          key={n}
          className="fut-node"
          data-hot={hot(n)}
          data-lane={laneFor(n)}
          initial={false}
          animate={{ x: pos[n][0] - bw / 2, y: pos[n][1] - bh / 2 }}
          transition={n === 'F1' && step === 2 ? { ...t.travel, duration: 1.1 } : t.travel}
        >
          <rect width={bw} height={bh} rx={6} />
          <text x={bw / 2} y={bh / 2}>
            {n}()
          </text>
        </motion.g>
      ))}

      {/* futureB.Result ved F4 */}
      <motion.g initial={false} animate={{ opacity: step >= 3 ? 1 : 0 }} transition={step >= 3 ? { ...t.fade, delay: 0.3 } : t.fade}>
        <text className="fut-result" x={pos.F4[0] - 8} y={pos.F4[1] + bh / 2 + 15} textAnchor="end">
          futureB.Result
        </text>
      </motion.g>
    </svg>
  )
}

/* ------------------------------- .Result-tilfælde ------------------------------ */

type Blk = { s: number; e: number; label: string; kind?: 'f1' | 'block' | 'ghost' }
interface Case {
  id: string
  head: ReactNode
  task: Blk[]
  main: Blk[]
}
const CASES: Case[] = [
  {
    id: 'done',
    head: (
      <>
        <b>færdig</b> → returneres straks
      </>
    ),
    task: [{ s: 0, e: 1, label: 'F1()', kind: 'f1' }],
    main: [
      { s: 0, e: 1, label: 'F2()' },
      { s: 1, e: 2, label: 'F3()' },
      { s: 2, e: 3, label: 'F4()' },
    ],
  },
  {
    id: 'running',
    head: (
      <>
        <b>kører</b> → kalderen blokerer
      </>
    ),
    task: [{ s: 1.9, e: 2.9, label: 'F1()', kind: 'f1' }],
    main: [
      { s: 0, e: 1, label: 'F2()' },
      { s: 1, e: 2, label: 'F3()' },
      { s: 2, e: 2.9, label: 'blokerer', kind: 'block' },
      { s: 2.9, e: 3.9, label: 'F4()' },
    ],
  },
  {
    id: 'notstarted',
    head: (
      <>
        <b>ikke startet</b> → køres inline, hvis muligt
      </>
    ),
    task: [{ s: 0, e: 2, label: 'ikke startet', kind: 'ghost' }],
    main: [
      { s: 0, e: 1, label: 'F2()' },
      { s: 1, e: 2, label: 'F3()' },
      { s: 2, e: 3, label: 'F1()', kind: 'f1' },
      { s: 3, e: 4, label: 'F4()' },
    ],
  },
]
const SPAN = 4

function Track({ blocks }: { blocks: Blk[] }) {
  return (
    <div className="fut-track">
      {blocks.map((b) => (
        <span
          key={b.label + b.s}
          className="fut-blk"
          data-kind={b.kind}
          style={{ left: `${(b.s / SPAN) * 100}%`, width: `calc(${((b.e - b.s) / SPAN) * 100}% - 2px)` }}
        >
          {b.label}
        </span>
      ))}
    </div>
  )
}

function Cases({ step }: { step: number }) {
  const on = step >= 3
  return (
    <div className="fut-cases" data-on={on || undefined}>
      <motion.div className="fut-cases-head" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
        <code>futureB.Result</code>, når <code>F4()</code> kaldes
      </motion.div>
      <div className="fut-case-list">
      {CASES.map((c, i) => (
        <motion.div
          key={c.id}
          className="fut-case"
          initial={false}
          animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
          transition={on ? { ...t.settle, delay: step === 3 ? 0.3 + i * 0.35 : 0 } : t.fade}
        >
          <div className="fut-case-head">{c.head}</div>
          <div className="fut-tl">
            <span className="fut-tl-name">task</span>
            <Track blocks={c.task} />
            <span className="fut-tl-name">main</span>
            <Track blocks={c.main} />
          </div>
        </motion.div>
      ))}
      </div>
      <motion.p className="fut-note" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
        Blokkenes længder er illustrative; slidene angiver ingen tider.
      </motion.p>
    </div>
  )
}

/* --------------------------------- Koden --------------------------------- */

type Seg = string | { hl: string }
const SEQ_CODE: Seg[][] = [
  ['static void Main(string[] args)'],
  ['{'],
  ['    var a = "A";'],
  ['    var b = F1(a);'],
  ['    var c = F2(a);'],
  ['    var d = F3(c);'],
  ['    var f = F4(b, d);'],
  ['    System.Console.WriteLine(f);'],
  ['}'],
]
const FUT_CODE: Seg[][] = [
  ['static void Main()'],
  ['{'],
  ['    var a = "A";'],
  ['    ', { hl: 'Task<string> futureB = Task.Run(() => F1(a));' }],
  ['    var c = F2(a);'],
  ['    var d = F3(c);'],
  ['    var f = F4(', { hl: 'futureB.Result' }, ', d);'],
  ['    Console.WriteLine(f);'],
  ['}'],
]

function Code({ lines, title, hot }: { lines: Seg[][]; title: string; hot: boolean }) {
  return (
    <div className="fut-code" data-hot={hot || undefined}>
      <div className="fut-code-title">{title}</div>
      <pre>
        <code>
          {lines.map((l, i) => (
            <Fragment key={i}>
              {l.map((s, j) => (typeof s === 'string' ? <Fragment key={j}>{s}</Fragment> : <mark key={j}>{s.hl}</mark>))}
              {'\n'}
            </Fragment>
          ))}
        </code>
      </pre>
    </div>
  )
}

/* ------------------------------- Build-DAG'en ------------------------------ */

interface BuildLayout {
  w: number
  h: number
  font: number
  box: [number, number]
  x: (c: number) => number
  y: (r: number) => number
  short: boolean
}
const BUILD_WIDE: BuildLayout = {
  w: 384,
  h: 300,
  font: 13,
  box: [88, 40],
  x: (c) => 56 + c * 136,
  y: (r) => 28 + r * 80,
  short: false,
}
const BUILD_NARROW: BuildLayout = {
  w: 300,
  h: 288,
  font: 12.5,
  box: [72, 38],
  x: (c) => 42 + c * 108,
  y: (r) => 24 + r * 78,
  short: true,
}
/** Kolonne, række og tidsstempel (første kørsel, s. 8). */
const BUILDS: Record<number, { c: number; r: number; time: string; g: number }> = {
  1: { c: 0, r: 0, time: '09:07:06', g: 0 },
  2: { c: 1, r: 0, time: '09:07:06', g: 0 },
  3: { c: 2, r: 0, time: '09:07:06', g: 0 },
  4: { c: 0, r: 1, time: '09:07:07', g: 1 },
  5: { c: 1, r: 1, time: '09:07:07', g: 1 },
  8: { c: 0.5, r: 2, time: '09:07:08', g: 2 },
  6: { c: 2, r: 2, time: '09:07:08', g: 2 },
  7: { c: 1.25, r: 3, time: '09:07:09', g: 3 },
}
/** ContinueWhenAll-listerne fra s. 7: forudsætning → afhængig. */
const DEPS: [number, number][] = [
  [1, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [3, 6],
  [4, 6],
  [5, 7],
  [6, 7],
  [5, 8],
]
const GROUP_DELAY = (g: number) => 0.3 + g * 0.6

function Build({ L, step, id }: { L: BuildLayout; step: number; id: string }) {
  const on = step >= 4
  const [bw, bh] = L.box
  return (
    <svg className={`fut-build ${id}`} viewBox={`0 0 ${L.w} ${L.h}`} style={{ fontSize: L.font }} aria-hidden="true">
      <defs>
        <marker id={`${id}-arr`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9 Z" className="fut-arrhead" />
        </marker>
        <marker id={`${id}-arr-on`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M1 1 L9 5 L1 9 Z" className="fut-arrhead is-hot" />
        </marker>
      </defs>
      {DEPS.map(([a, b]) => {
        const A = BUILDS[a]
        const B = BUILDS[b]
        const x1 = L.x(A.c)
        const y1 = L.y(A.r) + bh / 2
        const x2 = L.x(B.c)
        const y2 = L.y(B.r) - bh / 2 - 3
        return (
          <g key={`${a}-${b}`}>
            <line className="fut-edge" x1={x1} y1={y1} x2={x2} y2={y2} markerEnd={`url(#${id}-arr)`} />
            <motion.line
              className="fut-edge is-lit"
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              markerEnd={`url(#${id}-arr-on)`}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: step === 4 ? GROUP_DELAY(A.g) + 0.3 : 0 } : t.fade}
            />
          </g>
        )
      })}
      {Object.entries(BUILDS).map(([n, B]) => (
        <g key={n} transform={`translate(${L.x(B.c) - bw / 2} ${L.y(B.r) - bh / 2})`}>
          <rect className="fut-bnode" width={bw} height={bh} rx={6} />
          <motion.rect
            className="fut-bnode is-lit"
            width={bw}
            height={bh}
            rx={6}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: step === 4 ? GROUP_DELAY(B.g) : 0 } : t.fade}
          />
          <text className="fut-bname" x={bw / 2} y={bh / 2 - 7}>
            build{n}
          </text>
          <motion.text
            className="fut-btime"
            x={bw / 2}
            y={bh / 2 + 9}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: step === 4 ? GROUP_DELAY(B.g) : 0 } : t.fade}
          >
            {L.short ? B.time.slice(5) : B.time}
          </motion.text>
        </g>
      ))}
    </svg>
  )
}

/* --------------------------------- Figuren -------------------------------- */

function Futures({ step }: { step: number }) {
  const final = step >= 5
  const left = step <= 1 ? 0 : step <= 3 ? 1 : 2
  return (
    <div className="fut">
      <div className="fut-left">
        <Swap
          show={left}
          items={[
            <Code key="seq" lines={SEQ_CODE} title="Sekventielt (s. 11)" hot={false} />,
            <Code key="fut" lines={FUT_CODE} title="Parallelized using futures (s. 12)" hot={step === 2 || step === 3} />,
            <div key="build" className="fut-buildwrap">
              <div className="fut-code-title">
                Continuations: <code>ContinueWhenAll</code> (s. 7, første kørsel s. 8)
              </div>
              <Build L={BUILD_WIDE} step={step} id="fut-bw" />
              <Build L={BUILD_NARROW} step={step} id="fut-bn" />
            </div>,
          ]}
        />
      </div>

      <div className="fut-right">
        <Dag L={DAG_WIDE} step={step} id="fut-dw" />
        <Dag L={DAG_NARROW} step={step} id="fut-dn" />
      </div>

      <div className="fut-casewrap">
        <Cases step={step} />
      </div>

      <motion.p className="fut-bottom" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
        Future = task med returværdi (<code>Task&lt;TResult&gt;</code>) · parallel tasks ~ async actions, futures ~ async functions.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'futures',
  title: 'Futures følger datastrømmen, ikke linjerækkefølgen',
  steps: [
    { caption: 'Skrevet sekventielt kører F1–F4 efter hinanden på main-tråden.', hold: 2200 },
    {
      caption: 'Datastrømmen viser, at F1 og F2 kun behøver `a` — grafen bestemmer den potentielle parallelisme.',
      hold: 2800,
    },
    { caption: '`Task.Run(() => F1(a))` kører F1-grenen som en future, mens main kører F2 og F3.', hold: 2800 },
    { caption: 'Hvad `.Result` gør, afhænger af, hvor langt tasken er.', hold: 3200 },
    {
      caption: '`ContinueWhenAll` starter en task, når alle dens forudsætninger er færdige — TPL holder styr på afhængighederne.',
      hold: 3600,
    },
    { caption: 'Afhængighederne står i grafen; futures og continuations lader TPL følge den.', hold: 3000 },
  ],
  Component: Futures,
}

export default viz
