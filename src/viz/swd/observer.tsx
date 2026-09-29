import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './observer.css'

/* Design Patterns - GoF Observer.pdf s. 6 (struktur: Subject med Attach/Detach/Notify,
   observers *, Observer.Update()), s. 7 (pull-sekvens: Update(), GetSubjectState(),
   retur state), s. 11 (“Pull Variant Problems”: ConcreteObserver kender
   ConcreteSubject), s. 13 (push-sekvens: Update(subjectState), intet tilbagekald).
   HFDP (SWD_Head-First-Design-Patterns-2nd-Edition.pdf) PDF s. 95 (WeatherData og de
   tre displays), s. 96 (push: update(temp, humidity, pressure)), s. 98 (registerObserver,
   removeObserver, notifyObservers), s. 99 (setMeasurements(80, 65, 30.4f), (82, 70,
   29.2f), (78, 90, 29.2f)), s. 107 (pull: update() og weatherData.getTemperature() /
   getHumidity()). Scenen er et objektdiagram med beskeder (understregede instanser,
   links som fulde linjer); startværdierne 0.0 er Javas default for float-felter. */

type Pt = [number, number]
type Dir = 'r' | 'l' | 'd' | 'u'

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
function along(pts: Pt[]) {
  const len = [0]
  for (let i = 1; i < pts.length; i++) len.push(len[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]))
  const tot = len[len.length - 1] || 1
  return { x: pts.map((p) => p[0]), y: pts.map((p) => p[1]), times: len.map((l) => l / tot) }
}
const dPoly = (pts: Pt[]) => pts.map((p, i) => `${i ? 'L' : 'M'}${p[0]} ${p[1]}`).join(' ')

/* ------------------------------ Indhold ------------------------------ */

const DISPLAYS = ['CurrentConditionsDisplay', 'StatisticsDisplay', 'ForecastDisplay'] as const

/** Målingerne i WeatherData efter hvert trin. */
const VALUES = (step: number) =>
  step <= 1 ? ['0.0', '0.0', '0.0'] : step === 2 ? ['80', '65', '30.4'] : step === 3 ? ['82', '70', '29.2'] : ['78', '90', '29.2']
const CALL_IN = (step: number) =>
  step === 2 ? 'setMeasurements(80, 65, 30.4f)' : step === 3 ? 'setMeasurements(82, 70, 29.2f)' : 'setMeasurements(78, 90, 29.2f)'

/** Hvad hvert display sidst har modtaget (række 1) og selv kaldt (række 2). */
function rows(step: number, i: number): [string, string] {
  if (step < 2) return ['', '']
  if (i === 2) return step >= 3 ? ['← update(80, 65, 30.4)', 'afmeldt: får intet'] : ['← update(80, 65, 30.4)', '']
  if (step === 2) return ['← update(80, 65, 30.4)', '']
  if (step === 3) return ['← update(82, 70, 29.2)', '']
  return ['← update()', i === 0 ? '→ getTemperature(): 78' : '→ getHumidity(): 90']
}

/* Tider (sekunder efter trinskift). */
const REG = (i: number) => 0.2 + i * 0.7
const PUSH2 = { vals: 0.35, notify: 0.5, send: 0.85, dur: 0.75 }
const UNSUB = { send: 0.1, dur: 0.7, gone: 0.8, call: 1.1, vals: 1.3, notify: 1.35, send2: 1.6, dur2: 0.7 }
const PULL = { vals: 0.3, notify: 0.4, send: 0.6, dur: 0.6, back: 1.35, backDur: 0.5 }

/* ------------------------------- Layout ------------------------------- */

interface Lay {
  vb: [number, number]
  font: number
  small: number
  box: { x: number; y: number; w: number; nameH: number; slotH: number; headH: number; rowH: number }
  callIn: { x: number; labelY: number; y0: number }
  disp: { x: number; w: number; y: number[]; nameH: number; rowH: number }
  /** Linket fra listen til display i (polyline). */
  link: (i: number, rowC: number, dispC: number) => Pt[]
  /** Segmenter der tegnes for linket (i den smalle variant deles en bus). */
  linkSegs: (i: number, rowC: number, dispC: (k: number) => number) => string[]
  midLabels: boolean
  pull: (i: number, dispC: number, tempC: number) => { pts: Pt[]; end: Pt; dir: Dir }
  pullLabel: [number, number, 'start' | 'middle' | 'end']
  roleLabels: boolean
}

