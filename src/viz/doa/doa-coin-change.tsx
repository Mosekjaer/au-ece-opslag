import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import type { Tone } from '../kit/primitives'
import { ArrayRow } from '../kit/algo'
import { stagger, t } from '../kit/motion'
import './doa-coin-change.css'

/* Lecture12.pdf s. 6 (greedy: tag den største værdi; $17.61 med (10, 5, 1, 0.25,
   0.1, 0.01); $11 med sedlerne (1, 5, 6, 9) giver suboptimale løsninger) og s. 8
   (refleksion: verificér det). Weiss s. 449–450 (udbetalingen af $17.61: 10, 5, 1, 1,
   0.25, 0.25, 0.1, 0.01 = 8 stk; greedy er optimal for dollar). Lecture13.pdf s. 13
   (refleksion: memoization/DP af coin changing). dp[0..11] for (1, 5, 6, 9) står ikke
   på slides — egen udregning, mærket i figuren. Indhold: src/content/doa/p7-design.ts. */

const DOLLAR = ['10', '5', '1', '1', '0.25', '0.25', '0.1', '0.01']

// Sedlerne sorteret faldende, som greedy gennemgår dem.
const BILLS = [9, 6, 5, 1]

// Greedy på $11: [valgt seddel, rest efter valget]
const GREEDY: { bill: number; rest: number }[] = [
  { bill: 9, rest: 2 },
  { bill: 1, rest: 1 },
  { bill: 1, rest: 0 },
]
const G_AT = 2 // trinnet hvor første greedy-valg vises

const OPT = [5, 6]
const OPT_AT = 5
const DP_AT = 6

// Egen udregning: mindste antal sedler for beløb 0..11 med (1, 5, 6, 9).
const DP = [0, 1, 2, 3, 4, 1, 1, 2, 3, 1, 2, 2]

function Chip({ show, tone, children, i = 0 }: { show: boolean; tone: Tone; children: string | number; i?: number }) {
  return (
    <motion.span
      className="dcc-chip"
      data-tone={show ? tone : 'ghost'}
      initial={false}
      animate={show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0.55, y: 0, scale: 1 }}
      transition={show ? stagger(i, 0, 0.08) : t.fade}
    >
      <span style={{ opacity: show ? 1 : 0 }}>{children}</span>
    </motion.span>
  )
}

function Reveal({ on, className, children }: { on: boolean; className?: string; children: ReactNode }) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : 3 }}
      transition={on ? t.settle : t.fade}
    >
      {children}
    </motion.div>
  )
}

