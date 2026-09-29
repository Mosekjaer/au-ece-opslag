import type { Part } from '../types'
import { k } from './paths'

const FIGURREGLER = '.agents/skills/studie-figurer/SKILL.md'

export const arkitektur: Part = {
  id: 'arkitektur',
  title: 'Arkitektur og design',
  topics: [
    {
      slug: 'arkitektur',
      title: 'Systemarkitektur: fra funktioner til HW- og SW-blokke',
      short: 'Systemarkitektur',
      week: 'Arkitekturfasen',
      definition:
        'Systemarkitekturen svarer på *hvordan* systemet opfylder kravene: hvilke delsystemer det består af, hvilke designkriterier der vejer tungest, og hvilke **logiske funktioner** der **allokeres** til hvilke **fysiske blokke** — hardware eller software.',
      intro: [
        'I ISE’s system engineering-proces er arkitekturen midterstykket: efter *“Hvad skal systemet gøre?”* (krav, use cases, accepttest, teknisk analyse) kommer *“Hvordan gør systemet det?”* — Architecture Design (subsystems) → SW Design (applikations- og logisk model) → HW Design (platform og deployment) → Interface Design (protokoller). Kravspecifikationen og domænemodellen er input; grænseflader, applikationsmodel og kode bygger ovenpå. Se [[rygrad|Projektets rygrad]].',
      ],
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'Arkitekturdesign starter, når der er en specifikation og et første BDD/IBD. Det dækker designbeslutninger, prioriteter og HW- og SW-dekomponering. Slides deler det i fire aktiviteter: **General system design** (overvejelser, prioritering, systemdækkende beslutninger), **HW architectural design** og **SW architectural design** (kompositionel nedbrydning) og **Interface design** (HW/SW-grænseflader, se [[graenseflader|Grænseflader]]).',
            'AU ECE-rapportskabelonen lægger arkitekturen i fase II (“Kravanalyse og arkitekturudkast”): den indledende arkitektur bygges på domænemodellen og modelleres med komponent-, deployment- og systemsekvensdiagrammer, så delsystemerne kan udvikles parallelt i fase III.',
          ],
        },
        {
          term: 'Designkriterier og beslutninger',
          body: [
            'Listen af svære beslutninger: 1) prioritér designkriterier, 2) arkitekturstrategi, 3) data storage, 4) software control, 5) initiation/termination, 6) error handling, 7) self-test og backup. Kriterierne (cost, performance, time-to-market, safety, extensibility, reliability, security, usability, testability, scalability …) er modstridende — *“Fast, cheap, good – chose any two!”* — og drives af det tilsigtede marked og den tilgængelige teknologi.',
            'Vahid formulerer det som design metrics, der konkurrerer: forbedrer man én, forværres ofte en anden. Totalomkostningen er `NRE cost + unit cost × antal enheder`, så produktionsvolumen afgør, om en løsning med lav engangsomkostning eller lav stykpris vinder.',
          ],
        },
        {
          term: 'Dekomponering',
          body: [
            'Modsat *“a nightmare system”* med én stor `main()` dekomponeres systemet hierarkisk: System → Subsystem → Module → Class. Peckol begrunder det med genbrug, arbejdsfordeling (modulgrænser skal minimere grænseflader mellem grupper), stabile grænseflader og robusthed: løst koblede moduler forhindrer, at en fejl breder sig.',
            'Peckols tommelfingerregler: hvert modul løser én veldefineret del af problemet; forbindelser mellem moduler findes kun, fordi delene af problemet hænger sammen; og nedbrydningen starter i et **funktionelt** view, ikke i konkret hardware. Målestokken er lav kobling og høj samhørighed (se [[graenseflader|Grænseflader]]).',
            '**Design for test** hører med: planlæg samtidig med designet, hvordan HW-komponenter og SW-klasser skal testes — unit- og komponenttest på grænseflader og funktionalitet, integrationstest top-down eller bottom-up med stubs og drivers (V-modellen). Teknikkerne står i [[swt/design-for-testability|Design for testability]] og [[swt/integrationsplan|Integrationsplan]].',
          ],
        },
        {
          term: 'Logisk og fysisk arkitektur',
          body: [
            'Peckol skelner mellem tre modeller: **specifikationen** (systemets ydre adfærd), den **funktionelle model** (den indre adfærd, der giver den ydre, uden binding til teknologi) og den **arkitektoniske model** (de fysiske HW- og SW-komponenter, funktionerne lægges på). Ingen af de to sidste er nok alene; det er **mappingen** mellem dem, der definerer arkitekturen.',
            'Slides giver en “cookbook” for HW architectural design: 1) lav en *logisk* model (logiske blokke), 2) undersøg de logiske grænseflader, 3) lav en *HW-model* (fysiske blokke), 4) allokér de logiske blokke til de fysiske, 5) definér de fysiske grænseflader mellem blokkene og til omgivelserne. Allokeringen sker iterativt.',
          ],
        },
        {
          term: 'Allokering til hardware og software',
          body: [
            'I SysML tegnes allokeringen på et BDD med stiplede `«allocate»`-pile fra `«logical»` til `«physical»` blokke. I Camera Electronics-eksemplet lander både *Image Processor* og *Focus Controller* på samme *Vector Processor*, og *Control Processor* får ingen logisk blok — en allokering behøver ikke være én-til-én.',
            'Peckol: meget er oplagt — strømforsyning, display, kommunikationsport og kabinet er hardware; operativsystem og drivere er software. Imellem ligger et gråt **hardware–software-kontinuum**, hvor krav til timing, performance, strøm, geografi og pris afgør det. I tælleren kunne clock-systemet og counter-divider-kæden i princippet være software, men den ønskede frekvens gør dem til hardware.',
            'Rapportskabelonens eksempel (Drinkbot 4000) viser argumentet: en doseringssløjfe skal reagere inden for 12 ms, en multitrådet Linux-applikation på en Raspberry Pi er en høj teknisk risiko, så reguleringen lægges på en microcontroller uden OS og systemet deles i to delsystemer.',
          ],
        },
        {
          term: 'Arkitekturstrategi',
          body: [
            '**Layering** er en af de mest effektive måder at få lav kobling på systemniveau: Presentation / Business logic / Data access / Network i en softwareapplikation, Program / Operating System / Drivers / Hardware i et embedded system. **Half-sync, half-async** passer til kontinuerte systemer: en hændelsesstyret del (UI, Control, Configuration) over en kontinuert del (Sensor processing → Regulation → Driver). **Frameworks** giver funktionalitet og decoupling via nedarvning; eksemplet er Observer (`Subject`/`Observer`), se [[swd/observer|Observer]].',
            'Strategien omfatter også start og stop (startrækkefølge, konfiguration, Power-On Self-Test) og **error handling fra dag 1**: detektion (watchdog, voting, POST, CBIT) og håndtering (brugerindgriben, limp mode, redundans). Softwarearkitekturens stilarter og proces står i [[swd/arkitekturstile|Architectural styles]] og [[swd/arkitekturproces|Softwarearkitektur som proces]].',
          ],
        },
        {
          term: 'Artefaktet, notation og hvad censor kigger efter',
          body: [
            'Rapportskabelonens kapitel 4 *Systemarkitektur*: 4.2 ydre grænser og relationer (package- eller C4 context-diagram), 4.3 analyse af arkitektur (arkitekturkritiske risici fra ikke-funktionelle krav og teknologier, med litteratur eller små eksperimenter i bilag), 4.4 struktur og grænseflader (lagdelt package-, deployment- eller [[swd/c4|C4]] container-diagram), 4.4.1 interaktion mellem delsystemer (systemsekvensdiagram), 4.4.2 grænseflader og protokoller, 4.4.3 datamodeller.',
            'Diagramvalget afhænger af projekttypen: et softwareprojekt bruger C4 context og container, et embedded-projekt SysML BDD for kontekst og UML deployment plus HW-interface- og protokolbeskrivelse. Et af kursets læringsmål er at *diskutere og perspektivere proces-, design- og teknologivalg* — censor vil høre, hvorfor arkitekturen ser sådan ud, ikke kun hvordan.',
          ],
        },
      ],
      viz: 'prj-allokering',
      keyPoints: [
        'Arkitektur = “hvordan”: delsystemer, prioriterede designkriterier og allokering af funktioner til HW og SW.',
        'Fire aktiviteter: general system design, HW- og SW-arkitekturdesign, interface design.',
        'Start funktionelt (logisk model), lav så den fysiske model, og allokér iterativt med `«allocate»`.',
        'Allokeringen er ikke én-til-én: flere funktioner kan dele en blok, og en blok kan være uden funktion.',
        'Placeringen i HW/SW-kontinuummet begrundes med krav: timing, performance, strøm, pris.',
        'Layering giver lav kobling; error handling og opstart planlægges fra dag 1.',
        'Rapportens arkitekturkapitel viser grænser, analyse (risici), struktur, interaktion og grænseflader.',
      ],
      exam: [
        '“Hvorfor ligger den tidskritiske del på en microcontroller?” — fordi et ikke-funktionelt krav giver et tidsbudget, som vi har regnet ud; en Linux-applikation kunne ikke garantere det, og det viste vores forsøg. Det er Drinkbot-argumentet fra rapportskabelonen, overført til vores eget krav.',
        'Vores logiske model beskriver funktionerne uden teknologi; den fysiske model er de konkrete HW-blokke. Allokeringen viser, hvilken funktion der kører hvor, og den er lavet iterativt.',
        'Vi prioriterede designkriterierne, fordi de er modstridende — “fast, cheap, good, choose any two” — og de valgte kriterier styrede resten af beslutningerne.',
        'Vi har dekomponeret i delsystemer med få, veldefinerede grænseflader, så gruppen kunne arbejde parallelt og en fejl i ét delsystem ikke breder sig.',
        'Error handling er en del af arkitekturen: vi har besluttet, hvordan fejl detekteres, og hvad systemet gør bagefter.',
      ],
      sources: [
        { path: k('06-arkitektur-og-design/system-architecture-and-design.md'), original: 'System Architecture and Design.pdf', pages: 'slide 1–13, 22, 25–36' },
        { path: k('06-arkitektur-og-design/system-design-and-interfaces.md'), original: 'System Design and Interfaces-F21.pdf', pages: 'slide 2, 21–30' },
        { path: k('05-sysml/sysml-structural-diagrams-1-bdd.md'), original: 'SysML Structural Diagrams 1.pdf', pages: 'slide 13' },
        { path: k('bog/08-peckol-ch9-system-design.md'), original: 'Peckol, Embedded Systems Design, kap. 9 (ISE-kompendiet)', pages: 's. 376–387' },
        { path: k('bog/12-vahid-ch1-embedded-systems-overview.md'), original: 'Vahid & Givargis, Embedded System Design, kap. 1 (ISE-kompendiet)', pages: 's. 1–11' },
        { path: k('00-kursus/velkommen-til-swise.md'), original: 'Velkommen til SWISE.pptx', pages: 'slide 39' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 8–10, 15–21, 37–39' },
      ],
      gaps: [
        '**4+1** nævnes ikke i ISE/PRJ4-materialet. Rapportskabelonen bruger package-, deployment- og C4-diagrammer. 4+1 undervises i SW4SWD: se [[swd/views-4plus1|Architectural views og 4+1]].',
        'Rapportskabelonen er uenig med sig selv om kapitlets længde: kapitel 4 står som “2-4 sider”, sidebudgettet som 3-4 sider (s. 15 og 37).',
        'Slide 29 (Counter, logical-to-physical) er svær at aflæse for *Time Base*, *Input* og *Measure*: konverteringen kan ikke se, hvilken af dem der peger på *Counter – Divider Chain and Control* og hvilken på *Clock System*. Figuren viser dem derfor som én gruppe.',
        'Slides nævner *data storage* og *software control strategies* som beslutning 3 og 4, men gennemgår dem ikke.',
        'ADR’er (skrevne arkitekturbeslutninger) nævnes ikke i ISE-materialet. SW4SWD bruger IASA-skabelonen: se [[swd/arkitekturproces|Softwarearkitektur som proces]].',
      ],
      keywords: ['arkitektur', 'architecture', 'systemdesign', 'system design', 'dekomponering', 'decomposition', 'allokering', 'allocate', '«allocate»', 'logisk model', 'fysisk model', 'logical', 'physical', 'HW/SW', 'co-design', 'hardware-software continuum', 'designkriterier', 'design metrics', 'NRE', 'layering', 'half-sync half-async', 'framework', 'error handling', 'watchdog', 'POST', 'Counter', 'Camera Electronics', 'Drinkbot', 'deployment'],
    },

    {
      slug: 'sysml-bdd',
      title: 'SysML Block Definition Diagram (BDD)',
      short: 'SysML BDD',
      week: 'Arkitekturfasen',
      definition:
        'Et **Block Definition Diagram** definerer systemets *blokke* — typer, som en C++-klasse — og deres relationer: først og fremmest **komposition** (“consists-of”) med multiplicitet og part-navne, men også generalisering, referencer og allokering.',
      intro: [
        'BDD’et er en af SysML’s fire strukturdiagrammer (bdd, ibd, par, pkg) og en modifikation af UML-klassediagrammet. Brightspace-teksten kalder det ingredienslisten i opskriften: hvilke dele systemet består af. Hvordan delene er forbundet, hører til i [[sysml-ibd|IBD’et]].',
      ],
      concepts: [
        {
          term: 'Blok og compartments',
          body: [
            'En blok er det grundlæggende strukturelement — hardware, software, en person, en bygning, vand, filer. Den tegnes som et rektangel; navnet er obligatorisk, `«block»` valgfri. Under navnet kan der være *compartments*: **parts** (`part name : block name[mul]`, komposition), **ports** (`port name : type`, interaktionspunkter), **values** (`value name : value type`, fx `weight : kg`), samt references, operations og receptions. Indholdet kaldes samlet *properties*.',
          ],
        },
        {
          term: 'Komposition, multiplicitet og part-navne',
          body: [
            'Den mest almindelige relation er **komposition**: en linje med *udfyldt* diamant ved helheden. Eksemplet: en `Aircraft` består af 1..2 `Wing Structure`, 0..2 `Engine` og én `Cockpit` med part-navnet `cp`. Multipliciteten står ved part-enden.',
            'Samme struktur kan tegnes på flere lovlige måder: parts som linjer eller som tekst i parts-compartmentet, og en multiplicitet `1..2` kan erstattes af to navngivne parts (`leftWing`, `rightWing`). BeoSound F gør det samme med én `Speaker`-blok og part-navnene `T1`, `T2` og `W`.',
          ],
        },
        {
          term: 'Hierarki og systemkontekst',
          body: [
            'Et dybere hierarki læses højt: *“A Camera consists of a Protective Housing, a Mount Assembly, a Camera Module … The Mount Assembly consists of …”*. Kontekst-BDD’et lægger systemet og dets omgivelser under én blok `System Context`: det `«system of interest»` (Access Control System), `Access Card`, `Door` og aktøren `User`.',
          ],
        },
        {
          term: 'Porte defineres på BDD’et',
          body: [
            'Porte *defineres* på blokkene i BDD’et og *bruges* til at forbinde parts i IBD’et. På BDD’et skrives retningen som tekst: `in card: Card`, `out cardVal: Card`, `inout doorCtrl: ~DoorCtrl`. En ikke-atomisk port er typet af en `«flowSpecification»` med sine flow properties; `~` betyder *konjugeret*, dvs. in og out byttes om.',
            'Blokkens egne porte skal realiseres af en af dens parts: `keyPress[10]` på User Interface realiseres af Keypad, `status[2]` af Led. SmartFridge-løsningen viser det samme: køleskabets porte er præcis Tabel 1, delenes er Tabel 2.',
          ],
        },
        {
          term: 'Øvrige relationer',
          body: [
            'Quick Guide (Friedenthal, tabel A.5): **reference association** (ingen eller *hul* diamant — “the white diamond is the same as no diamond”), **generalization** (hul trekant mod den generelle blok, evt. `{disjoint}`/`{overlapping}`, `{complete}`/`{incomplete}`) og association block. Friedenthals bil har `4-Cylinder Engine` og `6-Cylinder Engine` som specialiseringer af `Engine`.',
            'Et BDD kan også vise **allokering**: `«logical»` blokke med stiplede `«allocate»`-pile til `«physical»` blokke (Camera Electronics). Se [[arkitektur|Systemarkitektur]].',
          ],
        },
        {
          term: 'BDD og UML-klassediagram',
          body: [
            'BDD er *modified from UML 2*: blokke i stedet for klasser, og de kan være alt fra software til mekanik. Der er porte og values med enheder, og diagramrammen har headeren `bdd [block] Camera [Hierarchical system structure]`. Klassediagrammet til software står i [[swd/uml-klassediagram|UML-klassediagrammer]].',
            '**Sem4-reglen om aggregation:** i UML-klassediagrammer er den hule diamant forbudt (studie-figurer, R-CLS-03; sem4/CLAUDE.md) — SW4SWD-materialet kalder den med Fowler “strictly meaningless”. I SysML BDD er den lovlig: Quick Guide viser den som en variant af reference association med samme betydning som ingen diamant. Tegn derfor kun den hule diamant i et BDD — og kun hvis I kan forklare, at den betyder *reference*, ikke *del af*.',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'At tegne forbindelser (connectors) i BDD’et: Brightspace-øvelsen siger direkte, at det er normalt i første udkast, og at forbindelserne skal skilles ud i et separat IBD. Andre: porte på helheden, som ingen part realiserer; to blokke for det, der er én type med to parts (Parkeringsautomatens `Button` med `btRed`/`btGreen`); og en `~`, der sidder i den forkerte ende.',
          ],
        },
      ],
      viz: 'prj-bdd',
      keyPoints: [
        'Blok = type (som en klasse). Part = en brug af typen inde i en anden blok.',
        'Komposition: udfyldt diamant ved helheden; multiplicitet og part-navn ved delen.',
        '`1..2` og to navngivne parts (`leftWing`, `rightWing`) er to måder at sige det samme.',
        'Porte defineres i ports-compartmentet med `in`/`out`/`inout` og `~` for konjugeret.',
        'Blokkens egne porte skal realiseres af en part.',
        'Hul diamant: forbudt i UML-klassediagrammer i sem4, lovlig i SysML BDD (= reference).',
        'BDD viser typer og komposition — forbindelser hører til i IBD’et.',
      ],
      code: [
        {
          lang: 'text',
          title: 'En blok med compartments (Aircraft)',
          source: 'SysML Structural Diagrams 1.pdf, slide 7',
          code: `«block»
Aircraft
─────────────────────────────
parts
  wings: Wing[2]
  cockpit: Cockpit
─────────────────────────────
ports
  fuelReceptible: Fuel
  weaponsInterface: MIL-STD-1760 Bus
─────────────────────────────
values
  weight : kg
  bureauNumber:: String = "UNKNOWN"`,
        },
      ],
      exam: [
        '“Hvad er forskellen på en blok og en part?” — blokken er typen, defineret én gang i BDD’et; en part er en brug af typen i en bestemt rolle. Vores `Boks` er én blok, men fire parts.',
        '“Hvorfor står der ingen forbindelser i jeres BDD?” — fordi BDD’et kun viser typer og komposition. Hvordan delene er koblet, står i IBD’et, som altid hører til en blok fra BDD’et.',
        '“Hvad betyder tilden på porten?” — den er konjugeret: flow-specifikationens in og out er byttet om, så den ene ende sender det, den anden modtager.',
        '“Hvorfor bruger I ikke den hule diamant?” — i klassediagrammer er den forbudt hos os, fordi dens betydning afhænger af modelløren. I SysML er den lovlig og betyder det samme som en almindelig reference; vi har kun brug for komposition.',
      ],
      sources: [
        { path: k('05-sysml/sysml-structural-diagrams-1-bdd.md'), original: 'SysML Structural Diagrams 1.pdf', pages: 'slide 3–16' },
        { path: k('05-sysml/sysml-introduction.md'), original: 'SysML Introduction (F24).pdf', pages: 'slide 4–10' },
        { path: k('05-sysml/sysml-quick-guide.md'), original: 'SysMLQuickGuide.pdf', pages: 's. 1–5 (tabel A.3–A.5)' },
        { path: k('05-sysml/sysml-structural-diagrams-2-ibd.md'), original: 'SysML Structural Diagrams 2.pdf', pages: 'slide 16, 21, 23' },
        { path: k('05-sysml/sysml-structural-diagrams-3.md'), original: 'SysML Structural Diagrams 3.pdf', pages: 'slide 9 + Brightspace L8' },
        { path: k('05-sysml/beosound-f-bdd-ibd.md'), original: 'BeosoundF BDD.pdf', pages: 's. 1' },
        { path: k('05-sysml/oevelse-parkeringsautomat.md'), original: 'Parkeringsautomat_BDD_Løsning1.pdf', pages: 's. 1' },
        { path: k('05-sysml/eksamensopgave-f2015-smartfridge.md'), original: 'SYSMLBDDSmartFridgeSolution.pdf', pages: 's. 1' },
        { path: k('bog/05-friedenthal-ch3-sysml.md'), original: 'Friedenthal m.fl., A Practical Guide to SysML, kap. 3 (ISE-kompendiet)', pages: 's. 34–52 (fig. 3.8)' },
        { path: FIGURREGLER, note: 'Sem4-regel: aggregation forbudt i UML-klassediagrammer (R-CLS-03)' },
        { path: 'CLAUDE.md', note: 'Sem4-regel: aggregation forbudt i UML-klassediagrammer, lovlig i SysML BDD' },
      ],
      gaps: [
        'Structural Diagrams 2, slide 23 siger: “Flow ports (but not flows) can be used on BDDs according to the SysML standard, but we never do it here at ASE!” — men slide 16 siger, at porte *defineres* på BDD’et, og alle kursets løsninger (Pakkeboksen, SmartFridge, Access Control) har ports-compartments. Den mest sandsynlige læsning er, at port-*symbolerne* ikke tegnes på BDD’et, kun teksten. Materialet siger det ikke eksplicit.',
        'Generalisering og reference association findes kun i Quick Guide og Friedenthal; slides og øvelser bruger kun komposition.',
        'Materialet siger ikke, hvornår man bør bruge multiplicitet frem for navngivne parts; det viser kun, at begge er lovlige.',
      ],
      keywords: ['BDD', 'bdd', 'Block Definition Diagram', 'blok', 'block', 'compartment', 'parts', 'values', 'ports', 'komposition', 'composition', 'whole-part', 'multiplicitet', 'multiplicity', 'part name', 'generalisering', 'generalization', 'reference association', 'aggregation', 'hul diamant', 'flowSpecification', 'konjugeret', 'conjugated', '«system of interest»', 'Aircraft', 'Access Control System'],
    },

    {
      slug: 'sysml-ibd',
      title: 'SysML Internal Block Diagram (IBD)',
      short: 'SysML IBD',
      week: 'Arkitekturfasen',
      definition:
        'Et **Internal Block Diagram** viser det indre af *én* blok fra BDD’et: dens **parts**, **porte**, **connectors** mellem portene og de **item flows**, der løber over dem. BDD’et er ingredienslisten, IBD’et er fremgangsmåden.',
      intro: [
        'Et IBD laves aldrig “i tom luft”: rammen *er* en blok fra BDD’et, og hver part er en brug af en af blokkens dele. Brightspace-billedet: først placeres komponenterne på printpladen (BDD), så tegnes ledningsføringen (IBD).',
      ],
      concepts: [
        {
          term: 'Parts: navn og type',
          body: [
            'En part skrives `navn : Blok`. En unavngiven part er `: Cockpit`; en navngiven er `eng : Engine`. En multiplicitet på BDD’et bliver til flere parts: `wings` med multiplicitet 2 bliver `wings[0]` og `wings[1]`, og User Interface’s `leds` bliver `leds[1] : Led` og `leds[2] : Led`.',
          ],
        },
        {
          term: 'Connectors og item flows',
          body: [
            'En **connector** siger kun, at to parts (eller porte) er forbundet — intet om hvad der løber. Et **item flow** skriver det på ledningen: item-type plus retning, tegnet som en udfyldt trekant på connectoren, fx `touchEvent: RS232` fra Keypad til Micro Controller. Et item kan være fysisk, information eller energi.',
          ],
        },
        {
          term: 'Flow ports: atomiske og ikke-atomiske',
          body: [
            'En **atomic flow port** fører én simpel item-type ind, ud eller begge veje (`in`, `out`, `inout`). En **nonatomic flow port** samler flere ting og er typet af en `«flowSpecification»` på BDD’et (fx `DoorCtrl` med `unlock`, `openDoor` og `status`). En **konjugeret** port vender flowretningerne: den ene side sender kommandoer, den anden fortolker dem.',
            'Kurset fokuserer på flow ports. **Standard ports** (service-baserede, med *provided* og *required* interfaces som ball og socket) findes i Quick Guide, men bruges ikke i øvelserne.',
          ],
        },
        {
          term: 'ASE-reglerne for porte på IBD’et',
          body: [
            '`in`, `out` og `inout` skrives **aldrig** på IBD’et — pilesymbolet i portkassen siger det. `~` skrives heller ikke; en konjugeret port tegnes med det *negative* (skyggede) dobbeltpil-symbol. Er der flow ports, skal der være en port i begge ender, og retningerne skal give mening.',
            'Kompatibilitet: en connector må kun forbinde porte med samme item-type og passende retning — `Light` → `Light` er rigtigt, `Light` → `MPEG4` er forkert. Portnavnene behøver ikke være ens: Keypad’s `key : string` går til Control’s `keyVal : string`.',
          ],
        },
        {
          term: 'Ydre porte og ét IBD pr. formål',
          body: [
            'Blokkens egne porte står på IBD-rammen og forbindes til den part, der realiserer dem. En konjugeret port gentages udadtil: `doorCtrl` på Control går ud til `doorCtrl` på rammen. Kontekst-IBD’et (System Context) viser systemet som én part blandt Access Card, Door og User.',
            'Tegn hellere flere fokuserede IBD’er end ét stort: Aircraft deles i *[Cockpit stick controls]* og *[Cockpit throttle controls]*, og Gas Station tegner Gas Dispensers indre én gang i sit eget IBD i stedet for tre gange.',
          ],
        },
        {
          term: 'Eksempel: Pakkeboksen',
          body: [
            'Øvelse B i PRJ4 giver blokke og porte i en tabel og beder om BDD og derefter IBD for `Pakkeboksen`. USB, SPI og Wi-Fi er ikke-atomiske og “kendte”; `BOX` er ikke-atomisk (åbn/lås ud, åben/lukket og tom ind); resten (`HDMI`) er atomisk. Computer er navet: HDMI og USB til Touchskærm, USB til Printer, SPI til Boksstyring, og Boksstyring har `lock[4]: ~BOX` til de fire bokse. Pakkeboksens egen port `net: Wi-Fi` realiseres af Computer.',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'Materialets egne løsninger har fejlen: i ibd Access Control System går `red`-porten til den grønne LED og omvendt (Structural 3, slide 11). Andre: forbindelser mellem porte med forskellig type, parts der ikke findes i BDD’et, `in`/`out` skrevet på IBD’et, gentagne indre strukturer og ydre porte, som ingen part er forbundet til.',
          ],
        },
      ],
      viz: 'bdd-ibd',
      keyPoints: [
        'Et IBD hører altid til én blok fra BDD’et; rammen er blokken.',
        'Part = `navn : Blok`; multiplicitet 2 giver `x[1]` og `x[2]`.',
        'Connector = forbundet. Item flow = hvad der løber og i hvilken retning.',
        'Atomisk port: én item-type. Ikke-atomisk: `«flowSpecification»`. Konjugeret: retninger byttet.',
        'På IBD’et: ingen `in`/`out`/`inout` og ingen `~` — symbolet siger det.',
        'Forbind kun porte med samme type. Portnavne må være forskellige.',
        'Ydre porte på rammen realiseres af en part. Ét IBD pr. formål.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Pakkeboksen: blokke og porte (øvelse B)',
          source: 'Afleveringsopgave B - Pakkeboksen.pdf, s. 2 (opgave 1)',
          code: `Pakkeboksen   inout net: Wi-Fi
Touchskærm    in disp: HDMI        inout touch: ~USB
Printer       inout printer: ~USB
Computer      inout net: Wi-Fi     inout printer: USB    out disp: HDMI
              inout controller: SPI                      inout touch: USB
Boksstyring   inout ctrl: ~SPI     inout lock[4]: ~BOX
Boks          inout lock: BOX      (4 bokse)`,
        },
      ],
      exam: [
        '“Hvorfor er det her et IBD og ikke et BDD?” — det viser forbindelser mellem parts inde i én blok, med porte og flows. BDD’et viser kun, hvilke blokke der findes, og hvem der består af hvem.',
        '“Hvor kommer portene fra?” — de er defineret på blokkene i BDD’et; IBD’et bruger dem og forbinder dem. Rammens porte er blokkens egne og realiseres af en part.',
        '“Hvorfor står der ikke in og out?” — på IBD’et viser portsymbolet retningen, og en konjugeret port har det skyggede symbol i stedet for tilde. Sådan er ASE-konventionen.',
        '“Hvordan ved I, at forbindelsen er rigtig?” — begge ender har samme type, og retningerne passer: en out mod en in, eller en port mod sin konjugerede.',
        'Vi har delt IBD’et op efter formål, så hvert diagram kan læses for sig.',
      ],
      sources: [
        { path: k('05-sysml/sysml-structural-diagrams-2-ibd.md'), original: 'SysML Structural Diagrams 2.pdf', pages: 'slide 3–25' },
        { path: k('05-sysml/sysml-structural-diagrams-3.md'), original: 'SysML Structural Diagrams 3.pdf', pages: 'slide 3–12 + Brightspace L8' },
        { path: k('05-sysml/oevelse-access-control-ibd.md'), original: 'AccessControlSystem_IBD.pdf', pages: 's. 1' },
        { path: k('05-sysml/beosound-f-bdd-ibd.md'), original: 'BeoSoundF_BDD_IBD.pdf', pages: 'slide 2–3' },
        { path: k('05-sysml/eksamensopgave-f2015-smartfridge.md'), original: 'SYSMLIBDSmartFridgeSolution.pdf', pages: 's. 1' },
        { path: k('00-kursus/afleveringsopgave-b-pakkeboksen.md'), original: 'Afleveringsopgave B - Pakkeboksen.pdf', pages: 's. 1–2' },
        { path: k('05-sysml/sysml-quick-guide.md'), original: 'SysMLQuickGuide.pdf', pages: 's. 6–7 (tabel A.8–A.9)' },
      ],
      gaps: [
        'Materialet har ingen løsning til Pakkeboksens IBD (øvelse B, opgave 2). Figuren er en afledning af opgavens porttabel; forbindelserne følger af typerne, men part-navnene på de fire bokse er ikke givet, så de står som `: Boks`.',
        'Standard ports (provided/required interfaces) står kun i Quick Guide. Materialet viser aldrig, hvordan en software-grænseflade modelleres i et IBD.',
        'BeoSound F-IBD’et har hverken porte eller item flows, mens slides kræver porte i begge ender, “if you use flow ports”. Materialet siger ikke, hvornår et IBD uden porte er godt nok.',
        'Kendt tegnefejl i materialet: krydsede LED-porte i ibd Access Control System (Structural 3, slide 11) og i Parkeringsautomatens User Interface-IBD.',
      ],
      keywords: ['IBD', 'ibd', 'Internal Block Diagram', 'part', 'instans', 'connector', 'item flow', 'flow port', 'atomic', 'nonatomic', 'atomisk', 'ikke-atomisk', 'flowSpecification', 'konjugeret', 'conjugated', 'standard port', 'ydre port', 'boundary port', 'Pakkeboksen', 'Access Control System', 'SmartFridge', 'BeoSound F', 'Gas Station'],
    },

    {
      slug: 'graenseflader',
      title: 'Grænseflader: specifikation, kobling og samhørighed',
      short: 'Grænseflader',
      week: 'Arkitekturfasen',
      definition:
        'En **grænseflade** (interface) er forbindelsespunktet mellem to blokke. Den skal specificeres i begge ender — type, elektriske krav, timing, data — så delene kan designes, testes og udvikles hver for sig. Et godt design har **lav kobling** mellem blokkene og **høj samhørighed** i dem.',
      intro: [
        'System Design and Interfaces åbner med pointen: uden grænsefladernes specifikation kan man hverken designe, teste eller udvikle systemet (slide 1). Grænsefladerne er også der, hvor et projekt deles mellem folk: rapportskabelonen siger, at et delsystem kun må kende de andre delsystemers grænseflade, som den står i arkitekturen.',
      ],
      concepts: [
        {
          term: 'Fem trin til at specificere grænseflader',
          body: [
            '1) Start med kontekst, BDD og IBD. 2) Definér de **ydre porte** på IBD’et. 3) Definér de **indre porte** med `navn:type`. 4) Beskriv funktionen for hver blok. 5) Specificér kravene til grænsefladerne mellem parts — elektriske krav for alle porte på alle blokke, i en tabel — og **tjek at de passer sammen**.',
          ],
        },
        {
          term: 'Portspecifikationstabellen',
          body: [
            'Kolonnerne er *Name of Block · Description of function · Port Name · Type · Port Specification*. Measurement Instrument: `220V` (AC, 200–250 V RMS, 50 Hz, strømbegrænsning 100 mA), `Sensor` (analog, differentiel, ±100 µV, 50 Ω), `Trigger` (digital, low < 0,8 V, high > 2,0 V), `Computer` (USB 2.0).',
            'Slides’ egne kontrolspørgsmål viser, hvorfor tabellen skal læses på tværs: ProcessorBoard trækker op til 600 mA, men PowerSupply’s 5 V-udgang giver højst 500 mA; forstærkerens udgang har 500 Ω, ADC-indgangen 5 Ω — og *“Rin = Rout is best”*.',
          ],
        },
        {
          term: 'Typekategorier og signaler',
          body: [
            'Kursets typekategorier: **Signals** (analog, digital), **Standards** (USB, RS232, HDMI, SPI, I2C, TTL, CMOS), **Network** (Ethernet, Wireless, Internet, Profinet), **Information** (file, image, string, barcode, bytes, bool), **Supply** (DC, AC) og andet (force, light, sound, liquid).',
            'Elektriske signaler specificeres med spænding og tolerance, maksimal strøm og impedans. Logikniveauer: TTL (ved 5 V) kræver input high ≥ 2 V og low ≤ 0,8 V; CMOS high ≥ 70 % og low ≤ 30 % af Vcc. RS-232 bruger ±12 V og er logisk inverteret.',
          ],
        },
        {
          term: 'Når IBD’et ikke er nok: timing',
          body: [
            'Et IBD med `rd\'/wr`, `enable`, `addr[12]` og `data[8]` fortæller hvilke ledninger der er, men ikke hvornår de er gyldige. Til HW–SW-grænsefladen skal der et **timing-diagram** til: Vahid’s bus-læsning sætter `rd\'/wr` = 0, lægger en gyldig adresse, strober `enable`, og data er gyldige efter `t_setup` + `t_read`.',
            'Vahid skelner mellem **strobe** (fast tid, ingen bekræftelse) og **handshake** (`req`/`ack`, tilpasser sig en langsom modpart), og mellem **polling** og **interrupts**. Den slags valg står i grænsefladespecifikationen; drivere og interrupts i dybden hører til SW3SYS (Systemprogrammering).',
          ],
        },
        {
          term: 'Kobling og samhørighed',
          body: [
            '**Coupling** måler, hvor afhængigt et modul er af andre. Høj kobling gør systemet svært at debugge, fejlfinde, vedligeholde og udvide. Rådene: fjern afhængigheder, minimér informationsudvekslingen, ingen globale variabler, hold det simpelt. Peckol: eliminér unødvendig interaktion, minimér den nødvendige, og løsn den, hvor det kan lade sig gøre.',
            '**Cohesion** måler, hvor godt ét ansvar er samlet i ét modul. Peckol rangerer syv typer fra bedst til værst: functional, sequential, communicational, procedural, temporal, logical og coincidental. I applikationsmodellen giver én controller pr. use case høj samhørighed. Softwareversionen af det samme er [[swd/srp|SRP]], [[swd/isp|ISP]] og [[swd/dip|DIP]].',
          ],
        },
        {
          term: 'RVM: tre arkitekturer at diskutere',
          body: [
            'Slides viser tre BDD’er for en Reverse Vending Machine. **1:** alt hænger på én `Computer` (stjerne). **2:** ingen central computer, blokkene deler en bus, og Display og Buttons er slået sammen til `Touch-Display`. **3:** få store sammenlagte enheder — lav kobling *mellem* dem, men lav samhørighed *i* dem, og en fejl i én enhed kræver udskiftning af det hele.',
          ],
        },
        {
          term: 'Artefaktet og typiske fejl',
          body: [
            'I rapporten hører grænsefladerne til i arkitekturkapitlet (4.4.2 *Interfaces og protokoller*) og i delsystemkapitlerne, der kun må bruge den del af de andre delsystemer, som står i grænsefladen. For HW: IBD plus portspecifikationstabel plus timing-diagram, hvor timing betyder noget.',
            'Typiske fejl ifølge slides: en specifikation, der kun er skrevet fra den ene ende, så strøm og impedans ikke passer; et IBD uden timing, hvor timingen er afgørende; og en arkitektur med høj kobling (globale variabler, informationsudveksling på kryds og tværs).',
          ],
        },
      ],
      viz: 'prj-portspec',
      keyPoints: [
        'Specificér grænsefladen i begge ender, og tjek at de passer (strøm, spænding, impedans, type).',
        'Portspecifikation: blok · funktion · port · type · specifikation.',
        'IBD viser forbindelser, ikke timing — brug timing-diagram til HW–SW-grænseflader.',
        'Lav kobling mellem blokke, høj samhørighed i dem.',
        'Functional cohesion er bedst, coincidental værst (Peckol).',
        'Et delsystem kender kun de andre delsystemers grænseflade.',
      ],
      exam: [
        '“Hvordan har I sikret, at jeres blokke kan tale sammen?” — hver port er specificeret i en tabel med type og elektriske krav, og vi har tjekket hver forbindelse fra begge ender: spænding, maksimal strøm og impedans.',
        '“Hvad betyder det, at et system har høj kobling?” — at modulerne er meget afhængige af hinanden, så en ændring eller fejl ét sted spreder sig. Det gør systemet sværere at teste, vedligeholde og udskifte dele i. Det var et spørgsmål til den gamle ISE-eksamen (F2015, opg. 1b).',
        'Høj samhørighed i blokkene giver lavere kobling i systemet, fordi hvert ansvar kun ligger ét sted og derfor kun skal tilgås gennem én grænseflade.',
        'IBD’et viser, hvilke signaler der er; timingen står i et timing-diagram, fordi det er den, softwaren skal overholde.',
      ],
      sources: [
        { path: k('06-arkitektur-og-design/system-design-and-interfaces.md'), original: 'System Design and Interfaces-F21.pdf', pages: 'slide 1–20' },
        { path: k('06-arkitektur-og-design/system-architecture-and-design.md'), original: 'System Architecture and Design.pdf', pages: 'slide 6–17' },
        { path: k('bog/08-peckol-ch9-system-design.md'), original: 'Peckol, Embedded Systems Design, kap. 9 (ISE-kompendiet)', pages: 's. 367–368, 376–379' },
        { path: k('bog/09-vahid-ch6-interfacing-137-153.md'), original: 'Vahid & Givargis, Embedded System Design, kap. 6 (ISE-kompendiet)', pages: 's. 137–153' },
        { path: k('05-sysml/eksamensopgave-f2015-smartfridge.md'), original: 'I2ISE Eksamensopgave F2015.pdf', pages: 's. 1 (opg. 1b)' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 15–22' },
      ],
      gaps: [
        '“Specifying SW interfaces — later in course” (System Design and Interfaces, slide 3): materialet viser aldrig en egentlig software-grænsefladespecifikation. Nærmest kommer rapportskabelonens JSON-eksempler og Observer-frameworket.',
        'Løsningen til ADC- og ProcessorBoard-portene (`System Design and Interfaces with Solution.pdf`) er ikke i materialet. Figuren bruger kun værdierne fra slide 12 og noterne på slide 14; ADC’s strømkrav er ukendt.',
        'Slides nævner tre cohesion-typer (functional, sequential, communication), Peckol syv. Slides’ eksamenssvar nævner desuden “logisk sammenhæng” som noget positivt, mens Peckol rangerer logical cohesion næsten nederst.',
      ],
      keywords: ['grænseflade', 'interface', 'port', 'portspecifikation', 'port specification', 'name:type', 'coupling', 'kobling', 'cohesion', 'samhørighed', 'TTL', 'CMOS', 'RS-232', 'impedans', 'timing diagram', 'strobe', 'handshake', 'polling', 'interrupt', 'Measurement Instrument', 'RVM', 'Reverse Vending Machine', 'functional cohesion'],
    },

    {
      slug: 'protokoller',
      title: 'Protokoller: OSI, UART/I2C/SPI og HTTP',
      short: 'Protokoller',
      week: 'Arkitekturfasen',
      definition:
        'En **protokol** er reglerne for at udveksle information over en grænseflade: hvordan de fysiske signaler skal fortolkes. Grænsefladen er forbindelsespunktet (USB, RS232, SPI, I2C, UART); protokollen er ét trin op og skal specificere grænsefladen entydigt.',
      intro: [
        'I projektet skal I finde den rigtige grænseflade mellem hvert led og beslutte pakkestrukturen for den (Protocols, slide 10). Valget laves som en *teknisk analyse*, og resultatet dokumenteres i arkitekturkapitlet: hvilken protokol på hvilken forbindelse, og hvordan beskederne ser ud.',
      ],
      concepts: [
        {
          term: 'Lag: fysisk, logisk, software',
          body: [
            'Kommunikation er lagdelt: hvert lag hos A taler logisk med det tilsvarende lag hos B, mens data reelt går ned gennem stakken, over den fysiske forbindelse og op igen. I software svarer det til en *protocol stack* af boundary-klasser. Vahid: lagdeling deler protokollens kompleksitet i uafhængige stykker — lavere lag leverer services til højere.',
          ],
        },
        {
          term: 'OSI og TCP/IP',
          body: [
            'OSI har syv lag: 7 Application (fx HTTP), 6 Presentation, 5 Session, 4 Transport (TCP, UDP), 3 Network (adresser, routing), 2 Data Link (frames, fejlfri overførsel), 1 Physical (bits over kanalen). TCP/IP-modellen samler dem i fire: Application (HTTP), Transport (TCP/UDP), Internet (IPv4/IPv6) og Link (Ethernet, driver). Hvert lag lægger sin header på: UDP-data i en IP-pakke i en frame.',
            'Ethernet-frame: preamble (7 B) og SFD, destinations- og kilde-MAC (6 B hver), evt. VLAN-tag, type (2 B), payload 46–1500 B med padding og CRC (4 B); 64–1518 B i alt. Peckol tilføjer, at netværkslaget og nedefter er hardwarenært, de øvre lag software.',
          ],
        },
        {
          term: 'UART, I2C og SPI',
          body: [
            '**UART** er seriel, asynkron og full-duplex med to datalinjer (TX, RX, krydsforbundet) og fælles GND. En frame er start-bit (0), 5–9 databits, valgfri paritet og stop-bit (1); modtageren sampler midt i hver bit. **I2C** er en tolednings-bus (SCL, SDA med pull-ups) med master og flere slaves på hver sin adresse; en transaktion er START, 7 adressebits, R/W, ACK, 8 databits, ACK, …, STOP. **SPI** har én master og separate `SS`-linjer pr. slave, sender og modtager samtidigt på `MOSI` og `MISO` taktet af `SCLK`, og er den hurtigste.',
            'Slides’ sammenligning: UART simpel, langsomst, 2 enheder, full duplex; I2C let at kæde, op til 127 enheder, 2 ledninger, half duplex; SPI hurtigst, mange enheder, 4 ledninger, full duplex, én master.',
          ],
        },
        {
          term: 'Wi-Fi og HTTP',
          body: [
            'Wi-Fi (IEEE 802.11) etablerer kun forbindelsen; det henter ikke data og laver ikke en webside. Dertil skal der en protokol mere: **HTTP**. Et request har en metode (fx `GET`), en host-URL (fx Pi’ens adresse) og en endpoint-path (fx `/tempsensor/`). HTTP og REST i dybden: [[bad/http|HTTP og web-arkitektur]] og [[bad/rest|REST og CORS]].',
          ],
        },
        {
          term: 'Fejl og pålidelighed',
          body: [
            'Vahid: **paritet** (én bit pr. ord) fanger altid én bitfejl, men ikke et lige antal; **checksum** (fx XOR af alle ord, ét ekstra ord pr. pakke) er stærkere. Fejl rettes typisk med **acknowledgment og retransmission**. Peckol skelner mellem forbindelsesorienteret (pålidelig, rækkefølge bevares) og forbindelsesløs kommunikation (best effort), og mellem datagram, acknowledged datagram og request-reply — det sidste er client-server.',
          ],
        },
        {
          term: 'Hvordan man vælger',
          body: [
            'Slides’ opskrift: tjek at komponenten understøtter grænsefladen (databladet); studér grænsefladen; vurdér kompleksitet mod den funktionalitet og performance systemet kræver; angiv referencer; og **lav en teknisk analyse for grænsefladerne**. Arduino Mega 2560 har SPI, 4 UART og I2C; Raspberry Pi har UART, SPI og I2C, og nogle modeller Wi-Fi og Bluetooth.',
          ],
        },
        {
          term: 'Hvordan man dokumenterer',
          body: [
            'Rapportskabelonen (Drinkbot 4000): deployment-diagrammet mærker hver forbindelse med sin protokol (`«protocol» HTTP/TCP/IP`, `RFID-protokol/I2C`, `skænkningsprotokol/UART`). I 4.4.2 beskrives hver egen protokol: fysisk lag og baudrate (UART, 115200), rammen (`preamble 0x55 | payload | postamble 0x88`) og pakketyperne. Web-grænsefladen beskrives som REST over HTTPS med JSON-formatet for request og response.',
          ],
        },
      ],
      viz: 'prj-seriel',
      keyPoints: [
        'Grænseflade = forbindelsespunktet. Protokol = reglerne for at fortolke det, der sendes.',
        'OSI har 7 lag, TCP/IP 4; hvert lag tilføjer sin header.',
        'UART: asynkron, TX/RX, start- og stop-bit. I2C: SCL/SDA, adresse og ACK. SPI: SCLK/MOSI/MISO/SS, hurtigst.',
        'Wi-Fi giver forbindelsen, HTTP henter data.',
        'Paritet, checksum og ack/retransmission gør overførslen pålidelig.',
        'Vælg ud fra datablad, kompleksitet og performance, og dokumentér valget som teknisk analyse.',
        'Dokumentér egne protokoller med fysisk lag, ramme og pakketyper.',
      ],
      code: [
        {
          lang: 'text',
          title: 'En egen protokol dokumenteret i rapporten (Drinkbot 4000)',
          source: 'report_template.pdf, afsnit 4.4.2, figur 4.5 (s. 15–21)',
          code: `Skænkningsinterface: UART, 115200 baud

ramme:  preamble 0x55 | payload | postamble 0x88

payload:
  type          length      data
  start (0x00)  2 [bytes]   mængde [g]
  stop  (0x01)  0 [byte]    «»
  status (0x02) 1 [byte]    okay (0x12) | dead (0x34)`,
        },
      ],
      exam: [
        '“Hvorfor valgte I I2C til sensoren?” — sensoren understøtter det ifølge databladet, der skal flere enheder på bussen, og hastigheden er nok. SPI er hurtigere, men kræver flere ledninger og en select-linje pr. enhed. Valget står i vores tekniske analyse.',
        '“Hvad er forskellen på en grænseflade og en protokol?” — grænsefladen er forbindelsespunktet, fx UART-benene; protokollen er reglerne for, hvordan bitsene fortolkes, fx vores ramme med preamble, type og data.',
        '“Hvor i OSI-modellen ligger jeres protokol?” — den bygger på UART som fysisk lag og definerer selv rammer og beskedtyper ovenpå. HTTP ligger i applikationslaget oven på TCP/IP.',
        '“Hvad sker der, hvis en byte bliver ødelagt?” — det skal protokollen svare på: paritet eller checksum til at opdage fejlen, og acknowledgment og gensendelse til at rette den.',
      ],
      sources: [
        { path: k('12-protokoller/swise-protocols.md'), original: 'SWISE_Protocols.pdf', pages: 'slide 2–30 (PDF-sidenumre)' },
        { path: k('06-arkitektur-og-design/system-design-and-interfaces.md'), original: 'System Design and Interfaces-F21.pdf', pages: 'slide 10, 19' },
        { path: k('bog/10-vahid-ch6-interfacing-166-169.md'), original: 'Vahid & Givargis, Embedded System Design, kap. 6 (ISE-kompendiet)', pages: 's. 166–169' },
        { path: k('bog/11-peckol-ch16-7-network-architecture.md'), original: 'Peckol, Embedded Systems Design, kap. 16.7 (ISE-kompendiet)', pages: 's. 627–637' },
        { path: k('13-rapport/rapportskabelon-au-ece.md'), original: 'report_template.pdf', pages: 's. 15–21' },
      ],
      gaps: [
        'Slide 22 skriver “# of wires” 1 for UART og 4 for SPI, mens slide 15 og 17 siger to datalinjer (TX, RX) for UART og seks forbindelser for SPI (inkl. 3V3 og GND). Tabellen tæller tilsyneladende kun signallinjer i én retning hhv. uden forsyning.',
        'Peckol skriver, at TCP/IP “usually” fremstilles med fem lag, men tegner fire; slides bruger fire.',
        'Protocols-slide 19: figurteksten siger “SPI”, men figuren viser I2C (SCL/SDA med pull-ups).',
        'Materialet angiver ikke bitrækkefølgen for SPI. UART sender LSB først (System Design and Interfaces, slide 10), I2C D7 først (samme deck, slide 19).',
        'Protokol-decket er lavet til PRJ2 (Arduino Mega/PSoC som “MUST”). Web-protokoller kaldes 3.-semesterstof og gennemgås ikke; de undervises i SW4BAD og KNP (Kommunikationsnetværk), som endnu ikke er i opslagsværket.',
      ],
      keywords: ['protokol', 'protocol', 'interface', 'OSI', 'TCP/IP', 'UDP', 'Ethernet', 'frame', 'UART', 'I2C', 'I²C', 'SPI', 'MOSI', 'MISO', 'SCL', 'SDA', 'duplex', 'full duplex', 'half duplex', 'Wi-Fi', 'HTTP', 'GET', 'paritet', 'parity', 'checksum', 'acknowledgment', 'client-server', 'teknisk analyse', 'Arduino', 'Raspberry Pi', 'baud'],
    },
  ],
}
