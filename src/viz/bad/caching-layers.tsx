import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, Token, type Tone } from '../kit/primitives'
import { stagger, t } from '../kit/motion'
import './caching-layers.css'

/* Caching techniques.pdf: cacher i hvert lag, [ResponseCache] → cache-control,
   betinget GET med ETag → 304, og IMemoryCache-mønstret (TryGetValue / Set 30 s). */

const LAYERS = [
  { id: 'client', name: 'Klient', sub: 'browser-cache' },
  { id: 'proxy', name: 'Proxy / CDN', sub: 'delt cache undervejs' },
  { id: 'server', name: 'Webserver', sub: 'response cache · IMemoryCache' },
  { id: 'dist', name: 'Distribueret cache', sub: 'SQL Server AppCache / Redis' },
  { id: 'db', name: 'DBMS', sub: 'kilden' },
] as const
type LayerId = (typeof LAYERS)[number]['id']

interface Frame {
  at: LayerId
  label: string
  tone: Tone
  status: Partial<Record<LayerId, [string, Tone]>>
  quiet?: LayerId[] // lag der ikke nås
  header: ReactNode
  dirs: string[]
  code: [Tone, Tone, Tone]
}

const ATTR = <code>[ResponseCache(Location = ResponseCacheLocation.Any, Duration = 60)]</code>
const CC = <code>cache-control: public, max-age=60</code>
const IDLE3: [Tone, Tone, Tone] = ['idle', 'idle', 'idle']

const FRAMES: Frame[] = [
  { at: 'client', label: 'GET /BoardGames', tone: 'idle', status: {}, header: ATTR, dirs: [], code: IDLE3 },
  {
    at: 'db',
    label: 'GET /BoardGames',
    tone: 'focus',
    status: { client: ['miss', 'muted'], proxy: ['miss', 'muted'], server: ['miss', 'muted'], dist: ['miss', 'muted'] },
    header: ATTR,
    dirs: [],
    code: IDLE3,
  },
  { at: 'client', label: '200 OK', tone: 'focus', status: {}, header: CC, dirs: ['public', 'max-age'], code: IDLE3 },
  {
    at: 'client',
    label: 'GET /BoardGames',
    tone: 'ok',
    status: { client: ['hit', 'focus'] },
    quiet: ['proxy', 'server', 'dist', 'db'],
    header: <>{CC} · svaret er under 60 s gammelt</>,
    dirs: ['max-age'],
    code: IDLE3,
  },
  {
    at: 'server',
    label: 'If-None-Match',
    tone: 'focus',
    status: { client: ['forældet', 'neg'], proxy: ['forældet', 'neg'], server: ['ETag matcher', 'focus'] },
    quiet: ['dist', 'db'],
    header: <code>If-None-Match: "&lt;etag&gt;"</code>,
    dirs: [],
    code: IDLE3,
  },
  {
    at: 'client',
    label: '304 Not Modified',
    tone: 'ok',
    status: { client: ['genbrugt', 'focus'], server: ['304', 'focus'] },
    quiet: ['dist', 'db'],
    header: <><code>304 Not Modified</code> · uden body</>,
    dirs: [],
    code: IDLE3,
  },
  {
    at: 'db',
    label: 'ToArrayAsync()',
    tone: 'focus',
    status: { server: ['miss → Set', 'focus'] },
    quiet: ['dist'],
    header: <code>_memoryCache.Set(cacheKey, result, new TimeSpan(0, 0, 30))</code>,
    dirs: [],
    code: ['neg', 'focus', 'focus'],
  },
  {
    at: 'server',
    label: 'TryGetValue → hit',
    tone: 'ok',
    status: { server: ['hit', 'focus'] },
    quiet: ['dist', 'db'],
    header: <>samme <code>cacheKey</code> inden for 30 s</>,
    dirs: [],
    code: ['focus', 'muted', 'muted'],
  },
]

const DIRECTIVES = [
  { d: 'public', p: 'Location = Any', m: 'alle caches må gemme' },
  { d: 'private', p: 'Location = Client', m: 'kun klientens egen cache' },
  { d: 'max-age', p: 'Duration', m: 'antal sekunder svaret er gyldigt' },
  { d: 'no-cache', p: 'Location = None', m: 'valider hos serveren før genbrug' },
  { d: 'no-store', p: 'NoStore = true', m: 'gem slet ikke' },
]

const CODE = [
  'if (!_memoryCache.TryGetValue<BoardGame[]>(cacheKey, out result))',
  '    result = await query.ToArrayAsync();',
  '    _memoryCache.Set(cacheKey, result, new TimeSpan(0, 0, 30));',
]

