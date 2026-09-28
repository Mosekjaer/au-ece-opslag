import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './di-host.css'

/* Dependency Injection and Generic Host builder pattern.pdf s. 3–4, 12–20 og bogens
   listing 8.15–8.17 (MauiStockTake): registreringerne i MauiProgram, containeren der
   resolver LoginPage → AuthService → AuthBrowser, og levetidsreglen fra s. 15–17.
   Anden anmodning (trin 5) er figurens illustration af s. 15; materialet viser ingen
   instans-id’er. */

const S = String.fromCharCode(0xad)
const Z = String.fromCharCode(0x200b) // må knække her (før .Add…)

type Line = { text: string; indent?: boolean; dim?: boolean; reg?: number; build?: boolean; builder?: boolean }

const CODE: Line[] = [
  { text: 'public static MauiApp CreateMauiApp()', dim: true },
  { text: '{', dim: true },
  { text: 'var builder = MauiApp.CreateBuilder();', indent: true, builder: true },
  { text: `builder.UseMauiApp<App>()${Z}.ConfigureFonts(…);`, indent: true, dim: true },
  { text: `builder.Services${Z}.AddSingleton<IBrowser, AuthBrowser>();`, indent: true, reg: 0 },
  { text: `builder.Services${Z}.AddSingleton<IAuthService, AuthService>();`, indent: true, reg: 1 },
  { text: `builder.Services${Z}.AddTransient<LoginPage>();`, indent: true, reg: 2 },
  { text: 'return builder.Build();', indent: true, build: true },
  { text: '}', dim: true },
]

const REGS = [
  { svc: 'IBrowser', impl: `Auth${S}Browser`, life: 'Singleton' },
  { svc: `IAuth${S}Service`, impl: `Auth${S}Service`, life: 'Singleton' },
  { svc: `Login${S}Page`, impl: `Login${S}Page`, life: 'Transient' },
]

const LIFE = [
  { kind: 'Pages', life: 'Transient', why: 'ny instans hver gang' },
  { kind: 'ViewModels', life: 'Transient', why: 'en ren instans hver gang' },
  { kind: 'Services', life: 'Singleton', why: 'én database- eller API-klient, app-wide state' },
]

// Rækkefølgen i trin 1: én linje ad gangen.
const regDelay = (i: number) => 0.15 + i * 0.55

