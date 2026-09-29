import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './factory-method.css'

/* GoF Factory Method, Gof Abstract Factory.pdf (W07.2), PDF s. 6 (klassediagrammet:
   Package med - _channels, + Package() og kursiv # CreateChannels(); Sport og News;
   <<Interface>> Channel realiseret af DR, TV2, Channel 5, BBC, Viasport, Eurosport)
   og s. 7 (koden: _channels = CreateChannels(); Sport → Viasport, Eurosport; News →
   BBC, DR, TV2, Channel5). Markdown: swd/markdown/slides/SW4SWD-01_W07.2_GoF_Factory_
   Abstract_Factory.md, afsnit 2. Kontrasten til Abstract Factory: samme fil s. 11–15
   og HFDP kap. 4 (arv mod komposition). Klassebokse bruger diagrammets navn
   “Channel 5”; objekterne i _channels bruger kodens klassenavn Channel5. */

/* ------------------------------ UML-hjælpere ------------------------------ */

type P2 = [number, number]
type Dir = 'up' | 'down' | 'left' | 'right'

/** Åben pilespids (association, afhængighed, kald) med spidsen i p. */
function arrow([x, y]: P2, dir: Dir, a = 8, b = 4.5) {
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

/** Lukket, hul trekant med spidsen i p (generalisering og realisering). */
function tri([x, y]: P2, a = 11, b = 7) {
  return `M${x} ${y} L${x + b} ${y + a} L${x - b} ${y + a} Z`
}

interface Mem {
  t: string
  it?: boolean
  hot?: boolean
}
interface Cls {
  x: number
  y: number
  w: number
  name: string
  stereo?: string
  abstract?: boolean
  comps?: Mem[][]
}
const LH = 17
const clsH = (c: Cls) => (c.stereo ? 40 : 26) + (c.comps ?? []).reduce((s, comp) => s + comp.length * LH + 8, 0)

function ClassBox({ c, tone = 'idle' }: { c: Cls; tone?: string }) {
  const h = clsH(c)
  const cx = c.x + c.w / 2
  let top = c.y + (c.stereo ? 40 : 26)
  return (
    <g className="sfm-cls" data-tone={tone}>
      <rect className="sfm-box" x={c.x} y={c.y} width={c.w} height={h} />
      {c.stereo && (
        <text className="sfm-stereo" x={cx} y={c.y + 12}>
          {c.stereo}
        </text>
      )}
      <text className="sfm-cname" x={cx} y={c.y + (c.stereo ? 28 : 13)} fontStyle={c.abstract ? 'italic' : undefined}>
        {c.name}
      </text>
      {(c.comps ?? []).map((comp, k) => {
        const y0 = top
        top += comp.length * LH + 8
        return (
          <g key={k}>
            <line className="sfm-div" x1={c.x} x2={c.x + c.w} y1={y0} y2={y0} />
            {comp.map((r, i) => (
              <g key={i} data-hot={r.hot || undefined}>
                <rect className="sfm-memhl" x={c.x + 2} y={y0 + 4 + i * LH} width={c.w - 4} height={LH} />
                <text className="sfm-mem" x={c.x + 7} y={y0 + 4 + i * LH + LH / 2} fontStyle={r.it ? 'italic' : undefined}>
                  {r.t}
                </text>
              </g>
            ))}
          </g>
        )
      })}
    </g>
  )
}

/* -------------------------------- Layout -------------------------------- */

type Ch = 'via' | 'euro' | 'bbc' | 'dr' | 'tv2' | 'c5'
const CH: { id: Ch; box: string; obj: string; pkg: 'sport' | 'news' }[] = [
  { id: 'via', box: 'Viasport', obj: 'Viasport', pkg: 'sport' },
  { id: 'euro', box: 'Eurosport', obj: 'Eurosport', pkg: 'sport' },
  { id: 'bbc', box: 'BBC', obj: 'BBC', pkg: 'news' },
  { id: 'dr', box: 'DR', obj: 'DR', pkg: 'news' },
  { id: 'tv2', box: 'TV2', obj: 'TV2', pkg: 'news' },
  { id: 'c5', box: 'Channel 5', obj: 'Channel5', pkg: 'news' },
]
const CHIP_CW = 6.9
const chipW = (s: string) => s.length * CHIP_CW + 14

interface Layout {
  vb: [number, number]
  note: { x: number; y: number; w: number }
  pkg: Cls
  sport: Cls
  news: Cls
  channel: Cls
  /** Generalisering: trekantens spids, bussens y og stubbenes x. */
  gen: { apex: P2; bus: number; xs: [number, number] }
  /** Kaldpile (Package → override). */
  call: { sport: string; sportEnd: P2; news: string; newsEnd: P2 }
  assoc: { d: string; end: P2; dir: Dir }
  /** Kanalklassernes gitter: to kolonner om en rygrad. */
  grid: { spine: number; lx: number; rx: number; w: number; rows: number[]; h: number }
  obj: { sport: [number, number, number]; news: [number, number, number]; h: number }
  groups?: { x: number; sport: [number, number]; news: [number, number] }
}

const WIDE: Layout = {
  vb: [840, 372],
  note: { x: 130, y: 4, w: 280 },
  pkg: { x: 130, y: 68, w: 280, name: 'Package', abstract: true, comps: [[{ t: '- _channels: List<Channel>' }], [{ t: '+ Package()' }, { t: '# CreateChannels(): List<Channel>', it: true }]] },
  sport: { x: 10, y: 210, w: 260, name: 'Sport', comps: [[{ t: '# CreateChannels(): List<Channel>' }]] },
  news: { x: 290, y: 210, w: 260, name: 'News', comps: [[{ t: '# CreateChannels(): List<Channel>' }]] },
  channel: { x: 610, y: 85, w: 220, name: 'Channel', stereo: '«interface»' },
  gen: { apex: [270, 161], bus: 188, xs: [140, 420] },
  call: { sport: 'M150 161 Q96 170 70 208', sportEnd: [70, 209], news: 'M390 161 Q444 170 470 208', newsEnd: [470, 209] },
  assoc: { d: 'M410 104 H610', end: [610, 104], dir: 'right' },
  grid: { spine: 720, lx: 610, rx: 734, w: 96, rows: [146, 192, 238], h: 28 },
  obj: { sport: [10, 292, 260], news: [290, 292, 260], h: 74 },
  groups: { x: 600, sport: [146, 174], news: [192, 266] },
}

const NARROW: Layout = {
  vb: [300, 600],
  note: { x: 10, y: 4, w: 280 },
  pkg: { ...WIDE.pkg, x: 10, y: 64, w: 280 },
  sport: { x: 6, y: 208, w: 140, name: 'Sport', comps: [[{ t: '# CreateChannels()' }, { t: '  : List<Channel>' }]] },
  news: { x: 152, y: 208, w: 140, name: 'News', comps: [[{ t: '# CreateChannels()' }, { t: '  : List<Channel>' }]] },
  channel: { x: 70, y: 432, w: 160, name: 'Channel', stereo: '«interface»' },
  gen: { apex: [150, 157], bus: 182, xs: [76, 222] },
  call: { sport: 'M36 157 Q14 178 26 206', sportEnd: [26, 207], news: 'M264 157 Q286 178 274 206', newsEnd: [274, 207] },
  assoc: { d: 'M290 100 H297 V452 H230', end: [230, 452], dir: 'left' },
  grid: { spine: 150, lx: 30, rx: 160, w: 110, rows: [492, 530, 568], h: 28 },
  obj: { sport: [6, 312, 140], news: [152, 312, 140], h: 96 },
}

/* ------------------------------- Delene ---------------------------------- */

function Note({ L, hot }: { L: Layout; hot: boolean }) {
  const { x, y, w } = L.note
  const h = 46
  return (
    <g className="sfm-note" data-hot={hot || undefined}>
      <path className="sfm-note-box" d={`M${x} ${y} H${x + w - 10} L${x + w} ${y + 10} V${y + h} H${x} Z`} />
      <path className="sfm-note-fold" d={`M${x + w - 10} ${y} V${y + 10} H${x + w}`} />
      <text className="sfm-code sfm-code-dim" x={x + 10} y={y + 15}>
        public Package()
      </text>
      <text className="sfm-code" x={x + 10} y={y + 33}>
        {'{ _channels = '}
        <tspan className="sfm-code-call">CreateChannels()</tspan>
        {'; }'}
      </text>
      <line className="sfm-anchor" x1={L.pkg.x + L.pkg.w / 2} x2={L.pkg.x + L.pkg.w / 2} y1={y + h} y2={L.pkg.y} />
    </g>
  )
}

/** Kaldpil fra Package til overriden. Tegnes ind, når kaldet sker. */
function Call({ d, end, on, hot, tone }: { d: string; end: P2; on: boolean; hot: boolean; tone: string }) {
  return (
    <motion.g className="sfm-call" data-tone={tone} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
      <motion.path
        key={hot ? 'hot' : 'rest'}
        className="sfm-call-line"
        d={d}
        initial={hot ? { pathLength: 0 } : false}
        animate={{ pathLength: 1 }}
        transition={{ ...t.travel, delay: 0.15 }}
      />
      <motion.path
        key={hot ? 'hot-h' : 'rest-h'}
        className="sfm-call-head"
        d={arrow(end, 'down')}
        initial={hot ? { opacity: 0 } : false}
        animate={{ opacity: 1 }}
        transition={{ ...t.fade, delay: hot ? 0.9 : 0 }}
      />
    </motion.g>
  )
}

function chipCenters(L: Layout, pkg: 'sport' | 'news') {
  const [ox, oy, ow] = L.obj[pkg]
  const ids = CH.filter((c) => c.pkg === pkg)
  const maxW = ow - 20
  const out: Record<string, P2> = {}
  let x = 0
  let row = 0
  for (const c of ids) {
    const w = chipW(c.obj)
    if (x > 0 && x + w > maxW) {
      x = 0
      row++
    }
    out[c.id] = [ox + 10 + x + w / 2, oy + 57 + row * 24]
    x += w + 6
  }
  return out
}

function chBox(L: Layout, i: number): [number, number, number, number] {
  const g = L.grid
  const row = Math.floor(i / 2)
  const x = i % 2 === 0 ? g.lx : g.rx
  return [x, g.rows[row], g.w, g.h]
}

function Diagram({ L, step, className }: { L: Layout; step: number; className: string }) {
  const last = step === 4
  const [ax, ay] = L.gen.apex
  const chanH = clsH(L.channel)
  const g = L.grid
  const sportTone = step === 1 || step === 2 || last ? 'focus' : 'idle'
  const newsTone = step >= 3 ? 'alt' : 'idle'
  const sportHot = step === 1
  const newsHot = step === 3
  const withHot = (c: Cls, hot: boolean): Cls => ({ ...c, comps: c.comps?.map((comp) => comp.map((m) => ({ ...m, hot }))) })

  const chTone = (pkg: 'sport' | 'news') => {
    if (pkg === 'sport') return step === 2 || last ? 'focus' : 'muted'
    return step >= 3 ? 'alt' : 'muted'
  }

  const centers = { ...chipCenters(L, 'sport'), ...chipCenters(L, 'news') }

  return (
    <svg className={`sfm-svg ${className}`} viewBox={`0 0 ${L.vb[0]} ${L.vb[1]}`} aria-hidden="true">
      <Note L={L} hot={step === 1 || step === 3} />

      {/* Association Package → Channel */}
      <path className="sfm-line" d={L.assoc.d} />
      <path className="sfm-head" d={arrow(L.assoc.end, L.assoc.dir)} />

      {/* Generalisering Sport, News → Package */}
      <path className="sfm-line" d={`M${ax} ${ay + 11} V${L.gen.bus} M${L.gen.xs[0]} ${L.gen.bus} H${L.gen.xs[1]} M${L.gen.xs[0]} ${L.gen.bus} V${L.sport.y} M${L.gen.xs[1]} ${L.gen.bus} V${L.news.y}`} />
      <path className="sfm-tri" d={tri([ax, ay])} />

      {/* Realisering: kanalerne → Channel */}
      <path className="sfm-line sfm-dash" d={`M${g.spine} ${L.channel.y + chanH + 11} V${g.rows[2] + g.h / 2}`} />
      {CH.map((c, i) => {
        const [x, y, w, h] = chBox(L, i)
        const cy = y + h / 2
        return <path key={c.id} className="sfm-line sfm-dash" d={i % 2 === 0 ? `M${x + w} ${cy} H${g.spine}` : `M${g.spine} ${cy} H${x}`} />
      })}
      <path className="sfm-tri" d={tri([g.spine, L.channel.y + chanH])} />

      <ClassBox c={L.pkg} />
      <ClassBox c={withHot(L.sport, sportHot)} tone={sportTone} />
      <ClassBox c={withHot(L.news, newsHot)} tone={newsTone} />
      <ClassBox c={L.channel} />

      {CH.map((c, i) => {
        const [x, y, w, h] = chBox(L, i)
        return (
          <g key={c.id} className="sfm-cls" data-tone={chTone(c.pkg)}>
            <rect className="sfm-box" x={x} y={y} width={w} height={h} />
            <text className="sfm-cname" x={x + w / 2} y={y + h / 2}>
              {c.box}
            </text>
          </g>
        )
      })}

      {L.groups && (
        <>
          <GroupMark x={L.groups.x} span={L.groups.sport} label="Sport" tone="focus" on={step === 2 || last} />
          <GroupMark x={L.groups.x} span={L.groups.news} label="News" tone="alt" on={step >= 3} />
        </>
      )}

      <Call d={L.call.sport} end={L.call.sportEnd} on={step === 1 || step === 2 || last} hot={sportHot} tone="focus" />
      <Call d={L.call.news} end={L.call.newsEnd} on={step >= 3} hot={newsHot} tone="alt" />

      {/* Objekterne, der bliver skabt */}
      <Obj L={L} pkg="sport" on={step >= 1} tone={step === 3 ? 'idle' : 'focus'} />
      <Obj L={L} pkg="news" on={step >= 3} tone="alt" />

      {CH.map((c, i) => {
        const has = c.pkg === 'sport' ? step >= 2 : step >= 3
        if (!has) return null
        const travel = (c.pkg === 'sport' && step === 2) || (c.pkg === 'news' && step === 3)
        const [x, y, w, h] = chBox(L, i)
        const [tx, ty] = centers[c.id]
        const k = CH.filter((d) => d.pkg === c.pkg).indexOf(c)
        const delay = (c.pkg === 'news' ? 1.05 : 0.15) + k * 0.12
        const tone = c.pkg === 'sport' ? (step === 3 ? 'muted' : 'focus') : 'alt'
        const cw = chipW(c.obj)
        return (
          <motion.g
            key={`${c.id}-${travel ? 'go' : 'rest'}`}
            className="sfm-chip"
            data-tone={tone}
            initial={travel ? { x: x + w / 2 - tx, y: y + h / 2 - ty, opacity: 0 } : false}
            animate={{ x: 0, y: 0, opacity: 1 }}
            transition={{ default: { ...t.travel, delay }, opacity: { ...t.fade, delay } }}
          >
            <rect x={tx - cw / 2} y={ty - 9} width={cw} height={18} rx={9} />
            <text x={tx} y={ty}>
              {c.obj}
            </text>
          </motion.g>
        )
      })}
    </svg>
  )
}

function GroupMark({ x, span, label, tone, on }: { x: number; span: [number, number]; label: string; tone: string; on: boolean }) {
  return (
    <motion.g className="sfm-group" data-tone={tone} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
      <path d={`M${x + 4} ${span[0]} H${x} V${span[1]} H${x + 4}`} />
      <text x={x - 5} y={(span[0] + span[1]) / 2}>
        {label}
      </text>
    </motion.g>
  )
}

function Obj({ L, pkg, on, tone }: { L: Layout; pkg: 'sport' | 'news'; on: boolean; tone: string }) {
  const [x, y, w] = L.obj[pkg]
  const name = pkg === 'sport' ? 'Sport' : 'News'
  return (
    <motion.g className="sfm-obj" data-tone={tone} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? { ...t.fade, delay: 0.05 } : t.fade}>
      <text className="sfm-obj-new" x={x} y={y - 8}>
        new {name}()
      </text>
      <rect className="sfm-box" x={x} y={y} width={w} height={L.obj.h} />
      <text className="sfm-obj-name" x={x + w / 2} y={y + 13}>
        : {name}
      </text>
      <line className="sfm-div" x1={x} x2={x + w} y1={y + 26} y2={y + 26} />
      <text className="sfm-mem" x={x + 7} y={y + 38}>
        _channels =
      </text>
    </motion.g>
  )
}

