import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, VTable, type Row } from '../kit/primitives'
import { t } from '../kit/motion'
import './bankers-safe.css'

/* Silberschatz s. 361 (tilstanden efter T1’s request (1,0,2): Allocation, Need,
   Available = (2,3,0), safe sequence <T1, T3, T4, T0, T2>). Bogen oplyser kun
   sekvensen; Work-trinene er regnet ud fra tabellen, som i emnets kodeblok.
   Max-matricen står på s. 356–360, der mangler i materialet, og er ikke vist.
   Indhold: src/content/sys/p4-deadlocks.ts, emnet deadlock-haandtering. */

type V = [number, number, number]
const T = ['T0', 'T1', 'T2', 'T3', 'T4'] as const
const ALLOC: V[] = [
  [0, 1, 0],
  [3, 0, 2],
  [3, 0, 2],
  [2, 1, 1],
  [0, 0, 2],
]
const NEED: V[] = [
  [7, 4, 3],
  [0, 2, 0],
  [6, 0, 0],
  [0, 1, 1],
  [4, 3, 1],
]
const AVAILABLE: V = [2, 3, 0]
const ORDER = [1, 3, 4, 0, 2] // bogens safe sequence

const add = (a: V, b: V): V => [a[0] + b[0], a[1] + b[1], a[2] + b[2]]
const fmt = (v: V) => `(${v.join(',')})`
const cells = (v: V) => v.join(' ')

/** Work før trin k (k = 0 … 5). */
const WORK: V[] = ORDER.reduce<V[]>((acc, i) => [...acc, add(acc[acc.length - 1], ALLOC[i])], [AVAILABLE])

function Bankers({ step }: { step: number }) {
  // Trin 1–5 kører hver sin tråd i sekvensen; trin 6 er slutrammen.
  const k = Math.min(step, 6)
  const doneCount = Math.max(0, Math.min(k, 5))
  const current = k >= 1 && k <= 5 ? ORDER[k - 1] : -1
  const finished = new Set(ORDER.slice(0, doneCount))

  const rows: Row[] = T.map((name, i) => {
    const isNow = i === current
    const done = finished.has(i) && !isNow
    return {
      key: name,
      tone: isNow ? 'focus' : done ? 'muted' : 'idle',
      // Trin 1: T0 prøves først og kan ikke (7 > 2).
      cellTone: isNow ? { 2: 'focus' } : k === 1 && i === 0 ? { 2: 'neg' } : undefined,
      cells: [
        <span key="k55-10" className="mono">{name}</span>,
        <span key="k56-10" className="mono">{cells(ALLOC[i])}</span>,
        <span key="k57-10" className="mono">{cells(NEED[i])}</span>,
        <span key="k58-10" className="mono bk-fin" data-on={finished.has(i) || undefined}>
          {finished.has(i) ? 'true' : 'false'}
        </span>,
      ],
    }
  })

  const work = k === 0 ? null : WORK[Math.min(k, 5)]

  const calc = [
    <div key="k68-6" className="bk-calc-line">
      <span className="vcaps">Available</span>
      <span className="mono">{fmt(AVAILABLE)}</span>
    </div>,
    ...ORDER.map((i, n) => (
      <div className="bk-calc-line" key={i}>
        <span className="mono">
          Need<sub>{T[i]}</sub> {fmt(NEED[i])} ≤ {fmt(WORK[n])}
        </span>
        <span className="mono">
          Work = {fmt(WORK[n])} + {fmt(ALLOC[i])}
        </span>
        <span className="mono bk-res">
          {'     '}= {fmt(WORK[n + 1])}
        </span>
      </div>
    )),
    <div key="k85-6" className="bk-calc-line">
      <span className="mono">Finish[i] = true for alle i</span>
      <span>
        → tilstanden er <strong>safe</strong>, og <code>T1</code>’s request <code>(1,0,2)</code> gives med det samme
      </span>
    </div>,
  ]

  return (
    <div className="bk">
      <div className="bk-table">
        <VTable
          name={
            <>
              Tilstand efter <code>T1</code>’s request <code>(1,0,2)</code>
            </>
          }
          cols={[
            '',
            <>
              Allocation <span className="bk-abc">A B C</span>
            </>,
            <>
              Need <span className="bk-abc">A B C</span>
            </>,
            'Finish',
          ]}
          rows={rows}
          compact
          note={
            <>
              Bog s. 361. <code>Max</code>-matricen står på s. 356–360, som mangler i materialet.
            </>
          }
        />
      </div>

      <div className="bk-side">
        <div className="bk-work">
          <span className="vcaps">Work</span>
          <div className="bk-vec">
            {['A', 'B', 'C'].map((r, j) => (
              <div key={r} className="bk-cell">
                <span className="bk-cell-r">{r}</span>
                <motion.span
                  key={work ? `${r}-${work[j]}` : `${r}-x`}
                  className="bk-cell-v mono"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={t.place}
                >
                  {work ? work[j] : '–'}
                </motion.span>
              </div>
            ))}
          </div>
        </div>

        <Swap show={k} className="bk-calc" items={calc} />

        <div className="bk-seq">
          <span className="vcaps">Safe sequence</span>
          <ol className="bk-slots">
            {ORDER.map((i, n) => {
              const on = n < doneCount
              return (
                <li key={i} className="bk-slot" data-on={on || undefined} data-now={n === k - 1 || undefined}>
                  <motion.span
                    className="mono"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.85 }}
                    transition={on ? t.place : t.fade}
                  >
                    {T[i]}
                  </motion.span>
                </li>
              )
            })}
          </ol>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'bankers-safe',
  title: 'Sikkerhedstjekket i banker’s algorithm',
  steps: [
    {
      caption:
        'Bogens eksempel: `T1` beder om `(1,0,2)`. Algoritmen lader som om den er opfyldt — så er `Available = (2,3,0)`. Er tilstanden safe?',
      hold: 2800,
    },
    {
      caption:
        '`Work = Available`. `T0` kan ikke (`7 > 2`), men `T1`’s `Need (0,2,0)` ≤ `Work`. `T1` kan køre færdig og frigiver sin `Allocation`.',
      hold: 2800,
    },
    { caption: '`T3`: `Need (0,1,1)` ≤ `(5,3,2)`. Den frigiver `(2,1,1)`, og `Work` vokser til `(7,4,3)`.', hold: 2200 },
    { caption: '`T4`: `Need (4,3,1)` ≤ `(7,4,3)`. `Work` bliver `(7,4,5)`.', hold: 1800 },
    { caption: '`T0` kunne ikke før, men nu er `Need (7,4,3)` ≤ `(7,4,5)`.', hold: 2000 },
    { caption: '`T2`: `Need (6,0,0)` ≤ `(7,5,5)`. Alle har `Finish = true`.', hold: 1800 },
    {
      caption:
        'Sekvensen `<T1, T3, T4, T0, T2>` findes, så tilstanden er **safe**, og `T1` får ressourcerne. Bogen giver kun sekvensen; `Work`-trinene er regnet ud fra tabellen.',
      hold: 3200,
    },
  ],
  Component: Bankers,
}

export default viz
