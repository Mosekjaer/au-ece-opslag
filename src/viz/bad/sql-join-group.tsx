import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, VTable, at, type Row, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './sql-join-group.css'

/* To forespørgsler fra DML-slides: INNER JOIN på tværs af StarsIn og MovieStar
   (tabellerne fra subquery-eksemplet), og GROUP BY på cookie_sales.
   cookie_sales er de første 12 rækker (3.–8. marts) fra tabellen på DML-slide 13. */

const STARS_IN = [
  ['Enola Holmes 2', '2022', 'Millie Bobby'],
  ['A Star Is Born', '2018', 'Lady Gaga'],
  ['The Life Of Brian', '1979', 'John Cleese'],
]
const MOVIE_STAR = [
  ['Millie Bobby', 'Illinois', 'F', '19/02/2004'],
  ['Lady Gaga', 'Malibu', 'B', '28/03/1986'],
  ['John Cleese', 'London', 'M', '27/10/1939'],
]

// Udsnit af cookie_sales fra DML-slide 13 (id 1–12), i tabellens rækkefølge.
const SALES = [
  { id: 's1', name: 'Lindsay', sales: 32.02 },
  { id: 's2', name: 'Paris', sales: 26.53 },
  { id: 's3', name: 'Britney', sales: 11.25 },
  { id: 's4', name: 'Nicole', sales: 18.96 },
  { id: 's5', name: 'Lindsay', sales: 9.16 },
  { id: 's6', name: 'Paris', sales: 1.52 },
  { id: 's7', name: 'Britney', sales: 43.21 },
  { id: 's8', name: 'Nicole', sales: 8.05 },
  { id: 's9', name: 'Lindsay', sales: 17.62 },
  { id: 's10', name: 'Paris', sales: 24.19 },
  { id: 's11', name: 'Britney', sales: 3.4 },
  { id: 's12', name: 'Nicole', sales: 15.21 },
]
// Grupperne i den rækkefølge ORDER BY SUM(sales) giver (stigende):
// Nicole 42.22, Paris 52.24, Britney 57.86, Lindsay 58.80.
const GROUPS = ['Nicole', 'Paris', 'Britney', 'Lindsay']
const sum = (name: string) => SALES.filter((s) => s.name === name).reduce((a, s) => a + s.sales, 0).toFixed(2)

const JOIN_SQL = (hl: boolean) => (
  <>
    SELECT MovieTitle, Name, Address{'\n'}FROM StarsIn{'\n'}INNER JOIN MovieStar{'\n'}
    <span className="sjg-hl" data-on={hl}>ON StarsIn.StarName = MovieStar.Name</span>
  </>
)
const GROUP_SQL = (hl: boolean) => (
  <>
    SELECT first_name, SUM(sales){'\n'}FROM cookie_sales{'\n'}
    <span className="sjg-hl" data-on={hl}>GROUP BY first_name</span>
    {'\n'}ORDER BY SUM(sales)
  </>
)

function Section({ active, children }: { active: boolean; children: ReactNode }) {
  return (
    <motion.section className="sjg-sec" initial={false} animate={{ opacity: active ? 1 : 0.38 }} transition={t.recede}>
      {children}
    </motion.section>
  )
}

