import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './domaenemodel-kogebog.css'

/* SmartFridge, use case "Tilføj vare" (I2ISE Eksamensopgave E2015, opg. 2, s. 1–3):
   hovedscenariet og skitsen (figur 1) er input; slutrammen er løsningsforslagets
   domænemodel. Trinene følger kogebogen (System Domain Analysis.pdf slide 14–29).
   Afvigelse: løsningen skriver typer på Vares attributter (navn : string …); de er
   udeladt her, som artiklen foreskriver. Læsepilene er placeret efter tegningens
   orientering; "◄ har en" læses "System har en …". */

/* ---------------------------- Input-teksten ---------------------------- */

type Seg = string | { n: string } | { v: string }
const UC: Seg[][] = [
  [{ n: 'Bruger' }, ' fører en ', { n: 'vare' }, ' hen til systemets ', { n: 'stregkode-scanner' }],
  [{ n: 'Systemet' }, ' ', { v: 'scanner' }, ' ', { n: 'varens' }, ' ', { n: 'stregkode' }],
  [{ n: 'Systemet' }, ' ', { v: 'sender' }, ' ', { n: 'varens' }, ' ', { n: 'stregkode' }, ' til ', { n: 'BCDB' }],
  [{ n: 'BCDB' }, ' ', { v: 'returnerer' }, ' ', { n: 'varens' }, ' ', { n: 'navn' }, ' til ', { n: 'Systemet' }],
  [{ n: 'Systemet' }, ' ', { v: 'viser' }, ' ', { n: 'varens' }, ' ', { n: 'navn' }],
  [{ n: 'Bruger' }, ' ', { v: 'redigerer og godkender' }, ' ', { n: 'antallet' }, ' af ', { n: 'varer' }],
  [{ n: 'Systemet' }, ' ', { v: 'tilføjer' }, ' ', { n: 'varens' }, ' ', { n: 'navn' }, ' og ', { n: 'antal' }, ' til ', { n: 'indkøbslisten' }],
  [{ n: 'Systemet' }, ' ', { v: 'viser' }, ' en opdateret ', { n: 'indkøbsliste' }],
]
const SKETCH = ['Stregkodescanner', 'Touchskærm', 'Printer', 'WiFi', 'Computer']

const DECISIONS: [string, string][] = [
  ['Bruger/Kunden, BCDB', 'aktører: tændstiksmænd'],
  ['navn, stregkode, antal', 'simple værdier: attributter på Vare'],
  ['Systemet', 'systembegreb: System'],
  ['WiFi, Computer', 'intern hardware: skjult i System'],
]

/* ----------------------------- Diagrammet ----------------------------- */

type Box = [number, number, number, number]
type ClassId = 'scanner' | 'touch' | 'printer' | 'system' | 'indk' | 'vare'
const CLASS_NAME: Record<ClassId, string> = {
  scanner: 'Stregkode-scanner',
  touch: 'Touchskærm',
  printer: 'Printer',
  system: 'System',
  indk: 'Indkøbsliste',
  vare: 'Vare',
}
const ATTRS = ['navn', 'stregkode', 'antal']

interface Lbl {
  x: number
  y: number
  text: string
  anchor?: 'start' | 'middle' | 'end'
}
interface EdgeGeo {
  d: string
  labels: Lbl[]
  badge: [number, number]
  mult?: Lbl[]
}
interface Geo {
  vb: [number, number]
  classes: Record<ClassId, Box>
  kunde: [number, number]
  bcdb: [number, number]
  ghosts?: Record<'computer' | 'wifi', Box>
  edges: Record<string, EdgeGeo>
}

