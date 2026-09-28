import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './cyclomatic.css'

/* Static Analysis.pdf s. 6 (koden og CFG'en: rød entry, mørk exit, 8 knuder),
   s. 7 (M = E − N + 2P = 9 − 8 + 2·1 = 3 og risikoskalaen), s. 9 (branch
   coverage ≤ M ≤ antal stier) og s. 10 (stisættene). Slidets påstande om, hvilket
   sæt der finder fejlen, er selvmodsigende og vises ikke. */

const CODE: { text: string; indent: number; decision?: 1 | 2 }[] = [
  { text: 'void func()', indent: 0 },
  { text: '{', indent: 0 },
  { text: 'action0;', indent: 1 },
  { text: 'while (cond1)', indent: 1, decision: 1 },
  { text: '{', indent: 1 },
  { text: 'action1;', indent: 2 },
  { text: 'action0;', indent: 2 },
  { text: '}', indent: 1 },
  { text: 'if (cond2)', indent: 1, decision: 2 },
  { text: '{', indent: 1 },
  { text: 'action2;', indent: 2 },
  { text: '}', indent: 1 },
  { text: 'action3;', indent: 1 },
  { text: '}', indent: 0 },
]

/* Knuderne som på slidet: hovedsøjle med løkkeknude og if-knude til højre. */
const NODES: Record<number, [number, number]> = {
  1: [130, 18],
  2: [130, 72],
  3: [188, 101],
  4: [130, 132],
  5: [130, 196],
  6: [188, 226],
  7: [130, 258],
  8: [130, 312],
}
const DECISION: Record<number, string> = { 4: 'while(cond1)', 5: 'if (cond2)' }

/** Kanterne i tælleorden. */
const EDGES: [number, number][] = [
  [1, 2],
  [2, 4],
  [4, 3],
  [3, 2],
  [4, 5],
  [5, 6],
  [6, 7],
  [5, 7],
  [7, 8],
]

type PathDef = { label: [string, string]; edges: number[] }
const P_TT: PathDef = { label: ['while(true)', '+ if(true)'], edges: [0, 1, 2, 3, 4, 5, 6, 8] }
const P_FF: PathDef = { label: ['while(false)', '+ if(false)'], edges: [0, 1, 4, 7, 8] }
const P_TF: PathDef = { label: ['while(true)', '+ if(false)'], edges: [0, 1, 2, 3, 4, 7, 8] }

const nodesOf = (edges: number[]) => new Set(edges.flatMap((e) => EDGES[e]))

function geom(e: [number, number], r: number) {
  const [x1, y1] = NODES[e[0]]
  const [x2, y2] = NODES[e[1]]
  const dx = x2 - x1
  const dy = y2 - y1
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const sx = x1 + ux * r
  const sy = y1 + uy * r
  const ex = x2 - ux * (r + 1)
  const ey = y2 - uy * (r + 1)
  const ah = 8
  const aw = 4
  const bx = ex - ux * ah
  const by = ey - uy * ah
  const head = `${ex},${ey} ${bx - uy * aw},${by + ux * aw} ${bx + uy * aw},${by - ux * aw}`
  // Linjen stopper ved pilens bund, så spidsen er skarp.
  const line = `M${sx},${sy} L${bx},${by}`
  // Etiket: vinkelret ud fra midten, til højre for skrå kanter, til venstre for lodrette.
  const mx = (x1 + x2) / 2
  const my = (y1 + y2) / 2
  const vertical = Math.abs(dx) < 1
  // Normalen, der peger mod højre.
  const [nx, ny] = -uy > 0 ? [-uy, ux] : [uy, -ux]
  const lx = vertical ? mx - 8 : mx + nx * 10
  const ly = (vertical ? my : my + ny * 10) + 4
  return { line, head, lx, ly, vertical }
}

