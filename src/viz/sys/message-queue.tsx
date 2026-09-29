import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './message-queue.css'

/* 08.1-Message-Passing-and-Queues.pdf s. 14 (MessageQueue: push blokerer når fuld, pop
   når tom), s. 18 (main: consumerThread og producer1, der pusher LoginData{"Gerd Muller"}
   og LogoutData{"Roberto Baggio"}) og s. 19 (Consumer::dispatchMessages med
   while (queue.pop(msg)) og std::visit til de overloadede handle-funktioner og deres
   cout-tekster). Slidet viser kun køens interface; mutex + condition variable er den
   blokerende kø fra monitor-emnet og nævnes kun som det. */

type Id = 'login' | 'logout'
type Place = 'prod' | 'queue' | 'msg' | 'handler'

const MSG: Record<Id, { type: string; who: string; push: string; out: string }> = {
  login: {
    type: 'LoginData',
    who: 'Gerd Muller',
    push: 'queue.push({LoginData{"Gerd Muller"}})',
    out: 'User Gerd Muller logged in.',
  },
  logout: {
    type: 'LogoutData',
    who: 'Roberto Baggio',
    push: 'queue.push({LogoutData{"Roberto Baggio"}})',
    out: 'User Roberto Baggio logged out.',
  },
}

/** Kode med brudmuligheder efter `(`, `{` og `, ` — aldrig midt i et navn. */
function Code({ children }: { children: string }) {
  const parts = children.split(/(?<=[({,] ?)/)
  return (
    <code className="smq-code">
      {parts.map((p, i) => (
        <span key={i}>
          {p}
          {i < parts.length - 1 && <wbr />}
        </span>
      ))}
    </code>
  )
}

function place(id: Id, step: number): Place {
  if (id === 'login') return step < 1 ? 'prod' : step < 3 ? 'queue' : step < 4 ? 'msg' : 'handler'
  return step < 2 ? 'prod' : step < 5 ? 'queue' : 'handler'
}

function Queue({ step }: { step: number }) {
  const tok = (id: Id) => (
    <Token id={`mq-${id}`} tone={place(id, step) === 'handler' ? 'idle' : 'focus'} launch={place(id, step) === 'queue' && step === (id === 'login' ? 1 : 2)}>
      {MSG[id].type}
    </Token>
  )
  const inQueue = (['login', 'logout'] as Id[]).filter((id) => place(id, step) === 'queue')
  const blocked = step === 0 || step >= 6
  const visitFor: Id | null = step === 3 || step === 4 ? 'login' : step === 5 ? 'logout' : null
  const pushing = step === 1 ? 'login' : step === 2 ? 'logout' : null

  return (
    <div className="smq">
      <div className="smq-prod">
        <span className="vcaps">
          Tråd <code>producer1</code>
        </span>
        {(['login', 'logout'] as Id[]).map((id) => (
          <div key={id} className="smq-line" data-now={pushing === id || undefined}>
            <Code>{MSG[id].push}</Code>
            <span className="smq-slot">{place(id, step) === 'prod' && tok(id)}</span>
          </div>
        ))}
      </div>

      <Link vertical on={step >= 1} tone={pushing ? 'focus' : 'idle'} label="push" className="smq-link" />

      <div className="smq-q">
        <span className="vcaps">
          <code>MessageQueue queue</code>
        </span>
        <div className="smq-slots">
          {[0, 1].map((i) => (
            <span key={i} className="smq-cell" data-front={i === 0 || undefined}>
              {inQueue[i] && tok(inQueue[i])}
            </span>
          ))}
        </div>
        <span className="smq-qnote">
          <code>pop</code> tager den forreste · tom kø: <code>pop</code> blokerer
        </span>
      </div>

      <Link vertical on={step >= 3} tone={step === 3 || step === 5 ? 'focus' : 'idle'} label="pop" className="smq-link" />

      <div className="smq-cons">
        <div className="smq-cons-head">
          <span className="vcaps">
            Tråd <code>consumerThread</code>
          </span>
          <span className="vswap smq-state">
            <Tag tone="idle" show={blocked}>
              blokeret i pop()
            </Tag>
            <Tag tone="focus" show={!blocked}>
              kører
            </Tag>
          </span>
        </div>
        <div className="smq-line" data-now={step === 3 || undefined}>
          <Code>while (queue.pop(msg))</Code>
          <span className="smq-slot">{place('login', step) === 'msg' && tok('login')}</span>
        </div>
        <div className="smq-line smq-visit" data-now={visitFor !== null || undefined}>
          <Code>{'std::visit([](auto&& data) { handle(data); }, msg.data)'}</Code>
        </div>

        <div className="smq-handlers">
          {(['login', 'logout'] as Id[]).map((id) => {
            const done = place(id, step) === 'handler'
            const now = (id === 'login' && step === 4) || (id === 'logout' && step === 5)
            return (
              <div key={id} className="smq-h" data-now={now || undefined} data-done={done || undefined}>
                <div className="smq-h-top">
                  <Code>{`handle(const ${MSG[id].type}&)`}</Code>
                  <span className="smq-slot">{done && tok(id)}</span>
                </div>
                <motion.span
                  className="smq-out"
                  initial={false}
                  animate={{ opacity: done ? 1 : 0 }}
                  transition={done ? { ...t.fade, delay: now ? 0.6 : 0 } : t.fade}
                >
                  {MSG[id].out}
                </motion.span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'message-queue',
  title: 'To beskedtyper gennem én kø',
  steps: [
    {
      caption: '`consumerThread` kører `dispatchMessages()` og kalder `pop` på en tom kø — den **blokerer**. Beskedtyperne er `std::variant<LoginData, LogoutData>`.',
      hold: 2800,
    },
    {
      caption: '`producer1` pusher en `LoginData`. Køen vækker den ventende consumer — i en blokerende kø typisk med mutex og condition variable.',
      hold: 2600,
    },
    { caption: 'Så en `LogoutData`. Begge typer ligger i **samme kø**, fordi `Message` pakker dem i én variant.', hold: 2400 },
    { caption: '`pop` giver den forreste besked til consumeren som en *værdi*. Køen ejer dataen, indtil den er afleveret.', hold: 2400 },
    {
      caption: '`std::visit` er **dispatcheren**: `msg.data` holder en `LoginData`, så overloaden `handle(const LoginData&)` kaldes.',
      hold: 2800,
    },
    { caption: 'Næste `pop` giver `LogoutData`, og `std::visit` vælger `handle(const LogoutData&)`.', hold: 2400 },
    {
      caption: 'Køen er tom, og consumeren blokerer igen i `pop`. Én tråd og én kø klarer alle typer; mangler en overload, er det en **compile-time-fejl**.',
      hold: 3000,
    },
  ],
  Component: Queue,
}

export default viz