function JoinGroup({ step }: { step: number }) {
  // Hvilke join-par er fundet? Trin 2: første; trin 3+: alle.
  const matched = step >= 3 ? 3 : step === 2 ? 1 : 0
  const now = (i: number) => (step === 2 && i === 0) || (step === 3 && i > 0)
  const joinTone = (i: number): Tone => (now(i) ? 'focus' : 'idle')
  const keyTone = at(step, 1) && step <= 3 ? 'focus' : 'idle'

  const starsRows: Row[] = STARS_IN.map((r, i) => ({ key: r[2], cells: r, tone: joinTone(i) }))
  const starRows: Row[] = MOVIE_STAR.map((r, i) => ({ key: r[0], cells: r, tone: joinTone(i) }))
  const joinResult: Row[] = STARS_IN.map((r, i) => ({
    key: r[2],
    cells: [r[0], r[2], MOVIE_STAR[i][1]],
    tone: i < matched ? joinTone(i) : 'ghost',
  }))

  // GROUP BY: trin 5+ sorterer rækkerne i grupper; grupperne skiftevis tonet.
  const grouped = at(step, 5)
  const order = grouped ? GROUPS.flatMap((g) => SALES.filter((s) => s.name === g)) : SALES
  const groupTone = (name: string): Tone => (grouped && GROUPS.indexOf(name) % 2 === 0 ? 'focus' : 'idle')
  const salesRows: Row[] = order.map((s) => ({
    key: s.id,
    cells: [s.name, s.sales.toFixed(2)],
    tone: step === 6 ? 'muted' : groupTone(s.name),
  }))
  const collapsed = at(step, 6)
  const groupResult: Row[] = GROUPS.map((g, i) => ({
    key: g,
    cells: [g, sum(g)],
    tone: collapsed ? (i % 2 === 0 ? 'focus' : 'idle') : 'ghost',
  }))

  return (
    <div className="sjg">
      <Section active={step <= 3 || step === 7}>
        <div className="sjg-head">
          <span className="vcaps">INNER JOIN</span>
          <Tag show={at(step, 3)} tone="idle">3 rækker, ikke 3 × 3</Tag>
        </div>
        <div className="sjg-join">
          <div className="sjg-scroll">
            <VTable name="StarsIn" cols={['MovieTitle', 'MovieYear', 'StarName']} rows={starsRows} colTone={{ 2: keyTone }} compact />
          </div>
          <div className="sjg-scroll">
            <VTable name="MovieStar" cols={['Name', 'Address', 'Gender', 'Birthdate']} rows={starRows} colTone={{ 0: keyTone }} compact />
          </div>
          <div className="sjg-scroll">
            <VTable name="Resultat" cols={['MovieTitle', 'Name', 'Address']} rows={joinResult} compact />
          </div>
          <pre className="sjg-sql mono">{JOIN_SQL(step >= 1 && step <= 3)}</pre>
        </div>
      </Section>

      <Section active={step >= 4}>
        <div className="sjg-head">
          <span className="vcaps">GROUP BY</span>
          <span className="sjg-note">udsnit fra DML-slide 13</span>
        </div>
        <div className="sjg-group">
          <div className="sjg-scroll">
            <VTable name="cookie_sales" cols={['first_name', 'sales']} rows={salesRows} colTone={{ 0: step === 5 ? 'focus' : 'idle' }} compact />
          </div>
          <div className="sjg-scroll">
            <VTable name="Resultat" cols={['first_name', 'SUM(sales)']} rows={groupResult} compact />
          </div>
          <pre className="sjg-sql mono">{GROUP_SQL(step === 5 || step === 6)}</pre>
        </div>
      </Section>
    </div>
  )
}

const viz: VizDef = {
  id: 'sql-join-group',
  title: 'INNER JOIN og GROUP BY',
  steps: [
    {
      caption: 'To tabeller fra materialet: `StarsIn` siger hvem der spiller i hvilken film, `MovieStar` hvor stjernen bor.',
      hold: 2000,
    },
    {
      caption: 'Join-betingelsen `StarsIn.StarName = MovieStar.Name` sammenligner én kolonne i hver tabel.',
      hold: 2200,
    },
    {
      caption: '`Millie Bobby` står i begge kolonner. De to rækker matcher og bliver til **én række** i resultatet.',
      hold: 2400,
    },
    {
      caption: 'Lady Gaga og John Cleese matcher også. `INNER JOIN` giver kun de kombinationer, hvor betingelsen er sand — ikke alle 3 × 3.',
      hold: 2800,
    },
    {
      caption: '`cookie_sales` fra slides har én række pr. salg — her de første tre dage. Spørgsmålet er: hvor meget har *hver* person solgt?',
      hold: 2000,
    },
    { caption: '`GROUP BY first_name` samler rækkerne med samme navn i én gruppe.', hold: 2400 },
    {
      caption: 'Hver gruppe bliver til **én sumrække** med `SUM(sales)`, og `ORDER BY SUM(sales)` sorterer dem stigende.',
      hold: 2800,
    },
    {
      caption: 'JOIN kombinerer rækker *på tværs* af tabeller; GROUP BY samler rækker *inden for* én tabel. Over hele slide-tabellen giver samme forespørgsel Britney 107.91, Paris 98.23, Nicole 96.03 og Lindsay 81.08.',
      hold: 3000,
    },
  ],
  Component: JoinGroup,
}

export default viz
