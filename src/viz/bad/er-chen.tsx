import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './er-chen.css'

/* Entity-Relationship Modelling.pdf s. 3–14: materialets egne eksempler i
   Chen-notation. Department 1—has—N Employee, Department 1 ○—is-managed-by—1
   Employee og Employee N—works-on—N Project med start-date på relationen.
   To layouts (bred og smal) med samme elementer; CSS viser det der passer. */

type P = [number, number]
type Box = { c: P; w: number; h: number }
type Id = 'dept' | 'emp' | 'proj' | 'has' | 'mgd' | 'works'

interface Layout {
  vb: [number, number]
  font: number
  shapes: Record<Id, Box>
  cards: { at: P; text: string }[]
  circle: P
  attrs: { id: string; c: P; rx: number; to: Id; key?: boolean; beat: number }[]
}

const LABEL: Record<Id, string> = {
  dept: 'Department',
  emp: 'Employee',
  proj: 'Project',
  has: 'has',
  mgd: 'is-managed-by',
  works: 'works-on',
}
const ENTITIES: Id[] = ['dept', 'emp', 'proj']
const RELS: Id[] = ['has', 'mgd', 'works']
const EDGES: [Id, Id][] = [
  ['dept', 'has'],
  ['emp', 'has'],
  ['dept', 'mgd'],
  ['emp', 'mgd'],
  ['emp', 'works'],
  ['proj', 'works'],
]

const WIDE: Layout = {
  vb: [790, 300],
  font: 14,
  shapes: {
    dept: { c: [80, 175], w: 116, h: 44 },
    emp: { c: [395, 175], w: 106, h: 44 },
    proj: { c: [715, 175], w: 100, h: 44 },
    has: { c: [235, 105], w: 90, h: 54 },
    mgd: { c: [235, 250], w: 150, h: 60 },
    works: { c: [555, 175], w: 116, h: 56 },
  },
  cards: [
    { at: [140, 134], text: '1' },
    { at: [333, 134], text: 'N' },
    { at: [139, 220], text: '1' },
    { at: [333, 220], text: '1' },
    { at: [468, 164], text: 'N' },
    { at: [648, 164], text: 'N' },
  ],
  circle: [167, 217],
  attrs: [
    { id: 'dept-no', c: [80, 62], rx: 46, to: 'dept', key: true, beat: 3 },
    { id: 'emp-id', c: [345, 60], rx: 40, to: 'emp', key: true, beat: 3 },
    { id: 'emp-name', c: [455, 60], rx: 50, to: 'emp', beat: 3 },
    { id: 'project-name', c: [715, 70], rx: 62, to: 'proj', key: true, beat: 3 },
    { id: 'start-date', c: [555, 268], rx: 52, to: 'works', beat: 4 },
  ],
}

const NARROW: Layout = {
  vb: [260, 540],
  font: 13,
  shapes: {
    dept: { c: [130, 80], w: 110, h: 40 },
    emp: { c: [130, 262], w: 104, h: 40 },
    proj: { c: [130, 455], w: 96, h: 40 },
    has: { c: [62, 168], w: 84, h: 50 },
    mgd: { c: [192, 168], w: 136, h: 52 },
    works: { c: [130, 355], w: 110, h: 50 },
  },
  cards: [
    { at: [94, 110], text: '1' },
    { at: [96, 236], text: 'N' },
    { at: [165, 109], text: '1' },
    { at: [163, 236], text: '1' },
    { at: [141, 297], text: 'N' },
    { at: [141, 423], text: 'N' },
  ],
  circle: [162, 126],
  attrs: [
    { id: 'dept-no', c: [130, 22], rx: 40, to: 'dept', key: true, beat: 3 },
    { id: 'emp-id', c: [36, 262], rx: 33, to: 'emp', key: true, beat: 3 },
    { id: 'emp-name', c: [222, 262], rx: 36, to: 'emp', beat: 3 },
    { id: 'project-name', c: [130, 515], rx: 52, to: 'proj', key: true, beat: 3 },
    { id: 'start-date', c: [214, 410], rx: 42, to: 'works', beat: 4 },
  ],
}

const show = (on: boolean, i = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? stagger(i, 0.05, 0.1) : t.fade,
})

