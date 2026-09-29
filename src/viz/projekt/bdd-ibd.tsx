import { motion } from 'motion/react'
import type { CSSProperties } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './bdd-ibd.css'

/* Afleveringsopgave B - Pakkeboksen.pdf, s. 2: opgave 1 (blokke og porte, `~` =
   konjugeret, 4 bokse) og opgave 2 (IBD for Pakkeboksen; USB, SPI, Wi-Fi og BOX er
   ikke-atomiske, resten atomiske). Materialet har ingen løsning til IBD’et:
   forbindelserne her følger af porttyperne. Notation fra SysML Structural
   Diagrams 2/3 (ASE-konventionen: ingen in/out/inout og ingen ~ på IBD’et — symbolet
   siger det; konjugeret = skygget symbol; ydre port på rammen). */

type Kind = 'out' | 'in' | 'na' | 'conj'

interface End {
  part: string
  port: string
  kind: Kind
}
interface Conn {
  id: string
  a: End
  b: End
  row: number
  col: 'ext' | 'mid' | 'box'
}

const CONNS: Conn[] = [
  { id: 'net', row: 1, col: 'ext', a: { part: 'Pakkeboksen (ramme)', port: 'net : Wi-Fi', kind: 'na' }, b: { part: 'Computer', port: 'net : Wi-Fi', kind: 'na' } },
  { id: 'disp', row: 1, col: 'mid', a: { part: 'Computer', port: 'disp : HDMI', kind: 'out' }, b: { part: 'Touchskærm', port: 'disp : HDMI', kind: 'in' } },
  { id: 'touch', row: 2, col: 'mid', a: { part: 'Computer', port: 'touch : USB', kind: 'na' }, b: { part: 'Touchskærm', port: 'touch : USB', kind: 'conj' } },
  { id: 'printer', row: 3, col: 'mid', a: { part: 'Computer', port: 'printer : USB', kind: 'na' }, b: { part: 'Printer', port: 'printer : USB', kind: 'conj' } },
  { id: 'spi', row: 4, col: 'mid', a: { part: 'Computer', port: 'controller : SPI', kind: 'na' }, b: { part: 'Boksstyring', port: 'ctrl : SPI', kind: 'conj' } },
  ...[1, 2, 3, 4].map(
    (i): Conn => ({
      id: `lock${i}`,
      row: 3 + i,
      col: 'box',
      a: { part: 'Boksstyring', port: `lock[${i}] : BOX`, kind: 'conj' },
      b: { part: 'Boks', port: 'lock : BOX', kind: 'na' },
    }),
  ),
]

const BDD = [
  { name: 'Computer', ports: ['inout net: Wi-Fi', 'inout printer: USB', 'out disp: HDMI', 'inout controller: SPI', 'inout touch: USB'] },
  { name: 'Touchskærm', ports: ['in disp: HDMI', 'inout touch: ~USB'] },
  { name: 'Printer', ports: ['inout printer: ~USB'] },
  { name: 'Boksstyring', ports: ['inout ctrl: ~SPI', 'inout lock[4]: ~BOX'] },
  { name: 'Boks', ports: ['inout lock: BOX'], mul: '4' },
]

const PARTS = [
  { id: 'computer', name: ': Computer', col: 2, rows: [1, 5] },
  { id: 'touch', name: ': Touchskærm', col: 4, rows: [1, 3] },
  { id: 'printer', name: ': Printer', col: 4, rows: [3, 4] },
  { id: 'ctrl', name: ': Boksstyring', col: 4, rows: [4, 8] },
  ...[1, 2, 3, 4].map((i) => ({ id: `boks${i}`, name: ': Boks', col: 6, rows: [3 + i, 4 + i] })),
]

/* Smal plade: de fire lock-connectors samles i én række. */
const LIST: Conn[] = [
  ...CONNS.slice(0, 5),
  { ...CONNS[5], id: 'locks', a: { ...CONNS[5].a, port: 'lock[1..4] : BOX' }, b: { ...CONNS[5].b, part: 'Boks ×4' } },
]

const COL: Record<Conn['col'], number> = { ext: 1, mid: 3, box: 5 }

