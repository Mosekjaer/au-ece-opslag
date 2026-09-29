import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './uml-klassediagram.css'

/* swd/kilder/uge-01_intro-oo-uml/UML class diagrams - The basics.pdf, s. 3:
   nederste diagram (Collection, AbstractCollection, Set, AbstractSet, HashSet,
   Areas med zipCodes : set / isValidZipCode(code)) og de tre labels
   “generalization (inherits)”, “realization (implements)” og
   “depencency (depends on)” — stavet rigtigt her. Øverste diagram: Polygon ◆— Point
   med 1, 3..* og {ordered}. Nøglens åbne diamant (aggregation) er udeladt med
   vilje: projektet tegner den aldrig. */

type Kind = 'gen' | 'real' | 'dep' | 'comp'
type P = [number, number]
type Box = [number, number, number, number]
type ClsId = 'coll' | 'acoll' | 'set' | 'aset' | 'hash' | 'areas' | 'poly' | 'point'

interface Cls {
  name: string
  stereo?: boolean
  abstract?: boolean
  attr?: string
  op?: string
}
const CLS: Record<ClsId, Cls> = {
  coll: { name: 'Collection', stereo: true },
  acoll: { name: 'AbstractCollection', abstract: true },
  set: { name: 'Set', stereo: true },
  aset: { name: 'AbstractSet', abstract: true },
  hash: { name: 'HashSet' },
  areas: { name: 'Areas', attr: 'zipCodes : set', op: 'isValidZipCode(code)' },
  poly: { name: 'Polygon' },
  point: { name: 'Point' },
}

interface Rel {
  id: string
  kind: Kind
  from: ClsId
  to: ClsId
  /** Trin hvor relationen tegnes. */
  step: number
  /** Forsinkelse inden for trinnet (s). */
  delay?: number
}
/* Pilen går fra den specifikke/afhængige klasse til den generelle; composition går
   fra helheden (diamanten) til delen. */
const RELS: Rel[] = [
  { id: 'g1', kind: 'gen', from: 'set', to: 'coll', step: 1 },
  { id: 'r1', kind: 'real', from: 'acoll', to: 'coll', step: 2 },
  { id: 'g2', kind: 'gen', from: 'aset', to: 'acoll', step: 3 },
  { id: 'r2', kind: 'real', from: 'aset', to: 'set', step: 3, delay: 0.9 },
  { id: 'g3', kind: 'gen', from: 'hash', to: 'aset', step: 4 },
  { id: 'd1', kind: 'dep', from: 'areas', to: 'set', step: 5 },
  { id: 'c1', kind: 'comp', from: 'poly', to: 'point', step: 6 },
]

const KEY: { kind: Kind; name: string; step: number }[] = [
  { kind: 'gen', name: 'generalization', step: 1 },
  { kind: 'real', name: 'realization', step: 2 },
  { kind: 'dep', name: 'dependency', step: 5 },
  { kind: 'comp', name: 'composition', step: 6 },
]

interface Label {
  x: number
  y: number
  lines: string[]
  anchor: 'start' | 'middle' | 'end'
}
interface Layout {
  vb: [number, number]
  font: number
  boxes: Record<ClsId, Box>
  /** Linjens endepunkter pr. relation: [start ved `from`, spids ved `to`]. */
  ends: Record<string, [P, P]>
  labels: Partial<Record<string, Label>>
  mult: { x: number; y: number; text: string; anchor: 'start' | 'end' }[]
  divider: [P, P]
  key: { x: number; y: number; len: number }[]
}

/* Bred: sidens placering. Række 1 Collection / AbstractCollection, række 2
   Areas / Set / AbstractSet, række 3 HashSet. Composition i en kolonne til højre. */
const WIDE: Layout = {
  vb: [840, 356],
  font: 13,
  boxes: {
    coll: [260, 20, 130, 48],
    acoll: [490, 20, 160, 48],
    areas: [0, 122, 160, 84],
    set: [260, 140, 130, 48],
    aset: [490, 140, 160, 48],
    hash: [490, 256, 160, 44],
    poly: [722, 20, 96, 40],
    point: [730, 196, 80, 40],
  },
  ends: {
    g1: [[325, 140], [325, 68]],
    r1: [[490, 44], [390, 44]],
    g2: [[570, 140], [570, 68]],
    r2: [[490, 164], [390, 164]],
    g3: [[570, 256], [570, 188]],
    d1: [[160, 164], [260, 164]],
    c1: [[770, 60], [770, 196]],
  },
  labels: {
    g1: { x: 315, y: 99, lines: ['generalization', '(inherits)'], anchor: 'end' },
    r1: { x: 440, y: 62, lines: ['realization', '(implements)'], anchor: 'middle' },
    d1: { x: 210, y: 186, lines: ['dependency', '(depends on)'], anchor: 'middle' },
  },
  mult: [
    { x: 782, y: 78, text: '1', anchor: 'start' },
    { x: 780, y: 188, text: '3..*', anchor: 'start' },
    { x: 760, y: 188, text: '{ordered}', anchor: 'end' },
  ],
  divider: [
    [684, 14],
    [684, 300],
  ],
  key: [
    { x: 0, y: 342, len: 48 },
    { x: 210, y: 342, len: 48 },
    { x: 420, y: 342, len: 48 },
    { x: 630, y: 342, len: 48 },
  ],
}

