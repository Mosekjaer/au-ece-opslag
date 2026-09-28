import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Swap, Tag, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './maui-startup.css'

/* MAUI introduction.pdf s. 21–27 (opstartskæden App —Window→ AppShell
   —ContentTemplate→ MainPage, MauiProgram.cs, App.xaml(.cs), MainPage.xaml(.cs)),
   Event in Csharp.pdf s. 8 (knappen), bog kap. 7 (ShellContent i AppShell.xaml). */

/* ---- Kodelinjer ---------------------------------------------------- */

/** Nøglesegment: accentfarve fra trin `at`. */
type Seg = string | { k: string; at: number }
interface Ln {
  s: Seg[]
  /** Indrykning i tegn. */
  i?: number
  /** Trin hvor linjen er markeret. */
  hl?: number
  /** Rækkefølge inden for markeringen (forskudt start). */
  ord?: number
}
const k = (text: string, step: number): Seg => ({ k: text, at: step })

/** Brudpunkter i kode: efter . ( = , og bløde bindestreger i lange camelCase-navne. */
const SHY = String.fromCharCode(0xad)
const ZWSP = String.fromCharCode(0x200b)

function brk(s: string) {
  return s
    .replace(/[A-Za-z]{15,}/g, (w) => w.replace(/([a-z])(?=[A-Z])/g, `$1${SHY}`))
    .replace(/([.(=,])(?=\S)/g, `$1${ZWSP}`)
}

function Code({ lines, step, show = true }: { lines: Ln[]; step: number; show?: boolean }) {
  return (
    <div className="ms-code">
      {lines.map((l, n) => {
        const on = l.hl === step
        return (
          <motion.div
            key={n}
            className="ms-ln"
            style={{ '--i': l.i ?? 0 } as CSSProperties}
            initial={false}
            animate={{ opacity: show ? 1 : 0 }}
            transition={show ? { ...t.settle, delay: n * 0.03 } : t.fade}
          >
            <motion.span
              className="ms-hl"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: 0.15 + (l.ord ?? 0) * 0.4 } : t.fade}
            />
            <span className="ms-t">
              {l.s.map((seg, j) =>
                typeof seg === 'string' ? (
                  <span key={j}>{brk(seg)}</span>
                ) : (
                  <span key={j} className="ms-key" data-on={step >= seg.at || undefined}>
                    {brk(seg.k)}
                  </span>
                ),
              )}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

/* ---- Kæden ---------------------------------------------------------- */

interface ChainNode {
  id: string
  name: string
  sub: ReactNode
  at: number
  code?: Ln[]
}

const CHAIN: ChainNode[] = [
  {
    id: 'prog',
    name: 'MauiProgram.cs',
    sub: (
      <>
        entry point · <code>CreateMauiApp()</code>
      </>
    ),
    at: 1,
    code: [
      { s: ['var builder = ', k('MauiApp.CreateBuilder()', 1), ';'], hl: 1, ord: 0 },
      { s: ['builder.', k('UseMauiApp<App>()', 1)], hl: 1, ord: 1 },
      { s: ['.ConfigureFonts(…);'], i: 7, hl: 1, ord: 2 },
      { s: ['return ', k('builder.Build()', 1), ';'], hl: 1, ord: 3 },
    ],
  },
  {
    id: 'app',
    name: 'App',
    sub: <code>App.xaml.cs</code>,
    at: 2,
    code: [
      { s: ['protected override Window CreateWindow(…)'] },
      { s: ['return ', k('new Window(new AppShell())', 2), ';'], i: 2, hl: 2 },
    ],
  },
  {
    id: 'shell',
    name: 'AppShell',
    sub: <code>AppShell.xaml</code>,
    at: 3,
    code: [
      { s: ['<ShellContent Title="Home"'], hl: 3 },
      { s: [k('ContentTemplate="{DataTemplate local:MainPage}"', 3)], i: 4, hl: 3 },
      { s: ['Route="MainPage" />'], i: 4, hl: 3 },
    ],
  },
  { id: 'page', name: 'MainPage', sub: <code>ContentPage</code>, at: 4 },
]

const LINKS: { label: ReactNode; at: number }[] = [
  { label: <code>UseMauiApp&lt;App&gt;</code>, at: 1 },
  { label: 'Window', at: 2 },
  { label: 'ContentTemplate', at: 3 },
]

/* ---- MainPage i to filer ------------------------------------------- */

const XAML: Ln[] = [
  { s: ['<ContentPage … ', k('x:Class="AlohaWorld.MainPage"', 4), '>'], hl: 4 },
  { s: ['<ScrollView>'], i: 1 },
  { s: ['<VerticalStackLayout>'], i: 2 },
  { s: ['<Image … />'], i: 3 },
  { s: ['<Label … />'], i: 3 },
  { s: ['<Label … />'], i: 3 },
  { s: ['<Button ', k('x:Name="CounterBtn"', 5)], i: 3, hl: 5 },
  { s: ['Text="Click me"'], i: 11 },
  { s: [k('Clicked="OnCounterClicked"', 5), ' />'], i: 11, hl: 5 },
]

const CS: Ln[] = [
  { s: ['public ', k('partial class MainPage', 4), ' : ContentPage'], hl: 4 },
  { s: ['int count = 0;'], i: 2 },
  { s: ['public MainPage()'], i: 2 },
  { s: [k('InitializeComponent()', 4), ';'], i: 4, hl: 4 },
  { s: ['private void ', k('OnCounterClicked', 5), '('], i: 2, hl: 5, ord: 0 },
  { s: ['object sender, EventArgs e)'], i: 6, hl: 5, ord: 0 },
  { s: ['count++;'], i: 4, hl: 5, ord: 1 },
  { s: ['if (count == 1)'], i: 4 },
  { s: [k('CounterBtn', 5), '.Text = $"Clicked {count} time";'], i: 6, hl: 5, ord: 2 },
  { s: ['else … "Clicked {count} times"'], i: 4 },
]

function nodeTone(step: number, n: number): Tone {
  if (step === n) return 'focus'
  if (step > n) return 'ok'
  return 'muted'
}

function Startup({ step }: { step: number }) {
  const split = at(step, 4)
  return (
    <div className="ms">
      <div className="ms-chain">
        {CHAIN.map((c, i) => (
          <div key={c.id} className="ms-step">
            <Node className="ms-node" tone={nodeTone(step, c.at)}>
              <div className="ms-head">
                <span className="ms-name mono">{c.name}</span>
                <span className="ms-sub">{c.sub}</span>
              </div>
              {c.code && <Code lines={c.code} step={step} show={at(step, c.at)} />}
              {c.id === 'app' && (
                <div className="ms-extra">
                  <Tag show={at(step, 2)} tone={step === 2 ? 'focus' : 'idle'} wrap>
                    App.xaml: Colors.xaml + Styles.xaml
                  </Tag>
                </div>
              )}
              {c.id === 'page' && (
                <motion.div
                  className="ms-page"
                  initial={false}
                  animate={{ opacity: split ? 1 : 0 }}
                  transition={split ? t.settle : t.fade}
                >
                  <span className="ms-files">
                    <code>MainPage.xaml</code> + <code>MainPage.xaml.cs</code>
                  </span>
                  <span className="ms-screen">
                    <span className="ms-screen-cap">på skærmen</span>
                    <Swap
                      show={at(step, 5) ? 1 : 0}
                      className="ms-btn-swap"
                      items={[
                        <span key="a" className="ms-btn">
                          Click me
                        </span>,
                        <span key="b" className="ms-btn" data-on>
                          Clicked 1 time
                        </span>,
                      ]}
                    />
                  </span>
                </motion.div>
              )}
            </Node>
            {i < LINKS.length && (
              <div className="ms-gap">
                <Link vertical on={at(step, LINKS[i].at)} tone={step === LINKS[i].at ? 'focus' : 'idle'} label={LINKS[i].label} />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="ms-files-col">
        <Node className="ms-card" tone={!split ? 'ghost' : step === 4 ? 'focus' : 'idle'}>
          <div className="ms-card-name mono">MainPage.xaml</div>
          <Code lines={XAML} step={step} show={split} />
        </Node>

        <div className="ms-mid">
          <Link vertical on={at(step, 5)} tone={step === 5 ? 'focus' : 'idle'} />
          <motion.span
            className="ms-mid-label"
            initial={false}
            animate={{ opacity: at(step, 5) ? 1 : 0 }}
            transition={at(step, 5) ? t.settle : t.fade}
          >
            <code>Clicked</code> → handler
          </motion.span>
          <span className="ms-mid-tag">
            <Tag show={split} tone={step === 4 ? 'focus' : 'idle'} wrap>
              én klasse: x:Class + partial
            </Tag>
          </span>
        </div>

        <Node className="ms-card" tone={!split ? 'ghost' : step === 4 || step === 5 ? 'focus' : 'idle'}>
          <div className="ms-card-name mono">MainPage.xaml.cs</div>
          <Code lines={CS} step={step} show={split} />
        </Node>
      </div>

      <motion.p
        className="ms-foot vnote"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0 }}
        transition={at(step, 6) ? t.settle : t.fade}
      >
        Android starter via <code>MainActivity</code>, iOS/macOS via <code>AppDelegate</code> — begge loader <code>MauiProgram</code>.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'maui-startup',
  title: 'Fra CreateMauiApp til et klik på MainPage',
  steps: [
    { caption: 'En MAUI-app har ét fælles startpunkt: `MauiProgram.CreateMauiApp`.', hold: 1600 },
    {
      caption: 'Host builderen registrerer `App` med `UseMauiApp<App>()`, konfigurerer fonte og bygger en `MauiApp`.',
      hold: 2600,
    },
    { caption: '`App` overrider `CreateWindow` og laver et `Window`, hvis indhold er en `AppShell`.', hold: 2200 },
    { caption: 'Shell’ens `ContentTemplate` peger på den første side, `MainPage`.', hold: 2200 },
    {
      caption: '`MainPage` er **én klasse i to filer**: `x:Class` i XAML og `partial class` i C#. Konstruktøren kalder `InitializeComponent()`.',
      hold: 3000,
    },
    {
      caption: '`Clicked="OnCounterClicked"` peger på handleren i code-behind, og `x:Name` giver den adgang til knappen: `CounterBtn.Text` skifter.',
      hold: 3000,
    },
    {
      caption: 'Hele kæden: entry point → `App` → `Window` med `AppShell` → `MainPage`, delt i XAML og code-behind.',
      hold: 3000,
    },
  ],
  Component: Startup,
}

export default viz
