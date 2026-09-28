import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, at } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './useeffect-timeline.css'

/* FED React side effects.pdf s. 3–9: Timer-komponenten (s. 6 uden array, s. 8
   med []), dependency-reglerne (s. 7–8) og diagrammet “React Hooks Lifecycle”
   (s. 9). Numrene #1 og #2 på intervallerne er figurens mærker. */

type Phase = 'mount' | 'update' | 'unmount'
type RowId = 'init' | 'render' | 'dom' | 'display' | 'cleanup' | 'run'

const ROWS: { id: RowId; label: string; sub?: string }[] = [
  { id: 'init', label: 'Initialize State' },
  { id: 'render', label: 'Render', sub: 'components return JSX' },
  { id: 'dom', label: 'React updates DOM' },
  { id: 'display', label: 'Browser displays DOM' },
  { id: 'cleanup', label: 'Cleanup old side effects' },
  { id: 'run', label: 'Run side effects' },
]

const PHASES: { id: Phase; name: string; life: string; trigger: string; rows: RowId[] }[] = [
  { id: 'mount', name: 'Mount', life: 'birth', trigger: 'Component first called', rows: ['init', 'render', 'dom', 'display', 'run'] },
  { id: 'update', name: 'Update', life: 'life', trigger: 'setState called', rows: ['render', 'dom', 'display', 'cleanup', 'run'] },
  { id: 'unmount', name: 'Unmount', life: 'death', trigger: 'Component no longer used', rows: ['cleanup'] },
]

type CellState = 'ghost' | 'on' | 'now' | 'skip'

/* Hvilke celler er tændt i hvert trin? Trin 1–3: uden array. Trin 4–6: med []. */
function cell(step: number, phase: Phase, row: RowId): CellState {
  if (phase === 'mount') {
    if (step < 1) return 'ghost'
    return step === 1 ? 'now' : 'on'
  }
  if (phase === 'update') {
    if (step < 2) return 'ghost'
    const effectRow = row === 'cleanup' || row === 'run'
    if (step === 2) return effectRow ? 'ghost' : 'now'
    if (step === 3) return effectRow ? 'now' : 'on'
    if (effectRow) return 'skip'
    return step === 4 ? 'now' : 'on'
  }
  if (step < 5) return 'ghost'
  return step === 5 ? 'now' : 'on'
}

/* Noterne i en celle: hvad der konkret sker med Timer. Alle varianter stables
   i cellen, så højden ikke skifter. */
