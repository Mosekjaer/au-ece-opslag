import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './knp-congestion-control.css'

/* Kurose & Ross (Global Ed.) figur 3.52 (s. 300) og teksten samme side:
   ssthresh starter på 8 MSS. Runde 1–4: cwnd 1, 2, 4, 8 (slow start); runde 5–8: 9, 10, 11, 12
   (congestion avoidance). Tre duplicate ACK’er lige efter runde 8, cwnd = 12 → ssthresh = 6.
   Reno: 9, 10 … 15 i runde 9–15 (cwnd = ssthresh + 3). Tahoe: 1, 2, 4, 6, 7, 8, 9 i runde 9–15.
   Værdierne er aflæst i figuren (PDF-side 302). Regler: figur 3.51 (s. 298). */

const X0 = 34
const X1 = 314
const Y0 = 196
const Y1 = 14
const RMAX = 15
const CMAX = 16
const px = (r: number) => X0 + (r / RMAX) * (X1 - X0)
const py = (c: number) => Y0 - (c / CMAX) * (Y0 - Y1)

type Pt = [number, number]
const SS: Pt[] = [[1, 1], [2, 2], [3, 4], [4, 8]]
const CA: Pt[] = [[4, 8], [5, 9], [6, 10], [7, 11], [8, 12]]
const TAHOE: Pt[] = [[8, 12], [9, 1], [10, 2], [11, 4], [12, 6], [13, 7], [14, 8], [15, 9]]
const RENO: Pt[] = [[9, 9], [10, 10], [11, 11], [12, 12], [13, 13], [14, 14], [15, 15]]

const d = (pts: Pt[]) => 'M' + pts.map(([r, c]) => `${px(r).toFixed(1)} ${py(c).toFixed(1)}`).join(' L')

const SERIES = [
  { id: 'ss', pts: SS, at: 1, cls: 'is-both' },
  { id: 'ca', pts: CA, at: 2, cls: 'is-both' },
  { id: 'tahoe', pts: TAHOE, at: 4, cls: 'is-tahoe' },
  { id: 'reno', pts: RENO, at: 5, cls: 'is-reno' },
] as const

const XT = [0, 2, 4, 6, 8, 10, 12, 14]
const YT = [0, 4, 8, 12, 16]

const NOTES = [
  { at: 1, head: 'Slow start', body: 'cwnd = 1 → 2 → 4 → 8 MSS: fordobles hver RTT, til den når ssthresh = 8.' },
  { at: 2, head: 'Congestion avoidance', body: '+1 MSS pr. RTT: 9, 10, 11, 12.' },
  { at: 3, head: '3 duplicate ACK ved cwnd = 12', body: 'ssthresh = 12 / 2 = 6 MSS.' },
  { at: 4, head: 'Tahoe', body: 'cwnd = 1 MSS og slow start igen: 1, 2, 4 — derefter 6, 7, 8, 9 (loftet er den nye ssthresh = 6).' },
  { at: 5, head: 'Reno', body: 'Fast recovery: cwnd = ssthresh + 3 = 9 MSS, derefter lineært: 9 … 15.' },
]

