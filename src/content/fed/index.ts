import type { Course } from '../types'
import { ctx } from './paths'
import { dotnet } from './p1-dotnet'
import { mauiUi } from './p2-maui-ui'
import { mauiArkitektur } from './p3-maui-arkitektur'
import { htmlCss } from './p4-html-css'
import { jsTs } from './p5-js-ts'
import { reactGrundlag } from './p6-react-grundlag'
import { reactVidere } from './p7-react-videre'

const intro = ctx('slides/SW4FED-02_L01.1_Introduktion_til_kurset.md')

export const fed: Course = {
  id: 'fed',
  code: 'SW4FED-02',
  name: 'Front-end udvikling',
  short: 'FED',
  semester: 4,
  ects: '5 ECTS',
  status: 'ready',
  intro:
    'Programmering af grafiske brugergrænseflader i to spor. Først installerbare apps til computere, tablets og mobiler med C#, .NET og MAUI. Derefter web-apps til browseren med HTML, CSS, JavaScript/TypeScript og React. Del 1–3 er MAUI-sporet, del 4–7 web-sporet; de kan læses hver for sig.',
  introSource: intro,
  exam: {
    form: '24-timers individuel hjemmeopgave, derefter mundtlig prøve (15 min + votering). 7-trinsskala, ekstern censur.',
    quote:
      'Der er en 24-timers take home-eksamen, hvor den studerende individuelt skal løse en konkret problemstilling. Løsningen demonstreres og fremlægges på 15 (20) minutter.',
    quoteSource: intro,
    points: [
      'Opgaven frigives kl. 9 og afleveres før kl. 9 dagen efter som én zip med kode og konfigurationsfiler. Et sekund for sent kræver dispensation fra studienævnet.',
      'Mundtligt: vis studiekort, højst 5 min demo på egen PC, derefter **hvordan** og **hvorfor** med fokus på læringsmålene. Censor og eksaminator afbryder med spørgsmål, ofte om teorien. For hvert “anvende”-mål bør du kunne pege på et sted i din kode.',
      'Alle fire gamle sæt (sommer 2024, vinter 2024/25, sommer 2025, januar 2026) har samme form: **Opgave 1** er en MAUI-app i C#, **Opgave 2** en React-frontend med samme eller beslægtet funktionalitet. UI og arkitektur vælger du selv, og besvarelsen skal “dække så mange læringsmål som muligt”.',
      'Opgave 1 skal altid persistere: SQLite nævnes i alle fire sæt, filer i tre, og json-server via `HttpClient` i tre. Det betyder asynkrone kald ([[async-await|async/await]]), en service bag en ViewModel ([[mvvm|MVVM]]) og registrering i `MauiProgram` ([[di-generic-host|DI]]).',
      'Opgave 2 kører altid mod en lokal **json-server** “som vist i lektion 19 ‘React Fetching data’ samt i lab 22”, og alt indtastet skal persisteres via dens REST-API: `GET` for lister, `POST` for nyt og `PUT`/`PATCH`, når noget rettes. Se [[react-fetch|Datahentning i React]].',
      'Begge opgaver har flere sider eller views med navigation (fx 4 sider i sommer 2024; “React single page application, SPA” i januar 2026): [[navigation|Shell/NavigationPage]] i MAUI og [[react-router|React Router]] på web.',
      'Formularer der opretter og retter poster (booking, vane, eksamen, vittighed), ofte med dato og klokkeslæt, går igen i alle sæt — se [[react-forms|Formularer i React]] og [[controls-layouts|Controls og layouts]].',
      'Søgning og filtrering af gemte data går igen: på nummerplade, navn og dato (`GET /appointments?licensePlate=AL12345`, sommer 2024), på emneord (januar 2026) og historik med gennemsnit (sommer 2025). Sommer 2025 kræver desuden en nedtællingstimer — [[useref|useRef]] og cleanup i [[useeffect|useEffect]].',
      'Forudsætning: 2 obligatoriske gruppeopgaver (2–4 studerende) skal være godkendt. Alle hjælpemidler er tilladt, også generativ AI; genbrugt kode skal have en reference i en kommentar.',
    ],
  },
  goalsSource: intro,
  goals: [
    { text: 'Redegøre for principperne i .NET-frameworket og dets overordnede arkitektur samt beskrive og anvende C#.', topics: ['dotnet-csharp', 'async-await', 'garbage-collection'] },
    { text: 'Anvende kontroller og layout panels til opbygning af grafiske brugergrænseflader.', topics: ['xaml-maui', 'controls-layouts', 'styles-custom-controls'] },
    { text: 'Anvende navigering mellem pages i en applikation.', topics: ['navigation'] },
    { text: 'Anvende dependency injection og det generiske “host builder pattern” til at registrere services og resourcer.', topics: ['di-generic-host'] },
    { text: 'Anvende MVVM-arkitekturen til at implementere applikationer med grafisk brugergrænseflade med C# og XAML.', topics: ['mvvm', 'data-binding'] },
    { text: 'Tilgå data i en database på enheden og tilgå remote data via et web API.', topics: ['maui-data', 'async-await'] },
    { text: 'Redegøre for arkitekturen for en webapplikation.', topics: ['web-arkitektur', 'react-jsx'] },
    { text: 'Designe og implementere webapplikationer med grafisk brugergrænseflade med HTML5, CSS og JavaScript eller TypeScript.', topics: ['html5', 'css-grundlag', 'flexbox-grid', 'responsivt-design', 'javascript', 'dom-events', 'promises-fetch', 'typescript'] },
    { text: 'Anvende et klientside-bibliotek til udvikling af webapplikationer.', topics: ['react-jsx', 'usestate', 'useeffect', 'react-fetch', 'redux', 'vitest'] },
    { text: 'Anvende komponenter til opbygning af en webapplikation.', topics: ['react-jsx', 'usestate', 'react-forms', 'context', 'useref'] },
    { text: 'Anvende client-side routing i en webapplikation.', topics: ['react-router'] },
  ],
  gaps: [
    'Markdown-udgaven af eksamensforberedelsen omtaler “kursets 12 læringsmål”, men lister kun 11. Originalen (L28/FED Eksamensforberedelse.pdf s. 4–15) siger intet om 12: den har én slide pr. mål, 11 i alt, de samme som kursusbeskrivelsen. “12” er konverteringens fejl.',
    'Lektionsnumre i den vejledende plan og i slidefilerne afviger: TypeScript er plan L20, fil L25; useRef plan L21, fil L20; styling plan L25, fil L23; Redux plan L27, fil L26. Emnerne står i planens rækkefølge, kilderne bruger filernes navne.',
    'Kursets React-bog er *React Quickly*, 2. udgave (2023). Materialet har kun 1. udgave (2017), der er skrevet før hooks og bruger class components; hvor den er brugt, står det. Slides er autoritative.',
    'HTML-, CSS- og JavaScript-litteraturen (Flavio Copes’ *HTML handbook* og *CSS handbook*, *The Modern JavaScript Tutorial*) ligger ikke i materialet; web-emnerne bygger på slides og labs.',
    'Redux-forelæsningen findes også som video (L27, 173 MB), der ikke er konverteret. Løsningsforslag og demoprojekter (lab 2, 4, 17, 18, app-state-demo, RedditBrowser) findes kun som zip i `fed/kilde/`.',
    'Materialet viser ingen `PUT`-, `PATCH`- eller `DELETE`-kald — hverken med `fetch` eller `HttpClient` — selvom alle eksamenssæt kræver, at man kan rette data.',
  ],
  parts: [dotnet, mauiUi, mauiArkitektur, htmlCss, jsTs, reactGrundlag, reactVidere],
}
