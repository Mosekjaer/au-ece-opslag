import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Swap, Tag, Token, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './react-render.css'

/* FED React Overview.pdf s. 4–6, 19–22: LikeButton fra slides’ s. 22.
   JSX → React.createElement → react elements (virtual DOM) → DOM.
   Klik → setLiked(true) → f kører igen → ny virtual DOM → diff → patch. */

const SHY = String.fromCharCode(173) // blød bindestreg

/* Kodepanelet. Knappens JSX bliver til et createElement-kald fra trin 1. */
const JSX_BUTTON = [
  '    <button onClick={() =>',
  '      setLiked(true)}>',
  "      {liked ? 'You liked this.'",
  "        : 'Like'}",
  '    </button>',
]
const JS_BUTTON = [
  `    React.${SHY}create${SHY}Element(`,
  "      'button',",
  '      { onClick: … },',
  "      liked ? 'You liked this.'",
  "        : 'Like')",
]

function CodePanel({ step }: { step: number }) {
  const compiled = at(step, 1)
  return (
    <div className="rr-code">
      <div className="rr-code-head">
        <span className="vcaps">Kode</span>
        <Tag tone={step === 4 ? 'focus' : 'idle'}>
          <Swap show={at(step, 4) ? 1 : 0} items={['liked: false', 'liked: true']} />
        </Tag>
      </div>
      <div className="rr-pre mono">
        <div>{'function LikeButton() {'}</div>
        <div>{'  const [liked, setLiked] ='}</div>
        <div>{'    useState(false);'}</div>
        <div>{'  return ('}</div>
        <div className="rr-swapline" data-on={step === 1 || undefined}>
          <Swap
            show={compiled ? 1 : 0}
            items={[JSX_BUTTON, JS_BUTTON].map((lines, i) => (
              <div key={i}>
                {lines.map((l) => (
                  <div key={l}>{l}</div>
                ))}
              </div>
            ))}
          />
        </div>
        <div>{'  );'}</div>
        <div>{'}'}</div>
        <div className="rr-gap" />
        <div>{'function App() {'}</div>
        <div>{'  return ('}</div>
        <div>{'    <div className="App">'}</div>
        <div>{'      <h1>My first React app</h1>'}</div>
        <div>{'      <LikeButton />'}</div>
        <div>{'    </div>'}</div>
        <div>{'  );'}</div>
        <div>{'}'}</div>
      </div>
      <motion.div
        className="rr-code-note"
        initial={false}
        animate={{ opacity: compiled ? 1 : 0, y: compiled ? 0 : 4 }}
        transition={compiled ? t.settle : t.fade}
      >
        <Tag tone={step === 1 ? 'focus' : 'idle'}>JSX → JavaScript (Vite)</Tag>
      </motion.div>
    </div>
  )
}

/* Et træ med tre elementer. `kind` bestemmer notationen: react elements (objekter)
   eller html elements (tags). */
interface TreeProps {
  kind: 'react' | 'html'
  show: boolean
  liked: boolean
  tones?: { div?: Tone; h1?: Tone; btn?: Tone }
  base?: number
}

function Tree({ kind, show, liked, tones = {}, base = 0 }: TreeProps) {
  const text = liked ? 'You liked this.' : 'Like'
  const rows: { id: 'div' | 'h1' | 'btn'; depth: number; name: ReactNode; text?: string }[] =
    kind === 'react'
      ? [
          { id: 'div', depth: 0, name: 'div.App' },
          { id: 'h1', depth: 1, name: 'h1', text: 'My first React app' },
          { id: 'btn', depth: 1, name: 'button', text },
        ]
      : [
          { id: 'div', depth: 0, name: '<div class="App">' },
          { id: 'h1', depth: 1, name: '<h1>', text: 'My first React app' },
          { id: 'btn', depth: 1, name: '<button>', text },
        ]
  return (
    <ul className="rr-tree" data-kind={kind}>
      {rows.map((r, i) => {
        const tone: Tone = show ? (tones[r.id] ?? 'idle') : 'ghost'
        return (
          <motion.li
            key={r.id}
            className="rr-el"
            data-depth={r.depth}
            data-tone={tone}
            initial={false}
            animate={{ opacity: 1, y: show ? 0 : 3 }}
            transition={show ? stagger(i, base, 0.12) : t.fade}
          >
            <span className="rr-el-name mono">{r.name}</span>
            {r.text !== undefined && (
              <span className="rr-el-text" data-changed={r.id === 'btn' && tone === 'focus' ? true : undefined}>
                “{r.text}”
              </span>
            )}
          </motion.li>
        )
      })}
    </ul>
  )
}

