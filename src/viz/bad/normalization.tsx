import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, VTable, type Row, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './normalization.css'

/* Tavle-eksemplet fra NormaliseringIntro.pptx (slide 10–25), trin for trin:
   0NF → én flad tabel med redundans → 1NF → 2NF → 3NF. */

const RAW = [
  ['100', 'Hansen', '1', 'Hovedkvarter', '1', 'Rationalisering', '20'],
  ['100', 'Hansen', '1', 'Hovedkvarter', '2', 'Produkt X', '10'],
  ['100', 'Hansen', '1', 'Hovedkvarter', '3', 'Produkt Y', '5'],
  ['101', 'Jensen', '2', 'Forskning', '2', 'Produkt X', '35'],
  ['102', 'Nielsen', '3', 'Salg', '2', 'Produkt X', '15'],
  ['102', 'Nielsen', '3', 'Salg', '3', 'Produkt Y', '20'],
]

const dedupe = (rows: string[][], cols: number[]) => {
  const seen = new Set<string>()
  return rows
    .map((r) => cols.map((c) => r[c]))
    .filter((r) => {
      const k = r.join('|')
      if (seen.has(k)) return false
      seen.add(k)
      return true
    })
}

const toRows = (rows: string[][], tone?: (r: string[], i: number) => Row['cellTone']): Row[] =>
  rows.map((r, i) => ({ key: r.join('|'), cells: r, cellTone: tone?.(r, i) }))

interface Table {
  id: string
  name: ReactNode
  cols: string[]
  pk: number[]
  fk?: number[]
  rows: Row[]
  colTone?: Record<number, Tone>
  fd?: string
}

function tablesAt(step: number): Table[] {
  if (step === 0) {
    // Tavlen: gentagne grupper, tomme felter.
    const rows = RAW.map((r, i) => {
      const prev = RAW[i - 1]
      const repeat = prev && prev[0] === r[0]
      return { key: `raw${i}`, cells: repeat ? ['', '', '', '', r[4], r[5], r[6]] : r }
    })
    return [{ id: 'raw', name: 'Tavlen (0NF)', cols: ['Mnr', 'Navn', 'afdnr', 'afdnavn', 'projektnr', 'Projektnavn', 'TimerPrUge'], pk: [], rows }]
  }
  if (step === 1) {
    return [
      {
        id: 'raw',
        name: 'Én tabel (iteration 1)',
        cols: ['Mnr', 'Navn', 'afdnr', 'afdnavn', 'projektnr', 'Projektnavn', 'TimerPrUge'],
        pk: [],
        rows: RAW.map((r, i) => ({
          key: `raw${i}`,
          cells: r,
          cellTone: r[0] === '100' ? { 1: 'focus', 2: 'focus', 3: 'focus' } : undefined,
        })),
      },
    ]
  }

  const medarbejder1: Table = {
    id: 'med',
    name: 'Medarbejder(1)',
    cols: ['Mnr', 'Navn', 'Afdnr', 'Afdnavn'],
    pk: [0],
    rows: toRows(dedupe(RAW, [0, 1, 2, 3])),
  }
  const projekt1: Table = {
    id: 'proj',
    name: 'Projekt(1)',
    cols: ['Mnr', 'Pnr', 'Pnavn', 'TimerPrUge'],
    pk: [0, 1],
    rows: toRows(dedupe(RAW, [0, 4, 5, 6])),
  }
  if (step === 2) return [medarbejder1, projekt1]
  if (step === 3)
    return [medarbejder1, { ...projekt1, colTone: { 1: 'focus', 2: 'focus' }, fd: 'Pnr → Pnavn (kun del af nøglen)' }]

  const projekt1a: Table = { id: 'proj-a', name: 'Projekt(1A)', cols: ['Pnr', 'Pnavn'], pk: [0], rows: toRows(dedupe(RAW, [4, 5])) }
  const projekt1b: Table = {
    id: 'proj',
    name: 'Projekt(1B)',
    cols: ['Mnr', 'Pnr', 'TimerPrUge'],
    pk: [0, 1],
    fk: [0, 1],
    rows: toRows(dedupe(RAW, [0, 4, 6])),
  }
  if (step === 4) return [medarbejder1, projekt1a, projekt1b]
  if (step === 5)
    return [
      { ...medarbejder1, colTone: { 2: 'focus', 3: 'focus' }, fd: 'Mnr → Afdnr → Afdnavn (transitiv)' },
      projekt1a,
      projekt1b,
    ]

  const medarbejder2: Table = {
    id: 'med',
    name: 'Medarbejder(2)',
    cols: ['Mnr', 'Navn', 'Afdnr'],
    pk: [0],
    fk: [2],
    rows: toRows(dedupe(RAW, [0, 1, 2])),
  }
  const afdeling: Table = { id: 'afd', name: 'Afdeling', cols: ['Afdnr', 'Afdnavn'], pk: [0], rows: toRows(dedupe(RAW, [2, 3])) }
  return [medarbejder2, afdeling, projekt1a, projekt1b]
}

