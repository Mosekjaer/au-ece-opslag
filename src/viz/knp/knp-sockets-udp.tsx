import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-sockets-udp.css'

/* Kurose & Ross s. 185–189: figur 2.27 (server til venstre, klient til højre),
   UDPClient.py (s. 186) og UDPServer.py (s. 188). Port 12000 og recvfrom(2048)
   står i bogens kode. Klientens port vælges af OS'et (s. 187, 219); afsenderadressen
   hæftes på af OS'et (s. 185). Ingen handshake (s. 122). Beskedens indhold er bogens
   “lowercase sentence”, ikke konkrete data. */

function Pkt({ show, to, from, data }: { show: boolean; to: ReactNode; from: ReactNode; data: ReactNode }) {
  return (
    <motion.div
      className="ku-pkt"
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={show ? t.place : t.fade}
      aria-hidden={!show || undefined}
    >
      <span className="ku-f is-addr">
        <span className="ku-fk">til</span>
        {to}
      </span>
      <span className="ku-f is-addr">
        <span className="ku-fk">fra</span>
        {from}
      </span>
      <span className="ku-f is-data">
        <span className="ku-fk">data</span>
        {data}
      </span>
    </motion.div>
  )
}

function Msg({
  on,
  focus,
  leftward,
  call,
  pkt,
  note,
}: {
  on: boolean
  focus: boolean
  leftward?: boolean
  call: ReactNode
  pkt: ReactNode
  note?: ReactNode
}) {
  return (
    <div className="ku-msg" data-dir={leftward ? 'left' : 'right'}>
      <motion.div
        className="ku-call"
        initial={false}
        animate={{ opacity: on ? 1 : 0 }}
        transition={t.fade}
        aria-hidden={!on || undefined}
      >
        {call}
      </motion.div>
      <Link on={on} back={leftward} tone={focus ? 'focus' : 'idle'} />
      {pkt}
      {note}
    </div>
  )
}

function Udp({ step }: { step: number }) {
  return (
    <div className="ku">
      <div className="ku-grid">
        <Node className="ku-head" title="Server" sub="UDPServer.py · kører på serverIP" />
        <Node className="ku-head" title="Klient" sub="UDPClient.py" />

        {/* Række 1: sockets oprettes. */}
        <Node className="ku-cell" show={at(step, 1)} tone={step === 1 ? 'focus' : 'idle'}>
          <code className="ku-code">socket(AF_INET, SOCK_DGRAM)</code>
          <code className="ku-code">bind(('', 12000))</code>
          <div className="ku-note">
            <Tag tone={step === 1 ? 'focus' : 'idle'}>port 12000</Tag> sat af udvikleren
          </div>
        </Node>
        <Node className="ku-cell" show={at(step, 2)} tone={step === 2 ? 'focus' : 'idle'}>
          <code className="ku-code">socket(AF_INET, SOCK_DGRAM)</code>
          <div className="ku-note">ingen bind: operativsystemet vælger en ledig port</div>
        </Node>

        {/* Besked 1: klient → server. */}
        <Msg
          on={at(step, 3)}
          focus={step === 3}
          leftward
          call={
            <>
              <code>sendto(message.encode(), (serverName, 12000))</code>
            </>
          }
          pkt={<Pkt show={at(step, 3)} to="serverIP : 12000" from="klientIP : klientport" data="linje, små bogstaver" />}
          note={
            <motion.div
              className="ku-nohs"
              initial={false}
              animate={{ opacity: at(step, 3) ? 1 : 0 }}
              transition={t.fade}
              aria-hidden={!at(step, 3) || undefined}
            >
              Ingen handshake først — den første pakke er data. «fra» hæftes på af OS’et.
            </motion.div>
          }
        />

        {/* Række 2: serveren modtager og behandler. */}
        <Node className="ku-cell" show={at(step, 4)} tone={step === 4 ? 'focus' : 'idle'}>
          <code className="ku-code">message, clientAddress = recvfrom(2048)</code>
          <code className="ku-code">message.decode().upper()</code>
          <div className="ku-note">
            <code>clientAddress</code> = klientens IP og port: returadressen
          </div>
        </Node>
        <div className="ku-cell ku-empty" />

        {/* Besked 2: server → klient. */}
        <Msg
          on={at(step, 5)}
          focus={step === 5}
          call={<code>sendto(modifiedMessage.encode(), clientAddress)</code>}
          pkt={<Pkt show={at(step, 5)} to="klientIP : klientport" from="serverIP : 12000" data="linje, store bogstaver" />}
        />

        {/* Række 3: klienten modtager og lukker; serveren venter igen. */}
        <Node className="ku-cell" show={at(step, 6)} tone="idle">
          <code className="ku-code">while True</code>
          <div className="ku-note">venter på næste pakke — fra en vilkårlig klient</div>
        </Node>
        <Node className="ku-cell" show={at(step, 6)} tone={step === 6 ? 'focus' : 'idle'}>
          <code className="ku-code">recvfrom(2048)</code>
          <code className="ku-code">close()</code>
          <div className="ku-note">udskriver svaret og lukker socketen</div>
        </Node>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-sockets-udp',
  title: 'En UDP-udveksling uden forbindelse',
  steps: [
    { caption: 'To processer på hver sin vært. Serveren skal køre, før klienten sender.', hold: 1600 },
    {
      caption: 'Serveren laver en UDP-socket (`SOCK_DGRAM`) og **binder** den selv til port 12000, så pakker til den port havner her.',
      hold: 2400,
    },
    {
      caption: 'Klienten laver også en UDP-socket, men kalder ikke `bind`: operativsystemet giver den en ledig port.',
      hold: 2200,
    },
    {
      caption:
        'Uden handshake sender klienten data med det samme. `sendto` hæfter **destinationen** på pakken; afsenderadressen sætter OS’et selv.',
      hold: 3000,
    },
    {
      caption: '`recvfrom` giver serveren både data og **afsenderens adresse**. Serveren laver linjen om til store bogstaver.',
      hold: 2600,
    },
    {
      caption: 'Svaret sendes med `sendto` til `clientAddress` — returadressen fra den modtagne pakke.',
      hold: 2400,
    },
    {
      caption:
        'Klienten modtager svaret og lukker socketen. Serveren er tilbage i løkken og har ingen forbindelse at rydde op i.',
      hold: 3000,
    },
  ],
  Component: Udp,
}

export default viz
