import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './stm-minutur.css'

/* Minuturets state machine for klassen Ur: ApplicationModel.pdf s. 2 (= UML-Light-Ur.pdf
   figur 23 uden argumentet 1000). Eventrækkefølgen følger sekvensdiagrammet på s. 3:
   start, timeout, stop, reset. Reset i Startet er tilføjet for at vise et event uden
   transition; koden i Ur.cpp (UML-Light s. 6–7) ignorerer det med if (tilstand == STOPPET). */

type S = 'stoppet' | 'startet'
type Tr = 'init' | 'start' | 'timeout' | 'stop' | 'reset'
type Dir = 'up' | 'down' | 'left' | 'right'

interface Label {
  x: number
  y: number
  lines: string[]
  anchor?: 'start' | 'middle' | 'end'
}
interface Edge {
  d: string
  end: [number, number]
  dir: Dir
  label: Label
}
interface Layout {
  vb: [number, number]
  states: Record<S, [number, number, number, number]>
  dot: [number, number]
  edges: Record<Tr, Edge>
}

const WIDE: Layout = {
  vb: [410, 262],
  states: { stoppet: [20, 104, 130, 46], startet: [260, 104, 130, 46] },
  dot: [85, 34],
  edges: {
    init: { d: 'M85 40 V104', end: [85, 104], dir: 'down', label: { x: 77, y: 76, lines: ['/ nulstil()'], anchor: 'end' } },
    start: { d: 'M150 118 H260', end: [260, 118], dir: 'right', label: { x: 205, y: 92, lines: ['start / timerObj.start()'] } },
    stop: { d: 'M260 138 H150', end: [150, 138], dir: 'left', label: { x: 205, y: 166, lines: ['stop / timerObj.stop()'] } },
    reset: { d: 'M60 150 V188 H110 V150', end: [110, 150], dir: 'up', label: { x: 85, y: 206, lines: ['reset / nulstil()'] } },
    timeout: {
      d: 'M300 150 V188 H350 V150',
      end: [350, 150],
      dir: 'up',
      label: { x: 325, y: 206, lines: ['timeout / timerObj.start(),', 'taelOp(),', 'displayObj.vis(min, sec)'] },
    },
  },
}

const NARROW: Layout = {
  vb: [320, 322],
  states: { stoppet: [100, 40, 120, 44], startet: [100, 196, 120, 44] },
  dot: [160, 10],
  edges: {
    init: { d: 'M160 16 V40', end: [160, 40], dir: 'down', label: { x: 170, y: 30, lines: ['/ nulstil()'], anchor: 'start' } },
    start: { d: 'M135 84 V196', end: [135, 196], dir: 'down', label: { x: 127, y: 128, lines: ['start /', 'timerObj.start()'], anchor: 'end' } },
    stop: { d: 'M185 196 V84', end: [185, 84], dir: 'up', label: { x: 193, y: 128, lines: ['stop /', 'timerObj.stop()'], anchor: 'start' } },
    reset: { d: 'M100 52 H74 V72 H100', end: [100, 72], dir: 'right', label: { x: 68, y: 58, lines: ['reset /', 'nulstil()'], anchor: 'end' } },
    timeout: {
      d: 'M140 240 V264 H180 V240',
      end: [180, 240],
      dir: 'up',
      label: { x: 160, y: 284, lines: ['timeout / timerObj.start(),', 'taelOp(), displayObj.vis(min, sec)'] },
    },
  },
}

/* Hvad der sker i hvert trin. */
const ACTIVE: S[] = ['stoppet', 'startet', 'startet', 'startet', 'stoppet', 'stoppet']
const HOT: (Tr | null)[] = ['init', 'start', 'timeout', null, 'stop', 'reset']
const DISPLAY = ['00:00', '00:00', '00:01', '00:01', '00:01', '00:00']

const visited = (tr: Tr, step: number) => HOT.slice(0, step + 1).includes(tr)