function stored(step: number): Partial<Record<LayerId, [string, Tone][]>> {
  if (step < 2) return {}
  const stale = step === 4
  const copy: Tone = stale ? 'neg' : 'idle'
  return {
    client: [[stale ? 'svar · udløbet' : 'svar · max-age=60', copy]],
    proxy: [['svar · public', copy]],
    server: [['response cache', 'idle'], ...(step >= 6 ? [['IMemoryCache 30 s', step === 6 ? 'focus' : 'idle'] as [string, Tone]] : [])],
  }
}

function CachingLayers({ step }: { step: number }) {
  const f = FRAMES[step]
  const store = stored(step)
  return (
    <div className="chl">
      <ol className="chl-layers">
        {LAYERS.map((l, i) => {
          const quiet = f.quiet?.includes(l.id)
          const tone = f.at === l.id ? 'focus' : quiet ? 'muted' : 'idle'
          const st = f.status[l.id]
          return (
            <li key={l.id} className="chl-layer" data-id={l.id} data-tone={tone}>
              <div className="chl-name">
                <span className="chl-title">{l.name}</span>
                <span className="chl-sub">{l.sub}</span>
              </div>
              <div className="chl-status">
                {st && (
                  <motion.span key={`${step}-${st[0]}`} initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }} transition={stagger(i, 0.1, 0.12)}>
                    <Tag tone={st[1]}>{st[0]}</Tag>
                  </motion.span>
                )}
              </div>
              <div className="chl-slot">
                {f.at === l.id && (
                  <Token id="chl-req" tone={f.tone} launch={step === 1}>
                    {f.label}
                  </Token>
                )}
              </div>
              <div className="chl-store">
                {(store[l.id] ?? []).map(([txt, tn]) => (
                  <motion.span key={txt.split(' ')[0]} layout="position" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={t.place}>
                    <Tag tone={tn === 'idle' ? 'idle' : tn}>{txt}</Tag>
                  </motion.span>
                ))}
              </div>
            </li>
          )
        })}
      </ol>

      <div className="chl-header">
        <span className="vcaps">Header / kode</span>
        <motion.span key={step} className="chl-header-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={t.fade}>
          {f.header}
        </motion.span>
      </div>

      <div className="chl-foot">
        <div className="chl-code" data-on={step >= 6}>
          <span className="vcaps">I webserveren: IMemoryCache</span>
          <pre>
            {CODE.map((c, i) => (
              <span key={i} className="chl-code-line" data-tone={f.code[i]}>
                {c}
              </span>
            ))}
          </pre>
        </div>
        <dl className="chl-legend">
          {DIRECTIVES.map((x) => (
            <div key={x.d} className="chl-dir" data-on={f.dirs.includes(x.d) || undefined}>
              <dt>
                <code>{x.d}</code>
                <span className="chl-prop">{x.p}</span>
              </dt>
              <dd>{x.m}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

const viz: VizDef = {
  id: 'caching-layers',
  title: 'Cache i hvert lag — og betinget GET',
  steps: [
    {
      caption: 'Cacher kan ligge i alle lag mellem klient og database. Endpointet er markeret med `[ResponseCache]`: alle må cache i 60 sekunder.',
      hold: 2400,
    },
    { caption: 'Første anmodning: ingen cache har svaret, så den går hele vejen til **DBMS**.', hold: 2200 },
    {
      caption: 'Svaret bærer `cache-control: public, max-age=60`. Klient, proxy og serverens response cache gemmer hver en kopi.',
      hold: 3000,
    },
    { caption: 'Samme anmodning igen inden for 60 sekunder: et **hit** i browseren. Anmodningen forlader aldrig klienten.', hold: 2400 },
    {
      caption: 'Efter 60 sekunder er kopien forældet. Browseren sender en **betinget GET** med `If-None-Match` og sin `ETag`.',
      hold: 2600,
    },
    {
      caption: 'Ressourcen er uændret, så serveren svarer `304 Not Modified` **uden body**. Klienten genbruger sin kopi.',
      hold: 2600,
    },
    {
      caption: 'Inde i serveren: `TryGetValue` finder intet under `cacheKey`, så EF henter fra databasen, og `Set` gemmer resultatet i 30 sekunder.',
      hold: 3000,
    },
    {
      caption: 'Næste kald med samme parametre er et **hit** i `IMemoryCache` — databasen nås ikke. Nederst: hvad hvert `cache-control`-direktiv betyder.',
      hold: 3000,
    },
  ],
  Component: CachingLayers,
}

export default viz
