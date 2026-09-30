import type { Part } from '../types'
import { BOG, k, sem3 } from './paths'

/* P3 Socketprogrammering. Kilder: Kurose & Ross afsnit 2.7 (bogsider 182–195; PDF-side =
   bogside + 2 i kapitel 2 og 3) og demo-/skabelonkoden i Frederiks 3.-semestermappe
   (sem3/knp/Socket/…), som ikke ligger i kursusmaterialet under context/. */

const DEMO_NOTE =
  'Demokode (Michael Alrøe, “Based on example: linuxhowtos.org”) fra Frederiks 3.-semestermappe — ikke kursusmateriale i `context/`. Arkivsti i zip: `ngk-master-DemoSocket/DemoSocket/…`'

const UGE_GAP = 'Der findes ingen lektionsplan for KNP; ugen er vejledende efter bogens rækkefølge (sockets efter applikationslaget).'

export const sockets: Part = {
  id: 'sockets',
  title: 'Socketprogrammering',
  topics: [
    // ─────────────────────────────────────────────────────────────── UDP
    {
      slug: 'sockets-udp',
      title: 'Socketprogrammering med UDP',
      short: 'UDP-sockets',
      week: 'Uge 3',
      definition:
        'En **socket** er døren mellem en applikationsproces og transportlaget. En UDP-socket (`SOCK_DGRAM`) har ingen forbindelse: afsenderen hæfter en destinationsadresse — værtens IP-adresse og socketens portnummer — på hver pakke og skubber den ud med `sendto`; modtageren får både data og afsenderens adresse med `recvfrom`.',
      intro: [
        'Bogen bruger samme lille applikation til UDP og TCP: klienten læser en linje fra tastaturet og sender den; serveren laver bogstaverne om til store og sender linjen tilbage; klienten viser svaret (s. 185). Koden er Python 3, fordi den “clearly exposes the key socket concepts” (s. 183). Frederiks demokode fra 3. semester gør det samme i C.',
      ],
      concepts: [
        {
          term: 'Socket, proces og port',
          body: [
            'En proces er et hus, og dens socket er døren: processen skubber beskeden ud ad døren og regner med, at transportinfrastrukturen på den anden side bringer den frem (s. 117). Socketen er derfor **API’et** mellem applikationen og netværket. Udvikleren styrer alt på applikationssiden, men på transportsiden kun valget af protokol og måske et par parametre som bufferstørrelser (s. 117–118).',
            'Destinationsadressen består af værtens **IP-adresse**, som routerne bruger til at finde værten, og socketens **portnummer**, fordi en vært kan køre mange processer med hver sine sockets (s. 184). Afsenderadressen hæftes også på pakken, men det gør operativsystemet automatisk, ikke UDP-koden (s. 185).',
          ],
        },
        {
          term: 'Klienten: socket, sendto, recvfrom, close',
          body: [
            '`socket(AF_INET, SOCK_DGRAM)` laver klientens socket. `AF_INET` betyder IPv4, og `SOCK_DGRAM` betyder UDP. Klienten angiver ikke sit eget portnummer; det gør operativsystemet (s. 187) — transportlaget vælger en ledig port mellem 1024 og 65535 (s. 219).',
            '`sendto(message.encode(), (serverName, serverPort))` laver strengen om til bytes, hæfter destinationen på og sender pakken ind i socketen. `serverName` kan være en IP-adresse eller et værtsnavn; ved et navn laves der automatisk et DNS-opslag (s. 186–187, se [[dns|DNS]]).',
            '`recvfrom(2048)` venter på en pakke og returnerer dens data og afsenderens adresse (IP og port). 2048 er bufferstørrelsen, “This buffer size works for most purposes” (s. 187). `close()` lukker socketen, og processen slutter (s. 188).',
          ],
        },
        {
          term: 'Serveren: bind og løkken',
          body: [
            'Serveren skal køre, før klienten sender (s. 186). Den første linje, der adskiller sig fra klienten, er `serverSocket.bind((\'\', serverPort))`: udvikleren tildeler selv port 12000 til socketen, så alt, der sendes til port 12000 på serverens IP-adresse, havner her (s. 188). Portnummeret er valgt vilkårligt; en proprietær applikation skal holde sig fra de velkendte portnumre (s. 183, 186).',
            'I `while True`-løkken giver `recvfrom` beskeden og `clientAddress`. Adressen er returadressen, som på et brev: serveren sender svaret med `sendto(modifiedMessage.encode(), clientAddress)` og venter derefter på næste pakke “from any client running on any host” (s. 188–189).',
            'En UDP-socket er fuldt identificeret af to værdier, destinationens IP-adresse og port. Derfor lander pakker fra alle klienter i den samme serversocket, og afsenderens port er det eneste, der skiller dem ad, når der skal svares (s. 220, se [[udp-mux-demux|multiplexing og demultiplexing]]).',
          ],
        },
        {
          term: 'Ingen forbindelse, ingen garanti',
          body: [
            'UDP er forbindelsesløs og sender uafhængige pakker “without any guarantees about delivery” (s. 183); der er ingen handshake, før processerne begynder at kommunikere, og beskeder kan gå tabt eller komme i forkert rækkefølge (s. 122). Bogens kode håndterer ingen fejl: “Good code” ville have flere linjer, “in particular for handling error cases” (s. 186).',
            'UDP-sockets bevarer **beskedgrænser**, hvor TCP-sockets behandler data som en byte-strøm (opgave P31, s. 205). Et `sendto` er altså én pakke, som modtageren henter hel med ét `recvfrom`.',
            'Fordi en pakke kan forsvinde, kan en klient ikke vente for evigt. Bogens UDP Pinger-opgave siger det direkte: klienten skal vente højst ét sekund på svar og ellers antage, at pakken er tabt (s. 206). Hverken bogens klient eller demokoden har en sådan timeout.',
          ],
        },
        {
          term: 'Den samme server i C',
          body: [
            'I `server_udp.c` er kaldene de samme, men adressen skrives ud i en `struct sockaddr_in`: `sin_family = AF_INET`, `sin_addr.s_addr = INADDR_ANY` og `sin_port = htons(atoi(argv[1]))`, og portnummeret kommer fra kommandolinjen (l. 38–45). Løkken kalder `recvfrom` og sender samme tekst tilbage med `sendto` til adressen i `from` — en ekkoserver, ikke store bogstaver (l. 48–56).',
            'Klienten `client_udp.c` slår serverens navn op med `gethostbyname` (l. 37–41) — det opslag, Python gør automatisk — og læser linjen med `fgets` (l. 45), før den kalder `sendto` og `recvfrom` (l. 47–52).',
          ],
        },
      ],
      viz: 'knp-sockets-udp',
      keyPoints: [
        '`SOCK_DGRAM` = UDP. Ingen forbindelse og ingen handshake: hver pakke får sin destinationsadresse med i `sendto`.',
        'Destinationsadresse = IP-adresse (finder værten) + portnummer (finder socketen).',
        'Serveren kalder `bind` med en fast port; klientens port vælges af operativsystemet.',
        '`recvfrom` giver både data og afsenderens adresse — serverens returadresse.',
        'UDP bevarer beskedgrænser, men garanterer ikke levering; en klient bør have en timeout.',
      ],
      code: [
        {
          lang: 'python',
          title: 'UDPClient.py',
          source: 'Kurose & Ross s. 186',
          code: `from socket import *
serverName = 'hostname'
serverPort = 12000
clientSocket = socket(AF_INET, SOCK_DGRAM)
message = input('Input lowercase sentence:')
clientSocket.sendto(message.encode(),(serverName, serverPort))
modifiedMessage, serverAddress = clientSocket.recvfrom(2048)
print(modifiedMessage.decode())
clientSocket.close()`,
        },
        {
          lang: 'python',
          title: 'UDPServer.py',
          source: 'Kurose & Ross s. 188',
          code: `from socket import *
serverPort = 12000
serverSocket = socket(AF_INET, SOCK_DGRAM)
serverSocket.bind(('', serverPort))
print("The server is ready to receive")
while True:
    message, clientAddress = serverSocket.recvfrom(2048)
    modifiedMessage = message.decode().upper()
    serverSocket.sendto(modifiedMessage.encode(), clientAddress)`,
        },
        {
          lang: 'c',
          title: 'UDP-ekkoserver i C (uddrag)',
          source: 'sem3/knp/Socket/DemoSocket.zip → DemoSocket/UDP/server/server_udp.c l. 35–56',
          code: `sock=socket(AF_INET, SOCK_DGRAM, 0);
if (sock < 0) error("ERROR, socket");

bzero(&server,sizeof(server));
server.sin_family=AF_INET;
server.sin_addr.s_addr=INADDR_ANY;
server.sin_port=htons(atoi(argv[1]));

printf("Binding...\\n");
if (bind(sock,(struct sockaddr *)&server,sizeof(server))<0)
    error("ERROR, binding");

fromlen = sizeof(from);
while (1) {
    printf("Receive...\\n");
    n = recvfrom(sock,buf,sizeof(buf),0,(struct sockaddr*)&from,&fromlen);
    if (n < 0) error("ERROR, recvfrom");
    buf[n]=0;  //handle null termination
    printf("Received a datagram: %s", buf);
    n = sendto(sock,buf, strlen(buf),0,(struct sockaddr*)&from,fromlen);
    if (n  < 0) error("ERROR, sendto");
}`,
        },
      ],
      exam: [
        'En socket er grænsefladen mellem applikationen og transportlaget. Med UDP opretter jeg en SOCK_DGRAM-socket og sender hver besked som en selvstændig pakke med destinationens IP-adresse og portnummer.',
        'Serveren binder sin socket til et fast portnummer og kører i en løkke med recvfrom, som giver både beskeden og klientens adresse. Den adresse bruger serveren som returadresse, når den svarer med sendto.',
        'Der er ingen forbindelse og ingen handshake, og UDP garanterer ikke levering. Derfor skal en klient, der venter på svar, have en timeout og selv afgøre, hvad et tabt svar betyder.',
        'UDP bevarer beskedgrænserne: det, der sendes med ét sendto, modtages som én pakke — i modsætning til TCP’s byte-strøm.',
      ],
      sources: [
        { path: BOG, pages: 's. 182–189', note: 'Ingen slides — kun bog. Afsnit 2.7 og 2.7.1, figur 2.27 (s. 185), UDPClient.py (s. 186), UDPServer.py (s. 188)' },
        { path: BOG, pages: 's. 117–118, 122', note: 'Socket som dør/API (figur 2.3); UDP-tjenesten uden handshake' },
        { path: BOG, pages: 's. 205–206', note: 'Opgave P31 (byte-strøm vs. beskedgrænser) og Assignment 2: UDP Pinger (timeout på ét sekund)' },
        { path: BOG, pages: 's. 219–220', note: 'Klientport 1024–65535 vælges automatisk; UDP-socket identificeres af to værdier' },
        { path: sem3('Socket/DemoSocket.zip'), pages: 'UDP/server/server_udp.c l. 33–56, UDP/client/client_udp.c l. 31–55', note: DEMO_NOTE },
      ],
      gaps: [
        'Bogen forklarer ikke, hvad den tomme streng i `bind((\'\', serverPort))` betyder, og intet i materialet forklarer `INADDR_ANY` eller `htons` (netværksbyteorden) fra C-koden. Ikke dækket af materialet.',
        'Bogen siger ikke, hvad der sker med et datagram, der er større end bufferen i `recvfrom(2048)` — kun at størrelsen “works for most purposes” (s. 187).',
        'Uden for materialet (egen gennemlæsning af C-koden): i `server_udp.c` er `buf` 256 bytes, og `recvfrom` må fylde alle 256 (l. 50); så skriver `buf[n]=0` (l. 52) én byte uden for bufferen. I `client_udp.c` sættes `buf[n]=0` (l. 50), før `n < 0` tjekkes (l. 51).',
        'Ingen af de to klienter har en timeout på `recvfrom`; går svaret tabt, venter de for evigt. Bogen beskriver timeouten som krav i UDP Pinger-opgaven (s. 206), men viser ikke koden til den.',
        UGE_GAP,
      ],
      keywords: ['UDP', 'socket', 'SOCK_DGRAM', 'AF_INET', 'sendto', 'recvfrom', 'bind', 'datagram', 'port', 'portnummer', 'UDPClient', 'UDPServer', 'connectionless', 'forbindelsesløs', 'INADDR_ANY', 'htons'],
    },

    // ─────────────────────────────────────────────────────────────── TCP
    {
      slug: 'sockets-tcp',
      title: 'Socketprogrammering med TCP',
      short: 'TCP-sockets',
      week: 'Uge 3',
      definition:
        'Med TCP (`SOCK_STREAM`) skal klient og server etablere en forbindelse, før der sendes data. Serveren har en **welcoming socket**, som klienten “banker på” med `connect`; `accept()` laver en ny **connection socket** til netop den klient. Derefter er klientens socket og serverens connection socket forbundet af et rør, hvor bytes kommer frem pålideligt og i rækkefølge.',
      concepts: [
        {
          term: 'Forbindelsen kommer først',
          body: [
            'TCP er forbindelsesorienteret: før klient og server kan sende data, skal de lave et handshake og etablere en TCP-forbindelse, der knyttes til klientens og serverens socketadresse (IP-adresse og port). Derefter “drops” en side bare data ind i forbindelsen via sin socket — der hæftes ingen destinationsadresse på hver pakke som ved UDP (s. 189–190).',
            'Serveren skal køre som proces og have en særlig socket, der tager imod den første kontakt fra en klient på en vilkårlig vært (s. 190). Klienten opretter sin TCP-socket med `socket(AF_INET, SOCK_STREAM)`, og `connect((serverName, serverPort))` starter en **three-way handshake**. Den foregår i transportlaget og er “completely invisible to the client and server programs” (s. 190, 192–193). Selve handshaken står under [[tcp-forbindelse|TCP-forbindelsen]].',
          ],
        },
        {
          term: 'Welcoming socket og connection socket',
          body: [
            'Serveren binder `serverSocket` til port 12000 ligesom UDP-serveren, men her er socketen en **welcoming socket**. `serverSocket.listen(1)` får den til at lytte efter forbindelsesanmodninger; parameteren er det største antal forbindelser i kø, mindst 1 (s. 194).',
            'Når en klient banker på, kalder serveren `accept()`, som laver en **ny** socket, `connectionSocket`, dedikeret til den klient; så gør klient og server handshaken færdig (s. 194). Figur 2.28 hedder derfor “The TCPServer process has two sockets” (s. 191). Bogen advarer om, at nye studerende ofte forveksler de to (s. 190).',
            'Efter svaret lukker serveren `connectionSocket`. `serverSocket` er stadig åben, så en anden klient kan banke på (s. 194). En connection socket er identificeret af fire værdier — kildens og destinationens IP-adresse og port — så to klienter på port 12000 havner i hver sin socket (s. 220–222, se [[udp-mux-demux|multiplexing og demultiplexing]]).',
          ],
        },
        {
          term: 'Et rør af bytes',
          body: [
            'Set fra applikationen er klientens socket og serverens connection socket forbundet af et **rør**: klienten kan sende vilkårlige bytes ind, og TCP garanterer, at serveren modtager hver byte i den rækkefølge, den blev sendt. Samme socket bruges begge veje (s. 190). `clientSocket.send(sentence.encode())` bygger ingen pakke og hæfter ingen adresse på; programmet “simply drops the bytes” i forbindelsen (s. 193).',
            'TCP-sockets behandler data som en **byte-strøm**, mens UDP-sockets kender beskedgrænser (opgave P31, s. 205). Et `recv` returnerer altså bytes, ikke en besked — hvor en besked slutter, må applikationen selv afgøre. Det er grunden til, at en filserver har brug for en lille protokol (se [[sockets-filserver|filoverførsel over TCP]]).',
          ],
        },
        {
          term: 'close og flere klienter',
          body: [
            '`clientSocket.close()` lukker socketen og dermed TCP-forbindelsen; det får TCP i klienten til at sende en TCP-besked til TCP i serveren (s. 193, afsnit 3.5).',
            'Bogens server betjener én klient ad gangen i en `while True`-løkke (s. 194). Om rigtige webservere skriver bogen, at de kan starte en ny proces pr. forbindelse eller, oftere, én proces med en ny tråd og en ny connection socket pr. klient; så kan mange connection sockets høre til samme proces (s. 224).',
          ],
        },
        {
          term: 'Den samme server i C',
          body: [
            '`server.c` følger figur 2.29: `socket(AF_INET, SOCK_STREAM, 0)` (l. 40), `bind` (l. 45–51), `listen(sockfd,5)` med en kø på 5 i stedet for bogens 1 (l. 54), og en `for (;;)`-løkke, hvor `accept` returnerer den nye socket `newsockfd` (l. 58–64). Serveren læser og skriver med de almindelige `read` og `write` på socketen og lukker `newsockfd` efter hvert svar (l. 66–77).',
            '`client.c` slår værten op med `gethostbyname` (l. 40), kalder `connect` (l. 51), sender med `write` (l. 56) og læser svaret med `recv(sockfd, buffer, sizeof(buffer), MSG_WAITALL)`. Kommentaren siger, at kaldet “waits for full buffer or connection close” (l. 62) — klienten får altså først svaret, når serveren lukker forbindelsen, fordi svaret er kortere end bufferen.',
          ],
        },
      ],
      viz: 'knp-sockets-tcp',
      keyPoints: [
        '`SOCK_STREAM` = TCP. `connect` starter three-way handshaken; programmet ser den ikke.',
        'Welcoming socket (`listen`) tager imod alle klienter; `accept()` laver en ny connection socket pr. klient.',
        'Efter forbindelsen sendes bytes uden adresse — TCP leverer dem pålideligt og i rækkefølge.',
        'Byte-strøm uden beskedgrænser: applikationen må selv markere, hvor en besked slutter.',
        'Lukkes connection socket, er welcoming socket stadig åben for næste klient.',
      ],
      code: [
        {
          lang: 'python',
          title: 'TCPClient.py',
          source: 'Kurose & Ross s. 191',
          code: `from socket import *
serverName = 'servername'
serverPort = 12000
clientSocket = socket(AF_INET, SOCK_STREAM)
clientSocket.connect((serverName,serverPort))
sentence = input('Input lowercase sentence:')
clientSocket.send(sentence.encode())
modifiedSentence = clientSocket.recv(1024)
print('From Server: ', modifiedSentence.decode())
clientSocket.close()`,
        },
        {
          lang: 'python',
          title: 'TCPServer.py',
          source: 'Kurose & Ross s. 193–194',
          code: `from socket import *
serverPort = 12000
serverSocket = socket(AF_INET,SOCK_STREAM)
serverSocket.bind(('',serverPort))
serverSocket.listen(1)
print('The server is ready to receive')
while True:
    connectionSocket, addr = serverSocket.accept()
    sentence = connectionSocket.recv(1024).decode()
    capitalizedSentence = sentence.upper()
    connectionSocket.send(capitalizedSentence.encode())
    connectionSocket.close()`,
        },
        {
          lang: 'c',
          title: 'TCP-server i C: listen, accept og en ny socket pr. klient (uddrag)',
          source: 'sem3/knp/Socket/DemoSocket.zip → DemoSocket/TCP/server/server.c l. 53–79',
          code: `printf("Listen...\\n");
listen(sockfd,5);

clilen = sizeof(cli_addr);

for (;;)
{
    printf("Accept...\\n");
    newsockfd = accept(sockfd, (struct sockaddr *) &cli_addr, &clilen);

    if (newsockfd < 0) error("ERROR on accept");
    else printf("Accepted\\n");

    bzero(bufferRx,sizeof(bufferRx));
    n = read(newsockfd,bufferRx,sizeof(bufferRx));

    if (n < 0) error("ERROR reading from socket");
    printf("Message: %s\\n",(char*)bufferRx);

    snprintf((char*)bufferTx, sizeof(bufferTx), "Got message: %s",(char*)bufferRx);

    n = write(newsockfd,bufferTx,strlen((char*)bufferTx));
    if (n < 0) error("ERROR writing to socket");

    close(newsockfd);
}
close(sockfd);`,
        },
      ],
      exam: [
        'Med TCP skal der oprettes en forbindelse først. Klienten kalder connect mod serverens welcoming socket, og transportlaget laver three-way handshaken uden at programmet ser den.',
        'Serveren har to slags sockets: welcoming socket, der lytter på den kendte port, og en ny connection socket, som accept() laver til hver klient. Den kan identificeres af de fire værdier kilde- og destinations-IP og -port.',
        'Når forbindelsen er oppe, er der et pålideligt rør af bytes begge veje. Der er ingen beskedgrænser, så vores protokol skal selv markere, hvor en besked slutter.',
        'Når serveren lukker connection socket, er welcoming socket stadig åben, så næste klient kan forbinde. Vil man betjene flere samtidig, giver man hver forbindelse sin egen tråd eller proces.',
      ],
      sources: [
        { path: BOG, pages: 's. 189–195', note: 'Ingen slides — kun bog. Afsnit 2.7.2, figur 2.28 (s. 191), TCPClient.py (s. 191), figur 2.29 (s. 192), TCPServer.py (s. 193–194)' },
        { path: BOG, pages: 's. 205', note: 'Opgave P31: TCP-sockets som byte-strøm, UDP-sockets med beskedgrænser' },
        { path: BOG, pages: 's. 220–224', note: 'TCP-socket identificeres af fire værdier; welcoming socket på port 12000; webservere med tråd pr. forbindelse' },
        { path: sem3('Socket/DemoSocket.zip'), pages: 'TCP/server/server.c l. 40–79, TCP/client/client.c l. 36–68', note: DEMO_NOTE },
      ],
      gaps: [
        'Bogen er uenig med sig selv: kodelisten til TCPClient.py kalder `clientSocket.recv(1024)` (s. 191), men gennemgangen af samme linje skriver `recv(2048)` (s. 193).',
        'Bogen skriver, at tegnene “continue to accumulate in modifiedSentence until the line ends with a carriage return character” (s. 193), men koden kalder `recv` én gang og leder ikke efter linjeskift. Bogen forklarer ikke, at ét `recv` kan returnere færre bytes end der blev sendt; det følger kun indirekte af byte-strømmen (s. 205).',
        'Hvordan en server betjener flere klienter samtidig (tråde eller processer), nævnes kun i én sætning (s. 224); der er ingen kode til det i bogen eller i demokoden.',
        'Uden for materialet (egen gennemlæsning af C-koden): `bufferRx` i `server.c` er 200 bytes, og `read` må fylde dem alle (l. 67), så der er ikke plads til den afsluttende nulbyte, som `printf("%s")` kræver (l. 70). Det samme gælder `client.c`, hvor `recv` med `MSG_WAITALL` kan fylde alle 256 bytes (l. 62).',
        UGE_GAP,
      ],
      keywords: ['TCP', 'socket', 'SOCK_STREAM', 'connect', 'listen', 'accept', 'welcoming socket', 'connection socket', 'serverSocket', 'connectionSocket', 'byte stream', 'byte-strøm', 'three-way handshake', 'close', 'MSG_WAITALL', 'TCPClient', 'TCPServer'],
    },

    // ─────────────────────────────────────────────────────────────── Filserver
    {
      slug: 'sockets-filserver',
      title: 'Filoverførsel over TCP: klient/server-protokol',
      short: 'Filserver over TCP',
      week: 'Uge 3',
      definition:
        'En filserver over TCP kræver en lille **applikationsprotokol** oven på byte-strømmen: hvad klienten sender først (filnavnet), hvordan serveren fortæller filens størrelse, og hvordan modtageren ved, hvornår filen er slut. Skabelonen til Exercise 6 giver byggestenene i `iknlib.c`; selve serveren og klienten er tomme.',
      intro: [
        'Emnet bygger kun på Frederiks 3.-semesterfiler: skabelonen `Exercise6_template` (en server- og en klientmappe med `file_server.cpp`, `file_client.cpp` og hver sin kopi af `iknlib.c`/`iknlib.h`) og demoen `DemoFile.zip` om fil-I/O. Opgaveteksten findes ikke. Alt, hvad der står om protokollen ud over skabelonens egen kode, er mærket.',
      ],
      concepts: [
        {
          term: 'Hvad skabelonen indeholder',
          body: [
            '`iknlib.h` fastlægger `PORT 9000` og `BUFSIZE 1000` og erklærer fem hjælpefunktioner: `readTextTCP`, `writeTextTCP`, `readFileSizeTCP`, `extractFileName` og `getFilesize` (l. 4–15). De to kopier af `iknlib.c` er ens, bortset fra et parameternavn i `readFileSizeTCP`.',
            '`file_server.cpp` har en funktion `sendFile(int clientSocket, const char* fileName, long fileSize)`, der kun udskriver navn og størrelse (l. 25–31), og en `main`, der udskriver “Starting server...” og returnerer 0 (l. 34–42). `file_client.cpp` har `receiveFile(int serverSocket, const char* fileName, long fileSize)`, der også kun udskriver (l. 24–28), og en `main`, der kun tjekker, at der er to argumenter: værtsnavn og filnavn (l. 30–42).',
            'Signaturerne fortæller, hvad der er tænkt: serveren sender en fil af en kendt størrelse til en klient-socket, og klienten modtager en fil af en kendt størrelse fra en server-socket. Kommentaren til klientens filnavn siger “Might include path on server!” (`file_client.cpp` l. 21).',
          ],
        },
        {
          term: 'Tekst over TCP med nulbyte som afgrænser',
          body: [
            '`writeTextTCP` skriver `strlen(text)+1` bytes, altså teksten **inklusive** den afsluttende nulbyte (`iknlib.c` l. 47–50). `readTextTCP` læser én byte ad gangen, indtil den møder en 0, og gemmer højst `maxLength` tegn (l. 25–39). Nulbyten er dermed skabelonens beskedgrænse for tekst — nødvendig, fordi TCP er en byte-strøm uden grænser (s. 205, se [[sockets-tcp|TCP-sockets]]).',
            '`readFileSizeTCP` læser en sådan tekst og laver den om til et tal med `atol` (l. 58–63). Filstørrelsen sendes altså som **decimaltekst**, ikke som et binært heltal.',
          ],
        },
        {
          term: 'Filstørrelse og filnavn',
          body: [
            '`getFilesize` bruger `stat` og returnerer filens størrelse — eller 0, hvis filen ikke findes (l. 77–90). Den returværdi kan bære svaret “filen findes ikke”, men hvordan klienten skal reagere, står ingen steder.',
            '`extractFileName` returnerer delen efter sidste `/` (l. 65–75). Klienten kan altså bede om en sti på serveren, men gemme filen lokalt under filnavnet alene.',
          ],
        },
        {
          term: 'Filer i bidder: DemoFile',
          body: [
            '`file.c` skriver 20 testbytes til `test.bin` med `fopen(…, "wb")` og `fwrite` og læser dem igen med `fopen(…, "rb")` og `fread` (l. 19–34). `fread` returnerer, hvor mange bytes den fik, og flytter selv filpositionen (“Automatic seek!”). I varianten `THREEBYTES` læses filen i bidder på 3 bytes i en løkke, indtil `fread` returnerer 0, og hver bid udskrives med den længde, `fread` returnerede (l. 44–56) — den sidste bid er kortere. `fileStream.cpp` gør det samme med `ofstream`/`ifstream` i binær tilstand (l. 25–35).',
            'Det er samme mønster, en `sendFile` skal bruge: læs en bid fra filen, skriv præcis det antal bytes til socketen, gentag til filen er læst. Skabelonens `BUFSIZE 1000` passer til en sådan bid, men skabelonen siger ikke, hvad konstanten er til.',
          ],
        },
        {
          term: 'Hvad protokollen skal afklare (Uden for materialet)',
          body: [
            '*Uden for materialet — generel viden, ikke fra skabelonen eller bogen:* **Framing.** Hvert felt skal have en afgrænser eller en kendt længde. Skabelonen bruger nulbyte for tekst; selve fildataene kan ikke sendes som tekst, fordi en fil kan indeholde 0-bytes. Derfor sendes størrelsen først, og derefter præcis så mange rå bytes.',
            '*Uden for materialet:* **Størrelsen først** lader modtageren vide, hvornår filen er slut, uden at gætte. Et `read` på en TCP-socket kan returnere færre bytes end bedt om, så modtageren læser i en løkke, til den har fået `fileSize` bytes. **Fejltilfældet** (størrelse 0) skal aftales, så klienten ikke venter på data, der aldrig kommer. **Afslutning:** når den sidste byte er sendt, lukker begge sider forbindelsen med `close`.',
            'Bogen løser samme problem i HTTP: svaret har en `Content-Length`-header, der angiver antallet af bytes i objektet (s. 134), og en manglende fil giver `404 Not Found` (s. 135; bogens Assignment 1 om en webserver kræver netop det, s. 205). Se [[http|HTTP]].',
          ],
        },
      ],
      viz: 'knp-sockets-filserver',
      keyPoints: [
        'TCP giver bytes, ikke beskeder. En filserver skal selv definere framing: hvad der sendes først, og hvordan slutningen genkendes.',
        'Skabelonen sender tekst med afsluttende nulbyte (`writeTextTCP` / `readTextTCP`) og filstørrelsen som decimaltekst (`readFileSizeTCP`).',
        '`getFilesize` returnerer 0 for en fil, der ikke findes — en mulig fejlmeddelelse i protokollen.',
        'Filen læses og sendes i bidder; den sidste bid er kortere, og modtageren tæller bytes til den kendte størrelse.',
        'Samme idé som HTTP’s `Content-Length` og `404 Not Found`.',
      ],
      code: [
        {
          lang: 'c',
          title: 'iknlib.c: tekst med nulbyte og filstørrelse som tekst',
          source: 'sem3/knp/Socket/Exercise_6_template/Exercise6_template/Server/iknlib.c l. 25–63 (kommentarer udeladt)',
          code: `void readTextTCP(int inSocket, char* text, int maxLength )
{
    char ch=0;
    int pos=0;

    read(inSocket, &ch, 1);

    while(ch != 0)
    {
        if(pos < maxLength)
            text[pos++] = ch;
        read(inSocket, &ch, 1);
    }
    text[pos]=0;  // insert null termination
}

void writeTextTCP(int outSocket, const char* text)
{
    write(outSocket, text, strlen(text)+1);
}

long readFileSizeTCP(int inSocket)
{
    char buffer[256] = {0};
    readTextTCP(inSocket, buffer, sizeof(buffer));
    return atol(buffer);
}`,
        },
        {
          lang: 'cpp',
          title: 'file_server.cpp: det, skabelonen giver',
          source: 'sem3/knp/Socket/Exercise_6_template/Exercise6_template/Server/file_server.cpp l. 19–42',
          code: `/**
 * @brief Sends a file to a client socket
 * @param clientSocket Socket stream to client
 * @param fileName Name of file to be sent to client
 * @param fileSize Size of file
 */
void sendFile(int clientSocket, const char* fileName, long fileSize)
{
	printf("Sending: %s, size: %li\\n", fileName, fileSize);



}


int main(int argc, char *argv[])
{
	printf("Starting server...\\n");




	return 0;
}`,
        },
        {
          lang: 'c',
          title: 'DemoFile: læs en fil i bidder på 3 bytes',
          source: 'sem3/knp/Socket/DemoFile.zip → DemoFile/C/file.c l. 44–56',
          code: `#elif defined (THREEBYTES)
	#define TMPBUFSIZE 3
	uint8_t tmpBuf[TMPBUFSIZE];
	printf("Three byte buffer\\n");
	numBytes = fread(tmpBuf, 1, sizeof(tmpBuf), fp);  // Automatic seek!
	while (numBytes) {
		for (int j=0; j<numBytes; j++)
		{
			printf("%i ", tmpBuf[j]);
		}
	printf("\\r\\n");
	numBytes = fread(tmpBuf, 1, sizeof(tmpBuf), fp);  // Automatic seek!
	}`,
        },
      ],
      exam: [
        'TCP leverer en byte-strøm uden beskedgrænser, så en filoverførsel kræver en applikationsprotokol: klienten sender filnavnet, serveren svarer med filens størrelse, og derefter kommer præcis så mange bytes fil.',
        'Tekstfelter afsluttes med en nulbyte, som hjælpefunktionerne readTextTCP og writeTextTCP i skabelonen gør. Filstørrelsen sendes som decimaltekst og laves om til et tal med atol.',
        'Filen læses og sendes i bidder, og modtageren tæller bytes, indtil den har fået hele størrelsen; en størrelse på 0 betyder, at filen ikke findes.',
        'Det er samme idé som i HTTP, hvor Content-Length fortæller, hvor mange bytes svaret indeholder.',
      ],
      sources: [
        {
          path: sem3('Socket/Exercise_6_template/Exercise6_template/'),
          pages: 'Server/file_server.cpp l. 1–42, Client/file_client.cpp l. 1–42, Server/iknlib.c l. 1–90, Server/iknlib.h l. 1–21',
          note: 'Ingen slides og intet i bogen — kun Frederiks opgaveskabelon (Michael Alrøe; iknlib: Lars Mortensen) fra 3. semester, ikke kursusmateriale i `context/`',
        },
        { path: sem3('Socket/DemoFile.zip'), pages: 'DemoFile/C/file.c l. 1–72, DemoFile/C++/fileStream.cpp l. 1–43', note: 'Demo af binær fil-I/O (Michael Alrøe), 3.-semestermappen' },
        { path: BOG, pages: 's. 134–135, 205', note: 'Content-Length og 404 Not Found; Assignment 1: Web Server' },
        { path: k('kursuskatalog.md'), note: 'Læringsmål 3: “Beskrive og udvikle klient/server-applikationer, der kommunikerer vha. socketprogrammering”' },
      ],
      gaps: [
        'Opgaveteksten til Exercise 6 mangler; kun skabelonen findes. Kravene er derfor ukendte — fx om serveren skal kunne betjene flere klienter, hvordan en manglende fil skal meldes, og om filen skal gemmes under et bestemt navn.',
        'Skabelonen er delvist tom: `sendFile` (`file_server.cpp` l. 25–31) og `receiveFile` (`file_client.cpp` l. 24–28) udskriver kun, og begge `main`-funktioner mangler socket, bind/listen/accept eller connect og selve protokollen (`file_server.cpp` l. 34–42, `file_client.cpp` l. 30–42).',
        '`file_client.cpp` kalder `error(…)` (l. 35), men funktionen er hverken erklæret i `iknlib.h` eller defineret i filen; demokoden definerer den lokalt (`client.c` l. 17–21). Skabelonen kan altså ikke oversættes uændret. Dokumentationen af `receiveFile` (l. 18–22) nævner ikke parameteren `fileSize`.',
        'Uden for materialet (egen gennemlæsning): `readTextTCP` tjekker ikke returværdien fra `read` (`iknlib.c` l. 30 og 36). Lukker modparten forbindelsen før nulbyten, returnerer `read` 0, `ch` beholder sin sidste værdi, og løkken slutter aldrig. Når `pos` når `maxLength`, skriver `text[pos]=0` (l. 38) én byte efter bufferen — `readFileSizeTCP` giver netop `sizeof(buffer)` som grænse (l. 60–61).',
        'Figurens rækkefølge (filnavn → størrelse → data i bidder → close) er udledt af skabelonens funktioner og er illustrativ; den står ikke beskrevet i materialet.',
        UGE_GAP,
      ],
      keywords: ['filserver', 'file server', 'filoverførsel', 'Exercise 6', 'iknlib', 'readTextTCP', 'writeTextTCP', 'readFileSizeTCP', 'getFilesize', 'extractFileName', 'framing', 'protokol', 'Content-Length', 'fread', 'fwrite', 'BUFSIZE', 'port 9000'],
    },
  ],
}
