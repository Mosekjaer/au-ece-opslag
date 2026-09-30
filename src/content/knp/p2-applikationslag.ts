import type { Part } from '../types'
import { BOG } from './paths'

/* Kapitel 2 i Kurose & Ross (Global Edition). Ingen slides til applikationslaget;
   bogen er eneste kilde. Sidetal er bogens tryksider (PDF-side = bogside + 2). */

const UGER = 'Ugerne er vejledende efter bogens rækkefølge — der findes ingen lektionsplan for KNP i materialet.'

export const applikationslag: Part = {
  id: 'applikationslag',
  title: 'Applikationslaget',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'klient-server-p2p',
      title: 'Netværksapplikationer: klient-server, P2P og sockets',
      short: 'Klient-server og P2P',
      week: 'Uge 2',
      definition:
        'En netværksapplikation er **processer på forskellige end systems**, der udveksler beskeder gennem en **socket** — døren mellem applikationslaget og transportlaget. Arkitekturen er enten **klient-server** (en altid tændt server med fast IP-adresse) eller **peer-to-peer** (peers, der taler direkte sammen og selv bidrager med kapacitet).',
      intro: [
        'Applikationssoftware kører kun i end systems. Routere og link-layer switche arbejder på netværkslaget og nedad, så man hverken behøver eller kan skrive applikationskode til dem (s. 112). Det er grunden til, at nye applikationer kan udrulles hurtigt.',
      ],
      concepts: [
        {
          term: 'Klient-server vs. P2P',
          body: [
            'I **klient-server** betjener en altid tændt vært, serveren, anmodninger fra mange klienter. Klienterne taler ikke direkte med hinanden, og serveren har en fast, kendt IP-adresse. Eksempler: Web, FTP, Telnet og e-mail. Kan én vært ikke følge med, bruges et **data center** som en stor virtuel server; Google har 19 data centers (s. 114).',
            'I **P2P** er der minimal eller ingen afhængighed af dedikerede servere. Peers er brugernes egne maskiner, der kun er forbundet en gang imellem, og de kommunikerer direkte. Eksemplet er BitTorrent. Den vigtigste egenskab er **self-scalability**: hver peer skaber belastning ved at hente filer, men tilfører også kapacitet ved at dele dem ud. Prisen er udfordringer med sikkerhed, ydelse og pålidelighed, fordi strukturen er decentral (s. 114–115).',
          ],
        },
        {
          term: 'Processer, klient og server',
          body: [
            'Det er ikke programmer, men **processer** (kørende programmer), der kommunikerer. Processer på forskellige værter udveksler **beskeder** over netværket (s. 115–116).',
            'Bogens definition af roller: i en kommunikationssession er **klienten** den proces, der tager kontakt først, og **serveren** den, der venter på at blive kontaktet. Derfor kan en proces i P2P være begge dele: når Peer A beder Peer B om en fil, er A klient og B server i den session (s. 116).',
          ],
        },
        {
          term: 'Socket og adressering',
          body: [
            'En **socket** er grænsefladen mellem applikationslaget og transportlaget i en vært — også kaldt API’et mellem applikationen og netværket. Bogens analogi: processen er et hus, socketten er døren. Udvikleren styrer alt på applikationssiden, men på transportsiden kun (1) valget af transportprotokol og (2) evt. et par parametre som maksimal buffer- og segmentstørrelse (s. 117–118, fig. 2.3). Kode til sockets står under [[sockets-udp|UDP-sockets]] og [[sockets-tcp|TCP-sockets]].',
            'For at nå en proces skal man kende (1) værtens **IP-adresse**, en 32-bit-størrelse der entydigt identificerer værten, og (2) et **portnummer**, der identificerer den modtagende socket i værten. Webservere bruger port 80, SMTP-mailservere port 25 (s. 118). Portnumre og demultiplexing uddybes i [[udp-mux-demux|mux/demux]].',
          ],
        },
        {
          term: 'Fire krav til transporttjenesten',
          body: [
            '**Reliable data transfer**: data kommer frem korrekt og komplet. Nødvendigt for e-mail, filoverførsel og webdokumenter; **loss-tolerant** applikationer som samtale-lyd/-video kan leve med lidt tab (s. 119).',
            '**Throughput**: en garanteret rate på r bit/s. **Bandwidth-sensitive** applikationer har brug for en bestemt rate — bogens eksempel er internettelefoni, der koder tale med 32 kbps. **Elastic** applikationer (e-mail, filoverførsel, web) bruger det, der er (s. 119–120).',
            '**Timing**: fx at hver bit når frem senest 100 ms efter afsendelse — relevant for telefoni, spil og telekonferencer. **Security**: kryptering, dataintegritet og endpoint-autentificering (s. 120).',
            'Fig. 2.4 samler kravene: webdokumenter er *no loss*, *elastic (few kbps)* og ikke tidskritiske; internettelefoni er *loss-tolerant*, bruger få kbps–1 Mbps til lyd og 10 kbps–5 Mbps til video og er tidskritisk med *100s of msec*; interaktive spil kræver få kbps–10 kbps og *100s of msec* (s. 121).',
          ],
        },
        {
          term: 'Hvad TCP og UDP faktisk tilbyder',
          body: [
            '**TCP** er forbindelsesorienteret (handshake før data, derefter en full-duplex-forbindelse mellem to sockets) og giver **pålidelig, ordnet** levering af en bytestrøm uden manglende eller dublerede bytes. TCP har også congestion control, der drosler afsenderen af hensyn til nettet som helhed (s. 121–122).',
            '**UDP** er “no-frills”: forbindelsesløs, upålidelig, uden garanti for rækkefølge og uden congestion control, så afsenderen kan sende med den rate, den vil (s. 122–123).',
            'Ingen af dem krypterer. **TLS** er en udvidelse af TCP, implementeret i applikationslaget med sit eget socket-API — ikke en tredje transportprotokol (s. 122). Og ingen af dem giver garantier for **throughput eller timing**; tidsfølsomme applikationer er designet til at klare sig uden (s. 123). Fig. 2.5: SMTP, Telnet, HTTP 1.1, FTP og streaming (HTTP/DASH) kører over TCP; internettelefoni over UDP eller TCP, ofte med TCP som reserve, fordi firewalls blokerer UDP (s. 123–124).',
          ],
        },
        {
          term: 'P2P-filfordeling: distributionstid',
          body: [
            'Bogens model: en fil på F bit skal ud til N peers. Serveren uploader med `u_s`, peer i med `u_i` og downloader med `d_i`; `d_min` er den laveste download-rate. Flaskehalsen antages at ligge i access-nettene (s. 167–168).',
            'Klient-server (lign. 2.1): `D_cs = max{ NF/u_s , F/d_min }`. Serveren skal sende N kopier, så for stort N vokser tiden **lineært** med N — tusind gange flere peers giver tusind gange længere tid (s. 168).',
            'P2P (lign. 2.3): `D_P2P = max{ F/u_s , F/d_min , NF/(u_s + Σu_i) }`. Serveren skal kun sende hver bit én gang, og den samlede upload-kapacitet vokser med hver ny peer (s. 169).',
            'Fig. 2.23 sætter `F/u = 1 time`, `u_s = 10u` og `d_min ≥ u_s`. Klient-server vokser lineært uden grænse; P2P er altid lavere og under én time for alle N (s. 170).',
          ],
        },
      ],
      viz: 'knp-klient-server-p2p',
      keyPoints: [
        'Klient = den proces, der tager kontakt; server = den, der venter. Rollen gælder pr. session, også i P2P.',
        'En proces adresseres med IP-adresse + portnummer (web 80, SMTP 25).',
        'Socketten er døren mellem app og transport: udvikleren vælger kun protokol og et par parametre på transportsiden.',
        'Fire tjenestekrav: reliable data transfer, throughput, timing, security. TCP giver pålidelighed (+ TLS for sikkerhed); ingen af dem garanterer throughput eller timing.',
        'Klient-server skalerer lineært i N (`NF/u_s`); P2P er self-scaling, fordi peers også uploader.',
      ],
      exam: [
        'I klient-server-arkitekturen svarer en altid tændt server med fast IP-adresse på anmodninger fra klienter, der ikke taler sammen indbyrdes; i P2P udveksler peers data direkte og bidrager hver især med upload-kapacitet.',
        'En proces sender og modtager beskeder gennem en socket, som er grænsefladen mellem applikationslaget og transportlaget; den modtagende proces identificeres ved værtens IP-adresse og et portnummer.',
        'Applikationens krav til transporttjenesten kan beskrives langs fire akser — pålidelighed, throughput, timing og sikkerhed — og valget mellem TCP og UDP afhænger af, hvilke af dem applikationen har brug for.',
        'TCP leverer en pålidelig, ordnet bytestrøm over en forbindelse og har congestion control; UDP er forbindelsesløs og upålidelig. Ingen af dem garanterer throughput eller forsinkelse, og kryptering kræver TLS oven på TCP.',
        'Med bogens model vokser distributionstiden for klient-server lineært med antallet af peers, mens P2P-tiden er begrænset, fordi hver ny peer også øger den samlede upload-kapacitet.',
      ],
      sources: [
        { path: BOG, pages: 's. 112–125', note: 'Ingen slides — kun bog. 2.1 Principles of Network Applications (fig. 2.2–2.5)' },
        { path: BOG, pages: 's. 166–173', note: '2.5 Peer-to-Peer File Distribution: lign. 2.1–2.3, fig. 2.23, BitTorrent' },
      ],
      gaps: [
        UGER,
        'BitTorrent (s. 170–173: torrent, tracker, chunks på 256 KB, *rarest first*, tit-for-tat med fire unchoked peers hvert 10. s og én optimistically unchoked hvert 30. s) og distributed hash tables er kun nævnt her, ikke behandlet som eget emne.',
        'Kurverne i fig. 2.23 er kun tegnet i bogen, ikke tabelleret. Tallene i figuren er regnet ud fra lign. 2.1 og 2.3 med bogens parametre.',
        'Bogen skriver, at en IP-adresse er 32 bit (s. 118) — det er IPv4. IPv6 kommer i [[nat-ipv6|NAT og IPv6]].',
      ],
      keywords: ['client-server', 'peer-to-peer', 'P2P', 'process', 'socket', 'API', 'portnummer', 'port number', 'reliable data transfer', 'throughput', 'timing', 'security', 'TLS', 'elastic', 'loss-tolerant', 'distributionstid', 'self-scalability', 'BitTorrent'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'http',
      title: 'Web og HTTP',
      week: 'Uge 2',
      definition:
        '**HTTP** er Webbens applikationsprotokol: en klient sender en **request message**, serveren svarer med en **response message**, begge i ASCII over **TCP**. HTTP er **stateless** — serveren husker intet om klienten mellem anmodninger.',
      intro: [
        'En webside består af **objekter**: en base-HTML-fil plus refererede filer, hver adresseret med sin egen URL. En side med HTML-tekst og fem JPEG-billeder har altså seks objekter. URL’en `http://www.someSchool.edu/someDepartment/picture.gif` har hostname `www.someSchool.edu` og path `/someDepartment/picture.gif` (s. 126). Web-arkitekturen fra BAD står i [[bad/http|HTTP og web-arkitektur]].',
      ],
      concepts: [
        {
          term: 'HTTP over TCP og tilstandsløshed',
          body: [
            'Klienten opretter først en TCP-forbindelse til serveren og sender så requests ind i sin socket. Når beskeden er i socketten, er den “in the hands” of TCP, som leverer den intakt — HTTP skal ikke bekymre sig om tab og omrokering. Det er lagdelingens gevinst (s. 127).',
            'Serveren gemmer ingen tilstand om klienten. Beder klienten om samme objekt to gange med få sekunders mellemrum, sender serveren det igen. Derfor er HTTP en **stateless protocol** (s. 127–128). Tilstand lægges ovenpå med [[cookies-caching|cookies]].',
          ],
        },
        {
          term: 'Request message',
          body: [
            'Første linje er **request line** med tre felter: metode, URL og version (`GET /somedir/page.html HTTP/1.1`). Derefter følger **header lines**, hver afsluttet med CR LF, og en tom linje. `Host:` kræves af web-proxy-caches; `Connection: close` beder serveren lukke forbindelsen efter svaret; `User-agent:` angiver browsertypen; `Accept-language: fr` foretrækker en fransk version (s. 131–132).',
            'Efter den tomme linje kommer **entity body**. Den er tom ved `GET`, men bruges ved `POST`, fx med formulardata. En formular kan også bruge `GET` og lægge input i URL’en: `www.somesite.com/animalsearch?monkeys&bananas` (s. 132–133, fig. 2.8).',
            'Metoderne i bogen: `GET` (hent objekt), `POST` (send formulardata), `HEAD` (som GET men uden objektet, bruges til debugging), `PUT` (upload et objekt til en sti) og `DELETE` (slet et objekt) (s. 131, 133).',
          ],
        },
        {
          term: 'Response message og statuskoder',
          body: [
            '**Status line** har tre felter: version, statuskode og tekst (`HTTP/1.1 200 OK`). Bogens eksempel har seks header lines: `Connection: close`, `Date:` (hvornår svaret blev sendt, ikke hvornår objektet blev ændret), `Server:`, `Last-Modified:` (vigtig for caching), `Content-Length:` (antal bytes) og `Content-Type:` (typen afgøres af denne header, ikke af filendelsen) (s. 133–134, fig. 2.9).',
            'Statuskoderne i bogen: `200 OK`, `301 Moved Permanently` (ny URL i `Location:`, klienten henter den automatisk), `400 Bad Request`, `404 Not Found` og `505 HTTP Version Not Supported` (s. 134–135). `304 Not Modified` kommer under [[cookies-caching|conditional GET]].',
          ],
        },
        {
          term: 'Non-persistent vs. persistent: RTT-regnestykket',
          body: [
            '**RTT** er tiden for en lille pakke fra klient til server og tilbage, inkl. propagation-, queuing- og processing-forsinkelse (s. 129; se [[forsinkelse-tab-throughput|forsinkelse]]).',
            'Ved **non-persistent** forbindelser bærer hver TCP-forbindelse præcis én request og ét response. De to første dele af three-way handshake koster én RTT; requesten sendes med den tredje del (ACK), og request/response koster endnu én RTT. Svartid pr. objekt ≈ **2 RTT + transmissionstiden** for filen (s. 129–130, fig. 2.7). Bogens eksempel — base-HTML plus 10 JPEG’er — giver **11 TCP-forbindelser**, og hver forbindelse kræver buffere og variabler i både klient og server (s. 129–130). HTTP/1.0 bruger non-persistent forbindelser (s. 129).',
            'Ved **persistent** forbindelser (HTTP/1.1) lader serveren forbindelsen stå åben, så hele siden — og flere sider fra samme server — kan hentes over én forbindelse. Requests kan sendes back-to-back uden at vente på svar (**pipelining**), og serveren lukker efter en timeout. Bogen skriver, at HTTP’s standardtilstand er persistent med pipelining (s. 131).',
          ],
        },
        {
          term: 'HTTP/2 og HTTP/3',
          body: [
            'HTTP/1.1 over én TCP-forbindelse har **Head of Line (HOL) blocking**: et stort videoklip øverst på siden blokerer de små objekter bag sig. Browsere omgår det ved at åbne op til **seks parallelle TCP-forbindelser**, hvilket samtidig “snyder” TCP’s congestion control til en større andel af båndbredden (s. 144).',
            '**HTTP/2** (RFC 7540, 2015) ændrer hverken metoder, statuskoder, URL’er eller headers, kun formatet på tråden. Beskeder deles i binært kodede **frames**, som flettes på én forbindelse. Bogens tal: et videoklip på 1000 frames og 8 små objekter på to frames hver — med interleaving er de små objekter sendt efter 18 frames, uden efter 1016. Derudover prioritering (vægt 1–256) og **server push** (s. 143–145).',
            '**HTTP/3** kører over **QUIC**, en “transport”-protokol implementeret i applikationslaget oven på UDP. QUIC giver multiplexing, flow control pr. strøm og hurtig forbindelsesopsætning, så meget af HTTP/2 kan forenkles væk. I 2020 var HTTP/3 kun et Internet-draft (s. 146).',
          ],
        },
      ],
      viz: 'knp-http',
      keyPoints: [
        'Request = request line (metode, URL, version) + header lines + tom linje + evt. entity body. Response = status line + headers + tom linje + body.',
        'HTTP kører over TCP og er stateless: serveren husker intet om klienten.',
        'Non-persistent: 2 RTT + transmissionstid pr. objekt, én TCP-forbindelse pr. objekt (11 for HTML + 10 JPEG).',
        'Persistent (HTTP/1.1): én forbindelse til mange objekter; pipelining sender requests back-to-back.',
        'HTTP/2: binære frames flettet på én forbindelse mod HOL blocking. HTTP/3: over QUIC/UDP.',
      ],
      code: [
        {
          lang: 'http',
          title: 'Request message: request line og fire header lines',
          source: 'Kurose & Ross s. 131',
          code: `GET /somedir/page.html HTTP/1.1
Host: www.someschool.edu
Connection: close
User-agent: Mozilla/5.0
Accept-language: fr`,
        },
        {
          lang: 'http',
          title: 'Response message: status line, seks header lines og body',
          source: 'Kurose & Ross s. 133',
          code: `HTTP/1.1 200 OK
Connection: close
Date: Tue, 18 Aug 2015 15:44:04 GMT
Server: Apache/2.2.3 (CentOS)
Last-Modified: Tue, 18 Aug 2015 15:11:03 GMT
Content-Length: 6821
Content-Type: text/html

(data data data data data ...)`,
        },
        {
          lang: 'text',
          title: 'Send en request i hånden med Telnet (tryk Enter to gange til sidst)',
          source: 'Kurose & Ross s. 135',
          code: `telnet gaia.cs.umass.edu 80
GET /kurose_ross/interactive/index.php HTTP/1.1
Host: gaia.cs.umass.edu`,
        },
      ],
      exam: [
        'HTTP er en request-response-protokol over TCP: klienten åbner en TCP-forbindelse og sender en request med metode, URL og version efterfulgt af header lines; serveren svarer med en status line, header lines og objektet i entity body.',
        'HTTP er tilstandsløs, fordi serveren ikke gemmer information om klienten mellem anmodninger; det forenkler serveren, og tilstand må lægges ovenpå, fx med cookies.',
        'Med non-persistent forbindelser koster hvert objekt cirka to RTT plus transmissionstiden — én RTT til TCP-opsætningen og én til request/response — og kræver sin egen forbindelse. Persistente forbindelser genbruger forbindelsen og sparer opsætningen.',
        'HTTP/2 bevarer HTTP’s semantik men deler beskeder i frames, der flettes på én forbindelse, så et stort objekt ikke blokerer små; HTTP/3 kører samme idé over QUIC på UDP.',
      ],
      sources: [
        { path: BOG, pages: 's. 125–135', note: 'Ingen slides — kun bog. 2.2.1–2.2.3: HTTP-oversigt, (non-)persistent, beskedformat (fig. 2.7–2.9)' },
        { path: BOG, pages: 's. 143–146', note: '2.2.6 HTTP/2, framing, prioritering, server push, HTTP/3' },
      ],
      gaps: [
        UGER,
        'Bogen regner kun RTT for ét objekt (2 RTT + transmissionstid) og henviser den kvantitative sammenligning af persistent og non-persistent til hjemmeopgaverne (s. 131). Figurens sammenligning med to objekter er afledt af s. 130–131.',
        'Bogen skriver, at HTTP/1.1’s standard er persistent **med pipelining** (s. 131). *Uden for materialet:* browsere har i praksis slået pipelining fra, hvilket er en del af baggrunden for HTTP/2.',
        'HTTP/3 beskrives som “not yet fully standardized” (2020, s. 146). *Uden for materialet:* HTTP/3 er siden standardiseret (RFC 9114, 2022).',
        'Metoderne `PATCH` og statuskoder som `201`, `401`, `403` og `500` nævnes ikke i kap. 2; de kommer fra BAD ([[bad/http|HTTP og web-arkitektur]]).',
        'E-mail (2.3: SMTP på port 25, mailservere og IMAP/HTTP som adgangsprotokoller, s. 146–152) er ikke et eget emne, men SMTP bruger ligesom HTTP persistente TCP-forbindelser og ASCII-kommandoer (s. 150).',
      ],
      keywords: ['HTTP', 'request line', 'status line', 'header line', 'entity body', 'GET', 'POST', 'HEAD', 'PUT', 'DELETE', 'RTT', 'persistent', 'non-persistent', 'pipelining', 'HOL blocking', 'HTTP/2', 'HTTP/3', 'QUIC', 'stateless', 'statuskode'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'cookies-caching',
      title: 'Cookies, web caching og conditional GET',
      short: 'Cookies og caching',
      week: 'Uge 2',
      definition:
        '**Cookies** lægger en brugersession oven på den tilstandsløse HTTP via fire komponenter: `Set-cookie:` i svaret, `Cookie:` i anmodningen, en cookie-fil hos browseren og en database hos serveren. En **web cache** (proxy server) besvarer anmodninger på vegne af origin-serveren, og **conditional GET** (`If-Modified-Since:` → `304 Not Modified`) holder dens kopier friske uden at sende objektet igen.',
      concepts: [
        {
          term: 'Cookies: de fire komponenter',
          body: [
            'Cookies (RFC 6265) har fire dele: (1) en cookie-header line i HTTP-**response**, (2) en cookie-header line i HTTP-**request**, (3) en **cookie-fil** hos brugeren, som browseren styrer, og (4) en **back-end database** hos websitet (s. 136, fig. 2.10).',
            'Bogens eksempel: Susan besøger Amazon første gang. Serveren laver ID 1678, opretter en post i sin database og svarer med `Set-cookie: 1678`. Browseren tilføjer en linje med hostname og ID i cookie-filen, som i forvejen har en linje for eBay (`ebay: 8734`). Hver efterfølgende request til Amazon bærer `Cookie: 1678`, også når hun vender tilbage en uge senere (s. 136–137).',
            'Serveren kender ikke nødvendigvis hendes navn, men ved præcis hvilke sider bruger 1678 har set, i hvilken rækkefølge og hvornår. Det bruges til indkøbskurv, anbefalinger og “one-click shopping” — og det er grunden til, at cookies er kontroversielle af hensyn til privatliv (s. 137–138).',
          ],
        },
        {
          term: 'Web cache / proxy server',
          body: [
            'En web cache har sin egen disk med kopier af nyligt hentede objekter. Browseren konfigureres til at sende alle requests til cachen. Har cachen objektet (hit), svarer den selv; ellers (miss) åbner den en TCP-forbindelse til origin-serveren, henter objektet, gemmer en kopi og sender det videre (s. 138–139, fig. 2.11).',
            'Cachen er **både server og klient**: server over for browseren, klient over for origin-serveren. Den installeres typisk af en ISP eller et universitet (s. 139). Den `Host:`-header, der ellers ser overflødig ud, er netop det cachen skal bruge (s. 132).',
          ],
        },
        {
          term: 'Regnestykket: hvorfor en cache hjælper',
          body: [
            'Bogens institutionsnet: 100 Mbps LAN, **15 Mbps** access link, objekter på 1 Mbit, 15 requests/s, og 2 s “Internet delay” (s. 139–140, fig. 2.12). Trafikintensiteten på LAN’et er 15 · 1/100 = **0,15**, men på access-linket 15 · 1/15 = **1** — forsinkelsen vokser uden grænse, og svartiden bliver minutter (s. 140).',
            'Løsning 1: opgradér til 100 Mbps. Intensiteten falder til 0,15, og svartiden bliver ca. 2 s — men det er dyrt (s. 141).',
            'Løsning 2: en cache med **hit rate 0,4** (typisk 0,2–0,7). Kun 60 % går over linket, så intensiteten falder fra 1,0 til 0,6, og forsinkelsen der er ubetydelig. Gennemsnitlig svartid: `0,4 · 0,01 s + 0,6 · 2,01 s` ≈ **1,2 s** — lavere end ved opgraderingen og billigere (s. 141–142, fig. 2.13).',
            'CDN’er (Akamai, Limelight, Google, Netflix) er geografisk spredte caches i stor skala; de behandles i 2.6 (s. 142).',
          ],
        },
        {
          term: 'Conditional GET og 304',
          body: [
            'En cachet kopi kan være forældet. En request er en **conditional GET**, hvis den (1) bruger `GET` og (2) har en `If-Modified-Since:`-header (RFC 7232) (s. 142).',
            'Bogens forløb med `/fruit/kiwi.gif` fra `www.exotiquecuisine.com`: cachen henter objektet og får `200 OK` med `Last-Modified: Wed, 9 Sep 2015 09:23:24`, som den gemmer sammen med objektet. En uge senere spørger en anden browser; cachen sender en conditional GET med `If-modified-since:` sat **præcis** til den gemte `Last-Modified`-værdi. Er objektet uændret, svarer serveren `304 Not Modified` med tom body, og cachen sender sin egen kopi videre (s. 142–143).',
          ],
        },
      ],
      viz: 'knp-cookies-caching',
      keyPoints: [
        'Cookies = `Set-cookie:` i svar + `Cookie:` i anmodning + cookie-fil i browseren + database hos serveren.',
        'Cookies giver et sessionslag oven på stateless HTTP — og et privatlivsproblem.',
        'En proxy-cache er server for browseren og klient for origin-serveren.',
        'Bogens eksempel: hit rate 0,4 sænker access-linkets intensitet fra 1,0 til 0,6 og svartiden til ca. 1,2 s — bedre end at opgradere linket.',
        'Conditional GET: `If-Modified-Since:` = gemt `Last-Modified:`; `304 Not Modified` har tom body.',
      ],
      code: [
        {
          lang: 'http',
          title: 'Cookie-headerne i bogens eksempel: først i svaret, derefter i hver anmodning',
          source: 'Kurose & Ross s. 137',
          code: `Set-cookie: 1678

Cookie: 1678`,
        },
        {
          lang: 'http',
          title: 'Første hentning: cachen gemmer objektet og Last-Modified',
          source: 'Kurose & Ross s. 142',
          code: `GET /fruit/kiwi.gif HTTP/1.1
Host: www.exotiquecuisine.com

HTTP/1.1 200 OK
Date: Sat, 3 Oct 2015 15:39:29
Server: Apache/1.3.0 (Unix)
Last-Modified: Wed, 9 Sep 2015 09:23:24
Content-Type: image/gif
(data data data data data ...)`,
        },
        {
          lang: 'http',
          title: 'En uge senere: conditional GET og 304 uden body',
          source: 'Kurose & Ross s. 143',
          code: `GET /fruit/kiwi.gif HTTP/1.1
Host: www.exotiquecuisine.com
If-modified-since: Wed, 9 Sep 2015 09:23:24

HTTP/1.1 304 Not Modified
Date: Sat, 10 Oct 2015 15:39:29
Server: Apache/1.3.0 (Unix)
(empty entity body)`,
        },
      ],
      exam: [
        'Cookies giver tilstand oven på den tilstandsløse HTTP: serveren tildeler et ID i en Set-cookie-header, browseren gemmer det i sin cookie-fil og sender det i en Cookie-header ved hver anmodning, og serveren slår ID’et op i sin database.',
        'En web cache besvarer anmodninger på vegne af origin-serveren; den er server over for browseren og klient over for origin-serveren, og ved et miss henter den objektet og gemmer en kopi.',
        'I bogens eksempel sænker en cache med hit rate 0,4 trafikintensiteten på access-linket fra 1 til 0,6 og den gennemsnitlige svartid til ca. 1,2 sekunder, hvilket er bedre og billigere end at opgradere linket.',
        'Med conditional GET spørger cachen med If-Modified-Since sat til den gemte Last-Modified; er objektet uændret, svarer serveren 304 Not Modified uden body, så båndbredde og svartid spares.',
      ],
      sources: [
        { path: BOG, pages: 's. 135–138', note: 'Ingen slides — kun bog. 2.2.4 Cookies (fig. 2.10)' },
        { path: BOG, pages: 's. 138–143', note: '2.2.5 Web Caching, regnestykket (fig. 2.11–2.13) og conditional GET' },
      ],
      gaps: [
        UGER,
        'Figuren viser conditional GET gennem en proxy-cache. Cookie-forløbet (fig. 2.10) står kun i teksten ovenfor.',
        'Bogens cookie-eksempel bruger den forenklede form `Set-cookie: 1678` uden navn=værdi, domæne eller udløb. Cookie-attributter (`Expires`, `HttpOnly`, `Secure` m.fl.) og browserens egen cache (`Cache-Control`, `ETag`) er ikke i kap. 2 — se [[bad/caching|Caching]] i BAD for HTTP-caching set fra serveren.',
        'Datoerne i bogens conditional-GET-eksempel mangler tidszone (fx `Last-Modified: Wed, 9 Sep 2015 09:23:24`), mens responseeksemplet på s. 133 har `GMT`. Koden her gengiver bogen ordret.',
        'CDN’er og video streaming (2.6: DASH, enter-deep/bring-home, DNS-omdirigering via fx KingCDN, s. 173–182) er ikke et eget emne.',
      ],
      keywords: ['cookie', 'Set-cookie', 'Cookie header', 'web cache', 'proxy server', 'origin server', 'hit rate', 'traffic intensity', 'conditional GET', 'If-Modified-Since', 'Last-Modified', '304 Not Modified', 'CDN'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'dns',
      title: 'DNS — internettets navnetjeneste',
      short: 'DNS',
      week: 'Uge 2',
      definition:
        '**DNS** oversætter hostnames til IP-adresser. Det er (1) en **distribueret, hierarkisk database** fordelt på root-, TLD- og autoritative DNS-servere og (2) en applikationsprotokol over **UDP port 53**, som værter bruger til at spørge databasen.',
      intro: [
        'Mennesker foretrækker hostnames som `www.facebook.com`; routere foretrækker IP-adresser med fast længde og hierarkisk struktur som `121.7.106.83` (s. 153). DNS er en kernefunktion i internettet, men implementeret i applikationslaget med klienter og servere i kanten af nettet (s. 155).',
      ],
      concepts: [
        {
          term: 'Tjenester',
          body: [
            '**Hostname → IP-adresse.** Browseren trækker hostname ud af URL’en, giver det til DNS-klienten på samme maskine, som spørger en DNS-server og får IP-adressen, hvorefter browseren kan åbne TCP til port 80. Det lægger en forsinkelse oven i, som caching mindsker (s. 153–154).',
            '**Host aliasing**: `relay1.west-coast.enterprise.com` er det **kanoniske** navn med aliasser som `enterprise.com` og `www.enterprise.com`. **Mail server aliasing**: `bob@yahoo.com` selv om mailserveren hedder noget længere; via MX-posten kan web- og mailserver dele navnet `enterprise.com` (s. 154).',
            '**Load distribution**: replikerede servere (fx `cnn.com`) har hver sin IP-adresse. DNS svarer med hele sættet, men **roterer rækkefølgen**, og da klienten typisk bruger den første adresse, fordeles trafikken (s. 154–155).',
          ],
        },
        {
          term: 'Hierarkiet: root, TLD, autoritativ — og den lokale server',
          body: [
            'En central DNS-server ville ikke skalere: single point of failure, trafikmængde, fjern database og vedligehold (s. 156). DNS er derfor distribueret i tre klasser (fig. 2.17):',
            '**Root DNS servers**: over 1000 instanser, kopier af **13** root-servere drevet af 12 organisationer og koordineret af IANA. De giver IP-adresser på TLD-servere. **TLD-servere** for `com`, `org`, `net`, `edu`, `gov` og landedomæner som `uk`, `fr`, `ca`, `jp` (Verisign driver `com`, Educause `edu`) giver adressen på autoritative servere. **Autoritative DNS-servere** holder organisationens egne poster for offentligt tilgængelige værter (s. 157–158).',
            'Den **lokale DNS-server** (default name server) hører strengt taget ikke til hierarkiet, men er central: hver ISP har en, værten får dens adresse via DHCP, og den virker som proxy, der sender forespørgslen videre ind i hierarkiet (s. 158).',
          ],
        },
        {
          term: 'Iterative og rekursive opslag',
          body: [
            'Bogens eksempel (fig. 2.19): `cse.nyu.edu` vil have IP-adressen på `gaia.cs.umass.edu`. Værten spørger sin lokale server `dns.nyu.edu`; den spørger en root-server, der ser suffikset `edu` og svarer med TLD-servere for `edu`; TLD-serveren ser `umass.edu` og svarer med den autoritative `dns.umass.edu`; den svarer med IP-adressen på `gaia.cs.umass.edu`. I alt **8 beskeder**: fire queries og fire replies (s. 158–159).',
            'Første query (vært → lokal server) er **rekursiv**: den beder den lokale server skaffe svaret. De tre næste er **iterative**: svarene kommer direkte tilbage til `dns.nyu.edu`, som selv spørger videre. Sådan ser det typisk ud i praksis; fig. 2.20 viser en kæde, hvor alle queries er rekursive (s. 160–161).',
            'Kender TLD-serveren kun en mellemliggende server — fx `dns.umass.edu`, som peger videre til afdelingens autoritative `dns.cs.umass.edu` — bliver det **10 beskeder** (s. 159–160).',
          ],
        },
        {
          term: 'DNS caching',
          body: [
            'Når en DNS-server modtager et svar, kan den cache mappingen og besvare næste forespørgsel på samme navn, selv om den ikke er autoritativ. Cachede poster slettes efter en periode, ofte **to dage** (s. 160).',
            'Eksempel: `apricot.nyu.edu` slår `cnn.com` op; få timer senere spørger `kiwi.nyu.edu` om det samme, og `dns.nyu.edu` svarer straks. Den lokale server cacher også TLD-servernes adresser, så **root-serverne springes over** for alle undtagen en lille del af forespørgslerne (s. 160–161).',
          ],
        },
        {
          term: 'Resource records og beskedformat',
          body: [
            'En **resource record** er fire-tuplen `(Name, Value, Type, TTL)`; TTL afgør, hvornår posten fjernes fra en cache. Typerne: **A** (hostname → IP, fx `(relay1.bar.foo.com, 145.37.93.126, A)`), **NS** (domæne → hostname på autoritativ server, `(foo.com, dns.foo.com, NS)`), **CNAME** (alias → kanonisk navn, `(foo.com, relay1.bar.foo.com, CNAME)`) og **MX** (alias → kanonisk navn på mailserver, `(foo.com, mail.bar.foo.com, MX)`) (s. 162).',
            'En server, der ikke er autoritativ for et navn, har en NS-post for domænet plus en A-post for den DNS-server, NS-posten peger på — fx har `edu`-TLD-serveren `(umass.edu, dns.umass.edu, NS)` og `(dns.umass.edu, 128.119.40.111, A)` (s. 162).',
            'Query og reply har samme format (fig. 2.21): en header på **12 bytes** med et 16-bit **identification**-felt (kopieres til svaret, så klienten kan parre dem), flag for query/reply, authoritative, recursion-desired og recursion-available, og fire antal-felter. Derefter sektionerne **question** (navn og type), **answer**, **authority** og **additional** — fx står A-posten til mailserverens kanoniske navn i additional ved en MX-query (s. 163–164). `nslookup` sender queries i hånden (s. 164).',
            'Nye poster kommer ind via en **registrar**, akkrediteret af ICANN, som lægger NS- og A-poster for domænets autoritative servere ind i TLD-serverne (s. 164–166).',
          ],
        },
      ],
      viz: 'knp-dns',
      keyPoints: [
        'DNS = distribueret, hierarkisk database + applikationsprotokol over UDP port 53.',
        'Root → TLD → autoritativ; den lokale DNS-server er proxy for værten.',
        'Vært → lokal er rekursiv; lokal → root/TLD/autoritativ er iterative. Bogens eksempel: 8 beskeder.',
        'Caching (typisk op til to dage) gør, at root-serverne sjældent spørges.',
        'RR = (Name, Value, Type, TTL). A, NS, CNAME, MX. Header på 12 bytes med ID og flag.',
        'Tjenester: navneoversættelse, host- og mailserver-aliasing, load distribution ved rotation.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Resource records i bogens eksempler (TTL udeladt)',
          source: 'Kurose & Ross s. 162',
          code: `(relay1.bar.foo.com, 145.37.93.126, A)
(foo.com, dns.foo.com, NS)
(foo.com, relay1.bar.foo.com, CNAME)
(foo.com, mail.bar.foo.com, MX)

(umass.edu, dns.umass.edu, NS)
(dns.umass.edu, 128.119.40.111, A)`,
        },
        {
          lang: 'text',
          title: 'Registrarens poster i com-TLD-serverne for et nyt domæne',
          source: 'Kurose & Ross s. 166',
          code: `(networkutopia.com, dns1.networkutopia.com, NS)
(dns1.networkutopia.com, 212.212.212.1, A)`,
        },
      ],
      exam: [
        'DNS oversætter hostnames til IP-adresser og er både en distribueret, hierarkisk database og en applikationsprotokol, der kører over UDP på port 53.',
        'Hierarkiet består af root-servere, der peger på TLD-servere, TLD-servere, der peger på autoritative servere, og autoritative servere, der har organisationens egne poster; værten spørger altid sin lokale DNS-server, der fungerer som proxy.',
        'I det typiske opslag er forespørgslen fra værten til den lokale server rekursiv, mens den lokale server spørger root, TLD og den autoritative server iterativt; i bogens eksempel koster det otte beskeder.',
        'DNS-servere cacher de svar, de får, inklusive TLD-servernes adresser, så de fleste opslag slet ikke når root-serverne; TTL afgør, hvornår en post fjernes fra cachen.',
        'Svarene består af resource records (Name, Value, Type, TTL): A giver en IP-adresse, NS navnet på en autoritativ server, CNAME det kanoniske navn for et alias og MX mailserveren for et domæne.',
      ],
      sources: [
        { path: BOG, pages: 's. 152–161', note: 'Ingen slides — kun bog. 2.4.1–2.4.2: tjenester, hierarki, fig. 2.17–2.20, caching' },
        { path: BOG, pages: 's. 161–166', note: '2.4.3 Records og beskeder (fig. 2.21), registrering, Focus on Security' },
      ],
      gaps: [
        UGER,
        '**AAAA**-poster (IPv6-adresser) nævnes ikke i bogen — hverken i kap. 2 eller i IPv6-afsnittet. Kun A, NS, CNAME og MX er beskrevet (s. 162).',
        'Bogen skriver, at DNS kører over UDP port 53 (s. 153, 156), og nævner ikke TCP. *Uden for materialet:* DNS bruger også TCP, fx til store svar og zoneoverførsler.',
        'Bogen er uenig med sig selv om IP-adressen på `dns1.networkutopia.com`: teksten skriver `212.2.212.1` (s. 164), mens A-posten og det videre eksempel bruger `212.212.212.1` (s. 166).',
        'Bogen giver ikke IP-adressen på `gaia.cs.umass.edu` i fig. 2.19; figuren skriver derfor kun “IP-adressen”.',
        'Sikkerhed (s. 165): DDoS mod root-serverne i 2002 og mod DNS-udbyderen Dyn i 2016 (Mirai-botnet med ca. 100.000 IoT-enheder), man-in-the-middle, DNS poisoning og DNSSEC — kun nævnt her.',
      ],
      keywords: ['DNS', 'Domain Name System', 'hostname', 'root server', 'TLD', 'top-level domain', 'authoritative', 'local DNS server', 'resolver', 'iterativ', 'rekursiv', 'iterative query', 'recursive query', 'DNS caching', 'TTL', 'resource record', 'A record', 'NS', 'CNAME', 'MX', 'AAAA', 'UDP 53', 'nslookup', 'registrar', 'load distribution'],
    },
  ],
}
