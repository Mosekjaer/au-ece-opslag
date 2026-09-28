import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Swap, Tag, Token, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './git-states.css'

/* GitWorkflow.pdf s. 4 (working directory → staging area → git directory),
   s. 5 (filtilstandene untracked/unmodified/modified/staged), s. 6 (Add, Commit,
   Pull, Test!, Push mod remote), s. 7 (pull–push work flow, 10 punkter).
   Filen Calculator.cs er fra kursets Calculator-løsning. "din commit" og
   "makkers commit" er beskrivende etiketter, ikke data fra materialet. */

/* Rækkefølgen fra s. 5: untracked | tracked: unmodified, modified, staged. */
const FILE_STATES = ['untracked', 'unmodified', 'modified', 'staged'] as const
const fileState = (s: number) => (s === 0 ? 0 : s === 1 ? 3 : s === 3 ? 2 : 1)

const CYCLE = ['kod', 'test', 'commit', 'pull', 'løs konflikter', 'test', 'commit', 'push']
const CYCLE_NOW: number[][] = [[0, 1], [2], [2], [0], [1, 2], [3, 4], [5, 6], [7]]

/** Et element, der først er synligt fra et bestemt trin; pladsen er reserveret. */
function Hidden({ children }: { children: ReactNode }) {
  return (
    <span className="gs-hide" aria-hidden="true">
      {children}
    </span>
  )
}

function Col({
  title,
  sub,
  hot,
  children,
}: {
  title: string
  sub: string
  hot: boolean
  children: ReactNode
}) {
  return (
    <div className="gs-col" data-hot={hot || undefined}>
      <div className="gs-col-head">
        <span className="gs-col-title">{title}</span>
        <span className="gs-col-sub">{sub}</span>
      </div>
      <div className="gs-col-body">{children}</div>
    </div>
  )
}

