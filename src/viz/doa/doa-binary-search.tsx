import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Swap } from '../kit/primitives'
import { ArrayRow, type ArrayPointer } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-binary-search.css'

/* Lecture08.pdf s. 5 (sorted_temp_readings = {9, 16, 18, 28, 32, 35}, (5+0)/2 = 2),
   s. 6–8 (low 0, high 5, mid 2 = 18), s. 9–10 (28 > 18 → low = mid (2), high − 1 → 4),
   s. 11–14 (mid 3 = 28; bemærkningen om at stoppe), s. 15 (low = high = 3) og s. 16
   (“check value FOUND”). Kontrast: Lecture12.pdf s. 11, rekursiv binarySearch efter 90 i
   {2, 3, 4, 10, 40}: (0,4) mid 2 → (3,4) mid 3 → (4,4) mid 4 → (5,4) tomt → −1.
   Indhold: src/content/doa/p1-grundlag.ts (soegning). */

interface Frame {
  low: number
  mid: number
  high: number
  line: ReactNode
  /** Indeks uden for søgeintervallet. */
  out: (i: number) => boolean
  hit?: number
}

// L08: søg 28. Trin 0–5.
const A: Frame[] = [
  { low: 0, mid: -1, high: 5, line: <>low = 0 (9), high = 5 (35)</>, out: () => false },
  { low: 0, mid: 2, high: 5, line: <>mid = (0 + 5) / 2 = 2 → 18</>, out: () => false },
  { low: 2, mid: -1, high: 4, line: <>28 &gt; 18: low = mid (2), high − 1 = 4</>, out: (i) => i < 2 || i > 4 },
  { low: 2, mid: 3, high: 4, line: <>mid = (2 + 4) / 2 = 3 → 28</>, out: (i) => i < 2 || i > 4 },
  { low: 3, mid: -1, high: 3, line: <>low = mid (3), high − 1 = 3</>, out: (i) => i !== 3 },
  { low: 3, mid: -1, high: 3, line: <>28 = low = high → <strong>FOUND</strong></>, out: (i) => i !== 3, hit: 3 },
]

// L12: søg 90. Trin 6–9. Indeks 5 er en tom plads uden for arrayet (low = 5).
const B: Frame[] = [
  { low: 0, mid: 2, high: 4, line: <>(0, 4): mid 2 → 4 &lt; 90</>, out: (i) => i > 4 },
  { low: 3, mid: 3, high: 4, line: <>(3, 4): mid 3 → 10 &lt; 90</>, out: (i) => i < 3 || i > 4 },
  { low: 4, mid: 4, high: 4, line: <>(4, 4): mid 4 → 40 &lt; 90</>, out: (i) => i !== 4 },
  { low: 5, mid: -1, high: 4, line: <>(5, 4): low &gt; high, tomt → <strong>−1</strong></>, out: () => true },
]

const IDLE_B: Frame = { low: -1, mid: -1, high: -1, line: <>(0, 4) …</>, out: () => false }

function row(id: string, values: string[], f: Frame, extra: number, active: boolean) {
  const pointers: ArrayPointer[] = [
    { id: 'mid', at: f.mid, label: 'mid', tone: 'focus' },
    { id: 'low', at: f.low, label: 'low', tone: 'idle', side: 'bottom' },
    { id: 'high', at: f.high, label: 'high', tone: 'idle', side: 'bottom' },
  ]
  const tones = (i: number): Tone | undefined => {
    if (i >= values.length - extra) return 'ghost'
    if (f.hit === i) return 'ok'
    if (f.mid === i && active) return 'focus'
    if (f.out(i)) return 'muted'
    return undefined
  }
  return <ArrayRow id={id} values={values} tones={tones} pointers={pointers} />
}

function BinarySearch({ step }: { step: number }) {
  const a = A[Math.min(step, A.length - 1)]
  const bOn = step >= 6
  const b = bOn ? B[step - 6] : IDLE_B
  const midsA = ['18', '28'].slice(0, step >= 3 ? 2 : step >= 1 ? 1 : 0)
  const midsB = ['4', '10', '40'].slice(0, bOn ? Math.min(step - 5, 3) : 0)
  return (
    <div className="dbs">
      <section className="dbs-case" data-active={step <= 5 || undefined}>
        <div className="dbs-head">
          <span className="vcaps">L08 · søg 28</span>
          <code className="dbs-arr">sorted_temp_readings</code>
        </div>
        {row('dbs-a', ['9', '16', '18', '28', '32', '35'], a, 0, step <= 5)}
        <Swap show={Math.min(step, A.length - 1)} className="dbs-line" items={A.map((f, i) => <span key={i}>{f.line}</span>)} />
        <div className="dbs-trail">
          mid-værdier: <span className="mono">{midsA.length ? midsA.join(' → ') : '–'}</span>
        </div>
      </section>

      <motion.section
        className="dbs-case"
        data-active={bOn || undefined}
        initial={false}
        animate={{ opacity: bOn ? 1 : 0.35 }}
        transition={bOn ? t.settle : t.fade}
      >
        <div className="dbs-head">
          <span className="vcaps">L12 · søg 90</span>
          <code className="dbs-arr">binarySearch(arr, low, high, x)</code>
        </div>
        {row('dbs-b', ['2', '3', '4', '10', '40', ''], b, 1, bOn)}
        <Swap
          show={bOn ? step - 5 : 0}
          className="dbs-line"
          items={[IDLE_B, ...B].map((f, i) => <span key={i}>{f.line}</span>)}
        />
        <div className="dbs-trail">
          mid-værdier: <span className="mono">{midsB.length ? midsB.join(' → ') : '–'}</span>
        </div>
      </motion.section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-binary-search',
  title: 'Binær søgning halverer intervallet',
  steps: [
    {
      caption: 'Det sorterede array fra L08 og tjekværdien 28. `low` står på indeks 0 (9), `high` på indeks 5 (35).',
      hold: 2200,
    },
    { caption: '28 ligger mellem 9 og 35, så midten beregnes: `(0 + 5) / 2 = 2` med heltalsdivision. Værdien er 18.', hold: 2400 },
    {
      caption:
        '28 er større end 18, så kun den øvre halvdel er tilbage. `low` sættes til `mid` (2), og `high` sænkes med én til 4 — 35 er allerede tjekket.',
      hold: 2800,
    },
    {
      caption: 'Ny midte: `(2 + 4) / 2 = 3`, værdi 28. Man *kunne* stoppe her, men så skulle løkken have et ekstra lighedstest.',
      hold: 2600,
    },
    { caption: 'I stedet sættes `low` til `mid` (3), og `high` sænkes til 3. Intervallet er ét element.', hold: 2200 },
    { caption: '28 er lig både low- og high-værdien: **check value FOUND** efter to midter.', hold: 2000 },
    {
      caption:
        'Kontrast fra L12: søg 90 i `{2, 3, 4, 10, 40}` med `mid + 1`. Kaldet `(0, 4)` giver mid 2, og 4 < 90 — søg til højre.',
      hold: 2400,
    },
    { caption: '`(3, 4)`: mid 3, og 10 < 90. Den venstre halvdel besøges aldrig.', hold: 1800 },
    { caption: '`(4, 4)`: mid 4, og 40 < 90. Næste kald bliver `(5, 4)`.', hold: 1800 },
    {
      caption:
        '`low` = 5 er større end `high` = 4: intervallet er tomt, og funktionen returnerer **−1**. Tre midter for fem elementer — halvering giver O(log N).',
      hold: 3000,
    },
  ],
  Component: BinarySearch,
}

export default viz
