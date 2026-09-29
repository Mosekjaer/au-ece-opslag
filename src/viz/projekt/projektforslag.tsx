import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './projektforslag.css'

/* Fra problem til problemformulering og tilbage i konklusionen.
   SW4PRJ4 Introduktion slide 8 (projektforslag: problembeskrivelse + projektbeskrivelse),
   God_rapportskrivning.pdf slide 19–20 (motivation, eksisterende viden,
   spørgsmål der besvares i konklusionen; MoSCoW), report_template.pdf s. 7
   (systemskitse uden teknologi) og Velkommen til SWISE slide 42
   (afgrænsning/prioritering med MoSCoW). Spørgsmålene er pladsholdere. */

interface Sec {
  id: string
  title: string
  kind: string
  body: ReactNode
  at: number
}

const QS = ['Spørgsmål 1', 'Spørgsmål 2', 'Spørgsmål 3']

const SECS: Sec[] = [
  {
    id: 'mot',
    title: 'Motivation',
    kind: 'problembeskrivelse',
    body: 'Hvor mange oplever problemet? Hvor dyrt er det? Hvor stort er omfanget?',
    at: 1,
  },
  {
    id: 'eks',
    title: 'Eksisterende løsninger',
    kind: 'problembeskrivelse',
    body: 'Hvad ved man i forvejen — og hvorfor rækker det ikke?',
    at: 2,
  },
  { id: 'pf', title: 'Problemformulering', kind: 'problembeskrivelse', body: null, at: 3 },
  {
    id: 'skitse',
    title: 'Systemskitse',
    kind: 'projektbeskrivelse',
    body: 'Hvordan søges problemet løst? Funktionel skitse, fx et rigt billede — uden teknologivalg.',
    at: 4,
  },
  { id: 'afg', title: 'Afgrænsning', kind: 'krav', body: null, at: 5 },
]
const MOSCOW = ['Must', 'Should', 'Could', 'Won’t']

const tone = (at: number, step: number): Tone => (step < at ? 'ghost' : step === at ? 'focus' : 'ok')

function Questions({ prefix, on }: { prefix?: string; on: boolean }) {
  return (
    <div className="pfs-qs">
      {QS.map((q, i) => (
        <motion.span
          key={q}
          initial={false}
          animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
          transition={on ? stagger(i, 0.15, 0.12) : t.fade}
        >
          <Tag tone={prefix ? 'focus' : 'idle'}>{prefix ? `Svar ${i + 1}` : q}</Tag>
        </motion.span>
      ))}
    </div>
  )
}

function Projektforslag({ step }: { step: number }) {
  const answered = step >= 6
  return (
    <div className="pfs">
      <div className="pfs-head" aria-hidden="true">
        <span className="vcaps">Projektforslag (ca. 1 A4) og rapportens indledning</span>
        <span />
        <span className="vcaps pfs-head-right">Rapportens konklusion</span>
      </div>
      <div className="pfs-grid">
        {SECS.map((s, i) => (
          <div key={s.id} className={`pfs-sec pfs-w${i}`} data-tone={tone(s.at, step)} style={{ gridRow: i + 1 }}>
            <div className="pfs-sec-head">
              <span className="pfs-title">{s.title}</span>
              <span className="pfs-kind">{s.kind}</span>
            </div>
            {s.body && <div className="pfs-body">{s.body}</div>}
            {s.id === 'pf' && <Questions on={step >= 3} />}
            {s.id === 'afg' && (
              <div className="pfs-body">
                <div className="pfs-qs">
                  {MOSCOW.map((m, j) => (
                    <motion.span
                      key={m}
                      initial={false}
                      animate={{ opacity: step >= 5 ? 1 : 0 }}
                      transition={step >= 5 ? stagger(j, 0.1, 0.1) : t.fade}
                    >
                      <Tag tone={j === 3 ? 'idle' : 'focus'}>{m}</Tag>
                    </motion.span>
                  ))}
                </div>
                <span className="pfs-small">MoSCoW prioriterer kravene — det er ikke selv krav.</span>
              </div>
            )}
          </div>
        ))}

        <div className="pfs-link" style={{ gridRow: 3 }}>
          <Link on={answered} tone={answered ? 'focus' : 'idle'} label="besvares i" />
        </div>
        <div className="pfs-vlink">
          <Link on={answered} vertical tone={answered ? 'focus' : 'idle'} label="besvares i" />
        </div>
        <div className="pfs-sec pfs-concl" data-tone={answered ? 'focus' : 'ghost'} style={{ gridRow: 3 }}>
          <div className="pfs-sec-head">
            <span className="pfs-title">Konklusion</span>
          </div>
          <Questions prefix="svar" on={answered} />
          <div className="pfs-body">Indledning og konklusion læses side om side.</div>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'projektforslag',
  title: 'Fra problem til problemformulering og tilbage i konklusionen',
  steps: [
    {
      caption: 'Projektforslaget er ca. én A4-side: en *problembeskrivelse* (hvilket problem?) og en *projektbeskrivelse* (hvordan?). Samme struktur bliver rapportens indledning.',
      hold: 2400,
    },
    { caption: 'Sæt scenen med **motivation**: hvem har problemet, hvad koster det, hvor stort er det?', hold: 2000 },
    { caption: 'Hvad findes der allerede, og **hvorfor rækker det ikke**? Uden det virker problemet opfundet.', hold: 2200 },
    { caption: 'Indledningen munder ud i **problemformuleringen** — formuleret som spørgsmål, projektet skal besvare.', hold: 2400 },
    { caption: 'Projektbeskrivelsen skitserer løsningen funktionelt. Teknologi som Raspberry Pi eller React hører ikke hjemme her endnu.', hold: 2600 },
    { caption: '**Afgrænsningen** sker i kravene: MoSCoW prioriterer, hvad projektet leverer, og hvad det bevidst vælger fra.', hold: 2600 },
    {
      caption: 'I rapporten skal **konklusionen besvare hvert spørgsmål** fra problemformuleringen. Indledning og konklusion læses side om side.',
      hold: 3000,
    },
  ],
  Component: Projektforslag,
}

export default viz
