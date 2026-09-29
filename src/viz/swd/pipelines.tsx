import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './pipelines.css'

/* Kilder: Concurrency - Pipelines.pdf
   s. 3 (thumbnail-eksemplet: Load > Scale > Filter > Display),
   s. 4 (uneven stage duration: “Problem: Filter stage becomes bottleneck” og
   “Solution: Several Filter stages to feed Display”; tidslinjerne er aflæst af
   billedet, Task 1–4 og Task 1–5, slut ved 11 og 8 tidsskridt),
   s. 6 (BlockingCollection<T>, GetConsumingEnumerable(), Add(result),
   CompleteAdding() i finally), s. 7–10 (duplikerede tasks deler input-kø, har hver
   sin output-kø; consumeren læser med TryTakeFromAny), s. 11 (kølængder fra Main).
   Kønavnene Q1, Q2, Q3, Q3.1, Q3.2 er illustrative (analogt med s. 7’s Q 2.1).
   Øjebliksbillederne i pipelinen er aflæst af tidslinjen på s. 4. */

type Stage = 'load' | 'scale' | 'f1' | 'f2' | 'display'
type Queue = 'q1' | 'q2' | 'q3' | 'q31' | 'q32'
type El = Stage | Queue | 'in' | 'out'
interface R {
  x: number
  y: number
  w: number
  h: number
}

/* ------------------------------ Tidslinjen ------------------------------ */

/** Blokke pr. stage og billede: [række, start, slut]. Række 2 = Filter/Filter-1, 3 = Filter-2. */
type Block = [row: number, s: number, e: number]
const PROBLEM: Record<'load' | 'scale' | 'filter' | 'display', Block[]> = {
  load: [[0, 0, 1], [0, 1, 2], [0, 2, 3], [0, 3, 4]],
  scale: [[1, 1, 2], [1, 2, 3], [1, 3, 4], [1, 4, 5]],
  filter: [[2, 2, 4], [2, 4, 6], [2, 6, 8], [2, 8, 10]],
  display: [[4, 4, 5], [4, 6, 7], [4, 8, 9], [4, 10, 11]],
}
const SOLUTION: typeof PROBLEM = {
  load: PROBLEM.load,
  scale: PROBLEM.scale,
  filter: [[2, 2, 4], [3, 3, 5], [2, 4, 6], [3, 5, 7]],
  display: [[4, 4, 5], [4, 5, 6], [4, 6, 7], [4, 7, 8]],
}

/** Øjebliksbilledet i pipelinen svarer til dette tidspunkt på tidslinjen. */
const NOW: (number | null)[] = [null, 3.5, 5.5, 4.5, 6.5, null]

interface GLayout {
  vb: [number, number]
  x0: number
  x1: number
  top: number
  rowH: number
  gap: number
  labelX: number
  taskX: number | null
  axisTitle: { x: number; y: number; anchor: 'start' | 'end' }
  font: number
}
const G_WIDE: GLayout = {
  vb: [860, 176],
  x0: 86,
  x1: 790,
  top: 24,
  rowH: 20,
  gap: 6,
  labelX: 76,
  taskX: 804,
  axisTitle: { x: 76, y: 170, anchor: 'end' },
  font: 11.5,
}
const G_NARROW: GLayout = {
  vb: [320, 172],
  x0: 60,
  x1: 314,
  top: 22,
  rowH: 18,
  gap: 5,
  labelX: 54,
  taskX: null,
  axisTitle: { x: 314, y: 168, anchor: 'end' },
  font: 12,
}

const ROWS = [
  { a: 'Load', b: 'Load', ta: 'Task 1', tb: 'Task 1' },
  { a: 'Scale', b: 'Scale', ta: 'Task 2', tb: 'Task 2' },
  { a: 'Filter', b: 'Filter-1', ta: 'Task 3', tb: 'Task 3' },
  { a: '', b: 'Filter-2', ta: '', tb: 'Task 4' },
  { a: 'Display', b: 'Display', ta: 'Task 4', tb: 'Task 5' },
]

