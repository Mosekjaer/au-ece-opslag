import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './doa-probing.css'

/* Lecture04.pdf (PDF-sidetal) s. 37 (linear probing: 89, 18, 49, 58, 69 med x mod 10 →
   49 i 0, 58 i 1, 69 i 2; primary clustering), s. 38 (quadratic probing, samme nøgler →
   49 i 0, 58 i 2, 69 i 3; secondary clustering), s. 40–41 (tankeeksperimentet: 16 i 0,
   6 i 1, 56 i 6, 46 i 7, 36 i 8, 26 i 9; contains(26) efter remove(36)), s. 42 (EntryType
   ACTIVE/EMPTY/DELETED) og s. 49 (rehash: før [6, 15, 23, 24, _, _, 13] i størrelse 7,
   efter størrelse 17 med 6 → 6, 23 → 7, 24 → 8, 13 → 13, 15 → 15; Weiss fig. 5.19–5.21).
   Indhold: src/content/doa/p3-hashing.ts (open-addressing). */

interface C {
  v: string
  tone: Tone
}

function Cells({ cells, wide }: { cells: C[]; wide?: boolean }) {
  return (
    <div className={`dpr-cells ${wide ? 'is-wide' : ''}`} style={{ ['--n' as never]: cells.length }}>
      {cells.map((c, i) => (
        <div key={i} className="dpr-col">
          <div className="dpr-cell" data-tone={c.tone}>
            <motion.span
              key={c.v}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ ...t.place, delay: wide ? i * 0.04 : 0 }}
            >
              {c.v}
            </motion.span>
          </div>
          <div className="dpr-idx">{i}</div>
        </div>
      ))}
    </div>
  )
}

// ------------------------------------------------------- linear vs. quadratic (s. 37–38)
const ORDER = [89, 18, 49, 58, 69]
const INSERTED = [0, 2, 3, 4, 5] // antal nøgler efter trin 0–4
const LIN: Record<number, number[]> = { 89: [9], 18: [8], 49: [9, 0], 58: [8, 9, 0, 1], 69: [9, 0, 1, 2] }
const QUAD: Record<number, number[]> = { 89: [9], 18: [8], 49: [9, 0], 58: [8, 9, 2], 69: [9, 0, 3] }

function probeCells(probes: Record<number, number[]>, step: number): C[] {
  const s = Math.min(step, 4)
  const n = INSERTED[s]
  const now = step >= 1 && step <= 4 ? ORDER.slice(INSERTED[s - 1], n) : []
  const cells: C[] = Array.from({ length: 10 }, () => ({ v: '', tone: 'idle' as Tone }))
  ORDER.slice(0, n).forEach((k) => {
    const p = probes[k]
    cells[p[p.length - 1]].v = String(k)
  })
  now.forEach((k) => {
    const p = probes[k]
    p.slice(0, -1).forEach((i) => (cells[i].tone = 'neg'))
    cells[p[p.length - 1]].tone = 'ok'
  })
  return cells
}

const LIN_TRACE: ReactNode[] = [
  '',
  '89 → 9 · 18 → 8',
  '49: 9 → 0',
  '58: 8 → 9 → 0 → 1',
  '69: 9 → 0 → 1 → 2',
  <>49, 58, 69 i 0, 1, 2</>,
]
const QUAD_TRACE: ReactNode[] = [
  '',
  '89 → 9 · 18 → 8',
  '49: 9 → 0',
  '58: 8 → 9 → 2  (8 + 4 = 12)',
  '69: 9 → 0 → 3  (9 + 4 = 13)',
  <>49, 58, 69 i 0, 2, 3</>,
]

// ----------------------------------------------------------- lazy deletion (s. 40–42)
const LAZY: Record<number, string> = { 0: '16', 1: '6', 6: '56', 7: '46', 8: '36', 9: '26' }

function lazyCells(step: number): C[] {
  return Array.from({ length: 10 }, (_, i) => {
    if (step < 5) return { v: '', tone: 'idle' as Tone }
    let v = LAZY[i] ?? ''
    let tone: Tone = 'idle'
    if (i === 8 && step === 6) v = ''
    if (i === 8 && step >= 7) v = 'D'
    if (i === 6 || i === 7) tone = 'focus'
    if (i === 8) tone = step === 5 ? 'focus' : step === 6 ? 'neg' : 'muted'
    if (i === 9 && step !== 6) tone = 'ok'
    return { v, tone }
  })
}

const LAZY_TRACE: ReactNode[] = [
  '',
  <>
    <code>contains(26)</code>: 6 → 7 → 8 → 9 fundet
  </>,
  <>
    <code>remove(36)</code> tømmer 8. <code>contains(26)</code>: 6 → 7 → 8 tom — <b className="dpr-neg">ikke fundet</b>
  </>,
  <>
    <code>remove(36)</code> sætter D = <code>DELETED</code>. <code>contains(26)</code>: 6 → 7 → 8 → 9 fundet
  </>,
]

// ------------------------------------------------------------------- rehash (s. 49)
const BEFORE = ['6', '15', '23', '24', '', '', '13']
const AFTER: Record<number, string> = { 6: '6', 7: '23', 8: '24', 13: '13', 15: '15' }

