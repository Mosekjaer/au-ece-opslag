import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Swap, Tag, Token, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './usestate-render.css'

/* FED React useState Hook.pdf s. 6–8: NotWorkingCounter, SimpleCounter,
   step2() (“Don’t do this!”) og BetterCounterV2. Tallene i trin 4–5 er
   figurens illustration; slides viser dem ikke. */

const SHY = String.fromCharCode(173) // blød bindestreg

function Code({ lines }: { lines: ReactNode[] }) {
  return (
    <div className="us-code mono">
      {lines.map((l, i) => (
        <div key={i} className="us-line">
          {l}
        </div>
      ))}
    </div>
  )
}

const LEFT_CODE = ['window.count = 0;', '<p>You clicked {window.count} times</p>', '<button onClick={() => window.count++}>']

const RIGHT_CODE: ReactNode[][] = [
  ['const [count, setCount] = useState(0);', '<p>You clicked {count} times</p>', '<button onClick={() => setCount(count + 1)}>'],
  [
    'function step2() {',
    '  setCount(count + 1);',
    <>
      {'  setCount(count + 1);  '}
      <span className="us-comment">{"// Don't do this!"}</span>
    </>,
    '}',
  ],
  ['function step2() {', '  setCount(state => state + 1);', '  setCount(state => state + 1);', '}'],
]
const RIGHT_NAME = ['SimpleCounter', 'step2()', `Better${SHY}Counter${SHY}V2`]

/* Den skærm, komponenten har renderet: teksten og knappen. */
function Screen({ n, changed, click, id }: { n: number; changed: boolean; click: boolean; id: string }) {
  return (
    <div className="us-screen">
      <span className="us-screen-p">
        You clicked{' '}
        <span className="us-num" data-changed={changed || undefined}>
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={n}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={t.place}
            >
              {n}
            </motion.span>
          </AnimatePresence>
        </span>{' '}
        times
      </span>
      <span className="us-screen-row">
        <span className="us-btn">Click me</span>
        <span className="us-click">
          {click && (
            <Token id={id} tone="focus">
              klik
            </Token>
          )}
        </span>
      </span>
    </div>
  )
}

/* Et kald til setteren: hvad det læser, og hvad det giver. */
function Call({ i, read, result, show, delay }: { i: number; read: ReactNode; result: number; show: boolean; delay: number }) {
  return (
    <motion.div
      className="us-call"
      initial={false}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : -6 }}
      transition={show ? { ...t.settle, delay } : t.fade}
    >
      <span className="us-call-n">kald {i}</span>
      <span className="us-call-read mono">{read}</span>
      <span className="us-call-arrow">→</span>
      <span className="us-call-res mono">{result}</span>
    </motion.div>
  )
}

