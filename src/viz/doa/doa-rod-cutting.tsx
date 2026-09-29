import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import type { Tone } from '../kit/primitives'
import { Graph } from '../kit/algo'
import type { GEdge, GNode } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-rod-cutting.css'

/* Lecture13.pdf s. 7 (pristabel p1..p10 = 1, 5, 8, 9, 10, 17, 17, 20, 24, 30; de otte
   opdelinger (a)–(h) af en 4-tommers stang; (c) 5 + 5 = 10 er optimal), s. 9
   (rekurrensen r_n = max(p_i + r_{n−i}) og rekursionstræet for n = 4), s. 11
   (BOTTOM-UP-CUT-ROD, Θ(n²)) og s. 12 (EXTENDED-BOTTOM-UP-CUT-ROD og tabellen
   r = 0, 1, 5, 8, 10, 13, 17, 18, 22, 25, 30; s = –, 1, 2, 3, 2, 2, 6, 1, 2, 3, 10).
   Mellemregningerne p[i] + r[j−i] for j = 2, 3, 4 og rekonstruktionen for n = 9 og
   n = 7 står ikke på slides — egen udregning ud fra slidets tabeller (mærket i
   figuren). Indhold: src/content/doa/p7-design.ts. */

const P = [0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30] // P[0] bruges ikke
const R = [0, 1, 5, 8, 10, 13, 17, 18, 22, 25, 30]
const S = [0, 1, 2, 3, 2, 2, 6, 1, 2, 3, 10] // S[0] vises som –

// Trin
const TREE = 1
const J_FIRST = 2 // j = 2 vises på trin 2, j = 3 på 3, j = 4 på 4
const DONE = 5
const REC9 = 6
const REC7 = 7

/** Hvor mange r-celler (0..k) er udfyldt på et trin. */
const filledTo = (step: number) => (step < J_FIRST ? -1 : step < DONE ? step : 10)
/** Den j, der beregnes lige nu (eller null). */
const curJ = (step: number) => (step >= J_FIRST && step < DONE ? step : null)
/** Bedste i for j (slidets s[j]). */
const bestI = (j: number) => S[j]

// ----------------------------------------------------------------- tabellen

const W = 340
const LX = 30
const CW = 28
const cx = (i: number) => LX + CW / 2 + CW * i
const Y_HEAD = 10
const P_TOP = 20
const CH = 26
const R_TOP = 92
const S_TOP = R_TOP + CH + 3
const BELOW = 40 // plads under s til n = 7-buerne
const H = S_TOP + CH + BELOW

interface Arc {
  id: string
  from: number
  to: number
  tone: Tone
  label?: string
  /** Buen går under s-rækken (rekonstruktionen for n = 7). */
  below?: boolean
}

function arcPath(a: Arc) {
  const d = Math.min(38, 10 + 4 * Math.abs(a.from - a.to))
  const x1 = cx(a.from) - 3
  const x2 = cx(a.to) + 3
  const y = a.below ? S_TOP + CH + 1 : R_TOP - 1
  const dir = a.below ? 1 : -1
  const mx = (x1 + x2) / 2
  const cy = y + dir * d * 2 // kontrolpunkt; toppen ligger i y ± d
  // Pilespids i endepunktet, langs tangenten (B − C).
  const tx = x2 - mx
  const ty = y - cy
  const len = Math.hypot(tx, ty)
  const ux = tx / len
  const uy = ty / len
  const bx = x2 - ux * 7
  const by = y - uy * 7
  return {
    line: `M${x1} ${y} Q${mx} ${cy} ${bx} ${by}`,
    head: `M${x2} ${y} L${bx - uy * 3.8} ${by + ux * 3.8} L${bx + uy * 3.8} ${by - ux * 3.8} Z`,
    apex: { x: mx, y: y + dir * d },
  }
}

function arcsFor(step: number): Arc[] {
  const j = curJ(step)
  if (j !== null) {
    return Array.from({ length: j }, (_, k) => {
      const i = k + 1
      return { id: `b${j}-${i}`, from: j, to: j - i, tone: i === bestI(j) ? 'ok' : 'muted' }
    })
  }
  if (step >= REC9) {
    const arcs: Arc[] = [
      { id: 'r9', from: 9, to: 6, tone: 'ok', label: '3' },
      { id: 'r6', from: 6, to: 0, tone: 'ok', label: '6' },
    ]
    if (step >= REC7)
      arcs.push(
        { id: 'r7', from: 7, to: 6, tone: 'focus', label: '1', below: true },
        { id: 'r7b', from: 6, to: 0, tone: 'focus', label: '6', below: true },
      )
    return arcs
  }
  return []
}

