import { motion } from 'motion/react'
import { useId } from 'react'
import type { VizDef } from '../kit/types'
import { Token } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './arkitekturproces.css'

/* 1-SW-Architecture - Process 1.pdf (PDF-sider): s. 19–21 (User/Business/System),
   s. 41 (Microsofts proces: “1. Identify Architecture Objectives” over hjulet 2–5,
   pile begge veje, “Iterative and incremental.”, “Test against: requirements ·
   known constraints · quality attributes”, kilde MS Application Architecture Guide,
   2nd Ed.), s. 48 (“This is where use cases and quality attributes meet!”), s. 56
   (“Can I add support for a new client type?”), s. 59–60 (baseline, architectural
   spike), s. 66 (kvantificeringen, ordret).
   2-SW-Architecture - Process 2.pdf: s. 61 (“Videoflix key scenarios from Tuesday”,
   de fire krav ordret), s. 62 (key scenario ordret), s. 63 (“Videoflix prototype
   quality attributes”; de to tomme rækker er udeladt), s. 65 (trin 3-indholdet).
   Materialet vælger ikke en stil for VideoFlix; trin 3 peger kun videre. */

const REQS = [
  { n: '1', who: 'User', text: 'The system have to stream with the same speed at any time' },
  { n: '2', who: 'Business', text: 'System should always be up.' },
  { n: '3', who: 'System', text: 'The system can facilitate 1 million users at the same time' },
  { n: '4', who: 'System', text: 'The system must have close to 100% uptime, to allow the users to watch movie at any time.' },
]
/** Landingspladser i Venn-diagrammet (procent af viewBox 240 × 172). */
const LAND: Record<string, [number, number]> = {
  '1': [22, 36],
  '2': [78, 36],
  '3': [43, 88],
  '4': [57, 88],
}

const QA = [
  { cat: 'Usability / Performance', req: 'Start streaming within 5 seconds of click', on: true },
  { cat: 'Scalability', req: '1.000.000 users should be able to stream at the same time', on: true },
  { cat: '(Compatibility)', req: '', on: false },
  { cat: 'Performance', req: 'Start a new server when there is no response to requests in more than 3 seconds.', on: true },
  { cat: '(Security)', req: 'Movies should be protected', on: false },
  { cat: '(Performance)', req: '', on: false },
  { cat: '(Usability)', req: 'Must be learnable within 5 minutes of use of the average user.', on: false },
]

const show = (on: boolean, delay = 0) => ({
  initial: false as const,
  animate: on ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 },
  transition: on ? { ...t.settle, delay } : t.fade,
})

/* ------------------------------- Venn ------------------------------- */

function Venn({ step }: { step: number }) {
  const id = useId().replace(/:/g, '')
  const lit = step >= 1
  return (
    <div className="apr-venn">
      <svg viewBox="0 0 240 172" aria-hidden="true">
        <defs>
          <clipPath id={`${id}-b`}>
            <circle cx={154} cy={58} r={52} />
          </clipPath>
          <clipPath id={`${id}-s`}>
            <circle cx={120} cy={116} r={52} />
          </clipPath>
        </defs>
        <circle className="apr-c apr-c-u" cx={86} cy={58} r={52} />
        <circle className="apr-c apr-c-b" cx={154} cy={58} r={52} />
        <circle className="apr-c apr-c-s" cx={120} cy={116} r={52} />
        <g clipPath={`url(#${id}-b)`}>
          <g clipPath={`url(#${id}-s)`}>
            <motion.circle
              className="apr-core"
              cx={86}
              cy={58}
              r={52}
              initial={false}
              animate={{ opacity: lit ? 1 : 0 }}
              transition={lit ? { ...t.fade, delay: 0.8 } : t.fade}
            />
          </g>
        </g>
        <text className="apr-vl" x={62} y={36}>
          User
        </text>
        <text className="apr-vl" x={172} y={36}>
          Business
        </text>
        <text className="apr-vl" x={120} y={138}>
          System
        </text>
      </svg>
      {step >= 1 &&
        REQS.map((r) => (
          <span key={r.n} className="apr-land" style={{ left: `${LAND[r.n][0]}%`, top: `${LAND[r.n][1]}%` }}>
            <Token id={`apr-req-${r.n}`} tone="focus">
              {r.n}
            </Token>
          </span>
        ))}
    </div>
  )
}

