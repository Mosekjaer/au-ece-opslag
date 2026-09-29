import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Swap, Tag, Token, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './fork-tree.css'

/* Silberschatz Figur 3.8 (bogens s. 124): fork() → barnet execlp("/bin/ls") →
   forælderen wait(NULL) → "Child Complete". Returværdierne (0 i barnet, barnets
   PID i forælderen), kopien af adresserummet og "samme PID efter exec" er fra
   emnets tekst (05.2 s. 15 og 18, 02.1 s. 10, bogen 3.3.1). Kommentarerne i
   koden er udeladt for at holde linjerne korte. */

const CODE: { text: string; depth: number }[] = [
  { text: 'pid = fork();', depth: 0 },
  { text: 'if (pid < 0) { … }', depth: 0 },
  { text: 'else if (pid == 0) {', depth: 0 },
  { text: 'execlp("/bin/ls","ls",NULL);', depth: 1 },
  { text: '}', depth: 0 },
  { text: 'else {', depth: 0 },
  { text: 'wait(NULL);', depth: 1 },
  { text: 'printf("Child Complete");', depth: 1 },
  { text: '}', depth: 0 },
]

// Linje for forælderen (F) og barnet (B) i hvert trin; -1 = ingen markør.
const PARENT = [0, 0, 5, 6, 6, 7]
const CHILD = [-1, 0, 2, 3, 3, 3]

function Row({ k, v, tone = 'idle' }: { k: ReactNode; v: ReactNode; tone?: Tone }) {
  return (
    <div className="sx-fork-row" data-tone={tone}>
      <span className="sx-fork-k">{k}</span>
      <span className="sx-fork-v">{v}</span>
    </div>
  )
}

function Proc({
  who,
  name,
  tone,
  state,
  children,
}: {
  who: 'F' | 'B'
  name: string
  tone: Tone
  state: ReactNode
  children: ReactNode
}) {
  return (
    <Node tone={tone} className="sx-fork-proc">
      <div className="sx-fork-head">
        <span className="sx-fork-badge" data-who={who}>
          {who}
        </span>
        <span className="sx-fork-name">{name}</span>
        <span className="sx-fork-state">{state}</span>
      </div>
      {children}
    </Node>
  )
}

