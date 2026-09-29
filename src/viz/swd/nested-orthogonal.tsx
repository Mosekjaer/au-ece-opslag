import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './nested-orthogonal.css'

/* Patterns - NestedOrthogonal - Copy.pdf (W08b): PDF s. 2 (stm Flashlight [Power modes]
   og klassehierarkiet FlashLight —_state→ FlashLightState; Off, On; Low og High arver On),
   s. 3 (stm Flashlight [Power modes + color control]: ON delt af en stiplet linje,
   White —COLOR→ Red —COLOR→ Green —COLOR→ White), s. 4 (de to strategier: kollaps til
   seks tilstande eller to maskiner) og s. 5 (FlashLight —_intensityState→ IntensityState,
   —_colorState→ ColorState, med Off, On → Low, High og Off, On → Red, Green, White).
   Samme nested diagram i Patterns - State.pdf s. 13. Markdown: swd/markdown/slides/
   SW4SWD-01_W08b_State_Nested_Orthogonal.md, afsnit 1–2. Klassediagrammerne viser
   kun de operationer, der er nævnt i emnet; FlashLights egne operationer og (på s. 5)
   subklassernes operationer er udeladt. Ingen sluttilstand og ingen entry/exit i
   diagrammet, som på slidet. */

type P2 = [number, number]
type Dir = 'up' | 'down' | 'left' | 'right'
type B = [number, number, number, number]

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
const tri = ([x, y]: P2, a = 11, b = 7) => `M${x} ${y} L${x + b} ${y + a} L${x - b} ${y + a} Z`

/* ------------------------------- Diagrammet ------------------------------- */

type St = 'off' | 'low' | 'high' | 'white' | 'red' | 'green'
type Tr = 'init' | 'pwrIn' | 'pwrOut' | 'upInit' | 'm1' | 'm2' | 'lowInit' | 'c1' | 'c2' | 'c3'
interface TrL {
  d: string
  end: P2
  dir: Dir
  label?: { x: number; y: number; t: string; anchor?: 'start' | 'middle' | 'end' }
  dot?: P2
}
interface StmL {
  vb: [number, number]
  frame: B
  states: Record<St, B>
  on: { x: number; y: number; w: number; h0: number; h1: number; nameY: number; lineY: number }
  sep: number
  tr: Record<Tr, TrL>
}

const STM_WIDE: StmL = {
  vb: [430, 286],
  frame: [2, 2, 426, 280],
  states: {
    off: [16, 86, 64, 32],
    low: [196, 84, 76, 28],
    high: [332, 84, 76, 28],
    white: [196, 166, 76, 28],
    green: [332, 166, 76, 28],
    red: [262, 226, 76, 28],
  },
  on: { x: 130, y: 36, w: 294, h0: 114, h1: 236, nameY: 49, lineY: 62 },
  sep: 150,
  tr: {
    init: { dot: [48, 52], d: 'M48 58 V86', end: [48, 86], dir: 'down' },
    pwrIn: { d: 'M80 96 H130', end: [130, 96], dir: 'right', label: { x: 105, y: 87, t: 'PWR' } },
    pwrOut: { d: 'M130 110 H80', end: [80, 110], dir: 'left', label: { x: 105, y: 122, t: 'PWR' } },
    upInit: { dot: [156, 98], d: 'M162 98 H196', end: [196, 98], dir: 'right' },
    m1: { d: 'M272 92 H332', end: [332, 92], dir: 'right', label: { x: 302, y: 83, t: 'MODE' } },
    m2: { d: 'M332 104 H272', end: [272, 104], dir: 'left', label: { x: 302, y: 118, t: 'MODE' } },
    lowInit: { dot: [156, 180], d: 'M162 180 H196', end: [196, 180], dir: 'right' },
    c1: { d: 'M234 194 V240 H262', end: [262, 240], dir: 'right', label: { x: 228, y: 222, t: 'COLOR', anchor: 'end' } },
    c2: { d: 'M338 240 H370 V194', end: [370, 194], dir: 'up', label: { x: 376, y: 222, t: 'COLOR', anchor: 'start' } },
    c3: { d: 'M332 180 H272', end: [272, 180], dir: 'left', label: { x: 302, y: 171, t: 'COLOR' } },
  },
}

