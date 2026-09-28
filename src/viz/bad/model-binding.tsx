import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './model-binding.css'

/* Fire anmodninger fra Model Binding- og Model Validation-slides:
   1. /api/pets/2?DogsOnly=true  → GetById(int id, bool dogsOnly)
   2. /api/pets/3?id=1           → route vinder over query
   3. POST /Home/Body med JSON   → Body([FromBody] Person model)
   4. /BoardGames?pageIndex=test → automatisk 400 fra [ApiController] */

type Seg = { text: string; role?: 'route' | 'query' | 'body' }
type Bind = { name: ReactNode; value: ReactNode; src: string; at: number }
interface Lane {
  id: string
  label: string
  method: string
  url: Seg[]
  body?: string
  action: ReactNode
  binds: Bind[]
  /** Trin hvor denne anmodning er i fokus. */
  steps: number[]
}

const LANES: Lane[] = [
  {
    id: 'l1',
    label: 'Simple typer',
    method: 'GET',
    url: [{ text: '/api/pets/' }, { text: '2', role: 'route' }, { text: '?DogsOnly=true', role: 'query' }],
    action: 'GetById(int id, bool dogsOnly)',
    binds: [
      { name: 'id', value: '2', src: 'route', at: 1 },
      { name: 'dogsOnly', value: 'true', src: 'query', at: 2 },
    ],
    steps: [1, 2],
  },
  {
    id: 'l2',
    label: 'Route mod query',
    method: 'GET',
    url: [{ text: '/api/pets/' }, { text: '3', role: 'route' }, { text: '?id=1', role: 'query' }],
    action: 'GetById(int id)',
    binds: [{ name: 'id', value: '3', src: 'route vinder', at: 3 }],
    steps: [3],
  },
  {
    id: 'l3',
    label: 'Kompleks type',
    method: 'POST',
    url: [{ text: '/Home/Body' }],
    body: '{ "firstName": "Bob",\n  "lastName": "Smith" }',
    action: 'Body([FromBody] Person model)',
    binds: [
      { name: 'model.FirstName', value: '"Bob"', src: 'body', at: 4 },
      { name: 'model.LastName', value: '"Smith"', src: 'body', at: 4 },
    ],
    steps: [4],
  },
  {
    id: 'l4',
    label: 'Ugyldig værdi',
    method: 'GET',
    url: [{ text: '/BoardGames' }, { text: '?pageIndex=test', role: 'query' }],
    action: 'Get(int pageIndex = 0, …)',
    binds: [],
    steps: [5, 6],
  },
]

const PROBLEM = `{ "title": "One or more validation errors occurred.",
  "status": 400,
  "errors": { "pageIndex": [ … ] } }`

function segTone(lane: Lane, seg: Seg, step: number): Tone {
  if (!seg.role) return 'idle'
  if (lane.id === 'l1') return (seg.role === 'route' && step === 1) || (seg.role === 'query' && step === 2) ? 'focus' : 'idle'
  if (lane.id === 'l2') return step >= 3 && seg.role === 'query' ? 'muted' : step === 3 ? 'focus' : 'idle'
  if (lane.id === 'l4') return step >= 5 ? 'neg' : 'idle'
  return 'idle'
}

function Binding({ step }: { step: number }) {
  return (
    <div className="mb">
      {LANES.map((lane, li) => {
        const active = lane.steps.includes(step)
        const touched = step >= lane.steps[0]
        const invalid = lane.id === 'l4' && step >= 5
        const rejected = lane.id === 'l4' && step >= 6
        return (
          <div key={lane.id} className="mb-lane" data-active={active || undefined}>
            <div className="mb-label">
              <span className="mb-num">{li + 1}</span>
              <span className="vcaps">{lane.label}</span>
            </div>

            <div className="mb-req">
              <div className="mb-url mono">
                <span className="mb-method">{lane.method}</span>
                {lane.url.map((s, i) => (
                  <span key={i} className="mb-seg" data-role={s.role} data-tone={segTone(lane, s, step)}>
                    {s.text}
                  </span>
                ))}
              </div>
              {lane.body && (
                <pre className="mb-body mono" data-tone={step === 4 ? 'focus' : 'idle'}>
                  {lane.body}
                </pre>
              )}
            </div>

            <Link on={touched} tone={invalid ? 'neg' : active ? 'focus' : 'idle'} className="mb-link" />

            <div className="mb-act">
              <code className="mb-sig" data-tone={rejected ? 'muted' : active ? 'focus' : 'idle'}>
                {lane.action}
              </code>
              {lane.binds.map((b, i) => (
                <motion.div
                  key={i}
                  className="mb-bind"
                  initial={false}
                  animate={{ opacity: step >= b.at ? 1 : 0, x: step >= b.at ? 0 : -6 }}
                  transition={step >= b.at ? stagger(i, 0.1, 0.12) : t.fade}
                >
                  <code>
                    {b.name} = {b.value}
                  </code>
                  <Tag tone={step === b.at ? 'focus' : 'idle'}>{b.src}</Tag>
                </motion.div>
              ))}
              {lane.id === 'l4' && (
                <>
                  <div className="mb-bind">
                    <Tag show={invalid} tone="neg">
                      ModelState ugyldig
                    </Tag>
                    <Tag show={rejected} tone="muted">
                      kaldes ikke
                    </Tag>
                  </div>
                  <motion.div
                    className="mb-problem"
                    initial={false}
                    animate={{ opacity: rejected ? 1 : 0, y: rejected ? 0 : 6 }}
                    transition={t.settle}
                  >
                    <Tag tone="neg">400 Bad Request</Tag>
                    <pre className="mono">{PROBLEM}</pre>
                  </motion.div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

const viz: VizDef = {
  id: 'model-binding',
  title: 'Fra HTTP-anmodning til parametre og validering',
  steps: [
    {
      caption: 'Fire anmodninger fra materialet. Model binding skal fylde action-metodens parametre ud fra anmodningen.',
      hold: 2200,
    },
    {
      caption: '`id` er en simpel type, så binderen leder i URI’en — først i **route**-værdierne: `id = 2`.',
      hold: 2400,
    },
    {
      caption: '`dogsOnly` står ikke i routen, så den hentes fra **query string** og konverteres til `bool`.',
      hold: 2200,
    },
    {
      caption: 'Står `id` både i route og query, vinder **route**: `api/pets/3?id=1` giver `id = 3`, og `id=1` ignoreres.',
      hold: 2800,
    },
    {
      caption: '`Person` er en kompleks type og læses fra **body** (standard for `[ApiController]`). Binderen sætter de offentlige properties én ad gangen.',
      hold: 2800,
    },
    {
      caption: 'Efter binding kommer validering. `pageIndex=test` kan ikke blive til en `int`, så `ModelState` er ugyldig.',
      hold: 2400,
    },
    {
      caption: '`[ApiController]` svarer selv **400 Bad Request** med ProblemDetails. Action-metoden `Get` kaldes aldrig.',
      hold: 3000,
    },
    {
      caption: 'Simple typer fra route, så query. Komplekse typer fra body. En ugyldig værdi stopper anmodningen, før din kode kører.',
      hold: 3000,
    },
  ],
  Component: Binding,
}

export default viz
