import type { Part } from '../types'
import { m } from './paths'

const P1 = '1-SW-Architecture - Process 1.pdf'
const P2 = '2-SW-Architecture - Process 2.pdf'
const D1 = '3-SW-Architecture - Documentation 1.pdf'
const D2 = '4-SW-Architecture - Documentation 2.pdf'

export const arkitektur: Part = {
  id: 'arkitektur',
  title: 'Softwarearkitektur',
  topics: [
    {
      slug: 'arkitekturproces',
      title: 'Softwarearkitektur som proces',
      short: 'Arkitekturproces',
      week: 'Uge 4 · W04.1',
      definition:
        'Softwarearkitektur er de væsentlige beslutninger om et system — med Simon Browns test dem, man ikke kan vende uden en vis indsats: “the things that you’d find hard to refactor in an afternoon”. Som substantiv er arkitektur **struktur (og adfærd)**, som verbum en **proces**. Kurset følger Microsofts iterative femtrinsproces, hvor kravene — især de ikke-funktionelle, formuleret som målbare **quality attributes** — former arkitekturen, og hvor resultatet altid er et kompromis mellem user, business og system.',
      intro: [
        'Casen er **VideoFlix**, en ny streamingtjeneste, der skal vise NetFlix, Hulu og HBO, hvordan det gøres. Øvelse 1–4 (key scenarios og kvantificerede quality attributes) hører til W04.1, øvelse 5 (application overview) til W04.2. Stilene, man vælger imellem i trin 3, står under [[arkitekturstile|architectural styles]], og dokumentationen under [[c4|C4]] og [[views-4plus1|4+1]].',
      ],
      concepts: [
        {
          term: 'Hvad er softwarearkitektur?',
          body: [
            'Der findes ingen kanonisk definition; slidene giver fire citater. Martin Fowler: beslutningerne “that you wish you could get right early”, og mere drillende “the important stuff. Whatever that is.” Simon Brown: alt, der vedrører systemets signifikante elementer, fra kodens struktur og fundament til deployment i et live-miljø. Brown giver også den mest operationelle test: en arkitektonisk beslutning kan ikke vendes uden en vis indsats — den er svær at refaktorere på en eftermiddag. Og arkitektur giver struktur, et fast fundament, vision og teknisk ledelse.',
            'Anekdoterne viser, hvorfor det er svært. Et tv-programs website er dimensioneret til få, stabile besøg, indtil værten nævner en konkurrence på sitet. Pinterests første arkitektur byggede på replikering af databasen og var svær at skalere. Slidet citerer Karl Kristian Steincke: det er vanskeligt at spå, især når det gælder fremtiden.',
          ],
        },
        {
          term: 'Input til arkitekturen: krav og constraints',
          body: [
            '**Funktionelle krav** giver meget *what* og meget lidt *how*. De skrives typisk som user stories eller use cases, og mange af dem påvirker næppe arkitekturen, selv hvis de ændres. Slidets eksempler er vurderet efter impact: søg efter en video (little), få videoanbefalinger (medium), log ind med Google, Facebook eller Apple (little).',
            '**Ikke-funktionelle krav** ligger tættere på *how*, er følsomme over for arkitekturen og kan omvendt ændre den meget, hvis de ændres. De skrives ofte som (kvantificerede) quality attributes; “System shall play movies to 1000 users simultaneously” har *big impact*. Sommervilles træ deler dem i **product** (usability, efficiency med performance og space, dependability, security), **organizational** (environmental, operational, development) og **external requirements** (regulatory, ethical, legislative med accounting og safety/security). Eksemplet hører under performance.',
            'Trin 1 i processen samler det: “Goals and constraints shape your architecture and design process.” Arkitekturen skal opfylde de funktionelle krav, de ikke-funktionelle (external, fx standarder; organisational; product = quality attributes) og **cross-cutting concerns**. Hver iteration testes mod requirements, known constraints og quality attributes.',
          ],
        },
        {
          term: 'Quality attributes skal kunne måles',
          body: [
            'ISO/IEC 25010 deler produktkvalitet i otte karakteristika — functional suitability, performance efficiency, compatibility, usability, reliability, security, maintainability og portability — hver med underpunkter; maintainability har fx modularity, reusability, analysability, modifiability og testability. Wikipedias liste over “*-ilities” er langt længere. Microsoft Application Architecture Guide udvælger 13, fra availability og conceptual integrity til user experience/usability.',
            'Kurset bruger sin egen tabel, *Selected QA for Course*: development cost, development time, testability, maintainability, availability (“99,99… %”), manageability, performance (latency og throughput), scalability, security og user experience. Den vises igen efter hver stil i W04.2.',
            'Et quality attribute skal **kvantificeres**. “VideoFlix has to stream to a lot of viewers at the same time” kan ikke måles; at streame testklippet til 100.000 seere i 1080p@30fps kan — også selv om testen er svær at udføre. Øvelse 4 spørger derfor også, hvordan man vil teste, at man lever op til kravet.',
          ],
        },
        {
          term: 'Arkitekturen er et kompromis',
          body: [
            'Man kan ikke få alle quality attributes på én gang. Et velspecificeret system rummer krav og forventninger fra tre overlappende interessentgrupper, **User**, **Business** og **System**, beskrevet som user stories og quality attributes, og arkitekturen må være et kompromis på tværs af dem.',
            'Venn-diagrammet går igen i trin 2, hvor key scenarios findes i overlappene mellem de tre views. Derfor beder VideoFlix-øvelse 1 om key scenarios fra brugerens, forretningens og systemets perspektiv.',
          ],
        },
        {
          term: 'Struktur og adfærd',
          body: [
            'Brown skelner mellem arkitektur som substantiv (struktur og adfærd) og som verbum (proces). Strukturen findes med fire spørgsmål: læg funktionaliteten fra kravene i kasser eller moduler; hvad hører sammen; hvilken funktionalitet afhænger af anden; hvad skal eksponeres ved kassernes grænser? Kasserne kan være UML-pakker — det første design af et dataopsamlingssystem har fem: *Communication to devices*, *DataStorage*, *DataCollection*, *Synchronization with remote server* og *Web configuration* — eller UML-komponenter med interfaces. Strukturdiagrammer: package, deployment, component og composite structure.',
            'SOLID gælder også på arkitekturniveau, bare for moduler i stedet for klasser (se [[srp|SRP]] og [[dip|DIP]]); målet er stadig high cohesion og low coupling. Adfærden handler om, hvordan data flyder mellem modulerne, og hvordan flowet gennem softwaren er; eksemplet er et activity diagram for en videoordre med swimlanes for Fulfillment, Customer Service og Finance. Adfærdsdiagrammer: activity, sequence, state og communication. Samme opdeling går igen i [[views-4plus1|4+1]].',
          ],
        },
        {
          term: 'Design eller arkitektur — og hvor meget?',
          body: [
            'Grænsen er glidende og følger kompleksiteten: coding idioms (hvordan itererer man en collection?), design patterns (hvordan løser man et almindeligt problem?), **application architecture/design** (hvordan grupperes funktionaliteten, og hvordan opfyldes quality attributes?) og system architecture (hvordan organiseres flere samarbejdende applikationer?). SWD dækker de to midterste; system architecture hører til SWWAO.',
            'Hvorfor arkitektere? Fowlers **Design Stamina Hypothesis** tegner kumuleret funktionalitet over tid: *No Design* stiger hurtigt og flader ud, *Good Design* starter langsommere, men krydser og overhaler. Hvor meget? En arkitektur er et sæt **modeller**, og en model skal bygge på systemet, afspejle en relevant delmængde af dets egenskaber og kunne bruges til at tænke over systemet i en begrænset kontekst. Slidets tre kort over London er alle rigtige, hver til sit formål; randnoten siger: find ud af, hvad målet med arkitekturen er.',
          ],
        },
        {
          term: 'Microsofts fem trin',
          body: [
            'Processen er **iterative and incremental**. *1. Identify Architecture Objectives* sidder over et hjul med trin 2–5, med pile begge veje mellem trin 1 og hjulet, og hver iteration testes mod requirements, known constraints og quality attributes. (Slidet før viser RUP’s faser — Inception, Elaboration, Construction, Transition — uden videre gennemgang.)',
            '**1. Architecture objectives.** Input er kravene og cross-cutting concerns. Output afhænger af, hvem der skal bruge det (management, testers, developers, andre arkitekter), og hvad iterationen er: et komplet design, en prototype, en undersøgelse af tekniske risici, afprøvning af muligheder eller fælles modeller. **2. Key scenarios** er der, hvor use cases og quality attributes mødes: kritisk funktionalitet, kritiske ikke-funktionelle krav, udforskning af ukendte områder og risikominimering. Kig efter overlappene mellem user, business og system, og foretræk scenarier, der går gennem flere lag. **3. Application overview** er et eller flere forslag til en arkitektur: applikationstype, deployment constraints, teknologier og [[arkitekturstile|architectural styles]].',
            '**4. Key issues** er de problemer, denne version af arkitekturen skal løse: er key scenarios løst? Stil hypotetiske fremtidige ændringer — kan vi skifte en tredjepartstjeneste ud, understøtte en ny klienttype, hurtigt ændre forretningsregler for fakturering, migrere til en ny teknologi? Prøv det af, analysér og dokumentér. **5. Candidate solutions** evalueres mod *baseline*-arkitekturen: lykkes den uden nye risici, mindsker den flere kendte risici end sidste iteration, opfylder den flere krav, muliggør den arkitektonisk signifikante use cases, adresserer den quality attributes og flere cross-cutting concerns? Det kan kræve kode til at validere antagelser, en **architectural spike**.',
          ],
        },
        {
          term: 'VideoFlix: fra ønsker til key scenario',
          body: [
            'Øvelsen (grupper på 2–4) har otte opgaver, der følger trinene: key scenarios set fra user, business og system (1), vælg og begrund (2), find quality attributes (3), kvantificér dem og planlæg testen (4), application overview (5), key issues (6), candidate solution (7) og objectives for næste iteration (8). Målet for første iteration er en **prototype**.',
            'Holdets brainstorm på Taskcards (F26) er råmaterialet: under *System* fx “Flere brugere” (10 millioner brugere på samme tid) og “Skal have en skalerbar database”, under *User* “Playback” (husk hvor langt jeg kom) og “Børneprofil”, under *Business* “Sikkerheds tiltag”. Underviserens opsamling i W04.2 placerer fire krav i Venn-diagrammet — user: samme streaminghastighed til enhver tid; business: altid oppe; system: 1 million samtidige brugere og næsten 100 % oppetid — og koger dem ned til ét key scenario: stream video til mange brugere i god nok kvalitet, og del belastningen på flere servere, så der er lidt eller ingen nedetid.',
            'Quality attributes for prototypen: usability/performance “Start streaming within 5 seconds of click”, scalability “1.000.000 users should be able to stream at the same time” og performance “Start a new server when there is no response to requests in more than 3 seconds”. Compatibility, security (film skal beskyttes), en ekstra performance-linje og usability (lærbar på 5 minutter) står i parentes: vigtige, men ikke med i prototypen. Kolonnen *How to test?* er tom. Til øvelse 5 giver Brightspace tre færdige scenarier; KS1 er en global premiere kl. 20:00 GMT med 5 millioner samtidige seere, live-interaktioner, real-time analytics og zero downtime.',
          ],
        },
        {
          term: 'Architecture Decision Record',
          body: [
            'Beslutningerne skrives ned. Slidet viser IASA’s ADR-skabelon (V3.07): **Name**, **Context** (teknologiske, politiske, sociale og projektlokale kræfter, spændinger og kendte fakta), **Traceability** (link til en ASR eller OKR), **Scope and Tier**, **Options** (sammenlign mulighederne på områder som cost og performance med point 1–10, og ring beslutningen ind), **Characteristics** (reversibility, duration, information quality, effort), **Authority** (decision-owner, -process og -style: tell, sell, consult, agree, inquire, delegate), **Linked decisions**, **Principles**, **Biases** og **Rationale & Consequences**.',
            'Reversibility-skalaen hænger sammen med Browns definition: jo sværere en beslutning er at vende, jo mere arkitektonisk er den. I W05 kommer argumentet igen fra Kruchten: diagrammer er ikke nok, for arkitekturviden er design + **design decisions** + goals and constraints, og beslutningerne skrives som tekst (se [[views-4plus1|4+1]]).',
          ],
        },
      ],
      viz: 'arkitekturproces',
      keyPoints: [
        'Arkitektur er de beslutninger, der er svære at vende: “hard to refactor in an afternoon”.',
        'Funktionelle krav påvirker sjældent arkitekturen; ikke-funktionelle krav gør.',
        'Quality attributes skal kvantificeres, så de kan testes.',
        'Arkitekturen er et kompromis mellem user, business og system.',
        'Substantiv: struktur (og adfærd). Verbum: proces.',
        'Microsoft: objectives → key scenarios → application overview → key issues → candidate solutions, iterativt og inkrementelt.',
        'Key scenarios er der, hvor use cases og quality attributes mødes.',
        'Beslutninger og deres alternativer dokumenteres i en ADR.',
      ],
      exam: [
        'Softwarearkitektur er de væsentlige beslutninger om et system — med Simon Browns test dem, man ikke kan refaktorere om på en eftermiddag. Man kan se den som struktur og adfærd eller som en proces.',
        'Det er især de ikke-funktionelle krav, der driver arkitekturen. At man kan søge efter en video, påvirker den næppe, men at systemet skal afspille film for 1000 brugere samtidig, gennemsyrer hele designet. Derfor skal quality attributes kvantificeres: “mange seere” kan ikke testes, 100.000 seere i 1080p@30fps kan.',
        'Kurset bruger Microsofts iterative proces i fem trin: architecture objectives, key scenarios, application overview, key issues og candidate solutions. Hver iteration testes mod krav, constraints og quality attributes, og en ny kandidat vurderes mod den forrige iterations baseline.',
        'I VideoFlix blev user-, business- og systemkravene kogt ned til ét key scenario: stream til mange brugere i god nok kvalitet, og del belastningen på flere servere, så der næsten ingen nedetid er. Det peger direkte på valget af arkitekturstil i trin 3.',
        'Arkitekturen er altid et kompromis, fordi man ikke kan maksimere alle quality attributes. Derfor skriver man beslutningen, alternativerne og konsekvenserne ned, fx i en ADR, hvor man også vurderer, hvor reversibel beslutningen er.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W04.1_Architecture_Process_1.md'), original: P1, pages: 's. 5–66', note: 'Sidetal er PDF-sider; fra s. 22 er slidets påtrykte nummer én højere.' },
        { path: m('slides/SW4SWD-01_W04.2_Architecture_Process_2.md'), original: P2, pages: 's. 6–16, 61–67', note: 'Recap af processen, Microsofts quality attributes, VideoFlix key scenarios og quality attributes' },
        { path: m('opgaver/SW4SWD-01_Architecture_Exercise_VideoFlix.md'), original: 'Architecture exercise - VideoFlix.pdf', pages: 's. 1' },
        { path: m('opgaver/SW4SWD-01_Application_Overview_Input.md'), original: 'Input for the Application Overview.html', note: 'KS1–KS3' },
        { path: 'swd/kilder/uge-04_arkitektur-proces-2/SW4SWD F26 - Videoflix-Thu Feb 19 2026.png', note: 'Holdets Taskcards-brainstorm i kolonnerne Business, System og User' },
      ],
      gaps: [
        'Udtrykket *architectural drivers* bruges ikke i materialet. Slidene taler om “Input for the architecture” (s. 13–14) og “Goals and constraints” (s. 42), og *constraints* defineres ikke nærmere end “known constraints” (s. 41) og “deployment constraints” (s. 53).',
        'Kolonnen *How to test?* i VideoFlix-tabellen (W04.2 s. 63) er tom, og materialet viser ikke, hvordan en kvantificeret quality attribute faktisk testes.',
        'Tallene i VideoFlix-eksemplerne kommer fra forskellige steder og er ikke et facit: 1000 samtidige brugere (s. 14), 100.000 seere i 1080p@30fps (s. 66), 1.000.000 (W04.2 s. 63), 5 millioner i KS1 og 10 millioner på holdets tavle.',
        'Markdown-konverteringen hænger usability under efficiency i Sommervilles træ (s. 15). På slidet hænger usability direkte under product requirements ved siden af efficiency, dependability og security.',
        'Microsofts procesfigur (s. 41) har pile begge veje mellem trin 1 og hjulet; markdown-konverteringens diagram tegner i stedet en pil fra trin 5 til trin 1.',
        'RUP (s. 40) og Design Stamina Hypothesis (s. 35–36) vises kun som billeder med en kildehenvisning, uden forklarende tekst. *Microsoft Application Architecture Guide* (kap. 16 om quality attributes) ligger på Brightspace og er ikke en del af materialet.',
        'ADR-skabelonen (s. 61) vises tom. Der er intet udfyldt eksempel, og forkortelserne ASR og OKR i feltet Traceability forklares ikke.',
      ],
      keywords: ['softwarearkitektur', 'software architecture', 'arkitekturproces', 'architectural drivers', 'functional requirements', 'non-functional requirements', 'funktionelle krav', 'ikke-funktionelle krav', 'quality attributes', 'kvalitetsattributter', 'ISO 25010', 'ilities', 'Sommerville', 'kompromis', 'user business system', 'key scenarios', 'architecture objectives', 'application overview', 'key issues', 'candidate solutions', 'baseline', 'architectural spike', 'Microsoft Application Architecture Guide', 'RUP', 'Design Stamina Hypothesis', 'ADR', 'Architecture Decision Record', 'VideoFlix', 'Fowler', 'Simon Brown', 'cross-cutting concerns'],
    },

    {
      slug: 'arkitekturstile',
      title: 'Architectural styles',
      short: 'Arkitekturstile',
      week: 'Uge 4 · W04.2',
      definition:
        'En **architectural style** er ifølge Garlan og Shaw en familie af systemer med et fælles mønster for strukturel organisering: et ordforråd af **components** og **connectors** og **constraints** på, hvordan de må kombineres, fx ingen cykler. Stilene er værktøjskassen til trin 3 i arkitekturprocessen, application overview. Kurset gennemgår layers, client/server, N-tier, pipes and filters og message bus — og et rigtigt system kombinerer næsten altid flere.',
      intro: [
        'W04.2 viser tabellen *Selected QA for Course* efter hver stil (development cost og -time, testability, maintainability, availability, manageability, performance, scalability, security, user experience), så man selv kan vurdere, hvad stilen gør for dem. Tabellen og resten af processen står under [[arkitekturproces|arkitektur som proces]].',
      ],
      concepts: [
        {
          term: 'No Silver Bullet: essential og accidental complexity',
          body: [
            'Decket åbner med Brooks. **Essential complexity** ligger i problemet: den kan ikke refaktoreres væk og kan vokse hurtigere, end vi finder bedre måder at løse problemet på. **Accidental complexity** ligger i løsningen: den kan refaktoreres væk og mindskes forhåbentlig, efterhånden som vi opfinder bedre værktøjer — slidets eksempler er højniveausprog, automatisk hukommelseshåndtering med garbage collection og aktormodellen til concurrency.',
          ],
        },
        {
          term: 'Stil, kategorier og kombinationer',
          body: [
            'Stilene ordnes efter fokus (Microsoft Application Architecture Guide med tilføjelser): **Structure** (layered, component-based, object oriented), **Domain** ([[ddd|Domain Driven Design]]), **Communication** (message bus, SOA, event driven, CQRS) og **Deployment** (client/server, N-tier/3-tier, microservice, serverless). Toppen handler mest om kode, bunden mest om fysisk struktur.',
            'Et system er næsten aldrig begrænset til én stil. Slidets eksempel er et message bus-design, hvis services hver er bygget lagdelt. Kruchten siger det samme om 4+1: arkitekten kan vælge en stil pr. view, så flere stile lever side om side i ét system (se [[views-4plus1|4+1]]).',
          ],
        },
        {
          term: 'Layers',
          body: [
            'Applikationens concerns deles i stablede grupper — lag — af klasser, pakker, moduler eller subsystemer. Afhængigheder må kun gå fra et højere til et lavere lag, som man kender det fra [[dip|DIP]]. Det betyder ikke, at data ikke kan flyde op: afkobling, fx med events, lader det lavere lag fungere uden det højere. Microsofts standardbillede har users øverst, så presentation, business og data layer, og under data layer datakilder og services.',
            'Fordelene på slidet: separation of concerns ([[srp|SRP]]), lavere kobling, højere kohæsion, genbrug af de nederste lag, klarhed, parallelt arbejde i teams, lettere test — og et lag kan udskiftes, hvis man programmerer mod interfaces og bruger dependency injection (se [[swt/design-for-testability|design for testability]]). Andre eksempler er MVC, [[fed/mvvm|MVVM]], Boundary-Control-Domain/Entity og OSI-modellen. Larmans lille applikation har tre lag: UI (Swing, Web), Domain (Sales, Payments, Taxes) og Technical Services (Persistence, Logging, RulesEngine).',
            'Lagene bygges iterativt i **vertical slices**: *Hello World Prototype* (revision 0.1) forfines («refine») til *Data Format Prototype* (revision 0.2), og de nye elementer ligger i flere lag på én gang. Microsofts fulde diagram tilføjer et services layer og en lodret søjle med cross-cutting concerns: security, operational management og communication.',
          ],
        },
        {
          term: 'Layer mod tier, og client/server',
          body: [
            'Et **layer** er en logisk opdeling, et **tier** en fysisk.',
            'I **client/server** starter klienten et request, venter på svaret og behandler det, når det kommer. Et netværk forbinder dem, mange klienter taler med samme server (many to one), og de to har forskellige roller: serveren håndterer requests, gemmer og leverer data og beregner; klienten håndterer brugerinput, sammensætter requestet, modtager data og behandler eller viser dem. Klienter spænder fra tynde til tykke, alt efter hvor meget de selv skal beregne. Stilen kaldes også 2-tier. Web-udgaven med browser, server og SPA står i FED under [[fed/web-arkitektur|web-arkitektur]].',
          ],
        },
        {
          term: 'N-tier',
          body: [
            'N-tier er client/server, hvor præsentation, applikationslogik og datahåndtering er **fysisk** adskilt. Et tier er en fysisk struktureringsmekanisme for infrastrukturen og kører på en node. Slidets billede: presentation tier (client computers), over internettet til business logic tier (application servers), over intranettet til database tier (database servers). Og vigtigst: softwaren på ét tier kan selv bestå af flere lag.',
            'Fordele: **scalability** (applikationsserverne kan køre på mange maskiner, og databasen behøver ikke en forbindelse fra hver klient), **reusability** (web, mobil og andre systemer bruger samme backend), **data integrity** (forretningslaget sikrer, at kun gyldige data opdateres), **security** (klienten har ingen direkte adgang til databasen), **reduced distribution** (ny forretningslogik opdateres kun på serverne) og **availability** (redundante applikations- og databaseservere). Ulempen er kompleksitet: kommunikationen mellem tiers skal defineres, udvikles og vedligeholdes, servere kan gå ned, forbindelser kan fejle eller være langsomme, og sikkerhed skal håndteres ved hver grænse.',
          ],
        },
        {
          term: 'Pipes and filters',
          body: [
            'En struktur til systemer, der behandler en **datastrøm** (efter *Pattern-Oriented Software Architecture*, vol. 1). Hvert behandlingstrin er indkapslet i et **filter**, og data sendes gennem **pipes** mellem nabofiltre. Filtrene kan kombineres på nye måder til familier af beslægtede systemer. Implementering i seks trin: del opgaven i en række trin, definér dataformatet på hver pipe, beslut hvordan hver pipe implementeres, design filtrene, design fejlhåndteringen og sæt pipelinen op.',
            'Eksemplet er thumbnails, der går gennem load, scale, filter og display. Sekventielt ligger de fire billeder efter hinanden; med en tråd pr. trin arbejder de fire trin samtidig på hver sit billede — “throughput x 4”. Det andet eksempel er en compiler: scanner, parser, semantisk analyse, kodegenerering og optimering, og til sidst fire udskiftelige backends (MIPS, Intel, SPARC og en interpreter). Den parallelle version i C# står under [[pipelines|pipelines]].',
          ],
        },
        {
          term: 'Message bus',
          body: [
            'Applikationerne forbindes gennem en logisk komponent, der kan sende og modtage beskeder på en eller flere kanaler, så de kan samarbejde uden at kende detaljer om hinanden. En message bus har tre nøgleelementer: et sæt aftalte **message schemas**, et sæt fælles **command messages** og en fælles infrastruktur, der leverer beskederne til modtagerne.',
            'Eksemplet er handelssystemer. Uden bus er Trading System 1 og 2 forbundet direkte til hinanden og til Portfolio Manager, Risk Analysis, Modeling, Trend Indicator og Ticker; et nyt Trading System 3 kræver nye forbindelser til dem alle. Med bus kobles Trading System 3 på bussen med én forbindelse.',
          ],
        },
        {
          term: 'Application overview: stilene i brug',
          body: [
            'Trin 3 i processen beskriver applikationstype (mobile, web, service, embedded …), deployment constraints (infrastruktur og quality attributes som security, reliability, scalability og performance), arkitekturstil(e) og teknologier. Microsofts eksempelskitse har en browser, der via HTTP(S) taler med en web server i et protected network. Web serveren har tre lag — presentation, business og data — og taler via TCP/IP med en database server med user store og product orders. Forbindelserne er mærket *forms authentication & roles* og *windows authentication & database roles*.',
            'Skitsen kombinerer tiers mellem maskinerne med layers inde i web serveren. Øvelse 5 er at lave en tilsvarende application overview for VideoFlix-prototypen.',
          ],
        },
      ],
      viz: 'arkitekturstile',
      keyPoints: [
        'Stil = components + connectors + constraints (Garlan og Shaw).',
        'Kategorier: structure, domain, communication, deployment.',
        'Layers: afhængigheder kun nedad, som ved DIP; data må godt flyde op via events.',
        'Layer er logisk, tier er fysisk; et tier kan rumme flere lag.',
        'Client/server = 2-tier. N-tier køber scalability, security og availability med kompleksitet.',
        'Pipes and filters: filtre på en datastrøm; en tråd pr. filter giver højere throughput.',
        'Message bus: et nyt system kræver én forbindelse til bussen, ikke én til hvert system.',
        'Rigtige systemer kombinerer stile.',
      ],
      exam: [
        'En arkitekturstil er ifølge Garlan og Shaw et ordforråd af components og connectors med regler for, hvordan de må kombineres. Stilene er værktøjskassen, når man laver application overview i Microsofts proces.',
        'I en lagdelt arkitektur må afhængigheder kun gå nedad, præcis som ved DIP. Det giver separation of concerns og lav kobling, og et lag kan udskiftes, hvis man programmerer mod interfaces og bruger dependency injection.',
        'Layers og tiers blandes tit sammen: et layer er en logisk opdeling, et tier en fysisk. N-tier giver scalability, security og availability, fordi applikationsserverne kan dubleres, og klienten ikke rører databasen — men prisen er kompleksitet i kommunikationen og flere steder, det kan gå galt.',
        'Pipes and filters passer til datastrømme. Kursets eksempel er thumbnails gennem load, scale, filter og display, hvor en tråd pr. filter firedobler throughput. Message bus passer, når mange applikationer skal tale sammen: et nyt handelssystem kobles på bussen i stedet for på alle de andre.',
        'Et rigtigt system bruger flere stile. Microsofts eksempel har tiers mellem browser, web server og database server og lag inde i web serveren.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W04.2_Architecture_Process_2.md'), original: P2, pages: 's. 2–67', note: 'Sidetal er PDF-sider; fra s. 45 er slidets påtrykte nummer højere.' },
        { path: m('slides/SW4SWD-01_W04.1_Architecture_Process_1.md'), original: P1, pages: 's. 53', note: 'Application overview peger frem mod stilene' },
        { path: m('artikler/SW4SWD-01_4plus1_View_Kruchten_1995.md'), original: '41view-architecture_1995.pdf', pages: 's. 2, 5, 7', note: 'En stil pr. view; pipes and filters og client/server i process view; layered style i development view' },
      ],
      gaps: [
        'Slidet om No Silver Bullet (s. 2) angiver kilden som *Software State-of-the-Art*, 1975. Uden for materialet: essayet er fra 1986/87, og antologien udkom 1990. Slidet står alene før titelsliden og kobles ikke eksplicit til stilene.',
        'Tabellen *Selected QA for Course* gentages efter hver stil (s. 30, 40, 47, 54, 59), men slidene skriver ikke, hvilke quality attributes hver stil fremmer. Kun layers (fordele) og N-tier (fordele og ulemper) har en liste; pipes and filters og message bus har ingen ulemper på slidene.',
        'Slidet (s. 24) sammenligner lagreglen med DIP uden at uddybe; hvordan DIP’s abstraktioner placeres mellem lagene, står ikke i materialet.',
        'Kategorierne (s. 20) nævner component-based, object oriented, SOA, event driven, CQRS, microservice og serverless, men de gennemgås ikke.',
        'Pipes and filters-slidet (s. 48) lover en “Anecdote”, som ikke står i materialet.',
      ],
      keywords: ['architectural style', 'arkitekturstil', 'Garlan', 'Shaw', 'components', 'connectors', 'constraints', 'No Silver Bullet', 'Brooks', 'essential complexity', 'accidental complexity', 'layers', 'lagdeling', 'layered', 'vertical slices', 'client/server', 'client-server', '2-tier', 'N-tier', '3-tier', 'tier', 'thin client', 'thick client', 'pipes and filters', 'pipeline', 'filter', 'message bus', 'SOA', 'CQRS', 'microservice', 'application overview', 'MS AAG', 'Larman'],
    },

    {
      slug: 'c4',
      title: 'C4-modellen',
      week: 'Uge 5 · W05 del 1',
      definition:
        'C4-modellen (Simon Brown) dokumenterer en softwarearkitekturs **struktur** på fire abstraktionsniveauer, som zoomniveauer på et kort: **System Context** → **Container** → **Component** → **Code**. Et software system består af containers (applikationer og datalagre), der indeholder components (relateret funktionalitet bag et interface), der implementeres af code elements. Modellen foreskriver ingen notation: “abstractions 1st, notation 2nd”.',
      intro: [
        'W05 deler dokumentationen i to: **abstraktionsniveauer** med C4 og **viewpoints** med [[views-4plus1|4+1]]. Casen gennem alle fire niveauer er et *Internet Banking System*.',
      ],
      concepts: [
        {
          term: 'Dokumentation er kommunikation',
          body: [
            'W05 starter ved whiteboardet og med to spørgsmål, begge illustreret med kort over London: find det rigtige **abstraktionsniveau** (satellitkort, tube map med Themsen, rent linjekort) og identificér de relevante **viewpoints** (cykelruter, husleje ved stationerne, kalorier mellem stationerne — samme net, forskellige spørgsmål).',
            'Softwarearkitekturdokumentation handler grundlæggende om kommunikation, undtagen i safety-, sporbarheds- og ekstern assessment-sammenhænge. At kommunikere kræver et fælles sprog: fælles ordforråd, fælles notation og fælles forståelse af abstraktionsniveauet. Browns regel er “abstractions 1st, notation 2nd”.',
          ],
        },
        {
          term: 'Abstraktionerne',
          body: [
            'Et **software system** består af en eller flere **containers** (webapplikationer, mobilapps, desktopapplikationer, databaser, filsystemer osv.), som hver indeholder en eller flere **components**, som igen implementeres af et eller flere **code elements** (klasser, interfaces, objekter, funktioner osv.). Hierarkiet er strengt: hver container hører til ét system, hver component til én container.',
            'c4model.com tilføjer **person** (brugere, roller, personaer) som den femte slags element. I foredraget understreger Brown ifølge referatet, at containeren *ikke* er en Docker-container, men en applikation eller et datalager.',
          ],
        },
        {
          term: 'Level 1: System Context',
          body: [
            'Et udzoomet billede af systemlandskabet. Fokus er på personer og software systems, ikke på teknologier, protokoller og andre detaljer; det er den slags diagram, man kan vise ikke-tekniske mennesker.',
            'Eksemplet har fire elementer: *Personal Banking Customer* [Person] “Views account balances, and makes payments using” *Internet Banking System* [Software System], som “Sends e-mail using” det eksterne *E-mail System* (bankens interne Microsoft Exchange) og “Gets account information from, and makes payments using” *Mainframe Banking System*. E-mail-systemet “Sends e-mails to” kunden. Hver pil kan læses højt som en sætning.',
          ],
        },
        {
          term: 'Level 2: Container',
          body: [
            'En container er en separat kørbar eller deploybar enhed — fx et separat procesrum — der kører kode eller gemmer data. Container-diagrammet viser softwarearkitekturens overordnede form, hvordan ansvaret er fordelt, de store teknologivalg, og hvordan containerne kommunikerer.',
            'Internet Banking System åbnes i fem containers: *Web Application* [Java and Spring MVC], *Single-Page Application* [JavaScript and Angular], *Mobile App* [Xamarin], *API Application* [Java and Spring MVC] og *Database* [Relational Database Schema]. Pilene bærer protokol: kunden besøger `bigbank.com/ib` [HTTPS], SPA og mobilapp “Makes API calls to” API’et [JSON/HTTPS], API’et “Reads from and writes to” databasen [JDBC], sender e-mail [SMTP] og kalder mainframen [XML/HTTPS]. En stiplet ramme markerer systemets grænse. (SPA’en som arkitektur står i FED under [[fed/web-arkitektur|web-arkitektur]].)',
          ],
        },
        {
          term: 'Level 3: Component',
          body: [
            'Zoom ind i én container og find de vigtigste strukturelle byggeblokke og deres interaktioner. En component er her “a grouping of related functionality encapsulated behind a well-defined interface”; i Java eller C# en samling implementeringsklasser bag et interface. Hvordan de pakkes (JAR, DLL) er et separat, ortogonalt spørgsmål. Vigtigst: alle components i en container kører typisk i samme procesrum — krydser man en procesgrænse, er det en ny container.',
            'API Application åbnes i seks components: *Sign In Controller*, *Reset Password Controller* og *Accounts Summary Controller* [Spring MVC Rest Controller] og *Security Component*, *E-mail Component* og *Mainframe Banking System Facade* [Spring Bean]. Controllerne bruger komponenterne, og kun komponenterne taler med databasen, e-mailsystemet og mainframen. Ifølge referatet vil Brown kunne se de seks ting tydeligt, når han åbner kodebasen.',
          ],
        },
        {
          term: 'Level 4: Code (valgfrit)',
          body: [
            'Man kan zoome ind i en component og vise koden med UML-klassediagrammer, ER-diagrammer el.lign. — men kun de attributter og metoder, der fortæller den historie, man vil fortælle (se [[uml-klassediagram|UML-klassediagrammet]]). Eksemplet er pakken `com.bigbankplc.internetbanking.component.mainframe`: `MainframeBankingSystemFacadeImpl` realiserer interfacet `MainframeBankingSystemFacade`, bruger `BankingSystemConnection`, opretter `GetBalanceRequest`, parser `GetBalanceResponse` og kaster `MainframeBankingSystemException`.',
            'Slidet kalder niveauet *Optional*. Brown går længere i foredraget: ifølge referatet anbefaler han ikke at tegne det, men at generere det fra IDE’en, og kun tegne det for komplicerede components.',
          ],
        },
        {
          term: 'Diagram guidelines',
          body: [
            'Diagrammer skal være selvforklarende. Angiv en legend, der forklarer notationen. Tilføj beskrivende tekst. Brug farve og form til at gøre det lettere at læse, men kun som optimering. En fortælling skal supplere diagrammet, ikke forklare det. Og man skal kunne læse diagrammet højt og forstå det.',
            'c4model.com gør det konkret: hvert element har navn, type (med teknologi for containers og components) og en kort beskrivelse; hver linje er én rettet relation med en etiket, der passer til retningen, og gerne mere præcis end “Uses”; hvert diagram har en titel med type og scope, fx “Container diagram for Internet Banking System”. W05-øvelsen *Draw the architecture* tester det: forklar dit projekts arkitektur for en fra et andet projekt på 10 minutter, med papir og blyant og uden færdige diagrammer.',
          ],
        },
        {
          term: 'C4’s grænser — og forholdet til 4+1',
          body: [
            'C4 dokumenterer **struktur**. Modellen kræver ingen bestemt notation — Brown har et forslag, og UML kan bruges — men slidet minder om, at adfærd er lige så vigtig som struktur, og at man derfor har brug for andre viewpoints, understøttet af andre diagrammer. Det er [[views-4plus1|4+1]].',
            'De to modeller svarer på hvert sit spørgsmål. C4 bestemmer, hvor langt man zoomer ind i strukturen; 4+1 bestemmer, hvilken del af historien man fortæller og for hvem. W05 del 2 siger begge dele: vælg det view, der fortæller den del af historien, læseren skal have, og beslut abstraktionsniveauet. De mødes i adfærdsdiagrammerne: sekvensdiagrammer kan tegnes mellem system og kontekst, mellem containers, mellem components eller mellem klasser, og kursets tankstationseksempel er tegnet mellem containers. Ifølge c4model.com er C4 selv inspireret af UML og 4+1.',
            'Over begge står Kruchtens ligning: arkitekturviden = arkitekturdesign (fx C4- og N+1-views-diagrammer) + designbeslutninger (tekst) + mål og begrænsninger. Diagrammerne er kun første led.',
          ],
        },
      ],
      viz: 'c4',
      keyPoints: [
        'C4 = fire zoomniveauer af struktur: System Context, Container, Component, Code.',
        'Container = separat kørbar/deploybar enhed, der kører kode eller gemmer data — ikke Docker.',
        'Component = relateret funktionalitet bag et veldefineret interface, i samme procesrum som resten af containeren.',
        'Level 1 er for ikke-tekniske læsere; level 2 viser teknologivalg og protokoller.',
        'Level 4 er valgfrit.',
        'Abstractions first, notation second: C4 kræver ingen bestemt notation.',
        'Legend, tekst i boksene, farve kun som optimering, og diagrammet skal kunne læses højt.',
        'C4 dokumenterer kun struktur; adfærd kræver andre viewpoints som 4+1.',
      ],
      exam: [
        'Arkitekturdokumentation handler om kommunikation, og det kræver fælles ordforråd, notation og forståelse af abstraktionsniveau. C4-modellen giver ordforrådet: et software system består af containers, der indeholder components, der implementeres af kode.',
        'Man zoomer ind som på et kort. I kursets eksempel viser System Context internetbanken med kunden, mainframen og e-mailsystemet. Container-niveauet åbner systemet i web application, single-page application, mobile app, API application og database med teknologi og protokol på pilene. Component-niveauet åbner API-applikationen i controllere, en security component, en e-mail component og en facade til mainframen.',
        'Skillelinjen mellem container og component er procesgrænsen: en container kan køres eller deployes for sig, mens alle components i en container typisk kører i samme procesrum.',
        'C4 kræver ingen bestemt notation — abstractions first, notation second — men diagrammerne skal have en legend, tekst i boksene og kunne læses højt.',
        'Begrænsningen er, at C4 kun dokumenterer struktur. Adfærd er lige så vigtig, så man supplerer med 4+1: C4 bestemmer abstraktionsniveauet, 4+1 hvilket view man tegner, fx et sekvensdiagram mellem containers.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W05_Architecture_Documentation.md'), original: D1, pages: 's. 4–22', note: 'Del 1. Sidetal er PDF-sider; de påtrykte slidenumre er 1–3 højere.' },
        { path: m('slides/SW4SWD-01_W05_Architecture_Documentation.md'), original: D2, pages: 's. 5–8, 12, 20–21', note: 'Del 2: recap, views, “Diagrams are not enough”, sekvensdiagrammer på C4-niveauer' },
        { path: m('artikler/SW4SWD-01_C4_Model.md'), note: 'Konvertering af c4model.com; ingen original i kilder. Ugeplanen beder om læsning frem til FAQ’en.' },
        { path: m('artikler/SW4SWD-01_C4_Talk_Simon_Brown.md'), original: 'C4-foredrag - Simon Brown - Agile on the Beach 2019.mp4', note: 'Referat af videoen, ikke ordret udskrift' },
        { path: 'swd/kilder/uge-05_arkitektur-dokumentation/week5 plan.txt', note: 'Forberedelse til uge 5' },
      ],
      gaps: [
        'Level 4: slidet kalder det *Optional* (s. 17), mens Brown ifølge referatet af foredraget fraråder det og anbefaler at generere det fra IDE’en. c4model.com-konverteringen siger, at det kun bør tegnes for komplicerede components.',
        'Referatet af foredraget bygger på en automatisk transskription (fx er “structurizer” rettet til Structurizr). Citaterne derfra er ikke kontrolleret mod videoen.',
        'c4model.com-teksten (FAQ, de supplerende diagramtyper System Landscape, Dynamic og Deployment, checklisten) findes kun som markdown-konvertering af websitet. Slidene nævner ikke de supplerende diagramtyper.',
        'Foredragets container-eksempel besøger `mybank.com/internet-banking`, slidet `bigbank.com/ib` (s. 14).',
        'Slidet (s. 19) siger, at UML kan bruges til C4 (“se the c4model website”), men viser ikke hvordan.',
        'Level 4-eksemplet (s. 17) har ingen attributter eller metoder, selv om teksten siger, at man skal vise dem, der fortæller historien. Interfacet er tegnet som lollipop, og afhængighederne er mærket `+creates`, `+uses`, `+parses`, `+throws`, `+sends` og `+receives`.',
      ],
      keywords: ['C4', 'C4 model', 'C4-modellen', 'Simon Brown', 'System Context', 'Context diagram', 'Container', 'Container diagram', 'Component', 'Component diagram', 'Code', 'software system', 'person', 'zoom', 'abstraktionsniveau', 'abstraction level', 'abstractions first', 'notation', 'Internet Banking System', 'legend', 'key', 'diagram guidelines', 'process space', 'procesrum', 'Structurizr', 'C4-PlantUML', 'c4model.com', 'dokumentation'],
    },

    {
      slug: 'views-4plus1',
      title: 'Architectural views og 4+1',
      short: 'Views og 4+1',
      week: 'Uge 5 · W05 del 2',
      definition:
        'Der findes ikke ét diagram, der kan bære hele arkitekturen. **4+1 View Model** (Philippe Kruchten, 1995) deler beskrivelsen i fire views, hver med sin interessent og sine concerns — **Logical** (end-user, functionality), **Development** (programmers, software management), **Process** (integrators, performance, scalability) og **Physical** (system engineers, topology, communications) — bundet sammen af **scenarios**, det “+1”, der både driver og validerer arkitekturen.',
      intro: [
        'Hvor [[c4|C4]] zoomer ind i strukturen, skifter 4+1 perspektiv. Kurset læser Kruchtens originalartikel (valgfri; den bruger Booch-notation fra før UML) og en artikel fra 2007, der fordeler UML 2’s diagramtyper på de fem views.',
      ],
      concepts: [
        {
          term: 'Viewpoints og views',
          body: [
            'W05 del 2 siger det kort: der er ikke “one diagram to rule them all”. Hvert view fortæller en del af historien; beslut, hvad der skal kommunikeres, vælg de passende diagrammer, beslut abstraktionsniveauet, og spørg, hvad læseren skal vide. London-kortene fra del 1 viser ideen: samme net, men cykelruter, husleje og kalorier besvarer hver sit spørgsmål.',
            'Kruchten starter samme sted: på et typisk kasse-og-pil-diagram kan man ikke se, om kasserne er kørende programmer, stykker kildekode, fysiske computere eller logiske grupper af funktionalitet, eller om pilene er compile-afhængigheder, control flow eller data flow. Hans svar er flere samtidige views, der hver adresserer ét sæt concerns for én gruppe interessenter.',
          ],
        },
        {
          term: 'Logical view',
          body: [
            'Understøtter primært de **funktionelle krav**: hvilke services systemet giver sine brugere. Systemet dekomponeres i nøgleabstraktioner, hovedsageligt fra problemdomænet, som objekter og klasser; Kruchten bruger klassediagrammer og tilstandsdiagrammer, når objektets interne adfærd er vigtig. En meget datadrevet applikation kan bruge ER-diagrammer i stedet. Stilen er objektorienteret, med én sammenhængende objektmodel for hele systemet.',
            'Eksemplet er en telefoncentral (PABX) med klasserne *Controller*, *Terminal*, *Conversation*, *Numbering Plan*, *Translation Services* og *Connection Services*. UML 2-artiklen placerer class, object, package, composite structure og state machine i dette view og siger: start med klasse- og pakkediagrammer.',
          ],
        },
        {
          term: 'Process view',
          body: [
            'Tager sig af ikke-funktionelle krav som performance og availability: concurrency, distribution, integritet og fejltolerance — og på hvilken **thread of control** en operation på et objekt faktisk kører. En *process* er en gruppe af *tasks*, der udgør en eksekverbar enhed; en task er en separat thread of control. Tasks kommunikerer med beskeder, remote procedure calls og event broadcast. Kruchten foreslår stile som pipes and filters og client/server (se [[arkitekturstile|architectural styles]] og [[threading|tråde i C#]]).',
            'I telefoncentralen kører alle controllere i én controller-proces med tre tasks: en *low rate*-task scanner inaktive terminaler hvert 200. ms, en *high rate*-task opdager tilstandsskift hvert 10. ms, og en *main controller task* fortolker ændringerne og sender dem som beskeder til terminal-processen. UML 2-artiklen placerer sequence, communication, activity, timing og interaction overview her.',
          ],
        },
        {
          term: 'Development view',
          body: [
            'Viser softwarens statiske organisering i udviklingsmiljøet: moduler og subsystemer (biblioteker), som én eller få udviklere kan arbejde på, ordnet i **lag** med smalle interfaces. Det er grundlaget for at fordele krav og arbejde mellem teams, estimere og planlægge, følge fremdriften og ræsonnere om genbrug, portabilitet og sikkerhed.',
            'Kruchten anbefaler en lagdelt stil med 4–6 lag, hvor et subsystem kun må afhænge af subsystemer i samme lag eller lagene under. Eksemplet er Hughes’ flyveledelsessystem med 5 lag og ca. 72 subsystemer. UML 2-artiklen kalder viewet *Implementation View* og bruger component-diagrammer.',
          ],
        },
        {
          term: 'Physical view',
          body: [
            'Mapper softwaren på hardwaren. Viewet tager sig primært af availability, reliability (fejltolerance), performance (throughput) og scalability. Netværk, processer, tasks og objekter placeres på **nodes**, og da der vil være flere konfigurationer — til udvikling, test og forskellige kunder — skal mappingen være fleksibel og røre kildekoden mindst muligt.',
            'Telefoncentralen har tre computertyper, C, F og K. I den lille udgave kører en F-node *Conversation process* og *Terminal Process*, mens en K-node kører *Controller Process*; den store udgave har flere F- og K-noder og en C-node med *Central Process*. UML 2-artiklen kalder viewet *Deployment View* og bruger deployment-diagrammer.',
          ],
        },
        {
          term: 'Scenarios: +1',
          body: [
            'Elementerne i de fire views vises at arbejde sammen med et lille sæt vigtige **scenarier** — instanser af mere generelle use cases — med scripts, dvs. sekvenser af interaktioner mellem objekter og mellem processer. Viewet er redundant med de andre (deraf “+1”), men har to formål: som *driver* til at finde arkitekturelementerne under designet, og til *validering og illustration* bagefter, også som udgangspunkt for test af en arkitekturprototype.',
            'Eksemplet er begyndelsen på et lokalt opkald: Joes controller opdager, at røret løftes, og vækker terminal-objektet; terminalen beder controlleren om klartone; controlleren sender cifrene videre; terminalen analyserer dem med numbering plan; og ved et gyldigt nummer åbner terminalen en conversation. Views kan udelades — physical, hvis der kun er én processor, process, hvis der kun er én proces — men scenarierne er nyttige under alle omstændigheder. Arkitekturen udvikles iterativt og scenariedrevet, som key scenarios i [[arkitekturproces|arkitekturprocessen]].',
          ],
        },
        {
          term: 'UML-diagrammer i views',
          body: [
            'UML 2 har 13 diagramtyper i to grupper. **Structural diagrams** viser den statiske arkitektur: package, class, object, composite structure, component og deployment. **Behavioral diagrams** viser den dynamiske: use case, activity, state machine, communication, sequence, timing og interaction overview. W04.1 bruger samme skel mellem struktur og adfærd.',
            'Slidets tabel over views: Logical = package, component, composite structure, state, communication; Development = package, component; Process = activity, communication, deployment, sequence; Physical = deployment. Overlappene viser, at samme diagramtype kan bære forskellige historier. UML 2-artiklen fordeler dem anderledes (se huller).',
            'Eksemplerne i W05: use case-diagram for videoudlejning (Customer, Administrator, Business Owner, Developer), use case-beskrivelsen *Buy Goods*, pakke-, komponent- og deployment-diagrammer, et sekvensdiagram for en tankstation tegnet mellem containers, et communication-diagram for en online boghandel, tilstandsmaskiner på to niveauer (konceptuelle tilstande for en `Order`, og en hæveautomat-transaktion mellem containers, se [[state|State]]) og et activity-diagram for en videoordre med fork og join.',
          ],
        },
        {
          term: 'Andre views, og hvorfor diagrammer ikke er nok',
          body: [
            'Slidet foreslår flere views — data, security, “others…?” — og agendaen kalder det “N+1 views”. UML 2-artiklen nævner også security og data view. Kruchten selv mente, at andre foreslåede views som regel kan foldes ind i de fire: et data view i logical, et cost & schedule view i development, et execution view i process og physical.',
            '**Diagrams are not enough.** Kruchten (2009): *Architectural Knowledge = Architectural Design + Design Decisions + Goals and Constraints*. Designet er fx C4- og N+1-views-diagrammer; beslutningerne er tekst. Allerede i 1995 havde Kruchtens *Software Architecture Document* et kapitel om *Architectural Goals & Constraints*, og de vigtigste designbeslutninger stod i et separat dokument med designretningslinjer. Kursets bud på beslutningerne er ADR’en under [[arkitekturproces|arkitekturprocessen]].',
          ],
        },
        {
          term: 'C4 og 4+1 sammenholdt',
          body: [
            'W05 del 1 siger det direkte: abstraktionsniveauer dokumenteres med C4, og derefter dokumenteres forskellige viewpoints med 4+1. [[c4|C4]] er fire zoomniveauer af den samme struktur, uden krav om notation og uden adfærd. 4+1 er fire perspektiver med hver sin interessent, dækker både struktur og adfærd og peger på UML-diagramtyper for hvert view.',
            'De udelukker ikke hinanden. Et sekvensdiagram kan tegnes mellem system og kontekst, containers, components eller klasser — altså et process view-diagram på et valgt C4-niveau, som i tankstationseksemplet. Og tilstandsmaskinen er ifølge W05 god til asynkrone forløb mellem containers. Begge modeller leverer kun *architectural design*; beslutningerne og målene skal stadig skrives.',
          ],
        },
      ],
      viz: 'views-4plus1',
      keyPoints: [
        'Ét diagram kan ikke bære hele arkitekturen; hvert view fortæller en del af historien.',
        'Logical: end-user, functionality. Development: programmers, software management.',
        'Process: integrators, performance, scalability. Physical: system engineers, topology, communications.',
        'Scenarios (+1) er redundante, men driver og validerer arkitekturen.',
        'UML: structural diagrams (statisk) og behavioral diagrams (dynamisk).',
        'View-sættet kan udvides: data, security …',
        'Arkitekturviden = design + design decisions + goals and constraints.',
        'C4 vælger abstraktionsniveau, 4+1 vælger view.',
      ],
      exam: [
        'Kruchtens pointe er, at kasserne og pilene på ét arkitekturdiagram ikke kan betyde alt på én gang — kørende programmer, kildekode og computere. Derfor deler 4+1 beskrivelsen i fire views, hver til sin interessent.',
        'Logical view viser funktionaliteten for slutbrugeren, fx med klasse-, pakke- og tilstandsdiagrammer. Development view viser kodens organisering i moduler og lag for programmørerne. Process view viser concurrency og performance for integratorerne, fx med sekvens- og aktivitetsdiagrammer. Physical view viser, hvordan softwaren placeres på hardware, med deployment-diagrammer.',
        'Scenarierne er “+1”: de er redundante, men bruges både til at finde arkitekturelementerne og til at validere, at de fire views hænger sammen. I Kruchtens telefoncentral går et lokalt opkald gennem controller, terminal, numbering plan og conversation.',
        'Diagrammer er ikke nok: ifølge Kruchten er arkitekturviden også designbeslutningerne og mål og begrænsninger, og de skrives som tekst, fx i en ADR.',
        'C4 og 4+1 udelukker ikke hinanden. C4 svarer på, hvor langt man zoomer ind i strukturen; 4+1 på, hvilken del af historien man fortæller og til hvem. Kursets sekvensdiagram for en tankstation er process view tegnet på C4’s container-niveau.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W05_Architecture_Documentation.md'), original: D2, pages: 's. 7–27', note: 'Del 2. Sidetal er PDF-sider.' },
        { path: m('slides/SW4SWD-01_W05_Architecture_Documentation.md'), original: D1, pages: 's. 5–10, 19', note: 'Del 1: abstraktionsniveau og viewpoints (London-kortene), C4’s grænser' },
        { path: m('artikler/SW4SWD-01_4plus1_View_Kruchten_1995.md'), original: '41view-architecture_1995.pdf', pages: 's. 1–15', note: 'Figur 1 s. 2; views s. 3–9; scenarios s. 9–10; tailoring s. 13; tabel 1 s. 15' },
        { path: m('artikler/SW4SWD-01_4plus1_View_UML2.md'), original: '41view-architecture_UML2.pdf', pages: 's. 3–9', note: 'UML 2-diagrammer s. 3; figur 4 s. 8; relationer og konklusion s. 9' },
        { path: m('slides/SW4SWD-01_W04.1_Architecture_Process_1.md'), original: P1, pages: 's. 29, 32', note: 'UML-diagrammer til struktur og adfærd' },
      ],
      gaps: [
        'Slidets tabel over UML-diagrammer pr. view (W05 del 2 s. 10) og UML 2-artiklen (s. 8) er uenige. Artiklen: Logical = class, object, package, composite structure, state machine; Process = sequence, communication, activity, timing, interaction overview; Implementation = component; Deployment = deployment; Use Case view = use case og activity. Slidet nævner ikke klassediagrammet i logical view, placerer component og communication i logical view og deployment i process view.',
        'Slidet sætter kun etiketterne *Audience* og *Under Study* ved logical view (s. 9); for de andre står to linjer uden label, så det er uklart, om “Software management” er interessent eller concern. Kruchtens tabel 1 (s. 15) har andre ord: development-stakeholders er “developer, manager” med concerns “organization, reuse, portability, line-of-product”, og physical-stakeholder er “system designer”.',
        'Andre views: slidet (s. 11) og UML 2-artiklen (s. 9) foreslår data og security som ekstra views; Kruchten (s. 14) mener, at et data view kan foldes ind i logical view.',
        'Navnene varierer: Kruchten bruger Development og Physical, UML 2-artiklen Implementation og Deployment og kalder scenarierne *Use Case View*.',
        'Ugeplanen beder om at læse Wikipedias definition af 4+1; den er ikke i materialet. Kruchtens ligning fra 2009 (s. 12) har ingen kildehenvisning ud over navn og år.',
        'Materialet viser ikke et samlet sæt views for ét system. Slidenes UML-eksempler kommer fra forskellige systemer (videoudlejning, webshop, bogklub, tankstation, hæveautomat), og Kruchten har intet development view for telefoncentralen.',
      ],
      keywords: ['4+1', '4+1 view model', 'Kruchten', 'views', 'viewpoints', 'architectural views', 'logical view', 'process view', 'development view', 'implementation view', 'physical view', 'deployment view', 'scenarios', 'use case view', 'stakeholders', 'interessenter', 'N+1 views', 'data view', 'security view', 'UML 2', 'structural diagrams', 'behavioral diagrams', 'diagrams are not enough', 'architectural knowledge', 'design decisions', 'PABX', 'C4 vs 4+1'],
    },
  ],
}
