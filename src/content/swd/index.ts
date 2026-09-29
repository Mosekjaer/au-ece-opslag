import type { Course } from '../types'
import { m } from './paths'
import { grundlag } from './p1-grundlag'
import { solid } from './p2-solid'
import { arkitektur } from './p3-arkitektur'
import { moenstre } from './p4-moenstre'
import { refactoringDdd } from './p5-refactoring-ddd'
import { parallelitet } from './p6-parallelitet'

export const swd: Course = {
  id: 'swd',
  code: 'SW4SWD-01',
  name: 'Softwaredesign',
  short: 'SWD',
  semester: 4,
  ects: '5 ECTS',
  status: 'ready',
  intro:
    'Faget handler om de principper, mønstre og metoder, der gør objektorienteret software vedligeholdelsesvenlig, skalérbar og testbar: OO-designprincipper (SOLID), designmønstre og styrken i at kombinere dem, softwarearkitektur og redskaber til parallelle programmer. Nogle principper er veletablerede, andre omdiskuterede — faget skal også give den kritiske sans til selv at vurdere nye.',
  introSource: m('kursus/SW4SWD-01_Course_Description.md'),
  exam: {
    form: 'Mundtlig, ca. 20 minutter inkl. votering, ekstern censur, 7-trinsskala. Ingen forberedelse; spørgsmålene udleveres på forhånd.',
    quote: 'Mundtlig, 20 minutter, ekstern censur, 7-trinsskala',
    quoteSource: m('kursus/SW4SWD-01_Course_Description.md'),
    points: [
      '**Forløb:** mundtlig eksamen på ca. 20 minutter **inklusive votering**, ekstern censor, 7-trinsskala. Ingen forberedelsestid: spørgsmålene udleveres på forhånd, “some time in November” (Course Intro.pdf s. 17–19). Du skal altså kunne tale frit om hvert spørgsmål, ikke læse op.',
      '**Forudsætning:** én obligatorisk gruppeopgave (hand-in) plus to individuelle reviews skal være godkendt, ellers kan du ikke gå til eksamen (Course Intro.pdf s. 14 og 20). I opgaven vælger gruppen et designmønster — deadline for valget er fredag i uge 8 (kal. 43), aflevering fredag i uge 10 (kal. 45), jf. lesson plan.',
      '**Læs verberne i læringsmålene.** Designmønstre skal kunne *explain, combine, compare, analyse and use*; concurrency *describe, compare, and develop*; UML kun *use* (Course Intro.pdf s. 8). Et oplæg om et mønster bør derfor både forklare, sammenligne med et beslægtet mønster og vise brug i kode.',
      '**Et oplæg, der bærer:** definition → hvilket problem det løser (hvilket princip, fx [[ocp|OCP]] eller [[dip|DIP]]) → et eksempel fra kurset (Duck, Weather Station, Pizza, Gumball, ECS) i UML og C# → en afvejning eller sammenligning.',
      '**Sammenligningspar, der går igen i materialet:** [[template-method|Template Method]] ↔ [[strategy|Strategy]] (arv mod delegation), [[state|State]] ↔ [[strategy|Strategy]] (W08b), [[factory-method|Factory Method]] ↔ [[abstract-factory|Abstract Factory]] (W07.2), arv ↔ komposition ([[strategy|Strategy]], [[lsp|LSP]]), [[c4|C4]] ↔ [[views-4plus1|4+1]] (W05) og switch/case ↔ tabel ↔ GoF State ([[state|State]]).',
      '**Ingen gamle sæt og ingen spørgsmålsliste** i materialet. Emnerne her følger lektionsplanen; spørgsmålene kommer i november.',
    ],
  },
  goalsSource: m('kursus/SW4SWD-01_Course_Description.md'),
  goals: [
    { text: 'Anvende UML som modellerings- og dokumentationsredskab.', topics: ['uml-klassediagram', 'state', 'nested-orthogonal', 'views-4plus1'] },
    { text: 'Gengive, kombinere og anvende grundlæggende principper for objektorienteret softwareudvikling.', topics: ['oo-grundbegreber', 'design-smells', 'srp', 'ocp', 'lsp', 'isp', 'dip', 'refactoring'] },
    { text: 'Gengive og anvende begrebet softwarearkitektur samt hertil relaterede designprincipper.', topics: ['arkitekturproces', 'arkitekturstile', 'c4', 'views-4plus1', 'ddd', 'fejlhaandtering'] },
    { text: 'Gengive, kombinere, anvende, analysere og sammenligne udvalgte designmønstre.', topics: ['design-patterns', 'observer', 'template-method', 'strategy', 'factory-method', 'abstract-factory', 'state', 'nested-orthogonal'] },
    { text: 'Beskrive, sammenligne og anvende redskaber til fremstilling af parallelle programmer.', topics: ['threading', 'parallel-tasks', 'parallel-loops', 'futures', 'pipelines', 'aggregation-mapreduce'] },
    { text: 'Arbejde selvstændigt og tage ansvar for egen læring og faglige fokusering.' },
    { text: 'Anvende mundtlig fremlæggelse til formidling af resultatet af egne undersøgelser.' },
  ],
  gaps: ['Eksamensspørgsmålene udleveres “engang i november” og findes ikke i materialet. Der er ingen gamle sæt.'],
  parts: [grundlag, solid, arkitektur, moenstre, refactoringDdd, parallelitet],
}
