import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import { t } from '../kit/motion'
import './abstract-factory.css'

/* GoF Factory Method, Gof Abstract Factory.pdf (W07.2): PDF s. 11 (WeighingSystem før
   og efter DIP, Main med new FøtexWeighingUnit() …), s. 12 (diagrammet med tre
   interfaces og Føtex/Netto-varianter, “how many different WeighingSystems can now be
   created?”), s. 13 (“Creation of WeighingSystem variants is complex and error prone”,
   Netto-vægten med new FøtexDisplay()), s. 14 (IWeighingSystemFactory, FøtexFactory,
   NettoFactory; stiplet afhængighed fra WeighingSystem; linjer fra factories til deres
   produkter) og s. 15 (koden). Markdown: swd/markdown/slides/SW4SWD-01_W07.2_GoF_
   Factory_Abstract_Factory.md, afsnit 3.3–3.6. 2 · 2 · 2 = 8 er regnet ud fra diagrammet;
   slidet svarer ikke selv. Factory → produkt tegnes som «create»-afhængighed. */

/* ------------------------------ UML-hjælpere ------------------------------ */

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

/** Lukket, hul trekant med spidsen i p, der peger i retning dir. */
function tri([x, y]: P2, dir: Dir = 'up', a = 11, b = 7) {
  switch (dir) {
    case 'left':
      return `M${x} ${y} L${x + a} ${y - b} L${x + a} ${y + b} Z`
    default:
      return `M${x} ${y} L${x + b} ${y + a} L${x - b} ${y + a} Z`
  }
}

const LH = 17

/* ------------------------------- Modellen -------------------------------- */

type Part = 'wu' | 'pr' | 'di'
type Fam = 'f' | 'n'
const PARTS: { id: Part; iface: string; role: string; cls: Record<Fam, string>; brk: Record<Fam, string[]> }[] = [
  {
    id: 'wu',
    iface: 'IWeighingUnit',
    role: '_weighingUnit',
    cls: { f: 'FøtexWeighingUnit', n: 'NettoWeighingUnit' },
    brk: { f: ['Føtex-', 'WeighingUnit'], n: ['Netto-', 'WeighingUnit'] },
  },
  { id: 'pr', iface: 'IPrinter', role: '_printer', cls: { f: 'FøtexPrinter', n: 'NettoPrinter' }, brk: { f: ['FøtexPrinter'], n: ['NettoPrinter'] } },
  { id: 'di', iface: 'IDisplay', role: '_display', cls: { f: 'FøtexDisplay', n: 'NettoDisplay' }, brk: { f: ['FøtexDisplay'], n: ['NettoDisplay'] } },
]

/** Hvad der står i pladserne efter hvert trin. */
const SLOTS: (Record<Part, Fam> | null)[] = [null, null, { wu: 'n', pr: 'n', di: 'f' }, null, { wu: 'n', pr: 'n', di: 'n' }, { wu: 'f', pr: 'f', di: 'f' }]

/* -------------------------------- Layout -------------------------------- */

interface Layout {
  vb: [number, number]
  narrow: boolean
  ws: { x: number; y: number; w: number; h: number; ctor: [string[], string[]] }
  /** Pr. del: pladsens midte, association, interfacets boks, produktbokse, realisering. */
  part: {
    slot: [number, number, number, number]
    role: P2
    assoc: string
    assocEnd: P2
    iface: [number, number, number]
    tri: P2
    triDir: Dir
    real: string
    prod: Record<Fam, [number, number, number, number]>
    /** «create»-stub fra produktets bund til familiens bus (kun bred). */
    create?: Record<Fam, string>
    createEnd?: Record<Fam, P2>
  }[]
  fac: { x: number; y: number; w: number }
  facs: Record<Fam, [number, number, number, number]>
  facReal: { tri: P2; dir: Dir; d: string }
  dep: { d: string; end: P2; dir: Dir }
  /** «create»-bus pr. familie inkl. forbindelsen til dens factory. */
  bus?: Record<Fam, { d: string; label: P2 }>
}

