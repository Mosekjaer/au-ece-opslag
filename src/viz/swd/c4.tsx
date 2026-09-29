import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './c4.css'

/* 3-SW-Architecture - Documentation 1.pdf (PDF-sider; påtrykte slidenumre er højere):
   s. 11 (Level 1 Context → Level 4 Code, “Zoom in”), s. 13 (System Context diagram for
   Internet Banking System, “the sort of diagram that you could show to non-technical
   people”), s. 14 (Container diagram), s. 15 (Component diagram - API Application),
   s. 17 (“Level 4: Code (Optional)”: pakken com.bigbankplc.internetbanking.component.
   mainframe, lollipop-interfacet, +creates/+uses/+parses/+throws/+sends/+receives og
   tre generaliseringer). Navne, typer, beskrivelser og pileetiketter er ordret fra
   slidene (c4model.com’s Internet Banking System). Publikum for Container og Component
   står kun i c4model.com-konverteringen (swd/markdown/artikler/SW4SWD-01_C4_Model.md).
   På Component-niveau deler de tre pile fra hver app én etiket ved kilden. */

/* ------------------------------- Elementer ------------------------------- */

type Kind = 'person' | 'box' | 'db'
type Id =
  | 'cust' | 'ibs' | 'mail' | 'main'
  | 'web' | 'spa' | 'mob' | 'api' | 'db'
  | 'signin' | 'reset' | 'acc' | 'sec' | 'emailc' | 'facade'

interface El {
  kind: Kind
  ext?: boolean
  name: string
  type: string
  desc: string
}
const EL: Record<Id, El> = {
  cust: { kind: 'person', name: 'Personal Banking Customer', type: 'Person', desc: 'A customer of the bank, with personal bank accounts.' },
  ibs: { kind: 'box', name: 'Internet Banking System', type: 'Software System', desc: 'Allows customers to view information about their bank accounts, and make payments.' },
  mail: { kind: 'box', ext: true, name: 'E-mail System', type: 'Software System', desc: 'The internal Microsoft Exchange e-mail system.' },
  main: { kind: 'box', ext: true, name: 'Mainframe Banking System', type: 'Software System', desc: 'Stores all of the core banking information about customers, accounts, transactions, etc.' },
  web: { kind: 'box', name: 'Web Application', type: 'Container: Java and Spring MVC', desc: 'Delivers the static content and the Internet banking single page application.' },
  spa: { kind: 'box', name: 'Single-Page Application', type: 'Container: JavaScript and Angular', desc: 'Provides all of the Internet banking functionality to customers via their web browser.' },
  mob: { kind: 'box', name: 'Mobile App', type: 'Container: Xamarin', desc: 'Provides a limited subset of the Internet banking functionality to customers via their mobile device.' },
  api: { kind: 'box', name: 'API Application', type: 'Container: Java and Spring MVC', desc: 'Provides Internet banking functionality via a JSON/HTTPS API.' },
  db: { kind: 'db', name: 'Database', type: 'Container: Relational Database Schema', desc: 'Stores user registration information, hashed authentication credentials, access logs, etc.' },
  signin: { kind: 'box', name: 'Sign In Controller', type: 'Component: Spring MVC Rest Controller', desc: 'Allows users to sign in to the Internet Banking System.' },
  reset: { kind: 'box', name: 'Reset Password Controller', type: 'Component: Spring MVC Rest Controller', desc: 'Allows users to reset their passwords with a single use URL.' },
  acc: { kind: 'box', name: 'Accounts Summary Controller', type: 'Component: Spring MVC Rest Controller', desc: 'Provides customers with a summary of their bank accounts.' },
  sec: { kind: 'box', name: 'Security Component', type: 'Component: Spring Bean', desc: 'Provides functionality related to signing in, changing passwords, etc.' },
  emailc: { kind: 'box', name: 'E-mail Component', type: 'Component: Spring Bean', desc: 'Sends e-mails to users.' },
  facade: { kind: 'box', name: 'Mainframe Banking System Facade', type: 'Component: Spring Bean', desc: 'A facade onto the mainframe banking system.' },
}
const IDS = Object.keys(EL) as Id[]

/** Grådig ombrydning efter et omtrentligt antal tegn pr. linje. */
function wrap(s: string, n: number): string[] {
  const out: string[] = []
  let line = ''
  for (const w of s.split(' ')) {
    if (line && (line + ' ' + w).length > n) {
      out.push(line)
      line = w
    } else line = line ? `${line} ${w}` : w
  }
  if (line) out.push(line)
  return out
}

const BW = 176
const TXT = { name: 22, type: 26, desc: 26 }
const LH = { name: 15, type: 13, desc: 14 }
const HEAD = 26 // personens hoved

function textOf(id: Id, compact: boolean) {
  const e = EL[id]
  const name = wrap(e.name, TXT.name)
  const type = wrap(`[${e.type}]`, TXT.type)
  const desc = compact ? [] : wrap(e.desc, TXT.desc)
  const top = (e.kind === 'person' ? HEAD + 10 : e.kind === 'db' ? 18 : 12) + 11
  const h = top - 11 + name.length * LH.name + type.length * LH.type + (desc.length ? 5 + desc.length * LH.desc : 0) + 9
  return { name, type, desc, top, h }
}