function beforeCells(step: number): C[] {
  return BEFORE.map((v) => ({ v: step >= 8 ? v : '', tone: 'idle' as Tone }))
}
function afterCells(step: number): C[] {
  return Array.from({ length: 17 }, (_, i) => {
    const v = step >= 9 ? AFTER[i] ?? '' : ''
    return { v, tone: v ? (i === 7 || i === 8 ? 'focus' : 'ok') : ('idle' as Tone) }
  })
}

const RH_TRACE: ReactNode[] = [
  '',
  <>13 → 6 · 15 → 1 · 24 → 3 · 6 → 6 optaget → 0 · 23 → 2. Fem af syv celler er optaget.</>,
  <>
    <code>nextPrime(2 · 7)</code> = 17 · 6 → 6 · 15 → 15 · 23 → 6 optaget → 7 · 24 → 7 optaget → 8 · 13 → 13
  </>,
]

function Probing({ step }: { step: number }) {
  const aTrace = Math.min(step, 5)
  const lTrace = step < 5 ? 0 : Math.min(step - 4, 3)
  const rTrace = step < 8 ? 0 : step - 7
  return (
    <div className="dpr">
      <section className="dpr-sec dpr-a" data-on={step <= 4 || undefined}>
        <span className="vcaps">89, 18, 49, 58, 69 med x mod 10</span>
        <div className="dpr-block">
          <span className="dpr-name">
            linear <code>f(i) = i</code>
          </span>
          <Cells cells={probeCells(LIN, step)} />
          <Swap show={aTrace} className="dpr-trace" items={LIN_TRACE.map((x, i) => <span key={i}>{x}</span>)} />
        </div>
        <div className="dpr-block">
          <span className="dpr-name">
            quadratic <code>f(i) = i²</code>
          </span>
          <Cells cells={probeCells(QUAD, step)} />
          <Swap show={aTrace} className="dpr-trace" items={QUAD_TRACE.map((x, i) => <span key={i}>{x}</span>)} />
        </div>
      </section>

      <section className="dpr-sec dpr-b" data-on={(step >= 5 && step <= 7) || undefined}>
        <span className="vcaps">Sletning med linear probing</span>
        <div className="dpr-block">
          <span className="dpr-name">
            <code>contains(26)</code> efter <code>remove(36)</code>
          </span>
          <Cells cells={lazyCells(step)} />
          <Swap show={lTrace} className="dpr-trace" items={LAZY_TRACE.map((x, i) => <span key={i}>{x}</span>)} />
        </div>
      </section>

      <section className="dpr-sec dpr-c" data-on={step >= 8 || undefined}>
        <span className="vcaps">Rehash med linear probing</span>
        <div className="dpr-rh">
          <div className="dpr-block dpr-before">
            <span className="dpr-name">
              før: 7 celler, <code>x mod 7</code>
            </span>
            <Cells cells={beforeCells(step)} />
          </div>
          <motion.span
            className="dpr-arrow"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: step >= 9 ? 1 : 0.25 }}
            transition={step >= 9 ? stagger(0) : t.fade}
          >
            →
          </motion.span>
          <div className="dpr-block dpr-after">
            <span className="dpr-name">
              efter: 17 celler, <code>x mod 17</code>
            </span>
            <Cells cells={afterCells(step)} wide />
          </div>
        </div>
        <Swap show={rTrace} className="dpr-trace" items={RH_TRACE.map((x, i) => <span key={i}>{x}</span>)} />
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-probing',
  title: 'Linear og quadratic probing, lazy deletion og rehash',
  steps: [
    {
      caption:
        'To tabeller med 10 celler og `hash(x) = x mod 10`. Nøglerne 89, 18, 49, 58, 69 indsættes med **linear** (`f(i) = i`) og **quadratic** probing (`f(i) = i²`).',
      hold: 2800,
    },
    { caption: '89 → 9 og 18 → 8 i begge tabeller. Ingen kollision.', hold: 1600 },
    { caption: '49 rammer 9, der er optaget. Begge prøver 9 + 1 og lander i 0.', hold: 2000 },
    {
      caption: '58 rammer 8. Linear prøver 9 og 0 og lander i **1**. Quadratic prøver 8 + 1 = 9 og så 8 + 4 = 12, altså **2**.',
      hold: 2800,
    },
    {
      caption:
        '69: linear prøver 9, 0 og 1 og lander i 2. Blokken 8, 9, 0, 1, 2 vokser: **primary clustering**. Quadratic springer længere og lander i 3.',
      hold: 3000,
    },
    {
      caption: 'Sletning, slidets tankeeksperiment: `contains(26)` starter i 26 mod 10 = 6 og prøver 6, 7 og 8, før den finder 26 i 9.',
      hold: 2600,
    },
    {
      caption: 'Fjernes 36 ved at tømme celle 8, stopper `contains(26)` ved den tomme celle og svarer forkert “ikke fundet”.',
      hold: 2600,
    },
    {
      caption: '**Lazy deletion**: `remove` sætter kun `info = DELETED`. Søgningen fortsætter forbi `DELETED` og stopper først ved `EMPTY`.',
      hold: 2800,
    },
    { caption: 'Rehash-eksemplet: 13, 15, 24, 6 og 23 med linear probing og `x mod 7`. Fem af syv celler er optaget.', hold: 2400 },
    {
      caption:
        'Ny størrelse `nextPrime(2 · 7)` = 17, og hvert element indsættes igen med `x mod 17`. 23 rammer 6 og lander i 7; 24 rammer 7 og lander i 8.',
      hold: 3000,
    },
  ],
  Component: Probing,
}

export default viz