/* ------------------------------- Hjulet ------------------------------ */

const CX = 140
const CY = 178
const R = 80
const pt = (deg: number) => [CX + R * Math.cos((deg * Math.PI) / 180), CY + R * Math.sin((deg * Math.PI) / 180)]
function arc(a: number, b: number) {
  const [x1, y1] = pt(a)
  const [x2, y2] = pt(b)
  return `M${x1.toFixed(1)} ${y1.toFixed(1)} A${R} ${R} 0 0 1 ${x2.toFixed(1)} ${y2.toFixed(1)}`
}
/** Pilespids i slutpunktet, rettet langs tangenten (med uret). */
function arcHead(b: number) {
  const [x, y] = pt(b)
  const rad = (b * Math.PI) / 180
  const tx = -Math.sin(rad)
  const ty = Math.cos(rad)
  const nx = Math.cos(rad)
  const ny = Math.sin(rad)
  const a = 7
  const w = 4.5
  return `M${(x - tx * a + nx * w).toFixed(1)} ${(y - ty * a + ny * w).toFixed(1)} L${x.toFixed(1)} ${y.toFixed(1)} L${(x - tx * a - nx * w).toFixed(1)} ${(y - ty * a - ny * w).toFixed(1)} Z`
}

interface StageBox {
  n: number
  cx: number
  cy: number
  w: number
  lines: string[]
}
const STAGES: StageBox[] = [
  { n: 2, cx: CX, cy: CY - R, w: 112, lines: ['2. Identify Key', 'Scenarios'] },
  { n: 3, cx: CX + R, cy: CY, w: 118, lines: ['3. Create', 'Application Overview'] },
  { n: 4, cx: CX, cy: CY + R, w: 112, lines: ['4. Identify Key', 'Issues'] },
  { n: 5, cx: CX - R, cy: CY, w: 118, lines: ['5. Define', 'Candidate Solutions'] },
]
const ARCS: [number, number][] = [
  [-50, -17],
  [17, 50],
  [130, 163],
  [197, 230],
]

function Wheel({ step }: { step: number }) {
  const on = step >= 4
  const hot = (n: number) => (step === 4 && (n === 2 || n === 3)) || (step === 5 && (n === 4 || n === 5))
  return (
    <div className="apr-wheel">
      <motion.svg viewBox="0 0 280 282" aria-hidden="true" initial={false} animate={{ opacity: on ? 1 : 0.28 }} transition={t.recede}>
        <g className="apr-st apr-st-1" data-hot={step === 4 || undefined}>
          <rect x={36} y={2} width={208} height={38} rx={6} />
          <text x={140} y={17}>
            <tspan x={140}>1. Identify Architecture</tspan>
            <tspan x={140} dy="1.2em">
              Objectives
            </tspan>
          </text>
        </g>
        <g className="apr-io" data-hot={step === 5 || undefined}>
          <path d="M124 44 V76" />
          <path className="apr-io-h" d="M119.5 70 L124 78 L128.5 70 Z" />
          <path d="M156 78 V46" />
          <path className="apr-io-h" d="M151.5 52 L156 44 L160.5 52 Z" />
        </g>
        <circle className="apr-ring" cx={CX} cy={CY} r={R} />
        {ARCS.map(([a, b], i) => (
          <g key={i} className="apr-arc">
            <path d={arc(a, b)} />
            <path className="apr-arc-h" d={arcHead(b)} />
          </g>
        ))}
        {/* Markøren kører rundt: 2 → 3 → 4 → 5 → 2 */}
        <motion.g
          initial={false}
          animate={{ rotate: step >= 5 ? 360 : 0 }}
          transition={step >= 5 ? { ...t.travel, duration: 2.4, delay: 0.2 } : t.fade}
        >
          <circle cx={CX} cy={CY} r={R + 6} fill="none" stroke="none" />
          <motion.circle
            className="apr-marker"
            cx={CX}
            cy={CY - R}
            r={5}
            initial={false}
            animate={{ opacity: on ? 1 : 0 }}
            transition={t.fade}
          />
        </motion.g>
        {STAGES.map((s) => (
          <g key={s.n} className="apr-st" data-hot={hot(s.n) || undefined}>
            <rect x={s.cx - s.w / 2} y={s.cy - 18} width={s.w} height={36} rx={6} />
            <text x={s.cx} y={s.cy - 3.5}>
              <tspan x={s.cx}>{s.lines[0]}</tspan>
              <tspan x={s.cx} dy="1.2em">
                {s.lines[1]}
              </tspan>
            </text>
          </g>
        ))}
      </motion.svg>
      {step >= 4 && (
        <>
          <span className="apr-in apr-in-qa">
            <Token id="apr-qa" tone="idle">
              QA
            </Token>
          </span>
          <span className="apr-in apr-in-ks">
            <Token id="apr-ks" tone="idle">
              key scenario
            </Token>
          </span>
        </>
      )}
    </div>
  )
}

