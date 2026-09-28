import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './client-routing.css'

/* Løsningsforslaget til lab 17 (SOL17 usestate-and-routing): App.js, Navbar.js,
   Home/Scoreboard/Unknown.js. :id-panelet er fra FED React Router.pdf s. 13.
   Adresselinjen viser kun stien; materialet angiver ingen host. */

const ROUTES = [
  { path: '/', el: '<Home />' },
  { path: '/game', el: '<Game />' },
  { path: '/scoreboard', el: '<Scoreboard />' },
  { path: '*', el: '<Unknown />' },
]

const NAV = [
  { to: '/', label: 'Home' },
  { to: '/game', label: 'Play game' },
  { to: '/scoreboard', label: 'Scoreboard' },
]

type Mark = 'none' | 'no' | 'yes'

/* Hvad Routes har prøvet i hvert trin. */
function marks(step: number): Mark[] {
  if (step === 2 || step === 3 || step === 6) return ['no', 'no', 'yes', 'none']
  if (step === 4 || step === 5) return ['no', 'no', 'no', 'yes']
  return ['none', 'none', 'none', 'none']
}

function Routing({ step }: { step: number }) {
  const url = step === 0 ? 0 : step === 4 || step === 5 ? 2 : 1
  const content = step >= 6 ? 1 : step >= 4 ? 2 : step === 3 ? 1 : 0
  const active = step === 3 || step === 6 ? '/scoreboard' : step === 4 || step === 5 ? null : '/'
  const m = marks(step)
  const scanning = step === 2 || step === 4
  const noReq = (step >= 1 && step <= 3) || step === 6

  const contents: { el: string; text: ReactNode }[] = [
    { el: '<Home />', text: 'Home!' },
    { el: '<Scoreboard />', text: 'This is the scoreboard' },
    { el: '<Unknown />', text: 'You have entered an unknown route.' },
  ]

  return (
    <div className="cr">
      {/* Browseren med appen fra lab 17. */}
      <section className="cr-browser" data-dim={step === 5 || undefined}>
        <div className="cr-bar">
          <span className="cr-url mono" data-on={step === 1 || step === 4 || undefined}>
            <Swap
              show={url}
              items={[
                '/',
                '/scoreboard',
                <span key="u" className="cr-unknown">
                  ukendt sti
                </span>,
              ]}
            />
          </span>
          <span className="cr-noreq" data-on={noReq || undefined}>
            <span className="cr-noreq-line" aria-hidden="true" />
            <span className="cr-server">server</span>
          </span>
        </div>
        <motion.span
          className="cr-noreq-label"
          initial={false}
          animate={{ opacity: noReq ? 1 : 0 }}
          transition={t.fade}
        >
          ingen request — ingen page reload
        </motion.span>

        <div className="cr-page">
          <div className="cr-h1">Exercise 17</div>
          <nav className="cr-nav">
            {NAV.map((n) => (
              <span key={n.to} className="cr-navlink" data-active={active === n.to || undefined}>
                {n.label}
                {n.to === '/scoreboard' && (
                  <span className="cr-click">
                    {step === 1 && (
                      <Token id="cr-click" tone="focus">
                        klik
                      </Token>
                    )}
                  </span>
                )}
              </span>
            ))}
          </nav>
          <div className="cr-content" data-on={step === 3 || step === 4 || undefined}>
            <Swap
              show={content}
              items={contents.map((c) => (
                <span key={c.el} className="cr-content-inner">
                  <span className="cr-el mono">{c.el}</span>
                  <span className="cr-text">{c.text}</span>
                </span>
              ))}
            />
          </div>
          <div className="cr-foot">Simple SPA routing</div>
        </div>
        <motion.span
          className="cr-active-note"
          initial={false}
          animate={{ opacity: step === 3 || step === 6 ? 1 : 0 }}
          transition={t.fade}
        >
          <span className="mono">NavLink</span> med klassen <span className="mono">active</span> står med accent og fed
        </motion.span>
      </section>

      <div className="cr-side">
        {/* Route-tabellen. */}
        <section className="cr-routes">
          <header className="cr-routes-head mono">{'<Routes>'}</header>
          <ol className="cr-rows">
            {ROUTES.map((r, i) => (
              <motion.li
                key={r.path}
                className="cr-row"
                data-mark={m[i]}
                initial={false}
                animate={{ opacity: 1 }}
                transition={scanning ? stagger(i, 0, 0.18) : t.fade}
              >
                <span className="cr-path mono">{r.path}</span>
                <span className="cr-arrow" aria-hidden="true">
                  →
                </span>
                <span className="cr-elname mono">{r.el}</span>
                <motion.span
                  className="cr-mark"
                  initial={false}
                  animate={{ opacity: m[i] === 'none' ? 0 : 1, scale: m[i] === 'none' ? 0.8 : 1 }}
                  transition={m[i] === 'none' ? t.fade : { ...t.place, delay: scanning ? 0.15 + i * 0.25 : 0 }}
                >
                  {m[i] === 'yes' ? 'match' : 'nej'}
                </motion.span>
              </motion.li>
            ))}
          </ol>
          <span className="cr-routes-note">første match renderes; resten ignoreres</span>
        </section>

        {/* :id og useParams (slides s. 13). */}
        <section className="cr-param" data-on={at(step, 5) || undefined}>
          <header className="cr-param-head">
            <span className="vcaps">Parameter i path</span>
            <span className="cr-param-route mono">
              streaming › <b>:id</b>
            </span>
          </header>
          <ol className="cr-param-flow">
            {[
              <span key="l" className="cr-links">
                <span className="cr-plink" data-on>
                  Netflix
                </span>
                <span className="cr-plink">HBO</span>
              </span>,
              <span key="u" className="mono">
                /streaming/netflix
              </span>,
              <span key="p" className="mono">
                {'useParams() → { id: "netflix" }'}
              </span>,
              <span key="h" className="cr-h3">
                ID: netflix
              </span>,
            ].map((node, i) => (
              <motion.li
                key={i}
                initial={false}
                animate={{ opacity: at(step, 5) ? 1 : 0, x: at(step, 5) ? 0 : -4 }}
                transition={at(step, 5) ? stagger(i, 0.1, 0.3) : t.fade}
              >
                {node}
              </motion.li>
            ))}
          </ol>
        </section>
      </div>

      <motion.ul
        className="cr-legend"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0, y: at(step, 6) ? 0 : 4 }}
        transition={at(step, 6) ? t.settle : t.fade}
      >
        <li>
          <span className="mono">Link</span> ændrer URL’en uden request
        </li>
        <li>
          <span className="mono">Routes</span> vælger første match
        </li>
        <li>
          <span className="mono">*</span> fanger resten
        </li>
        <li>
          <span className="mono">:id</span> → <span className="mono">useParams</span>
        </li>
      </motion.ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'client-routing',
  title: 'Et klik på NavLink uden page reload',
  steps: [
    { caption: 'Appen fra lab 17: overskrift, navbar, indhold og bundtekst. Til højre `<Routes>` med fire routes.', hold: 1800 },
    { caption: 'Klik på “Scoreboard”: URL’en skifter til `/scoreboard` — **uden** request til serveren.', hold: 2600 },
    { caption: '`<Routes>` gennemgår sine routes og vælger den **første**, der matcher.', hold: 2400 },
    {
      caption: 'Kun indholdet skifter til `<Scoreboard />`; overskrift, navbar og bundtekst står. `NavLink` til `/scoreboard` får klassen `active`.',
      hold: 2800,
    },
    { caption: 'En sti, der ikke står i tabellen, rammer `*` og viser `<Unknown />`.', hold: 2400 },
    { caption: 'Med `:id` i path læser komponenten parameteren med `useParams()`: `/streaming/netflix` giver `id = "netflix"`.', hold: 2800 },
    { caption: 'Link ændrer URL’en, Routes vælger komponenten, `*` fanger resten, og `:id` giver parametre.', hold: 3000 },
  ],
  Component: Routing,
}

export default viz
