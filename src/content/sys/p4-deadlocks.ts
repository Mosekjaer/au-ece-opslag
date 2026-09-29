import type { Part } from '../types'
import { k } from './paths'

const BOOK = 'Silberschatz, Operating System Concepts (Global Edition)'

export const deadlocks: Part = {
  id: 'deadlocks',
  title: 'Deadlocks og klassiske problemer',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'dining-philosophers',
      title: 'Dining philosophers',
      week: 'Uge 6 · L6.1',
      definition:
        '**Dining philosophers** er det klassiske problem om at fordele flere ressourcer mellem flere tråde uden deadlock og uden starvation. Fem filosoffer sidder om et bord med fem spisepinde; en filosof skal have begge sine nabopinde for at spise. Kurset modellerer det med én tråd pr. filosof og én mutex pr. spisepind og går fra en naiv løsning, der deadlocker, over `try_lock` til en løsning med condition variables.',
      concepts: [
        {
          term: 'Problemet og modellen',
          body: [
            'Filosofferne tænker og spiser på skift. En sulten filosof prøver at tage de to spisepinde ved siden af sig, **én ad gangen**. Mens hun spiser, holder hun begge og lægger dem først, når hun er færdig. Er en pind taget, må hun vente (06.1 s. 2).',
            'Slidet vælger modellen “one Thread per philosopher and one Lock per chopstick”. Bordet har filosofferne `P0`–`P4` og pindene `C0`–`C4`. I koden er `right = phil` og `left = (phil + 1) % 5`, så `P0` bruger `C0` og `C1`, og `P4` bruger `C4` og `C0`.',
            'Bogen (7.1.3) kalder problemet “a simple representation of the need to allocate several resources among several processes in a deadlock-free and starvation-free manner” og understreger, at det er vigtigt som eksempel på concurrency-kontrol, ikke for sin praktiske værdi. Bogens semaforversion er den samme som slidets naive version: `semaphore chopstick[5]`, alle initialiseret til 1, og `wait(chopstick[i])` efterfulgt af `wait(chopstick[(i+1) % 5])` (figur 7.6).',
          ],
        },
        {
          term: 'Naiv implementering og “taking turns”',
          body: [
            'Den naive lambda (06.1 s. 3) spiser 100 gange: `chopstick[right].lock()`, `chopstick[left].lock()`, spis (`sleep_for(1 µs)`), lås op i omvendt rækkefølge. Hver filosof holder altså højre pind, mens hun blokerer på venstre.',
            'Tabellen “Taking turns” (s. 4) viser uheldet: ved `t = 0…4` tager `P0`–`P4` hver sin højre pind `C0`–`C4`. Ved `t = 5` prøver `P0` at tage `C1` — låst af `P1`. Ved `t = 6` prøver `P1` `C2` — låst. Ved `t = 7` `P2` `C3` — låst. Alle holder én og venter på én: “Deadlocked…”.',
            'Bogen beskriver samme scenarie spejlvendt: alle fem bliver sultne samtidig og griber den venstre pind, så alle elementer i `chopstick` bliver 0, og “she will be delayed forever” (s. 316).',
          ],
        },
        {
          term: 'RAG for filosofferne',
          body: [
            'Slide 5 tegner problemet som en ressourceallokeringsgraf (se [[deadlock-betingelser|Coffman-betingelser og RAG]]). I udgangstilstanden har hver `Pi` to *requests*-kanter, én til hver nabopind. Når hver filosof har fået sin højre pind, vender den ene kant til en *allocated*-kant `Ci → Pi`, og resten danner ringen `P0 → C1 → P1 → C2 → P2 → C3 → P3 → C4 → P4 → C0 → P0` — mærket “Circular Wait”.',
            'Da hver spisepind kun findes i én instans, er cyklussen ikke bare en mulighed for deadlock: den **er** en deadlock (05.1 s. 8).',
          ],
        },
        {
          term: '“A Solution?” — lavest nummer først og slip igen',
          body: [
            'Slide 6 tilføjer to krav: 1) en filosof skal tage den **lavest nummererede** pind først; 2) er den højere pind ikke ledig, skal den lavere slippes igen. Konklusionen er “No cycle → Solution*”, med fodnoten “When there is only one instance of each ressource (chopstick)”. Grafen på slidet viser en tilstand, hvor `P0` har `C0` og `C1` og `P2` har `C2` og `C3`, mens `P1`, `P3` og `P4` kun har requests — ingen cyklus.',
            'Krav 1 bryder **circular wait** (en total ordning, som i [[deadlock-haandtering|lock ordering]]); krav 2 bryder **hold and wait**. Slidet stiller to åbne spørgsmål: “Will someone starve to death?” og “How can the additional requirements be implemented?”.',
            'Bogen giver tre andre løsninger på deadlocken: højst fire filosoffer ved bordet ad gangen; tag kun pindene, hvis **begge** er ledige (i en kritisk sektion); eller en asymmetrisk løsning, hvor ulige filosoffer tager venstre først og lige tager højre først (s. 316). Den tilføjer: “A deadlock-free solution does not necessarily eliminate the possibility of starvation” (s. 317).',
          ],
        },
        {
          term: 'Less naive: try_lock og busy-wait',
          body: [
            'Slide 7 svarer på “how” med `try_lock()`: filosoffen låser højre pind og kalder `chopstick[left].try_lock()`. Lykkes det ikke, låser hun højre op igen og prøver forfra (`continue`) i en `while (true)`. Slidets dom: “Will not deadlock, but will busy wait in while(true) loop”.',
            'Koden implementerer krav 2 (slip, hvis den anden ikke er ledig), men ikke krav 1: `P4` tager stadig `C4` før `C0`. Det er udgivelsen af den holdte lås, der fjerner hold and wait. Prisen er, at tråden bruger CPU på at spinne i stedet for at sove.',
            'Bogen viser præcis dette mønster — `lock` på den ene, `trylock` på den anden, slip ved fejl — som eksempel på **livelock** (figur 8.2, s. 346): to tråde kan blive ved med at tage, fejle og slippe i takt uden at blokere og uden at komme videre. Bogens råd er et tilfældigt backoff mellem forsøgene. Slidet nævner ikke livelock.',
          ],
        },
        {
          term: 'Løsningen med condition variables',
          body: [
            'Slide 8 motiverer skiftet: en mutex “cannot notify availability of a ressource to other threads” — man må polle. Løsningen (s. 16–18) bruger tre slags objekter: en fælles `table_mtx`, en mutex pr. pind `chopstick_mtx[i]` og en condition variable pr. pind `chopstick_cv[i]`. Selve CV-mekanikken (`wait` frigiver mutexen atomisk og generhverver den ved opvågning) står under [[monitor-cv|monitorer og condition variables]].',
            'Flowchartet (s. 17): tag `unique_lock<std::mutex> table_lock(table_mtx)`. Fejler `chopstick_mtx[right].try_lock()`, så vent på `chopstick_cv[right]`. Lykkes højre, men `chopstick_mtx[left].try_lock()` fejler, så lås højre op og vent på `chopstick_cv[left]`. Lykkes begge, så `break`, lås bordet op, spis, og lås hver pind op efterfulgt af en notify på dens CV; tænk; gentag mens `i < 100`.',
            'Fordi al afprøvning sker under `table_mtx`, tjekkes begge pinde i én kritisk sektion — bogens løsning nr. 2 (“only if both chopsticks are available”). En filosof holder aldrig én pind, mens hun sover; hun sover på en CV og bruger ingen CPU, mens hun venter.',
          ],
        },
        {
          term: 'Bogens monitorløsning (7.1.3.2)',
          body: [
            'Bogen løser problemet med en monitor `DiningPhilosophers`, der kun lader en filosof tage pindene, hvis begge er ledige. Hver filosof har en tilstand `enum {THINKING, HUNGRY, EATING} state[5]`, og filosof `i` må kun sætte `state[i] = EATING`, hvis `state[(i+4) % 5] != EATING` og `state[(i+1) % 5] != EATING`. `condition self[5]` lader en sulten filosof vente på sig selv.',
            'Brugen er `DiningPhilosophers.pickup(i)`, spis, `DiningPhilosophers.putdown(i)`. Bogen konkluderer, at ingen naboer spiser samtidig og at der ikke opstår deadlock, men “it is possible for a philosopher to starve to death” — og overlader løsningen til læseren (s. 317).',
          ],
        },
      ],
      viz: 'dining-philosophers',
      keyPoints: [
        'Fem filosoffer, fem pinde; én tråd pr. filosof, én mutex pr. pind.',
        'Naiv version: alle tager højre pind → alle venter på venstre → circular wait → deadlock.',
        'Én instans pr. pind, så cyklussen i RAG’en er en deadlock, ikke kun en mulighed.',
        'Lavest nummer først bryder circular wait; “slip igen” bryder hold and wait.',
        '`try_lock`-versionen deadlocker ikke, men busy-waiter — og bogen viser, at mønstret kan give livelock.',
        'CV-versionen tjekker begge pinde under `table_mtx` og sover på `chopstick_cv[i]` i stedet for at spinne.',
        'Bogens monitor: `state[5]` og `condition self[5]`; spis kun hvis ingen nabo spiser.',
        'Deadlock-fri er ikke det samme som starvation-fri — hverken slides eller bog løser starvation.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Naiv implementering — kan deadlocke',
          source: '06.1-Synchronisation-Examples.pdf s. 3',
          code: `auto philosopher = [&](int phil)
{
   int right = phil;             // Right chopstick index
   int left = (phil + 1) % 5;    // Left chopstick index
   for (int i = 0; i < 100; i++) // Eat 100 times
   {
     chopstick[right].lock();
     chopstick[left].lock();
     std::cout << "Philosopher " << phil << " is eating" << std::endl;
     std::this_thread::sleep_for(std::chrono::microseconds(1));
     chopstick[left].unlock();
     chopstick[right].unlock();
     std::cout << "Philosopher " << phil << " is sleeping" << std::endl;
   }
};`,
        },
        {
          lang: 'cpp',
          title: 'Less naive: try_lock og busy-wait',
          source: '06.1-Synchronisation-Examples.pdf s. 7',
          code: `auto philosopher = [&](int phil)
{
  int right = phil;
  int left = (phil + 1) % 5;
  for (int i = 0; i < 100; i++) { // Eat 100 times
    while (true) {
      chopstick[right].lock();
      if (!chopstick[left].try_lock()) {// try_lock: peek at left chopstick
        chopstick[right].unlock(); // If L not available, release R
        continue; // Cont. to next while it (busy wait)
      }
      break; // Have both chopsticks, break out of while loop
    }

    std::cout << "Philosopher " << phil << " is eating" << std::endl;
    cnt[phil] = i;
    chopstick[right].unlock();
    chopstick[left].unlock();
  }
};`,
        },
        {
          lang: 'cpp',
          title: 'Dining philosophers med condition variables',
          source: '06.1-Synchronisation-Examples.pdf s. 18',
          code: `// Assuming namespace std
auto philosopher = [&](int phil)
{
  int right = phil;
  int left = (phil + 1) % 5;
  // Eat 100 times!
  for (int i = 0; i < 100; i++) {
    // Lock table
    unique_lock<mutex> table_lock(table_mtx);
    while (true) {
      // If R mtx not availble, wait for R CV
      if (!chopstick_mtx[right].try_lock()) {
        chopstick_cv[right].wait(table_lock);
        continue; // Cont. to next while it.
      }

      if (!chopstick_mtx[left].try_lock()) {
        // L not available release R
        chopstick_mtx[right].unlock();
        chopstick_cv[left].wait(table_lock);
        continue; // Cont. to next while it.
      }
      break; // Both chopsticks acquired, break while
    }
    table_lock.unlock(); // Release table lock

    cout << "Philosopher " << phil << " is eating" << endl;
    cnt[phil] = i;

    chopstick_mtx[left].unlock();
    chopstick_cv[left].notify_one();

    chopstick_mtx[right].unlock();
    chopstick_cv[right].notify_one();

    cout << "Philosopher " << phil << " is thinking\\n";
    this_thread::sleep_for(chrono::microseconds(1));
    // thinking
  }
};`,
        },
        {
          lang: 'c',
          title: 'Bogens semaforversion — samme deadlock',
          source: 'Silberschatz s. 316, figur 7.6',
          code: `semaphore chopstick[5];   /* all initialized to 1 */

while (true) {
   wait(chopstick[i]);
   wait(chopstick[(i+1) % 5]);
      . . .
   /* eat for a while */
      . . .
   signal(chopstick[i]);
   signal(chopstick[(i+1) % 5]);
      . . .
   /* think for awhile */
      . . .
}`,
        },
      ],
      exam: [
        'Dining philosophers er fem tråde, der hver skal bruge to af fem delte låse — sine to nabopinde — for at komme ind i sin kritiske sektion. Det er kursets eksempel på at fordele flere ressourcer mellem flere tråde uden deadlock og uden starvation.',
        'Den naive løsning låser `chopstick[right]` og så `chopstick[left]`. Tager alle deres højre pind på samme tid, holder hver én og venter på næste, og ressourceallokeringsgrafen får cyklussen `P0 → C1 → P1 → … → P4 → C0 → P0`. Da hver pind kun findes én gang, er det en deadlock; alle fire Coffman-betingelser er opfyldt.',
        'Slidet foreslår at tage den lavest nummererede pind først og slippe den igen, hvis den anden er optaget. Kursets `try_lock`-kode gør det sidste: den slipper højre pind, hvis `try_lock()` på venstre fejler, så den deadlocker ikke — men den busy-waiter, og bogen viser, at netop dét mønster kan give livelock.',
        'Løsningen i 06.1 tjekker begge pinde under en fælles `table_mtx` og lader en filosof, der ikke kan få begge, sove på pindens condition variable, `chopstick_cv[i].wait(table_lock)`. Den der spiser færdig, låser pinden op og kalder `notify_one()`. Det svarer til bogens monitorløsning, hvor man kun må spise, hvis ingen nabo spiser.',
        'Faldgruben er at tro, at deadlock-fri betyder retfærdig: både slidet (“Will someone starve to death?”) og bogen siger, at en filosof stadig kan sulte, og ingen af dem løser det.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture06_1_SynchronisationExamples.md'), original: '06.1-Synchronisation-Examples.pdf', pages: 's. 2–8, 16–18' },
        { path: k('context/slides/SW3SYS-01_Lecture05_1_Deadlocks.md'), original: '05.1-deadlocks.pdf', pages: 's. 5, 8', note: 'Coffman-betingelser og RAG-reglen for én instans' },
        { path: k('context/book/SW3SYS-01_Ch07-08_Synchronization_Examples_and_Deadlocks.md'), original: BOOK, pages: 's. 315–317', note: 'Afsnit 7.1.3 (PNG 0339–0341 i data/bogen)' },
        { path: k('context/book/SW3SYS-01_Ch07-08_Synchronization_Examples_and_Deadlocks.md'), original: BOOK, pages: 's. 345–346', note: 'Afsnit 8.2.1 Livelock, figur 8.2' },
      ],
      gaps: [
        'Slidet stiller “How can the additional requirements be implemented?” (06.1 s. 6), men `try_lock`-koden på s. 7 implementerer kun krav 2 (slip igen). Krav 1 (lavest nummer først) er ikke med: med `right = phil` og `left = (phil + 1) % 5` tager `P4` stadig `C4` før `C0`.',
        'Slidet siger, at `try_lock`-versionen “will not deadlock, but will busy wait” (s. 7). Bogen bruger det samme lock-/trylock-/slip-mønster som sit eksempel på **livelock** (8.2.1, figur 8.2, s. 346). Slidet nævner ikke livelock.',
        'Flowchartet på s. 17 kalder `notify_all()` efter hver `unlock()`; koden på s. 18 kalder `notify_one()`. Flowchartet skriver også `chopstick_cv[right].wait(table_mtx)`, mens koden (korrekt for `std::condition_variable`) venter på `table_lock`.',
        'Markdown-konverteringen beskriver grafen på s. 6 forkert (“P0 har C0 allocated og requests C1 …”). Billedet viser, at `P0` har både `C0` og `C1` (kanterne “1.0 allocated”, “1.1 allocated”) og `P2` både `C2` og `C3`, mens `P1`, `P3` og `P4` kun har requests.',
        '`std::lock()` og `std::scoped_lock`, der låser flere mutexes på én gang uden deadlock, findes ikke i slides, kode eller bog: ikke dækket af pensum.',
        'Bogens monitorkode for `DiningPhilosophers` (figur 7.7 med `pickup`, `putdown` og `test`) står på s. 318, som ikke er med i `data/bogen` (sidste side er s. 317). Kun beskrivelsen og `state[5]`/`self[5]` er med. Bogen henviser desuden til “Section 6.7” for en deadlock-fri løsning.',
        'Hverken slides eller bog løser starvation; slidet stiller spørgsmålet, bogen overlader det til en øvelse.',
        'Kursusplanen (01.1a s. 4) kalder lektion 6 A “Deadlocks”, mens decket hedder “Synchronisation Examples (and Conditional Variables)”.',
        'Uden for materialet: i CV-koden på s. 18 kaldes `notify_one()` uden at holde `table_mtx`. En filosof, der netop har fået `false` fra `try_lock()` under bordlåsen, men endnu ikke er nået ind i `wait()`, kan i princippet misse den notifikation. Materialet diskuterer ikke dette.',
      ],
      keywords: ['dining philosophers', 'spisende filosoffer', 'filosof', 'chopstick', 'spisepind', 'P0', 'C0', 'taking turns', 'try_lock', 'pthread_mutex_trylock', 'busy wait', 'livelock', 'backoff', 'starvation', 'sulte', 'table_mtx', 'chopstick_mtx', 'chopstick_cv', 'notify_one', 'unique_lock', 'resource ordering', 'lavest nummer først', 'asymmetrisk løsning', 'DiningPhilosophers', 'pickup', 'putdown', 'THINKING', 'HUNGRY', 'EATING', 'monitor'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'deadlock-betingelser',
      title: 'Deadlock: Coffman-betingelser og resource-allocation graph',
      short: 'Coffman-betingelser og RAG',
      week: 'Uge 5 · L5.1',
      definition:
        'En **deadlock** er en tilstand, hvor en mængde tråde hver venter på en hændelse, som kun en anden tråd i mængden kan udløse. Den kræver fire samtidige betingelser — **mutual exclusion, hold and wait, no preemption og circular wait** (Coffman-betingelserne). En **ressourceallokeringsgraf** (RAG) viser, hvem der holder og venter på hvad; en cyklus er en deadlock, når hver ressource kun har én instans.',
      concepts: [
        {
          term: 'Det klassiske eksempel: to mutexes i modsat rækkefølge',
          body: [
            '05.1 s. 2 åbner med `mutex_error_deadlock()`: to mutexes `mut_a` og `mut_b` og to lambdaer. `thread_a` låser `mut_a`, skriver (“IO Wait”) og låser `mut_b`; `thread_b` låser `mut_b` først og derefter `mut_a`. Kommentarerne “May be locked by thread_b/thread_a” peger på problemet: rækkefølgen er modsat.',
            'Samme kode ligger i kursets `synchronization-tools.cpp` (uge 4), hvor “IO Wait” er en løkke, der skriver 50 tegn for at give den anden tråd tid. Kaldet er udkommenteret i `main()` (`//mutex_error_deadlock();`), og det samme gælder søsterfunktionen `semaphore_binary_error_deadlock()` med to `std::binary_semaphore`. Mønstret blev første gang vist i 04.1 s. 26–27 under “Mutual exclusion dangers — deadlock”.',
            'Bogen har samme eksempel i Pthreads (figur 8.1): `do_work_one` låser `first_mutex` og så `second_mutex`, `do_work_two` omvendt. Bogen understreger, at deadlocken er mulig, men ikke sikker — den afhænger af, hvordan CPU-scheduleren fordeler tiden.',
          ],
        },
        {
          term: 'Sunshine og rainy day',
          body: [
            '**Sunshine scenario** (s. 3): `thread_a` tager `mut_a` og `mut_b` ukonkurreret (t = 0–2). Ved t = 3 prøver `thread_b` `mut_b` og blokerer. `thread_a` skriver sin kritiske sektion og låser `mut_b` op (t = 4–5), så `thread_b` kommer videre, blokerer kortvarigt på `mut_a` (t = 7), som `thread_a` frigiver ved t = 8. Ingen deadlock.',
            '**Rainy day scenario** (s. 4): `thread_a` tager `mut_a` ved t = 0, `thread_b` tager `mut_b` ved t = 1. Begge skriver deres “Hi”. Ved t = 4 blokerer `thread_a` på `mut_b`, ved t = 5 blokerer `thread_b` på `mut_a` — “deadlocked!”. Det er samme kode; kun interleavingen er forskellig. Derfor findes deadlocks sjældent ved test.',
          ],
        },
        {
          term: 'De fire nødvendige betingelser',
          body: [
            '**Mutual exclusion**: mindst én ressource holdes af én tråd ad gangen; andre requests udskydes, til den frigives. **Hold and wait**: en tråd holder mindst én ressource og venter på en anden, som holdes af en anden tråd. **No preemption**: kun den tråd, der holder ressourcen, kan frigive den. **Circular wait**: trådene venter på ressourcer “in round-robbin fashion” — slidets tegning er ringen `t0 → mtx0 → t1 → mtx1 → t2 → mtx2 → t0` (05.1 s. 5).',
            'Bogen formulerer circular wait som en mængde `{T0, …, Tn}`, hvor `T0` venter på `T1`, `T1` på `T2`, …, og `Tn` på `T0`. Den bemærker, at circular wait medfører hold and wait, så betingelserne “are not completely independent”, men at det er nyttigt at se på dem hver for sig (8.3.1, s. 347).',
            'Bogens systemmodel (8.1) ligger under: ressourcer har typer med identiske **instanser**, og en tråd bruger en ressource i tre trin — *request*, *use*, *release* (`wait()`/`signal()` for semaforer, `acquire()`/`release()` for mutexes). Låse er i dag “the most common sources of deadlock”.',
          ],
        },
        {
          term: 'Programanalyse',
          body: [
            'Slide 6 tjekker betingelserne mod koden én for én. *Mutual exclusion*: en mutex kan kun låses én gang, så andre requests venter. *Hold and wait*: `thread_a` kan holde `mut_a` og vente på `mut_b`, som måske holdes af `thread_b`. *No preemption*: en mutex kan kun låses op af den tråd, der låste den. *Circular wait*: `thread_a` holder `mut_a` og venter på `mut_b`, `thread_b` holder `mut_b` og venter på `mut_a`. Alle fire → “DEADLOCK!”.',
            'Metoden er den, man skal kunne til eksamen: tag et stykke kode, gå de fire betingelser igennem, og peg på den, der er lettest at bryde. For to mutexes er det circular wait — se [[deadlock-haandtering|forebyggelse og lock ordering]].',
          ],
        },
        {
          term: 'Ressourceallokeringsgraf (RAG)',
          body: [
            'En RAG er en rettet graf `G = (V, E)`. Knuderne er tråde (cirkler) og ressourcer (rektangler med en prik pr. instans). En **request edge** `T → R` betyder, at tråden har bedt om ressourcen og venter; en **assignment edge** `R → T` går fra en bestemt prik og betyder, at instansen er tildelt tråden (05.1 s. 7; bog 8.3.2).',
            'Slidets eksempel: `T = {thread_a, thread_b}`, `R = {mut_a, mut_b}`, request edges `{thread_a, mut_b}` og `{thread_b, mut_a}`, assignment edges `{mut_a, thread_a}` og `{mut_b, thread_b}`. Kanterne danner cyklussen `thread_a → mut_b → thread_b → mut_a → thread_a`.',
            'Reglerne (s. 8): **ingen cyklus → ingen deadlock**. Har grafen en cyklus, **kan** der være deadlock: har hver ressource i cyklussen kun én instans, er deadlocken opstået; har de flere instanser (fx en counting semaphore), er betingelserne til stede, men ikke nødvendigvis opfyldt.',
          ],
        },
        {
          term: 'Flere instanser: cyklus er ikke nok',
          body: [
            '“Deadlocked…” (s. 9, = bogens figur 8.5): `R1` og `R3` har én instans, `R2` har to. `T1` venter på `R1`, som `T2` holder; `T2` venter på `R3`, som `T3` holder; `T3` venter på `R2`, hvis to instanser holdes af `T1` og `T2`. Bogen finder to minimale cykler, `T1 → R1 → T2 → R3 → T3 → R2 → T1` og `T2 → R3 → T3 → R2 → T2`, og alle tre tråde er deadlocked, fordi ingen af de to, der holder `R2`, kan blive færdige.',
            '“Deadlocked… NOT!” (s. 10, = figur 8.6): `R1` og `R2` har to instanser hver. Cyklussen er `T1 → R1 → T3 → R2 → T1`, men den anden instans af `R2` holdes af `T4`, som ikke venter på noget. Når `T4` frigiver den, kan `T3` få den, og cyklussen brydes. Med flere instanser er en cyklus altså nødvendig, men ikke tilstrækkelig.',
          ],
        },
      ],
      viz: 'rag-cycle',
      keyPoints: [
        'Deadlock: hver tråd i en mængde venter på noget, kun en anden tråd i mængden kan gøre.',
        'Mutual exclusion, hold and wait, no preemption, circular wait — alle fire på én gang.',
        'To mutexes låst i modsat rækkefølge er kursets standardeksempel (`mutex_error_deadlock`).',
        'Sunshine vs. rainy day: samme kode, forskellig interleaving — deadlocken er timingafhængig.',
        'RAG: request edge `T → R`, assignment edge `R → T` fra en instans-prik.',
        'Ingen cyklus → ingen deadlock.',
        'Cyklus + én instans pr. ressource → deadlock.',
        'Cyklus + flere instanser → måske; en tråd uden for cyklussen kan frigive en instans.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'mutex_error_deadlock — kursets kode',
          source: 'lecture-code-main/week_4_sync_tools/synchronization-tools.cpp',
          code: `void mutex_error_deadlock()
{
    std::mutex mut_a, mut_b;
    std::vector<std::thread> threads;

    auto thread_a = [&](int i)
    {
        mut_a.lock();
        for (int k = 0; k < 50; ++k)
            std::cout << i ; // IO Wait, Give other thread time slice
        mut_b.lock();        // May be locked by thread_b
        std::cout << "In thread " << i << " critical section" << std::endl;
        mut_b.unlock();
        mut_a.unlock();
    };

    auto thread_b = [&](int i)
    {
        mut_b.lock();
        for (int k = 0; k < 50; ++k)
            std::cout << i ; // IO Wait, Give other thread time slice
        mut_a.lock();        // May be locked by thread_a
        std::cout << "In thread " << i << " critical section" << std::endl;
        mut_a.unlock();
        mut_b.unlock();
    };

    threads.emplace_back(thread_a, 0);
    threads.emplace_back(thread_b, 1);

    for (auto& t : threads)
        t.join();
}`,
        },
        {
          lang: 'text',
          title: 'Rainy day scenario',
          source: '05.1-deadlocks.pdf s. 4',
          code: `t  Thread A                              Thread B
0  mut_a.lock(); (uncontended)
1                                        mut_b.lock(); (uncontended)
2  std::cout << "Hi " << "thread a";
3                                        std::cout << "Hi " << "thread b";
4  mut_b.lock(); (contended - block)
5                                        mut_a.lock(); (contended - block)
6                      deadlocked!`,
        },
        {
          lang: 'text',
          title: 'RAG for de to mutexes',
          source: '05.1-deadlocks.pdf s. 7',
          code: `Threads, T = {thread_a, thread_b}
Resources, R = {mut_a, mut_b}
Request Edges: {{thread_a, mut_b}, {thread_b, mut_a}}
Assignment Edges: {{mut_a, thread_a,}, {mut_b , thread_b}}`,
        },
      ],
      exam: [
        'En deadlock er, når en gruppe tråde hver venter på en ressource, som en anden i gruppen holder, så ingen kommer videre. Den kræver fire betingelser samtidig: mutual exclusion, hold and wait, no preemption og circular wait.',
        'Kursets eksempel er `mutex_error_deadlock()`: `thread_a` låser `mut_a` og så `mut_b`, `thread_b` omvendt. I sunshine-scenariet når `thread_a` at få begge; i rainy day-scenariet tager hver tråd sin første mutex, og begge blokerer på den anden. Det er samme kode, så deadlocken afhænger af scheduleren.',
        'Går man betingelserne igennem: en mutex kan kun holdes af én, trådene holder én mutex, mens de venter på den næste, kun ejeren kan låse op, og de venter i ring. Alle fire er opfyldt.',
        'I en ressourceallokeringsgraf peger request edges fra tråd til ressource og assignment edges fra en instans til tråden. Ingen cyklus betyder ingen deadlock. En cyklus betyder deadlock, hvis hver ressource har én instans — med flere instanser, fx en counting semaphore, kan en tråd uden for cyklussen frigive en instans og bryde den, som i slidets “Deadlocked… NOT!”.',
        'Faldgruben er at sige, at en cyklus altid er en deadlock; det gælder kun ved én instans pr. ressource.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture05_1_Deadlocks.md'), original: '05.1-deadlocks.pdf', pages: 's. 2–10' },
        { path: k('context/slides/SW3SYS-01_Lecture04.1_Synchronisation-tools.md'), original: '04.1-Synchronisation-tools.pdf', pages: 's. 26–27, 43', note: 'Første gang deadlock nævnes; liveness-problemer' },
        { path: k('context/kode/SW3SYS-01_Code_week_4_sync_tools.md'), original: 'lecture-code-main/week_4_sync_tools/synchronization-tools.cpp', note: '`mutex_error_deadlock()` og `semaphore_binary_error_deadlock()`' },
        { path: k('context/book/SW3SYS-01_Ch07-08_Synchronization_Examples_and_Deadlocks.md'), original: BOOK, pages: 's. 342–349', note: 'Afsnit 8.1–8.3 (PNG 0366–0373 i data/bogen)' },
      ],
      gaps: [
        'Slide 5 siger “Deadlock WILL occur if ALL the following four (nesccesary) conditions are available”, og markdown-konverteringen skriver “hvis og kun hvis”. Bogen siger kun, at deadlock *kan* opstå, hvis alle fire holder (nødvendige, ikke tilstrækkelige), og slidets egen s. 8 og s. 10 viser, at betingelserne kan være “available, but not satisfied” ved flere instanser.',
        'Slidet viser grafen på s. 9 og s. 10 uden forklaring. At `T2` og `T4` på s. 10 (ikke kun `T4`) holder en instans uden at vente, og at `T4` er den, der bryder cyklussen, står i bogen (s. 349–350), ikke på slidet.',
        'Slide 5 og markdown-konverteringen staver “round-robbin”, “nesccesary”, “ressource” og “delyed”; s. 6 skriver “locks_mut_b”. Slide 7 har et ekstra komma i `{mut_a, thread_a,}`.',
        'Kursets kode kalder aldrig `mutex_error_deadlock()` eller `semaphore_binary_error_deadlock()` — begge er udkommenteret i `main()`, så man skal selv fjerne kommentaren for at se deadlocken.',
        'Bogens figur 8.4 (RAG’en før `T3 → R2` tilføjes, med `R4` på tre instanser) er med i bogen, men ikke på slides; slidene udelader `R4`.',
      ],
      keywords: ['deadlock', 'dødvande', 'baglås', 'Coffman', 'Coffman conditions', 'mutual exclusion', 'hold and wait', 'no preemption', 'circular wait', 'cirkulær venten', 'resource-allocation graph', 'RAG', 'ressourceallokeringsgraf', 'request edge', 'assignment edge', 'instans', 'multiple instances', 'cyklus', 'sunshine scenario', 'rainy day scenario', 'mutex_error_deadlock', 'semaphore_binary_error_deadlock', 'mut_a', 'mut_b', 'first_mutex', 'second_mutex', 'request use release', 'system model'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'deadlock-haandtering',
      title: 'Forebyggelse, undgåelse og detektion',
      short: 'Håndtering af deadlocks',
      week: 'Uge 5 · L5.1',
      definition:
        'Deadlocks håndteres på tre (fire) måder: **ignorér** dem, **forebyg** dem ved at bryde en af de fire betingelser (prevention), **undgå** dem ved runtime ud fra oplysninger om trådenes behov (avoidance, fx banker’s algorithm), eller **opdag og ryd op** (detection and recovery). I praksis er **lock ordering** — alle tager låse i samme globale rækkefølge — den teknik, kurset anbefaler.',
      concepts: [
        {
          term: 'Fire strategier',
          body: [
            '05.1 s. 11: “Three (four) ways to handle deadlocks”. *Ignore them*: “Do nothing, maybe it’s ok!?!”. *Deadlock prevention*: sørg for, at de aldrig kan opstå. *Deadlock avoidance*: giv OS’et oplysninger, så det kan fordele ressourcerne sikkert. *(Deadlock detection and recovery)*: bruger man hverken prevention eller avoidance, så opdag og afhjælp deadlocks, når de sker.',
            'Bogen (8.4) er mere konkret om, hvem der gør hvad: de fleste operativsystemer, også Linux og Windows, ignorerer problemet og overlader det til applikationsudviklerne; databaser bruger detection and recovery. Argumentet for at ignorere er pris: hvis deadlocks sker sjældent, fx en gang om måneden, er det billigere end at betale for prevention, avoidance eller detection hele tiden.',
          ],
        },
        {
          term: 'Prevention: bryd én betingelse',
          body: [
            '**Mutual exclusion**: delbare ressourcer som read-only-filer eller immutable data kræver ikke atomisk adgang og kan ikke deadlocke. Men bogen siger det lige ud: mange ressourcer, fx mutex locks, er i sagens natur ikke delbare, så betingelsen kan generelt ikke fjernes.',
            '**Hold and wait**: en tråd må ikke holde en ressource, mens den beder om en anden — enten allokeres alt før start, eller alt, man holder, skal frigives, før man beder om mere. Slidet: “This does however not eliminate starvation”. Bogen tilføjer lav ressourceudnyttelse.',
            '**No preemption**: kan en tråd, der holder ressourcer, ikke straks få en ny, så frigives (preemptes) dem, den holder, og den genstarter først, når alle er ledige; alternativt tages ressourcen fra en anden *ventende* tråd. Bogen: det virker for ressourcer, hvis tilstand kan gemmes og gendannes (CPU-registre, databasetransaktioner), men **ikke** for mutexes og semaforer.',
            '**Circular wait**: bogen kalder de tre første muligheder “generally impractical in most situations”; den fjerde giver en praktisk løsning. Indfør en total ordning `F: R → ℕ` af alle ressourcetyper og kræv, at de tages i stigende orden. Slidet: “This is something we can do!”. Bogens bevis: en cirkulær venten ville give `F(R0) < F(R1) < … < F(Rn) < F(R0)`, hvilket er umuligt.',
          ],
        },
        {
          term: 'Lock ordering / hierarchy',
          body: [
            'Slide 14 retter `mutex_error_deadlock`: `thread_b` låser nu også `mut_a` først og `mut_b` bagefter. Grafen bliver lineær — `thread_b → mut_a → thread_a → mut_b` — uden cyklus: “Both threads request first mut_a, then mut_b → No deadlock!”. Samme råd står allerede i 04.1 (s. 26–27): forkert låserækkefølge giver deadlock.',
            'Bogen sætter tal på: `F(first_mutex) = 1`, `F(second_mutex) = 5`, så begge tråde i figur 8.1 skal tage `first_mutex` først. Den understreger, at en ordning ikke i sig selv forhindrer deadlock — udviklerne skal følge den — og advarer mod ordninger, der afhænger af parametre: i `transaction(from, to, amount)` (figur 8.7) låses `get_lock(from)` før `get_lock(to)`, og kaldes `transaction(checking_account, savings_account, 25.0)` samtidig med `transaction(savings_account, checking_account, 50.0)`, er rækkefølgen modsat og deadlock mulig.',
          ],
        },
        {
          term: 'Avoidance og lockdep',
          body: [
            'Slide 15 kalder avoidance “run-time deadlock prevention”: systemet overvåger, hvordan koden beder om ressourcer, og bruger en algoritme, så circular wait ikke kan opstå. I Linux-kernen håndhæves det af **lockdep**. Linux kan **ikke** håndhæve lock ordering for en user space-applikation — avoidance-logikken skal ligge i applikationen selv.',
            'Bogens boks om lockdep (s. 355): værktøjet vedligeholder dynamisk rækkefølgen, låse tages i, og melder en mulig deadlock, hvis den brydes; det fanger også en spinlock, der tages med interrupts slået til, selv om den bruges i en interrupt handler. Det er til udvikling, ikke produktion, fordi det sænker systemet markant, og deadlocks i systemrapporter faldt en størrelsesorden, efter det kom i 2006.',
            'Bogens definition af avoidance (8.6) kræver **a priori-viden**: hver tråd erklærer det maksimale antal af hver ressourcetype, den kan få brug for, og systemet afgør for hver request, om den skal opfyldes nu eller vente.',
          ],
        },
        {
          term: 'Safe state og banker’s algorithm',
          body: [
            'En tilstand er **safe**, hvis systemet kan give hver tråd op til dens maksimum i en eller anden rækkefølge uden deadlock — dvs. der findes en **safe sequence** `<T1, …, Tn>`, hvor hver `Ti`’s resterende behov kan dækkes af de ledige ressourcer plus dem, alle `Tj` med `j < i` holder. Safe ⇒ ingen deadlock; unsafe ⇒ deadlock mulig, men ikke sikker (s. 355).',
            'Banker’s algorithm (Dijkstra, 05.1 s. 15) “simulerer” en request: lad som om den er opfyldt, og kør sikkerhedstjekket. Er den nye tilstand safe, gives ressourcen; ellers må tråden vente. Datastrukturerne er vektoren **Available** og matricerne **Max**, **Allocation** og **Need** (`Need = Max − Allocation`).',
            'Bogens eksempel (s. 361) har tre ressourcetyper `A, B, C` og fem tråde. `T1` beder om `(1,0,2)`; det er mindre end `Available = (3,3,2)`. Efter den foregivne tildeling er `Available = (2,3,0)`, og tabellen er `Allocation`: `T0 010, T1 302, T2 302, T3 211, T4 002`; `Need`: `T0 743, T1 020, T2 600, T3 011, T4 431`. Sekvensen `<T1, T3, T4, T0, T2>` opfylder sikkerhedskravet, så `T1` får sine ressourcer med det samme.',
            'Samme side viser to afslag: `T4`’s request `(3,3,0)` kan ikke opfyldes, fordi ressourcerne ikke er der; `T0`’s request `(0,2,0)` afvises, “even though the resources are available, since the resulting state is unsafe”. Det er pointen med avoidance: en ledig ressource gives ikke, hvis det kan føre til deadlock senere.',
          ],
        },
        {
          term: 'Detection: wait-for graph og detektionsalgoritmen',
          body: [
            'Slide 16: avoidance kan være “resource-costly”. I stedet kan systemet af og til lede efter cykler i sin **wait-for graph**, `O(N²)`, og bryde dem. Wait-for-grafen er RAG’en med ressourceknuderne fjernet: kanten `Ti → Tj` findes, hvis `Ti → Rq` og `Rq → Tj` for en ressource `Rq`. Ved én instans pr. ressource er en cyklus i wait-for-grafen en deadlock (bog 8.7.1, figur 8.11 = slidets billede).',
            'Ved flere instanser virker wait-for-grafen ikke. Bogen (8.7.2, s. 362–364) bruger en algoritme magen til banker’s: `Work = Available`, `Finish[i] = false` for tråde med allokeringer; find `i` med `Request_i ≤ Work`, sæt `Work = Work + Allocation_i` og `Finish[i] = true`; gentag. Er nogen `Finish[i]` stadig `false`, er `Ti` deadlocked. Pris: `m × n²`.',
            'Bogens eksempel: `A` har 7 instanser, `B` 2, `C` 6, og `Available = (0,0,0)`. Med `Request` `T0 000, T1 202, T2 000, T3 100, T4 002` er sekvensen `<T0, T2, T3, T1, T4>` mulig — ingen deadlock. Beder `T2` om én `C` mere (`Request T2 = 001`), kan kun `T0`’s ressourcer tages tilbage, og `T1`–`T4` er deadlocked.',
            'Hvornår skal man køre den (8.7.3)? Ved hver request, der ikke kan opfyldes med det samme, finder man også den tråd, der “forårsagede” cyklussen, men det er dyrt. Billigere er faste intervaller, fx en gang i timen eller når CPU-udnyttelsen falder under 40 %. BCC’s `deadlock_detector` bygger en wait-for-graf over Pthreads-mutexes i en kørende Linux-proces ved at probe `pthread_mutex_lock()`/`pthread_mutex_unlock()`.',
          ],
        },
        {
          term: 'Recovery',
          body: [
            'Slidet nævner to måder at bryde løkken: **abort thread** og **preempt resource**. Bogen (8.8) lægger en tredje foran: fortæl operatøren og lad vedkommende rydde op.',
            '*Terminering* (8.8.1): afbryd alle deadlockede processer (sikkert, men dyrt — delberegninger går tabt) eller én ad gangen, med en ny detektionskørsel efter hver. Valget af offer afhænger af prioritet, hvor langt processen er, hvilke ressourcer den bruger, hvor mange den mangler, og hvor mange der skal afbrydes. Afbrydes en tråd, mens den holder en mutex, kan de delte data være inkonsistente.',
            'Databaser er bogens eksempel på detection and recovery i praksis: serveren leder periodisk efter cykler i wait-for-grafen, vælger en offertransaktion, afbryder og ruller den tilbage og kører den igen bagefter; MySQL vælger den transaktion, der ændrer færrest rækker (s. 365).',
          ],
        },
      ],
      viz: 'bankers-safe',
      keyPoints: [
        'Fire strategier: ignorér, prevention, avoidance, detection and recovery.',
        'Linux og Windows ignorerer deadlocks; databaser bruger detection and recovery.',
        'Prevention: bryd én betingelse — i praksis circular wait.',
        'Lock ordering: alle tråde tager låsene i samme globale rækkefølge; ordningen må ikke afhænge af parametre.',
        'Avoidance kræver a priori-viden om hver tråds maksimum; lockdep gør det i kernen, i user space er det applikationens ansvar.',
        'Safe state: der findes en safe sequence. Unsafe betyder mulig, ikke sikker, deadlock.',
        'Banker’s: foregiv tildelingen, kør sikkerhedstjekket, giv kun ressourcen hvis tilstanden er safe.',
        'Detection: cyklus i wait-for-grafen (`O(N²)`) ved én instans; banker-lignende algoritme (`m × n²`) ved flere.',
        'Recovery: afbryd tråde eller preempt ressourcer — med risiko for inkonsistente data og starvation.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Lock ordering: begge tager mut_a før mut_b',
          source: '05.1-deadlocks.pdf s. 14',
          code: `auto thread_a = [&](int i) {
  mut_a.lock();
  cout << "Hi " << "thread a"; // IO Wait
  mut_b.lock();
  cout << "thread a " << "CS"; // IO Wait
  mut_b.unlock();
  mut_a.unlock(); };

auto thread_b = [&](int i) {
  mut_a.lock();
  cout << "Hi " << "thread b"; // IO Wait
  mut_b.lock();
  cout << "thread b " << "CS"; // IO Wait
  mut_b.unlock();
  mut_a.unlock(); };`,
        },
        {
          lang: 'c',
          title: 'Lock ordering der afhænger af parametre — kan deadlocke',
          source: 'Silberschatz s. 353–354, figur 8.7',
          code: `void transaction(Account from, Account to, double amount)
{
   mutex lock1, lock2;
   lock1 = get_lock(from);
   lock2 = get_lock(to);

   acquire(lock1);
      acquire(lock2);
         withdraw(from, amount);
         deposit(to, amount);
      release(lock2);
   release(lock1);
}

/* Thread 1: transaction(checking_account, savings_account, 25.0) */
/* Thread 2: transaction(savings_account, checking_account, 50.0) */`,
        },
        {
          lang: 'text',
          title: 'Banker’s: tilstanden efter T1’s request (1,0,2)',
          source: 'Silberschatz s. 361',
          code: `        Allocation   Need    Available
        A B C        A B C   A B C
T0      0 1 0        7 4 3   2 3 0
T1      3 0 2        0 2 0
T2      3 0 2        6 0 0
T3      2 1 1        0 1 1
T4      0 0 2        4 3 1

Safe sequence (bogen): <T1, T3, T4, T0, T2>  ->  T1's request grantes

Work-trin, regnet her ud fra tabellen (Need <= Work, saa Work += Allocation):
  Work = (2,3,0)
  T1  Need (0,2,0) <= (2,3,0)  ->  Work = (5,3,2)
  T3  Need (0,1,1) <= (5,3,2)  ->  Work = (7,4,3)
  T4  Need (4,3,1) <= (7,4,3)  ->  Work = (7,4,5)
  T0  Need (7,4,3) <= (7,4,5)  ->  Work = (7,5,5)
  T2  Need (6,0,0) <= (7,5,5)  ->  Work = (10,5,7)

T4 request (3,3,0): kan ikke opfyldes - ikke nok ledigt
T0 request (0,2,0): afvises - ressourcerne er der, men tilstanden bliver unsafe`,
        },
        {
          lang: 'text',
          title: 'Detektionsalgoritmen (flere instanser)',
          source: 'Silberschatz s. 363',
          code: `1. Work = Available
   for i = 0..n-1: Finish[i] = (Allocation_i == 0)
2. Find i med Finish[i] == false og Request_i <= Work
   Findes intet i: gaa til 4
3. Work = Work + Allocation_i
   Finish[i] = true
   Gaa til 2
4. Finish[i] == false for et i  ->  systemet er deadlocked,
   og Ti er deadlocked.                     (m x n^2 operationer)`,
        },
      ],
      exam: [
        'Man kan håndtere deadlocks på fire måder: ignorere dem, som Linux og Windows gør, forebygge dem ved at bryde en af de fire betingelser, undgå dem ved runtime, eller opdage dem og rydde op bagefter, som databaser gør.',
        'Af de fire betingelser er circular wait den, man kan bryde i praksis: mutexes kan ikke gøres delbare, og en mutex kan ikke tages fra sin ejer. Man giver alle låse en global rækkefølge og kræver, at de tages stigende — i kursets eksempel låser begge tråde `mut_a` før `mut_b`, og så har ressourceallokeringsgrafen ingen cyklus.',
        'Avoidance kræver, at hver tråd på forhånd erklærer sit maksimum. Banker’s algorithm lader som om en request er opfyldt og tjekker, om der stadig findes en safe sequence. I bogens eksempel får `T1` `(1,0,2)`, fordi `<T1, T3, T4, T0, T2>` kan køre færdig, mens `T0`’s `(0,2,0)` afvises, selv om ressourcerne er ledige, fordi tilstanden ville blive unsafe.',
        'Detection leder efter cykler i wait-for-grafen, `O(N²)`, og bryder dem ved at afbryde en tråd eller tage en ressource fra den. I Linux-kernen kontrollerer lockdep låserækkefølgen under udvikling, men i user space skal applikationen selv sørge for den.',
        'Faldgruben er en låserækkefølge, der afhænger af argumenterne, som i bogens `transaction(from, to, …)`: to kald med byttede konti låser i modsat rækkefølge og kan deadlocke, selv om hver funktion ser korrekt ud.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture05_1_Deadlocks.md'), original: '05.1-deadlocks.pdf', pages: 's. 11–16' },
        { path: k('context/slides/SW3SYS-01_Lecture04.1_Synchronisation-tools.md'), original: '04.1-Synchronisation-tools.pdf', pages: 's. 26–27' },
        { path: k('context/book/SW3SYS-01_Ch07-08_Synchronization_Examples_and_Deadlocks.md'), original: BOOK, pages: 's. 350–355', note: 'Afsnit 8.4–8.6.1 inkl. lockdep-boksen (PNG 0374–0379)' },
        { path: k('context/book/SW3SYS-01_Ch07-08_Synchronization_Examples_and_Deadlocks.md'), original: BOOK, pages: 's. 361–366', note: 'Slutningen af 8.6.3, 8.7 og 8.8.1 (PNG 0385–0390). Afsnit 8.7.2–8.7.3 findes kun i PNG’erne, ikke i markdown-konverteringen.' },
      ],
      gaps: [
        'Banker’s algorithm er næsten ikke i materialet: slidet nævner kun navnet (05.1 s. 15), og markdown-konverteringen skriver “Banker’s algorithm … ikke dækket her”. Bogens s. 356–360 (8.6.2 resource-allocation-graph algorithm, 8.6.3 banker’s med safety- og resource-request-algoritmen og udgangstilstanden med Max-matricen) mangler i `data/bogen`. Kun slutningen af eksemplet (s. 361) er med; `Max`-matricen og det oprindelige safe sequence står altså ikke i materialet.',
        'Work-trinene i banker’s-kodeblokken er regnet ud her ud fra tabellen på s. 361; bogen oplyser kun sekvensen `<T1, T3, T4, T0, T2>`.',
        'Slide 15 kalder avoidance “run-time deadlock prevention” og lægger lockdep ind under avoidance. I bogen står lockdep-boksen fysisk i afsnit 8.6 (s. 355), men teksten knytter den til lock ordering (8.5.4) og beskriver et udviklingsværktøj, der *opdager* forkert låserækkefølge — ikke en avoidance-algoritme med safe states.',
        'Slide 15 siger, at Linux ikke kan håndhæve lock ordering i user space. Bogen skriver (s. 355), at nyere versioner af lockdep kan finde deadlocks i brugerapplikationer med Pthreads-mutexes, og nævner BCC’s `deadlock_detector` til user space (s. 362).',
        'Slide 16 skriver `O(N²)` uden at sige, hvad `N` er; bogen siger `n` = antal knuder i wait-for-grafen og tilføjer, at wait-for-grafen kun virker ved én instans pr. ressource. Detektionsalgoritmen for flere instanser (8.7.2, `m × n²`) er i PNG’erne, men nævnes hverken på slides eller i markdown-konverteringen.',
        'Markdown-konverteringen beskriver 8.8.2’s tre problemer (valg af offer, rollback, starvation), men den side (s. 367) er ikke med i `data/bogen`; s. 366 slutter med “three issues need to be addressed:”.',
        'Markdown-konverteringen af 05.1 kalder “ignore” for “ostrich algorithm”; ordet står ikke på slidet.',
        'Kurset viser ingen kode for avoidance eller detection — kun lock ordering har C++-kode.',
      ],
      keywords: ['deadlock handling', 'ignore', 'ostrich', 'deadlock prevention', 'forebyggelse', 'deadlock avoidance', 'undgåelse', 'deadlock detection', 'detektion', 'recovery', 'lock ordering', 'lock hierarchy', 'låserækkefølge', 'total ordering', 'lockdep', 'banker’s algorithm', 'bankers algorithm', 'Dijkstra', 'safe state', 'unsafe state', 'safe sequence', 'Available', 'Max', 'Allocation', 'Need', 'Request', 'Work', 'Finish', 'wait-for graph', 'abort thread', 'preempt resource', 'rollback', 'victim', 'deadlock_detector', 'BCC', 'transaction'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'bounded-buffer',
      title: 'Bounded buffer, readers–writers og thread pools',
      short: 'Bounded buffer og readers–writers',
      week: 'Uge 6 · L6.1',
      definition:
        '**Bounded buffer** (producer–consumer) er problemet, hvor producenter og konsumenter deler en buffer med `n` pladser: producenten må ikke skrive i en fuld buffer, konsumenten ikke læse fra en tom. Bogens løsning bruger tre semaforer — `mutex = 1`, `empty = n`, `full = 0`. **Readers–writers** tillader flere samtidige læsere, men kræver eneret til skrivere. **Thread pools** genbruger forhåndsoprettede tråde, der tager opgaver fra en kø.',
      concepts: [
        {
          term: 'Fra busy-wait til semaforer',
          body: [
            '08.1 genopfrisker problemet. Udgangspunktet (s. 3, bog 6.0) er en cirkulær `buffer` med indeksene `in` og `out` og en delt `count`: producenten spinner i `while (count == BUFFER_SIZE) ;`, konsumenten i `while (count == 0) ;`, og begge ændrer `count` med `count++`/`count--`. Det er busy-wait, og `count` er en delt variabel uden beskyttelse — den race condition, der motiverer [[kritisk-sektion|critical section-problemet]].',
            'Bogen bruger semaforer i alle tre klassiske problemer, “since that is the traditional way to present such solutions”, men tilføjer, at rigtige implementeringer kan bruge mutex locks i stedet for binære semaforer (s. 311–312). Semaforernes `wait()`/`signal()` er forklaret under [[semaforer|semaforer]].',
          ],
        },
        {
          term: 'Tre semaforer: mutex, empty, full',
          body: [
            'De delte data er `int n; semaphore mutex = 1; semaphore empty = n; semaphore full = 0` (bog 7.1.1, s. 312). Puljen har `n` buffere, der hver kan rumme ét element. `mutex` er en binær semafor, der giver gensidig udelukkelse på selve puljen; `empty` og `full` er tællende og tæller tomme og fulde buffere.',
            'Producenten (figur 7.1): producér, `wait(empty)` — blokér, hvis der ikke er plads — `wait(mutex)`, læg elementet i bufferen, `signal(mutex)`, `signal(full)`. Konsumenten (figur 7.2) er spejlbilledet: `wait(full)`, `wait(mutex)`, tag elementet ud, `signal(mutex)`, `signal(empty)`, forbrug.',
            'Bogen kalder det symmetrisk: man kan se producenten som den, der laver fulde buffere til konsumenten, eller konsumenten som den, der laver tomme buffere til producenten. 08.1 s. 4 viser præcis samme kode med kommentaren “We write data to a buffer, but use mutex/conditional to control/signal its validity!”.',
          ],
        },
        {
          term: 'Rækkefølgen af wait-kaldene',
          body: [
            'Tællesemaforen tages før mutexen. Byttede producenten om, så den kaldte `wait(mutex)` før `wait(empty)` på en fuld buffer, ville den holde `mutex`, mens den venter på `empty` — og konsumenten, der skulle frigive en plads, ville blokere på `wait(mutex)`. Det er hold and wait og circular wait i miniformat (se [[deadlock-betingelser|Coffman-betingelserne]]).',
            'Pointen står i markdown-konverteringerne af bogen, ikke på bogens sider 312–313 selv (se huller). Den følger dog direkte af koden og af 05.1’s analyse: den tråd, der venter, må ikke holde den lås, den anden skal bruge for at vække den.',
          ],
        },
        {
          term: 'Readers–writers',
          body: [
            'En database deles mellem **readers**, der kun læser, og **writers**, der opdaterer. To læsere samtidig er ufarligt, men en skriver sammen med en hvilken som helst anden proces giver “chaos” — skriveren skal have eneret (bog 7.1.2, s. 313).',
            'Varianterne handler om prioritet. *First* readers–writers: ingen læser venter, medmindre en skriver allerede har adgang — skrivere kan sulte. *Second*: når en skriver er klar, må ingen nye læsere starte — læsere kan sulte. Bogen løser kun den første.',
            'Løsningen bruger `semaphore rw_mutex = 1`, `semaphore mutex = 1` og `int read_count = 0`. Skriveren tager bare `rw_mutex`. Læseren låser `mutex`, tæller `read_count` op, og er den den **første** læser (`read_count == 1`), tager den `rw_mutex`; på vej ud tæller den ned, og er den den **sidste** (`read_count == 0`), frigiver den `rw_mutex`. Læsere midt i flokken rører ikke `rw_mutex`.',
            'Følger man det igennem: er en skriver inde, og venter `n` læsere, står 1 læser i kø på `rw_mutex` og `n − 1` på `mutex`. Når skriveren frigiver `rw_mutex`, afgør scheduleren, om de ventende læsere eller én ventende skriver kommer til (s. 314).',
          ],
        },
        {
          term: 'Reader–writer locks',
          body: [
            'Bogen generaliserer problemet til **reader–writer locks**: man tager låsen i *read mode* eller *write mode*. Flere tråde kan holde den i read mode samtidig, men kun én i write mode (s. 314–315).',
            'De betaler sig, når det er let at se, hvem der kun læser, og når der er flere læsere end skrivere — den ekstra samtidighed skal opveje, at låsen er dyrere at oprette end en semafor eller mutex. I SWD svarer det til `ReaderWriterLockSlim` i [[swd/threading|tråde og synkronisering i C#]].',
          ],
        },
        {
          term: 'Thread pools',
          body: [
            '03.2a s. 17 placerer thread pools under **implicit threading**: brugeren identificerer tasks, og et runtime-bibliotek afgør, hvordan de køres — en many-to-many-model, hvor nogle tasks får egne tråde og andre køres efter hinanden i samme tråd. “Thread pools are pre-allocated threads, which are reused, fx. for web clients. Fast, since no allocation at runtime, safe as the number of threads are limited.”',
            'Bogen (4.5.1) begrunder det: at oprette en tråd pr. request er dyrt, og ubegrænsede tråde kan udtømme systemet. En pool opretter et fast antal tråde ved opstart; en opgave sættes i en kø og tages af en ledig tråd. Fordele: hurtigere end at oprette en tråd, begrænset antal samtidige tråde, og opgaveoprettelse skilles fra udførelse. Eksemplerne er Windows’ `QueueUserWorkItem(&PoolFunction, NULL, 0)` og Javas `Executors.newFixedThreadPool(int size)`/`newCachedThreadPool()`.',
            'Køen mellem dem, der opretter opgaver, og worker-trådene er et producer–consumer-forhold. 08.1 bygger videre på det med **message passing** via køer, hvor trådene sender immutable beskeder over en eksplicit kanal i stedet for at dele en buffer — se [[message-passing|message passing og køer]].',
          ],
        },
      ],
      viz: 'bounded-buffer',
      keyPoints: [
        'Bounded buffer: `n` pladser, producent må ikke skrive i fuld, konsument ikke læse fra tom.',
        '`mutex = 1` beskytter bufferen; `empty = n` og `full = 0` tæller pladserne.',
        'Producent: `wait(empty)`, `wait(mutex)`, …, `signal(mutex)`, `signal(full)`. Konsument er spejlbilledet.',
        'Tællesemaforen tages før mutexen; omvendt kan give deadlock.',
        'Busy-wait-versionen med delt `count` er både spild af CPU og en race condition.',
        'Readers–writers: `rw_mutex` tages af skrivere og af første/sidste læser; `mutex` beskytter `read_count`.',
        'First readers–writers lader skrivere sulte; second lader læsere sulte.',
        'Thread pool: forhåndsoprettede tråde tager opgaver fra en kø — hurtigt og med et loft over antallet.',
      ],
      code: [
        {
          lang: 'c',
          title: 'Producer og consumer med tre semaforer',
          source: 'Silberschatz s. 312–313, figur 7.1 og 7.2',
          code: `int n;
semaphore mutex = 1;
semaphore empty = n;
semaphore full = 0

/* Producer (figur 7.1) */
while (true) {
      . . .
   /* produce an item in next_produced */
      . . .
   wait(empty);
   wait(mutex);
      . . .
   /* add next_produced to the buffer */
      . . .
   signal(mutex);
   signal(full);
}

/* Consumer (figur 7.2) */
while (true) {
   wait(full);
   wait(mutex);
      . . .
   /* remove an item from buffer to next_consumed */
      . . .
   signal(mutex);
   signal(empty);
      . . .
   /* consume the item in next_consumed */
      . . .
}`,
        },
        {
          lang: 'c',
          title: 'Busy-wait-udgangspunktet med delt count',
          source: '08.1-Message-Passing-and-Queues.pdf s. 3',
          code: `/* Producer */
while (true) {
  /* produce an item in next produced */
  while (count == BUFFER SIZE)
   ; /* do nothing */
  buffer[in] = next produced;
  in = (in + 1) % BUFFER SIZE;
  count++;
}

/* Consumer */
while (true) {
  while (count == 0)
   ; /* do nothing */
  next consumed = buffer[out];
  out = (out + 1) % BUFFER SIZE;
  count--;
  /* consume the item in next consumed */
}`,
        },
        {
          lang: 'c',
          title: 'First readers–writers',
          source: 'Silberschatz s. 313–314, figur 7.3 og 7.4',
          code: `semaphore rw_mutex = 1;
semaphore mutex = 1;
int read_count = 0;

/* Writer (figur 7.3) */
while (true) {
   wait(rw_mutex);
      . . .
   /* writing is performed */
      . . .
   signal(rw_mutex);
}

/* Reader (figur 7.4) */
while (true) {
   wait(mutex);
   read_count++;
   if (read_count == 1)
      wait(rw_mutex);
   signal(mutex);
      . . .
   /* reading is performed */
      . . .
   wait(mutex);
   read_count--;
   if (read_count == 0)
      signal(rw_mutex);
   signal(mutex);
}`,
        },
      ],
      exam: [
        'Bounded buffer er producer–consumer med en buffer på `n` pladser: producenten må ikke skrive i en fuld buffer, konsumenten ikke læse fra en tom, og kun én må ad gangen ændre bufferen.',
        'Bogens løsning bruger tre semaforer: `mutex` initialiseret til 1 giver gensidig udelukkelse, `empty` initialiseret til `n` tæller ledige pladser, og `full` initialiseret til 0 tæller fyldte. Producenten kalder `wait(empty)` og `wait(mutex)`, lægger elementet i og kalder `signal(mutex)` og `signal(full)`; konsumenten gør det spejlvendt.',
        'Uden semaforer, som i busy-wait-versionen på 08.1 s. 3, spinner trådene på `count`, og `count++`/`count--` er en race condition. Semaforerne lader i stedet trådene sove, til der er plads eller data.',
        'Rækkefølgen er vigtig: tager producenten `mutex` før `empty` på en fuld buffer, holder den låsen, mens den venter, og konsumenten kan aldrig komme ind og frigive en plads — en deadlock. Readers–writers har en lignende afvejning: bogens first-løsning lader flere læsere ind samtidig via `read_count`, men så kan skriverne sulte.',
        'En thread pool er en variant af samme mønster: opgaver sættes i en kø, og et fast antal forhåndsoprettede tråde tager dem ud. Det er hurtigere end at oprette en tråd pr. opgave og sætter et loft over antallet af tråde.',
      ],
      sources: [
        { path: k('context/book/SW3SYS-01_Ch06-07_Synchronization_Tools_and_Bounded_Buffer_Problem.md'), original: BOOK, pages: 's. 311–313', note: 'Afsnit 7.1–7.1.1 (PNG 0335–0337)' },
        { path: k('context/book/SW3SYS-01_Ch07-08_Synchronization_Examples_and_Deadlocks.md'), original: BOOK, pages: 's. 312–315', note: 'Afsnit 7.1.1–7.1.2 inkl. reader–writer locks (PNG 0336–0339)' },
        { path: k('context/slides/SW3SYS-01_Lecture08_1_MessagePassingAndQueues.md'), original: '08.1-Message-Passing-and-Queues.pdf', pages: 's. 2–4' },
        { path: k('context/slides/SW3SYS-01_Lecture03.2a_ThreadsAndConcurrency.md'), original: '03.2a-Threads-and-Concurrency.pdf', pages: 's. 17' },
        { path: k('context/book/SW3SYS-01_Ch04-05_Threads_Concurrency_CPU_Scheduling.md'), original: BOOK, pages: 's. 186', note: 'Afsnit 4.5.1 Thread pools (PNG 0210)' },
      ],
      gaps: [
        'Hverken slides eller kursets kode har bounded buffer, readers–writers eller en thread pool i C++. Slides viser kun bogens pseudokode (08.1 s. 3–4); 06.1 har ingen af de tre, selv om de står i bogens kapitel 7 ved siden af dining philosophers.',
        'Markdown-konverteringen `SW3SYS-01_Ch06-07_…md` indeholder en “komplet” C++20-version med `std::counting_semaphore` og to producenter/konsumenter. Den findes ikke i bogen eller i `lecture-code-main` og er ikke brugt som kilde her. Det samme gælder invarianten `empty + full = n` og huskereglen “EMP-ty før MUT-ex”.',
        'At byttede `wait(mutex)`/`wait(empty)` giver deadlock, står i begge markdown-konverteringer, men ikke på bogens s. 312–313 eller på slides.',
        '08.1 s. 4 siger “use mutex/conditional to control/signal its validity”, men koden bruger semaforer; markdown-konverteringen skriver “semaforer (condition variables)”, hvilket blander to forskellige mekanismer.',
        'Bogen kalder `read_count` “a counting semaphore initialized to 0” (s. 313), men erklærer den som `int read_count = 0` og bruger den som almindelig heltalsvariabel.',
        'Thread pools nævnes på 03.2a s. 17 og i bogens 4.5.1 kun med Windows- og Java-API’er. Materialet har ingen C++- eller POSIX-thread pool og kobler ikke selv thread pools til producer–consumer; den kobling er gjort her.',
        '08.1-slidene er dateret “September 2025” og kalder bogen “Abraham10” (Silberschatz, 10. udgave), mens kurset bruger Global Edition.',
        'Uden for materialet: C++20 har `std::counting_semaphore`/`std::binary_semaphore` (brugt i uge 4-koden), men ingen standard-reader–writer-lås før `std::shared_mutex` i C++17; materialet nævner ikke `std::shared_mutex`.',
      ],
      keywords: ['bounded buffer', 'bounded-buffer problem', 'producer-consumer', 'producer–consumer', 'producent', 'konsument', 'empty', 'full', 'mutex', 'wait', 'signal', 'counting semaphore', 'binary semaphore', 'busy wait', 'count', 'BUFFER_SIZE', 'cirkulær buffer', 'readers-writers', 'readers–writers', 'rw_mutex', 'read_count', 'reader-writer lock', 'read mode', 'write mode', 'starvation', 'thread pool', 'trådpulje', 'implicit threading', 'QueueUserWorkItem', 'newFixedThreadPool', 'OpenMP', 'Abraham10'],
    },
  ],
}
