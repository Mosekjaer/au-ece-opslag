import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './merge-rebase.css'

/* Git-Workflows.pdf s. 35 (merge uden fast-forward, "M contains E and F"),
   s. 36 (fast-forward: main A B, feature F G), s. 37 (squash, "S contains changes
   from F-G in 1 commit"), s. 38–39 (rebase: F′ G′ oven på E, "creates new commits
   (and destroys old ones)"), s. 40 (merge: non-destructive; rebase: clean linear
   history), s. 41 (anbefalingen). Slide 35 viser kun F på featuren; her har den F
   og G som på s. 36–39. */

const SLOTS = 8
const MAIN_Y = 2.3 // rem, centrum af main-sporet
const FEAT_Y = 6.1 // rem, centrum af feature-sporet
const H = 8.5 // rem, grafens højde

type Lane = 0 | 1
const laneY = (l: Lane) => (l === 0 ? MAIN_Y : FEAT_Y)
const x = (slot: number) => `${((slot + 0.5) / SLOTS) * 100}%`

type Commit = { id: string; label: string; lane: Lane; slot: number; kind?: 'merge' | 'squash' | 'new' }
const COMMITS: Commit[] = [
  { id: 'A', label: 'A', lane: 0, slot: 0 },
  { id: 'B', label: 'B', lane: 0, slot: 1 },
  { id: 'C', label: 'C', lane: 0, slot: 2 },
  { id: 'D', label: 'D', lane: 0, slot: 3 },
  { id: 'E', label: 'E', lane: 0, slot: 4 },
  { id: 'M', label: 'M', lane: 0, slot: 5, kind: 'merge' },
  { id: 'S', label: 'S', lane: 0, slot: 5, kind: 'squash' },
  { id: 'M2', label: 'M', lane: 0, slot: 7, kind: 'merge' },
  { id: 'F', label: 'F', lane: 1, slot: 2 },
  { id: 'G', label: 'G', lane: 1, slot: 3 },
  { id: 'F2', label: 'F′', lane: 1, slot: 5, kind: 'new' },
  { id: 'G2', label: 'G′', lane: 1, slot: 6, kind: 'new' },
]
const byId = Object.fromEntries(COMMITS.map((c) => [c.id, c]))

type Edge = { id: string; from: string; to: string; label?: string; dashed?: boolean }
const EDGES: Edge[] = [
  { id: 'main-AB', from: 'A', to: 'B' },
  { id: 'main-BE', from: 'B', to: 'E' },
  { id: 'main-EM', from: 'E', to: 'M' },
  { id: 'main-ES', from: 'E', to: 'S' },
  { id: 'main-EM2', from: 'E', to: 'M2' },
  { id: 'feat', from: 'F', to: 'G' },
  { id: 'feat2', from: 'F2', to: 'G2' },
  { id: 'branch', from: 'B', to: 'F', label: 'branch' },
  { id: 'merge', from: 'G', to: 'M', label: 'merge' },
  { id: 'ff', from: 'B', to: 'F', label: 'fast-forward' },
  { id: 'squash', from: 'G', to: 'S', label: 'squash', dashed: true },
  { id: 'rebase', from: 'E', to: 'F2', label: 'rebase' },
  { id: 'merge2', from: 'G2', to: 'M2', label: 'merge' },
]

/** Hvad der findes i hvert trin. ghost = lagt til side / ødelagt. */
type Frame = { commits: string[]; ghosts?: string[]; edges: string[]; ghostEdges?: string[]; main: string; feat: string }
const FRAMES: Frame[] = [
  { commits: ['A', 'B', 'C', 'D', 'E', 'F', 'G'], edges: ['main-AB', 'main-BE', 'feat', 'branch'], main: 'E', feat: 'G' },
  { commits: ['A', 'B', 'C', 'D', 'E', 'M', 'F', 'G'], edges: ['main-AB', 'main-BE', 'main-EM', 'feat', 'branch', 'merge'], main: 'M', feat: 'G' },
  { commits: ['A', 'B', 'F', 'G'], edges: ['main-AB', 'feat', 'ff'], main: 'G', feat: 'G' },
  { commits: ['A', 'B', 'C', 'D', 'E', 'S', 'F', 'G'], edges: ['main-AB', 'main-BE', 'main-ES', 'feat', 'branch', 'squash'], main: 'S', feat: 'G' },
  {
    commits: ['A', 'B', 'C', 'D', 'E', 'F2', 'G2'],
    ghosts: ['F', 'G'],
    edges: ['main-AB', 'main-BE', 'feat2', 'rebase'],
    ghostEdges: ['feat', 'branch'],
    main: 'E',
    feat: 'G2',
  },
  { commits: ['A', 'B', 'C', 'D', 'E', 'M2', 'F2', 'G2'], edges: ['main-AB', 'main-BE', 'main-EM2', 'feat2', 'rebase', 'merge2'], main: 'M2', feat: 'G2' },
]