const WIDE: Geo = {
  vb: [700, 352],
  classes: {
    scanner: [220, 20, 130, 34],
    touch: [220, 148, 130, 34],
    printer: [220, 276, 130, 34],
    system: [460, 148, 90, 34],
    indk: [440, 290, 100, 34],
    vare: [612, 266, 86, 80],
  },
  kunde: [22, 132],
  bcdb: [505, 22],
  ghosts: { computer: [590, 146, 96, 26], wifi: [590, 180, 96, 26] },
  edges: {
    e1: { d: 'M22 118 V37 H220', labels: [{ x: 214, y: 29, text: 'scanner varens stregkode ►', anchor: 'end' }], badge: [120, 37] },
    e2: {
      d: 'M40 165 H220',
      labels: [
        { x: 214, y: 157, text: '◄ viser vare og indkøbsliste', anchor: 'end' },
        { x: 214, y: 181, text: 'rediger og godkender vare ►', anchor: 'end' },
      ],
      badge: [130, 165],
    },
    e3: {
      d: 'M505 148 V100',
      labels: [
        { x: 515, y: 118, text: 'sender varens stregkode/navn ▲', anchor: 'start' },
        { x: 515, y: 136, text: '▼ sender varens navn/fejlkode', anchor: 'start' },
      ],
      badge: [505, 124],
    },
    e4: {
      d: 'M505 182 V290',
      labels: [{ x: 515, y: 234, text: 'tilføjer vare og antal til ▼', anchor: 'start' }],
      badge: [505, 236],
      mult: [
        { x: 497, y: 197, text: '1', anchor: 'end' },
        { x: 497, y: 285, text: '1', anchor: 'end' },
      ],
    },
    e5: { d: 'M460 156 H405 V37 H350', labels: [{ x: 377, y: 30, text: '◄ har en' }], badge: [405, 96] },
    e6: { d: 'M460 165 H350', labels: [{ x: 377, y: 158, text: '◄ har en' }], badge: [377, 165] },
    e7: { d: 'M460 174 H405 V293 H350', labels: [{ x: 377, y: 286, text: '◄ har en' }], badge: [405, 234] },
    e8: {
      d: 'M540 307 H612',
      labels: [{ x: 562, y: 283, text: 'indeholder ►' }],
      badge: [576, 307],
      mult: [
        { x: 545, y: 324, text: '1', anchor: 'start' },
        { x: 607, y: 326, text: '*', anchor: 'end' },
      ],
    },
    e9: { d: 'M22 214 V293 H220', labels: [], badge: [120, 293] },
  },
}

const NARROW: Geo = {
  vb: [320, 388],
  classes: {
    scanner: [70, 18, 120, 30],
    touch: [70, 125, 120, 30],
    printer: [70, 232, 120, 30],
    system: [225, 125, 90, 30],
    indk: [215, 232, 100, 30],
    vare: [215, 300, 100, 80],
  },
  kunde: [22, 118],
  bcdb: [270, 14],
  edges: {
    e1: { d: 'M22 104 V33 H70', labels: [], badge: [22, 70] },
    e2: { d: 'M40 140 H70', labels: [], badge: [56, 140] },
    e3: { d: 'M270 125 V94', labels: [], badge: [270, 110] },
    e4: {
      d: 'M270 155 V232',
      labels: [],
      badge: [270, 192],
      mult: [
        { x: 262, y: 169, text: '1', anchor: 'end' },
        { x: 262, y: 227, text: '1', anchor: 'end' },
      ],
    },
    e5: { d: 'M225 133 H207 V33 H190', labels: [], badge: [207, 78] },
    e6: { d: 'M225 140 H190', labels: [], badge: [207, 140] },
    e7: { d: 'M225 147 H207 V247 H190', labels: [], badge: [207, 202] },
    e8: {
      d: 'M265 262 V300',
      labels: [],
      badge: [265, 281],
      mult: [
        { x: 277, y: 274, text: '1', anchor: 'start' },
        { x: 277, y: 298, text: '*', anchor: 'start' },
      ],
    },
    e9: { d: 'M22 196 V247 H70', labels: [], badge: [22, 224] },
  },
}

/* Hvornår hver association tegnes (kogebogens skridt), og dens nummer i listen. */
const EDGE_STEP: Record<string, number> = { e1: 3, e2: 3, e3: 3, e4: 3, e5: 4, e6: 4, e7: 4, e8: 4, e9: 4 }
const EDGE_ORDER = ['e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8', 'e9']

