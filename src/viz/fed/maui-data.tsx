import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './maui-data.css'

/* Lokalt: udleveret Database.cs fra lab 02 (MauiTodo) og MAUI Making App Interactive.pdf
   s. 22–25. Remote: demoprojektet til lab 09 (Services/HackerNewsService.cs) og
   HackerNewsResponse.cs; Httpclient.pdf s. 4 og 10. Eksamenskravet: SW4FED-02 2025
   Sommer s. 2 (samme i de tre andre sæt). Materialet har ingen JSON-værdier og ingen
   rækkedata — figuren viser kun feltnavne og kolonnehoved. */

const S = String.fromCharCode(0xad)

function Line({ show, on, children, delay = 0 }: { show: boolean; on: boolean; children: ReactNode; delay?: number }) {
  return (
    <motion.div
      className="mda-line"
      data-on={on || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0, x: show ? 0 : -6 }}
      transition={show ? { ...t.settle, delay } : t.fade}
    >
      {children}
    </motion.div>
  )
}

function Pair({
  down,
  up,
  downTone,
  upTone,
  downLabel,
  upLabel,
  cap,
}: {
  down: boolean
  up: boolean
  downTone: 'focus' | 'idle'
  upTone: 'focus' | 'idle'
  downLabel?: ReactNode
  upLabel?: ReactNode
  cap?: ReactNode
}) {
  return (
    <div className="mda-pair">
      {cap}
      <div className="mda-arrows">
        <Link on={down} vertical tone={downTone} label={downLabel} />
        <Link on={up} vertical back tone={upTone} label={upLabel} />
      </div>
    </div>
  )
}

