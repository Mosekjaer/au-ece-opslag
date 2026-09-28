import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './grid-layout.css'

/* Layouts.pdf s. 8–20 og bog listing 5.2–5.11 (MauiCalc): 4 × 5 Grid med
   spacing 2, knapperne i række 1–4, LCD-label'en med ColumnSpan="4",
   RowDefinitions="4*,…" og til sidst faste 100 DIU med HorizontalOptions="Center".
   FED Controls.pdf s. 14 (DIU), bog listing 3.14 (Auto). */

/* ---- Geometri --------------------------------------------------------
   Rammen er 100 × 125 enheder (4:5). Positioner regnes om til procent. */

const W = 100
const H = 125
const G = 1.6 // spacing 2 — tegnet som en smal fuge
const U = 18 // "100 DIU" i trin 5

type Track = number | `${number}*`

function lay(defs: Track[], total: number, gap: number, center: boolean) {
  const fixed = defs.reduce<number>((s, d) => (typeof d === 'number' ? s + d : s), 0)
  const shares = defs.reduce<number>((s, d) => (typeof d === 'number' ? s : s + Number(d.slice(0, -1))), 0)
  const free = total - fixed - gap * (defs.length - 1)
  const sizes = defs.map((d) => (typeof d === 'number' ? d : shares ? (free * Number(d.slice(0, -1))) / shares : 0))
  const used = sizes.reduce((a, b) => a + b, 0) + gap * (defs.length - 1)
  let pos = center ? (total - used) / 2 : 0
  return sizes.map((s) => {
    const r = { start: pos, size: s }
    pos += s + gap
    return r
  })
}

function geometry(step: number) {
  const cols: Track[] = step >= 5 ? [U, U, U, U] : ['1*', '1*', '1*', '1*']
  const rows: Track[] = step >= 5 ? ['1*', U, U, U, U] : step === 4 ? ['4*', '1*', '1*', '1*', '1*'] : ['1*', '1*', '1*', '1*', '1*']
  return { cols: lay(cols, W, G, step >= 5), rows: lay(rows, H, G, false) }
}

const pctX = (v: number) => `${(v / W) * 100}%`
const pctY = (v: number) => `${(v / H) * 100}%`

const KEYS = [
  ['7', '8', '9', '+'],
  ['4', '5', '6', '-'],
  ['1', '2', '3', 'X'],
  ['.', '0', '=', '/'],
]

/* ---- Kodekort -------------------------------------------------------- */

/** Brudpunkter i kode: efter . ( = , og bløde bindestreger i lange camelCase-navne. */
const SHY = String.fromCharCode(0xad)
const ZWSP = String.fromCharCode(0x200b)

