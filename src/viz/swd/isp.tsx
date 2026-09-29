import { motion } from 'motion/react'
import { useId, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './isp.css'

/* swd/kilder/uge-03_solid-lsp-isp-dip/SOLID - ID.pdf
   s. 5: "Clients should not be forced to depend on methods they do not use".
   s. 11 (brud): Timer (+ Register(int t, ITimerClient c)) → ITimerClient (+ Timeout());
   IDoor (+ Open(), + Close(), + IsOpen(): bool) arver ITimerClient; TimedDoor, HeavyDoor,
   SlidingDoor realiserer IDoor, og HeavyDoor/SlidingDoor har + Timeout() i rødt;
   AccessProvider → IDoor; TimedDoor → Timer. Kommentarerne står ordret.
   s. 12 (løsning): IDoor og ITimerClient adskilt, TimedDoor realiserer begge,
   TimedDoor → Timer er ikke tegnet. Kommentarerne står ordret.
   Afvigelse fra sliden: IDoor → ITimerClient er tegnet som generalisering (fuld linje),
   fordi et interface, der udvider et andet, er generalisering i UML; sliden har stiplet
   linje. «interface» er tilføjet. Realiseringerne til IDoor er tegnet som ét træ. */

type P = [number, number]
type Dir = 'up' | 'down' | 'left' | 'right'

/* ------------------------------ Streger --------------------------------- */

const clean = (s: string) => 'isp' + s.replace(/[^a-zA-Z0-9_-]/g, '')

/** En relationslinje, der tegnes ind fra sin startende. Stiplede linjer afsløres
    gennem en maske, så stiplingen bevares, mens den tegnes. */
function Draw({ d, on, dashed, delay = 0, hot, neg }: { d: string; on: boolean; dashed?: boolean; delay?: number; hot?: boolean; neg?: boolean }) {
  const id = clean(useId())
  const tr = on ? { ...t.travel, duration: 0.6, delay } : t.recede
  const cls = `isp-line${dashed ? ' is-dash' : ''}`
  const anim = { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }
  const trans = { pathLength: tr, opacity: on ? { duration: 0.01, delay } : { ...t.fade, delay: 0.3 } }
  if (!dashed)
    return <motion.path className={cls} data-hot={hot || undefined} data-neg={neg || undefined} d={d} initial={false} animate={anim} transition={trans} />
  return (
    <g>
      <mask id={id} maskUnits="userSpaceOnUse" x={-40} y={-40} width={1000} height={1000}>
        <motion.path d={d} stroke="#fff" strokeWidth={10} fill="none" initial={false} animate={anim} transition={trans} />
      </mask>
      <path className={cls} data-hot={hot || undefined} d={d} mask={`url(#${id})`} />
    </g>
  )
}

const ROT: Record<Dir, number> = { right: 0, down: 90, left: 180, up: 270 }

/** Pilespids ved punktet p. `open` = navigerbar association, `tri` = lukket hul trekant. */
function Head({ p, dir, kind, on, delay = 0, hot, neg }: { p: P; dir: Dir; kind: 'open' | 'tri'; on: boolean; delay?: number; hot?: boolean; neg?: boolean }) {
  const d = kind === 'open' ? 'M-9 -5 L0 0 L-9 5' : 'M0 0 L-12 -7 L-12 7 Z'
  return (
    <motion.path
      className={kind === 'open' ? 'isp-open' : 'isp-tri'}
      data-hot={hot || undefined}
      data-neg={neg || undefined}
      d={d}
      transform={`translate(${p[0]} ${p[1]}) rotate(${ROT[dir]})`}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={on ? { ...t.fade, delay: delay + 0.45 } : t.fade}
    />
  )
}

/* ------------------------------- Klasser -------------------------------- */

interface Op {
  text: string
  /** Rækken er der kun, når show er sand (pladsen er reserveret). */
  show?: boolean
  forced?: boolean
  fresh?: boolean
}
type Tone = 'idle' | 'focus' | 'neg'

const LH = 16
const nameH = (stereo?: boolean) => (stereo ? 36 : 26)
const boxH = (stereo: boolean | undefined, ops: number) => nameH(stereo) + (ops ? 10 + ops * LH : 0)

function Cls({ x, y, w, name, stereo, ops = [], tone = 'idle', noOps }: { x: number; y: number; w: number; name: string; stereo?: boolean; ops?: Op[]; tone?: Tone; noOps?: boolean }) {
  const nh = nameH(stereo)
  const h = noOps ? 30 : boxH(stereo, ops.length)
  return (
    <g className="isp-cls" data-tone={tone}>
      <rect x={x} y={y} width={w} height={h} />
      {!noOps && <line x1={x} x2={x + w} y1={y + nh} y2={y + nh} />}
      {stereo && (
        <text className="isp-stereo" x={x + w / 2} y={y + 14}>
          «interface»
        </text>
      )}
      <text className="isp-cname" x={x + w / 2} y={noOps ? y + 19.5 : y + (stereo ? 29 : 18)}>
        {name}
      </text>
      {ops.map((o, i) => {
        const on = o.show ?? true
        return (
          <motion.g
            key={o.text + i}
            initial={false}
            animate={{ opacity: on ? 1 : 0, x: on ? 0 : -10 }}
            transition={on ? { ...t.place, delay: o.forced ? 0.35 : 0.2 } : t.recede}
          >
            <text className="isp-op" data-forced={o.forced || undefined} data-fresh={o.fresh || undefined} x={x + 8} y={y + nh + 6 + 12 + i * LH}>
              {o.text}
            </text>
          </motion.g>
        )
      })}
    </g>
  )
}

/** Kort mærkat i SVG (fx "polluted"). */
function Label({ x, y, lines, on, tone, anchor = 'middle', delay = 0 }: { x: number; y: number; lines: string[]; on: boolean; tone: 'neg' | 'focus' | 'ok'; anchor?: 'start' | 'middle' | 'end'; delay?: number }) {
  return (
    <motion.text
      className="isp-label"
      data-tone={tone}
      textAnchor={anchor}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={on ? { ...t.fade, delay } : t.fade}
    >
      {lines.map((l, i) => (
        <tspan key={i} x={x} y={y + i * 15}>
          {l}
        </tspan>
      ))}
    </motion.text>
  )
}

/* ------------------------------- Layouts -------------------------------- */

interface Layout {
  vb: [number, number]
  timer: P
  itcA: P // ITimerClient under bruddet
  itcB: P // ITimerClient efter snittet
  idoor: P
  ap: P
  doors: [P, P, P]
  doorW: number
  /** Stier */
  timerItcA: { d: string; end: P; dir: Dir }
  timerItcB: { d: string; end: P; dir: Dir }
  gen: { d: string; end: P }
  tdTimer: { d: string; end: P }
  tdItc: { d: string; end: P }
  apDoor: { d: string; end: P; dir: Dir }
  bus: string[]
  busTri: P
  tags: {
    polluted: [number, number, 'start' | 'middle' | 'end']
    plusOne: [number, number, 'start' | 'middle' | 'end']
    unchanged: [number, number, 'start' | 'middle' | 'end'][]
    unchangedLines: string[]
    oblivious: [number, number, 'start' | 'middle' | 'end']
  }
}

const IW = 150 // interfacebredde

const WIDE: Layout = {
  vb: [640, 424],
  timer: [0, 0],
  itcA: [330, 0],
  itcB: [60, 140],
  idoor: [330, 130],
  ap: [522, 162],
  doors: [
    [60, 292],
    [245, 292],
    [430, 292],
  ],
  doorW: 150,
  timerItcA: { d: 'M258 26 H330', end: [330, 26], dir: 'right' },
  timerItcB: { d: 'M135 52 V140', end: [135, 140], dir: 'down' },
  gen: { d: 'M405 130 V74', end: [405, 62] },
  tdTimer: { d: 'M90 292 V52', end: [90, 52] },
  tdItc: { d: 'M100 292 V214', end: [100, 202] },
  apDoor: { d: 'M522 177 H480', end: [480, 177], dir: 'left' },
  bus: ['M405 236 V262 H170 V292', 'M405 262 H320 V292', 'M405 262 H505 V292'],
  busTri: [405, 224],
  tags: {
    polluted: [282, 175, 'middle'],
    plusOne: [581, 152, 'middle'],
    unchanged: [
      [320, 411, 'middle'],
      [505, 411, 'middle'],
    ],
    unchangedLines: ['✓ remain unchanged'],
    oblivious: [581, 212, 'middle'],
  },
}

const NARROW: Layout = {
  vb: [320, 664],
  timer: [0, 0],
  itcA: [170, 86],
  itcB: [0, 86],
  idoor: [170, 186],
  ap: [24, 214],
  doors: [
    [24, 320],
    [24, 436],
    [24, 552],
  ],
  doorW: 146,
  timerItcA: { d: 'M214 52 V86', end: [214, 86], dir: 'down' },
  timerItcB: { d: 'M75 52 V86', end: [75, 86], dir: 'down' },
  gen: { d: 'M245 186 V160', end: [245, 148] },
  tdTimer: { d: 'M24 350 H12 V52', end: [12, 52] },
  tdItc: { d: 'M24 350 H12 V160', end: [12, 148] },
  apDoor: { d: 'M142 229 H170', end: [170, 229], dir: 'right' },
  bus: ['M245 292 V370 H170', 'M245 370 V486 H170', 'M245 486 V602 H170'],
  busTri: [245, 280],
  tags: {
    polluted: [105, 174, 'middle'],
    plusOne: [24, 204, 'start'],
    unchanged: [
      [253, 482, 'start'],
      [253, 598, 'start'],
    ],
    unchangedLines: ['✓ remain', 'unchanged'],
    oblivious: [24, 262, 'start'],
  },
}

const DOOR_OPS = ['+ Open()', '+ Close()', '+ IsOpen(): bool']

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const viol = at(step, 1) && step < 4
  const sep = at(step, 4)
  const forced = step === 2 || step === 3
  const itc = sep ? L.itcB : L.itcA
  const dx = itc[0] - L.itcA[0]
  const dy = itc[1] - L.itcA[1]

  const doorOps = (extra: Op): Op[] => [...DOOR_OPS.map((text) => ({ text })), extra]
  const names = ['TimedDoor', 'HeavyDoor', 'SlidingDoor']
  const doorTone: Tone[] = [
    step === 1 || step === 4 ? 'focus' : 'idle',
    forced ? 'neg' : step === 5 ? 'focus' : 'idle',
    forced ? 'neg' : step === 5 ? 'focus' : 'idle',
  ]

  return (
    <svg className={`isp-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} aria-hidden="true">
      {/* Timer → ITimerClient (association). Skifter geometri, når ITimerClient flytter. */}
      <Draw d={L.timerItcA.d} on={!sep} />
      <Head p={L.timerItcA.end} dir={L.timerItcA.dir} kind="open" on={!sep} />
      <Draw d={L.timerItcB.d} on={sep} delay={0.9} />
      <Head p={L.timerItcB.end} dir={L.timerItcB.dir} kind="open" on={sep} delay={0.9} />

      {/* IDoor → ITimerClient: generalisering (bruddet) */}
      <Draw d={L.gen.d} on={viol} hot={step === 1} neg={forced} />
      <Head p={L.gen.end} dir="up" kind="tri" on={viol} hot={step === 1} />

      {/* TimedDoor → Timer (kun på s. 11) */}
      <Draw d={L.tdTimer.d} on={viol} delay={0.15} />
      <Head p={L.tdTimer.end} dir="up" kind="open" on={viol} delay={0.15} />

      {/* TimedDoor ⇢ ITimerClient: realisering (løsningen) */}
      <Draw d={L.tdItc.d} on={sep} dashed delay={1.2} hot={step === 4} />
      <Head p={L.tdItc.end} dir="up" kind="tri" on={sep} delay={1.2} hot={step === 4} />

      {/* AccessProvider → IDoor */}
      <path className="isp-line" d={L.apDoor.d} data-neg={step === 3 || undefined} />
      <Head p={L.apDoor.end} dir={L.apDoor.dir} kind="open" on neg={step === 3} />

      {/* Dørene ⇢ IDoor: realisering som træ */}
      {L.bus.map((d) => (
        <path key={d} className="isp-line is-dash" d={d} />
      ))}
      <Head p={L.busTri} dir="up" kind="tri" on />

      <Cls x={L.timer[0]} y={L.timer[1]} w={258} name="Timer" ops={[{ text: '+ Register(int t, ITimerClient c)' }]} />
      <motion.g initial={false} animate={{ x: dx, y: dy }} transition={sep ? { ...t.travel, delay: 0.3 } : t.travel}>
        <Cls x={L.itcA[0]} y={L.itcA[1]} w={IW} stereo name="ITimerClient" ops={[{ text: '+ Timeout()' }]} tone={step === 4 ? 'focus' : 'idle'} />
      </motion.g>
      <Cls
        x={L.idoor[0]}
        y={L.idoor[1]}
        w={IW}
        stereo
        name="IDoor"
        ops={DOOR_OPS.map((text) => ({ text }))}
        tone={forced ? 'neg' : step === 5 ? 'focus' : 'idle'}
      />
      <Cls x={L.ap[0]} y={L.ap[1]} w={118} name="AccessProvider" noOps tone={step === 3 ? 'neg' : step === 5 ? 'focus' : 'idle'} />

      {L.doors.map((p, i) => (
        <Cls
          key={names[i]}
          x={p[0]}
          y={p[1]}
          w={L.doorW}
          name={names[i]}
          tone={doorTone[i]}
          ops={doorOps(i === 0 ? { text: '+ Timeout()', show: at(step, 1), fresh: step === 1 } : { text: '+ Timeout()', show: forced, forced: true })}
        />
      ))}

      <Label x={L.tags.polluted[0]} y={L.tags.polluted[1]} anchor={L.tags.polluted[2]} lines={['✗ polluted']} on={forced} tone="neg" delay={0.2} />
      <Label x={L.tags.plusOne[0]} y={L.tags.plusOne[1]} anchor={L.tags.plusOne[2]} lines={['+1 metode']} on={step === 3} tone="neg" delay={0.2} />
      {L.tags.unchanged.map(([x, y, a]) => (
        <Label key={`${x}-${y}`} x={x} y={y} anchor={a} lines={L.tags.unchangedLines} on={step === 5} tone="ok" delay={0.2} />
      ))}
      <Label x={L.tags.oblivious[0]} y={L.tags.oblivious[1]} anchor={L.tags.oblivious[2]} lines={['✓ remain oblivious', 'to change']} on={step === 5} tone="ok" delay={0.4} />
    </svg>
  )
}

/* ------------------------------ Kommentarer ------------------------------ */

const NOTES: { page: number; text: ReactNode }[][] = [
  [],
  [{ page: 11, text: <><code>TimedDoor</code> exerts a force on the interface <code>IDoor</code>.</> }],
  [
    { page: 11, text: <><code>IDoor</code> is polluted, which impacts <b><i>all</i></b> implementations of <code>IDoor</code></> },
    { page: 11, text: <>Implementors must implement <code>TimeOut()</code></> },
  ],
  [
    { page: 11, text: <>The consumer of IDoor now has one more method to worry about.</> },
    { page: 11, text: <>Users of implementors must accept a software update for <i>zero</i> benefit</> },
  ],
  [
    { page: 12, text: <>Different implementors now depend on <i>separate</i> interfaces</> },
    { page: 12, text: <><code>TimedDoor</code> does not exert forces on other implementations of <code>IDoor</code></> },
  ],
  [
    { page: 12, text: <><code>HeavyDoor</code>/<code>SlidingDoor</code> remain unchanged</> },
    { page: 12, text: <>Consumers of <code>IDoor</code> remain oblivious to change</> },
  ],
]

function Notes({ step }: { step: number }) {
  return (
    <aside className="isp-notes">
      <div className="vcaps">Slidens kommentarer</div>
      <Swap
        show={step}
        items={NOTES.map((list, k) => (
          <ul key={k} className="isp-note-list">
            {list.map((n, i) => (
              <li key={i} className="isp-note" data-fix={n.page === 12 || undefined}>
                <span>{n.text}</span>
                <span className="isp-note-src">s. {n.page}</span>
              </li>
            ))}
          </ul>
        ))}
      />
    </aside>
  )
}

function Isp({ step }: { step: number }) {
  return (
    <div className="isp">
      <div className="isp-main">
        <div className="isp-dia">
          <Diagram L={WIDE} step={step} className="isp-wide" />
          <Diagram L={NARROW} step={step} className="isp-narrow" />
        </div>
        <Notes step={step} />
      </div>
      <motion.p className="isp-def" initial={false} animate={{ opacity: at(step, 5) ? 1 : 0 }} transition={at(step, 5) ? { ...t.fade, delay: 0.5 } : t.fade}>
        “Clients should not be forced to depend on methods they do not use” <span>SOLID - ID.pdf s. 5</span>
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'isp',
  title: 'Timeout forurener IDoor',
  steps: [
    { caption: 'Tre døre og en consumer deler `IDoor`. `Timer` kalder `Timeout()` på sine klienter.', hold: 2400 },
    { caption: '`TimedDoor` skal have timeouts — og nogen lader `IDoor` arve `ITimerClient`.', hold: 2600 },
    { caption: 'Alle implementorer skal nu have `Timeout()` — for *zero* benefit.', hold: 2600 },
    { caption: '`AccessProvider` har fået en metode mere at forholde sig til.', hold: 2200 },
    { caption: '`IDoor` og `ITimerClient` adskilles. Kun `TimedDoor` realiserer begge.', hold: 3000 },
    { caption: 'Hver klient afhænger kun af de metoder, den bruger.', hold: 2600 },
  ],
  Component: Isp,
}

export default viz