const WIDE: Lay = {
  vb: [840, 292],
  font: 12.5,
  small: 11.5,
  box: { x: 120, y: 44, w: 230, nameH: 28, slotH: 20, headH: 24, rowH: 24 },
  callIn: { x: 235, labelY: 10, y0: 20 },
  disp: { x: 608, w: 228, y: [44, 128, 212], nameH: 28, rowH: 20 },
  link: (_i, rowC, dispC) => [
    [350, rowC],
    [608, dispC],
  ],
  linkSegs: (i, rowC, dispC) => [`M350 ${rowC} L608 ${dispC(i)}`],
  midLabels: true,
  pull: (_i, dispC, tempC) => ({
    pts: [
      [608, dispC + 14],
      [358, tempC],
    ],
    end: [350, tempC],
    dir: 'l',
  }),
  pullLabel: [479, 70, 'middle'],
  roleLabels: true,
}

const NARROW: Lay = {
  vb: [290, 482],
  font: 11.5,
  small: 11,
  box: { x: 20, y: 32, w: 250, nameH: 26, slotH: 19, headH: 22, rowH: 22 },
  callIn: { x: 145, labelY: 8, y0: 16 },
  disp: { x: 50, w: 230, y: [236, 314, 392], nameH: 26, rowH: 19 },
  link: (_i, _rowC, dispC) => [
    [36, 217],
    [36, dispC],
    [50, dispC],
  ],
  linkSegs: (i, _rowC, dispC) => [`M36 ${i === 0 ? 217 : dispC(i - 1)} V${dispC(i)}`, `M36 ${dispC(i)} H50`],
  midLabels: false,
  pull: (_i, dispC, tempC) => ({
    pts: [
      [280, dispC + 10],
      [286, dispC + 10],
      [286, tempC],
      [278, tempC],
    ],
    end: [270, tempC],
    dir: 'l',
  }),
  pullLabel: [145, 476, 'middle'],
  roleLabels: false,
}

/* ------------------------------ Hjælpere ------------------------------ */

const fadeTo = (on: boolean, live: boolean, delay: number) =>
  live
    ? { initial: { opacity: 0 }, animate: { opacity: on ? 1 : 0 }, transition: { ...t.fade, delay } }
    : { initial: false as const, animate: { opacity: on ? 1 : 0 }, transition: t.fade }

function Dot({ pts, delay, dur, k, neg }: { pts: Pt[]; delay: number; dur: number; k: string; neg?: boolean }) {
  const p = along(pts)
  return (
    <motion.circle
      key={k}
      className="swd-obs-dot"
      data-neg={neg || undefined}
      r={5}
      cx={0}
      cy={0}
      initial={{ x: p.x[0], y: p.y[0], opacity: 0 }}
      animate={{ x: p.x, y: p.y, opacity: [0, 1, 1, 0] }}
      transition={{
        x: { duration: dur, delay, times: p.times, ease: 'easeInOut' },
        y: { duration: dur, delay, times: p.times, ease: 'easeInOut' },
        opacity: { duration: dur + 0.15, delay, times: [0, 0.1, 0.85, 1] },
      }}
    />
  )
}

/** Beskedlabel midt på linket, mens kaldet er undervejs. */
function Msg({ x, y, text, delay, dur, k, small, neg }: { x: number; y: number; text: string; delay: number; dur: number; k: string; small: number; neg?: boolean }) {
  const w = text.length * small * 0.6 + 12
  return (
    <motion.g
      key={k}
      className="swd-obs-msg"
      data-neg={neg || undefined}
      initial={{ opacity: 0 }}
      animate={{ opacity: [0, 1, 1, 0] }}
      transition={{ duration: dur + 0.5, delay, times: [0, 0.15, 0.8, 1], ease: 'linear' }}
    >
      <rect x={x - w / 2} y={y - 9} width={w} height={18} rx={9} />
      <text x={x} y={y} textAnchor="middle" style={{ fontSize: small }}>
        {text}
      </text>
    </motion.g>
  )
}

