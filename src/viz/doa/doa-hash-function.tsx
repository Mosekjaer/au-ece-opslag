import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './doa-hash-function.css'

/* Lecture04.pdf s. 17 (“All possible keys” → Hash Function → “All possible indexes”
   0 … 4294967295 → “Resizing” to M → 0 … M-1; pilene: John Smith → 1, Lisa Smith → 0,
   Sam Doe → 4294967295, Sandra Dee → 2; 0 → M-1, 1 → 2, 2 → 0, 4294967295 → 2;
   hashFunction = tegnsum, hashToArray = hashFunction(key) % M), s. 25 (Menti: “Where can
   collisions occur?”, samme figur) og s. 20 (hashVal = 37 * hashVal + ch; Weiss fig. 5.4).
   Indhold: src/content/doa/p3-hashing.ts (hashtabeller). */

// ------------------------------------------------------------ geometri (viewBox 312 × 162)
const W = 312
const H = 162
const Y0 = 32
const PITCH = 28
const BH = 22
const rowY = (r: number) => Y0 + r * PITCH

const COL = {
  key: { x: 0, w: 76 },
  val: { x: 128, w: 84 },
  idx: { x: 256, w: 56 },
}
const FN = {
  hash: { x: 84, w: 36, label: 'hash' },
  mod: { x: 218, w: 32, label: '% M' },
}

const KEYS = ['John Smith', 'Lisa Smith', 'Sam Doe', 'Sandra Dee', '…']
const VALS = ['0', '1', '2', '…', '4294967295']
const IDXS = ['0', '1', '2', '…', 'M−1']

interface Arrow {
  id: string
  from: number
  to: number
  stage: 'hash' | 'mod'
  at: number
  neg?: number
  dashed?: boolean
}

const ARROWS: Arrow[] = [
  { id: 'k0', from: 0, to: 1, stage: 'hash', at: 1, neg: 3 },
  { id: 'k1', from: 1, to: 0, stage: 'hash', at: 1 },
  { id: 'k2', from: 2, to: 4, stage: 'hash', at: 1, neg: 3 },
  { id: 'k3', from: 3, to: 2, stage: 'hash', at: 1 },
  { id: 'kx', from: 4, to: 1, stage: 'hash', at: 4, neg: 4, dashed: true },
  { id: 'v0', from: 0, to: 4, stage: 'mod', at: 2 },
  { id: 'v1', from: 1, to: 2, stage: 'mod', at: 2, neg: 3 },
  { id: 'v2', from: 2, to: 0, stage: 'mod', at: 2 },
  { id: 'v4', from: 4, to: 2, stage: 'mod', at: 2, neg: 3 },
]

const AH = 6
function arrowPath(a: Arrow) {
  const [c1, c2] = a.stage === 'hash' ? [COL.key, COL.val] : [COL.val, COL.idx]
  const x1 = c1.x + c1.w + 1
  const y1 = rowY(a.from) + BH / 2
  const x2 = c2.x - 1
  const y2 = rowY(a.to) + BH / 2
  const len = Math.hypot(x2 - x1, y2 - y1)
  const ux = (x2 - x1) / len
  const uy = (y2 - y1) / len
  const bx = x2 - ux * AH
  const by = y2 - uy * AH
  return {
    line: `M${x1} ${y1} L${bx} ${by}`,
    head: `M${x2} ${y2} L${bx - uy * 3.4} ${by + ux * 3.4} L${bx + uy * 3.4} ${by - ux * 3.4} Z`,
  }
}

