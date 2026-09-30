import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, at } from '../kit/primitives'
import { t } from '../kit/motion'
import './knp-sockets-filserver.css'

/* Illustrativt protokolforløb, udledt af skabelonen til Exercise 6
   (sem3/knp/Socket/Exercise_6_template/Exercise6_template/): PORT 9000 og BUFSIZE 1000
   (iknlib.h l. 4–5), writeTextTCP sender tekst + nulbyte (iknlib.c l. 47–50),
   readTextTCP læser til nulbyten (l. 25–39), readFileSizeTCP: tekst → atol (l. 58–63),
   getFilesize: 0 hvis filen ikke findes (l. 77–90), extractFileName (l. 65–75),
   sendFile/receiveFile tager fileSize (file_server.cpp l. 25, file_client.cpp l. 24).
   Rækkefølgen og bidstørrelsen står IKKE i skabelonen; opgaveteksten mangler. */

function Fade({ show, children, className }: { show: boolean; children: ReactNode; className?: string }) {
  return (
    <motion.div
      className={className}
      initial={false}
      animate={show ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
      transition={show ? t.place : t.fade}
      aria-hidden={!show || undefined}
    >
      {children}
    </motion.div>
  )
}

function Bytes({ cells }: { cells: { text: ReactNode; kind?: 'nul' | 'data' }[] }) {
  return (
    <div className="kf-bytes">
      {cells.map((c, i) => (
        <span key={i} className="kf-b" data-kind={c.kind ?? 'text'}>
          {c.text}
        </span>
      ))}
    </div>
  )
}

function Msg({ on, focus, leftward, call, body }: { on: boolean; focus: boolean; leftward?: boolean; call: ReactNode; body: ReactNode }) {
  return (
    <div className="kf-msg">
      <Fade show={on} className="kf-call">
        {call}
      </Fade>
      <Link on={on} back={leftward} tone={focus ? 'focus' : 'idle'} />
      <Fade show={on} className="kf-body">
        {body}
      </Fade>
    </div>
  )
}

function Step({ show, focus, children }: { show: boolean; focus: boolean; children: ReactNode }) {
  return (
    <Node className="kf-cell" show={show} tone={focus ? 'focus' : 'idle'}>
      {children}
    </Node>
  )
}

function Filserver({ step }: { step: number }) {
  return (
    <div className="kf">
      <div className="kf-flag">
        <Tag tone="idle" wrap>
          Illustrativt: rækkefølgen er udledt af skabelonens hjælpefunktioner — opgaveteksten mangler
        </Tag>
      </div>
      <div className="kf-grid">
        <Node className="kf-head" title="Klient" sub="file_client <værtsnavn> <filnavn>" />
        <Node className="kf-head" title="Server" sub="file_server · PORT 9000" />

        <div className="kf-conn">
          <span>TCP-forbindelse til port 9000 — <code>connect</code> / <code>accept</code> som i TCP-demoen</span>
        </div>

        {/* 1: filnavnet som tekst med nulbyte. */}
        <Msg
          on={at(step, 1)}
          focus={step === 1}
          call={<code>writeTextTCP(sock, filnavn)</code>}
          body={<Bytes cells={[{ text: 'filnavn (evt. med sti)' }, { text: '\\0', kind: 'nul' }]} />}
        />

        {/* 2: serveren læser til nulbyten og slår størrelsen op. */}
        <div className="kf-cell kf-empty" />
        <Step show={at(step, 2)} focus={step === 2}>
          <code className="kf-code">readTextTCP(…)</code>
          <div className="kf-note">læser én byte ad gangen til nulbyten</div>
          <code className="kf-code">
            getFilesize(<wbr />
            filnavn)
          </code>
          <div className="kf-note">
            <code>stat()</code>: størrelsen — eller 0, hvis filen ikke findes
          </div>
        </Step>

        {/* 3: størrelsen som decimaltekst. */}
        <Msg
          on={at(step, 3)}
          focus={step === 3}
          leftward
          call={<code>writeTextTCP(sock, størrelse som tekst)</code>}
          body={<Bytes cells={[{ text: 'størrelse i decimaltekst' }, { text: '\\0', kind: 'nul' }]} />}
        />
        <Step show={at(step, 3)} focus={step === 3}>
          <code className="kf-code">read{'\u00AD'}File{'\u00AD'}SizeTCP(…)</code>
          <div className="kf-note">
            tekst → tal med <code>atol</code>; 0 betyder: filen findes ikke, stop her
          </div>
        </Step>
        <div className="kf-cell kf-empty" />

        {/* 4: data i bidder. */}
        <Msg
          on={at(step, 4)}
          focus={step === 4}
          leftward
          call={<code>sendFile(sock, filnavn, størrelse)</code>}
          body={
            <Bytes
              cells={[
                { text: 'bid', kind: 'data' },
                { text: 'bid', kind: 'data' },
                { text: '…', kind: 'data' },
                { text: 'sidste, kortere bid', kind: 'data' },
              ]}
            />
          }
        />

        {/* 5: klienten tæller til størrelsen; begge lukker. */}
        <Step show={at(step, 5)} focus={step === 5}>
          <code className="kf-code">receiveFile(sock, filnavn, størrelse)</code>
          <div className="kf-note">læser, til den har fået præcis «størrelse» bytes; gemmer under <code>
              extract{'\u00AD'}File{'\u00AD'}Name(<wbr />
              filnavn)
            </code></div>
          <code className="kf-code">close()</code>
        </Step>
        <Step show={at(step, 5)} focus={false}>
          <code className="kf-code">close()</code>
          <div className="kf-note">efter sidste bid</div>
        </Step>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'knp-sockets-filserver',
  title: 'Filnavn, størrelse og data over én TCP-forbindelse',
  steps: [
    {
      caption: 'Klienten har forbundet sig til serverens port 9000. TCP giver nu et rør af bytes — men ingen beskedgrænser.',
      hold: 2400,
    },
    {
      caption: 'Klienten sender filnavnet med `writeTextTCP`: teksten **plus en nulbyte**, som markerer, hvor navnet slutter.',
      hold: 2600,
    },
    {
      caption: 'Serveren læser byte for byte, til den møder nulbyten, og slår filens størrelse op. En fil, der ikke findes, giver 0.',
      hold: 2800,
    },
    {
      caption: '**Størrelsen først**: serveren sender den som decimaltekst med nulbyte. Klienten laver den om til et tal — og stopper, hvis den er 0.',
      hold: 3000,
    },
    {
      caption: 'Så kommer fildataene som rå bytes i bidder. Den sidste bid er kortere; der er ingen nulbyte, for filen kan selv indeholde 0-bytes.',
      hold: 3000,
    },
    {
      caption:
        'Klienten ved fra størrelsen, hvornår filen er slut, gemmer den under filnavnet uden sti, og begge sider lukker forbindelsen.',
      hold: 3000,
    },
  ],
  Component: Filserver,
}

export default viz
