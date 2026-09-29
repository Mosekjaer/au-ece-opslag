import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './gpio-edge-irq.css'

/* 12.2-Week_13_-_GPIO_interrupts.pdf s. 2 (level vs. edge, active-low), s. 6–13 (gpio_int:
   /dev/gpiochip0, GPIO_GET_LINEEVENT_IOCTL, GPIOEVENT_REQUEST_BOTH_EDGES, poll/POLLIN,
   gpioevent_data.id) og s. 19–25 (gpio_isr: GPIO_PIN 587 = 571 + 16, request_irq med
   IRQF_TRIGGER_RISING, gpio_irq_handler → IRQ_HANDLED). Pin 16 er BTN_DOWN i
   led_mem_map_gpio, og kursets knapper er active-low. Kurven er en skitse af ét tryk. */

/** Brudmuligheder i lange kodelinjer (efter (, , og ·), så de aldrig knækker midt i et navn. */
function wb(s: string) {
  const parts = s.split(/(?<=\(|,|·)/)
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </span>
  ))
}

/* Signalets form i procent af bredden: høj → falder ved F → lav → stiger ved R → høj. */
const F = 32
const R = 68

function Wave({ step }: { step: number }) {
  const level = step >= 1
  const edges = step >= 2
  const fallHot = step === 4
  const riseHot = step === 5 || step === 6
  return (
    <div className="ge-wave">
      <div className="ge-axis" aria-hidden="true">
        <span>1</span>
        <span>0</span>
      </div>
      <div className="ge-plot">
        <svg className="ge-svg" viewBox="0 0 100 40" preserveAspectRatio="none" aria-hidden="true">
          <line className="ge-grid" x1="0" x2="100" y1="8" y2="8" />
          <line className="ge-grid" x1="0" x2="100" y1="32" y2="32" />
          <motion.rect
            className="ge-level"
            x={F}
            y={4}
            width={R - F}
            height={32}
            initial={false}
            animate={{ opacity: level ? 1 : 0 }}
            transition={t.fade}
          />
          <path className="ge-signal" d={`M0 8 H${F} V32 H${R} V8 H100`} />
          {[
            { x: F, hot: fallHot },
            { x: R, hot: riseHot },
          ].map((e) => (
            <motion.line
              key={e.x}
              className="ge-edge"
              data-hot={e.hot || undefined}
              x1={e.x}
              x2={e.x}
              y1={8}
              y2={32}
              initial={false}
              animate={{ opacity: edges ? 1 : 0 }}
              transition={t.fade}
            />
          ))}
        </svg>
        <motion.span
          className="ge-lab ge-lab-level"
          style={{ left: `${(F + R) / 2}%` }}
          initial={false}
          animate={{ opacity: level ? 1 : 0 }}
          transition={t.fade}
        >
          level: low
        </motion.span>
        <motion.span
          className="ge-lab ge-lab-edge"
          data-hot={fallHot || undefined}
          style={{ left: `${F}%` }}
          initial={false}
          animate={{ opacity: edges ? 1 : 0 }}
          transition={t.fade}
        >
          falling
        </motion.span>
        <motion.span
          className="ge-lab ge-lab-edge"
          data-hot={riseHot || undefined}
          style={{ left: `${R}%` }}
          initial={false}
          animate={{ opacity: edges ? 1 : 0 }}
          transition={t.fade}
        >
          rising
        </motion.span>
      </div>
      <div className="ge-under" aria-hidden="true">
        <span className="ge-under-press" style={{ left: `${F}%`, width: `${R - F}%` }}>
          knappen trykket (active-low)
        </span>
      </div>
    </div>
  )
}