function Gantt({ L, step, className }: { L: GLayout; step: number; className: string }) {
  const sol = step >= 3
  const data = sol ? SOLUTION : PROBLEM
  const unit = (L.x1 - L.x0) / 11
  const X = (v: number) => L.x0 + v * unit
  const rowY = (r: number) => L.top + r * (L.rowH + L.gap)
  const axisY = rowY(5) - L.gap + 6
  const drawn = {
    load: step >= 1,
    scale: step >= 1,
    filter: step >= 1,
    display: step === 2 || step >= 4,
  }
  const now = NOW[step]

  return (
    <svg
      className={`swd-pl-svg swd-pl-gantt ${className}`}
      viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`}
      style={{ fontSize: L.font }}
      aria-hidden="true"
    >
      {ROWS.map((r, i) => {
        const y = rowY(i)
        const hidden = i === 3 && !sol
        return (
          <motion.g key={i} initial={false} animate={{ opacity: hidden ? 0 : 1 }} transition={t.fade}>
            <rect className="swd-pl-track" x={L.x0} y={y} width={L.x1 - L.x0} height={L.rowH} rx={2} />
            <text className="swd-pl-rowlabel" x={L.labelX} y={y + L.rowH / 2} textAnchor="end">
              <motion.tspan initial={false} animate={{ opacity: sol ? 0 : 1 }} transition={t.fade}>
                {r.a}
              </motion.tspan>
            </text>
            <motion.text
              className="swd-pl-rowlabel"
              x={L.labelX}
              y={y + L.rowH / 2}
              textAnchor="end"
              initial={false}
              animate={{ opacity: sol ? 1 : 0 }}
              transition={t.fade}
            >
              {r.b}
            </motion.text>
            {L.taskX !== null && (
              <>
                <motion.text
                  className="swd-pl-task"
                  x={L.taskX}
                  y={y + L.rowH / 2}
                  initial={false}
                  animate={{ opacity: sol ? 0 : 1 }}
                  transition={t.fade}
                >
                  {r.ta}
                </motion.text>
                <motion.text
                  className="swd-pl-task"
                  x={L.taskX}
                  y={y + L.rowH / 2}
                  initial={false}
                  animate={{ opacity: sol ? 1 : 0 }}
                  transition={t.fade}
                >
                  {r.tb}
                </motion.text>
              </>
            )}
          </motion.g>
        )
      })}

      {/* Øjeblikket, pipelinen ovenfor viser (bag blokkene) */}
      <motion.g
        className="swd-pl-now"
        initial={false}
        animate={{ x: X(now ?? 0), opacity: now === null ? 0 : 1 }}
        transition={{ x: t.travel, opacity: t.fade }}
      >
        <line x1={0} x2={0} y1={L.top - 3} y2={axisY} />
        <text x={0} y={L.top - 12}>
          nu
        </text>
      </motion.g>
      {(['load', 'scale', 'filter', 'display'] as const).map((stage) =>
        data[stage].map(([row, s, e], img) => {
          const on = drawn[stage]
          // Trin 3: Display-rækken står tilbage som spøgelse på de gamle pladser,
          // til consumeren er ændret (trin 4).
          const ghostDisplay = stage === 'display' && step === 3
          const [gr, gs, ge] = ghostDisplay ? PROBLEM.display[img] : [row, s, e]
          const y = rowY(gr)
          return (
            <motion.g
              key={`${stage}-${img}`}
              initial={false}
              animate={{ x: X(gs), y, opacity: on ? 1 : ghostDisplay ? 0.28 : 0 }}
              transition={{
                x: { ...t.travel, delay: sol && step === 3 ? 0.15 + img * 0.08 : 0.1 + img * 0.06 },
                y: { ...t.travel, delay: 0.15 + img * 0.08 },
                opacity: on ? { ...t.fade, delay: step <= 2 ? s * 0.07 : 0 } : t.fade,
              }}
            >
              <motion.rect
                className={`swd-pl-block swd-pl-c${img + 1}`}
                y={1}
                height={L.rowH - 2}
                rx={2}
                initial={false}
                animate={{ width: (ge - gs) * unit - 2 }}
                transition={t.travel}
                x={1}
              />
              <motion.text
                className="swd-pl-blocknum"
                y={L.rowH / 2}
                initial={false}
                animate={{ x: ((ge - gs) * unit) / 2 }}
                transition={t.travel}
              >
                {img + 1}
              </motion.text>
            </motion.g>
          )
        }),
      )}

      {/* Akse */}
      <line className="swd-pl-axis" x1={L.x0} x2={L.x1} y1={axisY} y2={axisY} />
      {Array.from({ length: 12 }, (_, i) => (
        <g key={i}>
          <line className="swd-pl-axis" x1={X(i)} x2={X(i)} y1={axisY} y2={axisY + 4} />
          <text className="swd-pl-tick" x={X(i)} y={axisY + 14}>
            {i}
          </text>
        </g>
      ))}
      <text className="swd-pl-axistitle" x={L.axisTitle.x} y={L.axisTitle.y} textAnchor={L.axisTitle.anchor}>
        tidsskridt
      </text>

      {/* Slutpunkter: 11 (flaskehals) og 8 (duplikeret Filter) */}
      <motion.g
        className="swd-pl-end"
        data-tone={step >= 4 ? 'ghost' : 'focus'}
        initial={false}
        animate={{ opacity: step >= 2 ? 1 : 0 }}
        transition={t.fade}
      >
        <line x1={X(11)} x2={X(11)} y1={L.top - 3} y2={axisY} />
        <text x={X(11)} y={L.top - 12}>
          11
        </text>
      </motion.g>
      <motion.g
        className="swd-pl-end"
        data-tone="focus"
        initial={false}
        animate={{ opacity: step >= 4 ? 1 : 0 }}
        transition={step >= 4 ? { ...t.fade, delay: 0.9 } : t.fade}
      >
        <line x1={X(8)} x2={X(8)} y1={L.top - 3} y2={axisY} />
        <text x={X(8)} y={L.top - 12}>
          8
        </text>
      </motion.g>

    </svg>
  )
}

/* ------------------------------ Pipelinen ------------------------------ */

interface PLayout {
  vb: [number, number]
  dir: 'h' | 'v'
  chip: number
  font: number
  /** Geometri før (problem) og efter duplikering (solution). */
  problem: Partial<Record<El, R>>
  solution: Partial<Record<El, R>>
  /** Kort label ved et element (kølængde, venter …). */
  note: (r: R) => { x: number; y: number; anchor: 'start' | 'middle' | 'end' }
  qLabel: (r: R) => { x: number; y: number; anchor: 'start' | 'middle' | 'end' }
  ioLabel: (r: R) => { x: number; y: number; anchor: 'start' | 'middle' | 'end' }
  /** Smal variant: TryTakeFromAny står inde i Display-boksen. */
  tryInBox: boolean
}

/* Bred: vandret flow. Enkelt spor y 52–100; delte spor 20–68 og 84–132. */
const WIDE_COMMON: Partial<Record<El, R>> = {
  in: { x: 0, y: 54, w: 44, h: 44 },
  load: { x: 66, y: 52, w: 90, h: 48 },
  q1: { x: 172, y: 62, w: 76, h: 28 },
  scale: { x: 264, y: 52, w: 90, h: 48 },
  q2: { x: 370, y: 62, w: 76, h: 28 },
  display: { x: 690, y: 52, w: 100, h: 48 },
  out: { x: 812, y: 54, w: 44, h: 44 },
}
const P_WIDE: PLayout = {
  vb: [860, 140],
  dir: 'h',
  chip: 20,
  font: 11.5,
  problem: {
    ...WIDE_COMMON,
    f1: { x: 480, y: 52, w: 100, h: 48 },
    f2: { x: 480, y: 84, w: 100, h: 48 },
    q3: { x: 596, y: 62, w: 64, h: 28 },
    q31: { x: 596, y: 30, w: 64, h: 28 },
    q32: { x: 596, y: 94, w: 64, h: 28 },
  },
  solution: {
    ...WIDE_COMMON,
    f1: { x: 480, y: 20, w: 100, h: 48 },
    f2: { x: 480, y: 84, w: 100, h: 48 },
    q3: { x: 596, y: 62, w: 64, h: 28 },
    q31: { x: 596, y: 30, w: 64, h: 28 },
    q32: { x: 596, y: 94, w: 64, h: 28 },
  },
  note: (r) => ({ x: r.x + r.w / 2, y: r.y + r.h + 16, anchor: 'middle' }),
  qLabel: (r) => ({ x: r.x + r.w / 2, y: r.y - 6, anchor: 'middle' }),
  ioLabel: (r) => ({ x: r.x + r.w / 2, y: r.y - 8, anchor: 'middle' }),
  tryInBox: false,
}

/* Smal: lodret flow, Filter-1/2 og Q3.1/3.2 side om side. */
const NARROW_COMMON: Partial<Record<El, R>> = {
  in: { x: 118, y: 4, w: 84, h: 18 },
  load: { x: 85, y: 40, w: 150, h: 40 },
  q1: { x: 122, y: 94, w: 76, h: 24 },
  scale: { x: 85, y: 132, w: 150, h: 40 },
  q2: { x: 122, y: 186, w: 76, h: 24 },
  display: { x: 85, y: 332, w: 150, h: 40 },
  out: { x: 118, y: 388, w: 84, h: 18 },
}
const P_NARROW: PLayout = {
  vb: [320, 410],
  dir: 'v',
  chip: 18,
  font: 12,
  problem: {
    ...NARROW_COMMON,
    f1: { x: 85, y: 232, w: 150, h: 40 },
    f2: { x: 168, y: 232, w: 140, h: 40 },
    q3: { x: 122, y: 286, w: 76, h: 24 },
    q31: { x: 44, y: 286, w: 76, h: 24 },
    q32: { x: 200, y: 286, w: 76, h: 24 },
  },
  solution: {
    ...NARROW_COMMON,
    f1: { x: 12, y: 232, w: 140, h: 40 },
    f2: { x: 168, y: 232, w: 140, h: 40 },
    q3: { x: 122, y: 286, w: 76, h: 24 },
    q31: { x: 44, y: 286, w: 76, h: 24 },
    q32: { x: 200, y: 286, w: 76, h: 24 },
  },
  note: (r) => ({ x: r.x + r.w + 8, y: r.y + r.h / 2, anchor: 'start' }),
  qLabel: (r) => ({ x: r.x - 6, y: r.y + r.h / 2, anchor: 'end' }),
  ioLabel: (r) => ({ x: r.x - 8, y: r.y + r.h / 2, anchor: 'end' }),
  tryInBox: true,
}

const STAGE_NAME: Record<Stage, [string, string]> = {
  load: ['Load', 'Task 1'],
  scale: ['Scale', 'Task 2'],
  f1: ['Filter', 'Task 3'],
  f2: ['Filter-2', 'Task 4'],
  display: ['Display', 'Task 4'],
}
const Q_NAME: Record<Queue, string> = { q1: 'Q1', q2: 'Q2', q3: 'Q3', q31: 'Q3.1', q32: 'Q3.2' }

/** Hvor billede 1–4 er i hvert trin. Trin 1–2: problem-tidslinjen ved t = 3,5 og 5,5;
    trin 3–4: løsningen ved t = 4,5 og 6,5. */
type Where = ['in' | 'out' | 'q2', number] | ['st', Stage]
const SNAP: Where[][] = [
  [['in', 0], ['in', 1], ['in', 2], ['in', 3]],
  [['st', 'f1'], ['q2', 0], ['st', 'scale'], ['st', 'load']],
  [['out', 0], ['st', 'f1'], ['q2', 0], ['q2', 1]],
  [['st', 'display'], ['st', 'f2'], ['st', 'f1'], ['st', 'scale']],
  [['out', 0], ['out', 1], ['st', 'display'], ['st', 'f2']],
  [['out', 0], ['out', 1], ['out', 2], ['out', 3]],
]

function chipPos(L: PLayout, geo: Partial<Record<El, R>>, w: Where): [number, number] {
  const c = L.chip
  if (w[0] === 'st') {
    const r = geo[w[1]]!
    return [r.x + r.w - c - 9, r.y + (r.h - c) / 2]
  }
  if (w[0] === 'q2') {
    const r = geo.q2!
    return [r.x + r.w - 5 - c - w[1] * (c + 4), r.y + (r.h - c) / 2]
  }
  const r = geo[w[0]]!
  const i = w[1]
  if (L.dir === 'h') return [r.x + (i % 2) * (c + 4), r.y + Math.floor(i / 2) * (c + 4)]
  return [r.x + i * (c + 4), r.y]
}

function arrow(a: R, b: R, dir: 'h' | 'v') {
  if (dir === 'h') {
    const x1 = a.x + a.w
    const y1 = a.y + a.h / 2
    const x2 = b.x
    const y2 = b.y + b.h / 2
    const m = (x1 + x2) / 2
    const d = Math.abs(y1 - y2) < 0.5 ? `M${x1} ${y1} H${x2 - 5}` : `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2 - 5} ${y2}`
    return { d, head: `M${x2 - 7} ${y2 - 4} L${x2} ${y2} L${x2 - 7} ${y2 + 4}Z` }
  }
  const x1 = a.x + a.w / 2
  const y1 = a.y + a.h
  const x2 = b.x + b.w / 2
  const y2 = b.y
  const m = (y1 + y2) / 2
  const d = Math.abs(x1 - x2) < 0.5 ? `M${x1} ${y1} V${y2 - 5}` : `M${x1} ${y1} C${x1} ${m} ${x2} ${m} ${x2} ${y2 - 5}`
  return { d, head: `M${x2 - 4} ${y2 - 7} L${x2} ${y2} L${x2 + 4} ${y2 - 7}Z` }
}

function Arrow({ a, b, L, on = true, hot, delay = 0 }: { a: R; b: R; L: PLayout; on?: boolean; hot?: boolean; delay?: number }) {
  const { d, head } = arrow(a, b, L.dir)
  return (
    <motion.g
      className="swd-pl-flow"
      data-hot={hot || undefined}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={on ? { ...t.fade, delay } : t.fade}
    >
      <path className="swd-pl-flowline" d={d} />
      <path className="swd-pl-flowhead" d={head} />
    </motion.g>
  )
}

/** Rækkefølgen, CompleteAdding()-signalet går i (trin 5). */
const DONE_ORDER: Partial<Record<El, number>> = { load: 0, q1: 1, scale: 2, q2: 3, f1: 4, f2: 4, q31: 5, q32: 5, display: 6 }
const doneDelay = (el: El) => 0.35 + (DONE_ORDER[el] ?? 0) * 0.28

function Pipeline({ L, step, className }: { L: PLayout; step: number; className: string }) {
  const sol = step >= 3
  const geo = sol ? L.solution : L.problem
  const P = L.problem
  const S = L.solution
  const done = step >= 5

  const stageTone = (s: Stage) => {
    if (step === 1 || step === 2) return s === 'f1' ? 'focus' : 'idle'
    if (step === 3) return s === 'f1' || s === 'f2' ? 'focus' : 'idle'
    if (step === 4) return s === 'display' ? 'focus' : 'idle'
    return 'idle'
  }

  const box = (s: Stage) => {
    const show = s !== 'f2' || sol
    const r = geo[s]!
    const [name, task] = STAGE_NAME[s]
    const nameSol = s === 'f1' ? 'Filter-1' : name
    const taskSol = s === 'display' ? 'Task 5' : task
    const tryIn = s === 'display' && L.tryInBox
    const lineY = tryIn ? [r.h / 2 - 7, r.h / 2 + 9] : [r.h / 2 - 5, r.h / 2 + 11]
    return (
      <motion.g
        key={s}
        className="swd-pl-stage"
        data-tone={stageTone(s)}
        initial={false}
        animate={{ x: r.x, y: r.y, opacity: show ? 1 : 0 }}
        transition={{ x: t.travel, y: t.travel, opacity: show ? { ...t.fade, delay: 0.3 } : t.fade }}
      >
        <motion.rect
          className="swd-pl-box"
          height={r.h}
          rx={5}
          initial={false}
          animate={{ width: r.w }}
          transition={t.travel}
        />
        <text className="swd-pl-name" x={10} y={lineY[0]}>
          <motion.tspan initial={false} animate={{ opacity: sol ? 0 : 1 }} transition={t.fade}>
            {name}
          </motion.tspan>
        </text>
        <motion.text
          className="swd-pl-name"
          x={10}
          y={lineY[0]}
          initial={false}
          animate={{ opacity: sol ? 1 : 0 }}
          transition={t.fade}
        >
          {nameSol}
          {tryIn && <tspan className="swd-pl-sub"> · {taskSol}</tspan>}
        </motion.text>
        {tryIn ? (
          <>
            <motion.text
              className="swd-pl-sub"
              x={10}
              y={lineY[1]}
              initial={false}
              animate={{ opacity: sol ? 0 : 1 }}
              transition={t.fade}
            >
              {task}
            </motion.text>
            <motion.text
              className="swd-pl-try"
              x={10}
              y={lineY[1]}
              initial={false}
              animate={{ opacity: step >= 4 ? 1 : 0 }}
              transition={t.fade}
            >
              TryTakeFromAny
            </motion.text>
          </>
        ) : (
          <>
            <motion.text
              className="swd-pl-sub"
              x={10}
              y={lineY[1]}
              initial={false}
              animate={{ opacity: sol ? 0 : 1 }}
              transition={t.fade}
            >
              {task}
            </motion.text>
            <motion.text
              className="swd-pl-sub"
              x={10}
              y={lineY[1]}
              initial={false}
              animate={{ opacity: sol ? 1 : 0 }}
              transition={t.fade}
            >
              {taskSol}
            </motion.text>
          </>
        )}
        {/* CompleteAdding() kaldt */}
        <motion.g
          initial={false}
          animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.5 }}
          transition={done ? { ...t.place, delay: doneDelay(s) } : t.fade}
        >
          <motion.circle className="swd-pl-check" r={8} initial={false} animate={{ cx: r.w - 2 }} transition={t.travel} cy={2} />
          <motion.text className="swd-pl-checkmark" initial={false} animate={{ x: r.w - 2 }} transition={t.travel} y={2}>
            ✓
          </motion.text>
        </motion.g>
      </motion.g>
    )
  }

  const queue = (q: Queue) => {
    const inSol = q === 'q31' || q === 'q32'
    const show = q === 'q3' ? !sol : inSol ? sol : true
    const r = geo[q]!
    const lab = L.qLabel(r)
    const hot = (step === 2 && q === 'q2') || (step === 3 && inSol)
    const c = L.chip
    const slots = Math.floor((r.w - 6) / (c + 4))
    return (
      <motion.g
        key={q}
        className="swd-pl-queue"
        data-hot={hot || undefined}
        initial={false}
        animate={{ opacity: show ? 1 : 0 }}
        transition={show ? { ...t.fade, delay: 0.3 } : t.fade}
      >
        <rect className="swd-pl-tube" x={r.x} y={r.y} width={r.w} height={r.h} rx={r.h / 2} />
        {Array.from({ length: slots - 1 }, (_, i) => {
          const x = r.x + r.w - 5 - (i + 1) * (c + 4) + 2
          return <line key={i} className="swd-pl-slot" x1={x} x2={x} y1={r.y + 5} y2={r.y + r.h - 5} />
        })}
        <text className="swd-pl-qname" x={lab.x} y={lab.y} textAnchor={lab.anchor}>
          {Q_NAME[q]}
        </text>
        <motion.text
          className="swd-pl-completed"
          x={r.x + r.w / 2}
          y={r.y + r.h / 2}
          initial={false}
          animate={{ opacity: done && show ? 1 : 0 }}
          transition={done ? { ...t.fade, delay: doneDelay(q) } : t.fade}
        >
          completed
        </motion.text>
      </motion.g>
    )
  }

  const note = (r: R, text: string, on: boolean, cls = 'swd-pl-note') => {
    const p = L.note(r)
    return (
      <motion.text
        className={cls}
        x={p.x}
        y={p.y}
        textAnchor={p.anchor}
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={on ? { ...t.fade, delay: 0.5 } : t.fade}
      >
        {text}
      </motion.text>
    )
  }

  const inL = L.ioLabel(geo.in!)
  const outL = L.ioLabel(geo.out!)

  return (
    <svg
      className={`swd-pl-svg swd-pl-pipe ${className}`}
      viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`}
      style={{ fontSize: L.font }}
      aria-hidden="true"
    >
      {/* Dataflow. Fælles pile står altid; pilene omkring Filter skifter ved duplikering. */}
      <Arrow a={geo.in!} b={geo.load!} L={L} />
      <Arrow a={geo.load!} b={geo.q1!} L={L} />
      <Arrow a={geo.q1!} b={geo.scale!} L={L} />
      <Arrow a={geo.scale!} b={geo.q2!} L={L} />
      <Arrow a={P.q2!} b={P.f1!} L={L} on={!sol} />
      <Arrow a={P.f1!} b={P.q3!} L={L} on={!sol} />
      <Arrow a={P.q3!} b={P.display!} L={L} on={!sol} />
      <Arrow a={S.q2!} b={S.f1!} L={L} on={sol} delay={0.45} hot={step === 3} />
      <Arrow a={S.q2!} b={S.f2!} L={L} on={sol} delay={0.45} hot={step === 3} />
      <Arrow a={S.f1!} b={S.q31!} L={L} on={sol} delay={0.55} hot={step === 3} />
      <Arrow a={S.f2!} b={S.q32!} L={L} on={sol} delay={0.55} hot={step === 3} />
      <Arrow a={S.q31!} b={S.display!} L={L} on={sol} delay={0.6} />
      <Arrow a={S.q32!} b={S.display!} L={L} on={step >= 4} delay={0.2} hot={step === 4} />
      <Arrow a={geo.display!} b={geo.out!} L={L} />

      {(['q1', 'q2', 'q3', 'q31', 'q32'] as Queue[]).map(queue)}
      {(['load', 'scale', 'f1', 'f2', 'display'] as Stage[]).map(box)}

      <text className="swd-pl-io" x={inL.x} y={inL.y} textAnchor={inL.anchor}>
        billeder
      </text>
      <text className="swd-pl-io" x={outL.x} y={outL.y} textAnchor={outL.anchor}>
        vist
      </text>

      {note(P.f1!, '2 tidsskridt', step === 1 || step === 2)}
      {note(P.q2!, 'kølængde 2', step === 2, 'swd-pl-note is-hot')}
      {note(P.display!, 'venter', step === 2)}
      {!L.tryInBox && note(S.display!, 'TryTakeFromAny', step >= 4, 'swd-pl-note swd-pl-try')}

      {/* Billederne */}
      {SNAP[step].map((w, img) => {
        const [x, y] = chipPos(L, geo, w)
        const c = L.chip
        return (
          <motion.g key={img} initial={false} animate={{ x, y }} transition={{ ...t.travel, delay: img * 0.05 }}>
            <rect className={`swd-pl-chip swd-pl-c${img + 1}`} width={c} height={c} rx={4} />
            <text className="swd-pl-chipnum" x={c / 2} y={c / 2}>
              {img + 1}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

function Pipelines({ step }: { step: number }) {
  return (
    <div className="swd-pl">
      <Pipeline L={P_WIDE} step={step} className="swd-pl-wide" />
      <Pipeline L={P_NARROW} step={step} className="swd-pl-narrow" />
      <p className="swd-pl-legend">
        <motion.span initial={false} animate={{ opacity: step >= 5 ? 1 : 0 }} transition={t.fade}>
          <span className="swd-pl-legend-check">✓</span> <code>CompleteAdding()</code> kaldt
        </motion.span>
        <span className="swd-pl-legend-note">køer: <code>BlockingCollection&lt;T&gt;</code> · kønavne: illustrative</span>
      </p>
      <div className="swd-pl-gantt-wrap">
        <Gantt L={G_WIDE} step={step} className="swd-pl-wide" />
        <Gantt L={G_NARROW} step={step} className="swd-pl-narrow" />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'pipelines',
  title: 'Pipeline med flaskehals',
  steps: [
    {
      caption: 'Fire stages forbundet af `BlockingCollection`-køer. Hver stage kører i sin egen task.',
      hold: 2200,
    },
    {
      caption: 'Load og Scale tager ét tidsskridt pr. billede. **Filter** tager to. Linjen *nu* viser, hvor på tidslinjen pipelinen står.',
      hold: 2600,
    },
    {
      caption: 'Køen foran Filter vokser, mens Display venter. Kølængden viser flaskehalsen.',
      hold: 2600,
    },
    {
      caption: 'Filter duplikeres. Filter-1 og Filter-2 deler input-køen, men har hver sin output-kø.',
      hold: 2800,
    },
    {
      caption:
        'Det er consumeren, der ændres: Display læser fra begge køer med `TryTakeFromAny`. Sidste billede vises efter 8 tidsskridt i stedet for 11.',
      hold: 3000,
    },
    {
      caption:
        'Hver stage kalder `CompleteAdding()` i `finally`. Signalet går stage for stage, og næste stages `GetConsumingEnumerable()` slutter.',
      hold: 2800,
    },
  ],
  Component: Pipelines,
}

export default viz