// Alle buer, der nogensinde tegnes, så de kan tone ind og ud.
const ALL_ARCS: Arc[] = [
  ...[2, 3, 4].flatMap((j) => Array.from({ length: j }, (_, k) => ({ id: `b${j}-${k + 1}`, from: j, to: j - k - 1, tone: 'muted' as Tone }))),
  { id: 'r9', from: 9, to: 6, tone: 'ok', label: '3' },
  { id: 'r6', from: 6, to: 0, tone: 'ok', label: '6' },
  { id: 'r7', from: 7, to: 6, tone: 'focus', label: '1', below: true },
  { id: 'r7b', from: 6, to: 0, tone: 'focus', label: '6', below: true },
]

function Table({ step }: { step: number }) {
  const upTo = filledTo(step)
  const j = curJ(step)
  const live = new Map(arcsFor(step).map((a) => [a.id, a]))

  const pTone = (i: number): Tone => {
    if (j !== null) return i === bestI(j) ? 'ok' : i <= j ? 'focus' : 'idle'
    if (step === 0) return i <= 4 ? 'focus' : 'idle'
    return 'idle'
  }
  const rTone = (i: number): Tone => {
    if (i > upTo) return 'ghost'
    if (j !== null) {
      if (i === j) return 'focus'
      if (i === j - bestI(j)) return 'ok'
      return 'idle'
    }
    if (step >= REC9 && i === 9) return 'ok'
    if (step >= REC7 && i === 7) return 'focus'
    return 'idle'
  }
  const sTone = (i: number): Tone => {
    if (i > upTo || i === 0) return i === 0 && upTo >= 0 ? 'idle' : 'ghost'
    if (j !== null && i === j) return 'focus'
    if (step >= REC9 && (i === 9 || i === 6)) return 'ok'
    if (step >= REC7 && i === 7) return 'focus'
    return 'idle'
  }

  const cell = (key: string, i: number, top: number, tone: Tone, text: string, delay: number) => (
    <g key={key} className="drc-cell" data-tone={tone}>
      <rect x={cx(i) - CW / 2 + 1.5} y={top} width={CW - 3} height={CH} rx={3} className="drc-box" />
      <motion.text
        x={cx(i)}
        y={top + CH / 2}
        textAnchor="middle"
        dominantBaseline="central"
        className="drc-val"
        initial={false}
        animate={{ opacity: tone === 'ghost' ? 0 : 1 }}
        transition={tone === 'ghost' ? t.fade : { ...t.settle, delay }}
      >
        {text}
      </motion.text>
    </g>
  )

  const cols = Array.from({ length: 11 }, (_, i) => i)
  // Ved "færdig tabel" fyldes 5..10 forskudt.
  const delay = (i: number) => (step === DONE && i >= 5 ? (i - 5) * 0.08 : 0)

  return (
    <svg className="drc-svg" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: `${Math.round(W * 1.25)}px` }} aria-hidden="true">
      {/* rækkenavne */}
      <text x={4} y={Y_HEAD} className="drc-rowk" dominantBaseline="central">i</text>
      <text x={4} y={P_TOP + CH / 2} className="drc-rowk" dominantBaseline="central">p</text>
      <text x={4} y={R_TOP + CH / 2} className="drc-rowk" dominantBaseline="central">r</text>
      <text x={4} y={S_TOP + CH / 2} className="drc-rowk" dominantBaseline="central">s</text>

      {cols.map((i) => (
        <text key={`h${i}`} x={cx(i)} y={Y_HEAD} textAnchor="middle" dominantBaseline="central" className="drc-idx" data-on={(j === i) || undefined}>
          {i}
        </text>
      ))}
      {cols.slice(1).map((i) => cell(`p${i}`, i, P_TOP, pTone(i), String(P[i]), 0))}
      {cols.map((i) => cell(`r${i}`, i, R_TOP, rTone(i), String(R[i]), delay(i)))}
      {cols.map((i) => cell(`s${i}`, i, S_TOP, sTone(i), i === 0 ? '–' : String(S[i]), delay(i)))}

      {/* buer: r[j] afhænger af r[j − i] */}
      {ALL_ARCS.map((a) => {
        const on = live.get(a.id)
        const tone = on?.tone ?? a.tone
        const { line, head, apex } = arcPath(a)
        return (
          <g key={a.id} className="drc-arc" data-tone={tone}>
            <motion.path
              d={line}
              className="drc-arc-line"
              initial={false}
              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={on ? { ...t.travel, duration: 0.6 } : t.fade}
            />
            <motion.path
              d={head}
              className="drc-arc-head"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: 0.5 } : t.fade}
            />
            {a.label && (
              <motion.text
                x={apex.x}
                y={apex.y}
                textAnchor="middle"
                dominantBaseline="central"
                className="drc-arc-label"
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={on ? { ...t.fade, delay: 0.4 } : t.fade}
              >
                {a.label}
              </motion.text>
            )}
          </g>
        )
      })}
    </svg>
  )
}

