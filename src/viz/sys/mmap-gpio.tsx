import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Link, Tag } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './mmap-gpio.css'

/* Kursets led_mem_map_gpio.cpp (week10_interrupts_bus_architecture_and_dma): PERIPHERAL_BASE_ADDR
   0x1F00000000, GPIO0/RIO0/PAD0_ADDR_OFFSET 0xD0000/0xE0000/0xF0000, RIO_XOR/SET/CLR +0x1000/
   +0x2000/+0x3000, LED0_PIN 26, ctrl = 0x05, pad = 0x10 (4 mA). 09.2 s. 5–7. */

/** Brudmuligheder i lange kodelinjer (efter ::, <, (, . og |), så de aldrig knækker midt i et navn. */
function wb(s: string) {
  const parts = s.split(/(?<=::|<|\(|\.|\||,)/)
  return parts.map((p, i) => (
    <span key={i}>
      {p}
      {i < parts.length - 1 && <wbr />}
    </span>
  ))
}

const CODE: { at: number; code: string; note?: string }[] = [
  { at: 1, code: 'int fd = open("/dev/mem", O_RDWR | O_SYNC);', note: 'kræver root' },
  { at: 2, code: 'void* map = mmap(nullptr, BLOCK_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, PERIPHERAL_BASE_ADDR);' },
  { at: 3, code: 'uint32_t* RIOBase = PERIPHERALBase + RIO0_ADDR_OFFSET\u00a0/\u00a04;', note: 'byte-offset / 4' },
  { at: 4, code: 'GPIO[LED0_PIN].ctrl = 0x05;  pad[LED0_PIN] = 0x10;' },
  { at: 4, code: 'RIO_SET->OE = 0x01<<LED0_PIN | …;' },
  { at: 5, code: 'RIO_SET->Out = 0x01<<LED0_PIN;' },
]

interface Reg {
  id: string
  off: string
  name: string
  ptr: string
  what: string
  /** Trin hvor blokken skrives til. */
  hot: number[]
  sub?: { off: string; name: string; hot: number[]; note?: string }[]
}

const REGS: Reg[] = [
  { id: 'gpio', off: '+0xD0000', name: 'GPIO', ptr: 'GPIOBase', what: 'status, ctrl pr. pin', hot: [4] },
  {
    id: 'rio',
    off: '+0xE0000',
    name: 'RIO',
    ptr: 'RIOBase',
    what: 'Out, OE, In, InSync',
    hot: [],
    sub: [
      { off: '+0x1000', name: 'RIO_XOR', hot: [] },
      { off: '+0x2000', name: 'RIO_SET', hot: [4, 5, 6], note: 'sætter 1-bits' },
      { off: '+0x3000', name: 'RIO_CLR', hot: [6], note: 'clearer 1-bits' },
    ],
  },
  { id: 'pad', off: '+0xF0000', name: 'PAD', ptr: 'PADBase', what: 'input enable, 4 mA', hot: [4] },
]

function MemoryMap({ step }: { step: number }) {
  const mapped = step >= 2
  const ptrs = step >= 3
  const lit = step >= 5
  return (
    <div className="mg-mem">
      <div className="mg-colhead">
        <span className="vcaps">Periferiblokken</span>
        <code className="mg-dev">/dev/mem</code>
      </div>
      <div className="mg-block" data-mapped={mapped || undefined}>
        <div className="mg-base">
          <code className="mg-addr">0x1F00000000</code>
          <span className="mg-base-name">PERIPHERAL_BASE_ADDR</span>
          <Tag show={mapped}>map</Tag>
        </div>
        {REGS.map((r, i) => {
          const hot = r.hot.includes(step)
          return (
            <div key={r.id} className="mg-reg" data-hot={hot || undefined}>
              <div className="mg-reg-row">
                <code className="mg-off">{r.off}</code>
                <span className="mg-reg-name">{r.name}</span>
                <span className="mg-reg-what">{r.what}</span>
                <motion.span
                  className="mg-ptr"
                  initial={false}
                  animate={{ opacity: ptrs ? 1 : 0, x: ptrs ? 0 : -4 }}
                  transition={ptrs ? stagger(i, 0, 0.12) : t.fade}
                >
                  <code>{r.ptr}</code>
                </motion.span>
              </div>
              {r.sub && (
                <div className="mg-subs">
                  {r.sub.map((s) => (
                    <div key={s.name} className="mg-sub" data-hot={s.hot.includes(step) || undefined}>
                      <code className="mg-off">{s.off}</code>
                      <code className="mg-sub-name">{s.name}</code>
                      {s.note && (
                        <motion.span
                          className="mg-sub-note"
                          initial={false}
                          animate={{ opacity: step >= 6 ? 1 : 0 }}
                          transition={t.fade}
                        >
                          {s.note}
                        </motion.span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mg-led" data-lit={lit || undefined}>
        <span className="mg-led-dot" aria-hidden="true" />
        <span className="mg-led-text">
          LED0 <code>LED0_PIN 26</code>
        </span>
        <span className="mg-led-state">{lit ? 'tændt' : 'slukket'}</span>
      </div>
    </div>
  )
}

function MmapGpio({ step }: { step: number }) {
  const final = step >= 6
  return (
    <div className="mg">
      <div className="mg-proc">
        <div className="mg-colhead">
          <span className="vcaps">Proces i user space</span>
          <code className="mg-dev">led_mem_map_gpio</code>
        </div>
        <div className="mg-code">
          {CODE.map((c, i) => {
            const on = step >= c.at
            return (
              <motion.div
                key={i}
                className="mg-line"
                data-now={step === c.at || undefined}
                initial={false}
                animate={{ opacity: on ? 1 : 0.28 }}
                transition={t.fade}
              >
                <code>{wb(c.code)}</code>
                {c.note && <span className="mg-note">{c.note}</span>}
              </motion.div>
            )
          })}
        </div>
        <motion.p className="mg-sum" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
          Ingen driver: registrene skrives med almindelige load/store. Men heller ingen beskyttelse — en forkert
          skrivning kan crashe systemet.
        </motion.p>
      </div>
      <div className="mg-link">
        <Link on={step >= 2} tone={step === 2 ? 'focus' : 'idle'} label="mmap" />
      </div>
      <MemoryMap step={step} />
    </div>
  )
}

const viz: VizDef = {
  id: 'mmap-gpio',
  title: 'Fra /dev/mem til en tændt LED',
  steps: [
    {
      caption: 'GPIO-registrene på Pi 5 ligger i periferiblokken fra `0x1F00000000`. Processen kan ikke nå dem endnu.',
      hold: 2200,
    },
    { caption: '`open("/dev/mem", O_RDWR | O_SYNC)` giver en file descriptor, som `mmap` kan bruge. Det kræver root.', hold: 2400 },
    {
      caption: '`mmap(…, MAP_SHARED, fd, PERIPHERAL_BASE_ADDR)` lægger blokken ind i processens adresserum som `map`.',
      hold: 2800,
    },
    {
      caption: 'Pointerne er `uint32_t*`, så byte-offsettet **divideres med 4**: `GPIOBase`, `RIOBase`, `PADBase`.',
      hold: 2600,
    },
    {
      caption: 'Konfigurér pin 26: `ctrl = 0x05` vælger funktion, `pad = 0x10` giver 4 mA, `RIO_SET->OE` slår output til.',
      hold: 3000,
    },
    {
      caption: 'En almindelig skrivning til `RIO_SET->Out` sætter **kun bit 26**. LED’en tænder.',
      hold: 2600,
    },
    {
      caption: '`RIO_SET` og `RIO_CLR` ændrer kun de bits, man skriver 1 i — ingen read-modify-write.',
      hold: 3000,
    },
  ],
  Component: MmapGpio,
}

export default viz
