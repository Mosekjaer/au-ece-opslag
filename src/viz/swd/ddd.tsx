import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { t } from '../kit/motion'
import './ddd.css'

/* Domain Driven Design.pdf s. 15 (bounded contexts Order taking, Shipping og Billing;
   context map: Customer → “Order recived” → Order taking context → “Order placed” →
   Billing context og Shipping context), s. 19 (value object: no unique ID, immutable;
   entity: has unique ID, mutable; eksempler Money, OrderItem, Customer, Invoice),
   s. 20 (aggregate: én entity er aggregate root, ejer resten, adgang skal gå gennem
   roden) og s. 21 (reference other aggregates only by identity; eventual consistency).
   Markdown: swd/markdown/slides/SW4SWD-01_W09.2_Domain_Driven_Design.md.
   ILLUSTRATIVT: at Invoice ligger i Billing context og indeholder OrderItem og Money,
   og at Invoice refererer til Customer via ID. Det står som note i figuren.
   “Order recived” er slidens stavning. */

type P = [number, number]
type Dir = 'up' | 'down' | 'left' | 'right'
type Anchor = 'start' | 'middle' | 'end'
type Box = { x: number; y: number; w: number; h: number }
type Ctx = 'order' | 'ship' | 'bill'
type Obj = 'invoice' | 'item' | 'money' | 'customer'

interface Layout {
  vb: [number, number]
  font: number
  customer: { c: P; r: number; label: [number, number, Anchor] }
  ctx: Record<Ctx, { c: P; rx: number; ry: number; lines: string[] }>
  ev1: { d: string; end: P; dir: Dir; label: [number, number, Anchor] }
  ev2: { d: [string, string]; ends: [P, P]; dir: Dir; label: [number, number, Anchor] }
  funnel: [string, string]
  panel: Box
  panelLabel: P
  caller: Box
  agg: Box
  aggLabel: P
  boxes: Record<Obj, Box>
  root: Record<'invoice' | 'customer', P>
  comp: { at: P; d: string }[]
  blocked: { d: string; x: P; label: [number, number, Anchor] }
  allowed: { d: string; end: P; dir: Dir; label: [number, number, Anchor] }
  cagg: Box
  caggLabel: P
  id: { d: string; label: [number, number, Anchor]; lines: string[] }
  legend: P
}

const WIDE: Layout = {
  vb: [760, 460],
  font: 13,
  customer: { c: [46, 74], r: 18, label: [46, 112, 'middle'] },
  ctx: {
    order: { c: [270, 74], rx: 88, ry: 30, lines: ['Order taking', 'context'] },
    ship: { c: [640, 36], rx: 92, ry: 26, lines: ['Shipping context'] },
    bill: { c: [640, 116], rx: 92, ry: 26, lines: ['Billing context'] },
  },
  ev1: { d: 'M66 74 H182', end: [182, 74], dir: 'right', label: [124, 64, 'middle'] },
  ev2: {
    d: ['M358 74 H470 V36 H548', 'M470 74 V116 H548'],
    ends: [
      [548, 36],
      [548, 116],
    ],
    dir: 'right',
    label: [414, 64, 'middle'],
  },
  funnel: ['M575 134 L22 176', 'M705 134 L518 176'],
  panel: { x: 0, y: 176, w: 540, h: 280 },
  panelLabel: [18, 200],
  caller: { x: 16, y: 252, w: 96, h: 30 },
  agg: { x: 140, y: 214, w: 384, h: 226 },
  aggLabel: [152, 432],
  boxes: {
    invoice: { x: 262, y: 244, w: 140, h: 56 },
    item: { x: 170, y: 362, w: 140, h: 56 },
    money: { x: 354, y: 362, w: 156, h: 56 },
    customer: { x: 600, y: 240, w: 124, h: 56 },
  },
  root: { invoice: [382, 244], customer: [704, 240] },
  comp: [
    { at: [300, 300], d: 'M300 314 V338 H240 V362' },
    { at: [366, 300], d: 'M366 314 V338 H432 V362' },
  ],
  blocked: { d: 'M64 282 V390 H134', x: [140, 390], label: [100, 408, 'middle'] },
  allowed: { d: 'M112 267 H262', end: [262, 267], dir: 'right', label: [200, 259, 'middle'] },
  cagg: { x: 572, y: 214, w: 176, h: 106 },
  caggLabel: [584, 312],
  id: { d: 'M402 272 H600', label: [466, 264, 'middle'], lines: ['Customer (ID)'] },
  legend: [576, 346],
}