function Pipeline({ step }: { step: number }) {
  const cellTone = (col: 'key' | 'val' | 'idx', r: number) => {
    if (col === 'idx' && r === 2 && step >= 3) return 'neg'
    if (col === 'key' && step === 3 && (r === 0 || r === 2)) return 'neg'
    if (col === 'val' && step === 3 && (r === 1 || r === 4)) return 'focus'
    if (col === 'key' && step === 4 && r === 4) return 'neg'
    if (col === 'val' && step >= 4 && r === 1) return 'neg'
    if (col === 'key' && step === 1) return 'focus'
    if (col === 'idx' && step === 2 && r !== 1 && r !== 3) return 'focus'
    return 'idle'
  }
  const cells = (col: 'key' | 'val' | 'idx', items: string[], mono: boolean) =>
    items.map((s, r) => {
      const c = COL[col]
      return (
        <g key={`${col}${r}`} className="dhf-cell" data-tone={cellTone(col, r)} data-dim={s === '…' || undefined}>
          <rect x={c.x} y={rowY(r)} width={c.w} height={BH} rx={3} className="dhf-box" />
          <text
            x={c.x + c.w / 2}
            y={rowY(r) + BH / 2 + 0.5}
            textAnchor="middle"
            dominantBaseline="central"
            className={mono ? 'dhf-t is-mono' : 'dhf-t'}
          >
            {s}
          </text>
        </g>
      )
    })

  return (
    <svg className="dhf-svg" viewBox={`0 0 ${W} ${H}`} style={{ maxWidth: `${Math.round(W * 1.2)}px` }} aria-hidden="true">
      {/* Kolonneoverskrifter */}
      <text x={COL.key.x + COL.key.w / 2} y={10} textAnchor="middle" dominantBaseline="central" className="dhf-head">
        nøgler
      </text>
      <text x={COL.val.x + COL.val.w / 2} y={10} textAnchor="middle" dominantBaseline="central" className="dhf-head">
        hashværdier
      </text>
      <text x={COL.idx.x + COL.idx.w / 2} y={10} textAnchor="middle" dominantBaseline="central" className="dhf-head">
        indeks
      </text>

      {/* De to afbildninger */}
      {(['hash', 'mod'] as const).map((k) => {
        const f = FN[k]
        const on = k === 'hash' ? step === 1 || step === 5 : step === 2
        return (
          <g key={k} className="dhf-fn" data-on={on || undefined}>
            <rect x={f.x} y={Y0 - 4} width={f.w} height={4 * PITCH + BH + 8} rx={4} className="dhf-fn-box" />
            <text x={f.x + f.w / 2} y={10} textAnchor="middle" dominantBaseline="central" className="dhf-fn-t">
              {f.label}
            </text>
          </g>
        )
      })}

      {ARROWS.map((a) => {
        const on = step >= a.at
        const tone = a.neg !== undefined && step >= a.neg ? 'neg' : 'idle'
        const { line, head } = arrowPath(a)
        return (
          <motion.g
            key={a.id}
            className="dhf-arrow"
            data-tone={tone}
            data-dashed={a.dashed || undefined}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={on ? t.settle : t.fade}
          >
            <motion.path
              d={line}
              className="dhf-line"
              initial={false}
              animate={{ pathLength: on ? 1 : 0 }}
              transition={on ? { ...t.travel, duration: 0.6 } : t.fade}
            />
            <motion.path
              d={head}
              className="dhf-ahead"
              initial={false}
              animate={{ opacity: on ? 1 : 0 }}
              transition={on ? { ...t.fade, delay: 0.5 } : t.fade}
            />
          </motion.g>
        )
      })}

      {cells('key', KEYS, false)}
      {cells('val', VALS, true)}
      {cells('idx', IDXS, true)}
    </svg>
  )
}

const SUM: ReactNode = (
  <>
    unsigned int sum = 0;{'\n'}for (char c : key){'\n'}    sum += static_cast&lt;int&gt;(c);{'\n'}return sum;
  </>
)
const HORNER: ReactNode = (
  <>
    unsigned int hashVal = 0;{'\n'}for (char ch : key){'\n'}    hashVal = 37 * hashVal + ch;{'\n'}return hashVal;
  </>
)

function HashFunction({ step }: { step: number }) {
  const horner = step >= 5
  return (
    <div className="dhf">
      <Pipeline step={step} />

      <div className="dhf-code">
        <div className="dhf-snip" data-on={step === 1 || step === 5 || undefined}>
          <span className="dhf-snip-name">
            <code>hashFunction</code>
            <span className="dhf-src">{horner ? 's. 20: Horner med 37' : 's. 17: tegnsum'}</span>
          </span>
          <div className="dhf-swap">
            <motion.pre initial={false} animate={{ opacity: horner ? 0 : 1 }} transition={t.fade} aria-hidden={horner || undefined}>
              {SUM}
            </motion.pre>
            <motion.pre initial={false} animate={{ opacity: horner ? 1 : 0 }} transition={t.fade} aria-hidden={!horner || undefined}>
              {HORNER}
            </motion.pre>
          </div>
        </div>
        <div className="dhf-snip" data-on={step === 2 || undefined}>
          <span className="dhf-snip-name">
            <code>hashToArray</code>
            <span className="dhf-src">s. 17: resizing</span>
          </span>
          <pre>return hashFunction(key) % M;</pre>
        </div>
      </div>

      <div className="dhf-where">
        <span className="vcaps">Hvor kan kollisioner opstå?</span>
        <span className="dhf-tags">
          <Tag show={step >= 3} tone="neg">
            i % M
          </Tag>
          <Tag show={step >= 4} tone="neg">
            i hashfunktionen
          </Tag>
        </span>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'doa-hash-function',
  title: 'Fra nøgle til indeks i to afbildninger',
  steps: [
    {
      caption:
        'Slidets billede af hashing: alle mulige nøgler, alle mulige hashværdier (en `unsigned int`, 0 … 4294967295) og indeks i et array af størrelse M.',
      hold: 2600,
    },
    {
      caption: '**Hashfunktionen** afbilder hver nøgle til en hashværdi. Slidets første bud lægger tegnenes ASCII-værdier sammen.',
      hold: 2400,
    },
    {
      caption: '“Resizing” til M: `hashToArray` returnerer `hashFunction(key) % M`, så hver hashværdi bliver et indeks i `[0, M−1]`.',
      hold: 2600,
    },
    {
      caption:
        'John Smith (1) og Sam Doe (4294967295) lander begge på indeks 2. Hashværdierne er forskellige, men resten er den samme: en **kollision i `% M`**.',
      hold: 3000,
    },
    {
      caption:
        'Der er langt flere mulige nøgler end de 2³² hashværdier, så to nøgler kan også få samme hashværdi: en **kollision i hashfunktionen**.',
      hold: 2600,
    },
    {
      caption:
        'Tegnsummen spreder dårligt. Kurset bruger Horners regel, `hashVal = 37 * hashVal + ch`, der bruger alle tegn. Kollisioner kan stadig ske begge steder.',
      hold: 3000,
    },
  ],
  Component: HashFunction,
}

export default viz
