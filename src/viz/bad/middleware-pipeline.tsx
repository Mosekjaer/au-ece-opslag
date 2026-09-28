import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Tag, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './middleware-pipeline.css'

/* En anmodning går ned gennem pipelinen og svaret op igen.
   Anden anmodning mangler token og bliver kortsluttet af authorization. */

const LAYERS = [
  { id: 'kestrel', code: 'Kestrel', note: 'webserveren' },
  { id: 'exc', code: 'UseExceptionHandler()', note: 'først: fanger fejl fra alt nedenunder' },
  { id: 'https', code: 'UseHttpsRedirection()', note: '' },
  { id: 'cors', code: 'UseCors()', note: 'før endpoints' },
  { id: 'authn', code: 'UseAuthentication()', note: 'hvem er du?' },
  { id: 'authz', code: 'UseAuthorization()', note: 'må du?' },
  { id: 'endpoint', code: 'MapControllers() → BooksController.Get', note: 'endpoint: laver svaret' },
] as const

type LayerId = (typeof LAYERS)[number]['id'] | 'client'

function frame(step: number) {
  // Hvor er anmodningen/svaret, og hvad står der på den?
  const pos: LayerId =
    step <= 0 ? 'client'
    : step === 1 ? 'kestrel'
    : step === 2 ? 'authn'
    : step === 3 ? 'endpoint'
    : step === 4 ? 'client'
    : step === 5 ? 'authz'
    : 'client'
  const label =
    step <= 2 ? 'GET /api/books  ·  Bearer …'
    : step === 3 ? '200 OK'
    : step === 4 ? '200 OK'
    : step === 5 ? 'DELETE /api/books/7  ·  intet token'
    : '401'
  // Kort udgave til smalle plader, hvor tokenet deler række med markeringerne.
  const short = step <= 2 ? 'GET · Bearer' : step === 5 ? 'DELETE · intet token' : label
  const tone = step >= 5 ? 'neg' : 'focus'
  return { pos, label, short, tone } as const
}

function Pipeline({ step }: { step: number }) {
  const { pos, label, short, tone } = frame(step)
  const idx = (id: string) => LAYERS.findIndex((l) => l.id === id)

  // Lag berørt på vejen ned (før) og op (efter). Anden anmodning (trin 5–6)
  // når kun til authorization, der selv svarer.
  const shortCircuit = at(step, 5)
  const downTo = shortCircuit
    ? idx('authz') - 1
    : step >= 3 ? idx('endpoint') : step === 2 ? idx('authn') : step === 1 ? 0 : -1
  const upDone = step === 4 || step >= 6

  const token = (
    <Token id="req" tone={tone} launch={step === 1 || step === 5}>
      <span className="mw-long">{label}</span>
      <span className="mw-short">{short}</span>
    </Token>
  )

  return (
    <div className="mw">
      <div className="mw-client">
        <span className="vcaps">Klient</span>
        <span className="mw-slot">{pos === 'client' && token}</span>
      </div>

      <ol className="mw-stack">
        {LAYERS.map((layer, i) => {
          const passedDown = i <= downTo
          const isEndpoint = layer.id === 'endpoint'
          const blocked = shortCircuit && layer.id === 'authz'
          const skipped = shortCircuit && isEndpoint
          const layerTone = blocked ? 'neg' : skipped ? 'muted' : pos === layer.id ? 'focus' : passedDown ? 'ok' : 'idle'
          return (
            <li key={layer.id} className="mw-layer" data-tone={layerTone} data-endpoint={isEndpoint || undefined}>
              <span className="mw-num">{i + 1}</span>
              <span className="mw-name">
                <code>{layer.code}</code>
                {layer.note && <span className="mw-note">{layer.note}</span>}
              </span>
              <span className="mw-meta">
              <span className="mw-slot">{pos === layer.id && token}</span>
              <span className="mw-marks">
                {!isEndpoint && !blocked && (
                  <>
                    <motion.span
                      className="mw-mark"
                      initial={false}
                      animate={{ opacity: passedDown ? 1 : 0, x: passedDown ? 0 : -4 }}
                      transition={passedDown ? stagger(i, 0.05, 0.06) : t.fade}
                    >
                      ↓ før
                    </motion.span>
                    <motion.span
                      className="mw-mark"
                      initial={false}
                      animate={{ opacity: upDone && passedDown ? 1 : 0, x: upDone && passedDown ? 0 : -4 }}
                      transition={upDone ? stagger(LAYERS.length - i, 0.05, 0.06) : t.fade}
                    >
                      ↑ efter
                    </motion.span>
                  </>
                )}
                {blocked && <Tag tone="neg">kortslutter</Tag>}
                {skipped && <Tag tone="muted">nås aldrig</Tag>}
              </span>
              </span>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

const viz: VizDef = {
  id: 'middleware-pipeline',
  title: 'En anmodning gennem middleware-pipelinen',
  steps: [
    {
      caption: 'Pipelinen er registreret i `Program.cs` i denne rækkefølge. Rækkefølgen er den vej, anmodningen går.',
      hold: 1800,
    },
    { caption: '**Kestrel** modtager anmodningen og sender den ind i pipelinen.', hold: 1500 },
    {
      caption: 'Hvert lag gør sit arbejde *før* det kalder det næste. Authentication læser tokenet og sætter `HttpContext.User`.',
      hold: 2300,
    },
    {
      caption: 'Authorization ser en kendt bruger og lader anmodningen gå videre til **endpointet**, som laver svaret `200 OK`.',
      hold: 2300,
    },
    {
      caption: 'Svaret går den **samme vej tilbage**. Hvert lag kan nu gøre noget *efter* — fx fange en exception eller sætte headers.',
      hold: 2800,
    },
    {
      caption: 'En ny anmodning uden token. Authorization **kortslutter**: den kalder ikke videre, men svarer selv.',
      hold: 2600,
    },
    {
      caption:
        'Endpointet nås aldrig, og klienten får `401`. Derfor skal `UseAuthentication()` ligge før `UseAuthorization()` — rækkefølgen er semantik.',
      hold: 3000,
    },
  ],
  Component: Pipeline,
}

export default viz
