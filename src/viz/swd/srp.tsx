import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './srp.css'

/* SOLID - SO.pdf s. 4–5 (SRP: “A class should only have one reason to change”)
   og s. 6 (IModem og opdelingen i IModemConnection, ITCPConnection og
   IDataExchange med stiplede afhængighedspile). Markdown:
   swd/markdown/slides/SW4SWD-01_W02b_SOLID_SRP_OCP.md, afsnit 3.
   Afvigelser fra sliden: «interface» er tilføjet (alle fire er interfaces),
   IDataExchange er tegnet én gang med to indgående pile (sliden tegner den to
   gange), og Send står som Send(c: char) begge steder. Ændringsønsket “ny
   forbindelsestype: TCP” er illustrativt, afledt af at sliden viser ITCPConnection.
   Aspektnavnene (forbindelse, dataudveksling) er emnetekstens. */

const HEAD = 40
const PAD = 6
const ROW = 20

interface Box {
  x: number
  y: number
  w: number
}
interface Lay {
  vb: [number, number]
  mid: Box
  tcp: Box
  dx: Box
  /** Returtypen brydes ned på en fortsættelseslinje (smal variant). */
  wrap: boolean
  depConn: string
  depConnHead: [number, number, Dir]
  depTcp: string
  depTcpHead: [number, number, Dir]
  /** Ændringsønsket i trin 2: mærkets midte og pilen ind mod IModem. */
  req: { x: number; y: number; arrow: string; head: [number, number, Dir] }
  keep: { x: number; y: number }
  ghost?: Box & { arrow: string; head: [number, number, Dir] }
}
type Dir = 'up' | 'down' | 'left' | 'right'

const WIDE: Lay = {
  vb: [800, 268],
  mid: { x: 250, y: 20, w: 320 },
  tcp: { x: 250, y: 172, w: 320 },
  dx: { x: 636, y: 96, w: 164 },
  wrap: false,
  depConn: 'M570 66 H603 V128 H636',
  depConnHead: [636, 128, 'right'],
  depTcp: 'M570 218 H603 V156 H636',
  depTcpHead: [636, 156, 'right'],
  req: { x: 92, y: 86, arrow: 'M186 86 H248', head: [248, 86, 'right'] },
  keep: { x: 718, y: 80 },
  ghost: { x: 0, y: 40, w: 184, arrow: 'M196 106 H242', head: [242, 106, 'right'] },
}

const NARROW: Lay = {
  vb: [300, 384],
  mid: { x: 22, y: 0, w: 256 },
  tcp: { x: 22, y: 140, w: 256 },
  dx: { x: 70, y: 290, w: 160 },
  wrap: true,
  depConn: 'M278 56 H292 V336 H230',
  depConnHead: [230, 336, 'left'],
  depTcp: 'M150 252 V290',
  depTcpHead: [150, 290, 'down'],
  req: { x: 150, y: 188, arrow: 'M150 164 V134', head: [150, 134, 'up'] },
  keep: { x: 36, y: 312 },
}

function head([x, y, dir]: [number, number, Dir]) {
  const a = 8
  const b = 5
  switch (dir) {
    case 'right':
      return `M${x - a} ${y - b} L${x} ${y} L${x - a} ${y + b}`
    case 'left':
      return `M${x + a} ${y - b} L${x} ${y} L${x + a} ${y + b}`
    case 'down':
      return `M${x - b} ${y - a} L${x} ${y} L${x + b} ${y - a}`
    default:
      return `M${x - b} ${y + a} L${x} ${y} L${x + b} ${y + a}`
  }
}

const rowTop = (b: Box, i: number) => b.y + HEAD + PAD + i * ROW
const boxH = (rows: number) => HEAD + PAD * 2 + rows * ROW

const fade = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

/** Kassens ramme og navnefelt: «interface» over navnet, streg over operationerne. */
function Frame({ b, rows, name, className }: { b: Box; rows: number; name: string; className?: string }) {
  return (
    <g className={`swd-srp-box ${className ?? ''}`}>
      <rect x={b.x} y={b.y} width={b.w} height={boxH(rows)} />
      <text className="swd-srp-stereo" x={b.x + b.w / 2} y={b.y + 14}>
        «interface»
      </text>
      <text className="swd-srp-name" x={b.x + b.w / 2} y={b.y + 30}>
        {name}
      </text>
      <line x1={b.x} x2={b.x + b.w} y1={b.y + HEAD} y2={b.y + HEAD} />
    </g>
  )
}

function Op({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <text className="swd-srp-op" x={x} y={y + 14}>
      {children}
    </text>
  )
}

