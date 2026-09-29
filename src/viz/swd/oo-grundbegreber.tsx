import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './oo-grundbegreber.css'

/* swd/kilder/uge-01_intro-oo-uml/OO Basic.pdf, slide 6 (“EVIL CLIENT”): de tre
   versioner af TurbineManager og EvilClient ordret (DestroyTurbines,
   DestroyTurbines2, DestroyTurbines3). Slidet viser ikke listens indhold: kun
   "A323" er navngivet, de to andre turbiner er illustrative (“…”). Slidet viser
   ingen validering i SetMaxSpeed — figuren viser derfor intet “afvist”, kun at
   kaldet lander i TurbineManager, hvor en kontrol kan ligge. */

type P = [number, number]
type Box = [number, number, number, number]
type Ver = 1 | 2 | 3

/** Brudpunkter efter parentes og komma — aldrig midt i et ord. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[(,])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

/* ------------------------------ Klientens kode ----------------------------- */

const CLIENT: Record<Ver, { method: string[]; body: string[] }> = {
  1: { method: ['DestroyTurbines(', '  TurbineManager tm)'], body: ['tm.turbines.Clear();'] },
  2: {
    method: ['DestroyTurbines2(', '  TurbineManager tm)'],
    body: ['tm.GetTurbine("A323")', '  .Id = "PWND";', 'tm.GetTurbine("PWND")', '  .MaxSpeed = -1000;'],
  },
  3: { method: ['DestroyTurbines3(', '  TurbineManager tm)'], body: ['tm.SetMaxSpeed(', '  "A323", -1000);'] },
}

/** Hvilke kodelinjer der er i gang, og i hvilken tone. */
function hotLines(step: number): { lines: number[]; tone: 'neg' | 'focus' } {
  if (step === 1) return { lines: [0], tone: 'neg' }
  if (step === 2) return { lines: [0], tone: 'neg' }
  if (step === 3) return { lines: [1, 2, 3], tone: 'neg' }
  if (step === 4) return { lines: [0, 1], tone: 'focus' }
  return { lines: [], tone: 'focus' }
}

/* --------------------------------- Layout -------------------------------- */

interface Door {
  box: Box
  lines: string[]
}
interface Geo {
  vb: [number, number]
  font: number
  lh: number
  client: Box
  clientText: { x: number; head: number; sep: number; method: number[]; body: number[] }
  frame: Box
  title: P
  field: P
  doors: { 1: Door[]; 2: Door[]; 3: Door[] }
  list: Box
  listHead: P
  chips: Box[]
  chipText: [number, number]
  empty: P
  note: { x: number; y: number; lines: string[] }
  clear: { d: string; tip: P; dir: 'r' | 'd' }
  ref: { d: string; tip: P; dir: 'r' | 'd'; dot: P; label: P; anchor: 'start' | 'middle' | 'end' }
  inner: { d: string; tip: P; dir: 'r' | 'd' }
  token2: [P, P]
  token3: [P, P]
  marker: { x: number; y: number; lines: ReactNode[] }
}

const TM = <tspan className="ooe-mono">TurbineManager</tspan>

const WIDE: Geo = {
  vb: [840, 262],
  font: 11.5,
  lh: 17,
  client: [0, 40, 196, 170],
  clientText: { x: 10, head: 61, sep: 72, method: [91, 107], body: [131, 148, 165, 182] },
  frame: [330, 1, 509, 256],
  title: [346, 25],
  field: [346, 58],
  doors: {
    1: [{ box: [318, 86, 242, 32], lines: ['public List<WindTurbine> turbines'] }],
    2: [{ box: [318, 86, 242, 32], lines: ['WindTurbine GetTurbine(string id)'] }],
    3: [
      { box: [318, 86, 283, 32], lines: ['void SetMaxSpeed(string tag, int speed)'] },
      { box: [318, 128, 297, 32], lines: ['void SetLocation(string tag, Coord coord)'] },
    ],
  },
  list: [660, 40, 168, 170],
  listHead: [670, 59],
  chips: [
    [670, 70, 148, 52],
    [670, 132, 148, 28],
    [670, 170, 148, 28],
  ],
  chipText: [21, 40],
  empty: [744, 140],
  note: { x: 660, y: 230, lines: ['… = andre turbiner', '(illustrativt)'] },
  clear: { d: 'M196 127 C255 127 262 102 318 102 L654 102', tip: [659, 102], dir: 'r' },
  ref: {
    d: 'M668 96 C640 96 630 102 600 102 L318 102 C262 102 256 127 200 127',
    tip: [669, 96],
    dir: 'r',
    dot: [199, 127],
    label: [257, 143],
    anchor: 'middle',
  },
  inner: { d: 'M601 102 C630 102 640 96 664 96', tip: [669, 96], dir: 'r' },
  token2: [
    [110, 127],
    [276, 102],
  ],
  token3: [
    [110, 144],
    [255, 102],
  ],
  marker: { x: 346, y: 188, lines: [<>her kan {TM} kontrollere værdien</>] },
}

