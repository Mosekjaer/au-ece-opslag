import { Fragment, type ReactNode } from 'react'
import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-dns.css'

/* Kurose & Ross s. 158–161, fig. 2.19: cse.nyu.edu slår gaia.cs.umass.edu op via
   den lokale server dns.nyu.edu; root svarer med TLD-servere for edu, TLD med
   dns.umass.edu, den autoritative server med IP-adressen. 8 beskeder; første query
   er rekursiv, resten iterative. NS- og A-posten i svar 5 er bogens eksempel fra
   s. 162. Bogen giver ikke IP-adressen på gaia.cs.umass.edu — derfor står der
   kun “IP-adressen”. Caching af TLD-adresser: s. 160–161. */

// Brudpunkter efter punktummer, så hostnames aldrig knækker midt i et ord.
const host = (s: string): ReactNode =>
  s.split('.').map((p, i, a) => (
    <Fragment key={i}>
      {p}
      {i < a.length - 1 && (
        <>
          .<wbr />
        </>
      )}
    </Fragment>
  ))

const PARTS = [
  { id: 'host', role: 'vært', name: 'cse.nyu.edu' },
  { id: 'local', role: 'lokal DNS', name: 'dns.nyu.edu' },
  { id: 'root', role: 'root', name: 'root DNS' },
  { id: 'tld', role: 'TLD', name: 'edu' },
  { id: 'auth', role: 'autori\u00ADtativ', name: 'dns.umass.edu' },
] as const

type Msg = { from: number; to: number; text: ReactNode; kind?: 'rec' | 'it' }

const MSGS: Msg[] = [
  { from: 0, to: 1, text: <>query: <code>gaia.cs.umass.edu</code></>, kind: 'rec' },
  { from: 1, to: 2, text: <>query: <code>gaia.cs.umass.edu</code></>, kind: 'it' },
  { from: 2, to: 1, text: <>ser suffikset <code>edu</code> → IP-adresser på TLD-servere for <code>edu</code></> },
  { from: 1, to: 3, text: <>query: <code>gaia.cs.umass.edu</code></>, kind: 'it' },
  {
    from: 3,
    to: 1,
    text: (
      <>
        ser <code>umass.edu</code> → <code>(umass.edu, dns.umass.edu, NS)</code> og{' '}
        <code>(dns.umass.edu, 128.119.40.111, A)</code>
      </>
    ),
  },
  { from: 1, to: 4, text: <>query: <code>gaia.cs.umass.edu</code></>, kind: 'it' },
  { from: 4, to: 1, text: <>IP-adressen på <code>gaia.cs.umass.edu</code></> },
  { from: 1, to: 0, text: <>IP-adressen videre til værten</> },
]

// Antal sendte beskeder pr. trin.
const SENT = [0, 1, 3, 5, 7, 8]
// Hvem er aktiv pr. trin?
const ACTIVE: string[][] = [[], ['host', 'local'], ['local', 'root'], ['local', 'tld'], ['local', 'auth'], ['local', 'host']]

function Dns({ step }: { step: number }) {
  const sent = SENT[Math.min(step, SENT.length - 1)]
  const prev = SENT[Math.max(0, Math.min(step, SENT.length - 1) - 1)]
  const active = ACTIVE[Math.min(step, ACTIVE.length - 1)]
  const done = at(step, 5)

  return (
    <div className="kd">
      <div className="kd-diagram">
        <div className="kd-grid">
          {PARTS.map((p, k) => (
            <div
              key={p.id}
              className="kd-head"
              data-on={active.includes(p.id) || undefined}
              style={{ gridColumn: `${2 * k + 1} / ${2 * k + 3}` }}
            >
              <span className="kd-role">{p.role}</span>
              <span className="kd-name">{host(p.name)}</span>
            </div>
          ))}
          {PARTS.map((p, k) => (
            <div key={`ll-${p.id}`} className="kd-life" style={{ gridColumn: `${2 * k + 1} / ${2 * k + 3}` }} />
          ))}
          {MSGS.map((m, i) => {
            const on = i < sent
            const now = on && i >= prev
            const back = m.to < m.from
            const a = Math.min(m.from, m.to)
            const b = Math.max(m.from, m.to)
            return (
              <div
                key={i}
                className="kd-arrow"
                style={{ gridColumn: `${2 * a + 2} / ${2 * b + 2}`, gridRow: i + 2 }}
              >
                <Link on={on} back={back} tone={!on ? 'muted' : now ? 'focus' : 'idle'} label={i + 1} />
              </div>
            )
          })}
        </div>
        <div className="kd-foot">
          <Tag show={done} tone="focus">
            8 beskeder: 4 queries + 4 replies
          </Tag>
          <Tag show={done} tone="idle" wrap>
            næste gang: TLD-adressen er cachet, root springes over
          </Tag>
        </div>
      </div>

      <ol className="kd-list">
        {MSGS.map((m, i) => {
          const on = i < sent
          const now = on && i >= prev
          return (
            <motion.li
              key={i}
              className="kd-item"
              data-now={now || undefined}
              initial={false}
              animate={{ opacity: on ? 1 : 0.28 }}
              transition={t.fade}
            >
              <span className="kd-num">{i + 1}</span>
              <span className="kd-text">
                <span className="kd-route">
                  {PARTS[m.from].role} → {PARTS[m.to].role}
                  {m.kind === 'rec' && <em className="kd-kind"> rekursiv</em>}
                  {m.kind === 'it' && <em className="kd-kind"> iterativ</em>}
                </span>
                <span className="kd-body">{m.text}</span>
              </span>
            </motion.li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-dns',
  title: 'Et DNS-opslag gennem root, TLD og autoritativ server',
  steps: [
    {
      caption:
        'Værten `cse.nyu.edu` skal bruge IP-adressen på `gaia.cs.umass.edu`. Den spørger aldrig hierarkiet selv, men sin **lokale DNS-server** `dns.nyu.edu`.',
      hold: 2400,
    },
    {
      caption:
        '1: Værtens query er **rekursiv** — den beder den lokale server skaffe svaret på dens vegne.',
      hold: 2200,
    },
    {
      caption:
        '2–3: Den lokale server spørger en **root-server**. Root kender ikke svaret, men ser `edu` og svarer med adresser på **TLD-serverne** for `edu`.',
      hold: 2800,
    },
    {
      caption:
        '4–5: TLD-serveren ser `umass.edu` og svarer med den **autoritative** server — en NS-post og en A-post med dens IP-adresse.',
      hold: 2800,
    },
    {
      caption:
        '6–7: Den autoritative server `dns.umass.edu` har A-posten og svarer med IP-adressen. Query 2, 4 og 6 er **iterative**: hvert svar går tilbage til `dns.nyu.edu`.',
      hold: 3000,
    },
    {
      caption:
        '8: Svaret går til værten. **Otte beskeder** for ét navn — men den lokale server cacher svarene og TLD-adresserne, så root sjældent spørges næste gang.',
      hold: 3200,
    },
  ],
  Component: Dns,
}

export default viz
