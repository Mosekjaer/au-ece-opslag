import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/ide.md. */
const k = (f: string) => `opslagsvaerk/context/sem1/ide/${f}`

export const ide: Course = {
  id: 'ide',
  code: 'E1IDE-01',
  name: 'Indledende digital elektronik',
  short: 'IDE',
  semester: 1,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: "Hjemmeopgave (Assign): løbende laboratoriejournaler. 5 gruppebaserede laboratorieøvelser, hver afsluttet med en journal; 4 ud af 5 skal godkendes. Bestået/ikke bestået, ingen censur. Hjælpemidler ikke angivet.",
    quote: "4 ud af 5 laboratorieøvelser skal være godkendt (hver med mindst 70 point)",
    quoteSource: k('kilder/Velkommen til Indledende Digital Elektronik/beskrivelse.md'),
    points: [
      "Beståelse sker på en samlet vurdering af de løbende opgaver. Hver journal skal reviewes af en anden gruppe før aflevering.",
      "3 af øvelserne har individuelle elementer. Det ene er en individuel quiz før Lab #4 (7 spørgsmål, 45 min, mindst 50 % rigtige, egne noter og bog tilladt, ingen GAI).",
      "Der findes ingen gamle eksamenssæt. Materialet har vejledninger til Lab #1, #3 og #4 (ældre udgaver), en eksempeljournal til Lab #2 med indlagte fejl og opgaveregning med løsningsforslag.",
      "Undervisningen er på dansk; slides og bog (Floyd, *Digital Fundamentals*, custom ed. v. Henrik Olsen) er på engelsk. Ingen forudsætninger for deltagelse.",
    ],
  },
  goalsSource: k('kilder/kursuskatalog.md'),
  goals: [
    { text: "Redegøre for og anvende digitale grundbegreber, herunder boolsk algebra, Karnaugh-kort, talsystemer og digitale koder." },
    { text: "Analysere digitale grundelementer (logiske gates og flip-flops), herunder AND, NAND, OR, NOR, XOR, NOT, SR-latch og JK-flip-flop." },
    { text: "Analysere og syntetisere kombinatoriske og sekventielle kredsløb: multipleksere, dekodere, enkodere, addere, registre, tællere og simple tilstandsmaskiner." },
    { text: "Anvende standard digitale IC'er til konstruktion af digitale kredsløb." },
    { text: "Anvende værktøjer til simulering og verificering af digitale kredsløb." },
    { text: "Udføre laboratorieøvelser og udforme laboratoriejournaler." },
    { text: "Præsentere resultater skriftligt." },
  ],
  outline: [],
}