function Chart({ step }: { step: number }) {
  const lossOn = step >= 3
  return (
    <svg className="kcc-svg" viewBox="0 0 330 232" role="img" aria-label="cwnd i MSS som funktion af transmissionsrunde, efter figur 3.52">
      {YT.map((c) => (
        <g key={c}>
          <line x1={X0} x2={X1} y1={py(c)} y2={py(c)} className={c === 0 ? 'kcc-axis' : 'kcc-grid'} />
          <text x={X0 - 6} y={py(c)} className="kcc-tick" textAnchor="end" dominantBaseline="central">
            {c}
          </text>
        </g>
      ))}
      <line x1={X0} x2={X0} y1={Y0} y2={Y1} className="kcc-axis" />
      {XT.map((r) => (
        <text key={r} x={px(r)} y={Y0 + 13} className="kcc-tick" textAnchor="middle" dominantBaseline="central">
          {r}
        </text>
      ))}
      <text x={(X0 + X1) / 2} y={Y0 + 29} className="kcc-axt" textAnchor="middle" dominantBaseline="central">
        transmissionsrunde
      </text>
      <text x={X0 + 4} y={Y1 - 4} className="kcc-axt" textAnchor="start">
        cwnd (MSS)
      </text>

      {/* ssthresh 8 fra start, ssthresh 6 efter tabet */}
      <line x1={X0} x2={px(8)} y1={py(8)} y2={py(8)} className="kcc-thresh" data-now={step === 1 || undefined} />
      <motion.g initial={false} animate={{ opacity: lossOn ? 1 : 0 }} transition={lossOn ? t.settle : t.fade}>
        <line x1={px(8)} x2={X1} y1={py(6)} y2={py(6)} className="kcc-thresh" data-now={step === 3 || undefined} />
      </motion.g>

      {SERIES.map((s) => {
        const on = step >= s.at
        return (
          <g key={s.id} className={`kcc-series ${s.cls}`} data-now={step === s.at || undefined}>
            <motion.path
              d={d(s.pts)}
              className="kcc-line"
              initial={false}
              animate={{ pathLength: on ? 1 : 0, opacity: on ? 1 : 0 }}
              transition={on ? { ...t.travel, duration: 1.1 } : t.fade}
            />
            {s.pts.map(([r, c], i) => (
              <motion.circle
                key={i}
                cx={px(r)}
                cy={py(c)}
                r={2.6}
                className="kcc-dot"
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={on ? { ...t.fade, delay: 0.15 + (i / s.pts.length) * 0.9 } : t.fade}
              />
            ))}
          </g>
        )
      })}

      {/* tabshændelsen */}
      <motion.g initial={false} animate={{ opacity: lossOn ? 1 : 0 }} transition={lossOn ? t.place : t.fade}>
        <circle cx={px(8)} cy={py(12)} r={6} className="kcc-loss" />
        <text x={px(8)} y={py(12) - 12} className="kcc-llab" textAnchor="middle">
          3 dup-ACK
        </text>
      </motion.g>

      <motion.text
        x={X1}
        y={py(6) + 16}
        className="kcc-name is-tahoe"
        textAnchor="end"
        initial={false}
        animate={{ opacity: step >= 4 ? 1 : 0 }}
        transition={t.fade}
      >
        Tahoe
      </motion.text>
      <motion.text
        x={X1}
        y={py(12.3)}
        className="kcc-name is-reno"
        textAnchor="end"
        initial={false}
        animate={{ opacity: step >= 5 ? 1 : 0 }}
        transition={t.fade}
      >
        Reno
      </motion.text>
    </svg>
  )
}

function Cwnd({ step }: { step: number }) {
  return (
    <div className="kcc">
      <div className="kcc-plot">
        <Chart step={step} />
        <p className="kcc-legend">
          <span className="kcc-dash" aria-hidden="true" /> ssthresh: 8 MSS fra start
          <motion.span initial={false} animate={{ opacity: step >= 3 ? 1 : 0 }} transition={t.fade}>
            , 6 MSS efter tabet
          </motion.span>
        </p>
      </div>
      <ol className="kcc-notes">
        {NOTES.map((n) => {
          const on = step >= n.at
          return (
            <motion.li
              key={n.head}
              className="kcc-note"
              data-now={step === n.at || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
              transition={on ? t.settle : t.fade}
            >
              <span className="kcc-note-head">{n.head}</span>
              <span className="kcc-note-body">{n.body}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-congestion-control',
  title: 'cwnd gennem slow start, congestion avoidance og et tab',
  steps: [
    {
      caption: 'Bogens figur 3.52: cwnd i MSS pr. transmissionsrunde. Tærsklen **ssthresh** starter på 8 MSS.',
      hold: 2000,
    },
    {
      caption: '**Slow start**: cwnd starter på 1 MSS og vokser med 1 MSS pr. ACK — det fordobler den hver runde, til den når ssthresh i runde 4.',
      hold: 2800,
    },
    {
      caption: '**Congestion avoidance**: nu kun +1 MSS pr. RTT. cwnd kryber op til 12 MSS.',
      hold: 2400,
    },
    {
      caption: 'Lige efter runde 8 kommer **tre duplicate ACK’er**. ssthresh sættes til halvdelen af cwnd: 6 MSS.',
      hold: 2600,
    },
    {
      caption: '**TCP Tahoe** går altid helt ned til 1 MSS og laver slow start igen — op til den nye ssthresh, derefter lineært.',
      hold: 3000,
    },
    {
      caption: '**TCP Reno** har fast recovery: cwnd = ssthresh + 3 = 9 MSS og fortsætter lineært. Ved en *timeout* ville også Reno gå til 1 MSS.',
      hold: 3400,
    },
  ],
  Component: Cwnd,
}

export default viz
