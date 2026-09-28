import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, Token, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './event-propagation.css'

/* Handling Events in React.pdf s. 13–14: et klik på <button> går ned fra window
   (capture), rammer knappen (target) og bobler op igen (bubbling). React-kortet
   viser s. 14; stopPropagation (The DOM.pdf s. 24) anvendt lige over knappen er
   vores eget eksempel på reglen. */

const SHY = String.fromCharCode(0xad)
const NODES = ['window', 'document', '<html>', '<body>', '<header>', '<nav>', '<button>'] as const
const BUTTON = NODES.length - 1
const LETTERS = 'abcdef'

type Pos = { lane: 'cap' | 'bub' | 'target'; row: number }

// Hvor klikket er i hvert trin. Trin 5 er et nyt klik, der stoppes på knappen.
const CLICK: (Pos | null)[] = [
  { lane: 'cap', row: 0 },
  { lane: 'cap', row: 5 },
  { lane: 'target', row: BUTTON },
  { lane: 'bub', row: 0 },
  { lane: 'bub', row: 0 },
  null,
  { lane: 'bub', row: 0 },
]

const HANDLERS = [
  { n: 1, name: 'handler1', where: 'main', phase: 'capture', dir: '↓' },
  { n: 2, name: 'handler2', where: 'button', phase: 'target', dir: '•' },
  { n: 3, name: 'handler3', where: 'button', phase: 'target', dir: '•' },
  { n: 4, name: 'handler4', where: 'main', phase: 'bubbling', dir: '↑' },
] as const

function Mark({ on, letter, tone, i }: { on: boolean; letter: string; tone: Tone; i: number }) {
  return (
    <motion.span
      className="ep-mark"
      data-tone={on ? tone : 'ghost'}
      initial={false}
      animate={{ scale: on ? 1 : 0.8 }}
      transition={on ? stagger(i, 0.1, 0.1) : t.fade}
    >
      {letter}
    </motion.span>
  )
}

function Lane({ kind, on, tone }: { kind: 'cap' | 'bub'; on: boolean; tone: Tone }) {
  return (
    <div className={`ep-lane ep-lane-${kind}`} data-tone={tone}>
      <motion.div
        className="ep-lane-line"
        initial={false}
        animate={{ scaleY: on ? 1 : 0 }}
        transition={on ? { ...t.travel, duration: 1.1 } : t.fade}
      />
      <motion.span className="ep-lane-head" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade} />
    </div>
  )
}

