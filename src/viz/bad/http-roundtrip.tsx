import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './http-roundtrip.css'

/* WebSitesAndWebApps.pdf s. 6–14: URL'en skilles ad, browseren sender en
   HTTP Request, webserveren svarer med en HTTP Response og en statuskode. */

// Materialets eksempel-URL, delt som i slidens diagram. Separatorerne er ikke dele.
const URL_PARTS = [
  { text: 'http', label: 'scheme' },
  { text: '://', sep: true },
  { text: 'www.ece.au.dk', label: 'server' },
  { text: ':', sep: true },
  { text: '1234', label: 'port', note: 'standard 80' },
  { text: '/path/file.html', label: 'path' },
  { text: '?', sep: true },
  { text: 'x=2&y=7', label: 'query' },
] as const

const STATUS = [
  { cls: '2xx', name: 'succes', code: '200 OK' },
  { cls: '3xx', name: 'omdirigering', code: '301 Moved Permanently' },
  { cls: '4xx', name: 'klientfejl', code: '404 Not Found' },
  { cls: '5xx', name: 'serverfejl', code: '500 Internal Server Error' },
]

function Url({ split }: { split: boolean }) {
  let n = 0
  return (
    <div className="hr-url" data-split={split}>
      {URL_PARTS.map((p, i) => {
        if ('sep' in p) {
          return (
            <span key={i} className="hr-sep">
              <code>{p.text}</code>
            </span>
          )
        }
        const k = n++
        return (
          <span key={i} className="hr-part">
            <code>{p.text}</code>
            <motion.span
              className="hr-label"
              initial={false}
              animate={split ? { opacity: 1, y: 0 } : { opacity: 0, y: -4 }}
              transition={split ? { ...t.place, delay: 0.1 + k * 0.08 } : t.fade}
            >
              {p.label}
              {'note' in p && <span className="hr-note">{p.note}</span>}
            </motion.span>
          </span>
        )
      })}
    </div>
  )
}

function Roundtrip({ step }: { step: number }) {
  // Hvor er anmodningen og svaret?
  const reqAt = step <= 1 ? 'browser' : 'server'
  const req = (
    <Token id="hr-req" tone={step >= 3 ? 'muted' : 'focus'} launch={step === 2}>
      {'GET /path/file.html?x=2&y=7'}
    </Token>
  )
  const res = (
    <Token id="hr-res" tone="focus">
      200 OK · HTML
    </Token>
  )
  const resAt = step === 3 ? 'server' : step >= 4 ? 'browser' : null

  return (
    <div className="hr">
      <Url split={at(step, 1)} />

      <div className="hr-flow">
        <Node
          className="hr-node"
          title="Browser"
          sub="klient: sender anmodninger, renderer HTML"
          tone={step === 1 || step === 4 ? 'focus' : 'idle'}
        >
          <div className="hr-slot">
            {step >= 1 && reqAt === 'browser' && req}
            {resAt === 'browser' && res}
          </div>
        </Node>

        <div className="hr-links">
          <Link on={at(step, 2)} label="HTTP Request" tone={step === 2 ? 'focus' : 'idle'} />
          <Link on={at(step, 4)} label="HTTP Response" tone={step === 4 ? 'focus' : 'idle'} back />
        </div>

        <Node
          className="hr-node"
          title="Webserver"
          sub="fx Apache, IIS, Kestrel, Node.js"
          tone={step === 2 || step === 3 ? 'focus' : 'idle'}
        >
          <div className="hr-slot">
            {reqAt === 'server' && req}
            {resAt === 'server' && res}
          </div>
        </Node>
      </div>

      <motion.dl
        className="hr-status"
        initial={false}
        animate={{ opacity: at(step, 5) ? 1 : 0 }}
        transition={t.fade}
        aria-hidden={!at(step, 5) || undefined}
      >
        {STATUS.map((s, i) => (
          <motion.div
            key={s.cls}
            className="hr-class"
            initial={false}
            animate={at(step, 5) ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
            transition={at(step, 5) ? stagger(i, 0.05, 0.08) : t.fade}
          >
            <dt>
              <Tag tone={s.cls === '2xx' ? 'focus' : s.cls === '4xx' || s.cls === '5xx' ? 'neg' : 'idle'}>{s.cls}</Tag>
              <span>{s.name}</span>
            </dt>
            <dd>
              <code>{s.code}</code>
            </dd>
          </motion.div>
        ))}
      </motion.dl>
    </div>
  )
}

const viz: VizDef = {
  id: 'http-roundtrip',
  title: 'En URL skilles ad, og en anmodning får sit svar',
  steps: [
    { caption: 'En ressource på nettet findes via en **URL**. Her er materialets eksempel i ét stykke.', hold: 1600 },
    {
      caption:
        'URL’en skilles ad i **scheme**, **server**, **port**, **path** og **query**. `?` adskiller ressourcen fra query-strengen; port 80 er standard for http.',
      hold: 3000,
    },
    {
      caption: 'Klienten starter altid. Browseren sender verbet `GET` med path og query til webserveren — en **HTTP Request**.',
      hold: 2400,
    },
    { caption: 'Webserveren modtager anmodningen og laver svaret: en statuskode og evt. indhold.', hold: 1800 },
    {
      caption: 'Svaret går tilbage som en **HTTP Response**: `200 OK` og i body’en fx et HTML-dokument, som browseren renderer.',
      hold: 2600,
    },
    {
      caption:
        'Statuskodens første ciffer fortæller udfaldet: **2xx** lykkedes, **3xx** omdirigerer, **4xx** er klientens fejl og **5xx** serverens.',
      hold: 3000,
    },
  ],
  Component: Roundtrip,
}

export default viz
