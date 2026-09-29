import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node } from '../kit/primitives'
import { t } from '../kit/motion'
import './fejlhaandtering.css'

/* Kilder: Error handling 1.pdf s. 4 (Fault: “A default (bug) within a system”,
   “Develop-oriented concept”; Error: “Result of a fault being activated”,
   “Deviation from specification”; Failure: “Observable deviation from expected
   behavior”, “User-oriented concept”), s. 5 (kæden, “Not all faults result in
   errors, and not all errors lead to failures”, Bowling-eksemplet).
   Error handling 2.pdf s. 7 (system monitor “should inform fault observer”),
   s. 11 (watchdog: heartbeat kræver ekstra beskeder, passiv overvågning af
   eksisterende trafik, overvåger kun én task, kan rapportere til en system monitor),
   s. 12 (sekvensdiagrammerne; stavemåden “Reponse” er slidens).
   Grenene, hvor kæden stopper, er ikke tegnet på sliden; de er mærket med
   slidens sætning. */

/* ------------------------- Fault → error → failure ------------------------ */

const CHAIN = [
  {
    id: 'fault',
    title: 'Fault',
    def: ['A default (bug) within a system'],
    ex: 'Wrong implementation of Bowling calculation of a frame',
    role: 'develop-oriented concept',
  },
  {
    id: 'error',
    title: 'Error',
    def: ['Result of a fault being activated', 'Deviation from specification'],
    ex: 'Incorrect state when the above fault is executed',
    role: null,
  },
  {
    id: 'failure',
    title: 'Failure',
    def: ['Observable deviation from expected behavior'],
    ex: 'System produces a incorrect output visible to the user',
    role: 'user-oriented concept',
  },
] as const

const LINK_LABEL = ['når koden køres', 'breder sig']

function Stop() {
  return (
    <svg className="swd-fe-stop" viewBox="0 0 24 30" aria-hidden="true">
      <path d="M12 0 V22" />
      <path d="M4 23 H20" className="swd-fe-stopbar" />
    </svg>
  )
}

function Chain({ step }: { step: number }) {
  return (
    <div className="swd-fe-chainwrap">
      <div className="swd-fe-chain">
        {CHAIN.map((c, i) => {
          const lit = step >= i
          const now = step === i
          return (
            <div key={c.id} className="swd-fe-seg">
              {i > 0 && (
                <div className="swd-fe-arrow">
                  <div className="swd-fe-arrow-h">
                    <Link on={step >= i} tone={step === i ? 'focus' : 'idle'} label={LINK_LABEL[i - 1]} />
                  </div>
                  <div className="swd-fe-arrow-v">
                    <Link vertical on={step >= i} tone={step === i ? 'focus' : 'idle'} label={LINK_LABEL[i - 1]} />
                  </div>
                  <motion.div
                    className="swd-fe-branch"
                    initial={false}
                    animate={{ opacity: step >= 2 ? 1 : 0 }}
                    transition={step >= 2 ? { ...t.fade, delay: 0.6 + i * 0.15 } : t.fade}
                  >
                    <Stop />
                  </motion.div>
                </div>
              )}
              <Node className="swd-fe-box" tone={now ? 'focus' : lit ? 'idle' : 'ghost'}>
                <div className="swd-fe-title">{c.title}</div>
                <motion.div
                  className="swd-fe-body"
                  initial={false}
                  animate={{ opacity: lit ? 1 : 0 }}
                  transition={lit ? { ...t.fade, delay: step === i && i > 0 ? 0.5 : 0 } : t.fade}
                >
                  <ul className="swd-fe-def">
                    {c.def.map((d) => (
                      <li key={d}>{d}</li>
                    ))}
                  </ul>
                  <div className="swd-fe-ex">
                    <span className="swd-fe-exlabel">Bowling</span>
                    {c.ex}
                    {c.id === 'failure' && <span className="swd-fe-sic"> (sic)</span>}
                  </div>
                </motion.div>
                {c.role && <div className="swd-fe-role">{c.role}</div>}
              </Node>
            </div>
          )
        })}
      </div>
      <motion.p
        className="swd-fe-quote"
        initial={false}
        animate={{ opacity: step >= 2 ? 1 : 0 }}
        transition={step >= 2 ? { ...t.fade, delay: 0.9 } : t.fade}
      >
        <Stop />
        <span>
          kæden kan stoppe: <em>“Not all faults result in errors, and not all errors lead to failures.”</em>
        </span>
      </motion.p>
    </div>
  )
}

/* ---------------------------- Sekvensdiagrammer --------------------------- */

interface Msg {
  from: number
  to: number
  y: number
  label: string
  reply?: boolean
  /** Direkte udveksling uden watchdog: vises dæmpet. */
  muted?: boolean
}
interface SD {
  vb: [number, number]
  font: number
  lanes: { x: number; name: string; w: number }[]
  msgs: Msg[]
  /** Aktiveringsbjælker: [lane, y1, y2]. */
  act: [number, number, number][]
  groups?: { y: number; x: number; text: string }[]
  bracket?: { x: number; y1: number; y2: number; lines: string[] }
}

