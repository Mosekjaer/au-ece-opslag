import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './prj-bdd.css'

/* SysML Structural Diagrams 1.pdf: slide 7 (compartments på Aircraft: ports
   fuelReceptible: Fuel, values weight : kg), slide 10 (komposition: Wing Structure
   1..2, Engine 0..2, Cockpit cp), slide 11 (variant: parts-compartment eng1, eng2,
   cp og to navngivne wing-parts leftWing/rightWing).
   SysMLQuickGuide.pdf tabel A.5: composite, reference (hul diamant = ingen
   diamant), generalization. Friedenthal fig. 3.8: 4-/6-Cylinder Engine → Engine.
   Sem4-reglen: studie-figurer R-CLS-03 og sem4/CLAUDE.md. */

const FINAL = 4

function Compartment({ name, show, lines, delay = 0 }: { name: string; show: boolean; lines: string[]; delay?: number }) {
  return (
    <motion.div
      className="pbdd-comp-wrap"
      initial={false}
      animate={{ opacity: show ? 1 : 0, height: show ? 'auto' : 0 }}
      transition={show ? { ...t.settle, delay } : t.fade}
      aria-hidden={!show || undefined}
    >
      <div className="pbdd-comp">
        <span className="pbdd-comp-name">{name}</span>
        {lines.map((l) => (
          <code key={l}>{l}</code>
        ))}
      </div>
    </motion.div>
  )
}

function Part({ name, label, show, muted, i }: { name: string; label: ReactNode; show: boolean; muted: boolean; i: number }) {
  return (
    <li className="pbdd-kid" data-on={show || undefined}>
      <div className="pbdd-drop">
        <motion.span
          className="pbdd-mul"
          initial={false}
          animate={{ opacity: show ? 1 : 0 }}
          transition={show ? stagger(i, 0.25) : t.fade}
        >
          {label}
        </motion.span>
      </div>
      <motion.div
        className="pbdd-block is-part"
        data-muted={muted || undefined}
        initial={false}
        animate={{ opacity: show ? (muted ? 0.45 : 1) : 0, y: show ? 0 : 6 }}
        transition={show ? stagger(i, 0.1) : t.fade}
      >
        <span className="pbdd-stereo">«block»</span>
        <span className="pbdd-name">{name}</span>
      </motion.div>
    </li>
  )
}

/* Små symboler til forklaringen. currentColor, så lys/mørk virker. */
function Sym({ kind }: { kind: 'comp' | 'ref' | 'hollow' | 'gen' }) {
  return (
    <svg className="pbdd-sym" viewBox="0 0 56 14" aria-hidden="true">
      <line x1={kind === 'gen' ? 0 : 14} y1="7" x2={kind === 'gen' ? 44 : 56} y2="7" />
      {kind === 'comp' && <path d="M1 7 L7.5 2 L14 7 L7.5 12 Z" className="is-fill" />}
      {kind === 'hollow' && <path d="M1 7 L7.5 2 L14 7 L7.5 12 Z" className="is-hollow" />}
      {kind === 'ref' && <line x1="0" y1="7" x2="14" y2="7" />}
      {kind === 'gen' && <path d="M44 1.5 L55 7 L44 12.5 Z" className="is-hollow" />}
    </svg>
  )
}

const LEGEND = [
  { kind: 'comp' as const, name: 'Composite association', text: 'Whole–part. Definerer en part i helheden.' },
  { kind: 'ref' as const, name: 'Reference association', text: 'En reference til en anden blok, ikke en del.' },
  { kind: 'hollow' as const, name: 'Hul diamant', text: 'Samme betydning som ingen diamant (Quick Guide).' },
  { kind: 'gen' as const, name: 'Generalization', text: '`4-Cylinder Engine` ▷ `Engine` (Friedenthal).' },
]

