import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Tag, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './knp-http.css'

/* Kurose & Ross:
   - Request message ordret fra s. 131, response message ordret fra s. 133,
     delenes navne fra fig. 2.8 og 2.9 (s. 132, 134).
   - RTT-regnestykket fra s. 129–131 (fig. 2.7): TCP-opsætning (to første dele af
     three-way handshake) = 1 RTT; ACK sendes sammen med requesten, og
     request/response = 1 RTT. Non-persistent: ny forbindelse pr. objekt.
     Persistent: forbindelsen genbruges.
   - Stien /someDepartment/home.index er bogens (s. 128). To objekter er valgt for
     at holde figuren lille (bogens eksempel har 11); transmissionstiden er udeladt. */

type Line = { text: string; part: string; first?: boolean }

const REQUEST: Line[] = [
  { text: 'GET /somedir/page.html HTTP/1.1', part: 'request line', first: true },
  { text: 'Host: www.someschool.edu', part: 'header lines', first: true },
  { text: 'Connection: close', part: 'header lines' },
  { text: 'User-agent: Mozilla/5.0', part: 'header lines' },
  { text: 'Accept-language: fr', part: 'header lines' },
  { text: '', part: 'tom linje (CR LF)', first: true },
]

const RESPONSE: Line[] = [
  { text: 'HTTP/1.1 200 OK', part: 'status line', first: true },
  { text: 'Connection: close', part: 'header lines', first: true },
  { text: 'Date: Tue, 18 Aug 2015 15:44:04 GMT', part: 'header lines' },
  { text: 'Server: Apache/2.2.3 (CentOS)', part: 'header lines' },
  { text: 'Last-Modified: Tue, 18 Aug 2015 15:11:03 GMT', part: 'header lines' },
  { text: 'Content-Length: 6821', part: 'header lines' },
  { text: 'Content-Type: text/html', part: 'header lines' },
  { text: '', part: 'tom linje (CR LF)', first: true },
  { text: '(data data data data data ...)', part: 'entity body', first: true },
]

