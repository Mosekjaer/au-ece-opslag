import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './blocking-poll.css'

/* 06.2 s. 2 (blocking: kernen suspenderer processen, til mindst én byte er klar),
   s. 4 og nonblocking_io.cpp (fcntl F_SETFL med O_NONBLOCK, -1 og errno == EAGAIN
   || EWOULDBLOCK, “Nothing entered!”), s. 15–16 og noblkio_edge.cpp (poll(), events
   = POLLIN, revents & POLLIN, POLL_TIMEOUT_MS = 1). Tidsaksen er skematisk: antal
   kald og længder er ikke målt. Kursets nonblocking_io.cpp kalder read() én gang;
   løkken i spor 2 er et eksempel. Indhold: src/content/sys/p5-posix-io.ts. */

const DATA = 58 // procent af tidsaksen, hvor data er klar

// Non-blocking: read() kaldt igen og igen (eksempel).
const SPINS = [0, 7, 14, 21, 28, 35, 42, 49]
// poll(): sover til timeout, kaldes igen; sidste kald vækkes af data.
const POLLS: [number, number][] = [
  [0, 12],
  [13.5, 25.5],
  [27, 39],
  [40.5, 52.5],
  [54, DATA],
]

function Lane({
  name,
  call,
  children,
  note,
  tone,
}: {
  name: ReactNode
  call: ReactNode
  children: ReactNode
  note: ReactNode
  tone: 'on' | 'off' | 'now'
}) {
  return (
    <div className="bp-lane" data-state={tone}>
      <div className="bp-label">
        <span className="bp-name">{name}</span>
        <code className="bp-call">{call}</code>
      </div>
      <div className="bp-track">
        <div className="bp-axis" />
        <div className="bp-data" style={{ left: `${DATA}%` }} />
        {children}
      </div>
      <div className="bp-note">{note}</div>
    </div>
  )
}

function Fade({ on, delay = 0, children, className, style }: { on: boolean; delay?: number; children?: ReactNode; className?: string; style?: CSSProperties }) {
  return (
    <motion.div
      className={className}
      style={style}
      initial={false}
      animate={{ opacity: on ? 1 : 0 }}
      transition={on ? { ...t.fade, delay } : t.fade}
    >
      {children}
    </motion.div>
  )
}

function Bar({ from, to, on, delay = 0, className }: { from: number; to: number; on: boolean; delay?: number; className: string }) {
  return (
    <motion.div
      className={`bp-bar ${className}`}
      style={{ left: `${from}%`, width: `${to - from}%` }}
      initial={false}
      animate={{ scaleX: on ? 1 : 0, opacity: on ? 1 : 0 }}
      transition={on ? { ...t.travel, delay } : t.fade}
    />
  )
}

function BlockingPoll({ step }: { step: number }) {
  const state = (from: number, now: number[]) => (now.includes(step) ? 'now' : step >= from ? 'on' : 'off')

  return (
    <div className="bp">
      <div className="bp-head">
        <span className="bp-head-pad" />
        <div className="bp-head-track">
          <span className="vcaps">tid →</span>
          <span className="bp-head-data" style={{ left: `${DATA}%` }}>
            <Tag tone={step >= 2 ? 'focus' : 'idle'}>data klar</Tag>
          </span>
        </div>
      </div>

      <Lane
        name="Blocking"
        call="read(STDIN_FILENO, …)"
        tone={state(1, [1, 2])}
        note={
          <>
            <Fade on={step >= 1} className="bp-n">
              suspenderet af kernen, til data er klar
            </Fade>
          </>
        }
      >
        <Bar from={0} to={DATA} on={step >= 1} className="bp-sleep" />
        <Fade on={step >= 2} className="bp-ret" style={{ left: `${DATA}%` }} />
        <Fade on={step >= 2} className="bp-out" style={{ left: `${DATA}%` }}>
          <Tag tone="focus">bytes</Tag>
        </Fade>
      </Lane>

      <Lane
        name="Non-blocking"
        call="O_NONBLOCK"
        tone={state(3, [3])}
        note={
          <>
            <Fade on={step >= 3} className="bp-n">
              <code>-1</code> og <code>errno == EAGAIN</code>, igen og igen
            </Fade>
          </>
        }
      >
        {SPINS.map((x, i) => (
          <Fade key={x} on={step >= 3} delay={i * 0.06} className="bp-spin" style={{ left: `${x}%` }} />
        ))}
        <Fade on={step >= 3} delay={0.6} className="bp-ret" style={{ left: `${DATA}%` }} />
        <Fade on={step >= 3} delay={0.6} className="bp-out" style={{ left: `${DATA}%` }}>
          <Tag tone="focus">bytes</Tag>
        </Fade>
      </Lane>

      <Lane
        name="poll()"
        call="POLL_TIMEOUT_MS"
        tone={state(4, [4, 5])}
        note={
          <>
            <Fade on={step >= 4} className="bp-n">
              sover højst timeouten og kaldes igen; <code>read()</code> først når <code>revents &amp; POLLIN</code>
            </Fade>
          </>
        }
      >
        {POLLS.slice(0, -1).map(([a, b], i) => (
          <Bar key={a} from={a} to={b} on={step >= 4} delay={i * 0.12} className="bp-poll" />
        ))}
        <Bar from={POLLS[4][0]} to={POLLS[4][1]} on={step >= 5} className="bp-poll bp-poll-last" />
        <Fade on={step >= 5} delay={0.4} className="bp-ret" style={{ left: `${DATA}%` }} />
        <Fade on={step >= 5} delay={0.4} className="bp-out" style={{ left: `${DATA}%` }}>
          <Tag tone="focus">POLLIN</Tag>
        </Fade>
      </Lane>

      <div className="bp-legend vcaps">
        <span>
          <i className="bp-key bp-sleep" /> tråden venter
        </span>
        <span>
          <i className="bp-key bp-key-spin" /> kald der returnerer straks
        </span>
        <span>
          <i className="bp-key bp-key-ret" /> <code>read()</code> får data
        </span>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'blocking-poll',
  title: 'Tre måder at vente på input',
  steps: [
    {
      caption:
        'Samme læsning fra `stdin` tre gange. Data er først klar ved den stiplede linje. Tidsaksen er skematisk.',
      hold: 2200,
    },
    {
      caption:
        'Alle descriptors starter i **blocking mode**: `read()` venter, og kernen suspenderer processen. Tråden kan intet andet imens.',
      hold: 2600,
    },
    {
      caption: 'Mindst én byte er klar, `read()` returnerer, og programmet skriver `read() completed!`.',
      hold: 1800,
    },
    {
      caption:
        'Med `O_NONBLOCK` (sat med `fcntl(…, F_SETFL, flags | O_NONBLOCK)`) returnerer `read()` straks: `-1` og `EAGAIN`. En løkke, der prøver igen, spinner og bruger CPU (eksempel).',
      hold: 3200,
    },
    {
      caption:
        '`poll()` med `events = POLLIN` sover højst timeouten — `POLL_TIMEOUT_MS` er 1 ms i `noblkio_edge.cpp` — og vender tilbage uden `POLLIN`. Løkken kan lave andet og kalde igen.',
      hold: 3200,
    },
    {
      caption: 'Er der data, sætter kernen `POLLIN` i `revents`. Først da kaldes `read()`, og den blokerer ikke.',
      hold: 2400,
    },
    {
      caption:
        'Blocking er enkelt, men låser tråden. Non-blocking uden `poll()` spinner. `poll()` med timeout ligger imellem: tråden sover, men aldrig længere end timeouten.',
      hold: 3200,
    },
  ],
  Component: BlockingPoll,
}

export default viz