const STM_NARROW: StmL = {
  vb: [300, 344],
  frame: [2, 2, 296, 340],
  states: {
    off: [16, 58, 70, 30],
    low: [50, 166, 76, 28],
    high: [196, 166, 76, 28],
    white: [50, 236, 76, 28],
    green: [196, 236, 76, 28],
    red: [123, 296, 76, 28],
  },
  on: { x: 8, y: 124, w: 284, h0: 94, h1: 212, nameY: 137, lineY: 150 },
  sep: 218,
  tr: {
    init: { dot: [51, 38], d: 'M51 44 V58', end: [51, 58], dir: 'down' },
    pwrIn: { d: 'M36 88 V124', end: [36, 124], dir: 'down', label: { x: 30, y: 106, t: 'PWR', anchor: 'end' } },
    pwrOut: { d: 'M66 124 V88', end: [66, 88], dir: 'up', label: { x: 72, y: 106, t: 'PWR', anchor: 'start' } },
    upInit: { dot: [28, 180], d: 'M34 180 H50', end: [50, 180], dir: 'right' },
    m1: { d: 'M126 174 H196', end: [196, 174], dir: 'right', label: { x: 161, y: 165, t: 'MODE' } },
    m2: { d: 'M196 186 H126', end: [126, 186], dir: 'left', label: { x: 161, y: 200, t: 'MODE' } },
    lowInit: { dot: [28, 250], d: 'M34 250 H50', end: [50, 250], dir: 'right' },
    c1: { d: 'M88 264 V310 H123', end: [123, 310], dir: 'right', label: { x: 82, y: 296, t: 'COLOR', anchor: 'end' } },
    c2: { d: 'M199 310 H234 V264', end: [234, 264], dir: 'up', label: { x: 240, y: 296, t: 'COLOR', anchor: 'start' } },
    c3: { d: 'M196 250 H126', end: [126, 250], dir: 'left', label: { x: 161, y: 244, t: 'COLOR' } },
  },
}

const LOWER: Tr[] = ['lowInit', 'c1', 'c2', 'c3']
const LOWER_ST: St[] = ['white', 'red', 'green']
const NAME: Record<St, string> = { off: 'OFF', low: 'Low', high: 'High', white: 'White', red: 'Red', green: 'Green' }

/** Aktive tilstande efter hvert trin. */
const ACT: St[][] = [['off'], ['low'], ['high'], ['off'], ['low', 'white'], ['low', 'red'], ['low', 'red']]
/** Transitioner, der tegnes ind i trinnet, med forsinkelse (s). */
const HOT: Partial<Record<Tr, number>>[] = [{}, { pwrIn: 0.1, upInit: 0.8 }, { m1: 0.1 }, { pwrOut: 0.1 }, { pwrIn: 0.7, upInit: 1.4, lowInit: 1.4 }, { c1: 0.1 }, {}]
const SWITCH = [0, 1.4, 0.8, 0.8, 2.0, 0.8, 0]

