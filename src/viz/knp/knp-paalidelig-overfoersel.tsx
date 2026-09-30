import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './knp-paalidelig-overfoersel.css'

/* Kurose & Ross (Global Ed.):
   – Go-Back-N, figur 3.22 (s. 250), tekst s. 249: vindue N = 4, pkt0–3 sendes, pkt2 tabes;
     modtageren smider pkt3, 4, 5 væk og sender ACK1 hver gang; ACK0 → pkt4, ACK1 → pkt5;
     timeout for pkt2 → pkt2, 3, 4, 5 sendes igen; rcv pkt2 deliver/ACK2, rcv pkt3 deliver/ACK3.
   – Selective Repeat, figur 3.26 (s. 253): samme forløb; pkt3, 4, 5 bufferes (ACK3, ACK4, ACK5);
     pkt2 TIMEOUT → kun pkt2 igen; pkt2 rcvd → pkt2–5 leveres, ACK2; ACK3 rcvd, nothing sent.
   Sekvensnumrene 0–7 vises; figur 3.26 viser 0–9. */

const SEQ = [0, 1, 2, 3, 4, 5, 6, 7]
const N = 4

type Proto = 'gbn' | 'sr'
type SndState = 'acked' | 'sent' | 'resent' | 'usable' | 'nope'
type RcvState = 'delivered' | 'buffered' | 'discarded' | 'lost' | 'expected' | 'none'

function sender(p: Proto, step: number, i: number): SndState {
  const base = step >= 3 ? 2 : 0
  if (i < base) return 'acked'
  if (p === 'sr' && step >= 5 && i === 3) return 'acked' // ACK3 rcvd, nothing sent
  if (i >= base + N) return 'nope'
  const sentUpTo = step >= 3 ? 5 : step >= 1 ? 3 : -1
  if (i > sentUpTo) return 'usable'
  if (step >= 4 && (p === 'gbn' ? i >= 2 && i <= 5 : i === 2)) return 'resent'
  return 'sent'
}

function receiver(p: Proto, step: number, i: number): RcvState {
  if (step >= 5 && i <= 5) return 'delivered'
  if (step >= 1 && i <= 1) return 'delivered'
  if (step >= 1 && i === 2) return 'lost'
  const arrived = (i === 3 && step >= 2) || ((i === 4 || i === 5) && step >= 3)
  if (arrived) return p === 'gbn' ? 'discarded' : 'buffered'
  if (step === 0 && i === 0) return 'expected'
  return 'none'
}

const RCV_MARK: Record<RcvState, string> = {
  delivered: '✓',
  buffered: '+',
  discarded: '−',
  lost: '✕',
  expected: '',
  none: '',
}

const LOG: Record<Proto, string[]> = {
  gbn: [
    'Vinduet dækker pkt0–3.',
    'pkt0, 1 leveret → ACK0, ACK1 · pkt2 tabt',
    'pkt3 uden for rækkefølge: kasseret → ACK1',
    'ACK0, ACK1 → pkt4, 5 sendt · kasseret → ACK1, ACK1',
    'timeout pkt2 → pkt2, 3, 4, 5 sendt igen',
    'pkt2 → ACK2, pkt3 → ACK3 … leveret i rækkefølge',
  ],
  sr: [
    'Vinduet dækker pkt0–3.',
    'pkt0, 1 leveret → ACK0, ACK1 · pkt2 tabt',
    'pkt3 uden for rækkefølge: bufferet → ACK3',
    'ACK0, ACK1 → pkt4, 5 sendt · bufferet → ACK4, ACK5',
    'timeout pkt2 → kun pkt2 sendt igen',
    'pkt2 modtaget → pkt2–5 leveret samlet, ACK2',
  ],
}

