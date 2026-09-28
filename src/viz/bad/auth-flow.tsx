import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './auth-flow.css'

/* Tre anmodninger mod /auth/test/3 med [Authorize(Roles = RoleNames.Administrator)]
   (Authentication and Authorization.pdf s. 39–41; bogen kap. 9 for 401 og
   brugerne TestUser/TestAdministrator). Hver anmodning bliver stoppet eller
   sluppet igennem og lander som et udfald nederst. */

type Where = 'client' | 'authn' | 'filter' | 'endpoint' | 'done' | 'off'

const REQS = [
  { id: 'r1', label: '1 · uden token', result: 'ChallengeResult', tone: 'neg' as Tone },
  { id: 'r2', label: '2 · JWT', result: 'ForbidResult', tone: 'neg' as Tone },
  { id: 'r3', label: '3 · JWT', result: '200 OK', tone: 'focus' as Tone },
]

// Hvor er hver anmodning i hvert trin?
const PATH: Where[][] = [
  ['client', 'authn', 'filter', 'done', 'done', 'done', 'done', 'done'],
  ['off', 'off', 'client', 'authn', 'filter', 'done', 'done', 'done'],
  ['off', 'off', 'off', 'off', 'client', 'authn', 'endpoint', 'done'],
]

const OUTCOMES = [
  { head: 'Anmodning 1 · intet token', note: 'ikke logget ind — bogen viser 401' },
  { head: 'Anmodning 2 · TestUser', note: 'logget ind, men uden rollen — bogen viser også 401' },
  { head: 'Anmodning 3 · TestAdministrator', note: 'rollen findes: “You are authorized!”' },
]

type Who = 'none' | 'anon' | 'user' | 'admin'
const WHO: Who[] = ['none', 'anon', 'anon', 'user', 'user', 'admin', 'admin', 'admin']

function tokenFor(i: number, step: number, where: Where) {
  const r = REQS[i]
  const resolved = where === 'done' || (where === 'filter' && i < 2) || where === 'endpoint'
  const waiting = where === 'client' && step > 0
  return (
    <Token key={r.id} id={`af-${r.id}`} tone={resolved ? r.tone : waiting ? 'idle' : 'focus'} launch={where === 'authn'}>
      {resolved ? r.result : r.label}
    </Token>
  )
}

function Slot({ at: where, step }: { at: Where; step: number }) {
  return (
    <div className="af-slot">
      {PATH.map((p, i) => (p[step] === where ? tokenFor(i, step, where) : null))}
    </div>
  )
}

function Claim({ type, value, tone = 'idle' }: { type: string; value: ReactNode; tone?: Tone }) {
  return (
    <div className="af-claim" data-tone={tone}>
      <code className="af-claim-type">{type}</code>
      <span className="af-claim-value">{value}</span>
    </div>
  )
}

function User({ step }: { step: number }) {
  const who = WHO[step]
  const name = who === 'user' ? 'TestUser' : who === 'admin' ? 'TestAdministrator' : '—'
  const role = who === 'admin' ? 'Administrator' : who === 'user' ? 'mangler' : '—'
  const roleTone: Tone = who === 'admin' ? 'focus' : who === 'user' && step === 4 ? 'neg' : 'idle'
  return (
    <div className="af-user" data-who={who}>
      <div className="af-user-head">
        <code>HttpContext.User</code>
        <span className="af-user-sub">
          {who === 'none' ? 'sættes af authentication-middlewaren' : who === 'anon' ? 'ingen bruger' : 'ClaimsPrincipal'}
        </span>
      </div>
      <div className="af-claims">
        <Claim type="Name" value={name} tone={who === 'user' || who === 'admin' ? 'focus' : 'idle'} />
        <Claim type="Role" value={role} tone={roleTone} />
      </div>
    </div>
  )
}