function Stm({ L, step }: { L: StmL; step: number }) {
  const big = step >= 4
  const act = ACT[step]
  const hot = HOT[step]
  const inOn = act.some((s) => s !== 'off')
  const [fx, fy, fw, fh] = L.frame
  const title = big ? 'Flashlight [Power modes + color control]' : 'Flashlight [Power modes]'
  const tabW = big ? 278 : 180
  const on = L.on
  return (
    <g className="sno-stm">
      <rect className="sno-frame" x={fx} y={fy} width={fw} height={fh} />
      <motion.path
        className="sno-tab"
        initial={false}
        animate={{ d: `M${fx} ${fy} H${fx + tabW} V${fy + 14} L${fx + tabW - 8} ${fy + 22} H${fx} Z` }}
        transition={t.settle}
      />
      <text className="sno-tabtext" x={fx + 6} y={fy + 11}>
        <tspan className="sno-kw">stm</tspan> {title}
      </text>

      {/* ON: nested state med navnefelt */}
      <g className="sno-on" data-on={inOn || undefined} style={{ transitionDelay: `${SWITCH[step]}s` }}>
        <motion.rect
          x={on.x}
          y={on.y}
          width={on.w}
          rx={14}
          initial={false}
          animate={{ height: big ? on.h1 : on.h0 }}
          transition={big ? { ...t.settle, delay: 0.1 } : t.fade}
        />
        <text className="sno-sname" x={on.x + on.w / 2} y={on.nameY}>
          ON
        </text>
        <line className="sno-onrule" x1={on.x} x2={on.x + on.w} y1={on.lineY} y2={on.lineY} />
      </g>
      <motion.line
        className="sno-sep"
        x1={on.x}
        x2={on.x + on.w}
        y1={L.sep}
        y2={L.sep}
        initial={false}
        animate={{ opacity: big ? 1 : 0 }}
        transition={{ ...t.fade, delay: big ? 0.35 : 0 }}
      />

      {(Object.keys(L.tr) as Tr[]).map((k) => {
        const tr = L.tr[k]
        const lower = LOWER.includes(k)
        const delay = hot[k]
        return (
          <motion.g
            key={k}
            className="sno-trg"
            data-hot={delay !== undefined || undefined}
            initial={false}
            animate={{ opacity: !lower || big ? 1 : 0 }}
            transition={{ ...t.fade, delay: lower && big && step === 4 ? 0.45 : 0 }}
          >
            {tr.dot && <circle className="sno-init" cx={tr.dot[0]} cy={tr.dot[1]} r={6} />}
            <path className="sno-tr" d={tr.d} />
            {delay !== undefined && (
              <motion.path
                key={`hot-${step}`}
                className="sno-tr sno-tr-hot"
                d={tr.d}
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ ...t.travel, duration: 0.6, delay }}
              />
            )}
            <path className="sno-head" d={arrow(tr.end, tr.dir)} />
            {tr.label && (
              <text className="sno-label" x={tr.label.x} y={tr.label.y} textAnchor={tr.label.anchor ?? 'middle'}>
                {tr.label.t}
              </text>
            )}
          </motion.g>
        )
      })}

      {(Object.keys(L.states) as St[]).map((s) => {
        const [x, y, w, h] = L.states[s]
        const lower = LOWER_ST.includes(s)
        return (
          <motion.g
            key={s}
            className="sno-state"
            data-on={act.includes(s) || undefined}
            style={{ transitionDelay: `${SWITCH[step]}s` }}
            initial={false}
            animate={{ opacity: !lower || big ? 1 : 0 }}
            transition={{ ...t.fade, delay: lower && big && step === 4 ? 0.45 : 0 }}
          >
            <rect x={x} y={y} width={w} height={h} rx={9} />
            <text className="sno-sname" x={x + w / 2} y={y + h / 2}>
              {NAME[s]}
            </text>
          </motion.g>
        )
      })}
    </g>
  )
}

/* ----------------------------- Klassediagrammer ---------------------------- */

interface Cls {
  id: string
  b: [number, number, number]
  name: string
  ops?: string[]
}
interface HierL {
  classes: Cls[]
  lines: string[]
  tris: P2[]
  assoc: { d: string; end: P2; label: P2; t: string; anchor?: 'start' | 'end' }[]
  lh: number
  inherit?: string
  note?: { x: number; y: number }
}

