import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './procesmodeller.css'

/* Development Processes.pdf: vandfaldet (slide 10: Analysis → Design →
   Implementation → Test), og iterativ/inkrementel udvikling (slide 14–18) med
   akserne fra slide 15: “Req. fulfilment” 25–100 % for Use case 1–4. En typisk
   SW-iteration tager udvalgte use cases hele vejen gennem design, kode og test
   (slide 18). Sammenstillingen af de to modeller er figurens egen. */

const UCS = ['UC 1', 'UC 2', 'UC 3', 'UC 4']
const WATERFALL: ReactNode[] = ['Analysis', 'Design', <>Implemen&shy;tation</>, 'Test']
const ITER: ReactNode[] = ['Iteration 1', 'Iteration 2', 'Iteration 3', 'Iteration 4']

interface Model {
  id: string
  name: string
  periods: ReactNode[]
  /** Kravopfyldelse (0–1) pr. use case efter periode p (1–4). */
  fill: (uc: number, p: number) => number
  note: string
}

const MODELS: Model[] = [
  {
    id: 'wf',
    name: 'Vandfald',
    periods: WATERFALL,
    fill: (_uc, p) => (p >= 4 ? 1 : 0),
    note: 'intet virker før test — sårbar over for ændringer',
  },
  {
    id: 'it',
    name: 'Iterativ og inkrementel',
    periods: ITER,
    fill: (uc, p) => (p > uc ? 1 : 0),
    note: 'timeboxed: skær krav, ikke deadline',
  },
]

function Panel({ m, step }: { m: Model; step: number }) {
  // Slutrammen spoler tilbage til efter periode 3: dér ses forskellen, hvis tiden løber ud.
  const p = step >= 5 ? 3 : step
  return (
    <div className="pm-panel">
      <div className="pm-name">{m.name}</div>
      <div className="pm-chart">
        <div className="pm-axis" aria-hidden="true">
          {[100, 75, 50, 25].map((v) => (
            <span key={v} style={{ bottom: `${v}%` }}>
              {v} %
            </span>
          ))}
        </div>
        <div className="pm-plot">
          {UCS.map((uc, i) => {
            const v = m.fill(i, p)
            return (
              <div key={uc} className="pm-col">
                <div className="pm-track">
                  <motion.div
                    className="pm-bar"
                    initial={false}
                    animate={{ scaleY: v }}
                    transition={v ? stagger(m.id === 'wf' ? i : 0, 0.1, 0.08) : t.fade}
                  />
                </div>
                <span className="pm-uc">{uc}</span>
              </div>
            )
          })}
        </div>
      </div>
      <div className="pm-periods">
        {m.periods.map((per, i) => {
          const done = step >= i + 1
          const count = UCS.filter((_, u) => m.fill(u, i + 1) > 0).length
          return (
            <div
              key={i}
              className="pm-period"
              data-now={step === i + 1 || undefined}
              data-done={done || undefined}
              data-cut={(step >= 5 && i === 3) || undefined}
            >
              <span className="pm-per-name">{per}</span>
              <motion.span
                className="pm-count"
                initial={false}
                animate={{ opacity: done ? 1 : 0 }}
                transition={done ? { ...t.fade, delay: 0.5 } : t.fade}
              >
                {count} af 4 virker
              </motion.span>
            </div>
          )
        })}
      </div>
      <div className="pm-note">
        <Tag show={step >= 5} tone={m.id === 'wf' ? 'neg' : 'focus'} wrap>
          {m.note}
        </Tag>
      </div>
    </div>
  )
}

function Procesmodeller({ step }: { step: number }) {
  return (
    <div className="pm">
      <div className="pm-ylabel vcaps">Kravopfyldelse pr. use case (slide 15)</div>
      <div className="pm-panels">
        {MODELS.map((m) => (
          <Panel key={m.id} m={m} step={step} />
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'procesmodeller',
  title: 'Vandfald mod iterativ og inkrementel udvikling',
  steps: [
    {
      caption: 'Samme fire use cases, samme tid, to processer. Søjlerne viser, hvor meget af hver use case der er opfyldt og virker.',
      hold: 2200,
    },
    {
      caption: 'Vandfaldet analyserer *alle* krav først. Den iterative proces tager én use case hele vejen gennem design, kode og test i første iteration.',
      hold: 2800,
    },
    { caption: 'Vandfaldet designer. Iteration 2 tilføjer næste use case — det er det *inkrementelle*: systemets kapabiliteter udvides.', hold: 2400 },
    { caption: 'Vandfaldet implementerer, men intet er testet endnu. Den iterative proces har tre fungerende use cases.', hold: 2400 },
    {
      caption: 'Først i testfasen viser vandfaldet, om det hele virker. Begge ender med fire use cases, men kun den ene havde noget kørende undervejs.',
      hold: 2800,
    },
    {
      caption: 'Stopper tiden efter tredje periode, har vandfaldet intet kørende og den iterative proces tre use cases. Derfor er iterationer timeboxed: *reduce requirements, do not extend deadline*.',
      hold: 3200,
    },
  ],
  Component: Procesmodeller,
}

export default viz
