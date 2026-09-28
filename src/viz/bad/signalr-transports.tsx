import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Node, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './signalr-transports.css'

/* SignalR.pdf s. 4–9: tre baner over samme tidsakse (klient øverst, server
   nederst). Data bliver klar på serveren ved X; banerne viser hvornår klienten
   ser det. SVG'en tegnes i pladens faktiske pixelbredde, så tekst og pilespidser
   har samme størrelse ved 320 px og ved fuld bredde. */

const H = 96
const YC = 26 // klientlinjen
const YS = 74 // serverlinjen
const PAD = 46 // plads til "klient"/"server"
const X = 64 // data klar (tid 0–100)
type Kind = 'poll' | 'long' | 'ws'
type Mark = 'idle' | 'muted' | 'focus'

function useWidth() {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(520)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    setW(el.clientWidth)
    const ro = new ResizeObserver(([e]) => setW(e.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])
  return [ref, w] as const
}

function Arrow({ a, b, show, tone = 'idle', delay = 0 }: { a: [number, number]; b: [number, number]; show: boolean; tone?: Mark; delay?: number }) {
  const ang = Math.atan2(b[1] - a[1], b[0] - a[0])
  const head = [-0.45, 0.45].map((d) => `${b[0] - 7 * Math.cos(ang + d)},${b[1] - 7 * Math.sin(ang + d)}`).join(' ')
  return (
    <g className="sgr-mark" data-tone={tone}>
      <motion.path
        d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`}
        initial={false}
        animate={{ pathLength: show ? 1 : 0, opacity: show ? 1 : 0 }}
        transition={show ? { ...t.travel, duration: 0.55, delay } : t.fade}
      />
      <motion.polygon points={`${b[0]},${b[1]} ${head}`} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={show ? { ...t.fade, delay: delay + 0.45 } : t.fade} />
    </g>
  )
}

function Label({ x, y, show, children, tone = 'idle', anchor = 'start', delay = 0 }: { x: number; y: number; show: boolean; children: ReactNode; tone?: Mark; anchor?: 'start' | 'middle' | 'end'; delay?: number }) {
  return (
    <motion.text className="sgr-label" data-tone={tone} x={x} y={y} textAnchor={anchor} initial={false} animate={{ opacity: show ? 1 : 0 }} transition={show ? { ...t.fade, delay } : t.fade}>
      {children}
    </motion.text>
  )
}

function Lane({ kind, step }: { kind: Kind; step: number }) {
  const [ref, w] = useWidth()
  const x = (tt: number) => PAD + (tt / 100) * (w - PAD - 4)
  const MID = (YC + YS) / 2 + 4
  const on = at(step, kind === 'poll' ? 1 : kind === 'long' ? 2 : 3)
  const data = at(step, 4)
  const up = (t0: number, t1: number): [[number, number], [number, number]] => [[x(t0), YS], [x(t1), YC]]
  const down = (t0: number, t1: number): [[number, number], [number, number]] => [[x(t0), YC], [x(t1), YS]]

  let body: ReactNode = null
  if (kind === 'poll') {
    const polls = [4, 28, 52, 76]
    body = (
      <>
        {polls.map((p, i) => {
          const last = i === polls.length - 1
          const show = last ? data : on
          const [ra, rb] = down(p, p + 3)
          const [sa, sb] = up(p + 4, p + 7)
          const d = last ? 1.1 : i * 0.35
          return (
            <g key={p}>
              <Arrow a={ra} b={rb} show={show} delay={d} tone={last ? 'idle' : 'muted'} />
              <Arrow a={sa} b={sb} show={show} delay={d + 0.3} tone={last ? 'focus' : 'muted'} />
              <Label x={x(p + 6) + 4} y={MID} show={show} tone={last ? 'focus' : 'muted'} delay={d + 0.5}>
                {last ? 'Data' : 'Nej'}
              </Label>
            </g>
          )
        })}
        <Label x={x(5.5) - 5} y={MID} anchor="end" show={on}>
          Data?
        </Label>
        <motion.g className="sgr-mark" data-tone="focus" initial={false} animate={{ opacity: data ? 1 : 0 }} transition={data ? { ...t.fade, delay: 1.6 } : t.fade}>
          <path d={`M${x(X)},${YC - 12} v5 M${x(X)},${YC - 9.5} H${x(83)} M${x(83)},${YC - 12} v5`} />
        </motion.g>
        <Label x={(x(X) + x(83)) / 2} y={YC - 15} anchor="middle" tone="focus" show={data} delay={1.6}>
          forsinkelse
        </Label>
      </>
    )
  } else if (kind === 'long') {
    const [ra, rb] = down(4, 7)
    const [sa, sb] = up(X, X + 3)
    const [ra2, rb2] = down(X + 5, X + 8)
    body = (
      <>
        <Arrow a={ra} b={rb} show={on} />
        <motion.line className="sgr-hold" x1={x(7)} y1={YS} y2={YS} initial={false} animate={{ x2: data ? x(X) : x(55), opacity: on ? 1 : 0 }} transition={t.settle} />
        <Label x={(x(7) + x(55)) / 2} y={YS - 8} anchor="middle" show={on}>
          holdes åben
        </Label>
        <Arrow a={sa} b={sb} show={data} delay={0.3} tone="focus" />
        <Label x={x(X + 3)} y={YC - 7} anchor="middle" show={data} tone="focus" delay={0.6}>
          Data
        </Label>
        <Arrow a={ra2} b={rb2} show={data} delay={0.8} />
        <motion.line className="sgr-hold" data-tone="muted" x1={x(X + 8)} x2={x(100)} y1={YS} y2={YS} initial={false} animate={{ opacity: data ? 1 : 0 }} transition={data ? { ...t.fade, delay: 1.2 } : t.fade} />
      </>
    )
  } else {
    const [ha, hb] = down(4, 6)
    const [ka, kb] = up(7, 9)
    const [sa, sb] = down(26, 28)
    const [pa, pb] = up(X, X + 1.5)
    body = (
      <>
        <motion.rect className="sgr-band" x={x(10)} y={YC} width={Math.max(0, x(100) - x(10))} height={YS - YC} initial={false} animate={{ opacity: on ? 1 : 0 }} transition={on ? { ...t.fade, delay: 0.7 } : t.fade} />
        <Arrow a={ha} b={hb} show={on} />
        <Arrow a={ka} b={kb} show={on} delay={0.3} />
        <Label x={x(4)} y={YC - 8} show={on} delay={0.3}>
          handshake
        </Label>
        <Label x={x(100)} y={YC - 8} anchor="end" show={on} delay={0.7}>
          åben forbindelse
        </Label>
        <Arrow a={sa} b={sb} show={on} delay={1} />
        <Label x={x(27) + 5} y={MID} show={on} delay={1.3}>
          send
        </Label>
        <Arrow a={pa} b={pb} show={data} delay={0.2} tone="focus" />
        <Label x={x(X) - 5} y={MID} anchor="end" show={data} tone="focus" delay={0.5}>
          push
        </Label>
      </>
    )
  }

  return (
    <div className="sgr-track" ref={ref}>
      <svg width={w} height={H} viewBox={`0 0 ${w} ${H}`} role="img" aria-label={LANES[kind].name}>
        <text className="sgr-axis" x={PAD - 8} y={YC + 4} textAnchor="end">
          klient
        </text>
        <text className="sgr-axis" x={PAD - 8} y={YS + 4} textAnchor="end">
          server
        </text>
        <line className="sgr-line" x1={PAD} x2={w - 2} y1={YC} y2={YC} />
        <line className="sgr-line" x1={PAD} x2={w - 2} y1={YS} y2={YS} />
        <motion.g className="sgr-x" initial={false} animate={{ opacity: data ? 1 : 0 }} transition={t.fade}>
          <line x1={x(X)} x2={x(X)} y1={YS - 12} y2={YS + 8} />
          <text x={x(X) - 4} y={H - 3} textAnchor="end">
            X: data klar
          </text>
        </motion.g>
        {body}
      </svg>
    </div>
  )
}

const LANES: Record<Kind, { name: string; pro: string; con: string }> = {
  poll: { name: 'Periodic polling', pro: 'virker i alle browsere', con: 'forsinkelse, flere forbindelser, båndbredde, belastning af serveren' },
  long: { name: 'Long polling', pro: 'virker i alle browsere, mindre overhead end polling', con: 'binder tråde og forbindelser; nye forbindelser løbende' },
  ws: { name: 'WebSockets', pro: 'ægte tovejskommunikation (fuld dupleks)', con: 'begrænset understøttelse i ældre browsere' },
}

function Transports({ step }: { step: number }) {
  return (
    <div className="sgr">
      <span className="vcaps sgr-time">tid →</span>
      {(['poll', 'long', 'ws'] as Kind[]).map((k, i) => (
        <div key={k} className="sgr-lane" data-now={step === i + 1 || undefined}>
          <div className="sgr-name">{LANES[k].name}</div>
          <Lane kind={k} step={step} />
          <motion.div className="sgr-pc" initial={false} animate={{ opacity: at(step, 5) ? 1 : 0 }} transition={at(step, 5) ? { ...t.settle, delay: i * 0.12 } : t.fade}>
            <span>+ {LANES[k].pro}</span>
            <span>− {LANES[k].con}</span>
          </motion.div>
        </div>
      ))}
      <Node className="sgr-signalr" tone={step === 6 ? 'focus' : 'ghost'} show={at(step, 6)}>
        <span className="sgr-sr-name">SignalR vælger selv:</span>
        <span className="sgr-order">
          <code>WebSockets</code> → <code>Server-Sent Events</code> → <code>Long Polling</code>
        </span>
      </Node>
    </div>
  )
}

const viz: VizDef = {
  id: 'signalr-transports',
  title: 'Polling, long polling og WebSockets',
  steps: [
    { caption: 'Tre måder at lave realtid på nettet. Hver bane er en klient og en server over den samme tidsakse.', hold: 2000 },
    { caption: '**Periodic polling**: klienten spørger med fast interval — “Data?” — og får for det meste “Nej”.', hold: 2400 },
    { caption: '**Long polling**: klienten spørger, og serveren **holder svaret tilbage**, indtil der er data.', hold: 2400 },
    { caption: '**WebSockets**: efter et handshake står forbindelsen åben. Begge parter kan sende når som helst — fuld dupleks.', hold: 2600 },
    {
      caption: 'Data bliver klar på serveren ved **X**. WebSocket skubber det straks, long polling svarer straks og spørger igen, men polling ser det først ved næste forespørgsel.',
      hold: 3200,
    },
    { caption: 'Fordele og ulemper fra slides: polling er simpel men spilder, long polling binder serveren, WebSockets kræver nyere browsere.', hold: 3000 },
    { caption: 'SignalR abstraherer over transporterne og forhandler selv den bedste: først WebSockets, så Server-Sent Events, så long polling.', hold: 3000 },
  ],
  Component: Transports,
}

export default viz