const HB = (W: number, narrow: boolean): SD => {
  const a = narrow ? 58 : 84
  const b = narrow ? 186 : 262
  const bx = narrow ? 228 : 306
  return {
    vb: [W, 250],
    font: narrow ? 12.5 : 12,
    lanes: [
      { x: a, name: 'Monitor', w: 78 },
      { x: b, name: 'Monitored', w: 94 },
    ],
    msgs: [
      { from: 0, to: 1, y: 76, label: 'Ok?' },
      { from: 1, to: 0, y: 106, label: 'Yes', reply: true },
      { from: 0, to: 1, y: 160, label: 'Ok?' },
      { from: 1, to: 0, y: 190, label: 'Yes', reply: true },
    ],
    act: [
      [1, 70, 112],
      [1, 154, 196],
    ],
    bracket: { x: bx, y1: 66, y2: 200, lines: narrow ? ['ekstra', 'trafik'] : ['ekstra trafik'] },
  }
}

const WD = (W: number, narrow: boolean): SD => {
  const xs = narrow ? [38, 152, 264] : [62, 212, 362]
  return {
    vb: [W, 250],
    font: narrow ? 12.5 : 12,
    lanes: [
      { x: xs[0], name: 'Client', w: 60 },
      { x: xs[1], name: 'Watchdog', w: 80 },
      { x: xs[2], name: 'Server', w: 62 },
    ],
    msgs: [
      { from: 0, to: 2, y: 80, label: 'Request', muted: true },
      { from: 2, to: 0, y: 104, label: 'Reponse', reply: true, muted: true },
      { from: 0, to: 1, y: 156, label: 'Request' },
      { from: 1, to: 2, y: 178, label: 'Request' },
      { from: 2, to: 1, y: 202, label: 'Reponse', reply: true },
      { from: 1, to: 0, y: 224, label: 'Reponse', reply: true },
    ],
    act: [
      [2, 74, 110],
      [1, 150, 230],
      [2, 172, 208],
    ],
    groups: [
      { y: 56, x: xs[0] + 8, text: 'direkte' },
      { y: 132, x: xs[0] + 8, text: 'gennem Watchdog' },
    ],
  }
}

