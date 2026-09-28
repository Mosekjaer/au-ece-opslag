import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Swap } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './c4-integration.css'

/* ContinuousAgileIntegration.pdf s. 5 (niveauerne og "Zoom in"), s. 7 (Level 1:
   Personal Banking Customer, Internet Banking System, E-mail System, Mainframe
   Banking System), s. 8 (Level 2, interfaces internt og eksternt markeret røde),
   s. 9 (Level 3 i API Application: controllere og komponenter; "automatic
   unit/component testing can cover as much as possible (green)", "system
   integration can be done manually or with less work (red)"). Eksemplet er
   c4model.com's Internet Banking System; færre bokse end originalen. */

type Kind = 'person' | 'box' | 'ext' | 'db'
type Tone = 'idle' | 'target' | 'green' | 'edge'

function Box({
  name,
  type,
  kind = 'box',
  tone = 'idle',
  style,
}: {
  name: ReactNode
  type: string
  kind?: Kind
  tone?: Tone
  style?: CSSProperties
}) {
  return (
    <div className="c4i-box" data-kind={kind} data-tone={tone} style={style}>
      <span className="c4i-name">{name}</span>
      <span className="c4i-type">[{type}]</span>
    </div>
  )
}

function VL({ on, tone, style }: { on: boolean; tone: 'idle' | 'neg'; style: CSSProperties }) {
  return (
    <div className="c4i-v" style={style}>
      <Link vertical on={on} tone={tone} />
    </div>
  )
}

/** Stiplet grænse bag boksene; etiketten får sin egen række øverst i grænsen. */
function Boundary({ label, rows, cols }: { label: string; rows: string; cols: string }) {
  return (
    <>
      <div className="c4i-bound" style={{ gridRow: rows, gridColumn: cols }} />
      <span className="c4i-bound-label" style={{ gridRow: 1, gridColumn: cols }}>
        {label}
      </span>
    </>
  )
}

/** Zoom: niveauet lander let forstørret og falder på plads. */
function Level({ on, children, className }: { on: boolean; children: ReactNode; className: string }) {
  return (
    <motion.div
      className={`c4i-level ${className}`}
      initial={false}
      animate={{ scale: on ? 1 : 0.94 }}
      transition={on ? t.settle : t.fade}
    >
      {children}
    </motion.div>
  )
}

function Context({ step }: { step: number }) {
  const on = step === 0
  return (
    <Level on={on} className="c4i-l1">
      <Box name="Personal Banking Customer" type="Person" kind="person" style={{ gridRow: 1, gridColumn: 1 }} />
      <VL on style={{ gridRow: 2, gridColumn: 1 }} tone="idle" />
      <Box name="Internet Banking System" type="Software System" tone="target" style={{ gridRow: 3, gridColumn: 1 }} />
      <div className="c4i-h" style={{ gridRow: 3, gridColumn: 2 }}>
        <Link on tone="idle" />
      </div>
      <Box name={<>E-mail System</>} type="Software System" kind="ext" style={{ gridRow: 3, gridColumn: 3 }} />
      <VL on style={{ gridRow: 4, gridColumn: 1 }} tone="idle" />
      <Box name="Mainframe Banking System" type="Software System" kind="ext" style={{ gridRow: 5, gridColumn: 1 }} />
    </Level>
  )
}

