import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './prj-portspec.css'

/* Measurement Instrument fra System Design and Interfaces-F21.pdf:
   slide 6–7 (ydre porte og deres krav), slide 11 (ibd med name:type),
   slide 12 (PowerSupply og Amplifier), slide 13 (ADC og ProcessorBoard med "?"),
   slide 14 (noterne: ProcessorBoard Power:DC max. 600 mA; ADC In 5 Ohm).
   “?” er felter, opgaven lader stå åbne; løsnings-PDF’en er ikke i materialet. */

type Verdict = 'ok' | 'neg' | 'open'

interface Conn {
  id: string
  group: 'power' | 'signal'
  from: string
  fromSpec: string
  to: string
  toSpec: string
  verdict: Verdict
  why: string
}

const CONNS: Conn[] = [
  { id: 'ac', group: 'power', from: 'ydre port · 220V : AC', fromSpec: '200–250 V RMS, 50 Hz, 100 mA', to: 'PowerSupply · 220V : AC', toSpec: '200–250 V RMS, 50 Hz, 100 mA', verdict: 'ok', why: 'passer' },
  { id: 'pm5', group: 'power', from: 'PowerSupply · ±5V : DC', fromSpec: '±0,2 V, max 250 mA', to: 'Amplifier · Power : DC', toSpec: '±5 V ±0,3 V, max 200 mA', verdict: 'ok', why: '250 ≥ 200 mA' },
  { id: '3v3', group: 'power', from: 'PowerSupply · 3V3 : DC', fromSpec: '±0,3 V, max 250 mA', to: 'ADC · Power : DC', toSpec: '?', verdict: 'open', why: 'ikke specificeret' },
  { id: '5v', group: 'power', from: 'PowerSupply · 5V : DC', fromSpec: '±0,2 V, max 500 mA', to: 'ProcessorBoard · Power : DC', toSpec: 'max 600 mA', verdict: 'neg', why: '500 < 600 mA' },
  { id: 'sens', group: 'signal', from: 'ydre port · Sensor : Analogue', fromSpec: 'differentiel, ±100 µV, 50 Ω', to: 'Amplifier · Sensor : Analogue', toSpec: 'differentiel, ±100 µV, 50 Ω', verdict: 'ok', why: 'passer' },
  { id: 'amp', group: 'signal', from: 'Amplifier · Out : Analogue', fromSpec: 'single ended, ±500 mV, 500 Ω', to: 'ADC · In : Analogue', toSpec: '5 Ω', verdict: 'neg', why: 'Rin ≠ Rout' },
  { id: 'ser', group: 'signal', from: 'ADC · Out : Serial', fromSpec: 'SPI or I2S', to: 'ProcessorBoard · SampleData : Serial', toSpec: 'SPI or I2S', verdict: 'ok', why: 'samme — vælg én' },
  { id: 'trig', group: 'signal', from: 'ydre port · Trigger : Digital', fromSpec: '5 V, low < 0,8 V, high > 2,0 V', to: 'ProcessorBoard · Trigger : Digital', toSpec: '?', verdict: 'open', why: 'ikke specificeret' },
  { id: 'usb', group: 'signal', from: 'ProcessorBoard · Computer : USB', fromSpec: 'USB 2.0', to: 'ydre port · Computer : USB', toSpec: 'USB 2.0', verdict: 'ok', why: 'passer' },
]

/** Tal og enhed må ikke skilles ad ved linjeskift. */
const nb = (s: string) => s.replace(/ (V|mA|Ω|Hz|µV|mV)(?=[,\s]|$)/g, '\u00a0$1')

const TONE: Record<Verdict, Tone> = { ok: 'idle', neg: 'neg', open: 'muted' }

function End({ label }: { label: string }) {
  const [part, port] = label.split(' · ')
  return (
    <span className="pps-end">
      <span className="pps-part">{part}</span>
      <code>{port}</code>
    </span>
  )
}

function PortSpec({ step }: { step: number }) {
  const specs = step >= 1
  const checked = (c: Conn) => (c.group === 'power' ? step >= 2 : step >= 3)
  const now = (c: Conn) => (c.group === 'power' ? step === 2 : step === 3)
  const errors = CONNS.filter((c) => c.verdict === 'neg').length
  const open = CONNS.filter((c) => c.verdict === 'open').length
  return (
    <div className="pps">
      <div className="pps-head" aria-hidden="true">
        <span className="vcaps">Fra port</span>
        <span className="vcaps">Specifikation</span>
        <span className="vcaps">Til port</span>
        <span className="vcaps">Specifikation</span>
        <span className="vcaps">Tjek</span>
      </div>
      <ul className="pps-rows">
        {CONNS.map((c, i) => {
          const done = checked(c)
          return (
            <li key={c.id} className="pps-row" data-tone={done ? c.verdict : 'idle'} data-now={now(c) || undefined}>
              <span className="pps-from">
                <End label={c.from} />
              </span>
              <motion.span
                className="pps-spec is-from"
                initial={false}
                animate={{ opacity: specs ? 1 : 0 }}
                transition={specs ? stagger(i, 0.05, 0.05) : t.fade}
              >
                {nb(c.fromSpec)}
              </motion.span>
              <span className="pps-to">
                <span className="pps-arrow" aria-hidden="true">
                  →
                </span>
                <End label={c.to} />
              </span>
              <motion.span
                className="pps-spec is-to"
                data-open={c.toSpec === '?' || undefined}
                initial={false}
                animate={{ opacity: specs ? 1 : 0 }}
                transition={specs ? stagger(i, 0.12, 0.05) : t.fade}
              >
                {nb(c.toSpec)}
              </motion.span>
              <span className="pps-verdict">
                <Tag show={done} tone={TONE[c.verdict]}>
                  {c.verdict === 'ok' ? '✓ ' : c.verdict === 'neg' ? '✗ ' : ''}
                  {c.why}
                </Tag>
              </span>
            </li>
          )
        })}
      </ul>
      <motion.div
        className="pps-sum"
        initial={false}
        animate={{ opacity: step >= 4 ? 1 : 0 }}
        transition={step >= 4 ? t.settle : t.fade}
      >
        <Tag tone="neg">{errors} fejl</Tag>
        <Tag tone="muted">{open} åbne felter</Tag>
        <span>Hver forbindelse tjekkes fra begge ender: type, spænding, strøm og impedans.</span>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'prj-portspec',
  title: 'Measurement Instruments grænseflader tjekkes fra begge ender',
  steps: [
    {
      caption:
        'IBD’et for Measurement Instrument giver forbindelserne med `navn : type`. Det siger, *hvad* der er forbundet, men ikke om det virker.',
      hold: 2400,
    },
    {
      caption:
        'Portspecifikationen fra blokkenes tabeller sættes på hver ende: spænding, tolerance, strøm, impedans, standard. `?` er felter, opgaven lader stå åbne.',
      hold: 2800,
    },
    {
      caption:
        'Forsyningen tjekkes: ±5 V kan levere 250 mA til forstærkerens 200. Men 5 V-udgangen giver **højst 500 mA**, og ProcessorBoard trækker op til 600.',
      hold: 3000,
    },
    {
      caption:
        'Signalerne tjekkes: forstærkerens udgang har **500 Ω**, ADC-indgangen **5 Ω** — “Rin = Rout is best”. Den serielle forbindelse passer, men SPI eller I2S skal vælges.',
      hold: 3200,
    },
    {
      caption: 'Resultatet: to fejl og to åbne felter, som kun findes, når tabellen læses på tværs af blokkene.',
      hold: 2600,
    },
  ],
  Component: PortSpec,
}

export default viz
