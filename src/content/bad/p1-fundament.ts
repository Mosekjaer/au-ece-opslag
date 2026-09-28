import type { Part } from '../types'
import { ctx } from './paths'

export const fundament: Part = {
  id: 'fundament',
  title: 'Fundament',
  topics: [
    {
      slug: 'http',
      title: 'HTTP og web-arkitektur',
      short: 'HTTP og web',
      week: 'Uge 1',
      definition:
        'HTTP er en klient-server-protokol efter **request-response**-mønstret: klienten sender en anmodning med URL og verbum, serveren svarer med en statuskode og evt. et indhold.',
      intro: [
        'Alt i faget hviler på det her lag. Et Web API er bare HTTP brugt mellem maskiner i stedet for mellem browser og menneske: “HTTP is not just for serving up web pages — it is also a powerful platform for building APIs”.',
      ],
      concepts: [
        {
          term: 'URL’ens dele',
          body: [
            'En ressource findes via en URL, der kan skilles ad i **scheme**, **server**, **port**, **path** og **query**, fx `http://www.ece.au.dk:1234/path/file.html?x=2&y=7`. Standardporte er 80 for http og 443 for https.',
            '`/` angiver hierarki, `?` adskiller ressourcen fra query-strengen, og `#` adskiller et fragment. Specialtegn escapes som `%NN`, fx `%20` for mellemrum. URL’er er en delmængde af URI’er (`scheme:scheme-specific-part`).',
          ],
        },
        {
          term: 'Verber og statuskoder',
          body: [
            'Materialet fremhæver fire verber: `GET` henter, `POST` opretter, `PUT` opdaterer og `DELETE` sletter en eksisterende ressource. Senere i kurset kommer `PATCH` til under REST.',
            'Statuskoderne er grupperet efter første ciffer: 1xx information, 2xx succes (`200 OK`, `201 Created`, `204 No Content`), 3xx omdirigering (`301`, `302`, `304 Not Modified`), 4xx klientfejl (`400`, `401`, `403`, `404`) og 5xx serverfejl (`500`, `503`).',
          ],
        },
        {
          term: 'HTTP/1.1, HTTP/2 og HTTP/3',
          body: [
            'HTTP/2 (RFC 7540, 2015) multiplexer flere forespørgsler over én forbindelse, komprimerer headers og kan lave server push. Semantikken er den samme som i HTTP/1.1; kun framing og transport er ændret.',
            'HTTP/1.1 og HTTP/2 kører over TCP. HTTP/3 kører over **QUIC** (UDP) for at løse *head-of-line blocking*: i HTTP/2 stopper et tabt TCP-segment alle strømme, mens QUIC kun rammer den strøm, der mistede data.',
          ],
        },
        {
          term: 'Statisk, dynamisk og API',
          body: [
            'En dynamisk side genereres på serveren ved hvert besøg — ét skabelon-dokument plus en databasetabel i stedet for 500 statiske sider (materialets ejendomsmægler-eksempel). Klient-side scripting (JavaScript) ændrer siden lokalt.',
            'Et Web API returnerer data (typisk JSON) i stedet for HTML, så browsere, SPA’er, mobilapps og andre servere kan bruge det. Moderne browsere har `fetch` til asynkrone kald.',
          ],
        },
      ],
      viz: 'http-roundtrip',
      keyPoints: [
        'HTTP er request-response: klienten starter altid; serveren svarer med statuskode og evt. body.',
        'URL = scheme + server + port + path + query (+ fragment). Port 80/443 er standard for http/https.',
        '2xx lykkedes, 4xx er klientens fejl, 5xx er serverens fejl. `401` og `403` er ikke det samme (se [[auth|Authentication og authorization]]).',
        'HTTP/3 skifter TCP ud med QUIC over UDP for at undgå head-of-line blocking.',
        'Protokolstakken: HTTP (applikation) over TCP eller QUIC+UDP (transport) over IP over link-laget.',
      ],
      exam: [
        'HTTP er en tilstandsløs request-response-protokol: klienten sender et verbum og en URL, serveren svarer med en statuskode og et indhold.',
        'Et Web API bruger den samme protokol, men svarer med data som JSON i stedet for HTML, så alle slags klienter kan bruge det.',
        'Statuskoden fortæller hvem der fejlede: 4xx betyder at anmodningen var forkert, 5xx at serveren fejlede.',
      ],
      sources: [
        { path: ctx('01-intro-og-docker/websites-og-webapps.md'), original: 'WebSitesAndWebApps.pdf', pages: 's. 6–14' },
        { path: ctx('04-webapi-rest/web-apis-aspnet-core.md'), original: 'Web APIs in ASPNET Core.pdf', pages: 's. 3–7' },
      ],
      keywords: ['URL', 'URI', 'status code', 'statuskode', 'GET', 'POST', 'PUT', 'DELETE', 'QUIC', 'request', 'response'],
    },

    {
      slug: 'docker',
      title: 'Docker og Docker Compose',
      short: 'Docker og Compose',
      week: 'Uge 1',
      definition:
        'Docker pakker en applikation med dens afhængigheder i et **image**; en **container** er en kørende instans af et image. Docker Compose beskriver en flercontainer-applikation i én YAML-fil.',
      concepts: [
        {
          term: 'Image, container og registry',
          body: [
            'Et image er en skrivebeskyttet skabelon, bygget fra en `Dockerfile`. Hver instruktion bliver et **lag**; lag caches og genbruges, og når ét lag ændres, skal alle lag under det bygges igen.',
            'En container er et image plus den konfiguration, den startes med. Den er isoleret fra andre containere og værten. Når containeren fjernes, forsvinder alt, der ikke ligger i persistent lagring.',
            'Docker-klienten (`docker run`, `build`, `pull`) taler med **Docker daemon** på værten, som bygger images og starter containere. Images hentes fra og skubbes til et **registry**, som standard Docker Hub.',
          ],
        },
        {
          term: 'Container vs. virtuel maskine',
          body: [
            'En VM har sit eget gæste-OS oven på en hypervisor. Containere deler værtens kerne og springer gæste-OS’et over, og derfor er de lettere og starter hurtigere.',
          ],
        },
        {
          term: 'Multi-stage build',
          body: [
            'Et stort image med SDK’et (`mcr.microsoft.com/dotnet/sdk:10.0`) bruges til at restore, bygge og `dotnet publish`. Et lille runtime-image (`mcr.microsoft.com/dotnet/aspnet:10.0`) får kun publish-outputtet via `COPY --from=build`. Det endelige image indeholder altså ikke SDK’et.',
            'Rækkefølgen i Dockerfilen er bevidst: `.csproj` kopieres og restores først som sit eget lag, så pakke-restore kun kører igen, når projektfilen ændres.',
            'aspnet-imaget lytter som standard på port **8080**; det kan ændres med `ENV ASPNETCORE_HTTP_PORTS=80`.',
          ],
        },
        {
          term: 'Persistens: volumes og bind mounts',
          body: [
            'Data skrevet i containerens filsystem forsvinder med containeren. **Volumes** ligger i en del af værtens filsystem, som Docker styrer, og bruges til at dele data mellem containere og til backup. **Bind mounts** monterer en vilkårlig mappe fra værten, fx konfiguration eller kildekode. `tmpfs` gemmer i hukommelsen.',
          ],
        },
        {
          term: 'Compose: services, netværk og opstartsrækkefølge',
          body: [
            'En `compose.yaml` erklærer `services` (påkrævet) og evt. `networks`, `volumes`, `configs` og `secrets`. `docker compose up -d` starter hele stakken, `down` stopper og fjerner den.',
            'Compose opretter som standard ét netværk, og hver service kan findes af de andre på et **værtsnavn lig servicens navn**. Derfor kan API’et nå databasen med `Server=db;…` i connection-strengen.',
            '“How to wait for MSSQL in Docker Compose?” — materialets svar er en `healthcheck` på databasen (her et `sqlcmd … -Q "SELECT 1"`) og `depends_on` med `condition: service_healthy`, så API’et først starter, når databasen svarer.',
          ],
        },
      ],
      viz: 'docker-multistage',
      keyPoints: [
        'Image = skabelon af lag. Container = kørende instans. Registry = hvor images deles.',
        'Multi-stage: byg i SDK-imaget, kør i det lille aspnet-image. Kun publish-outputtet kopieres over.',
        'Et ændret lag invaliderer alle lag under det — derfor restore før resten af koden kopieres.',
        'Uden volume eller bind mount er data væk, når containeren fjernes.',
        'I Compose er servicenavnet værtsnavnet. `healthcheck` + `condition: service_healthy` får API’et til at vente på databasen.',
        'Orkestrering (Kubernetes m.fl.) er uden for SW4BAD.',
      ],
      code: [
        {
          lang: 'dockerfile',
          title: 'Multi-stage Dockerfile til et ASP.NET Core API',
          source: 'Docker.pdf s. 11',
          code: `# build stage/image
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /source

# copy csproj and restore as distinct layers
COPY *.sln .
COPY api/*.csproj ./api/
RUN dotnet restore

# copy everything else and build app
COPY api/. ./api/
WORKDIR /source/api
RUN dotnet publish -c release -o /app

# final stage/image
FROM mcr.microsoft.com/dotnet/aspnet:10.0
WORKDIR /app
COPY --from=build /app ./
ENTRYPOINT ["dotnet", "api.dll"]`,
        },
        {
          lang: 'yaml',
          title: 'compose.yaml med API og SQL Server',
          source: 'Docker Compose.pdf s. 6',
          code: `services:
  api:
    build:
      dockerfile: Dockerfile
    ports:
      - "6000:8080"
    depends_on:
      - db
  db:
    image: mcr.microsoft.com/mssql/server
    user: root
    volumes:
      - hello-compose:/var/opt/mssql/data
    environment:
      MSSQL_SA_PASSWORD: "suchSecureVeryWordSoPassW0w!"
      ACCEPT_EULA: "Y"
    ports:
      - "1433:1433"
volumes:
  hello-compose:
    name: hello-compose-db`,
        },
        {
          lang: 'bash',
          title: 'Kør et image og udstil port 8080 som 5050',
          source: 'Docker.pdf s. 17',
          code: `docker build -t my_app .
docker run --rm -p 5050:8080 my_app`,
        },
      ],
      exam: [
        'Et image er en lagdelt, skrivebeskyttet skabelon; en container er en kørende instans af det. Containere deler værtens kerne og er derfor lettere end virtuelle maskiner.',
        'Jeg bruger multi-stage build, så SDK’et kun findes i build-trinnet, og det færdige image kun indeholder runtime og publish-output. Det giver et mindre image.',
        'I Compose kan API’et nå databasen på servicenavnet, fordi Compose laver et fælles netværk. Med en healthcheck og service_healthy starter API’et først, når databasen svarer.',
        'Data overlever kun at containeren fjernes, hvis de ligger i et volume eller en bind mount.',
      ],
      sources: [
        { path: ctx('01-intro-og-docker/docker.md'), original: 'Docker.pdf', pages: 's. 4–25' },
        { path: ctx('01-intro-og-docker/docker-compose.md'), original: 'Docker Compose.pdf', pages: 's. 3–16' },
        { path: 'bad/assignment1/assignment1 - Copy.pdf', note: 'Aflevering 1: multi-stage image, Docker Hub og compose.yml' },
      ],
      keywords: ['Dockerfile', 'image', 'container', 'volume', 'bind mount', 'compose', 'multi-stage', 'healthcheck', 'depends_on', 'Docker Hub'],
    },

    {
      slug: 'aspnet-pipeline',
      title: 'ASP.NET Core: pipeline, middleware og DI',
      short: 'Pipeline og middleware',
      week: 'Uge 1 og 4',
      definition:
        'En ASP.NET Core-app er en konsolapp med webserveren **Kestrel**. Anmodninger løber gennem en kæde af **middleware**, der hver kan gøre noget før og efter den næste — eller kortslutte og svare selv.',
      concepts: [
        {
          term: 'Kestrel og anmodningens vej',
          body: [
            'Kestrel er den krydsplatform-webserver, der følger med projektskabelonerne. Den modtager HTTP-anmodningen og sender den ind i middleware-pipelinen; appen laver et svar, der går tilbage gennem middleware og ud via Kestrel.',
            'Kestrel kan stå alene eller bag en **reverse proxy** (IIS, Nginx, Apache eller YARP), der tager imod fra internettet og videresender efter indledende behandling — se [[https-deployment|HTTPS og deployment]].',
          ],
        },
        {
          term: 'Services og dependency injection',
          body: [
            'Services er de komponenter, appen har brug for. De registreres i containeren (`IServiceProvider`) i `Program.cs`, og containeren opretter dem og giver dem til konstruktørerne. I materialets eksempel afhænger `RegisterUser` af `EmailSender`, som afhænger af `MessageFactory` og `NetworkClient` — containeren bygger hele grafen.',
            'Levetiderne Transient, Scoped og Singleton er et emne for sig: [[di-levetider|DI-levetider]].',
          ],
        },
        {
          term: 'Middleware og endpoints',
          body: [
            'Hver middleware kan sende anmodningen videre til den næste og gøre noget både før og efter. En middleware der ikke kalder videre, men svarer selv, kaldes **terminal middleware** eller et **endpoint**.',
            'Rækkefølgen af *services* er ligegyldig, men rækkefølgen af *middleware* er afgørende, fordi anmodningen løber igennem dem i den rækkefølge, de er registreret. Materialets regler: exception-handlers først; `UseForwardedHeaders` tidligt bag en proxy; statiske filer før auth; `UseCors` før endpoints; `UseAuthentication` før `UseAuthorization`.',
          ],
        },
        {
          term: 'Program.cs, controllers og minimal APIs',
          body: [
            '`WebApplication.CreateBuilder` laver builderen; services registreres på `builder.Services`; `builder.Build()` laver `app`; middleware registreres på `app`; `app.Run()` starter.',
            'En controller arver fra `ControllerBase` (kun data, til Web API’er) eller `Controller` (med views, til MVC). `[Route("api/[controller]")]` giver et fælles præfiks, `[HttpGet("{id}")]` m.fl. mapper actions. **Route + HTTP-metode = endpoint**: samme route kan have både et GET- og et DELETE-endpoint.',
            'Minimal APIs skriver endpoints direkte i `Program.cs` med `app.MapGet(…)`, `app.MapDelete(…)` osv. i stedet for `app.MapControllers()` og en controllerklasse.',
          ],
        },
        {
          term: 'async/await i actions',
          body: [
            'Et begrænset antal tråde skal betjene et ubegrænset antal samtidige anmodninger. Med `async`/`await` (Task-based Asynchronous Pattern) frigives tråden, mens der ventes på fx databasen, og fortsætter når Task’en er færdig.',
          ],
        },
      ],
      viz: 'middleware-pipeline',
      keyPoints: [
        'Kestrel → middleware → endpoint → tilbage gennem middleware → Kestrel.',
        'Middleware kan handle før og efter den næste; et endpoint kortslutter og svarer.',
        'Middleware-rækkefølgen er semantik: auth før authorization, CORS før endpoints, exception-handling først.',
        'Services registreres i DI-containeren; konstruktører får dem injiceret.',
        'Route + verbum = endpoint. `ControllerBase` til API, `Controller` til views.',
      ],
      code: [
        {
          lang: 'csharp',
          title: 'Program.cs: services før Build, middleware efter',
          source: 'Web APIs in ASPNET Core.pdf s. 15',
          code: `var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();
app.MapControllers();

app.Run();`,
        },
        {
          lang: 'csharp',
          title: 'Controller: fælles route, ét endpoint pr. route + verbum',
          source: 'Web APIs in ASPNET Core.pdf s. 17',
          code: `[ApiController]
[Route("api/[controller]")]
public class SampleController : ControllerBase
{
    [HttpGet]                   // GET /api/Sample
    public string Get() => "TODO: return all items";

    [HttpGet("{id}")]           // GET /api/Sample/{id}
    public string Get(int id) => $"TODO: return the item with id #{id}";

    [HttpDelete("{id}")]        // DELETE /api/Sample/{id}
    public string Delete(int id) => $"TODO: delete the item with id #{id}";
}`,
        },
      ],
      exam: [
        'En anmodning modtages af Kestrel og løber gennem middleware-pipelinen i den rækkefølge, middleware er registreret i Program.cs. Hver del kan gøre noget før og efter den næste, og et endpoint afslutter kæden og laver svaret.',
        'Rækkefølgen er ikke kosmetik: authentication skal ligge før authorization, ellers ved authorization ikke hvem brugeren er, og CORS skal ligge før endpoints.',
        'Services registreres i DI-containeren og injiceres i konstruktøren, så controlleren ikke selv opretter sine afhængigheder.',
      ],
      sources: [
        { path: ctx('01-intro-og-docker/intro-aspnet-core.md'), original: 'Introduction to ASP.NET Core.pdf', pages: 's. 4–5, 15' },
        { path: ctx('04-webapi-rest/web-apis-aspnet-core.md'), original: 'Web APIs in ASPNET Core.pdf', pages: 's. 9–20' },
        { path: ctx('04-webapi-rest/rest-principles.md'), original: 'REST principals.pdf', pages: 's. 18', note: 'Regler for middleware-rækkefølge' },
      ],
      keywords: ['Kestrel', 'middleware', 'Program.cs', 'controller', 'minimal API', 'endpoint', 'route', 'dependency injection', 'async', 'await', 'TAP'],
    },
  ],
}
