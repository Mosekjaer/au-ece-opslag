import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './dep-tree.css'

/* Mikrobølgeovnen fra klassediagram til dependency tree.
   Klassediagrammet: SWT-IntroductionHandin3.pdf s. 3. Træet, kanterne og løkkerne:
   DependencyTreeAndIntegrationPlan.pdf s. 1. Reglerne: Integrationtest introduction.pdf
   s. 8–13. Rækkefølgen i rækken med blade er byttet om i forhold til PDF’en
   (Timer yderst til venstre, Light yderst til højre), så løkkerne krydser færrest
   linjer; kanterne er de samme.

   Geometri: x i procent af bredden, y i rem. Linjerne tegnes i en SVG, der måles
   i pixels (ResizeObserver), så de følger boksene i alle bredder. Bred og smal
   plade har hver sin boksstørrelse (samme grænse som container-queryen, 40rem). */

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

const ROW = [1.9, 6.4, 10.9, 15.4, 19.9]
const H = 21.3

/** Plads i klassediagrammet (trin 0) og i træet. */
const CD: Record<Id, [number, number]> = {
  button: [12, ROW[1]],
  door: [10, ROW[2]],
  ui: [42, (ROW[1] + ROW[2]) / 2],
  cc: [78, (ROW[1] + ROW[2]) / 2],
  display: [48, ROW[0]],
  output: [82, ROW[0]],
  light: [40, ROW[4]],
  timer: [64, ROW[4]],
  power: [86, ROW[4]],
}
const TREE: Record<Id, [number, number]> = {
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
/** Trinnet, hvor klassen falder på plads i træet. */
const PLACED: Record<Id, number> = {
  ui: 1,
  cc: 1,
  light: 1,
  display: 1,
  power: 2,
  timer: 2,
  output: 3,
  button: 4,
  door: 4,
}

interface Layout {
  /** Halv bredde i procent. */
  hw: Record<Id, number>
  /** Halv højde i rem. */
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

/** Kanter: øverste klasse afhænger af nederste. Trinnet, hvor kanten tegnes. */
const EDGES: [Id, Id, number][] = [
  ['ui', 'cc', 1],
  ['ui', 'light', 1],
  ['ui', 'display', 1],
  ['cc', 'power', 2],
  ['cc', 'timer', 2],
  ['cc', 'display', 2],
  ['light', 'output', 3],
  ['power', 'output', 3],
  ['display', 'output', 3],
  ['button', 'ui', 4],
  ['door', 'ui', 4],
]

type Pt = [number, number]
const top = (L: Layout, id: Id): Pt => [TREE[id][0], TREE[id][1] - L.hh]
const bottom = (L: Layout, id: Id): Pt => [TREE[id][0], TREE[id][1] + L.hh]
const left = (L: Layout, id: Id) => TREE[id][0] - L.hw[id]
const right = (L: Layout, id: Id) => TREE[id][0] + L.hw[id]
/** Pixelsti ud fra procent/rem-punkter. */
const pathOf = (w: number) => (pts: Pt[]) => 'M' + pts.map(([x, y]) => `${(x * w) / 100} ${y * REM}`).join(' L')
const REM = 16

/** Løkkerne: fra bunden af den afhængige klasse, rundt, til toppen af den anden. */
function loops(L: Layout, poly: (p: Pt[]) => string) {
  const g = 0.5
  const uiB = TREE.ui[1] + L.hh
  const uiT = TREE.ui[1] - L.hh
  const ccB = TREE.cc[1] + L.hh
  const ccT = TREE.cc[1] - L.hh
  const r0T = ROW[0] - L.hh
  const tB = TREE.timer[1] + L.hh
  return [
    // UserInterface afhænger af Button (event): ud til venstre og op over Button.
    poly([
      [left(L, 'ui') + 2, uiB],
      [left(L, 'ui') + 2, uiB + g],
      [2, uiB + g],
      [2, r0T - g],
      [TREE.button[0] - 4, r0T - g],
      [TREE.button[0] - 4, r0T],
    ]),
    // UserInterface afhænger af Door (event): spejlet til højre.
    poly([
      [right(L, 'ui') - 2, uiB],
      [right(L, 'ui') - 2, uiB + g],
      [98, uiB + g],
      [98, r0T - g],
      [TREE.door[0] + 4, r0T - g],
      [TREE.door[0] + 4, r0T],
    ]),
    // CookController afhænger af UserInterface.
    poly([
      [left(L, 'cc') + 2, ccB],
      [left(L, 'cc') + 2, ccB + g],
      [19, ccB + g],
      [19, uiT - g],
      [left(L, 'ui') + 1.5, uiT - g],
      [left(L, 'ui') + 1.5, uiT],
    ]),
    // Timer afhænger af CookController.
    poly([
      [left(L, 'timer') + 2, tB],
      [left(L, 'timer') + 2, tB + g],
      [1, tB + g],
      [1, ccT - g],
      [left(L, 'cc') + 2, ccT - g],
      [left(L, 'cc') + 2, ccT],
    ]),
  ]
}

const LOOP_TAGS: { text: string; x: number; y: number; align: 'l' | 'r' }[] = [
  { text: 'event', x: 3, y: 3.9, align: 'l' },
  { text: 'event', x: 97, y: 3.9, align: 'r' },
  { text: 'tovejs', x: 18, y: 6.4, align: 'r' },
  { text: 'tovejs', x: 2.2, y: 11.4, align: 'l' },
]

const RULES = ['rigtige klasser, ikke interfaces', 'ingen pile — nedad = afhænger af', 'ingen vandrette linjer', 'løkker brydes med stubs']

const draw = (on: boolean, i = 0, base = 0) => ({
  initial: false as const,
  animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 },
  transition: on ? { ...t.travel, duration: 0.6, delay: base + i * 0.12 } : t.fade,
})

function Lines({ L, step, w }: { L: Layout; step: number; w: number }) {
  const poly = pathOf(w)
  return (
    <svg className="dt-lines" viewBox={`0 0 ${w} ${H * REM}`} aria-hidden="true">
      {EDGES.map(([a, b, s], i) => (
        <motion.path
          key={a + b + w}
          className="dt-line"
          data-now={step === s || undefined}
          d={poly([bottom(L, a), top(L, b)])}
          {...draw(at(step, s), i % 3, 0.55)}
        />
      ))}
      {loops(L, poly).map((d, i) => (
        <motion.path
          key={i + '-' + w}
          className="dt-line dt-loop"
          data-now={step === 5 || undefined}
          d={d}
          {...draw(at(step, 5), i, 0.1)}
        />
      ))}
    </svg>
  )
}

/** Pladens indre bredde i px. */
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

function DepTree({ step }: { step: number }) {
  const [ref, w] = useWidth()
  return (
    <div className="dt">
      <div className="dt-canvas" ref={ref} style={{ height: `${H}rem` }}>
        {w > 0 && <Lines L={w > 640 ? WIDE : NARROW} step={step} w={w} />}

        {(Object.keys(NAME) as Id[]).map((id) => {
          const placed = at(step, PLACED[id])
          const [x, y] = placed ? TREE[id] : CD[id]
          const tone = step === PLACED[id] ? 'focus' : 'idle'
          return (
            <motion.div
              key={id}
              className="dt-box"
              data-tone={tone}
              style={{ '--w': WIDE.hw[id] * 2, '--wn': NARROW.hw[id] * 2 } as CSSProperties}
              initial={false}
              animate={{ left: `${x}%`, top: `${y}rem` }}
              transition={t.travel}
            >
              <span>{NAME[id]}</span>
            </motion.div>
          )
        })}

        <motion.span
          className="dt-cd"
          initial={false}
          animate={{ opacity: step === 0 ? 1 : 0 }}
          transition={t.fade}
        >
          klassediagrammet
        </motion.span>

        {LOOP_TAGS.map((l, i) => (
          <motion.span
            key={i}
            className="dt-looptag"
            data-align={l.align}
            style={{ [l.align === 'l' ? 'left' : 'right']: `${l.align === 'l' ? l.x : 100 - l.x}%`, top: `${l.y}rem` }}
            initial={false}
            animate={{ opacity: at(step, 5) ? 1 : 0 }}
            transition={at(step, 5) ? stagger(i, 0.5, 0.12) : t.fade}
          >
            {l.text}
          </motion.span>
        ))}
      </div>

      <div className="dt-rules">
        {RULES.map((r) => (
          <Tag key={r} show={at(step, 6)} tone={step === 6 ? 'focus' : 'idle'} wrap>
            {r}
          </Tag>
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'dep-tree',
  title: 'Mikrobølgeovnen fra klassediagram til dependency tree',
  steps: [
    {
      caption: 'Klasserne fra mikrobølgeovnens klassediagram. Træet viser de **rigtige klasser** — ingen interfaces — og hvem der afhænger af hvem.',
      hold: 2400,
    },
    {
      caption: '`UserInterface` afhænger af `CookController`, `Light` og `Display`. De stilles *under* den, og linjen går fra bunden af den ene til toppen af den anden.',
      hold: 2800,
    },
    {
      caption: '`CookController` afhænger af `PowerTube`, `Timer` og `Display`. `Display` bruges af begge og står derfor under begge.',
      hold: 2400,
    },
    {
      caption: '`Light`, `PowerTube` og `Display` skriver alle til `Output`, der kommer nederst.',
      hold: 2000,
    },
    {
      caption: '`Button` og `Door` afhænger af `UserInterface` og står øverst. Ingen linje går vandret — moduler flyttes ned i stedet.',
      hold: 2400,
    },
    {
      caption: 'Tovejsforbindelser tegnes som **løkker**: fra bunden af den afhængige klasse rundt til toppen af den anden. Events mellem knapper/dør og `UserInterface` er tovejs, og det er `CookController` ↔ `UserInterface` og `Timer` ↔ `CookController` også.',
      hold: 3000,
    },
    {
      caption: 'Det færdige træ. Afhængigheden læses nedad uden pile, og løkkerne brydes med stubs, når integrationsplanen lægges.',
      hold: 2600,
    },
  ],
  Component: DepTree,
}

export default viz
