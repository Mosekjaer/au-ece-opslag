import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './mutex-vs-spin.css'

/* 04.1-Synchronisation-tools.pdf s. 15 (optaget mutex → wait queue, running → waiting),
   s. 17 (lock før, unlock efter, ejet af én tråd), s. 25 (test_and_set_lock:
   while(lock_.exchange(true, acquire)); / store(false, release); “Duration shorter than
   two context switches”). Bogen §6.5 s. 288: at vente på en lås koster to context
   switches; bogens egen mutex busy-waiter og kaldes også spinlock. */

type Slot = 'start' | 'cs' | 'wait' | 'done'
type Kind = 'mutex' | 'spin'

function where(step: number): { t1: Slot; t2: Slot } {
  const t1: Slot = step === 0 ? 'start' : step <= 2 ? 'cs' : 'done'
  const t2: Slot = step <= 1 ? 'start' : step <= 3 ? 'wait' : 'cs'
  return { t1, t2 }
}

const LOCK: Record<Kind, ReactNode[]> = {
  mutex: [
    <>ledig</>,
    <>ejet af T1</>,
    <>ejet af T1</>,
    <>ledig</>,
    <>ejet af T2</>,
  ],
  spin: [
    <code key="k32-6">lock_ = false</code>,
    <code key="k33-6">lock_ = true</code>,
    <code key="k34-6">lock_ = true</code>,
    <code key="k35-6">lock_ = false</code>,
    <code key="k36-6">lock_ = true</code>,
  ],
}

/** Hvad der står ved T2 i venteområdet. */
const WAIT_NOTE: Record<Kind, ReactNode[]> = {
  mutex: [
    null,
    <>running → waiting · sover, ingen CPU</>,
    <>vækkes: waiting → ready</>,
  ],
  spin: [
    null,
    <>
      <code>exchange(true)</code> → <code>true</code> · prøver igen og igen
    </>,
    <>
      <code>exchange(true)</code> → <code>false</code> · kommer igennem
    </>,
  ],
}

const COST: Record<Kind, ReactNode> = {
  mutex: (
    <>
      <b>To context switches</b> — ind i waiting og tilbage. CPU’en er fri imens.
    </>
  ),
  spin: (
    <>
      <b>Ingen context switch</b>, men CPU-cykler brændes, så længe T2 venter.
    </>
  ),
}

function Panel({ kind, step }: { kind: Kind; step: number }) {
  const pos = where(step)
  const lockIdx = Math.min(step, 4)
  const lockTone = step === 0 || step === 3 ? 'free' : 'held'
  const final = step >= 5
  const waitNote = step === 2 ? 1 : step === 3 ? 2 : 0
  const t2Tone = pos.t2 === 'wait' ? (kind === 'mutex' ? 'muted' : 'focus') : pos.t2 === 'cs' ? 'focus' : 'idle'

  const tok = (who: 't1' | 't2') => {
    const tone = who === 't1' ? (pos.t1 === 'cs' ? 'focus' : pos.t1 === 'done' ? 'muted' : 'idle') : t2Tone
    return (
      <Token id={`${kind}-${who}`} tone={tone}>
        {who === 't1' ? 'T1' : 'T2'}
      </Token>
    )
  }
  const at = (slot: Slot) => (
    <>
      {pos.t1 === slot && tok('t1')}
      {pos.t2 === slot && tok('t2')}
    </>
  )

  const spinning = kind === 'spin' && pos.t2 === 'wait'

  return (
    <section className="sx-ms-panel" data-kind={kind}>
      <header className="sx-ms-head">
        <span className="sx-ms-kind">{kind === 'mutex' ? 'Mutex' : 'Spinlock'}</span>
        <code className="sx-ms-type">{kind === 'mutex' ? 'std::mutex' : 'test_and_set_lock'}</code>
      </header>

      <div className="sx-ms-slot">
        <span className="sx-ms-label">vil ind</span>
        <span className="sx-ms-tokens">{at('start')}</span>
      </div>

      <div className="sx-ms-slot sx-ms-lock" data-tone={lockTone}>
        <span className="sx-ms-label">låsen</span>
        <Swap show={lockIdx} items={LOCK[kind]} className="sx-ms-lockval" />
      </div>

      <div className="sx-ms-slot sx-ms-cs" data-tone={pos.t1 === 'cs' || pos.t2 === 'cs' ? 'focus' : 'idle'}>
        <span className="sx-ms-label">kritisk sektion</span>
        <span className="sx-ms-tokens">{at('cs')}</span>
      </div>

      <div className="sx-ms-slot sx-ms-wait" data-tone={pos.t2 === 'wait' ? (spinning ? 'hot' : 'sleep') : 'idle'}>
        <span className="sx-ms-label">{kind === 'mutex' ? 'wait queue' : 'CPU · busy waiting'}</span>
        <span className="sx-ms-waitrow">
          <span className="sx-ms-tokens">{at('wait')}</span>
          <Swap show={waitNote} items={WAIT_NOTE[kind]} className="sx-ms-note" />
        </span>
      </div>

      <div className="sx-ms-slot">
        <span className="sx-ms-label">færdig</span>
        <span className="sx-ms-tokens">{at('done')}</span>
      </div>

      <motion.p
        className="sx-ms-cost"
        initial={false}
        animate={{ opacity: final ? 1 : 0 }}
        transition={t.fade}
        aria-hidden={!final || undefined}
      >
        {COST[kind]}
      </motion.p>
    </section>
  )
}

function MutexVsSpin({ step }: { step: number }) {
  const final = step >= 5
  return (
    <div className="sx-ms">
      <div className="sx-ms-panels">
        <Panel kind="mutex" step={step} />
        <Panel kind="spin" step={step} />
      </div>
      <motion.p
        className="sx-ms-rule"
        initial={false}
        animate={{ opacity: final ? 1 : 0 }}
        transition={t.fade}
        aria-hidden={!final || undefined}
      >
        Spinlock kun ved korte ventetider: <b>“Duration shorter than two context switches!”</b> Bogen (§6.5) er
        uenig i navngivningen — dens mutex busy-waiter også og kaldes en spinlock.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'mutex-vs-spin',
  title: 'To tråde om samme lås',
  steps: [
    {
      caption: 'T1 og T2 vil begge ind i den kritiske sektion. Til venstre en mutex, til højre en spinlock.',
      hold: 2200,
    },
    { caption: 'T1 kalder `lock()`. Låsen er ledig — *uncontended* — og T1 går ind.', hold: 1900 },
    {
      caption:
        'T2 kalder `lock()` på en optaget lås. Mutexen lægger T2 i **wait queue**, spinlocken lader den **spinne** på `exchange`.',
      hold: 3000,
    },
    {
      caption: 'T1 kalder `unlock()`. Mutexen vækker T2 (waiting → ready); spinlockens næste `exchange` returnerer `false`.',
      hold: 2800,
    },
    { caption: 'T2 har låsen og er i den kritiske sektion — i begge tilfælde kun én ad gangen.', hold: 1900 },
    {
      caption: 'Forskellen er prisen for at vente: to context switches mod brændt CPU-tid.',
      hold: 3000,
    },
  ],
  Component: MutexVsSpin,
}

export default viz
