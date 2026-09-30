import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, Token, at } from '../kit/primitives'
import './knp-udp-mux-demux.css'

/* Kurose & Ross (Global Ed.) kap. 3:
   – UDP: vært A, port 19157, sender til port 46428 på B; svaret har portene byttet om
     (figur 3.4, s. 220–221). En UDP-socket er identificeret af (dest-IP, dest-port) (s. 220).
   – TCP: web-server B på port 80; vært C har to forbindelser med source port 26145 og 7532,
     vært A én med source port 26145 (figur 3.5, s. 223). Alle fire værdier bruges (s. 220–222).
   IP-adresserne hedder A, B og C som i bogen. */

const SEGS = [
  { id: 'c1', src: 'C', sport: '26145', at: 3 },
  { id: 'c2', src: 'C', sport: '7532', at: 4 },
  { id: 'a1', src: 'A', sport: '26145', at: 5 },
] as const

function Seg({ src, sport }: { src: string; sport: string }) {
  return (
    <span className="kmx-seg mono">
      {src}:{sport} → B:80
    </span>
  )
}

function Slot({ children }: { children?: ReactNode }) {
  return <span className="kmx-slot">{children}</span>
}

function Udp({ step }: { step: number }) {
  const back = at(step, 2)
  const token = (
    <Token id="udp-seg" tone="focus" launch={step === 1 || step === 2}>
      <span className="mono">{back ? '46428 → 19157' : '19157 → 46428'}</span>
    </Token>
  )
  const inA = step === 0 || back
  return (
    <section className="kmx-panel" data-on={!(step === 3 || step === 4) || undefined}>
      <header className="kmx-head">
        <span className="kmx-proto">UDP</span>
        <span className="vcaps">figur 3.4</span>
      </header>
      <div className="kmx-udp">
        <div className="kmx-host">
          <span className="kmx-host-name">Vært A</span>
          <span className="kmx-sock" data-tone={back && step <= 2 ? 'focus' : 'idle'}>
            <span className="mono">port 19157</span>
            <Slot>{inA && token}</Slot>
          </span>
        </div>
        <div className="kmx-host">
          <span className="kmx-host-name">Server B</span>
          <span className="kmx-sock" data-tone={step === 1 ? 'focus' : at(step, 1) ? 'ok' : 'idle'}>
            <span className="mono">port 46428</span>
            <Slot>{!inA && token}</Slot>
          </span>
        </div>
      </div>
      <div className="kmx-notes">
        <Tag show={at(step, 1)} tone={step === 1 ? 'focus' : 'idle'} wrap>
          socket = (B, 46428)
        </Tag>
        <Tag show={at(step, 2)} tone={step === 2 ? 'focus' : 'idle'} wrap>
          svar: portene byttet om
        </Tag>
      </div>
    </section>
  )
}

function Tcp({ step }: { step: number }) {
  return (
    <section className="kmx-panel" data-on={!(step === 1 || step === 2) || undefined}>
      <header className="kmx-head">
        <span className="kmx-proto">TCP</span>
        <span className="vcaps">figur 3.5 · web-server B, port 80</span>
      </header>
      <div className="kmx-tcp">
        <div className="kmx-queue">
          <span className="vcaps">ankommer</span>
          {SEGS.map((s) => (
            <Slot key={s.id}>
              {step < s.at && (
                <Token id={`tcp-${s.id}`} tone="idle">
                  <Seg src={s.src} sport={s.sport} />
                </Token>
              )}
            </Slot>
          ))}
          <Tag show={at(step, 5)} tone="idle">
            alle tre leveret
          </Tag>
        </div>
        <ol className="kmx-socks">
          <li className="kmx-sock is-welcome" data-tone="muted">
            <span className="kmx-tuple">
              <span className="mono">velkomst-socket :80</span>
              <span className="kmx-note">kun nye forbindelser</span>
            </span>
          </li>
          {SEGS.map((s) => {
            const here = at(step, s.at)
            const now = step === s.at
            const clash = s.id === 'a1' && now
            return (
              <li key={s.id} className="kmx-sock" data-tone={now ? 'focus' : here ? 'ok' : 'idle'}>
                <span className="kmx-tuple">
                  <span className="mono">
                    ({s.src}, <b data-clash={clash || undefined}>{s.sport}</b>, B, 80)
                  </span>
                </span>
                <Slot>
                  {here && (
                    <Token id={`tcp-${s.id}`} tone={now ? 'focus' : 'idle'}>
                      <Seg src={s.src} sport={s.sport} />
                    </Token>
                  )}
                </Slot>
              </li>
            )
          })}
        </ol>
      </div>
      <div className="kmx-notes">
        <Tag show={at(step, 5)} tone={step === 5 ? 'focus' : 'idle'} wrap>
          samme source port 26145 — forskellig source-IP → hver sin socket
        </Tag>
      </div>
    </section>
  )
}

function MuxDemux({ step }: { step: number }) {
  return (
    <div className="kmx">
      <Udp step={step} />
      <Tcp step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-udp-mux-demux',
  title: 'Demultiplexing med portnumre i UDP og TCP',
  steps: [
    {
      caption: 'Til venstre bogens UDP-eksempel, til højre dens web-server. Modtageren skal aflevere hvert segment til den rigtige **socket**.',
      hold: 2200,
    },
    {
      caption: 'Vært A sender fra port 19157 til port 46428. B ser kun på **destinationen**: en UDP-socket er (dest-IP, dest-port).',
      hold: 2400,
    },
    {
      caption: 'B svarer med portene **byttet om**. Afsenderens port fungerer som returadresse.',
      hold: 2200,
    },
    {
      caption: 'TCP: alle segmenter har destination port 80. B bruger **alle fire værdier** og finder forbindelsessocketen for (C, 26145, B, 80).',
      hold: 2600,
    },
    { caption: 'C’s anden forbindelse har source port 7532 og får sin egen socket.', hold: 1800 },
    {
      caption: 'A har *også* valgt source port 26145. Source-IP’en er forskellig, så 4-tuplen er ny — **tre forbindelser, tre sockets** på samme port 80.',
      hold: 3000,
    },
  ],
  Component: MuxDemux,
}

export default viz
