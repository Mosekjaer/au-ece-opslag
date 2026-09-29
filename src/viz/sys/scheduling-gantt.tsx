import { Fragment } from 'react'
import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { stagger, t } from '../kit/motion'
import './scheduling-gantt.css'

/* Bogens eksempel (Silberschatz 5.3.1 og 5.3.3): P1 = 24, P2 = 3, P3 = 3 ms, alle
   ankommer ved 0 i rækkefølgen P1, P2, P3.
   FCFS: P1 0–24, P2 24–27, P3 27–30 → ventetid 0, 24, 27 → 17 ms.
   SJF på samme data er bogens anden rækkefølge P2, P3, P1 → 6, 0, 3 → 3 ms.
   RR, quantum 4: P1 0–4, P2 4–7, P3 7–10, P1 resten → 6, 4, 7 → 17/3 = 5,66 ms. */

const TOTAL = 30
type P = 'p1' | 'p2' | 'p3'
const NAME: Record<P, string> = { p1: 'P1', p2: 'P2', p3: 'P3' }
const BURST: Record<P, number> = { p1: 24, p2: 3, p3: 3 }

interface Algo {
  id: string
  name: string
  sub: string
  blocks: [P, number, number][]
  /** Ventetid pr. proces som intervaller i ready queue. */
  wait: Record<P, [number, number][]>
  waits: Record<P, number>
  avg: string
  built: number
  waited: number
}

const ALGOS: Algo[] = [
  {
    id: 'fcfs',
    name: 'FCFS',
    sub: 'ankomstrækkefølge',
    blocks: [
      ['p1', 0, 24],
      ['p2', 24, 27],
      ['p3', 27, 30],
    ],
    wait: { p1: [], p2: [[0, 24]], p3: [[0, 27]] },
    waits: { p1: 0, p2: 24, p3: 27 },
    avg: '17',
    built: 1,
    waited: 2,
  },
  {
    id: 'sjf',
    name: 'SJF',
    sub: 'korteste burst først',
    blocks: [
      ['p2', 0, 3],
      ['p3', 3, 6],
      ['p1', 6, 30],
    ],
    wait: { p1: [[0, 6]], p2: [], p3: [[0, 3]] },
    waits: { p1: 6, p2: 0, p3: 3 },
    avg: '3',
    built: 3,
    waited: 3,
  },
  {
    id: 'rr',
    name: 'RR',
    sub: 'quantum 4',
    blocks: [
      ['p1', 0, 4],
      ['p2', 4, 7],
      ['p3', 7, 10],
      ['p1', 10, 14],
      ['p1', 14, 18],
      ['p1', 18, 22],
      ['p1', 22, 26],
      ['p1', 26, 30],
    ],
    wait: { p1: [[4, 10]], p2: [[0, 4]], p3: [[0, 7]] },
    waits: { p1: 6, p2: 4, p3: 7 },
    avg: '5,66',
    built: 4,
    waited: 5,
  },
]

const pct = (n: number) => `${(n / TOTAL) * 100}%`
const PS: P[] = ['p1', 'p2', 'p3']

