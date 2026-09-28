import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './responsive-breakpoints.css'

/* CSS Grid.pdf s. 9–10 (= Responsive Web Design.pdf s. 28–29): samme fem elementer,
   tre layouts. Hver ramme er en tegnet viewport på 320, 500 og 800 px; på en bred plade
   er rammerne lige så brede som deres viewport i forhold til linealen (320/800 = 40 % …),
   så 120px-kolonnerne tegnes som 15 %. På en smal plade er alle rammer fuld bredde, og
   bredden står i rammens titellinje. Layoutet i rammen er rigtig grid-CSS, valgt af step. */

// Blød bindestreg bygges i koden, så formatteringen ikke fjerner den.
const SHY = String.fromCharCode(173)

const BOXES = [
  { id: 'header', label: 'Header', tone: 'light' },
  { id: 'sidebar', label: `Side${SHY}bar`, tone: 'dark' },
  { id: 'content', label: 'Content', tone: 'dark' },
  { id: 'sidebar2', label: `Side${SHY}bar 2`, tone: 'light' },
  { id: 'footer', label: 'Footer', tone: 'light' },
] as const

interface Bp {
  id: 'base' | 'm500' | 'm800'
  px: number
  from: number // bredde (andel af 800) før rammen vokser
  w: number // bredde som andel af 800
  on: number // trin hvor rammen tændes
  rules: string[]
  code: { text: string; indent: number; key?: boolean }[]
}

const BPS: Bp[] = [
  {
    id: 'base',
    px: 320,
    from: 0.4,
    w: 0.4,
    on: 0,
    rules: ['basis'],
    code: [
      { text: '.container {', indent: 0 },
      { text: 'display: grid;', indent: 1 },
      { text: 'grid-gap: 1em;', indent: 1 },
      { text: 'grid-template-areas:', indent: 1, key: true },
      { text: '"header"', indent: 2, key: true },
      { text: '"sidebar"', indent: 2, key: true },
      { text: '"content"', indent: 2, key: true },
      { text: '"sidebar2"', indent: 2, key: true },
      { text: '"footer";', indent: 2, key: true },
      { text: '}', indent: 0 },
    ],
  },
  {
    id: 'm500',
    px: 500,
    from: 0.4,
    w: 0.625,
    on: 2,
    rules: ['basis', '≥ 500'],
    code: [
      { text: '@media only screen and (min-width: 500px) {', indent: 0, key: true },
      { text: '.container {', indent: 1 },
      { text: 'grid-template-columns: 20% auto;', indent: 2, key: true },
      { text: 'grid-template-areas:', indent: 2, key: true },
      { text: '"header header"', indent: 3, key: true },
      { text: '"sidebar content"', indent: 3, key: true },
      { text: '"sidebar2 sidebar2"', indent: 3, key: true },
      { text: '"footer footer";', indent: 3, key: true },
      { text: '}', indent: 1 },
      { text: '}', indent: 0 },
    ],
  },
  {
    id: 'm800',
    px: 800,
    from: 0.625,
    w: 1,
    on: 3,
    rules: ['basis', '≥ 500', '≥ 800'],
    code: [
      { text: '@media only screen and (min-width: 800px) {', indent: 0, key: true },
      { text: '.container {', indent: 1 },
      { text: 'grid-gap: 20px;', indent: 2, key: true },
      { text: 'grid-template-columns: 120px auto 120px;', indent: 2, key: true },
      { text: 'grid-template-areas:', indent: 2, key: true },
      { text: '"header header header"', indent: 3, key: true },
      { text: '"sidebar content sidebar2"', indent: 3, key: true },
      { text: '"footer footer footer";', indent: 3, key: true },
      { text: '}', indent: 1 },
      { text: '}', indent: 0 },
    ],
  },
]

// Trinnet hvor hver regel er "den der sker nu".
const FOCUS: Record<Bp['id'], number> = { base: 1, m500: 2, m800: 3 }