const OPS_S2 = { base: ['+ PWRPressed(light)', '+ MODEPressed(light)'], pwr: ['+ PWRPressed(light)'], mode: ['+ MODEPressed(light)'] }
const OPS_S5I = ['+ onEnter(light)', '+ onExit(light)', '+ HandlePWRPressed(light)', '+ HandleMODEPressed(light)']
const OPS_S5C = ['+ onEnter(light)', '+ onExit(light)', '+ HandlePWRPressed(light)', '+ handleCOLORPressed(light)']

const S2_WIDE: HierL = {
  lh: 17,
  classes: [
    { id: 'fl', b: [140, 2, 120], name: 'FlashLight' },
    { id: 'base', b: [110, 52, 180], name: 'FlashLightState', ops: OPS_S2.base },
    { id: 'off', b: [12, 152, 156], name: 'Off', ops: OPS_S2.pwr },
    { id: 'on', b: [232, 152, 156], name: 'On', ops: OPS_S2.pwr },
    { id: 'low', b: [72, 232, 156], name: 'Low', ops: OPS_S2.mode },
    { id: 'high', b: [232, 232, 156], name: 'High', ops: OPS_S2.mode },
  ],
  lines: ['M200 131 V140 M90 140 H310 M90 140 V152 M310 140 V152', 'M310 214 V232 M150 222 H310 M150 222 V232'],
  tris: [
    [200, 120],
    [310, 203],
  ],
  assoc: [{ d: 'M200 28 V52', end: [200, 52], label: [207, 40], t: '_state', anchor: 'start' }],
  inherit: 'M310 232 V203',
}
const S2_NARROW: HierL = {
  lh: 17,
  classes: [
    { id: 'fl', b: [93, 2, 120], name: 'FlashLight' },
    { id: 'base', b: [63, 52, 180], name: 'FlashLightState', ops: OPS_S2.base },
    { id: 'off', b: [2, 152, 149], name: 'Off', ops: OPS_S2.pwr },
    { id: 'on', b: [155, 152, 149], name: 'On', ops: OPS_S2.pwr },
    { id: 'low', b: [2, 232, 149], name: 'Low', ops: OPS_S2.mode },
    { id: 'high', b: [155, 232, 149], name: 'High', ops: OPS_S2.mode },
  ],
  lines: ['M153 131 V140 M76 140 H229 M76 140 V152 M229 140 V152', 'M229 214 V232 M76 222 H229 M76 222 V232'],
  tris: [
    [153, 120],
    [229, 203],
  ],
  assoc: [{ d: 'M153 28 V52', end: [153, 52], label: [160, 40], t: '_state', anchor: 'start' }],
  inherit: 'M229 232 V203',
}
const S5_WIDE: HierL = {
  lh: 16,
  classes: [
    { id: 'fl', b: [145, 2, 120], name: 'FlashLight' },
    { id: 'ibase', b: [0, 58, 200], name: 'IntensityState', ops: OPS_S5I },
    { id: 'ioff', b: [14, 186, 70], name: 'Off' },
    { id: 'ion', b: [116, 186, 70], name: 'On' },
    { id: 'low', b: [88, 242, 52], name: 'Low' },
    { id: 'high', b: [148, 242, 52], name: 'High' },
    { id: 'cbase', b: [204, 58, 206], name: 'ColorState', ops: OPS_S5C },
    { id: 'coff', b: [222, 186, 70], name: 'Off' },
    { id: 'con', b: [330, 186, 70], name: 'On' },
    { id: 'red', b: [228, 242, 56], name: 'Red' },
    { id: 'green', b: [290, 242, 56], name: 'Green' },
    { id: 'white', b: [352, 242, 56], name: 'White' },
  ],
  lines: [
    'M100 167 V176 M49 176 H151 M49 176 V186 M151 176 V186',
    'M151 223 V232 M114 232 H174 M114 232 V242 M174 232 V242',
    'M308 167 V176 M257 176 H365 M257 176 V186 M365 176 V186',
    'M365 223 V232 M256 232 H380 M256 232 V242 M318 232 V242 M380 232 V242',
  ],
  tris: [
    [100, 156],
    [151, 212],
    [308, 156],
    [365, 212],
  ],
  assoc: [
    { d: 'M175 28 V42 H100 V58', end: [100, 58], label: [106, 50], t: '_intensityState', anchor: 'start' },
    { d: 'M235 28 V42 H308 V58', end: [308, 58], label: [314, 50], t: '_colorState', anchor: 'start' },
  ],
  note: { x: 408, y: 280 },
}
const S5_NARROW: HierL = {
  lh: 16,
  classes: [
    { id: 'fl', b: [90, 2, 120], name: 'FlashLight' },
    { id: 'ibase', b: [2, 72, 144], name: 'IntensityState' },
    { id: 'ioff', b: [4, 128, 54], name: 'Off' },
    { id: 'ion', b: [66, 128, 60], name: 'On' },
    { id: 'low', b: [48, 184, 46], name: 'Low' },
    { id: 'high', b: [98, 184, 46], name: 'High' },
    { id: 'cbase', b: [154, 72, 144], name: 'ColorState' },
    { id: 'coff', b: [154, 128, 38], name: 'Off' },
    { id: 'con', b: [197, 128, 60], name: 'On' },
    { id: 'red', b: [156, 184, 44], name: 'Red' },
    { id: 'green', b: [204, 184, 46], name: 'Green' },
    { id: 'white', b: [254, 184, 44], name: 'White' },
  ],
  lines: [
    'M74 109 V118 M31 118 H96 M31 118 V128 M96 118 V128',
    'M96 165 V174 M71 174 H121 M71 174 V184 M121 174 V184',
    'M226 109 V118 M173 118 H227 M173 118 V128 M227 118 V128',
    'M227 165 V174 M178 174 H276 M178 174 V184 M227 174 V184 M276 174 V184',
  ],
  tris: [
    [74, 98],
    [96, 154],
    [226, 98],
    [227, 154],
  ],
  assoc: [
    { d: 'M110 28 V36 H40 V72', end: [40, 72], label: [46, 56], t: '_intensityState', anchor: 'start' },
    { d: 'M196 28 V36 H266 V72', end: [266, 72], label: [260, 56], t: '_colorState', anchor: 'end' },
  ],
  note: { x: 296, y: 226 },
}

