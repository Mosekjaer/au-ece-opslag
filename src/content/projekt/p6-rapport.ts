import type { Part } from '../types'
import { k } from './paths'

/* Del 6: rapporten og den mundtlige projekteksamen.
   Kilder: 13-rapport (AU ECE-skabelonen, God rapportskrivning, L27, lean dokumentation,
   Overleaf), 00-kursus (katalog + introduktion) og sem4’s egne figurregler. */

const SKABELON = 'report_template.pdf'
const GOD = 'God_rapportskrivning.pdf'
const L27 = 'L27_Projektrapport.pdf'

export const rapport: Part = {
  id: 'rapport',
  title: 'Rapport og eksamen',
  topics: [
    {
      slug: 'rapportstruktur',
      title: 'Rapportens opbygning efter AU ECE-skabelonen',
      short: 'Rapportstruktur',
      week: 'Hele forløbet og afslutning',
      definition:
        'Projektrapporten er et **selvstændigt dokument** på højst **72.000 tegn** (30 normalsider), der svarer på tre spørgsmål: hvad er problemet, hvordan er det løst, og hvilke resultater er opnået. AU ECE-skabelonen bygger den som en variant af **IMRAD** lagt ned over **V-modellen**: venstre ben (indledning, metode, krav, arkitektur, design) konstruerer, højre ben (test, diskussion, konklusion) evaluerer.',
      intro: [
        'Rapporten er det, censor læser. Censor har ca. 6 timer pr. projekt inklusive eksamen, så der er ikke tid til at nærlæse bilag. Derfor er rådet i *God rapportskrivning*: begynd med rapporten og finpolér den; begynder man med bilagene og plukker ind bagefter, bliver resultatet sjældent sammenhængende. Hvad der hører i rapporten, og hvad der hører i bilag, står under [[proces-produktrapport|procesrapport vs. produktrapport]]; figurerne under [[figurer-captions|figurer og captions]].',
      ],
      concepts: [
        {
          term: 'Skabelonen: V-modellen med akademiske kanter',
          body: [
            'Skabelonens læsevejledning (Figur 1) parrer kapitlerne på tværs af V’et: **Introduction → Conclusion** (besvar projektspørgsmålene), **Process and Methods → Discussion** (evaluér proces og metode), **User Requirements → User Acceptance Testing** (validér brugerkrav), **System Design → System Integration Testing** (verificér arkitektur og interne interfaces) og **Unit Design → Unit Test** (verificér designenhederne).',
            'Kapitlerne er: 1 Introduktion (baggrund, eksisterende arbejde, systemskitse, problemformulering), 2 Udviklingsproces og metode (inkl. risikohåndtering og brug af AI), 3 Brugerkrav, 4 Systemarkitektur, 5 Design og implementering (ét afsnit pr. delsystem med egne tests og delkonklusion), 6 Integrationstest, 7 Brugeraccepttest, 8 Diskussion, 9 Konklusion med fremtidigt arbejde, bibliografi og appendiks.',
          ],
        },
        {
          term: 'Skriv hvert afsnit fra dets sted i projektet',
          body: [
            'Skabelonens vigtigste skriveregel: skriv hvert afsnit, *som stod du på netop det sted i projektet*. Indledning og metode beskriver hvad I **agter** at gøre og hvordan; krav beskriver hvilke krav I vil opfylde; testafsnittene kigger tilbage på resultaterne. Skriv derfor ikke “vi brugte Scrum …” i metodeafsnittet — det skuer tilbage. Hvordan det gik med Scrum, hører i diskussionen.',
            'Det giver en lidt plandrevet fortælling, også når I har arbejdet iterativt. Det er meningen: I præsenterer det **endelige** resultat og diskuterer evt. sprint-for-sprint-forløbet i diskussionen. *God rapportskrivning* siger det samme med to nøgleord: **ikke kronologisk** og **rød tråd**.',
          ],
        },
        {
          term: 'Sidebudget og hårde krav',
          body: [
            'Max 72.000 tegn inkl. mellemrum, talt fra indledning til og med konklusion. Forside, abstract, indholdsfortegnelse, referenceliste, bilagsfortegnelse, tegn i figurer og tabeller samt bilag tæller ikke. *God rapportskrivning* tilføjer: figurer tæller ikke tegn — “jo flere, jo bedre”.',
            'Sidebudgettet (skabelonens Tabel 10.1): introduktion 2–4, proces og metode 1–2, brugerkrav 4–6, arkitektur 3–4, design og implementering 6–10, integrationstest 1–2, accepttest 1–4, diskussion 1–2, konklusion 1–2 — i alt 30 sider. Brug af AI beskrives i kap. 2.4 med de fire metrikker fra *Framework for AI Fluency* (delegation, description, discernment, diligence), og AU’s AI-deklaration **skal** afleveres som bilag, hvis AI er brugt.',
          ],
        },
        {
          term: 'Hvad hvert kapitel skal kunne',
          body: [
            '**Introduktion** begynder med motivation (hvor mange oplever problemet, hvad koster det), gennemgår eksisterende løsninger og munder ud i en problemformulering formuleret som **spørgsmål, der skal besvares i konklusionen**. Systemskitsen er gerne et rigt billede — funktionelt, uden teknologi som Raspberry Pi eller React.',
            '**Brugerkrav** skal kunne læses af en ikke-teknisk domæneekspert, præsentere udvalgte krav og henvise til kravspecifikationen for resten. **Arkitektur** starter med systemets ydre grænser, analyserer arkitekturkritiske risici (fx NF-krav, den domænebaserede arkitektur ikke kan opfylde) og præsenterer så den valgte struktur og grænseflader. **Design** er top-down pr. delsystem og må kun kende de andre delsystemer gennem arkitekturens interfaces.',
            '**Diskussion** diskuterer bredere end accepttesten: problemstilling vs. løsning, proces og metode, krav, arkitektur og design. **Konklusion** læses side om side med indledningen og skal besvare samtlige spørgsmål, der blev rejst dér.',
          ],
        },
        {
          term: 'Referencer og litteratursøgning',
          body: [
            'Brug en reference manager (EndNote er gratis for AU-studerende, BibTeX i LaTeX). Der er intet krav til citation style, men vær konsekvente: numeriske referencer ([2]) skal stå i kronologisk rækkefølge; forfatter-år (Jakobsen, 2012) fylder flere tegn, men kræver ikke kronologi. Hold **referenceliste og bilagsliste adskilt** — et interview med en konsulent er et bilag, ikke en reference.',
            'Litteratursøgning starter med en indledende quick-and-dirty-søgning (library.au.dk, Google Scholar), kædesøgning bagud i referencelister og fremad via citerende artikler i Scopus, og reviews til at finde de rigtige keywords. Den systematiske søgning strukturerer spørgsmålet med **PICO** eller **søgetrekanten** (hovedemne, fokuspunkt, afgrænsende begreb), vælger databaser (for ingeniørfag: IEEE Xplore og Engineering Village/Compendex), screener i tre trin (titel, abstract, fuldtekst) og dokumenterer databaser, søgestrenge, datoer, antal hits og eksklusioner i et flowchart. Resultatet hører i indledningens afsnit om **eksisterende arbejde**.',
          ],
        },
        {
          term: 'Lean dokumentation',
          body: [
            'Björkholms tre regler for god dokumentation: den skal være hurtig at skrive og opdatere (forældet information kan være værre end ingen), let give korrekte svar, og ikke erstatte menneskelig dialog. De seks praksisser: kend jeres læsere og deres formål, strukturér som **Google Earth** (oversigt → detaljer → kommentarer i koden, hvert niveau linker til det næste), hold det småt (“as few documents as possible — but not fewer”), gør teksten indbydende, brug visuelle elementer, og gør den nem at vedligeholde.',
            'Overført til rapporten: læseren er censor, som skal finde svaret hurtigt. Oversigten (systemskitse, arkitektur) kommer før detaljerne, og detaljer uden værdi for læseren hører i bilag eller i koden.',
          ],
        },
        {
          term: 'LaTeX og Overleaf',
          body: [
            'AU hoster sin egen Overleaf (AU-login), og den anbefalede skabelon for Softwareteknologi ligger på `gitlab.au.dk/au-ece-prj/student/rapport-eksempel`. PRJ4-introduktionen nævner Overleaf og Word som rapportværktøjer. Skabelonen har lister over figurer, tabeller og kodeudsnit, fem varianter af kodeudsnit og et eksempel på en roteret helsidesfigur til store diagrammer.',
          ],
        },
      ],
      viz: 'rapport-opbygning',
      keyPoints: [
        'Max 72.000 tegn fra indledning til konklusion. Figurer, tabeller, forside, abstract, referencer og bilag tæller ikke.',
        'Skabelonen er IMRAD på V-modellen: hvert konstruerende kapitel har et evaluerende modstykke.',
        'Skriv hvert afsnit fra dets sted i projektet: metode = hensigt, diskussion = tilbageblik.',
        'Ikke kronologisk, men rød tråd. Dokumentér gerne én eller to use cases fra start til slut og læg resten i bilag.',
        'Problemformuleringen er spørgsmål, som konklusionen besvarer ét for ét.',
        'Referencer og bilag i hver sin liste. Én citation style, brugt konsekvent.',
      ],
      code: [
        {
          lang: 'text',
          title: 'AU ECE-skabelonens kapitler (indholdsfortegnelse)',
          source: 'report_template.pdf s. 3–6',
          code: `1  Introduktion        Baggrund · Eksisterende arbejde · Systemskitse · Problemformulering/Hypotese
2  Udviklingsproces    Udviklingsproces · Udviklingsmetoder · Risikohåndtering · Brug af AI
   og metode
3  Brugerkrav          Systemkontekst og aktører · Funktionelle krav · Ikke-funktionelle krav ·
                       Systemets domænemodel
4  Systemarkitektur    Ydre grænser og relationer · Analyse af arkitektur ·
                       Struktur og grænseflader (interaktion, interfaces/protokoller, datamodeller)
5  Design og           Pr. delsystem: struktur · interaktion · SW/HW/database-komponenter ·
   implementering      Tests og resultater · Delkonklusion
6  Integrationstest    Teststrategi · Integrationstest af use case 1 · Diskussion · Delkonklusion
7  Brugeraccepttest    Opstilling · Resultater · Diskussion · Delkonklusion
8  Diskussion          Problemstilling og løsning · Proces og metode · Brugerkrav · Arkitektur · Design
9  Konklusion          Fremtidigt arbejde
   Bibliografi
10 Appendiks           Krav til rapport og bilag · Sidebudget · Relevante sektioner og diagrammer`,
        },
      ],
      exam: [
        '“Hvorfor står der ikke i jeres metodeafsnit, hvordan det gik med Scrum?” — Fordi skabelonen skriver hvert afsnit fra dets sted i projektet. Metoden beskriver vores hensigt; hvordan den holdt, diskuterer vi i kapitel 8.',
        '“Hvor besvarer I problemformuleringen?” — I konklusionen, spørgsmål for spørgsmål. Indledning og konklusion er skrevet til at blive læst side om side.',
        'Rapporten følger V-modellen: brugerkravene valideres af accepttesten, arkitekturen verificeres af integrationstesten, og designet af enhedstestene i hvert delsystemafsnit.',
        'Vi har dokumenteret én use case hele vejen fra krav til accepttest i rapporten, så den røde tråd kan følges; resten ligger i bilag med henvisning.',
        '“Hvor kommer jeres viden om eksisterende løsninger fra?” — Fra en indledende søgning og kædesøgning, dokumenteret med databaser, søgestrenge og datoer, og refereret i én konsekvent citation style.',
      ],
      sources: [
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: SKABELON, pages: 's. 2–14, 22, 27–37' },
        { path: k('13-rapport/god-rapportskrivning.md'), original: GOD, pages: 'slide 2–28, 31–50' },
        { path: k('13-rapport/l27-projektrapport.md'), original: L27, pages: 'slide 2–3, 9–20' },
        { path: k('13-rapport/lean-dokumentation.md'), original: 'LeanDokumentation.pdf', pages: 's. 1–4' },
        { path: k('13-rapport/overleaf-og-latex.md'), note: 'Brightspace-kursusside “Overleaf” (HTML)' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 7, 11' },
      ],
      gaps: [
        'Skabelonen er uenig med sig selv om sidetal. Kapitelteksterne siger brugerkrav 2–4, arkitektur 2–4, design 4–10, accepttest 1–2 og diskussion 1–3 sider; sidebudgettet i Tabel 10.1 siger 4–6, 3–4, 6–10, 1–4 og 1–2 (report_template.pdf s. 11, 15, 22, 29, 31 mod s. 37).',
        'Tre strukturer står side om side: AU ECE-skabelonen (kap. 1–9), L27-slidene fra SW2PRJ2 med separat “Teknisk analyse”- og “Resultater”-kapitel, og Gregersen-strukturen i *God rapportskrivning* (slide 15–16) med bl.a. forord og afgrænsning. L27 og *God rapportskrivning* kalder sig selv kun en guideline; 13-rapport/README anbefaler skabelonen til SW4PRJ4.',
        'Læsevejledning: skabelonen har én (V-modellen), mens *God rapportskrivning* (slide 18) kalder en læsevejledning, der blot gengiver indholdet, “aldeles unødvendig”. Skabelonens læsevejledning forklarer strukturen, så de to kan forenes, men materialet siger det ikke.',
        'Litteratursøgningsslidene er skrevet til sundhedsteknologi (PubMed, Embase, Cochrane, PICO med patienter). Kun IEEE Xplore og Engineering Village/Compendex er ingeniørdatabaser. Videoerne “Litteratursøgning 1–2” og “Gode rapporter” kunne ikke konverteres.',
        'Gregersens “Vejledning til udfærdigelse af projektrapporter” (v1.5), som *God rapportskrivning* henviser til, er ikke en del af materialet.',
      ],
      keywords: ['rapport', 'projektrapport', 'rapportskabelon', 'IMRAD', 'V-model', '72.000 tegn', 'normalside', 'sidebudget', 'problemformulering', 'rød tråd', 'abstract', 'resumé', 'litteratursøgning', 'PICO', 'søgetrekant', 'citation style', 'BibTeX', 'EndNote', 'plagiering', 'LaTeX', 'Overleaf', 'lean documentation', 'Björkholm', 'AI-deklaration', 'AI Fluency'],
    },

    {
      slug: 'figurer-captions',
      title: 'Figurer i rapporten: notation, legend og captions',
      short: 'Figurer og captions',
      week: 'Hele forløbet',
      definition:
        'En rapportfigur er et argument, ikke en illustration: den står i **korrekt notation**, kan læses **uden brødteksten**, og har en **caption under figuren**, der siger hvad den viser og hvad læseren skal lægge mærke til. ISE-materialet giver konventionerne; sem4’s egne figurregler strammer dem op med legend, draw.io og faste filnavne.',
      intro: [
        'Figurer tæller ikke med i de 72.000 tegn, og censor scanner dem. Det gør figuren og dens caption til den del af rapporten, der oftest bliver læst — og den del, der oftest er sjusket. Emnet samler to lag regler: hvad ISE-materialet siger (*God rapportskrivning*, AU ECE-skabelonen, PRJ4-introduktionen), og hvad sem4-repoets egne regler kræver oven i (`studie-figurer` og `sem4/CLAUDE.md`). Hvor de er uenige, står begge.',
      ],
      concepts: [
        {
          term: 'Hvad ISE siger',
          body: [
            '*God rapportskrivning* (slide 9): tabeller har forklarende tekst **over**, figurer **under** — “sådan er det bare”. Figurteksten er lang, typisk **3–4 linjer**, og beskriver alt ved figuren, så den kan læses selvstændigt. Placér figurer **før** den tekst, der forklarer dem. En figurliste er ikke påkrævet.',
            'Slide 23–24: den hyppigste arkitekturfejl er **ulæselige diagrammer** — brug gerne farver til at markere blokke og forbindelser på BDD/IBD (et af eksemplerne har en farvelegende). Den hyppigste designfejl er diagrammer efter hinanden uden brødtekst: “Hvis ikke I ved hvorfor I har lavet en figur, ved læseren det helt sikkert heller ikke.” Slide 13: en figur uden kildeangivelse er pr. definition jeres eget arbejde.',
          ],
        },
        {
          term: 'Hvilken figur hvor',
          body: [
            'Skabelonens Tabel 10.2 (Software Engineering-projekt) fordeler figurerne: rigt billede i systemskitsen; aktør-kontekstdiagram, use case-diagram, MoSCoW-matrix og domænemodel under brugerkrav; C4 context-diagram, risikomatrix, C4 container-diagram, systemniveau-sekvensdiagram og ER-diagram under arkitektur; C4 component-, klasse-, sekvens- og state machine-diagrammer plus kode pr. delsystem; testresultater og metrikker under test. Embedded-varianten (Tabel 10.3) bruger SysML BDD til kontekst og UML deployment til struktur.',
            'Kapitlet bestemmer altså diagrammet. En domænemodel må ikke vise teknologi og interne interfaces (skabelonens kap. 3.5); det kommer først i arkitektur og design.',
          ],
        },
        {
          term: 'Hvad sem4-reglerne kræver oven i',
          body: [
            '**Captionen siger hvad læseren skal lægge mærke til.** Mønstret er *hvad figuren viser* + “Bemærk at” + *den pointe, figuren underbygger*. “Figur 4: Klassediagram” er ikke en caption. Begrundelsen er den samme som ISE’s: censor læser kun hovedrapporten, og figur plus caption er ofte det eneste, der bliver læst.',
            '**Legend er obligatorisk** i selve figuren, ikke i captionen: legenden bærer notationen, captionen bærer pointen. **Hver figur skal være refereret fra brødteksten**; en ikke-refereret figur hører ikke i rapporten.',
            '**Rapportfigurer tegnes i draw.io** og valideres; Mermaid er kun til plan-skitser og må aldrig kopieres direkte ind i en aflevering. Filnavne har faste præfikser: `CD_`, `SD_`, `SSD_`, `STM_`, `ACT_`, `UC_`, `DM_`, `ER_<system>_chen`, `ER_<system>_schema`, `C4L<n>_`, `DEP_`, `DT_`, `CMP_`, `BDD_`, `IBD_`. Til LaTeX eksporteres PDF (vektor).',
          ],
        },
        {
          term: 'Notation: aggregation og ER',
          body: [
            '**Aggregation (hul diamant) er forbudt i UML-klassediagrammer** efter sem4-reglerne, men lovlig i SysML BDD. ISE er mildere: domænemodel-artiklen siger, at aggregation “kan ligeså godt tegnes som en association, uden at dybere viden går tabt”, og ISE’s egne BDD’er bruger den (Tankstationen: Benzinstanderstyring ◇— Benzinstander 1..3). SWD’s noter streger symbolet ud — se [[swd/uml-klassediagram|UML-klassediagrammer]]. I praksis: association eller composition i klassediagrammer, aggregation kun i BDD.',
            '**Konceptuel ER er Chen** (rektangel, rombe, oval), crow’s foot kun på logisk/fysisk niveau. Skabelonen nævner bare “ER-diagram” under datamodeller og persistering uden notation; sem4 lægger sig op ad BAD — se [[bad/er-model|ER-modellering (Chen)]] og [[bad/relational-mapping|fra ER til tabeller]].',
          ],
        },
        {
          term: 'Skabelonens egne captions',
          body: [
            'Skabelonens eksempelfigurer har captions som “Figur 5.1: Eksempel: klassediagram” og “Figur 4.2: Eksempel: arkitektur (package diagram)”. Det er pladsholdere — de siger kun diagramtypen. Pointen står i brødteksten over figuren (“Det centrale ansvar for koordineringen mellem klasserne er placeret i `SalgsService` … Denne opdeling reducerer koblingen”). Efter både ISE’s 3–4-liniersregel og sem4’s “Bemærk at”-regel hører netop den pointe i captionen.',
          ],
        },
        {
          term: 'Værktøj',
          body: [
            'PRJ4-introduktionen lader værktøjet være frit: Visio, UMLet, Lucidchart eller draw.io. sem4-reglerne vælger draw.io for alle kurser, fordi kilden kan committes, valideres og eksporteres som vektor-PDF til LaTeX.',
          ],
        },
      ],
      viz: 'caption-omskrivning',
      keyPoints: [
        'Figurtekst under figuren, tabeltekst over (ISE).',
        'Captionen er 3–4 linjer (ISE) og følger “viser … Bemærk at …” (sem4). Diagramtypen alene er ikke en caption.',
        'Legend i figuren, pointen i captionen.',
        'Hver figur refereres fra brødteksten og har en grund til at være der.',
        'Ingen aggregation i UML-klassediagrammer (sem4, SWD); lovlig i SysML BDD. Konceptuel ER i Chen.',
        'draw.io med præfiks-filnavne (`CD_`, `SD_`, `BDD_` …); Mermaid kun til plan-skitser.',
      ],
      code: [
        {
          lang: 'text',
          title: 'En caption, der ikke siger noget, og en der gør',
          source: '.agents/skills/studie-figurer/SKILL.md, afsnittet “Captions — censor scanner figurer”',
          code: `Dårlig:  Figur 4: Klassediagram

God:     Figur 4: Klassediagrammet for booking-modulet. Bemærk at
         BookingService kun kender IBookingRepository, så persistens-
         laget kan udskiftes uden ændringer i forretningslogikken.`,
        },
      ],
      exam: [
        '“Hvad skal vi se på den her figur?” — Svaret står i captionen: den siger hvad figuren viser og hvad læseren skal bemærke, fx at `SalgsService` koordinerer alle klasser, og at REST-laget kun kender den.',
        '“Hvorfor har I ingen hule diamanter i klassediagrammet?” — Aggregation har ingen præcis betydning; vi bruger association eller composition, hvor livscyklussen er bundet. I BDD’et er den lovlig, og der bruger vi den.',
        '“Hvorfor er ER-modellen i Chen og skemaet i crow’s foot?” — Chen er den konceptuelle model af domænet; crow’s foot viser de logiske tabeller med nøgler. Det er to abstraktionsniveauer.',
        'Hver figur i rapporten er refereret fra teksten og har en legend. Farverne på BDD/IBD markerer delsystemerne, så diagrammet kan læses uden brødteksten.',
      ],
      sources: [
        { path: k('13-rapport/god-rapportskrivning.md'), original: GOD, pages: 'slide 2, 9, 13, 23–25' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: SKABELON, pages: 's. 13–14, 16–17, 22–23, 38–39' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 11' },
        { path: k('09-domaeneanalyse/artikel-domaenemodeller.md'), original: 'DomæneModeller.pdf', pages: 's. 10' },
        { path: k('10-applikationsmodel/system-application-models-3.md'), original: 'System Application Models Part3.pdf', pages: 'slide 17' },
        { path: '.agents/skills/studie-figurer/SKILL.md', note: 'sem4’s projektregler for figurer (legend, captions, draw.io, filnavne)' },
        { path: 'CLAUDE.md', note: 'sem4-projektregler: afsnittet “Diagrammer og figurer”' },
      ],
      gaps: [
        'ISE-materialet nævner ikke legend som krav; det tætteste er “brug gerne farver” og et eksempel med farvelegende (God rapportskrivning slide 23). Obligatorisk legend er en sem4-regel.',
        'ISE siger “placér figurer *før* tekst” (slide 9), mens sem4 kræver, at figuren er refereret fra brødteksten. De er forenelige — skriv henvisningen, og lad figuren stå først — men materialet siger ikke, hvordan de to kombineres i LaTeX, hvor figurer flyder.',
        'Skabelonens egne eksempelcaptions (“Eksempel: klassediagram”) bryder både ISE’s 3–4-liniersregel og sem4’s caption-regel. De er pladsholdere, men materialet siger det ikke.',
        'Hverken ISE eller skabelonen angiver notation for ER-diagrammet under “Datamodeller og persistering”. Chen-kravet kommer fra sem4-reglerne og BAD.',
        'Filnavnepræfikserne og draw.io-kravet findes kun i sem4-reglerne; PRJ4-introduktionen lader værktøjet være frit.',
      ],
      keywords: ['figur', 'figurtekst', 'caption', 'billedtekst', 'legend', 'legende', 'notation', 'draw.io', 'drawio', 'Mermaid', 'filnavn', 'præfiks', 'aggregation', 'hul diamant', 'composition', 'Chen', 'crow’s foot', 'tabeltekst', 'Bemærk at', 'figurliste'],
    },

    {
      slug: 'proces-produktrapport',
      title: 'Procesrapport, produktrapport og bilag',
      short: 'Proces vs. produkt',
      week: 'Hele forløbet og afslutning',
      definition:
        'En projektaflevering består af **hovedrapporten** (PDF, “hovedopgave”) og **bilag** (typisk en zip, “supplerende materiale”). Bilagene deles i en **teknisk del** — produktdokumentationen, som en fagfælle kan videreudvikle og vedligeholde produktet ud fra — og en **procesdel**, der dokumenterer hvordan gruppen arbejdede.',
      intro: [
        'Hovedrapporten skal kunne læses alene af censor; bilagene er til den, der vil tjekke eller bygge videre. Kursuskataloget gør det til en eksamensforudsætning at aflevere både “projektrapport og projektdokumentation”, og læringsmålet “Dokumentere det udarbejdede produkt” peger direkte på den tekniske bilagsdel. Hvordan hovedrapporten er bygget, står under [[rapportstruktur|rapportens opbygning]].',
      ],
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'Produktdokumentationen opstår undervejs: kravspecifikationen i første iteration (PRJ4-introduktionens eksempel lægger den i sprint 1 og reviewer den i uge 4), risikomatricen løbende, design- og testdokumenter pr. iteration. Procesbilagene — samarbejdsaftale, mødereferater, tidsplaner — opstår fra første dag. Selve rapporten skrives især i sidste iteration (“Sprint 5: Projektrapporten”), men *God rapportskrivning* spørger bevidst: “Hvornår begynder I på rapportskrivning?”',
          ],
        },
        {
          term: 'Artefaktet: hovedrapporten',
          body: [
            'Hovedrapporten rummer problemformulering, **udvalgte** krav, én eller to use cases dokumenteret fra start til slut, arkitekturen, design pr. delsystem med udvalgte kodeudsnit, test og diskussion. L27 (slide 16): hovedrapporten **skal** indeholde en accepttest; er listen for lang, opsummeres de vigtige (fx MUST-krav), og resten ligger i bilag med henvisning til bilagsnummer. Kildekoden står kun som udsnit — “behøver ikke hele koden, de vigtige dele med forklaringer” (slide 14).',
            'Processen har også sin plads i hovedrapporten, men kort: kap. 2 beskriver valgt proces og metode som **hensigt** (1–2 sider), og kap. 8.2 diskuterer, hvordan det gik. L27 (slide 11) deler metode og proces i to: metoden til at løse opgaven (udviklingsproces, analyse- og designmetode, SysML/UML) og processen til at styre projektet (gruppedannelse, samarbejdsaftale, planlægning og møder, projektledelse, reviews).',
          ],
        },
        {
          term: 'Tekniske bilag: produktdokumentationen',
          body: [
            'Skabelonen (s. 35–36): bilagene henvender sig til en teknisk kyndig på samme faglige niveau, som med rapport og bilag skal kunne **videreudvikle og/eller vedligeholde** produktet. Eksempler: kravspecifikation med alle funktionelle og ikke-funktionelle krav og prioritering, risikomatrice, analyserapporter og eksperimenter bag arkitektur og design, testdokumenter (integrationstest, udført accepttest, usability-studier), implementeringsfiler (kildekode, diagrammer, printudlæg, beregninger) og datakilder.',
            'Gregersens mappestruktur (God rapportskrivning slide 5) har under `Projekt/`: kravspecifikation, analyse, arkitektur, design, test (modul-, integrations- og accepttest), datablade, printudlæg, Doxygen-dokumentation, source code og logbog.',
          ],
        },
        {
          term: 'Procesbilag',
          body: [
            'Skabelonen: procesbeskrivelse, samarbejdsaftale, mødereferater, tidsplaner (den oprindelige **og** den endelige) og logbøger. L27 (slide 23) tilføjer Gantt-diagram og review-referater; Gregersen har samarbejdsaftale med underskrifter, Scrum-dokumenter og mødeindkaldelser.',
            'Den oprindelige tidsplan ved siden af den endelige er det, der gør procesdiskussionen i kap. 8.2 konkret: hvad planlagde vi, og hvad skete der.',
          ],
        },
        {
          term: 'Form: én samlet fil eller en zip',
          body: [
            'To muligheder (God rapportskrivning slide 5): ét samlet dokument med alle bilag, som gør hyperlinks og krydsreferencer lettere, eller en zip med god mappestruktur. Skabelonen: rapporten afleveres som hovedopgave, bilag som supplerende materiale, fx på WISEflow. Bilagsoversigten kan være en liste i rapporten (“Bilag 02, Kravspecifikation — *Kravspecifikation.pdf*”) eller en nummereret mappestruktur (L27 slide 21). Bilagsliste og referenceliste holdes adskilt (slide 12).',
          ],
        },
        {
          term: 'Hvad censor kigger efter — og typiske fejl',
          body: [
            'Censor har ca. 6 timer pr. projekt inkl. eksamen og nærlæser ikke bilag. Rapporten skal derfor være sammenhængende uden bilagene, og bilagene skal kunne findes, når en påstand i rapporten henviser til dem. Typiske fejl i *God rapportskrivning*: at begynde med bilagene og plukke ind i rapporten bagefter; én stor accepttest på alt i systemet frem for mindre specifikationer; testforkortelser, der kolliderer med kravspecifikationens; og “vi har brugt XXX fordi vi kendte det i forvejen” i procesdelen.',
            'Lean dokumentation (Björkholm) giver målestokken for bilagene: dokumentér resultater, ikke krav; hold dokumenterne så få og korte som muligt, men ikke færre; og skriv ikke det, koden allerede siger.',
          ],
        },
      ],
      viz: 'rapport-bilag-sortering',
      keyPoints: [
        'Aflevering = hovedrapport (hovedopgave) + bilag (supplerende materiale). Begge er eksamensforudsætning i PRJ4.',
        'Hovedrapporten: udvalgte krav, 1–2 UC fra start til slut, vigtigste accepttests, kodeudsnit — resten i bilag med henvisning.',
        'Tekniske bilag = produktdokumentation til en fagfælle, der skal videreudvikle eller vedligeholde.',
        'Procesbilag: procesbeskrivelse, samarbejdsaftale, mødereferater, tidsplaner (oprindelig og endelig), logbog.',
        'Processen i hovedrapporten: hensigt i kap. 2, tilbageblik i kap. 8.2.',
        'Bilagsliste og referenceliste er to forskellige lister.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Bilagsmappe efter Gregersens vejledning',
          source: 'God_rapportskrivning.pdf slide 5',
          code: `Bilag
├── Projekt
│   ├── Kravspecifikation (PDF)
│   ├── Analyse (PDF)
│   ├── Arkitektur (HW/SW) (PDF)
│   ├── Design (HW/SW) (PDF)
│   ├── Test
│   │   ├── Modultest (HW/SW) (PDF)
│   │   ├── Integrationstest (PDF)
│   │   └── Accepttest (PDF)
│   ├── Datablade
│   ├── Printudlæg
│   ├── Doxygen genereret dokumentation
│   ├── Source code
│   └── Logbog
└── Proces
    ├── Procesbeskrivelse (PDF)
    ├── Samarbejdsaftale m. underskrifter
    ├── Gantt-diagram
    ├── Scrum-dokumenter
    ├── Mødeindkaldelser
    └── Mødereferater`,
        },
      ],
      exam: [
        '“Hvor ligger resten af jeres krav?” — I kravspecifikationen i bilag X. Rapporten viser de udvalgte use cases og ikke-funktionelle krav, der driver arkitekturen, og henviser til bilaget for resten.',
        '“Kunne en anden gruppe overtage jeres system?” — Det er målet med de tekniske bilag: kravspecifikation, arkitektur- og designdokumenter, testdokumenter og kildekoden, skrevet til en fagfælle på vores niveau.',
        '“Hvordan gik jeres proces?” — Vi beskrev hensigten i kapitel 2 og diskuterer i kapitel 8, hvad der virkede; den oprindelige og den endelige tidsplan ligger i procesbilagene, så afvigelserne kan ses.',
        'Accepttesten i rapporten dækker MUST-kravene; den fulde, gennemførte accepttest ligger i bilag, og hver test har godkendt eller fejlet.',
      ],
      sources: [
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: SKABELON, pages: 's. 8, 11, 35–36' },
        { path: k('13-rapport/l27-projektrapport.md'), original: L27, pages: 'slide 2, 11, 14, 16, 21–23' },
        { path: k('13-rapport/god-rapportskrivning.md'), original: GOD, pages: 'slide 5–7, 12, 20–21, 25' },
        { path: k('13-rapport/lean-dokumentation.md'), original: 'LeanDokumentation.pdf', pages: 's. 2–3' },
        { path: k('00-kursus/kursusbeskrivelse-katalog.md'), note: 'AU Kursuskatalog, SW4PRJ4-02: kursusindhold, læringsmål og forudsætning for eksamen' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 7, 9' },
      ],
      gaps: [
        'Materialet bruger ikke ordene “procesrapport” og “produktrapport”. Det taler om hovedrapport, tekniske bilag og procesbilag (skabelonen, L27) eller mapperne `Projekt/` og `Proces/` (Gregersen). Guidens titel er en oversættelse til den gængse sprogbrug.',
        'Logbogen placeres forskelligt: under `Projekt/` hos Gregersen (God rapportskrivning slide 5), men under procesbilag i skabelonen (s. 36) og L27 (slide 23).',
        'L27 er genbrugt fra SW2PRJ2 og siger om bilagene: “I kan bestemme selv” (slide 21, 23). Der er ingen SW4PRJ4-specifik bilagsliste.',
        'Kataloget kræver “projektrapport og projektdokumentation”, men definerer ikke projektdokumentation. At det svarer til skabelonens tekniske bilag, er guidens tolkning.',
        'Skal kildekoden afleveres som zip eller som link til et repository? Materialet siger kun “Source code” / “kildekode” som bilag.',
      ],
      keywords: ['bilag', 'appendiks', 'supplerende materiale', 'hovedrapport', 'procesrapport', 'produktrapport', 'produktdokumentation', 'projektdokumentation', 'procesbeskrivelse', 'samarbejdsaftale', 'mødereferat', 'logbog', 'tidsplan', 'Gantt', 'bilagsoversigt', 'kravspecifikation', 'kildekode', 'WISEflow', 'zip'],
    },

    {
      slug: 'projekteksamen',
      title: 'Den mundtlige projekteksamen',
      short: 'Projekteksamen',
      week: 'Afslutning',
      definition:
        'Projekteksamen er en mundtlig prøve på baggrund af gruppens afleverede rapport og dokumentation: en **fælles del**, hvor gruppen præsenterer og viser projektet, og en **individuel** eksamination uden forberedelse. I PRJ4 er den typisk 20 minutter, med **ekstern censur** og karakter efter **7-trinsskalaen**. Læringsmålene er censors tjekliste.',
      intro: [
        'Kurset er både en hjemmeopgave (rapport og dokumentation) og en mundtlig prøve; afleveringen er forudsætning for at gå til den mundtlige. Alle hjælpemidler er tilladt, også GAI-værktøjer. Rapporten, der ligger til grund, er beskrevet under [[rapportstruktur|rapportens opbygning]] og [[proces-produktrapport|rapport og bilag]].',
      ],
      concepts: [
        {
          term: 'Formen — og de to kilder, der er uenige',
          body: [
            'Kursuskataloget (ordret): “Projekteksamen -15 min. i gruppen + 20 min individuelt”. PRJ4-introduktionens slide 6 siger “Projekteksamen, 20 minutter” og “Fælles introduktion med fremvisning af projektet (ca. 20 min.) efterfulgt af individuel mundtlig eksamen, 15 minutter, ingen forberedelse”. Minuttallene er altså byttet om. Forårsudgaven af introduktionen i `sem4/prj4/` har samme tal som slidene.',
            'Kataloget er den officielle beskrivelse og gælder formelt. Begge kilder er enige om resten: fælles del før individuel del, ingen forberedelse til den individuelle del, eksamen baseret på rapport og dokumentation, ekstern censur, 7-trinsskala. Spørg vejlederen om det konkrete minuttal.',
          ],
        },
        {
          term: 'Læringsmålene er censors tjekliste',
          body: [
            'SW4PRJ4 har 12 læringsmål. Censor bedømmer mod dem, og rapporten skal vise hvert af dem et sted: udvælge og redegøre for en teknisk-faglig problemstilling; anvende en **iterativ** udviklingsproces; dokumentere produktet; korrekt fagterminologi; applikationer med **GUI, databaser og netværkskommunikation**; teknikker, metoder og værktøjer til **softwaretest**; **objektorienteret analyse og design**; projekt- og versionsstyringsværktøjer; kombinere viden fra semestrets kurser; **diskutere og perspektivere** proces-, design- og teknologivalg; supplerende viden med referencer; og præsentere resultaterne ved et mundtligt forsvar.',
            'Studieformen understreger to af dem: der er frie rammer for proces og produkt, “dog skal læringsmålene opfyldes (iterativ + OOA&D)”. Og projektet skal inddrage faglige aspekter fra **samtlige** fag på semestret — det skal dokumenteres i rapporten og “bør inddrages af de studerende til eksamen”.',
          ],
        },
        {
          term: 'Hvad man skal kunne forsvare',
          body: [
            'Eksamen er baseret på gruppens rapport, og den individuelle del har ingen forberedelse. Man skal altså kunne forklare **hele** rapporten, ikke kun sine egne afsnit — ansvarsfordelingstabellen fra L27 (slide 8) er valgfri og fritager ikke for noget. Diskussionskapitlet er der, man har øvet sig i at forsvare valgene: problemstilling vs. løsning, proces og metode, krav, arkitektur og design.',
            'Tre spørgsmålstyper går igen i materialets fejllister og kan forventes: **Hvorfor?** (“Vi har brugt XXX fordi vi kendte det” er en dårlig begrundelse; alternativer og deres fordele og ulemper er en god), **Hvordan sporer det?** (krav med unikke numre → UC → accepttest), og **Hvad ville I gøre anderledes?** (negative fund undertrykkes ikke, men diskuteres; “Vi ÆÆÆÆLSKER når I angiver, at I har lært noget”).',
          ],
        },
        {
          term: 'Forberedelse',
          body: [
            'Fra materialet: rapporten er det, censor har læst (ca. 6 timer pr. projekt inkl. eksamen), så den fælles præsentation skal bygge på den, ikke gentage den. Hvert læringsmål skal kunne peges ud i rapporten, og kombinationen af semestrets fag skal kunne vises konkret.',
            'Uden for materialet: læs hele rapporten igen, også andres kapitler; forbered en kort forklaring af hvert diagram (hvad det viser, hvorfor det står i netop dét kapitel); og øv den individuelle del mundtligt, fordi den er uden forberedelse. Materialet har ingen vejledning i, hvordan præsentationen bygges op.',
          ],
        },
        {
          term: 'Karakter og reeksamen',
          body: [
            'Karakter efter 7-trinsskalaen ved ekstern censor. Studerende, der ikke afleverer, udebliver fra den mundtlige prøve eller får 00 eller -3, skal aflevere et **nyt projekt**, bedømt efter de samme læringsmål, ved næste ordinære eksamenstermin. PRJ4-introduktionen tilføjer om afleveringsfristen: “1 sekund for sent ⇒ nyt projekt næste semester”.',
          ],
        },
      ],
      viz: 'projekteksamen-forloeb',
      keyPoints: [
        'Hjemmeopgave (rapport + dokumentation) og mundtlig prøve; afleveringen er forudsætning.',
        'Fælles del med fremvisning, så individuel eksamination uden forberedelse. Ekstern censur, 7-trinsskala, alle hjælpemidler.',
        'Minuttal: katalog 15 min gruppe + 20 min individuelt; slides ca. 20 min fælles + 15 min individuelt. Kataloget gælder formelt.',
        'Læringsmålene er tjeklisten — især iterativ proces, OOA&D, test og at alle semestrets fag er i spil.',
        'Man eksamineres i hele rapporten, ikke kun egne afsnit.',
        'Ikke bestået eller udeblivelse: nyt projekt til næste ordinære termin.',
      ],
      exam: [
        '“Hvor i rapporten ser jeg, at I har arbejdet iterativt?” — I kapitel 2, hvor vi beskriver processen og iterationerne som hensigt, og i kapitel 8, hvor vi diskuterer hvordan de holdt; tidsplanerne i procesbilaget viser forskellen.',
        '“Hvordan bruger projektet semestrets fag?” — Vær konkret: fx arkitektur- og designbeslutninger fra SWD ([[swd/arkitekturproces|ADR’er]]), testteknikker fra SWT ([[swt/systemtest|system- og accepttest]]), database og API fra BAD ([[bad/ef-core|EF Core]], [[bad/rest|REST]]) og GUI fra FED ([[fed/mvvm|MVVM]]).',
        '“Hvorfor valgte I den teknologi?” — Nævn alternativerne, kriterierne og hvorfor valget faldt sådan; “vi kendte den i forvejen” er kun en god grund, hvis den er formuleret som en prioritering af tiden.',
        '“Forklar det her diagram, selvom du ikke har tegnet det.” — Start med hvad det viser, hvilken notation det er, og hvad læseren skal bemærke; det er captionen sagt højt.',
        '“Hvad ville I gøre anderledes?” — Sig det ærligt og vis, hvad I lærte. Materialet beder eksplicit om det i diskussionen.',
      ],
      sources: [
        { path: k('00-kursus/kursusbeskrivelse-katalog.md'), note: 'AU Kursuskatalog, SW4PRJ4-02 Projekt 4 (kursuskatalog.au.dk): læringsmål, eksamen, bemærkninger og uoverensstemmelser' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 4–6, 8, 10' },
        { path: 'prj4/SW4PRJ4_Introduktion.md', note: 'Forårsudgaven af PRJ4-introduktionen (markdown), afsnittene “Læringsmål”, “Studieform” og “Eksamen”' },
        { path: k('13-rapport/god-rapportskrivning.md'), original: GOD, pages: 'slide 6, 20–22, 27, 29–30' },
        { path: k('13-rapport/l27-projektrapport.md'), original: L27, pages: 'slide 8, 24' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: SKABELON, pages: 's. 31–32' },
      ],
      gaps: [
        'Katalog og slides er uenige om minuttallet: “15 min. i gruppen + 20 min individuelt” (katalog) mod “ca. 20 min.” fælles + “15 minutter” individuelt (SW4PRJ4 Introduktion.pdf slide 6, og forårsudgaven i `prj4/SW4PRJ4_Introduktion.md`). Slidet siger desuden “Projekteksamen, 20 minutter” som samlet varighed, hvilket ikke passer med nogen af summerne. Kataloget gælder formelt.',
        'Katalogets uoverensstemmelsestabel henviser til “slide 5” for eksamenstiderne, men i markdown-konverteringen står eksamen på slide 6.',
        'L27-projektrapport.md lister læringsmål for **SW2PRJ2** (slide 24), ikke SW4PRJ4. Guiden bruger katalogets SW4PRJ4-mål; *God rapportskrivning* (slide 29–30) lister bachelorprojektets mål.',
        'Materialet siger intet om præsentationens indhold, om demo er påkrævet, om votering, eller om den individuelle del må gå på andres afsnit. At man skal kunne forsvare hele rapporten, udledes af “eksamen er baseret på gruppens afleverede projektrapport”.',
        'Forudsætningen er uklar: kataloget kræver kun aflevering af rapport og dokumentation, mens 00-kursus/README nævner godkendte obligatoriske opgaver A, B og C (SWISE-kravet). Det hører til ISE, ikke til projektguiden.',
      ],
      keywords: ['eksamen', 'projekteksamen', 'mundtlig', 'forsvar', 'censor', 'ekstern censur', '7-trinsskala', 'læringsmål', 'fremvisning', 'præsentation', 'individuel eksamination', 'reeksamen', 'GAI', 'hjemmeopgave', 'forberedelse'],
    },
  ],
}
