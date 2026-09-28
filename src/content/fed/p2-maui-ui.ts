import type { Part } from '../types'
import { ctx } from './paths'

const bog = (kap: string) => `.NET MAUI in Action, kap. ${kap}`

export const mauiUi: Part = {
  id: 'maui-ui',
  title: 'MAUI · XAML og brugergrænseflade',
  topics: [
    {
      slug: 'xaml-maui',
      title: 'XAML, events og MAUI-appens opbygning',
      short: 'XAML og app-opbygning',
      week: 'Uge 1 · L1–L2',
      definition:
        '**XAML** er et XML-baseret sprog til at skabe træer af .NET-objekter. I MAUI beskriver XAML-filen UI’et, mens en **code-behind**-klasse i C# indeholder logikken, fx **event handlers**. Appen starter i `MauiProgram.CreateMauiApp`, som starter `App`, der viser en `Page`.',
      intro: [
        '.NET MAUI (Multi-platform App UI) er Microsofts framework til cross-platform UI-apps til Windows, macOS, iOS og Android fra én kodebase. Logikken skrives i et .NET-sprog, og UI’et defineres enten i XAML eller i det samme sprog. Bogen understreger, at MAUI-apps *er* native apps: koden kompileres til en native binary for hver målplatform, og UI’et er en abstraktion af platformens egne controls — “consistent but not identical”.',
      ],
      concepts: [
        {
          term: 'Velformet XML',
          body: [
            'XAML er XML med MAUI’s elementnavne, så XML’s regler gælder: et dokument har **præcis ét rod-element**, hvert element har start- og end-tag (eller den tomme form `<foo/>`), et attributnavn må kun optræde én gang pr. element, og attributværdier står altid i anførselstegn. Elementer skal være korrekt indlejrede — de må aldrig overlappe. Resultatet er en træstruktur, og det er netop det træ, XAML omsætter til objekter.',
          ],
        },
        {
          term: 'Namespaces, x:Class og code-behind',
          body: [
            'Rod-elementet henter to namespaces ind. `xmlns="http://schemas.microsoft.com/dotnet/2021/maui"` er **default namespace** uden præfiks og dækker MAUI’s typer (`ContentPage`, `Label` …) — ét XML-namespace, der omfatter flere .NET-namespaces. `xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"` giver præfikset `x` til XAML’s egne sprogfunktioner, fx `x:Class` og `x:Name`. Egne typer hentes ind med `clr-namespace:`, som XAML-compileren parser til et .NET-namespace og evt. et assembly, fx `xmlns:controls="clr-namespace:CustomControlsDemo.Controls"`.',
            '`x:Class="AlohaWorld.MainPage"` får XAML-compileren til at generere en klasse `MainPage` i namespacet `AlohaWorld`, som arver fra rod-elementets type (`ContentPage`). Code-behind-filen `MainPage.xaml.cs` erklærer samme klasse som `public partial class MainPage : ContentPage` og kalder `InitializeComponent()` i konstruktøren. `x:Name="CounterBtn"` gør elementet tilgængeligt fra code-behind som `CounterBtn`.',
            'Alle views er C#-klasser. Man kan have et view, der kun er en C#-fil, men ikke et XAML-view uden C#.',
          ],
        },
        {
          term: 'Attributter og content property',
          body: [
            'En attribut uden præfiks svarer til en property på objektet: `BackgroundColor="AliceBlue"` på `ContentPage` betyder, at siden sætter sin egen `BackgroundColor`. Indlejrede elementer lander i elementets **content property**, som typen udpeger med `ContentPropertyAttribute`: for `ContentPage` er det `Content` (ét barn), for `VerticalStackLayout` er det samlingen `Children`, så compileren i praksis kalder `v.Children.Add(…)` for hvert barn.',
            'Derfor svarer indlejringen i XAML direkte til indlejringen på skærmen: `ContentPage` › `ScrollView` › `VerticalStackLayout` › `Image`, `Label`, `Label`, `Button` — rækkefølgen af søskende er den rækkefølge, de vises i.',
          ],
        },
        {
          term: 'Appens opbygning',
          body: [
            '`MauiProgram.CreateMauiApp` er entry point. Den bruger **host builder**-mønstret: `MauiApp.CreateBuilder()`, `.UseMauiApp<App>()` (typen skal implementere `IApplication`, hvilket `Application` gør), `.ConfigureFonts(…)` og til sidst `builder.Build()`. Registrering af services sker samme sted — se [[di-generic-host|DI og Generic Host]].',
            '`App.xaml` fletter `Colors.xaml` og `Styles.xaml` ind i appens resource dictionary. `App.xaml.cs` overrider `CreateWindow` og returnerer `new Window(new AppShell())`, og shell’ens `ContentTemplate` viser `MainPage`. En **page** er et fuldskærms-view, et **view** er noget, der vises på skærmen.',
            'På Android og iOS/macOS forventer OS’et sine egne entry points: `MainActivity` og `AppDelegate`. De ligger under `Platforms/<platform>` og loader `MauiProgram` bag kulisserne. Ved build tages kun mappen for den platform, der bygges til, med.',
          ],
        },
        {
          term: 'Events og event handlers',
          body: [
            'Et event er en besked fra et objekt om, at noget er sket — fx et klik. Objektet, der raiser eventet, er **event senderen**, og den ved ikke, hvem der håndterer det. En **delegate** forbinder eventet med handler-metoden, og alle handlers tager to parametre: `object sender` (elementet, der raisede eventet) og `EventArgs e` (eller en afledt type med ekstra data, fx `TextChangedEventArgs`).',
            'I XAML kobles handleren på med attributten, `Clicked="OnCounterClicked"`, og navnet skal matche metoden i code-behind. I C# bruges `+=`. Bogen påpeger, at `Clicked` er en delegate, så metoden skal have den rigtige signatur; skal handleren await’e noget, erklæres den `async void` (FindMe’s `OnFindMeClicked`). I MauiCalc deler alle 16 knapper én handler, `Button_Clicked`, som caster `sender` til `Button` og læser `Text`.',
            'Event handlers i code-behind er udgangspunktet. Med [[mvvm|MVVM]] erstattes de af commands, som `Button` understøtter via sin `Command`-property.',
          ],
        },
      ],
      viz: 'maui-startup',
      keyPoints: [
        'XAML er XML: ét rod-element, korrekt indlejring, attributværdier i anførselstegn.',
        '`xmlns` (uden præfiks) = MAUI’s typer; `xmlns:x` = `x:Class`, `x:Name` osv.; `clr-namespace:` = egne typer.',
        '`x:Class` + `partial class` i `.xaml.cs` er én klasse; `InitializeComponent()` kaldes i konstruktøren.',
        'Attribut = property. Indlejret element = content property (`Content` eller `Children`).',
        'Opstart: `CreateMauiApp` → `App` → `Window(new AppShell())` → `MainPage`.',
        'Handler-signatur: `(object sender, EventArgs e)`; navnet i XAML skal matche metoden.',
      ],
      code: [
        {
          lang: 'xml',
          title: 'Knap med navn og Clicked-event i XAML',
          source: 'Event in Csharp.pdf s. 8',
          code: `<Button
    x:Name="CounterBtn"
    Text="Click me"
    SemanticProperties.Hint="Counts the number of times you click"
    Clicked="OnCounterClicked"
    HorizontalOptions="Center" />`,
        },
        {
          lang: 'csharp',
          title: 'Code-behind: partial class og event handler',
          source: 'MAUI introduction.pdf s. 25',
          code: `namespace AlohaWorld
{
    public partial class MainPage : ContentPage
    {
        int count = 0;

        public MainPage()
        {
            InitializeComponent();
        }

        private void OnCounterClicked(object sender, EventArgs e)
        {
            count++;

            if (count == 1)
                CounterBtn.Text = $"Clicked {count} time";
            else
                CounterBtn.Text = $"Clicked {count} times";

            SemanticScreenReader.Announce(CounterBtn.Text);
        }
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Opstart: MauiProgram og App',
          source: 'MAUI introduction.pdf s. 22–23',
          code: `// MauiProgram.cs
public static MauiApp CreateMauiApp()
{
    var builder = MauiApp.CreateBuilder();
    builder
        .UseMauiApp<App>()
        .ConfigureFonts(fonts =>
        {
            fonts.AddFont("OpenSans-Regular.ttf", "OpenSansRegular");
            fonts.AddFont("OpenSans-Semibold.ttf", "OpenSansSemibold");
        });

    return builder.Build();
}

// App.xaml.cs
public partial class App : Application
{
    public App()
    {
        InitializeComponent();
    }

    protected override Window CreateWindow(IActivationState? activationState)
    {
        return new Window(new AppShell());
    }
}`,
        },
      ],
      exam: [
        'En MAUI-app starter i `CreateMauiApp` i MauiProgram.cs. Den bruger host builder-mønstret og registrerer `App` med `UseMauiApp<App>()`. `App` laver et `Window` med en `AppShell`, og shell’ens `ContentTemplate` viser den første side.',
        'Hver side er én klasse fordelt på to filer: `x:Class` i XAML får compileren til at generere klassen, og code-behind er samme `partial class` med logikken. Alt, jeg kan skrive i XAML, kan jeg også skrive i C#.',
        'XAML er XML: en attribut er en property på objektet, og indlejrede elementer lander i content property’en — `Content` på en side, `Children` på et layout. Derfor er XAML-træet det samme som view-træet på skærmen.',
        'I eksaminator-appen (sommer 2025) er “Træk spørgsmål” en `Button` med `Clicked="…"` og en handler med signaturen `(object sender, EventArgs e)`. I en MVVM-løsning binder jeg i stedet knappens `Command` til en command i ViewModel’en.',
        'Opgaverne siger “kør på en device efter eget valg”. Det er den samme kode; MAUI bygger den til den valgte platform, og kun den platforms mappe under `Platforms/` kommer med i buildet.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L01.2_XML_Essentials.md'), original: 'L01/FED XML Essentials.pdf', pages: 's. 2–6' },
        { path: ctx('slides/SW4FED-02_L01.3_XAML.md'), original: 'L01/FED XAML.pdf', pages: 's. 2–9' },
        { path: ctx('slides/SW4FED-02_L01.6_MAUI_introduction.md'), original: 'L01/MAUI introduction.pdf', pages: 's. 4–7, 21–28' },
        { path: ctx('slides/SW4FED-02_L02.3_Events_i_Csharp.md'), original: 'L02/Lectures/Event in Csharp.pdf', pages: 's. 3–8', note: 'PDF-sider; PDF’en er et udsnit (9 sider), sidefodens slidenumre går til 19' },
        { path: ctx('slides/SW4FED-02_L02.1_MAUI_Making_App_Interactive.md'), original: 'L02/Lectures/MAUI Making App Interactive.pdf', pages: 's. 7', note: '`Platforms`-mappen' },
        { path: ctx('book/MAUI_in_Action_Ch01_Introducing_NET_MAUI.md'), original: bog('1'), pages: 'afsn. 1.2–1.3, 1.5 (PDF s. 37–60)' },
        { path: ctx('book/MAUI_in_Action_Ch02_Building_a_NET_MAUI_app.md'), original: bog('2'), pages: 'afsn. 2.3 (PDF s. 83–93)' },
        { path: ctx('book/MAUI_in_Action_Ch03_Making_apps_interactive.md'), original: bog('3'), pages: 'afsn. 3.2 (PDF s. 117–124)', note: '`Clicked` som delegate, `async void`-handler i FindMe' },
        { path: ctx('labs/SW4FED-02_Lab01_Hello_MAUI.md'), note: 'Lab 01: ændr handleren, så knappen tæller 2 op' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 2–3', note: 'Opgave 1: eksaminator-app med knapper til træk, start og slut' },
      ],
      gaps: [
        'Slides og bog beskriver opstarten forskelligt. `MAUI introduction.pdf` s. 21 siger, at `App` viser “a Page assigned to the MainPage property”, men koden på s. 23 bruger `CreateWindow` med `new Window(new AppShell())`. Bogen (.NET 7, listing 2.2, PDF s. 86) sætter `MainPage = new MainPage();` i konstruktøren. Slidekoden svarer til den nyere template.',
        '`Event in Csharp.pdf` s. 5 skriver “To raise an event … using the += operator”. Uden for materialet: `+=` abonnerer en handler på eventet; det er senderen, der raiser det. Eksemplet på samme slide (`MessageBox.Show(((MouseEventArgs)e).Location…)`) er Windows Forms-kode, ikke MAUI.',
        '`FED XAML.pdf` s. 7 oversætter `BackgroundColor="AliceBlue"` til `this.BackgroundColor = "AliceBlue";`. Det er pseudokode: `BackgroundColor` er af typen `Color` (bog afsn. 10.1.1). Uden for materialet: i C# skrives `Colors.AliceBlue`; i XAML konverterer parseren strengen.',
        'Materialet forklarer ikke, hvad `partial` gør, eller hvad `InitializeComponent()` udfører — kun at den skal stå i konstruktøren (Lab 02: “slet **ikke** `InitializeComponent();`”).',
      ],
      keywords: ['XAML', 'XML', 'well-formed', 'velformet', 'namespace', 'xmlns', 'x:Class', 'x:Name', 'clr-namespace', 'code-behind', 'partial class', 'InitializeComponent', 'ContentProperty', 'MauiProgram', 'CreateMauiApp', 'UseMauiApp', 'host builder', 'App.xaml', 'AppShell', 'CreateWindow', 'MainPage', 'event', 'event handler', 'sender', 'EventArgs', 'Clicked', 'delegate', 'MainActivity', 'AppDelegate', 'Platforms'],
    },

    {
      slug: 'controls-layouts',
      title: 'Controls og layouts',
      week: 'Uge 2–3 · L3–L5',
      definition:
        'Et MAUI-UI er et træ af **views** i tre slags: en **page** fylder skærmen og har ét barn, **layouts** arrangerer deres børn, og **controls** viser noget eller tager imod input. `Grid` er det mest kraftfulde layout: rækker og kolonner med proportional (`*`), fast (DIU) eller `Auto`-størrelse.',
      concepts: [
        {
          term: 'Page, layout og control',
          body: [
            'Appen ved, hvordan den viser en page; en page ved, hvordan den renderer ét layout; layouts ved, hvordan de renderer controls og andre layouts. En page kan kun have ét barn. Controls er views, der enten viser noget eller tager input fra brugeren — ca. 30 følger med MAUI.',
            'Controls er **abstraktioner af platformens egne controls**: en `Entry` ser ud som en iOS-control på iOS og en Windows-control på Windows. Terminologien driller: slides og bog bruger *view* som paraplybetegnelse og *control* om de enkelte elementer, mens MAUI-dokumentationen kalder controls for views.',
          ],
        },
        {
          term: 'Controls efter formål',
          body: [
            '**Visning:** `Label`, `ProgressBar` (brøkdel, fx download), `ActivityIndicator` (noget er i gang). **Input**, hvor hver control har en bindable værdi-property: `Entry` og `Editor` (`Text`), `CheckBox` og `RadioButton` (`IsChecked`), `DatePicker` (`Date`, en `DateTime`), `TimePicker` (`Time`, en `TimeSpan`), `Slider` og `Stepper` (`Value`), `Picker` (`SelectedItem`). **Kommandoer:** `Button` og `ImageButton` (`Command` eller `Clicked`), `SearchBar` (`SearchCommand` eller `SearchButtonPressed`).',
            '**Grafik:** `Image`, hvis `Source` er en `ImageSource` fra fil, URL, resource eller stream (`FromFile`, `FromUrl`, `FromResource`, `FromStream` — i XAML gætter MAUI selv typen), `Shapes` og `GraphicsView`. **Samlinger:** `CollectionView` er arbejdshesten (lodret/vandret liste eller grid, single og multiple selection); `CarouselView` bygger på den og kan loope; `ListView` er den ældre udgave; `TableView` har ingen `ItemsSource`. Binding af lister står under [[data-binding|Data binding]].',
          ],
        },
        {
          term: 'Størrelse og control modifiers',
          body: [
            '`Height` og `Width` er read-only og aflæser den faktiske størrelse. Den ønskede størrelse sættes med `HeightRequest` og `WidthRequest` i **device-independent units** (DIU, ca. 160 pr. tomme eller 64 pr. cm). Bogen tilføjer, at værdierne begrænses af fx forælderens størrelse. En værdi uden `*` er altid DIU.',
            'Modifiers kan sættes på ethvert view: `Clip` med en geometri (`EllipseGeometry`, `LineGeometry`, `RectangleGeometry` eller en `GeometryGroup`), `Border` (`Stroke` er en `Brush`, `StrokeThickness`, `StrokeShape` som `RoundRectangle`), `Shadow` (`Brush`, `Opacity`, `Radius`, `Offset`), gesture recognizers (tap, pan, swipe, pinch, drag and drop), `RefreshView` (pull-to-refresh med `Command` og `IsRefreshing`) og `SwipeView` (`LeftItems`/`RightItems`/`TopItems`/`BottomItems`, `Mode` `Execute` eller `Reveal`).',
          ],
        },
        {
          term: 'Grid',
          body: [
            '`Grid` bruger rækker og kolonner til at **placere views**, ikke til at vise tabeldata. `RowDefinitions` og `ColumnDefinitions` kan skrives som elementer eller kort: `RowDefinitions="*,*"`. `*` giver en lige andel af den resterende plads, `4*` et forhold (`1*, 3*, 8*` er det samme som `4*, 12*, 32*`), et tal en fast størrelse i DIU, og `Auto` en højde, der tilpasser sig indholdet (MauiTodo-templatens `RowDefinitions="Auto, 50"`). `RowSpacing` og `ColumnSpacing` er 0 som standard.',
            'Børn placeres med de attached properties `Grid.Row` og `Grid.Column`, der tæller fra 0, og kan spænde over flere celler med `Grid.RowSpan` og `Grid.ColumnSpan`. MauiCalc har fire kolonner og fem rækker: skærmen står i række 0 med `ColumnSpan="4"`, knapperne i række 1–4. Med `4*` for skærmrækken får den halvdelen af højden; med faste 100 DIU til knapperne og `HorizontalOptions="Center"` bliver de kvadratiske på alle skærme.',
            '“Thinking in grids”: et komplekst design brydes ned i et øverste `Grid` og indlejrede `Grid`s. SSW Rewards’ profilside er rækkerne `2*, 9*, 3*` og kolonnerne `*, 5*, *`, og detaljesektionen et indre `Grid` med `*, *` og `5*, 2*, *`.',
          ],
        },
        {
          term: 'Stack, Flex, Scroll og Absolute',
          body: [
            '`VerticalStackLayout` og `HorizontalStackLayout` stabler `Children` i den rækkefølge, de tilføjes; `Spacing` sætter afstanden, og bogen kalder spacing et af de vigtigste aspekter af layout. Det, der ikke er plads til, bliver ikke vist. `FlexLayout` er MAUI’s udgave af CSS flexbox (se [[flexbox-grid|Flexbox og CSS Grid]]) og **wrapper** i stedet til næste række eller kolonne.',
            '`ScrollView` er teknisk en control, men bruges som layout. Den scroller lodret som standard (også vandret, begge eller ingen). Undgå scrollende views inde i hinanden i samme retning; vinkelret er i orden. `AbsoluteLayout` placerer med `LayoutBounds` (x, y, bredde, højde) og `LayoutFlags`, der gør værdierne proportionale — fx en floating action button på `0.9,0.9,100,100` med `PositionProportional`.',
            '`BindableLayout` er ikke et layout, men en statisk klasse, der gør ethvert layout til et collection view med `BindableLayout.ItemsSource` og `ItemTemplate`. Den passer bedst på `FlexLayout` (genre-chips i MauiMovies) og giver ingen mening på `Grid`, hvor børn skal have række og kolonne. Skal brugeren vælge i listen, er `CollectionView` bedre.',
          ],
        },
      ],
      viz: 'grid-layout',
      keyPoints: [
        'Page → ét layout → layouts og controls. Alle er views, og alle er klasser.',
        '`*` = lige andel af resten, `4*` = forhold, `100` = fast størrelse i DIU, `Auto` = følger indholdet.',
        '`Grid.Row`/`Grid.Column` tæller fra 0; `RowSpan`/`ColumnSpan` strækker et view over flere celler.',
        'Stack layouts viser ikke det, der ikke er plads til; `FlexLayout` wrapper.',
        '`HeightRequest`/`WidthRequest` sætter størrelsen; `Height`/`Width` er read-only.',
        '`CollectionView` til lister med interaktion; `BindableLayout` når et layout blot skal genereres fra data.',
      ],
      code: [
        {
          lang: 'xml',
          title: 'MauiCalc: 4 × 5-Grid, skærm over alle kolonner',
          source: 'Layouts.pdf s. 8, 9 og 12',
          code: `<Grid ColumnDefinitions="*,*,*,*"
      RowDefinitions="*,*,*,*,*"
      RowSpacing="2"
      ColumnSpacing="2">

    <Label Grid.Row="0"
           Grid.Column="0"
           Grid.ColumnSpan="4"
           HorizontalTextAlignment="End"
           VerticalTextAlignment="End" />

    <Button Grid.Row="3"
            Grid.Column="0"
            Text="+" />
    <!-- ... -->
</Grid>`,
        },
        {
          lang: 'xml',
          title: 'Faste knapper på 100 DIU, skærmen tager resten',
          source: 'Layouts.pdf s. 20',
          code: `<Grid ColumnDefinitions="100,100,100,100"
      RowDefinitions="*,100,100,100,100"
      HorizontalOptions="Center"
      RowSpacing="2"
      ColumnSpacing="2">`,
        },
        {
          lang: 'xml',
          title: 'BindableLayout på et FlexLayout (MauiMovies-genrer)',
          source: 'Advanced layout concepts.pdf s. 10',
          code: `<FlexLayout BindableLayout.ItemsSource="{Binding Genres}"
            JustifyContent="SpaceEvenly"
            Wrap="Wrap">
    <BindableLayout.ItemTemplate>
        <DataTemplate>
            <Border Stroke="CadetBlue"
                    StrokeShape="RoundRectangle 15">
                <Label Text="{Binding name}"
                       TextColor="White"
                       Padding="10"
                       BackgroundColor="CadetBlue"/>
            </Border>
        </DataTemplate>
    </BindableLayout.ItemTemplate>
</FlexLayout>`,
        },
      ],
      exam: [
        'Jeg bygger siderne med et `Grid` som ydre layout, fordi jeg kan dele skærmen i rækker med `*`, faste DIU-værdier eller `Auto`, og placere hvert view med `Grid.Row` og `Grid.Column` fra 0. Stack layouts bruger jeg inde i cellerne til små grupper.',
        'I bilværkstedsopgaven (sommer 2024) skal dato og klokkeslæt for indlevering indtastes. Det gør jeg med en `DatePicker`, hvis `Date` er en `DateTime`, og en `TimePicker`, hvis `Time` er en `TimeSpan`, frem for fritekst i en `Entry`. Samme controls dækker dato og starttidspunkt i eksaminator-appen (sommer 2025).',
        'Til lister som vittighederne (vinter 25/26) bruger jeg en `CollectionView`: den scroller selv og understøtter selection. `BindableLayout` på et `FlexLayout` er nok, når elementer bare skal vises og wrappe, som genre-chips i MauiMovies.',
        'Forskellen på stack layouts og `FlexLayout` er, hvad der sker, når pladsen slipper op: en stack viser ikke resten, et `FlexLayout` wrapper til næste række. Derfor passer `FlexLayout` til billedrækkerne i Lab 05.',
        'Størrelser er i device-independent units, ca. 160 pr. tomme. `WidthRequest="150"` fylder derfor nogenlunde det samme på en telefon og en laptop.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L03.1_Controls.md'), original: 'L03/FED Controls.pdf', pages: 's. 2–22' },
        { path: ctx('slides/SW4FED-02_L04.2_Layouts.md'), original: 'Layouts.pdf', pages: 's. 2–33', note: 'PDF’en har 34 sider; metadata-blokken siger 35 slides' },
        { path: ctx('slides/SW4FED-02_L05.1_Advanced_layout_concepts.md'), original: 'L05/Advanced layout concepts.pdf', pages: 's. 2–14' },
        { path: ctx('book/MAUI_in_Action_Ch04_Controls.md'), original: bog('4'), pages: 'afsn. 4.1–4.4 (PDF s. 164–202)' },
        { path: ctx('book/MAUI_in_Action_Ch05_Layouts.md'), original: bog('5'), pages: 'afsn. 5.1–5.4 (PDF s. 205–252)' },
        { path: ctx('book/MAUI_in_Action_Ch06_Advanced_layout_concepts.md'), original: bog('6'), pages: 'afsn. 6.1–6.3 (PDF s. 254–303)' },
        { path: ctx('book/MAUI_in_Action_Ch03_Making_apps_interactive.md'), original: bog('3'), pages: 'listing 3.14 (PDF s. 154)', note: '`Auto` i MauiTodo-templaten' },
        { path: ctx('labs/SW4FED-02_Lab04_MauiCalc.md'), note: 'Lab 04: MauiCalc med Grid, ColumnSpan og LCD-font' },
        { path: ctx('labs/SW4FED-02_Lab03_SelectImages.md'), note: 'Lab 03: Entry, Editor, Image, FilePicker og CollectionView' },
        { path: ctx('labs/SW4FED-02_Lab05_SelectImages_v2.md'), note: 'Lab 05: wrap-around med 150 DIU brede billeder og popup' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Sommer.md'), original: 'L28/SW4FED-02 2024 Sommer.pdf', pages: 's. 2', note: 'Opgave 1: dato og klokkeslæt, kalenderside' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 2–3', note: 'Opgave 1: browse ved scroll eller side for side' },
      ],
      gaps: [
        '`Auto` som række-/kolonnestørrelse nævnes hverken i Layouts-slidesne eller i kap. 5. Det optræder kun i MauiTodo-templaten (`RowDefinitions="Auto, 50"`), som bogen forklarer som “en højde der tilpasser sig indholdet” (listing 3.14, PDF s. 154).',
        '“Thinking in grids”-koden (`Advanced layout concepts.pdf` s. 6, bog listing 6.1) bruger Xamarin.Forms-namespacet `http://xamarin.com/schemas/2014/forms` og mangler det lukkende `</Grid>`. Det er et udsnit fra SSW Rewards, ikke gyldig MAUI-XAML.',
        'Popup-slidet (`Advanced layout concepts.pdf` s. 11) har et semikolon efter `.UseMauiCommunityToolkit();`, som bryder kæden. Slidet angiver versionsmatch: .NET 8 ↔ CommunityToolkit.Maui 9, .NET 9 ↔ 11, .NET 10 ↔ 14.',
        '`FlexLayout`s properties (`Direction`, `Wrap`, `JustifyContent`, `AlignItems`) forklares ikke systematisk; slides og bog viser dem kun i eksempler og henviser til CSS flexbox.',
        '`AbsoluteLayout` står på slidens liste (`Layouts.pdf` s. 3), men gennemgås kun i bogen (afsn. 6.3). Bogen fraråder desuden `RelativeLayout`, som slides ikke nævner.',
      ],
      keywords: ['view', 'page', 'layout', 'control', 'Label', 'Entry', 'Editor', 'DatePicker', 'TimePicker', 'Picker', 'CheckBox', 'Slider', 'Stepper', 'Button', 'SearchBar', 'Image', 'ImageSource', 'CollectionView', 'CarouselView', 'DIU', 'device-independent units', 'HeightRequest', 'WidthRequest', 'Border', 'Shadow', 'Clip', 'SwipeView', 'RefreshView', 'gesture recognizer', 'Grid', 'RowDefinitions', 'ColumnDefinitions', 'Grid.Row', 'ColumnSpan', 'RowSpan', 'Auto', 'VerticalStackLayout', 'HorizontalStackLayout', 'FlexLayout', 'ScrollView', 'AbsoluteLayout', 'BindableLayout', 'MauiCalc'],
    },

    {
      slug: 'data-binding',
      title: 'Data binding',
      week: 'Uge 1 · L2',
      definition:
        '**Data binding** kobler en property på et **target** (et UI-objekt, der arver `BindableObject`) til en property på en **source**, så en ændring i den ene afspejles i den anden. Source findes via `BindingContext`, som arves ned gennem view-træet.',
      intro: [
        'Uden binding henter og sætter man værdier i code-behind via `x:Name` — MauiTodo skrev først hele listen ind i én `Label`. Med binding peger man én property på en anden og lader MAUI klare resten. Det er også forudsætningen for [[mvvm|MVVM]].',
      ],
      concepts: [
        {
          term: 'Source, target og bindable properties',
          body: [
            '**Source** er den autoritative data, der skal vises. **Target** er objektet, bindingen sættes på — typisk en control. Target skal arve `BindableObject` (det gør alle indbyggede controls), og target-propertyen skal være en **bindable property**: `Label.Text` er fx backet af `TextProperty`. Source kan være af enhver type, men typerne skal passe; ellers bruges en value converter.',
            'I kode kræver binding to trin: sæt target’s `BindingContext` til source-objektet, og kald `SetBinding` på target. I XAML erstatter markup extension’en `{Binding}` kaldet til `SetBinding`: `Text="{Binding Title}"` binder `Text` til `Title` på binding context.',
          ],
        },
        {
          term: 'BindingContext arves',
          body: [
            'Hvert view har ét binding context. Sætter man det ikke på en control i en `ContentPage`, er det sidens. Sættes det eksplicit på et layout eller en collection, arver børnene i stedet det. Slidets figur viser begge dele: siden har sin code-behind som binding context, og en `VerticalStackLayout` inde i den har et objekt fra code-behind.',
            'Binding context kan sættes fra code-behind (`BindingContext = this;` i konstruktøren, som i MauiMovies og Lab 03), med `StaticResource` eller `x:Static`, som property-element-tags, eller med `{x:Reference}` — MauiTodo giver siden `x:Name="PageTodo"` og sætter `BindingContext="{x:Reference PageTodo}"`, så al binding står i XAML. Bindings finder properties ved navn, og det skal være **public properties**.',
          ],
        },
        {
          term: 'View-to-view bindings',
          body: [
            'Med `{x:Reference Navn}` kan et view bruge et andet view på samme side som binding context, uden code-behind. En `Label` med `BindingContext="{x:Reference TextEntry}"` og `Text="{Binding Text}"` viser det, der skrives i `Entry`’en. Et `Image` med `Scale="{Binding Value}"` og `ZoomSlider` som binding context zoomer, når slideren flyttes. Uden binding skulle man skrive en handler til `Slider`’ens `ValueChanged`-event.',
          ],
        },
        {
          term: 'CollectionView, DataTemplate og ItemTemplate',
          body: [
            '`CollectionView.ItemsSource` (type `IEnumerable`) angiver samlingen, og `ItemTemplate` (type `DataTemplate`) angiver, hvordan hvert item vises. En `DataTemplate` er definitionen af et vilkårligt layout; `ItemTemplate` er den template, som netop denne `CollectionView` bruger. Templates kan stå inline eller være selvstændige, genbrugelige views.',
            'I en `ItemTemplate` er binding context **selve item’et**, ikke hele samlingen. Derfor kan MauiTodo-kortet skrive `{Binding Title}` og `{Binding Due, StringFormat=\'{0:dd MMM yyyy}\'}` direkte.',
          ],
        },
        {
          term: 'ObservableCollection og change notification',
          body: [
            '`ObservableCollection<T>` er en generisk samling som `List<T>`, men den er koblet til XAML-enginen, så den giver besked, når items **tilføjes eller fjernes**. `Todos.Add(todo)` får derfor `CollectionView`’en til at vise et nyt kort uden ekstra kode.',
            'Materialet siger kun, at den dækker tilføj og fjern. Skal UI’et opdateres, fordi værdien af en almindelig property ændrer sig, skal klassen implementere `INotifyPropertyChanged` og rejse `PropertyChanged` — det er emnet i [[mvvm|MVVM]]. Alle `Page`s implementerer interfacet, derfor kan MauiMovies’ code-behind kalde `OnPropertyChanged(nameof(IsLoading))`.',
          ],
        },
      ],
      viz: 'data-binding',
      keyPoints: [
        'Target = bindable property på et `BindableObject` (UI’et); source = dataene, af enhver type.',
        '`BindingContext` sættes ét sted og arves af alle børn, der ikke har deres eget.',
        '`{x:Reference Navn}` binder view til view uden code-behind.',
        'I en `ItemTemplate` er binding context det enkelte item.',
        '`ObservableCollection` giver besked ved tilføj/fjern; en ændret property-værdi kræver `INotifyPropertyChanged`.',
        'Kun public properties kan bindes.',
      ],
      code: [
        {
          lang: 'xml',
          title: 'View-to-view: Label følger Entry, Image følger Slider',
          source: '.NET MAUI in Action, listing 3.12–3.13 (PDF s. 149–150)',
          code: `<VerticalStackLayout VerticalOptions="Center"
                     HorizontalOptions="Center"
                     Spacing="20"
                     WidthRequest="200">

    <Label FontSize="Title"
           BindingContext="{x:Reference TextEntry}"
           Text="{Binding Text}"
           HorizontalTextAlignment="Center"/>

    <Entry x:Name="TextEntry"
           Placeholder="Enter some text..." />

    <Slider x:Name="ZoomSlider" />

    <Image Source="dotnet_bot.png"
           WidthRequest="300"
           HorizontalOptions="Center"
           BindingContext="{x:Reference ZoomSlider}"
           Scale="{Binding Value}" />
</VerticalStackLayout>`,
        },
        {
          lang: 'xml',
          title: 'CollectionView med DataTemplate (MauiTodo)',
          source: '.NET MAUI in Action, listing 3.14 (PDF s. 154–155)',
          code: `<CollectionView Grid.Row="4"
                x:Name="TodosCollection">
    <CollectionView.ItemTemplate>
        <DataTemplate>
            <Grid WidthRequest="350"
                  Padding="10"
                  Margin="0,20"
                  ColumnDefinitions="2*, 5*"
                  RowDefinitions="Auto, 50"
                  x:Name="TodoItem">
                <CheckBox VerticalOptions="Center"
                          HorizontalOptions="Center"
                          Grid.Column="0"
                          Grid.Row="0" />
                <Label Text="{Binding Title}"
                       FontAttributes="Bold"
                       LineBreakMode="WordWrap"
                       HorizontalOptions="StartAndExpand"
                       FontSize="Large"
                       Grid.Row="0"
                       Grid.Column="1"/>
                <Label Text="{Binding Due, StringFormat='{0:dd MMM yyyy}'}"
                       Grid.Column="1"
                       Grid.Row="1"/>
            </Grid>
        </DataTemplate>
    </CollectionView.ItemTemplate>
</CollectionView>`,
        },
        {
          lang: 'xml',
          title: 'Al binding i XAML: siden er sin egen binding context',
          source: '.NET MAUI in Action, listing 3.15 (PDF s. 159)',
          code: `<ContentPage xmlns="http://schemas.microsoft.com/dotnet/2021/maui"
             xmlns:x="http://schemas.microsoft.com/winfx/2009/xaml"
             x:Class="MauiTodo.MainPage"
             BackgroundColor="{DynamicResource SecondaryColor}"
             x:Name="PageTodo"
             BindingContext="{x:Reference PageTodo}">
    <!-- ... -->
    <CollectionView Grid.Row="4"
                    ItemsSource="{Binding Todos}"
                    x:Name="TodosCollection">`,
        },
      ],
      exam: [
        'Data binding forbinder en target-property på et UI-element med en source-property. Target skal være en bindable property på et objekt, der arver `BindableObject`; source kan være hvad som helst, bare typen passer.',
        'Jeg sætter `BindingContext` ét sted — på siden eller til ViewModel’en — og så arver alle børn den. I en `ItemTemplate` er binding context det enkelte item, så `{Binding Title}` rammer item’ets `Title`.',
        'I vittighedsopgaven (vinter 25/26) viser jeg søgeresultatet i en `CollectionView` bundet til en `ObservableCollection`. Når jeg rydder den og tilføjer de vittigheder, der matcher emneordet, opdaterer listen sig selv, fordi samlingen giver besked ved tilføj og fjern.',
        'Ændrer en almindelig property værdi — fx den nuværende streak i habit-trackeren (vinter 24/25) — skal klassen implementere `INotifyPropertyChanged` og kalde `OnPropertyChanged`. Ellers ser UI’et ikke ændringen.',
        'View-to-view binding med `x:Reference` kræver ingen code-behind: `Scale` på et `Image` bundet til `Value` på en `Slider` erstatter en `ValueChanged`-handler.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L02.2_Data_Binding_Basics.md'), original: 'L02/Lectures/Data Binding Basics.pdf', pages: 's. 4–24' },
        { path: ctx('slides/SW4FED-02_L08.1_The_MVVM_Pattern.md'), original: 'L08/The MVVM Pattern.pdf', pages: 's. 19–21', note: '`INotifyPropertyChanged` og “public properties must be used for binding”' },
        { path: ctx('book/MAUI_in_Action_Ch03_Making_apps_interactive.md'), original: bog('3'), pages: 'afsn. 3.4–3.4.3 (PDF s. 143–160)' },
        { path: ctx('book/MAUI_in_Action_Ch04_Controls.md'), original: bog('4'), pages: 'afsn. 4.3 (PDF s. 170–172)', note: '`ItemsSource`, `ItemTemplate`, `SelectedItem(s)`' },
        { path: ctx('book/MAUI_in_Action_Ch09_The_MVVM_Pattern.md'), original: bog('9'), pages: 'afsn. 9.3.4 (PDF s. 479–482)', note: 'Hvorfor `INotifyPropertyChanged` er nødvendig; alle pages implementerer den' },
        { path: ctx('labs/SW4FED-02_Lab02_MauiTodo.md'), note: 'Lab 02: CollectionView, ObservableCollection og ItemsSource flyttet til XAML' },
        { path: ctx('labs/SW4FED-02_Lab03_SelectImages.md'), note: 'Lab 03, delopgave 4–5: `BindingContext = this;` og CollectionView' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 2–3', note: 'Opgave 1: vis og søg vittigheder' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2024_Vinter.md'), original: 'L28/SW4FED-02 2024 Vinter.pdf', pages: 's. 2–3', note: 'Opgave 1: vaner, streaks og kalender' },
      ],
      gaps: [
        'Bogen modsiger sig selv om `ItemsSource` i kode: afsn. 3.4.2 sætter `TodosCollection.ItemsSource = Todos;` (PDF s. 156), men afsn. 4.3 skriver, at man ikke direkte kan tildele en collection i kode og skal bruge `SetBinding` (PDF s. 170). Slide s. 24 staver det `ItemSource`.',
        '`SetBinding` beskrives (Data Binding Basics.pdf s. 7), men hverken slides eller kap. 3 viser et kodeeksempel.',
        'Binding modes (`OneWay`, `TwoWay`, `OneWayToSource`, `OneTime`) forklares ikke. `Mode=TwoWay` optræder kun i eksempler (bog listing 9.6 og 11.10; `defaultBindingMode` i Custom controls.pdf s. 11). Uden for materialet: de fleste properties binder som standard én vej, source → target, mens fx `Entry.Text` binder begge veje.',
        'Lab 03 (delopgave 4) erklærer `ObservableCollection<ImageInfo> Images { get; set; }` uden `public`, selv om bindings kræver public properties (MVVM Pattern.pdf s. 21).',
        'Value converters nævnes som løsningen på forskellige typer (kap. 3), men gennemgås først i kap. 8.',
      ],
      keywords: ['data binding', 'binding', 'source', 'target', 'BindableObject', 'bindable property', 'BindingContext', 'SetBinding', '{Binding}', 'x:Reference', 'view-to-view', 'CollectionView', 'ItemsSource', 'ItemTemplate', 'DataTemplate', 'ObservableCollection', 'INotifyPropertyChanged', 'PropertyChanged', 'OnPropertyChanged', 'StringFormat', 'value converter', 'Mode=TwoWay', 'MauiTodo'],
    },

    {
      slug: 'styles-custom-controls',
      title: 'Styles, themes og custom controls',
      short: 'Styles og custom controls',
      week: 'Uge 5–6 · L10–L11',
      definition:
        'En **style** samler `Setter`s for én `TargetType`, så udseendet defineres ét sted — *eksplicit* med `x:Key` eller *implicit* uden. Styles og farver ligger i **resource dictionaries** og anvendes hierarkisk. Et **custom control** samler controls i en `ContentView` og eksponerer sine værdier som **bindable properties**.',
      concepts: [
        {
          term: 'Style, Setter og TargetType',
          body: [
            'At sætte `FontSize`, `HorizontalOptions` osv. på hver control er både arbejdskrævende og en kilde til fejl, der undergraver konsistensen. En `Style` grupperer i stedet en samling `Setter`s; hver `Setter` har en `Property` (navnet på en bindable property) og en `Value`. Target skal være et `VisualElement`, der matcher stylens `TargetType`.',
            'En **eksplicit** style har både `TargetType` og `x:Key` og anvendes med `Style="{StaticResource labelStyle}"`. En **implicit** style har kun `TargetType` og rammer automatisk alle elementer af typen i sit scope — det er sådan templatens `Styles.xaml` giver alle `Button`s samme udseende. Bogen: en style giver først værdi, når den bruges på mere end én control.',
          ],
        },
        {
          term: 'Scope, resource dictionaries og hierarki',
          body: [
            'Hvor en style defineres, bestemmer dens scope: på en control (gælder controllen og dens børn), i `ContentPage.Resources` (siden og dens børn) eller i appens `Application.Resources` (hele appen). Et `ResourceDictionary` er et lager til styles, control templates, data templates, converters og farver; `App.xaml` fletter `Colors.xaml` og `Styles.xaml` ind med `MergedDictionaries`.',
            'Værdier anvendes hierarkisk: app-level styles er default, page-level styles overskriver dem, en eksplicit style vinder over en implicit, og en værdi sat direkte på controllen overskriver alle styles. Bogen formulerer det sådan, at snævrere scope vinder.',
          ],
        },
        {
          term: 'StaticResource, DynamicResource og AppThemeBinding',
          body: [
            '`StaticResource` slår nøglen op én gang. `DynamicResource` holder et link til nøglen, så en erstattet post slår igennem ved runtime: `Resources["SearchBarStyle"] = Resources["greenSearchBarStyle"];`. Brug `StaticResource`, hvis temaet ikke skal skifte ved runtime.',
            '`AppThemeBinding` giver én værdi til light mode og én til dark mode og følger OS’ets tema — fx `Light={StaticResource Primary}, Dark={StaticResource White}` på en `ActivityIndicator`. Den kan bruges overalt, ikke kun til farver. Begrænsning: `AppThemeBinding` og `DynamicResource` virker ikke sammen. Løsningen er et **theme**: ét resource dictionary med både farver og styles (`DefaultTheme`, `SandyTheme`, oprettet med templaten, så der følger code-behind med). Temaet skiftes ved at rydde `Application.Current.Resources.MergedDictionaries` og tilføje `new SandyTheme()`.',
          ],
        },
        {
          term: 'Triggers og Visual State Manager',
          body: [
            'Triggers ændrer udseendet deklarativt med `Setter`s. En **property trigger** reagerer på controllens egen property (`Entry` med `IsFocused` = `True` får gul baggrund). En **data trigger** reagerer på bundne data (en `Button` er disabled, så længe `Text.Length` på en `Entry` er 0). En **multi-trigger** kræver, at alle betingelser er sande. En **event trigger** kører en `TriggerAction<T>` som reaktion på et event. Triggers kan stå direkte på controllen eller i en style.',
            'Property- og data-triggers ruller ændringen tilbage, når betingelsen ikke længere er opfyldt; event triggers gør ikke. Visual State Manager har gruppen `CommonStates` med `Normal`, `Disabled`, `Focused`, `Selected` og `PointerOver`, som udelukker hinanden. Bogen understreger, at VSM heller ikke ruller tilbage — derfor skal `Normal` altid defineres, evt. uden setters.',
          ],
        },
        {
          term: 'Custom controls med ContentView',
          body: [
            'Der er tre veje: saml controls i en genbrugelig komponent, tilpas de indbyggede platform-implementeringer (handlers), eller tegn selv med `Microsoft.Maui.Graphics`. Komponenter bygges med `ContentView` (template “.NET MAUI ContentView (XAML)”). Eksemplet er en stepper med redigerbart felt i stedet for `Label` + `Stepper`, som er upraktisk til store tal: et `Grid` med `ColumnDefinitions="50,120,50"`, en minusknap, en `Entry` og en plusknap, hvis handlers tæller en `Value`-property op og ned.',
            'Controllen bruges fra en side via et XML-namespace: `xmlns:controls="clr-namespace:CustomControlsDemo.Controls"` og `<controls:MyStepper … />`. Bogen viser også handlers: en handler mapper hver cross-platform control til den native control, og `EntryHandler.Mapper.AppendToMapping(…)` kan fx fjerne kanten på en `Entry` — for alle instanser, medmindre man subclasser (`BorderlessEntry`).',
          ],
        },
        {
          term: 'Bindable properties',
          body: [
            'Target for en binding skal arve `BindableObject` (det gør `ContentView`), og target-propertyen skal være en **bindable property**. En almindelig `public int Value { get; set; }` kan derfor ikke bindes: `Value="{Binding Count}"` virker ikke.',
            'Konventionen: en `public static readonly BindableProperty ValueProperty`, oprettet med `BindableProperty.Create(nameof(Value), typeof(int), typeof(MyStepper), …)`. Navnet er propertyens navn + `Property`, og den almindelige propertys getter og setter kalder `GetValue` og `SetValue`, som arves fra `BindableObject`. `Create` tager desuden en default-værdi (4. argument) og en statisk `propertyChanged`-handler `(BindableObject bindable, object oldValue, object newValue)` som named argument. Slides sætter `defaultBindingMode: BindingMode.TwoWay`. Lab 11 beder om en pagination control som custom control — samme opgavetype.',
          ],
        },
      ],
      viz: 'style-resolution',
      keyPoints: [
        'Eksplicit style = `TargetType` + `x:Key`, anvendes med `Style="{StaticResource …}"`. Implicit = kun `TargetType`, rammer alle af typen i scope.',
        'Præcedens: app → page overskriver → eksplicit over implicit → direkte værdi over alle styles.',
        '`StaticResource` slår op én gang; `DynamicResource` følger nøglen; `AppThemeBinding` følger OS’ets tema — men ikke sammen med `DynamicResource`.',
        'Property- og data-triggers ruller tilbage; event triggers og visual states gør ikke.',
        '`ContentView` = genbrugelig komponent; værdier ind og ud via bindable properties.',
        '`XxxProperty` = `BindableProperty.Create(…)` som `static readonly`; propertyen kalder `GetValue`/`SetValue`.',
      ],
      code: [
        {
          lang: 'xml',
          title: 'Eksplicit og implicit style',
          source: 'Styles and themes.pdf s. 6–7',
          code: `<Style x:Key="labelStyle" TargetType="Label">
    <Setter Property="HorizontalOptions" Value="Center" />
    <Setter Property="VerticalOptions" Value="Center" />
    <Setter Property="FontSize" Value="18" />
</Style>

<Style TargetType="Label">
    <Setter Property="FontSize" Value="24" />
</Style>

<Label Text="Demonstrating an explicit style" Style="{StaticResource labelStyle}" />`,
        },
        {
          lang: 'xml',
          title: 'AppThemeBinding i en implicit style',
          source: 'Styles and themes.pdf s. 13',
          code: `<Style TargetType="ActivityIndicator">
    <Setter Property="Color" Value="{AppThemeBinding
            Light={StaticResource Primary},
            Dark={StaticResource White}}" />
</Style>`,
        },
        {
          lang: 'csharp',
          title: 'Value som bindable property på MyStepper',
          source: 'Custom controls.pdf s. 11',
          code: `public partial class MyStepper : ContentView
{
    public static readonly BindableProperty ValueProperty = BindableProperty.Create(
        nameof(Value),
        typeof(int),
        typeof(MyStepper),
        defaultBindingMode:BindingMode.TwoWay);

    public int Value
    {
        get => (int)GetValue(ValueProperty);
        set => SetValue(ValueProperty, value);
    }
    // ...
}`,
        },
      ],
      exam: [
        'Jeg lægger fælles udseende i implicit styles i Styles.xaml, så alle `Entry`s og `Button`s ser ens ud, og bruger eksplicitte styles med `x:Key` til undtagelser. Det er Lab 10: formateringen i MauiTodo flyttes fra de enkelte controls ud i implicit styles.',
        'Præcedensen er: app-level styles er default, page-level overskriver dem, en eksplicit style vinder over en implicit, og en værdi sat direkte på controllen vinder over alle styles.',
        'Light og dark mode får jeg med `AppThemeBinding`, som vælger værdi efter OS’ets tema. Skal brugeren også kunne skifte palet, kan jeg ikke bruge `DynamicResource` samtidig; så samler jeg farver og styles i et theme og udskifter hele dictionary’en.',
        'Eksaminator-appen (sommer 2025) skal markere visuelt, når tiden er brugt. Det kan jeg gøre deklarativt med en `DataTrigger` på en bundet property. Den ruller selv tilbage, når betingelsen ikke længere gælder.',
        'Vittighedsopgaven (vinter 25/26) tillader at bladre side for side. Det er Lab 11’s pagination control: en `ContentView`, hvor sidenummeret er en bindable property — `ValueProperty` med `BindableProperty.Create` og `GetValue`/`SetValue` — så siden kan binde den til sin ViewModel.',
      ],
      sources: [
        { path: ctx('slides/SW4FED-02_L10.1_Styles_and_themes.md'), original: 'L10/Styles and themes.pdf', pages: 's. 3–34' },
        { path: ctx('slides/SW4FED-02_L11.1_Custom_controls.md'), original: 'L11/Custom controls.pdf', pages: 's. 2–11' },
        { path: ctx('book/MAUI_in_Action_Ch10_Styles_themes_multiplatform.md'), original: bog('10'), pages: 'afsn. 10.1–10.2 (PDF s. 527–572)' },
        { path: ctx('book/MAUI_in_Action_Ch11_Custom_controls.md'), original: bog('11'), pages: 'afsn. 11.1–11.3 (PDF s. 598–640)' },
        { path: ctx('labs/SW4FED-02_Lab10_Implicit_styles.md'), note: 'Lab 10: implicit styles i MauiTodo' },
        { path: ctx('labs/SW4FED-02_Lab11_Pagination_control.md'), note: 'Lab 11: pagination som custom control' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_2025_Sommer.md'), original: 'L28/SW4FED-02 2025 Sommer.pdf', pages: 's. 2–3', note: 'Opgave 1: timer, der markerer visuelt' },
        { path: ctx('eksamen/SW4FED-02_Eksamen_V25-26_ordinaer.md'), original: 'L28/SW4FED-02 Front-end udvikling, V25-26-o.pdf', pages: 's. 2–3', note: 'Opgave 1: bladre side for side' },
      ],
      gaps: [
        'Slides sætter `defaultBindingMode: BindingMode.TwoWay` i `BindableProperty.Create` (Custom controls.pdf s. 11). Bogen udelader den (listing 11.4, PDF s. 612) og skriver i stedet `Mode=TwoWay` på bindingen i sidens XAML (listing 11.10, PDF s. 620). Ingen af dem forklarer binding modes.',
        'Hverken slides eller bog giver `ValueProperty` en `propertyChanged`-handler. Uden for materialet: sættes `Value` udefra via bindingen, opdateres `ValueEntry.Text` derfor ikke; mønstret fra `IsEnabledProperty` (bog listing 11.8–11.9) skal gentages for `Value`.',
        'Slidekoden er beskåret: plusknappen og `PlusButton_Clicked` mangler i `MyStepper` (s. 6–7), og else-grenen i tema-skiftet (s. 21). Bogens listing 11.1–11.2 og 10.9 har den fulde kode.',
        'Slides nævner EnterActions/ExitActions og state triggers (s. 25) uden at vise dem.',
        'Handlers (bog afsn. 11.3) dækkes i slides kun af punktet “customize the platform implementations” (s. 2). Lab 10 og Lab 11 er kun én-sætnings-opgaver uden kode.',
      ],
      keywords: ['Style', 'Setter', 'TargetType', 'x:Key', 'implicit style', 'explicit style', 'eksplicit', 'implicit', 'ResourceDictionary', 'MergedDictionaries', 'Styles.xaml', 'Colors.xaml', 'StaticResource', 'DynamicResource', 'AppThemeBinding', 'dark mode', 'light mode', 'theme', 'tema', 'Trigger', 'DataTrigger', 'EventTrigger', 'MultiTrigger', 'VisualStateManager', 'CommonStates', 'ContentView', 'custom control', 'BindableProperty', 'BindableProperty.Create', 'GetValue', 'SetValue', 'propertyChanged', 'handler', 'AppendToMapping', 'MyStepper', 'MildredStepper'],
    },
  ],
}