function Graph({ step }: { step: number }) {
  const f = FRAMES[step]
  const has = (id: string) => f.commits.includes(id)
  const ghost = (id: string) => f.ghosts?.includes(id) ?? false
  const mainC = byId[f.main]
  const featC = byId[f.feat]
  // main-etiketten sidder over sin commit; står den på en feature-commit (fast-forward), sidder den mellem sporene.
  const mainTop = mainC.lane === 0 ? MAIN_Y - 2.05 : FEAT_Y - 2.05
  const shift = (slot: number) => (slot >= 7 ? '-78%' : '-50%')

  return (
    <div className="mrb-graph" style={{ height: `${H}rem` }}>
      <svg className="mrb-edges" viewBox={`0 0 ${SLOTS} ${H}`} preserveAspectRatio="none" aria-hidden="true">
        {EDGES.map((e) => {
          const a = byId[e.from]
          const b = byId[e.to]
          const on = f.edges.includes(e.id)
          const gh = f.ghostEdges?.includes(e.id) ?? false
          const cross = a.lane !== b.lane
          return (
            <motion.line
              key={e.id}
              x1={a.slot + 0.5}
              y1={laneY(a.lane)}
              x2={b.slot + 0.5}
              y2={laneY(b.lane)}
              vectorEffect="non-scaling-stroke"
              data-cross={cross || undefined}
              data-dashed={e.dashed || gh || undefined}
              data-ghost={gh || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : gh ? 0.5 : 0 }}
              transition={on ? { ...t.fade, delay: cross ? 0.3 : 0.1 } : t.recede}
            />
          )
        })}
      </svg>

      {EDGES.filter((e) => e.label).map((e) => {
        const a = byId[e.from]
        const b = byId[e.to]
        const on = f.edges.includes(e.id)
        const mx = (a.slot + b.slot) / 2
        return (
          <motion.span
            key={e.id}
            className="mrb-elabel"
            data-kind={e.id}
            style={{ left: `${((mx + 0.5) / SLOTS) * 100}%`, top: `${(MAIN_Y + FEAT_Y) / 2}rem`, x: '-50%', y: '-50%' }}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: 0.45 } : t.fade}
          >
            {e.label}
          </motion.span>
        )
      })}

      {COMMITS.map((c) => {
        const on = has(c.id)
        const gh = ghost(c.id)
        return (
          <motion.span
            key={c.id}
            className="mrb-commit"
            data-kind={c.kind}
            data-ghost={gh || undefined}
            style={{ left: x(c.slot), top: `${laneY(c.lane)}rem`, x: '-50%', y: '-50%' }}
            initial={false}
            animate={{ opacity: on ? 1 : gh ? 0.55 : 0, scale: on || gh ? 1 : 0.6 }}
            transition={on ? { ...t.place, delay: c.kind ? 0.45 : 0 } : t.recede}
            aria-hidden={!on || undefined}
          >
            {c.label}
          </motion.span>
        )
      })}

      <motion.span
        className="mrb-head"
        initial={false}
        animate={{ left: x(mainC.slot), top: `${mainTop}rem`, x: shift(mainC.slot) }}
        transition={{ ...t.travel, delay: 0.35 }}
      >
        main
      </motion.span>
      <motion.span
        className="mrb-head is-feat"
        initial={false}
        animate={{ left: x(featC.slot), top: `${FEAT_Y + 1.05}rem`, x: shift(featC.slot) }}
        transition={{ ...t.travel, delay: 0.35 }}
      >
        feature/delta
      </motion.span>
    </div>
  )
}

