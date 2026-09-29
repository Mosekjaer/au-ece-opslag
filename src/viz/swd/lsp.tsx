import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { t } from '../kit/motion'
import './lsp.css'

/* swd/kilder/uge-03_solid-lsp-isp-dip/SOLID - L.pdf
   s. 7: ComputerProgram bruger T; "IS-SUBSTITUTABLE-FOR" i stedet for "IS-A".
   s. 8: "Is a circle an ellipsis?".
   s. 9: klassediagrammet Ellipse ◁— Circle med GetMajorAxis(), GetMinorAxis(),
   SetMajorAxis(x), SetMinorAxis(x); postconditions `a==x && b == old.b` (Ellipse) og
   `a==x && b==x` (Circle), mærkatet "Weaker postcondition!" og Meyer-citatet.
   Illustrativt (ingen tal i materialet): a = 4, b = 2 for Ellipse, a = b = 2 for Circle,
   kaldet SetMajorAxis(6). a = storakse, b = lilleakse, som metodenavnene siger.
   Objektboksene (:ComputerProgram, :Ellipse, :Circle) er tegnet til figuren; sliden
   har kun klassediagrammet. Associationen i klassediagrammet står fast på Ellipse —
   substitutionen sker på objektniveau. */

const OPS = ['+ GetMajorAxis()', '+ GetMinorAxis()', '+ SetMajorAxis(x)', '+ SetMinorAxis(x)']

/* ---------------------------- Klassediagram ----------------------------- */

const CX = 196 // klassernes venstre kant
const CW = 164
const NAME_H = 28
const OP_H = 18
const CLS_H = NAME_H + 10 + OPS.length * OP_H

function ClassBox({ y, name, tone }: { y: number; name: string; tone: string }) {
  return (
    <g className="lsp-cls" data-tone={tone}>
      <rect x={CX} y={y} width={CW} height={CLS_H} />
      <line x1={CX} x2={CX + CW} y1={y + NAME_H} y2={y + NAME_H} />
      <text className="lsp-cname" x={CX + CW / 2} y={y + 19}>
        {name}
      </text>
      {OPS.map((o, i) => (
        <text key={o} className="lsp-op" x={CX + 8} y={y + NAME_H + 18 + i * OP_H}>
          {o}
        </text>
      ))}
    </g>
  )
}

/** UML-note med foldet hjørne og stiplet anker til klassen. */
function Note({
  y,
  anchorY,
  post,
  show,
  tone,
}: {
  y: number
  anchorY: number
  post: string
  show: boolean
  tone: string
}) {
  const w = 174
  const h = 66
  return (
    <motion.g
      className="lsp-note"
      data-tone={tone}
      initial={false}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : -6 }}
      transition={show ? t.settle : t.fade}
    >
      <path d={`M0 ${y} H${w - 10} L${w} ${y + 10} V${y + h} H0 Z`} />
      <path className="lsp-note-fold" d={`M${w - 10} ${y} V${y + 10} H${w}`} />
      <line className="lsp-anchor" x1={w} y1={anchorY} x2={CX} y2={anchorY} />
      <text className="lsp-note-k" x={8} y={y + 17}>
        postcondition for
      </text>
      <text className="lsp-note-m" x={8} y={y + 35}>
        SetMajorAxis(x):
      </text>
      <text className="lsp-note-post" x={8} y={y + 55}>
        {post}
      </text>
    </motion.g>
  )
}

function ClassDiagram({ step }: { step: number }) {
  const ellY = 8
  const cirY = 176
  const ellTone = step === 1 || step === 2 ? 'focus' : 'idle'
  const cirTone = step === 3 ? 'focus' : step >= 4 ? 'neg' : 'idle'
  return (
    <svg className="lsp-svg lsp-cd" viewBox="0 0 360 300" role="img" aria-label="Klassediagram: ComputerProgram bruger Ellipse; Circle arver fra Ellipse.">
      {/* ComputerProgram → Ellipse: navigerbar association */}
      <g className="lsp-cls" data-tone="idle">
        <rect x={0} y={8} width={138} height={32} />
        <text className="lsp-cname" x={69} y={29}>
          ComputerProgram
        </text>
      </g>
      <line className="lsp-rel" x1={138} y1={24} x2={CX} y2={24} />
      <path className="lsp-open" d={`M${CX - 9} 19 L${CX} 24 L${CX - 9} 29`} />

      {/* Generalisering: fuld linje, lukket hul trekant ved Ellipse */}
      <line className="lsp-rel" x1={CX + CW / 2} y1={cirY} x2={CX + CW / 2} y2={ellY + CLS_H + 12} />
      <path className="lsp-tri" d={`M${CX + CW / 2} ${ellY + CLS_H} l7 12 h-14 Z`} />

      <ClassBox y={ellY} name="Ellipse" tone={ellTone} />
      <ClassBox y={cirY} name="Circle" tone={cirTone} />

      <Note y={56} anchorY={88} post="a==x && b == old.b" show={at(step, 1)} tone={step === 1 ? 'focus' : 'idle'} />
      <Note y={196} anchorY={228} post="a==x && b==x" show={at(step, 4)} tone="neg" />

      <motion.g
        className="lsp-weaker"
        initial={false}
        animate={{ opacity: at(step, 4) ? 1 : 0, scale: at(step, 4) ? 1 : 0.9 }}
        transition={at(step, 4) ? { ...t.place, delay: 0.5 } : t.fade}
      >
        <rect x={0} y={272} width={174} height={24} rx={3} />
        <text x={87} y={289}>
          <tspan fontStyle="italic">Weaker</tspan> postcondition!
        </text>
      </motion.g>
    </svg>
  )
}

