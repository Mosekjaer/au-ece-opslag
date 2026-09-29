import type { VizDef } from '../kit/types'
import { Link, Token } from '../kit/primitives'
import './process-states.css'

/* Slide 5 i 02.1 (processer) og bogens fig. 3.2: new → admitted → ready → scheduler
   dispatch → running; running → interrupt → ready, → I/O or event wait → waiting,
   → exit → terminated; waiting → I/O or event completion → ready. Slide 7: “Time Slice
   Passed?” sender processen direkte tilbage til ready queue. */

type St = 'new' | 'ready' | 'running' | 'waiting' | 'terminated'
type Edge = 'admitted' | 'dispatch' | 'interrupt' | 'wait' | 'completion' | 'exit'

const PATH: { at: St; via?: Edge }[] = [
  { at: 'new' },
  { at: 'ready', via: 'admitted' },
  { at: 'running', via: 'dispatch' },
  { at: 'waiting', via: 'wait' },
  { at: 'ready', via: 'completion' },
  { at: 'running', via: 'dispatch' },
  { at: 'terminated', via: 'exit' },
  { at: 'terminated' },
]

function States({ step }: { step: number }) {
  const { at, via } = PATH[Math.min(step, PATH.length - 1)]
  const last = step >= PATH.length - 1
  const hot = (e: Edge) => (via === e || (last && e === 'interrupt') ? 'focus' : 'idle')
  const token = (
    <Token id="ps-proc" launch={step === 1}>
      proces
    </Token>
  )
  const node = (s: St) => (
    <div className={`ps-node ps-${s} vnode`} data-tone={at === s ? 'focus' : 'idle'}>
      <div className="vnode-title">{s}</div>
      <span className="ps-slot">{at === s && token}</span>
    </div>
  )

  const conn = (e: Edge, cls: string, label?: string) => (
    <div className={`ps-c ${cls}`} data-tone={hot(e)} aria-hidden="true">
      {label && <span className="ps-clabel">{label}</span>}
    </div>
  )

  return (
    <div className="ps">
      {node('new')}
      <div className="ps-l ps-admitted">
        <Link on tone={hot('admitted')} label="admitted" className="ps-w" />
        <div className="ps-n ps-vrow">
          <Link on vertical tone={hot('admitted')} />
          <span className="ps-vl" data-tone={hot('admitted')}>admitted</span>
        </div>
      </div>
      {node('ready')}

      <div className="ps-l ps-pair">
        <div className="ps-w ps-hpair">
          <Link on tone={hot('dispatch')} label="scheduler dispatch" />
          <Link on back tone={hot('interrupt')} label="interrupt" className="ps-below" />
        </div>
        <div className="ps-n ps-vrow">
          <Link on vertical tone={hot('dispatch')} />
          <Link on vertical back tone={hot('interrupt')} />
          <span className="ps-vls">
            <span className="ps-vl" data-tone={hot('dispatch')}>↓ scheduler dispatch</span>
            <span className="ps-vl" data-tone={hot('interrupt')}>↑ interrupt</span>
          </span>
        </div>
      </div>

      {node('running')}
      <div className="ps-l ps-exit">
        <Link on tone={hot('exit')} label="exit" className="ps-w" />
        <div className="ps-n ps-vrow">
          <Link on vertical tone={hot('exit')} />
          <span className="ps-vl" data-tone={hot('exit')}>exit</span>
        </div>
      </div>
      {node('terminated')}

      {/* Bred plade: lodrette pile mellem række 1 og waiting. */}
      <div className="ps-l ps-w ps-completion">
        <Link on vertical back tone={hot('completion')} />
        <span className="ps-vl" data-tone={hot('completion')}>I/O or event completion</span>
      </div>
      <div className="ps-l ps-w ps-wait">
        <Link on vertical tone={hot('wait')} />
        <span className="ps-vl" data-tone={hot('wait')}>I/O or event wait</span>
      </div>

      {/* Smal plade: waiting står til højre; forbindelserne tegnes som vinkler. */}
      {conn('completion', 'ps-n ps-comp-a', 'I/O or event completion')}
      {conn('completion', 'ps-n ps-comp-b')}
      {conn('completion', 'ps-n ps-comp-c')}
      {conn('wait', 'ps-n ps-wait-a', 'I/O or event wait')}
      <div className="ps-n ps-wait-b">
        <Link on vertical tone={hot('wait')} />
      </div>

      {node('waiting')}
    </div>
  )
}

const viz: VizDef = {
  id: 'process-states',
  title: 'En proces gennem de fem tilstande',
  steps: [
    { caption: 'Processen er ved at blive oprettet: tilstanden er **new**.', hold: 1800 },
    { caption: 'OS’et optager den (*admitted*), og den står i **ready** og venter på en CPU.', hold: 2200 },
    { caption: 'Scheduleren vælger den (*scheduler dispatch*). Nu er den **running** — kun én pr. kerne ad gangen.', hold: 2400 },
    { caption: 'Den beder om I/O og må vente: **waiting**. CPU’en går til en anden proces imens.', hold: 2400 },
    {
      caption: 'I/O’en er færdig. Processen går tilbage til **ready** — aldrig direkte til running.',
      hold: 2800,
    },
    { caption: 'Scheduleren vælger den igen, og den er **running**.', hold: 1800 },
    { caption: 'Programmet slutter (*exit*), og processen er **terminated**.', hold: 2200 },
    {
      caption:
        'Den sidste overgang: et **interrupt** — fx når time slicen er brugt — sender running tilbage til ready. CPU-bound processer pendler dér; I/O-bound går ofte i waiting.',
      hold: 3200,
    },
  ],
  Component: States,
}

export default viz
