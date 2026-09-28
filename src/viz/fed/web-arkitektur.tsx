import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Node, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './web-arkitektur.css'

/* Klassisk website mod SPA. Klassisk: JavaJam (Lab 13–14) med index.html, menu.html,
   music.html. SPA: værkstedsopgaven (2024 Sommer, bilag 1) mod json-server på port 4001.
   Kilder: WebSitesAndWebApps s. 3, React Overview s. 11 og 17, React Router s. 7 og 15,
   React fetching data s. 2. Stien /vis-aftaler står ikke i materialet og er mærket eksempel.
   Hver udveksling er én række: request mod højre (til serveren), svar mod venstre. */

type Kind = 'html' | 'js' | 'json'

function Chip({ kind, children }: { kind: Kind; children: ReactNode }) {
  return (
    <span className="wa-chip" data-kind={kind}>
      {children}
    </span>
  )
}

function Arrow({ on, back, delay = 0 }: { on: boolean; back?: boolean; delay?: number }) {
  return (
    <motion.span
      className="wa-arrow"
      data-back={back || undefined}
      initial={false}
      animate={{ '--p': on ? 1 : 0 } as never}
      transition={on ? { ...t.travel, duration: 0.6, delay } : t.fade}
    />
  )
}

/** Én request og dens svar. */
function Exchange({
  on,
  now,
  req,
  target,
  res,
  note,
  last,
}: {
  last?: boolean
  on: boolean
  now: boolean
  req: ReactNode
  target: string
  res: ReactNode
  note?: ReactNode
}) {
  return (
    <motion.div
      className="wa-ex"
      data-last={last || undefined}
      data-tone={!on ? 'ghost' : now ? 'focus' : 'idle'}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={t.fade}
    >
      <div className="wa-line">
        <span className="wa-dir" aria-hidden="true">
          ↑
        </span>
        <code className="wa-req">{req}</code>
        <Arrow on={on} />
        <span className="wa-target">{target}</span>
      </div>
      <div className="wa-line wa-line-res">
        <span className="wa-dir" aria-hidden="true">
          ↓
        </span>
        <Arrow on={on} back delay={0.55} />
        <motion.span
          className="wa-res"
          initial={false}
          animate={{ opacity: on ? 1 : 0, x: on ? 0 : 8 }}
          transition={on ? { ...t.settle, delay: 0.5 } : t.fade}
        >
          {res}
        </motion.span>
      </div>
      {note}
    </motion.div>
  )
}

function Browser({
  tone,
  url,
  urlNote,
  children,
}: {
  tone: 'idle' | 'focus' | 'ghost'
  url: string
  urlNote?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="wa-browser" data-tone={tone}>
      <div className="wa-bar">
        <span className="wa-dots" aria-hidden="true">
          <i />
          <i />
          <i />
        </span>
        <code className="wa-url">{url}</code>
        {urlNote}
      </div>
      <div className="wa-page">{children}</div>
    </div>
  )
}

function Nav({ items, active }: { items: string[]; active?: string }) {
  return (
    <div className="wa-nav">
      {items.map((i) => (
        <span key={i} data-active={i === active || undefined}>
          {i}
        </span>
      ))}
    </div>
  )
}

function Counter({ n, show }: { n: number; show: boolean }) {
  return (
    <motion.span className="wa-count" initial={false} animate={{ opacity: show ? 1 : 0 }} transition={t.fade}>
      HTML-dokumenter hentet:{' '}
      <motion.b key={n} initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} transition={t.place}>
        {n}
      </motion.b>
    </motion.span>
  )
}