/* ----------------------------- Under kørsel ----------------------------- */

const K = 15 // px pr. enhed på akserne
const SX = 120
const SY = 196

interface Obj {
  cls: 'Ellipse' | 'Circle'
  a: number
  b: number
}

/** Objektet under klienten: tegnet form med akserne a (vandret) og b (lodret). */
function Shape({ o, show, broken }: { o: Obj; show: boolean; broken: boolean }) {
  const rx = (o.a / 2) * K
  const ry = (o.b / 2) * K
  const tr = t.travel
  return (
    <motion.g
      className="lsp-obj"
      data-broken={broken || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 10 }}
      transition={show ? { ...t.place, delay: 0.2 } : t.fade}
      aria-hidden={!show || undefined}
    >
      <rect className="lsp-obj-box" x={10} y={96} width={220} height={186} />
      <line className="lsp-obj-sep" x1={10} x2={230} y1={124} y2={124} />
      <text className="lsp-obj-name" x={120} y={115}>
        :{o.cls}
      </text>
      <motion.ellipse className="lsp-geo" cx={SX} cy={SY} initial={false} animate={{ rx, ry }} transition={tr} />
      <motion.line className="lsp-ax lsp-ax-a" y1={SY} y2={SY} initial={false} animate={{ x1: SX - rx, x2: SX + rx }} transition={tr} />
      <motion.line className="lsp-ax lsp-ax-b" x1={SX} x2={SX} initial={false} animate={{ y1: SY - ry, y2: SY + ry }} transition={tr} />
      <motion.text className="lsp-ax-l" initial={false} animate={{ attrX: SX + rx + 5, attrY: SY + 4.5 }} transition={tr}>
        a
      </motion.text>
      <motion.text className="lsp-ax-l lsp-ax-lb" textAnchor="middle" initial={false} animate={{ attrX: SX, attrY: SY - ry - 5 }} transition={tr}>
        b
      </motion.text>
      <text className="lsp-vals" x={22} y={272}>
        <tspan>a = {o.a}</tspan>
        <tspan dx={10} className="lsp-val-b">
          b = {o.b}
        </tspan>
      </text>
      <text className="lsp-eks" x={220} y={272}>
        eksempeltal
      </text>
    </motion.g>
  )
}

function Runtime({ step }: { step: number }) {
  const circle = at(step, 3)
  const ell: Obj = { cls: 'Ellipse', a: at(step, 2) ? 6 : 4, b: 2 }
  const cir: Obj = { cls: 'Circle', a: at(step, 4) ? 6 : 2, b: at(step, 4) ? 6 : 2 }
  const calling = step === 2 || step === 4
  const msgOn = step === 2 || at(step, 4)
  return (
    <svg className="lsp-svg lsp-rt" viewBox="0 0 240 290" role="img" aria-label={`ComputerProgram kalder SetMajorAxis(6) på ${circle ? 'en Circle' : 'en Ellipse'}.`}>
      <g className="lsp-obj-client">
        <rect x={40} y={6} width={160} height={32} />
        <text x={120} y={27}>
          :ComputerProgram
        </text>
      </g>
      {/* Link mellem objekterne og beskeden ved siden af */}
      <line className="lsp-rel" x1={62} y1={38} x2={62} y2={96} />
      <g className="lsp-msg" data-hot={calling || undefined}>
        <motion.g initial={false} animate={{ opacity: msgOn ? 1 : 0 }} transition={t.fade}>
          <line x1={74} y1={48} x2={74} y2={84} />
          <path className="lsp-msg-head" d="M69 76 L74 86 L79 76 Z" />
          <text x={84} y={71}>
            SetMajorAxis(6)
          </text>
        </motion.g>
      </g>
      <Shape o={ell} show={!circle} broken={false} />
      <Shape o={cir} show={circle} broken={at(step, 4)} />
    </svg>
  )
}

