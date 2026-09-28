import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './line-branch.css'

/* Coverage-latest.pdf s. 4 (koden og "Did we test for condition being false?"),
   s. 6 (kortslutning i ||). Code Coverage Analysis.pdf s. 2–3 (statement coverage
   rater koden fuldt dækket; er condition falsk, fejler koden). */

const LINES = [
  { code: 'int* p = 0;', indent: 0 },
  { code: 'if (condition)', indent: 0, decision: true },
  { code: 'p = &variable;', indent: 1 },
  { code: '*p = 117;', indent: 0 },
]

/** Blev linje i ramt af test 1 / test 2? Test 2 (condition falsk) springer linje 3 over. */
const HIT_T1 = [true, true, true, true]
const HIT_T2 = [true, true, false, true]

function Meter({ label, num, den, show, tone }: { label: string; num: number | null; den: number; show: boolean; tone: 'idle' | 'focus' | 'muted' }) {
  const frac = num === null ? 0 : num / den
  const pct = Math.round(frac * 100)
  return (
    <div className="lb-meter" data-tone={tone}>
      <div className="lb-meter-head">
        <span className="lb-meter-label">{label}</span>
        <span className="lb-meter-val">
          {num === null ? (
            '–'
          ) : (
            <>
              <span className="lb-meter-frac">
                {num}/{den}
              </span>{' '}
              <b>{pct} %</b>
            </>
          )}
        </span>
      </div>
      <div className="lb-meter-track">
        <motion.div
          className="lb-meter-fill"
          initial={false}
          animate={{ scaleX: show ? frac : 0 }}
          transition={t.travel}
        />
      </div>
    </div>
  )
}

