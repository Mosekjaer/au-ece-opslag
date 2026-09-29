import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link } from '../kit/primitives'
import { t } from '../kit/motion'
import './views-4plus1.css'

/* 4-SW-Architecture - Documentation 2.pdf (PDF-sider): s. 9 (= Kruchten fig. 1: fire
   views om “Scenarios”, pilene Logical → Development, Logical → Process, Development →
   Physical, Process → Physical; “Audience:”/“Under Study:” kun ved logical view),
   s. 10 og 27 (UML-diagrammer pr. view i de blå bobler).
   41view-architecture_1995.pdf (Kruchten): fig. 3a s. 4 (Controller, Terminal,
   Numbering Plan, Conversation, Translation Services, Connection Services), fig. 5 s. 6
   (Controller process med tasks Low rate, High rate og Main controller task; Terminal
   process), fig. 9 s. 8 (lille PABX: node F kører Conversation process og Terminal
   Process, node K kører Controller Process), fig. 11 s. 10 (scenariet for et lokalt
   opkald, (1)–(5)). Kruchten viser intet development view for PABX’en; boksen står
   tom med en note. Nummerbadges i views viser, hvilke scripttrin der rører hvad. */

type View = 'log' | 'dev' | 'proc' | 'phys'
const AT: Record<View, number> = { log: 1, dev: 2, proc: 3, phys: 4 }
const NAME: Record<View, string> = {
  log: 'Logical View',
  dev: 'Development View',
  proc: 'Process View',
  phys: 'Physical View',
}
const STAKE: Record<View, ReactNode> = {
  log: (
    <>
      <span className="v41-k">Audience:</span> End-user
      <br />
      <span className="v41-k">Under Study:</span> Functionality
    </>
  ),
  dev: (
    <>
      Programmers
      <br />
      Software management
    </>
  ),
  proc: (
    <>
      Integrators
      <br />
      Performance
      <br />
      Scalability
    </>
  ),
  phys: (
    <>
      System engineers
      <br />
      Topology
      <br />
      Communications
    </>
  ),
}
const UML: Record<View, string[]> = {
  log: ['Package', 'Component', 'Composite structure', 'State', 'Communication'],
  dev: ['Package', 'Component'],
  proc: ['Activity', 'Communication', 'Deployment', 'Sequence'],
  phys: ['Deployment'],
}
const NEXT: Record<View, string> = {
  log: '→ Development, → Process',
  dev: '→ Physical',
  proc: '→ Physical',
  phys: '',
}

const SCRIPT = [
  { n: 1, msg: 'Off-Hook', dir: 'Controller → Terminal' },
  { n: 2, msg: 'dial tone', dir: 'Terminal → Controller' },
  { n: 3, msg: 'digit', dir: 'Controller → Terminal' },
  { n: 4, msg: 'digit', dir: 'Terminal → Numbering plan' },
  { n: 5, msg: 'open conversation', dir: 'Terminal → :Conversation' },
]
const PLAY = 5
/** Forsinkelse (s), når scripttrin n tændes i trin 5. */
const dly = (n: number) => 0.3 + (n - 1) * 0.45

/* ------------------------------ PABX-udsnit ------------------------------ */

function lit(step: number, n: number) {
  return {
    initial: false as const,
    animate: { opacity: step >= PLAY ? 1 : 0.35 },
    transition: step === PLAY ? { ...t.fade, delay: dly(n) } : t.fade,
  }
}

function Cls({ x, y, w, h, lines, on, n, step }: { x: number; y: number; w: number; h: number; lines: string[]; on?: boolean; n?: number; step: number }) {
  return (
    <g className="v41-c" data-on={(on && step >= PLAY) || undefined} style={{ transitionDelay: step === PLAY && n ? `${dly(n)}s` : undefined }}>
      <rect x={x} y={y} width={w} height={h} rx={2} />
      <text x={x + w / 2} y={y + h / 2 - (lines.length - 1) * 6.5}>
        {lines.map((l, i) => (
          <tspan key={i} x={x + w / 2} dy={i === 0 ? 0 : 13}>
            {l}
          </tspan>
        ))}
      </text>
    </g>
  )
}
function Badge({ x, y, n, step }: { x: number; y: number; n: string; step: number }) {
  return (
    <motion.text className="v41-badge" x={x} y={y} {...lit(step, Number(n[0]))}>
      {n}
    </motion.text>
  )
}
const head = (x: number, y: number, dir: 'r' | 'l' | 'd') =>
  dir === 'r' ? `M${x - 6} ${y - 3.5} L${x} ${y} L${x - 6} ${y + 3.5} Z` : dir === 'l' ? `M${x + 6} ${y - 3.5} L${x} ${y} L${x + 6} ${y + 3.5} Z` : `M${x - 3.5} ${y - 6} L${x} ${y} L${x + 3.5} ${y - 6} Z`

