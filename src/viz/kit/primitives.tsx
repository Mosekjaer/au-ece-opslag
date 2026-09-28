import type { CSSProperties, ReactNode } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { t } from './motion'

/* Visualiseringens ordforråd. Få dele, brugt ens overalt:
   Node   – en komponent, tabel, server, klient …
   Link   – forbindelse mellem to noder; tegnes ind når den bliver relevant
   Token  – noget der rejser (en anmodning, en besked); layoutId flytter det
   VTable – en relation/tabel med nøgler, markeringer og rækker der kommer og går
   Tag    – en kort annotation, fx en statuskode
   Tones: idle (neutral), focus (accent, det der sker nu), muted (trækker sig),
   ok (lykkedes), neg (fejl/afvist), ghost (pladsholder, reserverer plads). */

export type Tone = 'idle' | 'focus' | 'muted' | 'ok' | 'neg' | 'ghost'

const presence = (show: boolean) => ({
  initial: false as const,
  animate: show ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 6, scale: 0.98 },
  transition: show ? t.place : t.fade,
})

export function Node({
  title,
  sub,
  tone = 'idle',
  show = true,
  mono,
  children,
  className,
  style,
}: {
  title?: ReactNode
  sub?: ReactNode
  tone?: Tone
  show?: boolean
  mono?: boolean
  children?: ReactNode
  className?: string
  style?: CSSProperties
}) {
  return (
    <motion.div
      className={`vnode ${className ?? ''}`}
      data-tone={tone}
      style={style}
      aria-hidden={!show || undefined}
      {...presence(show)}
    >
      {title !== undefined && <div className={mono ? 'vnode-title mono' : 'vnode-title'}>{title}</div>}
      {sub !== undefined && <div className="vnode-sub">{sub}</div>}
      {children}
    </motion.div>
  )
}

/** Forbindelse. Vandret i brede figurer, lodret når figuren stables (container query). */
export function Link({
  on,
  label,
  tone = 'idle',
  back,
  vertical,
  className,
}: {
  on: boolean
  label?: ReactNode
  tone?: Tone
  /** Pil peger baglæns (svar). */
  back?: boolean
  /** Altid lodret (nedad; opad med `back`), også uden for `.vflow.stack`. */
  vertical?: boolean
  className?: string
}) {
  return (
    <div className={`vlink ${back ? 'is-back' : ''} ${vertical ? 'is-v' : ''} ${className ?? ''}`} data-tone={tone}>
      <motion.div
        className="vlink-line"
        initial={false}
        animate={{ '--p': on ? 1 : 0 } as never}
        transition={on ? { ...t.travel, duration: 0.55 } : t.fade}
      />
      {label !== undefined && (
        <motion.span className="vlink-label" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade}>
          {label}
        </motion.span>
      )}
    </div>
  )
}

/** Rejsende objekt. Placér det inde i den node der har det lige nu; layoutId klarer turen. */
export function Token({
  id,
  children,
  tone = 'focus',
  launch,
  wrap,
}: {
  id: string
  children: ReactNode
  tone?: Tone
  /** Brug afsæt med tilløb (til den første afsendelse). */
  launch?: boolean
  /** Må brydes over flere linjer (lange labels på smalle skærme). */
  wrap?: boolean
}) {
  return (
    <motion.span
      layoutId={id}
      layout="position"
      className={wrap ? 'vtoken is-wrap' : 'vtoken'}
      data-tone={tone}
      transition={launch ? t.launch : t.travel}
    >
      {children}
    </motion.span>
  )
}

export function Tag({
  show = true,
  tone = 'focus',
  wrap,
  children,
}: {
  show?: boolean
  tone?: Tone
  /** Må brydes over flere linjer. */
  wrap?: boolean
  children: ReactNode
}) {
  return (
    <motion.span
      className={wrap ? 'vtag is-wrap' : 'vtag'}
      data-tone={tone}
      initial={false}
      animate={show ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.85 }}
      transition={show ? t.place : t.fade}
    >
      {children}
    </motion.span>
  )
}

export interface Row {
  key: string
  cells: ReactNode[]
  tone?: Tone
  /** Celle-toner pr. kolonneindeks. */
  cellTone?: Record<number, Tone>
}

export function VTable({
  name,
  cols,
  rows,
  pk = [],
  fk = [],
  colTone = {},
  show = true,
  note,
  compact,
}: {
  name?: ReactNode
  cols: ReactNode[]
  rows: Row[]
  /** Kolonner der er (del af) primærnøglen — understreges. */
  pk?: number[]
  /** Fremmednøglekolonner — kursiveres og markeres. */
  fk?: number[]
  colTone?: Record<number, Tone>
  show?: boolean
  note?: ReactNode
  compact?: boolean
}) {
  return (
    <motion.div className={`vtable ${compact ? 'is-compact' : ''}`} layout="position" {...presence(show)}>
      {name !== undefined && <div className="vtable-name">{name}</div>}
      <table>
        <thead>
          <tr>
            {cols.map((c, i) => (
              <th key={i} data-tone={colTone[i] ?? 'idle'} className={`${pk.includes(i) ? 'is-pk' : ''} ${fk.includes(i) ? 'is-fk' : ''}`}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <AnimatePresence initial={false}>
            {rows.map((r) => (
              <motion.tr
                key={r.key}
                layout="position"
                data-tone={r.tone ?? 'idle'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={t.settle}
              >
                {r.cells.map((c, i) => (
                  <td key={i} data-tone={r.cellTone?.[i] ?? colTone[i] ?? 'idle'}>
                    {c}
                  </td>
                ))}
              </motion.tr>
            ))}
          </AnimatePresence>
        </tbody>
      </table>
      {note !== undefined && <div className="vtable-note">{note}</div>}
    </motion.div>
  )
}

/** Varianter stablet i én grid-celle; kun `show` er synlig. Højden er altid den højeste
    variants, så figuren ikke hopper, når indholdet skifter. */
export function Swap({ show, items, className }: { show: number; items: ReactNode[]; className?: string }) {
  return (
    <div className={`vswap ${className ?? ''}`}>
      {items.map((c, i) => (
        <motion.div
          key={i}
          aria-hidden={i !== show || undefined}
          initial={false}
          animate={{ opacity: i === show ? 1 : 0 }}
          transition={t.fade}
          style={{ pointerEvents: i === show ? undefined : 'none' }}
        >
          {c}
        </motion.div>
      ))}
    </div>
  )
}

/** Hjælper: er vi nået til trin n? */
export const at = (step: number, n: number) => step >= n