const NARROW: Geo = {
  vb: [300, 440],
  font: 11.5,
  lh: 17,
  client: [0, 0, 300, 150],
  clientText: { x: 10, head: 21, sep: 32, method: [50, 66], body: [89, 106, 123, 140] },
  frame: [8, 214, 291, 222],
  title: [44, 276],
  field: [44, 296],
  doors: {
    1: [{ box: [18, 200, 188, 40], lines: ['public List<WindTurbine>', 'turbines'] }],
    2: [{ box: [18, 200, 182, 40], lines: ['WindTurbine GetTurbine(', 'string id)'] }],
    3: [
      { box: [16, 200, 138, 54], lines: ['void SetMaxSpeed(', 'string tag,', 'int speed)'] },
      { box: [160, 200, 138, 54], lines: ['void SetLocation(', 'string tag,', 'Coord coord)'] },
    ],
  },
  list: [16, 336, 276, 72],
  listHead: [44, 352],
  chips: [
    [26, 362, 150, 40],
    [184, 362, 46, 40],
    [238, 362, 46, 40],
  ],
  chipText: [16, 33],
  empty: [154, 390],
  note: { x: 16, y: 426, lines: ['… = andre turbiner (illustrativt)'] },
  clear: { d: 'M32 150 V330', tip: [32, 335], dir: 'd' },
  ref: { d: 'M32 358 V156', tip: [32, 361], dir: 'd', dot: [32, 153], label: [42, 172], anchor: 'start' },
  inner: { d: 'M32 254 V356', tip: [32, 361], dir: 'd' },
  token2: [
    [120, 89],
    [66, 180],
  ],
  token3: [
    [110, 106],
    [88, 180],
  ],
  marker: { x: 44, y: 316, lines: [<>her kan {TM}</>, 'kontrollere værdien'] },
}

const head = ([x, y]: P, dir: 'r' | 'd') =>
  dir === 'r' ? `M${x} ${y} L${x - 9} ${y - 5} L${x - 9} ${y + 5} Z` : `M${x} ${y} L${x - 5} ${y - 9} L${x + 5} ${y - 9} Z`

const show = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

const draw = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 },
  transition: on ? { pathLength: { ...t.travel, delay }, opacity: { duration: 0.01, delay } } : t.fade,
})

/* --------------------------------- Scenen -------------------------------- */

function Token({ from, to, run, stay, label, tone, width }: { from: P; to: P; run: boolean; stay: boolean; label: string; tone: 'neg' | 'focus'; width: number }) {
  // Kaldet rejser fra klientens kodelinje til døren. `stay`: bliver ved grænsen.
  const h = 22
  return (
    <motion.g
      className="ooe-token"
      data-tone={tone}
      initial={false}
      animate={
        run
          ? { x: [from[0], to[0]], y: [from[1], to[1]], opacity: stay ? [1, 1] : [1, 1, 0] }
          : { x: from[0], y: from[1], opacity: 0 }
      }
      transition={
        run
          ? { x: t.launch, y: t.launch, opacity: stay ? { duration: 0.01 } : { duration: 1.25, times: [0, 0.8, 1] } }
          : t.fade
      }
    >
      <rect x={-width / 2} y={-h / 2} width={width} height={h} rx={h / 2} />
      <text x={0} y={4}>
        {label}
      </text>
    </motion.g>
  )
}

