import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, Token } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './merge-request.css'

/* GitWorkflow-GitlabMergeRequestExample.pdf s. 2 (MR !1 "Buzzer", pipeline #266564,
   coverage 97.50 % (−2.50 %)), s. 3 og 5 (Timer.cs linje +24 til +32 uden coverage,
   kommentaren), s. 6 ("Will do", tråden løst), s. 7 (pipeline #266576, 100.00 %,
   "All threads resolved!", Approve / "Approval is optional"), s. 8 (repository-grafen
   med commit-beskederne, powertube og merge-committen). Grafen er vist oldest øverst;
   GitLab viser den nyeste øverst. Git-Workflows.pdf s. 16: "Feature branch is
   automatically merged into main" efter godkendelsen. */

type Lane = 0 | 1 | 2 // main, buzzer, powertube
const ROWS: { lane: Lane; msg: string; step: number }[] = [
  { lane: 0, msg: 'Initial commit', step: 0 },
  { lane: 0, msg: 'initial add', step: 0 },
  { lane: 0, msg: 'adding images', step: 0 },
  { lane: 0, msg: 'updated readme', step: 0 },
  { lane: 1, msg: 'adding buzzer feature', step: 1 },
  { lane: 1, msg: 'added test for new timer start method', step: 1 },
  { lane: 2, msg: 'adding power level variable', step: 1 },
  { lane: 1, msg: 'adding timer constructor', step: 1 },
  { lane: 1, msg: 'removed unused timer overload', step: 4 },
  { lane: 0, msg: "Merge branch 'buzzer' into 'main'", step: 5 },
]
const N = ROWS.length

/** Segmenter i lane-enheder (x = lane + 0.5, y = række + 0.5). */
const SEGS: { d: string; lane: Lane; step: number }[] = [
  { d: 'M0.5 0.5 V3.5', lane: 0, step: 0 },
  { d: 'M0.5 3.5 L1.5 4.5 V7.5', lane: 1, step: 1 },
  { d: 'M0.5 3.5 L2.5 4.5 V6.5', lane: 2, step: 1 },
  { d: 'M1.5 7.5 V8.5', lane: 1, step: 4 },
  { d: 'M0.5 3.5 V9.5', lane: 0, step: 5 },
  { d: 'M1.5 8.5 L0.5 9.5', lane: 1, step: 5 },
]

function Heads({ row, step }: { row: number; step: number }) {
  const main = step >= 5 ? 9 : 3
  const buzzer = step >= 4 ? 8 : step >= 1 ? 7 : 3
  const out: ReactNode[] = []
  if (row === main)
    out.push(
      <Token key="m" id="mr-head-main" tone="idle">
        main
      </Token>,
    )
  if (row === buzzer)
    out.push(
      <Token key="b" id="mr-head-buzzer" tone={step >= 1 && step <= 4 ? 'focus' : 'idle'}>
        buzzer
      </Token>,
    )
  if (row === 6 && step >= 1)
    out.push(
      <Token key="p" id="mr-head-power" tone="muted">
        powertube
      </Token>,
    )
  return <>{out}</>
}

function Graph({ step }: { step: number }) {
  return (
    <div className="mr-graph" style={{ ['--rows' as string]: N }}>
      <svg className="mr-lanes" viewBox={`0 0 3 ${N}`} preserveAspectRatio="none" aria-hidden="true">
        {SEGS.map((s, i) => (
          <motion.path
            key={i}
            d={s.d}
            data-lane={s.lane}
            vectorEffect="non-scaling-stroke"
            initial={false}
            animate={{ opacity: step >= s.step ? 1 : 0 }}
            transition={step >= s.step ? { ...t.fade, delay: s.step === step ? 0.15 : 0 } : t.fade}
          />
        ))}
      </svg>
      {ROWS.map((r, i) => {
        const shown = step >= r.step
        const fresh = r.step === step && step > 0
        return (
          <div key={i} className="mr-row" data-lane={r.lane} data-fresh={fresh || undefined}>
            <motion.span
              className="mr-dot"
              style={{ ['--lane' as string]: r.lane }}
              initial={false}
              animate={{ opacity: shown ? 1 : 0, scale: shown ? 1 : 0.4 }}
              transition={shown ? stagger(i % 4, fresh ? 0.25 : 0, 0.12) : t.fade}
            />
            <motion.span
              className="mr-msg"
              initial={false}
              animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -4 }}
              transition={shown ? stagger(i % 4, fresh ? 0.3 : 0, 0.12) : t.fade}
            >
              {r.msg}
            </motion.span>
            <span className="mr-heads">
              <Heads row={i} step={step} />
            </span>
          </div>
        )
      })}
    </div>
  )
}

