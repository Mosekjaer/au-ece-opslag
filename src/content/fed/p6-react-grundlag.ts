import type { Part } from '../types'
import { ctx } from './paths'

/** Brightspace-eksporter i fed/kilde, der rummer løsningsforslag og demoprojekter. */
const zip = (navn: string) => `fed/kilde/SW4FED-02 Front-end udvikling (E26.28523PU011.A) - 8242026 - ${navn}.zip`

export const reactGrundlag: Part = {
  id: 'react-grundlag',
  title: 'Web · React: grundlag',
  topics: [
    {
      slug: 'react-jsx',
      title: 'React, JSX og komponenter',
      short: 'React og JSX',
      week: 'Uge 8–9 · L16–L17',
      definition:
        'React er et JavaScript-**library** til brugergrænseflader, ikke et framework. En app bygges af **komponenter** — funktioner, der tager `props` og returnerer JSX — og React holder brugerfladen i takt med data efter formlen `UI = f(state)`.',
      intro: [
        'Slides opsummerer front-end-udviklerens opgaver i React sådan: del appen op i komponenter, beslut hvor state skal ligge (lokalt, delt eller globalt), implementér `f` — hvordan state bliver til HTML — tal med serveren, style appen og test den. Dette emne handler om de to første og om `f`; [[usestate|useState]] og [[useeffect|useEffect]] bygger videre.',
      ],
      concepts: [
        {
          term: 'Library, komponenter og UI = f(state)',
          body: [
            'React er skabt og vedligeholdt af Facebook og er “kun et UI-library”. Vælger man React sammen med Redux og React Router, ender man ifølge slides med noget, der minder om et framework som Angular. Appen består af komponenter, der kombineres og indlejres i hinanden til et træ.',
            'Kerneidéen er `UI = f(state)`: når en værdi i en komponents state ændres, re-renderer React brugerfladen. Man beskriver hvordan UI’et skal se ud for en given state, ikke hvordan det skal opdateres. Bogen (1. udg.) kalder det *declarative* stil og stiller den op mod jQuerys imperative DOM-manipulation og Angulars two-way binding.',
            'Separation of concerns løses anderledes end i Angular: Angular deler template-fil og TypeScript-fil, mens React samler markup og logik i løst koblede komponenter. Slides og bogen er enige: to filer til én funktionalitet er ikke separation of concerns.',
          ],
        },
        {
          term: 'Virtual DOM, diff og patch',
          body: [
            'React bygger en **virtual DOM** af *react elements* — almindelige JavaScript-objekter, der er billige at oprette og er immutable. Når state ændres, kører `f` og giver en ny virtual DOM. React sammenligner (diff) den med den forrige og skriver kun forskellene (patch) til browserens rigtige DOM af *html elements*.',
            'Mellem de to lag sidder React DOM’s *synthetic event system*: optimerede opdateringer går fra virtual DOM til DOM, og input og events går den anden vej. Samme React-kerne kan drive andre renderers: React DOM til browsere, React Native til iOS og Android. Bogen kalder diff-processen *reconciliation* og giver eksemplet, at ændres teksten i et `<p>`, opdateres kun teksten, ikke elementet.',
          ],
        },
        {
          term: 'JSX',
          body: [
            'JSX er en udvidelse af JavaScript, der ligner HTML og bruges i komponentens return. Browsere kan ikke læse JSX, så et build tool (Vite) oversætter det til JavaScript. Hvert tag bliver et kald `React.createElement(type, props, ...children)` — bogen kalder JSX “syntactic sugar” for netop det.',
            '`class` og `for` er reserverede ord i JavaScript, så JSX bruger `className` og `htmlFor`. Krøllede parenteser `{}` indsætter et JavaScript-udtryk, fx `{props.name}` eller en ternary som `{liked ? \'You liked this.\' : \'Like\'}`. Et `if`-statement kan ikke stå inde i JSX, fordi det ikke er et udtryk.',
            'En komponent returnerer ét rodelement. Skal flere søskende returneres uden en ekstra `<div>`, bruges et **Fragment**: `<React.Fragment>` eller den korte form `<>…</>`. Det er nødvendigt fx i en tabelrække, hvor en ekstra node ville være ugyldig. Lister laves med `map`, og hvert element får en `key`, fx `<option key={u.id}>` i [[react-fetch|UserPicker]].',
          ],
        },
        {
          term: 'Functional components og props',
          body: [
            'Enhver funktion, der tager ét objekt-argument (`props`) og returnerer et React element, er en komponent. Slides viser class components ved siden af, men skriver “Use this!” ved functional components — med hooks kan de det samme. Navnet skal starte med **stort bogstav**; med lille bogstav behandler React det som et DOM-tag.',
            'Når React møder `<Welcome name="Sara"/>`, samles JSX-attributterne i ét objekt, `props`. Props er **read-only**: en komponent må aldrig ændre sine egne props, og data flyder én vej, fra parent til child. Indlejret indhold (`<Counts><TweetsCount />…</Counts>`) når frem som `props.children`.',
            'Props destructures typisk i parameterlisten, `function MenuItem({ href, label })`, hvilket også giver default-værdier (`target="_self"`). Rest-syntaksen `{ label, href, ...rest }` samler resten op, og `{...rest}` spreder dem ud som attributter på det underliggende element.',
          ],
        },
        {
          term: 'Pure render, stateful og stateless',
          body: [
            'Render-funktionen skal være **pure**: den må ikke ændre state og ikke tale direkte med browseren. Alt det andet — `document.title`, timers, fetch — hører til i [[useeffect|useEffect]].',
            'Komponenter bør splittes op: slides deler `MonolitComment` i `Avatar`, `UserInfo` og `CompositComment`. Dan Abramovs skelnen, som slides citerer: *stateful* (container) komponenter handler om hvordan ting virker, *stateless* (presentational) komponenter om hvordan de ser ud. Tommelfingerreglen: “states change, props don’t and don’t declare a state if it’s never gonna change”.',
          ],
        },
        {
          term: 'SPA med Vite',
          body: [
            'En **Single Page Application** henter ét dokument fra serveren, skifter view uden page reload og taler typisk JSON med et REST-API (se [[web-arkitektur|websites, web apps og SPA]]). Vite scaffolder appen (`npm create vite@latest`), kører den under udvikling (`npm install`, `npm run dev`) og bygger en optimeret produktionsversion med Rollup (`npm run build`, test lokalt med `npm run preview`).',
            'Den genererede `App.jsx` bruger allerede `useState` og en funktionel opdatering: `setCount((count) => count + 1)`. Lab 16 scaffolder `tictactoe` med Vite og lægger komponenterne i hver sin fil, så `App` viser `Game`, der viser `Board`.',
          ],
        },
      ],
      viz: 'react-render',
      keyPoints: [
        'React er et UI-library; med React Router og Redux bliver det en framework-lignende stak.',
        '`UI = f(state)`: ny state giver en ny virtual DOM; React diff’er mod den forrige og patcher kun forskellene i DOM’en.',
        'JSX er syntaks for `React.createElement`; Vite oversætter det, browseren ser aldrig JSX.',
        'Komponentnavne med stort; `className` og `htmlFor` i stedet for `class` og `for`.',
        'Props flyder én vej, fra parent til child, og er read-only.',
        'Render skal være pure — side effects hører til i `useEffect`.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'Samme formular med createElement og med JSX',
          source: 'FED React Overview.pdf s. 21',
          code: `// How to represent it with native JavaScript in React:
React.createElement(
  "form",
  null,
  React.createElement(
    "label",
    { htmlFor: "email" },
    "Email:"
  ),
  React.createElement(
    "input",
    { type: "email", id: "email", className: "form-control" }
  )
);

// How to represent it with JSX:
<form>
  <label htmlFor="email">Email:</label>
  <input type="email" id="email" className="form-control" />
</form>`,
        },
        {
          lang: 'jsx',
          title: 'LikeButton: state, event og ternary i JSX',
          source: 'FED React Overview.pdf s. 22',
          code: `import { useState } from 'react';
import './App.css';

function LikeButton() {
  const [liked, setLiked] = useState(false);

  return (
    <button onClick={() => setLiked(true)}>
      {liked ? 'You liked this.' : 'Like'}
    </button>
  );
}

export default function App() {
  return (
    <div className="App">
      <h1>My first React app</h1>
      <LikeButton />
    </div>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'Props med destructuring og default-værdi',
          source: 'FED Functional components.pdf s. 4',
          code: `function Menu() {
  return (
    <ul>
      <MenuItem label="Home" href="/"/>
      <MenuItem label="About" href="/about/" />
      <MenuItem label="Blog" href="/blog" target="_blank" />
    </ul>
  );
}

function MenuItem({ label, href, target="_self" }) {
  return (
    <li>
      <a href={href} title={label} target={target}>
        {label}
      </a>
    </li>
  );
}`,
        },
      ],
      exam: [
        'React er et library til brugergrænseflader, ikke et framework. Kernen er `UI = f(state)`: jeg beskriver hvordan UI’et ser ud for en given state, og når state ændres, bygger React en ny virtual DOM, sammenligner den med den forrige og opdaterer kun forskellene i browserens DOM.',
        'JSX er en udvidelse af JavaScript, som Vite oversætter til `React.createElement`-kald. Derfor hedder `class` `className` og `for` `htmlFor` i JSX — det er reserverede ord i JavaScript.',
        'Vittighedsopgaven (vinter 2025/26) kræver eksplicit en React single page application: browseren henter ét dokument, og derefter går kun JSON frem og tilbage til json-serveren. Jeg deler appen op i én komponent pr. funktion — tilføj, browse og søg — plus små præsentationskomponenter, der kun får data som props.',
        'Jeg bruger functional components, som kurset anbefaler. En komponent er en funktion, der tager et props-objekt og returnerer JSX; props er read-only og flyder fra parent til child, og det der skal kunne ændre sig, ligger i state.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L16.1_React_Overview.md'), original: 'L16/FED React Overview.pdf', pages: 's. 2–34' },
        { path: ctx('slides/SW4FED-02_L17.1_Functional_components.md'), original: 'L17/FED Functional components.pdf', pages: 's. 2–5' },
        { path: ctx('book/React_Quickly_1ed_Ch01_Meeting_React.md'), original: 'React Quickly, 1. udg., kap. 1', pages: 'afsn. 1.1–1.5 (s. 5–21)', note: '1. udgave (2017) med class components; kursusbeskrivelsen foreskriver 2. udgave.' },
        { path: ctx('book/React_Quickly_1ed_Ch03_Introduction_to_JSX.md'), original: 'React Quickly, 1. udg., kap. 3', pages: 'afsn. 3.1–3.2 og 3.4.4 (s. 42–66)' },
        { path: ctx('labs/SW4FED-02_Lab16_Introduction_to_React.md'), original: 'Lab 16 Introduction to React.html' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 3', note: 'Opgave 2: React SPA' },
      ],
      gaps: [
        '*React Quickly* i materialet er 1. udgave (2017): class components, `this.props` og `ReactDOM.render()`. Slides bruger functional components og `createRoot` (FED React Router.pdf s. 7). Kursusbeskrivelsen foreskriver 2. udgave, som ikke ligger i materialet.',
        'Slides (s. 16) siger, at `npm run build` lægger buildet i en “build folder”. Uden for materialet: Vite skriver som standard til `dist/`; `build/` er Create React Apps mappe.',
        '`key` i lister forklares ikke i slides; L19 bruger `key={u.id}` uden kommentar, og bogen bruger array-indekset som key (kap. 1, afsn. 1.3.1). Uden for materialet: React bruger key til at genkende elementer mellem renders, og et indeks som key giver fejl, når listen ændrer rækkefølge.',
      ],
      keywords: ['React', 'JSX', 'createElement', 'virtual DOM', 'diffing', 'reconciliation', 'component', 'komponent', 'functional component', 'class component', 'props', 'props.children', 'Fragment', 'className', 'htmlFor', 'one-way data flow', 'SPA', 'Vite', 'npm create vite', 'UI = f(state)', 'destructuring', 'rest', 'container', 'presentational'],
    },

    {
      slug: 'usestate',
      title: 'useState',
      week: 'Uge 9 · L17',
      definition:
        '`useState` er det hook, der giver en function component state i React-runtimen. Det returnerer `[værdi, setter]`; kaldet til setteren gemmer den nye værdi og får React til at kalde komponenten igen (re-render).',
      concepts: [
        {
          term: 'Hooks',
          body: [
            'Hooks er funktioner, der lader function components “hooke ind i” Reacts state- og lifecycle-features uden en class. De kom i React 16.8 og virker ikke i classes. React vedligeholder et virtual DOM-træ, hvor hver komponent har en node med intern state; hooks er måden, en komponent gemmer og henter data i den node på. De oprettes og nedlægges sammen med komponenten.',
            'Kurset anbefaler named import: `import { useState } from \'react\'`. Slides lister de indbyggede hooks: basic (`useState`, `useEffect`, `useContext`) og additional (`useReducer`, `useCallback`, `useMemo`, `useRef` …).',
          ],
        },
        {
          term: 'Hvorfor en almindelig variabel ikke virker',
          body: [
            'I `NotWorkingCounter` tæller knappen `window.count++`, men skærmen står stille: React opdager ikke, at en variabel ændres. Der skal en *updater function* til, som får React til at kalde komponenten igen med den nye værdi. Det er setteren fra `useState`.',
            'Slides’ recap forklarer hvorfor: komponenter er funktioner, som React kalder, og som kører og slutter. Lokale variabler forsvinder, når funktionen slutter; nogle overlever i closures i event handlers. `useState` lader React holde værdien og give komponenten den nyeste værdi og setter ved hver render.',
          ],
        },
        {
          term: 'Funktionel opdatering',
          body: [
            'To kald `setCount(count + 1)` i samme handler giver kun +1 — slides skriver “Don’t do this!”. Begge kald ser den samme `count`, nemlig værdien fra den render, handleren blev skabt i. Afhænger den nye state af den gamle, sendes en funktion: `setCount(state => state + 1)`. React giver funktionen den seneste state, så to kald giver +2.',
          ],
        },
        {
          term: 'Objekter, flere variabler og lazy initial state',
          body: [
            'State kan være et objekt, men setteren erstatter hele værdien. Derfor kopieres de gamle felter med spread og det ændrede overskrives: `{ ...state, type: e.target.value, count: 0 }`. Ellers mister man de øvrige felter.',
            'Man kan kalde `useState` flere gange i samme komponent (`age`, `fruit`, `todos`). React kender dem kun på **rækkefølgen**, og derfor gælder Rules of Hooks: kald hooks på top level — ikke i løkker, betingelser eller indlejrede funktioner — og kun fra function components eller custom hooks. Hooks navngives `use*`.',
            'Er startværdien dyr at beregne, gives en funktion: `useState(() => untangle(tangledWeb))`. Den kører kun ved første render. Skrives `useState(untangle(tangledWeb))`, kaldes `untangle` ved hver render, selvom resultatet kun bruges første gang. Løsningsforslaget til lab 18 starter sin størrelseskategori med `useState(() => calculateSize())`.',
          ],
        },
        {
          term: 'Delt state: løft den op',
          body: [
            'Bruger flere komponenter de samme data, ligger state i deres fælles parent og sendes ned som props. I `Colors` ejer parenten `color`, og `ColorPicker`, `ColorChoiceText` og `ColorSample` får den som prop.',
            'Data flyder stadig kun én vej, men en child kan ændre parentens state ved at få setteren som prop: `ColorPicker` får `setColor` og kalder `setColor(c)` ved klik. Parentens state ændres, parenten re-renderer, og alle børn får den nye værdi. Bliver træet dybt, er [[context|Context API]] alternativet til at sende props gennem mange lag.',
          ],
        },
      ],
      viz: 'usestate-render',
      keyPoints: [
        '`const [count, setCount] = useState(0)` — første element er værdien, andet er setteren.',
        'Kun setteren udløser re-render; en almindelig variabel ændres, uden at React opdager det.',
        'Afhænger ny state af gammel: `setCount(c => c + 1)`.',
        'Objekter i state kopieres med spread: `{ ...state, type: e.target.value }`.',
        'Hooks kaldes på top level, i samme rækkefølge ved hver render.',
        'Delt state løftes op i nærmeste fælles parent; børn får værdien og setteren som props.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'En variabel React ikke ser, og en state React ser',
          source: 'FED React useState Hook.pdf s. 6',
          code: `window.count = 0;

export function NotWorkingCounter() {
  return (
    <div>
      <p>You clicked {window.count} times</p>
      <button onClick={() => window.count++}>
        Click me
      </button>
    </div>
  );}

export function SimpleCounter() {
  const [count, setCount] = useState(0);
  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>
        Click me
      </button>
    </div>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'Funktionel opdatering',
          source: 'FED React useState Hook.pdf s. 8',
          code: `function step2() {
  setCount(count + 1);
  setCount(count + 1);      // Don't do this!
}

export function BetterCounterV2() {
  const [count, setCount] = useState(0);

  function step2() {
    setCount(state => state + 1);
    setCount(state => state + 1);
  }
  // ...
}`,
        },
        {
          lang: 'jsx',
          title: 'Delt state i parent, setter sendt til child',
          source: 'FED React useState Hook.pdf s. 13 og 15',
          code: `export default function Colors() {
  const availableColors = ["skyblue", "goldenrod", "teal", "coral"];
  const [color, setColor] = useState(availableColors[0]);

  return (
    <div className="colors">
      <ColorPicker colors={availableColors} color={color} setColor={setColor} />
      <ColorChoiceText color={color} />
      <ColorSample color={color} />
    </div>
  );
}

export default function ColorPicker({ colors = [], color, setColor }) {
  // ...
  // onClick={() => setColor(c)}
}`,
        },
      ],
      exam: [
        '`useState` gemmer en værdi i React-runtimen for den konkrete komponent. Når jeg kalder setteren, ved React at state er ændret, kalder komponenten igen og opdaterer kun det, der er ændret i DOM’en.',
        'Kalder jeg `setCount(count + 1)` to gange i samme handler, bliver det kun +1, fordi begge kald ser den samme `count` fra denne render. Derfor bruger jeg den funktionelle form `setCount(c => c + 1)`, når ny state bygger på gammel.',
        'I eksaminatoropgaven fra sommer 2025 skal appen trække et tilfældigt spørgsmål og gå videre med “Næste studerende”. Både det trukne nummer og hvilken studerende der er i gang, er state, fordi skærmen skal re-rendere, når de ændres.',
        'Felterne i en formular som “book ny aftale” (sommer 2024) kan ligge i ét state-objekt. Ved hver ændring kopierer jeg objektet med spread og overskriver ét felt, så de andre felter ikke går tabt.',
        'Rules of Hooks: hooks kaldes kun på top level og kun fra komponenter eller custom hooks, fordi React genkender state-variablerne på kaldrækkefølgen.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L17.2_React_useState_Hook.md'), original: 'L17/FED React useState Hook.pdf', pages: 's. 2–18' },
        { path: ctx('slides/SW4FED-02_L16.1_React_Overview.md'), original: 'L16/FED React Overview.pdf', pages: 's. 17, 32', note: 'Genereret Vite-kode og state-sliden' },
        { path: zip('705 PM (2)'), original: 'L24/app-state-demo.zip', note: 'Hele Colors-demoen (ColorPicker.js), branch passing-shared-state' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 4', note: 'Opgave 2, krav 4.1–4.6' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 3' },
      ],
      gaps: [
        'Slides skriver “Don’t do this!” om to `setCount(count + 1)` i træk (s. 8), men forklarer ikke hvorfor; forklaringen med closures står kun indirekte i recap-sliden (s. 16). Uden for materialet: React samler (batcher) state-opdateringer fra én event handler og re-renderer én gang.',
        'Slides viser kun et udsnit af `ColorPicker` (s. 15). Hele komponenten — en `<ul>` med én `<li>` pr. farve og `onClick={() => setColor(c)}` — står i demoprojektet `L24/app-state-demo.zip`, ikke i slides.',
        '`useReducer` optræder i kodeeksemplet på s. 4 og i hook-listen (s. 18), men gennemgås ikke i L17.',
      ],
      keywords: ['useState', 'hook', 'hooks', 'state', 'setState', 'setter', 'updater function', 're-render', 'functional update', 'funktionel opdatering', 'lazy initial state', 'Rules of Hooks', 'lifting state', 'shared state', 'spread', 'closure'],
    },

    {
      slug: 'useeffect',
      title: 'useEffect og Web Storage',
      short: 'useEffect',
      week: 'Uge 9 · L18',
      definition:
        '`useEffect` kører en **side effect** — alt der rører noget uden for den virtuelle DOM — *efter* React har opdateret DOM’en. Et dependency-array styrer, hvornår den kører igen, og en returneret cleanup-funktion rydder op. `localStorage` er et typisk mål for sådanne effects.',
      concepts: [
        {
          term: 'Side effects',
          body: [
            'React regner alt, der interagerer med andet end den virtuelle DOM, for en side effect: at sætte `document.title`, timers (`setInterval`, `setTimeout`), at måle elementer i DOM’en, manuel DOM-ændring, logging, local storage, fetch og at abonnere på services. Render skal være pure ([[react-jsx|React og JSX]]), så disse ting lægges i `useEffect`.',
            '`useEffect` samler det, class components havde i tre lifecycle-metoder — `componentDidMount`, `componentDidUpdate` og `componentWillUnmount` — i ét API. React kører effect-funktionen efter ændringerne er skrevet til DOM’en, og efter browseren har tegnet siden.',
          ],
        },
        {
          term: 'Dependency-arrayet',
          body: [
            'Andet argument er et array af dependencies. **Intet array**: effecten kører efter hver render (default er, at alt er en dependency). **Tomt array `[]`**: kun første gang, ved mount. **`[user]`**: igen, når blot én af værdierne er ændret siden sidste render.',
            '`UserStorage` viser to former side om side: én effect med `[]` læser `user` fra `localStorage` ved mount, en anden med `[user]` skriver den tilbage, hver gang brugeren vælger en ny. React kører effects i den rækkefølge, de står, og slides anbefaler flere effects til at adskille concerns.',
          ],
        },
        {
          term: 'Cleanup og livscyklussen',
          body: [
            'Abonnerer en effect på noget, skal den også afmelde sig, ellers lækker hukommelsen. Returnerer effecten en funktion, kører React den, når der skal ryddes op: før effecten kører igen ved en re-render, og når komponenten forsvinder.',
            'Slides’ diagram “React Hooks Lifecycle” (s. 9) har tre faser. *Mount*: initialisér state → render → React opdaterer DOM → browseren viser DOM → kør side effects. *Update* (setState kaldt): render → opdatér DOM → vis → ryd gamle side effects op → kør side effects. *Unmount*: ryd op.',
            '`Timer` uden dependency-array opretter og rydder et interval ved hver render; samme kode med `[]` opretter intervallet én gang ved mount og fjerner det ved unmount.',
          ],
        },
        {
          term: 'Lab 18: to effects med hver sin opgave',
          body: [
            'Lab 18 skal sætte fanens titel til “Small”, “Medium” eller “Large” efter vinduets bredde, med breakpoints 767 og 1199. Løsningsforslaget bruger to effects: én med `[]`, der tilføjer en `resize`-listener og returnerer `removeEventListener`, og én med `[windowSize]`, der sætter `document.title`. Listeneren kalder kun setteren; titlen følger af state.',
          ],
        },
        {
          term: 'useEffect og useLayoutEffect',
          body: [
            'Effects fra `useEffect` blokerer ikke browseren i at opdatere skærmen, så appen føles mere responsiv. Skal noget ske synkront, findes `useLayoutEffect` med samme API; den kører, efter React har opdateret DOM’en, men før browseren tegner.',
          ],
        },
        {
          term: 'Cookies og Web Storage',
          body: [
            'HTTP er stateless, så tilstand mellem requests gemmes på klienten. **Cookies** sendes med hver request, er i de fleste browsere begrænset til 4096 bytes og et begrænset antal pr. domæne, og brugeren kan slette dem. JavaScript når dem via `document.cookie`, som returnerer alle cookies som én semikolonsepareret streng. ePrivacy-direktivets artikel 5(3) kræver samtykke, undtagen for fx session-, login- og sikkerhedscookies.',
            '**Web Storage** giver 5–10 MB pr. origin og sendes ikke i HTTP-headeren. `localStorage` er permanent (til brugeren sletter den) og hører til origin — protokol, værtsnavn og port (se [[bad/rest|same-origin]]). `sessionStorage` lever kun så længe vinduet. Begge gemmer kun strenge, så objekter serialiseres med `JSON.stringify` og læses med `JSON.parse`. Slides nævner også Web SQL Database og IndexedDB.',
          ],
        },
      ],
      viz: 'useeffect-timeline',
      keyPoints: [
        'Side effect = alt uden for den virtuelle DOM: `document.title`, timers, fetch, localStorage, event listeners.',
        'Intet array: efter hver render. `[]`: kun ved mount. `[x]`: når `x` ændres.',
        'Returnér en cleanup-funktion for alt, der abonneres på: `clearInterval`, `removeEventListener`.',
        'Før en effect kører igen, kører den forriges cleanup; ved unmount kører cleanup til sidst.',
        '`localStorage` gemmer kun strenge pr. origin; brug `JSON.stringify` og `JSON.parse` til objekter.',
        'Cookies sendes med hver request og er begrænset til ca. 4 KB; Web Storage har 5–10 MB og sendes ikke med.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'Interval med cleanup, kun ved mount',
          source: 'FED React side effects.pdf s. 8',
          code: `import React, { useState, useEffect } from "react";

export default function Timer(props) {
  const [time, setTime] = useState(Date());

  useEffect(() => {
    console.log("New Effect");
    const intervalID = setInterval(() => {
      const newTime = Date();
      setTime(newTime);
    }, 1000);
    return () => clearInterval(intervalID);
  }, []);

  return (
    <div>
      <div> Timer {props.name} </div>
      <div> It is {time} </div>
    </div>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'To effects: læs ved mount, skriv ved ændring',
          source: 'FED React side effects.pdf s. 7',
          code: `export default function UserStorage() {
  const [user, setUser] = useState("Sanjiv");

  useEffect(() => {
    const storedUser = window.localStorage.getItem("user");
    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("user", user);
  }, [user]);

  return (
    <select value={user} onChange={e => setUser(e.target.value)}>
      <option>Jason</option>
      <option>Akiko</option>
      <option>Clarisse</option>
      <option>Sanjiv</option>
    </select>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'Løsningsforslag til lab 18 (uddrag)',
          source: 'Sol18-useeffect-vite.zip, src/App.jsx',
          code: `const [windowSize, setWindowSize] = useState(() => calculateSize());

useEffect(() => {
  console.log('attaching event listener');
  function reportWindowSize(){
    let newWindowSize = calculateSize();
    setWindowSize(newWindowSize);
  }
  window.addEventListener('resize', reportWindowSize);
  return () => window.removeEventListener('resize', reportWindowSize);
}, []); //only run this effect when the components is mounted (after )

// ...

useEffect(() => {
  document.title = windowSize;
}, [windowSize]); //Run this effect when windowSize gets a new value`,
        },
      ],
      exam: [
        'En side effect er alt, der rører noget uden for Reacts virtuelle DOM. Render skal være pure, så fetch, timers og `document.title` lægger jeg i `useEffect`, som kører, efter DOM’en er opdateret.',
        'Dependency-arrayet bestemmer hvornår: uden array kører effecten efter hver render, med et tomt array kun ved mount, og med fx `[search]` hver gang søgningen ændres.',
        'Eksaminatoropgaven (sommer 2025) kræver en timer, der tæller ned fra eksaminationstiden. Jeg starter `setInterval` i en useEffect og returnerer `() => clearInterval(id)`, så intervallet stopper, når eksaminationen slutter eller komponenten forsvinder — ellers tikker det videre i baggrunden.',
        'I login-opgaven fra vinter 2024/25 validerer frontenden selv password. Den indloggede bruger kan jeg gemme i `localStorage` med `JSON.stringify`, som L19 gør med et JWT, så man stadig er logget ind efter reload. `localStorage` hører til origin og sendes ikke med requests, modsat cookies.',
        'Cleanup kører, før effecten kører igen, og når komponenten unmountes. Det er det, lab 18 øver: `resize`-listeneren tilføjes ved mount og fjernes igen i cleanup.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L18.1_React_side_effects.md'), original: 'L18/FED React side effects.pdf', pages: 's. 2–10', note: 'S. 9 (livscyklus-diagrammet) findes kun som billede' },
        { path: ctx('slides/SW4FED-02_L18.3_WebStorage_og_Cookies.md'), original: 'L18/FED WebStorageAndCookies.pdf', pages: 's. 2–12' },
        { path: ctx('labs/SW4FED-02_Lab18_useEffect.md'), original: 'L18/FED Lab18 - useEffect.pdf', pages: 's. 1' },
        { path: zip('704 PM (2)'), original: 'L18/Sol18-useeffect-vite.zip', note: 'Løsningsforslag til lab 18, src/App.jsx' },
        { path: ctx('slides/SW4FED-02_L19.2_Fetch.md'), original: 'L19/FED Fetch.pdf', pages: 's. 16', note: 'JWT gemt i localStorage' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 4', note: 'Krav 4.2: nedtællingstimer' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 4', note: 'Opret bruger og login' },
      ],
      gaps: [
        'Uden for materialet: med `<StrictMode>`, som `main.jsx` bruger i både Vite-skabelonen og løsningsforslaget til lab 18, kører React i udviklingstilstand effect → cleanup → effect ved mount for at afsløre manglende cleanup. “attaching event listener” logges derfor to gange i dev.',
        'Slides nævner Web SQL Database som én af tre client-side storage-teknologier (s. 10). Uden for materialet: Web SQL er udgået og fjernet fra browserne; IndexedDB er afløseren.',
        'Cookie-eksemplet med `path` (s. 7) har udløbsdatoen 18. dec. 2013, altså i fortiden. Uden for materialet: en udløbsdato i fortiden sletter cookien. Slides kommenterer det ikke.',
        'Slides omtaler `componentDidMount` m.fl. uden at vise class-versionen; den står kun i bogen (1. udg.), og kapitlet om lifecycle-metoder er ikke konverteret.',
      ],
      keywords: ['useEffect', 'side effect', 'dependency array', 'dependencies', 'cleanup', 'mount', 'unmount', 'lifecycle', 'componentDidMount', 'useLayoutEffect', 'setInterval', 'clearInterval', 'addEventListener', 'removeEventListener', 'document.title', 'localStorage', 'sessionStorage', 'Web Storage', 'cookies', 'document.cookie', 'JSON.stringify', 'JSON.parse', 'ePrivacy', 'StrictMode'],
    },

    {
      slug: 'react-fetch',
      title: 'Datahentning i React mod json-server',
      short: 'Datahentning og json-server',
      week: 'Uge 10 · L19 (+ lab 22)',
      definition:
        'I React hentes data i en `useEffect`: komponenten renderer først uden data, effecten kalder `fetch`, og når svaret er der, lægges det i state, som udløser en ny render. Kursets og eksamens backend er en lokal **json-server**, der gør en `db.json`-fil til et REST-API.',
      concepts: [
        {
          term: 'json-server',
          body: [
            'json-server installeres globalt med `npm install -g json-server`. Datafilen lægges i projektets rodmappe og skal være gyldig JSON. Serveren startes fra rodmappen med `json-server --watch db.json --port 4001 --delay 2000`: porten vælger man selv, og `--delay` forsinker svaret, så man kan nå at se sin spinner.',
            'Hver samling på øverste niveau i `db.json` bliver et endpoint. Bookable-demoen har `users`, `bookables` og `bookings`, og komponenterne henter fra `http://localhost:4001/users` og `http://localhost:4001/bookables`. json-server og Vites dev-server kører i hver sin terminal, og porten i fetch-URL’erne skal passe med serverens — ellers fejler kaldene. REST-principperne bag står i [[bad/rest|REST og CORS]].',
          ],
        },
        {
          term: 'Første render har ingen data',
          body: [
            'React kalder effects efter rendering, så data findes ikke ved første render. Slides giver to strategier: start med en tom liste, eller start med `null` og returnér en `Spinner`, indtil data er kommet.',
            'Det tomme dependency-array er afgørende. Uden det udløser `setUsers` en ny render, der kører effecten igen, der henter igen — slides skriver “To avoid an infinite loop!”. Lab 19 advarer om det samme: laver en studerende en uendelig løkke mod OpenWeatherMap, får underviseren en advarselsmail, og API-nøglen holder op med at virke.',
          ],
        },
        {
          term: 'async/await i en effect',
          body: [
            'Effect-callbacks er synkrone, “to prevent race conditions”. Vil man bruge `await`, lægger man en `async` funktion *inde i* effecten og kalder den derfra: `async function getUsers() { … } getUsers();`. Promises, `then` og `await` står i [[promises-fetch|Promises, fetch og JSON]].',
          ],
        },
        {
          term: 'Loading og fejl',
          body: [
            'En hjælpefunktion `getData(url)` kalder `fetch`, tjekker `resp.ok` og kaster en `Error`, hvis svaret ikke er ok; ellers returnerer den `resp.json()`. Komponentens state får to felter mere, `isLoading` og `error`: effecten sætter `isLoading: true`, `.then` sætter data og `isLoading: false`, og `.catch` sætter `error`. Render viser spinner, fejlbesked eller data efter de felter.',
            'Slides viser alternativer: `axios` i stedet for `fetch`, og biblioteker med cache og indbygget `data`/`error`/`isLoading` — SWR (*stale-while-revalidate*) og React Query. De nævner også, at React Router har *loaders*, og at Suspense skal overtage datahentning.',
          ],
        },
        {
          term: 'Søgning: effecten afhænger af søgeværdien',
          body: [
            'Står `query` i dependency-arrayet, kører effecten igen, hver gang query ændres — med et inputfelt vil det sige ved hvert tastetryk. Skal søgningen først ske ved klik, bruges to state-variabler: `query` følger inputfeltet, `search` sættes først ved klik (`setSearch(query)`), og kun `search` står i arrayet. URL’en bygges med søgeværdien, fx `?query=${search}`.',
            'Lab 19 øver præcis de to varianter: vejret for en by skrevet i et inputfelt (delopgave 1) og for postnummer og landekode ved klik på en knap (delopgave 2).',
          ],
        },
        {
          term: 'Skrive data tilbage: POST og PUT',
          body: [
            'Lab 22 bygger en karakterapp mod json-server: en formular, der sender student no., navn og karakter til serveren ved Enter og nulstiller felterne, en pagineret liste og en side, hvor man søger en studerende og retter karakteren. Oprettelse sker med `fetch(url, { method: \'POST\', body: JSON.stringify(data), headers: { \'Content-Type\': \'application/json\' } })`, og samme kald med `\'PUT\'` retter (L19 Fetch s. 10). Formularerne står i [[react-forms|formularer i React]].',
          ],
        },
      ],
      viz: 'react-fetch',
      keyPoints: [
        'Data er der ikke ved første render: start med `null` eller `[]`, og vis en spinner.',
        'Glem ikke dependency-arrayet — `setState` i en effect uden array giver en uendelig løkke af requests.',
        'Effect-callbacken er synkron; læg en `async` funktion inde i den, og kald den.',
        'Tjek `resp.ok`, og hold `isLoading` og `error` i state.',
        'Søgning: læg søgeværdien i dependency-arrayet, og byg URL’en med den.',
        'json-server: hver samling i `db.json` bliver et REST-endpoint på den port, du vælger.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'UserPicker: fetch i useEffect, spinner indtil data er der',
          source: 'FED React fetching data.pdf s. 4',
          code: `import { useState, useEffect } from "react";
import Spinner from "./ui/Spinner";

export function UserPicker() {
  const [users, setUsers] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4001/users")
      .then(resp => resp.json())
      .then(data => setUsers(data));
  }, []);

  if (users === null) {
    return <Spinner />
  }

  return (
    <select>
      {users.map(u => (
        <option key={u.id}>{u.name}</option>
      ))}
    </select>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'async/await inde i effecten',
          source: 'FED React fetching data.pdf s. 5',
          code: `useEffect(() => {
  async function getUsers() {
    const resp = await fetch(url);
    const data = await (resp.json());
    setUsers(data);
  }
  getUsers();
}, []);`,
        },
        {
          lang: 'jsx',
          title: 'Søgning, der først sker ved klik',
          source: 'FED React fetching data.pdf s. 10',
          code: `const [data, setData] = useState({ hits: [] });
const [query, setQuery] = useState('react');
const [search, setSearch] = useState('react');

useEffect(() => {
  const fetchData = async () => {
    const result = await axios(
       \`http://hn.algolia.com/api/v1/search?query=\${search}\`,
    );

    setData(result.data);
  };
  fetchData();
}, [search]);

return (
  <Fragment>
    <input
       type="text"
       value={query}
       onChange={event => setQuery(event.target.value)}
    />
    <button type="button" onClick={() => setSearch(query)}>
       Search
    </button>
    {/* ... */}
  </Fragment>
);`,
        },
      ],
      exam: [
        'Alle fire eksamenssæt bruger en lokal json-server “som vist i lektion 19 og lab 22”. Jeg starter den med `json-server --watch db.json --port 4001`, og hver samling i db.json, fx `appointments` i værkstedsopgaven, bliver et REST-endpoint.',
        'Jeg henter data i en useEffect med tomt dependency-array. Første render har ingen data, så jeg viser en spinner; når fetch er færdig, sætter jeg state, og React re-renderer med listen. Uden arrayet ville `setState` udløse en ny render, der hentede igen, i en uendelig løkke.',
        'I værkstedsopgaven fra sommer 2024 er hintet en søgning med query-streng: `GET /appointments?licensePlate=AL12345`. Jeg holder inputfeltet i én state-variabel og den aktive søgning i en anden, som først sættes ved klik — den står i dependency-arrayet, præcis som søgeknappen i L19.',
        'Callbacken til useEffect må ikke selv være async, så jeg definerer en async funktion inde i effecten og kalder den. Fejl fanger jeg ved at tjekke `resp.ok` og vise en fejlbesked, jeg har i state sammen med `isLoading`.',
        'Alt indtastet skal persisteres via json-servers REST-API. Nye poster sender jeg med POST og rettelser med PUT, med `JSON.stringify` i body og `Content-Type: application/json`, som i lab 22.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L19.3_React_fetching_data.md'), original: 'L19/FED React fetching data.pdf', pages: 's. 2–13' },
        { path: ctx('slides/SW4FED-02_L19.2_Fetch.md'), original: 'L19/FED Fetch.pdf', pages: 's. 6–10', note: 'resp.ok, POST og PUT' },
        { path: ctx('slides/SW4FED-02_L24.2_Koersel_af_demoer.md'), original: 'L24/How to run demos in L24 and find other demos.pdf', pages: 's. 2–6', note: 'json-server og frontend i to terminaler, port 4001' },
        { path: zip('705 PM (2)'), original: 'L24/app-state-demo.zip', note: 'db.json (users, bookables, bookings) og UserPicker.js, branch usecallback' },
        { path: ctx('labs/SW4FED-02_Lab19_Fetching_data_fra_React.md'), original: 'L19/FED Lab19 Fetching data from React.pdf', pages: 's. 1–2' },
        { path: ctx('labs/SW4FED-02_Lab22_Form_og_Post_data.md'), original: 'L22/Lab 22 - Form and Post data.pdf', pages: 's. 1' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 3', note: 'Query-streng-hint' },
        { path: ctx('kode/SW4FED-02_Eksamen_2024_Sommer_bilag1.md'), original: 'L28/SW4FED-02 2024 Sommer bilag1.txt', note: 'db.json med appointments' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 4–6' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 4–6' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 3' },
      ],
      gaps: [
        'Materialet viser ikke json-servers query-syntaks. Det eneste eksempel er eksamenshintet `GET /appointments?licensePlate=AL12345` (sommer 2024, s. 3). Filtrering, paginering (lab 22 og vittighedsopgaven) og søgning på emneord står kun i json-servers README, som lab 22 og eksamenssættene linker til.',
        'Uden for materialet: nyere json-server (v1) giver nye poster tekst-id’er som `"2c6d"`, som ses i vintersættets db.json (s. 5–6). Slides bruger den ældre kommando med `--watch` og tal-id’er.',
        'Slides begrunder den synkrone effect-callback med race conditions (s. 5), men viser ikke, hvordan et gammelt svar undgås, når query ændres ved hvert tastetryk (s. 9). Uden for materialet: et `ignore`-flag eller en `AbortController` i effectens cleanup.',
        'Uden for materialet: en async funktion returnerer altid en Promise, mens React forventer, at en effect returnerer ingenting eller en cleanup-funktion. Det er den tekniske grund til ikke at skrive `useEffect(async () => …)`.',
        'S. 7 spreder `state` fra første render ind i hvert `setState` i `.then` og `.catch`. Det virker kun, fordi effecten har `[]`; L17 useState s. 8 anbefaler den funktionelle form, når ny state bygger på gammel.',
      ],
      keywords: ['fetch', 'useEffect', 'json-server', 'db.json', 'REST', 'API', 'isLoading', 'error', 'spinner', 'loading', 'axios', 'async', 'await', 'resp.ok', 'infinite loop', 'uendelig løkke', 'query string', 'query-streng', 'søgning', 'POST', 'PUT', 'SWR', 'React Query', 'Suspense', 'UserPicker'],
    },

    {
      slug: 'react-router',
      title: 'Client-side routing med React Router',
      short: 'React Router',
      week: 'Uge 9 · L17',
      definition:
        'React Router mapper URL’en til komponenter i browseren. Et klik på et `<Link>` ændrer URL’en uden at hente en ny side fra serveren; `<Routes>` finder den `<Route>`, hvis `path` matcher, og renderer dens `element`.',
      concepts: [
        {
          term: 'Hvorfor routing i en SPA',
          body: [
            'En SPA henter kun ét dokument fra serveren ([[react-jsx|React og JSX]]). Uden routing står URL’en stille, mens brugeren skifter view. Bogen (1. udg.) lister følgerne: en reload fører tilbage til startsiden, Back-knappen kan føre helt ud af sitet, man kan ikke dele et link til en bestemt side, og søgemaskiner har ingen URL’er at indeksere. Client-side routing giver hver view sin URL uden at gå til serveren.',
            'Routing er ikke en del af React; `react-router` er de facto-standarden. Den har tre modes — Declarative, Data og Framework — hvor hver tilføjer features på bekostning af arkitektonisk kontrol. SW4FED anbefaler **Declarative**: scaffold med `npx create-vite@latest` og `npm i react-router`. v7 kræver node 20 og react/react-dom 18.',
          ],
        },
        {
          term: 'BrowserRouter, Routes og Route',
          body: [
            'Komponenterne falder i fire grupper: routers (`<BrowserRouter>`, `<HashRouter>` …), route matchers (`<Routes>`, `<Route>`), navigation (`<Link>`, `<NavLink>`, `<Navigate>`) og `<Outlet>` til child routes — plus en række hooks. `<BrowserRouter>` renderes om hele appen i `main.jsx`.',
            'Når `<Routes>` renderes, gennemsøger den sine `<Route>`-children og renderer den, hvis `path` matcher den aktuelle URL; alle andre ignoreres, og matcher ingen, renderes intet. `path="*"` matcher kun, når ingen anden route gør, og bruges til en “no match”-side. `<Navigate to="/home" replace={true} />` skifter location, når den renderes — den er en komponent-wrapper om `useNavigate`.',
          ],
        },
        {
          term: 'Link og NavLink',
          body: [
            '`<Link to="/home">` renderer et `<a>` i HTML-dokumentet, men klikket håndteres af routeren, så siden ikke hentes igen. `<NavLink>` er en særlig `<Link>`, der styler sig selv som *active*, når dens `to` matcher den aktuelle location; slides styler den med en `.active`-regel i CSS.',
            'Lab 17 udvider tic-tac-toe-appen med en navbar: Home med en velkomst, en side med spillet og en scoreboard-side, `<NavLink>` med styling af den aktive route og en “Page not found”-side. Løsningsforslaget har routes til `/`, `/game`, `/scoreboard` og `*`.',
          ],
        },
        {
          term: 'Child routes og Outlet',
          body: [
            'Fælles layout flyttes ud i en `Layout`-komponent med overskrift, `Navbar`, `<Outlet />` og footer. Siderne lægges som child routes inde i `<Route path="/" element={<Layout />}>`, og `<Outlet />` er pladsholderen, hvor den matchende child renderes. `<Route index element={<Home />} />` er den child, der vises på selve `/`.',
            'Bogen (1. udg., React Router v2) gør det samme med `this.props.children` i layoutkomponenten og `component={About}` i stedet for `element={<About />}`.',
          ],
        },
        {
          term: 'URL-parametre og programmatisk navigation',
          body: [
            'En parameter er en pladsholder i path, der starter med kolon: `<Route path=":id" element={<StreamingChild />} />` under `streaming`. Komponenten læser den med `useParams`: `let { id } = useParams();`. Links til `netflix` og `HBO` giver `id` = `"netflix"` og `"HBO"`.',
            'Skal brugeren sendes videre fra kode — fx efter et form submit — bruges `useNavigate`: `const navigate = useNavigate();` og i submit-handleren `event.preventDefault(); navigate("/");`. Bogen (1. udg.) bruger `props.params.id` og `router.push(\'about\')`.',
          ],
        },
        {
          term: 'Hosting og lazy loading',
          body: [
            'Med `BrowserRouter` er URL’erne rigtige stier. Slides: webserveren skal servere **samme side** på alle URL’er, som React Router håndterer. Bogen forklarer hvorfor: en reload på `/about` rammer serveren, som ellers svarer 404, og viser en Express-server med `app.get(\'*\', …)`, der altid sender `index.html`. Bogen foretrækker derfor hash history (`/#/about`), der ikke kræver serveropsætning; slides bruger `BrowserRouter`.',
            'Normalt kommer appen som ét bundle. Med `React.lazy(() => import(\'./Fea1\'))` splittes det, og en del hentes først, når brugeren besøger den (*code splitting*), hvilket gør første rendering hurtigere. `<Suspense fallback={…}>` viser en fallback, mens delen hentes. Named exports skal mappes om til `default`.',
          ],
        },
      ],
      viz: 'client-routing',
      keyPoints: [
        '`<BrowserRouter>` om appen, `<Routes>` med `<Route path element>` inde i den.',
        '`<Link>` og `<NavLink>` skifter URL uden page reload; `NavLink` får klassen `active`.',
        '`path="*"` fanger ukendte URL’er — en “Page not found”.',
        'En Layout med `<Outlet />` giver fælles navbar og footer til child routes.',
        '`:id` i path + `useParams()` giver parameteren; `useNavigate()` navigerer fra kode.',
        'Hosting: serveren skal returnere samme `index.html` for alle client-side URL’er.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'main.jsx: BrowserRouter om appen',
          source: 'FED React Router.pdf s. 7',
          code: `import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)`,
        },
        {
          lang: 'jsx',
          title: 'Child routes med fælles Layout og Outlet',
          source: 'FED React Router.pdf s. 12',
          code: `function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Layout />} >
          <Route index element={<Home />} />
          <Route path="/fea1" element={<Fea1 />} />
          <Route path="/fea2" element={<Fea2 />} />
          <Route path="*" element={<Unknown />} />
        </Route>
      </Routes>
    </div>
  )
}

export function Layout() {
  return (
    <>
      <h1>Using child routes demo</h1>
      <Navbar />
      <Outlet />
      <footer>
        <p>Hello world of SPA routing</p>
      </footer>
    </>
  )
}`,
        },
        {
          lang: 'jsx',
          title: 'URL-parameter med useParams',
          source: 'FED React Router.pdf s. 13',
          code: `<Route path="streaming" element={<Streaming />} >
  <Route path=":id" element={<StreamingChild />} />
</Route>

export function StreamingChild() {
  // We can use the \`useParams\` hook here to access
  // the dynamic pieces of the URL.
  let { id } = useParams();
  return (
    <div>
      <h3>ID: {id}</h3>
    </div>
  );
}`,
        },
      ],
      exam: [
        'Client-side routing betyder, at URL’en skifter, uden at browseren henter en ny side. Et `<Link>` bliver til et `<a>`, men React Router opfanger klikket, opdaterer URL’en, og `<Routes>` renderer den route, hvis path matcher.',
        'Værkstedsopgaven fra sommer 2024 kræver fire sider: home, book ny aftale, ret aftale og vis aftaler. Det bliver fire routes under en Layout-route med navbar og `<Outlet />`, plus en `*`-route til ukendte URL’er — som i lab 17.',
        'Skal en bestemt post vises eller rettes, kan den have sin egen route med `:id`, som komponenten læser med `useParams`. Efter en gemt formular sender jeg brugeren videre med `useNavigate`, som slides gør efter et form submit.',
        'Jeg bruger `BrowserRouter`, så URL’erne er rigtige stier uden `#`. Prisen er, at serveren skal svare med den samme side på alle stier, ellers giver en reload på en underside 404. Bogens 1. udgave foretrækker hash history af netop den grund.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L17.3_React_Router.md'), original: 'L17/FED React Router.pdf', pages: 's. 1–17' },
        { path: ctx('labs/SW4FED-02_Lab17_React_Router_client_side_routing.md'), original: 'Lab 17 (Brightspace-note “Untitled - Copy.html”)' },
        { path: zip('704 PM (1)'), original: 'L17/SOL17 usestate-and-routing.zip', note: 'Løsningsforslag til lab 17: App.js og Navbar.js' },
        { path: ctx('book/React_Quickly_1ed_Ch13_React_routing.md'), original: 'React Quickly, 1. udg., kap. 13', pages: 'indledning og afsn. 13.2–13.3 (s. 246–268)', note: 'React Router v2; kursusbeskrivelsen foreskriver 2. udgave.' },
        { path: ctx('slides/SW4FED-02_L16.1_React_Overview.md'), original: 'L16/FED React Overview.pdf', pages: 's. 11', note: 'SPA' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 3', note: '“App’en skal have 4 sider”' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 3' },
      ],
      gaps: [
        'Slides importerer fra `react-router` (s. 6–7, 11, 16), men `useNavigate` fra `react-router-dom` (s. 14), og løsningsforslaget til lab 17 (2024, Create React App med `react-router-dom` 6.22) bruger `BrowserRouter as Router` inde i `App`. Uden for materialet: i v7 er `react-router-dom` en re-eksport af `react-router`.',
        'Materialet dækker ikke query-strenge i routeren (`useSearchParams`), selvom eksamenssættene beder om søgning. Søgeværdien kan ligge i state og sendes til json-server ([[react-fetch|datahentning]]); at lægge den i URL’en er uden for materialet.',
        'Bogen (1. udg.) beskriver React Router v2 med `component`, `props.params`, `router.push` og `hashHistory`; slides bruger v7 med `element`, `useParams`, `useNavigate` og `BrowserRouter`. Slides er autoritative.',
        'Slides (s. 7) siger, at serveren skal servere samme side på alle URL’er, men ikke hvordan; kun bogen viser det (Express, afsn. 13.2.3). Uden for materialet: Vites dev-server gør det af sig selv, så problemet viser sig først ved deployment.',
      ],
      keywords: ['React Router', 'react-router', 'react-router-dom', 'client-side routing', 'routing', 'BrowserRouter', 'Routes', 'Route', 'Link', 'NavLink', 'active', 'Navigate', 'useNavigate', 'useParams', 'Outlet', 'child routes', 'nested routes', 'index route', 'no match', '404', 'URL parameter', 'lazy', 'Suspense', 'code splitting', 'hash history'],
    },
  ],
}