function Frame({ bp, step }: { bp: Bp; step: number }) {
  const lit = at(step, bp.on)
  const now = step === FOCUS[bp.id] || (bp.id === 'base' && step === 0)
  return (
    <motion.div
      className="rb-frame"
      data-bp={bp.id}
      data-tone={!lit ? 'ghost' : now ? 'focus' : 'idle'}
      initial={false}
      animate={{ '--w': lit ? bp.w : bp.from } as never}
      transition={lit ? t.travel : t.fade}
    >
      <div className="rb-chrome">
        <span className="rb-px">{bp.px} px</span>
        <motion.span className="rb-applies" initial={false} animate={{ opacity: lit ? 1 : 0 }} transition={t.fade}>
          {bp.rules.map((r) => (
            <span key={r}>{r}</span>
          ))}
        </motion.span>
      </div>
      <motion.div
        className="rb-grid"
        initial={false}
        animate={{ opacity: lit ? 1 : 0 }}
        transition={lit ? { ...t.fade, delay: bp.on > 0 ? 0.45 : 0 } : t.fade}
      >
        {BOXES.map((b, i) => (
          <motion.div
            key={b.id}
            className="rb-box"
            data-shade={b.tone}
            style={{ gridArea: b.id }}
            initial={false}
            animate={lit ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
            transition={lit ? stagger(i, bp.on > 0 ? 0.5 : 0.05, 0.06) : t.fade}
          >
            <span className="rb-label">{b.label}</span>
            {b.id === 'content' && (
              <span className="rb-lines" aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
            )}
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  )
}

function Rule({ bp, step }: { bp: Bp; step: number }) {
  const lit = at(step, bp.on === 0 ? 1 : bp.on)
  const now = step === FOCUS[bp.id]
  // Area-strengene samles i én gruppe, så de kan flyde på række på en smal plade.
  const parts: ReactNode[] = []
  let strs: Bp['code'] = []
  const flush = (k: number) => {
    if (!strs.length) return
    parts.push(
      <span key={`s${k}`} className="rb-strs" style={{ paddingLeft: `${strs[0].indent}em` }}>
        {strs.map((l, i) => (
          <span key={i} className="rb-line rb-str" data-key={l.key || undefined}>
            {l.text}
          </span>
        ))}
      </span>,
    )
    strs = []
  }
  bp.code.forEach((l, i) => {
    if (l.text.startsWith('"')) {
      strs.push(l)
      return
    }
    flush(i)
    parts.push(
      <span key={i} className="rb-line" data-key={l.key || undefined} style={{ paddingLeft: `${l.indent}em` }}>
        {l.text}
      </span>,
    )
  })
  flush(bp.code.length)
  return (
    <code className="rb-rule" data-tone={!lit ? 'ghost' : now ? 'focus' : 'idle'}>
      {parts}
    </code>
  )
}

function Card({ tone, title, children }: { tone: string; title: ReactNode; children: ReactNode }) {
  return (
    <div className="rb-card" data-tone={tone}>
      <div className="rb-card-head">{title}</div>
      {children}
    </div>
  )
}

function Responsive({ step }: { step: number }) {
  const sm = at(step, 5)
  return (
    <div className="rb">
      <div className="rb-ruler" aria-hidden="true">
        <span className="rb-scale" />
        {[
          { px: 320, show: true },
          { px: 500, show: true },
          { px: 640, show: sm, label: 'sm' },
          { px: 800, show: true },
        ].map((m) => (
          <motion.span
            key={m.px}
            className="rb-tick"
            data-px={m.px}
            style={{ left: `${(m.px / 800) * 100}%` }}
            initial={false}
            animate={{ opacity: m.show ? 1 : 0 }}
            transition={t.fade}
          >
            <span>
              {m.px}
              {m.label && <b> {m.label}</b>}
            </span>
          </motion.span>
        ))}
      </div>

      {BPS.map((bp) => (
        <div key={bp.id} className="rb-row">
          <div className="rb-lane">
            <Frame bp={bp} step={step} />
          </div>
          <Rule bp={bp} step={step} />
        </div>
      ))}

      <div className="rb-bottom">
        <Card
          tone={step === 0 || step === 4 ? 'focus' : 'idle'}
          title={
            <>
              <span>HTML</span>
              <Tag show={at(step, 4)} tone="focus">
                uændret i alle tre
              </Tag>
            </>
          }
        >
          <code className="rb-html">
            <span data-key={step === 0 || undefined}>
              {'<meta name="viewport" content="width=device-width, initial-scale=1.0">'}
            </span>
            <span>{'<div class="container">'}</span>
            <span className="rb-in">
              {['header', 'sidebar', 'sidebar2', 'content', 'footer'].map((c) => (
                <span key={c} className="rb-tag">{`<div class="box ${c}">`}</span>
              ))}
            </span>
            <span>{'</div>'}</span>
          </code>
        </Card>

        <motion.div
          className="rb-tw"
          initial={false}
          animate={{ opacity: sm ? 1 : 0.35 }}
          transition={t.fade}
        >
          <Card
            tone={!sm ? 'ghost' : step === 5 ? 'focus' : 'idle'}
            title={<span>Tailwind: mobile first med præfiks</span>}
          >
            <code className="rb-html">
              <span data-key={sm || undefined}>{'class="text-center sm:text-left"'}</span>
            </code>
            <div className="rb-tw-demo">
              <div className="rb-mini" data-align="center">
                <span className="rb-mini-bar" />
                <span className="rb-mini-cap">
                  under 640px: <code>text-center</code>
                </span>
              </div>
              <div className="rb-mini" data-align="left">
                <span className="rb-mini-bar" />
                <span className="rb-mini-cap">
                  fra 640px: <code>sm:text-left</code>
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      <motion.p className="rb-goal" initial={false} animate={{ opacity: at(step, 6) ? 1 : 0 }} transition={t.settle}>
        Målet: læsbart fra 320 px og op, kun én version af hver HTML-fil, aldrig en vandret scrollbar.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'responsive-breakpoints',
  title: 'Samme HTML, tre layouts',
  steps: [
    {
      caption:
        'Viewport-meta-tagget gør viewporten lige så bred som enheden, så mobilen ikke bare zoomer siden ud. Her en smal skærm på 320 px.',
      hold: 2200,
    },
    {
      caption:
        'Basis-CSS’en er skrevet til den smalle skærm: `grid-template-areas` med én streng pr. række og én kolonne — fem blokke under hinanden.',
      hold: 2400,
    },
    {
      caption:
        'Fra 500px slår `@media … (min-width: 500px)` til: to kolonner, `20% auto`. Header, Sidebar 2 og Footer spænder over begge.',
      hold: 2800,
    },
    {
      caption:
        'Fra 800px gælder begge media queries, og den sidste overskriver: tre kolonner `120px auto 120px` og `grid-gap: 20px`.',
      hold: 2800,
    },
    {
      caption: 'HTML’en er den samme i alle tre layouts. Kun CSS’en flytter elementerne rundt.',
      hold: 2200,
    },
    {
      caption:
        'Tailwind gør det samme med præfikser: klasser uden præfiks gælder altid, `sm:` gælder fra 40rem (640px) og op.',
      hold: 2600,
    },
    {
      caption:
        'Mobile first: start med én kolonne og tilføj layout opad med `min-width`. Siden skal kunne læses fra 320 px uden vandret scrollbar.',
      hold: 3000,
    },
  ],
  Component: Responsive,
}

export default viz