/* Associationerne som tekst (smal skærm), læst fra venstre mod højre. */
const EDGE_TEXT: Record<string, { a: string; b: string; labels: string[] }> = {
  e1: { a: 'Kunden', b: 'Stregkode-scanner', labels: ['scanner varens stregkode ►'] },
  e2: { a: 'Kunden', b: 'Touchskærm', labels: ['◄ viser vare og indkøbsliste', 'rediger og godkender vare ►'] },
  e3: { a: 'System', b: 'BCDB', labels: ['sender varens stregkode/navn ►', '◄ sender varens navn/fejlkode'] },
  e4: { a: 'System', b: 'Indkøbsliste', labels: ['tilføjer vare og antal til ►'] },
  e5: { a: 'Stregkode-scanner', b: 'System', labels: ['◄ har en'] },
  e6: { a: 'Touchskærm', b: 'System', labels: ['◄ har en'] },
  e7: { a: 'Printer', b: 'System', labels: ['◄ har en'] },
  e8: { a: 'Indkøbsliste', b: 'Vare', labels: ['indeholder ►'] },
  e9: { a: 'Kunden', b: 'Printer', labels: ['(uden tekst i løsningen)'] },
}

function Stick({ cx, cy, name, show }: { cx: number; cy: number; name: string; show: boolean }) {
  return (
    <motion.g className="dmk-actor" initial={false} animate={{ opacity: show ? 1 : 0 }} transition={t.fade}>
      <circle cx={cx} cy={cy} r={7.5} />
      <path d={`M${cx} ${cy + 7.5} V${cy + 34} M${cx - 13} ${cy + 17} H${cx + 13} M${cx} ${cy + 34} L${cx - 10} ${cy + 54} M${cx} ${cy + 34} L${cx + 10} ${cy + 54}`} />
      <text x={cx} y={cy + 70}>
        {name}
      </text>
    </motion.g>
  )
}

