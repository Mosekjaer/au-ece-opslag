import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { ArrayRow } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-insertion-sort.css'

/* Lecture06.pdf s. 5 (arrayet 34 8 64 51 32 21 og de tre første gennemløb med
   grønt sorteret præfiks) og s. 7 (sporingen af p = 1: tmp = 8, mellemtilstanden
   34 34 64 51 32 21, a[0] = tmp); Weiss figur 7.1 s. 292 (alle fem gennemløb og
   antal flytninger 1, 0, 1, 3, 4) og s. 295 (antal flytninger = antal
   inversioner = 9). Indhold: src/content/doa/p4-sortering.ts.

   `tmp`-feltet bruger samme layoutId som ArrayRows værdier (`<id>-v-<nøgle>`, se
   kit/algo.tsx), så 8 glider ud af arrayet og ind igen. */

const ID = 'dis-arr'

interface State {
  vals: number[]
  keys: string[]
  /** Sidste indeks i det sorterede præfiks. */
  sorted: number
  /** Indeks for det element, der netop er sat ind (eller kopieret). */
  hot?: number
  p?: number
  tmp?: { v: number; key?: string }
}

const S: State[] = [
  { vals: [34, 8, 64, 51, 32, 21], keys: ['34', '8', '64', '51', '32', '21'], sorted: 0 },
  // p = 1: tmp = 8, a[1] = a[0] (slidets mellemtilstand).
  { vals: [34, 34, 64, 51, 32, 21], keys: ['34', '34c', '64', '51', '32', '21'], sorted: 0, hot: 1, p: 1, tmp: { v: 8, key: '8' } },
  { vals: [8, 34, 64, 51, 32, 21], keys: ['8', '34', '64', '51', '32', '21'], sorted: 1, hot: 0, p: 1 },
  { vals: [8, 34, 64, 51, 32, 21], keys: ['8', '34', '64', '51', '32', '21'], sorted: 2, hot: 2, p: 2, tmp: { v: 64 } },
  { vals: [8, 34, 51, 64, 32, 21], keys: ['8', '34', '51', '64', '32', '21'], sorted: 3, hot: 2, p: 3, tmp: { v: 51 } },
  { vals: [8, 32, 34, 51, 64, 21], keys: ['8', '32', '34', '51', '64', '21'], sorted: 4, hot: 1, p: 4, tmp: { v: 32 } },
  { vals: [8, 21, 32, 34, 51, 64], keys: ['8', '21', '32', '34', '51', '64'], sorted: 5, hot: 1, p: 5, tmp: { v: 21 } },
  { vals: [8, 21, 32, 34, 51, 64], keys: ['8', '21', '32', '34', '51', '64'], sorted: 5 },
]

// Weiss figur 7.1: tilstanden efter hvert gennemløb og antal flytninger. `at` = trinet hvor rækken kommer.
const LOG = [
  { p: 1, row: '8 34 64 51 32 21', moved: 1, at: 2 },
  { p: 2, row: '8 34 64 51 32 21', moved: 0, at: 3 },
  { p: 3, row: '8 34 51 64 32 21', moved: 1, at: 4 },
  { p: 4, row: '8 32 34 51 64 21', moved: 3, at: 5 },
  { p: 5, row: '8 21 32 34 51 64', moved: 4, at: 6 },
]
const FINAL = S.length - 1

function Insertion({ step }: { step: number }) {
  const s = S[step]
  const tone = (i: number): Tone => {
    if (i === s.hot) return 'focus'
    if (i <= s.sorted) return 'ok'
    return 'idle'
  }
  return (
    <div className="dis">
      <section className="dis-main">
        <div className="dis-row">
          <ArrayRow
            id={ID}
            values={s.vals}
            keys={s.keys}
            tones={tone}
            pointers={[{ id: 'p', at: s.p ?? -1, label: <>p = {s.p ?? ''}</>, side: 'bottom' }]}
          />
          <div className="dis-tmp">
            <span className="dis-tmp-cell" data-on={s.tmp ? 'on' : undefined}>
              {s.tmp &&
                (s.tmp.key ? (
                  <motion.span layoutId={`${ID}-v-${s.tmp.key}`} layout="position" transition={t.travel}>
                    {s.tmp.v}
                  </motion.span>
                ) : (
                  <span>{s.tmp.v}</span>
                ))}
            </span>
            <span className="mono dis-tmp-name">tmp</span>
          </div>
        </div>
        <span className="dis-legend">
          <i className="dis-key is-ok" /> sorteret præfiks
          <i className="dis-key is-focus" /> netop flyttet
        </span>
      </section>

      <section className="dis-log">
        <span className="vcaps">Efter hvert gennemløb (Weiss fig. 7.1)</span>
        <table>
          <thead>
            <tr>
              <th>p</th>
              <th>array</th>
              <th>flyttet</th>
            </tr>
          </thead>
          <tbody>
            {LOG.map((r) => {
              const on = step >= r.at
              return (
                <motion.tr
                  key={r.p}
                  data-now={step === r.at || undefined}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={on ? t.settle : t.fade}
                >
                  <td>{r.p}</td>
                  <td className="mono">{r.row}</td>
                  <td>{r.moved}</td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
        <motion.p
          className="dis-sum"
          initial={false}
          animate={{ opacity: step >= FINAL ? 1 : 0 }}
          transition={step >= FINAL ? t.settle : t.fade}
        >
          1 + 0 + 1 + 3 + 4 = <strong>9 flytninger</strong> = 9 inversioner.
        </motion.p>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-insertion-sort',
  title: 'Insertion sort på 34 8 64 51 32 21',
  steps: [
    { caption: 'Slidets array. Præfikset `a[0]` er sorteret af sig selv.', hold: 1800 },
    {
      caption: '`p = 1`: `8` gemmes i `tmp`. Da `8 < 34`, kopieres `a[0]` til `a[1]` — arrayet er et øjeblik `34 34 64 51 32 21`.',
      hold: 3000,
    },
    { caption: '`a[0] = tmp`. Præfikset `8 34` er sorteret efter én flytning.', hold: 2200 },
    { caption: '`p = 2`: `64` er større end `34` og bliver stående. Nul flytninger.', hold: 1800 },
    { caption: '`p = 3`: `64` skubbes én plads til højre, og `51` sættes ind foran.', hold: 2200 },
    { caption: '`p = 4`: `32` er mindre end `34`, `51` og `64`. Tre flytninger.', hold: 2400 },
    { caption: '`p = 5`: `21` skal forbi fire elementer. Fire flytninger.', hold: 2400 },
    {
      caption:
        'Sorteret. Hver flytning retter præcis én **inversion**, så de 9 flytninger er arrayets 9 inversioner (Weiss s. 295).',
      hold: 3000,
    },
  ],
  Component: Insertion,
}

export default viz
