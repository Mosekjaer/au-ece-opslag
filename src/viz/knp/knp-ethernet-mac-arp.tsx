import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Swap, Tag, VTable, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-ethernet-mac-arp.css'

/* Kurose & Ross fig. 6.17 (s. 511): C = 222.222.222.220 / 1A-23-F9-CD-06-9B,
   B = 222.222.222.223 / 5C-66-AB-90-75-B1, A = 222.222.222.222 / 49-BD-D2-C7-56-2A,
   routeren 222.222.222.221 / 88-B2-2F-54-1A-0F. Bogen antager i dette afsnit, at
   switchen sender alle frames ud på alle andre interfaces (s. 511). ARP-tabellen i
   .220 er fig. 6.18 (s. 512); ny række: bogen giver ingen TTL, kun “typisk 20
   minutter” (s. 512). Query i broadcast-frame til FF-FF-FF-FF-FF-FF, response i
   standard-frame (s. 512–513); adaptere kasserer frames til andre MAC-adresser
   (s. 509–510); ARP type 0806 (s. 517). Bogen giver ikke type-nummeret for IP. */

type Id = 'C' | 'B' | 'A' | 'R'
const ST: { id: Id; name: string; ip: string; mac: string }[] = [
  { id: 'C', name: 'C', ip: '222.222.222.220', mac: '1A-23-F9-CD-06-9B' },
  { id: 'B', name: 'B', ip: '222.222.222.223', mac: '5C-66-AB-90-75-B1' },
  { id: 'A', name: 'A', ip: '222.222.222.222', mac: '49-BD-D2-C7-56-2A' },
  { id: 'R', name: 'Router', ip: '222.222.222.221', mac: '88-B2-2F-54-1A-0F' },
]

// Brudpunkter efter bindestreger, så en MAC-adresse kun knækker mellem bytes.
const mac = (s: string): ReactNode =>
  s.split('-').map((p, i, a) => (
    <span key={i}>
      {p}
      {i < a.length - 1 && (
        <>
          -<wbr />
        </>
      )}
    </span>
  ))

interface Beat {
  /** Hvem sender i dette trin (pil station → switch). */
  from?: Id
  /** Hvem framen når frem til (pil switch → station). */
  to: Id[]
  /** Station-status: tone og kort tekst. */
  st: Partial<Record<Id, [Tone, string]>>
}

const BEATS: Beat[] = [
  { to: [], st: { C: ['focus', 'vil sende til .222 — MAC ukendt'] } },
  {
    from: 'C',
    to: ['B', 'A', 'R'],
    st: { C: ['focus', 'sender ARP query'], B: ['idle', 'modtager broadcast'], A: ['idle', 'modtager broadcast'], R: ['idle', 'modtager broadcast'] },
  },
  {
    to: [],
    st: { A: ['ok', 'min IP → svarer'], B: ['muted', 'ikke min IP → ignorerer'], R: ['muted', 'ikke min IP → ignorerer'] },
  },
  {
    from: 'A',
    to: ['C', 'B', 'R'],
    st: { A: ['focus', 'sender ARP response'], C: ['ok', 'modtager svaret'], B: ['muted', 'forkert dest-MAC → kasserer'], R: ['muted', 'forkert dest-MAC → kasserer'] },
  },
  { to: [], st: { C: ['focus', 'gemmer .222 i ARP-tabellen'] } },
  {
    from: 'C',
    to: ['B', 'A', 'R'],
    st: { C: ['focus', 'sender IP-datagrammet'], A: ['ok', 'dest-MAC passer → op til IP'], B: ['muted', 'forkert dest-MAC → kasserer'], R: ['muted', 'forkert dest-MAC → kasserer'] },
  },
]
const LAST = BEATS.length - 1

const FRAMES = [
  { at: 1, name: 'ARP query', dest: 'FF-FF-FF-FF-FF-FF', src: '1A-23-F9-CD-06-9B', type: '0806', body: 'hvem har 222.222.222.222?', note: 'broadcast' },
  { at: 3, name: 'ARP response', dest: '1A-23-F9-CD-06-9B', src: '49-BD-D2-C7-56-2A', type: '0806', body: '222.222.222.222 = 49-BD-D2-C7-56-2A', note: 'unicast' },
  { at: 5, name: 'IP-datagram', dest: '49-BD-D2-C7-56-2A', src: '1A-23-F9-CD-06-9B', type: 'IP', body: 'til 222.222.222.222', note: 'unicast' },
]

// Alle tekster, en station kan vise; stablet i én celle, så højden er stabil.
const LABELS: Record<Id, string[]> = Object.fromEntries(
  ST.map((s) => [s.id, ['', ...new Set(BEATS.map((b) => b.st[s.id]?.[1]).filter((x): x is string => !!x))]]),
) as Record<Id, string[]>

