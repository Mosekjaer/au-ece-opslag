import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './dft-inject.css'

/* Design for Testability.pdf s. 6 (House laver selv Bedroom/Kitchen/FrontDoor),
   s. 9–10 (interfaces og fakes), s. 13 (constructor injection, Main og testen,
   “House remains unchanged”), s. 17 (System.DateTime.Now.Hour og
   System.Console.WriteLine), s. 18 (ITimeProvider/ILogger med fakes).
   Metoden hedder Leave() som i klassediagrammet. Kaldene i Main og testen med
   fem argumenter er udvidet her; s. 19 viser kun konstruktøren. */

/** Brudpunkter efter punktum, komma og parentes — aldrig midt i et ord. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,(])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

/** Bindestreg-punkter mellem ord i CamelCase: FakeTimeProvider → FakeTimeProvider. */
const SHY = String.fromCharCode(173)
const cam = (s: string) => s.replace(/([a-z])(?=[A-Z])/g, `$1${SHY}`)

type FamId = 'bed' | 'kit' | 'door' | 'time' | 'log'
const FAMS: { id: FamId; iface: string; op: string; real: string; fake: string; late?: boolean }[] = [
  { id: 'bed', iface: 'IBedroom', op: '+\u00a0TurnLightOff()', real: 'Bedroom', fake: 'FakeBedroom' },
  { id: 'kit', iface: 'IKitchen', op: '+\u00a0TurnOffAll…()', real: 'Kitchen', fake: 'FakeKitchen' },
  { id: 'door', iface: 'IFrontDoor', op: '+\u00a0Lock()', real: 'FrontDoor', fake: 'FakeFrontDoor' },
  { id: 'time', iface: 'ITimeProvider', op: '+\u00a0GetHour()', real: 'TimeProvider', fake: 'FakeTimeProvider', late: true },
  { id: 'log', iface: 'ILogger', op: '+\u00a0WriteLogLine()', real: 'Logger', fake: 'FakeLogger', late: true },
]

/* ------------------------------ UML-streger ------------------------------ */

const drawX = (on: boolean, i = 0) => ({
  initial: false as const,
  animate: { scaleX: on ? 1 : 0, opacity: on ? 1 : 0 },
  transition: on ? { ...t.travel, duration: 0.55, delay: i * 0.06 } : t.fade,
})
const drawY = (on: boolean, i = 0) => ({
  initial: false as const,
  animate: { scaleY: on ? 1 : 0, opacity: on ? 1 : 0 },
  transition: on ? { ...t.travel, duration: 0.5, delay: i * 0.06 } : t.fade,
})
const fade = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

/** Åben pilespids (navigerbar association), spidsen i elementets højre kant. */
function OpenHead({ on, className, delay = 0.35 }: { on: boolean; className?: string; delay?: number }) {
  return (
    <motion.svg className={`dfi-head ${className ?? ''}`} viewBox="0 0 8 10" aria-hidden="true" {...fade(on, delay)}>
      <path d="M0.8 0.8 7.2 5 0.8 9.2" />
    </motion.svg>
  )
}

/* --------------------------------- House --------------------------------- */

type Seg = string | { hl?: boolean; newId?: FamId; text: string }
interface Line {
  ind: number
  segs: Seg[]
}
const L = (ind: number, ...segs: Seg[]): Line => ({ ind, segs })

