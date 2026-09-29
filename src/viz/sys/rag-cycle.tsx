import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './rag-cycle.css'

/* 05.1-deadlocks.pdf s. 4 (rainy day-tracet: t = 0, 1, 4, 5, 6), s. 5 (de fire
   betingelser), s. 6 (programanalysen af mutex_error_deadlock), s. 7 (RAG’en:
   T = {thread_a, thread_b}, R = {mut_a, mut_b}, request edges {thread_a, mut_b},
   {thread_b, mut_a}, assignment edges {mut_a, thread_a}, {mut_b, thread_b}) og
   s. 8 (cyklus + én instans → deadlock). Indhold: src/content/sys/p4-deadlocks.ts. */

type Pt = { x: number; y: number }

// Geometri i viewBox 300 × 260. Cirkler = tråde, rektangler = ressourcer.
const R = 38
const TA: Pt = { x: 55, y: 55 }
const TB: Pt = { x: 245, y: 205 }
const MB: Pt = { x: 245, y: 55 }
const MA: Pt = { x: 55, y: 205 }
const RW = 90
const RH = 52
// Instans-prikken sidder i den side, assignment-kanten går ud fra.
const DOT_A: Pt = { x: MA.x, y: MA.y - RH / 2 + 11 }
const DOT_B: Pt = { x: MB.x, y: MB.y + RH / 2 - 11 }

interface Edge {
  id: string
  kind: 'request' | 'assignment'
  from: Pt
  to: Pt
  at: number
  label: Pt
  anchor: 'start' | 'middle' | 'end'
}

const EDGES: Edge[] = [
  // mut_a → thread_a (assignment, fra prikken op til cirklen)
  { id: 'a1', kind: 'assignment', from: DOT_A, to: { x: TA.x, y: TA.y + R }, at: 1, label: { x: TA.x + 9, y: 134 }, anchor: 'start' },
  // mut_b → thread_b
  { id: 'a2', kind: 'assignment', from: DOT_B, to: { x: TB.x, y: TB.y - R }, at: 2, label: { x: TB.x - 9, y: 134 }, anchor: 'end' },
  // thread_a → mut_b (request, til rektanglets kant)
  { id: 'r1', kind: 'request', from: { x: TA.x + R, y: TA.y }, to: { x: MB.x - RW / 2, y: MB.y }, at: 3, label: { x: 147, y: 44 }, anchor: 'middle' },
  // thread_b → mut_a
  { id: 'r2', kind: 'request', from: { x: TB.x - R, y: TB.y }, to: { x: MA.x + RW / 2, y: MA.y }, at: 4, label: { x: 153, y: 194 }, anchor: 'middle' },
]

const AH = 9 // pilespidsens længde

function arrow(e: Edge) {
  const dx = e.to.x - e.from.x
  const dy = e.to.y - e.from.y
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const bx = e.to.x - ux * AH
  const by = e.to.y - uy * AH
  const line = `M${e.from.x} ${e.from.y} L${bx} ${by}`
  const head = `M${e.to.x} ${e.to.y} L${bx - uy * 4.5} ${by + ux * 4.5} L${bx + uy * 4.5} ${by - ux * 4.5} Z`
  return { line, head }
}

const TRACE = [
  { t: '', code: 'Rainy day scenario (05.1 s. 4)', tag: null },
  { t: 't = 0', code: 'thread_a: mut_a.lock();', tag: 'uncontended' },
  { t: 't = 1', code: 'thread_b: mut_b.lock();', tag: 'uncontended' },
  { t: 't = 4', code: 'thread_a: mut_b.lock();', tag: 'contended - block' },
  { t: 't = 5', code: 'thread_b: mut_a.lock();', tag: 'contended - block' },
  { t: 't = 6', code: 'deadlocked!', tag: null },
]

const CONDITIONS = [
  { name: 'Mutual exclusion', at: 1, why: <>en mutex kan kun låses én gang — én prik pr. ressource</> },
  {
    name: 'Hold and wait',
    at: 3,
    why: (
      <>
        <code>thread_a</code> holder <code>mut_a</code> og venter på <code>mut_b</code>
      </>
    ),
  },
  {
    name: 'No preemption',
    at: 3,
    why: (
      <>
        kun <code>thread_b</code>, der låste <code>mut_b</code>, kan låse den op
      </>
    ),
  },
  {
    name: 'Circular wait',
    at: 4,
    why: (
      <>
        <code>thread_a → mut_b → thread_b → mut_a → thread_a</code>
      </>
    ),
  },
]