function Diagram({ L, step, className }: { L: Lay; step: number; className: string }) {
  const split = step >= 3
  const { mid, tcp, dx } = L
  const connRows = split ? (L.wrap ? 3 : 2) : 2
  const midRows = split ? connRows : 4
  const hangRow = split && L.wrap ? 2 : 1
  const aspect = step >= 1
  // Send/Recv rejser fra IModems række 2–3 til IDataExchanges række 0–1.
  const mdx = split ? dx.x - mid.x : 0
  const mdy = split ? rowTop(dx, 0) - rowTop(mid, 2) : 0

  return (
    <svg className={`swd-srp-svg ${className}`} viewBox={`-2 -2 ${L.vb[0] + 4} ${L.vb[1] + 4}`} data-aspect={aspect || undefined} aria-hidden="true">
      {/* Før: nedtonet IModem (kun bred variant, slutrammen). */}
      {L.ghost && (
        <motion.g className="swd-srp-ghost" {...fade(step >= 5, 0.2)}>
          <text className="swd-srp-before" x={L.ghost.x} y={L.ghost.y - 10}>
            før
          </text>
          <Frame b={L.ghost} rows={4} name="IModem" />
          {['+ Dial(number: string)', '+ Hangup()', '+ Send(c: char)', '+ Recv() : char'].map((s, i) => (
            <Op key={s} x={L.ghost!.x + 10} y={rowTop(L.ghost!, i)}>
              {s}
            </Op>
          ))}
          <path className="swd-srp-arrow" d={L.ghost.arrow} />
          <path className="swd-srp-arrowhead" d={head(L.ghost.head)} />
        </motion.g>
      )}

      {/* Afhængigheder: stiplet linje, åben pilespids. */}
      <motion.g className="swd-srp-dep" {...fade(split, 0.7)}>
        <path className="swd-srp-depline" d={L.depConn} />
        <path className="swd-srp-dephead" d={head(L.depConnHead)} />
      </motion.g>
      <motion.g className="swd-srp-dep" {...fade(step >= 4, 0.5)}>
        <path className="swd-srp-depline" d={L.depTcp} />
        <path className="swd-srp-dephead" d={head(L.depTcpHead)} />
      </motion.g>

      {/* IDataExchange: rammen kommer, rækkerne rejser ind i den. */}
      <motion.g {...fade(split, 0.55)} className="swd-srp-dx" data-keep={step >= 4 || undefined}>
        <Frame b={dx} rows={2} name="IDataExchange" />
      </motion.g>

      {/* IModem → IModemConnection */}
      <g className="swd-srp-box" data-hit={step === 2 || undefined}>
        <motion.rect
          x={mid.x}
          y={mid.y}
          width={mid.w}
          initial={false}
          animate={{ height: boxH(midRows) }}
          transition={{ ...t.travel, delay: split ? 0.35 : 0 }}
        />
        <text className="swd-srp-stereo" x={mid.x + mid.w / 2} y={mid.y + 14}>
          «interface»
        </text>
        <motion.text className="swd-srp-name" x={mid.x + mid.w / 2} y={mid.y + 30} {...fade(!split)}>
          IModem
        </motion.text>
        <motion.text className="swd-srp-name" x={mid.x + mid.w / 2} y={mid.y + 30} {...fade(split, 0.5)}>
          IModemConnection
        </motion.text>
        <line x1={mid.x} x2={mid.x + mid.w} y1={mid.y + HEAD} y2={mid.y + HEAD} />
      </g>
      <motion.rect
        className="swd-srp-band"
        data-a="conn"
        x={mid.x + 1}
        y={rowTop(mid, 0)}
        width={mid.w - 2}
        initial={false}
        animate={{ height: connRows * ROW, opacity: aspect ? 1 : 0 }}
        transition={{ ...t.travel, delay: split ? 0.35 : 0 }}
      />
      <motion.rect
        className="swd-srp-bar"
        data-a="conn"
        x={mid.x + 1}
        y={rowTop(mid, 0)}
        width={4}
        initial={false}
        animate={{ height: connRows * ROW, opacity: aspect ? 1 : 0 }}
        transition={{ ...t.travel, delay: split ? 0.35 : 0 }}
      />
      <Op x={mid.x + 10} y={rowTop(mid, 0)}>
        + Dial(number: string)
        {!L.wrap && (
          <motion.tspan className="swd-srp-ret" {...fade(split, 0.7)}>
            {' '}: IDataExchange
          </motion.tspan>
        )}
      </Op>
      {L.wrap && (
        <motion.g {...fade(split, 0.7)}>
          <Op x={mid.x + 10 + 7.2 * 2} y={rowTop(mid, 1)}>
            <tspan className="swd-srp-ret">: IDataExchange</tspan>
          </Op>
        </motion.g>
      )}
      <motion.g initial={false} animate={{ y: (hangRow - 1) * ROW }} transition={{ ...t.travel, delay: 0.35 }}>
        <Op x={mid.x + 10} y={rowTop(mid, 1)}>
          + Hangup()
        </Op>
      </motion.g>

      {/* Dataudvekslingen glider ud. */}
      <motion.g initial={false} animate={{ x: mdx, y: mdy }} transition={{ ...t.travel, delay: 0.1 }}>
        <motion.rect
          className="swd-srp-band"
          data-a="data"
          x={mid.x + 1}
          y={rowTop(mid, 2)}
          height={2 * ROW}
          initial={false}
          animate={{ width: (split ? dx.w : mid.w) - 2, opacity: aspect ? 1 : 0 }}
          transition={t.travel}
        />
        <motion.rect className="swd-srp-bar" data-a="data" x={mid.x + 1} y={rowTop(mid, 2)} width={4} height={2 * ROW} {...fade(aspect)} />
        <Op x={mid.x + 10} y={rowTop(mid, 2)}>
          + Send(c: char)
        </Op>
        <Op x={mid.x + 10} y={rowTop(mid, 3)}>
          + Recv() : char
        </Op>
      </motion.g>

      {/* Ændringen rammer hele IModem (trin 2). */}
      <motion.rect
        className="swd-srp-hit"
        x={mid.x - 3}
        y={mid.y - 3}
        width={mid.w + 6}
        height={boxH(4) + 6}
        rx={3}
        {...fade(step === 2, 0.45)}
      />

      {/* ITCPConnection */}
      <motion.g
        initial={false}
        animate={step >= 4 ? { opacity: 1, y: 0 } : { opacity: 0, y: 8 }}
        transition={step >= 4 ? { ...t.place, delay: 0.1 } : t.fade}
      >
        <Frame b={tcp} rows={L.wrap ? 3 : 2} name="ITCPConnection" />
        <rect className="swd-srp-band" data-a="conn" x={tcp.x + 1} y={rowTop(tcp, 0)} width={tcp.w - 2} height={(L.wrap ? 3 : 2) * ROW} />
        <rect className="swd-srp-bar" data-a="conn" x={tcp.x + 1} y={rowTop(tcp, 0)} width={4} height={(L.wrap ? 3 : 2) * ROW} />
        <Op x={tcp.x + 10} y={rowTop(tcp, 0)}>
          + Connect(server: string)
          {!L.wrap && <tspan className="swd-srp-ret"> : IDataExchange</tspan>}
        </Op>
        {L.wrap && (
          <Op x={tcp.x + 10 + 7.2 * 2} y={rowTop(tcp, 1)}>
            <tspan className="swd-srp-ret">: IDataExchange</tspan>
          </Op>
        )}
        <Op x={tcp.x + 10} y={rowTop(tcp, L.wrap ? 2 : 1)}>
          + Disconnect()
        </Op>
      </motion.g>

      {/* Ændringsønsket (illustrativt). */}
      <motion.g
        className="swd-srp-req"
        initial={false}
        animate={step === 2 ? { opacity: 1, x: 0 } : { opacity: 0, x: L.wrap ? 0 : -14 }}
        transition={step === 2 ? t.place : t.fade}
      >
        <rect x={L.req.x - 88} y={L.req.y - 24} width={176} height={46} rx={4} />
        <text className="swd-srp-req-t" x={L.req.x} y={L.req.y - 7}>
          ny forbindelsestype: TCP
        </text>
        <text className="swd-srp-req-n" x={L.req.x} y={L.req.y + 11}>
          illustrativt ændringsønske
        </text>
        <path className="swd-srp-reqline" d={L.req.arrow} />
        <path className="swd-srp-reqhead" d={head(L.req.head)} />
      </motion.g>

      {/* IDataExchange er uændret, da TCP kommer til. */}
      <motion.g className="swd-srp-keep" {...fade(step >= 4, 0.9)}>
        <rect x={L.keep.x - 30} y={L.keep.y - 10} width={60} height={20} rx={3} />
        <text x={L.keep.x} y={L.keep.y + 1}>
          uændret
        </text>
      </motion.g>
    </svg>
  )
}

