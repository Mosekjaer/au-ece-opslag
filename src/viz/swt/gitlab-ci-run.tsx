import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './gitlab-ci-run.css'

/* Continuous-Integration.pdf s. 8 (sekvensdiagrammet "Trigger sequence", ordret),
   s. 12 (.gitlab-ci.yml), s. 13 (jobbets trin). Testnavnene er fra
   calculatortestsolution-1.0.10 (CalculatorUnitTests.cs), inkl. stavefejlen
   "Nunmbers". GitLab CI - Exercise.pdf s. 2: fire grunde til en fejlet pipeline
   og mail ved fejl. */

const PARTS = ['User', 'Local Files', 'Local Repo', 'GitLab Git Server', 'GitLab CI Server', 'GitLab Runner']

type Msg = { from: number; to: number; label: string; step: number; reply?: boolean }
const MSGS: Msg[] = [
  { from: 0, to: 1, label: 'Code and Test', step: 1 },
  { from: 1, to: 2, label: 'commit', step: 1 },
  { from: 2, to: 3, label: 'push', step: 1 },
  { from: 3, to: 4, label: 'Trigger', step: 2 },
  { from: 4, to: 5, label: 'Run job', step: 2 },
  { from: 5, to: 3, label: 'pull', step: 3 },
  { from: 5, to: 5, label: 'build and run tests', step: 3 },
  { from: 5, to: 4, label: 'Test Results', step: 4, reply: true },
  { from: 4, to: 0, label: 'Test Report', step: 4, reply: true },
]

const SCRIPT = [
  { k: 'image: ', v: 'mcr.microsoft.com/dotnet/sdk:10.0' },
  { k: '- ', v: "'dotnet clean'" },
  { k: '- ', v: "'dotnet build'" },
  { k: '- ', v: `'dotnet test --logger:"junit;MethodFormat=Class;FailureBodyFormat=Verbose"'` },
]

const TESTS = [
  'Add_AddPosAndNegNumbers_ResultIsCorrect',
  'Subtract_SubtractPosAndNegNumbers_ResultIsCorrect',
  'Multiply_MultiplyNunmbers_ResultIsCorrect',
  'Power_RaiseNumbers_ResultIsCorrect',
]

const FAILS = [
  <span>
    fejl i <code>.gitlab-ci.yml</code>
  </span>,
  <span>compile-/build-fejl</span>,
  <span>fejl i afviklingen af testene</span>,
  <span>tests der kører, men fejler</span>,
]

