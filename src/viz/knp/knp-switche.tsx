import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, VTable, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-switche.css'

/* Kurose & Ross: den øverste switch i fig. 6.15 (s. 507; interfaces aflæst af
   billedet: 1 Electrical Engineering, 2 Computer Science, 3 Computer Engineering,
   4 mailserver, 5 webserver, 6 router ud til internettet). Switch-tabellen er
   fig. 6.22 (s. 521). Filtrering og forwarding af en frame til 62-FE-F7-11-89-A3
   fra interface 1 og 2 (s. 522). Kl. 9:39 ankommer en frame fra 01-12-23-34-45-56
   på interface 2 og læres (fig. 6.23, s. 523). Bogen giver ikke den frames
   destination; her bruges bogens pladsholder DD-DD-DD-DD-DD-DD (s. 522) som ukendt
   adresse, så flooding vises — kombinationen er illustrativ. Aging time 60 min:
   62-FE-… fjernes kl. 10:32 (s. 523). */

type If = 1 | 2 | 3 | 4 | 5 | 6
const LEFT: { n: If; name: string }[] = [
  { n: 1, name: 'Electrical Engineering' },
  { n: 2, name: 'Computer Science' },
  { n: 3, name: 'Computer Engineering' },
]
const RIGHT: { n: If; name: string }[] = [
  { n: 4, name: 'Mailserver' },
  { n: 5, name: 'Webserver' },
  { n: 6, name: 'Router → internet' },
]

interface Beat {
  in?: If
  out: If[]
  /** Hvilken tabelrække der er i spil. */
  hit?: 'a' | 'c'
}
const BEATS: Beat[] = [
  { out: [] },
  { in: 1, out: [], hit: 'a' },
  { in: 2, out: [1], hit: 'a' },
  { in: 2, out: [1, 3, 4, 5, 6], hit: 'c' },
  { out: [] },
]
const LAST = BEATS.length - 1

const LOG = [
  { at: 1, frame: 'til 62-FE-F7-11-89-A3, ind på 1', res: 'filtreret', tone: 'neg' as Tone },
  { at: 2, frame: 'til 62-FE-F7-11-89-A3, ind på 2', res: 'forward → 1', tone: 'focus' as Tone },
  { at: 3, frame: '9:39 fra 01-12-23-34-45-56 til DD-DD-DD-DD-DD-DD, ind på 2', res: 'flood → 1, 3, 4, 5, 6 · lært', tone: 'focus' as Tone },
  { at: 4, frame: '10:32 — intet fra 62-FE-F7-11-89-A3 i 60 min', res: 'ældet ud', tone: 'neg' as Tone },
]

function Side({ list, side, b }: { list: typeof LEFT; side: 'l' | 'r'; b: Beat }) {
  return (
    <>
      {list.map((s, i) => {
        const incoming = b.in === s.n
        const outgoing = b.out.includes(s.n)
        // Venstre side: ind = →, ud = ←. Højre side omvendt.
        const back = side === 'l' ? outgoing : incoming
        const tone: Tone = incoming ? 'focus' : outgoing ? 'ok' : 'idle'
        return (
          <div key={s.n} className={`sw-row is-${side}`} style={{ gridRow: i + 1 }}>
            <Node className="sw-st" title={s.name} tone={tone} />
            <Link
              className="sw-link"
              on={incoming || outgoing}
              back={back}
              label={<span className="mono">{s.n}</span>}
              tone={incoming || outgoing ? 'focus' : 'idle'}
            />
          </div>
        )
      })}
    </>
  )
}

function Switch({ step }: { step: number }) {
  const b = BEATS[Math.min(step, LAST)]
  const learned = step >= 3
  const aged = step >= 4
  const clock = step >= 4 ? '10:32' : step >= 3 ? '9:39' : '—'

  return (
    <div className="sw">
      <div className="sw-net">
        <Side list={LEFT} side="l" b={b} />
        <div className="sw-box" data-on={b.in ? true : undefined}>
          <span className="sw-box-name">switch</span>
          <span className="sw-box-sub">interfaces 1–6</span>
        </div>
        <Side list={RIGHT} side="r" b={b} />
      </div>

      <div className="sw-bottom">
        <VTable
          name={
            <span className="sw-tname">
              Switch-tabel <Tag tone={step >= 3 ? 'focus' : 'idle'}>kl. {clock}</Tag>
            </span>
          }
          compact
          cols={['Address', 'Interface', 'Time']}
          rows={[
            {
              key: 'c',
              cells: ['01-12-23-34-45-56', '2', '9:39'],
              tone: !learned ? 'ghost' : b.hit === 'c' ? 'focus' : 'idle',
            },
            {
              key: 'a',
              cells: ['62-FE-F7-11-89-A3', '1', '9:32'],
              tone: aged ? 'neg' : b.hit === 'a' ? 'focus' : 'idle',
            },
            { key: 'b', cells: ['7C-BA-B2-B4-91-10', '3', '9:36'] },
          ]}
        />

        <ol className="sw-log">
          {LOG.map((l) => {
            const show = step >= l.at
            return (
              <motion.li
                key={l.at}
                data-now={step === l.at || undefined}
                initial={false}
                animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 5 }}
                transition={show ? t.settle : t.fade}
                aria-hidden={!show || undefined}
              >
                <span className="sw-log-f">{l.frame}</span>
                <Tag tone={l.tone} wrap>
                  {l.res}
                </Tag>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-switche',
  title: 'Self-learning switch: filtrér, forward, flood og glem',
  steps: [
    {
      caption:
        'Den øverste switch i bogens institutionsnet har seks interfaces. Tabellen kender to adresser: `62-FE-…` bag interface 1 og `7C-BA-…` bag interface 3.',
      hold: 2600,
    },
    {
      caption:
        'En frame til `62-FE-F7-11-89-A3` kommer ind på interface **1**. Tabellen siger, at destinationen ligger bag samme interface — framen er allerede nået frem, så switchen **filtrerer** (dropper) den.',
      hold: 3200,
    },
    {
      caption: 'Samme destination, men ind på interface **2**. Nu peger tabellen på et andet interface, og switchen **forwarder** kun til interface 1.',
      hold: 2800,
    },
    {
      caption:
        'Kl. 9:39 kommer en frame fra `01-12-23-34-45-56` ind på 2. Destinationen står ikke i tabellen, så den **floodes** på alle andre interfaces — og kilden **læres**: `01-12-… → 2, 9:39`.',
      hold: 3400,
    },
    {
      caption:
        'Aging time er 60 minutter. Er der intet kommet fra `62-FE-…` mellem 9:32 og 10:32, slettes rækken kl. 10:32.',
      hold: 2800,
    },
  ],
  Component: Switch,
}

export default viz
