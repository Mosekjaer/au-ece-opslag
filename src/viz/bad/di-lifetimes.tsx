import { AnimatePresence, motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './di-lifetimes.css'

/* EF Core CRUD.pdf (service lifetimes) + Background services.pdf (afhængigheder
   skal leve mindst lige så længe som servicen). To anmodninger; i hver beder en
   controller og et repository om samme service. */

type Life = 'transient' | 'scoped' | 'singleton'

const LIVES: { id: Life; name: string; reg: string; rule: string; from: number }[] = [
  { id: 'transient', name: 'Transient', reg: 'AddTransient', rule: 'ny instans hver gang', from: 1 },
  { id: 'scoped', name: 'Scoped', reg: 'AddScoped', rule: 'én pr. anmodning — fx DbContext', from: 2 },
  { id: 'singleton', name: 'Singleton', reg: 'AddSingleton', rule: 'én for hele appen', from: 3 },
]

const CONSUMERS = [
  { full: 'Controller', short: 'Ctrl.' },
  { full: 'Repository', short: 'Repo.' },
]

// Instansnummer pr. levetid, anmodning (0/1) og forbruger (0/1).
const INSTANCE: Record<Life, number[][]> = {
  transient: [
    [1, 2],
    [3, 4],
  ],
  scoped: [
    [1, 1],
    [2, 2],
  ],
  singleton: [
    [1, 1],
    [1, 1],
  ],
}

// Hvornår bliver hver celle udfyldt? Anmodning 1 række for række, anmodning 2 samlet.
const shownAt = (life: Life, req: number) => (req === 1 ? 4 : LIVES.find((l) => l.id === life)!.from)

function Chip({ life, req, who, step }: { life: Life; req: number; who: number; step: number }) {
  const n = INSTANCE[life][req][who]
  const reused = who === 1 ? INSTANCE[life][req][0] === n : req === 1 && INSTANCE[life][0][0] === n
  const show = at(step, shownAt(life, req))
  const fresh = step === shownAt(life, req)
  const captive = step === 6 && life === 'scoped' && n === 1
  const delay = (req === 1 ? LIVES.findIndex((l) => l.id === life) * 0.25 : 0) + who * 0.35
  return (
    <div className="dil-slot">
      <AnimatePresence initial={false}>
        {show && (
          <motion.div
            key="chip"
            className="dil-inst"
            initial={{ opacity: 0, scale: 0.6, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, transition: t.fade }}
            transition={{ ...t.place, delay }}
          >
            <span className="dil-chip" data-tone={captive ? 'neg' : fresh && !reused ? 'focus' : reused ? 'reused' : 'idle'}>
              #{n}
            </span>
            <span className="dil-same" data-on={reused || undefined}>
              samme
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Lifetimes({ step }: { step: number }) {
  return (
    <div className="dil">
      <div className="dil-grid">
        <div className="dil-head">
          <span className="dil-corner" />
          {[0, 1].map((req) => (
            <div key={req} className="dil-req" data-on={(req === 0 ? step >= 1 && step <= 3 : step === 4) || undefined}>
              <span className="dil-req-name">Anmodning {req + 1}</span>
              <div className="dil-who">
                {CONSUMERS.map((c) => (
                  <span key={c.full}>
                    <span className="dil-full">{c.full}</span>
                    <span className="dil-short">{c.short}</span>
                  </span>
                ))}
              </div>
            </div>
          ))}
          <span className="dil-rule-head" />
        </div>

        {LIVES.map((l) => (
          <div key={l.id} className="dil-row" data-now={step === l.from || undefined} data-neg={(step === 6 && l.id === 'singleton') || undefined}>
            <div className="dil-life">
              <span className="dil-name">{l.name}</span>
              <code>{l.reg}</code>
            </div>
            {[0, 1].map((req) => (
              <div key={req} className="dil-cell">
                {[0, 1].map((who) => (
                  <Chip key={who} life={l.id} req={req} who={who} step={step} />
                ))}
              </div>
            ))}
            <motion.div className="dil-rule" initial={false} animate={{ opacity: at(step, 5) ? 1 : 0, x: at(step, 5) ? 0 : -4 }} transition={at(step, 5) ? t.settle : t.fade}>
              {l.rule}
            </motion.div>
          </div>
        ))}
      </div>

      <motion.div className="dil-captive" initial={false} animate={{ opacity: at(step, 6) ? 1 : 0 }} transition={at(step, 6) ? t.settle : t.fade}>
        <Tag tone="neg">Singleton → Scoped ✗</Tag>
        <span className="vnote">
          Singleton #1 lever hele appens levetid. Holdt den en scoped service, ville anmodning 2 stadig få Scoped #1 fra anmodning 1.
        </span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'di-lifetimes',
  title: 'Tre levetider over to anmodninger',
  steps: [
    {
      caption: 'Samme service registreret tre gange: `AddTransient`, `AddScoped` og `AddSingleton`. I hver anmodning beder en controller og et repository om den.',
      hold: 2400,
    },
    { caption: 'Anmodning 1. **Transient** giver en ny instans ved hver efterspørgsel: controlleren får #1, repositoryet #2.', hold: 2400 },
    { caption: '**Scoped**: første efterspørgsel i anmodningen opretter #1, og repositoryet får **samme** instans.', hold: 2400 },
    { caption: '**Singleton** oprettes ved første efterspørgsel og deles derefter af alle.', hold: 2000 },
    {
      caption: 'Anmodning 2. Transient laver #3 og #4. Scoped laver en **ny** #2, som deles inden for anmodningen. Singleton er stadig #1.',
      hold: 3000,
    },
    { caption: 'Reglerne. `AddDbContext` registrerer `DbContext` som **Scoped**: én pr. HTTP-anmodning, isoleret mellem brugere.', hold: 2800 },
    {
      caption: 'En afhængighed skal leve **mindst lige så længe** som den service, der har den. En singleton må derfor ikke holde en scoped service som `DbContext`.',
      hold: 3000,
    },
  ],
  Component: Lifetimes,
}

export default viz
