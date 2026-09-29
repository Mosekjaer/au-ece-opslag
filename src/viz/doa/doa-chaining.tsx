import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './doa-chaining.css'

/* Lecture04.pdf s. 26 og 28 (“Hash table with chaining”: kvadrattallene 0, 1, 4, 9, 16,
   25, 36, 49, 64, 81 med x mod 10 → 0: 0 · 1: 81 → 1 · 4: 64 → 4 · 5: 25 · 6: 36 → 16 ·
   9: 49 → 9; Weiss fig. 5.5 s. 196, der indsætter forrest), s. 29 (insert: push_back og
   if (++currentSize > theLists.size()) rehash();), s. 30 (λ = elementer / tabelstørrelse,
   figuren har λ = 1.0) og s. 34 (rehash: nextPrime(2 * theLists.size())).
   Indhold: src/content/doa/p3-hashing.ts (separate-chaining). */

const M = 10
const KEYS = [0, 1, 4, 9, 16, 25, 36, 49, 64, 81]
/** Hvor mange nøgler der er indsat efter hvert trin. */
const DONE_AT = [0, 4, 6, 7, 10, 10, 10]
const NOW_FROM = [0, 0, 4, 6, 7, 10, 10]

function buckets(n: number): number[][] {
  const b: number[][] = Array.from({ length: M }, () => [])
  // Bogens figur (slide 26) har den nyeste nøgle forrest i listen.
  KEYS.slice(0, n).forEach((k) => b[k % M].unshift(k))
  return b
}

function Chaining({ step }: { step: number }) {
  const done = DONE_AT[step]
  const from = NOW_FROM[step]
  const isNow = (k: number) => {
    const i = KEYS.indexOf(k)
    return i >= from && i < done
  }
  const b = buckets(done)
  const lambdaOn = step >= 5
  const rehashOn = step >= 6
  return (
    <div className="dch">
      <div className="dch-table" role="img" aria-label="hashtabel med ti lister">
        {b.map((list, i) => {
          const hit = list.some(isNow)
          return (
            <div key={i} className="dch-row">
              <span className="dch-idx">{i}</span>
              <span className="dch-cell" data-tone={hit ? 'focus' : 'idle'}>
                <i className="dch-dot" data-on={list.length > 0 || undefined} />
              </span>
              <span className="dch-chain">
                {list.map((k) => (
                  <motion.span
                    key={k}
                    layout="position"
                    className="dch-link"
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={t.settle}
                  >
                    <span className="dch-arrow" aria-hidden="true">
                      →
                    </span>
                    <span className="dch-node" data-tone={isNow(k) ? 'ok' : 'idle'}>
                      {k}
                    </span>
                  </motion.span>
                ))}
              </span>
            </div>
          )
        })}
      </div>

      <div className="dch-side">
        <span className="vcaps">Indsæt med hash(x) = x mod 10</span>
        <div className="dch-keys">
          {KEYS.map((k, i) => {
            const state = i < from ? 'past' : i < done ? 'now' : 'wait'
            return (
              <span key={k} className="dch-key" data-state={state}>
                <code>{k}</code>
                <motion.span
                  className="dch-mod"
                  initial={false}
                  animate={{ opacity: state === 'wait' ? 0 : 1 }}
                  transition={state === 'now' ? { ...t.settle, delay: 0.1 } : t.fade}
                >
                  → {k % M}
                </motion.span>
              </span>
            )
          })}
        </div>

        <div className="dch-lambda" data-on={lambdaOn || undefined}>
          <code>currentSize = {done}</code>
          <code>theLists.size() = {M}</code>
          <motion.span
            className="dch-lambda-v"
            initial={false}
            animate={{ opacity: lambdaOn ? 1 : 0 }}
            transition={lambdaOn ? t.place : t.fade}
          >
            λ = 10 / 10 = 1,0
          </motion.span>
        </div>

        <div className="dch-rule" data-on={rehashOn || undefined}>
          <code>if (++currentSize &gt; theLists.size()) rehash();</code>
          <motion.span
            className="dch-rule-v"
            initial={false}
            animate={{ opacity: rehashOn ? 1 : 0 }}
            transition={rehashOn ? t.settle : t.fade}
          >
            Næste indsættelse: 11 &gt; 10 → <code>nextPrime(2 · 10)</code> = 23 lister, og alle nøgler hashes igen.
          </motion.span>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-chaining',
  title: 'Ti kvadrattal i ti lister',
  steps: [
    {
      caption: 'Ti tomme lister, én pr. celle. Kvadrattallene 0 … 81 indsættes med `hash(x) = x mod 10`.',
      hold: 2200,
    },
    { caption: '0, 1, 4 og 9 lander i hver sin liste. Ingen kollisioner endnu.', hold: 2000 },
    { caption: '16 går i liste 6 og 25 i liste 5.', hold: 1600 },
    {
      caption:
        '36 mod 10 er også 6: en **kollision**. Den løses ved at lægge 36 i samme liste. Slidet lægger den nye nøgle forrest, så 16 rykker bagud.',
      hold: 2800,
    },
    {
      caption:
        '49, 64 og 81 kolliderer med 9, 4 og 1. Kursets kode bruger `push_back` og ville give `1 → 81`; slidets figur er bogens, der indsætter forrest.',
      hold: 3000,
    },
    { caption: '**Load factor** λ = elementer / tabelstørrelse = 10 / 10 = 1,0. Det er også den gennemsnitlige listelængde.', hold: 2600 },
    {
      caption:
        'Kursets `insert` rehasher, når `++currentSize > theLists.size()`. Den næste indsættelse giver 11 > 10, så tabellen vokser til `nextPrime(20)` = 23 lister.',
      hold: 3000,
    },
  ],
  Component: Chaining,
}

export default viz
