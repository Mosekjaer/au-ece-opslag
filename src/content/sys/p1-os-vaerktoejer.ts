import type { Part } from '../types'
import { k } from './paths'

const BOG = 'Silberschatz, Operating System Concepts (Global Edition)'

export const osVaerktoejer: Part = {
  id: 'os-vaerktoejer',
  title: 'OS og værktøjer',
  topics: [
    {
      slug: 'computersystem',
      title: 'Computersystemet: arkitektur og hukommelseshierarki',
      short: 'Computersystemet',
      week: 'Uge 1 · L1.1',
      definition:
        'Et **computersystem** er CPU, hukommelse og I/O-enheder, forbundet af en fælles bus. Kurset starter med **von Neumann-modellen** — en CPU med control unit og ALU, én hukommelse og input/output — og bygger op over processortyper og multiprocessing til **hukommelseshierarkiet**, hvor hastighed, størrelse og pris bytter plads fra registre ned til magnetbånd.',
      concepts: [
        {
          term: 'Von Neumann-arkitekturen',
          body: [
            'Slidet (s. 4) viser fire blokke: en **CPU** med *Control Unit* og *Arithmetic/Logic Unit*, en **Memory** under CPU’en med pil begge veje, og *Device Input* og *Device Output* på hver sin side. Instruktioner og data ligger i den samme hukommelse.',
            'Bogen beskriver modellen som instruktionscyklussen: en instruktion hentes (*fetch*) fra hukommelsen og lægges i instruction register, afkodes, henter eventuelle operander og udføres, og resultatet kan skrives tilbage. Hukommelsesenheden ser kun “a stream of memory addresses” — den ved ikke, om det, den leverer, er instruktioner eller data (bog 1.2.2).',
            'CPU’en kan kun udføre instruktioner fra hovedhukommelsen, så et program skal loades, før det kan køre. Hovedhukommelsen er **volatile** og byte-adresserbar, og der tilgås med `load` og `store` (bog s. 11).',
          ],
        },
        {
          term: 'Hardwareoversigt: bus og controllere',
          body: [
            'Slidet *Computing System* (s. 3, bogens figur 1.2) viser CPU og memory på en fælles **system bus** sammen med en *disk controller* (diske), en *USB controller* (mus, tastatur, printer) og en *graphics adapter* (skærm). Alle deler bussen.',
            'Bogen tilføjer, at hver **device controller** har sin egen lokale buffer og special-purpose-registre og flytter data mellem enheden og bufferen. OS’et har en **device driver** pr. controller, som giver resten af kernen en ensartet grænseflade. Når controlleren er færdig, siger den det med et *interrupt* — det tager [[interrupts-dma|interrupts og DMA]] op senere i kurset.',
            'Bogen skelner mellem **CPU** (hardwaren der udfører instruktioner), **processor** (den fysiske chip med én eller flere CPU’er), **core** (den grundlæggende beregningsenhed) og **multicore** (flere cores på samme CPU) (bog 1.3.1).',
          ],
        },
        {
          term: 'Processortyper: single-core, dual-core, SIMD',
          body: [
            'Slide s. 7 stiller tre processorer op. **Single-core**: én core med registre og cache, et L2-cache under, “One OS” og “One *process* executes at a time”. **Dual-core**: to cores med hver deres registre og cache og ét fælles L2-cache — “One or more OSs”, “Concurrent execution of *processes*” og “Shared physical address space”.',
            '**SIMD Processor (GPU)**: én *Instruction*-blok sender samme instruktion til fire cores, mens en *Data*-søjle fodrer hver core med sine egne data. “One OS” og “**S**ingle **I**nstruction runs on **M**ultiple **D**ata”.',
            'Bogens dual-core-figur (fig. 1.9) svarer til slidet: hver core har egne registre og **L1**-cache, og L2 deles. On-chip-kommunikation er hurtigere end mellem chips, og OS’et ser en processor med N cores som N standard-CPU’er (bog 1.3.2).',
          ],
        },
        {
          term: 'Multiprocessing: SMP, NUMA og clusters',
          body: [
            '**SMP** (slide s. 8): to CPU’er med hver sin cache mod én fælles *Main Memory*. Slidet skriver “OS per processor”, “Shared physical address space” og “**Contention limitation**” — alle CPU’er konkurrerer om samme hukommelse. Bogen definerer SMP som processorer, der er *peers* og hver udfører alle opgaver, også OS-funktioner.',
            '**NUMA** (slide s. 8, bog fig. 1.10): fire CPU’er, hver med sit eget *Memory*, forbundet på kryds. “Lower Contention”, “Shared physical address space”, “High Performance”. Bogen nævner prisen: adgang til en anden CPU’s lokale hukommelse har højere latency, så OS’et skal schedule og allokere med omtanke.',
            '**Clustered System**: en *Client* på et *Local Area Network* og tre *Computing Nodes* forbundet af en *High-speed data backbone*. “Managed by application SW” og “OS on each node”. Bogen kalder noderne *loosely coupled* og bruger dem til **high availability** — graceful degradation og fault tolerance (bog 1.3.3).',
          ],
        },
        {
          term: 'Hukommelseshierarkiet',
          body: [
            'Pyramiden (slide s. 5, bog fig. 1.6) går fra **registers**, **cache** og **main memory** (volatile, *primary storage*) over en stiplet linje til **nonvolatile memory** og **hard-disk drives** (*secondary storage*) og nederst **optical disk** og **magnetic tapes** (*tertiary storage*). Kapaciteten vokser nedad, adgangstiden også.',
            'Tabellen (slide s. 6 = bog fig. 1.14) giver tallene. Adgangstid: registre 0,25–0,5 ns, cache 0,5–25 ns, main memory 80–250 ns, SSD 25.000–50.000 ns, magnetisk disk 5.000.000 ns. Typisk størrelse: < 1 KB, < 16 MB, < 64 GB, < 1 TB, < 10 TB. Bandwidth: 20.000–100.000, 5.000–10.000, 1.000–5.000, 500 og 20–150 MB/s.',
            'Rækken **Managed by** er den vigtigste til eksamen: registre styres af **compileren**, cache af **hardware**, og main memory, SSD og disk af **operating system**. *Backed by*: registre af cache, cache af main memory, main memory og SSD af disk, disk af “disk or tape”.',
          ],
        },
        {
          term: 'Caching og kohærens',
          body: [
            '**Caching** betyder at kopiere data midlertidigt fra et langsomt lag til et hurtigere. Er data i cachen (hit), bruges de derfra; ellers hentes de fra laget under og lægges i cachen “under the assumption that we will need it again soon” (bog s. 31). Cachestørrelse og *replacement policy* afgør performance.',
            'Flytning fra cache til CPU og registre er typisk ren hardware; flytning fra disk til hukommelse styres af OS’et. Samme værdi kan ligge flere steder: bogens eksempel (fig. 1.15) er et heltal `A` i fil `B`, der kopieres disk → main memory → cache → register og derefter øges i registret, så kopierne er forskellige.',
            'Med flere CPU’er har hver sin cache, og en opdatering af `A` i én cache skal slå igennem i de andre: **cache coherency**, “usually a hardware issue” håndteret under OS-niveauet (bog 1.5.5).',
          ],
        },
        {
          term: 'Raspberry Pi som kursets system',
          body: [
            'Decket slutter (s. 13) med spørgsmålet “What type of computing system will we be exercising in SW3SYS?” og et billede af en Raspberry Pi: “CPU Architecture? Memory? Cache? SMP? SIMD? NUMA? Disk(s)?” — “We’ll explore this in the exercise”.',
            'Værktøjerne til at svare står i 01.2: `lscpu`, `cat /proc/cpuinfo`, `cat /proc/meminfo`, `lsblk`, `free -h` og på Pi’en `vcgencmd get_mem arm`/`gpu` (01.2 s. 15–16, se [[linux-shell|Linux-shell]]).',
          ],
        },
      ],
      viz: 'memory-hierarchy',
      keyPoints: [
        'Von Neumann: CPU (control unit + ALU), én hukommelse til instruktioner og data, input og output.',
        'CPU, memory og controllere deler system bus; hver controller har en driver i OS’et.',
        'Single-core: én proces ad gangen. Dual-core: concurrent execution og delt fysisk adresserum. SIMD: én instruktion på mange data.',
        'SMP har contention om én main memory; NUMA har lokal hukommelse pr. CPU og dyrere remote access.',
        'Hierarkiet: registre (0,25–0,5 ns) → cache → main memory (80–250 ns) → SSD → disk (5.000.000 ns).',
        'Managed by: compiler (registre), hardware (cache), OS (main memory og nedefter).',
        'Volatile over den stiplede linje, nonvolatile under.',
        'Flere caches med samme data kræver cache coherency — et hardwareproblem.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Characteristics of various types of storage',
          source: '01.1b-SW3SYS-Introduction-to-Computing-Systems.pdf s. 6',
          code: `Level              1                  2                 3                4               5
Name               registers          cache             main memory      solid-state     magnetic disk
Typical size       < 1 KB             < 16MB            < 64GB           < 1 TB          < 10 TB
Implementation     custom memory      on-chip or        CMOS SRAM        flash memory    magnetic disk
technology         with multiple      off-chip
                   ports CMOS         CMOS SRAM
Access time (ns)   0.25-0.5           0.5-25            80-250           25,000-50,000   5,000,000
Bandwidth (MB/sec) 20,000-100,000     5,000-10,000      1,000-5,000      500             20-150
Managed by         compiler           hardware          operating system operating system operating system
Backed by          cache              main memory       disk             disk            disk or tape`,
        },
        {
          lang: 'bash',
          title: 'Undersøg Pi’ens hardware fra shellen',
          source: '01.2-Week_1_-_Introduction_to_Operating_Systems.pdf s. 15–16',
          code: `lscpu                   # display CPU info
lsblk                   # display storage device information
cat /proc/cpuinfo       # display info about the CPU
cat /proc/meminfo       # display info about system memory
vcgencmd get_mem gpu    # displays GPU memory size
vcgencmd get_mem arm    # displays ARM memory size
free -h                 # displays memory statistics`,
        },
      ],
      exam: [
        'Et computersystem består efter von Neumann af en CPU med control unit og ALU, én hukommelse til både instruktioner og data, og input- og outputenheder. CPU’en henter instruktioner fra hukommelsen, afkoder og udfører dem, og hukommelsen kan ikke se forskel på instruktioner og data.',
        'I praksis hænger CPU, hukommelse og controllere for disk, USB og grafik på en fælles bus, og hver controller har en driver i OS’et. Med flere cores får vi concurrent execution og et delt fysisk adresserum; i SMP deler alle CPU’er én main memory og konkurrerer om den, mens NUMA giver hver CPU lokal hukommelse til prisen af dyrere remote access.',
        'Hukommelseshierarkiet bytter hastighed for størrelse: registre er under et nanosekund og under 1 KB, main memory er 80–250 ns og op til 64 GB, og en magnetisk disk er 5 millioner ns. Registrene styres af compileren, cachen af hardwaren, og alt fra main memory og ned af operativsystemet.',
        'Konsekvensen er caching: samme værdi kan ligge på disk, i RAM, i cache og i et register på én gang, og med flere CPU’er skal cache coherency sikre, at alle ser den nyeste værdi. Det er grunden til, at delte data mellem tråde senere i kurset kræver synkronisering.',
        'På Raspberry Pi’en kan man selv finde svarene med `lscpu`, `/proc/cpuinfo` og `/proc/meminfo` — decket overlader netop spørgsmålet “SMP? SIMD? NUMA?” til øvelsen.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture0.1.1b_IntroductionToComputingSystems.md'), original: '01.1b-SW3SYS-Introduction-to-Computing-Systems.pdf', pages: 's. 3–8, 13', note: 'Computing system, von Neumann, memory hierarchy (1:2 og 2:2), processors, processing architectures, Raspberry Pi' },
        { path: k('context/book/SW3SYS-01_Ch01_Introduction.md'), original: BOG, pages: 'afsnit 1.2–1.3 og 1.5.5 (s. 11, 31; PNG s. 28–59)', note: 'Storage structure, multiprocessor systems, cache management, fig. 1.6, 1.9, 1.10, 1.14, 1.15' },
        { path: k('context/slides/SW3SYS-01_Lecture01.2_Introduction_to_Linux_OS.md'), original: '01.2-Week_1_-_Introduction_to_Operating_Systems.pdf', pages: 's. 15–16', note: 'System commands and tools' },
      ],
      gaps: [
        'Slides og bog er uenige om SMP: slidet skriver “OS per processor” (01.1b s. 8), mens bogen definerer SMP som processorer, der er peers og alle udfører OS-funktioner og brugerprocesser (bog 1.3.2).',
        'Tabellen på slide s. 6 er bogens fig. 1.14 og angiver main memory som “CMOS SRAM”. Bogen selv siger på s. 11, at main memory “commonly is implemented in … DRAM”. Tabellen og brødteksten i bogen modsiger altså hinanden.',
        'PDF’ens rækkefølge afviger fra markdown-konverteringen: *Role of Operating System* er s. 2, *Computing System* s. 3, von Neumann s. 4, hierarkiet s. 5–6, processorer s. 7, multiprocessing s. 8. Markdown-afsnitsnumrene kan ikke bruges som sidetal.',
        'Markdown-konverteringen tilføjer ting, der ikke står i PDF’en: “stored-program concept”, en sammenligning med Harvard-arkitekturen og svarene på Raspberry Pi-spørgsmålene (“ARM-baseret”, “microSD”). Slidet besvarer ikke spørgsmålene; de hører til øvelsen.',
        'Kursets Raspberry Pi-model og dens cache/NUMA-forhold står ikke i 01.1b. Kursusintroduktionen nævner Raspberry Pi 5, men arkitekturspørgsmålene fra s. 13 besvares ikke nogen steder i materialet.',
        'Uden for materialet: slidets single-core-figur viser “Cache” i coren og “L2-Cache” under; betegnelsen L1 bruges kun i bogen (fig. 1.9).',
      ],
      keywords: ['von Neumann', 'control unit', 'ALU', 'system bus', 'device controller', 'device driver', 'single-core', 'dual-core', 'multicore', 'SIMD', 'GPU', 'SMP', 'symmetric multiprocessing', 'NUMA', 'clustered system', 'contention', 'memory hierarchy', 'hukommelseshierarki', 'registers', 'cache', 'L1', 'L2', 'main memory', 'RAM', 'DRAM', 'SRAM', 'SSD', 'NVM', 'volatile', 'nonvolatile', 'cache coherency', 'Raspberry Pi', 'lscpu'],
    },

    {
      slug: 'os-dual-mode',
      title: 'OS’ets rolle, dual mode og systemkald',
      short: 'Dual mode og systemkald',
      week: 'Uge 1 · L1.1',
      definition:
        'Operativsystemet er **mellemlaget** mellem applikationerne og hardwaren: det fordeler CPU, hukommelse og I/O og beskytter programmerne mod hinanden. Beskyttelsen hviler på **dual-mode operation** — brugerkode kører i *user mode*, OS’et i *kernel mode*, og den eneste vej ind er et **systemkald**, der via en **trap** skifter mode.',
      concepts: [
        {
          term: 'OS’ets rolle',
          body: [
            'Slide s. 2 (bogens fig. 1.1) viser fire lag med pile begge veje: *user* → *application programs* (“compilers, web browsers, development kits, etc.”) → *operating system* → *computer hardware* (“CPU, memory, I/O devices, etc.”).',
            'Bogen sammenligner OS’et med en regering: det “performs no useful function by itself” men skaber et miljø, hvor andre programmer kan arbejde. Set fra systemet er OS’et en **resource allocator**, der fordeler CPU-tid, hukommelse, lagerplads og I/O mellem konkurrerende krav, og et **control program**, der styrer brugerprogrammers udførelse for at forhindre fejl og misbrug (bog 1.1).',
            'Den del, der altid kører, er **kernen**. Omkring den ligger *system programs* og *application programs* (bog 1.1).',
          ],
        },
        {
          term: 'Interrupts og traps',
          body: [
            'Hardware beder om CPU’ens opmærksomhed med et **interrupt**: CPU’en tjekker *interrupt-request line* efter hver instruktion, læser interrupt-nummeret og hopper via **interrupt vector** — en tabel med adresser på handlers i lav hukommelse — til den rette rutine. Handleren gemmer tilstanden, gør arbejdet og returnerer med `return_from_interrupt` (bog 1.2.1).',
            'Intels event-vector-tabel (bog fig. 1.5, s. 11) har bl.a. 0 *divide error*, 3 *breakpoint*, 13 *general protection*, 14 *page fault* og 32–255 *maskable interrupts*. Nonmaskable interrupts er reserveret til fejl som hukommelsesfejl.',
            'En **trap** (eller *exception*) er et softwaregenereret interrupt — enten en fejl (division med nul, ugyldig hukommelsesadgang) eller en bevidst anmodning fra et brugerprogram om en OS-tjeneste: et **systemkald** (bog 1.4). Detaljerne om interrupts, bus og DMA kommer i [[interrupts-dma|uge 9]].',
          ],
        },
        {
          term: 'Multiprogramming og multitasking',
          body: [
            'Slide s. 9 nævner tre *Operating System Operations*: “Multiprogramming & multitasking”, “Dual-Mode & Multipmode operation” og “Timer (Maintain control!)”.',
            '**Multiprogramming** holder flere processer i hukommelsen, så CPU’en altid har noget at køre: når én venter på I/O, skifter OS’et til en anden (bog 1.4.1, fig. 1.12 med OS øverst og process 1–4 under). Bogens analogi er en advokat, der arbejder på andre sager, mens én venter. **Multitasking** er den logiske udvidelse, hvor CPU’en skifter så ofte, at brugeren får hurtig *response time*.',
            'Slide s. 10 illustrerer med et vasketøjsdiagram (6 PM–2 AM, opgaverne A–D): øverst tager hver opgave sin tur hele vejen igennem, nederst overlapper de, og alt er færdigt omkring kl. 9–9.30. Hvilken proces der kører næste gang, er **CPU scheduling** — det er [[cpu-scheduling|uge 3]].',
          ],
        },
        {
          term: 'Dual mode og mode bit',
          body: [
            'Slide s. 11 deler lagene i *User Space (Unpriviliged)* og *Kernel Space (Priviliged)* over *Hardware*. Bogen præciserer mekanismen: en **mode bit** i hardwaren — **0 = kernel mode**, **1 = user mode** (bog 1.4.2, fig. 1.13).',
            'Ved boot starter hardwaren i kernel mode. OS’et loader og starter brugerprogrammer i user mode. Ved hvert interrupt eller trap sætter hardwaren mode bit til 0, og OS’et sætter den til 1, før det giver kontrollen tilbage (bog s. 25).',
            '**Privileged instructions** kan kun udføres i kernel mode; forsøges de i user mode, udfører hardwaren dem ikke, men trapper til OS’et. Eksempler: skift til kernel mode, I/O-kontrol, timer management og interrupt management. Ulovlige instruktioner eller adgang uden for eget adresserum får OS’et til at terminere programmet “abnormally”, evt. med memory dump.',
            'Modes kan være flere end to: Intel har fire **protection rings** (ring 0 = kernel, ring 3 = user), ARMv8 har syv modes, og CPU’er med virtualisering har ofte en særlig mode til **VMM** med flere privilegier end brugerprocesser, men færre end kernen (bog s. 25).',
          ],
        },
        {
          term: 'Systemkaldet trin for trin',
          body: [
            'Slide s. 11: *User Process* → “1. Invoke Sys Call” → *System Call* → “2. Trap” ind i kernel space → *Execute System Call* → “3. Return”. Bogens fig. 1.13 viser det samme med mode bit: “calls system call” → trap (mode bit = 0) → “execute system call” → return (mode bit = 1) → “return from system call”.',
            'Kernen undersøger det udløsende instruktionsargument for at se, hvilken tjeneste der ønskes, verificerer parametrene, udfører forespørgslen og returnerer kontrollen til instruktionen efter systemkaldet (bog 1.4.2).',
            'I kursets kode er `read()` og `write()` fra `<unistd.h>` den direkte vej til systemkald: `blocking_io.cpp` skriver med `write(STDOUT_FILENO, …)` og blokerer i `read(STDIN_FILENO, …)`, til brugeren har tastet. Det er udgangspunktet for [[posix-file-io|POSIX file I/O]] og [[blocking-io|blocking I/O]].',
          ],
        },
        {
          term: 'Timeren',
          body: [
            'Slidet kalder timeren “Maintain control!” (s. 9). Bogen forklarer: en hardwaretimer giver et interrupt efter en fastsat periode, så et brugerprogram ikke kan hænge i en uendelig løkke og aldrig give kontrollen tilbage. En *variable timer* er et fast ur og en tæller; med en 10-bit tæller og et 1 ms-ur kan intervallet sættes fra 1 til 1024 ms (bog 1.4.3).',
            'På Linux angiver kernelparameteren `HZ` frekvensen: `HZ = 250` giver 250 timer-interrupts i sekundet, ét hvert 4. ms, og kernevariablen `jiffies` tæller interrupts siden boot. At ændre timeren er selv en privileged instruction.',
          ],
        },
        {
          term: 'Resource management og system call interface',
          body: [
            'Slide s. 12 er ldd3’s figur over Linux-kernen: øverst **The System Call Interface**, derunder fem subsystemer — *Process management* (concurrency, multitasking), *Memory management* (virtual memory), *Filesystems* (files and dirs: the VFS, block devices), *Device control* (ttys og character devices) og *Networking* (connectivity, network subsystem, IF drivers) — over hardwaren (CPU, memory, disks, consoles, network interfaces). Process management er fremhævet.',
            'Bogen (1.5) giver ansvarslisterne: **process management** opretter og sletter processer, scheduler processer og tråde, suspenderer og genoptager, og leverer mekanismer til synkronisering og kommunikation; **memory management** holder styr på brugt hukommelse, allokerer og deallokerer og beslutter hvad der flyttes ind og ud; derudover file-system-, mass-storage-, cache- og I/O-management.',
            '**Virtualisering** står kort i bog 1.7: hardwaren abstraheres til flere eksekveringsmiljøer (VM’er), hver med sin egen kerne oven på en **virtual machine manager** (fig. 1.16). Emulering oversætter instruktioner mellem forskellige CPU-typer og er langsom; virtualisering kører et OS kompileret til samme CPU (bog s. 34–35). Docker står i kursuskataloget, men har ingen slides; se [[bad/docker|Docker i BAD]].',
          ],
        },
      ],
      viz: 'dual-mode-trap',
      keyPoints: [
        'OS’et er resource allocator og control program mellem applikationer og hardware.',
        'Interrupt = hardware beder om CPU’en; trap = softwaregenereret (fejl eller systemkald).',
        'Mode bit: 0 = kernel mode, 1 = user mode. Boot i kernel mode; hardwaren sætter 0 ved hvert interrupt/trap.',
        'Privileged instructions (I/O, timer, interrupts) trapper til OS’et, hvis de forsøges i user mode.',
        'Systemkald: invoke → trap → execute i kernel → return til user mode.',
        'Timeren sikrer, at OS’et får kontrollen tilbage; Linux `HZ = 250` = interrupt hvert 4. ms.',
        'Multiprogramming holder CPU’en beskæftiget; multitasking skifter ofte for response time.',
        'Kernen: system call interface over process-, memory-, filesystem-, device- og netværksstyring.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Transition from user to kernel mode',
          source: 'Silberschatz fig. 1.13, s. 25 og 01.1b-SW3SYS-Introduction-to-Computing-Systems.pdf s. 11',
          code: `user process (user mode, mode bit = 1)
  user process executing
      -> calls system call            1. Invoke Sys Call
          -> trap, mode bit = 0       2. Trap
kernel (kernel mode, mode bit = 0)
          execute system call
          -> return, mode bit = 1     3. Return
user process (user mode, mode bit = 1)
      return from system call`,
        },
        {
          lang: 'cpp',
          title: 'Systemkald i kursets kode: write() og read()',
          source: 'lecture-code-main/week_6_posix_blocking_nonblocking_io/blocking_io/blocking_io.cpp',
          code: `#include <iostream>
#include <unistd.h>
#include <cstring>

#define BUF_SIZE 128

int main() {
    char buffer[BUF_SIZE];

    // Write to standard output (screen)
    const char* prompt = "Enter some text: ";
    write(STDOUT_FILENO, prompt, strlen(prompt));

    // Read from standard input (keyboard)
    ssize_t bytes = read(STDIN_FILENO, buffer, BUF_SIZE-1);
    if (bytes < 0) {
        perror("read()");
        return EXIT_FAILURE;
    }

    std::cout << "read() completed!\\n";

    // Null-terminate string in buffer
    buffer[bytes] = '\\0';
    // …
    return EXIT_SUCCESS;
}`,
        },
      ],
      exam: [
        'Operativsystemet er laget mellem applikationerne og hardwaren; set fra systemet er det en resource allocator, der fordeler CPU, hukommelse og I/O, og et control program, der forhindrer programmer i at ødelægge for hinanden.',
        'Beskyttelsen bygger på dual-mode operation: en mode bit i hardwaren er 0 i kernel mode og 1 i user mode. Privileged instructions som I/O-kontrol og timerstyring kan kun køre i kernel mode — forsøges de i user mode, trapper hardwaren til OS’et, som typisk afslutter programmet.',
        'Et systemkald er den lovlige vej ind: programmet kalder fx `read()`, en trap sætter mode bit til 0 og hopper via interrupt vector til kernen, kernen tjekker parametrene og udfører arbejdet, og returneringen sætter mode bit til 1 igen. I kursets `blocking_io.cpp` blokerer `read(STDIN_FILENO, …)` i kernen, indtil der er input.',
        'Timeren sikrer, at OS’et altid får kontrollen tilbage — på Linux med `HZ = 250` kommer der et interrupt hvert 4. millisekund — og det er forudsætningen for multitasking, hvor CPU’en skifter mellem processer så ofte, at de ser ud til at køre samtidig.',
        'Faldgruben er at blande interrupt og trap sammen: et interrupt kommer asynkront fra hardware, en trap er softwaregenereret af den kørende instruktion, men begge sender CPU’en i kernel mode via samme vektortabel.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture0.1.1b_IntroductionToComputingSystems.md'), original: '01.1b-SW3SYS-Introduction-to-Computing-Systems.pdf', pages: 's. 2, 9–12', note: 'Role of OS, OS operations, multiprogramming & multitasking, dual mode, resource management (ldd3)' },
        { path: k('context/book/SW3SYS-01_Ch01_Introduction.md'), original: BOG, pages: 'afsnit 1.1, 1.2.1, 1.4–1.5, 1.7 (s. 4, 11, 25, 34–35; PNG s. 28–59)', note: 'Interrupts, dual-mode, timer, resource management, virtualisering' },
        { path: k('data/lecture-code-main/lecture-code-main/week_6_posix_blocking_nonblocking_io/blocking_io/blocking_io.cpp'), note: 'read()/write() som systemkald' },
      ],
      gaps: [
        'Bogens kapitel 2 (system calls, API, systemkaldstabel, parameteroverførsel) er ikke med i materialet. Systemkaldsgrænsefladen findes kun som figuren fra ldd3 på slide s. 12 og som mekanismen i bog 1.4.2 — der er ingen liste over Linux-systemkald eller forskel på libc-wrapper og selve kaldet.',
        'Slidet nævner ikke mode bit; den står kun i bogen (s. 25). Slidet skelner heller ikke mellem interrupt og trap — det gør bogen (1.2.1 og 1.4).',
        'Slide s. 10 har ingen tekst, kun vasketøjsfiguren. Markdown-konverteringens tal “typisk hver 10–100 ms” for multitasking står hverken på slidet eller i bogens kap. 1; bogens eneste tal er timereksemplet (1–1024 ms) og Linux’ `HZ = 250`.',
        'Uden for materialet: vasketøjsfiguren på s. 10 er den klassiske illustration af instruktions-*pipelining* (Patterson & Hennessy), ikke af time-sharing — den viser overlappende faser (vask, tør, fold), ikke en CPU der skifter mellem opgaver.',
        'Docker og containere står i kursuskatalogets indhold, men har ingen slides eller kode. Virtualisering dækkes kun af bog 1.7 (s. 34–35); markdown-konverteringens “Type 1/Type 2 hypervisor” står ikke på de sider, bogen henviser selv til kap. 18, som ikke er i materialet.',
        'Stavefejl på slidene: “Multipmode” (s. 9), “Unpriviliged” og “Priviliged” (s. 11).',
      ],
      keywords: ['operating system', 'OS', 'kernel', 'kerne', 'resource allocator', 'control program', 'interrupt', 'trap', 'exception', 'interrupt vector', 'system call', 'systemkald', 'syscall', 'dual mode', 'user mode', 'kernel mode', 'mode bit', 'privileged instruction', 'protection rings', 'multiprogramming', 'multitasking', 'time-sharing', 'timer', 'HZ', 'jiffies', 'system call interface', 'VFS', 'virtualization', 'VMM', 'hypervisor', 'Docker', 'read', 'write'],
    },

    {
      slug: 'linux-shell',
      title: 'Linux-shell, rettigheder og bash scripting',
      short: 'Linux-shell og bash',
      week: 'Uge 1 · L1.2',
      definition:
        '**Shellen** er et program, der tager kommandoer fra tastaturet og sender dem til operativsystemet — “an interface to the OS”. Næsten alle Linux-distributioner bruger **Bash** (Bourne Again Shell). Lektionen dækker prompten, filkommandoer og mappetræet, **filrettigheder** i symbolsk og oktal notation, `sudo`, system- og netværkskommandoer, SSH og **bash scripts**.',
      concepts: [
        {
          term: 'Shell og prompt',
          body: [
            'Programmer som *Terminal* eller *Console* starter en shell, og man kan også få en via `ssh`. Ud over Bash findes `ksh`, `zsh` og `tcsh`. Prompten står foran alle kommandoer og er “always persistent” (01.2 s. 3).',
            'Prompten `pi@raspberrypi ~ $` læses i fire dele (s. 4): `pi` er brugeren, der er logget ind; `raspberrypi` er hostname, det navn andre computere bruger om maskinen; `~` er den aktuelle mappe, hvor `~` betyder brugerens home directory (`/home/pi`); og `$` betyder normal bruger — en superuser får `#`.',
          ],
        },
        {
          term: 'Filkommandoer og mappetræet',
          body: [
            'Filkommandoerne (s. 11–12): `ls` (indhold), `touch` (opret eller opdatér fil), `cd`, `mv` (flyt eller omdøb), `rm`, `rmdir` (mappen skal være tom og ikke din aktuelle), `mkdir`, `pwd`, `cp`, `wget`; og til visning og søgning `cat`, `tail` og `head` (sidste/første ti linjer), `more`, `less` (også baglæns), `grep`, `find`, `tar`, `rsync` og `lsof` (alle åbne filer).',
            'Mappetræet for Raspberry Pi (s. 5–7) har roden `/`. *Must know*: `/bin` (små programmer der opfører sig som kommandoer, fx `ls` og `mkdir`), `/boot` (kernen og Pi’ens konfiguration), `/dev` (enheder), `/etc` (konfiguration for alle brugere), `/home`, `/lib`, `/media`, `/sbin` (systemvedligehold), `/sys` (hardwareenheder på Pi’en), `/tmp`, `/usr`, `/var` (logs og spoolfiler) og `/var/www/html` (webserverfiler).',
            '*Good to know*: `lost+found` (gendannede filer efter et korrupt filsystem), `media` (flytbare medier dukker op her), `mnt` (medier man selv monterer) og `root` (kun til root-brugeren). `/dev` og `/sys` bliver centrale igen ved [[device-drivers|device drivers]] og [[gpio-interrupts|GPIO]].',
          ],
        },
        {
          term: 'Filrettigheder: ls -l',
          body: [
            '`ls -l` viser rettighederne. I slidets eksempel (s. 23) læses linjen `-rwxrw-rw- 2 dan jcrew 1132 Apr 15 21:22 run.py` felt for felt: første tegn er **file type** (`-` fil, `d` directory), så tre tegn **user permission**, tre **group permission**, tre **others permission**, derefter **# of hard links** (2), **owner name** (`dan`) og **group name** (`jcrew`).',
            'Symbolerne er `r` (readable), `w` (writable), `x` (executable) og `-` (denied). `rwxrw-rw-` betyder, at `run.py` kan læses og skrives af `dan`, af medlemmer af `jcrew` og af alle andre, men kun køres af `dan` (s. 24).',
          ],
        },
        {
          term: 'Oktal notation og chmod',
          body: [
            'Hver gruppe på tre bits er et oktalt ciffer: `r = 4`, `w = 2`, `x = 1`. Tabellen (s. 25) går fra `000` = 0 = `---` (No Permission) over `100` = 4 = `r--` og `101` = 5 = `r-x` til `111` = 7 = `rwx`. `rwxrw-rw-` er altså `111 110 110` = **766**.',
            'For at forhindre *others* i at ændre `run.py` skriver slidet `chmod 764 run.py` — eller symbolsk `chmod o-w run.py` (s. 24).',
            'Den symbolske syntaks er `chmod <user type> <±> <permission type> <filename>` (s. 26) med user types `u` (owner), `g` (group), `o` (other), `a` (all), `+` for tilføj og `-` for fjern. Slidets eksempler: `chmod u+r`, `chmod a+w` og `chmod go-wx`. De øvrige brugerkommandoer er `chgrp`, `chown`, `useradd`, `adduser`, `passwd`, `usermod`, `userdel`, `groupadd` og `groupmod` (s. 13).',
          ],
        },
        {
          term: 'sudo, root og su',
          body: [
            'Linux er multiuser: hver bruger har ansvar for sine egne filer. For at ændre systemfiler eller andres filer kræves root- eller superuser-privilegier — “use it with extreme caution!” (s. 8).',
            '`sudo` giver root-privilegier *midlertidigt* til én kommando, fx `sudo rm SomeFile`; første gang spørges om ens eget password. `root` har kontrol over alt, og slidet anbefaler at bruge `sudo` i stedet for at logge ind som root. `su` giver root-adgang i en længere periode — “NOT RECOMMENDED!” — prompten skifter til `root`, og man går ud med `exit` (s. 9).',
            'Bogen (1.6) forklarer mekanismen bagved: hver bruger har et **user ID** og et eller flere **group ID’er**, som følger alle brugerens processer og tråde, og UNIX’ **setuid**-attribut lader et program køre med filejerens ID — det *effective UID* — indtil det slår privilegierne fra eller afslutter.',
          ],
        },
        {
          term: 'System, netværk og SSH',
          body: [
            'System (s. 15–16): `df -h` (ledig plads), `du -h`, `lscpu`, `lsblk`, `lsusb`, `fdisk -l`, `cat /proc/cpuinfo`, `/proc/meminfo`, `/proc/partitions`, `/proc/version`, `vcgencmd measure_temp`, `free -h`, `vmstat`, `uname -a`, `ps -A` (alle processer), `top`, `kill` (kræver process-id fra `ps -A`) og `uptime`. Netværk (s. 14): `hostname`, `ping`, `traceroute`, `netstat`, `route`, `host`, `ifconfig`, `nslookup`, `dig` og `w`.',
            'Pi-specifikt (s. 10): `startx`, `sudo shutdown -h now`/`sudo poweroff`, `sudo reboot`/`sudo shutdown -r now`, `sudo raspi-config`, samt hjælp med `man <command name>` og `<command> --help`.',
            '**SSH** er “a program that allows a remote client machine to establish encrypted network connections to a host machine (both machines are untrusted)” (s. 17). Fra Windows bruges PuTTY; efter login som `pi` kommer velkomstteksten og bash-prompten `pi@raspberrypi:~ $` (s. 18). Det er sådan man kører Pi’en *headless*.',
          ],
        },
        {
          term: 'Bash scripting og kompilering fra shellen',
          body: [
            'Et **bash script** er “a file containing a sequence of commands that are executed by the bash program” (s. 19). Fordelene ifølge slidet: automation, portability, flexibility, accessibility, integration og debugging.',
            'Opskriften (s. 20): opret filen med `nano <filename>.sh` (`.sh` er konvention, ikke krav), skriv **shebang** `#!/bin/bash` i første linje — “an absolute path to the bash interpreter” — tilføj kommandoer, giv execute-ret med `chmod u+x <filename>.sh`, og kør med `sh`, `bash` eller `./<filename>.sh`.',
            'Eksemplet på s. 21 bruger `echo` med backticks om `date`, `echo -e` så `\\n` og andre escapes fortolkes, `read the_path` der gemmer tastaturinput i en variabel, og `ls $the_path`. Til sidst kompileres C++ fra shellen (s. 27): `g++ hello.cpp -o hello.out` og `./hello.out`; `ls -l` før og efter viser den nye fil `hello.out` på 18732 bytes med `-rwxr-xr-x`. Øvelsen (s. 29) er at pakke netop det ind i et script — og [[build-systemer|Make]] er næste skridt.',
          ],
        },
      ],
      viz: 'chmod-bits',
      keyPoints: [
        'Prompten `pi@raspberrypi ~ $`: bruger, hostname, aktuel mappe, `$` (normal) eller `#` (superuser).',
        '`ls -l`: filtype, user/group/others-rettigheder, hard links, owner, group.',
        '`r = 4`, `w = 2`, `x = 1`; `rwxrw-rw-` = 766.',
        '`chmod 764 run.py` ≡ `chmod o-w run.py` for filen i slidets eksempel.',
        'Symbolsk: `chmod u|g|o|a +|- r|w|x fil`.',
        'Brug `sudo` til én kommando; `su` er “NOT RECOMMENDED”.',
        'Script: shebang `#!/bin/bash`, `chmod u+x`, kør med `./script.sh`.',
        'SSH giver en krypteret shell på Pi’en uden skærm (headless).',
      ],
      code: [
        {
          lang: 'bash',
          title: 'Bash scripting example',
          source: '01.2-Week_1_-_Introduction_to_Operating_Systems.pdf s. 21',
          code: `#!/bin/bash
echo "Today is " \`date\`

echo -e "\\nenter the path to directory"
read the_path

echo -e "\\n your path has the following files and folders: "
ls $the_path`,
        },
        {
          lang: 'bash',
          title: 'Rettigheder: fra rwxrw-rw- til 764',
          source: '01.2-Week_1_-_Introduction_to_Operating_Systems.pdf s. 24–26',
          code: `dan@mylinux: $ ls -l
-rwxrw-rw-   2 dan  jcrew     1132 Apr 15 21:22 run.py

# rwx rw- rw-  ->  111 110 110  ->  766
chmod 764 run.py        # others may no longer write
chmod o-w run.py        # same change, symbolic notation

chmod u+r <filename>.<extension>     # add read for owner
chmod a+w <filename>.<extension>     # add write for everyone
chmod go-wx <filename>.<extension>   # remove write+execute for group and other`,
        },
        {
          lang: 'bash',
          title: 'Kompilering fra shellen',
          source: '01.2-Week_1_-_Introduction_to_Operating_Systems.pdf s. 27',
          code: `localhost:~# g++ hello.cpp -o hello.out
localhost:~# ls -l
-rw-r--r--    1 root     root          103 Aug 27 22:14 hello.cpp
-rwxr-xr-x    1 root     root        18732 Aug 27 22:19 hello.out
-rwxr--r--    1 root     root          299 Aug 27 22:04 myscript.sh
localhost:~# ./hello.out
Hello world!`,
        },
      ],
      exam: [
        'Shellen er et program, der tager kommandoer og sender dem til operativsystemet; på Raspberry Pi’en er det Bash, og prompten `pi@raspberrypi ~ $` fortæller bruger, hostname, aktuel mappe og om man er almindelig bruger (`$`) eller superuser (`#`).',
        'Rettighederne står i `ls -l` som ti tegn: filtype og så tre grupper af `rwx` for owner, group og others. Hver gruppe er tre bits med `r = 4`, `w = 2` og `x = 1`, så slidets `rwxrw-rw-` er 766, og `chmod 764 run.py` — eller `chmod o-w run.py` — fjerner skriveretten for alle andre.',
        'Et bash script er en fil med kommandoer: første linje er shebang `#!/bin/bash`, filen skal have execute-ret med `chmod u+x`, og så køres den med `./script.sh`. Kursets eksempel læser en sti med `read` og lister den med `ls $the_path`.',
        'Root-privilegier tager man med `sudo` foran den enkelte kommando frem for at logge ind som root eller bruge `su`, fordi root kan ødelægge systemet. Bagved ligger bogens user ID, group ID og setuid, hvor en proces kan køre med et andet effective UID end brugerens.',
        'Faldgruben ved oktal notation er, at den sætter alle ni bits på én gang, mens `chmod u+x` kun ændrer én — oktalt skal man altså kende hele den ønskede tilstand.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture01.2_Introduction_to_Linux_OS.md'), original: '01.2-Week_1_-_Introduction_to_Operating_Systems.pdf', pages: 's. 2–29', note: 'Hele decket; rettigheder s. 22–26, scripting s. 19–21, kompilering s. 27, øvelse s. 29' },
        { path: k('context/book/SW3SYS-01_Ch01_Introduction.md'), original: BOG, pages: 'afsnit 1.6 (s. 33–34; PNG s. 57–58)', note: 'User ID, group ID, privilege escalation, setuid, effective UID' },
      ],
      gaps: [
        'Slide s. 9 skriver `sudo root passwd` for at sætte root-passwordet. Uden for materialet: den gyldige kommando er `sudo passwd root`; `root` er ikke en kommando.',
        'Decket beskriver `/lib` to gange forskelligt: “Kernel modules and drivers” (s. 5) og “various libraries that are used by different OS programs” (s. 6).',
        'Slide s. 26 skriver “(or ??)” efter hvert symbolsk `chmod`-eksempel og lader den oktale form stå som opgave. Der findes intet unikt oktalt svar på fx `chmod u+r`, fordi oktal notation sætter alle bits, mens den symbolske form kun ændrer én. Markdown-konverteringens `chmod 4??` er ikke et svar.',
        'Markdown-konverteringen har en “Mulig løsning” til øvelsen (s. 29) med `read source_file` og `g++ $source_file -o $output_file`. Den står ikke i PDF’en.',
        'Bash scripting dækkes kun med `echo`, `read`, variabler og backticks. Kommandolinjeargumenter (`$1`), betingelser, løkker, pipes og redirection er ikke i materialet.',
        'Skærmbilledet på s. 18 er gammelt: to forskellige IP-adresser (`192.168.137.2` og `192.168.0.51`) og en velkomst fra “Linux raspberrypi 4.9.41+ … 2017 armv6l” — ikke kursets Raspberry Pi 5.',
        'SSH vises kun via PuTTY fra Windows; kommandoen `ssh` fra Linux/macOS og nøglebaseret login er ikke vist. Slide s. 15 staver `/proc/partions` (skal være `/proc/partitions`).',
      ],
      keywords: ['shell', 'bash', 'Bourne Again Shell', 'terminal', 'prompt', 'home directory', 'tilde', 'superuser', 'root', 'ls', 'cd', 'pwd', 'mkdir', 'grep', 'find', 'directory tree', '/dev', '/etc', '/proc', 'ls -l', 'permissions', 'rettigheder', 'rwx', 'octal', 'oktal', 'chmod', 'chown', 'chgrp', 'sudo', 'su', 'setuid', 'SSH', 'PuTTY', 'headless', 'shebang', 'bash script', 'echo -e', 'read', 'g++', 'ps -A', 'kill'],
    },

    {
      slug: 'build-systemer',
      title: 'Make, CMake og cross-compilation',
      short: 'Make og CMake',
      week: 'Uge 2 · L2.2 og Uge 4 · L4.2',
      definition:
        'Et **build system** automatiserer kompileringen: det finder kildefiler, bestemmer rækkefølgen og genbygger kun det, der er ændret. **GNU Make** læser regler (*target: dependencies* + kommandoer) fra en `Makefile` og sammenligner tidsstempler. **CMake** er ikke selv et build system, men en *build system generator*, der ud fra `CMakeLists.txt` skriver Makefiles, Visual Studio- eller Xcode-projekter — også til en anden målplatform ved **cross-compilation**.',
      concepts: [
        {
          term: 'Hvorfor et build system',
          body: [
            'Compileren alene kan ikke finde kildefiler og biblioteker i andre mapper og kan ikke regne kompileringsrækkefølgen ud. Et shell script har andre problemer: det skalerer dårligt, scriptingen tager lige så lang tid som koden, at bygge alt fra bunden er sikkert men langsomt, koordinering på tværs af maskiner og OS-versioner er besværlig, og man skal stadig selv køre scriptet (02.2 s. 2).',
            'Kompileringskæden på samme slide: sources (`.c`, `.cpp`) og headers (`.h`, `.hpp`) → preprocessor (`cpp`) → compiler (`gcc`, `g++`) → assembler (`as`) → linker (`ld`), som også tager et static library (`.a`) med og laver den eksekverbare fil.',
          ],
        },
        {
          term: 'Makefile: targets, dependencies, commands',
          body: [
            'Make kom i 1976 og er skrevet i C. Den læser filen `Makefile` — “don’t change this name as make looks for file ‘Makefile’” — som siger “here is the executable file(s) to be built, it depends on these other files, and here are the commands to run to build it” (s. 3).',
            'En regel er `target: dependencies` efterfulgt af kommandoer. **Targets** er opgaver (kompilér, link, ryd op, kør tests); **dependencies** skal være opfyldt først, og “if any dependency is newer than its corresponding target, the target is considered outdated and needs to be rebuilt”; **commands** er shell-kommandoerne (s. 5). Make sammenligner altså **modification timestamps** (s. 4).',
            'Første eksempel: `hello.out: hello.cpp` med kommandoen `g++ hello.cpp –o hello.out`. Køres `make` igen uden at `hello.cpp` er ændret, sker der intet: `make: \'hello.out\' is up to date.` (s. 5–6).',
            'Med flere filer (s. 7–9) erstatter én `make` tre håndkommandoer: `hello.o` afhænger af `hello.cpp greeting.h`, `greeting.o` af `greeting.cpp greeting.h`, og `hello.out` linker de to objektfiler. Fordi `greeting.h` står som dependency for begge objektfiler, genoversættes begge, når headeren ændres.',
          ],
        },
        {
          term: 'Makroer, automatiske variabler og pattern rules',
          body: [
            '**Makroer** (s. 10): `CXX = g++` og `HEADER = greeting.h`, brugt som `$(CXX)` og `$(HEADER)`. Skiftes compileren, rettes én linje.',
            '**Automatiske variabler** (s. 11): `$@` er target, `$<` er første dependency, og `$^` er alle dependencies. Linkreglen bliver `$(CXX) $^ -o $@` og kompileringsreglen `$(CXX) -c $< -o $@`.',
            '**Pattern rule** (s. 12): `%.o: %.cpp $(HEADER)` — `%` matcher stammen. For target `hello.out` ser Make på dependency `hello.o`, konstruerer `hello.o: hello.cpp $(HEADER)` og bygger den, og gør så det samme for `greeting.o`. Det er “same as” de to håndskrevne regler.',
          ],
        },
        {
          term: 'Flags, biblioteker og standard targets',
          body: [
            '`CXXFLAGS = -Wall` viser alle compiler warnings; flere flags tilføjes med `-<flag name>`. `LDFLAGS = -lgreeting` linker biblioteket `greeting`; flere med `-l<libname>`. Linkreglen bliver `$(CXX) $(CXXFLAGS) $(LDFLAGS) $^ -o $@` (s. 15).',
            'Biblioteker (s. 13–14): officielt har de endelsen `.a` eller `.so`, navnet starter med `lib`, og standardplaceringen er `/usr/lib`, hvor compileren automatisk finder dem. Slidet genbruger en objektfil ved at omdøbe `greeting.o` til `libgreeting.a` med `cp` og kopiere den til `/usr/lib` med `sudo`.',
            'Standard targets (s. 16): **`all`** kompilerer hele programmet og bør være default; **`install`** kompilerer og kopierer eksekverbare filer og biblioteker til deres pladser, opretter mapper og kører evt. en test; **`clean`** sletter objekt- og eksekverbare filer fra kompileringen. Eksemplet på s. 17 har `all: $(TARGET).out` og `clean:` med `rm -f *.o $(TARGET).out`, kørt med `make clean`.',
          ],
        },
        {
          term: 'Kursets egne Makefiles',
          body: [
            'Kursets kode bruger samme mønster. `week_11_memory_management/Makefile` har `CXX := g++`, `CXXFLAGS := -Wall -g -O2`, `OBJ := $(SRC:.cpp=.o)` (suffix-substitution fra `.cpp` til `.o`), `all: $(TARGET)`, pattern rule `%.o: %.cpp` med `-I$(INC)` og en `clean`, der sletter `build`. Linkreglen flytter bagefter objektfil og program over i `build/bin`.',
            'Koden bruger `:=` i stedet for slidenes `=`. Forskellen forklares ikke i materialet. `week_6_…/blocking_io/Makefile` er endnu enklere: `all: $(SRC_NAME).cpp` kompilerer direkte til `$(SRC_NAME).out`.',
          ],
        },
        {
          term: 'CMake: generator frem for build system',
          body: [
            'Problemet (04.2 s. 2): projekter skal bygge med UNIX/Linux, Visual Studio, Xcode og Ninja, og udviklerne må holde flere build-systemer synkrone — værre med valgfrie komponenter som JPEG-understøttelse. Selv to computere med samme OS er lidt forskellige.',
            'CMake er en “open-source build system generator” (s. 3): på Linux kan den generere Makefiles til GCC, på Windows Visual Studio-projekter, på macOS Xcode-projekter, og man kan vælge målplatform, fx ARM på Raspberry Pi. Make kræver en håndskrevet Makefile; CMake kræver en `CMakeLists.txt`, er “essentially a cross-platform Make” og “produces build files for other systems, but it’s not a build system itself” (s. 6).',
            'Eksemplet `~/myproj` (s. 7–14) har en top-level `CMakeLists.txt` med `cmake_minimum_required`, `project(myproj VERSION 1.0 … LANGUAGES CXX)`, `set(CMAKE_CXX_FLAGS "-Wall -O2")`, `set(CMAKE_CXX_STANDARD 11)`, output til `build/bin` og `add_subdirectory(src)`. Den i `src/` laver `add_executable(hello ${SRC})` og `target_include_directories(hello PUBLIC …)`.',
            '`cmake .` finder compileren (GNU 13.3.0) og skriver build-filerne; mappen går fra 4 mapper og 7 filer til 14 mapper og 35 filer med `CMakeCache.txt`, `CMakeFiles/` og en genereret `Makefile`. Derefter bygger `make` tre objektfiler (`[ 25%]`…`[100%]`) og linker `build/bin/hello` på 17K, der skriver “Square root of 5 = 2.23607.” (s. 11–14).',
          ],
        },
        {
          term: 'Cross-compilation',
          body: [
            'Byg på én maskine (*build host*), kør på en anden (*target*), fordi målet ofte har et andet OS eller slet intet, anden hardware, og ikke kan køre udviklingsmiljøet (s. 24). Figuren på s. 15: host med instruction set **x64** kører `aarch64-linux-gcc`/`g++` (fra GCC) og `aarch64-linux-as`/`ld` (fra Binutils); target med **AArch64** har programmet oven på `libstdc++.so` (GCC), `libc.so` (Glibc) og Linux-kernen.',
            'Kursets cross-Makefile (s. 17) sætter `CXX= aarch64-linux-gnu-g++-12` og `CXXFLAGS= -g -Wall -O2 -static`, lægger objektfiler i `build/bin` og linker `-lm`. Efter `make build` og `make all` giver `file hello` “ELF 64-bit LSB executable, ARM aarch64 … statically linked”, og `./hello` på laptoppen giver “cannot execute binary file: Exec format error” — programmet skal kopieres til Pi’en (s. 19–20).',
            'Statisk mod dynamisk (s. 22–23): uden `-static` er `hello` **103K** (total 96K) i stedet for **2.2M**, fordi bibliotekerne ikke kopieres ind, men skal findes på målet. Objektfilerne er ens: 37K og 5.6K.',
            'CMake understøtter cross-compiling fuldt, men (s. 25): den adskiller build- og targetplatform, *kan ikke selv detektere* målplatformen, *kan ikke finde* biblioteker og headers i de sædvanlige systemmapper, programmer bygget under cross-compiling kan ikke køres, ikke alle projekter kan “magically” cross-kompileres, og målplatformen skal beskrives i en **toolchain file**.',
          ],
        },
      ],
      viz: 'make-rebuild',
      keyPoints: [
        'Regel: `target: dependencies` + kommandoer indrykket med tab.',
        'Make genbygger et target, når en dependency har nyere timestamp.',
        '`$@` = target, `$<` = første dependency, `$^` = alle dependencies.',
        '`%.o: %.cpp` er en pattern rule, der erstatter én regel pr. fil.',
        '`CXXFLAGS = -Wall`, `LDFLAGS = -lgreeting`; biblioteker hedder `lib<navn>.a`/`.so`.',
        'Standard targets: `all` (default), `install`, `clean`.',
        'CMake genererer build-filer fra `CMakeLists.txt` — `cmake .` og derefter `make`.',
        'Cross-compile: `aarch64-linux-gnu-g++-12` på x64 → “Exec format error” på host.',
        'Statisk 2.2M mod dynamisk 103K; CMake kræver en toolchain file til cross-compiling.',
      ],
      code: [
        {
          lang: 'makefile',
          title: 'Standard Makefile targets',
          source: '02.2-Week_2_-_Build_Systems.pdf s. 17',
          code: `CXX = g++
CXXFLAGS = -Wall
LDFLAGS = -lgreeting
TARGET = hello

all: $(TARGET).out

$(TARGET).out: $(TARGET).o
\t$(CXX) $(CXXFLAGS) $(LDFLAGS) $^ -o $@

%.o: %.cpp
\t$(CXX) -c $< -o $@

clean:
\trm -f *.o $(TARGET).out`,
        },
        {
          lang: 'makefile',
          title: 'Kursets Makefile til memory management-demoen',
          source: 'lecture-code-main/week_11_memory_management/Makefile',
          code: `CXX := g++

CXXFLAGS := -Wall -g -O2

SRC := src/mem_alloc_demo.cpp
INC := inc
OBJ := $(SRC:.cpp=.o)
BUILD_PATH = build/bin

TARGET := mem_alloc_demo

all: $(TARGET)

$(TARGET): $(OBJ)
\t$(CXX) $(CXXFLAGS) $^ -o $@
\tmkdir build && mkdir build/bin
\tmv src/*.o $(BUILD_PATH)
\tmv $(TARGET) $(BUILD_PATH)

%.o: %.cpp
\t$(CXX) $(CXXFLAGS) -I$(INC) -c $< -o $@

clean:
\trm -r build`,
        },
        {
          lang: 'cmake',
          title: 'Top-level og source-level CMakeLists.txt',
          source: '04.2-Week_4_-_CMake_and_cross-platform_build_systems.pdf s. 8–9',
          code: `# ~/myproj/CMakeLists.txt
cmake_minimum_required(VERSION 3.15...4.11)

project(myproj VERSION 1.0
               DESCRIPTION "Basic Hello World"
               LANGUAGES CXX)

set(CMAKE_CXX_FLAGS "-Wall -O2")

set(CMAKE_CXX_STANDARD 11)

set(CMAKE_RUNTIME_OUTPUT_DIRECTORY "\${PROJECT_SOURCE_DIR}/build/bin")

add_subdirectory(src)

# ~/myproj/src/CMakeLists.txt
set(INCLUDE include)

string(CONCAT HEADER "\${INCLUDE}/\${CMAKE_PROJECT_NAME}/greeting.h "
                     "\${INCLUDE}/\${CMAKE_PROJECT_NAME}/sqroot.h")

set(SRC hello.cpp greeting.cpp sqroot.cpp)

add_executable(hello \${SRC})

target_include_directories(hello PUBLIC "\${PROJECT_SOURCE_DIR}/\${INCLUDE}")`,
        },
        {
          lang: 'makefile',
          title: 'Cross-compilation med statisk linking',
          source: '04.2-Week_4_-_CMake_and_cross-platform_build_systems.pdf s. 17',
          code: `CXX= aarch64-linux-gnu-g++-12

CXXFLAGS= -g -Wall -O2 -static
TARGET= hello

SRC= src
HEADER= include
BUILD_DIR= build
BIN_DIR= bin
BIN_PATH=$(BUILD_DIR)/$(BIN_DIR)

OBJ=greeting.o sqroot.o

LIB=-lm

all: $(TARGET)

build:
\t@echo Generating build directory "$(BIN_PATH)"...
\t@mkdir -p build && cd build && mkdir -p bin && cd ..

$(TARGET): $(SRC)/hello.cpp \\
\t$(BIN_PATH)/greeting.o \\
\t$(BIN_PATH)/sqroot.o
\t$(CXX) $(CXXFLAGS) $(LIB) -I$(HEADER) $^ -o $(BIN_PATH)/$@

$(BIN_PATH)/greeting.o: $(SRC)/greeting.cpp \\
\t\t\t$(HEADER)/greeting.h
\t$(CXX) $(CXXFLAGS) -I$(HEADER) -c $< -o $@

$(BIN_PATH)/sqroot.o: $(SRC)/sqroot.cpp \\
\t$(HEADER)/sqroot/sqroot.h
\t$(CXX) $(CXXFLAGS) $(LIB) -I$(HEADER) -c $< -o $@

clean:
\trm -f $(BIN_PATH)/*.o $(BIN_PATH)/$(TARGET)
\trm -r $(BUILD_DIR)`,
        },
      ],
      exam: [
        'Et build system automatiserer kompileringen, så man ikke skal huske rækkefølgen eller genoversætte alt. Make læser regler på formen `target: dependencies` med kommandoer under, og genbygger et target, hvis en af dets dependencies har et nyere timestamp.',
        'I kursets multi-fil-eksempel afhænger `hello.out` af `hello.o` og `greeting.o`, og de afhænger hver af deres `.cpp` og af `greeting.h`. Med makroer, de automatiske variabler `$@`, `$<` og `$^` og pattern rule’en `%.o: %.cpp` bliver det til én linkregel og én kompileringsregel, og standard targets `all` og `clean` gør det nemt at bygge og rydde op.',
        'CMake er ikke et build system, men en generator: man beskriver projektet logisk i `CMakeLists.txt` med `project`, `add_executable` og `target_include_directories`, kører `cmake .`, og får en Makefile — eller et Visual Studio- eller Xcode-projekt på andre platforme — som man så bygger med `make`.',
        'Cross-compilation betyder at bygge på én arkitektur og køre på en anden: kurset bruger `aarch64-linux-gnu-g++-12` på en x64-laptop, og resultatet er en ARM aarch64-ELF, der giver “Exec format error” lokalt og skal kopieres til Raspberry Pi’en. Med `-static` fylder den 2.2M mod 103K dynamisk, til gengæld afhænger den dynamiske af bibliotekerne på målet.',
        'Faldgruber: Make kender kun de dependencies, man skriver — glemmer man headeren, bliver objektfilen ikke genbygget, når headeren ændres. Og CMake kan ikke selv gætte målplatformen eller finde målets biblioteker; det kræver en toolchain file.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture02.2_Build_Systems.md'), original: '02.2-Week_2_-_Build_Systems.pdf', pages: 's. 2–19', note: 'Build systems, Make, makroer, automatiske variabler, pattern rules, flags, biblioteker, standard targets' },
        { path: k('context/slides/SW3SYS-01_Lecture04.2_CMake_CrossPlatform_Build.md'), original: '04.2-Week_4_-_CMake_and_cross-platform_build_systems.pdf', pages: 's. 2–27', note: 'CMake vs. Make, myproj-eksemplet (s. 7–14), cross-compilation (s. 15–25)' },
        { path: k('data/lecture-code-main/lecture-code-main/week_11_memory_management/Makefile'), note: 'Kursets egen Makefile' },
        { path: k('data/lecture-code-main/lecture-code-main/week_6_posix_blocking_nonblocking_io/blocking_io/Makefile'), note: 'Minimal Makefile med `all` og `clean`' },
      ],
      gaps: [
        'Toolchain file og sysroot vises ikke. Slide s. 25 siger kun, at CMake “must be told about the target platform via a toolchain file”; der er ingen eksempelfil, og ordet sysroot forekommer ikke i materialet. Uden for materialet: en toolchain file sætter typisk `CMAKE_SYSTEM_NAME`, `CMAKE_SYSTEM_PROCESSOR`, `CMAKE_C_COMPILER`/`CMAKE_CXX_COMPILER`, `CMAKE_SYSROOT` og `CMAKE_FIND_ROOT_PATH_MODE_*` og gives med `cmake -DCMAKE_TOOLCHAIN_FILE=…`.',
        'Kursets kode har ingen `CMakeLists.txt`; alle projekter i `lecture-code-main` bruger håndskrevne Makefiles med native `g++`, dvs. de bygges på Pi’en.',
        'CMake-slidet lover “Building in a directory tree outside of the source tree” (s. 4), men eksemplet kører `cmake .` i kildemappen og fylder den med `CMakeCache.txt`, `CMakeFiles/` og Makefiles (s. 12). Variablen `HEADER` i `src/CMakeLists.txt` bygges med `string(CONCAT …)`, men bruges aldrig.',
        'Figuren på s. 15 kalder værktøjerne `aarch64-linux-gcc`/`g++`/`as`/`ld`, mens Makefilen bruger `aarch64-linux-gnu-g++-12`. I cross-eksemplet står `$(LIB)` (`-lm`) også på `-c`-linjen, hvor den ikke har effekt; `OBJ` defineres men bruges ikke; `build` er ikke en dependency af `all`, så `make build` skal køres først; og headerne på s. 18 har `#endif` før deklarationen, så include guarden ikke omslutter noget.',
        'Uden for materialet: slidene på 02.2 s. 15 og 17 skriver `$(LDFLAGS)` før `$^`. GNU ld løser statiske biblioteker fra venstre mod højre, så `-lgreeting` før objektfilen kan give “undefined reference”; konventionen er `LDLIBS` efter objektfilerne. Et rigtigt statisk bibliotek laves med `ar rcs libgreeting.a greeting.o` — slidet omdøber blot objektfilen (s. 14).',
        'Kursets `week_11_memory_management/Makefile` flytter programmet til `build/bin`, så target `mem_alloc_demo` findes aldrig i arbejdsmappen, og `make` bygger forfra hver gang. Anden kørsel uden `make clean` fejler ved `mkdir build`, fordi mappen findes. Samme mønster i `week12_IO_wrapup/imu_spi/Makefile`.',
        '`.PHONY`, forskellen på `=` og `:=` (kursets kode bruger `:=`), `$(SRC:.cpp=.o)` og automatisk dependency-generering (`-MMD`) forklares ikke i materialet. At kommandoer skal indrykkes med tab, står kun i markdown-konverteringen, ikke i PDF’en.',
      ],
      keywords: ['build system', 'Make', 'GNU Make', 'Makefile', 'target', 'dependency', 'recipe', 'timestamp', 'up to date', 'macro', 'CXX', 'CXXFLAGS', 'LDFLAGS', '$@', '$<', '$^', 'pattern rule', '%.o', 'all', 'clean', 'install', 'static library', '.a', '.so', '/usr/lib', 'preprocessor', 'linker', 'ld', 'CMake', 'CMakeLists.txt', 'add_executable', 'add_subdirectory', 'target_include_directories', 'build system generator', 'cross-compilation', 'toolchain', 'toolchain file', 'sysroot', 'aarch64', 'AArch64', 'Exec format error', 'static linking', 'dynamic linking'],
    },
  ],
}
