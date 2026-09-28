import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, VTable, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './promise-fetch.css'

/* FED Fetch.pdf s. 5–7 og Promises.pdf s. 1–7, 17. Koden er slidets (s. 7) med
   eksamenssættets request (SW4FED-02 2024 Sommer s. 3) og aftalerne fra bilag 1.
   Fejlgrenen har ingen statuskode i materialet; 404 er et eksempel. */

const SHY = String.fromCharCode(0xad)

const CODE: { text: string; depth: number }[] = [
  { text: "fetch('/appointments?licensePlate=AL12345')", depth: 0 },
  { text: '.then(response => {', depth: 1 },
  { text: 'if (!response.ok) {', depth: 2 },
  { text: "throw new Error('Network error. Status Code: ' + response.status);", depth: 3 },
  { text: '}', depth: 2 },
  { text: 'return response.json()', depth: 2 },
  { text: '})', depth: 1 },
  { text: '.catch(err => {', depth: 1 },
  { text: "console.log('Fetch Error :-S', err);", depth: 2 },
  { text: '});', depth: 1 },
]

const AWAIT: { text: string; depth: number }[] = [
  { text: 'try {', depth: 0 },
  { text: 'let response = await fetch(url);', depth: 1 },
  { text: 'return await response.json()', depth: 1 },
  { text: '} catch (err) { console.error(err); }', depth: 0 },
]

// Fremhævede kodelinjer pr. trin (ok-grenen blå, fejlgrenen rød).
const LINES: { on: number[]; tone: Tone }[] = [
  { on: [], tone: 'focus' },
  { on: [0], tone: 'focus' },
  { on: [0], tone: 'muted' },
  { on: [1, 2], tone: 'focus' },
  { on: [5], tone: 'focus' },
  { on: [2, 3, 7, 8], tone: 'neg' },
  { on: [], tone: 'focus' },
]

const DATA: [string, string][] = [
  ['customerName', '"Anders And"'],
  ['carBrand', '"Ford"'],
  ['carModel', '"Kuga"'],
  [`license${SHY}Plate`, '"AL12345"'],
  ['date', '"2024-07-01"'],
]

function Code({ lines, hi, tone }: { lines: typeof CODE; hi: number[]; tone: Tone }) {
  return (
    <ol className="pf-code">
      {lines.map((l, i) => (
        <li key={i} className="mono" data-tone={hi.includes(i) ? tone : 'idle'} style={{ paddingLeft: `calc(0.5rem + ${l.depth * 2 + 2}ch)` }}>
          {l.text}
        </li>
      ))}
    </ol>
  )
}

function State({ show, tone, children }: { show: boolean; tone: Tone; children: ReactNode }) {
  return (
    <Tag show={show} tone={tone === 'ok' ? 'focus' : tone}>
      {children}
    </Tag>
  )
}

/** Én linje i en gren: tilstand til venstre, kode og forklaring til højre. */
function Beat({ show, i, now, tone, state, code, note, skipped }: {
  show: boolean
  i: number
  now: boolean
  tone: Tone
  state: ReactNode
  code: ReactNode
  note?: ReactNode
  skipped?: boolean
}) {
  return (
    <motion.li
      className="pf-beat"
      data-tone={!show ? 'ghost' : now ? tone : skipped ? 'muted' : 'idle'}
      data-skip={skipped || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0.25, y: show ? 0 : 3 }}
      transition={show ? stagger(i, 0.1, 0.22) : t.fade}
    >
      <span className="pf-state">{state}</span>
      <span className="pf-what">
        <span className="mono pf-code-inline">{code}</span>
        {note && <span className="pf-note">{note}</span>}
      </span>
    </motion.li>
  )
}

