import type { Course } from '../types'
import { k } from './paths'
import { osVaerktoejer } from './p1-os-vaerktoejer'
import { processerTraade } from './p2-processer-traade'
import { synkronisering } from './p3-synkronisering'
import { deadlocks } from './p4-deadlocks'
import { posixIo } from './p5-posix-io'
import { messagePassing } from './p6-message-passing'
import { hukommelse } from './p7-hukommelse'
import { drivere } from './p8-drivere'

export const sys: Course = {
  id: 'sys',
  code: 'SW3SYS-01',
  name: 'Systemprogrammering',
  short: 'SYS',
  semester: 3,
  ects: '10 ECTS',
  status: 'ready',
  intro:
    'Faget handler om laget mellem applikationen og hardwaren: hvordan operativsystemet styrer processer, tråde, hukommelse og I/O, og hvordan man programmerer op imod det i C og C++ på Linux. Kursusindholdet har otte blokke — OS-introduktion, processer og kommunikation, tråde og synkronisering, synkroniseringseksempler og deadlocks, hukommelseshåndtering, I/O-systemer og enhedsdrivere, virtualisering og værktøjer. Øvelserne kører på en Raspberry Pi 5 med kursets ECE-SYS-HAT (OLED, LED’er, knapper, IMU).',
  introSource: k('kursuskatalog.md'),
  exam: {
    form: '20 min individuel mundtlig eksamen med trækning af spørgsmål blandt kursusemnerne. 7-trinsskala, ekstern censur, alle hjælpemidler.',
    quote: 'Draw questions among subjects. Related stuff in the exercises will be investigated during exam',
    quoteSource: k('context/slides/SW3SYS-01_Lecture0.1.1a_Course_Introduction.md'),
    points: [
      '**Forløb:** du trækker et spørgsmål blandt kursusemnerne og har 20 minutter inklusive votering. Stof fra øvelserne undersøges også, så dit oplæg bør pege på noget, du selv har bygget på Raspberry Pi’en (01.1a-SW3SYS-Course-Introduction.pdf s. 9).',
      '**Forudsætning:** godkendte afleveringer i grupper på 2–3 via Feedback Fruits, hvor både opgaven og dit peer review skal godkendes. Kursuskataloget siger tre; kursusintroen siger “three-four” (s. 8).',
      '**Et oplæg, der bærer:** definition → mekanisme (hvad OS’et og hardwaren gør) → et kodeeksempel fra kurset eller øvelserne → en faldgrube eller afvejning. Emnernes “Det skal du kunne sige”-sætninger er bygget sådan.',
      '**Par, der går igen i materialet:** proces ↔ tråd ([[processer|processer]], [[traade|tråde]]), mutex ↔ semafor ([[mutex-spinlock|mutex]], [[semaforer|semaforer]]), shared memory ↔ message passing ([[ipc|IPC]], [[message-passing|message passing]]), polling ↔ interrupt ↔ DMA ([[interrupts-dma|interrupts og DMA]]), blocking ↔ non-blocking ↔ `poll()` ([[blocking-io|blocking I/O]]), I2C ↔ SPI ([[i2c-spi|I2C og SPI]]), `unique_ptr` ↔ `shared_ptr` ([[smart-pointers|smart pointers]]) og prevention ↔ avoidance ↔ detection ([[deadlock-haandtering|deadlock-håndtering]]).',
      '**Dining Philosophers står i læringsmålene** som eksemplet, du skal kunne analysere: vis deadlocken som ressourceallokeringsgraf, peg på de fire Coffman-betingelser, og bryd én af dem ([[dining-philosophers|dining philosophers]], [[deadlock-betingelser|Coffman-betingelser]]).',
      '**Ingen tekstliste over eksamensspørgsmålene.** Materialet har tolv lydfiler med navnene “Eksamensspørgsmål 1–12”, men selve spørgsmålene findes ikke i tekst i slides, README’er eller kursusintroen. Emnerne her følger lektionsplanen.',
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: 'Genkende og identificere basale systemkomponenter og terminologi (processer, tråde, I/O-systemer).', topics: ['computersystem', 'os-dual-mode', 'processer', 'traade', 'interrupts-dma'] },
    { text: 'Redegøre for systemfunktioner som synkroniseringsværktøjer (mutex, semaforer) og memory pools.', topics: ['kritisk-sektion', 'mutex-spinlock', 'semaforer', 'monitor-cv', 'hukommelse-allokering'] },
    { text: 'Beskrive OS-komponenters funktioner, fx systemkald og processkontrol.', topics: ['os-dual-mode', 'processer', 'fork-exec', 'cpu-scheduling', 'posix-file-io'] },
    { text: 'Forklare og anvende trådsynkronisering, hukommelsesallokering og design af enhedsdrivere.', topics: ['mutex-spinlock', 'monitor-cv', 'hukommelse-allokering', 'paging', 'device-drivers'] },
    { text: 'Analysere synkroniseringseksempler (Dining Philosophers) og identificere deadlocks.', topics: ['dining-philosophers', 'deadlock-betingelser', 'deadlock-haandtering', 'bounded-buffer'] },
    { text: 'Integrere systemkomponenter som enhedsdrivere og memory management til komplekse softwaresystemer.', topics: ['device-drivers', 'mmap-io', 'gpio-interrupts', 'i2c-spi', 'messaging-system'] },
    { text: 'Implementere trådsikre programmer og event-drevne køer.', topics: ['traade', 'monitor-cv', 'bounded-buffer', 'message-passing', 'messaging-system'] },
    { text: 'Generalisere brugen af hukommelses- og ressourcehåndteringsprincipper.', topics: ['raii', 'smart-pointers', 'hukommelse-allokering', 'paging'] },
    { text: 'Designe og udføre eksperimenter og kritisk fortolke resultaterne for at validere tekniske løsninger.', topics: ['linux-shell', 'build-systemer', 'blocking-io', 'i2c-spi'] },
  ],
  gaps: [
    'Eksamensspørgsmålene findes ikke i tekst: kun som lydfilerne `podcasts/Eksamensspørgsmål_1..12.m4a`. Kursusintroen siger blot “Draw questions among subjects” (01.1a s. 9).',
    'Antallet af godkendte afleveringer: kursuskataloget siger tre, kursusintroen “Three-four hand-ins must be approved to enter exam” (01.1a s. 8).',
    'Docker og virtualisering står som blok 7 i kursuskataloget, men der er ingen slides, ingen kode og ingen lektion i kursusplanen. Bogens kap. 1 nævner virtualisering kort (se [[os-dual-mode|OS’ets rolle]]).',
    'Memory pools står i læringsmål 2, men ingen slides, ingen kursuskode og ingen af de medfølgende bogsider dækker dem.',
    'Bogudsnittene dækker kun kap. 1 og 3–8 (bogsiderne i `data/bogen/` er kap. 1, 3–8; PNG-nummeret er det trykte sidetal plus 24, og enkelte sider mangler, fx s. 356–360). Kap. 2 (systemkald), kap. 9–10 (hukommelse), kap. 12 (I/O-systemer) og kap. 18 (virtualisering) er ikke med, så hukommelse, I/O og drivere bygger alene på slides og kode.',
    'UART står i kursuskataloget (blok 6), men dækkes hverken af slides eller kode; det optræder kun som linjen `uart-pl011` i et `/proc/interrupts`-udtræk (09.2).',
    'Kursets kode har ingen `CMakeLists.txt` og intet character driver-modul; det eneste kernemodul er `gpio_isr.c`. Driverkoden i emnerne er slidenes.',
    'Markdown-konverteringerne af slides og bog indeholder tilføjelser og rettelser, der ikke står i originalerne (fx “spurious wakeup”, Meyers’ Singleton, omvendte DMA-signaler). Emnerne bygger på PDF-siderne; afvigelserne står under emnernes huller.',
    'Lektion 7, 13 og 14 er case studies (Space Shooter, Balance Ball) uden slides i materialet. Lektion 9 A gentager Message Passing, og lektion 11 B (User Space SPI) er decket *IO wrap-up*.',
    'PDF-filnavnene bruger andre ugenumre end kursusplanen (fx “Week_10” for lektion 9 B og “Week_13” for lektion 12 B). Emnerne her bruger kursusplanens lektionsnumre.',
  ],
  parts: [osVaerktoejer, processerTraade, synkronisering, deadlocks, posixIo, messagePassing, hukommelse, drivere],
}
