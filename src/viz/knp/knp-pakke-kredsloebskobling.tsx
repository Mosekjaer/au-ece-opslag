import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './knp-pakke-kredsloebskobling.css'

/* Kilder (Kurose & Ross, 8. udg. Global Edition):
   - Store-and-forward med tre pakker à L bit, én router, link-rate R, ingen propagation:
     fig. 1.11 og teksten s. 53–54 (L/R, 2L/R, 3L/R, 4L/R; d = N·L/R, lign. 1.1).
   - Hop-eksemplet L = 7.5 Mbits, R = 1.5 Mbps → 5 s: slide 17 i «Chapter_1_(… part 1).pdf».
   - Burst-eksemplet: 10 brugere, én sender 1.000 pakker à 1.000 bit, TDM med 10 slots à
     1.000 bit → 10 s; packet switching ved 1 Mbps → 1 s: bog s. 61.
   - 1 Mbps, 100 kbps pr. aktiv bruger, 10 % aktiv: 10 brugere med kredsløb, 35 med pakker,
     P(≥ 11 aktive) ≈ 0.0004: bog s. 60–61. */

type Where = 'src' | 'rtr' | 'dst'

interface Frame {
  src: number[]
  rtr: number[]
  dst: number[]
  clock: string
  partial?: boolean
}

const FRAMES: Frame[] = [
  { src: [3, 2, 1], rtr: [], dst: [], clock: 't = 0' },
  { src: [3, 2], rtr: [1], dst: [], clock: '0 < t < L/R', partial: true },
  { src: [3, 2], rtr: [1], dst: [], clock: 't = L/R' },
  { src: [3], rtr: [2], dst: [1], clock: 't = 2L/R' },
  { src: [], rtr: [3], dst: [1, 2], clock: 't = 3L/R' },
  { src: [], rtr: [], dst: [1, 2, 3], clock: 't = 4L/R' },
]

const SLOTS = Array.from({ length: 10 }, (_, i) => i)

function Packets({ where, f }: { where: Where; f: Frame }) {
  return (
    <div className="ksf-slots">
      {f[where].map((n) => (
        <Token key={n} id={`ksf-p${n}`} tone={where === 'rtr' && f.partial ? 'muted' : where === 'dst' ? 'idle' : 'focus'}>
          {n}
        </Token>
      ))}
    </div>
  )
}