function Hier({ H, active, hotRow, inherit, delay }: { H: HierL; active: string[]; hotRow?: string; inherit?: boolean; delay: number }) {
  const lh = H.lh
  return (
    <g>
      {H.lines.map((d, i) => (
        <path key={i} className="sno-cline" d={d} />
      ))}
      {H.tris.map((p, i) => (
        <path key={i} className="sno-tri" d={tri(p)} />
      ))}
      {H.assoc.map((a) => (
        <g key={a.t}>
          <path className="sno-cline" d={a.d} />
          <path className="sno-chead" d={arrow(a.end, 'down')} />
          <text className="sno-role" x={a.label[0]} y={a.label[1]} textAnchor={a.anchor ?? 'start'}>
            {a.t}
          </text>
        </g>
      ))}
      {inherit && H.inherit && (
        <motion.path className="sno-inherit" d={H.inherit} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...t.travel, duration: 0.6, delay: 0.1 }} />
      )}
      {H.classes.map((c) => {
        const [x, y, w] = c.b
        const h = 26 + (c.ops ? c.ops.length * lh + 8 : 0)
        return (
          <g key={c.id} className="sno-cls" data-on={active.includes(c.id) || undefined} style={{ transitionDelay: `${delay}s` }}>
            <rect className="sno-box" x={x} y={y} width={w} height={h} />
            <text className="sno-cname" x={x + w / 2} y={y + 13}>
              {c.name}
            </text>
            {c.ops && (
              <>
                <line className="sno-div" x1={x} x2={x + w} y1={y + 26} y2={y + 26} />
                {c.ops.map((o, i) => (
                  <g key={o} data-hot={(hotRow === c.id && i === 0) || (hotRow === `${c.id}:${i}`) || undefined}>
                    <rect className="sno-memhl" x={x + 2} y={y + 30 + i * lh} width={w - 4} height={lh} />
                    <text className="sno-mem" x={x + 4} y={y + 30 + i * lh + lh / 2}>
                      {o}
                    </text>
                  </g>
                ))}
              </>
            )}
          </g>
        )
      })}
      {H.note && (
        <text className="sno-cnote" x={H.note.x} y={H.note.y}>
          operationer i subklasserne udeladt
        </text>
      )}
    </g>
  )
}

