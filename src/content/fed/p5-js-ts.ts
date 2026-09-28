import type { Part } from '../types'
import { ctx } from './paths'

export const jsTs: Part = {
  id: 'js-ts',
  title: 'Web · JavaScript og TypeScript',
  topics: [
    {
      slug: 'javascript',
      title: 'JavaScript: typer, funktioner, objekter og moduler',
      short: 'JavaScript',
      week: 'Uge 8 · L15 (moduler: fil L20.1)',
      definition:
        'JavaScript er webbens programmeringssprog: multi-paradigm, dynamisk og **weakly typed** — typen sidder på værdien, ikke på variablen. Funktioner er værdier med **lexical scoping**, og en indre funktion beholder adgangen til det environment, den blev defineret i (**closure**).',
      intro: [
        'Alle browsere har en JavaScript-interpreter. Sproget blev skrevet hos Netscape i 1995 og standardiseret som **ECMAScript**; siden ES2015 kommer der en ny udgave hvert år. Designet låner prototype-objekter fra Self, funktionel programmering fra Scheme og syntaksen fra C.',
      ],
      concepts: [
        {
          term: 'Værdier og typer',
          body: [
            'Slides nævner syv typer: `number`, `string`, `boolean` og `Symbol` (primitive, værdisemantik), `object` og `function` (referencesemantik) samt `undefined`, der “ikke rigtig er en type” ligesom `null`. Der er ingen `char` og kun én taltype: en 64-bit IEEE-754 double. Heltal under 2^52 regnes præcist, brøker ikke: `0.94 - 0.01` giver `0.9299999999999999`, så output afrundes med `toFixed(2)`. Strings er immutable.',
            'Variabler oprettes med `var` eller `let` og er typeløse. `typeof` fortæller, hvilken type værdien har *lige nu*: den samme `myRef` er først `undefined`, så `number`, `string` og `boolean`. Hukommelsen ryddes af en garbage collector, hvis algoritme ikke er en del af standarden.',
          ],
        },
        {
          term: 'Sammenligning, truthy og fallback',
          body: [
            '`0`, `NaN`, `""`, `null`, `undefined` og `false` tæller som false. `==` konverterer typer, så `"5" == 5`, `"" == 0` og `null == undefined` alle er `true`; `===` kræver samme type og giver `false` i alle fire tilfælde. `NaN == NaN` er `false` — brug `isNaN()`.',
            '`||` returnerer venstre side, hvis den er truthy, ellers højre side. Det slår også til på legitime værdier: `score || 60` giver 60, når `score` er 0. **Nullish coalescing** `??` falder kun tilbage ved `null` og `undefined` (`score ?? 60` giver 0). **Optional chaining** `?.` returnerer `undefined` i stedet for at kaste, når et led mangler — slidesens eksempel er en bog fra et API, der ikke garanterer en forfatter: `book?.author?.firstName ?? \'Unknown\'`.',
          ],
        },
        {
          term: 'Funktioner og hoisting',
          body: [
            'En *function declaration* står som selvstændigt statement; en *function expression* er `function` brugt der, hvor et udtryk forventes (`const add = function (a, b) { … }`), og kan kaldes straks, hvis den står i parenteser. Parametrene er typeløse, og antallet af argumenter behøver ikke passe: `add(\'2\', \'3\')` giver `"23"`, `add(4)` giver `NaN`, og `add(5,6,7,8)` giver 11. Alle argumenter ligger også i `arguments`. En funktion uden `return` returnerer `undefined`.',
            '**Hoisting**: interpreteren flytter deklarationer til toppen af deres scope. En function declaration løftes med hele kroppen; en `var` løftes kun som `var bar = undefined`, mens tildelingen bliver stående. Derfor giver slidesens quiz 8, 3, 3 og — når `return bar()` står før begge `var bar = function …` — en **TypeError**.',
          ],
        },
        {
          term: 'Scope og closures',
          body: [
            'Funktioner danner et lokalt scope (slides: “scope — aka environment”). En indlejret funktion ser sin omgivende funktions variabler, ikke top-level: `childFunction` logger `"local"`. En blok `{ … }` danner *ikke* scope for `var` (“Inside: 2”, “Outside: 2”), men gør det for `let` (“Outside: 1”). Glemmer man `var`, `let` eller `const`, havner variablen i det globale scope og kan overskrive noget vigtigt.',
            'En **closure** er en funktion, der “retains access to the environment that existed in that function at the point when it was defined”. `makeAddFunction(2)` returnerer en `add`, der husker `amount = 2`; `makeAddFunction(5)` giver en anden med sit eget `amount`. `addTwo(1) + addFive(1)` er 9. Samme mekanisme bruges i React, når en event handler generator som `update(1)` returnerer en handler, der husker `delta` — se [[dom-events|events i React]].',
          ],
        },
        {
          term: 'Objekter, arrays og Date',
          body: [
            'Et objekt er en samling af (key, value)-par med en identitet og en **prototype chain**, oprettet som object literal (`{member1: \'value 1\'}`) eller med `new Object()`. Properties kan tilføjes, ændres og fjernes med `delete` når som helst; at læse en property, der ikke findes, giver `undefined`, ikke en fejl. Dot notation kræver et lovligt navn — `thing["gabba gabba"]` og reserverede ord som `thing["if"]` kræver subscript. `"Spot" in set` tester, om en property findes.',
            'Arrays er implementeret som hashtable-objekter: de vokser selv, er utypede, og `length` er højeste index plus én (`myList[27] = \'banana\'` giver længde 28). `push`, `pop` og `join` er de grundlæggende metoder; typed arrays som `Int8Array` kom i ES2015. I `Date` går månederne fra **0 til 11**, mens dagene starter ved 1 — `new Date(1980, 1, 1)` er 1. februar.',
          ],
        },
        {
          term: 'Moduler og npm',
          body: [
            'JavaScript har ingen namespaces, så store programmer har brug for moduler for ikke at forurene det globale scope. Før ES modules brugte man en straks-kaldt funktion som namespace, et objekt som export-interface og **CommonJS** (`require`, `exports`, `module.exports`), som Node.js har indbygget; i browseren krævede det en bundler som Browserify.',
            '**ES modules** (ES2015): én fil pr. modul. `<script type="module">` kører i strict mode, top-level-variabler er lokale for modulet, `this` er `undefined`, og modulet udføres asynkront. *Named exports* importeres med krøllede parenteser (`import { square, diag } from \'lib.js\'`) eller samlet (`import * as lib`); der kan være én *default export*, som den importerende fil selv navngiver. `await import(\'./calculator.js\')` (ES2020) henter først et modul, når der er brug for det.',
            'Et **package** er distribuerbar kode med information om sine afhængigheder. NPM er både en online service og et program, der følger med Node.js. `npm init` laver `package.json`; `npm install express` henter pakken og skriver den under `dependencies`. `node_modules` skal ikke i git. Yarn og pnpm er alternativer.',
          ],
        },
      ],
      viz: 'js-closure',
      keyPoints: [
        'Typen sidder på værdien; `typeof` fortæller, hvad variablen holder lige nu.',
        'Brug `===`. `==` konverterer typer, så `"5" == 5` er `true`.',
        '`??` falder kun tilbage ved `null`/`undefined`; `||` også ved `0` og `""`.',
        'Funktioner skaber scope; blokke gør det kun for `let`. Uden `var`/`let`/`const` bliver variablen global.',
        'En closure husker det environment, den blev defineret i — også efter den ydre funktion har returneret.',
        'Named exports importeres med `{ }`; en default export navngives af den, der importerer.',
      ],
      code: [
        {
          lang: 'javascript',
          title: 'Closure: to funktioner med hver sit amount',
          source: 'FED Functions in js.pdf s. 18',
          code: `function makeAddFunction(amount) {
    function add(number) {
        return number + amount;
    }
    return add;
}

var addTwo = makeAddFunction(2);
var addFive = makeAddFunction(5);
console.log(addTwo(1) + addFive(1));`,
        },
        {
          lang: 'javascript',
          title: '|| mod ?? når værdien er 0',
          source: 'FED JavaScript.pdf s. 21',
          code: `let score = 0;
let pass = score || 60;
console.log(pass);   // Prints 60

// ...
let score = 0;
let pass = score ?? 60;
console.log(pass);   // Prints 0`,
        },
        {
          lang: 'javascript',
          title: 'Named og default exports',
          source: 'FED Modules.pdf s. 5–6',
          code: `//------ lib.js ------
export const sqrt = Math.sqrt;
export function square(x) {
  return x * x;
}
export function diag(x, y) {
  return sqrt(square(x) + square(y));
}

//------ main.js ------
import { square, diag } from 'lib.js';
console.log(square(11)); // 121
console.log(diag(4, 3)); // 5

//------ lib2.js ------
export default function () {
 ···
}

//------ main2.js ------
import myFunc from 'lib2.js';
myFunc();`,
        },
      ],
      exam: [
        'JavaScript er dynamisk og svagt typet: en variabel kan holde enhver værdi, og det er værdien, der har typen. Derfor sammenligner jeg med `===`, så `"5" == 5` ikke snyder mig.',
        'En closure er en funktion, der beholder adgangen til det environment, den blev defineret i. `makeAddFunction(2)` returnerer en funktion, der stadig kender `amount`, efter kaldet er slut — og det er det samme, der sker, når jeg i React laver en handler med `update(1)`.',
        'Data fra json-serveren i eksamensopgaven kan mangle felter. Der bruger jeg `?.` og `??`, fordi `||` også ville erstatte et legitimt `0`.',
        'Min React-app er delt i ES modules: hver komponent i sin egen fil med en default export. Moduler kører i strict mode og har deres egne top-level-variabler, så intet forurener det globale scope.',
        'Afleveringen er en zip med kode og konfigurationsfiler. `package.json` beskriver afhængighederne, så `node_modules` ikke skal med — `npm install` henter dem igen.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L15.1_JavaScript.md'), original: 'L15/FED JavaScript.pdf', pages: 's. 4–38' },
        { path: ctx('slides/SW4FED-02_L15.2_Functions_i_JS.md'), original: 'L15/FED Functions in js.pdf', pages: 's. 4–28' },
        { path: ctx('slides/SW4FED-02_L15.3_Objects_og_Arrays_i_JS.md'), original: 'L15/FED Objects and Arrays in js.pdf', pages: 's. 2–18' },
        { path: ctx('slides/SW4FED-02_L15.5_npm.md'), original: 'L15/FED npm.pdf', pages: 's. 2–12' },
        { path: ctx('slides/SW4FED-02_L20.1_Modules.md'), original: 'L20/FED Modules.pdf', pages: 's. 2–13' },
        { path: ctx('slides/SW4FED-02_L16.1_React_Overview.md'), original: 'L16/FED React Overview.pdf', pages: 's. 15', note: '`npm install` og `npm run dev` i et Vite-projekt' },
        { path: ctx('eksamen/SW4FED-02_Eksamensforberedelse.md'), original: 'L28/FED Eksamensforberedelse.pdf', pages: 's. 2', note: 'afleveres som zip med kode og konfigurationsfiler' },
      ],
      gaps: [
        'Arrow functions, template literals og array-metoderne `map`, `filter` og `reduce` bruges i slides (fx FED Promises.pdf s. 7, FED Fetch.pdf s. 6) men forklares ikke i JS-lektionerne. Destructuring og spread forklares først i React-lektionerne ([[react-jsx|L17.1]], [[usestate|L17.2]]).',
        '`const` nævnes kun i “Always use var, let or const!” (FED Functions in js.pdf s. 15); forskellen på `let` og `const` forklares ikke. Uden for materialet: en `const`-binding kan ikke gentildeles, men et objekt bag den kan stadig ændres.',
        'Typelisten (FED JavaScript.pdf s. 9) er ældre end sproget i dag. Uden for materialet: JavaScript har også typen `bigint`, og `typeof null` giver `"object"`.',
        'FED npm.pdf s. 10 annoterer `"express": "^4.13.3"` med “Use newest patch”. Uden for materialet: `^` tillader også nye minor-versioner under 5.0.0; det er `~`, der kun tillader patch.',
        'Uden for materialet: `import … from \'lib.js\'` (FED Modules.pdf s. 5) virker ikke direkte i browseren; en relativ sti kræver `./lib.js`. Bundlere som Vite løser det for en.',
      ],
      keywords: ['JavaScript', 'ECMAScript', 'ES2015', 'typeof', 'var', 'let', 'const', '===', '==', 'truthy', 'falsy', 'nullish coalescing', '??', 'optional chaining', '?.', 'hoisting', 'scope', 'lexical scoping', 'closure', 'function expression', 'function declaration', 'arguments', 'object literal', 'prototype chain', 'array', 'Date', 'ES modules', 'import', 'export', 'export default', 'CommonJS', 'require', 'npm', 'package.json', 'node_modules', 'Node.js', 'Yarn', 'pnpm'],
    },

    {
      slug: 'dom-events',
      title: 'DOM’en og events (også i React)',
      short: 'DOM og events',
      week: 'Uge 8 og 11 · L15, L21',
      definition:
        'DOM’en er browserens træ af objekter for dokumentet; JavaScript kan finde, ændre og lytte på dets noder. Et event går i **capture phase** fra `window` ned til målet, rammer **target** og **bobler** op igen. React lægger sine egne *synthetic events* oven på samme model.',
      concepts: [
        {
          term: 'DOM-træet',
          body: [
            'Hvert `window` har en `document`-property, og hvert tag i dokumentet er en node i et hierarki med `html` som rod. Noder har `parentNode`, `childNodes`, `firstChild`/`lastChild` og `nextSibling`/`previousSibling`; `nodeType` er 1 for element-noder og 3 for tekstnoder.',
            'At navigere med `childNodes` er omstændeligt og skrøbeligt, så man finder elementer med `getElementById`, `getElementsByTagName`, `getElementsByClassName` eller `querySelector`/`querySelectorAll`, der tager en CSS-selector; `querySelector` giver det første match eller `null`.',
            'Indhold ændres med `innerHTML` eller `appendChild`, `insertBefore`, `replaceChild` og `removeChild`. En node kan kun findes ét sted: indsætter man en eksisterende node et nyt sted, **flyttes** den. Nye noder laves med `createElement` og `createTextNode`, attributter med `setAttribute`/`getAttribute`. CSS sættes via `style` i camelCase (`backgroundColor`), men renere er at skifte `className` og lade CSS-filen bestemme udseendet.',
          ],
        },
        {
          term: 'JavaScript på siden og unobtrusive JavaScript',
          body: [
            'JavaScript kan stå som event-attribut på et element, i et `<script>`-element eller i en ekstern fil (`<script src="url">`). Mens browseren henter og kører en ekstern fil, pauser den sidens behandling; med `defer` bygges DOM’en færdig først, og scriptene kører bagefter i den angivne rækkefølge. Koden kører i en **sandbox** og kan kun røre sin egen side.',
            'Et event-navn som `click` svarer til handler-attributten `onclick`. At skrive `onmouseover="alert(…)"` i markup kalder slides *obtrusive* og “not recommended”: det blander præsentation og logik. **Unobtrusive** JavaScript registrerer i stedet handleren i koden med `addEventListener("mouseover", …)`.',
          ],
        },
        {
          term: 'Event-objekt, bubbling og default actions',
          body: [
            'En handler får et **event-objekt** med, hvis indhold afhænger af event-typen — ved `mousedown` fortæller det fx, hvilken museknap der blev brugt. Et uhåndteret event **bobler** udad: klikker man på et link i et afsnit, prøves linkets handlers først, så afsnittets, så `document.body`’s, og til sidst håndterer browseren det. `stopPropagation()` forhindrer handlers “længere oppe” i at modtage eventet.',
            'Mange events har en **default action**: et klik på et link fører til linkets mål. Handlers kaldes, før default-adfærden udføres, og `preventDefault()` stopper den. Ikke alt kan opsnappes — i Chrome kan Ctrl-W ikke håndteres af JavaScript.',
            'Også web workers taler via events: hovedprogrammet sender med `postMessage()` og lytter på `message`-eventet. JavaScript i browseren er ellers hovedsageligt single threaded.',
          ],
        },
        {
          term: 'De tre faser',
          body: [
            'L21-slides viser hele forløbet for et klik på en `<button>` i træet `window → document → <html> → <body> → <header> → <nav> → <button>`. **1. Capture phase**: eventet sendes til `window`, `document`, `<html>`, `<body>`, `<header>` og `<nav>`. **2. Target phase**: knappens capture listener, derefter dens bubble listener. **3. Bubbling phase**: `<nav>`, `<header>`, `<body>`, `<html>`, `document`, `window`.',
            'Standard er bubble listeners. En capture listener registreres med `element.addEventListener("click", onClick, { capture: true })`. React Quickly (1. udg.) beskriver de samme tre faser og kalder capture “trickle down”.',
          ],
        },
        {
          term: 'Events i React',
          body: [
            'React-events hedder camelCase (`onClick`), og man giver en **funktion**, ikke en streng. Funktionen skal *sendes*, ikke *kaldes*: `onClick={handleClick()}` kører `handleClick` under rendering og sætter returværdien som handler. Konventionen er `handle` + eventnavn, defineret inde i komponenten; korte handlers kan skrives inline som arrow function. React tilføjer og fjerner selv listeneren, når komponenten mounter og unmounter.',
            'React lytter globalt: den lægger én click-listener, observerer alle elementer og kalder din `onClick` med et **React event** (et *synthetic event*), hvis API bygger på HTML-specifikationens. Det har altid `target` og `type`; et mouse event har desuden `clientX`/`clientY`, `pageX`/`pageY`, `ctrlKey`, `shiftKey` og `button`. Bogen nævner også `currentTarget`, `nativeEvent`, `stopPropagation()` og `preventDefault()`.',
            'Events bobler også i React: slidesens kontaktformular har `onFocus` på to fieldsets og ét `onBlur` på selve formen i stedet for en handler pr. input. Capture får man med suffikset `Capture`: `<main onClickCapture={handler1} onClick={handler4}>` rundt om `<button onClickCapture={handler2} onClick={handler3} />`. Slidet siger ikke rækkefølgen, men følger man faserne fra s. 13, kører handler1 (capture på `main`), handler2 og handler3 (target) og til sidst handler4 (bubbling). “Capture handlers are rare!!!”',
            'En `<button>` inde i en `<form>` submitter formen og genindlæser siden — også uden inputs og uden target-URL. `e.preventDefault()` i handleren forhindrer det. Se [[react-forms|formularer i React]].',
          ],
        },
        {
          term: 'Handler generators og events uden for React',
          body: [
            'Varierer mange handlers kun lidt, kan de genereres: `const update = (delta) => () => setCounter((c) => c + delta)`. Her *skal* `update(1)` kaldes i JSX’en, for kaldet returnerer handleren — det er en [[javascript|closure]] over `delta`, ikke fejlen fra før.',
            'React’s event-system dækker kun elementer i React-træet. Til `window` og `document`, elementer uden for appen, ikke-DOM-objekter (request, socket), ét enkelt event eller betingede lyttere går man uden om det: `window.addEventListener("resize", onResize)` i en [[useeffect|useEffect]], hvis cleanup-funktion kalder `removeEventListener`. Bogen (1. udg.) gør det samme med `componentDidMount`/`componentWillUnmount` og advarer om memory leaks fra glemte listeners.',
          ],
        },
      ],
      viz: 'event-propagation',
      keyPoints: [
        'Find elementer med `getElementById` eller `querySelector`; skift `className` frem for at sætte `style` direkte.',
        'Unobtrusive: `addEventListener` i koden, ikke `onclick` i markup.',
        'Tre faser: capture (ned), target, bubbling (op). Standard er bubble listeners — også i React.',
        '`stopPropagation()` stopper handlers længere oppe; `preventDefault()` stopper browserens default action.',
        'React: `onClick={handleClick}` — send funktionen, kald den ikke.',
        'Listeners på `window` registreres i `useEffect` og fjernes i cleanup.',
      ],
      code: [
        {
          lang: 'html',
          title: 'Unobtrusive JavaScript: ingen event-kode i markup',
          source: 'FED The DOM.pdf s. 22',
          code: `<body>
  <!-- button has no event wire up code -->
  <a id="homelink" href="home.htm">Home</a>

  <script>
    document.getElementById("homelink")
            .addEventListener("mouseover", function () {
      alert('Click to go home');
    });
  </script>
</body>`,
        },
        {
          lang: 'tsx',
          title: 'Capture i React, og preventDefault på en knap i en form',
          source: 'Handling Events in React.pdf s. 14–15',
          code: `<main onClickCapture={handler1} onClick={handler4}>
  <button onClickCapture={handler2} onClick={handler3} />
</main>

// ...
<form>
  <button onClick={onClick}>
    Click me</button>
</form>

const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    console.log("Button was pressed");
  }`,
        },
        {
          lang: 'jsx',
          title: 'Lyt på window uden for React — og ryd op',
          source: 'Handling Events in React.pdf s. 18',
          code: `export function WindowSize() {
  const [size, setSize] = useState(getWindowSize());
  useEffect(() => {
    const onResize = () => setSize(getWindowSize());
    console.log('useEffect called')
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [setSize]);
  return <h1>Window size: {size}</h1>;
}`,
        },
      ],
      exam: [
        'Et klik starter i capture phase fra `window` ned til knappen, rammer target og bobler så op igen. React registrerer handlers som bubble listeners; vil jeg have capture, skriver jeg `onClickCapture`.',
        'Alle eksamenssættene har en formular, der opretter noget — en booking, en vane, en eksamen eller en vittighed. En knap i en form submitter og genindlæser siden, så jeg kalder `e.preventDefault()` i handleren, før jeg sender data med fetch.',
        'Jeg sender funktionen til `onClick`, ikke resultatet af et kald. Skal flere knapper gøre næsten det samme, laver jeg en event handler generator som `update(1)`, der returnerer handleren.',
        'React’s event-objekt er et synthetic event med samme API som browserens: `target`, `type`, `preventDefault()` og `stopPropagation()`. React lytter selv globalt og kalder min handler.',
        'Skal jeg lytte på `window`, fx `resize`, gør jeg det i `useEffect` og fjerner listeneren igen i cleanup-funktionen, ellers hober listeners sig op.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L15.4_The_DOM.md'), original: 'L15/FED The DOM.pdf', pages: 's. 3–35' },
        { path: ctx('slides/SW4FED-02_L15.1_JavaScript.md'), original: 'L15/FED JavaScript.pdf', pages: 's. 40–44', note: 'JavaScript på en webside, `defer`' },
        { path: ctx('slides/SW4FED-02_L21.1_Handling_Events_i_React.md'), original: 'L21/Handling Events in React.pdf', pages: 's. 2–18' },
        { path: ctx('book/React_Quickly_1ed_Ch06_Handling_events_in_React.md'), original: 'React Quickly, 1. udg., kap. 6', pages: 'afsn. 6.1.1–6.1.3 (s. 114–124), 6.2 (s. 131–133)' },
        { path: ctx('labs/SW4FED-02_Lab15_JavaScript.md'), original: 'L15/Lab15-JavaScript.pdf', pages: 's. 1' },
      ],
      gaps: [
        'DOM-slides (FED The DOM.pdf s. 24) beskriver kun bubbling. Capture-fasen kommer først i Handling Events in React.pdf s. 13 og i React Quickly (1. udg.) afsn. 6.1.1.',
        'Slides siger, at React lægger “a global click listener” (Handling Events in React.pdf s. 10), men ikke hvor. Bogen (1. udg., React v15) siger `document`. Uden for materialet: fra React 17 lægges listeneren på appens rod-container.',
        'Bogens event pooling og `event.persist()` (afsn. 6.1.3) gælder gamle React-versioner. Uden for materialet: pooling blev fjernet i React 17. Bogens class components med `bind(this)` findes ikke i kursets funktionelle komponenter.',
        'Slides (L21) henviser til React Quickly, 2. udgave, kap. 8. Materialet har kun 1. udgave, hvor emnet er kap. 6.',
        'FED The DOM.pdf s. 23 bruger `event.which`. Uden for materialet: `which` er forældet; `button`, som L21 s. 9 nævner, er standarden.',
        'Kontaktformularen (Handling Events in React.pdf s. 11–12) viser `onFocus`/`onBlur`, der bobler. Uden for materialet: native `focus` og `blur` bobler ikke; React bruger `focusin`/`focusout` bag kulisserne.',
      ],
      keywords: ['DOM', 'Document Object Model', 'document', 'node', 'nodeType', 'getElementById', 'querySelector', 'querySelectorAll', 'innerHTML', 'appendChild', 'createElement', 'setAttribute', 'className', 'defer', 'addEventListener', 'removeEventListener', 'unobtrusive JavaScript', 'event object', 'event bubbling', 'capture phase', 'target phase', 'stopPropagation', 'preventDefault', 'default action', 'synthetic event', 'SyntheticEvent', 'onClick', 'onClickCapture', 'event handler', 'event handler generator', 'event delegation', 'web worker', 'postMessage'],
    },

    {
      slug: 'promises-fetch',
      title: 'Promises, fetch og JSON',
      week: 'Uge 10 · L19 (JSON: fil L18.2)',
      definition:
        'En **Promise** repræsenterer en operation, der ikke er færdig endnu, men forventes i fremtiden; den ender *fulfilled* med en værdi eller *rejected* med en fejl. `fetch` er browserens globale funktion til HTTP-kald og returnerer en Promise. Svaret er typisk **JSON**.',
      intro: [
        'En SPA henter alle data efter første sideindlæsning via netværkskald i stedet for page reloads (se [[web-arkitektur|web-arkitektur]]). I Opgave 2 i alle eksamenssæt er modparten en lokal json-server — se [[react-fetch|datahentning i React]] for, hvordan kaldene lægges i komponenterne.',
      ],
      concepts: [
        {
          term: 'Promise, executor, then og catch',
          body: [
            '`new Promise(function (resolve, reject) { … })`: **executoren** kører med det samme og får `resolve` og `reject`. Den forventes at sætte asynkront arbejde i gang og derefter kalde `resolve` med den endelige værdi eller `reject`, hvis noget gik galt. Navnene er frie — slides bruger også `succeed` og `fail`, fx når en callback-baseret `XMLHttpRequest` pakkes ind i en Promise.',
            '`p.then(onFulfilled, onRejected)` registrerer callbacks for de to udfald; `p.catch(onRejected)` svarer til `then(undefined, onRejected)`. Begge returnerer en ny Promise. Koden efter kaldet kører videre med det samme — “Can’t know if promise has finished yet…” — og den eneste måde at køre kode *efter* en Promise er via `then`.',
          ],
        },
        {
          term: 'Chaining, Promise.all og allSettled',
          body: [
            'Fordi `then` returnerer en Promise, kan kald kædes: den næste `then` får returværdien fra den forrige (1 bliver til 2), mens en separat `then` direkte på den oprindelige Promise stadig får 1. En `return Promise.reject(\'oh, no!\')` springer frem til `catch`, og efter en `catch` er kæden **genoprettet**: den næste `then` kører success-grenen.',
            '`Promise.all` fulfilles med et array af alle værdierne eller rejectes med den første fejl. `Promise.allSettled` venter, til alle er *settled*, uanset udfald.',
          ],
        },
        {
          term: 'async og await',
          body: [
            'En `async` funktion er en genvej til en funktion, der returnerer en Promise: `return \'TEST\'` svarer til `Promise.resolve(\'TEST\')`, og `throw \'Error\'` til `Promise.reject(\'Error\')`. `await` venter på en Promise og giver dens værdi; ifølge slides kan det kun bruges i async-funktioner, så udenfor skal man stadig bruge `then`. Rejectes en awaited Promise, bliver det en exception, som fanges med almindelig `try`/`catch`.',
            'Awaiter man hvert kald med det samme, kører de efter hinanden. Starter man kaldene først og awaiter de gemte Promises bagefter, kører de samtidig. Fetch-slides viser det med tre kald på 400, 300 og 200 ms: sekventielt ca. 900 ms, med `Promise.all` ca. 400 ms. Samme idé som [[async-await|async/await i C#]].',
          ],
        },
        {
          term: 'fetch: GET, POST og fejl',
          body: [
            'Default-metoden er **GET**. Modtager man JSON, skal man huske `response.json()`, som også returnerer en Promise. Slides tjekker selv `response.ok` og kaster en fejl, hvis status ikke er ok, og lægger kaldet i en `try`-blok (eller afslutter kæden med `.catch`).',
            '**POST** kræver `method: \'POST\'`, `body: JSON.stringify(data)` og headeren `\'Content-Type\': \'application/json\'`; PUT har samme form (“// or \'PUT\'”). Øvrige options er bl.a. `mode: \'cors\'`, `credentials`, `cache` og `redirect`. `fetch` er indbygget, har Promises og en kort syntaks; `XMLHttpRequest` er den gamle callback-API, og axios gør ifølge slides bundlen større, men kan være lidt lettere at arbejde med.',
            'Slidesene viser en studerendes mail (FED Fetch.pdf s. 11): `console.log("this is in the array" + response)` skriver `undefined`, selvom Network-fanen viser 204 (preflight) og 200. Slidet giver ikke svaret, men koden rammer to af de andre slides: `console.log` står *efter* `.then(…)` og kører, før callbacken har sat `response` (Promises s. 7), og callbacken får Response-objektet, fordi der aldrig kaldes `.json()` (Fetch s. 5).',
          ],
        },
        {
          term: 'Autentificering med JWT',
          body: [
            'Tre måder: **API keys** (et ClientID fra udbyderen), **cookies** (serveren holder state, browseren sender dem automatisk) og **security tokens**, ofte JWT: signerede claims med en server-genereret signatur (`HMACSHA256(secret, base64UrlEncode(header) + "." + base64UrlEncode(payload))`). Web-appen skal selv gemme tokenet og selv sætte det i headeren på hver request.',
            'Flowet: en GET uden token giver 401; klienten POSTer brugernavn og password og får 200 med et bearer token; næste GET med tokenet giver 200. “No data is stored by the server.” Klienten gemmer typisk `token.jwt` i `localStorage` og lægger `\'Authorization\': \'Bearer \' + token` på med en wrapper som `fetchWithAuth`. Serversiden står i [[bad/jwt|JWT i BAD]].',
          ],
        },
        {
          term: 'JSON',
          body: [
            'JSON (RFC 8259) er et letvægts, sproguafhængigt tekstformat baseret på et subset af JavaScript. Det er bygget af to strukturer — en samling af name/value-par og en ordnet liste — og seks datatyper: **number** (ingen forskel på heltal og kommatal, ingen `NaN`), **string** i dobbelte anførselstegn, **boolean**, **array**, **object** og **null**. Browseren har `JSON.parse()` og `JSON.stringify()` (ES5).',
            'JSON har ingen datotype. Slides anbefaler det format, `Date`’s `toJSON` giver — `2012-04-23T18:25:43.511Z` (ISO 8601): læsbart, sorterer korrekt og har brøkdele af sekunder. Alternativet er et unix timestamp; JavaScript regner i millisekunder, de fleste andre sprog i sekunder, deraf `Date.now() / 1000`. JSON5 tillader kommentarer, trailing commas og nøgler uden anførselstegn, men understøttes ikke overalt. På .NET-siden styrer `JsonNamingPolicy.CamelCase` og `PropertyNameCaseInsensitive` navnene — relevant, når [[maui-data|MAUI-appen]] læser samme JSON.',
          ],
        },
      ],
      viz: 'promise-fetch',
      keyPoints: [
        'En Promise ender fulfilled eller rejected; koden efter kaldet kører videre med det samme.',
        '`then` returnerer en ny Promise, så kald kan kædes; efter en `catch` er kæden genoprettet.',
        '`async` gør returværdien til en Promise; `await` pakker den ud, og en rejection bliver en exception til `try`/`catch`.',
        '`fetch` er GET som default. Tjek `response.ok`, og kald `response.json()` for at få data.',
        'POST/PUT: `method`, `body: JSON.stringify(data)` og `Content-Type: application/json`.',
        'Uafhængige kald startes først og awaites bagefter — eller samles i `Promise.all`.',
      ],
      code: [
        {
          lang: 'javascript',
          title: 'Chaining: catch genopretter kæden',
          source: 'FED Promises.pdf s. 6',
          code: `var p1 = new Promise(function (resolve, reject) {
    resolve('Success');
});

p1.then(function (value) {
    console.log(value); // "Success!"
    return Promise.reject('oh, no!');
}).catch(function (e) {
    console.log(e); // "oh, no!"
}).then(function () {
    console.log('after a catch the chain is restored');
}, function () {
    console.log('Not fired due to the catch');
});`,
        },
        {
          lang: 'javascript',
          title: 'GET med .then, response.ok og catch',
          source: 'FED Fetch.pdf s. 7',
          code: `fetch('./api/some.json')
  .then(response => {
      if (!response.ok) {
        throw new Error('Network error. Status Code: ' + response.status);
      }
      return response.json()
  })
  .catch(err => {
    console.log('Fetch Error :-S', err);
  });`,
        },
        {
          lang: 'javascript',
          title: 'POST med await',
          source: 'FED Fetch.pdf s. 8',
          code: `// Obs: no error handling!
async function post(url, data) {
    let response = await fetch(url, {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    return await response.json();
}`,
        },
      ],
      exam: [
        'I alle fire eksamenssæt skal Opgave 2 persistere via json-servers REST API. Jeg henter med GET, opretter med POST og retter med PUT — med `JSON.stringify` på body og `Content-Type: application/json`.',
        'Søgning laver jeg med en query string, som hintet i sommersættet 2024 foreslår: `GET /appointments?licensePlate=AL12345`.',
        '`fetch` returnerer en Promise, og koden efter kaldet kører videre med det samme. Derfor awaiter jeg i en async-funktion, tjekker `response.ok` og kalder `response.json()` for at få data ud.',
        'Datoer gemmer jeg som ISO 8601-strenge som `2012-04-23T18:25:43.511Z`, det format `Date` giver med `toJSON`. Det er også formatet i `HabitEntries` i vintersættet 2024, og det sorterer korrekt.',
        'Med JWT POSTer klienten brugernavn og password, gemmer tokenet i localStorage og sender det i `Authorization: Bearer`-headeren; serveren gemmer ingen session. Vintersættets proof-of-concept har ingen token — der validerer frontenden selv password mod json-server.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L19.1_Promises.md'), original: 'L19/FED Promises.pdf', pages: 's. 1–17' },
        { path: ctx('slides/SW4FED-02_L19.2_Fetch.md'), original: 'L19/FED Fetch.pdf', pages: 's. 2–17' },
        { path: ctx('slides/SW4FED-02_L18.2_JSON.md'), original: 'L18/FED JSON.pdf', pages: 's. 3–7, 13–17' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 3' },
        { path: ctx('kode/SW4FED-02_Eksamen_2024_Sommer_bilag1.md'), original: 'L28/SW4FED-02 2024 Sommer bilag1.txt' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 4–6' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 4–6' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 3' },
      ],
      gaps: [
        'Slides bruger ikke ordet *pending*; tilstanden før afgørelsen beskrives kun som “an operation that hasn’t completed yet” (FED Promises.pdf s. 1). Uden for materialet: de tre tilstande hedder pending, fulfilled og rejected.',
        'Slides tjekker `response.ok` manuelt (FED Fetch.pdf s. 6–7) uden at sige hvorfor. Uden for materialet: `fetch` afviser kun ved netværksfejl; en 404 eller 500 lander i `then`.',
        'Ingen slides eller labs viser et PUT-, PATCH- eller DELETE-kald — kun som kommentarer (FED Fetch.pdf s. 9–10). Lab 22 (lab 3: ret en karakter) og sommersættet 2024 (“ret aftale”) kræver det.',
        'Fejl i slidekoden: `throw new error({…})` med lille e (FED Fetch.pdf s. 6) giver en ReferenceError; `postProduct` bruger `await` uden `async` (s. 8); på s. 10 står `.catch` før den sidste `.then`, så en fejl også ender i “Success: undefined”.',
        'Markdown-konverteringen forklarer mailen på FED Fetch.pdf s. 11 med, at en 204 ikke har nogen body. Skærmbilledet viser, at 204-linjen er en *preflight*, og at det egentlige kald gav 200 med data; se forklaringen ovenfor.',
        '“`await` kan kun bruges i async functions” (FED Promises.pdf s. 15), men FED Modules.pdf s. 7 viser `await import(…)` uden async-funktion. Uden for materialet: top-level `await` er tilladt i ES modules.',
        'FED JSON.pdf s. 14 siger, at unix timestamps kun dækker 1970–2038 (32 bit). Uden for materialet: grænsen gælder sekunder i et 32-bit heltal; JavaScripts millisekunder i en double har ikke den grænse.',
      ],
      keywords: ['Promise', 'executor', 'resolve', 'reject', 'then', 'catch', 'fulfilled', 'rejected', 'settled', 'pending', 'chaining', 'Promise.all', 'Promise.allSettled', 'async', 'await', 'try/catch', 'fetch', 'AJAX', 'XMLHttpRequest', 'axios', 'response.ok', 'response.json', 'GET', 'POST', 'PUT', 'Content-Type', 'JSON', 'JSON.parse', 'JSON.stringify', 'ISO 8601', 'unix timestamp', 'JSON5', 'JWT', 'Bearer', 'Authorization', 'localStorage', 'json-server', 'query string'],
    },

    {
      slug: 'typescript',
      title: 'TypeScript',
      week: 'Uge 10 · L20 (fil L25)',
      definition:
        'TypeScript er et **typed superset** af JavaScript fra Microsoft, der kompilerer til almindelig JavaScript. Typerne tjekkes i editoren og af compileren og fjernes derefter — de giver verifikation og hjælp, “but not hard guarantees”.',
      intro: [
        'Slidesens argument: JavaScript blev lavet til programmer på “a few hundred lines of code” (Netscape, 1995), men efter Atwood’s Law — “Any application that can be written in JavaScript, will eventually be written in JavaScript” — bruges det nu til store enterprise-projekter. TypeScript er “a language for large scale JavaScript development”: JavaScripts gode dele plus et typesystem (`Cup<T>`) plus værktøjer.',
      ],
      concepts: [
        {
          term: 'Livscyklus og tsc',
          body: [
            'Slidesens livscyklus har tre trin. **TypeScript**-kilden får *design time checks* i editoren og driver *development tools*. **Compileren** laver *compile time checks*. Outputtet er **JavaScript** — *idiomatic JavaScript* — der kører i en web page eller i node.js. Typerne giver altså værdi to gange, før koden kører, og findes ikke i runtime.',
            'Compileren installeres med `npm install -g typescript` (eller Visual Studios web workload) og køres med `tsc fileName.ts`. Afhængigt af module target genererer den kode til CommonJS (Node.js), AMD (require.js), UMD, SystemJS eller ES2015-moduler — se [[javascript|moduler]].',
          ],
        },
        {
          term: 'Typesystemet',
          body: [
            '**Structural typing** og **type inference**: “In practice very few type annotations are necessary”. Det er typens form, ikke dens navn, der afgør, om to typer passer sammen, og typer udledes af konteksten.',
            '**Generics** øger typesystemets nøjagtighed og udtrykskraft. Eksisterende JavaScript-biblioteker kan få typer via **declaration files**, der skrives og vedligeholdes separat; DefinitelyTyped er repository’et for dem, og `@types/react` indeholder typerne til React’s hooks.',
          ],
        },
        {
          term: 'Annotationer, classes og interfaces',
          body: [
            '`function greeter(person: string)` bliver til `function greeter(person)` — den eneste forskel er, at `: string` er væk. I det større eksempel genererer compileren selv `this.firstName = firstName` ud fra `public firstName` i konstruktørens parameterliste, og `interface Person` er **helt forsvundet** i outputtet.',
            '`Student` skriver aldrig `implements Person`, men kan alligevel sendes til `greeter(person: Person)`, fordi den har `firstName` og `lastName` — structural typing. Slidet om *code hierarchy* viser strukturen: et **module** indeholder classes og interfaces, og en class har fields, constructors, properties og functions. Class- og lambda-syntaksen følger ECMAScript 6.',
            'En **decorator** er en deklaration på formen `@expression`, der hæftes på en class, metode, accessor, property eller parameter og kaldes i runtime. Slides sammenligner den med attributes i C# og viser Angulars `@Component`.',
          ],
        },
        {
          term: 'React med TypeScript',
          body: [
            'Et projekt oprettes med `npm create vite@latest` (eller `create-react-app --template typescript`). To regler fra slides: “You must provide types for your component’s props”, og hver fil med JSX skal have endelsen **`.tsx`**. Props kan types inline (`{ title }: { title: string }`) eller med et `interface`, hvis doc-kommentarer vises i editorens tooltips. `enthusiasmLevel?: number` gør en prop valgfri, og default-værdien sættes i destructuringen.',
            'Hooks får som regel **inferred types**: `useState(false)` giver `boolean`. En **union type** angiver man selv: `type Status = "idle" | "loading" | "success" | "error"` og `useState<Status>("idle")`. En discriminated union (`RequestState`) sikrer, at `data` kun findes, når status er `\'success\'`. Callouts: “Try to avoid any!” og “Provide the type of the received data”.',
            'L21-eksemplerne er også TypeScript: `useRef<HTMLButtonElement>(null)` og `evt: React.MouseEvent<HTMLButtonElement>` — se [[dom-events|events i React]] og [[useref|useRef]].',
          ],
        },
        {
          term: 'Værktøjer mellem C# og TypeScript',
          body: [
            '**Typewriter** er en NuGet-pakke til Visual Studio, der genererer TypeScript-filer fra C#-kode og opdaterer dem, når C#-koden ændres. VS Code-udvidelsen **C# to TypeScript** konverterer et dokument, en markering eller clipboardet. Det er relevant i et fag, hvor den samme datamodel findes både i MAUI-appen (C#) og i React-appen.',
          ],
        },
      ],
      viz: 'ts-compile',
      keyPoints: [
        'TypeScript = JavaScript + typer. Compileren udsender idiomatisk JavaScript.',
        'Typer tjekkes på design time og compile time — aldrig i runtime.',
        'Structural typing: formen afgør kompatibilitet, ikke navnet eller `implements`.',
        'Interfaces forsvinder helt i outputtet.',
        'React: typér props, brug `.tsx`, lad `useState` inferere, og angiv selv union types.',
        'Undgå `any`; angiv typen på de data, du modtager.',
      ],
      code: [
        {
          lang: 'typescript',
          title: 'Class og interface i TypeScript',
          source: 'FED Typescript.pdf s. 17',
          code: `class Student {
    fullName: string;
    constructor(public firstName, public middleInitial, public lastName) {
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
}

interface Person {
    firstName: string;
    lastName: string;
}

function greeter(person : Person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}

var user = new Student("John", "M.", "Doe");
console.log(greeter(user));`,
        },
        {
          lang: 'javascript',
          title: 'Samme kode efter tsc: interfacet er væk',
          source: 'FED Typescript.pdf s. 17',
          code: `var Student = (function () {
    function Student(firstName, middleInitial, lastName) {
        this.firstName = firstName;
        this.middleInitial = middleInitial;
        this.lastName = lastName;
        this.fullName = firstName + " " + middleInitial + " " + lastName;
    }
    return Student;
}());

function greeter(person) {
    return "Hello, " + person.firstName + " " + person.lastName;
}

var user = new Student("John", "M.", "Doe");
console.log(greeter(user));`,
        },
        {
          lang: 'tsx',
          title: 'Typede props og en union type til useState',
          source: 'FED Typescript.pdf s. 21, 23',
          code: `interface MyButtonProps {
  /** The text to display inside the button */
  title: string;
  /** Whether the button can be interacted with */
  disabled: boolean;
}

export function MyButton2({ title, disabled }: MyButtonProps) {
  return (
    <button disabled={disabled}>{title}</button>
  );
}

// ...
type Status = "idle" | "loading" | "success" | "error";

const [status, setStatus] = useState<Status>("idle");`,
        },
      ],
      exam: [
        'TypeScript er et typed superset af JavaScript. Typerne tjekkes i editoren og af compileren og fjernes så — i browseren kører almindelig JavaScript. Derfor giver typerne hjælp og verifikation, men ingen garanti i runtime: data fra json-server er ikke tjekket, bare fordi jeg har skrevet en type.',
        'TypeScript bruger structural typing. En `Student` kan sendes til en funktion, der vil have en `Person`, fordi den har `firstName` og `lastName` — uden `implements`.',
        'I min React-app har komponenternes props et interface, filerne hedder `.tsx`, og data fra json-serveren har en type med felterne fra opgaven — i sommersættet 2024 fx `customerName`, `licensePlate` og `date` fra bilag 1 — så jeg ikke skriver `any`.',
        'Til en tilstand med faste værdier bruger jeg en union type som `"idle" | "loading" | "success" | "error"` med `useState<Status>`, så jeg ikke kan sætte en ugyldig status.',
        'Læringsmål 8 siger “JavaScript eller TypeScript”. Jeg vælger TypeScript, fordi et forkert feltnavn så fanges på compile time i stedet for under demoen.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L25.1_TypeScript.md'), original: 'L25/FED Typescript.pdf', pages: 's. 1–24' },
        { path: ctx('slides/SW4FED-02_L21.1_Handling_Events_i_React.md'), original: 'L21/Handling Events in React.pdf', pages: 's. 8, 15', note: 'TypeScript-typer på refs og events' },
        { path: ctx('kode/SW4FED-02_Eksamen_2024_Sommer_bilag1.md'), original: 'L28/SW4FED-02 2024 Sommer bilag1.txt' },
        { path: ctx('eksamen/SW4FED-02_Eksamensforberedelse.md'), original: 'L28/FED Eksamensforberedelse.pdf', pages: 's. 12', note: 'læringsmål 8' },
      ],
      gaps: [
        'Den vejledende lektionsplan lægger TypeScript i L20 (uge 10); slidefilen hedder L25.1.',
        'Generics nævnes kun som punkt (FED Typescript.pdf s. 13) og i `Cup<T>`-billedet; de eneste eksempler er `useState<Status>` og `useRef<HTMLButtonElement>`. Materialet forklarer hverken `tsconfig.json`, `strict` eller forskellen på `type` og `interface`.',
        'Student-eksemplet (FED Typescript.pdf s. 17) har konstruktørparametre uden typer. Uden for materialet: de bliver implicit `any`, hvilket er en fejl med `noImplicitAny`/`strict`, som Vites TypeScript-skabelon slår til.',
        'Outputtet på s. 17 (klassen som en straks-kaldt funktion) svarer til et ES5-target. Uden for materialet: med et ES2015+-target bevarer tsc `class`-syntaksen.',
        '“Design time checks” vises kun som en label i livscyklussen (s. 10); materialet viser intet eksempel på en typefejl.',
        'Decorators vises kun med Angular (s. 19). React bruger dem ikke.',
      ],
      keywords: ['TypeScript', 'tsc', 'superset', 'type annotation', 'type inference', 'structural typing', 'interface', 'type', 'union type', 'discriminated union', 'generics', 'declaration files', 'DefinitelyTyped', '@types/react', '.tsx', 'props', 'any', 'decorator', 'parameter properties', 'Typewriter', 'Vite', 'compile time', 'design time'],
    },
  ],
}
