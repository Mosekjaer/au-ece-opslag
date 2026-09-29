import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, type Tone } from '../kit/primitives'
import { CellGrid, Graph, type GEdge, type GNode } from '../kit/algo'
import { stagger, t } from '../kit/motion'
import './doa-graph-repr.css'

/* Lecture9.pdf s. 6 (V = {a, b, c, d, e}, E = {{a,b}, {a,c}, {b,c}, {b,d}, {c,d},
   {c,e}, {d,e}} og grafens layout), s. 16 (adjacency matrix: uorienteret, symmetrisk,
   fx række c = 1 1 0 1 1; orienteret graf med a→c, b→a, b→d, c→b, d→c, e→c, e→d og
   matrix med række b = 1 0 0 1 0; plads Θ(V²), “dense”) og s. 17 (adjacency lists
   a→b→c, b→a→c→d, c→a→b→d→e, d→b→c→e, e→c→d; plads Θ(|V| + |E|), “sparse”).
   Listerne for den orienterede graf står ikke på slidet — udledt af slidets kanter og
   mærket i figuren. Indhold: src/content/doa/p6-grafer.ts. */

const V = ['a', 'b', 'c', 'd', 'e'] as const
type Vx = (typeof V)[number]

// Layout som på slidet: a og c øverst, b og d nederst, e til højre.
const POS: Record<Vx, { x: number; y: number }> = {
  a: { x: 26, y: 26 },
  c: { x: 150, y: 26 },
  e: { x: 222, y: 84 },
  b: { x: 26, y: 142 },
  d: { x: 150, y: 142 },
}

// Uorienterede kanter (s. 6) og samme kanter med slidets retning (s. 16).
const UND: [Vx, Vx][] = [
  ['a', 'b'],
  ['a', 'c'],
  ['b', 'c'],
  ['b', 'd'],
  ['c', 'd'],
  ['c', 'e'],
  ['d', 'e'],
]
const DIR: [Vx, Vx][] = [
  ['b', 'a'],
  ['a', 'c'],
  ['c', 'b'],
  ['b', 'd'],
  ['d', 'c'],
  ['e', 'c'],
  ['e', 'd'],
]

const LISTS_UND: Record<Vx, Vx[]> = {
  a: ['b', 'c'],
  b: ['a', 'c', 'd'],
  c: ['a', 'b', 'd', 'e'],
  d: ['b', 'c', 'e'],
  e: ['c', 'd'],
}
const LISTS_DIR: Record<Vx, Vx[]> = {
  a: ['c'],
  b: ['a', 'd'],
  c: ['b'],
  d: ['c'],
  e: ['c', 'd'],
}

const S_AB = 1 // kanten {a, b} giver to 1-taller
const S_FULL = 2 // hele matricen, række c
const S_LC = 3 // c’s liste
const S_LALL = 4 // alle lister
const S_DIR = 5 // orienteret

const has = (es: [Vx, Vx][], u: Vx, v: Vx) => es.some(([p, q]) => p === u && q === v)
const touches = (e: [Vx, Vx], x: Vx) => e[0] === x || e[1] === x

