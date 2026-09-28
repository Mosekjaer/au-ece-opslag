import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './profiling-counts.css'

/* Dynamic Analysis.pdf s. 13 (koden og stjernerne: main 1, 6, 5, 1; f 5, 15, 10, 5)
   og s. 12 (instrumentering, emulering, sampling). Mellemtallene er regnet ud fra
   koden: kald nr. n af f kører for-betingelsen n + 1 gange og sum += i n gange. */

const MAX = 15

type Line = { code: string; indent: number; key?: string; fn?: 'main' | 'f' }
const LINES: Line[] = [
  { code: 'int main()', indent: 0, fn: 'main' },
  { code: 'int i = 0;', indent: 1, key: 'm0' },
  { code: 'for (i = 0; i < 5; i++)', indent: 1, key: 'm1' },
  { code: 'f(i);', indent: 2, key: 'm2' },
  { code: 'return 0;', indent: 1, key: 'm3' },
  { code: 'int f(int n)', indent: 0, fn: 'f' },
  { code: 'int i;', indent: 1, key: 'f0' },
  { code: 'for (i = 0; i < n; i++)', indent: 1, key: 'f1' },
  { code: 'sum += i;', indent: 2, key: 'f2' },
  { code: 'return sum;', indent: 1, key: 'f3' },
]

/** Tællerne efter kald f(0) … f(k) (k = −1: intet kørt). main er ikke færdig før efter f(4). */
function counts(k: number, done: boolean): Record<string, number> {
  const c = k + 1 // antal kald af f
  return {
    m0: k >= 0 ? 1 : 0,
    m1: c + (done ? 1 : 0),
    m2: c,
    m3: done ? 1 : 0,
    f0: c,
    f1: (c * (c + 1)) / 2,
    f2: ((c - 1) * c) / 2,
    f3: c,
  }
}

/* Trin: 0 intet, 1 f(0), 2 f(1), 3 f(2)+f(3), 4 f(4) og main slutter, 5 slutramme. */
const LAST_CALL = [-1, 0, 1, 3, 4, 4]
const CALLS = [0, 1, 2, 3, 4]
const HOT = ['f1', 'f2']

const METHODS = [
  { name: 'Instrumentering', how: 'tællere pr. funktion eller linje', traits: 'intrusiv, hurtig, præcis' },
  { name: 'Emulering', how: 'programmet køres i en emulator', traits: 'ikke-intrusiv, langsom, præcis' },
  { name: 'Sampling', how: 'eksternt værktøj måler med faste intervaller', traits: 'ikke-intrusiv, hurtig, upræcis' },
]

function Profiling({ step }: { step: number }) {
  const k = LAST_CALL[step]
  const done = at(step, 4)
  const c = counts(k, done)
  const prev = step > 0 ? counts(LAST_CALL[step - 1], at(step - 1, 4)) : c
  const final = at(step, 5)

  return (
    <div className="pc">
      <div className="pc-code">
        <div className="pc-head">
          <span className="vcaps">Kode</span>
          <span className="vcaps pc-head-n">udført</span>
        </div>
        {LINES.map((l, i) => {
          if (!l.key) {
            return (
              <div key={i} className="pc-line is-fn">
                <code>{l.code}</code>
              </div>
            )
          }
          const n = c[l.key]
          const grew = n > prev[l.key] && !final
          const hot = final && HOT.includes(l.key)
          return (
            <div key={i} className="pc-line" data-grew={grew || undefined} data-hot={hot || undefined}>
              <code style={{ paddingLeft: `calc(${l.indent} * var(--pc-indent))` }}>{l.code}</code>
              <span className="pc-n">{n > 0 ? n : ''}</span>
              <span className="pc-bar" aria-hidden="true">
                <motion.span
                  className="pc-fill"
                  initial={false}
                  animate={{ clipPath: `inset(0 ${(100 - (n / MAX) * 100).toFixed(3)}% 0 0)` }}
                  transition={{ ...t.travel, delay: 0.05 * i }}
                />
              </span>
            </div>
          )
        })}
      </div>

      <div className="pc-side">
        <div className="pc-calls">
          <span className="vcaps">main kalder</span>
          <div className="pc-call-row">
            {CALLS.map((n) => {
              const ran = n <= k
              const now = ran && n > LAST_CALL[Math.max(0, step - 1)] && !final && step > 0
              return (
                <motion.span
                  key={n}
                  className="pc-call"
                  data-tone={now ? 'focus' : ran ? 'ok' : 'idle'}
                  initial={false}
                  animate={{ opacity: ran ? 1 : 0.4 }}
                  transition={t.fade}
                >
                  <code>f({n})</code>
                  <span className="pc-call-sub">
                    {n + 1}× betingelse · {n}× sum
                  </span>
                </motion.span>
              )
            })}
          </div>
        </div>

        <div className="pc-hot">
          <Tag show={final} wrap>
            flest udførsler: 15 og 10
          </Tag>
        </div>

        <motion.div
          className="pc-methods"
          initial={false}
          animate={{ opacity: final ? 1 : 0 }}
          transition={t.fade}
          aria-hidden={!final || undefined}
        >
          <span className="vcaps">Tre måder at måle</span>
          {METHODS.map((m, i) => (
            <motion.div
              key={m.name}
              className="pc-method"
              initial={false}
              animate={{ opacity: final ? 1 : 0, y: final ? 0 : 4 }}
              transition={final ? stagger(i, 0.15, 0.12) : t.fade}
            >
              <span className="pc-method-name">{m.name}</span>
              <span className="pc-method-traits">{m.traits}</span>
              <span className="pc-method-how">{m.how}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'profiling-counts',
  title: 'En profiler tæller udførsler pr. linje',
  steps: [
    {
      caption: 'Koden fra slidet. En profiler tæller, hvor mange gange hver linje udføres. Intet er kørt endnu.',
      hold: 1800,
    },
    {
      caption: '`main` kalder `f(0)`. For-betingelsen i `f` evalueres én gang og er straks falsk — `sum += i` kører ikke.',
      hold: 2800,
    },
    {
      caption: '`f(1)`: betingelsen evalueres to gange, løkkekroppen én. Tællerne i `f` står nu på 2, 3, 1, 2.',
      hold: 2600,
    },
    {
      caption: '`f(2)` og `f(3)`: `f(n)` evaluerer betingelsen *n* + 1 gange og kører kroppen *n* gange. For-linjen i `f` er nået op på 10.',
      hold: 2600,
    },
    {
      caption:
        '`f(4)` er sidste kald. Løkken i `main` evaluerer sin betingelse en sjette gang, er falsk, og `return 0;` kører.',
      hold: 2800,
    },
    {
      caption:
        'Slidets tal: `main` 1, 6, 5, 1 og `f` 5, 15, 10, 5. Flaskehalsen er løkken i `f`. Tællere pr. linje er **instrumentering** — præcist, men intrusivt.',
      hold: 3000,
    },
  ],
  Component: Profiling,
}

export default viz