/* ------------------------------- Tjekket -------------------------------- */

function Cell({ on, v, ok, now }: { on: boolean; v: number; ok: boolean; now: boolean }) {
  return (
    <td className="lsp-cell" data-ok={on ? (ok ? 'y' : 'n') : undefined}>
      <span className="lsp-cell-stack">
        <motion.span className="lsp-cell-empty" initial={false} animate={{ opacity: on ? 0 : 1 }} transition={t.fade} aria-hidden="true">
          –
        </motion.span>
        <motion.span
          initial={false}
          animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.7 }}
          transition={on ? { ...t.place, delay: now ? 0.8 : 0 } : t.fade}
          aria-hidden={!on || undefined}
        >
          {v} <span aria-label={ok ? 'holder' : 'brudt'}>{ok ? '✓' : '✗'}</span>
        </motion.span>
      </span>
    </td>
  )
}

function Checks({ step }: { step: number }) {
  const show = at(step, 1)
  return (
    <motion.div
      className="lsp-card"
      data-hot={step === 1 || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={show ? t.settle : t.fade}
    >
      <div className="lsp-card-k">Klientens forventning</div>
      <code className="lsp-card-sig">SetMajorAxis(x)</code>
      <code className="lsp-card-post">
        post: a==x
        <br />
        &amp;&amp; b == old.b
      </code>
      <table className="lsp-tab">
        <thead>
          <tr>
            <th />
            <th data-hot={step === 2 || undefined}>Ellipse</th>
            <th data-hot={step === 3 || step === 4 || undefined}>Circle</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <th>
              <code>a == x</code>
            </th>
            <Cell on={at(step, 2)} v={6} ok now={step === 2} />
            <Cell on={at(step, 4)} v={6} ok now={step === 4} />
          </tr>
          <tr>
            <th>
              <code>b == old.b</code>
            </th>
            <Cell on={at(step, 2)} v={2} ok now={step === 2} />
            <Cell on={at(step, 4)} v={6} ok={false} now={step === 4} />
          </tr>
        </tbody>
      </table>
      <div className="lsp-card-note">efter SetMajorAxis(6); old.b = 2</div>
    </motion.div>
  )
}

function Quote({ step }: { step: number }): ReactNode {
  const on = at(step, 5)
  return (
    <motion.div className="lsp-quote" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? { ...t.fade, delay: 0.2 } : t.fade}>
      <p>
        “A routine declaration of a derivative may only replace the original precondition with one <b>equal or weaker</b>, and the
        original postcondition with one <b>equal or stronger</b>” <span className="lsp-quote-by">Bertrand Meyer, Design By Contract</span>
      </p>
      <p className="lsp-verdict">
        <span>
          IS-A <b data-ok="y">✓</b>
        </span>
        <span className="lsp-dot">·</span>
        <span>
          IS-SUBSTITUTABLE-FOR <b data-ok="n">✗</b>
        </span>
      </p>
    </motion.div>
  )
}

function Lsp({ step }: { step: number }) {
  return (
    <div className="lsp">
      <div className="lsp-grid">
        <section className="lsp-col lsp-col-cd">
          <div className="vcaps">Klassediagram</div>
          <ClassDiagram step={step} />
        </section>
        <section className="lsp-col lsp-col-rt">
          <div className="vcaps">Under kørsel</div>
          <Runtime step={step} />
        </section>
        <section className="lsp-col lsp-col-ck">
          <Checks step={step} />
        </section>
      </div>
      <Quote step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'lsp',
  title: 'Circle kan ikke erstatte Ellipse',
  steps: [
    { caption: '`ComputerProgram` bruger en `Ellipse` og kender dens kontrakt.', hold: 2000 },
    { caption: '`SetMajorAxis(x)` lover: storaksen bliver `x`, lilleaksen er uændret.', hold: 2400 },
    { caption: 'På en `Ellipse` holder løftet: `a == 6`, `b` er stadig 2.', hold: 2600 },
    { caption: 'En `Circle` sættes ind, hvor klienten forventer en `Ellipse`. Klienten er den samme.', hold: 2400 },
    { caption: '`Circle` sætter også `b`. Klientens antagelse `b == old.b` er brudt.', hold: 3000 },
    { caption: 'En cirkel *er* en ellipse — men `Circle` kan ikke erstatte `Ellipse`.', hold: 2800 },
  ],
  Component: Lsp,
}

export default viz