function brk(s: string) {
  return s
    .replace(/[A-Za-z]{15,}/g, (w) => w.replace(/([a-z])(?=[A-Z])/g, `$1${SHY}`))
    .replace(/([.(=,])(?=\S)/g, `$1${ZWSP}`)
}

interface Ln {
  /** Varianter pr. trin: [fra trin, tekst]; sidste der er nået, vises. */
  v: [number, ReactNode][]
  i?: number
  /** Synlig fra trin. */
  show?: number
  /** Markeret i disse trin. */
  hl?: number[]
}

/** Fremhævet segment. Spor-lister (`"*,100,…"`) brydes ikke indeni. */
const key = (s: string) => <span className="gl-key">{s.startsWith('"') ? s : brk(s)}</span>

const CODE: Ln[] = [
  {
    v: [
      [0, <>{'<Grid '}{brk('ColumnDefinitions=')}"*,*,*,*"</>],
      [5, <>{'<Grid '}{brk('ColumnDefinitions=')}{key('"100,100,100,100"')}</>],
    ],
    hl: [0, 5],
  },
  {
    v: [
      [0, <>{brk('RowDefinitions=')}"*,*,*,*,*"</>],
      [4, <>{brk('RowDefinitions=')}{key('"4*,*,*,*,*"')}</>],
      [5, <>{brk('RowDefinitions=')}{key('"*,100,100,100,100"')}</>],
    ],
    i: 6,
    hl: [0, 4, 5],
  },
  {
    v: [
      [0, <>RowSpacing="2" ColumnSpacing="2"<span className="gl-close">{'>'}</span></>],
      [5, <>RowSpacing="2" ColumnSpacing="2"<span className="gl-close" data-off>{'>'}</span></>],
    ],
    i: 6,
  },
  { v: [[5, <>{key('HorizontalOptions="Center"')}{'>'}</>]], i: 6, show: 5, hl: [5] },
  { v: [[3, <>{'<Label '}{brk('Grid.Row="0" Grid.Column="0"')}</>]], i: 2, show: 3, hl: [3] },
  { v: [[3, key('Grid.ColumnSpan="4"')]], i: 9, show: 3, hl: [3] },
  { v: [[3, brk('HorizontalTextAlignment="End"')]], i: 9, show: 3, hl: [3] },
  { v: [[3, <>x:Name="LCD" … /{'>'}</>]], i: 9, show: 3, hl: [3] },
  { v: [[1, <>{'<Button '}{key('Grid.Row="1" Grid.Column="0"')}</>]], i: 2, show: 1, hl: [1] },
  { v: [[1, brk('Text="7" Clicked="Button_Clicked"/>')]], i: 10, show: 1, hl: [1] },
  { v: [[2, '<!-- 15 knapper mere i række 1–4 -->']], i: 2, show: 2, hl: [2] },
  { v: [[0, '</Grid>']] },
]

function CodeCard({ step }: { step: number }) {
  return (
    <div className="gl-card">
      <div className="gl-card-name mono">MainPage.xaml</div>
      <div className="gl-code">
        {CODE.map((l, n) => {
          const vis = step >= (l.show ?? 0)
          const on = !!l.hl?.includes(step) && !(step === 0 && n > 1)
          const cur = l.v.reduce((acc, [from], idx) => (step >= from ? idx : acc), 0)
          return (
            <motion.div
              key={n}
              className="gl-ln"
              style={{ '--i': l.i ?? 0 } as CSSProperties}
              initial={false}
              animate={{ opacity: vis ? 1 : 0 }}
              transition={vis ? t.settle : t.fade}
            >
              <motion.span className="gl-hl" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade} />
              {l.v.length > 1 ? (
                <Swap show={cur} className="gl-swap" items={l.v.map(([, txt], j) => <span key={j} className="gl-t">{txt}</span>)} />
              ) : (
                <span className="gl-t">{l.v[0][1]}</span>
              )}
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

/* ---- Rammen ---------------------------------------------------------- */

function Frame({ step }: { step: number }) {
  const { cols, rows } = geometry(step)
  const box = (r: number, c: number, span = 1) => ({
    left: pctX(cols[c].start),
    top: pctY(rows[r].start),
    width: pctX(cols[c + span - 1].start + cols[c + span - 1].size - cols[c].start),
    height: pctY(rows[r].size),
  })
  const gridLeft = cols[0].start
  const gridRight = cols[3].start + cols[3].size
  const lcdOn = at(step, 3)

  return (
    <div className="gl-stage">
      <div className="gl-frame">
        {/* Grid'ets udstrækning: fylder rammen, indtil faste kolonner centreres. */}
        <motion.div
          className="gl-extent"
          data-on={step >= 5 || undefined}
          initial={false}
          animate={{ left: pctX(gridLeft), width: pctX(gridRight - gridLeft) }}
          transition={t.travel}
        />

        {/* Tomme celler. */}
        {rows.map((_, r) =>
          cols.map((__, c) => (
            <motion.div key={`s${r}${c}`} className="gl-slot" initial={false} animate={box(r, c)} transition={t.travel} />
          )),
        )}

        {/* Række 0 holdes fri til skærmen. */}
        <motion.div
          className="gl-hatch"
          initial={false}
          animate={{ ...box(0, 0, 4), opacity: step === 2 ? 1 : 0 }}
          transition={{ default: t.travel, opacity: t.fade }}
        />

        {/* LCD-label'en. */}
        <motion.div
          className="gl-lcd"
          data-on={step === 3 || undefined}
          initial={false}
          animate={{
            ...box(0, 0, 4),
            width: step === 3 ? [pctX(cols[0].size), box(0, 0, 4).width] : box(0, 0, 4).width,
            opacity: lcdOn ? 1 : 0,
          }}
          transition={{ default: t.travel, width: step === 3 ? { ...t.travel, delay: 0.3 } : t.travel, opacity: t.fade }}
        >
          <span className="gl-lcd-text">456789</span>
        </motion.div>

        {/* Knapperne. */}
        {KEYS.map((row, ri) =>
          row.map((label, c) => {
            const r = ri + 1
            const first = r === 1 && c === 0
            const show = first ? at(step, 1) : at(step, 2)
            const order = ri * 4 + c - 1
            return (
              <motion.div
                key={`b${r}${c}`}
                className="gl-btn"
                data-on={(first && step === 1) || undefined}
                initial={false}
                animate={{ ...box(r, c), opacity: show ? 1 : 0, scale: show ? 1 : 0.7 }}
                transition={{
                  default: t.travel,
                  opacity: show && !first && step === 2 ? stagger(order, 0.1, 0.06) : t.fade,
                  scale: show && !first && step === 2 ? stagger(order, 0.1, 0.06) : t.place,
                }}
              >
                {label}
              </motion.div>
            )
          }),
        )}

        {/* Indeks. */}
        {cols.map((c, i) => (
          <motion.span
            key={`ci${i}`}
            className="gl-idx gl-idx-c"
            data-on={(step === 1 && i === 0) || undefined}
            initial={false}
            animate={{ left: pctX(c.start), width: pctX(c.size) }}
            transition={t.travel}
          >
            {i}
          </motion.span>
        ))}
        {rows.map((r, i) => (
          <motion.span
            key={`ri${i}`}
            className="gl-idx gl-idx-r"
            data-on={(step === 1 && i === 1) || undefined}
            initial={false}
            animate={{ top: pctY(r.start), height: pctY(r.size) }}
            transition={t.travel}
          >
            {i}
          </motion.span>
        ))}
      </div>
    </div>
  )
}

const LEGEND: { at: number; code: string; text: ReactNode }[] = [
  { at: 0, code: '*', text: 'lige andel af resten' },
  { at: 4, code: '4*', text: 'forhold: 4 af 8 andele' },
  { at: 5, code: '100', text: 'fast størrelse i DIU (ca. 160 pr. tomme)' },
  {
    at: 6,
    code: 'Auto',
    text: (
      <>
        følger indholdet, fx <code>RowDefinitions="Auto, 50"</code> i MauiTodo
      </>
    ),
  },
]

function GridLayout({ step }: { step: number }) {
  return (
    <div className="gl">
      <div className="gl-main">
        <Frame step={step} />
        <CodeCard step={step} />
      </div>
      <ul className="gl-legend">
        {LEGEND.map((l) => {
          const on = at(step, l.at)
          return (
            <motion.li
              key={l.code}
              data-now={step === l.at || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
              transition={on ? t.settle : t.fade}
            >
              <code className="gl-legend-code">{l.code}</code>
              <span>{l.text}</span>
            </motion.li>
          )
        })}
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'grid-layout',
  title: 'MauiCalc bygget i et Grid',
  steps: [
    { caption: 'Fire kolonner og fem rækker, alle `*`: pladsen deles ligeligt, med 2 i spacing.', hold: 2200 },
    { caption: '`Grid.Row` og `Grid.Column` tæller fra 0: knappen “7” står i række 1, kolonne 0.', hold: 2200 },
    { caption: '16 knapper i række 1–4. Række 0 er holdt fri til skærmen.', hold: 2200 },
    { caption: '`Grid.ColumnSpan="4"` lader skærm-`Label`’en spænde over alle fire kolonner.', hold: 2600 },
    { caption: '`4*` er et forhold: skærmrækken får 4 af 8 andele — halvdelen af højden.', hold: 2600 },
    {
      caption: 'Et tal er en fast størrelse i DIU: knapperne bliver 100 × 100, `HorizontalOptions="Center"` centrerer Grid’et, og `*`-rækken tager resten.',
      hold: 3200,
    },
    { caption: 'Fire måder at angive en række eller kolonne på.', hold: 3000 },
  ],
  Component: GridLayout,
}

export default viz
