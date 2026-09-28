import { AnimatePresence, motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './transactions.css'

/* Det ikke-serialiserbare skema fra Transactions-slides, trin for trin.
   T1 overfører 50 fra A til B; T2 overfører 10 % af A til B.
   Startværdier fra det klassiske eksempel: A = 1000, B = 300 (sum 1300).
   Regnestykket:
     T1: read(A)=1000, A := 950            (ikke skrevet endnu)
     T2: read(A)=1000, temp = 100, A := 900, write(A) → A = 900, read(B)=300
     T1: write(A) → A = 950   (T2's skrivning tabt), read(B)=300, B := 350, write(B) → B = 350
     T2: B := 300 + 100 = 400, write(B) → B = 400   (T1's skrivning tabt)
   Slut: A = 950, B = 400, sum 1350.
   Serielt T1 → T2: A = 855, B = 445, sum 1300. */

type Op = { tx: 1 | 2; op: string; val?: string; step: number; lost?: boolean; overwrites?: boolean }

const OPS: Op[] = [
  { tx: 1, op: 'read(A)', val: '1000', step: 1 },
  { tx: 1, op: 'A := A - 50', val: '950', step: 1 },
  { tx: 2, op: 'read(A)', val: '1000', step: 2 },
  { tx: 2, op: 'temp := A * 0.1', val: '100', step: 2 },
  { tx: 2, op: 'A := A - temp', val: '900', step: 2 },
  { tx: 2, op: 'write(A)', val: 'A = 900', step: 2, lost: true },
  { tx: 2, op: 'read(B)', val: '300', step: 3 },
  { tx: 1, op: 'write(A)', val: 'A = 950', step: 3, overwrites: true },
  { tx: 1, op: 'read(B)', val: '300', step: 4 },
  { tx: 1, op: 'B := B + 50', val: '350', step: 4 },
  { tx: 1, op: 'write(B)', val: 'B = 350', step: 4, lost: true },
  { tx: 1, op: 'commit', step: 4 },
  { tx: 2, op: 'B := B + temp', val: '400', step: 5 },
  { tx: 2, op: 'write(B)', val: 'B = 400', step: 5, overwrites: true },
  { tx: 2, op: 'commit', step: 5 },
]

// Værdien i databasen efter hvert trin, og om den netop er blevet overskrevet.
const DB_A = [1000, 1000, 900, 950, 950, 950, 950]
const DB_B = [300, 300, 300, 300, 350, 400, 400]
const A_HIST = [
  { v: '1000', from: 0 },
  { v: '900', from: 2, lostAt: 3 },
  { v: '950', from: 3 },
]
const B_HIST = [
  { v: '300', from: 0 },
  { v: '350', from: 4, lostAt: 5 },
  { v: '400', from: 5 },
]

function Value({ name, value, hist, step, clash }: { name: string; value: number; hist: typeof A_HIST; step: number; clash: boolean }) {
  return (
    <div className="tx-val" data-tone={clash ? 'neg' : 'idle'}>
      <span className="tx-val-name mono">{name}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          className="tx-val-num"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={t.place}
        >
          {value}
        </motion.span>
      </AnimatePresence>
      <span className="tx-hist mono" aria-label={`${name} over tid`}>
        {hist.map((h, i) => (
          <motion.span
            key={h.v}
            className="tx-hist-v"
            data-lost={h.lostAt !== undefined && step >= h.lostAt}
            initial={false}
            animate={{ opacity: step >= h.from ? 1 : 0 }}
            transition={t.fade}
          >
            {i > 0 && '→ '}
            {h.v}
          </motion.span>
        ))}
      </span>
    </div>
  )
}

function Schedule({ step }: { step: number }) {
  const last = step === 6
  const sumNow = DB_A[step] + DB_B[step]
  return (
    <div className="tx">
      <div className="tx-sched" role="table" aria-label="Ikke-serialiserbart skema">
        <div className="tx-colhead" role="row">
          <span className="vcaps">T1 · overfør 50 fra A til B</span>
          <span className="vcaps">T2 · overfør 10 % af A til B</span>
        </div>
        {OPS.map((o, i) => {
          const done = step >= o.step
          const tone =
            o.overwrites && (step === o.step || last) ? 'neg'
            : step === o.step ? 'focus'
            : o.lost && step >= o.step + 1 ? 'lost'
            : done ? 'idle'
            : 'muted'
          return (
            <div key={i} className="tx-line" role="row" data-tx={o.tx} data-tone={tone}>
              <span className="tx-op mono">{o.op}</span>
              {o.val && (
                <motion.span className="tx-res mono" initial={false} animate={{ opacity: done ? 1 : 0 }} transition={t.fade}>
                  {o.val}
                </motion.span>
              )}
            </div>
          )
        })}
      </div>

      <div className="tx-db">
        <span className="vcaps">Databasen</span>
        <Value name="A" value={DB_A[step]} hist={A_HIST} step={step} clash={step === 3} />
        <Value name="B" value={DB_B[step]} hist={B_HIST} step={step} clash={step === 5} />
        <div className="tx-sum" data-tone={last ? 'neg' : step === 0 ? 'idle' : 'muted'}>
          <span className="mono">A + B</span>
          <span className="tx-sum-num">{sumNow}</span>
          <Tag show={last} tone="neg">var 1300</Tag>
        </div>
        <div className="tx-tags">
          <Tag show={step === 3 || last} tone="neg">T2’s write(A) er tabt</Tag>
          <Tag show={step === 5 || last} tone="neg">T1’s write(B) er tabt</Tag>
        </div>
        <motion.div className="tx-serial" initial={false} animate={{ opacity: last ? 1 : 0 }} transition={t.settle}>
          <span className="vcaps">Serielt: T1, så T2</span>
          <span className="mono">A = 855 · B = 445 · A + B = 1300</span>
        </motion.div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'transactions',
  title: 'Tabt opdatering i et ikke-serialiserbart skema',
  steps: [
    {
      caption: 'Materialets ikke-serialiserbare skema med startværdierne fra det klassiske eksempel: A = 1000, B = 300. Summen er 1300.',
      hold: 2400,
    },
    { caption: 'T1 læser A og beregner `A := A - 50` = 950 — men har **ikke skrevet** den endnu.', hold: 2200 },
    {
      caption: 'T2 læser derfor den gamle A = 1000, beregner temp = 100 og skriver A = 900.',
      hold: 2600,
    },
    {
      caption: 'Nu skriver T1 sin A = 950 ovenpå. **T2’s opdatering er tabt**, selvom T2 stadig regner med temp = 100.',
      hold: 3000,
    },
    { caption: 'T1 læser B = 300, skriver B = 350 og committer.', hold: 1800 },
    {
      caption: 'T2 regner på sin gamle B = 300: `B := B + temp` = 400. Den skrivning overskriver T1’s — endnu en tabt opdatering.',
      hold: 2800,
    },
    {
      caption: 'Resultatet svarer ikke til nogen seriel kørsel: A + B er 1350, ikke 1300. Et **serialiserbart** skema ville bevare A + B.',
      hold: 3000,
    },
  ],
  Component: Schedule,
}

export default viz
