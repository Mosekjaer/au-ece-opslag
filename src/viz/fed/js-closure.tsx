import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './js-closure.css'

/* FED Functions in js.pdf s. 18: makeAddFunction kaldes to gange. Hvert kald får
   sit eget environment med amount; den returnerede add husker netop det. Kaldet
   add(1) får sit eget lille environment med number, indlejret i det huskede. */

const SHY = String.fromCharCode(0xad)
const MAF = `make${SHY}Add${SHY}Function`

const CODE: { text: string; depth: number }[] = [
  { text: 'function makeAddFunction(amount) {', depth: 0 },
  { text: 'function add(number) {', depth: 1 },
  { text: 'return number + amount;', depth: 2 },
  { text: '}', depth: 1 },
  { text: 'return add;', depth: 1 },
  { text: '}', depth: 0 },
  { text: '', depth: 0 },
  { text: 'var addTwo = makeAddFunction(2);', depth: 0 },
  { text: 'var addFive = makeAddFunction(5);', depth: 0 },
  { text: 'console.log(addTwo(1) + addFive(1));', depth: 0 },
]

// Hvilken kodelinje (0-indekseret) der kører i hvert trin.
const LINE = [-1, 7, 4, 8, 2, 2, 9]

const CALLS = [
  { n: 1, name: 'addTwo', amount: 2, made: 1, kept: 2, run: 4, result: 3 },
  { n: 2, name: 'addFive', amount: 5, made: 3, kept: 3, run: 5, result: 6 },
] as const

function Row({ k, v, tone = 'idle', show = true }: { k: ReactNode; v: ReactNode; tone?: Tone; show?: boolean }) {
  return (
    <motion.div
      className="jc-row"
      data-tone={tone}
      initial={false}
      animate={{ opacity: show ? 1 : 0.35 }}
      transition={t.fade}
    >
      <code className="jc-k">{k}</code>
      <span className="jc-v">{v}</span>
    </motion.div>
  )
}

function Arg({ id, tone }: { id: string; tone: Tone }) {
  return (
    <Token id={id} tone={tone}>
      1
    </Token>
  )
}

function Call({ step, c }: { step: number; c: (typeof CALLS)[number] }) {
  const made = at(step, c.made)
  const kept = at(step, c.kept)
  const running = step === c.run
  const ran = at(step, c.run)
  const tone: Tone = !made ? 'ghost' : step === c.made || running ? 'focus' : kept ? 'ok' : 'idle'
  return (
    <div className="jc-callcol">
      <Link on={kept} vertical label={<code>{c.name}</code>} tone={step === c.kept ? 'focus' : 'idle'} className="jc-link" />
      <Node tone={tone} className="jc-env" show>
        <div className="jc-env-head">
          <span className="jc-env-name">kald {c.n}</span>
          <code className="jc-env-sig">
            {MAF}({c.amount})
          </code>
          <span className="jc-ptr">
            <Tag show={kept} tone={step === c.kept ? 'focus' : 'idle'}>
              ← {c.name}
            </Tag>
          </span>
        </div>
        <motion.div className="jc-env-body" initial={false} animate={{ opacity: made ? 1 : 0 }} transition={made ? t.settle : t.fade}>
          <Row k="amount" v={<b className="jc-num">{c.amount}</b>} tone={running ? 'focus' : 'idle'} />
          <Row k="add" v="→ function" tone={step === c.kept ? 'focus' : 'idle'} />
          <motion.div
            className="jc-keeps"
            initial={false}
            animate={{ opacity: kept ? 1 : 0, y: kept ? 0 : 4 }}
            transition={kept ? t.place : t.fade}
          >
            ↑ <code>add</code> husker dette environment
          </motion.div>
          <div className="jc-inner" data-on={ran || undefined} data-now={running || undefined}>
            <span className="jc-inner-name">
              <code>{c.name}(1)</code>
            </span>
            <div className="jc-row">
              <code className="jc-k">number</code>
              <span className="jc-v jc-slot">{ran && <Arg id={`jc-arg-${c.n}`} tone={running ? 'focus' : 'idle'} />}</span>
            </div>
            <motion.div
              className="jc-row jc-sum"
              initial={false}
              animate={{ opacity: ran ? 1 : 0 }}
              transition={ran ? { ...t.settle, delay: running ? 0.75 : 0 } : t.fade}
            >
              <code className="jc-k">number + amount</code>
              <span className="jc-v">
                1 + {c.amount} = <b className="jc-num">{c.result}</b>
              </span>
            </motion.div>
          </div>
        </motion.div>
      </Node>
    </div>
  )
}

