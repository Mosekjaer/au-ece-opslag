import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, VTable, type Row, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './dbup.css'

/* DbUp fra DbUp & Dapper-slides: scripts-mappen, historiktabellen SchemaVersions
   og de fire trin (tjek historik → find manglende → kør i rækkefølge → log).
   Tidsstemplerne er fra SchemaVersions-skærmbilledet på DbUp-slide 13. */

const SCRIPTS = [
  { file: '0001 - Initial create.sql', applied: '2026-02-06 14:14:15.730', runAt: -1 },
  { file: '0002 - Alter Books add price.sql', applied: '2026-02-06 14:14:15.790', runAt: 3 },
  { file: '0003 - Seed data.sql', applied: '2026-02-06 14:28:59.537', runAt: 4 },
]

const PHASES = ['Tjek historiktabellen', 'Find scripts, der ikke har kørt', 'Kør dem i rækkefølge', 'Log i SchemaVersions']

// Hvilken fase er aktiv på hvert trin? (Trin 5 = anden kørsel: tjek + find, intet at gøre.)
const PHASE_AT: number[][] = [[], [0], [1], [2, 3], [2, 3], [0, 1], []]

function DbUp({ step }: { step: number }) {
  const secondRun = step >= 5
  const phases = PHASE_AT[step] ?? []
  const runningIdx = step === 3 ? 1 : step === 4 ? 2 : -1
  const reading = step === 1 || step === 5

  const scriptTone = (i: number): Tone => {
    if (i === runningIdx) return 'focus'
    if (step === 2 && SCRIPTS[i].runAt > step) return 'focus'
    return 'idle'
  }
  // Status pr. script. Tagget er der altid (skjult før sammenligningen), så højden står stille.
  const status = (i: number): { text: string; tone: Tone; show: boolean } => {
    const s = SCRIPTS[i]
    if (step < 2) return { text: 'mangler', tone: 'idle', show: false }
    if (s.runAt < step) return { text: 'kørt', tone: 'idle', show: true }
    if (s.runAt === step) return { text: 'kører nu', tone: 'focus', show: true }
    return { text: 'mangler', tone: 'focus', show: true }
  }

  const rows: Row[] = SCRIPTS.map((s, i) => {
    const applied = s.runAt === -1 || step >= s.runAt
    return {
      key: s.file,
      cells: [i + 1, `database.scripts.${s.file}`, s.applied],
      tone: !applied ? 'ghost' : s.runAt === step ? 'focus' : 'idle',
    }
  })

  return (
    <div className="dbu">
      <div className="dbu-top">
        <Node className="dbu-folder" title="scripts/" sub="nummereret: filnavnet bestemmer rækkefølgen">
          <ol className="dbu-files">
            {SCRIPTS.map((s, i) => {
              const st = status(i)
              return (
                <li key={s.file} className="dbu-file" data-tone={scriptTone(i)}>
                  <span className="mono">{s.file}</span>
                  <span className="dbu-status">
                    <Tag show={st.show} tone={st.tone}>
                      {st.text}
                    </Tag>
                  </span>
                </li>
              )
            })}
          </ol>
        </Node>

        <Link on={step >= 3 && step <= 4} tone="focus" label="kører" className="dbu-link" />

        <Node className="dbu-runner" title="DbUp" sub={secondRun ? 'anden kørsel' : 'første kørsel'} tone={phases.length ? 'focus' : 'idle'}>
          <ol className="dbu-phases">
            {PHASES.map((p, i) => (
              <li key={p} className="dbu-phase" data-on={phases.includes(i)}>
                <span className="dbu-pnum">{i + 1}</span>
                {p}
              </li>
            ))}
          </ol>
          <div className="dbu-result">
            <Tag show={secondRun} tone="idle">
              0 scripts at køre
            </Tag>
          </div>
        </Node>
      </div>

      <div className="dbu-db">
        <div className="dbu-dbhead">
          <span className="vcaps">Database · SchemaVersions</span>
          <motion.span
            className="dbu-read"
            initial={false}
            animate={{ opacity: reading ? 1 : 0, x: reading ? 0 : -4 }}
            transition={reading ? stagger(0, 0.1) : t.fade}
          >
            DbUp læser historikken
          </motion.span>
        </div>
        <div className="dbu-scroll">
          <VTable
            cols={['Id', 'ScriptName', 'Applied']}
            rows={rows}
            pk={[0]}
            colTone={{ 1: reading ? 'focus' : 'idle' }}
            note="Tidsstempler fra SchemaVersions på DbUp-slide 13."
            compact
          />
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'dbup',
  title: 'DbUp kører kun de scripts, der mangler',
  steps: [
    {
      caption: 'Projektet har tre nummererede scripts. Databasen har allerede kørt `0001`, og det står i historiktabellen `SchemaVersions`.',
      hold: 2400,
    },
    { caption: 'DbUp starter med at **tjekke historiktabellen**: hvilke scripts har allerede kørt her?', hold: 1800 },
    {
      caption: 'Den sammenligner med mappen: `0001` er kørt, `0002` og `0003` **mangler**.',
      hold: 2400,
    },
    { caption: 'DbUp kører `0002` først — rækkefølgen kommer fra nummeret — og logger den i `SchemaVersions`.', hold: 2400 },
    { caption: 'Så `0003`. Hvert script kører præcis én gang og får en række med tidsstempel.', hold: 2200 },
    {
      caption: 'Køres DbUp igen, finder den alle tre i historikken. Der er **intet at køre**, så databasen røres ikke.',
      hold: 2600,
    },
    {
      caption:
        'DbUp modellerer databasen som **overgange**, ikke en tilstand: historikken siger præcis hvilke scripts hvert miljø har fået. Manuelle scripts glemmes, køres i forkert rækkefølge og efterlader ingen historik.',
      hold: 3000,
    },
  ],
  Component: DbUp,
}

export default viz
