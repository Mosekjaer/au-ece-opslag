import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './flex-vs-grid.css'

/* Flexbox.pdf s. 3–8 og CSS Grid.pdf s. 4–8. Venstre panel er flex-eksemplet (fem <p>
   One–Five), højre panel grid-eksemplet (fem <div> 1–5). Layoutet tegnes med rigtig
   flex/grid-CSS, men hvilke deklarationer der gælder, styres alene af step.
   Items har faste bredder i cqi (15 % af panelet), så wrap sker ens ved alle pladebredder. */

const FLEX_ITEMS = ['One', 'Two', 'Three', 'Four', 'Five']
const AREAS = ['a', 'b', 'c', 'd', 'e']

type FlexMode = 'flow' | 'flex' | 'even' | 'wrap'
const flexMode = (step: number): FlexMode =>
  step <= 0 ? 'flow' : step === 1 ? 'flex' : step === 2 ? 'even' : 'wrap'

type GridMode = 'off' | 'cols' | 'areas'
const gridMode = (step: number): GridMode => (step <= 3 ? 'off' : step === 4 ? 'cols' : 'areas')

/** En kodelinje, der er skjult (men fylder), indtil den gælder. */
function Line({ on, now, indent = 1, children }: { on: boolean; now?: boolean; indent?: number; children: ReactNode }) {
  return (
    <motion.span
      className="fg-line"
      data-now={now || undefined}
      style={{ paddingLeft: `${indent * 1.1}em` }}
      initial={false}
      animate={{ opacity: on ? 1 : 0, x: on ? 0 : -4 }}
      transition={on ? t.settle : t.fade}
    >
      {children}
    </motion.span>
  )
}

function FlexPanel({ step }: { step: number }) {
  const mode = flexMode(step)
  const axes = at(step, 1)
  return (
    <section className="fg-panel" data-tone={step <= 3 ? 'focus' : 'idle'}>
      <header className="fg-head">
        <span className="fg-title">Flexbox</span>
        <span className="fg-sub">én akse</span>
      </header>

      <div className="fg-stage">
        <div className="fg-cross" data-on={axes || undefined}>
          <motion.span className="fg-axis-v" initial={false} animate={{ opacity: axes ? 1 : 0 }} transition={t.fade} />
          <motion.span className="fg-axis-label" initial={false} animate={{ opacity: axes ? 1 : 0 }} transition={t.fade}>
            cross axis
          </motion.span>
        </div>

        <div className="fg-box">
          <motion.div layout className="fg-flex" data-mode={mode} transition={t.place}>
            {FLEX_ITEMS.map((label) => (
              <motion.p key={label} layout className="fg-item" transition={t.place}>
                <motion.span layout="position" transition={t.place}>
                  {label}
                </motion.span>
              </motion.p>
            ))}
          </motion.div>
          {/* Hjælpelinjer: samme flex-regler, fire usynlige items. Kanterne følger første linje. */}
          <motion.div
            className="fg-guides"
            aria-hidden="true"
            initial={false}
            animate={{ opacity: mode === 'wrap' ? 1 : 0 }}
            transition={mode === 'wrap' ? { ...t.fade, delay: 0.5 } : t.fade}
          >
            {[0, 1, 2, 3].map((i) => (
              <span key={i} />
            ))}
          </motion.div>
        </div>

        <div className="fg-main">
          <motion.span className="fg-axis-h" initial={false} animate={{ opacity: axes ? 1 : 0 }} transition={t.fade} />
          <motion.span className="fg-axis-ends" initial={false} animate={{ opacity: axes ? 1 : 0 }} transition={t.fade}>
            <span>main start</span>
            <span className="fg-axis-label">main axis</span>
            <span>main end</span>
          </motion.span>
        </div>
      </div>

      <code className="fg-code">
        <Line on indent={0}>
          {'.container {'}
        </Line>
        <Line on={at(step, 1)} now={step === 1}>
          display: flex;
        </Line>
        <Line on={at(step, 2)} now={step === 2}>
          height: 25vh;
        </Line>
        <Line on={at(step, 2)} now={step === 2}>
          justify-content: space-evenly;
        </Line>
        <Line on={at(step, 2)} now={step === 2}>
          align-items: stretch;
        </Line>
        <Line on={at(step, 3)} now={step === 3}>
          flex-wrap: wrap;
        </Line>
        <Line on indent={0}>
          {'}'}
        </Line>
      </code>

      <div className="fg-notes">
        <Swap
          show={step === 2 ? 1 : step === 3 ? 2 : 0}
          items={[
            <span key="0" />,
            <Fragment key="1">
              <Tag tone="focus">justify-content → main axis</Tag>
              <Tag tone="focus">align-items → cross axis</Tag>
            </Fragment>,
            <Tag key="2" tone="focus" wrap>
              kanterne i de to linjer flugter ikke
            </Tag>,
          ]}
        />
      </div>

      <motion.p
        className="fg-rule"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0 }}
        transition={t.settle}
      >
        Styr layoutet pr. række <em>eller</em> kolonne.
      </motion.p>
    </section>
  )
}