function Classic({ step }: { step: number }) {
  const menu = at(step, 1)
  return (
    <section className="wa-band" data-tone={step <= 1 ? 'focus' : 'idle'}>
      <header className="wa-band-head">
        <span className="wa-band-title">Klassisk website</span>
        <Counter n={menu ? 2 : 1} show />
      </header>
      <div className="wa-band-body">
        <Browser tone={step <= 1 ? 'focus' : 'idle'} url={menu ? '/menu.html' : '/'}>
          <Nav items={['Home', 'Menu', 'Music', 'Jobs']} active={menu ? 'Menu' : 'Home'} />
          <motion.div
            key={menu ? 'menu' : 'home'}
            className="wa-view"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={t.fade}
          >
            <span className="wa-h">{menu ? 'Menu' : 'Home'}</span>
            <span className="wa-doc-note">
              hele siden er <code>{menu ? 'menu.html' : 'index.html'}</code>
            </span>
          </motion.div>
        </Browser>

        <div className="wa-lane">
          <Exchange
            on
            now={step === 0}
            req="GET /"
            target="webserver"
            res={<Chip kind="html">index.html</Chip>}
          />
          <Exchange
            on={menu}
            now={step === 1}
            req="GET /menu.html"
            target="webserver"
            res={<Chip kind="html">menu.html</Chip>}
          />
        </div>

        <div className="wa-servers">
          <Node className="wa-server" title="Webserver" sub="sender en fil, når den bliver bedt om det" tone={step <= 1 ? 'focus' : 'idle'}>
            <ul className="wa-files">
              {['index.html', 'menu.html', 'music.html'].map((f) => (
                <li key={f} data-hit={(f === 'index.html' && step === 0) || (f === 'menu.html' && step === 1) || undefined}>
                  {f}
                </li>
              ))}
            </ul>
          </Node>
        </div>
      </div>
    </section>
  )
}

const ROWS = [
  ['Anders And', 'AL12345', '2024-07-01'],
  ['Andersine', 'BB45678', '2024-07-02'],
]

