import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './cors.css'

/* Same-origin policy og CORS fra REST principals-slides.
   Frontendens origin og policy-koden er fra REST-slides; API’ets port 7052 er
   den, kursets API kører på i Postman-slides. Preflight (OPTIONS) er ikke pensum. */

const PARTS = [
  { id: 'scheme', label: 'scheme', page: 'https://', api: 'https://', same: true },
  { id: 'host', label: 'host', page: 'localhost', api: 'localhost', same: true },
  { id: 'port', label: 'port', page: ':5173', api: ':7052', same: false },
] as const

type Pos = 'script' | 'gate' | 'api'

function frame(step: number): { pos: Pos; label: string; tone: Tone } {
  if (step <= 2) return { pos: 'script', label: 'fetch(…)', tone: 'focus' }
  if (step === 3) return { pos: 'api', label: 'anmodning', tone: 'focus' }
  if (step === 4) return { pos: 'gate', label: 'svar', tone: 'neg' }
  if (step === 5) return { pos: 'api', label: 'anmodning', tone: 'focus' }
  return { pos: 'script', label: 'svar', tone: 'focus' }
}

function Cors({ step }: { step: number }) {
  const { pos, label, tone } = frame(step)
  const token = (
    <Token id="cors-req" tone={tone} launch={step === 3 || step === 5}>
      {label}
    </Token>
  )
  const split = at(step, 1)
  const compared = at(step, 2)
  const blocked = step === 4
  const policy = at(step, 5)
  const partTone = (same: boolean): Tone => (!compared ? (split ? 'focus' : 'idle') : same ? 'ok' : 'neg')

  return (
    <div className="cors">
      <div className="cors-origins" role="table" aria-label="Origins sammenlignet del for del">
        <span />
        {PARTS.map((p) => (
          <motion.span key={p.id} className="cors-plabel" initial={false} animate={{ opacity: split ? 1 : 0 }} transition={t.fade}>
            {p.label}
          </motion.span>
        ))}
        <span className="cors-rlabel">Siden</span>
        {PARTS.map((p) => (
          <span key={p.id} className="cors-part mono" data-tone={partTone(p.same)} data-split={split}>
            {p.page}
          </span>
        ))}
        <span className="cors-rlabel">API</span>
        {PARTS.map((p) => (
          <span key={p.id} className="cors-part mono" data-tone={partTone(p.same)} data-split={split}>
            {p.api}
          </span>
        ))}
        <span />
        {PARTS.map((p) => (
          <motion.span key={p.id} className="cors-check" data-same={p.same} initial={false} animate={{ opacity: compared ? 1 : 0 }} transition={t.place}>
            {p.same ? '✓ ens' : '✗ forskellig'}
          </motion.span>
        ))}
      </div>
      <div className="cors-verdict">
        <Tag show={compared} tone="neg">cross-origin</Tag>
        <span className="cors-eks">API’ets port som i Postman-slides (https://localhost:7052).</span>
      </div>

      <div className="vflow stack cors-flow">
        <Node className="cors-browser" title="Browser" sub="håndhæver same-origin policy" tone={blocked ? 'neg' : 'idle'}>
          <div className="cors-inner">
            <div className="cors-script">
              <span className="vcaps">script på siden</span>
              <span className="cors-slot">{pos === 'script' && token}</span>
            </div>
            <div className="cors-gate" data-tone={blocked ? 'neg' : policy && step >= 6 ? 'ok' : 'idle'}>
              <span className="vcaps">grænse</span>
              <span className="cors-slot">{pos === 'gate' && token}</span>
            </div>
          </div>
        </Node>
        <Link on={step >= 3} back={step === 4 || step === 6} tone={step === 4 ? 'neg' : 'focus'} label="https" />
        <Node className="cors-api" title="API" sub="Program.cs" tone={pos === 'api' ? 'focus' : 'idle'}>
          <span className="cors-slot">{pos === 'api' && token}</span>
        </Node>
      </div>

      <div className="cors-bottom">
        <motion.pre className="cors-code mono" initial={false} animate={{ opacity: policy ? 1 : 0, y: policy ? 0 : 6 }} transition={t.settle}>
          {`builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("https://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// ...
app.UseCors("Frontend");`}
        </motion.pre>
        <div className="cors-outcomes">
          <span className="cors-outcome">
            <Tag show={at(step, 4)} tone="neg">uden policy: svaret afvises af browseren</Tag>
          </span>
          <span className="cors-outcome">
            <Tag show={at(step, 6)}>med policy: svaret når scriptet</Tag>
          </span>
        </div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'cors',
  title: 'Same-origin policy og CORS',
  steps: [
    {
      caption: 'En side fra `https://localhost:5173` vil kalde API’et med `fetch`. API’et kører på samme maskine, men på en anden port.',
      hold: 2200,
    },
    { caption: 'Et **origin** består af tre dele: scheme, host og port.', hold: 2000 },
    {
      caption: 'Browseren sammenligner del for del. Scheme og host er ens, porten er ikke — én forskel er nok: anmodningen er **cross-origin**.',
      hold: 2800,
    },
    { caption: 'Anmodningen sendes til API’et, som svarer.', hold: 1600 },
    {
      caption: 'Uden CORS-policy afviser **browseren** svaret, så scriptet aldrig får det. Det er browseren, ikke serveren, der håndhæver same-origin policy.',
      hold: 3000,
    },
    {
      caption: 'API’et registrerer en policy i `Program.cs`: `WithOrigins("https://localhost:5173")` tillader frontendens origin, og `app.UseCors("Frontend")` aktiverer den.',
      hold: 3000,
    },
    {
      caption: 'Nu erklærer serveren frontendens origin som tilladt, og browseren lader svaret nå scriptet. Husk: `UseCors` før `MapControllers`.',
      hold: 3000,
    },
  ],
  Component: Cors,
}

export default viz
