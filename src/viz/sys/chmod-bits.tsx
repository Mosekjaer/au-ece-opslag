import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './chmod-bits.css'

/* 01.2-Week_1_-_Introduction_to_Operating_Systems.pdf s. 23 (ls -l-linjen for run.py,
   felterne file type / user / group / others), s. 24 (`chmod 764 run.py` ≡ `chmod o-w
   run.py`) og s. 25 (r = 4, w = 2, x = 1; rwxrw-rw- = 111 110 110 = 766). */

interface Trio {
  id: 'u' | 'g' | 'o'
  who: string
  owner: string
  before: string
  after: string
}

const TRIOS: Trio[] = [
  { id: 'u', who: 'user', owner: 'dan', before: 'rwx', after: 'rwx' },
  { id: 'g', who: 'group', owner: 'jcrew', before: 'rw-', after: 'rw-' },
  { id: 'o', who: 'others', owner: 'alle andre', before: 'rw-', after: 'r--' },
]
const WEIGHT = [4, 2, 1]
const digit = (s: string) => [...s].reduce((sum, c, i) => sum + (c === '-' ? 0 : WEIGHT[i]), 0)

function Chmod({ step }: { step: number }) {
  const split = at(step, 1)
  const bits = at(step, 2)
  const octal = at(step, 3)
  const changed = at(step, 4)

  return (
    <div className="cb">
      <div className="cb-line mono" aria-label="ls -l">
        <span className="cb-prompt">$ ls -l</span>
        <span className="cb-out">
          <Swap
            show={changed ? 1 : 0}
            items={[
              <span key="b">
                <span className="cb-perm">-rwxrw-rw-</span> 2 dan jcrew 1132 Apr 15 21:22 run.py
              </span>,
              <span key="a">
                <span className="cb-perm">-rwxrw-r--</span> 2 dan jcrew 1132 Apr 15 21:22 run.py
              </span>,
            ]}
          />
        </span>
      </div>

      <div className="cb-groups" data-split={split || undefined}>
        <div className="cb-group is-type">
          <motion.span className="cb-who" initial={false} animate={{ opacity: split ? 1 : 0 }} transition={t.fade}>
            type
          </motion.span>
          <div className="cb-chars">
            <span className="cb-char mono">-</span>
          </div>
          <motion.span className="cb-sub" initial={false} animate={{ opacity: split ? 1 : 0 }} transition={t.fade}>
            fil
          </motion.span>
        </div>

        {TRIOS.map((tr, g) => {
          const isO = tr.id === 'o'
          const chars = changed ? tr.after : tr.before
          return (
            <div key={tr.id} className="cb-group" data-hot={(isO && step === 4) || undefined}>
              <motion.span
                className="cb-who"
                initial={false}
                animate={{ opacity: split ? 1 : 0 }}
                transition={split ? stagger(g, 0.1, 0.1) : t.fade}
              >
                {tr.who}
              </motion.span>

              <div className="cb-chars">
                {[...tr.before].map((c, i) => {
                  const flip = isO && tr.before[i] !== tr.after[i]
                  return (
                    <span key={i} className="cb-char mono" data-tone={flip && changed ? 'neg' : undefined}>
                      <Swap show={flip && changed ? 1 : 0} items={[<span key="b">{c}</span>, <span key="a">{tr.after[i]}</span>]} />
                    </span>
                  )
                })}
              </div>

              <motion.span
                className="cb-sub"
                initial={false}
                animate={{ opacity: split ? 1 : 0 }}
                transition={split ? stagger(g, 0.1, 0.1) : t.fade}
              >
                {tr.owner}
              </motion.span>

              <div className="cb-weights mono">
                {WEIGHT.map((w, i) => (
                  <motion.span
                    key={i}
                    initial={false}
                    animate={{ opacity: bits ? 1 : 0 }}
                    transition={bits ? stagger(g * 3 + i, 0, 0.04) : t.fade}
                  >
                    {w}
                  </motion.span>
                ))}
              </div>

              <div className="cb-bits mono">
                {[...tr.before].map((c, i) => {
                  const b = c === '-' ? '0' : '1'
                  const a = tr.after[i] === '-' ? '0' : '1'
                  const flip = b !== a && changed
                  return (
                    <motion.span
                      key={i}
                      className="cb-bit"
                      data-tone={flip ? 'neg' : chars[i] === '-' ? 'off' : 'on'}
                      initial={false}
                      animate={bits ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                      transition={bits ? stagger(g * 3 + i, 0.1, 0.05) : t.fade}
                    >
                      <Swap show={flip ? 1 : 0} items={[<span key="b">{b}</span>, <span key="a">{a}</span>]} />
                    </motion.span>
                  )
                })}
              </div>

              <motion.div
                className="cb-digit mono"
                data-tone={isO && changed ? 'hot' : undefined}
                initial={false}
                animate={octal ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
                transition={octal ? stagger(g, 0, 0.12) : t.fade}
              >
                <Swap
                  show={isO && changed ? 1 : 0}
                  items={[<span key="b">{digit(tr.before)}</span>, <span key="a">{digit(tr.after)}</span>]}
                />
              </motion.div>
            </div>
          )
        })}
      </div>

      <div className="cb-result">
        <motion.span className="cb-oct" initial={false} animate={{ opacity: octal ? 1 : 0 }} transition={t.fade}>
          <span className="cb-rlabel">oktalt</span>
          <Tag tone={changed ? 'idle' : 'focus'}>766</Tag>
          <motion.span
            className="cb-to"
            initial={false}
            animate={{ opacity: changed ? 1 : 0 }}
            transition={changed ? t.place : t.fade}
          >
            → <Tag tone="focus">764</Tag>
          </motion.span>
        </motion.span>
        <motion.code
          className="cb-cmd"
          initial={false}
          animate={{ opacity: changed ? 1 : 0 }}
          transition={t.fade}
        >
          chmod 764 run.py
        </motion.code>
        <motion.code
          className="cb-cmd is-alt"
          initial={false}
          animate={{ opacity: at(step, 5) ? 1 : 0 }}
          transition={t.fade}
        >
          ≡ chmod o-w run.py
        </motion.code>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'chmod-bits',
  title: 'Fra rwxrw-rw- til chmod 764',
  steps: [
    {
      caption: '`ls -l` viser rettighederne for `run.py` som ti tegn forrest på linjen.',
      hold: 2000,
    },
    {
      caption: 'Første tegn er **filtypen** (`-` for fil). Resten er tre grupper på tre: **user** (`dan`), **group** (`jcrew`) og **others**.',
      hold: 2800,
    },
    {
      caption: 'Hvert bogstav er én bit: sat (`1`) eller `-` (`0`). Pladserne vejer `r = 4`, `w = 2` og `x = 1`.',
      hold: 2800,
    },
    {
      caption: 'Summen af hver gruppe er ét oktalt ciffer: `111 110 110` bliver **766**.',
      hold: 2600,
    },
    {
      caption: '*Others* må ikke længere skrive. Deres `w`-bit slås fra, og cifferet går fra 6 til 4: `chmod 764 run.py`.',
      hold: 3000,
    },
    {
      caption:
        'Samme ændring symbolsk: `chmod o-w run.py`. Den oktale form sætter alle ni bits på én gang, den symbolske ændrer kun én.',
      hold: 3000,
    },
  ],
  Component: Chmod,
}

export default viz
