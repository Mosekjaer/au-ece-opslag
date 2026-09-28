import type { Part } from '../types'
import { ctx } from './paths'

export const udOverRest: Part = {
  id: 'ud-over-rest',
  title: 'Ud over REST',
  topics: [
    {
      slug: 'graphql',
      title: 'GraphQL',
      short: 'GraphQL',
      week: 'Uge 11',
      definition:
        'GraphQL er en **specifikation** for et forespørgselssprog: klienten beskriver præcis hvilke felter den vil have, og får dem i ét svar fra ét endpoint. Det løser REST’s **over-fetching** og **under-fetching**.',
      concepts: [
        {
          term: 'Problemet med REST',
          body: [
            '**Over-fetching**: et REST-endpoint returnerer alle ressourcens properties, selvom klienten kun skal bruge titel og id. **Under-fetching**: en side skal bruge data fra flere ressourcer og må lave flere kald. Facebooks nyhedsfeed havde begge problemer, og GraphQL blev svaret (brugt i Facebooks mobilapps siden 2012, offentliggjort 2015, flyttet til GraphQL Foundation i 2018).',
          ],
        },
        {
          term: 'Hvad GraphQL er',
          body: [
            'GraphQL er en specifikation, ikke en implementering, og ikke en database — et lag mellem klienter og én eller flere datakilder. Data opfattes som en graf af noder og kanter, og forespørgsler traverserer den, også baglæns (fra passager til fly).',
            'Fordele: skemaet *er* dokumentationen og kan ikke blive forældet; klient og server kan udvikle sig uafhængigt; ét komplekst spørgsmål giver ét præcist svar. Ulemper: mere komplekst at bygge end REST, og **ingen indbygget caching** — alt går til ét endpoint med forskellige svar.',
          ],
        },
        {
          term: 'Operationer, felter og skema',
          body: [
            'Tre operationstyper: **query** (læs), **mutation** (skriv, efterfulgt af en læsning) og **subscription** (realtid over en socket). En anmodning består af et dokument (operationer og fragments), variabler og meta-information (fx `operationName`).',
            'Felter står i en *selection set* `{ … }` og kan være skalarer (`Int`, `String`, `Float`, `Boolean`, `ID` — bladværdier), objekter med egen selection set, eller lister. Felter kan tage argumenter, fx `user(email: "…")`. Introspektion (`__schema`, `__type`) spørger på selve skemaet.',
          ],
        },
        {
          term: 'HotChocolate i ASP.NET Core',
          body: [
            'En `Query`-klasse har en metode pr. entitet, der returnerer `IQueryable<T>` fra EF. Attributterne `[UsePaging]`, `[UseProjection]`, `[UseFiltering]` og `[UseSorting]` giver paging, projektion, filtrering og sortering, som oversættes til LINQ og derfra til SQL.',
            '`[Serial]` er nødvendig, fordi `DbContext` er scoped: uden den kører HotChocolate forespørgsler parallelt på samme kontekst, og den crasher. I produktion anbefales `AddDbContextFactory` i stedet.',
            'Mutations bruger DTO’er og beskyttes med HotChocolates egen `[Authorize]` (fra `HotChocolate.Authorization`, ikke `Microsoft.AspNetCore.Authorization`). `app.MapGraphQL()` efter `UseAuthorization()` giver endpointet `/graphql` med IDE’en Banana Cake Pop.',
          ],
        },
      ],
      viz: 'graphql-fetch',
      keyPoints: [
        'Over-fetching: for mange felter. Under-fetching: for mange kald.',
        'Ét endpoint; klienten vælger felterne.',
        'Query læser, mutation skriver og læser, subscription giver realtid.',
        'Skemaet er dokumentationen.',
        'Ingen indbygget caching — prisen for ét endpoint.',
        'HotChocolate: `[Serial]` pga. scoped DbContext; `MapGraphQL()` → `/graphql`.',
      ],
      code: [
        {
          lang: 'graphql',
          title: 'Klienten bestemmer formen på svaret',
          source: 'GrapQL Introduction.pdf s. 12–13',
          code: `{
  flight(id: "1234") {
    origin
    destination
    passengers {
      name
    }
  }
}`,
        },
        {
          lang: 'csharp',
          title: 'Query-type i HotChocolate',
          source: 'GrapQL Introduction.pdf s. 23',
          code: `public class Query
{
    [Serial]
    [UsePaging]
    [UseProjection]
    [UseFiltering]
    [UseSorting]
    public IQueryable<BoardGame> GetBoardGames(
        [Service] ApplicationDbContext context)
        => context.BoardGames;
}

builder.Services.AddGraphQLServer()
    .AddAuthorization()
    .AddQueryType<Query>()
    .AddMutationType<Mutation>()
    .AddProjections()
    .AddFiltering()
    .AddSorting();

app.UseAuthorization();
app.MapGraphQL();`,
        },
      ],
      exam: [
        'GraphQL løser to problemer ved REST: over-fetching, hvor man får flere felter end man skal bruge, og under-fetching, hvor man skal lave flere kald for at samle en side.',
        'Klienten sender én forespørgsel til ét endpoint og beskriver præcis de felter, den vil have. Skemaet er samtidig dokumentationen.',
        'Ulempen er kompleksitet og manglende indbygget caching, fordi alle anmodninger går til samme endpoint med forskellige svar.',
      ],
      sources: [
        { path: ctx('12-beyond-rest/graphql-introduction.md'), original: 'GrapQL Introduction.pdf', pages: 's. 2–40' },
        { path: ctx('12-beyond-rest/exploring-graphql-apis.md'), original: 'Exploring GrahpQL APIs.pdf', pages: 's. 2–16' },
      ],
      gaps: [
        'Kursusbeskrivelsen nævner at gRPC introduceres, men materialet omtaler kun gRPC kort som server-til-server-kommunikation (HTTP/2 og Protobuf) i “Calling Remote APIs”.',
      ],
      keywords: ['GraphQL', 'over-fetching', 'under-fetching', 'query', 'mutation', 'subscription', 'schema', 'HotChocolate', 'Banana Cake Pop', 'introspection', 'resolver', 'gRPC'],
    },

    {
      slug: 'remote-api',
      title: 'Kald af eksterne API’er: IHttpClientFactory og Polly',
      short: 'HttpClientFactory og Polly',
      week: 'Uge 12',
      definition:
        '`IHttpClientFactory` laver kortlivede `HttpClient`-instanser, men genbruger og roterer de underliggende handlers. Det undgår både **socket exhaustion** og **forældet DNS**. **Polly** lægger resiliens ovenpå, fx retry med ventetid.',
      concepts: [
        {
          term: 'Server-til-server',
          body: [
            'Backends kalder ofte andre services: HTTP til et REST API (let), gRPC (HTTP/2 og binær Protobuf, typisk meget hurtigere end REST) eller message queues (asynkron beskedudveksling, der gør data midlertidigt persistente, når dele af systemet er nede).',
          ],
        },
        {
          term: 'To forkerte måder',
          body: [
            '`using (var client = new HttpClient())` pr. anmodning: under belastning fører det til **socket exhaustion**, fordi socketten bliver hængende efter dispose.',
            'En statisk/singleton `HttpClient` løser det, men skifter DNS-posten for den service man kalder, bliver klienten ved med at kalde den gamle adresse.',
          ],
        },
        {
          term: 'IHttpClientFactory',
          body: [
            'Fabrikken adskiller `HttpClient`’ens levetid fra den underliggende `HttpClientHandler`, som den genbruger og roterer. Den registreres med `builder.Services.AddHttpClient()` og bruges på fire måder: **basic** (`CreateClient()`), **named** (`AddHttpClient("GitHub", …)` og `CreateClient("GitHub")`), **typed** (en klasse der får `HttpClient` i konstruktøren — ingen magiske strenge, IntelliSense) og generated.',
            'Hver `HttpClient` har en pipeline af `HttpMessageHandler`’e. En egen `DelegatingHandler` kan fx tilføje en `X-API-KEY`-header til alle udgående kald; den registreres og tilføjes med `AddHttpMessageHandler<T>()`. Rækkefølgen af registreringen er rækkefølgen i pipelinen.',
          ],
        },
        {
          term: 'Polly',
          body: [
            'Polly er et letvægtsbibliotek med resiliensstrategier: Retry, WaitAndRetry, CircuitBreaker, Bulkhead Isolation, Timeout og Fallback. `AddTransientHttpErrorPolicy` håndterer `HttpRequestException`, HTTP 5xx og HTTP 408.',
            'Med **exponential backoff** vokser ventetiden med hvert forsøg: `TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))` giver 2, 4, 8 … sekunder, så en service der allerede har det svært ikke bliver hamret yderligere.',
          ],
        },
      ],
      viz: 'polly-retry',
      keyPoints: [
        '`new HttpClient()` pr. kald → socket exhaustion.',
        'Singleton-HttpClient → følger ikke DNS-ændringer.',
        '`IHttpClientFactory`: kortlivede klienter, genbrugte og roterede handlers.',
        'Typed clients frem for magiske strenge.',
        'Polly håndterer transiente fejl: `HttpRequestException`, 5xx og 408.',
        'Exponential backoff: 2ⁿ sekunder mellem forsøg.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Typed client med retry og API-nøgle-handler',
          source: 'Calling Remote APIs.pdf s. 20, 28, 35',
          code: `public class GitHubService
{
    private readonly HttpClient _httpClient;

    public GitHubService(HttpClient httpClient)
    {
        _httpClient = httpClient;
        _httpClient.BaseAddress = new Uri("https://api.github.com/");
    }

    public async Task<IEnumerable<GitHubBranch>?> GetAspNetCoreDocsBranchesAsync() =>
        await _httpClient.GetFromJsonAsync<IEnumerable<GitHubBranch>>(
            "repos/dotnet/AspNetCore.Docs/branches");
}

// Program.cs
builder.Services.AddTransient<ApiKeyMessageHandler>();
builder.Services.AddHttpClient<GitHubService>()
    .AddHttpMessageHandler<ApiKeyMessageHandler>()
    .AddTransientHttpErrorPolicy(policy =>
        policy.WaitAndRetryAsync(new[] {
            TimeSpan.FromMilliseconds(200),
            TimeSpan.FromMilliseconds(500),
            TimeSpan.FromSeconds(1)
        }));`,
        },
        {
          lang: 'csharp',
          title: 'Exponential backoff',
          source: 'Calling Remote APIs.pdf s. 29',
          code: `Policy
    .Handle<SomeExceptionType>()
    .WaitAndRetry(5, retryAttempt =>
        TimeSpan.FromSeconds(Math.Pow(2, retryAttempt))
    );`,
        },
      ],
      exam: [
        'HttpClient må hverken oprettes og disposes pr. kald, fordi det giver socket exhaustion, eller leve for evigt som singleton, fordi den så ikke opdager DNS-ændringer. IHttpClientFactory løser begge ved at genbruge og rotere de underliggende handlers.',
        'Jeg foretrækker typed clients: en klasse, der får en HttpClient injiceret og samler al logik for det eksterne API ét sted.',
        'Med Polly tilføjer jeg retry mod transiente fejl som 5xx og 408, gerne med exponential backoff, så ventetiden fordobles for hvert forsøg.',
      ],
      sources: [
        { path: ctx('12-beyond-rest/calling-remote-apis.md'), original: 'Calling Remote APIs.pdf', pages: 's. 2–36' },
      ],
      keywords: ['HttpClient', 'IHttpClientFactory', 'socket exhaustion', 'DNS', 'named client', 'typed client', 'Polly', 'retry', 'backoff', 'exponential backoff', 'circuit breaker', 'transient', 'DelegatingHandler', 'gRPC', 'message queue'],
    },

    {
      slug: 'caching',
      title: 'Caching',
      short: 'Caching',
      week: 'Uge 13',
      definition:
        'En cache gemmer data, så fremtidige anmodninger kan besvares hurtigere uden at blive hentet forfra. Et REST-API bruger **HTTP-response-caching** (styret af `Cache-Control`) og **server-side caching** — in-memory eller distribueret — for at aflaste databasen.',
      concepts: [
        {
          term: 'Fordele og ulemper',
          body: [
            'Fordele: ydeevne, lavere latenstid, mindre CPU, mindre båndbredde, lavere omkostninger og CO₂-aftryk. Ulemper: mere kompleksitet og risiko for at servere **forældede data**. Cacher kan ligge i alle lag: klient, proxy, webserver og en distribueret cache ved databasen.',
            'Cachebarhed er én af REST’s seks constraints: svar skal være markeret som cachebare eller ej.',
          ],
        },
        {
          term: 'Cache-Control og [ResponseCache]',
          body: [
            '`[ResponseCache]` sætter `cache-control`-headeren: `Location = Any` → `public`, `Location = Client` → `private`, `Duration` → `max-age`, `Location = None` → `no-cache`, `NoStore = true` → `no-store`. `no-cache` betyder “valider før genbrug”; `no-store` betyder “gem slet ikke”.',
            'Glemmer man attributten, er der ingen header, og klienter og proxies bestemmer selv — en sikkerhedsrisiko ved følsomme data. Løsningen er en middleware, der sætter `no-cache, no-store` som standard. **Cache profiles** samler direktiverne ét sted (`CacheProfileName = "Any-60"`).',
          ],
        },
        {
          term: 'Expires og betinget GET',
          body: [
            '`Expires` angiver hvornår en cachet side ikke længere er frisk. Ved **betinget GET** sender browseren `If-Modified-Since` (fra `Last-Modified`) eller `If-None-Match` (fra `ETag`, en slags checksum af ressourcen). Er ressourcen uændret, svarer serveren **`304 Not Modified`** uden body.',
          ],
        },
        {
          term: 'Server-side response caching',
          body: [
            '`AddResponseCaching()` + `UseResponseCaching()` lader appen cache sine egne svar efter de samme headers. Kun GET/HEAD med `200 OK` caches. Den kører på samme server — og respekterer også *klientens* headers: en browser-reload sender `max-age=0`, et hårdt reload `no-cache`, så klienter kan omgå cachen. Det gør serveren sårbar for DDoS.',
          ],
        },
        {
          term: 'In-memory og distribueret cache',
          body: [
            '`IMemoryCache` er en singleton med nøgle-værdi-par i serverens hukommelse (`AddMemoryCache()`). Mønstret: lav en `cacheKey` ud fra parametrene; `TryGetValue` — ved hit brug værdien, ved miss hent fra databasen og `Set` med fx 30 sekunders absolut udløb.',
            'Kører appen på flere servere, har hver sin in-memory-cache. En **distribueret cache** (SQL Server-tabellen `AppCache` eller Redis) giver ensartede data, uafhængig levetid og aflaster webserverens hukommelse. `IDistributedCache` har kun byte-array-metoder, så slides bygger `TryGetValue<T>`/`Set<T>` som extension methods med JSON.',
            'NGINX kan **microcache**: cache et svar i ét sekund, så hundrede samtidige anmodninger bliver til én mod origin-serveren.',
          ],
        },
      ],
      viz: 'caching-layers',
      keyPoints: [
        'Cache i alle lag: klient, proxy, server, distribueret.',
        '`public` / `private` / `max-age` / `no-cache` (valider) / `no-store` (gem ikke).',
        'Sæt en standard `no-cache, no-store`, så intet caches ved en fejl.',
        'Betinget GET: `ETag` + `If-None-Match` → `304 Not Modified`.',
        'Response caching: kun GET/HEAD og 200; klientens reload kan omgå den.',
        'In-memory: én server. Distribueret: fælles for alle servere.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'In-memory cache med 30 sekunders udløb',
          source: 'Caching techniques.pdf s. 30',
          code: `BoardGame[]? result = null;
var cacheKey = $"{input.GetType()}-{JsonSerializer.Serialize(input)}";
if (!_memoryCache.TryGetValue<BoardGame[]>(cacheKey, out result))
{
    query = query
        .OrderBy($"{input.SortColumn} {input.SortOrder}")
        .Skip(input.PageIndex * input.PageSize)
        .Take(input.PageSize);
    result = await query.ToArrayAsync();
    _memoryCache.Set(cacheKey, result, new TimeSpan(0, 0, 30));
}`,
        },
        {
          lang: 'csharp',
          title: 'Cache profiles og en sikker standard',
          source: 'Caching techniques.pdf s. 12–14',
          code: `builder.Services.AddControllers(options =>
{
    options.CacheProfiles.Add("NoCache",
        new CacheProfile() { NoStore = true });
    options.CacheProfiles.Add("Any-60",
        new CacheProfile() { Location = ResponseCacheLocation.Any, Duration = 60 });
});

app.Use((context, next) =>
{
    context.Response.GetTypedHeaders().CacheControl =
        new Microsoft.Net.Http.Headers.CacheControlHeaderValue()
        {
            NoCache = true,
            NoStore = true
        };
    return next.Invoke();
});

[ResponseCache(CacheProfileName = "Any-60")]`,
        },
      ],
      exam: [
        'Caching gør svar hurtigere og aflaster databasen, men koster kompleksitet og risiko for forældede data. Cachebarhed er en af REST’s constraints.',
        'Med ResponseCache-attributten styrer jeg Cache-Control-headeren: public eller private, max-age, no-cache og no-store. Jeg sætter en standard på no-store, så følsomme svar ikke caches ved en fejl.',
        'In-memory-caching virker på én server. Kører appen på flere servere, bruger jeg en distribueret cache som SQL Server eller Redis, så alle ser de samme data.',
      ],
      sources: [
        { path: ctx('13-docs-caching-background/caching-techniques.md'), original: 'Caching techniques.pdf', pages: 's. 2–42' },
      ],
      keywords: ['cache', 'caching', 'Cache-Control', 'ResponseCache', 'max-age', 'no-cache', 'no-store', 'ETag', '304', 'Not Modified', 'Expires', 'IMemoryCache', 'IDistributedCache', 'Redis', 'response caching', 'cache profile', 'NGINX', 'microcaching'],
    },

    {
      slug: 'background-services',
      title: 'Background services',
      short: 'Background services',
      week: 'Uge 12',
      definition:
        'En background service kører uden direkte brugerinteraktion — typisk i en løkke med ventetid eller mod en kø. I .NET implementeres den med `IHostedService` eller `BackgroundService` og registreres med `AddHostedService`.',
      concepts: [
        {
          term: 'Hvorfor',
          body: [
            'ASP.NET Core laver normalt kun arbejde som svar på anmodninger. Background services bruges til at sende e-mails i batch (ordrebekræftelser, nyhedsbreve), beregne daglige tal, og **cache data fra eksterne kilder** som valutakurser, så API’et svarer hurtigere. Kestrel kører selv som en `IHostedService`.',
          ],
        },
        {
          term: 'ExecuteAsync-løkken',
          body: [
            'Arv fra `BackgroundService` og override `ExecuteAsync(CancellationToken stoppingToken)`. Løkken kører `while (!stoppingToken.IsCancellationRequested)`, udfører arbejdet og venter med `await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken)`. Tokenet udløses, når appen lukker.',
          ],
        },
        {
          term: 'Levetider og scopes',
          body: [
            'En hosted service oprettes én gang ved opstart og er derfor i praksis en **singleton**. Dens afhængigheder skal leve mindst lige så længe, så den kan ikke få en scoped `DbContext` injiceret direkte.',
            'Løsningen er at injicere `IServiceProvider` og lave et nyt scope i hver iteration med `_provider.CreateScope()`. Inde i scopet hentes den typed client og `AppDbContext`; scopet disposes med `using`, og næste iteration får et nyt.',
          ],
        },
        {
          term: 'Worker services og planlægning',
          body: [
            'Behøver appen ikke HTTP, er en **worker service** nok: en konsolapp med den generiske `IHost` (logging, konfiguration, DI) uden ASP.NET Core — kaldt *headless*. Den kan køre i en container, framework-dependent eller self-contained, og som Windows Service (`UseWindowsService()`) eller under systemd.',
            'Skal jobs køre på bestemte tidspunkter, bruges Hangfire eller **Quartz.NET** (jobs, triggers, job factory og scheduler). Kører flere instanser, forhindrer en fælles låsetabel i databasen at samme job kører to gange.',
          ],
        },
      ],
      viz: 'background-service',
      keyPoints: [
        '`BackgroundService` → override `ExecuteAsync` → løkke til `stoppingToken`.',
        '`Task.Delay(…, stoppingToken)` mellem iterationer.',
        'Hosted services er singletons.',
        'Scoped afhængigheder (DbContext) → `CreateScope()` pr. iteration.',
        'Worker service = generisk host uden HTTP.',
        'Tidsplaner: Quartz.NET eller Hangfire.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Nyt scope i hver iteration',
          source: 'SW4BAD - BackgroundServices.pdf s. 9',
          code: `public class ExchangeRatesHostedService : BackgroundService
{
    private readonly IServiceProvider _provider;

    public ExchangeRatesHostedService(IServiceProvider provider)
    {
        _provider = provider;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using (IServiceScope scope = _provider.CreateScope())
            {
                var client = scope.ServiceProvider
                    .GetRequiredService<ExchangeRatesClient>();
                var context = scope.ServiceProvider
                    .GetRequiredService<AppDbContext>();

                var rates = await client.GetLatestRatesAsync();
                context.Add(rates);
                await context.SaveChanges(rates);
            }

            await Task.Delay(TimeSpan.FromMinutes(5), stoppingToken);
        }
    }
}

// Program.cs
builder.Services.AddHostedService<ExchangeRatesHostedService>();`,
        },
      ],
      exam: [
        'En background service arbejder uden at en bruger har bedt om det, fx henter valutakurser hvert femte minut og cacher dem. Den arver fra BackgroundService og kører en løkke i ExecuteAsync, indtil stoppingToken bliver udløst.',
        'Hosted services er singletons, så de kan ikke få en scoped DbContext injiceret. Jeg injicerer i stedet IServiceProvider og laver et nyt scope i hver iteration.',
        'Skal der ikke håndteres HTTP, kan det være en worker service med den generiske host. Skal den køre på faste tidspunkter, bruger jeg fx Quartz.NET.',
      ],
      sources: [
        { path: ctx('13-docs-caching-background/background-services.md'), original: 'SW4BAD - BackgroundServices.pdf', pages: 's. 2–18' },
      ],
      gaps: [
        'Kodeeksemplet i slides kalder `await context.SaveChanges(rates)`. `SaveChanges` tager normalt ikke et argument og er synkron (den asynkrone hedder `SaveChangesAsync()`) — linjen er gengivet som i materialet, men ser ud til at være en fejl.',
      ],
      keywords: ['BackgroundService', 'IHostedService', 'AddHostedService', 'ExecuteAsync', 'CancellationToken', 'Task.Delay', 'CreateScope', 'worker service', 'IHost', 'Windows Service', 'systemd', 'Quartz', 'Hangfire'],
    },

    {
      slug: 'api-dokumentation',
      title: 'API-dokumentation med OpenAPI',
      short: 'API-dokumentation',
      week: 'Uge 12',
      definition:
        'API-dokumentation er ikke valgfri — den er kontrakten med dem, der bruger API’et. Med **OpenAPI** (Swagger) genereres `swagger.json` automatisk fra koden, og beskrivelser tilføjes med XML-kommentarer eller Swashbuckle-annotationer.',
      concepts: [
        {
          term: 'Publikum',
          body: [
            'Slides bruger byggeslang: **Prospectors** (entusiaster, der prøver af nysgerrighed), **Contractors** (analytikere og arkitekter, der træffer beslutningen) og **Builders** (tredjepartsudviklere, der skal bruge API’et — de mest tekniske og sværeste at tilfredsstille).',
          ],
        },
        {
          term: 'Best practices',
          body: [
            'Brug et automatisk værktøj, så dokumentationen ikke bliver forældet; beskriv endpoints, input og svar; vis eksempler på anmodninger og svar; gruppér endpoints; skjul reserverede endpoints; fremhæv autorisationskrav; og tilpas titler og metadata.',
            'Automatisering er især vigtig for REST, fordi REST-standarden ikke har nogen standardmekanisme til dokumentation — derfor OpenAPI’s succes.',
          ],
        },
        {
          term: 'XML-kommentarer og annotationer',
          body: [
            '**XML**: skriv `///`-kommentarer (`<summary>`, `<param>`, `<returns>`, `<response code="…">`), sæt `GenerateDocumentationFile` i `.csproj`, og lad Swashbuckle læse filen med `IncludeXmlComments`.',
            '**Annotationer**: `[SwaggerOperation(Summary = …, Description = …, Tags = …)]`, `[SwaggerParameter]` og `[SwaggerResponse]` fra `Swashbuckle.AspNetCore.Annotations`, aktiveret med `options.EnableAnnotations()`. Virker også på minimal API’er. `[ProducesResponseType]` beskriver flere mulige returtyper.',
          ],
        },
        {
          term: 'Filtre',
          body: [
            'Swashbuckle har en filter-pipeline over genereringen af `swagger.json`: `IDocumentFilter` (hele dokumentet, fx titlen), `IOperationFilter` (et endpoint), `IParameterFilter`, `IRequestBodyFilter` og `ISchemaFilter`. Slides’ eksempel: en global `AddSecurityRequirement` sætter en hængelås på *alle* endpoints; et `AuthRequirementFilter` sætter den kun på dem med `[Authorize]`.',
          ],
        },
      ],
      viz: 'swagger-docs',
      keyPoints: [
        'Dokumentation er et krav, ikke et valg.',
        'Automatisk generering, ellers bliver den forældet.',
        'XML-kommentarer kræver `GenerateDocumentationFile` + `IncludeXmlComments`.',
        '`[SwaggerOperation]` virker på både controllers og minimal API’er.',
        'Operation-filtre gør autorisationskrav synlige, men kun hvor de gælder.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'XML-kommentar, der ender i Swagger UI',
          source: 'SW4BAD - API Documentation.pdf s. 8',
          code: `/// <summary>
/// Registers a new user.
/// </summary>
/// <param name="input">A DTO containing the user data.</param>
/// <returns>A 201 - Created Status Code in case of success.</returns>
[HttpPost]
[ResponseCache(CacheProfileName = "NoCache")]
public async Task<ActionResult> Register(RegisterDTO input)

// Program.cs
builder.Services.AddSwaggerGen(options =>
{
    var xmlFilename =
        $"{Assembly.GetExecutingAssembly().GetName().Name}.xml";
    options.IncludeXmlComments(System.IO.Path.Combine(
        AppContext.BaseDirectory, xmlFilename));
});`,
        },
        {
          lang: 'xml',
          title: 'Generér dokumentationsfilen (.csproj)',
          source: 'SW4BAD - API Documentation.pdf s. 8',
          code: `<PropertyGroup>
  <GenerateDocumentationFile>true</GenerateDocumentationFile>
  <NoWarn>$(NoWarn);1591</NoWarn>
</PropertyGroup>`,
        },
      ],
      exam: [
        'Dokumentationen er kontrakten med dem, der skal bruge API’et, og den skal genereres automatisk fra koden, ellers bliver den forældet.',
        'Med OpenAPI og Swashbuckle genereres swagger.json og Swagger UI. Beskrivelser tilføjer jeg med XML-kommentarer eller SwaggerOperation-attributter, og jeg dokumenterer også de mulige svar.',
        'Autorisationskrav vises med et operation-filter, så kun endpoints med Authorize får hængelåsen.',
      ],
      sources: [
        { path: ctx('13-docs-caching-background/api-documentation.md'), original: 'SW4BAD - API Documentation.pdf', pages: 's. 2–19' },
      ],
      gaps: [
        'Afleveringerne kræver **Scalar** (`AddOpenApi` + `MapScalarApiReference`), og Scalar nævnes i REST- og auth-slides, men dokumentations-slides bygger på Swashbuckle og Swagger UI. Scalar som dokumentationsværktøj forklares ikke nærmere i materialet.',
      ],
      keywords: ['OpenAPI', 'Swagger', 'Swashbuckle', 'Swagger UI', 'Scalar', 'XML comments', 'SwaggerOperation', 'ProducesResponseType', 'IOperationFilter', 'IDocumentFilter', 'documentation', 'dokumentation'],
    },
  ],
}
