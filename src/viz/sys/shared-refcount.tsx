import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './shared-refcount.css'

/* Kursets unique_pointer.cpp og shared_pointer.cpp (11.1 s. 12 og 14) og weak_ptr-slidet
   med Broker/Consumer (s. 15 og 18). Tallene er kodens: 42 → move → reset(53);
   make_shared 43, to trådkopier, val.reset(), hver tråd lægger 1 til (43 → 45). */

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

type Tone = 'idle' | 'focus' | 'neg' | 'ok' | 'muted'

/* ---------------------------- unique_ptr ---------------------------- */

function Unique({ step }: { step: number }) {
  const moved = step >= 1
  const reset = step >= 2
  const cur = step <= 2 ? step : -1
  const lines = [
    'std::unique_ptr<int> p = std::make_unique<int>(42);',
    'std::unique_ptr<int> q = std::move(p);',
    'q.reset(new int {53});',
  ]
  const obj = (
    <Token id="sr-uobj">
      {reset ? 'int 53' : 'int 42'}
    </Token>
  )
  return (
    <section className="sr-panel" data-on={step <= 2 || undefined}>
      <header className="sr-head">
        <code className="sr-type">std::unique_ptr</code>
        <span className="sr-sub">én ejer</span>
      </header>
      <div className="sr-lines">
        {lines.map((l, i) => (
          <span key={i} className="sr-line" data-s={i === cur ? 'now' : i < step || step > 2 ? 'done' : 'idle'}>
            <code>{wb(l)}</code>
          </span>
        ))}
      </div>
      <div className="sr-vars">
        <div className="sr-var">
          <code className="sr-var-name">p</code>
          <span className="sr-slot">
            {!moved ? obj : <span className="sr-null">nullptr</span>}
          </span>
        </div>
        <div className="sr-var">
          <code className="sr-var-name">q</code>
          <span className="sr-slot">{moved ? obj : <span className="sr-null sr-null-ghost">—</span>}</span>
        </div>
      </div>
      <div className="sr-notes">
        <Tag tone="neg" show={moved}>
          q = p; copy NOT allowed
        </Tag>
        <Tag tone="neg" show={reset}>
          42 slettet
        </Tag>
      </div>
    </section>
  )
}

/* ---------------------------- shared_ptr ---------------------------- */

const OWNERS = [
  { id: 'val', label: 'val', from: 3, to: 4 },
  { id: 't1', label: 't1: data', from: 4, to: 5 },
  { id: 't2', label: 't2: data', from: 4, to: 5 },
]

function Shared({ step }: { step: number }) {
  const made = step >= 3
  const count = step <= 2 ? null : step === 3 ? 1 : step === 4 ? 3 : step === 5 ? 2 : 0
  const gone = step >= 6
  const value = step >= 6 ? '45' : '43'
  const lines = [
    { code: 'val = std::make_shared<int>(int{43});', at: 3 },
    { code: 'std::thread t1{thr, 1, val}, t2{thr, 2, val};', at: 4 },
    { code: 'val.reset(); // release ownership from main', at: 5 },
    { code: 'thr() returnerer i t1 og t2 — kopien data forsvinder', at: 6, prose: true },
  ]
  const objTone: Tone = gone ? 'neg' : made ? 'focus' : 'idle'
  return (
    <section className="sr-panel" data-on={(step >= 3 && step <= 6) || undefined}>
      <header className="sr-head">
        <code className="sr-type">std::shared_ptr</code>
        <span className="sr-sub">delt ejerskab</span>
      </header>
      <div className="sr-lines">
        {lines.map((l) => (
          <span
            key={l.at}
            className={l.prose ? 'sr-line sr-line-prose' : 'sr-line'}
            data-s={step === l.at ? 'now' : step > l.at ? 'done' : 'idle'}
          >
            {l.prose ? l.code : <code>{wb(l.code)}</code>}
          </span>
        ))}
      </div>
      <div className="sr-shared">
        <div className="sr-owners">
          {OWNERS.map((o) => {
            const on = step >= o.from && step < (o.id === 'val' ? 5 : 6)
            const was = step >= o.from
            return (
              <motion.span
                key={o.id}
                className="sr-owner"
                data-on={on || undefined}
                initial={false}
                animate={{ opacity: on ? 1 : was ? 0.45 : 0 }}
                transition={t.fade}
              >
                <code>{o.label}</code>
              </motion.span>
            )
          })}
        </div>
        <div className="sr-obj" data-tone={objTone}>
          <span className="sr-obj-val">
            <span className="sr-obj-type">int</span>
            <code data-on={made || undefined}>{value}</code>
          </span>
          <span className="sr-count">
            <span className="sr-count-label">reference count</span>
            <motion.span
              key={String(count)}
              className="sr-count-num"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={t.place}
            >
              {count === null ? '–' : count}
            </motion.span>
          </span>
        </div>
        <div className="sr-notes">
          <Tag tone="neg" show={gone}>
            count 0 → int slettet
          </Tag>
        </div>
      </div>
    </section>
  )
}

/* ----------------------------- weak_ptr ----------------------------- */

function Weak({ step }: { step: number }) {
  const on = step >= 7
  return (
    <motion.section
      className="sr-weak"
      data-on={on || undefined}
      initial={false}
      animate={{ opacity: on ? 1 : 0.35 }}
      transition={t.fade}
    >
      <header className="sr-head">
        <code className="sr-type">std::weak_ptr</code>
        <span className="sr-sub">ikke-ejende · Broker (s. 18)</span>
      </header>
      <div className="sr-weak-row">
        <span className="sr-weak-ref">
          <code>subscribers: weak_ptr&lt;Consumer&gt;</code>
        </span>
        <Tag tone="idle" show={on}>
          count +0
        </Tag>
        <span className="sr-weak-lock">
          <code>if (auto d = c.lock())</code>
          <span className="sr-weak-lock-note">midlertidig ejer — eller tom, hvis Consumer er slettet</span>
        </span>
      </div>
    </motion.section>
  )
}

function SmartPointers({ step }: { step: number }) {
  return (
    <div className="sr">
      <div className="sr-grid">
        <Unique step={step} />
        <Shared step={step} />
      </div>
      <Weak step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'shared-refcount',
  title: 'Ejerskab flyttes, deles og lånes',
  steps: [
    { caption: '`make_unique` opretter `42`. `p` er den **eneste** ejer.', hold: 1800 },
    {
      caption: 'Kopi er forbudt. `std::move(p)` **flytter** ejerskabet til `q`, og `p` er tom bagefter.',
      hold: 2600,
    },
    { caption: '`q.reset(new int {53})` sletter `42` og overtager `53`.', hold: 2200 },
    { caption: '`make_shared` opretter `43`. Reference count er **1**: kun `val` ejer det.', hold: 2200 },
    {
      caption: 'Hver tråd får sin egen kopi af `val` som parameteren `data`. Tre ejere, count **3**.',
      hold: 2600,
    },
    { caption: '`val.reset()` slipper main’s ejerskab. Count **2** — objektet lever videre i trådene.', hold: 2600 },
    {
      caption:
        'Hver tråd lægger 1 til under `cout_mtx` og returnerer. Sidste kopi forsvinder, count **0**, og int’en slettes.',
      hold: 3000,
    },
    {
      caption:
        'En `weak_ptr` peger på objektet uden at tælle op. `lock()` giver en midlertidig `shared_ptr` — eller en tom.',
      hold: 3000,
    },
  ],
  Component: SmartPointers,
}

export default viz