/* ------------------------------ Placeringer ------------------------------ */

type Lv = 1 | 2 | 3 | 4
type Mode = 'box' | 'compact' | 'frame'
interface Place {
  x: number
  y: number
  mode?: Mode
  /** Rammens størrelse (kun mode 'frame'). */
  w?: number
  h?: number
}
const PLACE: Record<Lv, Partial<Record<Id, Place>>> = {
  1: {
    cust: { x: 342, y: 8 },
    ibs: { x: 342, y: 226 },
    mail: { x: 664, y: 226 },
    main: { x: 342, y: 440 },
  },
  2: {
    cust: { x: 386, y: 0 },
    ibs: { x: 0, y: 208, mode: 'frame', w: 672, h: 422 },
    mail: { x: 684, y: 230 },
    main: { x: 684, y: 430 },
    web: { x: 6, y: 230 },
    spa: { x: 290, y: 230 },
    mob: { x: 482, y: 230 },
    db: { x: 6, y: 430 },
    api: { x: 386, y: 430 },
  },
  3: {
    spa: { x: 200, y: 0, mode: 'compact' },
    mob: { x: 484, y: 0, mode: 'compact' },
    api: { x: 0, y: 160, mode: 'frame', w: 860, h: 372 },
    signin: { x: 20, y: 184 },
    reset: { x: 342, y: 184 },
    acc: { x: 664, y: 184 },
    sec: { x: 20, y: 366 },
    emailc: { x: 342, y: 366 },
    facade: { x: 664, y: 366 },
    db: { x: 20, y: 570, mode: 'compact' },
    mail: { x: 342, y: 570, mode: 'compact' },
    main: { x: 664, y: 570, mode: 'compact' },
  },
  4: {
    facade: { x: 20, y: 70, mode: 'frame', w: 830, h: 500 },
  },
}
const VB = { w: 860, h: 642 }

/** Den boks, man zoomer ind i, ved overgangen fra niveau k til k+1. */
const ZOOM: Record<1 | 2 | 3, Id> = { 1: 'ibs', 2: 'api', 3: 'facade' }

interface St {
  x: number
  y: number
  s: number
  w: number
  h: number
  mode: Mode
  on: boolean
}
function own(id: Id, lv: Lv): St | null {
  const p = PLACE[lv][id]
  if (!p) return null
  const mode = p.mode ?? 'box'
  if (mode === 'frame') return { x: p.x, y: p.y, s: 1, w: p.w!, h: p.h!, mode, on: true }
  const { h } = textOf(id, mode === 'compact')
  return { x: p.x, y: p.y, s: 1, w: BW, h, mode, on: true }
}
/** Zoom-afbildning af et punkt fra niveau k til k+1 (og omvendt). */
function zoomMap(k: 1 | 2 | 3, inverse: boolean) {
  const z = own(ZOOM[k], k as Lv)!
  const f = own(ZOOM[k], (k + 1) as Lv)!
  const s = f.w / z.w
  return inverse
    ? (x: number, y: number, sc: number) => ({ x: z.x + (x - f.x) / s, y: z.y + (y - f.y) / s, s: sc / s })
    : (x: number, y: number, sc: number) => ({ x: f.x + (x - z.x) * s, y: f.y + (y - z.y) * s, s: sc * s })
}
const LEVELS: Lv[] = [1, 2, 3, 4]
function stateAt(id: Id, lv: Lv): St {
  const o = own(id, lv)
  if (o) return o
  const seen = LEVELS.filter((l) => PLACE[l][id])
  const first = seen[0]
  const last = seen[seen.length - 1]
  if (lv < first) {
    const nxt = stateAt(id, (lv + 1) as Lv)
    const m = zoomMap(lv as 1 | 2 | 3, true)(nxt.x, nxt.y, nxt.s)
    return { ...nxt, ...m, on: false }
  }
  const prv = stateAt(id, (lv - 1) as Lv)
  void last
  const m = zoomMap((lv - 1) as 1 | 2 | 3, false)(prv.x, prv.y, prv.s)
  return { ...prv, ...m, on: false }
}

/* ------------------------------- Relationer ------------------------------ */

