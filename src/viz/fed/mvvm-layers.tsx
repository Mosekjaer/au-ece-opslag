import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Tag, Token, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './mvvm-layers.css'

/* The MVVM Pattern.pdf s. 2, 5, 17, 21–25 (MauiTodo med MainViewModel) og
   MVVM Community Toolkit.pdf s. 13 og 20. Billedet på s. 17 skriver NewTodoDate,
   koden hedder NewTodoDue. Materialet har ingen titel på et nyt to-do-item, så
   figuren skriver kun “titel” og “ny”. */

const S = String.fromCharCode(0xad)

const ITEMS = [
  { title: 'First item', done: false },
  { title: 'Second item', done: true },
  { title: 'Third item', done: false },
]

type Row = 'title' | 'due' | 'add' | 'list'

/** Kald/binding mod højre (fuldt optrukket) og event tilbage (stiplet). */
function RowLinks({ row, fwd, fwdTone, back, backTone, fwdLabel, backLabel }: {
  row: Row
  fwd: boolean
  fwdTone: 'focus' | 'muted' | 'idle'
  back?: boolean
  backTone?: 'focus' | 'idle'
  fwdLabel: ReactNode
  backLabel?: ReactNode
}) {
  return (
    <div className={`mvm-links mvm-lk-${row}`}>
      <Link on={fwd} tone={fwdTone} label={fwdLabel} />
      {backLabel !== undefined && <Link on={!!back} back tone={backTone} label={backLabel} className="mvm-ev" />}
    </div>
  )
}