const NF_LABEL = ['0NF', 'Redundans', '1NF', '1NF', '2NF', '2NF', '3NF']

function Normalization({ step }: { step: number }) {
  const tables = tablesAt(step)
  const wide = step <= 1
  return (
    <div className="nf">
      <div className="nf-head">
        <span className="vcaps">Normalform</span>
        <div className="nf-ladder" aria-hidden="true">
          {['0NF', '1NF', '2NF', '3NF'].map((n, i) => {
            const level = step <= 1 ? 0 : step <= 3 ? 1 : step <= 5 ? 2 : 3
            return (
              <span key={n} className="nf-rung" data-on={i <= level} data-now={i === level}>
                {n}
              </span>
            )
          })}
        </div>
        <span className="visually-hidden">Nu: {NF_LABEL[step]}</span>
        {step === 1 && (
          <span className="nf-anomalies">
            <Tag tone="neg">indsættelse</Tag>
            <Tag tone="neg">opdatering</Tag>
            <Tag tone="neg">sletning</Tag>
          </span>
        )}
      </div>

      <div className={`nf-grid ${wide ? 'is-wide' : ''}`}>
        <AnimatePresence mode="popLayout" initial={false}>
          {tables.map((tb) => (
            <motion.div
              key={tb.id + (wide ? '-wide' : '')}
              className={`nf-cell nf-${tb.id}`}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
              transition={t.settle}
            >
              <div className="nf-fd">
                <AnimatePresence initial={false}>
                  {tb.fd && (
                    <motion.span
                      key={tb.fd}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={t.place}
                    >
                      <Tag>{tb.fd}</Tag>
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
              <VTable name={tb.name} cols={tb.cols} rows={tb.rows} pk={tb.pk} fk={tb.fk} colTone={tb.colTone} compact />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'normalization',
  title: 'Fra tavlens rå data til tredje normalform',
  steps: [
    { caption: 'Rå data fra tavlen: medarbejdere, afdelinger og projekter. Tomme felter betyder “samme som ovenfor” — en tabel i tabellen.', hold: 2200 },
    {
      caption:
        'Fyldes felterne ud, står Hansen og “Hovedkvarter” tre gange. Den **redundans** giver indsættelses-, opdaterings- og sletteanomalier.',
      hold: 3000,
    },
    {
      caption: '**1NF**: den gentagne gruppe flyttes ud med en kopi af nøglen. Nu har hver tabel en primærnøgle (understreget) og kun atomare værdier.',
      hold: 2600,
    },
    {
      caption: 'Projekt(1) har den sammensatte nøgle {Mnr, Pnr}, men `Pnavn` afhænger kun af `Pnr` — en **partiel** afhængighed.',
      hold: 2800,
    },
    { caption: '**2NF**: `Pnr, Pnavn` flyttes til sin egen tabel. Tilbage står timerne, som afhænger af hele nøglen.', hold: 2400 },
    {
      caption: 'I Medarbejder(1) bestemmer `Mnr` afdelingsnummeret, og afdelingsnummeret bestemmer navnet — en **transitiv** afhængighed.',
      hold: 2800,
    },
    {
      caption:
        '**3NF**: `Afdnr, Afdnavn` bliver tabellen Afdeling, og `Afdnr` bliver fremmednøgle (kursiv). “Hovedkvarter” står nu ét sted.',
      hold: 3000,
    },
  ],
  Component: Normalization,
}

export default viz
