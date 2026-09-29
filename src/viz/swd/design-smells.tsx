import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './design-smells.css'

/* Design Smells - The Odors of Rotting Software.pdf s. 5 (rigidity og fragility:
   citaterne om A, B, C og D, symptom og problem). Markdown:
   swd/markdown/slides/SW4SWD-01_W02a_Design_Smells.md, afsnit 4.
   Rigidity-strukturen følger citatet: B har forventninger til A hårdkodet og
   bruger C og D. Sliden siger ikke, hvordan komponenterne hænger sammen i
   fragility-citatet; samme struktur er genbrugt og mærket illustrativ. */

type Id = 'A' | 'B' | 'C' | 'D'
type St = 'idle' | 'chg' | 'must' | 'fixed' | 'broken'
type Kind = 'rig' | 'fra'

const W = 100
const H = 50
const BOX: Record<Id, [number, number]> = {
  A: [100, 0],
  B: [100, 92],
  C: [14, 186],
  D: [186, 186],
}

/** Afhængighederne (B → X), tegnet fra B mod det, B afhænger af. */
const DEP: { to: Id; d: string; head: [number, number]; dir: 'up' | 'down'; wave: string }[] = [
  { to: 'A', d: 'M150 92 V50', head: [150, 50], dir: 'up', wave: 'M150 50 V92' },
  { to: 'C', d: 'M100 117 H64 V186', head: [64, 186], dir: 'down', wave: 'M100 117 H64 V186' },
  { to: 'D', d: 'M200 117 H236 V186', head: [236, 186], dir: 'down', wave: 'M200 117 H236 V186' },
]

const MARK: Record<St, string> = {
  idle: '',
  chg: '✎ ændres',
  must: '✎ skal ændres',
  fixed: '✓ rettet',
  broken: '✗ gik i stykker',
}

/** Tilstand pr. komponent pr. trin, og hvornår markeringen lander (s) i det trin, hvor den opstår. */
function states(kind: Kind, step: number): Record<Id, { s: St; at: number }> {
  if (kind === 'rig') {
    return {
      A: { s: step >= 1 ? 'chg' : 'idle', at: 0.05 },
      B: { s: step >= 2 ? 'must' : 'idle', at: step === 2 ? 0.6 : 0 },
      C: { s: step >= 2 ? 'must' : 'idle', at: step === 2 ? 1.3 : 0 },
      D: { s: step >= 2 ? 'must' : 'idle', at: step === 2 ? 1.3 : 0 },
    }
  }
  return {
    A: { s: step >= 3 ? 'fixed' : 'idle', at: 0.05 },
    B: { s: step >= 4 ? 'fixed' : step >= 3 ? 'broken' : 'idle', at: step === 3 ? 0.75 : 0.05 },
    C: { s: step >= 4 ? 'broken' : 'idle', at: step === 4 ? 0.95 : 0 },
    D: { s: step >= 4 ? 'broken' : 'idle', at: step === 4 ? 0.95 : 0 },
  }
}

/** Bølgen langs en afhængighed: hvornår den er tegnet, og forsinkelsen i det trin, den tegnes. */
function wave(kind: Kind, to: Id, step: number): { on: boolean; delay: number } {
  if (kind === 'rig') {
    const on = step >= 2
    return { on, delay: step === 2 ? (to === 'A' ? 0.1 : 0.75) : 0 }
  }
  if (to === 'A') return { on: step >= 3, delay: step === 3 ? 0.25 : 0 }
  return { on: step >= 4, delay: step === 4 ? 0.4 : 0 }
}

function head([x, y]: [number, number], dir: 'up' | 'down') {
  const s = dir === 'up' ? 1 : -1
  return `M${x - 5} ${y + 8 * s} L${x} ${y} L${x + 5} ${y + 8 * s}`
}

