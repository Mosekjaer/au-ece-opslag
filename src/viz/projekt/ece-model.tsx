import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Swap, Tag, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './ece-model.css'

/* ECE-modellen / semesterprojektmodellen: Velkommen til SWISE slide 29 og 43,
   Development Processes slide 22–23. Faser til venstre, dokumenterne (artefakterne)
   til højre. Kun design ⇄ implementering/modultest ligger i den iterative ramme. */

interface Phase {
  id: string
  title: ReactNode
  docs: string[]
  at: number
}

const TOP: Phase[] = [
  { id: 'pf', title: <>Projekt&shy;formulering</>, docs: ['Projektformulering'], at: 1 },
  { id: 'spec', title: 'Specifikation', docs: ['Kravspecifikation', 'Accepttestspecifikation'], at: 2 },
  { id: 'ark', title: 'Arkitektur', docs: ['Systemarkitektur (HW og SW)'], at: 3 },
]
const BOTTOM: Phase[] = [
  { id: 'int', title: 'Integrationstest', docs: ['Logbog'], at: 6 },
  { id: 'acc', title: 'Accepttest', docs: ['Gennemført accepttest'], at: 7 },
]
const LANES = [
  { id: 'hw', design: 'HW Design', impl: 'HW Impl. / modultest' },
  { id: 'pc', design: 'PC-SW Design', impl: 'PC-SW Impl. / modultest' },
  { id: 'uc', design: 'µC-SW Design', impl: 'µC-SW Impl. / modultest' },
]
const ITER_DOCS = ['HW-designdokument', 'SW-designdokument', 'Hardware', 'Source Code']

const tone = (at: number, step: number): Tone => (step < at ? 'ghost' : step === at ? 'focus' : 'ok')

function Docs({ docs, on }: { docs: string[]; on: boolean }) {
  return (
    <div className="ece-docs">
      {docs.map((d, i) => (
        <motion.span
          key={d}
          initial={false}
          animate={{ opacity: on ? 1 : 0, x: on ? 0 : -6 }}
          transition={on ? stagger(i, 0.25, 0.12) : t.fade}
        >
          <Tag tone="idle" wrap>
            {d}
          </Tag>
        </motion.span>
      ))}
    </div>
  )
}

function PhaseRow({ p, step }: { p: Phase; step: number }) {
  return (
    <div className="ece-row">
      <Node className="ece-phase" title={p.title} tone={tone(p.at, step)} />
      <Docs docs={p.docs} on={step >= p.at} />
    </div>
  )
}

function Ece({ step }: { step: number }) {
  const iter = step >= 4
  const hot = step === 4 || step === 5
  const laneTone: Tone = step < 4 ? 'ghost' : hot ? 'focus' : 'ok'
  return (
    <div className="ece">
      <div className="ece-head" aria-hidden="true">
        <span className="vcaps">Fase</span>
        <span className="vcaps">Dokument</span>
      </div>

      {TOP.map((p, i) => (
        <div key={p.id} className="ece-block">
          <PhaseRow p={p} step={step} />
          {i < TOP.length - 1 && (
            <div className="ece-gap">
              <Link on={step > p.at} vertical tone={step > p.at ? 'focus' : 'idle'} />
              {p.id === 'spec' && (
                <Tag show={step >= 3} tone="idle">
                  Teknisk analyse
                </Tag>
              )}
            </div>
          )}
        </div>
      ))}
      <div className="ece-gap">
        <Link on={step >= 4} vertical tone={step >= 4 ? 'focus' : 'idle'} />
      </div>

      <div className="ece-row ece-iter-row">
        <div className="ece-iter" data-on={iter || undefined}>
          <div className="ece-iter-head">
            <span className="ece-iter-label">Iterativ, tværfaglig</span>
            <Swap
              show={step < 4 ? 0 : step === 4 ? 1 : 2}
              items={[
                <span key="0" className="ece-count" />,
                <Tag key="1">iteration 1</Tag>,
                <Tag key="2">iteration 2, 3 …</Tag>,
              ]}
            />
          </div>
          {LANES.map((l, i) => (
            <div key={l.id} className="ece-lane">
              <Node className="ece-small" title={l.design} tone={laneTone} />
              <div className="ece-loop">
                <Link on={step >= 4} tone={hot ? 'focus' : 'idle'} />
                <Link on={step >= 5} back tone={hot ? 'focus' : 'idle'} />
              </div>
              <Node className="ece-small" title={l.impl} tone={laneTone} />
              <span className="visually-hidden">spor {i + 1}</span>
            </div>
          ))}
        </div>
        <Docs docs={ITER_DOCS} on={step >= 5} />
      </div>

      <div className="ece-gap">
        <Link on={step >= 6} vertical tone={step >= 6 ? 'focus' : 'idle'} />
      </div>
      {BOTTOM.map((p, i) => (
        <div key={p.id} className="ece-block">
          <PhaseRow p={p} step={step} />
          {i === 0 && (
            <div className="ece-gap">
              <Link on={step >= 7} vertical tone={step >= 7 ? 'focus' : 'idle'} />
            </div>
          )}
        </div>
      ))}
      <motion.p
        className="ece-note"
        initial={false}
        animate={{ opacity: step >= 7 ? 1 : 0 }}
        transition={step >= 7 ? { ...t.fade, delay: 0.4 } : t.fade}
      >
        Accepttesten udføres efter accepttestspecifikationen fra specifikationsfasen.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'ece-model',
  title: 'ECE-modellens faser, spor og dokumenter',
  steps: [
    {
      caption: 'Semesterprojektmodellen er use case-drevet og *semi-iterativ*. Hver fase afleverer et dokument (til højre).',
      hold: 2200,
    },
    { caption: '**Projektformuleringen** er første fase og første dokument.', hold: 1500 },
    {
      caption: '**Specifikation** giver både kravspecifikationen og accepttestspecifikationen: hvad systemet skal, og hvordan vi viser at det gør det.',
      hold: 2600,
    },
    {
      caption: '**Teknisk analyse** fører til **arkitekturen**, der fastlægges tidligt, fordi hardware og software skal udvikles parallelt mod de samme grænseflader.',
      hold: 2800,
    },
    {
      caption: 'Inden for den iterative ramme arbejder hvert spor — HW, PC-SW og µC-SW — med design og implementering/modultest. Iterationer er korte og timeboxed.',
      hold: 2800,
    },
    {
      caption: 'Modultesten fører tilbage til designet, og runden gentages. Hver iteration giver et system i produktionskvalitet: *reducér kravene, ikke deadline*.',
      hold: 3000,
    },
    { caption: 'Sporene samles i **integrationstesten**, der dokumenteres i en logbog.', hold: 2000 },
    {
      caption: '**Accepttesten** afslutter forløbet og giver dokumentet “gennemført accepttest”. Den udføres efter specifikationen fra fase to.',
      hold: 3000,
    },
  ],
  Component: Ece,
}

export default viz
