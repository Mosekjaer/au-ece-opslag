import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './xp.css'

/* swd/kilder/uge-01_extreme-programming/Extreme Programming.pdf, slide 3 (“WHY”):
   figuren “Planning/feedback loops” (kilde på slidet: en.wikipedia.org/wiki/
   Extreme_programming). Buerne går fra Code op til hver aktivitet (pilen ved
   aktiviteten); de lodrette pile går ned gennem de indre aktiviteter tilbage til
   Code, med slidets tidsangivelse ved hver. Teksten ved siden af er slidets egen. */

interface Loop {
  name: string
  time: string
  step: number
  delay?: number
}
/** Indefra og ud: index 0 er det inderste loop. */
const LOOPS: Loop[] = [
  { name: 'Pair programming', time: 'Seconds', step: 1 },
  { name: 'Unit test', time: 'Minutes', step: 2 },
  { name: 'Pair negotiation', time: 'Hours', step: 2, delay: 0.6 },
  { name: 'Stand-up meeting', time: 'One day', step: 3 },
  { name: 'Acceptance test', time: 'Days', step: 3, delay: 0.6 },
  { name: 'Iteration plan', time: 'Weeks', step: 4 },
  { name: 'Release plan', time: 'Months', step: 4, delay: 0.6 },
]
const LAST = 5

interface Geo {
  w: number
  /** Venstre kant af aktiviteterne. */
  xl: number
  pillW: number
  pillH: number
  dy: number
  top: number
  /** Hvor langt buerne bugter sig ud, pr. px højde. */
  bulge: number
  font: number
}
const WIDE: Geo = { w: 410, xl: 200, pillW: 196, pillH: 28, dy: 48, top: 16, bulge: 0.62, font: 13 }
const NARROW: Geo = { w: 300, xl: 118, pillW: 176, pillH: 26, dy: 43, top: 14, bulge: 0.52, font: 12 }

const f = (n: number) => Math.round(n * 10) / 10

function Diagram({ g, step, variant }: { g: Geo; step: number; variant: 'wide' | 'narrow' }) {
  const n = LOOPS.length
  const yOf = (k: number) => g.top + g.pillH / 2 + (n - k) * g.dy // k = 0 er Code
  const y0 = yOf(0)
  const h = y0 + g.pillH / 2 + 4
  const arc = (k: number) => {
    const yk = yOf(k)
    const b = (y0 - yk) * g.bulge
    const end = g.xl - 2
    return `M${g.xl} ${f(y0)} C${f(g.xl - b)} ${f(y0)} ${f(end - b)} ${f(yk)} ${f(end)} ${f(yk)}`
  }
  const head = (k: number) => {
    const x = g.xl - 1
    const y = yOf(k)
    return `M${x} ${f(y)} L${x - 8} ${f(y - 4.5)} L${x - 8} ${f(y + 4.5)} Z`
  }
  const dx = g.xl + 18
  return (
    <svg className={`xpl-svg xpl-${variant}`} viewBox={`0 0 ${g.w} ${f(h)}`} style={{ fontSize: g.font }} aria-hidden="true">
      {LOOPS.map((l, i) => {
        const k = i + 1
        const on = step >= l.step
        const hot = step === l.step
        const d = l.delay ?? 0
        const yk = yOf(k)
        const yBelow = yOf(k - 1)
        return (
          <g key={l.name} className="xpl-loop" data-on={on || undefined} data-hot={hot || undefined}>
            {/* Code → aktivitet */}
            <motion.path
              className="xpl-arc"
              d={arc(k)}
              initial={false}
              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={on ? { pathLength: { ...t.travel, delay: d }, opacity: { duration: 0.01, delay: d } } : t.fade}
            />
            <motion.path
              className="xpl-head"
              d={head(k)}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: d + 0.7 } : t.fade}
            />
            {/* aktivitet → ned mod Code, med tidsskalaen */}
            <motion.path
              className="xpl-down"
              d={`M${dx} ${f(yk + g.pillH / 2 + 1)} V${f(yBelow - g.pillH / 2 - 2)}`}
              initial={false}
              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={
                on ? { pathLength: { ...t.travel, duration: 0.4, delay: d + 0.75 }, opacity: { duration: 0.01, delay: d + 0.75 } } : t.fade
              }
            />
            <motion.path
              className="xpl-head"
              d={`M${dx} ${f(yBelow - g.pillH / 2 - 1)} L${dx - 4} ${f(yBelow - g.pillH / 2 - 8)} L${dx + 4} ${f(yBelow - g.pillH / 2 - 8)} Z`}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: d + 1.05 } : t.fade}
            />
            <motion.text
              className="xpl-time"
              x={dx + 10}
              y={f((yk + yBelow) / 2 + 4)}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: d + 0.9 } : t.fade}
            >
              {l.time}
            </motion.text>

            <g className="xpl-pill">
              <rect x={g.xl} y={f(yk - g.pillH / 2)} width={g.pillW} height={g.pillH} rx={g.pillH / 2} />
              <motion.text
                x={g.xl + 13}
                y={f(yk + 4.5)}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={on ? { ...t.fade, delay: d + 0.6 } : t.fade}
              >
                {l.name}
              </motion.text>
            </g>
          </g>
        )
      })}
      <g className="xpl-code">
        <rect x={g.xl} y={f(y0 - g.pillH / 2)} width={g.pillW * 0.5} height={g.pillH} rx={g.pillH / 2} />
        <text x={g.xl + 13} y={f(y0 + 4.5)}>
          Code
        </text>
      </g>
    </svg>
  )
}

function Xp({ step }: { step: number }) {
  const done = step >= LAST
  return (
    <div className="xpl">
      <div className="xpl-head-row">
        <span className="xpl-title">Planning/feedback loops</span>
        <span className="xpl-src">slide 3, efter Wikipedia</span>
      </div>
      <div className="xpl-dia">
        <Diagram g={WIDE} step={step} variant="wide" />
        <Diagram g={NARROW} step={step} variant="narrow" />
      </div>
      <motion.blockquote
        className="xpl-quote"
        lang="en"
        initial={false}
        data-done={done || undefined}
        animate={{ opacity: done ? 1 : 0.28 }}
        transition={done ? t.settle : t.recede}
      >
        <p className="xpl-q-lead">Better quality in software</p>
        <p>…and responsiveness to changing requirements</p>
        <p className="xpl-q-by">By</p>
        <ul>
          <li>frequent releases</li>
          <li>improved productivity</li>
        </ul>
      </motion.blockquote>
    </div>
  )
}

const viz: VizDef = {
  id: 'xp',
  title: 'XP’s feedback loops fra sekunder til måneder',
  steps: [
    { caption: 'XP’s loops udspringer alle fra koden.', hold: 1600 },
    { caption: 'Det inderste loop er **pair programming**: feedback på sekunder.', hold: 2200 },
    { caption: '**Unit tests** giver feedback på minutter, **pair negotiation** på timer.', hold: 2800 },
    { caption: '**Stand-up meeting** hver dag, **acceptance tests** over dage.', hold: 2800 },
    { caption: '**Iteration plan** over uger og **release plan** over måneder.', hold: 2800 },
    {
      caption: 'Hvert loop omslutter de hurtigere loops. XP sigter mod bedre kvalitet og mod at kunne reagere på ændrede krav.',
      hold: 3000,
    },
  ],
  Component: Xp,
}

export default viz
