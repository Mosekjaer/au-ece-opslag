import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './bounded-buffer.css'

/* Silberschatz s. 312–313, figur 7.1 og 7.2 (semaphore mutex = 1, empty = n,
   full = 0; producer: wait(empty), wait(mutex), add, signal(mutex), signal(full);
   consumer spejlvendt) og 08.1 s. 3 (cirkulær buffer med in/out, (in + 1) %
   BUFFER_SIZE). Materialet giver ingen værdi for n: figuren bruger n = 3 som
   eksempel, og elementerne er blot nummereret. wait() følger bogens klassiske
   definition (while (S <= 0); S--;), så tællerne bliver aldrig negative.
   Indhold: src/content/sys/p4-deadlocks.ts, emnet bounded-buffer. */

const N = 3

const PROD = ['wait(empty);', 'wait(mutex);', '/* add next_produced to the buffer */', 'signal(mutex);', 'signal(full);']
const CONS = ['wait(full);', 'wait(mutex);', '/* remove an item from buffer to next_consumed */', 'signal(mutex);', 'signal(empty);']

type LineState = 'run' | 'block' | undefined
type Loc = 'prod' | 'cons' | 0 | 1 | 2 | null

interface Frame {
  empty: number
  full: number
  mutex: number
  inIx: number
  outIx: number
  prod: LineState[]
  cons: LineState[]
  prodStatus: ReactNode
  consStatus: ReactNode
  prodBlocked?: boolean
  mutexBy?: 'producer'
}

const run5: LineState[] = ['run', 'run', 'run', 'run', 'run']

const FRAMES: Frame[] = [
  { empty: 3, full: 0, mutex: 1, inIx: 0, outIx: 0, prod: [], cons: [], prodStatus: 'klar', consStatus: 'ikke i gang' },
  {
    empty: 2,
    full: 0,
    mutex: 0,
    inIx: 1,
    outIx: 0,
    prod: ['run', 'run', 'run'],
    cons: [],
    prodStatus: <>holder <code>mutex</code></>,
    consStatus: 'ikke i gang',
    mutexBy: 'producer',
  },
  {
    empty: 2,
    full: 1,
    mutex: 1,
    inIx: 1,
    outIx: 0,
    prod: [undefined, undefined, undefined, 'run', 'run'],
    cons: [],
    prodStatus: 'klar',
    consStatus: 'ikke i gang',
  },
  { empty: 0, full: 3, mutex: 1, inIx: 0, outIx: 0, prod: run5, cons: [], prodStatus: <>×2 — bufferen er fuld</>, consStatus: 'ikke i gang' },
  {
    empty: 0,
    full: 3,
    mutex: 1,
    inIx: 0,
    outIx: 0,
    prod: ['block'],
    cons: [],
    prodStatus: <>blokeret i <code>wait(empty)</code></>,
    consStatus: 'ikke i gang',
    prodBlocked: true,
  },
  {
    empty: 1,
    full: 2,
    mutex: 1,
    inIx: 0,
    outIx: 1,
    prod: [],
    cons: run5,
    prodStatus: <>kan komme videre: <code>empty</code> er 1</>,
    consStatus: <>har taget element 1</>,
  },
  {
    empty: 0,
    full: 3,
    mutex: 1,
    inIx: 1,
    outIx: 1,
    prod: run5,
    cons: [],
    prodStatus: <>element 4 i plads 0</>,
    consStatus: <>har taget element 1</>,
  },
]

// Hvor er hvert element på hvert trin?
const ITEMS: { id: number; loc: Loc[] }[] = [
  { id: 1, loc: ['prod', 0, 0, 0, 0, 'cons', 'cons'] },
  { id: 2, loc: [null, 'prod', 'prod', 1, 1, 1, 1] },
  { id: 3, loc: [null, null, null, 2, 2, 2, 2] },
  { id: 4, loc: [null, null, null, 'prod', 'prod', 'prod', 0] },
]

function itemsAt(step: number, where: Loc, blocked?: boolean) {
  return ITEMS.filter((it) => it.loc[step] === where).map((it) => (
    <Token key={it.id} id={`bb-item-${it.id}`} tone={where === 'prod' && blocked ? 'neg' : where === 'cons' ? 'muted' : 'focus'}>
      {it.id}
    </Token>
  ))
}

function Counter({ name, value, note, tone }: { name: string; value: number; note: ReactNode; tone?: 'zero' | 'neg' }) {
  return (
    <div className="bb-sem" data-tone={tone}>
      <code className="bb-sem-name">{name}</code>
      <motion.span
        key={value}
        className="bb-sem-v"
        initial={{ opacity: 0, y: -5 }}
        animate={{ opacity: 1, y: 0 }}
        transition={t.place}
      >
        {value}
      </motion.span>
      <span className="bb-sem-note">{note}</span>
    </div>
  )
}

