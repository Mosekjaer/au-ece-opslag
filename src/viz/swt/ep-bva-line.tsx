import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './ep-bva-line.css'

/* Boundary-Value-Analysis.pdf s. 2 (definitionen), s. 4 (EP: nødvendig og
   tilstrækkelig), s. 7 (opgaven og EP'erne) og s. 8 (løsningen: mørke pile på
   0, 1, 2, 7, 8, 12, 13 og lyse pile på 3, 9, 14 — kun som billede).
   Slidet forklarer ikke de lyse pile; de tolkes som ekstra værdier inde i klasserne. */

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']
const BOUNDARY = [0, 1, 2, 7, 8, 12, 13]
const EXTRA = [3, 9, 14]
/** Celler med en klassegrænse på venstre side. */
const EDGE_LEFT = [1, 2, 8, 13]

type Ep = { from: number; to: number; label: string; illegal?: boolean }
/* To segmenter, så tallinjen kan brydes ved grænsen 7|8 på smalle plader. */
const SEGMENTS: { cells: (number | '…')[]; eps: Ep[] }[] = [
  {
    cells: [0, 1, 2, 3, 4, 5, 6, 7],
    eps: [
      { from: 0, to: 0, label: 'Illegal', illegal: true },
      { from: 1, to: 1, label: 'Fall' },
      { from: 2, to: 7, label: 'Spring' },
    ],
  },
  {
    cells: [8, 9, 10, 11, 12, 13, 14, '…'],
    eps: [
      { from: 8, to: 12, label: 'Fall' },
      { from: 13, to: 15, label: 'Illegal', illegal: true },
    ],
  },
]

const RESULTS: { v: number; out: string; kind: 'b' | 'x'; illegal?: boolean }[] = [
  { v: 0, out: 'ugyldig', kind: 'b', illegal: true },
  { v: 1, out: '"Fall"', kind: 'b' },
  { v: 2, out: '"Spring"', kind: 'b' },
  { v: 3, out: '"Spring"', kind: 'x' },
  { v: 7, out: '"Spring"', kind: 'b' },
  { v: 8, out: '"Fall"', kind: 'b' },
  { v: 9, out: '"Fall"', kind: 'x' },
  { v: 12, out: '"Fall"', kind: 'b' },
  { v: 13, out: 'ugyldig', kind: 'b', illegal: true },
  { v: 14, out: 'ugyldig', kind: 'x', illegal: true },
]

function Arrow({ kind }: { kind: 'b' | 'x' }) {
  return (
    <svg className="eb-arrow" data-kind={kind} viewBox="0 0 16 18" width="16" height="18" aria-hidden="true">
      <path d="M8 1 15 9H11V17H5V9H1Z" />
    </svg>
  )
}