function Panel({ kind, step }: { kind: Kind; step: number }) {
  const st = states(kind, step)
  const rig = kind === 'rig'
  const opacity = rig ? (step === 3 || step === 4 ? 0.42 : 1) : step <= 2 ? 0.3 : 1
  const countOn = rig ? step >= 2 : step >= 4
  return (
    <motion.section
      className="swd-ds-panel"
      data-kind={kind}
      initial={false}
      animate={{ opacity }}
      transition={t.recede}
    >
      <h4 className="swd-ds-h">{rig ? 'Rigidity' : 'Fragility'}</h4>
      <svg className="swd-ds-svg" viewBox="-2 -2 304 242" aria-hidden="true">
        {DEP.map((dp) => {
          const w = wave(kind, dp.to, step)
          return (
            <motion.path
              key={`w-${dp.to}`}
              className="swd-ds-trail"
              d={dp.wave}
              initial={false}
              animate={{ pathLength: w.on ? 1 : 0, opacity: w.on ? 1 : 0 }}
              transition={w.on ? { ...t.travel, duration: 0.6, delay: w.delay } : t.fade}
            />
          )
        })}
        {DEP.map((dp) => {
          const w = wave(kind, dp.to, step)
          const style = { '--d': `${w.delay + 0.3}s` } as CSSProperties
          return (
            <g key={`d-${dp.to}`} className="swd-ds-dep" data-on={w.on || undefined} style={style}>
              <path className="swd-ds-line" d={dp.d} />
              <path className="swd-ds-head" d={head(dp.head, dp.dir)} />
            </g>
          )
        })}
        <text className="swd-ds-deplabel" x={158} y={67}>
          <tspan x={158}>hårdkodede</tspan>
          <tspan x={158} dy="1.2em">
            forventninger
          </tspan>
        </text>
        {(Object.keys(BOX) as Id[]).map((id) => {
          const [x, y] = BOX[id]
          const { s, at } = st[id]
          const style = { '--d': `${at}s` } as CSSProperties
          return (
            <g key={id} className="swd-ds-box" data-s={s} style={style}>
              <rect x={x} y={y} width={W} height={H} rx={3} />
              <text className="swd-ds-name" x={x + W / 2} y={y + 19}>
                {id}
              </text>
              <motion.text
                key={s}
                className="swd-ds-mark"
                x={x + W / 2}
                y={y + 37}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ ...t.fade, delay: at }}
              >
                {MARK[s]}
              </motion.text>
            </g>
          )
        })}
      </svg>

      <motion.p className="swd-ds-count" initial={false} animate={{ opacity: countOn ? 1 : 0 }} transition={countOn ? { ...t.fade, delay: step === (rig ? 2 : 4) ? 1.5 : 0 } : t.fade}>
        {rig ? (
          <>
            1 ønsket ændring <span aria-hidden="true">→</span> 4 ændrede komponenter
          </>
        ) : (
          <>
            2 rettelser <span aria-hidden="true">→</span> 3 nye fejl
          </>
        )}
      </motion.p>

      <motion.dl className="swd-ds-sp" initial={false} animate={{ opacity: step >= 5 ? 1 : 0 }} transition={t.fade}>
        <dt>Symptom</dt>
        <dd>{rig ? '“apparently simple changes causes a cascade of changes in related component”' : '“Fixing one problem introduces more problems”'}</dd>
        <dt>Problem</dt>
        <dd>{rig ? '“Managers and/or programmers don’t dare to make non-critical changes”' : '“Programmers cannot trust that errors isn’t introduced.”'}</dd>
      </motion.dl>
      {!rig && (
        <motion.p className="swd-ds-note" initial={false} animate={{ opacity: step >= 3 ? 1 : 0 }} transition={t.fade}>
          Illustrativt: sliden viser ikke strukturen bag fragility-citatet; den er genbrugt fra rigidity.
        </motion.p>
      )}
    </motion.section>
  )
}

function DesignSmells({ step }: { step: number }) {
  return (
    <div className="swd-ds">
      <div className="swd-ds-panels">
        <Panel kind="rig" step={step} />
        <Panel kind="fra" step={step} />
      </div>
      <motion.p className="swd-ds-bottom" initial={false} animate={{ opacity: step >= 5 ? 1 : 0 }} transition={t.fade}>
        En ændring <em>kræver</em> ændringer (rigidity) — en ændring <em>knækker</em> noget (fragility).
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'design-smells',
  title: 'En ændring der breder sig',
  steps: [
    { caption: 'Fire komponenter. `B` bruger `C` og `D` og har forventninger til `A` hårdkodet.', hold: 2400 },
    { caption: '**Rigidity.** En tilsyneladende simpel ændring i `A` …', hold: 1800 },
    { caption: '… kræver ændringer i `B`, `C` og `D`. Så tør ingen røre det, der ikke er kritisk.', hold: 3000 },
    { caption: '**Fragility.** Rettelsen af `A` så simpel ud — men `B` gik i stykker.', hold: 2600 },
    { caption: 'Rettelsen af `B` knækker `C` og `D`. Ingen kan længere stole på, at en rettelse er sikker.', hold: 3000 },
    { caption: 'Begge er ændringer, der breder sig. Ved rigidity *kræver* ændringen andre ændringer; ved fragility *knækker* den noget.', hold: 3000 },
  ],
  Component: DesignSmells,
}

export default viz