/* ------------------------------- Figur ------------------------------- */

function Arrow({ on }: { on: boolean }) {
  return (
    <motion.div className="apr-arrow" aria-hidden="true" initial={false} animate={{ opacity: on ? 1 : 0.25 }} transition={t.fade}>
      <svg viewBox="0 0 16 16">
        <path d="M2 8 H13 M9 4 L13 8 L9 12" />
      </svg>
    </motion.div>
  )
}

function Process({ step }: { step: number }) {
  return (
    <div className="apr">
      {/* 1. Krav → key scenario */}
      <section className="apr-col">
        <div className="vcaps apr-head">Krav fra tre interessenter</div>
        <Venn step={step} />
        <ol className="apr-reqs">
          {REQS.map((r) => (
            <li key={r.n} className="apr-req" data-in={step >= 1 || undefined}>
              <span className="apr-badge">
                {r.n}
                {step === 0 && (
                  <span className="apr-badge-tok">
                    <Token id={`apr-req-${r.n}`} tone="focus" launch>
                      {r.n}
                    </Token>
                  </span>
                )}
              </span>
              <span className="apr-req-body">
                <b>{r.who}</b> {r.text}
              </span>
            </li>
          ))}
        </ol>
        <motion.div className="apr-ks" data-hot={step === 1 || undefined} {...show(step >= 1, 1.1)}>
          <div className="apr-ks-head">
            <span className="vcaps">Key scenario</span>
            {step >= 1 && step < 4 && (
              <Token id="apr-ks" tone="idle">
                key scenario
              </Token>
            )}
          </div>
          <p>
            “Here, the key scenario for the prototype is to stream video to a lot of users, in a good-enough quality and to
            do so, share the load on multiple servers so we have little to no downtime.”
          </p>
        </motion.div>
      </section>

      <Arrow on={step >= 2} />

      {/* 2. Kvantificering → QA-tabel */}
      <section className="apr-col">
        <div className="vcaps apr-head">Målbare quality attributes</div>
        <div className="apr-quant">
          <motion.div className="apr-q apr-q-neg" data-struck={step >= 2 || undefined} {...show(step >= 2)}>
            <p className="apr-q-text">“VideoFlix has to stream to a lot of viewers at the same time”</p>
            <p className="apr-q-note">← “You can’t measure that…”</p>
          </motion.div>
          <motion.div className="apr-q apr-q-ok" data-hot={step === 2 || undefined} {...show(step >= 2, 0.9)}>
            <p className="apr-q-text">“VideoFlix has to stream the test video clip to 100.000 viewers in 1080p@30fps”</p>
            <p className="apr-q-note">← “This is measurable, even though it may be hard to execute the test.”</p>
          </motion.div>
        </div>
        <motion.div className="apr-qa" {...show(step >= 3)}>
          <div className="apr-qa-row apr-qa-th" role="presentation">
            <span>Quality attribute (category)</span>
            <span>Non-functional requirement</span>
            <span>How to test?</span>
          </div>
          {QA.map((r, i) => (
            <motion.div
              key={i}
              className="apr-qa-row"
              data-on={r.on || undefined}
              initial={false}
              animate={{ opacity: step >= 3 ? 1 : 0 }}
              transition={step === 3 ? stagger(i, 0.2, 0.12) : t.fade}
            >
              <span className="apr-qa-cat">{r.cat}</span>
              <span className="apr-qa-req" data-empty={!r.req || undefined}>
                {r.req || <span className="apr-qa-empty">–</span>}
              </span>
              <span className="apr-qa-test">
                <span className="apr-qa-test-l">How to test? (tom)</span>
                <span className="apr-qa-test-q">?</span>
              </span>
            </motion.div>
          ))}
          <div className="apr-qa-foot">
            <span>Attributes in parentheses are important but not considered for the prototype.</span>
            {step === 3 && (
              <Token id="apr-qa" tone="idle">
                QA
              </Token>
            )}
          </div>
        </motion.div>
      </section>

      <Arrow on={step >= 4} />

      {/* 3. Microsofts fem trin */}
      <section className="apr-col">
        <div className="vcaps apr-head">Microsofts proces</div>
        <Wheel step={step} />
        <ul className="apr-notes">
          <motion.li data-hot={step === 4 || undefined} {...show(step >= 4, 0.6)}>
            <span className="apr-notes-n">3</span>
            <span>
              <b>Application type</b> (mobile, web, service, embedded, … ?) · <b>Deployment constraints</b> (infrastructure;
              quality attributes: security, reliability, scaleability, performance) · <b>Architectural style(s)</b> → se{' '}
              <i>architectural styles</i> · <b>Technologies</b>
            </span>
          </motion.li>
          <motion.li data-hot={step === 5 || undefined} {...show(step >= 5, 0.9)}>
            <span className="apr-notes-n">4</span>
            <span>“Can I add support for a new client type?”</span>
          </motion.li>
          <motion.li data-hot={step === 5 || undefined} {...show(step >= 5, 1.5)}>
            <span className="apr-notes-n">5</span>
            <span>Evaluate against “baseline” architecture · architectural spike</span>
          </motion.li>
          <motion.li className="apr-notes-test" {...show(step >= 5, 2.4)}>
            <span className="apr-notes-n">↻</span>
            <span>
              <b>Iterative and incremental.</b> Test against: requirements · known constraints · quality attributes
            </span>
          </motion.li>
        </ul>
        <div className="apr-src">Microsoft Application Architecture Guide, 2nd Ed.</div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'arkitekturproces',
  title: 'Fra VideoFlix-krav til arkitektur',
  steps: [
    { caption: 'Kravene til VideoFlix kommer fra tre interessenter: **user**, **business** og **system**.', hold: 2400 },
    { caption: 'Key scenariet findes i overlappet — der, hvor use cases og quality attributes mødes.', hold: 3000 },
    { caption: 'Et ønske bliver et quality attribute, når det kan **måles**.', hold: 2800 },
    { caption: 'Prototypens quality attributes — dem i parentes venter til en senere iteration.', hold: 2800 },
    { caption: 'Trin 3 vælger stil og teknologi ud fra scenariet og kravene.', hold: 3000 },
    {
      caption:
        'Processen er **iterativ og inkrementel**: hver iteration testes mod requirements, known constraints og quality attributes.',
      hold: 3000,
    },
    {
      caption:
        'Fra krav over key scenario og målbare quality attributes til Microsofts fem trin — hvor trin 3 vælger arkitekturstil.',
      hold: 2600,
    },
  ],
  Component: Process,
}

export default viz
