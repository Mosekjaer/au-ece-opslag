import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, VTable, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './mongo-embed.css'

/* O'Reilly-eksemplet fra Mongo-intro.pdf (s. 5, 25–26, 23–24):
   to relationelle tabeller → ét dokument med indlejrede bøger → prisen
   (samme bog to steder) → reference med id'er → hvornår man vælger hvad. */

const BOOKS = [
  { id: '1', title: 'Learning python' },
  { id: '2', title: 'Jenkins 2 - up & running' },
  { id: '3', title: 'Head First Kotlin' },
  { id: '50', title: 'Mastering Ethereum' },
]
const REF_IDS = ['1', '2', '3', '12', '15', '19', '25', '26', '27', '49', '50']

type Phase = 'sql' | 'embed' | 'dup' | 'ref' | 'weak' | 'rules'
const PHASES: Phase[] = ['sql', 'embed', 'dup', 'ref', 'weak', 'rules']

const STATUS: Record<Exclude<Phase, 'rules'>, { tone: Tone; text: string }> = {
  sql: { tone: 'idle', text: 'Publisher ⋈ Book: join på publisher' },
  embed: { tone: 'focus', text: 'én operation · ingen join' },
  dup: { tone: 'neg', text: 'update title → 2 steder' },
  ref: { tone: 'focus', text: 'books: kun id’er' },
  weak: { tone: 'neg', text: 'svagt link · ikke håndhævet af databasen' },
}

/** Titlen rejser mellem tabel og dokument (kun i den levende visning). */
function Title({ id, live, children }: { id: string; live: boolean; children: ReactNode }) {
  return (
    <motion.span className="me-title" layoutId={live ? `me-book-${id}` : undefined} layout="position" transition={t.travel}>
      {children}
    </motion.span>
  )
}

function Line({ indent = 0, tone = 'idle', children }: { indent?: 0 | 1 | 2; tone?: Tone; children: ReactNode }) {
  return (
    <div className={`me-line me-i${indent}`} data-tone={tone}>
      {children}
    </div>
  )
}

function Doc({ name, children }: { name: ReactNode; children: ReactNode }) {
  return (
    <div className="me-doc">
      <div className="vtable-name">{name}</div>
      <div className="me-json">{children}</div>
    </div>
  )
}

function Publisher({ phase, live }: { phase: Phase; live: boolean }) {
  if (phase === 'sql') {
    return <VTable name="Publisher" cols={['id', 'name']} pk={[0]} rows={[{ key: 'p1', cells: ['1', 'O’Reilly'] }]} compact />
  }
  const ref = phase === 'ref' || phase === 'weak'
  return (
    <Doc name={ref ? 'publisher-collection' : 'publisher-dokument'}>
      <Line>{'{ "id": "1",'}</Line>
      <Line indent={1}>{'"name": "O\'Reilly",'}</Line>
      {ref ? (
        <Line indent={1}>
          {'"books": ['}
          {REF_IDS.map((id, i) => (
            <span key={id} className="me-id" data-tone={phase === 'weak' && id === '1' ? 'focus' : 'idle'}>
              {id}
              {i < REF_IDS.length - 1 ? ', ' : ''}
            </span>
          ))}
          {'] }'}
        </Line>
      ) : (
        <>
          <Line indent={1}>{'"books": ['}</Line>
          {BOOKS.map((b, i) => (
            <Line key={b.id} indent={2} tone={phase === 'dup' && i === 0 ? 'neg' : 'idle'}>
              {'{ "title": "'}
              <Title id={b.id} live={live}>
                {b.title}
              </Title>
              {i < BOOKS.length - 1 ? '" },' : '" }'}
            </Line>
          ))}
          <Line indent={1}>{'] }'}</Line>
        </>
      )}
    </Doc>
  )
}