function Diagram({ g, step, className, badges }: { g: Geo; step: number; className: string; badges?: boolean }) {
  const showClasses = step >= 1
  return (
    <svg className={`dmk-svg ${className}`} viewBox={`0 0 ${g.vb[0]} ${g.vb[1]}`} aria-hidden="true">
      {/* Associationer bag klasserne */}
      {EDGE_ORDER.map((id, i) => {
        const e = g.edges[id]
        const on = step >= EDGE_STEP[id]
        const hot = step === EDGE_STEP[id]
        return (
          <motion.g
            key={id}
            className="dmk-edge"
            data-hot={hot || undefined}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? { ...t.fade, delay: hot ? 0.1 + (i % 5) * 0.12 : 0 } : t.fade}
          >
            <path className="dmk-line" d={e.d} />
            {e.labels.map((l, j) => (
              <text key={j} className="dmk-label" x={l.x} y={l.y} textAnchor={l.anchor ?? 'middle'}>
                {l.text}
              </text>
            ))}
            {badges && (
              <g className="dmk-badge">
                <circle cx={e.badge[0]} cy={e.badge[1]} r={8} />
                <text x={e.badge[0]} y={e.badge[1]}>
                  {i + 1}
                </text>
              </g>
            )}
          </motion.g>
        )
      })}

      {/* Multipliciteter (skridt 3) */}
      {EDGE_ORDER.flatMap((id) =>
        (g.edges[id].mult ?? []).map((m, j) => (
          <motion.text
            key={`${id}-m${j}`}
            className="dmk-mult"
            x={m.x}
            y={m.y}
            textAnchor={m.anchor ?? 'middle'}
            initial={false}
            animate={{ opacity: step >= 5 ? 1 : 0, scale: step >= 5 ? 1 : 0.6 }}
            transition={step >= 5 ? stagger(j, 0.15, 0.1) : t.fade}
          >
            {m.text}
          </motion.text>
        )),
      )}

      <Stick cx={g.kunde[0]} cy={g.kunde[1]} name="Kunden" show={showClasses} />
      <Stick cx={g.bcdb[0]} cy={g.bcdb[1]} name="BCDB" show={showClasses} />

      {(Object.keys(g.classes) as ClassId[]).map((id, i) => {
        const [x, y, w, h] = g.classes[id]
        const isVare = id === 'vare'
        const hot = step === 1 || (isVare && step === 2)
        return (
          <motion.g
            key={id}
            className="dmk-class"
            data-hot={hot || undefined}
            initial={false}
            animate={{ opacity: showClasses ? 1 : 0 }}
            transition={showClasses ? stagger(i, 0.1, 0.08) : t.fade}
          >
            <rect x={x} y={y} width={w} height={h} />
            <text className="dmk-cname" x={x + w / 2} y={isVare ? y + 14 : y + h / 2}>
              {CLASS_NAME[id]}
            </text>
            {isVare && (
              <>
                <path className="dmk-sep" d={`M${x} ${y + 28} H${x + w}`} />
                {ATTRS.map((a, j) => (
                  <motion.text
                    key={a}
                    className="dmk-attr"
                    x={x + 8}
                    y={y + 44 + j * 15}
                    initial={false}
                    animate={{ opacity: step >= 2 ? 1 : 0 }}
                    transition={step >= 2 ? stagger(j, 0.2, 0.12) : t.fade}
                  >
                    {a}
                  </motion.text>
                ))}
              </>
            )}
          </motion.g>
        )
      })}

      {g.ghosts &&
        (['computer', 'wifi'] as const).map((id) => {
          const [x, y, w, h] = g.ghosts![id]
          const shown = step === 1
          return (
            <motion.g key={id} className="dmk-ghost" initial={false} animate={{ opacity: shown ? 1 : step === 2 ? 0.45 : 0 }} transition={t.recede}>
              <rect x={x} y={y} width={w} height={h} />
              <text x={x + w / 2} y={y + h / 2} data-struck={step >= 2 || undefined}>
                {id === 'computer' ? 'Computer' : 'WiFi'}
              </text>
            </motion.g>
          )
        })}
    </svg>
  )
}

/* ------------------------------- Figuren ------------------------------- */

