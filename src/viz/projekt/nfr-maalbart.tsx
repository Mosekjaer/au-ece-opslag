import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './nfr-maalbart.css'

/* Kravene er ordrette fra System Specification.pdf slide 24 (usability) og 29
   (performance) og fra TTT_Accepttestspecifikation.pdf s. 10–11 (tabel 15 og 16).
   Opdelingen i "hvad måles / grænse / betingelse" er guidens. */

interface Variant {
  short: string
  text: string
  src: string
  what: string
  limit: string
  cond: string
}

const VARIANTS: Variant[] = [
  { short: 'easy to use', text: '“The system should be easy to use”', src: 'slide 24', what: '?', limit: '?', cond: '?' },
  {
    short: 'lær en funktion på 10 min',
    text: '“Time to learn a certain functionality (e.g. within 10 minutes)”',
    src: 'slide 24',
    what: 'tid til at lære en funktion',
    limit: 'højst 10 min',
    cond: 'en bestemt funktion',
  },
  {
    short: '95 % under 1 s ved 80 % load',
    text: '“95% of the transactions shall be processed in less than 1 second at 80 % load”',
    src: 'slide 29',
    what: 'behandlingstid pr. transaktion',
    limit: '< 1 s for 95 %',
    cond: 'ved 80 % load',
  },
  {
    short: 'vindue under 1 s',
    text: '“Reaktionstiden mellem hvert vindue skal være under 1 sekund”',
    src: 'TTT, tabel 16',
    what: 'reaktionstid mellem vinduer',
    limit: '< 1 s',
    cond: 'fra tryk til næste vindue',
  },
  {
    short: '170 × 170 × 40 (± 10)',
    text: '“Spillepladens dimensioner skal være: 170 x 170 x 40 (± 10)”',
    src: 'TTT, tabel 15',
    what: 'spillepladens mål',
    limit: '170 × 170 × 40',
    cond: 'tolerance ± 10',
  },
]

const TESTS = [
  {
    krav: 'Reaktionstid < 1 s',
    how: 'Stopur: start ved tryk på GUI, stop når næste vindue vises',
    actual: '0,1 s',
  },
  {
    krav: '170 × 170 × 40 (± 10)',
    how: 'Mål spillepladen med målebånd/lineal',
    actual: '170 × 170 × 30',
  },
]

const PARTS = [
  { key: 'what', label: 'Hvad måles' },
  { key: 'limit', label: 'Grænseværdi' },
  { key: 'cond', label: 'Betingelse' },
] as const

function NfrMaalbart({ step }: { step: number }) {
  const vague = step === 0
  return (
    <div className="nfm">
      <div className="nfm-req" data-vague={vague || undefined}>
        <div className="nfm-req-head">
          <span className="vcaps">Kravet</span>
          <Swap
            className="nfm-verdict"
            show={vague ? 0 : 1}
            items={[
              <Tag key="n" tone="neg">
                ikke verificerbart
              </Tag>,
              <Tag key="o" tone="focus">
                målbart
              </Tag>,
            ]}
          />
        </div>
        <Swap
          show={step}
          items={VARIANTS.map((v) => (
            <div key={v.src + v.limit} className="nfm-text">
              <p>{v.text}</p>
              <span className="nfm-src">{v.src}</span>
            </div>
          ))}
        />
      </div>

      <ol className="nfm-trail" aria-label="Eksemplerne">
        {VARIANTS.map((v, j) => (
          <motion.li
            key={v.short}
            className="nfm-crumb"
            data-tone={j === 0 ? 'neg' : 'ok'}
            data-now={j === step || undefined}
            initial={false}
            animate={{ opacity: j <= step ? 1 : 0 }}
            transition={j <= step ? t.settle : t.fade}
          >
            {v.short}
          </motion.li>
        ))}
      </ol>

      <div className="nfm-parts">
        {PARTS.map((p, i) => (
          <div key={p.key} className="nfm-part" data-vague={vague || undefined}>
            <span className="vcaps">{p.label}</span>
            <Swap
              show={step}
              items={VARIANTS.map((v, j) => (
                <motion.span
                  key={j}
                  className="nfm-val"
                  initial={false}
                  animate={{ y: j === step ? 0 : 4 }}
                  transition={j === step ? stagger(i, 0.1, 0.12) : t.fade}
                >
                  {v[p.key]}
                </motion.span>
              ))}
            />
          </div>
        ))}
      </div>

      <div className="nfm-test">
        <div className="nfm-test-title">
          <span className="vcaps">Accepttest af ikke-funktionelle krav</span>
          <span className="nfm-src">TTT, afsnit 4</span>
        </div>
        <div className="nfm-trow nfm-thead" aria-hidden="true">
          <span>Krav</span>
          <span>Test / udførelse</span>
          <span>Faktisk</span>
          <span>Vurdering</span>
        </div>
        {TESTS.map((r, i) => {
          const on = at(step, 3 + i)
          return (
            <motion.div
              key={r.krav}
              className="nfm-trow"
              data-now={step === 3 + i || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
              transition={on ? t.settle : t.fade}
            >
              <span className="nfm-k">{r.krav}</span>
              <span className="nfm-how">{r.how}</span>
              <span className="nfm-act">{r.actual}</span>
              <span className="nfm-ok">
                <Tag tone="focus" show={on}>
                  OK
                </Tag>
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'nfr-maalbart',
  title: 'Et vagt krav skærpes, til accepttesten kan afgøre det',
  steps: [
    {
      caption:
        '“The system should be easy to use” — hvad skal måles, og hvornår er det godt nok? Ingen test kan afgøre det.',
      hold: 2400,
    },
    {
      caption:
        'Slidets målbare version: indlæringstid for en funktion, med en **grænseværdi** på 10 minutter.',
      hold: 2600,
    },
    {
      caption:
        'Performance-eksemplet har alle tre dele: **hvad** der måles, **grænsen** (under 1 s for 95 %) og **betingelsen** (80 % load).',
      hold: 3000,
    },
    {
      caption:
        'I TTT-projektets accepttest får kravet en **målemetode** og en faktisk måling: stopuret viser 0,1 s — OK.',
      hold: 3000,
    },
    {
      caption:
        'Tolerancen står i kravet (± 10), så en måling på 30 i stedet for 40 kan vurderes objektivt. Det er det, “verifiable” betyder.',
      hold: 3200,
    },
  ],
  Component: NfrMaalbart,
}

export default viz
