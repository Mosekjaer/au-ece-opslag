import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import { t } from '../kit/motion'
import './dining-philosophers.css'

/* 06.1-Synchronisation-Examples.pdf s. 3 (right = phil, left = (phil + 1) % 5),
   s. 4 (“Taking turns”, t = 0…7, “Deadlocked…”), s. 5 (RAG: allocated/requests,
   “Circular Wait”) og s. 6 (“A Solution?”: lavest nummererede pind først, slip den
   lavere igen; “No cycle → Solution*”, fodnote og “Will someone starve to death?”).
   Trin 4–5 anvender krav 1 på samme tur-rækkefølge som s. 4 — et eksempel, ikke
   slidets egen tilstand (s. 6 viser P0 med C0+C1 og P2 med C2+C3). */

const N = 5
const CX = 180
const CY = 180
const RP = 138
const RC = 82
const PR = 22 // filosof-radius
const CW = 34 // pind-bredde
const CH = 24

const ang = (a: number) => ((-90 + a * 72) * Math.PI) / 180
const P = Array.from({ length: N }, (_, i) => ({ x: CX + RP * Math.cos(ang(i)), y: CY + RP * Math.sin(ang(i)) }))
const C = Array.from({ length: N }, (_, i) => ({ x: CX + RC * Math.cos(ang(i - 0.5)), y: CY + RC * Math.sin(ang(i - 0.5)) }))

type Pt = { x: number; y: number }
/** Linje fra a til b, afkortet ved begge noder. */
function seg(a: Pt, ra: number, b: Pt, rb: number) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const d = Math.hypot(dx, dy)
  const ux = dx / d
  const uy = dy / d
  return `M${(a.x + ux * ra).toFixed(1)} ${(a.y + uy * ra).toFixed(1)} L${(b.x - ux * rb).toFixed(1)} ${(b.y - uy * rb).toFixed(1)}`
}
const CRAD = 17
const alloc = (c: number, p: number) => seg(C[c], CRAD, P[p], PR + 2)
const req = (p: number, c: number) => seg(P[p], PR, C[c], CRAD + 2)

type Tone = 'idle' | 'neg' | 'ok'
interface Edge {
  id: string
  d: string
  kind: 'alloc' | 'req'
}
const EDGES: Edge[] = [
  ...Array.from({ length: N }, (_, i) => ({ id: `a${i}`, d: alloc(i, i), kind: 'alloc' as const })),
  ...Array.from({ length: N }, (_, i) => ({ id: `r${i}`, d: req(i, (i + 1) % N), kind: 'req' as const })),
  { id: 'a4to3', d: alloc(4, 3), kind: 'alloc' },
]

interface Frame {
  edges: Record<string, Tone>
  phil: Tone[]
  held: boolean[]
  center: 0 | 1 | 2
}

function frame(step: number): Frame {
  const edges: Record<string, Tone> = {}
  const phil: Tone[] = Array(N).fill('idle')
  const held: boolean[] = Array(N).fill(false)
  let center: Frame['center'] = 0
  if (step >= 1 && step <= 3) {
    for (let i = 0; i < N; i++) {
      edges[`a${i}`] = step === 3 ? 'neg' : 'idle'
      held[i] = true
    }
  }
  if (step === 2 || step === 3) {
    for (let i = 0; i < N; i++) edges[`r${i}`] = step === 3 ? 'neg' : 'idle'
  }
  if (step === 3) {
    phil.fill('neg')
    center = 1
  }
  if (step >= 4) {
    for (let i = 0; i < 4; i++) {
      edges[`a${i}`] = 'idle'
      held[i] = true
    }
    edges.r4 = 'idle'
  }
  if (step >= 5) {
    for (let i = 0; i < 3; i++) edges[`r${i}`] = 'idle'
    edges.a4to3 = 'ok'
    edges.a3 = 'ok'
    held[4] = true
    phil[3] = 'ok'
    center = 2
  }
  return { edges, phil, held, center }
}

const TURNS: [string, string, string, boolean][] = [
  ['0', 'P0', 'Pick C0', false],
  ['1', 'P1', 'Pick C1', false],
  ['2', 'P2', 'Pick C2', false],
  ['3', 'P3', 'Pick C3', false],
  ['4', 'P4', 'Pick C4', false],
  ['5', 'P0', 'Pick C1 (locked!)', true],
  ['6', 'P1', 'Pick C2 (locked!)', true],
  ['7', 'P2', 'Pick C3 (locked)', true],
]

