import { motion } from 'motion/react'
import { useId } from 'react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { t } from '../kit/motion'
import './dip.css'

/* swd/kilder/uge-03_solid-lsp-isp-dip/SOLID - ID.pdf
   s. 15–16: DIP A og B (citeret i bundlinjen).
   s. 22: High-level = ECS, temperaturregulator; low-level = varmer, vindue, sensor/aktuator.
   s. 25: ECS → Temperature Sensor HW, Window Actuator HW, Heater HW ("the dependencies are
   inverted – high-level modules depend on low-level ones").
   s. 29: klassediagrammet i tre niveauer (High/Mid/Low-level) med ITemperatureSensor,
   ECS, ITemperatureRegulator, TemperatureRegulator, IWindow, IHeater, TemperatureSensor,
   Window, Heater og tre grupper mærket "DIP". Navnene brydes som på sliden
   ("ITemperature-Regulator").
   s. 28: "care about what to do, not how to do it". s. 32 stiller spørgsmålet om at skifte
   HW; svaret i sidste trin er afledt af diagrammet. "ny varmer-HW" er illustrativt.
   Afvigelse: den røde DIP-gruppe omfatter her både vindue og varmer (sliden ringer kun
   TemperatureRegulator, IWindow og Window ind; emneteksten siger "vindue/varmer"). */

type P = [number, number]
type Dir = 'up' | 'down' | 'left' | 'right'
type G = 'g' | 'b' | 'r'
type Id = 'its' | 'ecs' | 'itr' | 'tr' | 'iwin' | 'iheat' | 'ts' | 'win' | 'heat'

interface Cls {
  lines: string[]
  stereo?: boolean
  ops: string[]
  /** Navn før abstraktionerne (HW-boksene på s. 25). */
  hw?: string[]
  groups: G[]
}

const CLS: Record<Id, Cls> = {
  its: { lines: ['ITemperature-', 'Sensor'], stereo: true, ops: ['+ GetTemp()'], groups: ['g'] },
  ecs: { lines: ['ECS'], ops: ['+ Regulate()'], groups: ['g', 'b'] },
  itr: { lines: ['ITemperature-', 'Regulator'], stereo: true, ops: ['+ IncreaseTemp()', '+ DecreaseTemp()', '+ MaintainTemp()'], groups: ['b'] },
  tr: { lines: ['Temperature-', 'Regulator'], ops: ['+ IncreaseTemp()', '+ DecreaseTemp()', '+ MaintainTemp()'], groups: ['b', 'r'] },
  iwin: { lines: ['IWindow'], stereo: true, ops: ['+ Open()', '+ Close()'], groups: ['r'] },
  iheat: { lines: ['IHeater'], stereo: true, ops: ['+ Start()', '+ Stop()'], groups: ['r'] },
  ts: { lines: ['Temperature-', 'Sensor'], ops: ['+ GetTemp()'], hw: ['Temperature', 'Sensor HW'], groups: ['g'] },
  win: { lines: ['Window'], ops: ['+ Open()', '+ Close()'], hw: ['Window', 'Actuator HW'], groups: ['r'] },
  heat: { lines: ['Heater'], ops: ['+ Start()', '+ Stop()'], hw: ['Heater HW'], groups: ['r'] },
}

const nameH = (c: Cls) => 12 + (c.stereo ? 14 : 0) + c.lines.length * 15
const boxH = (c: Cls) => nameH(c) + 8 + c.ops.length * 16

/* ------------------------------ Streger --------------------------------- */

const clean = (s: string) => 'dip' + s.replace(/[^a-zA-Z0-9_-]/g, '')