// ------------------------------------------------------ sidepanelets varianter

const CUTS: { k: string; parts: number[] }[] = [
  { k: 'a', parts: [4] },
  { k: 'b', parts: [1, 3] },
  { k: 'c', parts: [2, 2] },
  { k: 'd', parts: [3, 1] },
  { k: 'e', parts: [1, 1, 2] },
  { k: 'f', parts: [1, 2, 1] },
  { k: 'g', parts: [2, 1, 1] },
  { k: 'h', parts: [1, 1, 1, 1] },
]

function Cuts() {
  return (
    <div className="drc-panel">
      <span className="vcaps">De 8 opdelinger af n = 4 (L13 s. 7)</span>
      <ul className="drc-cuts">
        {CUTS.map((c) => (
          <li key={c.k} className="drc-cut" data-best={c.k === 'c' || undefined}>
            <span className="drc-cut-k">({c.k})</span>
            <span className="drc-rod">
              {c.parts.map((len, i) => (
                <span key={i} className="drc-piece" style={{ flexGrow: len }}>
                  {len}
                </span>
              ))}
            </span>
            <span className="drc-cut-sum mono">
              {c.parts.map((len) => P[len]).join(' + ')}
              {c.k === 'c' && <strong> = 10</strong>}
            </span>
          </li>
        ))}
      </ul>
      <span className="drc-note">Tallet i stykket er længden; til højre prisen p. Bedst: (c).</span>
    </div>
  )
}

// Rekursionstræet for n = 4: børn n−1, …, 0. Blade (0) får hver sin kolonne.
function buildTree() {
  const nodes: GNode[] = []
  const edges: GEdge[] = []
  let leaf = 0
  const DX = 34
  const DY = 40
  const PAD = 18
  const walk = (n: number, id: string, d: number): number => {
    const xs: number[] = []
    for (let c = n - 1; c >= 0; c--) {
      const cid = `${id}-${c}`
      xs.push(walk(c, cid, d + 1))
      edges.push({ from: id, to: cid })
    }
    const x = xs.length ? (xs[0] + xs[xs.length - 1]) / 2 : PAD + DX * leaf++
    nodes.push({ id, label: n, x, y: PAD + d * DY, tone: n === 2 ? 'focus' : 'idle' })
    return x
  }
  walk(4, 'n4', 0)
  return { nodes, edges, width: PAD * 2 + DX * 7, height: PAD * 2 + DY * 4 }
}
const TREE_G = buildTree()

function Tree() {
  return (
    <div className="drc-panel">
      <span className="vcaps">Rekursionstræet for n = 4 (L13 s. 9)</span>
      <Graph nodes={TREE_G.nodes} edges={TREE_G.edges} width={TREE_G.width} height={TREE_G.height} r={12} maxScale={1.1} />
      <span className="drc-note">
        16 knuder. Delproblem 2 løses 2 gange, 1 fire gange og 0 otte gange — overlappende delproblemer.
      </span>
    </div>
  )
}

function Candidates({ step }: { step: number }) {
  const j = curJ(step) ?? 4
  return (
    <div className="drc-panel">
      <span className="vcaps">
        j = {j}: q = max(p[i] + r[j − i])
      </span>
      <ol className="drc-cands">
        {[1, 2, 3, 4].map((i) => {
          const on = i <= j
          const best = on && i === bestI(j)
          return (
            <li key={i} className="drc-cand" data-best={best || undefined} style={{ opacity: on ? 1 : 0 }}>
              {on && (
                <>
                  <span className="mono">i = {i}</span>
                  <span className="mono">
                    p[{i}] + r[{j - i}] = {P[i]} + {R[j - i]} = <strong>{P[i] + R[j - i]}</strong>
                  </span>
                </>
              )}
            </li>
          )
        })}
      </ol>
      <span className="drc-result mono">
        r[{j}] = {R[j]}, s[{j}] = {S[j]}
      </span>
      <span className="drc-note">Mellemregninger: egen udregning. Ved lighed vinder første i (slidets <code>if q &lt; …</code>).</span>
    </div>
  )
}