function Message({ title, lines, on, seen }: { title: string; lines: Line[]; on: boolean; seen: boolean }) {
  return (
    <div className="kh-msg" data-on={on || undefined} data-seen={seen || undefined}>
      <div className="vcaps">{title}</div>
      <div className="kh-lines">
        {lines.map((l, i) => (
          <div className="kh-line" key={i} data-first={l.first || undefined}>
            <motion.span
              className="kh-part"
              initial={false}
              animate={{ opacity: seen && l.first ? 1 : 0 }}
              transition={seen ? stagger(i, 0.1, 0.06) : t.fade}
            >
              {l.first ? l.part : ''}
            </motion.span>
            <code className={l.text ? 'kh-code' : 'kh-code is-empty'}>{l.text || '↵'}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

type Arrow = { dir: 'up' | 'down'; label: string; kind: 'tcp' | 'http' } | null

const OPEN: Arrow[] = [
  { dir: 'down', label: 'opret TCP-forbindelse', kind: 'tcp' },
  { dir: 'up', label: 'TCP-svar', kind: 'tcp' },
]
const obj = (what: string, withAck: boolean): Arrow[] => [
  { dir: 'down', label: `${withAck ? 'ACK + ' : ''}GET ${what}`, kind: 'http' },
  { dir: 'up', label: `200 OK + ${what === 'home.index' ? 'HTML' : 'JPEG'}`, kind: 'http' },
]

const NONPERSISTENT: Arrow[] = [...OPEN, ...obj('home.index', true), ...OPEN, ...obj('billede 1', true)]
const PERSISTENT: Arrow[] = [...OPEN, ...obj('home.index', true), ...obj('billede 1', false), null, null]

function Lane({
  title,
  sub,
  arrows,
  shown,
  total,
  showTotal,
  focus,
}: {
  title: string
  sub: string
  arrows: Arrow[]
  shown: number
  total: string
  showTotal: boolean
  focus: boolean
}) {
  return (
    <div className="kh-lane" data-on={focus || undefined}>
      <div className="kh-lane-head">
        <span className="kh-lane-title">{title}</span>
        <span className="kh-lane-sub">{sub}</span>
      </div>
      <div className="kh-ends">
        <span>klient</span>
        <span>server</span>
      </div>
      <div className="kh-seq">
        {arrows.map((a, i) => {
          const on = a !== null && i < shown
          return (
            <div className="kh-row" key={i} style={{ gridRow: i + 1 }}>
              {a && (
                <>
                  <motion.span
                    className="kh-label"
                    data-kind={a.kind}
                    initial={false}
                    animate={{ opacity: on ? 1 : 0 }}
                    transition={on ? { ...t.fade, delay: 0.15 } : t.fade}
                  >
                    {a.label}
                  </motion.span>
                  <Link on={on} back={a.dir === 'up'} tone={on ? (a.kind === 'http' ? 'focus' : 'idle') : 'muted'} />
                </>
              )}
            </div>
          )
        })}
        {arrows.map((a, i) =>
          i % 2 === 0 && a ? (
            <motion.span
              key={`rtt-${i}`}
              className="kh-rtt"
              data-kind={a.kind}
              style={{ gridRow: `${i + 1} / span 2` }}
              initial={false}
              animate={{ opacity: i + 1 < shown ? 1 : 0 }}
              transition={i + 1 < shown ? { ...t.fade, delay: 0.5 } : t.fade}
            >
              RTT
            </motion.span>
          ) : null,
        )}
      </div>
      <div className="kh-total">
        <Tag show={showTotal} tone={focus ? 'focus' : 'idle'}>
          {total}
        </Tag>
      </div>
    </div>
  )
}

function Http({ step }: { step: number }) {
  const np = step < 2 ? 0 : step === 2 ? 4 : 8
  const p = step >= 4 ? 6 : 0
  return (
    <div className="kh">
      <div className="kh-msgs">
        <Message title="Request message (s. 131)" lines={REQUEST} on={step === 0} seen={at(step, 0)} />
        <Message title="Response message (s. 133)" lines={RESPONSE} on={step === 1} seen={at(step, 1)} />
      </div>
      <div className="kh-lanes">
        <Lane
          title="Non-persistent"
          sub="HTTP/1.0 · én forbindelse pr. objekt"
          arrows={NONPERSISTENT}
          shown={np}
          total={step === 2 ? '2 RTT for HTML' : '4 RTT for 2 objekter'}
          showTotal={at(step, 2)}
          focus={step === 2 || step === 3}
        />
        <Lane
          title="Persistent"
          sub="HTTP/1.1 · forbindelsen genbruges"
          arrows={PERSISTENT}
          shown={p}
          total="3 RTT for 2 objekter"
          showTotal={at(step, 4)}
          focus={step === 4}
        />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-http',
  title: 'HTTP-beskeder og RTT’er med og uden persistent forbindelse',
  steps: [
    {
      caption:
        'En **request message** er ASCII: en **request line** med metode, URL og version, så **header lines**, og en tom linje. Ved `GET` er entity body tom.',
      hold: 3000,
    },
    {
      caption:
        'Svaret har en **status line** (version, statuskode, tekst), header lines, en tom linje og objektet i **entity body**. `Content-Type` — ikke filendelsen — angiver typen.',
      hold: 3000,
    },
    {
      caption:
        '**Non-persistent**: to dele af TCP’s handshake koster én RTT; requesten rides med på ACK’en, og request/response koster én til. **2 RTT** plus transmissionstid pr. objekt.',
      hold: 3200,
    },
    {
      caption:
        'Forbindelsen lukkes efter hvert svar, så næste objekt betaler opsætningen igen. Bogens side med HTML og 10 JPEG’er giver **11 TCP-forbindelser**.',
      hold: 3000,
    },
    {
      caption:
        '**Persistent** (HTTP/1.1): forbindelsen står åben, og hvert ekstra objekt koster kun sin request/response. Med pipelining sendes requests endda back-to-back.',
      hold: 3200,
    },
  ],
  Component: Http,
}

export default viz
