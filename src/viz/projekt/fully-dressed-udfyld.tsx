import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './fully-dressed-udfyld.css'

/* "Åbn Pengeskab" fra AcceptTestOvelse.pdf s. 2, ordret, sat ind i kursets
   skabelon ((skabelonen) Fully Dressed Use Case.docx). Øvelsen udfylder ikke
   Datavariationslisten. */

interface Field {
  name: string
  hint: string
  step: number
  value: ReactNode
}

const MAIN = [
  { n: '1.', text: 'Bruger anbringer højre tommelfinger på Systems fingeraftryksscanner' },
  { n: '2.', text: 'System scanner brugerens fingeraftryk' },
  { n: '3.', text: 'System validerer brugerens fingeraftryk', ext: 'Ext. 1: Fingeraftryk ej genkendt' },
  { n: '4.', text: 'System afgiver “Scan OK”-lyd' },
  { n: '5.', text: 'System trækker låsepaler ind og låser dermed pengeskabet op' },
  { n: '6.', text: 'System detekterer at lågen åbnes.', ext: 'Ext. 2: Låge åbnes ikke inden 5 sekunder' },
]

const EXTS = [
  { head: 'Ext. 1: Fingeraftryk ej genkendt', steps: ['E1.1: System afgiver “Fejl i scan”-lyd', 'E1.2: UC afsluttes'] },
  {
    head: 'Ext. 2: Låge åbnes ikke indenfor 5 sekunder',
    steps: ['E2.1: System skyder låsepaler ud og låser dermed pengeskabet', 'E2.2: System afgiver “Pengeskab låst”-lyd'],
  },
]

function Steps({ step }: { step: number }) {
  return (
    <ol className="fdu-steps">
      {MAIN.map((m) => (
        <li key={m.n}>
          <span className="fdu-n">{m.n}</span>
          <span>
            {m.text}
            {m.ext && (
              <span className="fdu-mark" data-hot={step === 4 || undefined}>
                [{m.ext}]
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  )
}

function Exts({ step }: { step: number }) {
  return (
    <div className="fdu-exts">
      {EXTS.map((e) => (
        <div key={e.head} className="fdu-ext" data-hot={step === 4 || undefined}>
          <div className="fdu-ext-head">[{e.head}]</div>
          {e.steps.map((s) => (
            <div key={s} className="fdu-ext-step">
              {s}
            </div>
          ))}
        </div>
      ))}
    </div>
  )
}

function FullyDressed({ step }: { step: number }) {
  const fields: Field[] = [
    { name: 'Navn', hint: 'verbum + mål', step: 1, value: 'Åbn Pengeskab' },
    { name: 'Mål', hint: 'hvad opnås', step: 1, value: 'At åbne pengeskabet og dermed tillade brugeren adgang til dettes indhold' },
    { name: 'Initiering', hint: 'aktør eller system', step: 1, value: 'Bruger' },
    { name: 'Aktører', hint: 'med type', step: 1, value: 'Bruger' },
    { name: 'Antal samtidige forekomster', hint: '1, 2, 10, ingen', step: 1, value: '1' },
    { name: 'Prækondition', hint: 'sandt ved start', step: 2, value: 'Pengeskabet er låst' },
    { name: 'Postkondition', hint: 'sandt bagefter', step: 2, value: 'Pengeskabet er låst op og åbent' },
    { name: 'Hovedscenarie', hint: 'happy path, nummereret', step: 3, value: <Steps step={step} /> },
    { name: 'Udvidelser/undtagelser', hint: 'betingelse + håndtering', step: 4, value: <Exts step={step} /> },
    { name: 'Datavariationsliste', hint: 'fx dataformater', step: 5, value: <span className="fdu-empty">ikke udfyldt i øvelsen</span> },
  ]

  return (
    <div className="fdu">
      <div className="fdu-form">
        {fields.map((f, i) => {
          const on = at(step, f.step)
          const now = step === f.step
          return (
            <div key={f.name} className="fdu-row" data-now={now || undefined} data-on={on || undefined}>
              <div className="fdu-label">
                <span className="fdu-name">{f.name}</span>
                <span className="fdu-hint">{f.hint}</span>
              </div>
              <motion.div
                className="fdu-value"
                initial={false}
                animate={{ opacity: on ? 1 : 0, x: on ? 0 : -4 }}
                transition={on ? stagger(i, 0.1, 0.07) : t.fade}
              >
                {f.value}
              </motion.div>
            </div>
          )
        })}
      </div>
      <div className="fdu-foot">
        <Tag tone="focus" show={at(step, 5)} wrap>
          3 veje gennem use casen → 3 accepttestcases
        </Tag>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'fully-dressed-udfyld',
  title: 'Fully dressed-skabelonen udfyldes for “Åbn Pengeskab”',
  steps: [
    { caption: 'Kursets skabelon: ti felter, udfyldes oppefra. Kort forklaring af hvert felt står under navnet.', hold: 2200 },
    {
      caption: 'Hovedet: **navnet** starter med et verbum og er brugerens mål. Initiering og aktører siger, hvem der starter use casen.',
      hold: 2600,
    },
    {
      caption: '**Prækonditionen** antages sand ved start og testes ikke i use casen. **Postkonditionen** er det, der er sandt bagefter.',
      hold: 2600,
    },
    {
      caption: '**Hovedscenariet**: happy path uden forgreninger. Aktør og system skiftes, og hvert sted en undtagelse kan opstå, markeres med `[Ext. n]`.',
      hold: 3000,
    },
    {
      caption: 'Hver **udvidelse** har en betingelse, systemet kan detektere, og en nummereret håndtering (E1.1, E1.2 …).',
      hold: 3000,
    },
    {
      caption: 'Datavariationslisten er tom i øvelsen. Use casen har tre veje — hovedscenariet og to udvidelser — og hver bliver en accepttestcase.',
      hold: 3200,
    },
  ],
  Component: FullyDressed,
}

export default viz
