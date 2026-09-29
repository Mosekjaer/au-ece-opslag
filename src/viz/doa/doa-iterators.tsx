import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap } from '../kit/primitives'
import { ArrayRow, type ArrayPointer } from '../kit/algo'
import { t } from '../kit/motion'
import './doa-iterators.css'

/* Pointers iterators and searching.pdf (L01) s. 39 (`*it`, numbers = {10, 20, 30, 40},
   begin() → 10), s. 41 (std::list, --it fra end() → 40, så 30; end() “past the last
   element”), s. 42 (while (it != numbers.end()) skriver 10 20 30 40), s. 43 (random
   access: it += 2 → 30, it[-2] → 10) og s. 11 (pointeraritmetik *(ptr+2) = a[2]).
   Weiss figur 3.8 s. 90: begin() = &objects[0], end() = &objects[size()].
   Indhold: src/content/doa/p1-grundlag.ts (pointere-iteratorer). */

const VALUES = ['10', '20', '30', '40', '']

// Hvor `it` står pr. trin (-1 = ikke oprettet endnu). Indeks 4 = end().
const IT_AT = [-1, 0, 1, 3, 4, 3, 2, 2, 2]

const CODE: ReactNode[] = [
  <>std::vector&lt;int&gt; numbers = {'{10, 20, 30, 40}'};</>,
  <>std::vector&lt;int&gt;::iterator it = numbers.begin(); <span className="dit-cm">// *it → 10</span></>,
  <>++it; <span className="dit-cm">// *it → 20</span></>,
  <>while (it != numbers.end()) {'{ … ++it; }'}</>,
  <>++it; <span className="dit-cm">// it == numbers.end() → stop</span></>,
  <>std::list: it = numbers.end(); --it; <span className="dit-cm">// 40</span></>,
  <>--it; <span className="dit-cm">// *it → 30</span></>,
  <>it = numbers.begin(); it += 2; <span className="dit-cm">// 30, it[-2] → 10</span></>,
  <>typedef Object * iterator; <span className="dit-cm">// Weiss’ Vector</span></>,
]

interface Out {
  at: number
  what: ReactNode
  res: ReactNode
  src: string
}

const OUT: Out[] = [
  { at: 1, what: <code>*numbers.begin()</code>, res: '10', src: 's. 39' },
  { at: 4, what: <code>while (it != end())</code>, res: '10 20 30 40', src: 's. 42' },
  { at: 6, what: <><code>std::list</code>: <code>--it</code> fra <code>end()</code></>, res: '40, 30', src: 's. 41' },
  { at: 7, what: <><code>it += 2</code> · <code>it[-2]</code></>, res: '30 · 10', src: 's. 43' },
  {
    at: 8,
    what: (
      <>
        <code>begin()</code> = <code>&amp;objects[0]</code>, <code>end()</code> = <code>&amp;objects[size()]</code>
      </>
    ),
    res: 'pointer',
    src: 'Weiss s. 90',
  },
]

function Iterators({ step }: { step: number }) {
  const it = IT_AT[step]
  const atEnd = it === 4
  const list = step === 5 || step === 6
  const pointers: ArrayPointer[] = [
    { id: 'it', at: it, label: 'it', tone: atEnd ? 'neg' : 'focus' },
    { id: 'm2', at: step >= 7 ? 0 : -1, label: 'it[-2]', tone: 'idle' },
    { id: 'b', at: 0, label: 'begin()', tone: 'idle', side: 'bottom' },
    { id: 'e', at: 4, label: 'end()', tone: 'idle', side: 'bottom' },
  ]
  const tone = (i: number) => {
    if (i === 4) return 'ghost' as const
    if (step === 3 || step === 4) return i <= Math.min(it, 3) ? ('ok' as const) : undefined
    if (i === it) return 'focus' as const
    if (step >= 7 && i === 0) return 'ok' as const
    return undefined
  }
  return (
    <div className="dit">
      <div className="dit-main">
        <Swap show={step} className="dit-code" items={CODE.map((c, i) => <code key={i}>{c}</code>)} />
        <ArrayRow
          id="dit"
          label={
            <Swap
              show={list ? 1 : 0}
              items={[
                <>
                  <code>std::vector&lt;int&gt; numbers</code>
                </>,
                <>
                  <code>std::list&lt;int&gt; numbers</code> — samme værdier
                </>,
              ]}
            />
          }
          values={VALUES}
          tones={tone}
          pointers={pointers}
        />
        <p className="dit-note">
          <code>end()</code> peger <strong>efter</strong> sidste element: fra og med <code>begin()</code> til, men ikke
          med, <code>end()</code>.
        </p>
      </div>

      <div className="dit-side">
        <span className="vcaps">Resultater</span>
        <ol className="dit-out">
          {OUT.map((o) => {
            const on = step >= o.at
            return (
              <motion.li
                key={o.src}
                className="dit-row"
                data-now={step === o.at || undefined}
                initial={false}
                animate={{ opacity: on ? 1 : 0.28 }}
                transition={on ? t.settle : t.fade}
              >
                <span className="dit-what">{o.what}</span>
                <span className="dit-res">
                  <span className="mono">{on ? o.res : '…'}</span>
                  <span className="dit-src">{o.src}</span>
                </span>
              </motion.li>
            )
          })}
        </ol>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-iterators',
  title: 'En iterator går fra begin() til end()',
  steps: [
    {
      caption:
        '`numbers` har fire elementer på indeks 0–3. `begin()` peger på det første; `end()` peger på pladsen **efter** det sidste.',
      hold: 2400,
    },
    { caption: '`it = numbers.begin()` står på indeks 0. Dereference `*it` giver elementet: **10**.', hold: 2000 },
    { caption: '`++it` flytter iteratoren én position frem. Nu giver `*it` 20.', hold: 1600 },
    {
      caption: 'Løkken `while (it != numbers.end())` skriver hvert element og kalder `++it` — 10, 20, 30, 40.',
      hold: 2200,
    },
    {
      caption: 'Efter 40 står `it` på `end()`. Testen `it != end()` er falsk, og løkken stopper uden at læse `*end()`.',
      hold: 2600,
    },
    {
      caption: 'I en `std::list` går `--it` baglæns. Første `--it` fra `end()` giver det sidste element, **40** — kun for *bidirectional* og *random access*.',
      hold: 2600,
    },
    { caption: 'Næste `--it` giver 30.', hold: 1400 },
    {
      caption: 'En *random access* iterator (`vector`, `deque`) kan springe: `it += 2` fra `begin()` giver 30, og `it[-2]` giver 10.',
      hold: 2600,
    },
    {
      caption:
        'I Weiss’ `Vector` er iteratoren en pointer: `begin()` er `&objects[0]`, `end()` er `&objects[size()]`. `it + 2` er pointeraritmetik som `*(ptr+2)` = `a[2]`.',
      hold: 3000,
    },
  ],
  Component: Iterators,
}

export default viz
