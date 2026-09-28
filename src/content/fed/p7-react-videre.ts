import type { Part } from '../types'
import { ctx } from './paths'

/** React Quickly findes kun som PDF (1. udgave); kap. 7, 14 og 16 er ikke konverteret til markdown. */
const RQ_PDF = 'fed/kilde/react quickly.pdf'

export const reactVidere: Part = {
  id: 'react-videre',
  title: 'Web · React: videre',
  topics: [
    {
      slug: 'useref',
      title: 'useRef',
      week: 'Uge 11 · L21 (fil L20)',
      definition:
        '`useRef` returnerer et objekt med en `current`-property, og React giver det **samme** objekt tilbage ved hver render. En ændring af `ref.current` overlever mellem renders, men udløser **ikke** et re-render — modsat en state-updater. Samme hook bruges til at holde en reference til et DOM-element.',
      concepts: [
        {
          term: 'useState og useRef side om side',
          body: [
            'Slidene sætter to tællere op mod hinanden: `setCount(c => c + 1)` og `ref.current++`. Med `useState` udløser et kald til updater-funktionen normalt et re-render. Med `useRef` kan værdien opdateres “without a corresponding change to the UI”. Begge værdier huskes mellem kald til komponentfunktionen; forskellen er, om React får besked.',
            'Derfor bruges en ref til værdier, skærmen ikke skal vise med det samme. Lab 20 bygger netop det: en state-tæller, der viser en besked i to sekunder, en ref-tæller og to ref-baserede render-tællere — én talt op direkte i komponentkroppen og én talt op i en `useEffect`.',
          ],
        },
        {
          term: 'Ét ref-objekt pr. kald',
          body: [
            '`useRef(1)` returnerer et objekt med en `current`-property. Hver gang React kører komponentkoden, returnerer hvert kald til `useRef` det samme ref-objekt for netop det kald. Man persisterer en værdi ved at tildele den til `current` — fx `ref.current++`.',
          ],
        },
        {
          term: 'Timer-handle i en ref',
          body: [
            'Slidenes klassiske eksempel: `setInterval` returnerer et handle, som skal gemmes et sted, hvor det overlever de re-renders, tælleren selv udløser hvert sekund — uden at gemningen udløser endnu et. Handlet lægges i `timerRef.current` inde i en `useEffect` med tomt dependency-array, så intervallet oprettes én gang.',
            '`return stopCounter;` gør `stopCounter` til effektens cleanup-funktion, og samme funktion er `onClick` på knappen “Stop counter”. Begge veje ender i `clearInterval(timerRef.current)`. Se [[useeffect|useEffect]] for cleanup.',
          ],
        },
        {
          term: 'Referencer til DOM-elementer',
          body: [
            'Sættes `ref={nextButtonRef}` på et element i JSX’en, peger `nextButtonRef.current` på DOM-elementet, og slidene kalder `nextButtonRef.current.focus()` for at flytte fokus til knappen. På samme måde er `textboxRef.current.value` teksten i et input-felt.',
            'I TypeScript angiver typeparameteren, hvad ref’en peger på: `useRef<HTMLVideoElement>(null)`. Events-lektionen bruger det til at styre en `<video>` med `video.current?.play()` og `video.current?.pause()`, og til at se, hvilken af to knapper der blev klikket (`evt.target === increment.current`).',
          ],
        },
        {
          term: 'defaultValue og uncontrolled input',
          body: [
            'Input-feltet i datoeksemplet har `defaultValue="2022-06-24"` og ingen `value`. Feltet holder selv sin værdi, og den læses først, når `goToDate` kører. Det er et *uncontrolled* input — modstykket til controlled inputs i [[react-forms|formularer i React]].',
            '*React Quickly* (1. udg., afsn. 7.2.4) forklarer forskellen: et hardkodet `value` gør feltet read-only, mens `defaultValue` sætter startværdien og lader brugeren redigere. Bogen bruger class components og `this.refs`, ikke `useRef`.',
          ],
        },
      ],
      viz: 'useref',
      keyPoints: [
        '`useRef(start)` giver `{ current: start }` — samme objekt ved hver render.',
        'Skriv til `ref.current` → værdien huskes, men intet re-render. `setState` → re-render.',
        'Brug en ref til værdier, UI’et ikke viser: timer-handles og render-tællere (lab 20).',
        '`ref={minRef}` i JSX → `minRef.current` er DOM-elementet (`focus()`, `value`, `play()`).',
        'Interval i `useEffect` med `[]`; `clearInterval(timerRef.current)` i cleanup og på stop-knappen.',
        'Input med `defaultValue` og en ref = uncontrolled; værdien læses først, når den skal bruges.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'Timer-handle i en ref, stoppet fra knap og cleanup',
          source: 'FED React useRef Hook.pdf s. 4',
          code: `const [count, setCount] = useState(0);
const incCount = () => setCount(c => c + 1);
const timerRef = useRef(null);

useEffect(() => {
    timerRef.current = setInterval(() => {
        incCount()
    }, 1000);
    return stopCounter;
}, []);

function stopCounter() {
    clearInterval(timerRef.current);
}

// ...
<button
     className="btn"
     onClick={stopCounter}
>
     Stop counter
</button>`,
        },
        {
          lang: 'tsx',
          title: 'Ref til et formularfelt',
          source: 'FED React useRef Hook.pdf s. 6',
          code: `const textboxRef = useRef<HTMLInputElement>(null);

function goToDate () {
  dispatch({
    type: "SET_DATE",
    payload: textboxRef.current.value
  });
}

// ...
<input
   type="text"
   ref={textboxRef}
   placeholder="e.g. 2020-09-02"
   defaultValue="2022-06-24"
 />`,
        },
        {
          lang: 'tsx',
          title: 'Ref til et video-element med optional chaining',
          source: 'Handling Events in React.pdf s. 6',
          code: `import { useState, useRef } from "react";

export function ShowVideo() {
  const VIDEO_SRC = "//images-assets.nasa.gov/video/One Small Step/One Small Step~orig.mp4";
  const [isPlaying, setPlaying] = useState(false);
  const onPlay = () => setPlaying(true);
  const onPause = () => setPlaying(false);
  const onClickPlay = () => video.current?.play();
  const onClickPause = () => video.current?.pause();
  const video = useRef<HTMLVideoElement>(null);

  return (
    <section>
      <video
        ref={video}
        src={VIDEO_SRC}
        controls
        width="480"
        onPlay={onPlay}
        onPause={onPause}
      />
      <button onClick={isPlaying ? onClickPause : onClickPlay}>
        {isPlaying ? "Pause" : "Play"}
      </button>
    </section>
  );
}`,
        },
      ],
      exam: [
        'useState og useRef husker begge en værdi mellem renders. Forskellen er, at setState beder React om at rendere igen, mens en ændring af ref.current ikke gør. Derfor bruger jeg en ref til ting, skærmen ikke skal vise.',
        'I eksaminator-appen fra sommersættet 2025 skal “Start eksamination” starte en nedtælling, og “Slut eksamination” skal stoppe den. Den resterende tid ligger i state, fordi den vises; handlet fra setInterval ligger i en ref, så jeg kan kalde clearInterval både fra knappen og i effektens cleanup.',
        'Med ref-attributten får jeg fat i selve DOM-elementet, fx for at sætte fokus på en knap eller læse teksten i et felt, som slidenes nextButtonRef og textboxRef gør.',
        'Et felt med defaultValue og en ref er uncontrolled: DOM’en holder værdien, og jeg læser den først ved submit. Det sparer et re-render pr. tastetryk.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L20.2_React_useRef_Hook.md'), original: 'L20/FED React useRef Hook.pdf', pages: 's. 2–6' },
        { path: ctx('slides/SW4FED-02_L21.1_Handling_Events_i_React.md'), original: 'L21/Handling Events in React.pdf', pages: 's. 6 og 8', note: 'useRef til video- og knap-elementer i TypeScript' },
        { path: ctx('labs/SW4FED-02_Lab20_useRef_Counter_App.md'), original: 'Untitled - Copy (3).html', note: 'Lab 20: Counter App med useState, useRef og useEffect' },
        { path: ctx('labs/SW4FED-02_Lab21_Simple_draw_canvas.md'), original: 'Untitled.html', note: 'Lab 21: tegn på et canvas med mouse events' },
        { path: RQ_PDF, original: 'React Quickly, 1. udg., kap. 7', pages: 'afsn. 7.2.3–7.2.4 (s. 159–162)', note: 'Refs og defaultValue med class components' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 4–5', note: 'Opgave 2, pkt. 4.2 og 4.4: timer der tæller ned og stoppes' },
      ],
      gaps: [
        'Slide 5 typer knap-ref’en som `useRef<HTMLInputElement>`, selv om den sidder på en `<button>`. Events-lektionen bruger `HTMLButtonElement` til en knap (Handling Events in React.pdf s. 8).',
        'Slides 5–6 kalder `nextButtonRef.current.focus()` og læser `textboxRef.current.value` uden null-tjek, selv om ref’en starter som `null`; Handling Events in React.pdf s. 6 bruger `video.current?.play()`. Uden for materialet: med `strict` i TypeScript afviser compileren den første form (“possibly null”).',
        '`dispatch` på slides 5–6 kommer fra et `useReducer`-eksempel (bookings-appen fra *React Hooks in Action*), som ikke er vist.',
        'Lektionsplanen lover “use Ref + custom Hooks” i L21, men der er ingen slides om custom hooks i L20 eller L21. Det eneste custom hook i materialet er `useCount` i [[context|Context-lektionen]] (FED React managing application state.pdf s. 27).',
        'Lab 21 (canvas) nævner ikke `useRef`. Uden for materialet: canvas-elementet hentes typisk med en ref, og der tegnes via `canvasRef.current.getContext("2d")`.',
        'Uden for materialet: React-dokumentationen fraråder at læse eller skrive `ref.current` under selve renderingen (ud over initialisering). Lab 20’s render-tæller “uden useEffect” gør netop det, og i `StrictMode` kører komponentfunktionen to gange i udvikling, så den tæller dobbelt.',
        '*React Quickly* 1. udg. (afsn. 7.2.3) kalder refs “an antipattern”, der kun bør bruges i sjældne tilfælde; slidene præsenterer `useRef` neutralt som et værktøj.',
      ],
      keywords: ['useRef', 'ref', 'current', 'ref.current', 're-render', 'DOM-reference', 'DOM ref', 'setInterval', 'clearInterval', 'timer', 'focus', 'defaultValue', 'uncontrolled', 'HTMLInputElement', 'HTMLVideoElement', 'lab 20', 'lab 21', 'canvas', 'render counter'],
    },

    {
      slug: 'react-forms',
      title: 'Formularer i React',
      short: 'Formularer',
      week: 'Uge 11 · L22',
      definition:
        'React har ingen særlige API’er til forms; man bruger komponenter, state, props og events. Et **controlled** input får sin værdi fra React-state (`value` + `onChange`), så state er “single source of truth”. Et **uncontrolled** input beholder sin værdi i DOM’en, og den hentes med en ref, når formen submittes.',
      intro: [
        'Formularer er kernen i Opgave 2 i alle fire eksamenssæt: brugeren taster noget ind, og det skal persisteres via json-server. Sættene henviser direkte til lab 22, hvor en lærer indtaster studienummer, navn og karakter, data sendes til serveren, og felterne nulstilles til næste indtastning.',
      ],
      concepts: [
        {
          term: 'Hvorfor forms er særlige',
          body: [
            'I HTML holder `<input>`, `<textarea>` og `<select>` selv deres state og opdaterer den ud fra brugerens input. I React ligger mutable state i komponenterne og opdateres kun med `useState` eller `useReducer`. De to ting skal forenes, og der er to måder: controlled og uncontrolled forms.',
            'Slidene siger, at et egentligt forms-API “is coming in version 19”, og at `react-router-dom` allerede har en `Form`-control.',
          ],
        },
        {
          term: 'Controlled component',
          body: [
            'Gøres React-state til “single source of truth”, styrer den komponent, der renderer formen, også hvad der sker ved brugerens input. Underviserens kommentarer beskriver løkken i fem trin: (1) inputtet viser det, der står i `state.value`; (2) brugeren taster, og `onChange` fyrer i browseren; (3) `handleChange` kører; (4) state får React til at re-rendere; (5) inputtets værdi er opdateret. Controlled er godt til real time validation.',
            'Fordi feltet kun viser state, ændrer det sig ikke, hvis handleren lader være med at opdatere state. Det udnyttes til **filtered input**: `HexColor` fjerner alt andet end 0–9 og a–f med `.replace(/[^0-9a-f]/gi, "")` og gør resten til store bogstaver. **Masked input** går videre: `TicketNumber` viser et billetnummer som `R1S-T2U` — store bogstaver, bindestreg efter tre tegn og højst 7 tegn i alt.',
          ],
        },
        {
          term: 'Uncontrolled component',
          body: [
            'Her bruges en [[useref|ref]] til at hente værdien fra DOM’en: `ref={inputRef}` på inputtet og `inputRef.current.value` i `handleSubmit`. Formen er ikke forbundet til React-state. Kommentaren: godt “for large scale when performance is important”, fordi man ikke re-renderer ved hvert tastetryk.',
            'Bogen er mere skeptisk. *React Quickly* 1. udg. (afsn. 7.2) kalder controlled elements “best practice” og uncontrolled “a hack that you should avoid most of the time”. Bogen er skrevet før hooks; slidene er autoritative, og React Hook Form (nedenfor) bygger netop på uncontrolled elements.',
          ],
        },
        {
          term: 'Events, submit og preventDefault',
          body: [
            '`onChange` fyrer, når et input ændrer sig, og den nye værdi er `event.target.value`. `onClick` fyrer ved klik. `onSubmit` fyres fra en submit-knap; håndterer man submit selv, skal man huske `event.preventDefault()` — den forhindrer browserens default action for eventet, dvs. at siden sendes og genindlæses.',
            '`event` er et **SyntheticEvent**, en wrapper om browserens native event med bl.a. `target`, `currentTarget`, `type`, `nativeEvent`, `preventDefault()` og `stopPropagation()`. Se [[dom-events|DOM’en og events]].',
          ],
        },
        {
          term: 'Flere inputs med name',
          body: [
            'Med flere controlled inputs får hvert element en `name`-attribut, og én handler vælger felt ud fra `event.target.name`. En checkbox bruger `checked` i stedet for `value`, så handleren læser `target.checked` for checkboxe og ellers `target.value`.',
            'Opdateringen `setState(state => ({ ...state, [name]: value }))` spreder den forrige state ud og overskriver kun det ændrede felt (computed property name). Kommentaren viser resultatet `{ isGoing: true, numberOfGuests: "7" }` — værdien fra et `type="number"`-felt kommer som en streng.',
          ],
        },
        {
          term: 'Validering og React Hook Form',
          body: [
            'Validering starter med spørgsmål: hvad er datakravene, hvordan hjælper man brugerne til meningsfulde data, og kan inkonsistenser elimineres? Teknisk hooker man sig ind i update-processen med generelle validerings- og sanitiseringsfunktioner. Slidenes eksempel sætter `valid: content.length <= 280` i change-handleren, og submit afbrydes, hvis `valid` er falsk.',
            '**React Hook Form** er ifølge slidene et lille bibliotek uden dependencies, der omfavner uncontrolled elements, men også kan arbejde med controlled. `useForm()` giver `register` og `handleSubmit`; `{...register("firstName")}` registrerer feltet i stedet for state, og `handleSubmit(onSubmit)` står for både submission og validering. Kommentaren: mindre kode plus validering, og bedre til store eller komplekse forms. **MUI** er React-komponenter, der implementerer Googles Material Design.',
          ],
        },
      ],
      viz: 'controlled-input',
      keyPoints: [
        'Controlled: `value={state}` + `onChange` → React-state er single source of truth; re-render ved hvert tastetryk.',
        'Uncontrolled: `ref={inputRef}` → værdien læses fra DOM’en ved submit; ingen re-render pr. tastetryk.',
        '`onSubmit` på `<form>` + `event.preventDefault()`, ellers laver browseren sin egen submit.',
        'Opdaterer handleren ikke state, ændrer feltet sig ikke — det bruges til filtered og masked input.',
        'Flere felter: `name` + `...state` + `[name]: value` i én handler; checkboxe bruger `checked`.',
        'React Hook Form: `register` + `handleSubmit`, uncontrolled under motorhjelmen, til store forms.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'Controlled form',
          source: 'FED React Forms.pdf s. 5',
          code: `import { useState } from "react";

export function ControlledForm() {
  const initialState = { value: '' };
  const [state, setState] = useState(initialState);

  function handleChange(event) {
    setState({ value: event.target.value });
  }

  function handleSubmit(event) {
    alert('A name was submitted: ' + state.value);
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" value={state.value} onChange={handleChange} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'Uncontrolled form med useRef',
          source: 'FED React Forms.pdf s. 6',
          code: `import { useRef } from "react";

export function UncontrolledForm() {
  const inputRef = useRef();

  function handleSubmit(event) {
    alert('A name was submitted: ' + inputRef.current.value);
    event.preventDefault();
  }

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Name:
        <input type="text" ref={inputRef} />
      </label>
      <input type="submit" value="Submit" />
    </form>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'Én handler til flere inputs',
          source: 'FED React Forms.pdf s. 12',
          code: `const initialState = {
  isGoing: true,
  numberOfGuests: 2
};

const [state, setState] = useState(initialState);

function handleInputChange(event) {
  const target = event.target;
  const value = target.type === 'checkbox' ? target.checked : target.value;
  const name = target.name;

  setState(state => {
    return {
      ...state,
      [name]: value
    };
  });
}

// ...
<input
  name="numberOfGuests"
  type="number"
  value={state.numberOfGuests}
  onChange={handleInputChange} />`,
        },
      ],
      exam: [
        'Alle fire eksamenssæt beder i Opgave 2 om formularer, der persisteres i json-server: book en værkstedstid, opret en bruger og en vane, opret en eksamen og tilføj studerende, tilføj en vittighed. Jeg bygger dem som controlled forms, og onSubmit kalder preventDefault og sender en POST med fetch.',
        'Controlled betyder, at React-state er single source of truth: brugeren taster, onChange fyrer, handleren kalder setState, React re-renderer, og feltet viser den nye værdi. Derfor kan jeg validere og filtrere mens brugeren skriver.',
        'Uncontrolled betyder, at DOM’en selv holder værdien, og jeg læser den med en ref ved submit. Det sparer et re-render pr. tastetryk; underviserens kommentarer anbefaler det til store forms, mens React Quickly 1. udgave kalder det en nødløsning.',
        'I vittighedsopgaven fra vinteren 2025/26 skal dags dato tilføjes automatisk, når brugeren trykker gem. Datoen er ikke et felt i formen; jeg sætter den på objektet i submit-handleren, før det sendes.',
        'Med én handler til mange felter bruger jeg name-attributten og `{...state, [name]: value}`. Et number-input giver en streng, så i eksaminator-opgaven fra sommeren 2025, hvor numberOfQuestions er et tal i db.json, konverterer jeg værdien, før den gemmes.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L22.1_React_Forms.md'), original: 'L22/FED React Forms.pdf', pages: 's. 2–17' },
        { path: ctx('slides/SW4FED-02_L22.2_React_Forms_med_kommentarer.md'), original: 'L22/(Comments) FED React Forms.pdf', pages: 's. 5–16', note: 'Underviserens håndskrevne kommentarer: data-flowet i fem trin, hvornår controlled/uncontrolled' },
        { path: ctx('slides/SW4FED-02_L19.2_Fetch.md'), original: 'L19/FED Fetch.pdf', pages: 's. 8–10', note: 'POST med fetch og JSON.stringify' },
        { path: ctx('labs/SW4FED-02_Lab22_Form_og_Post_data.md'), original: 'L22/Lab 22 - Form and Post data.pdf', pages: 's. 1' },
        { path: RQ_PDF, original: 'React Quickly, 1. udg., kap. 7', pages: 'afsn. 7.1–7.2 (s. 140–162)', note: 'Class components; controlled som best practice' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 3', note: 'Opgave 2: book og ret aftale' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 4–5', note: 'Opgave 2: opret bruger, login, ny vane' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 4–6', note: 'Opgave 2: opret eksamen, tilføj studerende, noter og karakter' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 3', note: 'Opgave 2: tilføj vittighed' },
      ],
      gaps: [
        'Slide 3 siger, at et forms-API er “coming in version 19”. Uden for materialet: React 19 (december 2024) har form actions (`<form action={…}>`, `useActionState`, `useFormStatus`); materialet dækker dem ikke.',
        'Validering vises kun som en class component (`CreatePost`, s. 14) og kun som et `valid`-flag — ingen hooks-version og ingen visning af fejlbeskeder.',
        'Slide 10 har en løs `)` efter `evt.target.value` i `TicketNumber`, så koden kan ikke køre som vist.',
        'Kommentaren på (Comments)-slide 10 siger, at `.slice(0, 6)` “keeps only the first 7 characters”; den beholder 6 — bindestregen gør det til 7.',
        'Lab 22 siger, at data sendes, når læreren trykker Enter, men slidene forklarer ikke, hvordan Enter udløser submit. Uden for materialet: Enter i et tekstfelt i en `<form>` med en submit-knap udløser formens `submit`-event (implicit submission).',
        'MUI-eksemplet (s. 17) bruger `ReactDOM.render`; router-lektionen bruger `createRoot` (FED React Router.pdf s. 7). Uden for materialet: `ReactDOM.render` er fjernet i React 19.',
        'Slidene viser ikke, hvordan en form nulstilles efter submit, som lab 22 kræver. For en controlled form betyder det at sætte state tilbage til startværdien.',
      ],
      keywords: ['form', 'forms', 'formular', 'controlled', 'uncontrolled', 'controlled component', 'single source of truth', 'onChange', 'onSubmit', 'preventDefault', 'SyntheticEvent', 'event.target.value', 'filtered input', 'masked input', 'name', 'computed property', 'validation', 'validering', 'React Hook Form', 'useForm', 'register', 'MUI', 'Material UI', 'lab 22', 'json-server', 'POST'],
    },

    {
      slug: 'vitest',
      title: 'Test af React-komponenter med Vitest',
      short: 'Test med Vitest',
      week: 'Uge 12 · L23',
      definition:
        '**Vitest** er et Vite-native test framework med samme API som Jest. Sammen med **JSDOM** (et emuleret browsermiljø) og **React Testing Library** renderer man en komponent, finder elementer som en bruger ville (`getByRole`, `getByText` …), simulerer hændelser med `fireEvent` og asserter med `expect`.',
      concepts: [
        {
          term: 'Opsætning og kørsel',
          body: [
            'Vitest bruger appens egen konfiguration (`vite.config`) og deler dermed transformation pipeline med dev og build. API’et er det samme som Jests, og mocking, snapshots og coverage er indbygget. Det installeres som dev dependency (`npm install -D vitest`).',
            'Testfiler skal have `.test.` eller `.spec.` i navnet og kan ligge i vilkårlig dybde under `src` — helst ved siden af koden, de tester, men nogle bruger en spejlmappe `__tests__` eller `tests`. I `package.json` tilføjes scripts til `vitest` og `vitest run --coverage`. `npm run test` starter i watch mode og kører testene igen, hver gang en fil gemmes.',
          ],
        },
        {
          term: 'describe, test/it og expect',
          body: [
            'Vitest leverer en test runner (`vitest`), test suites (`describe`), test cases (`it` eller `test`), assertions (`expect`, inklusive snapshots) samt mocking og spies. Den første test på slidene er `expect(sum(1, 2)).toBe(3)`.',
          ],
        },
        {
          term: 'JSDOM og testmiljøet',
          body: [
            'React-komponenter er lavet til at køre i en browser, så en test skal levere et browsermiljø. For hurtige tests bruges **jsdom**, der emulerer browseren; det slås til med `environment: "jsdom"` under `test` i `vite.config.ts`.',
            'En global setup-fil (`src/tests/setup.ts`) tilføjer jest-dom’s custom assertions med `expect.extend(matchers)` og kalder `cleanup()` efter hver test. Med `globals: true` behøver testfilerne ikke importere `expect` osv., og `"types": ["vitest/globals"]` i `tsconfig.app.json` fortæller TypeScript om de globale typer.',
          ],
        },
        {
          term: 'React Testing Library: render, screen og queries',
          body: [
            'React Testing Library bygger oven på DOM Testing Library med API’er til React-komponenter. Det ledende princip: “The more your tests resemble the way your software is used, the more confidence they can give you.” Start med en **smoke test**, der blot renderer komponenten uden at den kaster.',
            '`render(<App />)` renderer JSX’en, og outputtet tilgås med `screen`; `screen.debug()` viser, hvad der blev renderet. Elementer findes med `getByText`, `getByRole` (aria-label eller implicit rolle, fx `button`), `getByLabelText`, `getByPlaceholderText`, `getByAltText`, `getByDisplayValue` og `getByTestId`.',
            '**`getBy*`** bruges i de fleste tilfælde. **`queryBy*`** bruges, når man asserter, at et element *ikke* er der (`toBeNull()`). **`findBy*`** bruges til elementer, der dukker op asynkront, og skal afventes med `await`. Alle findes i en `All`-variant til lister. Assertions som `toBeInTheDocument`, `toHaveValue`, `toHaveTextContent` og `toBeDisabled` kommer fra jest-dom.',
          ],
        },
        {
          term: 'fireEvent og Arrange–Act–Assert',
          body: [
            "`fireEvent` simulerer en slutbrugers interaktion. Slidenes test følger Arrange–Act–Assert: render `User`, find feltet med `getByRole('textbox')` og assert at værdien er tom; kald `fireEvent.change(…, { target: { value: 'JavaScript' } })`; assert til sidst med `await screen.findByRole('textbox')`, at værdien er `'JavaScript'`. `await` er nødvendig for at undgå en advarsel i konsollen.",
          ],
        },
        {
          term: 'Snapshots og API-mocking med MSW',
          body: [
            'En **snapshot test** gemmer ved første kørsel komponentens render-output i en snapshot-fil, som lægges i versionsstyring. Senere kørsler sammenligner med den. Ved en forskel er testen enten fejlet og skal rettes, eller snapshottet skal opdateres — tast `u`.',
            '**Mock Service Worker** (msw) mocker de requests, komponenten under test (SUT) sender. I browseren intercepter en Service Worker requests, efter at `window.fetch` har sendt dem, så det er ligegyldigt, om appen bruger `fetch`, axios eller Apollo. Vitest kører i Node, ikke i en browser, og der bruges derfor `setupServer()`, som anvender de samme request handlers i Node; `setupWorker()` er til tests i en rigtig browser.',
            'Handlerne beskrives med fx `http.get(\'/greeting\', …)`. `server.listen()`, `server.resetHandlers()` og `server.close()` kobles på `beforeAll`, `afterEach` og `afterAll`, og `server.use(…)` overskriver en handler for én test — fx til at returnere status 500 og teste fejlbeskeden.',
          ],
        },
      ],
      viz: 'vitest-rtl',
      keyPoints: [
        'Testfiler hedder `*.test.*` eller `*.spec.*`; `npm run test` kører Vitest i watch mode.',
        '`environment: "jsdom"` giver komponenterne en emuleret browser, mens testen kører i Node.',
        '`render` → `screen.getBy…` → `fireEvent` → `expect`, struktureret som Arrange–Act–Assert.',
        '`getBy*` når elementet skal være der, `queryBy*` når det ikke må, `findBy*` + `await` når det kommer senere.',
        'Snapshot: første kørsel gemmer, næste sammenligner; `u` opdaterer.',
        'MSW `setupServer` fanger komponentens fetch i Node og svarer med mock-data; `server.use` overskriver pr. test.',
      ],
      code: [
        {
          lang: 'typescript',
          title: 'vite.config.ts med jsdom, globals og setup-fil',
          source: 'FED testing with Vitest.pdf s. 16',
          code: `/// <reference types="vitest" />
/// <reference types="vite/client" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.ts',
  },
})`,
        },
        {
          lang: 'jsx',
          title: 'fireEvent i Arrange–Act–Assert',
          source: 'FED testing with Vitest.pdf s. 25',
          code: `import { render, screen, fireEvent } from '@testing-library/react';
import User from './User';

test('User component handles change event', async () => {
  // Arrange
  render(<User />);
  // Assert before event
  const inputElement = screen.getByRole('textbox');
  expect(inputElement).toHaveValue('');
  // Act
  fireEvent.change(screen.getByRole('textbox'), {
    target: { value: 'JavaScript' },
  });
  // Assert after event
  expect(await screen.findByRole('textbox')).toHaveValue('JavaScript');
});`,
        },
        {
          lang: 'javascript',
          title: 'MSW-server til Vitest',
          source: 'FED testing with Vitest.pdf s. 34–35',
          code: `const server = setupServer(
  http.get('/greeting', () => {
     return HttpResponse.json({greeting: 'hello there'})
  }),
)

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())`,
        },
      ],
      exam: [
        'Eksamenssættene kræver ikke tests, men lab 27 bygger testene oven på lab 22 — samme slags app som Opgave 2 — så jeg kan vise en smoke test og en test af min formular, når jeg forklarer, hvordan jeg har brugt React-økosystemet.',
        'Vitest bruger samme konfiguration som Vite-appen og har Jests API. React-komponenter forventer en browser, og testene kører i Node, så jeg sætter environment til jsdom.',
        "En komponenttest følger Arrange–Act–Assert: jeg renderer komponenten, finder feltet med getByRole('textbox'), simulerer indtastning med fireEvent.change og asserter med toHaveValue.",
        'getBy bruger jeg, når elementet skal findes; queryBy, når jeg vil vise, at det ikke er der; findBy med await, når det først dukker op efter fx et fetch.',
        'Min app henter data fra json-server. I testen erstatter jeg serveren med MSW’s setupServer, så komponentens fetch får et mock-svar, og med server.use kan jeg lade handleren svare 500 og teste fejlgrenen.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L23.2_Testing_med_Vitest.md'), original: 'L23/FED testing with Vitest.pdf', pages: 's. 2–37' },
        { path: ctx('labs/SW4FED-02_Lab27_Vitest.md'), original: 'Lab 27 Vitest.html', note: 'Lab 27: Vitest, JSDOM, RTL, fireEvent, snapshot og MSW oven på lab 22' },
        { path: RQ_PDF, original: 'React Quickly, 1. udg., kap. 16', pages: 'afsn. 16.1–16.4 (s. 325–343)', note: 'Jest og React TestUtils; ingen Vitest eller React Testing Library' },
      ],
      gaps: [
        'Slide 4: `sum.test.ts` importerer fra `./add`, men funktionen står i `sum.ts`. Skærmbilledet på s. 6 viser, at demoens testfil hed `add.test.ts`.',
        'Setup-filen (s. 15) importerer `@testing-library/jest-dom/matchers`, men installationskommandoen (s. 14) og lab 27 installerer kun `@testing-library/react` og `@testing-library/dom`. Matcherne på s. 24 (`toBeInTheDocument` osv.) kommer fra jest-dom, ikke fra React Testing Library, som overskriften siger.',
        'Slide 28 hedder “Snapshot with Vitest and react-test-renderer”, men koden bruger RTL’s `render`, og snapshot-navnet på s. 29 (`<Content/> > snapshot 1`) passer ikke til testnavnet `Content snapshot` på s. 28.',
        '`Fetch`-komponenten, som MSW-testene på s. 36–37 tester, er ikke vist, og import-linjerne til `setupServer`, `http` og `HttpResponse` mangler. Uden for materialet: `setupServer` importeres fra `msw/node`, `http` og `HttpResponse` fra `msw`.',
        'Slidene bruger kun `fireEvent`. Uden for materialet: Testing Library anbefaler `@testing-library/user-event`, der simulerer hele interaktionen (fokus, tastetryk, klik) frem for ét enkelt DOM-event.',
        '*React Quickly* 1. udg. kap. 16 bruger Jest og React TestUtils med shallow rendering; ud over slides og lab 27 har materialet intet om Vitest eller React Testing Library.',
        'Lab 27 har ingen løsning i materialet, og kildens overskrift siger fejlagtigt “Lab 23 Vitest”.',
      ],
      keywords: ['Vitest', 'Jest', 'JSDOM', 'jsdom', 'React Testing Library', 'RTL', 'render', 'screen', 'getByRole', 'getByText', 'queryBy', 'findBy', 'fireEvent', 'expect', 'describe', 'it', 'test', 'smoke test', 'snapshot', 'toMatchSnapshot', 'jest-dom', 'toBeInTheDocument', 'MSW', 'Mock Service Worker', 'setupServer', 'setupWorker', 'coverage', 'unit test', 'Arrange Act Assert', 'lab 27'],
    },

    {
      slug: 'context',
      title: 'Application state og Context API',
      short: 'Context API',
      week: 'Uge 12 · L24',
      definition:
        'Delt state kan sendes ned gennem props og op igen via updater-funktioner, men når mellemlag skal videregive værdier, de ikke selv bruger, er det **prop drilling**. **Context API** lader en `Provider` levere en `value`, som enhver efterkommer læser direkte med `useContext`.',
      concepts: [
        {
          term: 'Delt state via props',
          body: [
            'Den mest eksplicitte måde at dele data på er at sende dem som props fra parent til children. I slidenes `Colors` holder parent `color` i state og sender den til `ColorPicker`, `ColorChoiceText` og `ColorSample`. React kalder en komponent med ét objekt med alle props som første argument; i TypeScript destructures det mod en props-type, og destructuring kan give en default-værdi (`{ color = \'white\' }`).',
            'Den anden vej går via en updater-funktion: `ColorPicker` får `setColor` som prop og kalder `setColor(c)` ved klik, så child ændrer state hos parent.',
          ],
        },
        {
          term: 'Prop drilling og context',
          body: [
            'Context sender data gennem komponenttræet uden at sende props manuelt ned på hvert niveau. Det er beregnet til data, der er “globale” for et træ af komponenter: den autentificerede bruger, tema eller foretrukket sprog. Slidene tegner to træer: ved prop drilling passerer værdien gennem alle mellemliggende komponenter; med context læser de fjerne børn den direkte fra toppen.',
          ],
        },
        {
          term: 'createContext, Provider og useContext',
          body: [
            '`createContext(\'light\')` opretter et Context-objekt. Default-værdien bruges kun, når en komponent ikke har en matchende Provider over sig — nyttigt, når man tester en komponent isoleret. Hvert Context-objekt har en `Provider`-komponent, hvis `value`-prop leveres til alle efterkommere. Én Provider kan have mange consumers, og Providers kan nestes for at overskrive værdien længere nede.',
            '`useContext(ThemeContext)` returnerer værdien fra den nærmeste `<ThemeContext.Provider>` over den kaldende komponent. I slidenes demo pakker `App` sig ind i `<ThemeContext.Provider value="Dark">`; `Toolbar` nævner ikke temaet, og `ThemedButton` læser `"Dark"` direkte.',
          ],
        },
        {
          term: 'Custom provider med eget hook',
          body: [
            'Kent C. Dodds’ mønster (slide 27): `CountProvider` holder `useState(0)` og lægger både værdi og setter i context som `[count, setCount]`, pakket i `useMemo` “to avoid unnecessary updates”. Hooket `useCount` kalder `useContext` og kaster en fejl, hvis det bruges uden for en `CountProvider`. Søskendekomponenterne `Counter` og `CountDisplay` deler dermed tælleren uden props.',
            'Samme idé bruges til “current user as context”: `App` holder `user` i state og lægger den i `<UserContext.Provider value={user}>`, `UserPicker` sætter brugeren, og `UsersPage` læser den indloggede bruger med `useContext(UserContext)`.',
          ],
        },
        {
          term: 'Flere contexts og re-renders',
          body: [
            'Et context-objekt kan have mange properties, men ændres én af dem, re-renderer alle komponenter, der bruger contexten. Løsningen er at dele værdierne op på flere providers (`ThemeContext`, `UserContext`, `LanguageContext` …), så nestede komponenter kun kalder `useContext` på det, de bruger.',
            'Slidenes opsummering: context er en let måde at give en app global state, men skal bruges sparsomt, fordi det gør genbrug af komponenter sværere. Til større apps er [[redux|Redux]] alternativet.',
          ],
        },
        {
          term: 'useCallback, useMemo og racing responses',
          body: [
            'En setter fra `useState` ændrer aldrig identitet, så en effekt med `[setBookable]` kører kun én gang. Sender parent i stedet sin egen funktion som prop, er den en ny funktion ved hver render — og afhænger en effekt af den, kan det give et infinite loop. `useCallback(fn, deps)` returnerer den samme funktion, indtil en dependency ændrer sig.',
            '`useMemo(() => expensiveFn(a, b), [a, b])` gemmer resultatet (memoizing): React sammenligner dependency-listen med den forrige og kalder kun funktionen igen, hvis en værdi er ændret. Det koster selv lidt overhead, så man skal ikke memoize alt.',
            'Ved fetch i en [[useeffect|useEffect]] kan et gammelt svar komme efter et nyt. Slidenes løsning: en lokal `let doUpdate = true`, som cleanup-funktionen sætter til `false`, før næste effekt kører, så forældede svar ignoreres.',
          ],
        },
      ],
      viz: 'context-drilling',
      keyPoints: [
        'Prop drilling: værdien sendes gennem mellemlag, der ikke selv bruger den.',
        '`createContext(default)` → `<Ctx.Provider value={…}>` → `useContext(Ctx)` i en vilkårlig efterkommer.',
        'Consumeren læser fra den nærmeste Provider over sig; uden Provider får den default-værdien.',
        'Læg både værdi og setter i context (fx `[count, setCount]`) og pak dem i et custom hook.',
        'Én ændring i et context-objekt re-renderer alle, der bruger det — del op i flere contexts.',
        'Brug context sparsomt: det gør komponenter sværere at genbruge.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'Context-demo: Provider øverst, useContext langt nede',
          source: 'FED React managing application state.pdf s. 22',
          code: `// ThemeContext.js
import { createContext } from "react";
const ThemeContext = createContext('light');
export default ThemeContext;

// ...
import ThemeContext from './context/ThemeContext';
import Toolbar from './components/Toolbar';

function App() {
  return (
    <ThemeContext.Provider value="Dark" >
      <div className="App" >
        <Toolbar />
      </div>
    </ThemeContext.Provider>
  );
}

// ...
function Toolbar(props) {
  return (
    <div>
      <ThemedButton />
    </div>
  );
}

// ...
import { useContext } from "react";
import ThemeContext from "../context/ThemeContext";

export default function ThemedButton(props) {
  const theme = useContext(ThemeContext);
  return (
    <div className={theme}>
      <button className={theme} >Demo</button>
    </div>
  );
}`,
        },
        {
          lang: 'jsx',
          title: 'Custom provider med useCount-hook',
          source: 'FED React managing application state.pdf s. 27',
          code: `// count-context.js
import * as React from 'react'

const CountContext = React.createContext()

function useCount() {
  const context = React.useContext(CountContext)
  if (!context) {
    throw new Error(\`useCount must be used within a CountProvider\`)
  }
  return context
}

function CountProvider(props) {
    const [count, setCount] = React.useState(0)
    const value = React.useMemo(() => [count, setCount], [count])
    return <CountContext.Provider value={value} {...props} />
}

export { CountProvider, useCount }`,
        },
        {
          lang: 'jsx',
          title: 'To søskende deler tælleren via context',
          source: 'FED React managing application state.pdf s. 28',
          code: `import { CountProvider } from './context/count-context';
import { CountDisplay } from './components/CountDisplay';
import { Counter } from './components/Counter';
function App() {
  return (
    <CountProvider>
      <CountDisplay />
      <Counter />
    </CountProvider>
  );
}

// ...
import { useCount } from '../context/count-context'

export function Counter() {
  const [count, setCount] = useCount()
  const increment = () => setCount(c => c + 1)
  return <button onClick={increment}>{count}</button>
}

// ...
export function CountDisplay() {
  const [count] = useCount()
  return <div>The current counter count is {count}</div>
}`,
        },
      ],
      exam: [
        'I vane-appen fra vintersættet 2024/25 skal brugeren logge ind, og den indloggede bruger skal kendes på alle sider. Det er slidenes “current user as context”: App holder user i state og lægger den i en UserContext.Provider, og siderne læser den med useContext i stedet for at få den gennem props.',
        'Prop drilling er, når en værdi sendes gennem komponenter, der ikke selv bruger den, blot for at nå et barn længere nede. Context løser det ved at lade en Provider levere værdien til alle efterkommere.',
        'Jeg lægger både værdien og setter-funktionen i context og pakker det i et custom hook som useCount, der kaster en fejl, hvis det bruges uden for sin provider.',
        'Lab 24 flytter lab 22’s studerende ind i en context: listen henter data fra backend og sætter context, og ved klik navigeres til redigering med den studerendes id, hvor data læses fra context. Det er samme mønster som “ret aftale” i sommersættet 2024.',
        'Ulempen er, at alle consumers re-renderer, når værdien ændres, og at komponenterne bindes til en bestemt context. Derfor bruger jeg det kun til det, der reelt er globalt, som bruger og tema.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L24.1_React_managing_application_state.md'), original: 'L24/FED React managing application state.pdf', pages: 's. 3–31' },
        { path: ctx('slides/SW4FED-02_L24.2_Koersel_af_demoer.md'), original: 'L24/How to run demos in L24 and find other demos.pdf', pages: 's. 2–6', note: 'Demoerne ligger som git-branches i app-state-demo; useCallback-demoen kræver json-server på port 4001' },
        { path: ctx('labs/SW4FED-02_Lab24_Teachers_context.md'), original: 'Lab 24 Teachers context.html', note: 'Lab 24: studerende i en context, provider i app.jsx/main.jsx' },
        { path: ctx('book/React_Quickly_1ed_Ch13_React_routing.md'), original: 'React Quickly, 1. udg., kap. 13', pages: 's. 263–267', note: 'Kun det gamle context-API (contextTypes, this.context.router)' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 4', note: 'Opgave 2: opret bruger og log ind' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 3', note: 'Opgave 2: søg og ret aftale' },
      ],
      gaps: [
        'Slide 23 skriver `CreateContext(defaultValue)` med stort C; funktionen hedder `createContext`, som på s. 22.',
        'Slide 30 skriver `<UserContext.Provider value=1>`. I JSX skal et tal stå i krøllede parenteser (`value={1}`), som alle andre udtryk i materialets JSX.',
        'Koden til “current user as context” (s. 26) er ufuldstændig (“// Code missing”), og `UsersPage` har både egen `user`-state og den indloggede bruger fra context uden at forklare forskellen.',
        'useCallback-eksemplet (s. 8–10) kommer fra bookings-appen i *React Hooks in Action*; `getData`, `setIsLoading` og `setError` er ikke vist, og demoen kræver json-server på port 4001.',
        '*React Quickly* 1. udg. har kun det gamle context-API (`contextTypes`, `this.context.router`) i routing-kapitlet; `createContext` og `useContext` findes kun i slidene.',
        'Uden for materialet: fra React 19 kan en context bruges direkte som provider (`<ThemeContext value="dark">`); slidenes `.Provider` virker stadig.',
        'Lab 24 har ingen løsning i materialet.',
      ],
      keywords: ['Context', 'Context API', 'createContext', 'Provider', 'useContext', 'Consumer', 'prop drilling', 'global state', 'application state', 'delt state', 'shared state', 'custom provider', 'custom hook', 'useCount', 'current user', 'useCallback', 'useMemo', 'memoization', 'racing responses', 'lab 24'],
    },

    {
      slug: 'redux',
      title: 'Redux Toolkit',
      week: 'Uge 14 · L27 (fil L26)',
      definition:
        '**Redux** holder appens globale state i ét objekttræ i én **store**. State ændres kun ved at `dispatch`’e en **action** — et objekt, der beskriver, hvad der skete — og rene **reducer**-funktioner beregner den nye state ud fra den gamle og actionen. **Redux Toolkit** (`configureStore`, `createSlice`) og **React Redux** (`Provider`, `useSelector`, `useDispatch`) kobler det til React.',
      concepts: [
        {
          term: 'Flux og envejs-dataflow',
          body: [
            'Redux er et state management-bibliotek (2 KB) af Dan Abramov. Det hjælper med at give hver komponent præcis det stykke state, den har brug for, ved at holde al state ét sted, og det er framework agnostic.',
            'Mønsteret bag er **Flux** med unidirectional dataflow: Action → Dispatcher → Store → View, og viewet skaber nye actions. Slidenes “chat”: React melder et klik på “Save Course”, dispatcheren giver besked til de stores, der har registreret sig, storen opdaterer sine data med payloaden og udsender et event, og React opdaterer UI’et. *React Quickly* 1. udg. (afsn. 14.2–14.3) præciserer, at Flux er en arkitektur, og at Redux er én implementering — uden separat dispatcher eller store-registrering; storen har selv `dispatch`.',
          ],
        },
        {
          term: 'Hvornår Redux',
          body: [
            'Overvej Redux, når flere komponenter skal bruge samme state uden at have et parent/child-forhold, eller når det føles akavet at sende state ned gennem props. Redux er ikke nyttigt i små apps, men skinner i store — og man bør først overveje, om [[context|Context]] kan klare opgaven. Abramov: “Flux libraries are like glasses: you’ll know when you need them.”',
          ],
        },
        {
          term: 'Store, actions og reducers',
          body: [
            'Hele den globale state ligger i ét objekttræ i én store. Den eneste måde at ændre det på er at oprette en **action** og dispatche den; hvordan state opdateres, beskrives af rene **reducers**, der beregner ny state ud fra gammel state og action. Storen har tre metoder: `getState`, `dispatch` og `subscribe`.',
            'En action er et plain object med en `type`-streng, gerne skrevet som `"domain/eventName"` og helst erklæret som konstant for at undgå tastefejl. En **action creator** er en funktion, der bygger action-objektet; den er valgfri, og Redux Toolkit laver dem for dig. Standardformatet: `type` er obligatorisk; `payload`, `error` og `meta` er tilladt; andre properties er ikke.',
          ],
        },
        {
          term: 'Immutability',
          body: [
            'State er et immutable objekt, og en reducer skal være ren. `state.articles.push(action.payload)` bryder loven (slidens titel), fordi `push` er en impure funktion, der ændrer det oprindelige array. Den rigtige reducer returnerer et nyt objekt: `{ ...state, articles: state.articles.concat(action.payload) }` eller med spread `[...state.articles, action.payload]`.',
            'Reglen: `concat()`, `slice()` og spread til arrays; `Object.assign()` og spread til objekter. Reducers kan håndtere lister, objekter og primitiver — en primitiv reducer returnerer fx `state + 1`.',
          ],
        },
        {
          term: 'Redux Toolkit: configureStore og createSlice',
          body: [
            'For at bruge Redux i React skal man oprette en store, eksponere den med en `Provider` og lave en container-komponent. `configureStore({ reducer: { counter: counterReducer } })` bygger storen af **slices**, og `<Provider store={store}>` om `<App />` gør den tilgængelig i hele appen.',
            '`createSlice` samler `name`, `initialState` og `reducers`. I reducerne må man skrive “muterende” kode som `state.value += 1`; det muterer ikke reelt state, fordi Redux Toolkit bruger biblioteket **Immer**. “You write reducers, RTK writes the actions”: `counterSlice.actions` giver action creators som `increment` og `incrementByAmount`, og en selector som `selectCount = (state) => state.counter.value` læser et stykke af state.',
          ],
        },
        {
          term: 'useSelector, useDispatch og async',
          body: [
            'I komponenten læser `useSelector(selectCount)` værdien fra storen, og `useDispatch()` giver `dispatch`, så knapperne kalder `dispatch(decrement())` og `dispatch(incrementByAmount(incrementValue))`. Lokal UI-state — her det indtastede beløb — bliver i `useState`.',
            'API-kald kræver **thunks** eller **sagas**, middleware der intercepter actions på vej ind i storen via `dispatch()`. Redux Toolkit gør thunks lettere med `createAsyncThunk(\'counter/fetchCount\', async (amount) => …)`, hvis `pending`- og `fulfilled`-actions håndteres i slicens `extraReducers` (fx `status = \'loading\'` og derefter `\'idle\'`). RTK indeholder desuden **RTK Query** til data fetching og caching.',
          ],
        },
      ],
      viz: 'redux-flow',
      keyPoints: [
        'Én store, ét state-træ; kun `dispatch(action)` kan ændre det.',
        'Action = plain object med `type` (fx `"counter/incremented"`) og evt. `payload`.',
        'Reducer = ren funktion `(state, action) => newState`; mutér aldrig — brug spread, `concat`, `slice`.',
        '`createSlice` genererer action creators; Immer gør “muterende” kode i reducers sikker.',
        '`<Provider store={store}>` øverst; `useSelector` læser, `useDispatch` sender.',
        'Overvej Context først; Redux er til store apps med meget delt state.',
      ],
      code: [
        {
          lang: 'jsx',
          title: 'Store af slices og Provider om App',
          source: 'React - Redux.pdf s. 27',
          code: `// index.js
import App from './App';
import { store } from './app/store';
import { Provider } from 'react-redux';

ReactDOM.render(
   <React.StrictMode>
     <Provider store={store}>
       <App />
     </Provider>
   </React.StrictMode>,
   document.getElementById('root')
);

// store.js
import { configureStore } from '@reduxjs/toolkit';
import counterReducer from '../features/counter/counterSlice';

export const store = configureStore({
   reducer: {
      counter: counterReducer,
   },
})`,
        },
        {
          lang: 'javascript',
          title: 'createSlice: reducers ind, actions ud',
          source: 'React - Redux.pdf s. 28',
          code: `// counterSlice.js
import {createSlice } from '@reduxjs/toolkit';

const initialState = {
   value: 0,
   status: 'idle',
};

export const counterSlice = createSlice({
   name: 'counter',
   initialState,
   reducers: {
      increment: (state) => {
         state.value += 1;
      },
      decrement: (state) => {
         state.value -= 1;
      },
      incrementByAmount: (state, action) => {
         state.value += action.payload;
      },
   },
});

export const { increment, decrement, incrementByAmount } = counterSlice.actions;
export const selectCount = (state) => state.counter.value;`,
        },
        {
          lang: 'jsx',
          title: 'useSelector og useDispatch i komponenten (forkortet)',
          source: 'React - Redux.pdf s. 29',
          code: `// Counter.js
import { useSelector, useDispatch } from 'react-redux';
import { decrement, increment, incrementByAmount, selectCount,} from './counterSlice';
export function Counter() {
  const count = useSelector(selectCount);
  const dispatch = useDispatch();
  const [incrementAmount, setIncrementAmount] = useState('2');
  const incrementValue = Number(incrementAmount) || 0;
  // ...
       <button
         className={styles.button}
         aria-label="Decrement value"
         onClick={() => dispatch(decrement())}
       >
  // ...
       <button
          className={styles.button}
          onClick={() => dispatch(incrementByAmount(incrementValue))}
       >`,
        },
      ],
      exam: [
        'Redux holder al global state i én store. Komponenter ændrer den aldrig direkte: de dispatcher en action, en ren reducer beregner den nye state, og de komponenter, der læser den del med useSelector, re-renderer.',
        'En reducer må ikke mutere state. I klassisk Redux returnerer jeg et nyt objekt med spread eller concat; i Redux Toolkit må jeg skrive state.value += 1 i createSlice, fordi Immer laver den nye state bag kulisserne.',
        'Til eksamensopgaverne — vittighedsappen eller eksaminator-appen — ville jeg ikke bruge Redux. Slidene siger selv, at det er til store apps, og at man først skal overveje Context; den indloggede bruger i vintersættet 2024/25 klarer en context fint.',
        'Flux-mønsteret er envejs: action, dispatcher, store, view. I Redux er dispatcheren blot storens dispatch-metode.',
        'Data fra et API kommer ind via en thunk. Med createAsyncThunk får jeg pending- og fulfilled-actions, som slicen håndterer i extraReducers.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L26.1_React_Redux.md'), original: 'L26/React - Redux.pdf', pages: 's. 1–32' },
        { path: RQ_PDF, original: 'React Quickly, 1. udg., kap. 14', pages: 'afsn. 14.1–14.3 (s. 274–303)', note: 'Flux og klassisk Redux med connect(); ingen Redux Toolkit' },
      ],
      gaps: [
        'Der er ingen lab til Redux, og forelæsningsvideoen `L27/React-Redux.mp4` er ikke konverteret.',
        'Demoprojektet `L26/react-redux-demo.zip` er fra 2018 (redux 4, react-redux 6) og bruger `connect`/`mapStateToProps` og en class component — ikke Redux Toolkit og hooks som slidene. Slide 26 nævner en “container component” uden at forklare `connect`, som *React Quickly* 1. udg. kap. 14 også bruger.',
        'Slide 5 kalder den første pakke “React”, men beskrivelsen (“A predictable state container”) er Redux’. Slide 7 installerer `react` under “Install redux” og skriver “Install react-redux” over `@reduxjs/toolkit`.',
        'Slide 6 viser Create React App-templates, og kommandoen til Vite-templaten mangler. Uden for materialet: Create React App er udfaset af React-teamet (2025), og kurset bruger ellers Vite.',
        'Slides 9 og 15 bruger `createStore`. Uden for materialet: den er markeret som forældet i Redux til fordel for RTK’s `configureStore` (slide 27).',
        'Object reducer-eksemplet (s. 22) mangler `default: return state`, så en ukendt action giver `undefined` — i modsætning til de andre reducers på s. 9, 19 og 23.',
        'Slide 27 bruger `ReactDOM.render`; router-lektionen bruger `createRoot` (FED React Router.pdf s. 7). Uden for materialet: `ReactDOM.render` er fjernet i React 19.',
        'Slide 28 mangler `});` efter `createSlice({ … })`; kodeeksemplet ovenfor har den tilføjet.',
        'Counter-koden på s. 29 er ufuldstændig: JSX’en er ikke balanceret, og `increment` importeres uden at blive brugt i den viste del.',
        'Sagas og RTK Query (s. 30) nævnes kun; der er ingen eksempler.',
      ],
      keywords: ['Redux', 'Redux Toolkit', 'RTK', 'react-redux', 'store', 'action', 'action creator', 'reducer', 'dispatch', 'getState', 'subscribe', 'Flux', 'unidirectional data flow', 'envejs', 'dispatcher', 'immutability', 'Immer', 'configureStore', 'createSlice', 'slice', 'Provider', 'useSelector', 'useDispatch', 'selector', 'thunk', 'createAsyncThunk', 'extraReducers', 'saga', 'RTK Query', 'createStore'],
    },
  ],
}
