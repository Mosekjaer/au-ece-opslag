import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Tag, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './stm-til-kode.css'

/* Minuturet (SWISE L22–L23). Tilstandsdiagrammet for Ur fra ApplicationModel.pdf s. 2
   (= ImplementationFinal.pdf s. 2). Koden er ordret fra MinutUrCpp.zip (Ur.h, Ur.cpp),
   kun indrykningen er normaliseret; `…` markerer udeladte linjer. Platformkortene i
   slutrammen: MinutUrCpp main.cpp, MinutUrCppInt main.cpp, MinuturWPF
   MainWindow.xaml.cs og Boundary/TimerBoundary.cs, forkortet (klammer og
   else-grene udeladt, `→` = kalder). */

type State = 'Stoppet' | 'Startet'

interface Trans {
  id: string
  from: State | null
  to: State | null
  label: string
  /** Hvor transitionen står i koden. */
  where: ReactNode
  /** Trin hvor den mappes. */
  at: number
  /** Ikke en transition i diagrammet: hændelsen ignoreres. */
  none?: boolean
}

const TRANS: Trans[] = [
  { id: 'init', from: null, to: 'Stoppet', label: '/ nulstil()', where: <>constructor <code>Ur::Ur()</code></>, at: 1 },
  { id: 'reset', from: 'Stoppet', to: 'Stoppet', label: 'reset / nulstil()', where: <><code>Ur::reset()</code> · <code>case STOPPET</code></>, at: 5 },
  { id: 'start', from: 'Stoppet', to: 'Startet', label: 'start / timerObj.start()', where: <><code>Ur::start()</code> · <code>case STOPPET</code></>, at: 2 },
  { id: 'stop', from: 'Startet', to: 'Stoppet', label: 'stop / timerObj.stop()', where: <><code>Ur::stop()</code> · <code>case STARTET</code></>, at: 5 },
  {
    id: 'timeout',
    from: 'Startet',
    to: 'Startet',
    label: 'timeout / timerObj.start(), taelOp(), displayObj.vis(min, sec)',
    where: <><code>Ur::timeout()</code> · <code>case STARTET</code></>,
    at: 3,
  },
  {
    id: 'ignored',
    from: 'Startet',
    to: null,
    label: 'start — ingen transition',
    where: <><code>Ur::start()</code> · tom <code>case STARTET</code></>,
    at: 4,
    none: true,
  },
]

/** Hvilken transition er i fokus på hvert trin. */
const FOCUS: Record<number, string[]> = { 1: ['init'], 2: ['start'], 3: ['timeout'], 4: ['ignored'], 5: ['reset', 'stop'] }

/* ------------------------------- Koden --------------------------------- */

interface Line {
  s: string
  i?: number
  hl?: boolean
}
interface Listing {
  file: string
  lines: Line[]
}

const L = (s: string, i = 0, hl = false): Line => ({ s, i, hl })

const HEADER: Listing = {
  file: 'Ur.h (uddrag)',
  lines: [
    L('enum Tilstand { STARTET, STOPPET};', 0, true),
    L('class Ur'),
    L('{'),
    L('private:'),
    L('…', 1),
    L('Tilstand tilstand;', 1, true),
    L('public:'),
    L('Ur(Timer *timerPtr, Display * displayPt);', 1),
    L('void start();', 1, true),
    L('void stop();', 1, true),
    L('void reset();', 1, true),
    L('void timeout();', 1, true),
    L('private:'),
    L('void nulstil();', 1),
    L('void taelOp();', 1),
    L('};'),
  ],
}

const CTOR: Listing = {
  file: 'Ur.cpp',
  lines: [
    L('Ur::Ur(Timer *timerPtr, Display * displayPtr)'),
    L(': timerObjPtr(timerPtr), displayObjPtr(displayPtr)', 1),
    L('{'),
    L('nulstil();', 1, true),
    L('tilstand = STOPPET;', 1, true),
    L('}'),
  ],
}

