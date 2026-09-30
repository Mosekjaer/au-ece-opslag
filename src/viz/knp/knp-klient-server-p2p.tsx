import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './knp-klient-server-p2p.css'

/* Kurose & Ross s. 168–170: distributionstid for klient-server (lign. 2.1) og
   P2P (lign. 2.3). Parametrene er bogens fra fig. 2.23: F/u = 1 time, u_s = 10u,
   d_min ≥ u_s. Bogen tegner kun kurverne; værdierne herunder er regnet ud af
   formlerne med de parametre:
     D_cs  = max(N·F/u_s, F/d_min) = N/10 time
     D_P2P = max(F/u_s, F/d_min, N·F/(u_s + N·u)) = max(0,1; N/(10 + N)) time
   N-værdierne 5, 10, 20, 30 er valgt inden for bogens akse (0–35). */

const MAX = 3.5 // timer, bogens y-akse i fig. 2.23

const ROWS = [
  { n: 5, cs: 0.5, csL: '30 min', p2p: 5 / 15, p2pL: '20 min' },
  { n: 10, cs: 1, csL: '1 t', p2p: 10 / 20, p2pL: '30 min' },
  { n: 20, cs: 2, csL: '2 t', p2p: 20 / 30, p2pL: '40 min' },
  { n: 30, cs: 3, csL: '3 t', p2p: 30 / 40, p2pL: '45 min' },
]

const pct = (h: number) => `${(h / MAX) * 100}%`

function Bar({ value, label, show, tone, i }: { value: number; label: string; show: boolean; tone: 'cs' | 'p2p'; i: number }) {
  return (
    <div className="kcp-track">
      <motion.div
        className="kcp-bar"
        data-kind={tone}
        style={{ width: pct(value) }}
        initial={false}
        animate={{ scaleX: show ? 1 : 0 }}
        transition={show ? stagger(i, 0.1, 0.12) : t.fade}
      />
      <motion.span
        className="kcp-val"
        style={{ left: pct(value) }}
        initial={false}
        animate={{ opacity: show ? 1 : 0 }}
        transition={show ? { ...t.fade, delay: 0.35 + i * 0.12 } : t.fade}
      >
        {label}
      </motion.span>
    </div>
  )
}

function Scaling({ step }: { step: number }) {
  const cs = at(step, 1)
  const p2p = at(step, 2)
  const hour = at(step, 3)

  return (
    <div className="kcp">
      <div className="kcp-formulas">
        <div className="kcp-f" data-on={step === 1 || step >= 3 || undefined} data-kind="cs">
          <span className="vcaps">Klient-server · lign. 2.1</span>
          <code>
            D<sub>cs</sub> = max{'{'} NF/u<sub>s</sub> , F/d<sub>min</sub> {'}'}
          </code>
          <span className="kcp-note">serveren sender N hele kopier</span>
        </div>
        <div className="kcp-f" data-on={step >= 2 || undefined} data-kind="p2p">
          <span className="vcaps">P2P · lign. 2.3</span>
          <code>
            D<sub>P2P</sub> = max{'{'} F/u<sub>s</sub> , F/d<sub>min</sub> , NF/(u<sub>s</sub> + Σu<sub>i</sub>) {'}'}
          </code>
          <span className="kcp-note">hver peer uploader også</span>
        </div>
      </div>

      <div className="kcp-params">
        <Tag tone="idle">
          <span>F/u = 1 time</span>
        </Tag>
        <Tag tone="idle">
          <span>
            u<sub>s</sub> = 10u
          </span>
        </Tag>
        <Tag tone="idle">
          <span>
            d<sub>min</sub> ≥ u<sub>s</sub>
          </span>
        </Tag>
      </div>

      <div className="kcp-chart">
        <div className="kcp-overlay" aria-hidden>
          <motion.div
            className="kcp-hour"
            style={{ left: pct(1) }}
            initial={false}
            animate={{ opacity: hour ? 1 : 0 }}
            transition={t.fade}
          >
            <span>1 time</span>
          </motion.div>
        </div>
        {ROWS.map((r, i) => (
          <div className="kcp-row" key={r.n}>
            <span className="kcp-n" style={{ gridRow: i + 2 }}>
              N = {r.n}
            </span>
            <div className="kcp-bars" style={{ gridRow: i + 2 }}>
              <Bar value={r.cs} label={r.csL} show={cs} tone="cs" i={i} />
              <Bar value={r.p2p} label={r.p2pL} show={p2p} tone="p2p" i={i} />
            </div>
          </div>
        ))}
        <div className="kcp-legend">
          <span className="kcp-key" data-kind="cs">
            klient-server
          </span>
          <span className="kcp-key" data-kind="p2p">
            P2P
          </span>
          <span className="kcp-axis">skala 0–3,5 t som bogens fig. 2.23</span>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-klient-server-p2p',
  title: 'Distributionstid for én fil til N peers',
  steps: [
    {
      caption:
        'Én server skal have en fil på F bit ud til N peers. Bogens parametre: en peer uploader hele filen på **1 time**, og serveren uploader **10 gange så hurtigt**.',
      hold: 2400,
    },
    {
      caption:
        '**Klient-server**: serveren skal selv sende N kopier, så tiden er `NF/u_s` = N/10 time. Den vokser **lineært** med N — 30 peers tager 3 timer.',
      hold: 3000,
    },
    {
      caption:
        '**P2P**: serveren skal kun sende hver bit én gang, og hver ny peer lægger sin upload-rate til nævneren `u_s + Σu_i`. Tiden flader ud.',
      hold: 3000,
    },
    {
      caption:
        'P2P er altid hurtigst og holder sig **under 1 time** for alle N. Det er *self-scalability*: peers er både forbrugere og videresendere af bits.',
      hold: 3000,
    },
  ],
  Component: Scaling,
}

export default viz
