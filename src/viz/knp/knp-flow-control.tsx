import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './knp-flow-control.css'

/* Kurose & Ross (Global Ed.) 3.5.5, s. 276–278, figur 3.38:
   rwnd = RcvBuffer − [LastByteRcvd − LastByteRead]; B sender rwnd i hvert segment;
   A holder LastByteSent − LastByteAcked ≤ rwnd; ved rwnd = 0 sender A segmenter med én databyte.
   Bogen giver ingen tal. RcvBuffer = 8 byte og byte-antallene er ILLUSTRATIVE (står også i figuren). */

const BUF = 8

interface Frame {
  /** Bytenumre der ligger ulæst i B’s buffer, fra venstre. */
  buf: number[]
  rcvd: number
  read: number
  /** Hvad der er på vej: data A → B eller ACK B → A. */
  data?: string
  ack?: string
  sender: string
  /** Hvad der sker i kanalen. */
  chan: string
  senderTone: 'idle' | 'focus' | 'neg' | 'ok'
}

const F: Frame[] = [
  { buf: [], rcvd: 0, read: 0, sender: 'må sende ≤ 8 byte', chan: 'Intet i kanalen endnu.', senderTone: 'idle' },
  { buf: [1, 2, 3], rcvd: 3, read: 0, data: 'byte 1–3', ack: 'ACK · rwnd = 5', sender: 'må sende ≤ 5 byte', chan: 'rwnd rejser med hver ACK tilbage til A.', senderTone: 'focus' },
  { buf: [1, 2, 3, 4, 5, 6, 7, 8], rcvd: 8, read: 0, data: 'byte 4–8', ack: 'ACK · rwnd = 0', sender: 'blokeret: rwnd = 0', chan: 'A stopper — den må ikke overfylde bufferen.', senderTone: 'neg' },
  { buf: [5, 6, 7, 8], rcvd: 8, read: 4, sender: 'hører intet — stadig blokeret', chan: 'B har hverken data eller ACK at sende — ingen ny rwnd når frem.', senderTone: 'neg' },
  { buf: [5, 6, 7, 8, 9], rcvd: 9, read: 4, data: 'byte 9 (1 byte)', ack: 'ACK · rwnd = 3', sender: 'må sende ≤ 3 byte', chan: '1-byte-segmentet tvinger en ACK med ny rwnd frem.', senderTone: 'ok' },
]

function FlowControl({ step }: { step: number }) {
  const f = F[Math.min(step, F.length - 1)]
  const rwnd = BUF - (f.rcvd - f.read)
  return (
    <div className="kfc">
      <p className="kfc-note vcaps">Illustrative tal: bogen giver ingen — RcvBuffer = 8 byte er valgt her.</p>

      <div className="kfc-hosts">
        <section className="kfc-host">
          <span className="kfc-name">Vært A · afsender</span>
          <code className="kfc-rule">LastByteSent − LastByteAcked&nbsp;≤&nbsp;rwnd</code>
          <Swap
            show={step}
            items={F.map((x, i) => (
              <Tag key={i} tone={x.senderTone === 'ok' ? 'focus' : x.senderTone} wrap>
                {x.sender}
              </Tag>
            ))}
          />
        </section>

        <div className="kfc-chan">
          <div className="kfc-lane" data-dir="right">
            <Swap
              show={step}
              className="kfc-slot"
              items={F.map((x, i) => (x.data ? <Tag key={i} tone="focus">{x.data}</Tag> : <span key={i} />))}
            />
            <span className="kfc-arrow" aria-hidden="true">
              →
            </span>
          </div>
          <div className="kfc-lane" data-dir="left">
            <span className="kfc-arrow" aria-hidden="true">
              ←
            </span>
            <Swap
              show={step}
              className="kfc-slot"
              items={F.map((x, i) =>
                x.ack ? (
                  <Tag key={i} tone={x.ack.endsWith('= 0') ? 'neg' : 'idle'}>
                    {x.ack}
                  </Tag>
                ) : (
                  <span key={i} />
                ),
              )}
            />
          </div>
          <Swap
            show={step}
            items={F.map((x, i) => (
              <p key={i} className="kfc-silence" data-neg={i === 3 || undefined}>
                {x.chan}
              </p>
            ))}
          />
        </div>

        <section className="kfc-host">
          <span className="kfc-name">Vært B · modtager</span>
          <div className="kfc-buf" aria-label={`Receive buffer, ${f.buf.length} af ${BUF} byte optaget`}>
            {Array.from({ length: BUF }, (_, i) => {
              const b = f.buf[i]
              return (
                <span key={i} className="kfc-cell" data-full={b !== undefined || undefined}>
                  <motion.span
                    className="mono"
                    initial={false}
                    animate={{ opacity: b !== undefined ? 1 : 0 }}
                    transition={b !== undefined ? stagger(i, 0, 0.05) : t.fade}
                  >
                    {b ?? ''}
                  </motion.span>
                </span>
              )
            })}
          </div>
          <div className="kfc-scale">
            <span>← applikationen læser herfra</span>
            <span className="kfc-rwnd" data-zero={rwnd === 0 || undefined}>
              rwnd = {rwnd}
            </span>
          </div>
          <dl className="kfc-vars">
            <div>
              <dt>RcvBuffer</dt>
              <dd>{BUF}</dd>
            </div>
            <div>
              <dt>LastByteRcvd</dt>
              <dd>{f.rcvd}</dd>
            </div>
            <div>
              <dt>LastByteRead</dt>
              <dd>{f.read}</dd>
            </div>
          </dl>
          <code className="kfc-rule">
            rwnd = {BUF} − [{f.rcvd} − {f.read}] = {rwnd}
          </code>
        </section>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-flow-control',
  title: 'Receive window der fyldes og tømmes',
  steps: [
    {
      caption: 'B’s buffer er tom, så `rwnd = RcvBuffer`. A må have så mange ukvitterede bytes ude.',
      hold: 2200,
    },
    {
      caption: 'A sender 3 byte. B’s applikation læser ikke endnu, så der er 5 byte fri — B skriver **rwnd = 5** i sin ACK.',
      hold: 2800,
    },
    {
      caption: 'A sender de 5 byte, den må. Bufferen er fuld, og B annoncerer **rwnd = 0**: A må ikke sende mere.',
      hold: 2800,
    },
    {
      caption: 'Applikationen læser 4 byte, og der er plads igen. Men B sender kun, når den har data eller en ACK — så A får det ikke at vide.',
      hold: 3200,
    },
    {
      caption: 'Derfor sender A **segmenter med én byte**, når rwnd er 0. Kvitteringen bærer den nye værdi, **rwnd = 3**, og A kan sende igen.',
      hold: 3200,
    },
  ],
  Component: FlowControl,
}

export default viz
