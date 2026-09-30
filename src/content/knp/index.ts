import type { Course } from '../types'
import { k } from './paths'
import { fundament } from './p1-fundament'
import { applikationslag } from './p2-applikationslag'
import { sockets } from './p3-sockets'
import { transportlag } from './p4-transportlag'
import { netvaerkLink } from './p5-netvaerk-link'
import { restWebsocket } from './p6-rest-websocket'

export const knp: Course = {
  id: 'knp',
  code: 'E3KNP-01',
  name: 'Kommunikationsnetværk og netværksprogrammering',
  short: 'KNP',
  semester: 3,
  ects: '5 ECTS',
  status: 'ready',
  exam: {
    form: 'Hjemmeopgave: 2–4 gruppejournaler i undervisningsperioden. Bestået/ikke bestået, ingen censur.',
    points: [
      'Bedømmes samlet på de **individuelle bidrag**; ansvarsområder angives i journalerne. Du skal kunne redegøre for det, du selv har skrevet — og for det, journalen bygger på.',
      'Alle hjælpemidler er tilladt, og der er ingen mundtlig eksamen. Sætningerne under “Det skal du kunne sige” er derfor formuleringer til en journal eller en forsvarssamtale, ikke eksamenssvar.',
      'Bog: Kurose & Ross, *Computer Networking — A Top-Down Approach*, Global Edition.',
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: 'Redegøre for lagopdeling og abstraktionsprincipper i en protokolstak, herunder internetprotokolstakken.', topics: ['lagdeling-indkapsling', 'internet-net-edge', 'pakke-kredsloebskobling'] },
    { text: 'Beskrive virkemåden af protokoller på applikations-, transport-, netværks- og linklag.', topics: ['klient-server-p2p', 'http', 'cookies-caching', 'dns', 'udp-mux-demux', 'paalidelig-overfoersel', 'tcp-forbindelse', 'flow-control', 'congestion-control', 'nat-ipv6', 'ipv4-forwarding', 'routing', 'ethernet-mac-arp', 'switche'] },
    { text: 'Beskrive og udvikle klient/server-applikationer, der kommunikerer vha. socketprogrammering.', topics: ['sockets-udp', 'sockets-tcp', 'sockets-filserver'] },
    { text: 'Beskrive hvordan man opbygger et REST API, der følger REST-arkitekturen.', topics: ['rest-api'] },
    { text: 'Anvende HTTP og WebSocket samt udvikle REST API til klient/server.', topics: ['http', 'rest-api', 'websocket'] },
  ],
  gaps: [
    'Slides og bog-markdown dækker kun kapitel 1 (lektion 1). Resten af pensum er hentet direkte fra Kurose & Ross-PDF’en — der er ingen lektionsplan, slides eller opgaver for lektion 2–14.',
    'REST-arkitekturen og WebSocket-protokollen (kursusindhold og læringsmål 4–5) er ikke i bogen. De står som emner uden indhold; BAD og FED dækker HTTP, REST og real-time-kommunikation.',
    'Ingen journalopgaver i materialet — hvad journalerne skal indeholde, er ikke kendt.',
    'Bogens 2.3 (e-mail), 2.6 (video streaming/CDN), 1.6 (sikkerhed), 1.7 (historie), kap. 7 (trådløst) og kap. 8 (sikkerhed) har ingen egne emner.',
    'Slides og bog er uenige om flere tal i kapitel 1 (WiFi-rækkevidde, 4G, satellitforsinkelse, kabelhastighed); det står under de enkelte emner.',
    'Ugenumre er vejledende efter bogens rækkefølge — der findes ingen lektionsplan.',
    'Socket-koden er fra Frederiks egen 3.-semestermappe (`sem3/knp/Socket`), ikke fra kursusmaterialet i `context/`.',
  ],
  parts: [fundament, applikationslag, sockets, transportlag, netvaerkLink, restWebsocket],
}
