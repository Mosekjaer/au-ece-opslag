import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './rapport-opbygning.css'

/* AU ECE-rapportskabelonen (report_template.pdf): kapitlerne parret på tværs af
   V-modellen (læsevejledningens Figur 1, s. 2), sidebudgettet (Tabel 10.1, s. 37)
   og de relevante figurer for et Software Engineering-projekt (Tabel 10.2, s. 38). */

interface Chapter {
  n: string
  name: string
  pages: string
  figs: string[]
}

const PAIRS: { left: Chapter; right: Chapter; link: string }[] = [
  {
    left: { n: '1', name: 'Introduktion', pages: '2–4 s.', figs: ['rigt billede'] },
    right: { n: '9', name: 'Konklusion', pages: '1–2 s.', figs: [] },
    link: 'besvarer projektspørgsmålene',
  },
  {
    left: { n: '2', name: 'Udviklingsproces og metode', pages: '1–2 s.', figs: [] },
    right: { n: '8', name: 'Diskussion', pages: '1–2 s.', figs: [] },
    link: 'evaluerer proces og metode',
  },
  {
    left: { n: '3', name: 'Brugerkrav', pages: '4–6 s.', figs: ['aktør-kontekst', 'UC-diagram', 'MoSCoW', 'domænemodel'] },
    right: { n: '7', name: 'Brugeraccepttest', pages: '1–4 s.', figs: [] },
    link: 'validerer brugerkravene',
  },
  {
    left: { n: '4', name: 'Systemarkitektur', pages: '3–4 s.', figs: ['C4 context', 'risikomatrix', 'C4 container', 'system-SD', 'ER'] },
    right: { n: '6', name: 'Integrationstest', pages: '1–2 s.', figs: [] },
    link: 'verificerer arkitektur og interfaces',
  },
  {
    left: { n: '5', name: 'Design og implementering', pages: '6–10 s.', figs: ['C4 component', 'CD', 'SD', 'STM', 'kode'] },
    right: { n: '5.2.5', name: 'Tests og resultater', pages: 'i kap. 5', figs: ['testresultater', 'metrikker'] },
    link: 'verificerer designenhederne',
  },
]

const BILAG = ['kravspecifikation', 'risikomatrice', 'analyser', 'testdokumenter', 'kildekode', 'procesbilag']

function Box({
  ch,
  show,
  tone,
  figs,
  side,
  i,
}: {
  ch: Chapter
  show: boolean
  tone: Tone
  figs: boolean
  side: 'l' | 'r'
  i: number
}) {
  return (
    <motion.div
      className={`ro-box ro-${side}`}
      data-tone={tone}
      aria-hidden={!show || undefined}
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
      transition={show ? stagger(i, 0, 0.08) : t.fade}
    >
      <div className="ro-name">
        <span className="ro-num">{ch.n}</span>
        <span className="ro-title">{ch.name}</span>
        <span className="ro-pages">{ch.pages}</span>
      </div>
      {ch.figs.length > 0 && (
        <div className="ro-figs">
          {ch.figs.map((f) => (
            <Tag key={f} show={figs} tone="idle">
              {f}
            </Tag>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function RapportOpbygning({ step }: { step: number }) {
  const right = at(step, 1)
  const censor = at(step, 2)
  const figs = at(step, 3)
  const sideBySide = at(step, 4)

  const toneFor = (row: number, side: 'l' | 'r'): Tone => {
    if (sideBySide && row === 0) return 'focus'
    if (sideBySide) return 'idle'
    if (step === 0 && side === 'l') return 'focus'
    if (step === 1) return side === 'r' ? 'focus' : 'idle'
    if (censor) return 'ok'
    return 'idle'
  }

  return (
    <div className="ro">
      <div className="ro-legs">
        <span className="vcaps">Konstruktion · skrevet som hensigt</span>
        <span className="ro-legs-mid">
          <motion.span
            className="ro-main"
            data-now={step === 2}
            aria-hidden={!censor || undefined}
            initial={false}
            animate={{ opacity: censor ? 1 : 0, scale: censor ? 1 : 0.9 }}
            transition={censor ? t.place : t.fade}
          >
            <strong>Hovedrapport</strong> · max 72.000 tegn · det censor læser
          </motion.span>
        </span>
        <span className="vcaps ro-legs-r">Evaluering · tilbageblik</span>
      </div>

      <ol className="ro-rows">
        {PAIRS.map((p, i) => (
          <li key={p.left.n} className="ro-row" style={{ '--i': i } as CSSProperties}>
            <Box ch={p.left} show tone={toneFor(i, 'l')} figs={figs} side="l" i={i} />
            <div className="ro-mid" data-tone={sideBySide && i === 0 ? 'focus' : right ? 'idle' : 'muted'}>
              <motion.span
                className="ro-link-label"
                initial={false}
                animate={{ opacity: right ? 1 : 0 }}
                transition={right ? stagger(i, 0.2, 0.08) : t.fade}
              >
                {p.link}
              </motion.span>
              <motion.span
                className="ro-line"
                initial={false}
                animate={{ scaleX: right ? 1 : 0, opacity: right ? 1 : 0 }}
                transition={right ? { ...t.travel, duration: 0.55, delay: 0.1 + i * 0.08 } : t.fade}
              />
              {i === 0 && (
                <span className="ro-link-note">
                  <Tag show={sideBySide} tone="focus">
                    læses side om side
                  </Tag>
                </span>
              )}
            </div>
            <Box ch={p.right} show={right} tone={toneFor(i, 'r')} figs={figs} side="r" i={i} />
          </li>
        ))}
      </ol>

      <motion.div
        className="ro-bilag"
        aria-hidden={!censor || undefined}
        initial={false}
        animate={{ opacity: censor ? 1 : 0, y: censor ? 0 : 6 }}
        transition={censor ? t.settle : t.fade}
      >
        <span className="ro-bilag-head">Bilag · supplerende materiale</span>
        <span className="ro-bilag-items">
          {BILAG.map((b) => (
            <span key={b} className="ro-bilag-item">
              {b}
            </span>
          ))}
        </span>
        <span className="ro-bilag-note">slås op ved behov</span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'rapport-opbygning',
  title: 'Rapportens kapitler på V-modellen',
  steps: [
    {
      caption:
        'Venstre ben er skabelonens kapitel 1–5. De skrives *som stod du på netop det sted i projektet*: metoden er hensigt, ikke “vi brugte Scrum”.',
      hold: 2800,
    },
    {
      caption:
        'Højre ben evaluerer. Hvert konstruerende kapitel har et modstykke: accepttesten validerer kravene, integrationstesten verificerer arkitekturen.',
      hold: 3000,
    },
    {
      caption:
        'Kapitel 1–9 er **hovedrapporten**: max 72.000 tegn, og det censor læser. Med ca. 6 timer pr. projekt er der ikke tid til at nærlæse bilagene; de slås op, når rapporten henviser til dem.',
      hold: 2800,
    },
    {
      caption:
        'Figurerne hører til kapitlet: krav får UC-diagram og domænemodel, arkitektur får C4 og system-SD, design får klasse-, sekvens- og state machine-diagrammer (Tabel 10.2).',
      hold: 3000,
    },
    {
      caption:
        'Til sidst læses indledning og konklusion **side om side**. Hvert spørgsmål i problemformuleringen skal have et svar i konklusionen.',
      hold: 3000,
    },
  ],
  Component: RapportOpbygning,
}

export default viz
