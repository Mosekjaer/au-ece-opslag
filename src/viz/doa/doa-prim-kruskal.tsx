import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { Graph, type GEdge, type GNode } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-prim-kruskal.css'

/* Lecture11.pdf s. 11 (grafen a–i og layoutet: a–b 4, a–h 8, b–c 8, b–h 11, c–d 7,
   c–f 4, c–i 2, d–e 9, d–f 14, e–f 10, g–f 2, h–g 1, h–i 7, i–g 6), s. 12–19 (Prim
   fra a: a–b, b–c, c–i, c–f, f–g, g–h, c–d, d–e), s. 26–34 (Kruskal: h–g s. 27,
   c–i s. 28, g–f s. 29, a–b s. 30, c–f s. 31, i–g afvist s. 32 (pilen på 6), c–d og
   a–h s. 33, d–e s. 34). Summen 37 for begge er lagt sammen her. At Kruskal også
   afviser h–i 7 og b–c 8, står ikke på slidene (de springer dem over) — egen
   udledning, mærket med * i figuren. Indhold: src/content/doa/p6-grafer.ts. */

// Positioner aflæst af slidet (1080 px bredt), skaleret 0,38 ind i viewBox 338 × 146.
const P: Record<string, [number, number]> = {
  a: [20, 73],
  b: [69, 22],
  c: [168, 22],
  d: [269, 22],
  e: [318, 73],
  f: [269, 124],
  g: [168, 124],
  h: [69, 124],
  i: [118, 73],
}
const W = 338
const H = 146

// Kanterne i slidets retning (from → to) med vægt-labelens side som på slidet.
const E: { k: string; w: number; off: number }[] = [
  { k: 'a-b', w: 4, off: -10 },
  { k: 'a-h', w: 8, off: 10 },
  { k: 'b-c', w: 8, off: -10 },
  { k: 'b-h', w: 11, off: 11 },
  { k: 'c-d', w: 7, off: -10 },
  { k: 'c-f', w: 4, off: 10 },
  { k: 'c-i', w: 2, off: -10 },
  { k: 'd-e', w: 9, off: -10 },
  { k: 'd-f', w: 14, off: -12 },
  { k: 'e-f', w: 10, off: -11 },
  { k: 'g-f', w: 2, off: 10 },
  { k: 'h-g', w: 1, off: 10 },
  { k: 'h-i', w: 7, off: -10 },
  { k: 'i-g', w: 6, off: -10 },
]
const wOf = Object.fromEntries(E.map((e) => [e.k, e.w]))
const label = (k: string) => k.replace('-', '–')

// Prim fra a (s. 12–19): kant pr. trin 1..8.
const PRIM = ['a-b', 'b-c', 'c-i', 'c-f', 'g-f', 'h-g', 'c-d', 'd-e']
const PRIM_NODES = ['a', 'b', 'c', 'i', 'f', 'g', 'h', 'd', 'e']

// Kruskal: kanterne sorteret stigende (a–h før b–c ved lighed, som på slidet).
const SORTED = ['h-g', 'c-i', 'g-f', 'a-b', 'c-f', 'i-g', 'c-d', 'h-i', 'a-h', 'b-c', 'd-e', 'e-f', 'b-h', 'd-f']
const REJECT = new Set(['i-g', 'h-i', 'b-c'])
const OWN = new Set(['h-i', 'b-c']) // afvisninger, slidene ikke viser
// Hvor mange af SORTED der er behandlet efter trin 0..9.
const SEEN = [0, 1, 2, 3, 4, 5, 6, 7, 9, 11]
const FINAL = 9

function primState(step: number) {
  const n = Math.min(step, PRIM.length)
  const tree = new Set(PRIM_NODES.slice(0, n + 1))
  const edges = new Set(PRIM.slice(0, n))
  const cur = step >= 1 && step <= PRIM.length ? PRIM[step - 1] : null
  const newNode = step >= 1 && step <= PRIM.length ? PRIM_NODES[step] : null
  return { tree, edges, cur, newNode }
}

function kruskalState(step: number) {
  const seen = SORTED.slice(0, SEEN[step])
  const prev = new Set(SORTED.slice(0, SEEN[step - 1] ?? 0))
  const accepted = new Set(seen.filter((k) => !REJECT.has(k)))
  const rejected = new Set(seen.filter((k) => REJECT.has(k)))
  const now = new Set(seen.filter((k) => !prev.has(k)))
  return { accepted, rejected, now }
}

function nodes(tone: (id: string) => Tone): GNode[] {
  return Object.entries(P).map(([id, [x, y]]) => ({ id, label: id, x, y, tone: tone(id) }))
}

function edges(tone: (k: string) => Tone): GEdge[] {
  return E.map((e) => {
    const [from, to] = e.k.split('-')
    return { from, to, w: e.w, wOffset: e.off, tone: tone(e.k) }
  })
}