const start = (hlStopped: boolean, hlStarted: boolean): Listing => ({
  file: 'Ur.cpp',
  lines: [
    L('void Ur::start()'),
    L('{'),
    L('switch (tilstand)', 1),
    L('{', 1),
    L('case STOPPET:', 2, hlStopped),
    L('timerObjPtr->start();', 2, hlStopped),
    L('tilstand = STARTET;', 2, hlStopped),
    L('break;', 2, hlStopped),
    L(''),
    L('case STARTET:', 2, hlStarted),
    L('break;', 2, hlStarted),
    L('}', 1),
    L('}'),
  ],
})

const TIMEOUT: Listing = {
  file: 'Ur.cpp',
  lines: [
    L('void Ur::timeout()'),
    L('{'),
    L('switch (tilstand)', 1),
    L('{', 1),
    L('case STOPPET:', 2),
    L('break;', 2),
    L(''),
    L('case STARTET:', 2, true),
    L('timerObjPtr->start();', 2, true),
    L('taelOp();', 2, true),
    L('displayObjPtr->vis(minutter, sekunder);', 2, true),
    L('break;', 2, true),
    L('}', 1),
    L('}'),
  ],
}

const RESET: Listing = {
  file: 'Ur.cpp',
  lines: [
    L('void Ur::reset()'),
    L('{'),
    L('switch (tilstand)', 1),
    L('{', 1),
    L('case STOPPET:', 2, true),
    L('nulstil();', 2, true),
    L('break;', 2, true),
    L(''),
    L('case STARTET:', 2),
    L('break;', 2),
    L('}', 1),
    L('}'),
  ],
}

