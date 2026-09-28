import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './stm-doorcontrol.css'

/* DoorControlExercise.pdf s. 1–3 (scenarierne og advarslen mod at gøre
   tilstanden public; fakes kalder ikke tilbage). DoorControlConstructorInjection:
   DoorControl.cs (enum State og én switch pr. event) og de tre testfiler
   (EntryGranted, EntryDenied, DoorBreached). Materialet har ingen STM-løsning i
   diagramform; diagrammet er tegnet ud fra koden. */

function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.(,]|[a-z]_)/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

type S = 'closed' | 'opening' | 'closing' | 'breached'
const NAME: Record<S, string> = {
  closed: 'DoorClosed',
  opening: 'DoorOpening',
  closing: 'DoorClosing',
  breached: 'DoorBreached',
}
/** Aktiv tilstand efter hvert trin. */
const ACTIVE: S[] = ['closed', 'opening', 'closing', 'closing', 'closed', 'breached']

type Dir = 'up' | 'down' | 'left' | 'right'
interface Tr {
  n: number
  d: string
  end: [number, number]
  dir: Dir
  badge: [number, number]
  label: { x: number; y: number; lines: string[]; anchor?: 'start' | 'middle' | 'end' }[]
}
interface Layout {
  vb: [number, number]
  top: number
  font: number
  states: Record<S, [number, number, number, number]>
  init: { dot: [number, number]; d: string; end: [number, number] }
  tr: Tr[]
  note: { x: number; y: number; anchor: 'start' | 'middle' | 'end' }
}

/* Numrene følger testrækkefølgen: ① gyldig RequestEntry, ② DoorOpened, ③ ignoreret
   RequestEntry (ingen overgang), ④ DoorClosed, ⑤ indbrud, ⑥ afvist RequestEntry. */
const WIDE: Layout = {
  vb: [760, 322],
  top: 44,
  font: 12,
  states: {
    breached: [20, 130, 150, 40],
    closed: [300, 130, 150, 40],
    opening: [590, 130, 150, 40],
    closing: [590, 250, 150, 40],
  },
  init: { dot: [330, 72], d: 'M330 78 V130', end: [330, 130] },
  tr: [
    {
      n: 1,
      d: 'M450 150 H590',
      end: [590, 150],
      dir: 'right',
      badge: [520, 150],
      label: [{ x: 520, y: 100, lines: ['RequestEntry [valid]', '/ Open(),', 'NotifyEntryGranted()'] }],
    },
    {
      n: 2,
      d: 'M665 170 V250',
      end: [665, 250],
      dir: 'down',
      badge: [665, 232],
      label: [{ x: 655, y: 199, lines: ['DoorOpened', '/ Close()'], anchor: 'end' }],
    },
    { n: 4, d: 'M590 270 H390 V170', end: [390, 170], dir: 'up', badge: [520, 270], label: [{ x: 460, y: 262, lines: ['DoorClosed'] }] },
    {
      n: 5,
      d: 'M300 150 H170',
      end: [170, 150],
      dir: 'left',
      badge: [235, 150],
      label: [{ x: 235, y: 114, lines: ['DoorOpened /', 'SoundAlarm(), Close()'] }],
    },
    {
      n: 6,
      d: 'M405 130 V96 H435 V130',
      end: [435, 130],
      dir: 'down',
      badge: [420, 96],
      label: [{ x: 420, y: 60, lines: ['RequestEntry [invalid]', '/ NotifyEntryDenied()'] }],
    },
  ],
  note: { x: 665, y: 312, anchor: 'middle' },
}

