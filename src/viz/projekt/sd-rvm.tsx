import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './sd-rvm.css'

/* RVM, use case Recycle Containers: løsningsforslaget (solution)RVM_SD.pdf, jf.
   oevelse-rvm-sekvensdiagram.md. Beskedtyper som i originalen: åben pil = asynkron,
   lukket pil = synkron (også selvkald), stiplet = svar. Stavefejlen "dosn't" i
   originalens guard er rettet. Beskederne afspilles i den rækkefølge, de står. */

type Kind = 'async' | 'sync' | 'reply'
interface Msg {
  id: string
  from: 'user' | 'rvm'
  to: 'user' | 'rvm'
  kind: Kind
  label: string
  narrow: string[]
  beat: number
}

const MSGS: Msg[] = [
  { id: 'm1', from: 'rvm', to: 'user', kind: 'async', label: 'Informs to insert container', narrow: ['Informs to insert', 'container'], beat: 1 },
  { id: 'm2', from: 'user', to: 'rvm', kind: 'sync', label: 'Place container in in-feed', narrow: ['Place container', 'in in-feed'], beat: 2 },
  { id: 'm3', from: 'rvm', to: 'rvm', kind: 'sync', label: 'Scan and validate', narrow: ['Scan and', 'validate'], beat: 2 },
  { id: 'm4', from: 'rvm', to: 'rvm', kind: 'sync', label: 'Add deposit to collected amount', narrow: ['Add deposit', 'to collected', 'amount'], beat: 3 },
  { id: 'm5', from: 'rvm', to: 'user', kind: 'reply', label: 'Display type, value and total amount', narrow: ['Display type, value', 'and total amount'], beat: 3 },
  { id: 'm6', from: 'rvm', to: 'user', kind: 'reply', label: 'Display not accepted', narrow: ['Display not accepted'], beat: 4 },
  { id: 'm7', from: 'rvm', to: 'user', kind: 'async', label: 'Reject container', narrow: ['Reject container'], beat: 4 },
  { id: 'm8', from: 'user', to: 'rvm', kind: 'sync', label: 'Request deposit receipt', narrow: ['Request deposit', 'receipt'], beat: 5 },
  { id: 'm9', from: 'rvm', to: 'user', kind: 'reply', label: 'Prints receipt', narrow: ['Prints receipt'], beat: 5 },
  { id: 'm10', from: 'rvm', to: 'rvm', kind: 'sync', label: 'Reset collected amount', narrow: ['Reset', 'collected', 'amount'], beat: 5 },
]

/* Rækkefølgen af beskeder og fragmentgrænser, oppefra og ned. */
type Item = { msg: string } | { open: 'loop' | 'alt' } | { else: true } | { close: 'loop' | 'alt' }
const ITEMS: Item[] = [
  { msg: 'm1' },
  { open: 'loop' },
  { msg: 'm2' },
  { msg: 'm3' },
  { open: 'alt' },
  { msg: 'm4' },
  { msg: 'm5' },
  { else: true },
  { msg: 'm6' },
  { msg: 'm7' },
  { close: 'alt' },
  { close: 'loop' },
  { msg: 'm8' },
  { msg: 'm9' },
  { msg: 'm10' },
]

interface Geo {
  w: number
  user: number
  rvm: number
  headTop: number
  lifeTop: number
  first: number
  loopX: [number, number]
  altX: [number, number]
  narrow: boolean
}
const WIDE: Geo = { w: 660, user: 100, rvm: 370, headTop: 30, lifeTop: 98, first: 112, loopX: [30, 646], altX: [48, 630], narrow: false }
const NARROW: Geo = { w: 320, user: 38, rvm: 178, headTop: 30, lifeTop: 98, first: 112, loopX: [4, 316], altX: [12, 308], narrow: true }

const LINE = 15

/** Rækkefølge inden for et beat, så beskederne kommer én ad gangen. */
const ORDER: Record<string, number> = Object.fromEntries(
  MSGS.map((m) => [m.id, MSGS.filter((x) => x.beat === m.beat).indexOf(m)]),
)

