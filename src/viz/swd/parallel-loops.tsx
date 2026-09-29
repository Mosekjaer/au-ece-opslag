import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './parallel-loops.css'

/* Concurrency - Parallel Loops.pdf s. 6–7 (MyParallelFor: “static partitioning”),
   s. 10 (“PARTITIONING IS IMPORTANT!”: N = [1; 12], iteration i tager i sekunder,
   78 s i alt, ideelt 78:2 = 39 s, statisk 1–6 = 21 s og 7–12 = 57 s, “46% longer than
   ideal”, slidets ideelle fordeling 1–5, 7–9 / 6, 10–12), s. 11 (“Spectrum of
   Partitioning Tradeoffs”) og s. 12 (Parallel.For: “sophisticated load balancing”).
   Markdown: swd/markdown/slides/SW4SWD-01_W11.2_Concurrency_Parallel_Loops.md, afsnit 3–6.
   Slidet tegner lige brede celler (“Show finish order, not proportional time”); her er
   bredden proportional med tiden. Den dynamiske fordeling (36 s / 42 s) er beregnet her og
   står ikke på slidene — den er mærket i figuren. MyParallelFor og Parallel.For er placeret
   på spektret ud fra s. 7 og s. 12. */

const ITER = Array.from({ length: 12 }, (_, k) => k + 1)

type PanelId = 'static' | 'ideal' | 'dyn'
interface Panel {
  id: PanelId
  /** Rækkefølge pr. tråd. */
  lanes: [number[], number[]]
  finish: number
  at: number
}
const PANELS: Panel[] = [
  { id: 'static', lanes: [[1, 2, 3, 4, 5, 6], [7, 8, 9, 10, 11, 12]], finish: 57, at: 1 },
  { id: 'ideal', lanes: [[1, 2, 3, 4, 5, 7, 8, 9], [6, 10, 11, 12]], finish: 39, at: 3 },
  { id: 'dyn', lanes: [[1, 3, 5, 7, 9, 11], [2, 4, 6, 8, 10, 12]], finish: 42, at: 4 },
]
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0)

interface Layout {
  w: number
  h: number
  font: number
  x0: number
  /** Pixel pr. sekund. */
  u: number
  totalsX: number
  laneH: number
  laneGap: number
  pool: { y: number; rows: number[][]; title: number }
  /** Top af hvert panel (titellinjen). */
  panelY: number[]
  /** Lanes starter så langt under panelets titel. */
  laneTop: number
  /** Brede: slutmærket står på titellinjen ved stregen; smalle: på linjen under titlen. */
  wide: boolean
  axisY: number
  ticks: number[]
  /** Mindste blokbredde (px) der får sit tal indeni. */
  minNum: number
}
const WIDE: Layout = {
  w: 860,
  h: 386,
  font: 13,
  x0: 78,
  u: 12.6,
  totalsX: 806,
  laneH: 23,
  laneGap: 5,
  pool: { y: 22, rows: [[1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12]], title: 12 },
  panelY: [98, 186, 274],
  laneTop: 10,
  wide: true,
  axisY: 358,
  ticks: [0, 10, 20, 30, 40, 50, 57],
  minNum: 11,
}
const NARROW: Layout = {
  w: 300,
  h: 428,
  font: 12,
  x0: 54,
  u: 3.6,
  totalsX: 264,
  laneH: 20,
  laneGap: 4,
  pool: { y: 36, rows: [[1, 2, 3, 4, 5, 6, 7, 8], [9, 10, 11, 12]], title: 12 },
  panelY: [104, 214, 324],
  laneTop: 26,
  wide: false,
  axisY: 406,
  ticks: [0, 20, 40, 57],
  minNum: 14,
}

const TITLE: Record<PanelId, { wide: string; narrow: string }> = {
  static: { wide: 'Statisk partitionering: halvering før start', narrow: 'Statisk: halvering' },
  ideal: { wide: 'Ideel fordeling (slidets facit)', narrow: 'Ideel fordeling (slidets facit)' },
  dyn: { wide: 'Dynamisk: ledig tråd tager næste iteration', narrow: 'Dynamisk: næste ledige tråd' },
}
const FINISH: Record<PanelId, { wide: string; narrow: string }> = {
  static: { wide: 'færdig: 57 s (46 % længere end ideelt)', narrow: 'færdig: 57 s (46 % længere)' },
  ideal: { wide: 'ideelt: 78 : 2 = 39 s', narrow: 'ideelt: 78 : 2 = 39 s' },
  dyn: { wide: 'færdig: 42 s', narrow: 'færdig: 42 s' },
}

