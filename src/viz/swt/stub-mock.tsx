import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './stub-mock.css'

/* Test Types and Fake Types.pdf s. 9–15 og s. 19 (assert på UUT vs. assert på
   mock'en), ECSManualFakes: ECSManualFakeTest.cs (SetUp med tærskel 23,
   RunSelfTest_CombinationOfInput_CorrectOutput med [TestCase(true, false, false)],
   Regulate_TempIsLow_HeaterIsTurnedOn med Temp = 20), Fakes.cs og
   ECS.Redesign/ECS.cs (RunSelfTest: && af de to; Regulate: curTemp < threshold → TurnOn). */

function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,(])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}
const SHY = String.fromCharCode(173)
const cam = (s: string) => s.replace(/([a-z])(?=[A-Z])/g, `$1${SHY}`)

const show = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 },
  transition: on ? { ...t.settle, delay } : t.fade,
})

type Kind = 'state' | 'inter'

interface CodeLine {
  text: string
  /** Del af linjen der er aktiv i et bestemt trin (lokalt 1 = arrange, 2 = act, 3 = assert). */
  parts?: { text: string; beat: number }[]
  beat?: number
  check?: boolean
}

const CODE: Record<Kind, CodeLine[]> = {
  state: [
    { text: '[TestCase(true, false, false)]', beat: 1 },
    { text: '_fakeTempSensor.SelfTestResult = tempResult;', beat: 1 },
    { text: '_fakeHeater.SelfTestResult = heaterResult;', beat: 1 },
    {
      text: '',
      parts: [
        { text: 'Assert.That(', beat: 3 },
        { text: '_uut.RunSelfTest()', beat: 2 },
        { text: ', Is.EqualTo(expectedResult));', beat: 3 },
      ],
      check: true,
    },
  ],
  inter: [
    { text: '[Test]', beat: 1 },
    { text: '_fakeTempSensor.Temp = 20;', beat: 1 },
    { text: '_uut.Regulate();', beat: 2 },
    { text: 'Assert.That(_fakeHeater.TurnOnCalledTimes, Is.EqualTo(1));', beat: 3, check: true },
  ],
}

function Fake({
  name,
  field,
  value,
  call,
  ret,
  local,
  hotArrange,
  hotAct,
  role,
  roleOn,
  asserted,
}: {
  name: string
  field: string
  value: ReactNode
  call: string
  ret?: ReactNode
  local: number
  hotArrange: boolean
  hotAct: boolean
  role: 'stub' | 'mock'
  roleOn: boolean
  asserted?: boolean
}) {
  return (
    <div className="sm-box sm-fake" data-hot={hotArrange || hotAct || undefined} data-asserted={asserted || undefined}>
      <div className="sm-box-head">
        <span className="sm-name">{cam(name)}</span>
        <Tag show={roleOn} tone={role === 'mock' ? 'neg' : 'idle'}>
          {role}
        </Tag>
      </div>
      <motion.div className="sm-field" {...show(at(local, 1))}>
        <code>{cam(field)}</code> = <code className="sm-val">{value}</code>
      </motion.div>
      <motion.div className="sm-field sm-call" {...show(at(local, 2), 0.35)}>
        <span className="sm-lbl">kald</span>
        <code>{call}</code>
        {ret !== undefined && (
          <>
            {' '}
            → <code className="sm-val">{ret}</code>
          </>
        )}
      </motion.div>
    </div>
  )
}

