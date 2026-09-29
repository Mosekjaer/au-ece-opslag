import type { Part } from '../types'
import { k, BOOK } from './paths'

/* Slidenumre er PDF-sidenumre (pdftotext -f N). Tallet i slidets hjørne er et andet,
   fordi skjulte slides er sprunget over i PDF'en (fx er Lecture05 s. 10 trykt som “12”). */

export const sortering: Part = {
  id: 'sortering',
  title: 'Rekursion og sortering',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'rekursion',
      title: 'Rekursion',
      week: 'Lektion 5',
      definition:
        '**Rekursion** er en problemløsningsteknik, hvor et problem løses ved at løse én eller flere mindre udgaver af samme problem. En funktion er rekursiv, hvis den kalder sig selv direkte eller indirekte; en datastruktur er rekursiv, hvis den har felter af sin egen type, fx en linked list eller et træ (L05 s. 2). Hver rekursiv funktion har mindst ét **base case**, der løses uden rekursion, og et **rekursivt tilfælde**, der bevæger sig mod det.',
      intro: [
        'Lektion 5 bygger emnet op i fire trin: hvordan et rekursivt kald folder sig ud på kaldstakken, hvordan induktion beviser at det virker, en fast *recursion recipe* til at skrive funktionerne, og hvad det koster, når rekursionen gentager arbejde (Fibonacci). Samme tankegang bærer [[merge-sort|merge sort]] og [[quicksort|quicksort]] i lektion 6.',
      ],
      concepts: [
        {
          term: 'Base case og rekursivt tilfælde',
          body: [
            'Slidets første eksempel er `f(x)`, som returnerer `0` for `x == 0` (base case) og ellers `x + f(x - 1)` (rekursivt tilfælde). Udfoldningen af `f(4)` er `4 + f(3)` → `4 + 3 + f(2)` → `4 + 3 + 2 + f(1)` → `4 + 3 + 2 + 1 + f(0)` → `10` (L05 s. 3).',
            'Bogen formulerer de samme krav som de to første af sine fire regler: **Base cases** (“You must always have some base cases, which can be solved without recursion”) og **Making progress** (hvert rekursivt kald skal gå mod et base case). Modeksemplet er `bad(n)`, der kalder `bad(n / 3 + 1)`: `bad(1)` kalder `bad(1)` igen, så funktionen virker kun for `n = 0` (Weiss s. 9, figur 1.3).',
          ],
        },
        {
          term: 'Kaldstakken',
          body: [
            'Hvert funktionskald lægger en **activation frame** (stack frame) på stakken (L05 s. 4). For `f(4)` ligger der fem frames, `x = 4` nederst og `x = 0` øverst. `f(0)` returnerer `0`, og resultaterne løber tilbage op: `1`, `3`, `6`, `10`. Slidets gdb-udskrift (`bt`) af `f(10)` viser frames `#0 f (x=0)` til `#10 f (x=10)` og `#11 main ()`.',
            'Bogen kalder det en **activation record** eller stack frame: registre, returadresse og lokale variable gemmes ved hvert kald og hentes igen ved `return` (Weiss s. 111). Det er den samme stak, som ligger i processens adresserum (se [[sys/processer|processer i SYS]]); stakken som datastruktur står under [[stakke-koeer|stakke og køer]].',
          ],
        },
        {
          term: 'Fordele og ulemper',
          body: [
            'Rekursive funktioner koster ekstra overhead pr. funktionskald og kan give **stack overflow**; iterative funktioner kan være mere effektive. For summen `1 + 2 + … + N` er formlen `N(N+1)/2` (Weiss s. 5) O(1), mens både løkke og rekursion er O(n) (L05 s. 5).',
            'Slidets modvægt: “For proper cases, recursion provides cleaner, simpler solutions which are less error prone than iterative ones” (L05 s. 5). Bogen siger det samme, men advarer mod at bruge rekursion som erstatning for en simpel `for`-løkke (Weiss s. 11).',
          ],
        },
        {
          term: 'Induktion og recursion recipe',
          body: [
            'Rekursion hænger sammen med **bevis ved induktion** (L05 s. 6): *base case* (vis at sætningen gælder for N = 1), *induktionshypotese* (antag at den gælder for N = k) og *induktionsskridt* (vis at den så gælder for N = k + 1). Slidet beviser `Σ i = N(N+1)/2`: `k(k+1)/2 + (k+1) = (k+1)(k+2)/2` (L05 s. 7).',
            'Beviset oversættes direkte til kode (L05 s. 8): `sum_naturals_rec(n)` returnerer `1` for `n == 1` og ellers `n + sum_naturals_rec(n-1)`. Wrapperen `sum_naturals(n)` fanger `n < 0` (returnerer `-1`) og `n == 0` (returnerer `0`), så rekursionen altid starter på et gyldigt input.',
            '**Recursion recipe** (L05 s. 9): 1) formulér problemet ud fra dets størrelse; 2) find base case og løs det uden rekursion; 3) find det rekursive tilfælde ud fra induktionshypotesen (“recursive leap of faith”); 4) vis at det rekursive tilfælde gør fremskridt og til sidst når base case. Videoen fra uge 5 kører opskriften på `sum(arr, n)`: base case `n ≤ 0` giver `0`, ellers `arr[0] + sum(arr + 1, n - 1)`, og da `n` falder med 1 pr. kald, terminerer den. Bogens **design rule** siger det samme som trin 3: “Assume that all the recursive calls work” (Weiss s. 11).',
          ],
        },
        {
          term: 'Hale-rekursion',
          body: [
            'En funktion er **tail recursive**, når dens sidste operation er det rekursive kald (L05 s. 10). `sum(ar, size)` skal lægge `ar[0]` til, *efter* kaldet returnerer, så stakken bygges op og `+` udføres under afviklingen. `sumTail(ar, size, sum)` bærer delsummen med som parameter og har intet tilbage at gøre, når base case nås.',
            'Slidet: hale-rekursion “can be optimized away by executing call in current stack frame and returning its result rather than creating a new stack frame”. Bogen er skarpere: hale-rekursion er “an extremely bad use of recursion”, fordi den mekanisk kan erstattes af en `while`-løkke med én tildeling pr. parameter. Nogle compilere gør det selv, “Even so, it is best not to find out that yours does not” (Weiss s. 112, figur 3.25–3.26, kursets `TailRecursion.cpp`).',
          ],
        },
        {
          term: 'Duplikeret arbejde: Fibonacci',
          body: [
            'Fibonacci er defineret ved `F0 = 0`, `F1 = 1`, `Fn = Fn−1 + Fn−2` (L05 s. 11). Den direkte rekursive `fib(n)` regner de samme delresultater igen og igen: `fib(6)` kalder `fib(5)` og `fib(4)`, men `fib(5)` kalder også `fib(4)`, og `fib(3)` beregnes i begge grene. Slidet angiver tidskompleksiteten O(2ⁿ) og stiller refleksionsspørgsmålet “Why is the time complexity of the fib function O(2ⁿ)?” (L05 s. 12).',
            'Svaret ligger i **rekursionstræet**: hvert ikke-base-kald laver to nye kald, og træet er op til n niveauer dybt, så antallet af kald er højst ca. 2ⁿ. Bogen giver rekurrensen `T(N) = T(N − 1) + T(N − 2) + 2` og viser, at `T(N) ≥ fib(N) ≥ (3/2)ᴺ` for N > 4, så køretiden vokser eksponentielt (Weiss s. 59–60). Den kalder fejlen et brud på sin fjerde regel, **compound interest rule**: “Never duplicate work by solving the same instance of a problem in separate recursive calls” (Weiss s. 11).',
            'Løsningen på slidet er hale-rekursiv: `fibTail(n, a, b)` bærer de to seneste tal med og kalder `fibTail(n - 1, b, a + b)`; `Fn = fibTail(n, 0, 1)` og tiden er O(n) (L05 s. 13). Bogen løser det i stedet med en `for`-løkke (Weiss s. 60). At gemme delresultater i en tabel er idéen bag [[dynamisk-programmering|dynamisk programmering]].',
          ],
        },
        {
          term: 'Rekurrensligninger',
          body: [
            'Lektion 5’s slides indeholder ingen rekurrensligninger; kompleksiteterne O(n), O(2ⁿ) og O(n) angives direkte. Rekurrenserne står i bogen: `T(N) = T(N − 1) + T(N − 2) + 2` for Fibonacci (Weiss s. 60), `T(1) = 1`, `T(N) = 2T(N/2) + N` for mergesort, løst ved teleskopering til `N log N + N` (Weiss s. 307–309), og `T(N) = T(N − 1) + cN` / `T(N) = 2T(N/2) + cN` for quicksorts værste og bedste tilfælde (Weiss s. 318–319). Se [[merge-sort|merge sort]] og [[quicksort|quicksort]].',
            'Lektion 12 minder om, at “complexity of recursive algorithms is typically obtained by solving a recurrence relation” (L12 s. 10), men viser ingen løsningsmetode. Se [[designteknikker|divide and conquer]].',
          ],
        },
        {
          term: 'Rekursive datastrukturer',
          body: [
            'Mange datastrukturer er rekursive og giver rekursive implementeringer af fx søgning og sortering (L05 s. 14). En liste er “a node followed by a list”: `struct Node { int value; Node *next; };`, tegnet som `12 → 25 → 3 → 9`. Et binært træ er “a node with left and right sub trees”: roden `9` med undertræerne `5` (børn `1`, `2`) og `8` (børn `3`, `7`). Se [[lister|linked lists]] og [[bst|binære søgetræer]].',
          ],
        },
      ],
      viz: 'doa-fib-tree',
      keyPoints: [
        'Rekursion = base case (løses direkte) + rekursivt tilfælde, der gør fremskridt mod base case.',
        'Hvert kald lægger en stack frame på kaldstakken; for dyb rekursion giver stack overflow.',
        'Induktion og rekursion er to sider af samme sag: base case ↔ base case, induktionsskridt ↔ rekursivt tilfælde.',
        'Recursion recipe: størrelse → base case → rekursivt tilfælde (leap of faith) → vis terminering.',
        'Hale-rekursion: det rekursive kald er sidste operation og kan erstattes af en løkke.',
        'Naiv `fib` gentager delproblemer (bogens compound interest rule); rekursionstræet vokser eksponentielt.',
        'Kompleksitet (L05 s. 5): `f(x)`/rekursiv sum bedste O(n) · gennemsnit O(n) · værste O(n) · plads ikke angivet (s. 4 viser én stack frame pr. aktivt kald); formlen `N(N+1)/2` er O(1).',
        'Kompleksitet (L05 s. 11; Weiss s. 60): rekursiv `fib` bedste ikke angivet · gennemsnit ikke angivet · værste O(2ⁿ) (bogen: vokser mindst som (3/2)ᴺ) · plads ikke angivet.',
        'Kompleksitet (L05 s. 13): `fibTail` bedste ikke angivet · gennemsnit ikke angivet · tid O(n) · plads ikke angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Base case og rekursivt tilfælde',
          source: 'Lecture05.pdf s. 3',
          code: `#include <iostream>
#include <stdio.h>

int f(int x)
{
    if (x == 0)
        return 0;             // base case
    else
        return x + f(x - 1);  // recursive case
}

int main()
{
    unsigned int i;

    while (true) {
        std::cin >> i;
        printf("f(%d)=%d\\n", i, f(i));
    }
}`,
        },
        {
          lang: 'cpp',
          title: 'Rekursiv og hale-rekursiv sum af et array',
          source: 'Lecture05.pdf s. 10',
          code: `int sum(int *ar, int size)
{
        int temp = 0;

        if (size == 0)
                return 0;

        temp = ar[0] + sum(ar + 1, size - 1);
        return temp;
}

int sumTail(int *ar, int size, int sum)
{
        if (size == 0)
                return sum;

        return sumTail(ar + 1, size - 1, sum + ar[0]);
}`,
        },
        {
          lang: 'cpp',
          title: 'Fibonacci: O(2ⁿ) og hale-rekursiv O(n)',
          source: 'Lecture05.pdf s. 11 og s. 13',
          code: `unsigned int fib(unsigned int n)
{
        if (n == 0 || n == 1)
                return n;
        else
                return fib(n - 1) + fib(n - 2);
}

// F(n) = fibTail(n, 0, 1)
unsigned int fibTail(unsigned int n, int a, int b)
{
        if (n == 0)
                return a;
        if (n == 1)
                return b;

        return fibTail(n - 1, b, a + b);
}`,
        },
      ],
      exam: [
        'En rekursiv funktion løser et problem ved at kalde sig selv på en mindre udgave af det. Den skal have et base case, der løses uden rekursion, og hvert rekursivt kald skal bevæge sig mod det — ellers kører den, til stakken løber fuld.',
        'Sådan løser du “skriv en rekursiv funktion til X” (opgavetype fra recursion recipe, L05 s. 9, og videoen fra uge 5 — udledt af øvelserne, ikke af eksamenssæt): 1) skriv problemet op ud fra dets størrelse n; 2) find base case og dets svar (fx `n ≤ 0` → `0`); 3) skriv det rekursive tilfælde som “lille stykke + samme funktion på n − 1” og stol på, at kaldet virker; 4) argumentér for terminering: n falder med 1 pr. kald og rammer base case.',
        'Sådan løser du “hvorfor er fib O(2ⁿ)?” (refleksionsopgaven L05 s. 12): 1) tegn rekursionstræet for fx `fib(6)`; 2) påpeg at hvert ikke-base-kald laver to kald, og at samme delproblem (`fib(4)`, `fib(3)`) optræder flere gange; 3) træet har op til n niveauer, og antallet af kald kan højst fordobles pr. niveau, så det er O(2ⁿ); 4) nævn løsningen: bær de to seneste tal med (`fibTail`, O(n)).',
        'Hale-rekursion betyder, at det rekursive kald er det sidste, funktionen gør. Så skal der ikke gemmes noget til bagefter, og kaldet kan erstattes af en løkke. Bogen kalder netop derfor hale-rekursion en dårlig brug af rekursion, mens slidet fremhæver, at compileren kan optimere den væk.',
        'Rekursion er det rigtige valg, når problemet selv er rekursivt — træer, lister og divide and conquer som merge sort — fordi koden bliver kortere og mindre fejlbehæftet. Er det bare en løkke i forklædning, betaler man for kald-overhead og risikerer stack overflow.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture05_Recursion.md'), original: 'Lecture05.pdf', pages: 's. 2–14' },
        { path: k('context/book/AOD_Ch01-03_Recursion.md'), original: BOOK, pages: 's. 8–12', note: '1.3 A Brief Introduction to Recursion: de fire regler' },
        { path: k('context/book/AOD_Ch01-03_Recursion.md'), original: BOOK, pages: 's. 59–60', note: '2.4.2: fib-analysen og compound interest rule' },
        { path: k('context/book/AOD_Ch01-03_Recursion.md'), original: BOOK, pages: 's. 110–112', note: '3.6.3: activation records og hale-rekursion' },
        { path: k('context/lessons/SW2ADS_Lecture12_Algorithm_Design_Techniques.md'), original: 'Lecture12.pdf', pages: 's. 10', note: 'Rekurrensrelationer nævnt' },
        { path: k('context/kode/kildekode_part10.md'), note: 'TailRecursion.cpp' },
        { path: k('context/kode/kildekode_part8.md'), note: 'Fig01_02.cpp (f), Fig01_03.cpp (bad), Fig01_04.cpp (printOut)' },
        { path: k('context/videos/SW2ADS_Video_Week05_Recursion.md'), original: 'data/video transcripts/week5.txt', note: 'Recursion recipe på sum(arr, n)' },
      ],
      gaps: [
        'Slidet og bogen definerer Fibonacci forskelligt: L05 s. 11 har `F0 = 0` og `fib` returnerer `n` for `n ≤ 1`; Weiss’ `fib` returnerer `1` for `n <= 1` (s. 59). Talfølgen er derfor forskudt én plads.',
        'Slidet angiver O(2ⁿ) for `fib` (L05 s. 11) uden bevis; bogen viser en nedre grænse, (3/2)ᴺ, og en øvre for tallene, `fib(N) < (5/3)ᴺ` (s. 7 og 60). Markdown-konverteringens påstand om, at den præcise vækst er φⁿ ≈ 1,618ⁿ, står ikke i PDF’en eller bogudsnittet.',
        'Slidet (L05 s. 10) præsenterer hale-rekursion positivt (“can be optimized away”); bogen kalder den “an extremely bad use of recursion” og råder til selv at skrive løkken (Weiss s. 112).',
        'Rekurrensligninger er ikke på lektion 5’s slides. De står kun i bogen (2.4.2, 7.6.1, 7.7.5), og L12 s. 10 nævner dem uden metode. Markdown-konverteringen af L12 tilføjer Master Theorem, som ikke står i PDF’en — ikke dækket af pensum.',
        'Slidets udfoldning af `f(4)` har en trykfejl: næstsidste linje er `= 5 + 4 + 3 + 2 + 1 + 0` (L05 s. 3); summen, der står under, er rigtigt `10`.',
        'Pladskompleksitet for rekursion angives ikke som Big-O noget sted i lektion 5; kun at hvert kald bruger en stack frame (s. 4) og kan give stack overflow (s. 5).',
        '`main` på L05 s. 3 læser i en `while (true)` uden at tjekke `std::cin`; ved end-of-input gentager den sidste udskrift uendeligt (kompileret og afprøvet).',
        'Slidenumre: PDF’en har 14 sider, men hjørnenumrene går til 17 (skjulte slides er udeladt). Opslagsværket bruger PDF-sidenummeret.',
      ],
      keywords: ['ADS', 'AOD', 'SW2ADS', 'recursion', 'rekursiv', 'base case', 'basistilfælde', 'recursive case', 'call stack', 'kaldstak', 'stack frame', 'activation record', 'stack overflow', 'induktion', 'induction', 'recursion recipe', 'leap of faith', 'tail recursion', 'hale-rekursion', 'halerekursion', 'fib', 'fibTail', 'Fibonacci', 'sumTail', 'sum_naturals', 'rekursionstræ', 'recursion tree', 'rekurrensligning', 'recurrence relation', 'compound interest rule', 'design rule'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'insertion-sort',
      title: 'Insertion sort',
      week: 'Lektion 6',
      definition:
        '**Insertion sort** sorterer et array i N − 1 gennemløb: i gennemløb `p` er elementerne på plads `0` til `p − 1` allerede sorteret, og elementet på plads `p` flyttes til venstre, til det står rigtigt (Weiss s. 292). Den sorterer på stedet med O(1) ekstra plads, er O(n) på sorteret input og O(n²) i gennemsnit og værste tilfælde.',
      concepts: [
        {
          term: 'Sorteringsproblemet',
          body: [
            'Givet et array `<A0, A1, …, AN−1>` af N elementer: find en permutation `<A′0, A′1, …, A′N−1>`, så `A′0 ≤ A′1 ≤ … ≤ A′N−1` (L06 s. 3). Slidet kalder det et fundamentalt problem med mange kendte algoritmer (“Wikipedia lists > 45”), hvor gennemsnitstilfældet er let at karakterisere (tilfældigt input), og hvor forskellige løsninger viser forskellige designstrategier.',
            'Bogen antager **comparison-based sorting**: ud over tildeling er `<` og `>` de eneste operationer på data (Weiss s. 291). Det er den antagelse, [[sortering-nedre-graense|den nedre grænse]] bygger på.',
          ],
        },
        {
          term: 'Algoritmen',
          body: [
            'Slidet viser det som at sortere spillekort på hånden og kører arrayet `[34, 8, 64, 51, 32, 21]` (L06 s. 5). Efter hvert gennemløb er det grønne præfiks sorteret: `8 34 | 64 51 32 21`, `8 34 64 | 51 32 21`, `8 34 51 64 | 32 21`.',
            'Bogens figur 7.1 kører samme array færdigt og tæller flytninger: `p = 1` flytter 1 (`8 34 64 51 32 21`), `p = 2` flytter 0, `p = 3` flytter 1 (`8 34 51 64 32 21`), `p = 4` flytter 3 (`8 32 34 51 64 21`), `p = 5` flytter 4 (`8 21 32 34 51 64`) (Weiss s. 292).',
          ],
        },
        {
          term: 'Implementeringen trin for trin',
          body: [
            '`insertionSort` (L06 s. 7, samme kode som Weiss figur 7.2 og `Sort.h`) bruger ingen swaps. Den gemmer `a[p]` i `tmp`, skubber alle større elementer én plads til højre med `a[j] = std::move(a[j - 1])` og sætter til sidst `a[j] = std::move(tmp)`.',
            'Slidets sporing af første gennemløb: `p0 = 1`, `tmp0 = 8`. Da `8 < 34`, kopieres `a[0]` til `a[1]`, så arrayet midlertidigt er `34 34 64 51 32 21`. Løkken stopper ved `j1 = 0`, og `a[0] = tmp0 = 8` giver `8 34 64 51 32 21`.',
            'Løkkens **invariant** er bogens formulering: efter gennemløb `p` står elementerne på plads 0 til `p` sorteret (Weiss s. 292). Bogen viser også en STL-version med iteratorer og en `lessThan`-funktor (figur 7.3–7.4, s. 294); se [[pointere-iteratorer|iteratorer]].',
          ],
        },
        {
          term: 'Bedste, gennemsnitlige og værste tilfælde',
          body: [
            'Værste tilfælde: de to løkker kan hver tage N iterationer, så insertion sort er O(N²), og grænsen er stram, fordi omvendt sorteret input rammer den. Den indre test udføres højst `p + 1` gange, i alt `2 + 3 + … + N = Θ(N²)` (Weiss s. 294).',
            'Bedste tilfælde: er input allerede sorteret, fejler den indre test straks, og køretiden er O(N). Næsten sorteret input går også hurtigt. Gennemsnittet er Θ(N²) (Weiss s. 295).',
            'Slidets oversigtstabel (fra bigocheatsheet.com) giver det samme: bedste Ω(n), gennemsnit Θ(n²), værste O(n²), plads O(1) (L06 s. 22).',
          ],
        },
        {
          term: 'Inversioner',
          body: [
            'En **inversion** er et par `(i, j)` med `i < j` men `a[i] > a[j]`. `[34, 8, 64, 51, 32, 21]` har ni: (34, 8), (34, 32), (34, 21), (64, 51), (64, 32), (64, 21), (51, 32), (51, 21) og (32, 21) — præcis det antal flytninger, figur 7.1 tæller (1 + 0 + 1 + 3 + 4). At bytte to naboer, der står forkert, fjerner netop én inversion, så insertion sort kører i O(I + N), hvor I er antallet af inversioner (Weiss s. 295).',
            'Et array af N forskellige elementer har i gennemsnit `N(N − 1)/4` inversioner (Theorem 7.1). Derfor kræver **enhver** algoritme, der kun bytter naboelementer, Ω(N²) tid i gennemsnit (Theorem 7.2, s. 295). Det er grunden til, at slidet siger, at man skal tænke anderledes “to break the quadratic bound” (L06 s. 9) — se [[merge-sort|merge sort]].',
          ],
        },
      ],
      viz: 'doa-insertion-sort',
      keyPoints: [
        'Sorteringsproblemet: find en permutation, så `A′0 ≤ A′1 ≤ … ≤ A′N−1`.',
        'Gennemløb `p = 1 … N − 1`: tag `a[p]` ud i `tmp`, skub større elementer til højre, sæt `tmp` ind.',
        'Invariant: efter gennemløb `p` er `a[0..p]` sorteret.',
        'Ingen swaps, kun `std::move` — flytningerne tælles som “positions moved”.',
        'Antal flytninger = antal inversioner; køretid O(I + N).',
        'Ethvert naboombytnings-sort er Ω(N²) i gennemsnit, fordi et tilfældigt array har N(N − 1)/4 inversioner.',
        'Kompleksitet (L06 s. 22; Weiss s. 294–295): `insertionSort` bedste O(n) · gennemsnit O(n²) · værste O(n²) · plads O(1).',
        'God til små og næsten sorterede arrays — derfor bruger Weiss’ quicksort den under en cutoff på 10 (se [[quicksort|quicksort]]).',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'insertionSort',
          source: 'Lecture06.pdf s. 7 (Insertionsort.h) = Weiss s. 293, fig. 7.2 = Sort.h (kildekode_part6.md)',
          code: `/**
 * Simple insertion sort.
 */
template <typename Comparable>
void insertionSort(vector<Comparable> &a) {
  for (int p = 1; p < a.size(); ++p) {
    Comparable tmp = std::move(a[p]);
    int j;
    for (j = p; j > 0 && tmp < a[j - 1]; --j) {
      a[j] = std::move(a[j - 1]);
    }
    a[j] = std::move(tmp);
  }
}`,
        },
        {
          lang: 'cpp',
          title: 'STL-version med iteratorer og funktor',
          source: 'Weiss s. 294, fig. 7.3–7.4',
          code: `template <typename Iterator, typename Comparator>
void insertionSort( const Iterator & begin, const Iterator & end,
                    Comparator lessThan )
{
    if( begin == end )
        return;

    Iterator j;

    for( Iterator p = begin+1; p != end; ++p )
    {
        auto tmp = std::move( *p );
        for( j = p; j != begin && lessThan( tmp, *( j-1 ) ); --j )
            *j = std::move( *(j-1) );
        *j = std::move( tmp );
    }
}

/*
 * The two-parameter version calls the three-parameter version,
 * using C++11 decltype
 */
template <typename Iterator>
void insertionSort( const Iterator & begin, const Iterator & end )
{
    insertionSort( begin, end, less<decltype(*begin)>{ } );
}`,
        },
      ],
      exam: [
        'Insertion sort holder en sorteret venstre del og indsætter ét nyt element ad gangen ved at skubbe de større én plads til højre. Den bruger O(1) ekstra plads, er O(n) på sorteret input og O(n²) i gennemsnit og i værste tilfælde, som er omvendt sorteret input.',
        'Sådan løser du “udfør insertion sort i hånden og tæl operationer” (refleksionsopgaven L06 s. 6 med 8 spillekort — udledt af øvelserne, ikke af eksamenssæt): 1) skriv arrayet op og markér det sorterede præfiks (kun `a[0]`); 2) for `p = 1, 2, …`: tag `a[p]` ud, skub hvert større element i præfikset én plads til højre og tæl flytningen; 3) skriv arrayet efter hvert gennemløb, som i Weiss figur 7.1; 4) summér flytningerne og sammenlign med antallet af inversioner; 5) konkludér: stigende input 0 flytninger → O(n), faldende input `n(n − 1)/2` flytninger → O(n²), plads O(1) i alle tilfælde.',
        'Antallet af flytninger er præcis antallet af inversioner. `[34, 8, 64, 51, 32, 21]` har ni inversioner og kræver ni flytninger. Et tilfældigt array har i gennemsnit N(N − 1)/4 inversioner, så alle algoritmer, der kun bytter naboer, er kvadratiske i gennemsnit — det er grænsen, merge sort og quicksort bryder.',
        'Jeg vælger insertion sort til små eller næsten sorterede data: den er simpel, sorterer på stedet og bliver lineær, når der er få inversioner.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture06_ArraySorting.md'), original: 'Lecture06.pdf', pages: 's. 3–7, 9, 22' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 291–295', note: '7.1 Preliminaries, 7.2 Insertion Sort, 7.3 inversioner' },
        { path: k('context/kode/kildekode_part6.md'), note: 'Sort.h (insertionSort, også versionen for delarrays)' },
      ],
      gaps: [
        'Slidet skriver om `x = std::move(y)`, at det “passes a reference of y to x” (L06 s. 7). Bogen siger det modsatte: “std::move doesn’t move anything; rather, it makes a value subject to be moved” (Weiss s. 29) — flytningen sker i tildelingen.',
        'Slidets animation (L06 s. 5) stopper efter tre gennemløb; resten af kørslen står kun i bogens figur 7.1 (Weiss s. 292).',
        'Om insertion sort er **stabil**, står hverken på slides eller i bogteksten; bogen stiller det som opgave 7.31 (Weiss s. 344). Markdown-konverteringerne skriver “Stabil: Ja” uden kilde. Uden for materialet: den er stabil, fordi den indre løkke stopper ved lige store elementer (`tmp < a[j - 1]` er falsk).',
        'L06-markdown’en tilføjer “Expected answers” til refleksionsopgaven (≈ n²/4 sammenligninger osv.). De står ikke i PDF’en.',
        'Kursuskoden sammenligner `int p` med `a.size()`; med `-Wextra` giver det en `-Wsign-compare`-advarsel, men koden kompilerer og sorterer korrekt.',
      ],
      keywords: ['insertionSort', 'indsættelsessortering', 'insertion sort', 'spillekort', 'playing cards', 'inversion', 'inversioner', 'Theorem 7.1', 'Theorem 7.2', 'invariant', 'passes', 'gennemløb', 'std::move', 'in-place', 'sorteringsproblemet', 'array sorting problem', 'comparison-based sorting', 'Sort.h'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'merge-sort',
      title: 'Merge sort',
      week: 'Lektion 6',
      definition:
        '**Merge sort** er en divide-and-conquer-algoritme: del arrayet i to halvdele, sortér hver halvdel rekursivt, og flet (merge) de to sorterede halvdele sammen i lineær tid (L06 s. 9). Den har O(log n) niveauer med O(n) fletarbejde pr. niveau og kører derfor i O(n log n) i alle tilfælde, men kræver et ekstra array på O(n) plads.',
      concepts: [
        {
          term: 'Divide and conquer',
          body: [
            '“To break the quadratic bound, we need a new way to think about array sorting” (L06 s. 9). Idéen: 1) split arrayet i to dele; 2) sortér hver del uafhængigt; 3) flet de sorterede dele, så rækkefølgen bevares. Slidets åbne spørgsmål er “How to merge two sorted arrays?”.',
            'Bogen kalder det “a classic divide-and-conquer strategy”: problemet deles i mindre problemer, som løses rekursivt, og *conquering*-fasen “consists of patching together the answers” (Weiss s. 305). Mønstret går igen under [[designteknikker|algoritmedesignteknikker]].',
          ],
        },
        {
          term: 'Det generelle princip',
          body: [
            'Slidet deler `[23, 16, 8, 24, 35, 87, 19, 4]` tre gange: `[23 16 8 24] [35 87 19 4]` → `[23 16] [8 24] [35 87] [19 4]` → otte enkeltelementer, der er “sorted by definition” (L06 s. 10).',
            'Derefter flettes der op igen: `[16 23] [8 24] [35 87] [4 19]` → `[8 16 23 24] [4 19 35 87]` → `[4 8 16 19 23 24 35 87]`.',
          ],
        },
        {
          term: 'Merge',
          body: [
            'Flet-algoritmen har to input-arrays A og B, et output-array C og tre tællere `Actr`, `Bctr`, `Cctr`. Den mindste af `A[Actr]` og `B[Bctr]` kopieres til C, og tællerne rykkes. Når det ene input er tomt, kopieres resten af det andet (Weiss s. 304).',
            'Bogens eksempel fletter `A = [1, 13, 24, 26]` og `B = [2, 15, 27, 38]`: 1 vs 2 → 1; 13 vs 2 → 2; 13 vs 15 → 13; 24 vs 15 → 15; 24 vs 27 → 24; 26 vs 27 → 26; nu er A tom, og `27, 38` kopieres. Fletningen er lineær, fordi der højst laves N − 1 sammenligninger: hver sammenligning lægger ét element i C, undtagen den sidste, der lægger mindst to (Weiss s. 304–305).',
            'Videoen fra uge 6 viser det samme: sammenlign de to forreste, fjern det mindste, gentag til den ene side er tom, og tag så resten. To sekvenser af længde ét flettes med én sammenligning.',
          ],
        },
        {
          term: 'Implementeringen',
          body: [
            'Den eksterne `mergeSort(a)` allokerer ét hjælpearray `tmp(a.size())` og kalder den interne `mergeSort(a, tmp, 0, a.size() - 1)` (L06 s. 12). Den interne stopper, når `left >= right` (0 eller 1 element), og gør ellers: `center = (left + right) / 2`, sortér `left..center`, sortér `center + 1..right`, `merge(a, tmp, left, center + 1, right)`.',
            '`merge` (Weiss figur 7.12, `Sort.h`) fletter ind i `tmpArray` og kopierer til sidst tilbage til `a`. Bogen forklarer, hvorfor hjælpearrayet oprettes i driveren: laver hvert `merge`-kald sit eget, kan der være log N midlertidige arrays aktive på én gang; da `merge` er sidste linje i `mergeSort`, rækker ét (Weiss s. 305–306).',
          ],
        },
        {
          term: 'Analyse og rekurrens',
          body: [
            'Slidet: “Time complexity for O(log(n)) levels each requiring linear O(n) work for merging => O(n * log(n))”, med et rekursionstræ fra `O(n)` over to gange `O(n/2)` og fire gange `O(n/4)` ned til bladene `O(1)` (L06 s. 12).',
            'Bogen skriver rekurrensen for N som potens af 2: `T(1) = 1`, `T(N) = 2T(N/2) + N`. Divideres med N, fås `T(N)/N = T(N/2)/(N/2) + 1`; skrives ligningen op for N/2, N/4, …, 2 og lægges sammen, *teleskoperer* summen til `T(N)/N = T(1)/1 + log N`, altså `T(N) = N log N + N = O(N log N)`. Den anden metode er gentagen substitution: `T(N) = 2ᵏT(N/2ᵏ) + k·N` med `k = log N` (Weiss s. 307–309).',
            'Da algoritmen altid deler og fletter på samme måde, afhænger antallet af niveauer ikke af input: slidets tabel giver bedste Ω(n log n), gennemsnit Θ(n log n) og værste O(n log n) (L06 s. 22).',
          ],
        },
        {
          term: 'Pladsforbrug og praksis',
          body: [
            'Hovedproblemet er, at fletning bruger lineær ekstra hukommelse, og kopieringen frem og tilbage gør sorteringen langsommere; det kan dæmpes ved at bytte rollerne for `a` og `tmpArray` på skiftende niveauer (Weiss s. 309). Slidets tabel angiver plads O(n) (L06 s. 22).',
            'Merge sort bruger færrest sammenligninger af de populære algoritmer og er derfor Javas generiske standardsortering, hvor sammenligninger er dyre og flytninger billige. I C++ er det omvendt, og der har quicksort været standard (Weiss s. 309). Videoen fra uge 6 tilføjer, at merge sort ikke træffer tilfældige valg: dens køretid afhænger kun af input-permutationen.',
          ],
        },
      ],
      viz: 'doa-merge-sort',
      keyPoints: [
        'Del i to, sortér hver halvdel rekursivt, flet — base case er 0 eller 1 element (`left < right` er falsk).',
        'Merge: sammenlign de to forreste, kopiér den mindste, kopiér resten når én side er tom; højst N − 1 sammenligninger.',
        'Ét hjælpearray `tmp` allokeres i driveren og genbruges i alle kald.',
        'Rekurrens `T(N) = 2T(N/2) + N` → `N log N + N` ved teleskopering.',
        'log n niveauer × O(n) fletarbejde pr. niveau = O(n log n), uanset input.',
        'Kompleksitet (L06 s. 12, 22; Weiss s. 304–309): `mergeSort` bedste O(n log n) · gennemsnit O(n log n) · værste O(n log n) · plads O(n).',
        '`merge` er O(n) i tid for de n elementer, den fletter.',
        'Prisen er den ekstra plads og kopieringen; til gengæld er køretiden forudsigelig.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'mergeSort: intern rekursion og driver',
          source: 'Lecture06.pdf s. 12 (merge_sort.h)',
          code: `/**
 * Internal method that makes recursive calls.
 * a is an array of Comparable items.
 * tmp is an array to place the merged result.
 * left is the left-most index of the subarray.
 * right is the right-most index of the subarray.
 */
template <typename Comparable>
void mergeSort(vector<Comparable>& a, vector<Comparable>& tmp,
        int left, int right) {
    if (left < right) {
        int center = (left + right) / 2;
        mergeSort(a, tmp, left, center);
        mergeSort(a, tmp, center + 1, right);
        merge(a, tmp, left, center + 1, right);
    }
}

/**
 * Mergesort algorithm (external).
 */
template <typename Comparable>
void mergeSort(vector<Comparable>& a) {
    vector<Comparable> tmp(a.size());
    mergeSort(a, tmp, 0, a.size() - 1);
}`,
        },
        {
          lang: 'cpp',
          title: 'merge',
          source: 'Weiss s. 307, fig. 7.12 = Sort.h (kildekode_part6.md)',
          code: `/**
 * Internal method that merges two sorted halves of a subarray.
 * a is an array of Comparable items.
 * tmpArray is an array to place the merged result.
 * leftPos is the left-most index of the subarray.
 * rightPos is the index of the start of the second half.
 * rightEnd is the right-most index of the subarray.
 */
template <typename Comparable>
void merge( vector<Comparable> & a, vector<Comparable> & tmpArray,
            int leftPos, int rightPos, int rightEnd )
{
    int leftEnd = rightPos - 1;
    int tmpPos = leftPos;
    int numElements = rightEnd - leftPos + 1;

    // Main loop
    while( leftPos <= leftEnd && rightPos <= rightEnd )
        if( a[ leftPos ] <= a[ rightPos ] )
            tmpArray[ tmpPos++ ] = std::move( a[ leftPos++ ] );
        else
            tmpArray[ tmpPos++ ] = std::move( a[ rightPos++ ] );

    while( leftPos <= leftEnd )    // Copy rest of first half
        tmpArray[ tmpPos++ ] = std::move( a[ leftPos++ ] );

    while( rightPos <= rightEnd )  // Copy rest of right half
        tmpArray[ tmpPos++ ] = std::move( a[ rightPos++ ] );

    // Copy tmpArray back
    for( int i = 0; i < numElements; ++i, --rightEnd )
        a[ rightEnd ] = std::move( tmpArray[ rightEnd ] );
}`,
        },
      ],
      exam: [
        'Merge sort deler arrayet i to, sorterer hver halvdel rekursivt og fletter de to sorterede halvdele i lineær tid. Rekurrensen er `T(N) = 2T(N/2) + N`, som giver O(n log n): log n niveauer, hvert med O(n) fletarbejde.',
        'Sådan løser du “udfør merge sort i hånden og tæl operationer” (refleksionsopgaven L06 s. 11 med 8 spillekort — udledt af øvelserne, ikke af eksamenssæt): 1) del rækken i halvdele, til hver del har ét element, og tegn delingen som et træ (som L06 s. 10); 2) flet parvis nedefra: sammenlign de to forreste elementer, skriv det mindste ned, og tæl sammenligningen; 3) når den ene side er tom, kopiér resten uden sammenligninger; 4) konkludér: stigende, faldende og tilfældig rækkefølge giver alle log n niveauer med O(n) arbejde, dvs. O(n log n), og hjælpearrayet giver O(n) plads.',
        'Sådan løser du “flet to sorterede arrays” (bogens eksempel, Weiss s. 304–305): hold en tæller i hvert input og én i output, kopiér det mindste af de to forreste og ryk den tæller, og kopiér resten, når det ene input er tomt. `[1, 13, 24, 26]` og `[2, 15, 27, 38]` kræver seks sammenligninger.',
        'Jeg vælger merge sort, når jeg har brug for en garanteret O(n log n) og har råd til O(n) ekstra plads. Til sortering på stedet er quicksort eller heapsort bedre valg.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture06_ArraySorting.md'), original: 'Lecture06.pdf', pages: 's. 8–12, 22' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 304–309', note: '7.6 Mergesort og 7.6.1 analyse' },
        { path: k('context/kode/kildekode_part6.md'), note: 'Sort.h (mergeSort, merge)' },
        { path: k('context/videos/SW2ADS_Video_Week06_ArraySorting.md'), original: 'data/video transcripts/week6.txt', note: '“Merge Sort vs Quick Sort”' },
      ],
      gaps: [
        '`merge` står ikke på slidet — L06 s. 12 kalder den kun. Den findes i bogen (figur 7.12, s. 307) og i `Sort.h`.',
        'I kursets `Sort.h` er `merge` defineret *efter* `mergeSort`. Da kaldet `merge(a, tmpArray, …)` så ikke kan ses ved skabelonens definition, finder argument-dependent lookup i stedet `std::merge`, og filen kompilerer ikke med g++ 13 (`-std=c++17`). Kodeeksemplerne her er testet med `merge` erklæret før `mergeSort`.',
        'Slidet og bogen analyserer kun tid for N som potens af 2; bogen nævner, at resultatet er “almost identical” for andre N, uden bevis (Weiss s. 309).',
        'Om merge sort er **stabil**, står ikke i slides eller bogtekst; bogen overlader det til opgave 7.31 (s. 344). Markdown-konverteringerne skriver “Stabil: Ja” uden kilde. Uden for materialet: `merge` tager fra venstre halvdel ved lighed (`a[leftPos] <= a[rightPos]`), og det gør den stabil.',
        'L06-markdown’en giver “Expected answers” til refleksionsopgaven; de står ikke i PDF’en.',
      ],
      keywords: ['mergeSort', 'merge sort', 'mergesort', 'flettesortering', 'merge', 'flet', 'fletning', 'divide and conquer', 'del og hersk', 'tmpArray', 'rekurrens', 'T(N) = 2T(N/2) + N', 'teleskopering', 'telescoping', 'recursion tree', 'rekursionstræ', 'Actr', 'Bctr', 'Cctr', 'O(n log n)'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'quicksort',
      title: 'Quicksort',
      week: 'Lektion 6',
      definition:
        '**Quicksort** vælger et **pivot**, partitionerer arrayet, så `A[l, …, p − 1] ≤ A[p] ≤ A[p + 1, …, r]`, og sorterer de to dele rekursivt (L06 s. 15). Partitionen sker på stedet, så der ikke skal flettes bagefter. Gennemsnittet er O(n log n), men et pivot, der konsekvent er det mindste eller største element, giver O(n²).',
      concepts: [
        {
          term: 'Idéen: tre dele',
          body: [
            '“To perform sorting inplace, we need a new way to think!” (L06 s. 15). Split arrayet i tre dele, *sortér cirka* ved at lave en partition `A[l, …, p − 1] ≤ A[p] ≤ A[p + 1, …, r]`, og sortér hver af de to ydre dele. Pivotet står derefter på sin endelige plads.',
            'Bogens klassiske quicksort i fire trin: 1) har S 0 eller 1 element, så returnér; 2) vælg et pivot `v`; 3) partitionér `S − {v}` i `S1 = {x ≤ v}` og `S2 = {x ≥ v}`; 4) returnér `quicksort(S1)`, `v`, `quicksort(S2)` (Weiss s. 311). Figur 7.14 viser det på et sæt med pivot 65 (s. 312).',
            'Forskellen fra [[merge-sort|merge sort]]: dér ligger arbejdet i at flette; her ligger det i at partitionere, og delproblemerne er ikke garanteret lige store. Det indhenter quicksort ved, at partitionen kan laves på stedet og meget effektivt (Weiss s. 311).',
          ],
        },
        {
          term: 'Pivotvalg og median-of-three',
          body: [
            'Slidets eksempel er `[5, 1, 8, 2, 5, 7]` med kandidaterne `left` (indeks 0, værdi 5), `center` (indeks 2 = (N − 1)/2, værdi 8) og `right` (indeks 5, værdi 7). “Typically medium-of-three, here medium of [5,7,8] = 7”. Pivotet kan også være venstre, højre eller midterste element, og det skal være hurtigt at finde (L06 s. 16).',
            'Bogen er hård ved første element som pivot: på sorteret eller omvendt input havner alle elementer i S1 eller S2, quicksort bliver kvadratisk “to do essentially nothing at all”, og strategien “should be discarded immediately” (Weiss s. 312). Et tilfældigt pivot er sikkert, men tilfældige tal er dyre. **Median-of-three** af venstre, højre og midterste element fjerner det dårlige tilfælde for sorteret input og sparer ca. 14 % af sammenligningerne; for `8, 1, 4, 9, 6, 3, 5, 2, 7, 0` er pivotet 6 (Weiss s. 313).',
            'Weiss’ `median3` sorterer `a[left]`, `a[center]` og `a[right]` på stedet og lægger pivotet på `a[right - 1]`. Så er `a[left]` en sentinel for `j` og pivotet en sentinel for `i` (Weiss s. 316, figur 7.16).',
          ],
        },
        {
          term: 'Partitionen på slidet og i videoen',
          body: [
            'L06 s. 17 viser partitionen af `[5, 1, 8, 2, 5, 7]` med pivot 7 række for række (`Value[i=0]` … `Value[i=4]`): `5 1 8 2 5 7`, `5 1 8 2 5 7`, `1 5 8 2 5 7`, `1 5 2 8 5 7`, `1 5 2 5 8 7`, og til sidst “Move”: `1 5 2 5 7 8`. Klammerne under tabellen markerer indeks 0–3 som “Next Sub level”, indeks 4 (pivotet 7) som “In Position” og indeks 5 som “Next Sub level”.',
            'Partitionsvideoen (henvist fra slidet; transskription `week6.txt`) bruger sidste element som pivot og to tællere: `i` starter én før første element, `j` løber fra første til næstsidste. Er `a[j]` mindre end pivotet, tælles `i` op, og `a[i]` og `a[j]` byttes; ellers gøres intet. Til sidst flyttes pivotet til `i + 1`, som er dets endelige plads, og de to sider sorteres rekursivt. Uden for materialet: skemaet kaldes Lomuto; navnet står ikke i PDF’en eller transskriptionen.',
          ],
        },
        {
          term: 'Weiss’ partition med i og j',
          body: [
            'Bogens strategi: flyt pivotet af vejen til slutningen; `i` starter ved første, `j` ved næstsidste element. `i` går til højre over elementer mindre end pivotet, `j` til venstre over elementer større end pivotet; står de begge, og er `i` til venstre for `j`, byttes de. Når de krydser, byttes pivotet med `a[i]` (Weiss s. 313–314).',
            'Eksemplet `8 1 4 9 0 3 5 2 7 6` (pivot 6 sidst): første swap giver `2 1 4 9 0 3 5 8 7 6`, andet `2 1 4 5 0 3 9 8 7 6`; så krydser `i` og `j`, og pivotet byttes med `a[i]`: `2 1 4 5 0 3 6 8 7 9` (Weiss s. 314).',
            'Elementer lig pivotet: både `i` og `j` skal **stoppe**. Så bliver der unødige swaps mellem ens elementer, men `i` og `j` mødes på midten, og partitionerne bliver lige store, O(N log N). Stopper ingen af dem, bliver et array af ens elementer O(N²) (Weiss s. 315).',
          ],
        },
        {
          term: 'Kodens base case og cutoff',
          body: [
            'Slidets `quickSort(a, left, right)` partitionerer, når `right - left > 1`, og kalder sig selv på `left..i-1` og `i+1..right`; ellers bytter den højst to elementer (L06 s. 19). “Notice the base case of the recursion”. Selve `partition` vises ikke.',
            'Bogen og `Sort.h` bruger en **cutoff**: for små arrays (N ≤ 20) er insertion sort hurtigere end quicksort, og en cutoff omkring N = 10 sparer ca. 15 % køretid og undgår at tage median-of-three af ét eller to elementer (Weiss s. 315). Derfor skifter `quicksort` til `insertionSort(a, left, right)`, når `left + 10 > right` (figur 7.17, s. 317). Konsekvens: et array på 6 elementer som slidets bliver slet ikke partitioneret af Weiss’ kode — det insertion-sorteres.',
          ],
        },
        {
          term: 'Analyse',
          body: [
            'Bogen skriver `T(N) = T(i) + T(N − i − 1) + cN`, hvor `i = |S1|` (Weiss s. 318). **Værste tilfælde**: pivotet er hele tiden det mindste element, `T(N) = T(N − 1) + cN`, som teleskoperer til `T(1) + c Σ i = Θ(N²)` (s. 318–319). **Bedste tilfælde**: pivotet er i midten, `T(N) = 2T(N/2) + cN`, samme analyse som merge sort, `cN log N + N = Θ(N log N)` (s. 319). **Gennemsnit**: O(N log N) (s. 321).',
            'Slidet siger det uden ligninger: bedste tilfælde bevares, selv når partitionerne ikke er perfekte, blot de deler i en konstant brøkdel; værste tilfælde udløses kun af usandsynlige partitioner; på tilfældigt input veksler gode og dårlige partitioner, så gennemsnittet er O(N log N). “That is why QuickSort is implemented everywhere” (L06 s. 20).',
            'Uge 6-videoen sammenligner to robotter: begge laver 19 sammenligninger, men merge sort bruger ca. 7 sekunder på at flytte elementer mellem hylder, og quicksorts sejr skyldtes delvis heldige tilfældige pivots.',
          ],
        },
      ],
      viz: 'doa-quicksort',
      keyPoints: [
        'Vælg pivot → partitionér i `≤ pivot | pivot | ≥ pivot` → sortér de to sider rekursivt; pivotet står på sin endelige plads.',
        'Median-of-three af venstre, midterste og højre element; slidets `[5, 1, 8, 2, 5, 7]` giver pivot 7.',
        'Første element som pivot er katastrofalt på sorteret input — bogen: “discarded immediately”.',
        'Weiss-partition: `i` fra venstre, `j` fra højre, byt når begge står, stop ved lighed med pivot, byt pivot ind ved `i`.',
        'Cutoff: under ca. 10 elementer skiftes til insertion sort (Weiss/`Sort.h`).',
        'Kompleksitet (L06 s. 20, 22; Weiss s. 318–321): `quicksort` bedste O(n log n) · gennemsnit O(n log n) · værste O(n²) · plads O(log n) (kun angivet i slidets tabel).',
        'Værste tilfælde: pivot altid mindst eller størst → `T(N) = T(N − 1) + cN` = O(n²).',
        'Hurtigst i praksis, fordi partitionen sker på stedet med en stram indre løkke; bogen kombinerer den med heapsort for at få O(n log n) i værste tilfælde (Weiss s. 309–310).',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'quickSort fra slidet (uddrag: partition vises ikke)',
          source: 'Lecture06.pdf s. 19 (quick_sort.h)',
          code: `/**
 * Internal quicksort method that makes recursive calls.
 * Uses median-of-three partitioning and a cutoff of 10.
 * a is an array of Comparable items.
 * left is the left-most index of the subarray.
 * right is the right-most index of the subarray.
 */
template <typename Comparable>
void quickSort(vector<Comparable>& a, int left, int right) {
    if (right - left > 1) {
        int i = partition(a, left, right);
        quickSort(a, left, i - 1);  // Sort small elements
        quickSort(a, i + 1, right); // Sort large elements
    } else {                        // Do an insertion sort on the subarray
        if (a[left] > a[right]) {
            std::swap(a[left], a[right]);
        }
    }
}

/**
 * Quicksort algorithm (driver).
 */
template <typename Comparable> void quickSort(vector < Comparable > &a) {
    quickSort(a, 0, a.size() - 1);
}`,
        },
        {
          lang: 'cpp',
          title: 'median3 og quicksort med cutoff',
          source: 'Weiss s. 316–317, fig. 7.16–7.17 = Sort.h (kildekode_part6.md)',
          code: `/**
 * Return median of left, center, and right.
 * Order these and hide the pivot.
 */
template <typename Comparable>
const Comparable & median3( vector<Comparable> & a, int left, int right )
{
    int center = ( left + right ) / 2;

    if( a[ center ] < a[ left ] )
        std::swap( a[ left ], a[ center ] );
    if( a[ right ] < a[ left ] )
        std::swap( a[ left ], a[ right ] );
    if( a[ right ] < a[ center ] )
        std::swap( a[ center ], a[ right ] );

        // Place pivot at position right - 1
    std::swap( a[ center ], a[ right - 1 ] );
    return a[ right - 1 ];
}

/**
 * Internal quicksort method that makes recursive calls.
 * Uses median-of-three partitioning and a cutoff of 10.
 */
template <typename Comparable>
void quicksort( vector<Comparable> & a, int left, int right )
{
    if( left + 10 <= right )
    {
        const Comparable & pivot = median3( a, left, right );

            // Begin partitioning
        int i = left, j = right - 1;
        for( ; ; )
        {
            while( a[ ++i ] < pivot ) { }
            while( pivot < a[ --j ] ) { }
            if( i < j )
                std::swap( a[ i ], a[ j ] );
            else
                break;
        }

        std::swap( a[ i ], a[ right - 1 ] );  // Restore pivot

        quicksort( a, left, i - 1 );     // Sort small elements
        quicksort( a, i + 1, right );    // Sort large elements
    }
    else  // Do an insertion sort on the subarray
        insertionSort( a, left, right );
}

/**
 * Quicksort algorithm (driver).
 */
template <typename Comparable>
void quicksort( vector<Comparable> & a )
{
    quicksort( a, 0, a.size( ) - 1 );
}`,
        },
      ],
      exam: [
        'Quicksort vælger et pivot, partitionerer arrayet på stedet i elementer mindre end og større end pivotet og sorterer de to dele rekursivt. Pivotet står derefter på sin endelige plads, så der skal ikke flettes bagefter.',
        'Sådan løser du “partitionér i hånden” (opgavetype fra L06 s. 16–17 og refleksionsopgaven s. 18 — udledt af øvelserne, ikke af eksamenssæt): 1) find pivotet — median-of-three af venstre, midterste (indeks (N − 1)/2) og højre element, eller højre element, hvis opgaven siger det; 2) flyt pivotet til enden; 3) gå arrayet igennem og byt små elementer frem (videoens `i`/`j`-skema) eller lad `i` og `j` løbe mod hinanden og byt (Weiss’ skema); 4) byt pivotet ind på grænsen og skriv arrayet efter hvert swap; 5) markér pivotets plads som “in position” og de to sider som næste rekursionsniveau.',
        'Sådan besvarer du refleksionsopgaven L06 s. 18 (8 kort, højre element vs. median-of-three, på tilfældigt, stigende og faldende input): med højre element som pivot er pivotet på sorteret input altid det største, så hver partition fjerner kun ét element, og det bliver O(n²); median-of-three giver midterelementet på sorteret input og dermed O(n log n). Pladsen angiver slidets tabel som O(log n) (L06 s. 22), mod merge sorts O(n).',
        'Værste tilfælde er, at pivotet hver gang er det mindste eller største element: `T(N) = T(N − 1) + cN` = O(n²). Bedste tilfælde er et pivot i midten: `T(N) = 2T(N/2) + cN` = O(n log n), præcis som merge sort. Gennemsnittet er også O(n log n), og derfor bruges quicksort overalt.',
        'Jeg vælger quicksort, når jeg vil sortere på stedet og hurtigt i gennemsnit. Skal køretiden være garanteret O(n log n), vælger jeg merge sort eller heapsort.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture06_ArraySorting.md'), original: 'Lecture06.pdf', pages: 's. 13–20, 22' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 309–321', note: '7.7 Quicksort (pivot, partition, cutoff, analyse)' },
        { path: k('context/kode/kildekode_part6.md'), note: 'Sort.h (median3, quicksort, insertionSort for delarrays, SORT)' },
        { path: k('context/videos/SW2ADS_Video_Week06_ArraySorting.md'), original: 'data/video transcripts/week6.txt', note: '“Quicksort: Partitioning an array” og “Merge Sort vs Quick Sort”' },
      ],
      gaps: [
        'Slidets kode viser ikke `partition` (L06 s. 19). Kommentaren lover “median-of-three partitioning and a cutoff of 10”, men koden har cutoff `right - left > 1`, altså ingen insertion sort, kun et swap af to elementer.',
        'Eget tjek af slidets kode: `else`-grenen rammer også tomme delarrays. Ender pivotet yderst, kaldes fx `quickSort(a, right + 1, right)`, som læser `a[right + 1]` uden for arrayet. Med videoens partition og input `[1, 2, 3]` udløser det en bounds-fejl (`-D_GLIBCXX_ASSERTIONS`). Weiss’ `insertionSort(a, left, right)` har ikke problemet.',
        'Rækkerne på L06 s. 17 følger ikke videoens partitionsskema: rækken `Value[i=2]` bytter 5 og 1 (`1 5 8 2 5 7`), hvilket hverken videoens eller Weiss’ skema gør. Slutresultatet `1 5 2 5 7 8` er stadig en gyldig partition om pivot 7. Den statiske PDF viser kun de to første rækker; resten er animation (læst med `pdftotext`).',
        'Slidet og bogen beregner midten forskelligt på papiret — slidet `(N − 1)/2`, bogen `(left + right)/2` — men de giver samme indeks for et helt array.',
        'Markdown-konverteringen af bogen (Eksempel 5) regner median-of-three forkert og viser et forkert partitionsresultat (`[0, 1, 4, 2, _, 3, 5, 6, 9, 8]`). Bogens egen kørsel ender i `2 1 4 5 0 3 6 8 7 9` (Weiss s. 314).',
        'Pladskompleksiteten O(log n) står kun i slidets tabel (L06 s. 22); bogen angiver ingen plads for quicksort. Stabilitet nævnes ikke (bogen: opgave 7.31, s. 344).',
        'Bogudsnittets markdown markerer beviserne i 7.7.5 (gennemsnitsanalysen) og 7.7.6 (quickselect) som udeladt; her bruges kun resultatet, gennemsnit O(N log N) (Weiss s. 321).',
      ],
      keywords: ['quickSort', 'quicksort', 'quick sort', 'hurtigsortering', 'pivot', 'partition', 'partitionering', 'median-of-three', 'median3', 'medium-of-three', 'cutoff', 'Lomuto', 'sentinel', 'in-place', 'på stedet', 'S1', 'S2', 'T(N) = T(N − 1) + cN', 'værste tilfælde', 'worst case'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'sortering-nedre-graense',
      title: 'Nedre grænse og sortering i praksis',
      short: 'Nedre grænse og std::sort',
      week: 'Lektion 6',
      definition:
        'Enhver algoritme, der sorterer n elementer ved hjælp af sammenligninger, udfører **mindst Ω(n log n) sammenligninger** i værste tilfælde (L06 s. 24). Beviset bruger et **beslutningstræ**: der er n! mulige ordninger, altså mindst n! blade, og et binært træ med L blade har dybde mindst ⌈log L⌉. I praksis sorterer man i C++ med `std::sort`, og slidets oversigtstabel samler algoritmernes kompleksiteter.',
      concepts: [
        {
          term: 'Øvre og nedre grænser',
          body: [
            'Lektionens algoritmer sorterer ved sammenligning: resultatet af sammenligninger bestemmer to elementers indbyrdes plads. For dem har vi fundet **øvre grænser** (fx O(n²) og O(n log n)). Den nedre grænse siger noget om *alle* mulige algoritmer: ingen sammenligningsbaseret sortering kan gøre det med færre end Ω(n log n) sammenligninger i værste tilfælde (L06 s. 24).',
            'Bogen tilføjer, at merge sort og heapsort dermed er optimale op til en konstant faktor, og at argumentet kan udvides til gennemsnittet, så quicksort er optimal i gennemsnit (Weiss s. 323).',
          ],
        },
        {
          term: 'Beslutningstræet for [a, b, c]',
          body: [
            'I beslutningstræet er de indre knuder sammenligninger, og bladene er de mulige svar (L06 s. 25). For tre elementer starter roden (knude 1) med alle seks ordninger: `a<b<c`, `a<c<b`, `b<a<c`, `b<c<a`, `c<a<b`, `c<b<a` (L06 s. 26; Weiss figur 7.20, s. 324).',
            'Første sammenligning er `a` mod `b`. Ved `a < b` er der tre ordninger tilbage (knude 2), ved `b < a` de tre andre (knude 3). Fra knude 2 sammenlignes `a` og `c`: `c < a` giver bladet `c<a<b` (knude 5), `a < c` giver knude 4 med to ordninger, som `b` mod `c` skiller ad (blade 8 `a<b<c` og 9 `a<c<b`). Symmetrisk fra knude 3: `c < b` giver bladet `c<b<a` (7), `b < c` giver knude 6, som `a` mod `c` skiller ad (10 `b<a<c` og 11 `b<c<a`).',
            'Træet har seks blade (= 3!) og dybde 3: algoritmen bruger tre sammenligninger i værste tilfælde, og gennemsnittet er bladenes gennemsnitsdybde (Weiss s. 324). En anden algoritme ville give et andet træ (Weiss s. 323).',
          ],
        },
        {
          term: 'Fra træet til Ω(n log n)',
          body: [
            'Slidets argument (L06 s. 27): med N elementer er der N! permutationer, så træet har N! mulige blade. Den største højde er det antal sammenligninger, en algoritme mindst må lave. Højden af et træ med L blade er ⌈log L⌉, så højden er ⌈log(N!)⌉, og “any sorting algorithm will need to conduct at least ⌈log(N!)⌉ comparisons”.',
            'Bogen gør det med to lemmaer: et binært træ med dybde d har højst 2ᵈ blade (Lemma 7.1, induktion), så et træ med L blade har dybde mindst ⌈log L⌉ (Lemma 7.2). Theorem 7.6: enhver sammenligningsbaseret sortering kræver mindst ⌈log(N!)⌉ sammenligninger i værste tilfælde (Weiss s. 324–325).',
            'Til sidst skal `log(N!)` omskrives. Slidet: `log(N!) = Ω(n lg n)`, fordi `lg(n!) ≥ (n/4) lg n` for `n ≥ 16` (L06 s. 28). Bogen: `log(N!) = log N + log(N − 1) + … + log 1 ≥ log N + … + log(N/2) ≥ (N/2) log(N/2) = (N/2) log N − N/2 = Ω(N log N)` (Theorem 7.7, s. 325). Bogen kalder det en **information-theoretic lower bound**: skal P tilfælde skelnes med ja/nej-spørgsmål, kræves ⌈log P⌉ spørgsmål i et eller andet tilfælde.',
          ],
        },
        {
          term: 'Sortering i C++: std::sort og stable_sort',
          body: [
            'STL’s *Algorithm*-bibliotek har `void sort(Iterator begin, Iterator end);` og `void sort(Iterator begin, Iterator end, Comparator cmp);`. Iteratorerne skal have random access, og man kan give en egen comparator (L06 s. 21; Weiss s. 291–292). Se [[pointere-iteratorer|iteratorer]].',
            'Bogens eksempler: `std::sort(v.begin(), v.end())` sorterer hele `v` stigende, `greater<int>{}` sorterer faldende, og `std::sort(v.begin(), v.begin() + (v.end() - v.begin()) / 2)` sorterer første halvdel (Weiss s. 292).',
            '`sort` garanterer **ikke**, at lige store elementer beholder deres rækkefølge; er det vigtigt, bruges `stable_sort` (Weiss s. 292). Algoritmen bag `sort` er “generally quicksort” (s. 292). Bogen nævner, at quicksort kombineret med heapsort giver quicksorts hastighed på næsten alt input og heapsorts O(N log N) i værste tilfælde (s. 309–310, opgave 7.27); se [[heapify-heapsort|heapsort]].',
          ],
        },
        {
          term: 'Oversigtstabellen',
          body: [
            'Slidet “The array sorting solutions…” gengiver en tabel fra bigocheatsheet.com med 13 algoritmer (L06 s. 22). For kursets fire sammenligningsbaserede algoritmer: **Quicksort** Ω(n log n) / Θ(n log n) / O(n²), plads O(log n); **Mergesort** Ω(n log n) / Θ(n log n) / O(n log n), plads O(n); **Heapsort** Ω(n log n) / Θ(n log n) / O(n log n), plads O(1); **Insertion sort** Ω(n) / Θ(n²) / O(n²), plads O(1).',
            'Tabellen viser også ikke-sammenligningsbaserede algoritmer som Radix sort Θ(nk) og Counting sort Θ(n + k), der ikke er bundet af Ω(n log n), fordi de ikke kun sammenligner. Lektionen gennemgår dem ikke.',
          ],
        },
      ],
      viz: 'doa-decision-tree',
      keyPoints: [
        'Enhver sammenligningsbaseret sortering bruger Ω(n log n) sammenligninger i værste tilfælde.',
        'Beslutningstræ: indre knuder = sammenligninger, blade = ordninger; N elementer giver N! blade.',
        'Binært træ med L blade har dybde ≥ ⌈log L⌉ → mindst ⌈log(N!)⌉ sammenligninger; for [a, b, c] er det 3.',
        '`log(N!) ≥ (N/2) log(N/2)` = Ω(N log N) → merge sort og heapsort er optimale op til en konstant.',
        '`std::sort(begin, end[, cmp])` kræver random access-iteratorer og er ikke stabil; brug `stable_sort`, hvis lige elementer skal beholde rækkefølgen.',
        'Tabel (L06 s. 22; Weiss s. 294–295): insertion sort bedste O(n) · gennemsnit O(n²) · værste O(n²) · plads O(1) · stabil ikke angivet.',
        'Tabel (L06 s. 12, 22; Weiss s. 304–309): merge sort bedste O(n log n) · gennemsnit O(n log n) · værste O(n log n) · plads O(n) · stabil ikke angivet.',
        'Tabel (L06 s. 20, 22; Weiss s. 318–321): quicksort bedste O(n log n) · gennemsnit O(n log n) · værste O(n²) · plads O(log n) · stabil ikke angivet.',
        'Tabel (L06 s. 22): heapsort bedste O(n log n) · gennemsnit O(n log n) · værste O(n log n) · plads O(1) · stabil ikke angivet — se [[heapify-heapsort|heapsort]].',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'std::sort: stigende, faldende og første halvdel',
          source: 'Weiss s. 292 (jf. Lecture06.pdf s. 21)',
          code: `#include <algorithm>
#include <functional>
#include <vector>
using namespace std;

void examples( vector<int> & v )
{
    // void sort( Iterator begin, Iterator end );
    // void sort( Iterator begin, Iterator end, Comparator cmp );
    std::sort( v.begin( ), v.end( ) );
    std::sort( v.begin( ), v.end( ), greater<int>{ } );
    std::sort( v.begin( ), v.begin( ) + ( v.end( ) - v.begin( ) ) / 2 );
}`,
        },
      ],
      exam: [
        'En sammenligningsbaseret sortering kan beskrives som et beslutningstræ, hvor hver knude er en sammenligning og hvert blad en af de n! mulige ordninger. Et binært træ med n! blade har højde mindst log(n!), og log(n!) er Ω(n log n) — så ingen sammenligningsbaseret algoritme kan klare sig med færre sammenligninger i værste tilfælde.',
        'Sådan løser du “tegn beslutningstræet for [a, b, c]” (opgavetype fra L06 s. 25–27 — udledt af slides, ikke af eksamenssæt): 1) skriv alle 3! = 6 ordninger i roden; 2) sammenlign `a` og `b`, og fordel ordningerne efter svaret (tre i hver gren); 3) sammenlign i hver gren to elementer, der stadig er uafgjort, og fortsæt, til hvert blad har én ordning; 4) aflæs dybden (3) og sammenlign med ⌈log 3!⌉ = ⌈log 6⌉ = 3.',
        'Sådan løser du “vælg og begrund en sorteringsalgoritme” (udledt af lektionens sammenligning, L06 s. 20–22): 1) stil kravene op: garanteret værste tilfælde? ekstra plads? små eller næsten sorterede data? skal lige elementer bevare rækkefølgen? 2) slå algoritmerne op i tabellen (bedste/gennemsnit/værste/plads); 3) vælg — insertion sort til små/næsten sorterede, merge sort til garanteret O(n log n) med O(n) plads, quicksort til hurtig sortering på stedet, heapsort til garanteret O(n log n) på stedet, `stable_sort` hvis stabilitet kræves; 4) begrund med tallene.',
        'Merge sort og heapsort rammer den nedre grænse op til en konstant faktor, så de er asymptotisk optimale. Quicksort er optimal i gennemsnit, men ikke i værste tilfælde.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture06_ArraySorting.md'), original: 'Lecture06.pdf', pages: 's. 21–28' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 291–292', note: '7.1 Preliminaries: std::sort og stable_sort' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 323–325', note: '7.8 A General Lower Bound for Sorting, figur 7.20' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 309–310', note: 'Quicksort kombineret med heapsort' },
      ],
      gaps: [
        'Slidets comparator-eksempel kompilerer ikke: `customLess` er et objekt af en anonym struct, ikke en skabelon, så `customLess<int>{ }` er ugyldigt (L06 s. 21; g++ 13: “expected primary-expression before ‘int’”). Den virker som `std::sort(v.begin(), v.end(), customLess)`.',
        'Slidet skriver, at træets højde “is equal to ⌈log(L)⌉ for L leaves” (L06 s. 27). Bogens Lemma 7.2 siger **mindst** ⌈log L⌉ (Weiss s. 324); et skævt træ kan være dybere.',
        'Slidet skriver “One algorithm is a path from the root to a leaf” (L06 s. 27). Hos bogen er *algoritmen* hele træet — “a different algorithm would have a different decision tree” (s. 323) — og én kørsel er en sti.',
        'Slidet og bogen bruger forskellige uligheder til at vise `log(N!) = Ω(N log N)`: `lg(n!) ≥ (n/4) lg n` for `n ≥ 16` (L06 s. 28) mod `(N/2) log N − N/2` (Weiss s. 325). Begge holder. Markdown-konverteringen tilføjer Stirlings formel, som ikke står i PDF’en.',
        '**Stabilitet**: materialet definerer kun begrebet via `stable_sort` (Weiss s. 292) og opgave 7.31 (“Which of the sorting algorithms in this chapter are stable?”, s. 344). Hverken slides eller bogtekst angiver, hvilke algoritmer der er stabile, så kolonnen står som “ikke angivet”. Markdown-konverteringernes Stable-kolonner og appendiks om stabilitet og in-place er tilføjelser.',
        'L06-markdown’en påstår, at `std::sort` typisk er **Introsort**. Navnet står ikke i PDF’en; bogen siger kun “generally quicksort” og nævner kombinationen med heapsort (s. 292, 309–310).',
        'Tabellen på L06 s. 22 er fra bigocheatsheet.com og bruger Ω/Θ/O i hver sin kolonne. Den er ikke udledt i lektionen for de algoritmer, der ikke gennemgås (Timsort, Shell sort, Radix sort osv.) — ikke dækket af pensum ud over tabellen.',
        'Refleksionsopgaven “Stones!” (L06 s. 14) er kun et billede af sten uden tekst; opgaveformuleringen findes ikke i materialet.',
        'Slidenumre: Lecture06.pdf har 28 sider, men hjørnenumrene går til 39. Opslagsværket bruger PDF-sidenummeret.',
      ],
      keywords: ['nedre grænse', 'lower bound', 'Ω(n log n)', 'decision tree', 'beslutningstræ', 'log(N!)', 'N!', 'permutationer', 'information-theoretic lower bound', 'Lemma 7.1', 'Lemma 7.2', 'Theorem 7.6', 'Theorem 7.7', 'std::sort', 'stable_sort', 'comparator', 'greater', 'stabil sortering', 'stability', 'bigocheatsheet', 'sammenligningstabel', 'heapsort', 'comparison-based sorting', 'sammenligningsbaseret sortering'],
    },
  ],
}
