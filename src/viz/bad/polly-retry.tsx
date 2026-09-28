import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './polly-retry.css'

/* Typed client med Polly fra Calling Remote APIs.pdf:
   AddTransientHttpErrorPolicy + WaitAndRetryAsync([200 ms, 500 ms, 1 s]).
   Tidsaksen er i skala for ventetiderne. Til sidst exponential backoff (2ⁿ s). */

const TRANSIENT = ['HttpRequestException', '5xx', '408'] as const

const ATTEMPTS = [
  { status: '503', tone: 'neg', hit: '5xx' },
  { status: '408', tone: 'neg', hit: '408' },
  { status: '200 OK', tone: 'ok', hit: '' },
] as const

const DELAYS = [
  { ms: 200, label: '200 ms' },
  { ms: 500, label: '500 ms' },
  { ms: 1000, label: '1 s' },
]

const BACKOFF = [1, 2, 3, 4, 5].map((n) => ({ n, s: 2 ** n }))

function Attempt({ i, step }: { i: number; step: number }) {
  const a = ATTEMPTS[i]
  const on = at(step, i + 1)
  // Forsøget lander først, når ventetiden foran det er tegnet færdig.
  const delay = step === i + 1 && i > 0 ? 0.3 + DELAYS[i - 1].ms / 1000 : 0
  const appear = {
    initial: false as const,
    animate: on ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 },
    transition: on ? { ...t.place, delay } : t.fade,
  }
  return (
    <div className="ply-try">
      <motion.span className="ply-top" {...appear}>
        <Tag tone={a.tone === 'ok' ? 'focus' : 'neg'}>{a.status}</Tag>
      </motion.span>
      <span className="ply-dot" data-tone={on ? a.tone : 'ghost'} style={{ transitionDelay: `${delay}s` }}>
        {i + 1}
      </span>
      <span className="ply-bottom" />
    </div>
  )
}

function Wait({ i, step }: { i: number; step: number }) {
  const d = DELAYS[i]
  const used = i < 2 && at(step, i + 2)
  const unused = i === 2 && at(step, 3)
  return (
    <div className="ply-wait" style={{ flexGrow: d.ms }} data-unused={unused || undefined}>
      <span className="ply-top" />
      <span className="ply-track">
        <motion.span
          className="ply-fill"
          initial={false}
          animate={{ scaleX: used ? 1 : 0 }}
          transition={used ? { ...t.travel, duration: 0.3 + d.ms / 1000 } : t.fade}
        />
      </span>
      <span className="ply-bottom">
        <motion.span initial={false} animate={{ opacity: used || unused ? 1 : 0 }} transition={t.fade}>
          {d.label}
          {unused && ' · ubrugt'}
        </motion.span>
      </span>
    </div>
  )
}

function PollyRetry({ step }: { step: number }) {
  const cur = step >= 1 && step <= 3 ? ATTEMPTS[step - 1] : step > 3 ? ATTEMPTS[2] : null
  const linkTone: Tone = !cur ? 'idle' : cur.tone === 'neg' ? 'neg' : 'focus'
  const backoff = at(step, 4)

  return (
    <div className="ply">
      <div className="vflow stack ply-flow">
        <Node title={<code>GitHubService</code>} sub="typed client" tone={step >= 1 && step <= 3 ? 'focus' : 'idle'} />
        <Link on={step >= 1} tone={linkTone} label={cur ? `forsøg ${ATTEMPTS.indexOf(cur) + 1}` : undefined} />
        <Node title={<code>api.github.com</code>} sub="eksternt API" tone={cur?.tone === 'neg' && step <= 3 ? 'neg' : 'idle'}>
          <div className="ply-answer">
            <span className="ply-answer-label">svarer</span>
            <Tag show={!!cur} tone={cur?.tone === 'neg' ? 'neg' : 'focus'}>
              {cur?.status ?? '—'}
            </Tag>
          </div>
        </Node>
      </div>

      <div className="ply-policy">
        <div className="ply-rule">
          <code className="ply-code">AddTransientHttpErrorPolicy</code>
          <span className="ply-muted">håndterer</span>
          {TRANSIENT.map((x) => (
            <Tag key={x} tone={step <= 3 && cur?.hit === x ? 'neg' : 'idle'}>
              {x}
            </Tag>
          ))}
        </div>
        <div className="ply-rule">
          <code className="ply-code">WaitAndRetryAsync</code>
          <span className="ply-muted">venter</span>
          {DELAYS.map((d, i) => (
            <Tag key={d.ms} tone={i < 2 && at(step, i + 2) ? 'focus' : 'idle'}>
              {d.label}
            </Tag>
          ))}
        </div>
      </div>

      <div className="ply-axis-wrap">
        <span className="vcaps">Tidslinje for ét kald · ventetider i skala</span>
        <div className="ply-axis">
          <Attempt i={0} step={step} />
          <Wait i={0} step={step} />
          <Attempt i={1} step={step} />
          <Wait i={1} step={step} />
          <Attempt i={2} step={step} />
          <Wait i={2} step={step} />
        </div>
      </div>

      <div className="ply-backoff" data-on={backoff}>
        <div className="ply-formula">
          <span className="vcaps">Exponential backoff · WaitAndRetry(5, …)</span>
          <code>TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))</code>
        </div>
        <div className="ply-bars">
          <span className="ply-bars-head">retryAttempt</span>
          <span />
          <span className="ply-bars-head is-right">venter</span>
          {BACKOFF.map((b, i) => (
            <Bar key={b.n} n={b.n} s={b.s} on={backoff} i={i} />
          ))}
        </div>
      </div>
    </div>
  )
}

function Bar({ n, s, on, i }: { n: number; s: number; on: boolean; i: number }) {
  return (
    <>
      <span className="ply-bar-n">{n}</span>
      <span className="ply-bar-track">
        <motion.span
          className="ply-bar"
          style={{ width: `${(s / 32) * 100}%` }}
          initial={false}
          animate={{ scaleX: on ? 1 : 0 }}
          transition={on ? stagger(i, 0.2, 0.18) : t.fade}
        />
      </span>
      <motion.span className="ply-bar-s" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? stagger(i, 0.35, 0.18) : t.fade}>
        {s} s
      </motion.span>
    </>
  )
}

const viz: VizDef = {
  id: 'polly-retry',
  title: 'Transiente fejl og retry med backoff',
  steps: [
    {
      caption: 'En typed client med en Polly-politik: `AddTransientHttpErrorPolicy` med `WaitAndRetryAsync` og tre ventetider.',
      hold: 2000,
    },
    {
      caption: 'Forsøg 1 får `503`. Det er en 5xx — en **transient** fejl — så Polly giver ikke op, men prøver igen.',
      hold: 2400,
    },
    {
      caption: 'Efter 200 ms: forsøg 2 får `408 Request Timeout`. Også transient. Næste ventetid er længere.',
      hold: 2400,
    },
    {
      caption: 'Efter 500 ms: forsøg 3 lykkes med `200 OK`. Den kaldende kode ser kun succesen; den sidste ventetid bruges ikke.',
      hold: 2800,
    },
    {
      caption:
        'En politik kan også **beregne** ventetiden. Med exponential backoff og fem forsøg bliver den 2, 4, 8, 16 og 32 sekunder, så en service, der allerede har det svært, ikke bliver hamret yderligere.',
      hold: 3000,
    },
  ],
  Component: PollyRetry,
}

export default viz
