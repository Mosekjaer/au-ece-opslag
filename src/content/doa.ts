import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/doa.md. */
const k = (f: string) => `opslagsvaerk/context/Algoritmer og datastrukturer/${f}`

export const doa: Course = {
  id: 'doa',
  code: 'SW3DOA-01',
  name: "Algoritmer og datastrukturer",
  short: 'DOA',
  semester: 3,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: "3 timers skriftlig tilsynsprøve (Assign). 7-trinsskala, ekstern censur. Computer, software, bøger, noter og internet; ingen GAI.",
    points: [
      "Forudsætning: mindst 4 laboratorieøvelser godkendt.",
      "Bog: Weiss, Data Structures & Algorithm Analysis in C++, 4th ed.",
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: "Beskrive, anvende og sammenligne udvalgte algoritmer og datastrukturer." },
    { text: "Kombinere algoritmer og datastrukturer til løsning af et givet problem." },
    { text: "Sammenligne, udvælge og ræsonnere for valget af algoritme eller datastruktur til et givet problem." },
    { text: "Anvende algoritmiske teknikker til at løse problemer og implementere løsningen." },
    { text: "Udlede og analysere tids- og pladskompleksitet." },
    { text: "Designe og implementere datastrukturer og algoritmer og bedømme ydeevne og egnethed i specifikke situationer." },
  ],
  outline: [],
}