const NARROW: Layout = {
  vb: [320, 330],
  top: 0,
  font: 12.5,
  states: {
    closed: [92, 44, 136, 36],
    breached: [6, 150, 134, 36],
    opening: [180, 150, 134, 36],
    closing: [180, 256, 134, 36],
  },
  init: { dot: [160, 12], d: 'M160 18 V44', end: [160, 44] },
  tr: [
    { n: 1, d: 'M205 80 V150', end: [205, 150], dir: 'down', badge: [205, 112], label: [{ x: 216, y: 110, lines: ['RequestEntry', '[valid]'], anchor: 'start' }] },
    { n: 2, d: 'M252 186 V256', end: [252, 256], dir: 'down', badge: [252, 221], label: [{ x: 241, y: 219, lines: ['DoorOpened'], anchor: 'end' }] },
    { n: 4, d: 'M180 274 H160 V80', end: [160, 80], dir: 'up', badge: [160, 214], label: [{ x: 150, y: 230, lines: ['DoorClosed'], anchor: 'end' }] },
    { n: 5, d: 'M112 80 V150', end: [112, 150], dir: 'down', badge: [112, 112], label: [{ x: 101, y: 110, lines: ['DoorOpened'], anchor: 'end' }] },
    { n: 6, d: 'M228 54 H262 V70 H228', end: [228, 70], dir: 'left', badge: [262, 62], label: [{ x: 318, y: 20, lines: ['RequestEntry', '[invalid]'], anchor: 'end' }] },
  ],
  note: { x: 247, y: 316, anchor: 'middle' },
}

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

const CIRC = ['', '①', '②', '③', '④', '⑤', '⑥']
/** Hvornår en overgang er i fokus (trin), og hvornår den er dækket af en test. */
const HOT: Record<number, number> = { 1: 1, 2: 2, 3: 3, 4: 4, 5: 5 }
const covered = (n: number, step: number) => (n === 6 ? step >= 5 : step >= HOT[n])

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const active = ACTIVE[step]
  return (
    <svg className={`sdc-svg ${className}`} viewBox={`0 ${L.top} ${L.vb[0]} ${L.vb[1] - L.top}`} style={{ fontSize: L.font }} aria-hidden="true">
      {/* Starttilstand */}
      <circle className="sdc-init" cx={L.init.dot[0]} cy={L.init.dot[1]} r={6} />
      <path className="sdc-tr" d={L.init.d} />
      <path className="sdc-head" d={head(L.init.end, 'down')} />

      {L.tr.map((tr) => {
        const hot = step === HOT[tr.n]
        const done = covered(tr.n, step) && !hot
        return (
          <g key={tr.n} className="sdc-trg" data-hot={hot || undefined} data-done={done || undefined}>
            <path className="sdc-tr" d={tr.d} />
            {hot && (
              <motion.path
                key={`hot-${step}`}
                className="sdc-tr sdc-tr-hot"
                d={tr.d}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ ...t.travel, delay: 0.1 }}
              />
            )}
            <path className="sdc-head" d={head(tr.end, tr.dir)} />
            {tr.label.map((lb, i) => (
              <text key={i} className="sdc-label" x={lb.x} y={lb.y} textAnchor={lb.anchor ?? 'middle'}>
                {lb.lines.map((line, j) => (
                  <tspan key={j} x={lb.x} dy={j === 0 ? 0 : '1.2em'}>
                    {line}
                  </tspan>
                ))}
              </text>
            ))}
            <circle className="sdc-badge" cx={tr.badge[0]} cy={tr.badge[1]} r={8.5} />
            <text className="sdc-badge-n" x={tr.badge[0]} y={tr.badge[1]}>
              {tr.n}
            </text>
          </g>
        )
      })}

      {(Object.keys(L.states) as S[]).map((s) => {
        const [x, y, w, h] = L.states[s]
        const on = s === active
        return (
          <g key={s} className="sdc-state" data-on={on || undefined}>
            <rect x={x} y={y} width={w} height={h} rx={10} />
            <text x={x + w / 2} y={y + h / 2}>
              {NAME[s]}
            </text>
          </g>
        )
      })}

      <g className="sdc-note" data-hot={step === 3 || undefined} data-done={step > 3 || undefined}>
        <text x={L.note.x} y={L.note.y} textAnchor={L.note.anchor}>
          ③ RequestEntry ignoreres
        </text>
      </g>
    </svg>
  )
}