type Side = 't' | 'b' | 'l' | 'r'
function P(id: Id, lv: Lv, side: Side, f = 0.5): [number, number] {
  const s = own(id, lv)!
  const top = EL[id].kind === 'person' ? s.y + 4 : s.y
  switch (side) {
    case 't':
      return [s.x + s.w * f, top]
    case 'b':
      return [s.x + s.w * f, s.y + s.h]
    case 'l':
      return [s.x, s.y + s.h * f]
    default:
      return [s.x + s.w, s.y + s.h * f]
  }
}
interface Rel {
  a: [number, number]
  b: [number, number]
  label: string[]
  at: [number, number]
  anchor?: 'start' | 'middle' | 'end'
  /** Pilen tegnes uden etiket (etiketten står ved en anden pil fra samme kilde). */
  bare?: boolean
}
const REL: Record<Lv, Rel[]> = {
  1: [
    { a: P('cust', 1, 'b'), b: P('ibs', 1, 't'), label: ['Views account', 'balances, and makes', 'payments using'], at: [420, 164], anchor: 'end' },
    { a: P('ibs', 1, 'r'), b: P('mail', 1, 'l'), label: ['Sends e-mail', 'using'], at: [591, 248] },
    { a: P('mail', 1, 't'), b: P('cust', 1, 'r', 0.62), label: ['Sends e-mails to'], at: [668, 160], anchor: 'start' },
    { a: P('ibs', 1, 'b'), b: P('main', 1, 't'), label: ['Gets account', 'information from, and', 'makes payments using'], at: [420, 376], anchor: 'end' },
  ],
  2: [
    { a: P('cust', 2, 'l', 0.62), b: P('web', 2, 't'), label: ['Visits bigbank.com/ib', 'using', '[HTTPS]'], at: [232, 110], anchor: 'end' },
    { a: P('cust', 2, 'b', 0.3), b: P('spa', 2, 't', 0.6), label: ['Views account', 'balances, and makes', 'payments using'], at: [412, 172], anchor: 'end' },
    { a: P('cust', 2, 'b', 0.7), b: P('mob', 2, 't', 0.4), label: ['Views account', 'balances, and makes', 'payments using'], at: [538, 172], anchor: 'start' },
    { a: P('mail', 2, 't'), b: P('cust', 2, 'r', 0.55), label: ['Sends e-mails to'], at: [702, 132], anchor: 'start' },
    { a: P('web', 2, 'r'), b: P('spa', 2, 'l'), label: ['Delivers to the', 'customer’s web', 'browser'], at: [235, 318] },
    { a: P('spa', 2, 'b'), b: P('api', 2, 't', 0.3), label: ['Makes API calls to', '[JSON/HTTPS]'], at: [404, 392], anchor: 'end' },
    { a: P('mob', 2, 'b'), b: P('api', 2, 't', 0.7), label: ['Makes API calls to', '[JSON/HTTPS]'], at: [546, 392], anchor: 'start' },
    { a: P('api', 2, 'l', 0.45), b: P('db', 2, 'r', 0.45), label: ['Reads from and', 'writes to', '[JDBC]'], at: [283, 452] },
    { a: P('api', 2, 'r', 0.2), b: P('mail', 2, 'b', 0.35), label: ['Sends e-mail using', '[SMTP]'], at: [676, 394], anchor: 'start' },
    { a: P('api', 2, 'r', 0.62), b: P('main', 2, 'l', 0.5), label: ['Makes API', 'calls to', '[XML/HTTPS]'], at: [623, 518] },
  ],
  3: [
    { a: P('spa', 3, 'b', 0.3), b: P('signin', 3, 't', 0.4), label: ['Makes API calls to', '[JSON/HTTPS]'], at: [192, 30], anchor: 'end' },
    { a: P('spa', 3, 'b', 0.5), b: P('reset', 3, 't', 0.35), label: [], at: [0, 0], bare: true },
    { a: P('spa', 3, 'b', 0.7), b: P('acc', 3, 't', 0.3), label: [], at: [0, 0], bare: true },
    { a: P('mob', 3, 'b', 0.3), b: P('signin', 3, 't', 0.7), label: [], at: [0, 0], bare: true },
    { a: P('mob', 3, 'b', 0.5), b: P('reset', 3, 't', 0.65), label: [], at: [0, 0], bare: true },
    { a: P('mob', 3, 'b', 0.7), b: P('acc', 3, 't', 0.6), label: ['Makes API calls to', '[JSON/HTTPS]'], at: [668, 30], anchor: 'start' },
    { a: P('signin', 3, 'b', 0.5), b: P('sec', 3, 't', 0.5), label: ['Uses'], at: [114, 348], anchor: 'start' },
    { a: P('reset', 3, 'b', 0.25), b: P('sec', 3, 'r', 0.2), label: ['Uses'], at: [262, 346], anchor: 'middle' },
    { a: P('reset', 3, 'b', 0.6), b: P('emailc', 3, 't', 0.6), label: ['Uses'], at: [454, 348], anchor: 'start' },
    { a: P('acc', 3, 'b', 0.5), b: P('facade', 3, 't', 0.5), label: ['Uses'], at: [758, 348], anchor: 'start' },
    { a: P('sec', 3, 'b', 0.7), b: P('db', 3, 't', 0.7), label: ['Reads from and', 'writes to [JDBC]'], at: [150, 546], anchor: 'start' },
    { a: P('emailc', 3, 'b', 0.7), b: P('mail', 3, 't', 0.7), label: ['Sends e-mail', 'using'], at: [472, 546], anchor: 'start' },
    { a: P('facade', 3, 'b', 0.7), b: P('main', 3, 't', 0.7), label: ['Uses', '[XML/HTTPS]'], at: [784, 546], anchor: 'end' },
  ],
  4: [],
}

/** Pil med åben spids (C4-relation / UML-afhængighed), let forkortet i begge ender. */
function relPath(a: [number, number], b: [number, number]) {
  const dx = b[0] - a[0]
  const dy = b[1] - a[1]
  const len = Math.hypot(dx, dy)
  const ux = dx / len
  const uy = dy / len
  const bx = b[0] - ux * 2
  const by = b[1] - uy * 2
  const hx = -uy * 4.5
  const hy = ux * 4.5
  return {
    line: `M${a[0].toFixed(1)} ${a[1].toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)}`,
    head: `M${(bx - ux * 8 + hx).toFixed(1)} ${(by - uy * 8 + hy).toFixed(1)} L${bx.toFixed(1)} ${by.toFixed(1)} L${(bx - ux * 8 - hx).toFixed(1)} ${(by - uy * 8 - hy).toFixed(1)}`,
  }
}

