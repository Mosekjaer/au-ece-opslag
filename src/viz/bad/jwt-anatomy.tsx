import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './jwt-anatomy.css'

/* Eksemplet fra JSON Web Token.pdf: header og payload Base64Url-kodes,
   signaturen er HMACSHA256 over de to kodede dele. Kodningerne er ægte.
   Signaturerne er ægte HS256 med den viste eksempelnøgle "hemmelig-noegle"
   (tjek: node -e 'require("crypto").createHmac("sha256","hemmelig-noegle")
   .update("<header>.<payload>").digest("base64url")'). */

const H = { json: ['"alg": "HS256",', '"typ": "JWT"'], enc: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' }
const H_NONE = { json: ['"alg": "none",', '"typ": "JWT"'], enc: 'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0' }
const P = {
  json: ['"sub": "1234567890",', '"name": "John Doe",', '"admin": true'],
  enc: 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWV9',
}
const P_TAMPER = {
  json: ['"sub": "1234567890",', '"name": "John Doe",', '"admin": false'],
  enc: 'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOmZhbHNlfQ',
}
const SIG = '1NCtk4NYy-WKUH7JLSMpZZ72oTcpSfBVyxKMWmOf2Bw'
const SIG_TAMPER = 'eJwAYzXP-gzZBK4puPQuCNN6OPjeSIEbKIKRl7WdsUM'

type Mode = 'ok' | 'tamper' | 'none'
const modeAt = (step: number): Mode => (step === 5 ? 'tamper' : step === 6 ? 'none' : 'ok')

/** Varianter i samme gittercelle: højden er den største, uanset bredde. */
function Swap({ show, items }: { show: number; items: ReactNode[] }) {
  return (
    <div className="jw-swap">
      {items.map((c, i) => (
        <motion.div key={i} aria-hidden={i !== show || undefined} initial={false} animate={{ opacity: i === show ? 1 : 0 }} transition={t.fade}>
          {c}
        </motion.div>
      ))}
    </div>
  )
}

/** Markér hvor en ændret streng afviger fra originalen. */
function Diff({ from, to }: { from: string; to: string }) {
  let n = 0
  while (n < from.length && from[n] === to[n]) n++
  return (
    <>
      {to.slice(0, n)}
      <mark className="jw-changed">{to.slice(n)}</mark>
    </>
  )
}

function Json({ lines, bad }: { lines: string[]; bad?: number }) {
  return (
    <div className="jw-json">
      <div>{'{'}</div>
      {lines.map((l, i) => (
        <div key={i} className="jw-json-line" data-tone={i === bad ? 'neg' : 'idle'}>
          {l}
        </div>
      ))}
      <div>{'}'}</div>
    </div>
  )
}

function Enc({ part, show, tone = 'idle', children }: { part: string; show: boolean; tone?: Tone; children: ReactNode }) {
  return (
    <motion.div
      className={`jw-enc jw-enc-${part}`}
      data-part={part}
      data-tone={tone}
      initial={false}
      animate={{ opacity: show ? 1 : 0, y: show ? 0 : -4 }}
      transition={show ? t.place : t.fade}
    >
      {children}
    </motion.div>
  )
}

function Part({ part, name, via, now, children }: { part: string; name: string; via: string; now: boolean; children: ReactNode }) {
  return (
    <div className={`jw-col jw-col-${part}`} data-now={now}>
      <span className="vcaps">{name}</span>
      {children}
      <span className="jw-via">↓ {via}</span>
    </div>
  )
}

function Jwt({ step }: { step: number }) {
  const mode = modeAt(step)
  const hIdx = mode === 'none' ? 1 : 0
  const pIdx = mode === 'tamper' ? 1 : 0
  const joined = at(step, 4)

  return (
    <div className="jw">
      <div className="jw-parts">
        <Part part="h" name="Header" via="Base64Url" now={step === 1}>
          <Swap show={hIdx} items={[<Json key="a" lines={H.json} />, <Json key="b" lines={H_NONE.json} bad={0} />]} />
        </Part>
        <Part part="p" name="Payload" via="Base64Url" now={step === 2}>
          <Swap show={pIdx} items={[<Json key="a" lines={P.json} />, <Json key="b" lines={P_TAMPER.json} bad={2} />]} />
        </Part>
        <Part part="s" name="Signatur" via="HMACSHA256" now={step === 3}>
          <div className="jw-json jw-formula">
            HMACSHA256(
            <br />
            &nbsp;&nbsp;header + "." + payload,
            <br />
            &nbsp;&nbsp;secret)
            <div className="jw-secret">secret = "hemmelig-noegle" (eksempel)</div>
          </div>
        </Part>

        <Enc part="h" show={at(step, 1)} tone={mode === 'none' ? 'neg' : 'idle'}>
          <Swap show={hIdx} items={[H.enc, <Diff key="b" from={H.enc} to={H_NONE.enc} />]} />
        </Enc>
        <Enc part="p" show={at(step, 2)} tone={mode === 'tamper' ? 'neg' : 'idle'}>
          <Swap show={pIdx} items={[P.enc, <Diff key="b" from={P.enc} to={P_TAMPER.enc} />]} />
        </Enc>
        <Enc part="s" show={at(step, 3)} tone={mode === 'none' ? 'neg' : 'idle'}>
          <Swap show={mode === 'none' ? 1 : 0} items={[SIG, <span key="b" className="jw-empty">(tom — ingen signatur)</span>]} />
        </Enc>
      </div>

      <motion.div className="jw-token" initial={false} animate={{ opacity: joined ? 1 : 0 }} transition={t.fade}>
        <span className="vcaps">Token</span>
        <Swap
          show={mode === 'tamper' ? 1 : mode === 'none' ? 2 : 0}
          items={[
            <code key="v1" className="jw-str">
              <span data-part="h">{H.enc}</span>.<span data-part="p">{P.enc}</span>.<span data-part="s">{SIG}</span>
            </code>,
            <code key="v2" className="jw-str">
              <span data-part="h">{H.enc}</span>.
              <span data-part="p">
                <Diff from={P.enc} to={P_TAMPER.enc} />
              </span>
              .<span data-part="s">{SIG}</span>
            </code>,
            <code key="v3" className="jw-str">
              <span data-part="h">
                <Diff from={H.enc} to={H_NONE.enc} />
              </span>
              .<span data-part="p">{P.enc}</span>.
            </code>,
          ]}
        />
        <span className="jw-legend">
          <span data-part="h">header</span> . <span data-part="p">payload</span> . <span data-part="s">signatur</span>
          <span className="jw-note">signeret, ikke krypteret — payload kan læses af alle</span>
        </span>
      </motion.div>

      <motion.div className="jw-server" initial={false} animate={{ opacity: at(step, 5) ? 1 : 0 }} transition={t.fade}>
        <span className="vcaps">Server</span>
        <Swap
          show={mode === 'tamper' ? 0 : mode === 'none' ? 1 : 2}
          items={[
            <div key="v1" className="jw-check">
              <code>HMACSHA256(modtaget header + "." + payload, secret)</code>
              <span className="jw-cmp">
                beregnet <code data-tone="neg">{SIG_TAMPER.slice(0, 10)}…</code> ≠ medsendt <code>{SIG.slice(0, 10)}…</code>
              </span>
              <Tag tone="neg">afvist</Tag>
            </div>,
            <div key="v2" className="jw-check">
              <code>verify(token, "HS256", secret)</code>
              <span className="jw-cmp">algoritmen står fast på serveren; "none" fra headeren bruges aldrig</span>
              <Tag tone="neg">afvist</Tag>
            </div>,
            <div key="v3" className="jw-check">
              <code>verify(token, "HS256", secret)</code>
              <span className="jw-cmp">
                beregnet <code>{SIG.slice(0, 10)}…</code> = medsendt
              </span>
              <Tag tone="focus">gyldig</Tag>
            </div>,
          ]}
        />
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'jwt-anatomy',
  title: 'En JWT samles — og afsløres, når den ændres',
  steps: [
    {
      caption: 'En JWT har tre dele. Header og payload er almindelig JSON: algoritmen og claims om brugeren.',
      hold: 2200,
    },
    { caption: 'Headeren **Base64Url-kodes** og bliver første del. Det er kodning, ikke kryptering.', hold: 2000 },
    { caption: 'Payload kodes på samme måde og bliver anden del.', hold: 1600 },
    {
      caption: 'Signaturen beregnes over de to kodede dele med en hemmelig nøgle: `HMACSHA256(header + "." + payload, secret)`.',
      hold: 2800,
    },
    {
      caption: 'De tre dele sættes sammen med punktum og sendes som `Authorization: Bearer <token>`.',
      hold: 2400,
    },
    {
      caption:
        'Payload ændres undervejs: `"admin": false`. Serveren beregner signaturen igen over det, den modtog. Den passer ikke med den medsendte, og tokenet **afvises**.',
      hold: 3000,
    },
    {
      caption:
        'Et andet angreb: `"alg": "none"` og ingen signatur. Nogle biblioteker godtog det. Brug **aldrig** algoritmen fra headeren — serveren ved selv, at den bruger HS256.',
      hold: 3000,
    },
    {
      caption: 'Det gyldige token: `header.payload.signatur`. Signaturen beskytter mod ændringer, men alle kan Base64Url-afkode og læse payload.',
      hold: 3000,
    },
  ],
  Component: Jwt,
}

export default viz