interface Placed {
  msgs: Record<string, { y: number; lines: string[] }>
  frag: { loop: [number, number]; alt: [number, number]; elseY: number }
  act: { loop: [number, number]; end: [number, number]; user: [number, number] }
  h: number
}

function place(g: Geo): Placed {
  let y = g.first
  const msgs: Placed['msgs'] = {}
  const frag = { loop: [0, 0] as [number, number], alt: [0, 0] as [number, number], elseY: 0 }
  for (const it of ITEMS) {
    if ('msg' in it) {
      const m = MSGS.find((x) => x.id === it.msg)!
      const lines = g.narrow ? m.narrow : [m.label]
      const self = m.from === m.to
      if (self) {
        const rowH = Math.max(34, lines.length * LINE + 14)
        msgs[m.id] = { y: y + 6, lines }
        y += rowH
      } else {
        const extra = (lines.length - 1) * LINE
        msgs[m.id] = { y: y + 18 + extra, lines }
        y += 30 + extra
      }
    } else if ('open' in it) {
      frag[it.open][0] = y
      y += it.open === 'loop' ? 26 : 24
    } else if ('else' in it) {
      frag.elseY = y + 2
      y += 24
    } else {
      y += 8
      frag[it.close][1] = y
      y += 8
    }
  }
  const m = msgs
  return {
    msgs,
    frag,
    act: {
      loop: [m.m2.y, m.m7.y + 4],
      end: [m.m8.y, m.m10.y + 20],
      user: [m.m8.y, m.m9.y],
    },
    h: y + 14,
  }
}

const PW = WIDE
const PN = NARROW
const PLACED_W = place(PW)
const PLACED_N = place(PN)

function arrowHead(x: number, y: number, dir: 1 | -1, kind: Kind) {
  const a = 8
  const b = 4.5
  const d = `M${x - dir * a} ${y - b} L${x} ${y} L${x - dir * a} ${y + b}`
  return kind === 'sync' ? <path className="sdr-head is-filled" d={`${d} Z`} /> : <path className="sdr-head" d={d} />
}

function Message({ m, g, p, step }: { m: Msg; g: Geo; p: Placed; step: number }) {
  const shown = step >= m.beat
  const hot = step === m.beat
  const { y, lines } = p.msgs[m.id]
  const x = (who: 'user' | 'rvm') => (who === 'user' ? g.user : g.rvm)
  const self = m.from === m.to
  const tone = hot ? 'hot' : 'done'

  let path: string
  let head: ReactNode
  let text: ReactNode
  if (self) {
    const x0 = g.rvm + 5
    const x1 = g.rvm + 30
    path = `M${x0} ${y} H${x1} V${y + 16} H${x0 + 1}`
    head = arrowHead(x0 + 1, y + 16, -1, m.kind)
    text = (
      <text className="sdr-label" x={x1 + 7} y={y + 4} textAnchor="start">
        {lines.map((l, i) => (
          <tspan key={i} x={x1 + 7} dy={i === 0 ? 0 : LINE}>
            {l}
          </tspan>
        ))}
      </text>
    )
  } else {
    const dir = x(m.to) > x(m.from) ? 1 : -1
    const x0 = x(m.from) + dir * 5
    const x1 = x(m.to) - dir * 5
    path = `M${x0} ${y} H${x1}`
    head = arrowHead(x1, y, dir as 1 | -1, m.kind)
    const cx = (g.user + g.rvm) / 2
    text = (
      <text className="sdr-label" x={cx} y={y - 7 - (lines.length - 1) * LINE} textAnchor="middle">
        {lines.map((l, i) => (
          <tspan key={i} x={cx} dy={i === 0 ? 0 : LINE}>
            {l}
          </tspan>
        ))}
      </text>
    )
  }

  return (
    <motion.g
      className="sdr-msg"
      data-kind={m.kind}
      data-tone={tone}
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={shown ? { ...t.fade, delay: hot ? 0.15 + ORDER[m.id] * 0.55 : 0 } : t.fade}
      aria-hidden={!shown || undefined}
    >
      <path className="sdr-line" d={path} />
      {head}
      {text}
    </motion.g>
  )
}