function houseLines(step: number): Line[] {
  const identify = step === 1
  const ctor: Line[] =
    step <= 2
      ? [
          L(0, 'public House()'),
          L(0, '{'),
          L(1, '_bedroom = ', { newId: 'bed', text: 'new Bedroom()', hl: identify }, ';'),
          L(1, '_kitchen = ', { newId: 'kit', text: 'new Kitchen()', hl: identify }, ';'),
          L(1, '_door = ', { newId: 'door', text: 'new FrontDoor()', hl: identify }, ';'),
          L(0, '}'),
          L(0),
        ]
      : step <= 4
        ? [
            L(0, 'public House('),
            L(1, { text: 'IBedroom bedroom,', hl: step === 3 }),
            L(1, { text: 'IKitchen kitchen,', hl: step === 3 }),
            L(1, { text: 'IFrontDoor door)', hl: step === 3 }),
            L(0, '{ _bedroom = bedroom; … }'),
            L(0),
            L(0),
          ]
        : [
            L(0, 'public House('),
            L(1, 'IBedroom bedroom,'),
            L(1, 'IKitchen kitchen,'),
            L(1, 'IFrontDoor door,'),
            L(1, { text: 'ITimeProvider timep,', hl: true }),
            L(1, { text: 'ILogger logger)', hl: true }),
            L(0, '{ _bedroom = bedroom; … }'),
          ]
  const late = step >= 5
  const leave: Line[] = [
    L(0, 'public void Leave()'),
    L(0, '{'),
    late
      ? L(1, 'if (', { text: '_timeProvider.GetHour()', hl: true }, ' > 22)')
      : L(1, 'if (', { text: 'System.DateTime.Now.Hour', hl: identify }, ' > 22)'),
    L(1, '{'),
    L(2, '_kitchen.ShutDownAllAppliances(); …'),
    late
      ? L(2, { text: '_logger.WriteLogLine', hl: true }, '("House closed down");')
      : L(2, { text: 'System.Console.WriteLine', hl: identify }, '("House closed down");'),
    L(1, '}'),
    L(0, '}'),
  ]
  return [...ctor, ...leave]
}

const lineKey = (l: Line) => l.segs.map((s) => (typeof s === 'string' ? s : s.text)).join('')

function NewCall({ id, text, hl }: { id: FamId; text: string; hl?: boolean }) {
  return (
    <motion.span layoutId={`dfi-new-${id}`} layout="position" className="dfi-new" data-hl={hl || undefined} transition={t.travel}>
      {text}
    </motion.span>
  )
}

const plainText = (l: Line) => (l.segs.length ? lineKey(l) : '\u00a0')

/** Hver linje står i én grid-celle sammen med sine andre varianter (skjult), så
    højden altid er den højeste variants — også når linjen brydes på smal plade. */
