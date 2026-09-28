import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './box-testing.css'

/* Black And White Box.pdf s. 3 (komplet mod robust), s. 4 (de to teknikker), s. 5 (koden og
   flowchartet med kant 1–8), s. 6 (test kontrakten, ikke koden), s. 7 (black box unit test).
   Kontrakten er formuleret ud fra koden på s. 5; hvilke kanter hver sti tager, følger af flowchartet. */

type Edge = { n: number; d: string; lx: number; ly: number }

// Flowchartet fra s. 5, tegnet om. Kant 3 og 7 er false-grenene (venstre), 2 og 6 true-grenene.
const EDGES: Edge[] = [
  { n: 1, d: 'M130 40 V62', lx: 142, ly: 55 },
  { n: 2, d: 'M172 88 H240 V102', lx: 206, ly: 81 },
  { n: 3, d: 'M88 88 H52 V160 H104', lx: 40, ly: 128 },
  { n: 4, d: 'M240 132 V160 H156', lx: 252, ly: 150 },
  { n: 5, d: 'M130 172 V196', lx: 142, ly: 188 },
  { n: 6, d: 'M172 222 H240 V236', lx: 206, ly: 215 },
  { n: 7, d: 'M88 222 H52 V294 H104', lx: 40, ly: 262 },
  { n: 8, d: 'M240 266 V294 H156', lx: 252, ly: 284 },
]

const PATHS = [
  { cls: 'a+b > 50', out: '"Large"', edges: [1, 2, 4, 5, 7], at: 3 },
  { cls: 'a+b < 50', out: '"small"', edges: [1, 3, 5, 6, 8], at: 4 },
]

const LAST = 5

function Flowchart({ step }: { step: number }) {
  const active = step === 3 ? PATHS[0] : step === 4 ? PATHS[1] : undefined
  const covered = new Set(PATHS.filter((p) => at(step, p.at)).flatMap((p) => p.edges))
  return (
    <svg className="bx-svg" viewBox="30 0 256 308" role="img" aria-label="Flowchart med to beslutninger og kanterne 1 til 8">
      <defs>
        <marker id="bx-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 z" className="bx-arrow" />
        </marker>
      </defs>

      {EDGES.map((e) => {
        const on = active?.edges.includes(e.n)
        const done = covered.has(e.n)
        const order = active ? active.edges.indexOf(e.n) : 0
        return (
          <g key={e.n} className="bx-edge" data-state={on ? 'on' : done ? 'done' : 'idle'}>
            <path d={e.d} className="bx-base" markerEnd="url(#bx-arrow)" />
            <motion.path
              d={e.d}
              className="bx-hl"
              initial={false}
              animate={{ pathLength: done ? 1 : 0, opacity: done ? 1 : 0 }}
              transition={on ? { ...t.travel, duration: 0.45, delay: 0.1 + order * 0.32 } : t.fade}
            />
            <text x={e.lx} y={e.ly} className="bx-num" textAnchor="middle" dominantBaseline="middle">
              {e.n}
            </text>
          </g>
        )
      })}

      <rect x="86" y="8" width="88" height="32" rx="4" className="bx-shape" />
      <text x="130" y="24" className="bx-label" textAnchor="middle" dominantBaseline="middle">
        Read A and B
      </text>

      <path d="M130 62 L172 88 L130 114 L88 88 Z" className="bx-shape" />
      <text x="130" y="88" className="bx-label" textAnchor="middle" dominantBaseline="middle">
        A+B &gt; 50
      </text>
      <rect x="200" y="102" width="80" height="30" rx="4" className="bx-shape" />
      <text x="240" y="117" className="bx-label" textAnchor="middle" dominantBaseline="middle">
        Print Large
      </text>
      <ellipse cx="130" cy="160" rx="26" ry="12" className="bx-shape" />
      <text x="130" y="160" className="bx-small" textAnchor="middle" dominantBaseline="middle">
        End If
      </text>

      <path d="M130 196 L172 222 L130 248 L88 222 Z" className="bx-shape" />
      <text x="130" y="222" className="bx-label" textAnchor="middle" dominantBaseline="middle">
        A+B &lt; 50
      </text>
      <rect x="200" y="236" width="80" height="30" rx="4" className="bx-shape" />
      <text x="240" y="251" className="bx-label" textAnchor="middle" dominantBaseline="middle">
        Print Small
      </text>
      <ellipse cx="130" cy="294" rx="26" ry="12" className="bx-shape" />
      <text x="130" y="294" className="bx-small" textAnchor="middle" dominantBaseline="middle">
        End If
      </text>
    </svg>
  )
}

