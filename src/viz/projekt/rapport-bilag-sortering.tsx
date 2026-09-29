import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './rapport-bilag-sortering.css'

/* Hvad hører i hovedrapporten, i de tekniske bilag og i procesbilagene?
   Kilder: report_template.pdf s. 8, 11, 35–36; L27_Projektrapport.pdf slide 11, 14, 16, 23;
   God_rapportskrivning.pdf slide 5, 7. */

type Col = 'rapport' | 'teknisk' | 'proces'

interface Row {
  item: string
  cells: Partial<Record<Col, ReactNode>>
}

const ROWS: Row[] = [
  { item: 'Problemformulering', cells: { rapport: 'kap. 1' } },
  { item: 'Krav', cells: { rapport: 'udvalgte UC og NF-krav', teknisk: 'fuld kravspec. + prioritering' } },
  { item: 'Arkitektur og design', cells: { rapport: '1–2 UC fra start til slut', teknisk: 'alle delsystemer' } },
  { item: 'Accepttest', cells: { rapport: 'de vigtigste (MUST)', teknisk: 'alle, gennemført' } },
  { item: 'Risici', cells: { rapport: 'arkitekturkritiske (kap. 4.3)', teknisk: <>risiko&shy;matrice</> } },
  { item: 'Analyser og eksperimenter', cells: { rapport: 'konklusionen', teknisk: <>analyse&shy;rapporter</> } },
  { item: 'Kildekode', cells: { rapport: 'udvalgte kodeudsnit', teknisk: 'hele koden' } },
  { item: 'Proces og metode', cells: { rapport: 'hensigt (kap. 2), tilbageblik (kap. 8)', proces: <>proces&shy;beskrivelse</> } },
  { item: 'Samarbejdsaftale', cells: { proces: 'med underskrifter' } },
  { item: 'Mødereferater', cells: { proces: 'møder og reviews' } },
  { item: 'Tidsplaner', cells: { proces: 'oprindelig og endelig' } },
  { item: 'Logbog', cells: { proces: 'logbøger' } },
]

const COLS: { id: Col; name: string; who: string; from: number }[] = [
  { id: 'rapport', name: 'Hovedrapport', who: 'censor · max 72.000 tegn', from: 1 },
  { id: 'teknisk', name: 'Tekniske bilag', who: 'en fagfælle, der skal videreudvikle', from: 2 },
  { id: 'proces', name: 'Procesbilag', who: 'hvordan gruppen arbejdede', from: 3 },
]

const isSplit = (r: Row) => Object.keys(r.cells).length > 1

function Sortering({ step }: { step: number }) {
  const split = at(step, 4)
  return (
    <div className="rbs">
      <div className="rbs-head">
        <span className="vcaps rbs-corner">Artefakt</span>
        {COLS.map((c) => (
          <div key={c.id} className="rbs-colhead" data-on={at(step, c.from)} data-now={step === c.from}>
            <span className="rbs-colname">{c.name}</span>
            <span className="rbs-who">{c.who}</span>
          </div>
        ))}
      </div>

      <ol className="rbs-rows">
        {ROWS.map((r, ri) => {
          const both = isSplit(r)
          return (
            <li key={r.item} className="rbs-row" data-split={split && both}>
              <span className="rbs-item">{r.item}</span>
              {COLS.map((c, ci) => {
                const text = r.cells[c.id]
                const on = !!text && at(step, c.from)
                const now = on && step === c.from
                const tone = split && both ? 'split' : now ? 'focus' : on ? 'idle' : 'empty'
                return (
                  <span key={c.id} className="rbs-cell" data-col={c.id}>
                    {text && (
                      <motion.span
                        className="rbs-chip"
                        data-tone={tone}
                        aria-hidden={!on || undefined}
                        initial={false}
                        animate={on ? { opacity: 1, x: 0, scale: 1 } : { opacity: 0, x: -10, scale: 0.96 }}
                        transition={on ? stagger(ri, 0, 0.05) : t.fade}
                      >
                        {text}
                      </motion.span>
                    )}
                    {text && ci === 0 && both && (
                      <motion.span
                        className="rbs-ref"
                        aria-hidden={!split || undefined}
                        initial={false}
                        animate={{ opacity: split ? 1 : 0 }}
                        transition={split ? stagger(ri, 0.1, 0.05) : t.fade}
                      >
                        → bilag
                      </motion.span>
                    )}
                  </span>
                )
              })}
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'rapport-bilag-sortering',
  title: 'Hovedrapport, tekniske bilag og procesbilag',
  steps: [
    {
      caption: 'Tolv slags dokumentation fra et projekt. Hvor hører hvert stykke hjemme?',
      hold: 1800,
    },
    {
      caption:
        '**Hovedrapporten** får det, censor skal forstå projektet ud fra: udvalgte krav, én eller to use cases hele vejen, de vigtigste accepttests og kodeudsnit.',
      hold: 3000,
    },
    {
      caption:
        '**Tekniske bilag** er produktdokumentationen: nok til at en teknisk kyndig på jeres niveau kan videreudvikle og vedligeholde produktet.',
      hold: 2800,
    },
    {
      caption:
        '**Procesbilag** dokumenterer arbejdet: samarbejdsaftale, referater, den oprindelige og den endelige tidsplan, logbog.',
      hold: 2600,
    },
    {
      caption:
        'Syv artefakter er **delt**: rapporten har det udvalgte og henviser til bilaget for resten. Rapporten kan læses alene; bilaget er der, når censor vil tjekke.',
      hold: 3200,
    },
  ],
  Component: Sortering,
}

export default viz