function LogicalPabx({ step }: { step: number }) {
  return (
    <svg className="v41-pabx" viewBox="0 0 280 102" aria-hidden="true">
      <Cls x={2} y={20} w={72} h={30} lines={['Controller']} on n={1} step={step} />
      <Cls x={110} y={20} w={72} h={30} lines={['Terminal']} on n={1} step={step} />
      <Cls x={200} y={20} w={78} h={30} lines={['Numbering', 'Plan']} on n={4} step={step} />
      <Cls x={104} y={72} w={84} h={28} lines={['Conversation']} on n={5} step={step} />
      <Cls x={2} y={68} w={90} h={32} lines={['Translation', 'Services']} step={step} />
      <Cls x={196} y={68} w={82} h={32} lines={['Connection', 'Services']} step={step} />
      <g className="v41-msg">
        <motion.g {...lit(step, 1)}>
          <path d="M76 30 H102" />
          <path className="v41-fill" d={head(108, 30, 'r')} />
        </motion.g>
        <motion.g {...lit(step, 2)}>
          <path d="M110 40 H82" />
          <path className="v41-fill" d={head(76, 40, 'l')} />
        </motion.g>
        <motion.g {...lit(step, 4)}>
          <path d="M184 35 H192" />
          <path className="v41-fill" d={head(198, 35, 'r')} />
        </motion.g>
        <motion.g {...lit(step, 5)}>
          <path d="M146 52 V64" />
          <path className="v41-fill" d={head(146, 70, 'd')} />
        </motion.g>
      </g>
      <Badge x={92} y={13} n="1 3" step={step} />
      <Badge x={92} y={60} n="2" step={step} />
      <Badge x={191} y={13} n="4" step={step} />
      <Badge x={160} y={64} n="5" step={step} />
    </svg>
  )
}

function ProcessPabx({ step }: { step: number }) {
  const on = step >= PLAY
  return (
    <svg className="v41-pabx" viewBox="0 0 280 102" aria-hidden="true">
      <g className="v41-pr" data-on={on || undefined}>
        <rect x={2} y={2} width={190} height={98} rx={4} />
        <text className="v41-pr-t" x={10} y={17}>
          Controller process
        </text>
      </g>
      <Cls x={10} y={28} w={84} h={28} lines={['Low rate']} step={step} />
      <Cls x={102} y={28} w={82} h={28} lines={['High rate']} step={step} />
      <Cls x={10} y={64} w={174} h={28} lines={['Main controller task']} on n={1} step={step} />
      <g className="v41-pr" data-on={on || undefined}>
        <rect x={214} y={32} width={64} height={44} rx={4} />
        <text className="v41-pr-t" x={246} y={50} textAnchor="middle">
          <tspan x={246}>Terminal</tspan>
          <tspan x={246} dy={13}>
            process
          </tspan>
        </text>
      </g>
      <motion.g className="v41-msg" {...lit(step, 1)}>
        <path d="M192 72 H206" />
        <path className="v41-fill" d={head(212, 72, 'r')} />
        <path d="M212 44 H198" />
        <path className="v41-fill" d={head(192, 44, 'l')} />
      </motion.g>
      <Badge x={203} y={90} n="1–5" step={step} />
    </svg>
  )
}

function Node3D({ x, y, w, h, name, on, children }: { x: number; y: number; w: number; h: number; name: string; on: boolean; children: ReactNode }) {
  const d = 8
  return (
    <g className="v41-node" data-on={on || undefined}>
      <path d={`M${x} ${y} L${x + d} ${y - d} H${x + w + d} V${y + h - d} L${x + w} ${y + h} V${y} Z M${x + w} ${y} L${x + w + d} ${y - d}`} />
      <rect x={x} y={y} width={w} height={h} />
      <text className="v41-node-t" x={x + 7} y={y + 15}>
        {name}
      </text>
      {children}
    </g>
  )
}

function PhysicalPabx({ step }: { step: number }) {
  const on = step >= PLAY
  return (
    <svg className="v41-pabx" viewBox="0 0 280 102" aria-hidden="true">
      <motion.path className="v41-link" d="M112 56 H150" {...lit(step, 1)} />
      <Node3D x={2} y={20} w={110} h={80} name="K" on={on}>
        <Cls x={10} y={46} w={94} h={34} lines={['Controller', 'Process']} on n={1} step={step} />
      </Node3D>
      <Node3D x={150} y={10} w={120} h={90} name="F" on={on}>
        <Cls x={158} y={30} w={104} h={30} lines={['Conversation', 'process']} on n={5} step={step} />
        <Cls x={158} y={64} w={104} h={30} lines={['Terminal', 'Process']} on n={1} step={step} />
      </Node3D>
    </svg>
  )
}

/* -------------------------------- Views -------------------------------- */

