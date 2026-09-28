import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, Token, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './maui-navigation.css'

/* NavigationPage.pdf s. 3–9 og Shell and Routes.pdf s. 14–23.
   Venstre app: NavigationPage med en stak af page-instanser (lab 07: MainPage →
   ElSpotPricesPage) og en separat modal stak (bogens LoginPage). Højre app: Shell
   med tabs, en registreret route og et objekt sendt med som navigation state. */

const S = String.fromCharCode(0xad) // blød bindestreg: lange navne må kun knække her

type PageDef = { id: string; title?: string; back?: boolean; modal?: boolean; body: ReactNode }

/** Telefonskærm: sider stablet i samme celle. En side over den aktive ligger uden for
    skærmen (til højre, eller under kanten for en modal); sider under den aktive ligger
    stille bag den. */
function Screen({ pages, active, tabs }: { pages: PageDef[]; active: number; tabs?: ReactNode }) {
  return (
    <div className="mnv-phone">
      <div className="mnv-screen">
        {pages.map((p, i) => {
          const above = i > active
          return (
            <motion.div
              key={p.id}
              className="mnv-page"
              aria-hidden={i !== active || undefined}
              initial={false}
              animate={
                above
                  ? p.modal
                    ? { y: '60%', x: 0, opacity: 0 }
                    : { x: '55%', y: 0, opacity: 0 }
                  : { x: 0, y: 0, opacity: 1 }
              }
              transition={{ x: t.travel, y: t.travel, opacity: above ? t.recede : t.fade }}
            >
              {p.title !== undefined && (
                <div className="mnv-bar">
                  <span className="mnv-back" data-on={p.back || undefined} aria-hidden="true">
                    ‹
                  </span>
                  <span className="mnv-bar-title">{p.title}</span>
                </div>
              )}
              <div className="mnv-body">{p.body}</div>
            </motion.div>
          )
        })}
      </div>
      {tabs}
    </div>
  )
}

const Skel = ({ w = 100 }: { w?: number }) => <span className="mnv-skel" style={{ width: `${w}%` }} />

function StackCard({ show, tone, children }: { show: boolean; tone: 'focus' | 'idle'; children: ReactNode }) {
  return (
    <div className="mnv-slot">
      <motion.div
        className="mnv-card mono"
        data-tone={tone}
        initial={false}
        animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }}
        transition={show ? t.place : t.fade}
      >
        {children}
      </motion.div>
    </div>
  )
}

const LEFT_CODE = [
  'MainPage = new NavigationPage(new MainPage());',
  'await Navigation.PushAsync(new ElSpotPricesPage());',
  'await Navigation.PopAsync();',
  'await Navigation.PushModalAsync(new LoginPage());',
  'await Navigation.PopModalAsync();',
]
const RIGHT_CODE = [
  'MainPage = new AppShell();',
  'Routing.RegisterRoute("productdetails", typeof(ProductPage));',
  'await Shell.Current.GoToAsync("productdetails", pageParams);',
  'await Shell.Current.GoToAsync("..");',
]

// Kodelinjerne må knække efter punktummer og kommaer, aldrig midt i et navn.
const Z = String.fromCharCode(0x200b)
const breakable = (s: string) => s.replace(/\.(?=[A-Z])/g, `.${Z}`)

function CodeLine({ lines, show, on }: { lines: string[]; show: number; on: boolean }) {
  return (
    <div className="mnv-code" data-on={on || undefined}>
      <Swap show={show} items={lines.map((l) => <code key={l}>{breakable(l)}</code>)} />
    </div>
  )
}

