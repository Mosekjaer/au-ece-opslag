import type { Part } from '../types'
import { md } from './paths'

export const unitTest: Part = {
  id: 'unit-test',
  title: 'Unit test-grundlag',
  topics: [
    {
      slug: 'softwaretest',
      title: 'Softwaretest og V-modellen',
      short: 'Softwaretest',
      week: 'Uge 1 · 00.1–01.1',
      definition:
        'Softwaretest er i kurset *en systematisk og objektiv verifikation af en softwareenheds tilstand og adfærd ud fra objektive, forud fastlagte kriterier*. **V-modellen** parrer hvert designniveau med et testniveau: komponentdesign med unit test, systemdesign med integrationstest, systemspecifikation med systemtest og krav med accepttest.',
      concepts: [
        {
          term: 'Systematisk, objektiv og forud fastlagt',
          body: [
            '**Systematisk og objektiv** betyder målbar og gentagelig: alle kan køre testen igen og få identiske resultater, og testen er automatiseret. **Objektive kriterier** er målbare og uden plads til fortolkning — alle kan måle, hvor langt testen er nået. **Forud fastlagte kriterier** bestemmer, *før* testen begynder, hvilke dele der testes, hvordan, og hvordan resultatet måles.',
            'Kursets overordnede mål er kvalitet: at kunne kvalitetssikre sin egen kode og større systemer, som flere udviklere bygger sammen.',
          ],
        },
        {
          term: 'Den virkelige verden',
          body: [
            'Pris, kvalitet og funktionalitet trækker i hver sin retning, så test skal være omkostningseffektiv: tag de lavthængende frugter først, test de mest kritiske områder, og **automatisér testene**. Kursets mantra er *test early, test often, test enough*.',
          ],
        },
        {
          term: 'V-modellen',
          body: [
            'Venstre ben går ned gennem krav, systemspecifikation, systemdesign og komponentdesign til implementering. Højre ben går op gennem unit test, integrationstest, systemtest og accepttest. Hvert testniveau verificerer det designniveau, det står over for. Kurset følger benet opad: unit test (uge 1–5), integrationstest (uge 9) og system- og accepttest (uge 13).',
            'Materialet stiller vandfald (én stor cyklus: specificér, design, implementér, test) op mod iterativ udvikling (flere små cyklusser med feedback). Det er den iterative, der gør hyppig, automatiseret test nødvendig, se [[ci|Continuous Integration]].',
          ],
        },
        {
          term: 'Håndtest af Calculator',
          body: [
            'Første øvelse er at teste en `Calculator` (`Add`, `Subtract`, `Multiply`, `Power`) fra `Main()` med `Console.WriteLine`. Outputtet er rå tal uden forventede værdier, så den eneste “assert” er, at et menneske læser det. Slidene spørger bagefter: Hvilken tilstand var enheden i før testen? Var resultatet rigtigt? Blev succes eller fejl meldt? Blev alle metoder og alle situationer testet?',
            'Øvelsen skal vise, hvorfor et framework er nødvendigt: håndtest skalerer ikke til mange operationer og mange tests, og ingen kan se med ét blik om alt bestod. Svaret er [[unit-test|unit test med NUnit]].',
          ],
        },
      ],
      viz: 'v-model',
      keyPoints: [
        'Test = systematisk, objektiv verifikation mod forud fastlagte kriterier.',
        'Gentagelig og automatiseret — ellers er det ikke en test i kursets forstand.',
        'V-modellen: komponentdesign ↔ unit test, systemdesign ↔ integrationstest, systemspecifikation ↔ systemtest, krav ↔ accepttest.',
        'Test early, test often, test enough.',
        'Håndtest fra `Main()` har ingen forventede værdier og skalerer ikke.',
        '**Eksamen:** rammen for “unit- vs. integrationstest” og for at placere system- og accepttest.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Håndtest af Calculator fra Main()',
          source: 'Introduction to Unit Tests.pdf s. 2',
          code: `static void Main(string[] args)
{
    // Declare the unit-under-test
    var uut = new Calculator();

    // Test Add()
    Console.WriteLine("Add({0}, {1}) = {2}", 3.5, 2.5, uut.Add(3.5, 2.5));
    Console.WriteLine("Add({0}, {1}) = {2}", -3.5, 2.5, uut.Add(-3.5, 2.5));
    Console.WriteLine("Add({0}, {1}) = {2}", -3.5, -2.5, uut.Add(-3.5, -2.5));

    // Test Power()
    Console.WriteLine("Power({0}, {1}) = {2}", 2.0, 3.0, uut.Power(2.0, 3.0));
    Console.WriteLine("Power({0}, {1}) = {2}", -2.0, -3.0, uut.Power(-2.0, -3.0));
}`,
        },
      ],
      exam: [
        'Softwaretest er en systematisk og objektiv verifikation af en enheds tilstand og adfærd ud fra kriterier, der er fastlagt, før testen begynder. Det betyder, at testen skal være gentagelig og helst automatiseret.',
        'V-modellen parrer hvert designniveau med et testniveau: unit test verificerer komponentdesignet, integrationstest systemdesignet, systemtest specifikationen og accepttest kravene.',
        'Håndtest fra en `Main` giver bare tal på skærmen. Der er ingen forventede værdier og ingen samlet rapport, og det skalerer ikke — derfor bruger vi et unit test-framework.',
      ],
      sources: [
        { path: md('01.1-introduktion-unit-test/01-Introduction.pdf.md'), original: 'Introduction.pdf', pages: 's. 4–19' },
        { path: md('01.1-introduktion-unit-test/02-Introduction-to-Unit-Tests.pdf.md'), original: 'Introduction to Unit Tests.pdf', pages: 's. 2–3' },
        { path: md('00.1-kom-godt-igang-med-softwaretest/50-Hand-testing-Calculator.md'), original: 'Hand-testing Calculator.pdf', pages: 's. 1' },
      ],
      gaps: [
        'Materialet definerer ikke selv, hvad der adskiller system- og accepttest ud over V-modellens parring; det kommer først i lektion 13.2 ([[systemtest|system- og accepttest]]).',
      ],
      keywords: ['softwaretest', 'software test', 'V-model', 'V-modellen', 'verifikation', 'unit test', 'integrationstest', 'systemtest', 'accepttest', 'vandfald', 'waterfall', 'iterativ', 'håndtest', 'hand-test', 'Calculator', 'test early test often test enough'],
    },

    {
      slug: 'unit-test',
      title: 'Unit test med NUnit',
      short: 'Unit test og NUnit',
      week: 'Uge 1 · 01.1',
      definition:
        'En unit test tester en lille, klart afgrænset del af **Unit Under Test** (UUT), automatisk og gentageligt. Hver test følger **Arrange–Act–Assert**. I NUnit er testklassen en `[TestFixture]`, fælles Arrange ligger i `[SetUp]`, og hver `[Test]` er en selvstændig metode.',
      concepts: [
        {
          term: 'Hvad gør en god unit test',
          body: [
            'Den er automatiseret og gentagelig, let at skrive, gyldig i fremtiden, kan køres af alle med et tryk på en knap, og den er hurtig. Enhver afvigelse betyder et problem.',
            'En **vedligeholdelig** test er let at forstå, tester kun et lille og klart afgrænset område af UUT, er uafhængig af andre tests (man kan ændre én uden at kende eller bryde de andre), og er **robust**: den knækker ikke, når implementeringsdetaljer i UUT ændres.',
          ],
        },
        {
          term: 'Arrange–Act–Assert',
          body: [
            '**Arrange** (precondition): sæt UUT og testtilfældet i den ønskede tilstand. **Act**: udfør den aktivitet, der testes. **Assert** (postcondition): tjek, at det forventede skete.',
            'I NUnit laver `[SetUp]` den fælles Arrange før hver test — typisk `_uut = new Calculator();` — så en test ofte kun har Act og Assert.',
          ],
        },
        {
          term: 'NUnit: fixture, runner og rapport',
          body: [
            'NUnit understøtter **test cases** (de enkelte tests), **test fixtures** (setup/teardown pr. enhed), en **test runner**, der finder og kører testene, og **test reports**. Slidene pointerer, at alle relevante frameworks har de samme features og derfor ligner hinanden.',
            'Runneren finder testene via attributterne i testprojektets DLL. Det kan være ReSharper eller Test Explorer i Visual Studio, NUnit3-console eller `dotnet test` fra kommandolinjen (via `NUnit3TestAdapter`), og med en logger som `JunitXml.TestLogger` også en CI-server.',
            'Øvelsen lægger testene i et separat projekt `Calculator.Test.Unit`, der refererer til `Calculator` — ikke omvendt — med NuGet-pakkerne `Microsoft.Net.Test.Sdk`, `NUnit` og `NUnit3TestAdapter`.',
          ],
        },
        {
          term: 'Regler for god testkode',
          body: [
            'Én testklasse pr. klasse i biblioteket. Navnet angiver metode, scenarie og forventet resultat: `Add_AddTwoInts_SumIsCorrect()`.',
            'Kun ét scenarie og ét assert pr. testmetode (eller asserts om samme scenarie). Ingen komplekse tests — ingen `if`/`else`, `switch` eller løkker. Samme testkode med forskellige inputværdier skrives med `[TestCase(…)]`; forskelligt output eller adfærd er ofte forskellige scenarier.',
          ],
        },
        {
          term: 'Den grønne zone',
          body: [
            'Hold unit tests adskilt fra langsommere og mere komplicerede tests, fx integrationstests. Så har udviklerne en sikker **grøn zone**: de kan hente seneste kode, køre alt i det namespace eller den mappe, og alt skal være grønt. Fejler noget der, er det et rigtigt problem og ikke en fejlkonfiguration. Grøn zone-tests er hurtige og kan køres ofte — også på [[ci|CI-serveren]] ved hvert push.',
          ],
        },
      ],
      viz: 'aaa-nunit',
      keyPoints: [
        'AAA: Arrange (precondition), Act, Assert (postcondition).',
        '`[TestFixture]` = testklassen, `[SetUp]` = fælles Arrange, `[Test]` = én test, `[TestCase]` = samme test med andre data.',
        'Navn: `Metode_Scenarie_ForventetResultat`.',
        'Ét scenarie og ét assert pr. test; ingen `if` eller løkker i testkoden.',
        'Testprojektet refererer til produktionsprojektet — ikke omvendt.',
        'Den grønne zone: kun hurtige unit tests, der altid skal være grønne.',
        '**Eksamen:** delopgave 3 (“implementér unit tests og redegør for test suitens opbygning”).',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'En testklasse: fælles Arrange i [SetUp]',
          source: 'Introduction to Unit Tests.pdf s. 16',
          code: `namespace CalcTest;
using CalcLib;

public class Tests
{
    private Calculator _uut;

    [SetUp]  // Common Arrange
    public void Setup()
    {
        _uut = new Calculator();
    }

    [Test]
    public void Add_AddTwoInts_SumIsCorrect()
    {
        // Arrange
        // Act
        double result = _uut.Add(2, 3);
        // Assert
        Assert.That(result, Is.EqualTo(5.0));
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Samme test, flere data: [TestCase]',
          source: 'calculatortestsolution-1.0.10 · CalculatorUnitTests.cs',
          code: `[TestCase(3, 2, 5)]
[TestCase(-3, -2, -5)]
[TestCase(-3, 2, -1)]
[TestCase(3, -2, 1)]
[TestCase(3, 0, 3)]
public void Add_AddPosAndNegNumbers_ResultIsCorrect(int a, int b, int result)
{
    Assert.That(_uut.Add(a, b), Is.EqualTo(result));
}`,
        },
      ],
      exam: [
        'Mine tests følger Arrange–Act–Assert. Den fælles Arrange — at oprette UUT med dens fakes — ligger i `[SetUp]`, så hver test kun indeholder det, der er særligt for dens scenarie.',
        'Hver testklasse hører til én klasse, og testnavnene siger metode, scenarie og forventet resultat, fx `Add_AddTwoInts_SumIsCorrect`. Så kan man læse testsuiten som en specifikation.',
        'Jeg holder én scenarie pr. test og ingen logik i testkoden. Hvor det kun er input, der varierer, bruger jeg `[TestCase]` i stedet for at kopiere testen.',
        'Unit testene ligger i deres eget projekt, adskilt fra integrationstests. Det er den grønne zone: hurtige tests, der altid skal være grønne, så en rød test betyder en rigtig fejl.',
      ],
      sources: [
        { path: md('01.1-introduktion-unit-test/02-Introduction-to-Unit-Tests.pdf.md'), original: 'Introduction to Unit Tests.pdf', pages: 's. 3–20' },
        { path: md('01.1-introduktion-unit-test/50-Unit-testing-Calculator.md'), original: 'Unit-testing Calculator.pdf', pages: 's. 1–2' },
        { path: md('01.1-introduktion-unit-test/code/calculatortestsolution-1.0.10.md'), note: 'Løsning til Calculator med [TestCase]' },
      ],
      gaps: [
        'Slidene nævner `[SetUp]`, men ikke `[TearDown]`, `[OneTimeSetUp]` eller `[TestCaseSource]`.',
        'Ét-assert-reglen modificeres i samme slide (“eller asserts om samme scenarie”); materialet siger ikke præcis, hvornår flere asserts er i orden.',
        'Casestudiet `Register` (kasseapparat, s. 20) er kun en diskussionsopgave; materialet har ingen løsning til det.',
      ],
      keywords: ['unit test', 'NUnit', 'AAA', 'Arrange Act Assert', 'TestFixture', 'SetUp', 'Test', 'TestCase', 'test runner', 'dotnet test', 'NUnit3TestAdapter', 'green zone', 'grøn zone', 'UUT', 'unit under test', 'navngivning', 'Calculator'],
    },

    {
      slug: 'assertions',
      title: 'NUnit-assertions: klassisk og constraint-model',
      short: 'Assertions',
      week: 'Uge 1 · 01.1',
      definition:
        'NUnit har to assertion-modeller. Den **klassiske** skriver forventet værdi først: `Assert.AreEqual(10, x)`. **Constraint-modellen** skriver den faktiske værdi først og en constraint med den forventede bagefter: `Assert.That(x, Is.EqualTo(10))`. Kurset bruger constraint-modellen.',
      concepts: [
        {
          term: 'Argumentrækkefølgen byttes om',
          body: [
            'Klassisk: `Assert.AreEqual(expected, actual)`. Constraint: `Assert.That(actual, constraint)`. Det er let at bytte om i den klassiske model, og så bliver fejlbeskeden misvisende. Constraint-formen læses næsten som en sætning: `Assert.That(myString, Is.EqualTo("Hello"))`.',
          ],
        },
        {
          term: 'Mønsteret Assert.That(item, verb.constraint)',
          body: [
            '**Item** er en værdi (returværdi eller property), en objektreference eller en metode/lambda uden parametre. **Verbet** er `Is.`, `Has.`, `Contains.` (item skal være string eller collection), `Does.` eller `Throws.` (item skal være en metode eller lambda). De fleste constraints følger mønsteret, men ikke alle.',
          ],
        },
        {
          term: 'Constraints og modifiers',
          body: [
            'Værdier: `.EqualTo()`, `.GreaterThan()`, `.LessThan()`, `.InRange(a, b)`, `.Zero`, `.True`/`.False`, `.Null`, `.Empty`. Strenge: `.StartWith()`, `.EndWith()`, `.Contain()`. Collections: `.Exactly(n).`, `.None.`, `.Some.`, `.All.`, `.Unique`. Typer: `.TypeOf<>`, `.InstanceOf<>` (også til exceptions). Filer: `.Exist`.',
            'Modifiers: `.Not.` (præfiks), `.And.`/`.Or.` (infiks), `.Within(præcision)` til `double`/`float`/tider og `.After.` til tidsmæssig opfyldelse.',
          ],
        },
      ],
      viz: 'nunit-constraint',
      keyPoints: [
        'Klassisk: forventet først. Constraint: faktisk først.',
        '`Assert.That(item, Verb.Constraint)` med `Is`, `Has`, `Contains`, `Does`, `Throws`.',
        '`Within()` til kommatal — sammenlign aldrig `double` helt eksakt uden grund.',
        '`Not`, `And`, `Or` kombinerer constraints.',
        'Kurset bruger constraint-modellen “med enkelte undtagelser”.',
        '**Eksamen:** læsbare asserts gør delopgave 3 lettere at forklare under spørgsmålene til testkoden.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Samme assert i de to modeller',
          source: 'Introduction to Unit Tests.pdf s. 11',
          code: `// Klassisk: expected, actual
Assert.AreEqual(10, x);

// Constraint: actual, constraint med expected
Assert.That(x, Is.EqualTo(10));`,
        },
      ],
      exam: [
        'Jeg bruger constraint-modellen, `Assert.That(actual, Is.EqualTo(expected))`. Den faktiske værdi står først, og constraint’en beskriver forventningen, så assert’en kan læses som en sætning.',
        'Constraints kan kombineres med modifiers som `Not`, `And` og `Within`, fx når jeg sammenligner kommatal med en tolerance.',
      ],
      sources: [
        { path: md('01.1-introduktion-unit-test/02-Introduction-to-Unit-Tests.pdf.md'), original: 'Introduction to Unit Tests.pdf', pages: 's. 11–15' },
        { path: md('01.1-introduktion-unit-test/03-NUnit-Assertions.md'), note: 'Læsevejledning til NUnit-dokumentationen' },
      ],
      gaps: [
        'Slidene er ikke konsekvente: slide 11 viser den klassiske `Assert.AreEqual`, og NSubstitute-slidene bruger `Assert.IsFalse` (Isolation frameworks.pdf s. 5). Uden for materialet: i NUnit 4 er de klassiske asserts flyttet til `ClassicAssert` og kompilerer ikke som `Assert.IsFalse`; kurset bruger NUnit 3.13 (Continuous-Integration.pdf s. 11).',
        'Materialet siger ikke, hvilke “enkelte undtagelser” fra constraint-modellen der er tilladt.',
      ],
      keywords: ['assert', 'assertion', 'Assert.That', 'Assert.AreEqual', 'constraint', 'Is.EqualTo', 'Has', 'Does', 'Contains', 'Throws', 'Within', 'classic model', 'constraint model', 'ClassicAssert'],
    },

    {
      slug: 'exceptions',
      title: 'Exceptions og exception-test',
      short: 'Exceptions',
      week: 'Uge 1 · 01.2',
      definition:
        'En exception adskiller fejlopdagelse fra fejlhåndtering: koden **kaster** et typet objekt, normal kontrolflow stopper straks, og runtime leder op gennem kaldstakken efter en `catch`, der vil håndtere typen (**stack unwinding**). Exceptions er en del af klassens kontrakt og testes med `Assert.That(() => …, Throws.TypeOf<T>())`.',
      concepts: [
        {
          term: 'Hvorfor exceptions',
          body: [
            'Produktionskode har “happy paths” og “error paths”. Fejlkode midt i det normale flow gør det rodet, og ofte kan fejlen ikke håndteres, hvor den opdages: `Ship`’s konstruktør kan opdage en kurs over 360, men har ingen returværdi at melde fejlen med. Ønsket er at adskille normalt flow fra fejlhåndtering og opdage ét sted, håndtere længere oppe.',
          ],
        },
        {
          term: 'Throw, catch og stack unwinding',
          body: [
            'Kaldes `throw`, stopper kontrolflowet øjeblikkeligt. Runtime søger lokalt og op gennem stakken efter en handler; når den findes, poppes stakken til dens niveau, og flowet fortsætter i handleren. Runtime har en implicit `try`/`catch` om `Main()`, der afslutter programmet: en ufanget exception lukker det med tvang.',
            'I C# arver alle exceptions fra `System.Exception` og kan bære data (fx `ShipException.Course`). Handlere prøves oppefra og ned, så de specifikke skal stå før de generelle; `throw;` genkaster; `finally` kører oprydning, uanset om der blev kastet.',
          ],
        },
        {
          term: 'Brug dem rigtigt',
          body: [
            'Stack unwinding er dyrt. Gør `try`-scopet så specifikt som muligt, fang så tæt på kilden som muligt, og brug kun exceptions til fejl — ikke som en “quick and dirty” måde at returnere på. (“Quick? Not really. Dirty? Absolutely!”)',
          ],
        },
        {
          term: 'Test af exceptions',
          body: [
            'Exceptions er en del af kontrakten: *gør du sådan, kastes denne exception*. Testen giver `Assert.That` en lambda uden parametre, der udfører kaldet, og constraint’en angiver typen: `Throws.TypeOf<MyException>()`. Med `.With.Property("Value").EqualTo(42)` kan data i exception-objektet også tjekkes.',
            'En fake fra et isolation framework kan også selv kaste, så UUT’s håndtering af en fejlende afhængighed kan testes, se [[nsubstitute|NSubstitute]] (`When(…).Do(…)`).',
          ],
        },
      ],
      viz: 'exception-unwind',
      keyPoints: [
        '`throw` stopper flowet; runtime leder op gennem stakken efter en `catch`.',
        'Specifikke `catch` først, generelle sidst; `finally` rydder op.',
        'Ufanget exception → runtime’s default-handler lukker programmet.',
        'Exceptions er dyre — kun til fejl, aldrig som returmekanisme.',
        'Test: `Assert.That(() => kald, Throws.TypeOf<T>())` — første argument skal være en lambda.',
        '**Eksamen:** “E” i [[zombie|ZOMBIE]] og delopgave 3 (“hvilke slags test har du lavet?”).',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Klassen kaster forskellige exceptions',
          source: 'Exeption-Management-CSharp.pdf s. 10',
          code: `public class CourseException : Exception
{
    public uint Course { get; private set; }
    public CourseException(uint course) { Course = course; }
}

class Ship
{
    public Ship(uint course, uint speed)
    {
        if (speed < 100) Speed = speed;
        else throw new SpeedException(speed);

        if (course < 360) Course = course;
        else throw new CourseException(course);
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Test af type og data i exception’en',
          source: 'Exception-Testing.pdf s. 3–4',
          code: `[Test]
public void TestThatThrowsException3()
{
    uut = new UUT();
    uut.SetUpScenario();
    Assert.That(() => uut.StuffThatThrowsException(),
        Throws.TypeOf<MyException>().With.Property("Value").EqualTo(42));
}`,
        },
      ],
      exam: [
        'En exception adskiller det sted, hvor fejlen opdages, fra det sted, hvor den kan håndteres. Når der kastes, stopper flowet, og runtime leder op gennem kaldstakken efter en passende catch.',
        'Exceptions er en del af klassens kontrakt, så de skal testes. Jeg giver `Assert.That` en lambda med kaldet og tjekker typen med `Throws.TypeOf`, og hvis exception’en bærer data, tjekker jeg dem med `With.Property`.',
        'Exceptions er dyre, fordi stakken skal rulles op. De bruges til fejl, ikke til at styre normalt flow.',
      ],
      sources: [
        { path: md('01.2-exceptions-git-workflow/02-Exeption-Management-CSharp.md'), original: 'Exeption-Management-CSharp.pdf', pages: 's. 2–15' },
        { path: md('01.2-exceptions-git-workflow/03-Exception-Testing.md'), original: 'Exception-Testing.pdf', pages: 's. 2–6' },
      ],
      gaps: [
        'Exception-Testing.pdf s. 6 kalder `new Ship(789)` med ét argument, men konstruktøren tager `(uint course, uint speed)` — koden kompilerer ikke som vist.',
        'Samme slide bruger en `Ship`, der tjekker `speed` før `course`. En `Ship` med ugyldig fart *og* ugyldig kurs kaster derfor `SpeedException`; slidene nævner det ikke.',
        'Slidene viser ikke forskellen på `Throws.TypeOf<T>()` og `Throws.InstanceOf<T>()` i en test, kun at begge constraints findes (Introduction to Unit Tests.pdf s. 14). Uden for materialet: `TypeOf` kræver præcis typen, `InstanceOf` accepterer også afledte typer.',
      ],
      keywords: ['exception', 'throw', 'try', 'catch', 'finally', 'stack unwinding', 'System.Exception', 'Throws.TypeOf', 'Throws.InstanceOf', 'With.Property', 'exception test', 'ShipException', 'CourseException', 'SpeedException', 'kontrakt'],
    },
  ],
}
