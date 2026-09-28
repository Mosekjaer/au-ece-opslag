import { motion } from 'motion/react'
import type { VizDef } from '../kit/types'
import { Node, Tag, VTable, at, type Row, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './logging-filter.css'

/* Logging.pdf: de tre eksempelregler (standard Information, Microsoft* Warning,
   console-provideren Error) anvendt på fem beskeder og to providers.
   Til sidst struktureret logging med pladsholder vs. string interpolation. */

const LEVELS = ['Critical', 'Error', 'Warning', 'Information', 'Debug', 'Trace'] as const
type Level = (typeof LEVELS)[number]
const rank = (l: Level) => LEVELS.length - LEVELS.indexOf(l) // højere = alvorligere

type RuleId = 'default' | 'microsoft' | 'console'
const RULES: { id: RuleId; scope: string; min: Level }[] = [
  { id: 'default', scope: 'Standard (ingen anden regel)', min: 'Information' },
  { id: 'microsoft', scope: 'Kategori starter med Microsoft', min: 'Warning' },
  { id: 'console', scope: 'Console-provideren', min: 'Error' },
]
const MIN: Record<RuleId, Level> = { default: 'Information', microsoft: 'Warning', console: 'Error' }

const MESSAGES: { level: Level; cat: string }[] = [
  { level: 'Information', cat: 'MyApp.RecipeController' },
  { level: 'Debug', cat: 'MyApp.RecipeController' },
  { level: 'Information', cat: 'Microsoft.AspNetCore' },
  { level: 'Warning', cat: 'Microsoft.AspNetCore' },
  { level: 'Error', cat: 'MyApp.RecipeController' },
]

// Provider-reglen vinder for Console; ellers afgør kategorien.
const ruleFor = (m: (typeof MESSAGES)[number], provider: 'console' | 'debug'): RuleId =>
  provider === 'console' ? 'console' : m.cat.startsWith('Microsoft') ? 'microsoft' : 'default'
const passes = (m: (typeof MESSAGES)[number], provider: 'console' | 'debug') => rank(m.level) >= rank(MIN[ruleFor(m, provider)])

function Verdict({ ok, min, i }: { ok: boolean; min: Level; i: number }) {
  return (
    <motion.span className="lf-verdict" initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} transition={{ ...t.place, delay: 0.25 + i * 0.3 }}>
      <b>{ok ? '✓' : '✗'}</b>
      <span>
        {ok ? '≥' : '<'} {min}
      </span>
    </motion.span>
  )
}

function LoggingFilter({ step }: { step: number }) {
  const cur = step >= 1 && step <= 5 ? MESSAGES[step - 1] : undefined
  const active = new Set<RuleId>(cur ? [ruleFor(cur, 'console'), ruleFor(cur, 'debug')] : [])

  const rows: Row[] = MESSAGES.map((m, i) => {
    const shown = at(step, i + 1)
    const now = step === i + 1
    const c = passes(m, 'console')
    const d = passes(m, 'debug')
    const tone: Tone = !shown ? 'ghost' : now ? 'focus' : !c && !d ? 'muted' : 'idle'
    return {
      key: String(i),
      tone,
      cellTone: shown ? { 0: tone, 1: c ? 'focus' : 'neg', 2: d ? 'focus' : 'neg' } : undefined,
      cells: [
        <span className="lf-msg" key="m">
          <span className="lf-lvl">{m.level}</span>
          <span className="lf-cat mono">
            {m.cat.split('.').map((part, j) => (
              <span key={j}>
                {j > 0 && '.'}
                {j > 0 && <wbr />}
                {part}
              </span>
            ))}
          </span>
        </span>,
        shown ? <Verdict key="c" ok={c} min={MIN[ruleFor(m, 'console')]} i={0} /> : '·',
        shown ? <Verdict key="d" ok={d} min={MIN[ruleFor(m, 'debug')]} i={1} /> : '·',
      ],
    }
  })

  return (
    <div className="lf">
      <div className="lf-top">
        <div className="lf-rules">
          <span className="vcaps">Filterregler (eksemplet i slides)</span>
          {RULES.map((r) => (
            <Node key={r.id} className="lf-rule" tone={active.has(r.id) ? 'focus' : 'idle'}>
              <span>{r.scope}</span>
              <code>≥ {r.min}</code>
            </Node>
          ))}
        </div>
        <div className="lf-levels">
          <span className="vcaps">Niveauer, alvorligst først</span>
          <ol>
            {LEVELS.map((l) => (
              <li key={l} data-now={cur?.level === l || undefined}>
                {l}
              </li>
            ))}
          </ol>
        </div>
      </div>

      <div className="lf-table">
        <VTable cols={['Besked (niveau · kategori)', 'Console', 'Debug']} rows={rows} compact />
      </div>

      <motion.div className="lf-struct" initial={false} animate={{ opacity: at(step, 6) ? 1 : 0 }} transition={at(step, 6) ? t.settle : t.fade}>
        <span className="vcaps">Struktureret logging (med models.Count = 7)</span>
        <div className="lf-cards">
          {[
            { code: '_log.LogInformation("Loaded {RecipeCount} recipes", models.Count);', kv: true },
            { code: '_log.LogInformation($"Loaded {models.Count} recipes");', kv: false },
          ].map((c, i) => (
            <Node key={i} className="lf-card" tone={!at(step, 6) ? 'ghost' : c.kv ? 'ok' : 'neg'}>
              <code className="lf-code">{c.code}</code>
              <div className="lf-stored">
                <span className="vcaps">Gemmes</span>
                <span className="lf-text">"Loaded 7 recipes"</span>
                <motion.span initial={false} animate={{ opacity: at(step, 6) ? 1 : 0 }} transition={at(step, 6) ? stagger(i, 0.4, 0.3) : t.fade}>
                  {c.kv ? <Tag>RecipeCount = 7</Tag> : <Tag tone="neg">ingen nøgle-værdi-par</Tag>}
                </motion.span>
              </div>
            </Node>
          ))}
        </div>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'logging-filter',
  title: 'Logbeskeder gennem filtreringsreglerne',
  steps: [
    {
      caption: 'Tre regler fra slides: standardminimum `Information`, `Microsoft`-kategorier mindst `Warning`, og console-provideren mindst `Error`. Fem beskeder skal igennem.',
      hold: 2800,
    },
    { caption: '`Information` fra appen: standardreglen lader den gå til **Debug**, men Console kræver `Error`.', hold: 2400 },
    { caption: '`Debug` ligger under standardminimum `Information` og filtreres fra, før den skrives nogen steder.', hold: 2200 },
    { caption: 'Samme niveau `Information`, men kategorien starter med `Microsoft`. Den regel kræver `Warning`, så den “støjende” framework-besked falder fra.', hold: 2800 },
    { caption: '`Warning` fra `Microsoft` klarer kategorireglen og når Debug. Console springer stadig over.', hold: 2200 },
    { caption: '`Error` klarer alle regler og skrives til **begge** providers.', hold: 2000 },
    {
      caption: 'Med pladsholderen `{RecipeCount}` kan en struktureret provider gemme værdien som et **nøgle-værdi-par** ved siden af teksten. Med string interpolation (`$"…"`) er kun teksten tilbage.',
      hold: 3000,
    },
    { caption: 'Samlet: Console fik kun `Error`. Debug fik appens beskeder fra `Information` og op, men Microsoft-beskeder først fra `Warning`.', hold: 3000 },
  ],
  Component: LoggingFilter,
}

export default viz