function GridPanel({ step }: { step: number }) {
  const mode = gridMode(step)
  const on = mode !== 'off'
  return (
    <section className="fg-panel" data-tone={on ? (step <= 5 ? 'focus' : 'idle') : 'ghost'}>
      <header className="fg-head">
        <span className="fg-title">Grid</span>
        <span className="fg-sub">to akser</span>
      </header>

      <div className="fg-gstage">
        {/* Nummererede grid lines over de tre kolonner. */}
        <motion.div
          className="fg-lines"
          aria-hidden={!on || undefined}
          initial={false}
          animate={{ opacity: on ? 1 : 0 }}
          transition={on ? { ...t.fade, delay: 0.35 } : t.fade}
        >
          {[1, 2, 3, 4].map((n) => (
            <span key={n} className="fg-lnum" data-n={n}>
              {n}
            </span>
          ))}
        </motion.div>

        <div className="fg-grid" data-mode={mode}>
          {/* De to “.”-celler i named areas. Kun med, når areas gælder — ellers laver de en række. */}
          {mode === 'areas' &&
            ['3 / 1', '3 / 2'].map((a) => (
              <motion.span
                key={a}
                className="fg-dot"
                style={{ gridArea: a }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...t.fade, delay: 0.4 }}
              >
                .
              </motion.span>
            ))}
          {AREAS.map((area, i) => (
            <motion.div
              key={area}
              layout
              className="fg-cell"
              style={mode === 'areas' ? { gridArea: area } : undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...stagger(i, 0, 0.06), layout: t.place } : t.fade}
            >
              <motion.span layout="position" className="fg-cell-in" transition={t.place}>
                <b>{i + 1}</b>
                {i === 4 && <span className="fg-more">has more content.</span>}
              </motion.span>
              <motion.span
                className="fg-area"
                initial={false}
                animate={{ opacity: mode === 'areas' ? 1 : 0 }}
                transition={t.fade}
              >
                {area}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>

      <code className="fg-code">
        <Line on indent={0}>
          {'.container {'}
        </Line>
        <Line on={at(step, 4)} now={step === 4}>
          display: grid;
        </Line>
        <Line on={at(step, 4)} now={step === 4}>
          grid-template-columns: 1fr 1fr 1fr;
        </Line>
        <Line on={at(step, 4)} now={step === 4}>
          grid-gap: 20px;
        </Line>
        <Line on={at(step, 5)} now={step === 5}>
          grid-template-areas:
        </Line>
        <Line on={at(step, 5)} now={step === 5} indent={2}>
          {'"a a a" "b c c"'}
        </Line>
        <Line on={at(step, 5)} now={step === 5} indent={2}>
          {'". . d" "e e d";'}
        </Line>
        <Line on indent={0}>
          {'}'}
        </Line>
        <Line on={at(step, 5)} now={step === 5} indent={0}>
          {'.one { grid-area: a; } …'}
        </Line>
      </code>

      <motion.p
        className="fg-rule"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0 }}
        transition={t.settle}
      >
        Styr layoutet pr. række <em>og</em> kolonne.
      </motion.p>
    </section>
  )
}

function FlexVsGrid({ step }: { step: number }) {
  return (
    <div className="fg">
      <FlexPanel step={step} />
      <GridPanel step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'flex-vs-grid',
  title: 'Én akse mod to akser',
  steps: [
    {
      caption: 'Fem `<p>` i en `<div class="container">` står under hinanden i normal flow.',
      hold: 1400,
    },
    {
      caption:
        '`display: flex` gør containeren til en flex container. Items lægges efter hinanden langs **main axis**; **cross axis** står vinkelret på den.',
      hold: 2400,
    },
    {
      caption:
        '`justify-content: space-evenly` fordeler den ledige plads langs main axis. `align-items: stretch` strækker items langs cross axis.',
      hold: 2600,
    },
    {
      caption:
        'Containeren er for smal til fem, og `flex-wrap: wrap` sender “Five” ned på en ny linje. Hver linje fordeler pladsen for sig, så kanterne ikke flugter.',
      hold: 3000,
    },
    {
      caption:
        '`display: grid` med `1fr 1fr 1fr`: tre kolonner, og begge rækker deler grid lines 1–4. “4” strækkes til samme højde som “5”.',
      hold: 2800,
    },
    {
      caption:
        'Named areas: hver streng i `grid-template-areas` er en række, hvert navn en kolonne, og `.` er en tom celle. “4” (`d`) spænder over to rækker.',
      hold: 3000,
    },
    {
      caption:
        'Flexbox styrer én akse ad gangen: række *eller* kolonne. Grid styrer rækker *og* kolonner på én gang.',
      hold: 3000,
    },
  ],
  Component: FlexVsGrid,
}

export default viz
