import { motion } from 'motion/react'
import { Fragment, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './zombie-buffer.css'

/* ZombieTesting.pdf s. 8 (I – Interfaces), s. 10 (Zero, One: testene og
   IsEmpty = index == outdex), s. 11–12 (Many, Boundary: testene og tegningerne
   af bufferen med index/outdex; Put tæller index op, Get tæller outdex op),
   s. 13 (Exception: put_to_full_fails, get_from_empty_returns_default_value).
   Standardbufferens kapacitet står ikke på slidene; den tegnes med fire pladser
   som på s. 12. */

/** Brudpunkter efter understreger — aldrig midt i et ord. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=_)/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

const LETTERS: { l: string; word: string; tests?: string[]; points?: string[] }[] = [
  { l: 'Z', word: 'Zero', tests: ['is_empty_after_creation'] },
  { l: 'O', word: 'One', tests: ['is_not_empty_after_put'] },
  { l: 'M', word: 'Many', tests: ['put_get_is_fifo'] },
  { l: 'B', word: 'Boundaries', tests: ['force_a_buffer_wraparound'] },
  {
    l: 'I',
    word: 'Interfaces',
    points: [
      'alle metoder og alle overloads',
      'alle kastede exceptions — brug coverage',
      'alle kaldte interfaces til afhængigheder',
      'alle events brugt og udbudt af UUT',
    ],
  },
  { l: 'E', word: 'Exceptional behavior', tests: ['put_to_full_fails', 'get_from_empty_returns_default_value'] },
]

type Op = { call: string; out?: string; tone?: 'ok' | 'neg' }
type Buf = {
  create: string
  cap: number
  slots: (number | null)[]
  /** Læst med Get (værdien står der stadig, men er brugt). */
  read: boolean[]
  /** Overskrevet værdi, vist overstreget. */
  prev?: (number | null)[]
  index: number
  outdex: number
  rejected?: number
  wrap?: boolean
  ops: Op[][]
}

const EMPTY4 = [null, null, null, null]
const NO_READ = [false, false, false, false]

/* Én tilstand pr. trin: 0 = start, 1–6 = Z O M B I E. */
const STATES: Buf[] = [
  { create: 'Create()', cap: 4, slots: EMPTY4, read: NO_READ, index: 0, outdex: 0, ops: [] },
  {
    create: 'Create()',
    cap: 4,
    slots: EMPTY4,
    read: NO_READ,
    index: 0,
    outdex: 0,
    ops: [[{ call: 'IsEmpty()', out: 'true', tone: 'ok' }]],
  },
  {
    create: 'Create()',
    cap: 4,
    slots: [42, null, null, null],
    read: NO_READ,
    index: 1,
    outdex: 0,
    ops: [[{ call: 'Put(42)' }, { call: 'IsEmpty()', out: 'false', tone: 'ok' }]],
  },
  {
    create: 'Create()',
    cap: 4,
    slots: [41, 42, 43, null],
    read: [true, true, true, false],
    index: 3,
    outdex: 3,
    ops: [
      [{ call: 'Put(41)' }, { call: 'Put(42)' }, { call: 'Put(43)' }],
      [
        { call: 'Get()', out: '41', tone: 'ok' },
        { call: 'Get()', out: '42', tone: 'ok' },
        { call: 'Get()', out: '43', tone: 'ok' },
      ],
    ],
  },
  {
    create: 'Create(2)',
    cap: 2,
    slots: [3, 2, null, null],
    prev: [1, null, null, null],
    read: [true, true, false, false],
    index: 1,
    outdex: 1,
    wrap: true,
    ops: [
      [{ call: 'Put(1)' }, { call: 'Put(2)' }, { call: 'Get()' }, { call: 'Put(3)' }],
      [
        { call: 'Get()', out: '2', tone: 'ok' },
        { call: 'Get()', out: '3', tone: 'ok' },
        { call: 'IsEmpty()', out: 'true', tone: 'ok' },
      ],
    ],
  },
  // I: ingen buffer-test — bufferen bliver stående fra B.
  {
    create: 'Create(2)',
    cap: 2,
    slots: [3, 2, null, null],
    prev: [1, null, null, null],
    read: [true, true, false, false],
    index: 1,
    outdex: 1,
    wrap: true,
    ops: [],
  },
  {
    create: 'Create(1)',
    cap: 1,
    slots: [1, null, null, null],
    read: NO_READ,
    index: 0,
    outdex: 0,
    rejected: 2,
    ops: [
      [
        { call: 'Put(1)', out: 'true', tone: 'ok' },
        { call: 'Put(2)', out: 'false', tone: 'neg' },
      ],
      [{ call: 'tom buffer: Get()', out: 'DEFAULT_VALUE', tone: 'ok' }],
    ],
  },
]

