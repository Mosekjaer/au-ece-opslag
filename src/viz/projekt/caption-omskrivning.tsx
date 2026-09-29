import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './caption-omskrivning.css'

/* Skabelonens Figur 5.1 (report_template.pdf s. 22–23, klassediagram for Drinkbot 4000’s
   backend, her forenklet) får sin pladsholder-caption skrevet om efter ISE’s regler
   (God_rapportskrivning.pdf slide 9, 23–24) og sem4’s figurregler (studie-figurer). */

type Kind = 'boundary' | 'control' | 'domain'

const BOTTOM: { name: string; label: ReactNode; kind: Kind }[] = [
  { name: 'RFIDAdapter', label: <>RFID&shy;Adapter</>, kind: 'boundary' },
  { name: 'BankGateway', label: <>Bank&shy;Gateway</>, kind: 'boundary' },
  { name: 'SkænkningsAdapter', label: <>Skænknings&shy;Adapter</>, kind: 'boundary' },
  { name: 'Ordre', label: 'Ordre', kind: 'domain' },
  { name: 'Katalog', label: 'Katalog', kind: 'domain' },
]

const CHECKS: { text: string; src: 'ISE' | 'sem4'; at: number }[] = [
  { text: 'Figurtekst under figuren', src: 'ISE', at: 0 },
  { text: 'Legend i selve figuren', src: 'sem4', at: 1 },
  { text: 'Kan læses uden brødteksten (3–4 linjer)', src: 'ISE', at: 2 },
  { text: 'Viser … + “Bemærk at” + pointen', src: 'sem4', at: 2 },
  { text: 'Refereret fra brødteksten', src: 'sem4', at: 3 },
  { text: 'draw.io, filnavn med præfiks (CD_)', src: 'sem4', at: 3 },
]

function Cls({ name, kind, colored, tone }: { name: ReactNode; kind: Kind; colored: boolean; tone?: 'focus' }) {
  return (
    <div className="cap-cls" data-kind={colored ? kind : 'plain'} data-tone={tone}>
      <span className="cap-stereo">«{kind}»</span>
      <span className="cap-cname">{name}</span>
    </div>
  )
}

function CaptionOmskrivning({ step }: { step: number }) {
  const legend = at(step, 1)
  const rewritten = at(step, 2)
  const referenced = at(step, 3)

  return (
    <div className="cap">
      <div className="cap-page">
        <figure className="cap-figure">
          <div className="cap-diagram" aria-label="Forenklet klassediagram">
            <div className="cap-top">
              <Cls name="RESTController" kind="boundary" colored={legend} />
              <span className="cap-assoc" data-tone={rewritten ? 'focus' : undefined} />
              <div className="cap-hub">
                <Cls name="SalgsService" kind="control" colored={legend} tone={rewritten ? 'focus' : undefined} />
              </div>
            </div>
            <div className="cap-bottom">
              {BOTTOM.map((b) => (
                <div key={b.name} className="cap-leaf">
                  <Cls name={b.label} kind={b.kind} colored={legend} />
                </div>
              ))}
            </div>
            <motion.div
              className="cap-legend"
              aria-hidden={!legend || undefined}
              initial={false}
              animate={{ opacity: legend ? 1 : 0, y: legend ? 0 : 4 }}
              transition={legend ? t.place : t.fade}
            >
              <span className="cap-legend-head">Legend</span>
              <span className="cap-key" data-kind="boundary">«boundary» grænseflade</span>
              <span className="cap-key" data-kind="control">«control» styring</span>
              <span className="cap-key" data-kind="domain">«domain» domæne</span>
            </motion.div>
            <span className="cap-simpl">forenklet efter skabelonens Figur 5.1</span>
          </div>

          <figcaption className="cap-caption">
            <Swap
              show={rewritten ? 1 : 0}
              items={[
                <p className="cap-captext" key="bad">
                  <strong>Figur 5.1:</strong> Eksempel: klassediagram{' '}
                  <Tag tone="neg">siger kun diagramtypen</Tag>
                </p>,
                <p className="cap-captext" key="good">
                  <strong>Figur 5.1:</strong> Klassediagram for backend-applikationen (UC1 og UC2).{' '}
                  <mark>Bemærk at</mark> <code>SalgsService</code> koordinerer alle klasser, og at{' '}
                  <code>RESTController</code> kun kender <code>SalgsService</code> — REST-laget er holdt adskilt fra
                  salgslogikken, hvilket reducerer koblingen.
                </p>,
              ]}
            />
          </figcaption>
        </figure>

        <motion.p
          className="cap-body"
          aria-hidden={!referenced || undefined}
          initial={false}
          animate={{ opacity: referenced ? 1 : 0, y: referenced ? 0 : 4 }}
          transition={referenced ? t.settle : t.fade}
        >
          Brødtekst: “Det centrale ansvar for koordineringen mellem klasserne er placeret i <code>SalgsService</code>,
          hvilket fremgår af klassediagrammet i <mark>Figur 5.1</mark>.”
          <span className="cap-file">
            <Tag tone="idle">draw.io</Tag>
            <Tag tone="idle">CD_&lt;navn&gt;.drawio → PDF</Tag>
          </span>
        </motion.p>
      </div>

      <ul className="cap-checks" aria-label="Tjekliste">
        {CHECKS.map((c, i) => {
          const done = at(step, c.at)
          const now = step === c.at
          return (
            <li key={c.text} className="cap-check" data-done={done} data-now={now}>
              <motion.span
                className="cap-tick"
                initial={false}
                animate={{ scale: done ? 1 : 0.6, opacity: done ? 1 : 0.35 }}
                transition={done ? stagger(i, 0.1, 0.05) : t.fade}
              >
                {done ? '✓' : ''}
              </motion.span>
              <span className="cap-check-text">{c.text}</span>
              <span className="cap-src" data-src={c.src}>
                {c.src}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'caption-omskrivning',
  title: 'En pladsholder-caption skrives om',
  steps: [
    {
      caption:
        'Skabelonens eksempelfigur med dens egen caption: “Eksempel: klassediagram”. Den står rigtigt under figuren, men siger kun, hvilken slags diagram det er.',
      hold: 2800,
    },
    {
      caption:
        'Legenden kommer **ind i figuren**, og stereotyperne får hver sin markering. ISE siger “brug gerne farver”; sem4-reglerne kræver legenden.',
      hold: 2600,
    },
    {
      caption:
        'Captionen skrives om: *hvad figuren viser* + “Bemærk at” + *pointen*. Pointen stod i skabelonens brødtekst; nu kan figuren læses alene.',
      hold: 3200,
    },
    {
      caption:
        'Brødteksten henviser til figuren, og kilden ligger i draw.io med præfiks-filnavn. Figuren står før teksten (ISE) og er refereret fra den (sem4).',
      hold: 3000,
    },
  ],
  Component: CaptionOmskrivning,
}

export default viz
