import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './html-form-submit.css'

/* Forms in HTML.pdf s. 5–12: formularen med action="AddToNewsletter", name=value-parrene,
   GET (default, data i URL’en) mod POST (data i body). Søgeeksemplet er hintet i
   SW4FED-02 2024 Sommer s. 3. Feltværdierne findes ikke i materialet og vises som “…”. */

const FIELDS = [
  { label: 'Name', name: 'name' },
  { label: 'Email', name: 'email' },
]

function Pair({ id, name, tone = 'focus', launch }: { id: string; name: string; tone?: 'focus' | 'muted'; launch?: boolean }) {
  return (
    <Token id={id} tone={tone} launch={launch}>
      {name}=…
    </Token>
  )
}

/** Par, der ankommer fra venstre (formularen) uden at have et forrige sted. */
function Arrive({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <motion.span
      className="fs-arrive"
      initial={false}
      animate={on ? { opacity: 1, x: 0 } : { opacity: 0, x: -48 }}
      transition={on ? t.travel : t.fade}
    >
      {children}
    </motion.span>
  )
}

function Field({ label, children, empty }: { label: string; children?: ReactNode; empty?: boolean }) {
  return (
    <div className="fs-field" data-empty={empty || undefined}>
      <span className="fs-flabel">{label}</span>
      <div className="fs-fval">{children}</div>
    </div>
  )
}

function Form({ step }: { step: number }) {
  const method = step <= 1 ? '…' : step <= 3 ? 'get' : 'post'
  return (
    <div className="fs-form vnode" data-tone={step <= 1 ? 'focus' : 'idle'}>
      <code className="fs-tag">
        {'<form '}
        <span className="fs-nb">action="AddToNewsletter"</span>{' '}
        <span className="fs-method" data-set={method !== '…' || undefined}>
          method="{method}"
        </span>
        {'>'}
      </code>
      {FIELDS.map((f) => (
        <div key={f.name} className="fs-input">
          <span className="fs-ilabel">{f.label}</span>
          <span className="fs-ibox" data-filled={at(step, 1) || undefined}>
            {at(step, 1) ? '…' : ''}
          </span>
          <code className="fs-name">name="{f.name}"</code>
        </div>
      ))}
      <div className="fs-buttons">
        <span className="fs-btn">Send</span>
        <span className="fs-btn">Nulstil</span>
        <code className="fs-name fs-noname">id="submit"</code>
      </div>
      <div className="fs-slot">
        {step === 1 && (
          <>
            <Pair id="g-name" name="name" launch />
            <Pair id="g-email" name="email" launch />
          </>
        )}
        <Tag show={at(step, 1)} tone="muted" wrap>
          knappen har intet name → sendes ikke
        </Tag>
      </div>
    </div>
  )
}

function Request({ kind, step }: { kind: 'get' | 'post'; step: number }) {
  const on = kind === 'get' ? at(step, 2) : at(step, 4)
  const now = kind === 'get' ? step === 2 || step === 3 : step === 4
  const verb = kind === 'get' ? 'GET' : 'POST'
  return (
    <div className="fs-req vnode" data-tone={!on ? 'ghost' : now ? 'focus' : 'idle'} data-kind={kind}>
      <div className="fs-req-head">
        <span className="fs-verb">{verb}</span>
        <motion.span className="fs-req-sub" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
          {kind === 'get' ? 'method="get" · default' : 'method="post"'}
        </motion.span>
      </div>

      <Field label="URL">
        <motion.span className="fs-url" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
          <code>AddToNewsletter</code>
          {kind === 'get' && (
            <>
              <code className="fs-sep">?</code>
              <span className="fs-tok">{step >= 2 && <Pair id="g-name" name="name" />}</span>
              <code className="fs-sep">&amp;</code>
              <span className="fs-tok">{step >= 2 && <Pair id="g-email" name="email" />}</span>
            </>
          )}
        </motion.span>
      </Field>

      {kind === 'get' && (
        <motion.div className="fs-hint" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? { ...t.fade, delay: 0.6 } : t.fade}>
          <code>?</code> skiller ressourcen fra query-strengen · <code>&amp;</code> skiller parrene
        </motion.div>
      )}

      <Field label="Body" empty={kind === 'get'}>
        {kind === 'get' ? (
          <motion.span className="fs-empty" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
            tom
          </motion.span>
        ) : (
          <span className="fs-body">
            <Arrive on={on}>
              <Pair id="p-name" name="name" />
            </Arrive>
            <Arrive on={on}>
              <Pair id="p-email" name="email" />
            </Arrive>
          </span>
        )}
      </Field>

      {kind === 'get' && (
        <motion.div className="fs-example" initial={false} animate={{ opacity: at(step, 3) ? 1 : 0 }} transition={t.settle}>
          <span className="fs-ex-label">samme mønster, en søgning:</span>
          <code>
            GET /appointments?{String.fromCharCode(173)}licensePlate=AL12345
          </code>
        </motion.div>
      )}
    </div>
  )
}

