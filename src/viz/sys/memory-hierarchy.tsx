import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './memory-hierarchy.css'

/* 01.1b-SW3SYS-Introduction-to-Computing-Systems.pdf s. 5 (pyramiden, bog fig. 1.6:
   volatile over den stiplede linje, nonvolatile under) og s. 6 (tabellen, bog fig. 1.14:
   typical size, access time, managed by). Tallene er tabellens. */

interface Level {
  id: string
  name: string
  size: string
  time: string
  managed: string
  /** Trin hvor niveauet lander. */
  at: number
}

const LEVELS: Level[] = [
  { id: 'reg', name: 'registers', size: '< 1 KB', time: '0,25–0,5 ns', managed: 'compiler', at: 0 },
  { id: 'cache', name: 'cache', size: '< 16 MB', time: '0,5–25 ns', managed: 'hardware', at: 1 },
  { id: 'ram', name: 'main memory', size: '< 64 GB', time: '80–250 ns', managed: 'operating system', at: 1 },
  { id: 'ssd', name: 'solid-state', size: '< 1 TB', time: '25.000–50.000 ns', managed: 'operating system', at: 2 },
  { id: 'disk', name: 'magnetic disk', size: '< 10 TB', time: '5.000.000 ns', managed: 'operating system', at: 2 },
]

function Hierarchy({ step }: { step: number }) {
  const axis = at(step, 3)
  const managed = at(step, 4)
  const volatile = at(step, 2)

  return (
    <div className="mh">
      <motion.div
        className="mh-end is-top"
        initial={false}
        animate={{ opacity: axis ? 1 : 0 }}
        transition={t.fade}
      >
        <span className="mh-arrow" aria-hidden="true">↑</span> hurtigere, dyrere, mindre
      </motion.div>

      <div className="mh-body">
        <div className="mh-axis" aria-hidden="true">
          <motion.div
            className="mh-axis-line"
            initial={false}
            animate={{ scaleY: axis ? 1 : 0 }}
            transition={axis ? t.travel : t.fade}
          />
        </div>

        <div className="mh-table">
          <div className="mh-row mh-head">
            <span>niveau</span>
            <span>størrelse</span>
            <span>adgangstid</span>
            <motion.span initial={false} animate={{ opacity: managed ? 1 : 0 }} transition={t.fade}>
              managed by
            </motion.span>
          </div>

          {LEVELS.map((l, i) => {
            const shown = at(step, l.at)
            const fresh = step === l.at && step <= 2
            const mTone =
              step === 4 ? (l.managed === 'compiler' ? 'reg' : l.managed === 'hardware' ? 'hw' : 'os') : 'none'
            return (
              <div key={l.id} className="mh-slot">
                {l.id === 'ssd' && (
                  <div className="mh-split">
                    <motion.span
                      className="mh-split-line"
                      initial={false}
                      animate={{ scaleX: volatile ? 1 : 0 }}
                      transition={volatile ? t.travel : t.fade}
                    />
                    <motion.span
                      className="mh-split-label"
                      initial={false}
                      animate={{ opacity: volatile ? 1 : 0 }}
                      transition={t.fade}
                    >
                      volatile ↑ · nonvolatile ↓
                    </motion.span>
                  </div>
                )}
                <motion.div
                  className="mh-row mh-level"
                  data-tone={fresh ? 'focus' : 'idle'}
                  initial={false}
                  animate={shown ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                  transition={shown ? stagger(i, 0, 0.12) : t.fade}
                >
                  <span className="mh-name">
                    <span className="mh-num">{i + 1}</span>
                    {l.name}
                  </span>
                  <span className="mh-cell" data-k="størrelse">
                    {l.size}
                  </span>
                  <span className="mh-cell" data-k="adgangstid">
                    {l.time}
                  </span>
                  <motion.span
                    className="mh-cell mh-managed"
                    data-k="managed by"
                    data-m={mTone}
                    initial={false}
                    animate={{ opacity: managed ? 1 : 0 }}
                    transition={managed ? stagger(i, 0.05, 0.08) : t.fade}
                  >
                    {l.managed}
                  </motion.span>
                </motion.div>
              </div>
            )
          })}
        </div>
      </div>

      <motion.div
        className="mh-end is-bottom"
        initial={false}
        animate={{ opacity: axis ? 1 : 0 }}
        transition={t.fade}
      >
        <span className="mh-arrow" aria-hidden="true">↓</span> større, billigere, langsommere
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'memory-hierarchy',
  title: 'Hukommelseshierarkiet fra registre til disk',
  steps: [
    {
      caption: 'Øverst sidder **registrene** inde i CPU’en: under 1 KB og 0,25–0,5 ns pr. adgang.',
      hold: 2000,
    },
    {
      caption: 'Under dem **cache** og **main memory**. Hvert niveau er større end det over og tager længere tid at nå.',
      hold: 2400,
    },
    {
      caption:
        'Den stiplede linje skiller *volatile* fra *nonvolatile*. Under den ligger **SSD** og **magnetisk disk**, der beholder data uden strøm.',
      hold: 2800,
    },
    {
      caption:
        'Opad bliver lageret hurtigere og dyrere pr. byte, nedad større og billigere. Fra register til disk vokser adgangstiden ca. 20 millioner gange.',
      hold: 3000,
    },
    {
      caption:
        '**Managed by**: registre styres af *compileren*, cache af *hardwaren*, og alt fra main memory og ned af *operativsystemet*.',
      hold: 3000,
    },
    {
      caption:
        'Hele tabellen fra slide 6 (bogens fig. 1.14). Hvert niveau er *backed by* et langsommere niveau under sig, så samme værdi kan ligge flere steder på én gang.',
      hold: 3000,
    },
  ],
  Component: Hierarchy,
}

export default viz