function Fork({ step }: { step: number }) {
  const f = PARENT[step]
  const b = CHILD[step]
  const childExists = at(step, 1)
  const childDone = at(step, 4)
  const exec = at(step, 3)
  const final = step === 5

  const parentTone: Tone = step === 4 ? 'focus' : step === 3 ? 'muted' : step === 0 || step === 2 || final ? 'focus' : 'idle'
  const childTone: Tone = !childExists ? 'ghost' : childDone ? 'muted' : step === 1 || step === 2 || step === 3 ? 'focus' : 'idle'

  return (
    <div className="sx-fork">
      <div className="sx-fork-codewrap">
        <span className="vcaps">Bogens Figur 3.8</span>
        <ol className="sx-fork-code" aria-label="Koden fra bogens Figur 3.8">
          {CODE.map((l, i) => {
            const hot = i === f || (i === b && !childDone)
            return (
              <li key={i} data-tone={hot ? 'focus' : 'idle'}>
                <span className="sx-fork-gut">
                  <span className="sx-fork-slot">
                    {i === f && (
                      <Token id="sx-fork-f" tone="focus">
                        F
                      </Token>
                    )}
                  </span>
                  <span className="sx-fork-slot">
                    {i === b && (
                      <Token id="sx-fork-b" tone={childDone ? 'muted' : 'focus'}>
                        B
                      </Token>
                    )}
                  </span>
                </span>
                <code className="sx-fork-line" style={{ paddingLeft: `${l.depth * 2}ch` }}>
                  {l.text}
                </code>
              </li>
            )
          })}
        </ol>
        <motion.div
          className="sx-fork-out"
          initial={false}
          animate={{ opacity: final ? 1 : 0.35 }}
          transition={t.fade}
        >
          <span className="vcaps">stdout</span>
          <motion.code initial={false} animate={{ opacity: final ? 1 : 0 }} transition={final ? t.settle : t.fade}>
            Child Complete
          </motion.code>
        </motion.div>
      </div>

      <div className="sx-fork-procs">
        <Proc
          who="F"
          name="Forælder"
          tone={parentTone}
          state={
            <Swap
              show={step <= 2 ? 0 : step === 3 ? 1 : step === 4 ? 2 : 3}
              items={[
                <Tag key="k131-18" tone="idle">kører</Tag>,
                <Tag key="k132-18" tone="muted">blokeret i wait()</Tag>,
                <Tag key="k133-18" tone="focus">wait() returnerer</Tag>,
                <Tag key="k134-18" tone="idle">fortsætter</Tag>,
              ]}
            />
          }
        >
          <Row
            k={<code>pid</code>}
            tone={step === 2 ? 'focus' : 'idle'}
            v={<Swap show={at(step, 2) ? 1 : 0} items={[<span key="k142-58" className="sx-fork-dim">ikke sat endnu</span>, <b key="k142-111">barnets PID (&gt; 0)</b>]} />}
          />
          <Row k="adresserum" v="programmet i Figur 3.8" />
        </Proc>

        <div className="sx-fork-links">
          <Link on={childExists} vertical tone={step === 1 ? 'focus' : 'idle'} label={<code>fork()</code>} className="sx-fork-link" />
          <Link
            on={childDone}
            vertical
            back
            tone={step === 4 ? 'focus' : 'idle'}
            label="terminerer"
            className="sx-fork-link"
          />
        </div>

        <Proc
          who="B"
          name="Barn"
          tone={childTone}
          state={
            <Swap
              show={!childExists ? 0 : childDone ? 2 : 1}
              items={[<Tag key="k166-24" tone="idle" show={false}>findes ikke</Tag>, <Tag key="k166-73" tone="idle">kører</Tag>, <Tag key="k166-104" tone="muted">termineret</Tag>]}
            />
          }
        >
          <motion.div initial={false} animate={{ opacity: childExists ? 1 : 0 }} transition={childExists ? t.settle : t.fade}>
            <Row
              k={<code>pid</code>}
              tone={step === 2 ? 'focus' : 'idle'}
              v={<Swap show={at(step, 2) ? 1 : 0} items={[<span key="k174-60" className="sx-fork-dim">ikke sat endnu</span>, <b key="k174-113">0</b>]} />}
            />
            <Row
              k="adresserum"
              tone={step === 1 || step === 3 ? 'focus' : 'idle'}
              v={
                <Swap
                  show={exec ? 1 : 0}
                  items={[
                    <span key="k183-22">kopi af forælderens</span>,
                    <span key="k184-22">
                      erstattet af <code>/bin/ls</code>
                    </span>,
                  ]}
                />
              }
            />
            <Row
              k="PID"
              v={<Swap show={exec ? 1 : 0} items={[<span key="k193-53">ny PID</span>, <span key="k193-74">samme PID efter exec</span>]} />}
            />
          </motion.div>
        </Proc>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'fork-tree',
  title: 'fork, exec og wait i bogens Figur 3.8',
  steps: [
    { caption: 'Én proces, **forælderen** (F), står ved `pid = fork();`. Der er intet barn endnu.', hold: 1800 },
    {
      caption: '`fork()` duplikerer processen. **Barnet** (B) får en ny PID og en *kopi* af forælderens adresserum, og begge står nu i samme kodelinje.',
      hold: 2800,
    },
    {
      caption: 'Begge fortsætter efter `fork()`. Returværdien skiller dem ad: `0` i barnet, barnets PID i forælderen. Så går de hver sin gren.',
      hold: 2800,
    },
    {
      caption: 'Barnet kalder `execlp("/bin/ls",…)`: procesimaget erstattes af `ls` under **samme PID**. Forælderen blokerer i `wait(NULL)`.',
      hold: 3000,
    },
    {
      caption: '`ls` terminerer, og forælderens `wait(NULL)` returnerer. Med `NULL` ignoreres exit-status; `wait(&status)` ville hente den.',
      hold: 2600,
    },
    {
      caption: 'Forælderen printer `Child Complete`. Barnet kom aldrig tilbage til koden efter `execlp` — `exec()` returnerer kun ved fejl.',
      hold: 3000,
    },
  ],
  Component: Fork,
}

export default viz
