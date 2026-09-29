import type { Part } from '../types'
import { k } from './paths'

const BOG = 'Silberschatz, Operating System Concepts (Global Edition)'

export const processerTraade: Part = {
  id: 'processer-traade',
  title: 'Processer og tråde',
  topics: [
    // ─────────────────────────────────────────────────────────────── processer
    {
      slug: 'processer',
      title: 'Processer, PCB og context switch',
      short: 'Processer og PCB',
      week: 'Uge 2 · L2.1',
      definition:
        'En **proces** er “a program in execution”: et program er en passiv fil på disken, en proces er den aktive udførelse med program counter, registre og sit eget adresserum. OS’et holder styr på hver proces i en **process control block (PCB)**, flytter den mellem tilstandene new, ready, running, waiting og terminated, og skifter mellem processer med et **context switch**.',
      concepts: [
        {
          term: 'Program og proces',
          body: [
            'Slide 2 i 02.1 har kun én sætning: “A process is a program in execution”. Bogen uddyber: et program er en *passiv* entitet — en executable file på disken — mens en proces er en *aktiv* entitet med en program counter, der peger på næste instruktion, og tilknyttede ressourcer. Programmet bliver en proces, når den eksekverbare fil loades i hukommelsen.',
            'To processer kan køre samme program og er stadig to separate udførelsessekvenser med hver sin data-, heap- og stack-sektion. Slide 3 (“Anatomy of a process”) opregner, hvad en proces kræver af hardwaren: CPU, program counter, registre, hukommelse og (interrupts). Pipeline-figuren på slidet viser de fem RISC-trin IF, ID, EX, MEM, WB.',
            'Bogen bruger ordene *job*, *task* og *process* nærmest synonymt; job er batch-systemernes ord, process er det foretrukne. Slidet “Threaded processes” i 03.2a bygger videre: en proces kan have flere tråde, se [[traade|tråde]].',
          ],
        },
        {
          term: 'Hukommelseslayout: text, data, heap, stack',
          body: [
            'Slide 4 viser layoutet fra *low memory* til *high memory*: **text** (maskinkoden), **initialized data**, **uninitialized data**, **heap**, et frit område, **stack** og øverst `argc, argv`. Heap og stack vokser mod hinanden — heap opad, stack nedad.',
            'Eksempelprogrammet på slidet placerer hver linje: `int x;` havner i uninitialized data, `int y = 15;` i initialized data, de lokale `int *values; int i;` på stakken, blokken fra `malloc(sizeof(int)*5)` på heapen, og `argc`/`argv` i toppen. Bogen kalder uninitialized data for **BSS** (“block started by symbol”) og viser `size memory` med `text 1158`, `data 284`, `bss 8`, `dec 1450`, `hex 5aa`.',
            'Text- og data-sektionerne har fast størrelse under kørslen; stack og heap vokser og skrumper. Hvert funktionskald pusher en **activation record** (parametre, lokale variable, returadresse) på stakken, og OS’et skal sikre, at stack og heap ikke overlapper (bog 3.1.1).',
          ],
        },
        {
          term: 'Procestilstande og CPU- vs. I/O-bound',
          body: [
            'Fem tilstande (slide 5 og bogens Figur 3.2): **new** → *admitted* → **ready** → *scheduler dispatch* → **running**. Fra running kan processen gå tilbage til ready ved *interrupt*, til **waiting** ved *I/O or event wait*, eller til **terminated** ved *exit*. Fra waiting går den til ready ved *I/O or event completion* — aldrig direkte til running.',
            'Kun én proces kan være running på en kerne ad gangen; mange kan være ready eller waiting (bog 3.1.2). Slidet tegner to baner: en **CPU bound task** (grøn) pendler mellem ready og running, en **I/O bound task** (rød) går running → waiting → ready igen og igen. Det er grundlaget for [[cpu-scheduling|CPU-scheduling]] og for, hvornår tråde hjælper.',
          ],
        },
        {
          term: 'Process control block og køer',
          body: [
            'Slide 6 viser PCB’en som en stak felter: *process state*, *process number* (PID), *program counter*, *registers*, *memory limits*, *list of open files* og “…”. Bogen (3.1.3) har den fulde liste: process state, program counter, CPU registers, CPU-scheduling information (prioritet, pointere til køer), memory-management information (base/limit-registre, sidetabeller), accounting information og I/O status information. PCB’en er “the repository for all the data needed to start, or restart, a process”.',
            'I Linux er PCB’en C-strukturen `task_struct` i `<include/linux/sched.h>` med felter som `long state`, `struct sched_entity se`, `struct task_struct *parent`, `struct list_head children`, `struct files_struct *files` og `struct mm_struct *mm`. Aktive processer ligger i en doubly linked list, og kernen peger på den kørende med `current` (`current->state = new_state;`).',
            'PCB’erne organiseres i køer: slidet tegner en **Ready Queue** og en **Wait Queue** som doubly linked lists med `head`, `Next` og `Prev` (PCB7 → PCB2 → PCB22). Bogen: ready queue har en header med pointere til første og sidste PCB; processer, der venter på en hændelse, står i en wait queue.',
          ],
        },
        {
          term: 'Process scheduler',
          body: [
            'Slide 7 er et flowchart: processen står i *Await Ready Queue* (her allokeres CPU-ressourcer), udfører instruktioner og tjekker fire spørgsmål i rækkefølge: *I/O Request?* → *Await I/O*; *Create Child process?* → *Await Child Termination*; *Waiting for Interrupt?* → *Await Interrupt*; *Time Slice Passed?* → direkte tilbage til ready queue. Alle ventegrene ender i ready queue. Det er bogens queueing-diagram (Figur 3.5).',
            'Bogen skelner mellem **multiprogramming** (altid en proces i gang, så CPU’en udnyttes) og **time sharing** (skift så ofte, at brugeren kan interagere). Antallet af processer i hukommelsen er **degree of multiprogramming**. CPU-scheduleren kører typisk mindst hver 100 ms (bog 3.2.2).',
          ],
        },
        {
          term: 'Context switch',
          body: [
            'Et context switch sker, når et interrupt eller et system call får OS’et til at skifte proces. Slide 8: “Must be fast!”; processens tilstand opdateres før skiftet; konteksten holdes i hukommelsen “using special hardware”; næste proces’ tilstand hentes fra dens PCB, og den får adgang til sin hukommelseskontekst.',
            'Bogens Figur 3.6: P0 kører → interrupt/system call → *save state into PCB0* → *reload state from PCB1* → P1 kører, og omvendt. Mens OS’et skifter, er begge processer idle. Tiden er **pure overhead** — typisk få mikrosekunder — og afhænger af hukommelseshastighed, antal registre og hardwarestøtte som flere registersæt.',
            'Bogen viser også, hvordan man måler det: `vmstat 1 3` gav 24 context switches pr. sekund i snit siden boot og 225 og 339 i de to næste sekunder (bog 5.1.3, bogens s. 216).',
          ],
        },
      ],
      viz: 'process-states',
      keyPoints: [
        'Program = passiv fil; proces = program under udførelse med PC, registre og eget adresserum.',
        'Layout fra lav til høj adresse: text, initialized data, uninitialized data (BSS), heap ↑, stack ↓, argc/argv.',
        'Fem tilstande: new, ready, running, waiting, terminated. Waiting går altid via ready.',
        'CPU-bound pendler ready ↔ running; I/O-bound går ofte i waiting.',
        'PCB: state, PID, PC, registre, memory limits, åbne filer, scheduling- og accounting-info. I Linux `task_struct`.',
        'Ready queue og wait queue er linked lists af PCB’er.',
        'Context switch = gem tilstand i PCB0, hent fra PCB1. Ren overhead, “must be fast!”.',
      ],
      code: [
        {
          lang: 'c',
          title: 'Hvor havner variablerne? (slide 4)',
          source: '02.1-Process-Management.pdf s. 4',
          code: `#include <stdio.h>
#include <stdlib.h>

int x;
int y = 15;

int main(int argc, char *argv[])
{
    int *values;
    int i;

    values = (int *)malloc(sizeof(int)*5);

    for(i = 0; i < 5; i++)
        values[i] = i;

    return 0;
}`,
        },
        {
          lang: 'c',
          title: 'PCB’en i Linux: udsnit af task_struct',
          source: 'Silberschatz 3.1.3, bogens s. 117 (PNG 141)',
          code: `long state;                  /* state of the process */
struct sched_entity se;      /* scheduling information */
struct task_struct *parent;  /* this process's parent */
struct list_head children;   /* this process's children */
struct files_struct *files;  /* list of open files */
struct mm_struct *mm;        /* address space of this process */`,
        },
        {
          lang: 'bash',
          title: 'PID og PPID i procestræet',
          source: '02.1-Process-Management.pdf s. 9',
          code: `$ ps -f
UID PID PPID C STIME TTY TIME CMD
root 1 0 0 13:16 pts/0 00:00:00 bash
root 9 1 0 13:16 pts/0 00:00:00 ps -f

$ ps -Af | grep bash`,
        },
      ],
      exam: [
        'En proces er et program under udførelse: programmet er en passiv fil, processen har program counter, registre og sit eget adresserum med text, data, heap og stack. I slidets eksempel ligger `int y = 15` i initialized data, `int x` i BSS, de lokale variable på stakken og `malloc`-blokken på heapen.',
        'OS’et repræsenterer hver proces med en PCB — i Linux `task_struct` — med tilstand, PID, program counter, registre, memory limits og åbne filer. PCB’erne står i ready queue og wait queues som linkede lister.',
        'En proces går new → ready → running og derfra enten tilbage til ready ved et interrupt, til waiting ved I/O eller til terminated ved exit; fra waiting kommer den altid tilbage via ready. En CPU-bound proces pendler mellem ready og running, en I/O-bound proces er ofte i waiting.',
        'Ved et context switch gemmer OS’et den kørende proces’ tilstand i dens PCB og henter den næste fra dens PCB. Det er ren overhead — bogen siger få mikrosekunder — så det skal være hurtigt, og det er derfor tråde, der deler adresserum, er billigere at skifte mellem.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture02.1_ProcessManagement.md'), original: '02.1-Process-Management.pdf', pages: 's. 2–9' },
        { path: k('context/book/SW3SYS-01_Ch03_Processes.md'), original: BOG, pages: 'afsnit 3.1–3.2, bogens s. 112–120 (PNG 136–144)' },
        { path: k('context/book/SW3SYS-01_Ch04-05_Threads_Concurrency_CPU_Scheduling.md'), original: BOG, pages: 'afsnit 5.1.3, bogens s. 215–216 (PNG 239–240)', note: 'Dispatcher og vmstat-målingen af context switches' },
      ],
      gaps: [
        'Markdown-konverteringen af slide 6 siger, at PCB’en “også kaldes task_struct i Linux”. Det står ikke på slidet (kun “PCB”), men i bogen (3.1.3).',
        'Slide 6 tegner de samme tre PCB’er (PCB7, PCB2, PCB22) i både Ready Queue og Wait Queue. En proces står i én af dem ad gangen; figuren viser kun listestrukturen.',
        'Slide 8 siger, at konteksten “is kept in memory using special hardware”, uden at sige hvilken. Bogen nævner flere registersæt som hardwarestøtte (3.2.3).',
        'Bogens markdown-konvertering (Figur 3.1) skriver, at heapen “vokser NEDAD (mod højere adresser)” og stakken “OPAD (mod lavere adresser)”. Retningen i adresser er rigtig, men ordene er byttet om i forhold til slidets figur, hvor heap vokser op og stack ned.',
        'Slide 4 staver `argc, agrv` i figuren.',
        'Uden for materialet: at waiting-tilstanden hedder “sleeping” (`S`/`D`) i `ps`-output på Linux, nævnes hverken i slides eller bog.',
      ],
      keywords: ['proces', 'process', 'program in execution', 'PCB', 'process control block', 'task control block', 'task_struct', 'PID', 'PPID', 'text', 'data', 'BSS', 'heap', 'stack', 'argc', 'argv', 'activation record', 'new', 'ready', 'running', 'waiting', 'terminated', 'ready queue', 'wait queue', 'context switch', 'kontekstskift', 'CPU-bound', 'I/O-bound', 'multiprogramming', 'time sharing', 'degree of multiprogramming', 'ps -f'],
    },

    // ─────────────────────────────────────────────────────────────── fork-exec
    {
      slug: 'fork-exec',
      title: 'fork, exec og wait',
      week: 'Uge 2 · L2.1 og Uge 5 · L5.2',
      definition:
        '**`fork()`** duplikerer den kaldende proces: barnet får en ny PID og en kopi af forælderens adresserum, og begge fortsætter efter kaldet — `fork()` returnerer 0 i barnet, barnets PID i forælderen og −1 ved fejl. **`exec()`** erstatter procesimaget med et nyt program under samme PID, og **`wait()`/`waitpid()`** lader forælderen vente på barnets exit-status.',
      concepts: [
        {
          term: 'Procestræet',
          body: [
            'Processer danner et træ, hvor hver proces har en **PID** og en **PPID** (parent process ID). Slide 9 i 02.1: Power-on → Boot Linux → `Init` (pid 1) → `logind` (pid 5, ppid 1) → `bash` (pid 11, ppid 5), som har børnene `ps` (pid 12) og `nano` (pid 41), begge med ppid 11. Over SSH til en Raspberry Pi er der flere led — “try to find them” med `ps –Af | grep bash`.',
            'Bogens Figur 3.7 har `systemd` som pid 1 med børn som `logind` (8415), `python` (2808) og `sshd` (3028); `bash` (8416) under logind har `ps` (9298) og `vim` (9204). Boksen “The init and systemd processes” forklarer, at `systemd` har erstattet System V `init` i de fleste distributioner. Kommandoerne er `ps -el` og `pstree`.',
          ],
        },
        {
          term: 'fork(): duplikér processen',
          body: [
            '05.2 s. 15: den proces, der kalder `fork()`, er parent; barnet kører *concurrently* med den, og begge udfører “the next instruction following the fork() system call”. Barnet bruger samme program counter, samme CPU-registre og **samme åbne filer** som forælderen. Returværdien skiller dem ad: −1 ved fejl, 0 i barnet, barnets PID i forælderen.',
            '**Process memory isolation** (s. 18): barnet får en *kopi* af hukommelsen. Med `int x = 10;` før `fork()` lægger barnet 5 til og forælderen trækker 3 fra; outputtet er `In parent process, x = 7` og `In child process, x = 15`. Ændringer i den ene proces ses ikke i den anden.',
            'Flere `fork()` i træk fordobler antallet: “Total number of processes created = 2^N” (s. 17). Tre kald giver 8 processer, der alle printer `hello` — altså 7 børn plus originalen. Slidets træ nummererer dem: 1 forker 2, 4 og 8; 2 forker 3 og 6; 3 forker 5; 4 forker 7.',
          ],
        },
        {
          term: 'exec(): nyt program, samme PID',
          body: [
            'Slide 10 i 02.1: “Exec – Execute process in current context (same pid)”, “Fork – Duplicate context and run process in duplicated context”. Når bash kører `ls` i forgrunden: 1.0 bash (pid 7) kalder fork, 1.1 barnet får pid 11 (ppid 7), 1.2 bash venter på pid 11, 1.3 barnet kalder exec for at køre `ls` (stadig pid 11), 1.4 `ls` exits og joins, 1.5 bash fortsætter.',
            'Med `ls /run &` venter bash *ikke*: den printer `[1] 11` (“pid of forked proc”), outputtet blandes med prompten, og senere kommer `[1]+ Done ls`. Prøv `sleep 5 & ps -f` for at se barnet med bash som PPID.',
            'Bogen (3.3.1): `exec()` overlejrer adresserummet med et nyt program og “does not return control unless an error occurs”. Eksemplet bruger `execlp("/bin/ls", "ls", NULL)`. Barnet arver privilegier, scheduling-attributter og ressourcer som åbne filer fra forælderen.',
          ],
        },
        {
          term: 'wait() og waitpid()',
          body: [
            'Bogen: forælderen kalder `wait()` for at flytte sig selv ud af ready queue, til barnet terminerer; `pid = wait(&status);` returnerer barnets PID og giver exit-status. 05.2 s. 19 viser signaturen `pid_t waitpid(pid_t child_pid, int *status, int options)`: den blokerer, indtil det ønskede barn exits eller et signal modtages, og returnerer barnets PID eller −1.',
            'Parametrene (s. 19): `child_pid` er det barn, der ventes på (“If child_pid is 0, it will wait for any arbitrary child”); `status` giver adgang til exit-værdien (`NULL` ignorerer den); `options` er `WCONTINUED`, `WNOHANG` (status uden at blokere) og `WUNTRACED`. Exit-koden udtrækkes med `WEXITSTATUS(status)` fra `<sys/wait.h>`.',
            'Eksemplet på s. 21 kalder `fork()` to gange, så der er fire processer: parent, Child 1, Child 2 og Child 3 (barn af Child 1). Parent poller `waitpid(cpid2, &status, WNOHANG)` i en løkke, printer `waiting...` og slutter med `Parent: Child 2 (ID: 19959) terminated (exit code 2)`. Tidslinjen på s. 20 viser, at forælderen kun venter på det barn, den nævner.',
          ],
        },
        {
          term: 'Livscyklus: exit, SIGCHLD, zombie og orphan',
          body: [
            'Slide 11 er et sekvensdiagram: User → Bash `Run ls`; Bash → Kernel `fork()`; `Returns child PID`; `Exec ls`; Kernel `Allocates resources`; ls læser mappen og skriver til stdout; Bash viser output; ls → Kernel `Exit()`; Kernel → Bash `SIGCHLD (notify child exit)`; Bash → Kernel `waitpid()`; `Returns exit status`; `Return to prompt`.',
            'Bogen (3.3.2): en proces terminerer med `exit()` — kaldt direkte eller indirekte via C-runtime’en. Ressourcerne frigives, men dens indgang i procestabellen bliver, til forælderen kalder `wait()`, fordi tabellen rummer exit-status. En termineret proces, hvis forælder ikke har kaldt `wait()`, er en **zombie**; alle processer er det kortvarigt.',
            'Terminerer forælderen uden `wait()`, bliver børnene **orphans**. Traditionelt UNIX gør `init` til ny forælder, og `init` kalder periodisk `wait()`; Linux kan lade andre processer end `systemd` arve dem. Nogle systemer bruger **cascading termination**: dør forælderen, termineres børnene også.',
          ],
        },
        {
          term: 'fork i flertrådede programmer',
          body: [
            'Bogen 4.6.1: kalder én tråd `fork()`, er spørgsmålet, om den nye proces får alle tråde eller kun den kaldende. Nogle UNIX-systemer har to versioner af `fork()`. Kalder man `exec()` lige efter, er det nok at kopiere den kaldende tråd, for `exec()` erstatter hele processen — inklusive alle tråde. Se [[traade|tråde]].',
          ],
        },
      ],
      viz: 'fork-tree',
      keyPoints: [
        '`fork()` returnerer −1 ved fejl, 0 i barnet og barnets PID i forælderen.',
        'Begge processer fortsætter fra instruktionen efter `fork()`; rækkefølgen af output er ikke deterministisk.',
        'Barnet får en kopi af hukommelsen (x = 7 vs. x = 15), men deler åbne filer.',
        'N `fork()`-kald i træk giver 2^N processer — 2^N − 1 børn.',
        '`exec()` erstatter procesimaget, beholder PID og returnerer kun ved fejl.',
        '`waitpid(pid, &status, options)`; `WNOHANG` gør den ikke-blokerende; `WEXITSTATUS(status)` giver exit-koden.',
        'Zombie: termineret, forælder har ikke kaldt `wait()`. Orphan: forælderen er død; `init`/`systemd` adopterer.',
        'Shellen: fork → barnet exec’er → forælderen venter (forgrund) eller ikke (`&`).',
      ],
      code: [
        {
          lang: 'c',
          title: 'fork, exec og wait (bogens Figur 3.8)',
          source: 'Silberschatz Figur 3.8, bogens s. 124 (PNG 148)',
          code: `#include <sys/types.h>
#include <stdio.h>
#include <unistd.h>

int main()
{
pid_t pid;

   /* fork a child process */
   pid = fork();

   if (pid < 0) { /* error occurred */
      fprintf(stderr, "Fork Failed");
      return 1;
   }
   else if (pid == 0) { /* child process */
      execlp("/bin/ls","ls",NULL);
   }
   else { /* parent process */
      /* parent will wait for the child to complete */
      wait(NULL);
      printf("Child Complete");
   }

   return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Process memory isolation',
          source: '05.2-Week_5_-_POSIX_file_IO_and_process-related_system_calls.pdf s. 18',
          code: `#include <iostream>
#include <unistd.h>
#include <sys/types.h>

using namespace std;

int main(int argc, char*argv[]) {
    int x = 10;

    pid_t pid = fork();

    if(pid == -1) {
        return -1;
    }

    if(pid == 0) {
        x += 5;
        cout << "In child process, x = " << x << "\\n";
    }
    else {
        x -= 3;
        cout << "In parent process, x = " << x << "\\n";
    }

    return 0;
}
// Output:
// In parent process, x = 7
// In child process, x = 15`,
        },
        {
          lang: 'c',
          title: 'Hvor mange processer? 2^N',
          source: '05.2-Week_5_-_POSIX_file_IO_and_process-related_system_calls.pdf s. 17',
          code: `#include <stdio.h>
#include <sys/types.h>
#include <unistd.h>
int main()
{
    fork();
    fork();
    fork();
    printf("hello\\n");
    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Vent på et bestemt barn med waitpid og WNOHANG',
          source: '05.2-Week_5_-_POSIX_file_IO_and_process-related_system_calls.pdf s. 21',
          code: `int main() {
    pid_t cpid1 = fork();
    pid_t cpid2 = fork();

    if (cpid1 != 0 && cpid2 != 0) { // Parent process
        int status;
        int retVal = 0;
        cout << "Parent: Waiting for child 2 (ID: " << cpid2 << ")\\n";

        while (retVal == 0) { // Wait for child 2 to terminate
            retVal = waitpid(cpid2, &status, WNOHANG);
            cout << "waiting...\\n";
            sleep(0.1);
        }
        cout << "Parent: Child 2 (ID: " << retVal <<
                ") terminated (exit code " << WEXITSTATUS(status) << ")\\n";
        exit(1);
    }
    else if (cpid1 == 0 && cpid2 != 0) { // Child 1 process
        cout << "Child 1: my ID = " << getpid() << ") and exit code = 1\\n";
        exit(1);
    }
    else if (cpid1 != 0 && cpid2 == 0) { // Child 2 process
        cout << "Child 2: my ID = " << getpid() << ") and exit code = 2\\n";
        exit(2);
    }
    else { // Child 3 process
        cout << "Child 3: my ID = " << getpid() << ") and exit code = 3\\n";
        exit(3);
    }

    return 0;
}`,
        },
      ],
      exam: [
        '`fork()` duplikerer den kaldende proces: barnet får ny PID og en kopi af adresserummet, og begge fortsætter efter kaldet. Returværdien skiller dem ad — 0 i barnet, barnets PID i forælderen, −1 ved fejl.',
        'Kursets eksempel viser isolationen: `x = 10` før `fork()`, barnet lægger 5 til og får 15, forælderen trækker 3 fra og får 7. Tre `fork()` i træk giver 2³ = 8 processer, fordi børnene også udfører de efterfølgende kald.',
        'Sådan kører shellen `ls`: bash forker, barnet kalder `exec` og bliver til `ls` med samme PID, og bash venter med `waitpid()`. Når `ls` kalder `exit()`, sender kernen `SIGCHLD`, og bash henter exit-status. Med `&` venter bash ikke.',
        'Faldgruben er at glemme `wait()`: så bliver det døde barn en zombie med en indgang i procestabellen. Dør forælderen først, bliver barnet orphan og adopteres af `init`/`systemd`. `WNOHANG` gør `waitpid()` ikke-blokerende, så forælderen kan polle, som i kursets eksempel.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture02.1_ProcessManagement.md'), original: '02.1-Process-Management.pdf', pages: 's. 9–11' },
        { path: k('context/slides/SW3SYS-01_Lecture05_2_POSIX_File_IO_and_Processes.md'), original: '05.2-Week_5_-_POSIX_file_IO_and_process-related_system_calls.pdf', pages: 's. 15–21, 24' },
        { path: k('context/book/SW3SYS-01_Ch03_Processes.md'), original: BOG, pages: 'afsnit 3.3, bogens s. 121–129 (PNG 145–153)' },
        { path: k('context/book/SW3SYS-01_Ch04-05_Threads_Concurrency_CPU_Scheduling.md'), original: BOG, pages: 'afsnit 4.6.1, bogens s. 196 (PNG 220)', note: 'fork() og exec() i flertrådede programmer — ikke med i markdown-konverteringen' },
      ],
      gaps: [
        'Exec-familien (`execl`, `execv`, `execvp`, `execve` …) gennemgås ikke. Slides siger kun “exec”; bogen viser kun `execlp`. Kursets kode (lecture-code-main) har ingen proceseksempler.',
        '05.2 s. 16: i barnet (`pid == 0`) printer koden `"Parent Process id : " << getpid()`. Det er barnets egen PID, der kaldes “Parent Process id”; outputtet (54195 vs. parent id 54194) bekræfter det.',
        '05.2 s. 19 siger om `WNOHANG`: “If status information is not available, waitpid() returns an error.” Men eksemplet på s. 21 looper netop på `retVal == 0`. Uden for materialet: POSIX returnerer 0, ikke −1, når intet barn har skiftet status.',
        '05.2 s. 19: “If child_pid is 0, it will wait for any arbitrary child”. Uden for materialet: ifølge POSIX betyder 0 et vilkårligt barn i samme procesgruppe; −1 betyder et vilkårligt barn.',
        '05.2 s. 21 kalder `sleep(0.1)`. Uden for materialet: `sleep()` tager `unsigned int`, så 0.1 afrundes til 0, og løkken poller uden pause (derfor de mange `waiting...`).',
        '05.2 s. 17 har titlen “how many child processes are created?”, men boksen siger “Total number of processes created = 2^N”. Svaret på titlen er 2^N − 1 børn; 2^N er det samlede antal inklusive originalen.',
        '02.1 s. 11 tegner `Exec ls` som et kald fra *Bash Shell*, og output som noget kernen “passes” til bash, der viser det. Bogen og s. 10 lader barnet kalde exec. Uden for materialet: `ls` skriver direkte til terminalen via den arvede stdout; shellen videresender ikke output.',
        'Markdown-konverteringen af 05.2 har tilføjet danske kommentarer i koden; originalen har dem ikke. Koden ovenfor følger originalen.',
      ],
      keywords: ['fork', 'exec', 'execlp', 'wait', 'waitpid', 'WNOHANG', 'WUNTRACED', 'WCONTINUED', 'WEXITSTATUS', 'exit', 'getpid', 'getppid', 'pid_t', 'PID', 'PPID', 'child process', 'parent process', 'procestræ', 'process tree', 'init', 'systemd', 'pstree', 'SIGCHLD', 'zombie', 'orphan', 'cascading termination', 'memory isolation', '2^N', 'CreateProcess', 'baggrundsproces', '&'],
    },

    // ─────────────────────────────────────────────────────────────── ipc
    {
      slug: 'ipc',
      title: 'Interprocess communication',
      short: 'IPC',
      week: 'Uge 2 · L2.1',
      definition:
        'Processer deler som udgangspunkt ikke hukommelse. **Interprocess communication (IPC)** lader kooperative processer udveksle data på to måder: **shared memory**, hvor de mapper samme hukommelsesområde ind (POSIX `shm_open`, `ftruncate`, `mmap`), og **message passing**, hvor kernen formidler beskeder — i UNIX fx ordinary pipes (`pipe()`) og named pipes (`mkfifo`).',
      concepts: [
        {
          term: 'Hvorfor processer samarbejder',
          body: [
            'Slide 12: “Process is independent and does not share its memory by default”, men den kan være *cooperative* og dele data for **information sharing**, **speedup** eller **modularity**. Bogen (3.4) definerer en *independent* proces som én, der ikke kan påvirke eller påvirkes af andre, og en *cooperating* som én, der kan.',
            'Eksemplerne i bogen: copy-paste mellem programmer (information sharing), opdeling i delopgaver på flere kerner (computation speedup) og opdeling af systemfunktioner i separate processer eller tråde (modularity).',
          ],
        },
        {
          term: 'Shared memory vs. message passing',
          body: [
            'Bogens Figur 3.11 (gentaget på slide 12): (a) process A og B deler et *shared memory*-område over kernen; (b) de sender beskeder `m0, m1, m2, m3, …, mn` gennem en *message queue* i kernen.',
            'Slide 13 om **shared memory**: programmøren skal selv allokere (og lokalisere) hukommelsen; den kan give tovejskommunikation og høj båndbredde mellem to lokale processer; “Synchronization is needed!”. Om **message passing**: ingen delt hukommelse; kan køre distribueret over netværk eller lokalt; direkte symmetrisk (one↔one) eller asymmetrisk (one↔many); indirekte via mailboxes “like mkfifo”.',
            'Bogen tilføjer afvejningen: message passing er nemmere til små datamængder og distribuerede systemer, men hver besked er et system call. Shared memory er hurtigere, fordi der kun kræves system calls til at oprette området — bagefter er adgang almindelig hukommelsesadgang uden kernen. Mange OS’er har begge.',
          ],
        },
        {
          term: 'Producer-consumer med bounded buffer',
          body: [
            'Bogens paradigme for shared memory (3.5): en producer (fx compiler → assembler, webserver → browser) og en consumer deler en buffer. Den kan være *unbounded* eller *bounded*. Den bounded buffer er et cirkulært array `buffer[BUFFER_SIZE]` med `in` (næste ledige plads) og `out` (første fulde).',
            'Tom: `in == out`. Fuld: `((in + 1) % BUFFER_SIZE) == out`. Derfor kan den højst rumme `BUFFER_SIZE − 1` elementer. Producer og consumer busy-waiter (`; /* do nothing */`), og bogen understreger, at eksemplet ikke løser samtidig adgang — det gør kap. 6–7, se [[bounded-buffer|bounded buffer]] og [[kritisk-sektion|kritisk sektion]].',
          ],
        },
        {
          term: 'Message passing: naming, synkronisering, buffering',
          body: [
            'To operationer: `send(message)` og `receive(message)`, med fast eller variabel beskedstørrelse (3.6). **Direct communication**: symmetrisk `send(P, message)`/`receive(Q, message)`, eller asymmetrisk, hvor `receive(id, message)` modtager fra hvem som helst. Linket oprettes automatisk mellem præcis to processer; ulempen er hard-coding af identiteter.',
            '**Indirect communication** går via mailboxes eller ports: `send(A, message)`/`receive(A, message)`. Et link kan have mere end to processer, og deler P1, P2 og P3 mailbox A, skal systemet vælge modtager (fx round robin). En mailbox kan ejes af processen (forsvinder med den) eller af OS’et.',
            'Send og receive kan være **blocking** (synkron) eller **nonblocking** (asynkron); er begge blocking, er det et **rendezvous**. Køen har **zero capacity** (ingen buffering, afsender blokerer altid), **bounded capacity** (blokerer når fuld) eller **unbounded capacity** (blokerer aldrig). Message passing udbygges i [[message-passing|message passing]].',
          ],
        },
        {
          term: 'POSIX shared memory',
          body: [
            'Slide 14 nævner tre kald: `shm_open()`, `mmap()`, `shm_unlink()`. Bogen (3.7.1) viser hele forløbet: `fd = shm_open(name, O_CREAT | O_RDWR, 0666);` opretter et navngivet objekt og returnerer en file descriptor; `ftruncate(fd, 4096);` sætter størrelsen; `mmap(0, SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0)` mapper det ind, og `MAP_SHARED` gør ændringer synlige for alle, der mapper objektet.',
            'I bogens Figur 3.16–3.17 skriver produceren `"Hello"` og `"World!"` ind i objektet `"OS"` med `sprintf` og flytter pointeren med `strlen`. Consumeren åbner med `O_RDONLY`, mapper, printer og kalder `shm_unlink(name)` for at fjerne objektet. Memory-mapping som I/O-teknik kommer igen i [[mmap-io|mmap og I/O]].',
          ],
        },
        {
          term: 'Pipes: ordinary og named',
          body: [
            'Slide 14 kalder pipes “Posix Pipes (message queue)”. **Ordinary pipe**: envejs, “life line follows process”, oprettes med `pipe()` og tilgås med file operations. **Named pipe**: “Bi-directional”, eksisterer til den slettes, oprettes med `mkfifo` og tilgås med file operations.',
            'Bogen (3.7.4) stiller fire designspørgsmål: uni- eller bidirektionel, half- eller full-duplex, kræves parent-child, og kan den bruges over netværk? `pipe(int fd[])` giver `fd[0]` = read end og `fd[1]` = write end. En ordinary pipe kan ikke tilgås uden for processen, der oprettede den; typisk opretter forælderen den, forker, og hver side lukker den ende, den ikke bruger.',
            'UNIX named pipes (FIFOs) oprettes med `mkfifo()`, bruges med `open()`, `read()`, `write()`, `close()`, overlever processerne og kræver ikke parent-child. Men de er kun **half-duplex** og kræver processer på samme maskine; Windows named pipes er full-duplex og kan krydse maskiner.',
            'I shellen: `echo abc | less` laver en ordinary pipe — `echo` skriver til pipen (“virtual file”), `less` læser. Slide 12 viser en FIFO: `mkfifo myfifo`, `cat myfifo &` venter på I/O i den forkede proces (`[1] 22`), og `echo 123 > myfifo` får `cat` til at printe `123`.',
          ],
        },
      ],
      viz: 'ipc-models',
      keyPoints: [
        'Processer deler ikke hukommelse som default; IPC kræves for at samarbejde.',
        'Shared memory: hurtig, tovejs, kun system calls ved oprettelse — men kræver synkronisering.',
        'Message passing: ingen delt hukommelse, virker distribueret, men et system call pr. besked.',
        'POSIX shared memory: `shm_open` → `ftruncate` → `mmap(..., MAP_SHARED, ...)` → `shm_unlink`.',
        'Ordinary pipe: envejs, `fd[0]` læser, `fd[1]` skriver, lever med processen, kræver parent-child.',
        'Named pipe (FIFO): `mkfifo`, lever i filsystemet til den slettes, ingen parent-child.',
        'Bounded buffer med `in`/`out` holder højst `BUFFER_SIZE − 1` elementer.',
        'Blocking send + blocking receive = rendezvous.',
      ],
      code: [
        {
          lang: 'bash',
          title: 'Named pipe og ordinary pipe i shellen',
          source: '02.1-Process-Management.pdf s. 12 og 14',
          code: `$ mkfifo myfifo
$ cat myfifo &
[1] 22          (awaits IO in forked process)
$ echo 123 > myfifo
$ 123
[1]+ Done       cat myfifo
$

$ echo abc | less
abc
(END)`,
        },
        {
          lang: 'c',
          title: 'POSIX shared memory: producer',
          source: 'Silberschatz Figur 3.16, bogens s. 139 (PNG 163)',
          code: `int main()
{
/* the size (in bytes) of shared memory object */
const int SIZE = 4096;
/* name of the shared memory object */
const char *name = "OS";
/* strings written to shared memory */
const char *message_0 = "Hello";
const char *message_1 = "World!";

/* shared memory file descriptor */
int fd;
/* pointer to shared memory obect */
char *ptr;

   /* create the shared memory object */
   fd = shm_open(name,O_CREAT | O_RDWR,0666);

   /* configure the size of the shared memory object */
   ftruncate(fd, SIZE);

   /* memory map the shared memory object */
   ptr = (char *)
     mmap(0, SIZE, PROT_READ | PROT_WRITE, MAP_SHARED, fd, 0);

   /* write to the shared memory object */
   sprintf(ptr,"%s",message_0);
   ptr += strlen(message_0);
   sprintf(ptr,"%s",message_1);
   ptr += strlen(message_1);

   return 0;
}`,
        },
        {
          lang: 'c',
          title: 'Ordinary pipe mellem parent og child',
          source: 'Silberschatz Figur 3.21–3.22, bogens s. 147–148 (PNG 171–172)',
          code: `int main(void)
{
char write_msg[BUFFER_SIZE] = "Greetings";
char read_msg[BUFFER_SIZE];
int fd[2];
pid_t pid;

   /* create the pipe */
   if (pipe(fd) == -1) {
      fprintf(stderr,"Pipe failed");
      return 1;
   }

   /* fork a child process */
   pid = fork();

   if (pid < 0) { /* error occurred */
      fprintf(stderr, "Fork Failed");
      return 1;
   }

   if (pid > 0) { /* parent process */
      /* close the unused end of the pipe */
      close(fd[READ_END]);

      /* write to the pipe */
      write(fd[WRITE_END], write_msg, strlen(write_msg)+1);

      /* close the write end of the pipe */
      close(fd[WRITE_END]);
   }
   else { /* child process */
      /* close the unused end of the pipe */
      close(fd[WRITE_END]);

      /* read from the pipe */
      read(fd[READ_END], read_msg, BUFFER_SIZE);
      printf("read %s",read_msg);

      /* close the read end of the pipe */
      close(fd[READ_END]);
   }

   return 0;
}`,
        },
      ],
      exam: [
        'Processer er isolerede, så samarbejde kræver IPC. Der er to modeller: shared memory, hvor processerne mapper samme område ind og bagefter læser og skriver uden kernen, og message passing, hvor kernen formidler hver besked.',
        'Shared memory er hurtigst, fordi kun oprettelsen er system calls, men slidet siger det tydeligt: “Synchronization is needed!”. Message passing er langsommere, men kræver ingen delt hukommelse og kan køre over netværk.',
        'I POSIX opretter man et shared memory-objekt med `shm_open`, sætter størrelsen med `ftruncate`, mapper det med `mmap` og `MAP_SHARED` og fjerner det med `shm_unlink` — som i bogens producer, der skriver “Hello World!” til objektet “OS”.',
        'En ordinary pipe fra `pipe()` er envejs med `fd[0]` til læsning og `fd[1]` til skrivning og deles typisk ved at forælderen forker; begge lukker den ende, de ikke bruger, ellers får læseren aldrig EOF. En named pipe fra `mkfifo` lever i filsystemet og kræver ikke parent-child, men er i UNIX kun half-duplex.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture02.1_ProcessManagement.md'), original: '02.1-Process-Management.pdf', pages: 's. 12–14' },
        { path: k('context/book/SW3SYS-01_Ch03_Processes.md'), original: BOG, pages: 'afsnit 3.4–3.7.1 og 3.7.4, bogens s. 129–151 (PNG 153–175)' },
      ],
      gaps: [
        'Slide 14 kalder named pipes “Bi-directional” uden forbehold. Bogen (3.7.4.2) præciserer, at UNIX-FIFOs kun er half-duplex — tovejs kræver typisk to FIFOs — og kun virker på samme maskine.',
        'Slide 13: “Mailbox can be owned by os (fork) or process (exec)”. Hverken slidet eller bogen forklarer koblingen mellem ejerskab og `fork`/`exec`. Bogen (3.6.1) definerer process-owned mailboxes (forsvinder med processen) og OS-owned (uafhængige af processer) uden at nævne fork/exec.',
        'Slide 14 kalder pipes “message queue”. Bogen bruger ordet om beskedkøen i message passing generelt; POSIX message queues (`mq_open`) nævnes ikke i dette materiale.',
        'Bogens producer skriver “obect” i en kodekommentar (Figur 3.16); koden er gengivet ordret.',
        'Hverken slides eller bogudsnittet viser synkroniseringen af POSIX shared memory (fx en semafor i området). Bogen henviser til kap. 6–7.',
        'Sockets, RPC og Mach/Windows ALPC (3.7.2–3.8) er i bogens PNG-udsnit, men ikke med i markdown-konverteringens afsnitsliste og ikke nævnt på slides.',
      ],
      keywords: ['IPC', 'interprocess communication', 'shared memory', 'message passing', 'cooperating process', 'independent process', 'shm_open', 'ftruncate', 'mmap', 'MAP_SHARED', 'shm_unlink', 'pipe', 'ordinary pipe', 'anonymous pipe', 'named pipe', 'FIFO', 'mkfifo', 'half-duplex', 'full-duplex', 'mailbox', 'port', 'direct communication', 'indirect communication', 'rendezvous', 'blocking', 'nonblocking', 'zero capacity', 'bounded buffer', 'producer-consumer', 'fd[0]', 'fd[1]'],
    },

    // ─────────────────────────────────────────────────────────────── higher-order
    {
      slug: 'higher-order',
      title: 'Higher-order programming i C++',
      short: 'Higher-order programming',
      week: 'Uge 3 · L3.1',
      definition:
        'En **higher-order function** tager funktioner som input (eller returnerer dem), ikke kun data. I C++ bygges det med function pointers, `std::function`, functors og **lambdas** — `[capture clause] (parameter list) -> return type { body }` — hvor capture clause bestemmer, om lokale variable kopieres eller refereres ind i den **closure**, lambdaen bliver til.',
      concepts: [
        {
          term: 'First-order og higher-order',
          body: [
            'Begrebet kommer fra logikken (s. 4): first-order predicate logic kvantificerer over individer (“for all x, if x is a man, then x is mortal”), og first-order funktioner bruger kun data som input. Higher-order logic kvantificerer over prædikater (“For all predicates P, if P holds for all mortals, then P holds for Socrates”), og higher-order funktioner tager data *og* funktioner.',
            'Kursets eksempel (s. 5): `square(int x)` er first-order; `map(function<int(int)> the_func, vector<int>& numbers)` er second-order og anvender `the_func` på hvert tal. `metaApply` (s. 6) er third-order: den tager en second-order-funktion, en first-order-funktion og data og kalder `secondOrderFunc(firstOrderFunc, numbers)`. Grafikken på s. 7: `numbers` → `square` → result, over for `numbers` + `square` → `map` → result.',
          ],
        },
        {
          term: 'Function pointers',
          body: [
            'En function pointer er “basically a pointer to a function” (s. 8). Slidet genopfrisker data pointers: `int *ptr = &arr[0];` peger på 0x80000000, og `ptr++` rykker 4 bytes til 0x80000004, så `*ptr` er 20. En function pointer peger i stedet på funktionens første maskininstruktion (`push rbp`, `mov rbp, rsp` …).',
            'Syntaksen er `int(*ptr)(int) = &square;` og kaldet `ptr(10)` giver 100. Som parameter findes to stilarter (s. 11): C++ med `const function<int(int, int)> the_func` og plain C med `int(*the_func)(int, int)` — “you’ll see this a lot in the Linux kernel”. `arith(add, 10, 15)` giver 25 og `arith_c(add, 15, 25)` giver 40. Slide 13 anbefaler `const` på funktionsparameteren, så funktionen ikke kan ændres.',
          ],
        },
        {
          term: 'Functors (function objects)',
          body: [
            'En functor er en klasse med `operator()`, så objektet kan kaldes som en funktion; det “wraps functions, enabling inheritance a.o.” (s. 12). Kurset definerer interfacet `IArith` med `virtual int operator()(int a, int b) const = 0;`, implementerer `Adder`, og `do_arith(const IArith& arith_func, int a, int b)` kalder enhver implementering: `do_arith(add, 10, 15)` giver 25.',
            'Slide 14 kobler de to: “In C++ Lambdas basically prettyfies instantiation of ‘function’ objects”. En lambda er altså en kortere måde at skrive et funktionsobjekt på — med de fangede variable som objektets tilstand.',
          ],
        },
        {
          term: 'Lambdas og capture clause',
          body: [
            'Lambda calculus fra 1930’erne er modellen: lambdafunktioner er anonyme, understøtter first-class functions og giver closure til at gemme kontekst (s. 14). Syntaksen har fire dele (s. 15): **capture clause** (lokale variable, kan være tom), **parameter list** (kan være tom), **return type** (normalt `auto`) og **body**.',
            'Reglerne (s. 16): værdier kan kun captures fra lokalt scope, de kopieres ind, de captures *når lambdaen evalueres* (oprettes), og de er `const`. By value: `[x, y] ( ) { return x + y; }()` giver 11 — det sidste `()` kalder lambdaen med det samme. By reference: `[x, &y] ( ) { y = x + 1; }` sætter det ydre `y` til 1; “Reference must be valid for lifetime of Closure” (s. 18).',
            '`mutable` (s. 19) gør kopien ændrbar: `[x] ( ) mutable { return ++x + 1; }` giver `res: 2`, men det ydre `x` er stadig 0. Defaults (s. 20): `[=]` fanger alt by value, `[&]` alt by reference — `[&](){ x = x+2 ; y = y+4; }()` giver `x: 3 y: 14`.',
            'Specials (s. 21): `[VarA = x, VarB = 31, &VarC = y]` omdøber, initialiserer nye variable og blander value og reference (`y` bliver 32); `[a=std::move(s)]` flytter en streng ind. `[*this]` (s. 22) fanger en kopi af hele objektet, så `this->a` giver 23.',
          ],
        },
        {
          term: 'Parametre, lambdas i HO-funktioner og lambda factory',
          body: [
            'Parametre kan have typer og defaults (s. 23): `[](const std::string &data, uint max = 5) { return data.substr(0, max); }` på `"abefkgjaljgsda"` giver `abefk`. Generiske lambdas bruger `auto`: `[ ] (auto a, auto b) { return a + b; }`.',
            'Lambdaens parametre skal matche HO-funktionens prototype (s. 24): `arith` forventer `int(int, int)`, og `arith([](auto a, auto b){ return a * b; }, 5, 10)` giver 50.',
            '**Lambda factory** (s. 26): en lambda, der kaldes med det samme, kan initialisere en `constexpr`-værdi: med `constexpr int mode = 2;` vælger `switch` i lambdaen `20`. Slidet kalder det en implementering af Factory Pattern.',
          ],
        },
        {
          term: 'Closure',
          body: [
            '“A closure is a function object” (s. 25): den fanger variable fra sit omgivende scope og beholder dem, selv efter scopet er afsluttet — “(also refs, which may be invalid by then!!)” — og husker sit miljø fra oprettelsen. `make_adder = [](int x) { return [=](int y) { return x + y; }; };` giver `add5 = make_adder(5)`, og `add5(3)` er 8.',
            'Faldgruben er at fange by reference i en closure, der lever længere end variablen. Det samme gælder, når en lambda gives til en tråd: i kursets trådeksempel fanger `runner` med `[&]`, og det er kun sikkert, fordi `main` joiner, før `sum` og `upper` forsvinder — se [[traade|tråde]].',
          ],
        },
        {
          term: 'Funktionel programmering i C++',
          body: [
            'Slide 27 sammenligner med shell-pipes: `ls -1 | grep \'cpp\' | less` deler problemet i trin og sender data videre. FP er det samme: funktioner kalder funktioner, “Functions are state-less and data immutable, which makes FP less error-prone” og nemmere at sammensætte. C++ er mest imperativt, men understøtter FP (`squared_numbers = map(square, numbers);`); OCaml og F# gør det renere (`squaredNumbers = map square numbers`).',
            'Tabellen på s. 30: **map** = `std::transform`, **filter** = `std::copy_if`, **reduce** = `std::accumulate`, **zip** (custom), **compose** og **currying** (lambda), **forall** = `std::all_of`, **exists** = `std::any_of`. Eksemplerne: `transform` af {1, 2, 3} giver `1 4 9`; `copy_if` med `back_inserter` beholder `2 4`; `accumulate(…, 0)` over {1, 2, 3, 4} giver 10; `composed(7)` = `times2(add1(7))` = 16; `add5(3)` = 8; `all_of`/`any_of` giver `1 0`.',
            'Imperativ vs. funktionel (s. 28): løkken over 1–10, der summerer lige tal gange 10, giver 300; Python-versionen er `sum(map(lambda a: a * 10, filter(lambda n: n % 2 == 0, range(1, 11))))`. Kursets kode har også en F#-version med `|>`.',
          ],
        },
      ],
      viz: 'lambda-capture',
      keyPoints: [
        'First-order: kun data ind. Higher-order: data og funktioner ind (eller funktioner ud).',
        'C-function pointer: `int(*ptr)(int) = &square;`. C++: `std::function<int(int,int)>`, gerne `const`.',
        'Functor = klasse med `operator()`; en lambda er en kortform for et funktionsobjekt (s. 14).',
        'Lambda: `[capture](params) -> ret { body }`; et ekstra `()` kalder den med det samme.',
        'Captures kopieres, når lambdaen oprettes, og er `const`; `mutable` ændrer kun kopien.',
        '`[=]` alt by value, `[&]` alt by reference; referencer skal leve lige så længe som closuren.',
        'Closure = funktionsobjekt med sit fangede miljø (`make_adder(5)(3)` = 8).',
        'map/filter/reduce = `std::transform`/`std::copy_if`/`std::accumulate`; forall/exists = `all_of`/`any_of`.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Function pointers som parametre: C++ og C',
          source: 'lecture-code-main/week_3_higher_order_functions/higher_order_functions_code.cpp',
          code: `int square(int x) { return x * x; }

void pointer_function()
{
    int(*ptr)(int) = &square; // C-style function pointer
    cout << "value: " << ptr(10) << endl; // "value: 100"
}

int arith(function<int(int, int)> the_func, int a, int b)
{
  return the_func(a, b);
}

// Plain-C, you'll see this a lot in the Linux kernel
int arith_c(int(*the_func)(int, int), int a, int b)
{
  return the_func(a, b);
}

int add(int a, int b){return a+b;}

void pointer_functions_as_parameters()
{
    int res = arith(add, 10, 15);
    int res_c = arith_c(add, 15, 25);
    cout << "cpp: " << res << " C: " << res_c << endl;
}`,
        },
        {
          lang: 'cpp',
          title: 'Capture by value, by reference, mutable og defaults',
          source: 'lecture-code-main/week_3_higher_order_functions/higher_order_functions_code.cpp',
          code: `void lambda_capture_mutable() {
    int x = 0, y = 10;
    auto lambdaA = [x] ( ) mutable { return ++x + 1; }; // x is mutable within lambda
    int res = lambdaA();
    cout << "res: " << res << " x: " << x << endl; // res: 2 x: 0
  }

void lambda_capture_by_reference() {
int x = 0, y = 10;
auto lambdaB = [x, &y] ( ) { y = x + 1; };
lambdaB();
cout << "x: " << x << " y: " << y << endl; // x: 0 y: 1
}

void lambda_capture_by_value() {
    int x = 1, y = 10;
    // Immidiate use of lambda, last '()' is to evaluate it
    cout << "res: " << [x, y] ( ) { return x + y; }() << endl; // res: 11
}

void lambda_capture_default() {
    int x = 1, y = 10;
    // Capture all variables by value - '='
    cout << "res: " << [=] ( ) { return x + y; }() << endl; // res: 11
    // Capture all variables by reference - '&'
    [&](){ x = x+2 ; y = y+4; }();
    cout << "x: " << x << " y: " << y << endl; // x: 3 y: 14
}`,
        },
        {
          lang: 'cpp',
          title: 'Closure: make_adder',
          source: '03.1-SW3SYS-Higher-Order-Programming.pdf s. 25',
          code: `auto make_adder = [](int x) {
    return [=](int y) { return x + y; }; // capture x by value
};

auto add5 = make_adder(5); // add5 is a closure
std::cout << add5(3);      // Evaluate closure: 8`,
        },
        {
          lang: 'cpp',
          title: 'Compose og currying med lambdas',
          source: 'lecture-code-main/week_3_higher_order_functions/higher_order_functions_code.cpp',
          code: `void fp_compose()
{
    auto add1 = [](int x) { return x + 1; };
    auto times2 = [](int x) { return x * 2; };
    // [=] to capture 'times2' and 'add1'
    auto composed = [=](int x) { return times2(add1(x)); };
    std::cout << composed(7) << endl; // Output: 16
}

void fp_currying()
{
    auto add = [](int x, int y) { return x + y; };
    auto add5 = [=](int y) { return add(5, y); }; // '=' for access to add

    std::cout << add5(3) << endl; // Output: 8
}`,
        },
      ],
      exam: [
        'En higher-order funktion tager funktioner som parametre eller returnerer dem; kursets `map` tager `square` og en vektor og anvender funktionen på hvert element. I C gøres det med function pointers som `int(*the_func)(int, int)`, som man ser overalt i Linux-kernen; i C++ med `std::function`.',
        'En lambda består af capture clause, parameterliste, returtype og body. Captures kopieres ind, når lambdaen oprettes, og er `const` — med `[x, &y]` kopieres `x`, mens `y` refereres, så lambdaen kan ændre det ydre `y`. `mutable` tillader ændring af kopien, men i kursets eksempel er det ydre `x` stadig 0.',
        'En lambda er ifølge slidet en kortform for et funktionsobjekt — en klasse med `operator()` — og den fangede tilstand gør den til en closure. `make_adder(5)` returnerer en closure, der husker `x = 5`, så `add5(3)` giver 8.',
        'Faldgruben er referencer: en closure kan overleve de variable, den har fanget by reference, og så peger den på noget ugyldigt — slidet skriver selv “may be invalid by then!!”. Det er vigtigt i systemprogrammering, fordi lambdas gives til tråde, som kan leve længere end det scope, der oprettede dem.',
        'C++ har de klassiske FP-funktioner i standardbiblioteket: `std::transform` er map, `std::copy_if` filter, `std::accumulate` reduce, `std::all_of`/`any_of` forall/exists, mens compose og currying laves med lambdas.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture0.3.1_HigherOrderProgramming.md'), original: '03.1-SW3SYS-Higher-Order-Programming.pdf', pages: 's. 2–36' },
        { path: k('context/kode/SW3SYS-01_Code_week_3_higher_order_functions.md'), note: 'Konvertering af lecture-code-main/week_3_higher_order_functions/higher_order_functions_code.cpp' },
      ],
      gaps: [
        'Bogen (Silberschatz) dækker ikke higher-order programming i C++. Den nævner kun lambdas i Java i boksen “Lambda expressions in Java” (bogens s. 182, PNG 206). Slides og kode er eneste kilder.',
        'Kursets kode siger `// 300` som resultat af `lambda_parameter_ho()`; slide 24 siger `// 50`. 5 × 10 = 50 — kommentaren i koden er kopieret fra `functional_imperative_example`.',
        'Slide 3 foreslår `int main (int argv, char[] argc)`. Det kompilerer ikke (`char[]` er ikke en gyldig parametersyntaks her), og navnene `argc`/`argv` er byttet om.',
        'Slide 9: adresserne 0x80000000, 0x80000004, 0x80000008, 0x8000000A. Den fjerde int ligger på 0x8000000C (4 bytes efter 0x80000008); samme adresser er genbrugt på s. 10 for instruktionerne i `square`.',
        'Markdown-konverteringen af 03.1 tilføjer påstande, der ikke står i PDF’en, fx at “Functors er det C++ lambdas kompileres til internt”. Slide 14 siger kun, at lambdas “prettyfies instantiation of ‘function’ objects”.',
        'Slide 16 siger “Values are captured when lambda is evaluated”. Det betyder, når lambda-*udtrykket* evalueres (closuren oprettes), ikke når lambdaen kaldes; markdown-konverteringen præciserer det, slidet ikke.',
        'Slide 26 kalder IILE til `constexpr`-initialisering for “Factory Pattern”. Det er ikke GoF’s Factory Method eller Abstract Factory, som SWD bruger begrebet.',
        'Tabellen på s. 30 lister `zip` som “(Custom)” uden eksempel; der er ingen kode for zip i slides eller kode.',
        'Uden for materialet: `[*this]` og init-captures med `std::move` kræver C++17 hhv. C++14, og `constexpr`-lambdas C++17. Slides nævner ikke, hvilken standard der kræves.',
      ],
      keywords: ['higher-order function', 'first-order', 'second-order', 'third-order', 'metaApply', 'map', 'function pointer', 'funktionspointer', 'std::function', 'functor', 'function object', 'operator()', 'IArith', 'lambda', 'lambda calculus', 'capture clause', 'capture by value', 'capture by reference', '[=]', '[&]', 'mutable', '[*this]', 'init capture', 'std::move', 'IILE', 'immediately invoked', 'lambda factory', 'constexpr', 'closure', 'make_adder', 'std::transform', 'std::copy_if', 'std::accumulate', 'std::all_of', 'std::any_of', 'compose', 'currying', 'funktionel programmering'],
    },

    // ─────────────────────────────────────────────────────────────── traade
    {
      slug: 'traade',
      title: 'Tråde, multicore og std::thread',
      short: 'Tråde og std::thread',
      week: 'Uge 3 · L3.2a',
      definition:
        'En **tråd** er den grundlæggende enhed for CPU-udnyttelse: thread ID, program counter, registre og stak. Tråde i samme proces deler code, data og åbne filer, så de er “light-weight processes”. I C++ oprettes de med `std::thread` og samles med `join()` (fork-join); på multicore kan de køre reelt parallelt, begrænset af Amdahl’s lov.',
      concepts: [
        {
          term: 'Tråde vs. processer',
          body: [
            'Slide 3 (bogens Figur 4.1): en single-threaded proces har ét sæt code, data, files, registers, PC og stack; en multithreaded proces deler code, data og files, men hver tråd har sine egne registers, stack og PC. “Threads are light-weight processes that share memory (except stack), and thus are more memory and CPU efficient.”',
            'Bogen (4.1.2) opregner fire fordele: **responsiveness** (en del kan blokere, mens resten kører — vigtigt for UI), **resource sharing** (tråde deler hukommelse uden IPC, se [[ipc|IPC]]), **economy** (oprettelse og context switch er billigere end for processer) og **scalability** (tråde kan køre parallelt på flere kerner).',
            'Motivationen på slide 2 er Spotify: samtidig *Play audio!!!*, *Load and buffer audio stream (background)*, *Update equalizer*, *Update progress*, *Render video* og *Load feeds*. Samme emne set fra C# står i [[swd/threading|Tråde og synkronisering i C#]].',
          ],
        },
        {
          term: 'Concurrency, parallelism og hvornår tråde hjælper',
          body: [
            'Slide 5: på én kerne skal tråde køre *interleaved* (T1, T2, T3, T4, T1 …) — det er **concurrency**. På multicore fordeler OS’et dem på kernerne (core 1: T1, T3 …; core 2: T2, T4 …) — det er **parallelism**. Bogen (4.2): concurrency kan eksistere uden parallelism.',
            'Slide 4 knytter det til procestilstandene: en CPU-bound proces “must run to finish computation, another thread will not speed up things on the same CPU, but could help on an additional CPU”. En I/O-bound proces venter på I/O, og “additional threads could work meanwhile, even on the same CPU”.',
            'Bogen skelner mellem **data parallelism** (samme operation på dele af data, fx to tråde der summerer hver sin halvdel af et array) og **task parallelism** (forskellige operationer på hver sin kerne).',
          ],
        },
        {
          term: 'Amdahl’s lov og multicore challenges',
          body: [
            'Slide 6: `Speedup_overall = 1 / ((1 − time_optimized) + time_optimized / speedup_optimized)`. Eksemplet har Task A (70 %) og Task B (30 %): med B på tre kerner er `t_optimised_B3 = (1 − 0,3) + 0,3/3 = 0,8`; med A på to kerner står der `t_optimised_A2 = (1 − 0,7) + 0,7/3 = 0,65`. Grafen (Wikipedia) viser, at 50, 75, 90 og 95 % parallel andel flader ud ved speedup 2, 4, 10 og 20.',
            'Bogen skriver det med seriel andel `S`: `speedup ≤ 1 / (S + (1 − S)/N)`. Ved 75 % parallel giver 2 kerner 1,6 og 4 kerner 2,28; når `N → ∞`, går speedup mod `1/S`.',
            'Slide 7 (bog 4.2.1) har fem udfordringer: identificér deltasks, balancér arbejdet “as prescribed by amdahls law”, split data, undersøg data dependencies for at sikre synkronisering, og find en testmetode, “as there are now many different paths of execution”.',
          ],
        },
        {
          term: 'User- og kernel threads, multithreading-modeller',
          body: [
            'Slide 8: en **user thread** er oprettet af og synlig for brugeren (med OS’ets hjælp); en **kernel thread** er OS’ets repræsentation af den, brugt til at styre tilstand og ressourcer. Bogen: user threads styres uden kernestøtte af et bibliotek; kernel threads styres direkte af OS’et.',
            'Slide 9 har fire modeller med fordele og ulemper. **Many-to-one**: trådstyring alene i user space, men kun én tråd ad gangen og ingen CPU-parallelisme — “Not used today*” (*ligner asynkron scheduling). **One-to-one**: hver tråd kan blokere og køre parallelt, men er ressourcetung for OS’et — “Used in Linux + Windows”. **Many-to-many**: tilpasser antallet af kernel threads, men er kompliceret og mindre effektiv end 1:1 — “Not used today”. **Two-level**: endnu mere fleksibel og kompliceret; “Today’s CPUs have many cores, so less relevant”.',
            'Bogen (4.3.1) tilføjer, at i many-to-one blokerer hele processen, hvis én tråd laver et blokerende system call (eksempel: Green threads på Solaris).',
          ],
        },
        {
          term: 'std::thread, fork-join, detach og cancellation',
          body: [
            'Slide 10 lister: Unix/C `pthread.h` (POSIX threads), Windows/C `windows.h`, Java `java.util.concurrent`, C++ “thread.h”, .NET og Haskell `Control.Concurrent`. Bogens Figur 4.11 er C-versionen med `pthread_create(&tid, &attr, runner, argv[1])` og `pthread_join(tid, NULL)`; kurset bruger C++-versionen.',
            'Kursets eksempel (s. 12, `multithreaded_cpp_thread.cpp`): `runner(char *param)` summerer 1 til `std::atoi(param)` i en lokal `local_sum` og skriver resultatet til en global `std::atomic<int> sum{0}`. `std::thread t(runner, argv[1]);` starter tråden (fork), `t.join();` venter (join). Lambda-versionen (s. 13) fanger `sum` og `upper` med `[&]` og giver lambdaen direkte til `std::thread t(runner);` — se [[higher-order|lambdas og closures]].',
            'Fork-join (s. 11) er synkron: 1) main forker et antal child threads, 2) de kører parallelt, 3) main venter i join, 4) når alle er færdige, fortsætter main. Bogen kalder det *synchronous threading* over for *asynchronous threading*, hvor forælder og barn kører uafhængigt.',
            'Slide 14: `std::thread::detach` løsriver tråden fra trådobjektet og kører den i baggrunden “like a service (or deamon)”; `std::thread::joinable` fortæller, om tråden er detached eller ej. C++ har ingen direkte cancel som POSIX’ `pthread_cancel`; tråden skal selv kodes til at stoppe (**deferred cancellation**) — “This is the safest way btw!”. Signalhåndtering skal ske med `std::signal`. Bogen (4.6.3) forklarer de to cancellation-former: **asynchronous** terminerer target thread med det samme (risiko for inkonsistente data og ressourcer, der ikke frigives), **deferred** lader tråden tjekke ved *cancellation points*, fx `pthread_testcancel()`. Pthreads’ default er deferred.',
          ],
        },
        {
          term: 'Lokale, delte og thread_local variable',
          body: [
            'Slide 15 og `multithreaded_cpp_thread_local_storage.cpp` viser tre slags variable: lokale (`upper`, `local_sum`) ligger på trådens egen stak; `static std::atomic<int> shared_sum{0}` inde i `runner` deles af alle tråde (“Shared Storage (across threads)”); den globale `static std::atomic<int> sum{0}` ses af alle. Delte variable er `std::atomic`, fordi to tråde (`t1`, `t2`) opdaterer dem.',
            '**Thread Local Storage** (s. 16): `thread_local std::mt19937 rng(std::random_device{}());` giver hver tråd sin egen generator, fordi den er “expensive and not thread safe”. Fire tråde oprettes med `threads.emplace_back(generate_random, i)` og joines. Bogen (4.6.4): TLS er synlig på tværs af funktionskald i tråden, i modsætning til lokale variable; `thread_local` er C++11-varianten, `__thread` gcc’s og `pthread_key_create` Pthreads’.',
          ],
        },
        {
          term: 'Implicit threading: thread pools og OpenMP',
          body: [
            'Slide 17: implicit threading flytter trådstyring fra udvikleren til runtime-biblioteker. Udvikleren identificerer *tasks*, og biblioteket vælger — typisk en many-to-many-model, hvor nogle tasks får egne tråde og andre kører sekventielt i én tråd. **Thread pools** er præallokerede tråde, der genbruges (fx til webklienter): hurtigt, fordi der ikke allokeres ved kørsel, og sikkert, fordi antallet er begrænset.',
            '**OpenMP** er “a cross-platform set of compiler directives”, der paralleliserer via “decorators”. `foreach_parallel.cpp` kvadrerer 10 tal med `#pragma omp parallel for` og bygges med `g++ -fopenmp`. Bogen (4.5.3): `#pragma omp parallel` opretter lige så mange tråde, som der er kerner. Slide 7 i 03.2b anbefaler netop task-baseret concurrency (OpenMP, threadpools, `std::async`) frem for manuelle trådprioriteter, se [[cpu-scheduling|CPU-scheduling]]; C#-modstykket er [[swd/parallel-tasks|parallelle tasks]].',
          ],
        },
      ],
      viz: 'thread-address-space',
      keyPoints: [
        'Tråde deler code, data og filer; hver har egen stak, registre og PC.',
        'Concurrency = interleaving på én kerne; parallelism = samtidig på flere kerner.',
        'Ekstra tråde hjælper I/O-bound arbejde selv på én kerne; CPU-bound kun med flere kerner.',
        'Amdahl: `1 / ((1 − P) + P/N)`; loftet er `1/(1 − P)` uanset antal kerner.',
        'Linux og Windows bruger one-to-one; many-to-one giver ingen parallelisme.',
        '`std::thread t(runner, argv[1]); t.join();` er fork-join; `detach()` kører tråden som dæmon.',
        'C++ har ingen cancel — tråden skal selv stoppe (deferred cancellation).',
        'Delt data skal være `std::atomic` eller låst; `thread_local` giver hver tråd sin kopi.',
        'Thread pools og OpenMP (`#pragma omp parallel for`) flytter trådstyringen til biblioteket.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'std::thread med fork og join',
          source: 'lecture-code-main/week_3_threading/multithreaded_cpp_thread.cpp',
          code: `#include <iostream>
#include <thread>
#include <cstdlib>  // for std::atoi
#include <atomic>

std::atomic<int> sum{0}; // Use atomic to safely share across threads

void runner(char *param) {
    int upper = std::atoi(param);

    int local_sum = 0;
    for (int i = 1; i <= upper; ++i) {
        local_sum += i;
    }
    sum = local_sum; // Store result in shared variable
}

int main(int argc, char* argv[]) {
    if (argc < 2) {
        std::cerr << "Usage: " << argv[0] << " <integer>\\n";
        return 1;
    }

    // Create and run new thread
    std::thread t(runner, argv[1]);

    // Wait for thread to finish
    t.join();

    std::cout << "sum = " << sum << "\\n";
    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Samme med en lambda, der fanger by reference',
          source: 'lecture-code-main/week_3_threading/multithreaded_cpp_thread_lambda.cpp',
          code: `int main(int argc, char* argv[]) {
    std::atomic<int> sum{0};
    int upper = std::atoi(argv[1]);

    auto runner = [&]()
    {
        int local_sum = 0;
        for (int i = 1; i <= upper; ++i)
        {
            local_sum += i;
        }
        sum = local_sum;
    };

    std::thread t(runner);

    t.join();

    std::cout << "sum = " << sum << "\\n";
    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Thread local storage',
          source: '03.2a-Threads-and-Concurrency.pdf s. 16',
          code: `// Thread-local Random number generator setup (expensive and not thread safe)
thread_local std::mt19937 rng(std::random_device{}());

void generate_random(int thread_id) {
 std::uniform_int_distribution<int> dist(1, 100);
 int rand_num = dist(rng); // Generate number
 std::cout << "ID " << thread_id << " NUM: " << rand_num << std::endl;
}

int main() {
 std::vector<std::thread> threads;
 for (int i = 0; i < 4; ++i)
  threads.emplace_back(generate_random, i); // A copy of rng is created for each thread
 for (auto& t : threads)
  t.join();
 return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'OpenMP parallel for',
          source: 'lecture-code-main/week_3_threading/foreach_parallel.cpp',
          code: `#include <iostream>
#include <vector>
#include <omp>

/* Build with:
 g++ -fopenmp -o foreach_foreach foreach_parallel.cpp
 */

int main() {
    const int N = 10;
    std::vector<int> numbers(N);
    std::vector<int> squares(N);

    // Initialize the numbers 0 to N-1
    for (int i = 0; i < N; ++i) {
        numbers[i] = i;
    }

    // Parallel for loop using OpenMP
    #pragma omp parallel for
    for (int i = 0; i < N; ++i) {
        squares[i] = numbers[i] * numbers[i];
    }

    // Print the results
    for (int i = 0; i < N; ++i) {
        std::cout << numbers[i] << "^2 = " << squares[i] << "\\n";
    }

    return 0;
}`,
        },
      ],
      exam: [
        'En tråd er en letvægtsproces: tråde i samme proces deler code, data og åbne filer, men har hver sin stak, sine registre og sin program counter. Derfor er de billigere at oprette og skifte mellem end processer og kan dele data uden IPC.',
        'Concurrency er interleaving på én kerne, parallelism er samtidig kørsel på flere. Ekstra tråde hjælper en I/O-bound opgave selv på én kerne, men en CPU-bound opgave kun med flere kerner — og Amdahl’s lov sætter loftet: med 50 % parallel kode når man aldrig over speedup 2.',
        'Linux og Windows bruger one-to-one-modellen, hvor hver user thread har sin egen kernel thread, så en blokerende tråd ikke stopper de andre, og trådene kan køre parallelt. Many-to-one giver ingen parallelisme.',
        'I kursets eksempel starter `std::thread t(runner, argv[1])` en tråd, der summerer 1 til n i en lokal variabel og gemmer resultatet i en `std::atomic<int>`, og `t.join()` venter — det er fork-join. Lambda-versionen fanger med `[&]`, hvilket kun er sikkert, fordi main joiner, før variablerne forsvinder.',
        'Faldgruberne: delt data skal være atomic eller låst, ellers får man race conditions; C++ kan ikke annullere en tråd udefra, så den skal selv tjekke et stopsignal; og `thread_local` bruges, når hver tråd skal have sin egen kopi, fx af en random-generator, der ikke er trådsikker.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture03.2a_ThreadsAndConcurrency.md'), original: '03.2a-Threads-and-Concurrency.pdf', pages: 's. 2–18' },
        { path: k('context/book/SW3SYS-01_Ch04-05_Threads_Concurrency_CPU_Scheduling.md'), original: BOG, pages: 'afsnit 4.1–4.6, bogens s. 168–202 (PNG 192–226)' },
        { path: k('context/kode/SW3SYS-01_Code_week_3_threading.md'), note: 'Konvertering af lecture-code-main/week_3_threading/ (5 filer)' },
      ],
      gaps: [
        'Amdahl-slidet (s. 6) skriver `t_optimised_A2 = (1-0,7) + 0,7/3 = 0,65`. Figuren er “Dual Core, Task A running in two threads”, og 0,65 er resultatet med /2 (0,3 + 0,35). “/3” er en fejl. Markdown-konverteringen regner det om til 0,533 og siger, at A kører på tre kerner — det er forkert i forhold til figuren.',
        'Slide 6 bruger “time_optimized” som den paralleliserbare andel; bogen bruger `S` som den *serielle* andel. Formlerne er ens, men symbolerne er modsatte.',
        '`multithreaded_cpp_thread_local_storage.cpp` kompilerer ikke: den printer `final_sum`, som ikke er erklæret. Slide 15 har samme fejl og kalder desuden `runner(int id, char *param)` med kun ét argument (`std::thread t1(runner, argv[1])`). Filen bruger heller ikke `thread_local` trods navnet — den viser `static`.',
        'Koden kalder `shared_sum` “Local Storage (across threads)”; slide 15 kalder den “Shared Storage (across threads)”. Det er delt storage.',
        'Uden for materialet: `sum.store(shared_sum.load())` er to atomare operationer, ikke én. En tråd kan læse `shared_sum`, blive preempted og senere overskrive `sum` med en ældre værdi, så slutresultatet kan mangle den anden tråds bidrag, selv om kommentaren siger “to avoid race condition”.',
        '`foreach_parallel.cpp` og slide 18 inkluderer `<omp>`. Headeren hedder `<omp.h>` (som i bogens eksempel), så filen kompilerer ikke som den står.',
        'Slide 10 skriver C++-headeren som “thread.h” og .NET som “Thread.h”. C++-headeren er `<thread>`, som kursets kode bruger.',
        'Slide 14 siger, at signalhåndtering “must be implemented using std::signal”. Bogen (4.6.2) beskriver signaler i flertrådede programmer med `pthread_kill` og fire leveringsmuligheder; slidet uddyber ikke, hvilken tråd der får signalet.',
        'Slide 9 siger, at many-to-many er “Not used today”, og slide 17 siger, at implicit threading-biblioteker implementerer en many-to-many-model. Det er to forskellige lag (kernel-mapping vs. task-scheduling i biblioteket), men slidene skelner ikke.',
        'Bogens Java-eksempler (Executor, `ForkJoinPool`, `RecursiveTask`) er med i bogudsnittet, men ikke på slides; kurset bruger kun C++.',
      ],
      keywords: ['thread', 'tråd', 'light-weight process', 'multithreading', 'concurrency', 'parallelism', 'data parallelism', 'task parallelism', 'multicore', 'Amdahl', 'speedup', 'user thread', 'kernel thread', 'many-to-one', 'one-to-one', 'many-to-many', 'two-level', 'pthreads', 'pthread_create', 'pthread_join', 'pthread_cancel', 'std::thread', 'join', 'detach', 'joinable', 'fork-join', 'deferred cancellation', 'std::atomic', 'thread_local', 'TLS', 'thread local storage', 'thread pool', 'implicit threading', 'OpenMP', '#pragma omp parallel for', 'std::signal'],
    },

    // ─────────────────────────────────────────────────────────────── cpu-scheduling
    {
      slug: 'cpu-scheduling',
      title: 'CPU-scheduling',
      week: 'Uge 3 · L3.2b',
      definition:
        'Processer veksler mellem **CPU bursts** og **I/O bursts**; når en proces venter, vælger **CPU-scheduleren** den næste fra ready queue, og **dispatcheren** skifter til den. Algoritmerne — FCFS, SJF, Round-Robin, Priority og Multilevel — vurderes på CPU utilization, throughput, turnaround, waiting og response time. Linux’ **CFS** vælger tasken med mindst `vruntime`.',
      concepts: [
        {
          term: 'CPU–I/O burst cycle og scheduleren',
          body: [
            'Slide 2 i 03.2b: “When a process is waiting (on I/O or child process), the CPU has time to work on another process in the ready queue. The CPU Scheduler selects the next process to run.” Figuren veksler mellem CPU bursts (`load store`, `add store`, `read from file`) og I/O bursts (`wait for I/O`).',
            'Bogen (5.1.1): burst-længderne følger en eksponentiel eller hypereksponentiel kurve — mange korte, få lange. Et I/O-bound program har mange korte CPU bursts, et CPU-bound få lange. Procestilstandene fra [[processer|processer]] er grundlaget.',
          ],
        },
        {
          term: 'Preemptive og non-preemptive',
          body: [
            'Slide 3: **non-preemptive** eller *cooperative* scheduling — den kørende proces går frivilligt i waiting (“it yields”). **Preemptive** — OS’et bestemmer, hvornår en proces sættes til side; det garanterer, at alle får CPU-tid, men “race conditions may (will) occur and real-time processing cannot be guaranteed”. Windows, macOS og Linux er preemptive, men opfører sig non-preemptive-agtigt ved async I/O.',
            'Bogen (5.1.2) har fire situationer, hvor der skal træffes et valg: running → waiting, running → ready (interrupt), waiting → ready (I/O færdig) og terminering. Non-preemptive scheduling vælger kun ved 1 og 4; preemptive ved alle fire. Race conditions ved preemption behandles i [[kritisk-sektion|kritisk sektion]].',
          ],
        },
        {
          term: 'Dispatcher',
          body: [
            'Bogen (5.1.3): dispatcheren giver CPU’en til den proces, scheduleren har valgt. Den laver context switch, skifter til user mode og hopper til det rigtige sted i programmet. Tiden det tager er **dispatch latency** (Figur 5.3: P0 executing → save state into PCB0 → restore state from PCB1 → P1 executing). Slides nævner ikke dispatcheren.',
          ],
        },
        {
          term: 'Scheduling-kriterier',
          body: [
            'Slide 4: **CPU utilization** — hold den så travl som muligt; **throughput** — processer færdige pr. tidsenhed; **turnaround time** — fra submission til completion; **waiting time** — summen af tid i *ready queue* (“not Waiting queue”); **response time** — fra submission til første respons.',
            'Man vil maksimere utilization og throughput og minimere tiderne, men slidet tilføjer: “sometimes the best user experience derives from consistant stable behaviour, with low variabiblity.” Bogen (5.2) angiver CPU utilization fra 40 % (let belastet) til 90 % (tungt belastet) og siger, at man typisk optimerer gennemsnitlig waiting time.',
          ],
        },
        {
          term: 'FCFS og SJF',
          body: [
            'Slide 5 har tre tasks: A (low priority, 5 felter), B (high, 3 felter) og C (high, 2 felter). FCFS kører A, B, C. Bogen (5.3.1) med bursts P1 = 24, P2 = 3, P3 = 3 ms: rækkefølgen P1, P2, P3 giver waiting times 0, 24, 27 og gennemsnit 17 ms; P2, P3, P1 giver 6, 0, 3 og 3 ms. Korte jobs bag et langt er **convoy effect**. FCFS er non-preemptive.',
            'SJF vælger den korteste *næste* CPU burst og er beviseligt optimal for gennemsnitlig waiting time. Bogen: P1 = 6, P2 = 8, P3 = 7, P4 = 3 giver rækkefølgen P4, P1, P3, P2 og waiting 3, 16, 9, 0 — gennemsnit 7 ms mod 10,25 ms med FCFS. Den næste burst kendes ikke, så den forudsiges med eksponentielt gennemsnit `τ(n+1) = α·t(n) + (1 − α)·τ(n)`, typisk α = ½.',
            'Preemptive SJF er **shortest-remaining-time-first**: P1 (ankomst 0, burst 8), P2 (1, 4), P3 (2, 9), P4 (3, 5) giver Gantt P1 0–1, P2 1–5, P4 5–10, P1 10–17, P3 17–26 og gennemsnitlig waiting time 26/4 = 6,5 ms.',
          ],
        },
        {
          term: 'Round-Robin, Priority og Multilevel',
          body: [
            '**Round-Robin** er FCFS med preemption efter et **time quantum** (typisk 10–100 ms); ready queue er en cirkulær kø. Bogen: P1 = 24, P2 = 3, P3 = 3 med quantum 4 giver P1 0–4, P2 4–7, P3 7–10 og så P1 resten; waiting 6, 4, 7, gennemsnit 17/3 ≈ 5,66 ms. For stort quantum bliver FCFS, for lille giver for mange context switches; tommelfingerreglen er, at 80 % af bursts skal være kortere end quantum.',
            '**Priority**: laveste tal = højeste prioritet i bogen. P1 (10, prio 3), P2 (1, 1), P3 (2, 4), P4 (1, 5), P5 (5, 2) giver P2 0–1, P5 1–6, P1 6–16, P3 16–18, P4 18–19 og 8,2 ms. Problemet er **starvation** — rygtet om en proces fra 1967, der stadig ventede på IBM 7094 ved MIT i 1973 — og løsningen **aging**. Priority + RR: P4 (7, prio 1) kører først 0–7, P2 og P3 (prio 2) skiftes med quantum 2 til 20, så P1 og P5 til 27.',
            '**Multilevel queue** har én kø pr. prioritet (bogen: real-time, system, interactive, batch), hver med egen algoritme. **Multilevel feedback queue** lader processer flytte: kø 0 med quantum 8, kø 1 med quantum 16, kø 2 FCFS; en proces, der bruger hele sit quantum, flyttes ned, og aging flytter op. Slidet kalder sin variant “Multilevel (Pri+BB)”.',
          ],
        },
        {
          term: 'Linux CFS og trådprioriteter',
          body: [
            'Slide 6: Linux har to scheduling-klasser, real-time og **CFS** (Completely Fair Scheduler). CFS prioriterer efter en **targeted latency** for alle tasks og vedligeholder hver tasks **virtual run time** (VRT). “Priority ~ VRT + nice number ; low is high priority!” Nice numbers ligger i [−20..+19]. Prioriteten ligger i et binært søgetræ, så CPU’en finder den mindste i `O(log N)`. Real-time tasks har meget højere prioritet end CFS.',
            'Bogen (5.7.1): CFS blev default i kernel 2.6.23. Nice-værdien bestemmer andelen af CPU-tid (default 0); targeted latency er intervallet, hvor alle runnable tasks skal køre mindst én gang. `vruntime` vokser langsommere for højprioritets-tasks; ved nice 0 er den lig den fysiske køretid (200 ms kørsel giver `vruntime` 200 ms). Træet er et **red-black tree**, og den venstreste node caches i `rb_leftmost`. Real-time har prioritet 0–99, normale tasks 100–139.',
            'Slide 7 om trådprioriteter: manuel prioritering bruges sjældent, fordi den ikke er portabel (Windows og POSIX er inkonsistente), ikke deterministisk (undtagen i real-time kontekst), og fordi task-baseret concurrency (OpenMP, threadpools, `std::async`) er bedre. “If not done by an expert, system performance can be hurt seriously!” — men til lavniveau-tidskritiske opgaver som videorendering og robotik kan det være nyttigt. Se [[traade|tråde]].',
          ],
        },
      ],
      viz: 'scheduling-gantt',
      keyPoints: [
        'Når en proces venter på I/O, vælger CPU-scheduleren en ny fra ready queue.',
        'Non-preemptive: processen yielder selv. Preemptive: OS’et afbryder — alle moderne OS, men giver race conditions.',
        'Waiting time = tid i ready queue, ikke i wait queue.',
        'FCFS: simpel, convoy effect (24/3/3 → 17 ms i snit). SJF: optimal (7 ms), men burst skal forudsiges.',
        'RR: time quantum; for stort = FCFS, for lille = context switch-overhead.',
        'Priority: lavt tal = høj prioritet; starvation løses med aging.',
        'Multilevel feedback queue flytter processer mellem køer efter adfærd.',
        'CFS: mindste `vruntime` kører; nice −20..+19; red-black tree, `O(log N)`.',
        'Sæt ikke trådprioriteter manuelt — brug task-baseret concurrency.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Slidets Gantt-diagram (10 tidsenheder)',
          source: '03.2b-cpu-scheduling.pdf s. 5',
          code: `Task A (Low priority)   AAAAA
Task B (High priority)  BBB
Task C (High priority)  CC

First Come First Serve  AAAAABBBCC
Shortest Job First      BBBCCAAAAA
Round-Robbin            AABBCCAABA
Priority (+FCFS)        BBBCCAAAAA
Multilevel (Pri+BB)     AAAAABBCCB`,
        },
        {
          lang: 'text',
          title: 'Bogens eksempler: FCFS, SJF og RR',
          source: 'Silberschatz 5.3.1–5.3.3, bogens s. 218–222 (PNG 242–246)',
          code: `FCFS, P1=24 P2=3 P3=3 (ankomst 0):
| P1 0-24 | P2 24-27 | P3 27-30 |    waiting (0+24+27)/3 = 17 ms

SJF, P1=6 P2=8 P3=7 P4=3:
| P4 0-3 | P1 3-9 | P3 9-16 | P2 16-24 |    waiting (3+16+9+0)/4 = 7 ms

SRTF, P1(0,8) P2(1,4) P3(2,9) P4(3,5):
| P1 0-1 | P2 1-5 | P4 5-10 | P1 10-17 | P3 17-26 |    26/4 = 6.5 ms

RR, quantum 4, P1=24 P2=3 P3=3:
| P1 0-4 | P2 4-7 | P3 7-10 | P1 10-14 | ... | P1 26-30 |    17/3 = 5.66 ms`,
        },
        {
          lang: 'text',
          title: 'Bogens priority-eksempler',
          source: 'Silberschatz 5.3.4, bogens s. 224–226 (PNG 248–250)',
          code: `Priority (lavt tal = høj prio):
P1 burst 10 prio 3, P2 1/1, P3 2/4, P4 1/5, P5 5/2
| P2 0-1 | P5 1-6 | P1 6-16 | P3 16-18 | P4 18-19 |    8.2 ms

Priority + RR, quantum 2:
P1 4/3, P2 5/2, P3 8/2, P4 7/1, P5 3/3
| P4 0-7 | P2 | P3 | P2 | P3 | P2 -16 | P3 16-20 | P1 | P5 | P1 | P5 -27 |`,
        },
      ],
      exam: [
        'Processer veksler mellem CPU bursts og I/O bursts, og når en proces venter, vælger CPU-scheduleren en anden fra ready queue, og dispatcheren laver context switch til den. Alle moderne OS’er er preemptive: OS’et kan tage CPU’en fra en proces, hvilket sikrer fairness, men giver race conditions.',
        'Algoritmerne sammenlignes på CPU utilization, throughput, turnaround time, waiting time — tiden i ready queue — og response time. Med bogens eksempel 24, 3 og 3 ms giver FCFS 17 ms i gennemsnitlig ventetid, fordi de korte står bag den lange (convoy effect); med de korte først er det 3 ms.',
        'SJF er beviseligt optimal for gennemsnitlig ventetid, men kræver, at man forudsiger næste burst med et eksponentielt gennemsnit. Round-Robin giver hver proces et quantum og er fair; priority scheduling kan udsulte lavprioritets-processer, hvilket løses med aging.',
        'Linux bruger CFS til normale tasks: hver task har en `vruntime`, der vokser langsommere jo højere prioritet (lavere nice-værdi, −20 til +19), og scheduleren vælger tasken med mindst `vruntime` fra et red-black tree. Real-time tasks går altid foran.',
        'Slidet advarer mod selv at sætte trådprioriteter: det er ikke portabelt, ikke deterministisk og kan skade systemets performance — brug hellere thread pools, OpenMP eller `std::async`.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture03_2b_CPU_Scheduling.md'), original: '03.2b-cpu-scheduling.pdf', pages: 's. 2–7' },
        { path: k('context/book/SW3SYS-01_Ch04-05_Threads_Concurrency_CPU_Scheduling.md'), original: BOG, pages: 'afsnit 5.1–5.3, bogens s. 212–229 (PNG 236–253)' },
        { path: k('data/bogen/Silberschatz_s Operating System Concepts - Global Edition_pages_192-280/'), original: BOG, pages: 'afsnit 5.7.1 Linux CFS, bogens s. 247–250 (PNG 271–274)', note: 'Ikke med i markdown-konverteringen — læst i PNG’erne' },
      ],
      gaps: [
        'Slide 6 siger “CPU task get lower Nice numbers than I/O”. Bogen (5.7.1, bogens s. 248–249) siger det modsatte for CFS: med samme nice-værdi får den I/O-bound task lavere `vruntime` og dermed *højere* prioritet end den CPU-bound, og den kan preempte den. Nice-værdien sættes af brugeren, ikke ud fra om tasken er CPU- eller I/O-bound. Markdown-konverteringen gentager slidets påstand.',
        'Slide 5: rækken “Shortest Job First Scheduling” kører B (3 felter) før C (2 felter) — identisk med “Priority (+FCFS)”. Med kortest først skulle C køre før B. Markdown-konverteringen beskriver rækken som “Task C (kortest) køres tidligt, derefter Task B”, hvilket ikke passer med billedet.',
        'Slide 5 viser “Multilevel (Pri+BB)” uden at forklare “BB”, og rækken (A5, B2, C2, B1) kører den lavprioriterede A først. Hverken slide eller markdown forklarer skemaet.',
        'Slide 6 siger, at CPU’en kan “pick smallest in O(log N)”. Bogen tilføjer, at Linux cacher den venstreste node i `rb_leftmost`, så selve valget kun kræver den cachede værdi. Slidet kalder træet et “Binary search tree”; bogen præciserer red-black tree.',
        'Slides nævner hverken dispatcheren, dispatch latency, SRTF, eksponentielt gennemsnit eller multilevel feedback queues; de står kun i bogen.',
        'Markdown-konverteringen af kap. 4–5 har et afsnit “5.7.4 / 5.8 Algorithm Evaluation” med deterministisk modellering (P1 = 10, P2 = 29, P3 = 3, P4 = 7, P5 = 12). Bogens PNG-udsnit slutter på bogens s. 256 (PNG 280) og indeholder ikke afsnit 5.8, så eksemplet kan ikke verificeres mod originalen.',
        'Slidet kalder decket “Threads and Concurrency” i sidefoden, selv om titlen er “CPU Scheduling”; stavefejl som “Round-Robbin”, “volutarily”, “yeilds”, “trageted”.',
        'Slide 3 siger, at preemptive scheduling sætter processen i “waiting state”. I procestilstandsdiagrammet går en preempted proces til *ready* (interrupt), ikke waiting.',
        'Real-time scheduling (5.6: rate-monotonic, EDF) og multiprocessor-scheduling (5.5) er i bogens PNG-udsnit, men ikke på slides og ikke i markdown-konverteringen.',
      ],
      keywords: ['CPU scheduling', 'CPU burst', 'I/O burst', 'CPU scheduler', 'short-term scheduler', 'dispatcher', 'dispatch latency', 'preemptive', 'non-preemptive', 'cooperative', 'CPU utilization', 'throughput', 'turnaround time', 'waiting time', 'response time', 'FCFS', 'first-come first-served', 'convoy effect', 'SJF', 'shortest job first', 'SRTF', 'exponential average', 'Round-Robin', 'time quantum', 'time slice', 'priority scheduling', 'starvation', 'aging', 'multilevel queue', 'multilevel feedback queue', 'Gantt', 'CFS', 'Completely Fair Scheduler', 'vruntime', 'VRT', 'nice', 'targeted latency', 'red-black tree', 'real-time', 'trådprioritet'],
    },
  ],
}
