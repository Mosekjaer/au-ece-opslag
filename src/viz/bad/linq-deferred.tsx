import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Node, Tag, VTable, at, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './linq-deferred.css'

/* EF Core Advanced.pdf s. 3–10 + LINQ.pdf: del 1 er faldgruben med to Count(),
   del 2 er samme Where på IEnumerable (i hukommelsen) og IQueryable (i databasen).
   Begge scener ligger i samme gittercelle, så pladen har samme højde hele vejen. */

const CODE = [
  'var evens = numbers.Where(n => n % 2 == 0);',
  'Console.WriteLine(evens.Count());',
  'Console.WriteLine(evens.Count());',
  'var evens = numbers.Where(n => n % 2 == 0).ToList();',
]

// Illustrative rækker: true = IsActive.
const ROWS = [true, false, true, true, false, false]

function Deferred({ step }: { step: number }) {
  const line = step >= 1 && step <= 4 ? step - 1 : -1
  const runs = step >= 3 ? 2 : step >= 2 ? 1 : 0
  return (
    <div className="lq-a">
      <ol className="lq-code">
        {CODE.map((c, i) => (
          <li key={i} className="mono" data-tone={i === line ? (i === 2 ? 'neg' : 'focus') : i === 3 && step < 4 ? 'ghost' : 'idle'} data-fix={i === 3 || undefined}>
            {c}
          </li>
        ))}
      </ol>

      <div className="lq-state">
        <Node title="numbers" sub="kilden" mono tone={step === 2 || step === 3 ? 'focus' : 'idle'} />
        <motion.div className="lq-pass" data-on={step === 2 || step === 3 || undefined} initial={false} animate={{ opacity: at(step, 1) ? 1 : 0 }} transition={t.fade}>
          ↓ <span>{step === 2 || step === 3 ? 'gennemløb' : 'Where'}</span>
        </motion.div>
        <div className="lq-results">
          <Node className="lq-plan" title="evens" sub="plan: Where(n => n % 2 == 0) — ikke kørt" mono tone={step === 1 ? 'focus' : step >= 4 ? 'muted' : 'ghost'} show={at(step, 1)} />
          <Node className="lq-list" title="List<int>" sub="materialiseret én gang" mono tone={step === 4 ? 'focus' : 'ok'} show={at(step, 4)} />
        </div>
      </div>

      <div className="lq-runs">
        <span className="vcaps">Kørsler over numbers</span>
        <div className="lq-run">
          <span>uden <code>ToList()</code></span>
          <motion.span key={runs} className="lq-count" data-tone={runs === 2 ? 'neg' : 'idle'} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={t.place}>
            {runs}
          </motion.span>
          <Tag show={step === 3} tone="neg">kører igen</Tag>
        </div>
        <div className="lq-run" style={{ opacity: at(step, 4) ? 1 : 0.3 }}>
          <span>med <code>ToList()</code></span>
          <span className="lq-count" data-tone={at(step, 4) ? 'ok' : 'idle'}>{at(step, 4) ? 1 : '–'}</span>
        </div>
      </div>
    </div>
  )
}

function Chips({ rows, keep, stage, drop }: { rows: boolean[]; keep: (r: boolean) => boolean; stage: string; drop?: boolean }) {
  return (
    <div className="lq-chips">
      {rows.map((r, i) =>
        keep(r) ? (
          <motion.span
            key={i}
            layoutId={`${stage}-${i}`}
            className="lq-chip"
            data-tone={drop && !r ? 'muted' : r ? 'focus' : 'idle'}
            transition={{ ...t.travel, delay: i * 0.05 }}
          />
        ) : null,
      )}
    </div>
  )
}

