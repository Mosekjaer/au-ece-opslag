import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './ts-compile.css'

/* FED Typescript.pdf s. 10 (livscyklus), s. 13 (structural typing, "not hard
   guarantees"), s. 16–17 (greeter og Student/Person før og efter tsc). Koden er
   slidets ordret; markeringerne er vores. */

const SHY = String.fromCharCode(0xad)

/** Kinds: rm = forsvinder i JS, iface = interface-linje, shape = felter der matcher
    Person, pub = public-parameter der bliver til this.x = x, call = greeter(user). */
type Kind = 'rm' | 'iface' | 'shape' | 'pub' | 'call'
type Seg = string | [string, Kind]
interface Line {
  d: number
  s: Seg[]
  k?: Kind
}

const TS: Line[] = [
  { d: 0, s: ['class Student {'] },
  { d: 1, s: [['fullName: string;', 'rm']] },
  {
    d: 1,
    s: ['constructor(', ['public', 'pub'], ' ', ['firstName', 'shape'], ', ', ['public', 'pub'], ` middle${SHY}Initial, `, ['public', 'pub'], ' ', ['lastName', 'shape'], ') {'],
  },
  { d: 2, s: [`this.fullName = firstName + " " + middle${SHY}Initial + " " + lastName;`] },
  { d: 1, s: ['}'] },
  { d: 0, s: ['}'] },
  { d: 0, s: [''] },
  { d: 0, s: ['interface Person {'], k: 'iface' },
  { d: 1, s: [['firstName', 'shape'], ': string;'], k: 'iface' },
  { d: 1, s: [['lastName', 'shape'], ': string;'], k: 'iface' },
  { d: 0, s: ['}'], k: 'iface' },
  { d: 0, s: [''] },
  { d: 0, s: ['function greeter(person', [' : Person', 'rm'], ') {'] },
  { d: 1, s: ['return "Hello, " + person.firstName + " " + person.lastName;'] },
  { d: 0, s: ['}'] },
  { d: 0, s: [''] },
  { d: 0, s: ['var user = new Student("John", "M.", "Doe");'] },
  { d: 0, s: ['console.log(', ['greeter(user)', 'call'], ');'] },
]

/** at = trinnet linjen dukker op i outputtet; gen = genereret af public-parametrene. */
const JS: { d: number; text: string; at: number; gen?: boolean }[] = [
  { d: 0, text: 'var Student = (function () {', at: 4 },
  { d: 1, text: `function Student(firstName, middle${SHY}Initial, lastName) {`, at: 4 },
  { d: 2, text: 'this.firstName = firstName;', at: 4, gen: true },
  { d: 2, text: `this.middleInitial = middle${SHY}Initial;`, at: 4, gen: true },
  { d: 2, text: 'this.lastName = lastName;', at: 4, gen: true },
  { d: 2, text: `this.fullName = firstName + " " + middle${SHY}Initial + " " + lastName;`, at: 4 },
  { d: 1, text: '}', at: 4 },
  { d: 1, text: 'return Student;', at: 4 },
  { d: 0, text: '}());', at: 4 },
  { d: 0, text: '', at: 3 },
  { d: 0, text: 'function greeter(person) {', at: 3 },
  { d: 1, text: 'return "Hello, " + person.firstName + " " + person.lastName;', at: 3 },
  { d: 0, text: '}', at: 3 },
  { d: 0, text: '', at: 3 },
  { d: 0, text: 'var user = new Student("John", "M.", "Doe");', at: 4 },
  { d: 0, text: 'console.log(greeter(user));', at: 4 },
]

const indent = (d: number) => ({ paddingLeft: `calc(0.45rem + ${d * 2 + 2}ch)` })

function segState(kind: Kind, step: number): string {
  switch (kind) {
    case 'shape':
      return step === 1 ? 'focus' : at(step, 1) ? 'on' : 'idle'
    case 'rm':
      return step === 3 ? 'neg' : at(step, 3) ? 'gone' : 'idle'
    case 'pub':
      return step === 4 ? 'focus' : at(step, 4) ? 'on' : 'idle'
    case 'call':
      return step === 1 ? 'ok' : at(step, 1) ? 'on' : 'idle'
    default:
      return 'idle'
  }
}

function TsLine({ line, step }: { line: Line; step: number }) {
  const ifaceGone = line.k === 'iface' && at(step, 4)
  return (
    <li className="mono" style={indent(line.d)} data-iface={line.k === 'iface' || undefined} data-state={ifaceGone ? (step === 4 ? 'neg' : 'gone') : undefined}>
      {line.s.map((seg, i) =>
        typeof seg === 'string' ? (
          seg || ' '
        ) : (
          <span key={i} className="tc-seg" data-kind={seg[1]} data-state={segState(seg[1], step)}>
            {seg[0]}
          </span>
        ),
      )}
      {line.s.some((seg) => typeof seg !== 'string' && seg[1] === 'call') && (
        <motion.span className="tc-check" initial={false} animate={{ opacity: at(step, 1) ? 1 : 0, scale: at(step, 1) ? 1 : 0.6 }} transition={at(step, 1) ? t.place : t.fade}>
          ✓
        </motion.span>
      )}
    </li>
  )
}

