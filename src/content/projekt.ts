import type { Course } from './types'

/* Stub. Generisk guide til hvordan et semesterprojekt sættes sammen.
   Udfyldes via prompts/projekt.md. */
const k = (f: string) => `opslagsvaerk/context/projekt/markdown/${f}`

export const projekt: Course = {
  id: 'projekt',
  code: 'Projekt',
  name: 'Sådan sættes et projekt sammen',
  short: 'Projekt',
  status: 'soon',
  intro:
    'Generisk forløb for et semesterprojekt: fra projektformulering og krav over arkitektur og design til test, rapport og mundtlig projekteksamen. Bygget på ISE/PRJ-materialet, ikke på ét bestemt projekt.',
  introSource: k('README.md'),
  exam: {
    form: 'Projekteksamen: typisk 20 min mundtlig med ekstern censur, 7-trinsskala, på baggrund af projektrapporten.',
    points: ['Den konkrete form står i det enkelte projektkursus’ kursusbeskrivelse.'],
  },
  goals: [],
  outline: [],
}