const NARROW: Layout = {
  vb: [320, 730],
  font: 13.5,
  customer: { c: [160, 22], r: 16, label: [184, 27, 'start'] },
  ctx: {
    order: { c: [160, 102], rx: 112, ry: 24, lines: ['Order taking context'] },
    ship: { c: [80, 192], rx: 76, ry: 22, lines: ['Shipping context'] },
    bill: { c: [240, 192], rx: 76, ry: 22, lines: ['Billing context'] },
  },
  ev1: { d: 'M160 40 V78', end: [160, 78], dir: 'down', label: [170, 64, 'start'] },
  ev2: {
    d: ['M160 126 V150 H80 V170', 'M160 150 H240 V170'],
    ends: [
      [80, 170],
      [240, 170],
    ],
    dir: 'down',
    label: [168, 144, 'start'],
  },
  funnel: ['M187 208 L14 246', 'M293 208 L306 246'],
  panel: { x: 0, y: 246, w: 320, h: 350 },
  panelLabel: [14, 269],
  caller: { x: 10, y: 280, w: 96, h: 28 },
  agg: { x: 44, y: 326, w: 176, h: 254 },
  aggLabel: [54, 572],
  boxes: {
    invoice: { x: 62, y: 344, w: 146, h: 56 },
    item: { x: 62, y: 428, w: 146, h: 56 },
    money: { x: 62, y: 500, w: 146, h: 56 },
    customer: { x: 182, y: 640, w: 128, h: 56 },
  },
  root: { invoice: [184, 344], customer: [280, 640] },
  comp: [
    { at: [100, 400], d: 'M100 414 V428' },
    { at: [176, 400], d: 'M176 414 V420 H214 V528 H208' },
  ],
  blocked: { d: 'M22 308 V456 H38', x: [44, 456], label: [4, 477, 'start'] },
  allowed: { d: 'M80 308 V344', end: [80, 344], dir: 'down', label: [88, 320, 'start'] },
  cagg: { x: 172, y: 614, w: 144, h: 106 },
  caggLabel: [180, 712],
  id: { d: 'M208 372 H236 V640', label: [242, 490, 'start'], lines: ['Customer', '(ID)'] },
  legend: [10, 628],
}

function head([x, y]: P, dir: Dir) {
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

/** Udfyldt diamant (komposition) med øverste spids i p, pegende nedad. */
const diamond = ([x, y]: P) => `M${x} ${y} L${x + 6} ${y + 7} L${x} ${y + 14} L${x - 6} ${y + 7}Z`

const fade = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})
const draw = (on: boolean, delay = 0, duration = 0.7) => ({
  initial: false as const,
  animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 },
  transition: on ? { ...t.travel, duration, delay } : t.fade,
})

function Label({ at: [x, y, anchor], lines, className }: { at: [number, number, Anchor]; lines: string[]; className?: string }) {
  return (
    <text className={className} x={x} y={y} textAnchor={anchor}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : '1.2em'}>
          {l}
        </tspan>
      ))}
    </text>
  )
}

const OBJ: Record<Obj, { st: string; name: string; prop: string }> = {
  invoice: { st: '«entity»', name: 'Invoice', prop: 'unikt ID · mutable' },
  item: { st: '«entity»', name: 'OrderItem', prop: 'unikt ID · mutable' },
  money: { st: '«value object»', name: 'Money', prop: 'intet ID · immutable' },
  customer: { st: '«entity»', name: 'Customer', prop: 'unikt ID · mutable' },
}

