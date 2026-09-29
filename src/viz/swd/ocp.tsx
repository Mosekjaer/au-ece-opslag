import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './ocp.css'

/* SOLID - SO.pdf s. 9–10 (definitionen), s. 12 (Editor → EmployeeFile,
   Save(byte[])), s. 13 (“Need to support database”), s. 14 (Editor → EmployeeDB;
   de tre ændrede steder står med fed og stavet som på sliden: EmployeeDb,
   storage.save), s. 16 (IEmployeeStorage realiseret af EmployeeFile og
   EmployeeDB, Editor(IEmployeeStorage s)). Markdown:
   swd/markdown/slides/SW4SWD-01_W02b_SOLID_SRP_OCP.md, afsnit 6–7.
   «interface» er tilføjet (sliden har ingen stereotype). Kodeuddraget er
   forkortet: storage.Save(bytes) står i en løkke på s. 12. Rækkefølgen i trin 3–4
   (først filen, så databasen) er figurens; s. 16 viser begge på én gang. */

type Dir = 'right' | 'down'
interface Pt {
  x: number
  y: number
}
interface Lay {
  vb: [number, number]
  editor: Pt & { w: number }
  note: Pt & { w: number }
  noteLink: string
  assoc: string
  assocHead: [number, number, Dir]
  iface: Pt & { w: number }
  /** Den konkrete lagerklasse, før interfacet findes (trin 0–2). */
  slot: Pt
  file: Pt
  db: Pt
  cw: number
  tri: [number, number]
  real: string[]
  tag: Pt & { wrap: boolean }
  open: Pt & { lines: string[]; anchor: 'start' | 'end' }
  ny: Pt
  counter: Pt
}

const WIDE: Lay = {
  vb: [840, 252],
  editor: { x: 0, y: 34, w: 220 },
  note: { x: 0, y: 128, w: 290 },
  noteLink: 'M60 128 V96',
  assoc: 'M220 65 H540',
  assocHead: [540, 65, 'right'],
  iface: { x: 540, y: 29, w: 190 },
  slot: { x: 540, y: 34 },
  file: { x: 438, y: 170 },
  db: { x: 642, y: 170 },
  cw: 190,
  tri: [635, 101],
  real: ['M635 115 V145 H533 V170', 'M635 145 H737 V170'],
  tag: { x: 0, y: 8, wrap: false },
  open: { x: 522, y: 142, lines: ['open for extension'], anchor: 'end' },
  ny: { x: 806, y: 158 },
  counter: { x: 0, y: 246 },
}

const NARROW: Lay = {
  vb: [300, 516],
  note: { x: 0, y: 0, w: 300 },
  editor: { x: 0, y: 120, w: 190 },
  noteLink: 'M60 94 V120',
  assoc: 'M95 182 V226',
  assocHead: [95, 226, 'down'],
  iface: { x: 0, y: 226, w: 190 },
  slot: { x: 7, y: 226 },
  file: { x: 0, y: 344 },
  db: { x: 0, y: 424 },
  cw: 176,
  tri: [95, 298],
  real: ['M95 312 V326 H284 V375 H176', 'M284 375 V455 H176'],
  tag: { x: 200, y: 126, wrap: true },
  open: { x: 190, y: 350, lines: ['open for', 'extension'], anchor: 'start' },
  ny: { x: 214, y: 432 },
  counter: { x: 0, y: 508 },
}

const CODE = {
  v1: ['private EmployeeFile storage;', 'storage = new EmployeeFile()', 'storage.Save(bytes);'],
  v2: ['private EmployeeDb storage;', 'storage = new EmployeeDB()', 'storage.save(employee);'],
  v3: ['private IEmployeeStorage storage;', 'Editor(IEmployeeStorage s)', 'storage.Save(employee);'],
}
const CH = 7.2 // bredde af ét tegn i 12 px IBM Plex Mono

const fade = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

function head([x, y, dir]: [number, number, Dir]) {
  return dir === 'right' ? `M${x - 9} ${y - 5} L${x} ${y} L${x - 9} ${y + 5}` : `M${x - 5} ${y - 9} L${x} ${y} L${x + 5} ${y - 9}`
}

/** UML-klasse: navn, streg, én operation. */
function Cls({ x, y, w, name, op, stereo }: Pt & { w: number; name: string; op: ReactNode; stereo?: boolean }) {
  const hh = stereo ? 40 : 30
  return (
    <g className="swd-ocp-cls">
      <rect x={x} y={y} width={w} height={hh + 32} />
      {stereo && (
        <text className="swd-ocp-stereo" x={x + w / 2} y={y + 14}>
          «interface»
        </text>
      )}
      <text className="swd-ocp-name" x={x + w / 2} y={y + hh - 10}>
        {name}
      </text>
      <line x1={x} x2={x + w} y1={y + hh} y2={y + hh} />
      <text className="swd-ocp-op" x={x + 10} y={y + hh + 20}>
        {op}
      </text>
    </g>
  )
}