function Done() {
  return (
    <div className="drc-panel">
      <span className="vcaps">Færdig tabel (L13 s. 12)</span>
      <p className="drc-text">
        Dobbelt løkke over <code>j</code> og <code>i</code>: <strong>Θ(n²)</strong> mod 2ⁿ⁻¹ opdelinger naivt.
      </p>
      <p className="drc-text">
        <code>s[j]</code> er længden af det første stykke i den bedste løsning. <code>s[10] = 10</code>: en stang på
        10 sælges uskåret for 30.
      </p>
    </div>
  )
}

function Recon({ step }: { step: number }) {
  return (
    <div className="drc-panel">
      <span className="vcaps">Rekonstruktion: følg s baglæns</span>
      <div className="drc-rec" data-tone="ok">
        <span className="drc-rec-n mono">n = 9</span>
        <span className="drc-rec-path mono">
          <span>s[9] = 3 → rest 6,</span> <span>s[6] = 6 → rest 0</span>
        </span>
        <span className="mono">
          3 + 6: 8 + 17 = <strong>25</strong> = r[9]
        </span>
      </div>
      <motion.div
        className="drc-rec"
        data-tone="focus"
        initial={false}
        animate={{ opacity: step >= REC7 ? 1 : 0, y: step >= REC7 ? 0 : 3 }}
        transition={step >= REC7 ? t.settle : t.fade}
      >
        <span className="drc-rec-n mono">n = 7</span>
        <span className="drc-rec-path mono">
          <span>s[7] = 1 → rest 6,</span> <span>s[6] = 6 → rest 0</span>
        </span>
        <span className="mono">
          1 + 6: 1 + 17 = <strong>18</strong> = r[7]
        </span>
      </motion.div>
      <span className="drc-note">Tallet på buen er stykket, der skæres af: n = 9 over r, n = 7 under s. Egen udregning ud fra slidets s.</span>
    </div>
  )
}

function RodCutting({ step }: { step: number }) {
  const panel = step === 0 ? 0 : step === TREE ? 1 : step < DONE ? 2 : step === DONE ? 3 : 4
  return (
    <div className="drc">
      <div className="drc-left">
        <span className="vcaps">Pristabel p og bottom-up-tabellerne r og s (L13 s. 7 og 12)</span>
        <Table step={step} />
        <div className="drc-legend vcaps">
          <span>
            <i className="drc-key" data-tone="focus" /> beregnes nu
          </span>
          <span>
            <i className="drc-key" data-tone="ok" /> bedste valg
          </span>
          <span>pil: r[j] bruger r[j − i]</span>
        </div>
      </div>
      <Swap
        show={panel}
        className="drc-side"
        items={[
          <Cuts key="c" />,
          <Tree key="t" />,
          <Candidates key="k" step={step} />,
          <Done key="d" />,
          <Recon key="r" step={step} />,
        ]}
      />
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-rod-cutting',
  title: 'Rod cutting bottom-up med rekonstruktion',
  steps: [
    {
      caption:
        'Slidets pristabel for længde 1–10. En 4-tommers stang kan skæres på 8 måder; det bedste er (c), 2 + 2, der giver 5 + 5 = **10**.',
      hold: 2600,
    },
    {
      caption:
        'Rekurrensen `r_n = max(p_i + r_{n−i})` som træ: delproblemerne 2, 1 og 0 løses igen og igen. Det er her DP gemmer svarene.',
      hold: 2800,
    },
    {
      caption: 'Bottom-up: `r[0] = 0`, `r[1] = 1`. For `j = 2` prøves hvert første stykke `i`; pilene peger på den `r[j − i]`, der bruges.',
      hold: 2600,
    },
    { caption: '`j = 3`: 1 + 5, 5 + 1 og 8 + 0. Uskåret vinder: `r[3] = 8`, `s[3] = 3`.', hold: 2200 },
    {
      caption: '`j = 4`: 1 + 8, **5 + 5**, 8 + 1, 9 + 0. Maksimum 10 ved `i = 2` — samme svar som (c), nu uden at prøve alle 8.',
      hold: 3000,
    },
    { caption: 'Resten af tabellen fyldes på samme måde, fra små til store stænger. Hver celle beregnes én gang.', hold: 2400 },
    {
      caption: 'Løsningen læses baglæns i `s`: `n = 9` skærer 3 af, resten 6 sælges hel. 8 + 17 = **25**.',
      hold: 2600,
    },
    { caption: '`n = 7`: `s[7] = 1`, resten 6 igen. 1 + 17 = **18**. Begge genbruger `s[6]`.', hold: 2600 },
  ],
  Component: RodCutting,
}

export default viz
