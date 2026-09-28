import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './css-cascade.css'

/* CSS3 basics.pdf s. 5 (cascade-trappen), s. 26–27 (.new og #new), s. 32 (anchor-rækkefølgen)
   og Page Layout.pdf s. 3, 6–7 (box model, content-box mod border-box).
   At samme <p> har både class og id, er sammensat af s. 26–27 og mærket som eksempel.
   Kasserækkerne nederst er tegnet med rigtig box-sizing: fire kasser à 25 % + 6px border
   kan ikke stå på én række ved nogen pladebredde. */

const STAIRS = ['Browser Defaults', 'External Styles', 'Embedded Styles', 'Inline Styles', 'HTML Attributes']

type DeclState = 'idle' | 'won' | 'lost'

function Decl({ prop, value, state = 'idle' }: { prop: string; value: string; state?: DeclState }) {
  return (
    <span className="cc-decl" data-state={state}>
      {prop}: {value};
    </span>
  )
}

function RuleCard({
  selector,
  tone,
  note,
  children,
}: {
  selector: string
  tone: 'idle' | 'focus' | 'muted' | 'ghost'
  note?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="cc-rule" data-tone={tone}>
      <code className="cc-code">
        <span className="cc-sel">{selector} {'{'}</span>
        <span className="cc-decls">{children}</span>
        <span className="cc-sel">{'}'}</span>
      </code>
      {note}
    </div>
  )
}

/** Panel med overskrift. Ghost indtil det tændes. */
function Panel({ on, now, title, children, className }: { on: boolean; now: boolean; title: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`cc-panel ${className ?? ''}`} data-tone={!on ? 'ghost' : now ? 'focus' : 'idle'}>
      <header className="cc-head">{title}</header>
      <motion.div className="cc-body" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? t.settle : t.fade}>
        {children}
      </motion.div>
    </section>
  )
}

function Specificity({ step }: { step: number }) {
  const resolved = at(step, 2)
  return (
    <Panel
      on
      now={step === 0 || step === 2}
      title={
        <>
          <span>Mere specifik vinder</span>
          <span className="cc-ex">eksempel sammensat af s. 26–27</span>
        </>
      }
    >
      <code className="cc-el">{'<p class="new" id="new">'}</code>
      <div className="cc-preview">
        <p className="cc-p" data-styled={resolved || undefined}>
          This text is red, large, and in italics
        </p>
      </div>
      <div className="cc-rules">
        <RuleCard selector=".new" tone={resolved ? 'muted' : 'idle'}>
          <Decl prop="color" value="#FF0000" state={resolved ? 'lost' : 'idle'} />
          <Decl prop="font-style" value="italic" state={resolved ? 'lost' : 'idle'} />
        </RuleCard>
        <RuleCard selector="#new" tone={resolved ? 'focus' : 'idle'}>
          <Decl prop="color" value="#FF0000" state={resolved ? 'won' : 'idle'} />
          <Decl prop="font-size" value="2em" state={resolved ? 'won' : 'idle'} />
          <Decl prop="font-style" value="italic" state={resolved ? 'won' : 'idle'} />
        </RuleCard>
      </div>
      <div className="cc-tags">
        <Tag show={resolved} tone="focus" wrap>
          .new rammer en gruppe, #new ét element
        </Tag>
      </div>
      <p className="cc-fine">Hvordan specificity tælles, viser slidene ikke; de henviser til en Specificity Calculator.</p>
    </Panel>
  )
}

const ANCHORS = [
  { sel: 'a:link', color: '#FF0000' },
  { sel: 'a:visited', color: '#00FF00' },
  { sel: 'a:hover', color: '#FF00FF' },
  { sel: 'a:active', color: '#0000FF' },
]

function Order({ step }: { step: number }) {
  const on = at(step, 3)
  return (
    <Panel
      on={on}
      now={step === 3}
      title={
        <>
          <span>Samme specificity: sidst vinder</span>
          <Tag show={on} tone="focus">
            The order matters!
          </Tag>
        </>
      }
    >
      <div className="cc-link">
        <span className="cc-a">et link</span>
        <span className="cc-state">ikke besøgt · musen over</span>
      </div>
      <div className="cc-anchors">
        {ANCHORS.map((a, i) => {
          const match = a.sel === 'a:link' || a.sel === 'a:hover'
          const state: DeclState = !on ? 'idle' : a.sel === 'a:hover' ? 'won' : a.sel === 'a:link' ? 'lost' : 'idle'
          return (
            <motion.div
              key={a.sel}
              className="cc-arow"
              data-match={(on && match) || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0, x: on ? 0 : -4 }}
              transition={on ? stagger(i, 0.05, 0.07) : t.fade}
            >
              <span className="cc-anum">{i + 1}</span>
              <code className="cc-code cc-inline">
                <span className="cc-sel">{a.sel} {'{'}</span> <Decl prop="color" value={a.color} state={state} />{' '}
                <span className="cc-sel">{'}'}</span>
              </code>
              <span className="cc-verdict">
                {a.sel === 'a:hover' && (
                  <Tag show={on} tone="focus">
                    matcher, står sidst → vinder
                  </Tag>
                )}
                {a.sel === 'a:link' && (
                  <Tag show={on} tone="muted">
                    matcher, overskrevet
                  </Tag>
                )}
              </span>
            </motion.div>
          )
        })}
      </div>
    </Panel>
  )
}

