import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/sts.md. */
const k = (f: string) => `opslagsvaerk/context/Sandsynlighedsteori og statistik (SW2STS-01)/${f}`

export const sts: Course = {
  id: 'sts',
  code: 'SW2STS-01',
  name: "Sandsynlighedsteori og statistik",
  short: 'STS',
  semester: 2,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: "3 timers skriftlig tilsynsprøve (Assign). 7-trinsskala, ekstern censur. Computer, software, bøger, noter og internet; ingen GAI.",
    points: [
      "Håndskrevne dele digitaliseres og vedhæftes.",
      "Ingen forudsætninger for at gå til eksamen.",
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: "Redegøre for og anvende basal sandsynlighedsteori, herunder betinget sandsynlighed og Bayes’ regel." },
    { text: "Benytte tætheds- og fordelingsfunktioner i én og to dimensioner." },
    { text: "Redegøre for stokastisk variabel, middelværdi og varians." },
    { text: "Præsentere statistiske forsøgsdata på gængse måder." },
    { text: "Analysere forsøgsdata og teste hypoteser, fx med t-test." },
    { text: "Beregne og fortolke p-værdier og konfidensintervaller for normal-, binomial- og Poissonfordelingen m.fl." },
    { text: "Modellere forsøgsdata med lineær regression." },
  ],
  outline: [],
}
