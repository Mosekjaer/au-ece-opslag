import type { Part } from '../types'
import { k } from './paths'

const MEM_MD = k('context/slides/SW3SYS-01_Lecture10.2_Memory_Management.md')
const MEM_PDF = '10.2-Week_11_-_Memory_management.pdf'
const ARM_MD = k('context/slides/SW3SYS-01_Lecture11_1_automatic_resource_management.md')
const ARM_PDF = '11.1-Automatic_ressource_management.pdf'

export const hukommelse: Part = {
  id: 'hukommelse',
  title: 'Hukommelse og ressourcer',
  topics: [
    {
      slug: 'hukommelse-allokering',
      title: 'Hukommelse, adresser og allokering',
      short: 'Hukommelse og allokering',
      week: 'Uge 10 · L10.2',
      definition:
        '**Memory management** opstår, fordi flere programmer skal ligge i main memory samtidig for at udnytte CPU’en og svare hurtigt (10.2 s. 2); OS’et skal fordele hukommelsen mellem processerne og holde dem adskilt. Det kræver beskyttelse (base- og limit-registre), oversættelse fra virtuelle til fysiske adresser (MMU) og en strategi for at finde en fri blok — first-, best- eller worst-fit — der alle ender i **fragmentering**.',
      concepts: [
        {
          term: 'Main memory og basic hardware',
          body: [
            'Main memory er “a large array of bytes, where each byte has its own address”, delt mellem CPU’en og I/O-enheder. Et program skal mappes til absolutte adresser og indlæses, før det kan køre; når det terminerer, erklæres pladsen ledig. For at udnytte CPU’en og svare hurtigt skal *flere* programmer ligge i hukommelsen samtidig — derfor memory management (s. 2).',
            'Main memory og CPU-registre er den eneste general-purpose storage, CPU’en kan tilgå direkte. Et register tager **1 CPU-cyklus**, fordi det sidder på selve chippen; main memory tilgås over memory bus’en og tager **mange** cyklusser. Cache memory gemmer ofte brugte instruktioner for at udjævne forskellen (s. 3).',
          ],
        },
        {
          term: 'Beskyttelse med base- og limit-registre',
          body: [
            'Hver proces har sit eget memory space. **Base register** holder den mindste lovlige fysiske adresse, **limit register** størrelsen af intervallet derfra. Lovlige adresser er altså `base ≤ adresse < base + limit` (s. 3).',
            'CPU’en sammenligner **hver** adresse, der genereres i user mode, med de to registre: først `≥ base`, så `< base + limit`. Fejler én af testene, sker der en software interrupt — en **trap** — til OS’et med “illegal addressing error”. Figuren på s. 4 har OS’et fra 880000 til 1024000, base = 300040 og base + limit = 420940 (dvs. limit = 120900). Kun OS’et kan loade base og limit, så et program hverken ved et uheld eller med vilje kan ændre OS’ets eller andre brugeres kode og data. User mode og traps hører til [[os-dual-mode|dual mode]].',
          ],
        },
        {
          term: 'Address binding: compile, load, execution time',
          body: [
            'Adresser i kildekoden er symbolske (fx et variabelnavn). Compileren binder dem til **relocatable** adresser; linker eller loader binder dem til absolutte adresser i fysisk hukommelse. Figuren på s. 6 viser kæden kildeprogram → compiler → object file → linker (+ andre object files) → executable → loader (+ dynamisk linkede biblioteker) → program i hukommelsen.',
            'Tre tidspunkter (s. 5): **Compile time** — kendes den faste placering, genereres *absolute code*; flyttes startadressen, skal der rekompileres. **Load time** — kendes placeringen ikke, genereres *relocatable code*; flyttes startadressen, skal der genindlæses. **Execution time** — processen kan flyttes mellem segmenter under kørsel. “Most operating systems use this method.”',
          ],
        },
        {
          term: 'Virtuel vs. fysisk adresse og MMU',
          body: [
            'Adressen, CPU’en genererer, er den **virtuelle** adresse; den, main memory bruger, er den **fysiske**. Binding ved compile eller load time giver identiske adresser; binding ved execution time giver forskellige, og så skal der oversættes (s. 7).',
            'Oversættelsen laves i hardware af **Memory Management Unit (MMU)**. I slidets simple model har MMU’en et base register, som lægges til: virtuel `34F` + base `1F000000` = fysisk `1F00034F`. Brugerprogrammer ser aldrig fysiske adresser; en pointer i et program er en virtuel adresse, som kan gemmes og manipuleres. Paging er den mere generelle oversættelse — se [[paging|Paging]].',
          ],
        },
        {
          term: '`malloc()` og hvornår hukommelsen bliver fysisk',
          body: [
            '`void *malloc(size_t size)` tager antal bytes og returnerer en pointer til starten af den nye blok, eller en null pointer (`NULL`/`nullptr`) ved fejl. `free()` giver blokken tilbage (s. 9).',
            'Slidets NOTE: “Memory block is only reserved in physical memory when it is ‘touched’”, fx med `memset()`. Kursets `mem_alloc_demo.cpp` viser det: den `malloc`’er 100 MB (`100 * 1024 * 1024`), udskriver adressen, venter på ENTER, fylder blokken med `memset(mem, 0, nbytes)`, venter igen, kalder `free(mem)` og venter en sidste gang. Pauserne er der, så man i en anden terminal kan se, at forbruget først stiger ved `memset()` og falder ved `free()`.',
            'Forbruget måles med `cat /proc/meminfo | grep Mem` og `free -m` (s. 8). Slidets Raspberry Pi viser `MemTotal: 4147648 kB`, `MemFree: 3465840 kB`, `MemAvailable: 3829488 kB`, og `free -m` giver total 4050, used 295, free 3399, shared 17, buff/cache 436, available 3754 MB samt 511 MB swap, hvoraf 0 er brugt. Øvelsen (s. 18) er netop at få kernens tal til at stemme med det, programmet allokerer.',
          ],
        },
        {
          term: 'Variable partitions og dynamic storage allocation',
          body: [
            'I et **variable partition scheme** får hver proces en partition af variabel størrelse med præcis én proces i. I starten er al hukommelse én stor fri blok; over tid, når processer kommer og går, består den af tomme blokke i alle størrelser (s. 10).',
            'Skal en proces bruge plads, søger OS’et en fri blok, der er stor nok. Er den for stor, **splittes** den: én del til processen, resten forbliver fri. Når en proces terminerer, bliver dens blok fri, og ligger den op ad andre frie blokke, **merges** de til én (s. 11). Problemet er at tildele `N` bytes fra et sæt spredte frie blokke.',
            '**First-fit** tager den første blok, der er stor nok, og stopper søgningen dér — fra starten af listen eller fra hvor sidste søgning sluttede. **Best-fit** tager den *mindste* blok, der er stor nok; hele listen skal gennemsøges, medmindre den er sorteret efter størrelse. **Worst-fit** tager den *største* blok, også med fuld søgning. First- og best-fit er bedre end worst-fit i både tid og lagerudnyttelse; ingen af de to er bedre end den anden i udnyttelse, men first-fit er generelt hurtigere (s. 12).',
          ],
        },
        {
          term: 'Memory fragmentation',
          body: [
            'Når processer indlæses og fjernes, brydes den frie plads op i små stykker, der ikke ligger ved siden af hinanden. **Fragmentering** er, når der samlet er plads nok til en proces, men ingen sammenhængende blok er stor nok. Figuren på s. 13: Process 12 venter, selv om de grå huller mellem Process 3, 8, 2, 5, 7, 6, 1, 4 og 9 tilsammen kunne rumme den.',
            'I værste fald ligger der et lille hul mellem hver to processer. Både first- og best-fit fragmenterer. Statistisk analyse af first-fit: med `N` allokerede blokke går yderligere `0,5 · N` tabt til fragmentering — “one-third of memory may become unusable!” Svaret i kurset er [[paging|paging]], der tillader et ikke-sammenhængende adresserum (s. 14).',
          ],
        },
      ],
      viz: 'fit-fragmentation',
      keyPoints: [
        'Register: 1 cyklus. Main memory: mange cyklusser over memory bus’en. Cache udjævner.',
        'Lovlig adresse: `base ≤ adr < base + limit`; ellers trap. Kun OS’et loader registrene.',
        'Binding: compile time (absolute code), load time (relocatable code), execution time (de fleste OS’er).',
        'MMU oversætter virtuel → fysisk; simpel model: `34F + 1F000000 = 1F00034F`.',
        '`malloc()` reserverer; hukommelsen bliver først fysisk, når den “touches” (`memset()`).',
        'Mål med `/proc/meminfo` og `free -m`.',
        'First-fit: første store nok. Best-fit: mindste store nok. Worst-fit: største. First-fit er hurtigst.',
        'First-fit: `N` blokke taber `0,5 · N` → op til en tredjedel af hukommelsen.',
        'Fragmentering = nok ledig plads i alt, men ikke sammenhængende.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'mem_alloc_demo.cpp — malloc, memset, free med pauser',
          source: 'lecture-code-main/week_11_memory_management/src/mem_alloc_demo.cpp (også 10.2 s. 9)',
          code: `#include <cstring>
#include <iostream>

int main(int argc, char* argv[]) {
  int nbytes = 100 * 1024 * 1024;  // # bytes to allocate

  char* mem = (char*)malloc(nbytes * sizeof(char));  // Allocate memory

  if (mem == nullptr) {  // If malloc() fails
    perror("malloc()");  // Print error
    exit(EXIT_FAILURE);  // Exit program
  }
  else {               // If malloc() succeeds
    std::cout << (nbytes / 1024) / 1024 << " mB allocated\\n";
    std::cout << "Memory allocated at " << (void*)mem << "\\n";
  }

  std::cout << "Press ENTER to fill memory...";
  getchar();  // Wait until keypress

  memset(mem, 0, nbytes);  // Fill memory with 0s

  std::cout << "Done.\\nPress ENTER to free allocated memory...";
  getchar();  // Wait until keypress

  free(mem);  // Free allocated memory

  std::cout << "Memory freed. Press ENTER to exit program...";
  getchar();

  return EXIT_SUCCESS;
}`,
        },
        {
          lang: 'bash',
          title: 'Hukommelsen på slidets Raspberry Pi',
          source: '10.2-Week_11_-_Memory_management.pdf s. 8',
          code: `danny@raspberrypi:~ $ sudo cat /proc/meminfo | grep Mem
MemTotal:        4147648 kB
MemFree:         3465840 kB
MemAvailable:    3829488 kB
danny@raspberrypi:~ $ free -m
               total        used        free      shared  buff/cache   available
Mem:            4050         295        3399          17         436        3754
Swap:            511           0         511`,
        },
        {
          lang: 'text',
          title: 'Base/limit-tjek og MMU med slidenes tal',
          source: '10.2-Week_11_-_Memory_management.pdf s. 4 og 7',
          code: `Base/limit (s. 4):  base = 300040, base + limit = 420940
  adresse >= 300040 ?  nej -> trap: illegal addressing error
  adresse <  420940 ?  nej -> trap: illegal addressing error
  ellers              -> adgang til memory

MMU med base register (s. 7):
  virtual address 34F + base register 1F000000 = physical address 1F00034F`,
        },
      ],
      exam: [
        'Memory management er nødvendigt, fordi flere programmer skal ligge i main memory samtidig for at udnytte CPU’en, og de må ikke ødelægge hinanden eller OS’et. Beskyttelsen sker i hardware: CPU’en tjekker hver user mode-adresse mod base og base + limit og laver en trap til OS’et, hvis den ligger udenfor.',
        'Adresser kan bindes ved compile time, load time eller execution time. De fleste OS’er binder ved execution time, og så er den virtuelle adresse forskellig fra den fysiske; MMU’en oversætter, i den simple model ved at lægge et base register til, fx `34F` plus `1F000000` giver `1F00034F`.',
        'I kursets `mem_alloc_demo.cpp` `malloc`’er vi 100 MB og kigger på `free -m` undervejs. Slidet siger, at blokken først bliver reserveret i fysisk hukommelse, når den bliver “touched” med `memset()` — derfor stiger forbruget ikke ved selve `malloc()`-kaldet.',
        'Med variable partitions skal OS’et finde en fri blok: first-fit tager den første, der er stor nok, best-fit den mindste, worst-fit den største. First- og best-fit slår worst-fit, og first-fit er hurtigst, fordi den stopper ved første match.',
        'Faldgruben er fragmentering: der kan være plads nok i alt, men ikke i én sammenhængende blok. For first-fit taber man statistisk `0,5 · N` blokke ved `N` allokerede — op til en tredjedel — og det er motivationen for paging.',
      ],
      sources: [
        { path: MEM_MD, original: MEM_PDF, pages: 's. 2–13, 18' },
        { path: k('context/kode/SW3SYS-01_Code_week_11_memory_management.md'), note: 'Konvertering af kursets kode med tilføjede kommentarer' },
        { path: k('data/lecture-code-main/lecture-code-main/week_11_memory_management/src/mem_alloc_demo.cpp') },
        { path: k('data/lecture-code-main/lecture-code-main/week_11_memory_management/Makefile') },
        { path: k('kursuskatalog.md'), note: 'Kursusindhold 5 og læringsmål 2 (memory pools), 4 og 8' },
      ],
      gaps: [
        '**Memory pools** står i læringsmål 2 (“synkroniseringsværktøjer (mutex, semaforer) og memory pools”) og i kursusindhold 5, men hverken slides, kursets kode eller de tilgængelige bogsider dækker dem. Det samme gælder “cache-konsistens” og “hukommelseshierarki” fra kursusindhold 5 ud over de to linjer om registre og cache på s. 3.',
        'Bogens kapitel om main memory findes ikke i materialet. Sideudsnittene i `data/bogen/` (PNG 297–326, 335–341, 348–349, 366–379, 385–390) er kap. 6 *Synchronization Tools*, kap. 7 *Synchronization Examples* og kap. 8 *Deadlocks* (bogsider 273–366; PNG-nummer ≈ bogside + 24), og `context/book/` slutter ved kap. 8. Slidenes figurer (s. 4, 6, 11–15) ligner bogens, men kan ikke tjekkes mod den.',
        'Slidene taler kun om “memory fragmentation”; markdown-konverteringen kalder det “ekstern fragmentering”. **Intern fragmentering** og **compaction** nævnes ikke nogen steder i materialet. Uden for materialet: intern fragmentering er ubrugt plads *inde i* en tildelt blok (fx sidste side ved paging), og compaction flytter processer sammen, så hullerne samles — det kræver execution-time binding.',
        'Slide 9 siger kun, at blokken reserveres fysisk, når den “touches”. Ordene “demand paging” og “lazy allocation” står i markdown-konverteringen og i `context/kode/…memory_management.md`, ikke på slidet eller i `mem_alloc_demo.cpp`. Uden for materialet: på Linux skyldes det, at `malloc` af store blokke typisk giver urørte sider, der først får en fysisk frame ved første page fault.',
        'Øvelsen på s. 18 siger “Check memory usage using /proc/iomem or free”, mens s. 8 viser `/proc/meminfo`. `/proc/iomem` er et kort over fysiske adresseområder, ikke forbruget — `/proc/meminfo` er formentlig ment (markdown-konverteringen har rettet det stiltiende).',
        'Tallet “0,5 N blokke → en tredjedel” (s. 13) gives uden kilde. Uden for materialet: Silberschatz kalder det *the 50-percent rule*.',
        '`mem_alloc_demo.cpp` inkluderer ikke `<cstdlib>`/`<cstdio>`, selv om den bruger `malloc`, `free`, `exit`, `perror` og `getchar`; den bygger kun, fordi `<iostream>`/`<cstring>` trækker dem med. Makefilens `mkdir build && mkdir build/bin` fejler ved anden build, hvis `build/` findes (ingen `-p`).',
        'Decket hedder “Week_11” i filnavnet, men er L10.2 i kursusplanen (Course Introduction s. 4).',
      ],
      keywords: ['memory management', 'hukommelsesstyring', 'main memory', 'RAM', 'register', 'cache', 'memory bus', 'base register', 'limit register', 'trap', 'illegal addressing error', 'address binding', 'compile time', 'load time', 'execution time', 'absolute code', 'relocatable code', 'linker', 'loader', 'virtual address', 'logisk adresse', 'physical address', 'MMU', 'relocation register', 'malloc', 'free', 'memset', 'demand paging', 'lazy allocation', '/proc/meminfo', 'free -m', 'variable partition', 'first-fit', 'best-fit', 'worst-fit', 'fragmentation', 'fragmentering', '50-percent rule', 'memory pool', 'mem_alloc_demo'],
    },

    {
      slug: 'paging',
      title: 'Paging',
      week: 'Uge 10 · L10.2',
      definition:
        '**Paging** deler den fysiske hukommelse i faste blokke, **frames**, og den virtuelle i blokke af samme størrelse, **pages**. En **page table** mapper hver page til en frame, så en proces’ adresserum ikke behøver ligge sammenhængende — det fjerner den fragmentering, variable partitions giver.',
      concepts: [
        {
          term: 'Pages, frames og page table',
          body: [
            'Paging “solves the memory fragmentation problem by allowing the logical address space of processes to be non-contiguous”. En proces kan få fysisk hukommelse, så snart den samlede frie plads er stor nok — hullerne behøver ikke ligge ved siden af hinanden (s. 14).',
            'Fysisk hukommelse deles i **frames** af fast størrelse, virtuel hukommelse i **pages**; pages og frames er lige store, typisk mellem 4 KB og 1 GB. En **page table** oversætter fra virtuel til fysisk hukommelse. Slidets eksempel: page 0 → frame 1, page 1 → frame 4, page 2 → frame 3, page 3 → frame 7; frame 0, 2, 5 og 6 er ikke brugt af processen. Rækkefølgen i fysisk hukommelse er altså en helt anden end i den virtuelle.',
          ],
        },
        {
          term: 'Adresseoversættelse: `p` og `d`',
          body: [
            'Hver adresse, CPU’en genererer, deles i to: **page number `p`** og **page offset `d`**. `p` bruges som indeks i page table, som indeholder “base address `f` of each frame in physical memory”. Den fysiske adresse er `f` sat sammen med det uændrede `d`: `f` vælger framen, `d` vælger stedet i framen (s. 15).',
            'Regnet ud: `page = ⌊virtuel adresse / page size⌋`, `offset = virtuel adresse mod page size`, og `fysisk adresse = f · page size + offset` (s. 16). Offset’et går uændret igennem; kun sidenummeret oversættes. Det er den generelle udgave af MMU’ens base register i [[hukommelse-allokering|den simple model]], hvor hele processen havde én base.',
          ],
        },
        {
          term: 'Eksemplet med page size = 4 bytes',
          body: [
            'Virtuel hukommelse er 16 bytes, adresse 0–15 med bogstaverne `a`–`p`, i fire pages á 4 bytes. Page table: page 0 → 5, page 1 → 6, page 2 → 1, page 3 → 2. Fysisk hukommelse er 32 bytes (adresse 0–31): frame 1 (adr. 4–7) rummer `i j k l`, frame 2 (8–11) `m n o p`, frame 5 (20–23) `a b c d`, frame 6 (24–27) `e f g h`; frame 0, 3, 4 og 7 er tomme (s. 16).',
            'Slidet regner to rækker: virtuel 0 → page 0, offset 0 → `5 · 4 + 0 = 20` (`a`); virtuel 3 → page 0, offset 3 → `5 · 4 + 3 = 23` (`d`). Rækkerne for 6 og 13 står som `?` — de er øvelsen. Med slidets page table: 6 → page 1, offset 2 → `6 · 4 + 2 = 26` (`g`), og 13 → page 3, offset 1 → `2 · 4 + 1 = 9` (`n`). Begge stemmer med bogstaverne i den fysiske hukommelse på figuren.',
          ],
        },
        {
          term: 'Virtuel hukommelse kan være større end fysisk',
          body: [
            'Fordi pages kun skal have en frame, når de bruges, kan det virtuelle adresserum være større end RAM. Slidet: Raspberry Pi har et 64-bit adresserum (`2^64` = 16 exabytes, “16 billion GB”), men kun 4, 8 eller 16 GB installeret RAM (s. 14).',
            'Det hænger sammen med observationen fra `mem_alloc_demo.cpp`: `malloc()` af 100 MB giver et stykke virtuelt adresserum, og først når siderne “touches” med `memset()`, stiger det fysiske forbrug i `free -m` — se [[hukommelse-allokering|allokering]].',
          ],
        },
        {
          term: 'Paging og fragmentering',
          body: [
            'Med variable partitions kunne Process 12 ikke komme ind, selv om hullerne tilsammen var store nok (s. 13). Med paging er ethvert frit frame lige godt, så den **eksterne** fragmentering forsvinder: processen får bare nok frames, hvor de end ligger.',
            'Slidene nævner ikke prisen. Hvad paging koster — intern fragmentering i sidste page, page table-opslag ved hver adgang og TLB’en, der skal gøre dem hurtige — står under huller.',
          ],
        },
      ],
      viz: 'page-translation',
      keyPoints: [
        'Frames (fysisk) og pages (virtuel) har samme faste størrelse, typisk 4 KB–1 GB.',
        'Page table: page number → frame. Adresserummet må være ikke-sammenhængende.',
        'Adresse = `[p | d]`; `p` indekserer page table, `d` går uændret igennem.',
        '`page = ⌊va / size⌋`, `offset = va mod size`, `fysisk = f · size + offset`.',
        'Slide-eksemplet: page table 0→5, 1→6, 2→1, 3→2; va 0 → 20, va 3 → 23.',
        'Øvelsen: va 6 → 26 (`g`), va 13 → 9 (`n`).',
        'Virtuelt adresserum kan være større end RAM (`2^64` vs. 4–16 GB på Pi’en).',
        'Paging fjerner ekstern fragmentering.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Paging med page size = 4 bytes',
          source: '10.2-Week_11_-_Memory_management.pdf s. 16',
          code: `page table:  page 0 -> 5   page 1 -> 6   page 2 -> 1   page 3 -> 2
page = va / 4 (heltal)    offset = va mod 4
physical address = base address * page size + offset

va   page  offset   physical
 0     0     0      5 * 4 + 0 = 20    ('a')
 3     0     3      5 * 4 + 3 = 23    ('d')
 6     ?     ?      ? * 4 + ? = ??    <- øvelse: 1, 2, 6 * 4 + 2 = 26 ('g')
13     ?     ?      ? * 4 + ? = ??    <- øvelse: 3, 1, 2 * 4 + 1 =  9 ('n')

fysisk hukommelse:  0: -   4: i j k l   8: m n o p   12: -
                   16: -  20: a b c d  24: e f g h   28: -`,
        },
        {
          lang: 'text',
          title: 'Paging mechanism',
          source: '10.2-Week_11_-_Memory_management.pdf s. 15',
          code: `CPU -> logical address [ p | d ]
          p  -> index i page table -> f (base address for framen)
          d  -> uændret
physical address [ f | d ] -> frame f, position d i framen`,
        },
      ],
      exam: [
        'Paging deler fysisk hukommelse i frames og virtuel hukommelse i pages af samme faste størrelse, og en page table mapper hver page til en frame. Så behøver en proces ikke ligge sammenhængende, og den eksterne fragmentering fra first- og best-fit forsvinder.',
        'CPU’ens adresse deles i page number `p` og offset `d`. `p` slås op i page table og giver frame `f`; den fysiske adresse er `f` gange page size plus `d` — offset’et oversættes aldrig.',
        'Slidets eksempel har page size 4 og page table 0→5, 1→6, 2→1, 3→2. Virtuel adresse 6 ligger i page 1 med offset 2, page 1 ligger i frame 6, så den fysiske adresse er 6 · 4 + 2 = 26, hvor `g` ligger; 13 giver 2 · 4 + 1 = 9, altså `n`.',
        'Det virtuelle adresserum kan være langt større end RAM — Pi’en har 64-bit adresser, men kun 4–16 GB — og det er derfor, `malloc()` kan give 100 MB, der først bliver fysisk, når man skriver i dem.',
        'Afvejningen, som slidene ikke tager op: hver adgang kræver et opslag i page table, og den sidste page i en proces er sjældent fuld. Det er uden for pensum, men værd at nævne som prisen for at slippe af med ekstern fragmentering.',
      ],
      sources: [
        { path: MEM_MD, original: MEM_PDF, pages: 's. 13–16, 18' },
        { path: k('data/lecture-code-main/lecture-code-main/week_11_memory_management/src/mem_alloc_demo.cpp'), note: 'Observationen om virtuel vs. fysisk forbrug' },
      ],
      gaps: [
        'Slide 16 lader rækkerne for virtuel adresse 6 og 13 stå som `?` (øvelse). Markdown-konverteringen har udfyldt dem (26 og 9); tallene her er regnet med slidets egen page table og stemmer med den fysiske hukommelse på figuren.',
        'Slidene kalder værdien i page table “base address f” (s. 15–16), men bruger den som et frame-nummer, der ganges med page size (`5 * 4 + 0 = 20`). Base-adressen er altså `f · page size`, ikke `f`.',
        'Markdown-konverteringen skriver, at “hver proces har sin egen page table”; det står ikke på slidene.',
        '**TLB**, **intern fragmentering**, valid/invalid-bits, page faults, swap og hierarkiske page tables nævnes ikke i materialet. Bogens kapitel om main memory (hvor paging står) er ikke med i `data/bogen/` eller `context/book/`. Uden for materialet: TLB’en er en lille hardware-cache over page table-opslag; intern fragmentering er i gennemsnit en halv page pr. proces.',
        'Uden for materialet: “Raspberry Pi uses a 64-bit memory address space (2^64 …)” (s. 14) er forenklet — ARMv8-processorer bruger typisk 48 bit af den virtuelle adresse, så det reelle virtuelle adresserum er mindre end `2^64`.',
      ],
      keywords: ['paging', 'page', 'side', 'frame', 'ramme', 'page table', 'sidetabel', 'page number', 'page offset', 'p', 'd', 'frame number', 'base address', 'logical address', 'physical address', 'adresseoversættelse', 'address translation', 'page size', 'non-contiguous', 'ekstern fragmentering', 'intern fragmentering', 'TLB', 'virtuel hukommelse', '2^64', 'exabyte', 'MMU'],
    },

    {
      slug: 'raii',
      title: 'RAII og automatisk ressourcehåndtering',
      short: 'RAII',
      week: 'Uge 11 · L11.1',
      definition:
        '**RAII** (Resource Acquisition Is Initialization) binder en ressource til et objekts levetid: ressourcen erhverves i konstruktøren og frigives i destruktøren, som C++ kalder, når objektet går ud af scope — også når en exception forlader scopet. Det løser fem problemer ved manuel håndtering: memory leaks, resource leaks, exception safety, ownership ambiguity og non-deterministic cleanup.',
      concepts: [
        {
          term: 'Fem problemer ved manuel ressourcehåndtering',
          body: [
            'Tabellen på s. 3 er decket i én slide: **Memory leaks** — man glemmer `delete`; automatisering giver automatic deallocation. **Resource leaks** — man glemmer at lukke filer/sockets; automatic cleanup. **Exception safety** — oprydning springes over ved `throw`; “destructors always run”. **Ownership ambiguity** — flere ejere sletter; et klart ejerskabsmodel. **Non-deterministic cleanup** — forsinket oprydning; “immediate release at scope end”.',
            'Resten af decket tager dem ét ad gangen med en manuel og en automatiseret version side om side (s. 6–10). Citatet på s. 2, der opsummerer det samme, er fra ChatGPT — med forelæserens egen kommentar: “NEVER cite ChatGPT”.',
          ],
        },
        {
          term: 'Idiomet: erhverv i konstruktøren, frigiv i destruktøren',
          body: [
            'Man har allerede set RAII i case’en: `std::unique_lock<std::mutex> lock(game->gameMutex);` i `GameController::gameControllerThread()` låser i konstruktøren, og låsen frigives “as soon as it runs out of scope” i slutningen af hver løkke-iteration. “The RAII idiom guarantees, by design, that the Mutex resource is left in a desired state” (s. 4). Låsene selv står i [[mutex-spinlock|mutex og spinlock]].',
            'Kursets `raii.cpp` (s. 5, hvor klassen hedder `RaiiPointer`) er en minimal smart pointer: en template `RAII<T>` med en `explicit` konstruktør, der tager en `T*`, og en destruktør `~RAII() { delete p_; }` — “This is the magic!!!” — plus `operator*` og `operator->`, så objektet bruges som en pointer (“smart pointer idiom”). I `main` bliver `RAII<std::vector<int>> v(new std::vector<int> {1,2,3})` slettet automatisk, når `main` slutter, uden et eneste `delete` i brugerkoden.',
          ],
        },
        {
          term: 'Memory leaks og resource leaks',
          body: [
            'Manuelt skal hvert `new`/`malloc` parres med `delete`/`free`. I slidets eksempel oprettes `int *p = new int {42};` i et scope, der slutter uden `delete` — “Oops! Forgot to delete p”. Med `std::unique_ptr<int> p = std::make_unique<int>(42);` frigives hukommelsen, når `p` går ud af scope (s. 6).',
            'Det gælder ikke kun hukommelse: file handles, sockets, mutexes og GPU-buffere kan også løbe tør. `FILE* file = fopen("data.txt", "w")` uden `fclose` er en resource leak; `std::ofstream file("data.txt")` implementerer RAII og lukker filen ved scope exit. Pointen: pak hver ressource i et objekt, hvis destruktør frigiver den, så den ryddes op “even in complex control flows or exceptions” (s. 7).',
          ],
        },
        {
          term: 'Exception safety',
          body: [
            'I `manual()` kaldes `m.lock()`, så `operation_that_may_trow_ex()`, så `m.unlock()`. Kaster operationen, springes `unlock()` over, og slidet nævner netop “wrong states (E.g. Mutex is kept locked)” — enhver tråd, der siden vil have låsen, blokerer. I `automated()` tages låsen med `std::lock_guard<std::mutex> lock(m);`, og “if ex thrown, lock still released automatically” (s. 8).',
            'Slidets regel: “RAII destructors always run! Even if an exception is thrown — guaranteeing cleanup and preventing leaks.” Det er grunden til, at man i kurset aldrig kalder `unlock()` i hånden i kode, der kan kaste.',
          ],
        },
        {
          term: 'Deterministisk oprydning',
          body: [
            'Nogle ressourcer — filer, låse, sockets — skal frigives *med det samme*, ikke “sometime later…”. I slidets manuelle eksempel glemmes `fclose(file)`, og `log.txt` er åben, til programmet terminerer (s. 10).',
            'Den automatiserede version lægger `std::ofstream file("log.txt")` i et **ekstra scope**; filen lukkes ved den afsluttende `}`, og det er “safe to reopen "log.txt" immediately”. Garbage collection kan ikke garantere, hvornår destruktører kører; RAII giver “deterministic destruction at scope exit”. Et ekstra `{ }` er altså et værktøj til at styre, præcis hvornår en ressource slippes.',
          ],
        },
        {
          term: 'Fra ejerskab til smart pointers',
          body: [
            'Det femte problem, ownership ambiguity (s. 9), handler om, *hvem* der skal rydde op: to rå pointere til samme objekt, `delete a; delete b;` → double delete og undefined behavior. RAII alene løser det ikke — `raii.cpp`’s klasse har samme problem, hvis den kopieres. Løsningen er smart pointers, der “encode ownership rules (single, shared or non-owning)”: se [[smart-pointers|smart pointers]].',
          ],
        },
      ],
      viz: 'raii-scope',
      keyPoints: [
        'RAII: erhverv i konstruktøren, frigiv i destruktøren, destruktøren kaldes ved scope exit.',
        'Fem problemer: memory leaks, resource leaks, exception safety, ownership ambiguity, non-deterministic cleanup.',
        '`std::unique_lock`/`std::lock_guard` er RAII for mutexes — låsen slippes, selv om der kastes.',
        '`std::ofstream` lukker filen ved scope exit; `fopen` kræver `fclose`.',
        'Destruktører kører altid, også ved exceptions.',
        'Et ekstra `{ }`-scope styrer, præcis hvornår ressourcen frigives.',
        'GC kan ikke garantere hvornår; RAII er deterministisk.',
        '`raii.cpp`: `~RAII() { delete p_; }` + `operator*`/`operator->` = en minimal smart pointer.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'raii.cpp — en minimal RAII-pointer',
          source: 'lecture-code-main/week_11_automated_resource_management/raii.cpp (som RaiiPointer i 11.1 s. 5)',
          code: `#include <vector>
#include <iostream>

template <typename T>
class RAII {
public:
    explicit RAII(T* p = 0) : p_(p) {}
    ~RAII() { delete p_; }

    // Smart pointer idiom
    T& operator*() const { return *p_; }
    T* operator->() const { return p_; }

private:
    T* p_;
};

int main() {
    RAII<std::vector<int>> v(new std::vector<int> {1,2,3});
    std::cout << v->size() << std::endl;
}`,
        },
        {
          lang: 'cpp',
          title: 'Exception safety: manuel lås vs. lock_guard',
          source: '11.1-Automatic_ressource_management.pdf s. 8',
          code: `std::mutex m;

void manual() {
    m.lock();        // Lock acquired
    operation_that_may_trow_ex();
    m.unlock();
} // Exception may change program flow!

void automated() {
  std::lock_guard<std::mutex> lock(m); // lock acquired
  operation_that_may_trow_ex();
} // if ex thrown, lock still released automatically`,
        },
        {
          lang: 'cpp',
          title: 'Deterministisk oprydning med et ekstra scope',
          source: '11.1-Automatic_ressource_management.pdf s. 10',
          code: `// Manual
{
    FILE* file = fopen("log.txt", "w");
    fprintf(file, "Start logging...\\n");
    // forgot fclose(file);
    // file remains open until program termination
}

// Automated
{
    { // Extra scope
        std::ofstream file("log.txt");
        file << "Start logging...\\n";
    } // file automatically closed right here!
    // safe to reopen "log.txt" immediately
}`,
        },
        {
          lang: 'cpp',
          title: 'RAII i case’en: scoped lock i en løkke',
          source: '11.1-Automatic_ressource_management.pdf s. 4',
          code: `void GameController::gameControllerThread() {
    while (game->running) {
        std::unique_lock<std::mutex> lock(game->gameMutex);
       // Critical section
    } // lock goes out of scope here, and is automatically freed
}`,
        },
      ],
      exam: [
        'RAII — Resource Acquisition Is Initialization — betyder, at en ressource erhverves i et objekts konstruktør og frigives i dets destruktør. C++ kalder destruktøren, når objektet går ud af scope, så oprydningen sker automatisk og på et kendt tidspunkt.',
        'Decket nævner fem problemer ved manuel håndtering: memory leaks, resource leaks som en glemt `fclose`, exception safety, ownership ambiguity og non-deterministic cleanup. RAII løser de fire direkte; ejerskab kræver smart pointers.',
        'Kursets `raii.cpp` viser mekanismen: en template-klasse, der gemmer en rå pointer og kalder `delete` i destruktøren, med `operator*` og `operator->`, så den bruges som en pointer. I `main` slettes vektoren automatisk, uden at brugeren skriver `delete`.',
        'Exception safety er det stærkeste argument: kalder man `m.lock()`, en funktion der kaster og så `m.unlock()`, forbliver mutexen låst. Med `std::lock_guard` kører destruktøren også ved en exception, så låsen altid slippes — ligesom `unique_lock` i case’ens `gameControllerThread`.',
        'Faldgruben: en hjemmelavet RAII-klasse som `raii.cpp` kan kopieres, og så sletter begge kopier samme pointer. Derfor bruger man i praksis `std::unique_ptr`, der forbyder kopiering, og et ekstra `{ }`-scope, hvis ressourcen skal slippes tidligt.',
      ],
      sources: [
        { path: ARM_MD, original: ARM_PDF, pages: 's. 2–10' },
        { path: k('context/kode/SW3SYS-01_Code_week_11_automated_resource_management.md') },
        { path: k('data/lecture-code-main/lecture-code-main/week_11_automated_resource_management/raii.cpp') },
      ],
      gaps: [
        'Slide 4 udfolder forkortelsen som “Resouce Allocation Is Initialization”. Den gængse (og markdown-konverteringens) form er *Resource Acquisition Is Initialization*.',
        'Slidene siger “destructors always run”, men nævner ikke **stack unwinding**. Uden for materialet: det er C++’s navn for, at lokale objekters destruktører kaldes, mens en exception forlader scopes på vej op til en `catch`. Bliver exceptionen aldrig fanget, kaldes `std::terminate`, og det er implementation-defined, om der overhovedet unwindes — så “always” gælder kun, når exceptionen fanges et sted.',
        'Uden for materialet: `RAII`/`RaiiPointer` har compiler-genereret copy-konstruktør og copy-assignment; `RAII<int> b = a;` giver double delete. Rule of three/five og `= delete` nævnes ikke i decket; `std::unique_ptr` (s. 12) løser det ved at forbyde kopiering.',
        'Slide 5 kalder klassen `RaiiPointer` med destruktøren skrevet `~ RaiiPointer()`; kursets fil kalder den `RAII`. Slidene staver `operation_that_may_trow_ex()` (s. 8).',
        'Bogens kapitler (1, 3–8) nævner ikke RAII; emnet findes kun i slides og kode. Kobling til OOP-faget (klasser, konstruktør/destruktør i C++) er ikke lavet endnu, fordi OOP ikke er udfyldt.',
      ],
      keywords: ['RAII', 'Resource Acquisition Is Initialization', 'Resouce Allocation Is Initialization', 'destruktør', 'destructor', 'konstruktør', 'scope', 'scope exit', 'stack unwinding', 'exception safety', 'memory leak', 'resource leak', 'ownership ambiguity', 'deterministic cleanup', 'garbage collection', 'lock_guard', 'unique_lock', 'ofstream', 'fopen', 'fclose', 'RaiiPointer', 'raii.cpp', 'smart pointer idiom', 'operator->', 'double delete'],
    },

    {
      slug: 'smart-pointers',
      title: 'Smart pointers: unique_ptr, shared_ptr, weak_ptr',
      short: 'Smart pointers',
      week: 'Uge 11 · L11.1',
      definition:
        '**Smart pointers** er RAII-klasser, der ejer et objekt via en pointer og sletter det automatisk. `std::unique_ptr` giver eksklusivt ejerskab og kan kun flyttes; `std::shared_ptr` giver delt ejerskab med **reference counting**; `std::weak_ptr` er en ikke-ejende reference til et `shared_ptr`-objekt, der bryder cirkulære afhængigheder.',
      concepts: [
        {
          term: 'Fire varianter',
          body: [
            'Smart pointers “helps mitigating the problems previously described” (s. 11). Tabellen: `std::auto_ptr` (C++98) — deprecated; `std::unique_ptr` (C++11) — exclusive resource ownership; `std::shared_ptr` (C++11) — shared resource ownership; `std::weak_ptr` (C++11) — borrowed resource ownership. “All smart pointers implement RAII”, dvs. de bygger på det samme som [[raii|RAII]]-klassen i `raii.cpp`.',
            'Ownership ambiguity-slidet (s. 9) viser motivationen: `Data* a = new Data(); Data* b = a; delete a; delete b;` giver double delete og undefined behavior. Med `std::shared_ptr<Data> a = std::make_shared<Data>(); std::shared_ptr<Data> b = a;` deles ejerskabet, og objektet slettes, når reference count når nul. Smart pointers gør ejerskab — single, shared eller non-owning — eksplicit.',
          ],
        },
        {
          term: '`std::unique_ptr`: eksklusivt ejerskab og move',
          body: [
            'Definitionen fra cppreference (s. 12): en `unique_ptr` “owns (is responsible for) and manages another object via a pointer and subsequently disposes of that object when the unique_ptr goes out of scope”.',
            'Kursets `unique_pointer.cpp`: `std::unique_ptr<int> p = std::make_unique<int>(42);` opretter objektet. `std::unique_ptr<int> q = p;` er udkommenteret — “Copy NOT allowed!!”. `std::unique_ptr<int> q = std::move(p);` **flytter** ejerskabet, så `p` er tom bagefter. `q.reset(new int {53});` sletter 42 og peger på 53, og `*q` udskriver `53`.',
            'Slidet understreger to ting: “Does NOT support copy semantics” og “No overhead compared to raw pointers!!!”. Det er derfor, s. 20 anbefaler den som standardvalget.',
          ],
        },
        {
          term: '`std::shared_ptr` og reference count',
          body: [
            'Flere `shared_ptr`-objekter kan eje samme objekt. Objektet destrueres, når den **sidste** ejende `shared_ptr` destrueres, eller når den tildeles en anden pointer via `operator=` eller `reset()` (s. 13). Den bruger *reference counting* til at holde styr på, om nogen stadig bruger objektet — “C++’s version of Garbage Collection”. Operationer som `shared_ptr::reset` er thread safe.',
            'Kursets `shared_pointer.cpp` (s. 14): `val = std::make_shared<int>(int{43})` giver count 1. `std::thread t1{thr, 1, val}, t2{thr, 2, val};` kopierer `val` ind i hver tråd, så count er 3. `val.reset()` slipper main’s ejerskab (count 2). Hver tråd låser `cout_mtx`, udskriver værdien og lægger 1 til. Når begge tråde er færdige, er count 0, og int’en slettes — slidets kommentar: “Last reference removed, content of val is deleted”.',
            'Bemærk, at mutexen i `thr` stadig er nødvendig: reference count’en er trådsikker, men `*data += 1` på det delte objekt er ikke. Tråde og låse står i [[traade|tråde]] og [[mutex-spinlock|mutex]].',
          ],
        },
        {
          term: '`std::weak_ptr`: ikke-ejende reference',
          body: [
            'cppreference (s. 15): en `weak_ptr` “holds a non-owning (‘weak’) reference to an object that is managed by std::shared_ptr. It must be converted to std::shared_ptr in order to access the referenced object.”',
            'Den **tæller ikke reference count op** — “So it owns NO resource!!!” — og er “useful to help break circular dependencies”. Adgang sker med `lock()`, der returnerer en `shared_ptr`: tom, hvis objektet allerede er slettet, ellers en midlertidig ejer, der holder objektet i live, mens den bruges.',
          ],
        },
        {
          term: 'Case: Broker og Consumer i messaging-systemet',
          body: [
            'Decket bruger [[messaging-system|messaging-systemet]] som eksempel. `Broker` har `subscribers : std::map<std::string, std::vector<…>>`, `subscribe(topic, consumer)` og `publish(topic, msg)`, som løber topic’ens consumers igennem og kalder `onMessage(msg)`. Consumer afhænger af Broker, og Broker holder Consumers: “Circular dependency!” (s. 16).',
            '**Rå reference/pointer** (s. 16): slettes en Consumer i main’s scope, giver `onMessage` undefined behaviour. **`shared_ptr<Consumer>`** (s. 17): nu holder Broker en reference, så Consumer bliver *ikke* slettet, når main er færdig med den — brokeren holder den kunstigt i live. **`weak_ptr<Consumer>`** (s. 18): `subscribe` tager stadig en `shared_ptr`, men listen gemmer `weak_ptr`. I `publish` giver `if (auto d = c.lock())` midlertidigt ejerskab: er Consumer slettet, er `d` tom og springes over; slettes den i main, mens den er låst lokalt, dør den først, når `d` går ud af scope.',
          ],
        },
        {
          term: 'Function parameter ownership',
          body: [
            'Tabellen på s. 19 (fra CppCon20 *Back to basics – Smart Pointers*) siger, hvad en signatur lover. Manuelt: `func(value)` er uafhængig ejer og sletter ressourcen ved slutningen af `func` (COPY); `func(pointer*)` låner, ressourcen kan være tom, må ikke slettes; `func(reference&)` låner, ressourcen kan *ikke* være tom, må ikke slettes.',
            'Automatisk: `func(std::unique_ptr)` er uafhængig ejer og sletter ved slutningen af `func` (MOVE — kalderen skal `std::move` ind); `func(shared_ptr)` er delt ejer og *kan* slette ressourcen ved slutningen af `func`, hvis den er den sidste. Det er præcis det, der sker med `thr(int id, std::shared_ptr<int> data)` i `shared_pointer.cpp`.',
          ],
        },
        {
          term: '`unique_ptr` eller `shared_ptr`?',
          body: [
            'Slide 20: det er fristende at bruge `shared_ptr`, fordi den rydder op og gør deling let. Men spørg, om der virkelig er brug for delt ejerskab — skal flere tråde reelt tilgå og styre samme ressource samtidig? Hvis ikke, er designet “simpler, faster, and safer with std::unique_ptr and move semantics”. Færre ejere giver færre synkroniseringsproblemer. Brug `shared_ptr` og `weak_ptr` kun, når delt ejerskab er nødvendigt, og gør det bevidst.',
          ],
        },
      ],
      viz: 'shared-refcount',
      keyPoints: [
        '`auto_ptr` (C++98) er deprecated; `unique_ptr`, `shared_ptr`, `weak_ptr` er C++11. Alle er RAII.',
        '`unique_ptr`: eksklusiv ejer, ingen kopi, `std::move` flytter, ingen overhead ift. rå pointer.',
        '`reset(new int {53})` sletter det gamle objekt og overtager det nye.',
        '`shared_ptr`: reference count; objektet slettes, når sidste ejer destrueres eller `reset()`/`operator=`.',
        'Reference count er trådsikker — adgang til objektet er ikke. Derfor mutexen i `thr`.',
        '`weak_ptr` tæller ikke op; `lock()` giver en midlertidig `shared_ptr` eller en tom.',
        'Broker med `shared_ptr` holder Consumers i live; med `weak_ptr` kan de dø.',
        'Parametre: `unique_ptr` = MOVE og ejer; `shared_ptr` = delt ejer; `*` og `&` låner.',
        'Standardvalg: `unique_ptr`. `shared_ptr` kun ved reelt delt ejerskab.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'unique_pointer.cpp — move i stedet for kopi',
          source: 'lecture-code-main/week_11_automated_resource_management/unique_pointer.cpp (også 11.1 s. 12)',
          code: `#include <memory>
#include <iostream>

int main() {
    std::unique_ptr<int> p = std::make_unique<int>(42);

    // std::unique_ptr<int> q = p; // Copy NOT allowed!!

    std::unique_ptr<int> q = std::move(p); // Move ownership

    q.reset(new int {53}); // delete 42 and point to 53

    std::cout << *q << std::endl;
}`,
        },
        {
          lang: 'cpp',
          title: 'shared_pointer.cpp — delt ejerskab på tværs af tråde',
          source: 'lecture-code-main/week_11_automated_resource_management/shared_pointer.cpp (også 11.1 s. 14)',
          code: `#include <memory>
#include <iostream>
#include <mutex>
#include <thread>

std::mutex cout_mtx;

void thr(int id, std::shared_ptr<int> data) {
    std::lock_guard<std::mutex> cout_lck(cout_mtx);
    std::cout << "Thread " << id << " data: " << *data << std::endl;
    *data += 1; // add 1 to value
}

int main () {
    std::shared_ptr<int> val = std::make_shared<int>(int{43});

    std::thread t1{thr, 1, val}, t2{thr, 2, val};
    val.reset(); // release ownership from main

    t1.join();
    t2.join();
}`,
        },
        {
          lang: 'cpp',
          title: 'Broker::publish med weak_ptr',
          source: '11.1-Automatic_ressource_management.pdf s. 18',
          code: `void Broker::publish(const std::string& topic, const Message& msg) {
  std::lock_guard<std::mutex> lock(mtx);
  auto it = subscribers.find(topic);
  if (it != subscribers.end()) {
    for (weak_ptr<Consumer> c : it->second) {
      if (auto d = c.lock()) // Get temp ownership
        d->onMessage(msg);
    }
  }
}`,
        },
        {
          lang: 'cpp',
          title: 'Ownership ambiguity: rå pointer vs. shared_ptr',
          source: '11.1-Automatic_ressource_management.pdf s. 9',
          code: `struct Data { int value; };

void manual() {
  Data* a = new Data();
  Data* b = a; // both point to same obj
  delete a;
  delete b;    // double delete -> undefined behavior
}

void automated() {
    std::shared_ptr<Data> a = std::make_shared<Data>();
    std::shared_ptr<Data> b = a; // shared ownership
} // reference count drops to zero -> deleted automatically`,
        },
      ],
      exam: [
        'Smart pointers er RAII-klasser, der ejer et objekt og sletter det automatisk, og de gør ejerskab eksplicit: `unique_ptr` er én ejer, `shared_ptr` er delt ejerskab, og `weak_ptr` er en ikke-ejende reference.',
        '`unique_ptr` kan ikke kopieres, kun flyttes med `std::move`, og har ingen overhead ift. en rå pointer. I kursets `unique_pointer.cpp` flytter vi 42 fra `p` til `q`, og `q.reset(new int {53})` sletter 42.',
        '`shared_ptr` bruger reference counting: i `shared_pointer.cpp` starter count på 1, bliver 3, når de to tråde får hver sin kopi, 2 efter `val.reset()`, og int’en slettes, når den sidste tråd er færdig. Reference count’en er trådsikker, men selve værdien er ikke — derfor låser `thr` en mutex.',
        '`weak_ptr` tæller ikke op og skal `lock()`’es til en `shared_ptr` for at blive brugt. I messaging-systemet holder en broker med `shared_ptr<Consumer>` consumerne i live, selv om main har sluppet dem; med `weak_ptr` returnerer `lock()` en tom pointer for døde consumers, og brokeren springer dem over.',
        'Afvejningen fra slidene: `shared_ptr` er fristende, men flere ejere betyder flere synkroniseringsproblemer og uklart design. Brug `unique_ptr` og move semantics som standard, og `shared_ptr`/`weak_ptr` kun, når flere reelt skal eje ressourcen.',
      ],
      sources: [
        { path: ARM_MD, original: ARM_PDF, pages: 's. 9, 11–20' },
        { path: k('context/kode/SW3SYS-01_Code_week_11_automated_resource_management.md') },
        { path: k('data/lecture-code-main/lecture-code-main/week_11_automated_resource_management/unique_pointer.cpp') },
        { path: k('data/lecture-code-main/lecture-code-main/week_11_automated_resource_management/shared_pointer.cpp') },
      ],
      gaps: [
        '**Control block** nævnes ikke på slidene. Kun markdown-konverteringen af koden (`context/kode/…automated_resource_management.md`, linje 216) skriver, at `make_shared` allokerer int og control block i ét kald. Uden for materialet: control block’en holder strong og weak count; objektet slettes ved strong count 0, control block’en først når også weak count er 0.',
        'Den klassiske **cyklus-lækage** — to objekter, der peger på hinanden med `shared_ptr`, så count aldrig når 0 — vises ikke. Decket siger kun, at `weak_ptr` hjælper med at bryde “circular dependencies”, og dets eksempel (s. 16–18) handler om, at brokeren holder consumers i live, ikke om en ægte reference-cyklus.',
        'Slide 13: “Operations, ex. shared_ptr::reset are thread safe!” Uden for materialet: det gælder reference count’en og operationer på *forskellige* `shared_ptr`-objekter; samme `shared_ptr`-objekt fra flere tråde uden lås, og det udpegede objekt, er ikke beskyttet — derfor `cout_mtx` i `thr`.',
        'Kommentarerne på s. 14 knytter referencernes fjernelse til `t1.join()`/`t2.join()`. Uden for materialet: trådens kopi af `data` destrueres, når trådfunktionen returnerer, ikke ved `join()`, og rækkefølgen af de to tråde er ikke givet — output kan være tråd 2 før tråd 1.',
        'Koden på s. 16 er ikke gyldig C++: `for (Consumer& c : it->second) c->onMessage(msg);` bruger `->` på en reference, og `std::vector<Consumer>` gemmer kopier, så en Consumer slettet i main ville ikke påvirke brokerens kopi. Pointen (dangling reference ved rå pointere) er klar nok, men koden må ikke gengives ordret til eksamen.',
        'Slidets kode (s. 14) bruger mutexen `mtx`, kursets fil `cout_mtx`, og filen har en udkommenteret `//#include <lock_guard>` (headeren findes ikke; `lock_guard` ligger i `<mutex>`).',
        'Stavefejl på slidene: “std::share_ptr”, “DEPRICATED”, “resouce” (s. 11) og “Special version of std::shared_pointer” (s. 15) — `weak_ptr` er en selvstændig klasse, ikke en variant af `shared_ptr`. “Four different flavours” inkluderer den forældede `auto_ptr`.',
        'Bogen dækker ikke smart pointers. Tværlink til OOP-faget (C++-klasser og ejerskab) mangler, fordi OOP ikke er udfyldt endnu.',
      ],
      keywords: ['smart pointer', 'unique_ptr', 'shared_ptr', 'weak_ptr', 'auto_ptr', 'make_unique', 'make_shared', 'std::move', 'move semantics', 'reset', 'lock', 'use_count', 'reference count', 'reference counting', 'control block', 'ownership', 'ejerskab', 'exclusive ownership', 'shared ownership', 'non-owning', 'circular dependency', 'cyklus', 'dangling pointer', 'double delete', 'Broker', 'Consumer', 'onMessage', 'function parameter ownership', 'CppCon', 'unique_pointer.cpp', 'shared_pointer.cpp'],
    },
  ],
}
