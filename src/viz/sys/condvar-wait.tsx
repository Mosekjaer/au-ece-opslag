import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './condvar-wait.css'

/* 06.1-Synchronisation-Examples.pdf s. 14 (koden, fra cppreference) og s. 15
   (tabellen “CV Example 2”: lock/unlock på mutexen, i==1? NO → go back to wait,
   i==1? YES → continue). Tilstandene Waiting/Ready/Running er fra s. 12. */

const W = <wbr />

const WAITS: ReactNode[] = [
  <>unique_lock&lt;mutex&gt; lk(cv_m);</>,
  <>cerr &lt;&lt; "Waiting... \n";</>,
  <>
    cv.wait(lk,{W} []{'{'} return i == 1; {'}'});
  </>,
  <>
    cerr &lt;&lt; "...finished{W} waiting. i == 1\n";
  </>,
]

const SIGNALS: ReactNode[] = [
  <>
    this_thread::{W}sleep_for({W}chrono::seconds(1));
  </>,
  <>{'{'}</>,
  <>&nbsp;&nbsp;lock_guard&lt;mutex&gt; lk(cv_m);</>,
  <>&nbsp;&nbsp;cerr &lt;&lt; "Notifying...\n";</>,
  <>{'}'}</>,
  <>cv.notify_all();</>,
  <>
    this_thread::{W}sleep_for({W}chrono::seconds(1));
  </>,
  <>{'{'}</>,
  <>&nbsp;&nbsp;lock_guard&lt;mutex&gt; lk(cv_m);</>,
  <>&nbsp;&nbsp;i = 1;</>,
  <>&nbsp;&nbsp;cerr &lt;&lt; "Notifying again...\n";</>,
  <>{'}'}</>,
  <>cv.notify_all();</>,
]

type Holder = 'free' | 'waits' | 'signals'
interface Frame {
  holder: Holder
  i: number
  /** 0 Running, 1 Waiting, 2 Ready */
  state: number
  /** Resultatet af seneste tjek i dette trin: 0 intet tjek, 1 NO, 2 YES */
  pred: number
  hotW: number[]
  hotS: number[]
  doneW: number
  doneS: number
}

const FRAMES: Frame[] = [
  { holder: 'free', i: 0, state: 0, pred: 0, hotW: [], hotS: [], doneW: 0, doneS: 0 },
  { holder: 'waits', i: 0, state: 0, pred: 1, hotW: [0, 1, 2], hotS: [], doneW: 3, doneS: 0 },
  { holder: 'free', i: 0, state: 1, pred: 0, hotW: [2], hotS: [], doneW: 3, doneS: 0 },
  { holder: 'free', i: 0, state: 2, pred: 0, hotW: [], hotS: [0, 1, 2, 3, 4, 5], doneW: 3, doneS: 6 },
  { holder: 'free', i: 0, state: 1, pred: 1, hotW: [2], hotS: [], doneW: 3, doneS: 6 },
  { holder: 'free', i: 1, state: 2, pred: 0, hotW: [], hotS: [6, 7, 8, 9, 10, 11, 12], doneW: 3, doneS: 13 },
  { holder: 'waits', i: 1, state: 0, pred: 2, hotW: [2, 3], hotS: [], doneW: 4, doneS: 13 },
]

const STATE = ['Running', 'Waiting', 'Ready']

function Lane({
  name,
  lines,
  hot,
  done,
  holds,
  extra,
  who,
}: {
  name: string
  lines: ReactNode[]
  hot: number[]
  done: number
  holds: boolean
  extra?: ReactNode
  who: 'waits' | 'signals'
}) {
  return (
    <section className="sx-cv-lane" data-who={who}>
      <header className="sx-cv-lane-head">
        <code className="sx-cv-fn">{name}</code>
        <span className="sx-cv-slot">
          {holds && (
            <Token id="cv-mutex" tone="focus">
              cv_m
            </Token>
          )}
        </span>
        {extra}
      </header>
      <ol className="sx-cv-code">
        {lines.map((l, i) => (
          <li key={i} data-hot={hot.includes(i) || undefined} data-done={(i < done && !hot.includes(i)) || undefined}>
            <code>{l}</code>
          </li>
        ))}
      </ol>
    </section>
  )
}