function Draw({ d, on, dashed, delay = 0, hot, neg, className }: { d: string; on: boolean; dashed?: boolean; delay?: number; hot?: boolean; neg?: boolean; className?: string }) {
  const id = clean(useId())
  const tr = on ? { ...t.travel, duration: 0.7, delay } : t.recede
  const cls = `dip-line${dashed ? ' is-dash' : ''} ${className ?? ''}`
  const anim = { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }
  const trans = { pathLength: tr, opacity: on ? { duration: 0.01, delay } : { ...t.fade, delay: 0.45 } }
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

function Head({ p, dir, kind, on, delay = 0, hot, neg }: { p: P; dir: Dir; kind: 'open' | 'tri'; on: boolean; delay?: number; hot?: boolean; neg?: boolean }) {
  const d = kind === 'open' ? 'M-9 -5 L0 0 L-9 5' : 'M0 0 L-12 -7 L-12 7 Z'
  return (
    <motion.path
      className={kind === 'open' ? 'dip-open' : 'dip-tri'}
      data-hot={hot || undefined}
      data-neg={neg || undefined}
      d={d}
      transform={`translate(${p[0]} ${p[1]}) rotate(${ROT[dir]})`}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={on ? { ...t.fade, delay: delay + 0.55 } : { ...t.fade, delay: 0.3 }}
    />
  )
}

/* ------------------------------- Klasser -------------------------------- */

type Tone = 'idle' | 'focus' | 'neg' | 'ok'

function Box({ id, x, y, w, show, hwMode, tone, strips, mark }: { id: Id; x: number; y: number; w: number; show: boolean; hwMode: boolean; tone: Tone; strips: boolean; mark: boolean }) {
  const c = CLS[id]
  const nh = nameH(c)
  const h = boxH(c)
  const cx = x + w / 2
  return (
    <motion.g
      className="dip-cls"
      data-tone={tone}
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.94 }}
      transition={show ? { ...t.place, delay: 0.35 } : t.fade}
      aria-hidden={!show || undefined}
    >
      <rect x={x} y={y} width={w} height={h} />
      {strips &&
        c.groups.map((g, i) => (
          <motion.rect
            key={g}
            className="dip-strip"
            data-g={g}
            x={x}
            y={y + (h / c.groups.length) * i}
            width={4}
            height={h / c.groups.length}
            initial={false}
            animate={{ opacity: hwMode ? 0 : 1 }}
          />
        ))}
      {/* HW-boksen fra s. 25 */}
      {c.hw && (
        <motion.g initial={false} animate={{ opacity: hwMode ? 1 : 0 }} transition={t.fade}>
          {c.hw.map((l, i) => (
            <text key={l} className="dip-hw" x={cx} y={y + h / 2 + 4 - ((c.hw!.length - 1) * 16) / 2 + i * 16}>
              {l}
            </text>
          ))}
        </motion.g>
      )}
      <motion.g initial={false} animate={{ opacity: hwMode ? 0 : 1 }} transition={hwMode ? t.fade : { ...t.fade, delay: 0.3 }}>
        {c.stereo && (
          <text className="dip-stereo" x={cx} y={y + 17}>
            «interface»
          </text>
        )}
        {c.lines.map((l, i) => (
          <text key={l} className="dip-cname" x={cx} y={y + 6 + (c.stereo ? 14 : 0) + 12 + i * 15}>
            {l}
          </text>
        ))}
      </motion.g>
      <motion.g
        className="dip-mark"
        initial={false}
        animate={{ opacity: mark ? 1 : 0, scale: mark ? 1 : 0.5 }}
        transition={mark ? { ...t.place, delay: 0.4 } : t.fade}
      >
        <circle cx={x + w} cy={y} r={8.5} />
        <text x={x + w} y={y + 4.5}>
          ✓
        </text>
      </motion.g>
      {/* ops-compartment: tomt i ECS før, fyldes ved trin 2 */}
      <motion.g initial={false} animate={{ opacity: hwMode ? 0 : 1 }} transition={hwMode ? t.fade : { ...t.fade, delay: 0.3 }}>
        <line x1={x} x2={x + w} y1={y + nh} y2={y + nh} />
        {c.ops.map((o, i) => (
          <text key={o} className="dip-op" x={x + 8} y={y + nh + 16 + i * 16}>
            {o}
          </text>
        ))}
      </motion.g>
    </motion.g>
  )
}

