import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Node, Tag, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './lambda-capture.css'

/* Kursets higher_order_functions_code.cpp (week 3), to funktioner:
   lambda_capture_mutable  — [x] () mutable { return ++x + 1; } → "res: 2 x: 0"
   lambda_capture_default  — [&](){ x = x+2 ; y = y+4; }() → "x: 3 y: 14"
   Reglerne (captures kopieres, når lambdaen oprettes; er const; reference skal
   leve lige så længe som closuren) er fra 03.1 s. 16–20. Koden er et uddrag:
   [=]-linjen i lambda_capture_default er udeladt. */

interface Line {
  text: string
}

const VAL: Line[] = [
  { text: 'int x = 0, y = 10;' },
  { text: 'auto lambdaA = [x] ( ) mutable { return ++x + 1; };' },
  { text: 'int res = lambdaA();' },
  { text: 'cout << "res: " << res << " x: " << x << endl;' },
]
const REF: Line[] = [
  { text: 'int x = 1, y = 10;' },
  { text: '[&](){ x = x+2 ; y = y+4; }();' },
  { text: 'cout << "x: " << x << " y: " << y << endl;' },
]

// Aktiv linje pr. trin (-1 = ingen).
const VAL_LINE = [0, 1, 2, 3, -1, -1, -1]
const REF_LINE = [0, -1, -1, -1, 1, 1, 2]

function Code({ lines, active, label }: { lines: Line[]; active: number; label: string }) {
  return (
    <ol className="sx-lam-code" aria-label={label}>
      {lines.map((l, i) => (
        <li key={i} data-tone={i === active ? 'focus' : 'idle'}>
          <code>{l.text}</code>
        </li>
      ))}
    </ol>
  )
}

function Var({ name, value, tone = 'idle', note }: { name: ReactNode; value: ReactNode; tone?: Tone; note?: ReactNode }) {
  return (
    <div className="sx-lam-var" data-tone={tone}>
      <code className="sx-lam-name">{name}</code>
      <span className="sx-lam-val">{value}</span>
      {note !== undefined && <span className="sx-lam-note">{note}</span>}
    </div>
  )
}

function Out({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <div className="sx-lam-out" data-on={on || undefined}>
      <span className="vcaps">output</span>
      <motion.code initial={false} animate={{ opacity: on ? 1 : 0, y: on ? 0 : 3 }} transition={on ? t.settle : t.fade}>
        {children}
      </motion.code>
    </div>
  )
}

