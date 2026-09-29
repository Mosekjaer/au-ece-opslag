import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './prj-seriel.css'

/* Samme byte over tre serielle grænseflader.
   Byten: ASCII "U" = 85 = 0x55 = 01010101, sendt med START, LSB … MSB, STOP
   (System Design and Interfaces-F21.pdf, slide 10).
   UART-frame: SWISE_Protocols.pdf slide 16 (start 0, 5–9 databits, valgfri paritet,
   stop 1). I2C: slide 21 og System Design and Interfaces slide 19 (START, 7
   adressebits B6…B0, R/W, ACK, D7…D0, ACK, STOP). SPI: slide 17–18 (SCLK, MOSI,
   MISO, SS; sender og modtager samtidigt). Sammenligning: slide 22–23.
   Slaveadressen og SPI’s bitrækkefølge står ikke i materialet og vises ikke. */

type Kind = 'frame' | 'addr' | 'data' | 'ctrl' | 'opt'

interface Cell {
  top: string
  bit: string
  kind: Kind
}
interface Group {
  label: string
  cells: Cell[]
}
interface Lane {
  id: string
  name: string
  wires: string
  at: number
  groups: Group[]
  second?: { label: string; group: Group }
  meta: string[]
}

// 0x55 = 0101 0101 (D7 … D0)
const MSB_FIRST = ['0', '1', '0', '1', '0', '1', '0', '1']
const LSB_FIRST = [...MSB_FIRST].reverse()

const LANES: Lane[] = [
  {
    id: 'uart',
    name: 'UART',
    wires: 'TX → RX (+ GND), ingen clock',
    at: 1,
    groups: [
      { label: 'start', cells: [{ top: '', bit: '0', kind: 'frame' }] },
      { label: 'data, LSB først', cells: LSB_FIRST.map((b, i) => ({ top: `D${i}`, bit: b, kind: 'data' as const })) },
      { label: 'paritet', cells: [{ top: 'P', bit: '–', kind: 'opt' }] },
      { label: 'stop', cells: [{ top: '', bit: '1', kind: 'frame' }] },
    ],
    meta: ['asynkron', 'full duplex', '2 enheder', 'langsomst'],
  },
  {
    id: 'i2c',
    name: 'I2C',
    wires: 'SDA (data) + SCL (clock), fælles bus',
    at: 2,
    groups: [
      { label: 'START', cells: [{ top: 'SDA', bit: '↓', kind: 'frame' }] },
      { label: 'slaveadresse (7)', cells: ['B6', 'B5', 'B4', 'B3', 'B2', 'B1', 'B0'].map((b) => ({ top: b, bit: '·', kind: 'addr' as const })) },
      { label: 'R/W', cells: [{ top: 'W', bit: '0', kind: 'ctrl' }] },
      { label: 'ACK', cells: [{ top: 'A', bit: '←', kind: 'ctrl' }] },
      { label: 'data, D7 først', cells: MSB_FIRST.map((b, i) => ({ top: `D${7 - i}`, bit: b, kind: 'data' as const })) },
      { label: 'ACK', cells: [{ top: 'A', bit: '←', kind: 'ctrl' }] },
      { label: 'STOP', cells: [{ top: 'SDA', bit: '↑', kind: 'frame' }] },
    ],
    meta: ['half duplex', 'op til 127 enheder', 'hurtigere end UART'],
  },
  {
    id: 'spi',
    name: 'SPI',
    wires: 'SCLK, MOSI, MISO + én SS pr. slave',
    at: 3,
    groups: [
      { label: 'vælg', cells: [{ top: 'SS', bit: '●', kind: 'frame' }] },
      { label: 'MOSI: 8 bit ud, én pr. SCLK', cells: MSB_FIRST.map((_, i) => ({ top: `${i + 1}`, bit: '▪', kind: 'data' as const })) },
      { label: 'slip', cells: [{ top: 'SS', bit: '○', kind: 'frame' }] },
    ],
    second: {
      label: 'MISO: 8 bit ind på de samme clock-pulser',
      group: { label: '', cells: MSB_FIRST.map((_, i) => ({ top: `${i + 1}`, bit: '▪', kind: 'data' as const })) },
    },
    meta: ['full duplex', '1 master, mange slaves', 'hurtigst'],
  },
]

const FINAL = 4

