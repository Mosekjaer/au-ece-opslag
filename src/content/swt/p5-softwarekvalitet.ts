import type { Part } from '../types'
import { md } from './paths'

export const softwarekvalitet: Part = {
  id: 'softwarekvalitet',
  title: 'Softwarekvalitet og analyse',
  topics: [
    {
      slug: 'statisk-analyse',
      title: 'Statisk analyse og cyklomatisk kompleksitet',
      short: 'Statisk analyse',
      week: 'Uge 8 · 08.1',
      definition:
        'Statisk analyse undersøger koden **uden at køre den**: kvantitativt med metrikker som lines of code, **cyklomatisk kompleksitet**, maintainability index og defect density, og kvalitativt med kodestil, compiler-advarsler, analyseværktøjer og code review. Cyklomatisk kompleksitet tæller de lineært uafhængige stier gennem koden: `M = E − N + 2P`, for struktureret kode lig antal beslutningspunkter + 1.',
      concepts: [
        {
          term: 'Fire slags metrikker',
          body: [
            'Materialet (efter Fenton og Bieman) har en 2×2-tabel. **Statisk kvantitativ**: LOC, cyklomatisk kompleksitet, maintainability index, defect density. **Statisk kvalitativ**: læsbarhed, dokumentationskvalitet — fra code review og inspektion. **Dynamisk kvantitativ**: køretid, hukommelsesforbrug, coverage. **Dynamisk kvalitativ**: brugertilfredshed, crash management — fra brugerfeedback og post-mortem-analyse. Den dynamiske halvdel er [[dynamisk-analyse|dynamisk analyse]].',
          ],
        },
        {
          term: 'Utilsigtet og essentiel kompleksitet',
          body: [
            'Brooks (*No Silver Bullet*, 1986): **utilsigtet** kompleksitet kommer af udviklingens begrænsninger — dårligt design, sprog og værktøjer — og er uønsket. **Essentiel** kompleksitet er problemets egen — forretningslogik, skalerbarhed, fejltolerance — og kan ikke undgås.',
            'Værktøjer kan ikke skelne de to, så man kan ikke vedtage en politik som “kompleksitet < K”. Brug metrikkerne som **indikatorer**: reducér den utilsigtede, test den essentielle.',
          ],
        },
        {
          term: 'Cyklomatisk kompleksitet',
          body: [
            'McCabe (1976): antallet af lineært uafhængige stier gennem kildekoden, beregnet på kontrolflowgrafen (CFG): `M = E − N + 2P`, hvor E er kanter, N knuder og P antal sammenhængende komponenter. Sammensatte betingelser som `if (0 < x && x < 10)` tælles som én.',
            'Eksemplet: `action0; while (cond1) { action1; action0; } if (cond2) { action2; } action3;` har 9 kanter og 8 knuder: `M = 9 − 8 + 2·1 = 3` — to beslutningspunkter + 1.',
            'Skala: 1–10 simpel, lav risiko; 11–20 mere kompleks, moderat risiko; 21–50 kompleks, høj risiko; over 50 utestbar, meget høj risiko. En fuldt forbundet graf med 12 knuder (66 kanter) giver 55 — “untestable”.',
          ],
        },
        {
          term: 'Kompleksitet og testtilfælde',
          body: [
            '*branch coverage ≤ cyklomatisk kompleksitet ≤ antal stier*. M er en øvre grænse for antallet af white box-tests til fuld branch coverage og en nedre grænse for fuld path coverage.',
            'Slidets eksempel: `k = 0` ved start, løkkekroppen sætter `k` forkert, og if-grenen bruger `k`. To tests — while(true)+if(true) og while(false)+if(false) — giver fuld branch coverage (“lower bound, bug not found”). Alle fire kombinationer giver fuld path coverage (“upper bound, bug found”). I praksis tager man M = 3 stier, der dækker mest — while(true)+if(false), while(false)+if(false), while(true)+if(true) — og finder fejlen.',
          ],
        },
        {
          term: 'Reducér kompleksiteten',
          body: [
            'Refaktorér til mindre funktioner, og erstat betingelser med polymorfi via designmønstre (Strategy, State, Factory Method, Template Method, Command, Chain of Responsibility). Fugle-eksemplet: en `switch` på fugletype har M = 5; som tre klasser med hver sin `plumage()` er den samlede kompleksitet stadig 5, men hver metode har ≤ 2.',
            'Øvelsen: refaktorér [[state-machines|DoorControl]] fra `switch` til GoF State og mål kompleksiteten før og efter — og diskutér, om det gør test af overgangene lettere eller sværere.',
          ],
        },
        {
          term: 'Maintainability index og defect density',
          body: [
            'Visual Studio beregner LOC, class coupling, depth of inheritance, cyklomatisk kompleksitet og **maintainability index**: `max(0, (171 − 5,2·ln(Halstead Volume) − 0,23·CC − 16,2·ln(LOC)) · 100/171)`. 0–9 rød (lav), 10–19 gul (moderat), 20–100 grøn (god). Halstead-kompleksitet tæller forskellige operatorer og operander.',
            '**Defect density** = antal fejl / størrelse (KLOC) — til at vurdere kvalitet, sammenligne projekter og følge forbedringer.',
          ],
        },
        {
          term: 'Værktøjer, grænser og review',
          body: [
            'Statisk fejlfinding leder efter null-dereferencer, division med nul, overflow, uinitialiserede variable, ukontrolleret brugerinput (injection), død kode og løkkeinvariante udtryk. Compileren er din ven: at ignorere en advarsel skal være en informeret beslutning. .NET Code Analysis (`<AnalysisLevel>latest-Recommended</AnalysisLevel>`), ReSharper, SonarQube og Coverity går videre — men alle er begrænset til koden og finder ikke forkert forretningslogik.',
            'Grænsen: Collatz-formodningen er et “hårdt problem”; Turings stopproblem (1937) og Rices sætning (1953) viser, at der ikke findes en generel metode til at afgøre interessante egenskaber ved programmer. Derfor må vi teste.',
            '**Code review** (uformelt) og **inspection** (formelt, med procedure og tjekliste) er manuel statisk analyse, understøttet af merge requests. Fejl fundet sent er dyre: i DoD-tallene tager en fejl 5 minutter at fjerne i design review og 1405 minutter i systemtest.',
          ],
        },
      ],
      viz: 'cyclomatic',
      keyPoints: [
        'Statisk = uden at køre koden; kvantitativt (metrikker) og kvalitativt (stil, review).',
        '`M = E − N + 2P` = beslutningspunkter + 1 for struktureret kode.',
        '1–10 lav risiko, 11–20 moderat, 21–50 høj, > 50 utestbar.',
        'branch coverage ≤ M ≤ antal stier.',
        'Metrikker er indikatorer, ikke politik — essentiel kompleksitet kan ikke fjernes.',
        'Polymorfi (fx State-mønsteret) fordeler kompleksiteten på mindre metoder.',
        '**Eksamen:** S22re delopgave 8 (“hvad er statisk analyse? 5 linjer”) og E19 delopgave 7 (software quality metrics: cyklomatisk kompleksitet og maintainability index).',
      ],
      code: [
        {
          lang: 'text',
          title: 'Kompleksiteten talt',
          source: 'Static Analysis.pdf s. 6–7',
          code: `void func()
{
    action0;
    while (cond1)        // beslutning 1
    {
        action1;
        action0;
    }
    if (cond2)           // beslutning 2
    {
        action2;
    }
    action3;
}

CFG: E = 9, N = 8, P = 1
M = E − N + 2P = 9 − 8 + 2 = 3   (= 2 beslutninger + 1)`,
        },
      ],
      exam: [
        'Statisk analyse undersøger koden uden at køre den. Det kan være kvantitativt — metrikker som cyklomatisk kompleksitet og maintainability index — eller kvalitativt, som compiler-advarsler, analyseværktøjer og code review.',
        'Cyklomatisk kompleksitet er antallet af lineært uafhængige stier, `E − N + 2P` på kontrolflowgrafen; for struktureret kode antal beslutninger plus én. Over 10 stiger risikoen, over 50 er koden reelt utestbar.',
        'Kompleksiteten siger noget om test: den er en øvre grænse for, hvor mange tests der skal til for fuld branch coverage. Den kan sænkes ved at erstatte betingelser med polymorfi, fx State-mønsteret.',
        'Værktøjerne kan ikke skelne essentiel fra utilsigtet kompleksitet, så tallene er indikatorer, ikke en regel.',
      ],
      sources: [
        { path: md('08.1-2-software-quality-metrics/01-Static-Analysis.pdf-8.1.md'), original: 'Static Analysis.pdf', pages: 's. 3–28' },
        { path: md('08.1-2-software-quality-metrics/50-SQM-CI---Exercise-CC.md'), original: 'SQM CI - Exercise CC.pdf', pages: 's. 1–2' },
      ],
      gaps: [
        'Slide 6 skriver “M = number of decision points + 1 (here: 2)”. Parentesen må betyde antallet af beslutningspunkter; slide 7 regner M = 3 for samme graf.',
        'Slide 10 er ikke konsistent: kombinationen while(true)+if(true) står både i branch-sættet, der “ikke finder fejlen”, og i det tredelte sæt, der “finder den”. Slidet siger ikke præcis, hvornår fejlen viser sig.',
        'Slide 8’s eksempel med tre adskilte grafer regner `(4+22+10) − (4+22+10) + 2·3 = 6` — to kanter pr. komponent er altså det, der bliver tilbage. Slidet forklarer ikke, hvorfor P ganges med 2.',
        'Slide 8 skriver for K₁₂: `66 − 12 + 1 = 55`; formlen giver `66 − 12 + 2 = 56`. Slidet bruger +1, ikke +2P.',
        'Formlen for maintainability index på s. 15 er gengivet uden de ydre parenteser; Microsofts dokumentation (link på slidet) har `(171 − …) · 100/171`.',
        'Kursusplanens lektion hedder “Software Quality Analysis”; modulet hedder “Software Quality Metrics”.',
      ],
      keywords: ['statisk analyse', 'static analysis', 'software metrics', 'software quality metrics', 'cyclomatic complexity', 'cyklomatisk kompleksitet', 'McCabe', 'CFG', 'control flow graph', 'kontrolflowgraf', 'maintainability index', 'Halstead', 'LOC', 'defect density', 'code review', 'inspection', 'accidental complexity', 'essential complexity', 'Brooks', 'halting problem', 'SonarQube', 'ReSharper', 'State pattern'],
    },

    {
      slug: 'dynamisk-analyse',
      title: 'Dynamisk analyse',
      short: 'Dynamisk analyse',
      week: 'Uge 8 · 08.2',
      definition:
        'Dynamisk analyse undersøger programmet, **mens det kører** — enten applikationen, testsuiten eller benchmarks. **Kvalitativt** finder den problemer som ufangede exceptions, buffer overflow, lækager og race conditions (instrumentering, emulering, assertions, logging). **Kvantitativt** måler den ressourceforbrug — CPU, hukommelse, flaskehalse — med profilering.',
      concepts: [
        {
          term: 'Typiske køretidsproblemer',
          body: [
            'Ufangede exceptions, uinitialiserede variable, buffer overflow, stack overflow, ressourcelækager, race conditions. Mange kan ikke findes statisk, men viser sig, når koden kører.',
          ],
        },
        {
          term: 'Kvalitativ overvågning',
          body: [
            '**Instrumentering**: compileren indsætter sanity checks for lækager, race conditions osv. og laver en særlig eksekverbar fil; typisk 2–10× langsommere (Linux Address/Thread Sanitizers). **Emulering**: den færdige (release-)fil køres i en emulator, der tjekker; typisk 10–20× langsommere (Valgrind til hukommelse, Helgrind til tråde).',
            '**Assertions** er manuel instrumentering — “fælder”: `System.Diagnostics.Debug.Assert(condition)` svarer til `if (condition) {} else { DisplayError(); }`, virker i Debug og kan påvirke ydelsen. Kør en test med debug-kode.',
            '**Logging** er manuel instrumentering af nyttig information: fejllogging (kontekst, stack traces, argumenter som hvilken fil der ikke kunne åbnes) og tracing (historikken frem mod fejlen), fx med `Microsoft.Extensions.Logging`.',
          ],
        },
        {
          term: 'Kvantitativ overvågning',
          body: [
            'Ressourceforbrug: systembelastning (brug for hurtigere hardware?), effektivitet (batteri, flash-slid, CO₂) og skalerbarhed. Metrikker: CPU (instruktioner pr. cyklus, cache hits, branch prediction), systemressourcer (hukommelsesaftryk og -fragmentering, file handles, sockets, netværk) og andre flaskehalse (virtuel mod fysisk hukommelse, lock contention).',
            'Tre måder at måle: **instrumentering** (tællere indsat pr. funktion eller linje — intrusiv, hurtig, præcis; Visual Studio Performance, gprof), **emulering** (ikke-intrusiv, langsom, præcis; callgrind, cachegrind) og **sampling** (et eksternt værktøj måler med faste intervaller — ikke-intrusiv, hurtig, upræcis; Linux perf).',
          ],
        },
        {
          term: 'Profilering og flaskehalse',
          body: [
            'En profiler tæller, hvor mange gange hver linje udføres. I eksemplet kalder `main` `f(i)` for `i = 0…4`, og løkken i `f` kører 0+1+2+3+4 = 10 gange: `sum += i` får 10 stjerner, `for`-linjen i `f` 15.',
            'Find den del, der bruger mest tid, og fokusér der; vurdér igen efter hver ændring. Høj ydelse kræver, at alle aspekter adresseres — parallelisering, hukommelsesbåndbredde, lokalitet. Amdahls lov: er kun 50 % parallelliserbart, flader speedup ud omkring 2 uanset antal processorer; ved 95 % omkring 20.',
          ],
        },
        {
          term: 'Post-mortem',
          body: [
            'Oversigten på s. 15 placerer også post-mortem-analyse, stack traces og memory dumps under dynamisk kvalitativ analyse — informationen fra et program, der er gået ned.',
          ],
        },
      ],
      viz: 'profiling-counts',
      keyPoints: [
        'Dynamisk = mens koden kører; statisk = uden.',
        'Kvalitativ: find fejl (sanitizers, Valgrind, assertions, logging).',
        'Kvantitativ: mål ressourcer (instrumentering, emulering, sampling).',
        'Instrumentering: præcis men intrusiv. Sampling: hurtig men upræcis.',
        'Profilering tæller udførsler pr. linje — find flaskehalsen først.',
        'Coverage er en dynamisk kvantitativ metrik.',
        '**Eksamen:** V22-23 delopgave 8 (“hvad er dynamisk analyse? 5 linjer”); F19re delopgave 8 (test af log-fil).',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Assertion som fælde i debug-builds',
          source: 'Dynamic Analysis.pdf s. 8',
          code: `public static void MyMethod(Type type, Type baseType)
{
    Debug.Assert(type != null, "Type parameter is null");
    // Perform some processing.
}`,
        },
        {
          lang: 'c',
          title: 'Profilering: udførsler pr. linje',
          source: 'Dynamic Analysis.pdf s. 13',
          code: `int main()
{
    int i = 0;                   // *
    for (i = 0; i < 5; i++)      // ******
    {
        f(i);                    // *****
    }
    return 0;                    // *
}
int f(int n)
{
    int i;                       // *****
    for (i = 0; i < n; i++)      // ***************
    {
        sum += i;                // **********
    }
    return sum;                  // *****
}`,
        },
      ],
      exam: [
        'Dynamisk analyse undersøger programmet, mens det kører, i modsætning til statisk analyse, der kun ser på koden.',
        'Den kvalitative del finder fejl, der først viser sig ved kørsel — lækager, race conditions, ufangede exceptions — med instrumentering, emulering, assertions og logging.',
        'Den kvantitative del måler ressourceforbrug og finder flaskehalse med profilering: instrumentering er præcis, men påvirker programmet; sampling er hurtig, men upræcis.',
        'Coverage er selv en dynamisk metrik: den måles ved at køre testsuiten.',
      ],
      sources: [
        { path: md('08.1-2-software-quality-metrics/03-Dynamic-Analysis.pdf-8.2.md'), original: 'Dynamic Analysis.pdf', pages: 's. 3–15' },
        { path: md('08.1-2-software-quality-metrics/04-Links-til-baggrundsmateriale.md') },
      ],
      gaps: [
        'Slidene har egne sidetal (-2- … -18-), der ikke passer med PDF’ens 16 sider; her bruges PDF-sidetallene.',
        'Materialet viser ingen .NET-profiler i brug; alle konkrete værktøjer (sanitizers, Valgrind, gprof, perf) er til C/C++ på Linux, undtagen Visual Studio Performance Suite.',
        'Slide 7 kalder Helgrind “thread checks” og Valgrind “defaults to memory checks” uden at forklare, at Helgrind er et Valgrind-værktøj.',
      ],
      keywords: ['dynamisk analyse', 'dynamic analysis', 'profiling', 'profilering', 'instrumentation', 'instrumentering', 'emulation', 'sampling', 'Valgrind', 'Helgrind', 'sanitizer', 'gprof', 'perf', 'Debug.Assert', 'assertion', 'logging', 'tracing', 'bottleneck', 'flaskehals', 'Amdahl', 'memory leak', 'race condition', 'post-mortem'],
    },
  ],
}
