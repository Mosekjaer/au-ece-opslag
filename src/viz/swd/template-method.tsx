import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './template-method.css'

/* HFDP (SWD_Head-First-Design-Patterns-2nd-Edition.pdf) PDF s. 323: abstract class
   CaffeineBeverage med final prepareRecipe() → boilWater(); brew(); pourInCup();
   addCondiments(); brew() og addCondiments() er abstrakte. Output-strengene for Tea,
   Coffee og de fælles trin (s. 323). PDF s. 327: “Tea myTea = new Tea();
   myTea.prepareRecipe();” — Coffee-linjerne i programmet er samme mønster, lavet her.
   PDF s. 336: “Don’t call us, we’ll call you.”
   Slides GoF Template Method, GoF Strategy.pdf s. 22: “GoF Template Method uses
   inheritance … Behavior fixed at compile-time”.
   Visuelt sprog deles med strategy.tsx: variant 1 (Tea) i blæk, variant 2 (Coffee) i
   accent, kald på runtime som tykke accentpile, UML-relationer i tynd blæk. */

type V = 1 | 2
type Dir = 'r' | 'l' | 'd' | 'u'

/** Fyldt pilespids (kald), spidsen i (x, y). */
function head(x: number, y: number, dir: Dir, a = 8, b = 4.5) {
  switch (dir) {
    case 'r':
      return `M${x - a} ${y - b} L${x} ${y} L${x - a} ${y + b}Z`
    case 'l':
      return `M${x + a} ${y - b} L${x} ${y} L${x + a} ${y + b}Z`
    case 'd':
      return `M${x - b} ${y - a} L${x} ${y} L${x + b} ${y - a}Z`
    default:
      return `M${x - b} ${y + a} L${x} ${y} L${x + b} ${y + a}Z`
  }
}

/** Lukket hul trekant (generalisering), spidsen opad i (x, y). */
const triUp = (x: number, y: number) => `M${x} ${y} L${x - 7} ${y + 12} L${x + 7} ${y + 12}Z`

/* ------------------------------ Indhold ------------------------------ */

const SLOTS = [
  { op: 'boilWater()', hole: false, out: ['Boiling water', 'Boiling water'] },
  { op: 'brew()', hole: true, out: ['Steeping the tea', 'Dripping Coffee through filter'] },
  { op: 'pourInCup()', hole: false, out: ['Pouring into cup', 'Pouring into cup'] },
  { op: 'addCondiments()', hole: true, out: ['Adding Lemon', 'Adding Sugar and Milk'] },
] as const

/** Kørslen: hvornår trin k er aktivt (sekunder efter trinskift). */
const RUN: Record<number, { v: V; start: number; gap: number }> = {
  3: { v: 1, start: 0.35, gap: 0.6 },
  4: { v: 2, start: 0.85, gap: 0.45 },
}
const slotTime = (step: number, k: number) => RUN[step].start + k * RUN[step].gap

/* ------------------------------- Layout ------------------------------- */

interface Box {
  x: number
  y: number
  w: number
}
interface Lay {
  vb: [number, number]
  font: number
  cw: number // tegnbredde, mono
  chipFont: number
  chipCw: number
  callIn: { x0: number; x1: number; label: boolean }
  base: Box & { nameH: number; recipeH: number }
  slot: { x: number; w: number; y0: number; gap: number; h: number }
  badgeX: number
  opX: number
  chip: Record<V, [number, number]>
  sub: { y: number; nameH: number; rowH: number; w: number; x: Record<V, number> }
  arcs: Record<V, { d: string; end: [number, number] }[]>
}

function mkArcs(A: string, Ae: [number, number], B: string, Be: [number, number], mirror: (s: string) => string, mx: (x: number) => number) {
  return {
    1: [
      { d: A, end: Ae },
      { d: B, end: Be },
    ],
    2: [
      { d: mirror(A), end: [mx(Ae[0]), Ae[1]] as [number, number] },
      { d: mirror(B), end: [mx(Be[0]), Be[1]] as [number, number] },
    ],
  }
}

