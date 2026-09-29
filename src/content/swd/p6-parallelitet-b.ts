import type { Topic } from '../types'
import { m } from './paths'

export const parallelitetB: Topic[] = [
  {
    slug: 'pipelines',
    title: 'Pipelines',
    week: 'Uge 12 · W12.2',
    definition:
      'Pipeline-mønsteret paralleliserer behandlingen af en *sekvens* af inputværdier. En pipeline er en række producer/consumer-stages (**filters**) forbundet af køer (**pipes**): output fra stage *i* er input til stage *i+1*, og stagerne er ellers uafhængige. I C# bygges den af tasks og `BlockingCollection<T>`.',
    intro: [
      'Det er arkitekturstilen [[arkitekturstile|pipes and filters]] bragt ned på tråd-niveau. Arkitekturslidene i uge 4 bruger endda samme eksempel — thumbnails i fire trin — og samme “throughput x 4”. Forskellen er, at hver filter her kører i sin egen task, så flere elementer er undervejs på én gang.',
    ],
    concepts: [
      {
        term: 'Filters og pipes',
        body: [
          'Behandlingen deles i stages, der kan køre parallelt. Hver stage er både consumer (den læser fra køen foran sig) og producer (den skriver til køen efter sig). Stagerne deler ikke andet end køerne.',
          'Hvert element skal stadig igennem stagerne i rækkefølge. Parallelismen kommer af, at *forskellige* elementer står i forskellige stages samtidig. Det adskiller mønsteret fra [[parallel-loops|parallel loops]], hvor iterationerne skal være uafhængige.',
          'Slidenes eksempler: lyd- og videobehandling (gstreamer-frameworket), billedbehandling i autonome robotter og “real-time”/live-behandling af aktiemarkedsdata.',
        ],
      },
      {
        term: 'Pipelining: thumbnail-eksemplet',
        body: [
          'Thumbnails laves i fire trin: Load image > scale image > filter image > display image. Sekventielt venter hvert billede på, at det forrige er helt færdigt; med fire billeder og ét tidsskridt pr. stage fylder det 16 tidsskridt på tidslinjen, og tre af fire stages står stille hele tiden.',
          'Pipelined får hver stage sin egen tråd (Thread 1–4). Når Load har afleveret billede 1 til Scale, går den i gang med billede 2. De fire billeder er færdige efter 7 tidsskridt, og i den fyldte pipeline kommer der ét billede ud pr. tidsskridt. Sliden kalder det “throughput * 4”. Det enkelte billede er stadig fire tidsskridt om at komme igennem — det er gennemstrømningen, der stiger.',
        ],
      },
      {
        term: 'Uneven stage duration: flaskehalsen',
        body: [
          'Er stagerne ikke lige lange, bestemmer den langsomste tempoet. På sliden tager Filter dobbelt så lang tid som de andre. Load og Scale er færdige tidligt, mens Display kun får et billede hvert andet tidsskridt og står med huller imellem. Sidste billede vises efter 11 tidsskridt.',
          'Løsningen er at duplikere flaskehalsen: “the pipeline may be duplicated (parallel) for the bottleneck”. Med Filter-1 og Filter-2 (Task 3 og Task 4), der fodrer Display (Task 5), er sidste billede vist efter 8 tidsskridt.',
          'I implementeringen deler de duplikerede tasks input-kø, men har hver sin output-kø: Task 1 → Q1 → Task 2.1/2.2/2.3 → Q 2.1/2.2/2.3 → Task 3. Det er **consumeren**, ikke produceren, der skal ændres: Task 3 skal nu læse fra et array af køer.',
        ],
      },
      {
        term: 'Mønsteret i C#: `BlockingCollection<T>`',
        body: [
          'En stage er en metode med en input- og en output-`BlockingCollection<T>`. Den løber input igennem med `foreach` over `input.GetConsumingEnumerable()` — “Get an iterator for the blocking collection – very important!” — laver et resultat og lægger det i output med `output.Add(result)`.',
          'I `finally` kalder den `output.CompleteAdding()`: “When all output addition is done: Signal the completion of adding.” Sliden spørger: “What is the purpose of `CompleteAdding()`?” Det er slutsignalet til næste stage. Dens `GetConsumingEnumerable()` venter, så længe køen er tom, og slutter først, når produceren har kaldt `CompleteAdding()`, og køen er tømt. Står kaldet i `finally`, bliver signalet sendt, også hvis stagen fejler, og signalet forplanter sig stage for stage ned gennem pipelinen.',
        ],
      },
      {
        term: 'Flere køer ind: `TakeFromAny` og `TryTakeFromAny`',
        body: [
          'Consumeren `ToLowerCase` får `BlockingCollection<string>[] inputs` og kører, så længe `!inputs.All(bc => bc.IsCompleted)`. Med `BlockingCollection<string>.TakeFromAny(inputs, out str)` finder den en “non-completed”, data-bærende kø og tager fra den.',
          'Sliden advarer: den “will crash with an exception if all collections are Complete. How can that happen?” Tjekket i `while` og kaldet til `TakeFromAny` er to separate skridt. Imellem dem kan den sidste producer nå at kalde `CompleteAdding()`. Skærmbilledet fra string compression-øvelsen viser resultatet: en `AggregateException` om en `ArgumentException` med teksten “All collections are marked as complete with regards to additions.”, som først dukker op ved `Task.WaitAll`.',
          'Rettelsen er `TryTakeFromAny`, der ikke kaster, men returnerer `-1`, når intet blev taget. Stagen behandler kun `str`, når returværdien er `!= -1`, og `while`-betingelsen afgør i næste omgang, om alle køer er færdige.',
        ],
      },
      {
        term: 'Find flaskehalsen',
        body: [
          'Tre metoder fra sliden: test og tag tid på filtrene hver for sig (“the design is very easy to test”); tjek kølængderne fra `Main` under kørslen; eller erstat de andre filtre med dummies, der kun sender data videre, og tag tid på det hele.',
          'Kølængden peger direkte på synderen: køen *foran* en langsom stage vokser, mens stagerne efter den venter.',
        ],
      },
      {
        term: 'Cancellation',
        body: [
          'En pipeline afbrydes med en `CancellationToken`, som hver stage får med. Stagen tjekker `token.IsCancellationRequested` og bryder løkken, og den skriver med `output.Add(result, token)`.',
          'Grunden står på sliden: `output.Add(result)` kan blokere. Med en token kaster den en exception, når der annulleres. Ellers “the program can deadlock” — en stage kan stå og vente på en kø, som ingen længere tømmer. `OperationCanceledException` fanges, og `finally` kalder stadig `CompleteAdding()`, så stagerne efter også slutter.',
        ],
      },
    ],
    viz: 'pipelines',
    keyPoints: [
      'Pipeline = filters (stages) forbundet af pipes (køer); output fra stage i er input til stage i+1.',
      'Gevinsten er throughput: alle stages arbejder samtidig på hvert sit element. Latency pr. element falder ikke.',
      'Den langsomste stage bestemmer tempoet. Duplikér flaskehalsen (Filter-1, Filter-2).',
      'Ved duplikering skal consumeren ændres, ikke produceren: den læser fra flere køer.',
      '`GetConsumingEnumerable()` til at læse, `CompleteAdding()` i `finally` som slutsignal.',
      '`TakeFromAny` kaster, hvis alle køer er completed; `TryTakeFromAny` returnerer `-1`.',
      'Find flaskehalsen: tag tid på filtrene enkeltvis, se kølængderne, eller brug dummy-filtre.',
      'Cancellation: `Add(result, token)` kaster i stedet for at blokere; uden den kan pipelinen deadlocke.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'En stage: tag fra input, læg i output, signalér færdig',
        source: 'Concurrency - Pipelines.pdf s. 6',
        code: `void DoStage(BlockingCollection<T> input,
             BlockingCollection<T> output)
{
  try
  {
     // Get an iterator for the blocking collection – very important!
     foreach (var item in input.GetConsumingEnumerable())
     {
       var result = ...
       output.Add(result);   // Generate a result, add it to the output
     }
  }
  finally
  {
    output.CompleteAdding();  // Signal the completion of adding
  }
}`,
      },
      {
        lang: 'csharp',
        title: 'Consumer med flere input-køer: TryTakeFromAny',
        source: 'Concurrency - Pipelines.pdf s. 10',
        code: `private void ToLowerCase(BlockingCollection<string>[] inputs, BlockingCollection<string> output)
{
    var str = "";

    while(!inputs.All(bc=> bc.IsCompleted))
    {
        if (BlockingCollection<string>.TryTakeFromAny(inputs, out str) != -1)
        {
          str = str.ToLower();
          output.Add(str);
        }
    }
    output.CompleteAdding();
}`,
      },
      {
        lang: 'csharp',
        title: 'Cancellation med CancellationToken',
        source: 'Concurrency - Pipelines.pdf s. 12',
        code: `private void ToLowerCase(BlockingCollection<string> input, BlockingCollection<string> output,
                                                        CancellationToken token)
{
    try {
        foreach(var item in input.GetConsumingEnumerable())
        {
            if (token.IsCancellationRequested) break;
            var result = ...
            output.Add(result, token);   // kaster ved cancellation i stedet for at blokere
        }
    } catch (OperationCanceledException) {
    } finally { output.CompleteAdding(); }
}`,
      },
    ],
    exam: [
      'En pipeline paralleliserer behandlingen af en strøm af elementer ved at dele arbejdet i stages, der er forbundet af køer. Hver stage kører i sin egen task og arbejder på sit eget element, så i thumbnail-eksemplet kommer der ét billede ud pr. tidsskridt i stedet for ét pr. fire.',
      'I C# er køerne `BlockingCollection<T>`. En stage læser med `GetConsumingEnumerable()`, skriver med `Add` og kalder `CompleteAdding()` i `finally` — det er signalet, der får næste stages løkke til at slutte.',
      'Den langsomste stage bestemmer throughput. Jeg finder den ved at se, hvilken kø der vokser, eller ved at tage tid på filtrene hver for sig, og jeg duplikerer den. Så skal consumeren efter den læse fra flere køer, og der skal jeg bruge `TryTakeFromAny`, fordi `TakeFromAny` kaster, hvis alle køer når at blive completed mellem tjekket og kaldet.',
      'Afvejningen: mønsteret giver throughput, ikke kortere latency, og det kræver, at stagerne kan afbrydes rent — uden en `CancellationToken` kan en stage blive hængende i `Add` og få pipelinen til at deadlocke.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W12.2_Concurrency_Pipelines.md'), original: 'Concurrency - Pipelines.pdf', pages: 's. 2–13' },
      { path: m('slides/SW4SWD-01_W04.2_Architecture_Process_2.md'), original: '2-SW-Architecture - Process 2.pdf', pages: 's. 49–53', note: 'Pipes and filters som arkitekturstil med samme thumbnail-eksempel' },
    ],
    gaps: [
      'Slidene viser aldrig, hvordan stagerne kobles sammen — oprettelsen af køerne, `Task.Run` pr. stage og `Task.WaitAll`. Opsætningen kan kun anes i stakken på s. 9 (`PipelinedStringCompressionWithMulitpleCompressors.Run()`), som hører til string compression-øvelsen.',
      'Slidene stiller spørgsmålene “What is the purpose of `CompleteAdding()`?” (s. 6) og “How can that happen?” (s. 8) uden at besvare dem. Svarene her (slutsignalet til `GetConsumingEnumerable()` og kapløbet mellem `IsCompleted`-tjekket og kaldet) bygger på .NET’s dokumenterede adfærd.',
      'Koden på slidene kompilerer ikke som vist: på s. 6 mangler `{` efter signaturen, og på s. 12 står der en ekstra `}` før `finally` og intet semikolon efter `CompleteAdding()`. Rettet her.',
      'Uden for materialet: `Add` blokerer kun, når køen er oprettet med en øvre grænse (`boundedCapacity`). Slidene nævner ikke kapaciteten, men “`output.Add(result)` can block” (s. 12) forudsætter den. Og `TryTakeFromAny` uden timeout venter ikke, så løkken på s. 10 kan spinne, mens køerne er tomme.',
      'Sliden om uneven stage duration (s. 4) kalder stagerne Task 1–5, implementeringsslidene (s. 7–10) kalder dem Task 1, Task 2.1–2.3 og Task 3. Det er samme idé med to nummereringer.',
    ],
    keywords: ['pipeline', 'pipes and filters', 'filter', 'pipe', 'stage', 'producer', 'consumer', 'producer/consumer', 'BlockingCollection', 'GetConsumingEnumerable', 'CompleteAdding', 'TakeFromAny', 'TryTakeFromAny', 'IsCompleted', 'bottleneck', 'flaskehals', 'uneven stage duration', 'throughput', 'latency', 'thumbnail', 'CancellationToken', 'OperationCanceledException', 'deadlock', 'gstreamer', 'string compression'],
  },

  {
    slug: 'aggregation-mapreduce',
    title: 'Aggregation og MapReduce',
    short: 'Aggregation og MapReduce',
    week: 'Uge 13 · W13.1',
    definition:
      'I concurrent programmering er **aggregation** at samle delresultater til ét samlet resultat — “think divide-and-combine”. Kurset viser det med dartboard-estimering af π, hvor en lock pr. træf erstattes af thread-local delsummer, der kun låses én gang pr. task. **MapReduce** er mønsteret til meget store datasæt: Distribute, Map, Group og Reduce, hvor udvikleren kun skriver Map og Reduce.',
    concepts: [
      {
        term: 'Aggregation: divide-and-combine',
        body: [
          'Aggregation er “the action of collecting items to form a total quantity”. Sliden nævner news aggregators og klasserelationen i UML (se [[uml-klassediagram|UML-klassediagrammer]]) — ordet betyder noget andet her.',
          'I concurrent programmering er det “the collection of sub-results to one total result”. Arbejdet deles ud, hver tråd laver et delresultat, og delresultaterne kombineres. Det svære er kombinationen: flere tråde skal skrive til samme resultat.',
        ],
      },
      {
        term: 'Dartboard-estimering af π',
        body: [
          'Gennemgående eksempel: approksimér pi = 3.14159… med “Dartboard”-algoritmen. Pile i et kvadrat på 1.0 × 1.0; andelen, der lander inden for kvartcirklen med radius 1.0, giver `π ≅ 4 · n_circle / n`. “Math not the important part.”',
          'Den serielle udgave kaster ikke tilfældigt. `_nDarts` er antallet af inddelinger i x og y, så to løkker gennemløber et gitter af `_nDarts * _nDarts` punkter, og `++nInside` tæller dem inden for cirklen. Slidens spørgsmål: “Where is the aggregation?” Det er `++nInside` — linjen, hvor alle delresultater samles.',
        ],
      },
      {
        term: '1. forsøg: lock pr. træf',
        body: [
          'Den ydre løkke bliver `Parallel.For(0, _nDarts, i => …)`: én iteration er én lodret “strip” af pile. Tælleren er fælles, så hver træf opdateres med `lock(locker) ++nInside`.',
          '“What can be the problem with this solution?” Låsen tages for hvert eneste punkt i cirklen, og alle tråde deler den. Figuren viser strips farvet efter tråd med en lås-markering ved hver opdatering: trådene skiftes til at stå i kø ved den samme lås.',
        ],
      },
      {
        term: '2. forsøg: thread-local delresultater',
        body: [
          'Observationen på s. 9: “parallelle” iterationer, der kører på *samme* tråd, kan aldrig konkurrere om låsen. De kan derfor skrives, som om de var serielle — og en særlig overload af `Parallel.For` understøtter det: `For<TLocal>(fromInclusive, toExclusive, localInit, body, localFinally)`.',
          'Figuren på s. 10: `Parallel.For` starter Task 1 … Task N. Hver task kører `localInit` én gang, derefter Iteration A, B … N, og til sidst `localFinally`. På dartboardet svarer det til, at hver tråd har sin egen tæller, `nInside_T1` og `nInside_T2`, som samler alle trådens strips.',
          'I koden starter `localInit` tælleren på `0`. Kroppen tæller op og returnerer tælleren, som gives videre til næste iteration på tråden — “Requires no locking – runs in same thread”. Kun `localFinally`, der lægger trådens tal til det samlede `nInsideCircle`, tager låsen: én gang pr. task i stedet for én gang pr. træf.',
        ],
      },
      {
        term: '3. forsøg: `Partitioner`',
        body: [
          'Selv med thread-local tællere er arbejdet i hver delegate lille, og opdelingen er “messy”. En tilsvarende overload af `Parallel.ForEach` med `Partitioner.Create(0, _nDarts)` laver “optimal chunks” af arbejde til hver task.',
          'Kroppen får nu en `range`-tuple med start og slut for sin partition og løber selv fra `range.Item1` til `range.Item2`. Én delegate-kørsel dækker altså et helt interval af strips. Partitionering er gennemgået under [[parallel-loops|parallel loops]].',
        ],
      },
      {
        term: 'MapReduce: fire trin',
        body: [
          'Man vil ofte have “simple” svar på spørgsmål, der kræver store datasæt — rutinemæssigt petabytes (10¹⁵ bytes). 1 PB svarer ifølge sliden til en 1,5 km høj stak cd-rom’er. MapReduce tager et sæt input-key/value-par og giver et sæt output-key/value-par; brugeren udtrykker beregningen som to funktioner, Map og Reduce. Nøglen er at parallelisere på mange **nodes**.',
          'De fire trin: 1) **Distribute** fordeler partitioner og kildedata til forskellige nodes. 2) **Map** omformer kildedata på hver node til (mange simple) intermediate key-value-par. 3) **Group** grupperer parrene efter nøgle — en group-by. 4) **Reduce** fletter/aggregerer/fortolker grupperne til et svar på forespørgslen.',
          'Distribute og Group varierer ikke og leveres normalt af et framework. Map og Reduce varierer og skrives af udvikleren.',
        ],
      },
      {
        term: 'Solpanel-eksemplet',
        body: [
          'Hvert panel logger sin effekt hvert 10. sekund (`5/9-14 12:00:00: 75W`, `5/9-14 12:00:10: 79W`, …) — 3.153.600 datapunkter pr. panel pr. år. Forespørgslen: “What is the total per-hour production from all panels?”, med svar på formen “From 12:00 to 13:00, 745MW is produced.”',
          'Map gør hver logline til et par med key = hour og value = output: `5/9-14 12:00:00: 75W` bliver `12: 75W`. Det sker på Node 1, 2 og 3 hver for sig. Group samler på tværs af nodes: `12: 75,70,73,74,78,81`, `13: 68,71,65,62,69,72`, `14: 58,55,49,48,49,49`. Reduce summerer hver gruppe: `12: 451W`, `13: 407W`, `14: 308W`.',
        ],
      },
      {
        term: '`MapReduce()` med PLINQ og extension methods',
        body: [
          'Kursets “egen” `MapReduce()` (fra *Patterns of Parallel Programming* s. 75) er tre LINQ-kald på en `ParallelQuery<TSource>`: `.SelectMany(map)` er Map, `.GroupBy(keySelector)` er Group, og `.SelectMany(reduce)` er Reduce. Fordi kilden er en `ParallelQuery`, kører kæden parallelt med PLINQ.',
          'Metoden er en **extension method**: en statisk metode, der kaldes med instansmetode-syntaks. `this` foran første parameter gør, at man kan skrive `files.MapReduce(…)`. Slidens eksempel er `WordCount(this String str)`, så `s.WordCount()` virker på en `string`. I IL oversætter compileren kaldet til et almindeligt statisk kald, og en extension method kan ikke tilgå private felter.',
        ],
      },
      {
        term: 'Word-count-by-length',
        body: [
          'Opgaven: tæl, hvor mange ord af hver længde en samling bøger har. Sætningen “The fox and the hound are mortal fiends” deles i ord; hvert ord får sin længde som nøgle (`“The” → 3`, `“hound” → 5`); `GroupBy()` samler `[3: [“The”, “fox”, “and”, “the”, “are”]]`, `[5: [“hound”]]`, `[6: [“mortal”, “fiends”]]`; og Reduce tæller: `[3: 5]`, `[5: 1]`, `[6: 2]`.',
          'I koden gør `Directory.EnumerateFiles(…).AsParallel()` filerne til en `ParallelQuery`. `Map(path)` læser linjerne og splitter dem i små bogstaver, `ExtractKey(word)` returnerer `word.Length`, og `Reduce(group)` returnerer ét `KeyValuePair<int, int>` med nøglen og `group.Count()`.',
        ],
      },
    ],
    viz: 'aggregation-mapreduce',
    keyPoints: [
      'Aggregation = saml delresultater til ét resultat (divide-and-combine).',
      'Fælles tæller med `lock` pr. opdatering: korrekt, men alle tråde står i kø ved samme lås.',
      'Iterationer på samme tråd konkurrerer aldrig om låsen → thread-local delresultat.',
      '`Parallel.For` med `localInit`, `body` og `localFinally`: kun `localFinally` låser, én gang pr. task.',
      '`Partitioner.Create` giver hver delegate et helt interval (`range.Item1`–`range.Item2`).',
      'MapReduce: Distribute → Map → Group → Reduce. Distribute og Group fra frameworket, Map og Reduce fra udvikleren.',
      'I C#: `source.SelectMany(map).GroupBy(keySelector).SelectMany(reduce)` på en `ParallelQuery` (PLINQ).',
      'Solpanel: `12: 451W`, `13: 407W`, `14: 308W`. Word count: `[3: 5]`, `[5: 1]`, `[6: 2]`.',
    ],
    code: [
      {
        lang: 'csharp',
        title: '1. forsøg: lock om hver opdatering',
        source: 'Concurrency - Aggregation, MapReduce.pdf s. 8',
        code: `private static double ParallelEstimationOfPi()
{
    var locker = new object();
    double nInside = 0;
    double stepSize = 1 / (double)_nDarts;

    // 1 iteration = 1 "strip" of darts
    Parallel.For(0, _nDarts, i =>
    {
        var x = i * stepSize;
        for (int j = 0; j < _nDarts; j++)
        {
            var y = j*stepSize;
            if (Math.Sqrt(x*x + y*y) < 1.0)
                lock(locker) ++nInside;
        }
    }
    );
    return 4 * nInside / (_nDarts * _nDarts);
}`,
      },
      {
        lang: 'csharp',
        title: '2. forsøg: thread-local tæller med localInit og localFinally',
        source: 'Concurrency - Aggregation, MapReduce.pdf s. 11',
        code: `private static double ParallelEstimationOfPi()
{
    var locker = new object();
    double nInsideCircle = 0;
    double stepSize = 1 / (double)_nDarts;
    Parallel.For(0, _nDarts,
        () => 0, // localInit: Initialize nInside (passed to first iteration)
        (i, dummyState, nInside) =>
        {
            var x = i * stepSize;
            for (int j = 0; j < _nDarts; j++)
            {
                var y = j * stepSize;
                if (Math.Sqrt(x * x + y * y) < 1.0) ++nInside; // no locking – same thread
            }
            return nInside; // Handed over to next task executing on thread
        },
        // localFinally: lock and aggregate local result to global result
        inside => { lock (locker) nInsideCircle += inside; });
    return 4 * nInsideCircle / (_nDarts * _nDarts);
}`,
      },
      {
        lang: 'csharp',
        title: 'MapReduce som extension method på ParallelQuery',
        source: 'Concurrency - Aggregation, MapReduce.pdf s. 21',
        code: `// Patterns of Parallel Programming p. 75
public static ParallelQuery<TResult> MapReduce<TSource, TMapped, TKey, TResult>(
   this ParallelQuery<TSource> source,
   Func<TSource, IEnumerable<TMapped>> map,
   Func<TMapped, TKey> keySelector,
   Func<IGrouping<TKey, TMapped>, IEnumerable<TResult>> reduce)
{
  return source
    .SelectMany(map)
    .GroupBy(keySelector)
    .SelectMany(reduce);
}`,
      },
      {
        lang: 'csharp',
        title: 'Word-count-by-length: kald, Map, ExtractKey og Reduce',
        source: 'Concurrency - Aggregation, MapReduce.pdf s. 24–26',
        code: `static void Main(string[] args)
{
    var files = Directory.EnumerateFiles(@"C:\\(…)\\Books", "*.txt").AsParallel();
    var wordCounts = files.MapReduce(
        path => Map(path),
        map => ExtractKey(map),
        group => Reduce(group));

    foreach (var pair in wordCounts)
    {
        Console.WriteLine("{0}: {1}", pair.Key, pair.Value);
    }
}

// Map() provides the source data on which the MapReduce query shall run.
static IEnumerable<string> Map(string path)
{
   return File.ReadLines(path) // Read all lines in the path
      .SelectMany(line => line.ToLower().Split(new char[] { ' ', ',', '.', '-', '!', '?', ';' }));
}

// ExtractKey() returns the key which the word fits
static int ExtractKey(string word)
{
   return word.Length;
}

// Reduce() returns a list of key/value pairs representing the results
static IEnumerable<KeyValuePair<int, int>> Reduce(IGrouping<int, string> group)
{
    return new KeyValuePair<int, int>[]
    {
        new KeyValuePair<int, int>(group.Key, group.Count())
    };
}`,
      },
    ],
    exam: [
      'Aggregation er at samle delresultater fra flere tråde til ét resultat. Problemet er, at trådene skal skrive til den samme variabel, og en lock om hver opdatering gør koden korrekt, men lader trådene stå i kø ved låsen.',
      'Løsningen i kurset er thread-local aggregering: iterationer på samme tråd kan aldrig konkurrere om låsen, så `Parallel.For` med `localInit` og `localFinally` lader hver tråd tælle i sin egen variabel. Der låses kun i `localFinally`, én gang pr. task. I dartboard-eksemplet giver det `nInside_T1`, `nInside_T2` osv., der lægges sammen til sidst.',
      'MapReduce er fire trin: Distribute, Map, Group og Reduce. I solpanel-eksemplet mapper hver node loglinjer til par med timen som nøgle, Group samler værdierne for hver time på tværs af nodes, og Reduce summerer — fx `12: 451W`.',
      'I C# kan hele mønsteret skrives som en extension method på `ParallelQuery`: `SelectMany(map)`, `GroupBy(keySelector)` og `SelectMany(reduce)`. Frameworket står for fordeling og gruppering; jeg skriver kun Map og Reduce — i word count er det `Map`, `ExtractKey` og `Reduce`.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W13.1_Concurrency_Aggregation_MapReduce.md'), original: 'Concurrency - Aggregation, MapReduce.pdf', pages: 's. 4–13', note: 'Aggregation og dartboard-eksemplet' },
      { path: m('slides/SW4SWD-01_W13.1_Concurrency_Aggregation_MapReduce.md'), original: 'Concurrency - Aggregation, MapReduce.pdf', pages: 's. 15–26', note: 'MapReduce, solpaneler, PLINQ, extension methods, word count' },
    ],
    gaps: [
      'Slidene har ingen målinger: hverken en værdi for `_nDarts`, køretider eller speedup for de tre forsøg. At 2. og 3. forsøg er hurtigere, står kun som påstand (“more efficient”, s. 12).',
      'Spørgsmålene “What can be the problem with this solution?” (s. 8), “why not?” og “how does that help?” (s. 9) besvares ikke i teksten; svaret må læses ud af figuren på s. 10 og koden på s. 11.',
      'Uden for materialet: thread-local aggregering forudsætter, at kombinationen i `localFinally` giver samme resultat uanset rækkefølgen, taskene bliver færdige i (som `+=`). Slidene nævner ikke kravet.',
      'Trinene i word count er nummereret forskelligt: s. 23 kalder ordopdelingen “Distribute” og nummererer Reduce som “1.”, mens s. 25 kalder samme trin “1. Map”. I koden laver `Map()` både læsning og opdeling, og key-value-parret opstår først i `GroupBy(keySelector)`. S. 23 skriver også `[5, “hound”]` med komma og tilføjer uden forklaring: “Note: if running on the same node”.',
      '`Map()` gør alle ord til små bogstaver (s. 25), mens eksemplet på s. 23 og 26 beholder “The”. Det ændrer ikke længderne.',
      'Solpanel-eksemplet: svarformen “745MW” (s. 19) er et andet tal end resultatet `12: 451W` (s. 20), og grupperne på s. 20 viser kun de udsnit, der står på sliden. Uden for materialet: en sum af effektmålinger i W er ikke en energimængde (Wh).',
      'Citatet om input- og output-key/value-par (s. 15) står uden kilde, og “A gentle introduction: see Brightspace” (s. 14) og *Patterns of Parallel Programming* (s. 21) er ikke en del af materialet. Uden for materialet: citatet stammer fra Dean og Ghemawats MapReduce-artikel (Google, 2004).',
    ],
    keywords: ['aggregation', 'aggregering', 'divide-and-combine', 'dartboard', 'pi', 'π', 'nInside', 'lock', 'lock contention', 'thread-local', 'localInit', 'localFinally', 'Parallel.For', 'Parallel.ForEach', 'Partitioner', 'range', 'MapReduce', 'Distribute', 'Map', 'Group', 'Reduce', 'GroupBy', 'SelectMany', 'PLINQ', 'ParallelQuery', 'AsParallel', 'IGrouping', 'extension method', 'WordCount', 'word count', 'solpanel', 'solar panel', 'key-value', 'node', 'petabyte'],
  },

  {
    slug: 'fejlhaandtering',
    title: 'Fejlhåndtering',
    week: 'Uge 13–14 · W13.2',
    definition:
      'Kurset skelner mellem en **fault** (en defekt i systemet, udviklerens begreb), en **error** (en aktiveret fault — en afvigelse fra specifikationen) og en **failure** (en observerbar afvigelse fra forventet adfærd, brugerens begreb). Fejlhåndtering handler om at bygge fault-tolerante systemer, der fortsætter trods fejl: med redundans, recovery og detektion — fx en system monitor, heartbeat og watchdog.',
    intro: [
      'Emnet er delt på to forelæsninger: *Error handling 1* (introduktion og arkitekturmønstre) og *Error handling 2* (detection patterns). Der er næsten ingen kode — det er arkitektur, og det hører under læringsmålet om softwarearkitektur.',
    ],
    concepts: [
      {
        term: 'Fault → error → failure',
        body: [
          '**Fault**: en defekt (bug) i systemet, et “develop-oriented concept”. **Error**: resultatet af, at en fault aktiveres — en afvigelse fra specifikationen, som kan føre til en failure. **Failure**: en observerbar afvigelse fra forventet adfærd, et “user-oriented concept”.',
          'Kæden: en fault kan føre til en error, når koden køres; en error kan brede sig og give en failure. Men “not all faults result in errors, and not all errors lead to failures.”',
          'Kursets eksempel er Bowling: fault = forkert implementering af beregningen af en frame; error = forkert tilstand, når den kode køres; failure = systemet viser brugeren et forkert output.',
        ],
      },
      {
        term: 'Fail fast eller recovery',
        body: [
          'Slidet “What’s worse than crashing?” (efter Coding Horror) ordner seks scenarier fra bedst til værst: 1) virker og crasher aldrig; 2) crasher af sjældne bugs, ingen bemærker; 3) crasher af en almindelig bug; 4) deadlocker og holder op med at svare; 5) crasher længe efter den oprindelige bug; 6) taber eller ødelægger data.',
          'Et crash er altså ikke det værste. Der er en naturlig spænding mellem at fejle med det samme (“fail fast”) og at forsøge at komme tilbage fra fejltilstanden og fortsætte normalt.',
        ],
      },
      {
        term: 'Fault tolerance og mønsterkategorier',
        body: [
          'Fault tolerance er at “create systems that keep functioning despite errors, failures and/or disruption”. Nøglekomponenterne er redundans, en recovery-mekanisme og detektion og håndtering af errors. Eksempler: load balancing, checkpointing og software/hardware-redundans.',
          'Det måles med **MTBF** (Mean Time Between Failures) og **MTTR** (Mean Time to Repair), og der er en afvejning mellem de to.',
          'Mønstrene falder i fem kategorier: **Architectural** (arkitekturbeslutninger for fault tolerance), **Detection** (finde og lokalisere errors), **Error recovery** (genskabe en gyldig tilstand), **Error mitigation** (“reducing the time between errors”) og **Fault treatment** (identificere, isolere og rette faults). Error handling 1 dækker de arkitektoniske, Error handling 2 detektion.',
        ],
      },
      {
        term: 'Defensive programming og warnings',
        body: [
          'Slidet stabler fire lag: “Fault in all code” — også i den fault-tolerante software selv; “Memory is not trustable”; **Design** (selvrevisionerende datastrukturer, vedligeholdbarhed, redundans); og **Tools** (statisk analyse som lint, kodestandarder).',
          'Error handling 2 åbner med tre IDE-advarsler: en `for`-løkke, der kan være en `foreach`, et muligt `System.NullReferenceException` og “Use pattern matching” på en `Equals` med `obj as Entity`. Warnings kommer fra compileren, lint er et separat værktøj (fx ReSharper), og begge hjælper os med at undgå errors. På sliden er “Try to” streget over: “**Always** treat warnings as errors.” Se [[swt/statisk-analyse|statisk analyse]] i SWT.',
        ],
      },
      {
        term: 'Redundans',
        body: [
          'Målet er at øge systemets availability og reliability. Man skal overveje, hvilken del der skal være redundant, og hvilke problemer det giver — sliden spørger: “E.g. Web server?”',
          'Tre typer: **spatial** — systemet kører flere steder eller i flere versioner (“remember software should be deterministic”); **temporal** — genberegn og sammenlign resultater, hvilket koster (mere) tid; **information** — samme data fra forskellige kilder.',
          'Tre konfigurationer, alle med Client → Load balancer foran: **Active/Active** (Node A og B begge active; hurtigt skift, dobbelt kapacitet, kræver load balancer), **Active/Standby** (Node B står standby; én node kan klare det hele) og **N+M** (Node A.1 og A.2 active, B.1 standby; dyrere).',
        ],
      },
      {
        term: 'Mennesker i systemet',
        body: [
          'Mennesker er dårlige til gentaget arbejde, mange trin, hurtige reaktioner og at holde opmærksomheden — men gode til at se sekvenser og mønstre.',
          '**Minimize human intervention**: gør det synligt, at systemet kører normalt, så ingen griber ind uden grund, og ret errors, før de bliver failures. Errors rapporteres til noget (fx en fault observer), input og output får et fælles mønstersprog (“think DDD’s ubiquitous language”, se [[ddd|DDD]]), og systemet håndterer faults, errors og failures selv, fx med error handlers og recovery blocks.',
          '**Maximize human participation**: “Is total autonomous systems a goal?” Lad domæneeksperter eller udviklere styre systemet, prioritér vigtige beskeder før mindre vigtige, giv hver brugergruppe en administrations- eller vedligeholdelsesside, og fastlæg procedurer på forhånd.',
        ],
      },
      {
        term: 'Fault observer',
        body: [
          'En fælles komponent, som resten af systemet rapporterer faults og errors til — begrundet med DRY. Der kan være flere fault observers, for redundans eller én pr. fault- eller error-type.',
          'Kommunikationen er publisher/subscriber, “e.g. observer, events etc.” — altså [[observer|Observer-mønsteret]] eller [[swt/events|C# events]]. Figuren viser komponenter, der sender *Fault Reports* til Fault Observer 1 og 2, som hver sender videre til flere modtagere; én modtager lytter på begge.',
        ],
      },
      {
        term: 'Reduced capability og event-driven architecture',
        body: [
          'Failures kan håndteres på to måder: 1) redundans (“think Netflix”) og 2) **reduced capability**. Slidene forklarer det med billeder: Chaos Monkeys README og et analogt IP-1310/ALR-instrument ved siden af et cockpit med digitale skærme — systemet kan falde tilbage til en simplere funktion i stedet for at stoppe.',
          'Error handling 1 slutter med et diagram over **event-driven architecture**: et *Event* sendes ind i en *Event Channel*, og *Event Processors* (hver med fire moduler) læser fra kanalerne og kan selv sende nye events ind i en anden kanal. Sender og modtager kender kun kanalen.',
        ],
      },
      {
        term: 'Detektion og system monitor',
        body: [
          'Detektion er nødvendig for både recovery og mitigation. Man leder efter afvigelser fra normal adfærd, med checks i koden eller “use AI to learn to notice differences”. Konkret: afgør, om koden oplever en error (return codes, [[swt/exceptions|exceptions]]); opdag, om eksekveringsenheder er holdt op med at virke (threads, tasks, processer, nodes); og threshold detection.',
          'En **system monitor** er et system eller en del af et, der overvåger systemet for errors *og handler*. Den skal undgå to yderpunkter: at systemet fejler i stilhed, og at det fejler og underretter alle. Den overvåger med heartbeat eller watchdog og skal informere fault observeren.',
          'Fordele: tidlig detektion og proaktiv vedligeholdelse, fx af ressourceallokering. Overvejelser: overhead mellem overvågning og “normal” brug, tærskler, privatliv og sikkerhed.',
        ],
      },
      {
        term: 'Heartbeat og watchdog',
        body: [
          '**Heartbeat** sker med faste intervaller — men ikke så tit, at det oversvømmer et system under belastning. To varianter: det overvågede system sender selv heartbeats til monitoren, eller monitoren sender en heartbeat-request og forventer et acknowledgment. Sekvensdiagrammet viser Monitor → Monitored `Ok?` og svaret `Yes`, gentaget. Et heartbeat kan bære health information, fra existing metrics eller specifik for applikationens logik.',
          '**Watchdog** løser heartbeatets problem: “Heartbeat requires extra messages – the same with acknowledgment.” En watchdog overvåger *passivt* de beskeder og operationer, der alligevel finder sted, og kræver derfor synlig kommunikation. Den kan være hardware eller software. I diagrammet går Client → Server `Request` / `Reponse` gennem Watchdog i stedet for direkte.',
          'En system monitor overvåger flere tasks; en watchdog kun én, og den kan rapportere til en system monitor.',
        ],
      },
      {
        term: 'Existing metrics og chaos engineering',
        body: [
          '**Existing metrics**: et system under pres skal ikke lave ekstra beregninger, som kan forringe servicen yderligere, og kode, der kun kører i specielle situationer, kan gemme latente errors. Brug i stedet tal, der allerede findes: CPU-belastning, hukommelsesforbrug, diskforbrug, antal åbne filer og svartid.',
          '**Chaos engineering**: injicér bevidst faults — dræb processer, indfør latency — for at validere, at detektionslaget findes og virker. I stedet for passivt at se på systemet får man aktiv validering. Slidene viser Netflix’ Simian Army; Chaos Monkey “randomly terminates virtual machine instances and containers” i produktion.',
        ],
      },
    ],
    viz: 'fejlhaandtering',
    keyPoints: [
      'Fault (bug, udviklerens) → error (forkert tilstand) → failure (synlig for brugeren). Ikke alle faults bliver errors, ikke alle errors failures.',
      'Et crash er ikke det værste: datatab og crash langt fra den oprindelige bug er værre. Fail fast mod recovery.',
      'Fault tolerance = redundans + recovery + detektion; målt med MTBF og MTTR.',
      'Fem kategorier: architectural, detection, error recovery, error mitigation, fault treatment.',
      'Redundans: spatial, temporal, information. Konfigurationer: Active/Active, Active/Standby, N+M.',
      'Fault observer: fælles modtager af fault reports via publish/subscribe (DRY).',
      'System monitor overvåger mange tasks med heartbeat (ekstra beskeder) eller watchdog (passivt, kun én task).',
      'Brug existing metrics på et presset system; validér detektionen med chaos engineering. Behandl altid warnings som errors.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'Warning: muligt NullReferenceException',
        source: 'Error handling 2.pdf s. 3 (IDE-skærmbillede)',
        code: `public int DoSomething()
{
    var l = GetList();

    if (l != null)
    {
        DoSomething(l);
    }

    return l.Count;   // Possible 'System.NullReferenceException'
}`,
      },
    ],
    exam: [
      'En fault er en defekt i koden, en error er den forkerte tilstand, når fault’en bliver aktiveret, og en failure er det, brugeren ser. I Bowling-eksemplet er fault’en en forkert frame-beregning, error’en den forkerte tilstand, og failure’en det forkerte output. Ikke alle faults bliver til failures — det er dér, fejlhåndteringen kan gribe ind.',
      'Fault tolerance bygger på redundans, recovery og detektion. Redundans kan være spatial, temporal eller information, og i drift ser man den som Active/Active eller Active/Standby bag en load balancer. Afvejningen måles med MTBF og MTTR.',
      'Detektion kræver, at nogen ser efter. En system monitor overvåger flere tasks og rapporterer til en fault observer, typisk med publish/subscribe som i Observer-mønsteret.',
      'Heartbeat og watchdog er to måder at overvåge på. Heartbeat er aktivt — `Ok?`/`Yes` med faste intervaller — men koster ekstra beskeder. En watchdog lytter passivt på den trafik, der alligevel er, og overvåger kun én task. Under pres bør man bruge existing metrics frem for ekstra beregninger.',
      'Detektionslaget skal selv testes. Chaos engineering gør det aktivt ved bevidst at dræbe processer eller indføre latency, som Netflix’ Chaos Monkey.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W13.2_Error_Handling.md'), original: 'Error handling 1.pdf', pages: 's. 2–20', note: 'Fault/error/failure, fault tolerance, arkitekturmønstre' },
      { path: m('slides/SW4SWD-01_W13.2_Error_Handling.md'), original: 'Error handling 2.pdf', pages: 's. 3–14', note: 'Warnings, detection patterns, heartbeat, watchdog, chaos engineering' },
      { path: 'swd/kilder/uge-13_error-handling/Slides - Copy (1).html', note: 'Brightspace-siden: Error handling 1 om torsdagen, Error handling 2 om tirsdagen' },
    ],
    gaps: [
      '**Reduced capability** defineres ikke. Slidene (Error handling 1 s. 18–19) viser kun Chaos Monkeys README og billeder af et analogt instrument og et digitalt cockpit; Chaos Monkey hører egentlig til redundans og chaos engineering (Error handling 2 s. 14).',
      'Diagrammet over event-driven architecture (Error handling 1 s. 20) står uden tekst og uden kilde. Hvordan stilen bruges til fejlhåndtering, siger slidene ikke.',
      'Flere punkter er kun nøgleord: “Oppose to Error Mitigation – Time-consuming” (s. 9), “Error Mitigation: Reducing the time between errors” (s. 8), “Active/Standby: Double the capacity” (s. 11), error handlers og recovery blocks (s. 14) og tradeoff’et mellem MTBF og MTTR (s. 6) forklares ikke nærmere (alle Error handling 1).',
      'Slidet om heartbeat nævner to varianter (Error handling 2 s. 9), men sekvensdiagrammerne (Error handling 2 s. 10 og 12) viser kun request/acknowledgment-varianten. Hvad monitoren gør, når svaret udebliver, står ikke.',
      'Der er ingen C#-kode til fault observer, system monitor, heartbeat eller watchdog. Den eneste kode er IDE-skærmbillederne om warnings (Error handling 2 s. 3), hvor en tooltip dækker en del af `Equals`-koden.',
      'Uden for materialet: kategorierne og mønsternavnene (fault observer, system monitor, heartbeat, watchdog, existing metrics, minimize human intervention, maximize human participation) ser ud til at komme fra Robert Hanmer, *Patterns for Fault Tolerant Software* (2007). Slidene nævner ikke bogen.',
      'Lektionsplanen lægger error handling i uge 13 (HK) og uge 14 (HAJ); begge decks har Henrik Bitsch Kirk i sidefoden.',
    ],
    keywords: ['fejlhåndtering', 'error handling', 'fault', 'error', 'failure', 'fault tolerance', 'fail fast', 'recovery', 'MTBF', 'MTTR', 'defensive programming', 'warnings', 'lint', 'ReSharper', 'redundans', 'redundancy', 'spatial', 'temporal', 'information redundancy', 'Active/Active', 'Active/Standby', 'N+M', 'load balancer', 'fault observer', 'reduced capability', 'event-driven architecture', 'detection', 'system monitor', 'heartbeat', 'watchdog', 'existing metrics', 'chaos engineering', 'Chaos Monkey', 'Simian Army', 'Bowling', 'human intervention'],
  },
]
