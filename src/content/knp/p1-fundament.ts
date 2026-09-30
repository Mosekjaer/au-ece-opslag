import type { Part } from '../types'
import { BOG, k } from './paths'

/* Del 1: lektion 1 (slides del 1 og 2) + Kurose & Ross kap. 1.
   Slidenumre er PDF-sidetal i slide-PDF'erne; sidefoden på slidene viser Kurose-nummereringen
   «Introduction 1-N», som ikke er den samme. Bogsider er tryksider (PDF-side − 2 i kap. 1). */

const S1 = k('context/slides/E3KNP-01_Lecture01_Computer_Networks_Internet_Part1.md')
const O1 = 'data/slides/Chapter_1_(Computer Networks and the Internet - part 1).pdf'
const S2 = k('context/slides/E3KNP-01_Lecture01_Part2_Network_Communication.md')
const O2 = 'data/slides/Chapter_1_(Computer Networks and the Internet - part 2).pdf'

const UGER =
  'Ugenummeret er vejledende: der findes ingen lektionsplan, kun slides til lektion 1. Ugerne følger bogens rækkefølge.'

export const fundament: Part = {
  id: 'fundament',
  title: 'Internet og lagdeling',
  topics: [
    // ------------------------------------------------------------------ 1
    {
      slug: 'internet-net-edge',
      title: 'Internettet, net edge og net core',
      short: 'Internet og net edge',
      week: 'Uge 1',
      definition:
        'Internettet er et computernetværk, der forbinder milliarder af **end systems** (hosts) via **communication links** og **packet switches**. Kanten (*network edge*) er end systems og de **access networks**, der forbinder dem til den første router; kernen (*network core*) er masken af routere og links imellem.',
      intro: [
        'Bogen og slides giver to beskrivelser af det samme: en *nuts-and-bolts*-beskrivelse af komponenterne og en *service*-beskrivelse, hvor internettet er en infrastruktur, der leverer tjenester til distribuerede applikationer. Begge er nødvendige: den første forklarer, hvad en pakke møder på vejen, den anden, hvorfor programmer kun ser et socket-interface.',
      ],
      concepts: [
        {
          term: 'To beskrivelser: komponenter og services',
          body: [
            '**Nuts and bolts.** End systems (PC’er, servere, smartphones og “things” som termostater og biler) forbindes af links af forskellige fysiske medier med en **transmission rate** i bits/s. Afsenderen deler data op og sætter header-bytes på hvert stykke; resultatet er **packets**. Packet switches findes i to hovedtyper: **routers** (typisk i net core) og **link-layer switches** (typisk i access networks). Rækken af links og switches en pakke passerer, er dens **route** eller *path*.',
            'End systems får adgang gennem **ISP’er** (Internet Service Providers), og alle kører protokoller; de vigtigste er **TCP** og **IP**, samlet kaldet TCP/IP. Standarderne udvikles af **IETF** og hedder **RFC’er** (request for comments) — bogen nævner næsten 9000. IEEE 802 standardiserer Ethernet og WiFi.',
            '**Service-beskrivelsen.** Applikationerne kører på end systems, *ikke* i packet switches. Et program beder internettet om at levere data gennem et **socket interface** — bogens analogi er postvæsenet: brevet skal i en kuvert med adresse og frimærke, før posten tager det. Postvæsenet har flere services (ekspres, kvittering); internettet tilbyder på samme måde flere services, som applikationen vælger imellem (bog s. 36; slide 5: “provides programming interface to apps”).',
          ],
        },
        {
          term: 'Protokol',
          body: [
            'Bogens definition (s. 39): en protokol fastlægger **formatet** og **rækkefølgen** af de beskeder, to eller flere parter udveksler, og de **handlinger**, der udføres, når en besked sendes, modtages eller en anden hændelse indtræffer. Slide 6 siger det samme i tre ord: *format*, *order*, *actions*.',
            'Bogens eksempel sætter en menneskelig protokol (“Hi” — “Hi” — “Got the time?” — “2:00”) ved siden af en webforespørgsel: TCP connection request, connection reply, `GET` og til sidst filen. Kører de to parter ikke samme protokol, sker der intet nyttigt.',
          ],
        },
        {
          term: 'Access networks',
          body: [
            'Et access network er det netværk, der fysisk forbinder et end system med den første router på vejen, **edge router** (bog s. 42). Slides viser tre situationer: hjemmenetværket (trådløse enheder, access point, “router, firewall, NAT … often combined in single box”, kabel- eller DSL-modem), virksomhedens Ethernet (switch → institutional router → ISP, 10 Mbps–10 Gbps) og trådløs adgang via en **base station** (slide 8–10).',
            '**DSL** bruger telefonlinjen til telcoens **DSLAM** i central office. Linjen deles med frekvenser: 0–4 kHz telefon, 4–50 kHz upstream, 50 kHz–1 MHz downstream. Adgangen er **asymmetrisk** (fx 24/52 Mbps ned, 3.5/16 Mbps op) og kræver typisk under 5–10 miles til CO (bog s. 43–44).',
            '**Kabel (HFC)** bruger fiber fra head end til et nabolagsknudepunkt og coax det sidste stykke; hvert knudepunkt har 500–5.000 hjem. **CMTS** svarer til DSLAM. DOCSIS 2.0/3.0 giver 40 Mbps/1.2 Gbps ned og 30/100 Mbps op. Mediet er **delt broadcast**: alle downstream-pakker når alle hjem (bog s. 44–45).',
            '**FTTH** fører fiber fra CO til hjemmet. I **PON** har hvert hjem en **ONT**, en splitter samler typisk under 100 hjem på én fiber til **OLT** i CO. Desuden **5G fixed wireless**, **Ethernet** (100 Mbps til titals Gbps for brugere), **WiFi** (IEEE 802.11, delt >100 Mbps) og **4G/5G** fra mobiloperatøren (bog s. 45–48).',
          ],
        },
        {
          term: 'Fysiske medier',
          body: [
            'En bit passerer en række **transmitter-receiver-par**; mellem dem ligger det fysiske link. **Guided media** fører signalet i et fast medie (kobber, fiber, coax), **unguided media** lader det brede sig frit (radio) (slide 11; bog s. 49).',
            '**Twisted pair** (UTP/STP) er to isolerede kobbertråde snoet mod interferens; slide 11: Cat5 100 Mbps/1 Gbps, Cat6 250 Mbps/10 Gbps. **Coax** har to koncentriske ledere og mange kanaler (broadband). **Fiber** sender lyspulser, én pr. bit: titals–hundredvis af Gbps, immun over for elektromagnetisk støj, repeaters langt fra hinanden (slide 12; bog s. 50).',
            '**Radio** påvirkes af refleksion, forhindringer og interferens. Slide 13: WiFi fx 54 Mbps, 4G ~10 Mbps, satellit kbps–45 Mbps og typisk 270 ms end-end delay. Bogen: en geostationær satellit står 36.000 km oppe og giver 280 ms propagation delay (s. 51).',
          ],
        },
        {
          term: 'Network of networks: ISP-hierarkiet',
          body: [
            'Access-ISP’erne skal forbindes, så to vilkårlige hosts kan udveksle pakker. At forbinde hver med hver skalerer ikke: **O(N²)** forbindelser (slide 21). Én global transit-ISP virker, men hvis den tjener penge, kommer der konkurrenter, og de skal forbindes indbyrdes (slide 22–24).',
            'Bogen bygger det op i fem *Network Structures* (s. 62–64): access-ISP → **regional ISP** → **tier-1 ISP**, hvor kunden betaler udbyderen på hvert niveau, og tier-1 betaler ingen. Dertil **PoP** (routere hos udbyderen, hvor kunder kobler på), **multi-homing** (flere udbydere), **peering** (typisk *settlement-free*) og **IXP** — et sted, hvor mange ISP’er peerer (over 600 IXP’er).',
            'Til sidst **content provider networks** som Google: et privat TCP/IP-net mellem egne datacentre, der peerer direkte med lavere-tier ISP’er og dermed går uden om de øverste lag (slide 26–27; bog s. 64). Bogen nævner ca. et dusin tier-1 ISP’er, fx Level 3, AT&T, Sprint og NTT.',
          ],
        },
      ],
      viz: 'knp-internet-net-edge',
      keyPoints: [
        'Hosts = end systems. De kører applikationerne; packet switches i kernen gør ikke.',
        'Routere hører typisk til net core, link-layer switches til access networks.',
        'En protokol fastlægger format, rækkefølge og handlinger ved afsendelse og modtagelse.',
        'Access network = vejen fra end system til første router (edge router): DSL, kabel (HFC), FTTH, Ethernet, WiFi, 4G/5G.',
        'DSL og kabel er asymmetriske; kabel og PON er delte medier, hvor downstream-pakker når alle hjem.',
        'Internettet er et network of networks: access → regional → tier-1, bundet sammen af peering og IXP’er; content providers går udenom.',
      ],
      exam: [
        'Internettet kan beskrives som komponenter — end systems, links og packet switches, der kører protokoller som TCP og IP — eller som en infrastruktur, der via socket-interfacet leverer services til distribuerede applikationer på end systems.',
        'En protokol definerer formatet og rækkefølgen af de beskeder, to eller flere parter udveksler, og hvilke handlinger der udføres, når en besked sendes eller modtages.',
        'Et access network forbinder et end system med den første router; DSL gør det over telefonlinjen til en DSLAM, kabel over HFC til en CMTS, og FTTH over fiber til en OLT.',
        'Access-ISP’er betaler regionale ISP’er, der betaler tier-1-ISP’er; tier-1 betaler ingen og peerer indbyrdes, ofte på en IXP. Content providers som Google peerer direkte med lavere-tier ISP’er.',
      ],
      sources: [
        { path: S1, original: O1, pages: 'slide 3–6', note: 'Nuts-and-bolts, service view, protokol (slidenr. = PDF-side)' },
        { path: S1, original: O1, pages: 'slide 8–13', note: 'Home/enterprise/wireless access, physical media' },
        { path: S1, original: O1, pages: 'slide 19–28', note: 'Network of networks, IXP, regional, content provider, tier-1 (Sprint)' },
        { path: BOG, pages: 's. 32–39', note: '1.1 What Is the Internet? (1.1.1–1.1.3)' },
        { path: BOG, pages: 's. 39–51', note: '1.2 The Network Edge: access networks og physical media' },
        { path: BOG, pages: 's. 61–64', note: '1.3.3 A Network of Networks, fig. 1.15' },
      ],
      gaps: [
        'Slides og bog giver forskellige tal: WiFi-rækkevidde “app. 100 ft.” (slide 10) mod “a few tens of meters” (bog s. 47); LTE 100 Mbps (slide 10) og “4G cellular ~10 Mbps” (slide 13) mod “up to 60 Mbps” (bog s. 48) — slides er altså også uenige med sig selv; satellit 270 ms end-end (slide 13) mod 280 ms propagation (bog s. 51); Cat6 “250 Mbps/10 Gbps” (slide 11) mod “category 6a … 10 Gbps for distances up to a hundred meters” (bog s. 50).',
        'DSL, HFC/CMTS, FTTH/PON og 5G fixed wireless står kun i bogen. Slides nævner DSL og kabel kun som modemmet i hjemmenetværket (slide 8).',
        'PoP, multi-homing og bogens nummererede Network Structure 1–5 står kun i bogen; slides viser trinene som billeder uden navne. Sprint-tallene (slide 28) er fra Wikipedia, 2019, og står ikke i bogen.',
        UGER,
      ],
      keywords: ['host', 'end system', 'router', 'link-layer switch', 'ISP', 'RFC', 'IETF', 'access network', 'edge router', 'DSL', 'DSLAM', 'HFC', 'CMTS', 'DOCSIS', 'FTTH', 'PON', 'ONT', 'OLT', 'WiFi', 'LTE', '5G', 'twisted pair', 'coax', 'fiber', 'tier-1', 'IXP', 'peering', 'PoP', 'multi-homing', 'content provider', 'nuts and bolts', 'protokol'],
    },

    // ------------------------------------------------------------------ 2
    {
      slug: 'pakke-kredsloebskobling',
      title: 'Packet switching og circuit switching',
      short: 'Packet vs. circuit switching',
      week: 'Uge 1',
      definition:
        'Der er to grundlæggende måder at flytte data gennem et netværk. **Packet switching** sender pakker uden at reservere noget; de bruger links efter behov og må vente i kø. **Circuit switching** reserverer ressourcer (buffere, transmission rate) langs hele stien i hele sessionens varighed.',
      concepts: [
        {
          term: 'Pakker og store-and-forward',
          body: [
            'Afsenderen deler en besked op i pakker på **L** bit og sender dem ud på linket med **transmission rate R** (også kaldet link capacity eller link bandwidth). At skubbe én pakke ud tager **L/R** sekunder (slide 16; bog s. 53).',
            '**Store-and-forward**: en packet switch skal have hele pakken, før den sender første bit videre. Med én router og ingen propagation delay er pakken fremme efter **2L/R**. Sendes tre pakker efter hinanden, har destinationen dem alle efter **4L/R**, fordi kilden sender pakke 2, mens routeren sender pakke 1. Over **N** links med samme R er forsinkelsen for én pakke `d_end-to-end = N · L/R` (ligning 1.1, bog s. 53–54).',
            'Slide 17 regner et hop: `L = 7.5 Mbits`, `R = 1.5 Mbps` giver **5 s** transmission delay pr. hop.',
          ],
        },
        {
          term: 'Kø og pakketab',
          body: [
            'Hver packet switch har en **output buffer** (output queue) pr. link. Er linket optaget, venter pakken — ud over store-and-forward-forsinkelsen får den en variabel **queuing delay**, der afhænger af belastningen. Bufferen er endelig: er den fuld, bliver den ankommende pakke eller en allerede ventende **droppet** (bog s. 54–55; del 2, slide 3).',
            'Bogens fig. 1.12: A og B sender over 100 Mbps Ethernet til en router, der skal videre ud på et **15 Mbps**-link. Overstiger ankomstraten 15 Mbps i et kort interval, opstår der kø. Se [[forsinkelse-tab-throughput|Forsinkelse, tab og throughput]].',
          ],
        },
        {
          term: 'Forwarding og routing',
          body: [
            'Net core har to nøglefunktioner (slide 18). **Forwarding** er lokal: flyt en pakke fra routerens input til det rigtige output ved at slå headerværdien op i den lokale **forwarding table**. Slidens tabel: `0100 → 3`, `0101 → 2`, `0111 → 2`, `1001 → 1` — en pakke med `0111` sendes ud på link 2.',
            '**Routing** er global: routing-algoritmer bestemmer ruten fra kilde til destination og fylder tabellerne. I internettet står destinationens **IP-adresse** i headeren, og adressen er hierarkisk som en postadresse. Bogens analogi er Joe, der kører fra Philadelphia til 156 Lakeside Drive i Orlando og spørger om vej undervejs; hver tankstation læser kun den del af adressen, den har brug for (bog s. 55–56). Mere i [[ipv4-forwarding|IPv4 og forwarding]] og [[routing|Routing]].',
          ],
        },
        {
          term: 'Circuit switching: FDM og TDM',
          body: [
            'Telefonnettet er kredsløbskoblet: før der sendes, etablerer netværket en forbindelse — et **circuit** — og switchene på vejen holder **connection state**. Forbindelsen får en konstant, garanteret rate. Bogens fig. 1.13 har fire links med fire kredsløb hver; ved 1 Mbps pr. link får hver forbindelse **250 kbps** (bog s. 57).',
            'Et kredsløb laves med **FDM** (hver forbindelse får et fast frekvensbånd, i telefonnettet typisk 4 kHz) eller **TDM** (tiden deles i frames med faste slots, og forbindelsen får én slot pr. frame). Med 8.000 frames/s og 8 bit pr. slot får hvert kredsløb **64 kbps** (bog s. 58–59).',
            'Regneeksempel (bog s. 60): 640.000 bit over TDM med 24 slots på et 1.536 Mbps-link og 500 ms opsætning. Hvert kredsløb får 1.536 Mbps/24 = 64 kbps, så filen tager 10 s + 0.5 s = **10.5 s** — uanset hvor mange links kredsløbet går over.',
          ],
        },
        {
          term: 'Statistisk multiplexing: bogens tal',
          body: [
            'Et 1 Mbps-link deles af brugere, der sender 100 kbps, når de er aktive, og kun er aktive 10 % af tiden. Circuit switching skal reservere 100 kbps til hver hele tiden og kan derfor kun have **10** brugere. Med packet switching kan **35** brugere dele linket: sandsynligheden for 11 eller flere samtidigt aktive er ca. **0.0004**, så de næsten altid kommer igennem uden kø (bog s. 60–61).',
            'Andet eksempel: 10 brugere, og én sender pludselig 1.000 pakker à 1.000 bit (1 Mbit). Med TDM (10 slots pr. frame, 1.000 bit pr. slot) må brugeren kun bruge sin egen slot, og de ni andre står tomme: **10 s**. Med packet switching bruger den ene hele linkets 1 Mbps: **1 s** (bog s. 61).',
            'Kernen i forskellen: circuit switching **forhåndsallokerer** linket uanset behov; packet switching deler det **efter behov**, pakke for pakke. Kritikerne af packet switching peger på variabel, uforudsigelig forsinkelse, som er et problem for realtid (telefoni, video). Bogens restaurant-analogi: med eller uden bordbestilling.',
          ],
        },
      ],
      viz: 'knp-pakke-kredsloebskobling',
      keyPoints: [
        'Transmission delay for én pakke: `L/R`. Store-and-forward over N links: `N · L/R` (uden propagation).',
        'Hver udgang har en buffer; fuld buffer betyder pakketab.',
        'Forwarding = lokalt opslag i forwarding table. Routing = globalt: algoritmer, der fylder tabellerne.',
        'Circuit switching reserverer en fast rate (FDM: frekvensbånd, TDM: tidsslot) i hele forbindelsens levetid; ubrugt kapacitet går tabt.',
        'Packet switching deler efter behov: 35 i stedet for 10 brugere på 1 Mbps i bogens eksempel, og 1 s i stedet for 10 s for en enkelt burst.',
        'ISP’er, tier-1 og IXP’er: se [[internet-net-edge|Internettet, net edge og net core]].',
      ],
      exam: [
        'Ved store-and-forward skal en router modtage hele pakken, før den sender den videre; én pakke over N links med rate R tager derfor N·L/R, når propagation ignoreres.',
        'Packet switching reserverer ingen ressourcer, så pakker kan vente i routerens output buffer og tabes, når bufferen er fuld; circuit switching reserverer en fast rate langs hele stien.',
        'FDM giver hvert kredsløb et fast frekvensbånd, TDM giver det en fast tidsslot i hver frame; med 8.000 frames/s og 8 bit pr. slot får kredsløbet 64 kbps.',
        'Packet switching udnytter linket bedre, fordi brugerne sjældent er aktive samtidig: på et 1 Mbps-link kan 35 brugere dele i stedet for 10, og sandsynligheden for mere end 10 aktive er ca. 0.0004.',
      ],
      sources: [
        { path: S1, original: O1, pages: 'slide 15–18', note: 'Network core, L/R, store-and-forward, forwarding/routing' },
        { path: S2, original: O2, pages: 'slide 3', note: 'Kø og tab i router-buffere' },
        { path: BOG, pages: 's. 52–56', note: '1.3.1 Packet Switching: store-and-forward (lign. 1.1), queuing, forwarding tables' },
        { path: BOG, pages: 's. 57–61', note: '1.3.2 Circuit Switching: FDM/TDM, regneeksempler, packet vs. circuit' },
      ],
      gaps: [
        'Circuit switching står kun på slidenes roadmap (slide 2, 7, 14). FDM, TDM, regneeksemplerne og sammenligningen med packet switching er kun i bogen.',
        'Bogen udleder ikke 0.0004 i teksten; den henviser til hjemmeopgave P8 (binomialfordeling). Udledningen er ikke i materialet her.',
        'Markdown-konverteringen af slides del 1 har et eksempel med “L = 8000 bits, R = 1 Mbps → 8 ms”, som ikke står på slide 16. Brug slide 17’s tal (7.5 Mbits, 1.5 Mbps, 5 s).',
        UGER,
      ],
      keywords: ['packet switching', 'circuit switching', 'store-and-forward', 'L/R', 'transmission rate', 'output buffer', 'queue', 'packet loss', 'forwarding table', 'routing', 'forwarding', 'FDM', 'TDM', 'frame', 'slot', 'statistical multiplexing', 'pakkekobling', 'kredsløbskobling'],
    },

    // ------------------------------------------------------------------ 3
    {
      slug: 'forsinkelse-tab-throughput',
      title: 'Forsinkelse, tab og throughput',
      short: 'Delay, loss, throughput',
      week: 'Uge 1',
      definition:
        'En pakke får på hvert hop fire forsinkelser: `d_nodal = d_proc + d_queue + d_trans + d_prop`. Er routerens kø fuld, tabes pakken. **Throughput** er den rate, modtageren får data med; den er bestemt af **flaskehalslinket** på stien.',
      concepts: [
        {
          term: 'De fire forsinkelser på et hop',
          body: [
            '**d_proc** (nodal processing): læs headeren, find output-linket, tjek for bitfejl. Slides: “typically < msec”; bogen: mikrosekunder eller mindre i hurtige routere. **d_queue**: tiden i output-bufferen før linket; afhænger af belastningen, fra 0 (tom kø) til lang (del 2, slide 4; bog s. 65–66).',
            '**d_trans = L/R**: tiden til at skubbe alle pakkens bits ud på linket. **d_prop = d/s**: tiden for én bit at løbe linkets længde **d** med udbredelseshastigheden **s** — slides siger ~2×10⁸ m/s, bogen 2×10⁸–3×10⁸ m/s afhængigt af mediet (slide 5; bog s. 66–67).',
            'Størrelserne varierer: d_prop er et par mikrosekunder på et campus, men hundredvis af millisekunder over en geostationær satellit; d_trans er ubetydelig ved 10 Mbps og derover, men kan være hundredvis af ms over et dial-up-modem. d_proc er ofte ubetydelig, men sætter routerens maksimale throughput (bog s. 68–69).',
          ],
        },
        {
          term: 'Transmission er ikke propagation: karavanen',
          body: [
            'Transmission delay afhænger af pakkens længde og linkets rate, *ikke* af afstanden. Propagation delay afhænger af afstanden, *ikke* af pakken eller raten (bog s. 67).',
            'Bogens karavane (s. 67–68): 10 biler (bits) kører samlet (en pakke). Et betalingsanlæg (router) ekspederer én bil pr. 12 s, og der er 100 km til næste anlæg, som bilerne kører med 100 km/t. At få hele karavanen ud tager 10 biler / (5 biler/min) = **2 min** (transmission); turen tager 100 km / (100 km/t) = **1 time** (propagation). Fra karavanen står samlet ved ét anlæg, til den står ved det næste: **62 min**.',
            'Varianten: kører bilerne 1.000 km/t, og ekspederes én bil pr. minut, tager turen 6 min og ekspeditionen 10 min — de første biler når næste anlæg, før de sidste har forladt det første. Sådan er det også med bits på et link.',
          ],
        },
        {
          term: 'Traffic intensity og pakketab',
          body: [
            'Med gennemsnitlig ankomstrate **a** pakker/s, pakkelængde **L** og rate **R** er **traffic intensity** `La/R`. Er den over 1, kommer der flere bits ind, end linket kan sende, og køen vokser uden grænse. Bogens gyldne regel: “Design your system so that the traffic intensity is no greater than 1” (s. 69).',
            'Selv under 1 afhænger ventetiden af, hvordan pakkerne kommer. Periodisk (én pakke hver L/R) giver ingen kø. Kommer **N** pakker samtidig hver (L/R)·N sekunder, venter pakke nr. n `(n − 1) · L/R`. Når intensiteten nærmer sig 1, vokser den gennemsnitlige kø-forsinkelse brat (fig. 1.18; bog s. 69–70).',
            'Køen er endelig, så forsinkelsen går ikke mod uendelig; i stedet **droppes** pakker, og andelen af tabte pakker stiger med intensiteten. Set fra end systemet forsvinder pakken bare i kernen; den kan sendes igen ende-til-ende (bog s. 71; del 2, slide 3).',
          ],
        },
        {
          term: 'End-to-end delay og traceroute',
          body: [
            'Over **N** links i et ubelastet net: `d_end-end = N · (d_proc + d_trans + d_prop)` (ligning 1.2, bog s. 71). Slide 20 (del 2) er en opgave med tre links — 100 Mbps/3 km, 1000 Mbps/1000 km, 100 Mbps/3 km —, `L = 12000` bit og `s = 3×10⁸` m/s. Summen af transmission (0.12 + 0.012 + 0.12 ms) og propagation (0.01 + 3.333 + 0.01 ms) giver ca. **3.605 ms**; sliden har ingen facit, og tallet er regnet her.',
            '**Traceroute** sender pakker, der hver når én router længere ud, og routeren svarer tilbage; afsenderen måler rundturstiden. Det gentages tre gange pr. router (slide 6; bog s. 71–72). I slidens eksempel fra gaia.cs.umass.edu til www.eurecom.fr springer forsinkelsen fra 22 ms (hop 7) til 104 ms (hop 8): et transoceanisk link. `* * *` betyder intet svar (slide 7).',
            'Bogens eget eksempel (til Sorbonne, s. 72–73) viser også, at forsinkelsen til router 12 kan være mindre end til router 11, fordi kø-forsinkelsen svinger. Hvordan traceroute gør det, står først i kap. 5: TTL = 1, 2, 3 …, og routeren svarer med ICMP type 11 code 0 (bog s. 454–455).',
          ],
        },
        {
          term: 'Throughput og flaskehalslinket',
          body: [
            '**Instantaneous throughput** er den rate, B modtager med lige nu; **average throughput** er F/T for en fil på F bit, der tager T sekunder (bog s. 73–74).',
            'Med to links er throughput `min{Rs, Rc}` — raten på **bottleneck link**. En fil på F bit tager ca. `F / min{Rs, Rc}`: 32 Mbit med Rs = 2 Mbps og Rc = 1 Mbps tager **32 s**. Med N links er det `min{R1, …, RN}`. Kernen er i dag overdimensioneret, så flaskehalsen er typisk **access-nettet** (bog s. 74–75).',
            'Men et hurtigt link kan blive flaskehalsen, hvis mange strømme deler det: 10 downloads over et fælles 5 Mbps-link med Rs = 2 Mbps og Rc = 1 Mbps får hver kun **500 kbps** (fig. 1.20; bog s. 75–76).',
          ],
        },
      ],
      viz: 'knp-forsinkelse-tab-throughput',
      keyPoints: [
        '`d_nodal = d_proc + d_queue + d_trans + d_prop`. Kun d_queue varierer fra pakke til pakke.',
        '`d_trans = L/R` afhænger af pakke og rate; `d_prop = d/s` af afstand og medie.',
        'Traffic intensity `La/R` > 1 betyder en kø uden grænse; tæt på 1 vokser forsinkelsen brat.',
        'Fuld buffer = tabt pakke. Tabet stiger med intensiteten.',
        'Throughput = raten på flaskehalslinket; i dag oftest access-nettet, men et delt link i kernen kan tage over.',
        'Traceroute viser rundturstid pr. router, tre målinger pr. hop.',
      ],
      code: [
        {
          lang: 'text',
          title: 'traceroute fra gaia.cs.umass.edu til www.eurecom.fr (uddrag)',
          source: 'Chapter_1_(Computer Networks and the Internet - part 2).pdf, slide 7',
          code: `1 cs-gw (128.119.240.254) 1 ms 1 ms 2 ms
2 border1-rt-fa5-1-0.gw.umass.edu (128.119.3.145) 1 ms 1 ms 2 ms
3 cht-vbns.gw.umass.edu (128.119.3.130) 6 ms 5 ms 5 ms
4 jn1-at1-0-0-19.wor.vbns.net (204.147.132.129) 16 ms 11 ms 13 ms
5 jn1-so7-0-0-0.wae.vbns.net (204.147.136.136) 21 ms 18 ms 18 ms
6 abilene-vbns.abilene.ucaid.edu (198.32.11.9) 22 ms 18 ms 22 ms
7 nycm-wash.abilene.ucaid.edu (198.32.8.46) 22 ms 22 ms 22 ms
8 62.40.103.253 (62.40.103.253) 104 ms 109 ms 106 ms
9 de2-1.de1.de.geant.net (62.40.96.129) 109 ms 102 ms 104 ms
…
16 194.214.211.25 (194.214.211.25) 126 ms 128 ms 126 ms
17 * * *
18 * * *
19 fantasia.eurecom.fr (193.55.113.142) 132 ms 128 ms 136 ms`,
        },
      ],
      exam: [
        'På hvert hop består forsinkelsen af processing (header og bitfejl), queuing (ventetid i output-bufferen), transmission (L/R) og propagation (d/s); kun queuing varierer fra pakke til pakke.',
        'Transmission delay er tiden til at skubbe pakken ud på linket og afhænger af pakkelængde og rate; propagation delay er tiden for en bit at løbe linket og afhænger af afstand og medie.',
        'Traffic intensity La/R beskriver belastningen af et link; over 1 vokser køen uden grænse, og da bufferen er endelig, bliver pakker tabt.',
        'End-to-end throughput for en filoverførsel er raten på flaskehalslinket; uden anden trafik er det min{Rs, Rc}, som i dag typisk ligger i access-nettet.',
      ],
      sources: [
        { path: S2, original: O2, pages: 'slide 3–7', note: 'Tab og forsinkelse, fire forsinkelser, traceroute (slidenr. = PDF-side)' },
        { path: S2, original: O2, pages: 'slide 20', note: 'Opgave: end-end delay over tre links (ingen facit)' },
        { path: BOG, pages: 's. 65–71', note: '1.4.1 Overview of Delay, 1.4.2 Queuing Delay and Packet Loss' },
        { path: BOG, pages: 's. 71–76', note: '1.4.3 End-to-End Delay (traceroute), 1.4.4 Throughput' },
        { path: BOG, pages: 's. 454–455', note: '5.6 ICMP: hvordan traceroute bruger TTL og ICMP' },
      ],
      gaps: [
        'Throughput (1.4.4), traffic intensity og fig. 1.18 står kun i bogen. Slides nævner throughput kun i roadmappen. Markdown-konverteringen af del 2 tilføjer `ρ = La/R` under queueing delay, men det står ikke på slide 4.',
        'Slides og bog er uenige om størrelser: d_proc “typically < msec” (slide 4) mod “microseconds or less” (bog s. 66); s “~2x10⁸ m/sec” (slide 5) mod “2·10⁸ to 3·10⁸ meters/sec” (bog s. 67).',
        'Slide 20 har ingen facit. Markdown-konverteringen giver 3.602 ms, men den afrunder propagation på link 2 til 3.33 ms; med 1.000.000 m / 3×10⁸ m/s = 3.333 ms bliver summen 3.605 ms.',
        'Slides og bog bruger forskellige traceroute-eksempler (eurecom.fr på slide 7, Sorbonne i bogen s. 72). Markdown-konverteringen nævner TTL og ICMP Time Exceeded under slide 6, men det står ikke på sliden; i bogen kommer det først i 5.6.',
        UGER,
      ],
      keywords: ['delay', 'nodal delay', 'processing delay', 'queuing delay', 'transmission delay', 'propagation delay', 'd_nodal', 'L/R', 'd/s', 'traffic intensity', 'La/R', 'packet loss', 'end-to-end delay', 'traceroute', 'RTT', 'throughput', 'bottleneck link', 'flaskehals', 'caravan', 'karavane', 'forsinkelse'],
    },

    // ------------------------------------------------------------------ 4
    {
      slug: 'lagdeling-indkapsling',
      title: 'Protokollag og indkapsling',
      short: 'Lagdeling og indkapsling',
      week: 'Uge 1',
      definition:
        'Internettets protokoller er organiseret i fem lag — **application, transport, network, link, physical**. Hvert lag leverer en service til laget over (*service model*) ved at gøre sit eget arbejde og bruge laget under. Ved afsendelse lægger hvert lag sin **header** om data fra laget over: det er **indkapsling**.',
      concepts: [
        {
          term: 'Hvorfor lagdeling',
          body: [
            'Bogens analogi er en flyrejse (fig. 1.21–1.22, s. 77–78): billet, bagage, gate, start/landing og flyrouting. Hvert “lag” har en funktion i begge ender og bruger laget under — bagagelaget flytter kun passagerer, der allerede har billet.',
            'Slide 10 giver to gevinster: en eksplicit struktur, som man kan tale om (*layered reference model*), og **modularisering**: man kan ændre et lags *implementering* uden at resten mærker det, fx “change in gate procedure doesn’t affect rest of system”. Bogen understreger, at det er implementeringen, ikke selve servicen, der må ændres (s. 78–79).',
            'Bogen nævner også ulemperne (s. 79): et lag kan gentage funktionalitet fra et lavere (fejlretning både pr. link og ende-til-ende), og et lag kan have brug for information, der kun findes i et andet (fx et tidsstempel).',
          ],
        },
        {
          term: 'Service model og hvor lagene bor',
          body: [
            'Et lags **service model** er de services, det tilbyder laget over. Eksempel: lag n kan levere pålidelig levering ved at bruge en upålidelig service fra lag n − 1 og selv opdage og gensende tabte beskeder (bog s. 79) — præcis hvad TCP gør oven på IP, se [[paalidelig-overfoersel|Pålidelig dataoverførsel]].',
            'Application- og transportlaget er næsten altid software i end systems. Link- og fysisk lag ligger typisk i et **netværkskort** (Ethernet- eller WiFi-interface). Netværkslaget er en blanding af hardware og software. En lag-n-protokol er fordelt over end systems, switches og routere (bog s. 79).',
          ],
        },
        {
          term: 'De fem lag',
          body: [
            '**Application** — netværksapplikationer og deres protokoller: HTTP, SMTP, FTP og DNS. Pakken hedder en **message** (bog s. 80; slide 11). Se [[http|HTTP]] og [[dns|DNS]].',
            '**Transport** — flytter beskeder mellem applikationernes endepunkter (*process-process*). **TCP** er forbindelsesorienteret med garanteret levering, flow control, opdeling af lange beskeder og congestion control; **UDP** er “no-frills” uden nogen af delene. Pakken hedder et **segment** (bog s. 80–81). Se [[udp-mux-demux|UDP]] og [[tcp-forbindelse|TCP-forbindelsen]].',
            '**Network** — flytter **datagrams** fra host til host. Der er kun én IP-protokol, og alt med et netværkslag skal køre den; dertil mange routing-protokoller. Kaldes ofte bare *IP-laget* (bog s. 81). Se [[ipv4-forwarding|IPv4]].',
            '**Link** — flytter pakken fra én node til den næste: Ethernet, WiFi, DOCSIS, PPP. Et datagram kan møde forskellige link-protokoller på vejen, og et links pålidelighed er ikke det samme som TCP’s ende-til-ende-pålidelighed. Pakken hedder en **frame**. **Physical** flytter de enkelte bits og afhænger af mediet (bog s. 81–82). Se [[ethernet-mac-arp|Ethernet, MAC og ARP]].',
          ],
        },
        {
          term: 'Indkapsling ned og op gennem stakken',
          body: [
            'Hos afsenderen giver applikationen beskeden **M** til transportlaget, der tilføjer **Ht** (bl.a. information til at levere til den rigtige applikation og fejldetektionsbits): segmentet `Ht M`. Netværkslaget tilføjer **Hn** (bl.a. afsender- og modtageradresse): datagrammet `Hn Ht M`. Linklaget tilføjer **Hl**: rammen `Hl Hn Ht M`. På hvert lag består pakken af **header** og **payload**, og payload er pakken fra laget over (bog s. 83; del 2, slide 13).',
            'Undervejs pakker hver node kun så langt op, som den har lag. En **link-layer switch** har lag 1–2 og kender Ethernet-adresser, men ikke IP-adresser. En **router** har lag 1–3 og kører IP. Kun **hosts** har alle fem lag — internettets kompleksitet ligger i kanten (bog s. 82–83). Hos modtageren fjernes headerne i omvendt rækkefølge, til applikationen får M.',
            'Bogens analogi (s. 83–84): Alices memo (message) lægges i en intern kuvert med Bobs navn og afdeling (segment), som postrummet lægger i en postkuvert med filialernes adresser (datagram). Hos modtageren pakkes kuverterne ud igen. En stor besked kan deles i flere segmenter, der igen kan deles i flere datagrammer.',
            'Wireshark (del 2, slide 23) udnytter indkapslingen: *packet capture* (pcap) tager en kopi af alle Ethernet-frames, og *packet analyzer* pakker dem ud lag for lag.',
          ],
        },
        {
          term: 'ISO/OSI: syv lag',
          body: [
            'Slide 12 viser ISO/OSI-referencemodellen med to lag mere mellem application og transport: **presentation** (lader applikationer fortolke data: kryptering, komprimering, maskinspecifikke konventioner) og **session** (synkronisering, checkpointing, genopretning af dataudveksling).',
            'Internetstakken “mangler” de to lag. Har en applikation brug for de services, må den selv implementere dem i applikationslaget (slide 12).',
          ],
        },
      ],
      viz: 'knp-lagdeling-indkapsling',
      keyPoints: [
        'Fem lag: application (message), transport (segment), network (datagram), link (frame), physical (bits).',
        'Hvert lag = egne handlinger + service fra laget under. Implementeringen kan skiftes; servicen ikke.',
        'Indkapsling: `M` → `Ht M` → `Hn Ht M` → `Hl Hn Ht M`. Payload = pakken fra laget over.',
        'Switch: lag 1–2 (MAC). Router: lag 1–3 (IP). Host: alle fem.',
        'TCP er pålidelig ende-til-ende; et links pålidelighed gælder kun ét hop.',
        'OSI har syv lag (+ presentation og session); internettet lægger dem i applikationen.',
      ],
      exam: [
        'Internetstakken har fem lag; hvert lag leverer en service til laget over ved at udføre sine egne handlinger og bruge servicen fra laget under, så et lags implementering kan skiftes uden at påvirke resten.',
        'Ved indkapsling tilføjer transport-, netværks- og linklaget hver sin header, så en besked bliver til et segment, et datagram og en frame; modtageren fjerner headerne i omvendt rækkefølge.',
        'En link-layer switch implementerer lag 1–2 og kender kun linklagsadresser, en router implementerer lag 1–3 og kører IP, mens hosts implementerer alle fem lag.',
        'OSI-modellen har desuden et presentation- og et session-lag; i internettet må applikationen selv levere de services, hvis den har brug for dem.',
      ],
      sources: [
        { path: S2, original: O2, pages: 'slide 9–13', note: 'Lagdeling, internetstakken, ISO/OSI, indkapsling (slidenr. = PDF-side)' },
        { path: S2, original: O2, pages: 'slide 23', note: 'Additional slides: Wireshark, pcap og packet analyzer' },
        { path: BOG, pages: 's. 77–82', note: '1.5.1 Layered Architecture: flyrejsen, service model, de fem lag' },
        { path: BOG, pages: 's. 82–84', note: '1.5.2 Encapsulation, fig. 1.24' },
      ],
      gaps: [
        'ISO/OSI (presentation og session) står kun på slide 12. Bogens 8. udgave (Global Edition) nævner ikke OSI i afsnit 1.5.',
        'Slides siger ikke, om en router bygger en ny frame til næste link. Bogen siger, at netværkslaget på hver node giver datagrammet til linklaget, som leverer det til næste node (s. 81), og fig. 1.24 viser `Hl` på begge sider af routeren uden at skelne. Markdown-konverteringen af del 2 skriver “processes/creates H_l”, som ikke står på slide 13.',
        'Bogens ulemper ved lagdeling (dobbelt funktionalitet, information på tværs af lag, s. 79) står ikke på slides.',
        'Afsnit 1.6 Networks Under Attack (del 2, slide 15–19; bog s. 84–88: malware, botnets, DoS i tre varianter — vulnerability attack, bandwidth flooding, connection flooding —, DDoS, packet sniffing, IP spoofing) og 1.7 History (bog s. 88–94) har ingen egne emner. Slides siger selv, at sikkerhed kommer igen “throughout, Chapter 8”.',
        UGER,
      ],
      keywords: ['layering', 'lagdeling', 'protocol stack', 'service model', 'application layer', 'transport layer', 'network layer', 'link layer', 'physical layer', 'encapsulation', 'indkapsling', 'header', 'payload', 'message', 'segment', 'datagram', 'frame', 'OSI', 'presentation', 'session', 'router', 'link-layer switch', 'Wireshark', 'pcap'],
    },
  ],
}
