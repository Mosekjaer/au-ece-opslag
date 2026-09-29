import type { Part } from '../types'
import { k } from './paths'

/* Del 2: Krav. Kravspecifikation (FURPS+, MoSCoW), målbare ikke-funktionelle krav,
   use case-diagram, fully dressed use case og accepttestspecifikation med sporbarhed. */

export const krav: Part = {
  id: 'krav',
  title: 'Krav',
  topics: [
    {
      slug: 'kravspecifikation',
      title: 'Kravspecifikationen: opbygning, FURPS+ og MoSCoW',
      short: 'Kravspecifikation',
      week: 'Iteration 1',
      definition:
        'En **kravspecifikation** beskriver *hvad* systemet skal gøre og være — ikke *hvordan*. Den rummer funktionelle krav (use cases), ikke-funktionelle krav (FURPS+), en prioritering af begge (MoSCoW) og kravene til accepttesten. Den er input til designet og den baseline, accepttesten måles imod.',
      intro: [
        'Kravspecifikationen er projektets første store artefakt efter projektformuleringen. I ECE-modellen giver fasen *Specifikation* to dokumenter: kravspecifikationen og accepttestspecifikationen. I PRJ4 er hovedopgaven i første sprint netop “at udarbejde en Use Case baseret kravspecifikation”, som en anden gruppe derefter reviewer. Kurset nævner user stories som et tilladt alternativ.',
        'Grunden til at bruge tid på den: en ændring af funktionalitet koster ifølge slides 3× i designfasen, 5–10× under implementeringen og 10–100× efter release. Vasa-casen er kursets advarsel om, hvad der sker, når kravene skifter uden at blive skrevet ned.',
      ],
      concepts: [
        {
          term: 'Artefaktet: hvad kravspecifikationen består af',
          body: [
            'Kursets opskrift (“Typer af specifikation — vigtigt”) har fem dele: et **aktørkontekstdiagram**; **funktionelle krav** som use case-diagram plus fully dressed use case-beskrivelser; **ikke-funktionelle krav** efter FURPS+, “testbare og målbare”; en **prioritering** med MoSCoW af både funktionelle og ikke-funktionelle krav; og **accepttestkrav**, altså hvordan hvert krav kan testes. Øvelse A i PRJ4 (Pakkeboksen) følger præcis den rækkefølge: aktør-kontekstdiagram → use case-diagram → fully dressed “Hent pakke” → 8 FURPS+-krav med MoSCoW → to accepttestcases.',
            'Slides tilføjer, at en specifikation er mere end funktionelle krav. Den bør også forholde sig til kravændringer, testbetingelser, træning, en realistisk tidsplan, eksterne begrænsninger (fysiske, juridiske), ejerskab og stakeholders samt eksisterende systemer og hardware.',
            'Detaljerne står i [[ikke-funktionelle-krav|målbare ikke-funktionelle krav]], [[use-case-diagram|aktører og use case-diagram]], [[fully-dressed-uc|fully dressed use case]] og [[accepttest|accepttestspecifikation]].',
          ],
        },
        {
          term: 'Hvornår i projektet',
          body: [
            'Kravspecifikationen skrives i første iteration, men den fryses ikke. Larman kalder UP-praksis for *manage requirements*: “a systematic approach to finding, documenting, organizing, and tracking the *changing* requirements”. I gennemsnit ændres 25 % af kravene i et softwareprojekt, og i en undersøgelse blev 45 % af de features, der var specificeret tidligt i vandfaldsstil, aldrig brugt.',
            'Larman advarer direkte: et “iterativt” projekt, der prøver at specificere de fleste krav, før der programmeres, har misforstået iterativ udvikling. Hans mellemvej er at skrive 10–20 % af de arkitektonisk vigtigste og mest risikable krav i detaljer først og resten løbende. For projektet betyder det: aflevér kravspecifikationen i sprint 1, og versionér den, når iterationerne afslører nye krav. Se [[ece-model|ECE-modellen]] og [[udviklingsprocesser|udviklingsprocesser]].',
          ],
        },
        {
          term: 'Stakeholders og elicitation',
          body: [
            'Specifikationen bruges af flere: kunden (forretningsmål, kontrakt), projektlederen (planlægning, fremdrift), systemingeniøren (design, funktionalitet, begrænsninger) og testeren/QA (testplanlægning, verifikation, validering). Processen er en cyklus: *elicitation → specification → validation → negotiation*, med dokumentation og styring i midten.',
            'Teknikkerne til at finde kravene er interview (kontekstfri spørgsmål; et spørgeskema erstatter ikke et interview), **stakeholderanalyse** (hvem er de, hvad er deres mål, hvilke risici og omkostninger ser de?), brainstorm og prototype, plus workshop, opgavedemonstration og rollespil. Øvelse 1 på slides er typisk: find stakeholders for en pantautomat og skriv 5–10 funktionelle krav med MoSCoW.',
          ],
        },
        {
          term: 'Funktionelle og ikke-funktionelle krav — FURPS+',
          body: [
            '**Funktionelle krav** er “what a system is supposed to *do*”: adfærd mellem input og output, specificeret med use cases. **Ikke-funktionelle krav** er “how a system is supposed to *be*”: kvaliteter og begrænsninger. Slides understreger, at manglende kvaliteter får et system til at fejle lige så meget som en glemt funktion.',
            '**FURPS+** (Robert Grady, HP) er kategorierne: *Functionality*, *Usability*, *Reliability*, *Performance*, *Supportability* og *+* for resten — design- og fysiske begrænsninger, interfaces, legal, test, reuse, økonomi, miljø (RoHS, WEEE, EMC) m.m. Larman bruger FURPS+ som en **tjekliste for dækning**: gå kategorierne igennem, så en vigtig side af systemet ikke bliver overset. U, R, P og S kaldes samlet *quality attributes* eller “-ilities”, og de former arkitekturen.',
          ],
        },
        {
          term: 'MoSCoW-prioritering',
          body: [
            '**M**ust (skal), **S**hould (bør, hvis muligt), **C**ould (kan, hvis det ikke går ud over noget) og **W**on’t (ikke denne gang, men gerne senere). Slidets kaffemaskine: den *must* kunne lave en kop kaffe, *should* kunne vise behov for service, *could* kunne tilsætte mælk og *won’t* automatisk fylde vand på.',
            'Kursets hovedpointe står med udråbstegn: **MoSCoW er ikke selv krav — det er prioritering.** Prioriteringen gælder både funktionelle og ikke-funktionelle krav, og i Pakkeboks-øvelsen formuleres kravene med *skal*, *bør* og *kunne*. MoSCoW er projektets afgrænsning: det er Must-kravene, accepttesten skal bestå, før I kan sige, at systemet er færdigt.',
          ],
        },
        {
          term: 'Gode krav',
          body: [
            'Slide 39 lister syv egenskaber: **correct** (der er faktisk brug for det), **unambiguous** (kun én fortolkning), **complete** (alle væsentlige krav er med), **consistent** (ingen krav modsiger hinanden), **verifiable** (kan bevises ved test), **modifiable** (let at ændre) og **traceable** (kravets oprindelse er klar).',
            'Et krav skal beskrive *hvad*, ikke *hvordan*: “The system records the sale”, ikke “writes the sale to a database” (Larman). Og hvert krav får et nummer, så det kan spores til use case, test og design — se [[accepttest|traceability-matrixen]].',
          ],
        },
        {
          term: 'Vasa: kursets advarsel',
          body: [
            'Krigsskibet Vasa sank på jomfruturen i 1628 efter 1300 meter. Kongen ændrede kravene undervejs: fra et 108-fods skib med ét kanondæk til et 135-fods skib med to, og bevæbningen blev revideret flere gange. Der blev aldrig lavet specifikationer, og de manglende specifikationer blev derfor heller ikke revideret. Skibsbyggeren døde midt i projektet uden dokumenterede planer, og en krængningstest, hvor 30 mand løb fra side til side, blev afbrudt, fordi skibet var ved at kæntre — det blev søsat alligevel.',
            'Fairleys ti lektier omfatter bl.a. tidspres, skiftende behov, manglende tekniske specifikationer, ingen dokumenteret projektplan, for meget innovation, *requirements creep* (ingen opdagede, hvor meget skibet havde ændret sig), manglende metoder, at ignorere det åbenlyse (en fejlet test) og at resultater ikke blev kommunikeret. Brug casen til eksamen, når I skal forklare, hvorfor I versionerer kravene og tager en fejlet accepttest alvorligt.',
          ],
        },
      ],
      viz: 'krav-furps-moscow',
      keyPoints: [
        'Kravspecifikationen = aktørkontekst + use cases + FURPS+-krav + MoSCoW + accepttestkrav.',
        'Funktionelt krav: hvad systemet skal *gøre*. Ikke-funktionelt: hvordan det skal *være*.',
        'FURPS+ er en tjekliste for dækning; MoSCoW er prioritering, ikke et krav.',
        'Gode krav er bl.a. entydige, verificerbare og sporbare — hvert krav får et id.',
        'Kravene skrives først, men versioneres gennem iterationerne (Larman: 25 % ændres).',
        'Vasa: skiftende krav uden specifikation og en ignoreret test sænkede skibet.',
      ],
      exam: [
        '“Hvad er forskellen på et funktionelt og et ikke-funktionelt krav?” — Det funktionelle beskriver hvad systemet gør, og vi skrev dem som use cases. Det ikke-funktionelle beskriver hvor godt, og vi sorterede dem efter FURPS+ og gjorde dem målbare, så de kan accepttestes.',
        '“Er MoSCoW et krav?” — Nej, det er en prioritering. Vi har prioriteret både use cases og kvalitetskrav, og vores Must-krav er dem, accepttesten skal bestå.',
        '“Hvordan brugte I FURPS+?” — Som tjekliste: vi gik kategorierne igennem for at se, om vi havde glemt fx pålidelighed eller supportability.',
        '“Hvad gjorde I, da kravene ændrede sig?” — Kravspecifikationen er versioneret; ændringer blev ført ind og sporet videre til use case og test. Vasa viser, hvad der sker, når kravene ændres uden at specifikationen følger med.',
        '“Hvem er jeres stakeholders, og hvordan fandt I kravene?” — Svar med jeres stakeholderanalyse og de elicitation-teknikker, I faktisk brugte.',
      ],
      sources: [
        { path: k('01-kravspecifikation/system-specification.md'), original: 'System Specification.pdf', pages: 'slide 5–43' },
        { path: k('01-kravspecifikation/vasa-case-study.md'), original: 'System Specification VasaCaseStudy.pdf', pages: 's. 1–6' },
        { path: k('bog/01-larman-ch5-requirements.md'), original: 'ISE Book: 01_Larman_Ch5_Requirements.tex', pages: 's. 54–57' },
        { path: k('00-kursus/velkommen-til-swise.md'), original: 'Velkommen til SWISE.pptx', pages: 'slide 29, 42' },
        { path: k('00-kursus/afleveringsopgave-a-pakkeboksen.md'), original: 'Obligatorisk Afleveringsopgave A - Pakkeboksen.pdf', pages: 's. 1–3' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 7, 9' },
      ],
      gaps: [
        'ECE-modellen og PRJ4-introduktionen lægger kravspecifikationen som én aflevering i første sprint, mens Larman kap. 5 kalder det en “profound misunderstanding” at specificere de fleste krav før programmeringen. Materialet forener ikke de to; guiden anbefaler en versioneret kravspecifikation, som er Larmans linje.',
        '“+” i FURPS+ er ikke det samme i slides og bog: slide 23 og 31 nævner design- og fysiske begrænsninger, interfaces, legal, test, reuse, økonomi, æstetik, forståelighed, teknologiske trade-offs og miljø; Larman nævner implementation, interface, operations, packaging og legal. Velkommen-slide 42 staver det “FUPRS+”.',
        'Pakkeboks-øvelsen kræver et krav om **sikkerhed**, men slidenes FURPS+-gennemgang har ingen sikkerhedskategori. Larman placerer *security* under F (Functional). Materialet siger ikke, hvor et sikkerhedskrav skal stå.',
        '**User stories** er tilladt som alternativ i PRJ4-introduktionen (slide 9), men ISE-materialet underviser ikke i dem; Larman nævner kun XP-“story cards” i forbifarten. Se [[swd/xp|Extreme Programming]] i SWD.',
        'Slide 41 citerer, at en specifikation, der ikke kan være på én side, ikke kan forstås, mens slide 13 kræver en “complete description”. Materialet kommenterer ikke modsætningen.',
      ],
      keywords: ['kravspecifikation', 'requirements', 'FURPS+', 'FUPRS', 'MoSCoW', 'must', 'should', 'could', 'won’t', 'skal', 'bør', 'kan', 'stakeholder', 'elicitation', 'interview', 'Vasa', 'requirements creep', 'funktionelle krav', 'ikke-funktionelle krav', 'user stories', 'gode krav'],
    },

    {
      slug: 'ikke-funktionelle-krav',
      title: 'Målbare ikke-funktionelle krav',
      short: 'Ikke-funktionelle krav',
      week: 'Iteration 1',
      definition:
        'Et **ikke-funktionelt krav** (kvalitetskrav) beskriver en egenskab eller begrænsning ved systemet. Det skal være **verificerbart** (have en målbar metrik) og **objektivt** (kunne testes). Et krav som “systemet skal være nemt at bruge” kan ingen accepttest afgøre; “en ny bruger kan lære funktionen på under 10 minutter” kan.',
      concepts: [
        {
          term: 'Hvorfor målbart',
          body: [
            'Slides stiller to krav til ethvert kvalitetskrav: det *must be verifiable (measurable metrics)* og *should be objective (e.g. testable)*. Velkommen-slidet siger det kortere: ikke-funktionelle krav skal være “testbare og målbare — fungerer godt? hvor godt?”.',
            'Begrundelsen er accepttesten. Hvert krav skal kunne afgøres OK eller FAIL af en person, der ikke skrev det. Er kravet vagt, bliver accepttesten en diskussion i stedet for en måling.',
          ],
        },
        {
          term: 'Fra vagt til målbart',
          body: [
            'Et målbart krav har tre dele: **hvad der måles**, en **grænseværdi** og de **betingelser**, målingen gælder under (opdelingen er guidens). Slidets performance-eksempel har alle tre: “95 % of the transactions shall be processed in less than 1 second at 80 % load” — andel, grænse og belastning.',
            'Under *Usability* står “The system should be easy to use” — det er ikke målbart. Slidets målbare alternativer er det maksimale antal brugerfejl for en bestemt opgave over en periode, og tiden det tager at lære en funktion (fx inden for 10 minutter).',
          ],
        },
        {
          term: 'Treasure Robot som mønster',
          body: [
            'Slide 22 viser ikke-funktionelle krav fra et 3.-semesterprojekt: kravene er nummereret (1.1, 1.2 …), grupperet efter systemdel (batteri, robot, metaldetektor, forhindringssensor, GPS), og modalverbet bærer MoSCoW-prioriteten (*must*/*should*).',
            'Hvert krav er målbart: batteritid mindst 20 min i drift og 1 time i tomgang; maks. 40 × 25 × 15 cm; GPS-position gemt hvert 5. sek. ± ½ sek.; metal detekteret i mindst 5 cm dybde på jord eller græs, men kun 3 cm på grus; GPS-nøjagtighed 3 m på en klar dag og 5 m på en overskyet. Bemærk, hvordan betingelsen (underlag, vejr) gør samme krav til to krav.',
          ],
        },
        {
          term: 'Reliability: MTBF, MTTR og availability',
          body: [
            '**MTBF** (Mean Time Between Failure) = samlet oppetid / antal nedbrud. **MTTR** (Mean Time To Restore) = samlet nedetid / antal nedbrud. **Availability** = MTBF / (MTBF + MTTR) = oppetid / (oppetid + nedetid).',
            'Slidets pumpe fejler fire gange på en arbejdsdag, og hver reparation tager en time: MTTR = 60 min / 4 = 15 min. Kravet formuleres så som “System should be able to repair within 15 minutes”. Øvelse 3 (BeoSound F) og Pakkeboks-øvelsen beder eksplicit om et reliability-krav med MTBF.',
          ],
        },
        {
          term: 'Usability, performance og supportability',
          body: [
            '**Usability**: operability, accessibility, brugergrænseflade, dokumentation — målt som fejl pr. opgave eller indlæringstid. **Performance**: throughput, svartid, opstartstid, kapacitet — målt i tid (“specifics is out of scope for this course”). **Supportability**: kompatibilitet, installerbarhed, lokaliserbarhed, vedligeholdbarhed — målt som succes under specificerede scenarier.',
            '**+** dækker begrænsninger: legal (fx databeskyttelse), miljø (RoHS, WEEE, EMC), test (betingelser, miljø, adgang), reuse (eksisterende systemer og moduler) og teknologiske trade-offs. Larman tilføjer, at kvalitetskrav kan stå som *Special Requirements* i en use case eller samles i en *Supplementary Specification*, og at de former arkitekturen — se [[arkitektur|arkitektur]] og [[swd/arkitekturproces|arkitektur som proces]] i SWD.',
          ],
        },
        {
          term: 'Relation til accepttesten',
          body: [
            'TTT-eksemplets accepttest har et afsnit for ikke-funktionelle krav med kolonnerne *Krav*, *Test/udførelse*, *Faktisk observation* og *Vurdering*. Først listes måleudstyret: stopur, målebånd/lineal og skydelære, køkkenvægt og badevægt. Kravet “Reaktionstiden mellem hvert vindue skal være under 1 sekund” testes ved at starte stopuret ved tryk og stoppe det, når næste vindue vises; resultatet 0,1 s giver OK.',
            'Tolerancer skrives ind i kravet: “Spillepladens dimensioner skal være 170 × 170 × 40 (± 10)” blev målt til 170 × 170 × 30 og vurderet OK. SPU-vejledningen kalder dette *kvalitetsfaktortests*: stress-, volumen-, bruger-, sikkerheds-, ydeevne-, lager-, konfigurations-, kompatibilitets-, pålideligheds- (fx 48 timers drift uden fejl) og fejlbehandlingstest. Se [[accepttest|accepttestspecifikationen]].',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'Tillægsord uden tal (“hurtig”, “brugervenlig”, “robust”); en grænse uden betingelse (under hvilken belastning? på hvilket underlag?); krav, der beskriver en løsning i stedet for en egenskab; og krav, som gruppen ikke har udstyr eller tid til at måle. Spørg ved hvert krav: *hvordan tester vi det, og med hvad?* Kan I ikke svare, er kravet ikke færdigt.',
          ],
        },
      ],
      viz: 'nfr-maalbart',
      keyPoints: [
        'Kvalitetskrav skal være verificerbare (målbare) og objektive (testbare).',
        'Målbart krav = hvad måles + grænseværdi + betingelser.',
        'MTBF = oppetid / nedbrud; MTTR = nedetid / nedbrud; availability = MTBF / (MTBF + MTTR).',
        'Skriv tolerancen ind i kravet (± 10 mm, ± ½ s).',
        'Hvert ikke-funktionelt krav får en test med målemetode og udstyr.',
        'Kvalitetskrav former arkitekturen.',
      ],
      exam: [
        '“Hvordan ved I, at systemet er brugervenligt?” — Vi skrev ikke “brugervenligt”, men et målbart krav som indlæringstid eller fejl pr. opgave, og accepttesten måler det.',
        '“Hvorfor er dette krav testbart?” — Det har en grænseværdi, en betingelse og en målemetode; i accepttesten står hvilket udstyr vi måler med, og hvad vi målte.',
        '“Hvad er forskellen på MTBF og MTTR?” — MTBF er gennemsnitlig oppetid mellem fejl, MTTR gennemsnitlig tid til at genoprette. Tilsammen giver de availability som MTBF delt med MTBF plus MTTR.',
        '“Hvilke af jeres kvalitetskrav påvirkede arkitekturen?” — Nævn et konkret krav, fx en svartid eller en dimension, og det designvalg, det tvang.',
      ],
      sources: [
        { path: k('01-kravspecifikation/system-specification.md'), original: 'System Specification.pdf', pages: 'slide 19–32' },
        { path: k('bog/01-larman-ch5-requirements.md'), original: 'ISE Book: 01_Larman_Ch5_Requirements.tex', pages: 's. 56–57' },
        { path: k('bog/02-larman-ch6-use-cases.md'), original: 'ISE Book: 02_Larman_Ch6_UseCases.tex', pages: 's. 76–77', note: 'Special Requirements og Supplementary Specification' },
        { path: k('03-systemtest/eksempel-accepttestspecifikation-ttt.md'), original: 'TTT_Accepttestspecifikation.pdf', pages: 's. 10–12' },
        { path: k('bog/04-spu-vejledning-softwaretest.md'), original: 'ISE Book: 04_Vejledning_softwaretest.tex', pages: 's. 187–189' },
        { path: k('00-kursus/velkommen-til-swise.md'), original: 'Velkommen til SWISE.pptx', pages: 'slide 42' },
      ],
      gaps: [
        'Slide 27’s MTBF-eksempel regner ikke efter sin egen formel: 40 timers planlagt drift, 28 timers nedetid og 5 fejl skulle med “uptime / # of breakdowns” give 14 / 5 = 2,8, da sliden selv siger, at systemet kun var tilgængeligt i 14 timer (40 − 28 er i øvrigt 12). Sliden regner i stedet 40 − 28/5 = 34,4 og får availability 86 %. Brug formlen, ikke tallene.',
        'Slide 24 lister “The system should be easy to use” under *Metrics*, selvom det netop ikke er målbart. Guiden læser det som eksemplet på et krav, der skal skærpes.',
        'Larman placerer *availability* og *accuracy* under Performance; slides placerer availability under Reliability. Materialet vælger ikke.',
        'I TTT-eksemplet testes touchskærmens opløsning ved at læse koden, ikke ved at observere systemet. Materialet diskuterer ikke, om det er en gyldig accepttest.',
        'Performance-slidet siger selv, at “specifics is out of scope for this course”. Hvordan belastning og svartider måles i praksis, står ikke i materialet.',
      ],
      keywords: ['ikke-funktionelle krav', 'NFR', 'non-functional', 'kvalitetskrav', 'quality attributes', 'målbart', 'testbart', 'verifiable', 'MTBF', 'MTTR', 'availability', 'usability', 'reliability', 'performance', 'supportability', 'tolerance', 'Treasure Robot', 'Supplementary Specification'],
    },

    {
      slug: 'use-case-diagram',
      title: 'Aktører, systemgrænse og use case-diagram',
      short: 'Use case-diagram',
      week: 'Iteration 1',
      definition:
        'Et **use case-diagram** viser systemgrænsen som et rektangel, **aktørerne** udenfor og systemets **use cases** som ellipser indenfor, forbundet med streger uden pile. Det er en grafisk indholdsfortegnelse over use cases — selve kravene står i teksten.',
      concepts: [
        {
          term: 'Aktør = rolle',
          body: [
            'En aktør er noget uden for systemet, der interagerer med det: en **person** (i en rolle — den samme person kan spille flere roller), et **andet system** eller en **hardwareenhed**. Den tegnes som en tændstikmand eller som en kasse med «actor». Ordet er en oversættelse fra svensk; “rolle” er mere præcis.',
            'To regler fra slides: er enheden en del af jeres system, er den **ikke** en aktør. Og penge er ikke en aktør — de har ingen interesse i scenariet, de er et middel til at gennemføre det.',
          ],
        },
        {
          term: 'Primær, sekundær og offstage',
          body: [
            'En **primær aktør** har mål, som systemet opfylder; der er altid mindst én. En **sekundær aktør** (supporting) leverer en service til systemet, fx en database eller en betalingsservice. En **offstage-aktør** har interesse i adfærden, men hverken starter eller hjælper — fx en skattemyndighed. Kurset fokuserer på primær og sekundær.',
            'Larman giver begrundelsen for at skelne: primære aktører finder brugermålene, sekundære afklarer eksterne grænseflader og protokoller, og offstage-aktører sikrer at alle interesser er dækket. Slidets lægekonsultation viser, at samme aktør kan være primær i én use case og sekundær i en anden.',
          ],
        },
        {
          term: 'Systemgrænsen og aktørkontekstdiagrammet',
          body: [
            'Systemgrænsen afgør, hvad der er aktør. Larmans første trin er at vælge den; er den uklar, så definér den ved det, der ligger *udenfor*. Hans kasseeksempel: med kassesystemet som grænse er kassedamen primær aktør; med hele butikken som grænse er kunden det.',
            'Et **aktørkontekstdiagram** er grænsen og aktørerne uden use cases — første opgave i Pakkeboks-øvelsen. Hver aktør får en **aktørbeskrivelse** med navn, andre referencer, type (primær/sekundær) og en kort beskrivelse af rollen og hvad den vil.',
          ],
        },
        {
          term: 'Find use cases ud fra mål',
          body: [
            'Cockburns guideline på slides: navngiv systemet, brainstorm de primære aktører, brainstorm *alle* deres mål, og vælg så én use case at udfolde. Larman foreslår en **actor-goal list** før diagrammet og hjælpespørgsmål som: hvem starter og stopper systemet, hvem administrerer brugere, er *tid* en aktør, hvem får besked ved fejl?',
            'En use case navngives efter målet og starter med et verbum (“Rent Items”, ikke “Item Rental”). Larmans tre tests fanger forkerte niveauer: **Boss-testen** (“Hvad har du lavet i dag?” — “Logget ind.”), **EBP-testen** (én person, ét sted, én session, målbar værdi) og **størrelsestesten** (et enkelt trin som “Enter an Item ID” er ingen use case). CRUD-mål samles i én “Manage X”.',
          ],
        },
        {
          term: 'Notation og regler',
          body: [
            'Brug **almindelige streger uden pile** mellem aktør og use case (slide 30). Diagrammet må kun indeholde use cases, der faktisk findes og er beskrevet, og flere use cases må ikke slås sammen til én. Larman: primære aktører til venstre, sekundære til højre, computersystemer som «actor»-kasse, og kun use cases på brugermål-niveau.',
            'Slides skelner også mellem *actor initiated* og *system initiated* use cases — pacemakerens “Pace the Heart” starter systemet selv.',
          ],
        },
        {
          term: 'Include, extend og generalisering',
          body: [
            'Slides viser dem som “extra topic” og siger to gange “Keep it simple”. **«include»** trækker fælles funktionalitet ud i sin egen use case for at undgå gentagelse (to rumfartøjs-use cases inkluderer begge “Adjust Spacecraft Altitude”). **«extend»** beskriver valgfrie udvidelser eller undtagelser med en betingelse og et extension point (“Get On-Line Help” udvider “Perform ATM Transaction”). **Generalisering** laver specialiseringer (“Withdraw from Checking/Savings”).',
            'Larman er endnu mere kontant: use case-arbejde er at skrive tekst; en novice kendes på, at han bruger timer på diagrammer og relationer. Brug relationerne kun, når de gør diagrammet lettere at læse.',
          ],
        },
        {
          term: 'Som rapportfigur',
          body: [
            'ISE-materialet kræver kun korrekt notation. Sem4-reglerne er strengere for figurer i en aflevering: tegn diagrammet i draw.io med **legend**, navngiv filen `UC_<system>`, og skriv en caption, der siger, hvad læseren skal lægge mærke til — fx hvilke aktører der er sekundære, og hvorfor en enhed ligger inden for grænsen. Et mermaid-udkast fra en plan må ikke kopieres ind.',
          ],
        },
      ],
      viz: 'uc-diagram-opbygning',
      keyPoints: [
        'Aktør = rolle uden for systemet: person, andet system eller HW-enhed.',
        'En del af systemet er ikke en aktør; penge er aldrig en aktør.',
        'Primær aktør har målet; sekundær leverer en service; offstage har kun interesse.',
        'Systemgrænsen afgør, hvem der er aktør.',
        'Streger uden pile. Kun use cases, der findes. Én ellipse = én use case.',
        'Include/extend er ekstra — hold diagrammet simpelt; teksten er kravet.',
      ],
      exam: [
        '“Hvorfor er X en aktør og ikke en del af systemet?” — Fordi vi har lagt systemgrænsen der: X er udenfor, vi udvikler den ikke, og vores system bruger den som service, så den er sekundær aktør.',
        '“Hvem er primær aktør i denne use case?” — Den, hvis mål use casen opfylder. Samme person kan være primær i én use case og optræde i en anden rolle i en anden.',
        '“Hvorfor har jeres streger ingen pile?” — Kursets notation bruger almindelige associationer; retningen står i use case-teksten.',
        '“Hvorfor er ‘Log ind’ ikke en use case hos jer?” — Den fejler Boss- og EBP-testen: den giver ingen målbar værdi alene, så den er et trin eller en prækondition i de use cases, der kræver den.',
      ],
      sources: [
        { path: k('02-use-cases/use-cases-funktionelle-krav.md'), original: 'L3_Specification_FunctionalKrav_UC (Updated).pdf', pages: 'slide 3–30, 42–55' },
        { path: k('bog/02-larman-ch6-use-cases.md'), original: 'ISE Book: 02_Larman_Ch6_UseCases.tex', pages: 's. 63–65, 82–91' },
        { path: k('02-use-cases/bilvaskehal-case.md'), original: 'Bilvaskehal.pdf', pages: 's. 1–2', note: 'Øvelse: SysML use case-diagram for bilvaskehallen' },
        { path: k('00-kursus/afleveringsopgave-a-pakkeboksen.md'), original: 'Obligatorisk Afleveringsopgave A - Pakkeboksen.pdf', pages: 's. 2', note: 'Opgave 1–2: aktør-kontekstdiagram og use case-diagram' },
        { path: '.agents/skills/studie-figurer/SKILL.md', note: 'Sem4-regler: draw.io, legend, filpræfiks UC_, captions' },
      ],
      gaps: [
        'Parkeringsautomatens diagram (slide 25) har ingen systemnavn på grænsen, og *Maintenance* står til højre sammen med de sekundære aktører, selvom den selv starter “Tømning af mønter” og “Skiftning af bon-papir”. Larmans regel om primære aktører til venstre følges altså ikke; sliden forklarer ikke hvorfor.',
        'Bilvaskehal-øvelsen beder om et *SysML* use case-diagram, men slides viser UML-diagrammer og forklarer ikke forskellen. Løsningsforslag til bilvaskehallen og til Pakkeboks-øvelsen findes ikke i materialet.',
        'Larman regner systemet under udvikling (SuD) som en aktør, når det kalder andre systemer; slides siger, at en aktør er ekstern. Det har ingen betydning for diagrammet, men for use case-teksten.',
        'Slide 4 noterer, at kurset holder sig på “2. semester-niveau” (kun direkte interaktion), og include/extend/generalisering er “extra”. Hvornår et projekt bør bruge dem, siger materialet ikke.',
      ],
      keywords: ['use case diagram', 'use case-diagram', 'UC', 'aktør', 'actor', 'primær aktør', 'sekundær aktør', 'supporting actor', 'offstage', 'system boundary', 'systemgrænse', 'aktørkontekstdiagram', 'actor-context', 'aktørbeskrivelse', 'include', 'extend', 'generalization', 'Boss test', 'EBP', 'actor-goal list'],
    },

    {
      slug: 'fully-dressed-uc',
      title: 'Fully dressed use case',
      short: 'Fully dressed UC',
      week: 'Iteration 1 og frem',
      definition:
        'En **fully dressed use case** er den detaljerede, skabelonbaserede beskrivelse af én use case: mål, aktører, prækondition og postkondition, et nummereret **hovedscenarie** (happy path) og alle **udvidelser** (alternative forløb og undtagelser). Det er her, de funktionelle krav faktisk står.',
      concepts: [
        {
          term: 'Brief, casual og fully dressed',
          body: [
            '**Brief**: 1–6 sætninger om hovedscenariet — Larmans “Process Sale” er eksemplet. Tager få minutter og bruges til at estimere og få overblik. **Casual**: flere afsnit, der dækker flere scenarier (Larmans “Handle Returns”). **Fully dressed**: alle trin og variationer i nummereret form efter en skabelon.',
            'Larman skriver ikke alle use cases fully dressed fra start: i den første workshop får måske 10–20 % det fulde format — de arkitektonisk vigtigste og mest risikable — resten er brief og udfoldes i senere iterationer.',
          ],
        },
        {
          term: 'Skabelonen felt for felt',
          body: [
            '**Navn** (starter med et verbum) · **Mål** (hvad opnås) · **Initiering** (hvilken aktør eller om systemet selv starter) · **Aktører** (med type: primær/sekundær) · **Antal samtidige forekomster** (1, 2, 10, ingen) · **Prækondition** (hvad skal være sandt ved start) · **Postkondition** (hvad er sandt bagefter) · **Hovedscenarie** · **Udvidelser/undtagelser** · **Datavariationsliste** (tekniske variationer, fx dataformater). Slide-udgaven har også **References** til andre use cases.',
            'Larmans pointe om pre- og postkonditioner: skriv kun dem, der er ikke-oplagte og værd at fortælle. “Systemet har strøm” er støj. Prækonditionen testes ikke i use casen — den antages. Postkonditionen er den garanti, som alle stakeholders skal være tilfredse med.',
          ],
        },
        {
          term: 'Hovedscenariet',
          body: [
            'Den typiske, betingelsesløse vej til succes (sunshine/happy path). Larman: udskyd alle betingelser og forgreninger til udvidelserne. Et trin er enten en interaktion mellem aktører, en validering (typisk af systemet) eller en tilstandsændring; trin 1 er ofte den hændelse, der starter scenariet.',
            'Skriv i nutid og aktiv form med aktøren som subjekt (“Kunden indsætter …”, ikke “… indsættes af kunden”). Skriv kort (“System validerer …”). Skriv **essential**: intentioner og ansvar, ikke knapper og dialogbokse. Og skriv **black box**: “The system records the sale”, ikke “writes the sale to a database”.',
          ],
        },
        {
          term: 'Udvidelser',
          body: [
            'Udvidelserne er ofte størstedelen af teksten. Hver har en **betingelse** og en **håndtering**. Larman nummererer efter det trin, de udspringer af (3a, 3b; `*a` for “når som helst”), skriver betingelsen som noget systemet eller en aktør **kan detektere** (“System detects failure to communicate …”), og lader forløbet flette tilbage i hovedscenariet, medmindre udvidelsen siger andet.',
            'Kursets egne eksempler markerer udvidelsen i hovedscenariet: “Sæt alarm” har `[Extension 1a: Ingen tidligere alarm]` under trin 2, og “Åbn Pengeskab” har `[Ext. 1: Fingeraftryk ej genkendt]` med trinene E1.1–E1.2. Hver udvidelse bliver senere sin egen [[accepttest|accepttestcase]].',
          ],
        },
        {
          term: 'Larmans skabelon og kursets',
          body: [
            'Larman bruger Cockburns skabelon med felter, kursets skabelon ikke har: *Scope*, *Level* (user-goal eller subfunction), *Stakeholders and Interests*, *Special Requirements* (ikke-funktionelle krav knyttet til use casen), *Frequency of Occurrence* og *Miscellaneous*. Hans vigtigste er stakeholder-listen: den afgrænser, hvad use casen skal indeholde — alt det, der tilfredsstiller stakeholdernes interesser.',
            'Kursets skabelon har til gengæld *Initiering* og *Antal samtidige forekomster*, som passer til indlejrede systemer. Brug kursets skabelon i projektet, og tilføj evt. stakeholders og special requirements, hvis det hjælper.',
          ],
        },
        {
          term: 'Fra use case til resten af projektet',
          body: [
            'Use case-teksten føder næsten alt senere: navneord bliver kandidater til [[domaenemodel|domænemodellen]], systemhændelser bliver til [[sekvensdiagram|sekvensdiagrammer]], og hver scenarievej bliver en accepttest. Larman kalder det *use-case driven development*: iterationer planlægges efter use cases, og designet realiserer dem.',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'GUI-detaljer i trinene (“trykker på OK i dialogboksen”); systemets perspektiv i stedet for aktørens; passiv form; betingelser i hovedscenariet; en use case, der kun er ét trin (størrelsestesten); trivielle prækonditioner; og udvidelser, der mangler — Cockburns trin 6 er at brainstorme udvidelsesbetingelserne “udtømmende”. Pakkeboks-øvelsen beder eksplicit om, at fejl i pakkeboksens egne komponenter holdes ude af use casen; Larman har til gengæld udvidelsen `*b` (“At any time, System fails”) med. Materialet afgør ikke, hvor grænsen går.',
          ],
        },
      ],
      viz: 'fully-dressed-udfyld',
      keyPoints: [
        'Brief (overblik) → casual → fully dressed (detaljer efter skabelon).',
        'Navnet starter med et verbum og er aktørens mål.',
        'Hovedscenariet har ingen forgreninger; alle betingelser står i udvidelserne.',
        'En udvidelse = detekterbar betingelse + håndtering, nummereret efter trinnet.',
        'Essential og black box: intention og ansvar, ingen GUI og intet design.',
        'Pre- og postkonditioner kun, når de siger noget.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Fully dressed use case — kursets skabelon',
          source: '(skabelonen) Fully Dressed Use Case.docx s. 1; feltforklaring fra L3_Specification_FunctionalKrav_UC (Updated).pdf slide 39–40',
          code: `Navn:                          <verbum + mål>
Mål:                           <hvad opnås>
Initiering:                    <aktør eller system>
Aktører:                       <aktør (primær)>, <aktør (sekundær)>
Antal samtidige forekomster:   <1, 2, 10, ingen>
Prækondition:                  <hvad skal være sandt ved start>
Postkondition:                 <hvad er sandt ved afslutning>
Hovedscenarie:                 1. <aktør gør …>
                               2. <system gør …>
                                  [Udvidelse 2a: <betingelse>]
                               …
Udvidelser/undtagelser:        [Udvidelse 2a: <betingelse>]
                               <håndtering>
Datavariationsliste:           <fx dataformater>`,
        },
        {
          lang: 'text',
          title: 'Udfyldt eksempel: Sæt alarm',
          source: 'L3_Specification_FunctionalKrav_UC (Updated).pdf slide 41',
          code: `Navn:                   Sæt alarm
Mål:                    Bruger ønsker at sætte alarmtiden.
Initiering:             Bruger trykker på ALARM knappen
Aktører:                Bruger - primær
Samtidige forekomster:  1
Prækondition:           Uret er tændt og operationel
Postkondition:          Alarmen er sat til den ønskede tid

Hovedscenarie:
  1. Bruger trykker på ALARM
  2. Urets display viser tidligere alarm
     [Extension 1a: Ingen tidligere alarm]
  3. Bruger trykker på henholdsvis HOUR og MIN
  4. Uret optæller time og minut visningen for alarm
  5. Bruger trykker på ALARM for at afslutte indstillingen
  6. Uret skifter tilbage til at vise klokken

Udvidelser/undtagelser:
  [Extension 1a: Ingen tidligere alarm]
  Alarm indstillingen starter ved 00:00.`,
        },
      ],
      exam: [
        '“Hvorfor står der ingen betingelser i jeres hovedscenarie?” — Hovedscenariet er happy path; alle forgreninger står som udvidelser med en betingelse, systemet kan detektere, og en håndtering.',
        '“Hvad er forskellen på en prækondition og et trin?” — Prækonditionen antages sand og testes ikke i use casen; den er typisk resultatet af en anden use case.',
        '“Hvorfor skriver I ‘Bruger identificerer sig’ og ikke ‘indtaster kode i feltet’?” — Essential style: use casen beskriver intentionen, så designet stadig er åbent.',
        '“Hvordan bruger I use casen videre?” — Hver sti, altså hovedscenariet og hver udvidelse, er en accepttestcase, og trinene gav os systemhændelserne til sekvensdiagrammerne.',
      ],
      sources: [
        { path: k('02-use-cases/fully-dressed-use-case-skabelon.md'), original: '(skabelonen) Fully Dressed Use Case.docx', pages: 's. 1' },
        { path: k('02-use-cases/use-cases-funktionelle-krav.md'), original: 'L3_Specification_FunctionalKrav_UC (Updated).pdf', pages: 'slide 31–47' },
        { path: k('bog/02-larman-ch6-use-cases.md'), original: 'ISE Book: 02_Larman_Ch6_UseCases.tex', pages: 's. 66–81, 95–99' },
        { path: k('03-systemtest/oevelse-accepttest.md'), original: 'AcceptTestOvelse.pdf', pages: 's. 2', note: 'Fully dressed “Åbn Pengeskab” med Ext. 1 og Ext. 2' },
        { path: k('02-use-cases/bilvaskehal-case.md'), original: 'Bilvaskehal.pdf', pages: 's. 2', note: 'Opgave B: fully dressed “Vask bil”' },
      ],
      gaps: [
        'Skabelonerne er ikke ens: slide 39 har *References*, som docx-skabelonen mangler; bilvaskehal-øvelsen mangler *Datavariationsliste*; Larman/Cockburn har helt andre felter. Materialet siger ikke, hvilken udgave et projekt skal bruge.',
        'Nummereringen af udvidelser er ikke fastlagt: Larman bruger `3a`/`*a`, slide 41 `[Extension 1a]` (knyttet til trin 2, men nummereret 1a), pengeskabet `[Ext. 1]` med E1.1, og TTT-eksemplet skelner mellem EXT (extension) og EXC (exception) uden at forklare forskellen.',
        'Slides indeholder kun ét udfyldt fully dressed-eksempel (“Sæt alarm”, 6 trin). Larmans størrelsestest siger, at en fully dressed use case typisk er 3–10 sider. Kursets eksempler er altså langt mindre end bogens.',
        '*Casual* nævnes kun i parentes på slide 34; eksemplet findes kun hos Larman.',
      ],
      keywords: ['fully dressed', 'use case', 'brief', 'casual', 'hovedscenarie', 'main success scenario', 'happy path', 'sunshine scenario', 'udvidelser', 'extensions', 'alternate flow', 'undtagelse', 'prækondition', 'postkondition', 'precondition', 'success guarantee', 'Cockburn', 'essential style', 'black-box', 'Sæt alarm', 'datavariationsliste'],
    },

    {
      slug: 'accepttest',
      title: 'Accepttestspecifikation og traceability',
      short: 'Accepttest',
      week: 'Iteration 1 og afslutning',
      definition:
        '**Accepttesten** viser, at systemet opfylder kravspecifikationen. **Accepttestspecifikationen** skrives sammen med kravene: én testcase for hver vej gennem hver use case (hovedscenariet og hver udvidelse) og en test af hvert ikke-funktionelt krav. En **traceability-matrix** viser, at alle krav er dækket af mindst én test.',
      intro: [
        'Accepttesten er V-modellens øverste niveau: kravanalysen på venstre ben svarer til accepttesten på højre. Den *specificeres* i kravfasen, men *køres* først til sidst — og når den køres, udfyldes kolonnerne *Faktisk observation* og *Vurdering* i det samme dokument.',
      ],
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'I ECE-modellen giver fasen *Specifikation* både kravspecifikation og accepttestspecifikation, og sidste fase er *Accepttest* med artefaktet “gennemført accepttest”. SPU-vejledningen er mere præcis: accepttesten **specificeres** i kravfasen, **designes** i programdesignfasen og **implementeres, køres og evalueres** til sidst.',
            'At skrive testen tidligt har en gevinst i sig selv: uklarheder og krav, der ikke kan testes, opdages, mens de endnu er billige at rette. Slide 7’s regel gælder også her: *definér forventet resultat, før testen køres*.',
          ],
        },
        {
          term: 'Én testcase pr. vej gennem use casen',
          body: [
            'Slide 28: accepttesten udfører use casen. Scenariets trin bliver testens trin, og testen kan gentages, fordi input, output og forløb er fastlagt på forhånd. Tjek at prækonditionerne er gyldige, og at postkonditionerne holder. En use case kan have flere veje — **for hver vej skal der være et testscenarie**.',
            'TTT-eksemplet gør præcis det: “Spil Finite Mode” har en tabel for hovedscenariet og én for hver EXT og EXC, i alt 14 tabeller for tre use cases. Pakkeboks-øvelsen beder om to: hovedscenariet og udvidelsen, hvor kunden trykker afbryd.',
          ],
        },
        {
          term: 'Skabelonen',
          body: [
            'Hovedet: **Use case under test**, **Scenarie**, **Prækondition**. Tabellen: **Step**, **Handling**, **Forventet observation/resultat**, **Faktisk observation/resultat**, **Vurdering (OK/FAIL)**. Prækonditionen er mere konkret end use casens: TTT skriver “Mode er valgt til Finite Mode, Hard Mode samt I’ll go first”, så testen kan gentages.',
            'Slide 30 giver tre valideringsregler til at tjekke specifikationen: beskriver *Handling* input og aktioner? Beskriver *Forventet* observationer (output)? Dækker trinene use casens trin?',
          ],
        },
        {
          term: 'Ikke-funktionelle krav',
          body: [
            'Ikke-funktionelle krav testes i en separat tabel: *Krav*, *Test/udførelse*, *Faktisk observation*, *Vurdering*. TTT lister måleudstyret først og beskriver målemetoden i hver række (“start stopuret ved tryk på GUI, stop ved visning af næste vindue”). SPU kalder det kvalitetsfaktortests — stress, volumen, brugervenlighed, sikkerhed, ydeevne, pålidelighed (fx 48 timers drift uden fejl) og fejlbehandling. Se [[ikke-funktionelle-krav|målbare ikke-funktionelle krav]].',
          ],
        },
        {
          term: 'Traceability',
          body: [
            'Et godt krav er **traceable**. Slide 40’s *Requirements Traceability Matrix* har testcases som rækker og krav som kolonner med et X, hvor en test dækker et krav. Den svarer på to spørgsmål: er hvert krav dækket af mindst én test, og hører hver test til et krav?',
            'SPU siger det samme om testemner: hvert emne nummereres og skal kunne spores tilbage til ét afsnit i kravspecifikationen. I praksis betyder det id’er hele vejen — i TTT-eksemplet hedder testen for UC2’s første extension afsnit 2.1, så sporet kan læses direkte af nummeret. Kæden fortsætter i [[rygrad|projektets rygrad]] gennem design, kode og [[integration-systemtest|integrations- og systemtest]].',
          ],
        },
        {
          term: 'Validering, kunden og godkendelse',
          body: [
            'Accepttesten er **validering** — “build the right thing” — og udføres sammen med kunden, der skriver under. Verifikation (“build the thing right”) er unit- og integrationstest. SPU’s figur 7 kalder kravspecifikation plus accepttest *aftalegrundlaget* mellem kunde og projektgruppe: selv uden kunde bør gruppen skrive testen, så den kan bruges til at afgøre, om produktet er klar.',
            'SPU kræver et **objektivt godkendelseskriterium** (“testspecifikationen er kørt igennem fejlfrit”), så afleveringen ikke bestemmes af, at datoen er nået. Vasa-casen er det modsatte: en fejlet test, og skibet blev søsat alligevel.',
          ],
        },
        {
          term: 'Testdata og typiske fejl',
          body: [
            'Testdata vælges med ækvivalensklasser og grænseværdier (slide 8–9; SPU s. 195–197) — se [[swt/ep-bva|ækvivalensklasser og grænseværdianalyse]] og [[swt/black-white-box|black box- og white box-test]] i SWT. Accepttesten er black box: den tester kun gennem systemets grænseflader.',
            'Typiske fejl: *Forventet* beskriver en handling i stedet for en observation; udvidelser uden testcase; forventede resultater som “virker korrekt”; ikke-deterministisk adfærd uden plan (TTT vurderer én række “(OK)” i parentes, fordi robotten vælger tilfældigt i Easy/Medium); og ingen test af de ikke-funktionelle krav. Automatiseret accepttest med eksekverbare specifikationer undervises i [[swt/systemtest|system- og accepttest]] og [[swt/gherkin|Gherkin]].',
          ],
        },
      ],
      viz: 'uc-til-test',
      keyPoints: [
        'Accepttesten specificeres sammen med kravene og køres til sidst.',
        'Én testcase pr. vej: hovedscenariet og hver udvidelse.',
        'Hoved: use case, scenarie, prækondition. Tabel: handling, forventet, faktisk, OK/FAIL.',
        'Forventet resultat defineres, før testen køres.',
        'Ikke-funktionelle krav får egne tests med målemetode og udstyr.',
        'Traceability-matrix: hvert krav ≥ én test, hver test → et krav.',
      ],
      exam: [
        '“Hvordan sporer I krav 7 til en test?” — Kravet har et id; i traceability-matrixen står de testcases, der dækker det, og hver testcase angiver use case og scenarie i hovedet.',
        '“Hvorfor har denne use case tre testcases?” — Én for hovedscenariet og én for hver udvidelse; hver vej gennem use casen skal testes.',
        '“Hvad er forskellen på accepttest og integrationstest?” — Accepttesten validerer systemet mod kravspecifikationen gennem dets ydre grænseflader; integrationstest verificerer samspillet mellem allerede testede enheder.',
        '“Hvordan testede I jeres ikke-funktionelle krav?” — Med en målemetode og udstyr pr. krav; vi noterede den faktiske måling mod kravets tolerance.',
        '“Hvad gjorde I med de tests, der fejlede?” — De står med FAIL og en kommentar; fejlen er registreret og testen kørt igen efter rettelsen.',
      ],
      sources: [
        { path: k('03-systemtest/system-test.md'), original: 'System Test.pdf', pages: 'slide 7–9, 14–15, 26–30' },
        { path: k('03-systemtest/eksempel-accepttestspecifikation-ttt.md'), original: 'TTT_Accepttestspecifikation.pdf', pages: 's. 3–12' },
        { path: k('03-systemtest/oevelse-accepttest.md'), original: 'AcceptTestOvelse.pdf', pages: 's. 1–2' },
        { path: k('bog/04-spu-vejledning-softwaretest.md'), original: 'ISE Book: 04_Vejledning_softwaretest.tex', pages: 's. 175–176, 187–194, 200–207' },
        { path: k('01-kravspecifikation/system-specification.md'), original: 'System Specification.pdf', pages: 'slide 39–40' },
        { path: k('02-use-cases/use-cases-funktionelle-krav.md'), original: 'L3_Specification_FunctionalKrav_UC (Updated).pdf', pages: 'slide 41', note: 'Use case-diagram og “Sæt alarm”, som figuren bygger på' },
        { path: k('00-kursus/afleveringsopgave-a-pakkeboksen.md'), original: 'Obligatorisk Afleveringsopgave A - Pakkeboksen.pdf', pages: 's. 3' },
      ],
      gaps: [
        'Løsningsforslaget til accepttest-øvelsen (`AcceptTestOvelseLosning.pdf`) er nævnt på Brightspace, men findes ikke i materialet. Testcasen i figuren for “Sæt alarm” er guidens egen udledning af use casen på slide 41.',
        'TTT-eksemplets kravspecifikation er ikke med, så man kan ikke se, hvordan testtabellerne sporer til use case-teksten. Præmisserne nævner testtilstande (“Finite Test”, “Test Infinity Mode”), som eksemplet ikke forklarer.',
        'Traceability-matrixen på slide 40 er et abstrakt eksempel (REQ 1–5 × testcases 1.1–3.1). Materialet viser ingen matrix fra et projekt, og TTT-eksemplet har ingen.',
        'Slide 15 (2024-udgaven) placerer systemtest under både validering og verifikation; 2016-udgaven havde kun unit- og integrationstest under verifikation.',
        'Slides giver ingen skabelon for test af ikke-funktionelle krav; den eneste model er TTT-eksemplets afsnit 4.',
      ],
      keywords: ['accepttest', 'acceptance test', 'accepttestspecifikation', 'testcase', 'testspecifikation', 'traceability', 'sporbarhed', 'traceability matrix', 'V-model', 'validering', 'validation', 'verifikation', 'forventet resultat', 'OK/FAIL', 'TTT', 'Tic Tac Toeminator', 'pengeskab', 'testemner', 'godkendelseskriterium'],
    },
  ],
}
