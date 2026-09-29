import type { Part } from '../types'
import { k, BOOK } from './paths'

export const design: Part = {
  id: 'design',
  title: 'Algoritmedesign',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'designteknikker',
      title: 'Greedy, divide and conquer og backtracking',
      short: 'Designteknikker',
      week: 'Lektion 12',
      definition:
        'Lektion 12 samler de **algoritmedesignteknikker**, kurset har brugt undervejs, under tre navne. En **greedy** algoritme tager i hver fase det valg, der ser bedst ud lige nu, og håber at det lokale optimum er det globale. **Divide and conquer** deler problemet i mindre, disjunkte delproblemer, løser dem rekursivt og kombinerer svarene. **Backtracking** er en klog udtømmende søgning, der prøver en mulighed, går tilbage ved en blindgyde og prøver den næste. Gennemgående eksempel er **coin changing**: greedy virker for dollar, men ikke for sedlerne (1, 5, 6, 9).',
      intro: [
        'Slidet starter med, at man kan finde en algoritme ved at se på problemets struktur, instansernes forventede størrelse og ligheden med kendte problemer, og at lektionen genbesøger teknikkerne og viser én ny (L12 s. 2). Den nye teknik er [[dynamisk-programmering|dynamisk programmering]] i lektion 13.',
      ],
      concepts: [
        {
          term: 'Greedy algoritmer',
          body: [
            'En greedy algoritme arbejder i en sekvens af **faser**. I hver fase træffes en beslutning, der ser god ud, “without regard for future consequences”. Det lokale optimum vælges — “take what you can get now” — og når algoritmen stopper, håber vi, at det lokale optimum er lig det globale (L12 s. 4). Bogen tilføjer: er det tilfældet, er algoritmen korrekt; ellers har den givet en suboptimal løsning (Weiss s. 449).',
            'Fordelen er, at greedy **degrades gracefully**: er løsningen ikke optimal, får man typisk en approksimation (L12 s. 5). Bogen siger det samme: simple greedy algoritmer bruges til approksimerede svar, når det absolut bedste ikke er påkrævet (s. 449).',
            'Kurset har set tre greedy algoritmer (L12 s. 5): [[dijkstra|Dijkstra]] (det grådige skridt er at vælge knuden med kortest *tentative* afstand), [[mst|Prim]] (kant med mindst vægt) og [[mst|Kruskal]] (kant med mindst vægt). Slidet nævner navigation og scheduling som andre eksempler. Bogen nævner de samme tre fra kapitel 9 (s. 449).',
            'Slidets advarsel: “A major pitfall of greedy algorithms is giving the temptation of optimality because greedy solutions are so simple” (L12 s. 6).',
          ],
        },
        {
          term: 'Coin changing — problemet',
          body: [
            'Formelt (L12 s. 7): givet et sæt møntværdier og et målbeløb, find det **mindste antal mønter**, der giver beløbet; kan det ikke lade sig gøre, returnér fx `-1`. Slidets eksempel: `coins = [1, 2, 5]`, `amount = 11` giver `3` (5 + 5 + 1).',
            'Den grådige strategi tager iterativt den **største** værdi, der passer (L12 s. 6). Slidets eksempel er $17.61 med værdierne (10, 5, 1, 0.25, 0.1, 0.01). Bogen skriver udbetalingen ud: én tidollarseddel, én femdollarseddel, to dollarsedler, to quarters, én dime og én penny — 8 stykker — og siger, at det kan bevises at greedy er optimal i det amerikanske møntsystem, men ikke i alle (Weiss s. 449–450).',
          ],
        },
        {
          term: 'Hvor greedy fejler: $11 med (1, 5, 6, 9)',
          body: [
            'Slidet: “Not general solution. Breaking $11 with bills (1, 5, 6, 9) leads to suboptimal solutions”, og refleksionsopgave 1 beder dig verificere det (L12 s. 6 og 8).',
            'Greedy tager 9 (rest 2), så 1 (rest 1), så 1: **9 + 1 + 1 = 3 sedler**. Det optimale er **5 + 6 = 2 sedler**. Det første valg (9) ser bedst ud lokalt, men lukker for den bedre kombination. Opgaven henviser til `example_greedy-merged.pdf`, som ikke ligger i materialet.',
          ],
        },
        {
          term: 'Divide and conquer',
          body: [
            'To dele (L12 s. 9): **Divide** — bryd problemet i mindre problemer og løs dem rekursivt indtil basistilfældet; **Conquer** — kombinér delløsningerne til løsningen på det oprindelige problem. Delproblemerne er som regel **disjunkte**, så de kan løses uden at forstyrre hinanden. Slidets eksempler er [[merge-sort|MergeSort]] og [[quicksort|QuickSort]].',
            'Bogen skærper definitionen: traditionelt kaldes rutiner med **mindst to** rekursive kald divide and conquer, mens rutiner med ét kald ikke gør (Weiss s. 467–468). Mergesort og quicksort har O(N log N) i hhv. værste og gennemsnitligt tilfælde (s. 468). Bogen kalder også den naive rekursive Fibonacci for divide and conquer i navnet, men “terribly inefficient, because the problem really is not divided at all” (s. 468) — det er netop det problem, [[dynamisk-programmering|dynamisk programmering]] løser.',
            'Kompleksiteten af rekursive algoritmer findes typisk ved at løse en **rekurrensligning** (L12 s. 10; se [[rekursion|rekursion]]). Bogens sætning 10.6 løser `T(N) = aT(N/b) + Θ(N^k)` med `a ≥ 1`, `b > 1`: O(N^(log_b a)) hvis `a > b^k`, O(N^k log N) hvis `a = b^k`, O(N^k) hvis `a < b^k` (Weiss s. 468–469). Mergesort er `T(N) = 2T(N/2) + O(N)` (s. 468). Sætningen står ikke på slides.',
          ],
        },
        {
          term: 'Reduction: binær søgning',
          body: [
            'Ikke alle rekursive algoritmer er divide and conquer; nogle **reducerer** blot problemet til ét simplere tilfælde, fx [[soegning|binær søgning]] og gennemløb af [[bst|binære søgetræer]] (L12 s. 10).',
            'Binær søgning: “Search space is halved per step. The other half is never visited” (L12 s. 11). Slidets rekursive `binarySearch(arr, low, high, x)` beregner `mid = low + (high - low) / 2` og kalder sig selv på **én** af halvdelene. Driveren søger efter 90 i `{ 2, 3, 4, 10, 40 }` og skriver “Element is not present in array”. Bogen nævner søgning i binære søgetræer som reduction, ikke binær søgning i array (Weiss s. 468).',
          ],
        },
        {
          term: 'Backtracking',
          body: [
            '“In many cases, a backtracking algorithm amounts to a clever implementation of exhaustive search, with generally unfavorable performance” (L12 s. 12; samme sætning i Weiss s. 506). Eksemplet er **Maze challenge**: `searchMaze` markerer cellen som besøgt og prøver op, højre, ned og venstre; en retning prøves kun, hvis de forrige ikke fandt udgangen `E`. Returnerer et kald `false`, går søgningen tilbage til forrige celle og prøver næste retning.',
            'Bogen forklarer, hvorfor det er bedre end ren brute force: dårlige delløsninger opdages tidligt og kasseres i ét skridt — **pruning** (Weiss s. 506, eksemplet med møbler, der aldrig placerer sofaen i køkkenet). Slidet nævner ikke pruning.',
            'Refleksionsopgave 2 (L12 s. 13): skitsér en rekursiv algoritme til coin changing, der udtømmende søger alle løsninger. Mønsteret: beløb 0 giver 0 mønter; negativt beløb er en blindgyde; ellers prøv hver mønt `c`, løs rekursivt for `beløb − c` og tag minimum + 1. Samme delbeløb løses mange gange — overgangen til [[dynamisk-programmering|DP]], hvor lektion 13 beder dig memoisere netop denne algoritme (L13 s. 13).',
          ],
        },
        {
          term: 'General advice: reuse og decompose',
          body: [
            '**Reuse** (L12 s. 14): “it is important to be a clever thief” — “do not reinvent the wheel”. Mange problemer er løst før: søg (og evaluér), brug biblioteker som STL og open source, og omformulér dit krav, så det bliver et løst problem.',
            '**Decompose** (L12 s. 15): brug abstraktionerne. Har du brug for noget, så “ask the wish fairy” — antag at en funktion eller metode gør jobbet, og kald den. Det er top-down-dekomposition: skriv hovedalgoritmen mod ønskede hjælpefunktioner, og implementér dem bagefter.',
          ],
        },
      ],
      viz: 'doa-coin-change',
      keyPoints: [
        'Greedy: lokalt optimum i hver fase, uden hensyn til fremtiden; korrekt kun hvis lokalt = globalt optimum.',
        'Dijkstra, Prim og Kruskal er kursets tre greedy algoritmer.',
        'Coin changing med (10, 5, 1, 0.25, 0.1, 0.01): greedy er optimal. Med (1, 5, 6, 9) og $11: greedy 9+1+1 (3), optimal 5+6 (2).',
        'Divide and conquer: del i disjunkte delproblemer, løs rekursivt, kombinér. MergeSort og QuickSort.',
        'Reduction ≠ divide and conquer: binær søgning kalder kun rekursivt på én halvdel.',
        'Backtracking = klog udtømmende søgning; prøv, gå tilbage ved blindgyde; pruning kasserer mange muligheder på én gang.',
        'Kompleksitet (Weiss s. 450; L12 s. 6): greedy coin changing bedste · gennemsnit · værste ikke angivet · plads ikke angivet.',
        'Kompleksitet (L12 s. 11; Weiss s. 68): `binarySearch` bedste ikke angivet · gennemsnit ikke angivet · værste O(log n) · plads ikke angivet.',
        'Kompleksitet (L12 s. 9; Weiss s. 468): MergeSort værste O(n log n) · QuickSort gennemsnit O(n log n); backtracking (L12 s. 12) “generally unfavorable”, ingen Big-O angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Reduction: rekursiv binær søgning',
          source: 'Lecture12.pdf s. 11',
          code: `#include <bits/stdc++.h>
using namespace std;

// A recursive binary search function. It returns
// location of x in given array arr[low..high] is present,
// otherwise -1
int binarySearch(int arr[], int low, int high, int x)
{
    if (high >= low) {
        int mid = low + (high - low) / 2;

        // If the element is present at the middle
        // itself
        if (arr[mid] == x)
            return mid;

        // If element is smaller than mid, then
        // it can only be present in left subarray
        if (arr[mid] > x)
            return binarySearch(arr, low, mid - 1, x);

        // Else the element can only be present
        // in right subarray
        return binarySearch(arr, mid + 1, high, x);
    }
  return -1;
}

// Driver code
int main()
{
    int arr[] = { 2, 3, 4, 10, 40 };
    int query = 90;
    int n = sizeof(arr) / sizeof(arr[0]);
    int result = binarySearch(arr, 0, n - 1, query);
    if (result == -1) cout << "Element is not present in array";
    else cout << "Element is present at index " << result;
    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Backtracking: Maze challenge (uddrag — validMove, ROWS og COLS står ikke på slidet)',
          source: 'Lecture12.pdf s. 12',
          code: `bool searchMaze(char maze[][COLS], bool visited[][COLS], int x, int y)
{
        bool foundExit;
        if (maze[y][x]=='E')
                return true;
        visited[y][x]=true;
        if (validMove(maze, visited, x, y-1)) // up
                foundExit = searchMaze(maze, visited, x, y-1);
        if (!foundExit && (validMove(maze, visited, x+1, y))) // right
                foundExit = searchMaze(maze, visited, x+1, y);
        if (!foundExit && (validMove(maze, visited, x, y+1))) // down
                foundExit = searchMaze(maze, visited, x, y+1);
        if (!foundExit && (validMove(maze, visited, x-1, y))) // left
                foundExit = searchMaze(maze, visited, x-1, y);
        return foundExit;
}


int main(void)
{
        char maze[ROWS][COLS] = {
                {'X','X','X','X','X','X'},
                {'X',' ',' ',' ',' ','X'},
                {'X',' ','X',' ',' ','X'},
                {'X',' ','X',' ',' ','X'},
                {'X','E','X','X','X','X'}
        };

        bool visited[ROWS][COLS];
        std::fill(*visited, *visited + ROWS*COLS, false);

        int x = 1, y = 1;
        cout << searchMaze(maze, visited, x, y) << endl;
}`,
        },
      ],
      exam: [
        'Greedy tager det lokalt bedste valg i hver fase og fortryder aldrig; det er korrekt, når lokalt optimum også er globalt, som i Dijkstra, Prim og Kruskal, men for coin changing med (1, 5, 6, 9) giver det 9+1+1 i stedet for 5+6.',
        'Sådan løser du “vis at greedy er suboptimal” (opgavetype fra refleksionsopgaven L12 s. 8, udledt af øvelserne, ikke af eksamenssæt): 1) sortér værdierne faldende; 2) tag gentagne gange den største værdi ≤ restbeløbet og skriv rest og antal i en tabel; 3) find en kombination med færre stykker (prøv at udelade det første grådige valg); 4) konkludér, at det lokale valg lukkede for det globale optimum.',
        'Sådan skitserer du en udtømmende/backtracking-løsning (opgavetype fra refleksionsopgaven L12 s. 13): 1) basistilfælde: beløb 0 giver 0; 2) blindgyde: negativt beløb er ugyldigt; 3) rekursion: for hver mønt `c` løs `beløb − c`; 4) returnér minimum + 1. Tegn rekursionstræet og peg på gentagne delbeløb — det er argumentet for DP.',
        'Divide and conquer deler i disjunkte delproblemer og kombinerer, som MergeSort; binær søgning er kun en reduction, fordi den halverer søgerummet og aldrig besøger den anden halvdel.',
        'Backtracking er en klog udtømmende søgning: den prøver en mulighed, går tilbage ved en blindgyde og prøver den næste, som `searchMaze` med fire retninger; ydelsen er generelt dårlig, men pruning kan fjerne mange muligheder tidligt.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture12_Algorithm_Design_Techniques.md'), original: 'Lecture12.pdf', pages: 's. 2–15' },
        { path: k('data/Data Structures and Algorithm Analysis in C++.pdf'), original: BOOK, pages: 's. 449–450', note: '10.1 Greedy Algorithms (indledning og coin changing) — kun i hele bogen, ikke i bogudsnittene' },
        { path: k('data/Data Structures and Algorithm Analysis in C++.pdf'), original: BOOK, pages: 's. 467–469', note: '10.2 Divide and Conquer og sætning 10.6' },
        { path: k('data/Data Structures and Algorithm Analysis in C++.pdf'), original: BOOK, pages: 's. 506', note: '10.5 Backtracking Algorithms (indledning, pruning)' },
        { path: k('data/Data Structures and Algorithm Analysis in C++.pdf'), original: BOOK, pages: 's. 68', note: 'Binær søgning er O(log N)' },
      ],
      gaps: [
        'Slidenumre: `Lecture12.pdf` har en skjult/fjernet side efter s. 9, så sidefoden er én højere end PDF-siden fra s. 10 (PDF s. 10 = “11”, s. 11 = “12”, s. 12 = “13”, s. 13 = “14”). Her bruges PDF-sidetal. Markdown-konverteringen henviser til “slide 12” for animationen (= PDF s. 11).',
        '`searchMaze` på slidet (s. 12) initialiserer ikke `bool foundExit`. Er første `validMove` (op) falsk, læses en uinitialiseret værdi i `!foundExit`; `g++ -Wall -O2` advarer `-Wmaybe-uninitialized`. `validMove`, `ROWS` og `COLS` vises ikke (koden starter ved linje 36).',
        'Refleksionsopgaverne henviser til `example_greedy-merged.pdf` og `example_backtracking_exhaustive-merged.pdf`, som ikke findes i materialet.',
        'Markdown-konverteringen tilføjer ting, der ikke står i `Lecture12.pdf`: en matematisk formulering af coin changing, en tabel med MergeSort/QuickSort-kompleksiteter, Master Theorem, O(4ⁿ) for labyrinten, samt pseudokode og C++ (`coinChangeExhaustive`) til refleksionsopgave 2. Brug dem som løsningsforslag, ikke som kilde.',
        'Kompleksitet angives ikke for greedy coin changing eller backtracking i slides eller bog; bogens sætning 10.6 (divide and conquer) er ikke med på slides.',
        'Bogens 10.1–10.2 og 10.5 findes kun i hele bog-PDF’en, ikke i kursets bogudsnit (`context/book/`), så det er uklart om de er pensum. Bogens egne greedy-eksempler (scheduling, Huffman, bin packing) og backtracking-eksempler (turnpike, spiltræer) er ikke på slides — ikke dækket af pensum.',
      ],
      keywords: ['ADS', 'AOD', 'SW2ADS', 'greedy', 'grådig', 'grådige algoritmer', 'divide and conquer', 'del og hersk', 'backtracking', 'tilbagesporing', 'exhaustive search', 'udtømmende søgning', 'coin changing', 'møntbytte', 'reduction', 'reduktion', 'binarySearch', 'searchMaze', 'maze', 'labyrint', 'pruning', 'local optimum', 'global optimum', 'wish fairy', 'reuse', 'decompose', 'algorithm design techniques'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'dynamisk-programmering',
      title: 'Dynamisk programmering',
      week: 'Lektion 13',
      definition:
        '**Dynamisk programmering** (DP) løser et optimeringsproblem, hvis naive rekursion løser de samme delproblemer igen og igen, ved at gemme hvert delresultat i en tabel, så det kun beregnes én gang. Det kræver **overlappende delproblemer** og **optimal substruktur** (L13 s. 4). Kurset viser det på Fibonacci og på **rod cutting**, hvor en eksponentiel rekursion bliver til Θ(n²) — enten top-down med memoization eller bottom-up med en dobbelt løkke.',
      concepts: [
        {
          term: 'Hvorfor naiv rekursion er for langsom',
          body: [
            'Naive rekursive løsninger kan dele problemet op i de **samme delproblemer** og løse dem mange gange efter hinanden, især ved optimeringsproblemer (L13 s. 3).',
            'Bogen siger, at compileren ofte “will not do justice to the recursive algorithm”. Så må vi hjælpe ved at skrive den rekursive algoritme om til en ikke-rekursiv, der “systematically records the answers to the subproblems in a table” — det er dynamisk programmering (Weiss s. 482).',
            'Bogens afslutning: DP er “essentially the divide-and-conquer paradigm of solving simpler problems first”, men de simplere problemer er ikke en ren opdeling af det oprindelige; fordi de løses igen og igen, skal svarene gemmes i en tabel (Weiss s. 494). Se [[designteknikker|divide and conquer]].',
          ],
        },
        {
          term: 'To krav og fem trin',
          body: [
            'De to krav for at DP giver en optimal løsning effektivt (L13 s. 4): 1) **Overlapping subproblems** — rekursive kald løser de samme delproblemer; 2) **Optimal substructure** — optimale løsninger bygges af optimale løsninger på delproblemer.',
            'Strategien (L13 s. 5): 1) karakterisér strukturen af en optimal løsning; 2) definér værdien af en optimal løsning rekursivt; 3) brug memoization til at gemme delløsninger i en tabel; 4) beregn værdien ud fra de optimale delløsninger; 5) byg selve løsningen ud fra, hvordan tabellen udviklede sig. Vigtigt: “the total number of subproblems must be small”.',
          ],
        },
        {
          term: 'Fibonacci: tabel i stedet for rekursion',
          body: [
            'Den rekursive `fib` (top på L13 s. 6) er eksponentiel og beregner de samme delresultater mange gange. Bogen: køretiden opfylder `T(N) ≥ T(N−1) + T(N−2)` — samme rekurrens som Fibonacci-tallene — og vokser derfor lige så hurtigt som dem (Weiss s. 483). Figur 10.42 viser kaldtræet for F6; F(N−3) beregnes 3 gange, F(N−4) 5 gange, F(N−5) 8 gange (s. 484).',
            'Den iterative `fibonacci` (bunden på s. 6) gemmer kun de to seneste værdier, `last` og `nextToLast`, fordi F(N) kun behøver F(N−1) og F(N−2). Den er lineær, O(N) (L13 s. 6; Weiss s. 483). Slidet kalder variablerne “a table”.',
            'Bemærk at kursets `fib` sætter F(0) = F(1) = 1, så `fib(40)` = 165580141.',
          ],
        },
        {
          term: 'Rod cutting: problemet',
          body: [
            'WeCut Enterprises køber lange stålstænger, skærer dem (gratis) og sælger stykkerne. **Rod-cutting problem**: givet en stang af længde `n` tommer og en pristabel `p_i` for `i = 1…n`, find den maksimale indtægt `r_n` (L13 s. 7).',
            'Slidets pristabel: længde 1–10 koster **1, 5, 8, 9, 10, 17, 17, 20, 24, 30**. De otte måder at skære en 4-tommers stang på (a–h) giver 9, 1+8, 5+5, 8+1, 1+1+5, 1+5+1, 5+1+1 og 1+1+1+1. Det bedste er (c), to stykker af 2: 5 + 5 = 10 (L13 s. 7).',
            'Naivt kan man generere alle konfigurationer, men en stang af længde `n` kan skæres på **2ⁿ⁻¹** måder, fordi der er `n − 1` steder, hvor man kan skære eller lade være — eksponentielt (L13 s. 9).',
          ],
        },
        {
          term: 'Rekurrensen og rekursionstræet',
          body: [
            'I stedet ser vi en opdeling som et **første stykke** af længde `i` skåret af venstre ende plus en **rest** af længde `n − i`: `r_n = max(p_i + r_{n−i})` for `1 ≤ i ≤ n`, med `r_0 = 0`. Det er optimal substruktur og overlappende delproblemer på én gang (L13 s. 9).',
            'Rekursionstræet for `n = 4` (s. 9): roden 4 har børnene 3, 2, 1, 0; knuden 3 har 2, 1, 0; hver 2 har 1, 0; hver 1 har 0. En kant fra `s` til `t` betyder, at der skæres et stykke af længde `s − t`, og at delproblemet har størrelse `t`. Træet har 16 knuder, og delproblemet 2 løses to gange, 1 fire gange og 0 otte gange.',
            'Refleksion (L13 s. 8): skitsér en greedy algoritme og find et modeksempel. Med slidets priser er pris pr. tomme for længde 1–4: 1; 2,5; 2,67; 2,25. En greedy, der skærer stykket med højest pris pr. tomme af først, tager 3 og så 1 = 8 + 1 = **9**, men optimum er 2 + 2 = **10**. (Strategien er et løsningsforslag fra markdown-konverteringen; tallene er slidets.)',
          ],
        },
        {
          term: 'Top-down: naiv og memoized',
          body: [
            '`CUT-ROD(p, n)` (top på L13 s. 10) oversætter rekurrensen direkte: `n == 0` giver 0, ellers `q = max(q, p[i] + CUT-ROD(p, n − i))` for `i = 1…n`. Den er ineffektiv på grund af de dublerede kald.',
            '`MEMOIZED-CUT-ROD` (bunden på s. 10) opretter `r[0..n]` fyldt med `−∞` og kalder `MEMOIZED-CUT-ROD-AUX`, der først tjekker `if r[n] ≥ 0 return r[n]`. Ellers beregnes `q` som før, gemmes i `r[n]` og returneres. Senere kald genbruger de gemte resultater.',
            'Køretid **Θ(n²)**: hvert delproblem løses præcis én gang, og delproblemet af størrelse `i` kører `i` iterationer af for-løkken; summen over alle delproblemer er en aritmetisk række (L13 s. 10).',
          ],
        },
        {
          term: 'Bottom-up og rekonstruktion',
          body: [
            '`BOTTOM-UP-CUT-ROD` (L13 s. 11) løser de små stænger først, fordi de skal bruges til de store: `r[0] = 0`; for `j = 1…n` sættes `q = −∞`, og for `i = 1…j` tages `q = max(q, p[i] + r[j − i])`; til sidst `r[j] = q`. Tabellen `r` er stadig memoization. Bottom-up er ofte enklere at skrive og har mindre overhead, fordi der ingen kaldstak er, “but it’s harder to understand”. Køretid Θ(n²) på grund af den dobbelte løkke.',
            '`EXTENDED-BOTTOM-UP-CUT-ROD` (L13 s. 12) gemmer også `s[j] = i`, længden af det første stykke i den bedste løsning for en stang af længde `j`. Slidets tabel for `i = 0…10`: `r` = 0, 1, 5, 8, 10, 13, 17, 18, 22, 25, 30 og `s` = –, 1, 2, 3, 2, 2, 6, 1, 2, 3, 10.',
            'Løsningen læses ved at følge `s` baglæns: for `n = 9` er `s[9] = 3`, så rest 6, og `s[6] = 6` → stykkerne 3 + 6 = 8 + 17 = 25. For `n = 7`: `s[7] = 1`, rest 6 → 1 + 6 = 1 + 17 = 18. For `n = 10`: `s[10] = 10`, ingen snit, 30.',
          ],
        },
        {
          term: 'Bogens øvrige DP-eksempler og all-pairs shortest path',
          body: [
            'Bogen (10.3) bruger ikke rod cutting. Den viser Fibonacci og evaluering af quicksort-rekurrensen `C(N)` med en tabel (O(N²), s. 484–485), ordning af matrixmultiplikationer (10.3.2, s. 485–487) og optimale binære søgetræer (10.3.3, s. 487–491, O(N³)).',
            'Sidste eksempel er **all-pairs shortest path** (10.3.4, s. 491–494), som kurset lægger i uge 11 sammen med [[mst|MST]]; ugens video hedder “All Pairs Shortest Path (Floyd-Warshall) — Dynamic Programming”. `D(k,i,j)` er længden af korteste vej fra `v_i` til `v_j`, der kun bruger `v_1…v_k` som mellemknuder, og `D(k,i,j) = min{D(k−1,i,j), D(k−1,i,k) + D(k−1,k,j)}` (s. 492). Køretid O(|V|³) — ikke asymptotisk bedre end |V| gange [[dijkstra|Dijkstra]], men hurtig på tætte grafer, og den tåler negative kanter uden negative cykler (s. 491–492).',
          ],
        },
      ],
      viz: 'doa-rod-cutting',
      keyPoints: [
        'DP kræver overlappende delproblemer og optimal substruktur; antallet af delproblemer skal være lille.',
        'Memoization (top-down) gemmer resultatet af rekursive kald; bottom-up fylder tabellen fra de mindste delproblemer.',
        'Rod cutting: `r_n = max(p_i + r_{n−i})`, `r_0 = 0`; slidets priser 1, 5, 8, 9, 10, 17, 17, 20, 24, 30.',
        '`r[4] = 10` (2 + 2), `r[10] = 30` (ingen snit); `s[j]` gemmer første stykke, så løsningen kan rekonstrueres.',
        'Greedy efter pris pr. tomme giver 9 for n = 4, optimum er 10.',
        'Kompleksitet (L13 s. 6; Weiss s. 483): `fib` rekursiv eksponentiel (bedste/gennemsnit/værste ikke skelnet) · `fibonacci` iterativ O(n) · plads: to variable.',
        'Kompleksitet (L13 s. 9–10): naiv rod cutting 2ⁿ⁻¹ mulige opdelinger, eksponentiel · `CUT-ROD` præcis Big-O ikke angivet · plads ikke angivet.',
        'Kompleksitet (L13 s. 10–11): `MEMOIZED-CUT-ROD` Θ(n²) · `BOTTOM-UP-CUT-ROD` Θ(n²) · bedste/gennemsnit ikke skelnet · plads: tabellen `r[0..n]` (+ `s[1..n]`), Big-O ikke angivet.',
        'Kompleksitet (Weiss s. 492): all-pairs shortest path O(|V|³) · plads én |V|×|V|-matrix `d` (+ `path`), s. 493.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Fibonacci: eksponentiel rekursion vs. lineær tabel',
          source: 'Fig10_40.cpp (kildekode_part8.md); Lecture13.pdf s. 6; Weiss s. 483, fig. 10.40–10.41',
          code: `#include <iostream>
using namespace std;

/**
 * Compute Fibonacci numbers as described in Chapter 1.
 */
long long fib( int n )
{
    if( n <= 1 )
        return 1;
    else
        return fib( n - 1 ) + fib( n - 2 );
}

/**
 * Compute Fibonacci numbers as described in Chapter 1.
 */
long long fibonacci( int n )
{
    if( n <= 1 )
        return 1;

    long long last = 1;
    long long nextToLast = 1;
    long long answer = 1;

    for( int i = 2; i <= n; ++i )
    {
        answer = last + nextToLast;
        nextToLast = last;
        last = answer;
    }
    return answer;
}

int main( )
{
    cout << "fib( 40 ) = " << fib( 40 ) << endl;
    cout << "fibonacci( 40 ) = " << fibonacci( 40 ) << endl;
    return 0;
}`,
        },
        {
          lang: 'text',
          title: 'Rod cutting: naiv, memoized og bottom-up med rekonstruktion (pseudokode)',
          source: 'Lecture13.pdf s. 10–12',
          code: `CUT-ROD(p, n)
1  if n == 0
2      return 0
3  q = −∞
4  for i = 1 to n
5      q = max(q, p[i] + CUT-ROD(p, n − i))
6  return q

MEMOIZED-CUT-ROD(p, n)
1  let r[0..n] be a new array
2  for i = 0 to n
3      r[i] = −∞
4  return MEMOIZED-CUT-ROD-AUX(p, n, r)

MEMOIZED-CUT-ROD-AUX(p, n, r)
1  if r[n] ≥ 0
2      return r[n]
3  if n == 0
4      q = 0
5  else q = −∞
6      for i = 1 to n
7          q = max(q, p[i] + MEMOIZED-CUT-ROD-AUX(p, n − i, r))
8  r[n] = q
9  return q

EXTENDED-BOTTOM-UP-CUT-ROD(p, n)
1   let r[0..n] and s[1..n] be new arrays
2   r[0] = 0
3   for j = 1 to n
4       q = −∞
5       for i = 1 to j
6           if q < p[i] + r[j − i]
7               q = p[i] + r[j − i]
8               s[j] = i
9       r[j] = q
10  return r and s`,
        },
        {
          lang: 'cpp',
          title: 'Extended bottom-up i C++ (fra markdown-appendix; ikke i PDF’en)',
          source: 'SW2ADS_Lecture13_DynamicProgramming.md, appendix — oversættelse af Lecture13.pdf s. 12',
          code: `#include <iostream>
#include <vector>
#include <climits>
using namespace std;

// Extended bottom-up with solution reconstruction - O(n^2)
pair<vector<int>, vector<int>> extendedBottomUpCutRod(const vector<int>& prices, int n) {
    vector<int> r(n + 1);  // Maximum revenue
    vector<int> s(n + 1);  // First piece to cut
    r[0] = 0;
    for (int j = 1; j <= n; j++) {
        int q = INT_MIN;
        for (int i = 1; i <= j; i++) {
            if (q < prices[i] + r[j - i]) {
                q = prices[i] + r[j - i];
                s[j] = i;  // Record optimal first cut
            }
        }
        r[j] = q;
    }
    return {r, s};
}

// Print the optimal solution
void printCutRodSolution(const vector<int>& prices, int n) {
    auto [r, s] = extendedBottomUpCutRod(prices, n);
    cout << "Maximum revenue for rod of length " << n << ": " << r[n] << endl;
    cout << "Optimal cuts: ";
    while (n > 0) {
        cout << s[n];
        n = n - s[n];
        if (n > 0) cout << " + ";
    }
    cout << endl;
}

int main() {
    // Price table: index is length, value is price
    // prices[0] is unused (no rod of length 0)
    vector<int> prices = {0, 1, 5, 8, 9, 10, 17, 17, 20, 24, 30};
    printCutRodSolution(prices, 9);   // 25: 3 + 6
    printCutRodSolution(prices, 10);  // 30: 10
    return 0;
}`,
        },
      ],
      exam: [
        'DP virker, når naiv rekursion løser de samme delproblemer igen (overlappende delproblemer), og når den optimale løsning er bygget af optimale delløsninger (optimal substruktur); så gemmer man hvert delresultat i en tabel og beregner det kun én gang.',
        'Sådan fylder du rod-cutting-tabellen i hånden (opgavetype fra L13 s. 11–12 og refleksionen s. 13, udledt af øvelserne, ikke af eksamenssæt): 1) skriv `p_1…p_n` og sæt `r[0] = 0`; 2) for `j = 1…n` beregn `p[i] + r[j − i]` for alle `i = 1…j` og skriv maksimum i `r[j]` og det vindende `i` i `s[j]`; 3) aflæs `r[n]`; 4) rekonstruér ved at trække `s[n]` fra `n` og gentage, fx `n = 9`: 3, så 6 → 25.',
        'Sådan memoiserer du en rekursiv løsning (opgavetype fra refleksionen L13 s. 13, coin changing): 1) find den rekursive formel (min over mønter af 1 + løsningen for `beløb − c`); 2) opret en tabel over alle delbeløb `0…n`, fyldt med “ukendt”; 3) slå op først i hvert kald og gem resultatet før retur; 4) lav den bottom-up ved at fylde tabellen fra beløb 0 og op. Tæl delproblemer × arbejde pr. delproblem for køretiden.',
        'Memoization og bottom-up giver begge Θ(n²) for rod cutting: n + 1 delproblemer, og delproblem `j` har `j` valg. Bottom-up har ingen kaldstak og mindre overhead, men er sværere at læse.',
        'Greedy duer ikke til rod cutting: skærer man efter højeste pris pr. tomme, giver n = 4 stykkerne 3 + 1 = 9, mens DP finder 2 + 2 = 10.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture13_DynamicProgramming.md'), original: 'Lecture13.pdf', pages: 's. 2–14' },
        { path: k('context/book/AOD_Ch10.3_Dynamic_Programming.md'), original: BOOK, pages: 's. 482–494', note: '10.3 Dynamic Programming (10.3.1 tabel i stedet for rekursion, 10.3.4 all-pairs shortest path)' },
        { path: k('context/book/AOD_Ch09.5_10.3.4_Week_11_MST.md'), original: BOOK, pages: 's. 491–494', note: '10.3.4 All-pairs shortest path, læst i uge 11' },
        { path: k('context/kode/kildekode_part8.md'), note: 'Fig10_40.cpp (Fibonacci), Fig10_53.cpp (allPairs)' },
        { path: k('context/videos/SW2ADS_Video_Week11_MST_APSP.md'), note: 'Video: All Pairs Shortest Path (Floyd-Warshall) — Dynamic Programming' },
        { path: k('context/lessons/SW2ADS_Lecture12_Algorithm_Design_Techniques.md'), original: 'Lecture12.pdf', pages: 's. 13', note: 'Coin changing med backtracking, som L13 s. 13 memoiserer' },
      ],
      gaps: [
        'Slide 7 skriver “r2 = p2 + p2 = 5 + 5 = 10” om 4-tommers stangen; det skal være `r4`.',
        '`fibonacci` på L13 s. 6 (og bogens fig. 10.41, s. 483) har linjen `long long last nextToLast = 1;`, som ikke kompilerer. Kursets `Fig10_40.cpp` har den rettede `long long nextToLast = 1;`; markdown-konverteringerne har rettet det uden at nævne det.',
        'Rod cutting og pseudokoden (`CUT-ROD`, `MEMOIZED-CUT-ROD`, `BOTTOM-UP-CUT-ROD`) er ikke fra Weiss; slidene angiver ingen kilde. Markdown-konverteringen påstår CLRS kap. 14 — det kan ikke tjekkes i materialet. Weiss 10.3 har ikke rod cutting.',
        'Markdown-konverteringen beskriver rekursionstræet forkert (“Node 3 branches to 2, 1, 0, 0”); billedet på L13 s. 9 viser 3 → 2, 1, 0.',
        'Markdown-konverteringen tilføjer ting, der ikke står i `Lecture13.pdf`: løsninger til alle tre refleksionsopgaver (greedy efter pris pr. tomme, memoized/bottom-up coin change, A* med `h(v) = ⌈v / d_max⌉`), et definitionsafsnit, O(2ⁿ) for naiv rekursion og et C++-appendix. Brug dem som løsningsforslag, ikke som kilde.',
        'Slides angiver ikke køretiden for den naive `CUT-ROD` som Big-O (kun 2ⁿ⁻¹ opdelinger og “inefficient”), og ingen pladskompleksitet for DP-tabellerne.',
        'L13 s. 6 henviser til `fibonacci_recursive-merged.pdf`, `fibonacci_memoization.pdf` og `fibonacci_dynamic.pdf`, som ikke findes i materialet.',
        'Refleksion L13 s. 14 (coin changing med [[a-stjerne|A*]]: knuder, kanter, omkostninger, heuristik) har intet facit i slides.',
        'All-pairs shortest path: `Lecture11.pdf` har kun punktet på agendaen (s. 23) og spørgsmålet “Which method from the course is useful for mapping all-to-all connections?” (s. 3); selve APSP-slidene er ikke i PDF’en. Stoffet findes i bogens 10.3.4 og ugevideoen.',
      ],
      keywords: ['dynamic programming', 'DP', 'dynamisk programmering', 'memoization', 'memoisering', 'tabulation', 'bottom-up', 'top-down', 'overlapping subproblems', 'overlappende delproblemer', 'optimal substructure', 'optimal substruktur', 'rod cutting', 'stangskæring', 'CUT-ROD', 'MEMOIZED-CUT-ROD', 'BOTTOM-UP-CUT-ROD', 'EXTENDED-BOTTOM-UP-CUT-ROD', 'Fibonacci', 'fib', 'fibonacci', 'coin changing', 'all-pairs shortest path', 'APSP', 'Floyd-Warshall', 'allPairs', 'rekonstruktion'],
    },
  ],
}
