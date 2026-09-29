import type { Course } from '../types'
import { k } from './paths'
import { opstart } from './p1-opstart'
import { krav } from './p2-krav'
import { analyse } from './p3-analyse'
import { arkitektur } from './p4-arkitektur'
import { implementering } from './p5-implementering'
import { rapport } from './p6-rapport'

/* Generisk guide til et semesterprojekt. Bygget på ISE/PRJ4-materialet
   (SWISE-01 / SW4PRJ4-02), ikke på ét bestemt projekt. */
export const projekt: Course = {
  id: 'projekt',
  code: 'Projekt',
  name: 'Sådan sættes et projekt sammen',
  short: 'Projekt',
  status: 'ready',
  intro:
    'Generisk forløb for et semesterprojekt: fra projektformulering og krav over analyse, arkitektur og design til implementering, test, rapport og mundtlig projekteksamen. Bygget på ISE/PRJ-materialet (SWISE-01 / SW4PRJ4-02), ikke på ét bestemt projekt. **Projektets rygrad** er en kæde af artefakter, der sporer til hinanden: projektformulering → kravspecifikation (use cases + ikke-funktionelle krav) → accepttestspecifikation → domænemodel → arkitektur (BDD/IBD) → applikationsmodel (sekvens- og klassediagrammer) → kode → integrations- og accepttest → rapport. Se [[rygrad|Projektets rygrad]].',
  introSource: k('README.md'),
  exam: {
    form: 'Projekteksamen: typisk 20 min mundtlig med ekstern censur, 7-trinsskala, på baggrund af gruppens projektrapport og dokumentation.',
    quote: 'Projekteksamen -15 min. i gruppen + 20 min individuelt',
    quoteSource: k('00-kursus/kursusbeskrivelse-katalog.md'),
    points: [
      'Den konkrete form står i det enkelte projektkursus’ kursusbeskrivelse. For PRJ4 er det en hjemmeopgave (rapport + dokumentation) og en mundtlig prøve med ekstern censur og 7-trinsskala; alle hjælpemidler, GAI tilladt.',
      'Forløbet er typisk en **fælles del**, hvor gruppen præsenterer og viser projektet, efterfulgt af en **individuel** mundtlig eksamination uden forberedelse. Kataloget og introduktionsslides er uenige om minuttallet (15 + 20 vs. ca. 20 + 15) — tjek dit eget kursus.',
      'Eksaminationen tager udgangspunkt i den afleverede rapport og dokumentation. Du skal kunne forklare og forsvare **hele** projektet, også de dele du ikke selv har lavet.',
      'Censor tjekker læringsmålene: iterativ proces, OOA&D, test, korrekt fagterminologi, kobling til semesterets kurser og at proces-, design- og teknologivalg kan diskuteres og perspektiveres.',
      'Aflevering er forudsætning for at gå til eksamen. Ikke bestået (00 eller -3) eller udeblivelse betyder et nyt projekt til næste ordinære termin.',
    ],
  },
  goalsSource: k('00-kursus/kursusbeskrivelse-katalog.md'),
  goals: [
    { text: 'Udvælge og redegøre for en teknisk-faglig problemstilling som basis for projektet.', topics: ['projektformulering'] },
    { text: 'Anvende en iterativ udviklingsproces.', topics: ['ece-model', 'udviklingsprocesser', 'scrum-kanban'] },
    { text: 'Dokumentere det udarbejdede produkt.', topics: ['rapportstruktur', 'proces-produktrapport', 'figurer-captions'] },
    { text: 'Anvende korrekt fagterminologi.', topics: ['sysml-bdd', 'sysml-ibd', 'fully-dressed-uc'] },
    { text: 'Udvikle applikationer med grafiske brugergrænseflader, databaser og netværkskommunikation.', topics: ['design-til-kode', 'protokoller', 'graenseflader'] },
    { text: 'Anvende teknikker, metoder og værktøjer til softwaretest.', topics: ['accepttest', 'integration-systemtest'] },
    { text: 'Anvende objektorienteret analyse og design i systemudvikling.', topics: ['domaenemodel', 'applikationsmodel', 'sekvensdiagram', 'state-machine'] },
    { text: 'Anvende projekt- og versionsstyringsværktøjer.', topics: ['projektledelse', 'kvalitetssikring', 'scrum-kanban'] },
    { text: 'Kombinere viden fra flere af semestrets kurser og anvende denne i projektet.', topics: ['rygrad', 'arkitektur'] },
    { text: 'Diskutere og perspektivere proces-, design- og teknologivalg i projektet.', topics: ['udviklingsprocesser', 'arkitektur', 'risikoanalyse'] },
    { text: 'Udvælge, vurdere og anvende supplerende viden i projektarbejdet med angivelse af referencer.', topics: ['rapportstruktur'] },
    { text: 'Præsentere projektets resultater ved et mundtligt forsvar.', topics: ['projekteksamen'] },
  ],
  gaps: [
    'Kursuskataloget og PRJ4-introduktionen er uenige om eksamens minuttal: “15 min. i gruppen + 20 min individuelt” (katalog) mod “ca. 20 min.” fælles fremvisning + 15 min. individuelt (slide 6). Kataloget gælder formelt.',
    'Rapportmodulets L27-slides lister læringsmål for SW2PRJ2, ikke SW4PRJ4. Guiden bruger SW4PRJ4-katalogets læringsmål.',
    'Flere løsningsfiler findes kun som henvisning på Brightspace og er ikke i materialet: `AcceptTestOvelseLosning.pdf`, `System Design and Interfaces with Solution.pdf`, Kamerasystem-løsningen og Windows Forms-versionen af minuturet.',
    'De gamle eksamenssæt (I2ISE F2015 og E2015, SmartFridge) er fra da ISE havde skriftlig eksamen. De bruges her som cases, ikke som eksempel på eksamensformen.',
    'Materialet er ISE/PRJ4-specifikt. At guiden også gælder senere projekter (fx bachelorprojektet), er guidens egen præmis, ikke noget materialet siger.',
  ],
  parts: [opstart, krav, analyse, arkitektur, implementering, rapport],
}
