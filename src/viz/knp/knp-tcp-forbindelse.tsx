import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './knp-tcp-forbindelse.css'

/* Kurose & Ross (Global Ed.):
   – Three-way handshake, figur 3.39 (s. 280) og trin 1–3 s. 279–280:
     SYN=1, seq=client_isn · SYN=1, seq=server_isn, ack=client_isn+1 · SYN=0, seq=client_isn+1, ack=server_isn+1.
   – Nedlukning, figur 3.40 (s. 281): FIN, ACK, FIN, ACK, “Timed wait”, Closed. Bogen viser ingen seq/ack her.
   – Tilstande: klient figur 3.41 (s. 282), server figur 3.42 (s. 283). TIME_WAIT: figuren skriver
     “Wait 30 seconds”, teksten “typical values are 30 seconds, 1 minute, and 2 minutes”. */

interface Msg {
  dir: 'right' | 'left'
  label: ReactNode
  /** Tilstand efter hændelsen (klient venstre, server højre). */
  client?: string
  server?: string
  at: number
}

const OPEN: Msg[] = [
  { dir: 'right', label: <>SYN=1, seq=client_isn</>, client: 'SYN_SENT', server: 'SYN_RCVD', at: 1 },
  {
    dir: 'left',
    label: (
      <>
        SYN=1, seq=server_isn, <wbr />
        ack=client_isn+1
      </>
    ),
    client: 'ESTABLISHED',
    at: 2,
  },
  {
    dir: 'right',
    label: (
      <>
        SYN=0, seq=client_isn+1, <wbr />
        ack=server_isn+1
      </>
    ),
    server: 'ESTABLISHED',
    at: 3,
  },
]

const CLOSE: Msg[] = [
  { dir: 'right', label: 'FIN', client: 'FIN_WAIT_1', server: 'CLOSE_WAIT', at: 4 },
  { dir: 'left', label: 'ACK', client: 'FIN_WAIT_2', at: 4 },
  { dir: 'left', label: 'FIN', server: 'LAST_ACK', at: 5 },
  { dir: 'right', label: 'ACK', client: 'TIME_WAIT', server: 'CLOSED', at: 5 },
]

function State({ name, on, now }: { name?: string; on: boolean; now: boolean }) {
  return (
    <motion.span
      className="ktc-state mono"
      data-now={now || undefined}
      initial={false}
      animate={{ opacity: on && name ? 1 : 0 }}
      transition={on ? t.settle : t.fade}
    >
      {name ?? ''}
    </motion.span>
  )
}

function Arrow({ m, step, delay = 0 }: { m: Msg; step: number; delay?: number }) {
  const on = step >= m.at
  const now = step === m.at
  return (
    <div className="ktc-msg" data-dir={m.dir} data-now={now || undefined}>
      <motion.span
        className="ktc-label mono"
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={on ? { ...t.fade, delay: delay + 0.35 } : t.fade}
      >
        {m.label}
      </motion.span>
      <span className="ktc-track">
        <motion.span
          className="ktc-line"
          initial={false}
          animate={{ scaleX: on ? 1 : 0 }}
          transition={on ? { ...t.travel, delay } : t.fade}
        />
      </span>
    </div>
  )
}

function Row({ m, step, delay }: { m: Msg; step: number; delay?: number }) {
  const on = step >= m.at
  const now = step === m.at
  return (
    <li className="ktc-row">
      <State name={m.client} on={on} now={now} />
      <Arrow m={m} step={step} delay={delay} />
      <State name={m.server} on={on} now={now} />
    </li>
  )
}

function Handshake({ step }: { step: number }) {
  const last = step >= 6
  return (
    <div className="ktc">
      <div className="ktc-row ktc-top">
        <span className="ktc-host">Klient</span>
        <span />
        <span className="ktc-host">Server</span>
      </div>
      <div className="ktc-row">
        <State name="CLOSED" on now={step === 0} />
        <span className="ktc-mid vcaps">tilstand før</span>
        <State name="LISTEN" on now={step === 0} />
      </div>

      <p className="ktc-phase vcaps">Three-way handshake · figur 3.39</p>
      <ol className="ktc-list">
        {OPEN.map((m, i) => (
          <Row key={i} m={m} step={step} />
        ))}
      </ol>

      <p className="ktc-phase vcaps">Nedlukning · figur 3.40 (bogen viser kun flag)</p>
      <ol className="ktc-list">
        {CLOSE.map((m, i) => (
          <Row key={i} m={m} step={step} delay={i % 2 === 1 ? 0.7 : 0} />
        ))}
      </ol>

      <div className="ktc-row">
        <State name="CLOSED" on={last} now={step === 6} />
        <motion.span
          className="ktc-mid ktc-wait"
          initial={false}
          animate={{ opacity: last ? 1 : 0 }}
          transition={last ? t.settle : t.fade}
        >
          timed wait, fx 30 s → ressourcer og port frigives
        </motion.span>
        <span />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-tcp-forbindelse',
  title: 'TCP-forbindelsen fra SYN til TIME_WAIT',
  steps: [
    {
      caption: 'Klienten starter i `CLOSED`, serveren lytter i `LISTEN` på en velkomst-socket.',
      hold: 1800,
    },
    {
      caption: '**SYN**: SYN-bit sat, ingen data, og et tilfældigt `client_isn` som sekvensnummer.',
      hold: 2400,
    },
    {
      caption: '**SYNACK**: serveren allokerer buffere, vælger sit eget `server_isn` og kvitterer med `ack = client_isn+1`.',
      hold: 2800,
    },
    {
      caption: '**ACK**: klienten kvitterer med `ack = server_isn+1` og SYN = 0. Dette segment må allerede bære data.',
      hold: 2600,
    },
    {
      caption: 'Klienten lukker: **FIN**. Serveren kvitterer og står i `CLOSE_WAIT`; klienten venter i `FIN_WAIT_2` på serverens FIN.',
      hold: 3000,
    },
    {
      caption: 'Serveren sender sin egen **FIN**, klienten kvitterer, og serveren er lukket.',
      hold: 2400,
    },
    {
      caption: 'Klienten bliver i `TIME_WAIT` for at kunne sende den sidste ACK igen, hvis den tabes. Figur 3.41 skriver 30 s; teksten siger 30 s, 1 eller 2 min.',
      hold: 3200,
    },
  ],
  Component: Handshake,
}

export default viz