function Panel({ kind, step }: { kind: Kind; step: number }) {
  const base = kind === 'state' ? 0 : 3
  const local = step >= 7 ? 3 : Math.max(0, Math.min(3, step - base))
  const active = step > base && step <= base + 3
  const muted = !active && step !== 7 && step !== 0
  const isState = kind === 'state'
  const acted = at(local, 2)
  const asserted = at(local, 3)

  return (
    <section className="sm-panel" data-kind={kind} data-muted={muted || undefined} data-active={active || undefined}>
      <header className="sm-panel-head">
        <span className="sm-panel-title">{isState ? 'State-baseret test' : 'Interaktionsbaseret test'}</span>
        <motion.span className="sm-panel-where" {...show(asserted)}>
          assert på <b>{isState ? 'UUT' : 'mock’en'}</b>
        </motion.span>
      </header>

      <div className="sm-dia">
        <div className="sm-box sm-uut" data-hot={(active && local === 2) || (isState && active && local === 3) || undefined} data-asserted={(isState && asserted) || undefined}>
          <div className="sm-box-head">
            <span className="sm-name">_uut : ECS</span>
          </div>
          <div className="sm-field sm-dim">
            <code>{cam('TemperatureThreshold')}</code> = <code>23</code>
          </div>
          <motion.div className="sm-field" {...show(acted)}>
            <code>{isState ? 'RunSelfTest()' : 'Regulate()'}</code>
          </motion.div>
          <motion.div className="sm-field sm-result" {...show(acted, 0.6)}>
            {isState ? (
              <>
                <code>true &amp;&amp; false</code> → returnerer <code className="sm-val">false</code>
              </>
            ) : (
              <>
                <code>20 &lt; 23</code> → <code className="sm-val">TurnOn()</code>
              </>
            )}
          </motion.div>
        </div>

        <div className="sm-links sm-links-1" aria-hidden="true">
          <Link on={acted} tone={active && local === 2 ? 'focus' : 'idle'} />
          <Link on={acted} back tone={active && local === 2 ? 'focus' : 'idle'} />
        </div>
        <div className="sm-links sm-links-2" aria-hidden="true">
          <Link on={acted} tone={active && local === 2 ? 'focus' : 'idle'} />
          {isState && <Link on={acted} back tone={active && local === 2 ? 'focus' : 'idle'} />}
        </div>

        <div className="sm-fakes-1">
          <Fake
            name="FakeTempSensor"
            field={isState ? 'SelfTestResult' : 'Temp'}
            value={isState ? 'true' : '20'}
            call={isState ? 'RunSelfTest()' : 'GetTemp()'}
            ret={isState ? 'true' : '20'}
            local={local}
            hotArrange={active && local === 1}
            hotAct={active && local === 2}
            role="stub"
            roleOn={asserted}
          />
        </div>
        <div className="sm-fakes-2">
          <Fake
            name="FakeHeater"
            field={isState ? 'SelfTestResult' : 'TurnOnCalledTimes'}
            value={
              isState ? (
                'false'
              ) : (
                <motion.span key={acted ? 'one' : 'zero'} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ ...t.settle, delay: acted ? 0.7 : 0 }}>
                  {acted ? '1' : '0'}
                </motion.span>
              )
            }
            call={isState ? 'RunSelfTest()' : 'TurnOn()'}
            ret={isState ? 'false' : undefined}
            local={local}
            hotArrange={active && local === 1}
            hotAct={active && local === 2}
            role={isState ? 'stub' : 'mock'}
            roleOn={asserted}
            asserted={!isState && asserted}
          />
        </div>

        <div className="sm-up sm-up-uut" aria-hidden="true">
          <Link on={acted} vertical back label="Act" tone={active && local === 2 ? 'focus' : 'idle'} />
          {isState && <Link on={asserted} vertical back label="Assert" tone="neg" className="sm-assert" />}
        </div>
        <div className="sm-up sm-up-fake" aria-hidden="true">
          {!isState && <Link on={asserted} vertical back label="Assert" tone="neg" className="sm-assert" />}
        </div>

        <div className="sm-test" data-hot={active || undefined}>
          <div className="sm-test-head">
            <span className="vcaps">Testkode</span>
          </div>
          {CODE[kind].map((l, i) => {
            const lineHot = active && l.beat === local
            return (
              <div key={i} className="sm-ln" data-hot={lineHot || undefined}>
                <code>
                  {l.parts
                    ? l.parts.map((p, j) => (
                        <span key={j} className="sm-part" data-hot={(active && p.beat === local) || undefined}>
                          {brk(p.text)}
                        </span>
                      ))
                    : brk(l.text)}
                </code>
                {l.check && (
                  <motion.span className="sm-check" {...show(asserted, 0.5)}>
                    ✓
                  </motion.span>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}

function StubMock({ step }: { step: number }) {
  return (
    <div className="sm">
      <div className="sm-setup" data-hot={step === 0 || undefined}>
        <span className="vcaps">[SetUp]</span>
        <code>{brk('_uut = new ECS(_fakeTempSensor, _fakeHeater, 23);')}</code>
      </div>
      <div className="sm-panels">
        <Panel kind="state" step={step} />
        <Panel kind="inter" step={step} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'stub-mock',
  title: 'Hvor assert’en rammer i en stub- og en mock-test',
  steps: [
    {
      caption: 'Begge tests har samme opstilling: `ECS` får to håndskrevne fakes gennem konstruktøren og tærsklen 23.',
      hold: 2200,
    },
    {
      caption: '**Arrange**: `[TestCase(true, false, false)]` sætter fakenes `SelfTestResult` — sensoren består, varmelegemet ikke.',
      hold: 2600,
    },
    {
      caption: '**Act**: `_uut.RunSelfTest()` spørger begge fakes og returnerer `true && false`, altså `false`.',
      hold: 2600,
    },
    {
      caption: '**Assert** rammer **UUT**: returværdien er `false`. Fakes rammes aldrig af assert — de er **stubs**.',
      hold: 2800,
    },
    {
      caption: '**Arrange**: stubben `FakeTempSensor` leverer `Temp = 20`. `FakeHeater` tæller kald til `TurnOn()` og står på 0.',
      hold: 2600,
    },
    {
      caption: '**Act**: `_uut.Regulate()` læser 20, ser at 20 < 23 og kalder `TurnOn()`. Tælleren går fra 0 til 1.',
      hold: 2600,
    },
    {
      caption: '**Assert** rammer **mock’en**: `TurnOnCalledTimes` er 1. Mock’en kan få testen til at fejle; stubben kan ikke.',
      hold: 2800,
    },
    {
      caption: 'Samme fakes, to testtyper. Forskellen er, **hvor assert’en står**: på UUT (stubs er nok) eller på mock’en.',
      hold: 3000,
    },
  ],
  Component: StubMock,
}

export default viz