/** Tekst der skifter værdi: den gamle står, til den nye lander (ingen tomme huller). */
function Cross({
  prev,
  next,
  live,
  delay,
  label,
  k,
  ...attrs
}: {
  prev: string
  next: string
  live: boolean
  delay: number
  label?: string
  x: number
  y: number
  className?: string
  k: string
}) {
  const body = (v: string) =>
    label ? (
      <>
        {label}
        <tspan className="swd-obs-val">{v}</tspan>
      </>
    ) : (
      v
    )
  if (!live || prev === next) {
    return (
      <text key={`${k}-s`} {...attrs}>
        {body(next)}
      </text>
    )
  }
  return (
    <g key={`${k}-${prev}-${next}`}>
      <motion.text {...attrs} initial={{ opacity: 1 }} animate={{ opacity: 0 }} transition={{ ...t.fade, delay }}>
        {body(prev)}
      </motion.text>
      <motion.text {...attrs} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...t.fade, delay: delay + 0.1 }}>
        {body(next)}
      </motion.text>
    </g>
  )
}

/* ------------------------------- Scene ------------------------------- */

function Scene({ L, step, className }: { L: Lay; step: number; className: string }) {
  const B = L.box
  const slotC = (k: number) => B.y + B.nameH + 4 + k * B.slotH + B.slotH / 2
  const headY = B.y + B.nameH + 8 + 3 * B.slotH
  const rowY = (i: number) => headY + B.headH + i * B.rowH
  const rowC = (i: number) => rowY(i) + B.rowH / 2
  const boxBottom = rowY(3) + 6
  const D = L.disp
  const dispH = D.nameH + 2 * D.rowH + 6
  const dispC = (i: number) => D.y[i] + dispH / 2
  const vals = VALUES(step)
  const subscribed = (i: number) => step >= 1 && !(i === 2 && step >= 3)
  const notifyAt = step === 2 ? PUSH2.notify : step === 3 ? UNSUB.notify : step === 4 ? PULL.notify : -1
  const valsAt = step === 2 ? PUSH2.vals : step === 3 ? UNSUB.vals : step === 4 ? PULL.vals : 0
  const callAt = step === 3 ? UNSUB.call : 0
  const cw = L.font * 0.6
  const sw = L.small * 0.6

  return (
    <svg className={`swd-obs-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} style={{ fontSize: L.font }} aria-hidden="true">
      {L.roleLabels && (
        <g className="swd-obs-role" style={{ fontSize: L.small }}>
          <text x={B.x} y={B.y - 8}>
            Subject
          </text>
          <text x={D.x + D.w} y={D.y[0] - 8} textAnchor="end">
            Observers
          </text>
        </g>
      )}

      {/* Ny måling udefra. */}
      <g className="swd-obs-call">
        <motion.text
          key={`in-${step}`}
          className="swd-obs-calllabel"
          x={L.callIn.x}
          y={L.callIn.labelY}
          textAnchor="middle"
          style={{ fontSize: L.small }}
          {...fadeTo(step >= 2, step >= 2 && step <= 4, callAt)}
        >
          {CALL_IN(step)}
        </motion.text>
        <motion.path
          key={`inp-${step}`}
          d={`M${L.callIn.x} ${L.callIn.y0} V${B.y - 8}`}
          initial={step >= 2 && step <= 4 ? { pathLength: 0, opacity: 1 } : false}
          animate={{ pathLength: step >= 2 ? 1 : 0, opacity: step >= 2 ? 1 : 0 }}
          transition={step >= 2 && step <= 4 ? { ...t.travel, duration: 0.3, delay: callAt } : t.fade}
        />
        <motion.path className="swd-obs-callhead" d={head(L.callIn.x, B.y, 'd')} {...fadeTo(step >= 2, step === 2, 0.25)} />
      </g>

      {/* weatherData : WeatherData */}
      <rect className="swd-obs-box" x={B.x} y={B.y} width={B.w} height={boxBottom - B.y} />
      <text className="swd-obs-name" x={B.x + B.w / 2} y={B.y + B.nameH / 2} textAnchor="middle">
        weatherData : WeatherData
      </text>
      <line className="swd-obs-sep" x1={B.x} x2={B.x + B.w} y1={B.y + B.nameH} y2={B.y + B.nameH} />
      {(['temperature', 'humidity', 'pressure'] as const).map((f, k) => (
        <Cross
          key={f}
          k={f}
          className="swd-obs-slot"
          x={B.x + 10}
          y={slotC(k)}
          label={`${f} = `}
          prev={VALUES(Math.max(0, step - 1))[k]}
          next={vals[k]}
          live={step >= 2 && step <= 4}
          delay={valsAt}
        />
      ))}
      <line className="swd-obs-sep" x1={B.x} x2={B.x + B.w} y1={headY} y2={headY} />
      <text className="swd-obs-slot" x={B.x + 10} y={headY + B.headH / 2}>
        observers
      </text>
      {notifyAt >= 0 && (
        <motion.g
          key={`notify-${step}`}
          className="swd-obs-notify"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0.0] }}
          transition={{ duration: 1.3, delay: notifyAt, times: [0, 0.15, 0.8, 1], ease: 'linear' }}
        >
          <rect x={B.x + 10 + 10 * cw} y={headY + B.headH / 2 - 9} width={17 * sw + 12} height={18} rx={9} />
          <text x={B.x + 16 + 10 * cw + (17 * sw) / 2} y={headY + B.headH / 2} textAnchor="middle" style={{ fontSize: L.small }}>
            notifyObservers()
          </text>
        </motion.g>
      )}
      <motion.text
        className="swd-obs-empty"
        x={B.x + B.w / 2}
        y={rowC(1)}
        textAnchor="middle"
        style={{ fontSize: L.small }}
        {...fadeTo(step === 0, step === 1, 0)}
      >
        tom liste
      </motion.text>
      {[0, 1, 2].map((i) => {
        const on = subscribed(i)
        const live = step === 1 || (step === 3 && i === 2)
        const delay = step === 1 ? REG(i) + 0.6 : UNSUB.gone
        return (
          <motion.g key={`row-${i}-${live}`} className="swd-obs-row" {...fadeTo(on, live, delay)}>
            <rect x={B.x + 8} y={rowY(i) + 2} width={B.w - 16} height={B.rowH - 4} rx={3} />
            <text x={B.x + 18} y={rowC(i)}>
              : Observer
            </text>
          </motion.g>
        )
      })}

      {/* Links fra listen til observerne. */}
      {[0, 1, 2].map((i) => {
        const on = subscribed(i)
        const live = step === 1 || (step === 3 && i === 2)
        return L.linkSegs(i, rowC(i), dispC).map((d, j) => (
          <motion.path
            key={`l-${i}-${j}-${live}`}
            className="swd-obs-link"
            d={d}
            initial={live && step === 1 ? { pathLength: 0, opacity: 1 } : false}
            animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
            transition={live ? { ...t.travel, duration: 0.4, delay: step === 1 ? REG(i) + 0.6 + j * 0.2 : UNSUB.gone } : t.fade}
          />
        ))
      })}

      {/* Displays. */}
      {DISPLAYS.map((name, i) => {
        const [r1, r2] = rows(step, i)
        const off = i === 2 && step >= 3
        const x = D.x
        const y = D.y[i]
        const r1Live = (step === 2 && true) || (step === 3 && i < 2) || (step === 4 && i < 2)
        const r1Delay = step === 2 ? PUSH2.send + PUSH2.dur : step === 3 ? UNSUB.send2 + UNSUB.dur2 : PULL.send + PULL.dur
        return (
          <g key={name} className="swd-obs-disp" data-off={off || undefined}>
            <rect className="swd-obs-box" x={x} y={y} width={D.w} height={dispH} />
            <text className="swd-obs-name" x={x + 10} y={y + D.nameH / 2}>
              : {name}
            </text>
            <line className="swd-obs-sep" x1={x} x2={x + D.w} y1={y + D.nameH} y2={y + D.nameH} />
            <Cross
              k={`r1-${i}`}
              className="swd-obs-recv"
              x={x + 10}
              y={y + D.nameH + 3 + D.rowH / 2}
              prev={rows(Math.max(0, step - 1), i)[0]}
              next={r1}
              live={r1Live}
              delay={r1Delay}
            />
            <motion.text
              key={`r2-${i}-${r2}`}
              className={`swd-obs-recv ${i === 2 ? 'is-off' : 'is-pull'}`}
              x={x + 10}
              y={y + D.nameH + 3 + D.rowH * 1.5}
              initial={(step === 4 && i < 2) || (step === 3 && i === 2) ? { opacity: 0 } : false}
              animate={{ opacity: 1 }}
              transition={{ ...t.fade, delay: step === 4 ? PULL.back + PULL.backDur : UNSUB.gone }}
            >
              {r2}
            </motion.text>
          </g>
        )
      })}

      {/* Pull: observerne kalder tilbage og kender dermed WeatherData. */}
      {[0, 1].map((i) => {
        const p = L.pull(i, dispC(i), slotC(i))
        const on = step >= 4
        const live = step === 4
        return (
          <g key={`pull-${i}`} className="swd-obs-pull">
            <motion.path
              key={`pp-${live}`}
              d={dPoly(p.pts)}
              initial={live ? { pathLength: 0, opacity: 1 } : false}
              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={live ? { ...t.travel, duration: PULL.backDur, delay: PULL.back + i * 0.1 } : t.fade}
            />
            <motion.path className="swd-obs-pullhead" key={`ph-${live}`} d={head(p.end[0], p.end[1], p.dir)} {...fadeTo(on, live, PULL.back + PULL.backDur)} />
          </g>
        )
      })}
      <motion.text
        className="swd-obs-pulllabel"
        x={L.pullLabel[0]}
        y={L.pullLabel[1]}
        textAnchor={L.pullLabel[2]}
        style={{ fontSize: L.small }}
        {...fadeTo(step >= 4, step === 4, PULL.back + PULL.backDur)}
      >
        {L.midLabels ? 'kender den konkrete WeatherData' : 'rød pil: observeren kender WeatherData'}
      </motion.text>

      {/* Beskederne, der rejser. */}
      {step === 1 &&
        [0, 1, 2].map((i) => {
          const pts = [...L.link(i, rowC(i), dispC(i))].reverse()
          return (
            <g key={`reg-${i}`}>
              <Dot k={`rd-${i}`} pts={pts} delay={REG(i)} dur={0.6} />
              {L.midLabels && (
                <Msg k={`rm-${i}`} x={479} y={(rowC(i) + dispC(i)) / 2} text="registerObserver(this)" delay={REG(i)} dur={0.6} small={L.small} />
              )}
            </g>
          )
        })}
      {step === 3 && (
        <g>
          <Dot k="un" pts={[...L.link(2, rowC(2), dispC(2))].reverse()} delay={UNSUB.send} dur={UNSUB.dur} neg />
          {L.midLabels && <Msg k="unm" x={479} y={(rowC(2) + dispC(2)) / 2} text="removeObserver(this)" delay={UNSUB.send} dur={UNSUB.dur} small={L.small} neg />}
        </g>
      )}
      {(step === 2 || step === 3 || step === 4) &&
        [0, 1, 2]
          .filter((i) => subscribed(i))
          .map((i) => {
            const delay = step === 2 ? PUSH2.send : step === 3 ? UNSUB.send2 : PULL.send
            const dur = step === 2 ? PUSH2.dur : step === 3 ? UNSUB.dur2 : PULL.dur
            const text = step === 2 ? 'update(80, 65, 30.4)' : step === 3 ? 'update(82, 70, 29.2)' : 'update()'
            return (
              <g key={`up-${step}-${i}`}>
                <Dot k={`ud-${step}-${i}`} pts={L.link(i, rowC(i), dispC(i))} delay={delay} dur={dur} />
                {L.midLabels && <Msg k={`um-${step}-${i}`} x={479} y={(rowC(i) + dispC(i)) / 2} text={text} delay={delay} dur={dur} small={L.small} />}
              </g>
            )
          })}
      {step === 4 &&
        [0, 1].map((i) => {
          const p = L.pull(i, dispC(i), slotC(i))
          return <Dot key={`pd-${i}`} k={`pd-${i}`} pts={p.pts} delay={PULL.back + i * 0.1} dur={PULL.backDur} neg />
        })}
    </svg>
  )
}

/* ------------------------ Push og pull som sekvens ------------------------ */

function Seq({ pull }: { pull: boolean }) {
  const a = 66
  const b = 212
  return (
    <svg className="swd-obs-seq" viewBox="0 0 280 112" aria-hidden="true">
      {[
        [a, ':ConcreteSubject'],
        [b, ':ConcreteObserver'],
      ].map(([x, n]) => (
        <g key={n as string}>
          <rect className="swd-obs-seq-head" x={(x as number) - 63} y={2} width={126} height={22} />
          <text className="swd-obs-seq-name" x={x as number} y={13} textAnchor="middle">
            {n}
          </text>
          <path className="swd-obs-seq-life" d={`M${x} 24 V110`} />
        </g>
      ))}
      {pull ? (
        <>
          <path className="swd-obs-seq-msg" d={`M${a} 48 H${b - 1}`} />
          <path className="swd-obs-seq-mh" d={head(b, 48, 'r', 7, 4)} />
          <text className="swd-obs-seq-l" x={(a + b) / 2} y={41} textAnchor="middle">
            Update()
          </text>
          <path className="swd-obs-seq-msg is-neg" d={`M${b} 72 H${a + 1}`} />
          <path className="swd-obs-seq-mh is-neg" d={head(a, 72, 'l', 7, 4)} />
          <text className="swd-obs-seq-l is-neg" x={(a + b) / 2} y={65} textAnchor="middle">
            GetSubjectState()
          </text>
          <path className="swd-obs-seq-ret" d={`M${a} 96 H${b - 1}`} />
          <path className="swd-obs-seq-rh" d={`M${b - 7} 92 L${b} 96 L${b - 7} 100`} />
          <text className="swd-obs-seq-l" x={(a + b) / 2} y={89} textAnchor="middle">
            state
          </text>
        </>
      ) : (
        <>
          <path className="swd-obs-seq-msg" d={`M${a} 48 H${b - 1}`} />
          <path className="swd-obs-seq-mh" d={head(b, 48, 'r', 7, 4)} />
          <text className="swd-obs-seq-l" x={(a + b) / 2} y={41} textAnchor="middle">
            Update(subjectState)
          </text>
        </>
      )}
    </svg>
  )
}

function Compare({ show }: { show: boolean }) {
  return (
    <motion.div
      className="swd-obs-cmp"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={show ? t.settle : t.fade}
      aria-hidden={!show || undefined}
    >
      <section className="swd-obs-card">
        <header>
          <strong>Push</strong> <span>slide 13</span>
        </header>
        <Seq pull={false} />
        <p>
          Ét kald. Signaturen følger subjectets data. <em>Slidene foretrækker push: lavere kobling.</em>
        </p>
      </section>
      <section className="swd-obs-card" data-pull>
        <header>
          <strong>Pull</strong> <span>slide 7</span>
        </header>
        <Seq pull />
        <p>
          To kald. Observeren kender <code>ConcreteSubject</code>. <em>HFDP: pull er “more correct” — lettere at udvide.</em>
        </p>
      </section>
    </motion.div>
  )
}

function Observer({ step }: { step: number }) {
  return (
    <div className="swd-obs">
      <div className="swd-obs-scene">
        <Scene L={WIDE} step={step} className="swd-obs-wide" />
        <Scene L={NARROW} step={step} className="swd-obs-narrow" />
      </div>
      <Compare show={step === 5} />
    </div>
  )
}

const viz: VizDef = {
  id: 'observer',
  title: 'Subject giver besked, observers lytter',
  steps: [
    {
      caption: '`WeatherData` har målingerne; tre displays vil gerne vide, når de ændres.',
      hold: 2200,
    },
    {
      caption: 'Hver observer melder sig selv på listen med `registerObserver(this)` — subject kender dem kun som `Observer`.',
      hold: 2900,
    },
    {
      caption: 'Én ændring, ét kald til hver på listen — push sender dataene med.',
      hold: 2800,
    },
    {
      caption: '`ForecastDisplay` afmelder sig på runtime. Næste måling når kun de to — subject er ikke ændret.',
      hold: 3000,
    },
    {
      caption: 'Pull: `update()` er tom, og observeren henter selv — og bliver koblet til `WeatherData`.',
      hold: 2800,
    },
    {
      caption: 'Slidene foretrækker push (lavere kobling), HFDP kalder pull mere “correct” (lettere at udvide).',
      hold: 2600,
    },
  ],
  Component: Observer,
}

export default viz
