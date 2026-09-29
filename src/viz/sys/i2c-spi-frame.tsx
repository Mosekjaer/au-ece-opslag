import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { t } from '../kit/motion'
import './i2c-spi-frame.css'

/* I2C: 08.2 s. 4–5 (START, A6–A0, R/W, ACK, D7–D0, STOP; multi-byte uden ny start;
   R/W = 0 er write; ACK = 0 er succes; controller/target styrer SDA på skift) og kursets
   i2c/ssd1306_oled: SSD1306_ADDR 0x3C, sendCommand(cmd) skriver {0x80, cmd}, og
   init()-sekvensen slutter med 0xAF “Set display on”.
   SPI: 08.2 s. 13–14 (SCK, MOSI, MISO, CS; CS lav vælger slaven; full duplex) og
   11.2 s. 11–16 (BMI160: 16 clocks, R/W-bit først, buf[0] = reg | 0x80, buf[1] = 0,
   buffer[0] = 0xFF bagefter, CHIP_ID-registeret 0x00 giver 0xd1).
   Sammenligningen: 08.2 s. 21. */

type Who = 'm' | 's'
interface Field {
  id: string
  label: string
  bits: string // '0'/'1', eller 'S'/'P' for start/stop
  who: Who
  at: number
  note?: string
}

const I2C: Field[] = [
  { id: 'start', label: 'START', bits: 'S', who: 'm', at: 1 },
  { id: 'addr', label: 'adresse 0x3C', bits: '0111100', who: 'm', at: 1 },
  { id: 'rw', label: 'R/W', bits: '0', who: 'm', at: 1, note: 'write' },
  { id: 'ack0', label: 'ACK', bits: '0', who: 's', at: 2 },
  { id: 'd0', label: '0x80', bits: '10000000', who: 'm', at: 2, note: 'kontrolbyte: kommando' },
  { id: 'ack1', label: 'ACK', bits: '0', who: 's', at: 2 },
  { id: 'd1', label: '0xAF', bits: '10101111', who: 'm', at: 2, note: 'Set display on' },
  { id: 'ack2', label: 'ACK', bits: '0', who: 's', at: 2 },
  { id: 'stop', label: 'STOP', bits: 'P', who: 'm', at: 3 },
]

interface SpiByte {
  n: number
  at: number
  mosi: { bits: string; hex: string; note: string }
  miso: { bits: string; hex: string; note: string }
}
const SPI: SpiByte[] = [
  {
    n: 0,
    at: 4,
    mosi: { bits: '10000000', hex: '0x80', note: 'R/W = 1 + adresse 0x00' },
    miso: { bits: '11111111', hex: '0xFF', note: 'skrald' },
  },
  {
    n: 1,
    at: 5,
    mosi: { bits: '00000000', hex: '0x00', note: 'fyld' },
    miso: { bits: '11010001', hex: '0xD1', note: 'Chip ID' },
  },
]

const COMPARE: [string, string, string][] = [
  ['Ledninger', 'SDA, SCL', 'SCK, MOSI, MISO, CS'],
  ['Vælger slave', '7-bit adresse', 'CS-linje lav'],
  ['Retning', 'half-duplex', 'full-duplex'],
  ['Linux', '/dev/i2c-1 + I2C_SLAVE', '/dev/spidev0.0 + SPI_IOC_MESSAGE(1)'],
]

const show = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: on ? 1 : 0 },
  transition: on ? { ...t.fade, delay } : t.fade,
})

function Bits({ bits, on, who, flat, delay = 0 }: { bits: string; on: boolean; who: Who; flat?: boolean; delay?: number }) {
  return (
    <span className="sis-bits">
      {bits.split('').map((b, i) => (
        <span key={i} className="sis-bit" data-who={who} data-on={on || undefined}>
          <motion.span className="sis-v mono" {...show(on, delay + i * 0.03)}>
            {b}
          </motion.span>
          <span className="sis-clk" data-flat={flat || undefined} />
        </span>
      ))}
    </span>
  )
}

/** `/dev/… + KONSTANT` — brud kun ved plusset, aldrig inde i et navn. */
function Api({ s }: { s: string }) {
  const [dev, c] = s.split(' + ')
  return (
    <>
      <code>{dev}</code> + <code>{c}</code>
    </>
  )
}

