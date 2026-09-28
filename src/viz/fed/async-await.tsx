import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, Token, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './async-await.css'

/* FED async-await.pdf: s. 3 (klik-handleren, ordret; async og await ringet ind),
   s. 4 (Task<string> → string: unwrapping), s. 6 (“await uncovered”: synkront indtil
   await, continuation på GUI-tråden — den kaldende tråd; linjen efter await er
   continuationen) og s. 8 (await Task.Run(() => DoSlowWork())). Materialet har ingen
   URL og ingen længde, så tbxLength viser text.Length symbolsk. */

const SHY = String.fromCharCode(0xad)
const ZWSP = String.fromCharCode(0x200b)

/** Brudpunkter i kode: efter . ( , og bløde bindestreger i lange camelCase-navne. */
const brk = (s: string) =>
  s
    .replace(/[A-Za-z_]{12,}/g, (w) => w.replace(/([a-z])(?=[A-Z])/g, `$1${SHY}`))
    .replace(/([.(,])(?=\S)/g, `$1${ZWSP}`)

type Seg = string | { id: 'async' | 'await' | 'call' | 'text'; s: string }
interface Ln {
  i: number
  s: Seg[]
}

const LINES: Ln[] = [
  { i: 0, s: ['private ', { id: 'async', s: 'async' }, ' void btnGetHtml_Click(object sender,'] },
  { i: 4, s: ['RoutedEventArgs e)'] },
  { i: 0, s: ['{'] },
  { i: 4, s: ['tbxLength.Text = "Fetching...";'] },
  { i: 4, s: ['string url = tbxUrl.Text;'] },
  { i: 4, s: ['HttpClient client = new HttpClient();'] },
  { i: 4, s: [{ id: 'text', s: 'string text' }, ' = ', { id: 'await', s: 'await' }, ' ', { id: 'call', s: 'client.GetStringAsync(url)' }, ';'] },
  { i: 4, s: ['tbxLength.Text = text.Length.ToString();'] },
  { i: 0, s: ['}'] },
]

const SYNC = [3, 4, 5, 6] // kører synkront på UI-tråden
const CONT = 7 // continuationen

/** Hvilke linjer er aktive nu, og i hvilken rækkefølge. */
const nowLines = (step: number): number[] =>
  step === 1 ? [3, 4, 5] : step >= 2 && step <= 4 ? [6] : step === 5 ? [CONT] : []

const segOn = (id: string, step: number) =>
  (id === 'call' && step === 2) || (id === 'await' && step === 3) || (id === 'text' && step === 4)

function Code({ step }: { step: number }) {
  const now = nowLines(step)
  return (
    <div className="asy-code" role="img" aria-label="Klik-handleren btnGetHtml_Click fra slidet">
      {LINES.map((l, n) => {
        const ord = now.indexOf(n)
        const on = ord >= 0
        const sync = SYNC.includes(n) && at(step, 1)
        const cont = n === CONT && at(step, 3)
        return (
          <div
            key={n}
            className="asy-ln"
            data-sync={sync || undefined}
            data-cont={cont || undefined}
            style={{ '--i': l.i } as CSSProperties}
          >
            <motion.span
              className="asy-hl"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: ord * 0.45 } : t.fade}
            />
            <span className="asy-t">
              {l.s.map((seg, j) =>
                typeof seg === 'string' ? (
                  <span key={j}>{brk(seg)}</span>
                ) : (
                  <span
                    key={j}
                    className="asy-seg"
                    data-kw={seg.id === 'async' || seg.id === 'await' || undefined}
                    data-on={segOn(seg.id, step) || undefined}
                  >
                    {brk(seg.s)}
                  </span>
                ),
              )}
            </span>
            {n === CONT && (
              <motion.span
                className="asy-cont-label"
                initial={false}
                animate={{ opacity: cont ? 1 : 0, y: cont ? 0 : -3 }}
                transition={cont ? t.place : t.fade}
              >
                Continuation
              </motion.span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function Run({ step }: { step: number }) {
  const sync = step === 0 ? 0 : step === 1 ? 72 : step === 2 ? 90 : 100
  const http = step < 2 ? 0 : step === 2 ? 28 : step === 3 ? 62 : 100
  const done = at(step, 4)
  const contInBand = step === 3 || step === 4
  const contInLane = at(step, 5)

  return (
    <div className="asy-run">
      <div className="asy-field">
        <code className="asy-field-name">tbxLength</code>
        <Swap
          className="asy-field-box"
          show={step === 0 ? 0 : step < 5 ? 1 : 2}
          items={[
            <span key="0" className="asy-field-empty">&nbsp;</span>,
            <code key="1">Fetching...</code>,
            <code key="2" className="asy-field-sym">
              text.Length
            </code>,
          ]}
        />
      </div>

      <div className="asy-lanes">
        {/* UI-tråden */}
        <span className="asy-lane-name">UI-tråd</span>
        <div className="asy-track">
          <div className="asy-seg-slot" style={{ flexBasis: '28%' }}>
            <motion.div
              className="asy-bar"
              initial={false}
              animate={{ width: `${sync}%` }}
              transition={t.travel}
            >
              <motion.span initial={false} animate={{ opacity: at(step, 1) ? 1 : 0 }} transition={t.fade}>
                synkront
              </motion.span>
            </motion.div>
          </div>
          <div className="asy-seg-slot" style={{ flexBasis: '36%' }}>
            <motion.div
              className="asy-free"
              initial={false}
              animate={{ opacity: at(step, 3) ? 1 : 0 }}
              transition={at(step, 3) ? { ...t.settle, delay: 0.5 } : t.fade}
            >
              fri
            </motion.div>
          </div>
          <div className="asy-seg-slot asy-cont-slot" style={{ flexBasis: '36%' }}>
            {contInLane && (
              <Token id="asy-cont" tone="focus">
                continuation
              </Token>
            )}
          </div>
        </div>

        {/* Task-objektet mellem banerne */}
        <span className="asy-lane-name asy-band-name" aria-hidden="true" />
        <div className="asy-band">
          <motion.div
            className="asy-task-row"
            initial={false}
            animate={{ opacity: at(step, 2) ? 1 : 0, scale: at(step, 2) ? 1 : 0.9 }}
            transition={at(step, 2) ? t.place : t.fade}
          >
            <span className="asy-task-tok" data-done={done || undefined}>
              <code>Task&lt;string&gt;</code>
            </span>
            <Swap
              show={done ? 1 : 0}
              items={[
                <Tag key="0" tone="idle">
                  ikke færdig
                </Tag>,
                <Tag key="1" tone="focus">
                  færdig
                </Tag>,
              ]}
            />
            {/* Strengen ligger i Task’en, til den pakkes ud. */}
            {!done && (
              <span className="asy-hidden-str" aria-hidden="true">
                <Token id="asy-str">string</Token>
              </span>
            )}
          </motion.div>
          <div className="asy-band-row">
            <div className="asy-cont-home">
              {contInBand && (
                <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={t.place}>
                  <Token id="asy-cont" tone="idle">
                    continuation
                  </Token>
                </motion.span>
              )}
            </div>
            <motion.div
              className="asy-unwrap"
              initial={false}
              animate={{ opacity: done ? 1 : 0 }}
              transition={done ? t.settle : t.fade}
            >
              <span className="asy-unwrap-arrow">await →</span>
              <code className="asy-unwrap-var">text</code>
              <span className="asy-unwrap-slot">{done && <Token id="asy-str">string</Token>}</span>
            </motion.div>
          </div>
        </div>

        {/* HTTP-kaldet */}
        <span className="asy-lane-name">HTTP-kald</span>
        <div className="asy-track">
          <div className="asy-seg-slot" style={{ flexBasis: '26%' }} />
          <div className="asy-seg-slot" style={{ flexBasis: '36%' }}>
            <motion.div className="asy-http" initial={false} animate={{ width: `${http}%` }} transition={t.travel} />
          </div>
          <div className="asy-seg-slot asy-http-end" style={{ flexBasis: '38%' }}>
            <motion.span initial={false} animate={{ opacity: done ? 1 : 0 }} transition={done ? t.place : t.fade}>
              færdig
            </motion.span>
          </div>
        </div>
      </div>
    </div>
  )
}

function AsyncAwait({ step }: { step: number }) {
  const last = at(step, 6)
  return (
    <div className="asy">
      <Code step={step} />
      <Run step={step} />
      <motion.div
        className="asy-note"
        initial={false}
        animate={{ opacity: last ? 1 : 0 }}
        transition={last ? { ...t.settle, delay: 0.3 } : t.fade}
      >
        <code>await Task.{ZWSP}Run(() =&gt; DoSlowWork());</code> flytter langsomt <em>synkront</em> arbejde væk fra UI-tråden.
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'async-await',
  title: 'await frigiver UI-tråden',
  steps: [
    { caption: 'Brugeren klikker. `btnGetHtml_Click` starter på UI-tråden.', hold: 1600 },
    { caption: 'Indtil `await` kører metoden **synkront** på UI-tråden, som enhver event handler.', hold: 2400 },
    {
      caption: '`GetStringAsync` returnerer straks en `Task<string>` — resultatet er ikke klar endnu.',
      hold: 2400,
    },
    {
      caption: 'Ved `await` planlægges resten som en **continuation**, og metoden returnerer. UI-tråden blokerer ikke.',
      hold: 3000,
    },
    { caption: 'Operationen bliver færdig. `await` pakker `Task<string>` ud til en `string`.', hold: 2400 },
    {
      caption: 'Continuationen kører på UI-tråden — den kaldende tråd — og må derfor sætte `tbxLength.Text`.',
      hold: 2600,
    },
    { caption: 'Før `await`: synkront. Efter `await`: continuation. Imellem er UI-tråden fri.', hold: 3000 },
  ],
  Component: AsyncAwait,
}

export default viz