function Row({ a, step }: { a: Algo; step: number }) {
  const built = step >= a.built
  const waited = step >= a.waited
  const now = step === a.built || step === a.waited
  const ticks = Array.from(new Set(a.blocks.flatMap(([, s, e]) => [s, e])))

  return (
    <div className="sx-gantt-row" data-now={now || undefined} data-on={built || undefined}>
      <div className="sx-gantt-label">
        <span className="sx-gantt-name">{a.name}</span>
        <span className="sx-gantt-sub">{a.sub}</span>
      </div>

      <div className="sx-gantt-chart">
        <div className="sx-gantt-track">
          {a.blocks.map(([p, s, e], i) => (
            <motion.div
              key={i}
              className="sx-gantt-block"
              data-p={p}
              style={{ left: pct(s), width: pct(e - s), originX: 0 }}
              initial={false}
              animate={{ scaleX: built ? 1 : 0, opacity: built ? 1 : 0 }}
              transition={built ? stagger(i, 0, step === a.built ? 0.16 : 0) : t.fade}
            >
              <span>{NAME[p]}</span>
            </motion.div>
          ))}
        </div>
        <div className="sx-gantt-ticks" aria-hidden="true">
          {ticks.map((n) => (
            <motion.span
              key={n}
              style={{ left: pct(n) }}
              data-edge={n === 0 ? 'start' : n === TOTAL ? 'end' : undefined}
              initial={false}
              animate={{ opacity: built ? 1 : 0 }}
              transition={t.fade}
            >
              {n}
            </motion.span>
          ))}
        </div>
        <div className="sx-gantt-waits">
          {PS.map((p) => (
            <div key={p} className="sx-gantt-wlane">
              {a.wait[p].map(([s, e], i) => (
                <motion.div
                  key={i}
                  className="sx-gantt-wait"
                  data-p={p}
                  style={{ left: pct(s), width: pct(e - s), originX: 0 }}
                  initial={false}
                  animate={{ scaleX: waited ? 1 : 0, opacity: waited ? 1 : 0 }}
                  transition={waited ? { ...t.travel, delay: step === a.waited && a.waited === a.built ? 0.6 : 0 } : t.fade}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <motion.div
        className="sx-gantt-result"
        initial={false}
        animate={{ opacity: waited ? 1 : 0 }}
        transition={waited ? { ...t.settle, delay: step === a.waited ? 0.5 : 0 } : t.fade}
      >
        <span className="sx-gantt-avg">
          <b>{a.avg}</b> ms
        </span>
        <span className="sx-gantt-detail">
          {PS.map((p, i) => (
            <Fragment key={p}>
              {i > 0 && ' · '}
              <span>
                <span className="sx-gantt-dot" data-p={p} />
                {NAME[p]} {a.waits[p]}
              </span>
            </Fragment>
          ))}
        </span>
      </motion.div>
    </div>
  )
}

function Gantt({ step }: { step: number }) {
  return (
    <div className="sx-gantt" data-final={step === 6 || undefined}>
      <div className="sx-gantt-data">
        <table className="sx-gantt-table">
          <thead>
            <tr>
              <th>Proces</th>
              {PS.map((p) => (
                <th key={p}>
                  <span className="sx-gantt-dot" data-p={p} />
                  {NAME[p]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Burst (ms)</td>
              {PS.map((p) => (
                <td key={p}>{BURST[p]}</td>
              ))}
            </tr>
          </tbody>
        </table>
        <p className="sx-gantt-legend">
          Alle ankommer ved 0 i rækkefølgen P1, P2, P3. Tynde streger under diagrammet er ventetid i <i>ready queue</i>.
        </p>
      </div>

      <div className="sx-gantt-head" aria-hidden="true">
        <span />
        <span className="vcaps">tid (ms)</span>
        <span className="vcaps">gns. ventetid</span>
      </div>
      <div className="sx-gantt-rows">
        {ALGOS.map((a) => (
          <Row key={a.id} a={a} step={step} />
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'scheduling-gantt',
  title: 'FCFS, SJF og Round-Robin på samme tre processer',
  steps: [
    { caption: 'Bogens eksempel: tre processer med bursts på 24, 3 og 3 ms, der alle står i ready queue ved tid 0.', hold: 2200 },
    { caption: '**FCFS** kører dem i ankomstrækkefølge: P1 fra 0 til 24, så P2 til 27 og P3 til 30.', hold: 2600 },
    {
      caption: 'P2 venter 24 ms og P3 27 ms bag den lange P1 — **convoy effect**. Gennemsnitlig ventetid: (0 + 24 + 27) / 3 = **17 ms**.',
      hold: 3000,
    },
    {
      caption: '**SJF** tager den korteste burst først: P2, P3, P1. Ventetiden er P1 6, P2 0 og P3 3 — i snit **3 ms**, det laveste mulige.',
      hold: 3000,
    },
    {
      caption: '**Round-Robin** med quantum 4: P1 afbrydes efter 4 ms, P2 og P3 bliver færdige inden for deres quantum, og P1 kører resten.',
      hold: 3000,
    },
    { caption: 'Ventetid P1 6, P2 4 og P3 7 — i snit 17 / 3 = **5,66 ms**. Ingen kort proces venter på hele P1.', hold: 2800 },
    {
      caption: 'SJF er optimal, men kræver at næste burst forudsiges. RR er fair uden at kende bursts; FCFS straffer de korte.',
      hold: 3200,
    },
  ],
  Component: Gantt,
}

export default viz
