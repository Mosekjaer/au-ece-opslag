import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/oop.md. */
const k = (f: string) => `opslagsvaerk/context/Objektorienteret programmering (SW2OOP-01)/${f}`

export const oop: Course = {
  id: 'oop',
  code: 'SW2OOP-01',
  name: "Objektorienteret programmering",
  short: 'OOP',
  semester: 2,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: "3 timers skriftlig stedprøve (Handin). 7-trinsskala, intern censur. Alle hjælpemidler, én computer, ingen GAI.",
    points: [
      "Sproget i materialet er C++.",
      "Ingen forudsætninger for at gå til eksamen.",
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: "Anvende debugging til fejlfinding." },
    { text: "Redegøre for og anvende de basale OO-principper, herunder arv og polymorfi, til vedligeholdelsesvenlige programmer." },
    { text: "Redegøre for klasserelationstyperne og implementere dem." },
    { text: "Designe og implementere simple generaliserings- og specialiseringshierarkier vha. arv." },
    { text: "Identificere og forklare sammenhænge i et UML-klassediagram og implementere det opdelt i programmoduler." },
    { text: "Redegøre for statisk og dynamisk lagerallokering og anvende det i konkrete programmer." },
    { text: "Redegøre for overloading og implementere overloading af operationer og operatorer." },
    { text: "Redegøre for templates og implementere simple funktions- og klassetemplates." },
    { text: "Redegøre for STL-containere og iteratorer og anvende basale dele af STL." },
    { text: "Kende og anvende basale principper for exceptions." },
  ],
  outline: [],
}