function Lane({
  name,
  file,
  setup,
  setupOn,
  state,
  log,
  on,
}: {
  name: string
  file: string
  setup: string
  setupOn: boolean
  state: { text: string; tone: 'idle' | 'focus' | 'muted' }
  log: { text: string; on: boolean; hot: boolean }[]
  on: boolean
}) {
  return (
    <section className="ge-lane" data-on={on || undefined}>
      <header className="ge-lane-head">
        <span className="ge-lane-name">{name}</span>
        <code className="ge-lane-file">{file}</code>
      </header>
      <motion.code
        className="ge-setup"
        initial={false}
        animate={{ opacity: setupOn ? 1 : 0.3 }}
        transition={t.fade}
      >
        {wb(setup)}
      </motion.code>
      <div className="ge-state">
        <Tag tone={state.tone} wrap>
          {state.text}
        </Tag>
      </div>
      <div className="ge-log">
        {log.map((l) => (
          <motion.code
            key={l.text}
            className="ge-log-line"
            data-hot={l.hot || undefined}
            initial={false}
            animate={{ opacity: l.on ? 1 : 0, y: l.on ? 0 : 3 }}
            transition={l.on ? t.settle : t.fade}
          >
            {l.text}
          </motion.code>
        ))}
      </div>
    </section>
  )
}

function GpioEdge({ step }: { step: number }) {
  const userState =
    step < 3
      ? { text: 'ikke startet', tone: 'muted' as const }
      : step === 3
        ? { text: 'poll(&pfd, 1, -1) blokerer', tone: 'idle' as const }
        : step === 4 || step === 5
          ? { text: 'POLLIN → read(req.fd, &event, …)', tone: 'focus' as const }
          : { text: 'poll(&pfd, 1, -1) blokerer igen', tone: 'idle' as const }
  const kernState =
    step < 6
      ? { text: 'ikke indlæst', tone: 'muted' as const }
      : { text: 'gpio_irq_handler → IRQ_HANDLED', tone: 'focus' as const }
  return (
    <div className="ge">
      <div className="ge-top">
        <span className="ge-pin">
          <code>GPIO16</code>
          <span className="ge-pin-alt">
            offset 16 på <code>/dev/gpiochip0</code> · kernel GPIO 587
          </span>
        </span>
      </div>
      <Wave step={step} />
      <div className="ge-lanes">
        <Lane
          name="User space"
          file="gpio_int"
          on={step >= 3 && step <= 5}
          setup={'ioctl(chip_fd, GPIO_GET_LINEEVENT_IOCTL, &req) · GPIOEVENT_REQUEST_BOTH_EDGES'}
          setupOn={step >= 3}
          state={userState}
          log={[
            { text: '16: Falling edge', on: step >= 4, hot: step === 4 },
            { text: '16: Rising edge', on: step >= 5, hot: step === 5 },
          ]}
        />
        <Lane
          name="Kernel"
          file="gpio_isr"
          on={step >= 6}
          setup={'request_irq(irq_number, gpio_irq_handler, IRQF_TRIGGER_RISING, "my_isr", NULL)'}
          setupOn={step >= 6}
          state={kernState}
          log={[{ text: 'gpio_isr: GPIO587 interrupt triggered!', on: step >= 6, hot: step === 6 }]}
        />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'gpio-edge-irq',
  title: 'Én knap, to flanker, ét event pr. flanke',
  steps: [
    {
      caption: 'Pin 16 over tid. Knappen er active-low: et tryk trækker pinnen fra 1 til 0.',
      hold: 2000,
    },
    {
      caption: '**Level**-triggering reagerer på tilstanden — så længe pinnen er lav (`IRQF_TRIGGER_LOW`) eller høj (`_HIGH`).',
      hold: 2600,
    },
    {
      caption: '**Edge**-triggering reagerer på overgangen: **falling** ved trykket, **rising** ved slip.',
      hold: 2600,
    },
    {
      caption:
        '`gpio_int` beder om begge flanker med `ioctl(GPIO_GET_LINEEVENT_IOCTL)` og får `req.fd`. `poll` blokerer.',
      hold: 3000,
    },
    {
      caption: 'Falling edge: `poll` vågner med `POLLIN`, `read` henter en `gpioevent_data`, og `event.id` siger falling.',
      hold: 2800,
    },
    { caption: 'Rising edge ved slip: endnu et event på samme fd.', hold: 2200 },
    {
      caption:
        'Kernel-modulet `gpio_isr` registrerer kun `IRQF_TRIGGER_RISING`. ISR’en kører ved slip, holdes kort og returnerer `IRQ_HANDLED`.',
      hold: 3200,
    },
  ],
  Component: GpioEdge,
}

export default viz