function Fragment({
  kind,
  x,
  y,
  guard,
  shown,
  hot,
}: {
  kind: 'loop' | 'alt'
  x: [number, number]
  y: [number, number]
  guard: string
  shown: boolean
  hot: boolean
}) {
  const tagW = kind === 'loop' ? 40 : 32
  return (
    <motion.g
      className="sdr-frag"
      data-hot={hot || undefined}
      initial={false}
      animate={{ opacity: shown ? 1 : 0 }}
      transition={t.fade}
      aria-hidden={!shown || undefined}
    >
      <rect x={x[0]} y={y[0]} width={x[1] - x[0]} height={y[1] - y[0]} rx={2} />
      <path className="sdr-frag-tag" d={`M${x[0]} ${y[0]} H${x[0] + tagW} V${y[0] + 11} L${x[0] + tagW - 6} ${y[0] + 17} H${x[0]} Z`} />
      <text className="sdr-frag-kind" x={x[0] + 6} y={y[0] + 12.5}>
        {kind}
      </text>
      <text className="sdr-guard" x={x[0] + tagW + 8} y={y[0] + 13}>
        {guard}
      </text>
    </motion.g>
  )
}

function Diagram({ g, p, step, className }: { g: Geo; p: Placed; step: number; className: string }) {
  const actOn = (from: number) => step >= from
  return (
    <svg className={`sdr-svg ${className}`} viewBox={`0 0 ${g.w} ${p.h}`} aria-hidden="true">
      {/* Diagramrammen */}
      <rect className="sdr-frame" x={1} y={1} width={g.w - 2} height={p.h - 2} rx={3} />
      <path className="sdr-frame-tag" d={`M1 1 H170 V14 L162 22 H1 Z`} />
      <text className="sdr-frame-name" x={8} y={16}>
        sd Recycle Containers
      </text>

      {/* Lifelines: aktøren som tændstiksmand, RVM som rektangel */}
      <g className="sdr-actor">
        <circle cx={g.user} cy={g.headTop + 10} r={7} />
        <path d={`M${g.user} ${g.headTop + 17} V${g.headTop + 36} M${g.user - 12} ${g.headTop + 24} H${g.user + 12} M${g.user} ${g.headTop + 36} L${g.user - 10} ${g.headTop + 48} M${g.user} ${g.headTop + 36} L${g.user + 10} ${g.headTop + 48}`} />
        <text x={g.user} y={g.headTop + 62}>
          USER
        </text>
      </g>
      <g className="sdr-part">
        <rect x={g.rvm - 36} y={g.headTop + 14} width={72} height={30} rx={2} />
        <text x={g.rvm} y={g.headTop + 29}>
          :RVM
        </text>
      </g>
      <path className="sdr-life" d={`M${g.user} ${g.lifeTop} V${p.h - 10} M${g.rvm} ${g.headTop + 44} V${p.h - 10}`} />

      {/* Activations (som i løsningsforslaget) */}
      <motion.rect className="sdr-act" x={g.rvm - 5} y={p.act.loop[0]} width={10} height={p.act.loop[1] - p.act.loop[0]} initial={false} animate={{ opacity: actOn(2) ? 1 : 0 }} transition={t.fade} />
      <motion.rect className="sdr-act" x={g.rvm - 5} y={p.act.end[0]} width={10} height={p.act.end[1] - p.act.end[0]} initial={false} animate={{ opacity: actOn(5) ? 1 : 0 }} transition={t.fade} />
      <motion.rect className="sdr-act" x={g.user - 5} y={p.act.user[0]} width={10} height={p.act.user[1] - p.act.user[0]} initial={false} animate={{ opacity: actOn(5) ? 1 : 0 }} transition={t.fade} />

      <Fragment kind="loop" x={g.loopX} y={p.frag.loop} guard="[while not request deposit]" shown={step >= 2} hot={step === 2} />
      <Fragment kind="alt" x={g.altX} y={p.frag.alt} guard="[accept container]" shown={step >= 3} hot={step === 3 || step === 4} />
      <motion.g className="sdr-else" initial={false} animate={{ opacity: step >= 4 ? 1 : 0 }} transition={t.fade} aria-hidden={step < 4 || undefined}>
        <path d={`M${g.altX[0]} ${p.frag.elseY} H${g.altX[1]}`} />
        <text className="sdr-guard" x={g.altX[0] + 8} y={p.frag.elseY + 15}>
          [doesn’t accept container]
        </text>
      </motion.g>

      {MSGS.map((m) => (
        <Message key={m.id} m={m} g={g} p={p} step={step} />
      ))}
    </svg>
  )
}