function Label({ at, lines, anchor = 'middle', className = 'c4-rel-t' }: { at: [number, number]; lines: string[]; anchor?: 'start' | 'middle' | 'end'; className?: string }) {
  return (
    <text className={className} x={at[0]} y={at[1]} textAnchor={anchor}>
      {lines.map((l, i) => (
        <tspan key={i} x={at[0]} dy={i === 0 ? 0 : '1.2em'} className={l.startsWith('[') ? 'c4-tech' : undefined}>
          {l}
        </tspan>
      ))}
    </text>
  )
}

/* ------------------------------- Boksene ------------------------------- */

function Shape({ kind, w, h, mode, pkg }: { kind: Kind; w: number; h: number; mode: Mode; pkg?: boolean }) {
  if (mode === 'frame') {
    return <motion.rect className={pkg ? 'c4-pkg' : 'c4-bound'} initial={false} animate={{ width: w, height: h }} transition={t.travel} rx={4} />
  }
  if (kind === 'person') {
    return (
      <>
        <motion.rect className="c4-shape" y={HEAD} initial={false} animate={{ width: w, height: h - HEAD }} transition={t.travel} rx={22} />
        <circle className="c4-shape" cx={w / 2} cy={15} r={15} />
      </>
    )
  }
  if (kind === 'db') {
    const ry = 9
    return (
      <>
        <motion.path
          className="c4-shape"
          initial={false}
          animate={{ d: `M0 ${ry} V${h - ry} A${w / 2} ${ry} 0 0 0 ${w} ${h - ry} V${ry}` }}
          transition={t.travel}
        />
        <ellipse className="c4-shape" cx={w / 2} cy={ry} rx={w / 2} ry={ry} />
      </>
    )
  }
  return <motion.rect className="c4-shape" initial={false} animate={{ width: w, height: h }} transition={t.travel} rx={4} />
}

function Box({ id, st, hot, delay }: { id: Id; st: St; hot: boolean; delay: number }) {
  const e = EL[id]
  const frame = st.mode === 'frame'
  const tx = textOf(id, st.mode === 'compact')
  const full = textOf(id, false)
  const cx = st.w / 2
  return (
    <motion.g
      className="c4-el"
      data-ext={e.ext || undefined}
      data-hot={hot || undefined}
      data-frame={frame || undefined}
      initial={false}
      animate={{ x: st.x, y: st.y, scale: st.s, opacity: st.on ? 1 : 0 }}
      transition={{ ...t.travel, opacity: st.on ? { ...t.fade, delay } : t.fade }}
      style={{ originX: 0, originY: 0 }}
    >
      <Shape kind={e.kind} w={st.w} h={st.h} mode={st.mode} pkg={id === 'facade'} />
      <motion.g initial={false} animate={{ opacity: frame ? 0 : 1 }} transition={frame ? t.fade : { ...t.fade, delay: 0.4 }}>
        <text className="c4-name" x={cx} y={full.top}>
          {tx.name.map((l, i) => (
            <tspan key={i} x={cx} dy={i === 0 ? 0 : LH.name}>
              {l}
            </tspan>
          ))}
        </text>
        <text className="c4-type" x={cx} y={full.top + tx.name.length * LH.name - 1}>
          {tx.type.map((l, i) => (
            <tspan key={i} x={cx} dy={i === 0 ? 0 : LH.type}>
              {l}
            </tspan>
          ))}
        </text>
        <motion.text
          className="c4-desc"
          x={cx}
          y={full.top + tx.name.length * LH.name + tx.type.length * LH.type + 4}
          initial={false}
          animate={{ opacity: st.mode === 'compact' ? 0 : 1 }}
          transition={t.fade}
        >
          {full.desc.map((l, i) => (
            <tspan key={i} x={cx} dy={i === 0 ? 0 : LH.desc}>
              {l}
            </tspan>
          ))}
        </motion.text>
      </motion.g>
      <motion.text
        className="c4-bound-t"
        x={10}
        y={st.h - 26}
        initial={false}
        animate={{ opacity: frame && st.on ? 1 : 0 }}
        transition={frame ? { ...t.fade, delay: 0.5 } : t.fade}
      >
        <tspan className="c4-bound-n">{id === 'facade' ? '' : e.name}</tspan>
        <tspan x={10} dy={14}>
          {id === 'facade' ? '' : `[${id === 'api' ? 'Container' : e.type}]`}
        </tspan>
      </motion.text>
    </motion.g>
  )
}

/* ------------------------------ Level 4 (UML) ------------------------------ */

