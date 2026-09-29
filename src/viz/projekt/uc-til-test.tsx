import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './uc-til-test.css'

/* Use case-diagram og fully dressed "Sæt alarm" er fra
   L3_Specification_FunctionalKrav_UC (Updated).pdf slide 41 (ordret, forkortet i
   visningen). Accepttestskabelonen er System Test.pdf slide 29–30. Selve testcasene er
   guidens udledning: materialet har ingen løsning til en accepttest af "Sæt alarm". */

const UCS = ['Indstil tid', 'Sæt alarm', 'Stop alarm']

const MAIN = [
  { n: 1, who: 'a', text: 'Bruger trykker på ALARM' },
  { n: 2, who: 's', text: 'Urets display viser tidligere alarm', ext: '[Extension 1a]' },
  { n: 3, who: 'a', text: 'Bruger trykker på henholdsvis HOUR og MIN' },
  { n: 4, who: 's', text: 'Uret optæller time og minut visningen for alarm' },
  { n: 5, who: 'a', text: 'Bruger trykker på ALARM for at afslutte indstillingen' },
  { n: 6, who: 's', text: 'Uret skifter tilbage til at vise klokken' },
]

const TC1 = [
  { s: 1, h: 'Tryk på ALARM', f: 'Display viser den tidligere alarm', uc: '1–2' },
  { s: 2, h: 'Tryk på HOUR og MIN', f: 'Alarmvisningen tæller time og minut op', uc: '3–4' },
  { s: 3, h: 'Tryk på ALARM', f: 'Uret viser klokken; alarmen er sat til den valgte tid', uc: '5–6, post' },
]
const TC2 = [{ s: 1, h: 'Tryk på ALARM', f: 'Alarmindstillingen starter ved 00:00', uc: '1, 1a' }]

function Diagram({ step }: { step: number }) {
  return (
    <div className="uct-diagram">
      <div className="uct-actor">
        <svg className="uct-stick" viewBox="0 0 24 34" aria-hidden="true">
          <circle cx="12" cy="5" r="4" />
          <path d="M12 9 V21 M3 13 H21 M12 21 L5 32 M12 21 L19 32" />
        </svg>
        <span>Bruger</span>
      </div>
      <svg className="uct-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
        {UCS.map((u, i) => (
          <line key={u} x1={22} y1={50} x2={42} y2={20 + i * 30} data-hot={(i === 1 && at(step, 1)) || undefined} />
        ))}
      </svg>
      <div className="uct-boundary">
        <span className="uct-sys">ClockAlarm</span>
        {UCS.map((u, i) => (
          <div key={u} className="uct-uc" style={{ top: `${20 + i * 30}%` }} data-hot={(i === 1 && at(step, 1)) || undefined} data-dim={(i !== 1 && at(step, 1)) || undefined}>
            {u}
          </div>
        ))}
      </div>
    </div>
  )
}

function UcText({ step }: { step: number }) {
  const on = at(step, 1)
  const mapping = step === 3
  return (
    <motion.div className="uct-uctext" initial={false} animate={{ opacity: on ? 1 : 0.25 }} transition={t.fade}>
      <div className="uct-kv">
        <span>Prækondition</span>
        <b data-hot={step === 2 || undefined}>Uret er tændt og operationel</b>
      </div>
      <ol className="uct-main">
        {MAIN.map((m) => (
          <li key={m.n} data-who={m.who} data-map={mapping || undefined}>
            <span className="uct-n">{m.n}.</span>
            <span>
              {m.text}
              {m.ext && (
                <span className="uct-ext" data-hot={step === 4 || undefined}>
                  {m.ext}
                </span>
              )}
            </span>
            <span className="uct-role">{mapping ? (m.who === 'a' ? '→ Handling' : '→ Forventet') : ''}</span>
          </li>
        ))}
      </ol>
      <div className="uct-kv">
        <span>Extension 1a</span>
        <b data-hot={step === 4 || undefined}>Ingen tidligere alarm: indstillingen starter ved 00:00</b>
      </div>
      <div className="uct-kv">
        <span>Postkondition</span>
        <b data-hot={step === 3 || undefined}>Alarmen er sat til den ønskede tid</b>
      </div>
    </motion.div>
  )
}

