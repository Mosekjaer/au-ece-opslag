import type { Part } from '../types'
import { ctx } from './paths'

/** Demoprojektet til lab 09 ligger kun i Brightspace-eksporten, ikke i markdown-konverteringen. */
const redditZip = 'fed/kilde/SW4FED-02 Front-end udvikling (E26.28523PU011.A) - 8242026 - 702 PM (2).zip'

export const mauiArkitektur: Part = {
  id: 'maui-arkitektur',
  title: 'MAUI · Navigation, arkitektur og data',
  topics: [
    {
      slug: 'navigation',
      title: 'Pages, NavigationPage og Shell',
      short: 'Navigation',
      week: 'Uge 3–4 · L6–L7',
      definition:
        'En MAUI-app består af **pages**. `NavigationPage` giver hierarkisk navigation som en last-in, first-out-stak af page-*instanser* (`PushAsync`/`PopAsync`). **Shell** beskriver hele appens navigationshierarki i `AppShell.xaml` med tabs, flyout og **routes**, som man navigerer til med `Shell.Current.GoToAsync("route")`.',
      intro: [
        'Slidene taler om tre hovedparadigmer — hierarchical, tabbed og flyout — der hver har sin `Page`-subklasse (`NavigationPage`, `TabbedPage`, `FlyoutPage`), og route-based navigation, som Shell leverer sammen med tabbed og flyout. `ContentPage` er den side, de andre præsenterer — bogen kalder de øvrige page-typer “containere”, der blot leverer forskellige måder at vise en `ContentPage` på.',
      ],
      concepts: [
        {
          term: 'ContentPage og page lifecycle',
          body: [
            '`ContentPage` har én `Content`-property af typen `View`. Man tildeler den et layout eller en `ScrollView` — ikke en enkelt control, selv om det er lovligt. `Page`-baseklassen giver bindable properties som `Title`, `IconImageSource`, `BackgroundImageSource`, `Padding` og `MenuBarItems` (kun desktop). Bogen fraråder `IsBusy`, fordi den ikke virker pålideligt; brug en `ActivityIndicator`.',
            'Konstruktøren må kun sætte startværdier på felter. Alt der skal ske, når siden vises — typisk at hente data fra en database eller et web API — hører til i `OnAppearing`, fordi en konstruktør ikke kan være `async`. `OnDisappearing` bruges til at afmelde events og rydde op. `OnNavigatedTo`/`OnNavigatedFrom` gør det samme, men kaldes *før* siden vises eller forsvinder; derfor er `OnAppearing` bedst til dataindlæsning: siden er synlig og kan vise en loading-indikator. `OnSizeAllocated` kaldes ved hver størrelsesændring, og `BackButtonPressed` må supplere — ikke ændre — back-knappens adfærd.',
            'Slidene viser MauiTodo i to varianter: `_ = Initialize()` i konstruktøren (hurtig rendering, når data ikke er kritiske) og `protected override async void OnAppearing()` (når data er essentielle, og indlæsningen skal følge sidens livscyklus).',
          ],
        },
        {
          term: 'NavigationPage: stakken',
          body: [
            '`NavigationPage` viser `ContentPage`s i en **navigation stack**. `await Navigation.PushAsync(new InputPage())` lægger en ny instans øverst og gør den aktiv; `await Navigation.PopAsync()` — eller back-knappen på enheden eller i navigationsbaren — fjerner den igen. Navigationsbaren viser back-knap, et valgfrit ikon og titlen. `CurrentPage` og `RootPage` er read-only, og eventene `Pushed`, `Popped` og `PoppedToRoot` fortæller, hvad der sker med stakken.',
            'Forskellen til de andre paradigmer: dér er sider bundet til en tab eller et flyout-item, og frameworket viser dem selv. I hierarkisk navigation pusher *man selv* siderne programmatisk, fx fra en `Button`. Det passer til en app, der starter med en menuside — som lab 07, hvor `MainPage` har knapper til `ElSpotPricesPage` og `CO2EmissionsPage`.',
            '`NavigationPage` er **inkompatibel med Shell** og kaster en exception i en Shell-app. Man skifter derfor `MainPage = new AppShell()` ud med `MainPage = new NavigationPage(new MainPage())` i `App`. Via `Navigation.NavigationStack` kan stakken læses, og `InsertPageBefore`/`RemovePage` kan manipulere den.',
          ],
        },
        {
          term: 'Modal navigation',
          body: [
            'En **modal** side beder brugeren gøre en afgrænset opgave færdig, før hun kan navigere væk. Den pushes på en separat *modal stack* med `PushModalAsync` og fjernes med `PopModalAsync`. Bogen bruger det til login i MauiStockTake: `App.OnStart` pusher `LoginPage` modalt ovenpå Shell’en, og efter login kalder siden `await Navigation.PopModalAsync()`.',
            'En modal side har ingen navigations-UI og dermed ingen back-knap i baren — det signalerer, at opgaven skal fuldføres. På Android kan hardware-back-knappen dog stadig lukke den. Modal navigation virker også i en Shell-app; bogen noterer, at man så stadig har brug for en `INavigation`-reference.',
          ],
        },
        {
          term: 'Shell: tabs og flyout',
          body: [
            'Shell giver tre fordele: **hele appen i én fil** (`AppShell.xaml`), **dependency resolution** (sider, der constructor-injicerer afhængigheder, resolves automatisk, som controllers i ASP.NET Core) og **route-based navigation**, der giver deep linking og query parameters.',
            'Hierarkiet er `TabBar` eller `FlyoutItem` → `Tab` → `ShellContent`. Et `ShellContent` repræsenterer én `ContentPage` via `ContentTemplate="{DataTemplate pages:InputPage}"`; bogen påpeger, at siden så først oprettes, når man navigerer til den. En `Tab` med flere `ShellContent` giver en ekstra række tabs. Ifølge bogen vises tabs på øverste niveau i Shell altid nederst, uanset platform, mens indlejrede tabs vises øverst — og tab-baren kan slet ikke tilpasses.',
            'Flyouten består af header, footer, **flyout items** (navigation) og **menu items** (`MenuItem` med `Clicked` eller `Command`, fx “Logout”, der kører kode i stedet for at navigere). `Shell.FlyoutBehavior` er som standard `Disabled` og skal sættes til `Flyout`. `FlyoutDisplayOptions="AsMultipleItems"` viser hvert `Tab`/`ShellContent` som sin egen post — det bruges i lab 06 med dyresiderne.',
          ],
        },
        {
          term: 'Routes og GoToAsync',
          body: [
            'Med Shell navigerer man efter **route-navn**, ikke med en page-instans: `await Shell.Current.GoToAsync("myroute")`, og tilbage med `GoToAsync("..")`. `Tab` og `FlyoutItem` har en `Route`-property. Sider uden tab eller flyout-item — supporting pages som login og registrering eller multistep-sider som betaling og bekræftelse — registreres i `AppShell`-konstruktøren med `Routing.RegisterRoute("productdetails", typeof(ProductPage))`: først strengen, så sidens type.',
            'Slidene opsummerer valget: `NavigationPage` til få sider og simpel push/pop uden tab bar eller flyout; Shell til flere sider og sektioner, navigation via routes og “mere skalerbar og moderne” navigation. Bogen tilføjer, at Shell er unødvendig i apps med én side eller ren hierarkisk navigation.',
          ],
        },
        {
          term: 'Parametre: navigation state og [QueryProperty]',
          body: [
            'Data sendes med som **navigation state**: en `Dictionary<string, object>`, fx `{ "Product", product }`, som andet argument til `GoToAsync`. I Xamarin.Forms kunne man kun sende primitive typer; i MAUI kan man sende hele objektet. Man kan også sende en query-streng i URL’en, fx `[QueryProperty("myPagesString", "myvalue")]` for `mypage?myvalue=…`.',
            'Modtagersiden (eller dens `BindingContext`) dekoreres med `[QueryProperty(nameof(Product), nameof(Product))]`. Første argument er navnet på den property, der skal modtage værdien; andet er query-parameterens navn, altså dictionary-nøglen. Shell sætter propertyen; i MauiStockTake-eksemplet fordeler setteren værdierne på `ProductName` og `ManufacturerName`, som kalder `OnPropertyChanged()`, og `BindingContext = this` i konstruktøren gør dem bindbare fra XAML — se [[data-binding|data binding]].',
          ],
        },
      ],
      viz: 'maui-navigation',
      keyPoints: [
        '`NavigationPage` navigerer med page-*instanser* (`PushAsync(new MyPage())`); Shell med *routes* (`GoToAsync("mypage")`).',
        '`NavigationPage` i en Shell-app kaster en exception — vælg én model i `App`.',
        'Sider uden tab eller flyout-item registreres med `Routing.RegisterRoute` i `AppShell`-konstruktøren.',
        'Objekter sendes med i en `Dictionary<string, object>` og modtages med `[QueryProperty(property, nøgle)]`.',
        'Data indlæses i `OnAppearing`, ikke i konstruktøren — en konstruktør kan ikke være `async`.',
        'En modal side (`PushModalAsync`/`PopModalAsync`) har ingen back-knap i navigationsbaren.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Fra Shell til NavigationPage i App, og push/pop',
          source: 'NavigationPage.pdf s. 3 og 6',
          code: `public partial class App : Application
{
    public App()
    {
        InitializeComponent();

        //MainPage = new AppShell();
        MainPage = new NavigationPage(new MainPage());
    }
}

// ...
await Navigation.PushAsync(new InputPage());
// ...
await Navigation.PopAsync();`,
        },
        {
          lang: 'csharp',
          title: 'Route registreres i AppShell og kaldes med navigation state',
          source: 'Shell and Routes.pdf s. 19–20',
          code: `public AppShell()
{
    InitializeComponent();
    Routing.RegisterRoute("login", typeof(LoginPage));
    Routing.RegisterRoute("productdetails", typeof(ProductPage));
}

private async void Button_Clicked(object sender, EventArgs e)
{
    var product = new Product
    {
        Name = "MauiStockTake",
        ManufacturerName = "BeachBytes"
    };

    var pageParams = new Dictionary<string, object>
    {
        { "Product", product }
    };

    await Shell.Current.GoToAsync("productdetails", pageParams);
}`,
        },
        {
          lang: 'csharp',
          title: 'Modtagersiden med [QueryProperty]',
          source: 'Shell and Routes.pdf s. 23',
          code: `[QueryProperty(nameof(Product), nameof(Product))]
public partial class ProductPage : ContentPage
{
    public ProductPage()
    {
        InitializeComponent();
        BindingContext = this;
    }

    Product _product;
    public Product Product
    {
        get { return _product; }
        set
        {
            _product = value;
            ProductName = _product.Name;
            ManufacturerName = _product.ManufacturerName;
        }
    }

    string _productName;
    public string ProductName
    {
        get => _productName;
        set
        {
            _productName = value;
            OnPropertyChanged();
        }
    }
    // ...
}`,
        },
      ],
      exam: [
        'MAUI har tre hovedparadigmer for navigation — hierarkisk med NavigationPage, tabbed og flyout — og desuden route-baseret navigation i Shell. Shell samler tabs, flyout og routes i AppShell.xaml, mens NavigationPage er en last-in, first-out-stak af page-instanser — og de to kan ikke blandes, for NavigationPage i en Shell-app kaster en exception.',
        'I eksaminator-appen fra sommer 2025 har jeg sider til at oprette en eksamen, tilføje studerende, afvikle eksamen og se historik. Hovedsiderne ligger som tabs i AppShell; detaljesiden for en valgt eksamen har ingen tab, så jeg registrerer den med Routing.RegisterRoute i AppShell-konstruktøren og navigerer dertil med GoToAsync.',
        'Den valgte eksamen sender jeg med som navigation state i en Dictionary<string, object>. Målsiden modtager den med QueryProperty, hvor første argument er propertyens navn og andet er dictionary-nøglen. Det kan MAUI i modsætning til Xamarin.Forms, som kun kunne sende primitive typer.',
        'Data indlæser jeg i OnAppearing og ikke i konstruktøren: en konstruktør kan ikke være async, og i OnAppearing er siden allerede synlig, så jeg kan vise en ActivityIndicator, mens data hentes.',
        'Tilbage kommer jeg med GoToAsync("..") i Shell eller PopAsync i en NavigationPage. En login-side ville jeg pushe modalt med PushModalAsync, fordi den ikke har nogen back-knap og dermed signalerer, at opgaven skal gøres færdig.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L06.1_Pages_and_Navigation.md'), original: 'L06/Pages and Navigation.pdf', pages: 's. 3–21' },
        { path: ctx('slides/SW4FED-02_L06.2_Shell_and_Routes.md'), original: 'L06/Shell and Routes.pdf', pages: 's. 3–23' },
        { path: ctx('slides/SW4FED-02_L07.1_NavigationPage.md'), original: 'L07/NavigationPage.pdf', pages: 's. 2–9' },
        { path: ctx('book/MAUI_in_Action_Ch07_Pages_and_navigation.md'), original: '.NET MAUI in Action, kap. 7', pages: 'afsn. 7.1–7.5.5' },
        { path: ctx('book/MAUI_in_Action_Ch08_Enterprise_app_development.md'), original: '.NET MAUI in Action, kap. 8', pages: 'afsn. 8.1.1', note: 'LoginPage som modal side i App.OnStart (listing 8.6–8.7)' },
        { path: ctx('labs/SW4FED-02_Lab06_MauiShell_app.md'), original: 'L06/Lab/FED Lab 06 MauiShell app.pdf', pages: 's. 1–2' },
        { path: ctx('labs/SW4FED-02_Lab07_El_spot_priser.md'), original: 'El spot priser.html', note: 'Shell skiftes ud med NavigationPage; data hentes i OnAppearing' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 2', note: 'Opgave 1: “Brugeren navigerer til kalendersiden … fakturasiden”' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 2', note: 'Opgave 1: opret eksamen, tilføj studerende, start eksamen, se historik' },
      ],
      gaps: [
        '*Shell and Routes.pdf* s. 16 skriver “Note: TabBar displays Flyout” og linker til Microsofts side om tabs. Uden for materialet: den dokumentation siger det modsatte — en `TabBar` slår flyouten fra.',
        '*NavigationPage.pdf* s. 9 viser `await MainPage.Navigation.PushModalAsync<LoginPage>();` uden at nævne, at den generiske variant kommer fra NuGet-pakken `Goldie.MauiPlugins.PageResolver` (bogen afsn. 8.2.2, kræver `.UsePageResolver()`). MAUI’s egen metode tager en instans: `PushModalAsync(new LoginPage())` (bogen listing 8.6).',
        '`InsertPageBefore` og `RemovePage` vises kun som diagrammer (*NavigationPage.pdf* s. 8); materialet har ingen kode til dem.',
        'Både slides (s. 22) og bog (afsn. 7.5.5) siger, at `[QueryProperty]` også kan sidde på sidens `BindingContext`/ViewModel, og bogen lover “mere om det i kapitel 9” — men kapitel 9 viser det ikke. Materialet har intet eksempel på en ViewModel, der modtager navigationsparametre.',
      ],
      keywords: ['navigation', 'Shell', 'AppShell', 'NavigationPage', 'PushAsync', 'PopAsync', 'PushModalAsync', 'PopModalAsync', 'modal', 'navigation stack', 'LIFO', 'GoToAsync', 'route', 'Routing.RegisterRoute', 'QueryProperty', 'navigation state', 'TabBar', 'Tab', 'ShellContent', 'FlyoutItem', 'MenuItem', 'FlyoutPage', 'TabbedPage', 'ContentPage', 'OnAppearing', 'OnDisappearing', 'lifecycle', 'deep linking'],
    },

    {
      slug: 'di-generic-host',
      title: 'Dependency injection og Generic Host',
      short: 'DI og Generic Host',
      week: 'Uge 4 · L7',
      definition:
        '`MauiProgram.CreateMauiApp` bruger .NET’s **generic host builder pattern**: `MauiApp.CreateBuilder()` giver en builder, hvor fonts, services, ViewModels og pages registreres i `builder.Services`, og `Build()` bygger appen med en indbygget **DI-container**, der constructor-injicerer afhængighederne.',
      concepts: [
        {
          term: 'Generic host og MauiProgram',
          body: [
            'En **host** er et objekt, der indkapsler appens ressourcer og livstidsfunktioner: dependency injection, logging, configuration, app shutdown og `IHostedService`-implementeringer. Hovedgrunden til at samle dem ét sted er *lifetime management* — kontrol over opstart og pæn nedlukning. MAUI bruger samme mønster som console- og ASP.NET Core-apps (se [[bad/di-levetider|DI-levetider i BAD]]).',
            '`CreateMauiApp` er appens indgang. `MauiApp.CreateBuilder()` giver en `MauiAppBuilder`, der konfigureres flydende: `UseMauiApp<App>()`, `ConfigureFonts(…)` og extension-metoder som `UseMauiCommunityToolkit()` og `UsePageResolver()`. `builder.Services` er en `IServiceCollection`; alt der registreres dér, leveres til containeren, når `builder.Build()` kaldes. Den færdige `MauiApp` har `Services` (en `IServiceProvider`) og `Configuration`.',
            'Samme forelæsning viser **app lifecycle**: vinduet rejser `Created`, `Activated`, `Deactivated`, `Stopped`, `Resumed` og `Destroying`. Ved `Stopped` bør man afbryde langvarige processer og pending requests, ved `Resumed` genopfriske den synlige side. Man abonnerer ved at override `CreateWindow` i `App`.',
          ],
        },
        {
          term: 'Dependency, injection og Inversion of Control',
          body: [
            'Der er en **dependency** mellem X og Y, når hver X-instans har brug for en Y-instans. Problemet er, når X selv skal vide, hvordan Y oprettes (`yref = new Y();`). Et objekt bør ikke instantiere det, det afhænger af; afhængigheden skal gives “udefra” — via **constructor injection** (`public X(IY ay)`) eller **setter injection** (`SetY(IY ay)`), enten i hånden (`new X(new Y())`) eller af en container.',
            'En **IoC-container** holder registreringer fra interfaces/abstrakte typer til konkrete typer og styrer objekternes oprettelse, nedlæggelse, levetid, konfiguration og afhængigheder. Mangler en afhængighed, opretter containeren den og resolver dens afhængigheder først. Det mindsker koblingen, gør det let at mocke afhængigheder i test og at tilføje nye klasser. Inversion of Control kaldes også Hollywood-princippet: *“don’t call us, we’ll call you”*.',
          ],
        },
        {
          term: 'Registrering og constructor injection',
          body: [
            'I MauiStockTake registreres `builder.Services.AddSingleton<IBrowser, AuthBrowser>()`, `AddSingleton<IAuthService, AuthService>()` og `AddTransient<LoginPage>()`. Konstruktørerne beder om det, de skal bruge: `AuthService(IBrowser browser)` og `LoginPage(IAuthService authService)`. Containeren resolver hele kæden — ingen af klasserne kalder `new` på deres afhængigheder.',
            'Bogen starter med at definere kravet som et interface, dér hvor det *forbruges* (`IAuthService` med `Task<bool> LoginAsync()`), og leverer først en `MockAuthService`, der returnerer `Task.FromResult(true)`. Det er **dependency inversion principle**: siden afhænger af kravet, ikke af implementeringen, og kan køre og testes, før den rigtige service findes.',
            'At gemme `IServiceCollection` i en statisk property og slå op i den overalt kalder bogen **service locator-antipatternet**. Mange registreringer kan samles i en **custom extension method** på `IServiceCollection`, som `AddApiClientServices(…)`, der også registrerer en navngiven `HttpClient` med en delegating handler (se [[maui-data|lokal data og web API]]).',
          ],
        },
        {
          term: 'Levetider i MAUI',
          body: [
            'Generelt findes Transient, Scoped og Singleton, men **Scoped giver ikke mening i MAUI** — der er ingen HTTP request pipeline at scope efter. `AddSingleton` giver én instans for hele appens levetid; `AddTransient` giver en ny instans, hver gang den bliver bedt om.',
            'Tommelfingerreglen (slides og bogens tabel 8.2): **pages transient** — man bør forvente en ny instans hver gang og gemme state et andet sted; **ViewModels transient** — en ren instans hver gang; **services singleton** — flere kopier af en database eller en API-service er spild og kan give datakonflikter, og singletons er stedet for app-wide state, der injiceres i ViewModels. Slidet tilføjer: “generel vejledning, ikke hugget i sten”.',
          ],
        },
        {
          term: 'Shell-sider og DI',
          body: [
            'Slides og bog siger, at sider, der er tilføjet Shell i XAML eller registreret til routing, **automatisk registreres som singleton**; sider uden for Shell (som `LoginPage`) og services og ViewModels skal registreres manuelt. Begrundelsen er UX: i en tab-app forventer brugeren at se den samme instans, når hun skifter frem og tilbage. Bogens eksempel er Facebook-appens nyhedsfeed (samme instans) over for en profil, der pushes hierarkisk (frisk instans hver gang).',
            'I praksis viser materialet begge dele: kurset registrerer siden eksplicit — `AddSingleton<MainPage>()` sammen med `AddTransient<MainViewModel>()` (L09-slides) og `AddSingleton<SubredditPage>()` i demoprojektet til lab 09 — og bogen skriver i kapitel 9, at `InputPage` skal registreres, når den får en ViewModel i konstruktøren, fordi Shell ellers ikke kan oprette den. Den sikre regel er at registrere hver side, der har parametre i konstruktøren.',
          ],
        },
        {
          term: 'Enterprise-mønstre og Clean Architecture',
          body: [
            'Enterprise-apps har skiftende krav, korte leveringstider, flere platforme og mange integrationer. Svaret er at dele appen i løst koblede komponenter; L07.2 lister MVVM, DI og Generic Host, kommunikation mellem løst koblede komponenter, navigation, validering, authentication og authorization, adgang til remote data og unit testing.',
            'MauiStockTake følger **Clean Architecture**: alle afhængigheder peger indad, Domain har ingen afhængigheder, og Infrastructure og Presentation afhænger af Application. MAUI-appen (`MauiStockTake.UI`) ligger i Presentation sammen med `WebAPI` og klientbiblioteket `MauiStockTake.Client`. DTO’er ligger i et `Shared`-projekt — en **cross-cutting concern**, der deles af backend og frontend, så en ændret DTO straks er synlig overalt.',
          ],
        },
      ],
      viz: 'di-host',
      keyPoints: [
        '`MauiProgram.CreateMauiApp` er indgangen; `builder.Services` samler registreringerne, og `Build()` giver dem til containeren.',
        'Afhængigheder kommer ind gennem konstruktøren — klassen kalder aldrig selv `new` på dem.',
        'Registrér interface → implementering, så klassen kun kender kravet og kan få en mock i test.',
        'Services singleton, pages og ViewModels transient. Scoped giver ikke mening i MAUI.',
        'En side med parametre i konstruktøren skal være registreret, ellers kan Shell ikke oprette den.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Registrering i MauiProgram',
          source: 'Dependency Injection and Generic Host builder pattern.pdf s. 18',
          code: `public static MauiApp CreateMauiApp()
{
    var builder = MauiApp.CreateBuilder();
    builder
        .UseMauiApp<App>()
        .ConfigureFonts(fonts =>
        {
            fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
        })
        .UsePageResolver();

    builder.Services.AddSingleton<IBrowser, AuthBrowser>();
    builder.Services.AddSingleton<IAuthService, AuthService>();
    builder.Services.AddTransient<LoginPage>();
    builder.Services.AddApiClientServices(new ApiClientOptions
    {
        BaseUrl = Constants.BaseUrl
    });
    // ...`,
        },
        {
          lang: 'csharp',
          title: 'Database → ViewModel → side: registreret og constructor-injiceret',
          source: 'MVVM Community Toolkit.pdf s. 5',
          code: `builder.Services.AddSingleton<IDatabase, Database>();
builder.Services.AddSingleton<MainPage>();
builder.Services.AddTransient<MainViewModel>();

public MainPage(MainViewModel vm)
{
    InitializeComponent();
    BindingContext = vm;
}

public partial class MainViewModel : ObservableObject
{
    readonly IDatabase _database;

    public MainViewModel(IDatabase database) {
        _database = database;
        _ = Initialize();
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Custom extension method samler registreringerne',
          source: 'Dependency Injection and Generic Host builder pattern.pdf s. 19',
          code: `public static class DependencyInjection
{
    public static IServiceCollection AddApiClientServices(this IServiceCollection
                                         services, ApiClientOptions options)
    {
        services.AddSingleton(options);

        services.AddSingleton<AuthHandler>();

        services.AddHttpClient(AuthHandler.AUTHENTICATED_CLIENT)
            .AddHttpMessageHandler((s) => s.GetService<AuthHandler>());

        services.AddSingleton<IInventoryService, InventoryService>();
        services.AddSingleton<IProductService, ProductService>();

        return services;
    }
}`,
        },
      ],
      exam: [
        'MauiProgram.CreateMauiApp bruger det samme generic host builder pattern som ASP.NET Core: MauiApp.CreateBuilder giver en builder, hvor jeg registrerer fonts, services, ViewModels og sider, og Build bygger appen med DI-containeren.',
        'Min database-service registrerer jeg som singleton, så hele appen deler én forbindelse til SQLite-filen, og mine ViewModels som transient, så hver side får en ren instans. Scoped bruger jeg ikke — i MAUI er der ingen request at scope efter.',
        'Klasserne får deres afhængigheder gennem konstruktøren: siden får sin ViewModel, og ViewModellen får et IDatabase-interface. Fordi ViewModellen kun kender interfacet, kan jeg skifte SQLite ud med en service, der taler med json-serveren via HttpClient — sommer 2025- og V25/26-sættene tillader begge dele — uden at røre ViewModellen.',
        'En side, der tager en ViewModel i konstruktøren, har ingen default-konstruktør, så den skal registreres i MauiProgram; ellers kan Shell ikke oprette den.',
        'Det er inversion of control: jeg kalder ikke new på mine afhængigheder, containeren gør det og styrer levetiden. Det giver løs kobling, og i en test kan jeg give ViewModellen en mock af interfacet.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L07.3_Dependency_Injection_og_Generic_Host_builder.md'), original: 'L07/Dependency Injection and Generic Host builder pattern.pdf', pages: 's. 2–24' },
        { path: ctx('slides/SW4FED-02_L07.2_Enterprise_App_development.md'), original: 'L07/Enterprise App development in .NET MAUI.pdf', pages: 's. 2–12' },
        { path: ctx('slides/SW4FED-02_L09.1_MVVM_Community_Toolkit.md'), original: 'L09/MVVM Community Toolkit.pdf', pages: 's. 5', note: 'BindingContext via DI' },
        { path: ctx('slides/SW4FED-02_L06.2_Shell_and_Routes.md'), original: 'L06/Shell and Routes.pdf', pages: 's. 5', note: 'Shell: dependency resolution' },
        { path: ctx('book/MAUI_in_Action_Ch08_Enterprise_app_development.md'), original: '.NET MAUI in Action, kap. 8', pages: 'afsn. 8.1.1, 8.2–8.2.2, 8.4' },
        { path: ctx('book/MAUI_in_Action_Ch09_The_MVVM_Pattern.md'), original: '.NET MAUI in Action, kap. 9', pages: 'afsn. 9.5.2–9.5.3', note: 'InputViewModel og InputPage registreres som transient' },
        { path: redditZip, original: 'L09/RedditBrowser.zip', note: 'Demoprojekt til lab 09: MauiProgram.cs registrerer service singleton, ViewModels transient og sider singleton' },
        { path: ctx('eksamen/SW4FED-02_Eksamensforberedelse.md'), original: 'L28/FED Eksamensforberedelse.pdf', pages: 's. 8', note: 'Læringsmål 4' },
      ],
      gaps: [
        'Materialet er uenigt med sig selv om Shell-sider: *DI and Generic Host builder pattern.pdf* s. 16 og bogen afsn. 8.2 siger, at Shell registrerer sine sider automatisk som singleton; tabellen på s. 17 siger “Pages: Transient”; bogen afsn. 9.5.3 registrerer Shell-siden `InputPage` manuelt som transient; og L09-slidet s. 5 samt lab 09-demoen registrerer sider med `AddSingleton`.',
        'Uden for materialet: registreres en side som singleton og dens ViewModel som transient (som på L09-slidet s. 5), oprettes ViewModellen kun én gang — sammen med siden — og lever derfor reelt lige så længe som den (en “captive dependency”).',
        'App lifecycle-slidene (s. 22–24) forklarer events og `CreateWindow`, men materialet viser ikke, hvordan lifecycle-events kobles til services eller ViewModels i en DI-opsat app.',
      ],
      keywords: ['dependency injection', 'DI', 'IoC', 'inversion of control', 'IoC container', 'generic host', 'host builder', 'MauiProgram', 'CreateMauiApp', 'MauiApp.CreateBuilder', 'builder.Services', 'IServiceCollection', 'AddSingleton', 'AddTransient', 'AddScoped', 'constructor injection', 'setter injection', 'lifetime', 'levetid', 'service locator', 'PageResolver', 'Clean Architecture', 'cross-cutting concerns', 'app lifecycle', 'CreateWindow'],
    },

    {
      slug: 'mvvm',
      title: 'MVVM og Community Toolkit',
      short: 'MVVM',
      week: 'Uge 4–5 · L8–L9',
      definition:
        '**MVVM** (Model–View–ViewModel) adskiller UI logic (View), presentation logic (ViewModel) og business logic (Model). View’et binder til ViewModellens properties og **commands**; ViewModellen kender ikke View’et, og Model kender ikke ViewModellen. `CommunityToolkit.Mvvm` genererer boilerplate-koden med source generators.',
      concepts: [
        {
          term: 'De tre lag',
          body: [
            '**View** rummer UI logic: layout og UI-adfærd som animation og tekstformatering — pages, layouts og controls, men også en `DataTemplate`. **ViewModel** rummer presentation logic: UI-tilstanden (værdierne i UI’et) og logikken, der reagerer på brugerhandlinger. **Model** rummer business logic: regler for brugerinput og kommunikation med et API eller et datalager — “problemdomænet repræsenteret i kode”.',
            'Bogen skelner skarpt: **Model** er hele problemdomænet — entities *og* services — ikke én klasse; i MauiTodo er `TodoItem` og `Database` tilsammen Model. En **ViewModel** er ikke en DTO-“view model”: den indeholder funktionalitet. Bogens eksempel er en `Switch`: om den er on eller off er tilstand og hører til ViewModellen; at den er grøn eller rød er UI-adfærd og hører til View’et.',
            'MVVM kom med WPF og er Microsofts specialisering af Presentation Model; det er blevet standarden for XAML-apps. Martin Fowler fremhæver, at mønsteret gør det muligt at teste uden UI.',
          ],
        },
        {
          term: 'Afhængighedsretningen',
          body: [
            'View’et er forbundet med ViewModellen gennem **data binding** og sender **commands** til den; **ViewModellen kender ikke View’et**. ViewModellen bruger Model gennem properties og metodekald og kan modtage events fra den; **Model kender ikke ViewModellen**. Afhængighederne peger altså kun nedad, og derfor kan ViewModellen unit-testes uden UI.',
            'Slidene tegner dog også en stiplet linje fra View direkte til Model, og MVC/MVVM-sammenligningen har en `DataBinding`-pil mellem `View(xaml)` og Model — som når en `DataTemplate` binder til felterne på det enkelte `TodoItem`. Code-behind (`View(code)`) modtager events fra XAML og kalder metoder på ViewModellen. I MVC går både controller og view direkte til modellen. Slidene viser desuden to måder at kombinere MVVM med en tre-lags-arkitektur (GUI/BLL/DAL): *dogmatisk* MVVM, hvor ViewModellen kun rummer GUI-logik og taler med en Model i BLL via DTO’er, og *pragmatisk* MVVM, hvor ViewModellen selv bærer business logic og bruger DAL og model direkte. Bogen advarer mod blind efterlevelse af et mønster og kalder MVVM unødvendigt i trivielle apps med én skærm.',
          ],
        },
        {
          term: 'INotifyPropertyChanged og ObservableCollection',
          body: [
            'ViewModellen implementerer `INotifyPropertyChanged`, hvis `PropertyChanged`-event fortæller UI’et, at en property er ændret. `OnPropertyChanged([CallerMemberName] string propertyName = "")` kan kaldes fra en setter uden navn; `RaisePropertyChanged(params string[])` notificerer flere på én gang. Kun **public properties** kan bindes; felter holder privat data. Har man flere ViewModels, lægges implementeringen i en `BaseViewModel` — bogens har også `Title`, `IsLoading` og en `INavigation Navigation` — eller man bruger toolkit’ets `ObservableObject`. Se [[data-binding|data binding]].',
            '`ObservableCollection<T>` rejser selv events, når elementer tilføjes eller fjernes; derfor kalder bogen `Clear()` i stedet for at oprette en ny instans. En almindelig auto-property rejser derimod intet: i MauiStockTake kan en `Stepper` godt skrive til `Count`, men `Label`en bundet til samme property opdateres først, da `Count` får backing field og `OnPropertyChanged()`.',
          ],
        },
        {
          term: 'Commands i stedet for event handlers',
          body: [
            'En event handler har en fast signatur (`object sender, …EventArgs e`), så `CheckedChanged` på en `CheckBox` i MauiTodo kan ikke fortælle, *hvilket* to-do-item der blev afkrydset. En **command** kan tage en parameter. `Command` implementerer `ICommand`, hvis `Execute` er koden, der køres; konstruktøren tager en lambda eller en metode: `new Command(async () => await AddNewTodo())` og `new Command<TodoItem>(async (item) => await CompleteTodo(item))`. Metoden kan så returnere `Task` i stedet for at være `async void`.',
            'Kun få controls har en `Command`-property (`Button`, `SwipeView`, `SearchBar.SearchCommand`, `MenuItem`). Til resten bruges en **behavior**: `EventToCommandBehavior` fra `CommunityToolkit.Maui` (kræver `.UseMauiCommunityToolkit()` i `MauiProgram`) lytter på `EventName="CheckedChanged"` og kalder en command. Inde i en `DataTemplate` er binding context det enkelte item, så kommandoen nås via siden: `Command="{Binding Source={x:Reference PageTodo}, Path=BindingContext.CompleteTodoCommand}"` (siden skal have `x:Name="PageTodo"`), og `CommandParameter="{Binding .}"` sender selve item’et med.',
          ],
        },
        {
          term: 'BindingContext: kode, XAML eller DI',
          body: [
            'Siden forbindes med sin ViewModel på én af to måder — brug én, ikke begge: i code-behind med `BindingContext = new MainViewModel();` efter `InitializeComponent()`, eller i XAML med `<ContentPage.BindingContext><vm:MainViewModel /></ContentPage.BindingContext>` og et `xmlns:vm`. L09-slidene foretrækker **dependency injection**: ViewModellen registreres i containeren og injiceres i sidens konstruktør (se [[di-generic-host|DI og Generic Host]]). Code-behind indeholder så kun `InitializeComponent()` og tildelingen.',
            '`x:DataType="vm:MainViewModel"` på siden giver korrekt IntelliSense for bindingerne; på en `DataTemplate` sættes `x:DataType="m:TodoItem"`, fordi konteksten dér er elementet. Toolkit-eksemplet når ViewModellen fra en template med `{Binding Source={RelativeSource AncestorType={x:Type vm:MainViewModel}}, Path=SwipeDoneCommand}`.',
          ],
        },
        {
          term: 'CommunityToolkit.Mvvm',
          body: [
            'Kurset anbefaler `CommunityToolkit.Mvvm` (“MVVM Toolkit”): platformsuafhængigt, à la carte og en del af .NET Community Toolkit. Det indeholder **source generators**, der skriver den ekstra kode ved kompilering, så resultatet er det samme, som hvis man havde skrevet den selv. Det er en anden pakke end `CommunityToolkit.Maui`, som har `EventToCommandBehavior`.',
            '`ObservableObject` implementerer `INotifyPropertyChanged` og `INotifyPropertyChanging`. `[ObservableProperty]` på et privat felt genererer den public property (med stort begyndelsesbogstav) og dens notifikation; `[NotifyPropertyChangedFor(nameof(FullName))]` notificerer også en afhængig property, og en egen setter kan kalde `SetProperty(ref name, value)`. ViewModellerne på slidene er `partial class`.',
            '`RelayCommand`/`RelayCommand<T>` og de asynkrone `AsyncRelayCommand`/`AsyncRelayCommand<T>` er toolkit’ets `ICommand`-implementeringer, og `[RelayCommand]` på en metode får generatoren til at skrive command-propertyen. Navnet er metodenavnet + “Command”, uden præfikset “On” og, for async-metoder, uden suffikset “Async”: `OnGreetUser` → `GreetUserCommand`. Har metoden en parameter, bliver det en `RelayCommand<T>`. `CanExecute = nameof(CanGreetUser)` styrer, om kommandoen kan køre, og `[NotifyCanExecuteChangedFor(nameof(GreetUserCommand))]` på en property genberegner det, når propertyen ændres. `IMessenger` (`WeakReferenceMessenger`, `StrongReferenceMessenger`) sender beskeder mellem løst koblede dele.',
          ],
        },
      ],
      viz: 'mvvm-layers',
      keyPoints: [
        'View = hvordan, ViewModel = hvad (UI-tilstand), Model = problemdomænet (entities og services).',
        'ViewModellen kender ikke View’et — derfor kan den unit-testes uden UI.',
        'Uden `PropertyChanged` opdateres UI’et ikke; `ObservableCollection<T>` klarer tilføjelser og fjernelser selv.',
        'Commands kan tage en parameter, event handlers kan ikke; `EventToCommandBehavior` giver controls uden `Command` en.',
        'I en `DataTemplate` er binding context det enkelte item — nå ViewModellen via `x:Reference` eller `RelativeSource`.',
        '`[ObservableProperty]` og `[RelayCommand]` lader generatoren skrive property og `…Command`.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'INotifyPropertyChanged i MainViewModel',
          source: 'The MVVM Pattern.pdf s. 20',
          code: `public class MainViewModel : INotifyPropertyChanged
{
    #region INotifyPropertyChanged
    public event PropertyChangedEventHandler PropertyChanged;

    protected void OnPropertyChanged([CallerMemberName] string propertyName = "")
    {
        PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
    }

    public void RaisePropertyChanged(params string[] properties)
    {
        foreach (var propertyName in properties)
        {
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(propertyName));
        }
    }
    #endregion
}`,
        },
        {
          lang: 'csharp',
          title: 'Commands kobles til metoder i konstruktøren',
          source: 'The MVVM Pattern.pdf s. 23',
          code: `public MainViewModel()
{
    _database = new Database();
    AddTodoCommand = new Command(async () => await AddNewTodo());
    CompleteTodoCommand = new Command<TodoItem>(async (item) =>
             await CompleteTodo(item));
    _ = Initialize();
}`,
        },
        {
          lang: 'csharp',
          title: '[RelayCommand] med parameter — og den genererede kode',
          source: 'MVVM Community Toolkit.pdf s. 20',
          code: `[RelayCommand]
private void GreetUser(User user)
{
  Console.WriteLine($"Hello {user.Name}!");
}

private RelayCommand<User>? greetUserCommand;
public IRelayCommand<User> GreetUserCommand =>
         greetUserCommand ??= new RelayCommand<User>(GreetUser);`,
        },
      ],
      exam: [
        'MVVM deler appen i View med UI logic, ViewModel med presentation logic og Model med business logic. ViewModellen kender ikke View’et, og Model kender ikke ViewModellen, så afhængighederne peger kun nedad, og ViewModellen kan testes uden UI.',
        'I mine sider indeholder code-behind kun InitializeComponent og tildelingen af BindingContext til den ViewModel, containeren injicerer. Alle kontroller er bundet til properties og commands på ViewModellen.',
        'I vane-appen fra vintereksamen 2024 skal en vane kunne markeres som udført. Det løser jeg som i MauiTodo: en CollectionView med en CheckBox pr. vane, en EventToCommandBehavior på CheckedChanged og en command bundet til sidens ViewModel via x:Reference. CommandParameter er {Binding .}, så kommandoen får den konkrete Habit.',
        'INotifyPropertyChanged er det, der får UI’et til at opdatere sig, når ViewModellen ændrer en værdi; ObservableCollection gør det samme for lister. Med CommunityToolkit.Mvvm skriver jeg ObservableProperty på et felt og RelayCommand på en metode, og source generatoren skriver resten.',
        'Commands bruger jeg frem for event handlers, fordi en event handler har en fast signatur og ikke kan få det element med, handlingen gælder. En command kan tage en parameter, og metoden kan returnere Task i stedet for at være async void.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L08.1_The_MVVM_Pattern.md'), original: 'L08/The MVVM Pattern.pdf', pages: 's. 2–29' },
        { path: ctx('slides/SW4FED-02_L09.1_MVVM_Community_Toolkit.md'), original: 'L09/MVVM Community Toolkit.pdf', pages: 's. 2–24' },
        { path: ctx('book/MAUI_in_Action_Ch09_The_MVVM_Pattern.md'), original: '.NET MAUI in Action, kap. 9', pages: 'afsn. 9.1–9.6' },
        { path: ctx('labs/SW4FED-02_Lab08_ToDoApp_v2.md'), original: 'L08/FED Lab 08-1 ToDoApp-v2.pdf', pages: 's. 1', note: 'SwipeView bundet til CompleteTodoCommand og DeleteTodoCommand' },
        { path: ctx('labs/SW4FED-02_Lab09_Hacker_News_browser.md'), original: 'Exercise 09 Hacker News browser.html', note: 'MVVM Toolkit, DI og Preferences' },
        { path: redditZip, original: 'L09/RedditBrowser.zip', note: 'ViewModels/SubredditViewModel.cs: ObservableObject, [ObservableProperty], AsyncRelayCommand' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 2–3', note: 'Opgave 1: markér en vane som udført; vejledende Habit/HabitEntry' },
      ],
      gaps: [
        'Pakkenavnene blandes: *The MVVM Pattern.pdf* s. 26 kalder `CommunityToolkit.Maui` for “the MVVM Toolkit”, mens *MVVM Community Toolkit.pdf* s. 8–9 bruger navnet om `CommunityToolkit.Mvvm` og viser, at `EventToCommand` ligger i `CommunityToolkit.Maui`. Slides (s. 28: `xmlns:toolkit="http://schemas.microsoft.com/dotnet/2022/maui/toolkit"`) og bog (afsn. 9.2: `clr-namespace:CommunityToolkit.Maui.Behaviors;assembly=CommunityToolkit.Maui`) bruger desuden hver sin XML-namespace-erklæring for behavioren.',
        'Uden for materialet: `[ObservableProperty] private string? fullname;` (*MVVM Community Toolkit.pdf* s. 13) genererer propertyen `Fullname`, ikke `FullName` som i eksemplet uden toolkit ved siden af. Og `set => { … }` på s. 13 og s. 15 er ikke gyldig C#; det skal være `set { … }`.',
        'Uden for materialet: `Messenger.Default.Register`/`Send` (*MVVM Community Toolkit.pdf* s. 24) er ikke API’et i `CommunityToolkit.Mvvm`; dér bruges `WeakReferenceMessenger.Default` eller `StrongReferenceMessenger.Default`, som slidet selv lister på s. 11.',
        'Dogmatisk og pragmatisk MVVM (*The MVVM Pattern.pdf* s. 14) vises kun som diagram. Slidet siger intet om, hvornår man vælger hvad.',
      ],
      keywords: ['MVVM', 'Model-View-ViewModel', 'ViewModel', 'View', 'Model', 'INotifyPropertyChanged', 'PropertyChanged', 'OnPropertyChanged', 'CallerMemberName', 'ObservableCollection', 'ICommand', 'Command', 'Command<T>', 'RelayCommand', 'AsyncRelayCommand', 'EventToCommandBehavior', 'behavior', 'BindingContext', 'x:DataType', 'CommandParameter', 'x:Reference', 'RelativeSource', 'CommunityToolkit.Mvvm', 'CommunityToolkit.Maui', 'ObservableObject', 'ObservableProperty', 'NotifyPropertyChangedFor', 'NotifyCanExecuteChangedFor', 'CanExecute', 'source generator', 'IMessenger', 'BaseViewModel', 'MVC'],
    },

    {
      slug: 'maui-data',
      title: 'Lokal data og web API i MAUI',
      short: 'Data i MAUI',
      week: 'Uge 1–5 · L2, L5, L7, L9',
      definition:
        'En MAUI-app kan gemme data lokalt i filsystemet, i en database (SQLite via `sqlite-net-pcl`), i **Preferences** (key/value) eller i **SecureStorage** (krypteret key/value), og hente remote data fra et web API med **HttpClient**, der deserialiserer JSON til C#-objekter. Alle kald er asynkrone.',
      intro: [
        'Det er læringsmål 6 og kernen i Opgave 1 i alle fire eksamenssæt: “Alle data skal persisteres”. Sættene nævner SQLite (alle fire), filer (2024 sommer, 2024 vinter, 2025 sommer) og en json-server tilgået med HttpClient (2024 sommer, 2025 sommer, V25/26).',
      ],
      concepts: [
        {
          term: 'Fire måder at gemme lokalt',
          body: [
            'MAUI giver fire muligheder: **filsystemet** (løse filer), en **database** (data i en fil optimeret til adgang), **Preferences** (key/value-par) og **SecureStorage** (key/value-par på en sikker placering). `FileSystem.AppDataDirectory` giver appens datamappe på den aktuelle platform.',
            'Bogen sammenligner med en web-app: en MAUI-app kan åbne filer uden brugeren, gemme preferences via en fælles abstraktion, kryptere med en nøgle, som OS’et forvalter, og bruge enhver .NET-databasemotor — hvor en web-app er begrænset til browserens API’er som IndexedDB og Web Storage.',
          ],
        },
        {
          term: 'SQLite med sqlite-net-pcl',
          body: [
            'SQLite er en indlejret databasemotor — et bibliotek i appen, ingen server og ingen DBA. Kurset bruger NuGet-pakken `sqlite-net-pcl` (+ `sqlite-net-sqlcipher` til kryptering; Android kræver desuden `SQLitePCLRaw.provider.dynamic_cdecl`). Den er lille og har en tynd ORM, men **understøtter ikke relationer** (foreign keys); dem må man selv håndtere, eller bruge `SQLiteNetExtensions`. Alternativet er `Microsoft.EntityFrameworkCore.Sqlite` med LINQ som i [[bad/ef-core|EF Core i BAD]].',
            'Modellen er en POCO; `[PrimaryKey, AutoIncrement]` på `Id` gør den til en auto-inkrementeret primærnøgle. `new SQLiteConnectionString(databasePath, true, key: …)` bygger forbindelsesstrengen (sti, `DateTime` som ticks, krypteringsnøgle), og `SQLiteAsyncConnection` er forbindelsen. `CreateTableAsync<TodoItem>()` opretter tabellen ud fra klassen, hvis den ikke findes, og skal være færdig før første læsning eller skrivning.',
            'CRUD: `Table<TodoItem>().ToListAsync()` (læs alle), `Table<TodoItem>().Where(t => t.Id == id).FirstOrDefaultAsync()` (læs én), `InsertAsync(item)`, `UpdateAsync(item)` og `DeleteAsync(item)`. ORM’en finder selv tabellen ud fra parameterens type. Alle metoder er `async` og returnerer `Task` (se [[async-await|async/await]]); da en konstruktør ikke kan være async, kaldes initialiseringen med discard: `_ = Initialise();`.',
          ],
        },
        {
          term: 'SecureStorage, kryptering og fejlfinding',
          body: [
            '`SecureStorage` gemmer key/value-par krypteret med en nøgle, som OS’et forvalter — KeyChain på iOS og macOS, Keystore på Android — og som i de fleste tilfælde ligger i en hardware-krypteringschip. I MauiTodo er databasens nøgle en GUID gemt i SecureStorage under `"dbKey"`; SQLCipher krypterer selve dataene. Fordi `SecureStorage` kun er async, bruger bogen `.Result` i konstruktøren.',
            'Underviserens note: kryptér ikke under udvikling. I `#if DEBUG` åbnes databasen uden nøgle, og stien skrives i konsollen, så filen kan åbnes i SQLiteStudio. Fang `SQLiteException` omkring forbindelse og `CreateTableAsync`, fordi MAUI nogle gange skjuler den egentlige exception bag en “unhandled exception”.',
          ],
        },
        {
          term: 'Preferences',
          body: [
            'Preferences er app-dækkende indstillinger, der overlever genstart og kun er synlige for appen. `IPreferences` gemmer i et key/value-lager; standardimplementeringen er `Preferences.Default`. Nøglen er en `string`, værdien én af `Boolean`, `Double`, `Int32`, `Single`, `Int64`, `String` eller `DateTime`.',
            '`Preferences.Default.Set("first_name", "John")` skriver; `Get("first_name", "Unknown")` læser og *kræver* en standardværdi til, når nøglen mangler. `ContainsKey`, `Remove` og `Clear` findes også, og en valgfri containerparameter giver delte preferences (fx til en watch-app). Afinstallation fjerner dem — undtagen på Android 6.0+ med Auto Backup. I lab 09-demoen husker ViewModellen det valgte emne: `Preferences.Default.Get("SelectedSubreddit", Subreddits[0])` i konstruktøren og `Set` i setteren.',
          ],
        },
        {
          term: 'HttpClient og REST',
          body: [
            '`HttpClient` sender HTTP-requests til en ressource identificeret ved en URI (se [[bad/rest|REST]]). Den er tænkt til at blive oprettet **én gang** og genbrugt i hele appens levetid — som `static` felt eller i en singleton-service — med en `BaseAddress`, så kaldene bruger relative routes. `GetAsync` + `EnsureSuccessStatusCode()` + `ReadAsStringAsync()` kan erstattes af `GetStringAsync`, og `GetFromJsonAsync<T>` (fra `System.Net.Http.Json`) deserialiserer JSON direkte til en modelklasse, hvis properties matcher felterne — `GenreList.genres`, `ElSpotPrices.records` eller `HackerNewsResponse.Hits`. Netværkskald lægges i try/catch med `HttpRequestException`.',
            'Metodetabellen dækker `PostAsync`, `PutAsync`, `PatchAsync` og `DeleteAsync`, og `SendAsync` tager en `HttpRequestMessage`, hvor headers kan sættes pr. request; headers til alle requests sættes på `DefaultRequestHeaders`. En request-body er en `HttpContent`-subklasse som `StringContent` eller `JsonContent`. På Android skal `android:usesCleartextTraffic="true"` stå på `<application>` i `AndroidManifest.xml`.',
            'Lab 07 henter elspotpriser fra `https://api.energidataservice.dk/` i `OnAppearing`; lab 09-demoen lægger kaldet i `HackerNewsService` bag interfacet `IHackerNewsService`, registrerer den som singleton og injicerer den i ViewModellen — samme vej, som når Opgave 1 må persistere via json-serveren fra Opgave 2.',
          ],
        },
        {
          term: 'Beskyttet API: authentication og delegating handler',
          body: [
            'Kræver API’et login, bruger MauiStockTake OAuth2 **code flow**: appen åbner IDP’ens login-side i en browser med `WebAuthenticator`, brugeren logger ind dér (appen ser aldrig passwordet), og IDP’en sender en code tilbage til en redirect-URI med et **custom URL scheme**, som appen har registreret pr. platform. `IdentityModel.OidcClient` parser svaret og udtrækker access token (en JWT, se [[bad/jwt|JWT]]). Secrets hører ikke til i en mobilapp; best practice er en web-backend som mellemled.',
            'Token’et skal med på hvert kald. En `DelegatingHandler` (`AuthHandler`) sætter headeren på alle requests fra en navngiven `HttpClient`, registreret med `services.AddHttpClient(AuthHandler.AUTHENTICATED_CLIENT).AddHttpMessageHandler(…)`; services henter klienten med `IHttpClientFactory.CreateClient(…)`. Materialet noterer, at `WebAuthenticator` ikke virker på Windows.',
          ],
        },
      ],
      viz: 'maui-data',
      keyPoints: [
        'Preferences til simple indstillinger, SecureStorage til hemmeligheder, SQLite til egentlige data.',
        '`[PrimaryKey, AutoIncrement]` på `Id`, og `CreateTableAsync<T>()` skal være færdig, før der læses eller skrives.',
        'Alle database- og HTTP-kald er `async` og returnerer `Task` — UI-tråden må ikke blokere.',
        'Én `HttpClient` med `BaseAddress`, genbrugt; `GetFromJsonAsync<T>` mapper JSON til en modelklasse.',
        'Dataadgangen ligger i en service bag et interface, som ViewModellen får injiceret.',
        '`sqlite-net-pcl` understøtter ikke relationer — fremmednøgler håndteres i appen.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Forbindelse til en krypteret SQLite-database',
          source: 'MAUI Making App Interactive.pdf s. 23',
          code: `var dataDir = FileSystem.AppDataDirectory;
var databasePath = Path.Combine(dataDir, "[yourappname].db");

string _dbEncryptionKey = SecureStorage.GetAsync("dbKey").Result;

if (string.IsNullOrEmpty(_dbEncryptionKey))
{
    Guid g = Guid.NewGuid();
    _dbEncryptionKey = g.ToString();
    SecureStorage.SetAsync("dbKey", _dbEncryptionKey);
}

var dbOptions = new SQLiteConnectionString(databasePath, true, key: _dbEncryptionKey);

_connection = new SQLiteAsyncConnection(dbOptions);`,
        },
        {
          lang: 'csharp',
          title: 'CRUD med sqlite-net',
          source: 'MAUI Making App Interactive.pdf s. 25',
          code: `public async Task<List<TodoItem>> GetTodos()
{
     return await _connection.Table<TodoItem>().ToListAsync();
}
public async Task<TodoItem> GetTodo(int id)
{
     var query = _connection.Table<TodoItem>().Where(t => t.Id == id);
     return await query.FirstOrDefaultAsync();
}
public async Task<int> Addtodo(TodoItem item)
{
     return await _connection.InsertAsync(item);
}
public async Task<int> DeleteTodo(TodoItem item)
{
     return await _connection.DeleteAsync(item);
}
public async Task<int> UpdateTodo(TodoItem item)
{
     return await _connection.UpdateAsync(item);
}`,
        },
        {
          lang: 'csharp',
          title: 'Service med HttpClient og GetFromJsonAsync',
          source: 'RedditBrowser.zip (demo til lab 09), Services/HackerNewsService.cs og MauiProgram.cs',
          code: `public class HackerNewsService : IHackerNewsService
{
    private readonly HttpClient _httpClient;
    string _baseUri = "https://hn.algolia.com/api/";

    public HackerNewsService()
    {
        _httpClient = new HttpClient { BaseAddress = new Uri(_baseUri) };
    }

    public async Task<HackerNewsResponse?> GetHackerNewsPostsAsync(string topic)
    {
        return await _httpClient.GetFromJsonAsync<HackerNewsResponse>(
                                    $"v1/search?query={topic}");
    }
}

// MauiProgram.cs
builder.Services.AddSingleton<IHackerNewsService, HackerNewsService>();`,
        },
      ],
      exam: [
        'MAUI har fire muligheder for lokal lagring: filsystemet, en database, Preferences og SecureStorage. Preferences er key/value til simple indstillinger, SecureStorage krypterer med en nøgle, som OS’et forvalter, og til egentlige data bruger jeg SQLite.',
        'I vittighedsopgaven fra januar 2026 gemmer jeg vittighederne med sqlite-net-pcl: en modelklasse med PrimaryKey og AutoIncrement på Id, CreateTableAsync, før jeg læser eller skriver, InsertAsync når brugeren trykker gem, og en Where-forespørgsel på tabellen, når der søges på et emneord.',
        'Alle database- og HTTP-kald er async og returnerer Task, så UI-tråden aldrig blokerer. Initialiseringen ligger i en async-metode, som konstruktøren kalder med discard, eller i OnAppearing.',
        'Remote data henter jeg med én HttpClient med BaseAddress, som ligger i en singleton-service bag et interface. GetFromJsonAsync deserialiserer JSON direkte til mine modelklasser. Det er samme vej, sættene fra sommer 2024, sommer 2025 og januar 2026 åbner for, når Opgave 1 må persistere via json-serveren fra Opgave 2.',
        'sqlite-net-pcl understøtter ikke relationer. I vane-appen fra vinter 2024 gemmer jeg derfor HabitId på hver HabitEntry og henter en vanes registreringer med en Where-forespørgsel.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L02.1_MAUI_Making_App_Interactive.md'), original: 'L02/Lectures/MAUI Making App Interactive.pdf', pages: 's. 16–26' },
        { path: ctx('slides/SW4FED-02_L05.3_HttpClient.md'), original: 'L05/Httpclient.pdf', pages: 's. 2–10' },
        { path: ctx('slides/SW4FED-02_L09.2_Preferences.md'), original: 'L09/Preferences.pdf', pages: 's. 2–10' },
        { path: ctx('slides/SW4FED-02_L07.4_Authentication_i_MAUI.md'), original: 'L07/Authentication in .NET MAUI.pdf', pages: 's. 2–26' },
        { path: ctx('noter/SW4FED-02_Note_SQLite_i_MAUI_apps.md'), original: 'Brug af SQLite i MAUI apps.html' },
        { path: ctx('noter/SW4FED-02_Note_Preferences_i_MAUI.md'), original: 'Preferences in .NET MAUI.html' },
        { path: ctx('kode/SW4FED-02_Lab02_MauiTodo_kode.md'), original: 'L02/Lab/Database.cs og L02/Lab/TodoItem.cs' },
        { path: ctx('labs/SW4FED-02_Lab07_El_spot_priser.md'), original: 'El spot priser.html' },
        { path: ctx('labs/SW4FED-02_Lab09_Hacker_News_browser.md'), original: 'Exercise 09 Hacker News browser.html' },
        { path: ctx('kode/SW4FED-02_Lab09_HackerNewsResponse.md'), original: 'L09/HackerNewsResponse.cs' },
        { path: redditZip, original: 'L09/RedditBrowser.zip', note: 'Demoprojekt til lab 09: Services/HackerNewsService.cs, ViewModels/SubredditViewModel.cs (Preferences)' },
        { path: ctx('book/MAUI_in_Action_Ch03_Making_apps_interactive.md'), original: '.NET MAUI in Action, kap. 3', pages: 'afsn. 3.3' },
        { path: ctx('book/MAUI_in_Action_Ch08_Enterprise_app_development.md'), original: '.NET MAUI in Action, kap. 8', pages: 'afsn. 8.1.2, 8.3' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 2', note: 'SQLite, filer eller json-server via HttpClient' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 2–3', note: 'Lokal persistering: SQLite eller filer; Habit/HabitEntry' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 2', note: '“Alle data skal persisteres”' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 2', note: 'SQLite eller json-server via HttpClient; søg på emneord' },
      ],
      gaps: [
        'Materialet er uenigt om nøglen: slidet (s. 23) og den udleverede `Database.cs` bruger `Guid.NewGuid()`, mens bogens listing 3.9 og underviserens SQLite-note bruger `new Guid()`. Uden for materialet: `new Guid()` er `Guid.Empty` (kun nuller), så alle installationer får samme nøgle.',
        'Tre eksamenssæt tillader persistering i filer, men materialet viser ingen kode til at gemme data i en fil (fx JSON-serialisering til en fil i `FileSystem.AppDataDirectory`).',
        'Materialet viser kun GET med `HttpClient`. `PostAsync`, `PutAsync` og `DeleteAsync` står i metodetabellen (*Httpclient.pdf* s. 7), men der er intet eksempel på at oprette, opdatere eller slette mod et REST-API som json-server. Uden for materialet: `System.Net.Http.Json` har også `PostAsJsonAsync` og `PutAsJsonAsync`.',
        'Uden for materialet: `usesCleartextTraffic` er nødvendigt, fordi Android som standard afviser http uden TLS — fx en json-server på `http://localhost`. Fra Android-emulatoren nås værtsmaskinens localhost som `10.0.2.2`.',
        'Den udleverede `TodoItem.cs` og bogens listing 3.7 mangler `[PrimaryKey, AutoIncrement]`; slidet (s. 22) og bogen lige efter listing 3.8 tilføjer dem. Uden for materialet: `InsertAsync` returnerer antallet af indsatte rækker, ikke det nye `Id`, selv om bogen (annotation til listing 3.11) beskriver `inserted != 0` som et tjek af `Id`.',
      ],
      keywords: ['SQLite', 'sqlite-net-pcl', 'SQLCipher', 'SQLiteAsyncConnection', 'SQLiteConnectionString', 'CreateTableAsync', 'InsertAsync', 'UpdateAsync', 'DeleteAsync', 'ToListAsync', 'PrimaryKey', 'AutoIncrement', 'CRUD', 'persistering', 'lokal database', 'FileSystem.AppDataDirectory', 'SecureStorage', 'Preferences', 'IPreferences', 'HttpClient', 'GetFromJsonAsync', 'BaseAddress', 'REST', 'JSON', 'json-server', 'usesCleartextTraffic', 'EF Core Sqlite', 'SQLiteStudio', 'WebAuthenticator', 'OidcClient', 'DelegatingHandler', 'IHttpClientFactory', 'OAuth2'],
    },
  ],
}