function Navigation({ step }: { step: number }) {
  // Venstre app
  const leftActive = step === 1 ? 1 : step === 3 ? 2 : 0
  const leftCode = step <= 4 ? step : 0
  // Højre app
  const productShown = step === 7
  const rightCode = step <= 4 ? 0 : step === 5 ? 1 : step <= 7 ? 2 : 3
  const routeShown = at(step, 5)
  const routeFocus = step === 5 || step === 6
  const keyMatch = step === 7

  const envelope = (
    <Token id="mnv-env" wrap launch={step === 6}>
      <span>
        {'{ '}
        <span className="mnv-key" data-on={keyMatch || undefined}>
          "Product"
        </span>
        : product {'}'}
      </span>
    </Token>
  )

  const leftPages: PageDef[] = [
    {
      id: 'main',
      title: 'MainPage',
      body: (
        <>
          <span className="mnv-btn mono">→ ElSpot{S}Prices{S}Page</span>
          <span className="mnv-btn mono">→ CO2{S}Emissions{S}Page</span>
        </>
      ),
    },
    {
      id: 'elspot',
      title: `ElSpot${S}Prices${S}Page`,
      back: true,
      body: (
        <>
          <Skel w={90} />
          <Skel w={70} />
          <Skel w={80} />
        </>
      ),
    },
    {
      id: 'login',
      modal: true,
      body: (
        <>
          <span className="mnv-page-name mono">LoginPage</span>
          <span className="mnv-field" />
          <span className="mnv-field" />
          <Tag tone="idle">modal</Tag>
        </>
      ),
    },
  ]

  const rightPages: PageDef[] = [
    {
      id: 'input',
      title: 'InputPage',
      body: (
        <>
          <Skel w={85} />
          <Skel w={60} />
          <Skel w={75} />
        </>
      ),
    },
    {
      id: 'product',
      title: 'ProductPage',
      back: true,
      body: (
        <>
          <span className="mnv-token-slot">{at(step, 7) && envelope}</span>
          <span className="mnv-value">MauiStockTake</span>
          <span className="mnv-value">BeachBytes</span>
        </>
      ),
    },
  ]

  const tabs = (
    <div className="mnv-tabs" aria-label="TabBar">
      <span data-on>Input</span>
      <span>Reports</span>
    </div>
  )

  const leftOn = step >= 1 && step <= 4
  const rightOn = step >= 5

  return (
    <div className="mnv">
      <div className="mnv-panels">
        <section className="mnv-panel" data-on={leftOn || undefined}>
          <header className="mnv-head">
            <span className="mnv-name">NavigationPage</span>
            <span className="mnv-kind">stak af instanser</span>
          </header>
          <CodeLine lines={LEFT_CODE} show={leftCode} on={leftOn} />
          <div className="mnv-body-row">
            <Screen pages={leftPages} active={leftActive} />
            <div className="mnv-side">
              <div className="mnv-group">
                <span className="vcaps">Navigationsstak</span>
                <div className="mnv-pile">
                  <StackCard show tone={leftActive === 0 ? 'focus' : 'idle'}>
                    MainPage
                  </StackCard>
                  <StackCard show={leftActive === 1} tone="focus">
                    ElSpot{S}Prices{S}Page
                  </StackCard>
                </div>
                <span className="mnv-hint">sidst ind, først ud</span>
              </div>
              <div className="mnv-group">
                <span className="vcaps">Modal stak</span>
                <div className="mnv-pile">
                  <StackCard show={leftActive === 2} tone="focus">
                    LoginPage
                  </StackCard>
                </div>
              </div>
            </div>
          </div>
          <motion.div
            className="mnv-note"
            initial={false}
            animate={{ opacity: at(step, 3) ? 1 : 0 }}
            transition={at(step, 3) ? t.settle : t.fade}
          >
            <span className="vnote">
              Modal side: ingen navigationsbar, ingen back-knap. Opgaven skal gøres færdig.
            </span>
          </motion.div>
        </section>

        <section className="mnv-panel" data-on={rightOn || undefined}>
          <header className="mnv-head">
            <span className="mnv-name">AppShell</span>
            <span className="mnv-kind">routes</span>
          </header>
          <CodeLine lines={RIGHT_CODE} show={rightCode} on={rightOn} />
          <div className="mnv-body-row">
            <Screen pages={rightPages} active={productShown ? 1 : 0} tabs={tabs} />
            <div className="mnv-side">
              <div className="mnv-group">
                <span className="vcaps">Routes</span>
                <div className="mnv-routes">
                  <div className="mnv-route">
                    <code>"input"</code>
                    <span className="mono">→ InputPage</span>
                  </div>
                  <div className="mnv-route">
                    <code>"reports"</code>
                    <span className="mono">→ ReportPage</span>
                  </div>
                  <motion.div
                    className="mnv-route"
                    data-tone={routeFocus ? 'focus' : undefined}
                    initial={false}
                    animate={{ opacity: routeShown ? 1 : 0, x: routeShown ? 0 : -6 }}
                    transition={routeShown ? t.place : t.fade}
                  >
                    <code>"product{S}details"</code>
                    <span className="mono">→ ProductPage</span>
                  </motion.div>
                </div>
              </div>
              <div className="mnv-group">
                <span className="vcaps">Navigation state</span>
                <div className="mnv-state">{step === 6 && envelope}</div>
              </div>
            </div>
          </div>
          <motion.div
            className="mnv-note"
            initial={false}
            animate={{ opacity: at(step, 7) ? 1 : 0 }}
            transition={at(step, 7) ? t.settle : t.fade}
          >
            <span className="vnote">
              <span className="mono">ProductPage</span> modtager med{' '}
              <code className="mnv-qp" data-on={keyMatch || undefined}>
                [Query{S}Property(nameof(Product), <span className="mnv-key" data-on={keyMatch || undefined}>nameof(Product)</span>)]
              </code>
            </span>
          </motion.div>
        </section>
      </div>

      <motion.div
        className="mnv-sum"
        initial={false}
        animate={{ opacity: at(step, 8) ? 1 : 0, y: at(step, 8) ? 0 : 6 }}
        transition={at(step, 8) ? t.settle : t.fade}
        aria-hidden={!at(step, 8) || undefined}
      >
        <div className="mnv-sum-card">
          <span className="mnv-sum-name">NavigationPage</span>
          <span className="mnv-sum-row">
            <span className="mnv-sum-dir">Frem</span>
            <code>PushAsync(new MyPage())</code>
          </span>
          <span className="mnv-sum-row">
            <span className="mnv-sum-dir">Tilbage</span>
            <code>PopAsync()</code>
          </span>
        </div>
        <div className="mnv-sum-card">
          <span className="mnv-sum-name">Shell</span>
          <span className="mnv-sum-row">
            <span className="mnv-sum-dir">Frem</span>
            <code>GoToAsync("mypage")</code>
          </span>
          <span className="mnv-sum-row">
            <span className="mnv-sum-dir">Tilbage</span>
            <code>GoToAsync("..")</code>
          </span>
        </div>
        <div className="mnv-sum-warn">
          <Tag tone="neg">exception</Tag>
          <span className="vnote">NavigationPage i en Shell-app kaster en exception — vælg én model i <code>App</code>.</span>
        </div>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'maui-navigation',
  title: 'Stak af sider mod routes i Shell',
  steps: [
    {
      caption: 'To måder at navigere: **NavigationPage** holder en stak af page-*instanser*, **Shell** kender siderne ved *route*-navn.',
      hold: 2200,
    },
    {
      caption: '`PushAsync(new ElSpotPricesPage())` lægger en ny instans øverst på stakken. Den er nu aktiv, og navigationsbaren får en back-knap.',
      hold: 2400,
    },
    { caption: '`PopAsync()` — eller back-knappen — fjerner den øverste igen: sidst ind, først ud.', hold: 1600 },
    {
      caption: '`PushModalAsync` lægger `LoginPage` på en **separat modal stak**. Der er ingen navigationsbar og dermed ingen back-knap: opgaven skal gøres færdig.',
      hold: 2800,
    },
    { caption: '`PopModalAsync()` fjerner den modale side igen. Navigationsstakken er urørt.', hold: 1600 },
    {
      caption: 'Shell: en side uden tab registreres som **route** i `AppShell`-konstruktøren — et navn koblet til en sidetype.',
      hold: 2400,
    },
    {
      caption: '`GoToAsync("productdetails", pageParams)` slår siden op på navnet. Produktet rejser med som *navigation state* i en `Dictionary<string, object>`.',
      hold: 2800,
    },
    {
      caption: '`ProductPage` har `[QueryProperty(nameof(Product), nameof(Product))]`. Nøglen `"Product"` matcher, Shell sætter propertyen, og labels viser `MauiStockTake` og `BeachBytes`.',
      hold: 3000,
    },
    {
      caption: 'Tilbage med `GoToAsync("..")`. NavigationPage bruger instanser, Shell bruger routes — og de to kan ikke blandes i samme app.',
      hold: 3000,
    },
  ],
  Component: Navigation,
}

export default viz
