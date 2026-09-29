import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Node, Swap, Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './make-rebuild.css'

/* 02.2-Week_2_-_Build_Systems.pdf s. 4–9: Make sammenligner modification timestamps;
   Makefilen med hello.out: hello.o greeting.o / hello.o: hello.cpp greeting.h /
   greeting.o: greeting.cpp greeting.h; output af første `make` og
   `make: 'hello.out' is up to date.`. Anden genbygning efter en ændring i greeting.cpp
   er ikke vist på slidet; kommandoerne er reglernes egne. */

type State = 'none' | 'built' | 'fresh' | 'stale' | 'kept'
type Id = 'out' | 'ho' | 'go' | 'hc' | 'gh' | 'gc'

interface Frame {
  s: Record<Id, State>
  src: Partial<Record<Id, 'new'>>
  /** Kanter der lyser: 'hc-ho' osv. */
  hot: string[]
}

const IDLE: Record<Id, State> = { out: 'none', ho: 'none', go: 'none', hc: 'built', gh: 'built', gc: 'built' }

function frame(step: number): Frame {
  switch (step) {
    case 0:
      return { s: IDLE, src: {}, hot: [] }
    case 1:
      return { s: { ...IDLE, ho: 'fresh', go: 'fresh' }, src: {}, hot: ['hc-ho', 'gh-ho', 'gc-go', 'gh-go'] }
    case 2:
      return { s: { ...IDLE, ho: 'built', go: 'built', out: 'fresh' }, src: {}, hot: ['ho-out', 'go-out'] }
    case 3:
      return { s: { ...IDLE, ho: 'built', go: 'built', out: 'built' }, src: {}, hot: [] }
    case 4:
      return {
        s: { ...IDLE, ho: 'built', go: 'stale', out: 'stale' },
        src: { gc: 'new' },
        hot: ['gc-go', 'go-out'],
      }
    case 5:
      return {
        s: { ...IDLE, ho: 'kept', go: 'fresh', out: 'fresh' },
        src: {},
        hot: ['gc-go', 'go-out', 'ho-out'],
      }
    default:
      return { s: { ...IDLE, ho: 'built', go: 'built', out: 'built' }, src: {}, hot: [] }
  }
}

const TERM: { cmd: string; lines: string[] }[] = [
  { cmd: '$', lines: [] },
  {
    cmd: '$ make',
    lines: ['g++ -c hello.cpp -o hello.o', 'g++ -c greeting.cpp -o greeting.o', 'g++ hello.o greeting.o -o hello.out'],
  },
  { cmd: '$ make', lines: ["make: 'hello.out' is up to date."] },
  { cmd: '# greeting.cpp rettes og gemmes', lines: [] },
  { cmd: '$ make', lines: ['g++ -c greeting.cpp -o greeting.o', 'g++ hello.o greeting.o -o hello.out'] },
]
/** Terminalvariant og antal viste linjer pr. trin. */
const TERM_AT = [
  [0, 0],
  [1, 2],
  [1, 3],
  [2, 1],
  [3, 0],
  [4, 2],
  [4, 2],
]

const tone = (s: State) =>
  s === 'none' ? 'ghost' : s === 'fresh' ? 'focus' : s === 'stale' ? 'neg' : s === 'kept' ? 'muted' : 'idle'

function status(s: State) {
  const idx = s === 'stale' ? 1 : s === 'kept' ? 2 : s === 'built' ? 3 : 0
  const show = s !== 'none'
  return (
    <span className="mr-status">
      <Swap
        show={idx}
        items={[
          <Tag key="f" show={show && idx === 0}>
            bygges
          </Tag>,
          <Tag key="s" tone="neg" show={show && idx === 1}>
            forældet
          </Tag>,
          <Tag key="k" tone="muted" show={show && idx === 2}>
            urørt
          </Tag>,
          <Tag key="u" tone="idle" show={show && idx === 3}>
            up to date
          </Tag>,
        ]}
      />
    </span>
  )
}

/* Kanter mellem rækkerne. x i procent af bredden (tre kolonner: 1/6, 3/6, 5/6). */
function Edges({ edges, hot }: { edges: { id: string; x1: number; x2: number }[]; hot: string[] }) {
  return (
    <svg className="mr-edges" viewBox="0 0 300 40" preserveAspectRatio="none" aria-hidden="true">
      {edges.map((e) => {
        const on = hot.includes(e.id)
        return (
          <line
            key={e.id}
            x1={e.x1}
            y1={40}
            x2={e.x2}
            y2={0}
            vectorEffect="non-scaling-stroke"
            className="mr-edge"
            data-hot={on || undefined}
          />
        )
      })}
    </svg>
  )
}

