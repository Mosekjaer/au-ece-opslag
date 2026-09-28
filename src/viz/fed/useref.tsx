import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Swap, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './useref.css'

/* FED React useRef Hook.pdf s. 2 (to tællere) og s. 6 (textboxRef).
   Klikforløbet er figurens eget: state-klik, to ref-klik, state-klik.
   Skærmen er et øjebliksbillede fra seneste render. */

const COUNT = [1, 2, 2, 2, 3, 3, 3]
const REF = [1, 1, 2, 3, 3, 3, 3]
const SHOWN_REF = [1, 1, 1, 1, 3, 3, 3]
const RENDERS = [1, 2, 2, 2, 3, 3, 3]

/** Et tal, der skifter med en lille landing, når værdien ændrer sig. */
function Val({ v, className }: { v: ReactNode; className?: string }) {
  return (
    <span className={`ur-val ${className ?? ''}`}>
      <AnimatePresence initial={false} mode="popLayout">
        <motion.span
          key={String(v)}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6, transition: t.fade }}
          transition={t.place}
        >
          {v}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Lane({
  name,
  decl,
  handler,
  hot,
  mem,
  memTone,
}: {
  name: ReactNode
  decl: ReactNode
  handler: ReactNode
  hot: boolean
  mem: ReactNode
  memTone: boolean
}) {
  return (
    <div className="ur-lane" data-hot={hot || undefined}>
      <span className="vcaps">{name}</span>
      <div className="ur-code">
        <code className="ur-line">{decl}</code>
        <code className="ur-line" data-hot={hot || undefined}>
          {handler}
        </code>
      </div>
      <div className="ur-mem" data-hot={memTone || undefined}>
        {mem}
      </div>
    </div>
  )
}