function Bdd({ step }: { step: number }) {
  const parts = step >= 1
  const variant = step >= 3
  return (
    <div className="pbdd">
      <div className="pbdd-frame">
        <div className="pbdd-tab">
          <b>bdd</b> Aircraft [Structural hierarchy]
        </div>

        <div className="pbdd-canvas">
          <div className="pbdd-block is-whole" data-focus={step === 0 || step === 2 || undefined}>
            <span className="pbdd-stereo">«block»</span>
            <span className="pbdd-name">Aircraft</span>
            <Compartment name="ports" show={step >= 2} lines={['fuelReceptible: Fuel']} />
            <Compartment name="values" show={step >= 2} lines={['weight : kg']} delay={0.12} />
            <Compartment name="parts" show={variant} lines={['eng1: Engine', 'eng2: Engine', 'cp: Cockpit']} />
          </div>

          <motion.div
            className="pbdd-trunk"
            initial={false}
            animate={{ opacity: parts ? 1 : 0 }}
            transition={t.fade}
            aria-hidden="true"
          >
            <svg viewBox="0 0 14 22">
              <path d="M7 1 L12.5 6 L7 11 L1.5 6 Z" className="is-fill" />
              <line x1="7" y1="11" x2="7" y2="22" />
            </svg>
          </motion.div>

          <ol className="pbdd-kids" data-on={parts || undefined}>
            <Part
              i={0}
              name="Wing Structure"
              show={parts}
              muted={false}
              label={
                <Swap
                  show={variant ? 1 : 0}
                  items={[
                    <code key="m">1..2</code>,
                    <span key="n" className="pbdd-two">
                      <code>leftWing</code>
                      <code>rightWing</code>
                    </span>,
                  ]}
                />
              }
            />
            <Part i={1} name="Engine" show={parts} muted={variant} label={<code>0..2</code>} />
            <Part i={2} name="Cockpit" show={parts} muted={variant} label={<code>cp</code>} />
          </ol>

          <div className="pbdd-notes">
            <Tag show={step === 1} tone="focus">
              ◆ ved helheden · multiplicitet og part-navn ved delen
            </Tag>
            <Tag show={variant} tone={step === 3 ? 'focus' : 'muted'} wrap>
              samme struktur: parts som tekst i compartment, to navngivne wings i stedet for 1..2
            </Tag>
          </div>
        </div>
      </div>

      <motion.aside
        className="pbdd-legend"
        initial={false}
        animate={{ opacity: step >= FINAL ? 1 : 0 }}
        transition={step >= FINAL ? t.settle : t.fade}
        aria-hidden={step < FINAL || undefined}
      >
        <span className="vcaps">Relationer i et BDD</span>
        <ul>
          {LEGEND.map((l, i) => (
            <motion.li
              key={l.kind}
              initial={false}
              animate={{ opacity: step >= FINAL ? 1 : 0, x: step >= FINAL ? 0 : -4 }}
              transition={step >= FINAL ? stagger(i, 0.1, 0.09) : t.fade}
            >
              <Sym kind={l.kind} />
              <span>
                <b>{l.name}</b>
                <span className="pbdd-legend-text">{l.text.split('`').map((s, j) => (j % 2 ? <code key={j}>{s}</code> : s))}</span>
              </span>
            </motion.li>
          ))}
        </ul>
        <div className="pbdd-rule">
          <b>Sem4-reglen:</b> den hule diamant er forbudt i UML-klassediagrammer, men lovlig i SysML BDD.
        </div>
      </motion.aside>
    </div>
  )
}

const viz: VizDef = {
  id: 'prj-bdd',
  title: 'Et BDD bygges op fra blok til relationer',
  steps: [
    {
      caption: 'En **blok** er en *type*, som en C++-klasse. Navnet er obligatorisk, `«block»` er valgfri.',
      hold: 1800,
    },
    {
      caption:
        '**Komposition**: udfyldt diamant ved helheden. En `Aircraft` består af 1..2 wings, 0..2 engines og én cockpit med part-navnet `cp`.',
      hold: 2800,
    },
    {
      caption: 'Blokken får **compartments**: porte (interaktionspunkter) og values (kvantitative egenskaber med enhed).',
      hold: 2400,
    },
    {
      caption:
        'En lovlig variant af samme struktur: engines og cockpit som tekst i *parts*-compartmentet, og `1..2` erstattet af to navngivne parts.',
      hold: 3000,
    },
    {
      caption:
        'BDD’et kender flere relationer. Den hule diamant betyder i SysML det samme som en reference: lovlig her, men forbudt i sem4’s UML-klassediagrammer.',
      hold: 3200,
    },
  ],
  Component: Bdd,
}

export default viz