function Srp({ step }: { step: number }) {
  return (
    <div className="swd-srp">
      <motion.ul className="swd-srp-legend" {...fade(step >= 1)} aria-hidden={step < 1 || undefined}>
        <li data-a="conn">forbindelse</li>
        <li data-a="data">dataudveksling</li>
      </motion.ul>
      <Diagram L={WIDE} step={step} className="swd-srp-wide" />
      <Diagram L={NARROW} step={step} className="swd-srp-narrow" />
      <motion.p className="swd-srp-def" {...fade(step >= 5, 0.3)}>
        “A class should only have one reason to change.”
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'srp',
  title: 'Ansvar trækkes ud af IModem',
  steps: [
    { caption: '`IModem` kan ringe op, lægge på, sende og modtage.', hold: 2000 },
    { caption: 'To aspekter i ét interface: **forbindelse** og **dataudveksling** — to grunde til at ændre sig.', hold: 2400 },
    { caption: 'En ændring af forbindelsen rammer et interface, der også ejer dataudvekslingen.', hold: 2600 },
    { caption: 'Dataudvekslingen får sit eget interface, `IDataExchange`. `Dial` returnerer den.', hold: 3000 },
    { caption: 'En ny forbindelsestype, `ITCPConnection`, genbruger dataudvekslingen uden at røre den.', hold: 2800 },
    { caption: 'Hvert interface har nu én grund til at ændre sig.', hold: 3000 },
  ],
  Component: Srp,
}

export default viz
