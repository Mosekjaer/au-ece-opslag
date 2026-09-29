import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './arkitekturstile.css'

/* 2-SW-Architecture - Process 2.pdf (PDF-sider): s. 21 (“almost never limited to a
   single architectural style”), s. 24 (Layers: Users, Presentation Layer, Business
   Layer, Data Layer, Data Sources, Services; “Dependencies are only allowed from
   higher layer to lower layer”, DIP, “this doesn’t mean that data cannot flow up”,
   events), s. 25 (layer = logisk, tier = fysisk), s. 44 (N-tier: Presentation Tier /
   Business Logic Tier / Database Tier, Client Computers, Application Server(s),
   Database Server(s), Internet og Intranet; “The software running on a tier may
   itself consist of multiple layers.”), s. 66 (MS AAG application overview: Browser,
   HTTP(S), Web Server med Presentation/Business/Data, Protected Network, TCP/IP,
   Web Application Identity, Database Server med User Store og Product Orders, Forms
   Authentication & Roles, Windows Authentication & Database Roles).
   Slidenes versaler er skrevet med almindelig skrift. Event-pilen er illustrativ:
   slidet siger kun, at data kan flyde op, fx med events. */

type Phase = 'A' | 'B' | 'C'
const phaseOf = (step: number): Phase => (step <= 2 ? 'A' : step === 3 ? 'B' : 'C')

type Rect = [number, number, number, number]
type LayerId = 'pres' | 'bus' | 'data'
const LAYER_NAME: Record<LayerId, string> = {
  pres: 'Presentation Layer',
  bus: 'Business Layer',
  data: 'Data Layer',
}

interface Layout {
  w: number
  h: number
  /** Kagens forskydning i fase A og B. */
  cake: Record<'A' | 'B', [number, number]>
  /** Lagene i fase C (inde i web serveren), absolut. */
  inWeb: Record<LayerId, Rect>
  tiers: ReactNode
  chain: ReactNode
  notes: ReactNode
}

/* Kagen i egne koordinater (bredde 280). */
const CAKE: Record<LayerId | 'users' | 'src' | 'svc', Rect> = {
  users: [0, 34, 280, 30],
  pres: [0, 88, 280, 34],
  bus: [0, 146, 280, 34],
  data: [0, 204, 280, 34],
  src: [0, 262, 130, 34],
  svc: [150, 262, 130, 34],
}

/* ------------------------------ Pilespidser ------------------------------ */

type Dir = 'up' | 'down' | 'left' | 'right'
function tri(x: number, y: number, dir: Dir, a = 7, b = 4) {
  switch (dir) {
    case 'down':
      return `M${x - b} ${y - a} L${x} ${y} L${x + b} ${y - a} Z`
    case 'up':
      return `M${x - b} ${y + a} L${x} ${y} L${x + b} ${y + a} Z`
    case 'right':
      return `M${x - a} ${y - b} L${x} ${y} L${x - a} ${y + b} Z`
    default:
      return `M${x + a} ${y - b} L${x} ${y} L${x + a} ${y + b} Z`
  }
}
/** Åben pilespids (to streger). */
const vee = (x: number, y: number, dir: Dir) => tri(x, y, dir, 8, 4.5).replace(' Z', '')

function DoubleV({ x, y1, y2, className = 'ast-conn' }: { x: number; y1: number; y2: number; className?: string }) {
  return (
    <g className={className}>
      <path d={`M${x} ${y1 + 5} V${y2 - 5}`} />
      <path className="ast-fill" d={tri(x, y1, 'up', 6, 3.5)} />
      <path className="ast-fill" d={tri(x, y2, 'down', 6, 3.5)} />
    </g>
  )
}
function DoubleH({ y, x1, x2 }: { y: number; x1: number; x2: number }) {
  return (
    <g className="ast-conn">
      <path d={`M${x1 + 5} ${y} H${x2 - 5}`} />
      <path className="ast-fill" d={tri(x1, y, 'left', 7, 4)} />
      <path className="ast-fill" d={tri(x2, y, 'right', 7, 4)} />
    </g>
  )
}

