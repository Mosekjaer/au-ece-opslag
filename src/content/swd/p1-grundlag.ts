import type { Part } from '../types'
import { m } from './paths'

export const grundlag: Part = {
  id: 'grundlag',
  title: 'OO-grundlag, UML og XP',
  topics: [
    {
      slug: 'oo-grundbegreber',
      title: 'OO-grundbegreber og interfaces',
      short: 'OO-grundbegreber',
      week: 'Uge 0–1 · W01.1b',
      definition:
        'Kurset bygger på fire af OOP’s grundbegreber: **encapsulation** (skjul detaljerne bag en kontrolleret grænseflade), **abstraction** (medtag det relevante, udelad det irrelevante), **inheritance** (is-a *og* behaves-like) og **polymorphism** (typespecifik adfærd bag én fælles type). I C# er `interface` redskabet, der binder dem sammen: klienten kender kontrakten, ikke den konkrete klasse.',
      intro: [
        'Kursusintroen begrunder faget med en trappe “inspired by David Mosher”: en **hacker** finder en løsning ved at prikke til tingene, til noget virker, men kan bagefter ikke se, hvordan. En **developer** kender best practices, men ikke hvad der ligger under dem. En **engineer** forstår også *hvorfor* man bruger dem. OO-grundbegreberne er første trin på vejen fra developer til engineer.',
      ],
      concepts: [
        {
          term: 'Seks begreber, fire i dybden',
          body: [
            'Slide 2 viser “OOPs (Object-Oriented Programming System)” som seks dele: abstraction, encapsulation, class, object, inheritance og polymorphism. Resten af lektionen har ét afsnit for hver af de fire første — encapsulation, abstraction, inheritance og polymorphism — hver indledt med et citat.',
          ],
        },
        {
          term: 'Encapsulation: shy code',
          body: [
            'Dave Thomas’ formulering er “write shy code”: moduler, der ikke afslører noget unødvendigt for andre moduler, og som ikke afhænger af andre modulers implementering. Reglen på slide 4 siger det samme fra klassens side: de detaljer, en metode har brug for til at levere sit resultat, skal være skjult for den kaldende metode.',
            'Slide 4 beder holdet diskutere fordele og ulemper ved encapsulation. Svaret står ikke på slidene.',
          ],
        },
        {
          term: 'Evil client',
          body: [
            'Slide 6 tester indkapslingen ved at antage, at klienten er ond. `TurbineManager` har en liste af `WindTurbine`-objekter, og `EvilClient` prøver at ødelægge dem i tre versioner.',
            '**Version 1:** listen er et `public` felt. `tm.turbines.Clear()` tømmer den — klienten ejer i praksis managerens data. **Version 2:** feltet er `private`, men `GetTurbine(string id)` returnerer selve turbine-objektet. Klienten sætter `Id = "PWND"` og derefter `MaxSpeed = -1000` gennem referencen. At feltet er privat, hjælper ikke, når de interne objekter bliver udleveret.',
            '**Version 3:** ingen objekter forlader klassen; der er kun operationer: `SetMaxSpeed(string tag, int speed)` og `SetLocation(string tag, Coord coord)`. Klienten kan stadig kalde `SetMaxSpeed("A323", -1000)` — men nu går alle ændringer gennem `TurbineManager`, som er det eneste sted, der rører turbinerne. Slidet viser kun koden; at version 3 er den, hvor manageren kan afvise en ugyldig værdi, er læsningen af eksemplet (se huller).',
          ],
        },
        {
          term: 'Abstraction',
          body: [
            'Dijkstra: formålet med abstraktion er ikke at være vag, men at skabe et nyt semantisk niveau, hvor man kan være helt præcis.',
            'Eksemplet er “Bob the student”. Til en forelæsning er Bob *Name*, *Hand-ins* og *Group number*; på kontoret er han *AU-id*, *Study program* og *Passed courses*; som studerende *Name*, *Group number* og *Active courses*. Det er alle abstraktioner af Bob, og hvilken man bruger, afhænger helt af den kontekst, Bob repræsenteres i. Pointen på slidet: den rigtige abstraktion er meget vigtig for designet — medtag det relevante, udelad det irrelevante.',
          ],
        },
        {
          term: 'Inheritance: is-a og behaves-like',
          body: [
            'Robert C. Martins citat åbner afsnittet: der er intet galt med arv, heller ikke multipel arv — det er et sprogtræk, der kan bruges klogt eller tåbeligt. Slide 11 viser `Mammal` og `Reptile` som generaliseringer af `Animal` og spørger, hvordan man forstår arv som en “is-a relationship”, og hvad *specialization* og *generalization* betyder.',
            '“`Mammal` inherits from `Animal`” betyder to ting (slide 12): 1) overalt, hvor et `Animal` bruges, kan et `Mammal` bruges — **“compile-time” eller “is-a”-arv**; 2) enhver egenskab, klienter af `Animal` ønsker, skal være den samme for `Mammal` — **“run-time” eller “behaves-like”-arv**. Slidet tilføjer: “Spoiler: This is Liskov’s Substitution Principle” — se [[lsp|LSP]].',
            'Quizzen på slide 13 sætter skellet på prøve: arrangér `Bird`, `Penguin` og `Swallow` i et hierarki; tilføj `LayEgg()` til `Bird` — holder det? Tilføj `Fly()` — holder det stadig? Og hvis hierarkiet bryder sammen: hvordan håndterer du det? Compileren accepterer `Penguin : Bird` i begge tilfælde; spørgsmålet er, om pingvinen kan leve op til det, klienterne forventer af `Fly()`.',
          ],
        },
        {
          term: 'Polymorphism',
          body: [
            '“Polymorph” betyder “many forms”. Polymorfi bruges, når vi har brug for typespecifik adfærd: et objekts adfærd varierer med dets type. Slidet siger, at polymorfi forstås bedst fra klientens side, og tager et realtidsstrategispil som eksempel.',
            'Når en enhed ser en fjende, kan den *engage*, *defend* eller *run away*. `Unit` har `setStrategy(s: IUnitStrategy)` og `unitSighted(enemy: Unit)`; noterne på diagrammet viser, at den første gemmer `myStrategy = s` og den anden kalder `myStrategy.unitSighted(enemy)`. Tre klasser realiserer `«interface» IUnitStrategy`: `EngageStrategy`, `RunAwayStragegy` og `DefendStrategy`. `Unit` ved ikke, hvilken strategi den har — typen af objektet bag referencen bestemmer, hvad der sker. Det er formen fra [[strategy|Strategy]].',
            'Ryan Singers citat står over afsnittet: meget kompleksitet i software kommer af at prøve at få én ting til at gøre to ting.',
          ],
        },
        {
          term: 'Interfaces i C#: programmér mod kontrakten',
          body: [
            'Selvstudiet i uge 0 har to øvelser. Den første er ren mekanik (“absolutely no practical use”): interfacet `IDoThings` med `DoNothing()`, `DoSomething(int number)` og `DoSomethingElse(string input)`, to klasser `DoHickey` og `DoDickey`, der implementerer det, og en `Main()`, der spørger brugeren, hvilken der skal oprettes, men kalder metoderne gennem **den samme** `IDoThings`-reference.',
            'Den anden leverer pointen. `MotorBike` holder et `GasEngine`-felt og kender dermed motorens konkrete klasse — “a rather high coupling”, der gør det svært at montere en anden motor. Opgaven: find de metoder og properties, `MotorBike` bruger (i den udleverede kode: `MaxThrottle` og `SetThrottle(uint)`), saml dem i `IEngine`, lad `GasEngine` implementere det, og lad `MotorBike` kun afhænge af `IEngine`. Så kan en `DieselEngine` monteres uden at ændre `MotorBike`. Opgaven slutter med, at det er fundamentet for at gøre unit testing lettere — se [[swt/design-for-testability|design for testability]].',
            'HFDP formulerer princippet som “Program to an interface, not an implementation” og præciserer, at det egentlig betyder *program to a supertype*: variablens erklærede type skal være en supertype (typisk abstrakt klasse eller interface), så objektet bag den kan være en hvilken som helst konkret implementering. Senere i kurset bliver det til [[dip|DIP]], og kravet om kun at tage det med i `IEngine`, som `MotorBike` bruger, peger mod [[isp|ISP]].',
          ],
        },
        {
          term: 'Arv eller komposition',
          body: [
            'HFDP kap. 1 viser alternativet til at arve adfærd: hver `Duck` **har** en `FlyBehavior` og en `QuackBehavior` og delegerer til dem. Bogen kalder det komposition og gør det til princippet “Favor composition over inheritance”: komposition giver mere fleksibilitet og lader adfærden skifte på runtime, så længe objektet implementerer det rigtige interface. `Unit` med `setStrategy` i RTS-eksemplet har samme form. Den fulde sammenligning står under [[strategy|Strategy]] og [[template-method|Template Method]].',
          ],
        },
      ],
      viz: 'oo-grundbegreber',
      keyPoints: [
        'Encapsulation: “shy code” — afslør intet unødvendigt, og afhæng ikke af andres implementering.',
        'Et privat felt er ikke nok, hvis en getter udleverer de interne objekter (evil client, version 2).',
        'Abstraction: medtag det relevante, udelad det irrelevante — hvad der er relevant, afhænger af konteksten.',
        'Arv har to lag: is-a (compileren tjekker) og behaves-like (compileren tjekker ikke) — det sidste er LSP.',
        'Polymorfi: klienten kalder gennem en fælles type, og objektets type bestemmer adfærden.',
        'Interfaces: klienten afhænger af kontrakten, så nye implementeringer kan tilføjes uden at ændre den.',
        'HFDP: program to an interface (supertype), favor composition over inheritance.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Evil client mod tre versioner af TurbineManager (signaturer uden krop som på slidet)',
          source: 'OO Basic.pdf s. 6',
          code: `// Version 1: offentligt felt
public class TurbineManager {
  public List<WindTurbine> turbines;
}
public class EvilClient {
  public void DestroyTurbines(TurbineManager tm)
  {
    tm.turbines.Clear();
  }
}

// Version 2: privat felt, men getter udleverer objektet
public class TurbineManager {
  private List<WindTurbine> turbines;
  public WindTurbine GetTurbine(string id);
}
public class EvilClient {
  public void DestroyTurbines2(TurbineManager tm) {
    tm.GetTurbine("A323").Id = "PWND";
    tm.GetTurbine("PWND").MaxSpeed = -1000;
  }
}

// Version 3: kun operationer
public class TurbineManager {
  private List<WindTurbine> turbines;
  public void SetMaxSpeed(string tag, int speed);
  public void SetLocation(string tag, Coord coord);
}
public void DestroyTurbines3(TurbineManager tm)
{
  tm.SetMaxSpeed("A323", -1000);
}`,
        },
        {
          lang: 'csharp',
          title: 'Udleveret: MotorBike kender sin motors konkrete klasse',
          source: 'C Interfaces 2 - A little more advanced.html',
          code: `public class GasEngine
{
    private uint _curThrottle = 0;
    private uint _maxThrottle = 0;

    public GasEngine(uint maxThrottle)
    {
        _maxThrottle = maxThrottle;
    }

    public uint MaxThrottle
    {
        get { return _maxThrottle; }
    }

    public void SetThrottle(uint thr)
    {
        _curThrottle = thr;
    }

    public uint GetThrottle()
    {
        return _curThrottle;
    }
}

public class MotorBike
{
    private GasEngine _engine = null;

    MotorBike(GasEngine engine)
    {
        _engine = engine;
    }

    void RunAtHalfSpeed()
    {
        _engine.SetThrottle(_engine.MaxThrottle / 2);
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'RTS-eksemplet: Unit kalder gennem IUnitStrategy',
          source: 'OO Basic.pdf s. 17 — UML-diagram med C++-noter (cout) på slidet, her i C#',
          code: `public interface IUnitStrategy
{
    void unitSighted(Unit enemy);
}

public class Unit
{
    private IUnitStrategy myStrategy;

    public void setStrategy(IUnitStrategy s) { myStrategy = s; }
    public void unitSighted(Unit enemy) { myStrategy.unitSighted(enemy); }
}

public class EngageStrategy : IUnitStrategy
{
    public void unitSighted(Unit enemy) { Console.WriteLine("Attack!!!"); }
}

public class RunAwayStragegy : IUnitStrategy
{
    public void unitSighted(Unit enemy) { Console.WriteLine("Run away!"); }
}

public class DefendStrategy : IUnitStrategy
{
    public void unitSighted(Unit enemy) { Console.WriteLine("Stand up and fight!"); }
}`,
        },
      ],
      exam: [
        'Encapsulation betyder, at en klasse skjuler de detaljer, den bruger til at levere sit resultat — Dave Thomas kalder det “shy code”. Kursets evil client-eksempel viser, at et privat felt ikke er nok: returnerer `GetTurbine` selve objektet, kan klienten sætte `MaxSpeed` til -1000. Først når klassen kun tilbyder operationer som `SetMaxSpeed`, går alle ændringer gennem den.',
        'Arv har to betydninger: is-a, som compileren tjekker, og behaves-like, som den ikke tjekker. Det sidste er Liskov’s Substitution Principle. Quizzen med `Bird`, `Penguin` og `Swallow` viser det: `LayEgg()` passer til alle fugle, `Fly()` sætter hierarkiet på prøve.',
        'Polymorfi er typespecifik adfærd bag en fælles type. I RTS-eksemplet kalder `Unit` bare `myStrategy.unitSighted(enemy)`; om enheden angriber, forsvarer sig eller flygter, afhænger af hvilken `IUnitStrategy` der er sat ind.',
        'I C# bruger jeg interfaces til at programmere mod kontrakten: i øvelsen med `MotorBike` trak vi `IEngine` ud af det, `MotorBike` faktisk brugte, så en `DieselEngine` kunne monteres uden at ændre `MotorBike`. Det er grundlaget for DIP og for at kunne indsætte fakes i unit tests.',
        'Afvejningen mellem arv og komposition: arv er et sprogtræk, der kan bruges klogt eller tåbeligt. HFDP anbefaler komposition, fordi adfærden så kan skiftes på runtime — prisen er flere klasser og et ekstra interface.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W01.1b_OO_Basics.md'), original: 'OO Basic.pdf', pages: 's. 2–17' },
        {
          path: m('noter/SW4SWD-01_CSharp_Interfaces_Basics.md'),
          original: 'C Interfaces 1 - The very, very basics of interfaces.html; C Interfaces 2 - A little more advanced.html',
          note: 'Selvstudie, uge 0 (swd/kilder/uge-00_csharp-interfaces/)',
        },
        { path: m('slides/SW4SWD-01_W01.1a_Course_Intro.md'), original: 'Course Intro.pdf', pages: 's. 26', note: 'Hacker → Developer → Engineer' },
        {
          path: m('bog/SW4SWD-01_HFDP_Ch01_Strategy.md'),
          original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf',
          pages: 's. 11–12, 23',
          note: 'Bogens sidetal (PDF-s. 49–50, 61): program to an interface, favor composition over inheritance',
        },
      ],
      gaps: [
        'Slide 4 beder om fordele og ulemper ved encapsulation, og slide 11 om begreberne *specialization* og *generalization* — slidene giver ingen svar eller definitioner.',
        'Slide 6 viser kun koden til de tre versioner af `TurbineManager`. Der står intet om, hvad version 3 løser; som vist validerer `SetMaxSpeed` ikke, så `-1000` kommer igennem. At version 3 er den, hvor manageren *kan* afvise værdien, er læsningen af eksemplet, ikke slidets tekst. `GetTurbine`, `SetMaxSpeed` og `SetLocation` står som signaturer uden krop, hvilket ikke kompilerer i en C#-klasse.',
        'Quizzen på slide 13 (`Bird`, `Penguin`, `Swallow`) har intet facit i materialet.',
        'Slide 15’s sætning stopper midt i: “Battle strategies in a real-time”. Slide 17 staver klassen `RunAwayStragegy`, bruger lille begyndelsesbogstav i metodenavnene og har C++-noter (`cout << …`), selv om kurset er i C#. Kodeeksemplet ovenfor er en oversættelse af diagrammet.',
        'Øvelse 1, delopgave 5 siger “the same IDoStuff must be used” — der findes ingen `IDoStuff`; der menes `IDoThings`.',
        'Øvelse 2: løsningen (`IEngine`, `DieselEngine`) er ikke udleveret. I den udleverede kode mangler `MotorBike`’s konstruktør og `RunAtHalfSpeed()` en access modifier og er dermed `private`, så `Main()` kan ikke oprette en `MotorBike`, før det rettes. Opgaveteksten skriver skiftevis `MotorBike` og `Motorbike`.',
        'Markdown-konverteringen af øvelserne indeholder en rekonstrueret løsning og kommentarer (bl.a. at `GetThrottle()` ikke hører hjemme i `IEngine`, “ISP i miniature”). Det står ikke i originalen.',
      ],
      keywords: [
        'OOP', 'objektorientering', 'encapsulation', 'indkapsling', 'shy code', 'evil client', 'TurbineManager', 'WindTurbine',
        'abstraction', 'abstraktion', 'Bob the student', 'inheritance', 'arv', 'nedarvning', 'is-a', 'behaves-like',
        'specialization', 'generalization', 'Liskov', 'Bird Penguin Swallow', 'polymorphism', 'polymorfi', 'RTS', 'IUnitStrategy',
        'interface', 'IDoThings', 'DoHickey', 'IEngine', 'MotorBike', 'GasEngine', 'DieselEngine', 'tight coupling', 'loose coupling',
        'program to an interface', 'program to a supertype', 'favor composition over inheritance', 'komposition', 'HAS-A',
        'hacker developer engineer',
      ],
    },

    {
      slug: 'uml-klassediagram',
      title: 'UML-klassediagrammer',
      short: 'UML-klassediagram',
      week: 'Uge 1 · W01.1c',
      definition:
        'Et UML-klassediagram viser et systems klasser, deres indbyrdes relationer og klassernes attributter og operationer (Scott W. Ambler). Det bruges til domænemodeller, til analyse af krav og til detaljeret design. Relationerne skelnes på linje og pilehoved: **association**, **dependency**, **composition**, **generalization** og **realization**.',
      concepts: [
        {
          term: 'Tre formål',
          body: [
            'Ambler: klassediagrammer bruges til at udforske domænebegreber i en *domain model*, til at analysere krav i en *conceptual/analysis model* og til at vise det *detaljerede design* af objektorienteret software. Notationen er den samme; hvor meget der vises, afhænger af formålet.',
          ],
        },
        {
          term: 'Klassen og dens compartments',
          body: [
            'En klasse har op til tre compartments: navn, attributter og operationer. **Kun navnet er obligatorisk.** Bruges alle tre, står attributterne i midten og operationerne nederst. Noten viser fire varianter af samme boks: kun navn, navn + operationer, navn + attributter og alle tre.',
            'Med to compartments kan man ikke se på placeringen, om indholdet er attributter eller operationer. Forfatterens trick: skriv altid `()` efter operationer.',
          ],
        },
        {
          term: 'Syntaks for attributter og operationer',
          body: [
            'Attribut: `visibility name : type multiplicity = default {property-string}`, fx `– name : String [1] = "Anonymous" {readOnly}`. Operation: `visibility name (parameter-list) : return-type {property-string}`, hvor hver parameter er `direction name : type = default-value`, fx `+ balanceOn (date : Date) : Money`.',
            'Det eneste obligatoriske i beskrivelsen af en attribut eller operation er **navnet**.',
          ],
        },
        {
          term: 'Association, navigability og multiplicitet',
          body: [
            'Eksempeldiagrammet (s. 2) er en web service: `Web service` med `get()`, `post()`, `put()`, `delete()`; `Resource` med `id`, `toJSON()` og `fromJSON()`; `Representation` med `MIME type` og en `JSON Representation` under sig; en `Application Interface` med tre application modules. En note på `Resource` siger, at det er DTO’er, der ikke persisteres.',
            'Associerede klasser “kender” hinanden eller er på anden vis relaterede — i softwaren typisk ved at den ene har en reference til den anden. Et pilehoved på associationen angiver **navigability**: pilen fra `Web service` til `Application Interface` siger, at man kan navigere den vej.',
            '**Multiplicitet** står i associationens ender. `Web service` 1 — * `Resource` læses “one (1) web service is related to many (*) resources”; `Resource` 1 — 1..* `Representation`. Noten viser: `1` exactly one, `*` zero or more, `0..1` zero or one, `m..n` from m to n, og `{ordered} *` ordered.',
          ],
        },
        {
          term: 'Dependency',
          body: [
            'En dependency tegnes som en stiplet linje med pilehoved. `Application Interface` har en dependency til `Resource` (mærket “produces/consumes”): ændres `Resource`, bliver `Application Interface` sandsynligvis påvirket — fx fordi den har en operation, der tager en resource som parameter.',
          ],
        },
        {
          term: 'Composition — og aggregation',
          body: [
            '**Composition** betyder, at den ene klasses livscyklus styres af den anden. Eksemplet er en polygon med 3 eller flere punkter: punkterne tilhører polygonen, og slettes polygonen, slettes punkterne også. På diagrammet er `Polygon` og `Point` forbundet med en composition: den udfyldte diamant sidder ved `Polygon`, multipliciteten er 1 ved `Polygon` og 3..* `{ordered}` ved `Point`.',
            'UML har også et symbol for **aggregation** (åben diamant), men noten streger det over med rødt: “Don’t use the aggregation symbol.” Begrundelsen: UML superstructure-specifikationen siger, at aggregation er “dependent on domain and modeller”, og Martin Fowler kalder den “strictly meaningless”. Tilbage er to valg: almindelig association og composition. Figurerne i dette værk bruger aldrig den åbne diamant i klassediagrammer.',
          ],
        },
        {
          term: 'Generalization, realization og abstrakte klasser',
          body: [
            'Diagrammet på s. 3 er en notationsnøgle bygget over Javas collections. Interfaces får stereotypen `«interface»` (`Collection`, `Set`), abstrakte klasser skrives med kursivt navn (*`AbstractCollection`*, *`AbstractSet`*).',
            '**Generalization** (“inherits”): fuldt optrukken linje med hul trekant mod supertypen — `Set` → `Collection`, `AbstractSet` → `AbstractCollection`, `HashSet` → `AbstractSet`. Interfaces kan altså arve fra interfaces. **Realization** (“implements”): stiplet linje med hul trekant — `AbstractCollection` ⇢ `Collection`, `AbstractSet` ⇢ `Set`. **Dependency** (“depends on”): stiplet linje med åbent pilehoved — `Areas` (med `zipCodes : set` og `isValidZipCode(code)`) ⇢ `Set`.',
            'HFDP stiller samme slags øvelse ved Duck-diagrammet: skriv IS-A, HAS-A eller IMPLEMENTS på hver pil. IS-A svarer til generalization, IMPLEMENTS til realization og HAS-A til en association.',
          ],
        },
        {
          term: 'Provided og required interfaces: ball-and-socket',
          body: [
            'En klasse, der implementerer et interface, **provider** det; en klasse, der afhænger af et interface, **requirer** det. Det kan tegnes som *ball-and-socket*: `DataInputStream` (der arver fra *`InputStream`*) provider `DataInput` som en kugle, og `OrderReader` requirer det som en halvcirkel. En dependency fra socket til ball er korrekt UML, men ofte tegnes kugle og socket samlet, fordi det er lettere og ser bedre ud.',
            'Nogle gange giver dependency-pilen stadig mening: klasse `B` requirer `Collection`, klasse `A` provider `Set`. Det er gyldigt, fordi `Set` arver fra `Collection` — men så er kugle og socket ikke samme interface og kan ikke bare klikkes sammen.',
          ],
        },
      ],
      viz: 'uml-klassediagram',
      keyPoints: [
        'Tre formål: domænemodel, analysemodel, detaljeret design.',
        'Kun klassens navn er obligatorisk; attributter i midten, operationer nederst — skriv `()` efter operationer.',
        'Association: klasserne kender hinanden; pilehoved = navigability; multiplicitet i enderne.',
        'Dependency: stiplet linje med åbent pilehoved — en ændring i målet påvirker sandsynligvis kilden.',
        'Composition: udfyldt diamant ved helheden; delene dør med den (`Polygon` ◆— `Point`).',
        'Aggregation (åben diamant): “Don’t use it. Please.”',
        'Generalization: fuld linje + hul trekant. Realization: stiplet linje + hul trekant.',
        'Ball = provided interface, socket = required interface.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Syntaks for attributter og operationer',
          source: 'UML class diagrams - The basics.pdf s. 1',
          code: `Attribut:    visibility name : type multiplicity = default {property-string}
             – name : String [1] = "Anonymous" {readOnly}

Operation:   visibility name (parameter-list) : return-type {property-string}
parameter:   direction name : type = default-value
             + balanceOn (date : Date) : Money

Kun navnet er obligatorisk.`,
        },
      ],
      exam: [
        'Et klassediagram viser klasser, deres attributter og operationer og relationerne mellem dem. Det kan bruges som domænemodel, som analysemodel eller som detaljeret design — og man skal vide, hvilket niveau man tegner på, fordi det bestemmer detaljeringsgraden.',
        'Relationerne skelnes på linje og pilehoved: generalization er fuld linje med hul trekant, realization stiplet linje med hul trekant, dependency stiplet linje med åben pil. I kursets collections-eksempel arver `Set` fra `Collection`, `AbstractSet` implementerer `Set`, og `Areas` afhænger bare af `Set`.',
        'Association betyder, at klasserne kender hinanden, typisk via en reference; dependency betyder kun, at en ændring i den ene sandsynligvis påvirker den anden, fx fordi den optræder som parameter.',
        'Composition bruger jeg, når helheden styrer delenes livscyklus — som `Polygon` og dens mindst tre `Point`. Aggregation bruger jeg ikke: materialet kalder den med Fowler “strictly meaningless”, fordi betydningen afhænger af domæne og modellør.',
        'Ball-and-socket viser provided og required interfaces; en dependency mellem dem er nødvendig, når de ikke er samme interface, men fx `Set` og `Collection`.',
      ],
      sources: [
        {
          path: m('slides/SW4SWD-01_W01.1c_UML_Class_Diagrams.md'),
          original: 'UML class diagrams - The basics.pdf',
          pages: 's. 1–4',
          note: 'Fire siders note; www.michaelloft.dk står på hver side',
        },
        {
          path: m('bog/SW4SWD-01_HFDP_Ch01_Strategy.md'),
          original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf',
          pages: 's. 22',
          note: 'Bogens sidetal (PDF-s. 60): IS-A, HAS-A og IMPLEMENTS på Duck-diagrammet',
        },
      ],
      gaps: [
        'Materialet er en fire siders note (Michael Loft ifølge sidefoden), ikke slides. Markdown-konverteringen kalder den “4 slides” og staver `fomJSON()`; originalen har `fromJSON()` (s. 2).',
        'Diagrammet på s. 2 har “Application module A”, “Application module B” og endnu en “Application module B”. Associationerne fra `Application Interface` til modulerne har hverken navn eller multiplicitet, og noten forklarer dem ikke.',
        'Aggregation defineres ikke — noten siger kun, at den ikke skal bruges. Hvad den åbne diamant var ment at betyde, står ikke i materialet.',
        'Visibility vises kun med `–` (private) og `+` (public) i eksemplerne; de øvrige symboler og *direction* i parameterlisten (in/out) forklares ikke — ikke dækket af pensum.',
        'Noten dækker kun klassediagrammer. Tilstandsdiagrammer kommer i uge 8 (se [[state|State]] og [[nested-orthogonal|nested og orthogonal states]]); sekvensdiagrammer har ingen egen lektion.',
      ],
      keywords: [
        'UML', 'klassediagram', 'class diagram', 'compartment', 'attribut', 'attribute', 'operation', 'visibility', 'multiplicitet', 'multiplicity',
        'association', 'navigability', 'dependency', 'afhængighed', 'composition', 'komposition', 'aggregation', 'hul diamant',
        'generalization', 'generalisering', 'realization', 'realisering', 'interface', 'abstrakt klasse', 'stereotype',
        'ball-and-socket', 'provided interface', 'required interface', 'lollipop', 'Ambler', 'Polygon', 'Point', 'Web service', 'Resource',
        'domain model', 'domænemodel', 'DTO',
      ],
    },

    {
      slug: 'xp',
      title: 'Extreme Programming (XP)',
      short: 'Extreme Programming',
      week: 'Uge 1 · W01.2',
      definition:
        'Extreme Programming er en letvægts agil proces, udviklet af Kent Beck på Chryslers lønsystem (C3) og beskrevet i *Extreme Programming Explained* fra 1999. Målet er bedre kvalitet i softwaren og evnen til at reagere på ændrede krav, gennem hyppige releases og højere produktivitet. XP består af **values**, **principles** og **practices** — på slidene suppleret af **rules** fra extremeprogramming.org.',
      concepts: [
        {
          term: 'Planning/feedback loops',
          body: [
            'Slide 3 viser XP som indlejrede planning/feedback loops, der alle udspringer fra koden: **pair programming** (seconds), **unit test** (minutes), **pair negotiation** (hours), **stand-up meeting** (one day), **acceptance test** (days), **iteration plan** (weeks) og **release plan** (months). De indre loops kører mange gange inden for hvert af de ydre.',
          ],
        },
        {
          term: 'Historie og profil',
          body: [
            'XP startede den agile revolution, der førte til Agile Manifesto. Det er en letvægts agil proces, mest til små og mellemstore teams; en *social change*, der øger samarbejdet; med fokus på at skabe værdi for kunden ved at levere ofte, forbedre kvaliteten og fjerne fejl — og “12 key practices taken to their extreme”.',
            'Projektforløbet (slide 5, efter extremeprogramming.org): *user stories* og en *architectural spike* går ind i *release planning*; usikre estimater sendes til en *spike* og kommer tilbage som sikre; release planen driver *iterations*, hvis seneste version går til *acceptance tests*; bugs og næste iteration går tilbage i løkken, og kundens godkendelse giver *small releases*.',
            'Paradigmet (slide 6): *stay aware, adapt, change* — “Change will happen. XP lets you adapt.” Iterationsdiagrammet viser iteration planning fodret af user stories, project velocity, failed acceptance tests og bugs; development leverer new functionality og bug fixes dag for dag.',
          ],
        },
        {
          term: 'Fem values',
          body: [
            '**Communication**: at bygge software kræver god kommunikation med kunder og kolleger. **Simplicity**: start med den simpleste løsning (YAGNI). **Feedback**: fra systemet, kunden og teamet. **Courage**: sig sandheden, søg svar, tilpas dig. **Respect** (tilføjet i anden udgave): for teammedlemmer og projekt.',
          ],
        },
        {
          term: '14 principles',
          body: [
            'Principperne danner grundlaget for XP, bygger på værdierne og giver en bedre idé om, hvad praksisserne skal opnå: *Humanity, Economics, Mutual benefit, Self-similarity, Improvement, Diversity, Reflection, Flow, Opportunity, Redundancy, Failure, Quality, Baby steps* og *Accepted responsibility*.',
          ],
        },
        {
          term: 'Practices',
          body: [
            '“The day-to-day things”: *Sit together, Whole team, Informative workspace, Energized work, Pair programming, User stories, Weekly cycle, Quartable cycle, Slack, 10 min build, Continuous integration, Test first* og *Incremental design*.',
          ],
        },
        {
          term: 'Rules',
          body: [
            '**Managing:** open workspace, sustainable pace, stand up meetings, velocity, move people, “FIX XP”. **Planning:** user stories, release planning, frequent releases, iterative, iteration planning.',
            '**Designing:** simplicity, system metaphor, CRC cards, spike solutions, no functionality added early, refactor. Diagrammet *Collective Code Ownership* (slide 12) viser løkken: næste task → pair up → create a unit test → pair programming → continuous integration → 100 % unit tests passed. Fra pair programming fører “complex code” til *refactor mercilessly*, og fra next task fører “complex problem” til *CRC cards*.',
            '**Coding:** customer available, code standards, TDD, pair program, sequential code integration, integrate often, CI environment, collective ownership. **Testing:** test all code, pass before release, prove bug by unit-test — then fix, acceptance tests run often.',
          ],
        },
        {
          term: 'Kom i gang',
          body: [
            '**Nyt projekt:** user stories (1–3 uger), spike solution (risk mitigation), release planning (inviter hele teamet), begynd iterativ udvikling — “now you have started”.',
            '**Eksisterende projekt:** find det, der sinker projektet, og ret det først. Mange bugs → automatiserede acceptance tests. Kravspecifikationer → start med user stories. En eller to udviklere er flaskehalse → collective code ownership.',
          ],
        },
        {
          term: 'XP og resten af kurset',
          body: [
            'Slidene trækker ikke selv forbindelserne, men reglerne går igen senere. **Simplicity (YAGNI)** og *no functionality added early* er modstykket til design smell’en *needless complexity (YAGNI)*: et system, der er “overengineered” til mulige fremtidige ændringer — se [[design-smells|design smells]]. **Refactor** får sin egen lektion i uge 9, se [[refactoring|refactoring]].',
            '**Test first/TDD**, *test all code* og *prove bug by unit-test — then fix* er det, SWT gør til praksis, se [[swt/unit-test|unit test]]. *CI environment*, *integrate often* og *10 min build* er [[swt/ci|continuous integration]].',
          ],
        },
      ],
      viz: 'xp',
      keyPoints: [
        'Kent Beck, Chryslers C3, *Extreme Programming Explained* (1999) — forløber for Agile Manifesto.',
        'Mål: bedre kvalitet og evne til at reagere på ændrede krav, via hyppige releases og højere produktivitet.',
        'Indlejrede feedback loops fra sekunder (pair programming) til måneder (release plan).',
        'Fem values: communication, simplicity, feedback, courage, respect.',
        'Simplicity = start med den simpleste løsning (YAGNI).',
        'Designing-regler: simplicity, system metaphor, CRC cards, spike solutions, no functionality added early, refactor.',
        'Testing-regler: test all code; prove bug by unit-test, then fix.',
        'I et eksisterende projekt: ret det, der sinker projektet, først.',
      ],
      exam: [
        'XP er en letvægts agil proces fra Kent Beck, udviklet på Chryslers C3-projekt og beskrevet i 1999. Den sigter mod bedre kvalitet og mod at kunne reagere på ændrede krav, gennem hyppige releases og højere produktivitet.',
        'Kernen er indlejrede feedback loops: pair programming giver feedback på sekunder, unit tests på minutter, stand-up dagligt, acceptance tests på dage, iterationer på uger og releases på måneder.',
        'XP er bygget af fem values — communication, simplicity, feedback, courage og respect — 14 principles og en række praksisser som pair programming, test first, continuous integration og incremental design.',
        'For design er simplicity den vigtigste: start med den simpleste løsning, YAGNI, og tilføj ikke funktionalitet før tid. Det er modstykket til design smell’en needless complexity. Reglerne “refactor” og “prove bug by unit-test — then fix” hører med.',
        'Afvejningen: XP indføres ikke som en pakke i et eksisterende projekt. Man finder det, der sinker projektet, og retter det — fx mange bugs med automatiserede acceptance tests.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W01.2_Extreme_Programming.md'), original: 'Extreme Programming.pdf', pages: 's. 2–16', note: 'Diagrammer fra extremeprogramming.org og Wikipedia' },
        {
          path: m('slides/SW4SWD-01_W02a_Design_Smells.md'),
          original: 'Design Smells - The Odors of Rotting Software.pdf',
          pages: 's. 7',
          note: 'Needless complexity (YAGNI)',
        },
      ],
      gaps: [
        'Slide 5 siger “12 key practices”, men slide 9 lister 13. *Uden for materialet:* første udgave af Becks bog (1999) har 12 praksisser; listen på slide 9 er de 13 *primary practices* fra anden udgave (2004).',
        'Slidene staver “Quartable cycle”, “Faillure” og “Accepted responsibity”. *Uden for materialet:* hos Beck hedder de *Quarterly cycle*, *Failure* og *Accepted responsibility*. Teksten ovenfor retter de to sidste.',
        'Principperne, praksisserne og reglerne står som lister uden forklaring. Materialet definerer ikke fx *Slack*, *Self-similarity*, *Redundancy*, *System metaphor* eller *CRC cards*, og “FIX XP” står uden uddybning.',
        'Values, principles og practices kommer fra Becks bog, mens rules og de fleste diagrammer kommer fra extremeprogramming.org (“Copyright 2000 J. Donvan Wells” på diagrammerne). Slidene forklarer ikke, hvordan de to kilder hænger sammen.',
        'Slide 14 har en graf, “Bottleneck” (story points pr. dag i sprinten: Total Committed, In Development, In Testing, Done), uden kilde eller forklaring.',
      ],
      keywords: [
        'XP', 'Extreme Programming', 'agil', 'agile', 'Agile Manifesto', 'Kent Beck', 'C3', 'Chrysler', 'values', 'principles', 'practices', 'rules',
        'YAGNI', 'simplicity', 'feedback loop', 'pair programming', 'unit test', 'stand-up', 'acceptance test', 'iteration', 'release plan',
        'user stories', 'spike', 'velocity', 'refactor', 'TDD', 'test first', 'continuous integration', 'CI', 'collective code ownership',
        'CRC cards', 'system metaphor', 'incremental design', 'baby steps', '10 min build',
      ],
    },
  ],
}
