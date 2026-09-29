import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './design-patterns.css'

/* Design Patterns - Introduction.pdf s. 5 (“Design patterns are not invented, they
   emerge … Often the solutions have something in common, which can be formulated as
   a pattern”), s. 8 (vokabular), s. 10 (GoF-kataloget i tre kategorier; sliden staver
   “Adaptive” og “Template” — her GoF-navnene Adapter og Template Method), s. 12
   (kursets seks mønstre markeret med rødt).
   De tre løsninger: HFDP (SWD_Head-First-Design-Patterns-2nd-Edition.pdf) PDF s. 95
   (WeatherData og tre displays), PDF s. 104 (JButton, AngelListener, DevilListener via
   addActionListener, actionPerformed); W06b s. 3–4 (Provider → Consumer, DataChanged()).
   Skabelonen: W06b s. 6 (Subject —observers *→ «interface» Observer + Update()).
   At netop de tre stilles op som “forskellige løsninger, der viser sig at være samme
   mønster”, er en didaktisk sammenstilling; i materialet står de hver for sig. */

type Pt = [number, number]

const CARDS = [
  { src: 'HFDP · Weather-O-Rama', sender: 'WeatherData', call: 'update()', recv: ['CurrentConditionsDisplay', 'StatisticsDisplay', 'ForecastDisplay'] },
  { src: 'HFDP · Swing', sender: 'JButton', call: 'actionPerformed()', recv: ['AngelListener', 'DevilListener'] },
  { src: 'W06b · data-update', sender: 'Provider', call: 'DataChanged()', recv: ['Consumer'] },
] as const

const CATALOG = [
  { id: 'c', name: 'Creational', items: ['Abstract Factory', 'Builder', 'Factory Method', 'Prototype', 'Singleton'] },
  { id: 's', name: 'Structural', items: ['Adapter', 'Bridge', 'Composite', 'Decorator', 'Façade', 'Flyweight', 'Proxy'] },
  {
    id: 'b',
    name: 'Behavioral',
    items: ['Chain of Responsibility', 'Command', 'Interpreter', 'Iterator', 'Mediator', 'Memento', 'Observer', 'State', 'Strategy', 'Template Method', 'Visitor'],
  },
] as const
const COURSE = new Set(['Abstract Factory', 'Factory Method', 'Observer', 'State', 'Strategy', 'Template Method'])

/* ------------------------------- Layout ------------------------------- */

interface Lay {
  vb: [number, number]
  font: number
  cw: number
  ui: number
  cards: { x: number; y: number; w: number; h: number }[]
  pat: { x: number; y: number; w: number; h: number; titleY: number }
  subj: { x: number; y: number; w: number; h: number }
  obs: { x: number; y: number; w: number; h: number }
  arrowX: number
  quote: [number, number] | null
}

const WIDE: Lay = {
  vb: [840, 322],
  font: 11.5,
  cw: 6.9,
  ui: 11.5,
  cards: [
    { x: 0, y: 0, w: 264, h: 152 },
    { x: 288, y: 0, w: 264, h: 152 },
    { x: 576, y: 0, w: 264, h: 152 },
  ],
  pat: { x: 496, y: 184, w: 340, h: 114, titleY: 203 },
  subj: { x: 510, y: 232, w: 88, h: 30 },
  obs: { x: 700, y: 216, w: 124, h: 66 },
  arrowX: 700,
  quote: [20, 232],
}

const NARROW: Lay = {
  vb: [290, 550],
  font: 11,
  cw: 6.6,
  ui: 11,
  cards: [
    { x: 0, y: 0, w: 290, h: 152 },
    { x: 0, y: 162, w: 290, h: 124 },
    { x: 0, y: 296, w: 290, h: 96 },
  ],
  pat: { x: 4, y: 410, w: 282, h: 114, titleY: 429 },
  subj: { x: 16, y: 458, w: 74, h: 30 },
  obs: { x: 170, y: 442, w: 106, h: 66 },
  arrowX: 217,
  quote: null,
}