function CodeCard({ step }: { step: number }) {
  return (
    <div className="dih-code">
      <div className="dih-file">MauiProgram.cs</div>
      <div className="dih-lines">
        {CODE.map((l, i) => {
          const hot = (l.builder && step === 0) || (l.reg !== undefined && step === 1) || (l.build && step === 2)
          return (
            <div key={i} className="dih-line" data-indent={l.indent || undefined} data-dim={l.dim || undefined}>
              <motion.span
                className="dih-hl"
                aria-hidden="true"
                initial={false}
                animate={{ opacity: hot ? 1 : 0 }}
                transition={hot && l.reg !== undefined ? { ...t.fade, delay: regDelay(l.reg) } : t.fade}
              />
              <code>{l.text}</code>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function Container({ step }: { step: number }) {
  const built = at(step, 2)
  return (
    <div className="dih-cont" data-built={built || undefined}>
      <div className="dih-cont-head">
        <span className="dih-cont-name">Container</span>
        <Tag show={built} tone={step === 2 ? 'focus' : 'idle'}>
          Build()
        </Tag>
      </div>
      <div className="dih-reg" role="table">
        <div className="dih-reg-row dih-reg-th" role="row">
          <span role="columnheader">service</span>
          <span role="columnheader">implementering</span>
          <span role="columnheader">levetid</span>
        </div>
        {REGS.map((r, i) => {
          const show = at(step, 1)
          return (
            <motion.div
              key={i}
              className="dih-reg-row"
              role="row"
              data-now={step === 1 || undefined}
              initial={false}
              animate={{ opacity: show ? 1 : 0, x: show ? 0 : -8 }}
              transition={show && step === 1 ? { ...t.place, delay: regDelay(i) + 0.15 } : show ? t.settle : t.fade}
            >
              <code role="cell">{r.svc}</code>
              <code role="cell">{r.impl}</code>
              <span role="cell" className="dih-life-cell">
                {r.life}
              </span>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

type CardState = 'hidden' | 'ghost' | 'made' | 'focus'

function Card({
  name,
  life,
  param,
  inject,
  state,
  delay = 0,
  badge,
  className,
}: {
  name: ReactNode
  life: string
  param?: ReactNode
  inject?: { show: boolean; label: ReactNode; delay: number; same?: boolean }
  state: CardState
  delay?: number
  badge?: ReactNode
  className?: string
}) {
  return (
    <motion.div
      className={`dih-card ${className ?? ''}`}
      data-state={state}
      style={{ transitionDelay: `${delay}s` }}
      initial={false}
      animate={{ opacity: state === 'hidden' ? 0 : 1, y: state === 'hidden' ? 6 : 0 }}
      transition={state === 'hidden' ? t.fade : t.place}
      aria-hidden={state === 'hidden' || undefined}
    >
      <div className="dih-card-head">
        <code className="dih-card-name">{name}</code>
        <span className="dih-card-life">{life}</span>
        {badge}
      </div>
      {param !== undefined && (
        <div className="dih-param">
          <code>{param}</code>
          {inject && (
            <motion.span
              className="dih-inj"
              data-same={inject.same || undefined}
              initial={false}
              animate={{ opacity: inject.show ? 1 : 0, scale: inject.show ? 1 : 0.7 }}
              transition={inject.show ? { ...t.place, delay: inject.delay } : t.fade}
            >
              {inject.label}
            </motion.span>
          )}
        </div>
      )}
    </motion.div>
  )
}

function Conn({ on, inject, injectTone }: { on: boolean; inject: boolean; injectTone: 'focus' | 'idle' }) {
  return (
    <div className="dih-conn">
      <Link on={on} vertical label="kræver" />
      <Link on={inject} vertical back tone={injectTone} label="injiceres" />
    </div>
  )
}

function Chain({ step }: { step: number }) {
  const shown = at(step, 3)
  const made = at(step, 4)
  const second = at(step, 5)
  const base: CardState = !shown ? 'hidden' : made ? 'made' : 'ghost'
  // Trin 4: nedefra og op. Trin 5: den nye LoginPage og den delte singleton.
  const d = (i: number) => (step === 4 ? i * 0.55 : 0)
  return (
    <div className="dih-chain">
      <span className="vcaps dih-chain-cap">Resolve af LoginPage</span>
      <Card
        className="dih-c1"
        name="LoginPage"
        life="Transient"
        param={<>(IAuth{S}Service auth{S}Service)</>}
        inject={{ show: made, label: '← AuthService', delay: 1.3 }}
        state={step === 4 ? 'focus' : base}
        delay={d(2)}
        badge={<Tag show={second} tone="idle">#1</Tag>}
      />
      <Card
        className="dih-c2"
        name="LoginPage"
        life="Transient"
        param={<>(IAuth{S}Service auth{S}Service)</>}
        inject={{ show: second, label: '← samme', delay: 0.5, same: true }}
        state={second ? (step === 5 ? 'focus' : 'made') : 'hidden'}
        badge={<Tag show={second} tone={step === 5 ? 'focus' : 'idle'}>#2 ny</Tag>}
      />
      <div className="dih-k1">
        <Conn on={shown} inject={made} injectTone={step === 4 ? 'focus' : 'idle'} />
      </div>
      <div className="dih-k2">
        <Conn on={second} inject={second} injectTone={step === 5 ? 'focus' : 'idle'} />
      </div>
      <Card
        className="dih-c3"
        name="AuthService"
        life="Singleton"
        param={<>(IBrowser browser)</>}
        inject={{ show: made, label: '← AuthBrowser', delay: 0.7 }}
        state={step === 5 ? 'focus' : base}
        delay={d(1)}
        badge={<Tag show={second} tone={step === 5 ? 'focus' : 'idle'}>én instans</Tag>}
      />
      <div className="dih-k3">
        <Conn on={shown} inject={made} injectTone={step === 4 ? 'focus' : 'idle'} />
      </div>
      <Card className="dih-c4" name={`Auth${S}Browser`} life="Singleton" state={base} delay={d(0)} badge={<span className="dih-none">ingen afhængigheder</span>} />
    </div>
  )
}

function LifeTable({ step }: { step: number }) {
  const show = at(step, 6)
  return (
    <motion.div
      className="dih-rules"
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={show ? t.settle : t.fade}
      aria-hidden={!show || undefined}
    >
      <span className="vcaps">Levetider i MAUI</span>
      <div className="dih-life">
        {LIFE.map((l, i) => (
          <motion.div
            key={l.kind}
            className="dih-life-row"
            initial={false}
            animate={{ opacity: show ? 1 : 0 }}
            transition={show ? stagger(i, 0.1, 0.12) : t.fade}
          >
            <span className="dih-life-kind">{l.kind}</span>
            <span className="dih-life-cell" data-life={l.life}>
              {l.life}
            </span>
            <span className="dih-life-why">{l.why}</span>
          </motion.div>
        ))}
      </div>
      <p className="vnote">
        <strong>Scoped</strong> giver ikke mening: der er ingen request at scope efter. Om Shell selv registrerer sider som singleton
        (s. 16, bogen) eller transient (s. 17), er materialet uenigt om.
      </p>
    </motion.div>
  )
}

function DiHost({ step }: { step: number }) {
  return (
    <div className="dih">
      <div className="dih-left">
        <CodeCard step={step} />
        <LifeTable step={step} />
      </div>
      <div className="dih-right">
        <Container step={step} />
        <Chain step={step} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'di-host',
  title: 'Fra MauiProgram til injicerede objekter',
  steps: [
    {
      caption: '`MauiProgram.CreateMauiApp` er appens indgang. `MauiApp.CreateBuilder()` giver en builder med en tom service collection.',
      hold: 1800,
    },
    { caption: 'Hver `Add…`-linje bliver til en registrering: interface → konkret type, med en levetid.', hold: 2800 },
    { caption: '`builder.Build()` afleverer registreringerne til DI-containeren.', hold: 1500 },
    {
      caption: 'Appen beder om en `LoginPage`. Containeren læser konstruktøren: den kræver en `IAuthService`, som igen kræver en `IBrowser`.',
      hold: 2600,
    },
    {
      caption: 'Containeren opretter nedefra: `AuthBrowser`, så `AuthService` med browseren, så `LoginPage` med servicen. Ingen af klasserne kalder selv `new`.',
      hold: 3000,
    },
    {
      caption: 'Anden anmodning: `LoginPage` er transient og oprettes på ny, men `AuthService` er singleton — samme instans genbruges.',
      hold: 2800,
    },
    {
      caption: 'Tommelfingerreglen i MAUI: services singleton, pages og ViewModels transient. Scoped giver ikke mening, for der er ingen request at scope efter.',
      hold: 3000,
    },
  ],
  Component: DiHost,
}

export default viz
