import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './context-drilling.css'

/* FED React managing application state.pdf s. 20–25 og demoens branch
   usecontext-simple (App → Toolbar → ThemedButton, createContext('light'),
   Provider value="Dark"). Prop drilling-varianten til venstre er konstrueret
   ud fra samme tre komponenter; slidene viser den kun som et træ (s. 21). */

type Theme = 'Dark' | 'light' | null

function Button({ theme }: { theme: Theme }) {
  return (
    <span className="cx-btnrow">
      <span className="cx-btn" data-theme={theme ?? 'none'}>
        Demo
      </span>
      <code className="cx-cls">
        className=&#123;theme&#125;{' '}
        <span className="cx-clsval" data-on={theme ? true : undefined}>
          → "{theme ?? 'Dark'}"
        </span>
      </code>
    </span>
  )
}

const fade = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

function Drill({ step }: { step: number }) {
  const on = at(step, 1)
  const hot = step === 1 || step === 6
  return (
    <div className="cx-tree">
      <Node title="App" mono sub={<code>&lt;Toolbar theme="Dark" /&gt;</code>} tone={step === 1 ? 'focus' : 'idle'} />
      <Link vertical on={on} tone={hot ? 'focus' : 'idle'} label={<code className="cx-prop">theme="Dark"</code>} />
      <Node
        title="Toolbar"
        mono
        sub={<code>&lt;ThemedButton theme=&#123;theme&#125; /&gt;</code>}
        tone={on ? 'ghost' : 'idle'}
      >
        <span className="cx-note">
          <Tag show={on} tone="idle">
            bruger den ikke
          </Tag>
        </span>
      </Node>
      <Link vertical on={on} tone={hot ? 'focus' : 'idle'} label={<code className="cx-prop">theme=&#123;theme&#125;</code>} />
      <Node title="ThemedButton" mono tone={step === 1 ? 'focus' : 'idle'}>
        <Button theme={on ? 'Dark' : null} />
      </Node>
    </div>
  )
}

function Ctx({ step }: { step: number }) {
  const provider = at(step, 3) && step !== 5
  const alone = step === 5
  const beam = at(step, 4) && step !== 5
  const theme: Theme = alone ? 'light' : at(step, 4) ? 'Dark' : null
  const muted: Tone = alone ? 'muted' : 'idle'

  return (
    <div className="cx-tree">
      <Node title="App" mono sub="rendrer Provider om Toolbar" tone={step === 3 ? 'focus' : muted} />
      <Link vertical on={at(step, 2)} tone={alone ? 'muted' : 'idle'} />
      <div className="cx-frame" data-on={provider || undefined} data-alone={alone || undefined}>
        <div className="cx-frame-label">
          <motion.span className="cx-prov" {...fade(!alone)}>
            <code>
              &lt;ThemeContext.<wbr />Provider value="Dark"&gt;
            </code>
          </motion.span>
          <motion.span className="cx-prov cx-none" {...fade(alone)}>
            ingen Provider over knappen
          </motion.span>
        </div>
        <Node
          className="cx-r1"
          title="Toolbar"
          mono
          sub={<code>&lt;div&gt;&lt;ThemedButton /&gt;&lt;/div&gt;</code>}
          tone={muted}
        >
          <span className="cx-note">
            <Tag show={at(step, 4) && step !== 5} tone="idle">
              rører den ikke
            </Tag>
          </span>
        </Node>
        <motion.span className="cx-beam-a" aria-hidden="true" {...fade(beam)} />
        <Link vertical on={at(step, 2)} tone={alone ? 'muted' : 'idle'} className="cx-r2" />
        <Node className="cx-r3" title="ThemedButton" mono tone={step === 4 || step === 5 ? 'focus' : 'idle'}>
          <code className="cx-use">const theme = useContext(ThemeContext);</code>
          <Button theme={theme} />
        </Node>
        <motion.span className="cx-beam-b" aria-hidden="true" {...fade(beam, 0.2)} />
      </div>
    </div>
  )
}

function ContextDrilling({ step }: { step: number }) {
  const ctx = at(step, 2)
  const legend = at(step, 6)
  return (
    <div className="cx">
      <section className="cx-col" data-dim={(step >= 2 && step <= 5) || undefined}>
        <header className="cx-head">
          <span className="cx-h">Prop drilling</span>
          <span className="cx-sub">værdien sendes gennem hvert niveau</span>
        </header>
        <Drill step={step} />
      </section>

      <motion.section
        className="cx-col"
        initial={false}
        animate={{ opacity: ctx ? 1 : 0, x: ctx ? 0 : 8 }}
        transition={ctx ? t.settle : t.fade}
        aria-hidden={!ctx || undefined}
      >
        <header className="cx-head">
          <span className="cx-h">Context</span>
          <span className="cx-sub">
            demoen <code>usecontext-simple</code>
          </span>
        </header>
        <Ctx step={step} />
        <div className="cx-chips">
          <code className="cx-chip" data-hot={step === 2 || step === 5 || undefined}>
            const ThemeContext = createContext('light');
          </code>
          <motion.p className="cx-default" {...fade(at(step, 5))}>
            Uden Provider over sig får <code>useContext</code> default-værdien <code>'light'</code> — fx når knappen testes alene.
          </motion.p>
        </div>
      </motion.section>

      <motion.div className="cx-legend" {...fade(legend)} aria-hidden={!legend || undefined}>
        <span className="cx-lg">Provider</span>
        <span className="cx-lg-arrow">
          <code>value</code>
        </span>
        <span className="cx-lg">Consumer</span>
        <span className="cx-sub">
          Context sender data gennem træet uden props på hvert niveau. Værdien kommer fra den <b>nærmeste</b> Provider over komponenten.
        </span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'context-drilling',
  title: 'Prop drilling og Context',
  steps: [
    {
      caption: 'Tre komponenter: `App` → `Toolbar` → `ThemedButton`. Kun knappen skal kende temaet.',
      hold: 1600,
    },
    {
      caption: '**Prop drilling**: `Toolbar` skal tage imod `theme` og sende den videre, selv om den ikke selv bruger den.',
      hold: 2600,
    },
    {
      caption: 'Med context: `createContext(\'light\')` opretter et Context-objekt med default-værdien `\'light\'`.',
      hold: 2000,
    },
    { caption: '`App` pakker træet ind i `<ThemeContext.Provider value="Dark">`.', hold: 2000 },
    {
      caption:
        '`ThemedButton` kalder `useContext(ThemeContext)` og får `"Dark"` direkte fra den nærmeste Provider. `Toolbar` rører den ikke.',
      hold: 2800,
    },
    {
      caption: 'Uden en Provider over sig får `ThemedButton` default-værdien `\'light\'` — fx når den testes alene.',
      hold: 2400,
    },
    {
      caption: 'Prop drilling sender værdien gennem hvert niveau. Context lader et fjernt barn læse den direkte fra Provideren.',
      hold: 3000,
    },
  ],
  Component: ContextDrilling,
}

export default viz