function Graph({ step }: { step: number }) {
  const cycle = step >= 4
  const threadTone = (holdsAt: number, waitsAt: number) =>
    cycle ? 'neg' : step >= waitsAt ? 'focus' : step >= holdsAt ? 'held' : 'idle'
  return (
    <svg className="rg-svg" viewBox="0 0 300 260" aria-hidden="true">
      {EDGES.map((e) => {
        const on = step >= e.at
        const { line, head } = arrow(e)
        const tone = cycle ? 'neg' : step === e.at ? 'focus' : 'idle'
        return (
          <g key={e.id} className="rg-edge" data-tone={tone} data-kind={e.kind}>
            <motion.path
              d={line}
              className="rg-line"
              initial={false}
              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={on ? { ...t.travel, duration: 0.7 } : t.fade}
            />
            <motion.path
              d={head}
              className="rg-head"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: 0.55 } : t.fade}
            />
            <motion.text
              x={e.label.x}
              y={e.label.y}
              textAnchor={e.anchor}
              className="rg-elabel"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: 0.4 } : t.fade}
            >
              {e.kind}
            </motion.text>
          </g>
        )
      })}

      {/* Tråde */}
      {[
        { p: TA, name: 'thread_a', tone: threadTone(1, 3) },
        { p: TB, name: 'thread_b', tone: threadTone(2, 4) },
      ].map((n) => (
        <g key={n.name} className="rg-node" data-tone={n.tone}>
          <circle cx={n.p.x} cy={n.p.y} r={R} className="rg-shape" />
          <text x={n.p.x} y={n.p.y} className="rg-name" textAnchor="middle" dominantBaseline="central">
            {n.name}
          </text>
        </g>
      ))}

      {/* Ressourcer med én instans (prik) hver */}
      {[
        { p: MA, dot: DOT_A, name: 'mut_a', ny: MA.y + 11, tone: cycle ? 'neg' : step >= 1 ? 'held' : 'idle' },
        { p: MB, dot: DOT_B, name: 'mut_b', ny: MB.y - 9, tone: cycle ? 'neg' : step >= 2 ? 'held' : 'idle' },
      ].map((n) => (
        <g key={n.name} className="rg-node" data-tone={n.tone}>
          <rect x={n.p.x - RW / 2} y={n.p.y - RH / 2} width={RW} height={RH} rx={4} className="rg-shape" />
          <circle cx={n.dot.x} cy={n.dot.y} r={4} className="rg-dot" />
          <text x={n.p.x} y={n.ny} className="rg-name" textAnchor="middle" dominantBaseline="central">
            {n.name}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Rag({ step }: { step: number }) {
  return (
    <div className="rg">
      <div className="rg-left">
        <Swap
          show={Math.min(step, TRACE.length - 1)}
          className="rg-trace"
          items={TRACE.map((r, i) => (
            <div key={i} className="rg-trace-row" data-dead={r.code === 'deadlocked!' || undefined}>
              {r.t && <span className="rg-t">{r.t}</span>}
              {r.t ? <code>{r.code}</code> : <span className="rg-t">{r.code}</span>}
              {r.tag && (
                <Tag tone={r.tag.startsWith('contended') ? 'neg' : 'idle'}>{r.tag}</Tag>
              )}
            </div>
          ))}
        />
        <Graph step={step} />
        <div className="rg-legend vcaps">
          <span>
            <i className="rg-key rg-key-circle" /> tråd
          </span>
          <span>
            <i className="rg-key rg-key-rect" /> ressource, prik = instans
          </span>
        </div>
      </div>

      <div className="rg-side">
        <span className="vcaps">Coffman-betingelser</span>
        <ol className="rg-conds">
          {CONDITIONS.map((c) => {
            const on = step >= c.at
            const tone = step >= 5 ? 'done' : step === c.at ? 'now' : on ? 'done' : 'off'
            return (
              <li key={c.name} className="rg-cond" data-state={tone}>
                <span className="rg-cond-name">{c.name}</span>
                <motion.span
                  className="rg-cond-why"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : 3 }}
                  transition={on ? t.settle : t.fade}
                >
                  {c.why}
                </motion.span>
              </li>
            )
          })}
        </ol>
        <motion.div
          className="rg-verdict"
          initial={false}
          animate={{ opacity: step >= 5 ? 1 : 0 }}
          transition={step >= 5 ? t.settle : t.fade}
        >
          Alle fire opfyldt, én instans pr. ressource → <strong>deadlock</strong>.
        </motion.div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'rag-cycle',
  title: 'To mutexes låst i modsat rækkefølge',
  steps: [
    {
      caption:
        'Slidets graf for `mutex_error_deadlock()`: to tråde (cirkler) og to mutexes (rektangler). Hver mutex har én instans — én prik.',
      hold: 2200,
    },
    {
      caption:
        '`thread_a` låser `mut_a`. En **assignment edge** går fra instansen til tråden. Kun én kan holde en mutex — *mutual exclusion*.',
      hold: 2400,
    },
    { caption: '`thread_b` låser `mut_b`, også ukonkurreret. Nu holder hver tråd én mutex.', hold: 1800 },
    {
      caption:
        '`thread_a` beder om `mut_b` og blokerer: en **request edge** `thread_a → mut_b`. Den holder og venter, og kun `thread_b` kan låse op.',
      hold: 2800,
    },
    {
      caption:
        '`thread_b` beder om `mut_a` og blokerer. Kanterne lukker en **cyklus** — *circular wait*. Med én instans pr. ressource er cyklussen en deadlock.',
      hold: 2800,
    },
    {
      caption:
        'Samme kode kan køre fint (*sunshine*); kun interleavingen er anderledes. Har ressourcerne flere instanser, er en cyklus nødvendig, men ikke nok.',
      hold: 3000,
    },
  ],
  Component: Rag,
}

export default viz
