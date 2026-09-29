import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Graph, layoutTree, CellGrid, type TreeIn } from '../kit/algo'
import { t, stagger } from '../kit/motion'
import './doa-fib-tree.css'

/* Lecture05.pdf s. 4 (kaldstakken for F(4): frames x = 4 … 0, returværdier
   0, 1, 3, 6, 10), s. 11 (fib(6) = fib(5) + fib(4); fib(5) = fib(4) + fib(3);
   fib returnerer n for n ≤ 1) og s. 13 (fibTail(n, a, b), Fn = fibTail(n, 0, 1),
   O(n)). Antallet af kald pr. n (1, 1, 2, 3, 5, 8, 5 = 25) og de 7 nye / 18
   gentagne kald er egen optælling ud fra slidets kode. fibTail-kæden er udfoldet
   i hånden ud fra koden på s. 13. Indhold: src/content/doa/p4-sortering.ts. */

// ------------------------------------------------------------- kaldstakken

const FRAMES = [
  { x: 0, body: 'return 0', ret: 0 },
  { x: 1, body: 'return 1 + f(0)', ret: 1 },
  { x: 2, body: 'return 2 + f(1)', ret: 3 },
  { x: 3, body: 'return 3 + f(2)', ret: 6 },
  { x: 4, body: 'return 4 + f(3)', ret: 10 },
]

// ---------------------------------------------------------------- kaldtræet

/* Id = vej fra roden (l = fib(n − 1), r = fib(n − 2)). Kaldrækkefølgen er
   pre-order, venstre først, så første gang et n regnes, er på venstre kant. */
function build(n: number, id: string): TreeIn {
  if (n <= 1) return { id, label: String(n) }
  return { id, label: String(n), l: build(n - 1, id + 'l'), r: build(n - 2, id + 'r') }
}
const TREE = layoutTree(build(6, 'r'), { dx: 13, dy: 40, pad: 14 })
const FIRST = new Set(['r', 'rl', 'rll', 'rlll', 'rllll', 'rlllll', 'rllllr'])
const depth = (id: string) => id.length - 1

const COUNTS = [
  { n: 6, c: 1 },
  { n: 5, c: 1 },
  { n: 4, c: 2 },
  { n: 3, c: 3 },
  { n: 2, c: 5 },
  { n: 1, c: 8 },
  { n: 0, c: 5 },
]

// ------------------------------------------------------------------ fibTail

const TAIL = [
  [6, 0, 1],
  [5, 1, 1],
  [4, 1, 2],
  [3, 2, 3],
  [2, 3, 5],
  [1, 5, 8],
]

const S_RET = 1
const S_TOP = 2
const S_ALL = 3
const S_DUP = 4
const S_TAIL = 5