function EpBva({ step }: { step: number }) {
  const eps = at(step, 1)
  const edges = at(step, 2)
  const bnd = at(step, 3)
  const ext = at(step, 4)
  const final = at(step, 5)

  return (
    <div className="eb">
      <div className="eb-head">
        <code className="eb-sig">string Calendar.Month2&shy;Semester(uint month)</code>
        <span className="eb-spec">
          1–12 → <code>"Spring"</code> <span className="eb-nw">(FEB–JUL)</span> eller <code>"Fall"</code> <span className="eb-nw">(AUG–JAN)</span>
        </span>
      </div>

      <div className="eb-line">
        {SEGMENTS.map((seg, si) => (
          <div className="eb-seg" key={si} style={{ gridTemplateColumns: `repeat(${seg.cells.length}, minmax(0, 1fr))` }}>
            {/* Klammer for ækvivalensklasserne */}
            {seg.eps.map((ep, ei) => {
              const start = seg.cells.indexOf(ep.from)
              const end = ep.to > 14 ? seg.cells.length - 1 : seg.cells.indexOf(ep.to)
              const order = si * 3 + ei
              return (
                <motion.div
                  key={ei}
                  className="eb-ep"
                  data-illegal={ep.illegal || undefined}
                  style={{ gridColumn: `${start + 1} / ${end + 2}` }}
                  initial={false}
                  animate={{ opacity: eps ? 1 : 0, y: eps ? 0 : -4 }}
                  transition={eps ? stagger(order, 0.05, 0.12) : t.fade}
                >
                  <span className="eb-ep-label">{ep.label}</span>
                  <span className="eb-brace" />
                </motion.div>
              )
            })}

            {/* Tal og måneder */}
            {seg.cells.map((c, ci) => {
              const n = typeof c === 'number' ? c : null
              const isB = n !== null && BOUNDARY.includes(n)
              const isX = n !== null && EXTRA.includes(n)
              const edgeL = n !== null && EDGE_LEFT.includes(n)
              const picked = (isB && bnd) || (isX && ext)
              return (
                <div
                  key={ci}
                  className="eb-cell"
                  style={{ gridColumn: ci + 1 }}
                  data-picked={picked ? (isB ? 'b' : 'x') : undefined}
                >
                  {edgeL && (
                    <motion.span
                      className="eb-edge"
                      initial={false}
                      animate={{ opacity: edges ? 1 : 0, scaleY: edges ? 1 : 0.3 }}
                      transition={edges ? t.place : t.fade}
                    />
                  )}
                  <span className="eb-num">{c}</span>
                  <span className="eb-month">{n !== null && n >= 1 && n <= 12 ? MONTHS[n - 1] : ' '}</span>
                  <span className="eb-arrow-slot">
                    {(isB || isX) && (
                      <motion.span
                        className="eb-arrow-wrap"
                        initial={false}
                        animate={{ opacity: (isB ? bnd : ext) ? 1 : 0, y: (isB ? bnd : ext) ? 0 : 8 }}
                        transition={
                          (isB ? bnd : ext)
                            ? { ...t.place, delay: 0.1 + (isB ? BOUNDARY.indexOf(n!) : EXTRA.indexOf(n!)) * 0.1 }
                            : t.fade
                        }
                      >
                        <Arrow kind={isB ? 'b' : 'x'} />
                      </motion.span>
                    )}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </div>

      <div className="eb-legend">
        <motion.span
          className="eb-key"
          initial={false}
          animate={{ opacity: edges ? 1 : 0 }}
          transition={t.fade}
        >
          <span className="eb-key-edge" /> grænse mellem klasser
        </motion.span>
        <motion.span className="eb-key" initial={false} animate={{ opacity: bnd ? 1 : 0 }} transition={t.fade}>
          <Arrow kind="b" /> grænseværdi: på og på begge sider
        </motion.span>
        <motion.span className="eb-key" initial={false} animate={{ opacity: ext ? 1 : 0 }} transition={t.fade}>
          <Arrow kind="x" /> ekstra værdi inde i klassen (tolket)
        </motion.span>
      </div>

      <motion.div
        className="eb-result"
        initial={false}
        animate={{ opacity: final ? 1 : 0, y: final ? 0 : 6 }}
        transition={final ? t.settle : t.fade}
        aria-hidden={!final || undefined}
      >
        <div className="eb-cases">
          {RESULTS.map((r, i) => (
            <motion.span
              key={r.v}
              className="eb-case"
              data-kind={r.kind}
              data-illegal={r.illegal || undefined}
              initial={false}
              animate={{ opacity: final ? 1 : 0 }}
              transition={final ? stagger(i, 0.1, 0.05) : t.fade}
            >
              <b>{r.v}</b> → {r.out}
            </motion.span>
          ))}
        </div>
        <p className="eb-point">
          <b>EP</b>: én værdi pr. klasse er <i>nødvendig</i> og <i>tilstrækkelig</i>. <b>BVA</b>: test på grænsen og på begge
          sider af den. Hvad metoden gør ved en ugyldig måned, er ikke specificeret.
        </p>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'ep-bva-line',
  title: 'Month2Semester på tallinjen',
  steps: [
    {
      caption: '`Month2Semester` tager en `uint`. Tallinjen viser 0, 1, … 14 og månederne JAN–DEC under 1–12.',
      hold: 1800,
    },
    {
      caption:
        'Fem **ækvivalensklasser**: *Illegal* (0), *Fall* (1), *Spring* (2–7), *Fall* (8–12) og *Illegal* (13 og op). Ugyldigt input er også en klasse.',
      hold: 2800,
    },
    { caption: 'Klasserne mødes i fire **grænser**: 0|1, 1|2, 7|8 og 12|13. Her skifter output.', hold: 2200 },
    {
      caption: '**Grænseværdierne** på slidet: 0, 1, 2, 7, 8, 12, 13 — værdien på hver side af hver grænse.',
      hold: 2600,
    },
    {
      caption: 'Slidets lyse pile står på 3, 9 og 14 — ekstra værdier inde i de brede klasser. Slidet forklarer dem ikke; det er en tolkning.',
      hold: 2600,
    },
    {
      caption:
        'Ti testværdier med forventet output. EP holder antallet nede, BVA vælger værdierne, hvor fejl som `>` i stedet for `>=` sidder.',
      hold: 3000,
    },
  ],
  Component: EpBva,
}

export default viz
