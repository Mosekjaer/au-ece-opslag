import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Node, Tag, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './bce.css'

/* ATM, UC Withdraw Cash, fordelt på klasser efter step 1.1–1.4:
   System Application Models Part1.pdf slide 16–22 (use case-diagram, domænemodel,
   de fire skridt og resultatet "6 kandidater"). Kommunikationsreglerne i sidste trin
   er den principielle tabel fra Part2.pdf slide 20. Associationer og metoder findes
   først i step 2 og er derfor ikke tegnet. */

function Actor({ name, tone }: { name: string; tone: Tone }) {
  return (
    <span className="bce-actor" data-tone={tone}>
      <svg viewBox="0 0 24 36" aria-hidden="true">
        <circle cx="12" cy="6" r="4.5" />
        <path d="M12 10.5 V23 M4 15 H20 M12 23 L5 33 M12 23 L19 33" />
      </svg>
      <span>{name}</span>
    </span>
  )
}

function DomClass({ name, attr, tone }: { name: string; attr?: string; tone: Tone }) {
  return (
    <span className="bce-dmclass" data-tone={tone}>
      <span className="bce-dmname">{name}</span>
      <span className="bce-dmattr">{attr ?? ' '}</span>
    </span>
  )
}

function Cls({ st, name, sub, show, tone }: { st: string; name: ReactNode; sub: string; show: boolean; tone: Tone }) {
  return (
    <Node
      className="bce-cls"
      show={show}
      tone={tone}
      title={
        <>
          <span className="bce-st">«{st}»</span>
          <span className="bce-name">{name}</span>
        </>
      }
      sub={sub}
    />
  )
}

const RULES: { from: string; cells: [string, boolean][] }[] = [
  { from: 'Boundary', cells: [['Nej!', false], ['Nej!', false], ['Ja!', true]] },
  { from: 'Domain', cells: [['Nej!', false], ['Nej!', false], ['Nej!', false]] },
  { from: 'Control', cells: [['Ja!', true], ['Ja!', true], ['Ja!', true]] },
]

function Bce({ step }: { step: number }) {
  const ucTone: Tone = step === 1 || step === 4 ? 'focus' : step > 1 ? 'ok' : 'idle'
  const actorTone: Tone = step === 2 ? 'focus' : step > 2 ? 'ok' : 'idle'
  const dmUsed: Tone = step === 3 ? 'focus' : step > 3 ? 'ok' : 'idle'
  const dmActor: Tone = step >= 3 ? 'muted' : 'idle'
  const hot = (n: number): Tone => (step === n ? 'focus' : 'idle')

  return (
    <div className="bce">
      <section className="bce-req" aria-label="Krav og analyse">
        <div className="bce-panel">
          <span className="vcaps">Use case-diagram</span>
          <div className="bce-ucd">
            <Actor name="Customer" tone={actorTone} />
            <div className="bce-sys">
              <span className="bce-uc" data-tone={ucTone}>
                Withdraw Cash
              </span>
              <span className="bce-uc" data-tone={step >= 1 ? 'muted' : 'idle'}>
                Transfer Amount
              </span>
            </div>
            <Actor name="Bank" tone={actorTone} />
          </div>
        </div>
        <div className="bce-panel">
          <span className="vcaps">Domænemodel (klasser)</span>
          <div className="bce-dm">
            <DomClass name="Customer" tone={dmActor} />
            <DomClass name="Cash" tone={dmUsed} />
            <DomClass name="Account" attr="Balance" tone={dmUsed} />
            <DomClass name="Credit card" attr="PIN" tone={dmUsed} />
            <DomClass name="Bank" tone={dmActor} />
          </div>
        </div>
      </section>

      <div className="bce-divider" aria-hidden="true">
        <span>krav og analyse</span>
        <span>design</span>
      </div>

      <section className="bce-am" aria-label="Applikationsmodel">
        <span className="vcaps bce-am-head">Applikationsmodel: klasser efter step 1</span>
        <div className="bce-grid">
          <div className="bce-col" data-kind="boundary">
            <span className="bce-colhead">boundary · step 1.2</span>
            <Cls st="boundary" name="CustomerUI" sub="fra aktøren Customer" show={step >= 2} tone={hot(2)} />
            <Cls st="boundary" name="BankUI" sub="fra aktøren Bank" show={step >= 2} tone={hot(2)} />
          </div>
          <div className="bce-col" data-kind="control">
            <span className="bce-colhead">control · step 1.4</span>
            <Cls st="control" name="WithdrawCash" sub="navngivet efter use casen" show={step >= 4} tone={hot(4)} />
          </div>
          <div className="bce-col" data-kind="domain">
            <span className="bce-colhead">domain · step 1.3</span>
            <Cls st="domain" name="Cash" sub="fra domænemodellen" show={step >= 3} tone={hot(3)} />
            <Cls st="domain" name="Account" sub="Balance" show={step >= 3} tone={hot(3)} />
            <Cls st="domain" name="Credit card" sub="PIN" show={step >= 3} tone={hot(3)} />
          </div>
        </div>

        <motion.div
          className="bce-rules"
          initial={false}
          animate={{ opacity: step >= 5 ? 1 : 0, y: step >= 5 ? 0 : 6 }}
          transition={step >= 5 ? t.settle : t.fade}
          aria-hidden={step < 5 || undefined}
        >
          <div className="bce-rules-head">
            <span className="vcaps">Hvem må kalde hvem</span>
            <Tag tone="idle">6 kandidater</Tag>
          </div>
          <table>
            <thead>
              <tr>
                <th>fra \ til</th>
                <th>Boundary</th>
                <th>Domain</th>
                <th>Control</th>
              </tr>
            </thead>
            <tbody>
              {RULES.map((r, i) => (
                <tr key={r.from}>
                  <th>{r.from}</th>
                  {r.cells.map(([txt, ok], j) => (
                    <motion.td
                      key={j}
                      data-ok={ok || undefined}
                      initial={false}
                      animate={{ opacity: step >= 5 ? 1 : 0 }}
                      transition={step >= 5 ? stagger(i * 3 + j, 0.15, 0.05) : t.fade}
                    >
                      {txt}
                    </motion.td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'bce',
  title: 'Use casen Withdraw Cash fordeles på boundary-, control- og domain-klasser',
  steps: [
    {
      caption: 'Input: ATM’ens use case-diagram og domænemodel. Applikationsmodellen er tom — klasserne skal findes ud fra dem.',
      hold: 2200,
    },
    { caption: '**Step 1.1**: vælg den næste fully dressed use case. Her *Withdraw Cash*.', hold: 1800 },
    {
      caption: '**Step 1.2**: hver aktør i use casen bliver en **boundary**-klasse. Customer → `CustomerUI`, Bank → `BankUI`.',
      hold: 2600,
    },
    {
      caption:
        '**Step 1.3**: de domænemodel-klasser, use casen berører, bliver **domain**-klasser: `Cash`, `Account`, `Credit card`. Customer og Bank er allerede dækket af boundary.',
      hold: 3000,
    },
    { caption: '**Step 1.4**: én **control**-klasse, navngivet efter use casen: `WithdrawCash`. Den skal styre forløbet.', hold: 2400 },
    {
      caption:
        'Seks kandidater. Reglerne: boundary kalder kun control, domain kalder ingen, control må kalde alle. Metoder og associationer kommer i step 2, fra sekvensdiagrammet.',
      hold: 3400,
    },
  ],
  Component: Bce,
}

export default viz
