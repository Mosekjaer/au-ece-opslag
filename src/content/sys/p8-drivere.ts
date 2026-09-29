import type { Part } from '../types'
import { k } from './paths'

const D092 = '09.2-Week_10_-_Interrupts__bus_architecture_and_DMA.pdf'
const D121 = '12.1-Linux-Device-Drivers.pdf'
const D122 = '12.2-Week_13_-_GPIO_interrupts.pdf'
const BOG = 'Silberschatz, Operating System Concepts (Global Edition)'

export const drivere: Part = {
  id: 'drivere',
  title: 'Interrupts, hardware og drivere',
  topics: [
    // ─────────────────────────────────────────────────────────────
    {
      slug: 'interrupts-dma',
      title: 'Interrupts, I/O-subsystemet og DMA',
      short: 'Interrupts og DMA',
      week: 'Uge 9 · L9.2',
      definition:
        'Et **interrupt** er den mekanisme, der lader en enhed give CPU’en besked, når den har data klar, eller når en operation er færdig — så CPU’en kan lave andet imens i stedet for at polle. **DMA** (Direct Memory Access) går et skridt videre: en DMA-controller flytter selve dataene mellem enhed og hukommelse uden CPU’en, som kun får et interrupt, når overførslen er færdig.',
      concepts: [
        {
          term: 'Interrupt request lines, ISR og interrupt vector table',
          body: [
            'Slide 8 i 09.2: moderne CPU’er har to interrupt request lines. **Non-maskable interrupt** (NMI) kan ikke slås fra af CPU’en og bruges til uoprettelige hukommelsesfejl. **Maskable interrupt** kan slås fra, før CPU’en udfører kritiske instruktioner, der ikke må afbrydes, og bruges af device controllers til at bede om service.',
            'Koden, der håndterer et interrupt, er en **interrupt service routine** (ISR), og den ligger på en fast adresse. Adressen findes som et offset i **interrupt vector table**. Tabellen på slidet er Intels (bogens figur 1.5): vektor 0 divide error, 1 debug exception, 2 null interrupt, 3 breakpoint, 6 invalid opcode, 8 double fault, 13 general protection, 14 page fault, 18 machine check, 19–31 Intel reserved — og **32–255 maskable interrupts**, som slidet markerer “used for device generated interrupts”.',
            'Bogen (1.2.1) tilføjer to ting, slidene ikke har: vektortabellen ligger i lav hukommelse og indekseres med interrupt-nummeret, og **interrupt chaining** — hvert element peger på en liste af handlers, der gennemløbes, et kompromis mellem en kæmpe tabel og én handler, der skal undersøge alt. Desuden **interrupt priority levels**, så et lavprioritets-interrupt kan udskydes, mens et højprioritets håndteres.',
          ],
        },
        {
          term: 'Interrupt-mekanismen trin for trin',
          body: [
            'Slide 9: CPU-hardwaren har en **interrupt-request line**, der mærkes efter *hver* instruktion. En device controller **raises** et interrupt ved at sende et signal på linjen. CPU’en gemmer sin tilstand og hopper til enhedens ISR. ISR’en finder årsagen, udfører behandlingen, genskaber CPU-tilstanden, **clearer** interruptet og udfører en *return from interrupt*-instruktion.',
            'Diagrammet på samme slide har syv pile: (1) device driver starter I/O, (2) I/O-controlleren starter I/O, (3) input klar, output færdigt eller fejl, (4) controlleren sender interrupt-signalet, mens CPU’en har tjekket for interrupts mellem instruktionerne, (5) handleren behandler data og returnerer, (6) CPU’en genoptager den afbrudte opgave, (7) forfra. Det er bogens figur 1.4 (interrupt-driven I/O cycle).',
            'Pointen er CPU-tid: interrupts “allow CPU to perform other duties when no I/O transfers need immediate attention”. Prisen er, at ISR’en afbryder hvad som helst — derfor skal den være kort, som [[gpio-interrupts|GPIO-interrupts i kernel]] viser i praksis.',
          ],
        },
        {
          term: 'I/O-subsystemet og device drivers',
          body: [
            'Slide 2: styring af I/O-enheder er en central del af OS’et, og enhederne varierer enormt i funktion og fart — mus, tastatur, diske, skærmadaptere, USB, netværk, lydkort, printere. **I/O-subsystemet** skærmer resten af kernen fra den kompleksitet.',
            'Lagdelingen på figuren: *user I/O libraries* i user space; *device-independent I/O* og under det én **device driver** pr. enhedstype i kernel space; under dem hardwarens **device controllers** og selve enhederne (USB-drev, disk, printer). Driverne tilbyder et ensartet interface opad, så kernen ikke skal kende detaljerne i hver enhed. Hvordan sådan en driver skrives i Linux, er [[device-drivers|Linux character device drivers]].',
            'Bogen (1.2) definerer **device controller** som hardware, der har ansvaret for én enhedstype og har en lokal buffer og special-purpose-registre. Controlleren flytter data mellem enheden og sin buffer og giver driveren besked med et interrupt, når operationen er færdig.',
          ],
        },
        {
          term: 'I/O-hardware: bus, port og controllerregistre',
          body: [
            'Slide 3: en **bus** er “a set of wires and a fixed protocol” for, hvilke beskeder der kan sendes på ledningerne. **PCIe** er en hurtig bus, der forbinder processor og hukommelse med hurtige enheder (diskcontrollere, skærme); en **expansion bus** forbinder langsomme enheder som tastatur, mus, serielle porte og USB. Enheden kobles på via en **port**, fx en USB-port.',
            'Slide 4 giver de fire typiske controllerregistre: **data-in** (læses af hosten for at få input), **data-out** (skrives af hosten for at sende output), **status** (læses for at se tilstanden: idle, ready for input, busy, error, transaction complete) og **control** (skrives for at give kommandoer eller ændre indstillinger som parity checking, word length eller full- vs. half-duplex).',
            'Registrene kan nås på to måder, **port-mapped** eller **memory-mapped** I/O — det er emnet i [[mmap-io|memory-mapped I/O fra user space]]. Slidets x86-tabel over port-adresser: `000–00F` DMA controller, `020–021` interrupt controller, `040–043` timer, `2F8–2FF` serial port (secondary), `320–32F` hard-disk controller, `378–37F` parallel port, `3D0–3DF` graphics controller, `3F8–3FF` serial port (primary).',
          ],
        },
        {
          term: 'Tre overførselsmekanismer: polling, interrupt, DMA',
          body: [
            'Slide 11: Linux understøtter tre måder at flytte data mellem enheder og hovedhukommelse. **Polling**: en løkke tjekker I/O-porten igen og igen (busy-waiting — CPU’en laver ikke andet). **Interrupt**: disken giver et interrupt, når data er klar, og *CPU’en* udfører overførslen. **DMA**: en DMA-controller udfører overførslen.',
            'Interrupt-drevet læsning “before DMA” i fem trin: (1) brugerprocessen kalder `read`, skifter til kernel mode og **blokerer**; (2) CPU’en sender en I/O-request til disken, og diskcontrolleren bufferer data; (3) disken rejser et I/O-interrupt; (4) CPU’en kopierer data fra controllerens buffer til en **kernel buffer** og derfra til **user buffer**; (5) processen vender tilbage til user mode. At processen blokerer imens, er det, [[blocking-io|blocking I/O]] bygger på.',
            'Bogen (1.2.3, s. 15) siger det skarpt: interrupt-drevet I/O er fint til små datamængder, men giver høj overhead ved bulkoverførsler som NVS-I/O — ét interrupt pr. byte for langsomme enheder. DMA løser det.',
          ],
        },
        {
          term: 'DMA-controlleren og DMA-sekvensen',
          body: [
            'Motivation (slide 12): simple kopieringer er ofte mindre vigtige end CPU’ens andet arbejde. Eksemplet: mens CPU’en dekoder og renderer video, udløser kopiering af en fil fra USB-drev til harddisk interrupts, der stjæler CPU-tid fra afspilningen. DMA giver hurtig overførsel mellem enheder, mellem hukommelse og enheder eller mellem hukommelsesområder “without CPU intervention”. Takket være memory-mapped I/O er det konceptuelt altid en kopi fra ét adresseområde til et andet.',
            'Controlleren (slide 13) har fire blokke: **Data Count** (hvor meget der mangler), **Data Register** (midlertidig buffer), **Address Register** (kilde/destination) og **Control Logic**. Ud til systemet går Data Lines og Address Lines (begge veje) og signalerne DMA request, DMA acknowledge, Interrupt, Read og Write.',
            'Sekvensen på slide 14 i syv trin: (1) processen kalder `read`, skifter til kernel mode og blokerer; (2) CPU’en giver DMA-controlleren kommando til overførslen; (3) controlleren sender I/O-request til enheden og flytter data ind i sin egen buffer uden CPU’en; (4) disken melder færdig, og controlleren kopierer fra sin buffer til kernel-bufferen; (5) controlleren signalerer til CPU’en, at læsningen er færdig; (6) CPU’en kopierer kernel buffer → user buffer; (7) processen genoptager i user mode. Figuren viser CPU, DMA-controller og hukommelse på samme bus: CPU og DMA-controller har *master interface*, hukommelsen *slave interface*. CPU og DMA-controller er forbundet med *handshake*, og den perifere enhed hænger på DMA-controlleren med *data* og *handshake*, ikke direkte på bussen.',
            'Forskellen fra interrupt-drevet I/O er altså, hvem der kopierer enhed → kernel buffer. CPU’en bliver kun forstyrret én gang pr. overførsel; bogen: “Only one interrupt is generated per block … rather than the one interrupt per byte”.',
          ],
        },
        {
          term: 'Interrupts på Raspberry Pi',
          body: [
            '`sudo cat /proc/interrupts` (slide 10) viser én linje pr. IRQ med en tæller pr. CPU-kerne (CPU0–CPU3), interrupt-controlleren, dens hardwarenummer, triggertypen og navnet. `arch_timer` (IRQ 13) har over 2,3 mio. interrupts på hver kerne; `mmc1` 2.052.207 på CPU0.',
            'Tre controllere ses: **GICv2** på BCM2712 (timere, mailbox, fire `DMA IRQ`-linjer, `ttyS0`, `mmc0/1`), **rp1_irq_chip** for RP1-chippens perifere enheder (`eth0`, `1f00074000.i2c`, `1f00050000.spi`, `uart-pl011`, USB og `dw_axi_dmac_platform` — RP1’s DMA-controller), og `107d508500.gpio` med IRQ 163 `pwr_button`, pin 20, **Edge**. De fleste linjer er *Level*; USB og tænd/sluk-knappen er *Edge* — forskellen forklares i [[gpio-interrupts|GPIO-interrupts]].',
          ],
        },
      ],
      viz: 'interrupt-dma',
      keyPoints: [
        'Interrupt: enheden siger til, i stedet for at CPU’en spørger (polling/busy-waiting).',
        'NMI kan ikke maskeres (uoprettelige hukommelsesfejl); maskable interrupts bruges af device controllers.',
        'Interrupt-request line tjekkes efter hver instruktion; CPU gemmer tilstand → ISR → return from interrupt.',
        'Interrupt vector table: x86-vektor 0–31 er CPU-undtagelser, 32–255 er device-interrupts.',
        'Controllerregistre: data-in, data-out, status, control.',
        'Interrupt-drevet I/O: CPU’en kopierer controller → kernel buffer → user buffer.',
        'DMA: controlleren kopierer enhed → kernel buffer; CPU’en kopierer kun kernel → user og får ét interrupt pr. blok.',
        'DMA-controller: Data Count, Data Register, Address Register, Control Logic.',
        '`/proc/interrupts` viser tællere pr. kerne, controller (GICv2, rp1_irq_chip) og Level/Edge.',
      ],
      code: [
        {
          lang: 'bash',
          title: 'Interrupts på Raspberry Pi 5 (uddrag)',
          source: `${D092} s. 10`,
          code: `danny@raspberrypi:~ $ sudo cat /proc/interrupts
           CPU0       CPU1       CPU2       CPU3
  9:          0          0          0          0   GICv2  25 Level   vgic
 13:    2572959    2335622    2364979    2308323   GICv2  26 Level   arch_timer
 15:      30333          0          0          0   GICv2  65 Level   107c013880.mailbox
 22:          0          0          0          0   GICv2 119 Level   DMA IRQ
 33:       2851          0          0          0   GICv2 308 Level   ttyS0
# …
106:          0          0          0          0   rp1_irq_chip   6 Level   eth0
108:          0          0          0          0   rp1_irq_chip   8 Level   1f00074000.i2c
119:          0          0          0          0   rp1_irq_chip  19 Level   1f00050000.spi
125:        903          0          0          0   rp1_irq_chip  25 Level   uart-pl011
131:          1          0          0          0   rp1_irq_chip  31 Edge    xhci-hcd:usb1
140:          0          0          0          0   rp1_irq_chip  40 Level   dw_axi_dmac_platform
161:      58241          0          0          0   GICv2 305 Level   mmc0
163:          0          0          0          0   107d508500.gpio  20 Edge   pwr_button`,
        },
        {
          lang: 'text',
          title: 'DMA-sekvensen ved read() (slide 14)',
          source: `${D092} s. 14`,
          code: `User process issues a read system call, switches to kernel mode
  and blocks while waiting for data
CPU sends a command to DMA controller to perform the transfer
DMA controller sends I/O request to the peripheral device and moves
  data into the DMA controller buffer without CPU involvement
Disk signals transfer completion, and DMA controller copies data
  from its buffer to the kernel buffer
DMA controller signals to CPU that read is complete
CPU copies data from the kernel buffer to the user buffer
The user process returns to user mode and resumes execution`,
        },
      ],
      exam: [
        'Et interrupt er den mekanisme, hvor en enhed giver CPU’en besked, når data er klar eller en operation er færdig, så CPU’en ikke skal polle i en busy-wait-løkke. Der er to request lines: non-maskable til uoprettelige fejl og maskable, som device controllers bruger, og som kan slås fra under kritiske instruktioner.',
        'Mekanismen: CPU’en tjekker interrupt-request line efter hver instruktion. Når en controller rejser linjen, gemmer CPU’en sin tilstand, slår ISR’ens adresse op i interrupt vector table — på x86 er vektor 32–255 til enheder — og ISR’en behandler, clearer interruptet og returnerer, så den afbrudte opgave fortsætter.',
        'Ved interrupt-drevet `read` blokerer processen, disken rejser et interrupt, og CPU’en kopierer selv fra controllerens buffer til kernel buffer og videre til user buffer. Med DMA får CPU’en kun sendt en kommando til DMA-controlleren, som flytter data fra enheden til kernel-bufferen og giver ét interrupt, når blokken er færdig; CPU’en kopierer kun det sidste stykke til user space.',
        'På Raspberry Pi 5 kan man se det i `/proc/interrupts`: GICv2 håndterer hoved-CPU’ens interrupts, `rp1_irq_chip` perifere enheder som I2C, SPI og RP1’s DMA-controller, og tænd/sluk-knappen er et edge-triggered GPIO-interrupt.',
        'Afvejningen: polling er simpelt, men spilder CPU; interrupts er godt til små mængder, men giver ét interrupt pr. byte ved langsomme enheder og høj overhead ved bulk. DMA er løsningen på bulk — på bekostning af en ekstra hardwareenhed, der deler bussen med CPU’en.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture09_2_Interrupts_Bus_Architecture_DMA.md'), original: D092, pages: 's. 2–4, 8–14' },
        { path: k('context/book/SW3SYS-01_Ch01_Introduction.md'), original: BOG, pages: 'afsnit 1.2–1.2.1 og 1.2.3 (s. 14–15, fig. 1.4, 1.5, 1.7)' },
        { path: k('context/slides/SW3SYS-01_Lecture012.2_GPIO_Interrupts.md'), original: D122, pages: 's. 16–18', note: 'Recap af interrupts og /proc/interrupts' },
      ],
      gaps: [
        'Bogens kap. 12 (I/O Systems) er ikke i materialet. Kode-markdownen henviser til “Kap. 12-13”, men `data/bogen` indeholder kun kap. 1, 3–8: PNG-intervallerne 366–379 og 385–390 er kap. 8 *Deadlocks* (bogsider 342–355 og 361–366), ikke I/O. Bus, port, controllerregistre og DMA-controlleren kan derfor kun belægges med slides og bogens kap. 1.',
        'Slides og bog beskriver DMA forskelligt. Slide 14 har en separat DMA-controller, der først kopierer til *sin egen* buffer og derefter til kernel-bufferen. Bogen (1.2.3, s. 15) siger, at *device controlleren* selv overfører en hel blok direkte mellem enhed og hovedhukommelse efter at have fået buffere, pointere og tællere sat op.',
        'DMA-controller-figuren (slide 13) har ingen kildeangivelse. Pilene på figuren går *ud* for DMA request og Interrupt og *ind* for DMA acknowledge, Read og Write. Markdown-konverteringen af decket har dem omvendt (“DMA request — Ind (fra enhed)”). Slidet forklarer ikke signalerne i tekst.',
        'Interrupt vector table på slide 8 er Intels (x86). Raspberry Pi er ARM med GICv2, og slidene forbinder ikke de to; hvordan ARM finder ISR’en, er ikke dækket af pensum.',
        'Slide 4 siger om port-mapped I/O: “From userspace, the user can directly access ports via their addresses”. Uden for materialet: på x86 kræver `in`/`out` fra user space særlige rettigheder (`ioperm`/`iopl`), og ARM har slet ikke et separat port-adresserum.',
        'Interrupt chaining og interrupt priority levels står kun i bogen (1.2.1), ikke på slidene.',
        'PDF-filnavnet siger “Week_10”, kursusplanen lægger decket i lektion 9 (Day B). Kursusintroens plan kalder lektionen “Memory mapped I/O”, ikke “I/O subsystem”.',
      ],
      keywords: ['interrupt', 'IRQ', 'ISR', 'interrupt service routine', 'interrupt handler', 'interrupt vector table', 'interrupt vector', 'interrupt-request line', 'NMI', 'non-maskable', 'maskable', 'interrupt chaining', 'return from interrupt', 'polling', 'busy-waiting', 'interrupt-driven I/O', 'DMA', 'direct memory access', 'DMA controller', 'Data Count', 'Address Register', 'bus', 'PCIe', 'expansion bus', 'port', 'device controller', 'data-in', 'data-out', 'status register', 'control register', 'I/O subsystem', '/proc/interrupts', 'GICv2', 'rp1_irq_chip', 'kernel buffer'],
    },

    // ─────────────────────────────────────────────────────────────
    {
      slug: 'mmap-io',
      title: 'Memory-mapped I/O fra user space',
      short: 'Memory-mapped I/O',
      week: 'Uge 9 · L9.2',
      definition:
        '**Memory-mapped I/O** betyder, at en enheds registre ligger i CPU’ens adresserum, så de læses og skrives med almindelige load/store-instruktioner. Fra user space på Raspberry Pi 5 åbner kursets `led_mem_map_gpio` `/dev/mem` og kalder `mmap()` på periferiblokken, hvorefter GPIO-registrene kan tilgås som et C-array — uden driver, men også uden beskyttelse.',
      concepts: [
        {
          term: 'Port-mapped vs. memory-mapped I/O',
          body: [
            '**Port-mapped I/O** (slide 4): enheden har registre knyttet til en port med egne adresser adskilt fra hukommelsen — x86-tabellen med fx `3F8–3FF` for den primære serielle port. **Memory-mapped I/O** (slide 5): en del af CPU’ens adresserum er mappet til enheden, og kommunikationen sker ved at læse og skrive direkte i de adresser. CPU’en bruger “the standard data transfer instructions”. Slidet nævner, at det passer til enheder, der skal have store mængder data hurtigt, fx grafikkort.',
            'Adresserummet bestemmes af adressebussens bredde: `2^N` adresser for `N` bit, altså `2^32` for en 32-bit CPU og `2^64` for 64-bit. Det deles i et **fysisk** adresserum (den hukommelse, hardwaren faktisk kan bruge) og et **virtuelt** (det, OS’et giver applikationerne) — sammenhængen er emnet i [[paging|paging]].',
          ],
        },
        {
          term: 'Raspberry Pi 5: BCM2712, RP1 og adresserne',
          body: [
            'Slide 6: Pi 5 har en **Broadcom BCM2712** (quad-core ARM, hoved-CPU’en) og en **RP1** (dual-core ARM til perifer I/O), forbundet med en **PCIe-bus** med 40-bit adresserum `0x0000000000`–`0xFFFFFFFFFF`. Periferiernes base er `0x40000000` i det “physical memory space (32-bit)” og `0x1F00000000` i det “virtual memory space (40-bit)”.',
            'GPIO-registrene starter ved base + `0xD0000`: `0x400D0000` hhv. `0x1F000D0000`. `sudo cat /proc/iomem | grep gpio` (slide 7) viser tre områder, alle ejet af `1f000d0000.gpio`: `1f000d0000–1f000dbfff`, `1f000e0000–1f000ebfff` og `1f000f0000–1f000fbfff`. I kursets kode er de tre netop `GPIO0_ADDR_OFFSET 0xD0000`, `RIO0_ADDR_OFFSET 0xE0000` og `PAD0_ADDR_OFFSET 0xF0000`.',
          ],
        },
        {
          term: '/dev/mem og mmap()',
          body: [
            'Programmet åbner `/dev/mem` med `O_RDWR | O_SYNC` og kalder `mmap(nullptr, BLOCK_SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, PERIPHERAL_BASE_ADDR)`. Kernen vælger den virtuelle adresse (`nullptr`); offset er periferibasen `0x1F00000000`; `MAP_SHARED` betyder, at skrivninger går direkte igennem til det mappede objekt — her hardwaren. Fejl giver `MAP_FAILED`, og så `perror` og `close(fd)`.',
            'Det er samme `mmap()` som i POSIX shared memory (bogen 3.7.1, `mmap(0, SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0)`), bare med `/dev/mem` i stedet for et `shm_open`-objekt — se [[ipc|IPC]]. `open`/`close` er de POSIX-kald fra [[posix-file-io|POSIX file I/O]].',
            'Pointeraritmetikken regner i 32-bit-ord: `PERIPHERALBase` er en `uint32_t*`, så `GPIOBase = PERIPHERALBase + GPIO0_ADDR_OFFSET / 4` — byte-offsettet divideres med 4. Koden bruger `/dev/mem`, og kode-konverteringen noterer, at det kræver root (`sudo ./led_mem_map`). `/dev/gpiomem` står kun i markdown-konverteringen af decket, ikke i PDF’en.',
          ],
        },
        {
          term: 'Registerblokkene: GPIO, PAD og RIO',
          body: [
            '**GPIO** (ved `0xD0000`) er et array af `GPIOregs { uint32_t status; uint32_t ctrl; }`, ét par pr. pin, så `GPIO[BTN_UP].ctrl` er pin 12’s kontrolregister. `ctrl` vælger pinnens funktion — det, der på andre platforme hedder *function select*: knapperne får `0x00`, LED’erne `0x05`. Bit 27 i `status` er det debouncede input (`GPIO_DEBOUNCED_INPUT_MASK (1<<27)`) — pinnens *level*.',
            '**PAD** (ved `0xF0000`) styrer den elektriske side: `pad = PADBase + 1`, og `pad[BTN_UP] = 0xC0` slår input til for knapperne; `pad[LED0_PIN] = 0x10` giver “default output current of 4mA”.',
            '**RIO** (ved `0xE0000`) er `RIOregs { Out; OE; In; InSync; }`. Samme registre findes på tre alias-adresser: `RIO_XOR` (+`0x1000`), `RIO_SET` (+`0x2000`) og `RIO_CLR` (+`0x3000`). En skrivning til `RIO_SET->Out` sætter kun de bits, der er 1 i værdien; `RIO_CLR->Out` clearer dem. Output enable sættes med `RIO_SET->OE = 0x01<<LED0_PIN | …`. Det er kursets *set/clear* — ingen read-modify-write, så andre pins røres ikke.',
          ],
        },
        {
          term: 'Polling-løkken: knapper og software-PWM',
          body: [
            'Programmet poller — der er ingen interrupts. I `while(true)` læses begge knapper: `pin_status = (GPIO[BTN_UP].status & MASK)>>26 | (GPIO[BTN_DOWN].status & MASK)>>27`. Originalens kommentar: `1=UP, 2=DOWN, 3=NONE` — knapperne er active-low, så 3 betyder, at ingen er trykket.',
            'Et `adjust`-flag sørger for, at et tryk kun tæller én gang: UP sænker `slowness` med 10 (ned til 10), DOWN hæver den (op til 50), og flaget nulstilles først ved `pin_status == 3`. LED’erne fader i modfase med software-PWM: `usleep(limit-count)`, `RIO_SET->Out` på LED0 og `RIO_CLR->Out` på LED1, `usleep(count)`, og omvendt; `count` går op og ned mellem 0 og `limit = slowness*100`.',
            'Polling-løkken er præcis den busy-waiting, [[interrupts-dma|interrupts]] skal erstatte. Samme knapper med rigtige edge-interrupts er [[gpio-interrupts|GPIO-interrupts]].',
          ],
        },
        {
          term: 'Øvelsen: knaptryk → sikker nedlukning',
          body: [
            'Task 1 (s. 16): detektér et knaptryk på HAT’en via memory-mapped GPIO og luk Pi’en sikkert ned; demo-koden må genbruges. Snippet’et (`shutdown_code_snippet.jpg`) kalder `sync()` for at skrive filsystembuffere til disk og derefter `reboot(LINUX_REBOOT_CMD_POWER_OFF)` — “Requires root privileges!” — med `perror("reboot")` ved fejl.',
            'PDF’en giver ingen opskrift ud over snippet’et; det oplagte er at genbruge `led_mem_map_gpio`’s polling af `status`-bit 27 og kalde nedlukningskoden, når knappen trykkes.',
          ],
        },
      ],
      viz: 'mmap-gpio',
      keyPoints: [
        'Port-mapped: separate I/O-adresser. Memory-mapped: registre i CPU’ens adresserum, almindelige load/store.',
        'Pi 5: periferibase `0x1F00000000` (40-bit), GPIO ved +`0xD0000`, RIO +`0xE0000`, PAD +`0xF0000`.',
        '`open("/dev/mem", O_RDWR | O_SYNC)` + `mmap(…, MAP_SHARED, fd, PERIPHERAL_BASE_ADDR)`; kræver root.',
        'Pointer til `uint32_t`: byte-offset divideres med 4.',
        '`GPIO[pin].ctrl` vælger funktion; bit 27 i `GPIO[pin].status` er debounced input.',
        '`RIO_SET`/`RIO_CLR`/`RIO_XOR` (+0x2000/+0x3000/+0x1000) ændrer kun de bits, man skriver 1 i.',
        'Kursets eksempel poller knapperne i en busy-loop og laver software-PWM med `usleep`.',
        'Øvelsen: knaptryk → `sync()` + `reboot(LINUX_REBOOT_CMD_POWER_OFF)`.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Map periferiblokken fra /dev/mem',
          source: 'lecture-code-main/week10_interrupts_bus_architecture_and_dma/led_mem_map_gpio/src/led_mem_map_gpio.cpp',
          code: `#define PERIPHERAL_BASE_ADDR 0x1F00000000

#define GPIO0_ADDR_OFFSET 0xD0000
#define RIO0_ADDR_OFFSET 0xE0000
#define PAD0_ADDR_OFFSET 0xF0000
// …
#define BLOCK_SIZE (128 * 1024 * 8)

int main(int argv, char* argc[]) {

  // Open /dev/mem
  int fd = open("/dev/mem", O_RDWR | O_SYNC);
  if (fd < 0) {
    perror("open()");
    return 1;
  }

  // Map GPIO memory locations to pointer map
  void* map = mmap(
                   nullptr,
                   BLOCK_SIZE,
                   PROT_READ | PROT_WRITE,
                   MAP_SHARED,
                   fd,
                   PERIPHERAL_BASE_ADDR
                  );

  if (map == MAP_FAILED) {
    perror("mmap failed");
    close(fd);
    return EXIT_FAILURE;
  }

  // Pointer to base address for peripheral devices
  uint32_t* PERIPHERALBase = (uint32_t*) map;

  // Pointer to address for GPIO registers
  uint32_t* GPIOBase = PERIPHERALBase + GPIO0_ADDR_OFFSET / 4;
  uint32_t* RIOBase = PERIPHERALBase + RIO0_ADDR_OFFSET / 4;
  uint32_t* PADBase = PERIPHERALBase + PAD0_ADDR_OFFSET / 4;
  // …`,
        },
        {
          lang: 'cpp',
          title: 'Registerstrukturer, konfiguration og polling',
          source: 'lecture-code-main/week10_interrupts_bus_architecture_and_dma/led_mem_map_gpio/src/led_mem_map_gpio.cpp',
          code: `#define GPIO_DEBOUNCED_INPUT_MASK (1<<27)

typedef struct
{
  uint32_t status;
  uint32_t ctrl;
} GPIOregs;

typedef struct
{
  uint32_t Out;
  uint32_t OE;
  uint32_t In;
  uint32_t InSync;
} RIOregs;

#define GPIO ((GPIOregs*) GPIOBase)
#define RIO ((RIOregs *) RIOBase)

#define RIO_XOR ((RIOregs *)(RIOBase + 0x1000 / 4))
#define RIO_SET ((RIOregs *)(RIOBase + 0x2000 / 4))
#define RIO_CLR ((RIOregs *)(RIOBase + 0x3000 / 4))
// …
  uint32_t *pad = PADBase + 1;

  GPIO[BTN_UP].ctrl = 0x00; // disable all functions
  GPIO[BTN_DOWN].ctrl = 0x00; // disable all functions

  // Enable pins as inputs
  pad[BTN_UP] = 0xC0;
  pad[BTN_DOWN] = 0xC0;

  GPIO[LED0_PIN].ctrl = 0x05; // disable all functions
  GPIO[LED1_PIN].ctrl = 0x05; // disable all functions

  // Default output current of 4mA for all LED pins
  pad[LED0_PIN] = 0x10;
  pad[LED1_PIN] = 0x10;

  // Enable all pins as output
  RIO_SET->OE = 0x01<<LED0_PIN | 0x01<<LED1_PIN | 0x01<<LED2_PIN;
  // …
  while(true) {
    // Check Button pin status: 1=UP, 2=DOWN, 3=NONE
    pin_status = (GPIO[BTN_UP].status & GPIO_DEBOUNCED_INPUT_MASK)>>26 |
                 (GPIO[BTN_DOWN].status & GPIO_DEBOUNCED_INPUT_MASK)>>27;
    // …
    usleep(limit-count);
    RIO_SET->Out = 0x01<<LED0_PIN; // Set pin to logic '1'
    RIO_CLR->Out = 0x01<<LED1_PIN; // Set pin to logic '0'
    usleep(count);
    RIO_CLR->Out = 0x01<<LED0_PIN; // Set pin to logic '1'
    RIO_SET->Out = 0x01<<LED1_PIN; // Set pin to logic '1'
  }`,
        },
        {
          lang: 'cpp',
          title: 'Sikker nedlukning fra user space',
          source: 'lecture-code-main/week10_interrupts_bus_architecture_and_dma/shutdown_code_snippet.jpg (også 09.2 s. 16)',
          code: `#include <linux/reboot.h>
#include <sys/reboot.h>
#include <unistd.h>
#include <iostream>

int main() {
  std::cout << "Requesting safe shutdown..." << std::endl;

  // Sync filesystem buffers to ensure data integrity
  sync();

  // Requires root privileges!
  int result = reboot(LINUX_REBOOT_CMD_POWER_OFF);

  if (result != 0) {
    perror("reboot");
    return 1;
  }

  return 0;
}`,
        },
        {
          lang: 'bash',
          title: 'GPIO-områderne i /proc/iomem',
          source: `${D092} s. 7`,
          code: `danny@raspberrypi:~ $ sudo cat /proc/iomem | grep gpio
107d508500-107d50853f : 107d508500.gpio gpio@7d508500
107d517c00-107d517c3f : 107d517c00.gpio gpio@7d517c00
1f000d0000-1f000dbfff : 1f000d0000.gpio gpio@d0000
1f000e0000-1f000ebfff : 1f000d0000.gpio gpio@d0000
1f000f0000-1f000fbfff : 1f000d0000.gpio gpio@d0000`,
        },
      ],
      exam: [
        'Memory-mapped I/O betyder, at en enheds registre ligger i CPU’ens adresserum, så man tilgår dem med almindelige læse- og skriveinstruktioner. Port-mapped I/O har et separat adresserum til porte, som x86’s tabel med fx `3F8–3FF` for den serielle port.',
        'På Raspberry Pi 5 ligger periferierne fra `0x1F00000000` i PCIe-bussens 40-bit adresserum, og GPIO starter ved offset `0xD0000`, hvilket man kan se i `/proc/iomem`. Kursets program åbner `/dev/mem` med `O_RDWR | O_SYNC` og mapper blokken ind i processen med `mmap` og `MAP_SHARED`; derefter er GPIO-registrene bare et array af `uint32_t`, og byte-offsettet skal divideres med 4.',
        'Der er tre registerblokke: GPIO med `status` og `ctrl` pr. pin, hvor `ctrl` vælger funktion og bit 27 i `status` er det debouncede input; PAD til input enable og drivstyrke; og RIO, hvis SET-, CLR- og XOR-aliaser ændrer kun de bits, man skriver 1 i, så man ikke skal læse-ændre-skrive.',
        'Afvejningen: det er hurtigt og kræver ingen driver, men det kræver root, omgår kernens beskyttelse — en forkert skrivning kan crashe systemet — og kursets eksempel poller knapperne i en busy-loop. Den rigtige løsning er en kernel-driver eller GPIO-interrupts.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture09_2_Interrupts_Bus_Architecture_DMA.md'), original: D092, pages: 's. 4–7, 16' },
        { path: k('context/kode/SW3SYS-01_Code_week_10_memory_mapped_io.md'), note: 'Konvertering af led_mem_map_gpio' },
        { path: k('data/lecture-code-main/lecture-code-main/week10_interrupts_bus_architecture_and_dma/led_mem_map_gpio/src/led_mem_map_gpio.cpp'), note: 'Original kode' },
        { path: k('data/lecture-code-main/lecture-code-main/week10_interrupts_bus_architecture_and_dma/shutdown_code_snippet.jpg'), note: 'Shutdown-snippet (billede)' },
        { path: k('context/book/SW3SYS-01_Ch03_Processes.md'), original: BOG, pages: 'afsnit 3.7.1', note: 'mmap() i POSIX shared memory' },
      ],
      gaps: [
        '`volatile` bruges ikke i kursets kode og nævnes ikke i slides eller bog — registrene tilgås via almindelige `uint32_t*`. Uden for materialet: uden `volatile` må compileren (her `-O2`) i princippet slå gentagne læsninger af `GPIO[…].status` sammen eller fjerne skrivninger, den ikke kan se virkningen af; hardware-registre bør derfor tilgås gennem `volatile uint32_t*`.',
        'Function select/set/clear/level som separate registre (BCM2835-stil `GPFSELn`, `GPSETn`, `GPCLRn`, `GPLEVn`) findes ikke i materialet. Pi 5-koden bruger i stedet `ctrl` pr. pin, RIO-aliaserne og status-bit 27.',
        'Kodekommentarerne er selvmodsigende: både `ctrl = 0x00` (knapper) og `ctrl = 0x05` (LED’er) er kommenteret “disable all functions”, og `RIO_CLR->Out = 0x01<<LED0_PIN` er kommenteret “Set pin to logic \'1\'”. Uden for materialet: i RP1-databladet er 5 funktionen SYS_RIO (softwarestyret I/O), som LED’erne skal bruge.',
        '`BLOCK_SIZE`-kommentaren regner forkert: `0x100000` er 1.048.576 **bytes** (1 MiB), ikke bits og ikke 128 kB. `128 * 1024 * 8` giver tilfældigvis samme tal, så mappingen dækker `0xD0000`–`0xFFFFF` korrekt. `mmap`’s længde er i bytes.',
        'Markdown-konverteringen ændrer originalens kommentar `1=UP, 2=DOWN, 3=NONE` til “0 = ingen, 1 = UP, 2 = DOWN, 3 = begge” — det modsiger koden, der nulstiller `adjust` ved 3. Originalen er rigtig for active-low knapper.',
        'Slide 6 kalder `0x1F00000000` for “virtual memory space (40-bit)”, men koden bruger adressen som offset i `/dev/mem` — og konverteringen kalder den “fysisk adresse”. Uden for materialet: `/dev/mem`-offsets er fysiske adresser; `0x1F00000000` er RP1’s vindue set fra BCM2712, og “virtuel” på slidet er ikke det samme som processens virtuelle adresser fra paging.',
        'Koden kalder aldrig `munmap()`, og `close(fd)` efter `while(true)` nås aldrig. Konverteringen nævner `munmap()` i sin funktionstabel, men den står ikke i koden.',
        'Markdown-konverteringen af 09.2 har en fire-trins “Tilgang til opgaven” (åbn `/dev/mem` eller `/dev/gpiomem`, konfigurér input, poll, kald shutdown). Den står ikke i PDF’en (s. 16) — det er konverterens tilføjelse, og `/dev/gpiomem` nævnes ingen steder i originalerne.',
      ],
      keywords: ['memory-mapped I/O', 'MMIO', 'port-mapped I/O', 'PMIO', 'mmap', 'munmap', '/dev/mem', '/dev/gpiomem', 'O_SYNC', 'MAP_SHARED', 'PROT_READ', 'PROT_WRITE', 'MAP_FAILED', 'address space', 'adresserum', 'BCM2712', 'RP1', 'PCIe', '0x1F00000000', '0x400D0000', '/proc/iomem', 'GPIOregs', 'RIOregs', 'RIO_SET', 'RIO_CLR', 'RIO_XOR', 'PAD', 'ctrl', 'function select', 'status', 'debounced input', 'volatile', 'software PWM', 'sync', 'reboot', 'LINUX_REBOOT_CMD_POWER_OFF', 'led_mem_map_gpio'],
    },

    // ─────────────────────────────────────────────────────────────
    {
      slug: 'device-drivers',
      title: 'Linux character device drivers',
      short: 'Device drivers',
      week: 'Uge 12 · L12.1',
      definition:
        'En **Linux character device driver** er et kernel-modul, der binder en enhed til POSIX-filoperationerne: når en applikation kalder `open`, `read` eller `write` på en node som `/dev/myled`, finder kernen driveren via nodens **major number** og kalder driverens funktioner i `struct file_operations`. Data krydser grænsen mellem user og kernel space med `copy_from_user()` og `copy_to_user()`.',
      concepts: [
        {
          term: 'Hvorfor en driver: dual mode og LED-stakken',
          body: [
            'Recap (s. 3): applikationer kører i uprivilegeret user space; et system call giver et **trap** til kernel space, der udfører kaldet og returnerer — se [[os-dual-mode|dual mode]]. Hardware nås kun fra kernel space.',
            'Slide 4 viser hele stakken for at tænde en LED: applikationen kalder `write("/dev/myled", "on")`, Std-C Library laver `system_call()`, kernen kalder `led_driver_write()`, og driveren skriver til hardwaren med `iowrite32(0x4905803C, 0x00000010)`, hvorefter LED’en tændes. Applikationen kender kun filen `/dev/myled`, ikke adressen — modsat [[mmap-io|memory-mapped I/O fra user space]].',
          ],
        },
        {
          term: 'Kernel modules: modulært design og life-cycle',
          body: [
            'Linux er modulært (s. 5): kernen kalder videre til moduler (Module X, Y, Z) via call/ret. Et modul har to slags funktioner (s. 7): **file operations** (`hello_open`, `hello_release`, `hello_write`, `hello_read`), der implementerer kernel-siden af POSIX-filoperationerne, og **module load/unload** (`__init hello_init`, `__exit hello_exit`), der virker som constructor og destructor. I rødt: “A kernel module NEVER implements a main() function! It always works on behalf of a user space process!!”',
            'Life-cycle (s. 8): `insmod hello.ko` → `module_init()` → `hello_init()`; `rmmod hello` → `module_exit()` → `hello_exit()`. Hello world-modulet (s. 9) skriver med `pr_info` og slutter med `MODULE_AUTHOR` og `MODULE_LICENSE("GPL")` — licensen markeret “important!”.',
            'Udviklingsflowet (s. 28) er en løkke: skriv `mycode.c` + `Makefile` → `make` → `rmmod mydriver` (hvis indsat) → `insmod mydriver.ko` → tjek `dmesg` → test med `cat` eller `echo` på `/dev/mynode`.',
          ],
        },
        {
          term: 'Makefile og out-of-tree build',
          body: [
            'Makefile’en (s. 10) skal hedde `Makefile` “WITH CAPITAL M!!”. `obj-m := hello.o` antager kildefilen `hello.c`; `ccflags-y` giver gcc-parametre; `KERNELDIR ?= ~/linux` peger på Linux-kildetræet. Den eneste kommando er `$(MAKE) -C $(KERNELDIR) M=$(shell pwd) $@` — skift til kernetræet, byg modulet i den aktuelle mappe, og `$@` erstattes af targetnavnet (`modules`, `clean` …). `make` bliver til `make –C /home/au123456/linux M=/home/au123456/exercise3 modules`.',
            'Kildetræet (s. 11): `arch/` (CPU-specifikt, fx `rpizw_defconfig`), `kernel/` (generisk kerne), `drivers/` (fx `i2c/i2c-core.c`, `leds/leds-pca955x.c`), `include/` (headers, fx `linux/gpio/gpio.h`) og `Documentation/`; alt bygges til `vmlinux`. Ved **out-of-tree build** (s. 12) ligger driveren i en egen projektmappe (`group-66/exercise12/led/` med `Makefile` og `myled.c`) ved siden af `linux/`, der rummer `Module.symvers`. Make generelt: [[build-systemer|build-systemer]].',
          ],
        },
        {
          term: 'Character devices, major og minor',
          body: [
            'En **character device** (s. 13) er en kronologisk strøm af data (FIFO-agtig) uden random access — det kan block devices. Eksempler: mus, seriel port, ADC/DAC, accelerometer. Slidet viser en ASR33 Teletype, oprindelsen til “tty”.',
            '**Major number** identificerer driveren (s. 6): `/dev/myled` har major 51, og kernen sender filoperationerne til `Led Driver` (major 51) frem for Module X (22) eller Z (45). “Major assigned when node is created” og “allocated when modules are loaded”. **Minor number** identificerer enheden inden for driveren (s. 14): én major pr. driver, én minor pr. device — ADC-driveren med major 63 og `/dev/adc0–2` med minor 0–1–2 for tre kanaler.',
            'Ved `open(/dev/led0)` (s. 15) slår kernen driveren op med `MAJOR(inode->rdev)` og kalder dens `.open(inode, …)`, hvor driveren selv bruger `MINOR(inode)` til at vælge den fysiske enhed. Den mapning skal driverudvikleren implementere.',
          ],
        },
        {
          term: 'Registrering: alloc_chrdev_region, cdev og nodes',
          body: [
            '`alloc_chrdev_region(&devno, first_minor, max_devices, "hello-driver")` (s. 16) tildeler dynamisk et major number og 255 minors. `dev_t devno` er “major << 20 | minor” (se `MKDEV` i `kdev_t.h`). Efter `insmod` står driveren i `/proc/devices`, i slidets eksempel `239 hello-driver`.',
            'Registreringen (s. 17): `class_create(THIS_MODULE, "hello-class")`, `cdev_init(&hello_cdev, &hello_fops)` knytter file operations til en `struct cdev`, `cdev_add(&hello_cdev, devno, 255)` registrerer den, og `device_create(hello_class, NULL, MKDEV(MAJOR(devno), MINOR(0)), NULL, "hellodev")` “will create node: /dev/hellodev”.',
            'Nodes kan også laves i hånden (s. 18): `mknod /dev/hello0 c 249 0` og `mknod /dev/hello1 c 249 1`. `ls -l /dev/hello*` viser `crw-rw----` og major/minor efter ejer og gruppe — `c` for character device. (Slidet viser `249, 0` på begge linjer, selv om `hello1` har minor 1.)',
          ],
        },
        {
          term: 'File operations i user og kernel space',
          body: [
            'User space (s. 19) har de fire POSIX-kald `open`, `close`, `read`, `write` plus `ioctl(fd, call_id, …)` “for controlling devices” — se [[posix-file-io|POSIX file I/O]]. I kernel space (s. 20) svarer `struct file_operations` til en tabel af funktionspointere: `read`, `write`, `unlocked_ioctl`, `open`, `release` … (fuld definition i `cdev.h`), og hver driver (ADC, GPIO, DAC) peger dem på sine egne funktioner.',
            'Char driver-strukturen (s. 22) samler det: `hello_open`/`hello_release` (“Implementation not required, we can use default”), `hello_write`/`hello_read` (write sender data fra user space til hardware, read henter fra hardware), `struct file_operations hello_fops = { .owner = THIS_MODULE, .open = …, .release = …, .write = …, .read = … }` brugt i `cdev_add()`, og boilerplate i `hello_init`/`hello_exit`.',
            'Sekvensdiagrammet (s. 21) har fire aktører — Console, Application, Linux, hello: `insmod` → `hello_init()`; `open` → `hello_open()`; i en loop `[device == active]` giver `write(fd, &value)` → `hello_write()` → `copy_from_user()`, og `read(fd, &status)` → `hello_read()` → `copy_to_user()`; `close` → `hello_release()`; `rmmod` → `hello_exit()`.',
          ],
        },
        {
          term: 'read/write og copy_to_user/copy_from_user',
          body: [
            '`hello_read` (s. 23) læser en værdi fra hardwaren, begrænser `len` til `min(count, 12)`, laver en streng med `snprintf`, kopierer med `copy_to_user(buf, kbuf, ++len)`, lægger `len` til `*f_pos` og returnerer `len`. POSIX-kravene: læs højst `count` bytes; returnér antal læste bytes, **0 ved EOF** eller en negativ værdi ved fejl. `hello_write` (s. 26) kopierer med `copy_from_user(kbuf, ubuf, len)` (fejl → `-EFAULT`), nul-terminerer, konverterer med `kstrtoint` og skriver til hardwaren. write skal returnere antal skrevne bytes, 0 hvis intet, negativ ved fejl.',
            'Hvorfor kopiere (s. 24–25): brugerens buffer ligger i **swappable** user space, driverens i **nonswappable** kernel space. `copy_to_user`/`copy_from_user` “check user space pointer” og kopierer; de er erklæret `__must_check`, og slidet: “You must check the return value!”',
            'GPIO fra en driver (s. 27) bruger descriptor-API’et: `gpio_to_desc()`, `gpiod_get_direction`, `gpiod_direction_input`, `gpiod_direction_output(desc, value)`, `gpiod_get_value`, `gpiod_set_value` — “See details in LDD exercise!!!”. Interrupts fra en GPIO i et kernel-modul er [[gpio-interrupts|GPIO-interrupts]].',
          ],
        },
      ],
      viz: 'driver-stack',
      keyPoints: [
        'Applikation → libc → system call (trap) → kernel → driver → hardware.',
        'Et kernel-modul har ingen `main()`; `module_init`/`module_exit` kaldes ved `insmod`/`rmmod`.',
        '`obj-m := hello.o` og `$(MAKE) -C $(KERNELDIR) M=$(shell pwd) $@` — Makefile med stort M.',
        'Major = driver, minor = enhed; `dev_t` = major << 20 | minor.',
        '`alloc_chrdev_region` → `class_create` → `cdev_init` → `cdev_add` → `device_create`.',
        'Nodes manuelt med `mknod /dev/hello0 c 249 0` eller automatisk med `device_create`.',
        '`struct file_operations` mapper `open`/`read`/`write`/`release` til driverens funktioner.',
        '`copy_from_user` i write, `copy_to_user` i read — aldrig direkte dereference af user-pointere.',
        'Flow: make → rmmod → insmod → dmesg → cat/echo på `/dev/…`.',
      ],
      code: [
        {
          lang: 'c',
          title: 'Hello world-modul',
          source: `${D121} s. 9`,
          code: `#include <linux/module.h>

static int __init hello_init(void)
{
  pr_info("Hello, world\\n");
  return 0;
}

static void __exit hello_exit(void)
{
  pr_info("Goodbye, cruel world\\n");
}

module_init(hello_init);
module_exit(hello_exit);

MODULE_AUTHOR("Peter HM <phm@ece.au.dk>");
MODULE_LICENSE("GPL");`,
        },
        {
          lang: 'makefile',
          title: 'Makefile til out-of-tree kernel-modul',
          source: `${D121} s. 10`,
          code: `# FILE: Makefile (WITH CAPITAL M!!)
obj-m := hello.o
ccflags-y := -std=gnu99 -Wno-declaration-after-statement

KERNELDIR ?= ~/linux

all default: modules
install: modules_install

modules modules_install help clean:
	$(MAKE) -C $(KERNELDIR) M=$(shell pwd) $@`,
        },
        {
          lang: 'c',
          title: 'Major number og registrering af driveren',
          source: `${D121} s. 16–17`,
          code: `#include <linux/module.h>
#include <linux/cdev.h>

const int first_minor = 0;
const int max_devices = 255;
static dev_t devno;            // devno = major << 20 | minor
static struct class *hello_class;
static struct cdev hello_cdev;
struct file_operations hello_fops;

static int __init hello_init(void)
{
  int err=0;

  err = alloc_chrdev_region(&devno, first_minor, max_devices, "hello-driver");
  if(MAJOR(devno) <= 0)
    printk(KERN_ALERT "Failed to register chardev\\n");
  printk(KERN_INFO "Hello driver got Major %i\\n", MAJOR(devno));

  hello_class = class_create(THIS_MODULE, "hello-class");
  if (IS_ERR(hello_class)) pr_err("Failed to create class");

  cdev_init(&hello_cdev, &hello_fops);
  err = cdev_add(&hello_cdev, devno, 255);
  if (err) printk(KERN_ALERT "Failed to add cdev");

  device_create(hello_class, NULL, MKDEV(MAJOR(devno), MINOR(0)), NULL, "hellodev");
  return err;  // Will create node: /dev/hellodev
}`,
        },
        {
          lang: 'c',
          title: 'read, write og file_operations',
          source: `${D121} s. 22, 23 og 26`,
          code: `ssize_t hello_read(struct file *filep, char __user *buf, size_t count,
                   loff_t *f_pos) {
  char kbuf[12];
  int len, value;
  value = some_function_that_reads_value_from_hardware();
  len = count < 12 ? count : 12;          /* Truncate to smallest */
  len = snprintf(kbuf, len, "%i", value); /* Create string */
  copy_to_user(buf, kbuf, ++len);         /* Copy to user space */
  *f_pos += len;                          /* Update cursor in file */
  return len;                             /* Return length read */
}

ssize_t hello_write(struct file *filep, const char __user *ubuf, size_t count,
                    loff_t *f_pos) {
  int len, value;
  char kbuf[12];
  len = count < 12 ? count : 12; /* len = smalllest of buffer size or count */
  if(copy_from_user(kbuf, ubuf, len) < 0)
    return -EFAULT;
  char kbuf[len] = 0;             /* Add zero termination (c-string) */
  if (kstrtoint(kbuf, 0, &value)) /* Convert string to int */
    printk(KERN_ALERT "Error converting string to int\\n");
  some_function_that_writes_value_to_hardware(value);
  *f_pos += len; /* Update cursor in file */
  return len; }  /* return length actually written */

struct file_operations hello_fops = {
  .owner   = THIS_MODULE,
  .open    = hello_open,
  .release = hello_release,
  .write   = hello_write,
  .read    = hello_read, };`,
        },
      ],
      exam: [
        'En character device driver er et kernel-modul, der gør en enhed tilgængelig som en fil i `/dev`, så applikationen bare bruger `open`, `read`, `write` og `close`. Applikationen kører i user space og når kun hardwaren via et system call, der trapper ind i kernen, som kalder driveren — slidets LED-eksempel går fra `write("/dev/myled", "on")` til `iowrite32` i driveren.',
        'Et modul har ingen `main`; det har `init` og `exit`, som kaldes ved `insmod` og `rmmod`, og det bygges out-of-tree med en Makefile, der kalder kernetræets make med `M=$(shell pwd)`. I `init` allokerer man et major number med `alloc_chrdev_region`, initialiserer en `cdev` med sin `file_operations`-tabel, registrerer den med `cdev_add` og laver noden med `device_create` — eller i hånden med `mknod`.',
        'Major number identificerer driveren, minor number enheden: ADC-driveren med major 63 har `/dev/adc0` til `adc2` med minor 0 til 2, og i `open` bruger driveren `MINOR(inode)` til at vælge kanalen.',
        'I `read` og `write` må driveren aldrig dereferere brugerens pointer direkte, for user space er swappable; den bruger `copy_to_user` og `copy_from_user`, som tjekker pointeren. POSIX kræver, at `read` returnerer antal bytes, 0 ved EOF og negativ ved fejl.',
        'Faldgruben er fejlhåndtering: kopifunktionerne er `__must_check`, og slidets `hello_read` returnerer aldrig 0, så en `cat` på noden ikke får EOF. Og alt, `init` registrerer, skal fjernes igen i `exit`, ellers hænger major og node efter `rmmod`.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture0.12.1_LinuxDeviceDrivers.md'), original: D121, pages: 's. 2–28' },
        { path: k('context/book/SW3SYS-01_Ch01_Introduction.md'), original: BOG, pages: 'afsnit 1.2', note: 'Definition af device driver og device controller' },
      ],
      gaps: [
        'Der er ingen kursuskode til device drivers: `lecture-code-main` har ingen char driver (week12_IO_wrapup rummer kun `imu_spi` og `gyro_tilt` i user space). Det eneste kernel-modul i koden er `week13_gpio_interrupts/gpio_isr/gpio_isr.c`, som ikke registrerer et character device. LDD-øvelsen, slide 27 henviser til (“See details in LDD exercise!!!”), er ikke i materialet.',
        'Bogens kap. 12 (I/O Systems, herunder kernel I/O-subsystemet og character/block-interfaces) er ikke i materialet (se [[interrupts-dma|interrupts og DMA]]); bogen dækker kun device drivers med én definition i 1.2.',
        '`hello_exit` vises aldrig udfyldt: slidene viser ikke oprydningen efter `alloc_chrdev_region`, `cdev_add`, `class_create` og `device_create`. Uden for materialet: det kræver `device_destroy`, `class_destroy`, `cdev_del` og `unregister_chrdev_region`.',
        '`hello_write` på s. 26 kompilerer ikke: `char kbuf[len] = 0;` generklærer `kbuf`; det skulle være `kbuf[len] = 0;`. Når `count >= 12`, er `len` 12, og `kbuf[12]` skriver uden for arrayet.',
        'Slide 25 siger “Negative indicates an error!”, og `hello_write` tjekker `copy_from_user(…) < 0`, men signaturerne på samme slide returnerer `unsigned long`, som aldrig er negativ. Uden for materialet: funktionerne returnerer antallet af bytes, der *ikke* blev kopieret, så fejltjekket skal være `!= 0`. `hello_read` tjekker slet ikke returværdien, selv om slidet siger “You must check”.',
        '`hello_read` returnerer aldrig 0, selv om slidet selv kræver “zero if EOF reached”, og `*f_pos` bruges ikke til at afgøre EOF. Uden for materialet: `cat /dev/hellodev` vil derfor læse i en uendelig løkke.',
        'Allokeringen (s. 16) tjekker `MAJOR(devno) <= 0` i stedet for returværdien `err` fra `alloc_chrdev_region`.',
        'Uden for materialet: fra Linux 6.4 tager `class_create()` kun navnet (`class_create("hello-class")`); slidets `class_create(THIS_MODULE, …)` kompilerer ikke på Pi’ens kerne 6.12, som 12.2 viser. Og Linux’ `iowrite32` tager værdien først og adressen bagefter — slide 4 har dem omvendt.',
        'Slide 7 og 22 viser `int hello_open(...) {}` uden `return`; det er skitser, ikke kompilerbar kode.',
        'Driverdecket (12.1) bruger descriptor-API’et (`gpiod_*`), mens GPIO-interrupt-decket (12.2) og dets kode bruger det ældre heltals-API (`gpio_request`, `gpio_direction_input`). Materialet kommenterer ikke forskellen.',
      ],
      keywords: ['device driver', 'LDD', 'Linux device driver', 'character device', 'char driver', 'block device', 'kernel module', 'LKM', 'module_init', 'module_exit', '__init', '__exit', 'insmod', 'rmmod', 'dmesg', 'pr_info', 'printk', 'MODULE_LICENSE', 'obj-m', 'KERNELDIR', 'out-of-tree', 'major number', 'minor number', 'dev_t', 'MKDEV', 'MAJOR', 'MINOR', 'alloc_chrdev_region', 'cdev', 'cdev_init', 'cdev_add', 'class_create', 'device_create', 'mknod', '/dev', '/proc/devices', 'file_operations', 'copy_to_user', 'copy_from_user', '__user', 'EFAULT', 'kstrtoint', 'ioctl', 'gpiod_set_value', 'gpio_to_desc'],
    },

    // ─────────────────────────────────────────────────────────────
    {
      slug: 'gpio-interrupts',
      title: 'GPIO-interrupts i kernel og user space',
      short: 'GPIO-interrupts',
      week: 'Uge 12 · L12.2',
      definition:
        'Et **GPIO-interrupt** udløses, når en pin skifter — på en **edge** (rising/falling) eller et **level** (high/low) — så programmet ikke skal polle knappen. Kurset viser to veje på Raspberry Pi 5: et **kernel-modul**, der med `gpio_to_irq()` og `request_irq()` registrerer en ISR, og et **userspace-program**, der via `/dev/gpiochip0`, `ioctl(GPIO_GET_LINEEVENT_IOCTL)` og `poll()` venter på edge-events.',
      concepts: [
        {
          term: 'Level vs. edge triggering',
          body: [
            'Slide 2: en pins status kan læses som **spændingsniveau** — 0V = logisk ‘0’, +5V = logisk ‘1’ — eller som **retning af spændingsskiftet**: 0V → +5V er en **rising edge**, +5V → 0V en **falling edge**. Level-triggering reagerer på tilstanden, edge-triggering på overgangen.',
            'En trykket knap kan give 0V eller +5V afhængigt af koblingen: **active-low** betyder, at trykket forbinder pinnen til jord; **active-high**, at det forbinder til forsyningen. Det afgør, om “trykket” er en falling eller en rising edge. I `/proc/interrupts` står triggertypen i kolonnen før navnet — `pwr_button` er `Edge`, det meste andet `Level` (se [[interrupts-dma|interrupts på Raspberry Pi]]).',
          ],
        },
        {
          term: 'Kernel GPIO-numre på Pi 5',
          body: [
            'Slide 19: Pi 5 bruger en separat **RP1**-chip til GPIO, tilgængelig i user space som `/dev/gpiochip0`. Kernen bruger ikke headerens pinnumre; kernel GPIO-numre findes i `/sys/kernel/debug/gpio`, hvor `gpiochip0` har `GPIOs 571-624`.',
            '**Kernel GPIO = base + offset**: GPIO16 = 571 + 16 = **587** (derfor `#define GPIO_PIN 587` i kernel-modulet), GPIO25 = 571 + 25 = 596. Userspace-programmet bruger derimod offsettet på chippen direkte: `#define GPIO_PIN 16`.',
          ],
        },
        {
          term: 'Kernel-space: ISR’en og dens regler',
          body: [
            'Trinene (s. 20): (1) en interrupt handler-metode; (2) modul-init: a) bed kernen reservere GPIO-nummeret, b) sæt retningen til input, c) map kernel GPIO-nummeret til et IRQ-nummer, d) anmod om ejerskab af IRQ’en; (3) modul-cleanup: frigiv IRQ’en.',
            'Handleren (s. 21–22) har signaturen `static irqreturn_t gpio_irq_handler(int irq, void *dev_id)` og returnerer `IRQ_HANDLED` ved succes, `IRQ_NONE` ved fejl. Den kører “as soon as CPU receives interrupt”, og koden skal være så kort som mulig, “because here interrupts are disabled” — typisk bare sætte et software-flag, der håndteres senere. Kursets handler kalder kun `printk(KERN_INFO …)`; `KERN_INFO` er log level 6 (0 `KERN_EMERG` er højest, 7 `KERN_DEBUG` lavest).',
          ],
        },
        {
          term: 'Kernel-space: init, cleanup og test',
          body: [
            '`gpio_irq_init` (s. 23): `gpio_request(GPIO_PIN, "gpio_isr")` reserverer pinnen (strengen er et debug-label), `gpio_direction_input(GPIO_PIN)`, `irq_number = gpio_to_irq(GPIO_PIN)` og `request_irq(irq_number, gpio_irq_handler, IRQF_TRIGGER_RISING, "my_isr", NULL)` — IRQ-nummer, handler, triggerbetingelse, navnet i `/proc/interrupts` og dev_id. Mulige triggere: `IRQF_TRIGGER_FALLING`, `_RISING`, `_HIGH`, `_LOW` — de to sidste er level. Ved fejl frigives pinnen med `gpio_free` før `return -1`.',
            '`gpio_irq_exit` (s. 24) kalder `free_irq(irq_number, NULL)` og `gpio_free(GPIO_PIN)`. `module_init`/`module_exit` (s. 25) kobler dem til `insmod`/`rmmod` — samme livscyklus som i [[device-drivers|character device drivers]]. Øvelsen (s. 33) kræver `MODULE_LICENSE("GPL")` m.fl. for at undgå kompileringsfejl og `sudo apt install raspberrypi-kernel-headers`, hvis `linux/interrupt.h` mangler.',
            'Test (s. 28–31): `make` kører `make -C /lib/modules/6.12.25+rpt-rpi-2712/build …`; efter `sudo insmod gpio_isr.ko` viser `dmesg` “loading out-of-tree module taints kernel” og “Mapped GPIO587 to IRQ186”. Når knappen trykkes, viser `dmesg` (s. 29) to linjer “GPIO587 interrupt triggered!” med 77 µs imellem. `/proc/interrupts` får linjen `186: 2 0 0 0 pinctrl-rp1 16 Edge my_isr`, som forsvinder igen efter `rmmod`.',
          ],
        },
        {
          term: 'Userspace: /dev/gpiochip0, ioctl og gpioevent-structs',
          body: [
            'Userspace-vejen (s. 3–13) kræver intet kernel-modul: programmet åbner RP1’s character device `/dev/gpiochip0` med `O_RDONLY` og beder kernen om en line med edge detection via `ioctl(chip_fd, GPIO_GET_LINEEVENT_IOCTL, &req)`. `ioctl` returnerer 0 ved succes og −1 med `errno` ved fejl.',
            '`struct gpioevent_request` (s. 8) har `lineoffset` (pin 16), `handleflags` (`GPIOHANDLE_REQUEST_INPUT` eller `_OUTPUT`), `eventflags` (`GPIOEVENT_REQUEST_RISING_EDGE`, `_FALLING_EDGE` — koden bruger `GPIOEVENT_REQUEST_BOTH_EDGES`), `consumer_label` (vises i `/proc/interrupts`) og `fd`, som kernen udfylder. `struct gpioevent_data` har `timestamp` (ns) og `id` (`GPIOEVENT_EVENT_RISING_EDGE` eller `_FALLING_EDGE`).',
            'Efter `ioctl` er `req.fd` en ny file descriptor for eventstrømmen. Hvert event læses med `read(req.fd, &event, sizeof(event))`, og koden tjekker, at hele structen kom.',
          ],
        },
        {
          term: 'Userspace: poll() og hovedløkken',
          body: [
            '`poll(struct pollfd fds[], nfds_t nfds, int timeout)` (s. 6) overvåger flere file descriptors; `timeout` er −1 (for evigt), 0 (returnér straks) eller N ms. `struct pollfd` har `fd`, `events` (hvad man venter på) og `revents` (hvad der skete); flag: `POLLIN`, `POLLOUT`, `POLLERR`, `POLLHUP`, `POLLNVAL`. Blocking vs. non-blocking og `poll()` generelt: [[blocking-io|blocking I/O]].',
            'Programmet sætter `pfd.fd = req.fd` og `pfd.events = POLLIN` og kalder `poll(&pfd, 1, -1)` i en `while (true)`. Når `pfd.revents & POLLIN`, læses eventet, og `event.id` afgør, om der skrives “Rising edge” eller “Falling edge”. Med programmet kørende viser `/proc/interrupts` `186: 52 0 0 0 pinctrl-rp1 16 Edge My userspace GPIO interrupt` — samme IRQ som kernel-modulet, men nu med programmets label.',
            'Øvelsen (s. 33): Task 1 — userspace GPIO interrupt handlers for de 6 knapper på HAT’en; Task 2 (valgfri) — kernel-space handlers for de samme 6 knapper, verificeret med `dmesg`.',
          ],
        },
      ],
      viz: 'gpio-edge-irq',
      keyPoints: [
        'Level = spændingsniveau; edge = overgang (rising 0→1, falling 1→0). Active-low: tryk trækker pinnen til jord.',
        'Pi 5: kernel GPIO = 571 + offset, så GPIO16 = 587; userspace bruger offset 16 på `/dev/gpiochip0`.',
        'Kernel: `gpio_request` → `gpio_direction_input` → `gpio_to_irq` → `request_irq`; cleanup `free_irq` + `gpio_free`.',
        'ISR: `irqreturn_t handler(int irq, void *dev_id)`, returnér `IRQ_HANDLED`; kort, fordi interrupts er slået fra.',
        '`IRQF_TRIGGER_RISING/FALLING` er edge, `_HIGH/_LOW` er level.',
        'Userspace: `open("/dev/gpiochip0")` → `ioctl(GPIO_GET_LINEEVENT_IOCTL)` → `poll(POLLIN)` → `read(gpioevent_data)`.',
        'Kursets dmesg viser to interrupts 77 µs fra hinanden for ét tryk — slidet forklarer det ikke.',
        'Verificér med `dmesg` og `/proc/interrupts` (`186 … pinctrl-rp1 16 Edge`).',
      ],
      code: [
        {
          lang: 'c',
          title: 'Kernel-modul med GPIO-ISR',
          source: 'lecture-code-main/week13_gpio_interrupts/gpio_isr/gpio_isr.c (12.2 s. 22–25)',
          code: `#include <linux/module.h>
#include <linux/gpio.h>
#include <linux/interrupt.h>

#define GPIO_PIN 587
static int irq_number;

// Interrupt handler
static irqreturn_t gpio_irq_handler(int irq, void *dev_id) {
    printk(KERN_INFO "gpio_isr: GPIO%d interrupt triggered!\\n",GPIO_PIN);
    return IRQ_HANDLED;
}

// Module initialization
static int __init gpio_irq_init(void) {
    int ret;
    printk(KERN_INFO "gpio_isr: gpio_irq_init() started\\n");

  if (gpio_request(GPIO_PIN, "gpio_isr")) {  // Request GPIO
        printk(KERN_ERR "Failed to request GPIO%d\\n", GPIO_PIN);
        return -1;
    }

    gpio_direction_input(GPIO_PIN); // Configure GPIO as input

    irq_number = gpio_to_irq(GPIO_PIN); // Map GPIO to IRQ number
    if (irq_number < 0) {
        printk(KERN_ERR "Failed to map GPIO to IRQ\\n");
        gpio_free(GPIO_PIN);
        return -1;
    }
    printk(KERN_INFO "Mapped GPIO%d to IRQ%d\\n", GPIO_PIN, irq_number);

    ret = request_irq(irq_number, gpio_irq_handler, IRQF_TRIGGER_RISING, "my_isr", NULL); // Request IRQ (rising edge trigger)
    if (ret) {
        printk(KERN_ERR "Failed to request IRQ %d\\n", irq_number);
        gpio_free(GPIO_PIN);
        return -1;
    }

    printk(KERN_INFO "gpio_isr: gpio_irq_init() ended\\n");
    return 0;
}

// Module cleanup
static void __exit gpio_irq_exit(void) {
    printk(KERN_INFO "gpio_isr: gpio_irq_exit() started\\n");
    free_irq(irq_number, NULL);
    gpio_free(GPIO_PIN);
    printk(KERN_INFO "gpio_isr: gpio_irq_exit() ended\\n");
}

module_init(gpio_irq_init);
module_exit(gpio_irq_exit);

MODULE_LICENSE("GPL");
MODULE_AUTHOR("Danish Shaikh");
MODULE_DESCRIPTION("A simple GPIO device driver");`,
        },
        {
          lang: 'cpp',
          title: 'Userspace edge-events med ioctl og poll',
          source: 'lecture-code-main/week13_gpio_interrupts/gpio_int/src/gpio_int.cpp (12.2 s. 7–13)',
          code: `#define GPIO_CHIP "/dev/gpiochip0"
#define GPIO_PIN 16

struct gpioevent_request req;
struct gpioevent_data event;
struct pollfd pfd;
int chip_fd = -1;
// … openGPIOChip(): chip_fd = open(GPIO_CHIP, O_RDONLY);

void initGPIOEventRequest(void) {
  memset(&req, 0, sizeof(req));

  req.lineoffset = GPIO_PIN;
  req.handleflags = GPIOHANDLE_REQUEST_INPUT;
  req.eventflags = GPIOEVENT_REQUEST_BOTH_EDGES;

  const char* str = "My userspace GPIO interrupt";
  strncpy(req.consumer_label, str, strlen(str)+1);

  if (ioctl(chip_fd, GPIO_GET_LINEEVENT_IOCTL, &req) < 0) {
    perror("ioctl()");
    close(chip_fd);
    exit(EXIT_FAILURE);
  }
}
// … readGPIOEventData(): read(req.fd, &event, sizeof(event))

void initPollFD(void) {
  pfd.fd = req.fd;
  pfd.events = POLLIN;
}

void pollFD(void) {
  int ret = poll(&pfd, 1, -1);
  if (ret < 0) {
    perror("poll()");
    close(chip_fd);
    close(req.fd);
    exit(EXIT_FAILURE);
  }
}

int main(int argc, char* argv[]) {
  openGPIOChip();
  initGPIOEventRequest();
  initPollFD();

  std::cout << "Listening for hardware interrupts on " << (int)GPIO_PIN << "...\\n";
  while (true) {
    pollFD();
    if (pfd.revents & POLLIN) {
      readGPIOEventData();
      if (event.id == GPIOEVENT_EVENT_RISING_EDGE)
        std::cout << (int)GPIO_PIN << ": Rising edge\\n";
      if (event.id == GPIOEVENT_EVENT_FALLING_EDGE)
        std::cout << (int)GPIO_PIN << ": Falling edge\\n";
    }
  }

  close(req.fd);
  close(chip_fd);
  return EXIT_SUCCESS;
}`,
        },
        {
          lang: 'bash',
          title: 'Indlæs, test og fjern modulet',
          source: `${D122} s. 28–31`,
          code: `danny@raspberrypi:~/sw3sys/week13/gpio_isr $ make
make -C /lib/modules/6.12.25+rpt-rpi-2712/build M=/home/danny/sw3sys/week13/gpio_isr modules
danny@raspberrypi:~/sw3sys/week13/gpio_isr $ sudo insmod gpio_isr.ko
danny@raspberrypi:~/sw3sys/week13/gpio_isr $ dmesg
[  542.041417] gpio_isr: loading out-of-tree module taints kernel.
[  542.042013] gpio_isr: gpio_irq_init() started
[  542.042073] Mapped GPIO587 to IRQ186
[  542.042093] gpio_isr: gpio_irq_init() ended
[ 1022.125638] gpio_isr: GPIO587 interrupt triggered!
[ 1022.125715] gpio_isr: GPIO587 interrupt triggered!

$ sudo cat /proc/interrupts
186:          2          0          0          0  pinctrl-rp1  16 Edge      my_isr

danny@raspberrypi:~/sw3sys/week13/gpio_isr $ sudo rmmod gpio_isr
[ 1162.422287] gpio_isr: gpio_irq_exit() started
[ 1162.422306] gpio_isr: gpio_irq_exit() ended`,
        },
      ],
      exam: [
        'Et GPIO-interrupt lader kernen give besked, når en pin skifter, i stedet for at programmet poller. Man skelner mellem level-triggering, der reagerer på spændingsniveauet, og edge-triggering, der reagerer på overgangen — rising fra 0 til 1 eller falling fra 1 til 0 — og om knappen er active-low eller active-high, afgør hvilken flanke et tryk giver.',
        'I kernel space skriver man et modul: i init reserverer man pinnen med `gpio_request`, sætter den som input, mapper den til et IRQ-nummer med `gpio_to_irq` og registrerer handleren med `request_irq` og fx `IRQF_TRIGGER_RISING`; i exit kalder man `free_irq` og `gpio_free`. På Pi 5 er kernel-nummeret base 571 plus offset, så GPIO16 er 587, og `dmesg` viser, at den blev IRQ 186.',
        'ISR’en skal være kort, fordi interrupts er slået fra, mens den kører — den bør kun sætte et flag og returnere `IRQ_HANDLED`. Kursets eksempel printer med `printk`, og dens dmesg viser to interrupts 77 mikrosekunder fra hinanden for ét tryk — sandsynligvis kontaktprel, som hverken slides eller kode håndterer.',
        'I user space åbner kursets program `/dev/gpiochip0`, beder om edge events på linje 16 med `ioctl(GPIO_GET_LINEEVENT_IOCTL)` og får en file descriptor tilbage, som det venter på med `poll` og `POLLIN`; hvert event læses som en `gpioevent_data` med timestamp og rising/falling. Det kræver hverken root-kernekode eller et modul.',
        'Afvejningen: kernel-vejen giver den hurtigste reaktion, men en fejl i modulet rammer hele systemet, og man skal bygge mod de rigtige kernel headers. User space er sikrere og nemmere at debugge, men hvert event går gennem et systemkald og en context switch.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture012.2_GPIO_Interrupts.md'), original: D122, pages: 's. 2–33' },
        { path: k('context/kode/SW3SYS-01_Code_week_13_gpio_interrupts.md'), note: 'Konvertering af gpio_int og gpio_isr' },
        { path: k('data/lecture-code-main/lecture-code-main/week13_gpio_interrupts/gpio_isr/gpio_isr.c'), note: 'Kernel-modul (original)' },
        { path: k('data/lecture-code-main/lecture-code-main/week13_gpio_interrupts/gpio_int/src/gpio_int.cpp'), note: 'Userspace-program (original)' },
        { path: k('context/slides/SW3SYS-01_Lecture09_2_Interrupts_Bus_Architecture_DMA.md'), original: D092, pages: 's. 8–10', note: 'Interrupts og /proc/interrupts' },
      ],
      gaps: [
        'Kurset bruger ikke libgpiod og ikke epoll, men GPIO character device-ABI’ets **v1** (`GPIO_GET_LINEEVENT_IOCTL`, `struct gpioevent_request`) direkte med `ioctl` og `poll`. Uden for materialet: v1-ABI’et er markeret deprecated i kernen til fordel for v2 (`GPIO_V2_GET_LINE_IOCTL`), som libgpiod 2.x bygger på. Slidets egen link peger på “chardev_v1”.',
        'Slide 6 siger, at `poll()` returnerer “0 on success”. Uden for materialet: `poll()` returnerer antallet af file descriptors med events (>0), 0 ved timeout og −1 ved fejl. Kursets kode tjekker kun `ret < 0`, så det ikke gør noget her.',
        'Slide 2 bruger 0V/+5V som logiske niveauer. Uden for materialet: Raspberry Pi’s GPIO-pins er 3,3V og tåler ikke 5V.',
        'Slide 4 kalder både `ioctl()` og `poll()` “without blocking”, men koden kalder `poll(&pfd, 1, -1)`, der blokerer til der kommer et event. Markdown-konverteringen prøver at forklare det (“stadig non-blocking I/O”), men det står ikke i PDF’en.',
        'Slidet beder om at holde ISR’en kort og bare sætte et flag, men viser ikke, hvordan flaget håndteres bagefter. Uden for materialet: Linux deler arbejdet i top half/bottom half (threaded IRQs, `request_threaded_irq`, workqueues, tasklets) — ikke dækket af pensum.',
        'dmesg-outputtet på s. 29 viser to interrupts 77 µs fra hinanden, men PDF’en forklarer det ikke. Markdown-konverteringens “(To trigger kan forekomme pga. switch bounce.)” er konverterens egen tilføjelse. Ingen af de to programmer debouncer; memory-mapped-koden i uge 10 læser derimod et debounced statusbit.',
        'Kernel-modulet bruger det gamle heltalsbaserede GPIO-API (`gpio_request`, `gpio_direction_input`, `gpio_to_irq`), mens driverdecket 12.1 viser descriptor-API’et (`gpio_to_desc`, `gpiod_*`). Uden for materialet: heltals-API’et er legacy, og base-nummeret 571 afhænger af kerneversionen — derfor skal det slås op i `/sys/kernel/debug/gpio` hver gang.',
        'Slide 20 nummererer trinene “a, b, c, c”. Markdown-konverteringen har byttet om på decket: PDF’en har userspace først (s. 3–14) og kernel space bagefter (s. 15–31).',
        'Kernel-modulets Makefile bygger mod `/lib/modules/$(uname -r)/build` (installerede headers), mens 12.1’s Makefile bruger `KERNELDIR ?= ~/linux` (et helt kildetræ). Materialet forklarer ikke forskellen.',
        'PDF-filnavnet siger “Week_13”, kursusplanen lægger decket i lektion 12 (Day B).',
      ],
      keywords: ['GPIO interrupt', 'edge triggering', 'level triggering', 'rising edge', 'falling edge', 'active-low', 'active-high', 'IRQ', 'ISR', 'request_irq', 'free_irq', 'gpio_to_irq', 'gpio_request', 'gpio_free', 'gpio_direction_input', 'irqreturn_t', 'IRQ_HANDLED', 'IRQ_NONE', 'IRQF_TRIGGER_RISING', 'IRQF_TRIGGER_FALLING', 'IRQF_TRIGGER_HIGH', 'IRQF_TRIGGER_LOW', 'printk', 'KERN_INFO', 'dmesg', '/proc/interrupts', '/sys/kernel/debug/gpio', 'kernel GPIO number', '571', '587', 'RP1', 'pinctrl-rp1', '/dev/gpiochip0', 'ioctl', 'GPIO_GET_LINEEVENT_IOCTL', 'gpioevent_request', 'gpioevent_data', 'GPIOEVENT_REQUEST_BOTH_EDGES', 'poll', 'pollfd', 'POLLIN', 'libgpiod', 'switch bounce', 'debounce', 'gpio_isr', 'gpio_int'],
    },
  ],
}
