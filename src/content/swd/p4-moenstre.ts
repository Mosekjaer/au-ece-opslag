import type { Part } from '../types'
import { m } from './paths'
import { moenstreB } from './p4-moenstre-b'

const HFDP = 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf'

export const moenstre: Part = {
  id: 'moenstre',
  title: 'Designmønstre',
  topics: [
    {
      slug: 'design-patterns',
      title: 'Hvad er et designmønster?',
      short: 'Designmønstre',
      week: 'Uge 6 · W06a',
      definition:
        'Et designmønster beskriver **et problem, der opstår igen og igen**, og **kernen i løsningen** — så generelt, at løsningen kan bruges “a million times over, without ever doing it the same way twice” (arkitekten Christopher Alexander). Mønstre opfindes ikke; de **opdages**, når man sammenligner forskellige løsninger på fælles problemer. Kurset arbejder med seks af Gang of Four’s 23 mønstre.',
      intro: [
        'W06a er kortet over resten af mønsterdelen: hvad et mønster er, hvor det ligger mellem kode og arkitektur, hvilket katalog kurset bruger, og hvilken skabelon et mønster beskrives efter. Selve mønstrene kommer i [[observer|Observer]], [[template-method|Template Method]], [[strategy|Strategy]], [[factory-method|Factory Method]], [[abstract-factory|Abstract Factory]] og [[state|State]].',
      ],
      concepts: [
        {
          term: 'Alexanders definition',
          body: [
            'Definitionen kommer fra byggekunsten. Slide 3 citerer Christopher Alexander og viser forsiden af *A Pattern Language* (Alexander, Ishikawa, Silverstein m.fl.): hvert mønster beskriver et problem, der optræder igen og igen i vores omgivelser, og derefter kernen i løsningen.',
            'To ord bærer definitionen. **Problem**: et mønster er defineret ved den tilbagevendende situation, ikke ved en bestemt kodestump. **Kerne**: det er ikke en færdig implementering, men en løsning der skal tilpasses. Slide 6 siger det samme med andre ord: “General designs — Must be customized to context”.',
          ],
        },
        {
          term: 'Opdaget, ikke opfundet',
          body: [
            'Slide 5: “Design patterns are not invented, they emerge. They are discovered by examining different solutions to common problems. Often the solutions have something in common, which can be formulated as a pattern.” Baggrunden er et Mandelbrot-billede — strukturer der gentager sig selv.',
            'Et mønster er altså en fællesnævner, som nogen har fundet i mange konkrete løsninger og skrevet ned. HFDP siger det samme fra den anden side: mønstre går ikke direkte ind i koden, de går først ind i hovedet, og så bruger man dem i nye designs og til at omarbejde gammel kode, der er blevet ufleksibel.',
          ],
        },
        {
          term: 'Hvad mønstre giver, og hvor de ligger',
          body: [
            'Slide 6 nævner fire gevinster: **best practices for recurring problems**, **terminology and pattern language**, **learning opportunity** og **maintainable software**.',
            'Slide 7 placerer mønstrene på en akse fra lav til høj kompleksitet: *Coding Idioms* → *SW Design Patterns* → *Application Architecture* → *System Architecture*. Et designmønster er større end en kodevending og mindre end en arkitektur, se [[arkitekturstile|arkitekturstile]].',
          ],
        },
        {
          term: 'Et fælles vokabular',
          body: [
            'Slide 8 viser tre talebobler: “Couldn’t we just use *Strategy* and *Iterator* to solve that?”, “Apply *State* and *Command* together, and we’re home free!” og “Should we build the server as a *Reactor*?” Ét mønsternavn erstatter en lang forklaring.',
            'HFDP bruger samme argument i kapitel 1. Rick beskriver en “broadcast class”, der holder styr på sine lyttere og sender hver ny data til dem — kollegaen spørger, hvorfor han ikke bare sagde **Observer**. “We’re using the Strategy Pattern to implement the various behaviors of our ducks” fortæller, at adfærden er indkapslet i sit eget sæt klasser, der kan udvides og skiftes, også på runtime. Mønstre lader en diskussion blive på designniveau. Bogen advarer også mod **Pattern Fever**: man har den, når man begynder at bruge mønstre til Hello World.',
          ],
        },
        {
          term: 'Gang of Four og de tre kategorier',
          body: [
            'Kataloget stammer fra *Design Patterns: Elements of Reusable Object-Oriented Software* af Gamma, Helm, Johnson og Vlissides — “Gang of Four” (GoF). Slide 10 deler de 23 mønstre i tre grupper: **creational** (Abstract Factory, Builder, Factory Method, Prototype, Singleton), **structural** (Adapter, Bridge, Composite, Decorator, Façade, Flyweight, Proxy) og **behavioral** (Chain of Responsibility, Command, Interpreter, Iterator, Mediator, Memento, Observer, State, Strategy, Template Method, Visitor).',
            'Slide 12 markerer kursets udvalg med rødt: **Abstract Factory** og **Factory Method** (creational) samt **Observer**, **State**, **Strategy** og **Template** (behavioral). Ingen structural patterns.',
            'Hvorfor og hvornår? Slide 11 svarer kun med de fem SOLID-principper: [[srp|SRP]], [[ocp|OCP]], [[lsp|LSP]], [[isp|ISP]] og [[dip|DIP]]. Mønstrene er midler til at overholde principperne — Observer lader fx nye consumers komme til uden at ændre provideren (OCP), og Strategy/State fjerner `switch`-kæder.',
          ],
        },
        {
          term: 'GoF Pattern Description Template',
          body: [
            'GoF beskriver hvert mønster efter samme skabelon (slide 13): **Name**, **Intent**, **Also Known As**, **Motivation**, **Applicability**, **Structure**, **Participants**, **Collaborations**, **Consequences**, **Implementation**, **Sample code**, **Known Uses** og **Related Patterns**. Slidet udfylder kun navnet (Observer) som optakt til næste lektion.',
            'Kursets egne mønsterslides følger en kortere udgave: *Pattern name* og *Intent* (fx W07.1 s. 5 og 15), *Structure* (klassediagram), *Sequence*/program flow og *Consequences*. Det er også en brugbar rækkefølge til et mundtligt oplæg: intent → problemet det løser → struktur → et eksempel → konsekvenser → relaterede mønstre.',
          ],
        },
        {
          term: 'Mønstre uden for GoF og anti-patterns',
          body: [
            'GoF er ikke hele landskabet. Slide 14 viser Wikipedias tabel over creational patterns, hvor bl.a. **Dependency Injection**, **Lazy initialization**, **Multiton**, **Object pool** og **RAII** ikke står i GoF-bogen. Slide 15 viser hele siden med fire tabeller — også *concurrency patterns* som Active Object, Reactor og Thread pool, som GoF slet ikke har (se [[threading|tråde i C#]]).',
            'Slide 16 viser c2-wikiens katalog over **anti-patterns** (AccidentalComplexity, BigBallOfMud, CopyAndPasteProgramming, CreepingFeaturitis …). Slidet definerer ikke begrebet, men listen taler for sig: løsninger der går igen og gør skade. Mange minder om [[design-smells|design smells]].',
          ],
        },
        {
          term: 'Pattern eller anti-pattern: Singleton',
          body: [
            'Slide 17 stiller spørgsmålet “Pattern or anti-pattern?” og viser Singleton: et UML-diagram med privat konstruktør `- Singleton()`, et understreget (static) felt `- singleton : Singleton` og en understreget `+ getInstance() : Singleton`, samt en trådsikker C#-version med `sealed`, `volatile`, `lock` og dobbelt `null`-tjek. Slidet svarer ikke.',
            'Et svar kan bygges af kursets egne principper: Singleton står i GoF-kataloget (slide 10) og beskrives på slide 14 som “Ensure a class has only one instance, and provide a global point of access to it”). Men det globale adgangspunkt `Singleton.Instance` er en afhængighed af en konkret klasse, der ikke kan byttes ud — det modsiger [[dip|DIP]] og [[swt/design-for-testability|design for testability]], hvor afhængigheder injiceres, så testen kan sætte fakes ind. Svaret afhænger altså af konteksten, som Alexanders definition lægger op til.',
          ],
        },
        {
          term: 'Den obligatoriske mønsteropgave',
          body: [
            'Kurset har én obligatorisk gruppeopgave (hand-in) og to individuelle reviews, og de skal være godkendt for at man kan gå til eksamen (Course Intro s. 14–15). Ifølge lesson plan introduceres opgaven mandag i uge 8 (kal.uge 43), **valget af mønster** har deadline fredag samme uge, og **afleveringen** er fredag i uge 10 (kal.uge 45). Uge 10 har ingen anden undervisning end opgaven.',
          ],
        },
      ],
      viz: 'design-patterns',
      keyPoints: [
        'Mønster = tilbagevendende problem + kernen i løsningen, der skal tilpasses konteksten (Alexander).',
        'Mønstre opdages i eksisterende løsninger; de opfindes ikke.',
        'Placering: coding idioms < design patterns < application architecture < system architecture.',
        'Største praktiske gevinst: et fælles vokabular (“brug Observer”).',
        'GoF: 23 mønstre i creational, structural og behavioral. Kurset: Abstract Factory, Factory Method, Observer, State, Strategy, Template Method.',
        'Hvorfor mønstre? For at overholde SOLID (slide 11).',
        'GoF-skabelonen: Intent, Motivation, Structure, Participants, Collaborations, Consequences …',
        'Mønsteropgaven: valg af mønster fredag uge 8, aflevering fredag uge 10.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Singleton med double-checked locking',
          source: 'Design Patterns - Introduction.pdf s. 17',
          code: `public sealed class Singleton
{
    private static volatile Singleton? _instance;
    private static readonly object _lock = new object();

    private Singleton() { }

    public static Singleton Instance
    {
        get
        {
            if (_instance != null)
            {
                return _instance;
            }

            lock (_lock)
            {
                if (_instance == null)
                    _instance = new Singleton();
            }

            return _instance;
        }
    }
}`,
        },
      ],
      exam: [
        'Et designmønster er en navngivet, generel løsning på et problem, der går igen — Alexander siger “the core of the solution”, som man kan bruge en million gange uden at lave den ens to gange. Mønstre er opdaget i mange eksisterende løsninger, ikke opfundet.',
        'Kurset bruger Gang of Four-kataloget med 23 mønstre i tre kategorier: creational, structural og behavioral. Vi har arbejdet med to creational — Factory Method og Abstract Factory — og fire behavioral: Observer, Template Method, Strategy og State.',
        'Jeg bruger et mønster, når det hjælper mig med at overholde SOLID. Observer giver OCP, fordi nye observers kan komme til uden at subject ændres, og Strategy erstatter en `switch` med polymorfi.',
        'Den største gevinst er vokabularet: siger jeg “Observer”, ved kollegaen, at der er et subject med en liste af observers bag et interface, og at de kan tilmelde og afmelde sig på runtime.',
        'Et mønster har en pris. Singleton er i GoF-kataloget, men dens globale adgangspunkt er en skjult, konkret afhængighed, som ikke kan erstattes af en fake i en test — derfor er den både pattern og anti-pattern, afhængigt af konteksten.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W06a_Design_Patterns_Intro.md'), original: 'Design Patterns - Introduction.pdf', pages: 's. 3–17' },
        { path: m('bog/SW4SWD-01_HFDP_Ch01_Strategy.md'), original: HFDP, pages: 'PDF s. 64–67 (bogens s. 26–29)', note: 'Shared vocabulary, Pattern Fever, “How do I use Design Patterns?”' },
        { path: m('kursus/SW4SWD-01_Lesson_Plan.md'), original: 'Lesson plan.html', note: 'Uge 8: “Introduction to mandatory exercise”, “Deadline for choosing a pattern”; uge 10: “Mandatory Exercise Handin Friday”' },
        { path: m('slides/SW4SWD-01_W01.1a_Course_Intro.md'), original: 'Course Intro.pdf', pages: 's. 14–15, 20', note: 'Én obligatorisk gruppeopgave + to individuelle reviews' },
      ],
      gaps: [
        'Slide 4–5 i originalen indeholder stadig teksten “TODO: Slide om emerging patterns!” — slidet om *emerging patterns* er aldrig lavet. Markdown-konverteringen udelader det.',
        'Slide 10 og 12 staver “Adaptive” (GoF: Adapter) og “Template” (GoF: Template Method); slide 11 staver “Lisskov”.',
        'Slide 13 viser kun feltnavnene i GoF-skabelonen. Hvad hvert felt skal indeholde, forklares ikke i materialet, og GoF-bogen selv er ikke pensum (HFDP er).',
        'Slide 16 definerer ikke *anti-pattern*; det er kun en liste fra c2-wikien. Uden for materialet: et anti-pattern er typisk defineret som en udbredt løsning, der ser rimelig ud, men har flere ulemper end fordele.',
        'Slide 17 besvarer ikke “Pattern or anti-pattern?”. Diagrammet har feltet `singleton` og metoden `getInstance()`, mens koden har `_instance` og en property `Instance`.',
        'Selve opgaveformuleringen til mønsteropgaven findes ikke i materialet — kun datoerne. Course Intro s. 14–15 siger “two individual reviews”, s. 20 “your hand-in and review” (ental).',
      ],
      keywords: ['design pattern', 'designmønster', 'mønster', 'Christopher Alexander', 'A Pattern Language', 'emerging patterns', 'Gang of Four', 'GoF', 'creational', 'structural', 'behavioral', 'pattern language', 'vokabular', 'shared vocabulary', 'Pattern Fever', 'GoF Pattern Description Template', 'intent', 'consequences', 'anti-pattern', 'Singleton', 'double-checked locking', 'Dependency Injection', 'RAII', 'mønsteropgave', 'obligatorisk opgave', 'hand-in', 'review'],
    },

    {
      slug: 'observer',
      title: 'GoF Observer',
      week: 'Uge 6 · W06b',
      definition:
        '**Observer** “defines a one-to-many dependency between objects so that when one object changes state, all its dependents are notified and updated automatically” (GoF-intent, slide 5; samme ordlyd i HFDP). Et **subject** holder en liste af **observers**, som det kun kender gennem et interface; når dets tilstand ændres, kalder det `Update()` på dem alle. Observers kan tilmelde og afmelde sig på runtime.',
      concepts: [
        {
          term: 'Problemet: polling eller notifikation',
          body: [
            'Slide 3 opstiller det generelle “data-update”-problem: en `Provider` (`- data: uint`, `+ SetData(x: uint)`) har data, som en *tredje* part ændrer en gang imellem. En `Consumer` bruger dataene og vil opdatere sig, når de ændres. “How can we realize this coupling?”',
            'Slide 4 viser to svar som sekvensdiagrammer. **Polling**: Consumer kalder `GetData()` igen og igen; først kaldet efter `SetData(2)` giver noget nyt. Slidet spørger: “What happens if more consumers are added?” **Notifikation**: efter `SetData(2)` kalder Provider selv `DataChanged()` på Consumer — ét kald, men nu skal Provider kende Consumer.',
            'Slide 5 stiller kravene: consumers skal kunne tilføjes uden at ændre provideren (**OCP**), provideren skal kunne informere uden stærk kobling (**low coupling**), og mange consumers skal kunne informeres om samme data.',
          ],
        },
        {
          term: 'Struktur: fire roller',
          body: [
            '`Subject` er en **abstrakt baseklasse** med `+ Attach(Observer)`, `+ Detach(Observer)` og `+ Notify()` og vedligeholder listen af observers (association `observers`, multiplicitet `*`). `Observer` er et **interface** med `+ Update()`. `ConcreteSubject` arver fra `Subject`, har `- state`, `+ GetSubjectState()` og `+ SetData(...)` — det er den klasse, der skal overvåges (Provider). `ConcreteObserver` implementerer `Observer` og er den, der modtager opdateringer (Consumer).',
            'Pointen er, at `Subject` kun kender `Observer`-interfacet. HFDP opregner, hvad det giver: subject ved kun, at observeren implementerer interfacet; nye observers kan tilføjes når som helst; subject skal aldrig ændres for at understøtte en ny observertype; de to kan genbruges uafhængigt; og ændringer i den ene påvirker ikke den anden. Bogen formulerer det som et princip: **“Strive for loosely coupled designs between objects that interact.”**',
            'Men i slidens diagram peger `ConcreteObserver` også på `ConcreteSubject` (`+ subject: ConcreteSubject`) — “ConcreteObserver depends on ConcreteSubject to GetState”. Den pil er pull-variantens problem.',
          ],
        },
        {
          term: 'Pull-varianten',
          body: [
            '“Observer pulls state from subject” (slide 7): `o1` kalder `Attach(o1)`, og subject lægger den i `_observers`. Udefra kaldes `SetData(2)`, subject gemmer den nye værdi og kalder sin egen `Notify()`, som kalder `Update()` uden argumenter på hver observer. Observeren kalder så tilbage med `GetSubjectState()` og får `state`.',
            'I koden (slide 10) har observeren feltet `private ConcreteSubject subject`, fordi `GetSubjectState()` ikke står på `ISubject`. Slide 11 (“Pull Variant Problems”) markerer netop tilbagekaldet og denne association: observeren er koblet til den konkrete subject-klasse.',
            'Slide 12 prøver at løse det ved at flytte `GetSubjectState(): SubjectData` op i den abstrakte `Subject` og give observeren feltet `subject: Subject`. Slidet spørger: “Is this a good design? Hint: does it apply the SR principle?” — `Subject` skal nu både administrere observers og udstille en bestemt datatype, se [[srp|SRP]].',
          ],
        },
        {
          term: 'Push-varianten',
          body: [
            '“Subject pushes state to observer” (slide 13): forskellen er ét sted — `Notify()` kalder `Update(subjectState)`, og der er intet tilbagekald. Klassediagrammet på slide 14 giver `Observer` metoden `+ Update(state: SubjectData)` (“Needed so observer can see the new data”) og `ConcreteSubject` en override af `Notify()` (“for each observer ob: ob.Update(this.state)”). `ConcreteObserver` har ikke længere et felt af typen `ConcreteSubject`; `SubjectData` bruges kun som afhængighed (stiplet pil).',
            'I koden (slide 17) tager observerens konstruktør et `ISubject`, kalder `subject.Attach(this)` og gemmer ikke referencen.',
          ],
        },
        {
          term: 'Push eller pull: slides og bog er uenige',
          body: [
            '**Slidene** fremstiller pull som den variant med problemer (kobling til `ConcreteSubject`, s. 11–12) og push som den renere.',
            '**HFDP** starter med push (`update(temp, humidity, pressure)`) og skifter til pull. Argumentet: tilføjer Weather-O-Rama senere vindhastighed, skal `update()` ændres i *alle* displays, også dem der er ligeglade med vind. Med pull får `WeatherData` blot en getter mere. I bogens “fireside chat” siger Subject, at push er mere bekvemt — alt i én notifikation — og at pull kræver, at den “opens itself up even more”; Observer svarer, at subject umuligt kan forudse, hvad alle observers har brug for. Bogens sammenfatning: “pull is considered more ‘correct’”.',
            'Begge har ret, fordi de måler forskellige ting: slidene måler koblingen fra observer til subject, bogen måler hvor mange klasser en ændring i subjectets data rammer. Det er en god afvejning at kunne sige højt.',
          ],
        },
        {
          term: 'Flere subjects',
          body: [
            'Den gennemgåede variant håndterer mange observers på *samme* subject. Men hvad med én observer på flere subjects af **samme type** (slide 18)? Så ved observeren ikke, hvem der kaldte. To løsninger: subject sender **reference til sig selv** — `NotifyObservers(this)` og `Update(Subject s)`; “Sending this uniquely ID’s the Subject” (slide 19). Eller subject sender et **tag** — `NotifyObservers(tag)` og `Update(string tag)`; det identificerer også subject, men sender ingen objektreference, så “it is up to the Observer to find the correct reference” (slide 20).',
            'Subjects af **forskellige typer** (slide 21–23) kan løses “manuelt” ved at duplikere hele strukturen (`SubjectA`/`ObserverA`/`SubjectDataA` ved siden af B), hvor `ConcreteObserver` implementerer begge interfaces. Eller med **generics**: `Subject<T>` og `Observer<T>` med `Update(state: T)`; `ConcreteObserver` implementerer `Observer<T>` to gange — “Multiple implementations of same interface under different generic type”.',
          ],
        },
        {
          term: 'Observer i C#',
          body: [
            'Slide 24: “The Observer pattern is not in the standard library for C#”, men det er let at lave generiske interfaces selv, fx `public interface IObserver<T> { void Update(T subject); }`.',
            'Slide 25 nuancerer: “The observer pattern is built into C#” — med `event` og delegates er “a similar but more flexible mechanism” en del af sproget, “but that is a topic for another course”. Det andet kursus er SWT, se [[swt/events|C# events]].',
          ],
        },
        {
          term: 'Weather Station og Observer i naturen',
          body: [
            'HFDP kapitel 2 bruger **Weather-O-Rama**: `WeatherData` har `getTemperature()`, `getHumidity()`, `getPressure()` og `measurementsChanged()`, og der skal være tre displays — current conditions, statistics og forecast — som tredjeparter skal kunne supplere med egne. Første forsøg kalder de tre displays direkte i `measurementsChanged()`: kodet mod konkrete klasser, hvert nyt display kræver en kodeændring, displays kan ikke tilføjes eller fjernes på runtime, og det der ændrer sig, er ikke indkapslet.',
            'Løsningen: `Subject` med `registerObserver`, `removeObserver`, `notifyObservers`; `Observer` med `update`; og et separat `DisplayElement` med `display()`. `CurrentConditionsDisplay` registrerer sig selv i konstruktøren og gemmer referencen til `WeatherData`, så den senere kan afmelde sig.',
            'Bogen finder mønsteret i Swing (`addActionListener` — lyttere er observers, `actionPerformed()` er `update()`), JavaBeans, RxJava og JavaScript-events, og nævner at Javas egne `Observer`/`Observable` blev deprecated i Java 9. Man må ikke regne med en bestemt notifikationsrækkefølge. **Publish/Subscribe** er beslægtet, men mere komplekst: subscribers kan vælge beskedtyper, og publisher og subscriber er yderligere adskilt, typisk af middleware. I kurset går mønsteret igen som **Fault Observer** i [[fejlhaandtering|fejlhåndtering]] (“Communicated with publisher/subscriber, e.g. observer, events”).',
          ],
        },
      ],
      viz: 'observer',
      keyPoints: [
        'Intent: one-to-many dependency; når subject ændrer tilstand, notificeres alle dependents automatisk.',
        'Subject kender kun `Observer`-interfacet → nye observers uden at ændre subject (OCP, løs kobling).',
        'Attach/Detach på runtime; `Notify()` løber listen igennem og kalder `Update()`.',
        'Pull: `Update()` tom, observeren kalder `GetSubjectState()` tilbage — koblet til `ConcreteSubject`.',
        'Push: `Update(state)` sender dataene med — men signaturen følger subjectets data.',
        'Slides foretrækker push (kobling); HFDP kalder pull mere “correct” (udvidelse).',
        'Flere subjects: send `this` eller et tag; forskellige typer: `Subject<T>`/`Observer<T>`.',
        'I C# er `event`/delegates sprogets udgave af mønsteret.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Push-varianten fra slidene',
          source: 'Design Patterns - GoF Observer.pdf s. 15–17',
          code: `public class SubjectData
{
   public int Measurement { get; set; }
}

public interface ISubject
{
   void Attach(IObserver obs);
   void Detach(IObserver obs);
   void Notify();
}

public interface IObserver
{
   void Update(SubjectData subjectData);
}

public class ConcreteSubject : ISubject
{
   private List<IObserver> observers = new List<IObserver>();
   private SubjectData state = new SubjectData();

   public void Attach(IObserver obs)
   {
       observers.Add(obs);
   }

   public void Notify()
   {
       foreach (var observer in observers)
       {
           observer.Update(state);
       }
   }
}

public class ConcreteObserver : IObserver
{
   public ConcreteObserver(ISubject subject)
   {
       subject.Attach(this);
   }

   public void Update(SubjectData subjectData)
   {
       // Handle new value of subject data
   }
}`,
        },
        {
          lang: 'csharp',
          title: 'Weather Station (push) oversat til C#',
          source: 'HFDP PDF s. 96–98 (bogens s. 58–60) — Java i bogen',
          code: `public interface ISubject
{
    void RegisterObserver(IObserver o);
    void RemoveObserver(IObserver o);
    void NotifyObservers();
}

public interface IObserver
{
    void Update(float temp, float humidity, float pressure);
}

public interface IDisplayElement
{
    void Display();
}

public class WeatherData : ISubject
{
    private readonly List<IObserver> observers = new List<IObserver>();
    private float temperature, humidity, pressure;

    public void RegisterObserver(IObserver o) => observers.Add(o);
    public void RemoveObserver(IObserver o) => observers.Remove(o);

    public void NotifyObservers()
    {
        foreach (var observer in observers)
            observer.Update(temperature, humidity, pressure);
    }

    public void MeasurementsChanged() => NotifyObservers();

    public void SetMeasurements(float temperature, float humidity, float pressure)
    {
        this.temperature = temperature;
        this.humidity = humidity;
        this.pressure = pressure;
        MeasurementsChanged();
    }
}

public class CurrentConditionsDisplay : IObserver, IDisplayElement
{
    private float temperature, humidity;
    private readonly WeatherData weatherData; // gemt, så vi kan afmelde os senere

    public CurrentConditionsDisplay(WeatherData weatherData)
    {
        this.weatherData = weatherData;
        weatherData.RegisterObserver(this);
    }

    public void Update(float temperature, float humidity, float pressure)
    {
        this.temperature = temperature;
        this.humidity = humidity;
        Display();
    }

    public void Display() =>
        Console.WriteLine($"Current conditions: {temperature}F degrees and {humidity}% humidity");
}`,
        },
        {
          lang: 'csharp',
          title: 'Pull i Weather Station: update() uden argumenter',
          source: 'HFDP PDF s. 107 (bogens s. 69) — Java i bogen',
          code: `// WeatherData
public void NotifyObservers()
{
    foreach (var observer in observers)
        observer.Update();
}

// IObserver
public interface IObserver
{
    void Update();
}

// CurrentConditionsDisplay henter selv, hvad den skal bruge
public void Update()
{
    temperature = weatherData.GetTemperature();
    humidity = weatherData.GetHumidity();
    Display();
}`,
        },
      ],
      exam: [
        'Observer definerer en en-til-mange-afhængighed: når subjectets tilstand ændres, bliver alle dets observers notificeret og opdateret automatisk. Subject holder en liste af observers, som det kun kender gennem et interface med `Update()`.',
        'Mønsteret løser data-update-problemet uden polling. Provideren behøver ikke kende sine consumers konkret, så jeg kan tilføje nye observers uden at ændre subject — det er OCP og løs kobling.',
        'Der er to varianter. I pull kalder observeren `GetSubjectState()` tilbage, og så bliver den koblet til den konkrete subject-klasse. I push sender subject tilstanden med i `Update(state)`, men så skal alle observers ændres, hvis dataene udvides — HFDP’s vindhastighed-eksempel. Slidene foretrækker push, bogen kalder pull mere korrekt.',
        'I Weather Station er `WeatherData` subject, og de tre displays er observers, der registrerer sig i konstruktøren. I C# er events og delegates sprogets egen udgave af mønsteret.',
        'Lytter én observer på flere subjects, skal den vide, hvem der kaldte: subject kan sende `this` eller et tag med, og ved forskellige datatyper kan man gøre `Subject<T>` og `Observer<T>` generiske.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W06b_GoF_Observer.md'), original: 'Design Patterns - GoF Observer.pdf', pages: 's. 3–25' },
        { path: m('bog/SW4SWD-01_HFDP_Ch02_Observer.md'), original: HFDP, pages: 'PDF s. 76–110 (bogens s. 38–72)', note: 'Weather-O-Rama, definition PDF s. 89, loose coupling s. 92, push/pull s. 101–102 og 106–107, bullet points s. 110' },
        { path: m('slides/SW4SWD-01_W13.2_Error_Handling.md'), original: 'Error handling 1.pdf', pages: 's. 16–17', note: 'Fault Observer via publisher/subscriber' },
      ],
      gaps: [
        'Slide 24 siger, at Observer ikke er i C#’s standardbibliotek; slide 25 siger, at mønsteret er “built into C#” via events. Uden for materialet: .NET har faktisk `System.IObserver<T>` og `System.IObservable<T>` (med `OnNext`, `OnError`, `OnCompleted` og `Subscribe`). Slidens hjemmelavede `IObserver<T>` med `Update(T)` kolliderer med det navn.',
        'Klassediagrammerne (s. 6, 14) har `Subject` som abstrakt baseklasse, men C#-koden (s. 8–9, 15–16) bruger et interface `ISubject`, som `ConcreteSubject` implementerer. `Detach` er deklareret, men ikke implementeret i koden, og pull-observerens konstruktør er vist som `{…}`.',
        'Slide 12 spørger, om forsøget på afkobling overholder SRP, men giver intet svar. Push vs. pull-tabellen i markdown-konverteringen er konverterens egen, ikke slidenes.',
        'Materialet nævner ikke, at en observer, der glemmer at afmelde sig, holdes i live af subjectets liste. Uden for materialet: i .NET gælder det også events (“lapsed listener”).',
        'Slide 24 linker til “Demo: Full Example”, som ikke er en del af materialet.',
        'Slidene viser ingen event-kode. Uden for materialet: et C#-`event` svarer til subjectets observer-liste, `+=`/`-=` til `Attach`/`Detach`, og at rejse eventet til `Notify()`.',
        'HFDP’s diagram (PDF s. 95) udelader bevidst pilene fra displays til `WeatherData` (“would start to look like spaghetti”), selv om de findes i koden.',
      ],
      keywords: ['Observer', 'observer pattern', 'subject', 'ConcreteSubject', 'ConcreteObserver', 'Attach', 'Detach', 'Notify', 'Update', 'publish-subscribe', 'pub/sub', 'polling', 'notifikation', 'push', 'pull', 'GetSubjectState', 'one-to-many', 'en-til-mange', 'loose coupling', 'løs kobling', 'Weather Station', 'WeatherData', 'Weather-O-Rama', 'registerObserver', 'IObserver<T>', 'event', 'delegate', 'listener', 'Fault Observer', 'reference-to-self', 'tag'],
    },

    {
      slug: 'template-method',
      title: 'GoF Template Method',
      short: 'Template Method',
      week: 'Uge 7 · W07.1',
      definition:
        '**Template Method** “define[s] the *skeleton* of an algorithm in an operation, deferring some steps to client subclasses” (slide 5). En abstrakt basisklasse ejer algoritmens rækkefølge i én metode — template-metoden — og subklasserne udfylder enkelte trin. Mønsteret bygger på **arv**, og adfærden ligger fast på **compile-time**.',
      concepts: [
        {
          term: 'Struktur',
          body: [
            '`AbstractClass` har `+TemplateMethod()`, der kalder trinene i fast rækkefølge: `MethodX()`, `MethodA()`, `MethodB()`, `MethodY()` (slide 6). De invariante trin `-MethodX()` og `-MethodY()` er private og implementeret i basisklassen; de varierende `#MethodA()` og `#MethodB()` er protected og abstrakte. `ConcreteClass` arver og implementerer kun `#MethodA()` og `#MethodB()`.',
            'Klienten holder referencen som `AbstractClass` og kalder kun `TemplateMethod()`. Kørslen (slide 8) viser, at basisklassen styrer: “MethodX called”, “ConcreteClass1 MethodA called”, “ConcreteClass1 MethodB called”, “MethodY called” — og derefter samme skelet med `ConcreteClass2`.',
          ],
        },
        {
          term: 'Coffee, Tea og CaffeineBeverage',
          body: [
            'HFDP kapitel 8 starter med Starbuzz’ opskrifter. Kaffe: *boil some water, brew coffee in boiling water, pour coffee in cup, add sugar and milk*. Te: *boil some water, steep tea in boiling water, pour tea in cup, add lemon*. Klasserne `Coffee` og `Tea` har hver sin `prepareRecipe()`, og `boilWater()` og `pourInCup()` er identiske.',
            'Første forsøg flytter kun de to fælles metoder op i `CaffeineBeverage` og lader `prepareRecipe()` være abstrakt. Bogen spørger: “Are we overlooking some other commonality?” — ja, selve **algoritmen** er ens. Trin 2 og 4 generaliseres til `brew()` og `addCondiments()`, og hele `prepareRecipe()` flyttes op i basisklassen som `final`, så subklasser ikke kan ændre opskriften. `Tea` og `Coffee` implementerer nu kun `brew()` og `addCondiments()`.',
            'Bogens før/efter: før styrer `Coffee` og `Tea` algoritmen, koden er duplikeret, og ændringer kræver ændringer flere steder. Efter styrer og **beskytter** `CaffeineBeverage` algoritmen, genbruget er maksimalt, algoritmen lever ét sted, og en ny drik skal kun implementere et par metoder.',
          ],
        },
        {
          term: 'Hooks: tre slags trin',
          body: [
            'Slide 14 skelner: et **valgfrit** trin får en tom implementering i basisklassen — en **hooked method**; et trin, der er **ens for alle** subklasser, erklæres *final*. De abstrakte trin skal implementeres.',
            'HFDP: en hook er en metode i den abstrakte klasse med en tom eller default-implementering, så subklasser *kan* “hooke sig ind” i algoritmen, men også kan lade være. I `CaffeineBeverageWithHook` kalder `prepareRecipe()` kun `addCondiments()`, hvis `customerWantsCondiments()` returnerer `true` (default). `CoffeeWithHook` overrider hooken og spørger brugeren.',
            'Reglen: brug abstrakte metoder, når subklassen **skal** levere trinnet, og hooks, når trinnet er valgfrit. Hooks bruges også til at lade subklassen **reagere** på noget, der er ved at ske eller lige er sket (fx `justReorderedList()`), og til at lade subklassen **træffe en beslutning** for den abstrakte klasse. Få abstrakte metoder gør subklasserne lette at skrive, men “the less granularity, the less flexibility”.',
          ],
        },
        {
          term: 'Frameworks og Hollywood-princippet',
          body: [
            'Slide 10–11: Template Method bruges ofte i frameworks. Frameworket styrer flowet (*hvornår* noget sker), og man “instantierer” frameworket ved at implementere dets metoder i afledte klasser. Slidet deler det i to pakker: *Framework* med `AbstractClass` (`+ DoYourThing()`, `# DoPart1()`, `# DoPart2()`) og *Instantiation* med `ConcreteClass1` og `ConcreteClass2`. Mønsteret kaldes også **Hollywood pattern**: “Don’t call us – we’ll call you.”',
            'HFDP gør det til et princip: high-level-komponenter bestemmer, hvornår og hvordan low-level-komponenter kaldes; low-level-komponenter kalder aldrig high-level direkte. Det forhindrer **dependency rot**. `Tea` og `Coffee` kalder aldrig `CaffeineBeverage` uden at være kaldt først, og klienter afhænger af abstraktionen `CaffeineBeverage`. Bogen skelner fra [[dip|DIP]]: begge vil afkoble, men DIP er det stærkere og mere generelle udsagn; Hollywood er en teknik til at bygge frameworks. [[factory-method|Factory Method]] og [[observer|Observer]] bruger også princippet.',
          ],
        },
        {
          term: 'Kursets eksempler',
          body: [
            '**Game AI** (slide 4, fra refactoring.guru): `GameAI.turn()` kalder `collectResources()`, `buildStructures()`, `buildUnits()` og `attack()`. `collectResources()` og `attack()` er fælles; `attack()` kalder de abstrakte `sendScouts(position)` og `sendWarriors(position)`. `OrcsAI` bygger farms, barracks og stronghold og laver peons eller grunts; `MonstersAI.buildStructures()` gør ingenting.',
            '**Patientforløb** (slide 9): `PatientCareProcess.AdmitPatient()` kører `PerformCheckup()`, `DiagnosePatient()`, `ProvideMedication()`, `TreatPatient()` og `DischargePatient()`; kun `PerformCheckup()` og `ProvideMedication()` er abstrakte og udfyldes af `InpatientCareProcess`.',
            '**Build-proces** (slide 12–13): “The compile → link → return executable sequence is fixed, but actual compilation and linkage is deferred to subclass(es).” `Builder.Build(MakeFile m)` kalder de abstrakte `Compile(...)` og `Link(...)` og håndterer `BuildError` ét sted; `x86Builder`, `x64Builder` og `ARMBuilder` udfylder trinene.',
            'I Java-API’et finder HFDP “template methods in the wild”: `Arrays.sort()` (algoritmen er fast, `compareTo()` leveres af elementerne via `Comparable`), `JFrame.paint()` (en hook, der som default ikke tegner noget) og `AbstractList.subList()` (bygger på de abstrakte `get()` og `size()`).',
          ],
        },
        {
          term: 'Template Method vs. Strategy',
          body: [
            'Slide 22: begge er **behavioral patterns**, og begge gør systemets adfærd **udvidelig**. Template Method bruger **inheritance** — callback-implementeringer, frameworks, “Behavior fixed at compile-time”. [[strategy|Strategy]] bruger **delegation** — “Behavior can be changed at runtime”. Slide 23 stiller de to klassediagrammer side om side.',
            'Variationen sidder forskellige steder. I Template Method varierer enkelte **trin**, mens skelettet ligger fast i basisklassen. I Strategy varierer **hele algoritmen**. HFDP bruger netop den skelnen om `Arrays.sort()`: det ligner Strategy, men “in Strategy, the class that you compose with implements the *entire* algorithm”; her mangler algoritmen `compareTo()` — derfor Template Method.',
            'Bogens “fireside chat” giver afvejningen. Template Method: mere kontrol over algoritmen, ingen duplikeret kode (fælles kode ligger i superklassen), lidt mere effektiv, færre objekter, og “perfect for creating frameworks”. Strategy: mere fleksibel, fordi den bruger objektkomposition — klienten kan skifte algoritme på runtime — og mindre afhængig, fordi den ikke afhænger af metoder i subklasser, men implementerer hele algoritmen selv.',
          ],
        },
        {
          term: 'Arv vs. komposition',
          body: [
            'Template Method er kursets eksempel på at genbruge med **arv**: `ConcreteClass` *is-a* `AbstractClass`, basisklassen kalder ned i subklassens overrides, og valget af adfærd sker, når man vælger hvilken subklasse der instantieres. Prisen er, at adfærden ikke kan skiftes, mens objektet lever, og at basisklassen afhænger af metoder i subklasserne.',
            'Duck-eksemplet på slide 24–27 viser, hvor arv knækker: `fly()` i basisklassen tvinger sig ned i `RubberDuck` og `DecoyDuck`, som må skrive `//NoOp`. HFDP’s princip “Favor composition over inheritance” fører til [[strategy|Strategy]], hvor `Duck` *has-a* `FlyBehavior`. Arv er ikke forkert — i Template Method er det netop arven, der sikrer, at skelettet ikke kan ændres — men den binder adfærden til typen. Se også [[factory-method|Factory Method]], som HFDP kalder en specialisering af Template Method, hvor den primitive operation opretter og returnerer et objekt (W07.2 s. 8 spørger til forskellen).',
          ],
        },
      ],
      viz: 'template-method',
      keyPoints: [
        'Intent: definér algoritmens skelet i én metode, og udskyd nogle trin til subklasser.',
        'Template-metoden ligger i basisklassen og bør ikke kunne overrides (`final` i HFDP, ikke-virtuel i C#).',
        'Abstrakte trin: skal implementeres. Hooks: tom/default-implementering, kan overrides. Invariante trin: private/final.',
        'Hollywood-princippet: “Don’t call us, we’ll call you” — frameworket styrer flowet.',
        'Mekanisme: arv; adfærden bindes på compile-time.',
        'Vs. Strategy: Template Method varierer trin, Strategy hele algoritmen; arv vs. delegation.',
        'Eksempler: CaffeineBeverage, GameAI, PatientCareProcess, Builder.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Struktur og programflow fra slidene',
          source: 'GoF Template Method, GoF Strategy.pdf s. 7',
          code: `public abstract class AbstractClass
{
    public void TemplateMethod()
    {
        MethodX();
        MethodA();
        MethodB();
        MethodY();
    }

    protected abstract void MethodA();
    protected abstract void MethodB();

    private void MethodX()
    {
        Console.WriteLine("MethodX called");
    }

    private void MethodY()
    {
        Console.WriteLine("MethodY called");
    }
}

public class ConcreteClass1 : AbstractClass
{
    protected override void MethodA()
    {
        Console.WriteLine("ConcreteClass1 MethodA called");
    }

    protected override void MethodB()
    {
        Console.WriteLine("ConcreteClass1 MethodB called");
    }
}

static void Main(string[] args)
{
    AbstractClass ac = new ConcreteClass1();
    ac.TemplateMethod();

    AbstractClass ac2 = new ConcreteClass2();
    ac2.TemplateMethod();
}`,
        },
        {
          lang: 'csharp',
          title: 'CaffeineBeverage med en hook, oversat til C#',
          source: 'HFDP PDF s. 332–333 (bogens s. 294–295) — Java i bogen',
          code: `public abstract class CaffeineBeverageWithHook
{
    // Template method. Java: final void prepareRecipe().
    // I C# er en ikke-virtuel metode ikke til at override.
    public void PrepareRecipe()
    {
        BoilWater();
        Brew();
        PourInCup();
        if (CustomerWantsCondiments())
        {
            AddCondiments();
        }
    }

    protected abstract void Brew();          // primitive operation
    protected abstract void AddCondiments(); // primitive operation

    private void BoilWater() => Console.WriteLine("Boiling water");
    private void PourInCup() => Console.WriteLine("Pouring into cup");

    // Hook: default-implementering, subklassen må override
    protected virtual bool CustomerWantsCondiments() => true;
}

public class CoffeeWithHook : CaffeineBeverageWithHook
{
    protected override void Brew() =>
        Console.WriteLine("Dripping Coffee through filter");

    protected override void AddCondiments() =>
        Console.WriteLine("Adding Sugar and Milk");

    protected override bool CustomerWantsCondiments()
    {
        Console.Write("Would you like milk and sugar with your coffee (y/n)? ");
        string answer = Console.ReadLine() ?? "no";
        return answer.ToLower().StartsWith("y");
    }
}`,
        },
      ],
      exam: [
        'Template Method definerer skelettet af en algoritme i én metode i en abstrakt basisklasse og overlader nogle af trinene til subklasserne. Basisklassen bestemmer rækkefølgen; subklassen bestemmer indholdet af de trin, der varierer.',
        'HFDP’s eksempel er kaffe og te: begge koger vand, brygger, hælder op og tilsætter noget. `CaffeineBeverage.prepareRecipe()` ligger fast, og `Coffee` og `Tea` implementerer kun `brew()` og `addCondiments()`. Så lever algoritmen ét sted, og duplikeringen forsvinder.',
        'Trin kan være abstrakte, så subklassen skal levere dem, eller hooks med en default, som subklassen kan override — fx `customerWantsCondiments()`. Det er Hollywood-princippet: “Don’t call us, we’ll call you” — derfor er mønsteret frameworkets mønster.',
        'Sammenlignet med Strategy bruger Template Method arv i stedet for delegation. Den giver mere kontrol og mindre duplikering, men adfærden ligger fast på compile-time; Strategy kan bytte hele algoritmen på runtime.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W07.1_GoF_Template_Method_Strategy.md'), original: 'GoF Template Method, GoF Strategy.pdf', pages: 's. 4–14, 22–23' },
        { path: m('bog/SW4SWD-01_HFDP_Ch08_Template_Method.md'), original: HFDP, pages: 'PDF s. 316–349 (bogens s. 278–311)', note: 'Definition PDF s. 329, hooks s. 331–335, Hollywood s. 336–338, Arrays.sort s. 340–345, fireside chat s. 348–349' },
        { path: m('bog/SW4SWD-01_HFDP_Ch01_Strategy.md'), original: HFDP, pages: 'PDF s. 61 (bogens s. 23)', note: '“Favor composition over inheritance”' },
        { path: m('slides/SW4SWD-01_W07.2_GoF_Factory_Abstract_Factory.md'), original: 'GoF Factory Method, Gof Abstract Factory.pdf', pages: 's. 8', note: '“What’s the difference between template method and factory method patterns?”' },
      ],
      gaps: [
        'Markdown-konverteringen af HFDP kap. 8 kalder TM vs. Strategy “et klassisk eksamensspørgsmål”. Det er konverterens kommentar; hverken bogen eller slidene siger det.',
        'Slide 14 siger “Final declaration” om trin, der er ens for alle subklasser. Uden for materialet: C# har ikke `final` på metoder. Metoder er ikke-virtuelle som standard og kan derfor ikke overrides (kun skjules med `new`); `sealed override` stopper yderligere overrides. Slide 6–7 løser det med en offentlig, ikke-virtuel `TemplateMethod()` og private invariante trin.',
        '`Builder.Build` på slide 13 returnerer intet i `catch`-grenen. Uden for materialet: i C# giver det kompileringsfejlen “not all code paths return a value”.',
        'Slidenes intent (“deferring some steps to client subclasses”) er kortere end HFDP’s, som tilføjer: “Template Method lets subclasses redefine certain steps of an algorithm without changing the algorithm’s structure.”',
        'Lab-øvelsen “SuperSorter” står kun på agendaen (slide 3). Opgaveteksten er ikke i materialet.',
        'Game AI-eksemplet (slide 4) er pseudokode fra refactoring.guru; `MonstersAI` er ikke vist med andre metodekroppe end `// do nothing`.',
      ],
      keywords: ['Template Method', 'template method', 'skabelonmetode', 'skeleton', 'skelet', 'AbstractClass', 'ConcreteClass', 'primitive operation', 'hook', 'hooked method', 'final', 'Hollywood principle', 'Hollywood-princippet', 'don’t call us, we’ll call you', 'framework', 'CaffeineBeverage', 'Coffee', 'Tea', 'prepareRecipe', 'customerWantsCondiments', 'GameAI', 'PatientCareProcess', 'Builder', 'Arrays.sort', 'inheritance', 'arv', 'compile-time', 'dependency rot', 'Template Method vs Strategy'],
    },

    {
      slug: 'strategy',
      title: 'GoF Strategy',
      week: 'Uge 7 · W07.1',
      definition:
        '**Strategy** “define[s] a *family* of algorithms, encapsulate[s] each one, and make[s] them interchangeable at runtime” (slide 15). En **context** holder en reference til et strategy-interface og **delegerer** arbejdet til den konkrete strategi, som kan byttes, mens programmet kører. HFDP tilføjer: “Strategy lets the algorithm vary independently from clients that use it.”',
      concepts: [
        {
          term: 'Struktur og sekvens',
          body: [
            '`Context` har feltet `- IStrategy: strategy` og metoderne `+SetStrategy(IStrategy s): void` og `+Handle(): void` (slide 16). `<<interface>> IStrategy` har `Handle(): void`, og `ConcreteStrategy1` og `ConcreteStrategy2` realiserer interfacet. `Context` har en almindelig association til `IStrategy`.',
            'Sekvensen (slide 17): `setStrategy(c1)`, så `handle()`, som videresendes til `c1`; derefter `setStrategy(c2)` og `handle()`, som nu ender hos `c2`. Samme kald, forskellig adfærd. Slide 18: “The Strategy pattern enables the behavior of the context to be defined at runtime by delegating it to another object.”',
          ],
        },
        {
          term: 'SimUDuck: fra arv til Strategy',
          body: [
            'HFDP kapitel 1 og slide 24–27 bruger samme eksempel. En abstrakt `Duck` har `quack()`, `swim()` og `display()`; `MallardDuck` og `RedHeadDuck` arver. Så tilføjes `fly()` i `Duck`, og `RubberDuck` kommer til: den må skrive `quack(){ // squeak }` og `fly(){ //NoOp }`. Slide 24: “Newly added method (has to be implemented in every subclass)” og “Newly added subclass (does not quite match the initial assumptions about ‘is a’ Duck)”. `DecoyDuck` må gøre begge dele til NoOp (slide 25). Bogen: “A localized update to the code caused a non-local side effect (flying rubber ducks)!”',
            'Andet forsøg er interfaces: `Flyable` med `fly()` og `Quackable` med `quack()`, som kun de relevante ænder implementerer (slide 26). Det fjerner de flyvende gummiænder, men interfaces har ingen kode, så “quack and fly have to be implemented in every subclass”. HFDP: det “completely destroys code reuse for those behaviors” — en lille ændring i flyveadfærden skal laves i alle 48 flyvende ænder.',
            'Løsningen (slide 27): “Encapsulate varying behaviors into objects that can be composed (like lego) into Duck class.” `<<Interface>> FlyBehavior` realiseres af `FlyWithWings` og `FlyNoWay`; `<<Interface>> QuackBehavior` af `Quack`, `Squeak` og `Mute`. `Duck` har felterne `fly: FlyBehavior` og `quack: QuackBehavior` (komposition, fyldt rombe) og beholder `swim()` og `display()`, der ikke varierer. Subklasserne vælger adfærd i konstruktøren: `MallardDuck` får `new FlyWithWings()` og `new Quack()`, `RubberDuck` får `new FlyNoWay()` og `new Squeak()`.',
            'I bogen delegerer `Duck.performFly()` til `flyBehavior.fly()`, og setterne `setFlyBehavior()`/`setQuackBehavior()` gør det muligt at skifte adfærd på runtime: `ModelDuck` starter med `FlyNoWay` og får så `FlyRocketPowered` — output “I can’t fly” efterfulgt af “I’m flying with a rocket!”. “You can’t do THAT if the implementation lives inside the Duck class.”',
          ],
        },
        {
          term: 'De tre designprincipper',
          body: [
            '**Encapsulate what varies**: “Identify the aspects of your application that vary and separate them from what stays the same.” `fly()` og `quack()` varierer, så de trækkes ud af `Duck`. Bogen kalder det grundlaget for næsten alle mønstre: “All patterns provide a way to let some part of a system vary independently of all other parts.”',
            '**Program to an interface, not an implementation** — hvor “interface” betyder *supertype* (abstrakt klasse eller interface). `Animal animal = new Dog();` frem for `Dog d = new Dog();`, og helst får man objektet udefra. Det er tæt på [[dip|DIP]].',
            '**Favor composition over inheritance**: hver and *has-a* `FlyBehavior` og `QuackBehavior` og får sin adfærd ved at blive sammensat med det rigtige objekt i stedet for at arve den. Det giver to ting, arv ikke giver: en familie af algoritmer i sit eget sæt klasser, og adfærd der kan skiftes på runtime. Adfærdsklasserne kan også genbruges af andet end ænder — bogens eksempel er en *duck call*, som jægere bruger, og som ikke arver fra `Duck`.',
          ],
        },
        {
          term: 'Kursets øvrige eksempler',
          body: [
            '**Event logging** (slide 19): `SomeSubSystem` er context med property’en `public ILog Log {set; private get;}` og `NullLog` som default i konstruktøren. `DoYourThing()` kalder `Log.Log("Event occurred")`. `ConsoleLog` og `FileLog` implementerer `ILog`.',
            '**RTS-spil** (OO Basics s. 17, uge 1): en `Unit` har `setStrategy(s: IUnitStrategy)` og `unitSighted(enemy: Unit)`, der kalder `myStrategy.unitSighted(enemy)`. `EngageStrategy`, `RunAwayStragegy` og `DefendStrategy` realiserer `IUnitStrategy` og skriver “Attack!!!”, “Run away!” og “Stand up and fight!”. Slidet kalder det en “polymorph strategy”.',
            'Slide 20 nævner andre anvendelser: sorting, games og checks/rules. Lab-øvelsen **SuperSorter** (agendaen, slide 3) er sortering, hvor algoritmen er strategien.',
          ],
        },
        {
          term: 'Konsekvenser',
          body: [
            'Slide 21: **alternativ til sub-classing**, **eliminerer switch/case**, **flere klasser** (“stateless”), **antal mulige implementeringer**, og **overhead mellem Strategy og Context** — strategy-interfacet skal kunne håndtere alt fra simple til komplekse strategier.',
            'Nye strategier kan tilføjes uden at ændre context — det er [[ocp|OCP]]. At en `switch` over typen bliver til polymorfi, er også refactoringen *Replace Conditional with Polymorphism*, som [[refactoring|refactoring-slides]] forbinder med Strategy. HFDP indrømmer en svaghed: `new Quack()` i `MallardDuck`s konstruktør er programmering mod en implementering — det løser [[factory-method|Factory-mønstrene]] senere.',
          ],
        },
        {
          term: 'Strategy vs. Template Method',
          body: [
            'Slide 22: begge er behavioral og gør adfærden udvidelig. [[template-method|Template Method]] bruger **inheritance** og har “Behavior fixed at compile-time”. Strategy bruger **delegation**, og “Behavior can be changed at runtime”.',
            'I Template Method ligger skelettet fast i basisklassen, og subklassen udfylder enkelte trin. I Strategy implementerer strategiobjektet **hele** algoritmen — HFDP bruger netop dette til at forklare, at `Arrays.sort()` er Template Method og ikke Strategy. I bogens “fireside chat” er Strategy mere fleksibel og mindre afhængig, mens Template Method har mere kontrol, mindre duplikeret kode og færre objekter.',
          ],
        },
        {
          term: 'Arv vs. komposition',
          body: [
            'Duck-eksemplet er kursets argument: arv tvinger ny adfærd ned i alle subklasser, rene interfaces fjerner genbruget, mens adfærdsobjekter kan sammensættes frit. HFDP’s guru-dialog giver begrundelsen: der bruges mere tid på at vedligeholde og ændre software end på at udvikle den, så genbrug via arv er en dårlig handel, hvis den koster fleksibilitet.',
            'Men komposition har også en pris: flere klasser, en indirektion mere, og nogen skal vælge og oprette strategien. [[template-method|Template Method]] viser, at arv er det rigtige, når skelettet *skal* ligge fast. HFDP (kap. 10): “think of the Strategy Pattern as a flexible alternative to subclassing; if you use inheritance to define the behavior of a class, then you’re stuck with that behavior even if you need to change it.”',
          ],
        },
        {
          term: 'Strategy vs. State',
          body: [
            'Klassediagrammerne er næsten ens (W08b s. 8), men intentionen er forskellig. [[state|State]] bruges til at modellere et system med tilstande; klienten må ikke ændre tilstanden — overgangene sker i tilstandene selv. Strategy bruges til at ændre adfærden af en del af programmet, og **klienten må gerne** skifte algoritme (W08b s. 10).',
            'W08b s. 11: begge bruger et polymorfisk kald, men i State fører kaldet ofte til en ny tilstand og dermed ny adfærd; i Strategy ændrer kaldet typisk ikke contextens adfærd. HFDP: med Strategy vælger klienten normalt strategien, og ofte er én strategi den rette for et objekt hele vejen — `MallardDuck` flyver, `RubberDuck` gør ikke.',
          ],
        },
      ],
      viz: 'strategy',
      keyPoints: [
        'Intent: en familie af algoritmer, hver indkapslet, udskiftelige på runtime.',
        'Context *has-a* `IStrategy` og delegerer; `SetStrategy(...)` bytter algoritmen.',
        'Duck: arv → NoOp-metoder; interfaces → intet genbrug; Strategy → `FlyBehavior`/`QuackBehavior`.',
        'Principper: encapsulate what varies, program to an interface, favor composition over inheritance.',
        'Konsekvenser: alternativ til subclassing, ingen switch/case, men flere klasser og overhead mellem Context og Strategy.',
        'Vs. Template Method: delegation og hele algoritmen byttes vs. arv og enkelte trin.',
        'Vs. State: klienten vælger strategien; i State skifter tilstandene selv.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Event logging: Strategy med en Null-default',
          source: 'GoF Template Method, GoF Strategy.pdf s. 19',
          code: `class SomeSubSystem
{
  public ILog Log {set; private get;}

  public SomeSubSystem()
  {
    Log = new NullLog(); // Default
  }

  public void DoYourThing()
  {
    Log.Log("Event occurred");
  }
}

interface ILog
{
  void Log(string s);
}

class ConsoleLog : ILog
{
  public void Log(string s)
  {
    Console.WriteLine(s);
  }
}

class FileLog : ILog
{
  ...
}`,
        },
        {
          lang: 'csharp',
          title: 'SimUDuck med adfærd, der skiftes på runtime',
          source: 'HFDP PDF s. 56–59 (bogens s. 18–21) — Java i bogen',
          code: `public interface IFlyBehavior { void Fly(); }

public class FlyWithWings : IFlyBehavior
{
    public void Fly() => Console.WriteLine("I'm flying!!");
}

public class FlyNoWay : IFlyBehavior
{
    public void Fly() => Console.WriteLine("I can't fly");
}

public class FlyRocketPowered : IFlyBehavior
{
    public void Fly() => Console.WriteLine("I'm flying with a rocket!");
}

// Bogens metode hedder quack(), men i C# må en metode ikke hedde det samme
// som sin klasse (Quack), så interfacets metode hedder her MakeQuack().
public interface IQuackBehavior { void MakeQuack(); }

public class Quack : IQuackBehavior
{
    public void MakeQuack() => Console.WriteLine("Quack");
}

public abstract class Duck
{
    protected IFlyBehavior flyBehavior;
    protected IQuackBehavior quackBehavior;

    public abstract void Display();

    public void PerformFly() => flyBehavior.Fly();       // delegation
    public void PerformQuack() => quackBehavior.MakeQuack(); // delegation

    public void SetFlyBehavior(IFlyBehavior fb) => flyBehavior = fb;
    public void SetQuackBehavior(IQuackBehavior qb) => quackBehavior = qb;

    public void Swim() => Console.WriteLine("All ducks float, even decoys!");
}

public class ModelDuck : Duck
{
    public ModelDuck()
    {
        flyBehavior = new FlyNoWay();
        quackBehavior = new Quack();
    }

    public override void Display() => Console.WriteLine("I'm a model duck");
}

// MiniDuckSimulator
Duck model = new ModelDuck();
model.PerformFly();                              // I can't fly
model.SetFlyBehavior(new FlyRocketPowered());
model.PerformFly();                              // I'm flying with a rocket!`,
        },
      ],
      exam: [
        'Strategy definerer en familie af algoritmer, indkapsler hver enkelt og gør dem udskiftelige på runtime. Context holder en reference til et strategy-interface og delegerer til det, så `SetStrategy` kan skifte adfærd uden at ændre context.',
        'Duck-eksemplet viser hvorfor: lægger man `fly()` i basisklassen, flyver gummiænderne, og med `Flyable`-interfaces skal flyvekoden skrives i hver and. Med `FlyBehavior` og `QuackBehavior` sammensættes hver and med sine adfærdsobjekter — composition over inheritance.',
        'Konsekvenserne er, at jeg slipper for `switch/case` og kan tilføje nye strategier uden at ændre context (OCP), men jeg får flere klasser, og interfacet mellem context og strategi skal kunne rumme både simple og komplekse strategier.',
        'Sammenlignet med Template Method bruger Strategy delegation i stedet for arv: Template Method fastlåser skelettet og lader subklasser udfylde trin på compile-time, mens Strategy bytter hele algoritmen på runtime.',
        'State har næsten samme struktur, men i State skifter tilstandene selv, og klienten må ikke; i Strategy er det netop klienten, der vælger algoritmen.',
      ],
      sources: [
        { path: m('slides/SW4SWD-01_W07.1_GoF_Template_Method_Strategy.md'), original: 'GoF Template Method, GoF Strategy.pdf', pages: 's. 15–27' },
        { path: m('bog/SW4SWD-01_HFDP_Ch01_Strategy.md'), original: HFDP, pages: 'PDF s. 42–62 (bogens s. 4–24)', note: 'SimUDuck, de tre principper (PDF s. 47, 49–50, 61), definition PDF s. 62' },
        { path: m('bog/SW4SWD-01_HFDP_Ch08_Template_Method.md'), original: HFDP, pages: 'PDF s. 345, 348–349 (bogens s. 307, 310–311)', note: 'Arrays.sort er ikke Strategy; fireside chat' },
        { path: m('slides/SW4SWD-01_W08b_State_Nested_Orthogonal.md'), original: 'Patterns - NestedOrthogonal - Copy.pdf', pages: 's. 8–11', note: 'State vs. Strategy' },
        { path: m('bog/SW4SWD-01_HFDP_Ch10_State.md'), original: HFDP, pages: 'PDF s. 445 (bogens s. 407)', note: 'Strategy som fleksibelt alternativ til subclassing' },
        { path: m('slides/SW4SWD-01_W01.1b_OO_Basics.md'), original: 'OO Basic.pdf', pages: 's. 15–17', note: 'RTS-spillet med IUnitStrategy' },
        { path: m('slides/SW4SWD-01_W09.1_Refactoring.md'), original: 'Refactoring.pdf', pages: 's. 12', note: 'Replace conditional with polymorphism — Strategy pattern' },
      ],
      gaps: [
        'Slidenes intent slutter med “interchangeable at runtime” (s. 15); HFDP og W08b s. 9 bruger “Strategy lets the algorithm vary independently from clients that use it”.',
        'Slide 27 viser `Duck` med offentlige felter `+ fly` og `+ quack`, men ingen settere — runtime-skift vises kun i HFDP (`setFlyBehavior`, PDF s. 58–59). Slide 27 viser stadig de gamle metodekroppe `quack(){ // squeak }` og `fly(){ //NoOp }` i `RubberDuck` og `DecoyDuck`, selv om adfærden nu komponeres. Slidet kalder den tavse adfærd `Mute`, bogen `MuteQuack`.',
        '`NullLog` på slide 19 er ikke vist, og `FileLog` er kun `...`. Konsekvenserne på slide 21 er stikord uden forklaring.',
        'Lab-øvelsen “SuperSorter” står kun på agendaen (slide 3); opgaveteksten er ikke i materialet.',
        'RTS-slidet (OO Basic s. 17) skriver `cout «` i noterne (C++-stil) og staver “RunAwayStragegy”.',
        'Tabellen “Template Method vs. Strategy” og afsnittet “Hvornår skal man ikke bruge Strategy” i markdown-konverteringen af W07.1 er konverterens egne, ikke slidenes.',
      ],
      keywords: ['Strategy', 'strategy pattern', 'strategi', 'Context', 'IStrategy', 'ConcreteStrategy', 'SetStrategy', 'delegation', 'komposition', 'composition over inheritance', 'arv vs komposition', 'has-a', 'is-a', 'encapsulate what varies', 'program to an interface', 'SimUDuck', 'Duck', 'FlyBehavior', 'QuackBehavior', 'FlyWithWings', 'FlyNoWay', 'FlyRocketPowered', 'ModelDuck', 'RubberDuck', 'DecoyDuck', 'ILog', 'NullLog', 'IUnitStrategy', 'SuperSorter', 'runtime', 'switch/case', 'Strategy vs State', 'Strategy vs Template Method'],
    },

    ...moenstreB,
  ],
}
