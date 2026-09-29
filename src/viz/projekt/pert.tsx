import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, VTable, type Row, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './pert.css'

/* Project Management_E22.pdf slide 21–23: aktiviteterne A–G med forgængere og
   O/N/P-estimater, ETC = (P + 4·N + O)/6, og Gantt-diagrammet (enhed: dage), hvor
   a, c, e, g står som kritiske. Fremad- og baglænsberegningen (ES/EF/LS/LF og slæk)
   står ikke på slides; den er regnet her ud fra tabellen med eksakte brøker. */

interface Act {
  id: string
  pred: string[]
  o: number
  n: number
  p: number
}

const ACTS: Act[] = [
  { id: 'A', pred: [], o: 2, n: 4, p: 6 },
  { id: 'B', pred: [], o: 3, n: 5, p: 9 },
  { id: 'C', pred: ['A'], o: 4, n: 5, p: 7 },
  { id: 'D', pred: ['A'], o: 4, n: 6, p: 10 },
  { id: 'E', pred: ['B', 'C'], o: 4, n: 5, p: 7 },
  { id: 'F', pred: ['D'], o: 3, n: 4, p: 8 },
  { id: 'G', pred: ['E'], o: 3, n: 5, p: 8 },
]

const te: Record<string, number> = {}
const es: Record<string, number> = {}
const ef: Record<string, number> = {}
const ls: Record<string, number> = {}
const lf: Record<string, number> = {}
for (const a of ACTS) {
  te[a.id] = (a.p + 4 * a.n + a.o) / 6
  es[a.id] = Math.max(0, ...a.pred.map((p) => ef[p]))
  ef[a.id] = es[a.id] + te[a.id]
}
const END = Math.max(...ACTS.map((a) => ef[a.id]))
for (const a of [...ACTS].reverse()) {
  const succ = ACTS.filter((s) => s.pred.includes(a.id))
  lf[a.id] = succ.length ? Math.min(...succ.map((s) => ls[s.id])) : END
  ls[a.id] = lf[a.id] - te[a.id]
}
const slack = (id: string) => ls[id] - es[id]
const critical = (id: string) => Math.abs(slack(id)) < 1e-9
const f2 = (x: number) => (Math.round(x * 100) / 100).toFixed(2).replace('.', ',')

/* Kolonner: 0 Akt, 1 Forg, 2 O, 3 N, 4 P, 5 te, 6 ES, 7 EF, 8 LS, 9 LF, 10 slæk */
const FWD1 = ['A', 'B', 'C', 'D']

function rowsAt(step: number): Row[] {
  return ACTS.map((a) => {
    const tone: Record<number, Tone> = {}
    const hide = (cols: number[]) => cols.forEach((c) => (tone[c] = 'ghost'))
    if (step < 1) hide([5])
    const fwd = step >= 3 || (step === 2 && FWD1.includes(a.id))
    if (!fwd) hide([6, 7])
    if (step < 4) hide([8, 9])
    if (step < 5) hide([10])
    if (step === 1) tone[5] = 'focus'
    if ((step === 2 && FWD1.includes(a.id)) || (step === 3 && !FWD1.includes(a.id))) {
      tone[6] = 'focus'
      tone[7] = 'focus'
    }
    if (step === 4) {
      tone[8] = 'focus'
      tone[9] = 'focus'
    }
    if (step >= 5 && critical(a.id)) for (let c = 0; c <= 10; c++) tone[c] = tone[c] ?? 'focus'
    return {
      key: a.id,
      cellTone: tone,
      cells: [
        <strong key="id">{a.id}</strong>,
        a.pred.join(', ') || '—',
        a.o,
        a.n,
        a.p,
        f2(te[a.id]),
        f2(es[a.id]),
        f2(ef[a.id]),
        f2(ls[a.id]),
        f2(lf[a.id]),
        f2(slack(a.id)),
      ],
    }
  })
}

/* Netværk: aktivitet på node. Bred: vandret; smal: lodret. */
type Pos = Record<string, [number, number]>
const WIDE = { w: 640, h: 206, pos: { A: [70, 98], B: [70, 160], C: [210, 98], D: [210, 36], E: [350, 98], F: [350, 36], G: [490, 98], S: [590, 98] } as Pos }
const NARROW = { w: 300, h: 450, pos: { A: [160, 40], B: [240, 40], C: [160, 150], D: [70, 150], E: [160, 260], F: [70, 260], G: [160, 370], S: [160, 425] } as Pos }
/** Smal variant: ETC-tallet til venstre (-1) eller højre (1) for noden. */
const NSIDE: Record<string, number> = { A: -1, B: 1, C: -1, D: -1, E: -1, F: -1, G: 1 }
const EDGES: [string, string][] = [
  ['A', 'C'],
  ['A', 'D'],
  ['B', 'E'],
  ['C', 'E'],
  ['D', 'F'],
  ['E', 'G'],
  ['F', 'S'],
  ['G', 'S'],
]
const R = 19

