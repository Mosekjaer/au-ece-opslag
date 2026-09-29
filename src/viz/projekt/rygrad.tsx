import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Node, Tag, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './rygrad.css'

/* Projektets rygrad som V: venstre ben er artefakterne fra projektformulering til
   kode, højre ben er testene og rapporten, der sporer tilbage til dem.
   Rækkefølge: ECE-modellen (Velkommen til SWISE slide 29), L14–16 og
   rapportskabelonen (report_template.pdf s. 2, 8–10). Eksemplerne under hvert
   artefakt er Pakkeboksen fra afleveringsopgave A, B og C. */

interface Art {
  id: string
  title: ReactNode
  sub: string
  at: number
}

const PF: Art = { id: 'pf', title: <>Projekt&shy;formulering</>, sub: 'pakker kan hentes døgnet rundt', at: 1 }
const KRAV: Art = { id: 'krav', title: <>Krav&shy;specifikation</>, sub: 'UC «Hent pakke» · FURPS+ · MoSCoW', at: 2 }
const ATS: Art = { id: 'ats', title: <>Accept&shy;test&shy;specifikation</>, sub: 'hovedscenarie · afbryd-knap', at: 2 }
const DOM: Art = { id: 'dom', title: 'Domænemodel', sub: 'begreber fra navneordsanalyse', at: 3 }
const ARK: Art = { id: 'ark', title: 'Arkitektur (BDD/IBD)', sub: 'Computer · Touchskærm · Boksstyring', at: 3 }
const APP: Art = { id: 'app', title: <>Applikations&shy;model</>, sub: 'boundary · controller · domain, SD', at: 4 }
const KODE: Art = { id: 'kode', title: 'Kode', sub: 'implementering pr. delsystem', at: 5 }
const MODUL: Art = { id: 'modul', title: 'Modultest', sub: 'verificerer designet', at: 6 }
const INTEG: Art = { id: 'integ', title: <>Integrations&shy;test</>, sub: 'verificerer arkitektur og grænseflader · logbog', at: 6 }
const ACC: Art = { id: 'acc', title: 'Accepttest', sub: 'validerer kravene: OK/FAIL pr. step', at: 7 }
const RAP: Art = { id: 'rap', title: 'Rapport', sub: 'konklusionen besvarer problemformuleringen', at: 7 }

const ROWS: { left: Art[]; right: Art; link: string; at: number }[] = [
  { left: [PF], right: RAP, link: 'besvarer', at: 7 },
  { left: [KRAV, ATS], right: ACC, link: 'validerer', at: 7 },
  { left: [DOM, ARK], right: INTEG, link: 'verificerer', at: 6 },
  { left: [APP], right: MODUL, link: 'verificerer', at: 6 },
]

const TRACE = ['UC «Hent pakke»', 'accepttest: hovedscenarie', 'SD «Hent pakke»', 'controller-klasse', 'kode', 'accepttest udført: OK/FAIL']
const LAST = 8

const tone = (a: Art, step: number): Tone => (step < a.at ? 'ghost' : step === a.at ? 'focus' : 'ok')

function ArtNode({ a, step }: { a: Art; step: number }) {
  return (
    <Node className="ryg-node" title={<span className="ryg-title">{a.title}</span>} sub={a.sub} tone={tone(a, step)} />
  )
}

function Rygrad({ step }: { step: number }) {
  const trace = step >= LAST
  return (
    <div className="ryg">
      <div className="ryg-legs" aria-hidden="true">
        <span className="vcaps">Specifikation, analyse og design</span>
        <span />
        <span className="vcaps ryg-right-cap">Test og evaluering</span>
      </div>
      <div className="ryg-v">
        {ROWS.map((r, i) => {
          const on = step >= r.at
          return (
            <div key={r.right.id} className={`ryg-row ryg-r${i}`}>
              <div className="ryg-left">
                {r.left.map((a) => (
                  <ArtNode key={a.id} a={a} step={step} />
                ))}
              </div>
              <div className="ryg-link" data-on={on || undefined}>
                <motion.span
                  className="ryg-line"
                  initial={false}
                  animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
                  transition={on ? t.travel : t.fade}
                />
                <motion.span
                  className="ryg-link-label"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={on ? { ...t.fade, delay: 0.5 } : t.fade}
                >
                  {r.link}
                </motion.span>
              </div>
              <div className="ryg-rightcell">
                <ArtNode a={r.right} step={step} />
              </div>
            </div>
          )
        })}
        <div className="ryg-row ryg-bottom">
          <ArtNode a={KODE} step={step} />
        </div>
      </div>

      <motion.div
        className="ryg-trace"
        initial={false}
        animate={{ opacity: trace ? 1 : 0, y: trace ? 0 : 6 }}
        transition={trace ? t.settle : t.fade}
        aria-hidden={!trace || undefined}
      >
        <span className="vcaps">Sporingskæden for én use case</span>
        <div className="ryg-trace-row">
          {TRACE.map((x, i) => (
            <span key={x} className="ryg-trace-item">
              {i > 0 && <span className="ryg-arrow">→</span>}
              <Tag tone={i === TRACE.length - 1 ? 'focus' : 'idle'} wrap>
                {x}
              </Tag>
            </span>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'rygrad',
  title: 'Projektets artefakter og hvordan de sporer til hinanden',
  steps: [
    {
      caption: 'Rygraden er en række artefakter. Venstre ben bygges oppefra og ned; højre ben tester og evaluerer nedefra og op. Eksemplet er Pakkeboksen fra opgave A–C.',
      hold: 2400,
    },
    { caption: '**Projektformuleringen** siger, hvilket problem projektet løser: pakker skal kunne hentes uden for postkontorets åbningstider.', hold: 2200 },
    {
      caption: '**Kravspecifikationen** (use cases + FURPS+, prioriteret med MoSCoW) og **accepttestspecifikationen** laves i samme fase. Testen skrives, før der er noget at teste.',
      hold: 2800,
    },
    { caption: '**Domænemodellen** beskriver systemet i brugerens begreber; **arkitekturen** deler det i blokke med porte og grænseflader.', hold: 2400 },
    { caption: '**Applikationsmodellen** fordeler use casen på boundary-, controller- og domain-klasser og viser samspillet i et sekvensdiagram.', hold: 2400 },
    { caption: '**Koden** er bunden af V’et. Den implementerer applikationsmodellen, delsystem for delsystem.', hold: 1800 },
    {
      caption: 'Højre ben går op igen. **Modultest** verificerer designet, **integrationstest** verificerer arkitekturen og grænsefladerne mellem delsystemerne.',
      hold: 2600,
    },
    {
      caption: '**Accepttesten** udføres efter specifikationen fra kravfasen og validerer kravene. I **rapporten** besvarer konklusionen problemformuleringen.',
      hold: 2800,
    },
    {
      caption: 'Traceability er den røde tråd: én use case kan følges fra krav over design og kode til et testresultat — og tilbage.',
      hold: 3200,
    },
  ],
  Component: Rygrad,
}

export default viz