function Spa({ step }: { step: number }) {
  const on = at(step, 2)
  const view = step <= 2 ? 'root' : step === 3 ? 'home' : 'list'
  const url = view === 'list' ? '/vis-aftaler' : '/'
  return (
    <section className="wa-band" data-tone={!on ? 'ghost' : step <= 5 ? 'focus' : 'idle'}>
      <header className="wa-band-head">
        <span className="wa-band-title">Single page app</span>
        <Counter n={1} show={on} />
      </header>
      <motion.div className="wa-band-body" initial={false} animate={{ opacity: on ? 1 : 0.35 }} transition={t.fade}>
        <Browser
          tone={!on ? 'ghost' : step >= 2 && step <= 4 ? 'focus' : 'idle'}
          url={on ? url : ''}
          urlNote={
            <Tag show={view === 'list'} tone="idle">
              eksempel
            </Tag>
          }
        >
          <div className="wa-swap">
            <motion.div
              className="wa-view"
              initial={false}
              animate={{ opacity: on && view === 'root' ? 1 : 0 }}
              transition={t.fade}
            >
              <code className="wa-skel">{'<div id="root"></div>'}</code>
              <span className="wa-doc-note">skelet: tom, indtil bundlet kører</span>
            </motion.div>
            <motion.div
              className="wa-view"
              initial={false}
              animate={{ opacity: view === 'home' || view === 'list' ? 1 : 0 }}
              transition={t.fade}
            >
              <Nav items={['Home', 'Book ny aftale', 'Ret aftale', 'Vis aftaler']} active={view === 'list' ? 'Vis aftaler' : 'Home'} />
              <div className="wa-swap">
                <motion.span
                  className="wa-doc-note"
                  initial={false}
                  animate={{ opacity: view === 'home' ? 1 : 0 }}
                  transition={t.fade}
                >
                  renderet i browseren: <code>createRoot(…)</code>
                </motion.span>
                <motion.div
                  className="wa-list"
                  initial={false}
                  animate={{ opacity: view === 'list' ? 1 : 0 }}
                  transition={t.fade}
                >
                  <span className="wa-h">Vis aftaler</span>
                  {ROWS.map((r, i) => (
                    <motion.span
                      key={r[1]}
                      className="wa-row"
                      initial={false}
                      animate={view === 'list' ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
                      transition={view === 'list' ? stagger(i, 1.2, 0.1) : t.fade}
                    >
                      {r[0]} · <code>{r[1]}</code> · {r[2]}
                    </motion.span>
                  ))}
                </motion.div>
              </div>
            </motion.div>
          </div>
        </Browser>

        <div className="wa-lane">
          <Exchange
            on={on}
            now={step === 2}
            req="GET /"
            target="webserver"
            res={
              <>
                <Chip kind="html">index.html</Chip>
                <Chip kind="js">JS-bundle</Chip>
              </>
            }
          />
          <motion.div
            className="wa-noreload"
            initial={false}
            animate={{ opacity: at(step, 4) ? 1 : 0 }}
            transition={t.fade}
          >
            <span className="wa-dash" aria-hidden="true" />
            <span>
              “Vis aftaler”: intet nyt dokument, ingen page reload
            </span>
          </motion.div>
          <Exchange
            on={at(step, 4)}
            now={step === 4}
            req="GET /appointments"
            target="json-server"
            res={
              <Chip kind="json">
                <span className="wa-long">{'[{ customerName: "Anders And", licensePlate: "AL12345", … }, …]'}</span>
                <span className="wa-short">{'[{ … "AL12345" … }]'}</span>
              </Chip>
            }
          />
          <Exchange
            last
            on={at(step, 5)}
            now={step === 5}
            req="GET /vis-aftaler"
            target="webserver"
            res={
              <>
                <Chip kind="html">index.html</Chip>
                <span className="wa-same">samme side</span>
              </>
            }
            note={<span className="wa-exnote">ny indlæsning (direkte link eller reload): samme side på alle URL’er, routeren styrer</span>}
          />
        </div>

        <div className="wa-servers wa-servers-2">
          <Node className="wa-server" title="Webserver" sub="leverer appen" tone={step === 2 || step === 5 ? 'focus' : 'idle'}>
            <ul className="wa-files">
              <li data-hit={step === 2 || step === 5 || undefined}>index.html</li>
              <li data-hit={step === 2 || undefined}>JS-bundle (main.jsx, App.jsx …)</li>
            </ul>
          </Node>
          <Node
            className="wa-server"
            title="json-server"
            sub={<code>--port 4001</code>}
            tone={!on ? 'ghost' : step === 4 ? 'focus' : 'idle'}
          >
            <ul className="wa-files">
              <li data-hit={step === 4 || undefined}>db.json → appointments</li>
            </ul>
          </Node>
        </div>
      </motion.div>
    </section>
  )
}

function WebArkitektur({ step }: { step: number }) {
  return (
    <div className="wa">
      <Classic step={step} />
      <Spa step={step} />
      <motion.div className="wa-legend" initial={false} animate={{ opacity: at(step, 6) ? 1 : 0 }} transition={t.settle}>
        <span>
          <Chip kind="html">.html</Chip> HTML-dokument over nettet
        </span>
        <span>
          <Chip kind="json">JSON</Chip> kun data over nettet
        </span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'web-arkitektur',
  title: 'Klassisk website mod single page app',
  steps: [
    {
      caption: 'Klienten spørger, serveren svarer. Browseren beder webserveren om `/` og får `index.html` — et helt HTML-dokument.',
      hold: 1800,
    },
    {
      caption: 'Klik på “Menu”: browseren henter et nyt dokument, `menu.html`, og hele siden indlæses igen.',
      hold: 2400,
    },
    {
      caption:
        'En SPA: første request henter `index.html` og JavaScript-bundlet — én gang. HTML’en er kun et skelet med `<div id="root">`.',
      hold: 2800,
    },
    {
      caption: 'Koden i bundlet renderer UI’et i browseren. Der går ingen ny request over nettet.',
      hold: 2200,
    },
    {
      caption:
        'Klik på “Vis aftaler”: React Router skifter view uden nyt dokument. Kun data går over nettet — JSON fra json-server.',
      hold: 3000,
    },
    {
      caption:
        'Går brugeren direkte til en underside, spørger browseren webserveren. Den skal svare med samme `index.html` på alle URL’er, routeren styrer.',
      hold: 2800,
    },
    {
      caption: 'Klassisk: ét HTML-dokument pr. side. SPA: ét dokument, derefter kun data.',
      hold: 3000,
    },
  ],
  Component: WebArkitektur,
}

export default viz