function Lane({ kind, step, from }: { kind: 'enum' | 'query'; step: number; from: number }) {
  const on = at(step, from)
  const moved = at(step, kind === 'enum' ? 5 : 6)
  const q = kind === 'query'
  const tone: Tone = step === from ? 'focus' : 'idle'
  return (
    <div className="lq-lane" style={{ opacity: on ? 1 : 0.3 }}>
      <div className="lq-lane-head mono">{q ? 'IQueryable<User>  (EF)' : 'IEnumerable<User>'}</div>
      <code className="lq-lambda">.Where(u =&gt; u.IsActive)</code>
      <Node tone={on ? tone : 'ghost'} className="lq-compiled">
        {q ? (
          <>
            <div className="mono lq-type">Expression&lt;Func&lt;User, bool&gt;&gt;</div>
            <div className="lq-tree" aria-label="Expression tree">
              <span className="lq-tn">u =&gt; …</span>
              <span className="lq-tn">.IsActive</span>
              <span className="lq-tn">u</span>
            </div>
            <div className="lq-sql">
              <span className="vcaps">oversat til SQL (eksempel)</span>
              <code>SELECT … WHERE [IsActive] = 1</code>
            </div>
          </>
        ) : (
          <>
            <div className="mono lq-type">Func&lt;User, bool&gt;</div>
            <div className="vnote">kompileret til IL, kaldes for hver række</div>
          </>
        )}
      </Node>
      <div className="lq-wire">
        <div className="lq-end">
          <span className="vcaps">Database</span>
          <Chips rows={ROWS} stage={kind} keep={(r) => !moved || (q && !r)} drop={q && moved} />
        </div>
        <div className="lq-end">
          <span className="vcaps">.NET-hukommelse</span>
          <Chips rows={ROWS} stage={kind} keep={(r) => moved && (!q || r)} drop={!q} />
        </div>
      </div>
      <div className="lq-where">
        <Tag show={moved} tone={q ? 'focus' : 'idle'}>
          {q ? 'filtreres i databasen' : 'alle rækker hentes, filtreres i .NET'}
        </Tag>
      </div>
    </div>
  )
}

const TABLE = [
  ['Kører i', 'Hukommelse', 'Database'],
  ['Lambda-type', 'Func<T, bool>', 'Expression<Func<T, bool>>'],
  ['Hvem kører logikken', '.NET runtime', 'Query provider (EF)'],
  ['Kan oversættes til SQL', 'Nej', 'Ja'],
]

function Compare({ step }: { step: number }) {
  return (
    <div className="lq-b">
      <div className="lq-lanes">
        <Lane kind="enum" step={step} from={5} />
        <Lane kind="query" step={step} from={6} />
      </div>
      <motion.div className="lq-table" initial={false} animate={{ opacity: at(step, 7) ? 1 : 0 }} transition={at(step, 7) ? stagger(0, 0.1) : t.fade}>
        <VTable cols={['', 'IEnumerable', 'IQueryable']} rows={TABLE.map((r) => ({ key: r[0], cells: [r[0], <code key="a">{r[1]}</code>, <code key="b">{r[2]}</code>] }))} compact />
      </motion.div>
    </div>
  )
}

function LinqDeferred({ step }: { step: number }) {
  const b = at(step, 5)
  return (
    <div className="lq">
      <div className="lq-tabs" aria-hidden="true">
        <span data-on={!b}>1 · Deferred execution</span>
        <span data-on={b}>2 · IEnumerable og IQueryable</span>
      </div>
      <div className="lq-stage">
        <motion.div className="lq-scene" initial={false} animate={{ opacity: b ? 0 : 1 }} transition={b ? t.fade : t.settle} aria-hidden={b || undefined} style={{ pointerEvents: b ? 'none' : undefined }}>
          <Deferred step={Math.min(step, 4)} />
        </motion.div>
        <motion.div className="lq-scene" initial={false} animate={{ opacity: b ? 1 : 0 }} transition={b ? t.settle : t.fade} aria-hidden={!b || undefined}>
          <Compare step={step} />
        </motion.div>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'linq-deferred',
  title: 'Lazy LINQ: IEnumerable i hukommelsen, IQueryable i databasen',
  steps: [
    { caption: 'Et filter over `numbers` og to kald til `Count()`. Spørgsmålet er, *hvornår* filteret bliver kørt.', hold: 1800 },
    { caption: '`Where` er en **lazy** operator: `evens` er kun en plan for forespørgslen. Intet er kørt endnu.', hold: 2400 },
    { caption: '`Count()` er **terminal**: nu gennemløbes `numbers`, og forespørgslen kører for første gang.', hold: 2200 },
    { caption: 'Det andet `Count()` kører **hele forespørgslen igen**. Planen husker ikke resultatet.', hold: 2600 },
    { caption: 'Løsningen er at materialisere én gang med `.ToList()`. Derefter tælles på listen, ikke på planen.', hold: 2600 },
    {
      caption: 'Samme `Where(u => u.IsActive)` på `IEnumerable<T>`: lambdaen kompileres til IL som `Func<T, bool>` og kører **i hukommelsen**.',
      hold: 2800,
    },
    {
      caption:
        'På `IQueryable<T>` bliver lambdaen et **expression tree**, som EF oversætter til SQL. Filtreringen sker i databasen, og kun de matchende rækker kommer over.',
      hold: 3000,
    },
    {
      caption: 'Forskellen samlet. Derfor skal `Where`, `OrderBy`, `Skip` og `Take` ligge *før* `ToList()` mod en database.',
      hold: 3000,
    },
  ],
  Component: LinqDeferred,
}

export default viz