function BigGraph({ step }: { step: number }) {
  const nodes = at(step, 1)
  const edges = at(step, 2)
  const dec = step === 3
  return (
    <svg className="cc-graph" viewBox="0 0 230 330" width="230" height="330" role="img" aria-label="Kontrolflowgraf med 8 knuder og 9 kanter">
      {EDGES.map((e, i) => {
        const g = geom(e, 11)
        return (
          <g key={i} className="cc-edge">
            <motion.path
              d={g.line}
              initial={false}
              animate={{ pathLength: edges ? 1 : 0, opacity: edges ? 1 : 0 }}
              transition={edges ? { ...t.travel, duration: 0.45, delay: 0.1 + i * 0.16 } : t.fade}
            />
            <motion.polygon
              points={g.head}
              initial={false}
              animate={{ opacity: edges ? 1 : 0 }}
              transition={edges ? { ...t.fade, delay: 0.45 + i * 0.16 } : t.fade}
            />
            <motion.text
              x={g.lx}
              y={g.ly}
              className="cc-elabel"
              textAnchor={g.vertical ? 'end' : 'start'}
              initial={false}
              animate={{ opacity: edges ? 1 : 0 }}
              transition={edges ? { ...t.fade, delay: 0.45 + i * 0.16 } : t.fade}
            >
              {i + 1}
            </motion.text>
          </g>
        )
      })}
      {Object.entries(NODES).map(([k, [x, y]], i) => {
        const n = Number(k)
        const kind = n === 1 ? 'entry' : n === 8 ? 'exit' : 'mid'
        const hot = dec && (n === 4 || n === 5)
        return (
          <motion.g
            key={k}
            className="cc-node"
            data-kind={kind}
            data-hot={hot || undefined}
            initial={false}
            animate={{ opacity: nodes ? 1 : 0, scale: nodes ? 1 : 0.5 }}
            transition={nodes ? stagger(i, 0.05, 0.1) : t.fade}
            style={{ transformOrigin: `${x}px ${y}px` }}
          >
            <circle cx={x} cy={y} r={11} />
            <text x={x} y={y + 4} textAnchor="middle" className="cc-nlabel">
              {n}
            </text>
            {DECISION[n] && (
              <text x={x - 17} y={y + 4} textAnchor="end" className="cc-dlabel">
                {DECISION[n]}
              </text>
            )}
          </motion.g>
        )
      })}
    </svg>
  )
}

function MiniGraph({ path }: { path: PathDef }) {
  const on = new Set(path.edges)
  const onNodes = nodesOf(path.edges)
  return (
    <svg className="cc-mini" viewBox="104 2 106 326" width="36" height="111" aria-hidden="true">
      {EDGES.map((e, i) => {
        const g = geom(e, 14)
        return (
          <g key={i} className="cc-medge" data-on={on.has(i) || undefined}>
            <path d={g.line} vectorEffect="non-scaling-stroke" />
            <polygon points={g.head} />
          </g>
        )
      })}
      {Object.entries(NODES).map(([k, [x, y]]) => {
        const n = Number(k)
        return (
          <circle
            key={k}
            className="cc-mnode"
            data-kind={n === 1 ? 'entry' : n === 8 ? 'exit' : 'mid'}
            data-on={onNodes.has(n) || undefined}
            cx={x}
            cy={y}
            r={14}
            vectorEffect="non-scaling-stroke"
          />
        )
      })}
    </svg>
  )
}