function Mvvm({ step }: { step: number }) {
  const typed = step >= 1 && step <= 3
  const pressed = step === 2
  const events = at(step, 4)
  const toolkit = step === 5
  const roles = at(step, 6)
  const f = (on: boolean) => (on ? 'focus' : 'idle') as 'focus' | 'idle'
  const baseTone = step === 0 ? 'muted' : 'idle'

  const todoToken = (
    <Token id="mvm-todo" tone={step === 2 || step === 3 ? 'focus' : 'idle'}>
      todo
    </Token>
  )

  return (
    <div className="mvm" data-toolkit={toolkit || undefined}>
      <div className="mvm-grid">
        {/* View */}
        <section className="mvm-col mvm-view">
          <header className="mvm-head">
            <span className="mvm-layer">View</span>
            <code className="mvm-class">MainPage</code>
            <motion.span className="mvm-role" initial={false} animate={{ opacity: roles ? 1 : 0 }} transition={roles ? t.settle : t.fade}>
              UI logic
            </motion.span>
          </header>
          <div className="mvm-phone">
            <div className="mvm-ctl" data-on={step === 1 || step === 4 || undefined}>
              <span className="mvm-label">Todo Item Title</span>
              <span className="mvm-input">
                <motion.span initial={false} animate={{ opacity: typed ? 1 : 0 }} transition={t.fade}>
                  titel
                </motion.span>
              </span>
              <motion.code className="mvm-xaml" initial={false} animate={{ opacity: at(step, 1) ? 1 : 0 }} transition={t.fade}>
                Text="{'{'}Binding NewTodoTitle{'}'}"
              </motion.code>
            </div>
            <div className="mvm-ctl" data-on={step === 4 || undefined}>
              <span className="mvm-label">Due Date</span>
              <span className="mvm-input mvm-date" />
            </div>
            <div className="mvm-ctl">
              <motion.span
                className="mvm-btn"
                data-on={pressed || undefined}
                initial={false}
                animate={{ scale: pressed ? 0.94 : 1 }}
                transition={t.place}
              >
                Add
              </motion.span>
              <motion.code className="mvm-xaml" initial={false} animate={{ opacity: at(step, 2) ? 1 : 0 }} transition={t.fade}>
                Command="{'{'}Binding AddTodoCommand{'}'}"
              </motion.code>
            </div>
            <ul className="mvm-list">
              {ITEMS.map((it) => (
                <li key={it.title} className="mvm-item">
                  <span className="mvm-check" data-on={it.done || undefined} aria-hidden="true" />
                  <span className="mvm-item-title">{it.title}</span>
                  <span className="mvm-item-date">25th May 2022</span>
                </li>
              ))}
              <motion.li
                className="mvm-item mvm-item-new"
                initial={false}
                animate={{ opacity: events ? 1 : 0, x: events ? 0 : -10 }}
                transition={events ? { ...t.place, delay: 0.35 } : t.fade}
              >
                <span className="mvm-check" aria-hidden="true" />
                <span className="mvm-item-title">ny</span>
              </motion.li>
            </ul>
          </div>
        </section>

        {/* Forbindelser View ↔ ViewModel, én pr. række (brede plader) */}
        <RowLinks row="title" fwd fwdTone={step === 1 ? 'focus' : baseTone} fwdLabel="binding" back={events} backTone={f(step === 4)} backLabel="PropertyChanged" />
        <RowLinks row="due" fwd fwdTone={baseTone} fwdLabel="binding" back={events} backTone={f(step === 4)} backLabel="PropertyChanged" />
        <RowLinks row="add" fwd fwdTone={step === 2 ? 'focus' : baseTone} fwdLabel="command" />
        <RowLinks row="list" fwd fwdTone={baseTone} fwdLabel="binding" back={events} backTone={f(step === 4)} backLabel="CollectionChanged" />

        {/* Samme forbindelser som én lodret blok (smalle plader) */}
        <div className="mvm-bl mvm-bl-1">
          <Link on vertical tone={step === 1 || step === 2 ? 'focus' : baseTone} label="binding · command" />
          <Link on={events} vertical back tone={f(step === 4)} label="PropertyChanged · CollectionChanged" className="mvm-ev" />
        </div>

        {/* ViewModel */}
        <section className="mvm-col mvm-vm">
          <header className="mvm-head">
            <span className="mvm-layer">ViewModel</span>
            <code className="mvm-class">MainViewModel</code>
            <motion.span className="mvm-role" initial={false} animate={{ opacity: roles ? 1 : 0 }} transition={roles ? t.settle : t.fade}>
              presentation logic
            </motion.span>
          </header>
          <div className="mvm-vmcard">
            <div className="mvm-mem" data-on={step === 1 || step === 4 || undefined}>
              <code>
                <span className="mvm-type">string</span> NewTodoTitle
              </code>
              <span className="mvm-val">
                <Tag show={typed} tone={step === 1 ? 'focus' : 'idle'}>
                  "titel"
                </Tag>
              </span>
            </div>
            <div className="mvm-mem" data-on={step === 4 || undefined}>
              <code>
                <span className="mvm-type">DateTime</span> NewTodoDue
              </code>
            </div>
            <div className="mvm-mem" data-on={step === 2 || step === 3 || undefined}>
              <code>
                <span className="mvm-type">ICommand</span> AddTodoCommand
              </code>
              <motion.code className="mvm-run" initial={false} animate={{ opacity: at(step, 2) ? 1 : 0 }} transition={t.fade}>
                → AddNewTodo()
              </motion.code>
              <span className="mvm-slot">{step === 2 && todoToken}</span>
            </div>
            <div className="mvm-mem" data-on={step === 4 || undefined}>
              <code>
                <span className="mvm-type">
                  Observable{S}Collection{S}&lt;TodoItem&gt;
                </span>{' '}
                Todos
              </code>
              <span className="mvm-val">
                <Tag show={events} tone={step === 4 ? 'focus' : 'idle'}>
                  Todos.Add(todo)
                </Tag>
              </span>
              <code>
                <span className="mvm-type">ICommand</span> Complete{S}Todo{S}Command
              </code>
            </div>

            {/* Trin 5: samme kolonne med CommunityToolkit.Mvvm */}
            <motion.div
              className="mvm-kit"
              aria-hidden={!toolkit || undefined}
              initial={false}
              animate={{ opacity: toolkit ? 1 : 0 }}
              transition={t.fade}
            >
              <span className="vcaps">CommunityToolkit.Mvvm</span>
              <div className="mvm-kit-block">
                <code>[ObservableProperty]</code>
                <code>private string? fullname;</code>
                <span className="mvm-gen">→ public property med stort begyndelsesbogstav + OnPropertyChanged</span>
              </div>
              <div className="mvm-kit-block">
                <code>[RelayCommand]</code>
                <code>private void GreetUser(User user)</code>
                <code className="mvm-gen">
                  → public IRelayCommand&lt;User&gt; GreetUser{S}Command =&gt; …
                </code>
              </div>
              <span className="mvm-gen-note">genereret af source generatoren ved kompilering</span>
            </motion.div>
          </div>
        </section>

        {/* ViewModel ↔ Model: kald og returværdi */}
        <div className="mvm-links mvm-links-2">
          <Link on tone={step === 3 ? 'focus' : baseTone} label="AddTodo(todo)" />
          <Link on={at(step, 3)} back tone={f(step === 3)} label="1" />
        </div>
        <div className="mvm-bl mvm-bl-2">
          <Link on vertical tone={step === 3 ? 'focus' : baseTone} label="AddTodo(todo)" />
          <Link on={at(step, 3)} vertical back tone={f(step === 3)} label="1" />
        </div>

        {/* Model */}
        <section className="mvm-col mvm-model">
          <header className="mvm-head">
            <span className="mvm-layer">Model</span>
            <code className="mvm-class">TodoItem · Database</code>
            <motion.span className="mvm-role" initial={false} animate={{ opacity: roles ? 1 : 0 }} transition={roles ? t.settle : t.fade}>
              business logic
            </motion.span>
          </header>
          <div className="mvm-modelbody">
            <div className="mvm-entity">
              <code className="mvm-entity-name">TodoItem</code>
              <span className="mvm-entity-f">Id · Title · Due · Done</span>
            </div>
            <div className="mvm-db" data-on={step === 3 || undefined}>
              <span className="mvm-db-name">SQLite database</span>
              <span className="mvm-slot mvm-db-slot">{at(step, 3) && todoToken}</span>
            </div>
          </div>
        </section>
      </div>

      <div className="mvm-foot">
        <span className="vnote">ViewModel kender ikke View · Model kender ikke ViewModel</span>
        <span className="mvm-legend">
          <span className="mvm-key mvm-key-call" aria-hidden="true" /> kald og binding
          <span className="mvm-key mvm-key-ev" aria-hidden="true" /> event
        </span>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'mvvm-layers',
  title: 'Et klik gennem View, ViewModel og Model',
  steps: [
    {
      caption: 'MauiTodo i tre lag: **View** (`MainPage`), **ViewModel** (`MainViewModel`) og **Model** (`TodoItem` og databasen). Hver control er bundet til et medlem i ViewModellen.',
      hold: 2600,
    },
    { caption: 'Brugeren skriver en titel. `Text="{Binding NewTodoTitle}"` sætter værdien i ViewModellen — ingen code-behind.', hold: 1800 },
    {
      caption: 'Klik på Add: `Command="{Binding AddTodoCommand}"` kører `AddNewTodo()`, som bygger et nyt `TodoItem`.',
      hold: 1800,
    },
    {
      caption: 'ViewModellen kalder Model: `await _database.AddTodo(todo)` gemmer det i SQLite og svarer `1` — én række indsat.',
      hold: 2400,
    },
    {
      caption: 'Tilbage til skærmen via events: `Todos.Add(todo)` får listen til at vokse af sig selv. Felterne nulstilles, og `RaisePropertyChanged(…)` får skærmen til at vise det.',
      hold: 3000,
    },
    {
      caption: 'Med `CommunityToolkit.Mvvm` er mekanismen den samme. Source generatoren skriver boilerplate: `[ObservableProperty]` bliver en property, `[RelayCommand]` en `…Command`.',
      hold: 3000,
    },
    {
      caption: 'View = UI logic, ViewModel = presentation logic, Model = business logic. Bindinger og kald peger nedad; ændringer kommer tilbage som events.',
      hold: 2800,
    },
  ],
  Component: Mvvm,
}

export default viz
