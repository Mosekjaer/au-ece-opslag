import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './graphql-fetch.css'

/* Flight-eksemplet fra GrapQL Introduction.pdf. Siden skal bruge origin,
   destination og passagerernes navne. REST (endpoints er eksempler): to kald
   og for mange felter. GraphQL: ét kald, og svaret har forespørgslens form. */

type Kind = 'use' | 'extra' | 'plain'
interface Line {
  text: ReactNode
  depth?: number
  k?: Kind
}

const X = ({ children }: { children: ReactNode }) => <span className="gqf-x">{children}</span>

const FLIGHT: Line[] = [
  { text: '{' },
  { text: '"id": "1234",', depth: 1, k: 'extra' },
  { text: '"date": "2019-05-24",', depth: 1, k: 'extra' },
  { text: '"origin": "DFW",', depth: 1, k: 'use' },
  { text: '"destination": "MKE",', depth: 1, k: 'use' },
  { text: <X>…</X>, depth: 1, k: 'extra' },
  { text: '}' },
]

const PASSENGERS: Line[] = [
  { text: '[' },
  { text: '{ "name": "Luke Skywalker",', depth: 1, k: 'use' },
  { text: <>{'"passport_number": 78120935, '}<X>… {'},'}</X></>, depth: 2, k: 'extra' },
  { text: <>{'{ "name": "Han Solo", '}<X>…</X>{' },'}</>, depth: 1, k: 'use' },
  { text: <>{'{ "name": "R2-D2", '}<X>…</X>{' }'}</>, depth: 1, k: 'use' },
  { text: ']' },
]

// [forespørgsel, dybde, svar, dybde, felt der matches]
const PAIRS: [string, number, string, number, boolean?][] = [
  ['{', 0, '{ "data": {', 0],
  ['flight(id: "1234") {', 1, '"flight": {', 1],
  ['origin', 2, '"origin": "DFW",', 2, true],
  ['destination', 2, '"destination": "MKE",', 2, true],
  ['passengers {', 2, '"passengers": [', 2, true],
  ['name', 3, '{ "name": "Luke Skywalker" },', 3, true],
  ['', 0, '{ "name": "Han Solo" },', 3, true],
  ['', 0, '{ "name": "R2-D2" }', 3, true],
  ['}', 2, ']', 2],
  ['}', 1, '}', 1],
  ['}', 0, '} }', 0],
]

const indent = (d = 0) => ({ paddingLeft: `${d}ch` })

function Code({ lines, show, mark }: { lines: Line[]; show: boolean; mark: boolean }) {
  return (
    <div className="gqf-code" data-show={show} data-mark={mark || undefined}>
      {lines.map((l, i) => (
        <motion.div
          key={i}
          className="gqf-line"
          data-k={l.k ?? 'plain'}
          style={indent(l.depth)}
          initial={false}
          animate={{ opacity: show ? 1 : 0, x: show ? 0 : -4 }}
          transition={show ? stagger(i, 0.1, 0.05) : t.fade}
        >
          {l.text}
        </motion.div>
      ))}
    </div>
  )
}

function Req({ n, show, active, children, flag }: { n: number; show: boolean; active: boolean; children: ReactNode; flag?: ReactNode }) {
  return (
    <div className="gqf-req">
      <span className="gqf-n" data-on={show}>
        {n}
      </span>
      <Tag show={show} tone={active ? 'focus' : 'idle'}>
        {children}
      </Tag>
      {flag}
    </div>
  )
}

function Trips({ n, strong, children }: { n: number; strong: boolean; children?: ReactNode }) {
  return (
    <div className="gqf-trips" data-strong={strong}>
      <span className="vcaps">Rundture</span>
      <motion.span key={n} className="gqf-count" initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={t.place}>
        {n}
      </motion.span>
      {children}
    </div>
  )
}