function LineBranch({ step }: { step: number }) {
  const t1 = at(step, 1)
  const t2 = at(step, 3)
  const branchShown = at(step, 2)
  const final = at(step, 4)

  const lineNum = step === 0 ? 0 : 4
  const branchNum = step === 0 ? 0 : step === 1 ? null : step === 2 ? 1 : 2

  const runLabel = step === 0 ? 0 : step <= 2 ? 1 : step === 3 ? 2 : 3

  return (
    <div className="lb">
      <div className="lb-code">
        <div className="lb-code-head">
          <Swap
            show={runLabel}
            items={[
              <span key="0" className="lb-run">
                Ingen test kørt
              </span>,
              <span key="1" className="lb-run">
                <b>Test 1</b> · <code>condition</code> = true
              </span>,
              <span key="2" className="lb-run">
                <b>Test 2</b> · <code>condition</code> = false
              </span>,
              <span key="3" className="lb-run">
                <b>To tests</b> · T1 true, T2 false
              </span>,
            ]}
          />
          <span className="lb-cols" aria-hidden="true">
            <span>T1</span>
            <span>T2</span>
          </span>
        </div>
        <ol className="lb-lines">
          {LINES.map((l, i) => {
            const hit1 = t1 && HIT_T1[i]
            const hit2 = t2 && HIT_T2[i]
            const crash = t2 && i === 3
            const skipped = step === 3 && !HIT_T2[i]
            const hot = step === 1 ? hit1 : step === 3 ? hit2 : false
            const tone = crash ? 'neg' : skipped ? 'muted' : hot ? 'focus' : 'idle'
            return (
              <li key={i} className="lb-line" data-tone={tone}>
                <span className="lb-no">{i + 1}</span>
                <code style={{ paddingLeft: `${l.indent * 2}ch` }}>{l.code}</code>
                <span className="lb-mark">
                  <motion.span
                    initial={false}
                    animate={{ opacity: hit1 ? 1 : 0, scale: hit1 ? 1 : 0.6 }}
                    transition={hit1 ? stagger(i, 0.15, 0.28) : t.fade}
                  >
                    ✓
                  </motion.span>
                </span>
                <span className="lb-mark" data-neg={crash || undefined}>
                  <motion.span
                    initial={false}
                    animate={{ opacity: t2 ? 1 : 0, scale: t2 ? 1 : 0.6 }}
                    transition={t2 ? stagger(i, 0.15, 0.28) : t.fade}
                  >
                    {crash ? '✗' : hit2 ? '✓' : '–'}
                  </motion.span>
                </span>
              </li>
            )
          })}
        </ol>
        <div className="lb-crash">
          <Tag show={t2} tone="neg" wrap>
            T2: p er stadig 0 → null-dereference
          </Tag>
        </div>
      </div>

      <div className="lb-side">
        <Meter label="Line coverage" num={lineNum} den={4} show={t1} tone={step === 1 ? 'focus' : 'idle'} />
        <Meter
          label="Branch coverage"
          num={branchNum}
          den={2}
          show={branchShown}
          tone={step === 1 ? 'muted' : step === 2 || step === 3 ? 'focus' : 'idle'}
        />

        <div className="lb-decision" data-on={branchShown || undefined}>
          <code className="lb-if">if (condition)</code>
          <div className="lb-outs">
            <motion.span
              className="lb-out"
              data-tone={branchShown ? 'ok' : 'ghost'}
              initial={false}
              animate={{ opacity: branchShown ? 1 : 0.35 }}
              transition={t.fade}
            >
              sand <b>{branchShown ? '✓ T1' : ''}</b>
            </motion.span>
            <motion.span
              className="lb-out"
              data-tone={t2 ? 'ok' : branchShown ? 'neg' : 'ghost'}
              initial={false}
              animate={{ opacity: branchShown ? 1 : 0.35 }}
              transition={t.fade}
            >
              falsk <b>{t2 ? '✓ T2' : branchShown ? '✗' : ''}</b>
            </motion.span>
          </div>
          <Swap
            className="lb-q"
            show={!branchShown ? 0 : t2 ? 2 : 1}
            items={[
              <span key="n" />,
              <Tag key="q" tone="neg" wrap>
                Did we test for condition being false?
              </Tag>,
              <span key="a" className="lb-answer">
                Den falske gren er det, der fejler.
              </span>,
            ]}
          />
        </div>
      </div>

      <motion.div
        className="lb-short"
        initial={false}
        animate={{ opacity: final ? 1 : 0, y: final ? 0 : 6 }}
        transition={final ? t.settle : t.fade}
        aria-hidden={!final || undefined}
      >
        <span className="vcaps">Også branch coverage har mangler (s. 6)</span>
        <code className="lb-short-code">
          <span className="lb-nw">if (amount &gt; 100 ||</span> <span className="lb-nw">someCode() == 0)</span>{' '}
          <span className="lb-cmt lb-nw">// Was someCode() called?</span>
        </code>
        <p className="lb-short-text">
          Er <code>amount &gt; 100</code> sand, kortslutter <code>||</code>. Beslutningen kan være både sand og falsk — 100 % branch
          coverage — uden at <code>someCode()</code> nogensinde blev kaldt.
        </p>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'line-branch',
  title: 'Samme test, to slags coverage',
  steps: [
    {
      caption: 'Fire linjer C fra slidet og to målere. Ingen test er kørt endnu: begge står på 0 %.',
      hold: 1800,
    },
    {
      caption: '**Test 1** med `condition` sand rammer alle fire linjer én for én. **Line coverage**: 4/4 = 100 %.',
      hold: 2600,
    },
    {
      caption:
        '**Branch coverage** tæller udfaldene af `if (condition)`: sand er kørt, falsk er ikke. 1/2 = 50 % — hvad sker der, når `condition` er falsk?',
      hold: 3000,
    },
    {
      caption: '**Test 2** med `condition` falsk springer `p = &variable;` over. `*p = 117;` skriver gennem en null-pointer — fejlen viser sig.',
      hold: 3000,
    },
    {
      caption:
        'Efter to tests står begge på 100 %. Line coverage sagde 100 % allerede efter test 1; branch coverage pegede på den manglende gren. Men den ser ikke delbetingelser bag `||`.',
      hold: 3000,
    },
  ],
  Component: LineBranch,
}

export default viz
