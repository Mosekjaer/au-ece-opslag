import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState } from 'react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './integration-patterns.css'

/* Integrationtest introduction.pdf: eksempeltræet s. 17, legenden s. 18, big bang s. 19,
   bottom-up s. 21–22, top-down s. 25–26, sandwich s. 36 og s. 38. Markeringerne (T, X, S,
   D, fuld/stiplet kant) er aflæst fra slidenes grafik. Fordele og ulemper fra sedlerne
   s. 20, 24, 28 og 39 (grønne = fordele, blå = ulemper; big bangs fordel og sandwichs
   ulempe står på gule sedler). */

type Id = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G' | 'H' | 'I' | 'J' | 'K' | 'L' | 'M' | 'N' | 'O' | 'HW'
const IDS: Id[] = ['A', 'L', 'B', 'E', 'H', 'M', 'C', 'D', 'F', 'I', 'J', 'N', 'G', 'K', 'O', 'HW']

const ROW = [2.5, 6.1, 9.7, 13.3, 16.9]
const H = 18.1
const HH = 0.95
const REM = 16

/** x i procent (s. 17, skaleret til pladen), række. */
const POS: Record<Id, [number, number]> = {
  A: [52.7, 0],
  L: [93, 0],
  B: [9.4, 1],
  E: [39.2, 1],
  H: [71.6, 1],
  M: [93, 1],
  C: [7, 2],
  D: [22.9, 2],
  F: [39.2, 2],
  I: [58.1, 2],
  J: [74.2, 2],
  N: [93, 2],
  G: [39.2, 3],
  K: [74.2, 3],
  O: [93, 3],
  HW: [39.2, 4],
}

const EDGES: [Id, Id][] = [
  ['A', 'B'],
  ['A', 'E'],
  ['A', 'H'],
  ['L', 'H'],
  ['L', 'M'],
  ['B', 'C'],
  ['B', 'D'],
  ['E', 'D'],
  ['E', 'F'],
  ['H', 'I'],
  ['H', 'J'],
  ['J', 'K'],
  ['N', 'K'],
  ['N', 'O'],
  ['F', 'G'],
  ['G', 'HW'],
]
const key = (a: Id, b: Id) => `${a}-${b}`

type Role = 'T' | 'X' | 'S'
type EdgeState = 'iut' | 'done'
interface Frame {
  roles: Partial<Record<Id, Role>>
  edges: Record<string, EdgeState>
}

const roles = (spec: Partial<Record<Role, Id[]>>) => {
  const r: Partial<Record<Id, Role>> = {}
  for (const role of ['T', 'X', 'S'] as Role[]) for (const id of spec[role] ?? []) r[id] = role
  return r
}
const edges = (iut: string[], done: string[] = []) => {
  const e: Record<string, EdgeState> = {}
  for (const k of iut) e[k] = 'iut'
  for (const k of done) e[k] = 'done'
  return e
}
const ALL = EDGES.map(([a, b]) => key(a, b))
const TOPS = ['A-B', 'A-E', 'A-H', 'L-H', 'L-M']
const MIDS = ['B-C', 'B-D', 'E-D', 'E-F', 'H-I', 'H-J']
const BOTTOM = ['F-G', 'G-HW', 'J-K', 'N-K', 'N-O']
const others = (...ids: Id[]) => IDS.filter((i) => !ids.includes(i))

