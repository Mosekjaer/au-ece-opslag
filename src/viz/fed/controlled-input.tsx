import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './controlled-input.css'

/* FED React Forms.pdf s. 5 (ControlledForm), s. 6 (UncontrolledForm) og s. 9
   (HexColor); de fem trin og “good for …”-noterne fra (Comments)-udgaven s. 5–6.
   Tegnene der tastes (A og x) er figurens egne. */

const STATIONS: { name: ReactNode; what: ReactNode }[] = [
  { name: <code>value=&#123;state.value&#125;</code>, what: 'inputtet viser det, der står i state' },
  { name: <code>onChange</code>, what: 'brugeren taster; eventet fyrer i browseren' },
  {
    name: <code>handleChange</code>,
    what: <code>setState(&#123; value: event.<wbr />target.<wbr />value &#125;)</code>,
  },
  { name: 're-render', what: 'ny state får React til at rendere igen' },
  { name: 'input opdateret', what: 'feltet viser den nye state' },
]

/** Hvilke stationer lyser nu (focus), og hvilke er gennemløbet (ok)? */
function stationTone(i: number, step: number): Tone {
  const now = step === 1 ? [0] : step === 2 ? [1] : step === 3 ? [2, 3] : step === 4 ? [4] : []
  if (now.includes(i)) return 'focus'
  const done = step >= 5 ? 5 : step === 4 ? 4 : step === 3 ? 2 : step === 2 ? 1 : 0
  return i < done ? 'ok' : 'idle'
}

function Val({ v }: { v: string }) {
  return (
    <span className="ci-val">
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={v}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, transition: t.fade }}
          transition={t.place}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function FormMock({ value, hot, extra }: { value: string; hot?: boolean; extra?: ReactNode }) {
  return (
    <div className="ci-form">
      <div className="ci-form-row">
        <span className="ci-label">Name:</span>
        <span className="ci-input" data-hot={hot || undefined}>
          <Val v={value} />
          <span className="ci-caret" />
        </span>
      </div>
      <div className="ci-form-row">
        <span className="ci-submit">Submit</span>
        {extra}
      </div>
    </div>
  )
}

const show = (on: boolean, i = 0, base = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0, y: on ? 0 : 4 },
  transition: on ? stagger(i, base, 0.35) : t.fade,
})

