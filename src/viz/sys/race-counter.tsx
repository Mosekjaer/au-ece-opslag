import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t, stagger } from '../kit/motion'
import './race-counter.css'

/* Silberschatz §6.1 s. 275: count++ og count-- som load/add/store, interleavet
   T0–T5 med count = 5. Resultatet bliver 4; byttes T4 og T5, bliver det 6.
   Tekst og værdier er bogens (også i emnets kodeblok i p3-synkronisering.ts). */

type Who = 'producer' | 'consumer'
interface Op {
  t: string
  who: Who
  code: string
  res: string
  /** Trin hvor instruktionen udføres. */
  at: number
}

const OPS: Op[] = [
  { t: 'T0', who: 'producer', code: 'register1 = count', res: 'register1 = 5', at: 1 },
  { t: 'T1', who: 'producer', code: 'register1 = register1 + 1', res: 'register1 = 6', at: 2 },
  { t: 'T2', who: 'consumer', code: 'register2 = count', res: 'register2 = 5', at: 3 },
  { t: 'T3', who: 'consumer', code: 'register2 = register2 - 1', res: 'register2 = 4', at: 3 },
  { t: 'T4', who: 'producer', code: 'count = register1', res: 'count = 6', at: 4 },
  { t: 'T5', who: 'consumer', code: 'count = register2', res: 'count = 4', at: 5 },
]

function state(step: number) {
  const r1 = step >= 2 ? '6' : step >= 1 ? '5' : '–'
  const r2 = step >= 3 ? '4' : '–'
  const count = step >= 5 ? '4' : step >= 4 ? '6' : '5'
  return { r1, r2, count }
}

function Cell({ label, sub, value, tone }: { label: string; sub: string; value: string; tone: string }) {
  return (
    <div className="sx-rc-cell" data-tone={tone}>
      <span className="sx-rc-cell-label">
        <code>{label}</code>
      </span>
      <span className="sx-rc-cell-sub">{sub}</span>
      <motion.span
        key={value}
        className="sx-rc-cell-val"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t.place}
      >
        {value}
      </motion.span>
    </div>
  )
}

function Race({ step }: { step: number }) {
  const s = state(step)
  const final = step >= 6
  const wrote = (n: number) => step === n
  return (
    <div className="sx-rc">
      <div className="sx-rc-state">
        <Cell label="register1" sub="producer" value={s.r1} tone={step === 1 || step === 2 ? 'focus' : 'idle'} />
        <Cell
          label="count"
          sub="delt variabel"
          value={s.count}
          tone={step >= 5 ? 'neg' : wrote(4) ? 'focus' : 'shared'}
        />
        <Cell label="register2" sub="consumer" value={s.r2} tone={step === 3 ? 'focus' : 'idle'} />
      </div>

      <div className="sx-rc-lanes" role="table">
        <div className="sx-rc-head" role="row">
          <span />
          <span className="sx-rc-lane-head" data-who="producer">
            producer <code>count++</code>
          </span>
          <span className="sx-rc-lane-head" data-who="consumer">
            consumer <code>count--</code>
          </span>
        </div>
        {OPS.map((op) => {
          const done = step >= op.at
          const now = step === op.at
          const neg = final && (op.t === 'T5' || op.t === 'T4')
          const tone = !done ? 'ghost' : now ? (op.t === 'T5' ? 'neg' : 'focus') : neg ? 'neg' : 'idle'
          const body = (
            <span className="sx-rc-op">
              <code className="sx-rc-code">{op.code}</code>
              <motion.span
                className="sx-rc-res"
                initial={false}
                animate={{ opacity: done ? 1 : 0 }}
                transition={done ? stagger(op.t === 'T3' ? 1 : 0, 0.15, 0.5) : t.fade}
              >
                {`{${op.res}}`}
              </motion.span>
            </span>
          )
          return (
            <div key={op.t} className="sx-rc-row" role="row" data-tone={tone} data-who={op.who}>
              <span className="sx-rc-t">{op.t}</span>
              <span className="sx-rc-lane" data-lane="producer">
                {op.who === 'producer' && body}
              </span>
              <span className="sx-rc-lane" data-lane="consumer">
                {op.who === 'consumer' && body}
              </span>
            </div>
          )
        })}
      </div>

      <motion.div
        className="sx-rc-verdict"
        initial={false}
        animate={{ opacity: final ? 1 : 0, y: final ? 0 : 6 }}
        transition={final ? t.settle : t.fade}
        aria-hidden={!final || undefined}
      >
        <p>
          <b>
            <code>count = 4</code>
          </b>{' '}
          — det rigtige er 5. Byttes T4 og T5, bliver det 6.
        </p>
        <p>
          En <b>kritisk sektion</b> med mutual exclusion lader kun én tråd køre sine tre instruktioner ad gangen: så
          bliver <code>count</code> 5.
        </p>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'race-counter',
  title: 'count++ og count-- flettet sammen',
  steps: [
    {
      caption: '`count++` og `count--` er hver **tre instruktioner**: load, add, store. Den delte `count` er 5.',
      hold: 2400,
    },
    { caption: 'T0: produceren loader `count` i sit register — 5.', hold: 1500 },
    { caption: 'T1: produceren lægger 1 til. Registret er 6, men `count` er stadig 5.', hold: 1900 },
    {
      caption: 'T2–T3: consumeren kommer til nu. Den loader den **gamle** værdi 5 og trækker 1 fra — 4.',
      hold: 2600,
    },
    { caption: 'T4: produceren gemmer sit register: `count = 6`.', hold: 1700 },
    { caption: 'T5: consumeren gemmer sit: `count = 4`. Producerens opdatering er **tabt**.', hold: 2600 },
    {
      caption:
        'Resultatet afhænger af rækkefølgen — en **race condition**. En kritisk sektion om load, add og store giver 5.',
      hold: 3000,
    },
  ],
  Component: Race,
}

export default viz