function UseRef({ step }: { step: number }) {
  const render = step === 1 || step === 4
  const stale = step === 2 || step === 3
  const dom = at(step, 5)
  const legend = at(step, 6)

  return (
    <div className="ur">
      <div className="ur-lanes">
        <Lane
          name="State"
          decl={<>const [count, setCount] = useState(1);</>}
          handler={<>const incCount = () =&gt; setCount(c =&gt; c + 1);</>}
          hot={step === 1 || step === 4}
          memTone={step === 1 || step === 4}
          mem={
            <>
              <code>count</code>
              <span className="ur-eq">=</span>
              <Val v={COUNT[step]} className="mono" />
            </>
          }
        />
        <Lane
          name="Ref"
          decl={<>const ref = useRef(1);</>}
          handler={<>const incRef = () =&gt; ref.current++;</>}
          hot={step === 2 || step === 3}
          memTone={step === 2 || step === 3}
          mem={
            <>
              <code>ref</code>
              <span className="ur-eq">=</span>
              <code>
                {'{ current: '}
                <Val v={REF[step]} />
                {' }'}
              </code>
            </>
          }
        />
      </div>

      <div className="ur-render">
        <Link vertical on={render || at(step, 6)} tone={render ? 'focus' : 'idle'} />
        <span className="ur-render-label">render</span>
        <Swap
          show={render ? 0 : stale ? 1 : 2}
          items={[
            <Tag key="r">re-render</Tag>,
            <Tag key="n" tone="idle">
              ingen render
            </Tag>,
            <span key="e" />,
          ]}
        />
      </div>

      <div className="ur-screen" data-hot={render || undefined}>
        <div className="ur-screen-head">
          <span className="vcaps">Skærmen</span>
          <span className="ur-screen-sub">
            fra render nr. <Val v={RENDERS[step]} />
          </span>
        </div>
        <div className="ur-cells">
          <div className="ur-cell">
            <code>{'{count}'}</code>
            <Val v={COUNT[step]} className="ur-big" />
          </div>
          <div className="ur-cell" data-stale={stale || undefined}>
            <code>{'{ref.current}'}</code>
            <Val v={SHOWN_REF[step]} className="ur-big" />
            <span className="ur-stale">
              <Tag show={stale} tone="neg">
                forældet
              </Tag>
            </span>
          </div>
        </div>
      </div>

      <motion.div
        className="ur-dom"
        initial={false}
        animate={{ opacity: dom ? 1 : 0, y: dom ? 0 : 8 }}
        transition={dom ? t.settle : t.fade}
        aria-hidden={!dom || undefined}
      >
        <span className="vcaps">Ref til et DOM-element</span>
        <div className="ur-code">
          <code className="ur-line">const textbox&shy;Ref = useRef&lt;HTMLInputElement&gt;(null);</code>
          <code className="ur-line" data-hot={step === 5 || undefined}>
            &lt;input type="text" ref=&#123;textbox&shy;Ref&#125; defaultValue="2022-06-24" /&gt;
          </code>
        </div>
        <div className="ur-domflow">
          <div className="ur-obj">
            <code>textbox&shy;Ref</code>
            <code className="ur-obj-body">{'{ current: ● }'}</code>
          </div>
          <Link on={dom} label={<code>current</code>} tone={step === 5 ? 'focus' : 'idle'} className="ur-domlink" />
          <div className="ur-field-wrap">
            <span className="ur-field">2022-06-24</span>
            <span className="ur-field-sub">
              DOM-noden <code>&lt;input&gt;</code>
            </span>
          </div>
        </div>
        <motion.div
          className="ur-read"
          initial={false}
          animate={{ opacity: dom ? 1 : 0 }}
          transition={dom ? { ...t.settle, delay: 0.7 } : t.fade}
        >
          <code>textbox&shy;Ref.<wbr />current.<wbr />value</code>
          <span className="ur-arrow">→</span>
          <code>"2022-06-24"</code>
        </motion.div>
      </motion.div>

      <motion.ul
        className="ur-legend"
        aria-hidden={!legend || undefined}
        initial={false}
        animate={{ opacity: legend ? 1 : 0 }}
        transition={t.fade}
      >
        {[
          [<code key="c">setCount(…)</code>, 're-render'],
          [<code key="c">ref.current = …</code>, 'husket, ingen render'],
          [<code key="c">ref=&#123;…&#125;</code>, 'current er DOM-elementet'],
        ].map(([code, text], i) => (
          <motion.li
            key={i}
            initial={false}
            animate={{ opacity: legend ? 1 : 0, y: legend ? 0 : 4 }}
            transition={legend ? stagger(i, 0.05, 0.1) : t.fade}
          >
            {code}
            <span className="ur-arrow">→</span>
            <span>{text}</span>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'useref',
  title: 'En tæller med state og en tæller med ref',
  steps: [
    {
      caption: 'To tællere i samme komponent: én med `useState(1)`, én med `useRef(1)`. Skærmen viser begge værdier fra seneste render.',
      hold: 1800,
    },
    { caption: '`incCount` kalder `setCount(c => c + 1)`. React får besked, renderer igen, og skærmen viser 2.', hold: 2200 },
    {
      caption: '`incRef` kører `ref.current++`. Værdien bliver 2, men React får **ingen besked** — skærmen står stille på 1.',
      hold: 2600,
    },
    { caption: 'Et klik mere: `ref.current` er 3. Skærmen viser stadig 1.', hold: 1600 },
    {
      caption: 'Næste render — udløst af state — viser også refens aktuelle værdi. Ref-objektet blev husket mellem renders hele tiden.',
      hold: 2800,
    },
    {
      caption: 'Med `ref={textboxRef}` peger `current` på selve input-elementet, og `textboxRef.current.value` er teksten i feltet.',
      hold: 2800,
    },
    {
      caption: 'State re-renderer. En ref husker uden at rendere. En ref på et element giver DOM-noden.',
      hold: 3000,
    },
  ],
  Component: UseRef,
}

export default viz