function Cmd({ a, b }: { a: string; b: string }) {
  return (
    <span className="mrb-cmd-code">
      <code>{a}</code>
      <code>{b}</code>
    </span>
  )
}

const CMDS: ReactNode[] = [
  <span key="0" className="mrb-cmd-note">
    divergeret historik: begge branches har commits efter B
  </span>,
  <Cmd key="1" a="git checkout main" b="git merge feature/delta" />,
  <Cmd key="2" a="git checkout main" b="git merge feature/delta" />,
  <Cmd key="3" a="git checkout main" b="git merge --squash feature/delta" />,
  <Cmd key="4" a="git checkout feature/delta" b="git rebase main" />,
  <span key="5" className="mrb-cmd-note">
    <b>rebase</b>, når feature branchen opdateres · <b>merge</b>, når <code>main</code> opdateres
  </span>,
]

const ROWS: { name: string; cmd: string; what: ReactNode; step: number }[] = [
  {
    name: 'merge (no-ff)',
    cmd: 'git merge feature/delta',
    what: (
      <>
        merge-commit <b>M</b> med både E og F–G; historikken bevares
      </>
    ),
    step: 1,
  },
  {
    name: 'fast-forward',
    cmd: 'git merge feature/delta',
    what: (
      <>
        kun uden divergens: <code>main</code> flyttes bare frem til G
      </>
    ),
    step: 2,
  },
  {
    name: 'squash',
    cmd: 'git merge --squash feature/delta',
    what: (
      <>
        <b>S</b> indeholder F–G i én commit
      </>
    ),
    step: 3,
  },
  {
    name: 'rebase',
    cmd: 'git rebase main',
    what: (
      <>
        nye commits <b>F′ G′</b> oven på E; de gamle F G ødelægges
      </>
    ),
    step: 4,
  },
]

function MergeRebase({ step }: { step: number }) {
  const last = FRAMES.length - 1
  return (
    <div className="mrb">
      <div className="mrb-stage">
        <Swap className="mrb-cmd" show={step} items={CMDS} />
        <Graph step={step} />
        <motion.div
          className="mrb-verdict"
          initial={false}
          animate={{ opacity: step === last ? 1 : 0 }}
          transition={step === last ? { ...t.fade, delay: 0.6 } : t.fade}
          aria-hidden={step !== last || undefined}
        >
          <span>
            <Tag tone="focus">rebase</Tag> clean history
          </span>
          <span>
            <Tag tone="focus">merge</Tag> non-destructive
          </span>
        </motion.div>
      </div>

      <ol className="mrb-rows">
        {ROWS.map((r, i) => {
          const on = step >= r.step
          return (
            <motion.li
              key={r.name}
              className="mrb-row"
              data-now={step === r.step || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
              transition={on ? stagger(0, 0.25) : t.fade}
              aria-hidden={!on || undefined}
            >
              <span className="mrb-row-n">{i + 1}</span>
              <span className="mrb-row-name">{r.name}</span>
              <code className="mrb-row-cmd">{r.cmd}</code>
              <span className="mrb-row-what">{r.what}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'merge-rebase',
  title: 'Samme historik integreret på fire måder',
  steps: [
    {
      caption: '`main` (A–E) og `feature/delta` (F, G) er gået hver sin vej fra B. Historikken er *divergeret*.',
      hold: 2200,
    },
    {
      caption: '`git merge feature/delta` på `main` laver merge-committen **M**, der indeholder E og featurens commits. Historikken bevares.',
      hold: 2800,
    },
    {
      caption: 'Er `main` ikke gået videre end B, er der ingen divergens: **fast-forward** flytter bare `main` frem til G. Ingen merge-commit.',
      hold: 2800,
    },
    { caption: '`git merge --squash` samler ændringerne fra F–G i én commit **S** på `main`.', hold: 2400 },
    {
      caption: '`git rebase main` fra featuren: F og G lægges til side og genanvendes som **nye** commits F′ G′ oven på E. De gamle forsvinder.',
      hold: 3000,
    },
    {
      caption: 'Kursets anbefaling: **rebase**, når feature branchen opdateres fra `main`; **merge**, når `main` opdateres med featuren.',
      hold: 3000,
    },
  ],
  Component: MergeRebase,
}

export default viz