function Cells({ group, on, base }: { group: Group; on: boolean; base: number }) {
  return (
    <span className="pse-cells">
      {group.cells.map((c, i) => (
        <motion.span
          key={i}
          className="pse-cell"
          data-kind={c.kind}
          initial={false}
          animate={{ opacity: on ? 1 : 0.25, y: on ? 0 : 3 }}
          transition={on ? stagger(base + i, 0.05, 0.045) : t.fade}
        >
          <span className="pse-top">{c.top}</span>
          <span className="pse-bit">{c.bit}</span>
        </motion.span>
      ))}
    </span>
  )
}

function Seriel({ step }: { step: number }) {
  return (
    <div className="pse">
      <div className="pse-byte">
        <span className="vcaps">Beskeden</span>
        <span className="pse-u">
          <b>"U"</b> = 85 = <code>0x55</code> = <code>0101 0101</code>
        </span>
      </div>

      <ol className="pse-lanes">
        {LANES.map((lane) => {
          const on = step >= lane.at
          const now = step === lane.at
          let n = 0
          return (
            <li key={lane.id} className="pse-lane" data-on={on || undefined} data-now={now || undefined}>
              <div className="pse-name">
                <b>{lane.name}</b>
                <span className="pse-wires">{lane.wires}</span>
              </div>
              <div className="pse-frame">
                {lane.second ? (
                  /* SPI: MOSI og MISO taktes af de samme clock-pulser, så de står over hinanden. */
                  <div className="pse-spi">
                    {[lane.groups[0], null, lane.groups[2]].map((g, gi) =>
                      g ? (
                        <span key={gi} className="pse-group" style={{ gridColumn: gi + 1 }}>
                          <Cells group={g} on={on} base={gi === 0 ? 0 : 9} />
                          <span className="pse-glabel">{g.label}</span>
                        </span>
                      ) : (
                        <span key={gi} className="pse-spi-mid">
                          <span className="pse-group">
                            <Cells group={lane.groups[1]} on={on} base={1} />
                            <span className="pse-glabel">{lane.groups[1].label}</span>
                          </span>
                          <span className="pse-group">
                            <Cells group={lane.second!.group} on={on} base={1} />
                            <span className="pse-glabel">{lane.second!.label}</span>
                          </span>
                        </span>
                      ),
                    )}
                  </div>
                ) : (
                  <div className="pse-groups">
                    {lane.groups.map((g, gi) => {
                      const base = n
                      n += g.cells.length
                      return (
                        <span key={`${gi}-${g.label}`} className="pse-group">
                          <Cells group={g} on={on} base={base} />
                          <span className="pse-glabel">{g.label}</span>
                        </span>
                      )
                    })}
                  </div>
                )}
                <div className="pse-meta">
                  {lane.meta.map((m, i) => (
                    <motion.span
                      key={m}
                      initial={false}
                      animate={{ opacity: step >= FINAL ? 1 : 0 }}
                      transition={step >= FINAL ? stagger(i, 0.1) : t.fade}
                    >
                      <Tag tone="idle">{m}</Tag>
                    </motion.span>
                  ))}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'prj-seriel',
  title: 'Samme byte over UART, I2C og SPI',
  steps: [
    {
      caption: 'Beskeden er ét tegn: `"U"` = 85 = `0x55`. Grænsefladen afgør, hvilke bits der går på ledningen *omkring* de 8 databits.',
      hold: 2200,
    },
    {
      caption:
        '**UART** har ingen clock. En start-bit (0) vækker modtageren, der sampler midt i hver bit; data går LSB først, så kommer evt. paritet og en stop-bit (1).',
      hold: 3000,
    },
    {
      caption:
        '**I2C** er en bus: masteren sender START og slavens 7-bit adresse, R/W, og slaven svarer **ACK**. Så 8 databits, ACK igen og STOP. Adressen afhænger af komponenten.',
      hold: 3200,
    },
    {
      caption:
        '**SPI** vælger slaven med sin egen `SS`-linje. For hver clock-puls går én bit ud på MOSI og én bit ind på MISO — sende og modtage samtidigt.',
      hold: 3000,
    },
    {
      caption:
        'Sammenligningen fra slides: UART er simplest, I2C kæder mange enheder på to ledninger, SPI er hurtigst. Valget står i den tekniske analyse.',
      hold: 3000,
    },
  ],
  Component: Seriel,
}

export default viz