const FRAMES: Frame[] = [
  // 0: træet (s. 17)
  { roles: {}, edges: {} },
  // 1: big bang (s. 19)
  { roles: roles({ T: ['A', 'L', 'N'], X: others('A', 'L', 'N') }), edges: edges(ALL) },
  // 2: bottom-up, første trin (s. 21)
  { roles: roles({ T: ['G'], X: ['HW'] }), edges: edges(['G-HW']) },
  // 3: bottom-up, trin 2 (s. 22)
  { roles: roles({ T: ['F', 'J', 'N'], X: ['G', 'HW', 'K', 'O'] }), edges: edges(['F-G', 'J-K', 'N-K', 'N-O'], ['G-HW']) },
  // 4: top-down, første trin (s. 25)
  { roles: roles({ T: ['A', 'L'], X: ['B', 'E', 'H', 'M'], S: ['C', 'D', 'F', 'I', 'J'] }), edges: edges(TOPS) },
  // 5: top-down, trin 2 (s. 26)
  {
    roles: roles({ T: ['A', 'L'], X: ['B', 'E', 'H', 'M', 'C', 'D', 'F', 'I', 'J'], S: ['G', 'K'] }),
    edges: edges(MIDS, TOPS),
  },
  // 6: sandwich, fra toppen samtidig (s. 36)
  { roles: roles({ T: ['A', 'L'], X: ['B', 'E', 'H', 'M'], S: ['C', 'D', 'F', 'I', 'J'] }), edges: edges(TOPS, BOTTOM) },
  // 7: sandwich, sidste trin (s. 38)
  {
    roles: roles({ T: ['A', 'L'], X: others('A', 'L') }),
    edges: edges(['E-F', 'H-J'], ALL.filter((k) => k !== 'E-F' && k !== 'H-J')),
  },
]

const PATTERNS = [
  {
    name: 'Big bang',
    chips: [{ label: 'eneste trin', step: 1 }],
    pro: 'virker (nogle gange) for små, simple og stabile systemer',
    con: 'kun muligt sent i udviklingen — fejl er dyre at rette',
  },
  {
    name: 'Bottom-up',
    chips: [
      { label: 'trin 1', step: 2 },
      { label: 'trin 2', step: 3 },
    ],
    pro: 'let at dække interfaces på alle niveauer',
    con: 'udskyder test af kontrolkomponenternes interfaces',
  },
  {
    name: 'Top-down',
    chips: [
      { label: 'trin 1', step: 4 },
      { label: 'trin 2', step: 5 },
    ],
    pro: 'tidlig feedback på kontrolkomponenterne',
    con: 'svært at udøve lavniveau-interfaces fra toppen',
  },
  {
    name: 'Sandwich',
    chips: [
      { label: 'top + bund', step: 6 },
      { label: 'sidste trin', step: 7 },
    ],
    pro: 'det bedste fra top-down og bottom-up',
    con: 'kræver meget planlægning',
  },
]

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(0)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.getBoundingClientRect().width)
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

function Tree({ step }: { step: number }) {
  const [ref, w] = useWidth()
  const f = FRAMES[step]
  const pt = (id: Id, dy: number) => `${(POS[id][0] * w) / 100} ${(ROW[POS[id][1]] + dy) * REM}`

  return (
    <div className="ipat-canvas" ref={ref} style={{ height: `${H}rem` }}>
      {w > 0 && (
        <svg className="ipat-lines" viewBox={`0 0 ${w} ${H * REM}`} aria-hidden="true">
          {EDGES.map(([a, b]) => (
            <path key={key(a, b)} className="ipat-line" data-state={f.edges[key(a, b)] ?? 'none'} d={`M${pt(a, HH)} L${pt(b, -HH)}`} />
          ))}
        </svg>
      )}
      {IDS.map((id, i) => {
        const role = f.roles[id]
        return (
          <div
            key={id}
            className="ipat-box"
            data-role={role ?? 'none'}
            data-hw={id === 'HW' || undefined}
            style={{ left: `${POS[id][0]}%`, top: `${ROW[POS[id][1]]}rem` }}
          >
            <span className="ipat-name">{id}</span>
            <motion.span
              className="ipat-role"
              initial={false}
              animate={{ opacity: role ? 1 : 0, scale: role ? 1 : 0.6 }}
              transition={role ? stagger(i, 0.05, 0.03) : t.fade}
            >
              {role ?? 'X'}
            </motion.span>
            <motion.span
              className="ipat-driver"
              initial={false}
              animate={{ opacity: role === 'T' ? 1 : 0, y: role === 'T' ? 0 : -4 }}
              transition={role === 'T' ? { ...t.place, delay: 0.3 } : t.fade}
            >
              D
            </motion.span>
          </div>
        )
      })}
    </div>
  )
}

