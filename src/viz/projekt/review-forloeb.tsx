import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, Token, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './review-forloeb.css'

/* Det formelle review efter SPU, Vejledning i review (s. 219–233): fem faser, roller,
   tal (≤ 2 timer, normalt to reviewere, 3–6 min pr. side) og efterbehandling. Slides
   (Quality Management.pdf slide 7–13) har fire faser; formødet ligger i “preparation”.
   Eksemplet — en gruppes kravspecifikation reviewet af en anden gruppe — er PRJ4’s
   reviewordning (SW4PRJ4 Introduktion.pdf slide 9). */

interface Phase {
  id: string
  name: string
  who: string[]
  what: string[]
  out: string
  slides: string
}

const PHASES: Phase[] = [
  {
    id: 'plan',
    name: 'Planlægning',
    who: ['forfatter', 'reviewleder'],
    what: ['dokumentet er færdigt', 'normalt 2 reviewere', 'møde på højst 2 timer'],
    out: 'indkaldelse',
    slides: 'Planning',
  },
  {
    id: 'formoede',
    name: 'Formøde',
    who: ['reviewleder', 'forfatter'],
    what: ['formål og roller', 'overordnet gennemgang af produkt og dokument'],
    out: 'dokument + baggrund udleveret',
    slides: 'Preparation',
  },
  {
    id: 'forb',
    name: 'Forberedelse',
    who: ['reviewerne, hver for sig'],
    what: ['3–6 min pr. side', 'den vigtigste fase'],
    out: 'kommentarer i 3 grupper',
    slides: 'Preparation',
  },
  {
    id: 'moede',
    name: 'Reviewmøde',
    who: ['reviewleder', 'reviewere', 'referent'],
    what: ['påpeg, løs ikke', 'ingen diskussion om stil'],
    out: 'kritikpunkter noteret',
    slides: 'Meeting',
  },
  {
    id: 'efter',
    name: 'Efterbehandling',
    who: ['referent', 'forfatter'],
    what: ['referat hurtigst muligt', 'forfatteren retter'],
    out: 'referat (MoM)',
    slides: 'Post-meeting',
  },
]

function ReviewForloeb({ step }: { step: number }) {
  // Fasen dokumentet står i: -1 = endnu ikke startet.
  const at = Math.min(step, 5) - 1
  const done = step >= 6

  const token = (
    <Token id="review-doc" tone={done ? 'ok' : 'focus'} launch={step === 1} wrap>
      {done ? 'Kravspec., rettet' : 'Kravspec.'}
    </Token>
  )

  return (
    <div className="rvw">
      <div className="rvw-head">
        <span className="vcaps">Formelt review (SPU) · dokumentet: en gruppes kravspecifikation, reviewet af en anden gruppe</span>
        <span className="rvw-start">{at < 0 && token}</span>
      </div>

      <ol className="rvw-phases">
        {PHASES.map((p, i) => {
          const tone: Tone = i === at && !done ? 'focus' : i <= at ? 'ok' : 'idle'
          const reached = i <= at
          return (
            <li key={p.id} className="rvw-phase" data-tone={tone}>
              <div className="rvw-top">
                <span className="rvw-num">{i + 1}</span>
                <span className="rvw-name">{p.name}</span>
              </div>
              <div className="rvw-slot">{i === at && token}</div>
              <motion.div
                className="rvw-detail"
                initial={false}
                animate={{ opacity: reached ? 1 : 0.38 }}
                transition={reached ? t.settle : t.fade}
              >
                <div className="rvw-who">
                  {p.who.map((w) => (
                    <span key={w} className="rvw-role">
                      {w}
                    </span>
                  ))}
                </div>
                <ul className="rvw-what">
                  {p.what.map((w) => (
                    <li key={w}>{w}</li>
                  ))}
                </ul>
                <div className="rvw-out">
                  <Tag tone={i === at && !done ? 'focus' : 'idle'} wrap>
                    {p.out}
                  </Tag>
                </div>
              </motion.div>
              <motion.div
                className="rvw-slides"
                initial={false}
                animate={{ opacity: done ? 1 : 0 }}
                transition={t.fade}
                aria-hidden={!done || undefined}
              >
                slides: <em>{p.slides}</em>
              </motion.div>
            </li>
          )
        })}
      </ol>

      <motion.div
        className="rvw-outcome"
        initial={false}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 4 }}
        transition={done ? t.settle : t.fade}
        aria-hidden={!done || undefined}
      >
        <span className="rvw-outcome-label">Beslutning efter rettelserne:</span>
        <Tag tone="ok">frigiv dokumentet</Tag>
        <span className="rvw-or">eller</span>
        <Tag tone="neg" wrap>
          nyt review, hvis kritikken var alvorlig
        </Tag>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'review-forloeb',
  title: 'Et formelt review, fase for fase',
  steps: [
    {
      caption:
        'Til review: en gruppes kravspecifikation, som en anden gruppe reviewer. SPU deler et formelt review i fem faser; resultatet er et referat og et rettet dokument.',
      hold: 2600,
    },
    {
      caption:
        '**Planlægning.** Forfatteren bestemmer, hvornår dokumentet er færdigt. Reviewlederen finder normalt to reviewere og indkalder til et møde på højst 2 timer.',
      hold: 2800,
    },
    {
      caption: '**Formøde.** Reviewlederen forklarer formål og roller; forfatteren gennemgår produktet og dokumentet overordnet.',
      hold: 2500,
    },
    {
      caption:
        '**Forberedelse** er den vigtigste fase. Reviewerne læser hver for sig, 3–6 minutter pr. side, og deler kommentarerne i korrektur, afvigelser fra standarden og logiske fejl, mangler og fortræffeligheder.',
      hold: 3200,
    },
    {
      caption:
        '**Reviewmøde.** Reviewerne påpeger problemer uden at løse dem og uden at diskutere stil. Referenten — normalt forfatteren selv — noterer alle punkter.',
      hold: 2900,
    },
    {
      caption: '**Efterbehandling.** Referatet udgives hurtigst muligt, og forfatteren retter dokumentet.',
      hold: 2300,
    },
    {
      caption:
        'Så besluttes det: frigiv dokumentet, eller hold nyt review, hvis kritikken var alvorlig. Slides har kun fire faser — formødet ligger i *preparation*.',
      hold: 3200,
    },
  ],
  Component: ReviewForloeb,
}

export default viz