function Containers({ step }: { step: number }) {
  const red = step >= 2
  const tone = red ? 'neg' : 'idle'
  return (
    <Level on={step === 1 || step === 2} className="c4i-l2">
      <Boundary label="Internet Banking System" rows="1 / 5" cols="1 / 5" />
      <Box name="Web Application" type="Container" style={{ gridRow: 2, gridColumn: 1 }} />
      <Box name="Single-Page Application" type="Container" style={{ gridRow: 2, gridColumn: 3 }} />
      <Box name="Mobile App" type="Container" style={{ gridRow: 2, gridColumn: 4 }} />
      <VL on tone={tone} style={{ gridRow: 3, gridColumn: 3 }} />
      <VL on tone={tone} style={{ gridRow: 3, gridColumn: 4 }} />
      <Box name="Database" type="Container" kind="db" style={{ gridRow: 4, gridColumn: 1 }} />
      <div className="c4i-h" style={{ gridRow: 4, gridColumn: 2 }}>
        <Link on back tone={tone} />
      </div>
      <Box name="API Application" type="Container" tone={red ? 'target' : 'idle'} style={{ gridRow: 4, gridColumn: '3 / 5' }} />
      <VL on tone={tone} style={{ gridRow: 5, gridColumn: 3 }} />
      <VL on tone={tone} style={{ gridRow: 5, gridColumn: 4 }} />
      <Box name="E-mail System" type="Software System" kind="ext" style={{ gridRow: 6, gridColumn: 3 }} />
      <Box name={<>Mainframe Banking System</>} type="Software System" kind="ext" style={{ gridRow: 6, gridColumn: 4 }} />
    </Level>
  )
}

function Components({ step }: { step: number }) {
  const colored = step >= 4
  const g: Tone = colored ? 'green' : 'idle'
  const e: Tone = colored ? 'edge' : 'idle'
  const out = colored ? 'neg' : 'idle'
  return (
    <Level on={step >= 3} className="c4i-l3">
      <Boundary label="API Application" rows="1 / 5" cols="1 / 4" />
      <Box name="Sign In Controller" type="Component" tone={g} style={{ gridRow: 2, gridColumn: 1 }} />
      <Box name="Reset Password Controller" type="Component" tone={g} style={{ gridRow: 2, gridColumn: 2 }} />
      <Box name="Accounts Summary Controller" type="Component" tone={g} style={{ gridRow: 2, gridColumn: 3 }} />
      <VL on tone="idle" style={{ gridRow: 3, gridColumn: 1 }} />
      <VL on tone="idle" style={{ gridRow: 3, gridColumn: 2 }} />
      <VL on tone="idle" style={{ gridRow: 3, gridColumn: 3 }} />
      <Box name="Security Component" type="Component" tone={e} style={{ gridRow: 4, gridColumn: 1 }} />
      <Box name="E-mail Component" type="Component" tone={e} style={{ gridRow: 4, gridColumn: 2 }} />
      <Box name={<>Mainframe Banking System Facade</>} type="Component" tone={e} style={{ gridRow: 4, gridColumn: 3 }} />
      <VL on tone={out} style={{ gridRow: 5, gridColumn: 1 }} />
      <VL on tone={out} style={{ gridRow: 5, gridColumn: 2 }} />
      <VL on tone={out} style={{ gridRow: 5, gridColumn: 3 }} />
      <Box name="Database" type="Container" kind="db" style={{ gridRow: 6, gridColumn: 1 }} />
      <Box name="E-mail System" type="Software System" kind="ext" style={{ gridRow: 6, gridColumn: 2 }} />
      <Box name={<>Mainframe Banking System</>} type="Software System" kind="ext" style={{ gridRow: 6, gridColumn: 3 }} />
    </Level>
  )
}

/* Brødkrummen som kort: hvert niveau beholder sine vigtigste navne, når man har
   zoomet videre, så slutrammen også viser Level 1 og 2. */
const CRUMBS: { name: string; body: ReactNode; red?: ReactNode }[] = [
  {
    name: 'Context',
    body: (
      <>
        Personal Banking Customer → <b>Internet Banking System</b> → E-mail System, Mainframe Banking System
      </>
    ),
  },
  {
    name: 'Containers',
    body: (
      <>
        Web Application · Single-Page Application · Mobile App · <b>API Application</b> · Database
      </>
    ),
    red: (
      <>
        apps → API Application → Database, E-mail System, Mainframe Banking System
      </>
    ),
  },
  { name: 'Components', body: <>controllere og komponenter i API Application</> },
  { name: 'Code', body: <>klasser — ikke vist</> },
]