function DoorBox({ door, on, tone, delay = 0 }: { door: Door; on: boolean; tone: 'idle' | 'neg' | 'focus'; delay?: number }) {
  const [x, y, w, h] = door.box
  const n = door.lines.length
  const top = y + h / 2 - ((n - 1) * 14) / 2 + 4
  return (
    <motion.g
      className="ooe-door"
      data-tone={tone}
      initial={false}
      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.94 }}
      transition={on ? { ...t.place, delay } : t.fade}
      aria-hidden={!on || undefined}
    >
      <rect x={x} y={y} width={w} height={h} rx={3} />
      {door.lines.map((l, i) => (
        <text key={i} x={x + 7} y={top + i * 14}>
          {l}
        </text>
      ))}
    </motion.g>
  )
}

function Scene({ g, step, variant }: { g: Geo; step: number; variant: 'wide' | 'narrow' }) {
  const ver: Ver = step <= 1 ? 1 : step <= 3 ? 2 : 3
  const hot = hotLines(step)
  const cleared = step === 1
  const refOn = step === 2 || step === 3
  const pwnd = step === 3
  const [fx, fy, fw, fh] = g.frame
  const [lx, ly, lw, lh] = g.list
  const [cx, cy, cw, ch] = g.client

  return (
    <svg className={`ooe-svg ooe-${variant}`} viewBox={`0 0 ${g.vb[0]} ${g.vb[1]}`} style={{ fontSize: g.font }} aria-hidden="true">
      {/* TurbineManager: rammen er klassens grænse. */}
      <rect className="ooe-frame" x={fx} y={fy} width={fw} height={fh} rx={8} />
      <text className="ooe-title" x={g.title[0]} y={g.title[1]}>
        TurbineManager
      </text>
      <motion.text className="ooe-field" x={g.field[0]} y={g.field[1]} {...show(ver >= 2, 0.2)}>
        <tspan className="ooe-kw">private</tspan> List&lt;WindTurbine&gt; turbines
      </motion.text>

      {/* Listen og turbinerne */}
      <rect className="ooe-list" data-tone={cleared ? 'neg' : undefined} x={lx} y={ly} width={lw} height={lh} rx={5} />
      <text className="ooe-list-head" x={g.listHead[0]} y={g.listHead[1]}>
        List&lt;WindTurbine&gt;
      </text>
      <motion.text className="ooe-empty" x={g.empty[0]} y={g.empty[1]} textAnchor="middle" {...show(cleared, 1.3)}>
        tom
      </motion.text>
      {g.chips.map((c, i) => {
        const [x, y, w, h] = c
        const a = i === 0
        return (
          <motion.g
            key={i}
            className="ooe-chip"
            data-tone={a && pwnd ? 'neg' : undefined}
            initial={false}
            animate={{ opacity: cleared ? 0 : 1, scale: cleared ? 0.9 : 1 }}
            transition={cleared ? { ...t.recede, delay: 0.85 + i * 0.1 } : stagger(i, 0.1)}
          >
            <rect x={x} y={y} width={w} height={h} rx={4} />
            {a ? (
              <>
                <motion.text className="ooe-chip-t" x={x + 10} y={y + g.chipText[0]} {...show(!pwnd)}>
                  Id = "A323"
                </motion.text>
                <motion.text className="ooe-chip-t is-neg" x={x + 10} y={y + g.chipText[0]} {...show(pwnd, 0.35)}>
                  Id = "PWND"
                </motion.text>
                <motion.text className="ooe-chip-t is-neg" x={x + 10} y={y + g.chipText[1]} {...show(pwnd, 1.5)}>
                  MaxSpeed = -1000
                </motion.text>
              </>
            ) : (
              <text className="ooe-chip-t is-anon" x={x + w / 2} y={y + h / 2 + 4} textAnchor="middle">
                …
              </text>
            )}
          </motion.g>
        )
      })}
      {g.note.lines.map((l, i) => (
        <text key={i} className="ooe-note" x={g.note.x} y={g.note.y + i * 15}>
          {l}
        </text>
      ))}

      {/* V1: klienten rækker direkte ind i listen. */}
      <g className="ooe-arrow" data-tone="neg">
        <motion.path className="ooe-path" d={g.clear.d} {...draw(step === 1)} />
        <motion.path className="ooe-tip" d={head(g.clear.tip, g.clear.dir)} {...show(step === 1, 0.7)} />
      </g>

      {/* V2: en reference kommer ud af klassen. Tynd linje med prik hos klienten. */}
      <g className="ooe-ref">
        <motion.path className="ooe-path" d={g.ref.d} {...draw(refOn, step === 2 ? 1.1 : 0)} />
        <motion.path className="ooe-tip" d={head(g.ref.tip, g.ref.dir)} {...show(refOn, step === 2 ? 1.1 : 0)} />
        <motion.circle className="ooe-dot" cx={g.ref.dot[0]} cy={g.ref.dot[1]} r={3.5} {...show(refOn, step === 2 ? 1.85 : 0)} />
        <motion.text className="ooe-ref-label" x={g.ref.label[0]} y={g.ref.label[1]} textAnchor={g.ref.anchor} {...show(refOn, step === 2 ? 1.9 : 0)}>
          reference
        </motion.text>
      </g>

      {/* V3: manageren rører selv turbinen. */}
      <g className="ooe-arrow" data-tone="focus">
        <motion.path className="ooe-path" d={g.inner.d} {...draw(step === 4, 1.05)} />
        <motion.path className="ooe-tip" d={head(g.inner.tip, g.inner.dir)} {...show(step === 4, 1.7)} />
      </g>
      <motion.text className="ooe-marker" x={g.marker.x} y={g.marker.y} {...show(step === 4, 1.6)}>
        {g.marker.lines.map((l, i) => (
          <tspan key={i} x={g.marker.x} dy={i === 0 ? 0 : '1.3em'}>
            {l}
          </tspan>
        ))}
      </motion.text>

      {/* Dørene: det offentlige, der sidder i grænsen. */}
      {g.doors[1].map((d, i) => (
        <DoorBox key={`1-${i}`} door={d} on={ver === 1} tone={step === 1 ? 'neg' : 'idle'} />
      ))}
      {g.doors[2].map((d, i) => (
        <DoorBox key={`2-${i}`} door={d} on={ver === 2} tone={step >= 2 && step <= 3 ? 'neg' : 'idle'} delay={0.1} />
      ))}
      {g.doors[3].map((d, i) => (
        <DoorBox key={`3-${i}`} door={d} on={ver === 3} tone={i === 0 && step === 4 ? 'focus' : 'idle'} delay={0.1 + i * 0.08} />
      ))}

      {/* EvilClient */}
      <rect className="ooe-client" x={cx} y={cy} width={cw} height={ch} rx={5} />
      <text className="ooe-client-name" x={cx + g.clientText.x} y={g.clientText.head}>
        EvilClient
      </text>
      <line className="ooe-sep" x1={cx} x2={cx + cw} y1={g.clientText.sep} y2={g.clientText.sep} />
      {([1, 2, 3] as Ver[]).map((v) => (
        <motion.g key={v} {...show(v === ver, v === ver ? 0.15 : 0)}>
          {CLIENT[v].method.map((m, i) => (
            <text key={`m${i}`} className="ooe-method" x={cx + g.clientText.x} y={g.clientText.method[i]}>
              {m}
            </text>
          ))}
          {CLIENT[v].body.map((b, i) => {
            const on = v === ver && hot.lines.includes(i)
            return (
              <text
                key={`b${i}`}
                className="ooe-line"
                data-tone={on ? hot.tone : undefined}
                x={cx + g.clientText.x}
                y={g.clientText.body[i]}
                style={{ transitionDelay: on && step === 3 && i >= 2 ? '1.1s' : undefined }}
              >
                {b}
              </text>
            )
          })}
        </motion.g>
      ))}

      {/* Kald som rejsende tokens */}
      <Token from={g.token2[0]} to={g.token2[1]} run={step === 2} stay={false} label={'("A323")'} tone="neg" width={74} />
      <Token from={g.token3[0]} to={g.token3[1]} run={step === 4} stay label={'("A323", -1000)'} tone="focus" width={120} />
    </svg>
  )
}