function Table({ step }: { step: number }) {
  const f = frame(step)
  return (
    <svg className="sx-dp-svg" viewBox="0 0 360 360" role="img" aria-label="Bordet med fem filosoffer og fem spisepinde">
      <defs>
        {(['idle', 'neg', 'ok'] as const).map((k) => (
          <marker
            key={k}
            id={`sx-dp-arrow-${k}`}
            className={`sx-dp-head sx-dp-head-${k}`}
            viewBox="0 0 10 10"
            refX="8.5"
            refY="5"
            markerWidth="7"
            markerHeight="7"
            orient="auto-start-reverse"
          >
            <path d="M0 0 L10 5 L0 10 z" />
          </marker>
        ))}
      </defs>

      <circle className="sx-dp-board" cx={CX} cy={CY} r={RC + 26} />

      {EDGES.map((e, i) => {
        const tone = f.edges[e.id]
        const on = tone !== undefined
        return (
          <motion.path
            key={e.id}
            d={e.d}
            className={`sx-dp-edge sx-dp-${e.kind}`}
            data-tone={tone ?? 'idle'}
            markerEnd={`url(#sx-dp-arrow-${tone ?? 'idle'})`}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: step === 1 || step === 2 ? (i % N) * 0.12 : 0 } : t.fade}
          />
        )
      })}

      <motion.text
        className="sx-dp-center"
        data-tone="neg"
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        initial={false}
        animate={{ opacity: f.center === 1 ? 1 : 0 }}
        transition={t.fade}
      >
        Circular Wait
      </motion.text>
      <motion.text
        className="sx-dp-center"
        data-tone="ok"
        x={CX}
        y={CY}
        textAnchor="middle"
        dominantBaseline="central"
        initial={false}
        animate={{ opacity: f.center === 2 ? 1 : 0 }}
        transition={t.fade}
      >
        No cycle
      </motion.text>

      {C.map((c, i) => (
        <g key={`c${i}`} className="sx-dp-stick" data-held={f.held[i] || undefined}>
          <rect x={c.x - CW / 2} y={c.y - CH / 2} width={CW} height={CH} rx={3} />
          <text x={c.x} y={c.y} textAnchor="middle" dominantBaseline="central">
            C{i}
          </text>
        </g>
      ))}
      {P.map((p, i) => (
        <g key={`p${i}`} className="sx-dp-phil" data-tone={f.phil[i]}>
          <circle cx={p.x} cy={p.y} r={PR} />
          <text x={p.x} y={p.y} textAnchor="middle" dominantBaseline="central">
            P{i}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Dining({ step }: { step: number }) {
  const solution = step >= 4
  const final = step >= 6
  const rowsOn = step >= 2 ? 8 : step >= 1 ? 5 : 0
  return (
    <div className="sx-dp">
      <div className="sx-dp-fig">
        <Table step={step} />
        <div className="sx-dp-legend">
          <span className="sx-dp-key sx-dp-key-alloc">allocated</span>
          <span className="sx-dp-key sx-dp-key-req">requests</span>
        </div>
      </div>

      <div className="sx-dp-side">
        <code className="sx-dp-code">
          int right = phil;
          <br />
          int left = (phil + 1) % 5;
        </code>

        <Swap
          show={solution ? 1 : 0}
          items={[
            <div key="turns" className="sx-dp-block">
              <span className="sx-dp-kicker">Taking turns</span>
              <table className="sx-dp-turns">
                <tbody>
                  {TURNS.map(([tt, who, what, locked], i) => (
                    <motion.tr
                      key={tt}
                      data-locked={locked || undefined}
                      data-hot={(step === 3 && locked) || undefined}
                      initial={false}
                      animate={{ opacity: i < rowsOn ? 1 : 0 }}
                      transition={i < rowsOn ? { ...t.fade, delay: (i % 5) * 0.12 } : t.fade}
                    >
                      <td>t = {tt}</td>
                      <td>{who}</td>
                      <td>{what}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <motion.p
                className="sx-dp-verdict"
                initial={false}
                animate={{ opacity: step === 3 ? 1 : 0 }}
                transition={t.fade}
              >
                Deadlocked…
              </motion.p>
            </div>,
            <div key="solution" className="sx-dp-block">
              <span className="sx-dp-kicker">A Solution?</span>
              <ol className="sx-dp-rules">
                <li data-hot={step === 4 || undefined}>
                  Tag den <b>lavest nummererede</b> pind først. P4 skal bruge <code>C4</code> og <code>C0</code> → tager{' '}
                  <code>C0</code> først.
                </li>
                <li>Er den højere pind optaget, så slip den lavere igen.</li>
              </ol>
              <motion.div
                className="sx-dp-end"
                initial={false}
                animate={{ opacity: final ? 1 : 0 }}
                transition={t.fade}
                aria-hidden={!final || undefined}
              >
                <p>
                  <b>No cycle → Solution*</b>
                </p>
                <p className="sx-dp-foot">* When there is only one instance of each ressource (chopstick)</p>
                <p className="sx-dp-foot">Åbent spørgsmål på slidet: “Will someone starve to death?”</p>
              </motion.div>
            </div>,
          ]}
        />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'dining-philosophers',
  title: 'Fem filosoffer, fem spisepinde',
  steps: [
    {
      caption: 'Én tråd pr. filosof, én mutex pr. pind. `P0` bruger `C0` og `C1`, `P4` bruger `C4` og `C0`.',
      hold: 2400,
    },
    { caption: 't = 0…4: hver filosof låser sin **højre** pind, `chopstick[right].lock()`.', hold: 2400 },
    {
      caption: 't = 5…: hver prøver sin **venstre** pind — men den holdes af naboen. Alle holder én og venter på én.',
      hold: 2800,
    },
    {
      caption: 'Kanterne danner ringen `P0 → C1 → P1 → … → P4 → C0 → P0`. Én instans pr. pind, så cyklussen **er** en deadlock.',
      hold: 3200,
    },
    {
      caption: 'Løsningen: lavest nummer først. Samme rækkefølge (eksempel): `P4` beder om `C0` før `C4` og holder intet, mens den venter.',
      hold: 3200,
    },
    { caption: '`C4` er ledig, så `P3` får begge sine pinde og kan **spise**. Ringen er brudt.', hold: 2600 },
    {
      caption: 'Krav 1 bryder *circular wait*, krav 2 bryder *hold and wait*. Deadlock-fri er dog ikke det samme som starvation-fri.',
      hold: 3200,
    },
  ],
  Component: Dining,
}

export default viz
