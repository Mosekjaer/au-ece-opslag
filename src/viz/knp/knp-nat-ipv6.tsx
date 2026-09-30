import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Node, Tag } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-nat-ipv6.css'

/* Kurose & Ross fig. 4.25 (s. 375) og teksten s. 376: hjemmenettet 10.0.0.0/24 med
   hosts 10.0.0.1–10.0.0.3, NAT-routeren med LAN-interface 10.0.0.4 og WAN-adresse
   138.76.29.7, webserveren 128.119.40.186 port 80. Datagram 1: S = 10.0.0.1, 3345,
   D = 128.119.40.186, 80. Routeren vælger ny kildeport 5001 og tilføjer rækken
   WAN 138.76.29.7, 5001 ↔ LAN 10.0.0.1, 3345. Datagram 2: S = 138.76.29.7, 5001.
   Datagram 3 (svaret): D = 138.76.29.7, 5001. Datagram 4: D = 10.0.0.1, 3345. */

interface Dg {
  n: number
  s: string
  d: string
  /** Hvilket felt routeren har omskrevet. */
  changed?: 's' | 'd'
  dir: 'out' | 'in'
}

const DG: Record<number, Dg> = {
  1: { n: 1, s: '10.0.0.1, 3345', d: '128.119.40.186, 80', dir: 'out' },
  2: { n: 2, s: '138.76.29.7, 5001', d: '128.119.40.186, 80', changed: 's', dir: 'out' },
  3: { n: 3, s: '128.119.40.186, 80', d: '138.76.29.7, 5001', dir: 'in' },
  4: { n: 4, s: '128.119.40.186, 80', d: '10.0.0.1, 3345', changed: 'd', dir: 'in' },
}

// Brudpunkt efter kommaet, så "IP, port" kan stå på to linjer på smalle skærme.
const ipPort = (s: string): ReactNode => {
  const [ip, port] = s.split(', ')
  return (
    <>
      {ip},<wbr /> {port}
    </>
  )
}

function Card({ n, step }: { n: number; step: number }) {
  const g = DG[n]
  const show = step >= n
  const now = step === n
  return (
    <motion.div
      className="nat-dg"
      data-dir={g.dir}
      data-now={now || undefined}
      initial={false}
      animate={show ? { opacity: 1, x: 0 } : { opacity: 0, x: g.dir === 'out' ? -14 : 14 }}
      transition={show ? t.travel : t.fade}
      aria-hidden={!show || undefined}
    >
      <span className="nat-dg-head">
        <span className="nat-dg-n">{n}</span>
        <span className="nat-dg-arrow" aria-hidden="true">
          <span className="nat-a-h">{g.dir === 'out' ? '→' : '←'}</span>
          <span className="nat-a-v">{g.dir === 'out' ? '↓' : '↑'}</span>
        </span>
      </span>
      <span className="nat-dg-f mono" data-changed={g.changed === 's' || undefined}>
        <b>S</b> {ipPort(g.s)}
      </span>
      <span className="nat-dg-f mono" data-changed={g.changed === 'd' || undefined}>
        <b>D</b> {ipPort(g.d)}
      </span>
    </motion.div>
  )
}

function Nat({ step }: { step: number }) {
  const hasRow = step >= 2
  const lookup = step === 4
  return (
    <div className="nat">
      <div className="nat-net">
        <section className="nat-lan">
          <span className="vcaps">Hjemmenet 10.0.0.0/24</span>
          {['10.0.0.1', '10.0.0.2', '10.0.0.3'].map((ip) => (
            <Node
              key={ip}
              className="nat-host"
              title={<span className="mono">{ip}</span>}
              tone={ip === '10.0.0.1' && (step === 1 || step === 4) ? 'focus' : ip === '10.0.0.1' ? 'idle' : 'muted'}
            />
          ))}
        </section>

        <section className="nat-lane nat-lane-l">
          <Card n={1} step={step} />
          <Card n={4} step={step} />
        </section>

        <section className="nat-router">
          <Node
            title="NAT-router"
            tone={step === 2 || step === 4 ? 'focus' : 'idle'}
            sub={
              <>
                LAN <span className="mono">10.0.0.4</span>
                <br />
                WAN <span className="mono">138.76.29.7</span>
              </>
            }
          />
        </section>

        <section className="nat-lane nat-lane-r">
          <Card n={2} step={step} />
          <Card n={3} step={step} />
        </section>

        <section className="nat-srv">
          <span className="vcaps">Internettet</span>
          <Node
            className="nat-host"
            title="Webserver"
            sub={<span className="mono">128.119.40.186, port 80</span>}
            tone={step === 2 || step === 3 ? 'focus' : 'idle'}
          />
        </section>
      </div>

      <section className="nat-table" data-lookup={lookup || undefined}>
        <div className="nat-table-name">NAT translation table</div>
        <div className="nat-grid">
          <span className="nat-th">WAN side</span>
          <span className="nat-th">LAN side</span>
          <motion.span
            className="nat-td mono"
            data-hit={lookup || undefined}
            initial={false}
            animate={{ opacity: hasRow ? 1 : 0 }}
            transition={hasRow ? t.place : t.fade}
          >
            138.76.29.7, 5001
          </motion.span>
          <motion.span
            className="nat-td mono"
            data-hit={lookup || undefined}
            initial={false}
            animate={{ opacity: hasRow ? 1 : 0 }}
            transition={hasRow ? { ...t.place, delay: 0.1 } : t.fade}
          >
            10.0.0.1, 3345
          </motion.span>
        </div>
        <div className="nat-note">
          <motion.span initial={false} animate={{ opacity: step === 0 ? 1 : 0 }} transition={t.fade}>
            tom — ingen forbindelser endnu
          </motion.span>
          <motion.span initial={false} animate={{ opacity: step >= 2 ? 1 : 0 }} transition={t.fade}>
            <Tag tone="focus">ny række</Tag> kildeport 3345 → 5001
          </motion.span>
          <motion.span initial={false} animate={{ opacity: step >= 4 ? 1 : 0 }} transition={t.fade}>
            <Tag tone="focus">opslag</Tag> destination 138.76.29.7, 5001 → 10.0.0.1, 3345
          </motion.span>
        </div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-nat-ipv6',
  title: 'NAT-routeren omskriver ud og ind',
  steps: [
    {
      caption:
        'Hjemmenettet bruger private adresser `10.0.0.0/24`. Udadtil har NAT-routeren kun én adresse, `138.76.29.7`. Oversættelsestabellen er tom.',
      hold: 2400,
    },
    {
      caption: 'Host `10.0.0.1` beder webserveren om en side og vælger selv kildeport `3345`: datagram **1**.',
      hold: 2200,
    },
    {
      caption:
        'Routeren vælger en ledig port, `5001`, skriver sin WAN-adresse som kilde og gemmer koblingen i tabellen. Datagram **2** går ud på internettet.',
      hold: 3000,
    },
    {
      caption: 'Serveren aner intet om NAT og svarer til `138.76.29.7, 5001`: datagram **3**.',
      hold: 2200,
    },
    {
      caption:
        'Routeren slår **destinations-IP og -port** op i tabellen, omskriver til `10.0.0.1, 3345` og sender datagram **4** ind i hjemmenettet.',
      hold: 3000,
    },
  ],
  Component: Nat,
}

export default viz