/* ------------------------------- Slutrammen ------------------------------ */

type Bit = string | { code: string }
const c = (code: string): Bit => ({ code })
const SUMMARY: { v: string; face: Bit[]; attack: Bit[]; crossed: string; tone: 'neg' | 'focus' }[] = [
  { v: 'Version 1', face: [c('public List<WindTurbine> turbines')], attack: [c('tm.turbines.Clear()')], crossed: 'selve listen', tone: 'neg' },
  {
    v: 'Version 2',
    face: [c('private'), ' felt + ', c('GetTurbine(string id)')],
    attack: [c('Id = "PWND"'), ', ', c('MaxSpeed = -1000')],
    crossed: 'en reference til objektet',
    tone: 'neg',
  },
  {
    v: 'Version 3',
    face: [c('SetMaxSpeed'), ', ', c('SetLocation')],
    attack: [c('SetMaxSpeed("A323", -1000)')],
    crossed: 'kun et kald',
    tone: 'focus',
  },
]

/** Korte kodestykker holdes samlet; lange brydes kun efter parentes og komma. */
const bits = (b: Bit[]) =>
  b.map((x, i) =>
    typeof x === 'string' ? (
      <Fragment key={i}>{x}</Fragment>
    ) : (
      <code key={i} className={x.code.length <= 20 ? 'is-nw' : undefined}>
        {brk(x.code)}
      </code>
    ),
  )

