import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Node, Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './v-model.css'

/* Introduction.pdf s. 17 (V-modellen), s. 19 (mantraet); Integrationtest-introduction.pdf s. 2
   (samme V). Ugerne er fra lektionsplanen i emnets tekst. */

const LEVELS = [
  { design: 'Requirements', test: 'Accept testing', week: 'uge 13' },
  { design: 'System specification', test: 'System testing', week: 'uge 13' },
  { design: 'System design', test: 'Integration testing', week: 'uge 9' },
  { design: 'Component design', test: 'Unit test', week: 'uge 1–5' },
] as const

const LAST = 5

/** Vandret dobbeltpil: tegnes ind fra midten, pilehoveder toner frem. */
function Pair({ on, tone }: { on: boolean; tone: 'focus' | 'idle' }) {
  return (
    <div className="vm-pair" data-tone={on ? tone : 'off'} aria-hidden="true">
      <motion.span
        className="vm-pair-line"
        initial={false}
        animate={{ scaleX: on ? 1 : 0 }}
        transition={on ? { ...t.travel, duration: 0.55 } : t.fade}
      />
      <motion.span
        className="vm-head is-l"
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={on ? { ...t.fade, delay: 0.35 } : t.fade}
      />
      <motion.span
        className="vm-head is-r"
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={on ? { ...t.fade, delay: 0.35 } : t.fade}
      />
    </div>
  )
}

function VModel({ step }: { step: number }) {
  const done = at(step, LAST)
  return (
    <div className="vm">
      <div className="vm-head-row">
        <span className="vcaps">Design · ben nedad ↓</span>
        <span className="vcaps vm-right">Test · ben opad ↑</span>
      </div>

      {LEVELS.map((l, i) => {
        // Højre ben bygges nedefra: Unit test (i = 3) på trin 1 … Accept testing (i = 0) på trin 4.
        const builtAt = 4 - i
        const built = at(step, builtAt)
        const now = step === builtAt
        return (
          <div key={l.design} className="vm-row" style={{ ['--i' as string]: i }}>
            <Node className="vm-node" title={l.design} tone={now ? 'focus' : 'idle'} />
            <Pair on={built} tone={now ? 'focus' : 'idle'} />
            <Node className="vm-node" tone={built ? (now ? 'focus' : done ? 'ok' : 'idle') : 'ghost'}>
              <motion.div
                className="vnode-title"
                initial={false}
                animate={{ opacity: built ? 1 : 0 }}
                transition={built ? t.settle : t.fade}
              >
                {l.test}
              </motion.div>
              <div className="vm-week">
                <Tag show={done}>{l.week}</Tag>
              </div>
            </Node>
          </div>
        )
      })}

      <div className="vm-row vm-bottom" style={{ ['--i' as string]: 4 }}>
        <Node className="vm-node" title="Implement component" tone="idle" />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'v-model',
  title: 'Hvert designniveau har sit testniveau',
  steps: [
    {
      caption: 'V-modellens venstre ben går **ned**: fra krav over systemspecifikation og design til implementering af komponenten.',
      hold: 2400,
    },
    { caption: 'Højre ben bygges **op** nedefra. **Unit test** verificerer komponentdesignet.', hold: 1900 },
    { caption: '**Integration testing** verificerer systemdesignet.', hold: 1500 },
    { caption: '**System testing** verificerer systemspecifikationen.', hold: 1500 },
    { caption: '**Accept testing** verificerer kravene. Hvert designniveau har nu sit testniveau.', hold: 2000 },
    {
      caption:
        'Kurset følger højre ben opad: unit test i uge 1–5, integrationstest i uge 9, system- og accepttest i uge 13. Mantraet er *test early, test often, test enough*.',
      hold: 3000,
    },
  ],
  Component: VModel,
}

export default viz
