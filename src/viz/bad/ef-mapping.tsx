import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, VTable, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './ef-mapping.css'

/* EF intro.pdf: Author/Fanclub-eksemplet. Klasserne til venstre bliver til
   tabeller til højre; N:N giver en junction-tabel, og med ekstra data (Members)
   bliver join-entiteten en klasse med to 1:N. */

interface Prop {
  code: string
  tone?: Tone
}

function ClassBox({ name, props, show = true, tone = 'idle' }: { name: string; props: Prop[]; show?: boolean; tone?: Tone }) {
  return (
    <Node className="efm-class" tone={tone} show={show}>
      <div className="efm-class-name mono">
        <span className="efm-kw">class</span> {name}
      </div>
      <ul className="efm-props">
        {props.map((p) => (
          <li key={p.code} className="efm-prop mono" data-tone={p.tone ?? 'idle'} data-nav={p.code.startsWith('ICollection') || undefined}>
            {p.code}
          </li>
        ))}
      </ul>
    </Node>
  )
}

const hl = (...cols: number[]): Record<number, Tone> => Object.fromEntries(cols.map((c) => [c, 'focus']))

const LEGEND = [
  { db: 'Tabel', oo: 'Klasse', from: 1 },
  { db: 'Kolonne', oo: 'Property', from: 2 },
  { db: 'Række', oo: 'Objekt', from: 6 },
  { db: 'Rækker', oo: 'Samling af objekter', from: 6 },
  { db: 'Fremmednøgle', oo: 'Reference', from: 5 },
]

function EfMapping({ step }: { step: number }) {
  const enriched = at(step, 5)
  const is = (n: number): Tone => (step === n ? 'focus' : 'idle')
  const nav: Tone = step === 4 || step === 5 ? 'focus' : 'idle'

  const author: Prop[] = [
    { code: 'int AuthorId', tone: is(3) },
    { code: 'string Name', tone: is(2) },
    { code: 'string Nationality', tone: is(2) },
    enriched ? { code: 'ICollection<AuthorFanclub> AuthorFanclub', tone: nav } : { code: 'ICollection<Fanclub> Fanclub', tone: nav },
  ]
  const fanclub: Prop[] = [
    { code: 'int FanclubId', tone: is(3) },
    enriched ? { code: 'ICollection<AuthorFanclub> AuthorFanclub', tone: nav } : { code: 'ICollection<Author> Author', tone: nav },
  ]
  const join: Prop[] = [
    { code: 'int AuthorId' },
    { code: 'int FanclubId' },
    { code: 'Author Author', tone: is(5) },
    { code: 'Fanclub Fanclub', tone: is(5) },
    { code: 'int Members', tone: is(5) },
  ]

  const authorCols = step === 1 ? hl(0, 1, 2) : step === 2 ? hl(1, 2) : step === 3 ? hl(0) : {}
  const pk = at(step, 3) ? [0] : []

  return (
    <div className="efm">
      <div className="efm-map vflow stack">
        <div className="efm-side">
          <span className="vcaps">C#-klasser (code first)</span>
          <ClassBox name="Author" props={author} tone={step === 1 ? 'focus' : 'idle'} />
          <ClassBox name="Fanclub" props={fanclub} tone={step === 1 ? 'focus' : 'idle'} />
          <ClassBox name="AuthorFanclub" props={join} show={enriched} tone={step === 5 ? 'focus' : 'idle'} />
        </div>

        <Link on={at(step, 1)} label="EF" tone={step >= 1 && step <= 5 ? 'focus' : 'idle'} />

        <div className="efm-side">
          <span className="vcaps">Tabeller</span>
          <VTable name="Authors" cols={['AuthorId', 'Name', 'Nationality']} rows={[]} pk={pk} colTone={authorCols} show={at(step, 1)} compact />
          <VTable name="Fanclub" cols={['FanclubId']} rows={[]} pk={pk} colTone={step === 1 || step === 3 ? hl(0) : {}} show={at(step, 1)} compact />
          <div className="efm-join">
            <VTable
              name="AuthorFanclub"
              cols={enriched ? ['AuthorId', 'FanclubId', 'Members'] : ['AuthorId', 'FanclubId']}
              rows={[]}
              fk={[0, 1]}
              colTone={step === 4 ? hl(0, 1) : step === 5 ? hl(2) : {}}
              show={at(step, 4)}
              compact
            />
            <div className="efm-join-tags">
              <Tag show={step === 4} tone="focus">junction-tabel, laves af EF</Tag>
              <Tag show={enriched} tone={step === 5 ? 'focus' : 'idle'}>egen entitet · to 1:N</Tag>
            </div>
          </div>
        </div>
      </div>

      <div className="efm-legend" aria-label="Oversættelsen">
        <span className="vcaps">Relationel database ↔ objektorienteret sprog</span>
        <ul>
          {LEGEND.map((l, i) => {
            const on = at(step, l.from)
            return (
              <motion.li
                key={l.db}
                initial={false}
                animate={{ opacity: on ? 1 : 0.3 }}
                transition={on ? stagger(i, 0.1) : t.fade}
                data-now={step === l.from || undefined}
              >
                <span>{l.db}</span>
                <span className="efm-arrow">↔</span>
                <span>{l.oo}</span>
              </motion.li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'ef-mapping',
  title: 'Klasser bliver til tabeller',
  steps: [
    {
      caption: 'Code first: to C#-klasser. `Author` og `Fanclub` har hver en samling af den anden — en mange-til-mange-relation.',
      hold: 2200,
    },
    {
      caption: 'Hver entitetsklasse bliver en **tabel**. `Author` er registreret som `DbSet<Author> Authors` i kontekstklassen.',
      hold: 2200,
    },
    { caption: 'Klassens properties bliver **kolonner**: `Name` og `Nationality` står nu i tabellen.', hold: 1800 },
    {
      caption: '`AuthorId` og `FanclubId` bliver **primærnøgler** (understreget) uden attribut. Konventionen er `Id` eller `<Klasse>Id`.',
      hold: 2600,
    },
    {
      caption:
        'Samlingerne er navigation properties, ikke kolonner. Ved N:N laver EF selv **junction-tabellen** — her navngivet med `UsingEntity(x => x.ToTable("AuthorFanclub"))`.',
      hold: 3000,
    },
    {
      caption:
        'Har relationen egne data, fx `Members`, modelleres join-entiteten som sin egen klasse. Referencerne `Author` og `Fanclub` giver **to 1:N** og fremmednøglerne (kursiv).',
      hold: 3000,
    },
    {
      caption: 'Oversættelsen samlet: tabel ↔ klasse, kolonne ↔ property, række ↔ objekt, rækker ↔ samling, fremmednøgle ↔ reference.',
      hold: 3000,
    },
  ],
  Component: EfMapping,
}

export default viz