function C4({ step }: { step: number }) {
  const level = step === 0 ? 0 : step <= 2 ? 1 : 2
  const last = 5
  return (
    <div className="c4i">
      <ol className="c4i-crumbs" aria-label="C4-niveauer">
        {CRUMBS.map((c, i) => {
          const seen = i <= level
          return (
            <li
              key={c.name}
              className="c4i-crumb"
              data-lv={i + 1}
              data-now={i === level || undefined}
              data-past={i < level || undefined}
            >
              <span className="c4i-crumb-head">
                <span className="c4i-crumb-n">Level {i + 1}</span>
                <span className="c4i-crumb-name">{c.name}</span>
              </span>
              <motion.span
                className="c4i-crumb-body"
                initial={false}
                animate={{ opacity: seen ? 1 : 0 }}
                transition={seen ? { ...t.fade, delay: 0.3 } : t.fade}
                aria-hidden={!seen || undefined}
              >
                <span>{c.body}</span>
                {c.red && (
                  <motion.span
                    className="c4i-crumb-red"
                    initial={false}
                    animate={{ opacity: step >= 2 ? 1 : 0 }}
                    transition={step >= 2 ? { ...t.fade, delay: 0.3 } : t.fade}
                  >
                    <span className="c4i-crumb-mark" aria-label="rød" /> {c.red}
                  </motion.span>
                )}
              </motion.span>
            </li>
          )
        })}
      </ol>

      <Swap
        className="c4i-stage"
        show={level}
        items={[<Context key="1" step={step} />, <Containers key="2" step={step} />, <Components key="3" step={step} />]}
      />

      <motion.dl
        className="c4i-legend"
        initial={false}
        animate={{ opacity: step >= 4 ? 1 : 0 }}
        transition={t.fade}
        aria-hidden={step < 4 || undefined}
      >
        {[
          { k: 'green', t: 'automatisk unit-/komponenttest dækker mest muligt' },
          { k: 'red', t: 'systemintegration: manuelt eller med mindre arbejde' },
        ].map((l, i) => (
          <motion.div
            key={l.k}
            initial={false}
            animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 3 }}
            transition={step >= 4 ? stagger(i, step === last ? 0.1 : 0.5, 0.12) : t.fade}
          >
            <dt className="c4i-swatch" data-k={l.k} aria-label={l.k === 'green' ? 'grøn' : 'rød'} />
            <dd>{l.t}</dd>
          </motion.div>
        ))}
      </motion.dl>
    </div>
  )
}

const viz: VizDef = {
  id: 'c4-integration',
  title: 'Zoom gennem C4 til det, der skal integreres',
  steps: [
    {
      caption: '**Level 1 · Context**: en kunde bruger Internet Banking System, som bruger to eksterne systemer. Et billede, man kan vise til ikke-teknikere.',
      hold: 2600,
    },
    {
      caption: 'Zoom ind i Internet Banking System: **Level 2 · Containers** — separat kørbare enheder som apps, API Application og Database.',
      hold: 2600,
    },
    {
      caption: 'På containerniveau bliver interfacene internt og eksternt mellem systemerne synlige (**rød**). Det er dem, systemintegrationen handler om.',
      hold: 3000,
    },
    { caption: 'Zoom ind i API Application: **Level 3 · Components** — controllere og de komponenter, de bruger.', hold: 2400 },
    {
      caption: 'Komponenterne designes, så automatiske unit- og komponenttests dækker mest muligt (**grøn**). Kun forbindelserne ud af containeren er systemintegration (**rød**).',
      hold: 3000,
    },
    {
      caption: 'Context → Containers → Components → Code. Indkapsl eksterne afhængigheder lavt, så systemintegrationen bliver lille.',
      hold: 3000,
    },
  ],
  Component: C4,
}

export default viz
