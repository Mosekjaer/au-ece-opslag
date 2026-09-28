import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/pla.md. */
const k = (f: string) => `opslagsvaerk/context/Praktisk Lineær Algebra (SW2PLA-02)/${f}`

export const pla: Course = {
  id: 'pla',
  code: 'SW2PLA-02',
  name: "Praktisk lineær algebra for softwareudviklere",
  short: 'PLA',
  semester: 2,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: "3 timers skriftlig tilsynsprøve (Assign). 7-trinsskala, ekstern censur. Alle hjælpemidler, én computer.",
    points: [
      "Forudsætning: 2–4 obligatoriske opgaver godkendt.",
      "Bog: Cohen, Practical Linear Algebra for Data Science (O’Reilly 2022). Python som værktøj.",
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: "Anvende metoder og resultater fra lineær algebra til matematiske problemstillinger." },
    { text: "Anvende dem til ingeniørmæssige problemstillinger med Python." },
    { text: "Formulere korrekte matematiske argumenter." },
    { text: "Benytte matematisk terminologi og symbolsprog." },
    { text: "Bruge lineær algebra til problemer fra softwareteknologi, fx grafik og maskinlæring." },
  ],
  outline: [],
}