const LEGEND: { kind: Kind; name: string; note: string }[] = [
  { kind: 'async', name: 'asynkron', note: 'afsenderen fortsætter' },
  { kind: 'sync', name: 'synkron', note: 'afsenderen venter' },
  { kind: 'reply', name: 'svar', note: 'retur til kalderen' },
]

function SdRvm({ step }: { step: number }) {
  const used = new Set(MSGS.filter((m) => m.beat === step).map((m) => m.kind))
  return (
    <div className="sdr">
      <Diagram g={PW} p={PLACED_W} step={step} className="sdr-wide" />
      <Diagram g={PN} p={PLACED_N} step={step} className="sdr-narrow" />
      <ul className="sdr-legend">
        {LEGEND.map((l) => (
          <li key={l.kind} data-on={used.has(l.kind) || undefined}>
            <svg viewBox="0 0 44 12" className="sdr-legend-arrow" aria-hidden="true">
              <path className="sdr-line" data-kind={l.kind} d="M2 6 H40" />
              {l.kind === 'sync' ? <path className="sdr-head is-filled" d="M34 1.5 L42 6 L34 10.5 Z" /> : <path className="sdr-head" d="M34 1.5 L42 6 L34 10.5" />}
            </svg>
            <span className="sdr-legend-name">{l.name}</span>
            <span className="sdr-legend-note">{l.note}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'sd-rvm',
  title: 'Sekvensdiagrammet for RVM’ens Recycle Containers, besked for besked',
  steps: [
    {
      caption: 'Rammen hedder `sd Recycle Containers`. Deltagerne er aktøren **USER** og systemet **:RVM** — én lifeline for hele maskinen. Tiden går nedad.',
      hold: 2400,
    },
    {
      caption: 'Use case-skridt 1: RVM beder brugeren indsætte en flaske. Åben pilespids betyder **asynkron**: RVM venter ikke på svar.',
      hold: 2400,
    },
    {
      caption: 'Skridt 2–3 gentages, til brugeren beder om kvittering: et **loop** med guarden `[while not request deposit]`. Indsættelsen er et **synkront** kald, og scanningen et selvkald.',
      hold: 3000,
    },
    {
      caption: 'Skridt 3a som første operand i et **alt**: flasken godkendes, pantbeløbet lægges til, og svaret — den **stiplede** pil — viser type, værdi og total.',
      hold: 2800,
    },
    {
      caption: 'Skridt 3b er anden operand, adskilt af en stiplet linje: flasken afvises. Kun én operand udføres pr. gennemløb; guards er gensidigt udelukkende.',
      hold: 2800,
    },
    {
      caption:
        'Efter loopet: kvittering og nulstilling. Det her er et SD på **systemniveau**. I applikationsmodellen splittes `:RVM` i boundary-, control- og domain-lifelines, og hver besked bliver et metodekald.',
      hold: 3400,
    },
  ],
  Component: SdRvm,
}

export default viz