function Net({ g, step, variant }: { g: typeof WIDE; step: number; variant: string }) {
  const crit = step >= 5
  const isCritEdge = (a: string, b: string) => critical(a) && (b === 'S' || critical(b))
  const edge = (a: string, b: string) => {
    const [x1, y1] = g.pos[a]
    const [x2, y2] = g.pos[b]
    const r2 = b === 'S' ? 12 : R
    const d = Math.hypot(x2 - x1, y2 - y1)
    const ux = (x2 - x1) / d
    const uy = (y2 - y1) / d
    return { x1: x1 + ux * R, y1: y1 + uy * R, x2: x2 - ux * (r2 + 3), y2: y2 - uy * (r2 + 3) }
  }
  return (
    <svg className={`pert-net pert-${variant}`} viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true">
      <defs>
        <marker id={`pert-arrow-${variant}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 Z" className="pert-head" />
        </marker>
        <marker id={`pert-arrow-c-${variant}`} viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 Z" className="pert-head-c" />
        </marker>
      </defs>
      {EDGES.map(([a, b]) => {
        const e = edge(a, b)
        const hot = crit && isCritEdge(a, b)
        return (
          <line
            key={a + b}
            {...e}
            className={hot ? 'pert-edge is-crit' : 'pert-edge'}
            markerEnd={`url(#pert-arrow${hot ? '-c' : ''}-${variant})`}
          />
        )
      })}
      {ACTS.map((a) => {
        const [x, y] = g.pos[a.id]
        const hot = crit && critical(a.id)
        const wide = variant === 'wide'
        const side = NSIDE[a.id]
        const lx = wide ? x : x + side * (R + 6)
        const ly = wide ? (a.id === 'D' || a.id === 'F' ? y - R - 7 : a.id === 'C' ? y - R - 6 : y + R + 15) : y + 5
        const cls = wide ? 'pert-te' : side < 0 ? 'pert-te is-right' : 'pert-te is-left'
        return (
          <g key={a.id} className={hot ? 'pert-node is-crit' : 'pert-node'}>
            <circle cx={x} cy={y} r={R} />
            <text x={x} y={y + 5} className="pert-letter">
              {a.id}
            </text>
            <motion.text
              x={lx}
              y={ly}
              className={cls}
              initial={false}
              animate={{ opacity: step >= 1 ? 1 : 0 }}
              transition={t.fade}
            >
              {f2(te[a.id])}
            </motion.text>
          </g>
        )
      })}
      <g className="pert-end">
        <circle cx={g.pos.S[0]} cy={g.pos.S[1]} r={12} />
        <text x={g.pos.S[0] + (variant === 'wide' ? 0 : 18)} y={g.pos.S[1] + (variant === 'wide' ? 30 : 4)} className={variant === 'wide' ? 'pert-te' : 'pert-te is-left'}>
          Slut
        </text>
      </g>
    </svg>
  )
}

const NOTES = [
  'Aktiviteter, forgængere og tre estimater pr. aktivitet (slide 22).',
  'ETC = (P + 4·N + O) / 6. A: (6 + 4·4 + 2) / 6 = 4,00',
  'Fremad: ES = største EF blandt forgængerne; EF = ES + ETC',
  `E venter på både B og C: ES = max(5,33; 9,17) = 9,17. Projektet slutter efter ${f2(END)} dage`,
  'Baglæns fra slut: LF = mindste LS blandt efterfølgerne; LS = LF − ETC',
  `Slæk = LS − ES. Slæk 0: kritisk vej A → C → E → G = ${f2(END)} dage`,
]

function Pert({ step }: { step: number }) {
  return (
    <div className="pert">
      <div className="pert-top">
        <Net g={WIDE} step={step} variant="wide" />
        <Net g={NARROW} step={step} variant="narrow" />
      </div>
      <div className="pert-note">
        <Swap
          show={step}
          items={NOTES.map((n, i) => (
            <Tag key={i} tone={i === 5 ? 'focus' : 'idle'} wrap>
              {n}
            </Tag>
          ))}
        />
      </div>
      <div className="pert-table">
        <VTable
          cols={['Akt.', 'Forg.', 'O', 'N', 'P', 'ETC', 'ES', 'EF', 'LS', 'LF', 'Slæk']}
          rows={rowsAt(step)}
          compact
          note="Dage. ES/EF = tidligste start/slut, LS/LF = seneste start/slut. Beregningen er ikke på slides — kun ETC og den kritiske vej (Gantt, slide 23)."
        />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'pert',
  title: 'ETC, fremad- og baglænsberegning og den kritiske vej',
  steps: [
    { caption: 'Syv aktiviteter fra WBS’en med forgængere og et optimistisk, normalt og pessimistisk estimat.', hold: 2200 },
    { caption: '**ETC** vægter det normale estimat fire gange: `(P + 4·N + O) / 6`. Det giver den forventede varighed for hver aktivitet.', hold: 2800 },
    {
      caption: '**Fremad**: en aktivitet kan tidligst starte, når alle forgængere er færdige. A og B starter i 0; C og D venter på A.',
      hold: 2800,
    },
    {
      caption: 'E har to forgængere og må vente på den seneste, C. Den største EF — G’s 19,50 — er projektets samlede varighed.',
      hold: 3000,
    },
    {
      caption: '**Baglæns**: fra slut regnes, hvor sent hver aktivitet kan slutte og starte uden at forsinke projektet.',
      hold: 2800,
    },
    {
      caption: '**Slæk** = LS − ES. Aktiviteterne med slæk 0 danner den **kritiske vej** A → C → E → G — de samme, som står røde i slidets Gantt-diagram.',
      hold: 3400,
    },
  ],
  Component: Pert,
}

export default viz
