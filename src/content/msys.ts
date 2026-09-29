import type { Course } from './types'

/* Stub fra kursuskataloget. Udfyldes via prompts/msys.md. */
const k = (f: string) => `opslagsvaerk/context/sem1/msys/${f}`

export const msys: Course = {
  id: 'msys',
  code: 'SW1MSYS-01',
  name: 'Microcontroller systemer',
  short: 'MSYS',
  semester: 1,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: '90 minutters skriftlig tilsynsprøve som elektronisk multiple choice. 7-trinsskala, intern censur. Alle hjælpemidler, én computer, ingen GAI, Device Monitor tændt hele prøven.',
    quote: 'Eksamen: Multiple Choice, karakter efter 7-skalaen.',
    quoteSource: `${k('kilder/1. Introduktion ()/MSYS_Lektion1_IntroCourse.pdf')} slide 5`,
    points: [
      'Quizzen tages i Brightspace; deltagelsen bekræftes ved at uploade en pdf (fx navn og studienummer) i WISEflow.',
      'Undervisningssproget er dansk. Der programmeres i AVR-assembly og C (AVR GCC) på Arduino Mega2560.',
      'Ingen forudsætninger for at gå til eksamen. Reeksamen i august eller næste eksamenstermin.',
      'Eksamen og reeksamen 2025 samt testeksamen 2025 findes kun som Brightspace-quizzer; spørgsmålene er ikke gemt i materialet.',
    ],
  },
  goalsSource: k('kilder/kursuskatalog.md'),
  goals: [
    { text: 'Beskrive en 8-bit microcontrollers interne arkitektur: CPU, Timer, I/O enheder etc.' },
    { text: 'Anvende assembly og C til programmering af en dedikeret microcontroller.' },
    { text: 'Implementere og teste drivere for grundlæggende I/O-enheder (parallelle porte).' },
    { text: 'Implementere og teste drivere for seriel, asynkron kommunikation (UART).' },
    { text: 'Anvende interrupts.' },
    { text: 'Anvende hardware-timere.' },
    { text: 'Anvende A/D-konvertere.' },
  ],
  outline: [],
}