function UseState({ step }: { step: number }) {
  const variant = step >= 5 ? 2 : step === 4 ? 1 : 0
  const count = step >= 5 ? 3 : step === 4 ? 2 : step >= 2 ? 1 : 0
  const shown = step >= 5 ? 3 : step === 4 ? 2 : step >= 3 ? 1 : 0
  const rerender = step === 2 || step === 4 || step === 5
  const trace = step >= 5 ? 2 : step === 4 ? 1 : step >= 2 ? 0 : -1
  const rightTone: Tone = rerender ? 'focus' : 'idle'

  // Opkaldssporet i runtimen for hver variant.
  const traces = [
    { start: 0, calls: [{ read: <>count 0 + 1</>, result: 1 }] },
    {
      start: 1,
      calls: [
        { read: <>count 1 + 1</>, result: 2 },
        { read: <>count 1 + 1</>, result: 2 },
      ],
    },
    {
      start: 1,
      calls: [
        { read: <>state 1 + 1</>, result: 2 },
        { read: <>state 2 + 1</>, result: 3 },
      ],
    },
  ]

  const results = [
    { code: 'window.count++', res: 'skærmen: 0', rule: 'variabel: ingen re-render', from: 1, tone: 'neg' as Tone },
    { code: 'setCount(count + 1) ×2', res: '+1', rule: 'setter: re-render, begge ser samme count', from: 4, tone: 'idle' as Tone },
    { code: 'setCount(state => state + 1) ×2', res: '+2', rule: 'funktion: seneste state', from: 5, tone: 'focus' as Tone },
  ]

  return (
    <div className="us">
      {/* Venstre: almindelig variabel. */}
      <div className="us-side">
        <div className="us-card" data-tone={step === 1 ? 'muted-hit' : 'idle'}>
          <div className="us-card-head">
            <span className="mono us-name">{`Not${SHY}Working${SHY}Counter`}</span>
          </div>
          <div className="us-codebox">
            <Code lines={LEFT_CODE} />
          </div>
          <Screen n={0} changed={false} click={step === 1} id="us-click-l" />
        </div>
        <div className="us-between">
          <motion.span className="us-between-label" initial={false} animate={{ opacity: at(step, 1) ? 1 : 0 }} transition={t.fade}>
            <Tag tone="neg">React opdager det ikke</Tag>
          </motion.span>
        </div>
        <div className="us-store" data-on={step === 1 || undefined}>
          <span className="vcaps">Global variabel</span>
          <span className="us-slot mono">
            window.count:{' '}
            <span className="us-slot-v" data-hit={step === 1 || undefined}>
              <Swap show={at(step, 1) ? 1 : 0} items={['0', '1']} />
            </span>
          </span>
          <motion.span className="us-start" initial={false} animate={{ opacity: at(step, 1) ? 1 : 0 }} transition={t.fade}>
            ændres uden om React: ingen setter, intet nyt kald af komponenten
          </motion.span>
        </div>
      </div>

      {/* Højre: state i React-runtimen. */}
      <div className="us-side">
        <div className="us-card" data-tone={rightTone}>
          <div className="us-card-head">
            <span className="mono us-name">
              <Swap show={variant} items={RIGHT_NAME} />
            </span>
          </div>
          <div className="us-codebox">
            <Swap show={variant} items={RIGHT_CODE.map((lines, i) => <Code key={i} lines={lines} />)} />
          </div>
          <Screen n={shown} changed={step === 3 || step === 4 || step === 5} click={rerender} id="us-click-r" />
        </div>
        <div className="us-between">
          <span className="us-arrow">
            <Link on={at(step, 2)} vertical tone={rerender ? 'focus' : 'idle'} />
            <motion.span className="us-arrow-label" initial={false} animate={{ opacity: at(step, 2) ? 1 : 0 }} transition={t.fade}>
              setter gemmer
            </motion.span>
          </span>
          <span className="us-arrow">
            <Link on={at(step, 2)} vertical back tone={rerender ? 'focus' : 'idle'} />
            <motion.span className="us-arrow-label" initial={false} animate={{ opacity: at(step, 2) ? 1 : 0 }} transition={t.fade}>
              re-render
            </motion.span>
          </span>
        </div>
        <div className="us-store" data-on={rerender || undefined}>
          <span className="vcaps">React-runtime</span>
          <span className="us-slot mono">
            count:{' '}
            <span className="us-slot-v" data-hit={rerender || undefined}>
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={count}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 6 }}
                  transition={{ ...t.place, delay: rerender ? 0.5 : 0 }}
                >
                  {count}
                </motion.span>
              </AnimatePresence>
            </span>
          </span>
          <Swap
            className="us-trace"
            show={trace + 1}
            items={[
              <div key="none" />,
              ...traces.map((tr, v) => (
                <div key={v} className="us-calls">
                  <span className="us-start">
                    før klik: <span className="mono">count = {tr.start}</span>
                  </span>
                  {tr.calls.map((c, i) => (
                    <Call key={i} i={i + 1} read={c.read} result={c.result} show={trace === v} delay={0.15 + i * 0.35} />
                  ))}
                  {v === 1 && <span className="us-why">begge kald læser <span className="mono">count</span> fra denne render</span>}
                </div>
              )),
            ]}
          />
        </div>
      </div>

      {/* Resultater: fyldes ud efterhånden og står samlet i slutrammen. */}
      <ol className="us-results">
        {results.map((r, i) => {
          const on = at(step, r.from)
          return (
            <motion.li
              key={r.code}
              className="us-result"
              data-tone={on ? (step === 6 || step === r.from ? r.tone : 'idle') : 'ghost'}
              initial={false}
              animate={{ opacity: on ? 1 : 0.55 }}
              transition={on ? stagger(i, 0, 0.08) : t.fade}
            >
              <span className="us-result-code mono">{r.code}</span>
              <span className="us-result-res">{r.res}</span>
              <span className="us-result-rule">{r.rule}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'usestate-render',
  title: 'Klik på to tællere, og hvad React ser',
  steps: [
    { caption: 'To tællere: én med en almindelig variabel, én med `useState`. Begge viser “You clicked 0 times”.', hold: 1800 },
    { caption: '`window.count++`: variablen bliver 1, men skærmen står stille. React opdager det ikke.', hold: 2400 },
    {
      caption: '`setCount(count + 1)` gemmer 1 i **React-runtimen** og får React til at kalde komponenten igen.',
      hold: 2600,
    },
    { caption: 'Kun tallet i teksten ændres i DOM’en.', hold: 1600 },
    {
      caption: 'To gange `setCount(count + 1)` i samme handler: begge kald læser `count = 1` fra denne render, så resultatet bliver 2.',
      hold: 3000,
    },
    { caption: 'Med en **funktion** får hvert kald den seneste state: 1 → 2 → 3.', hold: 2600 },
    { caption: 'Variabel: ingen re-render. Setter: re-render. Funktion: seneste state.', hold: 3000 },
  ],
  Component: UseState,
}

export default viz