function Code({ listing }: { listing: Listing }) {
  return (
    <div className="s2k-code">
      <div className="s2k-file">
        <code>{listing.file}</code>
      </div>
      <div className="s2k-lines">
        {listing.lines.map((l, i) => (
          <div key={i} className="s2k-line" data-hl={l.hl || undefined} style={{ '--ind': l.i ?? 0 } as CSSProperties}>
            <code>{l.s || ' '}</code>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Slutrammen: hvem kalder Ur på hver platform. */
function Platforms() {
  const cards = [
    {
      name: 'C++ med polling',
      file: 'main.cpp',
      lines: ['if (knapper.checkTast(START))', '  ur.start();', '…', 'if (timerObj.checkForTimeout())', '  ur.timeout();'],
    },
    {
      name: 'C++ med interrupts',
      file: 'main.cpp',
      lines: ['ISR (TIMER1_OVF_vect)', '{', '  globalUrObj.timeout();', '}'],
    },
    {
      name: 'C# / WPF',
      file: 'MainWindow.xaml.cs · TimerBoundary.cs',
      lines: ['Start_Click(…) → _ur.Start();', 'HandleTimerTick(…) → MitUr.TimeOut();'],
    },
  ]
  return (
    <div className="s2k-code s2k-plat">
      <div className="s2k-file">
        Hvem kalder <code>Ur</code>?
      </div>
      <div className="s2k-cards">
        {cards.map((c) => (
          <div key={c.name} className="s2k-card">
            <div className="s2k-card-head">
              <span className="s2k-card-name">{c.name}</span>
              <code className="s2k-card-file">{c.file}</code>
            </div>
            {c.lines.map((l, i) => (
              <code key={i} className="s2k-card-line">
                {l}
              </code>
            ))}
          </div>
        ))}
      </div>
      <div className="s2k-same">
        <Tag tone="ok">Ur.h og Ur.cpp er de samme</Tag>
      </div>
    </div>
  )
}

/* ------------------------------- Figuren ------------------------------- */

function StmTilKode({ step }: { step: number }) {
  const focus = FOCUS[step] ?? []
  const stateTone = (s: State): Tone => {
    if (step === 0) return 'focus'
    const f = TRANS.filter((tr) => focus.includes(tr.id))
    return f.some((tr) => tr.from === s || (tr.from === null && tr.to === s)) ? 'focus' : 'idle'
  }
  const codeIdx = Math.min(Math.max(step, 0), 6)

  return (
    <div className="s2k">
      <div className="s2k-model">
        <span className="vcaps">Tilstandsdiagram for Ur («controller»)</span>
        <div className="s2k-states">
          {(['Stoppet', 'Startet'] as State[]).map((s) => (
            <span key={s} className="s2k-state" data-tone={stateTone(s)}>
              {s}
            </span>
          ))}
          <motion.span
            className="s2k-enum"
            initial={false}
            animate={{ opacity: step === 0 ? 1 : 0.55 }}
            transition={t.fade}
          >
            → <code>enum Tilstand</code>
          </motion.span>
        </div>

        <ol className="s2k-trans">
          {TRANS.map((tr) => {
            const on = focus.includes(tr.id)
            const mapped = step >= tr.at
            const tone: Tone = on ? 'focus' : mapped ? 'ok' : 'idle'
            return (
              <li key={tr.id} className="s2k-row" data-tone={tone} data-none={tr.none || undefined}>
                <span className="s2k-edge">
                  <span className="s2k-from">{tr.from ?? '●'}</span>
                  <span className="s2k-arrow" aria-hidden="true">
                    →
                  </span>
                  <span className="s2k-to">{tr.to ?? '—'}</span>
                </span>
                <span className="s2k-body">
                  <code className="s2k-label">{tr.label}</code>
                  <span className="s2k-where">
                    <Tag tone={on ? 'focus' : 'ok'} show={mapped} wrap>
                      <span>{tr.where}</span>
                    </Tag>
                  </span>
                </span>
              </li>
            )
          })}
        </ol>
      </div>

      <Swap
        className="s2k-right"
        show={codeIdx}
        items={[
          <Code key="h" listing={HEADER} />,
          <Code key="c" listing={CTOR} />,
          <Code key="s" listing={start(true, false)} />,
          <Code key="t" listing={TIMEOUT} />,
          <Code key="i" listing={start(false, true)} />,
          <Code key="r" listing={RESET} />,
          <Platforms key="p" />,
        ]}
      />
    </div>
  )
}

const viz: VizDef = {
  id: 'stm-til-kode',
  title: 'Minuturets tilstandsmaskine bliver til kode',
  steps: [
    {
      caption:
        'Udgangspunktet er tilstandsdiagrammet for `Ur` fra applikationsmodellen. Tilstandene bliver en `enum`, og hver hændelse bliver en public operation i `Ur.h`.',
      hold: 2800,
    },
    {
      caption: 'Initialtransitionen `/ nulstil()` bliver constructoren: den kalder `nulstil()` og sætter starttilstanden `STOPPET`.',
      hold: 2300,
    },
    {
      caption:
        '`start` i `Stoppet`: operationen `start()` switcher på tilstanden. I `case STOPPET` står transitionens action og tildelingen af måltilstanden.',
      hold: 2800,
    },
    {
      caption:
        '`timeout` i `Startet`: STM’ens tre actions bliver tre kald i `case STARTET`. Tilstanden er den samme, så der er ingen tildeling.',
      hold: 2800,
    },
    {
      caption:
        '`start` i `Startet` har ingen transition i diagrammet. I koden er det en **tom `case`**: hændelsen ignoreres — af `Ur`, ikke af hovedprogrammet.',
      hold: 2800,
    },
    {
      caption: '`reset` virker kun i `Stoppet`, og `stop` følger samme mønster som `start`. Nu har hver transition sin plads i koden.',
      hold: 2400,
    },
    {
      caption:
        'Hvem der kalder operationerne, afhænger af platformen: en polling-løkke, en ISR eller WPF-events. **`Ur` er uændret** — boundary-laget og hovedprogrammet skifter.',
      hold: 3200,
    },
  ],
  Component: StmTilKode,
}

export default viz
