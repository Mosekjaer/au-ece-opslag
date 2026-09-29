import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './strategy.css'

/* HFDP (SWD_Head-First-Design-Patterns-2nd-Edition.pdf) PDF s. 56: Duck med
   FlyBehavior flyBehavior; performFly() → flyBehavior.fly(). PDF s. 56–58:
   FlyNoWay (“I can't fly”), FlyWithWings, FlyRocketPowered (“I'm flying with a
   rocket!”), setFlyBehavior(FlyBehavior fb), ModelDuck starter med FlyNoWay.
   PDF s. 59: programmet i panelet, linje for linje. Slides GoF Template Method,
   GoF Strategy.pdf s. 16 (rollerne Context/Strategy), s. 22 (“delegation — Behavior
   can be changed at runtime”), s. 27 (Duck ◆— FlyBehavior som komposition).
   QuackBehavior er udeladt; figuren handler om flyveadfærden.
   Visuelt sprog deles med template-method.tsx: variant 1 (FlyNoWay) i blæk,
   variant 2 (FlyRocketPowered) i accent, kald og referencer på runtime som tykke
   accentpile, UML-relationer i tynd blæk. */

type V = 1 | 2
type Dir = 'r' | 'l' | 'd' | 'u'
type Pt = [number, number]

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
/** Lukket hul trekant, spidsen opad i (x, y). */
const triUp = (x: number, y: number) => `M${x} ${y} L${x - 7} ${y + 12} L${x + 7} ${y + 12}Z`
/** Fyldt rombe (komposition) med spidsen i (x, y), pegende mod helheden. */
function diamond(x: number, y: number, dir: 'l' | 'u') {
  return dir === 'l' ? `M${x} ${y} L${x + 8} ${y - 5} L${x + 16} ${y} L${x + 8} ${y + 5}Z` : `M${x} ${y} L${x - 5} ${y + 8} L${x} ${y + 16} L${x + 5} ${y + 8}Z`
}

/** Punkter langs en polyline, med tider efter længde (til et rejsende kald). */
function along(pts: Pt[]) {
  const len = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const tot = len[len.length - 1] || 1
  return { x: pts.map((p) => p[0]), y: pts.map((p) => p[1]), times: len.map((l) => l / tot) }
}
function cubic(p0: Pt, p1: Pt, p2: Pt, p3: Pt, n = 14): Pt[] {
  return Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n
    const m = 1 - u
    const f = (k: 0 | 1) => m * m * m * p0[k] + 3 * m * m * u * p1[k] + 3 * m * u * u * p2[k] + u * u * u * p3[k]
    return [f(0), f(1)] as Pt
  })
}

/* ------------------------------ Indhold ------------------------------ */

const STRATS = [
  { name: 'FlyWithWings', v: 0 },
  { name: 'FlyNoWay', v: 1 },
  { name: 'FlyRocketPowered', v: 2 },
] as const
/** Hvilken strategi flyBehavior peger på efter hvert trin. */
const current = (step: number): 1 | 2 => (step >= 2 ? 2 : 1)

/* ------------------------------- Layout ------------------------------- */

interface Lay {
  vb: [number, number]
  font: number
  cw: number
  ui: number
  duck: { x: number; y: number; w: number; nameH: number; rowH: number }
  callIn: { x0: number; label: boolean }
  model: { x: number; y: number; w: number; nameH: number; rowH: number }
  iface: { x: number; y: number; w: number; nameH: number; rowH: number }
  comp: { d: string; dia: [number, number, 'l' | 'u']; mult: [number, number, 'start' | 'end'] }
  trunkX: number
  strat: { x: number; w: number; y: number[]; nameH: number; rowH: number }
  /** Referencen fra feltet til strategi-objektet: path og rejsepunkter. */
  ref: (to: number) => { d: string; pts: Pt[]; end: Pt; dir: Dir }
  roles: boolean
}

