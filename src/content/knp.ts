import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/knp.md. */
const k = (f: string) => `opslagsvaerk/context/Kommunikationsnetværk og netværksprogrammering/${f}`

export const knp: Course = {
  id: 'knp',
  code: 'E3KNP-01',
  name: "Kommunikationsnetværk og netværksprogrammering",
  short: 'KNP',
  semester: 3,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: "Hjemmeopgave: 2–4 gruppejournaler i undervisningsperioden. Bestået/ikke bestået, ingen censur.",
    points: [
      "Bedømmes samlet på de individuelle bidrag; ansvarsområder angives i journalerne.",
      "Bog: Kurose & Ross, Computer Networking — A Top-Down Approach.",
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: "Redegøre for lagopdeling og abstraktionsprincipper i en protokolstak, herunder internetprotokolstakken." },
    { text: "Beskrive virkemåden af protokoller på applikations-, transport-, netværks- og linklag." },
    { text: "Beskrive og udvikle klient/server-applikationer, der kommunikerer vha. socketprogrammering." },
    { text: "Beskrive hvordan man opbygger et REST API, der følger REST-arkitekturen." },
    { text: "Anvende HTTP og WebSocket samt udvikle REST API til klient/server." },
  ],
  outline: [],
}