function Card({ v, step }: { v: View; step: number }) {
  const on = step >= AT[v]
  const hot = step === AT[v]
  const playing = step >= PLAY
  const body =
    v === 'log' ? (
      <LogicalPabx step={step} />
    ) : v === 'proc' ? (
      <ProcessPabx step={step} />
    ) : v === 'phys' ? (
      <PhysicalPabx step={step} />
    ) : (
      <p className="v41-none">ikke vist for PABX’en i artiklen</p>
    )
  return (
    <div className={`v41-view v41-${v}`} data-on={on || undefined} data-hot={hot || undefined} data-dim={(v === 'dev' && step === PLAY) || undefined}>
      <motion.div className="v41-stake" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
        {STAKE[v]}
      </motion.div>
      <div className="v41-box">
        <motion.div className="v41-box-in" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? { ...t.fade, delay: 0.15 } : t.fade}>
          <div className="v41-name">{NAME[v]}</div>
          <motion.ul
            className="v41-uml"
            aria-label="UML-diagrammer"
            initial={false}
            animate={{ opacity: step === PLAY ? 0.4 : 1 }}
            transition={t.recede}
          >
            {UML[v].map((u) => (
              <li key={u}>{u}</li>
            ))}
          </motion.ul>
          <motion.div
            className="v41-pabx-wrap"
            initial={false}
            animate={{ opacity: playing ? 1 : 0 }}
            transition={playing ? { ...t.fade, delay: 0.15 } : t.fade}
          >
            <span className="v41-pabx-l">PABX</span>
            {body}
          </motion.div>
          {NEXT[v] && <span className="v41-next">{NEXT[v]}</span>}
        </motion.div>
      </div>
    </div>
  )
}

function Scenarios({ step }: { step: number }) {
  const playing = step >= PLAY
  return (
    <div className="v41-scen" data-hot={step === PLAY || undefined}>
      <div className="v41-scen-in">
        <div className="v41-scen-t">Scenarios</div>
        <motion.div initial={false} animate={{ opacity: playing ? 1 : 0 }} transition={t.fade} className="v41-scen-sub">
          lokalt opkald (Kruchten fig. 11)
        </motion.div>
        <ol className="v41-script">
          {SCRIPT.map((s) => (
            <motion.li
              key={s.n}
              initial={false}
              animate={{ opacity: playing ? 1 : 0 }}
              transition={step === PLAY ? { ...t.fade, delay: dly(s.n) } : t.fade}
            >
              <b>({s.n}) {s.msg}</b>
              <span>{s.dir}</span>
            </motion.li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function Views({ step }: { step: number }) {
  return (
    <div className="v41">
      <div className="v41-grid">
        <Card v="log" step={step} />
        <div className="v41-a v41-a-ld">
          <Link on={step >= 2} tone={step === 2 ? 'focus' : 'idle'} />
        </div>
        <Card v="dev" step={step} />
        <div className="v41-a v41-a-lp">
          <Link vertical on={step >= 3} tone={step === 3 ? 'focus' : 'idle'} />
        </div>
        <div className="v41-a v41-a-dp">
          <Link vertical on={step >= 4} tone={step === 4 ? 'focus' : 'idle'} />
        </div>
        <Card v="proc" step={step} />
        <div className="v41-a v41-a-pp">
          <Link on={step >= 4} tone={step === 4 ? 'focus' : 'idle'} />
        </div>
        <Card v="phys" step={step} />
        <Scenarios step={step} />
      </div>
      <ul className="v41-legend">
        <li>
          <svg viewBox="0 0 30 10">
            <path d="M1 5 H23" />
            <path className="v41-fill" d="M22 1 L29 5 L22 9 Z" />
          </svg>
          views bygger på hinanden (Kruchten fig. 1, ikke UML)
        </li>
        <li>
          <span className="v41-chip">State</span> UML-diagrammer pr. view (slidet)
        </li>
        <motion.li initial={false} animate={{ opacity: step >= PLAY ? 1 : 0 }} transition={t.fade}>
          <span className="v41-sw-on" /> berørt af scenariet · <span className="v41-badge-sw">1–5</span> scripttrin
        </motion.li>
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'views-4plus1',
  title: 'Fire views og et opkald, der binder dem',
  steps: [
    { caption: 'Ét diagram kan ikke bære hele arkitekturen — 4+1 deler den i views omkring scenarierne.', hold: 2400 },
    { caption: '**Logical**: funktionaliteten for slutbrugeren.', hold: 2000 },
    { caption: '**Development**: kodens organisering i moduler og lag.', hold: 2000 },
    { caption: '**Process**: concurrency og performance — hvilken tråd kører hvad.', hold: 2200 },
    { caption: '**Physical**: softwaren placeret på hardware.', hold: 2000 },
    { caption: '**+1**: scenariet går gennem alle views og viser, at de hænger sammen.', hold: 3000 },
    { caption: 'Fire views til fire interessenter, bundet sammen af scenarierne.', hold: 2400 },
  ],
  Component: Views,
}

export default viz
