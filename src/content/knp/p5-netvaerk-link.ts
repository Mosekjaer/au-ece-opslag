import type { Part } from '../types'
import { BOG, k } from './paths'

/* Kap. 4–6 i Kurose & Ross (Global Edition). Sidetal er bogens tryksider;
   i kap. 4, 5 og 6 er PDF-side = trykside + 2 (samme som kap. 1). */

const UGER = 'Ugerne er vejledende efter bogens rækkefølge — der findes ingen lektionsplan for KNP ud over lektion 1.'

export const netvaerkLink: Part = {
  id: 'netvaerk-link',
  title: 'Netværkslag og linklag',
  topics: [
    // ------------------------------------------------------------------ 4.1–4.3.2
    {
      slug: 'ipv4-forwarding',
      title: 'Forwarding, routere og IPv4-adressering',
      short: 'IPv4 og forwarding',
      week: 'Uge 6',
      definition:
        'Netværkslaget flytter **datagrammer** fra afsender-host til modtager-host. Det deles i et **data plane**, hvor hver router lokalt *forwarder* et ankommet datagram fra et input-link til det rigtige output-link, og et **control plane**, der netværksbredt bestemmer ruterne (*routing*) og dermed indholdet af routernes forwarding-tabeller. IPv4-adresser er 32 bit, hører til et interface og skrives `a.b.c.d/x`, hvor de x første bit er netværkets præfiks.',
      intro: [
        'Transportlaget (se [[tcp-forbindelse|TCP]] og [[udp-mux-demux|UDP]]) taler proces-til-proces og stoler på, at netværkslaget leverer host-til-host. I modsætning til transport- og applikationslaget kører netværkslaget i *hver* host og *hver* router (s. 333). I [[lagdeling-indkapsling|indkapslingen]] lægger H1 transportsegmentet i et datagram og sender det til sin nærmeste router; routere har en afkortet stak uden transport- og applikationslag (s. 334).',
      ],
      concepts: [
        {
          term: 'Forwarding vs. routing — data plane vs. control plane',
          body: [
            '**Forwarding** er routerens lokale handling: et pakkehoved slås op i forwarding-tabellen, og pakken flyttes til det output-interface, tabellen peger på. Det sker på nanosekunder og derfor i hardware. **Routing** er den netværksbrede proces, der finder end-to-end-stien; den tager sekunder og ligger typisk i software (s. 336). Bogens billede: forwarding er at køre gennem ét motorvejskryds, routing er at planlægge hele turen fra Pennsylvania til Florida.',
            'Fig. 4.2 (s. 337) viser en lokal tabel med header-værdierne `0100`, `0110`, `0111`, `1001` → output `3`, `2`, `2`, `1`; en pakke med `0110` sendes ud på interface 2. Traditionelt kører routing-algoritmen i hver router og udveksler routing-beskeder med de andre routere. Ved **SDN** beregner en fjern *controller* i stedet tabellerne og sender dem ud; data plane er det samme (s. 338–339).',
            'Lektion 1-slidet “Two key network-core functions” bruger samme opdeling og næsten samme tabel, men med `0101` i stedet for `0110` og en pakke med header `0111` → link 2 (slide 18).',
          ],
        },
        {
          term: 'Best effort og routerens opbygning',
          body: [
            'Internettets netværkslag giver én service: **best effort** — ingen garanti for levering, rækkefølge, forsinkelse eller båndbredde (s. 340). Pålidelighed må derfor komme fra transportlaget.',
            'En router har **input ports**, et **switching fabric**, **output ports** og en **routing processor** (fig. 4.4, s. 341–342). Input-porten afslutter det fysiske link, kører linklaget og laver **lookup** i en skyggekopi af forwarding-tabellen, så routing-processoren ikke skal involveres pr. pakke (s. 344). Med et 100 Gbps-link og 64-byte datagrammer har porten kun 5,12 ns pr. datagram (s. 342).',
            'Fabric kan switche via **memory** (throughput under B/2), via en **bus** (én pakke ad gangen) eller via et **interconnection network** som en crossbar, der kan flytte flere pakker parallelt, så længe de skal til forskellige output-porte (s. 347–348).',
          ],
        },
        {
          term: 'Køer, buffere og tab',
          body: [
            'Køer kan opstå ved både input og output. Det er her, pakker reelt tabes, når bufferen er fuld (s. 349) — samme tab som i [[forsinkelse-tab-throughput|forsinkelse og tab]]. Er fabric N gange hurtigere end linkene, er køen ved input ubetydelig (s. 350).',
            'Ved input-kø kan **head-of-the-line (HOL) blocking** opstå: en pakke venter, selvom dens output er ledig, fordi pakken foran i køen er blokeret. Ifølge bogen kan input-køen vokse ubegrænset allerede ved 58 % belastning (s. 350). Ved fuld output-buffer droppes enten den nye pakke (**drop-tail**) eller en i køen; AQM-politikker som RED kan droppe eller markere før bufferen er fuld (s. 352). En **packet scheduler** vælger rækkefølgen: FIFO, prioritet, round robin eller WFQ (s. 355–360).',
          ],
        },
        {
          term: 'IPv4-datagrammet',
          body: [
            'Headeren er typisk **20 byte** uden options (fig. 4.17, s. 361–363): *version* (4 bit), *header length* (4 bit), *type of service* (to bit bruges til ECN), *datagram length* (16 bit, maks. 65.535 byte, sjældent over 1.500), *identifier/flags/fragmentation offset*, **TTL** (tælles ned med én pr. router; ved 0 droppes datagrammet), *protocol* (6 = TCP, 17 = UDP), *header checksum* (kun over headeren, genberegnes i hver router fordi TTL ændres), 32-bit *source* og *destination address*, *options* og *data*.',
            'Protocol-feltet er limen mellem netværks- og transportlag, ligesom portnummeret er limen mellem transport- og applikationslag (s. 362). Med TCP bærer hvert datagram 40 byte header: 20 IP + 20 TCP (s. 363).',
            '**Fragmentering** — at et stort datagram deles i mindre, der samles hos modtageren — nævnes kun: bogen dækker det ikke og henviser til “retired” materiale på nettet (s. 362).',
          ],
        },
        {
          term: 'Subnets og CIDR',
          body: [
            'En IP-adresse hører til et **interface**, ikke til en host; en router med tre links har tre adresser (s. 364). Adresser skrives *dotted-decimal*: `193.32.216.9` = `11000001 00100000 11011000 00001001`.',
            'Et **subnet** er de interfaces, man kan nå uden at passere en router. Opskriften: tag hvert interface af sin host eller router; de isolerede øer, der bliver tilbage, er subnettene (s. 365–366). I fig. 4.18 har tre hosts og ét router-interface adresser `223.1.1.xxx`, og subnettet er `223.1.1.0/24`. Fig. 4.20 har tre routere og seks subnets, fordi også de tre punkt-til-punkt-links er subnets.',
            '**CIDR** (Classless Interdomain Routing) generaliserer det: `a.b.c.d/x`, hvor de x mest betydende bit er **præfikset** (s. 366). Før CIDR skulle præfikset være 8, 16 eller 24 bit (klasse A, B, C); en organisation med 2.000 hosts fik et /16 med plads til 65.534 interfaces og spildte over 63.000 adresser (s. 367–368). `255.255.255.255` er broadcast-adressen til alle hosts på subnettet (s. 370).',
            '**Address aggregation**: Fly-By-Night-ISP får `200.23.16.0/20` og deler den i otte /23-blokke til organisation 0–7 (`200.23.16.0/23`, `200.23.18.0/23`, … `200.23.30.0/23`), men annoncerer kun `/20` udadtil (s. 368–370). Flytter organisation 1 til ISPs-R-Us, annoncerer ISPs-R-Us også `200.23.18.0/23`, og routere vælger den efter **longest prefix match** (s. 368).',
          ],
        },
        {
          term: 'Longest prefix match',
          body: [
            'En tabel med en række pr. mulig adresse ville have over 4 mia. rækker. I stedet gemmer routeren **præfikser** (s. 344–345). Bogens eksempel: `11001000 00010111 00010` → link 0, `11001000 00010111 00011000` → link 1, `11001000 00010111 00011` → link 2, ellers → link 3.',
            'Adressen `11001000 00010111 00010110 10100001` matcher kun første række (21 bit) og går ud på link 0. Adressen `11001000 00010111 00011000 10101010` matcher både række 2 (24 bit) og række 3 (21 bit); routeren vælger den **længste** match og sender på link 1 (s. 345). Opslaget skal ske på nanosekunder, så det laves i hardware, ofte i **TCAM** (s. 346).',
          ],
        },
        {
          term: 'DHCP',
          body: [
            'Routeres adresser konfigureres typisk manuelt, hosts får dem normalt fra **DHCP** — en *plug-and-play*-klient-server-protokol, der også giver subnetmaske, **default gateway** (første router) og lokal [[dns|DNS-server]] (s. 371).',
            'Fire trin (fig. 4.24, s. 372–374): **discover** (UDP til port 67, fra `0.0.0.0` til `255.255.255.255`, transaction ID 654), **offer** (server `223.1.2.5` foreslår `yiaddr 223.1.2.4`, lifetime 3600 s — også broadcast), **request** (klienten gentager parametrene, ID 655) og **ACK**. Ulempen: skifter en mobil node subnet, får den ny adresse og kan ikke beholde en TCP-forbindelse (s. 374).',
          ],
        },
      ],
      viz: 'knp-ipv4-forwarding',
      keyPoints: [
        'Forwarding = lokalt opslag i nanosekunder (hardware). Routing = netværksbred beregning af stier på sekunder (software eller SDN-controller).',
        'Internettets netværkslag er best effort: ingen garanti for levering, rækkefølge eller forsinkelse.',
        'IPv4-header: 20 byte. TTL tælles ned pr. router; protocol-feltet (6 = TCP, 17 = UDP) fortæller, hvem payloaden skal til.',
        'Et subnet er de interfaces, der kan nås uden en router. CIDR-notation `a.b.c.d/x`: de x første bit er præfikset.',
        'Matcher en adresse flere rækker i forwarding-tabellen, vinder det **længste** præfiks.',
        'DHCP giver en host adresse, maske, gateway og DNS-server i fire trin: discover, offer, request, ACK.',
      ],
      exam: [
        'Netværkslaget består af et data plane, hvor hver router forwarder datagrammer efter sin forwarding-tabel, og et control plane, der beregner tabellerne via routing-algoritmer — enten i hver router eller i en SDN-controller.',
        'En IPv4-adresse er 32 bit og tilhører et interface. Med CIDR skrives den `a.b.c.d/x`, og de x første bit angiver netværket, så en router uden for organisationen kun behøver én række pr. præfiks.',
        'Når en destinationsadresse matcher flere præfikser, bruger routeren longest prefix match og vælger den mest specifikke række.',
        'TTL-feltet forhindrer datagrammer i at cirkulere for evigt: hver router tæller det ned, og ved 0 droppes datagrammet.',
        'En host får typisk sin adresse via DHCP, der også oplyser subnetmaske, default gateway og DNS-server.',
      ],
      sources: [
        { path: BOG, pages: 's. 333–349', note: 'Ingen slides til kap. 4 — kun bog. 4.1 forwarding/routing, SDN, best effort; 4.2 routerens opbygning og longest prefix match (s. 344–346).' },
        { path: BOG, pages: 's. 349–360', note: '4.2.4–4.2.5: køer, HOL blocking, drop-tail/AQM, scheduling.' },
        { path: BOG, pages: 's. 360–374', note: '4.3.1 IPv4-datagramformat, 4.3.2 adressering, CIDR, aggregation og DHCP.' },
        {
          path: k('context/slides/E3KNP-01_Lecture01_Computer_Networks_Internet_Part1.md'),
          original: 'data/slides/Chapter_1_(Computer Networks and the Internet - part 1).pdf',
          pages: 'slide 18',
          note: 'Routing vs. forwarding med en lokal forwarding-tabel (lektion 1).',
        },
      ],
      gaps: [
        'Fragmentering er ikke i bogen: s. 362 skriver, at den ikke behandles, og henviser til “retired” materiale online. Alligevel skriver s. 516 om Ethernet, at et datagram over 1.500 byte må fragmenteres “as discussed in Section 4.3.2”. Hvordan identifier/flags/offset bruges, står altså ingen steder i materialet.',
        'Lektion 1-slidet (slide 18) og bogens fig. 4.2 (s. 337) bruger næsten samme forwarding-tabel, men slidet har `0101` hvor bogen har `0110`, og slidets eksempelpakke er `0111` i stedet for `0110`. Begge ender på link 2.',
        'Tabellen i longest prefix match-eksemplet (s. 345) står kun i binær. Dotted-decimal-formerne i figuren (fx `200.23.22.161`) er omregnet her, ikke hentet fra bogen.',
        'Generalized forwarding og OpenFlow (4.4, s. 383–390) er ikke taget med her — kun nævnt under [[switche|switche]].',
        UGER,
      ],
      keywords: ['data plane', 'control plane', 'forwarding table', 'routing', 'SDN', 'best effort', 'input port', 'switching fabric', 'HOL blocking', 'drop-tail', 'IPv4', 'TTL', 'datagram', 'subnet', 'CIDR', 'prefix', 'longest prefix match', 'TCAM', 'DHCP', 'default gateway', 'broadcast'],
    },

    // ------------------------------------------------------------------ 4.3.3–4.3.4
    {
      slug: 'nat-ipv6',
      title: 'NAT, ICMP og IPv6',
      short: 'NAT og IPv6',
      week: 'Uge 6',
      definition:
        '**NAT** (network address translation) lader et privat net, fx `10.0.0.0/24`, gemme sig bag én offentlig adresse: NAT-routeren omskriver kilde-IP og kildeport på udgående datagrammer og bruger en **NAT translation table** til at sende svarene tilbage til den rigtige host. **IPv6** er efterfølgeren til IPv4 med 128-bit adresser og en fast 40-byte header.',
      concepts: [
        {
          term: 'Private adresser og NAT-routeren',
          body: [
            '`10.0.0.0/8` er en af tre blokke, RFC 1918 reserverer til private net. Hundredtusinder af hjemmenet bruger den samme `10.0.0.0/24`, så adresserne har kun mening inde i nettet og kan ikke bruges ude på internettet (s. 374–375).',
            'Udadtil ligner NAT-routeren **én enhed med én IP-adresse**: i fig. 4.25 forlader al trafik hjemmet med kildeadresse `138.76.29.7`, og al trafik ind skal have den som destination. Routeren får ofte sin WAN-adresse fra ISP’ens DHCP-server og kører selv en DHCP-server for hjemmenettet (s. 375).',
          ],
        },
        {
          term: 'NAT translation table',
          body: [
            'Bogens eksempel (s. 376): host `10.0.0.1` sender en [[http|HTTP]]-anmodning til en webserver `128.119.40.186` på port 80 og vælger kildeport `3345`. NAT-routeren vælger en ny kildeport `5001`, der ikke allerede står i tabellen, erstatter kilden med `138.76.29.7, 5001` og tilføjer rækken *WAN side* `138.76.29.7, 5001` ↔ *LAN side* `10.0.0.1, 3345`.',
            'Serveren svarer til `138.76.29.7, 5001`. Routeren slår **destinations-IP og destinationsport** op i tabellen, omskriver til `10.0.0.1, 3345` og sender datagrammet ind i hjemmenettet. Portfeltet er 16 bit, så én WAN-adresse kan bære over 60.000 samtidige forbindelser.',
          ],
        },
        {
          term: 'Kritik af NAT og middleboxes',
          body: [
            'Portnumre er tænkt til at adressere processer, ikke hosts. Derfor er det svært at køre en server eller en P2P-peer bag en NAT: hvordan skal en udefra forbinde til en host, der ikke har en offentlig adresse? Løsningen er **NAT traversal**-værktøjer (s. 376). Arkitekturpurister indvender desuden, at en router bør være et lag 3-apparat og ikke ændre portnumre.',
            'NAT er en **middlebox** — en boks på datastien, der gør mere end almindelig IP-forwarding. Bogen grupperer middleboxes i NAT, sikkerhed (firewalls, IDS) og ydelse (caching, load balancing) (s. 390–391).',
          ],
        },
        {
          term: 'ICMP',
          body: [
            '**ICMP** bruges af hosts og routere til at sende netværkslagsinformation til hinanden, typisk fejl som “destination network unreachable”. Arkitektonisk ligger ICMP lige over IP: beskederne bæres som IP-payload med protocol-nummer 1 (s. 453).',
            'En ICMP-besked har **type** og **code** og indeholder header og de første 8 byte af det datagram, der udløste den. Eksempler fra fig. 5.19 (s. 454): type 8 code 0 = echo request og type 0 code 0 = echo reply (`ping`), type 3 = unreachable (code 3 = port), type 11 code 0 = TTL expired.',
            '**Traceroute** sender UDP-segmenter til en usandsynlig port med TTL 1, 2, 3 …; router nr. n svarer med type 11, og til sidst svarer destinationen med type 3 code 3 (port unreachable), så kilden ved, at den er fremme (s. 454–455).',
          ],
        },
        {
          term: 'IPv6-datagrammet',
          body: [
            'Motivationen var, at IPv4’s 32-bit adresserum var ved at slippe op; i februar 2011 uddelte IANA den sidste pulje (s. 377–378). Ændringerne (fig. 4.26, s. 378–380): adresser på **128 bit** plus en ny **anycast**-adressetype; en strømlinet **40-byte header** med fast længde; og en **flow label** (20 bit).',
            'Felterne: *version* (6), *traffic class* (8 bit, som TOS), *flow label*, *payload length* (16 bit, antal byte efter headeren), *next header* (samme værdier som IPv4’s protocol-felt), *hop limit* (som TTL), source og destination.',
            'Væk fra IPv4: **fragmentering i routere** (er datagrammet for stort, dropper routeren det og sender ICMP “Packet Too Big” tilbage), **header checksum** (transport- og linklaget tjekker allerede, og IPv4 skulle genberegne den i hver router) og **options** i den faste header (de kan ligge som “next header”) (s. 380).',
          ],
        },
        {
          term: 'Overgangen fra IPv4 til IPv6: tunneling',
          body: [
            'En “flag day”, hvor alle maskiner opgraderes samtidig, er utænkelig (s. 381). I praksis bruges **tunneling**: mellem to IPv6-noder B og E ligger IPv4-routere C og D. B lægger hele IPv6-datagrammet i payloaden af et IPv4-datagram adresseret til E; E ser protocol-nummer **41** og pakker IPv6-datagrammet ud (fig. 4.27, s. 381–382). Det er [[lagdeling-indkapsling|indkapsling]] af et netværkslag i et andet.',
            'Bogens pointe: det er meget svært at skifte protokol på netværkslaget (som at udskifte fundamentet under et hus), mens nye applikationsprotokoller udbredes hurtigt (s. 382).',
          ],
        },
      ],
      viz: 'knp-nat-ipv6',
      keyPoints: [
        'NAT: hele hjemmenettet deler én offentlig IP; routeren omskriver kilde-IP og kildeport udad og destination indad.',
        'NAT translation table: WAN-side `IP, port` ↔ LAN-side `IP, port`. Indgående datagrammer slås op på destinations-IP og -port.',
        'NAT bryder med, at porte adresserer processer — servere og P2P bag NAT kræver NAT traversal.',
        'ICMP ligger over IP (protocol 1): type + code. `ping` = type 8/0 og 0/0; traceroute bruger type 11 (TTL expired) og 3/3 (port unreachable).',
        'IPv6: 128-bit adresser, fast 40-byte header, ingen fragmentering i routere, ingen header checksum.',
        'IPv4 → IPv6 sker via tunneling: IPv6-datagrammet ligger som payload i IPv4 (protocol 41).',
      ],
      exam: [
        'NAT lader mange hosts med private adresser dele én offentlig adresse. Routeren omskriver kildeadresse og kildeport og gemmer koblingen i en translation table, så svaret kan sendes tilbage til den rigtige host og port.',
        'Fordi NAT bruger portnumre til at skelne hosts, kan en ekstern klient ikke uden videre åbne en forbindelse til en server bag NAT.',
        'ICMP bruges til fejlmeldinger og diagnose mellem hosts og routere; ping og traceroute er bygget på ICMP-beskeder.',
        'IPv6 udvider adressen til 128 bit og forenkler headeren til 40 byte uden fragmentering i routere og uden checksum, så routere kan forwarde hurtigere.',
        'Overgangen til IPv6 sker ved tunneling, hvor et IPv6-datagram indkapsles i et IPv4-datagram på strækninger, der kun kan IPv4.',
      ],
      sources: [
        { path: BOG, pages: 's. 374–377', note: 'Ingen slides — kun bog. 4.3.3 NAT med fig. 4.25 (s. 375) og NAT-kritik (s. 376).' },
        { path: BOG, pages: 's. 377–382', note: '4.3.4 IPv6: datagramformat (fig. 4.26), ændringer ift. IPv4, tunneling (fig. 4.27).' },
        { path: BOG, pages: 's. 390–391', note: '4.5 middleboxes.' },
        { path: BOG, pages: 's. 453–455', note: '5.6 ICMP, fig. 5.19 (typer og koder), traceroute.' },
        {
          path: k('context/slides/E3KNP-01_Lecture01_Computer_Networks_Internet_Part1.md'),
          original: 'data/slides/Chapter_1_(Computer Networks and the Internet - part 1).pdf',
          note: 'Lektion 1 nævner kun, at router, firewall og NAT ofte er samlet i én boks i hjemmenet.',
        },
      ],
      gaps: [
        'Bogen er ikke konsekvent med afsnitsnumrene: NAT er 4.3.3 og IPv6 4.3.4 (s. 374, 377), men s. 390 henviser til NAT og firewalls i “Section 4.3.4”.',
        'IPv6-adressernes skrivemåde (hex-grupper, forkortelse med `::`) og adressetyper ud over anycast er ikke beskrevet — bogen henviser til RFC 4291 (s. 380).',
        'NAT traversal nævnes kun ved navn og RFC-numre (s. 376); hvordan det virker, står ikke i materialet.',
        'ICMPv6 nævnes kun kort (s. 455); de to andre private adresseblokke fra RFC 1918 end `10.0.0.0/8` nævnes ikke.',
        UGER,
      ],
      keywords: ['NAT', 'network address translation', 'NAT translation table', 'private addresses', 'RFC 1918', 'middlebox', 'NAT traversal', 'ICMP', 'ping', 'traceroute', 'TTL expired', 'IPv6', 'flow label', 'next header', 'hop limit', 'anycast', 'tunneling', 'Packet Too Big'],
    },

    // ------------------------------------------------------------------ Kap. 5
    {
      slug: 'routing',
      title: 'Routing: link-state, distance-vector, OSPF og BGP',
      short: 'Routing',
      week: 'Uge 7',
      definition:
        'En **routing-algoritme** finder de billigste stier gennem en graf af routere, hvor kanterne har en cost. **Link-state** (Dijkstra) kræver hele topologien og beregner centralt; **distance-vector** (Bellman-Ford) er decentral og iterativ, hvor hver node kun kender sine naboers vektorer. På internettet kører **OSPF** (link-state) inden for et autonomt system og **BGP** mellem autonome systemer.',
      intro: [
        'Kapitel 5 er control plane: hvordan forwarding-tabellerne fra [[ipv4-forwarding|forwarding]] beregnes. Det kan ske **per-router** (hver router kører algoritmen og taler med de andre, som OSPF og BGP) eller **logisk centraliseret** i en controller, der taler med en lille control agent i hver router (SDN) (s. 408–410).',
      ],
      concepts: [
        {
          term: 'Grafmodellen og klassifikation',
          body: [
            'Netværket modelleres som en graf `G = (N, E)`: knuder er routere, kanter er links, og `c(x, y)` er kantens cost; findes kanten ikke, er `c(x, y) = ∞`. Bogen ser kun på urettede grafer, så `c(x, y) = c(y, x)` (s. 410–411). I fig. 5.3 er den billigste sti fra u til w `(u, x, y, w)` med cost 3 (s. 412).',
            'Tre akser (s. 412–413): **centraliseret** (global viden = *link-state*) vs. **decentraliseret** (*distance-vector*); **statisk** vs. **dynamisk**; **load-sensitive** vs. **load-insensitive**. RIP, OSPF og BGP er load-insensitive.',
          ],
        },
        {
          term: 'Link-state: Dijkstra',
          body: [
            'Hver node broadcaster **link-state packets** med sine egne links og costs, så alle ender med samme komplette kort og kan køre samme algoritme (s. 413). Dijkstra finder billigste sti fra kilden u til alle andre: efter k iterationer kendes de k billigste destinationer.',
            'Notation (s. 414): `D(v)` = cost af den billigst kendte sti til v, `p(v)` = forgængeren på den sti, `N′` = knuder med endeligt kendt sti. Initialisering: `D(v) = c(u, v)` for naboer, ellers ∞. Løkke: tag den w uden for N′ med mindst `D(w)`, læg den i N′, og opdater for hver nabo v uden for N′: `D(v) = min(D(v), D(w) + c(w, v))`. Løkken kører, til N′ = N.',
            'Tabel 5.1 (s. 415) på fig. 5.3: start `D(v)=2, D(w)=5, D(x)=1`. x tilføjes først; via x falder w til 4 og y til 2. Ved uafgjort mellem v og y (begge 2) vælges y “arbitrarily”; via y falder w til 3 og z til 4. Forwarding-tabellen i u (fig. 5.4, s. 416): v via `(u, v)`, alle andre via `(u, x)`.',
            'Kompleksitet: n(n+1)/2 knuder gennemsøges i alt, altså **O(n²)**; med en heap bliver minimum-søgningen logaritmisk (s. 416). Samme algoritme og relaxation som i [[doa/dijkstra|Dijkstra i DOA]] — der med prioritetskø og rettede kanter.',
            'Patologi: er cost lig med trafikken på linket, kan ruterne **oscillere** frem og tilbage (fig. 5.5, s. 416–417). Løsningen er ikke at lade alle routere køre algoritmen samtidig, fx ved at randomisere, hvornår de sender link-annonceringer.',
          ],
        },
        {
          term: 'Distance-vector: Bellman-Ford',
          body: [
            'DV er **iterativ, asynkron og distribueret** og stopper af sig selv (s. 418). Grundlaget er Bellman-Ford-ligningen `dx(y) = minv { c(x, v) + dv(y) }` over x’s naboer v. Den nabo, der giver minimum, er **next hop** i forwarding-tabellen. Tjek på fig. 5.3: `du(z) = min{2 + 5, 5 + 3, 1 + 3} = 4` — samme resultat som Dijkstra.',
            'Hver node x gemmer cost til sine naboer, sin egen vektor `Dx` og naboernes seneste vektorer. Når den modtager en ny vektor eller ser en link-cost ændre sig, genberegner den `Dx(y) = minv { c(x, v) + Dv(y) }`; ændres noget, sendes den nye vektor til naboerne (s. 419). I fig. 5.6 (x–y 2, y–z 1, x–z 7) ændres `Dx(z)` fra 7 til `min{2 + 1, 7 + 0} = 3` efter første udveksling (s. 420–422).',
            'DV-lignende algoritmer bruges i RIP, BGP, ISO IDRP, Novell IPX og det oprindelige ARPAnet (s. 420).',
          ],
        },
        {
          term: 'Count-to-infinity og poisoned reverse',
          body: [
            '**Gode nyheder spredes hurtigt**: falder cost y–x fra 4 til 1, er alt faldet på plads efter to iterationer (fig. 5.7a, s. 422). **Dårlige nyheder spredes langsomt**: stiger den fra 4 til 60 (fig. 5.7b), regner y `Dy(x) = min{60 + 0, 1 + 5} = 6` — via z, der selv går via y. Der er en **routing loop**, og y og z tæller op 6, 7, 8, 9 … i 44 udvekslinger, før z vælger sit direkte link med cost 50 (s. 423–424). Problemet kaldes **count-to-infinity**.',
            '**Poisoned reverse**: går z via y til x, fortæller z y, at `Dz(x) = ∞`. Det løser løkken mellem to naboer, men ikke løkker med tre eller flere knuder (s. 424).',
          ],
        },
        {
          term: 'LS vs. DV',
          body: [
            'Bogens sammenligning (s. 424–425): **beskedkompleksitet** — LS kræver O(|N||E|) beskeder, og en ændret cost skal til alle; DV udveksler kun med naboer. **Konvergens** — LS er O(|N|²); DV kan konvergere langsomt, have routing loops og count-to-infinity. **Robusthed** — under LS beregner hver node sin egen tabel, så en fejl bliver lokal; under DV kan én node, der annoncerer forkerte costs, sprede fejlen til hele nettet (eksemplet fra 1997, hvor store dele af internettet var afbrudt i timer). Ingen vinder; begge bruges.',
          ],
        },
        {
          term: 'Autonome systemer, OSPF og BGP',
          body: [
            'Ét fladt net af hundredvis af millioner routere skalerer ikke og respekterer ikke, at hver ISP vil styre sit eget net. Derfor grupperes routere i **autonome systemer (AS)** med et globalt unikt ASN; inden for et AS kører en *intra-AS*-protokol (s. 425–426).',
            '**OSPF** er link-state: flooding af link-state-information og Dijkstra i hver router, med sig selv som rod. Administratoren sætter link-costs (fx 1 for minimum-hop eller omvendt proportionalt med kapacitet). Annonceringer sendes ved ændringer og mindst hvert 30. minut, direkte i IP med protocol **89**. OSPF kan autentificere (simpel eller MD5), bruge flere lige dyre stier og opdele et AS hierarkisk i **areas** med et backbone-area (s. 426–429).',
            '**BGP** er inter-AS-protokollen, som alle AS’er kører — bogen kalder den limen, der holder internettet sammen. Den ligner distance-vector og router mod CIDR-præfikser, ikke adresser. BGP-routere taler over semi-permanente TCP-forbindelser på port **179**: **eBGP** mellem AS’er, **iBGP** inden for (s. 429–431). En annoncering bærer bl.a. **AS-PATH** (fx “AS2 AS3”; ser en router sit eget AS i listen, afvises den — løkkeforebyggelse) og **NEXT-HOP** (s. 432–433).',
            'Ruten vælges ved at eliminere i rækkefølge (s. 435): 1) højeste **local preference** (politik), 2) korteste AS-PATH, 3) **hot potato** — nærmeste NEXT-HOP-router målt med intra-AS-routingen, 4) BGP-identifikatorer. Hot potato alene er egoistisk: få pakken ud af eget AS så billigt som muligt (s. 434–435).',
          ],
        },
      ],
      viz: 'knp-routing',
      keyPoints: [
        'Routing-problemet er billigste sti i en graf, hvor knuder er routere og kanter har en cost.',
        'Link-state: alle kender hele topologien og kører Dijkstra. O(n²) uden heap. Kilde → `D(v)`, `p(v)` og til sidst next hop pr. destination.',
        'Distance-vector: Bellman-Ford `dx(y) = minv { c(x,v) + dv(y) }`, kun udveksling med naboer, asynkront og selvterminerende.',
        'DV: gode nyheder spredes hurtigt, dårlige langsomt (count-to-infinity). Poisoned reverse løser kun løkker mellem to naboer.',
        'OSPF = link-state inden for et AS (IP protocol 89). BGP = inter-AS over TCP port 179 med AS-PATH og NEXT-HOP.',
        'BGP vælger: local preference → korteste AS-PATH → hot potato → BGP-id.',
      ],
      exam: [
        'Routing-algoritmer finder billigste stier i en graf af routere. Link-state kræver et komplet kort og beregner med Dijkstra, mens distance-vector kun bruger naboernes vektorer og Bellman-Ford-ligningen.',
        'I Dijkstra holdes for hver knude den billigst kendte cost D(v) og forgængeren p(v); den billigste ukendte knude gøres endelig, og dens naboer opdateres, til alle knuder er kendte.',
        'Distance-vector kan få routing loops, når en link-cost stiger, fordi naboer tæller hinanden op — count-to-infinity. Poisoned reverse hjælper kun for løkker mellem to naboer.',
        'Internettet deles i autonome systemer: OSPF kører link-state inden for et AS, og BGP udveksler præfikser og AS-stier mellem AS’er, hvor politik vejer tungere end korteste sti.',
      ],
      sources: [
        { path: BOG, pages: 's. 407–417', note: 'Ingen slides — kun bog. 5.1 control plane; 5.2 grafmodel og link-state med fig. 5.3, tabel 5.1 (s. 415) og fig. 5.4 (s. 416).' },
        { path: BOG, pages: 's. 418–425', note: '5.2.2 distance-vector, fig. 5.6, count-to-infinity (fig. 5.7), poisoned reverse, LS vs. DV.' },
        { path: BOG, pages: 's. 425–435', note: '5.3 OSPF og 5.4 BGP (AS-PATH, NEXT-HOP, hot potato, route selection).' },
        { path: BOG, pages: 's. 453–455', note: '5.6 ICMP (uddybet under NAT, ICMP og IPv6).' },
        {
          path: k('context/slides/E3KNP-01_Lecture01_Computer_Networks_Internet_Part1.md'),
          original: 'data/slides/Chapter_1_(Computer Networks and the Internet - part 1).pdf',
          pages: 'slide 18',
          note: 'Lektion 1 definerer kun routing (“routing algorithms”) vs. forwarding.',
        },
      ],
      gaps: [
        'Tabel 5.1 bryder uafgjort mellem v og y (begge 2) “arbitrarily” og vælger y (s. 415). En anden tie-break giver samme costs, men en anden rækkefølge i tabellen.',
        'Bogen har to fejl i henvisningerne: poisoned reverse-afsnittet (s. 424) henviser til “Figure 5.5(b)”, men eksemplet er fig. 5.7(b); hot potato-eksemplet (s. 434) skriver “router 2d” med cost 3, hvor det må være router 3d.',
        'RIP nævnes kun som eksempel på DV (s. 413, 420) — protokollen beskrives ikke. BGP-politik, IP-anycast og SDN-controllere (s. 436–453) er ikke taget med.',
        'Pseudokoden for LS (s. 414) og DV (s. 419) står i bogen; den er beskrevet i tekst her, ikke gengivet.',
        UGER,
      ],
      keywords: ['control plane', 'routing algorithm', 'link-state', 'LS', 'Dijkstra', 'distance-vector', 'DV', 'Bellman-Ford', 'count-to-infinity', 'poisoned reverse', 'routing loop', 'autonomous system', 'AS', 'ASN', 'OSPF', 'BGP', 'eBGP', 'iBGP', 'AS-PATH', 'NEXT-HOP', 'hot potato', 'local preference', 'intra-AS', 'inter-AS'],
    },

    // ------------------------------------------------------------------ 6.1–6.4.2
    {
      slug: 'ethernet-mac-arp',
      title: 'Linklaget: MAC-adresser, ARP og Ethernet',
      short: 'Ethernet, MAC og ARP',
      week: 'Uge 8',
      definition:
        'Linklaget flytter et datagram over **ét link** mellem to tilstødende noder, indkapslet i en **frame**. Hvert interface (adapter/NIC) har en 48-bit **MAC-adresse**; **ARP** oversætter en IP-adresse på samme subnet til den MAC-adresse, framen skal sendes til. **Ethernet** er den dominerende kablede LAN-teknologi, og dens frameformat har været uændret i over 30 år.',
      concepts: [
        {
          term: 'Linklagets tjenester og adapteren',
          body: [
            'En *node* er alt, der kører en linklagsprotokol (hosts, routere, switche, access points); et *link* forbinder to tilstødende noder. I fig. 6.1 krydser et datagram seks links mellem en trådløs host og en server (s. 480). Bogens analogi: turisten (datagram) rejser med limousine, fly og tog (linklagsprotokoller), og rejsebureauet er routing-protokollen (s. 480–482).',
            'Mulige tjenester (s. 482–483): **framing**, **link access** (en MAC-protokol, der styrer adgang til et delt link), **reliable delivery** (bruges fx på trådløse links; mange kablede protokoller lader være) og **error detection/correction** i hardware.',
            'Linklaget ligger i **netværksadapteren** (NIC): hardware, der framer, styrer adgang og tjekker fejl, plus lidt software i hostens CPU. Det er stedet i stakken, hvor software møder hardware (s. 483–484).',
          ],
        },
        {
          term: 'Fejldetektion: paritet, checksum og CRC',
          body: [
            'Afsenderen tilføjer **EDC**-bit til data D; modtageren kan kun afgøre, om en fejl er *opdaget*, ikke om der er sket en (s. 485). Med én **paritetsbit** opdages et ulige antal bitfejl, men fejl kommer ofte i bursts, og så kan sandsynligheden for en uopdaget fejl nærme sig 50 %. **Todimensional paritet** kan finde og rette en enkelt bitfejl (FEC) (s. 486–488).',
            'Transportlaget bruger Internet-checksummen, fordi den er let i software; linklaget bruger **CRC**, fordi adapterens hardware kan regne den hurtigt (s. 488). CRC: afsender og modtager deler en generator G på r + 1 bit; afsenderen vælger r bit R, så `D·2^r XOR R` er delelig med G (modulo 2). Bogens eksempel: `D = 101110`, `G = 1001`, `R = 011` (s. 490). CRC opdager alle burst-fejl på færre end r + 1 bit (s. 491).',
          ],
        },
        {
          term: 'Multiple access — og hvorfor CSMA/CD',
          body: [
            'På et **broadcast-link** (gammelt Ethernet på bus eller hub, WiFi) modtager alle, hvad én sender, og sender to samtidig, **kolliderer** framene og tabes (s. 491–493). Protokollerne falder i tre klasser: channel partitioning (TDM, FDM, CDMA), random access og taking-turns (s. 493).',
            '**CSMA/CD** er random access med to regler: lyt før du taler (*carrier sensing*) og stop, hvis en anden taler samtidig (*collision detection*). Kollisioner sker alligevel, fordi signalet bruger tid på at nå frem (s. 499–502). Efter en kollision venter adapteren tilfældigt med **binary exponential backoff**: efter n kollisioner vælges K i `{0, …, 2^n − 1}` og ventes `K · 512` bit-tider (n højst 10) (s. 503).',
            'I dag er Ethernet en stjerne med en **switch** i midten, full-duplex og uden kollisioner — og så er der ifølge bogen ikke længere brug for en MAC-protokol (s. 520). Se [[switche|switche]].',
          ],
        },
        {
          term: 'MAC-adresser',
          body: [
            'Det er **adapteren**, ikke hosten, der har en MAC-adresse; en router med flere interfaces har flere. Switche har ingen MAC-adresse på de interfaces, der vender mod hosts og routere — de er gennemsigtige (s. 508). En MAC-adresse er **6 byte** (2⁴⁸ mulige) og skrives hex, fx `1A-23-F9-CD-06-9B`.',
            'IEEE sælger blokke på 2²⁴ adresser: de første 24 bit ligger fast pr. producent, de sidste vælger producenten. Adressen er **flad** og følger adapteren, uanset hvor den flyttes — som et CPR-nummer, mens en IP-adresse er hierarkisk som en postadresse (s. 509).',
            'Modtager en adapter en frame, som ikke er til dens MAC-adresse, kasserer den framen uden at forstyrre netværkslaget. **Broadcast-adressen** er 48 ettaller: `FF-FF-FF-FF-FF-FF` (s. 510). Hvorfor både IP og MAC? LAN’et skal kunne bære andre protokoller end IP, og lagene skal være uafhængige byggeklodser — tre adressetyper: værtsnavne (se [[dns|DNS]]), IP- og MAC-adresser (s. 510).',
          ],
        },
        {
          term: 'ARP inden for et subnet',
          body: [
            'ARP ligner DNS, men oversætter IP → MAC og kun for noder på **samme subnet** (s. 511). Hver host og router har en **ARP-tabel** med IP, MAC og TTL; en typisk levetid er 20 minutter (fig. 6.18, s. 512).',
            'Bogens eksempel (fig. 6.17): `222.222.222.220` (MAC `1A-23-F9-CD-06-9B`) vil sende til `222.222.222.222`, men har kun `.221` og `.223` i sin ARP-tabel. Den sender en **ARP query** i en frame til `FF-FF-FF-FF-FF-FF`; alle adaptere giver pakken op til ARP-modulet, og kun den med den matchende IP svarer med en **ARP response** i en almindelig (unicast) frame: `49-BD-D2-C7-56-2A`. Afsenderen opdaterer tabellen og sender datagrammet (s. 512).',
            'ARP er **plug-and-play** — tabellen bygges selv, og gamle rækker forsvinder (s. 513). Den ligger på grænsen mellem link- og netværkslag: pakken bæres i en linklagsframe (type `0806`) og indeholder både MAC- og IP-adresser.',
          ],
        },
        {
          term: 'ARP på tværs af subnets',
          body: [
            'Fig. 6.19 (s. 513–514): to subnets `111.111.111/24` og `222.222.222/24` forbundet af en router med to interfaces — to IP-adresser, to ARP-moduler og to adaptere. Vil `111.111.111.111` sende til `222.222.222.222`, er destinations-MAC’en i framen **ikke** `49-BD-D2-C7-56-2A`: ingen adapter på subnet 1 ville tage imod den.',
            'Framen sendes til routerens interface `111.111.111.110` (MAC `E6-E9-00-17-BB-4B`), fundet med ARP. Routeren slår datagrammets destination op i forwarding-tabellen, sender det ud på interfacet `222.222.222.220` og bruger ARP igen for at finde den endelige MAC-adresse. IP-destinationen er den samme hele vejen; MAC-adresserne skifter ved hvert link.',
          ],
        },
        {
          term: 'Ethernet-framen',
          body: [
            'Fig. 6.20 (s. 516–517), sendt fra adapter A (`AA-AA-AA-AA-AA-AA`) til B (`BB-BB-BB-BB-BB-BB`): **preamble** (8 byte: syv gange `10101010` til at synkronisere urene, så `10101011`), **destination address** (6 byte), **source address** (6 byte), **type** (2 byte; multiplexer netværkslagsprotokoller, fx IP eller ARP `0806`), **data** (46–1.500 byte; **MTU** er 1.500, og korte datagrammer fyldes op) og **CRC** (4 byte).',
            'Ethernet er **forbindelsesløst** (ingen handshake) og **upålideligt**: en frame, der fejler CRC-tjekket, smides væk uden ACK eller NAK. Bruger applikationen [[tcp-forbindelse|TCP]], opdager TCP hullet og sender igen; med UDP ser applikationen hullet (s. 517–518).',
            'Navne som `10BASE-T` og `100BASE-FX` angiver hastighed, *baseband* og medie (T = twisted pair). Hastigheder og medier har ændret sig, men frameformatet er det samme (s. 518–521).',
          ],
        },
      ],
      viz: 'knp-ethernet-mac-arp',
      keyPoints: [
        'Linklaget flytter en frame over ét link; det bor i netværksadapteren (NIC), mest i hardware.',
        'MAC-adressen er 48 bit, flad og hører til adapteren. Broadcast = `FF-FF-FF-FF-FF-FF`.',
        'ARP: query i broadcast-frame, response i unicast-frame; tabellen har IP, MAC og TTL og bygges automatisk.',
        'Til en host på et andet subnet sendes framen til routerens MAC (default gateway) — IP-destinationen står uændret i datagrammet.',
        'Ethernet-frame: preamble 8 · dest 6 · src 6 · type 2 · data 46–1500 · CRC 4 byte. Forbindelsesløs og upålidelig.',
        'CSMA/CD med binary exponential backoff var nødvendig på bus og hub; switched full-duplex Ethernet har ingen kollisioner.',
      ],
      exam: [
        'Linklaget flytter datagrammer over ét link ad gangen, indkapslet i frames, og det er implementeret i netværksadapteren med CRC-fejldetektion i hardware.',
        'En MAC-adresse er en flad 48-bit adresse, der følger adapteren, mens IP-adressen er hierarkisk og skifter med nettet; begge er nødvendige, fordi lagene skal være uafhængige.',
        'ARP finder MAC-adressen til en IP-adresse på samme subnet ved at broadcaste en forespørgsel, som kun ejeren af IP-adressen besvarer direkte.',
        'Skal et datagram til et andet subnet, adresseres framen til routerens interface, og routeren laver en ny frame på det næste link.',
        'En Ethernet-frame har preamble, destinations- og kilde-MAC, et type-felt til netværkslagsprotokollen, data på op til 1.500 byte og en CRC.',
      ],
      sources: [
        { path: BOG, pages: 's. 479–484', note: 'Ingen slides — kun bog. 6.1 linklagets tjenester og adapteren.' },
        { path: BOG, pages: 's. 484–491', note: '6.2 paritet, checksum og CRC.' },
        { path: BOG, pages: 's. 491–503', note: '6.3 multiple access; CSMA/CD og binary exponential backoff (s. 499–503).' },
        { path: BOG, pages: 's. 507–514', note: '6.4.1 MAC-adresser og ARP med fig. 6.17–6.19.' },
        { path: BOG, pages: 's. 514–521', note: '6.4.2 Ethernet og frameformatet (fig. 6.20, s. 516).' },
        {
          path: k('context/slides/E3KNP-01_Lecture01_Computer_Networks_Internet_Part1.md'),
          original: 'data/slides/Chapter_1_(Computer Networks and the Internet - part 1).pdf',
          note: 'Lektion 1 nævner kun, at hosts forbindes til en Ethernet-switch og videre til en institutionel router.',
        },
      ],
      gaps: [
        'ARP-pakkens præcise format (felter og størrelser) står ikke i bogen — kun at query og response har samme format med afsender- og modtager-IP og -MAC (s. 512).',
        'Den nye række i ARP-tabellen har ingen TTL i bogen; figuren bruger bogens “typisk 20 minutter” (s. 512) i stedet for et klokkeslæt.',
        'Afsnittet om Gigabit Ethernet (s. 520) blander tal: “40,000 Mbps, 40 Gigabit Ethernet” står i et afsnit om IEEE 802.3z (Gigabit). S. 519 skriver “CDMA/CD” om Ethernet, hvor det skal være CSMA/CD.',
        'ALOHA, taking-turns-protokoller og CSMA/CD-effektivitet (s. 495–507) er kun nævnt, ikke gennemgået.',
        UGER,
      ],
      keywords: ['link layer', 'linklag', 'frame', 'NIC', 'network adapter', 'error detection', 'parity', 'CRC', 'checksum', 'multiple access', 'CSMA/CD', 'binary exponential backoff', 'collision', 'MAC address', 'broadcast address', 'FF-FF-FF-FF-FF-FF', 'ARP', 'ARP table', 'ARP query', 'default gateway', 'Ethernet', 'preamble', 'MTU', 'type field'],
    },

    // ------------------------------------------------------------------ 6.4.3–6.4.4
    {
      slug: 'switche',
      title: 'Link-layer switche og VLAN',
      short: 'Switche og VLAN',
      week: 'Uge 8',
      definition:
        'En **link-layer switch** er en gennemsigtig store-and-forward-pakkeswitch på lag 2: den modtager frames og sender dem videre ud fra destinations-MAC’en efter en **switch table** (MAC, interface, tid). Tabellen bygges automatisk ved **self-learning** fra kilde-adresserne; kender switchen ikke destinationen, **flooder** den framen på alle andre interfaces.',
      concepts: [
        {
          term: 'Forwarding og filtering',
          body: [
            '**Filtering** afgør, om en frame skal videre eller droppes; **forwarding** afgør, hvilke interfaces den skal ud på (s. 521). Hosts adresserer frames til hinanden, ikke til switchen, og output-interfaces har buffere ligesom routerens.',
            'Ankommer en frame til `DD-DD-DD-DD-DD-DD` på interface x, er der tre tilfælde (s. 522): 1) ingen række → switchen sender kopier ud på **alle interfaces undtagen x** (broadcast); 2) rækken peger på x → destinationen ligger på samme segment, og framen **filtreres** (droppes); 3) rækken peger på y ≠ x → framen lægges i output-bufferen foran y.',
            'Bogens eksempel med den øverste switch i fig. 6.15 (interface 1 = Electrical Engineering, 2 = Computer Science, 3 = Computer Engineering, 4 = mailserver, 5 = webserver, 6 = router ud til internettet) og tabellen i fig. 6.22 (`62-FE-F7-11-89-A3` → 1 kl. 9:32, `7C-BA-B2-B4-91-10` → 3 kl. 9:36): en frame til `62-FE-F7-11-89-A3` fra interface 1 filtreres; samme frame fra interface 2 forwardes kun til interface 1.',
          ],
        },
        {
          term: 'Self-learning',
          body: [
            'Tabellen starter tom. For hver ankommen frame gemmer switchen **kilde-MAC**, **interfacet** den kom ind på og **tidspunktet**; sender alle hosts på et tidspunkt en frame, kender switchen dem alle (s. 523). Rækker slettes efter en **aging time**: i bogens eksempel ankommer `01-12-23-34-45-56` på interface 2 kl. 9:39 og tilføjes (fig. 6.23), og er aging time 60 min og kommer intet fra `62-FE-F7-11-89-A3` mellem 9:32 og 10:32, fjernes den kl. 10:32.',
            'Switche er derfor **plug-and-play** og full-duplex: administratoren sætter bare kablerne i (s. 524).',
          ],
        },
        {
          term: 'Fordele — og switch poisoning',
          body: [
            'Fordele frem for bus og hub (s. 524): ingen kollisioner (switchen sender aldrig mere end én frame ad gangen på et segment, og maksimal throughput er summen af interface-hastighederne), **heterogene links** (forskellige hastigheder og medier på hver port) og bedre **management** (en “jabbering adapter” kan kobles fra, og der samles statistik).',
            'En switch gør det sværere at sniffe, fordi frames kun sendes derhen, de skal. Men frames til ukendte destinationer og broadcast-frames sendes stadig ud overalt, og ved **switch poisoning** fylder en angriber tabellen med falske kilde-MAC’er, så switchen broadcaster det meste (s. 525).',
          ],
        },
        {
          term: 'Switche vs. routere',
          body: [
            'Begge er store-and-forward-pakkeswitche, men en switch forwarder på MAC-adresser (lag 2) og en router på IP-adresser (lag 3) (fig. 6.24, s. 525–526).',
            '**Switche**: plug-and-play og hurtige, fordi de kun behandler op til lag 2. Men den aktive topologi er begrænset til et **spanning tree** for at undgå, at broadcast-frames cirkulerer; store switchede net giver store ARP-tabeller og meget ARP-trafik; og de er sårbare over for **broadcast storms** (s. 526).',
            '**Routere**: hierarkisk adressering, så pakker ikke kører i ring (og ellers stopper TTL dem), valg af bedste sti, beskyttelse mod lag 2-broadcast storms. Men de er ikke plug-and-play og bruger mere tid pr. pakke (s. 526).',
            'Tabel 6.1 (s. 527): *traffic isolation* — hub nej, router ja, switch ja; *plug and play* — hub ja, router nej, switch ja; *optimal routing* — kun routeren. Små net med få hundrede hosts klarer sig med switche; store net med tusindvis af hosts har også routere.',
          ],
        },
        {
          term: 'VLAN',
          body: [
            'Et hierarki af switche giver tre problemer (s. 527–528): broadcast-trafik (ARP, DHCP, ukendte destinationer) krydser hele nettet; mange små switche udnyttes dårligt; og en medarbejder, der skifter afdeling, kræver ny kabling.',
            'En **VLAN**-switch definerer flere virtuelle LAN oven på én fysisk infrastruktur. I et **port-based VLAN** deler administratoren portene i grupper, og hver gruppe er et broadcast-domæne. Fig. 6.25: port 2–8 er EE-VLAN, port 9–15 er CS-VLAN på én 16-ports switch. Trafik mellem VLAN’erne skal gennem en router, ofte bygget ind i samme enhed (s. 528–529).',
            'Flere VLAN-switche forbindes med **VLAN trunking**: en trunk-port tilhører alle VLAN’er, og frames på trunken får et 4-byte **802.1Q**-tag med TPID `81-00`, et 12-bit VLAN-id og 3 prioritetsbit; CRC’en genberegnes (s. 529–530).',
          ],
        },
      ],
      viz: 'knp-switche',
      keyPoints: [
        'Switch table: MAC-adresse, interface, tidspunkt. Bygges af kilde-adresserne i de frames, der ankommer (self-learning).',
        'Ukendt destination → flood på alle interfaces undtagen det, framen kom ind på.',
        'Destination på samme interface som afsenderen → filtrér (drop). Ellers forward kun til det rigtige interface.',
        'Rækker ældes ud efter en aging time (bogens eksempel: 60 min).',
        'Switch = lag 2, plug-and-play, spanning tree, broadcast storms. Router = lag 3, konfiguration, optimal routing, isolerer broadcast.',
        'VLAN: porte grupperes i broadcast-domæner; trunks bærer 802.1Q-tag med 12-bit VLAN-id.',
      ],
      exam: [
        'En switch forwarder frames efter destinations-MAC’en og en switch table, som den lærer selv ved at notere kilde-MAC og indgangsinterface for hver frame, den modtager.',
        'Kender switchen ikke destinationen, flooder den framen på alle andre interfaces; ligger destinationen på samme segment som afsenderen, filtreres framen.',
        'Switche er plug-and-play og hurtige, men begrænset til et spanning tree og sårbare over for broadcast storms, mens routere isolerer trafik og vælger optimale stier, men skal konfigureres.',
        'VLAN’er deler én fysisk switch i flere broadcast-domæner, og trunk-links mærker frames med et 802.1Q-tag, så modtagerswitchen ved, hvilket VLAN de hører til.',
      ],
      sources: [
        { path: BOG, pages: 's. 507–508', note: 'Ingen slides — kun bog. 6.4 indledning og fig. 6.15 (interfaces 1–6 aflæst af figuren).' },
        { path: BOG, pages: 's. 521–527', note: '6.4.3 forwarding/filtering, self-learning (fig. 6.22–6.23), egenskaber, switch poisoning, switche vs. routere og tabel 6.1.' },
        { path: BOG, pages: 's. 527–530', note: '6.4.4 VLAN, trunking og 802.1Q.' },
        {
          path: k('context/slides/E3KNP-01_Lecture01_Computer_Networks_Internet_Part1.md'),
          original: 'data/slides/Chapter_1_(Computer Networks and the Internet - part 1).pdf',
          note: 'Lektion 1 nævner kun switche som pakkeswitche i access networks.',
        },
      ],
      gaps: [
        'Bogen giver ikke destinationen for framen fra `01-12-23-34-45-56` kl. 9:39 (s. 523). Figuren bruger bogens pladsholder `DD-DD-DD-DD-DD-DD` (s. 522) som ukendt destination, så flooding og learning kan vises i samme beat — kombinationen er illustrativ.',
        'Spanning tree nævnes som begrænsning (s. 526), men protokollen, der bygger træet, beskrives ikke.',
        'Hvad en switch gør, når tabellen er fuld, står kun indirekte i switch poisoning-boksen (s. 525).',
        UGER,
      ],
      keywords: ['switch', 'link-layer switch', 'switch table', 'forwarding', 'filtering', 'self-learning', 'flooding', 'aging time', 'plug-and-play', 'full-duplex', 'switch poisoning', 'spanning tree', 'broadcast storm', 'hub', 'router', 'VLAN', 'trunk', '802.1Q', 'broadcast domain'],
    },
  ],
}