function poolPos(L: Layout, i: number) {
  for (let r = 0; r < L.pool.rows.length; r++) {
    const row = L.pool.rows[r]
    const k = row.indexOf(i)
    if (k >= 0) return { x: L.x0 + sum(row.slice(0, k)) * L.u, y: L.pool.y + r * (L.laneH + L.laneGap) }
  }
  return { x: L.x0, y: L.pool.y }
}

function Block({ L, i, lane, label = true }: { L: Layout; i: number; lane?: 0 | 1; label?: boolean }) {
  const w = i * L.u
  return (
    <>
      <rect className="plp-block" data-lane={lane} width={w - 1.5} height={L.laneH} rx={2.5} />
      {label && w >= L.minNum && (
        <text className="plp-bnum" x={(w - 1.5) / 2} y={L.laneH / 2}>
          {i}
        </text>
      )}
    </>
  )
}

function Chart({ L, step, hatch }: { L: Layout; step: number; hatch: string }) {
  const X = (s: number) => L.x0 + s * L.u
  const laneY = (p: number, lane: number) => L.panelY[p] + L.laneTop + lane * (L.laneH + L.laneGap)
  const panelBottom = (p: number) => laneY(p, 1) + L.laneH
  return (
    <svg className={`plp-svg ${L.wide ? 'plp-wide' : 'plp-narrow'}`} viewBox={`0 0 ${L.w} ${L.h}`} style={{ fontSize: L.font }} aria-hidden="true">
      <defs>
        <pattern id={hatch} width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" className="plp-hatch-line" />
        </pattern>
      </defs>

      {/* Iterationerne: bredde = tid */}
      <text className="plp-title" x={0} y={L.pool.title}>
        {L.wide ? 'Iterationer' : 'Iterationer · i tager i sekunder · i alt 78 s'}
      </text>
      {L.wide && (
        <text className="plp-sub" x={L.x0} y={L.pool.title}>
          iteration <tspan className="plp-mono">i</tspan> tager <tspan className="plp-mono">i</tspan> sekunder · i alt 78 s
        </text>
      )}
      {ITER.map((i) => {
        const p = poolPos(L, i)
        return (
          <g key={i} className="plp-pool" transform={`translate(${p.x} ${p.y})`}>
            <Block L={L} i={i} />
          </g>
        )
      })}
      {!L.wide && (
        <text className="plp-sub" x={L.x0 + (6 * L.u) / 2} y={L.pool.y - 4} textAnchor="middle">
          1–3
        </text>
      )}

      {PANELS.map((pn, p) => {
        const on = step >= pn.at
        const hot = step === pn.at || (pn.id === 'static' && step === 2)
        const showFinish = pn.id === 'static' ? step >= 2 : on
        const fx = X(pn.finish)
        return (
          <g key={pn.id} className="plp-panel" data-on={on || undefined} data-hot={hot || undefined}>
            <text className="plp-ptitle" x={0} y={L.panelY[p]}>
              {TITLE[pn.id][L.wide ? 'wide' : 'narrow']}
            </text>
            {pn.id === 'dyn' && (
              <text className="plp-illu" x={L.wide ? 300 : 0} y={L.wide ? L.panelY[p] : L.panelY[p] + 13}>
                beregnet eksempel, ikke fra slidene
              </text>
            )}

            {[0, 1].map((lane) => (
              <g key={lane}>
                <text className="plp-lane" x={0} y={laneY(p, lane) + L.laneH / 2} data-lane={lane}>
                  Thread {lane + 1}
                </text>
                <rect className="plp-track" x={L.x0} y={laneY(p, lane)} width={57 * L.u} height={L.laneH} rx={2.5} />
              </g>
            ))}

            {/* Ledig tid: skraveret felt fra trådens slut til loopets slut */}
            {pn.id !== 'ideal' &&
              (() => {
                const end1 = sum(pn.lanes[0])
                const idle = pn.finish - end1
                const onIdle = pn.id === 'static' ? step >= 2 : on
                return (
                  <motion.g
                    initial={false}
                    animate={{ opacity: onIdle ? 1 : 0 }}
                    transition={onIdle ? { ...t.fade, delay: pn.id === 'dyn' ? 1.6 : 0.2 } : t.fade}
                  >
                    <rect className="plp-idle" x={X(end1)} y={laneY(p, 0)} width={idle * L.u - 1.5} height={L.laneH} rx={2.5} fill={`url(#${hatch})`} />
                    <text className="plp-idle-label" x={X(end1) + (idle * L.u) / 2} y={laneY(p, 0) + L.laneH / 2}>
                      {idle * L.u > (L.wide ? 90 : 70) ? `ledig ${idle} s` : idle * L.u > 36 ? 'ledig' : ''}
                    </text>
                  </motion.g>
                )
              })()}

            {/* Blokkene glider fra rækken af iterationer ned på trådene */}
            {pn.lanes.map((ids, lane) =>
              ids.map((i, k) => {
                const from = poolPos(L, i)
                const to = { x: X(sum(ids.slice(0, k))), y: laneY(p, lane) }
                const order = pn.id === 'dyn' ? i - 1 : pn.id === 'static' ? i - 1 : k + lane * 8
                return (
                  <motion.g
                    key={i}
                    initial={false}
                    animate={on ? { x: to.x, y: to.y, opacity: 1 } : { x: from.x, y: from.y, opacity: 0 }}
                    transition={on ? { ...t.travel, delay: 0.1 + order * 0.07 } : t.fade}
                  >
                    <Block L={L} i={i} lane={lane as 0 | 1} />
                  </motion.g>
                )
              }),
            )}

            {/* Totaler pr. tråd */}
            {pn.lanes.map((ids, lane) => (
              <motion.text
                key={lane}
                className="plp-total"
                data-lane={lane}
                x={L.totalsX}
                y={laneY(p, lane) + L.laneH / 2}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={on ? { ...t.fade, delay: 1.3 } : t.fade}
              >
                {sum(ids)} s
              </motion.text>
            ))}

            {/* Loopet er færdigt, når den sidste tråd er */}
            <motion.g initial={false} animate={{ opacity: showFinish ? 1 : 0 }} transition={showFinish ? { ...t.fade, delay: pn.id === 'static' ? 0.2 : 1.4 } : t.fade}>
              <line className="plp-finish" x1={fx} x2={fx} y1={L.panelY[p] + (L.wide ? 4 : 17)} y2={panelBottom(p) + 3} />
              <text
                className="plp-flabel"
                x={L.wide ? (pn.id === 'static' ? fx - 6 : fx + 6) : pn.id === 'dyn' ? fx + 4 : fx - 4}
                y={L.wide ? L.panelY[p] : L.panelY[p] + (pn.id === 'dyn' ? 13 : 13)}
                textAnchor={L.wide ? (pn.id === 'static' ? 'end' : 'start') : pn.id === 'dyn' ? 'start' : 'end'}
              >
                {FINISH[pn.id][L.wide ? 'wide' : 'narrow']}
              </text>
            </motion.g>
          </g>
        )
      })}

      {/* Tidsakse */}
      <line className="plp-axis" x1={L.x0} x2={X(57)} y1={L.axisY} y2={L.axisY} />
      {L.ticks.map((s) => (
        <g key={s}>
          <line className="plp-axis" x1={X(s)} x2={X(s)} y1={L.axisY} y2={L.axisY + 4} />
          <text className="plp-tick" x={X(s)} y={L.axisY + 16}>
            {s === 57 ? '57 s' : s}
          </text>
        </g>
      ))}
    </svg>
  )
}

