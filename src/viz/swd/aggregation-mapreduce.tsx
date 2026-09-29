import { Fragment, type ReactNode } from 'react'
import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link } from '../kit/primitives'
import { t } from '../kit/motion'
import './aggregation-mapreduce.css'

/* Kilder: Concurrency - Aggregation, MapReduce.pdf
   s. 16 (Distribute, Map, Group, Reduce; “Distribute and Group do not vary –
   usually provided by a framework. Map and Reduce vary – provided by developer.”),
   s. 19 (forespørgslen), s. 20 (solpanel-loggen på Node 1–3, Map til key = hour,
   value = output, Group på tværs af nodes, Reduce ved summering: 451W, 407W, 308W),
   s. 21 (MapReduce() på ParallelQuery: SelectMany(map), GroupBy(keySelector),
   SelectMany(reduce)). Sliden har ingen Distribute-animation; data står allerede på
   nodes. “…” markerer, at loggen har flere linjer end udsnittet. */

const HOURS = [12, 13, 14] as const
type Hour = (typeof HOURS)[number]

/** Seks målinger pr. node, i slidens rækkefølge: 12:00:00, 12:00:10, 13:00:00 … */
const NODES: number[][] = [
  [75, 70, 68, 71, 58, 55],
  [73, 74, 65, 62, 49, 48],
  [78, 81, 69, 72, 49, 49],
]
const hourOf = (i: number): Hour => HOURS[Math.floor(i / 2)]
const secOf = (i: number) => (i % 2 === 0 ? '00:00' : '00:10')
const SUM: Record<Hour, number> = { 12: 451, 13: 407, 14: 308 }

/** Linjerne i et node-kort: seks målinger med “…” mellem timerne. */
const LINES: (number | '…')[] = [0, 1, '…', 2, 3, '…', 4, 5]

const tokId = (n: number, i: number) => `mr-${n}-${i}`

function Val({ n, i, text, delay = 0 }: { n: number; i: number; text: string; delay?: number }) {
  return (
    <motion.span
      layoutId={tokId(n, i)}
      layout="position"
      className="swd-mr-tok"
      data-h={hourOf(i)}
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ ...t.travel, delay, opacity: { ...t.fade, delay } }}
    >
      {text}
    </motion.span>
  )
}

