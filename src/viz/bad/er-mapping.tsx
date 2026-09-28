import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Token, VTable, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './er-mapping.css'

/* Relational Mapping.pdf s. 5–10: tre eksempler fra mapping-kataloget.
   (d) 1:N Department—Employee, (f) N:N Engineer—Prof-assoc og den ternære
   N:N:N skill-used. Nøglerne rejser som tokens fra forælder til den tabel,
   der bærer relationen. */

/* ---------- Chen-stumper (små SVG'er, fast bredde, skaleres kun ned) ---------- */

type Ent = { x: number; w: number; label: string }
interface StripDef {
  y: number
  left: Ent
  right: Ent
  rel: { cx: number; w: number; h: number; label: string }
  cards: [number, number, string][]
  third?: { w: number; label: string; card: [number, number] }
}

const STRIPS: StripDef[] = [
  {
    y: 50,
    left: { x: 2, w: 76, label: 'Department' },
    right: { x: 176, w: 74, label: 'Employee' },
    rel: { cx: 126, w: 56, h: 44, label: 'has' },
    cards: [[88, 38, '1'], [165, 38, 'N']],
  },
  {
    y: 50,
    left: { x: 2, w: 62, label: 'Engineer' },
    right: { x: 176, w: 74, label: 'Prof-assoc' },
    rel: { cx: 121, w: 90, h: 56, label: 'belongs-to' },
    cards: [[70, 36, 'N'], [171, 36, 'N']],
  },
  {
    y: 30,
    left: { x: 2, w: 64, label: 'Employee' },
    right: { x: 190, w: 60, label: 'Project' },
    rel: { cx: 126, w: 90, h: 56, label: 'skill-used' },
    cards: [[73, 18, 'N'], [181, 18, 'N']],
    third: { w: 52, label: 'Skill', card: [137, 66] },
  },
]

function Strip({ d }: { d: StripDef }) {
  const { y, left: l, right: r, rel } = d
  const eh = 26
  return (
    <svg className="em-strip" viewBox="0 0 252 100" width="252" height="100" aria-hidden="true">
      <line x1={l.x + l.w} y1={y} x2={r.x} y2={y} />
      {d.third && <line x1={rel.cx} y1={y} x2={rel.cx} y2={74} />}
      {[l, r].map((e) => (
        <g key={e.label}>
          <rect x={e.x} y={y - eh / 2} width={e.w} height={eh} rx={2} />
          <text x={e.x + e.w / 2} y={y} className="em-ent">
            {e.label}
          </text>
        </g>
      ))}
      <polygon points={`${rel.cx},${y - rel.h / 2} ${rel.cx + rel.w / 2},${y} ${rel.cx},${y + rel.h / 2} ${rel.cx - rel.w / 2},${y}`} />
      <text x={rel.cx} y={y}>
        {rel.label}
      </text>
      {d.third && (
        <g>
          <rect x={rel.cx - d.third.w / 2} y={74} width={d.third.w} height={24} rx={2} />
          <text x={rel.cx} y={86} className="em-ent">
            {d.third.label}
          </text>
          <text x={d.third.card[0]} y={d.third.card[1]} className="em-card">
            N
          </text>
        </g>
      )}
      {d.cards.map(([x, cy, s], i) => (
        <text key={i} x={x} y={cy} className="em-card">
          {s}
        </text>
      ))}
    </svg>
  )
}

/* ---------------------------------- Figur ---------------------------------- */

// En nøgle i en kolonneoverskrift: token når den rejser, ellers tekst.
const key = (id: string, label: string, travelling: boolean): ReactNode =>
  travelling ? (
    <Token id={id} tone="focus">
      {label}
    </Token>
  ) : (
    label
  )
// Pladsholder så måltabellen har sin endelige bredde fra start.
const ghost = (label: string) => <span className="em-ghost">{label}</span>

// Hvert tilfælde: [trin hvor tabellerne kommer, trin hvor nøglerne rejser].
const CASES = [
  { tag: '1:N', start: 1, move: 2, rule: 'FK på N-siden' },
  { tag: 'N:N', start: 3, move: 4, rule: 'junction-tabel; PK = begge FK' },
  { tag: 'N:N:N', start: 5, move: 6, rule: 'junction; PK = mange-sidernes nøgler' },
]

