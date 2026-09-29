import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './krav-furps-moscow.css'

/* Treasure Robot-kravene fra System Specification.pdf slide 22 (3.-semesterprojekt).
   Modalverbet (must/should) står på sliden og giver MoSCoW direkte. FURPS+-sorteringen
   er guidens, efter Larmans tabel (kap. 5 s. 56–57: Performance dækker bl.a. accuracy og
   resource usage; "+" dækker packaging/fysiske begrænsninger). */

type Furps = 'F' | 'U' | 'R' | 'P' | 'S' | '+'

interface Req {
  id: string
  text: string
  verb: 'must' | 'should'
  furps: Furps
}

const REQS: Req[] = [
  { id: '1.1', text: 'Batteritid mindst 20 min i drift', verb: 'should', furps: 'P' },
  { id: '1.2', text: 'Batteritid mindst 1 time i tomgang', verb: 'should', furps: 'P' },
  { id: '2.1', text: 'Højst 40 × 25 × 15 cm', verb: 'must', furps: '+' },
  { id: '2.2', text: 'Lager nok til at køre og logge i 20 min', verb: 'must', furps: 'P' },
  { id: '2.3', text: 'Gem GPS-position hvert 5. s ± ½ s', verb: 'should', furps: 'P' },
  { id: '3.1', text: 'Find metal i mindst 5 cm dybde på jord/græs', verb: 'must', furps: 'P' },
  { id: '3.2', text: 'Find metal i mindst 3 cm dybde på grus', verb: 'must', furps: 'P' },
  { id: '4.1', text: 'Se en sort kasse 10 × 10 × 10 cm fra 1 m', verb: 'must', furps: 'P' },
  { id: '5.1', text: 'GPS-nøjagtighed 3 m på en klar dag', verb: 'should', furps: 'P' },
  { id: '5.2', text: 'GPS-nøjagtighed 5 m på en overskyet dag', verb: 'should', furps: 'P' },
]

const CATS: { k: Furps; name: string }[] = [
  { k: 'F', name: 'Functionality' },
  { k: 'U', name: 'Usability' },
  { k: 'R', name: 'Reliability' },
  { k: 'P', name: 'Performance' },
  { k: 'S', name: 'Supportability' },
  { k: '+', name: 'Constraints' },
]

const MOSCOW = ['M', 'S', 'C', 'W'] as const

function KravFurpsMoscow({ step }: { step: number }) {
  const showMoscow = at(step, 1)
  const showFurps = at(step, 2)
  const showCover = at(step, 3)
  const count = (m: string) => REQS.filter((r) => (r.verb === 'must' ? 'M' : 'S') === m).length

  return (
    <div className="kfm">
      <div className="kfm-table" role="table" aria-label="Treasure Robot: ikke-funktionelle krav">
        <div className="kfm-row kfm-head" role="row">
          <span role="columnheader">Nr.</span>
          <span role="columnheader">Krav (slide 22)</span>
          <span role="columnheader" className="kfm-c">MoSCoW</span>
          <span role="columnheader" className="kfm-c">FURPS+</span>
        </div>
        {REQS.map((r, i) => {
          const m = r.verb === 'must' ? 'M' : 'S'
          return (
            <div key={r.id} className="kfm-row" role="row" data-focus={step === 1 || undefined}>
              <span className="kfm-id" role="cell">{r.id}</span>
              <span className="kfm-text" role="cell">
                {r.text}{' '}
                <span className="kfm-verb" data-on={showMoscow || undefined}>
                  {r.verb}
                </span>
              </span>
              <span className="kfm-c" role="cell">
                <motion.span
                  className="kfm-cell"
                  data-m={m}
                  initial={false}
                  animate={{ opacity: showMoscow ? 1 : 0, scale: showMoscow ? 1 : 0.85 }}
                  transition={showMoscow ? stagger(i, 0.1, 0.06) : t.fade}
                >
                  {m}
                </motion.span>
              </span>
              <span className="kfm-c" role="cell">
                <motion.span
                  className="kfm-cell"
                  data-f={r.furps === 'P' ? 'p' : 'plus'}
                  initial={false}
                  animate={{ opacity: showFurps ? 1 : 0, scale: showFurps ? 1 : 0.85 }}
                  transition={showFurps ? stagger(i, 0.1, 0.06) : t.fade}
                >
                  {r.furps}
                </motion.span>
              </span>
            </div>
          )
        })}
      </div>

      <div className="kfm-sum">
        <motion.div
          className="kfm-line"
          initial={false}
          animate={{ opacity: showMoscow ? 1 : 0 }}
          transition={t.fade}
        >
          <span className="vcaps">MoSCoW</span>
          <span className="kfm-chips">
            {MOSCOW.map((m) => (
              <span key={m} className="kfm-chip" data-empty={count(m) === 0 || undefined}>
                {m} <b>{count(m)}</b>
              </span>
            ))}
          </span>
          <span className="kfm-note">prioritering — står i kravets verbum</span>
        </motion.div>

        <motion.div className="kfm-line" initial={false} animate={{ opacity: showCover ? 1 : 0 }} transition={t.fade}>
          <span className="vcaps">FURPS+</span>
          <span className="kfm-chips">
            {CATS.map((c, i) => {
              const n = REQS.filter((r) => r.furps === c.k).length
              const tone = c.k === 'F' ? 'muted' : n === 0 ? 'gap' : 'ok'
              return (
                <motion.span
                  key={c.k}
                  className="kfm-chip"
                  data-tone={tone}
                  title={c.name}
                  initial={false}
                  animate={{ opacity: showCover ? 1 : 0, y: showCover ? 0 : 4 }}
                  transition={showCover ? stagger(i, 0.15, 0.08) : t.fade}
                >
                  {c.k} <b>{c.k === 'F' ? '→ UC' : n}</b>
                </motion.span>
              )
            })}
          </span>
          <span className="kfm-note">dækning — tjekliste</span>
        </motion.div>

        <div className="kfm-verdict">
          <Tag tone="neg" show={at(step, 4)} wrap>
            U, R og S er tomme: ingen krav til brugervenlighed, MTBF eller vedligehold
          </Tag>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'krav-furps-moscow',
  title: 'Treasure Robots krav sorteret efter MoSCoW og FURPS+',
  steps: [
    {
      caption:
        'Ti ikke-funktionelle krav fra et 3.-semesterprojekt (slide 22). De er nummereret efter systemdel og alle målbare.',
      hold: 2400,
    },
    {
      caption:
        '**MoSCoW** står allerede i kravet: *must* = M, *should* = S. Prioriteringen er ikke et krav i sig selv — den afgør, hvad der skal være med.',
      hold: 2800,
    },
    {
      caption:
        'Hvert krav sorteres i en **FURPS+**-kategori. Dimensionen er en fysisk begrænsning (+); resten er performance (sorteringen er guidens, efter Larmans tabel).',
      hold: 2800,
    },
    {
      caption:
        'Tæl pr. kategori. *F* dækkes af use cases. Nu kan man se, hvor listen er tynd.',
      hold: 2400,
    },
    {
      caption:
        'FURPS+ som **tjekliste**: ingen krav om usability, reliability eller supportability. Det er det, kategorierne er til — at finde det, man har glemt.',
      hold: 3200,
    },
  ],
  Component: KravFurpsMoscow,
}

export default viz
