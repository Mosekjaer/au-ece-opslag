import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './raii-scope.css'

/* 11.1-Automatic_ressource_management.pdf s. 8 (manual() vs. automated(), mutexen m,
   “if ex thrown, lock still released automatically”), s. 7 (“RAII destructors always run!”)
   og kursets raii.cpp (explicit RAII(T* p = 0) : p_(p) {} / ~RAII() { delete p_; }).
   Slidets stavning operation_that_may_trow_ex() er bevaret. */

/** Brudmuligheder i lange kodelinjer (efter ::, <, ( og .), så de aldrig knækker midt i et navn. */
function wb(s: string) {
  const parts = s.split(/(?<=::|<|\(|\.)/)
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </span>
  ))
}

type LineState = 'idle' | 'now' | 'done' | 'throw' | 'skip' | 'dtor'

interface Line {
  code: string
  note?: string
  /** Markering der vises i denne tilstand; pladsen er reserveret fra start. */
  tag?: { text: string; when: LineState[] }
}

const MANUAL: Line[] = [
  { code: 'void manual() {' },
  { code: 'm.lock();', note: 'lock acquired' },
  { code: 'operation_that_may_trow_ex();', tag: { text: 'throw', when: ['throw'] } },
  { code: 'm.unlock();', tag: { text: 'springes over', when: ['skip'] } },
  { code: '}' },
]

const AUTO: Line[] = [
  { code: 'void automated() {' },
  { code: 'std::lock_guard<std::mutex> lock(m);', note: 'konstruktøren låser' },
  { code: 'operation_that_may_trow_ex();', tag: { text: 'throw', when: ['throw'] } },
  { code: '}', note: '~lock_guard() låser op' },
]

function manualState(step: number, i: number): LineState {
  if (i === 1) return step === 1 ? 'now' : step >= 2 ? 'done' : 'idle'
  if (i === 2) return step >= 2 ? 'throw' : 'idle'
  if (i === 3) return step >= 3 ? 'skip' : 'idle'
  return 'idle'
}

function autoState(step: number, i: number): LineState {
  if (i === 1) return step === 1 ? 'now' : step >= 2 ? 'done' : 'idle'
  if (i === 2) return step >= 2 ? 'throw' : 'idle'
  if (i === 3) return step >= 4 ? 'dtor' : 'idle'
  return 'idle'
}

function Code({ lines, state }: { lines: Line[]; state: (i: number) => LineState }) {
  return (
    <div className="rs-code">
      {lines.map((l, i) => {
        const s = state(i)
        const inner = i > 0 && i < lines.length - 1
        return (
          <div key={i} className="rs-line" data-s={s} data-inner={inner || undefined}>
            <code className="rs-src">{wb(l.code)}</code>
            <span className="rs-mark">
              {l.tag && (
                <Tag tone="neg" show={l.tag.when.includes(s)}>
                  {l.tag.text}
                </Tag>
              )}
              {l.note && (
                <motion.span
                  className="rs-note"
                  initial={false}
                  animate={{ opacity: s === 'now' || s === 'done' || s === 'dtor' ? 1 : 0 }}
                  transition={t.fade}
                >
                  {l.note}
                </motion.span>
              )}
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Mutex({ locked, tone }: { locked: boolean; tone: 'idle' | 'focus' | 'neg' | 'ok' }) {
  return (
    <div className="rs-mutex" data-tone={tone}>
      <span className="rs-mutex-name">
        mutex <code>m</code>
      </span>
      <span className="rs-mutex-state">{locked ? 'låst' : 'fri'}</span>
    </div>
  )
}

interface Exit {
  on: boolean
  ok: boolean
  label: string
  result: string
}

function Exits({ exits }: { exits: Exit[] }) {
  return (
    <div className="rs-exits">
      <span className="vcaps">Veje ud af scopet</span>
      {exits.map((e) => (
        <motion.div
          key={e.label}
          className="rs-exit"
          data-ok={e.ok || undefined}
          initial={false}
          animate={{ opacity: e.on ? 1 : 0, y: e.on ? 0 : 4 }}
          transition={e.on ? t.settle : t.fade}
        >
          <span className="rs-exit-how">{e.label}</span>
          <span className="rs-exit-arrow" aria-hidden="true">
            →
          </span>
          <span className="rs-exit-res">{e.result}</span>
        </motion.div>
      ))}
    </div>
  )
}

function Raii({ step }: { step: number }) {
  const manLocked = step >= 1
  const manTone = step >= 3 ? 'neg' : step >= 1 ? 'focus' : 'idle'
  const autoLocked = step >= 1 && step < 4
  const autoTone = step >= 4 ? 'ok' : step >= 1 ? 'focus' : 'idle'
  const ctorOn = step === 1
  const dtorOn = step >= 4

  return (
    <div className="rs">
      <div className="rs-cols">
        <section className="rs-col" data-side="manual">
          <header className="rs-head">
            <span className="rs-kicker">Manuelt</span>
          </header>
          <Code lines={MANUAL} state={(i) => manualState(step, i)} />
          <Mutex locked={manLocked} tone={manTone} />
          <Exits
            exits={[
              { on: step >= 5, ok: true, label: 'normal slutning', result: 'm.unlock() har kørt' },
              { on: step >= 3, ok: false, label: 'exception', result: 'm forbliver låst' },
            ]}
          />
        </section>

        <section className="rs-col" data-side="auto">
          <header className="rs-head">
            <span className="rs-kicker">RAII</span>
          </header>
          <Code lines={AUTO} state={(i) => autoState(step, i)} />
          <Mutex locked={autoLocked} tone={autoTone} />
          <Exits
            exits={[
              { on: step >= 5, ok: true, label: 'normal slutning', result: '~lock_guard() → m fri' },
              { on: step >= 4, ok: true, label: 'exception', result: '~lock_guard() → m fri' },
            ]}
          />
        </section>
      </div>

      <div className="rs-idiom">
        <span className="rs-idiom-file">
          <code>raii.cpp</code>
        </span>
        <span className="rs-idiom-part" data-on={ctorOn || undefined}>
          <span className="rs-idiom-verb">erhverv</span>
          <code>explicit RAII(T* p = 0) : p_(p) {'{}'}</code>
        </span>
        <span className="rs-idiom-part" data-on={dtorOn || undefined}>
          <span className="rs-idiom-verb">frigiv</span>
          <code>~RAII() {'{'} delete p_; {'}'}</code>
        </span>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'raii-scope',
  title: 'Destruktøren kører på begge veje ud af scopet',
  steps: [
    {
      caption: 'To versioner af samme kritiske sektion. Mutexen `m` er fri.',
      hold: 1800,
    },
    {
      caption: 'Begge tager låsen. I RAII-versionen gør **konstruktøren** af `std::lock_guard` det.',
      hold: 2300,
    },
    {
      caption: '`operation_that_may_trow_ex()` kaster. Programflowet forlader scopet med det samme.',
      hold: 2200,
    },
    {
      caption: 'Manuelt: `m.unlock()` **springes over**. Låsen forbliver taget, og næste tråd, der vil have den, blokerer.',
      hold: 2800,
    },
    {
      caption: 'RAII: exceptionen forlader scopet, og **destruktøren** `~lock_guard()` kører alligevel. `m` er fri.',
      hold: 2800,
    },
    {
      caption:
        'Uden exception kalder `}` samme destruktør. To veje ud, én oprydning: erhverv i konstruktøren, frigiv i destruktøren.',
      hold: 3000,
    },
  ],
  Component: Raii,
}

export default viz
