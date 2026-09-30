import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './knp-lagdeling-indkapsling.css'

/* Kilder: slide 13 «Encapsulation» i «Chapter_1_(… part 2).pdf» og Kurose & Ross fig. 1.24,
   s. 82–83. Kilde og destination har fem lag, link-layer switchen lag 1–2 (link, physical),
   routeren lag 1–3 (network, link, physical). Navnene message/segment/datagram/frame og
   headerne Ht, Hn, Hl er slidens og bogens. «bits» på det fysiske lag: bog s. 82. */

const LAYERS = ['application', 'transport', 'network', 'link', 'physical'] as const
type Layer = (typeof LAYERS)[number]
type H = 'l' | 'n' | 't' | 'M' | 'bits'

const PDU_NAME: Record<Layer, string> = {
  application: 'message',
  transport: 'segment',
  network: 'datagram',
  link: 'frame',
  physical: 'bits',
}

const PDU: Record<Layer, H[]> = {
  application: ['M'],
  transport: ['t', 'M'],
  network: ['n', 't', 'M'],
  link: ['l', 'n', 't', 'M'],
  physical: ['bits'],
}

interface Col {
  id: string
  name: string
  has: Layer[]
  span: string
  /** Trin, hvor hvert lag i kolonnen får sin PDU (og er "her nu"). */
  at: Partial<Record<Layer, number>>
  hosts?: boolean
}

const COLS: Col[] = [
  {
    id: 'src',
    name: 'kilde',
    has: [...LAYERS],
    span: '5 lag',
    at: { application: 0, transport: 1, network: 2, link: 3, physical: 3 },
    hosts: true,
  },
  { id: 'sw', name: 'link-layer switch', has: ['link', 'physical'], span: 'lag 1–2', at: { physical: 4, link: 4 } },
  { id: 'rt', name: 'router', has: ['network', 'link', 'physical'], span: 'lag 1–3', at: { physical: 5, link: 5, network: 5 } },
  {
    id: 'dst',
    name: 'destination',
    has: [...LAYERS],
    span: '5 lag',
    at: { physical: 6, link: 6, network: 6, transport: 6, application: 6 },
    hosts: true,
  },
]

const Hdr = ({ h }: { h: H }): ReactNode =>
  h === 'M' ? 'M' : h === 'bits' ? '0110…' : (
    <>
      H<sub>{h}</sub>
    </>
  )

function Pdu({ items, show, fresh, delay = 0 }: { items: H[]; show: boolean; fresh?: H; delay?: number }) {
  return (
    <span className="kli-pdu">
      {items.map((h, i) => (
        <motion.span
          key={h}
          className="kli-chip"
          data-h={h}
          data-fresh={fresh === h || undefined}
          initial={false}
          animate={show ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: h === items[0] && items.length > 1 ? -10 : 0, scale: 0.9 }}
          transition={show ? { ...t.place, delay: delay + (items.length - 1 - i) * 0.06 } : t.fade}
        >
          <span>
            <Hdr h={h} />
          </span>
        </motion.span>
      ))}
    </span>
  )
}

function Encap({ step }: { step: number }) {
  const s = Math.min(step, 7)
  return (
    <div className="kli">
      {COLS.map((c) => (
        <section key={c.id} className="kli-col" data-col={c.id}>
          <header className="kli-head">
            <span className="kli-name">{c.name}</span>
            <motion.span
              className="kli-span"
              initial={false}
              animate={{ opacity: s >= 7 ? 1 : 0 }}
              transition={s >= 7 ? t.place : t.fade}
            >
              {c.span}
            </motion.span>
          </header>
          <ol className="kli-stack">
            {LAYERS.map((l) => {
              const has = c.has.includes(l)
              const at = c.at[l]
              const shown = has && at !== undefined && s >= at
              const now = has && at === s
              // Hvilken header kom til lige her? Kun på vejen ned i kilden.
              const fresh = c.id === 'src' && now && l !== 'physical' ? PDU[l][0] : undefined
              return (
                <li key={l} className="kli-cell" data-has={has || undefined} data-tone={now ? 'focus' : shown ? 'ok' : 'idle'}>
                  {has ? (
                    <>
                      <span className="kli-layer">
                        {l}
                        {c.hosts && <span className="kli-unit"> · {PDU_NAME[l]}</span>}
                      </span>
                      <Pdu items={PDU[l]} show={shown} fresh={fresh} delay={c.id === 'src' ? 0 : (4 - LAYERS.indexOf(l)) * 0.16} />
                    </>
                  ) : (
                    <span className="kli-none" aria-hidden="true" />
                  )}
                </li>
              )
            })}
          </ol>
        </section>
      ))}
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-lagdeling-indkapsling',
  title: 'Indkapsling ned og op gennem stakken',
  steps: [
    { caption: 'Applikationen i kilden har en **message** `M`.', hold: 1600 },
    {
      caption: 'Transportlaget lægger sin header `Ht` foran: **segment**. Headeren bruges af modtagerens transportlag.',
      hold: 2200,
    },
    { caption: 'Netværkslaget tilføjer `Hn` med bl.a. afsender- og modtageradresse: **datagram**.', hold: 2200 },
    {
      caption: 'Linklaget tilføjer `Hl`: **frame**. Det fysiske lag sender de enkelte bits ud på linket.',
      hold: 2400,
    },
    {
      caption: '**Link-layer switchen** har kun lag 1–2. Den pakker op til rammen, læser `Hl` og sender den videre — IP-adresser kender den ikke.',
      hold: 3000,
    },
    {
      caption: '**Routeren** har lag 1–3. Den pakker ud til datagrammet, læser `Hn` for at finde næste hop og lægger det i en ramme igen.',
      hold: 3000,
    },
    {
      caption: 'I **destinationen** fjerner hvert lag sin header på vejen op, til applikationen står med `M`.',
      hold: 2600,
    },
    {
      caption: 'Slutbilledet: kun hosts har alle fem lag. Switchen stopper ved link, routeren ved network — kompleksiteten ligger i kanten.',
      hold: 3200,
    },
  ],
  Component: Encap,
}

export default viz
