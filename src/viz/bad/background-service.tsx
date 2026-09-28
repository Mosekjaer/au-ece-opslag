import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './background-service.css'

/* ExchangeRatesHostedService (listing 34.5 i SW4BAD - BackgroundServices.pdf):
   én singleton-instans; hver iteration laver et nyt scope med scoped
   afhængigheder, som disposes; Task.Delay venter til stoppingToken udløses. */

type ScopeState = 'hidden' | 'active' | 'disposed'

function Scope({ n, state }: { n: number; state: ScopeState }) {
  const on = state !== 'hidden'
  return (
    <Node className="bgs-scope" tone={state === 'active' ? 'focus' : state === 'disposed' ? 'muted' : 'ghost'}>
      <div className="bgs-scope-head">
        <code>CreateScope()</code>
        <span className="bgs-iter">iteration {n}</span>
      </div>
      <motion.div
        className="bgs-scope-body"
        initial={false}
        animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
        transition={on ? t.settle : t.fade}
      >
        <div className="bgs-deps">
          <span className="bgs-dep">
            <code>ExchangeRatesClient</code>
            <span className="bgs-inst">nr. {n}</span>
          </span>
          <span className="bgs-dep">
            <code>AppDbContext</code>
            <span className="bgs-inst">nr. {n}</span>
          </span>
        </div>
        <div className="bgs-work">
          <code>client.GetLatestRatesAsync()</code>
          <span className="bgs-arrow">→</span>
          <code>context.Add(rates)</code>
          <span className="bgs-muted">gemmes med EF Core</span>
        </div>
        <div className="bgs-end">
          <Tag show={state === 'disposed'} tone="idle">
            disposed
          </Tag>
        </div>
      </motion.div>
    </Node>
  )
}

function Delay({ on, cut }: { on: boolean; cut?: boolean }) {
  return (
    <div className="bgs-delay" data-cut={cut || undefined}>
      <motion.span
        className="bgs-delay-line"
        initial={false}
        animate={{ '--p': on ? (cut ? 0.45 : 1) : 0 } as never}
        transition={on ? { ...t.travel, duration: 1.1 } : t.fade}
      />
      <motion.span className="bgs-delay-label" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
        <code>Task.Delay(5 min)</code>
        {cut ? <Tag tone="neg">afbrudt</Tag> : <span className="bgs-muted">venter</span>}
      </motion.span>
    </div>
  )
}

function BackgroundService({ step }: { step: number }) {
  const started = at(step, 1)
  const stopped = at(step, 6)
  const scope1: ScopeState = step === 3 ? 'active' : step >= 4 ? 'disposed' : 'hidden'
  const scope2: ScopeState = step === 5 ? 'active' : step >= 6 ? 'disposed' : 'hidden'

  return (
    <div className="bgs">
      <div className="vflow stack bgs-top">
        <Node className="bgs-program" tone={step === 1 ? 'focus' : 'idle'} title="Program.cs">
          <code className="bgs-reg">builder.Services.<wbr />AddHostedService<wbr />&lt;ExchangeRatesHostedService&gt;()</code>
        </Node>
        <Link on={started} tone={step === 1 ? 'focus' : 'idle'} label="ved opstart" />
        <Node
          className="bgs-single"
          tone={!started ? 'ghost' : step === 1 ? 'focus' : 'ok'}
          title={<code>ExchangeRatesHostedService</code>}
          sub="singleton · én instans hele appens levetid"
        >
          <div className="bgs-ctors">
            <motion.div className="bgs-ctor" data-tone="neg" initial={false} animate={{ opacity: at(step, 2) ? 1 : 0 }} transition={t.fade}>
              <code>(AppDbContext context)</code>
              <Tag tone="neg">scoped — kan ikke injiceres</Tag>
            </motion.div>
            <motion.div className="bgs-ctor" data-tone="ok" initial={false} animate={{ opacity: started ? 1 : 0 }} transition={t.fade}>
              <code>(IServiceProvider provider)</code>
              <span className="bgs-muted">laver scopes</span>
            </motion.div>
          </div>
        </Node>
      </div>

      <div className="bgs-loop">
        <div className="bgs-loop-head">
          <code>while (!<wbr />stoppingToken.<wbr />IsCancellationRequested)</code>
          <span className="bgs-token">
            <span className="bgs-muted">stoppingToken</span>
            <Tag tone={stopped ? 'neg' : 'idle'}>{stopped ? 'udløst' : 'aktiv'}</Tag>
          </span>
        </div>
        <div className="bgs-timeline">
          <Scope n={1} state={scope1} />
          <Delay on={at(step, 4)} />
          <Scope n={2} state={scope2} />
          <Delay on={stopped} cut />
        </div>
        <motion.div className="bgs-exit" initial={false} animate={{ opacity: stopped ? 1 : 0 }} transition={{ ...t.fade, delay: stopped ? 0.9 : 0 }}>
          løkken slutter · <code>ExecuteAsync</code> returnerer
        </motion.div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'background-service',
  title: 'ExecuteAsync som løkke med et nyt scope pr. iteration',
  steps: [
    { caption: 'Servicen registreres i `Program.cs` med `AddHostedService` — som enhver anden service.', hold: 1800 },
    {
      caption: 'Ved opstart oprettes **én** instans, der lever lige så længe som appen. En hosted service er derfor i praksis en **singleton**.',
      hold: 2600,
    },
    {
      caption:
        'Afhængigheder skal leve mindst lige så længe som servicen. En *scoped* `AppDbContext` kan derfor ikke injiceres direkte — i stedet injiceres `IServiceProvider`.',
      hold: 3000,
    },
    {
      caption:
        '`ExecuteAsync` kører løkken. Iteration 1: `CreateScope()` giver et nyt scope, hvorfra `ExchangeRatesClient` og `AppDbContext` hentes. Kurserne hentes og gemmes.',
      hold: 3000,
    },
    {
      caption: '`using`-blokken slutter, og scopet **disposes** med sine instanser. Så venter `Task.Delay(TimeSpan.FromMinutes(5), stoppingToken)`.',
      hold: 2600,
    },
    { caption: 'Iteration 2 laver et **nyt** scope med nye instanser. Singletonen er stadig den samme.', hold: 2400 },
    {
      caption: 'Appen lukker: `stoppingToken` udløses, `Task.Delay` afbrydes, og `while`-løkken slutter.',
      hold: 3000,
    },
  ],
  Component: BackgroundService,
}

export default viz