function CondVar({ step }: { step: number }) {
  const f = FRAMES[Math.min(step, FRAMES.length - 1)]
  const final = step >= 6
  const stateTone = f.state === 1 ? 'muted' : f.state === 2 ? 'idle' : 'focus'
  return (
    <div className="sx-cv">
      <Lane
        who="waits"
        name="waits()"
        lines={WAITS}
        hot={f.hotW}
        done={f.doneW}
        holds={f.holder === 'waits'}
        extra={
          <span className="sx-cv-state">
            <Swap
              show={f.state}
              items={STATE.map((s) => (
                <Tag key={s} tone={stateTone}>
                  {s}
                </Tag>
              ))}
            />
          </span>
        }
      />

      <div className="sx-cv-mid">
        <div className="sx-cv-box" data-tone={f.holder === 'free' ? 'free' : 'held'}>
          <span className="sx-cv-k">
            mutex <code>cv_m</code>
          </span>
          <span className="sx-cv-slot sx-cv-slot-mid">
            {f.holder === 'free' && (
              <Token id="cv-mutex" tone="idle">
                cv_m
              </Token>
            )}
          </span>
        </div>
        <div className="sx-cv-box" data-tone={step === 5 ? 'focus' : 'idle'}>
          <span className="sx-cv-k">
            <code>int i</code>
          </span>
          <motion.b key={f.i} className="sx-cv-v" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={t.place}>
            {f.i}
          </motion.b>
        </div>
        <div className="sx-cv-box" data-tone={f.pred === 2 ? 'ok' : f.pred === 1 ? 'neg' : 'idle'}>
          <span className="sx-cv-k">
            prædikat <code>i == 1</code>
          </span>
          <Swap
            show={f.pred}
            className="sx-cv-v"
            items={[<b key="0">–</b>, <b key="1">NO</b>, <b key="2">YES</b>]}
          />
        </div>
        <motion.p
          className="sx-cv-eq"
          initial={false}
          animate={{ opacity: final ? 1 : 0 }}
          transition={t.fade}
          aria-hidden={!final || undefined}
        >
          <code>wait(lk, pred)</code> = <code>while (!pred) wait(lk);</code>
        </motion.p>
      </div>

      <Lane who="signals" name="signals()" lines={SIGNALS} hot={f.hotS} done={f.doneS} holds={f.holder === 'signals'} />
    </div>
  )
}

const viz: VizDef = {
  id: 'condvar-wait',
  title: 'waits() og signals() om én condition variable',
  steps: [
    {
      caption: 'Kursets eksempel: `waits()` venter på `i == 1`, `signals()` notificerer to gange. Mutexen `cv_m` er ledig, `i` er 0.',
      hold: 2400,
    },
    {
      caption: '`waits()` tager `cv_m` med en `unique_lock` og kalder `cv.wait(lk, …)`. Prædikatet tjekkes under låsen: **NO**.',
      hold: 2600,
    },
    {
      caption: '`wait()` **frigiver mutexen atomisk** og lægger tråden i Waiting. Den sover uden at bruge CPU.',
      hold: 2400,
    },
    {
      caption: '`signals()` låser, skriver, låser op og kalder `notify_all()` — *uden* at ændre `i`. `waits()` bliver Ready.',
      hold: 2800,
    },
    {
      caption: '`waits()` generhverver `cv_m`, tjekker `i == 1`: **NO**. Den slipper låsen og går tilbage i Waiting.',
      hold: 2800,
    },
    { caption: '`signals()` sætter `i = 1` under låsen og kalder `notify_all()` igen.', hold: 2200 },
    {
      caption:
        '`waits()` generhverver låsen, prædikatet er **YES**, og `wait()` returnerer med `cv_m` holdt. At blive vækket er ikke det samme som at betingelsen er sand.',
      hold: 3200,
    },
  ],
  Component: CondVar,
}

export default viz