const cw = [150, 430, 710]
const WIDE: Layout = {
  vb: [860, 412],
  narrow: false,
  ws: {
    x: 20,
    y: 6,
    w: 820,
    h: 51,
    ctor: [['+ WeighingSystem(IWeighingUnit, IPrinter, IDisplay)'], ['+ WeighingSystem(IWeighingSystemFactory factory)']],
  },
  part: cw.map((c) => ({
    slot: [c - 80, 68, 160, 28],
    role: [c + 8, 116],
    assoc: `M${c} 57 V132`,
    assocEnd: [c, 132],
    iface: [c - 85, 132, 170],
    tri: [c, 172],
    triDir: 'up',
    real: `M${c} 183 V194 M${c - 70} 194 H${c + 70} M${c - 70} 194 V208 M${c + 70} 194 V208`,
    prod: { f: [c - 135, 208, 132, 28], n: [c + 3, 208, 132, 28] },
    create: { f: `M${c - 70} 236 V262`, n: `M${c + 70} 236 V280` },
    createEnd: { f: [c - 70, 236], n: [c + 70, 236] },
  })),
  fac: { x: 20, y: 310, w: 300 },
  facs: { f: [450, 316, 160, 26], n: [450, 376, 160, 26] },
  facReal: { tri: [320, 359], dir: 'left', d: 'M331 359 H410 M410 329 V389 M410 329 H450 M410 389 H450' },
  dep: { d: 'M20 31 H8 V359 H20', end: [20, 359], dir: 'right' },
  bus: {
    f: { d: 'M80 262 H640 M530 262 V316', label: [74, 262] },
    n: { d: 'M220 280 H848 V389 H610', label: [214, 280] },
  },
}

const NROW = (i: number) => 86 + i * 112
const NARROW: Layout = {
  vb: [300, 592],
  narrow: true,
  ws: { x: 6, y: 4, w: 288, h: 68, ctor: [['+ WeighingSystem(IWeighingUnit,', '    IPrinter, IDisplay)'], ['+ WeighingSystem(', '    IWeighingSystemFactory factory)']] },
  part: [0, 1, 2].map((i) => {
    const R = NROW(i)
    return {
      slot: [22, R + 16, 150, 26],
      role: [24, R + 8],
      assoc: `M14 72 V${R + 29} H97 V${R + 58}`,
      assocEnd: [97, R + 58],
      iface: [22, R + 58, 150],
      tri: [172, R + 78],
      triDir: 'left',
      real: `M183 ${R + 78} H196 M188 ${R + 78} V${R + 32} H196`,
      prod: { f: [196, R + 14, 98, 36], n: [196, R + 60, 98, 36] },
    }
  }),
  fac: { x: 6, y: 426, w: 288 },
  facs: { f: [6, 562, 140, 26], n: [154, 562, 140, 26] },
  facReal: { tri: [150, 525], dir: 'up', d: 'M150 536 V548 M76 548 H224 M76 548 V562 M224 548 V562' },
  dep: { d: 'M294 38 H298 V475 H294', end: [294, 475], dir: 'left' },
}

/* ------------------------------- Delene ---------------------------------- */

/** Stiplet linje, der tegnes ind: en maske med pathLength, så stiplingen bevares. */
function DashDraw({ id, d, vb, delay = 0 }: { id: string; d: string; vb: [number, number]; delay?: number }) {
  return (
    <g>
      <mask id={id} maskUnits="userSpaceOnUse" x={0} y={0} width={vb[0]} height={vb[1]}>
        <motion.path d={d} fill="none" stroke="white" strokeWidth={10} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ ...t.travel, delay }} />
      </mask>
      <path className="saf-line saf-dash saf-hotline" d={d} mask={`url(#${id})`} />
    </g>
  )
}

function Box({ b, tone, children }: { b: [number, number, number, number]; tone: string; children: ReactNode }) {
  const [x, y, w, h] = b
  return (
    <g className="saf-cls" data-tone={tone}>
      <rect className="saf-box" x={x} y={y} width={w} height={h} />
      {children}
    </g>
  )
}

function Lines({ x, y, lines, cls }: { x: number; y: number; lines: string[]; cls: string }) {
  const off = ((lines.length - 1) * 14) / 2
  return (
    <text className={cls} x={x} y={y - off}>
      {lines.map((l, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : 14}>
          {l}
        </tspan>
      ))}
    </text>
  )
}