function GraphqlFetch({ step }: { step: number }) {
  const call1 = at(step, 1)
  const over = at(step, 2)
  const call2 = at(step, 3)
  const gq = at(step, 4)
  const res = at(step, 5)
  const end = at(step, 6)

  return (
    <div className="gqf">
      <div className="gqf-need">
        <span className="vcaps">Siden skal bruge</span>
        <code>origin</code>
        <code>destination</code>
        <code>passengers → name</code>
      </div>

      <div className="gqf-lanes">
        <section className="gqf-lane" data-dim={gq && !end}>
          <header className="gqf-head">
            <span className="gqf-name">REST</span>
            <span className="gqf-note">endpoints er eksempler</span>
          </header>
          <Req n={1} show={call1} active={step === 1} flag={<Tag show={over} tone="neg">over-fetching</Tag>}>
            GET /flights/1234
          </Req>
          <Code lines={FLIGHT} show={call1} mark={over} />
          <Req n={2} show={call2} active={step === 3} flag={<Tag show={call2} tone="neg">under-fetching</Tag>}>
            GET /flights/1234/passengers
          </Req>
          <Code lines={PASSENGERS} show={call2} mark={call2} />
          <Trips n={call2 ? 2 : call1 ? 1 : 0} strong={end} />
        </section>

        <section className="gqf-lane">
          <header className="gqf-head">
            <span className="gqf-name">GraphQL</span>
            <span className="gqf-note">ét endpoint</span>
          </header>
          <Req n={1} show={gq} active={step === 4 || step === 5}>
            POST /graphql
          </Req>
          <div className="gqf-pair" data-show={gq}>
            <span className="gqf-q gqf-sub">forespørgsel</span>
            <span className="gqf-r gqf-sub">svar</span>
            {PAIRS.map(([q, qd, r, rd, field], i) => (
              <PairRow key={i} i={i} q={q} qd={qd} r={r} rd={rd} field={!!field} showQ={gq} showR={res} match={res && !!field} />
            ))}
          </div>
          <Trips n={gq ? 1 : 0} strong={end}>
            <span className="gqf-caveat">
              <Tag show={end} tone="idle">
                ingen indbygget caching
              </Tag>
            </span>
          </Trips>
        </section>
      </div>
    </div>
  )
}

function PairRow(p: { i: number; q: string; qd: number; r: string; rd: number; field: boolean; showQ: boolean; showR: boolean; match: boolean }) {
  const cell = (show: boolean, base: number) => ({
    initial: false as const,
    animate: { opacity: show ? 1 : 0, x: show ? 0 : -4 },
    transition: show ? stagger(p.i, base, 0.06) : t.fade,
  })
  return (
    <>
      <motion.span className="gqf-q gqf-cell" data-empty={!p.q || undefined} data-match={p.match || undefined} style={indent(p.qd)} {...cell(p.showQ, 0.1)}>
        {p.q}
      </motion.span>
      <motion.span className="gqf-r gqf-cell" data-match={p.match || undefined} style={indent(p.rd)} {...cell(p.showR, 0.15)}>
        {p.r}
      </motion.span>
    </>
  )
}

const viz: VizDef = {
  id: 'graphql-fetch',
  title: 'Over- og underfetching i REST og GraphQL',
  steps: [
    {
      caption: 'Flight-siden skal bruge `origin`, `destination` og passagerernes navne. Til venstre REST, til højre GraphQL.',
      hold: 2000,
    },
    { caption: 'REST: `GET /flights/1234` returnerer ressourcens properties — alle sammen.', hold: 2000 },
    {
      caption: 'Siden bruger kun to af felterne. Resten er **over-fetching**: data der sendes, parses og smides væk.',
      hold: 2600,
    },
    {
      caption: 'Passagererne ligger i en anden ressource, så der skal et kald mere til. Det er **under-fetching**: for lidt data pr. kald, for mange kald.',
      hold: 2800,
    },
    {
      caption: 'GraphQL: én `POST` til `/graphql`. Forespørgslen nævner præcis de felter, siden skal bruge — også de indlejrede.',
      hold: 2400,
    },
    {
      caption: 'Svaret har **samme form** som forespørgslen: de samme felter i samme indlejring — og intet andet.',
      hold: 3000,
    },
    {
      caption:
        'To rundture mod én. Prisen: alt går til ét endpoint med forskellige svar, så GraphQL har **ingen indbygget caching**.',
      hold: 3000,
    },
  ],
  Component: GraphqlFetch,
}

export default viz
