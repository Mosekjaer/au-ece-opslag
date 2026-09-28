import { motion } from 'motion/react'
import { useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { at } from '../kit/primitives'
import { t } from '../kit/motion'
import './gc-mark-compact.css'

/* Garbage Collection.pdf: s. 6 (“Before a Collection”: A–J, roots → A, C, D, F,
   D → H, NextObjPtr efter J), s. 7 (“After a Collection”: A C D F H tæt, NextObjPtr
   efter H), s. 5 (roots: static fields, arguments, local variables, CPU registers;
   alt betragtes som garbage; felter følges rekursivt), s. 8 (compacting: overlevere
   flyttes ned, roots opdateres), s. 4 (alle markeret → OutOfMemoryException) og s. 9
   (generationer: kun nye objekter samles ind). */

const SHY = String.fromCharCode(0xad)

const OBJS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J']
const ROOTED = ['A', 'C', 'D', 'F']
const LIVE = ['A', 'C', 'D', 'F', 'H']
const ROOTS = ['Static fields', 'Arguments', 'Local variables', 'CPU registers']

/** Plads i heapen før og efter compacting. */
const slotOf = (o: string, compact: boolean) => (compact ? LIVE.indexOf(o) : OBJS.indexOf(o))

interface Geo {
  wide: boolean
  w: number
  /** Roots-boksen. */
  rw: number
  rh: number
  /** Heapens venstre kant, antal pladser, pladsbredde. */
  x0: number
  n: number
  cw: number
  /** Cellernes top og bund. */
  top: number
  ch: number
  bot: number
  h: number
}

function geo(w: number): Geo {
  const wide = w > 640
  if (wide) {
    const rw = Math.min(208, w * 0.26)
    const x0 = rw + 36
    const n = 12
    const top = 84
    const ch = 44
    return { wide, w, rw, rh: top + ch, x0, n, cw: (w - x0) / n, top, ch, bot: top + ch, h: top + ch + 58 }
  }
  const rh = 66
  const top = rh + 34
  const ch = 36
  const n = 11
  return { wide, w, rw: w, rh, x0: 0, n, cw: w / n, top, ch, bot: top + ch, h: top + ch + 58 }
}

// Hvor på roots-boksens kant pilen til hvert objekt starter (bred plade).
const ROOT_Y: Record<string, number> = { F: 12, D: 28, C: 44, A: 60 }

function rootPath(g: Geo, o: string, slot: number) {
  const cx = g.x0 + (slot + 0.5) * g.cw
  const tip = g.top - 7
  if (!g.wide) return { line: `M ${cx} ${g.rh + 2} L ${cx} ${tip}`, head: head(cx, g.top - 1, 'down') }
  const y0 = ROOT_Y[o]
  const r = 10
  return {
    line: `M ${g.rw} ${y0} L ${cx - r} ${y0} Q ${cx} ${y0} ${cx} ${y0 + r} L ${cx} ${tip}`,
    head: head(cx, g.top - 1, 'down'),
  }
}

function head(x: number, y: number, dir: 'down' | 'up') {
  const d = dir === 'down' ? -6.5 : 6.5
  return `M ${x - 4} ${y + d} L ${x + 4} ${y + d} L ${x} ${y} Z`
}

function Gc({ step }: { step: number }) {
  const ref = useRef<HTMLDivElement>(null)
  const [w, setW] = useState(720)

  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const measure = () => setW(Math.round(el.getBoundingClientRect().width))
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const g = geo(w)
  const compact = at(step, 5)
  const cx = (o: string) => g.x0 + (slotOf(o, compact) + 0.5) * g.cw

  const objTone = (o: string) => {
    const live = LIVE.includes(o)
    if (step === 0) return 'idle'
    if (!live) return step >= 4 ? 'neg' : 'muted'
    if (o === 'H') return step >= 3 ? 'ok' : 'muted'
    return step >= 2 ? 'ok' : 'muted'
  }
  const markDelay = (o: string) => (step === 2 ? ROOTED.indexOf(o) * 0.35 : step === 3 && o === 'H' ? 0.45 : 0)

  // D → H: bue under rækken.
  const dx = cx('D')
  const hx = cx('H')
  const arc = `M ${dx} ${g.bot + 2} C ${dx} ${g.bot + 26} ${hx} ${g.bot + 26} ${hx} ${g.bot + 8}`
  const arcHead = head(hx, g.bot + 1, 'up')

  // NextObjPtr: lige efter sidste objekt.
  const px = g.x0 + (compact ? LIVE.length : OBJS.length) * g.cw
  const labelX = Math.min(px - 4, g.w - 70)

  const tailX = g.x0 + LIVE.length * g.cw
  const final = at(step, 6)

  return (
    <div className="gcm">
      <div ref={ref} className="gcm-canvas" style={{ height: g.h }} data-wide={g.wide || undefined}>
        <div className="gcm-roots" style={{ width: g.rw, height: g.rh }}>
          <span className="gcm-roots-name">Roots</span>
          <span className="gcm-roots-list">
            {ROOTS.map((r) => (
              <span key={r} className="gcm-root">
                {r}
              </span>
            ))}
          </span>
        </div>

        <span className="gcm-heap-name" style={g.wide ? { right: 0, top: 4 } : { right: 0, top: g.top - 20 }}>
          Managed heap
        </span>

        <svg className="gcm-svg" width={g.w} height={g.h} viewBox={`0 0 ${g.w} ${g.h}`} aria-hidden="true">
          {Array.from({ length: g.n }, (_, i) => (
            <rect key={i} className="gcm-slot" x={g.x0 + i * g.cw + 1} y={g.top} width={g.cw - 2} height={g.ch} rx={3} />
          ))}

          {ROOTED.map((o, i) => {
            const p = rootPath(g, o, slotOf(o, compact))
            const on = at(step, 2)
            const style = { transitionDelay: step === 2 ? `${i * 0.35}s` : '0s' } as CSSProperties
            return (
              <g key={o} className="gcm-arrow" data-on={on || undefined} style={style}>
                <motion.path className="gcm-line" initial={false} animate={{ d: p.line }} transition={t.travel} />
                <motion.path className="gcm-head" initial={false} animate={{ d: p.head }} transition={t.travel} />
              </g>
            )
          })}

          <g className="gcm-arrow" data-on={at(step, 3) || undefined}>
            <motion.path className="gcm-line" initial={false} animate={{ d: arc }} transition={t.travel} />
            <motion.path className="gcm-head" initial={false} animate={{ d: arcHead }} transition={t.travel} />
          </g>

          <g className="gcm-ptr">
            <motion.path
              className="gcm-line"
              initial={false}
              animate={{ d: `M ${px} ${g.bot + 32} L ${px} ${g.bot + 8}` }}
              transition={t.travel}
            />
            <motion.path className="gcm-head" initial={false} animate={{ d: head(px, g.bot + 1, 'up') }} transition={t.travel} />
          </g>

          {/* Overleverne efter compacting. */}
          <motion.g initial={false} animate={{ opacity: final ? 1 : 0 }} transition={final ? t.settle : t.fade}>
            <path
              className="gcm-brace"
              d={`M ${g.x0 + 3} ${g.bot + 30} L ${g.x0 + 3} ${g.bot + 36} L ${tailX - 10} ${g.bot + 36} L ${tailX - 10} ${g.bot + 30}`}
            />
          </motion.g>
        </svg>

        {OBJS.map((o) => {
          const live = LIVE.includes(o)
          const gone = !live && compact
          return (
            <motion.div
              key={o}
              className="gcm-obj"
              data-tone={objTone(o)}
              style={{ top: g.top, width: g.cw - 6, height: g.ch, transitionDelay: `${markDelay(o)}s` }}
              initial={false}
              animate={{ x: g.x0 + slotOf(o, compact && live) * g.cw + 3, opacity: gone ? 0 : 1 }}
              transition={{ x: t.travel, opacity: t.recede }}
            >
              {o}
            </motion.div>
          )
        })}

        <motion.span
          className="gcm-free"
          style={{ left: tailX, width: g.x0 + g.n * g.cw - tailX, top: g.top, height: g.ch }}
          initial={false}
          animate={{ opacity: final ? 1 : 0 }}
          transition={final ? { ...t.settle, delay: 0.2 } : t.fade}
        >
          <span>
            fri: <code>new</code> allokerer her
          </span>
        </motion.span>

        <motion.span
          className="gcm-ptr-label"
          style={{ top: g.bot + 39, left: 0 }}
          initial={false}
          animate={{ x: labelX }}
          transition={t.travel}
        >
          NextObj{SHY}Ptr
        </motion.span>

        <motion.span
          className="gcm-brace-label"
          style={{ top: g.bot + 39, left: g.x0, width: tailX - g.x0 - 6 }}
          initial={false}
          animate={{ opacity: final ? 1 : 0 }}
          transition={final ? t.settle : t.fade}
        >
          overlevere (ældre)
        </motion.span>
      </div>

      <motion.p
        className="gcm-note"
        initial={false}
        animate={{ opacity: final ? 1 : 0 }}
        transition={final ? { ...t.settle, delay: 0.35 } : t.fade}
      >
        Er alle objekter markeret, sker der ingen compacting, og <code>new</code> kaster{' '}
        <code>
          OutOf{SHY}Memory{SHY}Exception
        </code>
        .
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'gc-mark-compact',
  title: 'Mark and compact på den managed heap',
  steps: [
    {
      caption: '`new` har lagt objekterne A–J i enden af heapen. `NextObjPtr` peger på næste ledige plads.',
      hold: 2200,
    },
    { caption: 'En collection starter: alle objekter betragtes som garbage.', hold: 1500 },
    { caption: '**Mark**: objekter, der kan nås fra **roots**, markeres.', hold: 2400 },
    { caption: 'Markerede objekters felter følges rekursivt: D peger på H, så H markeres også.', hold: 2200 },
    { caption: 'B, E, G, I og J kan ikke nås. Deres plads bliver fri.', hold: 2200 },
    {
      caption: '**Compact**: overleverne flyttes ned, roots opdateres, og `NextObjPtr` står efter det sidste objekt.',
      hold: 3000,
    },
    {
      caption:
        'Ingen fragmentering. Med **generationer** gennemgås gamle overlevere ikke igen — kun nye objekter samles ind.',
      hold: 2800,
    },
  ],
  Component: Gc,
}

export default viz