/** Spejler x-koordinaterne i en path med kun M/C/L/H/V-kommandoer og absolutte tal. */
function mirrorPath(d: string, W: number) {
  const toks = d.match(/[MCLHV]|-?\d+(\.\d+)?/g) ?? []
  let cmd = ''
  let i = 0
  return toks
    .map((tk) => {
      if (/[MCLHV]/.test(tk)) {
        cmd = tk
        i = 0
        return tk
      }
      const n = Number(tk)
      const isX = cmd === 'H' || (cmd !== 'V' && i % 2 === 0)
      i++
      return String(isX ? W - n : n)
    })
    .join(' ')
}

const WIDE: Lay = (() => {
  const W = 600
  return {
    vb: [W, 364],
    font: 12.5,
    cw: 7.5,
    chipFont: 11.5,
    chipCw: 6.9,
    callIn: { x0: 4, x1: 150, label: true },
    base: { x: 150, y: 24, w: 300, nameH: 30, recipeH: 26 },
    slot: { x: 172, w: 268, y0: 86, gap: 30, h: 24 },
    badgeX: 188,
    opX: 204,
    chip: { 1: [342, 33], 2: [380, 54] },
    sub: { y: 280, nameH: 28, rowH: 22, w: 180, x: { 1: 80, 2: 340 } },
    arcs: mkArcs(
      'M150 128 C104 128 92 168 92 272',
      [92, 280],
      'M150 188 C122 188 112 214 112 272',
      [112, 280],
      (s) => mirrorPath(s, W),
      (x) => W - x,
    ),
  } as Lay
})()

const NARROW: Lay = (() => {
  const W = 290
  return {
    vb: [W, 312],
    font: 12,
    cw: 7.2,
    chipFont: 11,
    chipCw: 6.6,
    callIn: { x0: 1, x1: 26, label: false },
    base: { x: 26, y: 4, w: 238, nameH: 28, recipeH: 26 },
    slot: { x: 38, w: 220, y0: 62, gap: 28, h: 22 },
    badgeX: 51,
    opX: 63,
    chip: { 1: [176, 27], 2: [206, 49] },
    sub: { y: 236, nameH: 26, rowH: 21, w: 134, x: { 1: 6, 2: 150 } },
    arcs: mkArcs(
      'M26 101 C8 101 10 150 10 228',
      [10, 236],
      'M26 157 C14 157 22 182 22 228',
      [22, 236],
      (s) => mirrorPath(s, W),
      (x) => W - x,
    ),
  } as Lay
})()

/* ------------------------------ Diagram ------------------------------ */

const draw = (on: boolean, live: boolean, delay: number, dur = 0.45) =>
  live
    ? {
        initial: { pathLength: 0, opacity: 1 },
        animate: { pathLength: 1, opacity: 1 },
        transition: { ...t.travel, duration: dur, delay },
      }
    : { initial: false as const, animate: { pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }, transition: t.fade }

const appear = (on: boolean, live: boolean, delay: number) =>
  live
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { ...t.fade, delay } }
    : { initial: false as const, animate: { opacity: on ? 1 : 0 }, transition: t.fade }