function Propagation({ step }: { step: number }) {
  const click = CLICK[step]
  const capOn = at(step, 1)
  const targetOn = at(step, 2)
  const bubOn = at(step, 3)
  const stopped = step === 5
  const stopShown = at(step, 5)
  const react = at(step, 4)

  const token = (
    <Token id="ep-click" tone={step === 0 || step === 4 || step === 6 ? 'idle' : 'focus'} launch={step === 1}>
      click
    </Token>
  )
  const here = (lane: Pos['lane'], row: number) => click?.lane === lane && click.row === row
  const bubTone: Tone = stopped ? 'muted' : 'focus'

  return (
    <div className="ep">
      <div className="ep-tree" role="img" aria-label="Eventets vej: capture ned fra window til nav, target på button, bubbling op fra nav til window">
        <span className="ep-phase ep-phase-cap" data-on={capOn || undefined} data-now={step === 1 || undefined}>
          1. Capture phase ↓
        </span>
        <span className="ep-phase ep-phase-bub" data-on={(bubOn && !stopped) || undefined} data-now={step === 3 || undefined}>
          ↑ 3. Bubbling phase
        </span>

        <Lane kind="cap" on={capOn} tone={step === 1 ? 'focus' : 'idle'} />
        <Lane kind="bub" on={bubOn} tone={stopped ? 'muted' : step === 3 ? 'focus' : 'idle'} />

        {NODES.map((n, row) => {
          const isButton = row === BUTTON
          const capI = row
          const bubI = BUTTON - 1 - row
          const nodeTone = isButton ? (targetOn && step === 2 ? 'focus' : 'target') : stopped && row < BUTTON ? 'muted' : 'idle'
          return (
            <div key={n} className="ep-row" data-button={isButton || undefined} style={{ '--r': row + 2 } as CSSProperties}>
              <div className="ep-cell ep-cap">
                <span className="ep-slot">{here('cap', row) && token}</span>
                {!isButton && <Mark on={capOn} letter={LETTERS[capI]} tone={step === 1 ? 'focus' : 'idle'} i={capI} />}
              </div>
              <code className="ep-node" data-tone={nodeTone}>
                {n}
              </code>
              <div className="ep-cell ep-bub">
                {!isButton && <Mark on={bubOn} letter={LETTERS[bubI]} tone={stopped ? 'muted' : step === 3 ? bubTone : 'idle'} i={bubI} />}
                <span className="ep-slot">
                  {here('bub', row) && token}
                  {isButton && stopped && (
                    <Token id="ep-click-2" tone="neg">
                      click
                    </Token>
                  )}
                </span>
                {isButton && (
                  <motion.span
                    className="ep-stop"
                    initial={false}
                    animate={{ opacity: stopped ? 1 : 0, scaleX: stopped ? 1 : 0.4 }}
                    transition={stopped ? t.place : t.fade}
                  />
                )}
              </div>
            </div>
          )
        })}

        <div className="ep-target" style={{ gridRow: NODES.length + 2 }}>
          <span className="ep-target-head">
            <span className="ep-slot">{here('target', BUTTON) && token}</span>
            <span className="ep-phase" data-on={targetOn || undefined} data-now={step === 2 || undefined}>
              2. Target phase
            </span>
            <span className="ep-slot" aria-hidden="true" />
          </span>
          <span className="ep-target-tags">
            <Tag show={targetOn} tone={step === 2 ? 'focus' : 'idle'}>
              a) capture listener
            </Tag>
            <Tag show={targetOn} tone={step === 2 ? 'focus' : 'idle'}>
              b) bubble listener
            </Tag>
          </span>
        </div>
      </div>

      <div className="ep-side">
        <motion.section className="ep-card" initial={false} animate={{ opacity: react ? 1 : 0.3 }} transition={t.fade} data-on={step === 4 || undefined}>
          <span className="vcaps">I React</span>
          <pre className="ep-jsx mono">
            {'<main onClickCapture={handler1}\n      onClick={handler4}>\n  <button onClickCapture={handler2}\n          onClick={handler3} />\n</main>'}
          </pre>
          <ol className="ep-order">
            {HANDLERS.map((h, i) => (
              <motion.li
                key={h.n}
                data-phase={h.phase}
                initial={false}
                animate={{ opacity: react ? 1 : 0, x: react ? 0 : -6 }}
                transition={react ? stagger(i, 0.2, 0.18) : t.fade}
              >
                <span className="ep-n">{h.n}</span>
                <code>{h.name}</code>
                <span className="ep-where">
                  {h.dir} {h.phase} · <code>{h.where}</code>
                </span>
              </motion.li>
            ))}
          </ol>
          <span className="ep-card-note">rækkefølgen følger af faserne</span>
        </motion.section>

        <div className="ep-calls">
          <motion.div
            className="ep-call"
            data-tone={stopped ? 'neg' : 'idle'}
            initial={false}
            animate={{ opacity: stopShown ? 1 : 0, y: stopShown ? 0 : 4 }}
            transition={stopShown ? t.settle : t.fade}
          >
            <code>stop{SHY}Propagation()</code>
            <span>handlers længere oppe får ikke eventet</span>
          </motion.div>
          <motion.div
            className="ep-call"
            data-tone="idle"
            initial={false}
            animate={{ opacity: stopShown ? 1 : 0, y: stopShown ? 0 : 4 }}
            transition={stopShown ? { ...t.settle, delay: 0.15 } : t.fade}
          >
            <code>prevent{SHY}Default()</code>
            <span>browserens default action udføres ikke</span>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'event-propagation',
  title: 'Et klik går ned, rammer knappen og bobler op',
  steps: [
    { caption: 'Et klik på `<button>`. Eventet skal forbi alle knappens forfædre.', hold: 1600 },
    { caption: '**Capture phase**: eventet sendes ned fra `window` gennem `document`, `<html>`, `<body>` og `<header>` til `<nav>`.', hold: 2600 },
    { caption: '**Target phase**: på knappen kører først capture-listeneren, så bubble-listeneren.', hold: 2200 },
    { caption: '**Bubbling phase**: eventet bobler op igen fra `<nav>` til `window`. Standard er bubble listeners.', hold: 2600 },
    { caption: 'I React lytter `onClickCapture` på vejen ned og `onClick` på vejen op.', hold: 3000 },
    {
      caption:
        'Et nyt klik, hvor knappens handler kalder `stopPropagation()`: handlers længere oppe får ikke eventet. `preventDefault()` er noget andet — den stopper browserens default action.',
      hold: 3000,
    },
    { caption: 'Ned, ramt, op. React lægger listeners som bubble listeners, medmindre navnet ender på `Capture`.', hold: 3000 },
  ],
  Component: Propagation,
}

export default viz