interface Cls {
  name: string
  x: number
  y: number
  w: number
  abstract?: boolean
}
type ClsId = 'ibse' | 'impl' | 'mbse' | 'req' | 'resp' | 'conn' | 'areq' | 'aresp'
interface ClsLayout {
  cls: Record<ClsId, Cls>
  pkg: { x: number; y: number; w: number; h: number; tab: number; name: string[] }
  lolly: { cx: number; cy: number; lx: number; ly: number; anchor: 'start' | 'end' | 'middle'; to: number }
  deps: { a: [number, number]; b: [number, number]; label: string; at: [number, number]; anchor?: 'start' | 'end' | 'middle' }[]
  gens: { d: string; tip: [number, number] }[]
}
const CH = 38
const C4_WIDE: ClsLayout = {
  cls: {
    ibse: { name: 'InternetBankingSystemException', x: 604, y: 0, w: 246 },
    impl: { name: 'MainframeBankingSystemFacadeImpl', x: 176, y: 196, w: 252 },
    mbse: { name: 'MainframeBankingSystemException', x: 600, y: 196, w: 250 },
    req: { name: 'GetBalanceRequest', x: 40, y: 318, w: 170 },
    resp: { name: 'GetBalanceResponse', x: 636, y: 318, w: 176 },
    conn: { name: 'BankingSystemConnection', x: 200, y: 404, w: 204 },
    areq: { name: 'AbstractRequest', x: 40, y: 506, w: 170, abstract: true },
    aresp: { name: 'AbstractResponse', x: 636, y: 506, w: 176 },
  },
  pkg: { x: 20, y: 70, w: 830, h: 500, tab: 380, name: ['com.bigbankplc.internetbanking.component.mainframe'] },
  lolly: { cx: 302, cy: 132, lx: 316, ly: 136, anchor: 'start', to: 196 },
  deps: [
    { a: [428, 215], b: [600, 215], label: '+throws', at: [514, 207] },
    { a: [230, 234], b: [140, 318], label: '+creates', at: [196, 284], anchor: 'end' },
    { a: [302, 234], b: [302, 404], label: '+uses', at: [310, 324], anchor: 'start' },
    { a: [380, 234], b: [700, 318], label: '+parses', at: [548, 266], anchor: 'start' },
    { a: [250, 442], b: [150, 506], label: '+sends', at: [214, 486], anchor: 'end' },
    { a: [360, 442], b: [700, 506], label: '+receives', at: [520, 466], anchor: 'start' },
  ],
  gens: [
    { d: 'M110 356 V495', tip: [110, 506] },
    { d: 'M724 356 V495', tip: [724, 506] },
    { d: 'M760 196 V49', tip: [760, 38] },
  ],
}
const C4_NARROW: ClsLayout = {
  cls: {
    ibse: { name: 'InternetBankingSystemException', x: 40, y: 0, w: 240 },
    mbse: { name: 'MainframeBankingSystemException', x: 40, y: 124, w: 240 },
    impl: { name: 'MainframeBankingSystemFacadeImpl', x: 20, y: 236, w: 250 },
    req: { name: 'GetBalanceRequest', x: 10, y: 334, w: 142 },
    resp: { name: 'GetBalanceResponse', x: 166, y: 334, w: 146 },
    conn: { name: 'BankingSystemConnection', x: 70, y: 420, w: 180 },
    areq: { name: 'AbstractRequest', x: 10, y: 512, w: 142, abstract: true },
    aresp: { name: 'AbstractResponse', x: 166, y: 512, w: 146 },
  },
  pkg: { x: 4, y: 58, w: 312, h: 506, tab: 170, name: ['com.bigbankplc.internetbanking.', 'component.mainframe'] },
  lolly: { cx: 238, cy: 204, lx: 226, ly: 208, anchor: 'end', to: 236 },
  deps: [
    { a: [60, 236], b: [60, 162], label: '+throws', at: [68, 190], anchor: 'start' },
    { a: [70, 274], b: [70, 334], label: '+creates', at: [64, 306], anchor: 'end' },
    { a: [160, 274], b: [160, 420], label: '+uses', at: [164, 380], anchor: 'start' },
    { a: [230, 274], b: [240, 334], label: '+parses', at: [246, 302], anchor: 'start' },
    { a: [110, 458], b: [100, 512], label: '+sends', at: [100, 488], anchor: 'end' },
    { a: [210, 458], b: [222, 512], label: '+receives', at: [224, 488], anchor: 'start' },
  ],
  gens: [
    { d: 'M26 372 V501', tip: [26, 512] },
    { d: 'M296 372 V501', tip: [296, 512] },
    { d: 'M262 124 V49', tip: [262, 38] },
  ],
}

function tri(tip: [number, number], dir: 'up' | 'down') {
  const [x, y] = tip
  const s = dir === 'down' ? -1 : 1
  return `M${x} ${y} L${x - 7} ${y + s * 11} L${x + 7} ${y + s * 11} Z`
}

