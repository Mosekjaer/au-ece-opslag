import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './ipc-models.css'

/* Bogens Figur 3.11 (gentaget på 02.1 s. 12): (a) shared memory, (b) message
   passing gennem en message queue i kernen. Kaldene shm_open/ftruncate/mmap med
   MAP_SHARED og beskeden "Hello" er fra bogens producer (Figur 3.16);
   send(message)/receive(message) fra bogens 3.6. Afvejningen (system calls kun
   ved oprettelse vs. ét pr. besked, "Synchronization is needed!") er fra slide 13
   og bogen 3.4. */

function Proc({ name, tone, children }: { name: string; tone: Tone; children?: ReactNode }) {
  return (
    <Node tone={tone} className="sx-ipc-proc">
      <div className="sx-ipc-pname">{name}</div>
      <div className="sx-ipc-slot">{children}</div>
    </Node>
  )
}

function Note({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <motion.p className="sx-ipc-note" initial={false} animate={{ opacity: on ? 1 : 0, y: on ? 0 : 4 }} transition={on ? t.settle : t.fade}>
      {children}
    </motion.p>
  )
}

function Ipc({ step }: { step: number }) {
  const final = step === 6
  // (a) shared memory
  const mapped = at(step, 1)
  const hello = at(step, 2) // "Hello" ligger i området
  const read = at(step, 3)
  // (b) message passing
  const msgWhere = step < 4 ? 'a' : step === 4 ? 'q' : 'b'

  const smActive = step >= 1 && step <= 3
  const mpActive = step === 4 || step === 5

  return (
    <div className="sx-ipc">
      {/* (a) Shared memory */}
      <section className="sx-ipc-panel" data-on={smActive || undefined}>
        <h4 className="sx-ipc-title">
          <span className="sx-ipc-letter">(a)</span> Shared memory
        </h4>
        <div className="sx-ipc-grid">
          <Proc name="Proces A" tone={step === 2 ? 'focus' : 'idle'} />
          <div className="sx-ipc-mid">
            <Link on={hello} tone={step === 2 ? 'focus' : 'idle'} label="skriv" className="sx-ipc-h" />
            <Node tone={!mapped ? 'ghost' : step === 1 || step === 2 ? 'focus' : 'idle'} className="sx-ipc-shm">
              <div className="sx-ipc-pname">shared memory</div>
              <div className="sx-ipc-slot">
                <Tag show={hello} tone={step === 2 ? 'focus' : 'idle'}>
                  "Hello"
                </Tag>
              </div>
            </Node>
            <Link on={read} tone={step === 3 ? 'focus' : 'idle'} label="læs" className="sx-ipc-h" />
          </div>
          <Proc name="Proces B" tone={step === 3 ? 'focus' : 'idle'}>
            <Tag show={read} tone={step === 3 ? 'focus' : 'idle'}>
              "Hello"
            </Tag>
          </Proc>

          <Link on={mapped} vertical tone={step === 1 ? 'focus' : 'muted'} className="sx-ipc-v sx-ipc-va" />
          <Link on={mapped} vertical tone={step === 1 ? 'focus' : 'muted'} className="sx-ipc-v sx-ipc-vb" />

          <Node tone={step === 1 ? 'focus' : 'idle'} className="sx-ipc-kernel">
            <div className="sx-ipc-pname">Kernel</div>
            <div className="sx-ipc-calls">
              <Tag show={mapped} tone={step === 1 ? 'focus' : 'idle'}>
                shm_open
              </Tag>
              <Tag show={mapped} tone={step === 1 ? 'focus' : 'idle'}>
                ftruncate
              </Tag>
              <Tag show={mapped} tone={step === 1 ? 'focus' : 'idle'} wrap>
                mmap(…, MAP_SHARED, …)
              </Tag>
            </div>
          </Node>
        </div>
        <Note on={at(step, 3)}>
          System calls kun ved oprettelse. Bagefter er det almindelig hukommelsesadgang — og{' '}
          <b>“Synchronization is needed!”</b>
        </Note>
      </section>

      {/* (b) Message passing */}
      <section className="sx-ipc-panel" data-on={mpActive || undefined}>
        <h4 className="sx-ipc-title">
          <span className="sx-ipc-letter">(b)</span> Message passing
        </h4>
        <div className="sx-ipc-grid">
          <Proc name="Proces A" tone={step === 4 ? 'focus' : 'idle'}>
            {msgWhere === 'a' && (
              <Token id="sx-ipc-msg" tone={at(step, 4) ? 'focus' : 'idle'}>
                message
              </Token>
            )}
          </Proc>
          <div className="sx-ipc-mid sx-ipc-none">
            <span>ingen delt hukommelse</span>
          </div>
          <Proc name="Proces B" tone={step === 5 ? 'focus' : 'idle'}>
            {msgWhere === 'b' && (
              <Token id="sx-ipc-msg" tone={step === 5 ? 'focus' : 'idle'}>
                message
              </Token>
            )}
          </Proc>

          <Link on={at(step, 4)} vertical tone={step === 4 ? 'focus' : 'idle'} label={<code>send</code>} className="sx-ipc-v sx-ipc-va" />
          <Link on={at(step, 5)} vertical back tone={step === 5 ? 'focus' : 'idle'} label={<code>receive</code>} className="sx-ipc-v sx-ipc-vb" />

          <Node tone={mpActive ? 'focus' : 'idle'} className="sx-ipc-kernel">
            <div className="sx-ipc-pname">Kernel</div>
            <div className="sx-ipc-queue">
              <span className="sx-ipc-qname">message queue</span>
              <span className="sx-ipc-slot sx-ipc-qslot">
                {msgWhere === 'q' && (
                  <Token id="sx-ipc-msg" tone="focus" launch>
                    message
                  </Token>
                )}
              </span>
            </div>
          </Node>
        </div>
        <Note on={at(step, 5)}>
          Hver besked er et system call: <code>send(message)</code> og <code>receive(message)</code>. Til gengæld virker det også distribueret.
        </Note>
      </section>

      <motion.p className="sx-ipc-sum" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
        Shared memory er hurtigst; message passing er nemmest til små datamængder og over netværk. Mange OS’er har begge.
      </motion.p>
    </div>
  )
}

const viz: VizDef = {
  id: 'ipc-models',
  title: 'Shared memory og message passing side om side',
  steps: [
    {
      caption: 'Bogens Figur 3.11. Proces A og B deler som udgangspunkt **ikke** hukommelse — samarbejde kræver IPC.',
      hold: 2000,
    },
    {
      caption: '(a) Processerne beder kernen om et område: `shm_open`, `ftruncate` og `mmap` med `MAP_SHARED` mapper det ind i begge.',
      hold: 2800,
    },
    { caption: 'A skriver `"Hello"` direkte i området. Kernen er ikke med — det er en almindelig skrivning i hukommelsen.', hold: 2400 },
    {
      caption: 'B læser samme bytes. Data bliver liggende i området, og intet forhindrer A i at skrive samtidig: **synkronisering** er programmørens ansvar.',
      hold: 3000,
    },
    { caption: '(b) Ingen delt hukommelse. A kalder `send(message)`, og kernen lægger beskeden i sin **message queue**.', hold: 2600 },
    { caption: 'B kalder `receive(message)` og får beskeden ud af køen. Kernen formidler hver eneste besked.', hold: 2400 },
    {
      caption: 'Afvejningen: shared memory koster kun system calls ved oprettelse; message passing ét pr. besked, men kræver ingen delt hukommelse.',
      hold: 3000,
    },
  ],
  Component: Ipc,
}

export default viz