function Switching({ step }: { step: number }) {
  const f = FRAMES[Math.min(step, FRAMES.length - 1)]
  const sf = Math.min(step, 5)
  const tdm = step >= 6
  const pkt = step >= 7

  return (
    <div className="ksf">
      <section className="ksf-panel">
        <div className="ksf-head">
          <span className="vcaps">Store-and-forward · 3 pakker à L bit · rate R på begge links</span>
          <span className="ksf-clock">
            <motion.code key={f.clock} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={t.settle}>
              {f.clock}
            </motion.code>
          </span>
        </div>

        <div className="ksf-net vflow stack">
          <div className="ksf-node" data-tone={f.src.length ? 'focus' : 'idle'}>
            <span className="ksf-name">kilde</span>
            <Packets where="src" f={f} />
          </div>
          <Link on={sf >= 1} label="R bps" tone={sf >= 1 && sf <= 3 ? 'focus' : 'idle'} />
          <div className="ksf-node is-router" data-tone={f.rtr.length ? 'focus' : 'idle'}>
            <span className="ksf-name">router</span>
            <Packets where="rtr" f={f} />
            <span className="ksf-note">
              <Tag show={!!f.partial} tone="muted">gemmer bits, venter</Tag>
            </span>
          </div>
          <Link on={sf >= 2} label="R bps" tone={sf >= 2 && sf <= 4 ? 'focus' : 'idle'} />
          <div className="ksf-node" data-tone={f.dst.length === 3 ? 'ok' : 'idle'}>
            <span className="ksf-name">destination</span>
            <Packets where="dst" f={f} />
          </div>
        </div>

        <motion.p
          className="ksf-sum"
          initial={false}
          animate={{ opacity: step >= 5 ? 1 : 0 }}
          transition={step >= 5 ? t.settle : t.fade}
        >
          Én pakke: <code>2L/R</code> · tre pakker: <code>4L/R</code> · én pakke over N links: <code>N · L/R</code>.
          Slide 17: <code>L = 7.5 Mbits</code>, <code>R = 1.5 Mbps</code> → 5 s pr. hop.
        </motion.p>
      </section>

      <motion.section
        className="ksf-panel"
        initial={false}
        animate={{ opacity: tdm ? 1 : 0.2 }}
        transition={tdm ? t.settle : t.fade}
      >
        <div className="ksf-head">
          <span className="vcaps">1 Mbps-link, 10 brugere · bruger A sender 1.000 pakker à 1.000 bit</span>
        </div>

        <div className="ksf-lane">
          <span className="ksf-lane-name">
            Circuit switching
            <span className="ksf-lane-sub">TDM, 10 slots pr. frame</span>
          </span>
          <div className="ksf-frame">
            {SLOTS.map((i) => (
              <motion.span
                key={i}
                className="ksf-slot"
                data-fill={tdm ? (i === 0 ? 'a' : 'idle') : 'none'}
                initial={false}
                animate={{ opacity: tdm ? 1 : 0.4 }}
                transition={stagger(i, 0.05, 0.04)}
              >
                {i === 0 ? 'A' : ''}
              </motion.span>
            ))}
          </div>
          <span className="ksf-result">
            <Tag show={tdm} tone="idle">
              10 s
            </Tag>
          </span>
        </div>

        <div className="ksf-lane">
          <span className="ksf-lane-name">
            Packet switching
            <span className="ksf-lane-sub">efter behov, hele linket</span>
          </span>
          <div className="ksf-frame">
            {SLOTS.map((i) => (
              <motion.span
                key={i}
                className="ksf-slot"
                data-fill={pkt ? 'a' : 'none'}
                initial={false}
                animate={{ opacity: pkt ? 1 : 0.4 }}
                transition={stagger(i, 0.05, 0.04)}
              >
                {pkt ? 'A' : ''}
              </motion.span>
            ))}
          </div>
          <span className="ksf-result">
            <Tag show={pkt} tone="ok">
              1 s
            </Tag>
          </span>
        </div>

        <motion.p
          className="ksf-sum"
          initial={false}
          animate={{ opacity: pkt ? 1 : 0 }}
          transition={pkt ? t.settle : t.fade}
        >
          Samme link, brugere der kun er aktive 10 % af tiden med 100 kbps: kredsløb giver plads til <strong>10</strong>,
          pakker til <strong>35</strong> — og P(11 eller flere aktive samtidig) ≈ 0.0004.
        </motion.p>
      </motion.section>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-pakke-kredsloebskobling',
  title: 'Store-and-forward og reserveret kredsløb',
  steps: [
    { caption: 'Kilden har tre pakker à **L** bit. Hvert link sender med **R** bit/s; propagation ignoreres.', hold: 2000 },
    {
      caption:
        'Forenden af pakke 1 er nået routeren, men den må ikke sende endnu: ved **store-and-forward** gemmes bits, til hele pakken er modtaget.',
      hold: 2800,
    },
    {
      caption: 'Ved `t = L/R` har routeren hele pakke 1 og begynder at sende den. Samtidig sender kilden pakke 2.',
      hold: 2400,
    },
    { caption: 'Ved `t = 2L/R` er pakke 1 fremme: én pakke over to links tager `2L/R`.', hold: 2200 },
    { caption: 'Ved `t = 3L/R` er pakke 2 fremme, og routeren sender pakke 3.', hold: 1800 },
    {
      caption: 'Ved `t = 4L/R` er alle tre fremme. Generelt tager én pakke over **N** links `N · L/R`.',
      hold: 2800,
    },
    {
      caption:
        '**Circuit switching** (TDM): bruger A har én fast slot pr. frame. De ni andre slots er reserveret til brugere, der intet sender — de står tomme. 1 Mbit tager **10 s**.',
      hold: 3200,
    },
    {
      caption:
        '**Packet switching** deler linket efter behov: A får hele 1 Mbps, og samme data tager **1 s**. Prisen er, at pakker kan komme til at vente i kø.',
      hold: 3400,
    },
  ],
  Component: Switching,
}

export default viz
