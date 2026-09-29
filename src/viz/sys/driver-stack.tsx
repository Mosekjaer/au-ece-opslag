import type { ReactNode } from 'react'
import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Token } from '../kit/primitives'
import { t } from '../kit/motion'
import './driver-stack.css'

/* 12.1-Linux-Device-Drivers.pdf: stakken Application → Std-C Library (system_call()) →
   Linux → driver → hardware (s. 4), mknod /dev/hello0 c 249 0 (s. 18), MAJOR(inode->rdev)
   og MINOR(inode) ved open (s. 15), hello_fops (s. 22), hello_read med
   some_function_that_reads_value_from_hardware(), snprintf og copy_to_user (s. 23),
   sekvensdiagrammet Console/Application/Linux/hello (s. 21). */

type LayerId = 'app' | 'libc' | 'linux' | 'hello' | 'hw'

const FOPS = [
  { field: '.open', fn: 'hello_open' },
  { field: '.release', fn: 'hello_release' },
  { field: '.write', fn: 'hello_write' },
  { field: '.read', fn: 'hello_read' },
]

/** Hvor er kaldet (ned) og dataene (op) i hvert trin? */
function frame(step: number) {
  const call: LayerId | null = step === 1 ? 'linux' : step === 2 ? 'libc' : step === 3 || step === 4 ? 'hello' : null
  const callLabel = step === 1 ? 'open("/dev/hello0")' : 'read(fd, buf, count)'
  const data: LayerId | null = step === 4 ? 'hello' : step >= 5 ? 'app' : null
  return { call, callLabel, data }
}

function Layer({
  id,
  space,
  name,
  children,
  step,
  hot,
}: {
  id: LayerId
  space?: string
  name: ReactNode
  children?: ReactNode
  step: number
  hot: boolean
}) {
  const { call, callLabel, data } = frame(step)
  return (
    <div className="ds-layer" data-hot={hot || undefined} data-layer={id}>
      <span className="ds-space">{space}</span>
      <div className="ds-body">
        <div className="ds-name">{name}</div>
        {children}
      </div>
      {id !== 'hw' && (
        <div className="ds-slots">
          <span className="ds-slot">
            {call === id && (
              <Token id="ds-call" launch={step === 1 || step === 2} wrap>
                {callLabel}
              </Token>
            )}
          </span>
          <span className="ds-slot">
            {data === id && (
              <Token id="ds-data" tone="idle">
                {id === 'app' ? 'buf' : 'kbuf'}
              </Token>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

function Line({ on, now, children }: { on: boolean; now?: boolean; children: ReactNode }) {
  return (
    <motion.div
      className="ds-line"
      data-now={now || undefined}
      initial={false}
      animate={{ opacity: on ? 1 : 0.3 }}
      transition={t.fade}
    >
      {children}
    </motion.div>
  )
}

function DriverStack({ step }: { step: number }) {
  const readRow = step >= 3 && step <= 5
  const openRow = step === 1
  const final = step >= 6
  return (
    <div className="ds">
      <div className="ds-heads" aria-hidden="true">
        <span />
        <span />
        <span className="ds-heads-slots">
          <span className="vcaps">kald ↓</span>
          <span className="vcaps">data ↑</span>
        </span>
      </div>

      <Layer id="app" space="User space" name="Application" step={step} hot={step === 1 || step === 2 || step >= 5}>
        <Line on={step >= 1} now={step === 1}>
          <code>fd = open("/dev/hello0", …)</code>
        </Line>
        <Line on={step >= 2} now={step === 2 || step === 6}>
          <code>n = read(fd, buf, count)</code>
          <motion.span className="ds-ret" initial={false} animate={{ opacity: final ? 1 : 0 }} transition={t.fade}>
            → len
          </motion.span>
        </Line>
      </Layer>

      <Layer id="libc" name="Std-C Library" step={step} hot={step === 2}>
        <Line on={step >= 2} now={step === 2}>
          <code>system_call()</code>
        </Line>
      </Layer>

      <div className="ds-boundary">
        <span className="ds-boundary-label">trap → kernel mode</span>
      </div>

      <Layer id="linux" space="Kernel space" name="Linux" step={step} hot={step === 1 || step === 3}>
        <div className="ds-node">
          <code>/dev/hello0</code>
          <span className="ds-node-meta">
            c <b>249</b>, 0
          </span>
        </div>
        <Line on={step >= 1} now={step === 1}>
          <code>MAJOR(inode-&gt;rdev)</code> = 249 → hello
        </Line>
      </Layer>

      <Layer id="hello" name="hello (driver)" step={step} hot={step >= 3 && step <= 5}>
        <div className="ds-fops">
          <code className="ds-fops-name">hello_fops</code>
          {FOPS.map((f) => {
            const on = (f.field === '.read' && readRow) || (f.field === '.open' && openRow)
            return (
              <span key={f.field} className="ds-fop" data-on={on || undefined}>
                <code>{f.field}</code>
                <code>{f.fn}</code>
              </span>
            )
          })}
        </div>
        <Line on={step >= 4} now={step === 4}>
          <code>len = snprintf(kbuf, len, "%i", value)</code>
        </Line>
        <Line on={step >= 5} now={step === 5}>
          <code>copy_to_user(buf, kbuf, ++len)</code>
        </Line>
      </Layer>

      <Layer id="hw" space="Hardware" name="Enheden" step={step} hot={step === 4}>
        <Line on={step >= 4} now={step === 4}>
          <code>
            some_function_<wbr />
            that_reads_<wbr />
            value_from_<wbr />
            hardware()
          </code>
        </Line>
      </Layer>
    </div>
  )
}

const viz: VizDef = {
  id: 'driver-stack',
  title: 'Et read() fra /dev ned til driveren og tilbage',
  steps: [
    {
      caption:
        'Noden `/dev/hello0` er lavet med `mknod /dev/hello0 c 249 0`: character device, **major 249**, minor 0.',
      hold: 2200,
    },
    {
      caption:
        'Ved `open` slår kernen driveren op med `MAJOR(inode->rdev)` og kalder dens `.open`. Minor vælger enheden.',
      hold: 2800,
    },
    {
      caption: '`read(fd, buf, count)` går gennem Std-C Library som et **system call** — et trap til kernel mode.',
      hold: 2400,
    },
    {
      caption: 'Linux kalder funktionen i driverens `file_operations`: `.read = hello_read`.',
      hold: 2400,
    },
    {
      caption: '`hello_read` henter værdien fra hardwaren og laver en streng i kernel-bufferen `kbuf`.',
      hold: 2600,
    },
    {
      caption: '`copy_to_user` tjekker brugerens pointer og kopierer `kbuf` over grænsen til `buf` i user space.',
      hold: 2800,
    },
    {
      caption: '`hello_read` returnerer `len`, og det bliver `read`’s returværdi i applikationen.',
      hold: 3000,
    },
  ],
  Component: DriverStack,
}

export default viz
