import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, Token } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './knp-forsinkelse-tab-throughput.css'

/* Kilder:
   - Nodal delay ved router A mod router B, de fire komponenter og formlerne:
     «Chapter_1_(… part 2).pdf» slide 3–5 og Kurose & Ross fig. 1.16, s. 65–68.
   - Størrelser: d_proc «typically < msec» (slide 4) / «microseconds or less» (bog s. 66);
     d_queue µs–ms (bog s. 66); d_trans µs–ms (bog s. 67); d_prop få µs på campus til
     hundredvis af ms over geostationær satellit (bog s. 68).
   - Tab ved fuld buffer: slide 3 (del 2) og bog s. 71. Traffic intensity La/R: bog s. 69.
   - Karavanen: 10 biler, 12 s pr. bil, 100 km, 100 km/t → 2 min + 60 min = 62 min: bog s. 67–68.
   - Køens størrelse (fire pladser) og antallet af andre pakker er illustrative. */

type Pos = 'up' | 'proc' | 'q0' | 'q1' | 'q2' | 'q3' | 'link' | 'b'

/** Hvor hver pakke står i hvert trin. `me` er den pakke, vi følger. */
const PLAN: Record<string, Pos[]> = {
  //      0      1       2      3      4       5      6      7
  me: ['up', 'proc', 'q2', 'q2', 'link', 'b', 'b', 'b'],
  o1: ['q0', 'q0', 'q0', 'q0', 'b', 'b', 'b', 'b'],
  o2: ['q1', 'q1', 'q1', 'q1', 'b', 'b', 'b', 'b'],
  o3: ['up', 'up', 'up', 'q3', 'q0', 'q0', 'q0', 'q0'],
}

const ROWS = [
  { id: 'proc', name: 'processing', sym: 'd_proc', what: 'læs header, tjek bitfejl, vælg output-link', size: '< ms (slides) · µs (bog)', at: 1 },
  { id: 'queue', name: 'queuing', sym: 'd_queue', what: 'vent i output-bufferen; afhænger af La/R', size: '0 … µs–ms, varierer', at: 2 },
  { id: 'trans', name: 'transmission', sym: 'd_trans = L/R', what: 'skub alle L bit ud på linket', size: 'µs–ms', at: 4 },
  { id: 'prop', name: 'propagation', sym: 'd_prop = d/s', what: 'én bit løber linkets længde d', size: 'µs (campus) … 100’er ms (satellit)', at: 5 },
] as const

const CARAVAN = [
  { k: 'transmission', v: '10 biler × 12 s = 2 min' },
  { k: 'propagation', v: '100 km ÷ 100 km/t = 60 min' },
  { k: 'i alt', v: '62 min' },
]

