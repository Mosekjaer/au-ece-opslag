import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './page-translation.css'

/* 10.2-Week_11_-_Memory_management.pdf s. 15–16 (paging mechanism og eksemplet med
   page size = 4 bytes). Virtuel hukommelse a–p (adr. 0–15), page table 0→5, 1→6, 2→1,
   3→2, fysisk hukommelse 32 bytes. Rækkerne for 0 og 3 står på slidet; 6 og 13 er
   slidets øvelse, regnet med slidets egen page table (se emnets huller). */

const SIZE = 4
const LETTERS = 'abcdefghijklmnop'.split('')
const TABLE = [5, 6, 1, 2] // page → frame
const FRAME_OF_PAGE = (p: number) => TABLE[p]
const PAGE_IN_FRAME: Record<number, number> = { 5: 0, 6: 1, 1: 2, 2: 3 }

interface Ex {
  va: number
  from: 'slide' | 'ovelse'
}
const ROWS: Ex[] = [
  { va: 0, from: 'slide' },
  { va: 3, from: 'slide' },
  { va: 6, from: 'ovelse' },
  { va: 13, from: 'ovelse' },
]

const bin2 = (n: number) => n.toString(2).padStart(2, '0')

/** Hvilken adresse der oversættes, og hvor langt vi er nået i oversættelsen. */
function frame(step: number) {
  const va = step >= 5 ? 13 : 6
  // 0: ingen, 1: split, 2: opslag, 3: sammensæt, 4: læs byten
  const phase = step === 0 ? 0 : step >= 5 ? 4 : step
  return { va, phase }
}