function Arp({ step }: { step: number }) {
  const b = BEATS[Math.min(step, LAST)]
  const learned = step >= 4

  return (
    <div className="arp">
      <section className="arp-lan">
        <span className="vcaps">LAN i fig. 6.17 — switchen sender alt videre</span>
        <div className="arp-bus">
          <div className="arp-switch" data-on={b.from ? true : undefined}>
            switch
          </div>
          {ST.map((s, i) => {
            const sending = b.from === s.id
            const receiving = b.to.includes(s.id)
            const [tone, label] = b.st[s.id] ?? ['idle' as Tone, '']
            return (
              <div key={s.id} className="arp-row" style={{ gridRow: i + 1 }}>
                <Link
                  className="arp-link"
                  on={sending || receiving}
                  back={sending}
                  tone={sending ? 'focus' : receiving && tone === 'muted' ? 'muted' : receiving ? 'focus' : 'idle'}
                />
                <Node
                  className="arp-st"
                  tone={tone === 'idle' && !label ? 'idle' : tone}
                  title={
                    <>
                      <span className="arp-name">{s.name}</span> <span className="mono arp-ip">{s.ip}</span>
                    </>
                  }
                  sub={<span className="mono arp-mac">{mac(s.mac)}</span>}
                >
                  <Swap
                    className="arp-say"
                    show={Math.max(0, LABELS[s.id].indexOf(label))}
                    items={LABELS[s.id].map((l, k) => <span key={k}>{l}</span>)}
                  />
                </Node>
              </div>
            )
          })}
        </div>
      </section>

      <section className="arp-side">
        <VTable
          name={
            <>
              ARP-tabel i C (<span className="mono">.220</span>)
            </>
          }
          compact
          cols={['IP', 'MAC', 'TTL']}
          rows={[
            { key: '221', cells: ['222.222.222.221', '88-B2-2F-54-1A-0F', '13:45:00'] },
            { key: '223', cells: ['222.222.222.223', '5C-66-AB-90-75-B1', '13:52:00'] },
            {
              key: '222',
              cells: ['222.222.222.222', '49-BD-D2-C7-56-2A', '≈ 20 min'],
              tone: learned ? (step === 4 ? 'focus' : 'idle') : 'ghost',
            },
          ]}
        />

        <div className="arp-frames">
          {FRAMES.map((f) => {
            const show = step >= f.at
            return (
              <motion.div
                key={f.at}
                className="arp-frame"
                data-now={step === f.at || undefined}
                initial={false}
                animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 6 }}
                transition={show ? t.settle : t.fade}
                aria-hidden={!show || undefined}
              >
                <div className="arp-frame-head">
                  <strong>{f.name}</strong>
                  <Tag tone={f.note === 'broadcast' ? 'focus' : 'idle'}>{f.note}</Tag>
                </div>
                <dl className="arp-fields mono">
                  <dt>dest</dt>
                  <dd data-bc={f.dest.startsWith('FF') || undefined}>{mac(f.dest)}</dd>
                  <dt>src</dt>
                  <dd>{mac(f.src)}</dd>
                  <dt>type</dt>
                  <dd>{f.type}</dd>
                  <dt>data</dt>
                  <dd className="arp-body">{f.body}</dd>
                </dl>
              </motion.div>
            )
          })}
        </div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-ethernet-mac-arp',
  title: 'ARP finder MAC-adressen til 222.222.222.222',
  steps: [
    {
      caption:
        'C (`222.222.222.220`) vil sende et datagram til `222.222.222.222` på samme subnet. ARP-tabellen har kun `.221` og `.223` — MAC-adressen mangler.',
      hold: 2600,
    },
    {
      caption:
        'C sender en **ARP query** i en frame til broadcast-adressen `FF-FF-FF-FF-FF-FF`. Alle adaptere på subnettet modtager den.',
      hold: 2800,
    },
    {
      caption:
        'Hver adapter giver ARP-pakken op til sit ARP-modul. Kun A har IP-adressen `222.222.222.222`; B og routeren gør intet.',
      hold: 2600,
    },
    {
      caption:
        'A svarer med en **ARP response** i en almindelig frame til C’s MAC. Switchen sender den også til B og routeren, men deres adaptere kasserer en frame, der ikke er til dem.',
      hold: 3200,
    },
    {
      caption: 'C gemmer `222.222.222.222 → 49-BD-D2-C7-56-2A` i ARP-tabellen. Rækken udløber igen, typisk efter 20 minutter.',
      hold: 2400,
    },
    {
      caption: 'Nu kan C indkapsle datagrammet i en frame med A’s MAC som destination. Kun A giver det videre op til IP.',
      hold: 2800,
    },
  ],
  Component: Arp,
}

export default viz
