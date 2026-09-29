import type { Topic } from '../types'
import { m } from './paths'

export const solidB: Topic[] = [
  {
    slug: 'lsp',
    title: 'Liskov Substitution Principle og Design by Contract',
    short: 'LSP',
    week: 'Uge 3 · W03a',
    definition:
      '**Liskov Substitution Principle**: hvis `S` er en subtype af `T`, skal objekter af type `T` kunne erstattes af objekter af type `S` uden at ændre nogen af programmets ønskede egenskaber (Barbara Liskov, 1987). Kurset siger det kort: subtyping skal ikke betyde **IS-A**, men **IS-SUBSTITUTABLE-FOR**. Design by Contract giver testen: en afledt metode må kun erstatte preconditionen med en lige så svag eller svagere og postconditionen med en lige så stærk eller stærkere.',
    intro: [
      'Allerede i uge 1 skelner slidene mellem to betydninger af “`Mammal` inherits from `Animal`”: “compile-time” eller “is-a” inheritance (hvor en `Animal` bruges, kan en `Mammal` bruges) og “run-time” eller “behaves-like” inheritance (alle egenskaber, klienter af `Animal` ønsker, skal være de samme for `Mammal`). Det sidste er LSP, se [[oo-grundbegreber|OO-grundbegreber]].',
    ],
    concepts: [
      {
        term: 'Klientens forventninger',
        body: [
          '`ComputerProgram` bruger `T` og forventer derfor en bestemt adfærd af `T`. Vi må godt udvide `T` i en afledt klasse `S` og bruge den i stedet, men den adfærd, `ComputerProgram` forventer af `T`, skal også være implementeret i `S`. Ellers går `ComputerProgram` i stykker “because of something changed outside it!”.',
          'Pointen er, at det er **klienten**, der definerer kontrakten. Arven kan kompilere fint og stadig bryde programmet. Recap-sliden siger det sådan: “Any client of a class should be able to use subclasses of that class with no problems”.',
        ],
      },
      {
        term: 'Duck-programmet',
        body: [
          'Memet på slide 4: “If it looks like a duck, quacks like a duck, but needs batteries — you probably have the wrong abstraction”. Slide 6 gør det konkret. `migrate(duck: IDuck)` kalder `duck.fly(capetown_x, capetown_y)`, henter `getPosition()` og asserter, at anden er i Cape Town. `MallardDuck` og `BatteryDuck` realiserer begge `IDuck` (`fly`, `quack`, `getPosition`).',
          '`BatteryDuck.fly` tæller `batLevel` ned for hvert skridt og returnerer, når batteriet er tomt. Så lander anden et sted undervejs, og assert’en i `migrate` fejler — uden at en linje i `migrate` er ændret. `BatteryDuck` er en `IDuck` for compileren, men den kan ikke erstatte en `IDuck` i den kontekst, den bruges.',
          'HFDP kap. 1 har et beslægtet eksempel: `RubberDuck` og `DecoyDuck` overskriver `fly()` til ikke at gøre noget, fordi de har arvet en adfærd, de ikke har. Bogen kalder det ikke LSP, men bruger det som argument mod arv, se [[strategy|Strategy]].',
        ],
      },
      {
        term: 'Circle-ellipse-problemet',
        body: [
          '“Is a circle an ellipsis?” Matematisk ja. Slide 9 viser `Circle` som subklasse af `Ellipse`, begge med `GetMajorAxis()`, `GetMinorAxis()`, `SetMajorAxis(x)` og `SetMinorAxis(x)`.',
          'Postconditionen for `Ellipse.SetMajorAxis(x)` er `a==x && b == old.b`: storaksen bliver `x`, lilleaksen er uændret. For `Circle.SetMajorAxis(x)` er den `a==x && b==x`, fordi en cirkel skal have ens akser. Sliden kalder det en “Weaker postcondition!”. En klient, der har en `Ellipse` og regner med at kunne ændre den ene akse uden den anden, går i stykker, når den får en `Circle`. IS-A holder; IS-SUBSTITUTABLE-FOR gør ikke.',
        ],
      },
      {
        term: 'Pre- og postconditions',
        body: [
          'Bertrand Meyers regel fra Design by Contract: “A routine declaration of a derivative may only replace the original precondition with one **equal or weaker**, and the original postcondition with one **equal or stronger**”. Subklassen må altså kræve mindre af klienten og love mere — ikke omvendt.',
          '**Stærkere precondition** (slide 11): `T.setValue` asserter `val <= 10`, `S.setValue` asserter `val <= 5`. En klient, der overholder `T`’s kontrakt og kalder med 8, fejler nu. **Svagere precondition** (slide 12): `S` asserter `val <= 15` og accepterer alt, `T` accepterede.',
          '**Stærkere postcondition** (slide 10): `IDuck.fly` returnerer nu antal dage, og `migrate` asserter også `days<48`. `JetDuck.fly` lægger `0.1` dag til pr. skridt og kommer altid frem. At en subtype lover mere, end klienten kræver, er tilladt efter Meyers regel.',
        ],
      },
      {
        term: 'Class invariants og Account-eksemplet',
        body: [
          'Slide 13: `BankingApplication` bruger `SavingsAccount` (`- balance`, `getBalance()`, `deposit(amount)`, `withdraw(amount)`). Slide 14 lader `CheckingsAccount` arve fra den og tilføjer `- maxOverdraft` og `approveOverdraft(amount)`. Spørgsmålet “Is there a problem?” står åbent.',
          'Tjeklisten på de næste slides peger på svaret: ud over pre- og postconditions pr. metode har en klasse **invarianter** — egenskaber, der gælder for objektet hele tiden. Læst sådan bryder en konto med overtræk en opsparingskontos antagelse om, at saldoen ikke går i minus. Det er en fortolkning; slidene skriver den ikke, se huller.',
        ],
      },
      {
        term: 'Tjeklisten for subclassing',
        body: [
          'Når du nedarver, så tænk over klassens antagelser: 1) Hvad er superklassens pre- og postconditions **i den kontekst, den bruges**? 2) Hvad er klassens invarianter? 3) Pas på ikke at bryde koden ved at overtræde de antagelser. 4) Tænk IS-SUBSTITUTABLE-FOR i stedet for IS-A.',
          '“I den kontekst, den bruges” er vigtigt: `IDuck`-interfacet siger intet om batterier, men `migrate` regner med, at anden kommer frem. Kontrakten er det, klienterne faktisk er afhængige af.',
        ],
      },
      {
        term: 'SOLID-recap og kritikken',
        body: [
          'LSP-lektionen slutter med recap af alle fem: [[srp|SRP]], [[ocp|OCP]], LSP, [[isp|ISP]] og [[dip|DIP]]. Derefter “Alternatives to SOLID”: SOLID is hard to apply — SRP “vague”, OCP “replace old code”, LSP “no surprises”, ISP “everything is better than one object/interface”, DIP “reuse is overrated”. I stedet: “Write simple code” med et link til *Rule of Least Power*.',
          'Sidste alternativ er **CUPID**, som bygges op bogstav for bogstav: **C**omposable, **U**nix philosophy, **P**redictable, **I**diomatic, **D**omain-based. Slidene forklarer ikke bogstaverne. Kritikken er værd at have med til eksamen: kurset præsenterer SOLID som principper, man skal kunne vurdere, ikke som love.',
        ],
      },
    ],
    viz: 'lsp',
    keyPoints: [
      'LSP: en subtype skal kunne erstatte sin basetype uden at ændre programmets ønskede egenskaber.',
      'Tænk IS-SUBSTITUTABLE-FOR, ikke IS-A. Arv, der kompilerer, kan stadig bryde klienten.',
      'Design by Contract: precondition lige så svag eller svagere, postcondition lige så stærk eller stærkere.',
      '`Circle.SetMajorAxis(x)` sætter også `b` og bryder `Ellipse`’s løfte `b == old.b`.',
      '`BatteryDuck` kommer måske ikke frem (bryder LSP); `JetDuck` kommer hurtigere frem (stærkere postcondition, tilladt).',
      'Invarianter gælder for objektet hele tiden og skal også holdes af subklassen.',
      'Kontrakten er det, klienten er afhængig af “in the context it is used”.',
      'Kurset kritiserer selv SOLID (“LSP – no surprises”) og nævner CUPID som alternativ.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'Duck-programmet: BatteryDuck kan ikke erstatte IDuck',
        source: 'SOLID - L.pdf s. 6 (pseudokode på sliden, omskrevet til C#)',
        code: `interface IDuck
{
    void Fly(int toX, int toY);
    void Quack();
    (int X, int Y) GetPosition();
}

// Klienten: regner med, at anden ER i Cape Town efter Fly
void Migrate(IDuck duck)
{
    // …
    duck.Fly(capetownX, capetownY);
    var p = duck.GetPosition();
    Debug.Assert(p.X == capetownX && p.Y == capetownY);
    // …
}

class BatteryDuck : IDuck
{
    private int _x, _y;
    private int _batLevel;

    public void Fly(int toX, int toY)
    {
        for (int i = _x; i < toX; i++)
        {
            _x++;
            _batLevel--;
            if (_batLevel == 0) return;   // stopper undervejs
        }
        for (int j = _y; j < toY; j++)
        {
            _y++;
            _batLevel--;
            if (_batLevel == 0) return;
        }
    }
    // Quack() og GetPosition() udeladt
}`,
      },
      {
        lang: 'csharp',
        title: 'Stærkere precondition bryder LSP, svagere er lovlig',
        source: 'SOLID - L.pdf s. 11–12',
        code: `class T
{
    public virtual void SetValue(int val)
    {
        Debug.Assert(val <= 10);
        // ...
    }
}

// s. 11: stærkere precondition — SetValue(8) virker på T, men fejler på S
class S : T
{
    public override void SetValue(int val)
    {
        Debug.Assert(val <= 5);
        // ...
    }
}

// s. 12: Debug.Assert(val <= 15) i S er en svagere precondition — lovlig`,
      },
    ],
    exam: [
      'Liskov Substitution Principle siger, at hvis S er en subtype af T, skal jeg kunne erstatte T med S uden at ændre programmets ønskede egenskaber. Kurset siger det kort: arv skal betyde IS-SUBSTITUTABLE-FOR, ikke bare IS-A.',
      'Det klassiske eksempel er circle-ellipse. Matematisk er en cirkel en ellipse, men `Ellipse.SetMajorAxis(x)` lover, at lilleaksen er uændret. `Circle` må sætte begge akser, så en klient, der regner med `Ellipse`’s kontrakt, går i stykker, når den får en `Circle`.',
      'Design by Contract gør det målbart: en subklasse må kun svække preconditions og styrke postconditions. Kræver `S.setValue` `val <= 5`, hvor `T` tillod `val <= 10`, bryder den LSP; tillader den `val <= 15`, er det fint.',
      'I duck-eksemplet realiserer `BatteryDuck` `IDuck`, men løber tør for strøm undervejs, så `migrate`’s assert fejler. `JetDuck` kommer hurtigere frem, og det er en stærkere postcondition, som er tilladt.',
      'Afvejningen er, at kontrakten afhænger af, hvordan klassen bruges. Derfor siger tjeklisten: tjek superklassens pre- og postconditions i den kontekst, den bruges, og dens invarianter. Og kurset lægger selv op til kritik af SOLID — LSP koges ned til “no surprises”.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W03a_SOLID_LSP.md'), original: 'SOLID - L.pdf', pages: 's. 4–32', note: 'Duck s. 6 og 10, LSP forklaret s. 7, circle-ellipse s. 8–9, pre/post s. 11–12, Account s. 13–14, tjekliste s. 15–18, recap s. 19–24, alternativer og CUPID s. 25–32' },
      { path: m('slides/SW4SWD-01_W01.1b_OO_Basics.md'), original: 'OO Basic.pdf', pages: 's. 12', note: '“Spoiler: This is Liskov’s Substitution Principle”' },
      { path: m('bog/SW4SWD-01_HFDP_Ch01_Strategy.md'), original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf', pages: 's. 5 (PDF s. 43)', note: '`RubberDuck` og `DecoyDuck` overskriver `fly()` til at gøre ingenting' },
    ],
    gaps: [
      'Account-eksemplet (s. 14) stiller “Is there a problem?” uden at svare. At problemet er en brudt invariant (saldoen må ikke gå i minus), er en fortolkning ud fra tjeklisten på s. 16. Diagrammet viser heller ikke, at `CheckingsAccount` overskriver `withdraw` — den tilføjer kun `maxOverdraft` og `approveOverdraft(amount)`.',
      'Slide 9 kalder `Circle`’s postcondition `a==x && b==x` “weaker”. Uden for materialet: logisk er den hverken svagere eller stærkere end `a==x && b == old.b` — den medfører den bare ikke (medmindre `old.b == x`). Konklusionen er den samme: klienten får ikke det, `Ellipse` lovede.',
      'Slide 10 kalder `JetDuck` et eksempel på en stærkere postcondition, men siger ikke eksplicit, at det er lovligt; det følger af Meyer-citatet på s. 9 og 11.',
      'Koden på s. 6 og 10 er pseudokode (Python-agtig signatur, Java-agtig krop). Anden løkke er `for(int j=y; j<toY: i++)` — den tæller `i` op i stedet for `j`. Rettet i C#-versionen ovenfor. Slide 10’s `duck.getPosi` er afskåret på sliden.',
      'Slide 7 skriver “use it in ComputerProgram instead of S”; der menes “instead of T”. Slide 5 staver “LIVSKOV’S SUBSTITUION PRINCIBLE”.',
      'CUPID (s. 27–32) og *Rule of Least Power* (s. 26) vises kun som ord og et link. Hvad bogstaverne betyder i praksis, og hvem der står bag, står ikke i materialet.',
    ],
    keywords: ['LSP', 'Liskov', 'Barbara Liskov', 'substitution', 'substituerbar', 'IS-A', 'IS-SUBSTITUTABLE-FOR', 'behaves-like', 'Design by Contract', 'Bertrand Meyer', 'precondition', 'postcondition', 'invariant', 'class invariant', 'circle-ellipse', 'circle-ellipsis', 'IDuck', 'BatteryDuck', 'JetDuck', 'MallardDuck', 'migrate', 'SavingsAccount', 'CheckingsAccount', 'CUPID', 'Rule of Least Power', 'SOLID'],
  },

  {
    slug: 'isp',
    title: 'Interface Segregation Principle',
    short: 'ISP',
    week: 'Uge 3 · W03b',
    definition:
      '**Interface Segregation Principle**: “Clients should not be forced to depend on methods they do not use.” ISP beder om små, kohæsive interfaces. Det giver to fordele: **implementors** skal ikke skrive “dummy”-metoder for de dele, de ikke implementerer, og **consumers** skal ikke forholde sig til metoder, de ikke bruger.',
    concepts: [
      {
        term: 'Consumer eller implementor',
        body: [
          'Slide 4 sætter det op med en lommekniv: “I want…” en enkelt klinge, “I got” en schweizerkniv med alt. Slide 5 advarer: ordet “client” bruges i litteraturen både om den, der **bruger** et interface (consumer), og den, der **implementerer** det (implementor). Kurset viser derfor et brud fra hver side.',
        ],
      },
      {
        term: 'Brud set fra consumers: temperatursensoren',
        body: [
          'Slide 9: `Client` afhænger af `Temperature Sensor`, som har `startMeasurement()`, `isTempReady()`, `readTemp()`, `setSensitivity(degPerVolt)` og `setOffset(deg)`. Klienten skal bare læse temperaturen, men afhænger også af kalibreringen.',
          'Slide 10 deler interfacet: `<<interface>> ITemperature Provider` med de tre målemetoder og `<<interface>> ITemperature SensorCalibration` med de to kalibreringsmetoder. `Temperature Sensor` realiserer begge, og `Client` kender kun `ITemperature Provider`.',
        ],
      },
      {
        term: 'Brud set fra implementors: TimedDoor',
        body: [
          'Slide 11: en `Timer` har `Register(int t, ITimerClient c)` og kalder `ITimerClient.Timeout()`. `TimedDoor` skal have timeouts, så nogen har ladet `IDoor` (`Open()`, `Close()`, `IsOpen(): bool`) arve fra `ITimerClient`. `AccessProvider` bruger `IDoor`.',
          'Slidens konsekvenser: `TimedDoor` “exerts a force” på `IDoor`. `IDoor` er forurenet, hvilket rammer **alle** implementeringer: `HeavyDoor` og `SlidingDoor` skal nu implementere `Timeout()`, og deres brugere “must accept a software update for *zero* benefit”. Consumeren `AccessProvider` har fået én metode mere at tænke på.',
          'Slide 12 løser det: `IDoor` og `ITimerClient` er adskilte, og kun `TimedDoor` realiserer begge. `HeavyDoor` og `SlidingDoor` er uændrede, og “Consumers of IDoor remain oblivious to change”.',
        ],
      },
      {
        term: 'ISP i den virkelige verden',
        body: [
          'C#’s `List<T>` implementerer otte interfaces: `ICollection<T>`, `IEnumerable<T>`, `IList<T>`, `IReadOnlyCollection<T>`, `IReadOnlyList<T>`, `ICollection`, `IEnumerable` og `IList`. En metode, der kun skal løbe en samling igennem, kan tage `IEnumerable<T>` og er så ligeglad med, om den får en liste.',
        ],
      },
      {
        term: 'ISP mod “the evil client”',
        body: [
          'I uge 1 er “evil client” en klient, der misbruger en klasses offentlige medlemmer, fx `tm.turbines.Clear()` eller `tm.SetMaxSpeed("A323", -1000)` på en `TurbineManager`, se [[oo-grundbegreber|OO-grundbegreber]].',
          'I W08b kommer den igen: `FlashLight` har både GUI-events (`PWRPressed()`, `MODEPressed()`, `COLORPressed()`), `SetIntensityState`/`SetColorState` og STM-actions (`TurnLampOn()` …). En klient kan sætte tilstanden direkte eller tænde lampen og dermed gå uden om tilstandsmaskinen. “ISP to the rescue”: `IFlashLight` med de tre events til klienterne og `IFlashLightInternal` til tilstandsmaskinen, se [[nested-orthogonal|nested og orthogonal states]].',
        ],
      },
      {
        term: 'Afvejningen',
        body: [
          'Små interfaces er ikke gratis. HFDP kap. 1 prøver at løse flyvende gummiænder med `Flyable`- og `Quackable`-interfaces, så kun de ænder, der kan flyve, har `fly()`. Bogens dom: det løser en del af problemet, men “completely destroys code reuse” for adfærden — hver flyvende and skal nu implementere `fly()` selv. Svaret der er komposition, se [[strategy|Strategy]].',
          'Kritik-sliden i LSP-lektionen koger ISP ned til “everything is better than one object/interface”. Arkitekturlektionen siger, at SOLID også gælder på arkitekturniveau, “We’re just talking about modules and not classes”.',
        ],
      },
    ],
    viz: 'isp',
    keyPoints: [
      '“Clients should not be forced to depend on methods they do not use.”',
      'Små, kohæsive interfaces: ingen dummy-metoder hos implementors, ingen overflødige metoder hos consumers.',
      '“Client” betyder både consumer og implementor — kurset viser et brud fra hver side.',
      'Consumer-siden: `Client` skal kun bruge `ITemperature Provider`, ikke kalibreringen.',
      'Implementor-siden: `IDoor : ITimerClient` tvinger `HeavyDoor` og `SlidingDoor` til at implementere `Timeout()`.',
      'Rettelsen: `TimedDoor` realiserer både `IDoor` og `ITimerClient`; de andre er uændrede.',
      '`List<T>` implementerer otte interfaces — ISP i .NET.',
      'W08b bruger ISP til at lukke “the evil client” ude af tilstandsmaskinen.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'Fedt interface og delt interface: dørene',
        source: 'SOLID - ID.pdf s. 11–12 (C# ud fra klassediagrammerne)',
        code: `public interface ITimerClient
{
    void Timeout();
}

public class Timer
{
    public void Register(int t, ITimerClient c) { /* … */ }
}

// Brud (s. 11): IDoor arver Timeout() — alle døre skal implementere den
// public interface IDoor : ITimerClient { … }

// Delt (s. 12): IDoor ved intet om timere
public interface IDoor
{
    void Open();
    void Close();
    bool IsOpen();
}

public class TimedDoor : IDoor, ITimerClient { /* Open, Close, IsOpen, Timeout */ }
public class HeavyDoor : IDoor { /* Open, Close, IsOpen — uændret */ }
public class SlidingDoor : IDoor { /* Open, Close, IsOpen — uændret */ }`,
      },
      {
        lang: 'csharp',
        title: 'ISP to the rescue: ét interface pr. slags klient',
        source: 'Patterns - NestedOrthogonal - Copy.pdf s. 7 (C# ud fra klassediagrammet)',
        code: `// Til klienterne af FlashLight (GUI'en)
public interface IFlashLight
{
    void PWRPressed();
    void MODEPressed();
    void COLORPressed();
}

// Til tilstandsmaskinens implementering
public interface IFlashLightInternal
{
    void SetIntensityState(IntensityState s);
    void SetColorState(ColorState s);
    // STM actions
    void TurnLampOn();
    void TurnLampOff();
    void SetLowBeam();
    void SetHighBeam();
    void SetBeamColor(Color c);
}

public class FlashLight : IFlashLight, IFlashLightInternal { /* … */ }`,
      },
    ],
    exam: [
      'Interface Segregation Principle siger, at klienter ikke må tvinges til at afhænge af metoder, de ikke bruger. Derfor skal interfaces være små og kohæsive.',
      'Kurset viser det fra to sider, fordi “client” både kan betyde consumer og implementor. Fra consumer-siden: en klient, der kun læser temperaturen, skal ikke kende til kalibreringsmetoderne, så sensoren får to interfaces: `ITemperature Provider` og `ITemperature SensorCalibration`.',
      'Fra implementor-siden: lader man `IDoor` arve `ITimerClient` for `TimedDoor`’s skyld, skal `HeavyDoor` og `SlidingDoor` også implementere `Timeout()`, og deres brugere får en opdatering uden gevinst. Deler man interfacene, er kun `TimedDoor` berørt.',
      'Samme idé bruges i W08b mod “the evil client”: `FlashLight` får et interface til GUI’en og et internt til tilstandsmaskinen, så klienter ikke kan gå uden om den.',
      'Afvejningen: HFDP viser med `Flyable` og `Quackable`, at mange små interfaces kan ødelægge genbrug af implementeringen. ISP siger noget om, hvad klienter ser — ikke at alt skal splittes op.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W03b_SOLID_ISP_DIP.md'), original: 'SOLID - ID.pdf', pages: 's. 4–13', note: 'Definition og fordele s. 5–8, consumers s. 9–10, implementors s. 11–12, List<T> s. 13' },
      { path: m('slides/SW4SWD-01_W08b_State_Nested_Orthogonal.md'), original: 'Patterns - NestedOrthogonal - Copy.pdf', pages: 's. 6–7', note: '“The evil client” og “ISP to the rescue”' },
      { path: m('slides/SW4SWD-01_W01.1b_OO_Basics.md'), original: 'OO Basic.pdf', pages: 's. 5–6', note: 'Evil client i indkapslingsafsnittet' },
      { path: m('bog/SW4SWD-01_HFDP_Ch01_Strategy.md'), original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf', pages: 's. 6–7 (PDF s. 44–45)', note: '`Flyable`/`Quackable` og tabet af genbrug' },
      { path: m('slides/SW4SWD-01_W03a_SOLID_LSP.md'), original: 'SOLID - L.pdf', pages: 's. 23, 25', note: 'Recap og kritik af ISP' },
      { path: m('slides/SW4SWD-01_W04.1_Architecture_Process_1.md'), original: '1-SW-Architecture - Process 1.pdf', pages: 's. 30', note: 'SOLID på modulniveau' },
    ],
    gaps: [
      'Slide 9 spørger “What is the problem?” (med en Menti-afstemning) uden at skrive svaret; det står kun implicit i løsningen på s. 10.',
      'Slide 11 tegner `IDoor` → `ITimerClient` med stiplet linje og hul trekant (realisering). Uden for materialet: når et interface udvider et andet, er det i UML en generalisering (fuldt optrukket linje).',
      'Slide 11 har en association fra `TimedDoor` til `Timer`; på s. 12 er den væk, så det fremgår ikke, hvordan `TimedDoor` registrerer sig.',
      'Klassenavnene på s. 9–10 har mellemrum (`Temperature Sensor`, `ITemperature Provider`, `ITemperature SensorCalibration`), og metoderne står uden typer (`setSensitivity(degPerVolt)`, `setOffset(deg)`). Derfor er der ingen C#-kode til det eksempel her.',
      'Slide 3 (“YOU HAVE A PROBLEM!”) er kun et billede uden tekst.',
      'Uden for materialet: `IFlashLight` forhindrer ikke en klient i at caste til `FlashLight`; segregeringen gør det rigtige til det nemme, ikke det forkerte umuligt.',
    ],
    keywords: ['ISP', 'Interface Segregation', 'fat interface', 'fedt interface', 'polluted interface', 'consumer', 'implementor', 'client', 'dummy method', 'Temperature Sensor', 'ITemperature Provider', 'ITemperature SensorCalibration', 'IDoor', 'ITimerClient', 'TimedDoor', 'HeavyDoor', 'SlidingDoor', 'AccessProvider', 'Timer', 'List<T>', 'IEnumerable', 'evil client', 'IFlashLight', 'IFlashLightInternal', 'Flyable', 'Quackable', 'SOLID'],
  },

  {
    slug: 'dip',
    title: 'Dependency Inversion Principle',
    short: 'DIP',
    week: 'Uge 3 · W03b',
    definition:
      '**Dependency Inversion Principle**: “A: High-level modules should not depend on low-level modules. Both should depend on abstractions. B: Abstractions should not depend on details. Details should depend on abstractions.” High-level-moduler rummer politikken — hvad der skal ske; low-level-moduler kender detaljerne om hardware og kommunikation. Kurset viser det med drivhusets **Environmental Control System (ECS)**.',
    concepts: [
      {
        term: 'High-level og low-level',
        body: [
          'High-level-moduler er abstraheret fra detaljer (fx om kommunikation og hardware) og indeholder politikker, forretningsmodeller osv. Low-level-moduler, fx drivere, kender detaljerne om hardware og kommunikation, men ved intet om high-level-begreber som forretning eller politikker.',
          'Memet på slide 14: “Would you solder a lamp directly to the electrical wiring in a wall?” Stikkontakten er abstraktionen, som både lampen og installationen tilpasser sig.',
        ],
      },
      {
        term: 'ECS før: politik og hardware i én løkke',
        body: [
          'Et simpelt ECS er installeret i et drivhus og overvåger temperaturen: `T > Tmax` → åbn vinduer, stop varmen. `Tmin < T < Tmax` → luk vinduer, stop varmen. `T < Tmin` → luk vinduer, start varmen.',
          '`ECS.RegulateTemp()` læser `in(TEMP_SENSOR_DATA_ADDR)` og skriver direkte til `WINACT_CMD_ADDR` og `HEATER_CMD_ADDR`, og sover med `Thread.Sleep(10000)`. Slide 20 peger afhængighederne ud: den konkrete temperatursensor-HW, vinduesaktuator- og varmer-HW, OS’ets I/O-system og OS’ets scheduling.',
          'Slide 22–24: high-level er ECS og temperaturregulatoren; low-level er varmer, vindue, sensor/aktuator og OS. ECS implementerer politikken for, hvordan temperaturen reguleres, “…but it depends on low-level implementations to do it”. Diagrammet på slide 25: `ECS` peger ned på `Temperature Sensor HW`, `Window Actuator HW` og `Heater HW`.',
        ],
      },
      {
        term: 'ECS efter: afhængighederne vendes',
        body: [
          'Slide 29 lægger klasserne i tre niveauer. **High-level**: `ECS` (`Regulate()`) peger på `«interface» ITemperatureSensor` (`GetTemp()`) og `«interface» ITemperatureRegulator` (`IncreaseTemp()`, `DecreaseTemp()`, `MaintainTemp()`). **Mid-level**: `TemperatureRegulator` realiserer `ITemperatureRegulator` og peger på `«interface» IWindow` (`Open()`, `Close()`) og `«interface» IHeater` (`Start()`, `Stop()`). **Low-level**: `TemperatureSensor`, `Window` og `Heater` realiserer hvert sit interface.',
          'Sliden ringer tre steder ind som “DIP”: sensoren, regulatoren og vindue/varmer. Hvert sted peger både brugeren og den konkrete klasse på en abstraktion — og interfacet står på samme niveau som den, der bruger det. Pilene fra low-level går nu **opad**. Så kan high-level-modulet “care about what to do, not how to do it”.',
          'Slide 31 viser koden: `Regulate()` kalder `tempSensor.GetTemp()` og `tempRegulator.DecreaseTemp()`/`IncreaseTemp()`/`MaintainTemp()`. `IncreaseTemp()` er `Window.Close(); Heater.Start();`. Først i `Window` og `Heater` står `out(WINACT_CMD_ADDR, …)` og `out(HEATER_CMD_ADDR, …)`.',
        ],
      },
      {
        term: 'Hvorfor “inversion”?',
        body: [
          'HFDP (kap. 4) formulerer princippet som “Depend upon abstractions. Do not depend upon concrete classes” og forklarer navnet: i den typiske top-down-tankegang afhænger `PizzaStore` af alle de konkrete pizzaer. Efter [[factory-method|Factory Method]] afhænger både `PizzaStore` og pizzaerne af abstraktionen `Pizza`, så afhængighedsdiagrammet “has inverted itself”.',
          'Slidene bruger ordet omvendt: på slide 25 er det udgangspunktet, der kaldes *inverted* — “high-level modules depend on low-level ones. DIP tells us not to do that.” Begge peger på det samme design; se huller.',
        ],
      },
      {
        term: 'Retningslinjer og grænser',
        body: [
          'HFDP giver tre retningslinjer: ingen variabel må holde en reference til en konkret klasse (brug en factory i stedet for `new`), ingen klasse må arve fra en konkret klasse, og ingen metode må overskrive en implementeret metode i en baseklasse. Bogen siger selv, at de er umulige at følge fuldt ud: det er “a guideline you should strive for”. At instantiere `String`-objekter er et brud, men i orden, fordi `String` næppe ændrer sig.',
          'Kritik-sliden i LSP-lektionen siger om DIP: “reuse is overrated”. HFDP sammenligner med Hollywood-princippet (se [[template-method|Template Method]]): begge sigter mod afkobling, men DIP er “a much stronger and more general statement”.',
          'I arkitektur gælder SOLID på modulniveau. Lagdelingsslidene skriver dog, at afhængigheder kun må gå fra højere til lavere lag, “just like you know from DIP” — hvilket er det, DIP’s del A forbyder uden en abstraktion imellem, se [[arkitekturstile|arkitekturstile]] og huller.',
        ],
      },
      {
        term: 'DIP er ikke dependency injection',
        body: [
          'W03b nævner ikke dependency injection og viser ikke, hvordan `ECS` får sin `tempSensor` og `tempRegulator`. DIP handler om **retningen** på afhængighederne: hvem afhænger af hvilken abstraktion. Dependency injection handler om **hvordan** et objekt får sine afhængigheder: kursets mønsteroversigt beskriver det som “A class accepts the objects it requires from an injector instead of creating the objects directly”, og lagdelingsslidene nævner det som forudsætning for at kunne udskifte et lag.',
          'De to arbejder sammen. SWT bruger samme drivhus-ECS: `ECS(ITempSensor, IHeater, int)` får sine afhængigheder gennem konstruktøren, så testen kan give fakes, se [[swt/design-for-testability|design for testability]]. I ASP.NET Core er det containeren, der injicerer, se [[bad/di-levetider|DI-levetider]].',
        ],
      },
    ],
    viz: 'dip',
    keyPoints: [
      'A: High-level-moduler må ikke afhænge af low-level-moduler; begge afhænger af abstraktioner.',
      'B: Abstraktioner må ikke afhænge af detaljer; detaljer afhænger af abstraktioner.',
      'High-level = politik (hvad); low-level = detaljer (hvordan), fx drivere og HW.',
      'ECS før: `RegulateTemp()` skriver direkte til HW-adresser.',
      'ECS efter: `ECS` → `ITemperatureSensor` og `ITemperatureRegulator`; `TemperatureRegulator` → `IWindow` og `IHeater`.',
      'Interfacet står på brugerens niveau; pilene fra de konkrete klasser går opad.',
      'Skift af varmer-HW rammer kun `Heater`; `ECS` og `TemperatureRegulator` er uændrede.',
      'DIP er retningen på afhængigheden; dependency injection er, hvordan den leveres.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'ECS før: politik og hardware blandet',
        source: 'SOLID - ID.pdf s. 21 (pseudo-C# som på sliden)',
        code: `class ECS
{
    ...
    void RegulateTemp()
    {
        while (true)
        {
            curTemp = in(TEMP_SENSOR_DATA_ADDR);
            switch (curTemp):
            {
                case curTemp > MAX_TEMP:
                    out(WINACT_CMD_ADDR, 1);       // opens window
                    out(HEATER_CMD_ADDR, 0x00FF);  // stops heater
                    break;
                case curTemp < MIN_TEMP:
                    out(WINACT_CMD_ADDR, 0);       // closes window
                    out(HEATER_CMD_ADDR, 0xFF00);  // starts heater
                    break;
                default:
                    out(WINACT_CMD_ADDR, 0);       // closes window
                    out(HEATER_CMD_ADDR, 0x00FF);  // stops heater
                    break;
            }
            Thread.Sleep(10000); // Sleep 10s before next regulation
        }
    }
}`,
      },
      {
        lang: 'csharp',
        title: 'ECS efter: alle afhænger af abstraktioner',
        source: 'SOLID - ID.pdf s. 29 og 31 (interfaces fra klassediagrammet; switch omskrevet til if/else)',
        code: `interface ITemperatureSensor   { int GetTemp(); }
interface ITemperatureRegulator { void IncreaseTemp(); void DecreaseTemp(); void MaintainTemp(); }
interface IWindow { void Open(); void Close(); }
interface IHeater { void Start(); void Stop(); }

// High-level: politikken — hvad der skal ske
class ECS
{
    ITemperatureSensor tempSensor;
    ITemperatureRegulator tempRegulator;

    void Regulate()
    {
        while (true)
        {
            int curTemp = tempSensor.GetTemp();
            if (curTemp > MAX_TEMP) tempRegulator.DecreaseTemp();
            else if (curTemp < MIN_TEMP) tempRegulator.IncreaseTemp();
            else tempRegulator.MaintainTemp();
            Thread.Sleep(10000);
        }
    }
}

// Mid-level
class TemperatureRegulator : ITemperatureRegulator
{
    IWindow Window;
    IHeater Heater;
    public void IncreaseTemp() { Window.Close(); Heater.Start(); }
    public void DecreaseTemp() { Window.Open();  Heater.Stop();  }
    public void MaintainTemp() { Window.Close(); Heater.Stop();  }
}

// Low-level: detaljerne — hvordan
class Window : IWindow
{
    public void Open()  { out(WINACT_CMD_ADDR, 1); }
    public void Close() { out(WINACT_CMD_ADDR, 0); }
}

class Heater : IHeater
{
    public void Start() { out(HEATER_CMD_ADDR, 0x00FF); } // som på s. 31
    public void Stop()  { out(HEATER_CMD_ADDR, 0xFF00); }
}`,
      },
    ],
    exam: [
      'Dependency Inversion Principle har to dele: high-level-moduler må ikke afhænge af low-level-moduler, begge skal afhænge af abstraktioner; og abstraktioner må ikke afhænge af detaljer, detaljerne skal afhænge af abstraktionerne.',
      'Kursets eksempel er drivhusets ECS. Før skriver `RegulateTemp()` direkte til hardwareadresserne, så reguleringspolitikken afhænger af sensor-, vindue- og varmer-HW. Efter kender `ECS` kun `ITemperatureSensor` og `ITemperatureRegulator`, og `TemperatureRegulator` kender kun `IWindow` og `IHeater`.',
      'Inversionen ses i diagrammet: interfacet står på brugerens niveau, og de konkrete klasser peger opad på det. Skifter jeg varmer-hardware, rører jeg kun `Heater`; `ECS` og regulatoren er uændrede.',
      'DIP er ikke det samme som dependency injection. DIP siger, hvilken vej afhængighederne skal pege; dependency injection er en måde at levere den konkrete klasse på, fx gennem konstruktøren, som SWT gør med samme ECS for at kunne teste med fakes.',
      'Afvejningen: HFDP kalder retningslinjerne umulige at følge fuldt ud — man instantierer `String` uden problemer, fordi den ikke ændrer sig. Og kursets egen kritik er “reuse is overrated”. Abstraktionen betaler sig, hvor detaljen forventes at ændre sig.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W03b_SOLID_ISP_DIP.md'), original: 'SOLID - ID.pdf', pages: 's. 14–32', note: 'Definition s. 15–16, ECS-krav s. 17–19, før-koden s. 20–24, afhængigheder s. 25–26, efter s. 27–31, diskussion s. 32' },
      { path: m('bog/SW4SWD-01_HFDP_Ch04_Factory.md'), original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf', pages: 's. 139–143 (PDF s. 177–181)', note: '“Depend upon abstractions”, inversionen og de tre retningslinjer' },
      { path: m('bog/SW4SWD-01_HFDP_Ch08_Template_Method.md'), original: 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf', pages: 's. 300 (PDF s. 338)', note: 'Hollywood-princippet vs. DIP' },
      { path: m('slides/SW4SWD-01_W06a_Design_Patterns_Intro.md'), original: 'Design Patterns - Introduction.pdf', pages: 's. 14', note: 'Dependency Injection i listen over creational patterns' },
      { path: m('slides/SW4SWD-01_W04.2_Architecture_Process_2.md'), original: '2-SW-Architecture - Process 2.pdf', pages: 's. 24, 27', note: 'Lagdeling “just like … DIP”; udskiftning af lag kræver interfaces og dependency injection' },
      { path: m('slides/SW4SWD-01_W03a_SOLID_LSP.md'), original: 'SOLID - L.pdf', pages: 's. 24–25', note: 'Recap og kritik (“reuse is overrated”)' },
    ],
    gaps: [
      'Slide 31 bytter varmerens kommandoer om: `Start()` sender `0x00FF` og `Stop()` sender `0xFF00`, mens før-koden på s. 20–24 kommenterer `0x00FF` som “stops heater” og `0xFF00` som “starts heater”. Koden ovenfor gengiver s. 31.',
      'Slidene og HFDP bruger “inverted” om hver sin ende: slide 25 kalder det oprindelige design (high-level afhænger af low-level) *inverted*; HFDP s. 141 (PDF s. 179) siger, at det er det nye design, hvor afhængighederne “has inverted itself”.',
      'Lagdelingsslidene (2-SW-Architecture - Process 2.pdf s. 24) siger, at afhængigheder kun må gå fra højere til lavere lag, “just like you know from DIP”. Det stemmer ikke med DIP’s del A, som netop forbyder high-level at afhænge af low-level uden en abstraktion.',
      'W03b nævner ikke dependency injection og viser ikke, hvor `ECS` får `tempSensor` og `tempRegulator` fra. Skellet mellem DIP og dependency injection trækkes ikke eksplicit noget sted i SWD-materialet; det er sammenstykket af s. 14 i *Design Patterns - Introduction.pdf* og s. 27 i *2-SW-Architecture - Process 2.pdf*.',
      'Koden på s. 20–24 er pseudo-C#: `switch(curTemp):` med betingelser i `case`, `in(…)`/`out(…)` og `void Main(string args[])`. Slide 20 hedder metoden `Main`, fra s. 21 `RegulateTemp`, og på s. 31 `Regulate`.',
      'Diskussionsspørgsmålene på s. 32 (hvad koster det at skifte sensor-, vindue- eller varmer-HW; hvor ses DIP’s ordlyd i designet) besvares ikke på slidene.',
      'ECS-eksemplet i SWT (`ECS(ITempSensor, IHeater, int)`, uden vindue) er en anden udgave end SWD’s med `ITemperatureRegulator`, `IWindow` og `IHeater`.',
    ],
    keywords: ['DIP', 'Dependency Inversion', 'dependency inversion principle', 'high-level', 'low-level', 'mid-level', 'abstraction', 'abstraktion', 'policy', 'ECS', 'Environmental Control System', 'drivhus', 'greenhouse', 'ITemperatureSensor', 'ITemperatureRegulator', 'TemperatureRegulator', 'IWindow', 'IHeater', 'dependency injection', 'constructor injection', 'Depend upon abstractions', 'PizzaStore', 'Hollywood', 'lagdeling', 'SOLID'],
  },
]
