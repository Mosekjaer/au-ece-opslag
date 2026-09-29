import type { Part } from '../types'
import { m } from './paths'
import { solidB } from './p2-solid-b'

const HFDP = 'swd/kilder/bog/SWD_Head-First-Design-Patterns-2nd-Edition.pdf'

export const solid: Part = {
  id: 'solid',
  title: 'Design smells og SOLID',
  topics: [
    {
      slug: 'design-smells',
      title: 'Design smells og teknisk gæld',
      short: 'Design smells',
      week: 'Uge 2 · W02a',
      definition:
        'En **design smell** er et symptom på, at designet er ved at rådne: koden virker måske endnu, men strukturen kan ikke længere bære ændringer. Kurset navngiver syv: **rigidity**, **fragility**, **immobility**, **viscosity**, **needless complexity** (YAGNI), **needless repetition** (DRY) og **opacity**. Bag dem ligger *software rot*: kravene ændrer sig uventet, designet understøtter det ikke, og ændringerne hackes ind.',
      intro: [
        'Ugeplanen for uge 2 sætter rammen: først hvad der kendetegner “dårlig” software, og hvordan man undgår almindelige fejl, dernæst SOLID-principperne, som kurset kalder fundamentet for alle de øvrige designs. Smells er diagnosen; [[srp|SRP]], [[ocp|OCP]] og resten af SOLID er de principper, resten af kurset bygger på, og [[refactoring|refactoring]] er behandlingen.',
      ],
      concepts: [
        {
          term: 'Technical debt',
          body: [
            'Forelæsningen åbner med en tegneserie med titlen *Technical Debt*: et hus med revnede mure, skæve støttebjælker og en paraply stukket ind i taget. En håndværker siger, at han ikke forstår, hvorfor det tager så lang tid at sætte et nyt vindue i. Den, der bestiller ændringen, ser kun vinduet; den, der udfører den, ser alt det, vinduet skal ind i.',
            'Forelæsningen slutter samme sted. Slide 9 citerer: får du dagens arbejde gjort på en måde, der gør morgendagens arbejde umuligt i morgen, så har du tabt. Tweetet tilskriver citatet Martin Fowlers *Refactoring*, og Fowler svarer selv, at det er Kent Becks, fra en sidebar han skrev i bogen.',
          ],
        },
        {
          term: 'Software rot: what, why, how',
          body: [
            '**What:** “Inability to continuously support product”. **Why:** designet understøtter ikke (uventede) ændringer i kravene. **How:** de uventede ændringer hackes ind i den eksisterende kode.',
            'Læs kæden bagfra: kravet ændrer sig, designet kan ikke tage det, ændringen hackes ind, strukturen forringes en smule — og efter nok hacks kan produktet ikke længere vedligeholdes løbende. Det er netop det, [[ocp|OCP]] adresserer: at gøre designet i stand til at tage ændrede krav som udvidelser.',
          ],
        },
        {
          term: 'Rigidity og fragility',
          body: [
            '**Rigidity.** Symptom: tilsyneladende simple ændringer giver en kaskade af ændringer i relaterede komponenter. Problem: ledere og programmører tør ikke lave ikke-kritiske ændringer. Slidens eksempel: “I just needed to change A”, men B havde hårdkodede forventninger til A, når den brugte C og D — så B, C og D skulle også ændres.',
            '**Fragility.** Symptom: at rette ét problem introducerer flere. Problem: softwaren er umulig at vedligeholde, fordi programmørerne ikke kan stole på, at der ikke indføres fejl. Eksemplet: rettelsen af A så simpel ud, men B gik i stykker, og rettelsen af B knækkede C og D.',
            'Forskellen: ved rigidity *kræver* en ændring andre ændringer; ved fragility *knækker* en ændring noget andet. Begge handler om, at en ændring breder sig ud over det sted, den var tiltænkt. [[ocp|OCP]]-eksemplet med `Editor` og storage er den samme mekanik i kode: et nyt lager tvang ændringer ind i `Editor`.',
          ],
        },
        {
          term: 'Immobility og viscosity',
          body: [
            '**Immobility.** Symptom: en komponent kunne genbruges et andet sted, men afhænger af for meget “bagage”. Problem: komponenter genbruges ikke, de skrives om. Eksemplet: `Calendar`-klassen har generisk funktionalitet, men afhænger af RTC-chippen DS1339A, så softwaren kan ikke genbruges.',
            '**Viscosity.** Et problem kan som regel løses på flere måder; nogle bevarer designet, andre er hacks. Symptom: det er nemmere at hacke end at bevare designet. Problem: softwaren degenererer under hacks, workarounds og genveje. Eksemplet: det er så meget hurtigere at sætte et `#ifdef` ind end at redesigne komponenten.',
          ],
        },
        {
          term: 'Needless complexity (YAGNI) og needless repetition (DRY)',
          body: [
            '**Needless complexity:** systemet er “overengineered” for at tage højde for mulige fremtidige ændringer — og sliden tilføjer “there is a balance”. Eksemplet: `Report`-klassen bruger en XML-fil og er forberedt på printer, talesyntese, røgsignaler, morse og telepati. YAGNI går igen fra XP, hvor værdien *Simplicity* lyder “start with the simplest solution”, se [[xp|XP]].',
            'Balancen er den samme, som *Head First Design Patterns* beskriver om [[ocp|OCP]]: at gøre hver del af et design åben for udvidelse er spild, fordi det indfører nye abstraktionslag og dermed kompleksitet. Man skal koncentrere sig om de områder, der sandsynligvis ændrer sig.',
            '**Needless repetition:** ændringer implementeres ved copy’n’paste i stedet for ved en ordentlig abstraktion. Eksemplet: “why not just CnP it?” — hvis det virker for A, virker det nok også for B, C og D. Så skal en fejl rettes lige så mange steder, som koden er kopieret.',
          ],
        },
        {
          term: 'Opacity',
          body: [
            'Koden udvikler sig til at blive sværere og sværere at forstå, fordi der ikke refactores undervejs (“in lieu of proper refactoring”). Sliden viser metoden `IsPrinterOn()` i tre generationer: først ét kald til `printer.IsOn()`; så en vækning fra sleep mode med en busy-wait på `125000`; til sidst en cachet tilstand i `curPS`, et `goto CHECK_ON_AGAIN`, en ny busy-wait på `32500` og en returværdi kommenteret med `//probably`.',
            'Ingen af tilføjelserne er absurde hver for sig. Det er ophobningen uden oprydning, der gør koden uigennemsigtig — til sidst kan forfatteren ikke selv sige, om svaret er rigtigt.',
          ],
        },
        {
          term: 'En smell er et hint, ikke en vished',
          body: [
            'Ugeplanen henviser til C2-wikien: en code smell er et hint om, at noget er gået galt et sted i koden, og man bruger lugten til at spore problemet. Det er et hint, ikke en vished — et fint idiom kan kaldes en smell, fordi det ofte misbruges. Kent Beck skal have fundet på udtrykket, og *Bad Smells in Code* af Beck og Fowler er kapitel 3 i *Refactoring*.',
            'I uge 9 vender smells tilbage som indgangen til [[refactoring|refactoring]] (“Locate a smell”), men med en anden liste: Mäntyläs taksonomi med Bloaters, Object-Orientation Abusers, Change Preventers, Dispensables og Couplers. Nogle af dem ligner uge 2’s design smells — *Duplicate Code* og *Speculative Generality* står under Dispensables — men kurset kobler ikke de to lister eksplicit.',
          ],
        },
      ],
      viz: 'design-smells',
      keyPoints: [
        'Software rot: uventede krav → designet kan ikke tage dem → de hackes ind → produktet kan ikke vedligeholdes.',
        'Rigidity: en ændring *kræver* en kaskade af ændringer. Fragility: en ændring *knækker* noget andet.',
        'Immobility: for meget bagage til genbrug (`Calendar` bundet til DS1339A). Viscosity: hacket er nemmere end designet (`#ifdef`).',
        'Needless complexity (YAGNI): overengineering til tænkte krav — “there is a balance”.',
        'Needless repetition (DRY): copy’n’paste i stedet for en abstraktion.',
        'Opacity: koden bliver uforståelig uden løbende refactoring (`IsPrinterOn()` i tre generationer).',
        'En smell er et hint om et problem, ikke et bevis.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Opacity: IsPrinterOn() i første og anden generation',
          source: 'Design Smells - The Odors of Rotting Software.pdf s. 8',
          code: `// 1. generation
public bool IsPrinterOn() {
  return printer.IsOn();
}

// 2. generation
public bool IsPrinterOn() {
  if(!printer.IsOn()) {
    printer.WakeFromSleepMode();
    while(i<125000) i++;
    return printer.IsOn();
  }
  return true;
}`,
        },
        {
          lang: 'csharp',
          title: 'Opacity: tredje generation',
          source: 'Design Smells - The Odors of Rotting Software.pdf s. 8',
          code: `public bool IsPrinterOn() {
  if(!(curPS = printer.IsOn()))
  {
    printer.WakeFromSleepMode();
    while(i<125000) i++;
    curPS = printer.IsOn();
    if(!curPS)
      goto CHECK_ON_AGAIN;
  }
  return true;

CHECK_ON_AGAIN:
  while(i<32500) i++;
  if(!printer.IsON())
    return false; //probably
}`,
        },
      ],
      exam: [
        'En design smell er et symptom på, at designet ikke længere kan bære ændringer. Kurset navngiver syv: rigidity, fragility, immobility, viscosity, needless complexity, needless repetition og opacity.',
        'Årsagen er software rot: kravene ændrer sig på en måde, designet ikke understøtter, så ændringerne hackes ind, og til sidst kan produktet ikke vedligeholdes. Det er teknisk gæld — tegneserien med huset, hvor det tager uforholdsmæssigt lang tid at sætte et vindue i.',
        'Rigidity og fragility er tvillinger: ved rigidity kræver en simpel ændring en kaskade af andre ændringer, ved fragility knækker en rettelse noget helt andet. Begge får udviklerne til at holde op med at røre koden.',
        'Modtrækket er ikke at bygge alting fleksibelt — det er needless complexity. Der er en balance: gør designet åbent for de ændringer, man har grund til at forvente, og refactor løbende, så opacity ikke vokser.',
        'Principperne i SOLID er svar på smells: fx løser OCP-eksemplet med `IEmployeeStorage` netop, at et nyt lager tvang ændringer ind i `Editor`.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W02a_Design_Smells.md'), original: 'Design Smells - The Odors of Rotting Software.pdf', pages: 's. 1–9, 11' },
        { path: m('kursus/SW4SWD-01_Week_Plans.md'), original: 'week2 plan.txt', note: 'Ugens indhold, læsning og C2-citatet om code smells' },
        { path: m('slides/SW4SWD-01_W01.2_Extreme_Programming.md'), original: 'Extreme Programming.pdf', pages: 's. 7', note: 'Simplicity: “start with the simplest solution (YAGNI)”' },
        { path: m('slides/SW4SWD-01_W09.1_Refactoring.md'), original: 'Refactoring.pdf', pages: 's. 7–8', note: 'Mäntyläs taksonomi og “Locate a smell”' },
        { path: HFDP, pages: 'PDF s. 125 (bogens s. 87)', note: 'Kap. 3: OCP overalt er spild og giver kompleksitet. Kap. 3 er ikke på læselisten.' },
      ],
      gaps: [
        'Slidene definerer hverken “design smell” eller “technical debt”. Technical debt findes kun som tegneserie (s. 1) og som reference til www.larochelab.com (s. 11). Definitionen af en smell som et hint kommer fra ugeplanens C2-citat, der taler om *code* smells.',
        'Ugeplanens læsning — *The Principles and Patterns*-artiklen s. 1–7 (eller Martin s. 104–107) — ligger ikke i materialet. Det samme gælder øvelsen, hvis første og anden del laves mandag og fredag.',
        'Slide 4 er et link til en YouTube-video uden tekst; indholdet er ikke i materialet.',
        'Markdown-konverteringen af W09.1 kalder Mäntyläs taksonomi “taksonomien fra uge 2”. Den står ikke i uge 2’s slides; Refactoring.pdf s. 7 nævner ikke uge 2. Uge 2 og uge 9 bruger altså to forskellige lister.',
        'Slide 9 tilskriver citatet Fowler; Fowlers eget svar på samme slide siger Kent Beck.',
        'Småfejl på slidene: “oders” for “odors” (s. 2). I tredje generation af `IsPrinterOn()` kaldes `printer.IsON()` mod `IsOn()` ellers, og tælleren `i` erklæres eller nulstilles aldrig.',
      ],
      keywords: ['design smells', 'code smells', 'software rot', 'technical debt', 'teknisk gæld', 'rigidity', 'fragility', 'immobility', 'viscosity', 'needless complexity', 'needless repetition', 'opacity', 'YAGNI', 'DRY', 'overengineering', 'copy paste', 'IsPrinterOn', 'Calendar', 'DS1339A', '#ifdef', 'Report', 'Kent Beck', 'hack'],
    },

    {
      slug: 'srp',
      title: 'Single Responsibility Principle (SRP)',
      short: 'SRP',
      week: 'Uge 2 · W02b',
      definition:
        '**“A class should only have one reason to change.”** Slidene præciserer: en funktionel enhed på et givet abstraktionsniveau skal kun være ansvarlig for ét **aspekt** af systemets krav, og et aspekt er en egenskab ved kravene, der kan ændre sig uafhængigt af andre aspekter. SRP er S’et i SOLID.',
      intro: [
        'SOLID er forbogstaverne i fem designprincipper: **S**ingle Responsibility Principle, **O**pen Closed Principle ([[ocp|OCP]]), **L**iskov’s Substitution Principle ([[lsp|LSP]]), **I**nterface Segregation Principle ([[isp|ISP]]) og **D**ependency Inversion Principle ([[dip|DIP]]). SRP og OCP er uge 2, resten er uge 3. Forelæsningen åbner med pointen, at det vigtigste designværktøj er et sind, der er godt uddannet i designprincipper.',
      ],
      concepts: [
        {
          term: 'Én grund til at ændre sig',
          body: [
            'Nøgleordet er **aspekt**. Et aspekt er en egenskab ved kravene, der kan ændre sig uafhængigt af de andre. Bor to uafhængige aspekter i samme klasse, har klassen to uafhængige grunde til at ændre sig — og så er “én grund til at ændre sig” og “ét ansvar” det samme udsagn.',
            '“På et givet abstraktionsniveau” betyder, at princippet ikke kræver én metode pr. klasse. Et modul på et højt niveau kan godt have ét ansvar, der består af flere mindre. Arkitekturforelæsningen siger det direkte: SOLID gælder også på arkitekturniveau, bare om moduler i stedet for klasser, med høj samhørighed og lav kobling som mål.',
          ],
        },
        {
          term: 'Hvorfor det gør ondt at bryde SRP',
          body: [
            'Har en klasse flere ansvar, kan en ændring på grund af det ene have uheldige virkninger på de andre. Et brud på SRP kan give designs, der er svære at teste, vedligeholde og ændre. Det er [[design-smells|fragility]] i lille skala: man retter formatet og knækker datamodellen.',
            'Ugeplanen stiller tre spørgsmål før forelæsningen: hvorfor skal en klasse kun have én grund til at ændre sig, hvad er egentlig et “responsibility”, og hvad sker der, hvis vi ikke overholder SRP?',
          ],
        },
        {
          term: 'Eksempel: IModem',
          body: [
            'Slide 6 spørger kun: “What is the problem with IModem?” `IModem` har `Dial(number)`, `Hangup()`, `Send(c)` og `Recv()`. De to første handler om at oprette og nedlægge en forbindelse, de to sidste om at udveksle data over den. Det er to aspekter, der kan ændre sig hver for sig.',
            'Løsningen på sliden splitter dem: `IModemConnection` med `Dial(number: string) : IDataExchange` og `Hangup()`, og `IDataExchange` med `Send(c: char)` og `Recv() : char`. Forbindelsen afhænger af dataudvekslingen (stiplet pil) og returnerer den fra `Dial`. Sliden viser også `ITCPConnection` med `Connect(server: string) : IDataExchange` og `Disconnect()`: en helt anden forbindelsestype giver den samme `IDataExchange`. Dataudvekslingen er blevet genbrugelig, fordi den ikke længere er klistret til modemmet.',
          ],
        },
        {
          term: 'Eksempel: Person',
          body: [
            '`Person` har properties `FirstName`, `LastName`, `Gender` og `DateOfBirth` — og en metode `Format(string formatType)`, der med en `switch` laver `"JSON"`, `"FirstAndLastName"` eller et standardformat. Klassen holder persondata *og* bestemmer, hvordan de præsenteres. Et nyt felt og et nyt outputformat er to uafhængige grunde til at ændre `Person`.',
            'Sliden viser ingen løsning. `switch`’en peger også frem mod [[ocp|OCP]]: hvert nyt format kræver, at `Format` rettes. Vejen ud er at trække formateringen ud i sin egen klasse — det, uge 9 kalder [[refactoring|Extract Class]]: “You have one class doing work that should be done by two.”',
          ],
        },
        {
          term: 'SRP andre steder i kurset',
          body: [
            'Factories har som mål “to separate the creation of an object from its use – SRP” (se [[factory-method|Factory Method]]). Lagdelte arkitekturer giver “Separation of concerns (SRP)” (se [[arkitekturstile|arkitekturstile]]). Det er det samme princip: det, der ændrer sig af forskellige grunde, skal bo forskellige steder.',
            '*Head First Design Patterns* formulerer princippet i kap. 9 (ikke på læselisten) som “A class should have only one reason to change” og kobler det til **cohesion**: en klasse med høj samhørighed er bygget om et sæt relaterede funktioner.',
          ],
        },
        {
          term: 'Kritik: SRP er vag',
          body: [
            'I uge 3 runder forelæsningen SOLID af med “SOLID is hard to apply” og en kort kritik af hvert princip: “SRP – vague”. Hvad der tæller som ét aspekt, afhænger af, hvilke krav man forventer ændrer sig uafhængigt. Alternativet på sliden er “Write simple code” og *Rule of Least Power*.',
          ],
        },
      ],
      viz: 'srp',
      keyPoints: [
        'En klasse skal kun have én grund til at ændre sig.',
        'Et ansvar = ét aspekt af kravene, der kan ændre sig uafhængigt af de andre.',
        'Flere ansvar i én klasse: en ændring i det ene kan skade det andet — svært at teste, vedligeholde og ændre.',
        '`IModem` blander forbindelse og dataudveksling → `IModemConnection` + `IDataExchange`; `ITCPConnection` genbruger `IDataExchange`.',
        '`Person` holder data og formaterer dem → to grunde til at ændre sig.',
        'Gælder på alle niveauer: klasser, moduler og lag (separation of concerns).',
        'Kritik fra uge 3: SRP er vag.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'IModem før og efter opdelingen',
          source: 'SOLID - SO.pdf s. 6 (oversat fra klassediagrammet)',
          code: `// Før: forbindelse og dataudveksling i ét interface
interface IModem
{
    void Dial(string number);
    void Hangup();
    void Send(char c);
    char Recv();
}

// Efter: to ansvar, to interfaces
interface IModemConnection
{
    IDataExchange Dial(string number);
    void Hangup();
}

interface ITCPConnection
{
    IDataExchange Connect(string server);
    void Disconnect();
}

interface IDataExchange
{
    void Send(char c);
    char Recv();
}`,
        },
        {
          lang: 'csharp',
          title: 'Person: data og formatering i samme klasse',
          source: 'SOLID - SO.pdf s. 7',
          code: `public class Person {
  public string FirstName { get; set; }
  public string LastName { get; set; }
  public Gender Gender { get; set; }
  public DateTime DateOfBirth { get; set; }
  public string Format(string formatType) {
      switch(formatType) {
         case "JSON":
           // implement JSON formatting here
           return jsonFormattedString;
         case "FirstAndLastName":
          // implementation of first & lastname formatting here
          return firstAndLastNameString;
         default:
          // implementation of default formatting
          return defaultFormattedString;
      }
  }
}`,
        },
      ],
      exam: [
        'SRP siger, at en klasse kun skal have én grund til at ændre sig. Kurset præciserer det som ét aspekt af kravene — en egenskab, der kan ændre sig uafhængigt af de andre.',
        'Grunden er, at hvis to ansvar bor i samme klasse, kan en ændring i det ene få uheldige virkninger på det andet, og klassen bliver svær at teste og vedligeholde.',
        'Kursets eksempel er `IModem`: `Dial` og `Hangup` handler om forbindelsen, `Send` og `Recv` om dataudvekslingen. Deles det i `IModemConnection` og `IDataExchange`, kan en `ITCPConnection` genbruge den samme dataudveksling.',
        '`Person` er et andet brud: den holder både persondata og en `Format`-metode med en `switch` over formater. Nye felter og nye formater er to uafhængige grunde til at ændre klassen — og `switch`’en bryder samtidig OCP.',
        'Afvejningen er, at SRP er vag: hvor snittet skal ligge, afhænger af, hvilke ændringer man forventer. Deler man for meget op, får man needless complexity.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W02b_SOLID_SRP_OCP.md'), original: 'SOLID - SO.pdf', pages: 's. 1–7, 18' },
        { path: m('kursus/SW4SWD-01_Week_Plans.md'), original: 'week2 plan.txt', note: 'Spørgsmålene før forelæsningen' },
        { path: m('slides/SW4SWD-01_W03a_SOLID_LSP.md'), original: 'SOLID - L.pdf', pages: 's. 20, 25–26', note: 'SOLID-recap og “SRP – vague”' },
        { path: m('slides/SW4SWD-01_W04.1_Architecture_Process_1.md'), original: '1-SW-Architecture - Process 1.pdf', pages: 's. 30', note: 'SOLID på arkitekturniveau' },
        { path: m('slides/SW4SWD-01_W04.2_Architecture_Process_2.md'), original: '2-SW-Architecture - Process 2.pdf', pages: 's. 27', note: 'Separation of concerns (SRP)' },
        { path: m('slides/SW4SWD-01_W07.2_GoF_Factory_Abstract_Factory.md'), original: 'GoF Factory Method, Gof Abstract Factory.pdf', pages: 's. 3, 7' },
        { path: m('slides/SW4SWD-01_W09.1_Refactoring.md'), original: 'Refactoring.pdf', pages: 's. 11', note: 'Extract Class' },
        { path: HFDP, pages: 'PDF s. 378 (bogens s. 340)', note: 'Kap. 9, ikke på læselisten' },
      ],
      gaps: [
        'Formuleringen skifter: “only one reason to change” (s. 4), “exactly one reason to change” og “Single Responsible Principle” (recap s. 18), og i uge 3 “Each class/module should only have a single responsibility” (SOLID - L.pdf s. 20). Slidetitlerne siger “Principles” i flertal.',
        'Definitionen med “aspect” på s. 4 står i citationstegn, men uden kilde. Ugeplanens læsning — SRP-artiklen eller Martin kap. 8 — findes ikke i materialet.',
        'Slidene viser ingen løsning på `Person` (s. 7), og IModem-sliden viser ikke, hvilke klasser der implementerer de nye interfaces.',
        'På s. 6 står `Send(char c)` i `IModem`, men `Send(c: char)` i `IDataExchange`; ingen af boksene har stereotypen «interface».',
        'Markdown-konverteringen af W06b nævner en “SRP-diskussion” i Observer, men ordene SRP og responsibility findes ikke i Observer-PDF’ens tekst.',
      ],
      keywords: ['SRP', 'single responsibility', 'SOLID', 'one reason to change', 'én grund til at ændre sig', 'ansvar', 'responsibility', 'aspect', 'aspekt', 'cohesion', 'samhørighed', 'separation of concerns', 'IModem', 'IModemConnection', 'ITCPConnection', 'IDataExchange', 'Person', 'Format', 'Extract Class'],
    },

    {
      slug: 'ocp',
      title: 'Open-Closed Principle (OCP)',
      short: 'OCP',
      week: 'Uge 2 · W02b',
      definition:
        '**“Software entities should be open for extension but closed for modification.”** Forvent at kravene ændrer sig, og design så ændringen kan laves ved at *tilføje* kode frem for at *rette* i den eksisterende. Kursets eksempel: `Editor` gemmer via interfacet `IEmployeeStorage`, så et nyt lager er en ny klasse og ikke en ændring i `Editor`.',
      concepts: [
        {
          term: 'Open for extension, closed for modification',
          body: [
            '**Open for extension:** forvent at kravene ændrer sig, og tillad at ændringen implementeres som en udvidelse af det eksisterende design. **Closed for modification:** når kravene kræver en udvidelse, skal det ikke være nødvendigt at ændre den eksisterende kode. OCP hjælper med at bygge systemer, der kan klare ændrede krav i fremtiden.',
            'Billedet på slide 8 siger det kort: man behøver ikke hjernekirurgi for at tage en hat på.',
          ],
        },
        {
          term: 'At ændre er ikke det samme som at udvide',
          body: [
            'Slide 11 er en dialog: “You want to implement changes, but without changing things?” Svaret: at implementere ændringer betyder ikke nødvendigvis at *ændre* — ofte betyder det at *udvide*. Paradokset forsvinder, når man skelner mellem kravet, der ændrer sig, og koden, der ikke behøver at gøre det.',
          ],
        },
        {
          term: 'Storage uden OCP',
          body: [
            'Version 1 (s. 12): `Editor` har feltet `EmployeeFile storage`, laver det selv med `new EmployeeFile()` i konstruktøren, og `OnButtonClick()` løber medarbejderens attributter igennem, formaterer dem, konverterer til bytes og kalder `storage.Save(bytes)`. Klassediagrammet: `Editor` med en association (fuld linje, åben pil) til `EmployeeFile` med `Save(byte[])`.',
            'Så kommer det nye krav (s. 13): “Need to support database”. Version 2 (s. 14) har `EmployeeDB` med `Save(Employee)`, og `Editor` må ændres tre steder — feltets type, `new`-kaldet og hele kroppen af `OnButtonClick()`, der nu bare kalder `storage.save(employee)`. Sliden fremhæver netop de tre steder med fed.',
            'Diagnosen (s. 15): `Editor` var for tæt koblet til lageret, så udvidelsen med en ny lagertype bredte sig ind i `Editor`. Den var ikke closed for modification. Og spørgsmålet bagefter: hvad hvis lageret skiftes igen, eller der skal understøttes flere? Det er [[design-smells|rigidity]] i praksis.',
          ],
        },
        {
          term: 'Storage med OCP',
          body: [
            'Løsningen (s. 16) indfører `IEmployeeStorage` med `Save(Employee)`. `EmployeeFile` og `EmployeeDB` realiserer det (stiplet linje, hul trekant), og `Editor` har kun en association til interfacet. Konstruktøren tager lageret som parameter, `Editor(IEmployeeStorage s)`, i stedet for selv at kalde `new`. `OnButtonClick()` kalder bare `storage.Save(employee)`.',
            'Læg mærke til, hvad der flyttede: formateringen og byte-konverteringen er rykket ned i `EmployeeFile.Save`, fordi det er fil-specifik viden. Interfacet taler på domænets niveau (`Employee`), ikke lagerets (`byte[]`). Et tredje lager — eller flere samtidig — er en ny klasse, der implementerer `IEmployeeStorage`. `Editor` røres ikke.',
            'Mekanikken er en abstraktion, som den stabile kode afhænger af, plus en afhængighed, der gives udefra. Det er samme greb som [[dip|DIP]] (uge 3) og som constructor injection i SWT, se [[swt/design-for-testability|design for testability]].',
          ],
        },
        {
          term: 'OCP i mønstrene',
          body: [
            '[[observer|Observer]] skal tillade, at nye consumers tilføjes providern “without changing the Provider (i.e. adhere to OCP)”. Factories skal gøre oprettelseskode “open for extension but closed for modification”, og i Abstract Factory-eksemplet går `StockingCtrl` fra en `switch` over kompressionsmetoder (“violates OCP”) til en injiceret `IStockingFactory` (“adheres to OCP”), se [[abstract-factory|Abstract Factory]].',
            '*Head First Design Patterns* kap. 4 viser det samme problem i `orderPizza()`: en `if`-kæde med `new CheesePizza()`, `new GreekPizza()` osv. er “NOT closed for modification”, for hver ændring af menuen kræver, at koden åbnes. Bogen henviser til sit første princip fra kap. 1 ([[strategy|Strategy]]): find det, der varierer, og adskil det fra det, der er stabilt.',
          ],
        },
        {
          term: 'Afvejning: ikke alt kan lukkes',
          body: [
            '*Head First Design Patterns* (kap. 3, ikke på læselisten) er ærlig om prisen: at gøre hver del af designet åben for udvidelse er som regel ikke muligt og ville være spild, fordi OCP typisk indfører nye abstraktionslag og dermed kompleksitet. Man skal koncentrere sig om de områder, der sandsynligvis ændrer sig.',
            'Det er den balance, design smells-slidet kalder [[design-smells|needless complexity]]. I uge 3 lyder kritikken af OCP kort “replace old code”.',
          ],
        },
      ],
      viz: 'ocp',
      keyPoints: [
        'Open for extension, closed for modification.',
        'Ændrede krav implementeres som udvidelser — ny kode, ikke rettet kode.',
        'Uden OCP: `Editor` kender `EmployeeFile` og laver den selv med `new` → et databaselager kræver tre ændringer i `Editor`.',
        'Med OCP: `Editor` kender kun `IEmployeeStorage` og får den gennem konstruktøren; `EmployeeFile` og `EmployeeDB` realiserer interfacet.',
        'Fil-specifik formatering flytter ned i `EmployeeFile`; interfacet taler i `Employee`, ikke `byte[]`.',
        'Går igen i Observer, Factory Method og Abstract Factory.',
        'Afvejning: luk kun for de ændringer, du forventer — ellers needless complexity.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Uden OCP, version 1: Editor kender EmployeeFile (pseudo-C# som på sliden)',
          source: 'SOLID - SO.pdf s. 12',
          code: `public class Editor {
  private EmployeeFile storage;
  Editor() {
    storage = new EmployeeFile()
  }
  public void OnButtonClick() {
    for (attr in employee) {
        var data = attr.Format();
        var bytes = // convert data to bytes
        storage.Save(bytes);
    }
  }
}

public class EmployeeFile {
  public void Save(byte[] b) {
    fileStream.Write(b, 0, b.length);
  }
}`,
        },
        {
          lang: 'csharp',
          title: 'Uden OCP, version 2: databasen tvinger ændringer ind i Editor',
          source: 'SOLID - SO.pdf s. 14 (kommentarerne markerer det, sliden har med fed)',
          code: `public class Editor {
  private EmployeeDb storage;          // ændret
  Editor() {
    storage = new EmployeeDB()         // ændret
  }
  public void OnButtonClick() {
    storage.save(employee);            // ændret
  }
}

public class EmployeeDB {
  public void Save(Employee e) {
    db.Save(e);
  }
}`,
        },
        {
          lang: 'csharp',
          title: 'Med OCP: Editor afhænger kun af IEmployeeStorage',
          source: 'SOLID - SO.pdf s. 16 (interfacet og “: IEmployeeStorage” er tilføjet efter klassediagrammet på samme slide)',
          code: `public interface IEmployeeStorage {
  void Save(Employee e);
}

public class Editor {
  private IEmployeeStorage storage;
  Editor(IEmployeeStorage s) {
    storage = s;
  }
  public void OnButtonClick() {
    storage.Save(employee);
  }
}

public class EmployeeFile : IEmployeeStorage {
  public void Save(Employee e) {
    for (attr in e) {
      var data = attr.Format();
      var b = // convert data
      fileStream.Write(b, 0, b.length);
    }
  }
}

public class EmployeeDB : IEmployeeStorage {
  public void Save(Employee e) {
    db.Save(e);
  }
}`,
        },
      ],
      exam: [
        'OCP siger, at software entities skal være åbne for udvidelse, men lukkede for ændring: vi forventer, at kravene ændrer sig, og designer så ændringen kan laves ved at tilføje kode i stedet for at rette i den eksisterende.',
        'Kursets eksempel er `Editor`, der gemmer i en `EmployeeFile`, den selv opretter. Da kravet om en database kom, skulle `Editor` ændres tre steder, fordi den var tæt koblet til den konkrete lagerklasse.',
        'Med OCP afhænger `Editor` kun af `IEmployeeStorage` og får lageret gennem konstruktøren. `EmployeeFile` og `EmployeeDB` realiserer interfacet, og et nyt lager er bare en ny klasse — `Editor` røres ikke.',
        'Samme idé går igen i Observer, hvor nye observers kan tilføjes uden at ændre subject, og i factories, hvor en `switch` over konkrete klasser erstattes af en injiceret factory.',
        'Afvejningen er, at man ikke kan lukke alt: hver abstraktion koster kompleksitet, så man lukker for de ændringer, man har grund til at forvente — ellers ender man i needless complexity.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W02b_SOLID_SRP_OCP.md'), original: 'SOLID - SO.pdf', pages: 's. 8–16, 18' },
        { path: m('slides/SW4SWD-01_W06b_GoF_Observer.md'), original: 'Design Patterns - GoF Observer.pdf', pages: 's. 5' },
        { path: m('slides/SW4SWD-01_W07.2_GoF_Factory_Abstract_Factory.md'), original: 'GoF Factory Method, Gof Abstract Factory.pdf', pages: 's. 3, 17, 19' },
        { path: m('bog/SW4SWD-01_HFDP_Ch04_Factory.md'), original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf', pages: 'PDF s. 149–151 (bogens s. 111–113)', note: '`orderPizza()` er ikke closed for modification' },
        { path: HFDP, pages: 'PDF s. 124–125 (bogens s. 86–87)', note: 'Kap. 3: OCP og prisen for det. Kap. 3 er ikke på læselisten.' },
        { path: m('slides/SW4SWD-01_W03a_SOLID_LSP.md'), original: 'SOLID - L.pdf', pages: 's. 25', note: '“OCP – replace old code”' },
      ],
      gaps: [
        'Koden på s. 12–16 er pseudo-C#: `for (attr in employee)`, `b.length`, manglende semikolon efter `new EmployeeFile()`, `EmployeeDb` mod `EmployeeDB`, `storage.save` med lille s, et `employee`, der aldrig er erklæret, og ikke-public konstruktører. På s. 16 står et ekstra `}` efter både `Editor` og `EmployeeFile`.',
        'På s. 16 erklærer koden ikke, at `EmployeeFile` og `EmployeeDB` implementerer `IEmployeeStorage` — kun klassediagrammet viser realiseringen. `IEmployeeStorage` har ingen «interface»-stereotype i diagrammet.',
        'Slidene viser ikke, hvem der opretter lageret og giver det til `Editor`. Det dækkes først af [[dip|DIP]] (uge 3) og i BAD’s [[bad/di-levetider|DI-levetider]].',
        'Formuleringen skifter: “Software entities” (s. 9–10), “A class” (recap s. 18), “Classes” (SOLID - L.pdf s. 21). HFDP: “Classes should be open for extension, but closed for modification.” Ugeplanens læsning — OCP-artiklen eller Martin kap. 9 — findes ikke i materialet.',
        'Slide 17 er et billede af en figur med en hammer blandt søm, uden tekst. Pointen forklares ikke.',
      ],
      keywords: ['OCP', 'open-closed', 'open closed principle', 'open for extension', 'closed for modification', 'SOLID', 'udvidelse', 'Editor', 'EmployeeFile', 'EmployeeDB', 'IEmployeeStorage', 'storage', 'tight coupling', 'tæt kobling', 'constructor injection', 'orderPizza', 'switch'],
    },

    ...solidB,
  ],
}