function Closure({ step }: { step: number }) {
  const line = LINE[step]
  const end = at(step, 6)
  return (
    <div className="jc">
      <div className="jc-left">
        <ol className="jc-code" aria-label="Koden fra slidet">
          {CODE.map((l, i) => (
            <li key={i} className="mono" data-tone={i === line ? 'focus' : 'idle'} style={{ paddingLeft: `calc(0.5rem + ${l.depth * 2}ch)` }}>
              {l.text || ' '}
            </li>
          ))}
        </ol>

        <div className="jc-eval">
          {CALLS.map((c) => (
            <div key={c.n} className="jc-eval-row" data-now={step === c.run || undefined}>
              <code>{c.name}(1)</code>
              <span className="jc-slot" data-gone={at(step, c.run) || undefined}>{!at(step, c.run) && <Arg id={`jc-arg-${c.n}`} tone="muted" />}</span>
              <motion.span
                className="jc-res"
                initial={false}
                animate={{ opacity: at(step, c.run) ? 1 : 0 }}
                transition={at(step, c.run) ? { ...t.settle, delay: step === c.run ? 0.9 : 0 } : t.fade}
              >
                = <b>{c.result}</b>
              </motion.span>
            </div>
          ))}
          <div className="jc-eval-row jc-out" data-on={end || undefined}>
            <span className="vcaps">konsol</span>
            <motion.span className="jc-total" initial={false} animate={{ opacity: end ? 1 : 0, y: end ? 0 : 4 }} transition={end ? t.place : t.fade}>
              3 + 6 = <b>9</b>
            </motion.span>
          </div>
        </div>
      </div>

      <div className="jc-right">
        <Node className="jc-global" tone="idle">
          <div className="jc-env-head">
            <span className="jc-env-name">globalt environment</span>
          </div>
          <Row k={MAF} v="→ function" />
          <Row k="addTwo" v={at(step, 2) ? '→ add fra kald 1' : '—'} show={at(step, 2)} tone={step === 2 ? 'focus' : 'idle'} />
          <Row k="addFive" v={at(step, 3) ? '→ add fra kald 2' : '—'} show={at(step, 3)} tone={step === 3 ? 'focus' : 'idle'} />
        </Node>
        <div className="jc-calls">
          {CALLS.map((c) => (
            <Call key={c.n} step={step} c={c} />
          ))}
        </div>
        <motion.p className="jc-react vnote" initial={false} animate={{ opacity: end ? 1 : 0 }} transition={t.fade}>
          Samme mønster i React: <code>update(1)</code> returnerer en handler, der husker <code>delta</code>.
        </motion.p>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'js-closure',
  title: 'To closures med hver sit amount',
  steps: [
    { caption: '`makeAddFunction` er defineret i det globale environment. Intet er kaldt endnu.', hold: 1600 },
    {
      caption: '`makeAddFunction(2)` kaldes. Kaldet får sit **eget environment**, hvor `amount` er 2, og `add` defineres dér.',
      hold: 2400,
    },
    {
      caption:
        '`return add`: kaldet er slut, men environmentet forsvinder ikke. `addTwo` peger på `add`, og `add` husker det environment, den blev defineret i. Det er en **closure**.',
      hold: 3000,
    },
    { caption: '`makeAddFunction(5)` giver et **nyt**, separat environment med `amount` 5 og sin egen `add`.', hold: 2400 },
    {
      caption: '`addTwo(1)`: `number` er 1 fra kaldet, `amount` findes i det huskede environment. Resultatet er 3.',
      hold: 2600,
    },
    { caption: '`addFive(1)` bruger sit eget `amount` 5 og giver 6. De to closures deler ikke noget.', hold: 2000 },
    {
      caption: '`console.log(addTwo(1) + addFive(1))` skriver **9**. Hver funktion bærer sit eget environment med sig.',
      hold: 3000,
    },
  ],
  Component: Closure,
}

export default viz