function head([x, y]: [number, number], dir: Dir) {
  const a = 7
  const b = 4.5
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

const NAME: Record<S, string> = { stoppet: 'Stoppet', startet: 'Startet' }

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const active = ACTIVE[step]
  const ignored = step === 3
  return (
    <svg className={`smu-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} aria-hidden="true">
      <circle className="smu-dot" cx={L.dot[0]} cy={L.dot[1]} r={6} />
      {(Object.keys(L.edges) as Tr[]).map((id) => {
        const e = L.edges[id]
        const hot = HOT[step] === id
        const done = visited(id, step) && !hot
        return (
          <g key={id} className="smu-edge" data-hot={hot || undefined} data-done={done || undefined}>
            <path className="smu-line" d={e.d} />
            {hot && (
              <motion.path
                key={`hot-${step}`}
                className="smu-line smu-line-hot"
                d={e.d}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ ...t.travel, delay: 0.1 }}
              />
            )}
            <path className="smu-head" d={head(e.end, e.dir)} />
            <text className="smu-label" x={e.label.x} y={e.label.y} textAnchor={e.label.anchor ?? 'middle'}>
              {e.label.lines.map((line, j) => (
                <tspan key={j} x={e.label.x} dy={j === 0 ? 0 : '1.25em'}>
                  {line}
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
          <g key={s} className="smu-state" data-on={on || undefined} data-neg={(on && ignored) || undefined}>
            <rect x={x} y={y} width={w} height={h} rx={12} />
            <text x={x + w / 2} y={y + h / 2}>
              {NAME[s]}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

interface LogRow {
  ev: string
  act: string
  neg?: boolean
}
const LOG: LogRow[] = [
  { ev: '(initial)', act: 'nulstil()' },
  { ev: 'start', act: 'timerObj.start()' },
  { ev: 'timeout', act: 'timerObj.start(), taelOp(), displayObj.vis(min, sec)' },
  { ev: 'reset', act: 'ingen transition i Startet', neg: true },
  { ev: 'stop', act: 'timerObj.stop()' },
  { ev: 'reset', act: 'nulstil()' },
]

function StmMinutur({ step }: { step: number }) {
  return (
    <div className="smu">
      <section className="smu-machine">
        <header className="smu-head">
          <span className="smu-frame">
            stm <code>Ur</code>
          </span>
          <span className="vcaps">«controller» i minuturets applikationsmodel</span>
        </header>
        <Diagram L={WIDE} step={step} className="smu-wide" />
        <Diagram L={NARROW} step={step} className="smu-narrow" />
      </section>

      <aside className="smu-side">
        <div className="smu-display" aria-label={`Display viser ${DISPLAY[step]}`}>
          <span className="vcaps">Display</span>
          <motion.span key={DISPLAY[step]} className="smu-digits" initial={{ opacity: 0.2 }} animate={{ opacity: 1 }} transition={t.fade}>
            {DISPLAY[step]}
          </motion.span>
          <span className="smu-state-now">
            tilstand: <strong>{NAME[ACTIVE[step]]}</strong>
          </span>
        </div>

        <ol className="smu-log">
          {LOG.map((r, i) => {
            const shown = step >= i
            const hot = step === i
            return (
              <motion.li
                key={i}
                className="smu-row"
                data-hot={hot || undefined}
                data-neg={r.neg || undefined}
                initial={false}
                animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : 4 }}
                transition={shown ? t.settle : t.fade}
                aria-hidden={!shown || undefined}
              >
                <code className="smu-ev">{r.ev}</code>
                {r.neg ? (
                  <Tag tone="neg" wrap>
                    {r.act}
                  </Tag>
                ) : (
                  <code className="smu-act">{r.act}</code>
                )}
              </motion.li>
            )
          })}
        </ol>
      </aside>
    </div>
  )
}

const viz: VizDef = {
  id: 'stm-minutur',
  title: 'Minuturets tilstandsmaskine skifter ved events',
  steps: [
    {
      caption: 'Initial-transitionen kører `nulstil()`: minutter og sekunder sættes til 0, og displayet viser 00:00. Uret står i **Stoppet**.',
      hold: 2400,
    },
    {
      caption: 'Start-knappen giver eventet `start`. Uret skifter til **Startet**, og action’en starter timeren: `timerObj.start()`.',
      hold: 2400,
    },
    {
      caption:
        'Når tiden er gået, sender timeren `timeout`. Det er en **selv-transition**: uret bliver i Startet, genstarter timeren, tæller op og viser 00:01.',
      hold: 3000,
    },
    {
      caption: 'Reset mens uret kører: Startet har **ingen transition** for `reset`, så intet sker. Koden tjekker `tilstand == STOPPET` først.',
      hold: 2800,
    },
    { caption: '`stop` fører tilbage til **Stoppet** og stopper timeren. Tiden står stadig på 00:01.', hold: 2200 },
    {
      caption: 'Nu er `reset` lovligt: selv-transitionen på Stoppet kører `nulstil()`, og displayet viser 00:00. Samme event, forskellig reaktion — det er tilstanden, der afgør det.',
      hold: 3200,
    },
  ],
  Component: StmMinutur,
}

export default viz