function PromiseFetch({ step }: { step: number }) {
  const { on, tone } = LINES[step]
  const sent = at(step, 1)
  const answered = at(step, 3)
  const data = at(step, 4)
  const fail = at(step, 5)
  const end = at(step, 6)
  const promiseState = answered ? 'fulfilled' : 'ikke færdig'

  return (
    <div className="pf">
      <div className="pf-left">
        <span className="vcaps">FED Fetch.pdf s. 7 · URL og data fra eksamen sommer 2024, bilag 1</span>
        <Code lines={CODE} hi={on} tone={tone} />
      </div>

      <div className="pf-right">
        <section className="pf-server" data-on={(step === 3) || undefined}>
          <header className="pf-head">
            <span className="pf-name">json-server</span>
            <code className="pf-sub">db.json</code>
          </header>
          <div className="pf-table">
            <VTable
              name={<code>appointments</code>}
              compact
              cols={['id', 'customerName', `license${SHY}Plate`, 'date']}
              rows={[
                { key: '1', cells: ['1', 'Anders And', 'AL12345', '2024-07-01'], tone: step === 3 ? 'focus' : 'idle' },
                { key: '2', cells: ['2', 'Andersine', 'BB45678', '2024-07-02'] },
              ]}
            />
          </div>
        </section>

        <div className="pf-wire" aria-label="Netværk">
          <div className="pf-msg" data-on={sent || undefined}>
            <span className="pf-arrow">↑</span>
            <Tag show={sent} tone={step === 1 || step === 2 ? 'focus' : 'idle'} wrap>
              GET /appointments?{`license${SHY}Plate`}=AL12345
            </Tag>
          </div>
          <div className="pf-msg" data-on={answered || undefined}>
            <span className="pf-arrow">↓</span>
            <Tag show={answered} tone={step === 3 ? 'focus' : 'idle'}>
              200
            </Tag>
            <Tag show={fail} tone="neg">
              fx 404
            </Tag>
          </div>
        </div>
        <motion.div className="pf-await" initial={false} animate={{ opacity: end ? 1 : 0 }} transition={t.fade} aria-hidden={!end || undefined}>
          <span className="vcaps">
            samme kæde med <code>await</code> (s. 5–6)
          </span>
          <Code lines={AWAIT} hi={[]} tone="idle" />
        </motion.div>
      </div>

      <section className="pf-browser">
        <header className="pf-head">
          <span className="pf-name">browser</span>
          <span className="pf-sub">JavaScript</span>
        </header>

        <div className="pf-main">
          <div className="pf-promise" data-state={!sent ? 'none' : answered ? 'ok' : 'open'}>
            <span className="pf-promise-name">Promise</span>
            <span className="pf-promise-state">{sent ? promiseState : '—'}</span>
          </div>
          <motion.div
            className="pf-meanwhile"
            data-now={step === 2 || undefined}
            initial={false}
            animate={{ opacity: at(step, 2) ? 1 : 0 }}
            transition={t.fade}
          >
            <span className="pf-note">koden efter kaldet kører videre (Promises s. 7)</span>
            <code>console.log("Can't know if promise has finished yet...")</code>
          </motion.div>
        </div>

        <div className="pf-branches">
          <div className="pf-branch">
            <span className="pf-branch-name" data-on={answered || undefined}>
              svaret er ok
            </span>
            <ol className="pf-beats">
              <Beat
                show={answered}
                i={0}
                now={step === 3}
                tone="focus"
                state={<State show tone="ok">fulfilled</State>}
                code="Response"
                note="status 200 — gives til then"
              />
              <Beat
                show={answered}
                i={1}
                now={step === 3}
                tone="focus"
                state={<span className="pf-check">✓</span>}
                code="response.ok"
                note={
                  <>
                    så <code>return response.json()</code>
                  </>
                }
              />
              <Beat
                show={data}
                i={0}
                now={step === 4}
                tone="focus"
                state={<State show tone="ok">fulfilled</State>}
                code="response.json()"
                note="en ny Promise — giver data"
              />
            </ol>
            <motion.div
              className="pf-data"
              data-now={step === 4 || undefined}
              initial={false}
              animate={{ opacity: data ? 1 : 0, y: data ? 0 : 6 }}
              transition={data ? { ...t.place, delay: 0.35 } : t.fade}
            >
              <span className="vcaps">data</span>
              <dl>
                {DATA.map(([k, v]) => (
                  <div key={k}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
            </motion.div>
          </div>

          <div className="pf-branch" data-fail>
            <span className="pf-branch-name" data-on={fail || undefined}>
              status er ikke ok
            </span>
            <ol className="pf-beats">
              <Beat
                show={fail}
                i={0}
                now={step === 5}
                tone="neg"
                state={<State show tone="idle">fulfilled</State>}
                code="Response"
                note={
                  <>
                    <code>response.ok</code> er false (fx 404)
                  </>
                }
              />
              <Beat
                show={fail}
                i={1}
                now={step === 5}
                tone="neg"
                state={<span className="pf-throw">throw</span>}
                code="new Error('Network error. …')"
                note="then-callbacken kaster"
              />
              <Beat
                show={fail}
                i={2}
                now={step === 5}
                tone="neg"
                state={<State show tone="neg">rejected</State>}
                code="return response.json()"
                note="springes over"
                skipped
              />
              <Beat
                show={fail}
                i={3}
                now={step === 5}
                tone="neg"
                state={<span className="pf-catch">catch</span>}
                code="console.log('Fetch Error :-S', err)"
                note="får fejlen"
              />
            </ol>
          </div>
        </div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'promise-fetch',
  title: 'fetch giver et løfte, then får svaret',
  steps: [
    { caption: 'Appen skal finde en aftale ud fra nummerpladen. Til højre json-serveren med `db.json`.', hold: 1600 },
    {
      caption: '`fetch(…)` sender en GET og returnerer **straks** en Promise, der ikke er færdig endnu.',
      hold: 2400,
    },
    {
      caption: 'Koden efter kaldet kører videre med det samme — den kan ikke vide, om Promisen er færdig. Kun `then` kører *efter* den.',
      hold: 2600,
    },
    {
      caption:
        'Svaret kommer: Promisen bliver **fulfilled** med et `Response`. `then` tjekker `response.ok` og kalder `response.json()`, som selv er en Promise.',
      hold: 3000,
    },
    { caption: '`json()` bliver fulfilled med data — aftalen med `licensePlate` `AL12345`.', hold: 2400 },
    {
      caption:
        'Er status ikke ok (fx 404), kaster `then` en fejl. Promisen bliver **rejected**, resten af kæden springes over, og `catch` får fejlen.',
      hold: 3000,
    },
    {
      caption: 'Samme kæde med `await`: `await` pakker Promisen ud, og en rejection bliver en exception til `try`/`catch`.',
      hold: 3000,
    },
  ],
  Component: PromiseFetch,
}

export default viz