function TestCase({
  id,
  scen,
  pre,
  rows,
  show,
  rowsOn,
  now,
}: {
  id: string
  scen: string
  pre: string
  rows: typeof TC1
  show: boolean
  rowsOn: boolean
  now: boolean
}) {
  return (
    <motion.div
      className="uct-tc"
      data-now={now || undefined}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : 6 }}
      transition={show ? t.settle : t.fade}
    >
      <div className="uct-tc-head">
        <span className="uct-tc-id">{id}</span>
        <span>
          <em>Use case under test:</em> Sæt alarm
        </span>
        <span>
          <em>Scenarie:</em> {scen}
        </span>
        <span>
          <em>Prækondition:</em> {pre}
        </span>
      </div>
      <div className="uct-trow uct-thead" aria-hidden="true">
        <span>Step</span>
        <span>Handling</span>
        <span>Forventet observation</span>
        <span>UC-trin</span>
        <span className="uct-run">Faktisk</span>
        <span className="uct-run">OK/FAIL</span>
      </div>
      {rows.map((r, i) => (
        <motion.div
          key={r.s}
          className="uct-trow"
          initial={false}
          animate={{ opacity: rowsOn ? 1 : 0 }}
          transition={rowsOn ? stagger(i, 0.15, 0.25) : t.fade}
        >
          <span className="uct-s">{r.s}</span>
          <span className="uct-h">{r.h}</span>
          <span className="uct-f">{r.f}</span>
          <span className="uct-uc-ref">UC {r.uc}</span>
          <span className="uct-run uct-blank">—</span>
          <span className="uct-run uct-blank">—</span>
        </motion.div>
      ))}
    </motion.div>
  )
}

function UcTilTest({ step }: { step: number }) {
  return (
    <div className="uct">
      <div className="uct-top">
        <div className="uct-panel">
          <span className="vcaps">1 · Use case-diagram</span>
          <Diagram step={step} />
        </div>
        <div className="uct-panel">
          <span className="vcaps">2 · Fully dressed: Sæt alarm</span>
          <UcText step={step} />
        </div>
      </div>

      <div className="uct-panel">
        <span className="vcaps">3 · Accepttestcases</span>
        <div className="uct-tcs">
          <TestCase
            id="TC1"
            scen="Hovedscenarie"
            pre="Uret er tændt og operationel"
            rows={TC1}
            show={at(step, 2)}
            rowsOn={at(step, 3)}
            now={step === 2 || step === 3}
          />
          <TestCase
            id="TC2"
            scen="Extension 1a: Ingen tidligere alarm"
            pre="Uret er tændt og operationel; ingen alarm er sat"
            rows={TC2}
            show={at(step, 4)}
            rowsOn={at(step, 4)}
            now={step === 4}
          />
        </div>
        <p className="uct-note">Faktisk observation og vurdering udfyldes, når testen køres. Testcasene er guidens udledning.</p>
      </div>

      <div className="uct-trace">
        <Tag tone="focus" show={at(step, 5)}>
          Hovedscenarie → TC1
        </Tag>
        <Tag tone="focus" show={at(step, 5)}>
          Extension 1a → TC2
        </Tag>
        <Tag tone="idle" show={at(step, 5)} wrap>
          hver vej gennem use casen har sin testcase
        </Tag>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'uc-til-test',
  title: 'Fra use case-diagram til accepttestcase for “Sæt alarm”',
  steps: [
    { caption: 'Vækkeurets use case-diagram (slide 41): én aktør og tre use cases. Diagrammet er indholdsfortegnelsen.', hold: 2200 },
    {
      caption: 'Ellipsen *Sæt alarm* peger på sin fully dressed beskrivelse: prækondition, seks trin i hovedscenariet, én udvidelse og en postkondition.',
      hold: 3000,
    },
    {
      caption: 'Testcasens hoved kommer fra use casen: use case under test, **scenarie** (her hovedscenariet) og **prækondition**.',
      hold: 2600,
    },
    {
      caption: 'Aktørens trin bliver **Handling**, systemets svar bliver **Forventet observation**. Sidste række tjekker postkonditionen.',
      hold: 3400,
    },
    {
      caption: 'Udvidelse 1a er en anden vej gennem use casen og får sin **egen testcase** med sin egen prækondition.',
      hold: 3000,
    },
    {
      caption: 'Sporbarheden er komplet: hver vej gennem use casen har præcis én testcase, og hver testcase peger tilbage på sine UC-trin.',
      hold: 3200,
    },
  ],
  Component: UcTilTest,
}

export default viz