function Domaenemodel({ step }: { step: number }) {
  const nouns = step >= 1
  const verbs = step >= 3
  return (
    <div className="dmk">
      <div className="dmk-top">
        <section className="dmk-uc">
          <header className="dmk-uc-head">
            <span className="vcaps">UC Tilføj vare · hovedscenarie</span>
            <span className="dmk-keys">
              <span className="dmk-key is-n" data-on={step === 1 || undefined}>
                navneord
              </span>
              <span className="dmk-key is-v" data-on={step === 3 || undefined}>
                udsagnsord
              </span>
            </span>
          </header>
          <ol>
            {UC.map((line, i) => (
              <li key={i}>
                {line.map((s, j) =>
                  typeof s === 'string' ? (
                    <span key={j}>{s}</span>
                  ) : 'n' in s ? (
                    <mark key={j} className="dmk-n" data-on={nouns || undefined}>
                      {s.n}
                    </mark>
                  ) : (
                    <mark key={j} className="dmk-v" data-on={verbs || undefined}>
                      {s.v}
                    </mark>
                  ),
                )}
              </li>
            ))}
          </ol>
          <p className="dmk-sketch">
            <span className="dmk-sketch-lbl">Skitse (figur 1):</span>{' '}
            {SKETCH.map((s, i) => (
              <span key={s}>
                <mark className="dmk-n" data-on={nouns || undefined} data-struck={(step >= 2 && (s === 'WiFi' || s === 'Computer')) || undefined}>
                  {s}
                </mark>
                {i < SKETCH.length - 1 ? ' · ' : ''}
              </span>
            ))}
          </p>
        </section>

        <motion.section
          className="dmk-dec"
          initial={false}
          animate={{ opacity: step >= 2 ? 1 : 0, y: step >= 2 ? 0 : 6 }}
          transition={step >= 2 ? t.settle : t.fade}
          aria-hidden={step < 2 || undefined}
        >
          <span className="vcaps">Skridt 1 · finpudsning af navneordene</span>
          <ul>
            {DECISIONS.map(([w, d], i) => (
              <motion.li
                key={w}
                initial={false}
                animate={{ opacity: step >= 2 ? 1 : 0 }}
                transition={step >= 2 ? stagger(i, 0.15, 0.1) : t.fade}
              >
                <span className="dmk-dec-w">{w}</span>
                <span className="dmk-dec-d">→ {d}</span>
              </motion.li>
            ))}
          </ul>
        </motion.section>
      </div>

      <section className="dmk-model">
        <span className="dmk-frame">class Domænemodel · SmartFridge</span>
        <Diagram g={WIDE} step={step} className="dmk-wide" />
        <Diagram g={NARROW} step={step} className="dmk-narrow" badges />
        <ol className="dmk-legend">
          {EDGE_ORDER.map((id, i) => {
            const on = step >= EDGE_STEP[id]
            const e = EDGE_TEXT[id]
            return (
              <motion.li
                key={id}
                data-hot={step === EDGE_STEP[id] || undefined}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={t.fade}
                aria-hidden={!on || undefined}
              >
                <span className="dmk-legend-n">{i + 1}</span>
                <span className="dmk-legend-body">
                  <span className="dmk-legend-ends">
                    {e.a} — {e.b}
                  </span>
                  {e.labels.map((l) => (
                    <span key={l} className="dmk-legend-lbl">
                      {l}
                    </span>
                  ))}
                </span>
              </motion.li>
            )
          })}
        </ol>
      </section>

      <motion.div
        className="dmk-check"
        initial={false}
        animate={{ opacity: step >= 6 ? 1 : 0 }}
        transition={t.fade}
        aria-hidden={step < 6 || undefined}
      >
        {['ingen metoder', 'ingen pile i enderne', 'attributter uden typer', 'aktører som tændstiksmænd'].map((c, i) => (
          <motion.span key={c} initial={false} animate={{ opacity: step >= 6 ? 1 : 0 }} transition={step >= 6 ? stagger(i, 0.1, 0.1) : t.fade}>
            <Tag tone="idle">{c}</Tag>
          </motion.span>
        ))}
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'domaenemodel-kogebog',
  title: 'SmartFridges domænemodel bygges fra use casen Tilføj vare',
  steps: [
    {
      caption: 'Input: hovedscenariet i use casen *Tilføj vare* og skitsen af køleskabet (E2015, opgave 2). Diagrammet er endnu tomt.',
      hold: 2400,
    },
    {
      caption: '**Skridt 1.1**: navneordene markeres og bliver kandidater til begreber. Hellere for mange end for få på dette tidspunkt.',
      hold: 2600,
    },
    {
      caption:
        '**Finpudsning**: navn, stregkode og antal er simple værdier og bliver attributter på `Vare`. Computer og WiFi er intern hardware og skjules i `System`. Aktørerne tegnes som tændstiksmænd.',
      hold: 3400,
    },
    {
      caption: '**Skridt 2.1**: udsagnsordene, der forbinder begreberne, bliver associationer med relationstekst og læsepil.',
      hold: 2800,
    },
    {
      caption:
        '**Skridt 2.2 og systembegrebet**: løse begreber hænges op. `System` har en scanner, en touchskærm og en printer, og `Indkøbsliste` indeholder varer.',
      hold: 3000,
    },
    {
      caption: '**Skridt 3**: multipliciteter set fra ét køleskab. Én indkøbsliste med vilkårligt mange varer; resten er 1-til-1 og står uden tal.',
      hold: 2600,
    },
    {
      caption:
        'Domænemodellen: begreber fra virkeligheden, ikke softwareklasser. Løsningsforslaget skriver typer på attributterne (`navn : string`); artiklen siger uden typer, og det følger figuren.',
      hold: 3400,
    },
  ],
  Component: Domaenemodel,
}

export default viz
