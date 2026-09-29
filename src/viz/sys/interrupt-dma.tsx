import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { stagger, t } from '../kit/motion'
import './interrupt-dma.css'

/* 09.2-Week_10_-_Interrupts__bus_architecture_and_DMA.pdf s. 11 (polling, interrupt, DMA;
   interrupt-drevet read i fem trin), s. 14 (DMA-sekvensen i syv trin) og bogens 1.2.3
   (“one interrupt per block … rather than the one interrupt per byte”, og at device
   controlleren selv overfører blokken). Tidsaksen er skematisk: bredderne viser rækkefølge
   og hvem der arbejder, ikke målte tider. */

type Kind = 'waste' | 'io' | 'free' | 'irq' | 'dev'

interface Seg {
  id: string
  label: string
  kind: Kind
  /** Grid-kolonner (1–13) på den brede tidsakse. */
  from: number
  to: number
  /** Trin hvor segmentet tegnes. */
  at: number
}

interface Track {
  who: string
  segs: Seg[]
}

interface Lane {
  id: string
  name: string
  def: string
  tracks: Track[]
  result: string
  resultAt: number
  /** Trin hvor banen er i fokus. */
  focus: number[]
}

const LANES: Lane[] = [
  {
    id: 'poll',
    name: 'Polling',
    def: 'CPU’en tjekker I/O-porten igen og igen',
    tracks: [
      {
        who: 'CPU',
        segs: [{ id: 'p1', label: 'løkke: status? status? status? … (busy-waiting)', kind: 'waste', from: 1, to: 13, at: 1 }],
      },
    ],
    result: 'CPU’en laver ikke andet imens',
    resultAt: 1,
    focus: [1],
  },
  {
    id: 'irq',
    name: 'Interrupt',
    def: 'disken giver et interrupt, CPU’en udfører overførslen',
    tracks: [
      {
        who: 'CPU',
        segs: [
          { id: 'i1', label: 'read → I/O-request', kind: 'io', from: 1, to: 3, at: 2 },
          { id: 'i2', label: 'andet arbejde (processen blokerer)', kind: 'free', from: 3, to: 7, at: 2 },
          { id: 'i3', label: 'I/O-interrupt', kind: 'irq', from: 7, to: 9, at: 2 },
          { id: 'i4', label: 'kopi: controller → kernel → user', kind: 'io', from: 9, to: 13, at: 3 },
        ],
      },
      {
        who: 'Disk-controller',
        segs: [{ id: 'i5', label: 'bufferer data', kind: 'dev', from: 3, to: 7, at: 2 }],
      },
    ],
    result: 'CPU’en kopierer enhed → kernel buffer. Ét interrupt pr. byte ved langsomme enheder (bogen).',
    resultAt: 3,
    focus: [2, 3],
  },
  {
    id: 'dma',
    name: 'DMA',
    def: 'en DMA-controller udfører overførslen',
    tracks: [
      {
        who: 'CPU',
        segs: [
          { id: 'd1', label: 'kommando til DMA', kind: 'io', from: 1, to: 3, at: 4 },
          { id: 'd2', label: 'andet arbejde (processen blokerer)', kind: 'free', from: 3, to: 9, at: 4 },
          { id: 'd3', label: 'ét interrupt', kind: 'irq', from: 9, to: 11, at: 5 },
          { id: 'd4', label: 'kernel → user', kind: 'io', from: 11, to: 13, at: 5 },
        ],
      },
      {
        who: 'DMA-controller',
        segs: [
          { id: 'd5', label: 'enhed → egen buffer', kind: 'dev', from: 3, to: 6, at: 4 },
          { id: 'd6', label: '→ kernel buffer', kind: 'dev', from: 6, to: 9, at: 4 },
        ],
      },
    ],
    result: 'DMA-controlleren kopierer enhed → kernel buffer. Ét interrupt pr. blok.',
    resultAt: 5,
    focus: [4, 5],
  },
]

function Segment({ seg, step, i }: { seg: Seg; step: number; i: number }) {
  const on = step >= seg.at
  const now = step === seg.at
  return (
    <motion.div
      className="idm-seg"
      data-kind={seg.kind}
      data-now={now || undefined}
      style={{ gridColumn: `${seg.from} / ${seg.to}` }}
      initial={false}
      animate={{ opacity: on ? 1 : 0, scaleX: on ? 1 : 0.6 }}
      transition={on ? stagger(i, 0, 0.35) : t.fade}
    >
      <span className="idm-seg-label">{seg.label}</span>
    </motion.div>
  )
}

function Transfers({ step }: { step: number }) {
  const final = step >= 6
  return (
    <div className="idm">
      <div className="idm-axis" aria-hidden="true">
        <span className="vcaps">tid →</span>
      </div>
      {LANES.map((lane) => {
        const focus = lane.focus.includes(step)
        const resultOn = step >= lane.resultAt
        let n = 0
        return (
          <section key={lane.id} className="idm-lane" data-focus={focus || undefined}>
            <header className="idm-head">
              <span className="idm-name">{lane.name}</span>
              <span className="idm-def">{lane.def}</span>
            </header>
            <div className="idm-tracks">
              {lane.tracks.map((tr) => (
                <div key={tr.who} className="idm-track">
                  <span className="idm-who">{tr.who}</span>
                  <div className="idm-bar">
                    {tr.segs.map((s) => (
                      <Segment key={s.id} seg={s} step={step} i={s.at === step ? n++ : 0} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <motion.p
              className="idm-result"
              initial={false}
              animate={{ opacity: resultOn ? 1 : 0 }}
              transition={t.fade}
            >
              {lane.result}
            </motion.p>
          </section>
        )
      })}
      <motion.p className="idm-caveat" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
        Slide 14 har en separat DMA-controller med egen buffer. Bogen (1.2.3) lader device-controlleren selv overføre
        blokken direkte til hovedhukommelsen.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'interrupt-dma',
  title: 'Hvem flytter dataene, og hvornår får CPU’en besked',
  steps: [
    { caption: 'Linux har tre måder at flytte data mellem en enhed og hovedhukommelsen.', hold: 1800 },
    {
      caption: '**Polling**: CPU’en spørger statusregistret i en løkke. Det er busy-waiting — den laver intet andet.',
      hold: 2600,
    },
    {
      caption:
        '**Interrupt**: `read` sender en I/O-request, og processen blokerer. CPU’en laver andet, til disken rejser et interrupt.',
      hold: 2800,
    },
    {
      caption: 'Men CPU’en kopierer selv: controllerens buffer → **kernel buffer** → **user buffer**.',
      hold: 2400,
    },
    {
      caption: '**DMA**: CPU’en giver DMA-controlleren en kommando. Controlleren flytter data til kernel-bufferen uden CPU’en.',
      hold: 2800,
    },
    {
      caption: 'Controlleren giver **ét interrupt**, når blokken er færdig. CPU’en kopierer kun kernel → user.',
      hold: 2600,
    },
    {
      caption: 'Forskellen er, hvem der kopierer enhed → kernel buffer. Slides og bog beskriver DMA lidt forskelligt.',
      hold: 3000,
    },
  ],
  Component: Transfers,
}

export default viz