function Reveal({ on, delay = 0, children, className }: { on: boolean; delay?: number; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
      transition={on ? { ...t.settle, delay } : t.fade}
      aria-hidden={!on || undefined}
    >
      {children}
    </motion.div>
  )
}

function Card({ step }: { step: number }) {
  const open = step >= 2
  const merged = step >= 5
  const reviewed = step >= 3
  const fixed = step >= 4
  return (
    <div className="mr-card" data-open={open || undefined}>
      <Reveal on={open} className="mr-head">
        <div className="mr-title">
          <span className="mr-iid">!1</span>
          <span className="mr-name">Buzzer</span>
          <Swap
            className="mr-state"
            show={merged ? 1 : 0}
            items={[
              <Tag key="o" tone="focus">
                Open
              </Tag>,
              <Tag key="m" tone="idle">
                merges ind i main
              </Tag>,
            ]}
          />
        </div>
        <div className="mr-sub">
          requested to merge <code>buzzer</code> into <code>main</code>
        </div>
      </Reveal>

      <div className="mr-block mr-pipes">
        <Reveal on={open} delay={0.25}>
          <div className="mr-pipe" data-hot={step === 2 || undefined}>
            <span className="mr-ok">✓</span>
            <span>
              Pipeline <b>#266564</b> passed
              <span className="mr-cov">
                Test coverage 97,50 % <span className="mr-drop">(−2,50 %)</span>
              </span>
            </span>
          </div>
        </Reveal>
        <Reveal on={fixed} delay={0.35}>
          <div className="mr-pipe" data-hot={step === 4 || undefined}>
            <span className="mr-ok">✓</span>
            <span>
              Pipeline <b>#266576</b> passed · efter rettelsen
              <span className="mr-cov">Test coverage 100,00 % (0,00 %)</span>
            </span>
          </div>
        </Reveal>
      </div>

      <Reveal on={reviewed} className="mr-block mr-changes">
        <div className="mr-file">
          <span className="vcaps">Changes</span>
          <code>
            Microwave.Classes/
            <wbr />
            Boundary/
            <wbr />
            Timer.cs
          </code>
        </div>
        <div className="mr-diff" data-gone={fixed || undefined}>
          <span className="mr-lines">+24 … +32</span>
          <code className="mr-code">public Timer(double interval)</code>
          <span className="mr-nocov">No test coverage</span>
        </div>
        <div className="mr-thread" data-resolved={fixed || undefined}>
          <p className="mr-comment">“No coverage, but overload is not used either, why not delete?”</p>
          <Reveal on={fixed} className="mr-reply">
            <p>“Will do”</p>
          </Reveal>
          <Swap
            className="mr-resolve"
            show={fixed ? 1 : 0}
            items={[
              <Tag key="r" tone="idle">
                Resolve thread
              </Tag>,
              <Tag key="a" tone="focus">
                ✓ All threads resolved!
              </Tag>,
            ]}
          />
        </div>
      </Reveal>

      <Reveal on={merged} className="mr-block mr-approve">
        <span className="mr-btn">Approve</span>
        <span className="mr-optional">Approval is optional</span>
        <span className="mr-merge">
          → “Feature branch is automatically merged into main”: <code>Merge branch 'buzzer' into 'main'</code>
        </span>
      </Reveal>
    </div>
  )
}

function MergeRequest({ step }: { step: number }) {
  return (
    <div className="mr">
      <div className="mr-left">
        <span className="vcaps">MicrowaveOven · Graph</span>
        <Graph step={step} />
      </div>
      <div className="mr-right">
        <span className="vcaps">Merge request</span>
        <Card step={step} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'merge-request',
  title: 'Feature branch gennem en merge request',
  steps: [
    {
      caption: '`main` har fire commits. Branchen `buzzer` oprettes fra `main` til buzzer-featuren i aflevering 3.',
      hold: 2200,
    },
    {
      caption: 'Featuren committes på `buzzer`, og branchen pushes. Parallelt arbejdes der på `powertube`.',
      hold: 2400,
    },
    {
      caption: 'Merge request `!1` “Buzzer” oprettes. Pipelinen kører på branchen og består, men coverage er faldet til 97,50 %.',
      hold: 2800,
    },
    {
      caption: 'Under *Changes* er konstruktøren `Timer(double interval)` rød: ingen coverage. Revieweren markerer linjerne og kommenterer.',
      hold: 3000,
    },
    {
      caption: 'Svaret er “Will do”. Overloaden slettes og pushes, pipelinen kører igen: 100,00 %, og alle tråde er løst.',
      hold: 3000,
    },
    {
      caption: 'Revieweren kan godkende, og `buzzer` merges ind i `main`. `powertube` er endnu ikke merget.',
      hold: 3000,
    },
  ],
  Component: MergeRequest,
}

export default viz
