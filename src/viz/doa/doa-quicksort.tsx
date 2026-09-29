import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { ArrayRow, type ArrayPointer } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-quicksort.css'

/* Weiss s. 313 (median-of-three på 8, 1, 4, 9, 6, 3, 5, 2, 7, 0: venstre 8,
   midte 6, højre 0 → pivot 6) og s. 313–314 (partitionen: pivot byttes til enden,
   i fra første, j fra næstsidste element; 2 1 4 9 0 3 5 8 7 6 → 2 1 4 5 0 3 9 8 7 6
   → i og j krydser → pivot byttes med a[i]: 2 1 4 5 0 3 6 8 7 9). Lecture06.pdf
   s. 16 (pivot som median-of-three af left/center/right) og s. 17 (“Next Sub
   level” | “In Position” | “Next Sub level”). Slidets egen kørsel på [5,1,8,2,5,7]
   er ikke brugt: dens række i = 2 følger hverken videoens eller Weiss’ skema (se
   emnets gaps). Indhold: src/content/doa/p4-sortering.ts. */

interface State {
  vals: number[]
  i?: number
  j?: number
  pivot: number // indeks, -1 = endnu ikke valgt
  hot?: number[]
  hotTone?: Tone
  cand?: boolean
  done?: boolean
}

const S: State[] = [
  { vals: [8, 1, 4, 9, 6, 3, 5, 2, 7, 0], pivot: -1, cand: true },
  { vals: [8, 1, 4, 9, 0, 3, 5, 2, 7, 6], pivot: 9, i: 0, j: 8 },
  { vals: [8, 1, 4, 9, 0, 3, 5, 2, 7, 6], pivot: 9, i: 0, j: 7, hot: [0, 7], hotTone: 'neg' },
  { vals: [2, 1, 4, 9, 0, 3, 5, 8, 7, 6], pivot: 9, i: 0, j: 7, hot: [0, 7], hotTone: 'focus' },
  { vals: [2, 1, 4, 9, 0, 3, 5, 8, 7, 6], pivot: 9, i: 3, j: 6, hot: [3, 6], hotTone: 'neg' },
  { vals: [2, 1, 4, 5, 0, 3, 9, 8, 7, 6], pivot: 9, i: 3, j: 6, hot: [3, 6], hotTone: 'focus' },
  { vals: [2, 1, 4, 5, 0, 3, 9, 8, 7, 6], pivot: 9, i: 6, j: 5, hot: [6], hotTone: 'focus' },
  { vals: [2, 1, 4, 5, 0, 3, 6, 8, 7, 9], pivot: 6, i: 6, j: 5, done: true },
]

const LOG = [
  { what: 'input', row: '8 1 4 9 6 3 5 2 7 0', at: 0 },
  { what: 'pivot til enden', row: '8 1 4 9 0 3 5 2 7 6', at: 1 },
  { what: '1. swap', row: '2 1 4 9 0 3 5 8 7 6', at: 3 },
  { what: '2. swap', row: '2 1 4 5 0 3 9 8 7 6', at: 5 },
  { what: 'pivot ind på a[i]', row: '2 1 4 5 0 3 6 8 7 9', at: 7 },
]

const FINAL = S.length - 1

function Quick({ step }: { step: number }) {
  const s = S[step]
  const tone = (k: number): Tone => {
    if (k === s.pivot) return 'ok'
    if (s.cand && (k === 0 || k === 4 || k === 9)) return 'focus'
    if (s.hot?.includes(k)) return s.hotTone ?? 'focus'
    return 'idle'
  }
  const pointers: ArrayPointer[] = [
    { id: 'left', at: s.cand ? 0 : -1, label: 'left', tone: 'idle' },
    { id: 'center', at: s.cand ? 4 : -1, label: 'center', tone: 'idle' },
    { id: 'right', at: s.cand ? 9 : -1, label: 'right', tone: 'idle' },
    { id: 'pivot', at: s.pivot, label: 'pivot' },
    { id: 'i', at: s.i ?? -1, label: 'i', side: 'bottom' },
    { id: 'j', at: s.j ?? -1, label: 'j', side: 'bottom', tone: 'neg' },
  ]
  const keys = s.vals.map(String)

  return (
    <div className="dqs">
      <section className="dqs-main">
        <ArrayRow id="dqs-arr" values={s.vals} keys={keys} tones={tone} pointers={pointers} />
        <motion.div
          className="dqs-parts"
          initial={false}
          animate={{ opacity: s.done ? 1 : 0 }}
          transition={s.done ? { ...t.settle, delay: 0.5 } : t.fade}
        >
          <span className="dqs-part" style={{ gridColumn: '1 / span 6' }}>
            <b>&lt; 6</b> næste niveau
          </span>
          <span className="dqs-part is-pivot" style={{ gridColumn: '7 / span 1' }}>
            på plads
          </span>
          <span className="dqs-part" style={{ gridColumn: '8 / span 3' }}>
            <b>&gt; 6</b> næste niveau
          </span>
        </motion.div>
      </section>

      <section className="dqs-log">
        <span className="vcaps">Kørslen (Weiss s. 313–314)</span>
        <ol>
          {LOG.map((r) => {
            const on = step >= r.at
            return (
              <motion.li
                key={r.what}
                data-now={step === r.at || undefined}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={on ? t.settle : t.fade}
              >
                <span className="dqs-what">{r.what}</span>
                <span className="mono">{r.row}</span>
              </motion.li>
            )
          })}
        </ol>
        <motion.p
          className="dqs-note"
          initial={false}
          animate={{ opacity: step >= FINAL ? 1 : 0 }}
          transition={step >= FINAL ? t.settle : t.fade}
        >
          Quicksort kalder sig selv på <code>2 1 4 5 0 3</code> og <code>8 7 9</code>; ingen fletning bagefter.
        </motion.p>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-quicksort',
  title: 'Median-of-three og partition med i og j',
  steps: [
    {
      caption: '**Median-of-three**: af venstre `8`, midterste `6` og højre `0` er medianen `6`. Det bliver pivotet.',
      hold: 2800,
    },
    {
      caption: 'Pivotet byttes ud til enden. `i` starter ved første element, `j` ved næstsidste.',
      hold: 2400,
    },
    {
      caption: '`i` stopper straks ved `8 > 6`. `j` går til venstre over `7` og stopper ved `2 < 6`. Begge står forkert.',
      hold: 2800,
    },
    { caption: '`i` er til venstre for `j`, så de to byttes.', hold: 1800 },
    { caption: '`i` løber forbi `1` og `4` og stopper ved `9`; `j` stopper ved `5`.', hold: 2400 },
    { caption: 'Byt igen: `5` kommer til venstre, `9` til højre.', hold: 1800 },
    {
      caption: '`i` stopper ved `9`, `j` ved `3` — nu er `i` til højre for `j`. De har **krydset**, og partitionen er færdig.',
      hold: 2800,
    },
    {
      caption: 'Pivotet byttes med `a[i]` og står på sin endelige plads. Alt til venstre er mindre end `6`, alt til højre større.',
      hold: 3000,
    },
  ],
  Component: Quick,
}

export default viz
