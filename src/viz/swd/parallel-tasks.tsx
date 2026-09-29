import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './parallel-tasks.css'

/* Concurrency - Parallel Tasks.pptx, slide 6 (worker threads fra ThreadPool, mindst én
   pr. core, “millions” af tasks på få tråde), slide 7 (Global queue, “Add top-level
   task”, “Run top-level tasks in FIFO order”, Worker thread 1 … n, contention),
   slide 8 (“Per-thread local queue of tasks”, “Push/pop local subtasks in LIFO order”,
   “work-stealing”) og slide 9 (inlining ved Task.Wait på en ikke-startet task i egen
   lokale kø). Markdown: swd/markdown/slides/SW4SWD-01_W11.1_Concurrency_Parallel_Tasks.md,
   afsnit 4–5.
   Illustrativt: tasknavnene T1–T4, T1.a, T1.b og de to tråde. Selve stjælingen er
   ikke vist på slidene og vises derfor ikke — “work-stealing” står kun som mærke. */

type Id = 'T1' | 'T2' | 'T3' | 'T4' | 'T1a' | 'T1b'
const LABEL: Record<Id, string> = { T1: 'T1', T2: 'T2', T3: 'T3', T4: 'T4', T1a: 'T1.a', T1b: 'T1.b' }
const SUB = (id: Id) => id === 'T1a' || id === 'T1b'

interface Frame {
  gq: Id[]
  run1: Id[]
  /** Anden linje i Worker thread 1: venter / færdig. */
  wait1: Id[]
  done1: Id[]
  runN: Id[]
  /** Lokal kø 1, nederst først. */
  q1: Id[]
}
function frame(step: number): Frame {
  const gq: Id[] = step === 0 ? ['T1', 'T2', 'T3', 'T4'] : ['T3', 'T4']
  const runN: Id[] = step >= 1 ? ['T2'] : []
  if (step <= 2) return { gq, run1: step >= 1 ? ['T1'] : [], wait1: [], done1: [], runN, q1: [] }
  if (step === 3) return { gq, run1: ['T1'], wait1: [], done1: [], runN, q1: ['T1a', 'T1b'] }
  if (step === 4) return { gq, run1: ['T1a'], wait1: ['T1'], done1: [], runN, q1: ['T1b'] }
  return { gq, run1: ['T1b'], wait1: [], done1: ['T1', 'T1a'], runN, q1: [] }
}

function Task({ id, tone, fresh, i = 0 }: { id: Id; tone?: 'focus' | 'idle' | 'muted'; fresh?: boolean; i?: number }) {
  const tok = (
    <Token id={`pt-${id}`} tone={tone ?? (SUB(id) ? 'idle' : 'focus')}>
      {LABEL[id]}
    </Token>
  )
  if (!fresh) return tok
  // Nye subtasks: oprettes af T1 i tråden og skubbes ind på den lokale kø.
  return (
    <motion.span
      className="pt-fresh"
      initial={{ opacity: 0, x: -36 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...t.travel, delay: 0.15 + i * 0.55 }}
    >
      {tok}
    </motion.span>
  )
}

const fade = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

/** Dobbeltpil tråd ⇄ lokal kø: push (→) og pop (←). */
function PushPop({ on, hot }: { on: boolean; hot: boolean }) {
  return (
    <motion.svg className="pt-pp" data-hot={hot || undefined} viewBox="0 0 40 22" aria-hidden="true" {...fade(on)}>
      <path d="M2 7 H36 M31 3 L37 7 L31 11" />
      <path d="M38 15 H4 M9 11 L3 15 L9 19" />
    </motion.svg>
  )
}

function Thread({
  n,
  run,
  sub,
  subLabel,
  children,
}: {
  n: string
  run: Id[]
  sub: Id[]
  subLabel?: ReactNode
  children?: ReactNode
}) {
  return (
    <div className="pt-thread" data-busy={run.length > 0 || undefined}>
      <div className="pt-thread-name">Worker thread {n}</div>
      <div className="pt-thread-run">
        {run.map((id) => (
          <Task key={id} id={id} />
        ))}
        {children}
      </div>
      <div className="pt-thread-sub">
        {sub.map((id) => (
          <Task key={id} id={id} tone="muted" />
        ))}
        {subLabel}
      </div>
    </div>
  )
}