function MauiData({ step }: { step: number }) {
  const f = (on: boolean) => (on ? 'focus' : 'idle') as 'focus' | 'idle'
  const map = step === 5
  const done = at(step, 6)

  return (
    <div className="mda">
      {/* ViewModel */}
      <div className="mda-vm" data-on={done || undefined}>
        <div className="mda-vm-head">
          <span className="mda-vm-name">ViewModel</span>
          <code className="mda-vm-coll">
            Observable{S}Collection&lt;…&gt;
          </code>
        </div>
        <div className="mda-vm-slots">
          <span className="mda-vm-slot">
            {at(step, 3) && (
              <Token id="mda-list" tone={step === 3 || done ? 'focus' : 'idle'}>
                List&lt;TodoItem&gt;
              </Token>
            )}
          </span>
          <span className="mda-vm-slot">
            {done && (
              <Token id="mda-hits" tone="focus">
                Hit[] Hits
              </Token>
            )}
          </span>
        </div>
      </div>

      {/* ViewModel → services */}
      <div className="mda-a-l1">
        <Pair
          cap={<span className="vcaps mda-track">Lokalt — SQLite</span>}
          down={at(step, 3)}
          up={at(step, 3)}
          downTone={f(step === 3)}
          upTone={f(step === 3 || done)}
          downLabel="await"
        />
      </div>
      <div className="mda-a-r1">
        <Pair
          cap={<span className="vcaps mda-track">Remote — web API</span>}
          down={at(step, 4)}
          up={done}
          downTone={f(step === 4)}
          upTone={f(done)}
          downLabel="await"
        />
      </div>

      {/* Lokal service */}
      <div className="mda-svc mda-a-ls" data-on={(step >= 1 && step <= 3) || undefined}>
        <div className="mda-svc-head">
          <code className="mda-svc-name">Database</code>
          <span className="mda-svc-sub">MauiTodo · data access</span>
        </div>
        <Line show={at(step, 1)} on={step === 1}>
          <code>SecureStorage.GetAsync("dbKey")</code>
          <Tag wrap show={at(step, 1)} tone={step === 1 ? 'focus' : 'idle'}>
            GUID — krypteret af OS’et
          </Tag>
        </Line>
        <Line show={at(step, 1)} on={step === 1} delay={0.35}>
          <code>
            SQLite{S}Connection{S}String(databasePath, true, key: …)
          </code>
          <code className="mda-arrow">→ SQLite{S}Async{S}Connection</code>
        </Line>
        <Line show={at(step, 2)} on={step === 2}>
          <code>await CreateTableAsync&lt;TodoItem&gt;()</code>
          <div className="mda-class">
            <code className="mda-class-name">class TodoItem</code>
            <code>
              <span className="mda-attr">[PrimaryKey, AutoIncrement]</span> Id
            </code>
            <code>Title · Due · Done</code>
          </div>
        </Line>
        <Line show={at(step, 3)} on={step === 3}>
          <code>InsertAsync(item)</code>
          <code>Table&lt;TodoItem&gt;(){'\u200B'}.ToListAsync()</code>
        </Line>
      </div>

      {/* Remote service */}
      <div className="mda-svc mda-a-rs" data-on={(step >= 4 && step <= 5) || undefined}>
        <div className="mda-svc-head">
          <code className="mda-svc-name">
            Hacker{S}News{S}Service
          </code>
          <span className="mda-svc-sub mono">: IHacker{S}News{S}Service</span>
        </div>
        <Line show={at(step, 4)} on={step === 4}>
          <code>new HttpClient {'{'}</code>
          <code className="mda-indent">BaseAddress = new Uri("https://hn.algolia.com/api/")</code>
          <code>{'}'}</code>
        </Line>
        <Line show={at(step, 5)} on={step === 5}>
          <code>
            GetFrom{S}Json{S}Async&lt;Hacker{S}News{S}Response&gt;(…)
          </code>
          <div className="mda-classes">
            <div className="mda-class">
              <code className="mda-class-name">
                Hacker{S}News{S}Response
              </code>
              <code>
                Hit[] <span className="mda-f" data-on={map || undefined}>Hits</span>
              </code>
            </div>
            <div className="mda-class">
              <code className="mda-class-name">Hit</code>
              <code>
                <span className="mda-f" data-on={map || undefined}>Title</span> ·{' '}
                <span className="mda-f" data-on={map || undefined}>Author</span> ·{' '}
                <span className="mda-f" data-on={map || undefined}>Url</span>
              </code>
            </div>
          </div>
        </Line>
      </div>

      {/* Service → lager */}
      <div className="mda-a-l2">
        <Pair
          down={at(step, 1)}
          up={at(step, 3)}
          downTone={f(step === 1 || step === 3)}
          upTone={f(step === 3)}
          downLabel={step >= 3 ? 'InsertAsync' : 'åbner'}
          upLabel="ToListAsync"
        />
      </div>
      <div className="mda-a-r2">
        <Pair
          down={at(step, 4)}
          up={at(step, 5)}
          downTone={f(step === 4)}
          upTone={f(step === 5)}
          downLabel={<code>GET v1/search?{'\u200B'}query={'{topic}'}</code>}
          upLabel="JSON"
        />
      </div>

      {/* Lagre */}
      <div className="mda-store mda-a-lst">
        <div className="mda-db" data-on={(step >= 1 && step <= 3) || undefined}>
          <div className="mda-db-head">
            <code className="mda-db-name">MauiTodo.db</code>
            <Tag show={at(step, 1)} tone="idle">
              krypteret
            </Tag>
          </div>
          <code className="mda-db-dir">FileSystem.AppDataDirectory</code>
          <motion.div
            className="mda-cols"
            initial={false}
            animate={{ opacity: at(step, 2) ? 1 : 0, y: at(step, 2) ? 0 : -8 }}
            transition={at(step, 2) ? t.place : t.fade}
          >
            {['Id', 'Title', 'Due', 'Done'].map((c, i) => (
              <motion.span
                key={c}
                className={i === 0 ? 'is-pk' : undefined}
                initial={false}
                animate={{ opacity: at(step, 2) ? 1 : 0 }}
                transition={at(step, 2) ? stagger(i, 0.2, 0.1) : t.fade}
              >
                {c}
              </motion.span>
            ))}
          </motion.div>
        </div>
      </div>

      <div className="mda-store mda-a-rst">
        <div className="mda-server" data-on={(step >= 4 && step <= 5) || undefined}>
          <div className="mda-db-head">
            <code className="mda-db-name">hn.algolia.com</code>
            <span className="mda-svc-sub">web API</span>
          </div>
          <motion.code
            className="mda-json"
            initial={false}
            animate={{ opacity: at(step, 5) ? 1 : 0 }}
            transition={at(step, 5) ? t.settle : t.fade}
          >
            {'{ '}
            <span className="mda-f" data-on={map || undefined}>"hits"</span>: [{'\n'}
            {'  { '}
            <span className="mda-f" data-on={map || undefined}>"title"</span>,{' '}
            <span className="mda-f" data-on={map || undefined}>"author"</span>,{' '}
            <span className="mda-f" data-on={map || undefined}>"url"</span>
            {' }, …\n] }'}
          </motion.code>
        </div>
        <motion.p
          className="mda-clear vnote"
          initial={false}
          animate={{ opacity: done ? 1 : 0 }}
          transition={done ? t.settle : t.fade}
        >
          Android: <code>usesCleartextTraffic="true"</code> for http
        </motion.p>
      </div>

      <motion.div
        className="mda-foot"
        initial={false}
        animate={{ opacity: done ? 1 : 0, y: done ? 0 : 6 }}
        transition={done ? t.settle : t.fade}
        aria-hidden={!done || undefined}
      >
        <Tag tone="focus">Eksamen</Tag>
        <span className="vnote">
          Opgave 1 i alle fire sæt: alle data skal persisteres — SQLite, filer eller json-server via HttpClient.
        </span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'maui-data',
  title: 'To veje til data fra samme ViewModel',
  steps: [
    {
      caption: 'ViewModellen kalder en service. Bag den kan data ligge **lokalt** på enheden i SQLite eller **remote** bag et web API.',
      hold: 2200,
    },
    {
      caption: 'Lokalt: `Database` åbner `MauiTodo.db` i appens datamappe med en nøgle fra `SecureStorage` — en GUID, som OS’et krypterer og gemmer.',
      hold: 2800,
    },
    { caption: '`CreateTableAsync<TodoItem>()` laver tabellen ud fra modelklassen, før der læses eller skrives.', hold: 2200 },
    {
      caption: 'CRUD er asynkron: `InsertAsync(item)` skriver, `Table<TodoItem>().ToListAsync()` læser — og resultatet er C#-objekter.',
      hold: 2600,
    },
    { caption: 'Remote: én `HttpClient` med `BaseAddress` sender `GET v1/search?query=…` til API’et.', hold: 2200 },
    {
      caption: 'Svaret er JSON. `GetFromJsonAsync<HackerNewsResponse>` deserialiserer det til objekter, hvis properties matcher felterne.',
      hold: 3000,
    },
    {
      caption: 'Begge veje ender i ViewModellens `ObservableCollection`, og listen på skærmen opdateres. Til eksamen skal alle data persisteres.',
      hold: 3000,
    },
  ],
  Component: MauiData,
}

export default viz
