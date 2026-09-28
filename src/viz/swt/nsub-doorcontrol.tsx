import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './nsub-doorcontrol.css'

/* DoorControlConstructorInjection: DoorControl.cs (RequestEntry kalder
   ValidateEntryRequest, Open og NotifyEntryGranted) og DoorControlEntryGrantedTests.cs
   (SetUp, RequestEntry_CardDbApprovesEntryRequest_DoorOpenCalled og
   …_BeeperMakeUnhappyNoiseNotCalled). Isolation frameworks.pdf s. 4–8
   (Returns, Received som implicit assertion, Calculator-eksemplet og faldgruben
   på s. 8). Kaldet Subtract(1, 3) er et tænkt fejlkald til at vise pointen. */

function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[.,(<])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

const show = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: 3 },
  transition: on ? { ...t.settle, delay } : t.fade,
})

type SubId = 'uv' | 'door' | 'notif' | 'alarm'
const SUBS: {
  id: SubId
  field: string
  iface: string
  calls: { text: string; ret?: string }[]
  assert?: string
}[] = [
  { id: 'uv', field: '_userValidation', iface: 'IUserValidation', calls: [{ text: 'ValidateEntryRequest("TFJ")', ret: 'true' }] },
  { id: 'door', field: '_door', iface: 'IDoor', calls: [{ text: 'Open()' }], assert: 'Received(1).Open()' },
  {
    id: 'notif',
    field: '_entryNotification',
    iface: 'IEntryNotification',
    calls: [{ text: 'NotifyEntryGranted()' }],
    assert: 'Received(0).NotifyEntryDenied()',
  },
  { id: 'alarm', field: '_alarm', iface: 'IAlarm', calls: [] },
]

interface CodeLine {
  text: string
  beat: number
  label?: string
}
const CODE: CodeLine[] = [
  { label: '[SetUp]', text: '_userValidation = Substitute.For<IUserValidation>();', beat: 0 },
  { text: '_door = Substitute.For<IDoor>();', beat: 0 },
  { text: '_entryNotification = Substitute.For<IEntryNotification>();', beat: 0 },
  { text: '_alarm = Substitute.For<IAlarm>();', beat: 0 },
  { text: '_uut = new DoorControl(_userValidation, _door, _entryNotification, _alarm);', beat: 0 },
  { text: '_userValidation.ValidateEntryRequest("TFJ").Returns(true);', beat: 1 },
  { label: 'Act', text: '_uut.RequestEntry("TFJ");', beat: 2 },
  { label: 'Assert (to tests)', text: '_door.Received(1).Open();', beat: 3 },
  { text: '_entryNotification.Received(0).NotifyEntryDenied();', beat: 3 },
]

