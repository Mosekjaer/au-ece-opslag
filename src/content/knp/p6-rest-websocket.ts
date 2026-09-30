import type { Part } from '../types'
import { BOG, k } from './paths'

/* P6 REST og WebSocket. Kursuskataloget lover emnerne, men bogen dækker dem ikke:
   "REST" står kun i SDN-afsnittet 5.5 (s. 445, 448, 451), og "WebSocket" forekommer
   ikke i bogen (søgt i hele PDF’en med pdftotext). Emnerne har derfor ingen figur og
   intet indhold fra generel viden — kun det, bogen siger om HTTP, og pegere til BAD/FED. */

const UGE_GAP = 'Der findes ingen lektionsplan for KNP; “Uge 9” er vejledende og sat efter kursuskatalogets rækkefølge (REST og WebSocket til sidst).'

export const restWebsocket: Part = {
  id: 'rest-websocket',
  title: 'REST og WebSocket',
  topics: [
    // ─────────────────────────────────────────────────────────────── REST
    {
      slug: 'rest-api',
      title: 'REST-arkitektur og REST API',
      short: 'REST API',
      week: 'Uge 9',
      definition:
        'Kursuskataloget lover “REST-arkitekturen” og “HTTP-protokollen og REST API” som kursusindhold, og to læringsmål: “Beskrive hvordan man opbygger et REST API, der følger REST-arkitekturen” og “Anvende HTTP og WebSocket samt udvikle REST API til klient/server”. Bogen dækker ikke REST-arkitekturen — kun HTTP, som et REST API bygger på.',
      concepts: [
        {
          term: 'Hvad materialet dækker',
          body: [
            '**Request.** En HTTP-anmodning består af en request line med metode, URL og version, header lines, en tom linje og en entity body (figur 2.8, s. 132). Metodefeltet kan være `GET`, `POST`, `HEAD`, `PUT` og `DELETE` (s. 131). Body’en er tom ved `GET` og bruges ved `POST`; `HEAD` svarer uden selve objektet; `PUT` lægger et objekt op på en bestemt sti på en webserver, og `DELETE` sletter et objekt på serveren (s. 132–133).',
            '**Response.** Svaret har en statuslinje med version, statuskode og tekst, header lines og en entity body (figur 2.9, s. 134). `Content-Length` angiver antal bytes i objektet, og `Content-Type` angiver typen — typen bestemmes af headeren, ikke af filendelsen (s. 134). Bogens statuskoder er `200 OK`, `301 Moved Permanently`, `400 Bad Request`, `404 Not Found` og `505 HTTP Version Not Supported` (s. 134–135) samt `304 Not Modified` ved conditional GET (s. 143).',
            '**Stateless.** En HTTP-server gemmer ingen oplysninger om klienterne og kaldes derfor tilstandsløs (s. 127–128); det forenkler serveren og gør det muligt at håndtere tusinder af samtidige TCP-forbindelser (s. 135). Tilstand lægges ovenpå med cookies (s. 135–136, se [[cookies-caching|cookies og caching]]).',
            '**REST som ord.** Bogen nævner REST kun i afsnittet om SDN: controllere taler med deres applikationer gennem “a REST [Fielding 2000] request-response interface” (s. 445), OpenDaylight bruger “a REST request-response API running over HTTP” (s. 451), og figur 5.15–5.16 har en boks med “RESTful API” (s. 445, 448). Hvad REST er, forklares ikke.',
          ],
        },
      ],
      keyPoints: [
        'Bogen dækker HTTP’s request/response-format, metoderne `GET`, `POST`, `HEAD`, `PUT`, `DELETE` og et udvalg af statuskoder (s. 131–135, 143) — se [[http|HTTP]].',
        'HTTP er tilstandsløs (s. 127–128); cookies tilføjer tilstand ovenpå.',
        'REST-arkitekturen står ikke i KNP-materialet. De seks constraints og uniform interface står i [[bad/rest|REST i BAD]]; verber, statuskoder og URL’ens dele i [[bad/http|HTTP i BAD]].',
        'Brug af et REST API fra en klient: [[fed/promises-fetch|fetch i FED]], [[fed/react-fetch|json-server og React i FED]] og [[fed/maui-data|HttpClient i FED]].',
      ],
      exam: [
        'Et REST API bygger på HTTP: klienten sender en request med metode, URL, headers og evt. body, og serveren svarer med en statuskode, headers og evt. body.',
        'Bogen beskriver metoderne GET, POST, HEAD, PUT og DELETE og statuskoder som 200, 301, 304, 400, 404 og 505, og at HTTP er tilstandsløs.',
        'Selve REST-arkitekturen og dens constraints ligger uden for KNP-bogen; journalen må hente dem fra BAD-materialet eller Fieldings kilde og sige det.',
      ],
      sources: [
        { path: BOG, pages: 's. 127–136, 143', note: 'Ingen slides — kun bog. HTTP-beskedformat, metoder, statuskoder og stateless (afsnit 2.2)' },
        { path: BOG, pages: 's. 445, 448, 451', note: 'De eneste steder “REST” står i bogen: SDN-controllerens northbound API (afsnit 5.5)' },
        { path: k('kursuskatalog.md'), note: 'Kursusindhold “REST-arkitekturen” og “HTTP-protokollen og REST API”; læringsmål 4 og 5' },
        { path: 'bad/context/04-webapi-rest/rest-principles.md', original: 'REST principals.pdf', pages: 's. 4–10', note: 'BAD-materiale, kun som peger: de seks constraints og uniform interface' },
      ],
      gaps: [
        'Bogen definerer ikke REST og nævner ikke de seks constraints. Mangler i KNP-materialet: **client-server**, **stateless** (som REST-constraint, ikke kun som HTTP-egenskab), **cacheable**, **uniform interface**, **layered system** og **code on demand**. De står som liste med korte forklaringer i BAD (*REST principals.pdf* s. 5–10).',
        'Mangler også: ressourcebegrebet og URI-design, repræsentationer og content negotiation (JSON), mapping fra CRUD til metoder, `PATCH` (står ikke i bogen), sikre og idempotente metoder, API-statuskoder som `201`, `204`, `409` og `422` (ikke i bogen; opregnet i BAD, *REST principals.pdf* s. 9), HATEOAS og versionering af et API.',
        'Læringsmål 4 og 5 kræver, at man kan **opbygge** og **udvikle** et REST API. Materialet har ingen kode, intet framework og ingen opgave til det; nærmeste er bogens Assignment 1, en Python-webserver, der returnerer en fil eller `404 Not Found` (s. 205).',
        'Ingen slides eller journalopgaver for REST-delen.',
        UGE_GAP,
      ],
      keywords: ['REST', 'RESTful', 'REST API', 'Fielding', 'HTTP', 'GET', 'POST', 'PUT', 'DELETE', 'HEAD', 'statuskode', 'status code', 'stateless', 'tilstandsløs', 'Content-Type', 'Content-Length'],
    },

    // ─────────────────────────────────────────────────────────────── WebSocket
    {
      slug: 'websocket',
      title: 'WebSocket',
      week: 'Uge 9',
      definition:
        'Kursuskataloget lover “WebSocket-protokollen”, og læringsmål 5 er “Anvende HTTP og WebSocket samt udvikle REST API til klient/server”. Bogen nævner ikke WebSocket et eneste sted; materialet kan kun beskrive de HTTP- og TCP-egenskaber, emnet bygger på.',
      concepts: [
        {
          term: 'Hvad materialet dækker',
          body: [
            '**HTTP er klientstyret.** I bogens model sender klienten en request, og serveren svarer (figur 2.6, s. 127). Serveren kan ikke selv starte en udveksling.',
            '**Persistente forbindelser.** Med HTTP/1.1 lader serveren TCP-forbindelsen stå åben efter svaret, så flere requests og responses kan gå over samme forbindelse; serveren lukker den typisk efter en konfigurerbar timeout (s. 131).',
            '**Server push i HTTP/2.** En HTTP/2-server kan sende flere svar på én request: ud over det bedte objekt kan den skubbe de objekter, HTML-siden henviser til, før klienten beder om dem (s. 145). Det er push som svar på en sideanmodning, ikke en generel kanal, hvor serveren kan sende når som helst.',
            '**TCP-socketen er allerede tovejs.** Mellem to processer giver en TCP-forbindelse et pålideligt rør af bytes begge veje gennem samme socket (s. 190, se [[sockets-tcp|TCP-sockets]]). BAD’s slides beskriver WebSockets som en “Extension to HTTP”, der giver “raw sockets over HTTP”, full-duplex (*SignalR.pdf* s. 11) — se [[bad/signalr|SignalR (WebSocket-transport) i BAD]].',
          ],
        },
      ],
      keyPoints: [
        'Bogen har intet om WebSocket. Det nærmeste er persistente HTTP-forbindelser (s. 131) og HTTP/2 server push (s. 145).',
        'En TCP-forbindelse er i forvejen et tovejs byte-rør mellem to sockets (s. 190).',
        'Polling, long polling og WebSockets sammenlignes på slide-niveau i [[bad/signalr|SignalR i BAD]] (*SignalR.pdf* s. 6–12); HTTP-grundlaget står i [[bad/http|HTTP i BAD]].',
        'FED-materialet har intet om WebSocket eller realtid.',
      ],
      exam: [
        'HTTP er request-response: klienten spørger, og serveren svarer. Selv med persistente forbindelser og HTTP/2 server push kan serveren ikke frit sende beskeder til klienten.',
        'En TCP-forbindelse er et tovejs byte-rør; WebSocket giver ifølge BAD-materialet browseren sådan en full-duplex forbindelse over HTTP.',
        'Selve protokollen — handshake, frames og nedlukning — er ikke i KNP-materialet og skal hentes fra en anden kilde, som journalen angiver.',
      ],
      sources: [
        { path: BOG, pages: 's. 127, 131, 145, 190', note: 'Ingen slides — kun bog. “WebSocket” forekommer ikke i bogen; siderne dækker request-response, persistente forbindelser, HTTP/2 server push og TCP-røret' },
        { path: k('kursuskatalog.md'), note: 'Kursusindhold “WebSocket-protokollen”; læringsmål 5' },
        { path: 'bad/context/07-logging-signalr/signalr.md', original: 'SignalR.pdf', pages: 's. 6–12, 14', note: 'BAD-materiale, kun som peger: periodic polling, long polling, WebSockets og SignalR’s transportvalg' },
      ],
      gaps: [
        'Mangler i hele materialet (KNP, BAD og FED): **opening handshake** via HTTP (`Upgrade`-headeren og svaret `101 Switching Protocols`), URI-skemaerne `ws://` og `wss://` (BAD viser kun `new WebSocket(\'ws://127.0.0.1\')`, *SignalR.pdf* s. 11), **frames** (tekst og binær, masking, fragmentering), kontrolframes **ping/pong** og **close**, subprotokoller og sikkerhed (origin-tjek, TLS).',
        'Mangler også: hvornår WebSocket er det rigtige valg frem for periodic polling, long polling eller Server-Sent Events. BAD opregner fordele og ulemper på slide-niveau (*SignalR.pdf* s. 8, 10, 12), men uden målinger eller begrundelse på protokolniveau.',
        'Læringsmål 5 kræver, at man kan **anvende** WebSocket. Materialet har ingen kode til en WebSocket-server og ingen opgave; BAD’s eneste eksempel er fire linjer JavaScript-klient (*SignalR.pdf* s. 11).',
        'Ingen slides eller journalopgaver for WebSocket-delen.',
        UGE_GAP,
      ],
      keywords: ['WebSocket', 'WebSockets', 'ws://', 'wss://', 'full-duplex', 'realtid', 'real-time', 'push', 'server push', 'HTTP/2', 'persistent connection', 'long polling', 'polling', 'Upgrade'],
    },
  ],
}
