import type { Course } from '../types'
import { k } from './paths'
import { grundlag } from './p1-grundlag'
import { lineaere } from './p2-lineaere'
import { hashing } from './p3-hashing'
import { sortering } from './p4-sortering'
import { traeer } from './p5-traeer'
import { grafer } from './p6-grafer'
import { design } from './p7-design'

export const doa: Course = {
  id: 'doa',
  code: 'SW3DOA-01',
  name: 'Algoritmer og datastrukturer',
  short: 'DOA',
  semester: 3,
  ects: '5 ECTS',
  status: 'ready',
  intro:
    'Faget handler om de almindelige datastrukturer — lister, stakke, køer, hashtabeller, heaps, søgetræer og grafer — set i forhold til deres matematiske modeller (følger, mængder), og om de algoritmer, der implementerer operationerne på dem. Hver struktur og algoritme vurderes på eksekveringshastighed, hukommelsesforbrug, kompleksitet og egnethed til en given anvendelse. Kurset bruger C++ og Weiss’ *Data Structures & Algorithm Analysis in C++* og slutter med algoritmedesign: greedy, divide and conquer, backtracking og dynamisk programmering.',
  introSource: k('kursuskatalog.md'),
  exam: {
    form: '3 timers skriftlig tilsynsprøve (Assign). 7-trinsskala, ekstern censur. Computer, software, bøger, noter og internet; ingen GAI.',
    points: [
      '**Forudsætning:** mindst 4 laboratorieøvelser indsendt og godkendt. Bog: Weiss, *Data Structures & Algorithm Analysis in C++*, 4th ed. Håndskrevne dele (træer, grafer, tabeller) digitaliseres i WISEflow.',
      '**Ingen gamle eksamenssæt i materialet.** `data/exams/` og `data/excersises/` er tomme. Opskrifterne under emnernes “Det skal du kunne sige” er derfor udledt af slidenes refleksionsopgaver og Mentimeter-spørgsmål, ikke af eksamenssæt. De eneste slides, der selv kalder sig “EXAM QUESTION”, er L11 s. 3–5 (adjacency matrix, all-to-all-forbindelser, kabelnet som MST; se [[mst|minimum spanning tree]]).',
      '**Udfør i hånden** — den hyppigste opgavetype i øvelserne: binær søgning ([[soegning|søgning]]), indsæt med linear/quadratic probing og rehash ([[open-addressing|open addressing]]), insertion/merge/quicksort på et array ([[insertion-sort|insertion sort]], [[merge-sort|merge sort]], [[quicksort|quicksort]]), insert/deleteMin og buildHeap ([[binaer-heap|binær heap]], [[heapify-heapsort|heapify]]), indsæt og slet i BST og AVL med rotationer ([[bst|BST]], [[avl|AVL]]), BFS/DFS-rækkefølge ([[dfs-bfs|DFS og BFS]]), Dijkstra fra en startknude ([[dijkstra|Dijkstra]]), A* med g/h/f-tabel ([[a-stjerne|A*]]), Prim og Kruskal ([[mst|MST]]) og en DP-tabel ([[dynamisk-programmering|dynamisk programmering]]). Skriv hver mellemtilstand op — det er dem, der giver point.',
      '**Bestem kompleksiteten:** tæl løkker og kald ([[loekkeanalyse|løkkeanalyse]]), bevis f(n) = O(g(n)) med c og n₀ ([[big-o|Big-O]]), og tegn rekursionstræet for rekursive funktioner ([[rekursion|rekursion]]). Hvert emne har en kompleksitetstabel (bedste/gennemsnit/værste/plads) med kilde.',
      '**Vælg og begrund en datastruktur:** sammenlign på de operationer, problemet bruger mest — fx array vs. linked list ([[lister|lister]]), sorteret array vs. BST vs. hashtabel ([[bst|BST]], [[hashtabeller|hashing]]), adjacency matrix vs. liste ([[grafer|grafer]]), vector vs. prioritetskø i Prim og Dijkstra.',
      '**Kør koden med pen og papir:** flere Menti-opgaver viser kursets C++-kode og spørger om output eller om en fejl (fx `clear()` der ikke nulstiller `theSize`, L03 s. 16–17). Hjælpemidler er tilladt, men GAI er ikke.',
    ],
  },
  goalsSource: k('kursuskatalog.md'),
  goals: [
    { text: 'Beskrive, anvende og sammenligne udvalgte algoritmer og datastrukturer.', topics: ['lister', 'stakke-koeer', 'hashtabeller', 'binaer-heap', 'bst', 'avl', 'quicksort', 'mst'] },
    { text: 'Kombinere algoritmer og datastrukturer til løsning af et givet problem.', topics: ['heapify-heapsort', 'dijkstra', 'a-stjerne', 'mst', 'open-addressing'] },
    { text: 'Sammenligne, udvælge og ræsonnere for valget af algoritme eller datastruktur til et givet problem.', topics: ['lister', 'hashtabeller', 'sortering-nedre-graense', 'grafer', 'heuristikker', 'mst'] },
    { text: 'Anvende algoritmiske teknikker til at løse problemer og implementere løsningen.', topics: ['rekursion', 'merge-sort', 'designteknikker', 'dynamisk-programmering', 'dfs-bfs'] },
    { text: 'Udlede og analysere tids- og pladskompleksitet.', topics: ['big-o', 'loekkeanalyse', 'rekursion', 'merge-sort', 'sortering-nedre-graense', 'heapify-heapsort'] },
    { text: 'Designe og implementere datastrukturer og algoritmer og bedømme ydeevne og egnethed i specifikke situationer.', topics: ['pointere-iteratorer', 'adt', 'separate-chaining', 'avl', 'dynamisk-programmering'] },
  ],
  gaps: [
    '**Navn:** faget hed tidligere ADS (SW2ADS, 2. semester) og hedder nu DOA (SW3DOA-01, 3. semester). Kursusmaterialet er ikke opdateret og siger stadig SW2ADS/AOD; filnavnene i kilderne er de gamle. Kursuskataloget angiver ingen kursuskode.',
    '**Ingen gamle eksamenssæt eller øvelsesopgaver:** `data/exams/` og `data/excersises/` er tomme. Eksamensopskrifterne er udledt af slidenes refleksions- og Menti-opgaver. Frederik kan lægge sættene ind senere.',
    '**Slidenumre er PDF-sidetal.** Flere decks har skjulte slides, så tallet i slidets hjørne er højere end PDF-siden (fx L02 med 3–4, L03 og L04 med 1 fra hhv. s. 63 og s. 35, Lecture05 har 14 sider med hjørnenumre til 17, Lecture06 28 sider med numre til 39, Lecture12 én skjult side efter s. 9).',
    '**Markdown-konverteringerne af slides og bog har tilføjelser, der ikke står i originalerne:** svar på Menti- og refleksionsopgaver, kompleksitetstabeller, “amortized O(1)”, Master Theorem, Introsort, Stirling, et opfundet binærsøgningseksempel og forkert tegnede grafer og træer (DFS-rækkefølgen og Dijkstra-grafen i L09, AVL-træerne i L08). Emnerne bygger på PDF-siderne; afvigelserne står under emnernes huller.',
    '**Lecture01 hedder “Pointers, iterators and searching”, men indeholder ingen søgning** — heller ikke bogudsnittet med samme navn. Søgning bygger på Weiss 2.4.4, L08 og L12 ([[soegning|søgning]]).',
    '**Ω og Θ defineres ikke på slides** (kun O), men bruges senere (L06, L09, L13). Definitionerne er fra Weiss s. 51–53 ([[big-o|Big-O]]).',
    '**Kursets kildekode er Weiss’ bogkode**, og dele af den kompilerer ikke med g++ 13: `Sort.h` bruger `percDown` og `merge`, før de er erklæret. Flere slide-uddrag har også fejl (konstruktøren i L07 s. 35 kalder `buildHeap()` før `currentSize` er sat, `quickSort` i L06 s. 19 læser uden for arrayet). Fejlene står under emnernes huller.',
    '**Ikke dækket af pensum:** B-træer (L07 s. 44 handler om heapify; bogens 4.7 ligger uden for udsnittet), stabilitet af sorteringsalgoritmer (kun Weiss opgave 7.31), træ-traverseringer, rekurrensligninger på slides (kun i bogen) og stakkens klassiske anvendelser (balancerede symboler, postfix — kun i bogen).',
    '**All-pairs shortest path** er krydset af på L11’s agenda (s. 23), men decket har ingen slides om det. Stoffet findes kun i videoen fra uge 11 og Weiss 10.3.4 ([[mst|MST]]).',
    '**Manglende bilag:** `explanation_primes.pdf`, `example_greedy-merged.pdf`, `example_backtracking_exhaustive-merged.pdf` og `fibonacci_*.pdf` nævnes, men ligger ikke i materialet.',
    '**Semesterangivelser er blandede:** markdown-filerne siger både “Spring 2025” og “Fall 2025”; L11’s sidefod siger “FALL 2025”.',
  ],
  parts: [grundlag, lineaere, hashing, sortering, traeer, grafer, design],
}