function ObjBox({ b, o, hot }: { b: Box; o: Obj; hot?: boolean }) {
  const d = OBJ[o]
  const cx = b.x + b.w / 2
  return (
    <g className="ddd-obj" data-kind={o === 'money' ? 'value' : 'entity'} data-hot={hot || undefined}>
      <rect x={b.x} y={b.y} width={b.w} height={b.h} rx={2} />
      <text className="ddd-st" x={cx} y={b.y + 15}>
        {d.st}
      </text>
      <text className="ddd-name" x={cx} y={b.y + 32}>
        {d.name}
      </text>
      <text className="ddd-prop" x={cx} y={b.y + 48}>
        {d.prop}
      </text>
    </g>
  )
}

function Root({ p }: { p: P }) {
  return (
    <g className="ddd-root">
      <rect x={p[0] - 19} y={p[1] - 8} width={38} height={16} rx={8} />
      <text x={p[0]} y={p[1]}>
        root
      </text>
    </g>
  )
}

function Legend({ p }: { p: P }) {
  const [x, y] = p
  const row = 19
  const tx = x + 30
  return (
    <g className="ddd-legend">
      <rect className="ddd-bound" x={x} y={y - 7} width={22} height={13} rx={4} />
      <text x={tx} y={y}>
        aggregate-grænse
      </text>
      <Root p={[x + 11, y + row]} />
      <text x={tx + 12} y={y + row}>
        eneste indgang
      </text>
      <path className="ddd-comp-d" d={`M${x + 2} ${y + 2 * row} L${x + 8} ${y + 2 * row - 5} L${x + 14} ${y + 2 * row} L${x + 8} ${y + 2 * row + 5}Z`} />
      <path className="ddd-line" d={`M${x + 14} ${y + 2 * row} H${x + 22}`} />
      <text x={tx} y={y + 2 * row}>
        komposition
      </text>
      <path className="ddd-line ddd-dash" d={`M${x} ${y + 3 * row} H${x + 22}`} />
      <text x={tx} y={y + 3 * row}>
        reference via ID
      </text>
      <path className="ddd-line" d={`M${x} ${y + 4 * row} H${x + 22}`} />
      <path className="ddd-head" d={head([x + 22, y + 4 * row], 'right')} />
      <text x={tx} y={y + 4 * row}>
        domain event
      </text>
      <path className="ddd-x" d={`M${x + 6} ${y + 5 * row - 5} l10 10 M${x + 16} ${y + 5 * row - 5} l-10 10`} />
      <text x={tx} y={y + 5 * row}>
        adgang afvist
      </text>
    </g>
  )
}

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const zoom = at(step, 3)
  const dim = step >= 3 && step <= 5
  const final = step === 6
  const b = L.boxes
  const [cx, cy] = L.customer.c
  const r = L.customer.r
  return (
    <svg className={`ddd-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} style={{ fontSize: L.font }} aria-hidden="true">
      {/* ---------------- Strategisk: context map ---------------- */}
      <g className="ddd-map" data-dim={dim || undefined}>
        <g className="ddd-actor">
          <circle cx={cx} cy={cy} r={r} />
          <circle className="ddd-eye" cx={cx - r * 0.32} cy={cy - r * 0.2} r={1.6} />
          <circle className="ddd-eye" cx={cx + r * 0.32} cy={cy - r * 0.2} r={1.6} />
          <path className="ddd-smile" d={`M${cx - r * 0.42} ${cy + r * 0.2} Q${cx} ${cy + r * 0.62} ${cx + r * 0.42} ${cy + r * 0.2}`} />
          <Label at={L.customer.label} lines={['Customer']} className="ddd-actor-l" />
        </g>

        <g className="ddd-ev" data-hot={step === 1 || undefined}>
          <motion.path className="ddd-line" d={L.ev1.d} {...draw(at(step, 1))} />
          <motion.path className="ddd-head" d={head(L.ev1.end, L.ev1.dir)} {...fade(at(step, 1), at(step, 1) ? 0.6 : 0)} />
          <motion.g {...fade(at(step, 1), 0.3)}>
            <Label at={L.ev1.label} lines={['Order recived']} className="ddd-ev-l" />
          </motion.g>
        </g>

        <g className="ddd-ev" data-hot={step === 2 || undefined}>
          {L.ev2.d.map((d, i) => (
            <motion.path key={i} className="ddd-line" d={d} {...draw(at(step, 2), 0.1 * i)} />
          ))}
          {L.ev2.ends.map((e, i) => (
            <motion.path key={i} className="ddd-head" d={head(e, L.ev2.dir)} {...fade(at(step, 2), 0.65)} />
          ))}
          <motion.g {...fade(at(step, 2), 0.3)}>
            <Label at={L.ev2.label} lines={['Order placed']} className="ddd-ev-l" />
          </motion.g>
        </g>

        {(['order', 'ship'] as Ctx[]).map((k) => {
          const c = L.ctx[k]
          const hot = (k === 'order' && (step === 1 || step === 2)) || undefined
          return (
            <g key={k} className="ddd-ctx" data-hot={hot}>
              <ellipse cx={c.c[0]} cy={c.c[1]} rx={c.rx} ry={c.ry} />
              <text x={c.c[0]} y={c.c[1] - (c.lines.length - 1) * 8}>
                {c.lines.map((l, i) => (
                  <tspan key={i} x={c.c[0]} dy={i === 0 ? 0 : 16}>
                    {l}
                  </tspan>
                ))}
              </text>
            </g>
          )
        })}
      </g>

      {/* Billing context er den, der zoomes ind i — den dæmpes aldrig. */}
      <g className="ddd-ctx ddd-bill" data-hot={(step === 2 || dim) || undefined}>
        <ellipse cx={L.ctx.bill.c[0]} cy={L.ctx.bill.c[1]} rx={L.ctx.bill.rx} ry={L.ctx.bill.ry} />
        <text x={L.ctx.bill.c[0]} y={L.ctx.bill.c[1]}>
          {L.ctx.bill.lines[0]}
        </text>
      </g>

      {/* ---------------- Taktisk: zoom ind i Billing context ---------------- */}
      <motion.g {...fade(zoom)}>
        {L.funnel.map((d, i) => (
          <path key={i} className="ddd-funnel" d={d} />
        ))}
        <rect className="ddd-panel" x={L.panel.x} y={L.panel.y} width={L.panel.w} height={L.panel.h} rx={18} />
        <text className="ddd-panel-l" x={L.panelLabel[0]} y={L.panelLabel[1]}>
          Billing context · indefra
        </text>
      </motion.g>

      <motion.g {...fade(zoom, 0.35)}>
        <rect className="ddd-bound" x={L.agg.x} y={L.agg.y} width={L.agg.w} height={L.agg.h} rx={14} />
        <text className="ddd-bound-l" x={L.aggLabel[0]} y={L.aggLabel[1]}>
          Aggregate
        </text>
        {L.comp.map((c, i) => (
          <g key={i}>
            <path className="ddd-line" d={c.d} />
            <path className="ddd-comp-d" d={diamond(c.at)} />
          </g>
        ))}
        <ObjBox b={b.item} o="item" hot={step === 4} />
        <ObjBox b={b.money} o="money" />
        <ObjBox b={b.invoice} o="invoice" hot={step === 3 || step === 4} />
        <Root p={L.root.invoice} />
      </motion.g>

      {/* Adgang udefra: direkte til OrderItem afvises; gennem roden lykkes. */}
      <g className="ddd-call" data-hot={step === 4 || undefined}>
        <motion.g {...fade(at(step, 4))}>
          <rect className="ddd-caller" x={L.caller.x} y={L.caller.y} width={L.caller.w} height={L.caller.h} rx={4} />
          <text className="ddd-caller-l" x={L.caller.x + L.caller.w / 2} y={L.caller.y + L.caller.h / 2}>
            kald udefra
          </text>
        </motion.g>
        <motion.path className="ddd-line ddd-blocked" d={L.blocked.d} {...draw(at(step, 4), 0.1, 0.6)} />
        <motion.path
          className="ddd-x"
          d={`M${L.blocked.x[0] - 6} ${L.blocked.x[1] - 6} l12 12 M${L.blocked.x[0] + 6} ${L.blocked.x[1] - 6} l-12 12`}
          {...fade(at(step, 4), at(step, 4) ? 0.7 : 0)}
        />
        <motion.g {...fade(at(step, 4), 0.75)}>
          <Label at={L.blocked.label} lines={['afvist']} className="ddd-x-l" />
        </motion.g>
        <motion.path className="ddd-line ddd-ok" d={L.allowed.d} {...draw(at(step, 4), 1.0, 0.6)} />
        <motion.path className="ddd-head ddd-ok" d={head(L.allowed.end, L.allowed.dir)} {...fade(at(step, 4), at(step, 4) ? 1.5 : 0)} />
        <motion.g {...fade(at(step, 4), 1.2)}>
          <Label at={L.allowed.label} lines={['via roden']} className="ddd-ok-l" />
        </motion.g>
        {/* Roden sender videre ind til OrderItem. */}
        <motion.path className="ddd-via" d={L.comp[0].d} {...draw(step === 4, 1.7, 0.5)} />
      </g>

      {/* Et andet aggregate: kun via identitet. */}
      <motion.g className="ddd-other" data-hot={step === 5 || undefined} {...fade(at(step, 5))}>
        <rect className="ddd-bound" x={L.cagg.x} y={L.cagg.y} width={L.cagg.w} height={L.cagg.h} rx={14} />
        <text className="ddd-bound-l" x={L.caggLabel[0]} y={L.caggLabel[1]}>
          Aggregate
        </text>
        <ObjBox b={b.customer} o="customer" hot={step === 5} />
        <Root p={L.root.customer} />
      </motion.g>
      <g className="ddd-idref" data-hot={step === 5 || undefined}>
        <motion.path className="ddd-line ddd-dash" d={L.id.d} {...fade(at(step, 5), 0.35)} />
        <motion.g {...fade(at(step, 5), 0.5)}>
          <Label at={L.id.label} lines={L.id.lines} className="ddd-id-l" />
        </motion.g>
      </g>

      <motion.g {...fade(zoom, 0.6)} className="ddd-legend-g" data-final={final || undefined}>
        <Legend p={L.legend} />
      </motion.g>
    </svg>
  )
}

function Ddd({ step }: { step: number }) {
  return (
    <div className="ddd">
      <Diagram L={WIDE} step={step} className="ddd-wide" />
      <Diagram L={NARROW} step={step} className="ddd-narrow" />
      <motion.p className="ddd-note" {...fade(at(step, 3), 0.6)}>
        <strong>Eksempel:</strong> at <code>Invoice</code> ligger i Billing context, indeholder <code>OrderItem</code> og{' '}
        <code>Money</code> og refererer til <code>Customer</code> via ID, er illustrativt. Materialet nævner delene, ikke
        sammensætningen.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'ddd',
  title: 'Contexts, events og én indgang',
  steps: [
    {
      caption: 'Domænet er delt i tre **bounded contexts** — hver et “mini”-domæne med sin egen dialekt af ubiquitous language.',
      hold: 2400,
    },
    {
      caption: 'Kunden sender en ordre: `Order recived` (slidens stavning). Order taking context modtager den.',
      hold: 2000,
    },
    {
      caption: '`Order placed` sendes videre til Billing og Shipping. Contexts hænger sammen via **domain events** — det er context mappet.',
      hold: 2600,
    },
    {
      caption: 'Zoom ind i Billing context. Et **aggregate** samler entities og value objects; én entity — her `Invoice` — er **aggregate root** og ejer resten.',
      hold: 3000,
    },
    {
      caption: 'Et kald direkte til `OrderItem` afvises ved grænsen. Adgang til aggregatet **skal** gå gennem roden, som vogter invarianterne.',
      hold: 3000,
    },
    {
      caption: 'Et andet aggregate refereres kun via **identitet**: `Invoice` kender `Customer (ID)`, ikke objektet. Det opdateres med eventual consistency.',
      hold: 2800,
    },
    {
      caption: 'Strategisk deler contexts domænet og taler via events; taktisk vogter et aggregate sine invarianter bag én indgang.',
      hold: 2600,
    },
  ],
  Component: Ddd,
}

export default viz
