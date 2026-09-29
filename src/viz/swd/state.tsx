import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './state.css'

/* HFDP kap. 10 (SWD_Head-First-Design-Patterns-2nd-Edition.pdf): tilstandsdiagrammet
   PDF s. 420 (bogens s. 382), GumballMachine med state.insertQuarter() og konstruktøren
   (NoQuarterState, hvis der er kugler, ellers SoldOutState) PDF s. 437 (s. 399),
   insertQuarter() i NoQuarterState s. 435, HasQuarterState s. 438, SoldState s. 439 og
   SoldOutState s. 459 (bogens 397, 400, 401, 421). Svarene er ordrette. Diagrammet er
   gentegnet i UML: afrundede tilstande, initial pseudo-state, `event [guard]`. HFDP
   skriver kun “gumballs = 0” og “gumballs > 0” ved dispense; her som guards. UML
   tillader ikke guards på initial-transitionen, så startvalget står i noten.
   Markdown: swd/markdown/bog/SW4SWD-01_HFDP_Ch10_State.md. */

type P2 = [number, number]
type Dir = 'up' | 'down' | 'left' | 'right'

function arrow([x, y]: P2, dir: Dir, a = 8, b = 4.5) {
  switch (dir) {
    case 'right':
      return `M${x - a} ${y - b} L${x} ${y} L${x - a} ${y + b}`
    case 'left':
      return `M${x + a} ${y - b} L${x} ${y} L${x + a} ${y + b}`
    case 'down':
      return `M${x - b} ${y - a} L${x} ${y} L${x + b} ${y - a}`
    default:
      return `M${x - b} ${y + a} L${x} ${y} L${x + b} ${y + a}`
  }
}

/* ------------------------------- Modellen -------------------------------- */

interface Row {
  cls: string
  reply: string
  /** Svaret brudt til smal skærm. */
  lines: string[]
  next?: string
  /** Trinnet, hvor kaldet lander i denne tilstand. */
  at: number
}
const ROWS: Row[] = [
  { cls: 'NoQuarterState', reply: '“You inserted a quarter”', lines: ['“You inserted a quarter”'], next: '→ HasQuarterState', at: 1 },
  { cls: 'HasQuarterState', reply: '“You can’t insert another quarter”', lines: ['“You can’t insert another quarter”'], at: 2 },
  { cls: 'SoldState', reply: '“Please wait, we’re already giving you a gumball”', lines: ['“Please wait, we’re already', 'giving you a gumball”'], at: 3 },
  {
    cls: 'SoldOutState',
    reply: '“You can’t insert a quarter, the machine is sold out”',
    lines: ['“You can’t insert a quarter,', 'the machine is sold out”'],
    at: 4,
  },
]
/** Hvilken række `state` peger på, når trinnet er faldet på plads. */
const PTR = [0, 1, 1, 2, 3, 3]
/** Hvornår pegeren flytter sig inden for trinnet (s). */
const PTR_DELAY = [0, 1.5, 0, 0.1, 0.1, 0]
/** Hvornår kaldet sendes inden for trinnet (s). */
const CALL_DELAY = [0, 0.1, 0.1, 1.1, 1.1, 0]

type S = 'nq' | 'hq' | 'sold' | 'out'
const ACTIVE: S[] = ['nq', 'hq', 'hq', 'sold', 'out', 'out']
type Tr = 'insert' | 'eject' | 'turn' | 'disp1' | 'disp0'
const HOT: (Tr | null)[] = [null, 'insert', null, 'turn', 'disp0', null]
const HOT_DELAY = [0, 1.5, 0, 0.1, 0.1, 0]
const SNAME: Record<S, string> = { nq: 'No Quarter', hq: 'Has Quarter', sold: 'Gumball Sold', out: 'Out of Gumballs' }

/* -------------------------------- Layout -------------------------------- */

