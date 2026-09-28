import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './aaa-nunit.css'

/* Introduction to Unit Tests.pdf s. 6 (AAA), s. 10 (AAA i NUnit), s. 16 (testklassen ordret),
   s. 17 (navnekonventionen), s. 18 ([TestCase]), s. 19 (test runners);
   calculatortestsolution-1.0.10 · CalculatorUnitTests.cs ([TestCase]-rækkerne). */

/** Kode med brudpunkter efter punktum, komma, parentes og understreg — aldrig midt i et ord. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,(_])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

type Sec = 'arr' | 'act' | 'ass'
interface Line {
  text: string
  indent: number
  sec?: Sec
  slot?: 'setup' | 'act' | 'ass'
  name?: boolean
  attr?: boolean
}

const LINES: Line[] = [
  { text: 'public class Tests {', indent: 0 },
  { text: 'private Calculator _uut;', indent: 1 },
  { text: '[SetUp] // Common Arrange', indent: 1, sec: 'arr', attr: true },
  { text: 'public void Setup() {', indent: 1, sec: 'arr' },
  { text: '_uut = new Calculator();', indent: 2, sec: 'arr', slot: 'setup' },
  { text: '}', indent: 1, sec: 'arr' },
  { text: '[Test]', indent: 1, attr: true },
  { text: 'public void Add_AddTwoInts_SumIsCorrect() {', indent: 1, name: true },
  { text: 'double result = _uut.Add(2, 3);', indent: 2, sec: 'act', slot: 'act' },
  { text: 'Assert.That(result, Is.EqualTo(5.0));', indent: 2, sec: 'ass', slot: 'ass' },
  { text: '}', indent: 1 },
  { text: '}', indent: 0 },
]

// Gutterens bånd: første linje (1-baseret grid-række) og antal linjer.
const BANDS: { sec: Sec; label: string; row: number; span: number; at: number }[] = [
  { sec: 'arr', label: 'Arrange', row: 3, span: 4, at: 1 },
  { sec: 'act', label: 'Act', row: 9, span: 1, at: 2 },
  { sec: 'ass', label: 'Assert', row: 10, span: 1, at: 4 },
]

const CASES = ['(3, 2, 5)', '(-3, -2, -5)', '(-3, 2, -1)', '(3, -2, 1)', '(3, 0, 3)']

const NAME_PARTS = [
  { code: 'Add', label: 'metode' },
  { code: 'AddTwoInts', label: 'scenarie' },
  { code: 'SumIsCorrect', label: 'forventet resultat' },
]

const LAST = 6

function secOfStep(step: number): Sec | undefined {
  return step === 1 ? 'arr' : step === 2 || step === 3 ? 'act' : step === 4 ? 'ass' : undefined
}

/** Et objekt der rejser: skjult på sit udgangspunkt, synligt når det er fremme. */
function Hidden({ children }: { children: ReactNode }) {
  return (
    <span className="aaa-origin" aria-hidden="true">
      {children}
    </span>
  )
}

