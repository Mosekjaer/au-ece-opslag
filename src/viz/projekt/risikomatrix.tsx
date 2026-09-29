import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { VTable, type Row, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './risikomatrix.css'

/* Project Management_E22.pdf slide 29–31: tre trin (envision, evaluate, plan) og
   risikotabellen med sandsynlighed 1–5 × konsekvens 1–5 = impact 1–25.
   De tre risici og deres mitigation plans er slidets egne. */

interface Risk {
  n: number
  name: string
  p: number
  c: number
  plan: string
  at: number
}

const RISKS: Risk[] = [
  { n: 1, name: 'Members leave team', p: 2, c: 3, plan: 'Mandatory monthly knowledge sharing via team meetings', at: 1 },
  { n: 2, name: 'Subsuppliers delayed', p: 2, c: 5, plan: 'Formal agreement with reimbursement plan', at: 2 },
  { n: 3, name: 'Requirement changes', p: 5, c: 3, plan: 'Frequent demonstrations of product to customer', at: 3 },
]
const LEVELS = [1, 2, 3, 4, 5]

function Grid({ step }: { step: number }) {
  return (
    <div className="rm-gridwrap">
      <div className="rm-ylabel">Konsekvens</div>
      <div className="rm-grid">
        {[...LEVELS].reverse().map((c) => (
          <div key={c} className="rm-gridrow">
            <span className="rm-tick">{c}</span>
            {LEVELS.map((p) => {
              const risk = RISKS.find((r) => r.p === p && r.c === c && step >= r.at)
              const now = risk && step === risk.at
              return (
                <div key={p} className="rm-cell" data-hit={risk ? (now ? 'now' : 'yes') : undefined}>
                  <span className="rm-prod">{p * c}</span>
                  {risk && (
                    <motion.span
                      className="rm-mark"
                      initial={{ scale: 0.4, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={t.place}
                    >
                      {risk.n}
                    </motion.span>
                  )}
                </div>
              )
            })}
          </div>
        ))}
        <div className="rm-gridrow rm-xticks">
          <span className="rm-tick" />
          {LEVELS.map((p) => (
            <span key={p} className="rm-tick">
              {p}
            </span>
          ))}
        </div>
      </div>
      <div className="rm-xlabel">Sandsynlighed</div>
    </div>
  )
}

function Risikomatrix({ step }: { step: number }) {
  const sorted = step >= 4
  const list = sorted ? [...RISKS].sort((a, b) => b.p * b.c - a.p * a.c) : RISKS
  const rows: Row[] = list.map((r) => {
    const shown = step >= r.at
    const tone: Record<number, Tone> = {}
    if (!shown) [1, 2, 3].forEach((c) => (tone[c] = 'ghost'))
    if (step < 4) tone[4] = 'ghost'
    if (step === r.at) tone[3] = 'focus'
    if (sorted && r === list[0]) [0, 1, 2, 3, 4].forEach((c) => (tone[c] = 'focus'))
    return {
      key: r.name,
      cellTone: tone,
      cells: [
        <span key="n" className="rm-name">
          <span className="rm-num">{r.n}</span>
          {r.name}
        </span>,
        r.p,
        r.c,
        <strong key="i">{r.p * r.c}</strong>,
        <span key="plan" className="rm-plan">
          {r.plan}
        </span>,
      ],
    }
  })
  return (
    <div className="rm">
      <Grid step={step} />
      <div className="rm-table">
        <VTable
          name="Risikotabel (slide 31)"
          cols={['Description', 'Prob. 1–5', 'Conseq. 1–5', 'Impact', 'Risk Mitigation Plan']}
          rows={rows}
          compact
          note="Impact = probability × consequence. Tallene i gitteret er produktet for hvert felt."
        />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'risikomatrix',
  title: 'Risici vurderet som sandsynlighed gange konsekvens',
  steps: [
    {
      caption: 'Gitteret har sandsynlighed og konsekvens fra 1 til 5. Tallet i hvert felt er **impact** = sandsynlighed × konsekvens.',
      hold: 2200,
    },
    { caption: 'En projektrisiko: et medlem forlader teamet. Sandsynlighed 2, konsekvens 3 — impact **6**.', hold: 2200 },
    { caption: 'Underleverandører bliver forsinket: sjældent, men alvorligt. 2 × 5 = **10**.', hold: 2200 },
    { caption: 'Kravændringer: næsten sikkert, middel konsekvens. 5 × 3 = **15** — den højeste.', hold: 2400 },
    {
      caption: 'Sortér efter impact og giv hver risiko en **mitigation plan**. Kravændringer mødes med hyppige demonstrationer for kunden.',
      hold: 3200,
    },
  ],
  Component: Risikomatrix,
}

export default viz
