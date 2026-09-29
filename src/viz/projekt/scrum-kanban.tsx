import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './scrum-kanban.css'

/* Venstre: én Scrum-sprint efter Scrum Guide 2016 (s. 7–15): Product Backlog →
   Sprint Planning → Sprint Backlog → Increment → Sprint Review og Retrospective,
   med guidens timeboxes for en sprint på én måned. Højre: en Kanban-tavle med
   WIP-grænse. Kanban-tavlen er IKKE i materialet (L9-slides har kun
   arbejdsspørgsmål) og er mærket som sådan. Backlog-items er pladsholdere. */

type ScrumPlace = 'pb' | 'sb' | 'inc'
type KanPlace = 'todo' | 'doing' | 'done'

function scrumAt(step: number): Record<string, ScrumPlace> {
  const s = Math.min(step, 3)
  const pos: Record<string, ScrumPlace> = {}
  for (let i = 1; i <= 7; i++) pos[`p${i}`] = 'pb'
  if (s >= 1) ['p1', 'p2', 'p3'].forEach((p) => (pos[p] = 'sb'))
  if (s >= 2) pos.p1 = 'inc'
  if (s >= 3) ['p2', 'p3'].forEach((p) => (pos[p] = 'inc'))
  return pos
}

function kanbanAt(step: number): Record<string, KanPlace> {
  const pos: Record<string, KanPlace> = { k1: 'todo', k2: 'todo', k3: 'todo', k4: 'todo', k5: 'todo' }
  if (step >= 4) {
    pos.k1 = 'doing'
    pos.k2 = 'doing'
  }
  if (step >= 5) {
    pos.k1 = 'done'
    pos.k3 = 'doing'
  }
  return pos
}

function Box({ label, meta, children, tone }: { label: string; meta?: ReactNode; children: ReactNode; tone?: 'focus' | 'idle' }) {
  return (
    <div className="sk-box" data-tone={tone ?? 'idle'}>
      <div className="sk-box-head">
        <span className="sk-box-label">{label}</span>
        {meta}
      </div>
      <div className="sk-items">{children}</div>
    </div>
  )
}

function Event({ show, children }: { show: boolean; children: ReactNode }) {
  return (
    <div className="sk-event">
      <Link on={show} vertical tone={show ? 'focus' : 'idle'} />
      <motion.span className="sk-event-text" initial={false} animate={{ opacity: show ? 1 : 0 }} transition={t.fade}>
        {children}
      </motion.span>
    </div>
  )
}

function ScrumKanban({ step }: { step: number }) {
  const sp = scrumAt(step)
  const kp = kanbanAt(step)
  const pbi = (place: ScrumPlace) =>
    Object.keys(sp)
      .filter((k) => sp[k] === place && (k !== 'p7' || step >= 3))
      .map((k) => (
        <Token key={k} id={`sk-${k}`} tone={place === 'inc' ? 'focus' : 'idle'}>
          PBI {k.slice(1)}
        </Token>
      ))
  const card = (place: KanPlace) =>
    Object.keys(kp)
      .filter((k) => kp[k] === place)
      .map((k) => (
        <Token key={k} id={`sk-${k}`} tone={place === 'done' ? 'focus' : 'idle'}>
          Opgave {k.slice(1)}
        </Token>
      ))
  const kanbanOn = step >= 4

  return (
    <div className="sk">
      <section className="sk-panel">
        <div className="sk-title">Scrum: én sprint</div>
        <Box label="Product Backlog" meta={<span className="sk-meta">ordnet af Product Owner</span>} tone={step === 0 || step === 3 ? 'focus' : 'idle'}>
          {pbi('pb')}
        </Box>
        <Event show={step >= 1}>
          Sprint Planning (≤ 8 t): Development Team vælger items og laver et Sprint Goal
        </Event>
        <Box
          label="Sprint Backlog"
          meta={<Tag show={step >= 1}>Sprint Goal</Tag>}
          tone={step === 1 || step === 2 ? 'focus' : 'idle'}
        >
          {pbi('sb')}
        </Box>
        <Event show={step >= 2}>Sprint (≤ 1 måned, fast længde) · Daily Scrum 15 min hver dag</Event>
        <Box label="Increment" meta={<Tag show={step >= 2}>“Done”</Tag>} tone={step === 2 || step === 3 ? 'focus' : 'idle'}>
          {pbi('inc')}
        </Box>
        <div className="sk-end">
          <Tag show={step >= 3} tone="idle" wrap>
            Sprint Review (≤ 4 t): inspicér produktet, tilpas backloggen
          </Tag>
          <Tag show={step >= 3} tone="idle" wrap>
            Retrospective (≤ 3 t): inspicér processen
          </Tag>
        </div>
      </section>

      <section className="sk-panel sk-kanban" data-on={kanbanOn || undefined}>
        <div className="sk-title">Kanban-tavle</div>
        <div className="sk-src">Uden for materialet — L9 har kun arbejdsspørgsmålene</div>
        <div className="sk-board">
          <Box label="Klar">{card('todo')}</Box>
          <Box
            label="I gang"
            meta={
              <span className="sk-wip" data-full={step >= 4 || undefined}>
                WIP {step >= 4 ? 2 : 0}/2
              </span>
            }
            tone={step >= 4 ? 'focus' : 'idle'}
          >
            {card('doing')}
          </Box>
          <Box label="Færdig">{card('done')}</Box>
        </div>
        <div className="sk-kan-notes">
          <Tag show={step >= 4} tone="idle" wrap>
            ingen sprints: arbejdet flyder løbende
          </Tag>
          <Tag show={step >= 5} tone="neg" wrap>
            Opgave 4 venter — “I gang” er fuld
          </Tag>
          <Tag show={step >= 5} wrap>
            pull: Opgave 3 trækkes ind, da Opgave 1 blev færdig
          </Tag>
        </div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'scrum-kanban',
  title: 'En Scrum-sprint og en Kanban-tavle med WIP-grænse',
  steps: [
    {
      caption: '**Product Backlog** er en ordnet liste over alt, produktet kan få brug for. Product Owner ejer den og bestemmer rækkefølgen.',
      hold: 2200,
    },
    {
      caption: '**Sprint Planning**: Development Team vælger selv, hvor mange items der tages ind, og teamet formulerer et **Sprint Goal**. Det er **Sprint Backlog**.',
      hold: 2800,
    },
    {
      caption: 'Sprinten har fast længde (højst én måned). Hver dag synkroniserer **Daily Scrum** på 15 minutter; færdige items bliver en del af incrementet.',
      hold: 2600,
    },
    {
      caption: 'Incrementet skal være **“Done”**. **Sprint Review** inspicerer produktet og tilpasser backloggen (et nyt item kommer til); **Retrospective** inspicerer processen.',
      hold: 3200,
    },
    {
      caption: 'En Kanban-tavle har ingen sprints. Opgaver flyder fra venstre mod højre, og kolonnen “I gang” har en **WIP-grænse** på to. (Uden for materialet.)',
      hold: 2800,
    },
    {
      caption: 'Når kolonnen er fuld, må opgave 4 vente. Først da opgave 1 er færdig, **trækkes** opgave 3 ind — pull i stedet for push.',
      hold: 3200,
    },
  ],
  Component: ScrumKanban,
}

export default viz
