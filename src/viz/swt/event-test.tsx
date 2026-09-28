import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './event-test.css'

/* IntroductionHandinTwo.pdf s. 4 (Ladeskabets designskitse med tre events) og
   s. 11 (“Events are your friends – loose coupling”). UsingAndTestingEvents.pdf
   s. 11–13 (TempSensor, ITempSensor, Control), s. 16 (test af kilden med en
   lambda), s. 18 (test af modtageren med Raise.EventWith og tre TestCases) og
   s. 19 (kald ikke handleren direkte). */

function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,(<{])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

const show = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 },
  transition: on ? { ...t.settle, delay } : t.fade,
})

function Bolt({ className }: { className?: string }) {
  return (
    <svg className={`et-bolt ${className ?? ''}`} viewBox="0 0 12 16" aria-hidden="true">
      <path d="M7.5 0 1 9h4.2L3.8 16 11 6.4H6.7L8.6 0Z" />
    </svg>
  )
}

const LADESKAB = [
  { from: 'Door', to: 'StationControl', ev: 'Door Open/Close Events' },
  { from: 'RfidReader', to: 'StationControl', ev: 'RFID Detected Event' },
  { from: 'USBCharger', to: 'ChargeControl', ev: 'Current Event' },
]

interface Ln {
  text: string
  beat: number
  label?: string
  check?: number
}
const SRC: Ln[] = [
  { label: '[SetUp]', text: '_uut = new TempSensor();', beat: 2 },
  { text: '_uut.SetTemp(20);', beat: 2 },
  { text: '_uut.TempChangedEvent += (o, args) => { _receivedEventArgs = args; };', beat: 2 },
  { label: '[Test]', text: '_uut.SetTemp(25);', beat: 3 },
  { text: 'Assert.That(_receivedEventArgs?.Temp, Is.EqualTo(25));', beat: 3, check: 1 },
]
const RCV: Ln[] = [
  { label: '[SetUp]', text: '_tempSource = Substitute.For<ITempSensor>();', beat: 4 },
  { text: '_uut = new Control(_tempSource);', beat: 4 },
  { label: '[TestCase(25)] [TestCase(20)] [TestCase(30)]', text: '_tempSource.TempChangedEvent += Raise.EventWith(new TempChangedEventArgs { Temp = newTemp });', beat: 4 },
  { text: 'Assert.That(_uut.CurrentTemperature, Is.EqualTo(newTemp));', beat: 4, check: 3 },
]
const CASES = [25, 20, 30]

function Code({ lines, step, done }: { lines: Ln[]; step: number; done: boolean }) {
  return (
    <div className="et-code">
      {lines.map((l, i) => (
        <Fragment key={i}>
          {l.label && <div className="et-code-label vcaps">{l.label}</div>}
          <div className="et-ln" data-hot={l.beat === step || undefined}>
            <code>{brk(l.text)}</code>
            {l.check !== undefined && (
              <motion.span className="et-check" {...show(done, 0.8)}>
                {'✓'.repeat(l.check)}
              </motion.span>
            )}
          </div>
        </Fragment>
      ))}
    </div>
  )
}

/** Lodret event-pil mellem en klasse og testens kilde/modtager. */
function VArrow({ on, up, now, label }: { on: boolean; up?: boolean; now?: boolean; label: ReactNode }) {
  return (
    <div className="et-varrow" data-up={up || undefined} data-now={now || undefined} aria-hidden="true">
      <motion.div
        className="et-vline"
        initial={false}
        animate={{ scaleY: on ? 1 : 0, opacity: on ? 1 : 0 }}
        transition={on ? { ...t.travel, duration: 0.5 } : t.fade}
      />
      <motion.span className="et-vlabel" {...show(on, 0.3)}>
        <Bolt />
        {label}
      </motion.span>
    </div>
  )
}