/* ------------------------------ Kontrasten ------------------------------ */

function Versus({ on }: { on: boolean }) {
  return (
    <motion.div className="sfm-vs" initial={false} animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }} transition={on ? t.settle : t.fade} aria-hidden={!on || undefined}>
      <div className="sfm-vs-col" data-me>
        <span className="sfm-vs-name">Factory Method</span>
        <span>
          <b>subklassen</b> beslutter (arv) · ét produkt
        </span>
      </div>
      <div className="sfm-vs-col">
        <span className="sfm-vs-name">Abstract Factory</span>
        <span>
          et <b>injiceret factory-objekt</b> beslutter (komposition) · en familie af produkter
        </span>
      </div>
    </motion.div>
  )
}

function FactoryMethod({ step }: { step: number }) {
  return (
    <div className="sfm">
      <Diagram L={WIDE} step={step} className="sfm-wide" />
      <Diagram L={NARROW} step={step} className="sfm-narrow" />
      <Versus on={step === 4} />
    </div>
  )
}

const viz: VizDef = {
  id: 'factory-method',
  title: 'Subklassen vælger kanalerne',
  steps: [
    { caption: '`Package` kender kun `Channel`. Hvilke kanaler der kommer, står ikke i `Package`.', hold: 2400 },
    { caption: '`new Sport()` kører `Package()`, som kalder `CreateChannels()`. Kaldet lander i overriden i `Sport`.', hold: 2600 },
    { caption: 'Overriden i `Sport` opretter `Viasport` og `Eurosport`. Listen lander i `_channels`.', hold: 2600 },
    {
      caption: 'Samme linje i `Package()` — nu lander kaldet i `News`, som opretter `BBC`, `DR`, `TV2` og `Channel5`.',
      hold: 3200,
    },
    {
      caption: 'Subklassen beslutter gennem **arv**. `Package` ændres aldrig — en ny pakke er en ny subklasse (SRP, OCP).',
      hold: 2800,
    },
  ],
  Component: FactoryMethod,
}

export default viz