function Code({ L, on, sh }: { L: ClsLayout; on: boolean; sh?: boolean }) {
  const cls = Object.entries(L.cls) as [ClsId, Cls][]
  return (
    <motion.g
      className="c4-code"
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={on ? { ...t.fade, delay: sh ? 0 : 0.55 } : t.fade}
    >
      <text className="c4-pkg-n" x={L.pkg.x + 10} y={L.pkg.y + 34}>
        {L.pkg.name.map((l, i) => (
          <tspan key={i} x={L.pkg.x + 10} dy={i === 0 ? 0 : 14}>
            {l}
          </tspan>
        ))}
      </text>
      <path className="c4-uml" d={`M${L.lolly.cx} ${L.lolly.cy + 8} V${L.lolly.to}`} />
      <circle className="c4-lolly" cx={L.lolly.cx} cy={L.lolly.cy} r={8} />
      <text className="c4-cls-n c4-iface" x={L.lolly.lx} y={L.lolly.ly} style={{ textAnchor: L.lolly.anchor }}>
        MainframeBankingSystemFacade
      </text>
      {L.deps.map((d, i) => {
        const p = relPath(d.a, d.b)
        return (
          <g key={i} className="c4-dep">
            <path className="c4-dep-l" d={p.line} />
            <path className="c4-dep-h" d={p.head} />
            <text className="c4-dep-t" x={d.at[0]} y={d.at[1]} textAnchor={d.anchor ?? 'middle'}>
              {d.label}
            </text>
          </g>
        )
      })}
      {L.gens.map((g, i) => (
        <g key={i} className="c4-gen">
          <path d={g.d} />
          <path className="c4-gen-h" d={tri(g.tip, g.tip[1] < 100 ? 'up' : 'down')} />
        </g>
      ))}
      {cls.map(([k, c]) => (
        <g key={k} className="c4-cls">
          <rect x={c.x} y={c.y} width={c.w} height={CH} />
          <path d={`M${c.x} ${c.y + 22} H${c.x + c.w} M${c.x} ${c.y + 30} H${c.x + c.w}`} />
          <text className="c4-cls-n" x={c.x + c.w / 2} y={c.y + 15} fontStyle={c.abstract ? 'italic' : undefined}>
            {c.name}
          </text>
        </g>
      ))}
    </motion.g>
  )
}

/* ------------------------------ Diagrammet ------------------------------ */

const TITLES: Record<Lv, string> = {
  1: 'System Context diagram for Internet Banking System',
  2: 'Container diagram for Internet Banking System',
  3: 'Component diagram for Internet Banking System - API Application',
  4: 'Level 4: Code (Optional)',
}
const LV_OF_STEP: Lv[] = [1, 2, 2, 3, 4, 4]
const HOT: Record<Lv, Id> = { 1: 'ibs', 2: 'api', 3: 'facade', 4: 'facade' }

function Wide({ step }: { step: number }) {
  const lv = LV_OF_STEP[step]
  const relsOn = (l: Lv) => lv === l && (l !== 2 || step >= 2)
  return (
    <svg className="c4-svg c4-wide" viewBox={`0 0 ${VB.w} ${VB.h}`} aria-hidden="true">
      {/* Pakkens fane på level 4 */}
      <motion.path
        className="c4-pkg"
        d={`M${C4_WIDE.pkg.x} ${C4_WIDE.pkg.y} V${C4_WIDE.pkg.y - 16} H${C4_WIDE.pkg.x + C4_WIDE.pkg.tab} V${C4_WIDE.pkg.y}`}
        initial={false}
        animate={{ opacity: lv === 4 ? 1 : 0 }}
        transition={t.fade}
      />
      {([1, 2, 3] as Lv[]).map((l) => (
        <motion.g key={l} initial={false} animate={{ opacity: relsOn(l) ? 1 : 0 }} transition={relsOn(l) ? { ...t.fade, delay: 0.7 } : t.fade}>
          {REL[l].map((r, i) => {
            const p = relPath(r.a, r.b)
            return (
              <motion.g
                key={i}
                className="c4-rel"
                initial={false}
                animate={{ opacity: relsOn(l) ? 1 : 0 }}
                transition={relsOn(l) ? stagger(i, 0.7, 0.05) : t.fade}
              >
                <path className="c4-rel-l" d={p.line} />
                <path className="c4-rel-h" d={p.head} />
                {!r.bare && <Label at={r.at} lines={r.label} anchor={r.anchor} />}
              </motion.g>
            )
          })}
        </motion.g>
      ))}
      {IDS.map((id, i) => (
        <Box key={id} id={id} st={stateAt(id, lv)} hot={HOT[lv] === id && lv < 4 && (lv !== 2 || step >= 2)} delay={0.25 + (i % 6) * 0.06} />
      ))}
      <Code L={C4_WIDE} on={lv === 4} />
    </svg>
  )
}

/* -------------------------------- Smal -------------------------------- */

