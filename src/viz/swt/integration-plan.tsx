import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, VTable, at, type Row, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './integration-plan.css'

/* Bottom-up-planen for mikrobølgeovnen.
   Kantnumre og F: DependencyTreeAndIntegrationPlan.pdf s. 2. Tabellen “Bottom up –
   leaving out Output”: samme PDF s. 4. “Black box eye for testing / White box eye for
   planning”: Integrationtest introduction.pdf s. 45. Træets geometri er den samme
   som i dep-tree (bladene byttet om, så løkkerne krydser færrest linjer).
   Driveren D tegnes over T-modulet som på slidene (Integrationtest introduction.pdf s. 18). */

type Id = 'button' | 'door' | 'ui' | 'cc' | 'light' | 'power' | 'timer' | 'display' | 'output'

/** Blød bindestreg: kodenavne må kun knække her (bygges i kode, så formatering ikke fjerner den). */
const SHY = String.fromCharCode(0xad)

const NAME: Record<Id, string> = {
  button: 'Button',
  door: 'Door',
  ui: `User${SHY}Interface`,
  cc: `Cook${SHY}Controller`,
  light: 'Light',
  power: `Power${SHY}Tube`,
  timer: 'Timer',
  display: 'Display',
  output: 'Output',
}

const ROW = [2.2, 6.7, 11.2, 15.7, 20.2]
const H = 21.6
const REM = 16

const POS: Record<Id, [number, number]> = {
  button: [24, ROW[0]],
  door: [70, ROW[0]],
  ui: [47, ROW[1]],
  cc: [36, ROW[2]],
  timer: [11, ROW[3]],
  power: [33, ROW[3]],
  display: [60, ROW[3]],
  light: [86, ROW[3]],
  output: [49, ROW[4]],
}

interface Layout {
  hw: Record<Id, number>
  hh: number
}
const WIDE: Layout = {
  hw: { button: 5.5, door: 4.5, ui: 9, cc: 9.5, light: 4.5, power: 7, timer: 5, display: 6, output: 6 },
  hh: 1,
}
const NARROW: Layout = {
  hw: { button: 9, door: 7, ui: 11, cc: 12.5, light: 7, power: 9, timer: 8, display: 9.5, output: 9.5 },
  hh: 1.25,
}

type Mark = 1 | 2 | 3 | 'F'
/** Kanter (øverste afhænger af nederste) med trinnet fra s. 2. */
const EDGES: [Id, Id, Mark][] = [
  ['cc', 'power', 1],
  ['cc', 'timer', 1],
  ['cc', 'display', 1],
  ['ui', 'cc', 2],
  ['ui', 'light', 2],
  ['ui', 'display', 2],
  ['button', 'ui', 3],
  ['door', 'ui', 3],
  ['light', 'output', 'F'],
  ['power', 'output', 'F'],
  ['display', 'output', 'F'],
]

type Pt = [number, number]
const top = (L: Layout, id: Id): Pt => [POS[id][0], POS[id][1] - L.hh]
const bottom = (L: Layout, id: Id): Pt => [POS[id][0], POS[id][1] + L.hh]
const left = (L: Layout, id: Id) => POS[id][0] - L.hw[id]
const right = (L: Layout, id: Id) => POS[id][0] + L.hw[id]
const mid = (a: Pt, b: Pt, f = 0.5): Pt => [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f]