interface TopL {
  vb: [number, number]
  narrow: boolean
  ctx: { x: number; y: number; w: number }
  note: { x: number; y: number; w: number; anchor: [P2, P2] }
  rows: { x: number; w: number; y: (i: number) => number; h: number }
  ptr: (cy: number) => string
  ptrEnd: (cy: number) => P2
  ptrLabel: P2
  callFrom: P2
  callTo: (i: number) => P2
}
const TOP_WIDE: TopL = {
  vb: [840, 232],
  narrow: false,
  ctx: { x: 10, y: 40, w: 220 },
  note: { x: 10, y: 150, w: 220, anchor: [[60, 150], [60, 133]] },
  rows: { x: 300, w: 530, y: (i) => 8 + i * 56, h: 48 },
  ptr: (cy) => `M230 79 H280 V${cy} H300`,
  ptrEnd: (cy) => [300, cy],
  ptrLabel: [235, 70],
  callFrom: [120, 104],
  callTo: (i) => [560, 8 + i * 56 + 34],
}
const TOP_NARROW: TopL = {
  vb: [300, 426],
  narrow: true,
  ctx: { x: 6, y: 4, w: 288 },
  note: { x: 60, y: 107, w: 234, anchor: [[177, 107], [177, 97]] },
  rows: { x: 28, w: 266, y: (i) => 145 + i * 72, h: 64 },
  ptr: (cy) => `M14 97 V${cy} H28`,
  ptrEnd: (cy) => [28, cy],
  ptrLabel: [19, 124],
  callFrom: [150, 68],
  callTo: (i) => [160, 145 + i * 72 + 42],
}

interface StmL {
  vb: [number, number]
  states: Record<S, [number, number, number, number]>
  init: { dot: P2; d: string; end: P2; dir: Dir }
  tr: Record<Tr, { d: string; end: P2; dir: Dir; label: { x: number; y: number; lines: string[]; anchor?: 'start' | 'middle' | 'end' } }>
}
const STM_WIDE: StmL = {
  vb: [840, 206],
  states: { nq: [240, 30, 150, 36], hq: [600, 30, 150, 36], sold: [600, 140, 150, 36], out: [20, 140, 150, 36] },
  init: { dot: [192, 48], d: 'M198 48 H240', end: [240, 48], dir: 'right' },
  tr: {
    insert: { d: 'M390 40 H600', end: [600, 40], dir: 'right', label: { x: 495, y: 30, lines: ['insert quarter'] } },
    eject: { d: 'M600 58 H390', end: [390, 58], dir: 'left', label: { x: 495, y: 70, lines: ['eject quarter'] } },
    turn: { d: 'M675 66 V140', end: [675, 140], dir: 'down', label: { x: 684, y: 103, lines: ['turn crank'], anchor: 'start' } },
    disp1: { d: 'M600 158 H330 V66', end: [330, 66], dir: 'up', label: { x: 465, y: 148, lines: ['dispense gumball [gumballs > 0]'] } },
    disp0: { d: 'M675 176 V196 H95 V176', end: [95, 176], dir: 'up', label: { x: 385, y: 186, lines: ['dispense gumball [gumballs = 0]'] } },
  },
}
const STM_NARROW: StmL = {
  vb: [300, 368],
  states: { nq: [80, 30, 140, 32], hq: [80, 130, 140, 32], sold: [80, 230, 140, 32], out: [80, 330, 140, 32] },
  init: { dot: [150, 8], d: 'M150 14 V30', end: [150, 30], dir: 'down' },
  tr: {
    insert: { d: 'M130 62 V130', end: [130, 130], dir: 'down', label: { x: 123, y: 96, lines: ['insert quarter'], anchor: 'end' } },
    eject: { d: 'M170 130 V62', end: [170, 62], dir: 'up', label: { x: 177, y: 96, lines: ['eject quarter'], anchor: 'start' } },
    turn: { d: 'M150 162 V230', end: [150, 230], dir: 'down', label: { x: 143, y: 196, lines: ['turn crank'], anchor: 'end' } },
    disp1: { d: 'M220 246 H286 V46 H220', end: [220, 46], dir: 'left', label: { x: 280, y: 190, lines: ['dispense gumball', '[gumballs > 0]'], anchor: 'end' } },
    disp0: { d: 'M150 262 V330', end: [150, 330], dir: 'down', label: { x: 157, y: 290, lines: ['dispense gumball', '[gumballs = 0]'], anchor: 'start' } },
  },
}

/* ------------------------------- Delene ---------------------------------- */

const LH = 17