/** Lille mærke på en bokskant ("uændret", "ændring"). */
function Badge({ x, y, text, on, tone, delay = 0 }: { x: number; y: number; text: string; on: boolean; tone: 'neg' | 'ok' | 'focus'; delay?: number }) {
  const w = text.length * 6.1 + 12
  return (
    <motion.g
      className="dip-badge"
      data-tone={tone}
      initial={false}
      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.85 }}
      transition={on ? { ...t.place, delay } : t.fade}
    >
      <rect x={x - w} y={y - 8.5} width={w} height={17} rx={8.5} />
      <text x={x - w / 2} y={y + 4}>
        {text}
      </text>
    </motion.g>
  )
}

/* ------------------------------- Layouts -------------------------------- */

interface Rel {
  d: string
  end: P
  dir: Dir
}
interface Layout {
  vb: [number, number]
  narrow?: boolean
  box: Record<Id, [number, number, number]>
  levels: { name: string; at: P }[]
  seps: number[]
  before: Rel[] // ECS → HW (sensor, vindue, varmer)
  wave: string // ændringen fra Heater HW op til ECS
  ecsIts: Rel
  ecsItr: Rel
  real: Rel[] // ts, tr, win, heat
  trWin: Rel
  trHeat: Rel
  rings?: { g: G; r: [number, number, number, number]; label: P; anchor: 'start' | 'end' }[]
  heatBadge: P
}

const C = [38, 192, 346, 500, 654]
const W = 130

const WIDE: Layout = {
  vb: [800, 432],
  box: {
    its: [C[0], 52, W],
    ecs: [C[1], 52, W],
    itr: [C[2], 52, W],
    tr: [C[2], 202, W],
    iwin: [C[3], 202, W],
    iheat: [C[4], 202, W],
    ts: [C[0], 332, W],
    win: [C[3], 332, W],
    heat: [C[4], 332, W],
  },
  levels: [
    { name: 'High-level', at: [14, 108] },
    { name: 'Mid-level', at: [14, 251] },
    { name: 'Low-level', at: [14, 366] },
  ],
  seps: [183, 316],
  before: [103, 565, 719].map((x) => ({ d: `M257 104 V124 H${x} V332`, end: [x, 332] as P, dir: 'down' as Dir })),
  wave: 'M719 332 V124 H257 V104',
  ecsIts: { d: 'M192 78 H168', end: [168, 78], dir: 'left' },
  ecsItr: { d: 'M322 78 H346', end: [346, 78], dir: 'right' },
  real: [
    { d: 'M103 332 V144', end: [103, 132], dir: 'up' },
    { d: 'M411 202 V176', end: [411, 164], dir: 'up' },
    { d: 'M565 332 V295', end: [565, 283], dir: 'up' },
    { d: 'M719 332 V295', end: [719, 283], dir: 'up' },
  ],
  trWin: { d: 'M476 242 H500', end: [500, 242], dir: 'right' },
  trHeat: { d: 'M455 202 V189 H719 V202', end: [719, 202], dir: 'down' },
  rings: [
    { g: 'g', r: [28, 30, 302, 390], label: [40, 30], anchor: 'start' },
    { g: 'b', r: [184, 38, 300, 270], label: [478, 38], anchor: 'end' },
    { g: 'r', r: [338, 195, 454, 225], label: [350, 420], anchor: 'start' },
  ],
  heatBadge: [784, 409],
}

const NARROW: Layout = {
  vb: [300, 592],
  narrow: true,
  box: {
    ecs: [100, 22, 100],
    its: [0, 100, 108],
    itr: [172, 100, 128],
    tr: [172, 252, 128],
    iwin: [118, 382, 86],
    iheat: [214, 382, 86],
    ts: [4, 502, 100],
    win: [118, 502, 86],
    heat: [214, 502, 86],
  },
  levels: [
    { name: 'High-level', at: [0, 12] },
    { name: 'Mid-level', at: [0, 242] },
    { name: 'Low-level', at: [0, 492] },
  ],
  seps: [226, 476],
  before: [54, 161, 257].map((x) => ({ d: `M150 74 V86 H${x} V502`, end: [x, 502] as P, dir: 'down' as Dir })),
  wave: 'M257 502 V86 H150 V74',
  ecsIts: { d: 'M100 48 H54 V100', end: [54, 100], dir: 'down' },
  ecsItr: { d: 'M200 48 H236 V100', end: [236, 100], dir: 'down' },
  real: [
    { d: 'M54 502 V192', end: [54, 180], dir: 'up' },
    { d: 'M236 252 V224', end: [236, 212], dir: 'up' },
    { d: 'M161 502 V475', end: [161, 463], dir: 'up' },
    { d: 'M257 502 V475', end: [257, 463], dir: 'up' },
  ],
  trWin: { d: 'M200 350 V366 H161 V382', end: [161, 382], dir: 'down' },
  trHeat: { d: 'M257 350 V382', end: [257, 382], dir: 'down' },
  heatBadge: [298, 581],
}