interface NarrowLevel {
  above: Id[]
  frame?: { id: Id; label: string }
  inside: Id[]
  below: Id[]
  rels: [string, string][]
}
const NARROW: Record<1 | 2 | 3, NarrowLevel> = {
  1: {
    above: ['cust'],
    inside: ['ibs'],
    below: ['mail', 'main'],
    rels: [
      ['Personal Banking Customer → Internet Banking System', 'Views account balances, and makes payments using'],
      ['Internet Banking System → E-mail System', 'Sends e-mail using'],
      ['E-mail System → Personal Banking Customer', 'Sends e-mails to'],
      ['Internet Banking System → Mainframe Banking System', 'Gets account information from, and makes payments using'],
    ],
  },
  2: {
    above: ['cust'],
    frame: { id: 'ibs', label: 'Internet Banking System [Software System]' },
    inside: ['web', 'spa', 'mob', 'api', 'db'],
    below: ['mail', 'main'],
    rels: [
      ['Customer → Web Application', 'Visits bigbank.com/ib using [HTTPS]'],
      ['Customer → Single-Page Application, Mobile App', 'Views account balances, and makes payments using'],
      ['Web Application → Single-Page Application', 'Delivers to the customer’s web browser'],
      ['Single-Page Application, Mobile App → API Application', 'Makes API calls to [JSON/HTTPS]'],
      ['API Application → Database', 'Reads from and writes to [JDBC]'],
      ['API Application → E-mail System', 'Sends e-mail using [SMTP]'],
      ['API Application → Mainframe Banking System', 'Makes API calls to [XML/HTTPS]'],
      ['E-mail System → Customer', 'Sends e-mails to'],
    ],
  },
  3: {
    above: ['spa', 'mob'],
    frame: { id: 'api', label: 'API Application [Container]' },
    inside: ['signin', 'reset', 'acc', 'sec', 'emailc', 'facade'],
    below: ['db', 'mail', 'main'],
    rels: [
      ['Single-Page Application, Mobile App → hver controller', 'Makes API calls to [JSON/HTTPS]'],
      ['Sign In Controller → Security Component', 'Uses'],
      ['Reset Password Controller → Security Component, E-mail Component', 'Uses'],
      ['Accounts Summary Controller → Mainframe Banking System Facade', 'Uses'],
      ['Security Component → Database', 'Reads from and writes to [JDBC]'],
      ['E-mail Component → E-mail System', 'Sends e-mail using'],
      ['Mainframe Banking System Facade → Mainframe Banking System', 'Uses [XML/HTTPS]'],
    ],
  },
}

function Card({ id, full, hot }: { id: Id; full: boolean; hot?: boolean }) {
  const e = EL[id]
  return (
    <div className="c4n-card" data-kind={e.kind} data-ext={e.ext || undefined} data-hot={hot || undefined}>
      <b>{e.name}</b>
      <span className="c4n-type">[{e.type}]</span>
      {full && <span className="c4n-desc">{e.desc}</span>}
    </div>
  )
}

function NarrowLevelView({ l, step }: { l: 1 | 2 | 3; step: number }) {
  const N = NARROW[l]
  const ctxFull = l === 1
  const relsOn = l !== 2 || step >= 2
  return (
    <div className="c4n">
      {N.above.length > 0 && (
        <div className="c4n-row">
          {N.above.map((id) => (
            <Card key={id} id={id} full={ctxFull} />
          ))}
        </div>
      )}
      {N.frame ? (
        <div className="c4n-frame">
          <div className="c4n-inside">
            {N.inside.map((id) => (
              <Card key={id} id={id} full hot={HOT[l] === id && (l !== 2 || step >= 2)} />
            ))}
          </div>
          <span className="c4n-frame-l">{N.frame.label}</span>
        </div>
      ) : (
        <div className="c4n-row">
          {N.inside.map((id) => (
            <Card key={id} id={id} full hot={HOT[l] === id} />
          ))}
        </div>
      )}
      <div className="c4n-row">
        {N.below.map((id) => (
          <Card key={id} id={id} full={ctxFull} />
        ))}
      </div>
      <motion.ul className="c4n-rels" initial={false} animate={{ opacity: relsOn ? 1 : 0 }} transition={t.fade}>
        {N.rels.map(([who, what], i) => (
          <li key={i}>
            <span className="c4n-rel-who">{who}</span>
            <span className="c4n-rel-what">{what}</span>
          </li>
        ))}
      </motion.ul>
    </div>
  )
}

function NarrowCode() {
  const L = C4_NARROW
  return (
    <svg className="c4-svg c4-narrow-code" viewBox="0 0 320 568" aria-hidden="true">
      <path className="c4-pkg" d={`M${L.pkg.x} ${L.pkg.y} V${L.pkg.y - 16} H${L.pkg.x + L.pkg.tab} V${L.pkg.y}`} />
      <rect className="c4-pkg" x={L.pkg.x} y={L.pkg.y} width={L.pkg.w} height={L.pkg.h} rx={2} />
      <Code L={L} on sh />
    </svg>
  )
}

/* ------------------------------ Miniaturer ------------------------------ */

function Thumb({ lv }: { lv: Lv }) {
  const target = lv < 4 ? ZOOM[lv as 1 | 2 | 3] : null
  return (
    <svg className="c4-thumb" viewBox={`-8 -8 ${VB.w + 16} ${VB.h + 16}`} aria-hidden="true">
      {lv < 4 &&
        REL[lv].map((r, i) => (
          <path key={i} className="c4-th-rel" d={`M${r.a[0]} ${r.a[1]} L${r.b[0]} ${r.b[1]}`} />
        ))}
      {IDS.map((id) => {
        const o = own(id, lv)
        if (!o) return null
        if (o.mode === 'frame') {
          return lv === 4 ? (
            <rect key={id} className="c4-th-bound" x={o.x} y={o.y} width={o.w} height={o.h} rx={4} />
          ) : (
            <rect key={id} className="c4-th-bound" x={o.x} y={o.y} width={o.w} height={o.h} rx={8} />
          )
        }
        return (
          <rect
            key={id}
            className="c4-th-box"
            data-ext={EL[id].ext || undefined}
            data-target={id === target || undefined}
            x={o.x}
            y={o.y}
            width={o.w}
            height={o.h}
            rx={EL[id].kind === 'person' ? 30 : 8}
          />
        )
      })}
      {lv === 4 &&
        Object.values(C4_WIDE.cls).map((c) => <rect key={c.name} className="c4-th-box" x={c.x} y={c.y} width={c.w} height={CH} />)}
    </svg>
  )
}

