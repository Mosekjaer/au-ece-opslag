import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './projekteksamen-forloeb.css'

/* PRJ4-projekteksamen efter de to kilder: AU Kursuskatalog (SW4PRJ4-02) og
   SW4PRJ4 Introduktion.pdf slide 6. Læringsmålene er katalogets; kapitelhenvisningerne
   er guidens kobling til AU ECE-skabelonen (report_template.pdf). */

const TIMELINES = [
  {
    id: 'katalog',
    src: 'Kursuskataloget',
    note: 'gælder formelt',
    parts: [
      { label: 'i gruppen', min: 15, text: '15 min' },
      { label: 'individuelt', min: 20, text: '20 min' },
    ],
  },
  {
    id: 'slides',
    src: 'PRJ4-slides, slide 6',
    note: '“Projekteksamen, 20 minutter”',
    parts: [
      { label: 'fælles fremvisning', min: 20, text: 'ca. 20 min' },
      { label: 'individuel · ingen forberedelse', min: 15, text: '15 min' },
    ],
  },
]

const GOALS: { goal: string; where: string }[] = [
  { goal: 'Teknisk-faglig problemstilling', where: 'kap. 1' },
  { goal: 'Iterativ udviklingsproces', where: 'kap. 2 + 8' },
  { goal: 'Dokumentere produktet', where: 'bilag' },
  { goal: 'Korrekt fagterminologi', where: 'hele rapporten' },
  { goal: 'GUI, databaser, netværk', where: 'kap. 4–5' },
  { goal: 'Softwaretest', where: 'kap. 5–7' },
  { goal: 'Objektorienteret analyse og design', where: 'kap. 3.5, 5' },
  { goal: 'Projekt- og versionsstyring', where: 'kap. 2.2' },
  { goal: 'Kombinere semestrets kurser', where: 'hele rapporten' },
  { goal: 'Diskutere proces-, design- og teknologivalg', where: 'kap. 8' },
  { goal: 'Supplerende viden med referencer', where: 'kap. 1.2 + bibliografi' },
  { goal: 'Mundtligt forsvar', where: 'eksamen' },
]

function Forloeb({ step }: { step: number }) {
  const goals = at(step, 3)
  const grade = at(step, 4)

  return (
    <div className="pe">
      <div className="pe-flow">
        <div className="pe-pre" data-tone={step === 0 ? 'focus' : 'idle'}>
          <span className="vcaps">Forudsætning</span>
          <span className="pe-pre-text">Rapport + projektdokumentation afleveret</span>
          <span className="pe-pre-sub">eksamen er baseret på dem</span>
        </div>

        <div className="pe-lines">
          {TIMELINES.map((tl, ti) => {
            const on = at(step, ti + 1)
            const now = step === ti + 1
            return (
              <div key={tl.id} className="pe-tl" data-now={now}>
                <div className="pe-src">
                  <span className="pe-src-name">{tl.src}</span>
                  <span className="pe-src-note">{tl.note}</span>
                </div>
                <div className="pe-bar">
                  {tl.parts.map((p, pi) => (
                    <motion.div
                      key={p.label}
                      className="pe-seg"
                      data-part={pi}
                      style={{ flexGrow: p.min }}
                      initial={false}
                      animate={{ opacity: on ? 1 : 0, scaleX: on ? 1 : 0.2 }}
                      transition={on ? { ...t.travel, delay: pi * 0.35 } : t.fade}
                    >
                      <span className="pe-seg-min">{p.text}</span>
                      <span className="pe-seg-label">{p.label}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )
          })}
          <div className="pe-disagree">
            <Tag show={at(step, 2)} tone={step === 2 ? 'neg' : 'idle'} wrap>
              minuttallene er byttet om · spørg vejlederen
            </Tag>
          </div>
        </div>
      </div>

      <motion.div
        className="pe-goals"
        aria-hidden={!goals || undefined}
        initial={false}
        animate={{ opacity: goals ? 1 : 0 }}
        transition={goals ? t.fade : t.fade}
      >
        <div className="pe-goals-head">
          <span className="vcaps">Censors tjekliste · de 12 læringsmål</span>
          <span className="pe-goals-where">hvor rapporten viser det (guidens kobling til skabelonen)</span>
        </div>
        <ol className="pe-goal-list">
          {GOALS.map((g, i) => (
            <motion.li
              key={g.goal}
              className="pe-goal"
              initial={false}
              animate={{ opacity: goals ? 1 : 0, y: goals ? 0 : 4 }}
              transition={goals ? stagger(i, 0.05, 0.05) : t.fade}
            >
              <span className="pe-goal-n">{i + 1}</span>
              <span className="pe-goal-text">{g.goal}</span>
              <span className="pe-goal-where">{g.where}</span>
            </motion.li>
          ))}
        </ol>
      </motion.div>

      <motion.div
        className="pe-grade"
        aria-hidden={!grade || undefined}
        initial={false}
        animate={{ opacity: grade ? 1 : 0, y: grade ? 0 : 6 }}
        transition={grade ? t.place : t.fade}
      >
        <div className="pe-grade-box" data-tone="focus">
          <span className="pe-grade-main">7-trinsskala · ekstern censur</span>
          <span className="pe-grade-sub">alle hjælpemidler, også GAI</span>
        </div>
        <div className="pe-grade-box" data-tone="neg">
          <span className="pe-grade-main">00, -3 eller udeblevet</span>
          <span className="pe-grade-sub">nyt projekt til næste ordinære termin</span>
        </div>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'projekteksamen-forloeb',
  title: 'Projekteksamen efter de to kilder',
  steps: [
    {
      caption: 'Eksamen er baseret på gruppens **afleverede** rapport og dokumentation. Uden aflevering, ingen eksamen.',
      hold: 2000,
    },
    {
      caption: 'Kursuskataloget: *15 min. i gruppen + 20 min individuelt*. Det er den officielle beskrivelse.',
      hold: 2400,
    },
    {
      caption:
        'Introduktionsslidene siger det omvendt: ca. 20 min fælles fremvisning, så 15 min individuelt uden forberedelse. Rækkefølgen og formen er de enige om.',
      hold: 3000,
    },
    {
      caption:
        'Censor bedømmer mod de 12 læringsmål. Hvert mål skal kunne peges ud i rapporten — og man eksamineres i hele rapporten, ikke kun sine egne afsnit.',
      hold: 3200,
    },
    {
      caption: 'Karakter efter 7-trinsskalaen ved ekstern censor. Ikke bestået eller udeblivelse betyder et nyt projekt.',
      hold: 2400,
    },
  ],
  Component: Forloeb,
}

export default viz