function Make({ step }: { step: number }) {
  const f = frame(step)
  const [variant, count] = TERM_AT[Math.min(step, TERM_AT.length - 1)]
  const name = (s: string) => {
    const dot = s.lastIndexOf('.')
    return (
      <>
        {s.slice(0, dot)}
        <wbr />
        {s.slice(dot)}
      </>
    )
  }
  const n = (id: Id, file: string, sub?: string) => (
    <Node
      className="mr-node"
      tone={f.src[id] ? 'focus' : tone(f.s[id])}
      mono
      title={name(file)}
      sub={
        id === 'gc' ? (
          <Swap
            className="mr-gcsub"
            show={f.src[id] ? 1 : 0}
            items={[
              <span key="k">{sub}</span>,
              <Tag key="n" wrap show={!!f.src[id]}>
                nyere end .o
              </Tag>,
            ]}
          />
        ) : (
          sub
        )
      }
    >
      {id === 'hc' || id === 'gh' || id === 'gc' ? null : status(f.s[id])}
    </Node>
  )

  return (
    <div className="mr">
      <div className="mr-graph">
        <div className="mr-row is-top">
          <span />
          {n('out', 'hello.out', 'target (link)')}
          <span />
        </div>
        <Edges
          hot={f.hot}
          edges={[
            { id: 'ho-out', x1: 50, x2: 150 },
            { id: 'go-out', x1: 250, x2: 150 },
          ]}
        />
        <div className="mr-row">
          {n('ho', 'hello.o', 'objektfil')}
          <span />
          {n('go', 'greeting.o', 'objektfil')}
        </div>
        <Edges
          hot={f.hot}
          edges={[
            { id: 'hc-ho', x1: 50, x2: 50 },
            { id: 'gh-ho', x1: 150, x2: 50 },
            { id: 'gh-go', x1: 150, x2: 250 },
            { id: 'gc-go', x1: 250, x2: 250 },
          ]}
        />
        <div className="mr-row">
          {n('hc', 'hello.cpp', 'kilde')}
          {n('gh', 'greeting.h', 'header')}
          {n('gc', 'greeting.cpp', 'kilde')}
        </div>
      </div>

      <div className="mr-term mono" aria-label="Terminal">
        <Swap
          show={variant}
          items={TERM.map((tm, i) => (
            <div key={i} className="mr-term-body">
              <div className="mr-cmd" data-comment={tm.cmd.startsWith('#') || undefined}>
                {tm.cmd}
              </div>
              {tm.lines.map((l, j) => {
                const on = variant === i && j < count
                return (
                  <motion.div
                    key={l}
                    className="mr-out"
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={on ? stagger(j, 0.15, 0.25) : t.fade}
                  >
                    {l}
                  </motion.div>
                )
              })}
            </div>
          ))}
        />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'make-rebuild',
  title: 'Make genbygger kun det, der er forældet',
  steps: [
    {
      caption:
        'Makefilens tre regler som graf: hvert **target** står over sine **dependencies**. Kun kildefilerne findes endnu.',
      hold: 2400,
    },
    {
      caption: 'Første `make`: ingen objektfiler findes, så begge `.o`-filer kompileres.',
      hold: 2400,
    },
    {
      caption: 'Til sidst linkes de to objektfiler til `hello.out`. Tre kommandoer, én `make`.',
      hold: 2400,
    },
    {
      caption:
        'Kør `make` igen uden ændringer: intet target er ældre end sine dependencies, så intet sker.',
      hold: 2600,
    },
    {
      caption:
        'Eksempel: `greeting.cpp` rettes. Dens *modification timestamp* er nu nyere end `greeting.o`, så `greeting.o` er forældet — og dermed også `hello.out`.',
      hold: 3000,
    },
    {
      caption:
        'Anden `make` kompilerer kun `greeting.o` og linker igen. `hello.o` er stadig nyere end `hello.cpp` og `greeting.h` og røres ikke.',
      hold: 3000,
    },
    {
      caption:
        'Alt er opdateret igen. Ændres `greeting.h` i stedet, genoversættes *begge* objektfiler, fordi headeren er dependency for dem begge.',
      hold: 3000,
    },
  ],
  Component: Make,
}

export default viz
