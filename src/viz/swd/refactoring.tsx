import { motion } from 'motion/react'
import { Fragment, type CSSProperties, type ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { t } from '../kit/motion'
import './refactoring.css'

/* Refactoring.pdf s. 12 (getSpeed() med switchen på _type og opskriften “Move each
   leg of the conditional to an overriding method in a subclass. Make the original
   method abstract.”) og s. 13 (klassediagrammet: abstrakt Bird med getSpeed i
   kursiv, underklasserne European, African og Norwegian Blue). Markdown:
   swd/markdown/slides/SW4SWD-01_W09.1_Refactoring.md, afsnit 9.
   Navnene er slidens Java-navne (getSpeed, getBaseSpeed …). Minus er skrevet som
   almindeligt “-” (sliden har “–”). Sliden viser ikke koden efter refactoringen;
   hvert ben er flyttet uændret ned i sin underklasse. */

/** Brudpunkter efter parentes og punktum, så kode aldrig knækker midt i et navn. */
function brk(s: string): ReactNode {
  const parts = s.split(/(?<=[(.])(?=[A-Za-z_"])/)
  return parts.map((p, i) => (
    <Fragment key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </Fragment>
  ))
}

const LEGS = [
  'return getBaseSpeed();',
  'return getBaseSpeed() - getLoadFactor() * _numberOfCoconuts;',
  'return (_isNailed) ? 0 : getBaseSpeed(_voltage);',
]
const SUBS = ['European', 'African', 'Norwegian Blue']

/** Benet k er flyttet fra trin k + 2. */
const moved = (step: number, k: number) => step >= k + 2
const hot = (step: number, k: number) => step === k + 2
const ABSTRACT = 5
const LAST = 6

type Ln = { ind: number; text?: string; caseOf?: number; leg?: number }
const BODY: Ln[] = [
  { ind: 0, text: 'switch (_type) {' },
  { ind: 1, text: 'case EUROPEAN:', caseOf: 0 },
  { ind: 2, leg: 0 },
  { ind: 1, text: 'case AFRICAN:', caseOf: 1 },
  { ind: 2, leg: 1 },
  { ind: 1, text: 'case NORWEGIAN_BLUE:', caseOf: 2 },
  { ind: 2, leg: 2 },
  { ind: 0, text: '}' },
  { ind: 0, text: 'throw new RuntimeException("Should be unreachable");' },
]

/** Et ben af switchen. Samme layoutId i Bird og i underklassen, så det rejser. */
function Leg({ k, step }: { k: number; step: number }) {
  return (
    <motion.code
      layoutId={`rf-leg-${k}`}
      layout="position"
      transition={t.travel}
      className="rf-leg"
      data-hot={hot(step, k) || undefined}
      data-moved={moved(step, k) || undefined}
    >
      {brk(LEGS[k])}
    </motion.code>
  )
}

function Line({ ln, step, ghost }: { ln: Ln; step?: number; ghost?: boolean }) {
  const style = { '--ind': ln.ind } as CSSProperties
  if (ln.leg !== undefined) {
    const k = ln.leg
    if (ghost || step === undefined) {
      return (
        <div className="rf-ln" style={style}>
          <code className="rf-leg">{brk(LEGS[k])}</code>
        </div>
      )
    }
    return (
      <div className="rf-ln rf-ln-slot" style={style}>
        {/* Når benet er rejst, står et gennemstreget aftryk tilbage. */}
        <code className="rf-leg rf-left" aria-hidden={!moved(step, k) || undefined} data-on={moved(step, k) || undefined}>
          {brk(LEGS[k])}
        </code>
        {!moved(step, k) && <Leg k={k} step={step} />}
      </div>
    )
  }
  const gone = ln.caseOf !== undefined && step !== undefined && moved(step, ln.caseOf)
  const now = ln.caseOf !== undefined && step !== undefined && hot(step, ln.caseOf)
  return (
    <div className="rf-ln" style={style}>
      <code className="rf-txt" data-gone={gone || undefined} data-now={now || undefined}>
        {brk(ln.text!)}
      </code>
    </div>
  )
}

const collapse = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: on ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 },
  transition: on ? t.settle : { ...t.settle, delay },
})

/** Bird før: konkret klasse med felt og switch. */
function BirdBefore({ step, ghost }: { step: number; ghost?: boolean }) {
  const live = !ghost && step < ABSTRACT
  const body = BODY.map((ln, i) => <Line key={i} ln={ln} step={ghost ? undefined : step} ghost={ghost} />)
  if (ghost) {
    return (
      <div className="rf-cls rf-bird rf-ghost" aria-hidden="true">
        <div className="rf-name">Bird</div>
        <div className="rf-comp rf-attrs">
          <code>_type</code>
        </div>
        <div className="rf-comp rf-ops">
          <code className="rf-op">getSpeed()</code>
          <div className="rf-body">{body}</div>
        </div>
      </div>
    )
  }
  return (
    <motion.div
      className="rf-cls rf-bird rf-before"
      aria-hidden={!live || undefined}
      initial={false}
      animate={{ opacity: live ? 1 : 0 }}
      transition={live ? t.fade : { ...t.fade, delay: 0.55 }}
    >
      <div className="rf-name">Bird</div>
      <div className="rf-comp rf-attrs">
        <motion.div className="rf-clip" {...collapse(live)}>
          <code>_type</code>
        </motion.div>
      </div>
      <div className="rf-comp rf-ops">
        <code className="rf-op">getSpeed()</code>
        <motion.div className="rf-clip" {...collapse(live, 0.1)}>
          <div className="rf-body">{body}</div>
        </motion.div>
      </div>
    </motion.div>
  )
}

/** Bird efter: abstrakt klasse og abstrakt operation i kursiv (s. 13). */
function BirdAfter({ step }: { step: number }) {
  const on = at(step, ABSTRACT)
  return (
    <motion.div
      className="rf-cls rf-bird rf-after"
      data-now={step === ABSTRACT || undefined}
      aria-hidden={!on || undefined}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={on ? { ...t.fade, delay: 0.55 } : t.fade}
    >
      <div className="rf-name rf-abstract">Bird</div>
      <div className="rf-comp rf-attrs" />
      <div className="rf-comp rf-ops">
        <code className="rf-op rf-abstract">getSpeed()</code>
      </div>
    </motion.div>
  )
}

function Sub({ k, step }: { k: number; step: number }) {
  const on = at(step, 1)
  const has = moved(step, k)
  return (
    <div className="rf-sub-cell" data-last={k === 2 || undefined}>
      <motion.div className="rf-trunk" initial={false} animate={{ scaleY: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={on ? { ...t.travel, duration: 0.5, delay: 0.1 * k } : t.fade} />
      <motion.div className="rf-stub" initial={false} animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }} transition={on ? { ...t.travel, duration: 0.4, delay: 0.3 + 0.1 * k } : t.fade} />
      <motion.div
        className="rf-cls rf-sub"
        data-now={hot(step, k) || undefined}
        aria-hidden={!on || undefined}
        initial={false}
        animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
        transition={on ? { ...t.place, delay: 0.25 + 0.08 * k } : t.fade}
      >
        <div className="rf-name">{SUBS[k]}</div>
        <div className="rf-comp rf-attrs" />
        <div className="rf-comp rf-ops">
          <motion.code className="rf-op" initial={false} animate={{ opacity: has ? 1 : 0 }} transition={has ? { ...t.fade, delay: 0.6 } : t.fade}>
            getSpeed()
          </motion.code>
          <div className="rf-slot" data-has={has || undefined}>
            <div className="rf-ln" aria-hidden="true">
              <code className="rf-leg rf-hold">{brk(LEGS[k])}</code>
            </div>
            <div className="rf-ln">{has && <Leg k={k} step={step} />}</div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

function Refactoring({ step }: { step: number }) {
  const gen = at(step, 1)
  return (
    <div className="rf">
      <div className="rf-top">
        <BirdBefore step={step} ghost />
        <BirdBefore step={step} />
        <div className="rf-after-wrap">
        <div className="rf-after-note">
          <motion.div
            className="rf-removed"
            aria-hidden={!at(step, ABSTRACT) || undefined}
            initial={false}
            animate={{ opacity: at(step, ABSTRACT) ? 1 : 0 }}
            transition={at(step, ABSTRACT) ? { ...t.fade, delay: 0.3 } : t.fade}
          >
            <span className="rf-removed-h">fjernet fra Bird</span>
            <code>_type</code>
            <code>switch (_type) {'{ … }'}</code>
            <code>throw new RuntimeException(…)</code>
          </motion.div>
          <motion.blockquote
            className="rf-recipe"
            aria-hidden={!at(step, ABSTRACT) || undefined}
            initial={false}
            animate={{ opacity: at(step, ABSTRACT) ? 1 : 0 }}
            transition={at(step, ABSTRACT) ? { ...t.fade, delay: 0.8 } : t.fade}
          >
            <p>
              “Move each leg of the conditional to an overriding method in a subclass.{' '}
              <span className="rf-recipe-hl" data-now={step === ABSTRACT || undefined}>
                Make the original method abstract.
              </span>
              ”
            </p>
            <cite>Fowler, Refactoring.pdf s. 12</cite>
          </motion.blockquote>
          <motion.span
            className="rf-newtype"
            aria-hidden={!at(step, LAST) || undefined}
            initial={false}
            animate={at(step, LAST) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
            transition={at(step, LAST) ? t.place : t.fade}
          >
            ny fugletype = ny klasse, ikke en ny <code>case</code>
          </motion.span>
        </div>
        <BirdAfter step={step} />
        </div>
      </div>

      {/* Generalisering: én hul trekant ved Bird, fælles linje ned til de tre. */}
      <div className="rf-gen" aria-hidden="true">
        <motion.svg className="rf-tri" viewBox="0 0 16 13" initial={false} animate={{ opacity: gen ? 1 : 0 }} transition={gen ? { ...t.fade, delay: 0.5 } : t.fade}>
          <path d="M8 1 15 12 1 12Z" />
        </motion.svg>
        <motion.div className="rf-stem" initial={false} animate={{ scaleY: gen ? 1 : 0, opacity: gen ? 1 : 0 }} transition={gen ? { ...t.travel, duration: 0.4 } : t.fade} />
        <motion.div className="rf-bar" initial={false} animate={{ scaleX: gen ? 1 : 0, opacity: gen ? 1 : 0 }} transition={gen ? { ...t.travel, duration: 0.5, delay: 0.1 } : t.fade} />
        {[0, 1, 2].map((k) => (
          <motion.div
            key={k}
            className="rf-drop"
            data-k={k}
            initial={false}
            animate={{ scaleY: gen ? 1 : 0, opacity: gen ? 1 : 0 }}
            transition={gen ? { ...t.travel, duration: 0.3, delay: 0.35 } : t.fade}
          />
        ))}
      </div>

      <div className="rf-subs">
        {[0, 1, 2].map((k) => (
          <Sub key={k} k={k} step={step} />
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'refactoring',
  title: 'Switchen bliver til underklasser',
  steps: [
    {
      caption: '`getSpeed()` vælger adfærd ud fra `_type` — én metode kender alle fugletyper. Et nyt ben i switchen for hver ny type.',
      hold: 2800,
    },
    {
      caption: 'Opret en underklasse af `Bird` pr. ben i switchen: `European`, `African` og `Norwegian Blue`. Switchen er uændret.',
      hold: 2200,
    },
    {
      caption: 'Benet for `EUROPEAN` flytter ned og bliver en **overskrivende** `getSpeed()` i `European`.',
      hold: 2400,
    },
    {
      caption: '`African` får sit eget udtryk — samme beregning som før, tegn for tegn.',
      hold: 2400,
    },
    {
      caption: 'Benet for `NORWEGIAN_BLUE` flytter til `Norwegian Blue`. Alle tre ben er flyttet; switchen er tom.',
      hold: 2400,
    },
    {
      caption: '“Make the original method abstract”: switchen, `_type` og den uopnåelige exception forsvinder. `Bird` og `getSpeed` står i *kursiv* — abstrakte.',
      hold: 3000,
    },
    {
      caption: 'Samme adfærd, ny form: hver fugletype beregner sin egen fart. En ny fugletype er en ny klasse.',
      hold: 2600,
    },
  ],
  Component: Refactoring,
}

export default viz
