import type { Part } from '../types'
import { parallelitetB } from './p6-parallelitet-b'
import { m } from './paths'

export const parallelitet: Part = {
  id: 'parallelitet',
  title: 'Parallelitet og fejlhåndtering',
  topics: [
    {
      slug: 'threading',
      title: 'Tråde og synkronisering i C#',
      short: 'Tråde og synkronisering',
      week: 'Uge 11 · W10',
      definition:
        'En **tråd** er en selvstændig udførelse inde i en proces. Tråde i samme proces deler data, men har hver sin call stack og thread local storage. Concurrency er “things happening at the same time” — eller at der skiftes så hurtigt, at det ligner. Decket *Threading in C#* går fra `Thread` over thread pool’en til låse og signaler.',
      concepts: [
        {
          term: 'Concurrency og de to slags parallelisme',
          body: [
            '**Data parallelism**: samme beregning på forskellige dataelementer samtidig. **Functional parallelism**: uafhængige funktionelle opgaver samtidig. Functional parallelism har tre varianter: minimér latency, når der skal reageres på events; forhindr, at langsom I/O blokerer main-tråden; maksimér throughput på multicore.',
            'Kun den sidste handler om fart. Motivationen for resten af kurset står på slide 10: CPU-frekvensen er svær at hæve, så forbedringerne kommer som flere cores. Med Herb Sutters ord: “The free lunch is over!” Multicore-hardware kræver concurrent software.',
          ],
        },
        {
          term: 'Amdahl’s lov',
          body: [
            'Tre ting begrænser gevinsten: hvor stor en del af programmet der kan paralleliseres, antallet af cores og context switching — det sidste regner Amdahl’s lov ikke med. Loven giver en *teoretisk øvre grænse* for speedup, når en del af systemet paralleliseres.',
            'Med `P` = den andel af algoritmen, der kan paralleliseres, og `N` = antal cores: `S(N) = 1 / ((1 − P) + P / N)`. Slidets eksempler: `P = 0.3`, `N = 4` giver `S = 1.290` (29 % gevinst); `P = 0.9`, `N = 2` giver `S = 1.818` (82 % gevinst).',
            'Slidet spørger “As N→∞, S(N) →?”. Grafen “cores ain’t all” (s. 14) svarer: kurverne for 50, 75, 90 og 95 % parallel andel flader ud ved 2, 4, 10 og 20, altså `1 / (1 − P)`. Den sekventielle del sætter loftet, uanset hvor mange af de 65536 processorer på x-aksen man tager i brug.',
          ],
        },
        {
          term: 'Tråde i en proces',
          body: [
            'I WIN32 kan data i én proces ikke tilgås fra en anden, mens tråde i samme proces deler data. Hver tråd har sin egen **call stack** og **TLS** (thread local storage). I .NET ligger trådene i **application domains**; der er ingen 1:1-sammenhæng mellem domæner og tråde, og en tråd kan skifte domæne over tid.',
            'En tråd oprettes med en metode og startes: `new Thread(work.DoLotsOfWork)` og `Start()`. Parametre kan gives på tre måder: sæt en property på arbejdsobjektet før `Start()`, giv ét argument til `Start(500)` (“only one parameter, must be of type object and casted in thread func”), eller brug en lambda: `new Thread(() => work.DoLotsOfWork(300))`.',
            '`Thread.Sleep(50)` sover **mindst** 50 ms. `Thread.Sleep(0)` er et yield: står en anden tråd klar, kører den; ellers fortsætter den tråd, der yieldede. `Suspend` og `Resume` er markeret `Obsolete` med henvisning til `Monitor`, `Mutex`, events og `Semaphore`.',
          ],
        },
        {
          term: 'Vente, afslutte, stoppe',
          body: [
            '`Join()` blokerer kalderen, til tråden er færdig; `Join(1000)` giver op efter 1000 ms. Skal man vente på flere tråde, får hver tråd et `AutoResetEvent`, som den kalder `Set()` på, og main venter i `WaitHandle.WaitAll(handles)`.',
            '**Foreground/background** har intet med prioritet at gøre. Main-tråden og alle tråde, man selv opretter, er foreground, og applikationen lukker ikke, før de er færdige. Med `myThread.IsBackground = true` kan applikationen lukke, selv om tråden stadig kører.',
            'En tråd stoppes **gracefully** med et flag, som tråden selv tjekker (`while (!ShallStop)`). `Abort()` skal undgås: den kaster en exception på tråden, man ved ikke, hvad tråden var i gang med, og tråden kan fange exceptionen og køre videre.',
            'En exception i en child thread fanges **ikke** af den tråd, der oprettede den, uanset `try`/`catch` omkring `Start()` — den afslutter applikationen. `try`/`catch` skal ligge inde i trådens egen metode. Prioriteter kan sættes (`ThreadPriority.Highest`), men slidet advarer om priority inversion, livelocks og starvation: “You almost never want to mess with this. So don’t!”',
          ],
        },
        {
          term: 'Thread pool og vejen til tasks',
          body: [
            'Tråde er dyre: 1 MB hukommelse pr. tråd (primært stak), 200.000 cycles at oprette, 100.000 at nedlægge og 6.000–8.000 pr. skift mellem tråde. Mange tråde giver dårlig udnyttelse af cachen.',
            'Thread pool’en er løsningen: et begrænset antal tråde oprettes på forhånd og genbruges, og work items sættes i kø, så finkornet multithreading bliver muligt. CLR giver hver applikation en pool. To forbehold: pool-tråde kan ikke navngives, og de er **altid background threads**.',
            'Poolen bruges på tre måder: `ThreadPool.QueueUserWorkItem(DoWork, id)` (1000 work items i slidets eksempel), et asynkront delegate (`BeginInvoke`/`EndInvoke` med `AsyncCallback`) og Task Parallel Library. TPL kom i .NET 4.0 — “a task should be considered a small, isolated unit of work” — og `async`/`await` i .NET 4.5. Resten af uge 11 bygger videre i [[parallel-tasks|parallelle tasks]].',
          ],
        },
        {
          term: 'Låse: Monitor, lock, Mutex, Semaphore',
          body: [
            'Slide 49 deler synkronisering i tre: *simple blocking* (`Thread.Sleep()`, `Thread.Join()`, `Task.Wait()`), *locking constructs* — eksklusive (`lock`, `Monitor.Enter()`/`Monitor.Exit()`, `Mutex`) og ikke-eksklusive (`Semaphore`) — og *signalling constructs* (`Monitor.Wait()`, `xxxEvent`).',
            '**Monitor** forhindrer kollisioner, hvis den bruges korrekt, dvs. af **alle** brugere af den delte ressource. `Monitor.Enter(o)` blokerer kun *andre* tråde — den kaldende tråd kan gå ind igen. Den kan kun låse reference types: en value type bliver boxed, og det er en synkroniseringsfejl. Den låser kun inden for samme application domain. `Exit` ligger i `finally`.',
            '**`lock`** er C#’s forkortelse for `Monitor.Enter`/`Monitor.Exit`. Best practice er et privat låseobjekt; man kan låse på `this`, men så kan andre låse på samme objekt og forhindre concurrency. I slidets `Counter` låser både `Increment()` og getteren på `Count`.',
            '**`Mutex`** kan låse på tværs af application domains og processer (navngivne mutexes), låser på sig selv, tages med `WaitOne()` (evt. med timeout) og frigives med `ReleaseMutex()` — kun af den tråd, der ejer den. **`Semaphore`** er en tællende semafor: `WaitOne()` går ind og tæller ned, eller blokerer ved 0; `Release()` tæller op eller slipper en ventende tråd løs, i vilkårlig rækkefølge. Den er *thread-agnostic*, i modsætning til mutexen, og har et max count.',
            'Sammenligningen på s. 55 (tid for én lås og oplåsning uden blokering, Intel Core i7 860): `lock` 20 ns, `Mutex` 1000 ns, `SemaphoreSlim` 200 ns, `Semaphore` 1000 ns, `ReaderWriterLockSlim` 40 ns, `ReaderWriterLock` 100 ns. Kun `Mutex` og `Semaphore` er cross-process. Låse og deadlocks på OS-niveau hører til Systemprogrammering (SYS).',
          ],
        },
        {
          term: 'Signalering med event wait handles',
          body: [
            'Signalering betyder, at én tråd venter, til en anden signalerer. Event wait handles er den simpleste form og har intet med C#’s `event` at gøre. `AutoResetEvent`: `Set()` lukker én ventende igennem — tænk “turnstile”. `ManualResetEvent`: `Set()` lukker igennem indtil næste `Reset()` — tænk “gate”. `CountdownEvent` åbner efter et forudbestemt antal `Set()` (fra .NET 4.0).',
            'Øvelserne følger slidene: opgave 1–8 (efter slide 39) handler om `HelloWriter`-tråde, sleep, join, en `NeverEndingStoryThread` som foreground og background, og graceful stop. Opgave 9–12 (efter slide 57) tæller en delt `TotalCount` op fra to tråde (200000 og 500000 gange), spørger “What is the shared resource?”, og tæller kort fra tre filer med tre tråde og derefter med thread pool’en.',
          ],
        },
      ],
      viz: 'threading',
      keyPoints: [
        'Data parallelism: samme beregning på forskellige data. Functional parallelism: uafhængige opgaver.',
        'Amdahl: `S(N) = 1 / ((1 − P) + P / N)`; loftet er `1 / (1 − P)`, og context switching er ikke med.',
        'Tråde deler procesdata, men har hver sin call stack og TLS.',
        'Foreground-tråde holder applikationen i live; pool-tråde er altid background.',
        'Stop tråde med et flag, ikke `Abort()`. Fang exceptions inde i trådens metode.',
        'En tråd koster 1 MB og 200.000 cycles — brug thread pool’en eller tasks.',
        '`lock` (20 ns) inden for processen; `Mutex`/`Semaphore` (1000 ns) på tværs af processer.',
        '`AutoResetEvent` = turnstile, `ManualResetEvent` = gate.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Amdahl’s lov med slidets eksempler',
          source: '11 Threading in C#.pdf s. 13',
          code: `S(N) = 1 / ((1 - P) + P / N)

P = 0.3, N = 4  ->  S(N) = 1.290   (performance gain 29%)
P = 0.9, N = 2  ->  S(N) = 1.818   (performance gain 82%)
N -> uendelig   ->  S(N) -> 1 / (1 - P)   (grafen s. 14)`,
        },
        {
          lang: 'csharp',
          title: 'Stop en tråd gracefully med et flag',
          source: '11 Threading in C#.pdf s. 32',
          code: `class Program
{
    static void Main(string[] args)
    {
        LotsOfWork work = new LotsOfWork();
        Thread myThread = new Thread(work.DoLotsOfWork);
        myThread.Start();
        System.Console.ReadKey();

        work.ShallStop = true;
    }
}

public class LotsOfWork
{
    public bool ShallStop { get; set; } = false;
    public void DoLotsOfWork()
    {
        int iteration = 0;
        while (!ShallStop)
        {
            Console.WriteLine("iteration: {0}", iteration);
            Thread.Sleep(50); // 50 milliseconds
            iteration++;
        }
        Console.WriteLine("Thread is done!");
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Exceptions i en tråd fanges ikke af opretteren',
          source: '11 Threading in C#.pdf s. 35–36',
          code: `static void Main()
{
  try
  {
    new Thread (Go).Start();
  }
  catch (Exception ex)
  {
    // We'll never get here!
    Console.WriteLine ("Exception!");
  }
}

static void Go()
{
  throw new Exception(); // Will terminate application
}

// Korrekt: fang exceptionen inde i trådens egen metode
static void BetterGo()
{
  try
  {
    throw new Exception("OH NO!");
  }
  catch (Exception ex)
  {
    Console.WriteLine("Exception! " + ex.Message);
  }
}`,
        },
        {
          lang: 'csharp',
          title: 'lock med et privat låseobjekt',
          source: '11 Threading in C#.pdf s. 51',
          code: `class Counter
{
    private int c1 = 0;
    private object myLock = new object();

    public void Increment()
    {
        lock (myLock)      // Monitor.Enter()
        {
            c1++;
        }                  // Monitor.Exit()
    }

    public int Count
    {
        get
        {
            lock (myLock)
            {
                return c1;
            }
        }
    }
}`,
        },
      ],
      exam: [
        'Concurrency er ting, der sker samtidig — eller skifter så hurtigt, at det ligner. Materialet skelner mellem data parallelism, hvor samme beregning køres på forskellige data, og functional parallelism, hvor uafhængige opgaver kører samtidig, fx for at holde UI’et responsivt under langsom I/O.',
        'Amdahl’s lov siger, at speedup er `1 / ((1 − P) + P / N)`. Med 90 % parallel kode på to cores får man 1,818, og uanset antal cores kommer man aldrig over 10, fordi den sekventielle del sætter loftet. Loven ser bort fra context switching, så i praksis er grænsen lavere.',
        'Tråde er dyre — 1 MB stak og 200.000 cycles at oprette — så man bruger thread pool’en eller tasks. Pool-tråde er background threads, så applikationen kan lukke midt i deres arbejde, og en exception i en tråd fanges ikke af den tråd, der startede den.',
        'Delt tilstand beskyttes med en lås. `lock` er en forkortelse for `Monitor.Enter`/`Exit` og er billigst, 20 ns; `Mutex` og `Semaphore` kan bruges på tværs af processer, men koster 1000 ns. En semafor tillader flere samtidige og er thread-agnostic, mens en mutex kun kan frigives af den tråd, der ejer den.',
        'Afvejningen: man skal låse alle steder, den delte ressource bruges — også i getteren — ellers virker låsen ikke. Man låser på et privat objekt, aldrig på en value type, for den bliver boxed, og så låser hver tråd på sit eget objekt.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W10_Threading_in_CSharp.md'), original: '11 Threading in C#.pdf', pages: 's. 2–57' },
        { path: m('opgaver/SW4SWD-01_Threading_Exercises.md'), original: 'Exercises.html', note: 'Opgave 1–12' },
      ],
      gaps: [
        'Lektionsplanen (Lesson plan.html) nævner ikke tråde: uge 10 er “Mandatory Exercise”, og uge 11 starter med “Task”. At *Threading in C#* er selvstudie før uge 11, står kun i markdown-konverteringens kommentar, ikke i originalerne. Decket ligger i mappen til uge 10.',
        'Slidene staver loven “Ahmdal” på s. 11–12 og “Amdahl” på s. 13–14. Spørgsmålet “As N→∞, S(N) →?” (s. 13) besvares ikke i tekst; svaret `1 / (1 − P)` kan kun aflæses af grafen på s. 14.',
        'Slidet om Amdahl definerer `N` som “number of CPU cores times.” — “times” hænger (s. 13).',
        'Kodekommentaren på s. 36 siger “NullReferenceException - will get caught below”, men koden kaster `new Exception("OH NO!")`.',
        'Stavefejl på slidene: `myThead.IsAlive` (s. 33–34) og `AplicationException` (s. 52; klassen hedder `ApplicationException`).',
        '`Monitor.Wait()` nævnes som signalling construct (s. 49), og `SemaphoreSlim`/`ReaderWriterLockSlim` står kun i sammenligningstabellen (s. 55). Ingen af dem forklares eller vises i kode.',
        'Tabellen på s. 55 er et billede uden kildeangivelse ud over målemaskinen (Intel Core i7 860).',
        'Øvelsernes bilag `11 Hints.pdf` og `11 Cards.zip` ligger bag Brightspace og er ikke i materialet.',
        'Uden for materialet: I .NET Core og .NET 5+ kaster `Thread.Abort()` `PlatformNotSupportedException`, delegaters `BeginInvoke`/`EndInvoke` understøttes ikke, og der er kun ét application domain pr. proces. Slidene viser .NET Framework-varianten.',
      ],
      keywords: ['thread', 'tråd', 'concurrency', 'samtidighed', 'Amdahl', 'Ahmdal', 'speedup', 'data parallelism', 'functional parallelism', 'free lunch', 'TLS', 'call stack', 'application domain', 'Join', 'Sleep', 'yield', 'foreground', 'background', 'IsBackground', 'Abort', 'ShallStop', 'thread pool', 'QueueUserWorkItem', 'BeginInvoke', 'Monitor', 'lock', 'Mutex', 'Semaphore', 'SemaphoreSlim', 'ReaderWriterLockSlim', 'AutoResetEvent', 'ManualResetEvent', 'CountdownEvent', 'WaitHandle', 'race condition', 'priority inversion', 'starvation', 'livelock'],
    },

    {
      slug: 'parallel-tasks',
      title: 'Parallelle tasks',
      week: 'Uge 11 · W11.1',
      definition:
        'En **task** er en isoleret, logisk arbejdsenhed — en sekventiel operation, der egner sig til parallelisering. En task er **ikke** en tråd: Task Parallel Library (TPL) lægger tasks i en work queue, og en task scheduler fordeler dem på worker threads fra .NET’s thread pool. Parallelle tasks bruges, når man har flere distinkte asynkrone operationer.',
      concepts: [
        {
          term: 'TPL',
          body: [
            'Tasks ligger i `System.Threading.Tasks` og leveres af TPL, der er en del af Microsoft Parallel Extensions for .NET sammen med PLINQ. TPL skalerer graden af parallelisme dynamisk, så alle processorer udnyttes, og hjælper med at partitionere arbejdet og schedulere tasks i thread pool’en.',
            'Fordi en task kun er et work item i en kø, kan der findes “millions” af tasks til “a few threads”. Det er forskellen til [[threading|rå tråde]], der hver koster 1 MB stak.',
          ],
        },
        {
          term: 'Starte og vente',
          body: [
            'Slidet viser `DoLeft()` og `DoRight()` på fire måder: sekventielt, med `Parallel.Invoke(DoLeft, DoRight)` (opretter selv tasks og venter på dem), med `Task.Run` (fra .NET 4.5) og med `Task.Factory.StartNew`. De to sidste venter med `Task.WaitAll(t1, t2)`.',
            'Tasks begynder ikke nødvendigvis at køre, når de oprettes. De lægges i en work queue, hvorfra scheduleren tager dem, når fx en core er ledig. Man venter med `Wait`, `WaitAll` (alle) eller `WaitAny` (den første).',
            '**Tasks udskyder exception handling**: den, der kalder `Wait*()`, får exceptionen. Det giver “sequential-style” fejlhåndtering. Med en rå `Thread` fanger opretteren aldrig exceptionen.',
          ],
        },
        {
          term: 'Default task scheduler',
          body: [
            'TPL kører tasks på worker threads styret af `ThreadPool`-klassen, mindst én tråd pr. core. Custom task schedulers er ikke dækket.',
            'Første tilgang er én **global queue**: top-level tasks lægges i køen, og worker thread 1…n tager dem i FIFO-rækkefølge. Problemet: mange cores og finkornede tasks giver contention på køen.',
            'Den faktiske default scheduler giver hver worker thread en **lokal kø** ved siden af den globale. Top-level tasks kører stadig i FIFO-orden fra den globale kø, mens en tråd pusher og popper sine lokale subtasks i **LIFO**-orden. De lokale køer er “work-stealing” task queues.',
          ],
        },
        {
          term: 'Inlining',
          body: [
            'Scheduleren må **inline** ventende tasks: når task1 venter på task2, og task2 ikke er startet, kan scheduleren køre task2 med det samme på task1’s tråd. Det sker kun, når task1 kalder `Task.Wait(task2)` eller `Task.WaitAll()`, og task2 ligger i den lokale kø på den tråd, task1 kører på.',
            'Samme mekanisme ses ved [[futures|futures]]: læses `.Result` på en task, der ikke er startet, køres den inline hos kalderen, hvis muligt.',
          ],
        },
        {
          term: 'Data til tasks: closures og state objects',
          body: [
            'En lambda, der bruger variable uden for sit scope (`data1`, `data2`), får en **closure**, som compileren laver. Det er nemt — og fejlbehæftet: `for (int i = 0; i < 10; i++) Task.Run(() => … + i)` udskriver “Hello from task 10” ti gange, fordi alle lambdaer fanger samme `i`. Reglen: kopiér variablen til en lokal (`var localI = i;`) før den fanges. Så kommer 0–9, i vilkårlig rækkefølge (0, 4, 1, 3, 2, 8, 6, 9, 5, 7 i slidets kørsel).',
            'Alternativet er et **state object**: `Task.Factory.StartNew((state) => …, taskNo)` får værdien med som `state`. Det kan ikke gøres med `Task.Run()`. Den tredje mulighed er et objekt med både state og metode: `Work` har `Data1`, `Data2` og `Run()`, og `Task.Run(w.Run)` starter den.',
          ],
        },
        {
          term: 'TAP og await',
          body: [
            '.NET 4.5 fik asynkrone versioner af mange operationer efter **Task-based Asynchronous Pattern (TAP)**. TAP bruges med `async`-modifieren og `await`, så den kaldende tråd — fx UI-tråden — forbliver responsiv, mens tunge operationer kører.',
            'I WPF-eksemplet returnerer `GetStringAsync()` en `Task<string>`, som `await` pakker ud. Koden efter `await` pakkes som en ny task, der schedules på samme tråd, når operationen returnerer — derfor kan `tbxLength.Text` sættes direkte.',
            'Den awaitede operation udføres “in the hardware, the drivers, and perhaps another thread”; brug `await` til tidskrævende I/O. Metoden returnerer straks ved `await`. Er resultatet klar, fortsætter kalderen; ellers schedules en continuation på kalderens tråd. Samme mekanisme i FED: [[fed/async-await|async/await i FED]].',
          ],
        },
        {
          term: 'ConfigureAwait',
          body: [
            '`ConfigureAwait(false)` undgår at queue task-callbacket: koden efter `await` kører ikke nødvendigvis i samme context. Det forbedrer performance, men er ikke altid muligt, fx i UI-kode. `ConfigureAwait(true)` er standardopførslen.',
          ],
        },
      ],
      viz: 'parallel-tasks',
      keyPoints: [
        'En task er en logisk arbejdsenhed, ikke en tråd.',
        '`Parallel.Invoke`, `Task.Run` og `Task.Factory.StartNew` starter tasks; `Wait`, `WaitAll` og `WaitAny` venter.',
        'Exceptions kastes igen hos den, der kalder `Wait*()` — “sequential-style”.',
        'Default scheduler: global FIFO-kø til top-level tasks plus lokale LIFO work-stealing-køer pr. worker thread.',
        'Inlining: en ikke-startet task kan køre på den ventende tråd.',
        'Kopiér loopvariablen til en lokal, før en lambda fanger den.',
        '`Task.Run` tager ikke et state object — det gør `Task.Factory.StartNew`.',
        '`await` blokerer ikke kalderen; koden efter kører som continuation. `ConfigureAwait(false)` frigør den fra context.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Fire måder at køre DoLeft og DoRight',
          source: 'Concurrency - Parallel Tasks.pptx, slide 4',
          code: `// Good ole sequential code
public void DoAll()
{
  DoLeft();
  DoRight();
}

// Using Parallel.Invoke()
public void DoAll()
{
  // Parallel.Invoke() automatically creates tasks
  // for the arguments, then awaits for completion
  Parallel.Invoke(DoLeft, DoRight);
}

// Using Task.Run() – from .NET 4.5
public void DoAll()
{
  Task t1 = Task.Run((Action) DoLeft);
  Task t2 = Task.Run((Action) DoRight);
  Task.WaitAll(t1, t2); // Wait for both tasks to complete
}

// Using TaskFactory
public void DoAll()
{
  Task t1 = Task.Factory.StartNew(DoLeft);
  Task t2 = Task.Factory.StartNew(DoRight);
  Task.WaitAll(t1, t2); // Wait for both tasks to complete
}`,
        },
        {
          lang: 'csharp',
          title: 'Closure-fælden og rettelsen',
          source: 'Concurrency - Parallel Tasks.pptx, slide 11',
          code: `// Forkert: alle tasks fanger samme i -> "Hello from task 10" x 10
for(int i=0; i< 10; i++)
  Task.Run(()=> {
    Console.WriteLine(" Hello from task " + i);
  });

// Rigtigt: capture value of i in local variable localI
for(int i=0; i< 10; i++)
{
  var localI = i;
  Task.Run(()=> {
    Console.WriteLine(" Hello from task " + localI);
  });
}`,
        },
        {
          lang: 'csharp',
          title: 'TAP: UI’et forbliver responsivt',
          source: 'Concurrency - Parallel Tasks.pptx, slide 15',
          code: `private async void btnGetHtml_Click(object sender, RoutedEventArgs e)
{
    tbxLength.Text = "Fetching...";
    string url = tbxUrl.Text;
    HttpClient client = new HttpClient();
    string text = await client.GetStringAsync(url);  // Task<string> pakkes ud
    tbxLength.Text = text.Length.ToString();         // continuation på samme tråd
}`,
        },
      ],
      exam: [
        'En task er en isoleret, logisk arbejdsenhed — ikke en tråd. TPL lægger tasks i en kø, og default scheduleren fordeler dem på worker threads fra thread pool’en, så millioner af tasks kan køre på få tråde.',
        'Scheduleren har en global FIFO-kø til top-level tasks og en lokal kø pr. worker thread, hvor subtasks pushes og poppes LIFO. De lokale køer er work-stealing. Én global kø alene giver contention, når der er mange cores og finkornede tasks.',
        'Tasks er bedre end rå tråde, fordi exceptions kastes igen hos den, der kalder `Wait`, så fejlhåndteringen kan skrives sekventielt. Og en task, der ikke er startet, kan inlines på den tråd, der venter på den.',
        'Closures er en fælde: fanger man loopvariablen i en `for`-løkke, ser alle tasks den sidste værdi — i slidets eksempel 10 ti gange. Man kopierer den til en lokal variabel først, eller sender et state object med `Task.Factory.StartNew`.',
        'TAP med `async`/`await` bruges til I/O: kalderen blokeres ikke, og koden efter `await` kører som continuation i samme context. `ConfigureAwait(false)` giver bedre performance, men kan ikke bruges, hvor continuation’en skal tilbage på UI-tråden.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W11.1_Concurrency_Parallel_Tasks.md'), original: 'Concurrency - Parallel Tasks.pptx', pages: 'slide 2–17' },
        { path: m('noter/SW4SWD-01_Supplemental_Videos.md'), original: 'Supplemental Videos.html', note: 'Valgfri videoer: π beregnet med dart og en visualisering af sorteringsalgoritmer (også slide 18)' },
      ],
      gaps: [
        'Slide 8 skriver “work-stealing” som label på de lokale køer, men viser og forklarer ikke, hvordan en ledig tråd stjæler fra en anden tråds kø.',
        'Figurerne på slide 7–8 (“FIGURE 3 Per-thread local task queues”) er lånt fra en ekstern kilde, som slidet ikke angiver.',
        'Slide 3 lover at vende tilbage til “several distinct asynchronous operations” under TAP; TAP-slidene gør det ikke eksplicit.',
        'Slide 9 skriver “when task1 awaits task2”, men betingelsen er et blokerende `Task.Wait(task2)` eller `Task.WaitAll()`, ikke `await`-nøgleordet.',
        'Slide 17 forklarer ikke, hvad “context” er. Uden for materialet: det er den `SynchronizationContext` (fx UI-trådens), som continuation’en ellers sendes tilbage til.',
        'Uden for materialet: fra C# 5 får `foreach` en ny loopvariabel pr. iteration, så fælden på slide 11 gælder `for`, ikke `foreach`.',
        'Markdown-noten til de supplerende videoer knytter dart-videoen til “embarrassingly parallel” problemer; det er konverterens kommentar, ikke underviserens.',
      ],
      keywords: ['task', 'Task', 'TPL', 'Task Parallel Library', 'Task.Run', 'Parallel.Invoke', 'Task.Factory.StartNew', 'Wait', 'WaitAll', 'WaitAny', 'task scheduler', 'work-stealing', 'global queue', 'local queue', 'FIFO', 'LIFO', 'inlining', 'closure', 'state object', 'TAP', 'Task-based Asynchronous Pattern', 'async', 'await', 'continuation', 'ConfigureAwait', 'PLINQ', 'thread pool'],
    },

    {
      slug: 'parallel-loops',
      title: 'Parallelle loops',
      week: 'Uge 11 · W11.2',
      definition:
        'Et **parallelt loop** kører iterationerne i et loop samtidig, når de er uafhængige — PoPP kalder det “delightfully parallel execution”. Det svære er ikke syntaksen, men **partitioneringen**: hvordan iterationerne fordeles på trådene. `Parallel.For` og `Parallel.ForEach` fra .NET 4 løser det med dynamisk trådantal og load balancing.',
      intro: [
        'En betragtelig del af en applikations arbejde foregår i loops, og ofte er iterationerne uafhængige. Så kan `for (int i = 0; i < 10; i++)` blive til `Parallel.For(0, 10, i => …)`: kroppen flytter ind i en lambda, og biblioteket styrer løkken.',
      ],
      concepts: [
        {
          term: 'Recap: lambdaer og closures',
          body: [
            'En lambda kan gemmes i en `Func<int, int>` eller en `Action<int>` og sendes som parameter — `MeasureTime(Func<int> someFun)` måler et vilkårligt stykke arbejde uden at kende det. Det er samme greb, `Parallel.For` bruger: loop-kroppen er en `Action<int>`.',
            'En closure fanger **variablen**, ikke værdien. Sættes `stop = 10` efter lambdaen er defineret, men før den kaldes, kører den 10 iterationer i stedet for 5.',
          ],
        },
        {
          term: 'MyParallelFor: en håndlavet version',
          body: [
            'Formålet er “just to appreciate the problems of partitioning”. `MyParallelFor(inclusiveLowerBound, exclusiveUpperBound, body)` bruger én tråd pr. core: `size / numProcs` iterationer til hver. Med `size = 35` og `numProcs = 4` er `range = 8`; den sidste tråd får resten op til `exclusiveUpperBound`.',
            '`start` og `end` erklæres inde i for-løkken, så hver tråds lambda fanger sine egne. Alle tråde startes og joines derefter, så metoden først returnerer, når loopet er færdigt. Kommentaren i koden kalder det selv: “static partitioning”.',
          ],
        },
        {
          term: 'Trådomkostning og oversubscription',
          body: [
            'At oprette og nedlægge tråde er dyrt: 1 MB stak og 100.000–200.000 cycles. Og `MyParallelFor()` kan selv blive kaldt parallelt, så der kommer 8, 12, 16 … tråde på 4 CPU’er. Det er **oversubscription**: OS’et bruger tid på context switching, og det koster både tid og cache.',
            'Slidets tidslinje viser seks tråde, der skifter mellem Running, Ready og Blocked. Det meste er gult — Ready, klar men uden en core: “yellow is pain!”.',
          ],
        },
        {
          term: 'Statisk partitionering og load imbalance',
          body: [
            'Når iterationerne ikke koster det samme, bliver nogle tråde færdige før andre, og i en statisk partitionering kan tråde ikke “help each other out”. Profileringen på s. 9 viser processen på 4 logiske cores, der falder til 2 og derefter 1, efterhånden som trådene bliver færdige; gennemsnitlig CPU-udnyttelse er 44 %.',
            'Regneeksemplet: et loop over `N = [1; 12]`, hvor iteration `i` tager `i` sekunder, er 78 sekunder arbejde i alt. Ideelt på to cores: 39 sekunder. Halveres intervallet statisk, tager tråd 1 iteration 1–6 (21 s) og tråd 2 iteration 7–12 (57 s). Loopet tager 57 s — 46 % længere end ideelt. Slidets ideelle fordeling giver den ene tråd 1–5 og 7–9 og den anden 6 og 10–12, 39 s hver.',
          ],
        },
        {
          term: 'Statisk eller dynamisk partitionering',
          body: [
            'Partitionering er et spektrum fra **fully static** (mindre synkronisering) til **fully dynamic** (mere load balancing). Effektiv statisk partitionering kræver forhåndsviden om eksekveringstiden, men ingen synkronisering — og er stadig “less-than-ideal”. Effektiv dynamisk partitionering kræver ingen forhåndsviden, men kræver synkronisering, “or the threads will step on each other’s toes”.',
          ],
        },
        {
          term: 'Parallel.For og Parallel.ForEach',
          body: [
            'Klassen `Parallel` kom i .NET 4 med tre statiske metoder: `Parallel.For(start, end, Action)`, `Parallel.ForEach(collection, Action)` og `Parallel.Invoke(Action)` (se [[parallel-tasks|parallelle tasks]]). `For` og `ForEach` giver exception handling, thread-local state, nested parallelism, dynamisk trådantal og sofistikeret load balancing — “The works!”. Begge returnerer et `ParallelLoopResult`.',
            'Eksemplet beregner `C[i] = Math.Sqrt(Math.Pow(A[i], 2.0) + Math.Pow(B[i], 2.0))` for hvert `i`; `ForEach`-varianten gør det samme på objekter `arg` i `feArgs`. Med 1.000.000 koordinater målte slidet: almindelig `for` 10030 ms, `Parallel.For` 4329 ms, `Parallel.ForEach` 2730 ms.',
          ],
        },
        {
          term: 'Danger zones',
          body: [
            '**Iterationerne skal være uafhængige.** `a[i] = a[i-1] + a[i-2]` i et `Parallel.For` kompilerer fint, men iteration `i` bruger resultater fra andre iterationer — “Oh God, the pain…the PAIN!!”. Afhængigheder hører til [[futures|dependencies og futures]].',
            '**Iterationer er ikke altid `[0..n)`**: nedadgående (`i--`) og skridt på mere end én (`i += 2`) passer ikke direkte til `Parallel.For`.',
            '**Meget små loop-kroppe** kan æde gevinsten: der er overhead i delegate-kaldet og i synkroniseringen, load balancing kræver. Samme mønster findes i andre sprog: `parallelStream()` i Java, OpenMP og AMP i C++, `multiprocessing` eller `joblib` i Python.',
          ],
        },
      ],
      viz: 'parallel-loops',
      keyPoints: [
        'Parallelle loops kræver uafhængige iterationer (“delightfully parallel”).',
        'En tråd pr. core med faste blokke er statisk partitionering.',
        'Statisk partitionering giver load imbalance, når iterationerne koster forskelligt: 57 s mod 39 s ideelt.',
        'Egne tråde koster 1 MB og 100.000–200.000 cycles og risikerer oversubscription.',
        'Statisk: ingen synkronisering, men kræver forhåndsviden. Dynamisk: load balancing, men kræver synkronisering.',
        '`Parallel.For`/`ForEach` giver dynamisk trådantal og load balancing — 10030 ms blev til 4329 og 2730 ms.',
        'Danger zones: afhængige iterationer, andre skridt end +1, for små loop-kroppe.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'MyParallelFor med statisk partitionering',
          source: 'Concurrency - Parallel Loops.pdf s. 7',
          code: `public static void MyParallelFor(int inclusiveLowerBound, int exclusiveUpperBound,
Action<int> body) {
    // Determine size of each partition of work (size/nCores) – static partitioning
    int size = exclusiveUpperBound - inclusiveLowerBound;
    int numProcs = Environment.ProcessorCount;
    int range = size / numProcs;

    // Initialize threads to do work
    var threads = new List<Thread>(numProcs);
    for (int p = 0; p < numProcs; p++)
    {
        int start = p * range + inclusiveLowerBound;
        int end = (p == numProcs - 1) ? exclusiveUpperBound : start + range;
        threads.Add(new Thread(() => {
            for (int i = start; i < end; i++) body(i);
        }));
    }

    // Start and await threads
    foreach (var thread in threads) thread.Start();   // Start them all
    foreach (var thread in threads) thread.Join();    // wait on all
}`,
        },
        {
          lang: 'csharp',
          title: 'Fra for til Parallel.For og Parallel.ForEach',
          source: 'Concurrency - Parallel Loops.pdf s. 13–14',
          code: `// Sekventielt
for (int i = 0; i < nCalculations; i++)
  C[i] = Math.Sqrt(Math.Pow(A[i], 2.0) + Math.Pow(B[i], 2.0));

// Parallel.For
Parallel.For(0, nCalculations, i =>
   {
     C[i] = Math.Sqrt(Math.Pow(A[i], 2.0) + Math.Pow(B[i], 2.0));
   }
);

// Parallel.ForEach
Parallel.ForEach(feArgs, arg => {
  arg.C = Math.Sqrt(Math.Pow(arg.A, 2.0) + Math.Pow(arg.B, 2.0));
});`,
        },
        {
          lang: 'csharp',
          title: 'Danger zone: afhængige iterationer',
          source: 'Concurrency - Parallel Loops.pdf s. 16',
          code: `Parallel.For(2, nCalculations, i =>
   {
     a[i] = a[i-1] + a[i-2]; // Oh God, the pain…the PAIN!!
   }
);`,
        },
      ],
      exam: [
        'Et parallelt loop kører iterationerne samtidig, og det kan kun lade sig gøre, når de er uafhængige. Syntaksen er let — kroppen bliver en lambda i `Parallel.For` — men det svære er at fordele arbejdet.',
        'Den håndlavede `MyParallelFor` giver hver core en fast blok. Det er statisk partitionering, og det giver load imbalance: i eksemplet, hvor iteration `i` tager `i` sekunder, tager den ene tråd 21 s og den anden 57 s, selv om det ideelle er 39 s. Tråde kan ikke hjælpe hinanden.',
        'Afvejningen er et spektrum: statisk partitionering kræver ingen synkronisering, men forudsætter, at man kender eksekveringstiden; dynamisk partitionering balancerer selv, men kræver synkronisering. `Parallel.For` og `ForEach` klarer det for os, sammen med exception handling og dynamisk trådantal.',
        'I distance-eksemplet med en million koordinater gik det fra 10030 ms sekventielt til 4329 ms med `Parallel.For` og 2730 ms med `Parallel.ForEach`.',
        'Danger zones: afhænger en iteration af en anden, som i `a[i] = a[i-1] + a[i-2]`, er det futures og ikke parallelle loops; loops, der ikke går op i skridt på én, skal omskrives; og er kroppen meget lille, æder delegate-overhead og synkronisering gevinsten.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W11.2_Concurrency_Parallel_Loops.md'), original: 'Concurrency - Parallel Loops.pdf', pages: 's. 2–17' },
      ],
      gaps: [
        '“PoPP” (s. 4) forklares ikke på slidet, og bogen er ikke i materialet. Markdown-konverteringen udfolder den til *Parallel Programming with Microsoft .NET*.',
        'Slidene viser ikke, hvordan `Parallel.For` partitionerer eller hvordan en dynamisk partitionering fordeler iterationerne. Den ideelle fordeling på s. 10 er en facitliste, ikke resultatet af en bestemt algoritme, og slidet noterer selv “Show finish order, not proportional time”.',
        '`ParallelLoopResult`, thread-local state og nested parallelism nævnes (s. 12–14), men forklares ikke.',
        'Distance-eksemplet (s. 15) viser kun konsoloutput: ingen kode, intet antal cores og ingen forklaring på, hvorfor `ForEach` er hurtigere end `For`.',
        'Slide 16 skriver `for(..; ..; I += 2` med stort I og uden slutparentes, og loopet på s. 4 mangler `Console.` og semikolon.',
        'Oversubscription-tidslinjen (s. 8) har ingen tidsakse eller angivelse af antal cores; den viser kun, at Ready (gul) dominerer.',
      ],
      keywords: ['parallel loop', 'parallelt loop', 'Parallel.For', 'Parallel.ForEach', 'Parallel.Invoke', 'ParallelLoopResult', 'delightfully parallel', 'PoPP', 'MyParallelFor', 'partitioning', 'partitionering', 'static partitioning', 'dynamic partitioning', 'load imbalance', 'load balancing', 'oversubscription', 'context switching', 'lambda', 'closure', 'Func', 'Action', 'distance calculations', 'danger zones', 'loop-carried dependency', 'OpenMP', 'parallelStream'],
    },

    {
      slug: 'futures',
      title: 'Dependencies og futures',
      week: 'Uge 12 · W12.1',
      definition:
        'Når beregninger afhænger af hinanden, beskrives afhængighederne som en **DAG** (Directed Acyclic Graph). **Continuations** overlader synkroniseringen til TPL: en task starter, når de tasks, den afhænger af, er færdige. En **future** er en task, der returnerer en værdi (`Task<TResult>`) — en stand-in for et resultat, der først er kendt senere, og som kan beregnes parallelt med andet arbejde.',
      concepts: [
        {
          term: 'Dependencies som DAG',
          body: [
            'Parallelle loops kræver uafhængige iterationer (se [[parallel-loops|parallelle loops]]). Men “dependencies is a fact of life”. Slide 3 viser en DAG med otte knuder: 1, 2 og 3 er grønne, 7 og 8 røde, resten grå. Kanterne svarer præcis til build-eksemplet på slide 7, med pilen fra den afhængige task til den, den venter på.',
          ],
        },
        {
          term: 'Continuations',
          body: [
            'Continuations lader TPL tage sig af dependency-synkroniseringen: man angiver et sæt tasks, der skal være færdige, før en ny task starter — `var D = Task.Factory.ContinueWhenAll(A, B, C);`.',
            'Build-eksemplet starter `build1`–`build3` med `StartNew` og skemalægger resten med `ContinueWhenAll`: `build4` efter `build1`; `build5` efter `build1`, `build2`, `build3`; `build6` efter `build3`, `build4`; `build7` efter `build5`, `build6`; `build8` efter `build5`. Imens laver main-tråden build-uafhængigt arbejde og venter til sidst i `Task.WaitAll`.',
            'De to kørsler på slide 8 viser, at rækkefølgen af det uafhængige varierer: “Doing build-independent work” kommer efter project3 den ene gang og før den anden, og project5 bygges før project4 i den ene kørsel og efter i den anden. Afhængighederne holder altid: project7 bygges sidst, kl. 09:07:09 og 09:06:20.',
          ],
        },
        {
          term: 'Tiramisu: afhængigheder er svære at finde',
          body: [
            'Slide 5 er en opskrift i prosa; slide 6 har gjort den til en metode, `make_tiramisu(eggs, sugar1, wine, cheese, cream, fingers, espresso, sugar2, cocoa)`, med elleve trin fra `dissolve(sugar2, espresso)` til `refrigerate(mixture)`. Spørgsmålet er “What can be done in parallel?”, og svaret er slidets pointe: “Dependencies are hard to find.”',
            'Læst efter data: `dissolve(sugar2, espresso)`, `whip(cream)` og `beat(cheese)` rører ikke `mixture`, mens `whisk(eggs)` → `beat(mixture, sugar1, wine)` → `whisk(mixture)` → `beat(mixture, cheese)` → `fold(mixture, cream)` → … er en kæde, fordi hvert trin arbejder på `mixture`. `beat(mixture, cheese)` venter på `beat(cheese)`, og `fold(mixture, cream)` på `whip(cream)`.',
          ],
        },
        {
          term: 'Futures',
          body: [
            'En future er en task, der returnerer en værdi. Parallelle tasks svarer til *async actions* (ingen returværdi), futures til *async functions*. Futures bruges, når kode med **data dependencies** skal paralleliseres.',
            'Eksemplet: `b = F1(a)`, `c = F2(a)`, `d = F3(c)`, `f = F4(b, d)`. Skrevet sekventielt kører de efter hinanden, men datastrømmen viser noget andet: F1 og F2 behøver kun `a`, F3 venter på F2, og F4 venter på både `b` og `d`. “Output of some functions are input to the next ones – this determines the potential parallelism!”',
            'Paralleliseret ændres to ting: `Task<string> futureB = Task.Run(() => F1(a));` og `F4(futureB.Result, d)`. Tasken kører F1-grenen, mens main-tråden kører F2 og F3, og `futureB` spørges først om resultatet, når F4 kaldes.',
          ],
        },
        {
          term: 'Hvornår er resultatet klar?',
          body: [
            '“Futures are pretty darn clever!” Når `futureB.Result` læses, er der tre tilfælde. Er tasken færdig, returneres resultatet straks. Kører den stadig, blokerer den kaldende tråd, til resultatet er klar. Er den ikke startet, udføres den **inline** i den nuværende tråd, hvis muligt — samme inlining som i [[parallel-tasks|parallelle tasks]].',
          ],
        },
        {
          term: 'Lock step og heat dissipation',
          body: [
            'Et almindeligt mønster har iterationer `[0..N)` med mange beregninger hver, hvor iteration `i+1` afhænger af iteration `i` — particle simulation, heat dissipation, Conway’s Game of Life. Iterationerne kan ikke paralleliseres, men beregningerne inden i dem kan. Kravet er **lock step**: alle beregninger i én iteration skal være færdige, før den næste starter.',
            'Heat dissipation bruger to plader, `prevIter` og `currIter`, med varme (`255.0f`) langs den ene side. Hver indre celle i `currIter` er gennemsnittet af de fire naboer i `prevIter`, og efter hvert tidsskridt byttes pladerne med `Swap(ref prevIter, ref currIter)`.',
            'Den parallelle version kører `Parallel.For(1, plateSize - 1, y => …)` inden i hvert tidsskridt og bytter bagefter. `step`-løkken er stadig sekventiel.',
          ],
        },
        {
          term: 'Task barrier og målingerne',
          body: [
            'For at udnytte **cache locality** kan de samme tasks altid regne på den samme sektion af pladen: `numTasks = Environment.ProcessorCount` tasks får hver et bånd (Task 1–4), og hver task kører selv alle tidsskridt. Uden synkronisering løber de fra hinanden (“IS IT OVER YET”).',
            '`System.Threading.Barrier` synkroniserer dem: `new Barrier(signalCount, postPhaseAction)` og `SignalAndWait()`. I løsningen er `postPhaseAction` `Swap(ref prevIter, ref currIter)` — “when numTasks tasks have reached barrier, do this action” — og hver task kalder `stepBarrier.SignalAndWait()` sidst i hvert tidsskridt.',
            'Demoen: Sequential 10498, Parallel 19763, Parallel with a barrier 6033. Den naive `Parallel.For`-version er altså langsommere end den sekventielle, mens barrier-versionen er hurtigst.',
          ],
        },
      ],
      viz: 'futures',
      keyPoints: [
        'Afhængigheder modelleres som en DAG; grafen, ikke linjerækkefølgen, afgør den potentielle parallelisme.',
        '`ContinueWhenAll` skemalægger en task, der starter, når alle dens forudsætninger er færdige.',
        'Det svære er at finde afhængighederne (tiramisu).',
        'Future = task med returværdi, `Task<TResult>`. Parallel tasks ~ async actions, futures ~ async functions.',
        '`.Result`: færdig → straks; kører → blokér; ikke startet → inline.',
        'Lock step: alle beregninger i iteration `i` skal være færdige før `i+1`.',
        '`Barrier` med `postPhaseAction` giver lock step og bevarer båndene: 6033 mod 10498 sekventielt og 19763 med `Parallel.For`.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Continuations: build-eksemplet',
          source: 'Concurrency - Dependencies, Futures.pdf s. 7',
          code: `var f = Task.Factory;

// Start 3 concurrent, independent builds
var build1 = f.StartNew(() => Build("project1"));
var build2 = f.StartNew(() => Build("project2"));
var build3 = f.StartNew(() => Build("project3"));

// Schedule continuations when dependent jobs are done
var build4 = f.ContinueWhenAll(new[] { build1 }, x => Build("project4"));
var build5 = f.ContinueWhenAll(new[] { build1, build2, build3 }, x => Build("project5"));
var build6 = f.ContinueWhenAll(new[] { build3, build4 }, x => Build("project6"));
var build7 = f.ContinueWhenAll(new[] { build5, build6 }, x => Build("project7"));
var build8 = f.ContinueWhenAll(new[] { build5 }, x => Build("project8"));

// Do work that is independent of builds
Console.WriteLine(System.DateTime.Now + "*** Doing build-independent work... ***");

Task.WaitAll(build1, build2, build3, build4, build5, build6, build7, build8);`,
        },
        {
          lang: 'csharp',
          title: 'F1–F4 sekventielt og med en future',
          source: 'Concurrency - Dependencies, Futures.pdf s. 11–12',
          code: `// Sekventielt
static void Main(string[] args)
{
    var a = "A";
    var b = F1(a);
    var c = F2(a);
    var d = F3(c);
    var f = F4(b, d);
    System.Console.WriteLine(f);
}

// Parallelized using futures
static void Main()
{
    var a = "A";
    Task<string> futureB = Task.Run(() => F1(a));
    var c = F2(a);
    var d = F3(c);
    var f = F4(futureB.Result, d);
    Console.WriteLine(f);
}`,
        },
        {
          lang: 'csharp',
          title: 'Heat dissipation med task barrier',
          source: 'Concurrency - Dependencies, Futures.pdf s. 20',
          code: `// Run simulation
int numTasks = Environment.ProcessorCount;
var tasks = new Task[numTasks];

var stepBarrier = new Barrier(numTasks, _ => Swap(ref prevIter, ref currIter));
int chunkSize = (plateSize - 2) / numTasks;
for (int i = 0; i < numTasks; i++)
{
    int yStart = 1 + (chunkSize * i);
    int yEnd = (i == numTasks - 1) ? plateSize - 1 : yStart + chunkSize;
    tasks[i] = Task.Run(() =>
    {
        for (int step = 0; step < timeSteps; step++)
        {
            for (int y = yStart; y < yEnd; y++)
            {
                for (int x = 1; x < plateSize - 1; x++)
                {
                    currIter[y, x] =
                    ((prevIter[y, x - 1] +
                    prevIter[y, x + 1] +
                    prevIter[y - 1, x] +
                    prevIter[y + 1, x]) * 0.25f);
                }
            }
            stepBarrier.SignalAndWait();
        }
    });
}`,
        },
      ],
      exam: [
        'Afhængigheder mellem beregninger beskrives som en DAG, og det er grafen — ikke rækkefølgen af linjerne — der afgør, hvad der kan køre parallelt. Tiramisu-eksemplet viser, at det svære er at finde afhængighederne.',
        'Med continuations overlader man synkroniseringen til TPL. I build-eksemplet starter tre uafhængige builds med det samme, og `ContinueWhenAll` skemalægger resten, så fx project5 først bygges, når 1, 2 og 3 er færdige. Rækkefølgen varierer mellem kørsler, men afhængighederne holder altid.',
        'En future er en task, der returnerer en værdi — `Task<TResult>`. I F1–F4-eksemplet køres F1 som en task, mens main-tråden kører F2 og F3, og resultatet hentes med `futureB.Result`, når F4 skal bruge det. Er tasken færdig, kommer resultatet straks; kører den, blokerer kalderen; er den ikke startet, køres den inline.',
        'Ved lock step kan iterationerne ikke paralleliseres, kun beregningerne i hver iteration. I heat dissipation var `Parallel.For` pr. tidsskridt langsommere end sekventielt, 19763 mod 10498, mens faste bånd pr. task med en `Barrier`, der bytter pladerne, gav 6033.',
        'Afvejningen er, hvor synkroniseringen sidder: en barrier pr. tidsskridt med de samme tasks udnytter cachen, mens et nyt parallelt loop pr. tidsskridt fordeler arbejdet på ny hver gang.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W12.1_Concurrency_Dependencies_Futures.md'), original: 'Concurrency - Dependencies, Futures.pdf', pages: 's. 2–21' },
      ],
      gaps: [
        'Pilene vender forskelligt: på s. 3 peger de fra den afhængige task til den, den venter på (7 og 8 nederst er dem, der kører sidst); på s. 4 og s. 11–12 peger de fra forudsætning til afhængig. Markdown-konverteringen læser s. 3 omvendt og siger, at 7 og 8 kan starte med det samme — det passer ikke med build-koden på s. 7.',
        '`Task.Factory.ContinueWhenAll(A, B, C)` på s. 4 er en forkortelse; kaldet på s. 7 tager et array og en continuation-delegate (`new[] { build1 }, x => …`).',
        'Slide 12 skriver “The task runs the right part of the tree”, men tasken kører `F1()`, som står til venstre i grafen.',
        'Outputtet på s. 8 slutter med “*** Doing building projects... ***”, en linje, der ikke står i den viste kode.',
        'Slide 14 skriver “parallelize the calculations within each calculation”; meningen er inden i hver iteration.',
        'Demoen på s. 21 angiver hverken enhed, pladestørrelse, antal tidsskridt eller antal cores, og slidene forklarer ikke, hvorfor `Parallel.For`-versionen er langsommere end den sekventielle. Cache locality er motivationen for barrier-versionen (s. 17), men er ikke målt for sig.',
        'Slide 17 nummererer båndene Task 4–1 fra venstre, s. 18–20 Task 1–4. Koden på s. 20 venter ikke på `tasks` og returnerer ikke pladen.',
        'I tiramisu-metoden bruges `espresso` kun i `dissolve(sugar2, espresso)` og indgår ikke i `assemble` — slidet siger ikke, om det er med vilje.',
      ],
      keywords: ['dependencies', 'afhængigheder', 'DAG', 'Directed Acyclic Graph', 'continuation', 'ContinueWhenAll', 'Task.Factory', 'StartNew', 'tiramisu', 'build', 'future', 'futures', 'Task<TResult>', 'Result', 'async function', 'async action', 'data dependencies', 'inline', 'lock step', 'heat dissipation', 'Game of Life', 'particle simulation', 'Barrier', 'SignalAndWait', 'postPhaseAction', 'cache locality', 'Swap', 'prevIter', 'currIter'],
    },

    ...parallelitetB,
  ],
}
