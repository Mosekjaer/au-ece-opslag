import type { Topic } from '../types'
import { m } from './paths'

const HFDP = 'SWD_Head-First-Design-Patterns-2nd-Edition.pdf'
const W072 = 'GoF Factory Method, Gof Abstract Factory.pdf'
const W08A = 'Patterns - State.pdf'
const W08B = 'Patterns - NestedOrthogonal - Copy.pdf'

export const moenstreB: Topic[] = [
  {
    slug: 'factory-method',
    title: 'GoF Factory Method',
    short: 'Factory Method',
    week: 'Uge 7 · W07.2',
    definition:
      '**Factory Method** definerer et interface til at oprette et objekt, men lader de klasser, der implementerer interfacet, bestemme, hvilket objekt der instantieres. Mekanismen er **arv**: basisklassen (Creator) kalder sin egen abstrakte factory-metode og arbejder videre på resultatet, mens subklassen (ConcreteCreator) afgør den konkrete klasse. HFDP formulerer det sådan, at klassen *udskyder instantieringen til sine subklasser*.',
    intro: [
      'Factories har i kurset to mål: at adskille oprettelsen af et objekt fra brugen af det (**SRP**) og at gøre oprettelseskoden åben for udvidelse, men lukket for ændring (**OCP**). Factory Method er den ene af de to klassiske factories, som lektionen gennemgår. Den anden er [[abstract-factory|Abstract Factory]].',
    ],
    concepts: [
      {
        term: 'Problemet: new binder til det konkrete',
        body: [
          'HFDP åbner kapitlet med “When you see ‘new,’ think ‘concrete.’” Hvert `new` binder koden til en konkret klasse. Står valget i en `if`-kæde (`MallardDuck`, `DecoyDuck`, `RubberDuck`), skal koden åbnes igen, hver gang der kommer en ny type. Samme kæde har det med at dukke op flere steder i applikationen.',
          'Slidenes motivation er et `Document` med feltet `pages: List<Page>`, hvor `Page` er et interface med implementeringerne `Introduction`, `TableOfContents`, `Body`, `Conclusion`, `Abstract` og `Resume`. Noterne på slidet siger: “in theory” skal `Document` kun afhænge af `Page`; “in practice” afhænger den af de konkrete sider, fordi konstruktøren selv skriver `pages.Add(new Abstract())` og `pages.Add(new Resume())`.',
          'I W08a (s. 3) vender eksemplet tilbage løst med Factory Method: `Document` har `# CreatePages() : List<Page>`, og subklasserne `ShortVersion` og `LongVersion` bestemmer hver deres sider.',
        ],
      },
      {
        term: 'Roller',
        body: [
          '**Creator** er den abstrakte klasse med factory-metoden og den kode, der arbejder på produktet. **ConcreteCreator** implementerer factory-metoden og er den eneste klasse, der ved, hvordan produkterne laves. **Product** er det fælles interface, Creator-koden er skrevet imod, og **ConcreteProduct** er de faktiske klasser.',
          'HFDP præciserer ordet “decide”: subklassen træffer ingen beslutning på runtime. Beslutningen ligger i, *hvilken subklasse man vælger at bruge*. Set fra `orderPizza()` er det dog subklassen, der bestemmer, hvilken pizza der bliver lavet.',
        ],
      },
      {
        term: 'Kursets eksempel: TV-pakker',
        body: [
          '`Package` er Creator med feltet `_channels: List<Channel>`, konstruktøren `Package()` og den abstrakte, beskyttede `# CreateChannels(): List<Channel>` (kursiv i diagrammet). Konstruktøren kalder `_channels = CreateChannels()`. `Sport` returnerer `Viasport` og `Eurosport`; `News` returnerer `BBC`, `DR`, `TV2` og `Channel5`. Alle seks realiserer `<<Interface>> Channel`.',
          '`Package` kender kun `Channel`. En ny pakke er en ny subklasse, og `Package` røres ikke — slidet markerer begge mål, SRP og OCP, som opfyldt.',
        ],
      },
      {
        term: 'HFDP: fra Simple Factory til Factory Method',
        body: [
          'Pizzabutikkens `orderPizza()` blander det, der varierer (hvilken pizza), med det, der er fast (`prepare`, `bake`, `cut`, `box`). Første skridt er en **Simple Factory**: `if`-kæden flyttes over i `SimplePizzaFactory.createPizza(type)`, som butikken er komponeret med. HFDP kalder den “more of a programming idiom” end et mønster. En *static factory* sparer instantieringen, men kan ikke subklasses.',
          'Factory Method trækker `createPizza()` tilbage ind i `PizzaStore` som en abstrakt metode. `NYPizzaStore` og `ChicagoPizzaStore` implementerer den, og `orderPizza()` ved ikke, hvilken konkret pizza den får. Forskellen fra Simple Factory: Simple Factory er “a one-shot deal”, Factory Method er et framework, hvor subklasserne bestemmer implementeringen.',
          '`createPizza(String type)` er en **parameterized factory method**; begge former, med og uden parameter, er gyldige. Prisen er typesikkerhed: en `"CalmPizza"` giver først en runtime-fejl. Mønsteret er også nyttigt med kun én ConcreteCreator, fordi produktets implementering er afkoblet fra brugen.',
        ],
      },
      {
        term: 'Factory Method og DIP',
        body: [
          'HFDP introducerer [[dip|DIP]] i samme kapitel og bruger Factory Method som vejen dertil: i den “very dependent” butik afhænger `PizzaStore` af otte konkrete pizzaklasser; efter Factory Method afhænger både butikken og pizzaerne af den abstrakte `Pizza`. Princippet og bogens retningslinjer står under [[dip|DIP]].',
        ],
      },
      {
        term: 'Factory Method og Template Method',
        body: [
          'Slidet “Discussion” (s. 8) stiller spørgsmålet uden at svare: hvad er forskellen på [[template-method|Template Method]] og Factory Method? Strukturen er den samme — en metode i basisklassen kalder en abstrakt metode, som subklassen implementerer.',
          'HFDP giver svaret i kapitel 8: “Factory Method is a specialization of Template Method”, en specialisering, hvor de primitive operationer opretter og returnerer objekter. `orderPizza()` er skelettet, `createPizza()` er det trin, subklassen udfylder. Template Method varierer et *trin i en algoritme*; Factory Method varierer, *hvilket objekt der oprettes*.',
        ],
      },
      {
        term: 'Factory Method vs. Abstract Factory',
        body: [
          'Spørgsmålet er, **hvem der beslutter**, hvilken klasse der oprettes. I Factory Method er det **subklassen** gennem arv: man vælger `Sport` eller `NYPizzaStore`, og så er produkterne givet. I [[abstract-factory|Abstract Factory]] er det et **factory-objekt**, som klienten får injiceret, og det laver en hel **familie** af produkter.',
          'HFDP’s interview mellem de to mønstre siger det kort: Factory Method “I use classes to create and you use objects” — arv mod komposition. Factory Method har én metode og ét produkt; Abstract Factory har én metode pr. produkt i familien. Metoderne i en Abstract Factory er ofte selv implementeret som factory methods.',
        ],
      },
    ],
    viz: 'factory-method',
    keyPoints: [
      'Intent: et interface til at oprette et objekt; subklasserne afgør, hvilken klasse der instantieres.',
      'Mekanismen er arv: Creator kalder en abstrakt factory-metode, ConcreteCreator implementerer den.',
      'Mål: adskil oprettelse fra brug (SRP) og tilføj nye produkter uden at ændre Creator (OCP).',
      '“When you see new, think concrete” — Factory Method flytter `new` ud af den kode, der bruger objektet.',
      'Simple Factory er et idiom, ikke et GoF-mønster.',
      'Factory Method er en specialisering af Template Method, hvor trinnet opretter et objekt.',
      'Vs. Abstract Factory: subklasse via arv og ét produkt mod injiceret objekt og en familie af produkter.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'Package er Creator, Sport og News bestemmer kanalerne',
        source: `${W072} s. 7 (abstract på Package tilføjet, se huller)`,
        code: `abstract class Package
{
    private List<Channel> _channels;

    public Package()
    {
        _channels = CreateChannels();   // factory method
    }

    protected abstract List<Channel> CreateChannels();
}

class Sport : Package
{
    protected override List<Channel> CreateChannels()
    {
        var channels = new List<Channel>();
        channels.Add(new Viasport());
        channels.Add(new Eurosport());
        return channels;
    }
}

class News : Package
{
    protected override List<Channel> CreateChannels()
    {
        var channels = new List<Channel>();
        channels.Add(new BBC());
        channels.Add(new DR());
        channels.Add(new TV2());
        channels.Add(new Channel5());
        return channels;
    }
}`,
      },
      {
        lang: 'csharp',
        title: 'PizzaStore: orderPizza er skelettet, createPizza er factory-metoden',
        source: `HFDP, ${HFDP} PDF s. 163 og 161 (bogens s. 125 og 123) — Java i bogen`,
        code: `public abstract class PizzaStore
{
    public Pizza OrderPizza(string type)
    {
        Pizza pizza = CreatePizza(type);
        pizza.Prepare();
        pizza.Bake();
        pizza.Cut();
        pizza.Box();
        return pizza;
    }

    protected abstract Pizza CreatePizza(string type);
}

public class NYPizzaStore : PizzaStore
{
    protected override Pizza CreatePizza(string item)
    {
        if (item == "cheese") return new NYStyleCheesePizza();
        else if (item == "veggie") return new NYStyleVeggiePizza();
        else if (item == "clam") return new NYStyleClamPizza();
        else if (item == "pepperoni") return new NYStylePepperoniPizza();
        else return null;
    }
}`,
      },
    ],
    exam: [
      'Factory Method definerer et interface til at oprette et objekt, men lader subklasserne bestemme, hvilken klasse der instantieres. Basisklassen kalder sin egen abstrakte factory-metode og arbejder videre på resultatet uden at kende den konkrete type.',
      'Formålet er at adskille oprettelse fra brug, så klassen overholder SRP, og at kunne tilføje nye produkter ved at skrive en ny subklasse uden at ændre basisklassen, så den overholder OCP. Det er også en måde at opfylde DIP på: både butikken og pizzaerne afhænger af abstraktionen `Pizza`.',
      'Kursets eksempel er TV-pakkerne: `Package` kalder `CreateChannels()` i sin konstruktør, og `Sport` returnerer Viasport og Eurosport, mens `News` returnerer BBC, DR, TV2 og Channel 5. I HFDP er det `PizzaStore.orderPizza()`, der kalder `createPizza()`, som `NYPizzaStore` og `ChicagoPizzaStore` implementerer.',
      'Strukturelt ligner det Template Method, og HFDP kalder Factory Method en specialisering af den, hvor trinnet opretter et objekt. Forskellen til Abstract Factory er, hvem der beslutter: i Factory Method er det subklassen gennem arv; i Abstract Factory er det et injiceret factory-objekt, der laver en hel familie af produkter.',
      'Afvejningen er en ny subklasse pr. variation og en beslutning, der ligger fast, når man har valgt subklassen. Til gengæld behøver Creator aldrig ændres.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W07.2_GoF_Factory_Abstract_Factory.md'), original: W072, pages: 's. 3–8', note: 'PDF-sidetal; slidenes egen nummerering i bunden ligger én højere fra s. 3.' },
      { path: m('slides/SW4SWD-01_W08a_GoF_State.md'), original: W08A, pages: 's. 3', note: '“Previously… Factory Method”: Document med ShortVersion/LongVersion' },
      { path: m('bog/SW4SWD-01_HFDP_Ch04_Factory.md'), original: HFDP, pages: 'PDF s. 148–181, 196–198 (bogens s. 110–143, 158–160)' },
      { path: m('bog/SW4SWD-01_HFDP_Ch08_Template_Method.md'), original: HFDP, pages: 'PDF s. 345, 351 (bogens s. 307, 313)', note: 'Factory Method som specialisering af Template Method' },
    ],
    gaps: [
      'Koden på slidet (s. 7) erklærer `class Package` uden `abstract`, selv om den har en abstrakt metode — den kompilerer ikke. `News` skriver `new List<Channels>()` med s. Koden ovenfor er rettet.',
      'Slidets definition siger “the classes that implement the interface decide”; HFDP og GoF siger “subclasses decide”. Eksemplerne bruger arv i begge kilder.',
      'Motivationsslidet (s. 4) viser koden `var pages = …; return pages;` som konstruktørens indhold, men en konstruktør kan ikke returnere en værdi. Linket “Source” peger på `diagrams/motivation.drawio`, som ikke er en del af materialet.',
      'Diskussionsslidet (s. 8) om Template Method vs. Factory Method har intet svar i slidene; svaret står kun i HFDP kap. 8 (PDF s. 345, 351).',
      'I W08a s. 3 hedder feltet i `Document` `_document: List<Page>`, ikke `pages` som i W07.2.',
      'Uden for materialet: `Package()` kalder den abstrakte `CreateChannels()` fra konstruktøren. I C# kører subklassens override, før subklassens egen konstruktør har kørt, så den må ikke afhænge af subklassens felter. Materialet nævner det ikke.',
    ],
    keywords: ['factory method', 'fabriksmetode', 'creator', 'concrete creator', 'product', 'creational pattern', 'Package', 'Sport', 'News', 'Channel', 'CreateChannels', 'PizzaStore', 'createPizza', 'orderPizza', 'Simple Factory', 'static factory', 'parameterized factory method', 'Document', 'Page', 'CreatePages', 'defer instantiation', 'new er konkret', 'DIP', 'dependency inversion', 'template method'],
  },

  {
    slug: 'abstract-factory',
    title: 'GoF Abstract Factory',
    short: 'Abstract Factory',
    week: 'Uge 7 · W07.2',
    definition:
      '**Abstract Factory** definerer et interface til at oprette *familier* af relaterede eller afhængige objekter uden at angive deres konkrete klasser. Klienten får et factory-objekt injiceret og beder det om hvert enkelt produkt. Hvilken familie der bygges, afgøres af, hvilken konkret factory der sendes ind — ikke af klienten.',
    concepts: [
      {
        term: 'Roller',
        body: [
          'Slidets diagram (s. 10) har en **Client**, en **AbstractFactory** med `CreateProductA()` og `CreateProductB()`, to **ConcreteFactories** (`ConcreteFactory1`, `ConcreteFactory2`) og to **AbstractProducts** (`AbstractProductA`, `AbstractProductB`) med hver to konkrete produkter (`ProductA1`, `ProductA2`, `ProductB1`, `ProductB2`). De stiplede pile viser, hvilken factory der laver hvilket produkt.',
          'HFDP: “The Client is written against the abstract factory and then composed at runtime with an actual factory.” Hver konkret factory kan producere et helt sæt produkter, så klienten aldrig selv skal instantiere et produkt.',
        ],
      },
      {
        term: 'WeighingSystem: fra new til DIP',
        body: [
          '`FøtexWeighingSystem` opretter selv `FøtexWeighingUnit`, `FøtexPrinter` og `FøtexDisplay` i konstruktøren. Efter [[dip|DIP]] tager `WeighingSystem` imod `IWeighingUnit`, `IPrinter` og `IDisplay`, og `Main` giver de konkrete klasser. Diagrammet på s. 12 har en Føtex- og en Netto-variant af hver del.',
          'Slidet spørger: “how many different WeighingSystems can now be created?” Diagrammet giver 2 · 2 · 2 = 8 kombinationer, men kun to af dem er rigtige vægte.',
        ],
      },
      {
        term: 'Uden Abstract Factory: fejlbehæftet',
        body: [
          '“Creation of WeighingSystem variants is complex and error prone.” Slidet (s. 13) viser en Netto-vægt, der oprettes med `new NettoWeighingUnit()`, `new NettoPrinter()` og `new FøtexDisplay()`. En pil fra den sidste linje peger på et billede af flammer. Alle tre argumenter opfylder deres interface, så intet stopper fejlen.',
        ],
      },
      {
        term: 'Med Abstract Factory',
        body: [
          '`IWeighingSystemFactory` har `CreateWeighingUnit(): IWeighingUnit`, `CreatePrinter(): IPrinter` og `CreateDisplay(): IDisplay`. `FøtexFactory` og `NettoFactory` implementerer den og returnerer hver deres tre produkter. `WeighingSystem(IWeighingSystemFactory factory)` henter sine tre dele fra factoryen, og `Main` skriver kun `new WeighingSystem(new NettoFactory())`.',
          'Slidet: “we can isolate the complex creation of object families in factory classes”. Familien kan ikke længere blandes, fordi det er factoryen og ikke klienten, der vælger de enkelte klasser.',
        ],
      },
      {
        term: 'CompressionStocking: produkter der afhænger af hinanden',
        body: [
          'Mønsteret er “especially handy when the family of products *depend* on each other in different ways”. Eksemplet er kompressionsstrømpen fra SOLID-øvelsen: `StockingCtrl` bruger `ICompressionMechanism`, som `AirCompressionMechanism` (med `IPump`/`Pump`) og `LaceCompressionMechanism` (med `ILaceDevice`/`LaceDevice`) implementerer.',
          'Uden factory har `StockingCtrl` en `enum CompressionMethod { AIR, LACES }` og en `switch` i konstruktøren: `new AirCompressionMechanism(new Pump(), 5000, 2000)` eller `new LaceCompressionMechanism(new LaceDevice(), 40, 100)`. “Adding new compression methods is a mess – violates OCP.”',
          'Med `IStockingFactory.CreateCompressionMechanism()` og de to factories `AirStockingFactory` og `LaceStockingFactory` flyttes både den konkrete klasse og konstruktørargumenterne ud. Den injicerede factory gør `StockingCtrl` “oblivious to the compression mechanism (air or laces) and to the constructor arguments”. Nye kompressionsmetoder er nye factories — “adheres to OCP!”',
        ],
      },
      {
        term: 'HFDP: ingrediensfabrikkerne',
        body: [
          'Franchisetagerne snyder med ingredienserne, så HFDP indfører `PizzaIngredientFactory` med `createDough()`, `createSauce()`, `createCheese()`, `createVeggies()`, `createPepperoni()` og `createClam()`. New York-fabrikken giver `ThinCrustDough`, `MarinaraSauce`, `ReggianoCheese` og `FreshClams`; Chicago-fabrikken giver `ThickCrustDough`, `PlumTomatoSauce`, `MozzarellaCheese` og `FrozenClams`. `SlicedPepperoni` deles af begge.',
          '`CheesePizza` får en ingrediensfabrik i konstruktøren og henter dej, sauce og ost fra den i `prepare()`. Dermed forsvinder `NYStyleCheesePizza` og `ChicagoStyleCheesePizza`; der er én `CheesePizza`, og de regionale forskelle ligger i fabrikken. `NYPizzaStore.createPizza()` — stadig en factory method — opretter `NYPizzaIngredientFactory` og giver den til pizzaen. De to mønstre bruges altså sammen.',
        ],
      },
      {
        term: 'Abstract Factory vs. Factory Method',
        body: [
          'Forskellen er, **hvem der beslutter**, hvilken klasse der oprettes. I [[factory-method|Factory Method]] er det en **subklasse** gennem arv, og den laver ét produkt. I Abstract Factory er det et **objekt**, som klienten får injiceret gennem komposition, og det laver en **familie** af produkter, der hører sammen.',
          'HFDP’s interview mellem de to mønstre: Factory Method skaber “through inheritance”, Abstract Factory “through object composition”. Abstract Factorys metoder er ofte implementeret som factory methods. Prisen for familien er et stort interface: “my interface has to change if new products are added” — et nyt produkt i familien ændrer interfacet og dermed alle konkrete fabrikker.',
          'HFDP’s råd: brug Abstract Factory, når du har familier af produkter og vil sikre, at klienten bruger produkter, der hører sammen. Brug Factory Method, når du vil afkoble klientkoden fra de konkrete klasser, eller ikke kender dem alle på forhånd.',
        ],
      },
      {
        term: 'Andre creational patterns',
        body: [
          'Slidet “Other factories” (s. 20) nævner tre med citater fra Wikipedia. **Builder** adskiller konstruktionen af et komplekst objekt fra dets repræsentation, så samme konstruktionsproces kan give forskellige repræsentationer. **Singleton** sikrer én instans og et globalt adgangspunkt. **Prototype** opretter nye objekter ved at kopiere en prototypisk instans.',
        ],
      },
    ],
    viz: 'abstract-factory',
    keyPoints: [
      'Intent: et interface til at oprette familier af relaterede eller afhængige objekter uden at nævne de konkrete klasser.',
      'Én create-metode pr. produkttype, én konkret factory pr. familie.',
      'Mekanismen er komposition: factory-objektet injiceres i klienten.',
      'Løser det, DIP alene ikke gør: familier, der ikke må blandes (Netto-vægt med Føtex-display).',
      'Flytter konstruktørargumenter og afhængigheder ud af klienten (StockingCtrl).',
      'Nye familier er nye factories (OCP); nye produkttyper ændrer interfacet og alle factories (HFDP).',
      'Vs. Factory Method: injiceret objekt og en familie mod subklasse og ét produkt.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'WeighingSystem får sine dele fra en injiceret factory',
        source: `${W072} s. 15`,
        code: `public class FøtexFactory : IWeighingSystemFactory
{
    public IWeighingUnit CreateWeighingUnit() { return new FøtexWeighingUnit(); }
    public IDisplay CreateDisplay() { return new FøtexDisplay(); }
    public IPrinter CreatePrinter() { return new FøtexPrinter(); }
}

public class NettoFactory : IWeighingSystemFactory
{
    public IWeighingUnit CreateWeighingUnit() { return new NettoWeighingUnit(); }
    public IDisplay CreateDisplay() { return new NettoDisplay(); }
    public IPrinter CreatePrinter() { return new NettoPrinter(); }
}

public class WeighingSystem
{
    private IWeighingUnit _weighingUnit;
    private IPrinter _printer;
    private IDisplay _display;

    public WeighingSystem(IWeighingSystemFactory factory)
    {
        _weighingUnit = factory.CreateWeighingUnit();
        _printer = factory.CreatePrinter();
        _display = factory.CreateDisplay();
    }
}

// Create a Netto weight
var nettoWs = new WeighingSystem(new NettoFactory());`,
      },
      {
        lang: 'csharp',
        title: 'StockingCtrl før og efter: switch mod injiceret factory',
        source: `${W072} s. 17–19 (metodenavnet rettet, se huller)`,
        code: `// Før (s. 17): violates OCP
public StockingCtrl(CompressionMethod method)
{
    switch (method)
    {
        case CompressionMethod.AIR:
            _compressionMechanism = new AirCompressionMechanism(new Pump(), 5000, 2000);
            break;
        case CompressionMethod.LACES:
            _compressionMechanism = new LaceCompressionMechanism(new LaceDevice(), 40, 100);
            break;
    }
}

// Efter (s. 18–19)
class AirStockingFactory : IStockingFactory
{
    public ICompressionMechanism CreateCompressionMechanism()
    {
        // Connect and return AIR compression mechanism parts
        return new AirCompressionMechanism(new Pump(), 5000, 2000);
    }
}

class StockingCtrl
{
    ICompressionMechanism _compressionMechanism;

    public StockingCtrl(IStockingFactory factory)
    {
        _compressionMechanism = factory.CreateCompressionMechanism();
    }
}`,
      },
      {
        lang: 'csharp',
        title: 'HFDP: ingrediensfabrikken for New York',
        source: `HFDP, ${HFDP} PDF s. 184–185 (bogens s. 146–147) — Java i bogen`,
        code: `public interface IPizzaIngredientFactory
{
    Dough CreateDough();
    Sauce CreateSauce();
    Cheese CreateCheese();
    Veggies[] CreateVeggies();
    Pepperoni CreatePepperoni();
    Clams CreateClam();
}

public class NYPizzaIngredientFactory : IPizzaIngredientFactory
{
    public Dough CreateDough() { return new ThinCrustDough(); }
    public Sauce CreateSauce() { return new MarinaraSauce(); }
    public Cheese CreateCheese() { return new ReggianoCheese(); }
    public Veggies[] CreateVeggies()
    {
        return new Veggies[] { new Garlic(), new Onion(), new Mushroom(), new RedPepper() };
    }
    public Pepperoni CreatePepperoni() { return new SlicedPepperoni(); }
    public Clams CreateClam() { return new FreshClams(); }
}`,
      },
    ],
    exam: [
      'Abstract Factory definerer et interface til at oprette familier af relaterede eller afhængige objekter uden at angive deres konkrete klasser. Klienten får en konkret factory injiceret og beder den om hvert produkt.',
      'Kursets eksempel er vejesystemet: efter DIP tager `WeighingSystem` imod en vejeenhed, en printer og et display, men så kan man bygge otte kombinationer, og slidet viser en Netto-vægt med et Føtex-display. Med `IWeighingSystemFactory` og en `FøtexFactory` og en `NettoFactory` kan familien ikke blandes, og `Main` skriver bare `new WeighingSystem(new NettoFactory())`.',
      'I kompressionsstrømpen fjerner mønsteret en `switch` og de magiske konstruktørargumenter fra `StockingCtrl`. En ny kompressionsmetode er en ny factory, så `StockingCtrl` overholder OCP.',
      'Forskellen til Factory Method er, hvem der beslutter: i Factory Method en subklasse via arv, der laver ét produkt; i Abstract Factory et injiceret objekt via komposition, der laver en hel familie. De bruges ofte sammen — i HFDP er `NYPizzaStore.createPizza()` en factory method, der giver pizzaen en ingrediensfabrik.',
      'Afvejningen, som HFDP nævner: en ny familie er gratis, men et nyt produkt i familien ændrer interfacet og alle de konkrete factories.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W07.2_GoF_Factory_Abstract_Factory.md'), original: W072, pages: 's. 3, 9–20', note: 'PDF-sidetal; slidenes egen nummerering i bunden ligger én højere fra s. 3.' },
      { path: m('slides/SW4SWD-01_W08a_GoF_State.md'), original: W08A, pages: 's. 4', note: '“Previously… Abstract Factory”' },
      { path: m('bog/SW4SWD-01_HFDP_Ch04_Factory.md'), original: HFDP, pages: 'PDF s. 184–199, 205 (bogens s. 146–161, 167)' },
    ],
    gaps: [
      'Slidet på s. 19 kalder `factory.CreateCompressionMechanish()` — en stavefejl for `CreateCompressionMechanism()`, som interfacet på s. 18 erklærer. Interfacet står der som `CreateCompressionMechanism(): ICompressionMechanism()` med parenteser efter returtypen.',
      'Spørgsmålet på s. 12 (“how many different WeighingSystems can now be created?”) besvares ikke på slidene; 2 · 2 · 2 = 8 er regnet ud fra diagrammet.',
      'Slidene nævner ikke ulempen ved nye produkttyper. Den står kun i HFDP (PDF s. 197): interfacet og alle konkrete fabrikker skal ændres.',
      'Builder, Singleton og Prototype (s. 20) er kun defineret med citater og diagrammer fra Wikipedia; der er ingen eksempler eller øvelser.',
    ],
    keywords: ['abstract factory', 'abstrakt fabrik', 'produktfamilie', 'families of related objects', 'creational pattern', 'concrete factory', 'abstract product', 'WeighingSystem', 'IWeighingSystemFactory', 'FøtexFactory', 'NettoFactory', 'CompressionStocking', 'StockingCtrl', 'IStockingFactory', 'AirStockingFactory', 'LaceStockingFactory', 'PizzaIngredientFactory', 'ingrediensfabrik', 'komposition', 'Builder', 'Singleton', 'Prototype', 'DIP', 'OCP'],
  },

  {
    slug: 'state',
    title: 'State machines og GoF State',
    short: 'GoF State',
    week: 'Uge 8 · W08a',
    definition:
      'En **state machine** (STM) er til enhver tid i én af en endelig mængde tilstande og skifter tilstand, når events indtræffer. **GoF State** implementerer den med én klasse pr. tilstand: “Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.” Konteksten peger altid på præcis ét tilstandsobjekt og delegerer al tilstandsafhængig adfærd til det.',
    intro: [
      'Lektionen gennemgår tre måder at mappe en STM til kode — switch/case, state/event-tabeller og GoF State — og argumenterer for, at de to første bliver uoverskuelige og svære at teste, når maskinen vokser. Nested og orthogonal states fortsætter i [[nested-orthogonal|W08b]]. I SWT testes tilstandsmaskiner black box, se [[swt/state-machines|tilstandsmaskiner i SWT]].',
    ],
    concepts: [
      {
        term: 'Tilstandsmaskiner i UML',
        body: [
          'Eksemplerne på slidet: en lyskontakt `{ ON | OFF }` og en proces `{ READY | RUNNING | BLOCKED }`. Et simpelt UML-tilstandsdiagram har tilstande (afrundede rektangler), transitioner (pile) og events. En transition skrives `trigger-signature [guard] / activity`.',
          'Eksemplet fra Sparx (s. 9) er `sm Protocol State Machine`: initial pseudo-state (udfyldt cirkel) → `Opened` via `Create/`, `Opened` → `Closed` via `Close/ [doorWay->isEmpty]`, `Closed` → `Opened` via `Open/`, `Closed` → `Locked` via `Lock/` og tilbage via `Unlock/`.',
        ],
      },
      {
        term: 'Switch/case',
        body: [
          '`FlashLight` har en `enum FlashLightState { On, Off }`, et felt `_currentState` og en `HandleEvent`, der switcher på den aktuelle tilstand og sætter den næste. Til to tilstande og ét event er det kort og læseligt.',
          'Med tilstanden `ON` delt i `Low` og `High` og et `MODE`-event (s. 13) kommer der en ekstra `enum PwrOnSubStates`, et ekstra felt og tre niveauer indlejrede `switch` — på tilstand, event og undertilstand. Slidet har en plakat ved siden af: “Keep calm and give up!”',
        ],
      },
      {
        term: 'Tabelbaseret',
        body: [
          'En state/event-tabel har en række pr. tilstand og en kolonne pr. event; cellen er `handling/næste tilstand`. I eksemplet med S1–S4 og E1–E4 betyder cellen `A1/S1` i række S4, kolonne E1: i S4 giver E1 handlingen A1 og en transition til S1. Række S3, kolonne E3 er `A2/S4`. En tom celle (`-`) betyder, at eventet ikke gør noget i tilstanden.',
          'Slidet “Pros and cons” spørger, hvordan switch/case og tabeller klarer sig på complexity, testability, maintainability, understandability og robustness, og svarer selv på s. 17: når STM’er bliver komplekse, bliver begge “very messy and extremely difficult to test”. Slidet “…but do STMs really get that complex?” (s. 18) viser et stort diagram med nested states i flere niveauer.',
        ],
      },
      {
        term: 'GoF State: struktur',
        body: [
          '**Context** er ejeren af tilstandsmaskinen. Den har feltet `curState: State`, event handlers (`eventAOccurred()` …), actions (`doAction1()` …) og `setState(s: State)`. Den abstrakte **State** har `onEnter()`, `onExit()` og en handler pr. event med kontekst som parameter, `handleEventA(c: Context)`. Slidet siger, at den typisk er en abstrakt klasse med tomme standardimplementeringer af alle handlers, og spørger “why?”.',
          'Hver konkret tilstand (`StateA`, `StateB`, `StateC`) overskriver kun de handlers, der betyder noget i den tilstand. Lygten mapper direkte: `FlashLight` har `SetState`, eventet `PWRPressed()` (“From GUI”) og actions `TurnLampOn()`/`TurnLampOff()`; `FlashLightState` har `HandlePWRPressed(light)`, som `Off` og `On` overskriver.',
          'Pointerne (s. 23): hver tilstand er en subklasse af en fælles abstrakt tilstand; konteksten refererer til præcis ét tilstandsobjekt; konteksten delegerer al tilstandsafhængig adfærd til det — “the context’s behavior is externalized in the states”. Tilstandsklasserne holdes tilstandsløse, så de kan være singletons.',
        ],
      },
      {
        term: 'Event reception og handling',
        body: [
          'Når konteksten modtager et event, sender den det straks videre til sit tilstandsobjekt. Skal der udføres en action, kalder tilstanden tilbage i konteksten. Skal der skiftes tilstand, kalder tilstanden også tilbage og sætter kontekstens nye tilstand. Slidet understreger: “The context is not responsible for setting the new state – the current state is!”',
          'Sekvensdiagrammet for lygten i `OFF` (s. 22): `PWRPressed()` → konteksten kalder `HandlePWRPressed(this)` på `offState : Off` → `Off` kalder `TurnLampOn()` på konteksten → konteksten kalder `TurnOn()` på `lamp : Lamp` → `Off` kalder `SetState(onState)`.',
          'HFDP er mindre kategorisk: tilstandene *kan* styre transitionerne, men konteksten kan også. Er transitionerne faste, passer de i konteksten; er de dynamiske, som gumball-maskinens valg mellem `NoQuarter` og `SoldOut` efter antallet af kugler, hører de hjemme i tilstandene. Prisen er afhængigheder mellem tilstandsklasserne.',
        ],
      },
      {
        term: 'Gumball: samme event, forskellig adfærd',
        body: [
          'HFDP’s gumball-maskine har tilstandene *No Quarter*, *Has Quarter*, *Gumball Sold* og *Out of Gumballs* og handlingerne *insert quarter*, *eject quarter*, *turn crank* og *dispense*. Første version har en `int`-konstant pr. tilstand og en `if`-kæde over alle tilstande i hver metode.',
          'Da “1 ud af 10”-spillet kræver en `WINNER`-tilstand, skal der en ny gren i hver eneste metode. Bogens diagnose: koden overholder ikke [[ocp|OCP]], transitionerne er begravet i betingelser, det der varierer er ikke indkapslet, og nye tilføjelser vil sandsynligvis give fejl i kode, der virkede.',
          'Med State-mønsteret er `GumballMachine` konteksten, der delegerer: `insertQuarter()` kalder `state.insertQuarter()`. I `NoQuarterState` accepteres mønten, og maskinen går til `HasQuarterState`; i `HasQuarterState` giver samme kald “You can’t insert another quarter”; i `SoldState` “Please wait, we’re already giving you a gumball”. HFDP bruger netop det eksempel til at forklare definitionen: objektet ser ud til at skifte klasse, men det er komposition — konteksten peger bare på et andet tilstandsobjekt.',
          'Gevinsten (HFDP): adfærden for hver tilstand er lokaliseret i sin klasse, `if`-sætningerne er væk, hver tilstand er lukket for ændring, og koden ligner diagrammet. Prisen er flere klasser — “the price you pay for flexibility”. Klienter taler aldrig direkte med tilstandene.',
        ],
      },
      {
        term: 'Sammenligning af implementeringerne',
        body: [
          'Switch/case og tabeller samler hele maskinen ét sted og er fine til små maskiner. GoF State giver én klasse pr. tilstand, så diagrammet kan læses direkte i koden, og hver tilstand kan testes for sig. Telefonøvelsen siger det direkte: “you can unit test each state to ensure that the transitions made and the actions taken are correct.”',
          'Samme event med forskellig adfærd går igen i telefonøvelsens diagram: *Call button pressed* giver `/call number` og `Calling` i `Idle`, men `/turn mic off, disconnect` og `Disconnecting` i `Connected`.',
        ],
      },
      {
        term: 'State vs. Strategy',
        body: [
          'Klassediagrammet er næsten det samme som [[strategy|Strategy]]: en kontekst delegerer polymorft til et udskifteligt objekt. Forskellen er intent. I State modellerer man et system med tilstande, og klienten må ikke ændre tilstanden — tilstandene selv skifter. I Strategy vælger klienten algoritmen og må gerne skifte den. HFDP: tænk på Strategy som et alternativ til subklassering, og på State som et alternativ til mange betingelser i konteksten. Den fulde sammenligning står under [[nested-orthogonal|nested og orthogonal states]].',
        ],
      },
    ],
    viz: 'state',
    keyPoints: [
      'En STM er altid i én af en endelig mængde tilstande og skifter ved events.',
      'UML-transition: `trigger-signature [guard] / activity`.',
      'Tre implementeringer: switch/case, state/event-tabel, GoF State.',
      'Switch/case og tabeller bliver “very messy and extremely difficult to test”, når maskinen vokser.',
      'GoF State: én klasse pr. tilstand; konteksten delegerer alle events til den aktuelle tilstand.',
      'Tilstanden udfører actions og sætter ny tilstand ved at kalde tilbage i konteksten (slidene).',
      'Tilstandsklasserne holdes tilstandsløse, så de kan deles.',
      'State vs. Strategy: samme struktur, men i State skifter tilstandene selv; i Strategy vælger klienten.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'Switch/case: lygten med to tilstande',
        source: `${W08A} s. 12`,
        code: `public class FlashLight
{
    public enum FlashLightEvent { PowerBtnPressed }
    enum FlashLightState { On, Off }

    private FlashLightState _currentState;

    public FlashLight()
    {
        _currentState = FlashLightState.Off;
    }

    public void HandleEvent(FlashLightEvent evt)
    {
        switch (_currentState)
        {
            case FlashLightState.On:
                _currentState = FlashLightState.Off;
                break;

            case FlashLightState.Off:
                _currentState = FlashLightState.On;
                break;
        }
    }
}`,
      },
      {
        lang: 'csharp',
        title: 'GoF State: lygten, skrevet ud fra klasse- og sekvensdiagrammet',
        source: `${W08A} s. 20–22 (slidene har ingen kode; navne og kald fra diagrammerne)`,
        code: `public class FlashLight
{
    private FlashLightState _state;
    private readonly Lamp _lamp;
    internal readonly Off OffState = new Off();
    internal readonly On OnState = new On();

    public FlashLight(Lamp lamp)
    {
        _lamp = lamp;
        _state = OffState;
    }

    public void SetState(FlashLightState s) { _state = s; }

    // From GUI
    public void PWRPressed() { _state.HandlePWRPressed(this); }

    // STM actions
    public void TurnLampOn() { _lamp.TurnOn(); }
    public void TurnLampOff() { _lamp.TurnOff(); }
}

public abstract class FlashLightState
{
    public virtual void OnEnter(FlashLight light) { }
    public virtual void OnExit(FlashLight light) { }
    public virtual void HandlePWRPressed(FlashLight light) { }
}

public class Off : FlashLightState
{
    public override void HandlePWRPressed(FlashLight light)
    {
        light.TurnLampOn();
        light.SetState(light.OnState);
    }
}

public class On : FlashLightState
{
    public override void HandlePWRPressed(FlashLight light)
    {
        light.TurnLampOff();
        light.SetState(light.OffState);
    }
}`,
      },
      {
        lang: 'csharp',
        title: 'HFDP: GumballMachine delegerer, NoQuarterState skifter tilstand',
        source: `HFDP, ${HFDP} PDF s. 435 og 437 (bogens s. 397 og 399) — Java i bogen`,
        code: `public class NoQuarterState : IState
{
    private readonly GumballMachine _gumballMachine;

    public NoQuarterState(GumballMachine gumballMachine)
    {
        _gumballMachine = gumballMachine;
    }

    public void InsertQuarter()
    {
        Console.WriteLine("You inserted a quarter");
        _gumballMachine.SetState(_gumballMachine.GetHasQuarterState());
    }

    public void EjectQuarter() { Console.WriteLine("You haven't inserted a quarter"); }
    public void TurnCrank() { Console.WriteLine("You turned, but there's no quarter"); }
    public void Dispense() { Console.WriteLine("You need to pay first"); }
}

public class GumballMachine
{
    IState soldOutState, noQuarterState, hasQuarterState, soldState;
    IState state;
    int count = 0;

    public GumballMachine(int numberGumballs)
    {
        soldOutState = new SoldOutState(this);
        noQuarterState = new NoQuarterState(this);
        hasQuarterState = new HasQuarterState(this);
        soldState = new SoldState(this);
        count = numberGumballs;
        state = numberGumballs > 0 ? noQuarterState : soldOutState;
    }

    public void InsertQuarter() { state.InsertQuarter(); }
    public void EjectQuarter() { state.EjectQuarter(); }
    public void TurnCrank() { state.TurnCrank(); state.Dispense(); }

    internal void SetState(IState state) { this.state = state; }
    // releaseBall() og gettere for hver tilstand udeladt
}`,
      },
    ],
    exam: [
      'En state machine er til enhver tid i én af en endelig mængde tilstande og skifter tilstand, når der kommer events. I UML skrives en transition `trigger [guard] / activity`, og kurset viser tre måder at implementere den på: switch/case, en state/event-tabel og GoF State.',
      'GoF State lader et objekt ændre adfærd, når dets interne tilstand ændres, så det ser ud til at skifte klasse. Hver tilstand er en subklasse af en abstrakt tilstand, konteksten holder en reference til den aktuelle tilstand og sender alle events videre til den. Tilstanden kalder tilbage i konteksten for at udføre actions og for at sætte den næste tilstand.',
      'I lygten fra slidene sender `FlashLight` `PWRPressed()` videre til `Off.HandlePWRPressed(this)`, som kalder `TurnLampOn()` og `SetState(onState)`. I HFDP giver `insertQuarter()` tre forskellige svar alt efter, om maskinen er i `NoQuarter`, `HasQuarter` eller `Sold`.',
      'Fordelen er, at hver tilstand er lukket for ændring, at koden ligner diagrammet, og at hver tilstand kan testes for sig; switch/case og tabeller bliver uoverskuelige og svære at teste, når maskinen vokser. Prisen er flere klasser og afhængigheder mellem tilstandsklasserne.',
      'State ligner Strategy strukturelt, men i State skifter tilstandene selv, og klienten må ikke ændre tilstanden; i Strategy vælger klienten algoritmen.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W08a_GoF_State.md'), original: W08A, pages: 's. 5–25', note: 'PDF-sidetal' },
      { path: m('noter/SW4SWD-01_State_Machine_Examples.md'), original: 'State 1 - Intro.html, State 2 - Phone.html', note: 'Øvelserne med diagrammerne som skærmbilleder i swd/kilder/uge-08_state/' },
      { path: m('bog/SW4SWD-01_HFDP_Ch10_State.md'), original: HFDP, pages: 'PDF s. 420–446 (bogens s. 382–408)' },
      { path: m('slides/SW4SWD-01_W08b_State_Nested_Orthogonal.md'), original: W08B, pages: 's. 8–11', note: 'State vs. Strategy' },
    ],
    gaps: [
      'Slidene og HFDP er uenige om, hvem der sætter den næste tilstand. W08a s. 24: altid den aktuelle tilstand, aldrig konteksten. HFDP (PDF s. 446): faste transitioner kan ligge i konteksten, dynamiske i tilstandene.',
      'Slidene lader State være en abstrakt klasse og sender konteksten med som parameter (`handleEventA(c: Context)`). HFDP bruger et interface og giver hver tilstand en reference til maskinen i konstruktøren; HFDP bemærker selv, at GoF’s diagram viser en abstrakt klasse (PDF s. 446).',
      'Slidet s. 19 spørger “why?” om de tomme standardimplementeringer uden at svare. En rimelig læsning er, at en tilstand så kun skal overskrive de events, den reagerer på, og at andre events ignoreres. Slidet s. 15 (pros and cons) har heller ingen svar ud over s. 17.',
      'Ingen af kursets tilstandsdiagrammer har en sluttilstand, og notationen for den (udfyldt cirkel med ring) gennemgås ikke. Telefonøvelsens diagram har heller ingen initial pseudo-state.',
      'Sparx-eksemplet (s. 9) skriver `Close/ [doorWay->isEmpty]` med guarden efter skråstregen, selv om s. 8 giver formen `trigger-signature [guard] / activity`.',
      'Øvelsernes diagrammer skriver entry-actions som `onEnter/solidLEDs`. *Uden for materialet:* UML-nøgleordet er `entry /` (og `exit /`).',
      '`HandleEvent(FlashLightEvent evt)` på s. 12 bruger ikke `evt`; med kun ét event gør det ingen forskel. Klassediagrammet på s. 20 skriver `SetState(s: State)`, selv om typen hedder `FlashLightState`.',
      'Slidene viser ingen kode til GoF State; C#-eksemplet med lygten er skrevet ud fra klasse- og sekvensdiagrammet (s. 20–22).',
    ],
    keywords: ['state', 'state pattern', 'GoF State', 'tilstand', 'tilstandsmaskine', 'state machine', 'STM', 'tilstandsdiagram', 'state diagram', 'transition', 'event', 'guard', 'action', 'initial pseudo-state', 'switch/case', 'state/event table', 'tabelbaseret', 'context', 'kontekst', 'FlashLight', 'FlashLightState', 'HandlePWRPressed', 'Gumball', 'GumballMachine', 'NoQuarterState', 'onEnter', 'onExit', 'State vs. Strategy', 'telefon'],
  },

  {
    slug: 'nested-orthogonal',
    title: 'Nested og orthogonal states',
    short: 'Nested og orthogonal',
    week: 'Uge 8 · W08b',
    definition:
      'En **nested state** er en tilstand med undertilstande og sin egen initial pseudo-state; en transition fra dens kant gælder, uanset hvilken undertilstand man er i. **Orthogonal states** er regioner i samme tilstand, adskilt af en stiplet linje, som er aktive samtidig. I GoF State bliver nesting til **arv** (undertilstanden er subklasse af den ydre tilstand), og orthogonale regioner bliver **separate tilstandshierarkier**, som konteksten holder en reference til hver af.',
    intro: [
      'Slidet åbner med: “The GoF State Pattern is especially neat when used for complex (nested, orthogonal) state machines.” Lektionen bygger videre på [[state|GoF State]] og lygten fra W08a.',
    ],
    concepts: [
      {
        term: 'Nested states i diagrammet',
        body: [
          '`stm Flashlight [Power modes]`: initial pseudo-state → `OFF`. `PWR` fører fra `OFF` til kanten af `ON`, og inde i `ON` peger en initial pseudo-state på `Low`. `MODE` skifter mellem `Low` og `High`. `PWR` fra kanten af `ON` fører tilbage til `OFF`, uanset om lygten er i `Low` eller `High`.',
          'Øvelsens “Flashing flashlight” har samme form: `Power/light on` fra `OFF` til `ON`, i `ON` en initial pseudo-state → `SOLID` og `Mode` frem og tilbage til `FLASHING`, og `Power/light off` fra kanten af `ON`. Undertilstandene har entry-actions: `onEnter/solidLEDs` og `onEnter/flash LEDs`.',
        ],
      },
      {
        term: 'Nesting bliver arv',
        body: [
          'Klassediagrammet på s. 2 har `FlashLightState` med `PWRPressed(light)` og `MODEPressed(light)`. `Off` og `On` arver fra den og overskriver `PWRPressed(light)`. `Low` og `High` arver fra **`On`** og overskriver kun `MODEPressed(light)`. Farvede markeringer på slidet forbinder `ON` med `On`, `Low` med `Low` og `High` med `High`.',
          'Transitionen fra kanten af `ON` implementeres derfor én gang i `On` og arves af begge undertilstande. I switch/case-versionen (W08a s. 13) krævede samme maskine to `enum`-felter og tre niveauer indlejrede `switch`.',
        ],
      },
      {
        term: 'Entry og exit',
        body: [
          'Den abstrakte tilstand har `onEnter(light)` og `onExit(light)`: det, der skal ske, når man går ind i eller ud af tilstanden, uanset ad hvilken transition. Øvelsen: “be sure you handle OnEnter correctly – if you do, the code becomes very elegant!”',
          'Med nesting betyder rækkefølgen noget. Slidet om begrænsninger (s. 12) har `B` med `onEnter: Do_X()` og `onExit: Do_Y()` og undertilstanden `B1` med `onEnter: Do_V()` og `onExit: Do_W()`. Fra `A` via `e1` ind i `B` (og dermed `B1`) skal der køre `B.onEnter()` og så `B1.onEnter()`. Fra `B1` via `e4` til `A`: `B1.onExit()` og så `B.onExit()`. Men fra `B2` via `e3` til `B1` kun `B1.onEnter()`, og fra `B1` via `e2` til `B2` kun `B1.onExit()` — man forlader ikke `B`.',
        ],
      },
      {
        term: 'Orthogonal states',
        body: [
          '`stm Flashlight [Power modes + color control]`: `ON` er delt af en stiplet linje i to regioner. Den øverste har initial → `Low` og `MODE` mellem `Low` og `High`. Den nederste har initial → `White` og `COLOR` i ring: `White` → `Red` → `Green` → `White`. Går lygten i `ON`, er den i én tilstand i hver region på én gang.',
          'Slidet giver to strategier. 1) Kollaps til én maskine med tilstandene Low-White, Low-Green, Low-Red, High-White, High-Green og High-Red. 2) Lav to separate tilstandsmaskiner, og lad konteksten holde en reference til begge.',
          'Implementeringen af strategi 2 (s. 5): `FlashLight` har `_intensityState` og `_colorState`, `SetIntensityState(s: IntensityState)` og `SetColorState(s: ColorState)`, events `PWRPressed()`, `MODEPressed()` og `COLORPressed()` og actions `TurnLampOn()`, `TurnLampOff()`, `SetLowBeam()`, `SetHighBeam()` og `SetBeamColor(c: Color)`. `IntensityState` har `Off` og `On` med `Low` og `High` under `On`; `ColorState` har `Off` og `On` med `Red`, `Green` og `White` under `On`. Begge hierarkier har `HandlePWRPressed(light)`, fordi `PWR` påvirker begge regioner.',
          'Telefonøvelsens sidste del (højttaler og mute under en samtale) har hintet “think orthogonal substates”.',
        ],
      },
      {
        term: 'The evil client',
        body: [
          '`FlashLight` har nu både event handlers til GUI’en, `SetIntensityState`/`SetColorState` og alle actions som `public`. Slidet spørger: hvad nu, hvis en klient sætter tilstanden direkte, eller tænder og slukker lampen og dermed går uden om tilstandsmaskinen?',
          'HFDP siger det samme fra den anden side: klienter ændrer ikke kontekstens tilstand direkte; det er kontekstens opgave at holde styr på sin tilstand.',
        ],
      },
      {
        term: 'ISP to the rescue',
        body: [
          'Løsningen er at dele kontekstens interface efter [[isp|ISP]]. `IFlashLight` med `PWRPressed()`, `MODEPressed()` og `COLORPressed()` er til kontekstens klienter. `IFlashLightInternal` med `SetIntensityState`, `SetColorState` og STM-actions er til tilstandsmaskinens implementering. `FlashLight` realiserer begge.',
          'Øvelse 7 siger det samme om lygten: klassen har metoder til både event handling og til tilstandsobjekterne, bryder ISP og skal refaktoreres med separate interfaces til UI og tilstande.',
        ],
      },
      {
        term: 'State vs. Strategy',
        body: [
          'Strukturen er næsten ens (s. 8): i GoF State har `Context` en `curState: State` og delegerer til `StateA`–`StateC`; i [[strategy|Strategy]] har `Context` en `IStrategy strategy`, `SetStrategy(IStrategy strategy)` og delegerer `Handle()` til `ConcreteStrategy1` eller `ConcreteStrategy2`.',
          'Intent adskiller dem. State: “Allow an object to alter its behavior when its internal state changes. The object will appear to change its class.” Strategy: “Define a family of algorithms, encapsulate each one, and make them interchangeable. Strategy lets the algorithm vary independently from clients that use it.”',
          'Anvendelsen (s. 10): State bruges til at modellere et system med tilstande; klienten må ikke ændre tilstanden, og transitionerne udføres af tilstandene. Strategy bruges til at ændre en dels adfærd, altså hvilken algoritme der bruges, og klienten må gerne skifte den.',
          'Opsummeringen, som slidet citerer fra Stack Overflow: begge laver et polymorft kald. I State får kaldet ofte konteksten til at skifte til en anden tilstand og dermed adfærd; i Strategy ændrer kaldet typisk ikke kontekstens adfærd. State-mønsterets dynamik er bestemt af den tilhørende tilstandsmaskine, som er afgørende for at bruge mønsteret rigtigt. HFDP tilføjer: Strategy er et alternativ til subklassering, State et alternativ til mange betingelser i konteksten.',
        ],
      },
      {
        term: 'Begrænsninger',
        body: [
          'Slidet “Warning: State Pattern Limitations” (s. 12) viser, hvad arv ikke kan. Klassediagrammet: `Context` har `current` til den abstrakte `State` (`onEnter`, `onExit`, `e1`–`e3`, alle med `c: Context`). `A` og `B` arver fra `State`; `B1` og `B2` arver fra `B`. En rød note ved `B1.onEnter` viser implementeringen `Do_V(); base.onEnter();`.',
          'Med arv kalder `B1.onEnter()` altid `base.onEnter()`, altså også ved `e3` fra `B2`, hvor `B` ikke må køre sin entry-action igen. Og noten kører `Do_V()` før `base.onEnter()`, altså `B1` før `B` — den omvendte rækkefølge af det, sekvensen for `e1` kræver. Arvehierarkiet ved ikke, om en transition krydser kanten af `B`.',
        ],
      },
    ],
    viz: 'nested-orthogonal',
    keyPoints: [
      'Nested state: undertilstande med egen initial pseudo-state; en transition fra kanten gælder for alle undertilstande.',
      'I GoF State bliver nesting til arv: `Low` og `High` arver fra `On` og får `PWR` gratis.',
      'Orthogonal states: regioner adskilt af stiplet linje, aktive samtidig.',
      'To strategier: kollaps til krydsproduktet af tilstande, eller to maskiner, som konteksten holder hver sin reference til.',
      'Entry/exit ved nesting: ydre `onEnter` før indre, indre `onExit` før ydre — men kun når kanten krydses.',
      'The evil client kan gå uden om maskinen; ISP deler konteksten i et klient- og et internt interface.',
      'State vs. Strategy: samme struktur; i State skifter tilstandene selv, i Strategy vælger klienten.',
      'Begrænsning: arv kan ikke skelne transitioner inden for en ydre tilstand fra transitioner ind i den.',
    ],
    code: [
      {
        lang: 'csharp',
        title: 'ISP: ét interface til klienter, ét til tilstandene',
        source: `${W08B} s. 7 (interfaces og metoder fra klassediagrammet; kroppe udeladt)`,
        code: `public interface IFlashLight
{
    void PWRPressed();
    void MODEPressed();
    void COLORPressed();
}

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

public class FlashLight : IFlashLight, IFlashLightInternal
{
    private IntensityState _intensityState;
    private ColorState _colorState;
    // ...
}`,
      },
      {
        lang: 'csharp',
        title: 'Begrænsningen: B1 arver B og kalder base.onEnter()',
        source: `${W08B} s. 12 (skrevet ud fra klassediagrammet og noten; slidet har ingen hel kode)`,
        code: `public abstract class State
{
    public virtual void OnEnter(Context c) { }
    public virtual void OnExit(Context c) { }
    public virtual void E1(Context c) { }
    public virtual void E2(Context c) { }
    public virtual void E3(Context c) { }
}

public class B : State
{
    public virtual void E4(Context c) { /* til A */ }
    public override void OnEnter(Context c) { Do_X(); }
    public override void OnExit(Context c) { Do_Y(); }
}

public class B1 : B
{
    public override void E2(Context c) { /* til B2 */ }

    public override void OnEnter(Context c)
    {
        Do_V();
        base.OnEnter(c);   // kører Do_X() – også ved e3 fra B2
    }

    public override void OnExit(Context c) { Do_W(); }
}`,
      },
    ],
    exam: [
      'En nested state har undertilstande og sin egen initial pseudo-state, og en transition fra dens kant gælder, uanset hvilken undertilstand man er i. Orthogonale regioner er dele af samme tilstand, adskilt af en stiplet linje, som er aktive på samme tid.',
      'I GoF State bliver nesting til arv: i lygten arver `Low` og `High` fra `On`, så `PWR`, der fører ud af `ON`, kun skal implementeres i `On`. Orthogonale regioner bliver til to tilstandshierarkier — `IntensityState` og `ColorState` — og konteksten holder en reference til hver; alternativet er at kollapse til seks kombinerede tilstande.',
      'Når konteksten både har event handlers og de metoder, tilstandene bruger, kan en ond klient sætte tilstanden direkte og gå uden om maskinen. Derfor deler vi interfacet efter ISP i `IFlashLight` til klienterne og `IFlashLightInternal` til tilstandene.',
      'State og Strategy har næsten samme struktur, men i State modellerer man et system med tilstande, og det er tilstandene, der skifter; klienten må ikke. I Strategy vælger klienten algoritmen, og kaldet ændrer typisk ikke kontekstens adfærd.',
      'Begrænsningen er entry og exit: går man ind i `B1` udefra, skal `B.onEnter()` køre før `B1.onEnter()`, men ikke når man kommer fra søsteren `B2`. Arv via `base.onEnter()` kan ikke skelne de to tilfælde.',
    ],
    sources: [
      { path: m('slides/SW4SWD-01_W08b_State_Nested_Orthogonal.md'), original: W08B, pages: 's. 2–13', note: 'PDF-sidetal' },
      { path: m('slides/SW4SWD-01_W08a_GoF_State.md'), original: W08A, pages: 's. 8, 13, 19', note: 'Nested states i switch/case; onEnter/onExit i strukturen' },
      { path: m('noter/SW4SWD-01_State_Machine_Examples.md'), original: 'State 1 - Intro.html, State 2 - Phone.html', note: 'Exercise 5 og 7 (flashing flashlight, ISP) og telefonens exercise 4' },
      { path: m('bog/SW4SWD-01_HFDP_Ch10_State.md'), original: HFDP, pages: 'PDF s. 445–446 (bogens s. 407–408)', note: 'State vs. Strategy; klienter ændrer ikke tilstanden' },
    ],
    gaps: [
      'Slidet om begrænsninger (s. 12) skriver ikke konklusionen ud. Det viser diagrammet, de fire kaldssekvenser (entry-tilfældene fremhævet) og den røde note `Do_V(); base.onEnter()`; problemerne ovenfor er læst ud af dem. Linkene “Source” og “Notes” peger på `diagrams/static_polymorphism.drawio` og `notes/problem_on_enter.drawio`, som ikke er i materialet.',
      'Markdown-konverteringen skriver `A --> B1: e1`, men på slidet ender `e1` på kanten af `B`, og en initial pseudo-state inde i `B` peger på `B1`. Tilsvarende starter `e4` på kanten af `B`.',
      'Slidene viser ikke, hvordan konteksten fordeler et event, der vedrører begge regioner: `PWR` skal nå både `IntensityState` og `ColorState`, men `FlashLight.PWRPressed()` har ingen kode.',
      'Navngivningen skifter: s. 2 bruger `PWRPressed(light)`, s. 5 `HandlePWRPressed(light)` og `handleCOLORPressed(light)` med lille h i `ColorState`, men `HandleCOLORPressed` i subklasserne.',
      'Materialet bruger ordet “nested”, ikke UML’s “composite state”, og gennemgår ikke history-tilstande eller sluttilstande. *Uden for materialet:* UML har history pseudo-states (H/H*) til at vende tilbage til den senest aktive undertilstand.',
      'Klassediagrammet på s. 12 tegner `Context` → `State` med udfyldt diamant (komposition); W08a tegner samme relation som en almindelig association.',
    ],
    keywords: ['nested states', 'indlejrede tilstande', 'composite state', 'substate', 'undertilstand', 'orthogonal states', 'ortogonale tilstande', 'regioner', 'region', 'concurrent states', 'entry', 'exit', 'onEnter', 'onExit', 'base.onEnter', 'IntensityState', 'ColorState', 'evil client', 'ISP', 'IFlashLight', 'IFlashLightInternal', 'State vs. Strategy', 'state pattern limitations', 'Power modes', 'color control', 'flashing flashlight'],
  },
]
