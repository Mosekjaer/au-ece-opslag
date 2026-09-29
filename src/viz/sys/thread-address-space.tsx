import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, Token, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './thread-address-space.css'

/* Bogens Figur 4.1 (slide 3 i 03.2a): single-threaded vs. multithreaded proces —
   code, data og files delt; registers, PC og stack pr. tråd. Den flertrådede
   proces er kursets multithreaded_cpp_thread.cpp: global std::atomic<int> sum{0},
   runner(char *param) med upper og local_sum, std::thread t(runner, argv[1]),
   t.join() og cout "sum = ". Fork-join-forløbet er fra slide 11. Figur 4.1 har
   tre tråde; her er det kursets to (main og t). */

function Seg({ name, tone = 'idle', children }: { name: string; tone?: Tone; children?: ReactNode }) {
  return (
    <div className="sx-thr-seg" data-tone={tone}>
      <span className="sx-thr-seg-name">{name}</span>
      {children !== undefined && <div className="sx-thr-seg-body">{children}</div>}
    </div>
  )
}

function Cell({ name, tone = 'idle', children }: { name: string; tone?: Tone; children?: ReactNode }) {
  return (
    <div className="sx-thr-cell" data-tone={tone}>
      <span className="sx-thr-cell-name">{name}</span>
      <div className="sx-thr-cell-body">{children}</div>
    </div>
  )
}

function Phase({ on, tone = 'idle', children }: { on: boolean; tone?: Tone; children: ReactNode }) {
  return (
    <motion.div
      className="sx-thr-bar"
      data-tone={tone}
      initial={false}
      animate={{ opacity: on ? 1 : 0, scaleX: on ? 1 : 0.6 }}
      style={{ originX: 0 }}
      transition={on ? t.settle : t.fade}
    >
      {children}
    </motion.div>
  )
}