function FibTree({ step }: { step: number }) {
  const nodes = TREE.nodes.map((n) => {
    const d = depth(n.id)
    const show = step >= S_ALL || (step >= S_TOP && d <= 2)
    let tone: 'idle' | 'focus' | 'ok' | 'neg' | 'muted' = 'idle'
    if (step === S_TOP && n.label === '4' && d <= 2) tone = 'focus'
    if (step >= S_DUP) tone = FIRST.has(n.id) ? 'ok' : 'neg'
    return { ...n, show, tone }
  })
  const edges = TREE.edges.map((e) => ({ ...e, tone: step >= S_DUP && FIRST.has(e.to) ? ('focus' as const) : ('idle' as const) }))

  return (
    <div className="dfib">
      <section className="dfib-stack">
        <span className="vcaps">
          Kaldstak for <code>f(4)</code>
        </span>
        <ol className="dfib-frames">
          {FRAMES.map((f, i) => {
            const back = step >= S_RET
            return (
              <li key={f.x} className="dfib-frame" data-base={f.x === 0 || undefined}>
                <span className="mono dfib-x">x = {f.x}</span>
                <span className="mono dfib-body">{f.body}</span>
                <motion.span
                  className="dfib-ret"
                  initial={false}
                  animate={{ opacity: back ? 1 : 0, x: back ? 0 : -4 }}
                  // f(0) returnerer først, så værdierne løber opad i stakken: forsinkelse efter x.
                  transition={back ? stagger(i, 0.1, 0.22) : t.fade}
                >
                  → {f.ret}
                </motion.span>
              </li>
            )
          })}
        </ol>
        <span className="dfib-note">
          <code>x = 0</code> øverst er base case; <code>f(4)</code> returnerer <strong>10</strong>.
        </span>
      </section>

      <section className="dfib-tree">
        <span className="vcaps">
          Kaldtræ for <code>fib(6)</code> · tallet i knuden er <code>n</code>
        </span>
        <Graph nodes={nodes} edges={edges} width={TREE.width} height={TREE.height} r={11} maxScale={1.15} />
        <motion.div
          className="dfib-counts"
          initial={false}
          animate={{ opacity: step >= S_DUP ? 1 : 0 }}
          transition={step >= S_DUP ? t.settle : t.fade}
        >
          <CellGrid
            rows={2}
            cols={COUNTS.length}
            size="2rem"
            rowHead={(r) => (r === 0 ? 'n' : 'kald')}
            cell={(r, c) =>
              r === 0
                ? { label: COUNTS[c].n, tone: 'muted' }
                : { label: COUNTS[c].c, tone: COUNTS[c].c > 1 ? 'neg' : 'idle' }
            }
          />
          <span className="dfib-note">
            I alt <strong>25 kald</strong>, heraf 7 nye (udfyldt) og 18 gentagne (røde). Egen optælling ud fra koden.
          </span>
        </motion.div>
      </section>

      <section className="dfib-tail">
        <span className="vcaps">
          Hale-rekursiv: <code>fibTail(6, 0, 1)</code>
        </span>
        <ol className="dfib-chain">
          {TAIL.map(([n, a, b], i) => {
            const on = step >= S_TAIL
            return (
              <motion.li
                key={n}
                className="dfib-call"
                initial={false}
                animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
                transition={on ? stagger(i, 0.05, 0.12) : t.fade}
              >
                <span className="mono">
                  fibTail({n}, {a}, {b})
                </span>
              </motion.li>
            )
          })}
          <motion.li
            className="dfib-call is-result"
            initial={false}
            animate={{ opacity: step >= S_TAIL ? 1 : 0 }}
            transition={step >= S_TAIL ? stagger(TAIL.length, 0.05, 0.12) : t.fade}
          >
            <span className="mono">n == 1 → return b = 8</span>
          </motion.li>
        </ol>
        <motion.span
          className="dfib-note"
          initial={false}
          animate={{ opacity: step >= S_TAIL ? 1 : 0 }}
          transition={step >= S_TAIL ? { ...t.settle, delay: 0.9 } : t.fade}
        >
          <strong>6 kald</strong> mod 25, O(n) mod O(2ⁿ).
        </motion.span>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-fib-tree',
  title: 'Kaldstak, kaldtræ og hale-rekursion',
  steps: [
    {
      caption: '`f(4)` lægger én stack frame pr. kald: `x = 4` nederst, base case `x = 0` øverst.',
      hold: 2200,
    },
    {
      caption: '`f(0)` returnerer `0`, og resultaterne løber op gennem stakken: `1`, `3`, `6` og til sidst `10`.',
      hold: 2600,
    },
    {
      caption: '`fib(6)` kalder `fib(5)` og `fib(4)` — men `fib(5)` kalder også `fib(4)`. Samme delproblem regnes to gange.',
      hold: 2800,
    },
    {
      caption: 'Hele kaldtræet: hvert kald over base case laver to nye, så træet vokser eksponentielt.',
      hold: 2200,
    },
    {
      caption:
        'Kun 7 kald langs venstre kant er nye; de 18 røde gentager arbejde, fx regnes `fib(2)` fem gange. *Egen optælling.*',
      hold: 3000,
    },
    {
      caption: '`fibTail` bærer de to seneste tal med som `a` og `b`: 6 kald og `fib(6) = 8`, uden gentaget arbejde.',
      hold: 3000,
    },
  ],
  Component: FibTree,
}

export default viz
