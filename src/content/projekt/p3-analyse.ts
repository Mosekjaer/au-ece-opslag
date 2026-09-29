import type { Part } from '../types'
import { k } from './paths'

/* Del 3: fra use cases til den første software-struktur. Domænemodel (hvad findes i
   virkeligheden), applikationsmodel (hvilke klasser softwaren får), sekvensdiagram
   (hvem kalder hvem) og state machine (hvordan en klasse reagerer afhængigt af
   tilstand). Cases: SmartFridge (E2015), ATM Withdraw Cash, RVM og minuturet. */

export const analyse: Part = {
  id: 'analyse',
  title: 'Analyse',
  topics: [
    {
      slug: 'domaenemodel',
      title: 'Domæneanalyse og domænemodel',
      short: 'Domænemodel',
      week: 'Iteration 1',
      definition:
        '**Systemdomæneanalyse** afgrænser systemets domæne: de begreber fra virkeligheden, systemet skal tage hensyn til og huske. Resultatet er **domænemodellen** — et UML-klassediagram med begreber (*conceptual classes*), associationer med relationstekst og læsepil, multipliciteter og attributter uden typer. Ingen metoder.',
      intro: [
        'Domænemodellen er det første skridt fra *hvad* systemet skal gøre (kravene) til *hvordan* (designet). Den bygges af de fully dressed use cases og bliver input til [[applikationsmodel|applikationsmodellen]]. Materialet placerer den i **Systemarkitektur-dokumentet**, ikke i kravspecifikationen.',
      ],
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'Efter kravspecifikationen, som første aktivitet i arkitekturen: Specifikation → *Use Case og andre specs* → Domæneanalyse → **Domænemodel** → Indledende SW-design → Applikationsmodel. Input er [[fully-dressed-uc|fully dressed use cases]] og dialog med kunde, brugere og product owner; output er et eller flere klassediagrammer.',
            'Arbejd iterativt: tag én eller et par use cases ad gangen, nemlig dem, der skal laves i de første iterationer. Artiklen siger det ligeud: “En Domænemodel bliver nok aldrig færdig.”',
          ],
        },
        {
          term: 'Artefaktet',
          body: [
            'Et klassediagram, hvor hvert begreb er en klasse. Associationer har en **relationstekst** med ét udsagnsord og en **læsepil** (▶ ◀ ▲ ▼ eller `<`, `>`, `^`, `v` i teksten), men **ingen pile i enderne** — navigerbarhed er en implementationsdetalje. Attributter har **ingen typer**, og klasserne har **ingen metoder**: “Begreber i virkeligheden kan ikke kalde metoder.”',
            'Den er en **visuel ordbog**: den fastlægger navnene, så kunde, udviklere og testere bruger de samme ord, og en ny medarbejder hurtigt får overblik. Begreberne er fra virkeligheden: “Køretøj” og “Betaling” er ok; “SQLDatabase” og “string” er ikke.',
          ],
        },
        {
          term: 'Kogebogen i fire skridt',
          body: [
            '**Skridt 1 — begreber.** 1.1: markér navneordene i use cases og specifikationer (aktørerne tæller med). 1.2: gå kategorilisten igennem (transaktion, transaktionslinje, fysisk genstand, register, katalog, eksternt system, aktør, beskrivelse, transaktionsbevis, betalingsmiddel …) for at finde underforståede begreber. “Hellere lidt for mange begreber … end for få” på dette tidspunkt.',
            '**Skridt 2 — relationer.** 2.1: find udsagnsordene, der forbinder begreberne, og tegn dem som associationer. 2.2: brug relationslisten (“A er en transaktionslinje i B”, “A er fysisk indeholdt i B”, “A bruger eller ejer B” …). Et begreb uden association mangler enten en relation eller er irrelevant.',
            '**Skridt 3 — multiplicitet.** Set fra **én instans af systemet**. Typisk `1`, `*`, `0..1`, `1..*`; et eksakt tal (`1..4`) kun hvis det er vigtigt for product owner. En 1-til-1-association må stå uden multiplicitet.',
            '**Skridt 4 — finpudsning.** Aktør som tændstiksmand *eller* klasse — ikke begge. Attribut eller klasse? Giver et **systembegreb** mening? Er der grund til komposition eller arv (sjældent)? Til sidst oprydning: fjern overflødige begreber og dem, der ikke hører til denne iteration.',
          ],
        },
        {
          term: 'Attribut eller klasse',
          body: [
            'Materialets fire tommelfingerregler: fylder det noget fysisk, er det et begreb. Har det en kompleks struktur med vigtige underattributter, er det et begreb. Har det aktiviteter, er det et begreb. Er det simpelt med en veldefineret værdimængde, er det en attribut.',
            'Larman kalder det måske den mest almindelige fejl at gøre noget til en attribut, der burde være en klasse. Hans test: tænker man ikke på X som et tal eller en tekst i den virkelige verden, er X en klasse. *Store* er ikke en attribut på *Sale*, og *destination* er lufthavnen *Airport*.',
            'I Føtex-eksemplet bliver Stregkode, Pris og Vægt attributter på Vare, Pose fjernes (ingen UC nævner den), og Køb og Betaling fjernes igen i skridt 4, fordi intet i specifikationen kræver, at de huskes, når kunden er gået.',
          ],
        },
        {
          term: 'Domænemodel er ikke softwaredesign',
          body: [
            'Klasserne er ikke klasser i koden — endnu. Beslutningen tages først i applikationsmodellen; bliver et begreb til en klasse, har den allerede et godt navn. Larman kalder det at mindske *representational gap*: softwarens domænelag navngives efter domænemodellen.',
            'Den er heller ikke et hardwaredesign eller en softwarearkitektur (det er [[sysml-bdd|BDD]], [[sysml-ibd|IBD]] og applikationsmodellen), og ikke en flowmodel. Den indbyggede CPU og netværkskortet skjules i en System-klasse. Består modellen kun af hardwarekomponenter, er den bare et IBD i forklædning.',
            'Larman skelner også mod datamodellen: en datamodel viser data, der skal gemmes. Et begreb uden attributter eller med en ren adfærdsrolle hører stadig hjemme i domænemodellen.',
          ],
        },
        {
          term: 'Notationen i sem4 — Chen, aggregation, filnavne',
          body: [
            '**Chen vs. klassediagram.** ISE tegner domænemodellen som UML-klassediagram (“Husk stadig ramme med diagramtype”). SW4BAD kræver, at den **konceptuelle ER-model** tegnes i Chen, se [[bad/er-model|ER-modellering]]. Det er to artefakter: ER-modellen beskriver data til databasen, domænemodellen hele domænet. Har projektet en database, er Chen-diagrammet en figur for sig. Mermaids `erDiagram` er altid crow’s foot og altså logisk/fysisk (sem4 `CLAUDE.md`).',
            '**Aggregation.** Artiklen fraråder den: aggregation “kan ligeså godt tegnes som en association, uden at dybere viden går tabt”. sem4-reglerne er strengere og **forbyder** den hule diamant i UML-klassediagrammer, ligesom SWD-noten “Don’t use the aggregation symbol” (se [[swd/uml-klassediagram|UML-klassediagrammer]]). Brug association eller komposition. ISE tegner selv aggregation, men kun i SysML-BDD’et for Tankstationen, og dér er den lovlig efter sem4-reglerne.',
            '**Rapportfiguren** tegnes i draw.io med legend og filnavnet `DM_<system>`. Captionen siger, hvad læseren skal lægge mærke til (se [[figurer-captions|figurer og captions]]).',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'Metoder i klasserne. Pile i associationernes ender. Typer på attributterne. Softwarebegreber som `string`, database eller vindue. En model med kun hardwareblokke. Relationer, der hedder “har en”, hvor en vending af retningen giver et mere sigende navn. En aktør, der står både som tændstiksmand og som klasse. Alle nævnt i slides og artikel.',
          ],
        },
      ],
      viz: 'domaenemodel-kogebog',
      keyPoints: [
        'Domænemodellen = UML-klassediagram over begreber fra virkeligheden: klasser, associationer med tekst og læsepil, multiplicitet, attributter uden typer. Ingen metoder, ingen pile i enderne.',
        'Den hører til Systemarkitektur-dokumentet og bygges af de fully dressed use cases for den aktuelle iteration.',
        'Kogebog: navneord + kategoriliste → udsagnsord + relationsliste → multiplicitet (set fra ét system) → finpudsning.',
        'Attribut, hvis det er en simpel værdi; klasse, hvis det fylder fysisk, har struktur eller aktiviteter.',
        'CPU, netværkskort og lignende skjules i en System-klasse. Kun hardware = et IBD i forklædning.',
        'sem4: association i stedet for aggregation; konceptuel ER i Chen er et andet artefakt end domænemodellen.',
      ],
      exam: [
        '“Hvor kommer klasserne i jeres domænemodel fra?” — Fra navneordene i vores use cases, suppleret med kategorilisten. Et par navneord blev attributter, fordi de er simple værdier, og computeren og WiFi’en er skjult i System-begrebet.',
        '“Hvorfor har I ingen metoder og ingen pile i enderne?” — Fordi domænemodellen beskriver virkeligheden, ikke koden. Metoder og navigerbarhed bestemmer vi først i applikationsmodellen.',
        '“Er det her ikke bare jeres database?” — Nej. En datamodel viser det, der skal gemmes. Domænemodellen viser også begreber uden data, og vores konceptuelle ER-model står for sig selv i Chen-notation.',
        '“Hvorfor er multipliciteten 1 og ikke *?” — Den er set fra én instans af systemet. Vi modellerer ét køleskab, ikke alle køleskabe, der bruger BCDB.',
        '“Hvordan bruger I domænemodellen videre?” — De begreber, use casen berører, bliver domain-klasser i applikationsmodellen, med de samme navne.',
      ],
      sources: [
        { path: k('09-domaeneanalyse/system-domain-analysis.md'), original: 'System Domain Analysis.pdf', pages: 'slide 4–32' },
        { path: k('09-domaeneanalyse/artikel-domaenemodeller.md'), original: 'DomæneModeller.pdf', pages: 's. 1–11' },
        { path: k('09-domaeneanalyse/eksempel-domaenemodel.md'), original: 'DomænemodellerEksempel.pdf', pages: 's. 1–11', note: 'Føtex-selvbetjeningskassen gennem hele kogebogen' },
        { path: k('bog/07-larman-ch9-domain-models.md'), original: '07_Larman_Ch9_DomainModels.tex (ISE-kompendiet)', pages: 's. 131–159' },
        { path: k('10-applikationsmodel/eksamensopgave-e2015-smartfridge.md'), original: 'I2ISE Eksamensopgave E2015.pdf', pages: 's. 1–3', note: 'Opgave 2: domænemodel for SmartFridge (figurens case)' },
        { path: k('10-applikationsmodel/system-application-models-3.md'), original: 'System Application Models Part3.pdf', pages: 'slide 17–18', note: 'Tankstationens BDD med aggregation og domænemodel' },
        { path: k('00-kursus/afleveringsopgave-c-pakkeboksen.md'), original: 'Afleveringsopgave C - Pakkeboksen.pdf', pages: 's. 1–2', note: 'Øvelse C i PRJ4: domænemodel for Pakkeboksen' },
        { path: '.agents/skills/studie-figurer/SKILL.md', note: 'sem4-figurregler: draw.io, legend, filnavne, aggregation forbudt' },
        { path: 'CLAUDE.md', note: 'sem4-regler: Chen på konceptuelt niveau, erDiagram er crow’s foot' },
      ],
      gaps: [
        'Materialet er uenigt med sig selv om typer: artiklen (s. 4) siger attributter uden typer, men løsningen til E2015 opg. 2 skriver `navn : string`, `stregkode : string`, `antal : int`, og Tankstationens domænemodel (Part 3, slide 18) skriver `volume: float`. Figuren følger artiklen.',
        'Use casen “Tilføj vare” siger *Bruger* i scenariet og *Kunden* under initiering; løsningens domænemodel kalder aktøren Kunden. Materialet kommenterer det ikke.',
        'Larman kalder domænemodellen *optional* i agil/UP-forstand; ISE-slides forventer at finde den i Systemarkitektur-dokumentet (slide 32). For et projekt gælder kursets forventning.',
        'Artiklen fraråder aggregation, men forbyder den ikke. Forbuddet kommer fra sem4-reglerne og SWD-noten, ikke fra ISE.',
      ],
      keywords: ['domain model', 'conceptual class', 'begreb', 'begrebsklasse', 'navneordsanalyse', 'udsagnsordsanalyse', 'kategoriliste', 'relationsliste', 'multiplicitet', 'læsepil', 'visuel ordbog', 'systemdomæneanalyse', 'DM_', 'SmartFridge', 'Føtex'],
    },

    {
      slug: 'applikationsmodel',
      title: 'Applikationsmodellen: boundary, control og domain',
      short: 'Applikationsmodel',
      week: 'Hver iteration',
      definition:
        '**Applikationsmodellen** (System Application Model, AM) er første skridt i softwaredesignet: den finder klasserne, softwaren bygges af, og beskriver hvordan de samarbejder om en use case. Den består af klassediagram, sekvensdiagrammer og state machines og bygger på **Entity-Control-Boundary**-mønstret, hvor entity-klasser kaldes *domain*-klasser.',
      intro: [
        'Use cases er *design drivers*: hvert skridt i modellen styres af én fully dressed use case. Domænemodellen leverer domain-klasserne, aktørerne leverer boundary-klasserne, og use casen selv bliver en control-klasse. Modellen hører til SW-afsnittet i Systemarkitektur-dokumentet.',
      ],
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'Efter [[domaenemodel|domænemodellen]] og, hvis den findes, [[sysml-ibd|IBD’et]], for hver use case, der skal laves i iterationen. Der laves “så mange sæt som nødvendigt” af de tre diagrammer til at dække alle use cases. Derfra går det iterativt videre til design, implementering og accepttest mod de samme use cases.',
          ],
        },
        {
          term: 'De tre klassetyper',
          body: [
            '**Boundary** repræsenterer en aktør: aktørens interface til systemet (UI, protokol …). Ingen business logic. Mindst én pr. aktør, og de deles mellem use cases med samme aktør. Stereotype `«boundary»`.',
            '**Domain** repræsenterer domænet: data, domænespecifik viden, konfiguration. 0, 1 eller flere, delt mellem use cases. Stereotype `«domain»`.',
            '**Control** indeholder use casens business logic og “eksekverer” den ved at kalde boundary- og domain-klasserne. Den **navngives efter use casen**, og der er typisk én pr. use case (eller én delt mellem nogle få). Stereotype `«control»` eller `«controller»`.',
            'En control-klasse er **ikke** hardwarecontrolleren, µ-controlleren eller “control unit” på BDD’et. Den er software, der kører på CPU’en i dem.',
          ],
        },
        {
          term: 'Step 1 — find klasserne',
          body: [
            '1.1 Vælg den næste fully dressed use case. 1.2a Hver aktør → en boundary-klasse (“Er der tvivl, er en klasse boundary klasse før den er domæneklasse”). 1.2b Har I et IBD med de faktiske hardware-interfaces, så split boundary-klasserne op pr. interface. 1.3 De domænemodel-klasser, use casen berører → domain-klasser. 1.4 Tilføj én control-klasse for use casen.',
            'ATM, *Withdraw Cash*: `CustomerUI` og `BankUI` (boundary), `Cash`, `Account`, `Credit card` (domain) og `WithdrawCash` (control) — seks kandidater. SmartFridge, *Tilføj vare*: IBD’et giver fire boundary-klasser `Touchscreen`, `Stregkode-scanner`, `Printer`, `Network`; control er `TilfojVare`; domain er `Indkobsliste` og `Vare`.',
            'I et system med subsystemer (version 3) laves én AM pr. use case **pr. subsystem**, og de andre subsystemer tæller som aktører for det subsystem, man modellerer.',
          ],
        },
        {
          term: 'Step 2 — find samarbejdet',
          body: [
            '2.1 Gå hovedscenariet igennem skridt for skridt — har I et [[sekvensdiagram|systemsekvensdiagram]], så brug det. 2.2 Opdatér sekvens- og klassediagram (metoder, associationer, attributter). 2.3 Opdatér en [[state-machine|state machine]] for klasser med tilstand. 2.4 Verificér mod use casen (postconditions, test). 2.5 Gentag for alle extensions og finpuds.',
            'De tre diagrammer opdateres **samtidigt**. Applikationsmodellen er en softwaremodel, så hver besked på sekvensdiagrammet er et metodekald med `()`, et navn, parametre, returværdi og et valg mellem synkron og asynkron (“interrupts vs. polling”).',
          ],
        },
        {
          term: 'Kommunikations- og designregler',
          body: [
            'Control tager alle logiske beslutninger. Derfor kalder **boundary kun control** (evt. med en domain-klasse som parameter, et DTO), boundary kalder ikke andre boundaries, og **domain kalder ingen** og starter intet på eget initiativ. Control må kalde alle.',
            'Designreglerne binder diagrammerne sammen: alle klasser på sekvensdiagrammet står også på klassediagrammet. En metode hører til den klasse, pilen ender i. Associationer peger samme vej som kaldene; begge veje, hvis begge klasser kalder hinanden (`CustomerUI ↔ WithdrawCash`).',
          ],
        },
        {
          term: 'Aktør, boundary og domain er tre ting',
          body: [
            'Den faktiske aktør, aktørens boundary-klasse og den domain-klasse, der gemmer data om aktøren, er tre forskellige ting. En aktør har ingen metoder og kan ikke kalde metoder; på sekvensdiagrammet må den sende en besked uden parentes (“Bruger trykker Save”), og derefter overtager boundary-klassen med metodekald.',
          ],
        },
        {
          term: 'Videre til kode og til semesterets fag',
          body: [
            'Minuturet viser hvor langt modellen rækker: controlleren `Ur` og dens state machine er uændret i C på Arduino, i C++ med polling eller interrupts og i C#/WPF. Kun boundary-klasserne og “hovedprogrammet” tilpasses platformen. Se [[design-til-kode|fra design til kode]].',
            '*Uden for materialet:* samme opdeling går igen i semesterets fag. En boundary-klasse bag et interface er det, SWT kalder en afhængighed, der kan fakes ([[swt/design-for-testability|design for testability]]), og i en MAUI-app ligger boundary i View/ViewModel ([[fed/mvvm|MVVM]]). ISE-materialet nævner ingen af delene.',
          ],
        },
      ],
      viz: 'bce',
      keyPoints: [
        'AM = klassediagram + sekvensdiagrammer + state machines, lavet pr. use case og opdateret samtidigt.',
        'Aktør → boundary. Domænemodel-begreb → domain. Use case → én control, navngivet efter use casen.',
        'Har I et IBD, giver hvert hardware-interface mod en aktør sin egen boundary-klasse.',
        'Boundary kalder kun control; domain kalder ingen; control må kalde alle.',
        'Hver besked er et metodekald og står som metode på klassen ved pilens ende; associationerne peger samme vej.',
        'Control-klassen er software — ikke µ-controlleren eller control unit på BDD’et.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Opskriften fra slides (version 3)',
          source: 'System Application Models Part3.pdf slide 14–15',
          code: `Step 1 – find klasserne (én UC, ét subsystem ad gangen)
  1.1  Vælg den næste fully-dressed UC
  1.2a Aktører og subsystemer i UC for dette subsystem → Boundary-klasser
  1.2b IBD med HW-interfaces (også mellem subsystemer)
       → opsplit i hardware interface Boundary-klasser
  1.3  Relevante klasser i Domænemodellen → Domain-klasser
  1.4  Én UC control → Control-klasse

Step 2 – find samarbejdet (cd, SEQ og STM opdateres samtidigt)
  2.1  Gennemgå hovedscenariet og/eller System-SD for UC
       (kun messages der involverer subsystemet)
  2.2  Opdater sekvens- og klassediagram (metoder, associationer, attributter)
  2.3  Opdater STMs for klasser med tilstand
  2.4  Verificer mod UC (postconditions, test)
  2.5  Gentag for alle extensions. Finpuds modellen.`,
        },
      ],
      exam: [
        '“Hvorfor har I én controller pr. use case?” — Fordi use casens logik skal ligge ét sted. Boundary-klasserne må ikke træffe beslutninger, og domain-klasserne må ikke kende til forløbet.',
        '“Hvor kommer jeres boundary-klasser fra?” — Fra aktørerne i use casen, og vi har splittet dem op efter hardware-interfacene på IBD’et, så hver port mod en aktør har sin egen klasse.',
        '“Må domain-klassen kalde displayet?” — Nej. Domain kalder ingen og starter intet selv; det er controlleren, der henter data fra domain og sender dem til boundary.',
        '“Hvordan ved I, at klassediagram og sekvensdiagram passer sammen?” — Alle lifelines står som klasser, hver besked står som metode på modtagerens klasse, og associationerne peger samme vej som kaldene.',
        '“Er jeres control-klasse jeres microcontroller?” — Nej, den er software, der kører på den. Den hedder efter use casen.',
      ],
      sources: [
        { path: k('10-applikationsmodel/system-application-models-1.md'), original: 'System Application Models Part1.pdf', pages: 'slide 2–27' },
        { path: k('10-applikationsmodel/system-application-models-2.md'), original: 'System Application Models Part2.pdf', pages: 'slide 9–27' },
        { path: k('10-applikationsmodel/system-application-models-3.md'), original: 'System Application Models Part3.pdf', pages: 'slide 13–24' },
        { path: k('10-applikationsmodel/oevelse-atm-withdraw-cash.md'), original: 'SAM_ATM UC description.pdf + SAM_ATM_Lsning.pdf', pages: 's. 1–5' },
        { path: k('10-applikationsmodel/eksamensopgave-e2015-smartfridge.md'), original: 'SAM_SmartFridge_Opgave_Lsning.pdf', pages: 's. 1–2' },
        { path: k('11-implementation/applikationsmodel-minutur.md'), original: 'ApplicationModel.pdf', pages: 's. 1–3' },
        { path: k('11-implementation/implementation-minutur-gui-wpf.md'), original: 'ImplementationFinalGUI.pdf', pages: 's. 1–4', note: 'Ur og dens STM er uændret; kun boundary-klasserne skifter' },
        { path: k('00-kursus/afleveringsopgave-c-pakkeboksen.md'), original: 'Afleveringsopgave C - Pakkeboksen.pdf', pages: 's. 2', note: 'Øvelse C i PRJ4: klassediagram og SD for applikationsmodellen' },
      ],
      gaps: [
        'Step 1.1 spørger selv “(hvordan?)” om valget af næste use case, men slides svarer ikke.',
        'Navnene skifter i ATM-eksemplet: step 1.2 giver `BankUI` (Part 1, slide 19), men de senere diagrammer bruger `bank : Bank` som «boundary» (Part 2, slide 22–24). `Cash` er domain i step 1.3, men en «boundary»-lifeline (seddeludbetaleren) i løsningsforslaget.',
        'Stereotyperne varierer: `«control»` og `«controller»` bruges begge (Part 2, slide 9), og SmartFridge-løsningen skriver `«boundary.»` med punktum (Enterprise Architect).',
        'Materialet giver ingen regel for, hvornår et kald er synkront eller asynkront, ud over stikordet “interrupts vs. polling” (Part 2, slide 14). SmartFridge- og ATM-løsningerne vælger forskelligt.',
        'Løsningen til Kamerasystem-øvelsen (applikationsmodel for et sammensat system) er ikke med i materialet.',
      ],
      keywords: ['SAM', 'system application model', 'ECB', 'entity control boundary', 'boundary', 'control', 'controller', 'domain', '«boundary»', 'kommunikationsregler', 'designregler', 'ATM', 'Withdraw Cash', 'SmartFridge', 'TilfojVare', 'step 1.1'],
    },

    {
      slug: 'sekvensdiagram',
      title: 'Sekvensdiagrammer: fra systemniveau til metodekald',
      short: 'Sekvensdiagram',
      week: 'Hver iteration',
      definition:
        'Et **sekvensdiagram** (`sd`) viser beskedbaseret adfærd: **lifelines** for de deltagende dele og **beskeder** mellem dem, ordnet i tid oppefra og ned. På systemniveau er systemet én lifeline; i applikationsmodellen er hver lifeline et objekt, og hver besked er et metodekald.',
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'To steder. I kravs- og arkitekturfasen som **systemsekvensdiagram** (SSD): aktører og systemet (eller dets subsystemer) som sorte kasser, og beskederne er use casens skridt. I [[applikationsmodel|applikationsmodellen]] som design: lifelines er boundary-, control- og domain-objekter, og beskederne er metoder med `()`.',
            'Er man “heldig”, har man et SSD, der kan bruges direkte som input til applikationsmodellens SD. I SmartFridge-løsningen kan SSD’ets `opt`- og `alt`-blokke genbruges én til én.',
          ],
        },
        {
          term: 'Lifelines og ramme',
          body: [
            'Diagrammet har en ramme med headeren `sd <navn>`. Et lifeline-hoved angiver `navn : Type` for den deltagende del, og halen er en stiplet lodret linje. En **activation** (smal bjælke) viser, hvornår en del er aktiv; et selvkald giver en indlejret activation.',
          ],
        },
        {
          term: 'Beskedtyper',
          body: [
            '**Asynkron**: fuld linje, åben pilespids — afsenderen fortsætter straks. **Synkron** (metodekald): fuld linje, lukket pilespids — afsenderen venter på svar. **Svar**: stiplet linje, åben pilespids, med returværdien efter argumentlisten. Argumenter står i parentes efter beskednavnet. En besked kan også gå til lifelinen selv.',
          ],
        },
        {
          term: 'Combined fragments',
          body: [
            '`alt` — alternativer med gensidigt udelukkende guards, adskilt af stiplede linjer. `opt` — noget der måske sker. `loop` — gentagelse med guard, fx `[while not request deposit]`. `par` — samtidige forløb. `ref` — henvisning til et andet sekvensdiagram, så scenarier kan sættes sammen.',
            'RVM-løsningen viser, at en undtagelse i use casen (maskinen er fuld) modelleres som en **ekstra operand** `[RVM is full]` i `alt`, ikke som et nyt diagram.',
          ],
        },
        {
          term: 'Tid',
          body: [
            'Tidspunkter kan observeres (`t = now`) og begrænses (`{t..t+1}`), og en duration constraint (`{0..10}`) langs en lifeline kræver, at hele forløbet holder sig inden for et interval. Slides viser det på en kameraselvtest.',
          ],
        },
        {
          term: 'SSD vs. applikations-SD',
          body: [
            'SmartFridge, *Tilføj vare*: SSD’et har lifelines `:Bruger`, `:SmartFridge`, `:BarCode Database` og beskeder som “Find vare i database”. Applikations-SD’et har `:Stregkode-scanner`, `:Touchscreen`, `:TilfojVare`, `:Indkobsliste`, `:Vare`, `:Network`, og “Find vare i database” er blevet `FindVare(stregkode) :string` fra controlleren til `Network`.',
            'I et system med subsystemer er det kun beskeder til og fra det aktuelle subsystem, der hører til dets applikations-SD (Tankstation, Part 3 slide 23). På controllerens lifeline kan man skrive dens tilstand som noter (“Awaiting card”), så SD og state machine kan sammenholdes.',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'I applikationsmodellen: beskeder uden `()`; en lifeline, der ikke står på klassediagrammet; en metode placeret på afsenderens klasse i stedet for modtagerens; en aktør, der kalder metoder direkte i stedet for via sin boundary-klasse. Alle fire følger af design- og aktørreglerne i Part 2.',
          ],
        },
      ],
      viz: 'sd-rvm',
      keyPoints: [
        'Lifelines vandret, tiden lodret. Headeren er `sd <navn>`.',
        'Asynkron = åben pil, synkron = lukket pil, svar = stiplet. Argumenter i parentes.',
        '`alt`, `opt`, `loop`, `par` med guards; `ref` henviser til et andet SD.',
        'SSD: systemet som sort kasse, beskeder i use casens sprog. Applikations-SD: objekter og metodekald.',
        'SSD’ets struktur (`opt`, `alt`) kan ofte genbruges direkte i applikations-SD’et.',
        'Alle lifelines skal findes på klassediagrammet, og alle beskeder som metoder hos modtageren.',
      ],
      exam: [
        '“Hvad er forskellen på jeres to sekvensdiagrammer?” — Det første er på systemniveau: systemet er én lifeline, og beskederne er use casens skridt. Det andet er applikationsmodellens, hvor hver besked er et metodekald mellem vores klasser.',
        '“Hvorfor er den pil åben og den lukket?” — Den åbne er asynkron, afsenderen fortsætter. Den lukkede er et synkront kald, hvor afsenderen venter på svaret, som er den stiplede pil.',
        '“Hvordan har I vist extension 1 i use casen?” — Som et `opt`-fragment med guarden “vare findes ikke”. En undtagelse, der udelukker hovedforløbet, bliver en ekstra operand i et `alt`.',
        '“Hvor står metoden `FindVare` på klassediagrammet?” — På `Network`, fordi pilen ender dér. Og controlleren har en association til `Network`, der peger samme vej.',
      ],
      sources: [
        { path: k('05-sysml/sysml-sequence-diagrams.md'), original: 'SysML Behavioural Diagrams - Sequence Diagrams.pdf', pages: 'slide 3–17' },
        { path: k('05-sysml/oevelse-rvm-sekvensdiagram.md'), original: '(solution)RVM_SD.pdf + (solution)RVM_SD_withExtraRVMisFull.pdf', pages: 's. 1', note: 'Figurens case' },
        { path: k('10-applikationsmodel/eksamensopgave-e2015-smartfridge.md'), original: 'I2ISE Eksamensopgave E2015.pdf + SAM_SmartFridge_Opgave_Lsning.pdf', pages: 's. 5 + s. 1', note: 'SSD og applikations-SD for Tilføj vare' },
        { path: k('10-applikationsmodel/system-application-models-2.md'), original: 'System Application Models Part2.pdf', pages: 'slide 14–27' },
        { path: k('10-applikationsmodel/system-application-models-3.md'), original: 'System Application Models Part3.pdf', pages: 'slide 21–23' },
        { path: k('10-applikationsmodel/oevelse-atm-withdraw-cash.md'), original: 'SAM_ATM_Lsning.pdf', pages: 's. 1–3', note: 'SD med tilstandsnoter, loop og alt' },
      ],
      gaps: [
        'RVM-løsningen tegner brugerens handlinger (“Place container in in-feed”) med lukket pilespids, altså som synkrone kald. Slides siger ikke, hvilken pil en menneskelig aktør skal have på et SD på systemniveau.',
        'ATM-løsningen bryder selv reglen om `()`: `ui → ctrl: withdrawCash` står uden parentes, og i state machinen står `cardValidated / ui.requestUserAction` uden parenteser.',
        'Slide 15 viser en *found message* (“Perimeter Breach Detected” ind fra rammens kant), men begrebet forklares ikke i slides.',
        'Materialet siger ikke, hvor mange sekvensdiagrammer en rapport skal have. Slides siger kun “så mange som nødvendigt” til at dække alle use cases.',
      ],
      keywords: ['sd', 'sequence diagram', 'SSD', 'systemsekvensdiagram', 'lifeline', 'activation', 'synkron', 'asynkron', 'reply', 'alt', 'opt', 'loop', 'par', 'ref', 'combined fragment', 'RVM', 'Recycle Containers'],
    },

    {
      slug: 'state-machine',
      title: 'State machines: tilstande, events og actions',
      short: 'State machine',
      week: 'Hver iteration',
      definition:
        'Et **state machine diagram** (`stm`) modellerer tilstandsafhængig adfærd for en blok eller klasse gennem dens levetid. Maskinen er altid i én tilstand og bliver dér, til et **event** udløser en **transition**, skrevet `trigger[guard]/effect`.',
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'I SysML-modellen for systemets adfærd, og i [[applikationsmodel|applikationsmodellen]] som step 2.3 for de klasser, der har tilstand — typisk controlleren. Dér er **triggerne kald til klassens egne metoder**, og **actions er kald til andre klassers metoder**. Tilstandene kan aflæses af use casens ventepunkter: ATM’en venter på kort, så på PIN, så på bankens svar.',
            'Findes der ingen tilstandsbaserede klasser, springes step 2.3 over, og en STM er ikke krævet i øvelse C i PRJ4.',
          ],
        },
        {
          term: 'Transitionen: trigger[guard]/effect',
          body: [
            'Når triggeren indtræffer, evalueres guarden. Er den sand, udføres effect, og tilstanden skifter. Er den falsk, forbruges triggeren **uden effekt**. Eksempel: `shutdown[all users logged off]/turn off cameras`. Initial pseudostate (sort prik) peger på starttilstanden; en final state er en cirkel med prik.',
            'En **choice pseudostate** (rombe) deler en transition efter en beregning: `shutdown / r = Confirm Shutdown` ind, `[r = "yes"]` og `[else]` ud. Guarden evalueres *efter* den indgående effect. ATM-controlleren bruger den efter `validateAmount(amount)` med `[too high]` og `[OK]`.',
          ],
        },
        {
          term: 'entry, do, exit og interne transitions',
          body: [
            '`entry/` udføres ved indgang, `do/` kører kontinuerligt, til tilstanden forlades, og `exit/` udføres lige før. En **intern transition** (`buttonPushed/Handle button` inde i tilstanden) afbryder `do`, udfører sin action og genoptager — uden exit og entry. En **selv-transition** (pil ud og ind igen) kører exit, effect og entry.',
            'Lyskontakten viser, hvad der er læsbart: `entry/turn light on` i tilstanden On markeres “Best”. Samme adfærd med `exit/turn light on` i Off virker, men er sværere at læse.',
          ],
        },
        {
          term: 'Sammensatte tilstande og regioner',
          body: [
            '**Nested states**: lommelygtens On har substates Low og High med egen initial. `PWR` fra On’s kant går til Off, uanset hvilken substate der er aktiv. **Regioner** (ortogonale substates, adskilt af en stiplet linje): hver region har præcis én aktiv tilstand, og transitions krydser aldrig regionsgrænsen. Tastaturets Num Lock og Caps Lock, Pimped Egg Timers timer og baggrundslys, telefonens højttaler og mikrofon er materialets eksempler.',
            'Ved en transition gælder rækkefølgen: exit-actions indefra og ud, transitionens effect, entry-actions udefra og ind, derefter regionernes initial-transitions (konsol-øvelsen).',
          ],
        },
        {
          term: 'Minuturet',
          body: [
            '`Ur` har to tilstande, *Stoppet* og *Startet*. Initial: `/ nulstil()`. I Stoppet: `reset / nulstil()` som selv-transition og `start / timerObj.start()` til Startet. I Startet: `stop / timerObj.stop()` tilbage og `timeout / timerObj.start(), taelOp(), displayObj.vis(min, sec)` som selv-transition.',
            'Koden følger diagrammet direkte: en `enum TILSTAND {STARTET, STOPPET}` og én metode pr. event, der tjekker tilstanden. `reset` i Startet og `start` i Startet har ingen transition, og koden gør intet. Maskinen er den samme i C, C++ og C#/WPF — se [[design-til-kode|fra design til kode]]. SWD viser alternativerne switch/case, tabel og GoF State ([[swd/state|State-pattern]]), og SWT tester overgangene ([[swt/state-machines|tilstandsmaskiner i SWT]]).',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'Én flad maskine for ting, der er uafhængige af hinanden, hvor opgaven lægger op til regioner (telefonøvelsens hint: “think independent sub-states”; se også [[swd/nested-orthogonal|nested og orthogonal states]]). Actions lagt i exit, så de står i den forkerte tilstand. At glemme, at en selv-transition kører exit og entry, mens en intern ikke gør. At skrive actions, der ikke findes som metoder på klassediagrammet.',
          ],
        },
      ],
      viz: 'stm-minutur',
      keyPoints: [
        '`trigger[guard]/effect`: falsk guard = triggeren forbruges uden effekt.',
        'entry/do/exit; intern transition kører hverken exit eller entry, selv-transition gør.',
        'Choice (rombe) evaluerer guards efter den indgående effect.',
        'Regioner er uafhængige; hver har præcis én aktiv tilstand.',
        'I applikationsmodellen: triggere = klassens metoder, actions = kald til andre klasser.',
        'Minuturet: Stoppet ⇄ Startet; timeout er en selv-transition, der tæller op og viser tiden.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Ur.cpp: én metode pr. event, tilstanden afgør hvad der sker',
          source: 'UML-Light-Ur.pdf s. 6–7 (bogside 29–30)',
          code: `void Ur::start()        // håndterer hændelsen: start
{
    if (tilstand == STOPPET)
    {
        tilstand= STARTET;
        minTimer->start(TIME1000MS);
    }
}

void Ur::stop()         // håndterer hændelsen: stop
{
    if (tilstand == STARTET)
    {
        tilstand= STOPPET;
        minTimer->stop();
    }
}

void Ur::reset()        // håndterer hændelsen: reset
{
    if (tilstand == STOPPET)
    {
        nulstil();
    }
}

void Ur::timeout()      // håndterer hændelsen: timeout
{
    if (tilstand == STARTET)
    {
        minTimer->start(TIME1000MS);
        taelOp();
        mitDisplay->vis(minutter,sekunder);
    }
}`,
        },
      ],
      exam: [
        '“Hvorfor er `timeout` en selv-transition?” — Fordi uret bliver i Startet, men skal gøre noget: genstarte timeren, tælle op og vise tiden.',
        '“Hvad sker der, hvis man trykker reset, mens uret kører?” — Intet. Startet har ingen transition for reset, og koden tjekker `tilstand == STOPPET`, før den nulstiller.',
        '“Hvor kommer jeres triggere fra?” — Fra metoderne på klassen, som boundary-klasserne kalder på sekvensdiagrammet. Actions er kald til andre klasser, fx `timerObj.start()`.',
        '“Hvorfor har I brugt regioner her?” — Fordi de to ting er uafhængige: lyset kan skifte, uanset om timeren kører eller alarmerer. Med én flad maskine skulle vi gange tilstandene sammen.',
        '“Hvad er forskellen på en intern transition og en selv-transition?” — Den interne forlader ikke tilstanden, så exit og entry køres ikke. Selv-transitionen forlader og genindtræder.',
      ],
      sources: [
        { path: k('05-sysml/sysml-state-machine-diagrams.md'), original: 'SysML Behavioural Diagrams - State Machine Diagrams.pdf', pages: 'slide 2–18' },
        { path: k('11-implementation/uml-light-ur.md'), original: 'UML-Light-Ur.pdf', pages: 's. 1–7' },
        { path: k('11-implementation/applikationsmodel-minutur.md'), original: 'ApplicationModel.pdf', pages: 's. 2', note: 'Tilstandsdiagram for Ur — figurens forlæg' },
        { path: k('10-applikationsmodel/system-application-models-1.md'), original: 'System Application Models Part1.pdf', pages: 'slide 23–26' },
        { path: k('10-applikationsmodel/oevelse-atm-withdraw-cash.md'), original: 'SAM_ATM_Lsning.pdf', pages: 's. 4', note: 'STM for controlleren WithdrawCash med choice' },
        { path: k('05-sysml/oevelse-egg-timer-state-machine.md'), original: 'StateEggTimerSolutionF2019.pdf + StatePimpedEggTimerSolutionF2019.pdf', pages: 's. 1' },
        { path: k('05-sysml/oevelse-telefon-state-machine.md'), original: 'SysML State Machines (telefon).pdf', pages: 's. 1' },
        { path: k('05-sysml/oevelse-konsol-state-machine.md'), original: 'SysML State Machines (konsol).pdf', pages: 's. 1–3' },
      ],
      gaps: [
        'Slides siger ikke eksplicit, hvad der sker med et event, som den aktive tilstand ikke har en transition for. Minuturets kode ignorerer det (`if (tilstand == STOPPET)`), og konsol-løsningen siger kun, at triggers ignoreres efter final state.',
        'UML-Light-versionen kalder `timerObj.start(1000)`; applikationsmodellen kalder `timerObj.start()` uden argument, og WPF-koden udelader kaldet helt, fordi `DispatcherTimer` er periodisk.',
        '`taelOp()` nulstiller minutterne ved 60, så uret går fra 59:59 til 00:00. Det står kun i koden, ikke i state machinen.',
        'I Egg Timer-løsningen er `tick` både intern transition og trigger på `tick[time=0]`; prioriteten mellem dem er ikke angivet.',
        'Konsol-løsningen mangler kendte linjer (“Exit B” i opg. 2, “Enter A” i opg. 3); de er markeret i konverteringen.',
      ],
      keywords: ['stm', 'state machine', 'tilstandsdiagram', 'tilstandsmaskine', 'statechart', 'trigger', 'guard', 'effect', 'entry', 'exit', 'do', 'intern transition', 'self-transition', 'choice', 'nested state', 'region', 'ortogonal', 'minutur', 'Ur', 'Stoppet', 'Startet'],
    },
  ],
}