/** Løkkerne med deres trin og et punkt til nummeret. */
function loops(L: Layout): { pts: Pt[]; mark: Mark; at: Pt }[] {
  const g = 0.5
  const uiB = POS.ui[1] + L.hh
  const uiT = POS.ui[1] - L.hh
  const ccB = POS.cc[1] + L.hh
  const ccT = POS.cc[1] - L.hh
  const r0T = ROW[0] - L.hh
  const tB = POS.timer[1] + L.hh
  return [
    {
      mark: 3,
      at: [2, (uiB + r0T) / 2],
      pts: [
        [left(L, 'ui') + 2, uiB],
        [left(L, 'ui') + 2, uiB + g],
        [2, uiB + g],
        [2, r0T - g],
        [POS.button[0] - 4, r0T - g],
        [POS.button[0] - 4, r0T],
      ],
    },
    {
      mark: 3,
      at: [98, (uiB + r0T) / 2],
      pts: [
        [right(L, 'ui') - 2, uiB],
        [right(L, 'ui') - 2, uiB + g],
        [98, uiB + g],
        [98, r0T - g],
        [POS.door[0] + 4, r0T - g],
        [POS.door[0] + 4, r0T],
      ],
    },
    {
      mark: 2,
      at: [19, (uiT + ccB) / 2 + 0.6],
      pts: [
        [left(L, 'cc') + 2, ccB],
        [left(L, 'cc') + 2, ccB + g],
        [19, ccB + g],
        [19, uiT - g],
        [left(L, 'ui') + 1.5, uiT - g],
        [left(L, 'ui') + 1.5, uiT],
      ],
    },
    {
      mark: 1,
      at: [1, (ccT - g + POS.timer[1] - L.hh) / 2],
      pts: [
        [left(L, 'timer') + 2, tB],
        [left(L, 'timer') + 2, tB + g],
        [1, tB + g],
        [1, ccT - g],
        [left(L, 'cc') + 2, ccT - g],
        [left(L, 'cc') + 2, ccT],
      ],
    },
  ]
}

/* Planen. Kolonnerne som i tabellen på s. 4. */
const COLS: Id[] = ['button', 'door', 'ui', 'light', 'display', 'cc', 'power', 'timer', 'output']
const HEAD = ['Button', 'Door', 'User Interface', 'Light', 'Display', 'Cook Controller', 'Power Tube', 'Timer', 'Output']
type Role = 'T' | 'X' | 'S' | ''
const PLAN: { key: string; roles: Role[] }[] = [
  { key: '1', roles: ['', '', 'S', '', 'X', 'T', 'X', 'X', 'S'] },
  { key: '2', roles: ['S', 'S', 'T', 'X', 'X', 'X', 'X', 'X', 'S'] },
  { key: '3', roles: ['T', 'T', 'X', 'X', 'X', 'X', 'X', 'X', 'S'] },
  { key: 'Final', roles: ['T', 'T', 'X', 'X', 'X', 'X', 'X', 'X', 'X'] },
]
/** Rækken i planen, som trinnet viser i træet (-1 = ingen). */
const planRow = (step: number) => (step >= 1 && step <= 4 ? step - 1 : -1)
const roleOf = (step: number, id: Id): Role => {
  const r = planRow(step)
  return r < 0 ? '' : PLAN[r].roles[COLS.indexOf(id)]
}

/** Kantens tilstand i et trin: nu (dette trin), testet (tidligere trin), senere eller fake. */
function edgeState(step: number, mark: Mark) {
  if (mark === 'F') return 'fake'
  if (step >= 5) return 'done'
  if (step === mark) return 'now'
  if (step > mark) return 'done'
  return 'later'
}

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
  const L = w > 640 ? WIDE : NARROW
  const px = ([x, y]: Pt) => `${(x * w) / 100} ${y * REM}`
  const path = (pts: Pt[]) => 'M' + pts.map(px).join(' L')

  const marks: { m: Mark; at: Pt }[] = [
    ...EDGES.map(([a, b, m]) => ({ m, at: mid(bottom(L, a), top(L, b), a === 'ui' && b === 'cc' ? 0.3 : 0.5) })),
    ...loops(L).map((l) => ({ m: l.mark, at: l.at })),
  ]

  return (
    <div className="ip-canvas" ref={ref} style={{ height: `${H}rem` }}>
      {w > 0 && (
        <svg className="ip-lines" viewBox={`0 0 ${w} ${H * REM}`} aria-hidden="true">
          {EDGES.map(([a, b, m]) => (
            <path key={a + b} className="ip-line" data-state={edgeState(step, m)} d={path([bottom(L, a), top(L, b)])} />
          ))}
          {loops(L).map((l, i) => (
            <path key={i} className="ip-line" data-state={edgeState(step, l.mark)} d={path(l.pts)} />
          ))}
        </svg>
      )}

      {marks.map((k, i) => {
        const st = edgeState(step, k.m)
        return (
          <motion.span
            key={i}
            className="ip-mark"
            data-state={st}
            style={{ left: `${k.at[0]}%`, top: `${k.at[1]}rem` }}
            initial={false}
            animate={{ scale: st === 'now' ? 1.12 : 1 }}
            transition={t.place}
          >
            {k.m}
          </motion.span>
        )
      })}

      {(Object.keys(NAME) as Id[]).map((id) => {
        const role = roleOf(step, id)
        const driven = role === 'T'
        return (
          <div
            key={id}
            className="ip-box"
            data-role={role || 'none'}
            style={{ left: `${POS[id][0]}%`, top: `${POS[id][1]}rem`, '--w': WIDE.hw[id] * 2, '--wn': NARROW.hw[id] * 2 } as CSSProperties}
          >
            <span>{NAME[id]}</span>
            <motion.span
              className="ip-role"
              initial={false}
              animate={{ opacity: role ? 1 : 0, scale: role ? 1 : 0.6 }}
              transition={role ? stagger(COLS.indexOf(id), 0.1, 0.05) : t.fade}
            >
              {role || 'X'}
            </motion.span>
            <motion.span
              className="ip-driver"
              initial={false}
              animate={{ opacity: driven ? 1 : 0, y: driven ? 0 : -4 }}
              transition={driven ? { ...t.place, delay: 0.35 } : t.fade}
            >
              D
            </motion.span>
          </div>
        )
      })}
    </div>
  )
}

