import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-ipv4-forwarding.css'

/* Kurose & Ross s. 345: routeren med fire links (0–3) og forwarding-tabellen med
   præfikserne 11001000 00010111 00010 → 0, 11001000 00010111 00011000 → 1,
   11001000 00010111 00011 → 2, ellers → 3. Adresse A = 11001000 00010111 00010110
   10100001 matcher kun første række (21 bit) → link 0. Adresse B = 11001000
   00010111 00011000 10101010 matcher række 2 (24 bit) og række 3 (21 bit); longest
   prefix match vælger link 1. Dotted-decimal (200.23.…) er omregnet her; bogen
   skriver kun bitmønstrene. */

const TABLE = [
  { bits: '110010000001011100010', link: 0 },
  { bits: '110010000001011100011000', link: 1 },
  { bits: '110010000001011100011', link: 2 },
] as const

const ADDR = {
  A: { bits: '11001000000101110001011010100001', dotted: '200.23.22.161' },
  B: { bits: '11001000000101110001100010101010', dotted: '200.23.24.170' },
}

/** Antal bit, der matcher (hele præfikset), eller indeks for første afvigende bit. */
function compare(prefix: string, addr: string): { ok: boolean; at: number } {
  for (let i = 0; i < prefix.length; i++) if (prefix[i] !== addr[i]) return { ok: false, at: i }
  return { ok: true, at: prefix.length }
}

const bytes = (s: string) => s.match(/.{1,8}/g) ?? []

/** Bits i byte-grupper; hver byte er et udeleligt stykke, så linjen kun brydes mellem bytes. */
function Bits({ bits, tone }: { bits: string; tone: (i: number) => Tone | undefined }) {
  return (
    <span className="lpm-bits mono">
      {bytes(bits).map((b, bi) => (
        <span key={bi} className="lpm-byte">
          {b.split('').map((c, ci) => {
            const i = bi * 8 + ci
            return (
              <span key={ci} className="lpm-bit" data-tone={tone(i) ?? 'idle'}>
                {c}
              </span>
            )
          })}
        </span>
      ))}
    </span>
  )
}

function Lpm({ step }: { step: number }) {
  const which = step <= 1 ? 'A' : 'B'
  const addr = ADDR[which].bits
  const compared = step === 1 || step >= 3
  const decided = step === 1 || step >= 4
  const results = TABLE.map((r) => compare(r.bits, addr))
  const matches = results.map((r, i) => (r.ok ? i : -1)).filter((i) => i >= 0)
  const winner = matches.reduce((w, i) => (w < 0 || TABLE[i].bits.length > TABLE[w].bits.length ? i : w), -1)
  const winLen = winner >= 0 ? TABLE[winner].bits.length : 0

  const rowTone = (i: number): Tone => {
    if (!compared) return 'idle'
    if (decided && i === winner) return 'focus'
    return results[i].ok ? 'idle' : 'muted'
  }

  return (
    <div className="lpm">
      <section className="lpm-dest">
        <span className="vcaps">Destinationsadresse i det ankomne datagram</span>
        <motion.div
          key={which}
          className="lpm-addr"
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={t.travel}
        >
          <Tag tone="idle">{which}</Tag>
          <Bits bits={addr} tone={(i) => (decided && i < winLen ? 'focus' : undefined)} />
          <span className="lpm-dotted mono">= {ADDR[which].dotted}</span>
        </motion.div>
      </section>

      <section className="lpm-table" aria-label="Forwarding-tabel">
        <div className="lpm-head">
          <span>Prefix</span>
          <span>Match</span>
          <span>Link</span>
        </div>
        {TABLE.map((r, i) => {
          const res = results[i]
          return (
            <div key={i} className="lpm-row" data-tone={rowTone(i)}>
              <Bits
                bits={r.bits}
                tone={(b) => {
                  if (!compared) return undefined
                  if (!res.ok && b === res.at) return 'neg'
                  if (b < res.at) return 'ok'
                  return 'muted'
                }}
              />
              <span className="lpm-res">
                <motion.span
                  className="lpm-res-in"
                  initial={false}
                  animate={{ opacity: compared ? 1 : 0 }}
                  transition={compared ? { ...t.settle, delay: 0.12 * i } : t.fade}
                >
                  {res.ok ? (
                    <Tag tone={decided && i === winner ? 'focus' : 'idle'}>{r.bits.length} bit</Tag>
                  ) : (
                    <Tag tone="neg">bit {res.at + 1} afviger</Tag>
                  )}
                </motion.span>
              </span>
              <span className="lpm-link mono">{r.link}</span>
            </div>
          )
        })}
        <div className="lpm-row" data-tone={compared && matches.length === 0 ? 'focus' : 'idle'}>
          <span className="lpm-other">otherwise</span>
          <span className="lpm-res" />
          <span className="lpm-link mono">3</span>
        </div>
      </section>

      <section className="lpm-out">
        {(['A', 'B'] as const).map((k) => {
          const show = k === 'A' ? step >= 1 : step >= 4
          return (
            <motion.p
              key={k}
              className="lpm-verdict"
              initial={false}
              animate={{ opacity: show ? 1 : 0, y: show ? 0 : 4 }}
              transition={show ? t.settle : t.fade}
            >
              <Tag tone="idle">{k}</Tag>
              {k === 'A' ? (
                <span>
                  kun første præfiks matcher (21 bit) → <strong>link 0</strong>
                </span>
              ) : (
                <span>
                  24 bit slår 21 bit → <strong>link 1</strong>, ikke link 2
                </span>
              )}
            </motion.p>
          )
        })}
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-ipv4-forwarding',
  title: 'Longest prefix match i bogens forwarding-tabel',
  steps: [
    {
      caption:
        'Routeren har fire links. I stedet for en række pr. adresse gemmer tabellen tre **præfikser** og en *otherwise*-række. Datagram A ankommer.',
      hold: 2400,
    },
    {
      caption:
        'A sammenlignes bit for bit med hvert præfiks. Kun første række passer i alle 21 bit; de to andre afviger i bit 21. A sendes ud på **link 0**.',
      hold: 3000,
    },
    { caption: 'Datagram B ankommer. Det adskiller sig fra A fra bit 21 og frem.', hold: 1800 },
    {
      caption: 'B matcher **to** rækker: `…00011000` i 24 bit og `…00011` i 21 bit. Første række afviger i bit 21.',
      hold: 2800,
    },
    {
      caption:
        'Ved flere match bruger routeren **longest prefix match**: det længste, mest specifikke præfiks vinder, så B går ud på **link 1**.',
      hold: 3000,
    },
  ],
  Component: Lpm,
}

export default viz