function Top({ L, step, className }: { L: TopL; step: number; className: string }) {
  const { ctx, note, rows } = L
  const ptr = PTR[step]
  const cy = rows.y(ptr) + rows.h / 2
  const ctxH = 26 + 25 + 42
  const callOn = ROWS.find((r) => r.at === step)
  const ci = callOn ? ROWS.indexOf(callOn) : -1
  return (
    <svg className={`sst-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} aria-hidden="true">
      {/* Konteksten */}
      <g className="sst-cls">
        <rect className="sst-box" x={ctx.x} y={ctx.y} width={ctx.w} height={ctxH} />
        <text className="sst-cname" x={ctx.x + ctx.w / 2} y={ctx.y + 13}>
          GumballMachine
        </text>
        <line className="sst-div" x1={ctx.x} x2={ctx.x + ctx.w} y1={ctx.y + 26} y2={ctx.y + 26} />
        <text className="sst-mem" x={ctx.x + 7} y={ctx.y + 26 + 4 + LH / 2}>
          - state: State
        </text>
        <line className="sst-div" x1={ctx.x} x2={ctx.x + ctx.w} y1={ctx.y + 51} y2={ctx.y + 51} />
        <text className="sst-mem sst-mem-call" data-hot={ci >= 0 || undefined} x={ctx.x + 7} y={ctx.y + 51 + 4 + LH / 2}>
          + insertQuarter()
        </text>
        <text className="sst-mem" x={ctx.x + 7} y={ctx.y + 51 + 4 + LH * 1.5}>
          + setState(s: State)
        </text>
      </g>
      <g className="sst-note">
        <path className="sst-note-box" d={`M${note.x} ${note.y} H${note.x + note.w - 9} L${note.x + note.w} ${note.y + 9} V${note.y + 28} H${note.x} Z`} />
        <path className="sst-note-fold" d={`M${note.x + note.w - 9} ${note.y} V${note.y + 9} H${note.x + note.w}`} />
        <text className="sst-code" x={note.x + 9} y={note.y + 14}>
          {'{ '}
          <tspan className="sst-code-call" data-hot={ci >= 0 || undefined}>
            state.insertQuarter()
          </tspan>
          {'; }'}
        </text>
        <line className="sst-anchor" x1={note.anchor[0][0]} y1={note.anchor[0][1]} x2={note.anchor[1][0]} y2={note.anchor[1][1]} />
      </g>

      {/* Tilstandsobjekterne: tilstand, svar på insertQuarter(), ny tilstand */}
      {ROWS.map((r, i) => {
        const y = rows.y(i)
        const shown = step >= r.at
        const on = i === ptr
        const d = step === r.at ? CALL_DELAY[step] + 0.85 : 0
        return (
          <g key={r.cls} className="sst-row" data-on={on || undefined} style={{ transitionDelay: on ? `${PTR_DELAY[step] + 0.5}s` : '0s' }}>
            <rect className="sst-box" x={rows.x} y={y} width={rows.w} height={rows.h} rx={4} />
            <text className="sst-cname sst-rname" x={rows.x + 12} y={y + 15}>
              {r.cls}
            </text>
            <motion.g initial={false} animate={{ opacity: shown ? 1 : 0 }} transition={{ ...t.fade, delay: shown ? d : 0 }}>
              <text className="sst-reply" x={rows.x + 12} y={y + (L.narrow ? 34 : 33)}>
                {(L.narrow ? r.lines : [r.reply]).map((l, k) => (
                  <tspan key={k} x={rows.x + 12} dy={k === 0 ? 0 : 16}>
                    {l}
                  </tspan>
                ))}
              </text>
            </motion.g>
            <motion.text
              className={r.next ? 'sst-next' : 'sst-next sst-none'}
              x={rows.x + rows.w - 10}
              y={y + 15}
              initial={false}
              animate={{ opacity: shown ? 1 : 0 }}
              transition={{ ...t.fade, delay: shown ? d + 0.3 : 0 }}
            >
              {r.next ?? 'ingen skift'}
            </motion.text>
          </g>
        )
      })}

      {/* state-pegeren (association med åben pilespids) */}
      <g className="sst-ptr">
        <motion.path className="sst-ptr-line" initial={false} animate={{ d: L.ptr(cy) }} transition={{ ...t.travel, delay: PTR_DELAY[step] }} />
        <motion.path className="sst-ptr-line" initial={false} animate={{ d: arrow(L.ptrEnd(cy), 'right') }} transition={{ ...t.travel, delay: PTR_DELAY[step] }} />
        <text className="sst-ptr-label" x={L.ptrLabel[0]} y={L.ptrLabel[1]}>
          state
        </text>
      </g>

      {/* Kaldet, der rejser fra konteksten til den aktuelle tilstand */}
      {ci >= 0 && (
        <motion.g
          key={`call-${step}-${className}`}
          className="sst-call"
          initial={{ x: L.callFrom[0] - L.callTo(ci)[0], y: L.callFrom[1] - L.callTo(ci)[1], opacity: 0 }}
          animate={{ x: 0, y: 0, opacity: [0, 1, 1, 0] }}
          transition={{
            default: { ...t.travel, delay: CALL_DELAY[step] },
            opacity: { duration: 1.4, times: [0, 0.12, 0.7, 1], ease: 'linear', delay: CALL_DELAY[step] },
          }}
        >
          <rect x={L.callTo(ci)[0] - 58} y={L.callTo(ci)[1] - 10} width={116} height={20} rx={10} />
          <text x={L.callTo(ci)[0]} y={L.callTo(ci)[1]}>
            insertQuarter()
          </text>
        </motion.g>
      )}
    </svg>
  )
}

function Stm({ L, step, className }: { L: StmL; step: number; className: string }) {
  const active = ACTIVE[step]
  const hot = HOT[step]
  const switchDelay = hot ? HOT_DELAY[step] + 0.7 : 0
  return (
    <svg className={`sst-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} aria-hidden="true">
      <circle className="sst-init" cx={L.init.dot[0]} cy={L.init.dot[1]} r={6} />
      <path className="sst-tr" d={L.init.d} />
      <path className="sst-head" d={arrow(L.init.end, L.init.dir)} />

      {(Object.keys(L.tr) as Tr[]).map((k) => {
        const tr = L.tr[k]
        const isHot = hot === k
        const anchor = tr.label.anchor ?? 'middle'
        return (
          <g key={k} className="sst-trg" data-hot={isHot || undefined}>
            <path className="sst-tr" d={tr.d} />
            {isHot && (
              <motion.path
                key={`hot-${step}`}
                className="sst-tr sst-tr-hot"
                d={tr.d}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ ...t.travel, delay: HOT_DELAY[step] }}
              />
            )}
            <path className="sst-head" d={arrow(tr.end, tr.dir)} />
            <text className="sst-label" x={tr.label.x} y={tr.label.y} textAnchor={anchor}>
              {tr.label.lines.map((l, i) => (
                <tspan key={i} x={tr.label.x} dy={i === 0 ? 0 : 14}>
                  {l}
                </tspan>
              ))}
            </text>
          </g>
        )
      })}

      {(Object.keys(L.states) as S[]).map((s) => {
        const [x, y, w, h] = L.states[s]
        const on = s === active
        return (
          <g key={s} className="sst-state" data-on={on || undefined} style={{ transitionDelay: on ? `${switchDelay}s` : '0s' }}>
            <rect x={x} y={y} width={w} height={h} rx={10} />
            <text x={x + w / 2} y={y + h / 2}>
              {SNAME[s]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

function StateFig({ step }: { step: number }) {
  return (
    <div className="sst">
      <Top L={TOP_WIDE} step={step} className="sst-wide" />
      <Top L={TOP_NARROW} step={step} className="sst-narrow" />
      <div className="sst-stm">
        <Stm L={STM_WIDE} step={step} className="sst-wide" />
        <Stm L={STM_NARROW} step={step} className="sst-narrow" />
        <p className="sst-note-text">
          Tilstandsdiagrammet er gentegnet i UML fra HFDP s. 382. Start: <code>NoQuarterState</code>, hvis der er kugler, ellers <code>SoldOutState</code> (konstruktøren, s. 399).
        </p>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'state',
  title: 'Samme mønt, fire svar',
  steps: [
    { caption: '`GumballMachine` er konteksten. Feltet `state` peger på ét af fire tilstandsobjekter.', hold: 2400 },
    {
      caption: '`insertQuarter()` kalder `state.insertQuarter()`. `NoQuarterState` svarer og kalder `setState(…HasQuarterState)` — *insert quarter*.',
      hold: 3400,
    },
    { caption: 'Samme kald. `HasQuarterState` svarer “You can’t insert another quarter” — `state` bliver stående.', hold: 2600 },
    { caption: 'Efter *turn crank* peger `state` på `SoldState`. Samme kald: “Please wait, we’re already giving you a gumball”.', hold: 3400 },
    {
      caption: 'Efter *dispense gumball* med 0 kugler: `SoldOutState`. Samme kald: “You can’t insert a quarter, the machine is sold out”.',
      hold: 3400,
    },
    {
      caption: 'Én metode, fire svar. Konteksten har ingen `if` — adfærden ligger i tilstandene, og kun tilstandene flytter `state`.',
      hold: 2800,
    },
  ],
  Component: StateFig,
}

export default viz
