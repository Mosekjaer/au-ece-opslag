import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import { t } from '../kit/motion'
import './doa-loop-count.css'

/* Lecture02.pdf s. 35 (partialsum.c, Σ i³ for i = 1 … N, optalt linje for linje: linje 2
   1 initialisering; linje 4 1 initialisering, N + 1 sammenligninger, N inkrementeringer;
   linje 5 2 multiplikationer, 1 addition, 1 tildeling pr. gennemløb; linje 7 1 tildeling;
   T(N) = 6N + 4 = O(N)) og s. 36 (samme i O: O(1), O(N) i alt, O(1) pr. gennemløb, O(1);
   O(N) + 3·O(1) = O(N)). Indhold: src/content/doa/p1-grundlag.ts (loekkeanalyse). */

const CODE: ReactNode[] = [
  <>
    <b>int</b> sum(<b>int</b> n) {'{'}
  </>,
  <>
    {'  '}
    <b>int</b> i, partialSum = 0;
  </>,
  <></>,
  <>
    {'  '}
    <b>for</b> (i = 1; i &lt;= n; i++) {'{'}
  </>,
  <>{'    '}partialSum = partialSum + (i * i * i);</>,
  <>{'  }'}</>,
  <>
    {'  '}
    <b>return</b> partialSum;
  </>,
  <>{'}'}</>,
]

interface Tally {
  line: number
  at: number
  ops: ReactNode
  count: ReactNode
  big: ReactNode
}

const TALLY: Tally[] = [
  { line: 2, at: 1, ops: '1 initialisering', count: '1', big: 'O(1)' },
  {
    line: 4,
    at: 2,
    ops: '1 initialisering, N + 1 sammenligninger, N inkrementeringer',
    count: '2N + 2',
    big: 'O(N) i alt',
  },
  {
    line: 5,
    at: 3,
    ops: '2 multiplikationer, 1 addition, 1 tildeling — pr. gennemløb, N gange',
    count: '4N',
    big: 'O(1) pr. gennemløb',
  },
  { line: 7, at: 4, ops: '1 tildeling', count: '1', big: 'O(1)' },
]

const LAST = 6

function LoopCount({ step }: { step: number }) {
  const now = TALLY.find((r) => r.at === step)?.line
  return (
    <div className="dlc">
      <div className="dlc-code">
        <div className="dlc-file vcaps">partialsum.c</div>
        <ol className="dlc-lines">
          {CODE.map((c, i) => {
            const n = i + 1
            const counted = TALLY.some((r) => r.line === n && step >= r.at)
            return (
              <li key={n} data-now={now === n || undefined} data-done={(counted && now !== n) || undefined}>
                <span className="dlc-ln">{n}</span>
                <code>{c}</code>
              </li>
            )
          })}
        </ol>
      </div>

      <div className="dlc-side">
        <table className="dlc-table">
          <thead>
            <tr>
              <th>Linje</th>
              <th>Operationer</th>
              <th className="is-num">Antal</th>
              <th className="is-num">O</th>
            </tr>
          </thead>
          <tbody>
            {TALLY.map((r) => {
              const on = step >= r.at
              return (
                <motion.tr
                  key={r.line}
                  data-now={step === r.at || undefined}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={on ? t.settle : t.fade}
                >
                  <td className="mono">{r.line}</td>
                  <td className="dlc-ops">{r.ops}</td>
                  <td className="is-num mono">{r.count}</td>
                  <td className="is-num mono dlc-big" data-on={step >= LAST || undefined}>
                    <motion.span
                      initial={false}
                      animate={{ opacity: step >= LAST ? 1 : 0 }}
                      transition={step >= LAST ? t.settle : t.fade}
                    >
                      {r.big}
                    </motion.span>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>

        <div className="dlc-total">
          <Swap
            show={step >= LAST ? 2 : step >= 5 ? 1 : 0}
            items={[
              <span key="k0" className="dlc-sum is-ghost">T(N) = …</span>,
              <span key="k1" className="dlc-sum">
                T(N) = 1 + (2N + 2) + 4N + 1 = <strong>6N + 4</strong>
              </span>,
              <span key="k2" className="dlc-sum">
                O(N) + 3·O(1) = <strong>O(N)</strong>
              </span>,
            ]}
          />
          <motion.span
            className="dlc-rule"
            initial={false}
            animate={{ opacity: step >= LAST ? 1 : 0 }}
            transition={step >= LAST ? t.settle : t.fade}
          >
            Konstanter og mindre led smides væk. Løkke: krop × antal gennemløb (s. 37).
          </motion.span>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-loop-count',
  title: 'Optælling af partialsum.c linje for linje',
  steps: [
    { caption: '`partialsum.c` beregner Σ i³ for i = 1 … N. Vi tæller operationer linje for linje.', hold: 2000 },
    { caption: 'Linje 2 initialiserer `partialSum` én gang: **1** operation.', hold: 1600 },
    {
      caption:
        'Linje 4 initialiserer `i` én gang, sammenligner `i <= n` **N + 1** gange (den sidste fejler) og tæller op N gange: 2N + 2.',
      hold: 2800,
    },
    {
      caption: 'Linje 5 koster 2 multiplikationer, 1 addition og 1 tildeling — og den kører N gange: **4N**.',
      hold: 2400,
    },
    { caption: 'Linje 7 returnerer én gang: **1**.', hold: 1400 },
    { caption: 'Summen er **T(N) = 6N + 4**. Arbejdet vokser lineært med N.', hold: 2200 },
    {
      caption:
        'I O-notation er det ligegyldigt, om linje 5 koster 2 eller 4: O(N) + 3·O(1) = **O(N)**. Kun løkkens antal gennemløb tæller.',
      hold: 3000,
    },
  ],
  Component: LoopCount,
}

export default viz