function PathSet({ title, sub, paths, show, now }: { title: string; sub: string; paths: PathDef[]; show: boolean; now: boolean }) {
  return (
    <motion.div
      className="cc-set"
      data-now={now || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={show ? t.settle : t.fade}
      aria-hidden={!show || undefined}
    >
      <div className="cc-set-head">
        <span className="cc-set-title">{title}</span>
        <span className="cc-set-sub">{sub}</span>
      </div>
      <div className="cc-set-paths">
        {paths.map((p, i) => (
          <motion.figure
            key={i}
            className="cc-path"
            initial={false}
            animate={{ opacity: show ? 1 : 0 }}
            transition={show ? stagger(i, 0.2, 0.25) : t.fade}
          >
            <MiniGraph path={p} />
            <figcaption>
              <span>{p.label[0]}</span>
              <span>{p.label[1]}</span>
            </figcaption>
          </motion.figure>
        ))}
      </div>
    </motion.div>
  )
}

const RISK = [
  { range: '1–10', text: 'simpel, lille risiko' },
  { range: '11–20', text: 'mere kompleks, moderat risiko' },
  { range: '21–50', text: 'kompleks, høj risiko' },
  { range: '> 50', text: 'utestbar, meget høj risiko' },
]

function Cyclomatic({ step }: { step: number }) {
  const N = at(step, 1)
  const E = at(step, 2)
  const M = at(step, 3)
  const risk = at(step, 6)

  const fade = (on: boolean, d = 0) => ({
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 4 },
    transition: on ? { ...t.settle, delay: d } : t.fade,
  })

  return (
    <div className="cc">
      <div className="cc-code">
        {CODE.map((l, i) => (
          <div key={i} className="cc-line" data-hot={(M && l.decision !== undefined && step === 3) || undefined}>
            <code style={{ paddingLeft: `${l.indent * 2}ch` }}>{l.text}</code>
            {l.decision && (
              <motion.span className="cc-dec" {...fade(M, 0.1 * l.decision)}>
                beslutning {l.decision}
              </motion.span>
            )}
          </div>
        ))}
      </div>

      <div className="cc-graph-wrap">
        <BigGraph step={step} />
      </div>

      <div className="cc-count">
        <motion.div className="cc-var" {...fade(N, 0.8)}>
          <span className="cc-k">N = 8</span>
          <span className="cc-v">knuder</span>
        </motion.div>
        <motion.div className="cc-var" {...fade(E, 1.6)}>
          <span className="cc-k">E = 9</span>
          <span className="cc-v">kanter</span>
        </motion.div>
        <motion.div className="cc-var" {...fade(M)}>
          <span className="cc-k">P = 1</span>
          <span className="cc-v">sammenhængende komponent</span>
        </motion.div>
        <motion.div className="cc-formula" data-hot={step === 3 || undefined} {...fade(M, 0.15)}>
          <code>M = E − N + 2P</code>
          <code>&nbsp;&nbsp;= 9 − 8 + 2·1 = 3</code>
          <span className="cc-alt">= 2 beslutninger + 1</span>
        </motion.div>
        <motion.div className="cc-bound" {...fade(at(step, 5), 0.6)}>
          branch coverage ≤ M ≤ antal stier
          <b>2 ≤ 3 ≤ 4</b>
        </motion.div>
      </div>

      <div className="cc-sets">
        <PathSet
          title="Branch-sæt: 2 tests"
          sub="begge beslutninger sande og falske — fuld branch coverage"
          paths={[P_TT, P_FF]}
          show={at(step, 4)}
          now={step === 4}
        />
        <PathSet
          title="M = 3 stier"
          sub="i praksis: tre stier, der dækker mest"
          paths={[P_TF, P_FF, P_TT]}
          show={at(step, 5)}
          now={step === 5}
        />
      </div>

      <motion.div className="cc-risk" {...fade(risk)} aria-hidden={!risk || undefined}>
        {RISK.map((r, i) => (
          <div key={r.range} className="cc-band" data-i={i} data-hit={i === 0 || undefined}>
            <span className="cc-band-range">{r.range}</span>
            <span className="cc-band-text">{r.text}</span>
            {i === 0 && (
              <span className="cc-here">
                <Tag show={risk}>M = 3</Tag>
              </span>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'cyclomatic',
  title: 'Cyklomatisk kompleksitet talt på grafen',
  steps: [
    { caption: 'Koden fra slidet: én `while` og én `if`. Kontrolflowgrafen (CFG) er endnu ikke tegnet.', hold: 1800 },
    {
      caption: 'Grafen får **8 knuder**: rød entry øverst, mørk exit nederst og én knude for hver af `while(cond1)` og `if (cond2)`.',
      hold: 2400,
    },
    {
      caption: '**9 kanter** forbinder dem og tælles én for én. Løkken er en løkke: fra `while(cond1)` ud og tilbage.',
      hold: 3000,
    },
    {
      caption: '`M = E − N + 2P = 9 − 8 + 2·1 = 3`. For struktureret kode er det antal beslutninger + 1.',
      hold: 2800,
    },
    {
      caption: 'Hver beslutning skal være både sand og falsk. **To tests** er nok til fuld branch coverage.',
      hold: 2800,
    },
    {
      caption:
        'I praksis tager man **M = 3** stier, der dækker mest. Alle fire kombinationer giver fuld path coverage: 2 ≤ 3 ≤ 4.',
      hold: 3000,
    },
    { caption: 'McCabes skala: 1–10 er simpel kode med lille risiko. M = 3 ligger i den første gruppe.', hold: 3000 },
  ],
  Component: Cyclomatic,
}

export default viz