function Code({ lines, variants }: { lines: Line[]; variants: Line[][] }) {
  return (
    <div className="dfi-code">
      {lines.map((l, i) => {
        const key = lineKey(l)
        const others = [...new Set(variants.map((v) => v[i]).filter((v) => v && lineKey(v) !== key).map((v) => JSON.stringify([v.ind, plainText(v)])))]
        return (
          <div key={i} className="dfi-ln-cell">
            <div className="dfi-ln" style={{ paddingLeft: `${l.ind * 2 + 2}ch` }}>
              <motion.code key={key} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t.settle}>
                {l.segs.length === 0 ? '\u00a0' : null}
                {l.segs.map((s, j) =>
                  typeof s === 'string' ? (
                    <Fragment key={j}>{brk(s)}</Fragment>
                  ) : s.newId ? (
                    <NewCall key={j} id={s.newId} text={s.text} hl={s.hl} />
                  ) : (
                    <span key={j} className="dfi-hl" data-hl={s.hl || undefined}>
                      {brk(s.text)}
                    </span>
                  ),
                )}
              </motion.code>
            </div>
            {others.map((o) => {
              const [ind, text] = JSON.parse(o) as [number, string]
              return (
                <div key={o} className="dfi-ln dfi-ln-ghost" style={{ paddingLeft: `${ind * 2 + 2}ch` }} aria-hidden="true">
                  <code>{brk(text)}</code>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

const VARIANTS = [0, 3, 5].map(houseLines)

/* -------------------------------- Kaldere -------------------------------- */

function Caller({ kind, step }: { kind: 'prod' | 'test'; step: number }) {
  const on = kind === 'prod' ? at(step, 3) : at(step, 4)
  const late = at(step, 5)
  const head = kind === 'prod' ? 'var house = new House(' : 'var uut = new House('
  return (
    <motion.div className="dfi-caller" data-kind={kind} data-now={(kind === 'prod' ? step === 3 : step === 4) || undefined} {...fade(on)}>
      <div className="dfi-caller-head">
        <span className="vcaps">{kind === 'prod' ? 'Produktion · Main' : 'Test'}</span>
      </div>
      <div className="dfi-code">
        <div className="dfi-ln" style={{ paddingLeft: '2ch' }}>
          <motion.code {...fade(on)}>{brk(head)}</motion.code>
        </div>
        {FAMS.map((f, i) => {
          const lineOn = f.late ? late : on
          const last = f.late ? f.id === 'log' : f.id === 'door' && !late
          const text = `new ${kind === 'prod' ? f.real : f.fake}()`
          return (
            <div key={f.id} className="dfi-ln" style={{ paddingLeft: '4ch' }}>
              <code>
                {kind === 'prod' && !f.late ? (
                  on ? (
                    <NewCall id={f.id} text={text} />
                  ) : (
                    '\u00a0'
                  )
                ) : (
                  <motion.span className="dfi-arg" {...(lineOn ? { initial: false as const, animate: { opacity: 1, x: 0 }, transition: stagger(i, 0.1, 0.08) } : { initial: false as const, animate: { opacity: 0, x: -4 }, transition: t.fade })}>
                    {cam(text)}
                  </motion.span>
                )}
                <motion.span {...fade(lineOn)}>{last ? ');' : ','}</motion.span>
              </code>
            </div>
          )
        })}
      </div>
    </motion.div>
  )
}

/* ------------------------------ Klassediagram ---------------------------- */

function Family({ f, k, step }: { f: (typeof FAMS)[number]; k: number; step: number }) {
  const rowOn = f.late ? at(step, 5) : true
  const ifaceOn = f.late ? at(step, 5) : at(step, 2)
  const fakeOn = f.late ? at(step, 5) : at(step, 4)
  const direct = !f.late && step < 2
  const row = k + 2 // række 1 er House (smal) — i bred placering ignoreres den via CSS
  const lastVisible = at(step, 5) ? 4 : 2
  const ifaceNow = f.late ? step === 5 : step === 2
  const fakeNow = f.late ? step === 5 : step === 4
  const realNow = !f.late && step === 1

  return (
    <>
      {/* Bus: fælles association fra House. */}
      <div className="dfi-bus" style={{ gridRow: row }} data-first={k === 0 || undefined}>
        {k === 0 && <motion.div className="dfi-bh dfi-bh-house" {...drawX(true)} />}
        {k > 0 && <motion.div className="dfi-bv dfi-bv-up" {...drawY(rowOn, k)} />}
        {k === 0 && <div className="dfi-bv dfi-bv-top" />}
        {k < 4 && <motion.div className="dfi-bv dfi-bv-down" {...drawY(k < lastVisible, k)} />}
        <motion.div className="dfi-bh" data-now={(ifaceNow && ifaceOn) || undefined} {...drawX(rowOn, k)} />
        <OpenHead on={ifaceOn} className="dfi-head-iface" />
      </div>

      {/* Direkte association før interfacet (trin 0–1). */}
      <div className="dfi-direct" style={{ gridRow: row }} aria-hidden="true">
        <motion.div className="dfi-dline" data-now={realNow || undefined} {...drawX(direct, k)} />
        <OpenHead on={direct} className="dfi-head-real" delay={0} />
      </div>

      {/* Interface. */}
      <div className="dfi-iface-cell" style={{ gridRow: row }}>
        <motion.div
          className="dfi-box dfi-iface"
          data-now={ifaceNow || undefined}
          initial={false}
          animate={ifaceOn ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }}
          transition={ifaceOn ? { ...t.place, delay: 0.05 * k } : t.fade}
          aria-hidden={!ifaceOn || undefined}
        >
          <div className="dfi-name dfi-iname">{cam(f.iface)}</div>
          <div className="dfi-op">{f.op}</div>
        </motion.div>
      </div>

      {/* Realisering: hul trekant ved interfacet, stiplet linje ud til klasserne. */}
      <div className="dfi-conn" style={{ gridRow: row }} aria-hidden="true">
        <motion.svg className="dfi-tri" viewBox="0 0 11 12" {...fade(ifaceOn, 0.2)}>
          <path d="M1 6 10 1 10 11Z" />
        </motion.svg>
        <motion.div className="dfi-rline" data-now={(ifaceNow || fakeNow) || undefined} {...drawX(ifaceOn, k)} />
      </div>

      <div className="dfi-impl" style={{ gridRow: row }} data-pair={fakeOn || undefined}>
        <motion.div className="dfi-trunk" data-now={fakeNow || undefined} {...drawY(fakeOn)} />
        <motion.div
          layout="position"
          transition={t.travel}
          className="dfi-box dfi-real"
          data-now={realNow || (f.late && step === 5) || undefined}
          data-real={ifaceOn || undefined}
          initial={false}
          animate={{ opacity: rowOn ? 1 : 0 }}
          aria-hidden={!rowOn || undefined}
        >
          <span className="dfi-name">{cam(f.real)}</span>
        </motion.div>
        <motion.div
          className="dfi-box dfi-fake"
          data-now={fakeNow || undefined}
          initial={false}
          animate={fakeOn ? { opacity: 1, x: 0 } : { opacity: 0, x: 6 }}
          transition={fakeOn ? { ...t.place, delay: 0.25 + 0.06 * k } : t.fade}
          aria-hidden={!fakeOn || undefined}
        >
          <span className="dfi-name">{cam(f.fake)}</span>
        </motion.div>
      </div>
    </>
  )
}

const RUNGS = ['Identify', 'Interface', 'Inject']

function DftInject({ step }: { step: number }) {
  const lines = houseLines(step)
  return (
    <div className="dfi">
      <ol className="dfi-rungs" aria-label="III">
        {RUNGS.map((r, i) => (
          <li key={r} data-on={at(step, i + 1) || undefined} data-now={step === i + 1 || undefined}>
            <span className="dfi-rung-n">{i + 1}</span>
            {r}
          </li>
        ))}
      </ol>

      <div className="dfi-dia">
        <div className="dfi-house">
          <div className="dfi-house-head">
            <span className="dfi-house-name">House</span>
            <Tag show={at(step, 4)} tone="focus">
              House remains unchanged
            </Tag>
          </div>
          <div className="dfi-house-op">+{'\u00a0'}Leave()</div>
          <Code lines={lines} variants={VARIANTS} />
        </div>
        {FAMS.map((f, k) => (
          <Family key={f.id} f={f} k={k} step={step} />
        ))}
      </div>

      <div className="dfi-callers">
        <Caller kind="prod" step={step} />
        <Caller kind="test" step={step} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'dft-inject',
  title: 'House gøres testbar med Identify, Interface og Inject',
  steps: [
    {
      caption: '`House` laver selv sine afhængigheder med `new` i konstruktøren. Den er hårdt koblet til tre konkrete klasser og kan ikke testes alene.',
      hold: 2400,
    },
    {
      caption:
        '**Identify**: de tre `new` er afhængighederne. Dertil kommer de usynlige: systemuret (`System.DateTime.Now.Hour`) og konsollen (`System.Console.WriteLine`).',
      hold: 2800,
    },
    {
      caption:
        '**Interface**: `IBedroom`, `IKitchen` og `IFrontDoor` sættes ind mellem `House` og klasserne — en *seam*. Klasserne realiserer interfacet (stiplet linje, hul trekant).',
      hold: 2800,
    },
    {
      caption: '**Inject**: `new` flytter ud af `House`. Konstruktøren tager interfaces som parametre, og `Main` giver de rigtige klasser.',
      hold: 2600,
    },
    {
      caption: 'Testen giver `FakeBedroom`, `FakeKitchen` og `FakeFrontDoor` gennem samme konstruktør. *House remains unchanged*.',
      hold: 2600,
    },
    {
      caption:
        'Uret og konsollen pakkes ind på samme måde: `ITimeProvider` og `ILogger`, med fakes i testen. Kaldene med fem argumenter er udvidet her; slidet viser kun konstruktøren.',
      hold: 3000,
    },
  ],
  Component: DftInject,
}

export default viz