function Render({ step }: { step: number }) {
  const diffing = step === 5
  const sameTone: Tone = at(step, 5) ? 'muted' : 'idle'
  const prevTones = { div: sameTone, h1: sameTone, btn: at(step, 5) ? 'focus' : 'idle' } as const
  const newTones = {
    div: sameTone,
    h1: sameTone,
    btn: step === 4 || at(step, 5) ? 'focus' : 'idle',
  } as const
  const domLiked = at(step, 6)

  return (
    <div className="rr">
      <CodePanel step={step} />

      <div className="rr-stage">
        {/* Virtual DOM: forrige og nye træ side om side. */}
        <section className="rr-layer" data-on={at(step, 2) || undefined}>
          <header className="rr-layer-head">
            <span className="rr-layer-name">virtual DOM</span>
            <span className="rr-layer-kind">react elements</span>
          </header>
          <div className="rr-vdom">
            <div className="rr-col">
              <span className="rr-col-label" data-on={at(step, 4) || undefined}>
                <Swap show={at(step, 4) ? 1 : 0} items={['', 'previous virtual DOM']} />
              </span>
              <Tree kind="react" show={at(step, 2)} liked={false} tones={prevTones} />
              <motion.span
                className="rr-aside"
                initial={false}
                animate={{ opacity: step === 2 || step === 3 ? 1 : 0 }}
                transition={t.fade}
              >
                billige objekter, immutable
              </motion.span>
            </div>
            <div className="rr-f">
              <Link on={at(step, 4)} label={<code className="rr-fn">f</code>} tone={step === 4 ? 'focus' : 'idle'} />
            </div>
            <div className="rr-col">
              <span className="rr-col-label" data-on={at(step, 4) || undefined}>
                <Swap show={at(step, 4) ? 1 : 0} items={['', 'new virtual DOM']} />
              </span>
              <Tree kind="react" show={at(step, 4)} liked tones={newTones} />
            </div>
          </div>
        </section>

        {/* Båndet mellem lagene: opdateringer ned, events op, diff og patch. */}
        <div className="rr-band">
          <div className="rr-band-left">
            <span className="rr-arrow">
              <Link on={at(step, 3)} vertical tone={step === 3 ? 'focus' : 'idle'} />
              <motion.span className="rr-arrow-label" initial={false} animate={{ opacity: at(step, 3) ? 1 : 0 }} transition={t.fade}>
                optimized updates
              </motion.span>
            </span>
            <span className="rr-arrow">
              <Link on={at(step, 4)} vertical back tone={step === 4 ? 'focus' : 'idle'} />
              <motion.span className="rr-arrow-label" initial={false} animate={{ opacity: at(step, 4) ? 1 : 0 }} transition={t.fade}>
                input, events
              </motion.span>
            </span>
          </div>
          <div className="rr-band-right">
            <motion.div
              className="rr-diff"
              data-tone={diffing ? 'focus' : 'idle'}
              initial={false}
              animate={{ opacity: at(step, 5) ? 1 : 0, scale: at(step, 5) ? 1 : 0.96 }}
              transition={at(step, 5) ? t.place : t.fade}
            >
              <span className="rr-diff-name">Diff</span>
              <span className="rr-diff-sub">
                kun <code>button</code>-teksten er forskellig
              </span>
            </motion.div>
            <span className="rr-arrow">
              <Link on={at(step, 6)} vertical tone={step === 6 ? 'focus' : 'idle'} />
              <motion.span className="rr-arrow-label" initial={false} animate={{ opacity: at(step, 6) ? 1 : 0 }} transition={t.fade}>
                patch
              </motion.span>
            </span>
          </div>
        </div>

        {/* Browserens DOM: html elements og det, brugeren ser. */}
        <section className="rr-layer" data-on={at(step, 3) || undefined}>
          <header className="rr-layer-head">
            <span className="rr-layer-name">DOM</span>
            <span className="rr-layer-kind">html elements</span>
          </header>
          <div className="rr-dom">
            <div className="rr-screen" data-on={at(step, 3) || undefined}>
              <motion.div
                className="rr-screen-body"
                initial={false}
                animate={{ opacity: at(step, 3) ? 1 : 0 }}
                transition={at(step, 3) ? { ...t.settle, delay: 0.35 } : t.fade}
              >
                <span className="rr-screen-h1">My first React app</span>
                <span className="rr-screen-row">
                  <span className="rr-screen-btn" data-changed={step === 6 || undefined}>
                    <Swap show={domLiked ? 1 : 0} items={['Like', 'You liked this.']} />
                  </span>
                  <span className="rr-click">
                    {step === 4 && (
                      <Token id="rr-click" tone="focus">
                        klik
                      </Token>
                    )}
                  </span>
                </span>
              </motion.div>
            </div>
            <Tree
              kind="html"
              show={at(step, 3)}
              liked={domLiked}
              tones={{ btn: step === 6 ? 'focus' : 'idle' }}
              base={0.1}
            />
          </div>
        </section>
      </div>

      <motion.ul
        className="rr-legend"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0, y: at(step, 6) ? 0 : 4 }}
        transition={at(step, 6) ? t.settle : t.fade}
      >
        <li>
          JSX → <code>createElement</code> → react elements
        </li>
        <li>state ændres → f → ny virtual DOM</li>
        <li>diff → patch kun forskellen</li>
        <li className="rr-formula">
          <code>UI = f(state)</code>
        </li>
      </motion.ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'react-render',
  title: 'LikeButton fra JSX til patch i DOM’en',
  steps: [
    { caption: '`App` renderer en overskrift og en `<LikeButton />`. Knappens state er `liked: false`.', hold: 1600 },
    { caption: 'Browseren kan ikke læse JSX. Vite oversætter hvert tag til et `React.createElement`-kald.', hold: 2200 },
    { caption: 'Kaldene giver **react elements**: et træ af almindelige objekter — den virtuelle DOM.', hold: 2200 },
    { caption: 'React DOM skriver træet til browserens **DOM** som html elements. Brugeren ser knappen “Like”.', hold: 2400 },
    {
      caption: 'Klik: `setLiked(true)` ændrer state, og React kører `LikeButton` igen (`f`). Det giver en **ny** virtual DOM.',
      hold: 2800,
    },
    { caption: '**Diff**: React sammenligner det forrige og det nye træ. Kun knappens tekst er forskellig.', hold: 2600 },
    {
      caption: '**Patch**: kun knappens tekst skrives til DOM’en; `div` og `h1` røres ikke. Det er `UI = f(state)`.',
      hold: 3000,
    },
  ],
  Component: Render,
}

export default viz
