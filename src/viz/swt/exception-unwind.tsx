import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './exception-unwind.css'

/* Exeption-Management-CSharp.pdf s. 5 (principperne), s. 7 (runtime’s default-handler lukker
   programmet), s. 13 (stakken ordret, inkl. den stiplede vej op til runtime);
   Exception-Testing.pdf s. 3 (testlinjen ordret og de to callouts). */

function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,]|=> )/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

const FRAMES = [
  { code: 'Runtime', rest: 'with default exception handler' },
  { code: 'Main()', rest: 'with exception handler' },
  { code: 'Method1()', rest: 'with exception handler' },
  { code: 'Method2()', rest: 'with no exception handler' },
  { code: 'Method3()', rest: 'which throws exception' },
] as const

const LAST = 6

/** Hvor står exception’en på dette trin (rammeindeks), eller -1. */
const excAt = (step: number) => (step < 2 ? -1 : step === 2 ? 4 : step === 3 ? 3 : 2)

function Unwind({ step }: { step: number }) {
  const pos = excAt(step)
  const test = at(step, LAST)

  const token = (
    <Token id="eu-exc" tone="neg" launch={step === 2}>
      exception
    </Token>
  )

  return (
    <div className="eu">
      <div className="eu-stack-wrap">
        <span className="vcaps">Kaldstakken</span>
        <div className="eu-stack">
          {FRAMES.map((f, i) => {
            const shown = i === 0 || at(step, 1)
            const popped = (i === 4 && at(step, 3)) || (i === 3 && at(step, 4))
            const thrower = i === 4 && step === 2
            const catcher = i === 2 && at(step, 4)
            const tone = !shown
              ? 'ghost'
              : popped
                ? 'popped'
                : thrower || (i === 3 && step === 3)
                  ? 'neg'
                  : catcher
                    ? 'ok'
                    : pos === i
                      ? 'focus'
                      : 'idle'
            return (
              <Fragment key={f.code}>
                <div
                  className="eu-frame"
                  data-tone={tone}
                  data-called={(i > 0 && at(step, 1)) || undefined}
                  style={{ gridRow: i + 1 }}
                >
                  <motion.div
                    className="eu-frame-title"
                    initial={false}
                    animate={{ opacity: shown ? 1 : 0, y: shown ? 0 : -4 }}
                    transition={shown ? stagger(i, 0, 0.12) : t.fade}
                  >
                    <code>{f.code}</code> <span className="eu-rest">{f.rest}</span>
                  </motion.div>
                  <div className="eu-status">
                    {i === 4 && (
                      <Swap
                        show={step < 2 ? 0 : step === 2 ? 1 : 2}
                        items={[
                          <span key="n" />,
                          <Tag key="t" tone="neg">
                            throw · flowet stopper
                          </Tag>,
                          <Tag key="p" tone="muted">
                            kastede · poppet
                          </Tag>,
                        ]}
                      />
                    )}
                    {i === 3 && (
                      <Swap
                        show={step < 3 ? 0 : step === 3 ? 1 : 2}
                        items={[
                          <span key="n" />,
                          <Tag key="t" tone="neg">
                            ingen catch · videre op
                          </Tag>,
                          <Tag key="p" tone="muted">
                            ingen catch · poppet
                          </Tag>,
                        ]}
                      />
                    )}
                    {i === 2 && <Tag show={catcher} wrap>catch · flowet fortsætter her</Tag>}
                    {i === 0 && (
                      <Tag show={at(step, 5)} tone="neg" wrap>
                        ufanget → programmet lukkes
                      </Tag>
                    )}
                  </div>
                </div>
                <div className="eu-slot" style={{ gridRow: i + 1 }}>
                  {pos === i && token}
                </div>
              </Fragment>
            )
          })}
          {/* Den stiplede vej: fanger ingen, ender exception’en hos runtime (s. 7, 13). */}
          <motion.div
            className="eu-rail"
            initial={false}
            animate={{ opacity: at(step, 5) ? 1 : 0 }}
            transition={t.fade}
            aria-hidden="true"
          >
            <span className="eu-rail-head" />
          </motion.div>
        </div>
      </div>

      <div className="eu-test" data-on={test || undefined}>
        <span className="vcaps">Test af exception · NUnit</span>
        <motion.div
          className="eu-test-body"
          initial={false}
          animate={{ opacity: test ? 1 : 0 }}
          transition={t.fade}
          aria-hidden={!test || undefined}
        >
          <div className="eu-code">
            <code>
              <span className="eu-dim">Assert.That(</span>
              <mark className="eu-mark">{brk('() => uut.StuffThatThrowsException()')}</mark>
              <span className="eu-dim">, </span>
              <wbr />
              <mark className="eu-mark">{brk('Throws.TypeOf<MyException>()')}</mark>
              <span className="eu-dim">);</span>
            </code>
          </div>
          <dl className="eu-notes">
            <div>
              <dt>1. argument</dt>
              <dd>en metode uden parametre, her en lambda</dd>
            </div>
            <div>
              <dt>constraint</dt>
              <dd>den forventede exception-type</dd>
            </div>
          </dl>
          <ol className="eu-flow">
            {[
              <>
                NUnit kalder <code>{brk('() => …')}</code>
              </>,
              <>
                <span className="eu-mini" data-tone="neg">
                  MyException
                </span>{' '}
                kastes
              </>,
              <>
                <code>{brk('Throws.TypeOf<MyException>()')}</code> fanger den
              </>,
              <>
                <span className="eu-pass">✓ grøn</span>
              </>,
            ].map((c, i) => (
              <motion.li
                key={i}
                initial={false}
                animate={{ opacity: test ? 1 : 0, x: test ? 0 : -4 }}
                transition={test ? stagger(i, 0.25, 0.22) : t.fade}
              >
                {c}
              </motion.li>
            ))}
          </ol>
        </motion.div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'exception-unwind',
  title: 'En exception rejser op gennem kaldstakken',
  steps: [
    { caption: 'Programmet starter: runtime har en implicit `try`/`catch` om `Main()`.', hold: 1800 },
    {
      caption: 'Kaldene bygger stakken nedad: `Main()` kalder `Method1()`, som kalder `Method2()`, som kalder `Method3()`.',
      hold: 2200,
    },
    {
      caption: '`Method3()` opdager en fejl og kaster en exception. Det normale kontrolflow **stopper øjeblikkeligt**.',
      hold: 2200,
    },
    {
      caption: 'Runtime leder op gennem stakken efter en handler. `Method2()` har ingen, så dens ramme poppes også.',
      hold: 2400,
    },
    {
      caption:
        '`Method1()` har en handler, der fanger exception’en. Stakken er rullet op til dens niveau (**stack unwinding**), og flowet fortsætter i handleren.',
      hold: 3000,
    },
    {
      caption:
        'Havde ingen fanget den, var den endt hos runtime’s default-handler, og programmet var blevet **lukket med tvang**.',
      hold: 2600,
    },
    {
      caption:
        'Exceptions er en del af kontrakten og testes: `Assert.That` får en lambda, NUnit kalder den, og `Throws.TypeOf<MyException>()` fanger exception’en. Testen er grøn.',
      hold: 3000,
    },
  ],
  Component: Unwind,
}

export default viz