function Patterns({ step }: { step: number }) {
  return (
    <div className="ipat">
      <Tree step={step} />

      <ul className="ipat-legend">
        <li>
          <span className="ipat-key" data-role="T">T</span> top-modul i SUT
        </li>
        <li>
          <span className="ipat-key" data-role="X">X</span> andet modul i trinnet
        </li>
        <li>
          <span className="ipat-key" data-role="S">S</span> stub/mock
        </li>
        <li>
          <span className="ipat-key ipat-key-d">D</span> testdriver
        </li>
        <li>
          <svg className="ipat-glyph" viewBox="0 0 28 8" aria-hidden="true">
            <path d="M1 4 H27" className="ipat-line" data-state="iut" />
          </svg>
          interface under test
        </li>
        <li>
          <svg className="ipat-glyph" viewBox="0 0 28 8" aria-hidden="true">
            <path d="M1 4 H27" className="ipat-line" data-state="done" />
          </svg>
          allerede testet
        </li>
        <li>
          <span className="ipat-key" data-role="none" /> ikke med
        </li>
      </ul>

      <ol className="ipat-cards">
        {PATTERNS.map((p) => {
          const first = p.chips[0].step
          const now = p.chips.some((c) => c.step === step)
          const seen = at(step, first)
          return (
            <li key={p.name} className="ipat-card" data-now={now || undefined}>
              <div className="ipat-card-head">
                <span className="ipat-card-name">{p.name}</span>
                <span className="ipat-chips">
                  {p.chips.map((c) => (
                    <span key={c.label} className="ipat-chip" data-now={c.step === step || undefined} data-seen={at(step, c.step) || undefined}>
                      {c.label}
                    </span>
                  ))}
                </span>
              </div>
              <motion.p className="ipat-pc" initial={false} animate={{ opacity: seen ? 1 : 0 }} transition={seen ? { ...t.settle, delay: 0.4 } : t.fade}>
                <span className="ipat-sign">+</span>
                {p.pro}
              </motion.p>
              <motion.p className="ipat-pc" initial={false} animate={{ opacity: seen ? 1 : 0 }} transition={seen ? { ...t.settle, delay: 0.55 } : t.fade}>
                <span className="ipat-sign" data-neg>
                  −
                </span>
                {p.con}
              </motion.p>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'integration-patterns',
  title: 'Fire integrationsmønstre på samme dependency tree',
  steps: [
    {
      caption: 'Slidenes eksempeltræ: tre rødder (A, L og N) og hardware (HW) under G. Mønstrene er forskellige rækkefølger gennem det samme træ.',
      hold: 2400,
    },
    {
      caption: '**Big bang**: første, sidste og eneste trin. Alt er med på én gang, og hver rod drives af en testdriver **D**.',
      hold: 2400,
    },
    {
      caption: '**Bottom-up**, første trin: start nederst. **D** driver G, der taler med den rigtige hardware.',
      hold: 2200,
    },
    {
      caption: 'Bottom-up, trin 2: et niveau op. F, J og N får hver sin driver; kanten G–HW er allerede testet (stiplet).',
      hold: 2600,
    },
    {
      caption: '**Top-down**, første trin: start øverst. A og L drives, niveauet under er med, og modulerne derunder er stubs (**S**).',
      hold: 2600,
    },
    {
      caption: 'Top-down, trin 2: stubbene erstattes af de rigtige moduler, og nu er G og K stubs. Interfacene øverst er testet.',
      hold: 2600,
    },
    {
      caption: '**Sandwich**: fra toppen med stubs, mens bunden allerede er integreret nedefra (stiplet) som i bottom-up.',
      hold: 2600,
    },
    {
      caption: 'Sandwich, sidste trin: top og bund mødes i midten (E–F og H–J). Kortene viser én fordel og én ulempe pr. mønster fra slidenes sedler.',
      hold: 3000,
    },
  ],
  Component: Patterns,
}

export default viz
