import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './test-pyramid.css'

/* ExchangeRates-eksemplet fra Unit/Integration Testing Controllers.pdf og
   Postman-slides: samme system, tre testniveauer, og for hvert niveau hvad
   der er ægte, og hvad der er erstattet. Til sidst Horsdals pyramide. */

type LayerId = 'http' | 'pipe' | 'ctrl' | 'conv' | 'db'
const LAYERS: { id: LayerId; name: ReactNode }[] = [
  { id: 'http', name: 'HTTP-klient' },
  { id: 'pipe', name: 'Middleware-pipeline' },
  { id: 'ctrl', name: <code>Currency&shy;Controller</code> },
  { id: 'conv', name: <code>ICurrency&shy;Converter</code> },
  { id: 'db', name: 'Database' },
]

type Kind = 'real' | 'fake' | 'none'
const real = ['real', 'ægte'] as const
const none = ['none', '—'] as const

const LEVELS: { name: string; tool: ReactNode; cells: Record<LayerId, readonly [Kind, string]> }[] = [
  {
    name: 'Unit',
    tool: 'xUnit + Moq',
    cells: { http: none, pipe: none, ctrl: real, conv: ['fake', 'Mock'], db: none },
  },
  {
    name: 'Integration',
    tool: <code>Web&shy;Application&shy;Factory</code>,
    cells: { http: ['fake', 'in-memory'], pipe: real, ctrl: real, conv: real, db: ['fake', 'SQLite'] },
  },
  {
    name: 'API',
    tool: 'Postman',
    cells: { http: real, pipe: real, ctrl: real, conv: real, db: real },
  },
]

const layerTone = (k: Kind): Tone => (k === 'real' ? 'focus' : k === 'fake' ? 'ghost' : 'muted')

const CARDS: { head: ReactNode; lines: string[] }[] = [
  {
    head: 'Systemet under test',
    lines: ['[HttpGet]', 'Convert(ExchangeInputModel model)', '  return _converter.ConvertToGbp(…);'],
  },
  {
    head: 'Unit test · xUnit + Moq',
    lines: [
      'mock.Setup(m => m.ConvertToGbp(…))',
      '    .Returns(3);',
      'new CurrencyController(mock.Object)',
      'Assert.Equal(3, result.Value);',
    ],
  },
  {
    head: <>Integrationstest · <code>WebApplicationFactory&lt;Program&gt;</code></>,
    lines: [
      'HttpClient client = _factory.CreateClient();',
      'await client.PutAsync("/api/currency", content);',
      '// SQLite "DataSource=:memory:"',
      'context.Database.EnsureCreated();',
    ],
  },
  {
    head: 'API-test · Postman',
    lines: ['pm.test("Status code is 200", function () {', '    pm.response.to.have.status(200);', '});'],
  },
]

const BANDS = [
  { name: 'System tests', what: 'hele systemet, via GUI (end-to-end)', real: 'alt, også GUI’en' },
  { name: 'Service tests', what: 'én hel service udefra (API-test)', real: 'alt — Postman over HTTP' },
  {
    name: 'Unit tests',
    what: 'en lille del af én service, in-process',
    real: 'Moq: kun controlleren · WebApplicationFactory: app, DI og pipeline',
  },
]

function Matrix({ step }: { step: number }) {
  const cur = step >= 1 && step <= 3 ? step - 1 : -1
  return (
    <div className="tp-matrix">
      <div className="tp-corner vcaps">Lag</div>
      {LEVELS.map((lv, c) => (
        <div key={lv.name} className="tp-colhead" data-on={at(step, c + 1)} data-now={c === cur}>
          <span className="tp-colname">{lv.name}</span>
          <span className="tp-tool">{lv.tool}</span>
        </div>
      ))}
      {LAYERS.map((layer) => (
        <div key={layer.id} className="tp-row">
          <div className="tp-layer" data-tone={cur >= 0 ? layerTone(LEVELS[cur].cells[layer.id][0]) : 'idle'}>
            {layer.name}
          </div>
          {LEVELS.map((lv, c) => {
            const [kind, label] = lv.cells[layer.id]
            const shown = at(step, c + 1)
            return (
              <motion.span
                key={lv.name}
                className="tp-cell"
                data-kind={kind}
                data-now={c === cur}
                initial={false}
                animate={{ opacity: shown ? (cur >= 0 && c !== cur ? 0.55 : 1) : 0, scale: shown ? 1 : 0.9 }}
                transition={shown ? stagger(LAYERS.findIndex((l) => l.id === layer.id), 0.1) : t.fade}
              >
                {label}
              </motion.span>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function Panel({ step }: { step: number }) {
  const card = Math.min(step, 3)
  const pyramid = at(step, 4)
  return (
    <div className="tp-panel">
      {CARDS.map((c, i) => (
        <motion.div
          key={i}
          className="tp-card"
          aria-hidden={pyramid || i !== card || undefined}
          initial={false}
          animate={{ opacity: !pyramid && i === card ? 1 : 0, y: !pyramid && i === card ? 0 : 6 }}
          transition={t.settle}
        >
          <div className="tp-card-head">{c.head}</div>
          <pre className="tp-code">{c.lines.join('\n')}</pre>
        </motion.div>
      ))}
      <div className="tp-pyramid" aria-hidden={!pyramid || undefined}>
        {BANDS.map((b, i) => (
          <motion.div
            key={b.name}
            className="tp-band"
            data-level={i}
            initial={false}
            animate={{ opacity: pyramid ? 1 : 0, y: pyramid ? 0 : 8 }}
            transition={pyramid ? stagger(BANDS.length - i, 0.05, 0.12) : t.fade}
          >
            <span className="tp-band-name">{b.name}</span>
            <span className="tp-band-what">{b.what}</span>
            <motion.span className="tp-band-real" initial={false} animate={{ opacity: at(step, 5) ? 1 : 0 }} transition={t.fade}>
              <Tag tone={i === 0 ? 'idle' : 'focus'}>ægte</Tag> {b.real}
            </motion.span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function TestPyramid({ step }: { step: number }) {
  return (
    <div className="tp">
      <Matrix step={step} />
      <Panel step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'test-pyramid',
  title: 'Hvad er ægte, og hvad er falsk?',
  steps: [
    {
      caption: 'Systemet under test: en anmodning går fra klienten gennem pipelinen til `CurrencyController`, der kalder `ICurrencyConverter`.',
      hold: 2200,
    },
    {
      caption:
        '**Unit test**: kun `CurrencyController` er ægte. Konverteren er en **mock**, der altid svarer `3`, og testen kalder `Convert` direkte — ingen HTTP, ingen pipeline.',
      hold: 3000,
    },
    {
      caption:
        '**Integrationstest**: `WebApplicationFactory<Program>` kører den rigtige app med dens DI og middleware i hukommelsen. Klienten er in-memory, og databasen kan byttes til SQLite med `EnsureCreated()`.',
      hold: 3000,
    },
    {
      caption: '**API-test** i Postman: alt er ægte, og testen står udenfor og taler HTTP. Den er ligeglad med, om backenden er skrevet i C#.',
      hold: 2600,
    },
    {
      caption:
        'Horsdals pyramide: nederst **unit tests**, der kalder koden in-process (han kalder dem også integrationstests), i midten **service tests** af én hel service, øverst **system tests**.',
      hold: 3000,
    },
    {
      caption: 'Jo højere op, jo mere er ægte. Prisen: tests med de rigtige komponenter kræver mere kode og tager længere tid at køre.',
      hold: 2600,
    },
  ],
  Component: TestPyramid,
}

export default viz
