import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './fit-fragmentation.css'

/* 10.2-Week_11_-_Memory_management.pdf s. 12 (layoutet: OS, Process 3, hul, Process 2,
   hul, Process 7, hul, Process 5, Process 6, hul; Process 4 venter) og s. 13
   (Process 12 venter, selv om hullerne tilsammen er store nok). Slidene har ingen
   størrelser — alle KB-tal her er et eksempel. Reglerne for first-, best- og worst-fit
   er fra s. 12. */

type Seg = { kind: 'os' | 'proc'; name: string; short: string; size: number } | { kind: 'hole'; id: number; size: number }

const MEM: Seg[] = [
  { kind: 'os', name: 'OS', short: 'OS', size: 16 },
  { kind: 'proc', name: 'Process 3', short: 'P3', size: 12 },
  { kind: 'hole', id: 0, size: 20 },
  { kind: 'proc', name: 'Process 2', short: 'P2', size: 10 },
  { kind: 'hole', id: 1, size: 14 },
  { kind: 'proc', name: 'Process 7', short: 'P7', size: 12 },
  { kind: 'hole', id: 2, size: 30 },
  { kind: 'proc', name: 'Process 5', short: 'P5', size: 10 },
  { kind: 'proc', name: 'Process 6', short: 'P6', size: 10 },
  { kind: 'hole', id: 3, size: 8 },
]
const P4 = 12
const P12 = 40

interface Strategy {
  id: string
  name: string
  rule: string
  /** Hul-id der vælges. */
  pick: number
  /** Trin hvor Process 4 placeres. */
  at: number
}
const STRATS: Strategy[] = [
  { id: 'first', name: 'First-fit', rule: 'første hul ≥ 12', pick: 0, at: 1 },
  { id: 'best', name: 'Best-fit', rule: 'mindste hul ≥ 12', pick: 1, at: 2 },
  { id: 'worst', name: 'Worst-fit', rule: 'største hul', pick: 2, at: 3 },
]

const h = (size: number) => `calc(1.3rem + ${size * 0.055}rem)`

function holesAfter(s: Strategy) {
  return MEM.filter((m) => m.kind === 'hole').map((m) => (m.kind === 'hole' && m.id === s.pick ? m.size - P4 : m.size))
}

function Column({ s, step }: { s: Strategy; step: number }) {
  const placed = step >= s.at
  const now = step === s.at
  const frag = step >= 4
  const holes = holesAfter(s)
  const total = holes.reduce((a, b) => a + b, 0)
  const largest = Math.max(...holes)

  return (
    <div className="sff-col" data-now={now || undefined}>
      <div className="sff-head">
        <span className="sff-name">{s.name}</span>
        <span className="sff-rule">{s.rule}</span>
      </div>
      <div className="sff-mem">
        {MEM.map((m, i) => {
          if (m.kind !== 'hole') {
            return (
              <div key={i} className="sff-seg" data-kind={m.kind} style={{ height: h(m.size) }}>
                <span className="sff-long">{m.name}</span>
                <span className="sff-short">{m.short}</span>
              </div>
            )
          }
          const chosen = m.id === s.pick
          const split = chosen && placed
          const rest = chosen ? m.size - P4 : m.size
          const holeTone = frag ? 'neg' : chosen && now ? 'focus' : 'idle'
          return (
            <div key={i} className="sff-hole" style={{ height: h(m.size) }}>
              <motion.div
                className="sff-p4"
                initial={false}
                animate={{ flexGrow: split ? P4 : 0.0001, opacity: split ? 1 : 0 }}
                transition={split ? t.place : t.fade}
              >
                {split && (
                  <Token id={`p4-${s.id}`} tone={now ? 'focus' : 'idle'}>
                    P4
                  </Token>
                )}
              </motion.div>
              <motion.div
                className="sff-free"
                data-tone={holeTone}
                initial={false}
                animate={{ flexGrow: split ? rest : m.size }}
                transition={t.place}
              >
                <span className="mono">{split ? rest : m.size}</span>
                <span className="sff-kb">KB</span>
              </motion.div>
            </div>
          )
        })}
      </div>
      <motion.div className="sff-foot" initial={false} animate={{ opacity: frag ? 1 : 0 }} transition={t.fade}>
        <span>
          fri i alt <b className="mono">{total}</b>
        </span>
        <span>
          største <b className="mono sff-neg">{largest}</b>
        </span>
      </motion.div>
    </div>
  )
}

function Fit({ step }: { step: number }) {
  const frag = step >= 4
  const final = step >= 5
  return (
    <div className="sff">
      <div className="sff-side">
        <div className="sff-wait">
          <span className="vcaps">Venter</span>
          <div className="sff-req">
            <span className="sff-req-name">Process 4</span>
            <span className="mono">{P4} KB</span>
            <span className="sff-stack">
              {STRATS.map((s) => (step < s.at ? <Token key={s.id} id={`p4-${s.id}`} tone="idle">P4</Token> : null))}
            </span>
          </div>
          <motion.div
            className="sff-req"
            data-tone="neg"
            initial={false}
            animate={{ opacity: frag ? 1 : 0, y: frag ? 0 : 4 }}
            transition={frag ? t.place : t.fade}
          >
            <span className="sff-req-name">Process 12</span>
            <span className="mono">{P12} KB</span>
            <Tag tone="neg">intet hul ≥ {P12}</Tag>
          </motion.div>
        </div>
        <motion.p className="sff-note" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
          <b>Fragmentering:</b> 60 KB fri i alt, men ingen sammenhængende blok på 40. First-fit: <code>N</code> blokke
          taber <code>0,5 · N</code> — op til en tredjedel.
        </motion.p>
        <p className="sff-legend">Størrelser i KB er et eksempel; slidet har ingen tal.</p>
      </div>
      <div className="sff-cols">
        {STRATS.map((s) => (
          <Column key={s.id} s={s} step={step} />
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'fit-fragmentation',
  title: 'Tre måder at finde et hul på',
  steps: [
    {
      caption: 'Hukommelsen fra slidet: processer med huller imellem. **Process 4** skal have 12 KB. Størrelserne er et *eksempel*.',
      hold: 2600,
    },
    { caption: '**First-fit** tager det *første* hul, der er stort nok, og stopper søgningen. Hullet splittes: 12 til processen, 8 forbliver fri.', hold: 2800 },
    { caption: '**Best-fit** gennemsøger alle huller og tager det *mindste*, der er stort nok: 14. Tilbage bliver et hul på 2.', hold: 2800 },
    { caption: '**Worst-fit** tager det *største* hul: 30. Resten, 18, er stadig et brugbart hul.', hold: 2600 },
    {
      caption: '**Process 12** skal have 40 KB. Alle tre har 60 KB fri, men det største hul er 30 eller mindre — processen må vente.',
      hold: 3000,
    },
    {
      caption: 'Det er **fragmentering**: plads nok i alt, men ikke sammenhængende. First- og best-fit er bedre end worst-fit, first-fit er hurtigst — men ingen af dem undgår huller.',
      hold: 3200,
    },
  ],
  Component: Fit,
}

export default viz
