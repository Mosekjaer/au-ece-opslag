import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, Token, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './swagger-docs.css'

/* SW4BAD - API Documentation.pdf: ///-kommentar → GenerateDocumentationFile →
   MyBGList.xml → IncludeXmlComments → swagger.json → Swagger UI. Derefter
   hængelåsen: global AddSecurityRequirement mod AuthRequirementFilter. */

const SUMMARY = 'Registers a new user.'

const ENDPOINTS = [
  { group: 'Account', verb: 'POST', path: '/Account/Register', summary: SUMMARY, auth: false },
  { group: 'Account', verb: 'POST', path: '/Account/Login', summary: 'Performs a user login.', auth: false },
  { group: 'Auth', verb: 'GET', path: '/auth/test/1', summary: 'Auth test #1 (authenticated users).', auth: true },
  { group: 'Auth', verb: 'GET', path: '/auth/test/2', summary: 'Auth test #2 (Moderator role).', auth: true },
]

function Lock() {
  return (
    <svg className="swg-lock" viewBox="0 0 12 14" width="11" height="13" aria-hidden="true">
      <path d="M3.5 6.2V4.3a2.5 2.5 0 0 1 5 0v1.9" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <rect x="1.5" y="6.2" width="9" height="6.8" rx="1.4" fill="currentColor" />
    </svg>
  )
}

/** Sted hvor opsummeringen kan stå: som rejsende token, som tekst eller slet ikke. */
function Slot({ here, passed, children }: { here: boolean; passed: boolean; children?: ReactNode }) {
  if (here) return <Token id="swg-summary">{SUMMARY}</Token>
  return (
    <motion.span className="swg-text" initial={false} animate={{ opacity: passed ? 1 : 0 }} transition={t.fade}>
      {children ?? SUMMARY}
    </motion.span>
  )
}

function Chain({ show, i, children, tone = 'idle' }: { show: boolean; i: number; children: ReactNode; tone?: Tone }) {
  return (
    <motion.div
      className="swg-step"
      data-tone={show ? tone : 'ghost'}
      initial={false}
      animate={{ opacity: show ? 1 : 0.35 }}
      transition={show ? stagger(i, 0.05, 0.15) : t.fade}
    >
      {children}
    </motion.div>
  )
}

