import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Tag, Token, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './dotnet-compile.css'

/* L4 NET Architecture.pdf: s. 3 (kæden C# Code → Compiler → IL Code → CLR/JIT →
   Native Code → Processor, bibliotekstakken), s. 5 (execution model: VB, C#, F#,
   C++; Source code / Managed code; Unmanaged NativeCode), s. 6 (.NET Native: AOT),
   s. 13 (IL ~ CIL ~ MSIL) og s. 23 (Foo.exe: Manifest, Type Metadata, MSIL Code,
   (Optional) Resources). C# står først, så AOT-vejen kan løbe i venstre side. */

const SHY = String.fromCharCode(0xad)

const LANGS = [
  { id: 'cs', name: 'C# Code' },
  { id: 'vb', name: 'VB' },
  { id: 'fs', name: 'F#' },
  { id: 'cpp', name: 'C++' },
] as const

const ASM = ['Manifest', 'Type Metadata', 'MSIL Code', '(Optional) Resources']
const BCL = ['ASP.NET · WPF/UWP/Forms', 'ADO.NET, XML and…', 'Base Class Library']
const AOT_TAGS: { text: string; plus: boolean }[] = [
  { text: '+ hurtig opstart', plus: true },
  { text: '+ hurtig afvikling', plus: true },
  { text: '− kræver trimming', plus: false },
  { text: '− tungere build', plus: false },
  { text: '− større binaries', plus: false },
]

/** Grid-celle med et lodret link. */
function VLink({ area, on, tone, className }: { area: string; on: boolean; tone?: Tone; className?: string }) {
  return (
    <div className={`dnc-cell ${className ?? ''}`} style={{ gridArea: area }}>
      <Link vertical on={on} tone={tone} />
    </div>
  )
}

/** Plads i hjørnet af en boks, hvor tokenet kan stå uden at flytte layoutet. */
function Slot({ children }: { children?: ReactNode }) {
  return <span className="dnc-slot">{children}</span>
}

const fadeIn = (show: boolean, delay = 0) => ({
  initial: false as const,
  animate: { opacity: show ? 1 : 0, y: show ? 0 : 4 },
  transition: show ? { ...t.settle, delay } : t.fade,
})

