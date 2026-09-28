import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { LayoutGroup, motion, useInView, useReducedMotion } from 'motion/react'
import type { VizDef } from './types'
import { rich } from '../../components/Rich'

/* Rammen om hver visualisering.
   - Starter når den kommer i view (ikke før), én gang.
   - Hvert trin står i sin egen forfattede tid.
   - Slutter på slutrammen og bliver der.
   - Replay, trin for trin (knapper, ←/→ når figuren har fokus).
   - prefers-reduced-motion: vis slutrammen, ingen autoplay. */

export function Figure({ viz, number, course }: { viz: VizDef; number?: number; course?: string }) {
  const reduced = useReducedMotion() ?? false
  const last = viz.steps.length - 1
  const ref = useRef<HTMLElement>(null)
  const inView = useInView(ref, { amount: 0.45, once: true })
  const [step, setStep] = useState(() => (reduced ? last : 0))
  const [playing, setPlaying] = useState(false)
  const [started, setStarted] = useState(reduced)
  const [run, setRun] = useState(0) // skifter nøgle ved replay, så fremdriftsbjælken genstarter

  // useReducedMotion kan først svare efter første render.
  useEffect(() => {
    if (reduced && !started) {
      setStarted(true)
      setStep(last)
    }
  }, [reduced, started, last])

  useEffect(() => {
    if (inView && !started) {
      setStarted(true)
      setPlaying(true)
    }
  }, [inView, started])

  useEffect(() => {
    if (!playing) return
    if (step >= last) {
      setPlaying(false)
      return
    }
    const id = window.setTimeout(() => setStep((s) => Math.min(s + 1, last)), viz.steps[step].hold)
    return () => window.clearTimeout(id)
  }, [playing, step, last, viz.steps])

  const replay = useCallback(() => {
    setStep(0)
    setRun((r) => r + 1)
    setPlaying(true)
    setStarted(true)
  }, [])

  const go = useCallback(
    (n: number) => {
      setPlaying(false)
      setStep(Math.max(0, Math.min(last, n)))
    },
    [last],
  )

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowRight') {
      e.preventDefault()
      go(step + 1)
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault()
      go(step - 1)
    }
  }

  const Component = viz.Component
  const done = step === last && !playing

  return (
    <figure className="fig" ref={ref} aria-labelledby={`fig-${viz.id}`}>
      <header className="fig-head">
        <span className="label">{number ? `Figur ${number}` : 'Figur'}</span>
        <h3 className="fig-title" id={`fig-${viz.id}`}>
          {viz.title}
        </h3>
      </header>

      <div
        className="fig-plate"
        tabIndex={0}
        onKeyDown={onKey}
        aria-label={`${viz.title}. Trin ${step + 1} af ${last + 1}. Brug venstre og højre pil for at gå trin for trin.`}
      >
        <LayoutGroup id={viz.id}>
          <Component step={step} />
        </LayoutGroup>
      </div>

      <div className="fig-foot">
        <div className="fig-caption" aria-live="polite">
          <span className="fig-count">
            {step + 1}
            <span className="fig-count-of">/{last + 1}</span>
          </span>
          <motion.p
            key={step}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            {rich(viz.steps[Math.min(step, last)].caption, course)}
          </motion.p>
        </div>

        <div className="fig-controls">
          <div className="fig-ticks" role="group" aria-label="Trin">
            {viz.steps.map((s, i) => (
              <button
                key={i}
                className="fig-tick"
                data-state={i < step ? 'past' : i === step ? 'now' : 'next'}
                onClick={() => go(i)}
                aria-label={`Gå til trin ${i + 1}`}
                aria-current={i === step ? 'step' : undefined}
              >
                {i === step && playing && !reduced && (
                  <span key={`${run}-${i}`} className="fig-tick-fill" style={{ animationDuration: `${s.hold}ms` }} />
                )}
              </button>
            ))}
          </div>
          <div className="fig-buttons">
            <button className="fig-btn" onClick={() => go(step - 1)} disabled={step === 0} aria-label="Forrige trin">
              <Chevron dir="left" />
            </button>
            <button className="fig-btn" onClick={() => go(step + 1)} disabled={step === last} aria-label="Næste trin">
              <Chevron dir="right" />
            </button>
            <button className="fig-btn fig-btn-text" onClick={replay} aria-label="Afspil igen fra start">
              <Replay />
              <span>{done ? 'Afspil igen' : 'Forfra'}</span>
            </button>
          </div>
        </div>
      </div>
    </figure>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d={dir === 'left' ? 'M10 3.5 5.5 8 10 12.5' : 'M6 3.5 10.5 8 6 12.5'}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function Replay() {
  return (
    <svg width="15" height="15" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.2 8a4.8 4.8 0 1 0 1.5-3.5M3 2.5v2.8h2.8"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
