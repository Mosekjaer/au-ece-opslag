import type { Part } from '../types'
import { BOG } from './paths'

/* P4 Transportlaget — Kurose & Ross kap. 3 (bogsider 211–312).
   Bogside = PDF-side − 2 i hele kap. 3 (sidehovedet på PDF-side 232 viser 230, på 314 viser 312).
   Der er ingen slides til kap. 3; bogen er eneste kilde. */

const INGEN_SLIDES = 'Ingen slides — kun bog (Kurose & Ross, Global Edition, kap. 3)'
const UGER = 'Ugen er vejledende: der findes ingen lektionsplan for KNP, så ugen følger bogens kapitelrækkefølge.'

export const transportlag: Part = {
  id: 'transportlag',
  title: 'Transportlaget',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'udp-mux-demux',
      title: 'Transportlagets tjeneste, multiplexing og UDP',
      short: 'Mux/demux og UDP',
      week: 'Uge 4',
      definition:
        'Transportlaget giver **logisk kommunikation mellem processer** på forskellige værter, hvor netværkslaget (IP) kun giver logisk kommunikation mellem værter. Udvidelsen fra vært-til-vært til proces-til-proces hedder **multiplexing/demultiplexing** og sker med portnumre. **UDP** tilføjer næsten intet ud over det: mux/demux og en checksum.',
      intro: [
        'Bogens husholdningsanalogi (s. 214): to huse med hver et dusin børn, der skriver breve til hinanden. Postvæsenet flytter breve fra hus til hus (netværkslaget), mens Ann og Bill samler ind og deler ud inde i hvert hus (transportlaget). Ann og Bill arbejder kun i husene — ligesom transportprotokoller kun kører i endesystemerne, og routere aldrig kigger på transport-headeren (s. 212–214).',
      ],
      concepts: [
        {
          term: 'Transportlaget over IP',
          body: [
            'På afsendersiden deler transportlaget applikationens beskeder op (om nødvendigt) og sætter en header på hver bid; resultatet er et **segment**, som netværkslaget pakker ind i et **datagram** ([[lagdeling-indkapsling|indkapsling]]). Bogen bruger “segment” om både TCP og UDP og reserverer “datagram” til netværkslaget, selvom RFC’erne ofte kalder et UDP-segment et datagram (s. 212, 215).',
            'IP er en **best-effort**-tjeneste: den garanterer hverken levering, rækkefølge eller dataintegritet, og kaldes derfor upålidelig (s. 216). Hvad transportlaget kan love, er begrænset af netværkslaget — det kan ikke garantere forsinkelse eller båndbredde, hvis IP ikke kan. Men det *kan* bygge pålidelig overførsel oven på en upålidelig IP (s. 215).',
            'UDP giver kun to ting: proces-til-proces-levering og fejldetektering. TCP giver desuden pålidelig overførsel (flow control, sekvensnumre, kvitteringer og timere) og congestion control (s. 216).',
          ],
        },
        {
          term: 'Multiplexing og demultiplexing',
          body: [
            '**Demultiplexing** er at levere data i et modtaget segment til den rigtige **socket**; **multiplexing** er at samle data fra flere sockets på afsenderen, sætte header på og sende segmenterne ned til netværkslaget (s. 217). Transportlaget leverer ikke direkte til en proces, men til en socket, og hver socket har en unik identifikator.',
            'Felterne, der gør det muligt, er **source port** og **destination port**. Hvert portnummer er 16 bit (0–65535); 0–1023 er **well-known ports**, reserveret til fx HTTP (80) og FTP (21) (s. 218–219). Når en UDP-socket oprettes uden `bind()`, vælger transportlaget en ledig port i 1024–65535; en server binder typisk selv sin port (s. 219–220).',
          ],
        },
        {
          term: 'UDP: 2-tuple — TCP: 4-tuple',
          body: [
            'En **UDP-socket** er fuldt identificeret af (destinations-IP, destinationsport). To UDP-segmenter med forskellig afsender-IP eller afsenderport, men samme destinations-IP og -port, havner altså i **samme socket** (s. 220). Afsenderporten bruges som returadresse: i bogens eksempel sender vært A fra port 19157 til port 46428 på B, og B’s svar har de to portnumre byttet om (figur 3.4, s. 220–221). Se [[sockets-udp|UDP-sockets]] for `recvfrom()`, der henter afsenderens adresse.',
            'En **TCP-socket** er identificeret af 4-tuplen (source IP, source port, destination IP, destination port), og alle fire værdier bruges til demultiplexing (s. 220–222). Serveren har en velkomst-socket (bogens eksempel: port 12000); når en forbindelsesanmodning kommer, opretter `accept()` en ny forbindelsessocket, der identificeres af anmodningens fire værdier (s. 221–222). Se [[sockets-tcp|TCP-sockets]].',
            'Figur 3.5 (s. 223): vært C har to HTTP-forbindelser til server B med source port 26145 og 7532, og vært A har én med source port 26145. Alle tre har destination port 80. B kan alligevel skelne A’s og C’s forbindelser med port 26145, fordi source-IP’en er forskellig.',
          ],
        },
        {
          term: 'UDP-segmentet og checksummen',
          body: [
            'UDP-headeren har fire felter à **2 byte** — source port, destination port, length og checksum — i alt **8 byte**. Length er antal byte i hele segmentet (header + data) (figur 3.7, s. 228). TCP-headeren er typisk 20 byte (s. 226).',
            'Checksummen er **1-komplementet af summen af alle 16-bit-ord** i segmentet, hvor overløb lægges til igen (*wrap around*). Bogens eksempel (s. 229): `0110011001100000 + 0101010101010101 = 1011101110110101`; plus `1000111100001100` giver `0100101011000010` efter wraparound; 1-komplementet `1011010100111101` er checksummen. Modtageren lægger alle fire ord sammen inkl. checksummen; uden fejl er resultatet `1111111111111111`, og et 0-bit betyder fejl.',
            'I virkeligheden regnes checksummen også over nogle felter fra IP-headeren; det springer bogen bevidst over (s. 228). UDP har checksum, fordi ikke alle links garanterer fejldetektering, og fejl kan opstå i en routers hukommelse — et eksempel på **end-end-princippet** (s. 229). UDP gør intet for at rette fejlen: nogle implementeringer smider segmentet væk, andre sender det op med en advarsel (s. 230).',
          ],
        },
        {
          term: 'Hvornår UDP frem for TCP',
          body: [
            'Bogens fire grunde (s. 225–226): **finere kontrol** over hvad der sendes og hvornår (ingen congestion control, ingen genudsendelse der trækker ud); **ingen forbindelsesopsætning** (det er hovedgrunden til, at DNS kører over UDP); **ingen forbindelsestilstand**, så en server kan have flere klienter; og **mindre header** (8 mod 20 byte).',
            'Figur 3.6 (s. 227): e-mail (SMTP), Telnet, SSH, HTTP og FTP kører over TCP; HTTP/3 over UDP; NFS, SNMP og DNS typisk over UDP; internettelefoni over UDP eller TCP. QUIC bygger pålidelighed oven på UDP i applikationslaget (s. 226–227; se [[congestion-control|congestion control]] for QUIC).',
            'Prisen: UDP har ingen congestion control. Hvis alle streamede video uden, ville routerne flyde over, og de TCP-afsendere, der skruer ned ved tab, ville blive trængt ud (s. 227).',
          ],
        },
      ],
      viz: 'knp-udp-mux-demux',
      keyPoints: [
        'Netværkslaget: vært til vært. Transportlaget: proces til proces — kun i endesystemerne, aldrig i routere.',
        'Demultiplexing = find socketen ud fra header-felterne. Multiplexing = saml fra flere sockets og send ned.',
        'UDP-socket = (dest-IP, dest-port). TCP-socket = (src-IP, src-port, dest-IP, dest-port).',
        'UDP-header: 4 felter × 2 byte = 8 byte. Checksum = 1-komplement af 16-bit-summen med wraparound.',
        'UDP vælges for kontrol, ingen handshake, ingen tilstand og lille header — prisen er ingen pålidelighed og ingen congestion control.',
      ],
      code: [
        {
          lang: 'python',
          title: 'UDP-socket: automatisk eller fast portnummer',
          source: 'Kurose & Ross s. 219',
          code: `clientSocket = socket(AF_INET, SOCK_DGRAM)
clientSocket.bind(('', 19157))`,
        },
        {
          lang: 'python',
          title: 'TCP: klienten forbinder til port 12000, serveren opretter en forbindelsessocket',
          source: 'Kurose & Ross s. 221',
          code: `clientSocket = socket(AF_INET, SOCK_STREAM)
clientSocket.connect((serverName,12000))

connectionSocket, addr = serverSocket.accept()`,
        },
      ],
      exam: [
        'Transportlaget udvider IP’s levering mellem værter til levering mellem processer. Det sker ved demultiplexing: modtageren læser portnumrene i segmentet og afleverer data til den rigtige socket.',
        'En UDP-socket identificeres kun af destinationens IP og port, så segmenter fra forskellige afsendere havner i samme socket. En TCP-socket identificeres af alle fire værdier, så hver forbindelse får sin egen socket — derfor kan en webserver have mange forbindelser på port 80.',
        'UDP-headeren er 8 byte: to portnumre, længde og checksum. Checksummen er 1-komplementet af 16-bit-summen; modtageren lægger alt sammen og forventer lutter 1-bit.',
        'UDP vælges, når applikationen hellere vil styre timingen selv og tåler tab — fx DNS, der sparer forbindelsesopsætningen. Til gengæld skal applikationen selv lave pålidelighed, hvis den har brug for det.',
      ],
      sources: [
        { path: BOG, pages: 's. 211–230', note: INGEN_SLIDES },
        { path: BOG, pages: 's. 217–224', note: '3.2 Multiplexing and Demultiplexing, figur 3.2–3.5' },
        { path: BOG, pages: 's. 224–230', note: '3.3 UDP, figur 3.6–3.7, checksum-eksemplet s. 229' },
      ],
      gaps: [
        UGER,
        'Bogen udelader bevidst, at UDP-checksummen også dækker felter fra IP-headeren (s. 228). Hvilke felter det er, står ikke i kapitel 3.',
        'Bogen nævner, at en vært svarer med et ICMP-datagram, når et UDP-segment rammer en port uden socket (s. 283), men henviser til kapitel 5 for detaljerne.',
      ],
      keywords: ['multiplexing', 'demultiplexing', 'port', 'portnummer', 'well-known port', 'socket', '4-tuple', '2-tuple', 'UDP', 'User Datagram Protocol', 'checksum', '1s complement', 'segment', 'best effort', 'end-end principle'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'paalidelig-overfoersel',
      title: 'Pålidelig dataoverførsel: rdt, Go-Back-N og Selective Repeat',
      short: 'Pålidelig overførsel',
      week: 'Uge 4',
      definition:
        'En protokol for **reliable data transfer (rdt)** giver de øvre lag en pålidelig kanal — ingen bit ændret, intet tabt, alt i rækkefølge — oven på en kanal, der kan ødelægge og tabe pakker. Bogen bygger den op trin for trin: checksum, kvitteringer, sekvensnumre og timer giver **stop-and-wait** (rdt3.0); **pipelining** med vindue og **Go-Back-N** eller **Selective Repeat** gør den hurtig.',
      intro: [
        'Afsnittet taler om “pakker” frem for segmenter, fordi teorien gælder for netværk generelt, og kun om envejs dataoverførsel. Kanalen antages ikke at bytte om på pakkernes rækkefølge (s. 231–232). Grænsefladen er `rdt_send()` ovenfra, `udt_send()` ned i den upålidelige kanal, `rdt_rcv()` når en pakke ankommer og `deliver_data()` op til modtagerens applikation (figur 3.8, s. 231).',
      ],
      concepts: [
        {
          term: 'rdt1.0 → rdt2.x: bitfejl',
          body: [
            '**rdt1.0** antager en helt pålidelig kanal. Afsender og modtager har hver én tilstand; afsenderen laver en pakke og sender den, modtageren pakker ud og afleverer (figur 3.9, s. 232–233).',
            '**rdt2.0** håndterer bitfejl som en diktat i telefonen: fejldetektering (checksum), **modtagerfeedback** (ACK eller NAK) og **genudsendelse**. Protokoller med den mekanik hedder **ARQ** (*Automatic Repeat reQuest*). Afsenderen venter på ACK/NAK og kan ikke tage nye data imens — det er **stop-and-wait** (figur 3.10, s. 234–235).',
            'Fejlen i rdt2.0: ACK/NAK kan også blive ødelagt. Sender afsenderen blot igen, opstår dubletter, som modtageren ikke kan genkende. Løsningen er et **sekvensnummer**; til stop-and-wait er 1 bit nok. Det giver **rdt2.1** med dobbelt så mange tilstande (figur 3.11–3.12, s. 236–238). **rdt2.2** fjerner NAK: modtageren sender i stedet ACK for den sidst korrekt modtagne pakke, og to ACK for samme pakke (**duplicate ACK**) betyder, at den næste ikke kom frem. ACK’en skal derfor bære sekvensnummeret (s. 238–240, figur 3.13–3.14).',
          ],
        },
        {
          term: 'rdt3.0: tab og timer',
          body: [
            'Når kanalen også kan tabe pakker, lægger bogen ansvaret for at opdage tab hos afsenderen: den venter en fornuftigt valgt tid og sender igen, hvis ingen ACK er kommet. Det kræver en **nedtællingstimer**, der startes ved hver afsendelse, kan stoppes og giver en timeout-hændelse (s. 239–240).',
            'Afsenderen ved ikke, om datapakken blev tabt, ACK’en blev tabt, eller om begge bare var forsinkede — svaret er i alle tilfælde at sende igen. En for tidlig timeout giver dubletter, men dem håndterer sekvensnumrene fra rdt2.2 allerede (s. 240). Fordi sekvensnumrene skifter mellem 0 og 1, kaldes rdt3.0 også **alternating-bit protocol** (figur 3.15–3.16, s. 241–242).',
            'Tabel 3.1 (s. 256) samler mekanismerne: checksum (bitfejl), timer (tab), sekvensnummer (huller og dubletter), ACK, NAK og vindue/pipelining.',
          ],
        },
        {
          term: 'Utilization: hvorfor stop-and-wait er for langsom',
          body: [
            'Bogens regnestykke (s. 243–245): værter på hver sin kyst i USA med **RTT ≈ 30 ms**, et link på **R = 1 Gbps** og pakker på **L = 1.000 byte = 8.000 bit**. Transmissionstiden er `d_trans = L/R = 8000 bit / 10⁹ bit/s = 8 µs` (jf. [[forsinkelse-tab-throughput|forsinkelse og tab]]).',
            'ACK’en når tilbage til afsenderen ved `t = RTT + L/R = 30,008 ms`. Afsenderens udnyttelse er `U_sender = (L/R) / (RTT + L/R) = 0,008 / 30,008 = 0,00027` — den sender i 2,7 hundrededele af en procent af tiden. Effektivt 1.000 byte pr. 30,008 ms ≈ **267 kbps** på et 1 Gbps-link.',
            'Løsningen er **pipelining**: må afsenderen have tre pakker ude, før den venter, bliver udnyttelsen i praksis tredoblet (figur 3.18, s. 244–245). Det kræver et større sekvensnummerområde og buffere hos afsender (og måske modtager).',
          ],
        },
        {
          term: 'Go-Back-N',
          body: [
            'Afsenderen må have højst **N** ukvitterede pakker ude. `base` er den ældste ukvitterede, `nextseqnum` den næste der sendes; `[base, base+N−1]` er **vinduet**, der glider frem — deraf *sliding-window protocol* (figur 3.19, s. 245–246). Med et k-bit felt er sekvensnumrene `[0, 2ᵏ−1]` og regnes modulo `2ᵏ` (s. 246).',
            'ACK n er **kumulativ**: alt til og med n er modtaget. Der er **én timer** for den ældste ukvitterede pakke; ved timeout sendes **alle** afsendte, ukvitterede pakker igen (s. 248). Modtageren husker kun `expectedseqnum`: pakker uden for rækkefølge smides væk, og der sendes ACK for den seneste pakke, der kom i rækkefølge (s. 248–249).',
            'Figur 3.22 (s. 249–250), N = 4: pkt0–3 sendes, pkt2 tabes. Modtageren smider pkt3 væk og sender ACK1. ACK0 og ACK1 skubber vinduet, så pkt4 og pkt5 sendes — og smides også væk (ACK1, ACK1). Ved pkt2’s timeout sendes pkt2, 3, 4 og 5 igen.',
          ],
        },
        {
          term: 'Selective Repeat',
          body: [
            'GBN kan fylde røret med unødige genudsendelser, når vindue og båndbredde-forsinkelsesprodukt er store (s. 250–251). **SR** sender kun de pakker igen, der formodes tabt. Derfor kvitterer modtageren **hver pakke for sig**, bufferer pakker uden for rækkefølge og har sit eget vindue `[rcv_base, rcv_base+N−1]`; hver pakke har sin egen logiske timer (figur 3.23–3.25, s. 251–252).',
            'Figur 3.26 (s. 253), samme forløb: pkt3, 4 og 5 bufferes og kvitteres enkeltvis (ACK3, ACK4, ACK5). Ved timeout sendes kun pkt2; når den kommer, leveres pkt2–5 samlet, og ACK2 sendes.',
            'Modtageren skal også kvittere igen for pakker i `[rcv_base−N, rcv_base−1]`, ellers kan afsenderens vindue gå i stå (s. 252–253). Afsender og modtager ser ikke det samme vindue, og med for få sekvensnumre kan modtageren ikke skelne en genudsendelse fra ny data: med numrene 0–3 og vindue 3 går det galt (figur 3.27, s. 254–255). Vinduet skal være **højst halvdelen af sekvensnummerrummet** (s. 254).',
          ],
        },
      ],
      viz: 'knp-paalidelig-overfoersel',
      keyPoints: [
        'Checksum finder bitfejl, ACK/NAK giver feedback, sekvensnummer finder dubletter, timer finder tab.',
        'rdt3.0 (alternating bit) virker, men stop-and-wait giver U = 0,00027 i bogens eksempel (RTT 30 ms, 1 Gbps, 8000 bit).',
        'Pipelining: op til N pakker ude på én gang; vinduet glider frem, når ACK’er kommer.',
        'GBN: kumulativ ACK, én timer, modtager smider ude-af-rækkefølge væk, timeout sender hele vinduet igen.',
        'SR: individuel ACK, timer pr. pakke, modtager bufferer, kun den tabte sendes igen. Vindue ≤ halvdelen af sekvensnummerrummet.',
      ],
      exam: [
        'Pålidelig overførsel bygges af fire mekanismer: checksum mod bitfejl, kvitteringer som feedback, sekvensnumre så modtageren kan kende dubletter og huller, og en timer så afsenderen kan opdage tab.',
        'Stop-and-wait er korrekt, men spilder linket: med bogens tal (RTT 30 ms, 1 Gbps, 1.000-byte-pakker) sender afsenderen kun 0,027 % af tiden. Pipelining løser det ved at tillade flere ukvitterede pakker.',
        'Go-Back-N bruger kumulative ACK’er og én timer; ved timeout sendes alle ukvitterede pakker igen, og modtageren smider pakker uden for rækkefølge væk. Selective Repeat kvitterer og genudsender pakke for pakke og bufferer hos modtageren.',
        'I bogens eksempel med vindue 4 og tabt pkt2 sender GBN fire pakker igen, SR kun én.',
      ],
      sources: [
        { path: BOG, pages: 's. 230–256', note: INGEN_SLIDES },
        { path: BOG, pages: 's. 232–242', note: 'rdt1.0–rdt3.0, figur 3.9–3.16' },
        { path: BOG, pages: 's. 241–245', note: 'Pipelining og utilization-regnestykket, figur 3.17–3.18' },
        { path: BOG, pages: 's. 245–255', note: 'Go-Back-N (figur 3.19–3.22) og Selective Repeat (figur 3.23–3.27)' },
      ],
      gaps: [
        UGER,
        'Modtager-FSM’en for rdt3.0 er overladt til en opgave (s. 240), og beviset for, at SR-vinduet højst må være halvdelen af sekvensnummerrummet, er også en opgave (s. 254).',
        'Bogens figur 3.25 (s. 252) henviser til “rcv_base in Figure 3.22”, men `rcv_base` står i figur 3.23 — en fejlhenvisning i bogen.',
        'Figur 3.22 viser kun modtagelse og ACK af pkt2 og pkt3 efter genudsendelsen; at pkt4 og pkt5 derefter leveres, er underforstået.',
      ],
      keywords: ['rdt', 'reliable data transfer', 'ARQ', 'ACK', 'NAK', 'stop-and-wait', 'alternating-bit', 'sekvensnummer', 'timeout', 'pipelining', 'utilization', 'Go-Back-N', 'GBN', 'Selective Repeat', 'SR', 'sliding window', 'vindue', 'kumulativ ACK', 'duplicate ACK'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'tcp-forbindelse',
      title: 'TCP: segmenter, pålidelighed og forbindelsesstyring',
      short: 'TCP-forbindelsen',
      week: 'Uge 5',
      definition:
        '**TCP** er internettets forbindelsesorienterede, pålidelige transportprotokol. Forbindelsen er logisk — tilstanden findes kun i de to endesystemer — og er **full-duplex** og **point-to-point**. Den oprettes med et **three-way handshake** (SYN, SYNACK, ACK) og lukkes med FIN-segmenter fra hver side. Data er en bytestrøm, som TCP nummererer byte for byte.',
      concepts: [
        {
          term: 'Forbindelsen, buffere og MSS',
          body: [
            'TCP-forbindelsen er ikke et kredsløb: routere og switche ser datagrammer, ikke forbindelser (s. 257). Hver side har en **send buffer** og en **receive buffer**, som oprettes under handshaket (figur 3.28, s. 259).',
            '**MSS** (*maximum segment size*) er den største mængde applikationsdata i ét segment — ikke segmentets samlede størrelse. MSS sættes ud fra linklagets **MTU**, så segment plus TCP/IP-header (typisk 40 byte) passer i én ramme. Ethernet og PPP har MTU 1.500 byte, så en typisk MSS er **1.460 byte** (s. 259).',
          ],
        },
        {
          term: 'Segmentstrukturen',
          body: [
            'Headeren har source/destination port og checksum som UDP, plus **32-bit sequence number** og **32-bit acknowledgment number**, et **16-bit receive window** til [[flow-control|flow control]], et **4-bit header length** (i 32-bit-ord), et valgfrit **options**-felt (fx MSS-forhandling og window scaling) og et flagfelt (figur 3.29, s. 260–261). Uden options er headeren **20 byte** — 12 byte mere end UDP’s (s. 260).',
            'Flag: **ACK** (ack-feltet er gyldigt), **RST**, **SYN** og **FIN** (opsætning og nedlukning), **CWR** og **ECE** (explicit congestion notification), **PSH** og **URG** med urgent data pointer — de sidste tre bruges ikke i praksis (s. 260–261).',
          ],
        },
        {
          term: 'Sekvensnumre og kumulative ACK',
          body: [
            'TCP ser data som en ordnet bytestrøm. Et segments **sekvensnummer** er nummeret på dets første byte. Bogens eksempel: en fil på 500.000 byte, MSS 1.000 byte og første byte nr. 0 giver 500 segmenter med sekvensnumrene 0, 1.000, 2.000 … (figur 3.30, s. 262).',
            '**Ack-nummeret** er nummeret på den **næste byte**, værten venter på. Har A modtaget byte 0–535 og 900–1.000, men ikke 536–899, sender A stadig ack = 536: TCP kvitterer kun op til første manglende byte — **kumulative ACK’er** (s. 262). Hvad modtageren gør med segmenter uden for rækkefølge, fastlægger RFC’erne ikke; i praksis gemmes de (s. 263).',
            'Begge sider vælger et tilfældigt **initialt sekvensnummer**, så et gammelt segment fra en tidligere forbindelse ikke forveksles med et gyldigt (s. 263). Telnet-eksemplet (figur 3.31, s. 263–265): klient-ISN 42, server-ISN 79. Klienten sender `Seq=42, ACK=79, data=\'C\'`; serveren ekkoer med `Seq=79, ACK=43, data=\'C\'` (ACK’en er **piggybacked** på data); klienten svarer `Seq=43, ACK=80` uden data.',
          ],
        },
        {
          term: 'RTT-estimering og timeout',
          body: [
            '`SampleRTT` måles for ét ukvitteret segment ad gangen og aldrig for et genudsendt segment (s. 265). Gennemsnittet er et **EWMA**: `EstimatedRTT = (1 − α) · EstimatedRTT + α · SampleRTT` med anbefalet **α = 0,125**, altså `EstimatedRTT = 0,875 · EstimatedRTT + 0,125 · SampleRTT` (s. 266).',
            'Variationen: `DevRTT = (1 − β) · DevRTT + β · |SampleRTT − EstimatedRTT|` med anbefalet **β = 0,25** (s. 266). Timeouten: `TimeoutInterval = EstimatedRTT + 4 · DevRTT`, med startværdi **1 sekund** (s. 267).',
            'Ved timeout **fordobles** intervallet i stedet for at blive genberegnet: 0,75 s → 1,5 s → 3,0 s i bogens eksempel. Når timeren startes efter ny data eller en ny ACK, beregnes den igen fra formlen (s. 267, 271–272). Fordoblingen er en begrænset form for congestion control.',
          ],
        },
        {
          term: 'Pålidelighed i TCP og fast retransmit',
          body: [
            'TCP bruger **én retransmissionstimer** (RFC 6298), knyttet til det ældste ukvitterede segment. Den forenklede afsender har tre hændelser: data fra applikationen, timeout (send det ukvitterede segment med laveste sekvensnummer igen) og ACK med værdi y (hvis `y > SendBase`, så `SendBase = y`) (figur 3.33, s. 268–270). Scenarierne i figur 3.34–3.36 (s. 270–273) viser tabt ACK (Seq=92, 8 byte), for tidlig timeout og en kumulativ ACK=120, der redder et tabt ACK=100.',
            '**Fast retransmit**: modtageren sender straks en **duplicate ACK**, når den ser et hul (tabel 3.2, s. 274). Får afsenderen **tre duplicate ACK’er** for samme data, sender den det manglende segment igen, før timeren udløber (s. 274–275, figur 3.37).',
            'Er TCP så GBN eller SR? Kumulative ACK’er og kun `SendBase`/`NextSeqNum` ligner GBN, men TCP bufferer ofte segmenter uden for rækkefølge og sender højst ét segment igen. Med **selective acknowledgment** (RFC 2018) ligner den SR. Bogen kalder den en hybrid (s. 276).',
          ],
        },
        {
          term: 'Three-way handshake og nedlukning',
          body: [
            '**Trin 1:** klienten sender et **SYN-segment** (SYN = 1, ingen data) med et tilfældigt `client_isn` som sekvensnummer. **Trin 2:** serveren allokerer buffere og variabler og svarer med **SYNACK**: SYN = 1, `ack = client_isn+1`, `seq = server_isn`. **Trin 3:** klienten allokerer sine buffere og svarer med SYN = 0, `ack = server_isn+1`; det tredje segment må bære data (s. 279–280, figur 3.39).',
            'Nedlukning (figur 3.40, s. 280–281): klienten sender et segment med **FIN = 1**, serveren kvitterer, sender selv FIN, og klienten kvitterer. Derefter frigives ressourcerne. Kommer et SYN til en port uden socket, svarer værten med et **RST**-segment (s. 283).',
            'Tilstande, klient (figur 3.41, s. 281–282): CLOSED → SYN_SENT → ESTABLISHED → FIN_WAIT_1 → FIN_WAIT_2 → TIME_WAIT → CLOSED. TIME_WAIT lader klienten sende den sidste ACK igen, hvis den tabes; typisk 30 s, 1 min eller 2 min. Server (figur 3.42, s. 283): CLOSED → LISTEN → SYN_RCVD → ESTABLISHED → CLOSE_WAIT → LAST_ACK → CLOSED.',
            'At serveren allokerer ressourcer allerede ved SYN, udnytter **SYN flood**-angrebet; forsvaret er **SYN cookies**, hvor serverens ISN er en hash af adresser, porte og en hemmelighed, så den intet gemmer før ACK’en (s. 284).',
          ],
        },
      ],
      viz: 'knp-tcp-forbindelse',
      keyPoints: [
        'TCP-header: 20 byte uden options; 32-bit seq og ack, 16-bit receive window, flag SYN/ACK/FIN/RST m.fl.',
        'Seq = nummeret på segmentets første byte. Ack = næste byte man venter på (kumulativ).',
        '`EstimatedRTT = 0,875·EstimatedRTT + 0,125·SampleRTT`, `DevRTT` med β = 0,25, `TimeoutInterval = EstimatedRTT + 4·DevRTT`.',
        'Tre duplicate ACK’er udløser fast retransmit før timeout. Timeout fordobler intervallet.',
        'Handshake: SYN (seq=client_isn) → SYNACK (seq=server_isn, ack=client_isn+1) → ACK (ack=server_isn+1). Nedlukning: FIN, ACK, FIN, ACK, TIME_WAIT.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Forenklet TCP-afsender (figur 3.33)',
          source: 'Kurose & Ross s. 269',
          code: `/* Assume sender is not constrained by TCP flow or congestion control, that data from above is less
than MSS in size, and that data transfer is in one direction only. */

NextSeqNum=InitialSeqNumber
SendBase=InitialSeqNumber

loop (forever) {
  switch(event)

    event: data received from application above
      create TCP segment with sequence number NextSeqNum
      if (timer currently not running)
        start timer
      pass segment to IP
      NextSeqNum=NextSeqNum+length(data)
      break;

    event: timer timeout
      retransmit not-yet-acknowledged segment with
        smallest sequence number
      start timer
      break;

    event: ACK received, with ACK field value of y
      if (y > SendBase) {
        SendBase=y
        if (there are currently any not-yet-acknowledged segments)
          start timer
      }
      break;

} /* end of loop forever */`,
        },
        {
          lang: 'text',
          title: 'ACK-hændelsen med fast retransmit',
          source: 'Kurose & Ross s. 274–275',
          code: `event: ACK received, with ACK field value of y
  if (y > SendBase) {
    SendBase=y
    if (there are currently any not yet
        acknowledged segments)
      start timer
  }
  else {/* a duplicate ACK for already ACKed
          segment */
    increment number of duplicate ACKs
      received for y
    if (number of duplicate ACKS received
        for y==3)
      /* TCP fast retransmit */
      resend segment with sequence number y
  }
  break;`,
        },
      ],
      exam: [
        'TCP nummererer bytes, ikke segmenter: sekvensnummeret er nummeret på segmentets første byte, og ack-nummeret er den næste byte, modtageren venter på. Kvitteringerne er kumulative.',
        'Timeouten følger den målte RTT: EstimatedRTT er et vægtet gennemsnit med α = 0,125, DevRTT måler variationen med β = 0,25, og TimeoutInterval er EstimatedRTT plus fire gange DevRTT.',
        'TCP opdager tab på to måder: timeout, der også fordobler intervallet, og tre duplicate ACK’er, der udløser fast retransmit, før timeren udløber.',
        'Forbindelsen oprettes med SYN, SYNACK og ACK, hvor hver side kvitterer for den andens initiale sekvensnummer plus én. Den lukkes med en FIN og en ACK fra hver side, og klienten venter i TIME_WAIT for at kunne sende den sidste ACK igen.',
      ],
      sources: [
        { path: BOG, pages: 's. 257–285', note: INGEN_SLIDES },
        { path: BOG, pages: 's. 259–265', note: 'Buffere og MSS, segmentstruktur (figur 3.29), sekvens- og ack-numre, Telnet-eksemplet (figur 3.31)' },
        { path: BOG, pages: 's. 265–276', note: 'RTT-estimering, timeout, forenklet afsender (figur 3.33), fast retransmit (tabel 3.2, figur 3.37)' },
        { path: BOG, pages: 's. 279–284', note: 'Three-way handshake (figur 3.39), nedlukning (figur 3.40), tilstande (figur 3.41–3.42), SYN flood' },
      ],
      gaps: [
        UGER,
        'Uenighed i bogen: teksten siger, at flagfeltet “contains 6 bits” (s. 260), men figur 3.29 (s. 261) viser otte flag (CWR, ECE, URG, ACK, PSH, RST, SYN, FIN), og teksten forklarer selv alle otte.',
        'Figur 3.39 og 3.40 har ingen konkrete sekvensnumre — kun `client_isn` og `server_isn`. Hvad FIN-segmenterne bærer af seq/ack, viser bogen ikke; figuren her viser derfor kun flag ved nedlukningen.',
        'TIME_WAIT: figur 3.41 skriver “Wait 30 seconds”, teksten (s. 282) siger at tiden er implementeringsafhængig, typisk 30 s, 1 min eller 2 min.',
        'Samtidig åbning/lukning fra begge sider og andre “patologiske” forløb er ikke beskrevet; bogen henviser til Stevens (s. 282–283).',
      ],
      keywords: ['TCP', 'Transmission Control Protocol', 'segment', 'MSS', 'MTU', 'sequence number', 'acknowledgment number', 'kumulativ ACK', 'piggyback', 'ISN', 'SampleRTT', 'EstimatedRTT', 'DevRTT', 'TimeoutInterval', 'EWMA', 'fast retransmit', 'duplicate ACK', 'SYN', 'SYNACK', 'FIN', 'RST', 'three-way handshake', 'TIME_WAIT', 'SYN flood', 'SYN cookie', 'SACK'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'flow-control',
      title: 'TCP flow control og receive window',
      short: 'Flow control',
      week: 'Uge 5',
      definition:
        '**Flow control** er en hastighedstilpasning: den sikrer, at afsenderen ikke overfylder **modtagerens buffer**. Modtageren annoncerer sin ledige plads, **rwnd**, i hvert segment, og afsenderen holder mængden af ukvitterede data under rwnd. Det er noget andet end congestion control, som beskytter **netværket**.',
      concepts: [
        {
          term: 'Receive buffer og rwnd',
          body: [
            'TCP lægger korrekte bytes i rækkefølge i forbindelsens receive buffer; applikationen læser, når den har tid — måske længe efter. Læser den langsomt, kan afsenderen let fylde bufferen (s. 276).',
            'Modtageren B har en buffer på `RcvBuffer` byte og holder styr på `LastByteRead` (sidste byte applikationen har læst) og `LastByteRcvd` (sidste byte, der er lagt i bufferen). Der skal gælde `LastByteRcvd − LastByteRead ≤ RcvBuffer`, og det ledige rum er `rwnd = RcvBuffer − [LastByteRcvd − LastByteRead]` (s. 277, figur 3.38 s. 278).',
            'B skriver den aktuelle rwnd i **receive window**-feltet (16 bit, se [[tcp-forbindelse|segmentstrukturen]]) i hvert segment, den sender til A. Fra start er `rwnd = RcvBuffer`. Fordi TCP er full-duplex, har hver side sin egen receive window (s. 277).',
          ],
        },
        {
          term: 'Afsenderens regel',
          body: [
            'A holder styr på `LastByteSent` og `LastByteAcked`. Forskellen er mængden af ukvitterede data, og A sørger hele tiden for, at `LastByteSent − LastByteAcked ≤ rwnd` (s. 277–278).',
            'Sammen med congestion control bliver reglen `LastByteSent − LastByteAcked ≤ min{cwnd, rwnd}` (s. 294) — se [[congestion-control|congestion control]].',
          ],
        },
        {
          term: 'rwnd = 0 og 1-byte-segmenter',
          body: [
            'Hvis B’s buffer bliver fuld, annoncerer B `rwnd = 0`. Har B intet at sende til A, sender TCP heller ingen nye segmenter, når applikationen tømmer bufferen — TCP sender kun, når der er data eller en ACK at sende. A får aldrig at vide, at der er plads igen, og er blokeret (s. 278).',
            'Derfor kræver TCP-specifikationen, at A **bliver ved med at sende segmenter med én databyte**, når rwnd er 0. Modtageren kvitterer for dem, og når bufferen begynder at tømmes, bærer ACK’erne en rwnd større end 0 (s. 278).',
          ],
        },
        {
          term: 'UDP har ingen flow control',
          body: [
            'UDP lægger segmenterne i en buffer af begrænset størrelse foran socketen, og processen læser et helt segment ad gangen. Læser den for langsomt, flyder bufferen over, og segmenter smides væk (s. 278). Se [[sockets-udp|UDP-sockets]].',
          ],
        },
        {
          term: 'Flow control ≠ congestion control',
          body: [
            'Begge dele drosler afsenderen, men af helt forskellige grunde: flow control matcher afsenderens hastighed med **modtagerapplikationens** læsehastighed; congestion control reagerer på trængsel **i IP-netværket** (s. 276–277). Bogen advarer mod, at mange forfattere bruger ordene i flæng.',
          ],
        },
      ],
      viz: 'knp-flow-control',
      keyPoints: [
        '`rwnd = RcvBuffer − [LastByteRcvd − LastByteRead]` — det ledige rum i modtagerens buffer.',
        'Modtageren sender rwnd i receive window-feltet i hvert segment.',
        'Afsenderen: `LastByteSent − LastByteAcked ≤ rwnd` (med congestion control: `≤ min{cwnd, rwnd}`).',
        'Ved rwnd = 0 sender afsenderen 1-byte-segmenter, så den får nye rwnd-værdier tilbage.',
        'Flow control beskytter modtageren; congestion control beskytter netværket.',
      ],
      exam: [
        'Flow control forhindrer afsenderen i at overfylde modtagerens buffer. Modtageren beregner det ledige rum, rwnd, som bufferens størrelse minus de bytes, der er modtaget men ikke læst, og sender det med i hvert segment.',
        'Afsenderen holder mængden af sendte, ukvitterede bytes under rwnd. Er rwnd nul, sender den segmenter med én byte, så kvitteringerne kan fortælle, når der er plads igen.',
        'Flow control og congestion control drosler begge afsenderen, men flow control handler om modtageren, congestion control om netværket. Den faktiske grænse er minimum af rwnd og cwnd.',
      ],
      sources: [
        { path: BOG, pages: 's. 276–278', note: INGEN_SLIDES },
        { path: BOG, pages: 's. 294', note: 'Samlet grænse min{cwnd, rwnd}' },
      ],
      gaps: [
        UGER,
        'Bogen antager i afsnittet, at modtageren smider segmenter uden for rækkefølge væk (s. 277), selvom den to sider før siger, at de i praksis gemmes (s. 263). Hvordan rwnd regnes med bufferede huller, står der ikke.',
        'Bogen giver ingen talværdier for RcvBuffer og ingen detaljer om, hvor ofte 1-byte-segmenterne sendes. Tallene i figuren er illustrative.',
        'Window scaling nævnes kun som en option (s. 260); hvordan 16-bit-feltet skaleres, forklares ikke.',
      ],
      keywords: ['flow control', 'receive window', 'rwnd', 'RcvBuffer', 'LastByteRead', 'LastByteRcvd', 'LastByteSent', 'LastByteAcked', 'zero window', 'speed-matching'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'congestion-control',
      title: 'Congestion control og TCP’s cwnd',
      short: 'Congestion control',
      week: 'Uge 5',
      definition:
        '**Congestion control** drosler afsendere, når netværket er overbelastet — for mange kilder, der sender for hurtigt. Klassisk TCP gør det **end-to-end**: den opfatter tab (timeout eller tre duplicate ACK’er) som trængsel og styrer raten med **congestion window** `cwnd`, gennem **slow start**, **congestion avoidance** (AIMD) og **fast recovery**.',
      intro: [
        'Genudsendelse behandler symptomet (et tabt segment), ikke årsagen (for meget trafik). Congestion control angriber årsagen (s. 285).',
      ],
      concepts: [
        {
          term: 'Omkostninger ved congestion: bogens tre scenarier',
          body: [
            '**Scenarie 1** — to afsendere, én router med uendelig buffer, udgående link med kapacitet R: throughput pr. forbindelse kan højst blive **R/2**, og forsinkelsen vokser mod uendelig, når sendehastigheden nærmer sig R/2. Omkostning: **store køforsinkelser** (figur 3.43–3.44, s. 286–287; jf. [[forsinkelse-tab-throughput|køforsinkelse]]).',
            '**Scenarie 2** — endelig buffer og genudsendelse. Skelnes mellem `λin` (original data) og `λ′in` (*offered load*: original + genudsendt). Ved `λ′in = R/2` leveres i bogens eksempel kun **R/3** original data — 0,333R original og 0,166R genudsendt. Genudsender afsenderen for tidligt, så routeren i snit videresender hver pakke to gange, går throughput mod **R/4** (figur 3.45–3.46, s. 287–289). Omkostning: genudsendelser, og unødige kopier spilder linket.',
            '**Scenarie 3** — fire afsendere over to-hop-stier (figur 3.47, s. 289–290). Ved meget høj belastning går A–C-forbindelsens throughput mod **nul**, fordi B–D-trafikken fylder R2’s buffer. Omkostning: når en pakke smides efter nogle hop, er arbejdet på alle hop før **spildt** (figur 3.48, s. 291).',
          ],
        },
        {
          term: 'End-to-end vs. network-assisted',
          body: [
            '**End-to-end**: netværkslaget hjælper ikke; endesystemerne må slutte sig til trængsel ud fra tab og forsinkelse. Det er TCP’s tilgang, fordi IP ikke giver feedback (s. 292).',
            '**Network-assisted**: routere giver eksplicit feedback, enten direkte til afsenderen (**choke packet**) eller ved at markere et felt i en pakke til modtageren, som så melder tilbage — det tager en hel RTT (figur 3.49, s. 292–293). På internettet findes det som **ECN**: to bit i IP-headerens Type of Service-felt sættes af en overbelastet router; modtageren sætter **ECE** i sin ACK, afsenderen halverer cwnd og sætter **CWR** (figur 3.55, s. 304–305).',
          ],
        },
        {
          term: 'cwnd og tabshændelser',
          body: [
            'Afsenderen må højst have `LastByteSent − LastByteAcked ≤ min{cwnd, rwnd}` ukvitterede bytes ude (jf. [[flow-control|flow control]]); raten er omtrent **cwnd/RTT** byte/s (s. 294). En **loss event** er en timeout eller tre duplicate ACK’er (s. 294).',
            'Principperne (s. 295): et tabt segment betyder trængsel — sænk raten; en ACK for ny data betyder, at alt er vel — hæv raten; og **bandwidth probing**: øg, til der kommer tab, træk dig, og prøv igen. Fordi ACK’er driver væksten, kaldes TCP **self-clocking** (s. 294–295).',
          ],
        },
        {
          term: 'Slow start, congestion avoidance og fast recovery',
          body: [
            '**Slow start**: cwnd starter på **1 MSS** og øges med 1 MSS for hver ACK — det **fordobler** cwnd hver RTT (figur 3.50, s. 296–297). Eksempel: MSS 500 byte og RTT 200 ms giver en startrate på kun ca. 20 kbps. Slow start slutter ved timeout (`ssthresh = cwnd/2`, `cwnd = 1 MSS`, forfra), når `cwnd` når `ssthresh` (skift til congestion avoidance), eller ved tre duplicate ACK’er (fast retransmit og fast recovery) (s. 297).',
            '**Congestion avoidance**: +1 MSS pr. RTT, typisk som `cwnd += MSS · (MSS/cwnd)` pr. ACK. Med MSS 1.460 byte og cwnd 14.600 byte sendes 10 segmenter pr. RTT, og hver ACK giver 1/10 MSS (s. 297). Timeout: som i slow start. Tre duplicate ACK’er: `ssthresh = cwnd/2`, `cwnd = ssthresh + 3·MSS`, og der skiftes til fast recovery (s. 297–298, figur 3.51).',
            '**Fast recovery**: +1 MSS pr. duplicate ACK; når ACK’en for det manglende segment kommer, sættes `cwnd = ssthresh`, og TCP går i congestion avoidance. Timeout: som ovenfor (s. 298–299). Fast recovery er anbefalet, men ikke påkrævet. I FSM’en (figur 3.51) er startværdien `ssthresh = 64 KB`.',
          ],
        },
        {
          term: 'Tahoe, Reno, AIMD og CUBIC',
          body: [
            '**TCP Tahoe** går altid til cwnd = 1 MSS og slow start, både ved timeout og ved tre duplicate ACK’er. **TCP Reno** har fast recovery (s. 300). Figur 3.52 (s. 300): ssthresh starter på **8 MSS**; cwnd er 1, 2, 4, 8 i runde 1–4, vokser lineært til **12 MSS** i runde 8, hvor tre duplicate ACK’er kommer. `ssthresh = 0,5 · 12 = 6 MSS`. Reno fortsætter fra **9 MSS** (6 + 3) og vokser lineært; Tahoe starter forfra fra 1 MSS og vokser eksponentielt op til 6, derefter lineært.',
            'Ser man bort fra slow start og timeouts, er TCP **AIMD** — *additive increase, multiplicative decrease*: +1 MSS pr. RTT, halvering ved tab — med det karakteristiske savtakmønster (figur 3.53, s. 300–301). Gennemsnitlig throughput for en langlivet Reno-forbindelse er i bogens forenklede model `0,75 · W / RTT`, hvor W er vinduet ved tab (s. 303).',
            '**TCP CUBIC** ændrer kun congestion avoidance: vinduet vokser som en kubisk funktion af afstanden til tidspunktet K, hvor det igen når `Wmax` (vinduet ved sidste tab) — hurtigt langt fra Wmax, forsigtigt tæt på. CUBIC er standard i Linux, og ca. 50 % af de 5.000 mest populære webservere kørte en version af den (s. 301–303). Forsinkelsesbaserede varianter (TCP Vegas, BBR) opdager trængsel ud fra stigende RTT, før der sker tab (s. 305–306).',
          ],
        },
        {
          term: 'Fairness og QUIC',
          body: [
            'En mekanisme er **fair**, hvis K forbindelser over samme flaskehals med rate R hver får ca. **R/K**. For to forbindelser med samme MSS og RTT i congestion avoidance konvergerer AIMD mod lige deling (figur 3.56–3.57, s. 306–308). I praksis får forbindelser med kort RTT mere, UDP-applikationer drosler ikke ned, og parallelle forbindelser snyder: 9 applikationer med én forbindelse hver plus en ny med 11 parallelle giver den nye mere end R/2 (s. 307–309).',
            '**QUIC** er en applikationslagsprotokol over UDP med forbindelser, kryptering, flere **streams** i én forbindelse (så et tabt segment kun blokerer sine egne streams — ingen head-of-line blocking) og pålidelighed og congestion control pr. forbindelse baseret på TCP NewReno. HTTP/3 bygger på QUIC (figur 3.58–3.59, s. 310–312; jf. [[http|HTTP]] og [[bad/http|HTTP/3 i BAD]]).',
          ],
        },
      ],
      viz: 'knp-congestion-control',
      keyPoints: [
        'Congestion koster: køforsinkelse, genudsendelser (også unødige) og spildt arbejde på tidligere hop.',
        'TCP er end-to-end: tab (timeout eller 3 dup-ACK) = trængsel. ECN er den valgfri network-assisted variant.',
        'Slow start: cwnd fra 1 MSS, fordobles pr. RTT op til ssthresh. Congestion avoidance: +1 MSS pr. RTT.',
        'Timeout: ssthresh = cwnd/2, cwnd = 1 MSS. 3 dup-ACK (Reno): ssthresh = cwnd/2, cwnd = ssthresh + 3 MSS, fast recovery.',
        'Tahoe går altid til 1 MSS; Reno halverer. Bogens figur: ssthresh 8, tab ved cwnd 12 → ssthresh 6, Reno 9, Tahoe 1.',
        'AIMD konvergerer mod fair deling R/K — men UDP og parallelle forbindelser undergraver det.',
      ],
      exam: [
        'Congestion control beskytter netværket mod for meget trafik. Bogens scenarier viser omkostningerne: lange køer, genudsendelser der æder kapacitet, og spildt arbejde, når en pakke smides efter flere hop.',
        'TCP styrer raten med cwnd, så den sender omtrent cwnd/RTT. Den har ingen hjælp fra netværket, men tolker timeout og tre duplicate ACK’er som tegn på trængsel.',
        'I slow start fordobles cwnd hver RTT fra 1 MSS, indtil den når ssthresh; derefter vokser den med 1 MSS pr. RTT. Ved tab sættes ssthresh til halvdelen af cwnd.',
        'Forskellen på Tahoe og Reno ses ved tre duplicate ACK’er: Tahoe går til 1 MSS og slow start, Reno halverer via fast recovery. I bogens eksempel går cwnd fra 12 til 9 med Reno og til 1 med Tahoe, med ssthresh 6.',
        'AIMD — additiv vækst og halvering — giver savtakmønstret og får to ens forbindelser til at dele en flaskehals ligeligt.',
      ],
      sources: [
        { path: BOG, pages: 's. 285–312', note: INGEN_SLIDES },
        { path: BOG, pages: 's. 285–293', note: '3.6 Principper: scenarie 1–3 (figur 3.43–3.48), end-to-end vs. network-assisted (figur 3.49)' },
        { path: BOG, pages: 's. 293–303', note: '3.7.1 Klassisk TCP: slow start, CA, fast recovery (figur 3.50–3.51), Tahoe/Reno (figur 3.52), AIMD, CUBIC' },
        { path: BOG, pages: 's. 304–312', note: 'ECN, delay-based, fairness (figur 3.56–3.57) og 3.8 QUIC' },
      ],
      gaps: [
        UGER,
        'Uenighed i bogen: FSM’en i figur 3.51 siger, at fast recovery ved ny ACK sætter `cwnd = ssthresh` (her 6), men figur 3.52 og teksten s. 300 lader Reno fortsætte lineært fra 9 MSS uden at falde til 6. Figuren her følger figur 3.52.',
        'Figur 3.51 skriver `cwnd=1 MSS` i slow start og congestion avoidance, men `cwnd=1` ved timeout i fast recovery, og teksten s. 297 skriver “sets the value of cwnd to 1”. Enheden er MSS alle steder.',
        'Bogens indledning til 3.7 henviser til “Section 7.3.1” og “7.3.2”; det skal være 3.7.1 og 3.7.2 (s. 293). Afsnittet om fairness henviser til “Figure 3.55”, men mener figur 3.56 (s. 306).',
        'TCP NewReno (grundlaget for QUIC’s congestion control) er kun nævnt som “a slight modification to the TCP Reno protocol” (s. 312); forskellen forklares ikke.',
      ],
      keywords: ['congestion control', 'trængsel', 'cwnd', 'congestion window', 'ssthresh', 'slow start', 'congestion avoidance', 'fast recovery', 'AIMD', 'Tahoe', 'Reno', 'CUBIC', 'ECN', 'ECE', 'CWR', 'Vegas', 'BBR', 'fairness', 'QUIC', 'HTTP/3', 'offered load', 'loss event', 'self-clocking'],
    },
  ],
}
