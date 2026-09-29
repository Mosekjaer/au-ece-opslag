import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './prj-allokering.css'

/* Tælleren (Counter) fra System Design and Interfaces-F21.pdf:
   slide 24 = logiske blokke, slide 29 = «allocate» logisk → fysisk.
   Peckol kap. 9 (s. 385–386, fig. 9.26–9.27): hvad der oplagt er HW, hvorfor
   clock og counter-divider bliver HW (frekvensen), og de SW-tasks, der kører på
   microprocessoren. Slide 29 er svær at aflæse for Time Base / Input / Measure,
   så de vises som én gruppe mod de to fysiske blokke. */

interface Row {
  id: string
  at: number
  logical: string[]
  physical: { name: string; hw: 'hw' | 'hwsw' | 'grey' }[]
  note?: string
}

const ROWS: Row[] = [
  {
    id: 'ui',
    at: 2,
    logical: ['User I/F'],
    physical: [
      { name: 'Display', hw: 'hw' },
      { name: 'Front Panel Controls', hw: 'hw' },
    ],
  },
  { id: 'pw', at: 2, logical: ['Power System'], physical: [{ name: 'Power System', hw: 'hw' }] },
  {
    id: 'fmt',
    at: 3,
    logical: ['Data Format and Output'],
    physical: [{ name: 'Microprocessor', hw: 'hwsw' }],
  },
  {
    id: 'meas',
    at: 4,
    logical: ['Time Base', 'Input', 'Measure'],
    physical: [
      { name: 'Counter – Divider Chain and Control', hw: 'grey' },
      { name: 'Clock System', hw: 'grey' },
    ],
    note: 'kunne være SW — frekvensen gør det til HW',
  },
]

const TASKS = ['Front panel', 'Measurement', 'Output', 'Display', 'Master control']
const FINAL = 5

function Allokering({ step }: { step: number }) {
  const physOn = step >= 1
  return (
    <div className="pal">
      <div className="pal-head" aria-hidden="true">
        <span className="vcaps">«logical» Counter — funktioner</span>
        <span />
        <motion.span
          className="vcaps"
          initial={false}
          animate={{ opacity: physOn ? 1 : 0 }}
          transition={t.fade}
        >
          «physical» Counter — hardware
        </motion.span>
      </div>

      <ol className="pal-rows">
        {ROWS.map((r, ri) => {
          const done = step >= r.at
          const now = step === r.at
          const lTone: Tone = now ? 'focus' : done ? 'ok' : 'idle'
          const pTone: Tone = !physOn ? 'ghost' : now ? 'focus' : done ? 'ok' : 'idle'
          return (
            <li key={r.id} className="pal-row">
              <div className="pal-logical">
                {r.logical.map((l) => (
                  <Node key={l} title={l} tone={lTone} className="pal-node" />
                ))}
              </div>

              <div className="pal-link">
                <Link on={done} tone={now ? 'focus' : 'idle'} label="«allocate»" className="pal-h" />
                <Link on={done} tone={now ? 'focus' : 'idle'} vertical className="pal-v" />
                <motion.span className="pal-vlabel" initial={false} animate={{ opacity: done ? 1 : 0 }} transition={t.fade}>
                  «allocate»
                </motion.span>
              </div>

              <div className="pal-physical">
                {r.physical.map((p, pi) => (
                  <Node key={p.name} tone={pTone} className="pal-node">
                    <div className="pal-title">
                      <span className="vnode-title">{p.name}</span>
                      <motion.span
                        className="pal-kind"
                        data-kind={p.hw}
                        initial={false}
                        animate={{ opacity: step >= FINAL || (p.hw === 'grey' && step >= r.at) ? 1 : 0 }}
                        transition={step >= FINAL ? stagger(ri * 2 + pi, 0.05) : t.fade}
                      >
                        {p.hw === 'hwsw' ? 'HW + SW' : 'HW'}
                      </motion.span>
                    </div>
                    {p.hw === 'hwsw' && (
                      <motion.ul
                        className="pal-tasks"
                        initial={false}
                        animate={{ opacity: step >= FINAL ? 1 : 0 }}
                        transition={step >= FINAL ? { ...t.settle, delay: 0.3 } : t.fade}
                      >
                        {TASKS.map((task) => (
                          <li key={task}>{task} task</li>
                        ))}
                      </motion.ul>
                    )}
                  </Node>
                ))}
                {r.note && (
                  <span className="pal-note">
                    <Tag show={step >= r.at} tone={step === r.at ? 'focus' : 'muted'} wrap>
                      {r.note}
                    </Tag>
                  </span>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'prj-allokering',
  title: 'Tællerens funktioner allokeres til hardware og software',
  steps: [
    {
      caption:
        'Den **logiske model** af tælleren: seks funktioner uden binding til teknologi. Her starter HW-arkitekturdesignet.',
      hold: 2200,
    },
    {
      caption: 'Så laves en **fysisk model**: de hardwareblokke, der kan bære funktionerne — display, betjening, processor, strøm, tællerkæde og clock.',
      hold: 2400,
    },
    {
      caption:
        'Det oplagte først: brugergrænsefladen allokeres til **to** fysiske blokke (display og frontpanel), strøm til strømforsyningen. `«allocate»` går fra logisk til fysisk.',
      hold: 2600,
    },
    {
      caption: 'Formatering og output bliver **software** på microprocessoren.',
      hold: 2000,
    },
    {
      caption:
        'Tidsbasis, input og måling ligger i den grå zone. De *kunne* være software, men den krævede frekvens gør dem til **hardware** (Peckol). Tre funktioner deler to blokke.',
      hold: 3000,
    },
    {
      caption:
        'Resultatet: alle fysiske blokke er hardware, og processoren kører fem software-tasks. Allokeringen er ikke én-til-én — den begrundes med krav.',
      hold: 3000,
    },
  ],
  Component: Allokering,
}

export default viz