function SwaggerDocs({ step }: { step: number }) {
  const where = step === 1 ? 'code' : step === 2 ? 'json' : step >= 3 ? 'ui' : 'none'
  const built = at(step, 2)
  const global = step === 4
  const filter = at(step, 5)
  const lockFor = (auth: boolean): Tone | null => (global ? (auth ? 'focus' : 'neg') : filter && auth ? 'focus' : null)

  return (
    <div className="swg">
      <section className="swg-col">
        <span className="vcaps">AccountController.cs</span>
        <pre className="swg-code">
          <span className="swg-c">/// &lt;summary&gt;</span>
          <span className="swg-c" data-on={step === 1 || undefined}>
            {'/// '}
            <Slot here={where === 'code'} passed />
          </span>
          <span className="swg-c">/// &lt;/summary&gt;</span>
          <span className="swg-c">/// &lt;param name="input"&gt;</span>
          <span className="swg-c">///   A DTO containing the user data.</span>
          <span className="swg-c">/// &lt;/param&gt;</span>
          <span>[HttpPost]</span>
          <span>public async Task&lt;ActionResult&gt;</span>
          <span>{'    Register(RegisterDTO input)'}</span>
        </pre>
      </section>

      <section className="swg-col">
        <span className="vcaps">Build og Swashbuckle</span>
        <Chain show={built} i={0}>
          <span className="swg-file">MyBGList.csproj</span>
          <code>&lt;GenerateDocumentationFile&gt;true<wbr />&lt;/GenerateDocumentationFile&gt;</code>
        </Chain>
        <Chain show={built} i={1}>
          <span className="swg-file">↓ compileren skriver</span>
          <code>MyBGList.xml</code>
        </Chain>
        <Chain show={built} i={2}>
          <span className="swg-file">↓ Program.cs læser den</span>
          <code>options.IncludeXmlComments(…)</code>
        </Chain>
        <Chain show={built} i={3} tone={step === 2 ? 'focus' : 'idle'}>
          <span className="swg-file">↓ swagger.json</span>
          <pre className="swg-json">
            <span>"/Account/Register": {'{'}</span>
            <span>{'  "post": {'}</span>
            <span>{'    "tags": ["Account"],'}</span>
            <span>{'    "summary":'}</span>
            <span className="swg-json-slot">
              {'      '}
              <Slot here={where === 'json'} passed={at(step, 3)}>
                "{SUMMARY}"
              </Slot>
            </span>
            <span>{'  }'}</span>
            <span>{'}'}</span>
          </pre>
        </Chain>
        <div className="swg-sec">
          <motion.code className="swg-sec-line" data-tone={filter ? 'neg' : 'focus'} initial={false} animate={{ opacity: at(step, 4) ? 1 : 0 }} transition={t.fade}>
            options.AddSecurityRequirement(…)
          </motion.code>
          <motion.code className="swg-sec-line" data-tone="focus" initial={false} animate={{ opacity: filter ? 1 : 0 }} transition={t.fade}>
            options.<wbr />OperationFilter&lt;AuthRequirementFilter&gt;()
          </motion.code>
        </div>
      </section>

      <section className="swg-col swg-ui">
        <span className="vcaps">Swagger UI</span>
        <div className="swg-app">MyBGList</div>
        {['Account', 'Auth'].map((g) => (
          <div key={g} className="swg-group">
            <div className="swg-group-name">{g}</div>
            {ENDPOINTS.filter((e) => e.group === g).map((e) => {
              const lock = lockFor(e.auth)
              const isReg = e.path === '/Account/Register'
              return (
                <div key={e.path} className="swg-row" data-verb={e.verb}>
                  <span className="swg-verb">{e.verb}</span>
                  <span className="swg-path">{e.path}</span>
                  <motion.span
                    className="swg-lockslot"
                    data-tone={lock ?? 'idle'}
                    initial={false}
                    animate={{ opacity: lock ? 1 : 0, scale: lock ? 1 : 0.6 }}
                    transition={lock ? t.place : t.fade}
                  >
                    <Lock />
                  </motion.span>
                  <span className="swg-summary">
                    {isReg ? <Slot here={where === 'ui'} passed={at(step, 3)} /> : <Slot here={false} passed={at(step, 3)}>{e.summary}</Slot>}
                  </span>
                  <span className="swg-meta">
                    {e.auth ? <code>[Authorize]</code> : <span>offentlig</span>}
                    {global && !e.auth && <Tag tone="neg">også her</Tag>}
                  </span>
                </div>
              )
            })}
          </div>
        ))}
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'swagger-docs',
  title: 'Fra XML-kommentar til Swagger UI',
  steps: [
    {
      caption: 'Uden beskrivelser viser Swagger UI kun en liste af endpoints. Beskrivelsen står allerede i koden som en `///`-kommentar.',
      hold: 2200,
    },
    { caption: '`<summary>` beskriver endpointet, `<param>` dets input. Følg teksten **Registers a new user.**', hold: 2000 },
    {
      caption:
        '`GenerateDocumentationFile` får compileren til at skrive `MyBGList.xml`. `IncludeXmlComments` lader Swashbuckle læse den ind i `swagger.json`.',
      hold: 3000,
    },
    {
      caption: 'Swagger UI læser `swagger.json`: endpointet grupperes under sin controller (`tags`), og opsummeringen står ved siden af.',
      hold: 2600,
    },
    {
      caption: 'En global `AddSecurityRequirement` sætter en hængelås på **alle** endpoints — også de offentlige som `Register` og `Login`.',
      hold: 2800,
    },
    {
      caption:
        'Et `AuthRequirementFilter` (et `IOperationFilter`) sætter kun kravet på operationer med `[Authorize]`. Nu viser hængelåsen, hvad der faktisk kræver login.',
      hold: 3000,
    },
  ],
  Component: SwaggerDocs,
}

export default viz