function Delay({ step }: { step: number }) {
  const s = Math.min(step, 7)
  const here = (pos: Pos) =>
    Object.entries(PLAN)
      .filter(([, path]) => path[s] === pos)
      .map(([id]) => (
        <Token key={id} id={`kdl-${id}`} tone={id === 'me' ? 'focus' : 'idle'}>
          {id === 'me' ? 'pakke' : '·'}
        </Token>
      ))

  const dropped = s === 3
  const rowTone = (at: number) => (s === at ? 'focus' : s > at || s >= 7 ? 'ok' : 'idle')

  return (
    <div className="kdl">
      <div className="kdl-net">
        <div className="kdl-up">
          <span className="kdl-lbl">fra forrige node</span>
          <div className="kdl-slot">{here('up')}</div>
          <div className="kdl-drop">
            <motion.span
              className="kdl-lost"
              initial={false}
              animate={{ opacity: dropped ? 1 : 0, y: dropped ? 0 : -6 }}
              transition={dropped ? t.place : t.fade}
            >
              <Tag tone="neg">×</Tag> tabt: bufferen er fuld
            </motion.span>
          </div>
        </div>

        <div className="kdl-router">
          <span className="kdl-lbl">router A</span>
          <div className="kdl-inside">
            <div className="kdl-proc" data-tone={s === 1 ? 'focus' : 'idle'}>
              <span className="kdl-mini">behandling</span>
              <div className="kdl-slot">{here('proc')}</div>
            </div>
            <div className="kdl-queue" data-tone={s === 2 || s === 3 ? 'focus' : dropped ? 'neg' : 'idle'}>
              <span className="kdl-mini">kø (output buffer) → link</span>
              <div className="kdl-cells">
                {(['q3', 'q2', 'q1', 'q0'] as Pos[]).map((q) => (
                  <div key={q} className="kdl-cell">
                    {here(q)}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="kdl-link" data-tone={s === 4 || s === 5 ? 'focus' : 'idle'}>
          <span className="kdl-lbl">link (d, R)</span>
          <div className="kdl-wire">
            <div className="kdl-slot">{here('link')}</div>
          </div>
        </div>

        <div className="kdl-b">
          <span className="kdl-lbl">router B</span>
          <div className="kdl-slot is-b">{here('b')}</div>
        </div>
      </div>

      <ol className="kdl-rows">
        {ROWS.map((r, i) => (
          <motion.li
            key={r.id}
            className="kdl-row"
            data-tone={rowTone(r.at)}
            initial={false}
            animate={{ opacity: s >= r.at ? 1 : 0.35 }}
            transition={s >= r.at ? stagger(i, 0, 0.05) : t.fade}
          >
            <span className="kdl-name">{r.name}</span>
            <code className="kdl-sym">{r.sym}</code>
            <span className="kdl-what">{r.what}</span>
            <span className="kdl-size">{r.size}</span>
          </motion.li>
        ))}
      </ol>

      <div className="kdl-foot">
        <motion.div
          className="kdl-car"
          initial={false}
          animate={{ opacity: s >= 6 ? 1 : 0.2 }}
          transition={s >= 6 ? t.settle : t.fade}
        >
          <span className="vcaps">Karavanen: 10 biler = én pakke, betalingsanlæg = router</span>
          <dl>
            {CARAVAN.map((c) => (
              <div key={c.k}>
                <dt>{c.k}</dt>
                <dd>{c.v}</dd>
              </div>
            ))}
          </dl>
        </motion.div>
        <motion.p
          className="kdl-sum"
          initial={false}
          animate={{ opacity: s >= 7 ? 1 : 0 }}
          transition={s >= 7 ? t.place : t.fade}
        >
          <code>d_nodal = d_proc + d_queue + d_trans + d_prop</code>
        </motion.p>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-forsinkelse-tab-throughput',
  title: 'De fire forsinkelser på ét hop',
  steps: [
    { caption: 'En pakke ankommer til router A på vej mod router B. To andre pakker venter allerede i køen.', hold: 2000 },
    {
      caption: '**Processing**: routeren læser headeren, tjekker for bitfejl og vælger output-link. Typisk under et millisekund.',
      hold: 2400,
    },
    {
      caption: '**Queuing**: pakken venter bag de pakker, der kom før. Ventetiden afhænger af trafikken, `La/R`, og svinger fra pakke til pakke.',
      hold: 2800,
    },
    {
      caption: 'Kommer der flere pakker, end linket kan sende, fyldes bufferen. En pakke, der møder en **fuld buffer**, bliver droppet: **tab**.',
      hold: 2800,
    },
    {
      caption: '**Transmission**: nu er det pakkens tur. At skubbe alle L bit ud på linket tager `L/R` — uafhængigt af afstanden.',
      hold: 2600,
    },
    {
      caption: '**Propagation**: hver bit løber linkets længde med hastigheden s. Det tager `d/s` — uafhængigt af pakken og raten.',
      hold: 2600,
    },
    {
      caption: 'Bogens karavane: at ekspedere 10 biler tager **2 min** (transmission), at køre 100 km tager **60 min** (propagation).',
      hold: 3000,
    },
    { caption: 'Summen er forsinkelsen på ét hop. Over hele stien lægges hoppene sammen.', hold: 3000 },
  ],
  Component: Delay,
}

export default viz