const draw = (on: boolean, i = 0) => ({
  initial: false as const,
  animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 },
  transition: on ? { ...t.travel, duration: 0.6, delay: i * 0.08 } : t.fade,
})

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const s = L.shapes
  const ry = L.font + 3
  return (
    <svg className={`erc-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} style={{ fontSize: L.font }} aria-hidden="true">
      {/* Linjer under figurerne, så figurernes fyld skjuler enderne. */}
      {EDGES.map(([a, b], i) => (
        <motion.line key={a + b} className="erc-line" data-now={step === 1 || undefined} x1={s[a].c[0]} y1={s[a].c[1]} x2={s[b].c[0]} y2={s[b].c[1]} {...draw(at(step, 1), i)} />
      ))}
      {L.attrs.map((a, i) => (
        <motion.line key={a.id} className="erc-line" x1={a.c[0]} y1={a.c[1]} x2={s[a.to].c[0]} y2={s[a.to].c[1]} {...draw(at(step, a.beat), i)} />
      ))}

      {ENTITIES.map((id, i) => (
        <motion.g key={id} className="erc-shape" data-now={step === 0 || undefined} {...show(true, i)}>
          <rect x={s[id].c[0] - s[id].w / 2} y={s[id].c[1] - s[id].h / 2} width={s[id].w} height={s[id].h} rx={2} />
          <text x={s[id].c[0]} y={s[id].c[1]} className="erc-strong">
            {LABEL[id]}
          </text>
        </motion.g>
      ))}
      {RELS.map((id, i) => {
        const [x, y] = s[id].c
        const [hw, hh] = [s[id].w / 2, s[id].h / 2]
        return (
          <motion.g key={id} className="erc-shape" data-now={step === 1 || undefined} {...show(at(step, 1), i)}>
            <polygon points={`${x},${y - hh} ${x + hw},${y} ${x},${y + hh} ${x - hw},${y}`} />
            <text x={x} y={y}>
              {LABEL[id]}
            </text>
          </motion.g>
        )
      })}
      {L.attrs.map((a, i) => (
        <motion.g key={a.id} className="erc-shape erc-attr" data-now={step === a.beat || undefined} {...show(at(step, a.beat), i)}>
          <ellipse cx={a.c[0]} cy={a.c[1]} rx={a.rx} ry={ry} />
          <text x={a.c[0]} y={a.c[1]} className={a.key ? 'erc-key' : undefined}>
            {a.id}
          </text>
        </motion.g>
      ))}

      {L.cards.map((c, i) => (
        <motion.text key={i} className="erc-card" data-now={step === 2 || undefined} x={c.at[0]} y={c.at[1]} {...show(at(step, 2), i)}>
          {c.text}
        </motion.text>
      ))}
      <motion.circle
        className="erc-optional"
        data-now={step === 5 || undefined}
        cx={L.circle[0]}
        cy={L.circle[1]}
        initial={false}
        animate={{ r: at(step, 5) ? 5.5 : 0, opacity: at(step, 5) ? 1 : 0 }}
        transition={at(step, 5) ? t.place : t.fade}
      />
    </svg>
  )
}

const LEGEND = [
  { beat: 0, glyph: <rect x={2} y={4} width={20} height={12} rx={1} />, text: 'entitet' },
  { beat: 1, glyph: <polygon points="12,2 22,10 12,18 2,10" />, text: 'relation' },
  { beat: 2, glyph: null, text: 'kardinalitet — N betyder mindst 1' },
  { beat: 3, glyph: <ellipse cx={12} cy={10} rx={10} ry={6} />, text: 'attribut — understreget er nøgle' },
  { beat: 5, glyph: <circle cx={12} cy={10} r={5} />, text: 'cirkel på linjen = valgfri' },
]

function ErChen({ step }: { step: number }) {
  return (
    <div className="erc">
      <Diagram L={WIDE} step={step} className="erc-wide" />
      <Diagram L={NARROW} step={step} className="erc-narrow" />
      <ul className="erc-legend">
        {LEGEND.map((l) => (
          <motion.li key={l.text} {...show(at(step, l.beat))}>
            {l.glyph ? (
              <svg viewBox="0 0 24 20" width="24" height="20" aria-hidden="true">
                {l.glyph}
              </svg>
            ) : (
              <span className="erc-mark" aria-hidden="true">
                1:N
              </span>
            )}
            {l.text}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'er-chen',
  title: 'En Chen-model bygges op',
  steps: [
    { caption: 'Tre **entiteter** som rektangler: `Department`, `Employee` og `Project` — navneord fra kravene.', hold: 2000 },
    {
      caption: '**Relationer** er romber mellem entiteterne — verber: `has`, `is-managed-by` og `works-on`.',
      hold: 2200,
    },
    {
      caption:
        'Kardinaliteten står ved linjerne: en afdeling *har* N medarbejdere (1:N), *ledes af* én (1:1), og medarbejdere arbejder på projekter (N:N).',
      hold: 3000,
    },
    {
      caption: '**Attributter** er ovaler. Nøgleattributten er understreget: `dept-no`, `emp-id` og `project-name`.',
      hold: 2400,
    },
    {
      caption:
        '`start-date` sidder på relationen `works-on`. Kun på N:N er det entydigt: datoen hører til én medarbejder på ét projekt.',
      hold: 2800,
    },
    {
      caption:
        'Cirklen gør `is-managed-by` **valgfri** — ikke alle medarbejdere er ledere. Uden cirkel er relationen obligatorisk, og N betyder mindst 1 i kursets konvention.',
      hold: 3000,
    },
  ],
  Component: ErChen,
}

export default viz
