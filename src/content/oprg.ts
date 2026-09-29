import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/oprg.md. */
const k = (f: string) => `opslagsvaerk/context/sem1/oprg/${f}`

export const oprg: Course = {
  id: 'oprg',
  code: 'SW1OPRG-01',
  name: 'Objektbaseret programmering',
  short: 'OPRG',
  semester: 1,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: "2 timers mundtlig prøve: individuel løsning af et sæt programmeringsopgaver ved eget bord med mundtlig forklaring af løsningen til eksaminator og censor undervejs. Bestået/ikke bestået, intern censur. Alle hjælpemidler.",
    quote: "Når den studerende har løst ca. 30% af opgaverne, kalder den studerende på eksaminator og censor, hvor den studerende ved sit eksamensbord forklarer, hvad løsningen er, hvordan den virker og hvordan han/hun er kommet frem til løsningen.",
    quoteSource: k('kilder/kursuskatalog.md'),
    points: [
      "Anden kaldsrunde ved mindst 60 % løst; derefter kan man kalde igen. Man får besked, når der er point nok til bestået, og kan gå.",
      "Prøvesættene kræver egne .h- og .cpp-filer, en main() der tester løsningerne, og at man kan lave simple ændringer i koden uden GAI.",
      "Sproget er C++ med C-elementer til sammenligning. Kursuskataloget nævner ingen forudsætninger for at gå til eksamen.",
      "Lokalt findes prøveeksamenssæt 1 og 2 og et eksamenslignende sæt fra forelæsningen 2. maj 2025, alle uden løsninger. Tidligere eksamenssæt 2019–2023 med løsningsforslag ligger kun som GitHub-links.",
    ],
  },
  goalsSource: k('kilder/kursuskatalog.md'),
  goals: [
    { text: "Identificere, anvende, udvælge og kombinere kontrolstrukturer." },
    { text: "Definere, konstruere og anvende C/C++-funktioner." },
    { text: "Definere og anvende simple datatyper." },
    { text: "Definere og anvende pointerbegrebet, til tilgang til simple variable, objekter og sammensatte datastrukturer." },
    { text: "Anvende basale objektorienterede principper såsom indkapsling, information hiding og opdeling i data og metoder (funktioner)." },
    { text: "Anvende et UML klassediagram med klasser og komposition mellem dem som model for implementering af en klasse." },
    { text: "Anvende programmoduler til strukturering af funktioner, datastrukturer og klasser." },
    { text: "Konstruere og strukturere de ovennævnte programmeringselementer til programmer, der løser en simpel, specificeret opgave." },
  ],
  outline: [],
}