/** Bryd før “(” i metodenavne på smalle skærme. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?=\()/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {i > 0 && <wbr />}
      {p}
    </Fragment>
  ))
}

const HEAD = [
  { id: 'dist', name: 'Distribute', sub: 'allerede fordelt på nodes', who: 'framework', plinq: null },
  { id: 'map', name: 'Map', sub: 'på hver node', who: 'udvikler', plinq: 'SelectMany(map)' },
  { id: 'group', name: 'Group', sub: 'på tværs af nodes', who: 'framework', plinq: 'GroupBy(keySelector)' },
  { id: 'reduce', name: 'Reduce', sub: 'summering', who: 'udvikler', plinq: 'SelectMany(reduce)' },
] as const

function MapReduce({ step }: { step: number }) {
  const mapped = step >= 1
  const grouped = step >= 2
  const reduced = step >= 3
  const roles = step >= 4

  return (
    <div className="swd-mr">
      <p className="swd-mr-query">
        <span className="swd-mr-query-label">Forespørgsel</span> <em>What is the total per-hour production from all panels?</em>
      </p>

      <div className="swd-mr-grid">
        <div className="swd-mr-head">
          {HEAD.map((h, i) => (
            <Fragment key={h.id}>
              {i > 0 && (
                <div className={`swd-mr-harrow swd-mr-harrow-${i}`}>
                  <Link on tone={step === i ? 'focus' : 'idle'} />
                </div>
              )}
              <div className={`swd-mr-hcell swd-mr-hcell-${h.id}`} data-on={step === i || undefined}>
                <div className="swd-mr-hname">
                  {h.name}
                  <motion.span
                    className="swd-mr-who"
                    data-who={h.who}
                    initial={false}
                    animate={{ opacity: roles ? 1 : 0, scale: roles ? 1 : 0.85 }}
                    transition={roles ? { ...t.place, delay: 0.1 + i * 0.12 } : t.fade}
                  >
                    {h.who}
                  </motion.span>
                </div>
                <div className="swd-mr-hsub">{h.sub}</div>
                <motion.code
                  className="swd-mr-plinq"
                  initial={false}
                  animate={{ opacity: roles && h.plinq ? 1 : 0 }}
                  transition={roles ? { ...t.fade, delay: 0.4 + i * 0.12 } : t.fade}
                >
                  {h.plinq ? brk(h.plinq) : ' '}
                </motion.code>
              </div>
            </Fragment>
          ))}
        </div>

        {NODES.map((vals, n) => (
          <Fragment key={n}>
            <div className={`swd-mr-card swd-mr-r${n}`} data-on={step === 1 || undefined} />
            <div className={`swd-mr-raw swd-mr-r${n}`} data-mapped={mapped || undefined}>
              <div className="swd-mr-node">Node {n + 1}</div>
              {LINES.map((l, k) =>
                l === '…' ? (
                  <div key={k} className="swd-mr-ell">
                    …
                  </div>
                ) : (
                  <div key={k} className="swd-mr-line">
                    <span className="swd-mr-dim">5/9-14 </span>
                    <span className="swd-mr-hour" data-h={hourOf(l)}>
                      {hourOf(l)}
                    </span>
                    <span className="swd-mr-dim">:{secOf(l)}: </span>
                    <span className="swd-mr-w">{vals[l]}W</span>
                  </div>
                ),
              )}
            </div>
            <div className={`swd-mr-marrow swd-mr-r${n}`}>
              <Link on={mapped} tone={step === 1 ? 'focus' : 'idle'} />
            </div>
            <div className={`swd-mr-map swd-mr-r${n}`}>
              <div className="swd-mr-node" aria-hidden="true">
                &nbsp;
              </div>
              {LINES.map((l, k) =>
                l === '…' ? (
                  <motion.div
                    key={k}
                    className="swd-mr-ell"
                    initial={false}
                    animate={{ opacity: mapped ? 1 : 0 }}
                    transition={t.fade}
                  >
                    …
                  </motion.div>
                ) : (
                  <div key={k} className="swd-mr-line">
                    <motion.span
                      className="swd-mr-key"
                      data-h={hourOf(l)}
                      initial={false}
                      animate={{ opacity: mapped ? 1 : 0, x: mapped ? 0 : -14 }}
                      transition={mapped ? { ...t.travel, delay: 0.15 + n * 0.1 + l * 0.05 } : t.fade}
                    >
                      {hourOf(l)}:
                    </motion.span>{' '}
                    <span className="swd-mr-slot">
                      {step === 1 ? (
                        <Val n={n} i={l} text={`${vals[l]}W`} delay={0.15 + n * 0.1 + l * 0.05} />
                      ) : (
                        <span className="swd-mr-left" data-shown={grouped || undefined}>
                          {vals[l]}W
                        </span>
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          </Fragment>
        ))}

        {/* Group: det eneste trin, hvor data krydser node-grænsen. */}
        <svg className="swd-mr-fan" viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true">
          {[0, 1, 2].map((from) =>
            HOURS.map((h, to) => (
              <motion.path
                key={`${from}-${h}`}
                className="swd-mr-fanline"
                data-h={h}
                d={`M0 ${50 + from * 100} C50 ${50 + from * 100} 50 ${50 + to * 100} 100 ${50 + to * 100}`}
                vectorEffect="non-scaling-stroke"
                initial={false}
                animate={{ opacity: grouped ? 1 : 0 }}
                transition={grouped ? { ...t.fade, delay: 0.1 + 0.06 * (from * 3 + to) } : t.fade}
              />
            )),
          )}
        </svg>
        <motion.div
          className="swd-mr-cross"
          initial={false}
          animate={{ opacity: grouped ? 1 : 0 }}
          transition={t.fade}
        >
          <span>↓</span> Group på tværs af Node 1–3 <span>↓</span>
        </motion.div>

        {HOURS.map((h, g) => (
          <Fragment key={h}>
            <div className={`swd-mr-group swd-mr-r${g}`} data-on={step === 2 || undefined} data-h={h}>
              <span className="swd-mr-key" data-h={h}>
                {h}:
              </span>
              <span className="swd-mr-vals" data-reduced={reduced || undefined}>
                {NODES.flatMap((vals, n) =>
                  [0, 1].map((j) => {
                    const i = g * 2 + j
                    return grouped ? (
                      <Val key={tokId(n, i)} n={n} i={i} text={String(vals[i])} />
                    ) : (
                      <span key={tokId(n, i)} className="swd-mr-tok swd-mr-ph" aria-hidden="true">
                        {vals[i]}
                      </span>
                    )
                  }),
                )}
              </span>
            </div>
            <div className={`swd-mr-rarrow swd-mr-r${g}`}>
              <Link on={reduced} tone={step === 3 ? 'focus' : 'idle'} label="Σ" />
            </div>
            <motion.div
              className={`swd-mr-reduce swd-mr-r${g}`}
              data-on={step === 3 || undefined}
              initial={false}
              animate={{ opacity: reduced ? 1 : 0, scale: reduced ? 1 : 0.8, x: reduced ? 0 : -10 }}
              transition={reduced ? { ...t.place, delay: 0.45 + g * 0.12 } : t.fade}
            >
              <span className="swd-mr-key" data-h={h}>
                {h}:
              </span>{' '}
              <strong>{SUM[h]}W</strong>
            </motion.div>
          </Fragment>
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'aggregation-mapreduce',
  title: 'MapReduce med solpanelerne',
  steps: [
    {
      caption: 'Tre nodes har hver deres del af loggen. Spørgsmålet: *What is the total per-hour production from all panels?*',
      hold: 2400,
    },
    {
      caption: '**Map** gør hver loglinje til et par: key = time, value = output. Det sker på hver node for sig.',
      hold: 2600,
    },
    {
      caption: '**Group** samler parrene med samme nøgle — på tværs af alle nodes.',
      hold: 2800,
    },
    {
      caption: '**Reduce** lægger hver gruppe sammen til ét tal.',
      hold: 2200,
    },
    {
      caption:
        'Distribute og Group leverer frameworket. Map og Reduce skriver udvikleren — i C# `SelectMany(map)`, `GroupBy(keySelector)` og `SelectMany(reduce)`.',
      hold: 3000,
    },
  ],
  Component: MapReduce,
}

export default viz
