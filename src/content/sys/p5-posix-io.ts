import type { Part } from '../types'
import { k } from './paths'

export const posixIo: Part = {
  id: 'posix-io',
  title: 'POSIX I/O og seriel kommunikation',
  topics: [
    {
      slug: 'posix-file-io',
      title: 'POSIX og file I/O',
      short: 'POSIX file I/O',
      week: 'Uge 5 · L5.2',
      definition:
        '**POSIX** (Portable Operating System Interface) er et sæt standarder for værktøjer, interfaces, kommandoer og API’er til UNIX-lignende styresystemer, så software, der følger standarden, *bør* kunne flyttes mellem dem. Kernen i POSIX file I/O er fire systemkald — `open()`, `read()`, `write()` og `close()` — der alle arbejder på en **file descriptor**: et ikke-negativt heltal, som `open()` returnerer, og som resten af kaldene bruger til at pege på den åbne fil.',
      concepts: [
        {
          term: 'Hvorfor POSIX',
          body: [
            'Slide 3 giver baggrunden: i de tidlige dage skrev man software til styresystemer med vidt forskellige system interfaces, og portering krævede “a lot of heavy tweaks and costs”. POSIX blev skabt som en standardisering af den oprindelige UNIX — ikke kun for at løse problemer mellem UNIX-varianter, men også over for ikke-UNIX-styresystemer.',
            'Slide 2 er forsigtig i formuleringen: software, der overholder POSIX, **bør** være kompatibel med andre POSIX-systemer, og de fleste værktøjer på Linux og UNIX-lignende systemer opfører sig **næsten** ens. Det er en standard for interfacet, ikke en garanti for identisk opførsel.',
            'Samme API går igen resten af kurset: I2C- og SPI-enheder, GPIO-chippen og egne drivere tilgås alle med `open()`, `read()`, `write()`, `ioctl()` og `close()` på en fil under `/dev/` — se [[i2c-spi|I2C og SPI]], [[blocking-io|blocking I/O]] og [[device-drivers|device drivers]].',
          ],
        },
        {
          term: 'File descriptors og standardstrømmene',
          body: [
            '`open()` returnerer en file descriptor — et ikke-negativt heltal — ved succes og `-1` ved fejl (s. 5). Alle andre kald tager descriptoren som første argument, og `close(fd)` “closes a file descriptor and releases associated resources” (s. 4).',
            'Tre descriptors er åbne fra start. 06.2 s. 5 lister dem: `STDIN_FILENO` (standard input, keyboard) = 0, `STDOUT_FILENO` (standard output, skærm) = 1 og `STDERR_FILENO` (“standard errors”) = 2, “or any other file descriptor”. Derfor kan Hello World-eksemplet skrive direkte med `write(STDOUT_FILENO, …)` uden at kalde `open()` først.',
            'En åben descriptor følger med over `fork()`: s. 15 skriver, at child-processen bruger “same open files” som parent. Processkaldene selv (`fork()`, `getpid()`, `waitpid()`) står i samme deck, men hører til [[fork-exec|fork og exec]]. Bogen viser det samme med en pipe, hvor `fd[0]` er læseenden og `fd[1]` skriveenden (fig. 3.20); se [[ipc|IPC]].',
          ],
        },
        {
          term: 'open(): flags og mode',
          body: [
            'Signaturen er `int open(const char *pathname, int flags, mode_t mode)`. `flags` angiver adgangstilstanden: `O_RDONLY`, `O_WRONLY`, `O_RDWR`, plus `O_CREAT` (opret hvis den ikke findes), `O_TRUNC` (trunkér til længde 0), `O_APPEND` (skriv i slutningen), `O_EXCL` (sammen med `O_CREAT`: fejl hvis filen findes), `O_NONBLOCK` (returnér straks uden at vente på data) og `O_SYNC`/`O_DSYNC` (data og metadata skrives synkront til disk).',
            '`mode` er rettighederne for en *nyoprettet* fil: `S_IRUSR` (eller `S_IREAD`), `S_IWUSR`, `S_IXUSR` for ejeren, `S_IRGRP`/`S_IWGRP`/`S_IXGRP` for gruppen og `S_IROTH`/`S_IWOTH`/`S_IXOTH` for andre. Både flags og modes kombineres med bitwise OR: `O_WRONLY | O_CREAT, S_IRUSR | S_IWUSR | S_IROTH` opretter en write-only fil med read-write til ejeren og read til andre (s. 6).',
            '08.2 s. 11 markerer `mode` som “File permissions (optional)” — i praksis kaldes `open()` med to argumenter, når filen ikke skal oprettes, fx `open("file.txt", O_RDONLY)` og `open(I2C_DEV, O_RDWR)`.',
          ],
        },
        {
          term: 'read() og write(): returværdien er svaret',
          body: [
            '`ssize_t read(int fd, void *buf, size_t count)` læser **højst** `count` bytes ind i `buf` og returnerer antal læste bytes, **0 ved end of file** og `-1` ved fejl (s. 9). `ssize_t write(int fd, const void *buf, size_t count)` returnerer antal skrevne bytes eller `-1` (s. 11).',
            'Pointen, decket gentager på hvert eksempel: “It’s important to handle errors and check the return values.” `write()` garanterer ikke, at alle `count` bytes bliver skrevet. Hello World med error checking (s. 14) tjekker derfor to ting: `ret == -1` (kaldet fejlede) og `ret != sizeof(hello) - 1` (ikke alle bytes kom ud). `- 1` er der, så null-terminatoren ikke skrives.',
            '`read()` null-terminerer ikke. I kursets `blocking_io.cpp` læses `BUF_SIZE-1` bytes, og bagefter sættes `buffer[bytes] = \'\\0\'` — ellers kan bufferen ikke bruges som C-streng.',
          ],
        },
        {
          term: 'Fejlhåndtering: -1, errno og perror()',
          body: [
            'Alle fire kald melder fejl med `-1`. 06.2 s. 4 og 8 tilføjer, at et fejlet kald “sets errno in errno.h”. Kursets kode udskriver fejlen med `perror()`, fx `perror("read()")` i `blocking_io.cpp`, `perror("open()")` i I2C-eksemplet og `perror("\\nfork failed")` i fork-eksemplet (05.2 s. 16).',
            'Øvelse 1 (s. 23) er at skrive en tekststreng til en fil, læse den tilbage for at verificere den og “think about what errors could occur and make sure to do proper error handling”. Slidet lister ikke fejlene; de følger af returværdierne ovenfor — hvert af de fire kald kan returnere `-1`, og `write()` kan desuden skrive for lidt.',
            'Varianten uden error checking (s. 13) kalder bare `write(STDOUT_FILENO, hello, sizeof(hello) - 1)` og returnerer `EXIT_SUCCESS` — programmet opdager aldrig, hvis skrivningen fejler. Det er decket kontrasteksempel, ikke en anbefaling.',
          ],
        },
        {
          term: 'Headers og hvor POSIX-laget sidder',
          body: [
            'Slidenes eksempler inkluderer `<fcntl.h>` til `open()` (s. 6) og `<unistd.h>` til `read()`, `write()`, `close()` og `STDOUT_FILENO`, og Hello World tager `<stdlib.h>` med for `EXIT_SUCCESS`/`EXIT_FAILURE` (s. 14). Uge 6-koden tilføjer `<errno.h>` til `errno`, `EAGAIN` og `EWOULDBLOCK`.',
            'Kaldene er **systemkald**: et brugerprogram beder kernen om en service, og kernen udfører den i kernel mode (bogen 1.4, se [[os-dual-mode|dual mode og systemkald]]). Bogens 1.5.6 beskriver laget bagved, I/O-subsystemet, der skjuler hardwarens særheder for brugeren med buffering, caching og spooling, et generelt device-driver interface og drivere til de enkelte enheder.',
          ],
        },
      ],
      viz: 'fd-table',
      keyPoints: [
        'POSIX standardiserer den oprindelige UNIX’ interface; POSIX-software *bør* være portabel.',
        '`open()` → file descriptor (≥ 0) eller `-1`. 0, 1, 2 er stdin, stdout, stderr.',
        'Flags og modes kombineres med `|`: `O_WRONLY | O_CREAT, S_IRUSR | S_IWUSR`.',
        '`read()` returnerer bytes læst, **0 ved EOF**, `-1` ved fejl.',
        '`write()` kan skrive færre bytes end bedt om — tjek returværdien mod `count`.',
        '`read()` null-terminerer ikke: `buffer[bytes] = \'\\0\'`.',
        'Fejl giver `-1` og sætter `errno`; kurset udskriver med `perror()`.',
        'Samme fem kald (+ `ioctl()`) bruges på `/dev/i2c-1`, `/dev/spidev0.0` og `/dev/gpiochip0`.',
      ],
      code: [
        {
          lang: 'c',
          title: 'POSIX Hello World med error checking',
          source: '05.2-Week_5_-_POSIX_file_IO_and_process-related_system_calls.pdf s. 14',
          code: `#include <unistd.h> /* For write() and STDOUT_FILENO */
#include <stdlib.h> /* For EXIT_SUCCESS and EXIT_FAILURE */

int main(void) {
        char hello[] = "Hello, World\\n";
        ssize_t ret = 0;

        /* Attempt to write \`hello\` to standard output file */
        ret = write(STDOUT_FILENO, hello, sizeof(hello) - 1);

        if (ret == -1) {
                /* write() failed. */
                return EXIT_FAILURE;
        } else if (ret != sizeof(hello) - 1) {
                /* Not all bytes of \`hello\` were written. */
                return EXIT_FAILURE;
        }

        return EXIT_SUCCESS;
}`,
        },
        {
          lang: 'c',
          title: 'open() med O_CREAT og mode, derefter write()',
          source: '05.2-Week_5_-_POSIX_file_IO_and_process-related_system_calls.pdf s. 12',
          code: `#include <unistd.h>

int main() {
    int fd = open("file.txt", O_WRONLY | O_CREAT, S_IRUSR | S_IWUSR);
    if (fd == -1) {
        // Handle error
    }
    const char *data = "Hello, World!";
    ssize_t bytesWritten = write(fd, data, strlen(data));
    if (bytesWritten == -1) {
        // Handle error
    }
    close(fd);
    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Blocking read fra stdin med null-terminering',
          source: 'lecture-code-main/week_6_posix_blocking_nonblocking_io/blocking_io/blocking_io.cpp',
          code: `#define BUF_SIZE 128

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

    // Write back to screen
    const char* response = "You entered: ";
    write(STDOUT_FILENO, response, strlen(response));
    write(STDOUT_FILENO, buffer, bytes);

    return EXIT_SUCCESS;
}`,
        },
      ],
      exam: [
        'POSIX er en standardisering af den oprindelige UNIX’ interface, så programmer kan flyttes mellem UNIX-lignende systemer uden de store tilpasninger, man tidligere skulle lave. Kernen i file I/O er fire systemkald: `open`, `read`, `write` og `close`.',
        '`open()` giver mig en file descriptor — et lille ikke-negativt heltal — eller `-1` ved fejl, og flags som `O_WRONLY | O_CREAT` samt en mode som `S_IRUSR | S_IWUSR` styrer adgang og rettigheder for en ny fil. 0, 1 og 2 er stdin, stdout og stderr, så `write(STDOUT_FILENO, …)` virker uden `open()`.',
        '`read()` returnerer antal læste bytes, 0 ved end of file og `-1` ved fejl; `write()` returnerer antal skrevne bytes. Kursets Hello World tjekker både `-1` og om `ret` er lig `sizeof(hello) - 1`, fordi `write()` ikke garanterer at skrive alle bytes.',
        'Faldgruberne er at ignorere returværdien — så opdager man aldrig en fejl eller en halv skrivning — og at glemme, at `read()` ikke null-terminerer, så man selv skal sætte `buffer[bytes] = \'\\0\'`. Ved fejl er `errno` sat, og kurset udskriver den med `perror()`.',
        'Det samme API bruges på hardware: I2C-bussen er `/dev/i2c-1`, SPI er `/dev/spidev0.0` og GPIO er `/dev/gpiochip0`, og de åbnes med `open()` præcis som en almindelig fil.',
      ],
      sources: [
        {
          path: k('context/slides/SW3SYS-01_Lecture05_2_POSIX_File_IO_and_Processes.md'),
          original: '05.2-Week_5_-_POSIX_file_IO_and_process-related_system_calls.pdf',
          pages: 's. 2–14, 22–23',
          note: 'Processkaldene på s. 15–21 hører til fork-exec.',
        },
        {
          path: k('context/slides/SW3SYS-01_Lecture06_2_POSIX_blocking_nonblocking_IO.md'),
          original: '06.2-Week_5_-POSIX_IO_-_blocking_and_non-blocking_IO.pdf',
          pages: 's. 4–5, 8',
          note: 'STDIN/STDOUT/STDERR_FILENO = 0/1/2 og errno.',
        },
        {
          path: k('context/book/SW3SYS-01_Ch01_Introduction.md'),
          original: 'Silberschatz, Operating System Concepts (Global Edition)',
          pages: 'afsnit 1.4 (system calls), 1.5.6 (I/O System Management)',
        },
        {
          path: k('context/book/SW3SYS-01_Ch03_Processes.md'),
          original: 'Silberschatz, Operating System Concepts (Global Edition)',
          pages: 'afsnit 3.7.4, fig. 3.20',
          note: 'File descriptors for en ordinary pipe.',
        },
        {
          path: k('context/kode/SW3SYS-01_Code_week_6_posix_io.md'),
          original: 'lecture-code-main/week_6_posix_blocking_nonblocking_io/blocking_io/blocking_io.cpp',
        },
      ],
      gaps: [
        '`lseek()` nævnes ikke i materialet — hverken i 05.2, koden eller bogudsnittene. Filpositionen (at `read()`/`write()` fortsætter, hvor forrige kald slap) forklares heller ikke.',
        '“Everything is a file” står ikke som princip nogen steder. Tættest på er 12.1, hvor applikationen “arbejder kun med filer (`/dev/myled`)”, og at I2C, SPI og GPIO åbnes som filer under `/dev/`.',
        '`errno` og `perror()` forklares ikke i 05.2; de bruges kun i kode. At et fejlet kald “sets errno in errno.h”, står først i 06.2 (s. 4, 8, 16).',
        'Slide 3 slutter med et tomt punkt: “POSIX is” uden fortsættelse. Decket siger intet om, hvem der udgiver standarden. Bogen nævner kun POSIX for tråde som IEEE 1003.1c (kap. 4).',
        'Kodeeksemplerne på s. 8–12 mangler headers: `write()`-eksemplet (s. 12) inkluderer kun `<unistd.h>`, men bruger `open()`, `O_*`/`S_*` (`<fcntl.h>`) og `strlen()` (`<string.h>`). De kompilerer ikke, som de står.',
        'Stavefejl på slidene: s. 11 siger “or -1 on failure, or -1 on failure”, og s. 5 “S_IWOTH: wWrite permission”.',
        'Slidet siger, at `write()` ikke garanterer alle bytes, men viser kun, hvordan det opdages, ikke hvordan man skriver resten. Uden for materialet: det normale mønster er en løkke, der kalder `write()` igen med `buf + skrevet` og `count - skrevet`, til alt er skrevet.',
        'Uden for materialet: kernen holder en tabel over åbne filer pr. proces, og `open()` returnerer det laveste ledige nummer; derfor starter en ny fil typisk ved 3. Materialet viser kun 0/1/2 og “any other file descriptor”.',
        'Bogudsnittene dækker kap. 1 og 3–8. Bogens kapitler om file systems og I/O systems er ikke med, og kodekonverteringens henvisninger til “Kap. 11.3”, “Kap. 12.2” osv. kan ikke tjekkes i materialet.',
      ],
      keywords: ['POSIX', 'Portable Operating System Interface', 'UNIX', 'system call', 'systemkald', 'file descriptor', 'fd', 'open', 'close', 'read', 'write', 'O_RDONLY', 'O_WRONLY', 'O_RDWR', 'O_CREAT', 'O_TRUNC', 'O_APPEND', 'O_EXCL', 'O_NONBLOCK', 'O_SYNC', 'S_IRUSR', 'S_IWUSR', 'mode_t', 'ssize_t', 'EOF', 'STDIN_FILENO', 'STDOUT_FILENO', 'STDERR_FILENO', 'errno', 'perror', 'unistd.h', 'fcntl.h', 'Hello World'],
    },

    {
      slug: 'blocking-io',
      title: 'Blocking, non-blocking og poll()',
      short: 'Blocking og poll()',
      week: 'Uge 6 · L6.2',
      definition:
        'Alle file descriptors på Unix starter i **blocking mode**: når der ikke er data, suspenderer kernen processen i `read()`, til mindst én byte er klar. **Non-blocking I/O** får kaldet til at returnere straks — med `-1` og `errno` sat til `EAGAIN`/`EWOULDBLOCK`, hvis der intet er. Kurset viser tre veje: `fcntl()` med `O_NONBLOCK`, `ioctl()` med `FIONBIO` og `poll()` med timeout, og bruger dem til at læse knapper på Raspberry Pi’ens GPIO.',
      concepts: [
        {
          term: 'Blocking I/O',
          body: [
            'Slide 2: “By default, all file descriptors on Unix systems start out in ‘blocking mode’.” I/O-kald som `read` og `write` kan blokere, og en blokeret proces suspenderes af kernen. Eksemplet: når ingen bytes er tilgængelige, venter `read()`, til mindst én byte er klar, og returnerer så til applikationen.',
            '`blocking_io.cpp` skriver “Enter some text: ” og kalder `read(STDIN_FILENO, buffer, BUF_SIZE-1)`. Programmet står stille, til brugeren trykker Enter; først da udskrives “read() completed!”. Bogen bruger samme begreber om message passing: blocking receive venter, til en besked er tilgængelig; nonblocking receive returnerer en gyldig besked eller null (3.6.2, se [[message-passing|message passing]]).',
          ],
        },
        {
          term: 'Non-blocking med fcntl() og EAGAIN',
          body: [
            '`fcntl()` (file control) er et generelt POSIX-kald til at manipulere åbne file descriptors: ændre flags (fx non-blocking), duplikere descriptors, hente og sætte file descriptor- og file status flags samt fillåsning. Signaturen er `int fcntl(int fd, int cmd, ...)`, hvor det valgfri tredje argument afhænger af `cmd`: `F_GETFL`, `F_SETFL`, `F_DUPFD`, `F_GETFD`, `F_SETFD`, `F_SETLK`, `F_GETLK` (s. 4).',
            'Opskriften har to trin: hent de nuværende flags med `F_GETFL`, og sæt dem igen med `O_NONBLOCK` OR’et på, `fcntl(STDIN_FILENO, F_SETFL, flags | O_NONBLOCK)`. OR’en bevarer de eksisterende flags. Herefter returnerer `read()` straks, også uden input.',
            'Et tomt `read()` er ikke en fejl i egentlig forstand. `nonblocking_io.cpp` tester `errno == EAGAIN || errno == EWOULDBLOCK` og skriver “Nothing entered!”; alle andre fejl går til `perror("read()")`. Uden input kommer outputtet med det samme: “Enter some text:”, “read() completed!”, “Nothing entered!”.',
          ],
        },
        {
          term: 'Non-blocking med ioctl() — og fcntl() vs. ioctl()',
          body: [
            '`ioctl()` (I/O control) manipulerer **hardware-enheder** gennem deres file descriptors: terminaler, sockets, block devices og netværksinterfaces. Signaturen er `int ioctl(int fd, unsigned long request, ...)`; tredje argument gives som pointer. Eksempler på `request`: `FIONBIO` (0 = blocking, 1 = non-blocking), `TIOCGWINSZ` (terminalvinduets størrelse), `SIOCGIFADDR` (et interfaces IP-adresse) og `TCGETS` (terminalattributter) (s. 8).',
            'Non-blocking er ét kald: `int flags = 1; ioctl(STDIN_FILENO, FIONBIO, &flags)`. Resten af `ioctl_example.cpp` er magen til fcntl-versionen, og outputtet er det samme.',
            'Sammenligningen på s. 11: `fcntl()` er generel file descriptor-manipulation, mere portabel på tværs af POSIX-systemer og bruges til filer, sockets og pipes (non-blocking, fillåsning, duplikering). `ioctl()` er enhedsspecifik, ofte platform- eller enhedsafhængig og bruges til enheder, terminaler og netværksinterfaces (hardwarekonfiguration, terminalindstillinger). Det er `ioctl()`, der senere sætter I2C-slaveadressen og SPI-mode i [[i2c-spi|I2C og SPI]].',
          ],
        },
        {
          term: 'poll(): vent på flere descriptors med timeout',
          body: [
            '`poll()` overvåger flere file descriptors på én gang for at se, om de er klar til I/O (s. 15). Signaturen er `int poll(struct pollfd fds[], nfds_t nfds, int timeout)`: et array af `pollfd`-structs (én pr. descriptor), antal elementer og en timeout i millisekunder, hvor `-1` venter for evigt, `0` returnerer straks og `N` venter N ms (s. 16).',
            '`struct pollfd` har tre felter: `fd` (descriptoren), `events` (“events to watch for”, input fra programmet) og `revents` (“events that occurred”, output fra kernen). Almindelige flag er `POLLIN` (data at læse), `POLLOUT` (klar til skrivning), `POLLERR` (fejltilstand), `POLLHUP` (hang-up) og `POLLNVAL` (ugyldig descriptor).',
            'Mønstret i `noblkio_edge.cpp`: sæt `poll_fds[i].fd = event_req[i].fd`, `events = POLLIN`, `revents = 0`; kald `poll(&poll_fds[i], 1, POLL_TIMEOUT_MS)` med `POLL_TIMEOUT_MS` = 1; fejl ved `ret_val < 0`; og læs kun, når `poll_fds[i].revents & POLLIN` er sat. Så blokerer `read()` aldrig, og løkken kan lave andet mellem kaldene.',
          ],
        },
        {
          term: 'GPIO: level- vs. edge-triggering',
          body: [
            'En knap aflæses på den digitale pin, den sidder på, og status kan læses på to måder (s. 12). **Level**: spændingen på pinnen, 0 V = logisk ‘0’, +5 V = logisk ‘1’. **Edge**: retningen af ændringen, 0 V → +5 V er en **rising edge**, +5 V → 0 V en **falling edge**.',
            'Hvilket niveau et tryk giver, afhænger af knappen. “Active-low”: trykket forbinder pinnen til ground, så den læser ‘0’. “Active-high”: trykket forbinder den til forsyningen, så den læser ‘1’. Kursets level-kode behandler `data.values[i] == 0` som “pressed”, altså active-low.',
            'Alle tre eksempler åbner `/dev/gpiochip0` med `O_RDONLY` og bruger seks linjer: `GPIO_BTN_A` 27, `GPIO_BTN_B` 22, `GPIO_BTN_UP` 12, `GPIO_BTN_DOWN` 16, `GPIO_BTN_LEFT` 5 og `GPIO_BTN_RIGHT` 6. API’et er GPIO character device userspace API v1 (s. 18).',
          ],
        },
        {
          term: 'De tre GPIO-eksempler',
          body: [
            '**Level-triggered blocking** (`blkio_lvl.cpp`, s. 13): én `gpiohandle_request` med alle seks `lineoffsets`, `flags = GPIOHANDLE_REQUEST_INPUT` og `lines = 6` gives til `ioctl(chip_fd, GPIO_GET_LINEHANDLE_IOCTL, &req)`. Kernen returnerer et handle i `req.fd`, og en `while (true)` kalder `ioctl(req.fd, GPIOHANDLE_GET_LINE_VALUES_IOCTL, &data)` og udskriver “Button i pressed” for hver værdi, der er 0.',
            '**Edge-triggered blocking** (`blkio_edge.cpp`, s. 14): én `gpioevent_request` pr. knap med `eventflags = GPIOEVENT_REQUEST_BOTH_EDGES` og `handleflags = GPIOHANDLE_REQUEST_INPUT`, registreret med `GPIO_GET_LINEEVENT_IOCTL`. Hver giver sin egen `event_req[i].fd`, og `read()` af en `gpioevent_data` blokerer, til der kommer en event; `id` er `GPIOEVENT_EVENT_RISING_EDGE` eller `…FALLING_EDGE`.',
            '**Edge-triggered non-blocking** (`noblkio_edge.cpp`, s. 17): samme event-opsætning, men hver `event_req[i].fd` lægges i en `pollfd`, og `read()` kaldes kun efter `poll()` har sat `POLLIN`. `consumer_label` (“GPIO event monitor”, “GPIO read example”) er det navn, `gpioinfo` viser.',
            'Øvelsen (s. 19) er den fjerde kombination: **level-triggered non-blocking I/O**, med de viste eksempler som inspiration. Den interrupt-drevne udgave med én tråd pr. knap kommer i [[gpio-interrupts|GPIO-interrupts]].',
          ],
        },
      ],
      viz: 'blocking-poll',
      keyPoints: [
        'Alle file descriptors starter i blocking mode; en blokeret proces suspenderes af kernen.',
        '`fcntl(fd, F_GETFL)` og derefter `fcntl(fd, F_SETFL, flags | O_NONBLOCK)`.',
        '`ioctl(fd, FIONBIO, &one)` gør det samme, men `ioctl()` er enhedsspecifik og mindre portabel.',
        'Non-blocking `read()` uden data: `-1` og `errno == EAGAIN || EWOULDBLOCK` — forventet, ikke en fejl.',
        '`poll(fds, nfds, timeout)`: `-1` = for evigt, `0` = straks, `N` = N ms.',
        '`events` sætter du, `revents` sætter kernen; læs kun når `revents & POLLIN`.',
        'Level = spændingen nu; edge = ændringen (rising 0 → 1, falling 1 → 0).',
        'GPIO v1: `GPIO_GET_LINEHANDLE_IOCTL` til level, `GPIO_GET_LINEEVENT_IOCTL` til edge.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Non-blocking stdin med fcntl() og EAGAIN',
          source: 'lecture-code-main/week_6_posix_blocking_nonblocking_io/nonblocking_io/nonblocking_io.cpp',
          code: `// Set standard input fd to non-blocking mode
int flags = fcntl(STDIN_FILENO, F_GETFL, 0);
if (flags < 0) {
    perror("fcntl(F_GETFL)");
    return EXIT_FAILURE;
}

if (fcntl(STDIN_FILENO, F_SETFL, flags | O_NONBLOCK) < 0) {
    perror("fcntl(F_SETFL)");
    return EXIT_FAILURE;
}

const char* prompt = "Enter some text: ";
write(STDOUT_FILENO, prompt, strlen(prompt));

// Read from standard input (keyboard)
ssize_t bytes = read(STDIN_FILENO, buffer, BUF_SIZE-1);

std::cout << "\\nread() completed!\\n";

if (bytes < 0) {
    if (errno == EAGAIN || errno == EWOULDBLOCK) {
        const char* msg = "Nothing entered!\\n";
        write(STDOUT_FILENO, msg, strlen(msg));
    }
    else {
        perror("read()");
    }
    return EXIT_FAILURE;
}`,
        },
        {
          lang: 'cpp',
          title: 'Samme med ioctl() og FIONBIO',
          source: 'lecture-code-main/week_6_posix_blocking_nonblocking_io/ioctl_example/ioctl_example.cpp',
          code: `// 1 = enable non-blocking, 0 = disable
int flags = 1;

// Set standard input fd to non-blocking mode
if (ioctl(STDIN_FILENO, FIONBIO, &flags) == -1) {
    perror("ioctl");
    return EXIT_FAILURE;
}`,
        },
        {
          lang: 'cpp',
          title: 'Edge-triggered non-blocking GPIO med poll()',
          source: 'lecture-code-main/week_6_posix_blocking_nonblocking_io/rpi_gpio/src/noblkio_edge.cpp',
          code: `#define POLL_TIMEOUT_MS 1
// …
for (int i = 0; i < 6; ++i) {
  // Lines report both rising and falling edges
  event_req[i].eventflags = GPIOEVENT_REQUEST_BOTH_EDGES;
  // Lines are set as inputs
  event_req[i].handleflags = GPIOHANDLE_REQUEST_INPUT;
  strcpy(event_req[i].consumer_label, "GPIO event monitor");

  // Use ioctl to get GPIO line event
  ret_val = ioctl(chip_fd,
                  GPIO_GET_LINEEVENT_IOCTL,
                  &event_req[i]);
  // … fejlhåndtering

  poll_fds[i].fd = event_req[i].fd;
  poll_fds[i].events = POLLIN;
  poll_fds[i].revents = 0;
}

struct gpioevent_data event_data[6];

while (true) {
  for (int i = 0; i < 6; ++i) {
    ret_val = poll(&poll_fds[i], 1, POLL_TIMEOUT_MS);
    if (ret_val < 0) {
      perror("poll");
      return EXIT_FAILURE;
    }

    if (poll_fds[i].revents & POLLIN) {
      ssize_t bytes =
          read(poll_fds[i].fd,
               &event_data[i],
               sizeof(event_data[i]));
      if (bytes != sizeof(event_data[i])) {
        perror("read");
      } else {
        if (event_data[i].id == GPIOEVENT_EVENT_RISING_EDGE) {
          std::cout << "\\nButton " << i << ": rising edge";
        }
        if (event_data[i].id == GPIOEVENT_EVENT_FALLING_EDGE) {
          std::cout << "\\nButton " << i << ": falling edge";
        }
      }
    }
  }
}`,
        },
      ],
      exam: [
        'Som standard er alle file descriptors på Unix blocking: har `read()` ingen data, suspenderer kernen processen, til der kommer mindst én byte. Det er enkelt, men programmet kan ikke lave andet imens.',
        'Man gør en descriptor non-blocking med `fcntl()`: hent flagene med `F_GETFL` og sæt dem igen med `O_NONBLOCK` OR’et på. Så returnerer `read()` straks, og uden data får man `-1` med `errno` lig `EAGAIN` eller `EWOULDBLOCK` — det er den forventede opførsel, ikke en fejl. `ioctl()` med `FIONBIO` gør det samme, men `ioctl()` er enhedsspecifik og mindre portabel end `fcntl()`.',
        '`poll()` tager et array af `pollfd`-structs og en timeout, hvor `-1` venter for evigt, `0` returnerer med det samme, og et tal er millisekunder. Jeg sætter `events = POLLIN`, og kernen sætter `revents`, så jeg kun kalder `read()`, når der faktisk er data.',
        'På Raspberry Pi’en kan en knap læses level-triggered — den aktuelle værdi med `GPIOHANDLE_GET_LINE_VALUES_IOCTL` i en løkke — eller edge-triggered, hvor `GPIO_GET_LINEEVENT_IOCTL` giver en descriptor, der leverer rising og falling edges. I kursets `noblkio_edge.cpp` kombineres edge-events med `poll()` og 1 ms timeout, så løkken aldrig hænger på en knap, der ikke bliver trykket.',
        'Afvejningen: blocking er simpelt men låser tråden; non-blocking uden `poll()` giver en løkke, der spinner og bruger CPU; `poll()` med timeout ligger imellem. I den blokerende edge-version læses knapperne én efter én, så knap 1 først ses, når knap 0 har haft en event.',
      ],
      sources: [
        {
          path: k('context/slides/SW3SYS-01_Lecture06_2_POSIX_blocking_nonblocking_IO.md'),
          original: '06.2-Week_5_-POSIX_IO_-_blocking_and_non-blocking_IO.pdf',
          pages: 's. 2–19',
        },
        {
          path: k('context/kode/SW3SYS-01_Code_week_6_posix_io.md'),
          original: 'lecture-code-main/week_6_posix_blocking_nonblocking_io/',
          note: 'blocking_io, nonblocking_io, ioctl_example, rpi_gpio (blkio_lvl, blkio_edge, noblkio_edge).',
        },
        {
          path: k('context/book/SW3SYS-01_Ch03_Processes.md'),
          original: 'Silberschatz, Operating System Concepts (Global Edition)',
          pages: 'afsnit 3.6.2',
          note: 'Blocking og nonblocking send/receive — kun for message passing.',
        },
      ],
      gaps: [
        'Slide 16 siger, at `poll()` returnerer “0 on success, -1 on failure”. Uden for materialet: det er upræcist — 0 betyder, at timeouten udløb uden events, og en positiv returværdi er antallet af descriptors med events. Markdown-konverteringen tilføjer “positivt tal = antal” uden at det står på slidet. Samme formulering går igen i 12.2.',
        'Slide 4 siger, at `fcntl()` returnerer “0 on success”, men koden bruger returværdien fra `F_GETFL` som selve flagene (`int flags = fcntl(STDIN_FILENO, F_GETFL, 0)`). Returværdien afhænger af `cmd`, hvilket slidet ikke siger.',
        'Slide 15 (poll) har to punkter kopieret fra ioctl-slidet: “How non-blocking I/O with ioctl() works: Set FIONBIO flag …”. Der står intet om, hvordan `poll()` selv virker ud over signaturen på s. 16.',
        'Slide 13 kalder level-eksemplet “blocking I/O”, men `GPIOHANDLE_GET_LINE_VALUES_IOCTL` returnerer de aktuelle værdier og blokerer ikke på en ændring; løkken spinner. Slidet forklarer ikke, hvad der blokerer. Markdown-konverteringens “busy-wait” er dens egen tilføjelse.',
        '`noblkio_edge.cpp` kalder `poll()` med `nfds = 1` for hver knap efter tur i stedet for ét kald over alle seks, selv om slidet præsenterer `poll()` som måden at overvåge flere descriptors på. Med 1 ms timeout kan en runde tage op til ca. 6 ms.',
        'I `blkio_edge.cpp` blokerer `read()` på knapperne i rækkefølge, så en event på knap 1 først læses, når knap 0 har haft en event. Slidet nævner det ikke.',
        'Forskellen mellem `EAGAIN` og `EWOULDBLOCK` forklares ikke; koden tester blot begge.',
        'Øvelsen (level-triggered non-blocking) har ingen løsning i materialet. Konverteringens hint om at kombinere s. 13 og 17 er konverteringens eget.',
        'PDF-filnavnet siger “Week_5”, mens decket i kursusplanen er L6.2 (uge 6).',
        'Uden for materialet: slide 12 bruger 0 V/+5 V som logiske niveauer, men Raspberry Pi’ens GPIO-pins arbejder med 3,3 V og er ikke 5 V-tolerante.',
        'Uden for materialet: GPIO character device API v1 (`GPIO_GET_LINEHANDLE_IOCTL`, `GPIO_GET_LINEEVENT_IOCTL`), som slidet linker til, er i kernen erstattet af v2 (`GPIO_V2_GET_LINE_IOCTL`) og regnes for forældet. `select()` og `epoll()` nævnes ikke i materialet.',
      ],
      keywords: ['blocking I/O', 'non-blocking I/O', 'nonblocking', 'blokerende', 'fcntl', 'F_GETFL', 'F_SETFL', 'F_DUPFD', 'F_SETLK', 'O_NONBLOCK', 'ioctl', 'FIONBIO', 'TIOCGWINSZ', 'EAGAIN', 'EWOULDBLOCK', 'errno', 'poll', 'pollfd', 'revents', 'POLLIN', 'POLLOUT', 'POLLERR', 'POLLHUP', 'POLLNVAL', 'timeout', 'GPIO', 'gpiochip0', 'level-triggered', 'edge-triggered', 'rising edge', 'falling edge', 'active-low', 'active-high', 'GPIO_GET_LINEHANDLE_IOCTL', 'GPIO_GET_LINEEVENT_IOCTL', 'GPIOHANDLE_GET_LINE_VALUES_IOCTL', 'gpioevent_request', 'gpioevent_data'],
    },

    {
      slug: 'i2c-spi',
      title: 'I2C og SPI fra user space',
      short: 'I2C og SPI',
      week: 'Uge 8 · L8.2 og Uge 11 · L11.2',
      definition:
        '**I2C** og **SPI** er synkrone serielle busser, som en master bruger til at tale med perifere enheder. I2C klarer sig med to ledninger (SDA, SCL), vælger slaven med en 7-bit adresse og er half-duplex; SPI bruger fire (SCK, MOSI, MISO, CS), vælger slaven med en chip-select-linje og er full-duplex. I Linux tilgås begge fra user space som filer — `/dev/i2c-1` og `/dev/spidev0.0` — med `open()`, `ioctl()`, `read()`/`write()` og `close()`.',
      concepts: [
        {
          term: 'I2C: to ledninger, adresser og master-slave',
          body: [
            'I2C (I²C, IIC) bruges af mikrocontrollere og -processorer til at tale med langsommere enheder (08.2 s. 2). Den er seriel med kun én datalinje og synkron, fordi et clocksignal styrer overførslen. To ledninger: **SCL** (serial clock, synkroniserer master og slave) og **SDA** (serial data). Der kan være mange masters og mange slaves, men kun én master styrer bussen ad gangen. Typiske anvendelser: sensorer, real-time clocks, langsomme DAC’er og ADC’er og EEPROM.',
            'Hver slave har en **unik, fast 7-bit adresse**, så én master kan tale med op til 128 slaves; 10-bit adresser er også tilladt. Masteren starter alle overførsler ved at sende den ønskede adresse; alle slaves modtager den, men kun den med matchende adresse sender eller modtager på SDA. Overførslen er **half-duplex**: kun én enhed sender ad gangen (s. 3).',
            'På Raspberry Pi’en er SDA GPIO 2 (pin 3) og SCL GPIO 3 (pin 5) (s. 6). `i2cdetect -l` lister adapterne (på Pi’en `i2c-1`, “Synopsys DesignWare I2C adapter”), og `i2cdetect -y 1` scanner bussen: uden enhed er tabellen fuld af `--`, med kursets OLED står `3c`, altså adresse `0x3C` (s. 10).',
          ],
        },
        {
          term: 'I2C-rammen: start, adresse, R/W, ACK, data, stop',
          body: [
            'Slide 4 viser en læsning. Masteren sender **START** (S), de syv adressebits `A6`–`A0` og **R/W**-bitten — “RW = 1 for read (master receives data), or 0 for write (master sends data)”. Så kommer **ACK** fra slaven: “ACK = 0 for successful transfer, or 1 if receiver cannot accept data.” Derefter sender slaven databyten `D7`–`D0`, MSB først, og rammen slutter med NACK og **STOP** (P).',
            'Farverne på slidet viser, hvem der styrer SDA: controlleren under start, adresse og R/W; target (slaven) under ACK og databyten ved en læsning. Adressedelen kaldes *address frame*, databyten *data frame*.',
            'Ved **multi-byte transfer** (s. 5) gentages data og ACK uden ny start: Start · Address (7 eller 10 bits) · R/W (1 bit) · Ack (1 bit) · Data0 (8 bits) · Ack0 · Data1 · Ack1 · … · DataN · AckN · Stop. OLED-koden bruger det til at sende en hel page af pixeldata i ét `write()`.',
          ],
        },
        {
          term: 'I2C fra user space: open, ioctl(I2C_SLAVE), read/write',
          body: [
            'Opskriften på s. 11: `fd = open(I2C_DEV, O_RDWR)`, hvor `I2C_DEV` er `"/dev/i2c-1"`, og derefter `ioctl(fd, I2C_SLAVE, SSD1306_ADDR)`. `I2C_SLAVE` er en IOCTL-kode, “defined in linux/i2c-dev.h”, der fortæller I2C-driveren, at slaveadressen står i tredje argument. Herefter går almindelige `write()` og `read()` til den slave.',
            'Space-shooter-projektets `I2CDriver` (s. 7–9) følger samme mønster i hvert kald: sæt adressen med `ioctl(fd_, I2C_SLAVE, slaveAddress)` (fejl → `-1`), og kald så `::write(fd_, buf, length)` eller `::read(fd_, buf, length)` og sammenlign med `length` (fejl → `-2`). `::` kalder den globale POSIX-funktion frem for klassens egen `write`/`read`.',
            'Kursets SSD1306-driver (`i2c/ssd1306_oled`) sender to bytes pr. kommando: en kontrolbyte og selve byten — `{0x80, cmd}` for en kommando, `{0xC0, data}` for én databyte og `0x40` foran en hel række data i `sendNData()`. Headeren definerer `OLED_WIDTH` 128, `OLED_HEIGHT` 32 og `SSD1306_ADDR` `0x3C`.',
          ],
        },
        {
          term: 'SPI: fire ledninger, chip select og full duplex',
          body: [
            'SPI bruges til hurtigere enheder (08.2 s. 13). Den er seriel med **to datalinjer** og synkron, og kræver fire ledninger: **SCK** (clock), **MOSI** (Master-Out-Slave-In), **MISO** (Master-In-Slave-Out) og **CS** (Chip-Select, aktiverer én slave). Der er kun én master og få slaves; typiske enheder er flash-hukommelse og SD-kort.',
            'Slaven vælges uden adresser (s. 14): hver slave har sin egen CS-linje, masteren skal have én CS pr. slave, og kun én kan være aktiv ad gangen. Masteren starter en overførsel ved at trække slavens CS til logisk ‘0’, sender data og kommandoer på MOSI og modtager på MISO. Overførslen er **full-duplex** — begge sender og modtager samtidig.',
            'På Pi’en: MOSI = GPIO 10 (pin 19), MISO = GPIO 9 (pin 21), SCLK = GPIO 11 (pin 23), CE0 = GPIO 7 (pin 24), CE1 = GPIO 8 (pin 26) (s. 16). `/dev/spidev0.0` er bus 0 med chip select 0.',
          ],
        },
        {
          term: 'CPOL, CPHA og de fire SPI-modes',
          body: [
            '**CPOL** styrer clockens polaritet: CPOL = 0 → SCK er ‘0’ i hvile; CPOL = 1 → SCK er ‘1’ i hvile. **CPHA** styrer fasen, altså hvornår MOSI/MISO samples: diagrammet på s. 15 siger “samples on leading edge” for CPHA = 0 og “trailing edge” for CPHA = 1. Data sendes MSB først, Bit 7 → Bit 0.',
            'Tabellen giver de fire modes: mode 0 = (CPOL 0, CPHA 0), mode 1 = (0, 1), mode 2 = (1, 0), mode 3 = (1, 1). Master og slave skal køre samme mode. BMI160-databladet (11.2 s. 9) siger, at chippen kun kan mode ‘00’ og ‘11’, og at den vælger automatisk ud fra SCK’s værdi efter en falling edge på CSB. SDI og SDO drives på falling edge og samples på rising edge.',
          ],
        },
        {
          term: 'SPI fra user space: spidev, ioctl og spi_ioc_transfer',
          body: [
            'Opsætning (08.2 s. 17, 11.2 s. 6): `open(SPI_DEVICE, …)` og tre `ioctl()`-kald — `SPI_IOC_WR_MODE` (fx `SPI_MODE_0`), `SPI_IOC_WR_BITS_PER_WORD` (8) og `SPI_IOC_WR_MAX_SPEED_HZ` (OLED’en 8 MHz, IMU’en 1 MHz). Alle konstanter står i `linux/spi/spidev.h`. `closeSPI()` lukker descriptoren, hvis den er ≥ 0.',
            'Til OLED’en er et almindeligt `write(spi_fd, &cmd, 1)` nok, fordi der kun sendes. SPI-modulet har en ekstra **DC**-pin (data/command), der sættes med GPIO før hver byte: `writeGPIO(DC_PIN, 0)` for kommando, `1` for data (s. 18). `writeGPIO()` læser linjernes værdier med `GPIOHANDLE_GET_LINE_VALUES_IOCTL` og skriver dem med `GPIOHANDLE_SET_LINE_VALUES_IOCTL`. I koden er `DC_PIN` 24 og `RESET_PIN` 25. SPI-modulet har syv pins (GND, VCC, D0, D1, RES, DC, CS) mod I2C-modulets fire (GND, VDD, SCK, SDA) (s. 12, 20).',
            'Skal der også læses, bruges `struct spi_ioc_transfer` (11.2 s. 7): `tx_buf` og `rx_buf` (samme buffer, fordi SPI er full duplex), `len` (antal bytes), `cs_change` (om CS skal skifte mellem transfers), `delay_usecs` (forsinkelse før CS frigives), `speed_hz` og `bits_per_word`. `ioctl(fd, SPI_IOC_MESSAGE(1), &tx)` beder controlleren udføre én transfer.',
          ],
        },
        {
          term: 'BMI160: læs og skriv registre over SPI',
          body: [
            'BMI160 starter i **I2C-mode** og skifter til SPI, når CSB ser en rising edge efter power-up. Databladet anbefaler derfor “a SPI single read access to the ADDRESS 0x7F before the actual communication” (11.2 s. 8). Maks. SPI-clock er 10 MHz ved `VDDIO ≥ 1.71 V` (7,5 MHz under); timingtabellen (48 ns SCK low/high, 20 ns setup osv.) er kun vigtig, hvis man bit-banger SPI på GPIO eller kører bare-metal uden OS (s. 10).',
            'En registerlæsning er 16 clocks (s. 11–12): de første 8 bits sendes til slaven — **R/W-bit først** (1 = read, 0 = write) og så 7 adressebits — og de næste 8 modtages. Derfor er bufferen `uint8_t buffer[2]`, og `buffer[0] = reg | 0x80`. Efter transferen indeholder `buffer[0]` 0xFF (skrald fra full duplex), mens `buffer[1]` er registerets data. N bytes kræver `buffer[N+1]` (s. 13).',
            '`readReg(reg, nbytes)` bygger `buf[0] = reg | BMI160_READ_BIT`, sætter `len = nbytes + 1` og kopierer `buf[i+1]` ud bagefter; `writeReg(reg, data)` sender `{reg, data}` uden read-bit (s. 15). `main()` læser `BMI160_CHIP_ID_REG` (0x00), og output er “Chip ID: 0xd1” (s. 16). `gyro_tilt.cpp` starter gyroen med `writeReg(0x7E, 0x15)`, tjekker bit `0x40` i statusregistret 0x1B og læser 6 bytes fra 0x0C.',
            'Øvelsen (s. 18): skriv “UP”, “DOWN”, “LEFT” eller “RIGHT”, når HAT’en tiltes. Gyrodata er signed 16-bit, lagret som 2 bytes med den mindst betydende byte først, og omregnes med `deg per sec = raw value / 16.4`. Registrene står på s. 52 i databladet, akserne på s. 107.',
          ],
        },
        {
          term: 'I2C vs. SPI',
          body: [
            'Tabellen på 08.2 s. 21: I2C har 7- eller 10-bit adressering, SPI ingen standardiseret adressering. I2C tillader op til 128 enheder (7-bit) på delte linjer; SPI er “better suited for point-to-point communication between two devices”. I2C’s to ledninger minimerer forbindelser, men gør bussen støjfølsom; SPI’s fire ledninger giver flere forbindelser, men mindre støjfølsomhed.',
            'I2C har lavere strømforbrug på grund af færre ledninger, SPI højere. Og I2C’s half-duplex egner sig til mindre krævende opgaver som sensoraflæsning, mens SPI’s full duplex giver “fast and efficient communication, especially for high-bandwidth data transfer”. Kursets SSD1306 vises i begge udgaver: I2C-demoen har et 128×32- og et 128×64-display, SPI-demoen et 128×64 (s. 12, 20).',
          ],
        },
      ],
      viz: 'i2c-spi-frame',
      keyPoints: [
        'I2C: SDA + SCL, 7-bit adresse (128 slaves), half-duplex, ACK efter hver byte.',
        'I2C-ramme: START · A6–A0 · R/W · ACK · D7–D0 · ACK … · STOP; R/W = 1 er read.',
        'I2C i Linux: `open("/dev/i2c-1", O_RDWR)` → `ioctl(fd, I2C_SLAVE, 0x3C)` → `read`/`write`.',
        'SPI: SCK, MOSI, MISO, CS; ingen adresser, CS lav vælger slaven, full-duplex.',
        'SPI-mode = (CPOL, CPHA): 0 = (0,0), 1 = (0,1), 2 = (1,0), 3 = (1,1). BMI160 kan 0 og 3.',
        'spidev: `SPI_IOC_WR_MODE`, `…BITS_PER_WORD`, `…MAX_SPEED_HZ`; transfer med `SPI_IOC_MESSAGE(1)`.',
        'BMI160-læsning: `buf[0] = reg | 0x80`, `len = nbytes + 1`, data fra `buf[1]`.',
        'SPI-OLED’en skelner kommando fra data med en GPIO-styret DC-pin; over I2C gør en kontrolbyte (`0x80`/`0xC0`) det.',
        'UART står i kursuskataloget, men har ingen slides eller kode.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Åbn I2C-slaven og send kommando/data til SSD1306',
          source: 'lecture-code-main/week_9_posix_io_i2c_and_spi_communication/i2c/ssd1306_oled/src/SSD1306.cpp',
          code: `// Open I2C device
int SSD1306::openI2C() {
  fd = open(I2C_DEV, O_RDWR);
  if (fd < 0) {
    perror("open()");
    return -1;
  }

  if (ioctl(fd,I2C_SLAVE, SSD1306_ADDR) < 0) {
    perror("ioctl()");
    return -1;
  }

  return 0;
}

// Send a single command byte to I2C device
bool SSD1306::sendCommand(uint8_t cmd) {
  uint8_t buf[2] = {0x80, cmd};
  return write(fd, buf, 2) == 2;
}

// Send a single data byte to I2C device
bool SSD1306::sendData(uint8_t data) {
  uint8_t buf[2] = {0xC0, data};
  return write(fd, buf, 2) == 2;
}`,
        },
        {
          lang: 'cpp',
          title: 'Konfigurér SPI med ioctl() og send via DC-pin',
          source: 'lecture-code-main/week_9_posix_io_i2c_and_spi_communication/spi/ssd1306_oled/src/SSD1306.cpp',
          code: `// Open SPI device
bool initSPI(void) {
  spi_fd = open(SPI_DEVICE, O_WRONLY);
  if (spi_fd < 0) {
    perror("open(): Cannot open SPI device");
    exit(EXIT_FAILURE);
  }

  uint8_t mode = SPI_MODE_0;
  uint8_t bits = 8;
  uint32_t speed = SPI_SPEED;

  if (ioctl(spi_fd, SPI_IOC_WR_MODE, &mode) < 0) {
    perror("ioctl()");
    exit(EXIT_FAILURE);
  }
  if (ioctl(spi_fd, SPI_IOC_WR_BITS_PER_WORD, &bits) < 0) {
    perror("ioctl()");
    exit(EXIT_FAILURE);
  }
  if (ioctl(spi_fd, SPI_IOC_WR_MAX_SPEED_HZ, &speed) < 0) {
    perror("ioctl()");
    exit(EXIT_FAILURE);
  }
  // …
  return true;
}

// Send a single command byte
bool sendCommand(uint8_t cmd) {
  writeGPIO(DC_PIN,0);
  return write(spi_fd, &cmd, 1) == 1;
}

// Send a single data byte
bool sendData(uint8_t data) {
  writeGPIO(DC_PIN,1);
  return write(spi_fd, &data, 1) == 1;
}`,
        },
        {
          lang: 'cpp',
          title: 'Læs og skriv BMI160-registre med spi_ioc_transfer',
          source: '11.2-Week_12_-_IO_wrap-up.pdf s. 15',
          code: `int readReg(uint8_t reg, uint8_t nbytes) {
  if (nbytes > MAXBUFSIZE) {
    return -1;
  }

  uint8_t buf[nbytes+1] = {0};

  buf[0] = reg | BMI160_READ_BIT;

  tx[0].tx_buf = (__u64)buf;
  tx[0].rx_buf = (__u64)buf;
  tx[0].len = (__u32)nbytes + 1;
  tx[0].cs_change = 0;
  tx[0].delay_usecs = 0;
  tx[0].speed_hz = SPI_SPEED;
  tx[0].bits_per_word = SPI_BITS_PER_WORD;

  if (ioctl(fd, SPI_IOC_MESSAGE(1), &tx) < 0) {
    perror("ioctl()");
    close(fd);
    exit(EXIT_FAILURE);
  }

  for (uint8_t i = 0; i < nbytes; ++i) {
    buffer[i] = buf[i+1];
  }

  return 0;
}

int writeReg(uint8_t reg, uint8_t data) {

  uint8_t buf[2] = {0};

  buf[0] = reg;
  buf[1] = data;

  tx[0].tx_buf = (__u64)buf;
  tx[0].rx_buf = (__u64)buf;
  tx[0].len = (__u32)sizeof(buf);
  // … cs_change, delay_usecs, speed_hz, bits_per_word som ovenfor

  if (ioctl(fd, SPI_IOC_MESSAGE(1), &tx) < 0) {
    perror("ioctl()");
    close(fd);
    exit(EXIT_FAILURE);
  }

  return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Start gyroen og læs 6 bytes gyrodata',
          source: 'lecture-code-main/week12_IO_wrapup/gyro_tilt/src/gyro_tilt.cpp',
          code: `#define BMI160_CMD_REG 0x7E
#define BMI160_GYRO_REG 0x0C
#define BMI160_STATUS_REG 0x1B
#define BMI160_GYRO_SENS 16.4
// …
// Turn on gyro
void startGyro(void) {
  memset(&tx, 0, sizeof(tx));
  memset(&buffer, 0, sizeof(buffer));

  if (writeReg(BMI160_CMD_REG, 0x15) < 0) {
    std::cerr << "writeReg() failed\\n";
    close(fd);
    exit(EXIT_FAILURE);
  }
  // Sleep to allow gyro to start up
  usleep(100000);
}

// Get gyro status
bool isGyroDataAvailable(void) {
  // …
  if (readReg(BMI160_STATUS_REG, 1) < 0) {
    // …
  }
  return (buffer[0] & 0x40) == 0x40;
}
// …
    readGyro();   // readReg(BMI160_GYRO_REG, 6)

    double gx = (double)(((int8_t)buffer[1] << 8 | (int8_t)buffer[0]) / BMI160_GYRO_SENS);`,
        },
      ],
      exam: [
        'I2C og SPI er synkrone serielle busser mellem en master og perifere enheder. I2C har to ledninger, SDA og SCL, og vælger slaven med en 7-bit adresse — op til 128 enheder på samme bus — mens SPI har fire ledninger, SCK, MOSI, MISO og CS, og vælger slaven med en dedikeret chip-select-linje uden adresser.',
        'En I2C-læsning er START, syv adressebits, R/W-bit lig 1, ACK fra slaven, otte databits MSB først og til sidst NACK og STOP. I2C er half-duplex; SPI er full-duplex, fordi MOSI og MISO kører samtidig, og SPI-mode bestemmes af CPOL (clockens hvileniveau) og CPHA (hvilken flanke der samples på).',
        'Fra user space er begge filer. I2C: `open("/dev/i2c-1", O_RDWR)`, `ioctl(fd, I2C_SLAVE, 0x3C)` og så almindelige `write()`-kald til OLED’en. SPI: `open("/dev/spidev0.0")`, `ioctl()` med `SPI_IOC_WR_MODE`, `BITS_PER_WORD` og `MAX_SPEED_HZ`, og en `spi_ioc_transfer` sendt med `SPI_IOC_MESSAGE(1)`.',
        'For BMI160 sætter jeg MSB i første byte som read-bit, `reg | 0x80`, og bruger en buffer på `nbytes + 1`, fordi de første 8 bits går ud, mens slaven endnu ikke ved, hvad den skal svare; `buf[0]` er skrald, data står fra `buf[1]`. Kursets `readReg` af chip-ID-registret 0x00 giver 0xD1.',
        'Afvejningen er ifølge kurset: I2C sparer ledninger og strøm og passer til mange langsomme sensorer, men er støjfølsom; SPI er hurtigere og mindre støjfølsom, men kræver en CS-linje pr. slave, og OLED’en skal have ekstra pins som DC og RES, hvor I2C-udgaven klarer sig med fire. En faldgrube er at glemme, at BMI160 starter i I2C-mode og kun kan SPI mode 0 og 3.',
      ],
      sources: [
        {
          path: k('context/slides/SW3SYS-01_Lecture08_2_POSIX_I2C_SPI.md'),
          original: '08.2-Week_9_-_POSIX_I2C_and_SPI_communication.pdf',
          pages: 's. 2–23',
        },
        {
          path: k('context/slides/SW3SYS-01_Lecture11_2_IO_wrapup.md'),
          original: '11.2-Week_12_-_IO_wrap-up.pdf',
          pages: 's. 2–18',
        },
        {
          path: k('context/kode/SW3SYS-01_Code_week_9_i2c_spi.md'),
          original: 'lecture-code-main/week_9_posix_io_i2c_and_spi_communication/',
          note: 'i2c/ssd1306_oled og spi/ssd1306_oled.',
        },
        {
          path: k('context/kode/SW3SYS-01_Code_week_12_io_wrapup.md'),
          original: 'lecture-code-main/week12_IO_wrapup/',
          note: 'imu_spi og gyro_tilt.',
        },
        {
          path: k('context/slides/SW3SYS-01_Lecture09_2_Interrupts_Bus_Architecture_DMA.md'),
          original: '09.2-Week_10_-_Interrupts__bus_architecture_and_DMA.pdf',
          note: 'Eneste sted UART optræder: som linjen `uart-pl011` i et `/proc/interrupts`-udtræk.',
        },
      ],
      gaps: [
        '**UART** står i kursuskataloget (“userland I/O (mmap), UART, I2C/SPI-sensorer og aktuatorer”), men ingen slides, kode eller bogudsnit dækker det. UART optræder kun som `uart-pl011` i et `/proc/interrupts`-udtræk i 09.2.',
        'CPHA er beskrevet to måder: teksten på 08.2 s. 15 og 11.2 s. 4 siger “CPHA = 0 → read on rising edge, CPHA = 1 → falling edge”, mens diagrammet siger leading/trailing edge. De to er kun ens for CPOL = 0; ved CPOL = 1 er leading edge en falling edge.',
        'Slide 4 (08.2) viser NACK før STOP i bitrækken, men skriver “ACK” ved samme bit i timingdiagrammet. At START og STOP er SDA-overgange, mens SCL er høj, fremgår kun af kurveformen, ikke af teksten.',
        'Slide 11 (08.2) forklarer `SSD1306_ADDR` med “Allow read/write access” — kopieret fra `O_RDWR`. Adressen er `0x3C` (s. 10 og `SSD1306.hpp`).',
        'Øvelsen på 08.2 s. 23 siger, at OLED’en har “128 rows (0-127) and 32 columns (0-31)”. Koden har det omvendt: `OLED_WIDTH` 128 er x/kolonner og `OLED_HEIGHT` 32 er y/rækker (`drawPixel` afviser `x >= OLED_WIDTH`).',
        '11.2 s. 14 viser `SPI_MODE_3` i `initSPI()`, men kursets `imu_spi.cpp` og `gyro_tilt.cpp` bruger `SPI_MODE_0`. Begge er modes, som BMI160 kan.',
        'Begge IMU-programmer kalder `SPI_IOC_RD_MODE`/`RD_BITS_PER_WORD`/`RD_MAX_SPEED_HZ` ind i `mode`, `bits` og `speed` *før* `WR_*`-kaldene og tjekker ingen af returværdierne. Uden for materialet: `RD_*` læser den aktuelle indstilling ind i variablen, så den valgte mode og hastighed overskrives og aldrig skrives.',
        'Databladet anbefaler en dummy-læsning af adresse 0x7F før SPI-kommunikation (11.2 s. 8), men hverken `imu_spi.cpp` eller `gyro_tilt.cpp` gør det. Markdown-konverteringens påstand om, at chip-ID-læsningen “fungerer som dummy-read”, står ikke i originalen.',
        'Kontrolbytes for SSD1306 over I2C (`0x80` kommando, `0xC0` data, `0x40` datastrøm) forklares ikke på slidene. `SSD1306.hpp` definerer `SSD1306_COMMAND` som `0x00`, men koden bruger `0x80`.',
        'I I2C-driveren er `fd` erklæret `uint8_t` (`SSD1306.hpp`), og i IMU-koden `int8_t`. Med `uint8_t` kan `fd < 0` aldrig blive sand, så en fejlet `open()` opdages ikke.',
        'Uden for materialet: `gyro_tilt.cpp` caster begge bytes til `int8_t` før samlingen, `(int8_t)buffer[1] << 8 | (int8_t)buffer[0]`. Er den lave byte ≥ 0x80, fortegnsudvides den og overskriver den høje byte. Den lave byte skal behandles som `uint8_t`. Programmets `while (isGyroDataAvailable())` stopper desuden første gang data ikke er klar.',
        'Faktoren 16.4 gives uden måleområde på 11.2 s. 18; konverteringens “±2000 °/s range” står ikke på slidet.',
        '`read()` på en SPI-descriptor vises ikke; OLED-koden åbner `O_WRONLY`, IMU-koden `O_RDWR` og læser via `SPI_IOC_MESSAGE`. `cs_change` beskrives kun som “sets CS line to be HIGH or LOW between each transfer”.',
        'Bogudsnittene (kap. 1, 3–8) nævner hverken I2C eller SPI; emnet bygger kun på slides og kode. PDF-filnavnene siger “Week_9” og “Week_12”, mens kursusplanen har decks 8.2 og 11.2.',
      ],
      keywords: ['I2C', 'I²C', 'IIC', 'Inter-Integrated Circuit', 'SDA', 'SCL', 'slave address', '0x3C', 'START', 'STOP', 'ACK', 'NACK', 'R/W', 'half-duplex', 'i2cdetect', '/dev/i2c-1', 'I2C_SLAVE', 'linux/i2c-dev.h', 'SPI', 'Serial Peripheral Interface', 'MOSI', 'MISO', 'SCK', 'SCLK', 'CS', 'chip select', 'CE0', 'full-duplex', 'CPOL', 'CPHA', 'SPI mode', 'spidev', '/dev/spidev0.0', 'SPI_IOC_WR_MODE', 'SPI_IOC_MESSAGE', 'spi_ioc_transfer', 'SSD1306', 'OLED', 'DC pin', 'BMI160', 'IMU', 'gyroscope', 'chip ID 0xD1', 'read bit 0x80', 'UART'],
    },
  ],
}