function BoxTesting({ step }: { step: number }) {
  const tests = at(step, 1)
  const open = at(step, 2)
  const done = at(step, LAST)
  const count = step >= 4 ? 8 : step === 3 ? 5 : 0

  return (
    <div className="bx">
      {/* Black box: udefra */}
      <section className="bx-panel" data-hot={step <= 1 || undefined}>
        <span className="vcaps">Black box · udefra</span>
        <div className="bx-io">
          <span className="bx-io-label">
            input <code>a, b</code>
          </span>
          <span className="bx-arrow-h" aria-hidden="true" />
          <div className="bx-box">Unit Under Test</div>
          <span className="bx-arrow-h" aria-hidden="true" />
          <span className="bx-io-label">output</span>
        </div>

        <div className="bx-contract">
          <span className="bx-sub">Kontrakt</span>
          <ul>
            <li>
              <code>a+b &gt; 50</code> → <code>"Large"</code>
            </li>
            <li>
              <code>a+b &lt; 50</code> → <code>"small"</code>
            </li>
          </ul>
        </div>

        <div className="bx-tests">
          <div className="bx-row bx-row-head">
            <span>input fra klassen</span>
            <span>output</span>
            <span>forventet</span>
            <span />
          </div>
          {PATHS.map((p, i) => (
            <motion.div
              key={p.cls}
              className="bx-row"
              initial={false}
              animate={{ opacity: tests ? 1 : 0, x: tests ? 0 : -6 }}
              transition={tests ? stagger(i, 0.1, 0.35) : t.fade}
            >
              <code>{p.cls}</code>
              <code>{p.out}</code>
              <code>{p.out}</code>
              <span className="bx-ok">✓</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* White box: indefra */}
      <section className="bx-panel" data-hot={(step >= 2 && step <= 4) || undefined}>
        <span className="vcaps">White box · indefra</span>
        <div className="bx-inside">
          <div className="bx-code" data-open={open || undefined}>
            <code>input a,b</code>
            <code>if (a+b &gt; 50) {'{'}</code>
            <code className="bx-ind">print("Large")</code>
            <code>{'}'}</code>
            <code>if (a+b &lt; 50) {'{'}</code>
            <code className="bx-ind">print("small")</code>
            <code>{'}'}</code>
          </div>
          <div className="bx-chart">
            <Flowchart step={step} />
          </div>
          <motion.div
            className="bx-lid"
            initial={false}
            animate={{ opacity: open ? 0 : 1, y: open ? -10 : 0 }}
            transition={open ? t.recede : t.fade}
            aria-hidden={open || undefined}
          >
            Unit Under Test
          </motion.div>
        </div>

        <div className="bx-paths">
          {PATHS.map((p) => (
            <motion.div
              key={p.cls}
              className="bx-path"
              data-now={step === p.at || undefined}
              initial={false}
              animate={{ opacity: at(step, p.at) ? 1 : 0 }}
              transition={t.fade}
            >
              <code>{p.cls}</code>
              <span className="bx-edges">
                {p.edges.map((n) => (
                  <span key={n} className="bx-e">
                    {n}
                  </span>
                ))}
              </span>
            </motion.div>
          ))}
          <div className="bx-count">
            <motion.span initial={false} animate={{ opacity: at(step, 3) ? 1 : 0 }} transition={t.fade}>
              kanter dækket: <b>{count}</b> af 8
            </motion.span>
            <Tag show={done} tone="idle" wrap>
              a+b == 50: kant 1, 3, 5, 7 · intet print
            </Tag>
          </div>
        </div>
      </section>

      <motion.p
        className="bx-msg"
        initial={false}
        animate={{ opacity: done ? 1 : 0 }}
        transition={t.fade}
        aria-hidden={!done || undefined}
      >
        Test kontrakten, ikke koden — sigt efter black box.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'box-testing',
  title: 'Samme enhed set udefra og indefra',
  steps: [
    {
      caption:
        '**Black box**: enheden er en sort kasse. Testen kender kun input `a, b`, output og kontrakten (her formuleret ud fra slidets eksempel).',
      hold: 2400,
    },
    {
      caption: 'Testen giver input fra hver klasse i kontrakten og sammenligner output med det forventede — uden at se koden.',
      hold: 2600,
    },
    {
      caption: '**White box**: låget åbnes. Koden bliver til et flowchart med to beslutninger og otte kanter.',
      hold: 2400,
    },
    {
      caption: '**Branch testing** kræver, at alle kanter gennemløbes. En test med `a+b > 50` tager kant 1, 2, 4, 5 og 7.',
      hold: 2800,
    },
    {
      caption: 'En test med `a+b < 50` tager 1, 3, 5, 6 og 8. To tests dækker alle otte kanter; flere beslutninger kræver flere tests.',
      hold: 2800,
    },
    {
      caption:
        'Koden printer intet ved `a+b == 50` — det siger kontrakten ikke noget om. Viden om indmaden giver mere komplette tests, men de knækker, når koden ændres. Kurset: **sigt efter black box**.',
      hold: 3000,
    },
  ],
  Component: BoxTesting,
}

export default viz
