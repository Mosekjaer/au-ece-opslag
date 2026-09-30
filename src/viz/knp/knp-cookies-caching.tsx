import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-cookies-caching.css'

/* Kurose & Ross s. 138–139 (proxy-cachens fire trin, fig. 2.11) og s. 142–143
   (conditional GET): objektet /fruit/kiwi.gif på www.exotiquecuisine.com,
   Last-Modified: Wed, 9 Sep 2015 09:23:24, en uge senere en anden browser,
   If-modified-since med præcis samme værdi, svaret 304 Not Modified med tom body.
   Alle beskedtekster er bogens. Cookie-forløbet (fig. 2.10) er ikke tegnet. */

const LM = 'Wed, 9 Sep 2015 09:23:24'

type Msg = { lane: 'L' | 'R'; back?: boolean; lines: string[]; kind?: 'cond' | 'ok304' | 'body' }

const MSGS: Msg[] = [
  { lane: 'L', lines: ['GET /fruit/kiwi.gif'] },
  { lane: 'R', lines: ['GET /fruit/kiwi.gif'] },
  { lane: 'R', back: true, lines: ['200 OK', `Last-Modified: ${LM}`, '+ kiwi.gif'], kind: 'body' },
  { lane: 'L', back: true, lines: ['200 OK + kiwi.gif'], kind: 'body' },
  { lane: 'L', lines: ['GET /fruit/kiwi.gif'] },
  { lane: 'R', lines: ['GET /fruit/kiwi.gif', `If-modified-since: ${LM}`], kind: 'cond' },
  { lane: 'R', back: true, lines: ['304 Not Modified', '(empty entity body)'], kind: 'ok304' },
  { lane: 'L', back: true, lines: ['cachens kopi af kiwi.gif'], kind: 'body' },
]

// Hvor mange beskeder er sendt ved hvert trin?
const SENT = [0, 2, 4, 6, 8]

function Row({ m, i, on, now }: { m: Msg; i: number; on: boolean; now: boolean }) {
  const tone = !on ? 'muted' : now ? 'focus' : 'idle'
  return (
    <div className="kcc-row" data-lane={m.lane} style={{ gridRow: i < 4 ? i + 1 : i + 2 }}>
      <motion.div
        className="kcc-label"
        data-kind={m.kind}
        data-back={m.back || undefined}
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={on ? { ...t.fade, delay: 0.2 + (i % 2) * 0.55 } : t.fade}
      >
        {m.lines.map((l, k) => (
          <code key={k}>{l}</code>
        ))}
      </motion.div>
      <Link on={on} back={m.back} tone={tone} />
    </div>
  )
}

function Cache({ step }: { step: number }) {
  const sent = SENT[Math.min(step, SENT.length - 1)]
  const stored = at(step, 2)
  const nowFrom = sent - 2
  const cacheRole = step === 1 || step === 3 ? 'klient over for origin' : 'server over for browseren'

  return (
    <div className="kcc">
      <div className="kcc-heads">
        <div className="kcc-head" data-col="b">
          <span className="kcc-name">Browser</span>
          <span className="kcc-sub">{step >= 3 ? 'en anden browser' : 'konfigureret til cachen'}</span>
        </div>
        <div className="kcc-head" data-col="c" data-on={step >= 1 || undefined}>
          <span className="kcc-name">Proxy cache</span>
          <span className="kcc-sub">{cacheRole}</span>
        </div>
        <div className="kcc-head" data-col="o">
          <span className="kcc-name">Origin server</span>
          <span className="kcc-sub mono">www.<wbr />exotiquecuisine.<wbr />com</span>
        </div>
      </div>

      <div className="kcc-store">
        <span className="vcaps">cachens lager</span>
        <Tag show={stored} tone={step === 2 ? 'focus' : 'idle'} wrap>
          kiwi.gif · Last-Modified: {LM}
        </Tag>
        <Tag show={at(step, 1)} tone={step === 1 ? 'neg' : 'idle'}>
          {step >= 3 ? 'kopi findes — er den frisk?' : 'miss'}
        </Tag>
      </div>

      <div className="kcc-seq">
        {MSGS.map((m, i) => (
          <Row key={i} m={m} i={i} on={i < sent} now={i >= nowFrom && i < sent} />
        ))}
        <motion.div
          className="kcc-later"
          initial={false}
          animate={{ opacity: at(step, 3) ? 1 : 0 }}
          transition={t.fade}
        >
          en uge senere
        </motion.div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-cookies-caching',
  title: 'Proxy-cachen og conditional GET',
  steps: [
    {
      caption:
        'Browseren er konfigureret til at sende alle HTTP-requests til en **web cache** (proxy server), der står mellem den og **origin-serveren**.',
      hold: 2200,
    },
    {
      caption:
        'Cachen har ikke `kiwi.gif` (**miss**). Den åbner selv en TCP-forbindelse til origin-serveren og spørger — nu er den **klient**.',
      hold: 2600,
    },
    {
      caption:
        'Svaret er `200 OK` med objektet. Cachen gemmer en kopi **sammen med** `Last-Modified`-datoen og sender objektet videre til browseren.',
      hold: 2800,
    },
    {
      caption:
        'En uge senere beder en anden browser om samme objekt. Kopien kan være forældet, så cachen sender en **conditional GET**: `If-modified-since` er præcis den gemte `Last-Modified`.',
      hold: 3200,
    },
    {
      caption:
        'Objektet er uændret: serveren svarer `304 Not Modified` **uden body**, og cachen sender sin egen kopi. Kun en lille besked krydsede nettet.',
      hold: 3000,
    },
  ],
  Component: Cache,
}

export default viz