function Sub({ s, step, k }: { s: (typeof SUBS)[number]; step: number; k: number }) {
  const acted = at(step, 2)
  const asserted = at(step, 3)
  const stub = s.id === 'uv'
  const hot = (step === 1 && stub) || (step === 2 && s.calls.length > 0) || (step === 3 && !!s.assert)
  return (
    <div className="nd-sub" data-hot={hot || undefined}>
      <div className="nd-sub-head">
        <code className="nd-sub-field">{s.field}</code>
        <code className="nd-sub-iface">: {s.iface}</code>
      </div>
      {stub && (
        <motion.div className="nd-rule" {...show(at(step, 1))}>
          <span className="nd-lbl">Returns</span>
          <code>{brk('ValidateEntryRequest("TFJ")')}</code> → <code className="nd-val">true</code>
        </motion.div>
      )}
      <div className="nd-rec">
        <span className="nd-lbl">optagede kald</span>
        <span className="nd-rec-list nd-rec-stack">
          <motion.span className="nd-empty" initial={false} animate={{ opacity: s.calls.length === 0 || !acted ? 1 : 0 }} transition={t.fade}>
            ingen
          </motion.span>
          {s.calls.length > 0 && (
            <span className="nd-rec-calls">
              {s.calls.map((c, i) => (
                <motion.span
                  key={c.text}
                  className="nd-call"
                  initial={false}
                  animate={acted ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
                  transition={acted ? stagger(k + i, 0.15, 0.18) : t.fade}
                >
                  <code>{brk(c.text)}</code>
                  {c.ret && (
                    <>
                      {' '}
                      → <code className="nd-val">{c.ret}</code>
                    </>
                  )}
                </motion.span>
              ))}
            </span>
          )}
        </span>
      </div>
      {s.assert && (
        <motion.div className="nd-assert" {...show(asserted, 0.1 + k * 0.15)}>
          <code>{brk(s.assert)}</code>
          <span className="nd-check">✓</span>
        </motion.div>
      )}
    </div>
  )
}

function Pitfall({ step }: { step: number }) {
  const a = at(step, 4)
  const b = at(step, 5)
  return (
    <motion.section className="nd-pit" {...show(a)} aria-hidden={!a || undefined}>
      <header className="nd-pit-head">
        <span className="nd-pit-title">Faldgruben: argument-matching</span>
        <span className="nd-pit-src">Calculator-eksemplet, s. 7–8</span>
      </header>
      <div className="nd-pit-grid">
        <div className="nd-sub nd-calc" data-hot={step === 4 || step === 5 || undefined}>
          <div className="nd-sub-head">
            <code className="nd-sub-field">sub</code>
            <code className="nd-sub-iface">: ICalculatorBrain</code>
          </div>
          <div className="nd-rec">
            <span className="nd-lbl">optagede kald</span>
            <span className="nd-rec-list">
              <span className="nd-call">
                <code>Add(1, 3)</code>
              </span>
              <span className="nd-call" data-bad data-match={at(step, 4) || undefined}>
                <code>Subtract(1, 3)</code>
                <Tag tone="neg" wrap>
                  tænkt fejlkald
                </Tag>
              </span>
            </span>
          </div>
        </div>

        <div className="nd-checks">
          <div className="nd-try" data-now={step === 4 || undefined}>
            <code className="nd-try-code">{brk('sub.DidNotReceive().Subtract(Arg.Any<double>(), Arg.Any<double>());')}</code>
            <div className="nd-try-out">
              <span className="nd-verdict" data-tone="neg">
                ✗ fejler
              </span>
              <span className="nd-why">matcher alle argumenter — fanger kaldet</span>
            </div>
          </div>
          <motion.div className="nd-try" data-now={step === 5 || undefined} {...show(b)} aria-hidden={!b || undefined}>
            <code className="nd-try-code">{brk('sub.DidNotReceive().Subtract(3, 1);')}</code>
            <div className="nd-try-out">
              <span className="nd-verdict" data-tone="ok">
                ✓ består
              </span>
              <span className="nd-why">
                <code>(3, 1)</code> matcher ikke <code>(1, 3)</code> — <em>passes even if Subtract was actually called</em>
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  )
}

function NsubDoor({ step }: { step: number }) {
  const acted = at(step, 2)
  return (
    <div className="nd">
      <div className="nd-top">
        <div className="nd-code">
          {CODE.map((l, i) => {
            const hot = l.beat === step
            const done = l.beat < step && step <= 3
            return (
              <Fragment key={i}>
                {l.label && <div className="nd-code-label vcaps">{l.label}</div>}
                <div className="nd-ln" data-hot={hot || undefined} data-done={done || undefined}>
                  <code>{brk(l.text)}</code>
                </div>
              </Fragment>
            )
          })}
        </div>

        <div className="nd-dc" data-hot={step === 2 || undefined}>
          <div className="nd-dc-name">
            <code>_uut</code>
            <code className="nd-sub-iface">: DoorControl</code>
          </div>
          <motion.div className="nd-dc-act" {...show(acted)}>
            <code>{brk('RequestEntry("TFJ")')}</code>
          </motion.div>
        </div>

        {SUBS.map((s, k) => (
          <Fragment key={s.id}>
            <div className="nd-link" data-k={k} style={{ gridRow: k + 1 }} aria-hidden="true">
              <Link on tone={step === 2 && s.calls.length > 0 ? 'focus' : 'idle'} />
            </div>
            <div className="nd-sub-cell" style={{ gridRow: k + 1 }}>
              <Sub s={s} step={step} k={k} />
            </div>
          </Fragment>
        ))}
      </div>

      <Pitfall step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'nsub-doorcontrol',
  title: 'Én substitute er både stub og mock',
  steps: [
    {
      caption: '`Substitute.For<…>()` laver fire substitutes ud fra interfaces og injicerer dem i `DoorControl`. Hver optager sine kald — listerne er tomme.',
      hold: 2600,
    },
    {
      caption: '**Stub**: `.Returns(true)` får `_userValidation` til at godkende `"TFJ"` — kun for præcis det argument.',
      hold: 2400,
    },
    {
      caption: '**Act**: `_uut.RequestEntry("TFJ")`. Valideringen svarer `true`, og `Open()` og `NotifyEntryGranted()` lander i hver sin substitutes liste.',
      hold: 2800,
    },
    {
      caption: '**Mock**: `Received(1).Open()` finder ét kald, `Received(0).NotifyEntryDenied()` finder ingen. Begge er implicitte assertions — fra to tests.',
      hold: 2800,
    },
    {
      caption: 'Faldgruben (s. 7–8). Antag et **tænkt fejlkald** `Subtract(1, 3)`. `DidNotReceive()` med `Arg.Any<double>()` matcher det, og testen fejler, som den skal.',
      hold: 2800,
    },
    {
      caption: 'Med konkrete argumenter `(3, 1)` matcher intet, så testen **består**, selvom `Subtract` blev kaldt. Brug `Arg.Any` i negative assertions.',
      hold: 3000,
    },
  ],
  Component: NsubDoor,
}

export default viz
