import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Swap, Tag, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './react-fetch.css'

/* FED React fetching data.pdf s. 2–7 og demoprojektet L24/app-state-demo
   (branch usecallback): UserPicker.js og db.json. Brugerne har også img,
   title og notes; figuren viser kun id og name. */

const USERS = ['Mark', 'Simon', 'Clarisse', 'Sanjiv']

type Hl = 'state' | 'effect' | 'fetch' | 'set' | 'deps' | 'spinner'

const CODE: { text: ReactNode; hl?: Hl }[] = [
  { text: 'const [users, setUsers] = useState(null);', hl: 'state' },
  { text: 'useEffect(() => {', hl: 'effect' },
  {
    text: (
      <>
        {'  fetch("http://localhost:4001/'}
        <wbr />
        {'users")'}
      </>
    ),
    hl: 'fetch',
  },
  { text: '    .then(resp => resp.json())', hl: 'set' },
  { text: '    .then(data => setUsers(data));', hl: 'set' },
  { text: '}, []);', hl: 'deps' },
  { text: 'if (users === null) return <Spinner />', hl: 'spinner' },
]

function hlAt(step: number): Hl[] {
  if (step === 1) return ['state', 'spinner']
  if (step === 2) return ['effect', 'fetch', 'deps']
  if (step === 4) return ['set']
  if (step === 5) return ['deps']
  return []
}

