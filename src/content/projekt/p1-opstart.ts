import type { Part } from '../types'
import { k } from './paths'

export const opstart: Part = {
  id: 'opstart',
  title: 'Opstart og proces',
  topics: [
    {
      slug: 'rygrad',
      title: 'Projektets rygrad',
      short: 'Projektets rygrad',
      week: 'Hele forløbet',
      definition:
        'Et semesterprojekt er en kæde af artefakter, hvor hvert led bygger på det forrige og kan spores tilbage: **projektformulering → kravspecifikation (use cases + ikke-funktionelle krav) → accepttestspecifikation → domænemodel → arkitektur (BDD/IBD) → applikationsmodel (SD, klassediagram, STM) → kode → integrations- og accepttest → rapport**. Den bærende idé er **traceability**: ethvert krav skal kunne følges frem til en test, og enhver test tilbage til et krav.',
      intro: [
        'L1 samler ingeniørarbejdet i tre grundspørgsmål: *Hvad* skal systemet gøre (specifikation)? *Hvordan* gør det det (analyse og design)? *Virker* det som forventet (verifikation og test)? Rygraden er svaret på alle tre, i den rækkefølge. Den gennemgående case i kurset er **Pakkeboksen**: opgave A specificerer use casen “Hent pakke” og to accepttestcases, opgave B laver BDD, IBD, SD og STM for samme system, og opgave C laver domæne- og applikationsmodellen for samme use case.',
      ],
      concepts: [
        {
          term: 'Artefakterne i rækkefølge',
          body: [
            '[[projektformulering|Projektformulering]] (problem og idé) → [[kravspecifikation|kravspecifikation]] med aktør-kontekstdiagram, [[use-case-diagram|use case-diagram]], [[fully-dressed-uc|fully dressed use cases]] og [[ikke-funktionelle-krav|FURPS+-krav]] prioriteret med MoSCoW → [[accepttest|accepttestspecifikation]]. ECE-modellen lægger kravspecifikation og accepttestspecifikation i samme fase: testen skrives, før der er noget at teste.',
            'Derefter [[domaenemodel|domænemodel]] (systemet i brugerens begreber) → [[arkitektur|arkitektur]] med [[sysml-bdd|BDD]] og [[sysml-ibd|IBD]] og [[graenseflader|grænseflader]] → [[applikationsmodel|applikationsmodel]] med boundary/controller/domain-klasser, [[sekvensdiagram|sekvensdiagram]] og [[state-machine|state machine]] → [[design-til-kode|kode]] → [[integration-systemtest|integrations- og accepttest]] → [[rapportstruktur|rapport]]. Mellem specifikation og arkitektur ligger **teknisk analyse** (ECE-processen, L1 slide 43).',
          ],
        },
        {
          term: 'Traceability',
          body: [
            'Et godt krav er bl.a. *verifiable* (kan bevises med test) og *traceable* (“the origin of each requirement is clear”). En **Requirements Traceability Matrix** er den tovejs afbildning mellem krav og test eller features: er alle features knyttet til et krav, og er hvert krav opfyldt af en feature? Slidets eksempel er en matrix med testcases (1.1 … 3.1) som rækker og REQ 1–5 som kolonner.',
            'Kravspecifikationen er “the baseline against which acceptance tests are carried out”. Use cases skal afbildes på accepttesten: scenariet bliver trin i testen, og *for hver sti gennem use casen skal der være et testscenarie*. Derfor har Pakkeboksens opgave A to testcases til “Hent pakke”: hovedscenariet og udvidelsen “Kunden trykker afbryd-knap”.',
          ],
        },
        {
          term: 'V-formen: venstre ben planlægger højre ben',
          body: [
            'V-modellen parrer hvert udviklingstrin med et testniveau: requirements analysis ↔ acceptance test (validation), system design ↔ system test, architectural design ↔ integration test, module design ↔ unit test (verification). Rapportskabelonen bruger samme form på hele rapporten: introduktion ↔ konklusion (“answer project questions”), proces og metode ↔ diskussion, brugerkrav ↔ brugeraccepttest, systemdesign ↔ integrationstest, delsystemdesign ↔ unit test.',
            'Se også [[swt/softwaretest|Softwaretest og V-modellen]] og [[swt/systemtest|automatiseret system- og accepttest]] i SWT.',
          ],
        },
        {
          term: 'Hvad censor kigger efter',
          body: [
            'Rapporten skal kunne læses som et selvstændigt dokument, der giver overblik til censor, og hovedrapporten skal indeholde en accepttest med godkendt/fejlet pr. test (L27). Indledning og konklusion læses side om side: konklusionen skal besvare samtlige spørgsmål fra problemformuleringen. Rygraden er det, der gør den læsning mulig.',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'Fra *God rapportskrivning*: krav uden unik angivelse (“gør sporbarhed og referencer svære”), use cases uden titler (skriv “UC1: Indlæs fil”, ikke bare “UC1”), manglende systemtest, én stor accepttest på *alt* i systemet og manglende sammenhæng mellem indledning og konklusion.',
          ],
        },
      ],
      viz: 'rygrad',
      keyPoints: [
        'Tre spørgsmål styrer rækkefølgen: hvad (specifikation), hvordan (analyse og design), virker det (test).',
        'Accepttestspecifikationen skrives sammen med kravene — før designet.',
        'Hvert krav og hver use case har et unikt ID og en titel; hver sti gennem en use case har et testscenarie.',
        'Traceability matrix: krav × test, tovejs. Intet krav uden test, ingen test uden krav.',
        'V-formen: hvert trin på venstre ben bestemmer testen på højre ben.',
        'Rapporten fortæller samme kæde, og konklusionen besvarer problemformuleringen.',
      ],
      exam: [
        '“Hvordan sporer I krav 7 til en test?” Kravet har et unikt ID; det hører til en use case, og hver sti i use casen har en accepttestcase med handling, forventet og faktisk resultat. Matrixen i bilaget viser koblingen begge veje.',
        'Accepttesten blev specificeret i kravfasen, så den tester det, vi lovede — ikke det, vi endte med at bygge.',
        'Domænemodellen beskriver systemet i brugerens begreber; arkitekturen og applikationsmodellen bygger videre på dem, så navnene går igen fra krav til kode.',
        'Integrationstesten verificerer arkitekturen og grænsefladerne; accepttesten validerer kravene. Det er to forskellige spørgsmål: byggede vi tingen rigtigt, og byggede vi den rigtige ting?',
        'Konklusionen svarer på de spørgsmål, vi stillede i problemformuleringen — det er toppen af V’et.',
      ],
      sources: [
        { path: k('00-kursus/velkommen-til-swise.md'), original: 'Velkommen til SWISE.pptx', pages: 'slide 28–29, 39, 42–43' },
        { path: k('01-kravspecifikation/system-specification.md'), original: 'System Specification.pdf', pages: 'slide 6, 39–40' },
        { path: k('03-systemtest/system-test.md'), original: 'System Test.pdf', pages: 'slide 14–15, 27–29' },
        { path: k('00-kursus/afleveringsopgave-a-pakkeboksen.md'), original: 'Obligatorisk Afleveringsopgave A - Pakkeboksen.pdf', pages: 's. 1–3' },
        { path: k('00-kursus/afleveringsopgave-b-pakkeboksen.md'), original: 'Afleveringsopgave B - Pakkeboksen.pdf', pages: 's. 1–2' },
        { path: k('00-kursus/afleveringsopgave-c-pakkeboksen.md'), original: 'Afleveringsopgave C - Pakkeboksen.pdf', pages: 's. 1–2' },
        { path: k('13-rapport/l27-projektrapport.md'), original: 'L27_Projektrapport.pdf', pages: 'slide 2–3, 10, 16' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 2, 8–10' },
        { path: k('13-rapport/god-rapportskrivning.md'), original: 'God_rapportskrivning.pdf', pages: 'slide 19–20' },
      ],
      gaps: [
        'Materialet har ingen samlet figur over hele kæden. ECE-modellen (L1 slide 29) stopper ved “SW Design” og nævner hverken domæne- eller applikationsmodel; de kommer fra L14–16, opgave C og rapportskabelonens eksempel (“Den indledende systemarkitektur bygges på basis af Domænemodellen”, s. 8–10). Rækkefølgen her er en sammenstilling af de kilder.',
        'De to V-modeller er ikke ens: System Test slide 14 har fire niveauer inkl. *system test*, mens rapportskabelonens V (s. 2) springer systemtest over og parrer brugerkrav direkte med brugeraccepttest.',
        'Traceability matrixen på System Specification slide 40 er generisk (REQ 1–5, testcases 1.1–3.1). Materialet viser ikke en udfyldt matrix for Pakkeboksen eller et andet case, og siger ikke, hvor den skal stå i rapporten.',
      ],
      keywords: ['traceability', 'sporbarhed', 'RTM', 'traceability matrix', 'artefakter', 'V-model', 'Pakkeboksen', 'Hent pakke', 'rød tråd', 'validation', 'verification'],
    },

    {
      slug: 'projektformulering',
      title: 'Projektformulering og afgrænsning',
      short: 'Projektformulering',
      week: 'Opstart',
      definition:
        'Projektformuleringen er projektets første artefakt. I PRJ4 afleveres den som et **projektforslag på ca. 1 A4-side** med en *problembeskrivelse* (hvilket problem søger projektet at løse?) og en *projektbeskrivelse* (hvordan søges problemet løst?). I rapporten bliver den til indledningens **problemformulering**: de spørgsmål, konklusionen skal besvare.',
      concepts: [
        {
          term: 'Krav til projektet',
          body: [
            'PRJ4 stiller fire krav: projektet skal inddrage faglige aspekter fra *samtlige* fag på semestret (dokumenteret i rapporten og inddraget til eksamen), have et omfang så alle i gruppen kan arbejde med det, og være af en karakter der tillader læringsmålene — bl.a. iterativ udvikling og OOA&D. Første læringsmål er at “udvælge og redegøre for en teknisk-faglig problemstilling som basis for projektet”.',
            'Forslaget skrives i projektets første uge og sendes til semesterkoordinatoren; uge 2–3 går med den use case-baserede kravspecifikation (eller user stories). Det er et semesterprojekt-krav, ikke en metode — tjek dit eget kursus.',
          ],
        },
        {
          term: 'Problemformuleringen i rapporten',
          body: [
            'Indledningen starter med **motivation** (hvor mange oplever problemet, hvor dyrt er det, hvor stort er omfanget?), gennemgår hvad man ved i forvejen og hvorfor eksisterende løsninger ikke rækker, og munder ud i problemformuleringen — formuleret som **spørgsmål, der skal besvares i konklusionen**.',
            'Rapportskabelonen deler introduktionen i baggrund, eksisterende arbejde, **systemskitse** (fx et rigt billede, funktionelt og *uden* teknologier som Raspberry Pi eller React) og problemformulering/hypotese, der angiver omfang, mål, antagelser og begrænsninger og er fundament for krav, design og evaluering. L27 skelner mellem *projektformulering* (idé og formål) og *problemformulering* (hvad projektet skal besvare).',
          ],
        },
        {
          term: 'Afgrænsning',
          body: [
            'Afgrænsning sker gennem prioritering af kravene: “Hvilke kravelementer er vigtigst? ⇒ Afgrænsning/Prioritering”. Både funktionelle og ikke-funktionelle krav prioriteres med **MoSCoW** — og L1 understreger: *MoSCoW er ikke selv krav, MoSCoW er prioritering*. I L27’s kapitelstruktur hører afgrænsningen til kapitlet “Krav med afgrænsning”. Se [[kravspecifikation|Kravspecifikation]].',
            'I RUP’s inception-fase er de tilsvarende aktiviteter problembeskrivelse, afgrænsning af produktets omfang, prioritering af funktionalitet, risikoanalyse og overordnet arkitektur, samlet i dokumentet *Vision* (Vinje).',
          ],
        },
        {
          term: 'Eksempel på indledende analyse: BeoSound F',
          body: [
            'Konceptrapporten for BeoSound F går fra en **persona** (Andrew, 21, designstuderende) til et centralt tema (*frihed*: fysisk, følelsesmæssig og udtryksmæssig), derfra til **scenarier** (rejser, musik, ekstremsport, hjemme), **life cycle-analyse**, en interaktionsmodel og hierarkisk nummererede **user requirements** med importance og feasibility (fx 1.1.2 “should not be over 1kg”).',
            'Pointen for en projektformulering: rapporten siger selv, at “it is the form of the product that is important, not the technology” på dette stadie. Problemet og brugeren kommer før løsningen. Rapporten har til gengæld ingen use cases eller SysML-diagrammer; det er en konceptrapport, ikke en kravspecifikation.',
          ],
        },
        {
          term: 'Hvad censor kigger efter',
          body: [
            'At problemstillingen er teknisk-faglig og afgrænset, at kravene udspringer af den, og at konklusionen svarer på den. Diskussionskapitlet i skabelonen starter netop med “Problemstilling og projektets løsning”.',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            '*God rapportskrivning*: “lige på og hårdt uden at sætte scenen”, ingen angivelse af eksisterende viden, uforståelig problemformulering og manglende sammenhæng mellem indledning og konklusion. Skabelonen advarer mod at lægge teknologi ind i systemskitsen.',
          ],
        },
      ],
      viz: 'projektforslag',
      keyPoints: [
        'Projektforslag ≈ 1 A4: problembeskrivelse (hvad er problemet) + projektbeskrivelse (hvordan løses det).',
        'Problemformuleringen skrives som spørgsmål, og konklusionen besvarer dem alle.',
        'Motivation og eksisterende løsninger før problemformuleringen — sæt scenen.',
        'Systemskitsen er funktionel og uden teknologivalg.',
        'Afgrænsning = MoSCoW-prioritering af krav. MoSCoW er ikke selv et krav.',
        'PRJ4: projektet skal trække på alle semestrets fag og give plads til hele gruppen.',
      ],
      exam: [
        'Vores problemformulering stiller tre spørgsmål, og konklusionen svarer på dem i samme rækkefølge.',
        '“Hvorfor netop det problem?” Motivationen står i indledningen: hvem har problemet, og hvorfor eksisterende løsninger ikke rækker.',
        'Afgrænsningen er MoSCoW-prioriteringen af kravene: must-kravene er det, vi lovede; won’t-kravene er det, vi bevidst valgte fra.',
        'Projektet bruger alle semestrets fag, og vi kan pege på hvor i rapporten hvert fag indgår.',
      ],
      sources: [
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 4–5, 8–9' },
        { path: 'prj4/SW4PRJ4_Introduktion.md', note: 'Forårsudgaven af samme introduktion: krav til projektopgave og projektforslag' },
        { path: k('00-kursus/kursusbeskrivelse-katalog.md'), original: 'AU Kursuskatalog, SW4PRJ4-02', note: 'Læringsmål' },
        { path: k('00-kursus/velkommen-til-swise.md'), original: 'Velkommen til SWISE.pptx', pages: 'slide 29, 42' },
        { path: k('13-rapport/god-rapportskrivning.md'), original: 'God_rapportskrivning.pdf', pages: 'slide 19–20' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 7, 31–32' },
        { path: k('13-rapport/l27-projektrapport.md'), original: 'L27_Projektrapport.pdf', pages: 'slide 3, 9–10' },
        { path: k('05-sysml/beosound-f-concept-report.md'), original: 'BeoSoundF_ConceptReport.pdf', pages: 's. 5–15' },
        { path: k('bog/13-vinje-udviklingsprocesser.md'), original: 'Vinje, Projektledelse af systemudvikling (ISE Book, kap. 13)', pages: 's. 264–265' },
        { path: k('00-kursus/teknisk-analyse-eksempler.md'), original: 'Eksampler af Tekniske Analyse.html' },
      ],
      gaps: [
        'Materialet har intet eksempel på et projektforslag eller en færdig problemformulering. Siden “Eksempler af Teknisk Analyse” siger kun, at eksempler fra 2.- og 3.-semesterprojekter vises i lektionen.',
        'L27 (genbrugt fra SW2PRJ2 og selv markeret som “reference, IKKE absolut regel”) har både projektformulering og problemformulering; rapportskabelonen har kun “Problemformulering/Hypotese”. Hvad forskellen præcist er, defineres ikke ud over de to punkter på L27 slide 9.',
        'BeoSound F er en konceptrapport fra et designforløb (2011), ikke et projektforslag. Den bruges i kurset som referencecase for krav og BDD/IBD.',
      ],
      keywords: ['projektforslag', 'problemformulering', 'problembeskrivelse', 'projektbeskrivelse', 'afgrænsning', 'MoSCoW', 'indledning', 'systemskitse', 'rigt billede', 'persona', 'BeoSound', 'teknisk analyse'],
    },

    {
      slug: 'ece-model',
      title: 'ECE-modellen og iterationer',
      short: 'ECE-modellen',
      week: 'Hele forløbet',
      definition:
        'ECE-modellen (semesterprojektmodellen) er “a use case-driven, ‘middleweight’ semi-iterative development process” til systemer med både hardware og software: **projektformulering → specifikation → arkitektur → iterativ design og implementering/modultest i parallelle spor → integrationstest → accepttest**, hvor hver fase afleverer et dokument.',
      intro: [
        'System engineering er ifølge L1 et tværfagligt felt, der handler om “how to specify requirements, architecture, design, integrate, and manage complex systems over their life cycles”. ECE-modellen er den konkrete proces, kurset giver jer til semesterprojektet; på L1 er den markeret “Vigtigt for Semesterprojekt”.',
      ],
      concepts: [
        {
          term: 'Faser og artefakter',
          body: [
            'Projektformulering → *projektformulering*. Specifikation → *kravspecifikation* og *accepttestspecifikation*. Arkitektur → *systemarkitektur (HW og SW)*. HW-, PC-SW- og µC-SW-design → *HW- og SW-designdokument*. Implementering/modultest → *hardware* og *source code*. Integrationstest → *logbog*. Accepttest → *gennemført accepttest*.',
            'Processen svarer på de tre grundspørgsmål i rækkefølge: hvad (specifikation), hvordan (arkitektur og design), virker det (test). På den gentagne version af figuren (L1 slide 43) ligger **Technical Analysis** mellem specifikation og arkitektur.',
          ],
        },
        {
          term: 'Arkitekturen fastlægges tidligt',
          body: [
            'Fordi både hardware og software skal udvikles, “the essential architecture needs to be fixed early in the project”. Arkitekturfasen deler systemet i CPU’er og HW/SW-dele med grænseflader — slidets eksempel er et X.10-hjemmeautomationssystem med en PC (CPU1), en X.10-kontroller (CPU2) og en X.10-enhed (CPU3), hver med HW- og SW-arkitektur. Se [[arkitektur|Arkitektur]] og [[swd/arkitekturproces|arkitektur som proces]] i SWD.',
          ],
        },
        {
          term: 'Iterativ inde i rammen',
          body: [
            'Kun design ↔ implementering/modultest er iterativt (den røde ramme “Iterative, cross-disciplinary”); derfor *semi*-iterativ. Hvert spor itererer for sig, og sporene mødes i integrationstesten. For et embedded projekt viser slide 20, hvordan SW-iterationer og HW board spins kører parallelt med HW/SW-integration efter hver runde.',
            'En typisk SW-iteration tager et udvalgt antal use cases (“Iteration Planning (UC x-y)”) gennem design, coding, testing og bug fixing.',
          ],
        },
        {
          term: 'Iterationer og timeboxing',
          body: [
            'Iterationer er **korte og timeboxed** — “reduce requirements, do not extend deadline”. Hver iteration giver et internt eller eksternt system i *production-grade* kvalitet, og hver iteration evalueres: hvad lærte vi?',
            'PRJ4’s eksempel på opdeling: gruppedannelse og projektvalg (1 uge), sprint 1 kravspecifikation (2 uger), sprint 2–4 (4, 3 og 3 uger), sprint 5 projektrapporten (2 uger) — med opfordringen “Brug gerne kortere iterationer – 1-2 uger!”.',
          ],
        },
        {
          term: 'I rapporten',
          body: [
            'Metodekapitlet får en figur over arbejdsprocessen; *God rapportskrivning* viser netop en “ARBEJDSMODEL” efter ECE-modellen med dokumenter pr. fase. Rapportskabelonen: beskriv *intentionen* i metodeafsnittet, ikke “vi brugte Scrum…”; hvordan det gik, hører til diskussionen.',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            '“Vi har brugt XXX fordi vi kendte det i forvejen” — skriv i stedet en prioritering. Afvigelser fra modellen giver *flere* point, når de er velmotiverede (*God rapportskrivning*, slide 21).',
          ],
        },
      ],
      viz: 'ece-model',
      keyPoints: [
        'Use case-drevet, semi-iterativ, til HW + SW.',
        'Hver fase har et dokument; accepttestspecifikationen laves sammen med kravspecifikationen.',
        'Arkitekturen fastlægges tidligt; derefter itererer HW-, PC-SW- og µC-SW-spor parallelt.',
        'Iterationer er korte og timeboxed: skær krav, ikke deadline.',
        'Teknisk analyse er broen fra specifikation til arkitektur.',
        'Metodekapitlet beskriver intentionen; diskussionen vurderer, hvordan det gik.',
      ],
      exam: [
        'Vi fulgte ECE-modellen: specifikation og accepttestspecifikation først, så arkitekturen, og derefter iterationer, hvor hvert delsystem blev designet, implementeret og modultestet.',
        '“Hvorfor kaldes den semi-iterativ?” Fordi kun design og implementering itererer; krav og arkitektur ligger fast forrest, så delsystemerne kan udvikles parallelt mod de samme grænseflader.',
        'Vores iterationer var timeboxed. Når tiden ikke slog til, flyttede vi en use case til næste iteration i stedet for at forlænge.',
        'Afveg vi fra modellen, står begrundelsen i metodeafsnittet, og konsekvensen diskuteres til sidst.',
      ],
      sources: [
        { path: k('00-kursus/velkommen-til-swise.md'), original: 'Velkommen til SWISE.pptx', pages: 'slide 22–23, 28–29, 39, 43' },
        { path: k('04-udviklingsprocesser/development-processes.md'), original: 'Development Processes.pdf', pages: 'slide 16–25' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 5, 7' },
        { path: k('13-rapport/god-rapportskrivning.md'), original: 'God_rapportskrivning.pdf', pages: 'slide 21' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 2, 8' },
      ],
      gaps: [
        'Modellen er tegnet til HW/SW-projekter med PC og mikrocontroller. Materialet siger ikke, hvordan den tilpasses et rent softwareprojekt uden HW- og µC-spor; rapportskabelonens eksempel bruger i stedet en stage-gate-model inspireret af UP (s. 8).',
        'ECE-modellen lægger specifikation før iterationerne, mens PRJ4’s iterationseksempel gør kravspecifikationen til sprint 1. De to billeder er forenelige, men materialet forbinder dem ikke.',
        'Refleksionsslide 25 henviser til “Vejledning til udviklingsprocessen for projekt 2” s. 4–10 (især arkitektur s. 9–10). Vejledningen er ikke i materialet.',
      ],
      keywords: ['ECE-modellen', 'semesterprojektmodellen', 'system engineering', 'semi-iterativ', 'timebox', 'iteration', 'sprint', 'HW/SW', 'board spin', 'teknisk analyse', 'arbejdsmodel'],
    },

    {
      slug: 'udviklingsprocesser',
      title: 'Udviklingsprocesser',
      week: 'Opstart',
      definition:
        'En udviklingsproces er en defineret række trin, der omformer **krav, ønsker, visioner, rammer og platform** til **system, dokumentation, kvalitet og tilfredshed**, under forbrug af udviklingstid og -ressourcer. Kurset gennemgår traditionelle (null, vandfald, V-model), iterative og inkrementelle, RUP og agile processer.',
      concepts: [
        {
          term: 'Hvorfor en proces?',
          body: [
            'En proces kan ligne overhead — man producerer måske ikke noget før sent. Men som ingeniører vil vi producere det rigtige, med de rigtige egenskaber, til rette tid og pris. Processen svarer på kundens spørgsmål: hvad laver I, hvornår er I færdige, hvad koster det, og hvordan håndterer I ændringer? Tree swing-tegneserien viser, hvad der sker uden: forståelsen går tabt mellem hvert led.',
          ],
        },
        {
          term: 'Vandfald og V-model',
          body: [
            'Vandfaldet går Analysis → Design → Implementation → Test uden vej tilbage. Slides citerer Royce (“a flawed, non-working model”) og en gennemgang af DoD-projekter, hvor 75 % af 37 mia. dollars “failed or were never used”. Vinje er mildere: vandfald passer til veldefinerede, velkendte og korte opgaver (under ca. 3 måneder), er let at styre og billig, når den er anvendelig — men maksimalt sårbar over for ændringer og risici.',
            'V-modellen er også sekventiel, men **testen planlægges parallelt med det tilsvarende udviklingstrin** — “improves quality”. Den bruges til små og mellemstore projekter med klare, faste krav. Hos Vinje er V-modellen en *teststrategi*: accepttesten planlægges efter foranalysen, integrationstesten efter design, og udførelsen ligger stadig sidst.',
          ],
        },
        {
          term: 'Iterativ og inkrementel',
          body: [
            '*Iterativ* er gentagelsen: en iteration er én gang gennem samme delproces, og resultatet er et delvist fungerende system i produktionskvalitet. *Inkrementel* er den fortsatte udvidelse af systemets kapabiliteter. Slide 15 viser kravopfyldelse for use case 1–4 — den inkrementelle udvikling hæver dem én ad gangen.',
          ],
        },
        {
          term: 'RUP',
          body: [
            'Rational Unified Process er et procesframework med fire sekventielle faser — **Inception** (forstå hvad), **Elaboration** (forstå hvordan), **Construction** (byg det), **Transition** (brug/sælg/lever det) — og ni samtidige discipliner, hvis indsats vises som pukler i “hump chart”. Inception rummer problembeskrivelse, afgrænsning, use cases, accepttestplan, risikoanalyse og overordnet arkitektur.',
            'Vinje: hver fase slutter med en milepæl — efter inception er “målet det rigtige”, efter elaboration er “indholdet det rigtige”, og ved elaborations slutning skal 80 % af use cases være skrevet detaljeret, og det skal være de vigtigste og mest risikofyldte.',
          ],
        },
        {
          term: 'Agile metoder',
          body: [
            'Det agile manifest (2001) værdsætter individer og samarbejde, fungerende software, kundesamarbejde og at reagere på forandring højere end processer, dokumentation, kontrakter og planer — “while there is value in the items on the right”. Bundlinjen er tillid til mennesker frem for papir, og slides noterer: “mostly used for pure software development”. XP er eksemplet; se [[swd/xp|Extreme Programming]].',
            'Faren er Dilbert-udgaven: “no more planning and no more documentation”. Vinjes fællestræk for agile metoder: iterative, drevet af brugerønsker, timeboxed, risikodrevne og tolerante over for ændringer.',
          ],
        },
        {
          term: 'Tilstanden i dag',
          body: [
            '“The days of the standard process are over.” Processen skræddersys: typisk stærkt iterativ med udvalgte agile elementer og styret med Scrum — se [[scrum-kanban|Scrum og Kanban]]. Vinje giver flere udviklingsstrategier at vælge imellem (delleveringer, cyklisk, versionsvis, RAD, RAP, genbrug), hver med anvendelighed, fordele og ulemper.',
          ],
        },
      ],
      viz: 'procesmodeller',
      keyPoints: [
        'Processen omformer krav til system under forbrug af tid og ressourcer.',
        'Vandfald: faserne i rækkefølge, ingen vej tilbage — kun til små, velkendte opgaver.',
        'V-model: sekventiel, men testen planlægges sammen med hvert udviklingstrin.',
        'Iterativ = gentagelse; inkrementel = udvidelse. Hver iteration giver noget, der virker.',
        'RUP: fire faser med milepæle, ni discipliner, use case-drevet.',
        'I praksis skræddersyet: iterativ med agile elementer, styret med Scrum.',
      ],
      exam: [
        '“Hvorfor ikke vandfald?” Kravene var ikke stabile, og vandfaldet er maksimalt sårbart over for ændringer; med iterationer havde vi et kørende system efter hver periode.',
        'V-modellen fra kurset lever videre i vores proces: accepttesten blev specificeret sammen med kravene.',
        'Iterativt betyder, at vi gentog design–kode–test; inkrementelt, at hver iteration tilføjede use cases.',
        'Vores proces er skræddersyet: ECE-modellens faser, men iterationerne blev styret med Scrum-elementer.',
      ],
      sources: [
        { path: k('04-udviklingsprocesser/development-processes.md'), original: 'Development Processes.pdf', pages: 'slide 2–43' },
        { path: k('bog/13-vinje-udviklingsprocesser.md'), original: 'Vinje, Projektledelse af systemudvikling (ISE Book, kap. 13)', pages: 's. 100–103, 119–131, 259–277' },
        { path: k('04-udviklingsprocesser/kanban.md'), original: 'Kanban - Copy (1).pptx', pages: 'slide 2', note: 'Det agile manifest på dansk' },
      ],
      gaps: [
        'Slides og bog vurderer vandfaldet forskelligt: slide 10 kalder det med Royce “flawed, non-working”, mens Vinje (s. 121–122) anbefaler det til små, korte og velkendte projekter og foreslår overlap mellem faserne, som slidets figur ikke har.',
        'Slide 15 (iterativ vs. inkrementel) var animeret; PDF’en viser kun sluttilstanden med alle fire use cases på 100 %. Hvordan de to begreber adskiller sig trin for trin, kan ikke læses i materialet.',
        'Vinjes kapitel om strategier er stedvis ulæseligt i transskriptionen (RAP-afsnittet og kravstyring i RUP).',
      ],
      keywords: ['vandfald', 'waterfall', 'V-model', 'iterativ', 'inkrementel', 'RUP', 'Unified Process', 'inception', 'elaboration', 'construction', 'transition', 'agile', 'agilt manifest', 'XP', 'DSDM', 'RAD', 'delleveringer'],
    },

    {
      slug: 'scrum-kanban',
      title: 'Scrum og Kanban',
      week: 'Hele forløbet',
      definition:
        'Scrum er et **framework**, ikke en proces: tre roller (Product Owner, Development Team, Scrum Master), fem events (Sprint som beholder for Sprint Planning, Daily Scrum, Sprint Review og Sprint Retrospective) og tre artefakter (Product Backlog, Sprint Backlog, Increment), bundet sammen af en fælles **Definition of “Done”**. Kanban har sin egen lektion (L9), men slidesættet indeholder kun arbejdsspørgsmål.',
      concepts: [
        {
          term: 'Empiri: transparency, inspection, adaptation',
          body: [
            'Scrum bygger på empirisk proceskontrol: viden kommer fra erfaring, og beslutninger træffes på det kendte. Tre søjler: **transparency** (fælles sprog og fælles definition af “Done”), **inspection** (hyppigt, men ikke så ofte at det står i vejen for arbejdet) og **adaptation** (justér hurtigst muligt, når noget afviger). De fem værdier er commitment, courage, focus, openness og respect.',
          ],
        },
        {
          term: 'Roller',
          body: [
            '**Product Owner** er én person, ikke en komité, og eneansvarlig for Product Backlog og dens rækkefølge. **Development Team** er selvorganiserende og tværfagligt, uden titler og uden underteams; optimal størrelse er 3–9. **Scrum Master** er servant-leader: sikrer at Scrum forstås og følges og fjerner impediments.',
          ],
        },
        {
          term: 'Events og timeboxes',
          body: [
            '**Sprint**: højst én kalendermåned, fast længde, og en ny starter straks efter den forrige. **Sprint Planning** (≤ 8 t for en måned) svarer på *hvad* kan leveres og *hvordan* — resultatet er Sprint Goal og Sprint Backlog. **Daily Scrum** (15 min, kun Development Team): hvad gjorde jeg i går, hvad gør jeg i dag, ser jeg impediments? **Sprint Review** (≤ 4 t) inspicerer incrementet med stakeholders og tilpasser Product Backlog. **Sprint Retrospective** (≤ 3 t) inspicerer teamet selv og planlægger forbedringer.',
          ],
        },
        {
          term: 'Artefakter og “Done”',
          body: [
            '**Product Backlog**: ordnet liste over alt, produktet kan få brug for — aldrig færdig. **Sprint Backlog**: de valgte items plus planen; kun Development Team ændrer den. **Increment**: summen af alle færdige items, og den skal være “Done” — brugbar, uanset om den frigives. Fremdrift følges som resterende arbejde (burn-downs, burn-ups), men “only what has happened may be used for forward-looking decision-making”.',
            'End note: “implementing only parts of Scrum is possible, [but] the result is not Scrum.”',
          ],
        },
        {
          term: 'Kanban i materialet',
          body: [
            'L9’s slidesæt viser det agile manifest og fire arbejdsspørgsmål: *Hvad er Kanban? Hvad blev det lavet til? På hvilken måde er Kanban agil? Hvilke processer, artefakter og roller er der i Kanban?* Svarene gives i lektionen, ikke i materialet — se hullerne nedenfor.',
          ],
        },
        {
          term: 'I et semesterprojekt',
          body: [
            'PRJ4 foreslår sprints på 1–2 uger og nævner Jira, Notion, Scrumwise og Trello som Scrum-værktøjer, Git (GitHub, gitlab.au.dk, Bitbucket) til versionsstyring — læringsmålet er at *anvende projekt- og versionsstyringsværktøjer*. Se [[swt/git-workflows|Git workflows]], [[swt/ci|Continuous Integration]] og [[swt/agil-integration|agil integration]] i SWT. Vinje: Scrum “supplerer XP ved i højere grad at sigte på ledelsesprocessen” ([[swd/xp|XP]]).',
            'Typisk fejl i rapporten: “vi brugte Scrum…” i metodeafsnittet. Metoden beskriver intentionen; hvordan det gik, diskuteres til sidst (rapportskabelonen, s. 2).',
          ],
        },
      ],
      viz: 'scrum-kanban',
      keyPoints: [
        'Scrum: 3 roller, 5 events, 3 artefakter, én Definition of “Done”.',
        'Sprint ≤ 1 måned med fast længde; Daily Scrum 15 min.',
        'Product Owner ordner backloggen; Development Team vælger, hvor meget der tages ind.',
        'Increment skal være “Done” ved hver sprints slutning.',
        'Review inspicerer produktet; retrospective inspicerer processen.',
        'Kanban: materialet stiller kun spørgsmålene.',
      ],
      exam: [
        '“Hvem var Product Owner?” Svar konkret: hvem ordnede backloggen, og hvordan blev prioriteringen besluttet — og vær ærlig, hvis rollen var delt.',
        'Vi havde sprints på X uger med sprint planning, et kort dagligt møde og review/retrospective, og vores Definition of Done krævede fx at koden var testet og merget.',
        'Review handler om produktet og tilpasser backloggen; retrospective handler om hvordan vi arbejder.',
        'Scrum er et framework, ikke en proces; vi brugte det til at styre iterationerne i ECE-modellen.',
        'Kanban adskiller sig ved at arbejde uden faste sprints — kan I ikke forklare det ud fra kursets materiale, så sig at det kom fra lektionen.',
      ],
      sources: [
        { path: k('04-udviklingsprocesser/scrum-guide-2016.md'), original: '2016-Scrum-Guide-US.pdf', pages: 's. 3–16' },
        { path: k('04-udviklingsprocesser/kanban.md'), original: 'Kanban - Copy (1).pptx', pages: 'slide 1–3' },
        { path: k('04-udviklingsprocesser/development-processes.md'), original: 'Development Processes.pdf', pages: 'slide 43' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 7, 11' },
        { path: k('bog/13-vinje-udviklingsprocesser.md'), original: 'Vinje, Projektledelse af systemudvikling (ISE Book, kap. 13)', pages: 's. 259–260' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 2' },
      ],
      gaps: [
        'Kanban: L9-slidesættet har kun titel, manifestet og fire spørgsmål. **Uden for materialet:** Kanban visualiserer arbejdet på en tavle med kolonner, begrænser antallet af opgaver i gang pr. kolonne (**WIP-grænse**, work in progress) og trækker (**pull**) nyt arbejde ind, når der er plads, i stedet for at planlægge faste sprints. Figuren bruger det og er mærket derefter.',
        'Kurset bruger Scrum Guide fra 2016. **Uden for materialet:** 2020-udgaven erstatter “Development Team” med “Developers” i ét Scrum Team, tilføjer et *Product Goal* og kalder “Done” en *commitment* til incrementet. Tjek hvilken udgave censor forventer.',
        'Materialet siger ikke, hvordan en studiegruppe uden kunde skal besætte Product Owner-rollen.',
      ],
      keywords: ['Scrum', 'sprint', 'Product Owner', 'Scrum Master', 'Development Team', 'Daily Scrum', 'Sprint Review', 'retrospective', 'Product Backlog', 'Sprint Backlog', 'Increment', 'Definition of Done', 'Kanban', 'WIP', 'pull', 'burn-down', 'Jira', 'Trello'],
    },

    {
      slug: 'projektledelse',
      title: 'Projektledelse: WBS, estimering og kritisk vej',
      short: 'Projektledelse',
      week: 'Opstart og løbende',
      definition:
        'Projektplanlægning er en **kontinuerlig** aktivitet: nedbryd projektet i work packages (**WBS**), estimér hver med `ETC = (P + 4·N + O) / 6`, bestem afhængigheder og **kritisk vej**, læg planen i et Gantt-diagram — og følg op og justér løbende.',
      concepts: [
        {
          term: 'Gruppe, team og roller',
          body: [
            'En gruppe har individuelt ansvar og individuelle mål; et team har også **fælles** ansvar, fælles mål og kollektive arbejdsprodukter. Belbin: “Nobody is perfect – but a team can be” — otte roller (organiser, analyst, idea generator, finisher, coordinator, communicator, contact creator, initiator), hver med styrker og tilladte svagheder. Teams går gennem **forming, storming, norming, performing**.',
            'Traditionelle roller er projektleder, teammedlemmer og sekretær. Projektlederen styrer forventninger, planlægger (helst med teamet), holder informationsniveauet og er teamets lynafleder. I PRJ4 er gruppen selvstyrende, og vejlederen primært *procesvejleder*.',
          ],
        },
        {
          term: 'Work Breakdown Structure',
          body: [
            'WBS er et træ med stadig finere opdeling af arbejdet. Bladene — *work packages* — skal være håndterbare, veldefinerede og til at estimere, og WBS’en er grundlaget for tid, omkostninger, bemanding og afhængigheder. Slidets cykeleksempel fordeler arbejdet i procent på hvert niveau: 1.6 Integration fylder 35 %, heraf 17 % test.',
            'Vinje: oversete aktiviteter svarer til **100 % underestimering** — en glemt aktivitet på 5 dage giver 5 dages forsinkelse. Vis reviews som selvstændige, bemandede aktiviteter; en god aktivitet varer ideelt 1–2 arbejdsdage.',
          ],
        },
        {
          term: 'Estimering (ETC)',
          body: [
            'For hver work package gives tre skøn: optimistisk *O*, normalt *N* og pessimistisk *P*. `ETC = (P + 4·N + O) / 6` vægter det normale skøn fire gange. Aktivitet A i slidets eksempel: `(6 + 4·4 + 2) / 6 = 4,00`.',
            'Vinje: et estimat er lidt værd uden viden om usikkerheden, og et rimeligt mål er, at estimater rammer inden for ±10 %.',
          ],
        },
        {
          term: 'Afhængigheder og kritisk vej',
          body: [
            'Bestem afhængigheder (“C cannot start before A and B is complete”) og den **kritiske vej**: “the path which, if delayed, delays the project as a whole”. I slidets eksempel med A–G er vejene A→D→F = 14,83, A→C→E→G = 19,50 og B→E→G = 15,67 dage, så A, C, E og G er kritiske — de står med røde bjælker i Gantt-diagrammet.',
          ],
        },
        {
          term: 'Gantt, milepæle og opfølgning',
          body: [
            'Gantt-diagrammet giver det grafiske overblik over varighed, afhængigheder, kritisk vej og milepæle (varighed 0, tegnet som diamant). Planlægningen fortsætter: overvåg status, sammenlign tid brugt og tilbage med milepælene, og justér plan eller omfang. Vinje: en god detailplan har milepæle på den kritiske vej og viser de anvendte estimater.',
          ],
        },
      ],
      viz: 'pert',
      keyPoints: [
        'Planlægning er kontinuerlig, ikke en engangsaktivitet.',
        'WBS-bladene er work packages, der kan estimeres.',
        '`ETC = (P + 4·N + O) / 6`.',
        'Kritisk vej = den længste vej; forsinkelse på den forsinker projektet.',
        'En glemt aktivitet er 100 % underestimeret — og reviews skal stå på planen.',
        'Team ≠ gruppe: fælles mål og fælles ansvar.',
      ],
      exam: [
        'Vi nedbrød projektet i en WBS, hvor bladene var work packages på få dage, og estimerede hver med optimistisk, normalt og pessimistisk skøn.',
        'Den kritiske vej er den længste kæde af afhængige aktiviteter; har en aktivitet på den nul slæk, forsinker hver dags forsinkelse hele projektet.',
        'Aktiviteter uden for den kritiske vej har slæk, så dem kan vi flytte for at udjævne bemandingen.',
        'Planen blev fulgt op hver sprint: vi sammenlignede brugt og resterende tid med milepælene og skar i omfanget, når det var nødvendigt.',
      ],
      sources: [
        { path: k('07-projektledelse/project-management.md'), original: 'Project Management_E22.pdf', pages: 'slide 5–27' },
        { path: k('07-projektledelse/README.md'), note: 'Brightspace-øvelsen: WBS og ETC for et tidligere semesterprojekt' },
        { path: k('bog/14-vinje-projektledelse.md'), original: 'Vinje, Projektledelse af systemudvikling (ISE Book, kap. 14)', pages: 's. 23–26, 137–141, 178–183' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 5' },
      ],
      gaps: [
        'Slides giver kun forventet tid og viser den kritiske vej i Gantt-diagrammet (slide 22–23). **Uden for materialet:** fremad- og baglænsberegningen med tidligste/seneste start og slut (ES/EF/LS/LF) og slæk, som figuren bruger. Vejlængderne står heller ikke på sliden; de er beregnet ud fra tabellen.',
        'Slidets tabel har ingen enhed; Gantt-diagrammet på slide 23 angiver varighederne i dage. Med afrundede værdier summer den kritiske vej til 19,51; med eksakte brøker (fx 31/6 for C) er den 19,50.',
        'Formlen hedder “PERT formula” på Brightspace-siden, men slides kalder den kun ETC. Vinjes afsnit om tidsestimering (s. 140–141) er stærkt korrumperet i transskriptionen og har ingen formel.',
      ],
      keywords: ['WBS', 'work breakdown structure', 'work package', 'ETC', 'PERT', 'estimering', 'kritisk vej', 'critical path', 'Gantt', 'milepæl', 'slæk', 'slack', 'Belbin', 'forming storming norming performing', 'team'],
    },

    {
      slug: 'risikoanalyse',
      title: 'Risikoanalyse',
      week: 'Opstart og løbende',
      definition:
        'Risikoanalysen afdækker det, der kan vælte planen: **identificér** risici, **vurdér** dem som sandsynlighed × konsekvens, og lav en **mitigation- eller beredskabsplan** for hver. Den er et obligatorisk produkt og opdateres løbende.',
      concepts: [
        {
          term: 'Hvorfor',
          body: [
            'Projektplanen er objektiv, men idealiseret: “No campaign plan survives first contact with the enemy!” (von Moltke). Risici kan ikke undgås, men nogle kan forudses og planlægges for. Vinje formulerer opgaven direkte: *“Hvilke forhold, i form af uheld eller mulige trusler, kan vælte planen?”*',
          ],
        },
        {
          term: 'Identifikation',
          body: [
            'Slides deler risici i tre: **projekt** (tidsplan, ressourcer, kompetencer, estimater, værktøjer — fx et teammedlem forlader gruppen), **produkt** (krav, kvalitet, performance, indkøbte komponenter, teknologi — fx dårlige krav) og **forretning** (organisation, konkurrenter, pris).',
            'Vasa-casen er kursets katalog over, hvad der går galt: excessive schedule pressure, changing needs, manglende specifikation og projektplan, excessive innovation, requirements creep — og “ignoring the obvious”: skibet blev søsat efter en fejlet stabilitetstest.',
          ],
        },
        {
          term: 'Vurdering: sandsynlighed × konsekvens',
          body: [
            'Slidets risikotabel bruger sandsynlighed 1–5 og konsekvens 1–5, så **impact = probability × consequence** ligger i 1–25: “Members leave team” 2 × 3 = 6, “Subsuppliers delayed” 2 × 5 = 10, “Requirement changes” 5 × 3 = 15.',
            'Vinjes minimumsmodel bruger S = 1–3 og K = 1, 3 eller 10 (10 = “planen skrider”), og **P ≥ 9** udløser handling med det samme. Hans eksempel: “Ændringer til kravspecifikationen”, S 2, K 10, P 20 → godkendende review efter hvert faseskift.',
          ],
        },
        {
          term: 'Risk matrix',
          body: [
            'Den simple udgave er en 3 × 3-matrix med konsekvens (high/medium/low) mod sandsynlighed. Felterne klassificeres **A** (højeste prioritet), **B** og **C**: høj/høj, høj/medium og medium/høj er A; lav/lav, lav/medium og medium/lav er C. Øvelsen i kurset er at lave en for sit eget semesterprojekt.',
          ],
        },
        {
          term: 'Tiltag: forebyggelse og beredskab',
          body: [
            'For hver risiko: en **risk mitigation plan** (reducér sandsynlighed eller konsekvens) og/eller en **contingency plan** (hvad gør vi, når den indtræffer). Slides nævner som udvidelse at identificere årsagen og holde de to planer adskilt. Vinje: vælg forebyggende tiltag, når omkostningen tillader det; ved lav sandsynlighed og lav konsekvens er beredskab nok. En risiko kan også accepteres, fx hvis den er dyrere at imødegå end at bære. SWOT kan udvide analysen med styrker og muligheder.',
          ],
        },
        {
          term: 'I rapporten',
          body: [
            'Rapportskabelonen har et afsnit “Risikohåndtering” i metodekapitlet: risikomatricen vedligeholdes løbende, og risici kan være arbejdsmæssige, kravsmæssige (“er krav F1.2 mulig at opfylde eller måle?”) og tekniske på arkitektur- og designniveau. Arkitekturrisici bruges i arkitekturkapitlet som begrundelse for valg — se [[arkitektur|Arkitektur]].',
          ],
        },
      ],
      viz: 'risikomatrix',
      keyPoints: [
        'Tre trin: forestil dig risikoen, vurdér den, lav en plan for den.',
        'Projekt-, produkt- og forretningsrisici.',
        'Impact = sandsynlighed × konsekvens; de højeste behandles først.',
        'Mitigation (forebyg) og contingency (beredskab) er to forskellige planer.',
        'Risikomatricen opdateres løbende og begrunder arkitekturvalg.',
      ],
      exam: [
        'Vores største risiko var kravændringer: høj sandsynlighed, mellem konsekvens. Tiltaget var hyppige demonstrationer for vejleder, som slidets eksempel foreslår.',
        'Vi skelnede mellem forebyggende tiltag og beredskab: forebyggelse sænker sandsynligheden, beredskab bestemmer, hvad vi gør, når det sker.',
        'Risikoen “et medlem forlader gruppen” mødte vi med vidensdeling, så ingen del af systemet kun var kendt af én person.',
        'Risikomatricen blev opdateret hver sprint, og de tekniske risici styrede, hvad vi prototypede først.',
      ],
      sources: [
        { path: k('07-projektledelse/project-management.md'), original: 'Project Management_E22.pdf', pages: 'slide 28–33' },
        { path: k('bog/14-vinje-projektledelse.md'), original: 'Vinje, Projektledelse af systemudvikling (ISE Book, kap. 14)', pages: 's. 83–94' },
        { path: k('01-kravspecifikation/vasa-case-study.md'), original: 'System Specification VasaCaseStudy.pdf', pages: 's. 5–6' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 8–10, 38' },
      ],
      gaps: [
        'Slides og bog bruger forskellige skalaer: slides 1–5 × 1–5 (impact 1–25), Vinje 1–3 × {1, 3, 10} med tærsklen P ≥ 9. Risk matrixen på slide 32 er 3 × 3 (high/medium/low), og materialet siger ikke, hvordan 1–5-skalaen oversættes til de tre niveauer.',
        'Slide 31 skriver “Risk Impact = Probability x Consequence (Highest)”. Hvad “(Highest)” betyder — sortering eller den højeste af flere vurderinger — forklares ikke.',
        'Flere afsnit i Vinjes kapitel 5.4 (løbende model, forebyggende tiltag) er ulæselige i transskriptionen.',
      ],
      keywords: ['risiko', 'risk', 'risikomatrix', 'risk matrix', 'sandsynlighed', 'konsekvens', 'impact', 'mitigation', 'contingency', 'beredskab', 'SWOT', 'Vasa', 'requirements creep'],
    },
  ],
}