const SKIP = 'springes over med []'
const NOTES: Partial<Record<`${Phase}-${RowId}`, ReactNode[]>> = {
  'mount-run': [<span key="a" className="mono">setInterval #1</span>],
  'update-display': [<span key="a">It is … (ny tid)</span>],
  'update-cleanup': [<span key="a" className="mono">clearInterval #1</span>, SKIP],
  'update-run': [<span key="a" className="mono">setInterval #2</span>, SKIP],
  'unmount-cleanup': [<span key="a" className="mono">
      clearInterval(
      <wbr />
      intervalID)
    </span>],
}

function noteIdx(step: number, phase: Phase, row: RowId): number {
  if (phase === 'mount' && row === 'run') return step >= 1 ? 0 : -1
  if (phase === 'update' && row === 'display') return step >= 2 ? 0 : -1
  if (phase === 'update' && (row === 'cleanup' || row === 'run')) return step === 3 ? 0 : step >= 4 ? 1 : -1
  if (phase === 'unmount' && row === 'cleanup') return step >= 5 ? 0 : -1
  return -1
}

const CODE: { text: string; hl?: 'run' | 'cleanup' | 'deps' }[] = [
  { text: 'function Timer(props) {' },
  { text: '  const [time, setTime] = useState(Date());' },
  { text: '  useEffect(() => {' },
  { text: '    console.log("New Effect");', hl: 'run' },
  { text: '    const intervalID = setInterval(() => {', hl: 'run' },
  { text: '      const newTime = Date();' },
  { text: '      setTime(newTime);' },
  { text: '    }, 1000);', hl: 'run' },
  { text: '    return () => clearInterval(intervalID);', hl: 'cleanup' },
  { text: '  });', hl: 'deps' },
  { text: '  return <div> It is {time} </div>;' },
  { text: '}' },
]

function Timeline({ step }: { step: number }) {
  const withDeps = at(step, 4)
  const hlRun = step === 1 || step === 3
  const hlCleanup = step === 3 || step === 5
  const running = step === 0 ? null : step === 3 ? 2 : step >= 5 ? null : 1
  const logs = step === 0 ? 0 : step === 3 ? 2 : 1

  return (
    <div className="ue">
      <div className="ue-left">
        <div className="ue-code mono">
          {CODE.map((l, i) => {
            const on = (l.hl === 'run' && hlRun) || (l.hl === 'cleanup' && hlCleanup) || (l.hl === 'deps' && step === 4)
            return (
              <div key={i} className="ue-line" data-on={on || undefined} data-kind={l.hl}>
                {l.hl === 'deps' ? <Swap show={withDeps ? 1 : 0} items={['  });', '  }, []);']} /> : l.text}
              </div>
            )
          })}
        </div>

        <motion.table
          className="ue-deps"
          initial={false}
          animate={{ opacity: withDeps ? 1 : 0, y: withDeps ? 0 : 4 }}
          transition={withDeps ? t.settle : t.fade}
        >
          <thead>
            <tr>
              <th>array</th>
              <th>effecten kører</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>intet</td>
              <td>efter hver render</td>
            </tr>
            <tr data-on={withDeps || undefined}>
              <td className="mono">[]</td>
              <td>kun ved mount</td>
            </tr>
            <tr>
              <td className="mono">[user]</td>
              <td>
                når <span className="mono">user</span> ændres
              </td>
            </tr>
          </tbody>
        </motion.table>
      </div>

      <div className="ue-right">
        <div className="ue-grid">
          {PHASES.map((p, pi) => {
            const reached = p.id === 'mount' ? at(step, 1) : p.id === 'update' ? at(step, 2) : at(step, 5)
            const now = p.id === 'mount' ? step === 1 : p.id === 'update' ? step >= 2 && step <= 4 : step === 5
            return (
              <section key={p.id} className="ue-phase" data-on={reached || undefined} data-now={now || undefined}>
                <header className="ue-phase-head">
                  <span className="ue-phase-name">
                    {p.name} <span className="ue-life">{p.life}</span>
                  </span>
                  <span className="ue-trigger">↓ {p.trigger}</span>
                </header>
                {ROWS.map((r, ri) => {
                  if (!p.rows.includes(r.id)) return <div key={r.id} className="ue-cell" data-na />
                  const st = cell(step, p.id, r.id)
                  const notes = NOTES[`${p.id}-${r.id}`]
                  const effect = r.id === 'cleanup' || r.id === 'run'
                  return (
                    <motion.div
                      key={r.id}
                      className="ue-cell"
                      data-state={st}
                      data-effect={effect || undefined}
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={st === 'now' ? stagger(ri, pi * 0.02, 0.12) : t.fade}
                    >
                      <span className="ue-cell-label">{r.label}</span>
                      {r.sub && <span className="ue-cell-sub">{r.sub}</span>}
                      {notes && <Swap className="ue-cell-note" show={noteIdx(step, p.id, r.id)} items={notes} />}
                    </motion.div>
                  )
                })}
              </section>
            )
          })}
        </div>

        <div className="ue-fields">
          <div className="ue-field">
            <span className="vcaps">Kørende interval</span>
            <span className="ue-field-body">
              <AnimatePresence mode="popLayout" initial={false}>
                {running ? (
                  <motion.span
                    key={running}
                    className="ue-interval"
                    initial={{ opacity: 0, scale: 0.7 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7, transition: t.fade }}
                    transition={{ ...t.place, delay: 0.5 }}
                  >
                    #{running} · 1000 ms
                  </motion.span>
                ) : (
                  <motion.span
                    key="none"
                    className="ue-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={t.fade}
                  >
                    {step === 0 ? 'intet endnu' : 'stoppet'}
                  </motion.span>
                )}
              </AnimatePresence>
            </span>
          </div>
          <div className="ue-field">
            <span className="vcaps">Konsol</span>
            <span className="ue-field-body ue-log mono">
              {[0, 1].map((i) => (
                <motion.span
                  key={i}
                  initial={false}
                  animate={{ opacity: i < logs ? 1 : 0 }}
                  transition={i < logs ? { ...t.settle, delay: 0.5 } : t.fade}
                >
                  New Effect
                </motion.span>
              ))}
            </span>
          </div>
        </div>
      </div>

      <motion.ul
        className="ue-legend"
        initial={false}
        animate={{ opacity: at(step, 6) ? 1 : 0, y: at(step, 6) ? 0 : 4 }}
        transition={at(step, 6) ? t.settle : t.fade}
      >
        <li>effect kører efter DOM’en er vist</li>
        <li>cleanup før ny effect og ved unmount</li>
        <li>arrayet styrer hvornår</li>
      </motion.ul>
    </div>
  )
}

const viz: VizDef = {
  id: 'useeffect-timeline',
  title: 'Timerens effect gennem mount, update og unmount',
  steps: [
    {
      caption: 'Livscyklussen har tre faser: mount, update og unmount. `Timer` starter et interval i en effect — **uden** dependency-array.',
      hold: 1800,
    },
    {
      caption: 'Mount: state initialiseres, der renderes, og DOM’en vises. **Først derefter** kører effecten: `New Effect` og interval #1.',
      hold: 2800,
    },
    { caption: 'Efter 1000 ms kalder intervallet `setTime`, og komponenten renderer igen med den nye tid.', hold: 2200 },
    {
      caption: 'Uden dependency-array: den gamle effect ryddes op (`clearInterval`), og en ny startes — ved **hver** render.',
      hold: 2800,
    },
    { caption: 'Med `[]` kører effecten kun ved mount. Opdateringer renderer, men rører ikke intervallet.', hold: 2800 },
    { caption: 'Unmount: komponenten bruges ikke længere, og kun cleanup kører. Intervallet stopper.', hold: 2400 },
    { caption: 'Effect efter visning, cleanup før næste effect og ved unmount. Arrayet styrer hvornår.', hold: 3000 },
  ],
  Component: Timeline,
}

export default viz