/** Inde i et kort: afsenderens og modtagernes bokse. */
function cardGeo(L: Lay, i: number) {
  const c = L.cards[i]
  const card = CARDS[i]
  const sender = { x: c.x + 12, y: c.y + 28, w: card.sender.length * L.cw + 16, h: 22 }
  const recv = card.recv.map((r, j) => ({ x: c.x + 42, y: c.y + 62 + j * 28, w: r.length * L.cw + 16, h: 22 }))
  const busX = c.x + 26
  return { c, card, sender, recv, busX }
}

const center = (b: { x: number; y: number; w: number; h: number }): Pt => [b.x + b.w / 2, b.y + b.h / 2]

/* Tider i trin 2 (udtrækket). */
const X = { dim: 0.1, ghost: 0.25, ghostDur: 0.9, land: 1.05, assoc: 1.25 }

/* ------------------------------- Diagram ------------------------------- */

function Diagram({ L, step, className }: { L: Lay; step: number; className: string }) {
  const lit = step >= 1
  const dim = step >= 2
  const extracting = step === 2
  const patOn = step >= 2
  const subjC = center(L.subj)
  const obsC = center(L.obs)
  const assocY = subjC[1]
  const appear = (on: boolean, live: boolean, delay: number, from = 6) =>
    live
      ? { initial: { opacity: 0, y: from }, animate: { opacity: 1, y: 0 }, transition: { ...t.place, delay } }
      : { initial: false as const, animate: { opacity: on ? 1 : 0, y: 0 }, transition: t.fade }

  return (
    <svg className={`swd-dp-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} style={{ fontSize: L.font }} aria-hidden="true">
      {/* Tre konkrete løsninger. */}
      {CARDS.map((_, i) => {
        const g = cardGeo(L, i)
        const last = g.recv[g.recv.length - 1]
        return (
          <g key={i} className="swd-dp-card" data-lit={lit || undefined} data-dim={dim || undefined}>
            <rect className="swd-dp-card-r" x={g.c.x + 0.75} y={g.c.y + 0.75} width={g.c.w - 1.5} height={g.c.h - 1.5} rx={5} />
            <text className="swd-dp-src" x={g.c.x + 12} y={g.c.y + 15} style={{ fontSize: L.ui }}>
              {g.card.src}
            </text>
            <path className="swd-dp-wire" d={`M${g.busX} ${g.sender.y + g.sender.h} V${last.y + last.h / 2}`} />
            {g.recv.map((r, j) => (
              <g key={j}>
                <path className="swd-dp-wire" d={`M${g.busX} ${r.y + r.h / 2} H${r.x - 6}`} />
                <path className="swd-dp-wirehead" d={`M${r.x - 7} ${r.y + r.h / 2 - 4} L${r.x} ${r.y + r.h / 2} L${r.x - 7} ${r.y + r.h / 2 + 4}Z`} />
              </g>
            ))}
            <rect className="swd-dp-sender" x={g.sender.x} y={g.sender.y} width={g.sender.w} height={g.sender.h} rx={3} />
            <text className="swd-dp-sender-t" x={g.sender.x + g.sender.w / 2} y={g.sender.y + g.sender.h / 2} textAnchor="middle">
              {g.card.sender}
            </text>
            <text className="swd-dp-call" x={g.sender.x + g.sender.w + 10} y={g.sender.y + g.sender.h / 2}>
              → {g.card.call}
            </text>
            {g.recv.map((r, j) => (
              <g key={`r${j}`}>
                <rect className="swd-dp-recv" x={r.x} y={r.y} width={r.w} height={r.h} rx={3} />
                <text className="swd-dp-recv-t" x={r.x + r.w / 2} y={r.y + r.h / 2} textAnchor="middle">
                  {g.card.recv[j]}
                </text>
              </g>
            ))}
          </g>
        )
      })}

      {/* Fællestrækket glider sammen til ét mønster. */}
      {extracting &&
        CARDS.flatMap((_, i) => {
          const g = cardGeo(L, i)
          const parts: { b: typeof g.sender; to: Pt; kind: 's' | 'r' }[] = [
            { b: g.sender, to: subjC, kind: 's' },
            ...g.recv.map((r) => ({ b: r, to: obsC, kind: 'r' as const })),
          ]
          return parts.map((p, j) => {
            const [cx, cy] = center(p.b)
            const w = 44
            const h = 18
            return (
              <motion.rect
                key={`gh-${i}-${j}`}
                className="swd-dp-ghost"
                data-kind={p.kind}
                x={-w / 2}
                y={-h / 2}
                width={w}
                height={h}
                rx={3}
                initial={{ x: cx, y: cy, opacity: 0 }}
                animate={{ x: p.to[0], y: p.to[1], opacity: [0, 1, 1, 0] }}
                transition={{
                  x: { ...t.travel, duration: X.ghostDur, delay: X.ghost + i * 0.08 + j * 0.03 },
                  y: { ...t.travel, duration: X.ghostDur, delay: X.ghost + i * 0.08 + j * 0.03 },
                  opacity: { duration: X.ghostDur + 0.25, delay: X.ghost + i * 0.08 + j * 0.03, times: [0, 0.1, 0.8, 1] },
                }}
              />
            )
          })
        })}

      {L.quote && (
        <motion.text className="swd-dp-quote" x={L.quote[0]} y={L.quote[1]} style={{ fontSize: 13 }} {...appear(patOn, extracting, X.land)}>
          <tspan x={L.quote[0]}>“Design patterns are not invented, they emerge.</tspan>
          <tspan x={L.quote[0]} dy="1.45em">
            Often the solutions have something in common,
          </tspan>
          <tspan x={L.quote[0]} dy="1.45em">
            which can be formulated as a pattern.”
          </tspan>
          <tspan className="swd-dp-quote-src" x={L.quote[0]} dy="1.7em" style={{ fontSize: L.ui }}>
            Design Patterns – Introduction, slide 5
          </tspan>
        </motion.text>
      )}

      {/* Mønsterkortet. */}
      <motion.g className="swd-dp-pat" data-named={step >= 3 || undefined} {...appear(patOn, extracting, X.land - 0.15, 8)}>
        <rect className="swd-dp-pat-r" x={L.pat.x} y={L.pat.y} width={L.pat.w} height={L.pat.h} rx={6} />
        <text className="swd-dp-pat-empty" x={L.pat.x + L.pat.w / 2} y={L.pat.titleY} textAnchor="middle" style={{ fontSize: L.ui }} opacity={step >= 3 ? 0 : 1}>
          fællesnævneren
        </text>
      </motion.g>
      <motion.text
        key={`title-${step === 3}`}
        className="swd-dp-pat-title"
        x={L.pat.x + L.pat.w / 2}
        y={L.pat.titleY}
        textAnchor="middle"
        style={{ fontSize: 15 }}
        initial={step === 3 ? { opacity: 0, scale: 0.8 } : false}
        animate={{ opacity: step >= 3 ? 1 : 0, scale: 1 }}
        transition={step === 3 ? { ...t.place, delay: 0.15 } : t.fade}
      >
        Observer
      </motion.text>

      <motion.g {...appear(patOn, extracting, X.land)}>
        {/* Subject (abstrakt, W06b s. 6) */}
        <rect className="swd-dp-box is-s" x={L.subj.x} y={L.subj.y} width={L.subj.w} height={L.subj.h} />
        <text className="swd-dp-name is-abs" x={subjC[0]} y={subjC[1]} textAnchor="middle">
          Subject
        </text>
        {/* «interface» Observer + Update() */}
        <rect className="swd-dp-box is-r" x={L.obs.x} y={L.obs.y} width={L.obs.w} height={L.obs.h} />
        <text className="swd-dp-stereo" x={obsC[0]} y={L.obs.y + 12} textAnchor="middle" style={{ fontSize: L.ui }}>
          «interface»
        </text>
        <text className="swd-dp-name" x={obsC[0]} y={L.obs.y + 28} textAnchor="middle">
          Observer
        </text>
        <line className="swd-dp-sep" x1={L.obs.x} x2={L.obs.x + L.obs.w} y1={L.obs.y + 40} y2={L.obs.y + 40} />
        <text className="swd-dp-op" x={L.obs.x + 10} y={L.obs.y + 53}>
          + Update()
        </text>
      </motion.g>
      {/* Association: fuld linje, åben pilespids, rolle og multiplicitet. */}
      <motion.g
        key={`assoc-${extracting}`}
        initial={extracting ? { opacity: 0 } : false}
        animate={{ opacity: patOn ? 1 : 0 }}
        transition={extracting ? { ...t.fade, delay: X.assoc } : t.fade}
      >
        <path className="swd-dp-uml" d={`M${L.subj.x + L.subj.w} ${assocY} H${L.obs.x}`} />
        <path className="swd-dp-uml" d={`M${L.obs.x - 9} ${assocY - 5} L${L.obs.x} ${assocY} L${L.obs.x - 9} ${assocY + 5}`} />
        <text className="swd-dp-role" x={L.obs.x - 12} y={assocY - 10} textAnchor="end" style={{ fontSize: L.ui }}>
          observers
        </text>
        <text className="swd-dp-role" x={L.obs.x - 12} y={assocY + 11} textAnchor="end" style={{ fontSize: L.ui }}>
          *
        </text>
      </motion.g>

      {/* Navnet finder sin plads i kataloget. */}
      <motion.g
        key={`down-${step === 4}`}
        className="swd-dp-down"
        initial={step === 4 ? { opacity: 0, y: -6 } : false}
        animate={{ opacity: step >= 4 ? 1 : 0, y: 0 }}
        transition={step === 4 ? { ...t.place, delay: 0.1 } : t.fade}
      >
        <path d={`M${L.arrowX} ${L.pat.y + L.pat.h + 3} V${L.vb[1] - 8}`} />
        <path className="swd-dp-downhead" d={`M${L.arrowX - 5} ${L.vb[1] - 9} L${L.arrowX} ${L.vb[1] - 1} L${L.arrowX + 5} ${L.vb[1] - 9}Z`} />
      </motion.g>
    </svg>
  )
}

/* ------------------------------- Katalog ------------------------------- */

function Catalog({ step }: { step: number }) {
  const on = step >= 4
  const course = step >= 5
  return (
    <div className="swd-dp-cat" aria-hidden={!on || undefined}>
      {CATALOG.map((cat, ci) => (
        <motion.section
          key={cat.id}
          className="swd-dp-col"
          data-cat={cat.id}
          initial={false}
          animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
          transition={on && step === 4 ? { ...t.settle, delay: 0.1 + ci * 0.08 } : t.fade}
        >
          <div className="swd-dp-col-h">
            {cat.name} <span>{cat.items.length}</span>
          </div>
          <ul>
            {cat.items.map((it) => {
              const isObs = it === 'Observer'
              const state = course ? (COURSE.has(it) ? 'course' : 'rest') : isObs && on ? 'obs' : 'idle'
              return (
                <li key={it} data-state={state}>
                  {isObs && step === 4 ? (
                    <motion.span key="obs4" className="swd-dp-land" initial={{ opacity: 0, scale: 0.7, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} transition={{ ...t.place, delay: 0.55 }}>
                      {it}
                    </motion.span>
                  ) : (
                    it
                  )}
                </li>
              )
            })}
          </ul>
        </motion.section>
      ))}
    </div>
  )
}

function DesignPatterns({ step }: { step: number }) {
  return (
    <div className="swd-dp">
      <div className="swd-dp-dia">
        <Diagram L={WIDE} step={step} className="swd-dp-wide" />
        <Diagram L={NARROW} step={step} className="swd-dp-narrow" />
      </div>
      <Catalog step={step} />
      <p className="swd-dp-note">Illustrativt: de tre løsninger står hver for sig i materialet.</p>
    </div>
  )
}

const viz: VizDef = {
  id: 'design-patterns',
  title: 'Fra mange løsninger til ét mønster',
  steps: [
    { caption: 'Tre løsninger på hver sit problem.', hold: 2000 },
    { caption: 'Alle tre har samme kerne: én med tilstand, mange der skal have besked.', hold: 2400 },
    { caption: 'Fællesnævneren formuleres som et mønster — det er opdaget, ikke opfundet.', hold: 3000 },
    { caption: 'Nu er *Observer* et ord, man kan bruge i en designdiskussion.', hold: 2200 },
    { caption: 'Gang of Four: 23 mønstre i tre kategorier. *Observer* er behavioral.', hold: 2800 },
    { caption: 'Kurset arbejder med seks: to creational og fire behavioral.', hold: 2600 },
  ],
  Component: DesignPatterns,
}

export default viz