const cell = (r: Role): ReactNode => r
const toneOf = (r: Role): Tone => (r === 'T' ? 'focus' : 'idle')

function Plan({ step }: { step: number }) {
  const rows: Row[] = PLAN.map((p, i) => {
    const filled = step >= 5 || i <= planRow(step)
    const now = i === planRow(step) && step < 5
    return {
      key: p.key,
      cells: [p.key, ...p.roles.map(cell)],
      tone: filled ? (now ? 'focus' : 'idle') : 'ghost',
      cellTone: filled && !now ? Object.fromEntries(p.roles.map((r, j) => [j + 1, toneOf(r)])) : undefined,
    }
  })

  return (
    <div className="ip">
      <Tree step={step} />

      <div className="ip-table">
        <VTable name="Bottom up – leaving out Output" cols={['', ...HEAD]} rows={rows} compact />
      </div>

      <div className="ip-foot">
        <ul className="ip-legend">
          <li>
            <span className="ip-key" data-role="T">T</span> top-modul, drives af testdriveren <span className="ip-key ip-key-d">D</span>
          </li>
          <li>
            <span className="ip-key" data-role="X">X</span> rigtigt modul i trinnet
          </li>
          <li>
            <span className="ip-key" data-role="S">S</span> fake (stub/mock)
          </li>
          <li>
            <span className="ip-num">1</span> trinnet, kanten testes i
          </li>
          <li>
            <span className="ip-num" data-state="fake">F</span> fake hele vejen
          </li>
        </ul>
        <Tag show={at(step, 5)} tone="focus" wrap>
          black box til test, white box til planlægning
        </Tag>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'integration-plan',
  title: 'Bottom-up-plan for mikrobølgeovnen',
  steps: [
    {
      caption: 'Mikrobølgeovnens dependency tree og en tom plan. Kanterne får nummeret på det trin, hvor de testes; `Output` er fake hele vejen (**F**).',
      hold: 2600,
    },
    {
      caption: 'Trin 1: testdriveren **D** driver `CookController` (**T**) med rigtige `PowerTube`, `Timer` og `Display`. `UserInterface` er stub, fordi løkken peger op til den.',
      hold: 3000,
    },
    {
      caption: 'Trin 2: `UserInterface` bliver top-modul. Kanterne mærket 2 kommer med, og `Button` og `Door` er stubs.',
      hold: 2600,
    },
    {
      caption: 'Trin 3: driveren taler med `Button` og `Door`. Nu er alle nummererede kanter testet; `Output` er stadig stub.',
      hold: 2600,
    },
    {
      caption: 'Final: alt er rigtigt. Tabellen sætter også `Output` til X, selvom kanterne til den er mærket **F** i træet.',
      hold: 2600,
    },
    {
      caption: 'Hele planen: ét trin pr. række, T/X/S pr. modul og trinnummeret på kanterne. Hvert trin testes *black box* gennem T; planen lægges *white box* ud fra træet.',
      hold: 3000,
    },
  ],
  Component: Plan,
}

export default viz