function Lines({ x, y, lines, anchor = 'middle', className }: { x: number; y: number; lines: string[]; anchor?: 'start' | 'middle' | 'end'; className?: string }) {
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

/* ------------------------------ Ikoner ------------------------------ */

function Monitor({ x, y }: { x: number; y: number }) {
  return (
    <g className="ast-icon">
      <rect x={x} y={y} width={30} height={20} rx={2} />
      <path d={`M${x - 3} ${y + 24} H${x + 33}`} />
    </g>
  )
}
function Tower({ x, y }: { x: number; y: number }) {
  return (
    <g className="ast-icon">
      <rect x={x} y={y} width={20} height={40} rx={2} />
      <path d={`M${x + 4} ${y + 8} H${x + 16} M${x + 4} ${y + 14} H${x + 16}`} />
    </g>
  )
}
function Cyl({ x, y, w, h, className = 'ast-icon' }: { x: number; y: number; w: number; h: number; className?: string }) {
  const ry = Math.min(10, w * 0.14)
  return (
    <g className={className}>
      <path d={`M${x} ${y + ry} V${y + h - ry} A${w / 2} ${ry} 0 0 0 ${x + w} ${y + h - ry} V${y + ry}`} />
      <ellipse cx={x + w / 2} cy={y + ry} rx={w / 2} ry={ry} />
    </g>
  )
}

/* ------------------------------ Layouts ------------------------------ */

const WIDE: Layout = {
  w: 860,
  h: 312,
  cake: { A: [290, 0], B: [30, 0] },
  inWeb: {
    pres: [282, 66, 200, 34],
    bus: [282, 114, 200, 34],
    data: [282, 162, 200, 34],
  },
  tiers: (
    <>
      <text className="ast-tag" x={352} y={24}>
        tier = fysisk
      </text>
      {[
        { y: 34, name: ['Presentation', 'Tier'], cap: 'Client Computers' },
        { y: 126, name: ['Business', 'Logic Tier'], cap: 'Application Server(s)' },
        { y: 218, name: ['Database', 'Tier'], cap: 'Database Server(s)' },
      ].map((b) => (
        <g key={b.y}>
          <rect className="ast-band" x={340} y={b.y} width={510} height={76} rx={4} />
          <Lines className="ast-tier-name" x={356} y={b.y + 34} lines={b.name} anchor="start" />
          <text className="ast-cap" x={680} y={b.y + 42}>
            {b.cap}
          </text>
        </g>
      ))}
      <Monitor x={520} y={58} />
      <Monitor x={566} y={58} />
      <Monitor x={612} y={58} />
      <Tower x={548} y={144} />
      <Tower x={580} y={144} />
      <Cyl x={560} y={236} w={40} h={44} />
      <g className="ast-net">
        <path d="M340 118 H850" />
        <path d="M340 210 H850" />
      </g>
      <text className="ast-net-l" x={470} y={114}>
        Internet
      </text>
      <text className="ast-net-l" x={470} y={206}>
        Intranet
      </text>
      <DoubleV x={456} y1={98} y2={138} className="ast-conn ast-conn-hot" />
      <DoubleV x={456} y1={190} y2={230} className="ast-conn ast-conn-hot" />
    </>
  ),
  chain: (
    <>
      <rect className="ast-node" x={20} y={116} width={120} height={44} rx={4} />
      <text className="ast-node-t" x={80} y={138}>
        Browser
      </text>
      <DoubleH y={138} x1={140} x2={262} />
      <text className="ast-proto" x={201} y={128} textAnchor="middle">
        HTTP(S)
      </text>
      <rect className="ast-node" x={262} y={30} width={240} height={180} rx={4} />
      <text className="ast-node-t" x={382} y={52}>
        Web Server
      </text>
      <DoubleH y={138} x1={502} x2={642} />
      <text className="ast-proto" x={572} y={128} textAnchor="middle">
        TCP/IP
      </text>
      <text className="ast-node-t" x={742} y={52}>
        Database Server
      </text>
      <Cyl x={652} y={62} w={180} h={148} className="ast-node ast-cyl" />
      <text className="ast-db-b" x={742} y={112}>
        User Store
      </text>
      <text className="ast-db" x={742} y={128}>
        (user names &amp; passwords)
      </text>
      <path className="ast-db-rule" d="M690 146 H794" />
      <text className="ast-db-b" x={742} y={172}>
        Product Orders
      </text>
    </>
  ),
  notes: (
    <>
      <text className="ast-note" x={382} y={230}>
        Protected Network
      </text>
      <Lines className="ast-note" x={572} y={156} lines={['Web Application', 'Identity']} />
      <g className="ast-up">
        <path d={`M201 248 V${148}`} />
        <path className="ast-fill" d={tri(201, 146, 'up', 7, 4)} />
        <path d={`M572 248 V${186}`} />
        <path className="ast-fill" d={tri(572, 184, 'up', 7, 4)} />
      </g>
      <Lines className="ast-note" x={201} y={266} lines={['Forms Authentication', '& Roles']} />
      <Lines className="ast-note" x={572} y={266} lines={['Windows Authentication', '& Database Roles']} />
    </>
  ),
}

const NARROW: Layout = {
  w: 320,
  h: 604,
  cake: { A: [20, 150], B: [20, 0] },
  inWeb: {
    pres: [60, 144, 200, 34],
    bus: [60, 190, 200, 34],
    data: [60, 236, 200, 34],
  },
  tiers: (
    <>
      <text className="ast-tag" x={20} y={330}>
        tier = fysisk
      </text>
      {[
        { y: 340, name: ['Presentation', 'Tier'], cap: ['Client', 'Computers'] },
        { y: 428, name: ['Business', 'Logic Tier'], cap: ['Application', 'Server(s)'] },
        { y: 516, name: ['Database', 'Tier'], cap: ['Database', 'Server(s)'] },
      ].map((b) => (
        <g key={b.y}>
          <rect className="ast-band" x={4} y={b.y} width={312} height={78} rx={4} />
          <Lines className="ast-tier-name" x={14} y={b.y + 34} lines={b.name} anchor="start" />
          <Lines className="ast-cap" x={236} y={b.y + 34} lines={b.cap} anchor="start" />
        </g>
      ))}
      <Monitor x={134} y={362} />
      <Monitor x={176} y={362} />
      <Tower x={150} y={446} />
      <Tower x={180} y={446} />
      <Cyl x={156} y={530} w={40} h={48} />
      <g className="ast-net">
        <path d="M4 422 H316" />
        <path d="M4 510 H316" />
      </g>
      <text className="ast-net-l" x={122} y={418}>
        Internet
      </text>
      <text className="ast-net-l" x={122} y={506}>
        Intranet
      </text>
      <DoubleV x={110} y1={402} y2={442} className="ast-conn ast-conn-hot" />
      <DoubleV x={110} y1={490} y2={530} className="ast-conn ast-conn-hot" />
    </>
  ),
  chain: (
    <>
      <rect className="ast-node" x={100} y={8} width={120} height={40} rx={4} />
      <text className="ast-node-t" x={160} y={32}>
        Browser
      </text>
      <DoubleV x={160} y1={48} y2={106} />
      <text className="ast-proto" x={170} y={82} textAnchor="start">
        HTTP(S)
      </text>
      <rect className="ast-node" x={40} y={106} width={240} height={178} rx={4} />
      <text className="ast-node-t" x={160} y={128}>
        Web Server
      </text>
      <DoubleV x={160} y1={306} y2={390} />
      <text className="ast-proto" x={170} y={336} textAnchor="start">
        TCP/IP
      </text>
      <text className="ast-node-t" x={160} y={412}>
        Database Server
      </text>
      <Cyl x={60} y={420} w={200} h={150} className="ast-node ast-cyl" />
      <text className="ast-db-b" x={160} y={472}>
        User Store
      </text>
      <text className="ast-db" x={160} y={488}>
        (user names &amp; passwords)
      </text>
      <path className="ast-db-rule" d="M110 506 H210" />
      <text className="ast-db-b" x={160} y={530}>
        Product Orders
      </text>
    </>
  ),
  notes: (
    <>
      <text className="ast-note" x={160} y={300} textAnchor="middle">
        Protected Network
      </text>
      <Lines className="ast-note" x={150} y={72} lines={['Forms Authentication', '& Roles']} anchor="end" />
      <Lines className="ast-note" x={170} y={354} lines={['Web Application', 'Identity']} anchor="start" />
      <Lines className="ast-note" x={150} y={336} lines={['Windows', 'Authentication', '& Database Roles']} anchor="end" />
    </>
  ),
}

/* ------------------------------ Diagram ------------------------------ */

const vis = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

function Layer({ id, pos, logical }: { id: LayerId; pos: Rect; logical: boolean }) {
  const [x, y, w, h] = pos
  return (
    <motion.g className="ast-layer" initial={false} animate={{ x, y }} transition={t.travel}>
      <motion.rect initial={false} animate={{ width: w }} height={h} rx={3} transition={t.travel} />
      <motion.text initial={false} animate={{ x: w / 2 }} y={h / 2} transition={t.travel}>
        {LAYER_NAME[id]}
      </motion.text>
      <title>{logical ? 'layer (logisk)' : LAYER_NAME[id]}</title>
    </motion.g>
  )
}

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const ph = phaseOf(step)
  const [dx, dy] = L.cake[ph === 'C' ? 'B' : ph]
  const box = (r: Rect) => ({ x: r[0], y: r[1], width: r[2], height: r[3] })
  return (
    <svg className={`ast-svg ${className}`} viewBox={`0 0 ${L.w} ${L.h}`} aria-hidden="true">
      {/* Kagen: ramme, users, datakilder og pile følger forskydningen */}
      <motion.g
        initial={false}
        animate={{ x: dx, y: dy, opacity: ph === 'C' ? 0 : 1 }}
        transition={ph === 'C' ? t.fade : t.travel}
      >
        <motion.rect className="ast-frame" x={-10} y={8} width={300} height={298} rx={6} {...vis(step >= 2)} />
        <motion.text className="ast-tag" x={0} y={24} {...vis(step >= 2)}>
          layer = logisk
        </motion.text>
        <rect className="ast-box" {...box(CAKE.users)} rx={3} />
        <text className="ast-box-t" x={140} y={CAKE.users[1] + 15}>
          Users
        </text>
        <rect className="ast-box" {...box(CAKE.src)} rx={3} />
        <Cyl x={14} y={270} w={20} h={18} />
        <text className="ast-box-t" x={78} y={279}>
          Data Sources
        </text>
        <rect className="ast-box" {...box(CAKE.svc)} rx={3} />
        <text className="ast-box-t" x={215} y={279}>
          Services
        </text>
        <DoubleV x={140} y1={64} y2={88} />
        <DoubleV x={65} y1={238} y2={262} />
        <DoubleV x={215} y1={238} y2={262} />
        {/* Afhængigheder nedad (stiplet, åben spids) */}
        <motion.g className="ast-dep" {...vis(step >= 1)}>
          <path d="M210 122 V144" />
          <path className="ast-vee" d={vee(210, 145, 'down')} />
          <path d="M210 180 V202" />
          <path className="ast-vee" d={vee(210, 203, 'down')} />
        </motion.g>
        {/* Data op via event (illustrativt) */}
        <motion.g className="ast-event" {...vis(step >= 1, 0.5)}>
          <path d="M84 204 V186" />
          <path className="ast-fill" d={tri(84, 181, 'up', 6, 3.5)} />
          <text x={92} y={197}>
            event
          </text>
        </motion.g>
      </motion.g>

      {/* Tiers */}
      <motion.g {...vis(ph === 'B', 0.3)}>{L.tiers}</motion.g>

      {/* Application overview */}
      <motion.g className="ast-chain" data-key={step >= 6 || undefined} {...vis(ph === 'C')}>
        {L.chain}
      </motion.g>
      <motion.g {...vis(step >= 5)}>{L.notes}</motion.g>

      {/* De tre lag lever videre fra kagen ind i web serveren */}
      {(['pres', 'bus', 'data'] as LayerId[]).map((id) => {
        const c = CAKE[id]
        const pos: Rect = ph === 'C' ? L.inWeb[id] : [c[0] + dx, c[1] + dy, c[2], c[3]]
        return <Layer key={id} id={id} pos={pos} logical={ph !== 'C'} />
      })}
    </svg>
  )
}