function OpChip({ op }: { op: Op }) {
  return (
    <span className="zb-op" data-tone={op.tone}>
      <code>{op.call}</code>
      {op.out !== undefined && (
        <>
          <span className="zb-op-arrow">→</span>
          <code className="zb-op-out">{op.out}</code>
        </>
      )}
    </span>
  )
}

function Ring({ s, dim }: { s: Buf; dim: boolean }) {
  return (
    <div className="zb-ring" data-dim={dim || undefined}>
      <motion.div layout className="zb-marker is-in" style={{ gridColumn: s.index + 1 }} transition={t.travel}>
        <span>index</span>
        <span className="zb-tick" />
      </motion.div>

      {[0, 1, 2, 3].map((i) => {
        const on = i < s.cap
        const v = s.slots[i]
        const prev = s.prev?.[i]
        return (
          <motion.div
            key={i}
            className="zb-slot"
            data-read={(on && v !== null && s.read[i]) || undefined}
            style={{ gridColumn: i + 1 }}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={t.fade}
            aria-hidden={!on || undefined}
          >
            {prev != null && <s className="zb-prev">{prev}</s>}
            <motion.span
              key={`${v}-${s.create}`}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...t.place, delay: 0.1 + i * 0.12 }}
            >
              {v ?? ''}
            </motion.span>
          </motion.div>
        )
      })}

      <motion.div
        className="zb-reject"
        style={{ gridColumn: 2 }}
        initial={false}
        animate={{ opacity: s.rejected !== undefined ? 1 : 0, x: s.rejected !== undefined ? 0 : 8 }}
        transition={s.rejected !== undefined ? { ...t.place, delay: 0.45 } : t.fade}
        aria-hidden={s.rejected === undefined || undefined}
      >
        <span className="zb-reject-val">2</span>
        <span className="zb-reject-x">✗ fuld</span>
      </motion.div>

      <motion.div
        layout
        className="zb-loop"
        style={{ gridColumn: `1 / ${s.cap + 1}` }}
        transition={t.travel}
      />

      <motion.div layout className="zb-marker is-out" style={{ gridColumn: s.outdex + 1 }} transition={t.travel}>
        <span className="zb-tick" />
        <span>outdex</span>
      </motion.div>
    </div>
  )
}