const LADDER: { lv: Lv; name: string; who: ReactNode; into?: string }[] = [
  { lv: 1, name: 'System Context', who: 'ikke-tekniske læsere (slidet)', into: 'Internet Banking System' },
  { lv: 2, name: 'Container', who: 'tekniske, i og uden for teamet (c4model.com)', into: 'API Application' },
  { lv: 3, name: 'Component', who: 'arkitekter og udviklere (c4model.com)', into: 'Mainframe Banking System Facade' },
  { lv: 4, name: 'Code', who: 'valgfrit (slidet)' },
]

function Final() {
  return (
    <ol className="c4-final">
      {LADDER.map((l) => (
        <li key={l.lv} className="c4-final-lv">
          <Thumb lv={l.lv} />
          <span className="c4-final-n">
            Level {l.lv} · <b>{l.name}</b> <span className="c4-final-who">— {l.who}</span>
          </span>
          {l.into && <span className="c4-final-into">zoom in → {l.into}</span>}
        </li>
      ))}
    </ol>
  )
}

/* -------------------------------- Figur -------------------------------- */

function UmlLegend() {
  return (
    <ul className="c4-legend">
      <li>
        <svg className="c4-sw-uml" viewBox="0 0 30 12">
          <path d="M1 6 H19" />
          <path className="c4-sw-tri" d="M29 6 L19 1 L19 11 Z" />
        </svg>
        generalisering
      </li>
      <li>
        <svg className="c4-sw-uml c4-sw-dep" viewBox="0 0 30 12">
          <path d="M1 6 H27" />
          <path d="M21 2 L28 6 L21 10" />
        </svg>
        afhængighed
      </li>
      <li>
        <svg className="c4-sw-uml" viewBox="0 0 30 12">
          <circle cx="7" cy="6" r="4.5" />
          <path d="M11.5 6 H29" />
        </svg>
        interface (lollipop)
      </li>
      <li>
        <i className="mono">Abstract…</i> kursiv = abstrakt
      </li>
    </ul>
  )
}

function Legend() {
  return (
    <ul className="c4-legend">
      <li>
        <span className="c4-sw c4-sw-person" /> person
      </li>
      <li>
        <span className="c4-sw c4-sw-own" /> software system / container / component
      </li>
      <li>
        <span className="c4-sw c4-sw-ext" /> eksternt software system
      </li>
      <li>
        <span className="c4-sw c4-sw-bound" /> grænse (boundary)
      </li>
      <li>
        <svg className="c4-sw-rel" viewBox="0 0 30 10">
          <path d="M1 5 H27" />
          <path d="M22 1 L28 5 L22 9" />
        </svg>
        relation: ensrettet, mærket, [teknologi]
      </li>
    </ul>
  )
}

function C4({ step }: { step: number }) {
  const final = step >= 5
  const lv = LV_OF_STEP[step]
  return (
    <div className="c4">
      <ol className="c4-ladder" aria-label="C4-niveauer">
        {LADDER.map((l) => (
          <li key={l.lv} className="c4-rung" data-now={(!final && l.lv === lv) || undefined} data-past={final || l.lv < lv || undefined}>
            <span className="c4-rung-n">Level {l.lv}</span>
            <span className="c4-rung-name">{l.name}</span>
          </li>
        ))}
      </ol>
      <Swap
        show={final ? 1 : 0}
        items={[
          <div key="d" className="c4-stage">
            <Swap
              show={lv - 1}
              className="c4-titles"
              items={([1, 2, 3, 4] as Lv[]).map((l) => (
                <div key={l} className="c4-title">
                  {TITLES[l]}
                  {l === 4 && <span className="c4-opt">Optional</span>}
                </div>
              ))}
            />
            <Wide step={Math.min(step, 4)} />
            <div className="c4-narrow">
              <Swap
                show={lv - 1}
                items={[
                  <NarrowLevelView key={1} l={1} step={step} />,
                  <NarrowLevelView key={2} l={2} step={step} />,
                  <NarrowLevelView key={3} l={3} step={step} />,
                  <NarrowCode key={4} />,
                ]}
              />
            </div>
            <Swap show={lv === 4 ? 1 : 0} items={[<Legend key="c" />, <UmlLegend key="u" />]} />
          </div>,
          <Final key="f" />,
        ]}
      />
    </div>
  )
}

const viz: VizDef = {
  id: 'c4',
  title: 'Internetbanken zoomet ind fire gange',
  steps: [
    { caption: '**System Context**: systemet som én boks, med dem der bruger det og de systemer, det afhænger af.', hold: 3000 },
    { caption: '**Container**: separat kørbare eller deploybare enheder, der kører kode eller gemmer data.', hold: 2800 },
    { caption: 'Nu kommer teknologivalg og protokoller på.', hold: 3000 },
    { caption: '**Component**: relateret funktionalitet bag et interface — alle i samme procesrum.', hold: 3000 },
    { caption: '**Code**: UML-klassediagram — valgfrit.', hold: 2600 },
    { caption: 'Samme system på fire abstraktionsniveauer — C4 viser struktur, ikke adfærd.', hold: 2400 },
  ],
  Component: C4,
}

export default viz