/** Portsymbolet. `side` = hvilken side af connectoren porten sidder i. */
function Port({ kind, side, show }: { kind: Kind; side: 'a' | 'b'; show: boolean }) {
  // En atomisk out-port på venstre part peger udad (mod højre); en in-port på højre part peger indad (også mod højre).
  const glyph = kind === 'na' || kind === 'conj' ? '↔' : '→'
  return (
    <motion.span
      className="pib-port"
      data-kind={kind}
      data-side={side}
      initial={false}
      animate={{ opacity: show ? 1 : 0, scale: show ? 1 : 0.7 }}
      transition={show ? t.place : t.fade}
      aria-hidden="true"
    >
      {glyph}
    </motion.span>
  )
}

function highlight(p: string) {
  // Markér ~ og multiplicitet i BDD-teksten.
  const parts = p.split(/(~\w[\w-]*|\[4\])/)
  return parts.map((s, i) => (i % 2 ? <mark key={i}>{s}</mark> : s))
}

function BddPanel({ step }: { step: number }) {
  const marks = step >= 1
  return (
    <div className="pib-frame" data-marks={marks || undefined}>
      <div className="pib-tab">
        <b>bdd</b> Pakkeboksen
      </div>
      <div className="pib-bdd">
        <div className="pib-block is-whole">
          <span className="pib-stereo">«block»</span>
          <span className="pib-name">Pakkeboksen</span>
          <div className="pib-comp">
            <span className="pib-comp-name">ports</span>
            <code>inout net: Wi-Fi</code>
          </div>
        </div>
        <svg className="pib-diamond" viewBox="0 0 14 22" aria-hidden="true">
          <path d="M7 1 L12.5 6 L7 11 L1.5 6 Z" />
          <line x1="7" y1="11" x2="7" y2="22" />
        </svg>
        <span className="pib-consists">◆ består af:</span>
        <ol className="pib-kids">
          {BDD.map((b) => (
            <li key={b.name} className="pib-kid">
              <span className="pib-mul">{b.mul && <Tag tone={marks ? 'focus' : 'idle'}>{b.mul}</Tag>}</span>
              <div className="pib-block">
                <span className="pib-stereo">«block»</span>
                <span className="pib-name">{b.name}</span>
                <div className="pib-comp">
                  <span className="pib-comp-name">ports</span>
                  {b.ports.map((p) => (
                    <code key={p}>{highlight(p)}</code>
                  ))}
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}

function IbdPanel({ step }: { step: number }) {
  const partsOn = step >= 2
  const portsOn = step >= 3
  const linesOn = step >= 4
  const extOn = step >= 5
  return (
    <div className="pib-frame is-ibd">
      <div className="pib-tab">
        <b>ibd</b> Pakkeboksen
      </div>

      {/* Bred plade: et egentligt IBD i et grid. */}
      <div className="pib-grid">
        {PARTS.map((p, i) => (
          <motion.div
            key={p.id}
            className="pib-part"
            style={{ gridColumn: p.col, gridRow: `${p.rows[0]} / ${p.rows[1]}` } as CSSProperties}
            initial={false}
            animate={{ opacity: partsOn ? 1 : 0, y: partsOn ? 0 : 6 }}
            transition={partsOn ? stagger(i, 0.05) : t.fade}
            data-hub={p.id === 'computer' || undefined}
          >
            {p.name}
          </motion.div>
        ))}
        {CONNS.map((c, i) => {
          const isExt = c.col === 'ext'
          const lineOn = isExt ? extOn : linesOn
          const portOn = isExt ? extOn : portsOn
          const now = isExt ? step === 5 : step === 4
          return (
            <div
              key={c.id}
              className="pib-conn"
              data-ext={isExt || undefined}
              data-now={now || undefined}
              style={{ gridColumn: COL[c.col], gridRow: c.row } as CSSProperties}
            >
              <motion.code className="pib-lbl is-a" initial={false} animate={{ opacity: portOn ? 1 : 0 }} transition={t.fade}>
                {c.a.port}
              </motion.code>
              <div className="pib-wire">
                <Port kind={c.a.kind} side="a" show={portOn} />
                <span className="pib-track">
                  <motion.span
                    className="pib-line"
                    initial={false}
                    animate={{ scaleX: lineOn ? 1 : 0 }}
                    transition={lineOn ? { ...t.travel, duration: 0.6, delay: isExt ? 0.1 : i * 0.08 } : t.fade}
                  />
                </span>
                <Port kind={c.b.kind} side="b" show={portOn} />
              </div>
              <motion.code className="pib-lbl is-b" initial={false} animate={{ opacity: portOn ? 1 : 0 }} transition={t.fade}>
                {c.b.port}
              </motion.code>
            </div>
          )
        })}
      </div>

      {/* Smal plade: samme IBD som en liste af connectors. */}
      <div className="pib-list">
        <motion.div className="pib-chips" initial={false} animate={{ opacity: partsOn ? 1 : 0 }} transition={t.fade}>
          <span className="vcaps">parts</span>
          {[': Computer', ': Touchskærm', ': Printer', ': Boksstyring', ': Boks ×4'].map((n) => (
            <span key={n} className="pib-chip">
              {n}
            </span>
          ))}
        </motion.div>
        <ul>
          {LIST.map((c) => {
            const isExt = c.col === 'ext'
            const lineOn = isExt ? extOn : linesOn
            const portOn = isExt ? extOn : portsOn
            const now = isExt ? step === 5 : step === 4
            const { a, b } = c
            return (
              <li key={c.id} className="pib-row" data-now={now || undefined}>
                <motion.span className="pib-end is-a" initial={false} animate={{ opacity: portOn ? 1 : 0.35 }} transition={t.fade}>
                  <span className="pib-endpart">{a.part}</span>
                  <code>{a.port}</code>
                </motion.span>
                <span className="pib-wire">
                  <Port kind={a.kind} side="a" show={portOn} />
                  <span className="pib-track">
                    <motion.span
                      className="pib-line"
                      initial={false}
                      animate={{ scaleX: lineOn ? 1 : 0 }}
                      transition={lineOn ? { ...t.travel, duration: 0.6 } : t.fade}
                    />
                  </span>
                  <Port kind={b.kind} side="b" show={portOn} />
                </span>
                <motion.span className="pib-end is-b" initial={false} animate={{ opacity: portOn ? 1 : 0.35 }} transition={t.fade}>
                  <span className="pib-endpart">{b.part}</span>
                  <code>{b.port}</code>
                </motion.span>
              </li>
            )
          })}
        </ul>
      </div>

      <motion.div
        className="pib-legend"
        initial={false}
        animate={{ opacity: portsOn ? 1 : 0 }}
        transition={portsOn ? { ...t.settle, delay: 0.2 } : t.fade}
      >
        <span>
          <span className="pib-port" data-kind="out">→</span> atomisk (in/out på BDD’et)
        </span>
        <span>
          <span className="pib-port" data-kind="na">↔</span> ikke-atomisk
        </span>
        <span>
          <span className="pib-port" data-kind="conj">↔</span> konjugeret (~ på BDD’et)
        </span>
      </motion.div>
    </div>
  )
}

function BddIbd({ step }: { step: number }) {
  return (
    <div className="pib">
      <div className="pib-switch" aria-hidden="true">
        <span data-on={step < 2 || undefined}>bdd — typer og porte</span>
        <span className="pib-arrow">→</span>
        <span data-on={step >= 2 || undefined}>ibd — parts og forbindelser</span>
      </div>
      <Swap show={step < 2 ? 0 : 1} items={[<BddPanel key="bdd" step={step} />, <IbdPanel key="ibd" step={step} />]} />
    </div>
  )
}

const viz: VizDef = {
  id: 'bdd-ibd',
  title: 'Pakkeboksen fra BDD til IBD',
  steps: [
    {
      caption:
        '**BDD’et** fra øvelse B: `Pakkeboksen` består af fem bloktyper, og hver blok har sine porte i et ports-compartment med `in`/`out`/`inout`.',
      hold: 2600,
    },
    {
      caption:
        'To ting at lægge mærke til: `~` markerer en **konjugeret** port (retningerne byttet), og `Boks` har multiplicitet **4** — Boksstyring har derfor `lock[4]`.',
      hold: 2800,
    },
    {
      caption:
        '**IBD’et** er det indre af blokken `Pakkeboksen`. Hver blok bliver en **part**; multiplicitet 4 giver fire `: Boks`.',
      hold: 2400,
    },
    {
      caption:
        'Portene fra BDD’et sættes på parts. På IBD’et står hverken `in`/`out` eller `~` — **symbolet** viser retning, og det skyggede symbol betyder konjugeret.',
      hold: 3000,
    },
    {
      caption:
        '**Connectors** forbinder porte med samme type: HDMI til HDMI, USB til `~USB`, SPI til `~SPI`, `~BOX` til BOX. Computer er navet.',
      hold: 3000,
    },
    {
      caption:
        'Blokkens egen port `net : Wi-Fi` sidder på **rammen** og forbindes til den part, der realiserer den: Computer.',
      hold: 2600,
    },
  ],
  Component: BddIbd,
}

export default viz