function Zombie({ step }: { step: number }) {
  const s = STATES[step]
  const isI = step === 5

  return (
    <div className="zb">
      <ol className="zb-list">
        {LETTERS.map((row, i) => {
          const n = i + 1
          const done = at(step, n)
          const now = step === n
          return (
            <li key={row.l} className="zb-row" data-tone={now ? 'focus' : done ? 'ok' : 'idle'}>
              <span className="zb-letter">{row.l}</span>
              <div className="zb-row-body">
                <span className="zb-word">{row.word}</span>
                <motion.div
                  className="zb-tests"
                  initial={false}
                  animate={{ opacity: done ? 1 : 0, y: done ? 0 : 4 }}
                  transition={done ? t.settle : t.fade}
                  aria-hidden={!done || undefined}
                >
                  {row.tests?.map((name) => (
                    <code key={name} className="zb-test">
                      {brk(name)}
                    </code>
                  ))}
                  {row.points && (
                    <div className="zb-points">
                      <span className="zb-none">ingen buffer-test på slidene</span>
                      {row.points.map((p) => (
                        <span key={p} className="zb-point">
                          {p}
                        </span>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </li>
          )
        })}
      </ol>

      <div className="zb-panel">
        <div className="zb-panel-head">
          <span className="vcaps">CircularBuffer</span>
          <Swap
            className="zb-create"
            show={s.cap === 4 ? 0 : s.cap === 2 ? 1 : 2}
            items={[
              <code key="4">Create()</code>,
              <code key="2">Create(2) · kapacitet 2</code>,
              <code key="1">Create(1) · kapacitet 1</code>,
            ]}
          />
        </div>

        <Ring s={s} dim={isI} />

        <div className="zb-tagrow">
          <Swap
            show={step === 4 ? 1 : step === 6 ? 2 : step === 3 ? 3 : 0}
            items={[
              <span key="n" />,
              <Tag key="w" wrap>
                index og outdex wrapper rundt
              </Tag>,
              <Tag key="f" tone="neg" wrap>
                Put(2) i fuld buffer → false
              </Tag>,
              <Tag key="fifo" wrap>
                FIFO: først ind, først ud
              </Tag>,
            ]}
          />
        </div>

        <Swap
          className="zb-ops"
          show={step}
          items={STATES.map((st, k) =>
            k === 0 ? (
              <p key={k} className="zb-help">
                <code>Put</code> skriver ved <code>index</code>, <code>Get</code> læser ved <code>outdex</code>. Tom, når de er ens.
              </p>
            ) : k === 5 ? (
              <p key={k} className="zb-help">
                Slidene har ingen buffer-test for <b>I</b> — kun tjeklisten til venstre.
              </p>
            ) : (
              <div key={k} className="zb-opgroups">
                {st.ops.map((g, gi) => (
                  <div key={gi} className="zb-opgroup">
                    {g.map((op, oi) => (
                      <motion.span
                        key={oi}
                        initial={false}
                        animate={{ opacity: step === k ? 1 : 0 }}
                        transition={step === k ? stagger(gi * 4 + oi, 0.05, 0.08) : t.fade}
                      >
                        <OpChip op={op} />
                      </motion.span>
                    ))}
                  </div>
                ))}
              </div>
            ),
          )}
        />
        <motion.p
          className="zb-legend"
          initial={false}
          animate={{ opacity: s.read.some(Boolean) ? 1 : 0 }}
          transition={t.fade}
        >
          <span className="zb-legend-swatch" /> læst med <code>Get</code> — værdien står der stadig
        </motion.p>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'zombie-buffer',
  title: 'ZOMBIE udfyldt med CircularBuffer',
  steps: [
    {
      caption:
        'Tjeklisten Z O M B I E og Grennings `CircularBuffer`. `Put` skriver ved `index`, `Get` læser ved `outdex`; bufferen er tom, når de er ens.',
      hold: 2400,
    },
    {
      caption: '**Zero**: `is_empty_after_creation`. En ny buffer er tom — `IsEmpty` er sand. Koden kan nøjes med `return true;`.',
      hold: 2400,
    },
    {
      caption: '**One**: `is_not_empty_after_put`. Ét `Put(42)` flytter `index`; nu er `index ≠ outdex`, og bufferen er ikke tom.',
      hold: 2400,
    },
    {
      caption: '**Many**: `put_get_is_fifo`. Tre `Put` og tre `Get` — værdierne kommer ud i samme rækkefølge, som de kom ind.',
      hold: 2600,
    },
    {
      caption:
        '**Boundaries**: `force_a_buffer_wraparound`. Med kapacitet 2 skriver `Put(3)` i plads 0 igen — bufferen wrapper rundt. `Get` giver 2 og så 3.',
      hold: 3000,
    },
    {
      caption:
        '**Interfaces**: slidene har ingen buffer-test her, kun tjeklisten — alle metoder og overloads, exceptions, kaldte interfaces og events.',
      hold: 2800,
    },
    {
      caption:
        '**Exceptional behavior**: `Put` i en fuld buffer returnerer `false`, og `Get` fra en tom giver `DEFAULT_VALUE`. Tjeklisten er udfyldt.',
      hold: 3000,
    },
  ],
  Component: Zombie,
}

export default viz