function Forms({ step }: { step: number }) {
  const field = at(step, 4) ? 'A' : ''
  const state = at(step, 3) ? 'A' : ''
  const unc = at(step, 6)
  const done = at(step, 7)

  const token = (
    <Token id="ci-evt" launch={step === 2}>
      "A"
    </Token>
  )

  return (
    <div className="ci">
      <section className="ci-panel" data-dim={step === 6 || undefined}>
        <header className="ci-head">
          <code className="ci-name">ControlledForm</code>
          <span className="ci-sub">state styrer feltet</span>
        </header>

        <div className="ci-top vflow stack">
          <FormMock
            value={field}
            hot={step === 1 || step === 4}
            extra={
              <Tag show={step === 2 || step === 3} tone="idle">
                tast A
              </Tag>
            }
          />
          <Link on={at(step, 1)} back label={<code>value</code>} tone={step === 1 || step === 4 ? 'focus' : 'idle'} />
          <div className="ci-state" data-hot={step === 3 || undefined}>
            <span className="vcaps">state</span>
            <code>
              {'{ value: '}
              <span className="ci-str">
                '<Val v={state} />'
              </span>
              {' }'}
            </code>
          </div>
        </div>

        <div className="ci-ring">
          <motion.div
            className="ci-loop"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: at(step, 4) ? 1 : 0 }}
            transition={at(step, 4) ? t.settle : t.fade}
          />
          <ol className="ci-stations">
            {STATIONS.map((s, i) => (
              <li key={i} className="ci-station" data-tone={stationTone(i, step)}>
                <span className="ci-num">{i + 1}</span>
                <span className="ci-what">
                  <span className="ci-sname">{s.name}</span>
                  <span className="ci-sdesc">{s.what}</span>
                </span>
                <span className="ci-slot">
                  {step === 2 && i === 1 && token}
                  {step === 3 && i === 2 && token}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <motion.div className="ci-hex" {...show(at(step, 5))} aria-hidden={!at(step, 5) || undefined}>
          <div className="ci-hex-head">
            <span className="vcaps">Filtered input</span>
            <code>HexColor</code>
          </div>
          <code className="ci-code">
            setColor(evt.<wbr />target.<wbr />value.<wbr />replace(/[^0-9a-f]/gi, "").<wbr />toUpperCase())
          </code>
          <div className="ci-hex-flow">
            <span className="ci-hex-in">
              <code>
                "BADA55<span className="ci-x">x</span>"
              </code>
              <Tag tone="neg" show={at(step, 5)}>
                x fjernes
              </Tag>
            </span>
            <span className="ci-pair">
              <span className="ci-arrow">→</span>
              <code>color = "BADA55"</code>
            </span>
            <span className="ci-pair">
              <span className="ci-arrow">→</span>
              <span className="ci-input ci-input-sm">BADA55</span>
              <span className="ci-sdesc">feltet står stille</span>
            </span>
          </div>
        </motion.div>

        <motion.p className="ci-verdict" {...show(done)}>
          Godt til real time validation.
        </motion.p>
      </section>

      <motion.section
        className="ci-panel ci-unc"
        initial={false}
        animate={{ opacity: unc ? 1 : 0, x: unc ? 0 : 8 }}
        transition={unc ? t.settle : t.fade}
        aria-hidden={!unc || undefined}
      >
        <header className="ci-head">
          <code className="ci-name">UncontrolledForm</code>
          <span className="ci-sub">værdien bor i DOM’en</span>
        </header>

        <code className="ci-code">const inputRef = useRef();</code>

        <FormMock
          value="A"
          extra={
            <Tag tone="idle" wrap>
              ref=&#123;inputRef&#125;
            </Tag>
          }
        />
        <span className="ci-sdesc">Tastning ændrer feltet direkte. Ingen state, ingen løkke.</span>

        <ol className="ci-submitflow">
          <motion.li {...show(unc, 0, 0.3)}>
            <code>onSubmit</code>
            <span className="ci-arrow">→</span>
            <code>handleSubmit(event)</code>
          </motion.li>
          <motion.li className="ci-blocked" {...show(unc, 1, 0.3)}>
            <Tag tone="neg" show={unc} wrap>
              event.<wbr />preventDefault()
            </Tag>
            <span className="ci-stops">stopper:</span>
            <span className="ci-reload">browseren sender formen og genindlæser siden</span>
          </motion.li>
          <motion.li {...show(unc, 2, 0.3)}>
            <code>input&shy;Ref.<wbr />current.<wbr />value</code>
            <span className="ci-arrow">→</span>
            <code>"A"</code>
          </motion.li>
        </ol>

        <motion.p className="ci-verdict" {...show(done)}>
          Ingen re-render pr. tastetryk — godt til store forms.
        </motion.p>
      </motion.section>
    </div>
  )
}

const viz: VizDef = {
  id: 'controlled-input',
  title: 'Controlled og uncontrolled input',
  steps: [
    { caption: '`ControlledForm`: feltets `value` kommer fra state, som starter som `{ value: \'\' }`.', hold: 1600 },
    { caption: '1. Inputtet viser det, der står i `state.value`.', hold: 1500 },
    {
      caption: '2. Brugeren taster *A*, og `onChange` fyrer i browseren. Feltet selv ændrer sig **endnu ikke**.',
      hold: 2400,
    },
    {
      caption: '3.–4. `handleChange` kalder `setState({ value: event.target.value })`, og den nye state får React til at re-rendere.',
      hold: 2600,
    },
    { caption: '5. Inputtets værdi er opdateret. Feltet viser altid det, der står i state — én runde pr. tastetryk.', hold: 2400 },
    {
      caption: '**Filtered input**: `HexColor` fjerner alt andet end 0–9 og a–f, før state opdateres. Et tastet *x* ændrer derfor ikke feltet.',
      hold: 3000,
    },
    {
      caption:
        '**Uncontrolled**: værdien bliver i DOM’en. Ved submit stopper `preventDefault()` browserens egen submit, og `inputRef.current.value` læses.',
      hold: 3200,
    },
    {
      caption: 'Controlled: state styrer feltet, re-render pr. tastetryk. Uncontrolled: DOM’en holder værdien, som læses ved submit.',
      hold: 3000,
    },
  ],
  Component: Forms,
}

export default viz
