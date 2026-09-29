import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Swap, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './dual-mode-trap.css'

/* Bog 1.4.2, fig. 1.13 (“calls system call” → trap, mode bit = 0 → “execute system call”
   → return, mode bit = 1 → “return from system call”) og slide 01.1b s. 11 (User Space /
   Kernel Space, “1. Invoke Sys Call”, “2. Trap”, “3. Return”). Kaldet `read()` er kursets
   eget eksempel fra blocking_io.cpp (emnets tekst). */

type Pos = 'exec' | 'calls' | 'kernel' | 'ret'

const frame = (step: number) => {
  const pos: Pos = step <= 0 ? 'exec' : step === 1 ? 'calls' : step <= 3 ? 'kernel' : 'ret'
  const bit = step >= 2 && step <= 3 ? 0 : 1
  return { pos, bit }
}

function DualMode({ step }: { step: number }) {
  const { pos, bit } = frame(step)
  const token = (
    <Token id="dm-call" launch={step === 2}>
      read()
    </Token>
  )
  const nodeTone = (p: Pos) => (pos === p ? 'focus' : 'idle')
  const kernel = bit === 0

  return (
    <div className="dm">
      <div className="dm-bit" data-mode={kernel ? 'kernel' : 'user'}>
        <span className="dm-bit-label">mode bit</span>
        <span className="dm-bit-box mono">
          <Swap
            show={bit}
            items={[
              <motion.span key="0" className="dm-bit-digit">0</motion.span>,
              <motion.span key="1" className="dm-bit-digit">1</motion.span>,
            ]}
          />
        </span>
        <Swap
          className="dm-bit-mode"
          show={bit}
          items={[<span key="k">kernel mode</span>, <span key="u">user mode</span>]}
        />
      </div>

      <div className="dm-grid">
        <motion.div className="dm-band is-user-a" initial={false} animate={{ opacity: kernel ? 0.5 : 1 }} transition={t.fade} />
        <motion.div className="dm-band is-user-b" initial={false} animate={{ opacity: kernel ? 0.5 : 1 }} transition={t.fade} />
        <div className="dm-band is-kernel" data-on={kernel || undefined} />
        <span className="dm-blabel vcaps is-ua">user mode · mode bit = 1</span>
        <span className="dm-blabel vcaps is-ub">user mode · mode bit = 1</span>
        <span className="dm-blabel vcaps is-k">kernel mode · mode bit = 0</span>

        <div className="dm-node dm-exec vnode" data-tone={nodeTone('exec')}>
          <div className="vnode-title">user process executing</div>
          <span className="dm-slot">{pos === 'exec' && token}</span>
        </div>

        <div className="dm-l1">
          <Link on tone={step === 1 ? 'focus' : 'idle'} className="dm-wide" />
          <Link vertical on tone={step === 1 ? 'focus' : 'idle'} className="dm-narrow" />
        </div>

        <div className="dm-node dm-calls vnode" data-tone={nodeTone('calls')}>
          <div className="vnode-title">calls system call</div>
          <span className="dm-slot">{pos === 'calls' && token}</span>
        </div>

        <div className="dm-v dm-down">
          <Link vertical on={step >= 2} tone={step === 2 ? 'focus' : 'idle'} />
          <motion.span className="dm-lbl" initial={false} animate={{ opacity: step >= 2 ? 1 : 0 }} transition={t.fade}>
            <b>trap</b>
            <span className="mono">mode bit = 0</span>
          </motion.span>
        </div>

        <div className="dm-node dm-kernel vnode" data-tone={nodeTone('kernel')}>
          <div className="vnode-title">execute system call</div>
          <motion.div className="vnode-sub" initial={false} animate={{ opacity: step >= 3 ? 1 : 0 }} transition={t.fade}>
            finder tjenesten, verificerer parametrene og udfører
          </motion.div>
          <span className="dm-slot">{pos === 'kernel' && token}</span>
        </div>

        <div className="dm-v dm-up">
          <Link vertical back on={step >= 4} tone={step === 4 ? 'focus' : 'idle'} className="dm-wide" />
          <Link vertical on={step >= 4} tone={step === 4 ? 'focus' : 'idle'} className="dm-narrow" />
          <motion.span className="dm-lbl" initial={false} animate={{ opacity: step >= 4 ? 1 : 0 }} transition={t.fade}>
            <b>return</b>
            <span className="mono">mode bit = 1</span>
          </motion.span>
        </div>

        <div className="dm-node dm-ret vnode" data-tone={nodeTone('ret')}>
          <div className="vnode-title">return from system call</div>
          <span className="dm-slot">{pos === 'ret' && token}</span>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'dual-mode-trap',
  title: 'Et systemkald skifter fra user mode til kernel mode og tilbage',
  steps: [
    {
      caption: 'Brugerprogrammet kører i **user mode**. Hardwarens *mode bit* står på `1`.',
      hold: 2000,
    },
    {
      caption: 'Programmet vil læse fra tastaturet og kalder `read()`. Det kan det ikke selv — I/O er en *privileged instruction*.',
      hold: 2400,
    },
    {
      caption: 'Kaldet udløser en **trap**. Hardwaren sætter mode bit til `0`, og CPU’en hopper ind i kernen.',
      hold: 2600,
    },
    {
      caption: 'I **kernel mode** finder kernen den ønskede tjeneste, verificerer parametrene og udfører kaldet.',
      hold: 2600,
    },
    {
      caption: 'Ved **return** sætter OS’et mode bit tilbage til `1`, før kontrollen går til instruktionen efter kaldet.',
      hold: 2600,
    },
    {
      caption:
        'Hele turen fra bogens fig. 1.13: invoke, trap (bit = 0), execute, return (bit = 1). Kun kernen kører med mode bit `0`.',
      hold: 3000,
    },
  ],
  Component: DualMode,
}

export default viz