function CoinChange({ step }: { step: number }) {
  // Hvor langt greedy er nået på $11 (0 = ikke startet, 3 = færdig).
  const g = Math.max(0, Math.min(GREEDY.length, step - G_AT + 1))
  const cur = g > 0 ? GREEDY[g - 1] : null
  const restBefore = g > 0 ? (g === 1 ? 11 : GREEDY[g - 2].rest) : 11
  const ptr = cur ? BILLS.indexOf(cur.bill) : -1
  const greedyDone = step >= G_AT + GREEDY.length - 1
  const lost = step >= OPT_AT

  const billTone = (i: number): Tone | undefined => {
    if (!cur) return undefined
    if (i === ptr) return greedyDone && lost ? 'neg' : 'focus'
    // Sedler større end resten før valget passer ikke.
    if (BILLS[i] > restBefore) return 'muted'
    return undefined
  }

  return (
    <div className="dcc">
      {/* Dollar: greedy er optimal */}
      <section className="dcc-case">
        <div className="dcc-head">
          <span className="vcaps">Dollar (L12 s. 6; Weiss s. 450)</span>
          <span className="dcc-q">
            <strong>$17.61</strong> med <code>(10, 5, 1, 0.25, 0.1, 0.01)</code>
          </span>
        </div>
        <div className="dcc-chips">
          {DOLLAR.map((d, i) => (
            <Chip key={i} i={i} show={step >= 1} tone="ok">
              {d}
            </Chip>
          ))}
        </div>
        <Reveal on={step >= 1} className="dcc-verdict">
          8 stk — greedy er <strong className="is-ok">optimal</strong> i dollarsystemet
        </Reveal>
      </section>

      {/* $11 med (1, 5, 6, 9) */}
      <section className="dcc-case">
        <div className="dcc-head">
          <span className="vcaps">Sedlerne (1, 5, 6, 9) (L12 s. 6 og 8)</span>
          <span className="dcc-q">
            <strong>$11</strong>
          </span>
        </div>
        <div className="dcc-lanes">
          <div className="dcc-lane" data-tone={lost ? 'neg' : 'idle'}>
            <span className="dcc-lane-name">Greedy: største seddel ≤ rest</span>
            <ArrayRow
              id="dcc-bills"
              values={BILLS}
              index={false}
              tones={billTone}
              pointers={[{ id: 'take', at: ptr, label: 'tag', tone: lost ? 'neg' : 'focus' }]}
            />
            <div className="dcc-rest">
              <span className="dcc-rest-k">rest</span>
              <span className="mono">11</span>
              {GREEDY.map((s, i) => (
                <motion.span
                  key={i}
                  className="mono"
                  initial={false}
                  animate={{ opacity: g > i ? 1 : 0 }}
                  transition={g > i ? t.settle : t.fade}
                >
                  → {s.rest}
                </motion.span>
              ))}
            </div>
            <div className="dcc-chips">
              {GREEDY.map((s, i) => (
                <Chip key={i} show={g > i} tone={lost ? 'neg' : 'focus'}>
                  {s.bill}
                </Chip>
              ))}
            </div>
            <Reveal on={greedyDone} className="dcc-verdict">
              9 + 1 + 1 = <strong className={lost ? 'is-neg' : undefined}>3 sedler</strong>
            </Reveal>
          </div>

          <div className="dcc-lane" data-tone={lost ? 'ok' : 'idle'}>
            <span className="dcc-lane-name">Optimalt</span>
            <div className="dcc-chips">
              {OPT.map((b, i) => (
                <Chip key={i} i={i} show={lost} tone="ok">
                  {b}
                </Chip>
              ))}
            </div>
            <Reveal on={lost} className="dcc-verdict">
              5 + 6 = <strong className="is-ok">2 sedler</strong>
            </Reveal>
            <Reveal on={lost} className="dcc-why">
              Det første valg, 9, efterlader 2 — og 2 kræver to 1’ere.
            </Reveal>
          </div>
        </div>
      </section>

      {/* Bro til DP */}
      <section className="dcc-case">
        <div className="dcc-head">
          <span className="vcaps">Bro til DP (L13 s. 13)</span>
          <span className="dcc-own">egen udregning ud fra slidets sedler</span>
        </div>
        <div className="dcc-dp" data-on={step >= DP_AT || undefined}>
          {DP.map((v, a) => {
            const on = step >= DP_AT
            const tone = !on ? 'ghost' : a === 11 ? 'ok' : a === 5 || a === 6 ? 'focus' : a === 2 ? 'neg' : 'idle'
            return (
              <div key={a} className="dcc-dp-col">
                <motion.span
                  className="dcc-dp-cell"
                  data-tone={tone}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0.5 }}
                  transition={on ? stagger(a, 0, 0.05) : t.fade}
                >
                  <span style={{ opacity: on ? 1 : 0 }}>{v}</span>
                </motion.span>
                <span className="dcc-dp-idx">{a}</span>
              </div>
            )
          })}
        </div>
        <Reveal on={step >= DP_AT} className="dcc-dp-note">
          <span>
            <code>dp[a]</code> = færrest sedler til beløbet <code>a</code>. <code>dp[11]</code> = 1 + det mindste af{' '}
            <code>dp[11 − c]</code>:
          </span>
          <span className="dcc-dp-terms">
            {BILLS.map((c) => (
              <span key={c} className="dcc-dp-term mono" data-tone={c === 9 ? 'neg' : c === 6 || c === 5 ? 'ok' : undefined}>
                c = {c} → dp[{11 - c}] = {DP[11 - c]}
              </span>
            ))}
          </span>
          <span>
            <code>dp[11]</code> = 1 + 1 = <strong>2</strong>. Greedys 9 fører til <code>dp[2] = 2</code> og dermed 3.
          </span>
        </Reveal>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-coin-change',
  title: 'Greedy coin changing med dollar og med (1, 5, 6, 9)',
  steps: [
    {
      caption:
        'Greedy bryder et beløb ned ved gentagne gange at tage den **største** værdi, der passer. Slidets første eksempel er $17.61.',
      hold: 2200,
    },
    {
      caption: 'Udbetalingen bliver 10, 5, 1, 1, 0.25, 0.25, 0.1, 0.01 — 8 stk. For dollar er greedy optimal.',
      hold: 2400,
    },
    { caption: '$11 med sedlerne (1, 5, 6, 9): greedy tager 9, fordi den er størst. Rest 2.', hold: 2000 },
    { caption: '6 og 5 er større end resten 2 og passer ikke. Greedy tager 1. Rest 1.', hold: 2200 },
    { caption: 'Greedy tager 1 igen. Rest 0: **9 + 1 + 1 = 3 sedler**.', hold: 1800 },
    {
      caption:
        'Men **5 + 6 = 2 sedler**. Det lokalt bedste valg, 9, lukkede for det globale optimum — greedy er ikke en generel løsning.',
      hold: 3000,
    },
    {
      caption:
        'DP gemmer det bedste svar for hvert delbeløb (egen udregning). `dp[11]` prøver alle sedler og vælger 6 eller 5 med rest 5 eller 6.',
      hold: 3000,
    },
  ],
  Component: CoinChange,
}

export default viz