/** Brudpunkter efter _ ; : / og punktum — aldrig midt i et ord. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[_;:/.])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

function Actor() {
  return (
    <svg className="ci-actor" viewBox="0 0 14 18" aria-hidden="true">
      <circle cx="7" cy="3.4" r="2.6" />
      <path d="M7 6v6M2 8.4h10M7 12l-4 5M7 12l4 5" />
    </svg>
  )
}

function Message({ m, i, step }: { m: Msg; i: number; step: number }) {
  const shown = step >= m.step
  const now = step === m.step
  const row = i + 2
  const delay = now ? (MSGS.filter((x) => x.step === m.step).indexOf(m) * 0.45) : 0

  if (m.from === m.to) {
    return (
      <div className="ci-msg ci-self" style={{ gridRow: row, gridColumn: `${m.from + 1}` }} data-now={now || undefined}>
        <motion.span
          className="ci-msg-label"
          initial={false}
          animate={{ opacity: shown ? 1 : 0 }}
          transition={shown ? { ...t.fade, delay: delay + 0.3 } : t.fade}
        >
          {m.label}
        </motion.span>
        <motion.span
          className="ci-loop"
          initial={false}
          animate={{ opacity: shown ? 1 : 0, scaleX: shown ? 1 : 0 }}
          transition={shown ? { ...t.travel, delay } : t.fade}
        />
      </div>
    )
  }

  const lo = Math.min(m.from, m.to)
  const hi = Math.max(m.from, m.to)
  const span = hi - lo + 1
  const leftward = m.to < m.from
  const inset = `calc(100% / ${span * 2})`
  return (
    <div
      className="ci-msg"
      data-now={now || undefined}
      data-reply={m.reply || undefined}
      data-left={leftward || undefined}
      style={{ gridRow: row, gridColumn: `${lo + 1} / span ${span}`, ['--in' as string]: inset }}
    >
      <motion.span
        className="ci-msg-label"
        initial={false}
        animate={{ opacity: shown ? 1 : 0 }}
        transition={shown ? { ...t.fade, delay: delay + 0.25 } : t.fade}
      >
        {m.label}
      </motion.span>
      <motion.span
        className="ci-line"
        style={{ transformOrigin: leftward ? 'right center' : 'left center' }}
        initial={false}
        animate={{ scaleX: shown ? 1 : 0, opacity: shown ? 1 : 0 }}
        transition={shown ? { ...t.travel, delay } : t.fade}
      />
    </div>
  )
}

function CiRun({ step }: { step: number }) {
  const scripting = step === 3
  const scriptDone = step >= 3
  const report = step >= 4
  const fails = step >= 5

  return (
    <div className="ci">
      <div className="ci-seq" role="img" aria-label="Sekvensdiagram: Trigger sequence">
        {PARTS.map((p, i) => (
          <Fragment key={p}>
            <div className="ci-part" style={{ gridColumn: i + 1 }} data-actor={i === 0 || undefined}>
              {i === 0 && <Actor />}
              <span>{p}</span>
            </div>
            <div className="ci-life" style={{ gridColumn: i + 1 }} />
          </Fragment>
        ))}
        <motion.div
          className="ci-act"
          style={{ gridColumn: 6, gridRow: '6 / 10' }}
          initial={false}
          animate={{ opacity: step >= 2 ? 1 : 0 }}
          transition={t.fade}
        />
        {MSGS.map((m, i) => (
          <Message key={i} m={m} i={i} step={step} />
        ))}
      </div>

      <div className="ci-panels">
        <div className="ci-panel" data-hot={scripting || undefined}>
          <div className="ci-panel-head">
            <span className="ci-panel-name">GitLab Runner</span>
            <code>build-and-test</code>
          </div>
          <ol className="ci-script">
            {SCRIPT.map((l, i) => (
              <motion.li
                key={i}
                className="ci-line-code"
                initial={false}
                animate={{ opacity: scriptDone ? 1 : 0.35 }}
                transition={scripting ? stagger(i, 0.3, 0.45) : t.fade}
                data-hot={scripting || undefined}
              >
                <motion.span
                  className="ci-bar"
                  initial={false}
                  animate={{ scaleY: scriptDone ? 1 : 0 }}
                  transition={scripting ? stagger(i, 0.3, 0.45) : t.fade}
                />
                <code>
                  <span className="ci-k">{l.k}</span>
                  {brk(l.v)}
                </code>
              </motion.li>
            ))}
          </ol>
        </div>

        <div className="ci-panel ci-report" data-hot={step === 4 || undefined}>
          <div className="ci-panel-head">
            <span className="ci-panel-name">Test Report</span>
            <code>CalculatorUnitTests</code>
          </div>
          <motion.span
            className="ci-empty"
            initial={false}
            animate={{ opacity: report ? 0 : 1 }}
            transition={t.fade}
            aria-hidden={report || undefined}
          >
            venter på Test Results …
          </motion.span>
          <motion.ul
            className="ci-tests"
            initial={false}
            animate={{ opacity: report ? 1 : 0 }}
            transition={report ? { ...t.fade, delay: 0.35 } : t.fade}
          >
            {TESTS.map((n, i) => (
              <li key={n}>
                <motion.span
                  className="ci-check"
                  initial={false}
                  animate={{ opacity: report ? 1 : 0, scale: report ? 1 : 0.6 }}
                  transition={report ? stagger(i, 0.5, 0.12) : t.fade}
                >
                  ✓
                </motion.span>
                <code>{brk(n)}</code>
              </li>
            ))}
          </motion.ul>
          <div className="ci-status">
            <Tag show={report} tone="focus">
              Passed
            </Tag>
            <span className="ci-junit">JUnit-format · JunitXml.TestLogger</span>
          </div>
        </div>
      </div>

      <motion.div
        className="ci-fails"
        initial={false}
        animate={{ opacity: fails ? 1 : 0, y: fails ? 0 : 4 }}
        transition={fails ? t.settle : t.fade}
        aria-hidden={!fails || undefined}
      >
        <span className="ci-fails-head">
          Pipelinen bliver <b>Failed</b> ved:
        </span>
        <div className="ci-fails-tags">
          {FAILS.map((f, i) => (
            <motion.span
              key={i}
              initial={false}
              animate={{ opacity: fails ? 1 : 0 }}
              transition={fails ? stagger(i, 0.15, 0.12) : t.fade}
            >
              <Tag tone="neg" wrap>
                {f}
              </Tag>
            </motion.span>
          ))}
        </div>
        <span className="ci-mail">✉ Man får en mail, når noget fejler.</span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'gitlab-ci-run',
  title: 'Et push kører gennem GitLab CI',
  steps: [
    {
      caption: 'Seks deltagere fra kursets sekvensdiagram: udvikleren, de lokale filer og repositoriet, og GitLabs git-server, CI-server og runner.',
      hold: 2400,
    },
    { caption: 'Udvikleren koder og tester, committer lokalt og **pusher** til GitLab.', hold: 2200 },
    {
      caption: 'Pushet **trigger** CI-serveren, som beder en **runner** køre jobbet `build-and-test` fra `.gitlab-ci.yml`.',
      hold: 2400,
    },
    {
      caption: 'Runneren starter et image med .NET SDK, **puller** koden og bygger fra bunden: `dotnet clean`, `dotnet build`, `dotnet test`.',
      hold: 3000,
    },
    {
      caption: 'JUnit-loggeren skriver resultatet. Runneren sender **Test Results** til CI-serveren, som viser en **Test Report**: alt er *Passed*.',
      hold: 2800,
    },
    {
      caption:
        'Pipelinen fejler af en af fire grunde, og man får en mail. GitLab CI-øvelsen i 02.1 sætter netop dette op på Calculator; aflevering 1 hedder **CI-kørekort**.',
      hold: 3000,
    },
  ],
  Component: CiRun,
}

export default viz
