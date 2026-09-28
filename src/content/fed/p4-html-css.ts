import type { Part } from '../types'
import { ctx } from './paths'

const RQ = 'fed/kilde/react quickly.pdf'
const LAB13 = 'fed/kilde/SW4FED-02 Front-end udvikling (E26.28523PU011.A) - 8242026 - 703 PM (1).zip'

export const htmlCss: Part = {
  id: 'html-css',
  title: 'Web · HTML og CSS',
  topics: [
    {
      slug: 'web-arkitektur',
      title: 'Websites, web apps og SPA',
      short: 'Web-arkitektur og SPA',
      week: 'Uge 7 · L13, uge 8 · L16',
      definition:
        'En webapplikation består af en **klient** (browseren), der anmoder om og viser filer og data, og en **server**, der svarer på HTTP-requests. En **Single Page Application** henter kun ét dokument fra serveren; derefter skifter den view i browseren og taler med serveren med data, typisk JSON fra et REST Web API.',
      intro: [
        'Læringsmål 7 hedder “**Redegøre** for arkitekturen for en webapplikation”. Det er et forklaringsmål: det skal kunne siges til eksamen, ikke kun demonstreres. Selve HTTP-protokollen — URL’ens dele, verber og statuskoder — står i BAD under [[bad/http|HTTP og web-arkitektur]], som bygger på de samme slides. Her handler det om, hvordan delene af en webapp hænger sammen, og hvad en SPA ændrer.',
      ],
      concepts: [
        {
          term: 'Klient, server og statiske filer',
          body: [
            'WWW har fem bestanddele: HTML (markup), URL (notation for at finde filer), HTTP/HTTPS (protokollen), **web serveren**, der “sends a file as a http response when requested”, og **browseren**, der modtager HTML-dokumenter og renderer dem som sider.',
            'Klienten er som regel en browser, der kun er forbundet, når det er nødvendigt; den anmoder om sider, filer eller data og renderer den modtagne HTML. Serveren er konstant forbundet, kører serversoftware (Apache, IIS, **Kestrel** eller Node.js) og svarer med statuskode, side og tilhørende filer eller data.',
            'Til statiske sider behøver man kun en browser. Bruger man et framework som ASP.NET eller PHP, skal der en lokal webserver til under test og debugging.',
          ],
        },
        {
          term: 'Statiske filer fra ASP.NET Core',
          body: [
            'I L13 sættes en ASP.NET Core-app op til kun at servere statiske filer: filerne lægges i `wwwroot`, og `Program.cs` får `app.UseStaticFiles()` og `app.MapFallbackToFile("index.html")`. Slidet siger det selv: “This is all that is needed to serve static files.” `index.html` bliver default-filen (home page). Kestrel er standardserveren; i Visual Studio kan man vælge IIS Express i stedet.',
            'VS Code-versionen starter fra MVC-skabelonen og sletter `Controllers`, `Models` og `Views`; filen ligger så i `wwwroot/html`, og fallback’en peger på `"html/index.html"`. Et alternativ er den node-baserede `http-server`, der serverer den aktuelle mappe på port 8080. Lab 13 bygger JavaJam Coffee House oven på ASP.NET-opsætningen.',
          ],
        },
        {
          term: 'Dynamiske sider og client-side scripting',
          body: [
            'En **dynamisk side** genereres på serveren, når brugeren besøger den (server-side scripting i PHP, C# Razor, Java, Go, JavaScript m.fl.). Den består af en statisk del (HTML) og kode, der genererer resten, fx fra en database. Materialets eksempel: en ejendomsmægler med 500 huse skal lave 500 statiske sider, men kan nøjes med én dynamisk side og en tabel med 500 rækker.',
            '**Client-side scripting** ændrer siden lokalt i browseren som svar på mus, tastatur eller timere; sproget er JavaScript. Med **Ajax/Web API** bruges HTTP til at hente data og services i stedet for hele sider, og alle moderne browsere har `fetch` til asynkrone kald. HTTP-services kan nå browsere, SPA’er, mobile enheder, embedded systemer og desktopapps.',
          ],
        },
        {
          term: 'Single Page Application',
          body: [
            'En SPA er “a single web page, often called a web app”, der kører i browseren og kun henter **ét dokument** fra serveren. Den behøver ikke page reload, brugeren kan skifte view uden at hente en ny side, og den taler typisk JSON med et REST Web API (GraphQL og XML forekommer også). Gmail, Facebook, Trello og Google Maps er slidenes eksempler.',
            '*React Quickly* (1. udg., afsn. 1.5.2) kalder arkitekturen **thick client** og beskriver forløbet i otte trin: brugeren taster en URL; serveren svarer med statiske filer (HTML, CSS, JavaScript), hvor HTML’en kun er et skelet; JavaScript-koden henter data med ekstra requests; data kommer tilbage som JSON; SPA’en renderer UI’et i browseren; nye brugerhandlinger udløser nye datakald. Med browser-routing giver en ny URL en re-render i browseren, ikke et nyt page load. Modstykket er **thick server**, hvor al HTML genereres på serveren. Bogens opsummering: “Only data travels to and from the browser.”',
          ],
        },
        {
          term: 'React-SPA’en i praksis: Vite, bundle og json-server',
          body: [
            'Vite scaffolder appen, kører den lokalt under udvikling (`npm run dev`) og bygger en optimeret produktionsversion med Rollup (`npm run build`, testes med `npm run preview`). Det genererede projekt har `index.html` i roden og koden i `src/` (`main.jsx`, `App.jsx`). En client-side renderet React-app kommer normalt som **ét bundle** fra webserveren; lazy loading deler det op i mindre bundles (code splitting).',
            'React Router-slidene stiller et krav til serveren: den skal servere “the same page at all URLs that are managed client-side by React Router” (se [[react-router|Client-side routing]]). Data kommer fra en anden server: i L19 startes `json-server --watch db.json --port 4001`, og appen henter med `fetch("http://localhost:4001/users")` (se [[react-fetch|Datahentning i React]]). I eksamensopgaverne er der altså to servere: én der leverer appen, og json-server, der leverer data.',
          ],
        },
      ],
      viz: 'web-arkitektur',
      keyPoints: [
        'Fem bestanddele: HTML, URL, HTTP, web server og browser. Klienten spørger, serveren svarer.',
        'En statisk fil sendes uændret. I ASP.NET Core: `wwwroot` + `UseStaticFiles()`; `index.html` er default.',
        'Dynamisk side = HTML genereres på serveren pr. besøg. Client-side scripting = JavaScript ændrer siden i browseren.',
        'SPA: ét dokument og ét JavaScript-bundle; derefter skifter view uden page reload, og kun data (JSON) går over nettet.',
        'Serveren skal levere samme side på alle URL’er, som React Router håndterer.',
        'I eksamensopgave 2 kører appen og json-server (REST API over `db.json`) som to separate servere.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Program.cs: det er alt, der skal til for at servere statiske filer',
          source: 'Serve static files - VS code.pdf s. 4',
          code: `var builder = WebApplication.CreateBuilder(args);
var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseStaticFiles();
app.MapFallbackToFile("html/index.html");

app.Run();`,
        },
        {
          lang: 'bash',
          title: 'Vite: kør under udvikling, byg og test produktionsbuildet',
          source: 'FED React Overview.pdf s. 15–16',
          code: `cd react-demo
npm install
npm run dev

npm run build
npm run preview`,
        },
        {
          lang: 'bash',
          title: 'json-server som lokal data-server (REST over db.json)',
          source: 'FED React fetching data.pdf s. 2',
          code: `npm install -g json-server
json-server --watch db.json --port 4001 --delay 2000`,
        },
      ],
      exam: [
        'En webapp er klient og server, der taler HTTP. I min React-løsning er der to servere: den, der leverer selve appen — `index.html` og JavaScript-bundlet — og json-server, der leverer data som JSON gennem et REST API på sin egen port.',
        'Min app er en SPA: browseren henter ét dokument, og når brugeren går fra “Book ny aftale” til “Vis aftaler”, skifter React Router view i browseren uden page reload. Kun data går frem og tilbage.',
        'I en klassisk dynamisk side genererer serveren HTML ved hvert besøg — materialets ejendomsmægler med 500 huse og én skabelon. I en SPA ligger renderingen i browseren, og serveren leverer statiske filer og data.',
        'Skulle appen serveres fra ASP.NET Core som i L13, ligger filerne i `wwwroot` bag `UseStaticFiles()`, og serveren skal svare med samme side på alle URL’er, routeren styrer — det krav står i React Router-slidene.',
        'Vittighedsopgaven (V25-26) beder eksplicit om en “React single page application, SPA” mod json-server, så jeg skal kunne forklare, hvad der hentes ved første load, og hvad der hentes bagefter.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L13.1_Websites_og_Web_apps.md'), original: 'L13/BED WebSitesAndWebApps.pdf', pages: 's. 3, 15–21, 27' },
        { path: ctx('slides/SW4FED-02_L13.2_Config_Server_for_static_files.md'), original: 'L13/FED Config Server for static files.pdf', pages: 's. 2–10' },
        { path: ctx('slides/SW4FED-02_L13.2b_Serve_static_files_VS_Code.md'), original: 'L13/Serve static files - VS code.pdf', pages: 's. 3–6' },
        { path: ctx('slides/SW4FED-02_L13.3_HTML5_basics.md'), original: 'L13/FED HTML5 basics.pdf', pages: 's. 34', note: 'Node-baseret http-server' },
        { path: ctx('slides/SW4FED-02_L16.1_React_Overview.md'), original: 'L16/FED React Overview.pdf', pages: 's. 11–17' },
        { path: ctx('slides/SW4FED-02_L17.3_React_Router.md'), original: 'L17/FED React Router.pdf', pages: 's. 7, 15', note: 'Samme side på alle client-side URL’er; ét bundle' },
        { path: ctx('slides/SW4FED-02_L19.3_React_fetching_data.md'), original: 'L19/FED React fetching data.pdf', pages: 's. 2–3' },
        { path: RQ, original: 'React Quickly, 1. udg., kap. 1', pages: 'afsn. 1.5.2, s. 18–19 (fig. 1.2 og 1.3)', note: '1. udgave (2017); kursusbeskrivelsen foreskriver 2. udgave' },
        { path: LAB13, original: 'L13/FED Lab 13 HTMLandCSS-basic.pdf', pages: 's. 1', note: 'Delopgave 1: ASP.NET Core til statiske filer. Findes ikke i fed/context/' },
        { path: ctx('eksamen/SW4FED-02_Eksamensforberedelse.md'), original: 'L28/FED Eksamensforberedelse.pdf', pages: 's. 11', note: 'Læringsmål 7' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 3', note: 'Opgave 2: React SPA mod json-server' },
      ],
      gaps: [
        'Slidene forklarer ikke, hvad `app.MapFallbackToFile("index.html")` gør, og forbinder den ikke med React Routers krav om samme side på alle client-side URL’er (React Router s. 7). Uden for materialet: fallback’en svarer med `index.html` på requests, der ikke matcher en statisk fil eller et andet endpoint — netop det, en SPA med client-side routing har brug for.',
        'React Overview s. 16 siger, at `npm run build` lægger buildet i “the build folder”. Uden for materialet: Vite skriver som standard til `dist/`.',
        "Materialet viser ikke, hvordan en app og json-server på hver sin port må kalde hinanden (CORS); L19.2 nævner kun `mode: 'cors'` som fetch-option. Se [[bad/rest|REST og CORS]] i BAD.",
        'Slidene definerer SPA, men beskriver ikke den klassiske multi-page-model som modstykke. Det gør kun *React Quickly* 1. udg. (thick client mod thick server), som ikke er den udgave, kursusbeskrivelsen foreskriver.',
        'Agendaen i WebSitesAndWebApps (s. 2) nævner CSS og Java applets under “Web enhancements”, men ingen slides handler om dem.',
      ],
      keywords: ['SPA', 'single page application', 'multi-page', 'thick client', 'thick server', 'statiske filer', 'static files', 'wwwroot', 'UseStaticFiles', 'MapFallbackToFile', 'Kestrel', 'http-server', 'Vite', 'bundle', 'json-server', 'client-side scripting', 'server-side scripting', 'dynamisk side', 'Ajax', 'Web API'],
    },

    {
      slug: 'html5',
      title: 'HTML5: struktur, tabeller og formularer',
      short: 'HTML5',
      week: 'Uge 7 · L13–L14',
      definition:
        'HTML beskriver et dokuments **logiske struktur** med elementer, som regel et par af opening og closing tags. HTML5 er i dag en *Living Standard* hos WHATWG og tilføjer semantiske strukturelementer, nye input-typer og validering af formularer i browseren.',
      concepts: [
        {
          term: 'Dokumentet: doctype, head og body',
          body: [
            '`<!DOCTYPE html>` øverst angiver HTML5. `head` beskriver dokumentet (`title`, `meta`, `link`, `script`, `style`, `base`); `body` indeholder det, der vises. **Void elements** som `br`, `hr`, `link` og `meta` skal være tomme; `<br/>` er gyldig i både HTML og XHTML, `<br>` kun i HTML. Google anbefaler højst én `h1` pr. side.',
            '**Block elements** (`div`, `p`, overskrifter, lister) optager containerens fulde bredde; **inline elements** (`a`, `span`, `img`) kan stå side om side. Det kan ændres med CSS. Betydningsbærende phrase elements som `strong` og `em` foretrækkes frem for de rent visuelle `b` og `i`. Validér med validator.w3.org, og foretræk MDN, når du søger.',
          ],
        },
        {
          term: 'Semantiske strukturelementer',
          body: [
            'HTML5 har elementer med betydning: `header` (introducerende indhold), `nav` (navigationslinks — ændrer ikke styling), `main` (sidens centrale indhold, kun ét pr. side og ikke inde i `header`, `footer`, `article`, `aside` eller `nav`), `section` (indhold, der hører sammen, fx et kapitel), `article` (selvstændigt indhold som et blogindlæg), `aside` (perifert indhold), `footer`, samt `figure`/`figcaption` og `time`.',
            '`div` er et strukturelt element uden semantisk betydning; brug det kun, hvor ingen af de semantiske elementer passer. ARIA roles som `role="main"` og `role="navigation"` forbedrer tilgængeligheden og er harmløse, hvor de ikke understøttes.',
          ],
        },
        {
          term: 'Tabeller',
          body: [
            'Tabeller er til **tabulære data**: `table`, `tr`, `td`, `th` for overskriftsceller og `caption` for titlen. `colspan` og `rowspan` er strukturelle og bliver i HTML’en; alt andet styles med CSS — `border="1"` er markeret “Use css!”. At bruge en tabel til at lægge en formular ud kaldes “Old approach – Do not use!”.',
            'Tilgængelighed: brug `th` og `caption`. I komplekse tabeller får hver `th` et `id`, og hver `td` peger på sine overskrifter med `headers`. **Row groups** `thead`, `tbody` og `tfoot` giver CSS noget at ramme, fx zebrastriber med `tr:nth-of-type(even)`.',
          ],
        },
        {
          term: 'Formularer: action, method og name',
          body: [
            'En formular modtager input og sender det til serveren, når brugeren trykker submit; som standard genindlæses siden bagefter, men “using JavaScript you can alter this behavior”. `action` er den server-side del, der behandler data (path-delen af URL’en). `method="get"` er default og sender data **i URL’en**; `method="post"` sender dem **i request body**.',
            'Submit sender ét `name=value`-par pr. felt — og kun felter med et `name` kommer med. En GET må ikke ændre noget på serveren og bør være **idempotent** (en søgning); en POST ændrer noget hver gang (en bestilling). Radioknapper i samme gruppe deler `name` og har hver sin `value`; `select`/`option` begrænser valget, `datalist` foreslår kun; `button` har `type="submit"`, `"reset"` eller `"button"`.',
          ],
        },
        {
          term: 'Input-typer, validering og tilgængelighed',
          body: [
            'HTML5 tilføjer `type="email"`, `url` og `tel`, som validerer, samt `search`, `range`, `number` (med `min`/`max`), `date` og `file`. En kalenderkontrol ser forskellig ud i hver browser. Valideringsattributterne er `required`, `pattern` (regulært udtryk), `maxlength` og `min`/`max`/`step`. Klientsidevalidering giver en bedre brugeroplevelse, men “does not replace server-side validation, which is still necessary for security and data integrity”.',
            '`label` bindes til sit felt ved at omslutte det eller med `for` = feltets `id`. `fieldset` og `legend` grupperer felter; `placeholder` giver et hint; `tabindex`, `accesskey` og `title` (tooltip, der ved fejl erstattes af fejlbeskeden) hjælper tastatur og skærmlæser. Billeder skal have en `alt`-tekst, der formidler meningen — ikke filnavnet — og `alt=""` for rent dekorative billeder.',
            'Standarden er **WCAG 2.0** med de fire principper **POUR**: Perceivable, Operable, Understandable og Robust. Tilgængelighed gavner også brugere med langsom forbindelse eller gammel computer.',
          ],
        },
      ],
      viz: 'html-form-submit',
      keyPoints: [
        '`<!DOCTYPE html>`; `head` beskriver dokumentet, `body` vises. Block elements fylder bredden, inline elements står side om side.',
        'Semantiske elementer (`header`, `nav`, `main`, `article`, `aside`, `footer`) frem for `div`. Kun ét `main` pr. side.',
        'Tabeller kun til tabulære data: `th`, `caption`, `thead`/`tbody`/`tfoot`. Styling i CSS, ikke med `border="1"`.',
        'Kun felter med `name` sendes. GET lægger data i URL’en og må ikke ændre noget; POST lægger dem i body og ændrer noget.',
        '`required`, `type="email"`, `pattern` og `min`/`max`/`step` validerer i browseren — men erstatter ikke validering på serveren.',
        '`label for` + `id`, `fieldset`/`legend` og `alt`-tekst: tilgængelighed efter WCAG’s POUR.',
      ],
      code: [
        {
          lang: 'html',
          title: 'Formular: action, method og et name på hvert felt',
          source: 'FED Forms in HTML.pdf s. 5',
          code: `<form id="demoform" action="AddToNewsletter" method="post">
   <label for="name">Name</label>
   <input type="text" id="name" name="name" /><br /><br />
   <label for="email">Email</label>
   <input type="text" id="email" name="email" /> <br /><br />
   <input type="submit" value="Send" id="submit"> <input type="reset">
</form>`,
        },
        {
          lang: 'html',
          title: 'Validering i browseren: required, pattern, min/max/step',
          source: 'FED Forms in HTML.pdf s. 36–37, 39',
          code: `<input type="email" required />

<input type="password" id="password" name="password"
       required pattern="[\\w]{8,}" />

<input type="number" name="a-number" min="10" max="50" step="5">`,
        },
        {
          lang: 'html',
          title: 'Tabel med row groups og headers-reference',
          source: 'FED Tables in HTML.pdf s. 14',
          code: `<table> <caption>Time Sheet</caption>
  <thead>
    <tr>
      <th id="day">Day</th>
      <th id="hours">Hours</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td headers="day">Monday</td>
      <td headers="hours">4</td>
    </tr>
    <!-- ... -->
  </tbody>
  <tfoot>
    <tr>
      <td headers="day">Total</td>
      <td headers="hours">18</td>
    </tr>
  </tfoot>
</table>`,
        },
      ],
      exam: [
        'Siden “Book ny aftale” i værkstedsopgaven (sommer 2024) er en formular: hvert felt har en `label` bundet med `for` og `id`, og datoen er `type="date"`. I React sender jeg ikke formularen med `action`, men håndterer submit selv og poster JSON til json-server (se [[react-forms|Formularer i React]]).',
        'Søgningen på nummerplade er en GET: den ændrer intet på serveren, og værdien står i URL’en som query-streng — som opgavens hint `GET /appointments?licensePlate=AL12345`. At oprette en aftale er en POST, fordi den ændrer serverens tilstand.',
        'Klientsidevalidering med `required`, `type="email"`, `pattern` og `min`/`max` giver en bedre brugeroplevelse, fx på e-mail og password ved brugeroprettelsen i habit-trackeren, men materialet understreger, at den ikke erstatter validering på serveren.',
        'Historikken i eksaminator-opgaven (sommer 2025) er tabulære data, så den står i en `table` med `th` i `thead` og holdets gennemsnit i `tfoot`.',
        'Jeg strukturerer siderne med `header`, `nav`, `main` og `footer` i stedet for bare `div`, fordi elementerne bærer betydning, som også hjælpemidler til tilgængelighed kan bruge.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L13.3_HTML5_basics.md'), original: 'L13/FED HTML5 basics.pdf', pages: 's. 2–31' },
        { path: ctx('slides/SW4FED-02_L13.4_HTML5_structural_elements.md'), original: 'L13/FED HTML5 structural elements.pdf', pages: 's. 2–9' },
        { path: ctx('slides/SW4FED-02_L14.2_Tables_i_HTML.md'), original: 'L14/FED Tables in HTML.pdf', pages: 's. 3–15' },
        { path: ctx('slides/SW4FED-02_L14.3_Forms_i_HTML.md'), original: 'L14/FED Forms in HTML.pdf', pages: 's. 4–41' },
        { path: ctx('slides/SW4FED-02_L14.1_Web_Design.md'), original: 'L14/FED Web Design.pdf', pages: 's. 10–11', note: 'Tilgængelighed, WCAG 2.0 og POUR' },
        { path: ctx('slides/SW4FED-02_L13.6_Graphics_i_HTML_og_CSS.md'), original: 'L13/FED Graphics in HTML and CSS.pdf', pages: 's. 25', note: 'alt-tekst' },
        { path: ctx('slides/SW4FED-02_L13.7_Page_Layout.md'), original: 'L13/FED Page Layout.pdf', pages: 's. 22', note: 'ARIA roles' },
        { path: ctx('labs/SW4FED-02_Lab14_JavaJam_03.md'), original: 'L14/Lab14 JavaJam 03.pdf', pages: 's. 1–2', note: 'Menu som tabel; Jobs-formular med action="acknowledge.html" og method="get"' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 3', note: 'Opgave 2: formularer og søgning med query-streng' },
      ],
      gaps: [
        'Forms s. 16 skriver om radioknapper: “There’s always one element checked. The first item is the one checked by default.” Uden for materialet: ingen radioknap er valgt, før én har `checked` eller brugeren vælger; en gruppe uden valg sendes slet ikke med.',
        'Forms s. 6 kalder POST “more secure”. Uden for materialet: data i request body er ikke krypteret — de står bare ikke i URL’en og historikken. Det er HTTPS, der krypterer.',
        'Tables s. 14: koden skriver Total = 18, mens den renderede tabel på samme slide viser 28 (4 + 8 + 8 + 5 + 3).',
        'Materialet viser kun den klassiske submit med `action` og `method`. At en SPA stopper submit og sender data med JavaScript, nævnes kun i én linje (Forms s. 4) og hører til React-delen.',
        'WCAG 2.0 er den version, slidene nævner (Web Design s. 10–11). Uden for materialet: W3C har siden udgivet WCAG 2.1 og 2.2.',
        'Litteraturen til L13–L14, Flavio Copes’ *The HTML handbook*, ligger ikke i materialet; emnet bygger kun på slides og labs.',
      ],
      keywords: ['HTML', 'HTML5', 'doctype', 'head', 'body', 'semantic elements', 'semantiske elementer', 'header', 'nav', 'main', 'section', 'article', 'aside', 'footer', 'div', 'span', 'block', 'inline', 'table', 'thead', 'tbody', 'tfoot', 'colspan', 'form', 'action', 'method', 'GET', 'POST', 'idempotent', 'input', 'label', 'fieldset', 'required', 'pattern', 'validation', 'WCAG', 'POUR', 'alt', 'ARIA'],
    },

    {
      slug: 'css-grundlag',
      title: 'CSS: cascade, specificity og box model',
      short: 'CSS-grundlag',
      week: 'Uge 7 · L13',
      definition:
        'CSS adskiller **style** fra **struktur**. Et stylesheet består af regler med en *selector* og en *declaration* (property og value). Rammer flere regler samme element, afgør **cascaden**, hvem der vinder: den mest specifikke regel, og ved lige specificity den, der står sidst.',
      concepts: [
        {
          term: 'Regler og hvor de står',
          body: [
            'En regel som `body { color: blue }` består af en selector (`body`) og en declaration med property (`color`) og value (`blue`). CSS kan stå fire steder: **inline** i `style`-attributten (gælder kun det element og er “inefficient and inconvenient to maintain”), **embedded** i et `<style>`-element i `head` (gælder hele siden), **external** i en `.css`-fil koblet på med `<link rel="stylesheet">` (kan deles af mange sider) og **imported**, som kurset springer over.',
            'Fordelene: bedre kontrol over typografi og layout, style adskilt fra struktur, potentielt mindre dokumenter og lettere vedligehold.',
          ],
        },
        {
          term: 'Cascaden og specificity',
          body: [
            'Slidets diagram viser cascaden som en trappe: **Browser Defaults → External Styles → Embedded Styles → Inline Styles → HTML Attributes**. Reglen ved siden af: “The more specific rule will win. If two or more rules have the same specificity, the one that appears last wins.”',
            'Hvordan specificity beregnes, viser slidene ikke; de linker kun til en Specificity Calculator. Selectorernes rækkevidde er beskrevet: en element-selector rammer alle elementer af typen, en class en gruppe elementer, og et id **ét** element på siden. Brug class, når stilen kan gælde flere elementer, og id, når den kun gælder ét.',
            'Rækkefølgen betyder også noget inden for ens selectors: anchor-pseudo-classes skrives `:link`, `:visited`, `:hover`, `:active`, og slidet understreger “The order matters!”.',
          ],
        },
        {
          term: 'Selectors, pseudo-classes og pseudo-elements',
          body: [
            'Ud over element, `.class` og `#id` findes **contextual selectors**: descendant `E F` (fx `#footer a`), child `E > F`, next sibling `E + F` og following sibling `E ~ F`. De sparer classes og id’er i HTML’en. **Attribute selectors** matcher på attributter, fx `E[attr=val]` eller `E[attr^=val]`.',
            'En **pseudo-class** beskriver en tilstand: `:hover`, formtilstande som `:valid`, `:invalid` og `:required`, eller placering som `:first-child`, `:nth-of-type(odd)` og `:nth-of-type(3n+1)`. Et **pseudo-element** rammer noget, der ikke er et element i træet: `::first-letter`, `::first-line`, `::before`, `::after`, `::selection`.',
            'Navngiv classes og id’er efter formål (`nav`, `news`, `footer`), ikke efter udseende (`redText`, `bolded`), der bliver misvisende, når designet ændres.',
          ],
        },
        {
          term: 'Enheder og farver',
          body: [
            '`em` og procent er relative til forældrens skriftstørrelse, `rem` til rod-elementet `<html>`. Materialets anbefaling for tilgængelighed er `rem` (eller `em`/procent), fordi brugeren kan forstørre dem. Tommelfingerregler: `px` til tynde borders og skygger, `rem`/`em` til typografi (foretræk `rem`), `%` til responsive containere og billeder, `vh`/`vw` til viewport, `cqh`/`cqw` til container, `pt` kun til print.',
            'Farver kan angives som navn, hex (`#800000` eller kort `#800`), `rgb()`/`rgba()` og `hsl()`/`hsla()`, hvor a’et er gennemsigtighed. `font-family` er en liste, der slutter med en generisk familie som `sans-serif`.',
          ],
        },
        {
          term: 'Box model og box-sizing',
          body: [
            'Hvert element er en boks: **content** inderst, så **padding** (luft mellem indhold og border), **border** og yderst **margin** (tom plads til naboelementerne). Hver side kan sættes for sig; `margin: 20px 10px` betyder top/bund og venstre/højre, fire værdier går top, højre, bund, venstre. Samme syntaks gælder `padding`. En border har som standard bredden 0.',
            'Default er `box-sizing: content-box`: “Actual width = width + border-left + border-right + padding-left + padding-right”. Et element med `width: 25%` og en 6px-border passer derfor ikke fire gange på en række. Med `box-sizing: border-box` presses padding og border ind i boksen, så bredden er præcis den, man satte. Normalize og Bootstrap gør det for dig.',
          ],
        },
        {
          term: 'Normal flow, position, float og display',
          body: [
            '**Normal flow** viser elementerne i kilderækkefølgen: inline-indhold flyder i *inline direction* (vandret), blokke stables i *block direction* (lodret). `position: relative` flytter et element i forhold til, hvor det ellers ville stå — pladsen i flowet forbliver reserveret. `position: absolute` angiver en præcis placering.',
            '`float` lader et element flyde til venstre eller højre, så tekst løber udenom; `clear` afslutter en float, og `overflow: auto` får en container til at omslutte sine floats. `display` bestemmer hvordan og om et element vises: `none`, `block`, `inline`, `flex` og `grid`. En vandret menu laves af en `ul` i `nav` med `display: inline` på `li`.',
          ],
        },
      ],
      viz: 'css-cascade',
      keyPoints: [
        'Regel = selector + declaration. Inline gælder ét element, embedded én side, external mange sider.',
        'Mest specifik regel vinder; ved lige specificity vinder den, der står sidst.',
        'Element-selector: alle af typen. Class: en gruppe. Id: ét element.',
        'Box model udefra: margin → border → padding → content. Med `content-box` lægges padding og border oven i `width`; `border-box` holder bredden.',
        '`rem` til tekst (relativ til `<html>`), `%` til fleksible containere, `px` til tynde borders.',
        'Normal flow stabler blokke og lader inline-indhold flyde; `position`, `float` og `display` bryder mønstret.',
      ],
      code: [
        {
          lang: 'css',
          title: 'Class, id og contextual selector',
          source: 'FED CSS3 basics.pdf s. 26–28',
          code: `.new { color: #FF0000;
       font-style: italic;
     }

#new { color: #FF0000;
       font-size:2em;
       font-style: italic;
    }

#footer a { color: #00ff00; }`,
        },
        {
          lang: 'css',
          title: 'Margin-shorthand og border-box på alle elementer',
          source: 'FED Page Layout.pdf s. 5, 7',
          code: `h1 { margin : 0; }
h1 { margin : 20px 10px; }        /* top og bund, venstre og højre */
h1 { margin : 10px 30px 20px; }   /* top, venstre og højre, bund */
h1 { margin : 20px 30px 0 30px; } /* top, højre, bund, venstre */

*, *:before, *:after {
      box-sizing: border-box;
}`,
        },
        {
          lang: 'css',
          title: 'Anchor-pseudo-classes: rækkefølgen betyder noget',
          source: 'FED CSS3 basics.pdf s. 32',
          code: `a:link {
    color: #FF0000;
}

a:visited {
    color: #00FF00;
}

a:hover {
    color: #FF00FF;
}

a:active {
    color: #0000FF;
}`,
        },
      ],
      exam: [
        'Når flere regler rammer samme element, vinder den mest specifikke; har de samme specificity, vinder den, der står sidst. Derfor er rækkefølgen i stylesheetet ikke ligegyldig — slidet om anchor-pseudo-classes siger det direkte: `:link`, `:visited`, `:hover`, `:active`.',
        'Jeg bruger class til styles, der gælder flere elementer, og id kun til ét element, og jeg navngiver efter formål — `nav`, `footer` — ikke efter udseende som `redText`.',
        'Box model: content, padding, border, margin. Jeg sætter `box-sizing: border-box` globalt, så padding og border ikke gør elementerne bredere end deres `width`.',
        'Jeg bruger `rem` til skriftstørrelser, fordi de er relative til rod-elementet og kan forstørres af brugeren — det er materialets anbefaling for tilgængelighed.',
        'Alle fire eksamenssæt skriver “Du skal selv fastlægge brugergrænsefladen”. Læringsmål 8 handler om at designe med HTML5 og CSS, så jeg skal kunne forklare min egen CSS, ikke kun vise, at siden ser pæn ud.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L13.5_CSS3_basics.md'), original: 'L13/FED CSS3 basics.pdf', pages: 's. 2–38' },
        { path: ctx('slides/SW4FED-02_L13.7_Page_Layout.md'), original: 'L13/FED Page Layout.pdf', pages: 's. 3–21' },
        { path: ctx('slides/SW4FED-02_L13.6_Graphics_i_HTML_og_CSS.md'), original: 'L13/FED Graphics in HTML and CSS.pdf', pages: 's. 2–7', note: 'border og padding' },
        { path: ctx('slides/SW4FED-02_L13.9_CSS_Grid.md'), original: 'L13/FED CSS Grid.pdf', pages: 's. 2–3', note: 'Normal flow, float og relative positioning' },
        { path: LAB13, original: 'L13/FED Lab 13 HTMLandCSS-basic.pdf', pages: 's. 2–3', note: 'Delopgave 3–4: JavaJam med CSS og grafik. Findes ikke i fed/context/' },
        { path: ctx('eksamen/SW4FED-02_Eksamensforberedelse.md'), original: 'L28/FED Eksamensforberedelse.pdf', pages: 's. 12', note: 'Læringsmål 8' },
      ],
      gaps: [
        'Materialet viser ikke, hvordan specificity beregnes; CSS3 basics s. 38 linker kun til en Specificity Calculator. Uden for materialet: specificity tælles som (id’er, classes/attributter/pseudo-classes, elementer); inline style slår alle selectors, og `!important` slår begge. Ingen af delene står i slidene.',
        'Cascade-diagrammet (CSS3 basics s. 5) placerer “HTML Attributes” efter inline styles, hvilket kan læses, som om de vinder. Uden for materialet: præsentationsattributter som `border="1"` tæller som author-regler med specificity 0 og overskrives af al anden author-CSS.',
        'Page Layout s. 11 skriver `left: 200; top: 100; width: 300;` uden enhed — ugyldig CSS, som browseren ignorerer. Slidet siger også, at absolute positionering placerer “in the browser window”. Uden for materialet: placeringen er i forhold til nærmeste positionerede forfader.',
        'Arv (inheritance) — at fx `color` på `body` gælder for alle børn — er ikke forklaret, selv om eksemplerne bygger på det.',
        'Litteraturen til L13, Flavio Copes’ *The CSS handbook* (lektionsplanen: de første 100 sider), ligger ikke i materialet.',
      ],
      keywords: ['CSS', 'cascade', 'specificity', 'selector', 'declaration', 'class', 'id', 'contextual selector', 'descendant', 'pseudo-class', 'pseudo-element', 'nth-of-type', 'box model', 'box-sizing', 'border-box', 'content-box', 'margin', 'padding', 'border', 'normal flow', 'position', 'relative', 'absolute', 'float', 'clear', 'display', 'rem', 'em', 'inline style', 'embedded', 'external stylesheet'],
    },

    {
      slug: 'flexbox-grid',
      title: 'Flexbox og CSS Grid',
      week: 'Uge 7 · L13–L14',
      definition:
        '**Flexbox** lægger items ud langs én akse — en række *eller* en kolonne — og fordeler den ledige plads. **CSS Grid** er et todimensionelt system, hvor items placeres i rækker *og* kolonner, så indholdet flugter i begge retninger.',
      concepts: [
        {
          term: 'Flex container, flex items og akser',
          body: [
            'Et element med `display: flex` (eller `inline-flex`) er en **flex container**; dets børn er **flex items**. Flexbox er “designed for one-dimensional layout”, float-fri, og lader browseren gøre items bredere eller smallere, så de udfylder pladsen.',
            'Alt i flexbox refererer til to akser: **main axis** fra main start til main end, og **cross axis** vinkelret på den. `flex-direction: row | row-reverse | column | column-reverse` bestemmer main axis — med `column` løber den lodret. `flex-wrap: nowrap | wrap | wrap-reverse` afgør, om items må bryde over på en ny linje.',
          ],
        },
        {
          term: 'Justering og rækkefølge',
          body: [
            '`justify-content` fordeler den ledige plads langs **main axis**: `space-evenly`, `space-around`, `flex-end`, `center`. `align-items` placerer items langs **cross axis**; default er `stretch` (fuld højde), `center` centrerer. `align-self` overskriver `align-items` for ét item.',
            '`order` viser items i stigende rækkefølge efter en heltalsværdi; default er 0, og ved lige værdier gælder kilderækkefølgen. Med `order: 1` på første og `order: -1` på sidste item bliver visningen Five, Two, Three, Four, One.',
          ],
        },
        {
          term: 'Fleksible størrelser: grow, shrink og basis',
          body: [
            '`flex-grow` er en enhedsløs andel af den ledige plads; `flex-basis` er startbredden (`auto` eller en længde); `flex-shrink` styrer, hvem der skrumper, når pladsen ikke slår til. Shorthand’en `flex` samler de tre, og kun første værdi er påkrævet.',
            'Materialets eksempel: fem koralfarvede `<p>` med `flex: 1`, hvor “Three” har `flex: 2` inline og bliver cirka dobbelt så bred som de andre.',
          ],
        },
        {
          term: 'Grid: tracks, lines og areas',
          body: [
            '`display: grid` definerer et todimensionelt layout, “optimized for 2-dimensional layouts: those in which alignment of content is desired in both dimensions”. `grid-template-columns: 1fr 1fr 1fr` giver tre lige brede kolonner, og `grid-gap: 20px` luft imellem. Items i samme række får samme højde.',
            'Begreberne: **grid container**, **column track** og **row track** (pladsen mellem to linjer), nummererede **grid lines**, **grid cell** og **grid area** (et rektangel af celler). Med line-based positioning skriver man start- og slutlinje: `grid-column: 1 / 4` spænder over alle tre kolonner.',
            'Med **named areas** tegnes layoutet i `grid-template-areas`: hver streng er en række, hvert navn en kolonne, og `.` er en tom celle. Items placeres med `grid-area: a`. Det gør det let at flytte områderne i en media query uden at røre HTML’en (se [[responsivt-design|Responsivt design]]).',
          ],
        },
        {
          term: 'Hvornår flexbox, hvornår grid',
          body: [
            'Materialets regel: brug flexbox, hvis du kun skal styre layoutet pr. række *eller* kolonne; brug grid, hvis du skal styre pr. række *og* kolonne. Grid-slidets illustration viser forskellen: i flex fordeler hver linje pladsen for sig, så kasserne i to rækker ikke flugter; i grid deler rækkerne kolonnelinjer.',
            'Lab 13 laver JavaJam Coffee House om til et tokolonne-layout (header, nav, main content, billede, footer) to gange: først med flexbox (delopgave 6), derefter med grid (delopgave 7).',
          ],
        },
        {
          term: 'Bootstraps grid-system',
          body: [
            'Bootstrap er et CSS- og JavaScript-UI-framework, oprindelig fra Twitter. Grid-systemet kræver en container: `container` har fast bredde, hvis `max-width` skifter ved hvert breakpoint; `container-fluid` er altid 100 % bred og foretrækkes på slidet.',
            'Layoutet bygges af rækker og kolonner, og kolonnerne i én vandret blok skal summere til **tolv**: tre gange `.col-md-4` giver tre lige brede kolonner fra desktop og op og stables automatisk på mobil. Klasser for flere tiers kan kombineres på samme element, fx `.col-xs-12 .col-md-8`. Breakpoints står under [[responsivt-design|Responsivt design]].',
          ],
        },
      ],
      viz: 'flex-vs-grid',
      keyPoints: [
        'Flexbox = én akse (række eller kolonne). Grid = to akser (rækker og kolonner).',
        '`justify-content` virker langs main axis, `align-items` langs cross axis; `flex-direction: column` gør main axis lodret.',
        '`flex: 1` på alle items og `flex: 2` på ét giver det dobbelt så meget af pladsen.',
        'Grid: `grid-template-columns: 1fr 1fr 1fr` + `grid-gap`; placér med linjenumre (`grid-column: 1 / 4`) eller navngivne areas.',
        '`grid-template-areas`: én streng pr. række, ét navn pr. kolonne, `.` er en tom celle.',
        'Bootstrap: `container` → række → `col-*`; kolonnerne summerer til 12.',
      ],
      code: [
        {
          lang: 'css',
          title: 'Flex container, og items der deler pladsen (Three har style="flex: 2")',
          source: 'FED Flexbox.pdf s. 4, 14',
          code: `.container {
    display: flex;
}

.container > p {
    background-color: coral;
    margin: 0.2em;
    padding: 0.2em;
    flex: 1;
}`,
        },
        {
          lang: 'css',
          title: 'Grid med tre lige brede kolonner',
          source: 'FED CSS Grid.pdf s. 5',
          code: `.container {
  width: 100%;
  border: 5px solid rgb(111, 41, 97);
  border-radius: .5em;
  padding: 10px;
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 20px;
}

.container>div {
  padding: 10px;
  background-color: rgba(111, 41, 97, .3);
  border: 2px solid rgba(111, 41, 97, .5);
}`,
        },
        {
          lang: 'css',
          title: 'Layoutet tegnet med named areas',
          source: 'FED CSS Grid.pdf s. 8',
          code: `.container {
  /* ... */
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-auto-rows: minmax(50px, auto);
  grid-gap: 20px;
  grid-template-areas:
    "a a a"
    "b c c"
    ". . d"
    "e e d";
}
.one {
  grid-area: a;
}
.two {
  grid-area: b;
}`,
        },
      ],
      exam: [
        'Flexbox bruger jeg til ting på én linje, fx navigationen til de fire sider i værkstedsopgaven; grid bruger jeg til sidens overordnede layout, hvor rækker og kolonner skal flugte.',
        'I habit-trackeren (vinter 2024/25) skal der vises en kalender for den seneste måned. Den er todimensional — uger og ugedage — så jeg lægger dagene ud med CSS grid med syv lige brede `fr`-kolonner.',
        '`justify-content` fordeler plads langs main axis og `align-items` langs cross axis. Med `flex-direction: column` løber main axis lodret, så `justify-content` virker lodret.',
        'Med `grid-template-areas` beskriver jeg layoutet som et lille kort i CSS’en og kan flytte områderne i en media query uden at ændre HTML’en.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L13.8_Flexbox.md'), original: 'L13/FED Flexbox.pdf', pages: 's. 2–15' },
        { path: ctx('slides/SW4FED-02_L13.9_CSS_Grid.md'), original: 'L13/FED CSS Grid.pdf', pages: 's. 2–10' },
        { path: ctx('slides/SW4FED-02_L14.4_Bootstrap.md'), original: 'L14/FED Bootstrap.pdf', pages: 's. 2–13' },
        { path: ctx('slides/SW4FED-02_L26.2_Responsive_Web_Design.md'), original: 'L26/Responsive Web Design.pdf', pages: 's. 27', note: 'Flexbox eller grid' },
        { path: LAB13, original: 'L13/FED Lab 13 HTMLandCSS-basic.pdf', pages: 's. 5–7', note: 'Delopgave 6–7: tokolonne-layout med flexbox og med grid. Findes ikke i fed/context/' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 4', note: 'Opgave 2: kalender for den seneste måned' },
      ],
      gaps: [
        'Flexbox s. 13: “the items with the largest flex-shrink value will shrink first”. Uden for materialet: underskuddet fordeles proportionalt efter `flex-shrink` vægtet med `flex-basis`; alle items med en værdi over 0 skrumper samtidig.',
        'Slidene bruger `grid-gap`. Uden for materialet: det nuværende navn er `gap`, som også virker i flexbox; `grid-gap` er et alias.',
        'CSS Grid s. 8 viser kun `grid-area` for `.one` og `.two`; items 3–5 står ikke. `minmax()` bruges uden forklaring, og `repeat()` nævnes ikke.',
        'Bootstrap-slidene blander versioner: v5.1.3 som aktuel (s. 3), CDN-links til 5.0.0-beta3 (s. 7), tier-tabel for v3 og v4 (s. 12) og responsive utilities (`.visible-xs-*`, `.hidden-*`) fra v3 (s. 14). Uden for materialet: Bootstrap 5 har et sjette tier `xxl` (≥ 1400px), og `.visible-*`/`.hidden-*` er erstattet af `d-*`-klasser.',
      ],
      keywords: ['flexbox', 'flex container', 'flex item', 'main axis', 'cross axis', 'flex-direction', 'flex-wrap', 'justify-content', 'align-items', 'align-self', 'order', 'flex-grow', 'flex-shrink', 'flex-basis', 'CSS grid', 'grid-template-columns', 'fr', 'grid-gap', 'gap', 'grid line', 'grid track', 'grid-column', 'grid-template-areas', 'grid-area', 'Bootstrap', 'col-md', 'container-fluid'],
    },

    {
      slug: 'responsivt-design',
      title: 'Responsivt design og styling i React',
      short: 'Responsivt design',
      week: 'Uge 13 · L25–L26 (filer L23.1 og L26.2), uge 7 · L14',
      definition:
        '**Responsive web design** er ét sæt HTML, der tilpasser layoutet til skærmen med **media queries**, et fleksibelt grid (eller flexbox) og fleksible billeder. I React styles komponenterne med almindelige stylesheets via `className`, med `style`-proppen eller med biblioteker som CSS Modules, styled-components, MUI og Tailwind.',
      concepts: [
        {
          term: 'Tre tilgange til mobil-web',
          body: [
            'Materialet nævner tre: **separate URLs** (et mobilsite som `m.jyllands-posten.dk`), **dynamic serving** (samme URL’er, men forskellig HTML og CSS efter user agent) og **responsive web design**, hvor samme site konfigureres med CSS til mobil, tablet og desktop — Googles anbefaling.',
            'Begrundelsen: én URL pr. indhold er lettere at dele og linke til, ingen redirect sparer loadtid, og user agent-baseret redirect er fejlbehæftet. Målene: siden skal kunne læses fra **320 px** og op, der skal kun være én version af hver HTML-fil, og der må aldrig være en vandret scrollbar. Midlerne: media queries, et fleksibelt proportionsbaseret grid (eller flexbox) og fleksible billeder.',
          ],
        },
        {
          term: 'Viewport og media queries',
          body: [
            'Mobile browsere zoomer som standard ud og skalerer siden ned. `<meta name="viewport" content="width=device-width, initial-scale=1.0">` sætter viewportens bredde og startskala. En **media query** tester enhedens egenskaber og peger browseren på styles til netop dem: enten i `<link media="only screen and (max-width: 640px)">` eller som en `@media`-regel i CSS’en. `min-resolution: 2dppx` rammer retina-skærme, og `media="print"` et print-stylesheet.',
            'Materialet har eksempler i begge retninger. Flexbox-navigationen starter bred og overskriver nedad med `max-width: 800px` og `600px`. Grid-eksemplet starter med én kolonne og tilføjer kolonner med `min-width: 500px` og `800px` — samme fem elementer (Header, Sidebar, Content, Sidebar 2, Footer), tre layouts, og HTML’en røres ikke.',
            'De “magiske tal” skal man ikke gætte: brug kendte breakpoints eller Bootstrap/Tailwind. Test mobilvisningen med browserens developer tools (F12).',
          ],
        },
        {
          term: 'Mobile first og breakpoints',
          body: [
            'Tailwind er **mobile-first**: klasser uden præfiks gælder på alle skærmstørrelser, og klasser med præfiks gælder fra breakpointet og op. `text-center sm:text-left` centrerer på mobil og venstrestiller fra 640px. Breakpoints: `sm` 40rem (640px), `md` 48rem (768px), `lg` 64rem (1024px), `xl` 80rem (1280px), `2xl` 96rem (1536px). Bootstrap v4 har tiers `sm` 576px, `md` 768px, `lg` 992px og `xl` 1200px.',
            'Designteknikker til mobil: én kolonne, undgå floats og tabeller til layout, `rem`/`em`/procent til skrift, god kontrast, optimerede billeder og “Skip to Content”. Et mobile friendly site kan læses uden zoom, kræver ingen vandret scroll og har links langt nok fra hinanden. Fleksible billeder laves med `srcset` (1x, 2x …) og `<picture>` med `media` på hver `source`.',
          ],
        },
        {
          term: 'Designprincipper og layout',
          body: [
            'Web Design-slidene giver fire principper: **repetition**, **contrast**, **proximity** og **alignment**. Et site kan være organiseret hierarkisk, lineært eller “random”; et hierarki må hverken være for fladt (mennesker kan holde omkring fire chunks i korttidshukommelsen) eller for dybt (“Three Click Rule”).',
            'Navigationen står samme sted på hver side, typisk foroven eller i venstre side. En wireframe skitserer logo, navigation, indhold og footer før design. Layoutteknikkerne er **ice** (fast bredde), **jello** (centreret, fast eller procentvis bredde) og **liquid** (fylder browseren). Og fra Steve Krug: “Don’t make me think.”',
          ],
        },
        {
          term: 'Styling i React',
          body: [
            'React har selv to måder: almindelige stylesheets, hvor man skriver `className` i stedet for `class`, og `style`-proppen, der tager et JavaScript-objekt, fx `style={{ color: \'red\' }}`, og bliver til inline style. Resten kommer fra tredjepartsbiblioteker.',
            '**CSS Modules**: en fil, der ender på `.module.css`, importeres som et objekt, og klasserne bliver properties, fx `styles.error`. Vite genererer et unikt klassenavn med hash pr. fil, så klasser ikke støder sammen på tværs af komponenter; `composes` kombinerer klasser. **Styled-components** (runtime CSS-in-JS) skriver CSS i tagged template literals og injicerer style-tags ved runtime.',
            'Ulempen ved runtime CSS-in-JS er runtime- og payload-overhead. Slidet citerer en måling fra Spot: 54 ms med Emotion mod 27,7 ms med Sass modules. Alternativet er zero-runtime CSS-in-JS, der udtrækker CSS ved build. **MUI** er et komponentbibliotek (med `CssBaseline` til resets), og **Tailwind** et utility-first framework med klasser som `flex`, `pt-4` og `text-center` direkte i markup.',
          ],
        },
      ],
      viz: 'responsive-breakpoints',
      keyPoints: [
        'RWD = ét sæt HTML + media queries + fleksibelt grid eller flexbox + fleksible billeder.',
        'Uden viewport-meta-tagget zoomer mobilen ud og skalerer siden ned.',
        'Mobile first: basis-CSS’en er til den smalle skærm; `min-width`-queries (eller Tailwinds `md:`) tilføjer layout opad.',
        'Målet: læsbart fra 320 px og aldrig en vandret scrollbar.',
        'React: `className` i stedet for `class`; `style={{ … }}` tager et objekt; CSS Modules giver unikke klassenavne pr. komponent.',
        'Runtime CSS-in-JS koster rendertid (slidets måling: 54 ms mod 27,7 ms med Sass modules).',
      ],
      code: [
        {
          lang: 'html',
          title: 'Viewport-meta-tag og media query på et link-element',
          source: 'Responsive Web Design.pdf s. 10, 22',
          code: `<meta name="viewport" content="width=device-width, initial-scale=1.0">

<link href="lighthousemobile.css" rel="stylesheet"
      media="only screen and (max-width: 640px)">`,
        },
        {
          lang: 'css',
          title: 'Mobile first: grid areas omdefineret ved 500px og 800px',
          source: 'FED CSS Grid.pdf s. 9',
          code: `.container {
  display: grid;   grid-gap: 1em;
  grid-template-areas:
    "header"
    "sidebar"
    "content"
    "sidebar2"
    "footer"
}
@media only screen and (min-width: 500px) {
  .container {
    grid-template-columns: 20% auto;
    grid-template-areas:
      "header header"
      "sidebar content"
      "sidebar2 sidebar2"
      "footer footer";
  }
}
@media only screen and (min-width: 800px) {
  .container {     grid-gap: 20px;
    grid-template-columns: 120px auto 120px;
    grid-template-areas:
      "header header header"
      "sidebar content sidebar2"
      /* ... */`,
        },
        {
          lang: 'jsx',
          title: 'CSS Modules: klasserne importeres som et objekt',
          source: 'React Styling.pdf s. 6',
          code: `import styles from './Button.module.css';
<button className={styles.error}>Error Button</button>

//DOM
<div class="error-5xyn87oq5x"/>`,
        },
      ],
      exam: [
        'Appen skal kunne bruges fra 320 px og op uden vandret scrollbar. Jeg starter med én kolonne og tilføjer kolonner med `min-width`-media queries — mobile first — og viewport-meta-tagget sørger for, at mobilen ikke bare zoomer siden ud.',
        'Med `grid-template-areas` får samme HTML flere layouts. I Lab 23 skulle Teachers-appen have to breakpoints med CSS grid og ét med Tailwind; i eksamensopgaven bruger jeg samme teknik på listen over aftaler.',
        'I React skriver jeg `className`, og med CSS Modules får hver komponent sine egne klasser med et unikt, hashet navn, så de ikke rammer andre komponenter.',
        'Spørger censor til valget af styling: runtime CSS-in-JS som styled-components injicerer styles ved runtime og koster rendertid — materialet viser 54 ms mod 27,7 ms med Sass modules — så jeg foretrækker CSS Modules eller Tailwind.',
        'Designprincipperne kan jeg pege på i min egen UI: samme navigation samme sted på alle sider (repetition), relaterede felter samlet i formularen (proximity) og felter, der flugter (alignment).',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L26.2_Responsive_Web_Design.md'), original: 'L26/Responsive Web Design.pdf', pages: 's. 5–32' },
        { path: ctx('slides/SW4FED-02_L23.1_React_Styling.md'), original: 'L23/React Styling.pdf', pages: 's. 2–13, 24' },
        { path: ctx('slides/SW4FED-02_L13.9_CSS_Grid.md'), original: 'L13/FED CSS Grid.pdf', pages: 's. 9–10' },
        { path: ctx('slides/SW4FED-02_L13.8_Flexbox.md'), original: 'L13/FED Flexbox.pdf', pages: 's. 15', note: 'Responsiv navigation med max-width' },
        { path: ctx('slides/SW4FED-02_L14.4_Bootstrap.md'), original: 'L14/FED Bootstrap.pdf', pages: 's. 9–14' },
        { path: ctx('slides/SW4FED-02_L14.1_Web_Design.md'), original: 'L14/FED Web Design.pdf', pages: 's. 3–9, 19–26, 31–41' },
        { path: ctx('slides/SW4FED-02_L13.6_Graphics_i_HTML_og_CSS.md'), original: 'L13/FED Graphics in HTML and CSS.pdf', pages: 's. 17, 19', note: 'srcset og picture' },
        { path: ctx('labs/SW4FED-02_Lab23_Responsivt_design.md'), original: 'Lab 23 Responsivt design.html', note: 'CSS grid med 2 breakpoints; Tailwind 4.2 med 1 breakpoint' },
      ],
      gaps: [
        'Slidene har media queries med både `max-width` (Flexbox s. 15, RWD s. 22–23) og `min-width` (CSS Grid s. 9), men navngiver ikke forskellen. “Mobile first” forklares kun for Tailwind (RWD s. 32).',
        'Tailwind-breakpoints på RWD s. 31 er fra Tailwind 4 (rem og `width >=`-syntaks); Lab 23 bruger Tailwind 4.2. Materialet viser ikke installationen, kun links (React Styling s. 24).',
        'React Styling s. 10: styled-components-eksemplet skriver `color: blue,` med komma, men viser et resultat med begge deklarationer. Uden for materialet: med komma bliver deklarationen ugyldig.',
        'React Styling s. 6 viser DOM’en som `<div class="error-5xyn87oq5x"/>`, selv om JSX’en er en `button`, og hash-formatet passer ikke med navneformatet `[filename]_[classname]__[hash]` på s. 8.',
        'Lektionsplanens litteratur til L25 og L26 (LogRocket, MDN og Interaction Design Foundation) ligger ikke i materialet.',
      ],
      keywords: ['responsive web design', 'RWD', 'media query', '@media', 'breakpoint', 'mobile first', 'viewport', 'min-width', 'max-width', 'Tailwind', 'Bootstrap', 'srcset', 'picture', 'className', 'style prop', 'CSS Modules', 'styled-components', 'CSS-in-JS', 'MUI', 'design principles', 'wireframe', 'ice', 'jello', 'liquid'],
    },
  ],
}