function Aaa({ step }: { step: number }) {
  const hotSec = secOfStep(step)
  const done = at(step, LAST)

  const calc = (
    <Token id="aaa-calc" tone={step === 1 ? 'focus' : 'idle'}>
      Calculator
    </Token>
  )
  const call = (
    <Token id="aaa-call" tone={step === 2 ? 'focus' : 'muted'} launch={step === 2}>
      Add(2, 3)
    </Token>
  )
  const ret = (
    <Token id="aaa-ret" tone={step === 3 ? 'focus' : 'idle'}>
      5
    </Token>
  )

  const runnerFirst = step >= 4 ? 'ok' : step >= 1 ? 'run' : 'wait'

  return (
    <div className="aaa">
      {/* Testklassen med AAA-bånd i gutteren */}
      <div className="aaa-code">
        <div className="aaa-code-head">
          <span className="vcaps">CalcTest · Tests.cs</span>
        </div>
        <div className="aaa-grid">
          {BANDS.map((b) => {
            const tone = step === b.at || (b.sec === 'act' && step === 3) ? 'focus' : at(step, b.at) ? 'ok' : 'ghost'
            return (
              <div
                key={b.sec}
                className="aaa-band"
                data-tone={tone}
                style={{ gridRow: `${b.row} / span ${b.span}` }}
              >
                {b.label}
              </div>
            )
          })}
          {LINES.map((l, i) => {
            const hot = (l.sec !== undefined && l.sec === hotSec) || (l.name && step === 5)
            return (
              <div
                key={i}
                className="aaa-line"
                data-hot={hot || undefined}
                data-attr={l.attr || undefined}
                style={{ gridRow: i + 1, ['--ind' as string]: l.indent }}
              >
                <code>{brk(l.text)}</code>
                {l.slot === 'setup' && step < 1 && <Hidden>{calc}</Hidden>}
                {l.slot === 'act' && (
                  <span className="aaa-slot">
                    {step < 2 && <Hidden>{call}</Hidden>}
                    {step >= 3 && ret}
                  </span>
                )}
                {l.slot === 'ass' && (
                  <motion.span
                    className="aaa-check"
                    initial={false}
                    animate={{ opacity: at(step, 4) ? 1 : 0, scale: at(step, 4) ? 1 : 0.6 }}
                    transition={at(step, 4) ? { ...t.place, delay: 0.3 } : t.fade}
                  >
                    ✓
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* UUT: objektet som [SetUp] laver */}
      <div className="aaa-uut" data-hot={(step >= 1 && step <= 3) || undefined}>
        <div className="aaa-uut-head">
          <span className="vcaps">_uut</span>
          <span className="aaa-uut-note">unit under test</span>
        </div>
        <div className="aaa-uut-body">
          <span className="aaa-uut-slot">{step >= 1 ? calc : <span className="aaa-empty">tom</span>}</span>
          <span className="aaa-uut-slot">{step >= 2 && call}</span>
          <span className="aaa-uut-slot">
            {step === 2 && <Hidden>{ret}</Hidden>}
            <motion.span
              className="aaa-returns"
              initial={false}
              animate={{ opacity: at(step, 3) ? 1 : 0 }}
              transition={t.fade}
            >
              returnerer 5
            </motion.span>
          </span>
        </div>
      </div>

      {/* Testnavnet splittes i sine tre dele (s. 17) */}
      <div className="aaa-name" data-on={at(step, 5) || undefined}>
        {NAME_PARTS.map((p, i) => (
          <Fragment key={p.code}>
            {i > 0 && <span className="aaa-us">_</span>}
            <span className="aaa-part">
              <code>{p.code}</code>
              <motion.span
                className="aaa-part-label"
                initial={false}
                animate={{ opacity: at(step, 5) ? 1 : 0, y: at(step, 5) ? 0 : -3 }}
                transition={at(step, 5) ? stagger(i, 0.05, 0.14) : t.fade}
              >
                {p.label}
              </motion.span>
            </span>
          </Fragment>
        ))}
      </div>

      {/* Runneren: Test Explorer-agtig liste */}
      <div className="aaa-run">
        <div className="aaa-run-head">
          <span className="vcaps">Test runner</span>
          <span className="aaa-run-sub">fx Test Explorer i VS eller dotnet test</span>
        </div>
        <ul className="aaa-list">
          <li className="aaa-test" data-state={runnerFirst}>
            <span className="aaa-mark">{runnerFirst === 'ok' ? '✓' : runnerFirst === 'run' ? '●' : '○'}</span>
            <code>{brk('Add_AddTwoInts_SumIsCorrect')}</code>
          </li>
          <li className="aaa-test" data-state={done ? 'ok' : 'wait'}>
            <span className="aaa-mark">{done ? '✓' : '○'}</span>
            <code>{brk('Add_AddPosAndNegNumbers_ResultIsCorrect')}</code>
          </li>
          {CASES.map((c, i) => (
            <li key={c} className="aaa-case" data-state={done ? 'ok' : 'wait'}>
              <motion.span
                className="aaa-mark"
                initial={false}
                animate={{ opacity: done ? 1 : 0.5 }}
                transition={done ? stagger(i, 0.2, 0.18) : t.fade}
              >
                {done ? '✓' : '○'}
              </motion.span>
              <code className="aaa-case-args">[TestCase{c}]</code>
              <motion.span
                className="aaa-case-setup"
                initial={false}
                animate={{ opacity: done ? 1 : 0 }}
                transition={done ? stagger(i, 0.2, 0.18) : t.fade}
              >
                egen <code>Setup()</code>
              </motion.span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'aaa-nunit',
  title: 'En NUnit-test fra Setup til grøn',
  steps: [
    {
      caption: 'Testklassen fra slidet. Båndene **Arrange**, **Act** og **Assert** markerer, hvor hvert trin i mønsteret sker. `_uut` er endnu tom.',
      hold: 2400,
    },
    {
      caption: 'Runneren kalder `[SetUp]`-metoden `Setup()` før testen: et nyt `Calculator`-objekt lander i `_uut`. Det er den fælles **Arrange**.',
      hold: 2600,
    },
    { caption: '**Act**: testen kalder UUT med `Add(2, 3)`.', hold: 1700 },
    { caption: 'UUT returnerer `5`, som gemmes i `result`.', hold: 1600 },
    {
      caption: '**Assert**: `Assert.That(result, Is.EqualTo(5.0))` sammenligner `5` med den forventede værdi. Testen er grøn.',
      hold: 2400,
    },
    {
      caption: 'Navnet siger metode, scenarie og forventet resultat: `Add` · `AddTwoInts` · `SumIsCorrect`.',
      hold: 2400,
    },
    {
      caption:
        'Næste test har fem `[TestCase]`-rækker. Hver række får sit eget friske `Setup()` — en ny UUT før hver test gør testene **uafhængige** af hinanden.',
      hold: 3000,
    },
  ],
  Component: Aaa,
}

export default viz