interface Row {
  n: number
  from: string
  label: string
  test: string
  does: string
}
const ROWS: Row[] = [
  {
    n: 1,
    from: 'DoorClosed → DoorOpening',
    label: 'RequestEntry [valid] / Open(), NotifyEntryGranted()',
    test: 'RequestEntry_CardDbApprovesEntryRequest_DoorOpenCalled',
    does: 'RequestEntry("TFJ") → _door.Received(1).Open()',
  },
  {
    n: 2,
    from: 'DoorOpening → DoorClosing',
    label: 'DoorOpened / Close()',
    test: 'RequestEntry_DoorOpened_DoorIsClosed',
    does: 'DoorOpened() → _door.Received(1).Close()',
  },
  {
    n: 3,
    from: 'DoorClosing, ingen overgang',
    label: 'RequestEntry ignoreres',
    test: 'RequestEntry_DoorNotYetClosedAgain_NoAction',
    does: 'ClearReceivedCalls(); RequestEntry("TFJ") → DidNotReceive().ValidateEntryRequest("TFJ")',
  },
  {
    n: 4,
    from: 'DoorClosing → DoorClosed',
    label: 'DoorClosed',
    test: 'RequestEntry_FullCycle_CanRestart',
    does: 'DoorClosed(); RequestEntry("TFJ") → _door.Received(1).Open()',
  },
  {
    n: 5,
    from: 'DoorClosed → DoorBreached',
    label: 'DoorOpened / SoundAlarm(), Close()',
    test: 'DoorBreached_DoorStateIsBreached_AlarmCalled',
    does: 'DoorOpened() → _alarm.Received(1).SoundAlarm(), _door.Received().Close()',
  },
  {
    n: 6,
    from: 'DoorClosed → DoorClosed',
    label: 'RequestEntry [invalid] / NotifyEntryDenied()',
    test: 'RequestEntry_CardDbDeniesEntryRequest_BeeperMakeUnhappyNoiseCalled',
    does: 'RequestEntry("TFJ") → _entryNotification.Received().NotifyEntryDenied()',
  },
]

function StmDoor({ step }: { step: number }) {
  return (
    <div className="sdc">
      <section className="sdc-uut">
        <header className="sdc-uut-head">
          <code className="sdc-uut-name">DoorControl</code>
          <code className="sdc-uut-field">private State _doorState</code>
          <Tag tone="neg">skjult for testen</Tag>
        </header>
        <Diagram L={WIDE} step={step} className="sdc-wide" />
        <Diagram L={NARROW} step={step} className="sdc-narrow" />
      </section>

      <ol className="sdc-rows">
        {ROWS.map((r) => {
          const hot = step === HOT[r.n]
          const done = covered(r.n, step)
          return (
            <li key={r.n} className="sdc-row" data-hot={hot || undefined} data-done={done || undefined}>
              <span className="sdc-row-n">{CIRC[r.n]}</span>
              <div className="sdc-row-body">
                <div className="sdc-row-tr">
                  <span className="sdc-row-from">{r.from}</span>
                  <code>{brk(r.label)}</code>
                </div>
                <code className="sdc-row-test">{brk(r.test)}</code>
                <code className="sdc-row-does">{brk(r.does)}</code>
              </div>
              <motion.span
                className="sdc-row-check"
                initial={false}
                animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.6 }}
                transition={done ? { ...t.place, delay: hot ? 0.7 : 0 } : t.fade}
              >
                ✓
              </motion.span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'stm-doorcontrol',
  title: 'Testen driver DoorControl gennem tilstandsmaskinen',
  steps: [
    {
      caption: '`DoorControl` er en STM med fire tilstande og starter i `DoorClosed`. Tilstanden er `private` — testen må ikke se den, kun hvad UUT gør mod sine mocks.',
      hold: 2800,
    },
    {
      caption: '① Testen kalder `RequestEntry("TFJ")`. Stubben godkender, UUT går til `DoorOpening`, og mock’en optager `Open()`.',
      hold: 2600,
    },
    {
      caption: '② Døren-faken kalder ikke tilbage — **testen** kalder selv `DoorOpened()`. UUT går til `DoorClosing` og kalder `Close()`.',
      hold: 2600,
    },
    {
      caption: '③ `ClearReceivedCalls()` og et nyt `RequestEntry("TFJ")` i `DoorClosing`: ingen overgang. `DidNotReceive()` viser, at eventet ignoreres.',
      hold: 3000,
    },
    {
      caption: '④ `DoorClosed()` fører tilbage til `DoorClosed`. Et nyt `RequestEntry` åbner igen: cyklussen kan starte forfra.',
      hold: 2600,
    },
    {
      caption: '⑤ Ny test: `DoorOpened()` uden godkendelse giver `SoundAlarm()` og `Close()` — `DoorBreached`. ⑥ dækkes af testene for *Entry Denied*.',
      hold: 3000,
    },
  ],
  Component: StmDoor,
}

export default viz