function AuthFlow({ step }: { step: number }) {
  const cur = PATH.map((p) => p[step])
  const here = (w: Where) => cur.includes(w)
  const filterTone: Tone = step === 2 || step === 4 ? 'neg' : step === 6 ? 'ok' : 'idle'
  const filterTag = step === 2 ? '401' : step === 4 ? 'mangler rollen' : step === 6 ? 'rollen findes' : null
  const shortCircuit = step === 2 || step === 4

  return (
    <div className="af">
      <div className="vflow stack af-flow">
        <Node className="af-node" title="Klient">
          <Slot at="client" step={step} />
        </Node>
        <Link on tone={here('authn') ? 'focus' : 'idle'} />
        <Node className="af-node" title={<code>UseAuthentication()</code>} sub="hvem er du?" tone={here('authn') ? 'focus' : 'idle'}>
          <Slot at="authn" step={step} />
        </Node>
        <Link on tone={step === 2 || step === 4 || step === 6 ? 'focus' : 'idle'} />
        <Node className="af-node" title="Authorize-filter" sub="må du?" tone={filterTone}>
          <Slot at="filter" step={step} />
          <div className="af-tagline">{filterTag && <Tag tone={step === 6 ? 'focus' : 'neg'}>{filterTag}</Tag>}</div>
        </Node>
        <Link on tone={step === 6 ? 'focus' : shortCircuit ? 'muted' : 'idle'} />
        <Node
          className="af-node"
          title={<code>GET /auth/test/3</code>}
          sub={<code className="af-attr">[Authorize(Roles = RoleNames.Administrator)]</code>}
          tone={step === 6 ? 'focus' : shortCircuit ? 'muted' : 'idle'}
        >
          <Slot at="endpoint" step={step} />
        </Node>
      </div>

      <User step={step} />

      <div className="af-outcomes">
        {OUTCOMES.map((o, i) => {
          const done = PATH[i][step] === 'done'
          return (
            <motion.div
              key={i}
              className="af-outcome"
              data-done={done}
              data-tone={REQS[i].tone}
              initial={false}
              animate={{ opacity: done ? 1 : 0.5 }}
              transition={t.fade}
            >
              <div className="af-outcome-head">{o.head}</div>
              <div className="af-slot">{done && tokenFor(i, step, 'done')}</div>
              <motion.div className="af-outcome-note" initial={false} animate={{ opacity: done ? 1 : 0 }} transition={t.fade}>
                {o.note}
              </motion.div>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'auth-flow',
  title: 'Authentication før authorization',
  steps: [
    {
      caption: 'Endpointet `/auth/test/3` kræver rollen Administrator. Foran det sidder `UseAuthentication()` og authorize-filteret.',
      hold: 2200,
    },
    {
      caption: 'Anmodning 1 har intet token. Authentication finder ingen bruger at sætte i `HttpContext.User`.',
      hold: 2200,
    },
    {
      caption: 'Filteret kortslutter med **`ChallengeResult`**: brugeren er ikke logget ind. Bogen viser svaret som `401 Unauthorized`.',
      hold: 2800,
    },
    {
      caption:
        'Anmodning 2 har en gyldig JWT. Authentication deserialiserer en `ClaimsPrincipal` og sætter `HttpContext.User`: `Name = TestUser`, ingen rolle.',
      hold: 3000,
    },
    {
      caption: 'Brugeren er logget ind, men mangler rollen. Filteret kortslutter med **`ForbidResult`**, og endpointet nås ikke. I bogens test får TestUser også `401`.',
      hold: 2800,
    },
    {
      caption: 'Anmodning 3: TestAdministrators JWT har claimet `Role = Administrator`, og det lander i `HttpContext.User`.',
      hold: 2400,
    },
    {
      caption: 'Kravet er opfyldt. Filteret lader anmodningen gå videre, og endpointet svarer `200 OK`.',
      hold: 2200,
    },
    {
      caption:
        'Tre udfald: ingen bruger giver *challenge*, en bruger uden rollen giver *forbid*, og en bruger med rollen kommer igennem. Authentication kommer altid først.',
      hold: 3000,
    },
  ],
  Component: AuthFlow,
}

export default viz