/* Statisk spinner: en ring med en bue. Ingen rotation. */
function Spinner() {
  return (
    <svg className="rf-spinner" width="28" height="28" viewBox="0 0 28 28" aria-hidden="true">
      <circle cx="14" cy="14" r="10" fill="none" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M14 4a10 10 0 0 1 10 10" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  )
}

function Fetch({ step }: { step: number }) {
  const hl = hlAt(step)
  const view = step >= 4 ? 2 : step >= 1 ? 1 : 0
  // Hvor er beskeden? Trin 2: hos serveren. Trin 3: tilbage i browseren.
  const msgAt = step === 2 ? 'server' : step === 3 ? 'browser' : step === 1 ? 'outbox' : null
  const msg = (
    <Token id="rf-msg" tone="focus" launch={step === 2} wrap>
      {step === 3 ? (
        <>
          <span className="rf-long">{'[{ id: 1, name: "Mark" }, …]'}</span>
          <span className="rf-short">{'[{ id: 1, … }, …]'}</span>
        </>
      ) : (
        'GET /users'
      )}
    </Token>
  )

  return (
    <div className="rf">
      {/* Browseren med React-appen. */}
      <section className="rf-app" data-on={step >= 1 && step <= 5 ? true : undefined}>
        <header className="rf-head">
          <span className="vcaps">Browser · React</span>
          <Tag tone={step === 4 ? 'focus' : 'idle'}>
            <Swap show={step >= 4 ? 1 : 0} items={['users: null', 'users: Array(4)']} />
          </Tag>
        </header>
        <div className="rf-name mono">
          UserPicker<span className="rf-dim">()</span>
        </div>
        <div className="rf-code mono">
          {CODE.map((l, i) => (
            <div key={i} className="rf-line" data-on={(l.hl && hl.includes(l.hl)) || undefined}>
              {l.text}
            </div>
          ))}
        </div>

        <div className="rf-screen">
          <Swap
            show={view}
            items={[
              <span key="empty" className="rf-empty">
                ingen render endnu
              </span>,
              <span key="spin" className="rf-spin">
                <Spinner />
                <span className="rf-spin-label">
                  <span className="mono">{'<Spinner />'}</span>
                  <span>data er der ikke ved første render</span>
                </span>
              </span>,
              <div key="select" className="rf-select">
                <span className="rf-select-box">
                  <span>Mark</span>
                  <span aria-hidden="true">▾</span>
                </span>
                <ul className="rf-options">
                  {USERS.map((u, i) => (
                    <motion.li
                      key={u}
                      initial={false}
                      animate={{ opacity: step >= 4 ? 1 : 0, y: step >= 4 ? 0 : 4 }}
                      transition={step >= 4 ? stagger(i, 0.15, 0.08) : t.fade}
                    >
                      <span className="mono rf-key">key={i + 1}</span> {u}
                    </motion.li>
                  ))}
                </ul>
              </div>,
            ]}
          />
        </div>

        {/* Den nye render må ikke hente igen. */}
        <motion.div
          className="rf-loop"
          initial={false}
          animate={{ opacity: at(step, 5) ? 1 : 0, y: at(step, 5) ? 0 : 4 }}
          transition={at(step, 5) ? t.settle : t.fade}
        >
          <span className="rf-loop-flow">
            <span className="mono">ny render</span>
            <span className="rf-loop-arrow" aria-hidden="true" />
            <span className="mono rf-loop-no">fetch</span>
          </span>
          <Tag tone={step === 5 ? 'neg' : 'idle'} wrap>
            To avoid an infinite loop!
          </Tag>
        </motion.div>
      </section>

      {/* Netværket: pile og beskeden, der rejser mellem de to sider. */}
      <div className="rf-net">
        <span className="rf-slot rf-slot-l">
          {msgAt === 'outbox' && <span className="rf-hidden">{msg}</span>}
          {msgAt === 'browser' && msg}
        </span>
        <div className="rf-links rf-links-h">
          <div className="rf-net-row">
            <span className="rf-net-label" data-on={at(step, 2) || undefined}>
              GET /users
            </span>
            <Link on={at(step, 2)} tone={step === 2 ? 'focus' : 'idle'} />
          </div>
          <div className="rf-net-row">
            <Link on={at(step, 3)} back tone={step === 3 ? 'focus' : 'idle'} />
            <span className="rf-net-label" data-on={at(step, 3) || undefined}>
              200 · JSON
            </span>
          </div>
        </div>
        <div className="rf-links rf-links-v">
          <span className="rf-net-row">
            <Link on={at(step, 2)} vertical tone={step === 2 ? 'focus' : 'idle'} />
            <span className="rf-net-label" data-on={at(step, 2) || undefined}>
              GET /users
            </span>
          </span>
          <span className="rf-net-row">
            <Link on={at(step, 3)} vertical back tone={step === 3 ? 'focus' : 'idle'} />
            <span className="rf-net-label" data-on={at(step, 3) || undefined}>
              200 · JSON
            </span>
          </span>
        </div>
        <span className="rf-slot rf-slot-r">{msgAt === 'server' && msg}</span>
      </div>

      {/* json-server med db.json. */}
      <section className="rf-server" data-on={step === 2 || step === 3 ? true : undefined}>
        <header className="rf-head">
          <span className="vcaps">json-server · port 4001</span>
          <motion.span initial={false} animate={{ opacity: step === 3 ? 1 : 0 }} transition={t.fade}>
            <Tag tone="focus">2000 ms</Tag>
          </motion.span>
        </header>
        <div className="rf-term mono">
          <span className="rf-dim">$ </span>json-server --watch db.json --port 4001 --delay 2000
        </div>
        <div className="rf-db mono">
          <div className="rf-db-name">db.json</div>
          <div data-i="0">{'{'}</div>
          <div data-i="1" className="rf-db-key">{'"bookables": [ … ],'}</div>
          <div className="rf-db-users" data-on={step === 3 || undefined}>
            <div data-i="1" className="rf-db-key">{'"users": ['}</div>
            {USERS.map((u, i) => (
              <div key={u} data-i="2">
                {`{ "id": ${i + 1}, "name": "${u}" }${i < USERS.length - 1 ? ',' : ''}`}
              </div>
            ))}
            <div data-i="1" className="rf-db-key">{'],'}</div>
          </div>
          <div data-i="1" className="rf-db-key">{'"bookings": []'}</div>
          <div data-i="0">{'}'}</div>
        </div>
      </section>

      {/* Fejlvejen fra getData (s. 6–7). */}
      <motion.div
        className="rf-error"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0, y: at(step, 6) ? 0 : 4 }}
        transition={at(step, 6) ? t.settle : t.fade}
      >
        <span className="vcaps">Fejlvejen</span>
        <ol className="rf-error-flow">
          <li className="mono">getData(url)</li>
          <li className="mono">!resp.ok</li>
          <li className="mono rf-neg">throw Error("There was a problem fetching data.")</li>
          <li className="mono">{'setState({ …, isLoading: false, error })'}</li>
        </ol>
      </motion.div>

      <motion.ul
        className="rf-legend"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0, y: at(step, 6) ? 0 : 4 }}
        transition={at(step, 6) ? { ...t.settle, delay: 0.15 } : t.fade}
      >
        <li>spinner → fetch efter render → setState → ny render</li>
        <li>
          <span className="mono">[]</span> = kun ved mount
        </li>
      </motion.ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'react-fetch',
  title: 'UserPicker henter brugere fra json-server',
  steps: [
    { caption: 'Til venstre React-appen med `UserPicker`, til højre json-server med `db.json`.', hold: 1600 },
    { caption: 'Første render: `users === null`, så komponenten returnerer `<Spinner />`.', hold: 2200 },
    { caption: 'Efter render kører effecten: `fetch("http://localhost:4001/users")` sender `GET /users`.', hold: 2400 },
    {
      caption: 'json-server finder samlingen `users` i `db.json` og svarer med JSON — efter `--delay 2000`, så spinneren kan ses.',
      hold: 2800,
    },
    { caption: '`resp.json()` → `setUsers(data)` → ny render. Nu returnerer komponenten en `<select>` med en `<option>` pr. bruger.', hold: 2800 },
    { caption: '`[]`: den nye render kører ikke effecten igen. Uden arrayet ville `setUsers` udløse en ny fetch — en uendelig løkke.', hold: 2800 },
    {
      caption: 'Fejlvejen: er `resp.ok` falsk, kastes en fejl, som lander i `error` i state sammen med `isLoading: false`.',
      hold: 3000,
    },
  ],
  Component: Fetch,
}

export default viz