function Capture({ step }: { step: number }) {
  // Venstre: by value
  const aMade = at(step, 1)
  const aCalled = at(step, 2)
  const aOut = at(step, 3)
  // Højre: by reference
  const bMade = at(step, 4)
  const bCalled = at(step, 5)
  const bOut = at(step, 6)
  const final = step === 6

  return (
    <div className="sx-lam">
      <section className="sx-lam-col" data-on={(step >= 1 && step <= 3) || undefined}>
        <header className="sx-lam-head">
          <Tag tone="idle">[x]</Tag>
          <span className="sx-lam-title">by value</span>
          <code className="sx-lam-fn">lambda_capture_mutable()</code>
        </header>
        <Code lines={VAL} active={VAL_LINE[step]} label="lambda_capture_mutable" />

        <div className="sx-lam-mem">
          <Node className="sx-lam-frame" tone="idle">
            <span className="vcaps">lokale variable</span>
            <Var name="x" value="0" tone={step === 3 ? 'ok' : step === 1 ? 'focus' : 'idle'} note={aOut ? 'uændret' : undefined} />
            <Var name="y" value="10" />
            <Var name="res" value={aCalled ? '2' : '—'} tone={step === 2 ? 'focus' : 'idle'} />
          </Node>
          <Node className="sx-lam-closure" tone={!aMade ? 'ghost' : step === 1 || step === 2 ? 'focus' : 'idle'}>
            <span className="vcaps">closure lambdaA</span>
            <motion.div initial={false} animate={{ opacity: aMade ? 1 : 0 }} transition={aMade ? t.settle : t.fade}>
              <Var name="x" value={aCalled ? '1' : '0'} tone={step === 2 ? 'focus' : 'idle'} note={aCalled ? '++x' : 'kopi'} />
              <Var name="" value={aCalled ? <span>returnerer <b>2</b></span> : <span className="sx-lam-dim">ikke kaldt</span>} />
            </motion.div>
          </Node>
        </div>
        <Out on={aOut}>res: 2 x: 0</Out>
      </section>

      <section className="sx-lam-col" data-on={(step >= 4 && step <= 6) || undefined}>
        <header className="sx-lam-head">
          <Tag tone="idle">[&amp;]</Tag>
          <span className="sx-lam-title">by reference</span>
          <code className="sx-lam-fn">lambda_capture_default()</code>
        </header>
        <Code lines={REF} active={REF_LINE[step]} label="lambda_capture_default" />

        <div className="sx-lam-mem">
          <Node className="sx-lam-frame" tone="idle">
            <span className="vcaps">lokale variable</span>
            <Var name="x" value={bCalled ? '3' : '1'} tone={step === 5 ? 'focus' : step === 6 ? 'ok' : 'idle'} note={bCalled ? 'ændret' : undefined} />
            <Var name="y" value={bCalled ? '14' : '10'} tone={step === 5 ? 'focus' : step === 6 ? 'ok' : 'idle'} note={bCalled ? 'ændret' : undefined} />
            <Var name="" value={<span className="sx-lam-dim"> </span>} />
          </Node>
          <Node className="sx-lam-closure" tone={!bMade ? 'ghost' : step === 4 || step === 5 ? 'focus' : 'idle'}>
            <span className="vcaps">closure</span>
            <motion.div initial={false} animate={{ opacity: bMade ? 1 : 0 }} transition={bMade ? t.settle : t.fade}>
              <Var name="&x" value={<span className="sx-lam-ref">← x</span>} tone={step === 5 ? 'focus' : 'idle'} note="reference" />
              <Var name="&y" value={<span className="sx-lam-ref">← y</span>} tone={step === 5 ? 'focus' : 'idle'} note="reference" />
            </motion.div>
          </Node>
        </div>
        <Out on={bOut}>x: 3 y: 14</Out>
      </section>

      <motion.p className="sx-lam-sum" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
        <code>[x]</code> og <code>[=]</code> kopierer, når lambdaen oprettes; <code>mutable</code> ændrer kun kopien.{' '}
        <code>[&amp;]</code> refererer til de ydre variable — de skal leve lige så længe som closuren.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'lambda-capture',
  title: 'Kopi eller reference i capture clause',
  steps: [
    {
      caption: 'To funktioner fra kursets `higher_order_functions_code.cpp`. Til venstre er `x` 0, til højre 1; `y` er 10 i begge.',
      hold: 2200,
    },
    {
      caption: '`[x]` fanger by value: da `lambdaA` **oprettes**, kopieres `x` ind i closuren. Kopien er dens egen.',
      hold: 2600,
    },
    { caption: 'Kaldet `lambdaA()` tæller *kopien* op (`mutable`), så `++x + 1` giver 2.', hold: 2400 },
    { caption: 'Output `res: 2 x: 0`. Det ydre `x` er **uændret** — lambdaen rørte kun sin kopi.', hold: 2600 },
    {
      caption: '`[&]` fanger alt by reference: closuren indeholder ingen kopier, kun henvisninger til de ydre `x` og `y`.',
      hold: 2600,
    },
    { caption: 'Det sidste `()` kalder lambdaen med det samme. `x = x+2` og `y = y+4` skriver direkte i de ydre variable.', hold: 2600 },
    {
      caption: 'Output `x: 3 y: 14`. By reference ændrer originalen — og referencen skal være gyldig, så længe closuren lever.',
      hold: 3000,
    },
  ],
  Component: Capture,
}

export default viz
