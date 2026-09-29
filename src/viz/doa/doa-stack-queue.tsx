import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, type Tone } from '../kit/primitives'
import { ArrayRow } from '../kit/algo'
import { stagger, t } from '../kit/motion'
import './doa-stack-queue.css'

/* Lecture03.pdf s. 60 (stak: LIFO, kun toppen er tilgængelig), s. 63 (stack_class.h:
   push = list->push_front, pop = list->pop_front, top = list->find_kth(0)), s. 64
   (test_stack_class.cpp: push 10, 5, 3, 7; top() → 7; pop giver 7, 3, 5, 10),
   s. 66 (kø: FIFO), s. 68 (queue_class_array.h: head = N, tail = size = 0;
   put: data[tail] = x, tail = (tail + 1) % N; get: head = head % N, x = data[head++])
   og s. 69 (Menti: Queue<int>(4), put 10 5 3 7, to get → “10,5”, put 2, put 4,
   tøm → “3 7 2 4”). Indhold: src/content/doa/p2-lineaere.ts (stakke-koeer). */

// ------------------------------------------------------------------ stakken
const PUSHED = ['10', '5', '3', '7'] // push-rækkefølge; 7 ender øverst
const POPPED = ['7', '3', '5', '10']

function Stack({ step }: { step: number }) {
  const full = step === 1
  const done = step >= 2
  return (
    <div className="dsq-panel dsq-stack-panel">
      <span className="vcaps">Stak (LIFO)</span>
      <div className="dsq-stack-wrap">
        <div className="dsq-stack" aria-label="stakken">
          {/* Øverste plads først; plads 3 er bunden. */}
          {[3, 2, 1, 0].map((i) => {
            const on = full
            const pushDelay = i * 0.12
            const popDelay = (3 - i) * 0.12
            return (
              <div key={i} className="dsq-slot">
                <motion.span
                  className="dsq-item"
                  data-tone={i === 3 ? 'focus' : 'idle'}
                  initial={false}
                  animate={{ opacity: on ? 1 : 0, y: on ? 0 : -8 }}
                  transition={on ? { ...t.place, delay: pushDelay } : { ...t.fade, delay: done ? popDelay : 0 }}
                >
                  {PUSHED[i]}
                </motion.span>
              </div>
            )
          })}
        </div>
        <motion.span
          className="dsq-top"
          initial={false}
          animate={{ opacity: full ? 1 : 0 }}
          transition={full ? { ...t.fade, delay: 0.5 } : t.fade}
        >
          ← top() = 7
        </motion.span>
      </div>
      <div className="dsq-out">
        <span className="dsq-out-k">udskrift</span>
        <span className="dsq-out-v">
          {POPPED.map((v, i) => (
            <motion.code
              key={i}
              initial={false}
              animate={{ opacity: done ? 1 : 0 }}
              transition={done ? stagger(i, 0.1, 0.12) : t.fade}
            >
              {v}
            </motion.code>
          ))}
        </span>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ køen
interface Q {
  data: string[]
  head: number
  tail: number
  size: number
  /** Celler der er taget ud (værdien ligger der stadig). */
  stale: number[]
  /** Celler der ændres i dette trin. */
  now: number[]
  changed: ('head' | 'tail' | 'size')[]
  out1: number
  out2: number
}

const Q_AT: Q[] = [
  { data: ['', '', '', ''], head: 4, tail: 0, size: 0, stale: [], now: [], changed: [], out1: 0, out2: 0 },
  { data: ['', '', '', ''], head: 4, tail: 0, size: 0, stale: [], now: [], changed: [], out1: 0, out2: 0 },
  { data: ['', '', '', ''], head: 4, tail: 0, size: 0, stale: [], now: [], changed: [], out1: 0, out2: 0 },
  { data: ['10', '5', '3', ''], head: 4, tail: 3, size: 3, stale: [], now: [0, 1, 2], changed: ['tail', 'size'], out1: 0, out2: 0 },
  { data: ['10', '5', '3', '7'], head: 4, tail: 0, size: 4, stale: [], now: [3], changed: ['tail', 'size'], out1: 0, out2: 0 },
  { data: ['10', '5', '3', '7'], head: 2, tail: 0, size: 2, stale: [0, 1], now: [0, 1], changed: ['head', 'size'], out1: 2, out2: 0 },
  { data: ['2', '4', '3', '7'], head: 2, tail: 2, size: 4, stale: [], now: [0, 1], changed: ['tail', 'size'], out1: 2, out2: 0 },
  { data: ['2', '4', '3', '7'], head: 4, tail: 2, size: 2, stale: [2, 3], now: [2, 3], changed: ['head', 'size'], out1: 2, out2: 2 },
  { data: ['2', '4', '3', '7'], head: 2, tail: 2, size: 0, stale: [0, 1, 2, 3], now: [0, 1], changed: ['head', 'size'], out1: 2, out2: 4 },
]
const OUT1 = ['10', '5']
const OUT2 = ['3', '7', '2', '4']

const Q_CODE: ReactNode[] = [
  <>Queue&lt;int&gt;(4): head = N; size = tail = 0;</>,
  <>Queue&lt;int&gt;(4): head = N; size = tail = 0;</>,
  <>Queue&lt;int&gt;(4): head = N; size = tail = 0;</>,
  <>put(10); put(5); put(3);  // data[tail] = x; tail = (tail + 1) % N;</>,
  <>put(7);  // tail = 4 % 4 = 0</>,
  <>get(); get();  // head = head % N; x = data[head++];</>,
  <>put(2); put(4);</>,
  <>get(); get();  // 3, 7</>,
  <>get(); get();  // head = 4 % 4 = 0 → 2, 4</>,
]

function Queue({ step }: { step: number }) {
  const q = Q_AT[step]
  const tones = (i: number): Tone | undefined => {
    if (i === 4) return 'ghost'
    if (q.data[i] === '') return 'ghost'
    if (q.stale.includes(i)) return q.now.includes(i) ? 'focus' : 'muted'
    if (q.now.includes(i)) return 'ok'
    return 'idle'
  }
  const active = step >= 3
  return (
    <div className="dsq-panel">
      <span className="vcaps">Kø som cirkulært array (FIFO), N = 4</span>
      <ArrayRow
        id="dsq-q"
        values={[...q.data, '']}
        tones={tones}
        pointers={[
          { id: 'head', at: q.head, label: 'head', tone: q.changed.includes('head') ? 'focus' : 'idle' },
          { id: 'tail', at: q.tail, label: 'tail', side: 'bottom', tone: q.changed.includes('tail') ? 'focus' : 'idle' },
        ]}
      />
      <div className="dsq-vars" data-active={active || undefined}>
        {(['head', 'tail', 'size'] as const).map((k) => (
          <code key={k} data-now={q.changed.includes(k) || undefined}>
            {k} = {q[k]}
          </code>
        ))}
      </div>
      <Swap show={step} className="dsq-code" items={Q_CODE.map((c, i) => <code key={i}>{c}</code>)} />
      <div className="dsq-out">
        <span className="dsq-out-k">udskrift</span>
        <span className="dsq-out-lines">
          <span className="dsq-out-v">
            {OUT1.map((v, i) => (
              <motion.code
                key={i}
                initial={false}
                animate={{ opacity: i < q.out1 ? 1 : 0 }}
                transition={i < q.out1 ? stagger(i, 0.1, 0.15) : t.fade}
              >
                {v}
                {i === 0 ? ',' : ''}
              </motion.code>
            ))}
          </span>
          <span className="dsq-out-v">
            {OUT2.map((v, i) => (
              <motion.code
                key={i}
                initial={false}
                animate={{ opacity: i < q.out2 ? 1 : 0 }}
                transition={i < q.out2 ? stagger(i % 2, 0.1, 0.15) : t.fade}
              >
                {v}
              </motion.code>
            ))}
          </span>
        </span>
      </div>
    </div>
  )
}

function StackQueue({ step }: { step: number }) {
  return (
    <div className="dsq">
      <Stack step={step} />
      <Queue step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-stack-queue',
  title: 'Stakken popper baglæns, køen løber rundt',
  steps: [
    {
      caption:
        'Stakken bygger på den dobbelt-hægtede liste: `push` er `push_front`, `pop` er `pop_front`. Køen er et array med `N = 4`, hvor `head = N` og `tail = size = 0` fra start.',
      hold: 3000,
    },
    { caption: '`push` 10, 5, 3, 7: hvert element lægges forrest, så `top()` giver 7, det sidst indsatte.', hold: 2400 },
    { caption: 'Løkken popper `7 3 5 10`, den omvendte rækkefølge: **last in, first out**.', hold: 2200 },
    { caption: '`put` 10, 5, 3: `data[tail] = x`, så `tail = (tail + 1) % N`. `tail` peger på næste ledige plads.', hold: 2400 },
    { caption: '`put(7)` fylder `data[3]`, og `tail = 4 % 4` løber rundt til 0. `size = 4`: køen er fuld.', hold: 2600 },
    {
      caption:
        'To `get`: først `head = 4 % 4 = 0`, så `data[head++]`. Udskriften er `10,5`, og `head` står på 2. Værdierne ligger der stadig, men er ude af køen.',
      hold: 3000,
    },
    { caption: '`put(2)` og `put(4)` genbruger `data[0]` og `data[1]`. `tail` står nu på 2.', hold: 2200 },
    { caption: 'Køen tømmes: `get` giver 3 og 7, og `head` når 4.', hold: 1800 },
    {
      caption:
        '`head = 4 % 4` løber rundt til 0, så kommer 2 og 4. Udskriften `3 7 2 4` er indsættelsesrækkefølgen: **first in, first out**.',
      hold: 3000,
    },
  ],
  Component: StackQueue,
}

export default viz
