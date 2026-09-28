import { AnimatePresence, motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './redux-flow.css'

/* React - Redux.pdf s. 28 (counterSlice), s. 29 (Counter med useState('2')),
   s. 27 (configureStore med nøglen counter), s. 17 (dispatch → reducer → next state)
   og s. 3 (Flux). Den konkrete type-streng vises ikke: slidene siger kun, at RTK
   laver actions. */

const REDUCERS = [
  { id: 'inc', name: 'increment', body: '(state) => { state.value += 1; }' },
  { id: 'dec', name: 'decrement', body: '(state) => { state.value -= 1; }' },
  { id: 'amt', name: 'incrementByAmount', body: '(state, action) => { state.value += action.payload; }' },
] as const

const FLUX = ['Action', 'Dispatcher', 'Store', 'View']

function Val({ v, className }: { v: number; className?: string }) {
  return (
    <span className={`rx-val ${className ?? ''}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={v}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6, transition: t.fade }}
          transition={t.place}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const fade = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0, y: on ? 0 : 4 },
  transition: on ? { ...t.settle, delay } : t.fade,
})

function StateBox({ value, label, tone }: { value: number; label: string; tone: 'idle' | 'focus' | 'muted' }) {
  return (
    <div className="rx-state" data-tone={tone}>
      <span className="rx-state-label">{label}</span>
      <code className="rx-tree">
        {'{ counter: { value: '}
        <b>{value}</b>
        {", status: 'idle' } }"}
      </code>
    </div>
  )
}

function Redux({ step }: { step: number }) {
  const pos = step === 1 ? 'view' : step === 2 ? 'store' : step === 3 ? 'reducer' : null
  const newState = at(step, 4)
  const count = at(step, 5) ? 2 : 0

  const token = (
    <Token id="rx-action" launch={step === 2} wrap>
      {'{ type: …, payload: 2 }'}
    </Token>
  )

  return (
    <div className="rx">
      <div className="rx-flow">
        {/* View */}
        <section className="rx-zone rx-view" data-hot={step === 1 || step === 5 || undefined}>
          <header className="rx-head">
            <span className="vcaps">View</span>
            <code className="rx-name">Counter</code>
          </header>
          <div className="rx-count">
            <code>count</code>
            <Val v={count} className="rx-big" />
          </div>
          <code className="rx-small">const count = useSelector(selectCount);</code>
          <div className="rx-ui">
            <span className="rx-input">2</span>
            <span className="rx-btn" data-hot={step === 1 || undefined} />
            <code className="rx-small">useState('2')</code>
          </div>
          <code className="rx-small">
            onClick=&#123;() =&gt; dispatch(<wbr />incrementByAmount(<wbr />incrementValue))&#125;
          </code>
          <motion.p className="rx-note" {...fade(at(step, 1))}>
            <code>increment&shy;ByAmount(2)</code> bygger action-objektet. <i>type</i> genereres af RTK.
          </motion.p>
          <div className="rx-slot">{pos === 'view' && token}</div>
        </section>

        <div className="rx-links">
          <Link on={at(step, 2)} label={<code>dispatch</code>} tone={step === 2 ? 'focus' : 'idle'} />
          <Link on label={<code>useSelector</code>} tone={step === 5 ? 'focus' : 'idle'} back />
        </div>

        {/* Store */}
        <section className="rx-zone rx-store" data-hot={step === 2 || step === 4 || undefined}>
          <header className="rx-head">
            <span className="vcaps">Store</span>
            <code className="rx-name">store</code>
          </header>
          <code className="rx-small">configureStore(&#123; reducer: &#123; counter: counterReducer &#125; &#125;)</code>
          <div className="rx-states">
            <StateBox value={0} label={newState ? 'forrige state — røres ikke' : 'state'} tone={newState ? 'muted' : step === 3 ? 'focus' : 'idle'} />
            <motion.div {...fade(newState, 0.25)}>
              <StateBox value={2} label="ny state" tone={step === 4 || step === 5 ? 'focus' : 'idle'} />
            </motion.div>
          </div>
          <div className="rx-slot">{pos === 'store' && token}</div>
        </section>

        <div className="rx-links">
          <Link on={at(step, 3)} label={<code>state, action</code>} tone={step === 3 ? 'focus' : 'idle'} />
          <Link on={at(step, 4)} label={<code>ny state</code>} tone={step === 4 ? 'focus' : 'idle'} back />
        </div>

        {/* Reducer */}
        <section className="rx-zone rx-reducer" data-hot={step === 3 || step === 4 || undefined}>
          <header className="rx-head">
            <span className="vcaps">Reducer</span>
            <code className="rx-name">counterSlice.<wbr />reducers</code>
          </header>
          <ul className="rx-reducers">
            {REDUCERS.map((r) => (
              <li key={r.id} data-hot={(r.id === 'amt' && (step === 3 || step === 4)) || undefined}>
                <code>
                  <b>{r.id === 'amt' ? <>increment&shy;ByAmount</> : r.name}</b>: {r.body}
                </code>
              </li>
            ))}
          </ul>
          <motion.div className="rx-immer" {...fade(newState)}>
            <Tag show={newState} wrap>
              Immer
            </Tag>
            <span className="rx-note">“muterende” kode, men en ny state</span>
          </motion.div>
          <div className="rx-slot">{pos === 'reducer' && token}</div>
        </section>
      </div>

      <motion.div className="rx-fluxrow" {...fade(at(step, 6))} aria-hidden={!at(step, 6) || undefined}>
        <span className="vcaps">Flux</span>
        <ol className="rx-flux">
          {FLUX.map((f, i) => (
            <motion.li key={f} initial={false} animate={{ opacity: at(step, 6) ? 1 : 0 }} transition={at(step, 6) ? stagger(i, 0.1, 0.08) : t.fade}>
              {f}
            </motion.li>
          ))}
        </ol>
        <span className="rx-note">— og fra View en ny Action. Dataflowet går kun én vej.</span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'redux-flow',
  title: 'Redux-cyklussen med counterSlice',
  steps: [
    {
      caption: 'Én store med ét state-træ. `Counter` læser `state.counter.value` med `useSelector(selectCount)`.',
      hold: 1800,
    },
    {
      caption: 'Knappen kalder `dispatch(incrementByAmount(incrementValue))`. Action creatoren bygger et action-objekt med `payload: 2`.',
      hold: 2400,
    },
    { caption: 'Actionen sendes til storen — den eneste vej til at ændre state.', hold: 1600 },
    { caption: 'Storen kalder reduceren med den nuværende state og actionen.', hold: 2200 },
    {
      caption: 'Reduceren skriver “muterende”, men **Immer** laver en ny state med `value: 2`. Den gamle state røres ikke.',
      hold: 2800,
    },
    { caption: 'Storen har ny state. `useSelector` får 2, og `Counter` re-renderer.', hold: 2200 },
    {
      caption: 'View → `dispatch(action)` → store → reducer → ny state → `useSelector` → View. Envejs, som Flux.',
      hold: 3000,
    },
  ],
  Component: Redux,
}

export default viz