function Loops({ step }: { step: number }) {
  const final = step >= 5
  return (
    <div className="plp">
      <Chart L={WIDE} step={step} hatch="plp-hatch-w" />
      <Chart L={NARROW} step={step} hatch="plp-hatch-n" />

      <motion.div className="plp-spec" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
        <div className="plp-spec-title">Spectrum of Partitioning Tradeoffs</div>
        <div className="plp-spec-row">
          <div className="plp-end plp-end-s">
            <b>Fully Static</b>
            <span>Less Synchronization</span>
            <code>MyParallelFor</code>
          </div>
          <div className="plp-bar" aria-hidden="true" />
          <div className="plp-end plp-end-d">
            <b>Fully Dynamic</b>
            <span>More Load-Balancing</span>
            <code>Parallel.For</code>
          </div>
        </div>
        <div className="plp-spec-notes">
          <span>kræver forhåndsviden om eksekveringstiden, men ingen synkronisering</span>
          <span>kræver ingen forhåndsviden, men synkronisering</span>
        </div>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'parallel-loops',
  title: 'Partitionering afgør, hvornår loopet er færdigt',
  steps: [
    { caption: 'Et loop over `N = [1; 12]`, hvor iteration `i` tager `i` sekunder. Bredden er tiden.', hold: 2400 },
    { caption: 'Statisk partitionering deler intervallet i to faste blokke, før loopet starter: 1–6 og 7–12.', hold: 2800 },
    { caption: 'Tråd 1 står ledig i 36 sekunder — tråde kan ikke hjælpe hinanden. Loopet tager 57 s.', hold: 2800 },
    { caption: 'Blandes dyre og billige iterationer som i slidets facit, slutter begge tråde efter 39 sekunder.', hold: 2800 },
    {
      caption: 'Beregnet eksempel: tager trådene næste iteration, når de er ledige, er loopet færdigt efter 42 s — uden forhåndsviden.',
      hold: 3200,
    },
    {
      caption: 'Statisk kræver forhåndsviden, men ingen synkronisering; dynamisk balancerer selv, men kræver synkronisering.',
      hold: 3000,
    },
  ],
  Component: Loops,
}

export default viz
