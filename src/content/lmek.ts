import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/lmek.md. */
const k = (f: string) => `opslagsvaerk/context/sem1/lmek/${f}`

export const lmek: Course = {
  id: 'lmek',
  code: 'E1LMEK-01',
  name: 'Lineær matematisk analyse og elektriske kredsløb',
  short: 'LMEK',
  semester: 1,
  ects: '10 ECTS',
  status: 'soon',
  exam: {
    form: "3 timers skriftlig tilsynsprøve (digital, aflevering som PDF). 7-trinsskala, ingen censur. Anviste hjælpemidler, ingen GAI.",
    quote: "alle inclusive, bog, noter, lommeregner, PC, Mathcad, Brightspace, men ingen AI.",
    quoteSource: k('kilder/Eksamen/slides_eksamen_lmek.pdf'),
    points: [
      "Forudsætning: alle 4 LMEK-øvelser godkendt. Færre end 4 overføres ikke til senere semestre.",
      "Undervisningssproget er dansk. Litteratur: Croft m.fl., *Engineering Mathematics*, og *Real Analog – Circuits 1*.",
      "Gamle sæt: Vintereksamen 2024-25 med håndskrevet løsning, og samlingen *Eksamensopgaver til MMLS* 2017–2023 (forgængerfagets matematikdel) med løsningsforslag.",
      "Alle gamle sæt er rene matematikopgaver: lineære ligningssystemer, periodiske funktioner og rms, komplekse tal, differentialligninger.",
    ],
  },
  goalsSource: k('kilder/kursuskatalog.md'),
  goals: [
    { text: "Analysere lineære kredsløb med modstande og kilder ved benyttelse af systematiske metoder og fundamentale kredsløbslove." },
    { text: "Redegøre for og bestemme Thevenin- og Nortonækvivalenter." },
    { text: "Redegøre for superpositionsmetoden." },
    { text: "Redegøre for transistoren som simpel switch, forstærker og bufferkredsløb." },
    { text: "Redegøre for simpel anvendelse af diode." },
    { text: "Redegøre for den ideelle operationsforstærker (Op-Amp) og tilhørende koblinger." },
    { text: "Have kendskab til modstande, spoler og kondensatorer." },
    { text: "Have kendskab til vekselstrømskredsløb med modstande, spoler og kondensatorer." },
    { text: "Have kendskab til 1. og 2. ordens transientrespons i kredsløb med modstande, spoler og kondensatorer." },
    { text: "Analysere og dimensionere simple elektroniske kredsløb, hvori der indgår modstande, transistorer, dioder og Op-Amp komponenter." },
    { text: "Anvende værktøjer til simulering og verificering af simple elektroniske systemer." },
    { text: "Udføre laboratorieøvelser og udforme laboratoriejournaler, herunder beskrive og anvende målemetoder og forklare måleresultater." },
    { text: "Løse lineære ligningssystemer v.hj.a. elementære rækkeoperationer, herunder opskrive lineære ligningssystemer v.hj.a. matricer og vektorer, og anvende disse ved analyse af lineære elektriske kredsløb." },
    { text: "Anvende grundlæggende begreber og metoder omkring trigonometriske og harmoniske funktioner, herunder amplitude, frekvens og fase." },
    { text: "Udtrykke og beregne stykvis givne periodiske funktioner." },
    { text: "Beregne middel- og rms-værdi af funktioner." },
    { text: "Udføre beregninger med komplekse tal og den komplekse eksponentialfunktion, herunder bestemmelse af komplekse n'te rødder, og anvende komplekse tal ved analyse af lineære RCL-kredsløb." },
    { text: "Beregne summen af to harmoniske funktioner med samme frekvens v.hj.a. kompleks symbolsk metode." },
    { text: "Løse 1. og 2. ordens sædvanlige lineære differentialligninger og anvende disse til analyse af RCL-kredsløb." },
    { text: "Anvende basal matematisk notation, manipulation og præcision." },
  ],
  outline: [],
}
