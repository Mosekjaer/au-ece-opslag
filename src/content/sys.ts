import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/sys.md. */
const k = (f: string) => `opslagsvaerk/context/Systemprogrammering/${f}`

export const sys: Course = {
  id: 'sys',
  code: 'SW3SYS-01',
  name: "Systemprogrammering",
  short: 'SYS',
  semester: 3,
  ects: '10 ECTS',
  status: 'soon',
  exam: {
    form: "20 min individuel mundtlig eksamen med trækning af spørgsmål. 7-trinsskala, ekstern censur. Alle hjælpemidler.",
    points: [
      "Forudsætning: tre afleveringsopgaver godkendt.",
      "Bog: Silberschatz, Operating System Concepts.",
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: "Genkende og identificere basale systemkomponenter og terminologi (processer, tråde, I/O-systemer)." },
    { text: "Redegøre for systemfunktioner som synkroniseringsværktøjer (mutex, semaforer) og memory pools." },
    { text: "Beskrive OS-komponenters funktioner, fx systemkald og processkontrol." },
    { text: "Forklare og anvende trådsynkronisering, hukommelsesallokering og design af enhedsdrivere." },
    { text: "Analysere synkroniseringseksempler (Dining Philosophers) og identificere deadlocks." },
    { text: "Integrere systemkomponenter som enhedsdrivere og memory management til komplekse softwaresystemer." },
    { text: "Implementere trådsikre programmer og event-drevne køer." },
    { text: "Generalisere brugen af hukommelses- og ressourcehåndteringsprincipper." },
    { text: "Designe og udføre eksperimenter og kritisk fortolke resultaterne for at validere tekniske løsninger." },
  ],
  outline: [],
}
