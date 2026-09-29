import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Link, Node, Swap, Tag } from '../kit/primitives'
import './fd-table.css'

/* 05.2 s. 12 (open() med O_WRONLY | O_CREAT og S_IRUSR | S_IWUSR, write(),
   close()), s. 9–11 (returværdier: fd eller -1, bytes skrevet eller -1) og 06.2
   s. 5 (STDIN_FILENO = 0, STDOUT_FILENO = 1, STDERR_FILENO = 2). At open()
   giver 3, fordi det er det laveste ledige nummer, står ikke i materialet —
   det er markeret i billedteksten. 13 = strlen("Hello, World!").
   Indhold: src/content/sys/p5-posix-io.ts, emnet posix-file-io. */

interface Line {
  code: ReactNode
  indent?: boolean
  /** Trin hvor linjen kører, og det den returnerer/giver. */
  at?: number
  result?: ReactNode
  resultTone?: 'focus' | 'idle'
}

const LINES: Line[] = [
  {
    code: 'int fd = open("file.txt", O_WRONLY | O_CREAT, S_IRUSR | S_IWUSR);',
    at: 1,
    result: 'fd = 3',
  },
  { code: 'if (fd == -1) {', at: 2, result: 'falsk', resultTone: 'idle' },
  { code: '// Handle error', indent: true },
  { code: '}' },
  { code: 'const char *data = "Hello, World!";' },
  { code: 'ssize_t bytesWritten = write(fd, data, strlen(data));', at: 3, result: '13' },
  { code: 'if (bytesWritten == -1) {', at: 3, result: 'falsk', resultTone: 'idle' },
  { code: '// Handle error', indent: true },
  { code: '}' },
  { code: 'close(fd);', at: 4 },
]

const STD = [
  { fd: 0, name: 'stdin', macro: 'STDIN_FILENO', note: 'keyboard' },
  { fd: 1, name: 'stdout', macro: 'STDOUT_FILENO', note: 'skærm' },
  { fd: 2, name: 'stderr', macro: 'STDERR_FILENO', note: 'fejl' },
]

function FdTable({ step }: { step: number }) {
  const open3 = step >= 1 && step < 4
  const dataInFile = step >= 3

  return (
    <div className="fdt">
      <div className="fdt-code">
        <span className="vcaps">05.2 s. 12</span>
        <ol className="fdt-lines">
          {LINES.map((l, i) => {
            const now = l.at !== undefined && step === l.at
            const ran = l.at !== undefined && step >= l.at
            return (
              <li key={i} className="fdt-line" data-now={now || undefined} data-indent={l.indent || undefined}>
                <code className="fdt-src">{l.code}</code>
                {l.result !== undefined && (
                  <span className="fdt-gutter">
                    {l.result !== undefined && (
                      <Tag show={ran} tone={l.resultTone ?? 'focus'}>
                        {l.result}
                      </Tag>
                    )}
                  </span>
                )}
              </li>
            )
          })}
        </ol>
      </div>

      <div className="fdt-proc">
        <span className="vcaps">Procesens file descriptors</span>
        <ol className="fdt-table">
          {STD.map((r) => (
            <li key={r.fd} className="fdt-row" data-tone={step === 0 ? 'focus' : 'idle'}>
              <span className="fdt-fd">{r.fd}</span>
              <span className="fdt-name">
                <code>{r.macro}</code>
                <span className="fdt-note">
                  {r.name}, {r.note}
                </span>
              </span>
            </li>
          ))}
          <li className="fdt-row" data-tone={open3 ? (step === 1 ? 'focus' : 'open') : 'ghost'}>
            <span className="fdt-fd">3</span>
            <Swap
              show={open3 ? 1 : step >= 4 ? 2 : 0}
              className="fdt-swap"
              items={[
                <span key="k95-18" className="fdt-note">ledig</span>,
                <span key="k96-18" className="fdt-name-in">
                  <code>file.txt</code>
                  <span className="fdt-note">
                    <code>O_WRONLY | O_CREAT</code>
                  </span>
                </span>,
                <span key="k102-18" className="fdt-note">
                  lukket med <code>close(fd)</code>
                </span>,
              ]}
            />
          </li>
        </ol>

        <Link on={open3} vertical tone={step === 3 ? 'focus' : 'idle'} label={<code>fd 3</code>} />

        <Node
          className="fdt-file"
          show={step >= 1}
          tone={step === 3 ? 'focus' : 'idle'}
          title={<code>file.txt</code>}
          sub={<code>S_IRUSR | S_IWUSR</code>}
        >
          <div className="fdt-file-body"><Swap
            show={dataInFile ? 1 : 0}
            items={[
              <span key="k122-16" className="fdt-note">tom</span>,
              <Tag key="k123-16" show={dataInFile} tone="focus" wrap>
                "Hello, World!"
              </Tag>,
            ]}
          /></div>
        </Node>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'fd-table',
  title: 'Filen bag et lille heltal',
  steps: [
    {
      caption:
        'Tre descriptors er åbne fra start: `0`, `1` og `2`. Derfor kan `write(STDOUT_FILENO, …)` skrive uden at kalde `open()` først.',
      hold: 2600,
    },
    {
      caption:
        '`open()` opretter `file.txt` (`O_CREAT`) til skrivning og returnerer en file descriptor — her `3`. At det er det laveste ledige nummer, står ikke i materialet.',
      hold: 3000,
    },
    {
      caption: 'Ved fejl havde `open()` returneret `-1` og sat `errno`. Returværdien skal altid tjekkes.',
      hold: 2000,
    },
    {
      caption:
        '`write(fd, …)` skriver gennem descriptor `3` og returnerer antal skrevne bytes, her `13`. Det kan være færre end bedt om — eller `-1`.',
      hold: 2800,
    },
    {
      caption:
        '`close(fd)` lukker filen, og descriptor `3` er ikke længere i brug. Teksten er skrevet til `file.txt`.',
      hold: 3000,
    },
  ],
  Component: FdTable,
}

export default viz
