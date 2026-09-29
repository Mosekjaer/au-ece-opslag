import type { Part } from '../types'
import { m } from './paths'

export const refactoringDdd: Part = {
  id: 'refactoring-ddd',
  title: 'Refactoring og DDD',
  topics: [
    {
      slug: 'refactoring',
      title: 'Refactoring',
      week: 'Uge 9 · W09.1',
      definition:
        'Fowler skelner mellem navneord og udsagnsord. **A refactoring** er én ændring af softwarens interne struktur, der gør den lettere at forstå og billigere at ændre — *uden at ændre dens observerbare adfærd*. **To refactor** er at omstrukturere software ved at anvende en serie af den slags refactorings. Kurset sætter målet sådan: koden skal overholde SOLID, men “without changing externally visible behavior”.',
      intro: [
        'Ordet kommer fra matematikkens *factorization*: 3 × 5 er en faktorisering af 15, og (x – 2)(x + 2) er en faktorisering af x² – 4. Værdien er den samme, formen er enklere at arbejde med. Sådan er det også med kode: strukturen ændres, adfærden ikke.',
        'Refactorings er navngivne, små indgreb fra Fowlers katalog — Extract Method, Extract Class, Move Field, Replace Conditional with Polymorphism osv. Man finder en smell, vælger den refactoring, der fjerner den, og tester bagefter.',
      ],
      concepts: [
        {
          term: 'Mål og tidspunkt',
          body: [
            'Refactoring skal forbedre kodekvaliteten: **maintainability**, **understandability**, **simplicity**, **extendability** og **testability**. Slidet sætter det i forhold til SOLID (fra [[srp|SRP]] til [[dip|DIP]]): vi vil have koden til at overholde principperne, men uden at ændre den eksternt synlige adfærd.',
            'Slidene nævner to tidspunkter. **Før en ny feature** — så featuren bliver lettere at implementere. **Når alle tests består** — så man kan stole på, at man ikke ændrer den eksterne adfærd.',
            'Ideen går igen andre steder i kurset. XP har “Refactor” blandt sine designregler. Design smells-forelæsningen slutter med Kent Becks citat om at få dagens arbejde gjort, så morgendagens arbejde stadig kan gøres, og kalder [[design-smells|opacity]] det, der sker “in lieu of proper refactoring”.',
          ],
        },
        {
          term: 'Code smells er indgangen',
          body: [
            'Man starter med at finde en smell. Slidet bruger Mäntyläs taksonomi med fem grupper: **The Bloaters** (Long Method, Large Class, Primitive Obsession, Long Parameter List, DataClumps), **The Object-Orientation Abusers** (Switch Statements, Temporary Field, Refused Bequest, Alternative Classes with Different Interfaces), **The Change Preventers** (Divergent Change, Shotgun Surgery, Parallel Inheritance Hierarchies), **The Dispensables** (Lazy class, Data class, Duplicate Code, Dead Code, Speculative Generality) og **The Couplers** (Feature Envy, Inappropriate Intimacy, Message Chains, Middle Man).',
            'Det er et andet ordforråd end uge 2’s [[design-smells|design smells]] (rigidity, fragility, immobility, viscosity, needless complexity, needless repetition, opacity). De syv beskriver symptomer på designniveau; code smells peger på konkrete steder i koden. Ugeplanen for uge 2 kalder en code smell “a hint that something might be wrong, not a certainty” — et tegn på, at et nærmere kig er på sin plads.',
            'Slide 15 viser Industrial Logics tabel fra smell til refactoring. Tre eksempler fra den: **Divergent Change** → Extract Class. **Data Clumps** → Extract Class, Preserve Whole Object, Introduce Parameter Object. **Conditional Complexity** → bl.a. Replace Conditional Logic with Strategy og Replace State-Altering Conditionals with State, altså [[strategy|Strategy]] og [[state|State]].',
          ],
        },
        {
          term: 'Før du starter: tests',
          body: [
            'Slidet har fem punkter: 1) sørg for en **omfattende testsuite** for den kode, du vil ændre; 2) tag **små** skridt; 3) find en smell; 4) anvend en refactoring, og **verificér at alle tests stadig består**; 5) brug **source control** (fx `git reset --soft` til at squashe commits bagefter).',
            'Testene er det, der gør “uden at ændre adfærd” til noget, man kan vise, ikke bare tro på. Det er derfor, [[swt/unit-test|unit tests]] er en forudsætning. Øvelsesspørgsmålene bagefter (s. 18) handler om det samme: hvordan var det at arbejde med hurtige, omfattende tests, fangede de fejl, kunne du have taget mindre skridt, og hvordan føltes det at smide kode væk og gå tilbage?',
          ],
        },
        {
          term: 'Extract Method og Extract Class',
          body: [
            '**Extract Method**: “You have a code fragment that can be grouped together.” Gør fragmentet til en metode, hvis navn forklarer formålet. I Fowlers eksempel bliver de to udskrifter under kommentaren `//print details` i `printOwing` til `printDetails(amount)`. Kommentaren forsvinder, fordi navnet nu siger det samme.',
            '**Extract Class**: “You have one class doing work that should be done by two.” Opret en ny klasse, og flyt de relevante felter og metoder over. `Person` har `name`, `officeAreaCode`, `officeNumber` og `getTelephoneNum()`. Efter refactoringen har `Person` kun `name` og `getTelephoneNum()` og en association til en ny `TelephoneNumber` med `areaCode`, `number` og `getTelephoneNum()`. Det er [[srp|SRP]] udført som et mekanisk trin.',
          ],
        },
        {
          term: 'Replace Conditional with Polymorphism',
          body: [
            '“You have a conditional that chooses different behavior depending on the type of an object.” Fowlers `getSpeed()` switcher på `_type`: `EUROPEAN` returnerer `getBaseSpeed()`, `AFRICAN` returnerer `getBaseSpeed() – getLoadFactor() * _numberOfCoconuts`, og `NORWEGIAN_BLUE` returnerer `0`, hvis `_isNailed`, ellers `getBaseSpeed(_voltage)`. Bagefter kommer `throw new RuntimeException("Should be unreachable")`.',
            'Opskriften: “Move each leg of the conditional to an overriding method in a subclass. Make the original method abstract.” Resultatet (s. 13) er en abstrakt `Bird` med `getSpeed` og tre underklasser, `European`, `African` og `Norwegian Blue`, der hver overskriver `getSpeed` med deres eget ben af switchen. Switchen og den uopnåelige exception forsvinder; en ny fugletype er en ny klasse.',
            'Slidet skriver “Strategy pattern” som stikord, og tabellen på s. 15 har både *Replace Conditional Logic with Strategy* og *Replace State-Altering Conditionals with State*. Diagrammet viser dog Fowlers variant, hvor benene flytter ned i underklasser af `Bird` selv — arv, ikke delegation. Med [[strategy|Strategy]] flytter benene i stedet ud i separate strategiobjekter, som konteksten delegerer til; med [[state|State]] er det tilstanden, der skifter objekt. HFDP bruger samme bevægelse på Gumball-maskinen: “We need to refactor this code so that it’s easy to maintain and modify” — hver tilstands adfærd i sin egen klasse.',
          ],
        },
        {
          term: 'Move Field',
          body: [
            'Slidet beskriver Move Field i tre dele efter refactoring.com: **motivation** (hvorfor flytte feltet?), **mechanics** og **examples**. Mekanikken for Move Field: sørg for at feltet er indkapslet → test → opret felt og accessors i målklassen → kør statisk tjek (compiler og/eller lint) → lav en reference fra kilde- til målobjekt → ret accessoren til at bruge målets felt → test.',
            'Eksemplet er i C#: `Customer.GetDiscountRate()` returnerer først `this.discountRate`; bagefter returnerer den `this.plan.GetDiscountRate()`. Feltet bor nu i `Plan`, og `Customer`’s interface er uændret — kaldere mærker intet.',
          ],
        },
        {
          term: 'Kataloget, og når der ikke er tests',
          body: [
            'Fowlers katalog har mange flere refactorings (Move Method, Inline Class, Hide Delegate, Remove Middle Man, Self Encapsulate Field, Replace Magic Number with Symbolic Constant …) — og nogle findes i begge retninger: “Change Value to Reference” og “Change Reference to Value”, ensrettet og tovejs association. Slidets konklusion: “It is up to YOU to decide, what improves the code.”',
            'Uden testsuite — typisk legacy code — siger slidet to ting: brug **kun IDE’ens indbyggede refactorings**, og **indsæt måder at skrive testcases på**. Første mål er altså at få tests på plads; derefter kan man refactore efter de fem punkter. Slidet viser Feathers’ *Working Effectively with Legacy Code* og foreslår Gilded Rose-kataen (stavet “Guilded rose”) som øvelse. I SWT hedder et sted, hvor en test kan skyde en afhængighed ind, en *seam* — se [[swt/design-for-testability|design for testability]].',
          ],
        },
      ],
      viz: 'refactoring',
      keyPoints: [
        'Refactoring ændrer struktur, ikke observerbar adfærd — som 15 = 3 × 5.',
        '*A refactoring* er ét navngivet indgreb; *to refactor* er en serie af dem.',
        'Refactor før en ny feature eller når alle tests består — aldrig uden sikkerhedsnet.',
        'Fem punkter før start: testsuite, små skridt, find en smell, refactor og kør tests, source control.',
        'Code smells (Bloaters, OO Abusers, Change Preventers, Dispensables, Couplers) peger på, hvilken refactoring der skal bruges.',
        'Extract Class er SRP i praksis; Replace Conditional with Polymorphism erstatter en type-switch med underklasser (eller Strategy/State).',
        'Uden tests: kun IDE’ens automatiske refactorings, indtil der er tests.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Extract Method: fragmentet får et navn',
          source: 'Refactoring.pdf s. 9–10 (Java på sliden: printOwing, System.out.println)',
          code: `// Før
void PrintOwing(double amount)
{
    PrintBanner();

    //print details
    Console.WriteLine("name:" + _name);
    Console.WriteLine("amount" + amount);
}

// Efter
void PrintOwing(double amount)
{
    PrintBanner();
    PrintDetails(amount);
}

void PrintDetails(double amount)
{
    Console.WriteLine("name:" + _name);
    Console.WriteLine("amount" + amount);
}`,
        },
        {
          lang: 'csharp',
          title: 'Replace Conditional with Polymorphism: før',
          source: 'Refactoring.pdf s. 12 (Java på sliden; RuntimeException er oversat)',
          code: `double GetSpeed()
{
    switch (_type)
    {
        case EUROPEAN:
            return GetBaseSpeed();
        case AFRICAN:
            return GetBaseSpeed() -
                   GetLoadFactor() * _numberOfCoconuts;
        case NORWEGIAN_BLUE:
            return _isNailed ? 0 : GetBaseSpeed(_voltage);
    }
    throw new InvalidOperationException("Should be unreachable");
}`,
        },
        {
          lang: 'csharp',
          title: 'Replace Conditional with Polymorphism: efter',
          source: 'Refactoring.pdf s. 13 (klassediagram) og s. 12 (opskrift) — sliden viser ikke koden; den er udledt ben for ben',
          code: `abstract class Bird
{
    // "Make the original method abstract"
    public abstract double GetSpeed();
    // GetBaseSpeed(), GetLoadFactor() osv. som før
}

class European : Bird
{
    public override double GetSpeed() => GetBaseSpeed();
}

class African : Bird
{
    public override double GetSpeed() =>
        GetBaseSpeed() - GetLoadFactor() * _numberOfCoconuts;
}

class NorwegianBlue : Bird
{
    public override double GetSpeed() =>
        _isNailed ? 0 : GetBaseSpeed(_voltage);
}`,
        },
        {
          lang: 'csharp',
          title: 'Move Field: accessoren peger videre til Plan',
          source: 'Refactoring.pdf s. 16 (efter refactoring.com/catalog/moveField.html)',
          code: `// Før
class Customer
{
    ...
    public Plan GetPlan() { return this.plan; }
    public float GetDiscountRate() {
        return this.discountRate;
    }
}

// Efter
class Customer
{
    ...
    public Plan GetPlan() { return this.plan; }
    public float GetDiscountRate() {
        return this.plan.GetDiscountRate();
    }
}`,
        },
      ],
      exam: [
        'Refactoring er at ændre kodens interne struktur, så den bliver lettere at forstå og billigere at ændre, uden at ændre den observerbare adfærd. Fowler skelner mellem én refactoring — et navngivet indgreb som Extract Method — og det at refactore, som er en serie af dem.',
        'Forudsætningen er en omfattende testsuite: man tager små skridt, finder en smell, anvender én refactoring og kører testene igen. Det er testene, der viser, at adfærden er uændret. Uden tests bruger man kun IDE’ens indbyggede refactorings, indtil man har fået tests på plads.',
        'Kursets eksempel er Replace Conditional with Polymorphism: `getSpeed()` switcher på fuglens type. Hvert ben flytter ned i en underklasse af en abstrakt `Bird` — `European`, `African`, `Norwegian Blue` — så en ny fugletype er en ny klasse og ikke en ny `case`. Slidet kalder det Strategy; med Strategy eller State flytter benene ud i separate objekter, som konteksten delegerer til.',
        'Smells fortæller, hvilken refactoring der passer: Divergent Change og Data Clumps peger på Extract Class, som er SRP udført i ét trin. Men kataloget har refactorings i begge retninger, fx Change Value to Reference og omvendt, så det er op til én selv at afgøre, hvad der forbedrer koden.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W09.1_Refactoring.md'), original: 'Refactoring.pdf', pages: 's. 3–21' },
        { path: m('slides/SW4SWD-01_W02a_Design_Smells.md'), original: 'Design Smells - The Odors of Rotting Software.pdf', pages: 's. 8–9', note: 'Opacity og “bottom line”-citatet fra Refactoring-bogen' },
        { path: m('kursus/SW4SWD-01_Week_Plans.md'), original: 'week2 plan.txt', note: 'Uge 2: code smell som “hint”, ikke vished' },
        { path: m('slides/SW4SWD-01_W01.2_Extreme_Programming.md'), original: 'Extreme Programming.pdf', pages: 's. 12', note: '“Refactor” blandt XP’s designregler' },
        { path: m('bog/SW4SWD-01_HFDP_Ch10_State.md'), original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf', pages: 'PDF-s. 431 (bogens s. 393)', note: 'Gumball-koden refactores mod State' },
        { path: 'swd/kilder/bog/SWD_Head-First-Design-Patterns-2nd-Edition.pdf', pages: 'PDF-s. 619 (bogens s. 581)', note: '“Refactoring time is Patterns time!” — kap. 13, uden for læselisten' },
      ],
      gaps: [
        'Slide 12 har stikordet “Strategy pattern”, men klassediagrammet på s. 13 viser underklasser af `Bird` selv (arv), ikke en separat strategi, som konteksten delegerer til. Slidene forklarer ikke forskellen.',
        'Slidene viser ikke, hvor typevalget ender efter Replace Conditional with Polymorphism. Nogen skal stadig oprette en `African` frem for en `European`. HFDP (PDF-s. 619) nævner kun i forbifarten, at konkrete afhængigheder kan ryddes op med Factory.',
        'Tabellen på s. 15 er et beskåret udsnit af Industrial Logics PDF og slutter midt i *Duplicated Code*. Henvisningerne [F …] og [K …] forklares ikke. Uden for materialet: F er Fowlers *Refactoring*, K er Kerievskys *Refactoring to Patterns*. F-sidetallene passer ikke med indholdsfortegnelsen på s. 14 (Extract Class er s. 122 dér, men [F 149] i tabellen), så de kommer fra forskellige udgaver.',
        'Code smell-taksonomien på s. 7 (Mäntylä) er ikke den samme som design smells fra uge 2 (Martins syv). Markdown-konverteringen kalder den “taksonomien fra uge 2”; det holder ikke mod originalerne. Uge 2 nævner kun code smells i ugeplanens valgfrie læsning.',
        'Øvelserne (“Begin the exercises”, s. 17) ligger ikke i materialet. Det er uklart, hvilken kata eller kode der blev brugt.',
        'Fowler-eksemplerne (s. 9–13) er i Java; kun Move Field (s. 16) er i C#. Koden efter Replace Conditional with Polymorphism står ikke på nogen slide; C#-versionen her er udledt af diagrammet og opskriften.',
      ],
      keywords: ['refactoring', 'refactor', 'refaktorering', 'Fowler', 'factorization', 'code smell', 'smells', 'Extract Method', 'Extract Class', 'Move Field', 'Move Method', 'Replace Conditional with Polymorphism', 'switch', 'Bird', 'getSpeed', 'Norwegian Blue', 'printOwing', 'TelephoneNumber', 'Bloaters', 'Shotgun Surgery', 'Divergent Change', 'Data Clumps', 'legacy code', 'Feathers', 'Gilded Rose', 'kata', 'testsuite', 'small steps', 'Industrial Logic', 'Kerievsky'],
    },

    {
      slug: 'ddd',
      title: 'Domain Driven Design',
      short: 'DDD',
      week: 'Uge 9 · W09.2',
      definition:
        'Domain Driven Design (Eric Evans) sætter fokus på kernen og domænelogikken. Målet er en **shared model** — mentalt og i kode — som udviklere, domæneeksperter, arkitekter, testere og, “most importantly”, koden deler. Kurset deler DDD i **strategic design** (domain events, event storming, ubiquitous language, bounded contexts og deres relationer) og **tactical patterns** (value objects, entities, aggregates, services, repositories, factories og domain events).',
      intro: [
        'Udgangspunktet er et problem: udviklerne taler ikke med domæneeksperterne — det gør arkitekter og sælgere. Kravene gives bare i et dokument, og viden går tabt i kæden domæneeksperter → business analyst → softwarearkitekter → udviklere → kode. Derfor skal man forstå domænet og have en fælles viden om det.',
        'Slide 4 erstatter kæden med en stjerne: domæneeksperter, udviklere, stakeholders og kode peger alle mod én “shared mental model”. Overskriften er “Align domain and software”. Gevinsten ifølge slidet: hurtigere time to market, mere forretningsværdi, mindre spild og lettere vedligehold.',
      ],
      concepts: [
        {
          term: 'Domain events og event storming',
          body: [
            'DDD fokuserer på at **transformere** data frem for på datarelationer; statiske data tilføjer ikke værdi. Næsten alt arbejde udløses af en hændelse udefra eller indefra: “Order placed”, “Flight booked”, “Patient arrived”.',
            '**Event storming** er Alberto Brandolinis workshop til DDD, med domæneeksperter, udviklere og andre stakeholders. Trinene: 1) skriv domain events (orange); 2) tilføj de commands, der udløser dem (blå ved siden af orange), og den actor, der udfører kommandoen (gul); 3) tilføj det tilhørende aggregate (gul); 4) find forretningsprocesserne (lilla). Metoden har flere elementer: external systems, views og errors.',
            'Eksemplet deler post-its mellem to teams. **Order team**: order form recived, Place order → order placed, change requested, cancelation requested, return requsted. **Shipping team**: Ship order → order shipped. Uden for rammerne: new customer, new customer registered.',
          ],
        },
        {
          term: 'Commands og forretningsprocesser',
          body: [
            'Et event *triggers* en command; kommandoen sender “data needed for workflow” ind i en business process, som giver en outputliste af nye events. I eksemplet udløser “order form recived” kommandoen “Place order”. Processen får “data needed for order” og udsender “order placed (shipping)” og “order placed (billing)” — samme hændelse, sendt videre til to contexts.',
          ],
        },
        {
          term: 'Ubiquitous language',
          body: [
            'Et fælles sprog mellem domæneeksperter og udviklere, som alle stakeholders bygger sammen. Det indeholder kun ting, der findes i domænet; tekniske ord som *factory*, *helper*, *manager* og *controller* hører ikke til i designet. Sproget definerer den fælles mentale model.',
            'Der findes ikke nødvendigvis ét sprog for hele systemet — hver bounded context har sin **dialekt**. Error handling-forelæsningen trækker på samme idé: fejl rapporteres med et input- og output-“pattern language” — “think DDD’s ubiquitous language” (se [[fejlhaandtering|fejlhåndtering]]).',
          ],
        },
        {
          term: 'Bounded context og context map',
          body: [
            'En **bounded context** er DDD’s ord for et delsystem — et “mini”-domæne. *Context*, fordi hvert område kræver specialiseret viden. *Bounded*, fordi delsystemer skal være afkoblede og kunne udvikle sig uafhængigt. Slidets eksempel har tre: **Order taking context**, **Shipping context** og **Billing context**.',
            'Et **context map** viser interaktionen mellem dem. En Customer sender “Order recived” til Order taking context, der sender “Order placed” videre til Billing context og Shipping context.',
            'Valget af contexts: samme domæneeksperter med samme sprog og problemer hører sandsynligvis til samme domæne; eksisterende teams og afdelinger; “bounded”; **autonomi** — to teams i samme bounded context er formentlig langsommere end to i hver sin; og **friction-free business workflows**, altså interaktionen med “mange” forskellige contexts.',
          ],
        },
        {
          term: 'Relationer mellem contexts',
          body: [
            'Slidet kalder dem **partnerships** og tegner hvert team som en ellipse med **S** (supplier) og **C** (customer) på pilen. **Shared kernel**: to teams deler en lille fælles model (ellipserne overlapper). **Customer-supplier**: supplier leverer, hvad customer har brug for. **Conformist**: customer-supplier, men customer har ikke råd til at oversætte og tager supplierens model som den er. **Anticorruption layer**: customer bygger et oversættelseslag (**ACL**) mellem supplierens model og sin egen.',
            'Slidet nævner også **partnership**, **open host service** og **published language** uden at forklare dem.',
          ],
        },
        {
          term: 'Value objects og entities',
          body: [
            'Tactical patterns er “key elements from OOP with an DDD perspective”. Et **value object** modellerer en værdi: intet unikt ID, **immutable**, og sammenligning sker på attributter/værdi. Eksempler: Address, PhoneNumber, Money.',
            'En **entity** modellerer et individ: har et **unikt ID** og er **mutable**. Eksempler: OrderItem, Customer, Invoice.',
          ],
        },
        {
          term: 'Aggregates og aggregate root',
          body: [
            'Et **aggregate** består af én eller flere entities og value objects og danner en **transaktionelt konsistent grænse**. Én entity er **aggregate root**: den ejer alle andre elementer i aggregatet, og adgang til aggregatet **skal** gå gennem roden. Eksempler: Customer og Invoice — begge også entities på s. 19.',
            'Fire designhensyn (s. 21): 1) beskyt forretningsinvarianter inde i aggregatet; 2) design små aggregates; 3) referér kun til andre aggregates via deres identitet; 4) opdatér refererede aggregates med eventual consistency.',
            'I øvelsen (s. 25) sætter man aggregates ind på event storming-væggen og tegner bounded contexts rundt om dem. Eksempelresultatet har contexts som *Order captured* (aggregates Order og Inventory), *Shopping cart* (Order, Shopping cart), *Offers* (Offer) og *Checkout process* (Address).',
          ],
        },
        {
          term: 'Services, repositories, factories og domain events',
          body: [
            '**Services** rummer domæneoperationer, der ikke hører til en entity eller et value object, og er **stateless** — fx `PriceCalculation(…)` og `CurrencyCoversion(…)`. **Repositories** henter domæneobjekter (aggregates) fra datalageret eller DAL’en — kendt fra backend-faget, se [[bad/di-levetider|repository i BAD]]. **Factories** opretter domæneobjekter og indkapsler oprettelsen.',
            '**Domain events** repræsenterer en forretningsmæssigt betydningsfuld hændelse i en bounded context. De er uforanderlige fakta, navngives i **datid** med ubiquitous language og kan bruges til kommunikation mellem services. Eksempler: `OrderRevieved`, `NewCustomerRegisterd`.',
            'Evans’ navigationskort (s. 18) binder byggeklodserne sammen: Model-Driven Design udtrykkes med services, entities og value objects; entities og value objects indkapsles i aggregates; entities fungerer som root for aggregates; der tilgås via repositories; og aggregates, entities og value objects indkapsles med factories. Layered architecture isolerer domænet, og Smart UI er det gensidigt udelukkende alternativ.',
            'I arkitekturforelæsningen står Domain Driven Design som den domænefokuserede kategori blandt [[arkitekturstile|arkitekturstile]], mellem Structure og Communication.',
          ],
        },
      ],
      viz: 'ddd',
      keyPoints: [
        'Målet er én shared model, som domæneeksperter, udviklere, stakeholders og koden deler.',
        'Strategic design: domain events, event storming, ubiquitous language, bounded contexts, context map og partnerships.',
        'Event storming: events (orange) → commands (blå) og actors → aggregates → forretningsprocesser (lilla).',
        'Bounded context = delsystem med sin egen dialekt af ubiquitous language; afkoblet og selvstændigt udviklet.',
        'Relationer: shared kernel, customer-supplier, conformist, anticorruption layer.',
        'Value object: intet ID, immutable, sammenlignes på værdi. Entity: unikt ID, mutable.',
        'Aggregate: konsistensgrænse med én root; al adgang går gennem roden; referér andre aggregates via ID.',
        'Services er stateless, repositories henter aggregates, factories opretter dem, domain events navngives i datid.',
      ],
      exam: [
        'Domain Driven Design handler om at bygge én fælles model af domænet, som domæneeksperter og udviklere deler, og som også står i koden. Det løser problemet med krav, der går tabt, når de sendes gennem en kæde af dokumenter.',
        'Strategisk deler man domænet i bounded contexts — i kursets eksempel Order taking, Billing og Shipping — der hver har deres egen dialekt af ubiquitous language og taler sammen via events som “Order placed”. Relationen mellem to teams kan være shared kernel, customer-supplier, conformist eller et anticorruption layer, der oversætter supplierens model.',
        'Man finder events og contexts med event storming: domæneeksperter og udviklere sætter events op i orange, commands i blå og actors og aggregates i gul, og grænserne tegner sig, hvor de klumper sig sammen.',
        'Taktisk skelner man value objects, som Money og Address, der er immutable og sammenlignes på værdi, fra entities, som Customer og Invoice, der har et unikt ID. Et aggregate er en konsistensgrænse med én entity som root; al adgang går gennem roden, og andre aggregates refereres kun via ID. Designhensynene er små aggregates, reference via ID og eventual consistency, når et andet aggregate skal opdateres — den transaktionelle konsistens gælder kun inden for grænsen.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W09.2_Domain_Driven_Design.md'), original: 'Domain Driven Design.pdf', pages: 's. 2–25' },
        { path: m('slides/SW4SWD-01_W04.2_Architecture_Process_2.md'), original: '2-SW-Architecture - Process 2.pdf', pages: 's. 20', note: 'Domain Driven Design som domænefokuseret arkitekturkategori' },
        { path: m('slides/SW4SWD-01_W13.2_Error_Handling.md'), original: 'Error handling 1.pdf', pages: 's. 14', note: '“Think DDD’s ubiquitous language”' },
      ],
      gaps: [
        'Slidene har ingen kode. Tactical patterns står kun som punktlister; der er intet C#-eksempel på et value object, et aggregate eller et repository.',
        'Designhensynene på s. 21 er fire overskrifter uden forklaring. “Transactional consistent boundary” (s. 20) og “eventual consistency” (s. 21) defineres ikke.',
        'Partnership, open host service og published language (s. 17) nævnes kun ved navn.',
        'Navigationskortet på s. 18 er fra Evans’ bog (omslaget på s. 2), men det står ikke på slidet. Layered Architecture, Smart UI og “mutually exclusive choices” gennemgås ikke.',
        'Farverne er ikke konsistente: s. 10 siger events er orange og både actor og aggregate gule; eksemplerne på s. 11–12 tegner events ravgule. Øvelsen på s. 13 kalder actors “pale yellow”.',
        'Slide 14 siger, at tekniske ord som “factory” ikke hører til i designet, mens s. 23 har Factories som tactical pattern. Slidene forklarer ikke forskellen mellem domænesprog og tekniske byggeklodser. De kobler heller ikke Factories til GoF’s [[factory-method|Factory Method]] og [[abstract-factory|Abstract Factory]] fra uge 7.',
        'Slide 4 har overskriften “What is Domain Driven Development”. Slide 23 henviser til “SW4BED (Backend development)”; i dette semester hedder faget SW4BAD.',
        'WasteNoFood-øvelsen (s. 5, 13, 25) har ingen løsning i materialet. Eksempelresultatet på s. 25 er beskåret i højre side.',
      ],
      keywords: ['DDD', 'Domain Driven Design', 'Domain-Driven Design', 'Eric Evans', 'shared model', 'shared mental model', 'strategic design', 'tactical patterns', 'domain event', 'event storming', 'Brandolini', 'command', 'actor', 'business process', 'ubiquitous language', 'bounded context', 'context map', 'shared kernel', 'customer-supplier', 'conformist', 'anticorruption layer', 'ACL', 'open host service', 'published language', 'value object', 'entity', 'aggregate', 'aggregate root', 'eventual consistency', 'invariant', 'service', 'repository', 'factory', 'WasteNoFood', 'Order taking', 'Shipping', 'Billing'],
    },
  ],
}
