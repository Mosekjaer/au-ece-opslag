import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import { t } from './motion'
import type { Tone } from './primitives'
import './algo.css'

/* Primitiver til algoritmer og datastrukturer (DOA, genbrugelige i SYS m.fl.):
   ArrayRow – celler med indeks og pointer-markører (lo/mid/hi, i/j, front/back)
   Graph    – knuder og kanter i SVG (grafer, træer, heaps); positioner tweener,
              så en rotation eller et bytte kan ses
   layoutTree – placerer et binært træ (in-order → x, dybde → y) til Graph
   CellGrid – gitter af celler (pathfinding, DP-tabeller)
   Samme toner som resten af kittet: idle | focus | muted | ok | neg | ghost. */

// ------------------------------------------------------------------ ArrayRow

export interface ArrayPointer {
  /** Stabilt id; markøren glider mellem celler, når `at` skifter. */
  id: string
  /** Celleindeks (0-baseret i `values`). Negativ = skjult, men rækken er reserveret. */
  at: number
  label: ReactNode
  tone?: Tone
  side?: 'top' | 'bottom'
}

export function ArrayRow({
  id,
  values,
  keys,
  tones,
  index = 0,
  pointers = [],
  label,
  className,
}: {
  /** Unikt inden for figuren; bruges til layoutId. */
  id: string
  values: ReactNode[]
  /** Stabile nøgler pr. værdi. Med nøgler glider værdierne til nye pladser (swap, flyt). */
  keys?: string[]
  /** Tone pr. celle (indeks → tone) eller en funktion af indekset. */
  tones?: Record<number, Tone> | ((i: number) => Tone | undefined)
  /** Første indeks der skrives under cellerne; `false` = ingen indeks. */
  index?: number | false
  pointers?: ArrayPointer[]
  label?: ReactNode
  className?: string
}) {
  const tone = (i: number): Tone => (typeof tones === 'function' ? tones(i) : tones?.[i]) ?? 'idle'
  const hasTop = pointers.some((p) => (p.side ?? 'top') === 'top')
  const hasBottom = pointers.some((p) => p.side === 'bottom')
  const at = (i: number, side: 'top' | 'bottom') =>
    pointers.filter((p) => (p.side ?? 'top') === side && p.at === i)

  const ptrSlot = (i: number, side: 'top' | 'bottom') => (
    <div className={`varr-ptrs is-${side}`}>
      {at(i, side).map((p) => (
        <motion.span
          key={p.id}
          layoutId={`${id}-p-${p.id}`}
          layout="position"
          className="varr-ptr"
          data-tone={p.tone ?? 'focus'}
          transition={t.travel}
        >
          {side === 'top' ? (
            <>
              {p.label}
              <i aria-hidden="true">↓</i>
            </>
          ) : (
            <>
              <i aria-hidden="true">↑</i>
              {p.label}
            </>
          )}
        </motion.span>
      ))}
    </div>
  )

  return (
    <div className={`varr ${className ?? ''}`}>
      {label !== undefined && <div className="varr-label">{label}</div>}
      <div className="varr-scroll">
        <div className="varr-grid" style={{ gridTemplateColumns: `repeat(${values.length}, minmax(1.85rem, 2.6rem))` }}>
          {values.map((v, i) => (
            <div className="varr-col" key={i}>
              {hasTop && ptrSlot(i, 'top')}
              <div className="varr-cell" data-tone={tone(i)}>
                {keys ? (
                  <motion.span key={keys[i]} layoutId={`${id}-v-${keys[i]}`} layout="position" transition={t.travel}>
                    {v}
                  </motion.span>
                ) : (
                  <span>{v}</span>
                )}
              </div>
              {index !== false && <div className="varr-idx">{index + i}</div>}
              {hasBottom && ptrSlot(i, 'bottom')}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// --------------------------------------------------------------------- Graph

export interface GNode {
  id: string
  label: ReactNode
  x: number
  y: number
  tone?: Tone
  show?: boolean
  /** Lille annotation over knuden (fx afstand i Dijkstra, balance i AVL). */
  badge?: ReactNode
  badgeTone?: Tone
  /** Hvor badge står: over (standard), under, til venstre eller højre. */
  badgeAt?: 'n' | 's' | 'w' | 'e'
}

export interface GEdge {
  from: string
  to: string
  /** Vægt/label ved kantens midte. */
  w?: ReactNode
  tone?: Tone
  show?: boolean
  directed?: boolean
  /** Forskyd vægt-labelen vinkelret på kanten (viewBox-enheder). */
  wOffset?: number
}

const AH = 8 // pilespids

export function Graph({
  nodes,
  edges,
  width,
  height,
  r = 15,
  directed = false,
  className,
  maxScale = 1.2,
  children,
}: {
  nodes: GNode[]
  edges: GEdge[]
  /** viewBox-bredde. Tekst er 13 enheder høj; hold bredden ≤ ca. 340, så den er ≥ 11 px på 375. */
  width: number
  height: number
  r?: number
  directed?: boolean
  className?: string
  /** Maks. visningsskala i forhold til viewBox (standard 1.2), så tekst ikke bliver kæmpestor på brede skærme. */
  maxScale?: number
  /** Ekstra SVG-indhold (tegnes øverst). */
  children?: ReactNode
}) {
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]))
  return (
    <svg
      className={`vgraph ${className ?? ''}`}
      viewBox={`0 0 ${width} ${height}`}
      style={{ maxWidth: `${Math.round(width * maxScale)}px` }}
      aria-hidden="true"
    >
      {edges.map((e) => {
        const a = byId[e.from]
        const b = byId[e.to]
        if (!a || !b) return null
        const on = (e.show ?? true) && (a.show ?? true) && (b.show ?? true)
        const dx = b.x - a.x
        const dy = b.y - a.y
        const len = Math.hypot(dx, dy) || 1
        const ux = dx / len
        const uy = dy / len
        const arrow = e.directed ?? directed
        const x1 = a.x + ux * r
        const y1 = a.y + uy * r
        const x2 = b.x - ux * (r + (arrow ? AH - 1 : 0))
        const y2 = b.y - uy * (r + (arrow ? AH - 1 : 0))
        const tipX = b.x - ux * r
        const tipY = b.y - uy * r
        const head = `M${tipX} ${tipY} L${x2 - uy * 4.2} ${y2 + ux * 4.2} L${x2 + uy * 4.2} ${y2 - ux * 4.2} Z`
        const off = e.wOffset ?? 0
        const mx = (a.x + b.x) / 2 - uy * off
        const my = (a.y + b.y) / 2 + ux * off
        return (
          <motion.g
            key={`${e.from}-${e.to}`}
            className="vg-edge"
            data-tone={e.tone ?? 'idle'}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? t.settle : t.fade}
          >
            <motion.line initial={false} animate={{ x1, y1, x2, y2 }} transition={t.travel} className="vg-line" />
            {arrow && <motion.path initial={false} animate={{ d: head }} transition={t.travel} className="vg-head" />}
            {e.w !== undefined && (
              <motion.text
                initial={false}
                animate={{ x: mx, y: my }}
                transition={t.travel}
                className="vg-w"
                textAnchor="middle"
                dominantBaseline="central"
              >
                {e.w}
              </motion.text>
            )}
          </motion.g>
        )
      })}
      {nodes.map((n) => {
        const on = n.show ?? true
        const ba = n.badgeAt ?? 'n'
        const bx = ba === 'e' ? r + 4 : ba === 'w' ? -r - 4 : 0
        const by = ba === 'n' ? -r - 7 : ba === 's' ? r + 12 : 0
        return (
          <motion.g
            key={n.id}
            className="vg-node"
            data-tone={n.tone ?? 'idle'}
            initial={false}
            animate={{ x: n.x, y: n.y, opacity: on ? 1 : 0 }}
            transition={{ x: t.travel, y: t.travel, opacity: on ? t.settle : t.fade }}
          >
            <circle r={r} className="vg-circle" />
            <text className="vg-label" textAnchor="middle" dominantBaseline="central">
              {n.label}
            </text>
            {n.badge !== undefined && (
              <text
                className="vg-badge"
                data-tone={n.badgeTone ?? 'focus'}
                x={bx}
                y={by}
                textAnchor={ba === 'e' ? 'start' : ba === 'w' ? 'end' : 'middle'}
                dominantBaseline="central"
              >
                {n.badge}
              </text>
            )}
          </motion.g>
        )
      })}
      {children}
    </svg>
  )
}

// ---------------------------------------------------------------- layoutTree

export interface TreeIn {
  id: string
  label?: ReactNode
  tone?: Tone
  badge?: ReactNode
  badgeTone?: Tone
  l?: TreeIn | null
  r?: TreeIn | null
}

/** Placerer et binært træ: x efter in-order-rang, y efter dybde. Id’erne er stabile,
    så to layouts af samme knuder (før/efter en rotation) tweener pænt i Graph. */
export function layoutTree(
  root: TreeIn | null,
  { dx = 34, dy = 50, pad = 22, slots }: { dx?: number; dy?: number; pad?: number; slots?: number } = {},
): { nodes: GNode[]; edges: GEdge[]; width: number; height: number } {
  const nodes: GNode[] = []
  const edges: GEdge[] = []
  let rank = 0
  let depth = 0
  const walk = (n: TreeIn | null | undefined, d: number) => {
    if (!n) return
    walk(n.l, d + 1)
    nodes.push({ id: n.id, label: n.label ?? n.id, x: pad + rank * dx, y: pad + d * dy, tone: n.tone, badge: n.badge, badgeTone: n.badgeTone })
    rank++
    depth = Math.max(depth, d)
    walk(n.r, d + 1)
    if (n.l) edges.push({ from: n.id, to: n.l.id })
    if (n.r) edges.push({ from: n.id, to: n.r.id })
  }
  walk(root, 0)
  const cols = Math.max(slots ?? 0, rank)
  const width = pad * 2 + Math.max(0, cols - 1) * dx
  // Centrér, hvis `slots` reserverer mere plads end træet bruger.
  const shift = ((cols - rank) * dx) / 2
  nodes.forEach((n) => (n.x += shift))
  return { nodes, edges, width, height: pad * 2 + depth * dy }
}

// ------------------------------------------------------------------ CellGrid

export interface GridCell {
  label?: ReactNode
  tone?: Tone
  /** Mur/forhindring. */
  wall?: boolean
}

export function CellGrid({
  rows,
  cols,
  cell,
  rowHead,
  colHead,
  size = '2.1rem',
  className,
}: {
  rows: number
  cols: number
  cell: (r: number, c: number) => GridCell
  rowHead?: (r: number) => ReactNode
  colHead?: (c: number) => ReactNode
  /** Maks. cellebredde; cellerne krymper på smalle skærme. */
  size?: string
  className?: string
}) {
  const withRow = rowHead !== undefined
  return (
    <div className={`vgrid-scroll ${className ?? ''}`}>
      <div
        className="vgrid"
        style={{ gridTemplateColumns: `${withRow ? 'auto ' : ''}repeat(${cols}, minmax(1.5rem, ${size}))` }}
      >
        {colHead && (
          <>
            {withRow && <span />}
            {Array.from({ length: cols }, (_, c) => (
              <span key={`h${c}`} className="vgrid-head">
                {colHead(c)}
              </span>
            ))}
          </>
        )}
        {Array.from({ length: rows }, (_, r) => (
          <div key={r} className="vgrid-row">
            {withRow && <span className="vgrid-head is-row">{rowHead(r)}</span>}
            {Array.from({ length: cols }, (_, c) => {
              const x = cell(r, c)
              return (
                <span key={c} className="vgrid-cell" data-tone={x.tone ?? 'idle'} data-wall={x.wall || undefined}>
                  {x.label}
                </span>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
