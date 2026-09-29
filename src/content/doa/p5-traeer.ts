import type { Part } from '../types'
import { k, BOOK } from './paths'

export const traeer: Part = {
  id: 'traeer',
  title: 'Prioritetskøer og søgetræer',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'binaer-heap',
      title: 'Binær heap',
      week: 'Lektion 7',
      definition:
        'En **prioritetskø** er en ADT, hvor hvert element har en prioritet, og hvor de to grundoperationer er `insert` og `deleteMin`. Kurset implementerer den som en **binær heap**: et **komplet binært træ** (strukturegenskaben), hvor hver knudes nøgle er mindre end eller lig med børnenes (ordensegenskaben i en min-heap), så minimum altid ligger i roden. Træet gemmes niveau for niveau i et array uden pointere, og både `insert` og `deleteMin` kører i O(log N) i værste tilfælde.',
      intro: [
        'Lektion 7 begynder med almindelige køer — printjobs, requests til en webserver, programmer der venter på CPU’en — og konstaterer, at man ofte vil have nogle elementer behandlet før andre: korte jobs og requests med høj prioritet (L07 s. 4). Prioritetskøer bruges også til at implementere *greedy*-algoritmer, der træffer lokalt optimale valg; kurset møder dem igen i [[dijkstra|Dijkstra]] og [[mst|Prim]].',
        'Kernen i emnet er to små algoritmer: **percolate up** (bruges af `insert`) og **percolate down** (bruges af `deleteMin` og kaldes `minHeapify` på slidene). Begge går én sti mellem rod og blad, og det er hele grunden til, at de er logaritmiske. Hvordan man bygger en heap fra et helt array og sorterer med den, står under [[heapify-heapsort|heapify og heapsort]].',
      ],
      concepts: [
        {
          term: 'Prioritetskø-ADT’en og de naive implementeringer',
          body: [
            'Definitionen på L07 s. 5: “A priority queue is an ADT in which each element additionally has a priority associated with it”, og et element med høj prioritet betjenes før et med lav. En typisk prioritetskø har `insert` og `deleteMin`, der “extracts and returns the minimum element”. Bogen kalder `insert` prioritetskøens `enqueue` og `deleteMin` dens `dequeue` (Weiss s. 245).',
            'Slide 8 nævner to oplagte implementeringer: en usorteret enkeltkædet liste med indsættelse i O(1) og udtrækning i O(N), og en sorteret liste, der “inverts these complexities”. Målet er en bedre balance, hvor begge operationer koster O(log N). Bogen (6.2, s. 246) tilføjer, at den usorterede liste nok er den bedste af de to, fordi der aldrig er flere `deleteMin` end `insert`, og at et binært søgetræ giver O(log N) i gennemsnit — men at et søgetræ er “overkill”, fordi det understøtter mange operationer, som en prioritetskø ikke skal bruge.',
            'Diskussionsslidet (s. 9) spørger, hvorfor det tager O(N) at finde pladsen i en sorteret [[lister|linked list]], og om man ikke kan bruge [[soegning|binær søgning]]. Slidet giver ikke svaret; pointen er, at binær søgning kræver direkte adgang til midterelementet, hvilket en linked list ikke har.',
          ],
        },
        {
          term: 'Binære og komplette binære træer',
          body: [
            'Et **binært træ** er en struktur, hvor hver knude har højst to børn, venstre og højre (L07 s. 11). Slidets begreber er knude, forælder/barn og **højde**: “the number of edges on the longest path from the root to a leaf”. Eksempeltræet er `13` med børn `21` og `16`, hvor `21` har `24` og `31`, og `16` har `19` — samme træ, som resten af lektionen bruger.',
            'Slide 12 viser et træ, der *ikke* er binært (A har seks børn B–G), og slide 13 et “unpleasant binary tree”: kæden A–B–C–D–E, hvor hver knude kun har ét barn. Det er stadig et binært træ, men det opfører sig som en liste.',
            'Et **komplet binært træ** har alle niveauer fyldt undtagen muligvis det nederste, som fyldes fra venstre mod højre (s. 15). Et komplet træ med højde h har mellem 2ʰ og 2ʰ⁺¹ − 1 knuder. Menti-slidet “Numbers for binary trees” (s. 14) tæller 1, 2, 4, 8, 16 knuder på niveau 0–4 og 1, 3, 7, 15, 31 i alt og beder om formlerne F1(h) og F2(h), altså 2ʰ og 2ʰ⁺¹ − 1. Konklusionen på s. 17: “Any algorithm that traverses from root to leaf node is O(log(N))!” Bogen siger det samme: højden er ⌊log N⌋ (Weiss s. 247).',
          ],
        },
        {
          term: 'Heap-egenskaberne',
          body: [
            'En binær heap har to egenskaber (L07 s. 19). **Strukturegenskaben:** heapen er et komplet binært træ. **Ordensegenskaben** for en min-heap: for hver knude x er nøglen mindre end eller lig med børnenes nøgler, så minimum er roden. Bogen formulerer den som, at forælderens nøgle er ≤ knudens egen, undtagen for roden, og at ethvert undertræ også er en heap (Weiss s. 248–249). En max-heap fås ved at vende ordenen; valget skal træffes på forhånd (fodnote 2, s. 249).',
            'Ordensegenskaben siger intet om søskende. Derfor kan `findMin` svare i konstant tid, men en min-heap kan ikke finde maksimum eller et vilkårligt element uden at scanne hele arrayet — halvdelen af elementerne er blade, og maksimum ligger et sted blandt dem (Weiss s. 254).',
            'Menti-slidet s. 20 spørger, hvilke af fire træer der *ikke* er heaps. Tree 2 (`4` med børn `7` og `6`, hvor `6` har barnet `5`) og Tree 4 (roden `5` over `4` og `3`) bryder ordensegenskaben; Tree 1 (`3`, `5`, `8`, `6`, `5`, `10`, `15`) er gyldig, fordi lighed er tilladt. Slide 18 viser fire forskellige træer og spørger, hvad de har til fælles — de er alle komplette og overholder min-heap-ordenen.',
          ],
        },
        {
          term: 'Array-repræsentationen',
          body: [
            'Fordi træet er komplet, kan det **lineariseres** i et array ved at sætte niveauerne efter hinanden; der er ingen pointere (L07 s. 31). Med roden på indeks 1 har knuden på plads i venstre barn på `2i`, højre barn på `2i + 1` og forælder på `i / 2` med heltalsdivision (s. 34). Eksempel fra s. 31: `[-, 13, 21, 16, 24, 31, 19, -]` på indeks 0–7. Slide 34 bruger det større træ `[_, 13, 21, 16, 24, 31, 18, 18, 28, 25]`, hvor fx `24` på indeks 4 har børnene `28` (8) og `25` (9).',
            'Man kan lige så godt have roden på indeks 0; så ligger børnene på `2i + 1` og `2i + 2` (s. 31). Det er den variant, heapsort bruger. Begrænsningen er, at størrelsen skal fastlægges på forhånd, men arrayet kan udvides (s. 31; Weiss s. 248). `BinaryHeap` holder et `vector<Comparable> array` og en `int currentSize` (s. 35).',
            'Menti-slidene s. 32–33 træner oversættelsen begge veje: heapen `1 / 3 6 / 5 9 8 7 / 10` er arrayet `[ , 1, 3, 6, 5, 9, 8, 7, 10]` (svar A på s. 32), og det array svarer til træ D på s. 33. Læs niveau for niveau, fra venstre mod højre.',
          ],
        },
        {
          term: 'insert: percolate up',
          body: [
            'For at indsætte x oprettes en ny knude nederst — på første ledige plads, så træet forbliver komplet — og x flyttes op (**percolate up**), indtil ordensegenskaben holder (L07 s. 22). Slidets eksempel indsætter `14` i `[13, 21, 16, 24, 31, 19]`: den nye plads er højre barn af `16`; `14 < 16`, så de bytter; `14 > 13`, så den stopper. Resultatet er `[13, 21, 14, 24, 31, 19, 16]`.',
            'Koden (s. 36) udvider arrayet, hvis det er fuldt, lægger en kopi af x i `array[0]` og flytter forældre ned i hullet, så længe `x < array[node / 2]`. Kopien på indeks 0 er en **sentinel**: når hullet når roden, sammenlignes x med sig selv, og løkken stopper uden et ekstra `node > 1`-tjek (Weiss s. 251).',
            'Koden bytter ikke elementer, men flytter et **hul**. Bogen begrunder det: et swap koster tre tildelinger, så d niveauer koster 3d, mens hulteknikken bruger d + 1 (Weiss s. 251). Bogens eget eksempel indsætter også `14`, men i et større træ, hvor hullet bobler op forbi `31` og `21` (figur 6.6–6.7, s. 250).',
            'Menti-slidet s. 23 indsætter `4` i `[2, 3, 8, 5, 6, 10, 9]`. Første ledige plads er indeks 8, venstre barn af `5`; `4 < 5` giver et byt, `4 > 3` stopper. Resultatet `[2, 3, 8, 4, 6, 10, 9, 5]` er svarmulighed **A**.',
          ],
        },
        {
          term: 'deleteMin: percolate down (minHeapify)',
          body: [
            'For at fjerne minimum laves et **hul** i roden, og størrelsen tælles én ned. Det sidste element i heapen skal have en ny plads (L07 s. 25). Hullet flyttes ned “in the direction of the smallest child”, indtil det sidste element passer (s. 26). Slidet kalder operationen `minHeapify`, fordi den genopretter min-heapen; i kursets kildekode og i bogen hedder den `percolateDown`.',
            'Slidets eksempel: `[13, 21, 14, 24, 31, 19, 16]`. `13` fjernes, og `16` skal placeres. Børnene i hullet er `21` og `14`; `14` er mindst og mindre end `16`, så `14` rykker op. Det nye hul har kun barnet `19`, som er større end `16`, så `16` lægges dér: `[14, 21, 16, 24, 31, 19]`.',
            'Implementeringen (s. 37 og 46) lægger det sidste element i `array[1]`, tæller `currentSize` ned og kalder `minHeapify(1)`. Testen `child != currentSize` håndterer knuden med kun ét barn; bogen kalder den manglende test “a frequent implementation error” (Weiss s. 251–252). Der findes to versioner af `deleteMin`: én der kun fjerner, og én der også returnerer minimum via en reference.',
            'Menti-slidet s. 27 fjerner minimum fra `[13, 21, 16, 24, 31, 18, 18, 28, 25]`. `25` flyttes op: `16 < 21` giver første skridt, og mellem de to `18`-børn vælges ét; `25` ender som blad. Svaret er **C**, `16 / 21 18 / 24 31 18 25 / 28`.',
          ],
        },
        {
          term: 'decreaseKey, increaseKey og remove',
          body: [
            'Slide 30 nævner tre ekstra operationer: `decreaseKey` sænker en knude med en positiv mængde og flytter den **op**; `increaseKey` hæver den og flytter den **ned**; `remove` sænker knuden med sin egen værdi (så den bliver mindst) og udtrækker derefter minimum.',
            'Bogen (s. 254) præciserer, at operationerne forudsætter, at man kender elementets **position** p, fordi heapen ikke kan finde det selv; ellers må en anden struktur som en [[hashtabeller|hashtabel]] holde styr på pladserne. Så er `decreaseKey(p, Δ)` en percolate up, `increaseKey(p, Δ)` en percolate down, og `remove(p)` er `decreaseKey(p, ∞)` fulgt af `deleteMin()`. Eksemplerne er styresystemets scheduler: en administrator kan give et program højeste prioritet, og en proces, der bruger meget CPU-tid, kan få sin prioritet sænket (se [[sys/cpu-scheduling|CPU-scheduling]]).',
          ],
        },
      ],
      viz: 'doa-heap-ops',
      keyPoints: [
        'Heap = komplet binært træ (struktur) + forælder ≤ børn (orden). Minimum ligger i roden.',
        'Array med rod på indeks 1: børn på `2i` og `2i + 1`, forælder på `i / 2`. Med rod på 0: `2i + 1` og `2i + 2`.',
        '`insert`: læg x på første ledige plads og percolate up. `deleteMin`: flyt sidste element til roden og percolate down mod det mindste barn.',
        'Begge operationer går én sti rod–blad i et træ med højde ⌊log N⌋, derfor O(log N).',
        'Hullet flyttes i stedet for at bytte: d + 1 tildelinger i stedet for 3d; `array[0]` er sentinel i `insert`.',
        'En min-heap kan ikke finde maksimum eller et vilkårligt element hurtigt; `decreaseKey`/`increaseKey`/`remove` kræver, at positionen er kendt.',
        'Kompleksitet (L07 s. 36; Weiss s. 249): `findMin` bedste O(1) · gennemsnit O(1) · værste O(1) · plads O(1).',
        'Kompleksitet (L07 s. 28; Weiss s. 251, 255): `insert` bedste ikke angivet · gennemsnit O(1) (2,607 sammenligninger) · værste O(log N) · plads O(1) ekstra.',
        'Kompleksitet (L07 s. 28; Weiss s. 252): `deleteMin` bedste ikke angivet · gennemsnit O(log N) · værste O(log N) · plads O(1) ekstra. `decreaseKey`, `increaseKey`, `remove`: værste O(log N) (Weiss s. 254); gennemsnit ikke angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'insert med percolate up (binary_heap.tpp)',
          source: 'Lecture07.pdf s. 36',
          code: `/**
 * Insert item x, allowing duplicates.
 */
template<typename Comparable>
void BinaryHeap<Comparable>::insert(const Comparable& x) {
    if (currentSize == array.size() - 1)
        array.resize(array.size() * 2);

    // Move up
    int node = ++currentSize;
    Comparable copy = x;

    array[0] = std::move(copy);
    for (; x < array[node / 2]; node /= 2)
        array[node] = std::move(array[node / 2]);
    array[node] = std::move(array[0]);
}`,
        },
        {
          lang: 'cpp',
          title: 'deleteMin og minHeapify (percolate down)',
          source: 'Lecture07.pdf s. 37 og 46',
          code: `/**
 * Remove the minimum item and place it in minItem.
 * Throws Underflow if empty.
 */
template<typename Comparable>
void BinaryHeap<Comparable>::deleteMin(Comparable & minItem) {
    if (isEmpty()) throw underflow_error("heap is empty.");
    minItem = std::move(array[1]);
    array[1] = std::move(array[currentSize--]);
    minHeapify(1);
}

/**
 * Internal method to percolate down in the heap.
 * node is the index at which the percolate begins.
 */
template<typename Comparable>
void BinaryHeap<Comparable>::minHeapify(int node) {
    int child;
    Comparable tmp = std::move(array[node]);

    for (; node * 2 <= currentSize; node = child) {
        child = node * 2;
        if (child != currentSize && array[child + 1] < array[child])
            ++child;
        if (array[child] < tmp)
            array[node] = std::move(array[child]);
        else
            break;
    }
    array[node] = std::move(tmp);
}`,
        },
      ],
      exam: [
        'En prioritetskø skal kunne `insert` og `deleteMin`. En usorteret liste giver O(1) og O(N), en sorteret liste det omvendte. Den binære heap giver O(log N) for begge, fordi den er et komplet binært træ med højde ⌊log N⌋, og begge operationer kun går én sti mellem rod og blad.',
        'Heapen har to egenskaber: strukturen — komplet binært træ, fyldt fra venstre — og ordenen — hver forælder er mindre end eller lig med sine børn. Strukturen gør, at træet kan ligge i et array med børn på `2i` og `2i + 1` og forælder på `i / 2`, uden pointere.',
        'Sådan løser du “vis heapen efter insert” (opgavetype fra Menti-slidet L07 s. 23, ikke fra eksamenssæt): 1) skriv arrayet med roden på indeks 1; 2) læg x på indeks `currentSize + 1`; 3) sammenlign med forælderen på `i / 2` og byt, så længe x er mindre; 4) tegn træet og arrayet igen. Eksempel: `4` ind i `[2, 3, 8, 5, 6, 10, 9]` giver `[2, 3, 8, 4, 6, 10, 9, 5]`.',
        'Sådan løser du “vis heapen efter deleteMin” (opgavetype fra Menti-slidet L07 s. 27): 1) fjern roden; 2) flyt det sidste element op i hullet og tæl størrelsen ned; 3) sammenlign med det mindste af børnene på `2i` og `2i + 1` og ryk barnet op, så længe det er mindre; 4) stop, når begge børn er større, eller når du står i et blad.',
        'Faldgruben er at tro, at heapen er sorteret. Den garanterer kun, at forælder ≤ barn; søskende og niveauer er uordnede. Derfor kan man finde minimum i O(1), men ikke søge efter et vilkårligt element hurtigere end O(N) — til det skal man bruge et [[bst|søgetræ]] eller en hashtabel.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture07_Priority_Queues.md'), original: 'Lecture07.pdf', pages: 's. 3–38', note: 'Prioritetskøer, binære træer, heap-operationer' },
        { path: k('context/book/AOD_Ch06_Priority_Queues.md'), original: BOOK, pages: 's. 245–254', note: '6.1–6.3.4 Model, simple implementeringer, binary heap' },
        { path: k('context/kode/kildekode_part1.md'), note: 'BinaryHeap.h' },
        { path: k('context/kode/kildekode_part10.md'), note: 'TestBinaryHeap.cpp' },
        { path: k('context/videos/SW2ADS_Video_Week07_Priority_Queues.md'), original: 'data/video transcripts/week7.txt', note: 'Heaps and Heap Sort (sift-up/sift-down)' },
      ],
      gaps: [
        'Sidetal: “L07 s. N” er PDF-sidetal. Sidefoden på slidene viser et højere tal, fordi skjulte slides er fjernet (fx PDF s. 24 = “26”, s. 31 = “33”, s. 45 = “49”).',
        'Slidet `findMin` (L07 s. 36) kaster `underflow_error{}` uden besked. `std::underflow_error` har ingen standardkonstruktør, så linjen kompilerer ikke (testet med g++ 17). `deleteMin` på s. 37 bruger `underflow_error("heap is empty.")`, som virker. Kursets `BinaryHeap.h` og bogen kaster i stedet `UnderflowException` fra `dsexceptions.h`.',
        'Slides og kode bruger forskellige navne: `minHeapify(int node)` på slidene, `percolateDown(int hole)` i `BinaryHeap.h` og bogen (figur 6.12). Slidet siger, at navnet `minHeapify` er “in book”, men Weiss bruger `percolateDown`. Videoen (week7) kalder de to operationer *sift-up* og *sift-down*.',
        '`BinaryHeap.h` har to `insert`: `const Comparable &` bruger sentinel i `array[0]`, mens `Comparable &&`-versionen tjekker `hole > 1` i løkken i stedet. Slidene viser kun den første.',
        'Markdown-konverteringen angiver svaret på Menti “Insert 4” (L07 s. 23) som **B** med en forvirret udregning. PDF-slidet og en kørsel af slidekoden giver `[2, 3, 8, 4, 6, 10, 9, 5]`, som er **A**.',
        'Menti “deleteMin” (L07 s. 27): svar C placerer `25` som *højre* barn af `18`. Kursets `minHeapify` vælger ved lighed det venstre barn (`array[child + 1] < array[child]` er falsk for to `18`), så koden giver `[16, 21, 18, 24, 31, 25, 18, 28]` med `25` som *venstre* barn. Begge er gyldige heaps; slidet kommenterer ikke valget.',
        'Højden: L07 s. 11 definerer højden som antal kanter, men s. 15 siger “log N + 1” og s. 16 “log N”, og Python-funktionen på s. 16 (`trunc(log2(N)) + 1`) tæller niveauer, ikke kanter. Bogen siger ⌊log N⌋ (s. 247).',
        'Svarene på Menti-spørgsmålene (s. 14, 18, 20, 23, 27, 32, 33) står ikke på slidene; de er udledt her af definitionerne og kontrolleret med slidekoden.',
        'L07 s. 28 siger, at percolate up og down er O(log N) i værste tilfælde. Gennemsnittet står kun i bogen: `insert` bruger i gennemsnit 2,607 sammenligninger (O(1)), `deleteMin` er O(log N) i gennemsnit (Weiss s. 251–252). Bedste tilfælde nævnes ingen steder.',
        'Pladskompleksitet for de enkelte operationer nævnes ikke på slidene; bogens kapitelopsummering siger, at heapen “requires no links and only a constant amount of extra space” (Weiss s. 283, uden for pensumudsnittet 6.1–6.4).',
      ],
      keywords: ['ADS', 'AOD', 'SW2ADS', 'binær heap', 'binary heap', 'heap', 'min-heap', 'max-heap', 'prioritetskø', 'priority queue', 'komplet binært træ', 'complete binary tree', 'heap-order', 'heap-orden', 'strukturegenskab', 'ordensegenskab', 'percolate up', 'percolate down', 'sift-up', 'sift-down', 'minHeapify', 'percolateDown', 'insert', 'deleteMin', 'findMin', 'decreaseKey', 'increaseKey', 'remove', 'BinaryHeap', 'currentSize', 'hul', 'hole', 'sentinel', 'array-repræsentation', '2i', '2i+1', 'i/2', 'Menti'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'heapify-heapsort',
      title: 'Heapify og heapsort',
      week: 'Lektion 7',
      definition:
        '**Heapify** (`buildHeap`) bygger en heap ud af et vilkårligt array ved at køre percolate down på hver indre knude, fra den sidste indre knude og op til roden. Det koster O(N), ikke O(N log N), fordi de fleste knuder ligger nederst og kun kan flytte få niveauer. **Heapsort** bygger en heap og udtrækker minimum (eller maksimum) N gange; det giver O(N log N) i værste tilfælde og kan gøres in-place i samme array.',
      concepts: [
        {
          term: 'Den naive opbygning: N × insert',
          body: [
            'En almindelig operation er at konstruere en heap fra et array (L07 s. 39). Den oplagte løsning er at indsætte de N elementer med `insert`: “Complexity? O(N log N)”. Slide 29 stiller spørgsmålet “There are N calls to percolate down, so overall it takes O(N log N)? Can this be performed more efficiently?”.',
            'Bogen nuancerer: hver `insert` koster O(1) i gennemsnit og O(log N) i værste tilfælde, så N indsættelser giver O(N) i gennemsnit, men O(N log N) i værste tilfælde. Da der ikke sker andre operationer imens, er det rimeligt at forvente en garanteret lineær grænse (Weiss s. 255).',
          ],
        },
        {
          term: 'buildHeap: percolate down på første halvdel',
          body: [
            'Idéen (L07 s. 40): når man heapificerer en knude, skal dens to undertræer allerede være heaps. Bladene er trivielt heaps — på slidet er `7`, `19` og `10` markeret med “These do all fulfil the heap property”. Derfor starter `buildHeap` ved `currentSize / 2`, den sidste knude med børn, og kører `minHeapify(i)` baglæns ned til `i = 1` (s. 46). Slidet spørger “heapifying its first half. Why?” — svaret er, at anden halvdel af arrayet er blade.',
            'Slidenes eksempel (s. 40–44) er arrayet `[33, 31, 18, 7, 19, 10]`. Trin 1: `18` bytter med sit barn `10`. Trin 2: `31` bytter med det mindste barn `7`. Trin 3: roden `33` bytter med `7`. Trin 3b: `33` er stadig større end sine nye børn `31` og `19` og bytter med `19`; de øvrige undertræer er “untouched”. Resultatet er `[7, 19, 10, 31, 33, 18]`.',
            'Bogen viser samme algoritme på 15 tal (`150, 80, 40, 30, 10, 70, 110, 100, 20, 90, 60, 50, 120, 140, 130`), ét træ efter hver af de syv `percolateDown` (figur 6.15–6.18, s. 256–257). Den tæller 10 stiplede linjer, hver svarende til to sammenligninger — i alt 20 (s. 255).',
          ],
        },
        {
          term: 'Hvorfor buildHeap er O(N)',
          body: [
            'Argumentet på L07 s. 45: en knude, der står x niveauer over bunden, kan højst lave x byt. Niveau i har 2ⁱ knuder, og hver kan højst lave h − i byt, hvor h = log₂ N. Summen af 2ⁱ(h − i) over niveauerne er lineær i N, altså O(N).',
            'Bogens Theorem 6.1 (s. 256–257) laver samme regnestykke som summen af højderne: for det perfekte binære træ med højde h og 2ʰ⁺¹ − 1 knuder er summen af højderne 2ʰ⁺¹ − 1 − (h + 1). Et komplet træ har mellem 2ʰ og 2ʰ⁺¹ knuder, så summen er O(N). Intuitionen: halvdelen af knuderne er blade og flytter slet ikke, en fjerdedel flytter højst ét niveau, og kun roden kan flytte hele vejen ned.',
          ],
        },
        {
          term: 'Konstruktøren BinaryHeap(const vector&)',
          body: [
            'Den anden konstruktør tager en `vector`, kopierer elementerne til `array[1…N]` og kalder `buildHeap()` (L07 s. 35: “We will detail this operation later”). I kursets `BinaryHeap.h` og i bogen (figur 6.14, s. 255) sættes `currentSize{ items.size() }` i initialiseringslisten, *før* `buildHeap()` kører — det er nødvendigt, fordi `buildHeap` læser `currentSize`.',
            '`buildHeap` og `minHeapify` er private (s. 46): brugeren ser kun konstruktøren, og heapen er altid gyldig udefra.',
          ],
        },
        {
          term: 'STL: std::priority_queue',
          body: [
            'Standardbiblioteket har den binære heap som klasseskabelonen `priority_queue` i `<queue>` (L07 s. 6; Weiss s. 282). Den er en **max-heap** som standard: `top()` returnerer det største element, og `pop()` fjerner det. Skabelonparametrene er elementtype, container (standard `vector`) og komparator (standard `less<T>`); med `priority_queue<int, vector<int>, greater<int>>` får man en min-heap.',
            'Slidet indsætter `4, 3, 2, 1, 5` i begge og tømmer dem med `dumpContents`: `minPQ` giver `1 2 3 4 5`, `maxPQ` giver `5 4 3 2 1`. Slide 7 bruger en `struct Task` med `operator<` på `priority`; opgaverne kommer ud i rækkefølgen 10, 7, 5, 3, 1 (“Fix critical bug” først). Kursets `TestPQ.cpp` er samme program med tre tal.',
          ],
        },
        {
          term: 'Heapsort med en separat heap',
          body: [
            'Da minimum kan udtrækkes i logaritmisk tid, kan man sortere: byg en heap af inputtet og udtræk de N minima i rækkefølge (L07 s. 48). Slide 49 viser en simpel version, der bygger `MinHeap<T> heap(array)`, tømmer det oprindelige array og skubber `heap.peek()` tilbage efter hver `heap.remove()`, og spørger “What is the overall time and memory complexity?”.',
            'Bogen svarer (s. 300): opbygningen er O(N), hver af de N `deleteMin` er O(log N), i alt O(N log N). Problemet er pladsen: versionen bruger et ekstra array, så hukommelsesforbruget fordobles.',
          ],
        },
        {
          term: 'In-place heapsort',
          body: [
            'Tricket (Weiss s. 300): efter hver udtrækning bliver heapen én kortere, så den celle, der var sidst i heapen, kan opbevare det udtrukne element. Med en min-heap ender arrayet i *faldende* orden. Slide 50 bruger en min-heap med roden på indeks 0 (`leftChild(i) = 2*i+1`), bygger heapen fra `array.size() / 2 - 1` ned til 0, bytter `array[0]` med `array[j]` og kalder `minHeapify(array, 0, j)` for `j` fra N − 1 ned til 1, og vender til sidst arrayet med `std::reverse`.',
            'Bogen og kursets `Sort.h` undgår `reverse` ved at bruge en **max-heap**: `percDown` vælger det *største* barn, og hver `swap(a[0], a[j])` er en `deleteMax`, der lægger maksimum bagerst (figur 7.10, s. 302). Bogens eksempel: `31, 41, 59, 26, 53, 58, 97` bliver efter `buildHeap` til max-heapen `97, 53, 59, 26, 41, 58, 31` (figur 7.8), og efter første `deleteMax` til `59, 53, 58, 26, 41, 31 | 97` (figur 7.9, s. 301).',
            'Heapsort er dermed en sammenligningsbaseret O(N log N)-sortering uden ekstra array, i modsætning til [[merge-sort|merge sort]], og uden quicksorts O(N²)-værste tilfælde (se [[quicksort|quicksort]]). Bogen konkluderer i 7.8, at merge sort og heapsort er optimale inden for en konstant faktor (s. 323; se [[sortering-nedre-graense|nedre grænse]]).',
          ],
        },
        {
          term: 'Analysen af heapsort',
          body: [
            'Bogens 7.5.1 (s. 301): opbygningen bruger færre end 2N sammenligninger; den i’te `deleteMax` bruger højst 2⌊log(N − i + 1)⌋; i alt højst 2N log N − O(N) sammenligninger i værste tilfælde. Theorem 7.5 (s. 303) viser, at gennemsnittet for en tilfældig permutation er 2N log N − O(N log log N), og bogen tilføjer, at heapsort altid bruger mindst N log N − O(N) sammenligninger (s. 304). Heapsort er altså meget stabil i tid: bedste, gennemsnitlige og værste tilfælde er alle Θ(N log N).',
          ],
        },
      ],
      viz: 'doa-buildheap',
      keyPoints: [
        '`buildHeap`: percolate down fra `currentSize / 2` baglæns til roden. Bladene (anden halvdel) er allerede heaps.',
        'N × `insert` koster O(N log N) i værste tilfælde; `buildHeap` koster O(N), fordi summen af knudernes højder er O(N).',
        'Slidets eksempel: `[33, 31, 18, 7, 19, 10]` → `[7, 19, 10, 31, 33, 18]` i fire byt.',
        '`std::priority_queue` er en max-heap; `greater<T>` giver en min-heap. `push`, `top`, `pop`, `empty`.',
        'Heapsort = byg heap + N udtrækninger. In-place: læg det udtrukne element i den plads, heapen lige har opgivet.',
        'Min-heap giver faldende orden (slidet kalder `std::reverse`); max-heap (bogen, `Sort.h`) giver stigende orden direkte.',
        'Kompleksitet (L07 s. 39; Weiss s. 255): N × `insert` bedste ikke angivet · gennemsnit O(N) · værste O(N log N) · plads ikke angivet.',
        'Kompleksitet (L07 s. 45; Weiss s. 256–257): `buildHeap` bedste ikke angivet · gennemsnit ikke angivet · værste O(N) · plads ikke angivet (algoritmen arbejder i heapens eget array).',
        'Kompleksitet (Weiss s. 300–304): heapsort bedste ≥ N log N − O(N) sammenligninger · gennemsnit 2N log N − O(N log log N) · værste 2N log N − O(N), dvs. O(N log N) · plads: in-place uden ekstra array (versionen på L07 s. 49 bruger O(N) ekstra).',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Konstruktør og buildHeap (kursets kildekode)',
          source: 'BinaryHeap.h (kildekode_part1.md); samme som Weiss s. 255, fig. 6.14',
          code: `explicit BinaryHeap( const vector<Comparable> & items )
  : array( items.size( ) + 10 ), currentSize{ items.size( ) }
{
    for( int i = 0; i < items.size( ); ++i )
        array[ i + 1 ] = items[ i ];
    buildHeap( );
}

/**
 * Establish heap order property from an arbitrary
 * arrangement of items. Runs in linear time.
 */
void buildHeap( )
{
    for( int i = currentSize / 2; i > 0; --i )
        percolateDown( i );
}`,
        },
        {
          lang: 'cpp',
          title: 'Heapsort – C++ optimized (min-heap + reverse)',
          source: 'Lecture07.pdf s. 50',
          code: `inline size_t leftChild(size_t i) { return 2*i+1; }
inline size_t rightChild(size_t i) { return 2*i+2; }

// 'node' is starting point, 'n' is size of heap
template <typename T>
void minHeapify(vector<T> &array, int node, int n)
{
    int child;
    T tmp = std::move(array[node]);
    for (; leftChild(node) < n; node = child) {
        child = leftChild(node);
        if (child != n - 1) // Within range
            if (array[rightChild(node)] < array[child])
                child = rightChild(node);
        if (array[child] < tmp)
            array[node] = std::move(array[child]);
        else
            break;
    }
    array[node] = std::move(tmp);
}

template <typename T>
void heapSort(vector<T> &array)
{
    // Build Min-Heap
    for (int i = array.size() / 2 - 1; i >= 0; --i)
        minHeapify(array, i, array.size());

    // Swap smallest with last element
    // and re-heapify sub-array
    for (int j = array.size() - 1; j > 0; --j) {
        std::swap(array[0], array[j]);
        minHeapify(array, 0, j);
    }

    // Reverse to have ascending order
    std::reverse(array.begin(), array.end());
}`,
        },
        {
          lang: 'cpp',
          title: 'std::priority_queue som max- og min-heap',
          source: 'Lecture07.pdf s. 6 (dumpContents står til højre på slidet; her før main)',
          code: `// Empty the priority queue and print its contents.
template <typename PriorityQueue>
void dumpContents(const string& msg, PriorityQueue& pq) {
    cout << msg << ":" << endl;
    while (!pq.empty()) {
        cout << pq.top() << endl;
        pq.pop();
    }
}

// Do some inserts and removes (done in dumpContents).
int main() {
    priority_queue<int> maxPQ;

    // vector<int> is container;
    // greater<T> is the comparator.
    // Default container is vector,
    // and default comparator is less<T>
    priority_queue<int, vector<int>, greater<int>> minPQ;

    minPQ.push(4);
    minPQ.push(3);
    minPQ.push(2);
    minPQ.push(1);
    minPQ.push(5);
    maxPQ.push(4);
    maxPQ.push(3);
    maxPQ.push(2);
    maxPQ.push(1);
    maxPQ.push(5);

    dumpContents("minPQ", minPQ);
    dumpContents("maxPQ", maxPQ);

    return 0;
}`,
        },
      ],
      exam: [
        '`buildHeap` kører percolate down på knuderne fra `N / 2` og baglæns til roden. Bladene — anden halvdel af arrayet — er allerede heaps, og når vi når en knude, er begge dens undertræer heaps, så én percolate down gør hele undertræet til en heap.',
        'Det koster O(N) og ikke O(N log N), fordi en knude kun kan flytte så mange niveauer, som den står over bunden. Halvdelen af knuderne er blade og flytter ikke; kun roden kan flytte log N niveauer. Summen af højderne i træet er O(N) — det er bogens Theorem 6.1.',
        'Sådan løser du “byg en heap med heapify” (opgavetype fra L07 s. 40–44, ikke fra eksamenssæt): 1) skriv tallene i arrayet i den givne rækkefølge fra indeks 1; 2) find den sidste indre knude `N / 2`; 3) for hver knude fra `N / 2` ned til 1: sammenlign med det mindste barn og ryk ned, til begge børn er større; 4) tegn træet efter hver knude. `[33, 31, 18, 7, 19, 10]` giver `[7, 19, 10, 31, 33, 18]`.',
        'Sådan løser du “sortér med heapsort i hånden” (opgavetype fra L07 s. 48–50 og Weiss 7.5): 1) byg heapen i arrayet med indeks fra 0; 2) byt roden med sidste element i heapen, gør heapen én kortere, og kør percolate down fra roden; 3) gentag, til heapen har ét element; 4) med en max-heap står arrayet nu stigende, med en min-heap faldende. Bogens data `31, 41, 59, 26, 53, 58, 97` giver max-heapen `97, 53, 59, 26, 41, 58, 31`.',
        'Heapsort er O(N log N) i alle tilfælde og kræver ikke et ekstra array, når det udtrukne element lægges i den plads, heapen lige har opgivet. `std::priority_queue` er en max-heap; vil man have minimum øverst, giver man `greater<T>` som komparator.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture07_Priority_Queues.md'), original: 'Lecture07.pdf', pages: 's. 6–7, 29, 35, 39–50' },
        { path: k('context/book/AOD_Ch06_Priority_Queues.md'), original: BOOK, pages: 's. 255–257', note: '6.3.4 buildHeap, Theorem 6.1' },
        { path: k('data/Data Structures and Algorithm Analysis in C++.pdf'), original: BOOK, pages: 's. 282–283', note: '6.9 Priority queues in the standard library (uden for pensumudsnittet)' },
        { path: k('data/Data Structures and Algorithm Analysis in C++.pdf'), original: BOOK, pages: 's. 300–304', note: '7.5 Heapsort (ikke med i AOD_Ch07-udsnittet, som dækker 7.1–7.2 og 7.6–7.8)' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 323', note: '7.8: merge sort og heapsort er optimale inden for en konstant faktor' },
        { path: k('context/kode/kildekode_part1.md'), note: 'BinaryHeap.h (konstruktør, buildHeap)' },
        { path: k('context/kode/kildekode_part6.md'), note: 'Sort.h (heapsort, percDown, leftChild)' },
        { path: k('context/kode/kildekode_part11.md'), note: 'TestPQ.cpp' },
        { path: k('context/videos/SW2ADS_Video_Week07_Priority_Queues.md'), original: 'data/video transcripts/week7.txt', note: 'heapify bottom-up og heapsort' },
      ],
      gaps: [
        'Konstruktøren på L07 s. 35 kalder `buildHeap()`, *før* `currentSize` er sat, og sætter bagefter `currentSize = items.size() + 1`. `buildHeap` læser dermed en uinitialiseret `currentSize`, og størrelsen er én for stor. En kørsel af slidekoden med `[33, 31, 18, 7, 19, 10]` gav segmentation fault. Kursets `BinaryHeap.h` og Weiss (figur 6.14, s. 255) sætter `currentSize{ items.size() }` før `buildHeap()`; brug den version.',
        'Formlen på L07 s. 45 skriver Σ 2ⁱ(h − i) = 2ʰ⁺¹ − 2h − 2 = 2N − log₂(N) − 2. Med N = 2ʰ giver 2h leddet 2·log₂ N, ikke log₂ N; desuden er et træ med højde h og fyldte niveauer 2ʰ⁺¹ − 1 knuder, ikke 2ʰ. Konklusionen O(N) holder. Bogens Theorem 6.1 (s. 256) summerer over i = 0…h og får 2ʰ⁺¹ − 1 − (h + 1).',
        'Heapsort på slidene (s. 49) bruger `MinHeap<T>` med `peek()` og `remove()`, som ikke findes i kursets kode (`BinaryHeap` har `findMin` og `deleteMin`). Koden er et uddrag; den kompilerede her med en lille `MinHeap`-wrapper om `BinaryHeap`.',
        'Kursets `Sort.h` (og bogens figur 7.10) definerer `heapsort` *før* `percDown`. Med g++ 17 fejler `heapsort` på `vector<int>` og `vector<string>`: “percDown was not declared in this scope” (to-fase-opslag; ADL finder ikke en global funktion for typer i `std`). Flyt `percDown` op eller forward-deklarér den. Slidets version på s. 50 har den rigtige rækkefølge og kompilerer.',
        'Slidene stiller “What is the overall time and memory complexity?” (s. 49) og “Time and memory complexity?” (s. 50) uden at svare. Svarene her er bogens (s. 300–304). Markdown-konverteringen skriver selv svar ind, der ikke står i PDF’en.',
        'Heapsort (7.5) og STL-afsnittet (6.9) ligger uden for de bogudsnit, der er konverteret til `context/book/` (6.1–6.4 og 7.1–7.2, 7.6–7.8). Sidetallene er fra den fulde bog i `data/`.',
        'Stabilitet nævnes ikke for heapsort i slides eller bog. Uden for materialet: heapsort er ikke stabil, fordi byttet mellem roden og sidste element kan flytte lige store elementer forbi hinanden.',
        'Kompleksiteten af `std::priority_queue`s `push` og `pop` står ikke i materialet. Bogen (s. 283) lister også `clear()` som medlemsfunktion. Uden for materialet: `std::priority_queue` har ingen `clear()`.',
        'Agendaen på L07 s. 3 har punktet “The C++ STL priority queue” som tredje punkt, men eksemplerne ligger forrest (s. 6–7), og punktet er afkrydset allerede på s. 10.',
      ],
      keywords: ['heapify', 'buildHeap', 'build heap', 'opbyg heap', 'heapsort', 'heap sort', 'in-place', 'percDown', 'minHeapify', 'deleteMax', 'max-heap', 'min-heap', 'std::priority_queue', 'priority_queue', 'greater', 'less', 'push', 'top', 'pop', 'Task', 'dumpContents', 'TestPQ', 'Sort.h', 'Theorem 6.1', 'sum of heights', 'summen af højder', 'O(N)', 'O(N log N)', 'std::reverse', 'sift-down'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'bst',
      title: 'Binære søgetræer',
      week: 'Lektion 8',
      definition:
        'Et **binært søgetræ** (BST) er et binært træ, hvor alle værdier i en knudes venstre undertræ er mindre end knudens egen, og alle værdier i højre undertræ er større. Ordenen gør, at `contains`, `insert` og `remove` hver kun følger én sti fra roden, så de koster O(h), hvor h er træets højde: O(log N) i et pænt træ og i gennemsnit, men O(N), når træet degenererer til en kæde.',
      concepts: [
        {
          term: 'Behovet for hurtig søgning',
          body: [
            'Lektion 8 starter med opgaver, der kræver effektive operationer på data: et filsystem, store aritmetiske udtryk og “searching and modifying a dynamic ordered set” (L08 s. 3). Heaps gav logaritmiske operationer, “but no fast search”; med strukturerne indtil nu kan de operationer kun gøres i lineær tid.',
            'Et sorteret array giver hurtig søgning med [[soegning|binær søgning]] (s. 4–16, eksemplet `{9, 16, 18, 28, 32, 35}` med søgning efter `28`). Refleksionsslidet s. 17 spørger, hvorfor binær søgning er bedre end O(n), og hvad indsættelse og sletning koster i et sorteret array. Søgetræet skal give hurtig søgning *og* hurtig ændring.',
          ],
        },
        {
          term: 'BST-egenskaben',
          body: [
            'Definitionen (L08 s. 18): “for every node y, the values of all the items in its left subtree are smaller than the item in y, and the values of all the items in its right subtree are larger than the item in y.” Et typisk BST har tre operationer: `insert`, `contains` og `remove`.',
            'Slide 19 viser to træer med roden `6`: det venstre (`6 / 2 8 / 1 4 / 3`) er et BST; det højre har `7` under `4` i venstre undertræ af `6` — “Left-child of 6 is bigger than 6”. Det er bogens figur 4.15 (s. 132). Bemærk, at det ikke er nok at tjekke hver forælder mod sine børn: `7 > 4` er lovligt lokalt, men `7` ligger i venstre undertræ af `6`.',
            'Egenskaben kræver, at alle nøgler er forskellige. Kursets kode ignorerer dubletter (“Duplicate; do nothing”). Bogen foreslår i stedet et ekstra felt med antal forekomster i knuden (s. 136–138).',
          ],
        },
        {
          term: 'Interface i to lag',
          body: [
            'Implementeringen er delt i to lag (L08 s. 22): et ydre lag med ADT-interfacet som template og et privat indre lag, der er implementeret **rekursivt**. Det ydre lag kalder bare det indre fra roden, fx `contains(x, root)` (s. 23–24). Det indre lag kunne skrives iterativt, men “at the cost of code legibility”; kursets kode har den iterative `contains` som udkommenteret alternativ.',
            'Den interne knudetype `BinaryNode` har `element`, `left` og `right`, og træet har ét datamedlem, `root`, “at the very end” (s. 21). Det ydre lag kaster en undtagelse, hvis træet er tomt, når man kalder `findMin` eller `findMax` (s. 23: `underflow_error("tree is empty.")`).',
            'De private funktioner tager `BinaryNode * & t` — en **reference til en pointer**. Så kan den rekursive `insert` ændre selve pointeren i forælderen (`p->left` eller `p->right`) eller `root`, når den opretter et nyt blad. Bogen kalder det “a slick maneuver” (s. 138–139). Søgningen bruger kun `operator<`: x og y matcher, når hverken `x < y` eller `y < x` (s. 132).',
            'Destruktoren kalder `makeEmpty`, der rekursivt sletter begge undertræer og derefter knuden selv (Weiss s. 141) — samme idé som [[sys/raii|RAII]]: træet ejer sine knuder og frigiver dem, når det selv nedlægges. `printTree` gennemløber venstre undertræ, knuden og højre undertræ og udskriver dermed “the tree contents in sorted order” — en *inorder*-traversering.',
          ],
        },
        {
          term: 'contains, findMin og findMax',
          body: [
            'Søgning starter i roden og følger ordenen (L08 s. 26): er x mindre end knuden, gå til venstre; er den større, gå til højre; ellers er den fundet. Eksemplet søger `4` i `6 / 2 8 / 1 4 / 3`: `6 → 2 → 4`. Når man rammer `nullptr`, findes x ikke. Bogen understreger, at testen for tomt træ skal komme først (s. 135).',
            '`findMin` går til venstre, så længe der er et venstre barn; `findMax` går til højre (s. 25). I eksemplet er minimum `1` og maksimum `8`. Kurset og bogen skriver bevidst `findMin` rekursivt og `findMax` iterativt for at vise begge stilarter (Weiss s. 135).',
          ],
        },
        {
          term: 'insert',
          body: [
            'Indsættelse følger samme sti som en søgning, indtil den finder en tom plads, og sætter det nye blad dér (L08 s. 27). Eksemplet indsætter `5` i `6 / 2 8 / 1 4 / 3`: `6 → 2 → 4`, og `4` har intet højre barn, så `5` bliver højre barn af `4`. Et nyt element bliver altid et blad; træets eksisterende form ændres ikke.',
            'Rækkefølgen af indsættelser bestemmer formen. Refleksionsslidet s. 32 beder om træet efter `5, 1, 4, 10, 19, 20, 8, 7`: roden `5`, `1` til venstre med `4` som højre barn, `10` til højre med `8` (og `7` under den) til venstre og `19` → `20` til højre.',
          ],
        },
        {
          term: 'remove: tre tilfælde',
          body: [
            'Sletning er den svære operation og har tre tilfælde (L08 s. 28): 1) knuden har ingen børn — slet den; 2) knuden har ét barn — lad forælderen pege forbi den på barnet, og slet knuden; 3) knuden har to børn — erstat knudens værdi med den **mindste værdi i højre undertræ**, og slet så den knude.',
            'Slidene tager alle tre tilfælde på træet `6 / 2 8 / 1 4 / 3 (5)` — hver gang fra det oprindelige træ, ikke efter hinanden: `5` er et blad og fjernes (s. 29); `4` har kun barnet `3`, så `2`’s højre pointer peger nu på `3` (s. 30); `2` har to børn, så dens værdi erstattes af “smallest larger value” `3`, og `3` slettes fra højre undertræ (s. 31), hvilket giver `6 / 3 8 / 1 4`. Den mindste knude i højre undertræ kan ikke have et venstre barn, så den anden sletning er altid tilfælde 1 eller 2 (Weiss s. 139).',
            'Koden (s. 29–31) klarer tilfælde 1 og 2 i samme gren: `t = (t->left != nullptr) ? t->left : t->right;` efterfulgt af `delete oldNode`. Bogen kalder løsningen ineffektiv, fordi den går to gange ned gennem højre undertræ, og nævner `removeMin` og **lazy deletion** (marker som slettet) som alternativer (s. 139).',
          ],
        },
        {
          term: 'Kompleksitet: balanceret mod degenereret',
          body: [
            'Operationerne arbejder på én knude pr. niveau, så de kører i O(h) (L08 s. 33). Slidet viser to træer: `6 / 2 8 / 1 4` med h = log₂(N) og kæden `6 → 2 → 1` med h = N. Konklusionen er “Best case O(logN), worst case O(N)”. Refleksionsslidet s. 34 skriver, at alle BST-operationer er O(log n) i gennemsnit, og spørger til værste tilfælde.',
            'Bogen (4.3.6, s. 141–144) begrunder gennemsnittet: den gennemsnitlige dybde af en knude er O(log N), når alle indsættelsesrækkefølger er lige sandsynlige, fordi den interne stilængde D(N) i gennemsnit er O(N log N). Sletninger bryder antagelsen: den asymmetriske `remove` (altid fra højre undertræ) gør over tid venstre side dybere, og efter Θ(N²) tilfældige insert/remove-par er den forventede dybde Θ(√N).',
            'Kommer inputtet sorteret, bliver træet en kæde uden venstre børn, og N indsættelser koster kvadratisk tid — “a very expensive implementation of a linked list” (Weiss s. 144). Svaret er en **balancebetingelse**: se [[avl|AVL-træer]].',
          ],
        },
      ],
      viz: 'doa-bst',
      keyPoints: [
        'BST-egenskaben gælder hele undertræer: alt til venstre < knuden < alt til højre.',
        'Alle operationer følger én sti fra roden, så de koster O(h). h er log₂ N i et pænt træ og N i en kæde.',
        'Nyt element bliver altid et blad på den plads, søgningen slutter.',
        '`remove`: blad → slet; ét barn → forælderen peger på barnet; to børn → kopiér mindste værdi fra højre undertræ ind og slet den.',
        'De private funktioner tager `BinaryNode * & t`, så rekursionen kan ændre forælderens pointer eller `root`.',
        '`printTree` er inorder og skriver værdierne sorteret.',
        'Sorteret input giver et degenereret træ — motivationen for AVL.',
        'Kompleksitet (L08 s. 33–34; Weiss s. 141–144): `contains`, `insert`, `remove`, `findMin`, `findMax` bedste ikke angivet · gennemsnit O(log N) · værste O(N) (degenereret træ) · plads: rekursionsstakken følger dybden, O(log N) forventet (Weiss s. 135).',
        'Kompleksitet (L08 s. 4–17, s. 3): sorteret array med binær søgning: søgning O(log n); indsættelse og sletning spørger refleksionsslidet s. 17 til uden at svare, s. 3 siger kun “linear time” om strukturerne indtil da.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'contains, findMin og findMax (indre lag)',
          source: 'BinarySearchTree.h (kildekode_part2.md); Lecture08.pdf s. 25–26',
          code: `/**
 * Internal method to find the smallest item in a subtree t.
 * Return node containing the smallest item.
 */
BinaryNode * findMin( BinaryNode *t ) const
{
    if( t == nullptr )
        return nullptr;
    if( t->left == nullptr )
        return t;
    return findMin( t->left );
}

/**
 * Internal method to find the largest item in a subtree t.
 * Return node containing the largest item.
 */
BinaryNode * findMax( BinaryNode *t ) const
{
    if( t != nullptr )
        while( t->right != nullptr )
            t = t->right;
    return t;
}

/**
 * Internal method to test if an item is in a subtree.
 * x is item to search for.
 * t is the node that roots the subtree.
 */
bool contains( const Comparable & x, BinaryNode *t ) const
{
    if( t == nullptr )
        return false;
    else if( x < t->element )
        return contains( x, t->left );
    else if( t->element < x )
        return contains( x, t->right );
    else
        return true;    // Match
}`,
        },
        {
          lang: 'cpp',
          title: 'insert — pointer by reference',
          source: 'BinarySearchTree.h (kildekode_part2.md); Lecture08.pdf s. 27',
          code: `/**
 * Internal method to insert into a subtree.
 * x is the item to insert.
 * t is the node that roots the subtree.
 * Set the new root of the subtree.
 */
void insert( const Comparable & x, BinaryNode * & t )
{
    if( t == nullptr )
        t = new BinaryNode{ x, nullptr, nullptr };
    else if( x < t->element )
        insert( x, t->left );
    else if( t->element < x )
        insert( x, t->right );
    else
        ;  // Duplicate; do nothing
}`,
        },
        {
          lang: 'cpp',
          title: 'remove — de tre tilfælde',
          source: 'BinarySearchTree.h (kildekode_part2.md); Lecture08.pdf s. 29–31',
          code: `/**
 * Internal method to remove from a subtree.
 * x is the item to remove.
 * t is the node that roots the subtree.
 * Set the new root of the subtree.
 */
void remove( const Comparable & x, BinaryNode * & t )
{
    if( t == nullptr )
        return;   // Item not found; do nothing
    if( x < t->element )
        remove( x, t->left );
    else if( t->element < x )
        remove( x, t->right );
    else if( t->left != nullptr && t->right != nullptr ) // Two children
    {
        t->element = findMin( t->right )->element;
        remove( t->element, t->right );
    }
    else
    {
        BinaryNode *oldNode = t;
        t = ( t->left != nullptr ) ? t->left : t->right;
        delete oldNode;
    }
}`,
        },
      ],
      exam: [
        'Et binært søgetræ holder alle mindre værdier i venstre undertræ og alle større i højre. Derfor kan `contains`, `insert` og `remove` nøjes med at følge én sti fra roden, og de koster O(h). I et pænt træ er h ≈ log₂ N; i gennemsnit over tilfældige indsættelsesrækkefølger er dybden også O(log N).',
        'Værste tilfælde er O(N): indsætter man sorteret data, får hver knude kun et højre barn, og træet er reelt en linked list. Det er grunden til, at man balancerer træet, fx med AVL.',
        'Sådan løser du “tegn BST’et efter indsættelse af …” (opgavetype fra refleksionsslidet L08 s. 32, ikke fra eksamenssæt): 1) første tal er roden; 2) for hvert nyt tal: start i roden og gå til venstre, hvis tallet er mindre, og til højre, hvis det er større; 3) sæt det som blad, hvor stien ender; 4) tegn træet efter hver indsættelse. `5, 1, 4, 10, 19, 20, 8, 7` giver roden `5` med `1(–, 4)` til venstre og `10(8(7), 19(–, 20))` til højre.',
        'Sådan løser du “vis hvordan x fjernes” (opgavetype fra L08 s. 28–32): 1) find x; 2) tæl børn — nul: fjern; ét: lad forælderen pege på barnet; to: find mindste værdi i højre undertræ (én gang til højre, så helt til venstre), kopiér den op, og fjern den fra højre undertræ; 3) tegn resultatet. I slidets træ med roden `12` bliver `4` erstattet af `5`, og `5`’s højre barn `6` rykker op under `7`.',
        'Sorteret array eller BST (refleksion L08 s. 34): begge søger i O(log n), men et sorteret array skal flytte elementer ved indsættelse og sletning, mens et BST kun ændrer pointere langs én sti. Til data, der ændrer sig, vælger man træet — helst et balanceret.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture08_SearchTrees.md'), original: 'Lecture08.pdf', pages: 's. 2–34' },
        { path: k('context/book/AOD_Ch04_SearchTrees.md'), original: BOOK, pages: 's. 132–144', note: '4.3 The Search Tree ADT — Binary Search Trees' },
        { path: k('context/kode/kildekode_part2.md'), note: 'BinarySearchTree.h' },
        { path: k('context/kode/kildekode_part10.md'), note: 'TestBinarySearchTree.cpp' },
      ],
      gaps: [
        'Sidetal: “L08 s. N” er PDF-sidetal. Sidefoden ligger 8 højere fra s. 3 (fx PDF s. 18 = “26”, s. 33 = “41”), fordi skjulte slides er fjernet.',
        'Slidene viser koden delt i `binary_search_tree.h` og `binary_search_tree.tpp` med `std::underflow_error` (s. 21–24). Kursets `BinarySearchTree.h` er én header med `UnderflowException` fra `dsexceptions.h` og har desuden move-konstruktør og move-assignment. Koden her er fra `BinarySearchTree.h`; `insert` på s. 27 har samme logik med en ekstra `else { … }`-blok.',
        'Traverseringer (preorder, inorder, postorder) gennemgås ikke i L08. `printTree` er inorder uden at hedde det. Bogen navngiver dem under udtrykstræer (4.2.2, s. 129); afsnit 4.6 “Tree Traversals (Revisited)” (s. 166) ligger uden for pensumudsnittet 4.1–4.4.',
        'Markdown-konverteringen tegner træet i refleksionsopgave 3 (L08 s. 32) forkert: `6` står som *venstre* barn af `5`. PDF-billedet viser `6` som højre barn (det skal den være, da 6 > 5).',
        'Refleksionsspørgsmålene (s. 17, 32, 34) har ingen svar på slidene. Svarene i `exam` er udregnet med kursets `BinarySearchTree.h` på slidenes data.',
        'Slide 33 skriver “h = N” for kæden `6 → 2 → 1`; med kanttælling (L07 s. 11) er højden N − 1. Det ændrer ikke O(N).',
        'Pladskompleksitet: bogen siger kun, at rekursionsstakken forventes at være O(log N) (s. 135). At den bliver O(N) i et degenereret træ, står ikke i materialet.',
        'Indsættelse og sletning i et sorteret array spørges der til på s. 17 uden svar. Markdown-konverteringens tabel med O(n) står ikke i PDF’en.',
      ],
      keywords: ['BST', 'binary search tree', 'binært søgetræ', 'søgetræ', 'search tree', 'BST-egenskab', 'ordensegenskab', 'contains', 'insert', 'remove', 'findMin', 'findMax', 'makeEmpty', 'printTree', 'clone', 'BinaryNode', 'BinarySearchTree', 'inorder', 'traversering', 'degenereret træ', 'skewed', 'pointer by reference', 'BinaryNode * &', 'lazy deletion', 'removeMin', 'smallest in right subtree', 'internal path length', 'intern stilængde', 'dublet', 'duplicate'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'avl',
      title: 'AVL-træer',
      week: 'Lektion 8',
      definition:
        'Et **AVL-træ** er et binært søgetræ med en balancebetingelse: for hver knude må højden af venstre og højre undertræ højst afvige med 1. Betingelsen holder træets højde på O(log N), så `contains`, `insert` og `remove` er O(log N) i værste tilfælde. Når en indsættelse eller sletning bryder betingelsen, genoprettes den med en **enkeltrotation** (ydre ubalance) eller en **dobbeltrotation** (indre ubalance).',
      concepts: [
        {
          term: 'Balancerede træer',
          body: [
            '“We need to work harder to obtain worst-case logarithmic time!” (L08 s. 36). Løsningen er at holde søgetræet balanceret; slidet nævner AVL-træer og red-black-træer. AVL-træets balanceegenskab: “tolerate difference in height of at most one between left and right subtrees of any node”, og de tre hovedoperationer kører i O(log N) i værste tilfælde.',
            'Bogen forklarer, hvorfor betingelsen ser sådan ud (Weiss s. 144–145): at kræve samme højde kun ved roden er for svagt (træet kan stadig være dybt), og at kræve samme højde i alle knuder er for stift (kun perfekte træer med 2ᵏ − 1 knuder opfylder det). AVL-betingelsen er kompromiset. Tomme undertræer har højden −1.',
          ],
        },
        {
          term: 'Højden af et AVL-træ',
          body: [
            'Hver knude gemmer sin højde (“Augment nodes with height”, L08 s. 42; `int height` i `AvlNode`). Bogen angiver, at et AVL-træs højde højst er ca. 1,44 log(N + 2) − 1,328, men i praksis kun lidt mere end log N (s. 145).',
            'Det mindste antal knuder S(h) i et AVL-træ med højde h opfylder S(h) = S(h − 1) + S(h − 2) + 1 med S(0) = 1 og S(1) = 2: det mindste træ består af en rod med et minimalt træ af højde h − 1 og et af højde h − 2. S(h) er tæt beslægtet med Fibonacci-tallene, og det mindste AVL-træ med højde 9 har 143 knuder (Weiss s. 145, figur 4.33).',
            'Slide 37 viser et AVL-træ (`6 / 2 8 / 1 4 7 / 3`) og et træ, der bryder betingelsen (`6 / 2 8 / 1 4 / 3 5`): ved roden er venstre side 3 høj og højre side 1, “3-1 > 1 ➔ Imbalance”. Bogens figur 4.32 (s. 145) er det samme par med roden `5` hhv. `7`.',
          ],
        },
        {
          term: 'Hvor ubalancen opstår: de fire tilfælde',
          body: [
            '“Only insertions and deletions can violate the balance property” (L08 s. 39). Efter en indsættelse kan kun knuderne på stien fra det nye blad op til roden have fået ændret balance. Man går stien op, opdaterer højderne og rebalancerer ved den **første (dybeste)** knude α, der bryder betingelsen (Weiss s. 145).',
            'Bogen deler i fire tilfælde efter, hvor indsættelsen skete set fra α (s. 146): 1) venstre undertræ af venstre barn; 2) højre undertræ af venstre barn; 3) venstre undertræ af højre barn; 4) højre undertræ af højre barn. Tilfælde 1 og 4 er spejlbilleder — den **ydre** ubalance (“outer imbalance”, s. 39) — og løses med en enkeltrotation. Tilfælde 2 og 3 er den **indre** ubalance (“inner imbalance”, s. 41) og kræver en dobbeltrotation.',
            'Man bestemmer tilfældet ved at gå to skridt fra α ned mod den nye knude: venstre–venstre eller højre–højre er ydre; venstre–højre eller højre–venstre er indre.',
          ],
        },
        {
          term: 'Enkeltrotation',
          body: [
            'Slide 39 viser rotationen for den ydre ubalance til højre: `k1` er roden med undertræet `X` til venstre og barnet `k2` til højre; `k2` har `Y` og det for dybe `Z`. Efter rotationen er `k2` rod med `k1` til venstre og `Z` til højre, og `Y` er flyttet over som højre barn af `k1`. BST-ordenen holder, fordi alt i `Y` ligger mellem `k1` og `k2`.',
            'Eksemplet på s. 40 indsætter `6` i AVL-træet `5 / 2 8 / 1 4 7 / 3`. `6` bliver venstre barn af `7`, og knuden `8` får venstre højde 2 mod højre 0 — “Imbalance at LEFT subtree of LEFT child” (tilfælde 1). En “single right rotation” mellem `7` og `8` gør `7` til rod i undertræet med `6` og `8` som børn: `5 / 2 7 / 1 4 6 8 / 3`. Bogen bruger nøjagtig samme træ (figur 4.35, s. 148).',
            'Bogen (s. 147): efter rotationen rykker `X` ét niveau op, `Y` bliver, og `Z` rykker ét ned. Det roterede undertræ har samme højde som før indsættelsen, så der skal ikke opdateres eller roteres længere oppe. Man skal huske at koble det nye undertræs rod til forælderen — ellers mister man en del af træet (s. 148).',
          ],
        },
        {
          term: 'Dobbeltrotation',
          body: [
            'En enkeltrotation virker ikke ved indre ubalance, fordi det for dybe undertræ `Y` bliver liggende i samme dybde (Weiss figur 4.37, s. 150). Slide 41 viser tilfældet “Imbalance at RIGHT subtree of LEFT child”: `k3` har venstre højde 3 og højre 1; dens venstre barn `k1` har `A` (højde 1) og det tungere højre barn `k2` (højde 2) med `B` og `C`.',
            'Løsningen er to rotationer: 1) en venstrerotation mellem `k1` og `k2`, så `k2` bliver `k3`’s venstre barn; 2) en højrerotation mellem `k3` og `k2`. Resultatet er `k2` som rod med `k1` (børn `A`, `B`) og `k3` (børn `C`, `D`) — “Left-right double rotation”. Den eneste mulighed er at gøre `k2` til rod, og det bestemmer helt, hvor de fire undertræer havner (Weiss s. 150).',
            'Bogen opsummerer: en dobbeltrotation er det samme som først at rotere mellem α’s barn og barnebarn og derefter mellem α og dets nye barn (s. 151). Tilfælde 3 er spejlbilledet (right–left).',
          ],
        },
        {
          term: 'Implementeringen: balance()',
          body: [
            'Kursets AVL-træ (L08 s. 42; `AvlTree.h`) er BST-koden med ét ekstra kald: `insert` og `remove` kalder `balance(t)` til sidst, så balancen genoprettes nedefra og op, efterhånden som rekursionen vender tilbage (“at the end of recursion”).',
            '`balance` sammenligner `height(t->left) - height(t->right)` med `ALLOWED_IMBALANCE = 1`. Er venstre side for høj, og er `height(t->left->left) >= height(t->left->right)`, er det ydre tilfælde 1 → `rotateWithLeftChild(t)`; ellers indre tilfælde 2 → `doubleWithLeftChild(t)`. Højre side er spejlvendt med `rotateWithRightChild` (tilfælde 4) og `doubleWithRightChild` (tilfælde 3). Til sidst opdateres `t->height = max(height(t->left), height(t->right)) + 1`.',
            'Navnene kan forvirre: `rotateWithLeftChild` roterer knuden med sit *venstre barn* og er dermed slidets “single right rotation”. `doubleWithLeftChild(k3)` kalder først `rotateWithRightChild(k3->left)` og så `rotateWithLeftChild(k3)` — præcis slidets trin 1 og 2.',
          ],
        },
        {
          term: 'Sletning',
          body: [
            'Sletning i et AVL-træ er BST-sletningen med `balance(t)` til sidst — “This change works!” (Weiss s. 154–157, figur 4.47). En sletning kan gøre den ene side to niveauer lavere end den anden. Tilfældene ligner indsættelsens, men i tilfælde 1 kan `Y` nu være lige så dyb som `X`. Derfor bruger `balance` `>=` i stedet for `>`: ved lige højder vælges enkeltrotationen, som er den rigtige her (s. 156–158).',
            'Refleksionsslidet s. 45 beder om træet efter sletning af `10`: fjernes bladet `10`, har knuden `20` et tomt venstre undertræ og højre barn `30` med venstre barn `25` — en indre ubalance (højre–venstre), der løses med en dobbeltrotation, så `25` bliver rod i undertræet med `20` og `30` som børn.',
          ],
        },
      ],
      viz: 'doa-avl-rotation',
      keyPoints: [
        'AVL-betingelsen: for hver knude afviger venstre og højre undertræs højde højst med 1. Tomt træ har højde −1.',
        'Kun `insert` og `remove` kan bryde betingelsen, og kun på stien fra ændringen op til roden. Rebalancér ved den dybeste knude α med |forskel| = 2.',
        'Ydre ubalance (venstre–venstre, højre–højre) → enkeltrotation. Indre (venstre–højre, højre–venstre) → dobbeltrotation.',
        'Efter en rotation ved indsættelse har undertræet samme højde som før, så én (enkelt- eller dobbelt)rotation er nok.',
        '`balance()` kaldes til sidst i den rekursive `insert`/`remove`; `>=` sikrer enkeltrotation ved lige højder (vigtigt ved sletning).',
        '`rotateWithLeftChild` = slidets højrerotation (tilfælde 1); `doubleWithLeftChild` = venstre–højre dobbeltrotation (tilfælde 2).',
        'Højde højst ca. 1,44 log(N + 2) − 1,328; minimumstræet opfylder S(h) = S(h − 1) + S(h − 2) + 1.',
        'Kompleksitet (L08 s. 36; Weiss s. 145): `contains`, `insert`, `remove` bedste ikke angivet · gennemsnit ikke angivet · værste O(log N) · plads: én `int height` ekstra pr. knude.',
        'Kompleksitet (Weiss s. 147, 150): en rotation (enkelt eller dobbelt) er et konstant antal pointerændringer, dvs. O(1); slidene angiver det ikke.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'balance: vælg enkelt- eller dobbeltrotation',
          source: 'Lecture08.pdf s. 42; AvlTree.h (kildekode_part1.md)',
          code: `static const int ALLOWED_IMBALANCE = 1;

// Assume t is balanced or within one of being balanced
void balance( AvlNode * & t )
{
    if( t == nullptr )
        return;

    if( height( t->left ) - height( t->right ) > ALLOWED_IMBALANCE )
        if( height( t->left->left ) >= height( t->left->right ) )
            rotateWithLeftChild( t );
        else
            doubleWithLeftChild( t );
    else
    if( height( t->right ) - height( t->left ) > ALLOWED_IMBALANCE )
        if( height( t->right->right ) >= height( t->right->left ) )
            rotateWithRightChild( t );
        else
            doubleWithRightChild( t );

    t->height = max( height( t->left ), height( t->right ) ) + 1;
}`,
        },
        {
          lang: 'cpp',
          title: 'Enkeltrotationer (tilfælde 1 og 4)',
          source: 'AvlTree.h (kildekode_part1.md); Weiss s. 156, fig. 4.44',
          code: `/**
 * Rotate binary tree node with left child.
 * For AVL trees, this is a single rotation for case 1.
 * Update heights, then set new root.
 */
void rotateWithLeftChild( AvlNode * & k2 )
{
    AvlNode *k1 = k2->left;
    k2->left = k1->right;
    k1->right = k2;
    k2->height = max( height( k2->left ), height( k2->right ) ) + 1;
    k1->height = max( height( k1->left ), k2->height ) + 1;
    k2 = k1;
}

/**
 * Rotate binary tree node with right child.
 * For AVL trees, this is a single rotation for case 4.
 * Update heights, then set new root.
 */
void rotateWithRightChild( AvlNode * & k1 )
{
    AvlNode *k2 = k1->right;
    k1->right = k2->left;
    k2->left = k1;
    k1->height = max( height( k1->left ), height( k1->right ) ) + 1;
    k2->height = max( height( k2->right ), k1->height ) + 1;
    k1 = k2;
}`,
        },
        {
          lang: 'cpp',
          title: 'Dobbeltrotationer og insert med balance',
          source: 'AvlTree.h (kildekode_part1.md); Weiss s. 155, fig. 4.42 og s. 157, fig. 4.46',
          code: `/**
 * Double rotate binary tree node: first left child.
 * with its right child; then node k3 with new left child.
 * For AVL trees, this is a double rotation for case 2.
 * Update heights, then set new root.
 */
void doubleWithLeftChild( AvlNode * & k3 )
{
    rotateWithRightChild( k3->left );
    rotateWithLeftChild( k3 );
}

/**
 * Double rotate binary tree node: first right child.
 * with its left child; then node k1 with new right child.
 * For AVL trees, this is a double rotation for case 3.
 * Update heights, then set new root.
 */
void doubleWithRightChild( AvlNode * & k1 )
{
    rotateWithLeftChild( k1->right );
    rotateWithRightChild( k1 );
}

/**
 * Internal method to insert into a subtree.
 * x is the item to insert.
 * t is the node that roots the subtree.
 * Set the new root of the subtree.
 */
void insert( const Comparable & x, AvlNode * & t )
{
    if( t == nullptr )
        t = new AvlNode{ x, nullptr, nullptr };
    else if( x < t->element )
        insert( x, t->left );
    else if( t->element < x )
        insert( x, t->right );

    balance( t );
}`,
        },
      ],
      exam: [
        'Et AVL-træ er et binært søgetræ, hvor venstre og højre undertræ i hver knude højst må afvige én i højde. Det holder højden på O(log N) — højst ca. 1,44 log N — så søgning, indsættelse og sletning er O(log N) i værste tilfælde, i modsætning til et almindeligt BST’s O(N).',
        'Efter en indsættelse går man stien op mod roden og opdaterer højderne. Den første knude, hvor forskellen er 2, rebalanceres. Er indsættelsen sket på ydersiden — venstre–venstre eller højre–højre — er én rotation nok; er den sket på indersiden — venstre–højre eller højre–venstre — skal der en dobbeltrotation til, fordi en enkeltrotation lader det dybe undertræ blive liggende i samme dybde.',
        'Sådan løser du “indsæt x i AVL-træet og vis rotationerne” (opgavetype fra refleksionsslidene L08 s. 43–45, ikke fra eksamenssæt): 1) indsæt som i et BST; 2) gå fra det nye blad op og skriv højden (eller balancen venstre − højre) ved hver knude; 3) stop ved den første knude α med forskel 2; 4) gå to skridt fra α mod det nye blad og navngiv tilfældet (LL, LR, RL, RR); 5) LL/RR: enkeltrotation mellem α og barnet; LR/RL: rotér først barn og barnebarn, så α og det nye barn; 6) tegn det færdige træ og tjek balancen i alle knuder.',
        'Eksempel fra L08 s. 43: `9` ind i `10 / 5 15 / 1 7 12 18 / 6 8` lander som højre barn af `8`. Knuden `5` får venstre højde 0 og højre 2 — højre–højre, altså én venstrerotation om `5`: `10 / 7 15 / 5 8 12 18 / 1 6 – 9`. Og `25` ind i `20 / 10 40 / 30 50` (s. 44) er højre–venstre ved `20` og giver efter dobbeltrotationen `30 / 20 40 / 10 25 – 50`.',
        'I kursets kode sker balanceringen i `balance()`, som `insert` og `remove` kalder til sidst i rekursionen. Den bruger `>=` i sammenligningen, så lige høje undertræer giver en enkeltrotation — det er det tilfælde, der kun kan opstå ved sletning.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture08_SearchTrees.md'), original: 'Lecture08.pdf', pages: 's. 35–45' },
        { path: k('context/book/AOD_Ch04_SearchTrees.md'), original: BOOK, pages: 's. 144–158', note: '4.4 AVL Trees, 4.4.1 Single Rotation, 4.4.2 Double Rotation' },
        { path: k('context/kode/kildekode_part1.md'), note: 'AvlTree.h' },
        { path: k('context/kode/kildekode_part10.md'), note: 'TestAvlTree.cpp' },
      ],
      gaps: [
        'Efter-billedet på L08 s. 40 (PDF) viser ikke rotationen: `8` står stadig over `7`, der har `6` som barn, og `8` har en tom højre kant. Det rigtige resultat, `5 / 2 7 / 1 4 6 8 / 3`, står i bogens figur 4.35 (s. 148) og fås også, når man kører kursets `AvlTree.h`. Markdown-konverteringen forsøger to gange og tegner stadig forkert.',
        'Højdekonventionen skifter: L07 s. 11 og `AvlTree.h`/Weiss tæller kanter (blad = 0, tomt = −1), men tallene på L08 s. 37, 40 og 41 tæller knuder (et blads tomme undertræer får 0, bladet 1). Forskellene — og dermed hvornår der roteres — er de samme.',
        'Slide 39 viser enkeltrotationen for tilfælde 4 (højre–højre, venstrerotation), mens eksemplet på s. 40 er tilfælde 1 (højrerotation), og s. 41 er tilfælde 2. Bogens nummerering 1–4 (s. 146) og kodens kommentarer (“case 1” osv.) bruges ikke på slidene.',
        'Refleksionsopgaverne (L08 s. 43–45) har ingen svar i materialet. Svarene i `exam`, `concepts` og figur-beats er udregnet med kursets `AvlTree.h`.',
        'Markdown-konverteringen tegner træerne på s. 37 og s. 45 ufuldstændigt (fx mangler `7` under `8` i det gyldige AVL-træ, og kanterne under `55`, `70` og `100` er forskudt). Brug PDF-billederne.',
        '`AvlTree.h`s kommentarblok siger “void remove( x ) --> Remove x (unimplemented)”, men `remove` er implementeret længere nede (BST-sletning + `balance`).',
        'B-træer nævnes ikke i L07 eller L08; L08 s. 36 nævner kun “Red-black Tree, …”. Bogens 4.7 “B-Trees” (s. 168) ligger uden for pensumudsnittet (4.1–4.4). B-træer og red-black-træer er ikke dækket af pensum.',
        'Kompleksiteten af en rotation og AVL-træets gennemsnitlige tilfælde angives ikke på slidene; bogen siger “only a few pointer changes” (s. 147) og at højden i praksis er “only slightly more than log N” (s. 145).',
      ],
      keywords: ['AVL', 'AVL-træ', 'AVL tree', 'Adelson-Velskii', 'Landis', 'balanceret træ', 'balanced tree', 'balancebetingelse', 'balance factor', 'balancefaktor', 'rotation', 'enkeltrotation', 'single rotation', 'dobbeltrotation', 'double rotation', 'venstrerotation', 'højrerotation', 'left rotation', 'right rotation', 'left-right', 'right-left', 'LL', 'LR', 'RL', 'RR', 'outer imbalance', 'inner imbalance', 'ydre ubalance', 'indre ubalance', 'rotateWithLeftChild', 'rotateWithRightChild', 'doubleWithLeftChild', 'doubleWithRightChild', 'balance', 'ALLOWED_IMBALANCE', 'AvlNode', 'height', 'AvlTree', 'red-black', 'B-træ', 'B-tree'],
    },
  ],
}