function Frames({ step }: { step: number }) {
  const final = step >= 6
  const csLow = step >= 4
  return (
    <div className="sis">
      {/* I2C */}
      <section className="sis-bus sis-i2c">
          <header className="sis-head">
            <span className="sis-name">I2C</span>
            <span className="sis-dev">
              Pi → SSD1306-OLED · <code>sendCommand(0xAF)</code>
            </span>
          </header>
          <div className="sis-frame">
            <span className="sis-rowlab">
              <span>SDA</span>
              <span>SCL</span>
            </span>
            <div className="sis-fields">
              {I2C.map((f) => {
                const on = step >= f.at
                const now = step === f.at
                return (
                  <div key={f.id} className="sis-field" data-who={f.who} data-now={(now && on) || undefined}>
                    <span className="sis-flabel">{f.label}</span>
                    <Bits bits={f.bits} on={on} who={f.who} flat={f.bits === 'S' || f.bits === 'P'} delay={f.who === 's' ? 0.25 : 0} />
                    <motion.span className="sis-fnote" {...show(on && !!f.note, 0.3)}>
                      {f.note ?? ' '}
                    </motion.span>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="sis-legend">
            <span data-who="m">master (Pi) styrer SDA</span>
            <span data-who="s">slave (OLED) svarer ACK = 0</span>
          </div>
        </section>

        {/* SPI */}
        <section className="sis-bus sis-spibus">
          <header className="sis-head">
            <span className="sis-name">SPI</span>
            <span className="sis-dev">
              Pi ↔ BMI160 · <code>readReg(BMI160_CHIP_ID_REG, 1)</code>
            </span>
          </header>
          <div className="sis-spi">
            {SPI.map((b) => {
              const on = step >= b.at
              const now = step === b.at
              return (
                <div key={b.n} className="sis-byte" data-now={now || undefined}>
                  <span className="sis-bytelab">
                    <code>buf[{b.n}]</code>
                  </span>
                  <span className="sis-lane">
                    <span className="sis-lanelab">CS</span>
                    <span className="sis-cs" data-low={csLow || undefined}>
                      <motion.span {...show(csLow)}>lav</motion.span>
                    </span>
                  </span>
                  <span className="sis-lane">
                    <span className="sis-lanelab">MOSI</span>
                    <Bits bits={b.mosi.bits} on={on} who="m" />
                    <motion.span className="sis-hex" {...show(on)}>
                      <b className="mono">{b.mosi.hex}</b> {b.mosi.note}
                    </motion.span>
                  </span>
                  <span className="sis-lane">
                    <span className="sis-lanelab">MISO</span>
                    <Bits bits={b.miso.bits} on={on} who="s" />
                    <motion.span className="sis-hex" {...show(on)}>
                      <b className="mono">{b.miso.hex}</b> {b.miso.note}
                    </motion.span>
                  </span>
                </div>
              )
            })}
          </div>
          <div className="sis-legend">
            <span data-who="m">master sender på MOSI</span>
            <span data-who="s">slave sender på MISO — samtidig</span>
          </div>
        </section>

      <motion.table className="sis-cmp" {...show(final)}>
        <thead>
          <tr>
            <th />
            <th>I2C</th>
            <th>SPI</th>
          </tr>
        </thead>
        <tbody>
          {COMPARE.map(([k, a, b]) => (
            <tr key={k}>
              <th>{k}</th>
              <td>{k === 'Linux' ? <Api s={a} /> : a}</td>
              <td>{k === 'Linux' ? <Api s={b} /> : b}</td>
            </tr>
          ))}
        </tbody>
      </motion.table>
    </div>
  )
}

const viz: VizDef = {
  id: 'i2c-spi-frame',
  title: 'En I2C-ramme og en SPI-transfer bit for bit',
  steps: [
    {
      caption: 'I2C har to ledninger, **SDA** og **SCL**; SPI har fire. Én bit pr. clockpuls, MSB først.',
      hold: 2200,
    },
    {
      caption: 'Masteren sender **START**, adressen `0x3C` som syv bits og **R/W = 0** (write). Alle slaves hører adressen, men kun OLED’en svarer.',
      hold: 3000,
    },
    {
      caption: 'OLED’en svarer **ACK = 0**. Så følger `0x80` (kontrolbyten for en kommando) og `0xAF`, hver med sit ACK — ingen ny START mellem bytes.',
      hold: 3200,
    },
    {
      caption: '**STOP** slutter rammen. SDA skifter mellem master og slave: kun én sender ad gangen — *half-duplex*.',
      hold: 2400,
    },
    {
      caption: 'SPI: **CS lav** vælger BMI160 — ingen adresse på bussen. Første byte er `reg | 0x80`: R/W-bitten først (1 = read), så registeret `0x00`. Samtidig kommer `0xFF` tilbage på MISO.',
      hold: 3400,
    },
    {
      caption: 'Anden byte: masteren sender fyld, og slaven sender registerets indhold, `0xD1`. 16 clocks, og `buf[1]` er Chip ID.',
      hold: 2800,
    },
    {
      caption: 'I2C vælger slaven med en adresse og kører half-duplex på to ledninger; SPI bruger en CS-linje pr. slave og sender begge veje på én gang.',
      hold: 3200,
    },
  ],
  Component: Frames,
}

export default viz