/* Smal: to kolonner. Interfaces til venstre, klassehierarkiet til højre;
   realization går vandret mellem dem. Composition og nøglen under. */
const NARROW: Layout = {
  vb: [300, 428],
  font: 11.5,
  boxes: {
    coll: [0, 8, 126, 46],
    acoll: [158, 8, 142, 46],
    set: [0, 108, 126, 46],
    aset: [158, 108, 142, 46],
    areas: [0, 206, 148, 80],
    hash: [158, 206, 142, 44],
    poly: [0, 326, 88, 34],
    point: [224, 326, 76, 34],
  },
  ends: {
    g1: [[63, 108], [63, 54]],
    r1: [[158, 31], [126, 31]],
    g2: [[229, 108], [229, 54]],
    r2: [[158, 131], [126, 131]],
    g3: [[229, 206], [229, 154]],
    d1: [[63, 206], [63, 154]],
    c1: [[88, 343], [224, 343]],
  },
  labels: {},
  mult: [
    { x: 112, y: 336, text: '1', anchor: 'start' },
    { x: 218, y: 336, text: '3..*', anchor: 'end' },
    { x: 218, y: 362, text: '{ordered}', anchor: 'end' },
  ],
  divider: [
    [0, 306],
    [300, 306],
  ],
  key: [
    { x: 0, y: 392, len: 34 },
    { x: 152, y: 392, len: 34 },
    { x: 0, y: 418, len: 34 },
    { x: 152, y: 418, len: 34 },
  ],
}

/* ------------------------------- Pilehoveder ------------------------------ */

const unit = ([ax, ay]: P, [bx, by]: P): P => {
  const l = Math.hypot(bx - ax, by - ay)
  return [(bx - ax) / l, (by - ay) / l]
}
const f = (n: number) => Math.round(n * 10) / 10

/** Hul, lukket trekant med spidsen i `tip`. Returnerer også basens midtpunkt. */
function triangle(tip: P, d: P): { d: string; base: P } {
  const [dx, dy] = d
  const len = 13
  const hw = 7.5
  const base: P = [tip[0] - dx * len, tip[1] - dy * len]
  const a: P = [base[0] - dy * hw, base[1] + dx * hw]
  const b: P = [base[0] + dy * hw, base[1] - dx * hw]
  return { d: `M${f(tip[0])} ${f(tip[1])} L${f(a[0])} ${f(a[1])} L${f(b[0])} ${f(b[1])} Z`, base }
}

/** Åben pil (to streger, V-form) med spidsen i `tip`. */
function openArrow(tip: P, d: P): string {
  const [dx, dy] = d
  const len = 11
  const hw = 6
  const back: P = [tip[0] - dx * len, tip[1] - dy * len]
  const a: P = [back[0] - dy * hw, back[1] + dx * hw]
  const b: P = [back[0] + dy * hw, back[1] - dx * hw]
  return `M${f(a[0])} ${f(a[1])} L${f(tip[0])} ${f(tip[1])} L${f(b[0])} ${f(b[1])}`
}

/** Udfyldt diamant ved helheden; `at` er punktet på helhedens kant. */
function diamond(at: P, d: P): { d: string; end: P } {
  const [dx, dy] = d
  const len = 20
  const hw = 6.5
  const mid: P = [at[0] + dx * (len / 2), at[1] + dy * (len / 2)]
  const end: P = [at[0] + dx * len, at[1] + dy * len]
  const a: P = [mid[0] - dy * hw, mid[1] + dx * hw]
  const b: P = [mid[0] + dy * hw, mid[1] - dx * hw]
  return { d: `M${f(at[0])} ${f(at[1])} L${f(a[0])} ${f(a[1])} L${f(end[0])} ${f(end[1])} L${f(b[0])} ${f(b[1])} Z`, end }
}

