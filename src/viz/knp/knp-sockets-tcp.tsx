import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-sockets-tcp.css'

/* Kurose & Ross s. 189–194 og figur 2.28 (s. 191, “The TCPServer process has two
   sockets”): welcoming socket (serverSocket, port 12000, listen(1)), connect()
   starter three-way handshaken, accept() laver connectionSocket til klienten,
   bytes begge veje i rækkefølge, connectionSocket.close() mens serverSocket
   forbliver åben, så næste klient kan banke på (s. 194). Fire værdier pr.
   connection socket: s. 220–222. “Klient A/B” er illustrative navne. */

type Phase = 'off' | 'knock' | 'open' | 'bytes' | 'closed'

// Fase pr. klient i hvert trin (0–5).
const A: Phase[] = ['off', 'knock', 'open', 'bytes', 'closed', 'closed']
const B: Phase[] = ['off', 'off', 'off', 'off', 'off', 'bytes']

function Fade({ show, children, className }: { show: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={{ opacity: show ? 1 : 0 }}
      transition={t.fade}
      aria-hidden={!show || undefined}
    >
      {children}
    </motion.div>
  )
}

function Client({ name, phase, ghost, row }: { name: string; phase: Phase; ghost: boolean; row: number }) {
  const tone: Tone = ghost ? 'ghost' : phase === 'closed' ? 'muted' : phase === 'off' ? 'idle' : 'focus'
  return (
    <Node className="kt-client" title={`Klient ${name}`} tone={tone} style={{ gridRow: row, gridColumn: 1 }}>
      <code className="kt-code">client{'\u00AD'}Socket</code>
      <div className="kt-sub">
        {phase === 'closed' ? (
          <>
            <code>close()</code> — forbindelsen er lukket
          </>
        ) : (
          <>
            <code>
              connect(<wbr />
              (serverName, <wbr />
              12000))
            </code>
          </>
        )}
      </div>
    </Node>
  )
}

function Conn({ name, phase, row }: { name: string; phase: Phase; row: number }) {
  const show = phase === 'open' || phase === 'bytes' || phase === 'closed'
  const tone: Tone = !show ? 'ghost' : phase === 'closed' ? 'muted' : 'focus'
  return (
    <Node className="kt-sock" tone={tone} style={{ gridRow: row, gridColumn: 3 }}>
      <Fade show={show} className="kt-sock-body">
        <code className="kt-code">connection{'\u00AD'}Socket</code>
        <div className="kt-sub">{phase === 'closed' ? 'lukket med close()' : `ny socket fra accept(), kun til klient ${name}`}</div>
      </Fade>
    </Node>
  )
}

function Pipe({ phase, label, row }: { phase: Phase; label: string; row: number }) {
  const on = phase === 'open' || phase === 'bytes'
  const flow = phase === 'bytes'
  return (
    <div className="kt-pipe" style={{ gridRow: row, gridColumn: 2 }}>
      <Fade show={on} className="kt-pipe-label">
        {label}
      </Fade>
      <Link on={flow} tone={flow ? 'focus' : 'idle'} />
      <Link on={flow} back tone={flow ? 'focus' : 'idle'} />
      <Fade show={flow} className="kt-pipe-label">
        bytes begge veje, i rækkefølge
      </Fade>
    </div>
  )
}

function Tcp({ step }: { step: number }) {
  const knockA = step === 1
  const knockB = step === 5
  const knock = knockA || knockB
  return (
    <div className="kt">
      <div className="kt-grid">
        <div className="kt-colhead">Klientprocesser</div>
        <div className="kt-colhead kt-mid" />
        <div className="kt-server" aria-hidden />
        <div className="kt-colhead kt-srvhead">TCPServer-proces</div>

        {/* Række 1: welcoming socket og banke-på-linjen. */}
        <div className="kt-knockfrom">
          <Fade show={knock || step >= 2}>
            <Tag tone={knock ? 'focus' : 'idle'} wrap>
              {knockB ? 'klient B banker på' : 'klient A banker på'}
            </Tag>
          </Fade>
        </div>
        <div className="kt-knock">
          <Fade show={knock} className="kt-pipe-label">
            three-way handshake
          </Fade>
          <Link on={knock} tone={knock ? 'focus' : 'idle'} />
        </div>
        <Node className="kt-sock kt-welcome" tone={knock ? 'focus' : 'idle'}>
          <code className="kt-code">server{'\u00AD'}Socket</code>
          <div className="kt-sub">
            welcoming socket · <code>bind</code> port 12000 · <code>listen(1)</code>
          </div>
          <Fade show={step >= 4} className="kt-still">
            <Tag tone={step === 4 ? 'focus' : 'idle'} wrap>
              stadig åben
            </Tag>
          </Fade>
        </Node>

        {/* Række 2: klient A. */}
        <Client name="A" phase={A[step]} ghost={false} row={3} />
        <Pipe phase={A[step]} label="TCP-forbindelse A" row={3} />
        <Conn name="A" phase={A[step]} row={3} />

        {/* Række 3: klient B. */}
        <Client name="B" phase={B[step]} ghost={step < 5} row={4} />
        <Pipe phase={B[step]} label="TCP-forbindelse B" row={4} />
        <Conn name="B" phase={B[step]} row={4} />
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-sockets-tcp',
  title: 'Welcoming socket og en ny connection socket pr. klient',
  steps: [
    {
      caption: 'Serveren har lavet sin **welcoming socket**: `SOCK_STREAM`, bundet til port 12000, og `listen(1)` venter på forbindelser.',
      hold: 2400,
    },
    {
      caption:
        'Klient A kalder `connect` mod serverens IP og port 12000 — den banker på welcoming socket. Transportlaget laver **three-way handshaken**; programmet ser den ikke.',
      hold: 3000,
    },
    {
      caption: '`accept()` laver en **ny** socket, `connectionSocket`, kun til klient A. Nu er de to sockets forbundet af et rør.',
      hold: 2800,
    },
    {
      caption: 'Klienten sender bytes uden at hæfte en adresse på. TCP leverer hver byte pålideligt og i rækkefølge — begge veje gennem samme socket.',
      hold: 2800,
    },
    {
      caption: 'Serveren lukker `connectionSocket` efter svaret. Welcoming socket er **stadig åben**.',
      hold: 2200,
    },
    {
      caption:
        'Derfor kan klient B banke på samme port og få sin egen connection socket. Hver connection socket kendes på fire værdier: kilde- og destinations-IP og -port.',
      hold: 3200,
    },
  ],
  Component: Tcp,
}

export default viz
