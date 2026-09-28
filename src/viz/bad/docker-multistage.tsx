import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Tag, Token, at, type Tone } from '../kit/primitives'
import { t } from '../kit/motion'
import './docker-multistage.css'

/* Docker.pdf s. 11–12: materialets multi-stage Dockerfile. Hver instruktion
   bliver et lag; kun /app kopieres fra build-stagen til final-stagen. */

interface Layer {
  id: string
  code: string
  /** Trinnet hvor laget bygges. */
  beat: number
  base?: boolean
}

const BUILD: Layer[] = [
  { id: 'sdk', code: 'FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build', beat: 0, base: true },
  { id: 'wd1', code: 'WORKDIR /source', beat: 1 },
  { id: 'sln', code: 'COPY *.sln .', beat: 1 },
  { id: 'csproj', code: 'COPY api/*.csproj ./api/', beat: 1 },
  { id: 'restore', code: 'RUN dotnet restore', beat: 1 },
  { id: 'src', code: 'COPY api/. ./api/', beat: 2 },
  { id: 'wd2', code: 'WORKDIR /source/api', beat: 2 },
  { id: 'publish', code: 'RUN dotnet publish -c release -o /app', beat: 2 },
]

const FINAL: Layer[] = [
  { id: 'aspnet', code: 'FROM mcr.microsoft.com/dotnet/aspnet:10.0', beat: 0, base: true },
  { id: 'wd3', code: 'WORKDIR /app', beat: 3 },
  { id: 'copy', code: 'COPY --from=build /app ./', beat: 3 },
  { id: 'entry', code: 'ENTRYPOINT ["dotnet", "api.dll"]', beat: 4 },
]

// Sidste trin: koden er ændret. Lagene til og med restore kommer fra cachen.
const REBUILT = new Set(['src', 'wd2', 'publish'])

// Linjeskift efter / i lange image-navne på smal skærm.
const breakable = (s: string) => s.split(/(?<=\/)/).flatMap((part, i) => (i ? [<wbr key={i} />, part] : [part]))

function Bar({ layer, step, order, tone, side }: { layer: Layer; step: number; order: number; tone: Tone; side?: ReactNode }) {
  const built = at(step, layer.beat)
  return (
    <motion.li
      className="dk-layer"
      data-tone={tone}
      data-base={layer.base || undefined}
      initial={false}
      animate={built ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: -8, scale: 0.98 }}
      transition={built ? { ...t.place, delay: step === layer.beat ? 0.1 + order * 0.14 : 0 } : t.fade}
      aria-hidden={!built || undefined}
    >
      <code className="dk-code">{breakable(layer.code)}</code>
      {side !== undefined && <span className="dk-side">{side}</span>}
    </motion.li>
  )
}

function Multistage({ step }: { step: number }) {
  const discarded = at(step, 4)
  const cache = at(step, 5)
  const app = (
    <Token id="dk-app" tone={step >= 4 ? 'idle' : 'focus'}>
      /app
    </Token>
  )
  const order = (l: Layer, list: Layer[]) => list.filter((x) => x.beat === l.beat).indexOf(l)

  return (
    <div className="dk">
      <section className="dk-stage" data-tone={discarded ? 'muted' : 'idle'}>
        <header className="dk-head">
          <span className="vcaps">Build stage · SDK</span>
          <Tag show={discarded} tone="muted">
            kasseres — ikke i det endelige image
          </Tag>
        </header>
        <ol className="dk-layers">
          {BUILD.map((l) => {
            const tone: Tone = cache
              ? REBUILT.has(l.id) ? 'focus' : 'idle'
              : step === l.beat && !l.base ? 'focus' : 'idle'
            const side =
              l.base ? undefined
              : cache ? <Tag tone={REBUILT.has(l.id) ? 'focus' : 'muted'}>{REBUILT.has(l.id) ? 'bygges igen' : 'cache'}</Tag>
              : l.id === 'publish' ? step >= 2 && step < 3 && app
              : null
            return <Bar key={l.id} layer={l} step={step} order={order(l, BUILD)} tone={tone} side={side} />
          })}
        </ol>
      </section>

      <section className="dk-stage" data-tone={discarded ? 'focus' : 'idle'}>
        <header className="dk-head">
          <span className="vcaps">Final stage · runtime</span>
        </header>
        <ol className="dk-layers">
          {FINAL.map((l) => {
            const tone: Tone = step === l.beat && !l.base ? 'focus' : 'idle'
            const side = l.id === 'copy' ? step >= 3 && app : undefined
            return <Bar key={l.id} layer={l} step={step} order={order(l, FINAL)} tone={tone} side={side} />
          })}
        </ol>
        <motion.p
          className="dk-result vnote"
          initial={false}
          animate={discarded ? { opacity: 1, y: 0 } : { opacity: 0, y: 4 }}
          transition={discarded ? { ...t.settle, delay: 0.4 } : t.fade}
        >
          Det endelige image: aspnet-basen + <code>/app</code> + <code>ENTRYPOINT</code>. Containeren lytter som standard på
          port <code>8080</code>.
        </motion.p>
      </section>
    </div>
  )
}

const viz: VizDef = {
  id: 'docker-multistage',
  title: 'Multi-stage build: kun publish-outputtet kommer med',
  steps: [
    {
      caption: 'Dockerfilen har to stages: et stort image med **SDK** til at bygge og et lille **runtime**-image til at køre.',
      hold: 2200,
    },
    {
      caption: 'Hver instruktion bliver et **lag**. Først kopieres kun projektfilerne, så `dotnet restore` får sit eget lag.',
      hold: 2600,
    },
    { caption: 'Så kopieres resten af koden, og `dotnet publish` lægger det færdige output i `/app`.', hold: 2200 },
    {
      caption: 'Final stage starter fra `aspnet:10.0`. `COPY --from=build` henter **kun** `/app` fra build-stagen.',
      hold: 2800,
    },
    {
      caption:
        'Build-stagen kasseres: SDK og kildekode kommer ikke med. Tilbage er aspnet-basen, `/app` og `ENTRYPOINT` — containeren lytter på `8080`.',
      hold: 3000,
    },
    {
      caption:
        'Næste build, hvor kun koden er ændret: lagene til og med `dotnet restore` genbruges fra **cachen**. Når ét lag ændres, bygges alle lag efter det igen.',
      hold: 3000,
    },
  ],
  Component: Multistage,
}

export default viz