function GitStates({ step }: { step: number }) {
  const last = 7
  const tone = (active: boolean): Tone => (active ? 'focus' : 'idle')

  // Snapshot 1: skjult i working directory → staging (trin 1) → commit i repo (trin 2+).
  const snap1 =
    step === 0 ? 'wd' : step === 1 ? 'stage' : 'repo'
  // Snapshot 2: stages og committes i ét trin (trin 4).
  const snap2 = step < 4 ? 'wd' : 'repo'
  // Makkerens commit hentes ved pull (trin 5).
  const mate = step < 5 ? 'remote' : 'repo'
  // Push kopierer de lokale commits til remote (trin 7).
  const pushed = step >= 7

  const t1 = <Token id="gs-c1" tone={step === 1 || step === 2 ? 'focus' : 'idle'}>{step <= 1 ? 'Calculator.cs' : 'din commit'}</Token>
  const t2 = <Token id="gs-c2" tone={step === 4 ? 'focus' : 'idle'}>din commit</Token>
  const tm = <Token id="gs-mate" tone={step === 5 ? 'focus' : 'idle'}>makkers commit</Token>

  const mergeShow = step >= 5
  const mergeDone = step >= 6

  const pushTok = (id: string, label: string) => (
    <Token id={id} tone={step === 7 ? 'focus' : 'idle'}>
      {label}
    </Token>
  )

  return (
    <div className="gs">
      <div className="gs-flow">
        <Col title="working directory" sub="filerne på disken" hot={step === 0 || step === 3}>
          <div className="gs-file" data-state={FILE_STATES[fileState(step)]}>
            <code className="gs-file-name">Calculator.cs</code>
            <ul className="gs-states" aria-label="Filtilstande">
              {FILE_STATES.map((s, i) => (
                <li key={s} className="gs-state" data-now={i === fileState(step) || undefined} data-neg={s === 'untracked' || undefined}>
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="gs-origin">
            {snap1 === 'wd' && <Hidden>{t1}</Hidden>}
            {snap2 === 'wd' && <Hidden>{t2}</Hidden>}
          </div>
        </Col>

        <Link on={step >= 1} tone={tone(step === 1 || step === 4)} label={<code>git add</code>} className="gs-op" />

        <Col title="staging area" sub="næste snapshot" hot={step === 1}>
          <div className="gs-slot">{snap1 === 'stage' && t1}</div>
        </Col>

        <Link on={step >= 2} tone={tone(step === 2 || step === 4)} label={<code>git commit</code>} className="gs-op" />

        <Col title="repository" sub="lokalt · git directory" hot={step === 2 || step === 4 || step === 5 || step === 6}>
          <div className="gs-list">
            <div className="gs-slot">
              {snap1 === 'repo' ? t1 : <span className="gs-ph" />}
              {!pushed && <Hidden>{pushTok('gs-p1', 'din commit')}</Hidden>}
            </div>
            <div className="gs-slot">
              {snap2 === 'repo' ? t2 : <span className="gs-ph" />}
              {!pushed && <Hidden>{pushTok('gs-p2', 'din commit')}</Hidden>}
            </div>
            <div className="gs-slot">{mate === 'repo' ? tm : <span className="gs-ph" />}</div>
            <div className="gs-slot">
              <motion.span
                className="gs-merge"
                data-done={mergeDone || undefined}
                initial={false}
                animate={{ opacity: mergeShow ? 1 : 0, scale: mergeShow ? 1 : 0.9 }}
                transition={mergeShow ? { ...t.place, delay: step === 5 ? 0.7 : 0 } : t.fade}
              >
                {mergeDone ? 'merge-commit' : 'merge …'}
              </motion.span>
              {!pushed && <Hidden>{pushTok('gs-p3', 'merge-commit')}</Hidden>}
            </div>
          </div>
          <Swap
            className="gs-test"
            show={step < 5 ? 0 : step === 5 ? 1 : 2}
            items={[
              <span key="n" />,
              <Tag key="u" tone="idle" wrap>
                ikke testet sammen
              </Tag>,
              <Tag key="g" tone="focus" wrap>
                ✓ testet efter pull
              </Tag>,
            ]}
          />
        </Col>

        <div className="gs-sync">
          <Link on={step >= 7} tone={tone(step === 7)} label={<code>git push</code>} className="gs-op" />
          <Link on={step >= 5} back tone={tone(step === 5)} label={<code>git pull</code>} className="gs-op" />
        </div>

        <Col title="remote" sub="GitLab · fælles" hot={step === 5 || step === 7}>
          <div className="gs-list">
            <div className="gs-slot">
              <Token id="gs-mate-remote" tone="idle">
                makkers commit
              </Token>
              {mate === 'remote' && <Hidden>{tm}</Hidden>}
            </div>
            <div className="gs-slot">{pushed ? pushTok('gs-p1', 'din commit') : <span className="gs-ph" />}</div>
            <div className="gs-slot">{pushed ? pushTok('gs-p2', 'din commit') : <span className="gs-ph" />}</div>
            <div className="gs-slot">{pushed ? pushTok('gs-p3', 'merge-commit') : <span className="gs-ph" />}</div>
          </div>
        </Col>
      </div>

      <div className="gs-cycle-wrap">
        <ol className="gs-cycle" aria-label="Pull–test–push">
          {CYCLE.map((c, i) => {
            const now = CYCLE_NOW[step]?.includes(i)
            return (
              <li key={i} className="gs-cycle-step">
                {i > 0 && (
                  <span className="gs-cycle-arrow" aria-hidden="true">
                    →
                  </span>
                )}
                <span className="gs-cycle-item" data-now={now || undefined} data-done={step === last || undefined}>
                  <span className="gs-cycle-n">{i + 1}</span>
                  {c}
                </span>
              </li>
            )
          })}
        </ol>
        <motion.p
          className="gs-loop"
          initial={false}
          animate={{ opacity: step === last ? 1 : 0, y: step === last ? 0 : 4 }}
          transition={step === last ? stagger(0, 0.6) : t.fade}
          aria-hidden={step !== last || undefined}
        >
          <span className="gs-loop-mark">↺</span> Har nogen pushet siden sidste pull, så start forfra fra <b>pull</b>.
        </motion.p>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'git-states',
  title: 'En ændring fra working directory til remote',
  steps: [
    {
      caption: '`Calculator.cs` er ny i working directory og *untracked*: Git kender den ikke endnu. Den kodes og testes lokalt.',
      hold: 2200,
    },
    { caption: '`git add` stager filen. Et snapshot ligger nu i staging area, og filen er *staged*.', hold: 2000 },
    {
      caption: '`git commit` gemmer snapshottet i det lokale repository. Filen er *unmodified* — ens med seneste commit.',
      hold: 2400,
    },
    { caption: 'En ny rettelse gør filen *modified*. Den skal testes og committes, før den kan deles.', hold: 2000 },
    {
      caption: 'Testene er grønne, og rettelsen committes. Visual Studios “Commit” stager og committer i ét trin.',
      hold: 2400,
    },
    {
      caption: '**Pull**: en makker har pushet i mellemtiden. Makkerens commit hentes og merges ind; konflikter løses her.',
      hold: 2800,
    },
    {
      caption: '**Test igen**: først nu kører din kode sammen med makkerens. Når alt er grønt, committes merget.',
      hold: 2600,
    },
    {
      caption: '**Push**: remote får kun kode, der er testet sammen. Har nogen pushet siden sidste pull, starter man forfra fra pull.',
      hold: 3000,
    },
  ],
  Component: GitStates,
}

export default viz
