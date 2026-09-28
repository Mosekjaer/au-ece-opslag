import type { Part } from '../types'
import { ctx } from './paths'

export const drift: Part = {
  id: 'drift',
  title: 'Drift, data og sikkerhed',
  topics: [
    {
      slug: 'logging',
      title: 'Logging og Serilog',
      short: 'Logging',
      week: 'Uge 7',
      definition:
        'Logging registrerer hændelser i applikationen med tidsstempel og niveau. ASP.NET Core har en indbygget abstraktion (`ILogger<T>`), som **filtrerer** på niveau, kategori og provider; **Serilog** kan sidde bag den og skrive struktureret til fil, SQL Server eller MongoDB.',
      concepts: [
        {
          term: 'Hvorfor logge',
          body: [
            'Uden logs har udvikleren kun brugerens forklaring. Med logs kan man se hvad der skete. Materialet nævner fire grunde: **stabilitet** (find fejl og uhåndterede exceptions hurtigt), **sikkerhed** (er systemet kompromitteret, og hvad gjorde angriberen), **forretningskontinuitet** (alarmer før noget bliver kritisk) og **compliance** (regulering og GDPR).',
          ],
        },
        {
          term: 'ILogger<T> og niveauer',
          body: [
            '`ILogger<T>` injiceres i konstruktøren; kategorien bliver det fulde navn på `T`. Niveauer fra alvorligst: `Critical`, `Error`, `Warning`, `Information`, `Debug`, `Trace`.',
            'En logpost har op til seks elementer: niveau, kategori, besked, parametre, exception og et valgfrit `EventId`.',
          ],
        },
        {
          term: 'Filtrering',
          body: [
            'Beskeder kan filtreres fra, før de skrives, ud fra **niveau**, **kategori** og **provider**. Eksemplet i slides: standardminimum er `Information`; kategorier der starter med `Microsoft` kræver mindst `Warning`; console-provideren kræver mindst `Error`. Reglerne står i `appsettings.json` under `Logging`, og den øverste `LogLevel`-sektion bruges, når ingen provider-specifik regel gælder.',
          ],
        },
        {
          term: 'Struktureret logging',
          body: [
            'Skriv `_log.LogInformation("Loaded {RecipeCount} recipes", models.Count)` — **ikke** `$"Loaded {models.Count} recipes"`. Med en pladsholder gemmer en struktureret provider `RecipeCount=…` som et nøgle-værdi-par ved siden af den formaterede tekst, så man kan søge og filtrere på det. Med string interpolation går strukturen tabt.',
          ],
        },
        {
          term: 'Providers og Serilog',
          body: [
            'Indbyggede providers: Console (ikke til produktion), Debug, EventLog (kun Windows), EventSource og Azure App Service. `ILoggerFactory` spørger hver registreret provider og laver en `ILogger`, der skriver til dem alle.',
            'Serilog kan bruges som logging-API eller som provider bag Microsofts abstraktion. Den har **sinks** (destinationer: fil, SQL Server, MongoDB, Elasticsearch …) og **enrichers** (tilføjer fx MachineName og ThreadId). Konfigurationen står i sin egen `Serilog`-sektion med `MinimumLevel`, og niveauerne hedder `Verbose`, `Debug`, `Information`, `Warning`, `Error` og `Fatal`.',
            'Med MongoDB-sinken gemmes hver logpost som et dokument, og `{@LogInfo}` destrukturerer et objekt til struktureret data. Tip fra slides: tænk over hvilke forespørgsler loggen skal kunne besvare, *før* du vælger hvad du gemmer.',
          ],
        },
      ],
      viz: 'logging-filter',
      keyPoints: [
        'Critical > Error > Warning > Information > Debug > Trace.',
        'Filtrering: niveau + kategori + provider. Provider-specifikke regler går forud for den øverste `LogLevel`-sektion.',
        'Pladsholdere, ikke string interpolation — ellers er loggen ikke struktureret.',
        'Console-provideren er ikke til produktion.',
        'Serilog: sinks (hvor) og enrichers (ekstra kontekst).',
      ],
      code: [
        {
          lang: 'json',
          title: 'Filtreringsregler i appsettings.json',
          source: 'Logging.pdf s. 11',
          code: `{
    "Logging": {
        "LogLevel": {
            "Default": "Debug",
            "System": "Information",
            "Microsoft": "Warning"
        },
        "Console": {
            "LogLevel": {
                "Default": "Error"
            }
        }
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Serilog med fil- og SQL Server-sink',
          source: 'Logging.pdf s. 23',
          code: `builder.Host.UseSerilog((ctx, lc) =>
{
    lc.ReadFrom.Configuration(ctx.Configuration);

    lc.WriteTo.File("Logs/log.txt",
        outputTemplate:
            "{Timestamp:HH:mm:ss} [{Level:u3}] " +
            "[{MachineName} #{ThreadId}] " +
            "{Message:lj}{NewLine}{Exception}",
        rollingInterval: RollingInterval.Day);

    lc.WriteTo.MSSqlServer(
        connectionString:
            ctx.Configuration.GetConnectionString("DefaultConnection"),
        sinkOptions: new MSSqlServerSinkOptions
        {
            TableName = "LogEvents",
            AutoCreateSqlTable = true
        });
},
    writeToProviders: true);`,
        },
      ],
      exam: [
        'Logs gør det muligt at se hvad der faktisk skete. De bruges til stabilitet, sikkerhed, forretningskontinuitet og compliance.',
        'Hver logbesked har et niveau og en kategori, og filtreringen afgør ud fra niveau, kategori og provider, om den bliver skrevet.',
        'Jeg logger struktureret med pladsholdere i stedet for string interpolation, så værdierne gemmes som søgbare nøgle-værdi-par. Med Serilog kan de sendes til sinks som MongoDB.',
      ],
      sources: [
        { path: ctx('07-logging-signalr/logging.md'), original: 'Logging.pdf', pages: 's. 3–27' },
        { path: ctx('08-mongo/mongo-nested-queries-og-logging.md'), original: 'Mongo - nested queries and logging.pdf', pages: 's. 2–16' },
      ],
      keywords: ['logging', 'ILogger', 'LogLevel', 'Serilog', 'sink', 'enricher', 'structured logging', 'struktureret', 'appsettings', 'Information', 'Warning', 'Error', 'Seq'],
    },

    {
      slug: 'signalr',
      title: 'SignalR og realtid',
      short: 'SignalR',
      week: 'Uge 7',
      definition:
        'SignalR er et bibliotek til **tovejs** realtidskommunikation: serveren kan skubbe beskeder til klienten i stedet for kun at svare. Det vælger selv den bedste transport — WebSockets, Server-Sent Events eller long polling.',
      concepts: [
        {
          term: 'Tre måder at lave realtid',
          body: [
            '**Periodic polling**: klienten spørger med et fast interval. Virker overalt, men giver forsinkelse, mange forbindelser, spildt båndbredde og belastning af serveren.',
            '**Long polling**: klienten spørger, og serveren svarer først, når der er data (eller forbindelsen timer ud); så spørger klienten igen. Mindre overhead end polling, men binder tråde og forbindelser på serveren, og der skal stadig oprettes forbindelser løbende.',
            '**WebSockets**: en udvidelse af HTTP, der giver en rå, fuld-dupleks socket. Ægte tovejskommunikation, men begrænset understøttelse i ældre browsere.',
          ],
        },
        {
          term: 'Hubs',
          body: [
            'En hub er en klasse, der arver fra `Hub`, og en højniveau-pipeline, hvor klient og server kalder metoder hos hinanden. Serveren kalder en klientmetode ved at sende dens navn og parametre (`SendAsync("ReceiveMessage", user, message)`); klienten matcher navnet med `connection.on("ReceiveMessage", …)`. Protokollen er JSON eller binær MessagePack.',
          ],
        },
        {
          term: 'Hvem modtager',
          body: [
            '`Clients.All` (alle), `Clients.Caller` (kun den kaldende), `Clients.Others` (alle andre) og `Clients.Users(…)` (bestemte brugere). En **gruppe** er en navngiven samling forbindelser (`AddToGroupAsync`/`RemoveFromGroupAsync`), som nås med `Clients.Group("Cat lovers")`, `GroupExcept`, `Groups` og `OthersInGroup`.',
          ],
        },
        {
          term: 'Opsætning og kald fra en controller',
          body: [
            'Serverbiblioteket er en del af `Microsoft.AspNetCore.App`; JavaScript-klienten skal hentes separat, og klientversionen skal matche serveren. `builder.Services.AddSignalR()` og `app.MapHub<ChatHub>("/chatHub")`.',
            'Et Web API og en hub kombineres ved at injicere `IHubContext<ChatHub>` i en controller og kalde `Clients.All.SendAsync(…)`. Med **strongly typed hubs** (`Hub<IChat>`) erstattes strengnavnene af et interface.',
          ],
        },
      ],
      viz: 'signalr-transports',
      keyPoints: [
        'Polling: fast interval, mest spild. Long polling: serveren holder svaret tilbage. WebSockets: én vedvarende fuld-dupleks forbindelse.',
        'SignalR forhandler transporten selv: WebSockets → Server-Sent Events → long polling.',
        'Hub-metoder kaldes ved navn; strongly typed hubs fjerner magiske strenge.',
        'Målgrupper: All, Caller, Others, Users og Groups.',
        '`IHubContext<T>` lader en controller skubbe beskeder ud.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Hub og registrering',
          source: 'SignalR.pdf s. 29–30',
          code: `public class ChatHub : Hub
{
    public async Task SendMessage(string user, string message)
    {
        await Clients.All.SendAsync("ReceiveMessage", user, message);
    }
}

// Program.cs
builder.Services.AddSignalR();
// ...
app.MapHub<ChatHub>("/chatHub");`,
        },
        {
          lang: 'javascript',
          title: 'JavaScript-klienten',
          source: 'SignalR.pdf s. 32',
          code: `var connection = new signalR.HubConnectionBuilder().withUrl("/chatHub").build();

connection.start().then(function () {
    document.getElementById("sendButton").disabled = false;
}).catch(function (err) {
    return console.error(err.toString());
});

connection.on("ReceiveMessage", function (user, message) {
    // vis beskeden
});`,
        },
      ],
      exam: [
        'Uden realtid må klienten spørge igen og igen. Long polling forbedrer det ved at serveren holder svaret tilbage, men WebSockets giver én vedvarende forbindelse, hvor begge parter kan sende når som helst.',
        'SignalR abstraherer over transporterne og vælger selv den bedste. Kommunikationen går gennem en hub, hvor server og klient kalder metoder hos hinanden ved navn.',
        'Serveren kan sende til alle, til den kaldende, til de andre, til bestemte brugere eller til en gruppe. Fra en controller bruger jeg IHubContext.',
      ],
      sources: [
        { path: ctx('07-logging-signalr/signalr.md'), original: 'SignalR.pdf', pages: 's. 3–35' },
      ],
      keywords: ['SignalR', 'WebSocket', 'WebSockets', 'long polling', 'polling', 'Server-Sent Events', 'hub', 'realtime', 'realtid', 'IHubContext', 'MessagePack', 'groups', 'Clients.All'],
    },

    {
      slug: 'mongodb',
      title: 'MongoDB og dokumentdatabaser',
      short: 'MongoDB',
      week: 'Uge 8–9',
      definition:
        'En dokumentdatabase gemmer **dokumenter** (i MongoDB: BSON) i **collections** uden fast skema. Relaterede data kan **indlejres** i ét dokument eller **refereres** med id’er, som applikationen selv holder styr på.',
      concepts: [
        {
          term: 'NoSQL og dokumentdatabaser',
          body: [
            'NoSQL = *Not only SQL*: dokument-, graf-, nøgle-værdi- og kolonnedatabaser med forskellige datamodeller. Dokumentdatabaser **bryder 1NF** — en post kan have en liste af værdier — og er lavet til at skalere horisontalt, fordi der ikke er joins, og data kan shardes.',
            'MongoDB: database → collections → dokumenter af nøgle-værdi-par, hvor værdier kan være dokumenter, arrays eller simple typer. Højst 16 MB pr. dokument. `_id` er nøglen og genereres som ObjectId (tidsstempel, tilfældig værdi, tæller), hvis den mangler.',
          ],
        },
        {
          term: 'Indlejring vs. reference',
          body: [
            'Der er ingen hårde regler, men retningslinjer: start med et ER-diagram, lav et Mongo-design, og vis eksempeldokumenter. Optimér for færre roundtrips: hvilke data hører sammen, bruges sammen, opdateres sammen?',
            '**Indlejr** ved “contained” relationer (motor i bil), én-til-få, data der sjældent ændres, har en øvre grænse og hentes sammen. **Referér** ved én-til-mange og mange-til-mange, data der ændres ofte, og data uden øvre grænse.',
            'Referencer er svage: ingen fremmednøgler, intet håndhævet af databasen. Sletter man en bog, må applikationen selv rydde op i forfatternes lister.',
          ],
        },
        {
          term: 'Hurtige læsninger, dyrere skrivninger',
          body: [
            'Med forfatter og bøger i samme dokument hentes alt i én operation. Men data bliver ofte denormaliseret — samme bog kan ligge flere steder — så en opdatering af en titel skal ske flere steder.',
          ],
        },
        {
          term: 'Forespørgsler',
          body: [
            'I shellen: `db.inventory.find({ status: "D" })`, projektion `{ item: 1, status: 1 }` (inkludér/ekskludér kan ikke blandes, undtagen `_id`), `.sort({ qty: 1 }).skip(20*page).limit(20)`. Fra C#: `MongoClient` → `GetDatabase` → `GetCollection<Book>`, `Find(…)`, `InsertOne`, `ReplaceOne`, `DeleteOne`, eller LINQ via `AsQueryable()`. Klasser mappes med `[BsonId]`, `[BsonElement]` og `[BsonIgnoreExtraElements]`.',
            '**Aggregation** er en pipeline af stages (`$group`, `$match`, `$sort`, `$project`, `$limit`). `SelectMany` flader lister af lister ud til én liste.',
          ],
        },
        {
          term: 'Skemaændringer og konsistens',
          body: [
            'Skemaændringer håndteres ofte i koden: læs dokumentet, opdag den gamle version, opdatér og gem (fx `age` → `birthday`). I relationelle databaser bruges migrationer i stedet.',
            'Konsistens på tværs af dokumenter: brug `update` med operatorer som `$inc` for atomare ændringer i ét dokument; emulér transaktioner med en transaktions-collection; eller brug sessions og `StartTransaction`/`CommitTransaction`. Mange NoSQL-systemer accepterer **eventual consistency** — fint til en chat, ikke til en bank.',
          ],
        },
        {
          term: 'Sharding og replikering',
          body: [
            '**Sharding** deler data op på noder efter en shard key (shards, `mongos` som query-router, config-servere) og giver horisontal skalering. **Replikering** kopierer de samme data til flere noder (primary + secondaries) og giver automatisk failover.',
          ],
        },
      ],
      viz: 'mongo-embed',
      keyPoints: [
        'Database → collection → dokument (BSON). Intet fast skema; 1NF brydes bevidst.',
        'Indlejr det der læses sammen og er afgrænset; referér det der er ubegrænset eller ændres ofte.',
        'Referencer håndhæves ikke — applikationen står for integriteten.',
        'Denormalisering giver hurtige læsninger og dyrere skrivninger.',
        'Sharding = data fordelt; replikering = data kopieret.',
        'Eventual consistency: acceptabelt for chat, ikke for bank.',
      ],
      code: [
        {
          lang: 'json',
          title: 'Indlejret 1:N — bøger i forlaget',
          source: 'Mongo-intro.pdf s. 25',
          code: `{ "id": "1",
    "name": "O'Reilly",
    "books": [
        { "title": "Learning python" },
        { "title": "Jenkins 2 - up & running" },
        { "title": "Head First Kotlin" },
        { "title": "Mastering Ethereum" }
    ]
}`,
        },
        {
          lang: 'csharp',
          title: 'Aggregation fra C#',
          source: 'mongo2 - query and transactions.pdf s. 9',
          code: `var results = db.GetCollection<ZipEntry>
    .Aggregate()
    .Group(x => x.State, g =>
        new { State = g.Key, TotalPopulation = g.Sum(x => x.Population) })
    .Match(x => x.TotalPopulation > 20000)
    .ToList();`,
        },
      ],
      exam: [
        'En dokumentdatabase gemmer hele dokumenter uden fast skema. Den bryder bevidst første normalform for at kunne læse relaterede data i én operation og skalere horisontalt.',
        'Jeg indlejrer data der hører sammen, læses sammen og har en øvre grænse, og jeg refererer når relationen er mange-til-mange eller ubegrænset. Referencer håndhæves ikke af databasen, så applikationen står for integriteten.',
        'Prisen for denormalisering er, at en ændring kan skulle laves flere steder. Mange NoSQL-systemer accepterer eventual consistency.',
      ],
      sources: [
        { path: ctx('08-mongo/mongo-intro.md'), original: 'Mongo-intro.pdf', pages: 's. 2–41' },
        { path: ctx('08-mongo/mongo-query-og-transactions.md'), original: 'mongo2 - query and transactions.pdf', pages: 's. 2–34' },
        { path: ctx('08-mongo/mongo-nested-queries-og-logging.md'), original: 'Mongo - nested queries and logging.pdf', pages: 's. 10–16' },
      ],
      keywords: ['MongoDB', 'NoSQL', 'document', 'dokument', 'collection', 'BSON', 'embed', 'indlejring', 'reference', 'denormalization', 'sharding', 'replication', 'replikering', 'eventual consistency', 'aggregation', 'ObjectId', '_id'],
    },

    {
      slug: 'test',
      title: 'Test af Web API’er',
      short: 'Test af API’er',
      week: 'Uge 8',
      definition:
        'Et Web API testes på tre niveauer: **unit tests** af én komponent med mockede afhængigheder, **integrationstests** af appen med rigtig pipeline i en in-memory testserver, og **API-tests** udefra, fx med Postman.',
      concepts: [
        {
          term: 'Testpyramiden og testtyper',
          body: [
            'Horsdals version: nederst **unit tests** (en lille del af én microservice, in-process), i midten **service tests** (én hel microservice — API-test), øverst **system tests** (hele systemet, typisk via GUI — end-to-end).',
            'Typer af API-test: funktionel (virker det?), load (kan det klare fx 100 samtidige klienter?), sikkerhed (SQL-injection, autorisation) og fuzz (grænseværdier som −1 og 0, specialtegn og emoji, meget lange strenge, ugyldige formater).',
          ],
        },
        {
          term: 'Unit test med xUnit og Moq',
          body: [
            'En test er en offentlig metode med `[Fact]` (eller `[Theory]`) i en offentlig klasse, struktureret som **arrange, act, assert**. Afhængigheder erstattes af test doubles; med **Moq**: `mock.Setup(m => m.ConvertToGbp(It.IsAny<decimal>(), …)).Returns(3)` og `mock.Object` i konstruktøren. `It.Is<T>(predicate)`, `It.IsInRange`, `It.IsRegex` matcher argumenter.',
            'Skal man unit-teste controllers? Er de **tynde** — orkestrerer og kalder services — giver det ikke meget. Controlleren er grænsefladen mod frameworket, så integrationstests eller Postman-tests giver mere værdi.',
          ],
        },
        {
          term: 'Integrationstest',
          body: [
            'Integrationstests bruger de rigtige komponenter, kræver mere kode og tager længere tid. Læg dem i et separat projekt. `WebApplicationFactory<Program>` (fra `Microsoft.AspNetCore.Mvc.Testing`) kører en in-memory-version af den rigtige app med dens konfiguration, DI og middleware; `CreateClient()` giver en `HttpClient`. `TestHost` bruges, hvis pipelinen skal konfigureres anderledes end i appen.',
            'Databasen kan erstattes af SQLite in-memory (`DataSource=:memory:`). Migrationer er skrevet til en bestemt database, så brug `EnsureCreated()` i stedet.',
          ],
        },
        {
          term: 'Postman',
          body: [
            'Hver anmodning kan have et **pre-request script** (sæt tilstand op) og et **test script** (JavaScript med `pm.test` og Chai-assertions). Collection-scripts kører før/efter alle anmodninger. Brug variabler i stedet for hardkodede forventninger (`pm.collectionVariables`), ryd op efter dig (slet det, testen oprettede), og kør samlingen i CI. Postman kan også lave load-kørsler.',
          ],
        },
      ],
      viz: 'test-pyramid',
      keyPoints: [
        'Unit: én ting, afhængigheder mocket. Integration: rigtig pipeline. Service/API: udefra.',
        'Arrange, act, assert.',
        'Tynde controllers testes bedst med integrations- eller Postman-tests.',
        '`WebApplicationFactory<Program>` = den rigtige app i hukommelsen.',
        'SQLite in-memory: `EnsureCreated()`, ikke migrationer.',
        'Fuzz: grænser, specialtegn, lange strenge, ugyldige formater.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Unit test af en controller med Moq',
          source: 'Unit Testing Controllers.pdf s. 17',
          code: `[Fact]
public void Convert_ReturnsValue()
{
    // arrange
    Mock<ICurrencyConverter> mock = new();
    mock.Setup(m => m.ConvertToGbp(It.IsAny<decimal>(),
                                   It.IsAny<decimal>(),
                                   It.IsAny<int>()))
                                   .Returns(3);
    var controller = new CurrencyController(mock.Object);
    var model = new ExchangeInputModel { Value = 1, ExchangeRate = 3, DecimalPlaces = 2 };

    // act
    var result = controller.Convert(model);

    // assert
    Assert.Equal(3, result.Value);
}`,
        },
        {
          lang: 'csharp',
          title: 'Integrationstest med WebApplicationFactory',
          source: 'Integration Testing Controllers.pdf s. 14–15',
          code: `public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;
    public IntegrationTests(WebApplicationFactory<Program> factory) => _factory = factory;

    [Fact]
    public async Task ConvertReturnsExpectedValue()
    {
        HttpClient client = _factory.CreateClient();
        var content = JsonContent.Create(new ExchangeInputModel
            { Value = 6, ExchangeRate = 3, DecimalPlaces = 2 });

        var response = await client.PutAsync("/api/currency", content);

        response.EnsureSuccessStatusCode();
        Assert.Equal("2", await response.Content.ReadAsStringAsync());
    }
}`,
        },
      ],
      exam: [
        'En unit test tester én komponent isoleret. Afhængighederne erstattes af mocks, fx med Moq, og testen følger arrange, act, assert.',
        'Er controllerne tynde, giver unit tests af dem ikke meget. Så tester jeg med WebApplicationFactory, der kører den rigtige app med rigtig DI og middleware i hukommelsen.',
        'API-tests i Postman tester udefra og er uafhængige af hvordan API’et er implementeret. De kan køres i CI.',
      ],
      sources: [
        { path: ctx('09-testing/testing-overview.md'), original: 'Web API Testing overview.pdf', pages: 's. 2–16' },
        { path: ctx('09-testing/unit-testing-controllers.md'), original: 'Unit Testing Controllers.pdf', pages: 's. 2–20' },
        { path: ctx('09-testing/integration-testing-controllers.md'), original: 'Integration Testing Controllers.pdf', pages: 's. 2–17' },
        { path: ctx('09-testing/api-testing-postman.md'), original: 'Api testing with Postman.pdf', pages: 's. 2–27' },
      ],
      keywords: ['test', 'unit test', 'integration test', 'integrationstest', 'xUnit', 'Moq', 'mock', 'Fact', 'WebApplicationFactory', 'TestServer', 'TestHost', 'Postman', 'fuzz', 'load test', 'test pyramid', 'testpyramide', 'SQLite'],
    },

    {
      slug: 'auth',
      title: 'Authentication og authorization',
      short: 'AuthN og AuthZ',
      week: 'Uge 10',
      definition:
        '**Authentication** er at bevise “du er den du siger du er”. **Authorization** er at afgøre “du må gøre det du prøver på”. Er kravene ikke opfyldt, kortslutter authorize-filteret anmodningen med en **challenge** (ikke logget ind) eller en **forbid** (logget ind, men uden ret).',
      concepts: [
        {
          term: 'Tilstandsløs HTTP',
          body: [
            'HTTP husker intet mellem anmodninger, så hver anmodning skal bære beviset. Fire måder: **cookies** (et session-id sendes med automatisk), **bearer tokens** (et signeret token i `Authorization`-headeren), **API-nøgler** (et ClientID) og **signaturer/certifikater**.',
          ],
        },
        {
          term: 'Cookies og bearer tokens',
          body: [
            'Cookies sendes med hver anmodning og bør være små (højst ca. 4096 bytes). Fordi browseren sender dem automatisk, åbner de for **CSRF**-angreb. EU’s ePrivacy-direktiv kræver samtykke til de fleste cookies, men ikke til fx session-, autentifikations- og sikkerhedscookies.',
            'En JWT er selvstændig og signeret; serveren gemmer intet. Ulempen: et udstedt token kan ikke let tilbagekaldes. Løsningen er kort levetid (få minutter) og et **refresh token**. Detaljer i [[jwt|JWT og password-hashing]].',
          ],
        },
        {
          term: 'ASP.NET Core Identity',
          body: [
            'Identity er et medlemssystem: brugere, logins, eksterne udbydere og lagring (SQL Server via EF). Trinene: installér pakkerne, lav en brugerentitet der arver `IdentityUser` (kald den `ApiUser`, ikke `User`, som kolliderer med `ControllerBase.User`), lad konteksten arve `IdentityDbContext<ApiUser>`, lav en migration, registrér services og middleware, og lav en `AccountController` med Register og Login.',
            '`UserManager.CreateAsync` salter og hasher passwordet; det gemmes aldrig i klartekst.',
          ],
        },
        {
          term: '[Authorize], [AllowAnonymous] og 401/403',
          body: [
            '`[Authorize]` på en action eller controller kræver en godkendt bruger. Man kan vende logikken: `[Authorize]` på hele controlleren og `[AllowAnonymous]` på de offentlige actions — husk Register og Login, ellers kan ingen logge ind.',
            'Authentication-middlewaren deserialiserer `ClaimsPrincipal` fra cookien eller JWT’en til `HttpContext.User`, før authorize-filteret kører. Er kravene ikke opfyldt, kortslutter filteret med **`ChallengeResult`** (brugeren er ikke logget ind) eller **`ForbidResult`** (brugeren er logget ind, men mangler en claim eller rolle).',
            'Statuskoden står i bogen (kap. 9), ikke i slides: et `[Authorize]`-endpoint kaldt uden token giver `401 - Unauthorized`, og det gør en indlogget bruger uden den krævede rolle også — TestUser får 401 på `/auth/test/2` og `/auth/test/3`, TestModerator får 401 på `/auth/test/3`.',
          ],
        },
        {
          term: 'RBAC, CBAC og PBAC',
          body: [
            '**Rollebaseret** (RBAC): brugere har roller, og roller giver adgang — `[Authorize(Roles = RoleNames.Administrator)]`. **Claims-baseret** (CBAC): en claim er en oplysning om brugeren (type + evt. værdi); en policy kræver claims (`RequireClaim`). **Policy-baseret** (PBAC): en policy består af requirements (`IAuthorizationRequirement`) og handlers (`AuthorizationHandler<T>`). Alle requirements skal opfyldes, men én handler pr. requirement er nok. RBAC og CBAC er forenklede former for PBAC.',
            '**Ressourcebaseret** autorisation kalder `IAuthorizationService.AuthorizeAsync(User, recipe, "CanManageRecipe")` i actionen, når beslutningen afhænger af den konkrete ressource, fx om brugeren ejer opskriften.',
          ],
        },
        {
          term: 'Autorisationsservere og OAuth2',
          body: [
            'I en microservice-arkitektur sendes brugeren til en autoritet (IdentityServer, Azure AD, Auth0, Keycloak …), der udsteder et token. OAuth2 (RFC 6749) lader en ressourceejer give tredjepart adgang **uden at dele sine credentials** — “log ind med Google”.',
          ],
        },
      ],
      viz: 'auth-flow',
      keyPoints: [
        'AuthN = hvem er du. AuthZ = hvad må du.',
        '`UseAuthentication()` før `UseAuthorization()`.',
        'Ikke logget ind → `ChallengeResult`. Logget ind, men uden rolle → `ForbidResult`. Bogen viser `401` i begge tilfælde.',
        'Bearer tokens kan ikke tilbagekaldes; hold levetiden kort og brug refresh tokens.',
        'RBAC ⊂ CBAC ⊂ PBAC. Alle requirements skal opfyldes; én handler pr. requirement er nok.',
        'Passwords gemmes aldrig — kun salt + hash.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'JWT som standard-scheme og middleware i rigtig rækkefølge',
          source: 'Authentication and Authorization.pdf s. 21–23',
          code: `builder.Services.AddAuthentication(options => {
    options.DefaultAuthenticateScheme =
    options.DefaultChallengeScheme =
    options.DefaultForbidScheme =
    options.DefaultScheme =
    options.DefaultSignInScheme =
    options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(options => {
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JWT:Issuer"],
        ValidateAudience = true,
        ValidAudience = builder.Configuration["JWT:Audience"],
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(
            System.Text.Encoding.UTF8.GetBytes(
                builder.Configuration["JWT:SigningKey"]))
    };
});

// ...
app.UseAuthentication();
app.UseAuthorization();`,
        },
        {
          lang: 'csharp',
          title: 'Standard lukket, enkelte actions åbne',
          source: 'Authentication and Authorization.pdf s. 44',
          code: `[Authorize]
public class AccountController : ControllerBase
{
    [AllowAnonymous]
    [HttpPost]
    public async Task<ActionResult> Register(RegisterDTO input)
    {
        // ...
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'Claims-baseret policy',
          source: 'Authentication and Authorization.pdf s. 51',
          code: `builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("ModeratorWithMobilePhone",
        policy => policy
            .RequireClaim(ClaimTypes.Role, RoleNames.Moderator)
            .RequireClaim(ClaimTypes.MobilePhone)
    );
});

[Authorize(Policy = "ModeratorWithMobilePhone")]`,
        },
      ],
      exam: [
        'Authentication er at bevise hvem man er; authorization er at afgøre hvad man må. Derfor skal UseAuthentication ligge før UseAuthorization i pipelinen.',
        'Mangler brugeren at logge ind, kortslutter authorize-filteret med en challenge. Er brugeren logget ind men mangler rolle eller claim, er det en forbid. I bogens eksempler får klienten 401 Unauthorized i begge tilfælde.',
        'Rollebaseret autorisation tjekker roller, claims-baseret tjekker oplysninger om brugeren, og policy-baseret samler requirements og handlers. De to første er specialtilfælde af den tredje.',
      ],
      sources: [
        { path: ctx('10-auth/authentication-og-authorization.md'), original: 'Authentication and Authorization.pdf', pages: 's. 2–70' },
        { path: ctx('bog/09-auth.md'), original: 'Building Web APIs with ASP.NET Core, kap. 9', note: 'Testforløbet med TestUser, TestModerator og TestAdministrator (401/200)' },
      ],
      gaps: [
        'Uden for materialet: I ASP.NET Core svarer JWT-bearer-handleren som standard `403 Forbidden` på en forbid (Microsofts dokumentation), mens bogen skriver `401` for en indlogget bruger uden rolle. Til en check-samtale er bogens svar kursets svar, men kør testen selv og se, hvad din API faktisk returnerer.',
      ],
      keywords: ['authentication', 'authorization', 'autentifikation', 'autorisation', '401', '403', 'Unauthorized', 'Forbidden', 'Identity', 'IdentityUser', 'Authorize', 'AllowAnonymous', 'claim', 'role', 'RBAC', 'CBAC', 'PBAC', 'policy', 'cookie', 'CSRF', 'OAuth', 'ChallengeResult', 'ForbidResult'],
    },

    {
      slug: 'jwt',
      title: 'JWT og password-hashing',
      short: 'JWT og bcrypt',
      week: 'Uge 10',
      definition:
        'En **JSON Web Token** (RFC 7519) er tre Base64Url-dele adskilt af punktum — header, payload og signatur. Signaturen gør enhver ændring synlig. Passwords gemmes aldrig, kun som **salt + hash**, fx med bcrypt.',
      concepts: [
        {
          term: 'De tre dele',
          body: [
            '**Header** (JOSE): `{ "alg": "HS256", "typ": "JWT" }`. **Payload**: claims — reserverede (`iss`, `exp`, `sub`, `aud`, `iat`, `nbf`, `jti`), offentlige og private (fx `name`, `admin`). **Signatur**: `HMACSHA256(base64UrlEncode(header) + "." + base64UrlEncode(payload), secret)`.',
            'Tokenet er **kompakt** (kan sendes i URL, POST-parameter eller header) og **selvstændigt** (payload indeholder hvad der skal til, så databasen ikke skal spørges hver gang). Det er signeret, ikke krypteret: JWS beskytter mod ændringer, JWE gør indholdet ulæseligt for andre. De fleste JWT’er er kun signerede.',
          ],
        },
        {
          term: 'Flowet',
          body: [
            'Brugeren logger ind; serveren returnerer en JWT, som klienten gemmer (typisk i local storage). Ved hver beskyttet anmodning sendes `Authorization: Bearer <token>`. Serveren validerer signatur, issuer, audience og levetid (`ValidateLifetime`, evt. `ClockSkew`).',
          ],
        },
        {
          term: 'Sårbarheder',
          body: [
            '**`alg: none`**: nogle biblioteker godtog tokens “signeret” med none, så alle kunne lave gyldige tokens. **Algoritmeforvirring**: forventer serveren RSA men får HS256, bruges den *offentlige* nøgle som HMAC-hemmelighed — og den kan angriberen hente. Anbefalingen: brug aldrig algoritmen fra tokenets header; serveren skal selv vide, hvilken algoritme der gælder.',
            'Asymmetriske algoritmer (RSA, ECDSA) signerer med en privat nøgle og verificerer med en offentlig: kun du kan udstede, alle kan verificere.',
          ],
        },
        {
          term: 'Hashing, salt og bcrypt',
          body: [
            'Hashing er envejs: man kan ikke få passwordet tilbage, men kan tjekke et indtastet password ved at hashe det og sammenligne. Hashing alene er ikke nok — et **salt** er en tilfældig streng pr. bruger, der kombineres med passwordet før hashing. Både salt og hash gemmes; med bcrypt i samme felt.',
            'bcrypt (Provos og Mazières, bygget på Blowfish) bruger kun de første **72 tegn** af passwordet. `BCrypt.HashPassword(password, workFactor)` ved registrering, `BCrypt.Verify(password, hash)` ved login. Identity’s `UserManager` gør det samme bag kulisserne.',
          ],
        },
      ],
      viz: 'jwt-anatomy',
      keyPoints: [
        'header.payload.signature — Base64Url, ikke kryptering.',
        'Signaturen dækker header og payload; ændres ét tegn, fejler valideringen.',
        'Send som `Authorization: Bearer <token>`.',
        'Brug aldrig `alg` fra headeren. Afvis `none`.',
        'Salt pr. bruger + langsom hash (bcrypt). bcrypt bruger kun 72 tegn.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Udsted en JWT ved login',
          source: 'Authentication and Authorization.pdf s. 29',
          code: `var signingCredentials = new SigningCredentials(
    new SymmetricSecurityKey(
        System.Text.Encoding.UTF8.GetBytes(_configuration["JWT:SigningKey"])),
    SecurityAlgorithms.HmacSha256);
var claims = new List<Claim>();
claims.Add(new Claim(ClaimTypes.Name, user.UserName));
var jwtObject = new JwtSecurityToken(
    issuer: _configuration["JWT:Issuer"],
    audience: _configuration["JWT:Audience"],
    claims: claims,
    expires: DateTime.Now.AddSeconds(300),
    signingCredentials: signingCredentials);
var jwtString = new JwtSecurityTokenHandler().WriteToken(jwtObject);`,
        },
        {
          lang: 'csharp',
          title: 'bcrypt ved registrering og login',
          source: 'Secure Web.API - with BCrypt.pdf s. 10–11',
          code: `const int BcryptWorkfactor = 11;

// Register
user.PwHash = BCrypt.Net.BCrypt.HashPassword(regUser.Password, BcryptWorkfactor);

// Login
var validPwd = Verify(login.Password, user.PwHash);`,
        },
      ],
      exam: [
        'En JWT består af header, payload og signatur, Base64Url-kodet og adskilt af punktummer. Signaturen beregnes over header og payload med en hemmelig nøgle, så enhver ændring opdages.',
        'Den er signeret, ikke krypteret, så payload må ikke indeholde hemmeligheder. Serveren skal selv vide hvilken algoritme der bruges og aldrig stole på alg i headeren.',
        'Passwords hashes med et tilfældigt salt pr. bruger, fx med bcrypt. Ved login hasher jeg det indtastede password og sammenligner.',
      ],
      sources: [
        { path: ctx('10-auth/json-web-token.md'), original: 'JSON Web Token.pdf', pages: 's. 2–20' },
        { path: ctx('10-auth/secure-webapi-bcrypt.md'), original: 'Secure Web.API - with BCrypt.pdf', pages: 's. 3–26' },
        { path: ctx('10-auth/authentication-og-authorization.md'), original: 'Authentication and Authorization.pdf', pages: 's. 28–29' },
      ],
      keywords: ['JWT', 'JSON Web Token', 'bearer', 'claims', 'signature', 'signatur', 'HS256', 'HMAC', 'RSA', 'alg none', 'JWS', 'JWE', 'bcrypt', 'salt', 'hash', 'password'],
    },

    {
      slug: 'https-deployment',
      title: 'HTTPS, HSTS og deployment',
      short: 'HTTPS og deployment',
      week: 'Uge 10–11',
      definition:
        'HTTPS er almindelig HTTP over en TLS-krypteret forbindelse; **HSTS** får browseren til altid at bruge HTTPS. Deployment handler om at køre appen sikkert i produktion — ofte bag en **reverse proxy**, der videresender den oprindelige klients oplysninger i `X-Forwarded-*`-headers.',
      concepts: [
        {
          term: 'HTTPS',
          body: [
            'HTTPS er ikke en separat protokol, men HTTP inde i TLS (tidligere SSL). Formålet er at autentificere websitet og beskytte privatliv og integritet — mod man-in-the-middle. Alt i HTTP krypteres: URL, query, headers, cookies og body. **IP-adresse og port** er en del af TCP/IP og kan ikke skjules.',
            'Browsere stoler på websites via certifikatautoriteter (CA’er, X.509), der er forudinstalleret. Serveren skal have et certifikat signeret af en CA, der bekræfter at ejeren ejer domænet. Let’s Encrypt udsteder dem gratis.',
          ],
        },
        {
          term: 'HSTS',
          body: [
            'Websites skal kunne håndtere både HTTP og HTTPS; **API’er bør afvise HTTP**. HSTS (HTTP Strict Transport Security) modvirker protokol-nedgradering og cookie-kapring — “secure or not at all”.',
            'Flowet: browseren sender HTTP → appen svarer **307 Temporary Redirect** til HTTPS → browseren sender HTTPS → appen svarer med headeren `strict-transport-security` → fremover afbryder browseren selv ethvert HTTP-forsøg og bruger HTTPS.',
          ],
        },
        {
          term: 'Hosting og reverse proxy',
          body: [
            'En ASP.NET Core-app er en konsolapp med Kestrel. Kestrel kan stå direkte på internettet (edge) eller bag en reverse proxy (IIS, Nginx, Apache, YARP). Proxyen begrænser angrebsfladen, giver et ekstra forsvarslag, kan cache, og gør load balancing og HTTPS enklere — kun proxyen skal have domænets certifikat. Ulempen er kompleksitet.',
            'Bag en proxy mister appen den oprindelige scheme og klientens IP. Proxyen sender dem i `X-Forwarded-For`, `X-Forwarded-Proto`, `X-Forwarded-Host` og `X-Forwarded-Prefix`, og `ForwardedHeadersMiddleware` sætter dem på `HttpContext` — derfor skal den ligge tidligt i pipelinen.',
          ],
        },
        {
          term: 'Klargøring til produktion',
          body: [
            '`ASPNETCORE_ENVIRONMENT` vælger `appsettings.{Environment}.json`; standard er **Production**. Forskellige connection-strings pr. miljø. Produktionshemmeligheder ligger kun på produktionsserveren — som fil, miljøvariabler eller platformens secret-lager.',
            'Funktioner der hjælper under udvikling er trusler i produktion: Swagger UI og developer exception pages aktiveres kun i Development, mens `UseHsts()` kun bruges uden for Development.',
            '**Framework-dependent** deployment er lille og krydsplatform, men kræver .NET på værten. **Self-contained** bundler runtime med: fuld kontrol over versionen, men platformsafhængig og større. Deployment kan også ske med Docker Compose eller direkte til Azure App Service fra Visual Studio.',
          ],
        },
      ],
      viz: 'hsts',
      keyPoints: [
        'HTTPS = HTTP i TLS. IP og port er ikke skjult.',
        'API’er afviser HTTP; websites redirecter.',
        'HSTS: første gang 307 → HTTPS + header; derefter bruger browseren selv HTTPS.',
        'Bag en proxy: `X-Forwarded-*` + `UseForwardedHeaders()` tidligt.',
        '`ASPNETCORE_ENVIRONMENT` er som standard Production.',
        'Swagger og exception pages kun i Development; hemmeligheder kun på serveren.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Forskel på Development og Production',
          source: 'Release and Deployment.pdf s. 14',
          code: `var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
else
{
    app.UseHsts(); // HTTP Security Headers
}

app.UseHttpsRedirection();`,
        },
      ],
      exam: [
        'HTTPS er HTTP inde i en TLS-forbindelse. Alt i anmodningen krypteres undtagen IP-adresse og port, og certifikatet fra en CA beviser at serveren ejer domænet.',
        'HSTS sørger for, at browseren efter første besøg selv bruger HTTPS. Første gang redirecter appen med 307 og sender strict-transport-security-headeren med.',
        'Bag en reverse proxy mister appen den oprindelige IP og scheme. De sendes i X-Forwarded-headers, som forwarded headers-middlewaren læser tidligt i pipelinen.',
        'Før release gennemgår jeg appsettings og Program.cs: Swagger kun i development, HSTS i produktion og hemmeligheder uden for koden.',
      ],
      sources: [
        { path: ctx('11-release-security/https.md'), original: '86 HTTPS.pdf', pages: 's. 2–14' },
        { path: ctx('11-release-security/release-og-deployment.md'), original: 'Release and Deployment.pdf', pages: 's. 2–17' },
        { path: ctx('11-release-security/deploy-til-azure.md'), original: 'Deploy_to_azure.pdf' },
        { path: ctx('11-release-security/asp-security.md'), original: 'week 11 - ASP Security.pdf', note: 'Ældre version af HTTPS-decket' },
      ],
      keywords: ['HTTPS', 'TLS', 'SSL', 'HSTS', 'certificate', 'certifikat', 'CA', "Let's Encrypt", '307', 'reverse proxy', 'X-Forwarded-For', 'forwarded headers', 'Kestrel', 'deployment', 'self-contained', 'framework-dependent', 'ASPNETCORE_ENVIRONMENT', 'Azure', 'appsettings'],
    },
  ],
}
