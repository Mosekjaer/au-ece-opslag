import type { Part } from '../types'
import { ctx } from './paths'

export const webapi: Part = {
  id: 'webapi',
  title: 'Web API med .NET',
  topics: [
    {
      slug: 'rest',
      title: 'REST og CORS',
      short: 'REST og CORS',
      week: 'Uge 4',
      definition:
        'REST (**RE**presentational **S**tate **T**ransfer) er en arkitekturstil med seks styrende constraints, bygget om **ressourcer**. CORS er protokollen, der lader en server tage imod browser-anmodninger fra et andet origin.',
      concepts: [
        {
          term: 'De seks constraints',
          body: [
            '(1) **Client/Server** — adskillelse af UI og data. (2) **Stateless** — hver anmodning indeholder alt, der skal til; serveren gemmer ingen session mellem anmodninger, så enhver server kan tage enhver anmodning. (3) **Cacheable** — svar markeres som cachebare eller ej. (4) **Uniform Interface**. (5) **Layered System** — klienten kan ikke antage, at den taler direkte med origin-serveren; der kan være proxies, gateways og CDN’er. (6) **Code-on-demand** (valgfri).',
          ],
        },
        {
          term: 'Uniform interface',
          body: [
            'Materialet kalder det “IMPORTANT (where most APIs fail)”: brug ressourcer (**navneord**), ikke handlinger (verber) i URL’en; brug standardmetoderne GET, POST, PUT, PATCH og DELETE; brug statuskoderne 200, 201, 204, 400, 404, 409 og 422; og brug content negotiation, typisk JSON. Det der overføres, er en *repræsentation* af ressourcens tilstand.',
          ],
        },
        {
          term: 'Same-origin policy og CORS',
          body: [
            'Browseren håndhæver **same-origin policy**: et script fra ét domæne må kun hente ressourcer fra samme origin. Et andet origin kan være et andet domæne, men også en anden protokol (http vs. https) eller en anden port på samme server. Det gælder `fetch` og `XMLHttpRequest`.',
            'CORS lader serveren sige, hvilke origins den accepterer. I ASP.NET registreres en policy med `AddCors`, og `app.UseCors("Frontend")` aktiverer den. Middleware-reglen: `UseCors` før endpoints.',
          ],
        },
        {
          term: 'Reverse proxy og CDN',
          body: [
            'En reverse proxy tager sig typisk af TLS-terminering, load balancing, buffering, omskrivning af headers, rate limiting/WAF og observability. Et CDN er geografisk fordelte servere, der cacher indhold tæt på brugeren og giver lavere latenstid, beskyttelse mod DDoS og lavere båndbreddeomkostninger. Begge er eksempler på *layered system*.',
          ],
        },
        {
          term: 'Versionering',
          body: [
            'Man versionerer for ikke at bryde eksisterende klienter: ændret svarform, nye påkrævede felter eller ændret adfærd. Stilarter: URL-segment (`/api/v1/authors`), query (`?api-version=1.0`) eller header (`X-Api-Version: 1.0`). Hold gamle versioner i live en periode, kommunikér deprecation, og vis versionerne i OpenAPI.',
          ],
        },
      ],
      viz: 'cors',
      keyPoints: [
        'Stateless: al nødvendig information i hver anmodning; ingen session på serveren.',
        'Uniform interface: navneord i URL’er, standardverber, rigtige statuskoder.',
        'Origin = scheme + host + port. Én forskel er nok til at være cross-origin.',
        'CORS håndhæves af browseren; serveren erklærer tilladte origins.',
        '`UseCors` skal ligge før `MapControllers`.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'CORS-policy for en frontend på localhost:5173',
          source: 'REST principals.pdf s. 16',
          code: `builder.Services.AddCors(options =>
{
    options.AddPolicy("Frontend", policy =>
    {
        policy.WithOrigins("https://localhost:5173") // the host of our frontend app
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
// ...
app.UseCors("Frontend");`,
        },
      ],
      exam: [
        'REST er en arkitekturstil med seks constraints. Den vigtigste i praksis er uniform interface: ressourcer som navneord, standard-HTTP-metoder og korrekte statuskoder.',
        'Stateless betyder at serveren ikke gemmer klientens tilstand mellem anmodninger. Derfor skalerer REST-API’er godt, fordi enhver server kan tage enhver anmodning.',
        'Same-origin policy håndhæves af browseren. En frontend på en anden port er et andet origin, så API’et skal tillade det med en CORS-policy.',
      ],
      sources: [
        { path: ctx('04-webapi-rest/rest-principles.md'), original: 'REST principals.pdf', pages: 's. 2–20' },
        { path: ctx('13-docs-caching-background/caching-techniques.md'), original: 'Caching techniques.pdf', pages: 's. 7', note: 'Fieldings cache-constraint' },
      ],
      gaps: [
        'Materialet forklarer ikke *preflight*-anmodninger (OPTIONS) i CORS — kun same-origin policy og opsætning af en policy.',
      ],
      keywords: ['REST', 'RESTful', 'stateless', 'uniform interface', 'CORS', 'same-origin', 'origin', 'reverse proxy', 'CDN', 'versioning', 'versionering', 'resource', 'ressource'],
    },

    {
      slug: 'model-binding',
      title: 'Model binding og validering',
      short: 'Binding og validering',
      week: 'Uge 4 og 6',
      definition:
        '**Model binding** mapper data fra HTTP-anmodningen til action-metodens parametre. Derefter kører **validering**; med `[ApiController]` svarer frameworket selv `400 Bad Request`, før action-metoden overhovedet kaldes, hvis modellen er ugyldig.',
      concepts: [
        {
          term: 'Kilder og standardregler',
          body: [
            'Binding henter nøgle-værdi-par fra formfelter, request body (for `[ApiController]`), route-data, query string og uploadede filer. **Simple typer** (int, bool, string, DateTime, Guid …) hentes fra URI’en — først route, så query. **Komplekse typer** læses fra body.',
            'Route vinder over query: ved `api/pets/3?id=1` med `[HttpGet("{id}")]` bliver `id = 3`. Er standardkilden forkert, angives den med `[FromQuery]`, `[FromRoute]`, `[FromBody]`, `[FromHeader]` osv.',
          ],
        },
        {
          term: 'Komplekse typer',
          body: [
            'Binderen bruger reflection til at finde de offentlige properties og binder dem én ad gangen, også indlejrede typer som `Address`. Modelklassen **skal have en standardkonstruktør**, ellers fejler bindingen.',
            'Manglende data kan håndteres med standardværdier, parameterdefaults eller valgfri parametre (`int? id` og `id.HasValue`).',
          ],
        },
        {
          term: 'Over-posting',
          body: [
            'For at undgå at en klient sætter felter, den ikke må, begrænses bindingen med `[Bind("PersonId, FirstName, LastName")]`, med `[BindNever]` på enkelte properties, eller ved at bruge en DTO med kun de relevante felter.',
          ],
        },
        {
          term: 'Validering',
          body: [
            'Validering sker automatisk efter binding. Regler kan stå som attributter på modellen (`[Required]`, `[Range]`, `[StringLength]`, `[EmailAddress]`, `[RegularExpression]` …, alle med `ErrorMessage`), på action-parametre eller eksplicit i actionen via `ModelState.AddModelError` og `ModelState.IsValid`. Forretningsspecifikke regler kan laves som en attributklasse, der implementerer `IModelValidator`.',
            'Med `[ApiController]` returneres en ugyldig `ModelState` automatisk som 400 med en `ValidationProblemDetails`-body (type, title, status, traceId, errors). Det kan slås fra med `SuppressModelStateInvalidFilter` for at returnere egne statuskoder — materialet: “You will seldom (read: never) need to do this!”',
          ],
        },
      ],
      viz: 'model-binding',
      keyPoints: [
        'Simple typer fra route, derefter query. Komplekse typer fra body.',
        'Route-værdien vinder over en query-parameter med samme navn.',
        'Model-klasser skal have en standardkonstruktør.',
        'Beskyt mod over-posting med DTO’er, `[Bind]` eller `[BindNever]`.',
        '`[ApiController]` giver automatisk 400 med ProblemDetails ved ugyldig model — før din kode kører.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Validering med DataAnnotations',
          source: 'Model Validation and Error handling.pdf s. 6',
          code: `using System.ComponentModel.DataAnnotations;

public class Appointment
{
    [Required]
    [Display(Name = "name")]
    public string ClientName { get; set; }

    [UIHint("Date")]
    [Required(ErrorMessage = "Please enter a date")]
    public DateTime Date { get; set; }

    [Range(typeof(bool), "true", "true", ErrorMessage = "You must accept the terms")]
    public bool TermsAccepted { get; set; }
}`,
        },
        {
          lang: 'json',
          title: 'Automatisk 400-svar fra [ApiController]',
          source: 'Model Validation and Error handling.pdf s. 10',
          code: `{
    "type": "https://tools.ietf.org/html/rfc7231#section-6.5.1",
    "title": "One or more validation errors occurred.",
    "status": 400,
    "traceId": "00-a074ebace7131af6561251496331fc65-ef1c633577161417-00",
    "errors": {
        "pageIndex": ["The value 'string' is not valid."]
    }
}`,
        },
      ],
      exam: [
        'Model binding tager værdier fra route, query, body, headers og formfelter og binder dem til action-parametrene. Simple typer kommer fra URI’en, komplekse fra body, og route vinder over query.',
        'Efter binding kører validering. Med ApiController-attributten får klienten automatisk 400 Bad Request med ProblemDetails, hvis modellen er ugyldig, uden at action-metoden bliver kaldt.',
        'Over-posting forhindrer jeg ved at binde til en DTO med præcis de felter, klienten må sætte.',
      ],
      sources: [
        { path: ctx('04-webapi-rest/model-binding.md'), original: 'Model Binding.pdf', pages: 's. 2–17' },
        { path: ctx('06-validering/model-validation-og-error-handling.md'), original: 'Model Validation and Error handling.pdf', pages: 's. 2–13' },
      ],
      keywords: ['model binding', 'FromBody', 'FromQuery', 'FromRoute', 'FromHeader', 'Bind', 'BindNever', 'over-posting', 'validation', 'validering', 'ModelState', 'DataAnnotations', 'Required', 'ProblemDetails', 'ApiController', '400'],
    },

    {
      slug: 'sql-fra-csharp',
      title: 'SQL fra C#: SqlClient, Dapper og DbUp',
      short: 'SqlClient, Dapper, DbUp',
      week: 'Uge 3–4',
      definition:
        '`Microsoft.Data.SqlClient` er den laveste vej fra C# til SQL Server. **Dapper** er en micro-ORM, der mapper rå SQL til objekter; **DbUp** kører versionerede SQL-migrationsscripts i rækkefølge og husker hvilke der har kørt.',
      concepts: [
        {
          term: 'SqlConnection, SqlCommand, SqlDataReader',
          body: [
            'En `SqlConnection` bygges ud fra en **connection string** og lukkes med `using`. En `SqlCommand` binder SQL-teksten til forbindelsen. `SqlDataReader` er en forward-only-læser: `reader.Read()` går én række frem, og kolonner hentes med indeks (`reader[0]`). SqlClient er én af flere driverteknologier (ODBC, OLE, ADO.NET …).',
            'Med Docker ligner connection-strengen `Data Source=127.0.0.1,1433;Database=…;User Id=sa;Password=…;TrustServerCertificate=True`. Hemmeligheder hører ikke til i koden — se [[ef-core|user secrets]].',
          ],
        },
        {
          term: 'Schema drift og migrationer',
          body: [
            'Tabeller, backend-modeller og API-kontrakter skal passe sammen. **Schema drift** opstår, når én ændrer databasen lokalt, produktion ændres manuelt, miljøer har forskellige skemaer, eller scripts ikke er i versionsstyring. Resultatet er runtime-fejl, manglende kolonner og deployments man ikke kan rulle tilbage.',
          ],
        },
        {
          term: 'DbUp',
          body: [
            'DbUp modellerer databasen som en række **overgange** (scripts), ikke en tilstand man “diff’er” sig frem til. Den tjekker historiktabellen `SchemaVersions`, finder scripts der ikke har kørt, kører dem i rækkefølge (nummererede filnavne) og logger dem. Fordele: sikre og reproducerbare deployments, godt i Docker og CI/CD. Ulemper: model og skema skal stadig opdateres i hånden, og det kræver SQL.',
          ],
        },
        {
          term: 'Dapper',
          body: [
            'Dapper mapper forespørgselsresultater til objekter (kolonne → property ved navn), men har ingen change tracking, SQL-generering, identity management, lazy loading, unit of work eller migrationer — det har en fuld ORM som EF Core. Brug Dapper, når du vil have fuld SQL-kontrol, ydeevne betyder noget, og du ikke har brug for change tracking.',
            '`Query<T>` giver mange rækker. `QuerySingle` kræver præcis én række; `QuerySingleOrDefault` giver `null` ved nul men kaster ved flere. `QueryFirst` kaster ved nul; `QueryFirstOrDefault` er ligeglad med flere. `Execute` er til INSERT/UPDATE/DELETE og returnerer antal påvirkede rækker. `ExecuteScalar` giver én værdi, fx `COUNT(*)` eller `SCOPE_IDENTITY()`. Alle findes i en `Async`-variant.',
            'Parametre gives som et anonymt objekt (`new { BookId = bookId }`) og beskytter mod SQL-injection.',
          ],
        },
      ],
      viz: 'dbup',
      keyPoints: [
        'SqlClient: connection → command → reader. Alt i `using`.',
        'Schema drift = kode og database ude af trit; migrationer gør skemaet til en del af koden.',
        'DbUp kører kun scripts, der ikke står i `SchemaVersions`, i nummerrækkefølge.',
        'Dapper = micro-ORM: rå SQL ind, objekter ud, ingen change tracking.',
        'Single = præcis én; First = den første; OrDefault = null i stedet for exception ved ingen.',
        'Parametrisér altid (`@BookId` + anonymt objekt) — aldrig strengsammensætning.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'SqlConnection og SqlDataReader',
          source: 'SW2BAD - SQL Connections.pdf s. 6',
          code: `String queryString =
    @"SELECT Title, Year
      FROM Movies;";

using (SqlConnection connection = new SqlConnection(connectionString))
{
    SqlCommand command = new SqlCommand(queryString, connection);
    connection.Open();

    using (SqlDataReader reader = command.ExecuteReader())
    {
        while (reader.Read())
        {
            Console.WriteLine(String.Format("{0}, {1}", reader[0], reader[1]));
        }
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Dapper med parametre',
          source: 'DbUp & Dapper.pdf s. 28',
          code: `var sql = "SELECT * FROM Books WHERE BookId = @BookId";

var result = await conn.QueryAsync<Book>(sql, new { BookId = bookId });`,
        },
        {
          lang: 'text',
          title: 'DbUp: nummererede scripts i projektet',
          source: 'DbUp & Dapper.pdf',
          code: `scripts/
  0001 - Initial create.sql
  0002 - Alter Books add price.sql
  0003 - Seed data.sql`,
        },
      ],
      exam: [
        'Schema drift er når databasen og koden ikke længere passer sammen, fx fordi nogen har ændret produktionsdatabasen i hånden. DbUp løser det ved at gøre skemaet til nummererede scripts i koden og kun køre dem, der ikke står i historiktabellen.',
        'Dapper er en micro-ORM: jeg skriver SQL’en selv, og Dapper mapper resultatet til objekter. Det er hurtigt og giver fuld kontrol, men der er ingen change tracking eller migrationer som i EF Core.',
        'Jeg sender altid parametre som et anonymt objekt i stedet for at sætte strenge sammen. Det beskytter mod SQL-injection.',
      ],
      sources: [
        { path: ctx('03-sql/sql-connections.md'), original: 'SW2BAD - SQL Connections.pdf', pages: 's. 2–6' },
        { path: ctx('04-webapi-rest/connection-string.md'), original: 'Connection String.html' },
        { path: ctx('04-webapi-rest/dbup-og-dapper.md'), original: 'DbUp & Dapper.pdf', pages: 's. 2–31' },
      ],
      keywords: ['SqlClient', 'SqlConnection', 'SqlCommand', 'SqlDataReader', 'ADO.NET', 'connection string', 'Dapper', 'micro ORM', 'DbUp', 'migration', 'schema drift', 'SchemaVersions', 'QuerySingle', 'ExecuteScalar', 'SQL injection'],
    },

    {
      slug: 'ef-core',
      title: 'Entity Framework Core',
      short: 'EF Core',
      week: 'Uge 5–6',
      definition:
        'EF Core er en **ORM**: C#-klasser mapper til tabeller, et `DbContext` repræsenterer databasen, og **migrationer** holder skemaet i takt med modellen. Relationer udtrykkes med navigation properties og evt. Fluent API.',
      concepts: [
        {
          term: 'SQL eller NoSQL',
          body: [
            'Slides starter med “det rigtige værktøj”: SQL giver vertikal skalering, ACID og normalisering; NoSQL giver horisontal skalering, eventual consistency og partitionering. Se [[mongodb|MongoDB]].',
          ],
        },
        {
          term: 'ORM og modelleringstilgange',
          body: [
            'En ORM giver abstraktion (ingen rå SQL), produktivitet, vedligeholdelighed og sikkerhed mod SQL-injection — mod en pris i ydeevne, komplekse forespørgsler og læringskurve.',
            '**Code first**: databasen genereres fra C#-klasserne. **Database first**: modellen scaffoldes fra en eksisterende database (`dotnet ef dbcontext scaffold …`). **Model first**: visuel designer, sjældent brugt.',
            'Oversættelsen: tabel ↔ klasse, kolonne ↔ property, række ↔ objekt, rækker ↔ samling, fremmednøgle ↔ reference, SQL `WHERE` ↔ LINQ `Where(…)`.',
          ],
        },
        {
          term: 'DbContext og registrering',
          body: [
            'Kontekstklassen arver fra `DbContext` og har en `DbSet<T>` pr. entitet. Den registreres med `builder.Services.AddDbContext<…>(o => o.UseSqlServer(…))` og får dermed levetiden **Scoped** — én pr. anmodning. PK-konventionen er `Id` eller `<Klasse>Id`.',
            'Connection-strengen holdes ude af kildekoden med `dotnet user-secrets set "ConnectionStrings:DefaultConnection" "…"`.',
          ],
        },
        {
          term: 'Migrationer',
          body: [
            'En migration er en versioneret ændring med `Up` og `Down`. `dotnet ef migrations add 0001-InitialCreate` laver den, `dotnet ef database update` anvender den, og `dotnet ef database update <Forrige>` ruller tilbage. Seed-data kan lægges i `OnModelCreating` og følger med migrationerne.',
          ],
        },
        {
          term: 'Attributter og relationer',
          body: [
            'Data annotations: `[Table]`, `[Key]`, `[Required]`, `[StringLength]`, `[Column(…, TypeName = …)]`, `[NotMapped]`, `[ForeignKey]`.',
            '1:1 og 1:N udtrykkes med navigation properties (en reference og/eller `ICollection<T>`). Ved N:N med to samlinger laver EF selv junction-tabellen (kan navngives med `UsingEntity(x => x.ToTable("AuthorFanclub"))`). Har junction-tabellen egne data (fx `Members`), modelleres den som sin egen entitet med to 1:N-relationer. Fluent API i `OnModelCreating`: `HasOne`/`HasMany` + `WithOne`/`WithMany`.',
          ],
        },
        {
          term: 'Avanceret: masseindsættelse, stored procedures og TVP',
          body: [
            'Masseindsættelse er hvor EF kan have det svært: standard er `AddRange()`; ellers tredjepartsbiblioteker eller stored procedures. Stored procedures kaldes med `FromSqlRaw`/`ExecuteSqlRaw`. Table Valued Parameters understøttes ikke direkte af EF og bruges via rå SQL med en `SqlParameter` af typen `Structured`.',
          ],
        },
      ],
      viz: 'ef-mapping',
      keyPoints: [
        'Klasse ↔ tabel, property ↔ kolonne, reference ↔ fremmednøgle.',
        'DbContext er Scoped: én pr. HTTP-anmodning.',
        'Migrationer har Up og Down; `database update <navn>` ruller tilbage.',
        'N:N uden ekstra data: EF laver junction-tabellen. Med ekstra data: modellér join-entiteten selv.',
        'Hemmeligheder i user-secrets lokalt, aldrig i appsettings i git.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Model, DbContext og registrering',
          source: 'EF intro.pdf s. 11–13',
          code: `public class Author
{
    public int AuthorId { get; set; }
    public string Name { get; set; }
    public string Nationality { get; set; }
}

public class LibraryContext : DbContext
{
    public LibraryContext(DbContextOptions options) : base(options) { }
    public DbSet<Author> Authors { get; set; }
}

// Program.cs
builder.Services.AddDbContext<LibraryContext>(options =>
{
    options.UseSqlServer(builder.Configuration["your-secret-key"]);
});`,
        },
        {
          lang: 'csharp',
          title: 'N:N med data på relationen — join-entitet',
          source: 'EF intro.pdf s. 24–25',
          code: `public class AuthorFanclub
{
    public int AuthorId { get; set; }
    public int FanclubId { get; set; }
    public Author Author { get; set; }
    public Fanclub Fanclub { get; set; }
    public int Members { get; set; }
}

protected override void OnModelCreating(ModelBuilder modelBuilder)
{
    modelBuilder.Entity<AuthorFanclub>()
        .HasOne(af => af.Author)
        .WithMany(a => a.AuthorFanclub);

    modelBuilder.Entity<AuthorFanclub>()
        .HasOne(af => af.Fanclub)
        .WithMany(f => f.AuthorFanclub);

    base.OnModelCreating(modelBuilder);
}`,
        },
        {
          lang: 'bash',
          title: 'Migrationer',
          source: 'EF intro.pdf s. 14',
          code: `dotnet tool install --global dotnet-ef
dotnet ef migrations add 0001-InitialCreate
dotnet ef database update
dotnet ef database update PreviousMigrationName`,
        },
      ],
      exam: [
        'EF Core er en ORM: klasser bliver til tabeller, properties til kolonner og referencer til fremmednøgler. DbContext repræsenterer databasen og registreres som scoped, så hver anmodning får sin egen.',
        'Med code first er C#-modellen sandheden, og migrationer med Up og Down bringer databasen i takt med den.',
        'En mange-til-mange-relation uden ekstra data laver EF selv en junction-tabel til. Har relationen egne data, modellerer jeg join-entiteten eksplicit som to én-til-mange-relationer.',
      ],
      sources: [
        { path: ctx('05-ef-core/ef-intro.md'), original: 'EF intro.pdf', pages: 's. 4–25' },
        { path: ctx('05-ef-core/ef-core-advanced.md'), original: 'EF Core Advanced.pdf', pages: 's. 11–16' },
        { path: 'bad/assignment3/Assignment 3.pdf', note: 'Aflevering 3: MovieVault Web API med EF Core' },
      ],
      keywords: ['Entity Framework', 'EF Core', 'ORM', 'DbContext', 'DbSet', 'migration', 'code first', 'database first', 'scaffold', 'Fluent API', 'OnModelCreating', 'navigation property', 'user-secrets', 'stored procedure', 'FromSqlRaw', 'seeding'],
    },

    {
      slug: 'linq',
      title: 'LINQ og IQueryable',
      short: 'LINQ',
      week: 'Uge 5–6',
      definition:
        'LINQ er en ensartet forespørgselsmodel for alle datakilder. Forespørgsler er **lazy**: de udføres først, når de itereres. Mod EF er de `IQueryable<T>`, som bliver til et **expression tree** og oversættes til SQL.',
      concepts: [
        {
          term: 'Query syntax og method syntax',
          body: [
            '`from s in names where s.Length == 5 orderby s select s.ToUpper()` er det samme som `names.Where(s => s.Length == 5).OrderBy(s => s).Select(s => s.ToUpper())`. En query expression starter med `from` og slutter med `select` (projektion) eller `group`.',
            '`OrderBy` returnerer en ordnet sekvens, så `ThenBy` kan tilføje et underordnet sorteringskriterie. `Reverse` vender rækkefølgen uden at se på værdierne.',
          ],
        },
        {
          term: 'Fundamentet',
          body: [
            'LINQ bygger på generics, anonyme metoder, `var`, lambdaer og expression trees samt **extension methods**: statiske metoder med `this` på første parameter, der kaldes som instansmetoder. Standardoperatorerne er extension methods i `System.Linq.Enumerable`; `using System.Linq;` giver dem til alle `IEnumerable<T>`.',
          ],
        },
        {
          term: 'Deferred execution',
          body: [
            '**Lazy** operatorer (`Where`, `Select`, `Take`, `Skip`, `OrderBy`, `GroupBy`) bygger kun forespørgslen. **Terminale** operatorer (`ToList`, `ToArray`, `Count`, `First`, `Single`, `Any`) udfører den.',
            'Faldgruben: `var evens = numbers.Where(…)` fulgt af to kald til `evens.Count()` kører forespørgslen **to gange**. Løsningen er at materialisere én gang med `.ToList()`.',
          ],
        },
        {
          term: 'IEnumerable vs. IQueryable',
          body: [
            'Med `IEnumerable<T>` bliver lambdaen kompileret til IL (`Func<T,bool>`) og kører **i hukommelsen** i .NET. Med `IQueryable<T>` bliver den et expression tree (`Expression<Func<T,bool>>`), som query-provideren (EF) **oversætter til SQL** og kører i databasen.',
            'Det er grunden til at filtre, sortering og paging (`Skip`/`Take`) skal ligge *før* `ToList()` mod en database — ellers hentes hele tabellen først.',
          ],
        },
      ],
      viz: 'linq-deferred',
      keyPoints: [
        'Query syntax og method syntax er det samme; compileren oversætter den ene til den anden.',
        'Lazy operatorer bygger; terminale operatorer udfører.',
        'Iterér en lazy forespørgsel to gange → den kører to gange.',
        'IQueryable → expression tree → SQL i databasen. IEnumerable → delegate → i hukommelsen.',
        'Paging: `.Skip((page - 1) * size).Take(size)` før materialisering.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Faldgrube og løsning',
          source: 'EF Core Advanced.pdf s. 6',
          code: `var evens = numbers.Where(n => n % 2 == 0);
Console.WriteLine(evens.Count());
Console.WriteLine(evens.Count());
// This query runs twice.

// The right way:
var evens = numbers.Where(n => n % 2 == 0).ToList();`,
        },
        {
          lang: 'csharp',
          title: 'Paging, sortering og filtrering mod EF',
          source: 'EF Core CRUD.pdf s. 28–30',
          code: `int pageNumber = 1;
int pageSize = 10;
var pagedResults = context.Products
    .Skip((pageNumber - 1) * pageSize)
    .Take(pageSize)
    .ToList();

var results = context.Books
    .Where(p => p.Author.Name == "Patrick Rothfuss")
    .ToList();`,
        },
      ],
      exam: [
        'LINQ er lazy: Where og Select bygger kun forespørgslen, og først ToList, Count eller First udfører den. Itererer jeg den samme forespørgsel to gange, kører den to gange.',
        'Mod EF Core arbejder jeg med IQueryable. Lambdaen bliver et expression tree, som EF oversætter til SQL, så filtreringen sker i databasen og ikke i hukommelsen.',
        'Derfor lægger jeg Where, OrderBy, Skip og Take før ToList.',
      ],
      sources: [
        { path: ctx('05-ef-core/linq.md'), original: 'LINQ.pdf', pages: 's. 2–21' },
        { path: ctx('05-ef-core/ef-core-advanced.md'), original: 'EF Core Advanced.pdf', pages: 's. 3–10' },
        { path: ctx('05-ef-core/ef-core-crud.md'), original: 'EF Core CRUD.pdf', pages: 's. 17–19, 28–30' },
      ],
      keywords: ['LINQ', 'IQueryable', 'IEnumerable', 'expression tree', 'deferred execution', 'lazy', 'Where', 'Select', 'ToList', 'Skip', 'Take', 'OrderBy', 'ThenBy', 'extension method', 'paging'],
    },

    {
      slug: 'di-levetider',
      title: 'DI-levetider, repository og DTO',
      short: 'DI, repository, DTO',
      week: 'Uge 5–6',
      definition:
        'En service registreres med én af tre levetider: **Transient** (ny hver gang), **Scoped** (én pr. anmodning) eller **Singleton** (én for hele appen). Repository og DTO’er er de mønstre, kurset bygger CRUD-lagene op med.',
      concepts: [
        {
          term: 'Hvorfor interfaces',
          body: [
            'Interfaces afkobler applikationen og øger testbarheden, understøtter SOLID (single responsibility, dependency inversion), gør det let at bytte implementering og giver en ensartet arkitektur med indbygget understøttelse i .NET.',
          ],
        },
        {
          term: 'Transient, Scoped og Singleton',
          body: [
            '**Transient** (`AddTransient`): ny instans hver gang servicen efterspørges. Til lette, tilstandsløse hjælpere. Kan koste ydeevne ved tunge services.',
            '**Scoped** (`AddScoped`): én instans pr. scope, i ASP.NET Core pr. HTTP-anmodning. Til tilstand der hører til én anmodning — typisk `DbContext`. Isoleret mellem brugere, men deles ikke på tværs af anmodninger.',
            '**Singleton** (`AddSingleton`): oprettes ved første efterspørgsel og deles af hele appen. Til cache, logging, konfiguration og dyre genbrugelige objekter. Delt tilstand skal håndteres med omtanke.',
            'Konsekvens, som går igen i [[background-services|background services]]: en afhængighed skal leve mindst lige så længe som den service, der har den. En singleton må derfor ikke holde en scoped `DbContext` direkte.',
          ],
        },
        {
          term: 'Repository',
          body: [
            'EF Core har allerede et rigt data-API (`DbSet<>` og LINQ). Et repository lægges alligevel ovenpå for at afkoble forretningslogik fra EF, gøre det let at mocke dataadgang i tests og adskille ansvar. Materialet viser et generisk `IRepository<T>` og et specialiseret `ICarRepository` oven på det.',
          ],
        },
        {
          term: 'DTO og Mapster',
          body: [
            'En DTO er et simpelt objekt uden forretningslogik, der transporterer data mellem lag eller over netværket. Fordele: adskillelse af ansvar, sikkerhed (klienten ser og sætter kun det, den må), ydeevne, tilpasset form og vedligeholdelighed.',
            'Mapping mellem entitet og DTO er “a machine job”. Mapster kopierer properties med samme navn (`src.Adapt<Dest>()`), klarer indlejrede typer og lister, kan konfigureres (`TypeAdapterConfig<…>.NewConfig().Map(…)`) og kan projicere direkte i SQL med `ProjectToType<T>()`. Ifølge slides’ benchmark er Mapster hurtigere end AutoMapper i alle målte tilfælde.',
          ],
        },
        {
          term: 'Controllers og statuskoder',
          body: [
            'En controller er mellemleddet mellem klient og forretningslogik; en action håndterer ét verbum. Returtyper: `Ok()` (200), `Created()`/`CreatedAtAction()` (201), `NotFound()` (404), `BadRequest()` (400).',
          ],
        },
      ],
      viz: 'di-lifetimes',
      keyPoints: [
        'Transient = ny hver gang. Scoped = én pr. anmodning. Singleton = én i alt.',
        '`DbContext` er Scoped.',
        'En service må ikke afhænge af noget med kortere levetid end den selv.',
        'Repository afkobler logik fra EF og gør dataadgang let at mocke.',
        'DTO: kun de felter klienten skal se eller sætte. Mapster klarer mappingen.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Registrering med tre levetider',
          source: 'EF Core CRUD.pdf s. 5',
          code: `services.AddTransient<ILibraryContext, LibraryContext>();
services.AddScoped<ILibraryContext, LibraryContext>();
services.AddSingleton<ILibraryContext, LibraryContext>();`,
        },
        {
          lang: 'csharp',
          title: 'Generisk repository',
          source: 'EF Core CRUD.pdf s. 13',
          code: `public interface IRepository<T> where T : class
{
    Task<T> GetByIdAsync(int id);
    Task<IEnumerable<T>> GetAllAsync();
    Task AddAsync(T entity);
    void Update(T entity);
    void Delete(T entity);
}`,
        },
        {
          lang: 'csharp',
          title: 'Mapster: entitet → DTO',
          source: 'Mapster.pdf s. 6–9',
          code: `var dto = entity.Adapt<ExerciseDto>();

List<UserDto> list = sourceList.Adapt<List<UserDto>>();

TypeAdapterConfig<Person, UserDto>
    .NewConfig()
    .Map(dest => dest.FullName, src => $"{src.FirstName} {src.LastName}");`,
        },
      ],
      exam: [
        'Transient giver en ny instans hver gang, scoped én pr. HTTP-anmodning, og singleton én for hele applikationen. DbContext er scoped, så to anmodninger aldrig deler kontekst.',
        'Jeg lægger et repository oven på EF for at afkoble forretningslogikken fra dataadgangen og kunne mocke den i tests.',
        'API’et returnerer DTO’er i stedet for entiteter, så klienten kun ser og kan sætte de felter, den skal. Mapster tager sig af mappingen.',
      ],
      sources: [
        { path: ctx('05-ef-core/ef-core-crud.md'), original: 'EF Core CRUD.pdf', pages: 's. 4–24' },
        { path: ctx('05-ef-core/mapster.md'), original: 'Mapster.pdf', pages: 's. 2–13' },
        { path: ctx('13-docs-caching-background/background-services.md'), original: 'SW4BAD - BackgroundServices.pdf', pages: 's. 8', note: 'Levetidsreglen' },
      ],
      keywords: ['dependency injection', 'DI', 'Transient', 'Scoped', 'Singleton', 'AddScoped', 'AddTransient', 'AddSingleton', 'service lifetime', 'levetid', 'repository', 'DTO', 'Mapster', 'AutoMapper', 'Adapt', 'CreatedAtAction'],
    },
  ],
}