function Compile({ step }: { step: number }) {
  const where = step === 0 ? 'src' : step <= 2 ? 'il' : step === 3 ? 'jit' : 'proc'
  const token = (
    <Token id="dnc-tok" launch={step === 1}>
      {step === 0 ? 'C#' : step <= 3 ? 'IL' : 'native'}
    </Token>
  )
  const others = at(step, 2)
  const aot = at(step, 5)

  const csTone = {
    lang: (step === 0 ? 'focus' : 'idle') as Tone,
    comp: (step === 0 ? 'ghost' : step === 1 ? 'focus' : 'idle') as Tone,
    il: (step === 0 ? 'ghost' : step === 1 ? 'focus' : 'idle') as Tone,
  }
  const clrTone: Tone = step < 2 ? 'ghost' : step === 2 ? 'focus' : 'idle'
  const jitTone: Tone = step < 2 ? 'ghost' : step === 3 ? 'focus' : step === 5 ? 'muted' : 'idle'
  const natTone: Tone = step < 4 ? 'ghost' : step === 4 ? 'ok' : 'idle'
  const procTone: Tone = step < 4 ? 'ghost' : step === 4 ? 'focus' : 'idle'

  return (
    <div className="dnc" data-aot={aot ? (step === 5 ? 'focus' : 'on') : undefined}>
      {/* Rækkemærker fra execution model-slidet. */}
      <motion.div className="dnc-lab" style={{ gridArea: 'lsrc' }} {...fadeIn(others)}>
        <span className="vcaps">Source code</span>
      </motion.div>
      <motion.div className="dnc-lab" style={{ gridArea: 'lman' }} {...fadeIn(others)}>
        <span className="vcaps">Managed code</span>
      </motion.div>

      {LANGS.map((l) => {
        const cs = l.id === 'cs'
        const show = cs || others
        return (
          <div key={l.id} className="dnc-lane" data-lang={l.id}>
            <Node
              className="dnc-box"
              style={{ gridArea: `lang-${l.id}` }}
              title={l.name}
              sub={cs ? 'Sourcefiles' : undefined}
              tone={cs ? csTone.lang : 'idle'}
              show={show}
            >
              {cs && <Slot>{where === 'src' && token}</Slot>}
            </Node>
            <VLink area={`a1-${l.id}`} on={cs ? at(step, 1) : others} tone={cs ? (step === 1 ? 'focus' : 'idle') : step === 2 ? 'focus' : 'idle'} />
            <Node className="dnc-box" style={{ gridArea: `comp-${l.id}` }} title="Compiler" tone={cs ? csTone.comp : 'idle'} show={show} />
            <VLink area={`a2-${l.id}`} on={cs ? at(step, 1) : others} tone={cs ? (step === 1 ? 'focus' : 'idle') : step === 2 ? 'focus' : 'idle'} />
            <Node className="dnc-box" style={{ gridArea: `il-${l.id}` }} title="IL Code" tone={cs ? csTone.il : 'idle'} show={show}>
              {cs && (
                <>
                  <motion.span className="dnc-asmtag" {...fadeIn(at(step, 1), 0.5)}>
                    Assembly
                  </motion.span>
                  <Slot>{where === 'il' && token}</Slot>
                </>
              )}
            </Node>
            <VLink
              area={`a3-${l.id}`}
              on={others}
              tone={step === 2 || (cs && step === 3) ? 'focus' : 'idle'}
            />
          </div>
        )
      })}

      {/* Smal plade: de tre andre sprog som chips. */}
      <motion.div className="dnc-alt" style={{ gridArea: 'alt' }} {...fadeIn(others)}>
        {['VB', 'F#', 'C++'].map((n) => (
          <Tag key={n} tone="idle">
            {n}
          </Tag>
        ))}
        <span className="dnc-alt-text">egen compiler → samme IL</span>
      </motion.div>

      {/* C++ kan gå uden om CLR’en. */}
      <div className="dnc-cell dnc-uh" style={{ gridArea: 'uh' }}>
        <Link on={others} tone="muted" />
      </div>
      <Node
        className="dnc-box dnc-un"
        style={{ gridArea: 'un' }}
        title={
          <>
            Unmanaged Native{SHY}Code
          </>
        }
        sub={<span className="dnc-un-sub">fra C++, uden om CLR’en</span>}
        tone="muted"
        show={others}
      />
      <div className="dnc-cell dnc-uv" style={{ gridArea: 'uv' }}>
        <Link vertical on={others} tone="muted" />
      </div>

      {/* Assembly’en foldet ud. */}
      <motion.div className="dnc-asm" style={{ gridArea: 'asm' }} {...fadeIn(at(step, 1), 0.35)}>
        <div className="dnc-asm-head">
          <span className="dnc-asm-name">Assembly</span>
          <span className="dnc-asm-file">
            fx <code>Foo.exe</code>
          </span>
        </div>
        <div className="dnc-asm-grid">
          {ASM.map((a, i) => (
            <motion.span key={a} className="dnc-asm-cell" data-opt={i === 3 || undefined} {...fadeIn(at(step, 1), 0.45 + i * 0.08)}>
              {a}
            </motion.span>
          ))}
        </div>
        <div className="dnc-asm-note">
          IL = CIL = MSIL
        </div>
      </motion.div>

      <Node className="dnc-clr" style={{ gridArea: 'clr' }} tone={clrTone}>
        <Node className="dnc-box dnc-jit" title="JIT Compiler" tone={jitTone}>
          <Slot>{where === 'jit' && token}</Slot>
        </Node>
        <div className="dnc-clr-name">
          Common Language Run{SHY}time
          <span className="dnc-clr-abbr">CLR</span>
        </div>
      </Node>

      {/* Bibliotekerne stilles til rådighed gennem CLR’en. */}
      <motion.div className="dnc-bcl" style={{ gridArea: 'bcl' }} {...fadeIn(at(step, 3))}>
        <div className="dnc-bcl-h">
          <Link back on={at(step, 3)} tone={step === 3 ? 'focus' : 'idle'} />
        </div>
        <div className="dnc-bcl-v">
          <Link vertical back on={at(step, 3)} tone={step === 3 ? 'focus' : 'idle'} />
        </div>
        <div className="dnc-bcl-stack">
          {BCL.map((b, i) => (
            <motion.span key={b} className="dnc-bcl-item" {...fadeIn(at(step, 3), 0.1 + i * 0.08)}>
              {b}
            </motion.span>
          ))}
        </div>
      </motion.div>

      <VLink area="a4" className="dnc-a4" on={at(step, 4)} tone={step === 4 ? 'focus' : step === 5 ? 'muted' : 'idle'} />
      <Node className="dnc-box dnc-nat" style={{ gridArea: 'nat' }} title="Native Code" tone={natTone} />
      <VLink area="a5" on={at(step, 4)} tone={step === 4 ? 'focus' : 'idle'} />
      <Node className="dnc-box dnc-proc" style={{ gridArea: 'proc' }} tone={procTone}>
        <div className="dnc-proc-row">
          <span className="vnode-title">Processor</span>
          <span className="vnode-sub">Operating System Services</span>
          <span className="dnc-proc-slot">{where === 'proc' && token}</span>
        </div>
      </Node>

      {/* AOT: fra IL direkte til native code, uden om JIT. */}
      {(['at', 'am', 'ab'] as const).map((p) => (
        <motion.div
          key={p}
          className={`dnc-aot dnc-aot-${p}`}
          style={{ gridArea: p }}
          initial={false}
          animate={{ opacity: aot ? 1 : 0 }}
          transition={aot ? { ...t.settle, delay: p === 'at' ? 0 : p === 'am' ? 0.15 : 0.3 } : t.fade}
        >
          {p === 'am' && <span className="dnc-aot-label">AOT</span>}
        </motion.div>
      ))}

      <div className="dnc-tags" style={{ gridArea: 'tags' } as CSSProperties}>
        <motion.span className="dnc-tags-head" {...fadeIn(aot)}>
          AOT, ved build:
        </motion.span>
        {AOT_TAGS.map((a, i) => (
          <motion.span
            key={a.text}
            initial={false}
            animate={{ opacity: aot ? 1 : 0, scale: aot ? 1 : 0.9 }}
            transition={aot ? stagger(i, 0.35, 0.08) : t.fade}
          >
            <Tag tone={a.plus ? 'focus' : 'idle'}>{a.text}</Tag>
          </motion.span>
        ))}
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'dotnet-compile',
  title: 'Fra C#-kode til native code',
  steps: [
    { caption: 'Kildekoden er C#. Processoren kan ikke køre den direkte.', hold: 1600 },
    {
      caption: 'Compileren laver **IL** og pakker den i en **assembly** med manifest, type metadata og evt. resources.',
      hold: 2600,
    },
    {
      caption:
        'VB, F# og C++ har hver sin compiler, men laver samme IL, som løber ind i den samme **CLR**. Det er **managed code**. C++ kan også gå uden om CLR’en.',
      hold: 3000,
    },
    {
      caption: 'Ved kørsel tager CLR’en imod IL-koden, og **JIT**-compileren går i gang. Bibliotekerne stilles til rådighed gennem CLR’en.',
      hold: 2600,
    },
    { caption: 'JIT oversætter IL til **native code**, som processoren kører. Der er ingen interpreter.', hold: 2400 },
    {
      caption: 'Med **AOT** sker oversættelsen allerede ved build: hurtigere opstart, men trimming, tungere build og større binaries.',
      hold: 2800,
    },
    {
      caption: 'Kildekode → IL → native code. Alle .NET-sprog mødes i IL og CLR’en; JIT ved kørsel er standard, AOT ved build er alternativet.',
      hold: 3000,
    },
  ],
  Component: Compile,
}

export default viz
