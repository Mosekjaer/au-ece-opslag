import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './uc-diagram-opbygning.css'

/* Parkeringsautomaten fra L3_Specification_FunctionalKrav_UC (Updated).pdf slide 25:
   aktører, use cases og associationer er som på sliden (Bruger til venstre; PBS,
   Database og Maintenance til højre). Sliden har intet systemnavn på grænsen —
   navnet her er emnets. "Penge er ikke en aktør" er slide 12; "plain connectors" slide 30. */

/* Lodrette positioner i procent af diagrammets højde. */
const UCS = [
  { id: 'uc1', label: 'UC1: Køb af parkeringsbillet', y: 12.5, step: 2 },
  { id: 'uc2', label: 'UC2: Overvågning', y: 37.5, step: 4 },
  { id: 'uc3', label: 'UC3: Tømning af mønter', y: 62.5, step: 4 },
  { id: 'uc4', label: 'UC4: Skiftning af bon-papir', y: 87.5, step: 4 },
]

const ACTORS = [
  { id: 'bruger', name: 'Bruger', side: 'l', y: 12.5, step: 1 },
  { id: 'pbs', name: 'PBS', side: 'r', y: 9, step: 3 },
  { id: 'db', name: 'Database', side: 'r', y: 37.5, step: 3 },
  { id: 'maint', name: 'Maintenance', side: 'r', y: 75, step: 4 },
] as const

const LINKS: { a: string; uc: string; step: number }[] = [
  { a: 'bruger', uc: 'uc1', step: 2 },
  { a: 'pbs', uc: 'uc1', step: 3 },
  { a: 'db', uc: 'uc1', step: 3 },
  { a: 'db', uc: 'uc2', step: 4 },
  { a: 'maint', uc: 'uc2', step: 4 },
  { a: 'maint', uc: 'uc3', step: 4 },
  { a: 'maint', uc: 'uc4', step: 4 },
]

/* Vandrette ankre (procent af bredden): aktørkolonnerne er 20 % (figuren midt i), ellipserne går fra 27 til 73 %. */
const X = { lActor: 13, lUc: 27.5, rUc: 72.5, rActor: 87 }

function Stick() {
  return (
    <svg className="ucd-stick" viewBox="0 0 24 34" aria-hidden="true">
      <circle cx="12" cy="5" r="4" />
      <path d="M12 9 V21 M3 13 H21 M12 21 L5 32 M12 21 L19 32" />
    </svg>
  )
}

function UcDiagram({ step }: { step: number }) {
  const actor = (id: string) => ACTORS.find((a) => a.id === id)!
  const uc = (id: string) => UCS.find((u) => u.id === id)!
  const toneFor = (s: number) => (step === s ? 'focus' : 'idle')

  return (
    <div className="ucd">
      <div className="ucd-canvas">
        <svg className="ucd-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
          {LINKS.map((l, i) => {
            const a = actor(l.a)
            const u = uc(l.uc)
            const left = a.side === 'l'
            const on = at(step, l.step)
            return (
              <motion.line
                key={`${l.a}-${l.uc}`}
                x1={left ? X.lActor : X.rActor}
                y1={a.y}
                x2={left ? X.lUc : X.rUc}
                y2={u.y}
                data-tone={toneFor(l.step)}
                initial={false}
                animate={{ opacity: on ? 1 : 0 }}
                transition={on ? stagger(i, 0.35, 0.08) : t.fade}
              />
            )
          })}
        </svg>

        <motion.div className="ucd-boundary" data-tone={toneFor(0)} initial={false} animate={{ opacity: 1 }}>
          <span className="ucd-sysname">Parkeringsautomat</span>
        </motion.div>

        {UCS.map((u, i) => {
          const on = at(step, u.step)
          return (
            <motion.div
              key={u.id}
              className="ucd-uc"
              data-tone={toneFor(u.step)}
              style={{ top: `${u.y}%` }}
              initial={false}
              animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.94 }}
              transition={on ? stagger(i, 0.05, 0.1) : t.fade}
            >
              {u.label}
            </motion.div>
          )
        })}

        {ACTORS.map((a, i) => {
          const on = at(step, a.step)
          return (
            <motion.div
              key={a.id}
              className={`ucd-actor is-${a.side}`}
              data-tone={toneFor(a.step)}
              style={{ top: `${a.y}%` }}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 6 }}
              transition={on ? stagger(i, 0, 0.08) : t.fade}
            >
              <Stick />
              <span className="ucd-name">{a.name}</span>
            </motion.div>
          )
        })}
      </div>

      <div className="ucd-legend">
        <span className="ucd-side">
          <Tag tone={step === 1 ? 'focus' : 'idle'} show={at(step, 1)}>
            Bruger: primær
          </Tag>
          <Tag tone={step === 3 ? 'focus' : 'idle'} show={at(step, 3)}>
            PBS, Database: sekundære
          </Tag>
        </span>
        <span className="ucd-side">
          <Tag tone="focus" show={at(step, 5)}>
            streger uden pile
          </Tag>
          <Tag tone="neg" show={at(step, 5)}>
            penge er ingen aktør
          </Tag>
        </span>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'uc-diagram-opbygning',
  title: 'Use case-diagrammet for parkeringsautomaten bygges op',
  steps: [
    {
      caption: 'Start med **systemgrænsen**: alt indenfor udvikler vi, alt udenfor er aktører. (Sliden navngiver ikke grænsen.)',
      hold: 2200,
    },
    {
      caption: 'Den **primære aktør** har et mål, som systemet skal opfylde. Bruger står til venstre.',
      hold: 2000,
    },
    {
      caption: 'Målet bliver en use case, forbundet til aktøren med en streg. Sliden skriver *Køb af parkeringsbillet*; reglen siger, at navnet starter med et verbum.',
      hold: 2600,
    },
    {
      caption: '**Sekundære aktører** leverer en service til use casen — her PBS og Database. De står til højre for grænsen.',
      hold: 2800,
    },
    {
      caption: 'Maintenance har tre use cases, og Database indgår også i *Overvågning*. Sliden sætter Maintenance til højre, selvom den selv starter sine use cases.',
      hold: 2800,
    },
    {
      caption: 'Slutbilledet: **streger uden pile**, kun use cases der findes. Penge — fx mønterne i UC3 — er ikke en aktør: de har ingen interesse i scenariet.',
      hold: 3200,
    },
  ],
  Component: UcDiagram,
}

export default viz
