import type { Part } from '../types'
import { ctx } from './paths'

export const dotnet: Part = {
  id: 'dotnet',
  title: 'MAUI · .NET og C#',
  topics: [
    {
      slug: 'dotnet-csharp',
      title: 'C# og .NET-arkitekturen',
      short: 'C# og .NET',
      week: 'Uge 1–2 · L1, L3, L4',
      definition:
        'Kernen i .NET er en **runtime engine** (en virtuel maskine), **CLR**, plus et sæt kodebiblioteker. C#-kode bliver ikke oversat direkte til maskinkode: compileren laver **IL** i en assembly, og først CLR’ens **JIT**-compiler oversætter IL til native code, som processoren kører.',
      intro: [
        'Læringsmål 1 er et “redegøre”-mål: principperne i .NET og arkitekturen skal kunne forklares mundtligt, og C# skal kunne beskrives og bruges. Materialet deler emnet på tre lektioner: C# som sprog (L1), typesystemet (L3) og arkitekturen (L4).',
      ],
      concepts: [
        {
          term: 'Fra kildekode til processor',
          body: [
            'Kæden på L4’s første figur: **C# Code** → **Compiler** → **IL Code** (her opstår assembly’en) → **Common Language Runtime** med **JIT Compiler** → **Native Code** → **Processor**. Ved siden af ligger bibliotekerne (Base Class Library, ADO.NET, XML, ASP.NET, WPF/UWP/Forms), som CLR’en stiller til rådighed for den kørende kode.',
            '*Execution model*-figuren udvider billedet: VB, C#, F# og C++ har hver sin compiler, men alle laver IL, og alle IL-kasser løber ind i den samme CLR. Det er **managed code**. C++ kan også gå uden om CLR’en som **unmanaged native code** direkte til styresystemet.',
            'IL, CIL (*Common*) og MSIL (*Microsoft*) er tre navne for det samme. Der er ingen interpreter: IL oversættes til native code enten ved installation (Ngen) eller ved kørsel (JIT).',
          ],
        },
        {
          term: 'JIT, AOT og MAUI',
          body: [
            'Normalt oversætter JIT-compileren IL til native code ved kørsel. **.NET Native** oversætter i stedet Windows Store-apps til native code allerede ved build — **AOT** (ahead-of-time). Fordelene er konsekvent hurtig opstart og hurtig afvikling; ulemperne er, at det kræver trimming, giver en tungere build-proces og større binaries.',
            'Bogen siger om MAUI, at apps bygget med .NET MAUI *er* native apps: de kompileres til en native binary for hver platform, men .NET-koden er stadig JIT-kompileret som standard, og AOT kan slås til. Runtimen er ikke den samme overalt: **Mono** på Android, iOS og macOS og **WinRT** på Windows.',
          ],
        },
        {
          term: 'CLR, BCL og CLS',
          body: [
            '**CLR** er runtime-miljøet, der kører koden og leverer services. Slidet viser dens dele: Class Loader nederst, derover JIT (IL to Native Compiler), Code Manager og Garbage Collector, og ovenover TypeChecker, Exception Manager, SecurityEngine, DebugEngine, Thread Support, COM Marshaler og Base Class Library Support. Se [[garbage-collection|Garbage collection]].',
            '**BCL** er “a core set of libraries”: datatyper, collections, fil-I/O, netværk, dato/tid og tråde, i namespaces som `System`, `System.IO`, `System.Collections`, `System.Threading` og `System.Net.Http.HttpClient`.',
            '**CLS** (Common Language Specification) ligger i stakken mellem sprogene og frameworket. Den skelner mellem *consumer languages*, der kan bruge .NET, og *extender languages*, der kan udvide det. Designmålet er en sprogneutral platform: alle features er tilgængelige fra alle .NET-sprog, man kan arve fra en klasse skrevet i et andet sprog, og debuggere og profilers virker på tværs.',
            'De øvrige designmål: automatisk levetidsstyring med en *multi-generational mark-and-compact* GC, exceptions i stedet for fejlkoder, verificerbar IL uden usikre casts, uinitialiserede variable eller indeks uden for et array, og ét *unified type system*, hvor alt er et objekt.',
          ],
        },
        {
          term: 'Assemblies og versioner',
          body: [
            'En **assembly** (en `.dll`- eller `.exe`-fil) er enheden for deployment, versionering og sikkerhed. Den er selvbeskrivende: fysisk består den af **manifest** (navn, version, filtabel og referencer til eksterne afhængigheder), **type metadata**, **MSIL-kode** og evt. **resources**. Logisk ser udvikleren klasser, interfaces, structs, enums, delegates og resources.',
            'En assembly kan fylde én fil (`Foo.exe`) eller flere, hvor manifestet i hovedfilen peger på `Bar.dll`, `Qaaz.dll` og `CompanyLogo.bmp`. En applikation består af en eller flere assemblies; en privat version foretrækkes frem for en delt, og delte assemblies lægges i Global Assembly Cache.',
            'Versionsslidet: en ny major version hver november. .NET 8 (nov. 2023) og .NET 10 (nov. 2025, “latest release”) er **LTS** med patches i 3 år; .NET 9 og .NET 11 er **STS** med patches i 2 år. Lektionen nævner .NET 10 og C# 14.',
          ],
        },
        {
          term: 'CTS: værdi- og referencetyper',
          body: [
            'Typerne danner et hierarki med `Object` i toppen (**Common Type System**). Under `ValueType` ligger de primitive typer (`Int32`, `Double`, `Boolean`, `Char` …), `struct` og `enum`. `String`, arrays, klasser, interfaces og delegates er **reference types**. `int` i C# er et alias for `System.Int32`, `string` for `System.String`.',
            'Ved `HelloClass c1 = new HelloClass();` ligger referencen `c1` på stakken og objektet på heapen. En `struct` ligger derimod direkte på stakken, og `new` er valgfri. Value types har ingen object header og bliver ikke garbage collected hver for sig.',
            '**Boxing** bygger bro: `object o = i;` kopierer værdien ind i et `System.Int32`-objekt på heapen, og `(int)o` kopierer den tilbage. Ved unboxing skal typen være præcis den samme. Begrundelsen er målet om et sprog, “in which everything really is an object”, mens value types på stakken sparer hukommelse og tid.',
            '`string` er en immutable reference type: `ToUpper()`, `Substring()` og sammensætning laver nye instanser. Dynamiske strenge bygges med `StringBuilder` (eller `StringWriter`). `var` lader compileren udlede typen, men variablen er stadig statisk typet.',
          ],
        },
        {
          term: 'C# i forhold til C++',
          body: [
            'C# blev lavet for at få et sprog, hvor alt virkelig er et objekt, og for at forenkle C++. Forskellene: ingen `delete`, ingen multiple inheritance af implementation (men af interfaces), ingen header-filer, ingen globale funktioner, garbage collection, pointere kun i kode markeret `unsafe`, arrays og strings med bounds checking, altid `.` (ingen `->` eller `::`), og en `try` kan have en `finally`. Alle klasser nedstammer fra `Object` og allokeres med `new`.',
            'Nye nøgleord på klasser: `internal` (kun samme assembly), `readonly`, `sealed`, `abstract`, `base`, og `override`/`new` til versionering. Access modifiers skrives hver gang; standard er `private`.',
            '**Properties** er “smart fields” med `get` og `set`. En auto-property (`{ get; set; }`) får et skjult backing field af compileren. **Object initializers** (`new Person { Name = "Tom", Age = 6 }`) sætter properties i ét udtryk. Et **interface** er en samling abstrakte medlemmer uden data; en reference til det fås med cast (kaster ved fejl), `as` (giver `null`, kun reference types) eller `is` (også value types).',
          ],
        },
      ],
      viz: 'dotnet-compile',
      keyPoints: [
        'C# → compiler → IL i en assembly → JIT i CLR’en → native code. IL, CIL og MSIL er det samme.',
        'Alle .NET-sprog laver samme IL og deler CLR’en: managed code får GC, typekontrol og exceptions.',
        'JIT oversætter ved kørsel; AOT ved build — hurtigere opstart, men trimming, tungere build og større binaries.',
        'Assembly = enheden for deployment og versionering: manifest, type metadata, MSIL og evt. resources.',
        'Klasser er reference types (objektet på heapen); primitives, structs og enums er value types. Boxing kopierer en værdi ind i et objekt.',
        '`string` er immutable — dynamiske strenge bygges med `StringBuilder`.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Boxing og unboxing',
          source: 'FED .Nets type system.pdf s. 9',
          code: `int i = 123;
object o = i;      // "Boxing"

object p = o;

int j = (int)o;    // "Unboxing"
int k = j;`,
        },
        {
          lang: 'csharp',
          title: 'Auto-property: det du skriver, og det compileren laver',
          source: 'Csharp-Introduction.pdf s. 9',
          code: `public class Person
{
  public string Name { get; set; }
}

// kompileres som:
public class Person
{
  private string <Name>k__BackingField;
  public string Name
  {
    get { return <Name>k__BackingField; }
    set { <Name>k__BackingField = value; }
  }
}`,
        },
        {
          lang: 'csharp',
          title: 'Interface-reference med as',
          source: 'Csharp-Introduction.pdf s. 15',
          code: `Triangle t = new Triangle();
IPointy itfPt;
itfPt = t as IPointy;
if (itfPt != null)
      Console.WriteLine("Got interface using as keyword");
else
      Console.WriteLine("OOPS! Not pointy...");`,
        },
      ],
      exam: [
        'Alle eksamenssæt beder om en MAUI-app i C#. Min kode bliver af C#-compileren til IL i en assembly, og ved kørsel oversætter JIT-compileren IL til native code for den platform, appen kører på. AOT kan slås til, så oversættelsen sker ved build.',
        'CLR’en er runtimen, der kører koden og giver services som garbage collection, typekontrol og exception handling. BCL er kernebibliotekerne, fx `System.IO`, collections og `HttpClient`, som jeg bruger til at hente data.',
        'En assembly er enheden for deployment og versionering. Den er selvbeskrivende: manifestet har navn, version og referencer, og type metadata beskriver typerne ved siden af MSIL-koden.',
        'I vintersættets datamodel er `Habit` og `HabitEntry` klasser og altså reference types: variablen holder en reference, og objektet ligger på heapen. Felter som `long HabitId` og `bool Completed` er value types.',
        'C# ligner C++, men har garbage collection, ingen header-filer, ingen multiple inheritance af implementation og kun pointere i `unsafe`-kode.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L01.4_Csharp_Introduction.md'), original: 'L01/Csharp-Introduction.pdf', pages: 's. 2–16' },
        { path: ctx('slides/SW4FED-02_L03.2_NET_typesystem.md'), original: 'L03/FED .Nets type system.pdf', pages: 's. 2–20' },
        { path: ctx('slides/SW4FED-02_L04.1_NET_Architecture.md'), original: 'L04/L4 NET Architecture.pdf', pages: 's. 3–25' },
        { path: ctx('book/MAUI_in_Action_Ch01_Introducing_NET_MAUI.md'), original: '.NET MAUI in Action, kap. 1', pages: 'afsn. 1.2–1.3', note: 'runtime pr. platform (Mono/WinRT); JIT som standard, AOT kan slås til' },
        { path: ctx('eksamen/SW4FED-02_Eksamensforberedelse.md'), original: 'L28/FED Eksamensforberedelse.pdf', pages: 's. 3 og 5', note: 'teorispørgsmål og læringsmål 1' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 3', note: 'datamodellen Habit/HabitEntry' },
      ],
      gaps: [
        'Slidet om implicit typing (L03 s. 20) siger, at `var variable3 = 0;` ikke kan kompilere, fordi compileren ingen typeinformation har. Uden for materialet: compileren udleder `int` af literalen `0`, så linjen kompilerer; det er `var` *uden* initialisering, der ikke kan.',
        'Slides og bog beskriver runtimen forskelligt. L04 taler kun om CLR’en; bogen (kap. 1, afsn. 1.2) siger, at en MAUI-app kører på Mono (Android, iOS, macOS) eller WinRT (Windows). AOT står i slidene kun som *.NET Native* til Windows Store/UWP (L04 s. 6); bogen (afsn. 1.3) siger blot, at AOT kan slås til, og ingen af dem viser hvordan.',
        'CLS vises som et lag i stakken (L04 s. 7) med consumer- og extender-sprog (s. 18), men materialet siger ikke, hvilke regler CLS fastlægger.',
        'Uden for materialet: at value types “allokeres på stakken” (L03 s. 8 og 10) gælder lokale variable. En value type, der er felt i et objekt, ligger inde i objektet på heapen.',
        'Planen henviser til bogens appendix A til lektion 1, men det handler kun om at installere Visual Studio og MAUI-workloaden, ikke om .NET-arkitekturen.',
      ],
      keywords: ['.NET', 'C#', 'CLR', 'Common Language Runtime', 'IL', 'CIL', 'MSIL', 'JIT', 'AOT', '.NET Native', 'Ngen', 'BCL', 'CLS', 'CTS', 'Common Type System', 'assembly', 'manifest', 'metadata', 'managed code', 'unmanaged', 'value type', 'reference type', 'boxing', 'unboxing', 'struct', 'string', 'StringBuilder', 'var', 'property', 'object initializer', 'interface', 'as', 'is', 'LTS', 'STS', 'Mono', 'WinRT'],
    },

    {
      slug: 'async-await',
      title: 'async/await og Task',
      short: 'async/await',
      week: 'Uge 3 · L5',
      definition:
        '`async`/`await` er C#’s sprogstøtte (fra version 5) til **Task-based Asynchronous Pattern** (TAP). Rammer metoden `await` på en operation, der ikke er færdig, returnerer den med det samme, så UI-tråden ikke blokerer; resten af metoden kører senere som en **continuation**.',
      intro: [
        'I en MAUI-app er næsten al I/O asynkron: SQLite-net (`SQLiteAsyncConnection`), `SecureStorage`, `HttpClient` og Shell-navigation med `GoToAsync`. Emnet er derfor grundlaget for [[maui-data|lokal data og web API]] og for kommandoerne i [[mvvm|MVVM]]. Web-sporet har samme nøgleord i JavaScript; se [[promises-fetch|Promises, fetch og JSON]].',
      ],
      concepts: [
        {
          term: 'TAP og asynchronous functions',
          body: [
            '.NET har asynkrone udgaver af rigtig mange operationer, og de følger **TAP**. Slidets opsummering: “the future is asynchronous”.',
            'En *asynchronous function* er altid en metode eller en anonym funktion med `async`-modifieren, og den kan indeholde `await`-udtryk. Eksemplet er en klik-handler, der skriver “Fetching...”, henter en side med `HttpClient.GetStringAsync` og viser længden.',
          ],
        },
        {
          term: 'Task<TResult> og unwrapping',
          body: [
            'Skiller man kaldet ad, ser man typerne: `GetStringAsync` returnerer en `Task<string>`, mens `await task` har typen `string`. `await` “pakker resultatet ud”.',
            'En async-metode må kun returnere `void`, `Task` eller `Task<TResult>`. `Task` og `Task<TResult>` står for en operation, der måske ikke er færdig endnu; `Task<TResult>` giver en værdi af typen `TResult`, `Task` giver intet. Parametrene må ikke have `out` eller `ref`.',
          ],
        },
        {
          term: 'Hvad await faktisk gør',
          body: [
            'Formålet med `await` er at undgå at blokere, mens en tidskrævende operation kører. Koden ligner et blokerende kald — resten af metoden venter — men den aktuelle tråd blokeres ikke.',
            '“Await uncovered”: metoden kører synkront på UI-tråden som enhver anden event handler, indtil den når `await`. Der tjekkes, om resultatet allerede er klar. Hvis ikke, planlægges en **continuation**, og metoden returnerer med det samme. Når operationen er færdig, kører continuationen — linjen efter `await` — på GUI-tråden, altså den kaldende tråd. Derfor må linjen efter `await` sætte `tbxLength.Text` direkte.',
          ],
        },
        {
          term: 'Task.Run til langsomt synkront arbejde',
          body: [
            'Er arbejdet ikke en asynkron operation, men en langsom synkron metode, pakkes den ind i `Task.Run`: `await Task.Run(() => DoSlowWork());`. I slidets eksempel tager `DoSlowWork` over 30 ms.',
            'Forskellen er vigtig: `await` på en I/O-operation frigiver UI-tråden, mens der ventes. `Task.Run` flytter selve beregningen væk fra UI-tråden.',
          ],
        },
        {
          term: 'async void, commands og konstruktører',
          body: [
            'En event handler skal have eventets signatur (`object sender, EventArgs e`), så den bliver `async void`, fx `OnFindMeClicked` i bogens FindMe-app. Kaldes metoden i stedet fra en `Command`, er der intet krav til signaturen; bogen ændrer derfor `AddNewTodo` i `MainViewModel` til `async Task` og “eliminerer et `async void`”.',
            'I ViewModel’en kobles metoden på med `new Command(async () => await AddNewTodo())`. Med Community Toolkit sættes `[RelayCommand]` direkte på en `async Task`-metode (`SwipeDone` giver `SwipeDoneCommand`). Toolkit’et har `AsyncRelayCommand` til asynkrone operationer, og for asynkrone metoder fjernes suffikset `Async`, før `Command` sættes på navnet.',
            'En konstruktør kan ikke være async. MauiTodo’s `Database` kalder derfor `_ = Initialise();` — et “throw away”-kald med discard-operatoren, der ikke venter på, at tabellen er oprettet. Samme konstruktør henter krypteringsnøglen med `SecureStorage.GetAsync("dbKey").Result`, fordi kaldet ikke kan await’es der.',
          ],
        },
      ],
      viz: 'async-await',
      keyPoints: [
        '`async` markerer metoden; `await` er stedet, hvor den kan returnere tidligt.',
        'Koden før `await` kører synkront på UI-tråden; linjen efter er continuationen og kører også på UI-tråden.',
        '`await` på en `Task<T>` giver et `T`.',
        'Returtyper: `void`, `Task` eller `Task<TResult>`. Ingen `out`- eller `ref`-parametre.',
        '`async void` kun hvor signaturen er givet (event handlers); fra en command returneres `Task`.',
        'Langsom synkron kode flyttes væk fra UI-tråden med `await Task.Run(...)`.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'await i en klik-handler',
          source: 'FED async-await.pdf s. 3',
          code: `private async void btnGetHtml_Click(object sender,
                                    RoutedEventArgs e)
{
    tbxLength.Text = "Fetching...";
    string url = tbxUrl.Text;
    HttpClient client = new HttpClient();
    string text = await client.GetStringAsync(url);
    tbxLength.Text = text.Length.ToString();
}`,
        },
        {
          lang: 'csharp',
          title: 'Typerne bag await',
          source: 'FED async-await.pdf s. 4',
          code: `HttpClient client = new HttpClient();
Task<string> task = client.GetStringAsync(url);
string text = await task;`,
        },
        {
          lang: 'csharp',
          title: 'Async-metoder kaldt fra commands i MainViewModel',
          source: 'The MVVM Pattern.pdf s. 22–23',
          code: `public async Task AddNewTodo()
{
    var todo = new TodoItem
    {
        Due = NewTodoDue,
        Title = NewTodoTitle
    };
    var inserted = await _database.AddTodo(todo);
    // ...
}

public MainViewModel()
{
    _database = new Database();
    AddTodoCommand = new Command(async () => await AddNewTodo());
    CompleteTodoCommand = new Command<TodoItem>(async (item) =>
             await CompleteTodo(item));
    _ = Initialize();
}`,
        },
      ],
      exam: [
        'Alle eksamenssættenes Opgave 1 kræver persistering med SQLite, filer eller json-server via `HttpClient`, og de API’er er asynkrone. Jeg await’er kaldene, så UI-tråden ikke blokerer, mens databasen eller serveren svarer.',
        'Når metoden rammer `await`, returnerer den med det samme. Resten af metoden er en continuation, der kører på UI-tråden, når operationen er færdig. Derfor kan jeg opdatere UI’et direkte efter `await`.',
        '`GetStringAsync` returnerer en `Task<string>`; `await` pakker den ud til en `string`. Mine egne async-metoder returnerer `Task` eller `Task<T>`.',
        'Mine event handlers er `async void`, fordi de skal have eventets signatur. I ViewModel’en returnerer metoderne `Task`, fordi de kaldes gennem en command — med Community Toolkit via `[RelayCommand]`.',
        'En konstruktør kan ikke være async. Derfor starter MauiTodo-databasen tabeloprettelsen med `_ = Initialise();` uden at vente på den.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L05.2_async_await.md'), original: 'L05/FED async-await.pdf', pages: 's. 2–8' },
        { path: ctx('slides/SW4FED-02_L05.3_HttpClient.md'), original: 'L05/Httpclient.pdf', pages: 's. 3 og 5', note: 'await med try/catch; én genbrugt HttpClient' },
        { path: ctx('slides/SW4FED-02_L08.1_The_MVVM_Pattern.md'), original: 'L08/The MVVM Pattern.pdf', pages: 's. 22–23' },
        { path: ctx('slides/SW4FED-02_L09.1_MVVM_Community_Toolkit.md'), original: 'L09/MVVM Community Toolkit.pdf', pages: 's. 16–19', note: 'AsyncRelayCommand og navngivning' },
        { path: ctx('book/MAUI_in_Action_Ch03_Making_apps_interactive.md'), original: '.NET MAUI in Action, kap. 3', pages: 'afsn. 3.2–3.3', note: 'async void-handler (listing 3.6), boksen “Async/await in .NET MAUI apps”, Database (listing 3.9)' },
        { path: ctx('book/MAUI_in_Action_Ch09_The_MVVM_Pattern.md'), original: '.NET MAUI in Action, kap. 9', pages: 'afsn. 9.1', note: 'listing 9.3: Task i stedet for async void' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 2', note: 'persistering med SQLite eller json-server via HttpClient' },
      ],
      gaps: [
        'Bogen skriver, at discard-kaldet `_ = Initialise();` kører metoden “in a thread without blocking the UI” (kap. 3, afsn. 3.3). Slidenes model (L05 s. 6) er en anden: en async-metode kører synkront på den kaldende tråd frem til første `await`, og kun `Task.Run` (s. 8) flytter arbejde til en anden tråd.',
        'Materialet bruger `SecureStorage.GetAsync("dbKey").Result` i `Database`-konstruktøren (L02 s. 23, bogen listing 3.9) uden at sige, at `.Result` venter synkront. Uden for materialet: det blokerer den kaldende tråd og kan på UI-tråden fryse appen eller give en deadlock.',
        'Async-slidet (s. 3) opretter en ny `HttpClient` i hver klik-handler, mens HttpClient-slidene (L05.3 s. 5) siger, at en `HttpClient` skal oprettes én gang og genbruges i hele applikationens levetid.',
        'Bogen fjerner et `async void`, så snart signaturen ikke er påtvunget (kap. 9, afsn. 9.1), men siger ikke hvorfor. Uden for materialet: en exception fra en `async void`-metode kan ikke fanges af kalderen, fordi der ingen `Task` er at await’e.',
        'Sommersættet 2025 kræver en nedtællingstimer i MAUI-appen (krav 4.2, s. 3). Materialet viser ingen timer i MAUI. Uden for materialet: `IDispatcherTimer` eller en løkke med `await Task.Delay(...)`.',
        'Uden for materialet: `ConfigureAwait`, `ValueTask` og annullering med `CancellationToken` nævnes ikke.',
      ],
      keywords: ['async', 'await', 'Task', 'Task<TResult>', 'TAP', 'Task-based Asynchronous Pattern', 'asynkron', 'continuation', 'UI-tråd', 'UI thread', 'GUI thread', 'Task.Run', 'async void', 'discard', '.Result', 'GetStringAsync', 'AsyncRelayCommand', 'RelayCommand', 'Command'],
    },

    {
      slug: 'garbage-collection',
      title: 'Garbage collection',
      short: 'Garbage collection',
      week: 'Uge 3 · L5',
      definition:
        'Alle reference types allokeres på den **managed heap**, og koden frigiver aldrig selv et objekt. Garbage collectoren markerer de objekter, der kan nås fra programmets **roots**, og skubber dem sammen i heapen; algoritmen hedder **mark and compact**.',
      intro: [
        'GC er CLR’ens svar på to klassiske fejl: at glemme at frigive hukommelse (**memory leak**) og at bruge hukommelse efter frigivelse (**memory corruption**). Slidene kalder dem værre end de fleste andre bugs, fordi konsekvens og timing er uforudsigelige.',
      ],
      concepts: [
        {
          term: 'Managed heap og NextObjPtr',
          body: [
            'Hver proces får sin egen managed heap, et område i det virtuelle adresserum. `new` allokerer altid i enden af heapen, ved pointeren `NextObjPtr`. Derfor er allokering næsten lige så hurtig som på stakken og meget hurtigere end unmanaged `new`/`malloc`/`HeapAlloc`.',
            '**Large objects** (≥ 85.000 bytes, “may change”) allokeres fra en særlig heap og flyttes normalt ikke.',
            'Hvornår kører en GC? Slidet siger først “når heapen er fuld” og retter så selv: i virkeligheden når **generation 0** er fuld, eller når processoren har ledig tid (*background GC*).',
          ],
        },
        {
          term: 'Roots og mark-fasen',
          body: [
            'Når en collection starter, betragtes alle objekter som garbage. En **root** er et sted i hukommelsen, der kan pege på et objekt (eller være `null`): static fields i en type, argumenter til en metode, lokale variable og CPU-registre. Roots er altid referencer, aldrig value types, og JIT-compileren laver en root table for hver metode.',
            'Mark-fasen: (1) objekter, der kan nås fra roots, markeres; (2) hvert markeret objekts felter tjekkes, og de objekter markeres også, rekursivt; (3) GC’en går op ad trådens call stack og bruger hver metodes root table. Allerede markerede objekter springes over — det sparer tid og forhindrer uendelige løkker ved cirkulære referencer.',
            'Slidenes eksempel: heapen rummer A–J. Roots peger på A, C, D og F, og D peger på H. B, E, G, I og J kan ikke nås.',
          ],
        },
        {
          term: 'Compact-fasen',
          body: [
            'De markerede objekter flyttes ned over de umarkerede med en simpel memory copy. Hver root opdateres til objektets nye adresse, og `NextObjPtr` placeres efter det sidste overlevende objekt. I eksemplet ligger A, C, D, F og H nu tæt, og resten af heapen er fri.',
            'Resultatet er, at der ingen fragmentering opstår, i modsætning til den unmanaged heap. Er alle objekter markeret, sker der ingen compacting, og `new` kaster `OutOfMemoryException`.',
          ],
        },
        {
          term: 'Generationer',
          body: [
            'Generational GC bygger på antagelser, som undersøgelser viser holder for mange apps: jo nyere et objekt er, desto kortere lever det; jo ældre, desto længere; og nye objekter hænger sammen og bruges sammen.',
            'Derfor samler GC’en kun de nye objekter ind: gamle objekter bliver hverken markeret eller gennemgået rekursivt, kun nye overlevere kompakteres, og kun nye objekters roots skal opdateres. Det forbedrer ydeevnen.',
          ],
        },
        {
          term: 'GC i resten af .NET',
          body: [
            'Arkitekturslidene lister “automatic lifetime management” som designmål: alle objekter er garbage-collected, ingen løse pointere, ingen problemer med cirkulære referencer, og GC’en er multi-generational, concurrent, selvkonfigurerende og dynamisk tunet. Garbage Collector er en af CLR’ens komponenter; se [[dotnet-csharp|C# og .NET-arkitekturen]].',
            'Typesystemet hænger sammen med GC: value types har ingen object header og bliver ikke garbage collected hver for sig, mens boxing laver et objekt på heapen. En immutable `string` efterlader garbage, hver gang den “ændres”.',
            'Prisen: slidene regner med, at C# typisk er ca. 10 % langsommere end C++ på grund af GC og range checks, men benchmarks viser både tilfælde, hvor C# er hurtigere, og hvor det er 2–3 gange langsommere. GC kan følges med PerfMon, CLR Profiler og kommercielle værktøjer som ANTS Profiler og dotMemory.',
          ],
        },
      ],
      viz: 'gc-mark-compact',
      keyPoints: [
        'Koden frigiver aldrig et objekt; GC’en frigiver det, når ingen root kan nå det.',
        'Roots: static fields, argumenter, lokale variable og CPU-registre.',
        'Mark: alt, der kan nås fra roots, markeres rekursivt. Compact: overlevere skubbes sammen, roots opdateres, `NextObjPtr` flyttes.',
        'Ingen fragmentering — derfor er `new` næsten lige så hurtig som stack-allokering.',
        'Generationer: nye objekter dør typisk unge, så GC’en samler kun de nye ind.',
        'Objekter på 85.000 bytes eller mere ligger på en særlig heap og flyttes normalt ikke.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Immutable strings efterlader garbage',
          source: 'FED .Nets type system.pdf s. 15',
          code: `string str = "Hello";
char ch = str[3];
// str[3] = 'w';     overstreget på sliden: tegn kan ikke ændres
// str.ToUpper();    overstreget på sliden: resultatet gemmes ikke
str = str.ToUpper();
str = str + " World";
// "Hello" og "HELLO" er nu garbage; str peger på "HELLO World"`,
        },
      ],
      exam: [
        'I C# frigiver jeg aldrig selv objekter. Mine modelobjekter — fx vittighederne i eksamenssættet fra januar 2026 — ligger på den managed heap, og GC’en fjerner dem, når ingen root refererer til dem.',
        'En collection starter med at betragte alt som garbage. Den markerer alt, der kan nås fra roots — static fields, argumenter, lokale variable og CPU-registre — og følger felterne rekursivt.',
        'Derefter kompakteres heapen: de overlevende objekter flyttes ned, roots opdateres til de nye adresser, og `NextObjPtr` sættes efter det sidste objekt. Derfor er der ingen fragmentering, og allokering er næsten lige så hurtig som på stakken.',
        'Generationer bygger på, at nye objekter dør unge. Ved kun at samle de nye objekter ind slipper GC’en for at markere og flytte de gamle.',
        'GC er teori under læringsmål 1, som censor typisk spørger til efter demoen. Prisen er lidt ydeevne: slidene regner med ca. 10 % langsommere end C++, men det afhænger meget af algoritmen.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L05.4_Garbage_Collection.md'), original: 'L05/Garbage Collection.pdf', pages: 's. 2–11' },
        { path: ctx('slides/SW4FED-02_L03.2_NET_typesystem.md'), original: 'L03/FED .Nets type system.pdf', pages: 's. 11 og 15', note: 'value types og garbage fra immutable strings' },
        { path: ctx('slides/SW4FED-02_L04.1_NET_Architecture.md'), original: 'L04/L4 NET Architecture.pdf', pages: 's. 11–12', note: 'GC som CLR-komponent og designmål' },
        { path: ctx('slides/SW4FED-02_L01.4_Csharp_Introduction.md'), original: 'L01/Csharp-Introduction.pdf', pages: 's. 3' },
        { path: ctx('eksamen/SW4FED-02_Eksamensforberedelse.md'), original: 'L28/FED Eksamensforberedelse.pdf', pages: 's. 3 og 5', note: 'teorispørgsmål og læringsmål 1' },
      ],
      gaps: [
        'Slidene nævner kun “generation 0” ved navn (s. 3) og siger ikke, hvor mange generationer der er, eller hvornår et objekt rykker op. Uden for materialet: .NET har generation 0, 1 og 2, og et objekt, der overlever en collection, forfremmes til næste generation.',
        'Slidene beskriver C++-mønstret med destructor (s. 2), men ikke hvordan man i C# frigiver andet end hukommelse (filer, forbindelser). Det nærmeste er `finally` (L01 s. 7) og `using` foran `HttpResponseMessage` (L05.3 s. 3). Uden for materialet: `IDisposable`/`Dispose` med `using` er den deterministiske oprydning; GC’en kører først på et ubestemt tidspunkt.',
        'Bogen (*.NET MAUI in Action*) nævner ikke garbage collection; emnet står kun i slidene.',
        'Performancetallene (s. 11) henviser til en ældre CodeProject-benchmark; materialet har ingen nyere målinger.',
      ],
      keywords: ['garbage collection', 'GC', 'garbage collector', 'managed heap', 'heap', 'NextObjPtr', 'mark and compact', 'root', 'roots', 'root table', 'marking', 'compacting', 'generation', 'generationer', 'generation 0', 'large object', 'memory leak', 'memory corruption', 'OutOfMemoryException', 'background GC', 'PerfMon', 'CLR Profiler', 'dotMemory'],
    },
  ],
}