/** Linje + hoved for én relationstype mellem to punkter. */
function geometry(kind: Kind, from: P, to: P) {
  const d = unit(from, to)
  if (kind === 'gen' || kind === 'real') {
    const tri = triangle(to, d)
    return { line: `M${f(from[0])} ${f(from[1])} L${f(tri.base[0])} ${f(tri.base[1])}`, head: tri.d, closed: true }
  }
  if (kind === 'dep') {
    return { line: `M${f(from[0])} ${f(from[1])} L${f(to[0])} ${f(to[1])}`, head: openArrow(to, d), closed: false }
  }
  const dia = diamond(from, d)
  return { line: `M${f(dia.end[0])} ${f(dia.end[1])} L${f(to[0])} ${f(to[1])}`, head: dia.d, closed: true }
}

/* ------------------------------- Tegning ------------------------------- */

const dashed = (k: Kind) => k === 'real' || k === 'dep'

function RelPath({ kind, from, to, on, hot, delay, mask }: { kind: Kind; from: P; to: P; on: boolean; hot: boolean; delay: number; mask: string }) {
  const g = geometry(kind, from, to)
  // Composition tegnes fra helheden: diamanten først, så linjen. De andre tegnes
  // fra kilden mod målet, og hovedet lander, når linjen er fremme.
  const headDelay = kind === 'comp' ? delay : delay + 0.5
  const lineDelay = kind === 'comp' ? delay + 0.2 : delay
  return (
    <g className="ucd-rel" data-kind={kind} data-on={on || undefined} data-hot={hot || undefined}>
      <mask id={mask} maskUnits="userSpaceOnUse" x={-20} y={-20} width={900} height={500}>
        <motion.path
          d={g.line}
          fill="none"
          stroke="#fff"
          strokeWidth={10}
          initial={false}
          animate={{ pathLength: on ? 1 : 0 }}
          transition={on ? { ...t.travel, duration: 0.6, delay: lineDelay } : t.fade}
        />
      </mask>
      <path className="ucd-line" d={g.line} strokeDasharray={dashed(kind) ? '5 4' : undefined} mask={`url(#${mask})`} />
      <motion.path
        className={g.closed ? 'ucd-head is-closed' : 'ucd-head'}
        d={g.head}
        initial={false}
        animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.5 }}
        transition={on ? { ...t.place, delay: headDelay } : t.fade}
      />
    </g>
  )
}

