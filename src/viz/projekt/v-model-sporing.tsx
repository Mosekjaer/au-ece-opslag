import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { Node, Tag, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './v-model-sporing.css'

/* V-modellen fra System Test.pdf slide 14 (aktiviteterne og de vandrette koblinger),
   verification/validation fra slide 15 (2024-udgaven: System står under begge),
   UC → accepttest fra slide 27–28, drivers/stubs fra slide 24. Bundlinjen om
   hvornår testen specificeres og køres er SPU, Vejledning i softwaretest s. 175–176
   (fig. 2) og s. 206–207 (fig. 15). */

interface Level {
  id: string
  dev: string
  devSub: string
  test: string
  testSub: string
  /** Trin hvor testniveauet tændes. */
  at: number
  ver: boolean
  val: boolean
}

const LEVELS: Level[] = [
  {
    id: 'acc',
    dev: 'Requirements Analysis',
    devSub: 'krav og use cases',
    test: 'Acceptance test',
    testSub: 'med kunden: hver sti i en use case får sit testscenarie',
    at: 4,
    ver: false,
    val: true,
  },
  {
    id: 'sys',
    dev: 'System Design',
    devSub: 'systemdesign',
    test: 'System test',
    testSub: 'hele systemet mod systemdesignet',
    at: 3,
    ver: true,
    val: true,
  },
  {
    id: 'int',
    dev: 'Architectural Design',
    devSub: 'arkitektur og grænseflader',
    test: 'Integration test',
    testSub: 'samspil og grænseflader; drivers (bottom-up) eller stubs (top-down)',
    at: 2,
    ver: true,
    val: false,
  },
  {
    id: 'unit',
    dev: 'Module Design',
    devSub: 'moduldesign',
    test: 'Unit test',
    testSub: 'hver komponent for sig',
    at: 1,
    ver: true,
    val: false,
  },
]

function VModel({ step }: { step: number }) {
  const vv = step >= 5
  const timing = step >= 6

  return (
    <div className="vms">
      <div className="vms-legs" aria-hidden="true">
        <span className="vcaps">Udvikling ↓</span>
        <span className="vcaps">Test ↑</span>
      </div>

      <ol className="vms-rows">
        {LEVELS.map((l, i) => {
          const on = step >= l.at
          const now = step === l.at
          const testTone: Tone = now ? 'focus' : on ? 'idle' : 'ghost'
          const devTone: Tone = now || step === 0 ? 'focus' : 'idle'
          return (
            <li key={l.id} className="vms-row" style={{ '--depth': i } as CSSProperties}>
              <Node className="vms-dev" title={l.dev} sub={l.devSub} tone={devTone} />
              <div className="vms-link" data-tone={now ? 'focus' : 'idle'}>
                <motion.span
                  className="vms-dash"
                  initial={false}
                  animate={{ scaleX: on ? 1 : 0 }}
                  transition={on ? { ...t.travel, duration: 0.6 } : t.fade}
                />
              </div>
              <Node className="vms-test" title={l.test} tone={testTone}>
                <motion.div
                  className="vms-test-sub"
                  initial={false}
                  animate={{ opacity: on ? 1 : 0 }}
                  transition={on ? t.settle : t.fade}
                >
                  {l.testSub}
                </motion.div>
                <div className="vms-vv">
                  {l.ver && (
                    <Tag tone="idle" show={vv}>
                      verification
                    </Tag>
                  )}
                  {l.val && (
                    <Tag tone="focus" show={vv}>
                      validation
                    </Tag>
                  )}
                </div>
              </Node>
            </li>
          )
        })}
        <li className="vms-row vms-bottom" style={{ '--depth': 4 } as CSSProperties}>
          <Node className="vms-impl" title="Module Impl." sub="koden" tone={step === 1 ? 'focus' : 'idle'} />
        </li>
      </ol>

      <motion.div
        className="vms-vvlegend"
        initial={false}
        animate={{ opacity: vv ? 1 : 0 }}
        transition={vv ? t.settle : t.fade}
        aria-hidden={!vv || undefined}
      >
        <span>
          <strong>Verification</strong> — <em>build the thing right</em>: internt, i alle faser.
        </span>
        <span>
          <strong>Validation</strong> — <em>build the right thing</em>: eksternt, mod krav og brugerbehov.
        </span>
      </motion.div>

      <div className="vms-timing" aria-hidden={!timing || undefined}>
        {[
          { k: 'spec', head: 'Venstre ben', body: 'testen specificeres og designes, så snart dokumentet findes → testspecifikation' },
          { k: 'run', head: 'Højre ben', body: 'testen implementeres, køres og evalueres → testrapport' },
        ].map((c, i) => (
          <motion.div
            key={c.k}
            className="vms-time"
            initial={false}
            animate={{ opacity: timing ? 1 : 0, y: timing ? 0 : 4 }}
            transition={timing ? stagger(i, 0, 0.12) : t.fade}
          >
            <span className="vms-time-head">{c.head}</span>
            <span className="vms-time-body">{c.body}</span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'v-model-sporing',
  title: 'V-modellen: hvert testniveau tester mod sit eget dokument',
  steps: [
    {
      caption: 'Udviklingen går ned ad venstre ben: fra kravanalyse over system- og arkitekturdesign til moduldesign.',
      hold: 2200,
    },
    {
      caption: 'I bunden står koden. **Unit testen** tester hver komponent mod moduldesignet.',
      hold: 2200,
    },
    {
      caption:
        '**Integrationstesten** samler unit-testede komponenter og tester samspillet mod arkitekturen og grænsefladerne — bottom-up med drivers eller top-down med stubs.',
      hold: 2800,
    },
    { caption: '**Systemtesten** tester hele systemet mod systemdesignet.', hold: 2000 },
    {
      caption:
        '**Accepttesten** gennemføres med kunden mod kravene. Hver use case mappes til test, og hver sti gennem den får sit eget testscenarie.',
      hold: 2800,
    },
    {
      caption:
        'Unit-, integrations- og systemtest **verificerer**; system- og accepttest **validerer**. Slides placerer systemtesten under begge.',
      hold: 2800,
    },
    {
      caption:
        'De vandrette koblinger er også tid: testen *specificeres* på venstre ben, når dokumentet den tester mod er skrevet, og *køres* på højre ben. Resultatet er en testrapport pr. niveau.',
      hold: 3400,
    },
  ],
  Component: VModel,
}

export default viz
