import type { Part } from '../types'
import { md } from './paths'

export const testbartDesign: Part = {
  id: 'testbart-design',
  title: 'Testbart design og fakes',
  topics: [
    {
      slug: 'black-white-box',
      title: 'Black box- og white box-test',
      short: 'Black og white box',
      week: 'Uge 3 · 03.1',
      definition:
        '**Black box**-test behandler enheden som en sort kasse: giv input, observér output, og sammenlign med forventede værdier fra specifikationen — uden viden om koden indeni. **White box**-test ser ind i kassen og designer testene ud fra kodestrukturen, fx så alle grene gennemløbes. Kurset siger: sigt efter black box.',
      concepts: [
        {
          term: 'Komplette tests mod robuste tests',
          body: [
            'Kender vi indmaden, kan vi teste bedre og mere komplet. Men baserer vi testene på indmaden, knækker de, når koden ændres og vedligeholdes. Det er dilemmaet: fuldstændighed mod robusthed.',
          ],
        },
        {
          term: 'White box-eksemplet: branch testing',
          body: [
            'Koden læser `a` og `b`, printer “Large”, hvis `a+b > 50`, og “small”, hvis `a+b < 50`. Flowchartet har otte kanter, og branch testing kræver testtilfælde, så alle kanter gennemløbes. Flere beslutninger giver flere nødvendige testtilfælde.',
            'Slidene siger, at white box-teknikker “ikke er rigtig gode unit tests”, men kan bruges til andre testtyper. [[coverage|Coverage]] er et white box-værktøj, der måler, hvor meget af koden testene rammer.',
          ],
        },
        {
          term: 'Test kontrakten, ikke koden',
          body: [
            'Grænsefladen og den eksterne adfærd er defineret af kontrakten (kravene). Testen skal sikre overensstemmelse med kontrakten, ikke med koden. Tegneserien på slide 6 viser det forkerte: skriv kode, kør den, skriv tests ud fra det, du så — “Voila!” — og alle tests består.',
          ],
        },
        {
          term: 'Black box unit test',
          body: [
            'Testen virker på UUT udefra: den **act**’er (kalder en metode), **interact**’er og **observerer** returværdi eller ekstern tilstand — det er state/value-baserede tests. Nedenunder observerer testen, hvordan UUT reagerer mod sine afhængigheder via en mock (og stubs) — det er interaktionsbaserede tests, se [[stub-mock|testtyper og fake-typer]].',
            'Så længe UUT’s interface og de interfaces, UUT bruger, er uændrede, er testene sikre.',
          ],
        },
        {
          term: 'Design mod test',
          body: [
            'God unit test er så black box som muligt, så uafhængig som muligt af andre programmører og enheder, uafhængig af andre tests og kan køre i vilkårlig rækkefølge. Tænk på testen, når du designer koden — det forbedrer indkapslingen, se [[design-for-testability|design for testability]].',
          ],
        },
      ],
      viz: 'box-testing',
      keyPoints: [
        'Black box: input → output mod specifikationen.',
        'White box: testene designes ud fra kodestrukturen (grene, stier).',
        'Viden om indmaden giver mere komplette, men mindre robuste tests.',
        'Test kontrakten, ikke koden.',
        'Tests må ikke afhænge af hinanden eller af rækkefølge.',
        'BVA og EP er black box; coverage og cyklomatisk kompleksitet er white box.',
        '**Eksamen:** “Hvilke elementer af black box og white box er der i dine tests?” (S22, S22re, V22-23).',
      ],
      exam: [
        'Mine tests er black box, fordi de er skrevet ud fra specifikationen: jeg kalder de offentlige metoder og tjekker returværdi, ekstern tilstand eller kald til afhængighederne via mocks.',
        'White box-elementet er coverage: jeg bruger den til at se, hvilke grene testene ikke rammer, og tilføjer tests for dem. Testene selv hviler stadig på kontrakten, så de ikke knækker, når implementeringen ændres.',
        'Grænseværdianalyse og ækvivalensklasser er black box-teknikker, men de bruger generel viden om, hvor programmører typisk laver fejl.',
      ],
      sources: [
        { path: md('03.1-2-design-for-testability/01-Black-And-White-Box.md'), original: 'Black And White Box.pdf', pages: 's. 3–8' },
        { path: md('05.1-2-test-quality-1-og-2/50-Code-Coverage-Analysis.md'), original: 'Code Coverage Analysis.pdf', pages: 's. 2', note: 'Structural (white box) vs. functional (black box) testing' },
      ],
      gaps: [
        'Slidet om branch testing (s. 5) har otte kanter i flowchartet, men viser ikke, hvilke testtilfælde der dækker dem. Bemærk: koden printer intet, når `a+b == 50`.',
        'Noten *Code Coverage Analysis* bruger “structural testing” og “functional testing” som synonymer for white og black box (s. 2); slidene bruger kun de sidste.',
      ],
      keywords: ['black box', 'white box', 'glass box', 'structural testing', 'functional testing', 'branch testing', 'kontrakt', 'robust test', 'complete test', 'state-based', 'interaction-based'],
    },

    {
      slug: 'design-for-testability',
      title: 'Design for testability: identify, interface, inject',
      short: 'Design for testability',
      week: 'Uge 3 · 03.1–03.2',
      definition:
        'Et testbart design lader en enkelt klasse (UUT) løsrive sig fra resten af systemet, så testen kan styre, hvilke afhængigheder den bruger — typisk fakes. Kurset kalder vejen dertil **III**: 1) **identificér** den eksterne afhængighed, 2) indfør et **interface** (en *seam*) ved afhængigheden, 3) **injicér** afhængigheden, fx gennem konstruktøren.',
      concepts: [
        {
          term: 'Problemet',
          body: [
            'Al test er interaktion: direkte via returværdier og tilstand, eller indirekte via, hvordan UUT taler med sine afhængigheder. Tester `TestA` metoden `A::methodA`, der kalder `objB.methodB`, og testen fejler — hvor er fejlen så? Afhængigheder betyder tab af kontrol i testen, og fejl kan ikke lokaliseres præcist.',
          ],
        },
        {
          term: '1: Identify',
          body: [
            'I `House` opretter konstruktøren selv `new Bedroom()`, `new Kitchen()` og `new FrontDoor()`, og `Leave()` kalder dem. House er hårdt koblet til tre konkrete klasser og kan ikke testes uden dem.',
            'Man finder afhængighederne i felter, konstruktører og metodekald — og i de **usynlige**: tid, filsystem, konsol, tilfældighed, ekstern hardware og dens drivere. `if (System.DateTime.Now.Hour > 22)` og `Console.WriteLine(…)` kan ikke styres fra en test (“Wait until after 22:00?”).',
          ],
        },
        {
          term: '2: Interface',
          body: [
            'Spørg hvad House egentlig vil med soveværelset: “kalde `TurnLightOff()` på et `Bedroom`-objekt” eller “slukke lyset i soveværelset”? Det sidste er et interface: `IBedroom`, `IKitchen`, `IFrontDoor`. Så kan både de rigtige klasser og `FakeBedroom` osv. implementere dem.',
            'Men så længe House selv skriver `new`, skal produktionskoden ændres for at indsætte fakes — “not an optimal way to do it”.',
          ],
        },
        {
          term: '3: Inject',
          body: [
            '**Constructor injection**: House får afhængighederne som interface-parametre. `Main` giver de rigtige, testen giver fakes, og House forbliver uændret.',
            '**Property injection**: afhængighederne er properties med standardværdier fra konstruktøren, som testen overskriver. To problemer: konstruktørens rigtige afhængigheder kan nå at gøre irreversible ting, og der skal findes en implementering af dem, for at koden kan kompilere.',
            'Materialet har også **factory injection** (DoorControl får en factory, der laver afhængighederne); det bliver tungt, når fakes og rigtige klasser skal blandes, fx i integrationstest.',
            'De ukontrollerbare afhængigheder indkapsles på samme måde: `ITimeProvider.GetHour()` og `ILogger.WriteLogLine()` med fakes til test og `TimeProvider`/`Logger` (der bruger `System.DateTime`/`System.Console`) i produktion. Man udelader ikke afhængigheden, man **udskyder** den til integrationen.',
          ],
        },
        {
          term: 'Principper og symptomer',
          body: [
            'Lav kobling: III, Observer-pattern (i C# med events og delegates, se [[events|C# events]]) og exceptions (ikke til normal returnering). Single responsibility: færre interne tilstande, enklere kode og test. Refactor, og brug testene til at sikre, at det gik godt.',
            'Clean Architecture: med interfaces og dependency injection vender afhængighederne indad — interfaces og dataklasser i centrum, uden egne afhængigheder.',
            '**Symptom**: er testene svære at skrive, er designet måske forkert — og så er enheden sandsynligvis også svær at bruge i koden.',
          ],
        },
        {
          term: 'I afleveringerne',
          body: [
            'ECS (drivhuset) er kursets gennemgående eksempel: før redesign laver `ECS(int thr)` selv `TempSensor` og `Heater`; efter tager `ECS(ITempSensor, IHeater, int)` interfaces. I Ladeskabet (aflevering 2) findes der ingen hardware, så dør, USB-lader og RFID-læser simuleres — men internt skal interfaces være, “som om hardwaren fandtes”, og simulatorerne skal også testes (undtagen `UsbChargerSimulator`).',
          ],
        },
      ],
      viz: 'dft-inject',
      keyPoints: [
        'III: Identify → Interface → Inject.',
        'Constructor injection er kursets standard; UUT forbliver uændret.',
        'Property injection: kan lade rigtige afhængigheder gøre skade først.',
        'Tid, konsol, filer, tilfældighed og hardware er afhængigheder — pak dem ind bag interfaces.',
        'Svære tests = sandsynligvis forkert design.',
        '**Eksamen:** delopgave 1 (“redegør for, hvad der gør dit design testbart”) og delopgave 4 (“hvor har du draget nytte af det testbare design?”) — begge i alle sæt.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Constructor injection: fakes i testen, rigtige i Main',
          source: 'Design for Testability.pdf s. 13',
          code: `class House
{
    private readonly IBedroom _bedroom;
    private readonly IKitchen _kitchen;
    private readonly IFrontDoor _door;

    // Constructor injection
    public House(IBedroom bedroom, IKitchen kitchen, IFrontDoor door)
    {
        _bedroom = bedroom;
        _kitchen = kitchen;
        _door = door;
    }
}

// Production
var house = new House(new Bedroom(), new Kitchen(), new FrontDoor());

// Test
var uut = new House(new FakeBedroom(), new FakeKitchen(), new FakeFrontDoor());`,
        },
        {
          lang: 'csharp',
          title: 'De usynlige afhængigheder bag interfaces',
          source: 'Design for Testability.pdf s. 19',
          code: `public void Leavehouse()
{
    // If after bedtime – close down house
    if (_timeProvider.getHour() > 22)
    {
        Kitchen.ShutDownAllAppliances();
        Bedroom.TurnLightOff();
        Door.Lock();
        // Log the event
        _logger.WriteLogLine("House closed down");
    }
}`,
        },
      ],
      exam: [
        'Mit design er testbart, fordi hver klasse kun kender sine afhængigheder gennem interfaces, og de injiceres gennem konstruktøren. I testen kan jeg derfor sætte fakes ind og styre UUT fuldstændigt.',
        'Jeg har fundet afhængighederne efter III: identificér, indfør et interface, injicér. Det gælder også de usynlige, som tid og logfil — dem har jeg pakket ind bag fx et `ITimeProvider` og et `ILogger`.',
        'Jeg har draget nytte af det i testene ved at lade en stub levere værdier, som ellers kom fra hardware eller en server, og ved at bruge mocks til at tjekke, at UUT kalder sine afhængigheder rigtigt.',
        'Er en test svær at skrive, er det et tegn på, at designet er forkert.',
      ],
      sources: [
        { path: md('03.1-2-design-for-testability/02-Design-for-Testability.md'), original: 'Design for Testability.pdf', pages: 's. 2–22' },
        { path: md('shared/ECSBeforeAndAfter.md'), original: 'ECSBeforeAndAfter.pdf', pages: 's. 1–2' },
        { path: md('04.2-fakes-og-isolation-frameworks/08-Loesningforslag-til-DoorControl-med-factory-injection.md'), note: 'Factory injection' },
        { path: md('06.1-07.2-obligatorisk-handin-2/01-IntroductionHandinTwo.md'), original: 'IntroductionHandinTwo.pdf', pages: 's. 4–6, 11' },
      ],
      gaps: [
        'Slide 5 kalder interfacet en “seam” med henvisningen “TAOUT” — Osherove, *The Art of Unit Testing* (2. udg.), som ikke er i materialet. Litteraturlisten foreslår den som supplerende læsning.',
        'Koden på s. 19 har `getHour()` med lille g, mens klassediagrammet på s. 18 har `GetHour()`, og `Ilogger` er stavet med lille l. Metoden hedder `Leavehouse()` i koden, men `Leave()` i diagrammet.',
        'Slide 21 henviser til “section 11.2 of SWD” for C#-anbefalinger; det afsnit er ikke en del af SWT-materialet.',
      ],
      keywords: ['design for testability', 'testbart design', 'III', 'identify interface inject', 'dependency injection', 'constructor injection', 'property injection', 'factory injection', 'seam', 'afhængighed', 'dependency', 'loose coupling', 'løs kobling', 'ITimeProvider', 'ILogger', 'House', 'ECS', 'Clean Architecture', 'Ladeskab', 'aflevering 2'],
    },

    {
      slug: 'stub-mock',
      title: 'Testtyper og fake-typer: stub og mock',
      short: 'Stub og mock',
      week: 'Uge 4 · 04.1',
      definition:
        'En **fake** kan tage en afhængigheds plads. En **stub** er en fake, der giver UUT de værdier, den har brug for. En **mock** er en fake, der registrerer, om og hvordan UUT brugte den. En **state/value-baseret** test asserter altid på UUT og klarer sig med stubs. En **interaktionsbaseret** test asserter på mock’en.',
      concepts: [
        {
          term: 'To grupper af unit tests',
          body: [
            '**Value- og state-baserede tests** tester, om UUT returnerer den rigtige værdi eller er i den forventede (eksterne) tilstand, efter at testen har handlet på den. **Interaktionsbaserede tests** tester, om UUT har den forventede adfærd over for sine afhængigheder.',
            'Den store forskel er, **hvor assert’en står**.',
          ],
        },
        {
          term: 'State-baseret: stubs er nok',
          body: [
            'Arrange: sæt UUT og dens fake-afhængigheder op. Act: stimulér UUT. Assert: at UUT er i den forventede tilstand eller returnerede den forventede værdi. En korrekt stub kan aldrig få en test til at fejle, fordi der aldrig asserter på den.',
            'ECS-eksemplet: `RunSelfTest()` på `Control` testes med en `StubHeater`, der returnerer den konfigurerede værdi. Testen asserter på `Control.RunSelfTest()`’s returværdi.',
          ],
        },
        {
          term: 'Interaktionsbaseret: der skal en mock til',
          body: [
            'Mock’en eksisterer for at “optage”, at interaktionen fandt sted. Arrange og Act som før; Assert: at mock’en modtog de forventede kald med de forventede argumenter. Mock’en kan få testen til at fejle.',
            'ECS-eksemplet: `Regulate()` testes med en `StubTempSensor`, der leverer temperaturen, og en `MockHeater`, der tæller kald til `TurnOff()`. Testen asserter på mock’ens tæller.',
          ],
        },
        {
          term: 'Undgå komplekse mocks',
          body: [
            'En mock skal gemme, at en metode blev kaldt, hvor mange gange, med hvilke parametre, i hvilken rækkefølge — og måske samtidig være stub. Det gør dem sværere at skrive, genbruge og mere fejlbehæftede (“soon, you will have to test the mocks”). Hold dem simple — eller lad et [[nsubstitute|isolation framework]] lave dem.',
          ],
        },
        {
          term: 'To definitioner',
          body: [
            '**Den præcise**: fakes er overmængden; stubs og mocks er delmængder, der overlapper — nogle mocks er også stubs, fordi UUT har brug for en returværdi. **Den upræcise**: “stub” er bare et andet ord for fake, og alle mocks er stubs. Begge er i brug; testtyperne defineres ens i begge: en state-baseret test har aldrig brug for en mock og asserter på UUT; en interaktionsbaseret test har brug for en mock og asserter på den.',
          ],
        },
      ],
      viz: 'stub-mock',
      keyPoints: [
        'Fake: tager en afhængigheds plads. Stub: leverer værdier. Mock: registrerer brug.',
        'State/value-baseret: assert på UUT — stubs er nok.',
        'Interaktionsbaseret: assert på mock’en.',
        'En korrekt stub kan aldrig få en test til at fejle.',
        'En mock kan også være stub.',
        'Hold mocks simple.',
        '**Eksamen:** F19re delopgave 5 (“adfærdsbaseret og tilstandsbaseret test, og forskellen”) og delopgave 3 (“hvilke slags test har du lavet?”).',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Håndskrevne fakes til ECS',
          source: 'ECSManualFakes · Fakes.cs',
          code: `internal class FakeTempSensor : ITempSensor
{
    public int Temp { get; set; }
    public bool SelfTestResult { get; set; }
    public int GetTemp() { return Temp; }             // stub
    public bool RunSelfTest() { return SelfTestResult; }
}

internal class FakeHeater : IHeater
{
    public int TurnOnCalledTimes { get; set; }       // mock: optager kald
    public int TurnOffCalledTimes { get; set; }
    public bool SelfTestResult { get; set; }
    public void TurnOn() { ++TurnOnCalledTimes; }
    public void TurnOff() { ++TurnOffCalledTimes; }
    public bool RunSelfTest() { return SelfTestResult; }
}`,
        },
        {
          lang: 'csharp',
          title: 'Én interaktionsbaseret og én state-baseret test',
          source: 'ECSManualFakes · ECSManualFakeTest.cs',
          code: `[Test]
public void Regulate_TempIsLow_HeaterIsTurnedOn()
{
    _fakeTempSensor.Temp = 20;          // stub leverer
    _uut.Regulate();
    // Assert on the mock - was the heater called correctly
    Assert.That(_fakeHeater.TurnOnCalledTimes, Is.EqualTo(1));
}

[TestCase(true, true, true)]
[TestCase(true, false, false)]
[TestCase(false, true, false)]
[TestCase(false, false, false)]
public void RunSelfTest_CombinationOfInput_CorrectOutput(
    bool tempResult, bool heaterResult, bool expectedResult)
{
    _fakeTempSensor.SelfTestResult = tempResult;
    _fakeHeater.SelfTestResult = heaterResult;
    // Assert on the UUT
    Assert.That(_uut.RunSelfTest(), Is.EqualTo(expectedResult));
}`,
        },
      ],
      exam: [
        'Forskellen på en state-baseret og en interaktionsbaseret test er, hvor assert’en står. I den state-baserede asserter jeg på UUT’s returværdi eller tilstand; i den interaktionsbaserede asserter jeg på en mock, der har registreret, hvordan UUT kaldte den.',
        'En stub leverer bare de værdier, UUT skal bruge, fx en temperatur. En korrekt stub kan aldrig få en test til at fejle. En mock registrerer kald og kan få testen til at fejle.',
        'For en controlklasse som min, der mest styrer andre klasser, er de fleste tests interaktionsbaserede.',
      ],
      sources: [
        { path: md('04.1-test-types-and-fake-types/50-Test-Types-and-Fake-Types.md'), original: 'Test Types and Fake Types.pdf', pages: 's. 2–25' },
        { path: md('04.1-test-types-and-fake-types/code/ECSManualFakes.md'), note: 'ECS med håndskrevne fakes' },
      ],
      gaps: [
        'Slide 7 henviser til “section 1.1 – the grey box – and section 4.1 in the book” (Osherove, *The Art of Unit Testing*), som ikke er i materialet.',
        'Slide 13 kalder proceduren for interaktionsbaserede tests “the procedure for state based tests” — en kopi-fejl fra slide 9.',
        'Slidene giver bevidst to konkurrerende definitioner (s. 20–25) uden at vælge; kursets egen kode kalder alle håndskrevne klasser `Fake…`.',
        'Opgaveteksten til DoorControl (DoorControlExercise.pdf s. 1–2) bruger `NotifyEntryGranted(id)` og `RaiseAlarm()`; løsningskoden bruger `NotifyEntryGranted()` og `SoundAlarm()`.',
      ],
      keywords: ['fake', 'stub', 'mock', 'test double', 'state-based', 'value-based', 'interaction-based', 'behavior-based', 'adfærdsbaseret', 'tilstandsbaseret', 'ECS', 'FakeHeater', 'FakeTempSensor', 'StubHeater', 'MockHeater', 'DoorControl'],
    },

    {
      slug: 'nsubstitute',
      title: 'Isolation frameworks: NSubstitute',
      short: 'NSubstitute',
      week: 'Uge 4 · 04.2',
      definition:
        'Et isolation framework laver fakes — stubs og mocks — ud fra et interface, så man ikke skal håndkode dem. Kursets framework er **NSubstitute**: `Substitute.For<IHeater>()` laver en substitute, `.Returns(…)` gør den til stub, og `.Received()`/`.DidNotReceive()` bruger den som mock.',
      concepts: [
        {
          term: 'Opret en substitute',
          body: [
            'Installér pakken `NSubstitute` i testprojektet (`dotnet add package NSubstitute`). I `[SetUp]`: `_heater = Substitute.For<IHeater>();` og injicér den i UUT. **Meget vigtigt**: NSubstitute-fakes skal altid laves ud fra interfaces. Læsestoffet beder om at læse advarslerne om at bruge klasser omhyggeligt.',
          ],
        },
        {
          term: 'Stub: Returns og argument-matching',
          body: [
            '`_tempSensor.RunSelfTest().Returns(false);` — substituten er nu en stub i en state-baseret test. `sub.Add(1, 3).Returns(4)` returnerer kun 4 for præcis argumenterne 1 og 3; `sub.Add(Arg.Any<double>(), Arg.Any<double>()).Returns(4)` for alle argumenter.',
          ],
        },
        {
          term: 'Mock: Received og DidNotReceive',
          body: [
            '`_heater.Received(1).TurnOn();` er en “implicit assertion”: testen fejler, hvis kaldet ikke skete præcis én gang. `sub.Received().Add(1, 3)` består kun, hvis `Add` blev kaldt med præcis 1 og 3. `sub.DidNotReceive().Subtract(Arg.Any<double>(), Arg.Any<double>())` består kun, hvis `Subtract` slet ikke blev kaldt.',
            '**Faren ved argument-matching**: `sub.DidNotReceive().Subtract(3, 1)` består, selvom `Subtract` blev kaldt — bare med andre argumenter. Brug `Arg.Any` i negative assertions.',
            'DoorControl-løsningen bruger `Received(0)` som alternativ til `DidNotReceive()`, og `ClearReceivedCalls()` til at nulstille optagelsen midt i en test.',
          ],
        },
        {
          term: 'Exceptions og events',
          body: [
            'En substitute kan kaste: `sub.When(x => x.Divide(6, 0)).Do(x => { throw new ArgumentException(); });` — så testes UUT’s reaktion på en fejlende afhængighed.',
            'En substitute kan rejse et event, som UUT abonnerer på: `_tempSource.TempChangedEvent += Raise.EventWith(new TempChangedEventArgs { Temp = newTemp });`. Eventet skal være en del af interfacet, se [[events|C# events]].',
            'NSubstitutes *recursive mocks*: en substitute, hvis metoder returnerer et andet interface, laver selv en substitute til det — og altid den samme. Det bruges i DoorControl-løsningen med factory injection.',
          ],
        },
        {
          term: 'Fordele og ulemper',
          body: [
            'Fordelene i materialet: ingen håndkodede fake-klasser, “whatever you want a fake to do, NSubstitute will do it – and easy!”, og top-down-integration med mange stubs bliver “OK with isolation framework”. Ulempen: det er kun nyttigt med rutine (“Learn your knife skills!”), og argument-matching kan give falsk grønne tests.',
          ],
        },
      ],
      viz: 'nsub-doorcontrol',
      keyPoints: [
        '`Substitute.For<IInterface>()` — altid fra et interface.',
        '`.Returns(x)` = stub. `.Received(n)` / `.DidNotReceive()` = mock (implicit assert).',
        '`Arg.Any<T>()` matcher alle argumenter.',
        '`DidNotReceive()` med konkrete argumenter kan give falsk grøn.',
        '`When(…).Do(…)` kaster; `Raise.EventWith(…)` rejser events.',
        '`ClearReceivedCalls()` nulstiller optagelsen.',
        '**Eksamen:** delopgave 6 (“eksempler hvor du bruger et isolation framework; fordele og ulemper”) i F19re, E19, S22 og S22re.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'DoorControl: stub i SetUp, mock i testene',
          source: 'DoorControlConstructorInjection · DoorControlEntryGrantedTests.cs',
          code: `[SetUp]
public void Setup()
{
    _userValidation = Substitute.For<IUserValidation>();
    _door = Substitute.For<IDoor>();
    _entryNotification = Substitute.For<IEntryNotification>();
    _alarm = Substitute.For<IAlarm>();
    _uut = new DoorControl(_userValidation, _door, _entryNotification, _alarm);
    // Setup for user TFJ to be allowed
    _userValidation.ValidateEntryRequest("TFJ").Returns(true);
}

[Test]
public void RequestEntry_CardDbApprovesEntryRequest_DoorOpenCalled()
{
    _uut.RequestEntry("TFJ");
    _door.Received(1).Open();
}

[Test]
public void RequestEntry_CardDbApprovesEntryRequest_BeeperMakeUnhappyNoiseNotCalled()
{
    _uut.RequestEntry("TFJ");
    _entryNotification.Received(0).NotifyEntryDenied();
}`,
        },
        {
          lang: 'csharp',
          title: 'Faldgruben ved argument-matching',
          source: 'Isolation frameworks.pdf s. 7–8',
          code: `// Består kun, hvis Subtract slet ikke blev kaldt
sub.DidNotReceive().Subtract(Arg.Any<double>(), Arg.Any<double>());

// Består, selvom Subtract faktisk blev kaldt (med andre argumenter)!
sub.DidNotReceive().Subtract(3, 1);`,
        },
      ],
      exam: [
        'Jeg bruger NSubstitute til at lave fakes ud fra mine interfaces. I `SetUp` laver jeg en substitute for hver afhængighed og injicerer dem i UUT gennem konstruktøren.',
        'Den samme substitute kan være stub og mock: med `Returns` leverer den en værdi, fx at brugeren er godkendt, og med `Received` tjekker jeg, at UUT kaldte den rigtigt, fx at døren blev åbnet præcis én gang.',
        'Fordelen er, at jeg ikke skal skrive og vedligeholde fake-klasser, og at testene bliver korte. Ulempen er, at man skal kende syntaksen, og at argument-matching kan snyde: `DidNotReceive` med konkrete argumenter består, selvom metoden blev kaldt med andre.',
      ],
      sources: [
        { path: md('04.2-fakes-og-isolation-frameworks/50-Isolation-frameworks.md'), original: 'Isolation frameworks.pdf', pages: 's. 3–10' },
        { path: md('04.2-fakes-og-isolation-frameworks/code/DoorControlConstructorInjection.md'), note: 'DoorControl med NSubstitute' },
        { path: md('04.2-fakes-og-isolation-frameworks/01-Laesestof.md') },
        { path: md('04.2-fakes-og-isolation-frameworks/08-Loesningforslag-til-DoorControl-med-factory-injection.md'), note: 'Recursive mocks' },
        { path: md('09.1-2-integrationstest/02-Integrationtest-introduction.pdf-9.1.md'), original: 'Integrationtest introduction.pdf', pages: 's. 28', note: '“OK with isolation framework”' },
      ],
      gaps: [
        'Slide 6 skriver `Arg.Any<double>` uden parenteser; det kompilerer ikke. Korrekt er `Arg.Any<double>()`.',
        'Slide 5 bruger den klassiske `Assert.IsFalse(…)` i stedet for constraint-modellen, som kurset ellers bruger.',
        'Materialet forklarer ikke, *hvorfor* substitutes for klasser er farlige — det henviser til NSubstitutes egen dokumentation.',
        'Materialet har ingen samlet liste over fordele og ulemper ved isolation frameworks, selvom eksamenssættene spørger om dem. Punkterne ovenfor er samlet fra slides og integrationstest-slides.',
      ],
      keywords: ['NSubstitute', 'isolation framework', 'Substitute.For', 'Returns', 'Received', 'DidNotReceive', 'Arg.Any', 'Arg.Is', 'ClearReceivedCalls', 'When Do', 'Raise.EventWith', 'recursive mock', 'substitute', 'stub', 'mock', 'DoorControl'],
    },

    {
      slug: 'events',
      title: 'C# events og test af events',
      short: 'Events',
      week: 'Uge 6 · 06.1',
      definition:
        'Et C# **event** er Observer-mønsteret bygget ind i sproget: kilden erklærer `event EventHandler<TArgs>? XxxEvent` og kalder `XxxEvent?.Invoke(this, args)`; modtageren abonnerer med `+=`. Når to klasser er forbundet af et event, testes begge: **kilden** ved at testen selv abonnerer med en lambda, **modtageren** ved at en fake rejser eventet.',
      concepts: [
        {
          term: 'Fra GoF Observer til C# events',
          body: [
            'GoF Observer: et `Subject` med `Attach`, `Detach` og `Notify`, og et `Observer`-interface med `Update()`. I **pull**-varianten henter observeren selv tilstanden; i **push**-varianten sender subject den med — det gør klasserne afhængige af den udvekslede datatype.',
            'C# events løser det: typen af data flyttes ud i en `EventArgs`-klasse, en provider kan have mange events (mange subjects), og en consumer kan kalde sin handler hvad den vil og abonnere på mange. Kilden kender hverken modtagerne eller deres metodenavne. Et C# event er ikke det samme som synkroniseringsobjektet `AutoResetEvent`.',
          ],
        },
        {
          term: 'Kilden og modtageren',
          body: [
            '`TempChangedEventArgs : EventArgs` bærer data. `ITempSensor` erklærer eventet — forbindelsespunktet for observere. `TempSensor.SetTemp` rejser eventet via `protected virtual OnTempChanged`, men kun når temperaturen ændrer sig.',
            '`Control` abonnerer i konstruktøren: `tempSensor.TempChangedEvent += HandleTempChangedEvent;`. Handleren skal have signaturen `(object? sender, TempChangedEventArgs e)` — et skjult interface — og bør aldrig være public.',
          ],
        },
        {
          term: 'Test af kilden',
          body: [
            'Sikr at UUT rejser eventet under de forventede omstændigheder, med de forventede data — **og** ikke rejser det, når den ikke skal. I `[SetUp]` abonnerer testen på UUT’s event med en lambda, der gemmer `args` (og evt. tæller kald). Act: stimulér UUT. Assert: på de gemte data.',
          ],
        },
        {
          term: 'Test af modtageren',
          body: [
            'Sikr at UUT abonnerer på eventet og håndterer det rigtigt. Arrange: lav en fake af interfacet med eventet og injicér den. Act: lad faken rejse eventet — med NSubstitute `+= Raise.EventWith(…)`. Assert: at UUT er i den forventede tilstand eller kaldte sine afhængigheder.',
            '**Det er ikke nok at kalde handleren direkte**: så testes det ikke, at UUT har abonneret, og det er en white box-test, der knækker, hvis handleren omdøbes. Brug altid en fake til at rejse eventet.',
          ],
        },
        {
          term: 'Ladeskabet',
          body: [
            'I aflevering 2 er forbindelserne fra `Door` (åben/luk), `RfidReader` (RFID detected) og `UsbCharger` (strømmåling, `CurrentValueEvent`) events. Tip fra slidene: “Events are your friends – loose coupling.”',
          ],
        },
      ],
      viz: 'event-test',
      keyPoints: [
        'Event = Observer i sproget: `event EventHandler<TArgs>?`, `?.Invoke(this, e)`, `+=`.',
        'Data i en `EventArgs`-klasse; handler-signaturen `(object? sender, TArgs e)`.',
        'Kilde-test: testen abonnerer med en lambda, der gemmer `args`.',
        'Modtager-test: en fake rejser eventet med `Raise.EventWith`.',
        'Kald aldrig handleren direkte fra testen.',
        'Test også at eventet *ikke* rejses, når det ikke skal.',
        '**Eksamen:** designudkastene i alle fem sæt har event-forbindelser (i S22, S22re og V22-23 tegnet som et lyn-symbol); de skal med i delopgave 1 og testes i delopgave 3.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Kilden: TempSensor',
          source: 'UsingAndTestingEvents.pdf s. 12',
          code: `public class TempChangedEventArgs : EventArgs
{
    public int Temp { get; set; }
}

public interface ITempSensor
{
    event EventHandler<TempChangedEventArgs>? TempChangedEvent;
}

public class TempSensor : ITempSensor
{
    private int _oldTemp;
    public event EventHandler<TempChangedEventArgs>? TempChangedEvent;

    public void SetTemp(int newTemp)
    {
        if (newTemp != _oldTemp)
        {
            OnTempChanged(new TempChangedEventArgs { Temp = newTemp });
            _oldTemp = newTemp;
        }
    }

    protected virtual void OnTempChanged(TempChangedEventArgs e)
    {
        TempChangedEvent?.Invoke(this, e);
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Test af kilden: abonnér med en lambda',
          source: 'UsingAndTestingEvents.pdf s. 16',
          code: `[SetUp]
public void Setup()
{
    _uut = new TempSensor();
    _uut.SetTemp(20);
    _uut.TempChangedEvent += (o, args) => { _receivedEventArgs = args; };
}

[Test]
public void SetTemp_TempSetToNewValue_CorrectNewTempReceived()
{
    _uut.SetTemp(25);
    Assert.That(_receivedEventArgs?.Temp, Is.EqualTo(25));
}`,
        },
        {
          lang: 'csharp',
          title: 'Test af modtageren: faken rejser eventet',
          source: 'UsingAndTestingEvents.pdf s. 18',
          code: `[SetUp]
public void Setup()
{
    _tempSource = Substitute.For<ITempSensor>();
    _uut = new Control(_tempSource);
}

[TestCase(25)]
[TestCase(20)]
[TestCase(30)]
public void TemperatureChanged_DifferentArguments_CurrentTemperatureIsCorrect(int newTemp)
{
    _tempSource.TempChangedEvent += Raise.EventWith(new TempChangedEventArgs { Temp = newTemp });
    Assert.That(_uut.CurrentTemperature, Is.EqualTo(newTemp));
}`,
        },
      ],
      exam: [
        'Forbindelsen mellem de to klasser er et C# event, altså Observer-mønsteret. Kilden kender ikke modtageren, så koblingen er løs, og begge kan testes hver for sig.',
        'Kilden tester jeg ved at lade testen abonnere på eventet med en lambda, der gemmer argumenterne. Så kan jeg asserte på, at eventet kom, med de rigtige data — og at det ikke kom, når det ikke skulle.',
        'Modtageren tester jeg ved at lade en NSubstitute-fake rejse eventet med `Raise.EventWith`. Jeg kalder aldrig handleren direkte, for så tester jeg ikke, at UUT faktisk har abonneret.',
      ],
      sources: [
        { path: md('shared/UsingAndTestingEvents.md'), original: 'UsingAndTestingEvents.pdf', pages: 's. 2–19' },
        { path: md('04.2-fakes-og-isolation-frameworks/06-Isolation-frameworks-i-en-event-drevet-applikation.md') },
        { path: md('06.1-07.2-obligatorisk-handin-2/01-IntroductionHandinTwo.md'), original: 'IntroductionHandinTwo.pdf', pages: 's. 4, 11, 13' },
      ],
      gaps: [
        'UsingAndTestingEvents.pdf s. 18 erklærer feltet som `private TestTemperatureSource _tempSource;`, men tildeler det `Substitute.For<ITempSensor>()`; typen skal være `ITempSensor`.',
        'Samme slide har et mellemrum i `_tempSource. TempChangedEvent`; det er et slide-artefakt.',
        'Slide 9 skriver `PulseValueEvent?.invoke(…)` med lille i og `private OnNewPulseData()` uden returtype — koden kompilerer ikke som vist.',
        'Der er ingen opgavetekst til Ladeskabet ud over introduktions-slides; kravspecifikationen ligger på GitLab og er ikke en del af materialet.',
      ],
      keywords: ['event', 'C# event', 'EventHandler', 'EventArgs', 'Observer', 'GoF', 'pull', 'push', 'Invoke', 'subscribe', 'abonnere', 'Raise.EventWith', 'lambda', 'event source', 'event receiver', 'TempSensor', 'Ladeskab', 'aflevering 2', 'handin 2', 'CurrentValueEvent'],
    },

    {
      slug: 'state-machines',
      title: 'Tilstandsmaskiner og test af overgange',
      short: 'Tilstandsmaskiner',
      week: 'Uge 4 · 04.1–04.2',
      definition:
        'En klasse, hvis adfærd er givet ved en tilstandsmaskine (STM), implementeres i kurset med en `enum` for tilstandene og en `switch` pr. event. Den interne tilstand må **ikke** eksponeres for testen: overgangene testes black box ved at sende events til UUT og asserte på, hvad UUT gør mod sine afhængigheder.',
      concepts: [
        {
          term: 'DoorControl som STM',
          body: [
            'DoorControl har tilstandene `DoorClosed`, `DoorOpening`, `DoorClosing` og `DoorBreached`. Hovedscenariet *Entry Granted*: `RequestEntry(id)` → validering OK → `Open()` og besked om adgang → `DoorOpened()` → `Close()` → `DoorClosed()` → tilbage i Door Closed. Undtagelserne er *Entry Denied* (validering fejler, besked om afvisning) og *Door Breached* (døren åbnes uden forudgående godkendelse: alarm og luk).',
            'Implementeringen er én metode pr. event (`RequestEntry`, `DoorOpened`, `DoorClosed`) med en `switch` på `_doorState`. Et event i en tilstand, der ikke har en `case`, ignoreres.',
          ],
        },
        {
          term: 'Eksponér ikke tilstanden',
          body: [
            'Opgaveteksten advarer: det er fristende, men forkert, at gøre `currentState` public for testens skyld. Så er det en white box-test, og en omdøbning af en tilstand bryder hele testsuiten.',
            'Eksemplet med FlashLight-STM’en siger det samme: state-baseret test handler ikke om klassens STM, men om direkte og indirekte **synlige** tilstande; er tilstanden kun synlig indirekte, må man bruge interaktionsbaseret test. Testen kan håndhæve black box ved at bruge UUT’s interface (`IFlashLightCtrl`) i stedet for den konkrete type.',
          ],
        },
        {
          term: 'Hvordan testen driver overgange',
          body: [
            'Fakes skal være så simple som muligt — det er ikke `Door`-fakens ansvar at kalde tilbage. Testen kalder selv `DoorOpened()` og `DoorClosed()` på UUT. Så kan testen køre UUT gennem en hel cyklus og asserte på mock’ene: `RequestEntry_DoorOpened_DoorIsClosed`, `RequestEntry_FullCycle_CanRestart`.',
            'At en tilstand *ignorerer* et event testes med en mock og `DidNotReceive()`: efter `RequestEntry` og `DoorOpened` må et nyt `RequestEntry` ikke validere igen. `ClearReceivedCalls()` nulstiller optagelsen mellem Arrange og Act.',
          ],
        },
        {
          term: 'Mikrobølgeovnen',
          body: [
            'Aflevering 3’s `UserInterface` har tilstandene *Ready*, *Set Power*, *Set Time*, *Cooking* og *Door is Open*. Hovedflowet er Ready → (power-knap) Set Power → (tid-knap) Set Time → (start/cancel) Cooking. *Door is Open* kan nås fra alle fire; døren lukkes tilbage til Ready. Hver overgang har aktioner, fx `Start-Cancel Button Pressed / Start Cooking, Turn On Light`.',
          ],
        },
        {
          term: 'Kompleksitet',
          body: [
            'En `switch`-baseret STM giver høj cyklomatisk kompleksitet. Øvelsen i lektion 08 refaktorerer DoorControl til GoF State-mønsteret og måler kompleksiteten før og efter, se [[statisk-analyse|statisk analyse]].',
          ],
        },
      ],
      viz: 'stm-doorcontrol',
      keyPoints: [
        'Tilstande som `enum`, én metode pr. event med `switch`.',
        'Gør aldrig tilstanden public for testens skyld — det er white box.',
        'Testen driver overgange ved at kalde UUT’s event-metoder; fakes kalder ikke tilbage.',
        'Assert på mocks: hvad gjorde UUT i overgangen?',
        '`DidNotReceive()` viser, at et event ignoreres i en tilstand.',
        '**Eksamen:** E19 og F19re gav tilstandsdiagrammer med i opgaven; overgangene er grundlaget for delopgave 3.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'DoorControl: én switch pr. event',
          source: 'DoorControlConstructorInjection · DoorControl.cs',
          code: `public void DoorOpened()
{
    switch (_doorState)
    {
        case State.DoorOpening:
            _doorState = State.DoorClosing;
            _door.Close();
            break;
        case State.DoorClosed:          // åbnet uden godkendelse
            _alarm.SoundAlarm();
            _door.Close();
            _doorState = State.DoorBreached;
            break;
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Overgangen testes udefra',
          source: 'DoorControlConstructorInjection · DoorControlEntryGrantedTests.cs',
          code: `[Test]
public void RequestEntry_DoorNotYetClosedAgain_NoAction()
{
    _uut.RequestEntry("TFJ");
    _uut.DoorOpened();

    _userValidation.ClearReceivedCalls();

    _uut.RequestEntry("TFJ");

    // We should not react on this, until we are closed again
    _userValidation.DidNotReceive().ValidateEntryRequest("TFJ");
}`,
        },
      ],
      exam: [
        'Klassen er en tilstandsmaskine, implementeret med en enum og en switch pr. event. Tilstanden er privat, så testene er black box.',
        'Testene driver UUT gennem overgangene ved at kalde dens event-metoder og asserter på mocks, hvad den gjorde i hver overgang — fx at døren blev lukket efter `DoorOpened`.',
        'At en tilstand ignorerer et event, tester jeg med `DidNotReceive`, efter at have nulstillet de optagede kald med `ClearReceivedCalls`.',
      ],
      sources: [
        { path: md('04.1-test-types-and-fake-types/50-DoorControlExercise.md'), original: 'DoorControlExercise.pdf', pages: 's. 1–3' },
        { path: md('04.2-fakes-og-isolation-frameworks/code/DoorControlConstructorInjection.md'), note: 'DoorControl.cs og tests' },
        { path: md('04.2-fakes-og-isolation-frameworks/09-Eksempel-paa-implementering-og-anvendelse-af-en-State-Machine.md') },
        { path: md('04.1-test-types-and-fake-types/04-Eksempel-Switchcase-implementering-af-meget-simpel-state-machine.md'), note: 'FlashLight' },
        { path: md('11.1-12.2-obligatorisk-opgave-iii/50-MicrowaveStm.md'), original: 'MicrowaveStm.pdf', pages: 's. 1' },
        { path: md('08.1-2-software-quality-metrics/50-SQM-CI---Exercise-CC.md'), original: 'SQM CI - Exercise CC.pdf', pages: 's. 2' },
      ],
      gaps: [
        'Opgaven beder om et STM-diagram for DoorControl, men materialet har ingen løsning i diagramform — kun koden.',
        'I løsningskoden kommer DoorControl aldrig ud af `DoorBreached`: `DoorClosed()` har kun en `case` for `DoorClosing`. Opgaveteksten beskriver ikke, hvad der skal ske efter et indbrud.',
        'Materialet har ingen slides om STM-teori; det forudsætter UML-tilstandsdiagrammer fra andre fag.',
      ],
      keywords: ['state machine', 'tilstandsmaskine', 'STM', 'state', 'transition', 'overgang', 'switch', 'enum', 'DoorControl', 'FlashLight', 'Microwave', 'mikrobølgeovn', 'black box', 'ClearReceivedCalls', 'State pattern'],
    },
  ],
}
