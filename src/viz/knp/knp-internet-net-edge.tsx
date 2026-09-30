import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { stagger, t } from '../kit/motion'
import './knp-internet-net-edge.css'

/* Kilder til labels og tal:
   - Hierarkiet (Tier 1 ISP, IXP, Regional ISP, access ISP, Google): slide 27 i
     «Chapter_1_(… part 1).pdf» og bogens fig. 1.15 (Kurose & Ross s. 64).
   - Access network = fra end system til første router (edge router): bog s. 42.
   - Access-teknologier: bog s. 43–48 (DSL, kabel, FTTH, Ethernet, WiFi, 4G/5G).
   - Kunde betaler udbyder, tier-1 betaler ingen, peering settlement-free, > 600 IXP'er:
     bog s. 62–63. Content provider går udenom de øverste lag: slide 26–27, bog s. 64.
   - Antallet af access-ISP'er (4) er valgt for pladsens skyld; slide 27 viser 8. */

type Id = 't1a' | 't1b' | 'goo' | 'ixp1' | 'ixp2' | 'reg1' | 'reg2' | 'acc1' | 'acc2' | 'acc3' | 'acc4' | 'host' | 'srv'

interface Box {
  id: Id
  x: number
  y: number
  w: number
  h: number
  lines: string[]
  from: number // trin, hvor boksen kommer frem
  kind?: 'ixp' | 'end' | 'cp'
}

const BOXES: Box[] = [
  { id: 't1a', x: 60, y: 28, w: 100, h: 30, lines: ['Tier 1 ISP'], from: 2 },
  { id: 't1b', x: 172, y: 28, w: 100, h: 30, lines: ['Tier 1 ISP'], from: 2 },
  { id: 'goo', x: 286, y: 28, w: 96, h: 30, lines: ['Google'], from: 5, kind: 'cp' },
  { id: 'ixp1', x: 116, y: 84, w: 48, h: 24, lines: ['IXP'], from: 3, kind: 'ixp' },
  { id: 'ixp2', x: 228, y: 84, w: 48, h: 24, lines: ['IXP'], from: 3, kind: 'ixp' },
  { id: 'reg1', x: 88, y: 140, w: 116, h: 30, lines: ['Regional ISP'], from: 2 },
  { id: 'reg2', x: 252, y: 140, w: 116, h: 30, lines: ['Regional ISP'], from: 2 },
  { id: 'acc1', x: 42, y: 204, w: 72, h: 38, lines: ['access', 'ISP'], from: 0 },
  { id: 'acc2', x: 124, y: 204, w: 72, h: 38, lines: ['access', 'ISP'], from: 0 },
  { id: 'acc3', x: 216, y: 204, w: 72, h: 38, lines: ['access', 'ISP'], from: 0 },
  { id: 'acc4', x: 298, y: 204, w: 72, h: 38, lines: ['access', 'ISP'], from: 0 },
  { id: 'host', x: 42, y: 276, w: 72, h: 28, lines: ['vært A'], from: 0, kind: 'end' },
  { id: 'srv', x: 298, y: 276, w: 72, h: 28, lines: ['server B'], from: 0, kind: 'end' },
]

const B = Object.fromEntries(BOXES.map((b) => [b.id, b])) as Record<Id, Box>

interface Edge {
  a: Id
  b: Id
  from: number
  /** Trin, fra hvilket pakken har passeret kanten. */
  hot?: number
  dashed?: boolean
}

const EDGES: Edge[] = [
  { a: 'host', b: 'acc1', from: 1, hot: 1 },
  { a: 'srv', b: 'acc4', from: 1, hot: 4 },
  { a: 'acc1', b: 'reg1', from: 2, hot: 2 },
  { a: 'acc2', b: 'reg1', from: 2 },
  { a: 'acc3', b: 'reg2', from: 2 },
  { a: 'acc4', b: 'reg2', from: 2, hot: 4 },
  { a: 'reg1', b: 't1a', from: 2, hot: 2 },
  { a: 'reg2', b: 't1b', from: 2, hot: 4 },
  { a: 't1a', b: 'ixp1', from: 3, hot: 3 },
  { a: 'ixp1', b: 't1b', from: 3, hot: 3 },
  { a: 't1b', b: 'ixp2', from: 3 },
  { a: 'ixp2', b: 'goo', from: 5 },
  { a: 'goo', b: 'reg2', from: 5, dashed: true },
]

/** Kanten fra kant til kant af boksene (ikke fra centrum), så linjerne ikke krydser teksten. */
function clip(a: Box, b: Box) {
  const dx = b.x - a.x
  const dy = b.y - a.y
  const f = (box: Box) => {
    const sx = dx === 0 ? Infinity : box.w / 2 / Math.abs(dx)
    const sy = dy === 0 ? Infinity : box.h / 2 / Math.abs(dy)
    return Math.min(sx, sy)
  }
  const fa = f(a)
  const fb = f(b)
  return { x1: a.x + dx * fa, y1: a.y + dy * fa, x2: b.x - dx * fb, y2: b.y - dy * fb }
}

/** Pakkens rute pr. trin (knuder den passerer i det trin). */
const ROUTE: Record<number, Id[]> = {
  0: ['host'],
  1: ['host', 'acc1'],
  2: ['acc1', 'reg1', 't1a'],
  3: ['t1a', 'ixp1', 't1b'],
  4: ['t1b', 'reg2', 'acc4', 'srv'],
  5: ['srv'],
}