function Legend({ step }: { step: number }) {
  const items: { on: boolean; sw: ReactNode; label: string }[] = [
    {
      on: step >= 1,
      sw: (
        <svg viewBox="0 0 32 12">
          <path className="ast-dep-l" d="M2 6 H28" />
          <path className="ast-dep-l" d="M22 2 L29 6 L22 10" />
        </svg>
      ),
      label: 'afhængighed (nedad)',
    },
    {
      on: step >= 1,
      sw: (
        <svg viewBox="0 0 32 12">
          <path className="ast-ev-l" d="M2 6 H25" />
          <path className="ast-ev-h" d="M23 2.5 L30 6 L23 9.5 Z" />
        </svg>
      ),
      label: 'event: data op (illustrativt)',
    },
    {
      on: step >= 3,
      sw: (
        <svg viewBox="0 0 32 12">
          <path className="ast-net-sw" d="M1 6 H31" />
        </svg>
      ),
      label: 'tier-grænse (netværk)',
    },
    {
      on: step >= 3,
      sw: (
        <svg viewBox="0 0 32 12">
          <path className="ast-conn-l" d="M7 6 H25" />
          <path className="ast-ev-h" d="M8 2.5 L2 6 L8 9.5 Z M24 2.5 L30 6 L24 9.5 Z" />
        </svg>
      ),
      label: 'forbindelse',
    },
    { on: step >= 6, sw: <span className="ast-sw ast-sw-tier" />, label: 'tier (fysisk)' },
    { on: step >= 6, sw: <span className="ast-sw ast-sw-layer" />, label: 'layer (logisk)' },
  ]
  return (
    <ul className="ast-legend">
      {items.map((it) => (
        <motion.li key={it.label} {...vis(it.on)}>
          <span className="ast-legend-sw">{it.sw}</span>
          {it.label}
        </motion.li>
      ))}
    </ul>
  )
}

function Styles({ step }: { step: number }) {
  return (
    <div className="ast">
      <Diagram L={WIDE} step={step} className="ast-wide" />
      <Diagram L={NARROW} step={step} className="ast-narrow" />
      <Legend step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'arkitekturstile',
  title: 'Lag i en tier, tiers i et system',
  steps: [
    { caption: 'Layers: applikationens concerns i stablede lag.', hold: 2000 },
    { caption: 'Afhængigheder kun **nedad** — som ved DIP. Data må godt flyde op, fx med events.', hold: 2800 },
    { caption: 'Et **layer** er en logisk opdeling — alt kan køre på én maskine.', hold: 2400 },
    { caption: 'Et **tier** er en fysisk opdeling og kører på en node.', hold: 2800 },
    { caption: 'Softwaren på én tier kan selv bestå af flere lag.', hold: 2800 },
    { caption: 'Deployment constraints og teknologier tegnes på forbindelserne.', hold: 2600 },
    {
      caption: 'To stile i ét system: **N-tier** mellem maskinerne, **layers** inde i web serveren.',
      hold: 2600,
    },
  ],
  Component: Styles,
}

export default viz