function EventTest({ step }: { step: number }) {
  const pairOn = at(step, 1)
  const srcOn = at(step, 2)
  const srcDone = at(step, 3)
  const rcvOn = at(step, 4)
  const wrong = at(step, 5)

  return (
    <div className="et">
      <section className="et-map" data-now={step === 0 || undefined}>
        <div className="et-map-head">
          <span className="vcaps">Ladeskabet · designskitse</span>
          <em className="et-quote">Events are your friends – loose coupling</em>
        </div>
        <ul className="et-map-list">
          {LADESKAB.map((e) => (
            <li key={e.from}>
              <code>{e.from}</code>
              <span className="et-map-ev">
                <Bolt />
                {e.ev}
              </span>
              <span className="et-map-arrow" aria-hidden="true">
                →
              </span>
              <code>{e.to}</code>
            </li>
          ))}
        </ul>
      </section>

      <div className="et-grid">
        {/* Kilden */}
        <motion.div className="et-cls et-src" data-now={step === 1 || step === 3 || undefined} {...show(pairOn)}>
          <div className="et-cls-head">
            <span className="et-role">kilde</span>
            <code className="et-cls-name">TempSensor</code>
            <code className="et-cls-sub">: ITempSensor</code>
          </div>
          <code className="et-member">+ SetTemp(newTemp : int)</code>
          <code className="et-member">- OnTempChanged(e)</code>
          <div className="et-tagrow">
            <Tag show={srcDone} tone="idle" wrap>
              if (newTemp != _oldTemp)
            </Tag>
          </div>
        </motion.div>

        <div className="et-pair" aria-hidden="true" data-muted={srcOn || undefined}>
          <motion.div className="et-hline" initial={false} animate={{ scaleX: pairOn ? 1 : 0, opacity: pairOn ? 1 : 0 }} transition={pairOn ? { ...t.travel, duration: 0.55 } : t.fade} />
          <motion.span className="et-hlabel" {...show(pairOn, 0.3)}>
            <Bolt />
            <code>TempChangedEvent</code>
          </motion.span>
          <motion.span className="et-hsub" {...show(pairOn, 0.4)}>
            <code>TempChangedEventArgs</code>
          </motion.span>
        </div>

        {/* Modtageren */}
        <motion.div className="et-cls et-rcv" data-now={step === 1 || step === 4 || undefined} {...show(pairOn)}>
          <div className="et-cls-head">
            <span className="et-role">modtager</span>
            <code className="et-cls-name">Control</code>
          </div>
          <code className="et-member">+ CurrentTemperature : int</code>
          <code className="et-member" data-struck={wrong || undefined}>
            - HandleTempChangedEvent(s, e)
          </code>
          <div className="et-tagrow et-vals">
            {CASES.map((c, i) => (
              <motion.span
                key={c}
                className="et-val"
                initial={false}
                animate={rcvOn ? { opacity: 1, y: 0 } : { opacity: 0, y: 14 }}
                transition={rcvOn ? { ...t.travel, delay: 0.35 + i * 0.12 } : t.fade}
              >
                {c}
              </motion.span>
            ))}
          </div>
        </motion.div>

        <VArrow on={srcOn} now={step === 2 || step === 3} label={<code>+= lambda</code>} />
        <VArrow on={rcvOn} up now={step === 4} label={<code>Raise.EventWith</code>} />

        {/* Test af kilden */}
        <motion.section className="et-card et-card-src" data-now={step === 2 || step === 3 || undefined} {...show(srcOn)} aria-hidden={!srcOn || undefined}>
          <header className="et-card-head">
            <span className="et-card-title">Test af kilden</span>
            <span className="et-card-note">testen abonnerer selv</span>
          </header>
          <div className="et-slot">
            <code className="et-slot-name">_receivedEventArgs</code>
            <span className="et-slot-val">
              {srcDone ? (
                <motion.code key="v" className="et-token" initial={{ opacity: 0, y: -36 }} animate={{ opacity: 1, y: 0 }} transition={t.travel}>
                  {'{ Temp = 25 }'}
                </motion.code>
              ) : (
                <code className="et-null">null</code>
              )}
            </span>
          </div>
          <Code lines={SRC} step={step} done={srcDone} />
        </motion.section>

        {/* Test af modtageren */}
        <motion.section className="et-card et-card-rcv" data-now={step === 4 || step === 5 || undefined} {...show(rcvOn)} aria-hidden={!rcvOn || undefined}>
          <header className="et-card-head">
            <span className="et-card-title">Test af modtageren</span>
            <span className="et-card-note">en fake rejser eventet</span>
          </header>
          <div className="et-slot">
            <code className="et-slot-name">_tempSource</code>
            <span className="et-slot-val">
              <code className="et-fake">
                <Bolt /> fake <code>ITempSensor</code>
              </code>
            </span>
          </div>
          <Code lines={RCV} step={step} done={rcvOn} />
          <motion.div className="et-wrong" {...show(wrong)} aria-hidden={!wrong || undefined}>
            <div className="et-wrong-what">
              <span className="et-x">✗</span>
              <s>
                kald <code>HandleTempChangedEvent</code> direkte
              </s>
            </div>
            <ul className="et-wrong-why">
              <li>tester ikke, at UUT har abonneret</li>
              <li>white box: knækker, hvis handleren omdøbes</li>
            </ul>
          </motion.div>
        </motion.section>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'event-test',
  title: 'Et event testes fra kilden og fra modtageren',
  steps: [
    {
      caption: 'Ladeskabets designskitse har tre event-forbindelser. *Events are your friends – loose coupling* — kilden kender ikke modtageren.',
      hold: 2600,
    },
    {
      caption: 'Kursets eksempel: `TempSensor` rejser `TempChangedEvent` fra `ITempSensor`, og `Control` abonnerer. To klasser — to ting at teste.',
      hold: 2600,
    },
    {
      caption: '**Test af kilden**: i `[SetUp]` abonnerer testen selv på UUT’s event med en lambda, der gemmer `args`.',
      hold: 2600,
    },
    {
      caption: '**Act**: `_uut.SetTemp(25)`. Temperaturen ændrer sig fra 20, så eventet rejses, og lambdaen gemmer `Temp = 25`. **Assert** på de gemte data.',
      hold: 3000,
    },
    {
      caption: '**Test af modtageren**: en NSubstitute-fake af `ITempSensor` injiceres og rejser eventet med `Raise.EventWith`. Tre testcases: 25, 20 og 30.',
      hold: 3000,
    },
    {
      caption: 'Den forkerte vej er at kalde `HandleTempChangedEvent` direkte: så testes det ikke, at UUT har abonneret, og testen er white box.',
      hold: 3000,
    },
  ],
  Component: EventTest,
}

export default viz