function Summary({ on }: { on: boolean }) {
  return (
    <div className="ooe-sum">
      {SUMMARY.map((s, i) => (
        <motion.section
          key={s.v}
          className="ooe-col"
          data-tone={s.tone}
          initial={false}
          animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
          transition={on ? stagger(i, 0.15, 0.12) : t.fade}
        >
          <div className="ooe-col-head">{s.v}</div>
          <dl>
            <dt>Grænseflade</dt>
            <dd>{bits(s.face)}</dd>
            <dt>Angreb</dt>
            <dd>{bits(s.attack)}</dd>
            <dt>Krydser grænsen</dt>
            <dd className="ooe-crossed">{s.crossed}</dd>
          </dl>
        </motion.section>
      ))}
    </div>
  )
}

function OoGrundbegreber({ step }: { step: number }) {
  const final = step >= 5
  return (
    <div className="ooe">
      <Swap
        show={final ? 1 : 0}
        items={[
          <div className="ooe-scene" key="scene">
            <Scene g={WIDE} step={step} variant="wide" />
            <Scene g={NARROW} step={step} variant="narrow" />
          </div>,
          <Summary key="sum" on={final} />,
        ]}
      />
    </div>
  )
}

const viz: VizDef = {
  id: 'oo-grundbegreber',
  title: 'Evil client mod tre versioner af TurbineManager',
  steps: [
    {
      caption: '`TurbineManager` holder en liste af `WindTurbine`. Hvad kan en ond klient gøre gennem klassens grænseflade?',
      hold: 2400,
    },
    {
      caption: 'Version 1: listen er `public`. `tm.turbines.Clear()` tømmer den — klienten ejer managerens data.',
      hold: 2800,
    },
    {
      caption: 'Version 2: feltet er `private`, men `GetTurbine` udleverer selve objektet — en reference ind i klassen.',
      hold: 3000,
    },
    {
      caption: 'Klienten sætter `Id = "PWND"` og `MaxSpeed = -1000`. Ændringen rammer objektet inde i manageren.',
      hold: 3000,
    },
    {
      caption:
        'Version 3: kun operationer, ingen objekter ud. Kaldet `SetMaxSpeed("A323", -1000)` går gennem `TurbineManager` — det eneste sted, der rører turbinen, og stedet en kontrol kan ligge.',
      hold: 3200,
    },
    {
      caption: 'Encapsulation er det, der *ikke* krydser grænsen. Et privat felt er ikke nok, hvis de interne objekter udleveres.',
      hold: 3000,
    },
  ],
  Component: OoGrundbegreber,
}

export default viz