const WIDE: Lay = {
  vb: [600, 306],
  font: 12.5,
  cw: 7.5,
  ui: 11.5,
  duck: { x: 150, y: 24, w: 200, nameH: 30, rowH: 24 },
  callIn: { x0: 4, label: true },
  model: { x: 170, y: 196, w: 160, nameH: 28, rowH: 22 },
  iface: { x: 400, y: 24, w: 170, nameH: 40, rowH: 24 },
  comp: { d: 'M366 44 H400', dia: [350, 44, 'l'], mult: [394, 35, 'end'] },
  trunkX: 415,
  strat: { x: 436, w: 158, y: [120, 186, 252], nameH: 26, rowH: 22 },
  ref: (to) => {
    const p0: Pt = [350, 66]
    const p3: Pt = [428, to]
    return {
      d: `M350 66 C392 66 394 ${to} 428 ${to}`,
      pts: cubic(p0, [392, 66], [394, to], p3),
      end: [436, to],
      dir: 'r',
    }
  },
  roles: true,
}

const NARROW: Lay = {
  vb: [290, 394],
  font: 11.5,
  cw: 6.9,
  ui: 11,
  duck: { x: 16, y: 14, w: 248, nameH: 26, rowH: 22 },
  callIn: { x0: 1, label: false },
  model: { x: 16, y: 152, w: 96, nameH: 26, rowH: 20 },
  iface: { x: 120, y: 152, w: 144, nameH: 38, rowH: 22 },
  comp: { d: 'M200 128 V152', dia: [200, 112, 'u'], mult: [207, 145, 'start'] },
  trunkX: 130,
  strat: { x: 146, w: 118, y: [236, 290, 344], nameH: 24, rowH: 20 },
  ref: (to) => ({
    d: `M264 51 H280 V${to} H272`,
    pts: [
      [264, 51],
      [280, 51],
      [280, to],
      [266, to],
    ],
    end: [264, to],
    dir: 'l',
  }),
  roles: false,
}

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

/** Kort fremhævning af en række, når kaldet rammer den. */
function Pulse({ x, y, w, h, v, delay, k }: { x: number; y: number; w: number; h: number; v: 0 | V; delay: number; k: string }) {
  return (
    <motion.rect
      key={k}
      className="swd-st-row-hot"
      data-v={v || undefined}
      x={x}
      y={y}
      width={w}
      height={h}
      rx={3}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0.0] }}
      transition={{ duration: 1.4, times: [0, 0.15, 0.75, 1], delay, ease: 'linear' }}
    />
  )
}

/** Tidspunkter i trin 1 og 3 (kaldet) og trin 2 (byttet). */
const CALL = { row: 0.3, travel: 0.55, travelDur: 0.7, hit: 1.2, out: 1.35 }
const SWAP = { row: 0.3, move: 0.55, land: 1.3 }