function PrimKruskal({ step }: { step: number }) {
  const p = primState(step)
  const k = kruskalState(step)
  const final = step >= FINAL
  const primSum = PRIM.slice(0, Math.min(step, 8)).reduce((s, e) => s + wOf[e], 0)
  const krSum = [...k.accepted].reduce((s, e) => s + wOf[e], 0)
  const endsK = new Set([...k.now].flatMap((e) => e.split('-')))

  const primEdgeTone = (e: string): Tone =>
    p.edges.has(e) ? 'ok' : final ? 'ghost' : 'idle'
  const primNodeTone = (id: string): Tone =>
    id === p.newNode ? 'focus' : p.tree.has(id) && step >= 1 ? 'ok' : step === 0 && id === 'a' ? 'focus' : 'idle'

  const krEdgeTone = (e: string): Tone =>
    k.accepted.has(e)
      ? 'ok'
      : k.rejected.has(e)
        ? 'neg'
        : final
          ? 'ghost'
          : 'idle'
  const krNodeTone = (id: string): Tone => (endsK.has(id) && !final ? 'focus' : 'idle')

  return (
    <div className="dpk">
      <section className="dpk-side">
        <div className="dpk-head">
          <span className="dpk-name">Prim</span>
          <span className="dpk-sub">ét træ fra a · billigste kant ud af træet</span>
        </div>
        <Graph
          className="dpk-graph"
          nodes={nodes(primNodeTone)}
          edges={edges(primEdgeTone)}
          width={W}
          height={H}
          r={13}
          maxScale={1.15}
        />
        <ol className="dpk-list">
          {PRIM.map((e, i) => {
            const on = i < step
            const tone = !on ? 'ghost' : final && e === 'b-c' ? 'diff' : i === step - 1 ? 'now' : 'ok'
            return (
              <motion.li
                key={e}
                className="dpk-chip"
                data-tone={tone}
                initial={false}
                animate={{ opacity: on ? 1 : 0.45 }}
                transition={on ? t.settle : t.fade}
              >
                <span style={{ opacity: on ? 1 : 0 }}>
                  {label(e)} <b>{wOf[e]}</b>
                </span>
              </motion.li>
            )
          })}
        </ol>
        <div className="dpk-sum">
          sum <strong className="mono">{primSum}</strong>
          {step >= 8 && <span className="dpk-done"> — færdig, alle 9 knuder</span>}
        </div>
      </section>

      <section className="dpk-side">
        <div className="dpk-head">
          <span className="dpk-name">Kruskal</span>
          <span className="dpk-sub">skov · kanter i stigende orden · afvis cykler</span>
        </div>
        <Graph
          className="dpk-graph"
          nodes={nodes(krNodeTone)}
          edges={edges(krEdgeTone)}
          width={W}
          height={H}
          r={13}
          maxScale={1.15}
        />
        <ol className="dpk-list is-sorted">
          {SORTED.map((e, i) => {
            const seen = i < SEEN[step]
            const rej = seen && REJECT.has(e)
            const now = k.now.has(e) && !final
            const tone = !seen
              ? step >= FINAL
                ? 'skip'
                : 'todo'
              : rej
                ? 'rej'
                : final && e === 'a-h'
                  ? 'diff'
                  : now
                    ? 'now'
                    : 'ok'
            return (
              <li key={e} className="dpk-chip" data-tone={tone}>
                <span>
                  {label(e)} <b>{wOf[e]}</b>
                  {OWN.has(e) && <sup>*</sup>}
                </span>
              </li>
            )
          })}
        </ol>
        <div className="dpk-sum">
          sum <strong className="mono">{krSum}</strong>
        </div>
      </section>

      <motion.p
        className="dpk-verdict"
        initial={false}
        animate={{ opacity: final ? 1 : 0 }}
        transition={final ? t.settle : t.fade}
      >
        Begge: 8 kanter, sum <strong>37</strong>. Træerne er forskellige: Prim har <strong>b–c 8</strong>, Kruskal har{' '}
        <strong>a–h 8</strong>. <span className="dpk-own">* egen udledning — slidene springer h–i og b–c over.</span>
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-prim-kruskal',
  title: 'Prim og Kruskal på slidets graf a–i',
  steps: [
    {
      caption:
        'Samme graf, to greedy algoritmer. **Prim** gror ét træ fra `a`; **Kruskal** starter med ni enkeltknude-træer og kanterne sorteret stigende.',
      hold: 2600,
    },
    {
      caption: 'Prim: billigste kant ud af `{a}` er `a–b` 4. Kruskal: billigste kant i hele grafen er `h–g` 1.',
      hold: 2400,
    },
    {
      caption:
        'Prim: `b–c` 8 og `a–h` 8 er lige billige over snittet; slidet tager `b–c`. Kruskal: `c–i` 2 forbinder to nye træer.',
      hold: 2800,
    },
    { caption: 'Prim: `c–i` 2. Kruskal: `g–f` 2 — nu hænger h, g og f sammen.', hold: 2000 },
    { caption: 'Prim: `c–f` 4. Kruskal: `a–b` 4 — et tredje lille træ.', hold: 2000 },
    { caption: 'Prim: `f–g` 2. Kruskal: `c–f` 4 slår `{c, i}` og `{h, g, f}` sammen.', hold: 2200 },
    {
      caption:
        'Prim: `g–h` 1. Kruskal: `i–g` 6 **afvises** — i og g er i samme træ, så kanten ville lukke en cyklus (`find(i) == find(g)`).',
      hold: 3000,
    },
    { caption: 'Begge tager `c–d` 7. Prim har nu 8 knuder i træet.', hold: 2000 },
    {
      caption:
        'Prim: `d–e` 9 — færdig. Kruskal afviser `h–i` 7 (cyklus) og tager `a–h` 8, der forbinder `{a, b}` med resten.',
      hold: 2800,
    },
    {
      caption:
        'Kruskal afviser `b–c` 8 og tager `d–e` 9: |V| − 1 = 8 kanter. Begge træer vejer **37**, men de er forskellige — MST er ikke entydigt, når vægte er ens.',
      hold: 3000,
    },
  ],
  Component: PrimKruskal,
}

export default viz