function Code({
  title,
  lines,
  state,
  hand,
  status,
  blocked,
}: {
  title: string
  lines: string[]
  state: LineState[]
  hand: ReactNode
  status: ReactNode
  blocked?: boolean
}) {
  return (
    <div className="bb-code" data-blocked={blocked || undefined}>
      <div className="bb-code-head">
        <span className="bb-code-title">{title}</span>
        <span className="bb-hand">{hand}</span>
      </div>
      <ol className="bb-lines">
        {lines.map((l, i) => (
          <li key={i} className="bb-line mono" data-state={state[i]}>
            {l}
          </li>
        ))}
      </ol>
      <div className="bb-status">{status}</div>
    </div>
  )
}

function Buffer({ step }: { step: number }) {
  const f = FRAMES[Math.min(step, FRAMES.length - 1)]
  const s = Math.min(step, FRAMES.length - 1)
  return (
    <div className="bb">
      <div className="bb-top">
        <div className="bb-sems">
          <Counter name="empty" value={f.empty} note="tomme pladser" tone={f.empty === 0 ? (f.prodBlocked ? 'neg' : 'zero') : undefined} />
          <Counter name="full" value={f.full} note="fyldte pladser" tone={f.full === 0 ? 'zero' : undefined} />
          <Counter name="mutex" value={f.mutex} note={<Swap show={f.mutexBy ? 1 : 0} items={['bufferen er fri', 'holdes af producer']} />} tone={f.mutex === 0 ? 'zero' : undefined} />
        </div>

        <div className="bb-ring">
          <span className="vcaps">
            buffer, <code>n = {N}</code> (eksempel)
          </span>
          <ol className="bb-slots">
            {Array.from({ length: N }, (_, i) => (
              <li key={i} className="bb-slot-wrap">
                <div className="bb-slot" data-full={ITEMS.some((it) => it.loc[s] === i) || undefined}>
                  {itemsAt(s, i as Loc)}
                </div>
                <span className="bb-ix">{i}</span>
                <div className="bb-ptrs">
                  {f.inIx === i && (
                    <motion.span layoutId="bb-in" className="bb-ptr mono" transition={t.travel}>
                      in
                    </motion.span>
                  )}
                  {f.outIx === i && (
                    <motion.span layoutId="bb-out" className="bb-ptr bb-ptr-out mono" transition={t.travel}>
                      out
                    </motion.span>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="bb-codes">
        <Code
          title="Producer"
          lines={PROD}
          state={f.prod}
          hand={itemsAt(s, 'prod', f.prodBlocked)}
          status={f.prodStatus}
          blocked={f.prodBlocked}
        />
        <Code title="Consumer" lines={CONS} state={f.cons} hand={itemsAt(s, 'cons')} status={f.consStatus} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'bounded-buffer',
  title: 'Producer og consumer med tre semaforer',
  steps: [
    {
      caption:
        'Tre semaforer: `empty = n` tæller tomme pladser, `full = 0` fyldte, og `mutex = 1` beskytter selve bufferen. Her er `n = 3` (eksempel).',
      hold: 2600,
    },
    {
      caption:
        'Producenten kalder `wait(empty)` — der er plads, `empty` bliver 2 — og `wait(mutex)`. Med låsen lægger den element 1 i plads `in`.',
      hold: 2600,
    },
    {
      caption: '`signal(mutex)` frigiver bufferen, `signal(full)` melder et fyldt element. Nu kan en consumer komme ind.',
      hold: 2200,
    },
    {
      caption: 'To elementer mere. `empty` er 0, `full` er 3, og `in` er løbet rundt til plads 0.',
      hold: 2200,
    },
    {
      caption:
        'Element 4: `wait(empty)` ser 0 og **blokerer**. Producenten holder *ikke* `mutex`, mens den venter — den tog tællesemaforen først.',
      hold: 2800,
    },
    {
      caption:
        'Consumeren kører spejlbilledet: `wait(full)`, `wait(mutex)`, tager element 1 ved `out`, `signal(mutex)`, `signal(empty)`. `empty` bliver 1.',
      hold: 2800,
    },
    {
      caption:
        'Producenten kommer videre og lægger element 4 i plads 0. Havde den taget `mutex` før `empty`, kunne consumeren aldrig være kommet ind.',
      hold: 3000,
    },
  ],
  Component: Buffer,
}

export default viz