const UNCHANGED: Id[] = ['ecs', 'tr', 'iheat']

const G_NAME: Record<G, string> = { g: 'sensor', b: 'regulator', r: 'vindue/varmer' }

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const hw = step < 2
  const abs = at(step, 2)
  const inv = at(step, 3)
  const rings = at(step, 4)
  const fin = step === 5
  const tone = (id: Id): Tone => {
    if (fin && UNCHANGED.includes(id)) return 'ok'
    if (id === 'ecs') return step === 1 ? 'neg' : 'idle'
    if (id === 'heat') return step === 1 ? 'neg' : fin ? 'focus' : 'idle'
    if (id === 'its' || id === 'itr') return step === 2 ? 'focus' : 'idle'
    return 'idle'
  }
  const show = (id: Id) => abs || id === 'ecs' || !!CLS[id].hw
  const [ecsX, ecsY, ecsW] = L.box.ecs

  return (
    <svg className={`dip-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} aria-hidden="true">
      {L.seps.map((y) => (
        <line key={y} className="dip-sep" x1={L.narrow ? 0 : 30} x2={L.vb[0]} y1={y} y2={y} />
      ))}
      {L.levels.map((lv, i) => (
        <motion.text
          key={lv.name}
          className="dip-level"
          textAnchor={L.narrow ? 'start' : 'middle'}
          transform={L.narrow ? undefined : `rotate(-90 ${lv.at[0]} ${lv.at[1]})`}
          x={lv.at[0]}
          y={lv.at[1] + (L.narrow ? 0 : 4)}
          initial={false}
          animate={{ opacity: i === 1 && !abs ? 0 : 1 }}
          transition={t.fade}
        >
          {lv.name}
        </motion.text>
      ))}

      {/* DIP-grupperne (s. 29) */}
      {L.rings?.map((rg) => (
        <motion.g
          key={rg.g}
          className="dip-ring"
          data-g={rg.g}
          initial={false}
          animate={{ opacity: rings ? 1 : 0 }}
          transition={rings ? { ...t.fade, delay: rg.g === 'g' ? 0 : rg.g === 'b' ? 0.25 : 0.5 } : t.fade}
        >
          <rect x={rg.r[0]} y={rg.r[1]} width={rg.r[2]} height={rg.r[3]} rx={16} />
          <rect className="dip-ring-chip" x={rg.anchor === 'start' ? rg.label[0] - 4 : rg.label[0] - 30} y={rg.label[1] - 8} width={34} height={16} rx={3} />
          <text x={rg.anchor === 'start' ? rg.label[0] + 13 : rg.label[0] - 13} y={rg.label[1] + 4.5}>
            DIP
          </text>
        </motion.g>
      ))}

      {/* Før: ECS peger direkte ned på hardwaren. */}
      {L.before.map((r, i) => (
        <g key={r.d}>
          <Draw d={r.d} on={hw} neg={step === 1} delay={0} />
          <Head p={r.end} dir={r.dir} kind="open" on={hw} neg={step === 1} />
          {i === 2 && <Draw d={L.wave} on={step === 1} className="dip-wave" delay={0.5} />}
        </g>
      ))}

      {/* Efter: ECS kender kun de to interfaces. */}
      <Draw d={L.ecsIts.d} on={abs} delay={0.7} hot={step === 2} />
      <Head p={L.ecsIts.end} dir={L.ecsIts.dir} kind="open" on={abs} delay={0.7} hot={step === 2} />
      <Draw d={L.ecsItr.d} on={abs} delay={0.8} hot={step === 2} />
      <Head p={L.ecsItr.end} dir={L.ecsItr.dir} kind="open" on={abs} delay={0.8} hot={step === 2} />

      {/* Inversionen: realiseringer tegnes nedefra og op. */}
      {L.real.map((r, i) => (
        <g key={r.d}>
          <Draw d={r.d} on={inv} dashed delay={0.15 * i} hot={step === 3} />
          <Head p={r.end} dir="up" kind="tri" on={inv} delay={0.15 * i} hot={step === 3} />
        </g>
      ))}
      <Draw d={L.trWin.d} on={inv} delay={0.8} hot={step === 3} />
      <Head p={L.trWin.end} dir={L.trWin.dir} kind="open" on={inv} delay={0.8} hot={step === 3} />
      <Draw d={L.trHeat.d} on={inv} delay={0.9} hot={step === 3} />
      <Head p={L.trHeat.end} dir={L.trHeat.dir} kind="open" on={inv} delay={0.9} hot={step === 3} />

      {(Object.keys(CLS) as Id[]).map((id) => {
        const [x, y, w] = L.box[id]
        return <Box key={id} id={id} x={x} y={y} w={w} show={show(id)} hwMode={hw && (!!CLS[id].hw || id === 'ecs')} tone={tone(id)} strips={!!L.narrow && rings} mark={fin && UNCHANGED.includes(id)} />
      })}
      {/* ECS-navnet står også før trin 2 (uden operation). */}
      <motion.text className="dip-cname" x={ecsX + ecsW / 2} y={ecsY + 30} initial={false} animate={{ opacity: hw ? 1 : 0 }} transition={t.fade}>
        ECS
      </motion.text>

      <Badge x={L.heatBadge[0]} y={L.heatBadge[1]} text="Δ ændring" on={step === 1} tone="neg" />
      <Badge x={L.heatBadge[0]} y={L.heatBadge[1]} text="Δ ny varmer-HW" on={fin} tone="focus" />
    </svg>
  )
}

function Dip({ step }: { step: number }) {
  return (
    <div className="dip">
      <Diagram L={WIDE} step={step} className="dip-wide" />
      <Diagram L={NARROW} step={step} className="dip-narrow" />
      <motion.ul className="dip-legend" initial={false} animate={{ opacity: at(step, 4) ? 1 : 0 }} transition={t.fade}>
        {(['g', 'b', 'r'] as G[]).map((g) => (
          <li key={g} data-g={g}>
            DIP: {G_NAME[g]}
          </li>
        ))}
      </motion.ul>
      <motion.div className="dip-quote" initial={false} animate={{ opacity: step === 5 ? 1 : 0 }} transition={step === 5 ? { ...t.fade, delay: 0.6 } : t.fade}>
        <p className="dip-key">
          <span data-k="ok">✓ uændret</span>
          <span data-k="chg">Δ ny varmer-HW</span>
          <span className="dip-key-note">illustrativt: svaret på s. 32 er afledt af diagrammet</span>
        </p>
        <p>
          <b>A:</b> “High-level modules should not depend on low-level modules. Both should depend on abstractions.”
        </p>
        <p>
          <b>B:</b> “Abstractions should not depend on details. Details should depend on abstractions.”
        </p>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'dip',
  title: 'ECS vender pilene med interfaces',
  steps: [
    { caption: 'Før: `ECS` implementerer politikken, men afhænger direkte af hardwaren.', hold: 2400 },
    { caption: 'High-level afhænger af low-level. Skifter varmeren, skal `ECS` ændres.', hold: 2800 },
    { caption: '`ECS` kender kun `ITemperatureSensor` og `ITemperatureRegulator`.', hold: 2800 },
    { caption: 'Nu peger detaljerne op på abstraktionerne. Det er inversionen.', hold: 3000 },
    { caption: 'Tre steder afhænger både bruger og detalje af en abstraktion.', hold: 2400 },
    { caption: 'En ny varmer rører kun `Heater`. `ECS` bestemmer *hvad*, ikke *hvordan*.', hold: 3000 },
  ],
  Component: Dip,
}

export default viz