function Seq({ L, state, className }: { L: SD; state: 'ghost' | 'hot' | 'done'; className: string }) {
  const on = state !== 'ghost'
  const hot = state === 'hot'
  const bottom = L.vb[1] - 6
  const actAt = (lane: number, y: number) => L.act.some(([l, a, b]) => l === lane && y >= a && y <= b)
  return (
    <svg
      className={`swd-fe-sd ${className}`}
      data-state={state}
      viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`}
      style={{ fontSize: L.font }}
      aria-hidden="true"
    >
      {L.lanes.map((ln) => (
        <g key={ln.name} className="swd-fe-lane">
          <line className="swd-fe-lifeline" x1={ln.x} x2={ln.x} y1={34} y2={bottom} />
          <rect className="swd-fe-head" x={ln.x - ln.w / 2} y={6} width={ln.w} height={28} rx={2} />
          <text className="swd-fe-headtext" x={ln.x} y={20}>
            {ln.name}
          </text>
        </g>
      ))}
      {L.act.map(([lane, y1, y2], i) => (
        <motion.rect
          key={i}
          className="swd-fe-act"
          x={L.lanes[lane].x - 5}
          y={y1}
          width={10}
          height={y2 - y1}
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={on ? { ...t.fade, delay: hot ? 0.2 + i * 0.3 : 0 } : t.fade}
        />
      ))}
      {L.groups?.map((g) => (
        <motion.text
          key={g.text}
          className="swd-fe-group"
          x={g.x}
          y={g.y}
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={t.fade}
        >
          {g.text}
        </motion.text>
      ))}
      {L.msgs.map((m, i) => {
        const x1 = L.lanes[m.from].x + (actAt(m.from, m.y) ? (m.to > m.from ? 5 : -5) : 0)
        const x2raw = L.lanes[m.to].x
        const x2 = x2raw + (actAt(m.to, m.y) ? (m.to > m.from ? -5 : 5) : 0)
        const dir = x2 > x1 ? 1 : -1
        const delay = hot ? 0.25 + i * 0.32 : 0
        const head = m.reply
          ? `M${x2 - dir * 8} ${m.y - 4.5} L${x2} ${m.y} L${x2 - dir * 8} ${m.y + 4.5}`
          : `M${x2 - dir * 9} ${m.y - 4.5} L${x2} ${m.y} L${x2 - dir * 9} ${m.y + 4.5}Z`
        return (
          <g key={i} className="swd-fe-msg" data-reply={m.reply || undefined} data-muted={m.muted || undefined}>
            <motion.path
              className="swd-fe-msgline"
              d={`M${x1} ${m.y} H${x2}`}
              initial={false}
              /* pathLength overskriver stroke-dasharray; et svar (stiplet) toner derfor bare ind. */
              animate={m.reply ? { opacity: on ? 1 : 0 } : { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={
                on
                  ? m.reply
                    ? { ...t.fade, delay }
                    : { pathLength: { ...t.travel, duration: 0.5, delay }, opacity: { ...t.fade, delay } }
                  : t.fade
              }
            />
            <motion.path
              className="swd-fe-msghead"
              d={head}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: delay + 0.4 } : t.fade}
            />
            <motion.text
              className="swd-fe-msglabel"
              x={Math.abs(m.to - m.from) > 1 ? (x1 + L.lanes[1].x) / 2 : (x1 + x2) / 2}
              y={m.y - 8}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: delay + 0.2 } : t.fade}
            >
              {m.label}
            </motion.text>
          </g>
        )
      })}
      {L.bracket && (
        <motion.g
          className="swd-fe-bracket"
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={on ? { ...t.fade, delay: hot ? 1.5 : 0 } : t.fade}
        >
          <path
            d={`M${L.bracket.x - 5} ${L.bracket.y1} H${L.bracket.x} V${L.bracket.y2} H${L.bracket.x - 5}`}
          />
          <text x={L.bracket.x + 7} y={(L.bracket.y1 + L.bracket.y2) / 2 - ((L.bracket.lines.length - 1) * 8)}>
            {L.bracket.lines.map((l, j) => (
              <tspan key={j} x={L.bracket!.x + 7} dy={j === 0 ? 0 : '1.25em'}>
                {l}
              </tspan>
            ))}
          </text>
        </motion.g>
      )}
    </svg>
  )
}

const HB_WIDE = HB(390, false)
const HB_NARROW = HB(300, true)
const WD_WIDE = WD(420, false)
const WD_NARROW = WD(300, true)

function Detection({ step }: { step: number }) {
  const hb = step < 3 ? 'ghost' : step === 3 ? 'hot' : 'done'
  const wd = step < 4 ? 'ghost' : step === 4 ? 'hot' : 'done'
  const report = step >= 5
  return (
    <div className="swd-fe-detect">
      <div className="swd-fe-sds">
        <section className="swd-fe-panel" data-state={hb}>
          <header className="swd-fe-ph">
            <span className="swd-fe-pname">Heartbeat</span>
            <span className="swd-fe-psub">aktiv, med faste intervaller</span>
          </header>
          <Seq L={HB_WIDE} state={hb} className="swd-fe-wide" />
          <Seq L={HB_NARROW} state={hb} className="swd-fe-narrow" />
        </section>
        <section className="swd-fe-panel" data-state={wd}>
          <header className="swd-fe-ph">
            <span className="swd-fe-pname">Watchdog</span>
            <span className="swd-fe-psub">passiv, overvåger kun én task</span>
          </header>
          <Seq L={WD_WIDE} state={wd} className="swd-fe-wide" />
          <Seq L={WD_NARROW} state={wd} className="swd-fe-narrow" />
          <motion.p
            className="swd-fe-pnote"
            initial={false}
            animate={{ opacity: step >= 4 ? 1 : 0 }}
            transition={step === 4 ? { ...t.fade, delay: 2.1 } : t.fade}
          >
            <strong>ingen ekstra beskeder</strong> · <code>Reponse</code> (sic) som på sliden
          </motion.p>
        </section>
      </div>

      <div className="vflow stack swd-fe-report">
        <Node title="Watchdog" tone={report ? 'focus' : 'ghost'} />
        <Link on={report} tone={report ? 'focus' : 'idle'} label="reports to" />
        <Node title="System monitor" sub="overvåger flere tasks" tone={report ? 'focus' : 'ghost'} />
        <Link on={report} tone={report ? 'focus' : 'idle'} label="informs" />
        <Node title="Fault observer" tone={report ? 'focus' : 'ghost'} />
      </div>
    </div>
  )
}

function Fejl({ step }: { step: number }) {
  return (
    <div className="swd-fe">
      <Chain step={step} />
      <Detection step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'fejlhaandtering',
  title: 'Fra fault til failure, og hvem der opdager den',
  steps: [
    {
      caption: 'En **fault** er en defekt i koden — den gør ingenting, før koden køres.',
      hold: 2200,
    },
    {
      caption: 'Når koden køres, aktiveres fault’en: en **error** er en forkert tilstand — en afvigelse fra specifikationen.',
      hold: 2600,
    },
    {
      caption:
        'En error kan brede sig til en **failure**: noget brugeren kan se. Men ikke alle faults bliver errors, og ikke alle errors bliver failures.',
      hold: 3000,
    },
    {
      caption: '**Heartbeat:** monitoren spørger `Ok?` med faste intervaller og venter på `Yes`. Det er ekstra beskeder.',
      hold: 2800,
    },
    {
      caption: '**Watchdog:** den lytter passivt på den trafik, der alligevel går. Den overvåger kun én task.',
      hold: 3000,
    },
    {
      caption:
        'Begge kan rapportere videre: watchdog’en til en system monitor, og system monitoren til fault observeren.',
      hold: 2600,
    },
  ],
  Component: Fejl,
}

export default viz