const LEGEND = [
  { from: 1, head: 'access network', text: 'vært → første router: DSL · kabel · FTTH · Ethernet · WiFi · 4G/5G' },
  { from: 2, head: 'kunde → udbyder', text: 'access betaler regional, regional betaler tier 1; tier 1 betaler ingen' },
  { from: 3, head: 'IXP', text: 'mødested, hvor ISP’er peerer, typisk settlement-free (> 600 IXP’er)' },
  { from: 5, head: 'content provider', text: 'privat net, der peerer direkte med lavere tier og går udenom' },
]

function NetEdge({ step }: { step: number }) {
  const route = ROUTE[Math.min(step, 5)]
  // Pakken står på boksens overkant, så den aldrig dækker teksten, når den hviler.
  const xs = route.map((id) => B[id].x)
  const ys = route.map((id) => B[id].y - B[id].h / 2)
  const moving = route.length > 1
  const passed = new Set<Id>(
    Object.entries(ROUTE)
      .filter(([s]) => Number(s) <= step)
      .flatMap(([, ids]) => ids),
  )

  return (
    <div className="kne">
      <svg className="kne-svg" viewBox="0 0 340 300" aria-hidden="true">
        {EDGES.map((e) => {
          const { x1, y1, x2, y2 } = clip(B[e.a], B[e.b])
          const on = step >= e.from
          const hot = e.hot !== undefined && step >= e.hot
          return (
            <motion.line
              key={`${e.a}-${e.b}`}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              className={`kne-edge ${e.dashed ? 'is-dashed' : ''}`}
              data-tone={hot ? 'focus' : 'idle'}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? stagger(0, 0.1) : t.fade}
            />
          )
        })}

        <motion.text
          x={50}
          y={226}
          className="kne-edge-label"
          initial={false}
          animate={{ opacity: step >= 1 ? 1 : 0 }}
          transition={t.fade}
        >
          <tspan x={50} dy="0.9em">access</tspan>
          <tspan x={50} dy="1.1em">network</tspan>
        </motion.text>
        <motion.text
          x={334}
          y={92}
          className="kne-edge-label"
          textAnchor="end"
          initial={false}
          animate={{ opacity: step >= 5 ? 1 : 0 }}
          transition={t.fade}
        >
          <tspan x={334} dy="0" textAnchor="end">går</tspan>
          <tspan x={334} dy="1.1em" textAnchor="end">udenom</tspan>
        </motion.text>

        {BOXES.map((b, i) => {
          const on = step >= b.from
          const tone = passed.has(b.id) && step >= 1 ? 'focus' : 'idle'
          return (
            <motion.g
              key={b.id}
              className="kne-box"
              data-kind={b.kind ?? 'isp'}
              data-tone={tone}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
              transition={on ? stagger(i % 4, 0.05) : t.fade}
            >
              <rect x={b.x - b.w / 2} y={b.y - b.h / 2} width={b.w} height={b.h} rx={b.kind === 'end' ? 13 : 5} />
              <text x={b.x} y={b.y} textAnchor="middle" dominantBaseline="central">
                {b.lines.length === 1 ? (
                  b.lines[0]
                ) : (
                  <>
                    <tspan x={b.x} dy="-0.55em">
                      {b.lines[0]}
                    </tspan>
                    <tspan x={b.x} dy="1.1em">
                      {b.lines[1]}
                    </tspan>
                  </>
                )}
              </text>
            </motion.g>
          )
        })}

        <motion.circle
          className="kne-pkt"
          r={6}
          initial={false}
          animate={{ cx: moving ? xs : xs[0], cy: moving ? ys : ys[0] }}
          transition={{ ...t.travel, duration: moving ? 0.6 + 0.45 * route.length : 0.3 }}
        />
      </svg>

      <ul className="kne-legend">
        <li className="kne-leg" data-on="true">
          <span className="kne-leg-dot" aria-hidden="true" />
          <span className="kne-leg-head">pakken</span>
          <span className="kne-leg-text">fra vært A til server B, gennem de ISP’er den møder</span>
        </li>
        {LEGEND.map((l) => (
          <motion.li
            key={l.head}
            className="kne-leg"
            data-on={step >= l.from}
            initial={false}
            animate={{ opacity: step >= l.from ? 1 : 0.18 }}
            transition={t.fade}
          >
            <span className="kne-leg-mark" aria-hidden="true" />
            <span className="kne-leg-head">{l.head}</span>
            <span className="kne-leg-text">{l.text}</span>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-internet-net-edge',
  title: 'En pakke gennem network of networks',
  steps: [
    {
      caption: 'Kanten: **end systems** (her vært A og server B) og de **access-ISP’er**, de er kunder hos.',
      hold: 2000,
    },
    {
      caption:
        'Pakken går over **access-nettet** til den første router, *edge router*. Det kan være DSL, kabel, FTTH, Ethernet, WiFi eller 4G/5G.',
      hold: 2600,
    },
    {
      caption:
        'Access-ISP’erne forbindes ikke hver med hver (O(N²)), men via **regionale ISP’er** og **tier-1 ISP’er**. Kunden betaler udbyderen; tier 1 betaler ingen.',
      hold: 3000,
    },
    {
      caption: 'Tier-1-ISP’erne **peerer** med hinanden, fx på en **IXP**. Pakken skifter net dér.',
      hold: 2400,
    },
    {
      caption: 'Ned gennem modtagerens regionale ISP og access-ISP til server B. Pakken har krydset seks ISP’ers net.',
      hold: 2600,
    },
    {
      caption:
        'Slutbilledet: **content providers** som Google har et privat net, der peerer direkte med lavere tier og **går udenom** tier 1.',
      hold: 3200,
    },
  ],
  Component: NetEdge,
}

export default viz