function Threads({ step }: { step: number }) {
  const tExists = at(step, 1)
  const tBorn = at(step, 1)
  const shared = step === 2
  const running = step === 3
  const done = step === 5

  const tTone: Tone = !tBorn ? 'ghost' : done ? 'muted' : step === 1 || running || step === 4 ? 'focus' : shared ? 'ok' : 'idle'
  const mainTone: Tone = step === 0 || done ? 'focus' : running || step === 4 ? 'muted' : shared ? 'ok' : 'idle'

  const tokenInStack = step === 3
  const tokenInData = at(step, 4)

  return (
    <div className="sx-thr">
      {/* Single-threaded */}
      <section className="sx-thr-proc sx-thr-single">
        <h4 className="sx-thr-ptitle">single-threaded process</h4>
        <div className="sx-thr-segs">
          <Seg name="code" />
          <Seg name="data" />
          <Seg name="files" />
        </div>
        <div className="sx-thr-threads">
          <div className="sx-thr-thread" data-tone="idle">
            <Cell name="registers" />
            <Cell name="PC" />
            <Cell name="stack" />
            <span className="sx-thr-tlabel">én tråd</span>
          </div>
        </div>
      </section>

      {/* Multithreaded: kursets program */}
      <section className="sx-thr-proc sx-thr-multi">
        <h4 className="sx-thr-ptitle">
          multithreaded process <code className="sx-thr-file">multithreaded_&shy;cpp_&shy;thread.cpp</code>
        </h4>
        <div className="sx-thr-segs" data-shared={shared || undefined}>
          <Seg name="code" tone={shared ? 'focus' : 'idle'}>
            <code>main</code> <code>runner</code>
          </Seg>
          <Seg name="data" tone={shared || step === 4 ? 'focus' : 'idle'}>
            <span className="sx-thr-sum">
              <code>sum</code>
              <span className="sx-thr-slot">
                {tokenInData ? (
                  <Token id="sx-thr-val" tone={step === 4 ? 'focus' : 'idle'}>
                    local_sum
                  </Token>
                ) : (
                  <code className="sx-thr-zero">{'{0}'}</code>
                )}
              </span>
            </span>
          </Seg>
          <Seg name="files" tone={shared ? 'focus' : 'idle'} />
        </div>
        <motion.div className="sx-thr-sharedtag" initial={false} animate={{ opacity: at(step, 2) ? 1 : 0 }} transition={t.fade}>
          ↑ delt af alle tråde · ↓ egne pr. tråd
        </motion.div>

        <div className="sx-thr-threads">
          <div className="sx-thr-thread" data-tone={mainTone}>
            <Cell name="registers" />
            <Cell name="PC" tone={step === 0 || running || done ? 'focus' : 'idle'}>
              <Swap
                show={step === 0 ? 0 : done ? 2 : 1}
                items={[<code key="k116-26">std::thread t(…)</code>, <code key="k116-59">t.join()</code>, <code key="k116-82">cout &lt;&lt; … sum</code>]}
              />
            </Cell>
            <Cell name="stack">
              <code>argv</code> <code>t</code>
            </Cell>
            <span className="sx-thr-tlabel">
              <code>main</code>
            </span>
          </div>

          <motion.div
            className="sx-thr-thread"
            data-tone={tTone}
            initial={false}
            animate={{ opacity: tBorn ? 1 : 0.5 }}
            transition={t.fade}
          >
            <Cell name="registers" />
            <Cell name="PC" tone={running || step === 4 ? 'focus' : 'idle'}>
              <motion.div initial={false} animate={{ opacity: tExists ? 1 : 0 }} transition={t.fade}>
                <Swap
                  show={step === 4 || done ? 2 : running ? 1 : 0}
                  items={[<code key="k139-28">runner(argv[1])</code>, <code key="k139-58">for … local_sum += i</code>, <code key="k139-95">sum = local_sum</code>]}
                />
              </motion.div>
            </Cell>
            <Cell name="stack" tone={running ? 'focus' : 'idle'}>
              <motion.div className="sx-thr-stack" initial={false} animate={{ opacity: tExists ? 1 : 0 }} transition={t.fade}>
                <code>param</code> <code>upper</code>{' '}
                <span className="sx-thr-slot">
                  {tokenInStack ? (
                    <Token id="sx-thr-val" tone="focus">
                      local_sum
                    </Token>
                  ) : (
                    <code>local_sum</code>
                  )}
                </span>
              </motion.div>
            </Cell>
            <span className="sx-thr-tlabel">
              <Swap show={done ? 1 : 0} items={[<code key="k158-50">t</code>, <span key="k158-66"><code>t</code> · færdig og joinet</span>]} />
            </span>
          </motion.div>
        </div>
      </section>

      {/* Fork-join */}
      <section className="sx-thr-fj">
        <span className="vcaps">fork-join</span>
        <div className="sx-thr-lanes">
          <span className="sx-thr-lane-name">
            <code>main</code>
          </span>
          <Phase on tone={step === 0 ? 'focus' : 'idle'}>
            <span>kører</span>
          </Phase>
          <Phase on={at(step, 3)} tone={running || step === 4 ? 'muted' : 'idle'}>
            <span>
              venter i <code>join()</code>
            </span>
          </Phase>
          <Phase on={done} tone={done ? 'focus' : 'idle'}>
            <code>sum = …</code>
          </Phase>

          <span className="sx-thr-lane-name">
            <code>t</code>
          </span>
          <span className="sx-thr-mark sx-thr-fork">
            <motion.span initial={false} animate={{ opacity: tBorn ? 1 : 0 }} transition={t.fade}>
              fork →
            </motion.span>
          </span>
          <Phase on={at(step, 1)} tone={step >= 1 && step <= 4 ? 'focus' : 'idle'}>
            <code>runner</code>
          </Phase>
          <span className="sx-thr-mark sx-thr-join">
            <motion.span initial={false} animate={{ opacity: done ? 1 : 0 }} transition={t.fade}>
              → join
            </motion.span>
          </span>
        </div>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'thread-address-space',
  title: 'Én proces, to tråde, fork og join',
  steps: [
    {
      caption: 'Bogens Figur 4.1. En single-threaded proces har ét sæt registre, PC og stak. Kursets program starter også med én tråd, `main`.',
      hold: 2400,
    },
    {
      caption: '`std::thread t(runner, argv[1]);` er **fork**: en ny tråd i *samme* proces med egne registre, egen PC og egen stak.',
      hold: 2800,
    },
    {
      caption: 'Code, data og files er **delt** — begge tråde ser `runner` og den globale `sum`. Kun stak, registre og PC er trådens egne.',
      hold: 3000,
    },
    {
      caption: '`t` kører `runner` og lægger `upper` og `local_sum` på *sin egen* stak. Imens står `main` i `t.join()` og venter.',
      hold: 2800,
    },
    { caption: '`sum = local_sum` skriver resultatet i den delte data — derfor er `sum` en `std::atomic<int>`.', hold: 2600 },
    {
      caption: '**Join**: `t` er færdig, `t.join()` returnerer, og `main` fortsætter og printer `sum` fra den delte data.',
      hold: 3000,
    },
  ],
  Component: Threads,
}

export default viz