function Stage({ node, note, sub, on, now, extra }: { node: string; note?: string; sub?: ReactNode; on: boolean; now: boolean; extra?: ReactNode }) {
  const tone: Tone = !on ? 'ghost' : now ? 'focus' : 'idle'
  return (
    <div className="tc-stage">
      {extra ?? <Node title={node} sub={sub} tone={tone} className="tc-box" />}
      {note && (
        <motion.span className="tc-note" data-on={on || undefined} initial={false} animate={{ opacity: on ? 1 : 0.45 }} transition={t.fade}>
          {note}
        </motion.span>
      )}
    </div>
  )
}

function TsCompile({ step }: { step: number }) {
  const tsOn = at(step, 1)
  const compOn = at(step, 2)
  const jsOn = at(step, 3)
  const runOn = at(step, 5)
  const end = at(step, 6)

  const tsc = (
    <Token id="tc-tsc" tone={step === 2 ? 'focus' : at(step, 2) ? 'idle' : 'muted'} launch={step === 2}>
      tsc fileName.ts
    </Token>
  )

  return (
    <div className="tc">
      <div className="tc-band vflow stack" aria-label="TypeScript life cycle">
        <Stage node="TypeScript" note="Design Time Checks" sub="→ Development Tools" on={tsOn} now={step === 1} />
        <Link on={compOn} tone={step === 2 ? 'focus' : 'idle'} />
        <Stage node="Compiler" note="Compile Time Checks" on={compOn} now={step === 2} />
        <Link on={jsOn} tone={step === 3 ? 'focus' : 'idle'} />
        <Stage node="JavaScript" note={`Idio${SHY}matic Java${SHY}Script`} on={jsOn} now={step === 5} />
        <Link on={runOn} tone={step === 5 ? 'focus' : 'idle'} />
        <Stage
          node=""
          on={runOn}
          now={step === 5}
          extra={
            <div className="tc-run">
              <Node title="Web Page" tone={!runOn ? 'ghost' : step === 5 ? 'focus' : 'idle'} className="tc-box" />
              <Node title="node.js" tone={!runOn ? 'ghost' : step === 5 ? 'focus' : 'idle'} className="tc-box" />
            </div>
          }
        />
      </div>

      <div className="tc-panels">
        <section className="tc-panel" data-on={step === 1 || undefined}>
          <header className="tc-head">
            <span className="tc-name">TypeScript</span>
            <span className="tc-slot">{step < 2 && tsc}</span>
            <span className="tc-tags">
              <Tag show={tsOn} tone={step === 1 ? 'focus' : 'idle'} wrap>
                structural typing — ingen implements
              </Tag>
              <Tag show={at(step, 4)} tone={step === 4 ? 'neg' : 'idle'}>
                interface: findes ikke i JS
              </Tag>
            </span>
          </header>
          <ol className="tc-code">
            {TS.map((l, i) => (
              <TsLine key={i} line={l} step={step} />
            ))}
          </ol>
        </section>

        <section className="tc-panel" data-js data-on={(step >= 3 && step <= 5) || undefined}>
          <header className="tc-head">
            <span className="tc-name">JavaScript</span>
            <span className="tc-slot">{step >= 2 && tsc}</span>
            <span className="tc-tags">
              <Tag show={runOn} tone={step === 5 ? 'focus' : 'idle'}>
                ingen typer i runtime
              </Tag>
            </span>
          </header>
          <ol className="tc-code" data-empty={!jsOn || undefined}>
            {JS.map((l, i) => {
              const shown = at(step, l.at)
              return (
                <motion.li
                  key={i}
                  className="mono"
                  style={indent(l.d)}
                  data-gen={(l.gen && shown) || undefined}
                  data-now={(l.gen && step === 4) || undefined}
                  initial={false}
                  animate={{ opacity: shown ? 1 : 0, x: shown ? 0 : -6 }}
                  transition={shown ? stagger(i % 10, 0.25, 0.05) : t.fade}
                >
                  {l.text || ' '}
                </motion.li>
              )
            })}
          </ol>
        </section>
      </div>

      <motion.p className="tc-small" initial={false} animate={{ opacity: end ? 1 : 0 }} transition={t.fade} aria-hidden={!end || undefined}>
        <span className="vcaps">også s. 16</span>
        <code>function greeter(person: string)</code>
        <span className="tc-arrow">→</span>
        <code>function greeter(person)</code>
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'ts-compile',
  title: 'tsc tjekker typerne og fjerner dem',
  steps: [
    {
      caption: 'TypeScript-kilden fra slidet: en `class Student`, et `interface Person` og en `greeter`, der vil have en `Person`.',
      hold: 1800,
    },
    {
      caption:
        '**Design time**: editoren tjekker typerne, mens man skriver. `greeter(user)` er i orden — `Student` har `firstName` og `lastName`, selvom den aldrig skriver `implements Person`.',
      hold: 3200,
    },
    { caption: '**Compile time**: `tsc fileName.ts` tjekker igen og oversætter til JavaScript.', hold: 1800 },
    { caption: 'Typeannotationerne forsvinder: `person : Person` bliver til `person`, og `fullName: string;` er væk.', hold: 2400 },
    {
      caption: '`interface Person` er **helt væk** i outputtet. Til gengæld bliver hver `public`-parameter til `this.firstName = firstName;` osv.',
      hold: 3000,
    },
    {
      caption:
        '**Runtime**: idiomatisk JavaScript kører i en web page eller i node.js. Der er ingen typer tilbage — de gav verifikation og hjælp, ikke hårde garantier.',
      hold: 2600,
    },
    { caption: 'Typerne lever i editoren og compileren. I runtime kører den JavaScript, der er tilbage.', hold: 3000 },
  ],
  Component: TsCompile,
}

export default viz