function Diagram({ L, step, className }: { L: Lay; step: number; className: string }) {
  const ocp = step >= 3
  const version = step <= 1 ? 'v1' : step === 2 ? 'v2' : 'v3'
  const lines = CODE[version]
  const hl = (i: number) => (step <= 1 ? (i === 1 ? 'acc' : undefined) : step === 2 ? 'neg' : step === 3 && i === 1 ? 'acc' : undefined)
  const tagLines =
    step === 2
      ? L.tag.wrap
        ? ['ændres', '3 steder']
        : ['ændres 3 steder']
      : step === 4
        ? ['uændret']
        : step >= 5
          ? L.tag.wrap
            ? ['closed for', 'modification']
            : ['closed for modification']
          : []
  const tagW = Math.max(0, ...tagLines.map((s) => s.length)) * 6.1 + 16
  const counter =
    step === 2 ? 'Ændringer i Editor: 3' : step === 4 ? 'Ændringer i Editor: 0' : step >= 5 ? 'Uden OCP: 3 ændringer · Med OCP: 0' : ''
  const { note: n } = L
  const noteH = 94

  const fileAt = ocp ? L.file : L.slot
  const dbAt = step >= 4 ? L.db : L.slot
  const dbOn = step === 2 || step >= 4

  return (
    <svg className={`swd-ocp-svg ${className}`} viewBox={`-2 -2 ${L.vb[0] + 4} ${L.vb[1] + 4}`} aria-hidden="true">
      {/* UML-note med kodeuddraget, hæftet til Editor. */}
      <path className="swd-ocp-notelink" d={L.noteLink} />
      <g className="swd-ocp-note">
        <path d={`M${n.x} ${n.y} H${n.x + n.w - 12} L${n.x + n.w} ${n.y + 12} V${n.y + noteH} H${n.x} Z`} />
        <path className="swd-ocp-ear" d={`M${n.x + n.w - 12} ${n.y} V${n.y + 12} H${n.x + n.w}`} />
        <text className="swd-ocp-notet" x={n.x + 10} y={n.y + 17}>
          Editor (uddrag)
        </text>
        {lines.map((s, i) => {
          const y = n.y + 40 + i * 21
          const h = hl(i)
          const delay = step === 2 ? 0.4 + i * 0.5 : 0.1
          return (
            <motion.g key={`${version}-${i}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...t.fade, delay }} data-hl={h}>
              <rect className="swd-ocp-hl" x={n.x + 6} y={y - 14} width={s.length * CH + 8} height={19} rx={2} />
              <text className="swd-ocp-code" x={n.x + 10} y={y}>
                {s}
              </text>
            </motion.g>
          )
        })}
      </g>

      {/* Association: fuld linje, åben pilespids. */}
      <path className="swd-ocp-assoc" d={L.assoc} />
      <path className="swd-ocp-assoc" d={head(L.assocHead)} />

      {/* Realisering: stiplet linje, hul trekant ved interfacet. */}
      <motion.g className="swd-ocp-real" data-open={step >= 5 || undefined} {...fade(ocp, 0.6)}>
        <motion.path className="swd-ocp-realline" d={L.real[0]} {...fade(ocp, 0.6)} />
        <motion.path className="swd-ocp-realline" d={L.real[1]} {...fade(step >= 4, 0.35)} />
        <path className="swd-ocp-tri" d={`M${L.tri[0]} ${L.tri[1]} L${L.tri[0] + 8} ${L.tri[1] + 14} H${L.tri[0] - 8} Z`} />
      </motion.g>

      <motion.g
        initial={false}
        animate={ocp ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
        transition={ocp ? { ...t.place, delay: 0.55 } : t.fade}
      >
        <Cls {...L.iface} name="IEmployeeStorage" op="+ Save(Employee): void" stereo />
      </motion.g>

      {/* EmployeeFile: står i lagerpladsen, glider ned under interfacet i trin 3. */}
      <motion.g
        initial={false}
        animate={{ x: fileAt.x - L.slot.x, y: fileAt.y - L.slot.y, opacity: step === 2 ? 0 : 1 }}
        transition={{ x: t.travel, y: t.travel, opacity: t.fade }}
      >
        <Cls
          x={L.slot.x}
          y={L.slot.y}
          w={L.cw}
          name="EmployeeFile"
          op={
            <>
              <motion.tspan {...fade(!ocp)}>+ Save(byte[]): void</motion.tspan>
            </>
          }
        />
        <motion.text className="swd-ocp-op" x={L.slot.x + 10} y={L.slot.y + 50} {...fade(ocp, 0.3)}>
          + Save(Employee): void
        </motion.text>
      </motion.g>

      {/* EmployeeDB: erstatter filen i trin 2; ny klasse ved siden af i trin 4. */}
      <motion.g
        className="swd-ocp-db"
        data-new={step >= 4 || undefined}
        data-bad={step === 2 || undefined}
        initial={false}
        animate={{ x: dbAt.x - L.slot.x, y: dbAt.y - L.slot.y, opacity: dbOn ? 1 : 0 }}
        transition={{
          x: { duration: 0 },
          y: { duration: 0 },
          opacity: dbOn ? { ...t.fade, delay: step >= 4 ? 0.2 : 0.1 } : t.fade,
        }}
      >
        <Cls x={L.slot.x} y={L.slot.y} w={L.cw} name="EmployeeDB" op="+ Save(Employee): void" />
      </motion.g>

      <motion.g className="swd-ocp-ny" {...fade(step >= 4, 0.6)}>
        <rect x={L.ny.x - 16} y={L.ny.y - 9} width={32} height={18} rx={3} />
        <text x={L.ny.x} y={L.ny.y + 1}>
          ny
        </text>
      </motion.g>

      {/* Editor */}
      <g className="swd-ocp-editor" data-s={step === 2 ? 'neg' : step >= 4 ? 'ok' : undefined}>
        <Cls {...L.editor} name="Editor" op="+ OnButtonClick(): void" />
      </g>

      <motion.g key={`tag-${tagLines.join('|')}`} className="swd-ocp-tag" data-neg={step === 2 || undefined} initial={{ opacity: 0 }} animate={{ opacity: tagLines.length ? 1 : 0 }} transition={{ ...t.fade, delay: step === 2 ? 0.2 : 0.5 }}>
        {tagLines.length > 0 && (
          <>
            <rect x={L.tag.x} y={L.tag.y} width={tagW} height={tagLines.length * 15 + 6} rx={3} />
            {tagLines.map((s, i) => (
              <text key={s} x={L.tag.x + 8} y={L.tag.y + 14 + i * 15}>
                {s}
              </text>
            ))}
          </>
        )}
      </motion.g>

      <motion.text className="swd-ocp-open" x={L.open.x} y={L.open.y} textAnchor={L.open.anchor} {...fade(step >= 5, 0.5)}>
        {L.open.lines.map((s, i) => (
          <tspan key={s} x={L.open.x} dy={i === 0 ? 0 : '1.2em'}>
            {s}
          </tspan>
        ))}
      </motion.text>

      <motion.text
        key={`count-${counter}`}
        className="swd-ocp-count"
        data-neg={step === 2 || undefined}
        x={L.counter.x}
        y={L.counter.y}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ ...t.fade, delay: step === 2 ? 1.7 : 0.6 }}
      >
        {counter}
      </motion.text>
    </svg>
  )
}

function Ocp({ step }: { step: number }) {
  const ocp = step >= 3
  return (
    <div className="swd-ocp">
      <div className="swd-ocp-top">
        <ol className="swd-ocp-phases">
          <li data-on={!ocp || undefined}>Uden OCP</li>
          <li data-on={ocp || undefined}>Med OCP</li>
        </ol>
        <motion.span
          className="swd-ocp-req"
          initial={false}
          animate={step >= 1 ? { opacity: 1, x: 0 } : { opacity: 0, x: 12 }}
          transition={step >= 1 ? t.place : t.fade}
        >
          Nyt krav: <b>Need to support database</b>
        </motion.span>
      </div>
      <Diagram L={WIDE} step={step} className="swd-ocp-wide" />
      <Diagram L={NARROW} step={step} className="swd-ocp-narrow" />
      <motion.p className="swd-ocp-def" {...fade(step >= 5, 0.3)}>
        “Software entities should be open for extension but closed for modification.”
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'ocp',
  title: 'Udvid uden at ændre',
  steps: [
    { caption: '`Editor` kender den konkrete lagerklasse og laver den selv.', hold: 2200 },
    { caption: 'Nyt krav: understøt en database.', hold: 1600 },
    { caption: 'Uden OCP breder ændringen sig ind i `Editor` — tre steder.', hold: 3000 },
    { caption: '`Editor` kender kun `IEmployeeStorage` og får lageret gennem konstruktøren. `EmployeeFile` realiserer interfacet.', hold: 3000 },
    { caption: 'Databasen er en ny klasse. `Editor` røres ikke.', hold: 2600 },
    { caption: 'Åben for udvidelse (nye lagerklasser), lukket for ændring (`Editor`).', hold: 3000 },
  ],
  Component: Ocp,
}

export default viz
