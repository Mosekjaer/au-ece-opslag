import type { Part } from '../types'
import { md } from './paths'

export const testkvalitet: Part = {
  id: 'testkvalitet',
  title: 'Testkvalitet',
  topics: [
    {
      slug: 'coverage',
      title: 'Code coverage: line og branch',
      short: 'Coverage',
      week: 'Uge 5 · 05.1',
      definition:
        'Coverage måler, hvor meget af koden en testsuite gennemløber — et mål for **testens** kvalitet, ikke produktets. **Line coverage** (statement coverage) tæller ramte kildelinjer; **branch coverage** (decision coverage) kræver, at hver beslutning — `if`, `while`, `switch`, exception-handlere — har været både sand og falsk. 100 % line coverage kan skjule en gren, der aldrig er kørt.',
      concepts: [
        {
          term: 'Hvad coverage-analyse er',
          body: [
            'At finde de områder, en testsuite ikke rammer, at bruge den viden til systematisk at tilføje tests for de “urørte” dele, og at få et kvantitativt mål. Noten *Code Coverage Analysis* (Cornett) tilføjer: at finde redundante tests, der ikke øger coverage. Coverage er en **white box**-teknik.',
          ],
        },
        {
          term: 'Line coverage',
          body: [
            'Mest brugt, fordi den er lettest — ikke nødvendigvis bedst: ramte kildelinjer / kildelinjer × 100 %. Ulemperne: den er white box, den siger ikke, om noget blev testet nul gange, og den er ufølsom over for kontrolstrukturer (én gang eller flere?).',
            'Slidets eksempel: `int* p = 0; if (condition) p = &variable; *p = 117;`. Én test med `condition` sand giver 100 % line coverage — men er `condition` falsk, dereferences en null-pointer. Har vi testet den falske gren?',
          ],
        },
        {
          term: 'Branch coverage',
          body: [
            'Måler, i hvor høj grad alle beslutningspunkter er udøvet fuldt, inklusive “asynkrone grene” som exception- og interrupt-handlere. Enkel at beregne og uden line coverages problemer.',
            'Men den har også mangler: i `if (amount > 100 || someCode() == 0)` kan beslutningen være både sand og falsk, uden at `someCode()` nogensinde blev kaldt — kortslutning i `||` og `&&` (C, C#, C++, Java).',
          ],
        },
        {
          term: 'De andre mål',
          body: [
            'Condition coverage (hver delbetingelse sand og falsk), multiple condition coverage (alle kombinationer — eksponentielt), condition/decision, modified condition/decision (MC/DC), relational operator, function, call, loop … Noten sammenligner: decision coverage indeholder statement coverage, path coverage indeholder decision coverage — men coverage-mål kan ikke sammenlignes kvantitativt.',
          ],
        },
        {
          term: 'Målet: 100 %',
          body: [
            'Slidene: gør målet 100 %, intet mindre. Er coverage 95 %, ved du intet om de sidste 5 % — og er 95 % ok, er 90 % også, og 85 % … Kan noget ikke dækkes, så træf en **informeret beslutning** om at undtage det, og hold målet på 100 %. Coverage virker bedst på nye projekter, hvor den bruges fra start.',
            'Fordele: simpelt, objektivt og gentageligt mål; hjælper med at prioritere testindsatsen; viser tendenser. Ulemper: 100 % er ingen garanti for fejlfri kode; værktøjsafhængigt; siger intet om **udeladelsesfejl** (manglende funktionalitet); det tager tid.',
          ],
        },
        {
          term: 'Værktøjer og CI',
          body: [
            'Lokalt: Visual Studios egen coverage eller udvidelsen Fine Code Coverage med NuGet-pakken `coverlet.collector` — “fairly good branch coverage, without being perfect”. I CI: `dotnet test --collect:"XPlat Code Coverage"` laver `coverage.cobertura.xml`, `ReportGenerator` laver en HTML-rapport og en `Summary.txt`, og et regex i `.gitlab-ci.yml` henter tallet ud til GitLab. Under merge requests er udækkede linjer markeret røde.',
            'Coverage-beregning tager tid, fordi der udføres ekstra kode i UUT — overvej, om den skal køre ved hvert push eller i et nightly build. Og: coverage siger intet om integrationstests.',
          ],
        },
      ],
      viz: 'line-branch',
      keyPoints: [
        'Coverage måler testsuiten, ikke produktet.',
        'Line: ramte linjer / alle linjer. Branch: hver beslutning både sand og falsk.',
        '100 % line coverage kan skjule en utestet `else`.',
        'Branch coverage ser ikke delbetingelser bag `||`/`&&`.',
        'Kursets mål er 100 %; undtagelser skal være informerede beslutninger.',
        'Coverage finder ikke udeladelsesfejl — kombinér med BVA og ZOMBIE.',
        '**Eksamen:** delopgave 5 (“brug coverage og gør rede for, hvordan du har suppleret den”) i E19, S22, S22re og V22-23.',
      ],
      code: [
        {
          lang: 'c',
          title: '100 % line coverage — men hvad hvis condition er falsk?',
          source: 'Coverage-latest.pdf s. 4',
          code: `int* p = 0;
if (condition)
    p = &variable;
*p = 117;`,
        },
        {
          lang: 'yaml',
          title: 'Coverage i pipelinen (uddrag)',
          source: 'Coverage-latest.pdf s. 14–15',
          code: `script:
  - 'dotnet test --collect:"XPlat Code Coverage" --logger:"junit;MethodFormat=Class;FailureBodyFormat=Verbose"'
  - 'dotnet ~/.nuget/packages/reportgenerator/*/tools/net8.0/ReportGenerator.dll -reports:./*/*/*/*/coverage.cobertura.xml -targetdir:coveragereport "-reporttypes:Html;TextSummary"'
  - 'cat ./coveragereport/Summary.txt'
coverage: '/Line coverage: (\\d+.\\d+)/'
artifacts:
  reports:
    coverage_report:
      coverage_format: cobertura
      path: ./**/coverage.cobertura.xml`,
        },
      ],
      exam: [
        'Coverage måler, hvor meget af koden mine tests gennemløber, og er dermed et mål for testsuitens kvalitet, ikke for produktets.',
        'Jeg kigger på branch coverage og ikke kun line coverage. Line coverage kan være 100 %, selvom en `else`-gren aldrig er kørt; branch coverage kræver, at hver beslutning har været både sand og falsk.',
        'Coverage kan kun vise, hvad der mangler at blive kørt — ikke om funktionalitet mangler, eller om grænserne er testet. Derfor har jeg suppleret med grænseværdianalyse, ækvivalensklasser og ZOMBIE for at finde de nødvendige og tilstrækkelige testtilfælde.',
        'Målet er 100 %. Det, der ikke er dækket, er enten en manglende test, eller en bevidst og begrundet undtagelse.',
      ],
      sources: [
        { path: md('05.1-2-test-quality-1-og-2/02-Coverage.md'), original: 'Coverage-latest.pdf', pages: 's. 2–17' },
        { path: md('05.1-2-test-quality-1-og-2/50-Code-Coverage-Analysis.md'), original: 'Code Coverage Analysis.pdf', pages: 's. 1–8' },
        { path: md('02.2-git-workflow/04-GitLab-Merge-Request-Example.md'), original: 'GitWorkflow-GitlabMergeRequestExample.pdf', pages: 's. 3', note: 'Udækkede linjer markeres røde' },
      ],
      gaps: [
        '**Slides og note er uenige om målet.** Slidene: “Make the goal 100 %, nothing less” (s. 8). Noten: sigt efter 80–90 % eller mere før release, undgå mål under 80 %, og “setting an intermediate goal of 100 % coverage … can impede testing productivity” (s. 7–8).',
        'Læsevejledningen siger selv, at der ikke er 100 % enighed om terminologien. Noten kalder decision coverage for “C2” og advarer mod navnet.',
        'CI-scriptet på s. 14 bruger `tools/net8.0/ReportGenerator.dll`, terminal-eksemplet på s. 16 `tools/net10.0/` — stien afhænger af den installerede version.',
        'Slide 4’s C-eksempel og slide 6’s `someCode()` er ikke C#; noten bruger også C/C++. Ingen coverage-eksempler i materialet er i C#.',
      ],
      keywords: ['coverage', 'code coverage', 'test coverage', 'line coverage', 'statement coverage', 'branch coverage', 'decision coverage', 'condition coverage', 'MC/DC', 'path coverage', 'Coverlet', 'coverlet.collector', 'ReportGenerator', 'cobertura', 'Fine Code Coverage', '100 %', 'white box'],
    },

    {
      slug: 'ep-bva',
      title: 'Ækvivalensklasser og grænseværdianalyse',
      short: 'EP og BVA',
      week: 'Uge 5 · 05.2',
      definition:
        'En **ækvivalensklasse** (equivalence partition, EP) er en mængde input, der giver samme output, kategori eller adfærd — også de ugyldige. **Grænseværdianalyse** (BVA) finder de inputværdier, hvor output skifter værdi, adfærd eller gyldighed, og tester **på** grænsen og **på hver side** af den. EP sikrer, at man ikke laver for mange tests; BVA, at man laver nok.',
      concepts: [
        {
          term: 'Ækvivalensklasser',
          body: [
            'Test med mindst én værdi fra hver EP — det er **nødvendigt**. Test ikke med alle værdier i en EP, kun én eller få — det er **tilstrækkeligt**. Ugyldigt output eller en udefineret kategori er også en EP. EP’er er ofte afgrænset af grænser; så laves BVA først.',
            'Eksempel: `bool IsPositive(int number)` har to EP’er — `false` og `true` — adskilt ved 0/1.',
          ],
        },
        {
          term: 'Hvorfor grænser',
          body: [
            'Programmeringsfejl opstår ofte ved grænser. Numerisk: skal det være `if (x > 100)` eller `>=`? Diskret: tjekker `IsSubclassOf(typeof(Fruit))` om tomaten også er en grøntsag? For numerisk definerede EP’er skal EP suppleres med BVA; for diskrete mængder kan man nøjes med EP.',
          ],
        },
        {
          term: 'Month2Semester',
          body: [
            '`string Calendar.Month2Semester(uint month)`: givet en måned 1–12 returneres “Spring” (feb–jul) eller “Fall” (aug–jan). EP’erne er *illegal* (0), *Fall* (1), *Spring* (2–7), *Fall* (8–12) og *illegal* (13 og op).',
            'Løsningsslidet markerer grænseværdierne **0, 1, 2, 7, 8, 12, 13** og en ekstra værdi inde i de brede klasser: **3, 9, 14**.',
          ],
        },
        {
          term: 'Dynamiske og kombinerede grænser',
          body: [
            '`void Regulate()` i drivhuset har grænser, der kan sættes (`low`, `high`). Varmelegemet skifter ved `low`, vinduet ved `high`, og tilsammen giver det tre kombinerede EP’er. Testværdierne er `low−1`, `low`, `low+1` og `high−1`, `high`, `high+1`.',
          ],
        },
        {
          term: 'Flere dimensioner',
          body: [
            'Radar-eksemplet har to input: azimuth (−180 til 179) og elevation (−90 til 90). Slidets forslag: azimuth −200, −180, −15, 0, +15, +179, +200 og elevation −100, −90, −15, 0, +15, +90, +100.',
            '**Dimensionel multiplikation**: antallet af værdier pr. dimension ganges med de andre dimensioners, så med flerdimensionelt input er det endnu vigtigere at skære ned på testværdierne.',
          ],
        },
        {
          term: 'Black box med programmørviden',
          body: [
            'BVA og EP er black box-værktøjer — kun input og forventet output fra specifikationen — men de bruger generel viden om, hvordan programmer konstrueres. EP reducerer antallet af tests gennem analyse; BVA vælger dem, så fejl mere sandsynligt findes.',
          ],
        },
      ],
      viz: 'ep-bva-line',
      keyPoints: [
        'EP: input med samme output/adfærd — én værdi pr. klasse er nødvendig og tilstrækkelig.',
        'Ugyldige input er også en EP.',
        'BVA: test på grænsen og på begge sider.',
        'Numeriske EP’er kræver BVA; diskrete klarer sig med EP.',
        'Month2Semester: 0, 1, 2, 7, 8, 12, 13 (+ 3, 9, 14).',
        'Flere dimensioner ganger antallet af tests — reducér.',
        '**Eksamen:** F19re delopgave 7 (BVA) og delopgave 5 i de nyere sæt (“hvordan har du suppleret coverage for at finde de nødvendige og tilstrækkelige test cases?”).',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Grænseværdierne som [TestCase]',
          source: 'Boundary-Value-Analysis.pdf s. 8 (værdierne); testformen fra Introduction to Unit Tests.pdf s. 18',
          code: `[TestCase(1u, "Fall")]
[TestCase(2u, "Spring")]
[TestCase(3u, "Spring")]
[TestCase(7u, "Spring")]
[TestCase(8u, "Fall")]
[TestCase(9u, "Fall")]
[TestCase(12u, "Fall")]
public void Month2Semester_ValidMonth_CorrectSemester(uint month, string expected)
{
    Assert.That(_uut.Month2Semester(month), Is.EqualTo(expected));
}
// 0, 13 og 14 er de ugyldige EP’er — materialet siger ikke, hvad metoden skal gøre med dem.`,
        },
      ],
      exam: [
        'Jeg har delt inputtet op i ækvivalensklasser — mængder af input med samme adfærd, inklusive de ugyldige. Én værdi fra hver klasse er nødvendig, og flere fra samme klasse tilføjer ikke noget.',
        'Klasserne er afgrænset af tal, så jeg har lavet grænseværdianalyse: jeg tester på hver grænse og på begge sider af den, fordi det er dér, fejl som `>` i stedet for `>=` sidder.',
        'Det er black box-teknikker, der supplerer coverage: coverage viser, hvilke grene der mangler, BVA viser, hvilke værdier der er værd at teste.',
      ],
      sources: [
        { path: md('05.1-2-test-quality-1-og-2/04-Boundary-Value-Analysis.md'), original: 'Boundary-Value-Analysis.pdf', pages: 's. 2–14' },
        { path: md('05.1-2-test-quality-1-og-2/01-Laesestof-til-Coverage.md'), note: 'Sammenlign Parameter Value Coverage med BVA' },
      ],
      gaps: [
        'Løsningen til Month2Semester (s. 8) ligger kun som billede og viser værdierne som pile uden forklaring. De lyse pile (3, 9, 14) tolkes her som ekstra værdier inde i klasserne; slidet skriver det ikke.',
        'Materialet siger ikke, hvad `Month2Semester` skal gøre ved en ugyldig måned (kaste? returnere noget?). `uint` gør negative værdier umulige.',
        'Materialet har ingen implementering eller tests af `Month2Semester`. Testkoden ovenfor er sat sammen her af slidets værdier og kursets `[TestCase]`-form.',
        '`IsPositive` defineres over ℕ₀, men tallinjen på s. 3 og 5 viser negative tal; slidet siger ikke, om 0 er positiv.',
        'Radar-eksemplet (s. 10–13) angiver ikke EP’erne eksplicit — kun forslaget til testværdier. Hvorfor ±15 er grænser, ses kun af figuren (sektoren “1 o’clock” og Level-båndet).',
      ],
      keywords: ['EP', 'equivalence partition', 'ækvivalensklasse', 'BVA', 'boundary value analysis', 'grænseværdianalyse', 'grænseværdi', 'Month2Semester', 'IsPositive', 'dimensional multiplication', 'dimensionel multiplikation', 'azimuth', 'elevation', 'off-by-one', 'black box'],
    },

    {
      slug: 'zombie',
      title: 'ZOMBIE: hvad skal testes?',
      short: 'ZOMBIE',
      week: 'Uge 5 · 05.2',
      definition:
        'ZOMBIE er en tjekliste til at vælge testtilfælde — i dag også en guide til test-driven development (James Grenning): **Z**ero, **O**ne, **M**any, **B**oundaries, **I**nterfaces, **E**xceptional behavior. De tre første er simple scenarier; B, I og E fanger grænser, alle metoder og robusthed.',
      concepts: [
        {
          term: 'Z – Zero',
          body: [
            'Nul input, nul output eller nul handlinger: test tilstanden på et nyoprettet objekt (nul kald), test med en tom samling som input, lav tests, der skal returnere en tom samling.',
          ],
        },
        {
          term: 'O – One',
          body: [
            'Ét input, ét output eller én handling: tilstanden efter ét kald af hver metode, input med en samling med ét element, tests der skal returnere præcis ét element.',
          ],
        },
        {
          term: 'M – Many',
          body: [
            'Mange: tilstanden efter flere kald af hver metode og efter blandede kald af flere metoder, samlinger med to eller flere elementer ind og ud.',
          ],
        },
        {
          term: 'B – Boundaries',
          body: [
            'Brug [[ep-bva|BVA]] til at vælge parametre — både gyldige og ugyldige — og EP til at holde antallet håndterbart.',
          ],
        },
        {
          term: 'I – Interfaces',
          body: [
            'Test alle metoder og alle overloads (forskelligt antal og typer af parametre). Test alle kastede exceptions — brug coverage for at være sikker. Udøv alle kaldte interfaces til afhængighederne (interaktionsbaseret test og integrationstest). Test alle events, UUT bruger fra afhængigheder, og alle events, UUT udbyder.',
          ],
        },
        {
          term: 'E – Exceptional behavior',
          body: [
            'Ikke kun exceptions fra specifikationen, men **robusthed**: hvad sker der ved forkert input (BVA)? Ved forkert kaldsrækkefølge — afhænger noget af rækkefølgen? Ved afhængigheder, der svarer med timeout, uventet resultat eller exception?',
          ],
        },
        {
          term: 'TDD med ZOMBIE: CircularBuffer',
          body: [
            'Grennings eksempel i C: **Zero** — buffer er tom efter oprettelse (`IsEmpty` returnerer bare `true`). **One** — ikke tom efter ét `Put` (nu sammenlignes `index` og `outdex`). **Many** — `Put` 41, 42, 43 og `Get` giver dem i samme rækkefølge (FIFO). **Boundary** — en buffer med kapacitet 2 tvinges til at *wrappe* rundt. **Exception** — `Put` i en fuld buffer returnerer `false`; `Get` fra en tom returnerer en standardværdi.',
            'Efter Zero og One “tester man ingenting” for en novice, men interfacet er næsten færdigt, koden har vist sig testbar, og flere grænsetilfælde er fanget i tests.',
          ],
        },
      ],
      viz: 'zombie-buffer',
      keyPoints: [
        'Zero, One, Many: de simple scenarier først.',
        'Boundaries: BVA og EP.',
        'Interfaces: alle metoder, overloads, exceptions, kaldte interfaces og events.',
        'Exceptional behavior: robusthed — forkert input, forkert rækkefølge, fejlende afhængigheder.',
        'Også en rækkefølge for TDD: skriv den simpleste test, så den simpleste kode.',
        '**Eksamen:** begrundelsen for testtilfældene i delopgave 3 og for suppleringen af coverage i delopgave 5.',
      ],
      code: [
        {
          lang: 'c',
          title: 'Zero og One i Grennings CircularBuffer',
          source: 'ZombieTesting.pdf s. 10',
          code: `TEST(CircularBuffer, is_empty_after_creation) {
    CHECK_TRUE(CircularBuffer_IsEmpty(buffer)); }

TEST(CircularBuffer, is_not_empty_after_put) {
    CircularBuffer_Put(buffer, 42);
    CHECK_FALSE(CircularBuffer_IsEmpty(buffer)); }`,
        },
        {
          lang: 'c',
          title: 'Boundary: tving bufferen til at wrappe',
          source: 'ZombieTesting.pdf s. 12',
          code: `TEST(CircularBuffer, force_a_buffer_wraparound) {
    CircularBuffer * buffer = CircularBuffer_Create(2);
    CircularBuffer_Put(buffer, 1);
    CircularBuffer_Put(buffer, 2);
    CircularBuffer_Get(buffer);
    CircularBuffer_Put(buffer, 3);
    LONGS_EQUAL(2, CircularBuffer_Get(buffer));
    LONGS_EQUAL(3, CircularBuffer_Get(buffer));
    CHECK_TRUE(CircularBuffer_IsEmpty(buffer));
    CircularBuffer_Destroy(buffer); }`,
        },
      ],
      exam: [
        'Jeg har valgt testtilfældene med ZOMBIE: først nul, ét og mange — fx et nyt objekt, ét kald og flere blandede kald — og så grænser med BVA.',
        'I for interfaces betyder, at alle offentlige metoder, overloads, exceptions og events skal testes, og at alle kald til afhængighederne skal udøves. Coverage hjælper med at se, om jeg har fået dem alle.',
        'E handler om robusthed: forkert input, forkert kaldsrækkefølge og afhængigheder, der fejler — det sidste tester jeg ved at lade en fake kaste.',
      ],
      sources: [
        { path: md('05.1-2-test-quality-1-og-2/07-ZombieTesting.md'), original: 'ZombieTesting.pdf', pages: 's. 2–13' },
      ],
      gaps: [
        'Grennings plakat (s. 2) udlægger B som “Boundaries, Behaviors” og E som “Exercise Exceptions”; slidene bruger “Boundaries” og “Exceptional Behavior”. Kursets udgave er slidenes.',
        'Hele TDD-eksemplet er i C med CppUTest-makroer; materialet har intet ZOMBIE-eksempel i C#.',
        'Slidene definerer ikke TDD ud over eksemplet; *Test Driven Development* er ikke et selvstændigt emne i kurset.',
      ],
      keywords: ['ZOMBIE', 'zero one many', 'boundaries', 'interfaces', 'exceptional behavior', 'TDD', 'test driven development', 'Grenning', 'CircularBuffer', 'testtilfælde', 'test case selection', 'robusthed'],
    },
  ],
}