function Iface({ x, y, w, name, tone, ops }: { x: number; y: number; w: number; name: string; tone: string; ops?: string[] }) {
  const h = 40 + (ops ? ops.length * LH + 8 : 0)
  return (
    <g className="saf-cls" data-tone={tone}>
      <rect className="saf-box" x={x} y={y} width={w} height={h} />
      <text className="saf-stereo" x={x + w / 2} y={y + 12}>
        «interface»
      </text>
      <text className="saf-cname" x={x + w / 2} y={y + 28}>
        {name}
      </text>
      {ops && (
        <>
          <line className="saf-div" x1={x} x2={x + w} y1={y + 40} y2={y + 40} />
          {ops.map((o, i) => (
            <text key={o} className="saf-mem" x={x + 7} y={y + 44 + i * LH + LH / 2}>
              {o}
            </text>
          ))}
        </>
      )}
    </g>
  )
}

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const slots = SLOTS[step]
  const facOn = step >= 3
  const facTone = (f: Fam) => (step === 4 && f === 'n') || (step === 5 && f === 'f') ? 'focus' : 'idle'
  const prodTone = (p: Part, f: Fam) => {
    if (step === 0 || step === 3) return 'muted'
    if (step === 1) return 'idle'
    if (step === 2) return slots![p] === f ? (p === 'di' ? 'neg' : 'focus') : 'muted'
    if (step === 4) return f === 'n' ? 'focus' : 'muted'
    return f === 'f' ? 'focus' : 'idle'
  }
  const travel = step === 2 || step === 4 || step === 5
  const ws = L.ws
  const fac = L.fac

  return (
    <svg className={`saf-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} aria-hidden="true">
      {/* Afhængighed WeighingSystem → IWeighingSystemFactory */}
      <motion.path className="saf-line saf-dash" d={L.dep.d} initial={false} animate={{ opacity: facOn ? 1 : 0 }} transition={t.fade} />
      {step === 3 && <DashDraw key={`dep-${className}`} id={`saf-dep-${className}`} d={L.dep.d} vb={L.vb} delay={0.3} />}
      <motion.path className="saf-head" d={arrow(L.dep.end, L.dep.dir)} initial={false} animate={{ opacity: facOn ? 1 : 0 }} transition={{ ...t.fade, delay: step === 3 ? 1 : 0 }} />

      {/* «create»-busser fra factories til produkterne (bred) */}
      {L.bus &&
        (['f', 'n'] as Fam[]).map((f) => {
          const hot = (step === 4 && f === 'n') || (step === 5 && f === 'f')
          return (
            <motion.g key={f} className="saf-create" data-hot={hot || undefined} initial={false} animate={{ opacity: facOn ? 1 : 0 }} transition={t.fade}>
              <path className="saf-line saf-dash" d={L.bus![f].d} />
              {L.part.map((pt, i) => (
                <g key={i}>
                  <path className="saf-line saf-dash" d={pt.create![f]} />
                  <path className="saf-head" d={arrow(pt.createEnd![f], 'up')} />
                </g>
              ))}
              {hot && (
                <DashDraw
                  key={`bus-${step}`}
                  id={`saf-bus-${className}-${f}`}
                  d={`${L.bus![f].d} ${L.part.map((pt) => pt.create![f]).join(' ')}`}
                  vb={L.vb}
                  delay={0.1}
                />
              )}
              <text className="saf-kw" x={L.bus![f].label[0]} y={L.bus![f].label[1]}>
                «create»
              </text>
            </motion.g>
          )
        })}

      {/* WeighingSystem */}
      <g className="saf-cls" data-tone={step === 3 ? 'focus' : 'idle'}>
        <rect className="saf-box" x={ws.x} y={ws.y} width={ws.w} height={ws.h} />
        <text className="saf-cname" x={ws.x + ws.w / 2} y={ws.y + 13}>
          WeighingSystem
        </text>
        <line className="saf-div" x1={ws.x} x2={ws.x + ws.w} y1={ws.y + 26} y2={ws.y + 26} />
        {ws.ctor.map((lines, k) => (
          <motion.g key={k} initial={false} animate={{ opacity: (k === 1) === facOn ? 1 : 0 }} transition={t.fade}>
            {lines.map((l, i) => (
              <text key={i} className="saf-mem" x={ws.x + 7} y={ws.y + 30 + i * LH + LH / 2}>
                {l}
              </text>
            ))}
          </motion.g>
        ))}
      </g>

      {PARTS.map((p, i) => {
        const pt = L.part[i]
        const [ix, iy, iw] = pt.iface
        const [sx, sy, sw, sh] = pt.slot
        const fam = slots?.[p.id]
        return (
          <g key={p.id}>
            {/* Association WeighingSystem → interface, med pladsen oven på */}
            <path className="saf-line" d={pt.assoc} />
            <path className="saf-head" d={arrow(pt.assocEnd, 'down')} />
            <text className="saf-role" x={pt.role[0]} y={pt.role[1]}>
              {p.role}
            </text>
            <rect className="saf-slot" x={sx} y={sy} width={sw} height={sh} rx={sh / 2} />

            {/* Realisering */}
            <path className="saf-line saf-dash" d={pt.real} />
            <path className="saf-tri" d={tri(pt.tri, pt.triDir)} />
            <Iface x={ix} y={iy} w={iw} name={p.iface} tone="idle" />

            {(['f', 'n'] as Fam[]).map((f) => {
              const b = pt.prod[f]
              return (
                <Box key={f} b={b} tone={prodTone(p.id, f)}>
                  <Lines x={b[0] + b[2] / 2} y={b[1] + b[3] / 2} lines={L.narrow ? p.brk[f] : [p.cls[f]]} cls="saf-pname" />
                </Box>
              )
            })}

            {fam && (
              <motion.g
                key={`${p.id}-${step}`}
                className="saf-chip"
                data-tone={step === 2 && p.id === 'di' ? 'neg' : 'focus'}
                initial={
                  travel
                    ? { x: pt.prod[fam][0] + pt.prod[fam][2] / 2 - (sx + sw / 2), y: pt.prod[fam][1] + pt.prod[fam][3] / 2 - (sy + sh / 2), opacity: 0 }
                    : false
                }
                animate={{ x: 0, y: 0, opacity: 1 }}
                transition={{
                  default: { ...t.travel, delay: (step === 2 ? 0.1 : 0.85) + i * 0.15 },
                  opacity: { ...t.fade, delay: (step === 2 ? 0.1 : 0.85) + i * 0.15 },
                }}
              >
                <rect x={sx} y={sy} width={sw} height={sh} rx={sh / 2} />
                <text x={sx + sw / 2} y={sy + sh / 2}>
                  {p.cls[fam]}
                </text>
              </motion.g>
            )}
          </g>
        )
      })}

      {/* Abstract factory og concrete factories */}
      <motion.g initial={false} animate={{ opacity: facOn ? 1 : 0, y: facOn ? 0 : 6 }} transition={facOn ? t.place : t.fade}>
        <path className="saf-line saf-dash" d={L.facReal.d} />
        <path className="saf-tri" d={tri(L.facReal.tri, L.facReal.dir)} />
        <Iface
          x={fac.x}
          y={fac.y}
          w={fac.w}
          name="IWeighingSystemFactory"
          tone={step === 3 ? 'focus' : 'idle'}
          ops={['+ CreateWeighingUnit(): IWeighingUnit', '+ CreatePrinter(): IPrinter', '+ CreateDisplay(): IDisplay']}
        />
        {(['f', 'n'] as Fam[]).map((f) => {
          const b = L.facs[f]
          return (
            <Box key={f} b={b} tone={facTone(f)}>
              <text className="saf-cname" x={b[0] + b[2] / 2} y={b[1] + b[3] / 2}>
                {f === 'f' ? 'FøtexFactory' : 'NettoFactory'}
              </text>
            </Box>
          )
        })}
      </motion.g>
    </svg>
  )
}

/* ------------------------------ Klientkoden ------------------------------ */

const COMBOS: Fam[][] = [
  ['f', 'f', 'f'],
  ['f', 'f', 'n'],
  ['f', 'n', 'f'],
  ['f', 'n', 'n'],
  ['n', 'f', 'f'],
  ['n', 'f', 'n'],
  ['n', 'n', 'f'],
  ['n', 'n', 'n'],
]

function Code({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="saf-code">
      {lines.map((l, i) => (
        <code key={i} className="saf-ln">
          {l}
        </code>
      ))}
    </div>
  )
}

const hl = (s: string, tone: 'focus' | 'neg' = 'focus') => (
  <span className="saf-hl" data-tone={tone}>
    {s}
  </span>
)
/** Brudpunkter efter komma og parentes, så lange kald ikke knækker midt i et ord. */
const wb = (s: string) =>
  s.split(/(?<=[,(])/).map((p, i, a) => (
    <Fragment key={i}>
      {p}
      {i < a.length - 1 && <wbr />}
    </Fragment>
  ))

function Client({ step }: { step: number }) {
  const variants: ReactNode[] = [
    <Code
      key={0}
      lines={['// Create a Føtex weight', 'var føtexWs = new WeighingSystem(', <>{'    '}{wb('new FøtexWeighingUnit(), new FøtexPrinter(), new FøtexDisplay());')}</>]}
    />,
    <div key={1} className="saf-combos">
      <div className="saf-combos-head">
        <span className="saf-count">2 · 2 · 2 = 8 kombinationer</span>
        <span className="saf-legend">F = Føtex, N = Netto (unit · printer · display)</span>
      </div>
      <ol className="saf-combos-grid">
        {COMBOS.map((c, i) => {
          const ok = c.every((f) => f === c[0])
          return (
            <li key={i} data-ok={ok || undefined}>
              <span className="saf-fam">{c.map((f) => (f === 'f' ? 'F' : 'N')).join(' ')}</span>
              {ok && <span className="saf-ok">rigtig vægt</span>}
            </li>
          )
        })}
      </ol>
    </div>,
    <div key={2}>
      <Code
        lines={[
          '// Create a Netto weight',
          'var nettoWs = new WeighingSystem(',
          <>
            {'    '}
            {wb('new NettoWeighingUnit(), new NettoPrinter(), ')}
            {hl('new FøtexDisplay()', 'neg')});
          </>,
        ]}
      />
      <p className="saf-quote">“Creation of WeighingSystem variants is complex and error prone”</p>
    </div>,
    <Code
      key={3}
      lines={[
        <>{wb('public WeighingSystem(IWeighingSystemFactory factory)')}</>,
        '{',
        <>
          {'    _weighingUnit = '}
          {hl('factory.CreateWeighingUnit()')};
        </>,
        <>
          {'    _printer = '}
          {hl('factory.CreatePrinter()')};
        </>,
        <>
          {'    _display = '}
          {hl('factory.CreateDisplay()')};
        </>,
        '}',
      ]}
    />,
    <Code key={4} lines={['// Create a Netto weight', <>var nettoWs = {wb('new WeighingSystem(')}{hl('new NettoFactory()')});</>]} />,
    <Code
      key={5}
      lines={[
        <>var nettoWs = {wb('new WeighingSystem(new NettoFactory());')}</>,
        <>var føtexWs = {wb('new WeighingSystem(')}{hl('new FøtexFactory()')});</>,
      ]}
    />,
  ]
  return (
    <div className="saf-client">
      <div className="saf-client-head">Main</div>
      <Swap show={step} items={variants} />
    </div>
  )
}

function Versus({ on }: { on: boolean }) {
  return (
    <motion.div className="saf-vs" initial={false} animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }} transition={on ? t.settle : t.fade} aria-hidden={!on || undefined}>
      <div className="saf-vs-col">
        <span className="saf-vs-name">Factory Method</span>
        <span>
          <b>subklassen</b> beslutter (arv) · ét produkt
        </span>
      </div>
      <div className="saf-vs-col" data-me>
        <span className="saf-vs-name">Abstract Factory</span>
        <span>
          et <b>injiceret factory-objekt</b> beslutter (komposition) · en familie af produkter
        </span>
      </div>
    </motion.div>
  )
}

function AbstractFactory({ step }: { step: number }) {
  return (
    <div className="saf">
      <Diagram L={WIDE} step={step} className="saf-wide" />
      <Diagram L={NARROW} step={step} className="saf-narrow" />
      <Client step={step} />
      <Versus on={step === 5} />
    </div>
  )
}

const viz: VizDef = {
  id: 'abstract-factory',
  title: 'Familien kan ikke blandes',
  steps: [
    {
      caption: 'Efter DIP har `WeighingSystem` tre pladser: `IWeighingUnit`, `IPrinter` og `IDisplay`. `Main` vælger selv en klasse til hver.',
      hold: 2600,
    },
    { caption: '`Main` vælger hver del for sig: 2 · 2 · 2 = **8** kombinationer. Kun to af dem er rigtige vægte.', hold: 2600 },
    { caption: 'En Netto-vægt får `new FøtexDisplay()`. Alle tre opfylder deres interface — intet stopper det.', hold: 2800 },
    {
      caption: '`IWeighingSystemFactory` har én create-metode pr. del. `FøtexFactory` og `NettoFactory` laver hver sin familie.',
      hold: 2800,
    },
    { caption: '`new WeighingSystem(new NettoFactory())` — factoryen udfylder alle tre pladser med Netto.', hold: 3000 },
    {
      caption:
        'Skift factory, og hele familien skifter. Klienten beslutter **hvilken factory** — factoryen beslutter klasserne. (Factory Method: en subklasse beslutter gennem arv.)',
      hold: 3200,
    },
  ],
  Component: AbstractFactory,
}

export default viz
