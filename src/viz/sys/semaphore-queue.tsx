import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './semaphore-queue.css'

/* 04.1-Synchronisation-tools.pdf s. 35–39: semaphore_counting() med
   std::counting_semaphore sem{2} og 10 tråde; outputtet viser parrene
   (0,2), (2,5), (5,4), (4,1), … Figuren følger de fire første par og viser kun de
   tråde, der indgår i dem. Ventekøen og S->value er bogens implementering
   (§6.6.2 s. 290–291): value-- og sleep() når den bliver negativ; value++ og
   wakeup(P) når den er ≤ 0. Rækkefølgen i køen (5, 4, 1) er udledt af parrene. */

type Slot = 'start' | 'cs' | 'queue' | 'done'
const THREADS = ['0', '2', '5', '4', '1'] as const
type Tid = (typeof THREADS)[number]

interface Frame {
  pos: Record<Tid, Slot>
  /** Rækkefølge i køen. */
  queue: Tid[]
  sem: number
  book: number
  pairs: number
}

function frame(step: number): Frame {
  const pos: Record<Tid, Slot> = { '0': 'start', '2': 'start', '5': 'start', '4': 'start', '1': 'start' }
  let queue: Tid[] = []
  let sem = 2
  let book = 2
  let pairs = 0
  if (step >= 1) {
    pos['0'] = 'cs'
    sem = book = 1
  }
  if (step >= 2) {
    pos['2'] = 'cs'
    sem = book = 0
    pairs = 1
  }
  if (step >= 3) {
    pos['5'] = pos['4'] = pos['1'] = 'queue'
    queue = ['5', '4', '1']
    book = -3
  }
  if (step >= 4) {
    pos['0'] = 'done'
    pos['5'] = 'cs'
    queue = ['4', '1']
    book = -2
    pairs = 2
  }
  if (step >= 5) {
    pos['2'] = 'done'
    pos['4'] = 'cs'
    queue = ['1']
    book = -1
    pairs = 3
  }
  if (step >= 6) {
    pos['5'] = 'done'
    pos['1'] = 'cs'
    queue = []
    book = 0
    pairs = 4
  }
  return { pos, queue, sem, book, pairs }
}

const PAIRS = ['(0,2)', '(2,5)', '(5,4)', '(4,1)']

function SemQueue({ step }: { step: number }) {
  const f = frame(step)
  const tone = (id: Tid) => {
    const s = f.pos[id]
    if (s === 'cs') return 'focus'
    if (s === 'queue') return 'idle'
    if (s === 'done') return 'muted'
    return 'idle'
  }
  const inSlot = (slot: Slot) => {
    const ids = slot === 'queue' ? f.queue : THREADS.filter((id) => f.pos[id] === slot)
    return ids.map((id) => (
      <Token key={id} id={`sq-${id}`} tone={tone(id)}>
        {`T${id}`}
      </Token>
    ))
  }
  const final = step >= 6

  return (
    <div className="sx-sq">
      <div className="sx-sq-counter">
        <code className="sx-sq-decl">std::counting_semaphore sem{'{2}'};</code>
        <div className="sx-sq-big" data-tone={f.sem === 0 ? 'zero' : 'pos'}>
          <span className="sx-sq-big-label">tæller</span>
          <motion.span
            key={f.sem}
            className="sx-sq-big-val"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t.place}
          >
            {f.sem}
          </motion.span>
          <span className="sx-sq-big-sub">
            <code>acquire()</code> tæller ned, blokerer ved 0 · <code>release()</code> tæller op eller vækker én
          </span>
        </div>
        <div className="sx-sq-book" data-neg={f.book < 0 || undefined}>
          <span>
            bogens <code>S-&gt;value</code>
          </span>
          <motion.b
            key={f.book}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={t.place}
          >
            {f.book}
          </motion.b>
          <span className="sx-sq-book-note">negativ = antal i køen</span>
        </div>
      </div>

      <div className="sx-sq-zones">
        <div className="sx-sq-zone">
          <span className="sx-sq-label">vil ind</span>
          <span className="sx-sq-tokens">{inSlot('start')}</span>
        </div>
        <div className="sx-sq-zone" data-tone="cs">
          <span className="sx-sq-label">
            kritisk sektion <span className="sx-sq-cap">højst 2</span>
          </span>
          <span className="sx-sq-tokens">{inSlot('cs')}</span>
        </div>
        <div className="sx-sq-zone" data-tone={f.queue.length ? 'queue' : 'idle'}>
          <span className="sx-sq-label">
            ventekø <code>S-&gt;list</code>
          </span>
          <span className="sx-sq-tokens">
            {inSlot('queue')}
            {f.queue.length > 0 && <span className="sx-sq-sleep">sleep()</span>}
          </span>
        </div>
        <div className="sx-sq-zone">
          <span className="sx-sq-label">færdig</span>
          <span className="sx-sq-tokens">{inSlot('done')}</span>
        </div>

        <div className="sx-sq-out">
          <span className="sx-sq-label">output, parvis</span>
          <span className="sx-sq-pairs">
            {PAIRS.map((p, i) => (
              <motion.code
                key={p}
                data-now={i === f.pairs - 1 || undefined}
                initial={false}
                animate={{ opacity: i < f.pairs ? 1 : 0 }}
                transition={t.fade}
              >
                {p}
              </motion.code>
            ))}
            <motion.span initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
              …
            </motion.span>
          </span>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'semaphore-queue',
  title: 'Tællende semafor med ventekø',
  steps: [
    {
      caption: '`std::counting_semaphore sem{2}` — to pladser. Figuren følger de tråde, der optræder i slidets første fire par; køens rækkefølge er udledt af parrene.',
      hold: 2400,
    },
    { caption: 'T0 kalder `sem.acquire()`: tælleren går fra 2 til 1, og T0 er inde.', hold: 1700 },
    { caption: 'T2 kalder `acquire()`: tælleren er **0**. Outputtet viser 0 og 2 flettet.', hold: 2000 },
    {
      caption:
        'T5, T4 og T1 kalder `acquire()` ved 0 og **blokerer**. I bogens implementering tæller værdien videre ned til −3: tre sover i køen.',
      hold: 3000,
    },
    { caption: 'T0 kalder `release()`. Den første i køen, T5, vækkes (`wakeup(P)`) og tager pladsen: parret (2,5).', hold: 2600 },
    { caption: 'T2 kalder `release()` og vækker T4: parret (5,4).', hold: 1900 },
    {
      caption:
        'T5 vækker T1: (4,1). Aldrig mere end to inde, og en `release()` med ventende i køen giver pladsen direkte videre.',
      hold: 3000,
    },
  ],
  Component: SemQueue,
}

export default viz
