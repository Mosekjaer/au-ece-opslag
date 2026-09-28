import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './exec-spec.css'

/* Automated System Test New.pdf: V-modellen s. 2 og 10, kæden Requirements ↔
   Executable Specification ↔ Acceptance Test s. 10, Gherkin-eksemplet s. 11 (ordret),
   “This is also known as BDD” s. 11, verifikation/validering s. 7. */

const V = [
  { l: 'Requirements', r: 'Accept testing', hot: true },
  { l: 'System specification', r: 'System testing', hot: true },
  { l: 'System design', r: 'Integration testing' },
  { l: 'Component design', r: 'Unit test' },
]

const CHAIN = ['Requirements', 'Executable Specification', 'Acceptance Test']

type Line = { label?: string; indent?: 0 | 1; body: ReactNode }
const kw = (s: string) => <span className="es-kw">{s}</span>
const GHERKIN: Line[] = [
  { label: 'Name', body: <>{kw('Feature:')} MicrowavePower</> },
  { label: 'Description', indent: 1, body: <em>I want to cook or heat my food at the correct power</em> },
  { body: <span className="es-at">@power1</span> },
  { label: 'Name', body: <>{kw('Scenario:')} Set Power once</> },
  { label: 'Arrange', indent: 1, body: <>{kw('Given')} The oven is reset</> },
  {
    label: 'Act',
    indent: 1,
    body: (
      <>
        {kw('When')} I press the power button <span className="es-num">1</span> time(s)
      </>
    ),
  },
  {
    label: 'Assert',
    indent: 1,
    body: (
      <>
        {kw('Then')} the display should show <span className="es-num">50</span> W
      </>
    ),
  },
]

function DArrow({ on }: { on: boolean }) {
  return (
    <motion.span className="es-darrow" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? { ...t.fade, delay: 0.25 } : t.fade}>
      <svg viewBox="0 0 36 12" aria-hidden="true">
        <path d="M4 6 H32" />
        <path d="M7.5 2 L2.5 6 L7.5 10 M28.5 2 L33.5 6 L28.5 10" />
      </svg>
    </motion.span>
  )
}

function ExecSpec({ step }: { step: number }) {
  const chainOn = at(step, 1)
  const specOpen = at(step, 2)
  const vvOn = at(step, 4)

  return (
    <div className="es">
      <div className="es-chain">
        {CHAIN.map((c, i) => (
          <div key={c} className="es-chain-cell">
            {i > 0 && <DArrow on={chainOn} />}
            <motion.div
              className="es-doc"
              data-now={(step === 1 || (step === 2 && i === 1)) || undefined}
              data-spec={i === 1 || undefined}
              initial={false}
              animate={{ opacity: chainOn ? 1 : 0, y: chainOn ? 0 : 6 }}
              transition={chainOn ? stagger(i, 0, 0.12) : t.fade}
            >
              {c}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="es-body">
        <div className="es-v" data-now={step === 0 || undefined}>
          <span className="vcaps">V-modellen</span>
          <div className="es-v-rows">
            {V.map((r, i) => (
              <div key={r.l} className="es-v-row" data-hot={r.hot || undefined} style={{ '--i': i } as CSSProperties}>
                <span className="es-v-l">{r.l}</span>
                <span className="es-v-arrow" aria-hidden="true">
                  ↔
                </span>
                <span className="es-v-r">{r.r}</span>
              </div>
            ))}
            <div className="es-v-row es-v-bottom">
              <span>Implement component</span>
            </div>
          </div>
        </div>

        <div className="es-spec">
          <motion.span className="vcaps" initial={false} animate={{ opacity: specOpen ? 1 : 0 }} transition={t.fade}>
            Executable Specification · Gherkin
          </motion.span>
          <div className="es-code" data-open={specOpen || undefined}>
            {GHERKIN.map((g, i) => (
              <motion.div
                key={i}
                className="es-line"
                data-aaa={g.label && ['Arrange', 'Act', 'Assert'].includes(g.label) ? true : undefined}
                initial={false}
                animate={{ opacity: specOpen ? 1 : 0, x: specOpen ? 0 : -6 }}
                transition={specOpen ? stagger(i, 0.1, 0.09) : t.fade}
              >
                <span className="es-label">{g.label}</span>
                <code className="es-text" data-indent={g.indent || undefined}>
                  {g.body}
                </code>
              </motion.div>
            ))}
          </div>
          <div className="es-bdd">
            <Tag show={at(step, 3)} tone={step === 3 ? 'focus' : 'idle'} wrap>
              BDD — Behavior Driven Development
            </Tag>
          </div>
        </div>
      </div>

      <div className="es-vv">
        {[
          { who: 'automatiseret test', what: 'Verification', q: 'did we do it correctly?', note: 'struktureret og disciplineret — fx automatiserede tests' },
          { who: 'bruger / produktejer', what: 'Validation', q: 'did we make the right thing?', note: 'var specifikationen god nok? Fx ved at lade brugeren bruge systemet' },
        ].map((v, i) => (
          <motion.div
            key={v.what}
            className="es-card"
            data-now={step === 4 || undefined}
            initial={false}
            animate={{ opacity: vvOn ? 1 : 0, y: vvOn ? 0 : 6 }}
            transition={vvOn ? stagger(i, 0, 0.25) : t.fade}
          >
            <span className="es-who">{v.who}</span>
            <span className="es-q">
              <strong>{v.what}</strong> — {v.q}
            </span>
            <span className="es-note">{v.note}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'exec-spec',
  title: 'Fra krav til eksekverbar specifikation',
  steps: [
    {
      caption: 'System- og accepttest er de to øverste niveauer i V-modellen: **Requirements ↔ Accept testing** og **System specification ↔ System testing**.',
      hold: 2600,
    },
    {
      caption: 'Kravene oversættes til en **eksekverbar specifikation**, der samtidig *er* accepttesten. Pilene går begge veje.',
      hold: 2400,
    },
    {
      caption: 'Specifikationen skrives i Gherkin. `Given` er Arrange, `When` er Act, og `Then` er Assert.',
      hold: 2800,
    },
    {
      caption: 'Scenariet er både krav og test. Det kaldes **BDD** — Behavior Driven Development.',
      hold: 1800,
    },
    {
      caption: 'Den automatiserede test **verificerer**: gjorde vi det rigtigt? At **validere** — lavede vi det rigtige? — kræver stadig brugeren eller produktejeren.',
      hold: 3000,
    },
  ],
  Component: ExecSpec,
}

export default viz