function Mapping({ step }: { step: number }) {
  const [a, b, c] = CASES
  // Nøglen står i kilden trinnet før den rejser, i målet på rejsetrinnet, og derefter som tekst.
  const src = (cs: (typeof CASES)[number], id: string, label: string) => key(id, label, step === cs.start)
  const dst = (cs: (typeof CASES)[number], id: string, label: string) =>
    step < cs.move ? ghost(label) : key(id, label, step === cs.move)

  const tables: ReactNode[][] = [
    [
      <VTable key="d" name="department" cols={[src(a, 'em-a', 'dept_no'), 'dept_name']} rows={[]} pk={[0]} show={at(step, a.start)} compact />,
      <VTable
        key="e"
        name="employee"
        cols={['emp_id', 'emp_name', dst(a, 'em-a', 'dept_no')]}
        rows={[]}
        pk={[0]}
        fk={at(step, a.move) ? [2] : []}
        show={at(step, a.start)}
        note={<span className="em-note" data-on={at(step, a.move)}>dept_no not null</span>}
        compact
      />,
    ],
    [
      <VTable key="en" name="engineer" cols={[src(b, 'em-b1', 'emp_id')]} rows={[]} pk={[0]} show={at(step, b.start)} compact />,
      <VTable key="pa" name="prof_assoc" cols={[src(b, 'em-b2', 'assoc_name')]} rows={[]} pk={[0]} show={at(step, b.start)} compact />,
      <VTable
        key="bt"
        name="belongs_to"
        cols={[dst(b, 'em-b1', 'emp_id'), dst(b, 'em-b2', 'assoc_name')]}
        rows={[]}
        pk={at(step, b.move) ? [0, 1] : []}
        fk={at(step, b.move) ? [0, 1] : []}
        show={at(step, b.start)}
        compact
      />,
    ],
    [
      <VTable key="em" name="employee" cols={[src(c, 'em-c1', 'emp_id')]} rows={[]} pk={[0]} show={at(step, c.start)} compact />,
      <VTable key="sk" name="skill" cols={[src(c, 'em-c2', 'skill_type')]} rows={[]} pk={[0]} show={at(step, c.start)} compact />,
      <VTable key="pr" name="project" cols={[src(c, 'em-c3', 'project_name')]} rows={[]} pk={[0]} show={at(step, c.start)} compact />,
      <VTable
        key="su"
        name="skill_used"
        cols={[dst(c, 'em-c1', 'emp_id'), dst(c, 'em-c2', 'skill_type'), dst(c, 'em-c3', 'project_name')]}
        rows={[]}
        pk={at(step, c.move) ? [0, 1, 2] : []}
        fk={at(step, c.move) ? [0, 1, 2] : []}
        show={at(step, c.start)}
        compact
      />,
    ],
  ]

  const end = at(step, 7)
  return (
    <div className="em">
      {CASES.map((cs, i) => {
        const active = step >= cs.start && step <= cs.move
        const parts = tables[i]
        return (
          <section key={cs.tag} className="em-case" data-active={active || undefined}>
            <header className="em-head">
              <span className="em-kind">{cs.tag}</span>
            </header>
            <Strip d={STRIPS[i]} />
            <div className="em-top">{parts.slice(0, -1)}</div>
            <div className="em-bottom">{parts[parts.length - 1]}</div>
            <motion.p
              className="em-rule"
              initial={false}
              animate={end ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
              transition={end ? { ...t.place, delay: i * 0.12 } : t.fade}
            >
              {cs.rule}
            </motion.p>
          </section>
        )
      })}
    </div>
  )
}

const viz: VizDef = {
  id: 'er-mapping',
  title: 'Fra relation til tabel',
  steps: [
    {
      caption: 'Tre relationer fra ER-modellen. Hver entitet bliver en tabel — spørgsmålet er, hvor *relationen* havner.',
      hold: 2200,
    },
    { caption: '**1:N**: Department og Employee bliver hver sin tabel. `dept_no` er afdelingens primærnøgle.', hold: 1800 },
    {
      caption:
        'Nøglen kopieres til **N-siden**: `employee.dept_no` er fremmednøgle (kursiv) og `not null`, fordi hver medarbejder arbejder i præcis én afdeling.',
      hold: 2800,
    },
    {
      caption: '**N:N**: en ingeniør kan være medlem af mange faglige foreninger og omvendt. Én fremmednøgle kan ikke rumme det, så relationen får sin egen tabel.',
      hold: 2600,
    },
    {
      caption: 'Junction-tabellen `belongs_to` får begge nøgler. De er fremmednøgler, og tilsammen er de primærnøglen.',
      hold: 2400,
    },
    { caption: '**Ternær N:N:N**: `skill-used` forbinder Employee, Skill og Project. Tre tabeller — og en junction.', hold: 2000 },
    {
      caption: 'Alle tre nøgler kopieres til `skill_used`. Ved N:N:N er der ingen funktionelle afhængigheder, så **alle tre** er primærnøglen.',
      hold: 2800,
    },
    {
      caption:
        'Tre regler: fremmednøglen på N-siden, en junction-tabel ved N:N, og ved ternære relationer bestemmer *mange*-siderne primærnøglen.',
      hold: 3000,
    },
  ],
  Component: Mapping,
}

export default viz
