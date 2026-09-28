import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './gherkin-steps.css'

/* Automated System Test New.pdf: scenariet s. 11, step definitions s. 17–19 (ordret,
   inkl. det dobbelte “then” i Then-regex’et), Given-trinnets objekter og noten “we aim
   to test the system, not just units” s. 18. Signalvejen Button → UserInterface →
   Display → Output og navnene OnPowerPressed og ShowPower er fra sekvensdiagrammet
   MicrowaveSeqTotal.pdf; sidste hop hedder OutputLine som i Then-trinnet (s. 19). */

/** Blød bindestreg: lange kodenavne må kun knække her (bygges i kode, så formatering ikke fjerner den). */
const SHY = String.fromCharCode(0xad)
const ident = (...parts: string[]) => parts.join(SHY)

/** Kode med brudpunkter efter punktum, komma og parentes — aldrig midt i et ord. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,(])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

/** Markér et udsnit af teksten (det regex’et fanger, eller værdien der fanges). */
function Hit({ on, seen, children }: { on: boolean; seen?: boolean; children: ReactNode }) {
  return (
    <span className="gs-hit" data-on={on || undefined} data-seen={(seen && !on) || undefined}>
      {children}
    </span>
  )
}

const OBJECTS = [
  { id: 'power', name: 'powerButton', cls: 'Button' },
  { id: 'time', name: 'timeButton', cls: 'Button' },
  { id: 'start', name: 'startCancelButton', cls: 'Button' },
  { id: 'door', name: 'door', cls: 'Door' },
  { id: 'timer', name: 'timer', cls: 'Timer' },
  { id: 'display', name: 'display', cls: 'Display' },
  { id: 'tube', name: 'powerTube', cls: 'PowerTube' },
  { id: 'light', name: 'light', cls: 'Light' },
  { id: 'cooker', name: 'cooker', cls: 'CookController' },
  { id: 'ui', name: 'ui', cls: 'UserInterface' },
]

const PATH = [
  { name: 'powerButton', cls: 'Button' },
  { name: 'ui', cls: ident('User', 'Interface') },
  { name: 'display', cls: 'Display' },
  { name: 'output', cls: 'IOutput' },
]
const HOPS = ['OnPowerPressed', 'ShowPower()', 'OutputLine(…)']
/** Hårdt mellemrum, så “50 W” ikke knækker. */
const NBSP = String.fromCharCode(0xa0)

