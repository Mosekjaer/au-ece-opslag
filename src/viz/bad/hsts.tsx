import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './hsts.css'

/* "Use HSTS with HTTPS redirection" fra HTTPS.pdf: de fem trin mellem
   browseren og appen på myapp.com, nummereret som i materialet. */

const HTTP = 'http://myapp.com/path'
const HTTPS = 'https://myapp.com/path'

// Beskeden der rejser: hvor er den, og hvad står der på den?
const MSG = [
  { at: 'browser', text: `GET ${HTTP}`, https: false },
  { at: 'app', text: `GET ${HTTP}`, https: false },
  { at: 'browser', text: '307 Temporary Redirect', https: false },
  { at: 'app', text: `GET ${HTTPS}`, https: true },
  { at: 'browser', text: '200 OK · strict-transport-security', https: true },
  { at: 'app', text: `GET ${HTTPS}`, https: true },
  { at: 'app', text: `GET ${HTTPS}`, https: true },
] as const

const LANE = [
  { back: false, label: '', active: false },
  { back: false, label: 'HTTP', active: true },
  { back: true, label: '307', active: true },
  { back: false, label: 'HTTPS', active: true },
  { back: true, label: 'HTTPS', active: true },
  { back: false, label: 'HTTPS', active: true },
  { back: false, label: 'HTTPS', active: false },
]

const STEPS = [
  <>
    <code>GET {HTTP}</code> — første anmodning over HTTP
  </>,
  <>
    <code>307 Temporary Redirect</code> til samme sti over HTTPS
  </>,
  <>
    <code>GET {HTTPS}</code>
  </>,
  <>
    Svaret har headeren <code>strict-transport-security</code>
  </>,
  <>Senere HTTP-forsøg afbrydes i browseren og sendes som HTTPS</>,
]

function Lock({ on }: { on: boolean }) {
  return <span className="hs-lock" data-on={on} aria-label={on ? 'https' : 'http'} role="img" />
}

function Hsts({ step }: { step: number }) {
  const msg = MSG[step]
  const lane = LANE[step]
  const url = step >= 3 ? HTTPS : HTTP
  const remembered = at(step, 4)
  const aborted = at(step, 5)

  const token = (
    <Token id="hs-msg" tone={msg.https ? 'focus' : 'idle'} launch={step === 1}>
      {msg.text}
    </Token>
  )

  return (
    <div className="hs">
      <div className="vflow stack hs-flow">
        <Node className="hs-node" title="Browser" tone={remembered ? 'ok' : 'idle'}>
          <div className="hs-bar" data-https={step >= 3}>
            <Lock on={step >= 3} />
            <code>{url}</code>
          </div>
          <div className="hs-slot">{msg.at === 'browser' && token}</div>
          <motion.div
            className="hs-aborted"
            initial={false}
            animate={{ opacity: aborted ? 1 : 0, x: aborted ? 0 : -4 }}
            transition={aborted ? t.place : t.fade}
          >
            <code>GET {HTTP}</code>
            <Tag tone="neg">afbrudt i browseren</Tag>
          </motion.div>
          <motion.div className="hs-memory" initial={false} animate={{ opacity: remembered ? 1 : 0 }} transition={t.fade}>
            husker <code>strict-transport-security</code> for myapp.com
          </motion.div>
        </Node>

        <Link on={lane.active || at(step, 1)} back={lane.back} tone={lane.active ? 'focus' : 'idle'} label={lane.label} />

        <Node className="hs-node" title="App" sub="myapp.com" tone={msg.at === 'app' && lane.active ? 'focus' : 'idle'}>
          <div className="hs-slot">{msg.at === 'app' && token}</div>
        </Node>
      </div>

      <ol className="hs-steps">
        {STEPS.map((s, i) => {
          const n = i + 1
          const state = step === n ? 'now' : step > n ? 'done' : 'next'
          return (
            <motion.li
              key={i}
              className="hs-step"
              data-state={state}
              initial={false}
              animate={{ opacity: state === 'next' ? 0.35 : 1 }}
              transition={state === 'next' ? t.fade : stagger(0, 0.1)}
            >
              <span className="hs-num">{n}</span>
              <span className="hs-text">{s}</span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'hsts',
  title: 'HTTPS-redirect og HSTS',
  steps: [
    { caption: 'Brugeren skriver `http://myapp.com/path`. Appen bruger HTTPS-redirection og HSTS.', hold: 1800 },
    { caption: '**1** — Browseren sender den første anmodning over HTTP, ukrypteret.', hold: 1800 },
    { caption: '**2** — Appen svarer straks `307 Temporary Redirect`: send det samme igen over HTTPS.', hold: 2200 },
    { caption: '**3** — Browseren sender anmodningen igen, nu til `https://myapp.com/path`.', hold: 1800 },
    {
      caption: '**4** — Appen svarer og sender headeren `strict-transport-security` med. Browseren husker den for `myapp.com`.',
      hold: 2600,
    },
    {
      caption:
        '**5** — Senere skriver brugeren `http://…` igen. Browseren afbryder selv HTTP-anmodningen og sender HTTPS i stedet; HTTP-anmodningen forlader aldrig browseren.',
      hold: 3000,
    },
    {
      caption: 'HSTS er *secure or not at all*. Websites skal kunne tage imod HTTP og redirecte; **API’er bør afvise HTTP helt**.',
      hold: 3000,
    },
  ],
  Component: Hsts,
}

export default viz