function ClassBox({ id, box, hot, show = true }: { id: ClsId; box: Box; hot: boolean; show?: boolean }) {
  const c = CLS[id]
  const [x, y, w, h] = box
  const cx = x + w / 2
  const hasComp = c.attr !== undefined
  const nameH = hasComp ? 28 : h
  const compH = hasComp ? (h - nameH) / 2 : 0
  return (
    <motion.g
      className="ucd-cls"
      data-hot={hot || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={show ? t.place : t.fade}
    >
      <rect x={x} y={y} width={w} height={h} />
      {c.stereo ? (
        <>
          <text className="ucd-stereo" x={cx} y={y + 18}>
            «interface»
          </text>
          <text className="ucd-name" x={cx} y={y + 36}>
            {c.name}
          </text>
        </>
      ) : (
        <text className={c.abstract ? 'ucd-name is-abstract' : 'ucd-name'} x={cx} y={y + nameH / 2 + 4.5}>
          {c.name}
        </text>
      )}
      {hasComp && (
        <>
          <line className="ucd-sep" x1={x} x2={x + w} y1={y + nameH} y2={y + nameH} />
          <line className="ucd-sep" x1={x} x2={x + w} y1={y + nameH + compH} y2={y + nameH + compH} />
          <text className="ucd-member" x={x + 7} y={y + nameH + compH / 2 + 4}>
            {c.attr}
          </text>
          <text className="ucd-member" x={x + 7} y={y + nameH + compH * 1.5 + 4}>
            {c.op}
          </text>
        </>
      )}
    </motion.g>
  )
}

function Diagram({ L, step, variant }: { L: Layout; step: number; variant: 'w' | 'n' }) {
  const hotRels = RELS.filter((r) => r.step === step)
  const hotCls = new Set(hotRels.flatMap((r) => [r.from, r.to]))
  const compOn = step >= 6
  return (
    <svg
      className={`ucd-svg ucd-${variant === 'w' ? 'wide' : 'narrow'}`}
      viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`}
      style={{ fontSize: L.font }}
      aria-hidden="true"
    >
      <motion.line
        className="ucd-divider"
        x1={L.divider[0][0]}
        y1={L.divider[0][1]}
        x2={L.divider[1][0]}
        y2={L.divider[1][1]}
        initial={false}
        animate={{ opacity: compOn ? 1 : 0 }}
        transition={t.fade}
      />

      {(Object.keys(CLS) as ClsId[]).map((id) => (
        <ClassBox key={id} id={id} box={L.boxes[id]} hot={hotCls.has(id)} show={id === 'poly' || id === 'point' ? compOn : true} />
      ))}

      {RELS.map((r) => {
        const [from, to] = L.ends[r.id]
        return (
          <RelPath
            key={r.id}
            kind={r.kind}
            from={from}
            to={to}
            on={step >= r.step}
            hot={step === r.step}
            delay={r.delay ?? 0}
            mask={`ucd-m-${variant}-${r.id}`}
          />
        )
      })}

      {RELS.map((r) => {
        const lb = L.labels[r.id]
        if (!lb) return null
        const on = step >= r.step
        return (
          <motion.text
            key={r.id}
            className="ucd-label"
            data-hot={step === r.step || undefined}
            x={lb.x}
            y={lb.y}
            textAnchor={lb.anchor}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: (r.delay ?? 0) + 0.45 } : t.fade}
          >
            {lb.lines.map((line, j) => (
              <tspan key={j} x={lb.x} dy={j === 0 ? 0 : '1.2em'}>
                {line}
              </tspan>
            ))}
          </motion.text>
        )
      })}

      {L.mult.map((m, i) => (
        <motion.text
          key={i}
          className="ucd-mult"
          x={m.x}
          y={m.y}
          textAnchor={m.anchor}
          initial={false}
          animate={{ opacity: compOn ? 1 : 0 }}
          transition={compOn ? { ...t.fade, delay: 0.7 + i * 0.08 } : t.fade}
        >
          {m.text}
        </motion.text>
      ))}

      {/* Nøglen: én linje pr. relationstype, tændt når typen er introduceret. */}
      {KEY.map((k, i) => {
        const pos = L.key[i]
        const y = pos.y
        const on = step >= k.step
        const hot = hotRels.some((r) => r.kind === k.kind)
        const from: P = [pos.x, y - 4]
        const to: P = [pos.x + pos.len, y - 4]
        const g = geometry(k.kind, from, to)
        return (
          <motion.g
            key={k.kind}
            className="ucd-key"
            data-kind={k.kind}
            data-hot={hot || undefined}
            initial={false}
            animate={{ opacity: on ? 1 : 0.18 }}
            transition={t.fade}
          >
            <path className="ucd-line" d={g.line} strokeDasharray={dashed(k.kind) ? '5 4' : undefined} />
            <path className={g.closed ? 'ucd-head is-closed' : 'ucd-head'} d={g.head} />
            <text className="ucd-key-name" x={pos.x + pos.len + 8} y={y}>
              {k.name}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

function UmlKlassediagram({ step }: { step: number }) {
  return (
    <div className="ucd" data-step={step}>
      <Diagram L={WIDE} step={step} variant="w" />
      <Diagram L={NARROW} step={step} variant="n" />
    </div>
  )
}

const viz: VizDef = {
  id: 'uml-klassediagram',
  title: 'Collections-diagrammet bygget relation for relation',
  steps: [
    {
      caption: 'Seks klasser fra noten. `«interface»` markerer interfaces; kursivt navn betyder abstrakt klasse.',
      hold: 2400,
    },
    {
      caption:
        '**Generalization**: fuld linje, hul trekant mod supertypen. Interfaces kan arve fra interfaces — `Set` arver fra `Collection`.',
      hold: 2600,
    },
    {
      caption: '**Realization**: stiplet linje, hul trekant. `AbstractCollection` implementerer `Collection`.',
      hold: 2400,
    },
    {
      caption: '`AbstractSet` arver fra `AbstractCollection` *og* implementerer `Set` — samme pilehoved, forskellig linje.',
      hold: 3000,
    },
    {
      caption: '`HashSet` er den eneste konkrete klasse. Den arver alt det ovenover.',
      hold: 2000,
    },
    {
      caption:
        '**Dependency**: stiplet linje med åben pil. `Areas` bruger `Set` (`zipCodes : set`) uden at arve eller implementere noget.',
      hold: 2800,
    },
    {
      caption:
        '**Composition**: udfyldt diamant ved helheden. En `Polygon` har 3 eller flere ordnede `Point` — slettes polygonen, slettes punkterne.',
      hold: 3000,
    },
  ],
  Component: UmlKlassediagram,
}

export default viz
