import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Token } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './pubsub-broker.css'

/* 10.1-Messaging-Systems.pdf s. 12 (klassediagram: «Singleton» Broker med
   subscribers: map<string, vector<function>>, getInstance(), subscribe(topic, handler),
   publish(message); Consumer.onMessage), s. 15–16 (subscribe("login", Consumer.onMessage)
   lægger handleren i subscribers["login"]; publish slår op og kalder onMessage),
   s. 17 (publish er synkron) og s. 19 (Temperature sensor publicerer tempMessage til
   Logger, GUI og Notification; producer og consumer kender ikke hinanden). */

type Where = 'pub' | 'broker' | 'sub'

const TEMP_SUBS = ['Logger', 'GUI', 'Notification'] as const

function loginAt(step: number): Where {
  return step < 3 ? 'pub' : step === 3 ? 'broker' : 'sub'
}
function tempAt(step: number): Where {
  return step < 5 ? 'pub' : step === 5 ? 'broker' : 'sub'
}

function Broker({ step }: { step: number }) {
  const login = loginAt(step)
  const temp = tempAt(step)
  const final = step >= 6

  const loginTok = <Token id="ps-login" tone={login === 'sub' && step > 4 ? 'idle' : 'focus'} launch={step === 3}>"login"</Token>
  const tempTok = (i: number) => (
    <Token key={i} id={`ps-temp-${i}`} tone="focus" launch={step === 5}>
      tempMessage
    </Token>
  )
  const tempStack = <span className="sps-stack">{[0, 1, 2].map(tempTok)}</span>

  const loginRow = step >= 1
  const tempRow = step >= 2

  return (
    <div className="sps">
      <div className="sps-flow vflow stack">
      {/* Publishers */}
      <div className="sps-col">
        <span className="vcaps">Publishers</span>
        <div className="sps-node" data-now={step === 3 || undefined}>
          <span className="sps-title">Producer</span>
          <code className="sps-sub">publish(message)</code>
          <span className="sps-slot">{login === 'pub' && loginTok}</span>
        </div>
        <div className="sps-node" data-now={step === 5 || undefined}>
          <span className="sps-title">Temperature sensor</span>
          <code className="sps-sub">publish(message)</code>
          <span className="sps-slot">{temp === 'pub' && tempStack}</span>
        </div>
      </div>

      <Link on={step >= 3} tone={step === 3 || step === 5 ? 'focus' : 'idle'} label="publish" />

      {/* Brokeren */}
      <div className="sps-broker" data-now={step === 1 || step === 2 || step === 4 || step === 6 || undefined}>
        <div className="sps-bhead">
          <span className="sps-stereo">«Singleton»</span>
          <span className="sps-title">Broker</span>
          <code className="sps-sub">Broker::getInstance()</code>
        </div>
        <div className="sps-map">
          <code className="sps-maptype">
            subscribers : map&lt;string, vector&lt;function&gt;&gt;
          </code>
          <div className="sps-row" data-on={loginRow || undefined} data-now={step === 1 || step === 3 || undefined}>
            <code className="sps-key">"login"</code>
            <span className="sps-handlers">
              <motion.span className="sps-h" initial={false} animate={{ opacity: loginRow ? 1 : 0, x: loginRow ? 0 : -4 }} transition={loginRow ? t.place : t.fade}>
                Consumer.onMessage
              </motion.span>
            </span>
            <span className="sps-slot">{login === 'broker' && loginTok}</span>
          </div>
          <div className="sps-row" data-on={tempRow || undefined} data-now={step === 2 || step === 5 || undefined}>
            <code className="sps-key">"tempMessage"</code>
            <span className="sps-handlers">
              {TEMP_SUBS.map((n, i) => (
                <motion.span
                  key={n}
                  className="sps-h"
                  initial={false}
                  animate={{ opacity: tempRow ? 1 : 0, x: tempRow ? 0 : -4 }}
                  transition={tempRow ? stagger(i, 0.1, 0.12) : t.fade}
                >
                  {n}
                </motion.span>
              ))}
            </span>
            <span className="sps-slot">{temp === 'broker' && tempStack}</span>
          </div>
        </div>
      </div>

      <Link on={step >= 4} tone={step === 4 || step === 6 ? 'focus' : 'idle'} label="onMessage" />

      {/* Subscribers */}
      <div className="sps-col">
        <span className="vcaps">Subscribers</span>
        <div className="sps-subs">
          <div className="sps-node" data-now={step === 1 || step === 4 || undefined}>
            <span className="sps-title">Consumer</span>
            <code className="sps-sub">"login"</code>
            <span className="sps-slot">{login === 'sub' && loginTok}</span>
          </div>
          {TEMP_SUBS.map((n, i) => (
            <div key={n} className="sps-node" data-now={step === 2 || step === 6 || undefined}>
              <span className="sps-title">{n}</span>
              <code className="sps-sub">"tempMessage"</code>
              <span className="sps-slot">{temp === 'sub' && tempTok(i)}</span>
            </div>
          ))}
        </div>
      </div>

      </div>

      <motion.p className="sps-note" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
        Kun brokeren og beskedtyperne er kendt. <code>publish</code> er synkron: handleren kører på publisherens tråd.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'pubsub-broker',
  title: 'Brokeren fordeler efter topic',
  steps: [
    {
      caption: 'Publishers og subscribers kender kun **brokeren** — en Singleton, der hentes med `Broker::getInstance()`. Dens `subscribers`-map er tom.',
      hold: 2600,
    },
    {
      caption: '`Consumer` kalder `subscribe("login", Consumer.onMessage)`. Brokeren gemmer handleren under topic’et i `subscribers["login"]`.',
      hold: 2800,
    },
    { caption: 'Logger, GUI og Notification abonnerer på `tempMessage`. Samme topic kan have mange handlers.', hold: 2400 },
    { caption: '`Producer` kalder `publish(message)` med topic `"login"`. Brokeren slår topic’et op i mappet.', hold: 2400 },
    {
      caption: 'Brokeren kalder `onMessage(message)` på hver handler under `"login"` — her kun `Consumer`. Kaldet er **synkront**: `publish` venter, til den er færdig.',
      hold: 3000,
    },
    { caption: '`Temperature sensor` publicerer en `tempMessage`. Den ved ikke, hvem der lytter.', hold: 2200 },
    {
      caption: 'Beskeden leveres til **alle** tre subscribers på topic’et. Det er forskellen fra point-to-point, hvor hver besked når én consumer.',
      hold: 3000,
    },
  ],
  Component: Broker,
}

export default viz
