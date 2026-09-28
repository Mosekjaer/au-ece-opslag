import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './vitest-rtl.css'

/* FED testing with Vitest.pdf s. 25 (testen ordret), s. 22 (User-komponentens JSX),
   s. 13 (environment: 'jsdom'), s. 20–21 (queries). Terminalens ordlyd følger
   formatet på s. 6; netop denne tests output er ikke vist i materialet. */

/** Kode med brudpunkter efter punktum, komma og parentes — aldrig midt i et ord. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,(])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

type Sec = 1 | 2 | 3 | 4
const LINES: { text: string; indent: number; sec?: Sec; comment?: boolean; check?: number }[] = [
  { text: "test('User component handles change event', async () => {", indent: 0 },
  { text: '// Arrange', indent: 1, sec: 1, comment: true },
  { text: 'render(<User />);', indent: 1, sec: 1 },
  { text: '// Assert before event', indent: 1, sec: 2, comment: true },
  { text: "const inputElement = screen.getByRole('textbox');", indent: 1, sec: 2 },
  { text: "expect(inputElement).toHaveValue('');", indent: 1, sec: 2, check: 2 },
  { text: '// Act', indent: 1, sec: 3, comment: true },
  { text: "fireEvent.change(screen.getByRole('textbox'), {", indent: 1, sec: 3 },
  { text: "target: { value: 'JavaScript' },", indent: 2, sec: 3 },
  { text: '});', indent: 1, sec: 3 },
  { text: '// Assert after event', indent: 1, sec: 4, comment: true },
  { text: "expect(await screen.findByRole('textbox')).toHaveValue('JavaScript');", indent: 1, sec: 4, check: 4 },
  { text: '});', indent: 0 },
]

const QUERIES = [
  { q: 'getBy*', what: 'skal være der' },
  { q: 'queryBy*', what: 'må ikke være der' },
  { q: 'findBy*', what: 'kommer senere — await' },
]

function Vitest({ step }: { step: number }) {
  const rendered = at(step, 1)
  const changed = at(step, 3)
  const done = at(step, 5)
  const queryTag = step === 2 ? 0 : step === 3 ? 1 : step >= 4 ? 2 : 3

  return (
    <div className="vt">
      <div className="vt-code" role="presentation">
        <div className="vt-code-head">
          <span className="vcaps">User.test.jsx</span>
        </div>
        <div className="vt-pre">
          {LINES.map((l, i) => {
            const hot = l.sec !== undefined && l.sec === step && step < 5
            const passed = l.sec !== undefined && (done || l.sec < step)
            return (
              <div
                key={i}
                className="vt-line"
                data-hot={hot || undefined}
                data-comment={l.comment || undefined}
                data-passed={(passed && l.comment) || undefined}
                style={{ paddingLeft: `${l.indent * 1.5 + 1.75}ch` }}
              >
                <code>{brk(l.text)}</code>
                {l.check !== undefined && (
                  <motion.span
                    className="vt-check"
                    initial={false}
                    animate={{ opacity: at(step, l.check) ? 1 : 0, scale: at(step, l.check) ? 1 : 0.6 }}
                    transition={at(step, l.check) ? { ...t.place, delay: 0.35 } : t.fade}
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="vt-side">
        <div className="vt-dom" data-hot={(step >= 1 && step <= 4) || undefined}>
          <div className="vt-dom-head">
            <span className="vt-dom-name">JSDOM</span>
            <code>environment: 'jsdom'</code>
          </div>
          <div className="vt-tree">
            <code className="vt-tag">&lt;body&gt;</code>
            <motion.div
              className="vt-kids"
              initial={false}
              animate={{ opacity: rendered ? 1 : 0, y: rendered ? 0 : 6 }}
              transition={rendered ? t.settle : t.fade}
            >
              <span className="vt-from">
                rendret af <code>&lt;User /&gt;</code>
              </span>
              <div className="vt-el" data-hot={(step >= 2 && step <= 4) || undefined}>
                <div className="vt-el-head">
                  <code className="vt-tag">&lt;input&gt;</code>
                  <span className="vt-role">rolle: textbox</span>
                </div>
                <span className="vt-field">
                  <motion.span
                    key={changed ? 'js' : 'empty'}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={t.settle}
                  >
                    {changed ? 'JavaScript' : ''}
                  </motion.span>
                  <span className="vt-caret" />
                </span>
                <Swap
                  className="vt-query"
                  show={queryTag}
                  items={[
                    <Tag key="g" wrap>
                      getByRole('textbox') → ''
                    </Tag>,
                    <Tag key="f" wrap>
                      change · value: 'JavaScript'
                    </Tag>,
                    <Tag key="a" wrap>
                      await findByRole('textbox') → 'JavaScript'
                    </Tag>,
                    <span key="n" />,
                  ]}
                />
              </div>
              <div className="vt-el" data-hot={step === 3 || undefined}>
                <div className="vt-el-head">
                  <code className="vt-tag">&lt;p&gt;</code>
                  <span className="vt-p">
                    Searches for{' '}
                    <motion.span
                      key={changed ? 'js' : 'dots'}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ ...t.settle, delay: changed ? 0.3 : 0 }}
                    >
                      {changed ? 'JavaScript' : '...'}
                    </motion.span>
                  </span>
                </div>
              </div>
            </motion.div>
            <code className="vt-tag">&lt;/body&gt;</code>
          </div>
        </div>

        <motion.dl
          className="vt-legend"
          initial={false}
          animate={{ opacity: done ? 1 : 0 }}
          transition={t.fade}
          aria-hidden={!done || undefined}
        >
          {QUERIES.map((q, i) => (
            <motion.div
              key={q.q}
              initial={false}
              animate={{ opacity: done ? 1 : 0, y: done ? 0 : 4 }}
              transition={done ? stagger(i, 0.1, 0.1) : t.fade}
            >
              <dt>
                <code>{q.q}</code>
              </dt>
              <dd>{q.what}</dd>
            </motion.div>
          ))}
        </motion.dl>
      </div>

      <div className="vt-status" data-done={done || undefined}>
        <span className="vt-run">vitest</span>
        <Swap
          show={done ? 1 : 0}
          items={[
            <span key="r" className="vt-running">
              kører testen i Node …
            </span>,
            <span key="d" className="vt-result">
              <span className="vt-pass">✓ User component handles change event</span>
              <span className="vt-sum">
                Test Files <b>1 passed</b> (1) · Tests <b>1 passed</b> (1)
              </span>
            </span>,
          ]}
        />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'vitest-rtl',
  title: 'En komponenttest fra render til expect',
  steps: [
    {
      caption: 'Testen kører i Node. `environment: \'jsdom\'` giver den et emuleret browser-DOM, som endnu er tomt.',
      hold: 1800,
    },
    { caption: '**Arrange**: `render(<User />)` renderer komponenten ind i JSDOM — et input og et afsnit.', hold: 2200 },
    {
      caption: '`screen.getByRole(\'textbox\')` finder feltet, som en bruger ville. Før eventet er det tomt: `toHaveValue(\'\')` består.',
      hold: 2600,
    },
    {
      caption: '**Act**: `fireEvent.change` sender et change-event med værdien `\'JavaScript\'`. Komponenten re-renderer, og afsnittet følger med.',
      hold: 2600,
    },
    {
      caption: '**Assert**: `await screen.findByRole(\'textbox\')` — værdien er nu `\'JavaScript\'`. `await` undgår en advarsel i konsollen.',
      hold: 2600,
    },
    { caption: 'render → query → `fireEvent` → `expect`. Testen er bestået.', hold: 3000 },
  ],
  Component: Vitest,
}

export default viz