function LocalQueue({ items, on, fresh }: { items: Id[]; on: boolean; fresh: boolean }) {
  return (
    <motion.div className="pt-lq" {...fade(on)}>
      <div className="pt-lq-head">
        <Tag tone="idle">work-stealing</Tag>
      </div>
      <div className="pt-lq-stack">
        {[0, 1].map((slot) => (
          <div key={slot} className="pt-cell">
            {items[slot] && <Task key={items[slot]} id={items[slot]} fresh={fresh} i={slot} />}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

function Scheduler({ step }: { step: number }) {
  const f = frame(step)
  const final = step >= 6
  const locals = step >= 2
  const fifoHot = step === 1 || final
  const lifoHot = step === 3 || step === 5 || final
  return (
    <div className="pt">
      {/* Global kø: FIFO, top = næste ud */}
      <section className="pt-gq" data-hot={fifoHot || undefined}>
        <div className="pt-gq-head">
          <span className="pt-name">Global queue</span>
          <Tag tone="neg" show={step === 1}>
            contention
          </Tag>
        </div>
        <div className="pt-gq-stack">
          {[0, 1, 2, 3].map((slot) => (
            <div key={slot} className="pt-cell">
              {f.gq[slot] && <Task key={f.gq[slot]} id={f.gq[slot]} />}
            </div>
          ))}
        </div>
        <div className="pt-add">
          <span className="pt-add-arrow" aria-hidden="true" />
          Add top-level task
        </div>
      </section>

      {/* FIFO-pile til begge tråde (bred) og én lodret pil (smal) */}
      <div className="pt-l1">
        <Link on={step >= 1} tone={fifoHot ? 'focus' : 'idle'} />
      </div>
      <div className="pt-ln">
        <Link on={step >= 1} tone={fifoHot ? 'focus' : 'idle'} />
      </div>
      <div className="pt-fifo" data-hot={fifoHot || undefined}>
        <span className="pt-v">
          <Link vertical on={step >= 1} tone={fifoHot ? 'focus' : 'idle'} />
        </span>
        <motion.span className="pt-rule" {...fade(step >= 1)}>
          Run top-level tasks in <b>FIFO</b> order
        </motion.span>
      </div>

      <div className="pt-t1">
        <Thread
          n="1"
          run={f.run1}
          sub={[...f.wait1, ...f.done1]}
          subLabel={
            step === 4 ? (
              <code className="pt-wait">Task.Wait(T1.a)</code>
            ) : f.done1.length ? (
              <span className="pt-done">✓ færdig</span>
            ) : undefined
          }
        >
          <Tag show={step === 4} tone="focus">
            inline
          </Tag>
        </Thread>
      </div>
      <div className="pt-dots" aria-hidden="true">
        …
      </div>
      <div className="pt-tn">
        <Thread n="n" run={f.runN} sub={[]} />
      </div>

      <div className="pt-p1">
        <PushPop on={locals} hot={lifoHot} />
      </div>
      <div className="pt-pn">
        <PushPop on={locals} hot={false} />
      </div>

      <div className="pt-q1">
        <LocalQueue items={f.q1} on={locals} fresh={step === 3} />
      </div>
      <div className="pt-qn">
        <LocalQueue items={[]} on={locals} fresh={false} />
      </div>

      <motion.div className="pt-qlab" data-hot={lifoHot || undefined} {...fade(locals)}>
        <span className="pt-name">Per-thread local queue of tasks</span>
        <motion.span className="pt-rule" {...fade(step >= 3)}>
          Push/pop local subtasks in <b>LIFO</b> order
        </motion.span>
      </motion.div>

      <p className="pt-note">Illustrativt: tasknavnene og de to tråde. Hvordan en tråd stjæler fra en anden kø, viser slidene ikke.</p>
    </div>
  )
}

const viz: VizDef = {
  id: 'parallel-tasks',
  title: 'Global kø og lokale work-stealing-køer',
  steps: [
    { caption: 'Tasks er work items i en kø — ikke tråde. Fire top-level tasks venter i den globale kø.', hold: 2200 },
    {
      caption: 'Én fælles kø: alle tråde henter fra samme sted i FIFO-orden — contention, når der er mange cores og små tasks.',
      hold: 2800,
    },
    { caption: 'Hver worker thread får sin egen lokale kø ved siden af den globale.', hold: 2000 },
    { caption: '`T1` opretter `T1.a` og så `T1.b`. Subtasks pushes oven på trådens egen kø — LIFO.', hold: 2800 },
    {
      caption: '`T1` kalder `Task.Wait(T1.a)`. `T1.a` er ikke startet og ligger i egen lokal kø, så scheduleren kører den inline på tråd 1.',
      hold: 3000,
    },
    { caption: 'Da `T1` er færdig, popper tråden `T1.b` fra toppen af sin lokale kø — sidst ind, først ud.', hold: 2600 },
    { caption: 'Global FIFO til top-level tasks, lokal LIFO til subtasks, inlining når man venter.', hold: 3000 },
  ],
  Component: Scheduler,
}

export default viz