function Gherkin({ step }: { step: number }) {
  const done = at(step, 4)
  const row = (n: number) => (step === n ? 'now' : done || step > n ? 'ok' : 'idle')
  const built = at(step, 1)
  const pressed = at(step, 2)
  const asserted = at(step, 3)

  const match = (n: number, value?: string) => (
    <div className="gs-match" data-state={row(n)}>
      <motion.span
        className="gs-match-line"
        initial={false}
        animate={{ scaleX: at(step, n) ? 1 : 0 }}
        transition={at(step, n) ? { ...t.travel, duration: 0.55 } : t.fade}
      />
      <motion.span
        className="gs-match-label"
        initial={false}
        animate={{ opacity: at(step, n) ? 1 : 0 }}
        transition={at(step, n) ? { ...t.fade, delay: 0.35 } : t.fade}
      >
        {value ?? 'match'}
      </motion.span>
    </div>
  )

  return (
    <div className="gs">
      <div className="gs-grid">
        <span className="vcaps gs-h-l">Scenariet (.feature)</span>
        <span className="gs-h-m" />
        <span className="vcaps gs-h-r">Step definitions (C#)</span>

        <div className="gs-feat">
          <code>
            <span className="gs-kw">Feature:</span> MicrowavePower
          </code>
          <code>
            <span className="gs-kw">Scenario:</span> Set Power once
          </code>
        </div>
        <span />
        <div className="gs-class">
          <code>[Binding]</code>
          <code>public partial class MicrowaveSteps</code>
        </div>

        {/* Given */}
        <div className="gs-step" data-state={row(1)}>
          <code>
            <span className="gs-kw">Given</span> The oven is reset
          </code>
          <Check on={done} />
        </div>
        {match(1)}
        <div className="gs-def" data-state={row(1)}>
          <code className="gs-attr">[Given(@"The oven is reset")]</code>
          <code>public void {ident('Given', 'The', 'Oven', 'Is', 'Reset')}()</code>
          <code className="gs-body">{brk('output = Substitute.For<IOutput>();')}</code>
          <code className="gs-body">{brk('powerButton = new Button(); …')}</code>
        </div>

        {/* When */}
        <div className="gs-step" data-state={row(2)}>
          <code>
            <span className="gs-kw">When</span> I press the power button <Hit on={step === 2} seen={at(step, 2)}>1</Hit> time(s)
          </code>
          <Check on={done} />
        </div>
        {match(2, 'p0 = 1')}
        <div className="gs-def" data-state={row(2)}>
          <code className="gs-attr">
            [When(@"I press the power button <Hit on={step === 2} seen={at(step, 2)}>(.*)</Hit> time\(s\)")]
          </code>
          <code>
            public void {ident('When', 'IPress', 'The', 'Power', 'Button', 'TimeS')}(int p0)
          </code>
          <code className="gs-body">{brk('for (int i = 0; i < p0; ++i) powerButton.Press();')}</code>
        </div>

        {/* Then */}
        <div className="gs-step" data-state={row(3)}>
          <code>
            <span className="gs-kw">Then</span> the display should show <Hit on={step === 3} seen={at(step, 3)}>50</Hit> W
          </code>
          <Check on={done} />
        </div>
        {match(3, 'p0 = 50')}
        <div className="gs-def" data-state={row(3)}>
          <code className="gs-attr">
            [Then(@"then the display should show <Hit on={step === 3} seen={at(step, 3)}>(.*)</Hit> W")]
          </code>
          <code>
            public void {ident('Then', 'Then', 'The', 'Display', 'Should', 'Show', 'W')}(int p0)
          </code>
          <code className="gs-body">{brk('output.Received(1).OutputLine(Arg.Is<string>(str => str.Contains($"Display shows: {p0} W")));')}</code>
        </div>
      </div>

      {/* Systemet, som Given bygger. */}
      <div className="gs-sys" data-built={built || undefined}>
        <span className="vcaps">Systemet fra Given — rigtige klasser, kun IOutput er fake</span>

        <div className="gs-path">
          {PATH.map((p, i) => {
            const fake = p.cls === 'IOutput'
            const lit = pressed && (step === 2 || (step === 3 && fake))
            return (
              <Fragment key={p.name}>
                {i > 0 && (
                  <div className="gs-hop" data-on={pressed || undefined}>
                    <motion.span
                      className="gs-hop-line"
                      initial={false}
                      animate={{ '--p': pressed ? 1 : 0 } as never}
                      transition={pressed ? { ...t.travel, duration: 0.45, delay: 0.25 + (i - 1) * 0.45 } : t.fade}
                    />
                    <motion.code
                      className="gs-hop-label"
                      initial={false}
                      animate={{ opacity: pressed ? 1 : 0 }}
                      transition={pressed ? { ...t.fade, delay: 0.35 + (i - 1) * 0.45 } : t.fade}
                    >
                      {HOPS[i - 1]}
                    </motion.code>
                  </div>
                )}
                <motion.div
                  className="gs-obj"
                  data-fake={fake || undefined}
                  data-last={fake || undefined}
                  data-lit={lit || undefined}
                  initial={false}
                  animate={{ opacity: built ? 1 : 0, y: built ? 0 : 6 }}
                  transition={built ? stagger(i, 0.2, 0.08) : t.fade}
                  style={{ transitionDelay: lit ? `${0.2 + i * 0.45}s` : undefined }}
                >
                  <code className="gs-obj-name">{p.name}</code>
                  <code className="gs-obj-cls">{fake ? brk('Substitute.For<IOutput>()') : `new ${p.cls}(…)`}</code>
                  {i === 0 && (
                    <motion.code className="gs-press" initial={false} animate={{ opacity: pressed ? 1 : 0 }} transition={t.fade}>
                      Press() × p0
                    </motion.code>
                  )}
                  {fake && (
                    <motion.code
                      className="gs-recv"
                      initial={false}
                      animate={{ opacity: asserted ? 1 : 0, y: asserted ? 0 : 4 }}
                      transition={asserted ? { ...t.place, delay: 0.3 } : t.fade}
                    >
                      Received(1) "Display shows: 50{NBSP}W" ✓
                    </motion.code>
                  )}
                </motion.div>
              </Fragment>
            )
          })}
        </div>

        <div className="gs-rest">
          {OBJECTS.filter((o) => !['power', 'ui', 'display'].includes(o.id)).map((o, i) => (
            <motion.code
              key={o.id}
              className="gs-chip"
              initial={false}
              animate={{ opacity: built ? 1 : 0 }}
              transition={built ? stagger(i, 0.45, 0.05) : t.fade}
            >
              {o.name}
              <span className="gs-chip-cls">: {o.cls}</span>
            </motion.code>
          ))}
        </div>
      </div>

      <div className="gs-quote">
        <Tag show={done} tone="focus" wrap>
          “we aim to test the system, not just units!”
        </Tag>
      </div>
    </div>
  )
}

function Check({ on }: { on: boolean }) {
  return (
    <motion.span
      className="gs-check"
      aria-hidden={!on || undefined}
      initial={false}
      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.6 }}
      transition={on ? t.place : t.fade}
    >
      ✓
    </motion.span>
  )
}

const viz: VizDef = {
  id: 'gherkin-steps',
  title: 'Gherkin-trin bundet til step definitions',
  steps: [
    {
      caption: 'Til venstre scenariet, til højre de step definitions, Reqnroll genererer. Hvert trin bindes til en metode via et regulært udtryk i attributten.',
      hold: 2600,
    },
    {
      caption: '`Given` matcher `[Given(@"The oven is reset")]`. Metoden bygger **hele systemet** med rigtige klasser; kun `IOutput` er en `Substitute`.',
      hold: 3000,
    },
    {
      caption: '`When`: `(.*)` fanger “1”, som bliver parameteret `p0 = 1`. `powerButton.Press()` sender signalet gennem `UserInterface` og `Display` til output.',
      hold: 3000,
    },
    {
      caption: '`Then`: `(.*)` fanger “50”, og testen tjekker, at output modtog `"Display shows: 50 W"` præcis én gang. (Regex’et har et ekstra *then* i materialet.)',
      hold: 3000,
    },
    {
      caption: 'Scenariet er grønt. Tallene er parametre, så de samme step definitions genbruges af andre scenarier — og testen kører gennem det rigtige system, ikke kun enheder.',
      hold: 2800,
    },
  ],
  Component: Gherkin,
}

export default viz
