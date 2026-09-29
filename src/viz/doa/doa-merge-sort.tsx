import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t, stagger } from '../kit/motion'
import './doa-merge-sort.css'

/* Lecture06.pdf s. 9 (split, sortér hver del, flet), s. 10 (General principle:
   23 16 8 24 35 87 19 4 delt tre gange til otte enkeltelementer, “Sorted by
   definition”, og flettet op igen i tre rækker) og s. 12 (O(log n) niveauer med
   O(n) fletarbejde hver → O(n log n)). Indhold: src/content/doa/p4-sortering.ts. */

type Kind = 'input' | 'del' | 'base' | 'flet'

interface Level {
  kind: Kind
  groups: number[][]
  label: string
  note?: string
}

const LEVELS: Level[] = [
  { kind: 'input', label: 'input', groups: [[23, 16, 8, 24, 35, 87, 19, 4]] },
  { kind: 'del', label: 'del', groups: [[23, 16, 8, 24], [35, 87, 19, 4]] },
  { kind: 'del', label: 'del', groups: [[23, 16], [8, 24], [35, 87], [19, 4]] },
  { kind: 'base', label: 'base', groups: [[23], [16], [8], [24], [35], [87], [19], [4]], note: 'sorteret per definition' },
  { kind: 'flet', label: 'flet', groups: [[16, 23], [8, 24], [35, 87], [4, 19]], note: '8 elementer flettet' },
  { kind: 'flet', label: 'flet', groups: [[8, 16, 23, 24], [4, 19, 35, 87]], note: '8 elementer flettet' },
  { kind: 'flet', label: 'flet', groups: [[4, 8, 16, 19, 23, 24, 35, 87]], note: '8 elementer flettet' },
]
const FINAL = LEVELS.length // sidste trin viser analysen

function Merge({ step }: { step: number }) {
  return (
    <div className="dms">
      <ol className="dms-levels">
        {LEVELS.map((lv, li) => {
          const on = step >= li
          const now = step === li
          const showNote = lv.kind === 'base' ? on : step >= FINAL
          return (
            <li key={li} className="dms-level" data-kind={lv.kind} data-now={now || undefined}>
              <motion.span
                className="dms-label"
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={on ? t.settle : t.fade}
              >
                {lv.label}
              </motion.span>
              <div className="dms-row">
                {lv.groups.map((g, gi) => {
                  // Flet-rækker fyldes fra venstre i hver gruppe, som fletningen skriver output.
                  const before = lv.groups.slice(0, gi).reduce((n, x) => n + x.length, 0)
                  return (
                    <div key={gi} className="dms-group">
                      {g.map((v, vi) => (
                        <motion.span
                          key={vi}
                          className="dms-cell"
                          initial={false}
                          animate={{ opacity: on ? 1 : 0, y: on ? 0 : -6 }}
                          transition={on ? stagger(lv.kind === 'flet' ? vi : before + vi, 0.05, lv.kind === 'flet' ? 0.11 : 0.03) : t.fade}
                        >
                          {v}
                        </motion.span>
                      ))}
                    </div>
                  )
                })}
              </div>
              <motion.span
                className="dms-note"
                initial={false}
                animate={{ opacity: lv.note && showNote ? 1 : 0 }}
                transition={showNote ? t.settle : t.fade}
              >
                {lv.note ?? ''}
              </motion.span>
            </li>
          )
        })}
      </ol>
      <motion.p
        className="dms-sum"
        initial={false}
        animate={{ opacity: step >= FINAL ? 1 : 0 }}
        transition={step >= FINAL ? { ...t.settle, delay: 0.2 } : t.fade}
      >
        3 = log₂ 8 fletniveauer × O(n) arbejde pr. niveau = <strong>O(n log n)</strong>
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-merge-sort',
  title: 'Del til enkeltelementer, flet op igen',
  steps: [
    { caption: 'Slidets input: otte usorterede tal.', hold: 1600 },
    { caption: '**Del**: arrayet splittes i to halvdele.', hold: 1600 },
    { caption: 'Hver halvdel splittes igen, rekursivt.', hold: 1600 },
    { caption: 'Otte enkeltelementer. Et array med ét element er *sorteret per definition* — det er base case.', hold: 2400 },
    {
      caption: '**Flet** parvis: sammenlign de to forreste, skriv det mindste, gentag. `[19] [4]` bliver `[4 19]`.',
      hold: 2600,
    },
    { caption: 'To sorterede par flettes til sorterede firere: `8 16 23 24` og `4 19 35 87`.', hold: 2400 },
    { caption: 'Sidste fletning giver hele det sorterede array.', hold: 2200 },
    {
      caption: 'Hvert fletniveau rører alle n elementer én gang, og der er log n niveauer: O(n log n) i alle tilfælde.',
      hold: 3000,
    },
  ],
  Component: Merge,
}

export default viz