function BoxModel({ step }: { step: number }) {
  const on = at(step, 4)
  const layers = ['margin', 'border', 'padding', 'content'] as const
  // Bygges indefra: content først, margin sidst.
  const delay = (l: (typeof layers)[number]) => 0.15 + (3 - layers.indexOf(l)) * 0.22
  const layer = (l: (typeof layers)[number], child?: ReactNode) => (
    <motion.div
      className={`cc-layer cc-${l}`}
      initial={false}
      animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.97 }}
      transition={on ? { ...t.settle, delay: delay(l) } : t.fade}
    >
      <span className="cc-lname">{l}</span>
      {child}
    </motion.div>
  )
  return (
    <Panel on={on} now={step === 4} title={<span>Box model</span>}>
      <div className="cc-boxmodel">{layer('margin', layer('border', layer('padding', layer('content'))))}</div>
      <p className="cc-fine">Hver side kan sættes for sig: top, right, bottom, left.</p>
    </Panel>
  )
}

function Sizing({ step }: { step: number }) {
  const cb = at(step, 5)
  const bb = at(step, 6)
  return (
    <Panel on={cb} now={step === 5 || step === 6} title={<span>box-sizing</span>}>
      <div className="cc-sz" data-on={cb || undefined}>
        <div className="cc-sz-head">
          <code className="cc-mono">content-box</code>
          <span className="cc-dim">default · width: 25%; border: 6px → 25% + 12px</span>
        </div>
        <div className="cc-row cc-row-cb">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="cc-kasse"
              data-over={i === 3 || undefined}
              initial={false}
              animate={{ opacity: cb ? 1 : 0, y: cb ? 0 : -4 }}
              transition={cb ? stagger(i, 0.1, 0.09) : t.fade}
            >
              25%
            </motion.span>
          ))}
        </div>
        <p className="cc-formula">Actual width = width + border-left + border-right + padding-left + padding-right</p>
      </div>

      <div className="cc-sz" data-on={bb || undefined}>
        <div className="cc-sz-head">
          <code className="cc-mono">border-box</code>
          <code className="cc-dim">{'*, *:before, *:after { box-sizing: border-box; }'}</code>
        </div>
        <div className="cc-row cc-row-bb">
          {[0, 1, 2, 3].map((i) => (
            <motion.span
              key={i}
              className="cc-kasse"
              data-v={i}
              initial={false}
              animate={{ opacity: bb ? 1 : 0, y: bb ? 0 : -4 }}
              transition={bb ? stagger(i, 0.1, 0.09) : t.fade}
            >
              25%
            </motion.span>
          ))}
        </div>
      </div>
    </Panel>
  )
}

function Cascade({ step }: { step: number }) {
  const stairs = at(step, 1)
  return (
    <div className="cc">
      <div className="cc-stairs" data-on={stairs || undefined}>
        <div className="cc-stairs-head">
          <span className="vcaps">Cascaden</span>
          <motion.span className="cc-rulequote" initial={false} animate={{ opacity: stairs ? 1 : 0 }} transition={t.fade}>
            senere kilder lægges oven på tidligere · same specificity → the one that appears last wins
          </motion.span>
        </div>
        <ol className="cc-steps">
          {STAIRS.map((s, i) => (
            <motion.li
              key={s}
              className="cc-stair"
              data-muted={i === 4 || undefined}
              style={{ height: `${1.5 + i * 0.6}rem` }}
              initial={false}
              animate={{ opacity: stairs ? 1 : 0.25, y: stairs ? 0 : 4 }}
              transition={stairs ? stagger(i, 0.05, 0.1) : t.fade}
            >
              {s}
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="cc-grid">
        <Specificity step={step} />
        <Order step={step} />
        <BoxModel step={step} />
        <Sizing step={step} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'css-cascade',
  title: 'Hvilken regel vinder, og hvor bred er boksen',
  steps: [
    {
      caption: 'Et afsnit med både `class="new"` og `id="new"` — og to regler, der begge rammer det.',
      hold: 1800,
    },
    {
      caption:
        'Cascaden: senere kilder lægges oven på tidligere, med browserens defaults nederst. Har to regler samme specificity, vinder den, der står sidst.',
      hold: 2600,
    },
    {
      caption:
        '`.new` rammer en gruppe elementer, `#new` kun ét. Den mere specifikke regel vinder: `#new` giver `font-size: 2em`, og `.new`s deklarationer er overskrevet.',
      hold: 3000,
    },
    {
      caption:
        'Samme specificity: et link, man holder musen over, matcher både `a:link` og `a:hover`. `a:hover` står senere og vinder — derfor er rækkefølgen vigtig.',
      hold: 3000,
    },
    {
      caption: 'Box model: content inderst, så padding, border og yderst margin.',
      hold: 2200,
    },
    {
      caption:
        'Default er `content-box`: padding og border lægges oven i `width`. Fire kasser à `25%` + 6px border fylder mere end rækken, og den fjerde ryger ned.',
      hold: 2800,
    },
    {
      caption:
        'Med `box-sizing: border-box` presses padding og border ind i boksen. Fire kasser står på én række, uanset border og padding.',
      hold: 3000,
    },
  ],
  Component: Cascade,
}

export default viz
