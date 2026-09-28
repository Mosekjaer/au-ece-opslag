import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import type { VizDef } from '../kit/types'
import { Swap, VTable, at, type Row } from '../kit/primitives'
import { t } from '../kit/motion'
import './style-resolution.css'

/* Styles and themes.pdf s. 5–17 (eksplicit labelStyle på ReportPage, implicit
   Label-style, Application.Resources med Colors.xaml + Styles.xaml, hierarkiet
   s. 10, AppThemeBinding s. 13, StaticResource/DynamicResource s. 15–17).
   Bog kap. 10: FontSize 64 (listing 10.3), Primary #215377 (10.1),
   PrimaryDark #7b98aa (10.4). At én Label har alle kilder på én gang, og at den
   implicitte style ligger på app-niveau, er figurens konstruktion. */

const SHY = String.fromCharCode(0xad)
const ZWSP = String.fromCharCode(0x200b)

/** Brudpunkter i kode: efter . ( = , og bløde bindestreger i lange camelCase-navne. */
function brk(s: string) {
  return s
    .replace(/[A-Za-z]{15,}/g, (w) => w.replace(/([a-z])(?=[A-Z])/g, `$1${SHY}`))
    .replace(/([.(=,])(?=\S)/g, `$1${ZWSP}`)
}

interface Ln {
  text: ReactNode
  /** Varianter af linjen: [fra trin, tekst]. Stables i én celle, så højden er fast. */
  variants?: [number, string][]
  i?: number
  /** Synlig fra trin. */
  show?: number
  /** Markeret i trin. */
  hl?: number[]
  /** Overstreget (tabt) fra trin. */
  lose?: number
}

function Code({ lines, step }: { lines: Ln[]; step: number }) {
  return (
    <div className="sr-code">
      {lines.map((l, n) => {
        const vis = step >= (l.show ?? 0)
        const on = !!l.hl?.includes(step)
        const lost = l.lose !== undefined && step >= l.lose
        return (
          <motion.div
            key={n}
            className="sr-ln"
            data-lost={lost || undefined}
            style={{ '--i': l.i ?? 0 } as CSSProperties}
            initial={false}
            animate={{ opacity: vis ? 1 : 0 }}
            transition={vis ? { ...t.settle, delay: step === l.show ? n * 0.05 : 0 } : t.fade}
          >
            <motion.span className="sr-hl" initial={false} animate={{ opacity: on ? 1 : 0 }} transition={t.fade} />
            {l.variants ? (
              <Swap
                show={l.variants.reduce((acc, [from], j) => (step >= from ? j : acc), 0)}
                className="sr-swap"
                items={l.variants.map(([, txt], j) => (
                  <span key={j} className="sr-t">
                    {brk(txt)}
                  </span>
                ))}
              />
            ) : (
              <span className="sr-t">{typeof l.text === 'string' ? brk(l.text) : l.text}</span>
            )}
          </motion.div>
        )
      })}
    </div>
  )
}

const IMPLICIT: Ln[] = [
  { text: '<Style TargetType="Label">', show: 1, hl: [1] },
  { text: '<Setter Property="FontSize" Value="24" />', i: 2, show: 1, hl: [1], lose: 2 },
  { text: '</Style>', show: 1 },
]

const COLORS: Ln[] = [
  { text: '<Color x:Key="Primary">#215377</Color>', show: 4, hl: [4] },
  { text: '<Color x:Key="PrimaryDark">#7b98aa</Color>', show: 5, hl: [5] },
]

const EXPLICIT: Ln[] = [
  { text: '<Style x:Key="labelStyle" TargetType="Label">', show: 2, hl: [2] },
  { text: '<Setter Property="HorizontalOptions" Value="Center" />', i: 2, show: 2, hl: [2] },
  { text: '<Setter Property="VerticalOptions" Value="Center" />', i: 2, show: 2, hl: [2] },
  { text: '<Setter Property="FontSize" Value="18" />', i: 2, show: 2, hl: [2], lose: 3 },
  { text: '</Style>', show: 2 },
]

const LABEL: Ln[] = [
  { text: '<Label' },
  { text: 'Style="{StaticResource labelStyle}"', i: 7, show: 2, hl: [2] },
  { text: 'FontSize="64"', i: 7, show: 3, hl: [3] },
  {
    text: null,
    variants: [
      [4, 'TextColor="{StaticResource Primary}"'],
      [5, 'TextColor="{AppThemeBinding Light={StaticResource Primary}, Dark={StaticResource PrimaryDark}}"'],
    ],
    i: 7,
    show: 4,
    hl: [4, 5],
  },
  { text: '/>', i: 7 },
]

function Layer({
  name,
  scope,
  focus,
  level,
  children,
}: {
  name: ReactNode
  scope: string
  focus: boolean
  level: number
  children: ReactNode
}) {
  return (
    <div className="sr-layer" data-level={level} data-tone={focus ? 'focus' : 'idle'}>
      <div className="sr-layer-head">
        <span className="sr-layer-name">{name}</span>
        <span className="sr-scope">{scope}</span>
      </div>
      {children}
    </div>
  )
}

/* ---- Forhåndsvisning og værditabel ---------------------------------- */

const FONT = ['0.875rem', '1.5rem', '1.125rem', '4rem']

function Preview({ step }: { step: number }) {
  const dark = at(step, 5)
  const centered = at(step, 2)
  const size = step >= 3 ? FONT[3] : step === 2 ? FONT[2] : step === 1 ? FONT[1] : FONT[0]
  const tone = dark ? 'dark' : at(step, 4) ? 'primary' : 'default'
  return (
    <div className="sr-preview">
      <div className="sr-os" role="presentation">
        <span className="sr-os-cap">OS-tema</span>
        <span className="sr-os-opt" data-on={!dark || undefined}>
          Light
        </span>
        <span className="sr-os-opt" data-on={dark || undefined}>
          Dark
        </span>
      </div>
      <div className="sr-screen" data-dark={dark || undefined}>
        <motion.span
          className="sr-label"
          data-color={tone}
          initial={false}
          animate={{
            left: centered ? '50%' : '0%',
            top: centered ? '50%' : '0%',
            x: centered ? '-50%' : '0%',
            y: centered ? '-50%' : '0%',
            fontSize: size,
          }}
          transition={t.travel}
        >
          Label
        </motion.span>
      </div>
    </div>
  )
}

/** Værdi og kilde pr. property: [fra trin, værdi, kommer fra]. */
const TABLE: { key: string; prop: string; now: number[]; v: [number, string, string][] }[] = [
  {
    key: 'fs',
    prop: 'FontSize',
    now: [1, 2, 3],
    v: [
      [0, '—', 'standard'],
      [1, '24', 'implicit style (app)'],
      [2, '18', 'eksplicit style (page)'],
      [3, '64', 'direkte på Label'],
    ],
  },
  {
    key: 'ho',
    prop: 'HorizontalOptions',
    now: [2],
    v: [
      [0, '—', 'standard'],
      [2, 'Center', 'eksplicit style (page)'],
    ],
  },
  {
    key: 'tc',
    prop: 'TextColor',
    now: [4, 5],
    v: [
      [0, '—', 'standard'],
      [4, '#215377', 'StaticResource Primary'],
      [5, '#7b98aa', 'AppThemeBinding: Dark'],
    ],
  },
]

function rows(step: number): Row[] {
  return TABLE.map((r) => {
    const cur = r.v.reduce((acc, [from], j) => (step >= from ? j : acc), 0)
    const cell = (col: 1 | 2) => <Swap key={col} show={cur} items={r.v.map((v, j) => <span key={j}>{v[col]}</span>)} />
    return {
      key: r.key,
      cells: [<code key="p">{brk(r.prop)}</code>, cell(1), cell(2)],
      cellTone: r.now.includes(step) ? { 1: 'focus', 2: 'focus' } : undefined,
    }
  })
}

function Styles({ step }: { step: number }) {
  const legendOn = at(step, 6)
  return (
    <div className="sr">
      <div className="sr-main">
        <div className="sr-layers">
          <Layer
            level={0}
            focus={step === 1 || step === 4}
            name={<code>Application.Resources</code>}
            scope="app · App.xaml: Colors.xaml + Styles.xaml"
          >
            <Code lines={IMPLICIT} step={step} />
            <Code lines={COLORS} step={step} />
          </Layer>
          <Layer level={1} focus={step === 2} name={<code>{brk('ContentPage.Resources')}</code>} scope="page">
            <Code lines={EXPLICIT} step={step} />
          </Layer>
          <Layer level={2} focus={step === 3 || step === 5} name={<code>Label</code>} scope="selve controllen">
            <Code lines={LABEL} step={step} />
          </Layer>
        </div>

        <div className="sr-side">
          <Preview step={step} />
          <div className="sr-table">
            <VTable compact cols={['Property', 'Værdi', 'Kommer fra']} rows={rows(step)} />
          </div>
        </div>
      </div>

      <motion.div
        className="sr-legend"
        initial={false}
        animate={{ opacity: legendOn ? 1 : 0, y: legendOn ? 0 : 4 }}
        transition={legendOn ? t.settle : t.fade}
      >
        <p className="sr-order">
          <span>app</span> &lt; <span>page</span> · <span>eksplicit</span> &gt; <span>implicit</span> · <span>direkte værdi</span> &gt;{' '}
          <span>alle styles</span>
        </p>
        <p className="vnote">
          <code>DynamicResource</code> følger nøglen ved runtime, men virker ikke sammen med <code>AppThemeBinding</code>. Derfor samles
          farver og styles i et <em>theme</em>.
        </p>
      </motion.div>
    </div>
  )
}

const viz: VizDef = {
  id: 'style-resolution',
  title: 'Hvilken værdi ender på en Label',
  steps: [
    { caption: 'En property-værdi kan komme fra tre niveauer: app, page og selve controllen.', hold: 1800 },
    { caption: 'En **implicit** style (kun `TargetType`) rammer alle `Label`s i sit scope: `FontSize` bliver 24.', hold: 2400 },
    {
      caption: 'En **eksplicit** style (`x:Key`) på page-niveau vinder over den implicitte: `FontSize` 18, og `Label`’en centreres.',
      hold: 2800,
    },
    { caption: 'En værdi sat **direkte** på controllen overskriver alle styles — men kun den ene property.', hold: 2400 },
    { caption: '`{StaticResource Primary}` slår nøglen op i resource dictionary’en — én gang.', hold: 2400 },
    { caption: '`AppThemeBinding` vælger Light- eller Dark-værdien efter OS’ets tema: i Dark bliver det `PrimaryDark`.', hold: 3000 },
    { caption: 'Præcedens og opslag samlet: snævrere scope vinder, og en direkte værdi slår alle styles.', hold: 3000 },
  ],
  Component: Styles,
}

export default viz