function Books({ phase, live }: { phase: Phase; live: boolean }) {
  if (phase === 'sql') {
    return (
      <VTable
        name="Book"
        cols={['id', 'title', 'publisher']}
        pk={[0]}
        fk={[2]}
        rows={BOOKS.map((b) => ({
          key: b.id,
          cells: [
            b.id,
            <Title key="t" id={b.id} live={live}>
              {b.title}
            </Title>,
            '1',
          ],
        }))}
        compact
      />
    )
  }
  if (phase === 'embed') {
    return (
      <div className="me-empty">
        <span className="vcaps">Ingen Book-tabel</span>
        <span className="vnote">Bøgerne ligger i forlagets dokument.</span>
      </div>
    )
  }
  return (
    <Doc name="Books-collection">
      {BOOKS.map((b, i) => (
        <Line key={b.id} tone={i === 0 ? (phase === 'dup' ? 'neg' : phase === 'weak' ? 'focus' : 'idle') : 'idle'}>
          {`{ "id": "${b.id}", "name": "${b.title}" }`}
        </Line>
      ))}
    </Doc>
  )
}

const EMBED_RULES = [
  'relationen er “contained” (motor i bil)',
  'én-til-få (1 person, få telefonnumre)',
  'data ændres sjældent',
  'data har en øvre grænse',
  'data hentes ofte sammen',
]
const REF_RULES = ['én-til-mange', 'mange-til-mange', 'data ændres ofte', 'data kan vokse uden grænse']

function Rules() {
  return (
    <div className="me-rules">
      {[
        { head: 'Indlejr når …', code: '"books": [{ "title": … }]', items: EMBED_RULES },
        { head: 'Referér når …', code: '"books": [1, 2, 3, …]', items: REF_RULES },
      ].map((r) => (
        <div key={r.head} className="me-rule">
          <div className="me-rule-head">{r.head}</div>
          <code className="me-rule-code">{r.code}</code>
          <ul>
            {r.items.map((it) => (
              <li key={it}>{it}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}

function View({ phase, live }: { phase: Phase; live: boolean }) {
  if (phase === 'rules') return <Rules />
  const s = STATUS[phase]
  return (
    <div className="me-view">
      <div className="me-status">
        <span className="vcaps">{phase === 'sql' ? 'Relationelt' : 'MongoDB'}</span>
        <Tag tone={s.tone}>{s.text}</Tag>
      </div>
      <div className="me-panes">
        <div className="me-pane">
          <Publisher phase={phase} live={live} />
        </div>
        <div className="me-pane">
          <Books phase={phase} live={live} />
        </div>
      </div>
    </div>
  )
}

function MongoEmbed({ step }: { step: number }) {
  const phase = PHASES[Math.min(step, PHASES.length - 1)]
  return (
    <div className="me-stage">
      {/* Usynlige kopier af alle trin reserverer den største højde ved enhver bredde. */}
      {PHASES.map((p) => (
        <div key={p} className="me-sizer" aria-hidden="true">
          <View phase={p} live={false} />
        </div>
      ))}
      <motion.div key={phase === 'rules' ? 'rules' : 'docs'} className="me-live" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t.fade}>
        <View phase={phase} live />
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'mongo-embed',
  title: 'Indlejring eller reference',
  steps: [
    {
      caption: 'Relationelt: forlaget og bøgerne ligger i hver sin tabel, og `publisher` er fremmednøgle. Forlag med bøger kræver en join.',
      hold: 2200,
    },
    {
      caption: '**Indlejring**: bøgerne flytter ind i forlagets dokument som et array. Alt læses i **én operation** — ingen join.',
      hold: 2800,
    },
    {
      caption:
        'Prisen: ligger samme bog også i en `Books`-collection, skal “update book’s title” ske **to steder**. Ingen fremmednøgle holder dem ens.',
      hold: 3000,
    },
    {
      caption: '**Reference**: forlaget gemmer kun id’er, `"books": [1, 2, 3, …]`, og bøgerne ligger i deres egen collection.',
      hold: 2600,
    },
    {
      caption: 'Referencer er **svage links**: databasen håndhæver dem ikke. Applikationen skal selv holde dem ved lige — også når en bog slettes.',
      hold: 2800,
    },
    {
      caption: 'Ingen hårde regler, men retningslinjer: indlejr det, der hører sammen og er afgrænset; referér det, der ændres ofte eller er ubegrænset.',
      hold: 3000,
    },
  ],
  Component: MongoEmbed,
}

export default viz