const S2_ACT: string[][] = [['off'], ['low'], ['high'], ['off'], ['low'], ['low'], ['low']]

function Classes({ s2, s5, step, s5x = 0 }: { s2: HierL; s5: HierL; step: number; s5x?: number }) {
  const late = step === 6
  const hotRow = step === 2 ? 'high' : step === 3 ? 'on' : undefined
  return (
    <>
      <motion.g initial={false} animate={{ opacity: late ? 0 : 1 }} transition={t.fade} aria-hidden={late || undefined}>
        <Hier H={s2} active={S2_ACT[step]} hotRow={hotRow} inherit={step === 3} delay={SWITCH[step]} />
      </motion.g>
      <motion.g initial={false} animate={{ opacity: late ? 1 : 0 }} transition={late ? { ...t.fade, delay: 0.2 } : t.fade} aria-hidden={!late || undefined}>
        <g transform={`translate(${s5x} 0)`}>
          <Hier H={s5} active={['low', 'red']} delay={0} />
        </g>
      </motion.g>
    </>
  )
}

function NestedOrthogonal({ step }: { step: number }) {
  return (
    <div className="sno">
      <svg className="sno-svg sno-wide" viewBox="0 0 850 286" aria-hidden="true">
        <Stm L={STM_WIDE} step={step} />
        <g transform="translate(440 0)">
          <Classes s2={S2_WIDE} s5={S5_WIDE} step={step} />
        </g>
      </svg>
      <div className="sno-narrow">
        <svg className="sno-svg" viewBox="0 0 300 344" aria-hidden="true">
          <Stm L={STM_NARROW} step={step} />
        </svg>
        <svg className="sno-svg" viewBox="0 0 306 286" aria-hidden="true">
          <Classes s2={S2_NARROW} s5={S5_NARROW} step={step} s5x={3} />
        </svg>
      </div>
      <motion.p className="sno-collapse" initial={false} animate={{ opacity: step === 6 ? 1 : 0 }} transition={t.fade} aria-hidden={step !== 6 || undefined}>
        <span className="sno-collapse-head">Alternativet, kollaps til én maskine:</span> Low-White · Low-Green · Low-Red · High-White · High-Green · High-Red
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'nested-orthogonal',
  title: 'Lygten med modes og farver',
  steps: [
    { caption: '`ON` er en nested state med sin egen initial pseudo-state. Lygten starter i `OFF`.', hold: 2400 },
    { caption: '`PWR` fører til kanten af `ON`; den indre initial pseudo-state vælger `Low`.', hold: 2800 },
    { caption: '`MODE` skifter mellem undertilstandene. `High.MODEPressed(light)` håndterer det.', hold: 2400 },
    { caption: '`PWR` gælder fra hele `ON`. `High` har ingen `PWRPressed` — den **arves** fra `On`.', hold: 3000 },
    {
      caption: 'Med farvestyring deles `ON` af en stiplet linje i to regioner. `PWR` tænder begge: lygten er i `Low` **og** `White`.',
      hold: 3400,
    },
    { caption: '`COLOR` flytter kun markeringen i den nederste region: `White` → `Red`. `Low` står stille.', hold: 2400 },
    {
      caption: 'To regioner bliver to tilstandshierarkier: `FlashLight` holder `_intensityState` og `_colorState`. Alternativet er at kollapse til seks tilstande.',
      hold: 3000,
    },
  ],
  Component: NestedOrthogonal,
}

export default viz