function Server({ step }: { step: number }) {
  return (
    <div className="fs-server vnode" data-tone={step === 3 || step === 4 ? 'focus' : 'idle'}>
      <div className="vnode-title mono">AddToNewsletter</div>
      <div className="vnode-sub">
        <code>action</code>: server-siden, der behandler data
      </div>
      <div className="fs-effects">
        <div className="fs-effect">
          <span className="fs-effect-verb">GET</span>
          <Tag show={at(step, 3)} tone="muted" wrap>
            ændrer intet · idempotent
          </Tag>
        </div>
        <div className="fs-effect">
          <span className="fs-effect-verb">POST</span>
          <Tag show={at(step, 4)} tone="focus" wrap>
            ændrer noget hver gang
          </Tag>
        </div>
      </div>
    </div>
  )
}

function FormSubmit({ step }: { step: number }) {
  return (
    <div className="fs">
      <div className="fs-col fs-col-form">
        <span className="vcaps">Formular</span>
        <Form step={step} />
      </div>
      <div className="fs-links">
        <Link on={at(step, 2)} tone={step === 2 ? 'focus' : 'idle'} />
        <Link on={at(step, 4)} tone={step === 4 ? 'focus' : 'idle'} />
      </div>
      <div className="fs-col fs-col-req">
        <span className="vcaps">Request</span>
        <Request kind="get" step={step} />
        <Request kind="post" step={step} />
      </div>
      <div className="fs-links">
        <Link on={at(step, 2)} tone={step === 2 || step === 3 ? 'focus' : 'idle'} />
        <Link on={at(step, 4)} tone={step === 4 ? 'focus' : 'idle'} />
      </div>
      <div className="fs-col fs-col-server">
        <span className="vcaps">Server</span>
        <Server step={step} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'html-form-submit',
  title: 'Fra formular til request',
  steps: [
    {
      caption: 'En formular med `action="AddToNewsletter"` og to felter, der hver har et `name`.',
      hold: 1600,
    },
    {
      caption:
        'Ved submit laver browseren ét `name=value`-par pr. felt med et `name`. Send-knappen har kun et `id`, så den kommer ikke med.',
      hold: 2600,
    },
    {
      caption: '`method="get"` er default: parrene sættes på URL’en efter `?` og adskilles af `&`. Body er tom.',
      hold: 2600,
    },
    {
      caption:
        'GET er til at hente. Den må ikke ændre noget på serveren og bør være **idempotent** — som søgningen `GET /appointments?licensePlate=AL12345`.',
      hold: 3000,
    },
    {
      caption:
        '`method="post"`: parrene ligger i request body, og URL’en er bare `action`. En POST ændrer noget på serveren hver gang.',
      hold: 2800,
    },
    {
      caption:
        'GET: data i URL’en, henter kun (en søgning). POST: data i body, ændrer noget (en bestilling). Kun felter med `name` sendes.',
      hold: 3000,
    },
  ],
  Component: FormSubmit,
}

export default viz