function Diagram({ L, step, className }: { L: Lay; step: number; className: string }) {
  const { base: B, slot: S, sub } = L
  const slotY = (k: number) => S.y0 + k * S.gap
  const slotC = (k: number) => slotY(k) + S.h / 2
  const baseBottom = slotY(3) + S.h + 10
  const recipeC = B.y + B.nameH + B.recipeH / 2
  const run = RUN[step]
  const subH = sub.nameH + 2 * sub.rowH + 6
  const subShown: Record<V, boolean> = { 1: step >= 2, 2: step >= 4 }
  const chipsIn: Record<V, number> = { 1: 2, 2: 4 } // trinnet hvor subklassens trin glider op
  const ranAt: Record<V, number> = { 1: 3, 2: 4 }
  const cw = L.cw

  return (
    <svg className={`swd-tm-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} style={{ fontSize: L.font }} aria-hidden="true">
      {/* Klienten kalder template-metoden. */}
      <g className="swd-tm-call">
        <motion.path
          key={`in-${run ? step : 's'}`}
          d={`M${L.callIn.x0} ${recipeC} H${L.callIn.x1 - 7}`}
          {...draw(step >= 3, !!run, 0, 0.35)}
        />
        <motion.path
          key={`inh-${run ? step : 's'}`}
          className="swd-tm-callhead"
          d={head(L.callIn.x1, recipeC, 'r')}
          {...appear(step >= 3, !!run, 0.3)}
        />
        {L.callIn.label && (
          <motion.text className="swd-tm-calllabel" x={(L.callIn.x0 + L.callIn.x1) / 2} y={recipeC - 8} textAnchor="middle" {...appear(step >= 3, false, 0)}>
            prepareRecipe()
          </motion.text>
        )}
      </g>

      {/* Basisklassen: navn, template-metode og skelettets fire trin. */}
      <rect className="swd-tm-box" x={B.x} y={B.y} width={B.w} height={baseBottom - B.y} />
      <text className="swd-tm-name is-abs" x={B.x + B.w / 2} y={B.y + B.nameH / 2} textAnchor="middle">
        CaffeineBeverage
      </text>
      <line className="swd-tm-sep" x1={B.x} x2={B.x + B.w} y1={B.y + B.nameH} y2={B.y + B.nameH} />
      <text className="swd-tm-op" x={B.x + 12} y={recipeC}>
        prepareRecipe()
      </text>
      <motion.g {...appear(step >= 1, step === 1, 0.1)}>
        <rect className="swd-tm-final" x={B.x + 12 + 15 * cw + 8} y={recipeC - 9} width={5 * L.chipCw + 12} height={18} rx={9} />
        <text className="swd-tm-final-t" x={B.x + 12 + 15 * cw + 8 + (5 * L.chipCw + 12) / 2} y={recipeC} textAnchor="middle" style={{ fontSize: L.chipFont }}>
          final
        </text>
      </motion.g>

      {SLOTS.map((s, k) => {
        const y = slotY(k)
        const c = slotC(k)
        const live = !!run
        const at = live ? slotTime(step, k) : 0
        return (
          <g key={s.op} className="swd-tm-slot" data-hole={s.hole || undefined}>
            <rect className="swd-tm-slot-r" x={S.x} y={y} width={S.w} height={S.h} rx={3} />
            {live && (
              <motion.rect
                key={`hot-${step}`}
                className="swd-tm-slot-hot"
                x={S.x}
                y={y}
                width={S.w}
                height={S.h}
                rx={3}
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{ duration: run.gap * 1.6, times: [0, 0.15, 0.6, 1], delay: at, ease: 'linear' }}
              />
            )}
            <motion.g {...appear(step >= 1, step === 1, 0.15 + k * 0.08)}>
              <circle className="swd-tm-badge" cx={L.badgeX} cy={c} r={7.5} />
              <text className="swd-tm-badge-n" x={L.badgeX} y={c} textAnchor="middle" style={{ fontSize: L.chipFont }}>
                {k + 1}
              </text>
            </motion.g>
            <text className={`swd-tm-op ${s.hole ? 'is-abs' : ''}`} x={L.opX} y={c}>
              {s.op}
            </text>
            {s.hole &&
              ([1, 2] as V[]).map((v) => {
                const [cx, cwid] = L.chip[v]
                const on = step >= chipsIn[v]
                const live2 = step === chipsIn[v]
                // Kilden: subklassens række med samme operation.
                const row = k === 1 ? 0 : 1
                const sx = sub.x[v] + 12 + (s.op.length * cw) / 2
                const sy = sub.y + sub.nameH + row * sub.rowH + sub.rowH / 2
                const dx = sx - (cx + cwid / 2)
                const dy = sy - c
                return (
                  <motion.g
                    key={`${v}-${live2 ? 'live' : 's'}`}
                    className="swd-tm-chip"
                    data-v={v}
                    initial={live2 ? { x: dx, y: dy, opacity: 0 } : false}
                    animate={on ? { x: 0, y: 0, opacity: 1 } : { x: 0, y: 0, opacity: 0 }}
                    transition={live2 ? { ...t.travel, delay: 0.35 + row * 0.18 } : t.fade}
                  >
                    <rect x={cx} y={c - 9} width={cwid} height={18} rx={3} />
                    <text x={cx + cwid / 2} y={c} textAnchor="middle" style={{ fontSize: L.chipFont }}>
                      {v === 1 ? 'Tea' : 'Coffee'}
                    </text>
                  </motion.g>
                )
              })}
          </g>
        )
      })}

      {/* Subklasserne og generaliseringen. */}
      {([1, 2] as V[]).map((v) => {
        const x = sub.x[v]
        const gx = x + sub.w / 2
        const on = subShown[v]
        const live = step === (v === 1 ? 2 : 4)
        const ran = step >= ranAt[v]
        const liveRun = run?.v === v
        return (
          <g key={v} className="swd-tm-subg" data-v={v}>
            <motion.path className="swd-tm-uml" d={`M${gx} ${sub.y} V${baseBottom + 12}`} key={`g-${v}-${live}`} {...draw(on, live, 0.2, 0.4)} />
            <motion.path className="swd-tm-tri" d={triUp(gx, baseBottom)} key={`t-${v}-${live}`} {...appear(on, live, 0.45)} />
            <motion.g
              key={`b-${v}-${live}`}
              initial={live ? { opacity: 0, y: 8 } : false}
              animate={{ opacity: on ? 1 : 0, y: 0 }}
              transition={live ? t.place : t.fade}
            >
              <rect className="swd-tm-box" x={x} y={sub.y} width={sub.w} height={subH} />
              <text className="swd-tm-name" x={x + sub.w / 2} y={sub.y + sub.nameH / 2} textAnchor="middle">
                {v === 1 ? 'Tea' : 'Coffee'}
              </text>
              <line className="swd-tm-sep" x1={x} x2={x + sub.w} y1={sub.y + sub.nameH} y2={sub.y + sub.nameH} />
              {['brew()', 'addCondiments()'].map((op, r) => {
                const ry = sub.y + sub.nameH + 3 + r * sub.rowH
                return (
                  <g key={op}>
                    {liveRun && (
                      <motion.rect
                        className="swd-tm-row-hot"
                        data-v={v}
                        x={x + 4}
                        y={ry}
                        width={sub.w - 8}
                        height={sub.rowH - 2}
                        rx={3}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: [0, 1, 1, 0] }}
                        transition={{ duration: run.gap * 1.8, times: [0, 0.2, 0.7, 1], delay: slotTime(step, r === 0 ? 1 : 3) + 0.35, ease: 'linear' }}
                      />
                    )}
                    <text className="swd-tm-op" x={x + 12} y={ry + (sub.rowH - 2) / 2}>
                      {op}
                    </text>
                  </g>
                )
              })}
            </motion.g>

            {/* Kaldene ned i subklassen: basisklassen kalder, aldrig omvendt. */}
            {L.arcs[v].map((a, i) => {
              const delay = liveRun ? slotTime(step, i === 0 ? 1 : 3) + 0.05 : 0
              return (
                <g key={i} className="swd-tm-call" data-dim={(run && run.v !== v) || undefined}>
                  <motion.path key={`a-${liveRun}`} d={a.d} {...draw(ran, liveRun, delay, 0.4)} />
                  <motion.path
                    key={`ah-${liveRun}`}
                    className="swd-tm-callhead"
                    d={head(a.end[0], a.end[1], 'd')}
                    {...appear(ran, liveRun, delay + 0.35)}
                  />
                </g>
              )
            })}
          </g>
        )
      })}
    </svg>
  )
}

/* --------------------------- Program og output --------------------------- */

type Seg = string | { t: string; key: 'newTea' | 'newCoffee' }
const PROGRAM: { segs: Seg[]; at: number; ind?: boolean }[] = [
  { segs: ['Tea myTea = ', { t: 'new Tea()', key: 'newTea' }, ';'], at: 2 },
  { segs: ['myTea.prepareRecipe();'], at: 3 },
  { segs: ['Coffee myCoffee ='], at: 4 },
  { segs: [{ t: 'new Coffee()', key: 'newCoffee' }, ';'], at: 4, ind: true },
  { segs: ['myCoffee.prepareRecipe();'], at: 4 },
]

function Panel({ step, last }: { step: number; last: number }) {
  return (
    <aside className="swd-tm-panel">
      <div className="swd-tm-panel-h">Program</div>
      <div className="swd-tm-code">
        {PROGRAM.map((l, i) => {
          const state = step === l.at ? 'now' : step > l.at ? 'done' : 'todo'
          return (
            <div key={i} className="swd-tm-ln" data-state={state} style={l.ind ? { paddingLeft: '2.4ch' } : undefined}>
              <code>
                {l.segs.map((s, j) =>
                  typeof s === 'string' ? (
                    s
                  ) : (
                    <span key={j} className="swd-tm-new" data-hl={step === last || undefined}>
                      {s.t}
                    </span>
                  ),
                )}
              </code>
            </div>
          )
        })}
      </div>
      <div className="swd-tm-panel-h">Output</div>
      <div className="swd-tm-out">
        {([1, 2] as V[]).map((v) => {
          const runStep = v === 1 ? 3 : 4
          return (
            <div key={v} className="swd-tm-out-run">
              {SLOTS.map((s, k) => {
                const on = step >= runStep
                const live = step === runStep
                return (
                  <motion.div
                    key={`${k}-${live}`}
                    className="swd-tm-out-ln"
                    data-v={s.hole ? v : undefined}
                    initial={live ? { opacity: 0, x: -4 } : false}
                    animate={{ opacity: on ? 1 : 0, x: 0 }}
                    transition={live ? { ...t.settle, delay: slotTime(runStep, k) + (s.hole ? 0.45 : 0.15) } : t.fade}
                  >
                    {s.out[v - 1]}
                  </motion.div>
                )
              })}
            </div>
          )
        })}
      </div>
    </aside>
  )
}

/* -------------------------------- Figur -------------------------------- */

function Key({ children, icon }: { children: ReactNode; icon: 'call' | 'gen' }) {
  return (
    <span className="swd-tm-key">
      <svg viewBox="0 0 28 12" aria-hidden="true">
        {icon === 'call' ? (
          <>
            <path className="swd-tm-key-call" d="M1 6 H20" />
            <path className="swd-tm-key-callhead" d={head(27, 6, 'r', 7, 4)} />
          </>
        ) : (
          <>
            <path className="swd-tm-key-uml" d="M1 6 H16" />
            <path className="swd-tm-key-tri" d="M27 6 L16 1 L16 11Z" />
          </>
        )}
      </svg>
      {children}
    </span>
  )
}

const LAST = 5

function TemplateMethod({ step }: { step: number }) {
  return (
    <div className="swd-tm">
      <div className="swd-tm-top">
        <span className="swd-tm-mode">
          <strong>Arv</strong> · compile-time
        </span>
        <span className="swd-tm-keys">
          <Key icon="gen">generalisering</Key>
          <Key icon="call">kald på runtime</Key>
        </span>
      </div>
      <div className="swd-tm-main">
        <div className="swd-tm-dia">
          <Diagram L={WIDE} step={step} className="swd-tm-wide" />
          <Diagram L={NARROW} step={step} className="swd-tm-narrow" />
        </div>
        <Panel step={step} last={LAST} />
      </div>
      <motion.div
        className="swd-tm-verdict"
        initial={false}
        animate={{ opacity: step === LAST ? 1 : 0, y: step === LAST ? 0 : 4 }}
        transition={step === LAST ? t.settle : t.fade}
        aria-hidden={step !== LAST || undefined}
      >
        <span className="swd-tm-verdict-i" data-neg>
          ✗
        </span>
        <span className="swd-tm-verdict-t">
          <code>myTea</code> kan ikke skifte til <code>Coffee</code>-adfærd. Klassen blev valgt ved <code>new Tea()</code>.
        </span>
        <Tag tone="focus" show={step === LAST}>
          compile-time
        </Tag>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'template-method',
  title: 'Skelettet ligger fast, subklassen udfylder trin',
  steps: [
    {
      caption: '`prepareRecipe()` er skelettet: fire trin i fast rækkefølge. `brew()` og `addCondiments()` er abstrakte — huller i opskriften.',
      hold: 2600,
    },
    {
      caption: 'Template-metoden er `final` og kan ikke overrides. Subklasser kan ikke ændre opskriften.',
      hold: 2200,
    },
    {
      caption: '`Tea` arver fra `CaffeineBeverage` og leverer kun de to trin, der varierer.',
      hold: 2400,
    },
    {
      caption: 'Basisklassen kører skelettet og kalder ned i subklassen ved trin 2 og 4 — “Don’t call us, we’ll call you.”',
      hold: 3000,
    },
    {
      caption: '`Coffee` fylder de samme huller anderledes. Trin 1 og 3 er identiske, trin 2 og 4 skifter.',
      hold: 3000,
    },
    {
      caption: 'Arv: adfærden ligger fast, når objektet er oprettet. Skal den byttes på runtime, er det [[strategy|Strategy]].',
      hold: 2600,
    },
  ],
  Component: TemplateMethod,
}

export default viz