function Row({ kind, p, step }: { kind: 'snd' | 'rcv'; p: Proto; step: number }) {
  const base = kind === 'snd' ? (step >= 3 ? 2 : 0) : null
  return (
    <div className="kgs-row">
      <span className="kgs-who">{kind === 'snd' ? 'afsender' : 'modtager'}</span>
      <div className="kgs-cells">
        {base !== null && (
          <motion.span
            className="kgs-win"
            aria-hidden="true"
            initial={false}
            animate={{ left: `${(base / SEQ.length) * 100}%` }}
            transition={t.settle}
            style={{ width: `${(N / SEQ.length) * 100}%` }}
          />
        )}
        {SEQ.map((i) => {
          const s = kind === 'snd' ? sender(p, step, i) : receiver(p, step, i)
          return (
            <span key={i} className="kgs-cell" data-s={s}>
              <span className="kgs-num mono">{i}</span>
              {kind === 'rcv' && (
                <motion.span
                  className="kgs-lab"
                  initial={false}
                  animate={{ opacity: RCV_MARK[s as RcvState] ? 1 : 0 }}
                  transition={RCV_MARK[s as RcvState] ? stagger(i, 0.1, 0.05) : t.fade}
                >
                  {RCV_MARK[s as RcvState] || '·'}
                </motion.span>
              )}
            </span>
          )
        })}
      </div>
    </div>
  )
}

function Panel({ p, step }: { p: Proto; step: number }) {
  const resent = p === 'gbn' ? 4 : 1
  return (
    <section className="kgs-panel">
      <header className="kgs-head">
        <span className="kgs-name">{p === 'gbn' ? 'Go-Back-N' : 'Selective Repeat'}</span>
        <span className="vcaps">{p === 'gbn' ? 'figur 3.22' : 'figur 3.26'} · N = 4</span>
      </header>
      <Row kind="snd" p={p} step={step} />
      <Row kind="rcv" p={p} step={step} />
      <Swap
        show={step}
        className="kgs-log"
        items={LOG[p].map((l, i) => (
          <p key={i} className="kgs-line">
            {l}
          </p>
        ))}
      />
      <div className="kgs-sum">
        <Tag show={at(step, 4)} tone={p === 'gbn' ? 'neg' : 'focus'}>
          {resent} {resent === 1 ? 'pakke' : 'pakker'} sendt igen
        </Tag>
      </div>
    </section>
  )
}

function GbnSr({ step }: { step: number }) {
  return (
    <div className="kgs">
      <div className="kgs-panels">
        <Panel p="gbn" step={step} />
        <Panel p="sr" step={step} />
      </div>
      <ul className="kgs-key" aria-label="Forklaring">
        <li><span className="kgs-sw" data-s="acked" /> kvitteret</li>
        <li><span className="kgs-sw" data-s="sent" /> sendt, ikke kvitteret</li>
        <li><span className="kgs-sw" data-s="resent" /> sendt igen</li>
        <li><span className="kgs-sw" data-s="usable" /> må sendes</li>
        <li><span className="kgs-sw kgs-sw-win" /> vindue</li>
      </ul>
      <ul className="kgs-key" aria-label="Forklaring, modtager">
        <li><span className="kgs-mk" data-s="delivered">✓</span> leveret</li>
        <li><span className="kgs-mk" data-s="buffered">+</span> bufferet</li>
        <li><span className="kgs-mk" data-s="discarded">−</span> kasseret</li>
        <li><span className="kgs-mk" data-s="lost">✕</span> tabt</li>
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-paalidelig-overfoersel',
  title: 'Go-Back-N og Selective Repeat ved ét tabt segment',
  steps: [
    {
      caption: 'Begge protokoller har vindue **N = 4**: afsenderen må have pkt0–3 ude uden kvittering. Bogen bruger samme forløb til begge.',
      hold: 2200,
    },
    { caption: 'pkt0–3 sendes. pkt0 og pkt1 kommer frem og leveres; **pkt2 tabes**.', hold: 2200 },
    {
      caption: 'pkt3 kommer uden for rækkefølge. **GBN** smider den væk og sender ACK1 igen; **SR** gemmer den og kvitterer ACK3.',
      hold: 3000,
    },
    {
      caption: 'ACK0 og ACK1 skubber vinduet til pkt2–5, så pkt4 og pkt5 sendes. GBN kasserer dem også; SR bufferer.',
      hold: 3000,
    },
    {
      caption: 'pkt2’s timer udløber. **GBN** sender hele vinduet igen — pkt2, 3, 4 og 5. **SR** sender kun pkt2.',
      hold: 3000,
    },
    {
      caption: 'Resultatet er det samme: pkt2–5 leveres i rækkefølge. Forskellen er prisen — fire genudsendelser mod én, og SR’s modtager skal have buffer.',
      hold: 3200,
    },
  ],
  Component: GbnSr,
}

export default viz