function GraphRepr({ step }: { step: number }) {
  const dir = step >= S_DIR
  const edgesSrc = dir ? DIR : UND

  // Fremhævet knude/kant pr. trin.
  const hiNode: Vx | null = step === S_FULL || step === S_LC ? 'c' : dir ? 'b' : null
  const edgeTone = (e: [Vx, Vx]): Tone => {
    if (step === S_AB) return touches(e, 'a') && touches(e, 'b') ? 'focus' : 'idle'
    if (hiNode === 'c') return touches(e, 'c') ? 'focus' : 'idle'
    if (dir) return e[0] === 'b' ? 'focus' : 'idle'
    return 'idle'
  }
  const nodes: GNode[] = V.map((v) => ({
    id: v,
    label: v,
    ...POS[v],
    tone: v === hiNode || (step === S_AB && (v === 'a' || v === 'b')) ? 'focus' : 'idle',
  }))
  const edges: GEdge[] = edgesSrc.map((e) => ({
    from: e[0],
    to: e[1],
    tone: edgeTone(e),
    directed: dir,
  }))

  // Matricen
  const full = step >= S_FULL
  const cell = (r: number, c: number) => {
    const u = V[r]
    const v = V[c]
    const one = dir ? has(DIR, u, v) : has(UND, u, v) || has(UND, v, u)
    if (!full) {
      const ab = step >= S_AB && ((u === 'a' && v === 'b') || (u === 'b' && v === 'a'))
      return ab ? { label: '1', tone: 'focus' as Tone } : { label: '', tone: 'ghost' as Tone }
    }
    const rowHi = (step === S_FULL && u === 'c') || (dir && u === 'b')
    if (rowHi) return { label: one ? '1' : '0', tone: 'focus' as Tone }
    return { label: one ? '1' : '0', tone: (one ? 'ok' : 'idle') as Tone }
  }

  const lists = dir ? LISTS_DIR : LISTS_UND
  const listOn = (v: Vx) => (step >= S_LALL) || (step === S_LC && v === 'c')

  return (
    <div className="dgr">
      <section className="dgr-graph">
        <span className="vcaps">{dir ? 'Orienteret graf (L09 s. 16)' : 'G = (V, E) (L09 s. 6)'}</span>
        <Graph nodes={nodes} edges={edges} width={248} height={168} maxScale={1.15} />
        <Swap
          className="dgr-set mono"
          show={dir ? 1 : 0}
          items={[
            <>E = {'{{a,b}, {a,c}, {b,c}, {b,d}, {c,d}, {c,e}, {d,e}}'}</>,
            <>E = {'{(b,a), (a,c), (c,b), (b,d), (d,c), (e,c), (e,d)}'}</>,
          ]}
        />
      </section>

      <section className="dgr-panel">
        <span className="vcaps">Adjacency matrix (s. 16)</span>
        <CellGrid
          className="dgr-matrix"
          rows={5}
          cols={5}
          size="1.9rem"
          rowHead={(r) => V[r]}
          colHead={(c) => V[c]}
          cell={cell}
        />
        <Swap
          className="dgr-note"
          show={dir ? 3 : full ? 2 : step >= S_AB ? 1 : 0}
          items={[
            <>&nbsp;</>,
            <>
              <code>{'{a,b}'}</code> giver <code>A[a,b]</code> og <code>A[b,a]</code>
            </>,
            <>14 ettaller i 25 celler · <span className="dgr-nw">Θ(|V|²)</span> · symmetrisk</>,
            <>
              7 ettaller · ikke symmetrisk · række <code>b</code> = <code>1 0 0 1 0</code>
            </>,
          ]}
        />
      </section>

      <section className="dgr-panel">
        <span className="vcaps">Adjacency lists (s. 17)</span>
        <div className="dgr-lists">
          {V.map((v) => {
            const on = listOn(v)
            const items = lists[v]
            const hiRow = (step === S_LC && v === 'c') || (dir && v === 'b')
            return (
              <div key={v} className="dgr-row" data-hi={hiRow || undefined}>
                <span className="dgr-head mono">{v}</span>
                {[0, 1, 2, 3].map((i) => {
                  const x = items[i]
                  const show = on && x !== undefined
                  return (
                    <motion.span
                      key={i}
                      className="dgr-item"
                      initial={false}
                      animate={{ opacity: show ? 1 : 0, x: show ? 0 : -4 }}
                      transition={show ? stagger(i, 0, 0.09) : t.fade}
                    >
                      <i aria-hidden="true">→</i>
                      <span className="dgr-box mono" data-tone={hiRow ? 'focus' : 'idle'}>
                        {x ?? ''}
                      </span>
                    </motion.span>
                  )
                })}
              </div>
            )
          })}
        </div>
        <Swap
          className="dgr-note"
          show={dir ? 3 : step >= S_LALL ? 2 : step >= S_LC ? 1 : 0}
          items={[
            <>&nbsp;</>,
            <>
              <code>c</code>’s naboer, i vilkårlig rækkefølge
            </>,
            <>5 lister, 14 elementer = 2|E| · <span className="dgr-nw">Θ(|V| + |E|)</span></>,
            <>7 elementer · udledt af kanterne, ikke vist på slidet</>,
          ]}
        />
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-graph-repr',
  title: 'Samme graf som adjacency matrix og som adjacency lists',
  steps: [
    {
      caption: 'Grafen fra slidet: fem knuder og syv uorienterede kanter. Matricen og listerne er endnu tomme.',
      hold: 2200,
    },
    {
      caption: 'Kanten `{a, b}` er en mængde, så den skrives to steder: `A[a,b] = 1` og `A[b,a] = 1`.',
      hold: 2400,
    },
    {
      caption:
        'Alle syv kanter giver 14 ettaller. Række `c` er `1 1 0 1 1`. Matricen bruger **|V|² = 25** celler, uanset hvor få kanter der er.',
      hold: 3000,
    },
    {
      caption: 'I adjacency lists får hver knude en linked list med sine naboer. `c` har fire: a → b → d → e.',
      hold: 2400,
    },
    {
      caption:
        'Alle fem lister: hver kant står i to lister, 14 elementer. Pladsen er **Θ(|V| + |E|)** — bedst til tynde grafer.',
      hold: 2800,
    },
    {
      caption:
        'Orienteret: kanterne får retning, og matricen er ikke længere symmetrisk. Række `b` = `1 0 0 1 0` (b→a og b→d).',
      hold: 3000,
    },
  ],
  Component: GraphRepr,
}

export default viz