function Translate({ step }: { step: number }) {
  const { va, phase } = frame(step)
  const p = Math.floor(va / SIZE)
  const d = va % SIZE
  const f = FRAME_OF_PAGE(p)
  const pa = f * SIZE + d
  const final = step >= 5

  const on = (n: number) => phase >= n
  const vis = (n: number) => ({
    initial: false as const,
    animate: { opacity: on(n) ? 1 : 0, y: on(n) ? 0 : 4 },
    transition: on(n) ? t.settle : t.fade,
  })

  return (
    <div className="spt">
      {/* Adressens vej: [p | d] → page table → [f | d] → f · 4 + d */}
      <div className="spt-path" data-phase={phase}>
        <div className="spt-cell spt-va" data-on={on(1) || undefined}>
          <span className="spt-k">virtuel adresse</span>
          <span className="spt-big mono">{va}</span>
          <span className="spt-bits mono">
            <b data-part="p">{bin2(p)}</b>
            <b data-part="d">{bin2(d)}</b>
          </span>
        </div>

        <span className="spt-arrow" data-on={on(1) || undefined} aria-hidden="true" />

        <motion.div className="spt-cell" {...vis(1)}>
          <span className="spt-k">split</span>
          <span className="spt-eq mono">
            <span data-part="p">p = ⌊{va} / 4⌋ = {p}</span>
            <span data-part="d">d = {va} mod 4 = {d}</span>
          </span>
        </motion.div>

        <span className="spt-arrow" data-on={on(2) || undefined} aria-hidden="true" />

        <motion.div className="spt-cell" {...vis(2)}>
          <span className="spt-k">page table</span>
          <span className="spt-eq mono">
            <span>
              page <span data-part="p">{p}</span> → frame <span data-part="f">{f}</span>
            </span>
          </span>
        </motion.div>

        <span className="spt-arrow" data-on={on(3) || undefined} aria-hidden="true" />

        <motion.div className="spt-cell" {...vis(3)}>
          <span className="spt-k">fysisk adresse</span>
          <span className="spt-eq mono">
            <span>
              <span data-part="f">{f}</span> · 4 + <span data-part="d">{d}</span> = <b>{pa}</b>
            </span>
          </span>
        </motion.div>

        <span className="spt-arrow" data-on={on(4) || undefined} aria-hidden="true" />

        <motion.div className="spt-cell spt-byte" {...vis(4)}>
          <span className="spt-k">byte</span>
          <span className="spt-big mono">{LETTERS[va]}</span>
        </motion.div>
      </div>

      <div className="spt-mem">
        {/* Virtuel hukommelse: 4 pages á 4 bytes */}
        <div className="spt-block spt-virt">
          <span className="vcaps">Virtuel hukommelse</span>
          <div className="spt-grid">
            {[0, 1, 2, 3].map((pg) => (
              <div key={pg} className="spt-row" data-hot={(on(1) && pg === p) || undefined}>
                <span className="spt-lab">
                  <span className="spt-lab-long">page </span>
                  {pg}
                </span>
                {[0, 1, 2, 3].map((o) => {
                  const a = pg * SIZE + o
                  const hit = on(1) && a === va
                  return (
                    <span key={o} className="spt-byte-cell" data-hit={hit || undefined}>
                      <span className="spt-addr">{a}</span>
                      <span className="mono">{LETTERS[a]}</span>
                    </span>
                  )
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Page table */}
        <div className="spt-block spt-tableblock">
          <span className="vcaps">Page table</span>
          <table className="spt-table">
            <thead>
              <tr>
                <th>p</th>
                <th>f</th>
              </tr>
            </thead>
            <tbody>
              {TABLE.map((fr, pg) => (
                <tr key={pg} data-hot={(on(2) && pg === p) || undefined}>
                  <td className="mono">{pg}</td>
                  <td className="mono">{fr}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Fysisk hukommelse: 8 frames á 4 bytes */}
        <div className="spt-block spt-phys">
          <span className="vcaps">Fysisk hukommelse</span>
          <div className="spt-grid">
            {Array.from({ length: 8 }, (_, fr) => {
              const pg = PAGE_IN_FRAME[fr]
              const used = pg !== undefined
              return (
                <div key={fr} className="spt-row" data-hot={(on(3) && fr === f) || undefined} data-empty={!used || undefined}>
                  <span className="spt-lab">
                    <span className="spt-lab-long">frame </span>
                    {fr}
                  </span>
                  {[0, 1, 2, 3].map((o) => {
                    const a = fr * SIZE + o
                    const hit = on(4) && a === pa
                    return (
                      <span key={o} className="spt-byte-cell" data-hit={hit || undefined}>
                        <span className="spt-addr">{a}</span>
                        <span className="mono">{used ? LETTERS[pg * SIZE + o] : ''}</span>
                      </span>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
        {/* Regnearket fra s. 16; 6 og 13 er øvelsen */}
        <table className="spt-sheet">
          <thead>
            <tr>
              <th>va</th>
              <th>p</th>
              <th>d</th>
              <th>f · 4 + d</th>
              <th>byte</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => {
              const rp = Math.floor(r.va / SIZE)
              const rd = r.va % SIZE
              const rf = FRAME_OF_PAGE(rp)
              const shown = r.from === 'slide' || (r.va === 6 ? step >= 4 : final)
              const now = (r.va === 6 && step === 4) || (r.va === 13 && final)
              return (
                <tr key={r.va} data-now={now || undefined}>
                  <td className="mono">{r.va}</td>
                  {[String(rp), String(rd), `${rf} · 4 + ${rd} = ${rf * SIZE + rd}`, `'${LETTERS[r.va]}'`].map((c, i) => (
                    <td key={i} className="mono">
                      <motion.span
                        initial={false}
                        animate={{ opacity: shown ? 1 : 0 }}
                        transition={shown ? t.settle : t.fade}
                      >
                        {c}
                      </motion.span>
                      {!shown && i === 0 && <span className="spt-q">?</span>}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

    </div>
  )
}

const viz: VizDef = {
  id: 'page-translation',
  title: 'En virtuel adresse slås op i page table',
  steps: [
    {
      caption: 'Slidets eksempel: page size = 4 bytes, 16 bytes virtuel og 32 bytes fysisk hukommelse. Rækkerne for 0 og 3 er regnet på slidet; 6 og 13 er øvelsen.',
      hold: 3000,
    },
    {
      caption: 'CPU’en genererer adresse **6**. Den deles i page number `p = ⌊6 / 4⌋ = 1` og offset `d = 6 mod 4 = 2` — i binært de to høje og de to lave bits.',
      hold: 2800,
    },
    { caption: '`p` er indeks i page table: page **1** ligger i frame **6**.', hold: 2200 },
    {
      caption: 'Frame og offset sættes sammen: `6 · 4 + 2 = 26`. Offset’et går **uændret** igennem; kun sidenummeret oversættes.',
      hold: 2600,
    },
    { caption: 'Fysisk adresse 26 rummer `g` — samme byte som virtuel adresse 6.', hold: 2200 },
    {
      caption: 'Samme vej for **13**: page 3, offset 1, frame 2, `2 · 4 + 1 = 9` og byten `n`. Pages ligger ikke i rækkefølge i den fysiske hukommelse.',
      hold: 3200,
    },
  ],
  Component: Translate,
}

export default viz