function Diagram({ L, step, className }: { L: Lay; step: number; className: string }) {
  const { duck: D, model: M, iface: I, strat: S } = L
  const attrC = D.y + D.nameH + D.rowH / 2
  const opsY = D.y + D.nameH + D.rowH + 2
  const opC = (k: number) => opsY + k * D.rowH + D.rowH / 2
  const duckBottom = opsY + 2 * D.rowH + 4
  const stratMid = (i: number) => S.y[i] + (S.nameH + S.rowH) / 2
  const cur = current(step)
  const curIdx = cur === 1 ? 1 : 2
  const calling = step === 1 || step === 3
  const swapping = step === 2
  const ref = L.ref(stratMid(curIdx))
  const path = along(ref.pts)
  const modelBottom = M.y + M.nameH + M.rowH + 4
  const ifaceBottom = I.y + I.nameH + I.rowH + 4

  const inArrow = (k: 0 | 1, on: boolean, live: boolean, label: string) => (
    <g className="swd-st-call">
      <motion.path key={`in${k}-${live}`} d={`M${L.callIn.x0} ${opC(k)} H${D.x - 7}`} {...draw(on, live, 0, 0.35)} />
      <motion.path key={`inh${k}-${live}`} className="swd-st-callhead" d={head(D.x, opC(k), 'r')} {...appear(on, live, 0.3)} />
      {L.callIn.label && (
        <motion.text className="swd-st-calllabel" x={(L.callIn.x0 + D.x) / 2} y={opC(k) - 8} textAnchor="middle" {...appear(on, false, 0)}>
          {label}
        </motion.text>
      )}
    </g>
  )

  return (
    <svg className={`swd-st-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} style={{ fontSize: L.font }} aria-hidden="true">
      {L.roles && (
        <g className="swd-st-role" style={{ fontSize: L.ui }}>
          <text x={D.x + D.w / 2} y={12} textAnchor="middle">
            Context
          </text>
          <text x={I.x + I.w / 2} y={12} textAnchor="middle">
            Strategy
          </text>
        </g>
      )}

      {/* Klienten kalder. */}
      {inArrow(0, step >= 1, calling, 'performFly()')}
      {inArrow(1, step >= 2, swapping, 'setFlyBehavior(…)')}

      {/* Duck (Context). */}
      <rect className="swd-st-box" x={D.x} y={D.y} width={D.w} height={duckBottom - D.y} />
      <text className="swd-st-name is-abs" x={D.x + D.w / 2} y={D.y + D.nameH / 2} textAnchor="middle">
        Duck
      </text>
      <motion.text
        className="swd-st-same"
        x={D.x + D.w - 8}
        y={D.y + D.nameH / 2}
        textAnchor="end"
        style={{ fontSize: L.ui }}
        {...appear(step >= 2, swapping, SWAP.land)}
      >
        ✓ uændret
      </motion.text>
      <line className="swd-st-sep" x1={D.x} x2={D.x + D.w} y1={D.y + D.nameH} y2={D.y + D.nameH} />
      <text className="swd-st-op" x={D.x + 10} y={attrC}>
        flyBehavior: FlyBehavior
      </text>
      <line className="swd-st-sep" x1={D.x} x2={D.x + D.w} y1={opsY - 2} y2={opsY - 2} />
      {calling && <Pulse k={`p0-${step}`} x={D.x + 4} y={opsY + 1} w={D.w - 8} h={D.rowH - 2} v={0} delay={CALL.row} />}
      {swapping && <Pulse k={`p1-${step}`} x={D.x + 4} y={opsY + D.rowH + 1} w={D.w - 8} h={D.rowH - 2} v={0} delay={SWAP.row} />}
      <text className="swd-st-op" x={D.x + 10} y={opC(0)}>
        performFly()
      </text>
      <text className="swd-st-op" x={D.x + 10} y={opC(1)}>
        setFlyBehavior(fb)
      </text>

      {/* ModelDuck —▷ Duck */}
      <path className="swd-st-uml" d={`M${M.x + M.w / 2} ${M.y} V${duckBottom + 12}`} />
      <path className="swd-st-tri" d={triUp(M.x + M.w / 2, duckBottom)} />
      <rect className="swd-st-box" x={M.x} y={M.y} width={M.w} height={modelBottom - M.y} />
      <text className="swd-st-name" x={M.x + M.w / 2} y={M.y + M.nameH / 2} textAnchor="middle">
        ModelDuck
      </text>
      <line className="swd-st-sep" x1={M.x} x2={M.x + M.w} y1={M.y + M.nameH} y2={M.y + M.nameH} />
      <text className="swd-st-op" x={M.x + 10} y={M.y + M.nameH + M.rowH / 2 + 2}>
        display()
      </text>
      <motion.text
        className="swd-st-same"
        x={L.roles ? M.x + M.w + 8 : M.x + M.w / 2}
        y={L.roles ? M.y + M.nameH / 2 : modelBottom + 13}
        textAnchor={L.roles ? 'start' : 'middle'}
        style={{ fontSize: L.ui }}
        {...appear(step >= 2, swapping, SWAP.land + 0.1)}
      >
        ✓ uændret
      </motion.text>

      {/* Duck ◆— FlyBehavior (komposition, slide 27). */}
      <path className="swd-st-uml" d={L.comp.d} />
      <path className="swd-st-diamond" d={diamond(...(L.comp.dia as [number, number, 'l' | 'u']))} />
      <text className="swd-st-mult" x={L.comp.mult[0]} y={L.comp.mult[1]} textAnchor={L.comp.mult[2]} style={{ fontSize: L.ui }}>
        1
      </text>

      {/* «interface» FlyBehavior */}
      <rect className="swd-st-box" x={I.x} y={I.y} width={I.w} height={ifaceBottom - I.y} />
      <text className="swd-st-stereo" x={I.x + I.w / 2} y={I.y + 12} textAnchor="middle" style={{ fontSize: L.ui }}>
        «interface»
      </text>
      <text className="swd-st-name" x={I.x + I.w / 2} y={I.y + I.nameH - 12} textAnchor="middle">
        FlyBehavior
      </text>
      <line className="swd-st-sep" x1={I.x} x2={I.x + I.w} y1={I.y + I.nameH} y2={I.y + I.nameH} />
      <text className="swd-st-op is-abs" x={I.x + 10} y={I.y + I.nameH + I.rowH / 2 + 1}>
        fly()
      </text>

      {/* Realiseringer: stiplet stamme op til den hule trekant. */}
      <path className="swd-st-tri" d={triUp(L.trunkX, ifaceBottom)} />
      <path className="swd-st-uml is-dash" d={`M${L.trunkX} ${ifaceBottom + 12} V${stratMid(2)}`} />
      {STRATS.map((s, i) => (
        <path key={s.name} className="swd-st-uml is-dash" d={`M${L.trunkX} ${stratMid(i)} H${S.x}`} />
      ))}

      {STRATS.map((s, i) => {
        const isCur = s.v === cur
        const y = S.y[i]
        const hit = calling && isCur
        return (
          <g key={s.name} className="swd-st-strat" data-v={s.v || undefined} data-cur={isCur || undefined}>
            <rect
              className="swd-st-box swd-st-sbox"
              x={S.x}
              y={y}
              width={S.w}
              height={S.nameH + S.rowH + 2}
              style={swapping ? { transitionDelay: `${isCur ? SWAP.land - 0.2 : SWAP.move}s` } : undefined}
            />
            <text className="swd-st-name" x={S.x + S.w / 2} y={y + S.nameH / 2} textAnchor="middle">
              {s.name}
            </text>
            <line className="swd-st-sep" x1={S.x} x2={S.x + S.w} y1={y + S.nameH} y2={y + S.nameH} />
            {hit && <Pulse k={`s-${step}`} x={S.x + 4} y={y + S.nameH + 1} w={S.w - 8} h={S.rowH - 1} v={s.v as V} delay={CALL.hit} />}
            <text className="swd-st-op" x={S.x + 10} y={y + S.nameH + S.rowH / 2 + 1}>
              fly()
            </text>
          </g>
        )
      })}

      {/* Referencen på runtime: feltet peger på ét strategi-objekt. */}
      <g className="swd-st-call">
        <motion.path
          initial={false}
          animate={{ d: ref.d }}
          transition={swapping ? { ...t.travel, delay: SWAP.move } : t.fade}
        />
        <motion.path
          className="swd-st-callhead"
          initial={false}
          animate={{ d: head(ref.end[0], ref.end[1], ref.dir) }}
          transition={swapping ? { ...t.travel, delay: SWAP.move } : t.fade}
        />
      </g>

      {/* Kaldet rejser langs referencen: delegation. */}
      {calling && (
        <motion.circle
          key={`dot-${step}`}
          className="swd-st-dot"
          r={5}
          cx={0}
          cy={0}
          initial={{ x: path.x[0], y: path.y[0], opacity: 0 }}
          animate={{ x: path.x, y: path.y, opacity: [0, 1, 1, 0] }}
          transition={{
            x: { duration: CALL.travelDur, delay: CALL.travel, times: path.times, ease: 'linear' },
            y: { duration: CALL.travelDur, delay: CALL.travel, times: path.times, ease: 'linear' },
            opacity: { duration: CALL.travelDur + 0.25, delay: CALL.travel, times: [0, 0.1, 0.8, 1] },
          }}
        />
      )}
    </svg>
  )
}

/* --------------------------- Program og output --------------------------- */

const PROGRAM: { text: ReactNode; at: number; ind?: boolean; key?: boolean }[] = [
  { text: 'Duck model =', at: 0 },
  { text: 'new ModelDuck();', at: 0, ind: true },
  { text: 'model.performFly();', at: 1 },
  { text: 'model.setFlyBehavior(', at: 2, key: true },
  { text: 'new FlyRocketPowered());', at: 2, ind: true, key: true },
  { text: 'model.performFly();', at: 3 },
]
const OUTPUT: { text: string; v: V; at: number }[] = [
  { text: "I can't fly", v: 1, at: 1 },
  { text: "I'm flying with a rocket!", v: 2, at: 3 },
]

function Panel({ step, last }: { step: number; last: number }) {
  return (
    <aside className="swd-st-panel">
      <div className="swd-st-panel-h">Program</div>
      <div className="swd-st-code">
        {PROGRAM.map((l, i) => {
          const state = step === l.at ? 'now' : step > l.at ? 'done' : 'todo'
          return (
            <div key={i} className="swd-st-ln" data-state={state} style={l.ind ? { paddingLeft: '2.4ch' } : undefined}>
              <code>
                {l.key ? (
                  <span className="swd-st-new" data-hl={step === last || undefined}>
                    {l.text}
                  </span>
                ) : (
                  l.text
                )}
              </code>
            </div>
          )
        })}
      </div>
      <div className="swd-st-panel-h">Output</div>
      <div className="swd-st-out">
        {OUTPUT.map((o) => {
          const live = step === o.at
          return (
            <motion.div
              key={`${o.at}-${live}`}
              className="swd-st-out-ln"
              data-v={o.v}
              initial={live ? { opacity: 0, x: -4 } : false}
              animate={{ opacity: step >= o.at ? 1 : 0, x: 0 }}
              transition={live ? { ...t.settle, delay: CALL.out } : t.fade}
            >
              {o.text}
            </motion.div>
          )
        })}
      </div>
    </aside>
  )
}

/* -------------------------------- Figur -------------------------------- */

type KeyIcon = 'call' | 'gen' | 'real' | 'comp'
function Key({ children, icon }: { children: ReactNode; icon: KeyIcon }) {
  return (
    <span className="swd-st-key">
      <svg viewBox="0 0 28 12" aria-hidden="true">
        {icon === 'call' && (
          <>
            <path className="swd-st-key-call" d="M1 6 H20" />
            <path className="swd-st-key-callhead" d={head(27, 6, 'r', 7, 4)} />
          </>
        )}
        {(icon === 'gen' || icon === 'real') && (
          <>
            <path className={`swd-st-key-uml ${icon === 'real' ? 'is-dash' : ''}`} d="M1 6 H16" />
            <path className="swd-st-key-tri" d="M27 6 L16 1 L16 11Z" />
          </>
        )}
        {icon === 'comp' && (
          <>
            <path className="swd-st-key-dia" d="M1 6 L8 2 L15 6 L8 10Z" />
            <path className="swd-st-key-uml" d="M15 6 H27" />
          </>
        )}
      </svg>
      {children}
    </span>
  )
}

const LAST = 4

function Strategy({ step }: { step: number }) {
  return (
    <div className="swd-st">
      <div className="swd-st-top">
        <span className="swd-st-mode">
          <strong>Delegation</strong> · runtime
        </span>
        <span className="swd-st-keys">
          <Key icon="comp">komposition</Key>
          <Key icon="real">realisering</Key>
          <Key icon="gen">generalisering</Key>
          <Key icon="call">kald / reference på runtime</Key>
        </span>
      </div>
      <div className="swd-st-main">
        <div className="swd-st-dia">
          <Diagram L={WIDE} step={step} className="swd-st-wide" />
          <Diagram L={NARROW} step={step} className="swd-st-narrow" />
        </div>
        <Panel step={step} last={LAST} />
      </div>
      <motion.div
        className="swd-st-verdict"
        initial={false}
        animate={{ opacity: step === LAST ? 1 : 0, y: step === LAST ? 0 : 4 }}
        transition={step === LAST ? t.settle : t.fade}
        aria-hidden={step !== LAST || undefined}
      >
        <span className="swd-st-verdict-i">✓</span>
        <span className="swd-st-verdict-t">
          Samme <code>model</code>, ny adfærd: <code>setFlyBehavior()</code> byttede objektet bag referencen.
        </span>
        <Tag tone="focus" show={step === LAST}>
          runtime
        </Tag>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'strategy',
  title: 'Anden bytter flyveadfærd i flugten',
  steps: [
    {
      caption: '`ModelDuck` har en `FlyBehavior` — lige nu `FlyNoWay`. `Duck` er *Context*, `FlyBehavior` er *Strategy*.',
      hold: 2600,
    },
    {
      caption: '`performFly()` gør ikke selv noget — den delegerer til `flyBehavior.fly()`.',
      hold: 2600,
    },
    {
      caption: 'Setteren skifter objektet bag referencen — på runtime, uden at ændre en eneste klasse.',
      hold: 3000,
    },
    {
      caption: 'Samme kald, ny adfærd.',
      hold: 2400,
    },
    {
      caption: 'Strategy: konteksten *has-a* strategi og delegerer. Adfærden vælges på runtime — [[template-method|Template Method]] vælger den ved `new`.',
      hold: 2600,
    },
  ],
  Component: Strategy,
}

export default viz
