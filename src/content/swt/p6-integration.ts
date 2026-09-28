import type { Part } from '../types'
import { md } from './paths'

export const integration: Part = {
  id: 'integration',
  title: 'Integrations-, system- og accepttest',
  topics: [
    {
      slug: 'integrationstest',
      title: 'Integrationstest og dependency tree',
      short: 'Integrationstest',
      week: 'Uge 9 · 09.1',
      definition:
        'Integrationstest tester **interaktionerne og interfacene** mellem flere moduler — klasser, pakker, komponenter, hardware og eksterne systemer — med de *rigtige* klasser i stedet for fakes. Planlægningen starter med et **dependency tree**: et træ over de rigtige klassers afhængigheder, hvor en klasse står over dem, den afhænger af.',
      concepts: [
        {
          term: 'Formål og forudsætninger',
          body: [
            'Formålet er at teste samspillet og interfacene mellem moduler; målet er at verificere korrekt interaktion. Det omfatter også hardware-software-integration (drivere mod den rigtige hardware) og systemintegration (delsystemer og eksterne systemer). Verifikation kræver 100 % interface coverage — svært at måle og svært at nå.',
            'Forudsætninger: unit test af alle moduler er færdig, systemarkitekturen (afhængighederne) er kendt, og der er en integrationstestplan: hvilke moduler integreres, hvad er System Under Test (SUT), testopstillingen, og testtilfældene med stimuli og forventede svar.',
          ],
        },
        {
          term: 'Hvad integrationstest finder',
          body: [
            'Binder citerer en undersøgelse af et stort C-system, hvor næsten to tredjedele af fejlene var interface-relaterede. Typiske interfacefejl: manglende, overlappende eller modstridende funktioner; forkert metode kaldt; klienten overtræder serverens prækonditioner eller kaldsrækkefølge; forkert objekt bundet (polymorfi); forkerte parametre eller værdier; ressourcekonflikter.',
          ],
        },
        {
          term: 'Dependency tree: reglerne',
          body: [
            'Træet skal afspejle afhængighederne i den **rigtige kode** — det viser de rigtige klasser, **ikke interfacene** (selvom forbindelserne selvfølgelig *er* interfaces). Det er ikke et UML-diagram og viser ikke arv eller lag.',
            'Afhængigheder går altid fra bunden af det afhængige modul til toppen af det, det afhænger af — så der behøves ingen pile. Afhængigheder går aldrig vandret; flyt moduler ned for at undgå det. **Løkker vises som løkker** og brydes med stubs.',
          ],
        },
        {
          term: 'Sådan findes træet',
          body: [
            'Klassediagrammer (husk polymorfe klasser, interfaces og baseklasser), sekvensdiagrammer (hvilke interfaces blev faket?), unit tests (hvilke interfaces blev defineret?), søgning efter brug af baseklasser og interfaces (erstat dem med alle implementeringer — de kan være brugt implicit, fx som parametre), kaldtræer og værktøjer som Visual Studio Code Maps.',
          ],
        },
        {
          term: 'Tre fælder',
          body: [
            '**Tovejsassociation**: vælg den retning, der passer bedst til systemets flow eller giver den bedste plan; i nogle trin kan man få brug for både den rigtige og en fake udgave af en klasse. “Don’t panic – just do it!”',
            '**Events** er tovejs: handleren kender eventet, og eventet kender handleren. Ofte bruges den ene retning kun til at sætte forbindelsen op og er den mindst vigtige. Timere er ukontrollerbare afhængigheder, som man vil udskyde længst muligt.',
            '**Arv / dependency inversion**: træet viser de konkrete klasser, så arvehierarkiet vendes ofte om — `RouletteGame` afhænger af `FieldBet`, `ColorBet` og `OddEvenBet`, der afhænger af `Bet`. Afhængigheden til basen er kun nødvendig, hvis den indeholder kode.',
          ],
        },
        {
          term: 'Organisering og testtilfælde',
          body: [
            'Integrationstrinnene lægges i et eller flere separate projekter i samme solution — én test fixture pr. trin — adskilt fra [[unit-test|den grønne zone]]. Der findes intet interface coverage-værktøj, og coverage siger intet om integrationstests, men alle unit test-værktøjer kan bruges.',
            'Testtilfælde kommer fra delvise use cases (sekvensdiagrammer), fra top-enhedens unit tests (kun dem, hvor effekten når ud over top-enheden) og fra de lavere enheders unit tests (hvordan blev deres interfaces udøvet, og kan det tvinges igennem top-enheden?).',
          ],
        },
      ],
      viz: 'dep-tree',
      keyPoints: [
        'Integrationstest: interaktion og interfaces mellem rigtige moduler.',
        'Forudsætning: unit tests færdige, afhængigheder kendt, plan lagt.',
        'Dependency tree viser rigtige klasser, ikke interfaces.',
        'Afhængighed går nedad fra bunden af den ene til toppen af den anden — ingen pile, ingen vandrette linjer.',
        'Løkker (tovejs, events) vises som løkker og brydes med stubs.',
        'Arvehierarkier vendes om: konkrete klasser over basen.',
        '**Eksamen:** delopgaven “vis et dependency-træ og redegør for, hvordan du finder afhængighederne” (E19 delopgave 8, F19re delopgave 9) og V22-23 delopgave 7 (“forskellen mellem unit test og integrationstest”).',
      ],
      exam: [
        'En unit test tester én klasse isoleret med fakes for dens afhængigheder. En integrationstest bruger de rigtige klasser og tester deres interaktion og interfaces — det er her, fejl som forkerte parametre eller forkert kaldsrækkefølge viser sig.',
        'Planlægningen starter med et dependency tree: de rigtige klasser, med hver klasse over dem, den afhænger af. Jeg finder afhængighederne i klassediagrammet, konstruktørparametrene og sekvensdiagrammerne, og interfaces erstattes af de klasser, der implementerer dem.',
        'Tovejsforbindelser som events giver løkker. Jeg vælger den retning, der passer til systemets flow, og bryder løkken med en stub i de trin, hvor det er nødvendigt.',
      ],
      sources: [
        { path: md('09.1-2-integrationstest/02-Integrationtest-introduction.pdf-9.1.md'), original: 'Integrationtest introduction.pdf', pages: 's. 2–15, 51–53' },
        { path: md('09.1-2-integrationstest/50-Ch13-Binder-Integration-Test-Patterns.md'), original: 'Ch13-Binder Integration Test Patterns.pdf', pages: 'PDF s. 8–9 (bog s. 640–643)' },
        { path: md('09.1-2-integrationstest/01-Laesning.md'), note: 'Læsevejledning: Fowler og Binder kap. 13' },
      ],
      gaps: [
        'Slide 5 kræver “100 % interface coverage”, slide 51 siger, at der ikke findes et interface coverage-værktøj. Materialet siger ikke, hvordan man så måler det.',
        'Slidene kalder dependency tree “a new type of diagram”; Binder (afsnit 13.1.3, bog s. 634–641, PDF s. 5–8) laver afhængighedsanalysen med `tsort` og “is-used-by”-relationer i stedet for et tegnet træ.',
        'Martin Fowlers artikel om, hvad “integration test” betyder i dag, er kun et link i læsevejledningen, ikke en del af materialet.',
      ],
      keywords: ['integrationstest', 'integration test', 'dependency tree', 'afhængighedstræ', 'DT', 'SUT', 'system under test', 'interface', 'interface coverage', 'bidirectional', 'tovejs', 'event', 'arv', 'dependency inversion', 'Binder', 'interface fault', 'unit vs integration'],
    },

    {
      slug: 'integrationsmoenstre',
      title: 'Integrationsmønstre: big bang, bottom-up, top-down, collaboration og sandwich',
      short: 'Integrationsmønstre',
      week: 'Uge 9 · 09.1',
      definition:
        'Et integrationsmønster bestemmer rækkefølgen, modulerne integreres i. **Big bang** integrerer alt på én gang. **Bottom-up** starter fra bladene med testdrivere. **Top-down** starter fra toppen med stubs under. **Collaboration** integrerer én use case ad gangen. **Sandwich** går fra begge ender og mødes i midten.',
      concepts: [
        {
          term: 'Notationen',
          body: [
            'I slidenes diagrammer er **T** top-modulet i SUT (det, testdriveren taler med), **D** testdriveren (testkoden), **X** et andet modul med i trinnet, **S** en stub eller mock, og **IUT** *Interface Under Test*. Moduler uden mærke er ikke med. Eksempeltræet har tre rødder (A, L og N) og en hardware-boks under G.',
          ],
        },
        {
          term: 'Big bang',
          body: [
            'Første, sidste og eneste trin: alle moduler på én gang. “Fire it up, see it fail.” Kun muligt sent, hvor fejl er dyre at rette; meget lidt feedback og meget lav sandsynlighed for at finde fejl. Virker (nogle gange) for små, simple og stabile systemer.',
          ],
        },
        {
          term: 'Bottom-up',
          body: [
            'Start med bladene og byg opad; hvert trin får en driver ovenpå. Fordele: ingen (få) stubs, let at dække interfaces på alle niveauer. Ulemper: kræver mange drivere på forskellige niveauer, og de kritiske kontrolklassers interfaces testes sidst. “Reflects very engineering-like mindset.”',
          ],
        },
        {
          term: 'Top-down',
          body: [
            'Start med top-modulet og stubs for alt nedenunder; erstat stubs med rigtige moduler et niveau ad gangen. Fordele: tidlig feedback på kontrolkomponenterne, og HW og SW kan udvikles samtidig. Ulemper: svært at udøve lavniveau-interfaces fra toppen, og der skal mange stubs til — “OK with isolation framework”.',
          ],
        },
        {
          term: 'Collaboration',
          body: [
            'Vælg rækkefølgen efter samarbejder: integrér de klasser, der tilsammen realiserer én use case, og stub resten; til sidst fyldes hullerne. Fordele: intuitivt for brugere (følger use cases), godt til system- og delsystemtest, afspejler iterativ udvikling med use cases som enhed. Ulemper: svært at udøve lavniveau-interfaces, deltagerne testes ikke hver for sig, mange stubs.',
          ],
        },
        {
          term: 'Sandwich',
          body: [
            'Start fra bunden — evt. hardware-integration — og samtidig fra toppen med stubs; gå et niveau ad gangen, til top og bund mødes. “The best of top down and bottom up”; mange af ulemperne mildnes, men det kræver meget planlægning.',
            'Binder har ikke sandwich som selvstændigt mønster. Han nævner Myers’ sandwich under *Layer Integration* og har desuden *Backbone* (top-down, bottom-up og big bang kombineret), *Client/Server*, *Distributed Services* og *High-frequency Integration*.',
          ],
        },
        {
          term: 'Best practice',
          body: [
            'Automatisér (manuelle trin bliver ikke udført), integrér med høj frekvens — fx nightly CI-builds for hvert testscenarie — og brug test- og isolation frameworks mest muligt. Det er lettere at kode stubs end drivere. Brug lidt af alle mønstre — undtagen big bang.',
          ],
        },
      ],
      viz: 'integration-patterns',
      keyPoints: [
        'Big bang: alt på én gang — sen, dyr og uden feedback.',
        'Bottom-up: blade først, mange drivere, få stubs; kontrolklasser sidst.',
        'Top-down: top først, mange stubs; tidlig feedback på kontrol.',
        'Collaboration: én use case ad gangen.',
        'Sandwich: fra begge ender mod midten; kræver planlægning.',
        'Stubs er lettere end drivere — og isolation frameworks gør top-down billig.',
        '**Eksamen:** “redegør for, hvilke integrationstest-strategier du har anvendt i din testplan” (E19 delopgave 9, F19re delopgave 10).',
      ],
      exam: [
        'Bottom-up starter ved bladene i dependency tree og bygger opad med en testdriver på toppen af hvert trin. Der skal næsten ingen stubs til, men kontrolklasserne øverst testes sidst.',
        'Top-down starter med top-modulet og stubs for alt under det og erstatter stubs med rigtige klasser et niveau ad gangen. Det giver tidlig feedback på kontrollogikken, og med NSubstitute er stubbene billige.',
        'Sandwich kombinerer de to og lader dem mødes i midten. Big bang frarådes: fejlene findes sent, og man kan ikke se, hvilket interface der fejler.',
      ],
      sources: [
        { path: md('09.1-2-integrationstest/02-Integrationtest-introduction.pdf-9.1.md'), original: 'Integrationtest introduction.pdf', pages: 's. 16–39, 54' },
        { path: md('09.1-2-integrationstest/50-Ch13-Binder-Integration-Test-Patterns.md'), original: 'Ch13-Binder Integration Test Patterns.pdf', pages: 'PDF s. 9 og 31 (bog s. 642–643, 686–687)' },
      ],
      gaps: [
        'Binder (PDF s. 9) skriver, at afsnittet præsenterer “nine” mønstre, men opremser otte; det niende, *High-frequency Integration*, kommer senere i kapitlet.',
        'Big bang-slidet (s. 20) har sedlen “Works (sometimes) for small, low-complexity, stable, systems” to gange, én blå og én gul.',
        'Slidene viser trinnene som grafik uden tekst; hvilke moduler der er X og S i hvert trin, ses kun i billederne.',
      ],
      keywords: ['integrationsmønster', 'integration pattern', 'big bang', 'bottom-up', 'top-down', 'collaboration', 'sandwich', 'backbone', 'layer integration', 'client/server', 'high-frequency integration', 'driver', 'stub', 'Binder', 'Myers'],
    },

    {
      slug: 'integrationsplan',
      title: 'Integrationsplan: Roulette og mikrobølgeovnen',
      short: 'Integrationsplan',
      week: 'Uge 9 · 09.2',
      definition:
        'En integrationsplan er en trin-for-trin-plan, der for hvert trin angiver hvilke moduler der er med (**X**), hvilke der er fakes (**S**), og hvilket der er top-modulet, som testdriveren taler med (**T**). Målet er at udøve alle rigtige interfaces mellem modulerne og arbejde hen mod et komplet system. Kanterne i dependency tree nummereres med det trin, de testes i.',
      concepts: [
        {
          term: 'Planens mål',
          body: [
            'Udøv alle rigtige interfaces og nå et komplet system. Kombinér mønstrene efter hvad der er vigtigt: hardwareintegration, brugbarhedstest, kundedemonstration, prototyper, feasibility. For hvert trin: hvilke moduler er med, hvilke er faket, og hvilket er top-modulet i SUT.',
            'Markeringer i træet: **U** = afhængigheden er allerede testet i unit test, et tal = det trin, hvor den udøves, **F** = afhængigheden fakes hele vejen og erstattes aldrig.',
          ],
        },
        {
          term: 'Roulette: bottom-up i otte trin',
          body: [
            'Roulette-spillets træ: `UI` øverst med forbindelse til næsten alle klasser, `RouletteGame` under den, og nedenunder `RouletteGameException`, `Output`, `Roulette`, `FieldBet`, `EvenOddBet`, `ColorBet`; så `Randomizer`, `FieldFactory` og `<<abstract>> Bet`; nederst `Field`.',
            'Bottom-up-planen: trin 1 driver `Roulette` med `Randomizer` stubbet og rigtig `FieldFactory` og `Field`; trin 2–4 driver hver bet-klasse med rigtig `Field`; trin 5 driver `Roulette` med rigtig `Randomizer`; trin 6–7 driver `RouletteGame` med `Output` stubbet (og i trin 6 også `Randomizer`); trin 8 er alt rigtigt — “difficult to automate because of output to console!”.',
            'Top-down-planen har syv trin med `RouletteGame` som T hele vejen og stubs, der skiftes ud nedefra.',
          ],
        },
        {
          term: 'Black box til test, white box til planlægning',
          body: [
            'I et trin testes SUT udefra gennem top-modulet — med “black box eyes”. Planlægningen, altså hvilke moduler der er inde i rammen, og hvilke interfaces trinnet skal ramme, sker med “white box eye”.',
          ],
        },
        {
          term: 'Mikrobølgeovnen',
          body: [
            'Træet: `Button` og `Door` øverst over `UserInterface`; `UserInterface` over `CookController`, `Light` og `Display`; `CookController` over `PowerTube`, `Timer` og `Display`; nederst `Output`, som `Light`, `PowerTube` og `Display` skriver til. Der er løkker mellem `Button`/`Door` og `UserInterface` (events), mellem `UserInterface` og `CookController` og mellem `Timer` og `CookController`.',
            'Løsningens bottom-up-plan lader `Output` være fake hele vejen (**F**): trin 1 driver `CookController` med rigtig `PowerTube`, `Timer` og `Display` og `UserInterface` stubbet (løkken); trin 2 driver `UserInterface` med `Button` og `Door` stubbet; trin 3 driver fra `Button` og `Door`. Top-down-planen går den anden vej: `Button` og `Door` er T i alle trin, og stubbene for `Light`, `Display`, `CookController`, `PowerTube`, `Timer` og `Output` erstattes trin for trin.',
            'I aflevering 3 skal dependency tree og integrationsplan laves for den udvidede ovn — men integrationstestene skal ikke implementeres.',
          ],
        },
      ],
      viz: 'integration-plan',
      keyPoints: [
        'T = top-modul (drives), X = rigtigt modul, S = fake.',
        'Tal på kanterne = trinnet, hvor afhængigheden udøves; U = unit-testet; F = altid fake.',
        'Hvert trin: én ramme om SUT, én driver ovenpå, stubs under.',
        'Black box til at teste trinnet, white box til at planlægge det.',
        'Konsol-output er svært at automatisere — `Output` fakes i mikrobølgeovnen.',
        '**Eksamen:** “vis en plan for integrationstesten med udgangspunkt i dit dependency-træ” (E19 delopgave 9, F19re delopgave 10) og aflevering 3.',
      ],
      exam: [
        'Min integrationsplan er en tabel med ét trin pr. række. For hvert trin står der, hvilken klasse der er top-modul og drives af testen, hvilke der er med som rigtige klasser, og hvilke der stadig er fakes.',
        'Jeg har valgt bottom-up, fordi de nederste klasser er simple og kan integreres uden stubs, og markeret i dependency tree, i hvilket trin hver afhængighed testes. Output til konsollen fakes hele vejen, fordi den er svær at automatisere.',
        'Hvert trin testes black box gennem top-modulet, men planlægningen er white box: jeg ser ind i træet for at vælge, hvilke interfaces trinnet skal ramme.',
      ],
      sources: [
        { path: md('09.1-2-integrationstest/02-Integrationtest-introduction.pdf-9.1.md'), original: 'Integrationtest introduction.pdf', pages: 's. 40–50, 55' },
        { path: md('09.1-2-integrationstest/50-DependencyTreeAndIntegrationPlan.md'), original: 'DependencyTreeAndIntegrationPlan.pdf', pages: 's. 1–4' },
        { path: md('09.1-2-integrationstest/50-RouletteGameDepTree.md'), original: 'RouletteGameDepTree.pdf', pages: 's. 1' },
        { path: md('09.1-2-integrationstest/50-ExampleRoulette.md'), original: 'ExampleRoulette.pdf', pages: 's. 1–2' },
        { path: md('10.1-10.2-hand-in-3/01-SWT-IntroductionHandin3.md'), original: 'SWT-IntroductionHandin3.pdf', pages: 's. 2–4' },
      ],
      gaps: [
        'Klassediagrammet i ExampleRoulette.pdf kalder klassen `OddEvenBet`; dependency tree og slides kalder den `EvenOddBet`.',
        'Mikrobølgeovnens top-down-tabel (løsnings-PDF’en med dependency tree og plan, s. 4) har “X / S” for `Timer` i trin 3 uden forklaring. Bottom-up-tabellen sætter `Output` til X i Final, selvom træets kanter til `Output` er mærket F.',
        'Selve tabellerne og trænes kanter findes kun som billeder; markdown-konverteringen har teksten, men ikke forbindelserne.',
        'Hand-in 3 kræver dependency tree og plan, men “integration tests are not needed” (SWT-IntroductionHandin3.pdf s. 2).',
      ],
      keywords: ['integrationsplan', 'integration plan', 'T X S', 'dependency tree', 'Roulette', 'RouletteGame', 'mikrobølgeovn', 'microwave', 'bottom-up', 'top-down', 'driver', 'stub', 'Output', 'black box eye', 'white box eye', 'aflevering 3', 'handin 3'],
    },

    {
      slug: 'agil-integration',
      title: 'Agil integration og systemintegration',
      short: 'Agil integration',
      week: 'Uge 9 · 09.2',
      definition:
        'I en iterativ proces integreres løbende: hver iteration tilføjer lidt funktionalitet, så en mini-big bang, collaboration (én use case) eller top-down (vis look and feel tidligt) kan være nok. På **systemniveau** integreres containere og eksterne systemer; det forberedes på unit-niveau ved at indkapsle eksterne afhængigheder lavt, så mest muligt kan dækkes af automatiske tests. Arkitekturen beskrives med **C4**.',
      concepts: [
        {
          term: 'Traditionel integration har stadig sin plads',
          body: [
            'Når man ikke arbejder iterativt; når man har lavet mange testede enheder, før de sættes sammen; som planlagt risikoreduktion i komplekse systemer eller med ny teknologi; som (uplanlagt) redning ved alvorlige problemer; og som almen viden for en softwareingeniør.',
          ],
        },
        {
          term: 'Strategier i en iterativ proces',
          body: [
            '**Big bang** kan virke, fordi den tilføjede funktionalitet pr. iteration er lille. **Collaboration**: tilføjelsen er typisk en use case — de samarbejdende klasser integreres, “like a mini (!) big bang”. **Top-down**: man kan vise produktejer og kunde systemets look and feel tidligt.',
          ],
        },
        {
          term: 'C4',
          body: [
            'Simon Browns C4-model har fire niveauer: **Context** (system og personer, kan vises til ikke-teknikere), **Containers** (separat kørbare/deploybare enheder — web-apps, mobilapps, databaser), **Components** og **Code**. På containerniveau bliver interfacene internt og eksternt mellem systemerne synlige (røde).',
            'På komponentniveau skal komponenterne designes, så automatisk unit- og komponenttest dækker mest muligt (grøn), og så systemintegrationen kan gøres manuelt eller med mindre arbejde (rød).',
          ],
        },
        {
          term: 'Systemintegration forberedes på unit-niveau',
          body: [
            'Brug testbart design med veldefinerede interfaces; udskyd afhængigheder til eksterne systemer ved at indkapsle dem på lavt niveau; test logikken først i unit tests; test indkapslingerne med fakes for de eksterne systemer — eller vent til systemintegrationen.',
            'Relevante mønstre: façade, repository, lagdelt arkitektur, message bus og dependency injection på systemniveau. Relevante værktøjer: GUI-testværktøjer, in-memory databasemocks, egne testdatabaser og testsystemer, web service-simulatorer og -testere.',
          ],
        },
      ],
      viz: 'c4-integration',
      keyPoints: [
        'Iterativt: lille tilvækst pr. iteration → mini-big bang, collaboration eller top-down.',
        'C4: Context → Containers → Components → Code.',
        'Interfaces mellem containere er systemintegrationens grænser.',
        'Design komponenter, så automatiske tests dækker mest (grønt); lad systemintegrationen være lille (rødt).',
        'Indkapsl eksterne systemer lavt og test logikken først.',
        '**Eksamen:** perspektiv på “unit- vs. integrationstest” og på CI’s rolle i integration.',
      ],
      exam: [
        'I en iterativ proces er tilvæksten pr. iteration lille, så integrationen kan følge use cases — en collaboration-integration, der er som en lille big bang — eller top-down, så produktejeren ser systemet tidligt.',
        'På systemniveau er det interfacene mellem containere og eksterne systemer, der skal integreres. Dem forbereder jeg ved at indkapsle de eksterne afhængigheder bag interfaces på lavt niveau, så logikken kan unit-testes med fakes.',
      ],
      sources: [
        { path: md('09.1-2-integrationstest/50-ContinuousAgileIntegration.md'), original: 'ContinuousAgileIntegration.pdf', pages: 's. 2–12' },
        { path: md('09.1-2-integrationstest/03-Lektion-09.2-Agil-og-systemintegration.md') },
      ],
      gaps: [
        'C4-eksemplerne (Internet Banking System) er fra c4model.com og er kun gengivet som billeder på slides 5–9; markdown-konverteringen mangler detaljerne.',
        'Artiklen “You can’t buy integration” (Byars) er kun et link og beskrives af underviseren som avanceret og ikke direkte brugbar i semesterprojekterne.',
        'Materialet definerer ikke “agil integration” ud over slidenes titel.',
      ],
      keywords: ['agil integration', 'continuous integration', 'systemintegration', 'system integration', 'iterativ', 'C4', 'Simon Brown', 'context', 'container', 'component', 'façade', 'repository', 'message bus', 'in-memory database', 'simulator'],
    },

    {
      slug: 'systemtest',
      title: 'Automatiseret system- og accepttest',
      short: 'System- og accepttest',
      week: 'Uge 13 · 13.2',
      definition:
        'Systemtest kører på det **komplette system i det rigtige miljø** og tester også aspekter, der er mindre relevante for unit- og integrationstest (brugbarhed, ydelse, sikkerhed …). Accepttest verificerer kravene. Automatiseret systemtest er enten **GUI-test** eller **eksekverbare specifikationer**, hvor kravene skrives i et sprog som Gherkin, der både er specifikation og accepttest.',
      concepts: [
        {
          term: 'Ligheder og forskelle',
          body: [
            'Som andre tests kræver systemtest en opstilling, forventet og faktisk output og en vurdering, og kontrol af eksterne afhængigheder gør det lettere. Men den kører på det komplette system, hvilket gør validering sværere; den tester mange aspekter; og den kører i det rigtige miljø, ikke på en testbænk.',
            'Typer: usability, funktionalitet, performance, skalerbarhed, pålidelighed, load/stabilitet, sikkerhed …',
          ],
        },
        {
          term: 'Automatisering: for og imod',
          body: [
            'For: gentagelig, objektiv, udtømmende (coverage), de bliver faktisk kørt, og man behøver ikke en bruger eller produktejer. Imod: kan være svær eller dyr at bygge eller ligne virkelig brug dårligt; en dårlig undskyldning for ikke at involvere brugeren; truer brugerfeedbacken i agile processer; monkey tests og eksplorative tests er ikke med.',
          ],
        },
        {
          term: 'Verifikation og validering',
          body: [
            '**Verifikation** — gjorde vi det rigtigt? Struktureret og disciplineret deduktion af, om vi har gjort alt det specificerede korrekt, fx med automatiske tests. **Validering** — lavede vi det rigtige? Åben og disciplineret vurdering af, om specifikationen var god nok, fx ved at lade brugeren bruge systemet.',
          ],
        },
        {
          term: 'GUI-test',
          body: [
            'Grafisk/lavniveau: eksakte X/Y-koordinater, mus og tastatur, pixel-for-pixel- eller intelligent billedsammenligning (OCR/AI) — egnet til look and feel. Via **DOM**: UI-elementernes id’er bruges til at klikke og skrive, og deres indhold og tilstand tjekkes — egnet til test på tværs af platforme.',
            'Artiklen fra *Ingeniøren* (2017) om e-conomic viser en virksomhed, der erstatter manuelle testere med automationstestere: Selenium fjernstyrer browseren, Cucumber-scenarier skrives sammen med produktejerne, før koden skrives.',
          ],
        },
        {
          term: 'Eksekverbare specifikationer',
          body: [
            'Kravene oversættes til en eksekverbar specifikation, der samtidig er accepttesten — de to øverste niveauer i V-modellen (krav ↔ accepttest, systemspecifikation ↔ systemtest). Det er **BDD**, behavior driven development. Kan kombineres med GUI-test: scenariet “Given weight 92 kg and height 1.93 m, When Calculate BMI is pressed, Then BMI should be 24.7” køres gennem et GUI-testframework.',
            'Fordele: brugeren/produktejeren kommer tættere på, det er mere præcist end fritekst, krav og testspecifikation samles, og det understøtter user stories og agile processer. Ulemper: de generelle ovenfor, man får kun et kodeskelet, og stoler brugeren på oversættelsen? Detaljerne er i [[gherkin|Gherkin og Reqnroll]].',
          ],
        },
      ],
      viz: 'exec-spec',
      keyPoints: [
        'Systemtest: hele systemet, rigtigt miljø, mange aspekter.',
        'Verifikation: gjorde vi det rigtigt? Validering: lavede vi det rigtige?',
        'Automatiseret systemtest = GUI-test eller eksekverbare specifikationer.',
        'GUI-test: koordinater og billeder, eller DOM-id’er.',
        'Eksekverbar specifikation = krav + accepttest i ét (BDD).',
        'Automatisering er ingen undskyldning for ikke at involvere brugeren.',
        '**Eksamen:** læringsmålet om system- og accepttest; ingen af de fem gamle sæt har et delspørgsmål om det.',
      ],
      exam: [
        'Systemtest kører på hele systemet i det rigtige miljø og kan teste ting som ydelse og brugbarhed, som ikke giver mening i unit test. Accepttest tjekker kravene.',
        'Automatisk systemtest verificerer — gjorde vi det rigtigt — men validering, om vi lavede det rigtige, kræver stadig brugeren.',
        'Med eksekverbare specifikationer i Gherkin er kravet og accepttesten det samme dokument: produktejeren kan læse scenariet, og vi binder hvert trin til testkode.',
      ],
      sources: [
        { path: md('13.2-automatisering-af-system-og-accepttest/01-Automated-System-Test-New.pdf.md'), original: 'Automated System Test New.pdf', pages: 's. 2–12, 24–25' },
        { path: md('13.2-automatisering-af-system-og-accepttest/50-automatiserede-tests-figur.md'), original: 'Autmoatiserede tests.jpg', note: 'Ingeniøren, 15. december 2017' },
      ],
      gaps: [
        'Materialet adskiller ikke systemtest og accepttest skarpt ud over V-modellen: slidene behandler dem sammen.',
        'Slide 5 nævner “exhaustive/comprehensive (code coverage)” som fordel ved automatiseret systemtest, men integrationstest-slidene siger, at coverage ikke kan bruges til at sige noget om integrationstests (Integrationtest introduction.pdf s. 53). Forholdet mellem systemtest og coverage forklares ikke.',
        'Slide 9 nævner FitNesse til DOM-baserede tests, men materialet viser ingen GUI-test i .NET.',
      ],
      keywords: ['systemtest', 'system test', 'accepttest', 'acceptance test', 'verifikation', 'validering', 'verification', 'validation', 'GUI test', 'DOM', 'executable specification', 'eksekverbar specifikation', 'BDD', 'Selenium', 'Cucumber', 'monkey test', 'explorative test', 'e-conomic'],
    },

    {
      slug: 'gherkin',
      title: 'Gherkin og Reqnroll',
      short: 'Gherkin og Reqnroll',
      week: 'Uge 13 · 13.2',
      definition:
        '**Gherkin** er et eksekverbart specifikationssprog: en `Feature` har `Scenario`’er, der hver består af `Given` (Arrange), `When` (Act) og `Then` (Assert). **Reqnroll** (efterfølgeren til SpecFlow) genererer **step definitions** — C#-metoder med `[Given]`, `[When]` og `[Then]`, hvis regulære udtryk matcher trinnene — og kører dem med NUnit som test runner.',
      concepts: [
        {
          term: 'Gherkin',
          body: [
            'Beskrevet oprindeligt i Cucumber-projektet, der konverterer en specifikation til et kodeskelet; overtaget af bl.a. SpecFlow til C#. Krav på (i princippet) alle niveauer formuleres som sekvenser af forudsætninger og aktiviteter i næsten normalt sprog.',
            'Strukturen: en eksekverbar specifikation har en eller flere features; en feature har et eller flere scenarier; et scenarie har Given-, When- og Then-trin. Trin kan genbruges mellem scenarier, og med context injection også mellem features. `@power1` er et tag på scenariet.',
          ],
        },
        {
          term: 'Arbejdsgangen',
          body: [
            'Opret et NUnit-testprojekt og installér `Reqnroll.Nunit` — så kører Gherkin-testene med `dotnet test` eller IDE’ens runner. 1) opret en `.feature`-fil, 2) skriv features og scenarier, 3) generér skeletter til step definitions (højreklik → *Generate Step Definitions*; i VS Code Ctrl+Alt+2), 4) udfyld koden, 5) kør testene. Ligesom TDD kan testene fra features drive koden — det er BDD.',
          ],
        },
        {
          term: 'Step definitions',
          body: [
            'En `[Binding]`-klasse har en metode pr. trin. Det genererede skelet indeholder `ScenarioContext.Current.Pending();`, der skal erstattes. `[When(@"I press the power button (.*) time\\(s\\)")]` genbruges for alle antal, fordi værdien matches af et regulært udtryk og bliver et parameter.',
            'I mikrobølgeovnen opretter Given-trinnet **hele systemet** med rigtige klasser — `Button`, `Door`, `Timer`, `Display`, `PowerTube`, `Light`, `CookController`, `UserInterface` — og kun `IOutput` som substitute. “Like with integration testing, we aim to test the system, not just units! (Minimize the use of fakes to hardware, external resources etc.)” Then-trinnet asserter på output: `Received(1).OutputLine(…"Display shows: {p0} W")`.',
          ],
        },
        {
          term: 'Context injection',
          body: [
            'Hver feature har sin egen klasse, så data (fx et helt sat-op system) kan ikke umiddelbart deles mellem features. Med **context injection** lægges systemets objekter i en separat klasse, `MicrowaveContext`, som Reqnroll automatisk injicerer i step-klassernes konstruktør. Ekstra setup kan laves med hooks. Artiklen om context injection bruger “POCO” om en DTO.',
          ],
        },
      ],
      viz: 'gherkin-steps',
      keyPoints: [
        'Feature → Scenario → Given (Arrange) / When (Act) / Then (Assert).',
        '`Reqnroll.Nunit` kører Gherkin med `dotnet test`.',
        'Step definition = metode med `[Given]`/`[When]`/`[Then]` og et regex.',
        '`(.*)` i regex’et bliver et parameter, så trinnet kan genbruges.',
        'Given bygger hele systemet med rigtige klasser; kun hardware/ydre ressourcer fakes.',
        'Context injection deler systemet mellem features.',
        '**Eksamen:** læringsmålet om værktøjer til system- og accepttest.',
      ],
      code: [
        {
          lang: 'gherkin',
          title: 'Feature og scenarie',
          source: 'Automated System Test New.pdf s. 11',
          code: `Feature: MicrowavePower
  I want to cook or heat my food at the correct power

@power1
Scenario: Set Power once
  Given The oven is reset
  When I press the power button 1 time(s)
  Then the display should show 50 W`,
        },
        {
          lang: 'csharp',
          title: 'When og Then som step definitions',
          source: 'Automated System Test New.pdf s. 19',
          code: `[When(@"I press the power button (.*) time\\(s\\)")]
public void WhenIPressThePowerButtonTimeS(int p0)
{
    for (int i = 0; i < p0; ++i)
        powerButton.Press();
}

[Then(@"then the display should show (.*) W")]
public void ThenThenTheDisplayShouldShowW(int p0)
{
    output.
        Received(1).
        OutputLine(Arg.Is<string>(str =>
            str.Contains($"Display shows: {p0} W")));
}`,
        },
        {
          lang: 'csharp',
          title: 'Given: hele systemet, kun Output er fake',
          source: 'Automated System Test New.pdf s. 21',
          code: `[Given(@"System is reset")]
public void GivenSystemIsReset()
{
    _context.Output = Substitute.For<IOutput>();
    _context.PowerButton = new Button();
    _context.TimeButton = new Button();
    _context.StartCancelButton = new Button();
    _context.Door = new Door();
    _context.Timer = new Timer();
    _context.Display = new Display(_context.Output);
    _context.PowerTube = new PowerTube(_context.Output);
    _context.Light = new Light(_context.Output);
    _context.Cooker = new CookController(_context.Timer,
        _context.Display, _context.PowerTube);
    _context.UI = new UserInterface(
        _context.PowerButton, _context.TimeButton, _context.StartCancelButton,
        _context.Door, _context.Display, _context.Light, _context.Cooker);
    _context.Cooker.UI = _context.UI;
}`,
        },
      ],
      exam: [
        'Gherkin beskriver en feature som scenarier med Given, When og Then — det svarer til Arrange, Act og Assert, men i et sprog produktejeren kan læse.',
        'Reqnroll genererer en step definition pr. trin. Værdier i trinnet fanges af et regulært udtryk og bliver parametre, så samme trin kan genbruges.',
        'I Given bygger jeg hele systemet med de rigtige klasser og faker kun det, der vender ud mod hardware — i mikrobølgeovnen `IOutput`. Then asserter på, hvad systemet skrev ud.',
      ],
      sources: [
        { path: md('13.2-automatisering-af-system-og-accepttest/01-Automated-System-Test-New.pdf.md'), original: 'Automated System Test New.pdf', pages: 's. 11–23' },
        { path: md('13.2-automatisering-af-system-og-accepttest/03-Gherkin-dokumentation.md') },
        { path: md('13.2-automatisering-af-system-og-accepttest/04-ReqnrollSpecflow-dokumentation.md') },
        { path: md('13.2-automatisering-af-system-og-accepttest/05-Flere-feature-filer-i-SpecFlow.md') },
        { path: md('11.1-12.2-obligatorisk-opgave-iii/50-MicrowaveSeqTotal.md'), original: 'MicrowaveSeqTotal.pdf', note: 'Signalvejen i figuren (OnPowerPressed, ShowPower); diagrammet kalder sidste kald LogLine, testkoden OutputLine' },
      ],
      gaps: [
        'Feature-filen siger “Then the display should show 50 W”, men step-regex’et er `then the display should show (.*) W` — metoden hedder `ThenThenTheDisplayShouldShowW`. Det genererede skelet har fået “then” med to gange.',
        'Given-trinnet hedder “The oven is reset” på s. 17–18 og “System is reset” på s. 21; When- og Then-teksterne er også formuleret forskelligt på s. 19 og s. 22.',
        'Slide 17 bruger `ScenarioContext.Current.Pending()`. Uden for materialet: `ScenarioContext.Current` er forældet i nyere SpecFlow/Reqnroll til fordel for injiceret kontekst.',
        'Brightspace-siden beskriver Reqnroll som en Visual Studio-extension installeret fra *Extensions and Updates*; slide 14 siger NuGet-pakken `Reqnroll.Nunit`. Begge dele bruges.',
      ],
      keywords: ['Gherkin', 'Reqnroll', 'SpecFlow', 'Cucumber', 'feature', 'scenario', 'Given When Then', 'step definition', 'Binding', 'BDD', 'behavior driven development', 'context injection', 'ScenarioContext', '.feature', 'Microwave', 'mikrobølgeovn', 'hooks'],
    },
  ],
}
