import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './data-binding.css'

/* Data Binding Basics.pdf s. 4–24 og bog afsn. 3.4 (MauiTodo): listing 3.14
   (CollectionView + DataTemplate), 3.15 (x:Name="PageTodo",
   BindingContext="{x:Reference PageTodo}", ItemsSource="{Binding Todos}"),
   afsn. 3.4.2 (ObservableCollection, Todos.Add), figur 3.20 (eksempeldata),
   listing 3.7 (TodoItem). Trin 5 illustrerer reglen fra bog afsn. 9.3.4 /
   The MVVM Pattern.pdf s. 19–20: en ændret property kræver PropertyChanged. */

const SHY = String.fromCharCode(0xad)
const ZWSP = String.fromCharCode(0x200b)

/** Brudpunkter i kode: efter . ( = , og bløde bindestreger i lange camelCase-navne. */
function brk(s: string) {
  return s
    .replace(/[A-Za-z]{15,}/g, (w) => w.replace(/([a-z])(?=[A-Z])/g, `$1${SHY}`))
    .replace(/([.(=,<])(?=\S)/g, `$1${ZWSP}`)
}

const ITEMS = [
  { title: 'Finish .NET MAUI in Action', due: '01 Jan 2023', dt: 'new DateTime(2023, 1, 1)', at: 3 },
  { title: 'Write', due: '19 May 2022', dt: 'new DateTime(2022, 5, 19)', at: 4 },
]

/** Fade/glid ind fra trin `n`. */
function appear(step: number, n: number, delay = 0) {
  const on = at(step, n)
  return {
    initial: false as const,
    animate: { opacity: on ? 1 : 0, y: on ? 0 : 6 },
    transition: on ? { ...t.place, delay: step === n ? delay : 0 } : t.fade,
  }
}

function Attr({ show, hl, children }: { show: boolean; hl?: boolean; children: ReactNode }) {
  return (
    <motion.div
      className="db-attr"
      data-hl={hl || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={show ? t.settle : t.fade}
    >
      {children}
    </motion.div>
  )
}

function CtxTag({ step, i, children }: { step: number; i: number; children: ReactNode }) {
  const on = at(step, 1)
  return (
    <motion.span
      className="db-ctx"
      data-now={step === 1 || undefined}
      initial={false}
      animate={{ opacity: on ? 1 : 0, y: on ? 0 : -4 }}
      transition={on ? stagger(i, step === 1 ? 0.2 : 0, 0.35) : t.fade}
    >
      {children}
    </motion.span>
  )
}

function Card({ step, n }: { step: number; n: number }) {
  const item = ITEMS[n]
  const zoom = n === 0 && at(step, 4)
  return (
    <motion.div className="db-card" data-now={step === item.at || (n === 0 && step === 4) || undefined} {...appear(step, item.at, 0.85)}>
      <span className="db-check" aria-hidden="true" />
      <div className="db-card-body">
        <span className="db-card-title">{item.title}</span>
        {n === 0 && (
          <motion.code className="db-bind" initial={false} animate={{ opacity: zoom ? 1 : 0 }} transition={zoom ? t.settle : t.fade}>
            {'{Binding Title}'}
          </motion.code>
        )}
        <span className="db-card-due">{item.due}</span>
        {n === 0 && (
          <motion.code className="db-bind" initial={false} animate={{ opacity: zoom ? 1 : 0 }} transition={zoom ? { ...t.settle, delay: 0.15 } : t.fade}>
            {brk("{Binding Due, StringFormat='{0:dd MMM yyyy}'}")}
          </motion.code>
        )}
      </div>
      {n === 0 && (
        <span className="db-card-tag">
          <Tag show={zoom} tone={step === 4 ? 'focus' : 'idle'}>
            context = item
          </Tag>
        </span>
      )}
    </motion.div>
  )
}

function Item({ step, n }: { step: number; n: number }) {
  const item = ITEMS[n]
  const changed = n === 0 && at(step, 5)
  const rowNow = (field: 'Title' | 'Due') => (n === 0 && step === 4) || (field === 'Title' && n === 0 && step === 5)
  return (
    <motion.div className="db-item" data-now={step === item.at || undefined} {...appear(step, item.at, 0.1)}>
      <code className="db-item-type">TodoItem</code>
      <dl>
        <div data-now={rowNow('Title') || undefined}>
          <dt>Title</dt>
          <dd>
            <Swap
              show={changed ? 1 : 0}
              items={[
                <span key="a">"{item.title}"</span>,
                <span key="b" className="db-new">
                  ny værdi
                </span>,
              ]}
            />
          </dd>
        </div>
        <div data-now={rowNow('Due') || undefined}>
          <dt>Due</dt>
          <dd>{brk(item.dt)}</dd>
        </div>
        <div>
          <dt>Done</dt>
          <dd>false</dd>
        </div>
      </dl>
    </motion.div>
  )
}

function Wire({ step, vertical }: { step: number; vertical?: boolean }) {
  const pulse = step === 3 || step === 4
  const tone = step === 2 || pulse ? 'focus' : 'idle'
  return (
    <div className={`db-wire ${vertical ? 'is-v' : 'is-h'}`}>
      <motion.code className="db-wire-label" initial={false} animate={{ opacity: at(step, 2) ? 1 : 0 }} transition={t.fade}>
        {'{Binding Todos}'}
      </motion.code>
      <div className="db-wire-line">
        <Link on={at(step, 2)} back={!vertical} vertical={vertical} tone={tone} />
        {pulse && (
          <motion.span
            key={`p${step}`}
            className="db-pulse"
            initial={vertical ? { top: '0%', opacity: 0 } : { left: '100%', opacity: 0 }}
            animate={vertical ? { top: ['0%', '100%'], opacity: [0, 1, 1, 0] } : { left: ['100%', '0%'], opacity: [0, 1, 1, 0] }}
            transition={{ ...t.travel, delay: 0.35 }}
          />
        )}
      </div>
      <Tag show={at(step, 5)} tone={step === 5 ? 'neg' : 'muted'}>
        ingen besked
      </Tag>
    </div>
  )
}

const LEGEND: ReactNode[] = [
  <>
    <code>BindingContext</code> arves nedad
  </>,
  <>
    <code>ItemTemplate</code>: binding context = item
  </>,
  <>
    Tilføj/fjern → <code>ObservableCollection</code> giver besked
  </>,
  <>
    Ændret property → <code>PropertyChanged</code>
  </>,
]

function Binding({ step }: { step: number }) {
  return (
    <div className="db">
      <div className="db-main">
        {/* Target: UI'et. */}
        <section className="db-panel db-ui">
          <header className="db-head">
            <span className="vcaps">Target · UI</span>
            <code>MainPage.xaml</code>
          </header>
          <div className="db-box" data-ctx={at(step, 1) || undefined}>
            <div className="db-box-head">
              <code>ContentPage</code>
              <CtxTag step={step} i={0}>
                context = PageTodo
              </CtxTag>
            </div>
            <Attr show={at(step, 1)} hl={step === 1}>
              x:Name="PageTodo"
            </Attr>
            <Attr show={at(step, 1)} hl={step === 1}>
              {brk('BindingContext="{x:Reference PageTodo}"')}
            </Attr>
            <div className="db-apptitle">Maui Todo</div>
            <div className="db-box" data-ctx={at(step, 1) || undefined}>
              <div className="db-box-head">
                <code>Grid</code>
                <CtxTag step={step} i={1}>
                  arvet
                </CtxTag>
              </div>
              <div className="db-box" data-ctx={at(step, 1) || undefined} data-now={step === 2 || undefined}>
                <div className="db-box-head">
                  <code>CollectionView</code>
                  <CtxTag step={step} i={2}>
                    arvet
                  </CtxTag>
                </div>
                <Attr show>x:Name="TodosCollection"</Attr>
                <Attr show={at(step, 2)} hl={step === 2}>
                  {brk('ItemsSource="{Binding Todos}"')}
                </Attr>
                <Attr show={at(step, 3)}>ItemTemplate › DataTemplate:</Attr>
                <div className="db-cards">
                  <Card step={step} n={0} />
                  <Card step={step} n={1} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <Wire step={step} />
        <Wire step={step} vertical />

        {/* Source: dataene. */}
        <section className="db-panel db-data">
          <header className="db-head">
            <span className="vcaps">Source · data</span>
            <code>MainPage.xaml.cs</code>
          </header>
          <div className="db-code" data-hl={step === 2 || undefined}>
            {brk('public ObservableCollection<TodoItem> ')}
            <span className="db-code-key">Todos</span>
            {' { get; set; } = new();'}
          </div>
          <div className="db-list">
            <Item step={step} n={0} />
            <Item step={step} n={1} />
          </div>
          <motion.div className="db-code" data-hl={step === 3 || step === 4 || undefined} {...appear(step, 3)}>
            {brk('Todos.Add(todo);')}
          </motion.div>
          <motion.p className="db-note" {...appear(step, 5)}>
            <code>Title</code> er en almindelig property. UI’et hører først om ændringen, når <code>TodoItem</code> rejser{' '}
            <code>PropertyChanged</code> (<code>{brk('INotifyPropertyChanged')}</code> — se MVVM).
          </motion.p>
        </section>
      </div>

      <ul className="db-legend">
        {LEGEND.map((l, i) => (
          <motion.li key={i} {...appear(step, 6, i * 0.08)}>
            {l}
          </motion.li>
        ))}
      </ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'data-binding',
  title: 'Fra Todos.Add til et nyt kort i CollectionView',
  steps: [
    { caption: 'Target til venstre (UI’et), source til højre (dataene).', hold: 1600 },
    { caption: 'Siden sætter `BindingContext` til sig selv med `{x:Reference PageTodo}`. Alle børn arver den.', hold: 2400 },
    { caption: '`ItemsSource="{Binding Todos}"` kobler listen til `Todos` på binding context.', hold: 2200 },
    {
      caption: '`Todos.Add(todo)`: `ObservableCollection` giver besked, og `CollectionView` bygger et kort fra sin `DataTemplate`.',
      hold: 3000,
    },
    {
      caption: 'Hvert kort har sit eget item som binding context: `{Binding Title}` og `{Binding Due, StringFormat=…}`. Item nr. 2 kommer til på samme måde.',
      hold: 3000,
    },
    {
      caption: 'Får et item en ny `Title`, sker der intet i UI’et: samlingen er uændret, og en almindelig property giver ingen besked.',
      hold: 3000,
    },
    { caption: 'Tilføj/fjern → `ObservableCollection`. Ændret værdi → `INotifyPropertyChanged`.', hold: 3000 },
  ],
  Component: Binding,
}

export default viz
