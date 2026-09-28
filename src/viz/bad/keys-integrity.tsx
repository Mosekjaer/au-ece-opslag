import { AnimatePresence, motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, VTable, at, type Row, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './keys-integrity.css'

/* Relational Model.pdf s. 8–22 og DDL #2 s. 2–7: nøglen til Movies findes ved
   at skære en supernøgle ned, og en sletning i MovieStar møder StarsIn's
   fremmednøgle — først afvist (NO ACTION), så kaskaderet. */

const MOVIES = [
  ['Enola Holmes 2', '2022', 'Adventure', '129'],
  ['A Star Is Born', '2018', 'Musical', '136'],
  ['The Life Of Brian', '1979', 'Comedy', '93'],
  ['A Star Is Born', '1976', 'Musical', '139'],
]
const STARS_IN = [
  ['Enola Holmes 2', '2022', 'Millie Bobby'],
  ['A Star Is Born', '2018', 'Lady Gaga'],
  ['The Life Of Brian', '1979', 'John Cleese'],
]
const MOVIE_STAR = [
  ['Millie Bobby', 'Illinois'],
  ['Lady Gaga', 'Malibu'],
  ['John Cleese', 'London'],
]

// Nøgleforsøg pr. trin: attributsæt, kolonner i fokus og vurdering.
const KEY_TRY: Record<number, { set: string; cols: number[]; tag: string; tone: Tone }> = {
  1: { set: '{title}', cols: [0], tag: 'title er ikke unik', tone: 'neg' },
  2: { set: '{title, year, genre}', cols: [0, 1, 2], tag: 'supernøgle', tone: 'focus' },
  3: { set: '{title, year}', cols: [0, 1], tag: 'minimal → kandidatnøgle → primærnøgle', tone: 'focus' },
}

const ACTIONS = [
  { code: 'NO ACTION', text: 'standard: afviser ændringen', beat: 5 },
  { code: 'CASCADE', text: 'sletter eller opdaterer børnene med', beat: 6 },
  { code: 'SET NULL', text: 'sætter fremmednøglen til NULL', beat: -1 },
  { code: 'SET DEFAULT', text: 'sætter fremmednøglen til kolonnens standardværdi', beat: -1 },
]

function Keys({ step }: { step: number }) {
  const tryKey = KEY_TRY[Math.min(step, 3)]
  const chosen = at(step, 3)

  const colTone: Record<number, Tone> = {}
  if (tryKey && step <= 3) {
    tryKey.cols.forEach((c) => (colTone[c] = 'focus'))
    if (step === 3) colTone[2] = 'muted'
  }
  const movies: Row[] = MOVIES.map((r, i) => ({
    key: `m${i}`,
    cells: r,
    cellTone: step === 1 && r[0] === 'A Star Is Born' ? { 0: 'neg' } : undefined,
  }))

  // Del B: sletning af forælderen 'Millie Bobby'.
  const target = at(step, 4)
  const rejected = step === 5
  const cascaded = at(step, 6)
  const starsIn: Row[] = STARS_IN.map((r, i) => ({
    key: `s${i}`,
    cells: r,
    tone: cascaded && i === 0 ? 'neg' : 'idle',
    cellTone: target && !cascaded && i === 0 ? { 2: 'focus' } : undefined,
  }))
  const movieStar: Row[] = MOVIE_STAR.map((r, i) => ({
    key: `p${i}`,
    cells: r,
    tone: cascaded && i === 0 ? 'neg' : 'idle',
    cellTone: i === 0 && target && !cascaded ? { 0: rejected ? 'neg' : 'focus' } : undefined,
  }))

  const result = rejected
    ? { tone: 'neg' as Tone, text: 'The DELETE statement conflicted with the REFERENCE constraint' }
    : cascaded
      ? { tone: 'focus' as Tone, text: 'ON DELETE CASCADE: rækken i StarsIn slettes med' }
      : null

  return (
    <div className="ki">
      <section className="ki-panel" data-dim={(at(step, 4) && step < 7) || undefined}>
        <header className="ki-head">
          <span className="vcaps">Nøgle for Movies</span>
          <div className="ki-try">
            <AnimatePresence mode="wait" initial={false}>
              {tryKey && (
                <motion.span
                  key={step >= 3 ? 3 : step}
                  className="ki-try-inner"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={t.place}
                >
                  <code>{tryKey.set}</code>
                  <Tag tone={tryKey.tone}>{tryKey.tag}</Tag>
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </header>
        <VTable name="Movies" cols={['TITLE', 'YEAR', 'GENRE', 'LENGTH']} rows={movies} pk={chosen ? [0, 1] : []} colTone={colTone} compact />
      </section>

      <section className="ki-panel" data-dim={!at(step, 4) || undefined}>
        <header className="ki-head">
          <span className="vcaps">Referentiel integritet</span>
          <motion.code className="ki-sql" initial={false} animate={{ opacity: target ? 1 : 0 }} transition={t.fade}>
            DELETE FROM MovieStar WHERE Name = 'Millie Bobby';
          </motion.code>
        </header>
        <VTable name="StarsIn (barn)" cols={['MovieTitle', 'MovieYear', 'StarName']} rows={starsIn} fk={[0, 1, 2]} compact />
        <div className="ki-ref">
          <Tag tone="idle">StarName → MovieStar(Name)</Tag>
          <span className="ki-result">
            <AnimatePresence mode="wait" initial={false}>
              {result && (
                <motion.span
                  key={result.text}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  transition={t.place}
                >
                  <Tag tone={result.tone}>{result.text}</Tag>
                </motion.span>
              )}
            </AnimatePresence>
          </span>
        </div>
        <VTable name="MovieStar (forælder)" cols={['Name', 'Address']} rows={movieStar} pk={[0]} compact />
      </section>

      <dl className="ki-actions">
        {ACTIONS.map((a, i) => {
          const on = at(step, 5)
          return (
            <motion.div
              key={a.code}
              className="ki-action"
              data-now={step === a.beat || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }}
              transition={on ? stagger(i, 0.1, 0.07) : t.fade}
            >
              <dt>
                <code>{a.code}</code>
              </dt>
              <dd>{a.text}</dd>
            </motion.div>
          )
        })}
      </dl>
    </div>
  )
}

const viz: VizDef = {
  id: 'keys-integrity',
  title: 'Nøgler og referentiel integritet',
  steps: [
    { caption: 'Relationen `Movies(title, year, genre, length)`. Hvilke attributter udpeger en række entydigt?', hold: 2000 },
    { caption: '`title` er ikke nok: *A Star Is Born* findes både fra 2018 og 1976.', hold: 2400 },
    {
      caption: '`{title, year, genre}` udpeger hver række entydigt — en **supernøgle**. Men er den minimal?',
      hold: 2400,
    },
    {
      caption:
        'Fjernes `genre`, er rækkerne stadig unikke; fjernes også `year`, er de ikke. `{title, year}` er **minimal** — en kandidatnøgle, og den vælges som **primærnøgle** (understreget).',
      hold: 3000,
    },
    {
      caption: '`StarsIn.StarName` er en **fremmednøgle** til `MovieStar(Name)`. Nu slettes forælderen *Millie Bobby*.',
      hold: 2400,
    },
    {
      caption: 'Med `NO ACTION` (standard) afviser DBMS’et sletningen. Ellers ville `StarsIn` pege på en række, der ikke findes.',
      hold: 2800,
    },
    { caption: 'Med `ON DELETE CASCADE` slettes den refererende række i `StarsIn` med forælderen.', hold: 2400 },
    {
      caption:
        'Fire referentielle handlinger styrer hvad der sker, når forælderen slettes eller ændres. Integriteten tjekkes ved create, update og delete — ikke ved read.',
      hold: 3000,
    },
  ],
  Component: Keys,
}

export default viz
