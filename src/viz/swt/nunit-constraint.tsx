import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './nunit-constraint.css'

/* Introduction to Unit Tests.pdf s. 11 (klassisk vs. constraint), s. 13 (item og verber),
   s. 14 (constraints), s. 15 (modifiers). Pladsholderne <value>, <precision> osv. er slidets egne. */

const ITEMS = ['værdi, fx returværdi eller property', 'reference til et objekt', 'metode eller lambda uden parametre']

const VERBS: { v: string; note?: string }[] = [
  { v: 'Is.' },
  { v: 'Has.' },
  { v: 'Contains.', note: 'item: string eller collection' },
  { v: 'Does.' },
  { v: 'Throws.', note: 'item: metode eller lambda' },
]

const CONSTRAINTS = [
  '.EqualTo(<value>)',
  '.GreaterThan(<value>)',
  '.LessThan(<value>)',
  '.InRange(<value>, <value>)',
  '.Null',
  '.Empty',
  '.TypeOf<>',
]

const MODIFIERS: { m: string; kind: string; note?: string }[] = [
  { m: '.Not.', kind: 'præfiks' },
  { m: '.And. / .Or.', kind: 'infiks' },
  { m: '.Within(<precision>)', kind: 'postfiks', note: 'double/float/tider' },
  { m: '.After.', kind: 'postfiks', note: 'tidsmæssig opfyldelse' },
]

function Fade({
  show,
  i = 0,
  base = 0,
  li,
  children,
  className,
}: {
  show: boolean
  i?: number
  base?: number
  li?: boolean
  children: ReactNode
  className?: string
}) {
  const El = li ? motion.li : motion.div
  return (
    <El
      className={className}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 4 }}
      transition={show ? stagger(i, base, 0.07) : t.fade}
      aria-hidden={!show || undefined}
    >
      {children}
    </El>
  )
}

function Arg({ children, label, role, on }: { children: ReactNode; label: ReactNode; role?: boolean; on?: boolean }) {
  return (
    <span className="nc-arg" data-role={role || undefined}>
      <span className="nc-arg-code">{children}</span>
      <motion.span className="nc-label" initial={false} animate={{ opacity: on === false ? 0 : 1 }} transition={t.fade}>
        {label}
      </motion.span>
    </span>
  )
}

function Constraint({ step }: { step: number }) {
  const built = at(step, 1)
  const pattern = at(step, 2)
  const cons = at(step, 3)
  const mods = at(step, 4)

  const x = (
    <Token id="nc-x" tone={step === 1 ? 'focus' : 'idle'}>
      x
    </Token>
  )
  const ten = (
    <Token id="nc-10" tone={step === 1 ? 'focus' : 'idle'}>
      10
    </Token>
  )
  const stat = (s: string) => <span className="nc-static">{s}</span>

  return (
    <div className="nc">
      <div className="nc-models">
        <div className="nc-model" data-state={step === 0 ? 'now' : 'past'}>
          <span className="vcaps">Klassisk model</span>
          <div className="nc-line">
            <code>Assert.AreEqual(</code>
            <Arg label="expected">{built ? stat('10') : ten}</Arg>
            <code>,&nbsp;</code>
            <Arg label="actual">{built ? stat('x') : x}</Arg>
            <code>);</code>
          </div>
        </div>

        <div className="nc-model" data-state={built ? (step === 1 ? 'now' : 'past') : 'ghost'}>
          <span className="vcaps">Constraint-model</span>
          <motion.div
            className="nc-line"
            initial={false}
            animate={{ opacity: built ? 1 : 0 }}
            transition={t.fade}
            aria-hidden={!built || undefined}
          >
            <code>Assert.That(</code>
            <Arg label="actual">
              <span className="nc-role" data-on={pattern || undefined}>
                {built ? x : null}
              </span>
            </Arg>
            <code>,&nbsp;</code>
            <Arg label="constraint med expected">
              <code className="nc-role" data-on={pattern || undefined}>
                Is.
              </code>
              <code className="nc-role" data-on={cons || undefined}>
                EqualTo({built ? ten : null})
              </code>
            </Arg>
            <code>);</code>
          </motion.div>
        </div>
      </div>

      <Fade show={pattern} className="nc-pattern">
        <code>
          Assert.That(<b>&lt;item&gt;</b>, <b>&lt;verb&gt;</b>.<b data-on={cons || undefined}>&lt;constraint&gt;</b>)
        </code>
        <span className="nc-pattern-note">de fleste constraints følger mønsteret, men ikke alle</span>
      </Fade>

      <div className="nc-parts">
        <Fade show={pattern} className="nc-col">
          <span className="vcaps">&lt;item&gt; kan være</span>
          <ul className="nc-items">
            {ITEMS.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </Fade>

        <Fade show={pattern} base={0.1} className="nc-col">
          <span className="vcaps">&lt;verb&gt;</span>
          <ul className="nc-chips">
            {VERBS.map((v, i) => (
              <Fade key={v.v} show={pattern} i={i} base={0.15} className="nc-chip-row" li>
                <code className="nc-chip">{v.v}</code>
                {v.note && <span className="nc-note">{v.note}</span>}
              </Fade>
            ))}
          </ul>
        </Fade>

        <Fade show={cons} className="nc-col">
          <span className="vcaps">&lt;constraint&gt;, fx</span>
          <ul className="nc-chips is-flow">
            {CONSTRAINTS.map((c, i) => (
              <Fade key={c} show={cons} i={i} base={0.05} className="nc-chip-row" li>
                <code className="nc-chip">{c}</code>
              </Fade>
            ))}
          </ul>
        </Fade>

        <Fade show={mods} className="nc-col nc-mods">
          <span className="vcaps">Modifiers på constraints</span>
          <ul className="nc-modlist">
            {MODIFIERS.map((m, i) => (
              <Fade key={m.m} show={mods} i={i} base={0.05} className="nc-mod" li>
                <code className="nc-chip">{m.m}</code>
                <span className="nc-kind">{m.kind}</span>
                {m.note && <span className="nc-note">{m.note}</span>}
              </Fade>
            ))}
          </ul>
        </Fade>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'nunit-constraint',
  title: 'Fra klassisk assert til constraint-modellen',
  steps: [
    {
      caption: 'Den klassiske model: `Assert.AreEqual(10, x)`. Den **forventede** værdi står først, den **faktiske** bagefter.',
      hold: 2200,
    },
    {
      caption: 'Constraint-modellen bytter om: `x` står først som den faktiske værdi, og `10` flytter ind i constraint’en `Is.EqualTo(10)`.',
      hold: 2800,
    },
    {
      caption:
        'Mønsteret er `Assert.That(<item>, <verb>.<constraint>)`. Verbet skal passe til item: `Contains.` kræver string eller collection, `Throws.` en metode eller lambda.',
      hold: 3000,
    },
    { caption: 'Constraint’en udtrykker forventningen: en værdi, et interval, null, tomhed eller en type.', hold: 2400 },
    {
      caption: '**Modifiers** sættes på constraints: `.Not.` foran, `.And.`/`.Or.` imellem, `.Within(<precision>)` og `.After.` bagefter.',
      hold: 3000,
    },
  ],
  Component: Constraint,
}

export default viz
