import type { Part } from '../types'
import { k } from './paths'

const SL04 = k('context/slides/SW3SYS-01_Lecture04.1_Synchronisation-tools.md')
const SL06 = k('context/slides/SW3SYS-01_Lecture06_1_SynchronisationExamples.md')
const BOG6 = k('context/book/SW3SYS-01_Ch06_Synchronization_Tools.md')
const BOG6B = k('context/book/SW3SYS-01_Ch06-07_Synchronization_Tools_and_Bounded_Buffer_Problem.md')
const BOG7 = k('context/book/SW3SYS-01_Ch07-08_Synchronization_Examples_and_Deadlocks.md')
const KODE = k('context/kode/SW3SYS-01_Code_week_4_sync_tools.md')
const KODE_ORIG = k('data/lecture-code-main/lecture-code-main/week_4_sync_tools/synchronization-tools.cpp')
const BOG = 'Silberschatz, Operating System Concepts (Global Edition)'
const P04 = '04.1-Synchronisation-tools.pdf'
const P06 = '06.1-Synchronisation-Examples.pdf'

export const synkronisering: Part = {
  id: 'synkronisering',
  title: 'Synkroniseringsværktøjer',
  topics: [
    // ─────────────────────────────────────────────────────────────
    {
      slug: 'kritisk-sektion',
      title: 'Race conditions og kritisk sektion',
      short: 'Kritisk sektion',
      week: 'Uge 4 · L4.1',
      definition:
        'En **race condition** opstår, når flere tråde eller processer tilgår og ændrer delte data samtidig, og resultatet afhænger af den rækkefølge, instruktionerne tilfældigvis bliver udført i. Den kodedel, hvor de delte data tilgås, er den **kritiske sektion**. Critical-section problemet er at designe en protokol, der opfylder tre krav: mutual exclusion, progress og bounded waiting.',
      concepts: [
        {
          term: 'Motivation: interleaved output',
          body: [
            'Decket starter med `usynchronized_example()`: fire tråde, der hver skriver `"Thread " << id << " running"` til `std::cout`. Forventet er fire pæne linjer; det viste output er `Thread Thread 0 running`, `Thread 3Thread running`, `2 running1 running` (04.1 s. 4).',
            'Forklaringen på s. 5: skrivning til `cout` er IO-bundet og får tråden til at vente, så en anden tråd kommer til midt i en linje. Tabellen viser otte operationer, hvor fx Thread 3 skriver `"Thread 3"` i op 2 og `" running\\n"` først i op 4, mens Thread 2 har skrevet `"Thread "` imellem. `cout <<`-kæden er altså flere operationer, ikke én.',
          ],
        },
        {
          term: 'Race condition på count++ (bogen)',
          body: [
            'Bogens eksempel er bounded buffer med en delt `count`, som produceren tæller op og consumeren tæller ned (§6.1). `count++` bliver til tre maskininstruktioner: `register1 = count`, `register1 = register1 + 1`, `count = register1` — load, add, store. `count--` tilsvarende med `register2`.',
            'Med `count = 5` viser bogen interleavingen T0–T5: produceren loader 5 og lægger 1 til (6), consumeren loader 5 og trækker 1 fra (4), produceren gemmer 6, consumeren gemmer 4. Resultatet er `count = 4`, selv om det rigtige er 5; byttes T4 og T5 om, bliver det 6. Definitionen: resultatet afhænger af “the particular order in which the access takes place”, og derfor skal processerne synkroniseres.',
            'Kernen har de samme problemer: listen over åbne filer, hukommelsesallokering, proceslister og `next_available_pid` — Figur 6.2 viser to processer, der kalder `fork()` samtidig og begge får pid 2615 (§6.2, s. 277).',
          ],
        },
        {
          term: 'De tre krav til en løsning',
          body: [
            'Bogen deler en proces i **entry section**, **critical section**, **exit section** og **remainder section** (Figur 6.1). En løsning skal opfylde:',
            '**Mutual exclusion**: kun én proces i den kritiske sektion ad gangen. **Progress**: kun processer, der aktivt forsøger at komme ind (ikke dem i remainder section), deltager i valget af den næste, og valget kan ikke udsættes uendeligt. **Bounded waiting**: der er en grænse for, hvor mange gange andre kan “cut in line”, efter en proces har bedt om adgang (04.1 s. 6; §6.2 s. 276–277).',
            'På en single-core kunne man slå interrupts fra, mens den delte variabel ændres — det virker ikke på multiprocessorer, og det er grunden til, at bogen går videre til software- og hardwareløsninger (§6.2).',
          ],
        },
        {
          term: 'Peterson’s solution',
          body: [
            'En klassisk softwareløsning for **to** tråde med to delte variabler: `bool flag[2]` (“jeg vil ind”) og `int turn` (hvis tur det er). Tråd `i` sætter `flag[i] = true`, giver turen væk med `turn = j` og busy-waiter i `while (flag[j] && turn == j) {}`. Efter den kritiske sektion sætter den `flag[i] = false` (04.1 s. 7–9, `petersens_solution()` i kurskoden).',
            'Bogen beviser de tre krav (§6.3 s. 279–280): `turn` kan kun være `i` eller `j`, så begge kan ikke passere samtidig; og da `P_j` sætter `turn = i`, når den vil ind igen, venter `P_i` højst på én indgang fra `P_j` (bounded waiting).',
            '**Men det virker ikke på moderne computere.** CPU’en (og compileren) må omordne skrivninger uden dataafhængighed. Slidet s. 10 viser tidslinjen: begge tråde får `turn = …` udført før `flag[…] = true`, og ved t5 ser begge betingelsen som opfyldt — begge er i den kritiske sektion. Bogen giver samme pointe med `x = 100; flag = true;`, hvor tråd 1 kan printe 0 (§6.3 s. 280).',
          ],
        },
        {
          term: 'Hardware support: memory barriers',
          body: [
            'Moderne CPU’er giver to slags hjælp: **memory barriers** og **atomic variables** (04.1 s. 11). En memory barrier sikrer, at load/store før barrieren er udført, før nogen efterfølgende load/store — den “forces the CPU NOT to re-order instructions” (s. 12).',
            'Slidet indsætter `std::atomic_thread_fence(std::memory_order_acquire);` mellem `flag[i] = true` og `turn = j` i Peterson-tråden — samme sted, som bogen anbefaler: “between the first two assignment statements in the entry section” (§6.4.1 s. 282). Bogen skelner mellem **strongly ordered** og **weakly ordered** memory models og skriver, at barrierer typisk kun bruges af kerneudviklere i specialiseret kode (§6.4.1 s. 281–282).',
          ],
        },
        {
          term: 'test_and_set, compare_and_swap og atomic variables',
          body: [
            'Atomic variables giver atomisk adgang til simple variabler; skriveadgang er “queued”, så kun én tråd sætter værdien ad gangen. De bygger på to CPU-instruktioner (04.1 s. 13): **test-and-set** læser, opdaterer og returnerer den *gamle* værdi; **compare-and-swap** opdaterer kun, hvis værdien er lig med en forventet værdi.',
            'I C++ er det `exchange` og `compare_exchange_strong` på `std::atomic<int>`. Slidets `atomic_example()`: `exchange(23)` giver 0, `exchange(34)` giver 23; `compare_exchange_strong(expected = 34, 45)` lykkes (værdi 45), det næste kald med 56 fejler, og værdien forbliver 45 (s. 14).',
            'Bogen viser, at `while (compare_and_swap(&lock, 0, 1) != 0);` giver mutual exclusion, men **ikke bounded waiting**; Figur 6.9 tilføjer et `waiting[n]`-array, så den, der forlader sektionen, scanner cyklisk efter den næste (§6.4.2). På x86 er CAS `lock cmpxchg`. Atomic variables løser ikke alt: med en atomisk `count` i bounded buffer kan to consumers stadig begge forlade venteløkken, når `count` bliver 1 (§6.4.3 s. 286).',
          ],
        },
        {
          term: 'Lock-free som alternativ',
          body: [
            'Låsning giver overhead fra at flytte tråde ind og ud af wait- og run-køer. **Lock-free algoritmer** kan være mere effektive og bygges med CAS (`std::atomic::compare_exchange_strong`). Slidets eksempel: en trådsikker cirkulær buffer kun med en atomisk head (producer) og tail (consumer) (04.1 s. 44).',
            'Bogen kalder CAS-tilgangen *optimistisk* (opdatér, opdag kollision, prøv igen) og låsning *pessimistisk*. Uncontended: CAS lidt hurtigere; moderate contention: CAS “possibly much faster”; high contention: traditionel synkronisering bliver hurtigst. Lock-free algoritmer er svære at udvikle og teste (§6.9 s. 300–302).',
          ],
        },
      ],
      viz: 'race-counter',
      keyPoints: [
        'Race condition: resultatet afhænger af rækkefølgen af samtidige adgange til delte data.',
        '`count++` = load, add, store — tre instruktioner, der kan interleaves (bogen: 5 → 4 eller 6).',
        'Tre krav: mutual exclusion, progress, bounded waiting.',
        'Peterson: `flag[i] = true; turn = j; while (flag[j] && turn == j);` — korrekt på papiret, for to tråde.',
        'Moderne CPU’er omordner skrivninger, så Peterson kan lukke begge tråde ind.',
        'Hardware support: memory barriers og atomics bygget på test-and-set og compare-and-swap.',
        '`exchange` = test-and-set, `compare_exchange_strong` = CAS i C++.',
        'Simpel CAS-lås giver mutual exclusion, men ikke bounded waiting.',
        'Lock-free = optimistisk CAS; godt ved moderat contention, svært at gøre korrekt.',
      ],
      code: [
        {
          lang: 'text',
          title: 'count++ og count-- interleavet (bogen, count = 5)',
          source: 'Silberschatz §6.1 s. 275',
          code: `T0: producer  register1 = count          {register1 = 5}
T1: producer  register1 = register1 + 1  {register1 = 6}
T2: consumer  register2 = count          {register2 = 5}
T3: consumer  register2 = register2 - 1  {register2 = 4}
T4: producer  count = register1          {count = 6}
T5: consumer  count = register2          {count = 4}`,
        },
        {
          lang: 'cpp',
          title: 'Peterson’s solution',
          source: '04.1-Synchronisation-tools.pdf s. 7 / lecture-code-main/week_4_sync_tools/synchronization-tools.cpp',
          code: `void petersens_solution() {
    std::vector<std::thread> threads;
    int turn = 0;
    bool flag[2]={false, false};

    auto a_thread = [&](int i)
    {
        int j = 1 - i;
        flag[i] = true;
        turn = j;
        while (flag[j] && turn == j) {}
        for (int k=0; k<100;++k)
            std::cout << i ; // Print thread id
        flag[i] = false;
    };

    for (int i = 0; i < 2; ++i)
        threads.emplace_back(a_thread, i);

    for (auto& t : threads)
        t.join();  }`,
        },
        {
          lang: 'cpp',
          title: 'Memory barrier i Peterson-tråden',
          source: '04.1-Synchronisation-tools.pdf s. 12',
          code: `auto a_thread = [&](int i)
{
    int j = 1 - i;
    flag[i] = true;
    std::atomic_thread_fence(std::memory_order_acquire); // Memory Barrier
    turn = j;
    while (flag[j] && turn == j) {}
    for (int k=0; k<100;++k)
        std::cout << i ;
    flag[i] = false;
};`,
        },
        {
          lang: 'cpp',
          title: 'test-and-set og compare-and-swap med std::atomic',
          source: '04.1-Synchronisation-tools.pdf s. 14',
          code: `void atomic_example(){
    std::atomic<int> value = {0};

    // test-and-set (return old, set new value)
    cout << value.exchange(23) << std::endl; // 0
    cout << value.exchange(34) << std::endl; // 23

    // compare-and-swap (if as expected, update)
    int expected = 34;
    value.compare_exchange_strong(expected, 45); //true
    std::cout << value.load() << std::endl; // 45
    value.compare_exchange_strong(expected, 56); //false
    std::cout << value.load() << std::endl; // 45
}`,
        },
      ],
      exam: [
        'En race condition er, når flere tråde tilgår delte data samtidig, og resultatet afhænger af rækkefølgen. Klassikeren er `count++`, der er tre instruktioner — load, add, store — så hvis producer og consumer interleaver, kan `count` ende på 4 eller 6 i stedet for 5.',
        'Den kode, der rører de delte data, er den kritiske sektion, og en løsning skal opfylde tre krav: mutual exclusion, progress — kun dem, der vil ind, er med til at bestemme — og bounded waiting, altså en grænse for hvor mange der kan springe foran.',
        'Peterson’s solution løser det i software for to tråde med `flag[2]` og `turn`: jeg markerer, at jeg vil ind, giver turen væk og venter, så længe den anden både vil ind og har turen. Den er korrekt på papiret, men i kursets slides ser man, at CPU’en kan omordne `turn = j` før `flag[i] = true`, og så kommer begge ind.',
        'Derfor bruger man hardware: memory barriers, der forbyder omordning, og atomiske instruktioner som test-and-set og compare-and-swap — i C++ `exchange` og `compare_exchange_strong` på `std::atomic`. Mutex og semaforer er bygget oven på dem.',
        'Afvejningen: en simpel CAS-lås giver mutual exclusion men ikke bounded waiting, og atomics beskytter kun én variabel ad gangen. Lock-free algoritmer med CAS kan være hurtigere ved moderat contention, men er svære at skrive og teste.',
      ],
      sources: [
        { path: SL04, original: P04, pages: 's. 4–14, 42–44' },
        { path: BOG6, original: BOG, pages: '§6.1–6.4, 6.9 (s. 273–286, 300–302)' },
        { path: BOG6B, original: BOG, note: 'Kort resumé af race condition, CAS og atomics (kap. 6.0)' },
        { path: KODE, note: 'Konvertering af ugens kode' },
        { path: KODE_ORIG, note: '`usynchronized_example`, `petersens_solution`, `atomic_example`' },
      ],
      gaps: [
        'Slides 04.1 motiverer kun med interleaved `cout`-output (s. 4–5); race condition på `counter++`/`count++` som load/add/store findes kun i bogen (§6.1). Ordet “race condition” står ikke på noget slide i 04.1 — kun “races” på s. 26.',
        'Slidet om memory barriers (s. 12) viser en barriere i Peterson-tråden, men kurskoden (`petersens_solution()`) har ingen barriere og bruger almindelige `int`/`bool`, ikke `std::atomic`.',
        'Uden for materialet: `std::memory_order_acquire`-fencen mellem to stores forhindrer ikke, at `flag[i] = true` bliver synlig efter læsningen af `flag[j]` (store-load-omordning). Peterson kræver i C++ sekventielt konsistente atomics eller `memory_order_seq_cst`-fence; ikke-atomiske delte variabler er desuden et data race og dermed udefineret adfærd.',
        'Tidslinjen på s. 10 lader CPU’en flytte `turn = j` før `flag[i] = true`; bogen taler generelt om, at “processors and/or compilers may reorder read and write operations” (§6.3 s. 280) og viser et andet eksempel (`x = 100; flag = true;`).',
        'Slidet (s. 14) kommenterer `compare_exchange_strong` som “compare-and-swap”; bogens `compare_and_swap()` returnerer den gamle værdi, mens C++-versionen returnerer `bool` og skriver den aktuelle værdi tilbage i `expected` ved fejl. Det sidste står kun i markdown-konverteringens egen kommentar, ikke på slidet.',
        'Bounded-waiting-varianten med `waiting[n]` (Figur 6.9) og `lock cmpxchg` står kun i bogen, ikke på slides.',
        'Stavefejl: “PETERSONS SOLUTION” og funktionsnavnet `petersens_solution` (s. 7), `usynchronized_example` (s. 4), “adressed” (s. 42), “implementet” (s. 44).',
      ],
      keywords: ['race condition', 'kapløbstilstand', 'critical section', 'kritisk sektion', 'CS', 'entry section', 'exit section', 'remainder section', 'mutual exclusion', 'progress', 'bounded waiting', 'Peterson', 'petersens_solution', 'flag', 'turn', 'instruction reordering', 'memory barrier', 'memory fence', 'atomic_thread_fence', 'memory_order_acquire', 'test_and_set', 'compare_and_swap', 'CAS', 'exchange', 'compare_exchange_strong', 'std::atomic', 'atomic variable', 'lock-free', 'count++', 'interleaving', 'cmpxchg'],
    },

    // ─────────────────────────────────────────────────────────────
    {
      slug: 'mutex-spinlock',
      title: 'Mutex og spinlocks',
      short: 'Mutex og spinlock',
      week: 'Uge 4 · L4.1',
      definition:
        'En **mutex** (mutual exclusion lock) beskytter en kritisk sektion med to operationer: `lock()`/acquire før og `unlock()`/release efter. Den er ejet af én tråd ad gangen, og kun den tråd kan låse op. En tråd, der ikke kan få låsen, lægges i wait-køen; en **spinlock** venter i stedet med busy waiting.',
      concepts: [
        {
          term: 'Lock og unlock',
          body: [
            'En mutex er implementeret med atomiske instruktioner og har to operationer: `lock()`, der forsøger at tage låsen, og `unlock()`, der frigiver den. Kan tråden ikke få låsen, lægges den i **wait queue** (04.1 s. 15) — slidet viser procestilstandsdiagrammet, hvor tråden går fra running til waiting.',
            'Brugen på s. 17: 1) før den kritiske sektion forsøger man at tage låsen — ledig: fortsæt; optaget: vent; 2) kør den kritiske sektion; 3) efter den kritiske sektion **skal** låsen frigives. To egenskaber står med fed: “A Mutex is owned by one thread at a time” og “Only the locking thread can unlock the Mutex”.',
            'Bogens model er en boolean `available`: `acquire()` venter, til den er sand, og sætter den falsk; `release()` sætter den sand. Begge skal udføres atomisk, fx med CAS (§6.5 s. 286–287).',
          ],
        },
        {
          term: 'std::mutex i kursets kode',
          body: [
            '`mutex_example()` (s. 21–24) starter 10 tråde, der deler én `std::mutex the_lock`. Hver tråd kalder `the_lock.lock()`, skriver `"Thread #" << id << "running"` og kalder `the_lock.unlock()`. Animationen fremhæver de tre linjer efter tur: acquire, kritisk sektion, release. Nu bliver linjerne ikke flettet sammen som i motivationseksemplet.',
            'Kurskoden har også `mutex_example_orig()`, hvor `mtx.lock()`/`mtx.unlock()` er udkommenteret — samme program uden lås, til at sammenligne output.',
          ],
        },
        {
          term: 'lock_guard og unique_lock',
          body: [
            'Uge 6 introducerer wrapper-klasser, der gør mutex-brug sikrere (06.1 s. 9): **`std::lock_guard`** og **`std::unique_lock`**. Konstruktøren låser (evt.) den givne mutex, destruktøren låser op. De implementerer en **scoped lock**; `unique_lock` har “additional features”.',
            'Slidets eksempel: `const std::lock_guard<std::mutex> lock(mtx); // ~ mtx.lock()` og kommentaren `// Scope ends: ~ mtx.unlock()` ved lambdaens afsluttende krølleparentes. Det er RAII anvendt på låse — se [[raii|RAII]]. `unique_lock` er nødvendig til condition variables, se [[monitor-cv|monitorer og condition variables]].',
          ],
        },
        {
          term: 'Lock contention',
          body: [
            'En **uncontended** lås giver direkte adgang til den kritiske sektion; en **contended** lås blokerer, fordi en anden holder den. Slidet (s. 19) viser fire tråde, hvor Thread 1 får låsen uncontended, og Thread 2–4 alle står i contended lock. High contention = mange tråde prøver at tage låsen; low contention = låsen er let tilgængelig. “Systems with highly contented locks provide poor performance.” Bogen siger det samme (§6.5 s. 287).',
          ],
        },
        {
          term: 'Spinlocks og busy waiting',
          body: [
            'En **spinlock** er en særlig mutex, der venter i en busy-waiting-løkke i stedet for at blive lagt i wait-køen. Den bruges til at synkronisere cores i multiprocessorsystemer og er nyttig i korte perioder — “Duration shorter than two context switches!” (04.1 s. 25, med henvisning til rigtorp.se/spinlock).',
            'Kursets `test_and_set_lock` er en `std::atomic<bool> lock_`. `lock()` er `while(lock_.exchange(true, std::memory_order_acquire));` — kommer kun igennem, hvis den gamle værdi var `false`. `unlock()` er `lock_.store(false, std::memory_order_release);`. Kodekommentaren forklarer, at `exchange` bruger CPU’ens test-and-set, og at acquire sikrer, at skrivninger fra den tråd, der frigav låsen, er synlige.',
            'Bogen: busy waiting spilder CPU-cykler, som andre processer kunne bruge; fordelen er, at der ikke skal context-switches, så spinlocks er foretrukne på multicore, når låsen holdes kort. Tommelfingerreglen er den samme: kortere end to context switches, fordi det at vente på en lås koster netop to — én ind i waiting og én tilbage (§6.5 s. 288).',
          ],
        },
        {
          term: 'Mutual exclusion dangers: deadlock',
          body: [
            '“Wrong locking order or races may result in deadlocks” (04.1 s. 26–27). I `mutex_error_deadlock()` tager `thread_a` først `mut_a`, skriver 50 tegn (“IO Wait, Give other thread time slice”) og tager så `mut_b`; `thread_b` gør det omvendt. Kommentarerne `// May be locked by thread_b` og `// May be locked by thread_a` viser, hvor de hænger.',
            'Kurskoden har den samme fejl med to binære semaforer (`semaphore_binary_error_deadlock()`); begge er udkommenteret i `main()`, fordi programmet ellers hænger. Betingelserne og løsningerne hører til [[deadlock-betingelser|deadlock-betingelser]] og [[dining-philosophers|dining philosophers]]. Summary s. 43 nævner også **priority inversion** som liveness-problem.',
          ],
        },
      ],
      viz: 'mutex-vs-spin',
      keyPoints: [
        'Mutex: `lock()` før, `unlock()` efter den kritiske sektion — altid parvis.',
        'Ejet af én tråd; kun den låsende tråd må låse op.',
        'Optaget mutex → tråden i wait-køen (waiting-tilstand); spinlock → busy waiting.',
        'Spinlock kun ved korte ventetider: kortere end to context switches.',
        '`test_and_set_lock`: `while(lock_.exchange(true, acquire));` / `store(false, release)`.',
        '`lock_guard`/`unique_lock` låser i konstruktøren og låser op i destruktøren (scoped lock).',
        'High contention = dårlig performance.',
        'Forskellig låserækkefølge i to tråde → deadlock.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'std::mutex om en kritisk sektion',
          source: '04.1-Synchronisation-tools.pdf s. 21',
          code: `void mutex_example() {
    const int num_threads = 10;
    std::vector<std::thread> threads;
    std::mutex the_lock;

    auto locking_thread = [&](int id)
    {
        the_lock.lock();   // Try to acquire lock and access CS
        std::cout << "Thread #" << id << "running" << std::endl;
        the_lock.unlock(); // Release lock
    };

    // Launch threads and wait for them to join
    for (int i = 0; i < num_threads; ++i)
        threads.emplace_back(locking_thread, i);

    for (auto& t : threads)
        t.join();
}`,
        },
        {
          lang: 'cpp',
          title: 'Spinlock bygget på test-and-set',
          source: '04.1-Synchronisation-tools.pdf s. 25',
          code: `struct test_and_set_lock {
    std::atomic<bool> lock_ = {false};

     void lock() {
         // Only pass if lock was 'false' before setting it 'true'
         while(lock_.exchange(true, std::memory_order_acquire)); }

     void unlock() {
         lock_.store(false, std::memory_order_release); }
};`,
        },
        {
          lang: 'cpp',
          title: 'Scoped lock med std::lock_guard',
          source: '06.1-Synchronisation-Examples.pdf s. 9',
          code: `int main() {
std::mutex mtx;
auto thread_a = [&]() {
 const std::lock_guard<std::mutex> lock(mtx); // ~ mtx.lock()
 std::cout << "Hi " << "thread a";
}; // Scope ends: ~ mtx.unlock()

std::thread t(thread_a);
t.join();
}`,
        },
        {
          lang: 'cpp',
          title: 'Deadlock ved omvendt låserækkefølge',
          source: '04.1-Synchronisation-tools.pdf s. 27',
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
        t.join();  }`,
        },
      ],
      exam: [
        'En mutex beskytter en kritisk sektion: man kalder `lock()` før og `unlock()` efter, og den er ejet af den tråd, der låste den — kun den må låse op. Kan en tråd ikke få låsen, lægger OS’et den i wait-køen, så den ikke bruger CPU.',
        'I kursets `mutex_example()` deler 10 tråde én `std::mutex`, og så bliver output-linjerne ikke længere flettet sammen, som de gjorde i det usynkroniserede eksempel. I praksis bruger man `std::lock_guard` eller `std::unique_lock`, der låser i konstruktøren og låser op i destruktøren, så man ikke kan glemme det.',
        'En spinlock venter i stedet med busy waiting. Kursets `test_and_set_lock` kører `while(lock_.exchange(true))`, altså test-and-set, til den gamle værdi var `false`. Det kan betale sig, når ventetiden er kortere end to context switches, fordi man sparer skiftet — men ellers brænder man CPU-tid.',
        'Contention er afgørende: med mange tråde om samme lås bliver performance dårlig. Og den store faldgrube er deadlock: i `mutex_error_deadlock()` tager to tråde `mut_a` og `mut_b` i modsat rækkefølge og venter på hinanden for evigt.',
      ],
      sources: [
        { path: SL04, original: P04, pages: 's. 15–27, 43' },
        { path: SL06, original: P06, pages: 's. 9' },
        { path: BOG6, original: BOG, pages: '§6.5 (s. 286–288)' },
        { path: KODE, note: 'Konvertering af ugens kode' },
        { path: KODE_ORIG, note: '`test_and_set_lock`, `spinlock_example`, `mutex_example`, `mutex_error_deadlock`, `semaphore_binary_error_deadlock`' },
      ],
      gaps: [
        'Slides og bog er uenige om, hvordan en mutex venter. Slidet siger, at en tråd, der ikke får låsen, lægges i wait-køen (04.1 s. 15), og kalder spinlocks en *særlig* mutex. Bogens `acquire()` venter derimod med busy waiting og skriver, at den type mutex, den har beskrevet, også kaldes en spinlock (§6.5 s. 288).',
        'Slide s. 25 skriver “Relies on atomic operations (here: set-and-test)”; instruktionen hedder test-and-set (s. 13 og bogen §6.4.2).',
        '`lock_guard`/`unique_lock` kommer først i 06.1 (s. 9), ikke i 04.1. Hvad `unique_lock`’s “additional features” er, siger slidet ikke.',
        'Slide 04.1 s. 26–27 viser kun problemet. Løsningen “tag altid låsene i samme rækkefølge” står i markdown-konverteringens kommentar, ikke på slidet; den kommer i 06.1 s. 6 som krav 1 i dining philosophers.',
        'Kurskoden inkluderer ikke `<mutex>` (kun `<iostream>`, `<atomic>`, `<thread>`, `<vector>`, `<semaphore>`) og kompilerer kun, fordi en af de andre headere trækker den ind. `spinlock_example()` og `mutex_example()` er udkommenteret i `main()`.',
        'Uden for materialet: `std::mutex` på Linux er typisk implementeret med futex, der spinner kort i user space og først derefter lægger tråden i kernens venteliste — altså en blanding af de to strategier.',
        'Stavefejl på slides: “Also know as”, “implementet” (s. 15), “highly contented locks” (s. 19).',
      ],
      keywords: ['mutex', 'mutual exclusion lock', 'lock', 'unlock', 'acquire', 'release', 'std::mutex', 'lock_guard', 'unique_lock', 'scoped lock', 'RAII', 'wait queue', 'spinlock', 'spin lock', 'busy waiting', 'test_and_set_lock', 'exchange', 'memory_order_acquire', 'memory_order_release', 'contention', 'contended', 'uncontended', 'context switch', 'deadlock', 'mutex_error_deadlock', 'priority inversion', 'ownership'],
    },

    // ─────────────────────────────────────────────────────────────
    {
      slug: 'semaforer',
      title: 'Semaforer',
      week: 'Uge 4 · L4.1',
      definition:
        'En **semafor** er en heltalsværdi, der kun tilgås med to atomiske operationer: `wait()` (P, acquire), der venter, til værdien kan tælles ned, og `signal()` (V, release), der tæller op. En **binær** semafor (0/1) kan give mutual exclusion som en mutex; en **tællende** semafor styrer adgang til et endeligt antal ressourcer. Semaforen har ingen ejer — alle kan signalere den.',
      concepts: [
        {
          term: 'wait og signal (P og V)',
          body: [
            'Semaforer blev introduceret af **Dijkstra** og bruges til signalering (04.1 s. 28). Operationerne: `wait()` (test/acquire) venter på, at semaforen kan dekrementeres; `signal()` (increment/release) signalerer, at den frigives, og inkrementerer (s. 29).',
            'Bogen giver de hollandske navne: `wait()` hed oprindeligt **P** (*proberen*, “to test”), `signal()` hed **V** (*verhogen*, “to increment”). Den klassiske definition er `wait(S) { while (S <= 0); S--; }` og `signal(S) { S++; }`, og test og ændring skal ske atomisk (§6.6 s. 288–289).',
            'I C++20 er det `std::binary_semaphore` og `std::counting_semaphore` (header `<semaphore>`) med `acquire()` og `release()`.',
          ],
        },
        {
          term: 'Binær semafor',
          body: [
            'En binær semafor kan kun være 0 eller 1 og opfører sig som en mutex; på systemer uden mutex locks kan den bruges til mutual exclusion (§6.6.1 s. 289).',
            'Kursets `semaphore_binary()` (04.1 s. 30–33): `std::binary_semaphore sem{1};`, 10 tråde, der hver kalder `sem.acquire()`, skriver deres id 50 gange og kalder `sem.release()`. Outputtet (s. 34) er 50 × 0, 50 × 1, 50 × 3, 50 × 5 … — “One thread active at a time”. Bemærk, at rækkefølgen af tråde ikke er 0–9, men 0, 1, 3, 5, 6, 7, 8, 2, 4, 9.',
          ],
        },
        {
          term: 'Tællende semafor',
          body: [
            'En counting semaphore initialiseres til antallet af tilgængelige ressourcer. Hver `wait()` bruger én, hver `signal()` giver én tilbage; når tælleren er 0, er alle i brug, og nye tråde blokerer (§6.6.1 s. 289).',
            '`semaphore_counting()` (s. 35–38) er samme program med `std::counting_semaphore sem{2};`. Outputtet (s. 39) viser tallene flettet to og to — slidet lister parrene (0,2), (2,5), (5,4), (4,1), (1,3), (3,7), (3,8), (3,6), (6,9).',
            'Bogen viser også semaforen som ren **ordningsmekanisme**: en semafor `synch` initialiseret til 0; `P1` kører `S1; signal(synch);`, `P2` kører `wait(synch); S2;`, så `S2` først udføres efter `S1` (§6.6.1 s. 289–290). Bounded buffer med `empty`/`full`/`mutex` bygger på det — se [[bounded-buffer|bounded buffer]].',
          ],
        },
        {
          term: 'Implementering med ventekø',
          body: [
            'Definitionen med `while (S <= 0);` er busy waiting, ligesom bogens mutex. Løsningen i §6.6.2 (s. 290–291): en semafor er en `struct` med `int value` og `struct process *list`. `wait()` gør `S->value--`, og er værdien derefter negativ, lægges processen i listen og kalder `sleep()`. `signal()` gør `S->value++`, og er værdien ≤ 0, fjernes en proces fra listen og vækkes med `wakeup(P)`.',
            '`sleep()` flytter processen til waiting-tilstanden, `wakeup()` til ready — CPU-scheduleren vælger, om den kører med det samme. I denne variant kan værdien blive **negativ**, og så er størrelsen antallet af ventende. En FIFO-kø giver bounded waiting, men korrekt brug afhænger ikke af køstrategien.',
            '`wait()` og `signal()` skal selv være atomiske — det er et critical-section problem. På en single-core kan man slå interrupts fra; på multicore bruger man CAS eller spinlocks. Busy waiting er altså ikke væk, men flyttet til de korte kritiske sektioner i `wait()`/`signal()` (“no more than about ten instructions”).',
          ],
        },
        {
          term: 'Faren: ingen ejerskab',
          body: [
            '“A Semaphore is NOT owned by one thread at a time. Anyone can signal/increment/release a Semaphore. Incorrect usage can result in timing errors!” (04.1 s. 29).',
            '`semaphore_counting_error()` (s. 40) viser det: 8 tråde deler `std::counting_semaphore sem{2}`, plus en `buggy_thread`, der skriver `"BUG"` og kalder `sem.release()` uden først at have kaldt `acquire()` (“Enables three threads, sometime..”). Efter “BUG” i outputtet er tre tråde flettet: (0,4,6), (6,4,5), (6,5,7), (5,7,2) i stedet for to.',
            'Bogen lister de typiske fejl (§6.7 s. 292–293): `signal(mutex)` før `wait(mutex)` bryder mutual exclusion; `wait(mutex)` to gange giver permanent blokering; mangler `wait()` eller `signal()`, bryder man enten mutual exclusion eller blokerer for evigt. To semaforer taget i omvendt rækkefølge giver deadlock (§6.8.1) — se [[deadlock-betingelser|deadlock-betingelser]].',
          ],
        },
        {
          term: 'Semafor vs. mutex',
          body: [
            'Mutex: ejet af den låsende tråd, kun den kan låse op, én ad gangen. Binær semafor: samme “én ad gangen”, men uden ejer — derfor kan den bruges til signalering mellem tråde (én tråd venter, en anden signalerer), hvilket en mutex ikke kan. Tællende semafor: op til N samtidige. Summary s. 42: mutual exclusion, progress og bounded waiting kan løses med mutexes og semaforer, der bygger på CPU’ens atomiske operationer.',
            'I SWD er det samme skel: `Mutex` frigives kun af ejeren, `Semaphore` er thread-agnostic — se [[swd/threading|C#-låse i SWD]].',
          ],
        },
      ],
      viz: 'semaphore-queue',
      keyPoints: [
        'Semafor = heltal + `wait()`/`signal()` (P/V, acquire/release), atomisk.',
        'Dijkstra: P = *proberen*, V = *verhogen*.',
        'Binær (0/1) ≈ mutex; tællende = N instanser af en ressource.',
        '`std::binary_semaphore sem{1}` → én ad gangen; `std::counting_semaphore sem{2}` → to og to.',
        'Implementering med ventekø: `value--`, negativ → `sleep()`; `value++`, ≤ 0 → `wakeup(P)`.',
        'Negativ værdi = antal ventende (i kø-varianten).',
        'Ingen ejerskab: en fremmed `release()` lukker én tråd for meget ind.',
        'Semafor initialiseret til 0 kan tvinge en rækkefølge (`S1` før `S2`).',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Binær semafor — én tråd ad gangen',
          source: '04.1-Synchronisation-tools.pdf s. 30',
          code: `void semaphore_binary()
{
    std::binary_semaphore sem{1};
    std::vector<std::thread> threads;
    const int num_threads = 10;

    auto a_thread = [&](int i)
    {
        sem.acquire();
        for (int k = 0; k < 50; ++k)
            std::cout << i ; // Print thread id
        sem.release();
    };

    for (int i = 0; i < num_threads; ++i)
        threads.emplace_back(a_thread, i);
    for (auto& t : threads)
        t.join();
}
// std::counting_semaphore sem{2};  -> to tråde ad gangen (s. 35)`,
        },
        {
          lang: 'cpp',
          title: 'No ownership: release uden acquire',
          source: '04.1-Synchronisation-tools.pdf s. 40',
          code: `void semaphore_counting_error()
{
    std::counting_semaphore sem{2};
    std::vector<std::thread> threads;
    const int num_threads = 8;

    auto a_thread = [&](int i)
    {
        sem.acquire();
        for (int k = 0; k < 50; ++k)
            std::cout << i ;
        sem.release();
    };
    auto buggy_thread = [&]()
    {
        std::cout << "BUG" ;
        sem.release(); // Enables three threads, sometime..
    };
    for (int i = 0; i < num_threads; ++i)
        threads.emplace_back(a_thread, i);
    threads.emplace_back(buggy_thread);
    for (auto &t : threads)
        t.join();
}`,
        },
        {
          lang: 'c',
          title: 'Semafor med ventekø i stedet for busy waiting',
          source: 'Silberschatz §6.6.2 s. 290–291',
          code: `typedef struct {
     int value;
     struct process *list;
} semaphore;

wait(semaphore *S) {
          S->value--;
          if (S->value < 0) {
                 add this process to S->list;
                 sleep();
          }
}

signal(semaphore *S) {
        S->value++;
        if (S->value <= 0) {
               remove a process P from S->list;
               wakeup(P);
        }
}`,
        },
      ],
      exam: [
        'En semafor er et heltal med to atomiske operationer fra Dijkstra: `wait`, eller P, der venter, til den kan tælle ned, og `signal`, eller V, der tæller op. En binær semafor er 0 eller 1 og virker som en mutex; en tællende semafor initialiseres til antallet af ressourcer.',
        'I kursets kode kører 10 tråde med `std::binary_semaphore sem{1}`, og outputtet er blokke af 50 ens tal — én tråd ad gangen. Med `std::counting_semaphore sem{2}` bliver tallene flettet to og to.',
        'Bogens implementering undgår busy waiting med en ventekø: `wait` tæller ned, og bliver værdien negativ, lægges tråden i semaforens liste og sover; `signal` tæller op og vækker én fra listen. En negativ værdi fortæller, hvor mange der venter.',
        'Den store forskel til en mutex er ejerskab: alle kan kalde `release`. Det gør semaforen god til signalering mellem tråde, men i kursets `semaphore_counting_error()` kalder en buggy tråd `release()` uden `acquire()`, og så kommer tre tråde ind i en sektion, der kun måtte have to.',
        'Andre timing-fejl er at bytte om på `wait` og `signal`, at kalde `wait` to gange eller at glemme den ene — det giver enten brud på mutual exclusion eller permanent blokering, og derfor kom monitorerne.',
      ],
      sources: [
        { path: SL04, original: P04, pages: 's. 28–40, 42' },
        { path: BOG6, original: BOG, pages: '§6.6 (s. 288–292), §6.7 s. 292–293 (timing-fejl), §6.8.1' },
                { path: KODE, note: 'Konvertering af ugens kode' },
        { path: KODE_ORIG, note: '`semaphore_binary`, `semaphore_counting`, `semaphore_counting_error`, `semaphore_binary_error_deadlock`' },
      ],
      gaps: [
        'Slides viser ikke, hvordan en semafor er implementeret. Bogens §6.6.2 (ventekø med `sleep()`/`wakeup()`) står i originalsiderne (PNG s. 314–315), men markdown-konverteringen springer den over “jf. instruktionerne”, og metadata siger “excl. 6.6.2, 6.7.2, 6.7.3”. Hvor den afgrænsning kommer fra, fremgår ikke af materialet.',
        'Kurskodens `buggy_thread` skriver tråd-id `9` (`buggy_thread(int i)`, `threads.emplace_back(buggy_thread, 9)`), mens slidet s. 40 skriver `"BUG"` uden parameter. Outputtet på slidet stammer fra slide-versionen.',
        'Kurskoden har `semaphore_binary_error_deadlock()` (deadlock med to binære semaforer), som ikke er på slides; bogen har samme eksempel med `S` og `Q` (§6.8.1).',
        'Slidets output for binær semafor viser ikke alle tråde i nummerorden (0, 1, 3, 5, 6, 7, 8, 2, 4, 9) — at scheduleren ikke garanterer FIFO, kommenteres ikke. Bogen siger, at FIFO-kø er én mulig strategi, men at korrekthed ikke afhænger af den (s. 291).',
        'Uden for materialet: i C++20 er det udefineret adfærd at kalde `release()`, så tælleren overstiger `max()`. For `std::binary_semaphore` er `max()` 1, så en “buggy” `release()` på en binær semafor er UB; `std::counting_semaphore` uden skabelonparameter har en implementeringsdefineret, stor `max()`, derfor når slidets eksempel 3.',
        'Stavefejl: “know as”, “adressed”; slidet om binær semafor skriver “Binary semaphore, can provide mutual exclusion, like Mutex” uden at nævne ejerskabsforskellen på samme slide (den står på s. 29).',
      ],
      keywords: ['semaphore', 'semafor', 'binary semaphore', 'binær semafor', 'counting semaphore', 'tællende semafor', 'wait', 'signal', 'P', 'V', 'proberen', 'verhogen', 'acquire', 'release', 'std::binary_semaphore', 'std::counting_semaphore', '<semaphore>', 'Dijkstra', 'sleep', 'wakeup', 'waiting queue', 'ventekø', 'no ownership', 'timing errors', 'sem_wait', 'sem_post', 'synch', 'semaphore_counting_error'],
    },

    // ─────────────────────────────────────────────────────────────
    {
      slug: 'monitor-cv',
      title: 'Monitorer og condition variables',
      short: 'Monitor og CV',
      week: 'Uge 4 · L4.1 + Uge 6 · L6.1',
      definition:
        'En **monitor** er en abstrakt datatype, der indkapsler delte data og adgangskontrol, så kun én tråd ad gangen er aktiv i den. En **condition variable** (CV) lader en tråd vente — uden busy waiting — til en anden tråd signalerer, at en betingelse kan være opfyldt. I C++ er det `std::condition_variable` med `wait(lock, predicate)`, `notify_one()` og `notify_all()`, altid sammen med en mutex.',
      concepts: [
        {
          term: 'Monitor-konceptet',
          body: [
            'Slidet (04.1 s. 41): “The Monitor ADT encapsulates access control to an object.” Mutual exclusion sker kun inden for monitoren, klienter kan anmode om og frigive adgang — “But!!! Clients can potentially ignore the access control”. Sekvensdiagrammet (fra Monitor Pattern-artiklen) viser synkroniseret metodekald, `wait()` der frigiver monitor-låsen og suspenderer tråd 1, tråd 2 der kalder `notify()`, og tråd 1 der genoptages.',
            'Bogens motivation (§6.7 s. 292–293): semaforer er nemme at bruge forkert — byt om på `wait`/`signal`, kald `wait` to gange, glem én. Løsningen er at gøre synkronisering til en højniveau-sprogkonstruktion. En **monitor type** er en ADT med programmørdefinerede operationer, der automatisk får mutual exclusion; funktionerne må kun røre monitorens egne variabler og parametre (Figur 6.11).',
          ],
        },
        {
          term: 'Condition variables i monitoren',
          body: [
            'Monitoren alene kan ikke udtrykke alle synkroniseringsproblemer, så den får `condition x, y;`. De eneste operationer er `x.wait()`, der suspenderer den kaldende proces, og `x.signal()`, der genoptager præcis én suspenderet proces. Hvis ingen venter, har `x.signal()` **ingen effekt** — i modsætning til en semafors `signal()`, der altid ændrer tilstanden (§6.7 s. 294–295; Figur 6.13 viser entry queue og en kø pr. condition).',
            'Når `P` signalerer, og `Q` venter, må de ikke begge være aktive i monitoren. **Signal and wait**: `P` venter, til `Q` forlader monitoren. **Signal and continue**: `Q` venter, til `P` forlader den. Bogen bemærker, at med signal-and-continue er betingelsen, `Q` ventede på, måske ikke længere sand, når `Q` kører (s. 295).',
            'Bogens `ResourceAllocator` (Figur 6.14, s. 297) har `boolean busy` og `condition x`: `acquire(time)` venter på `x`, hvis `busy`; `release()` sætter `busy = false` og kalder `x.signal()`. Problemet (s. 298): monitoren kan ikke tvinge klienterne til at kalde `acquire` før adgang, at frigive, eller til ikke at frigive noget, de aldrig fik — samme pointe som slidets “clients can ignore the access control”.',
          ],
        },
        {
          term: 'Mutex is not always enough',
          body: [
            '06.1 s. 8 bygger bro fra [[dining-philosophers|dining philosophers]]: “less naive”-løsningen med `try_lock()` deadlocker ikke, men busy-waiter i en `while(true)`-løkke (s. 7). En mutex kan ikke *notificere* andre tråde om, at en ressource er ledig; man må polle. “It would have been nice to sit and wait for another thread to notify the release of a chopstick” — derfor condition variables.',
            'En CV (s. 10) er “a synchronisation primitive to notify other threads that a shared ressource is available”. Den kan vente på notifikation og notificere én eller mange tråde. Den er værdifuld, fordi den undgår busy waiting (CPU-effektiv) og er sikker, fordi den bruger en mutex til eksklusiv adgang.',
          ],
        },
        {
          term: 'std::condition_variable',
          body: [
            'API’et (06.1 s. 11): `void wait(std::unique_lock<std::mutex>& lock);` og `void wait(std::unique_lock<std::mutex>& lock, Predicate pred);`. Notifikation: `notify_one()` vækker **én** ventende tråd, `notify_all()` vækker **alle**.',
            'Prædikatet er “a true condition to check for, when waking up. Used to manage spurious wake-ups”. Slidet viser ækvivalensen: `wait(lock, pred)` svarer til `while (!pred) wait(lock);`. `wait` kræver `unique_lock`, ikke `lock_guard`, fordi låsen skal kunne frigives og tages igen inde i `wait` (se [[mutex-spinlock|mutex og lock_guard]]).',
          ],
        },
        {
          term: 'CV inner workings',
          body: [
            '`wait()` (06.1 s. 12): 1) frigiver mutexen, 2) sætter tråden i **Waiting**-tilstanden, 3) tråden sover og venter på et signal, 4) når den vækkes, bliver den **Ready** og til sidst **Running**, 5) den tager automatisk mutexen igen, før `wait()` returnerer (og evaluerer evt. prædikatet).',
            '`notify_one()`/`notify_all()`: vækker én/alle ventende tråde (hvis nogen) ved at flytte dem fra Waiting til Ready; tråden kan nu skeduleres af OS’et. Slidet viser procestilstandsdiagrammet (new, ready, running, waiting, terminated) ved siden af — samme som i [[processer|processer]].',
            'Bogens POSIX-version (§7.3.3 s. 324–325): mutexen **skal** være låst før `pthread_cond_wait(&cond_var, &mutex)`, fordi den beskytter data i betingelsen; kaldet frigiver låsen, så en anden tråd kan ændre data. Betingelsen står i en løkke — `while (a != b) pthread_cond_wait(...)` — “so that the condition is rechecked after being signaled”. `pthread_cond_signal()` frigiver ikke mutexen; det gør den efterfølgende `pthread_mutex_unlock()`.',
          ],
        },
        {
          term: 'Signalerings-mønsteret',
          body: [
            'Aktivitetsdiagrammet “CV signalling” (06.1 s. 13) har to swimlanes. **Signalling thread**: take lock → PREPARE DATA → Predicate = True → Signal CV (`cv.notify_one()`) → release lock. **Waiting thread**: take lock → `cv.wait(lock, predicate)`, som er løkken release lock → wait for CV signal → take lock → Predicate? — False går tilbage til release lock, True går videre til USE DATA (critical section) → release lock.',
            'Pointen er, at prædikatet ændres **under låsen**, og at den ventende tråd tjekker det **under låsen**. Så kan der ikke komme et signal ind mellem tjek og søvn.',
          ],
        },
        {
          term: 'CV example: waits og signals',
          body: [
            'Eksemplet fra cppreference (06.1 s. 14): én `condition_variable cv`, én `mutex cv_m` og `int i = 0`. Kommentaren siger, at mutexen bruges til tre ting: synkronisere adgang til `i`, til `cerr` og til `cv`. `waits()` tager `unique_lock<mutex> lk(cv_m)` og kalder `cv.wait(lk, []{ return i == 1; })`. `signals()` sover 1 sekund, skriver “Notifying...” under en `lock_guard` og kalder `notify_all()` **uden** at have ændret `i`; efter endnu et sekund sætter den `i = 1` under låsen og kalder `notify_all()` igen.',
            'Tabellen på s. 15 går trinvis: første `notify_all()` vækker `waits()` (ready → running), den tager mutexen, tjekker `i == 1`? **NO** → går tilbage til wait og frigiver mutexen. Efter anden notifikation er svaret **YES**, og tråden fortsætter med låsen. Det er præcis, hvorfor prædikatet skal være der: at blive vækket betyder ikke, at betingelsen er sand.',
            'Dining philosophers med CV (s. 16–18) bruger én `table_mtx` med `unique_lock`, en mutex og en CV pr. spisepind: kan tråden ikke få en pind med `try_lock()`, venter den på pindens CV i stedet for at spinne, og den, der lægger en pind, kalder `notify_one()` på den. Øvelsen Park-a-lot-2000 (s. 19) slutter med “Remember to use predicates”.',
          ],
        },
      ],
      viz: 'condvar-wait',
      keyPoints: [
        'Monitor = ADT med delte data + operationer; kun én tråd aktiv i den ad gangen.',
        'Monitoren kan ikke tvinge klienter til at bruge adgangskontrollen korrekt.',
        'CV: vent uden busy waiting, til en anden tråd notificerer.',
        '`x.signal()` uden ventende har ingen effekt — en semafor husker sit signal.',
        '`cv.wait(lock, pred)` = `while (!pred) wait(lock);` — beskytter mod spurious wake-ups.',
        '`wait()` frigiver mutexen, sover (Waiting), vækkes (Ready → Running) og tager mutexen igen.',
        '`notify_one()` vækker én, `notify_all()` vækker alle ventende.',
        'Ændr prædikatets data under låsen, og brug `unique_lock` til `wait`.',
        'Signal and wait vs. signal and continue: hvem kører videre efter `signal`.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'CV example: waits() og signals()',
          source: '06.1-Synchronisation-Examples.pdf s. 14',
          code: `condition_variable cv;
mutex cv_m; // This mutex is used for three purposes:
// 1) to synchronize accesses to i
// 2) to synchronize accesses to cerr
// 3) for the condition variable cv
int i = 0;

void waits()
{
  unique_lock<mutex> lk(cv_m);
  cerr << "Waiting... \\n";
  cv.wait(lk, []{ return i == 1; });
  cerr << "...finished waiting. i == 1\\n";
}

void signals()
{
  this_thread::sleep_for(chrono::seconds(1));
  {
    lock_guard<mutex> lk(cv_m);
    cerr << "Notifying...\\n";
  }
  cv.notify_all();
  this_thread::sleep_for(chrono::seconds(1));
  {
    lock_guard<mutex> lk(cv_m);
    i = 1;
    cerr << "Notifying again...\\n";
  }
  cv.notify_all();
}`,
        },
        {
          lang: 'text',
          title: 'wait med prædikat — slidets ækvivalens',
          source: '06.1-Synchronisation-Examples.pdf s. 11',
          code: `void wait( std::unique_lock<std::mutex>& lock );
void wait( std::unique_lock<std::mutex>& lock, Predicate pred );

// wait(lock, pred) svarer til:
while (!pred)
    wait(lock);

void notify_one(); // Notify ONE waiting thread
void notify_all(); // Notify ALL waiting threads`,
        },
        {
          lang: 'c',
          title: 'POSIX condition variable: vent og signalér',
          source: 'Silberschatz §7.3.3 s. 324–325',
          code: `pthread_mutex_t mutex;
pthread_cond_t cond_var;

pthread_mutex_init(&mutex,NULL);
pthread_cond_init(&cond_var,NULL);

/* ventende tråd */
pthread_mutex_lock(&mutex);
while (a != b)
     pthread_cond_wait(&cond_var, &mutex);

pthread_mutex_unlock(&mutex);

/* signalerende tråd */
pthread_mutex_lock(&mutex);
a = b;
pthread_cond_signal(&cond_var);
pthread_mutex_unlock(&mutex);`,
        },
        {
          lang: 'text',
          title: 'Monitor med én ressource (bogen)',
          source: 'Silberschatz §6.7 Figur 6.14 s. 297',
          code: `monitor ResourceAllocator
{
   boolean busy;
   condition x;

   void acquire(int time) {
      if (busy)
         x.wait(time);
      busy = true;
   }

   void release() {
      busy = false;
      x.signal();
   }

   initialization_code() {
      busy = false;
   }
}`,
        },
      ],
      exam: [
        'En monitor er en abstrakt datatype, hvor de delte data kun kan tilgås gennem monitorens operationer, og konstruktionen sikrer, at kun én tråd ad gangen er aktiv i den. Den er svaret på, at semaforer er nemme at bruge forkert — men som kursets slide siger, kan klienter stadig ignorere adgangskontrollen.',
        'En mutex alene kan ikke fortælle andre tråde, at en ressource er blevet ledig; så må de polle. En condition variable lader tråden sove, til en anden tråd kalder `notify_one()` eller `notify_all()`, og den bruger altid en mutex.',
        '`cv.wait(lock, pred)` frigiver mutexen, sætter tråden i Waiting, og når den vækkes, bliver den Ready, tager mutexen igen og tjekker prædikatet. Er det falsk, venter den igen — det svarer til `while (!pred) wait(lock)`.',
        'I kursets eksempel fra cppreference kalder `signals()` først `notify_all()` uden at ændre `i`; `waits()` vågner, ser at `i == 1` er falsk og går tilbage til at vente. Først efter `i = 1` under låsen og en ny notifikation fortsætter den. Derfor skal man altid bruge prædikat eller `while`, aldrig `if`: der findes spurious wake-ups, og en anden tråd kan nå at ændre tilstanden.',
        'Forskellen til en semafor: en CV har ingen hukommelse — et `notify` uden ventende tråde er tabt, mens en semafors `signal` altid tæller op. Og data, prædikatet afhænger af, skal ændres under samme mutex, ellers kan signalet komme mellem tjek og søvn.',
      ],
      sources: [
        { path: SL04, original: P04, pages: 's. 41' },
        { path: SL06, original: P06, pages: 's. 7–19' },
        { path: BOG6, original: BOG, pages: '§6.7 (s. 292–298)' },
        { path: BOG7, original: BOG, pages: '§7.3.3 (s. 324–325)' },
      ],
      gaps: [
        '04.1 dækker monitoren på ét slide (s. 41) uden kode og uden condition variables; CV-delen kommer først i 06.1 (s. 8–19), hvor ordet “monitor” ikke optræder. Kursets C++-kode har ingen monitor-klasse; bogens monitor er pseudokode.',
        'Bogen og slides forklarer løkken om `wait` forskelligt. 06.1 s. 11 siger, at prædikatet bruges “to manage spurious wake-ups”. Bogens originaltekst (§7.3.3 s. 324) siger kun “To protect against program errors, it is important to place the conditional clause within a loop”; ordet “spurious” står i markdown-konverteringen, ikke i bogen.',
        'Bogens monitor-CV (`x.signal()`) svarer til `notify_one()`; `notify_all()`/broadcast nævnes ikke i de læste bogafsnit. Om C++/POSIX er signal-and-wait eller signal-and-continue, siger materialet ikke. Uden for materialet: både `std::condition_variable` og Pthreads er signal-and-continue (Mesa-semantik), hvilket er endnu en grund til `while`-løkken.',
        '§6.7.2 (monitor implementeret med semaforer) og §6.7.3 (genoptagelse af processer i monitoren) er udeladt ifølge bog-konverteringens metadata; kilden til afgrænsningen fremgår ikke. `ResourceAllocator` (Figur 6.14) og listen over monitor-problemer (s. 298) står faktisk i §6.7.3, men konverteringen medtager dem alligevel.',
        '06.1 s. 12 skriver `std::wait()` og `std::notify_one()` som om de var frie funktioner; de er medlemsfunktioner på `std::condition_variable`.',
        'Kilden til monitor-diagrammet på 04.1 s. 41 angives som “Monitor Pattern by Douglas C. Smith”, men URL’en peger på Douglas C. Schmidts side (`~schmidt/PDF/monitor.pdf`).',
        'Slidets eksempel kalder `notify_all()` efter at have forladt `lock_guard`-scopet (uden låsen), mens bogens POSIX-eksempel signalerer, mens mutexen holdes. Materialet diskuterer ikke forskellen.',
        'Øvelsen Park-a-lot-2000 (06.1 s. 19) er kun et billede og “Remember to use predicates”; opgaveteksten findes ikke i materialet.',
        'Stavefejl: “ressource” (s. 8, 10), “NAIIVE” (s. 3, 7), “Asssuming” (s. 18).',
      ],
      keywords: ['monitor', 'ADT', 'abstract data type', 'condition variable', 'CV', 'betingelsesvariabel', 'std::condition_variable', 'wait', 'notify_one', 'notify_all', 'predicate', 'prædikat', 'spurious wakeup', 'spurious wake-up', 'unique_lock', 'lock_guard', 'signal and wait', 'signal and continue', 'ResourceAllocator', 'entry queue', 'pthread_cond_wait', 'pthread_cond_signal', 'pthread_cond_t', 'pthread_cond_init', 'Waiting', 'Ready', 'busy waiting', 'try_lock', 'Park-a-lot'],
    },
  ],
}
