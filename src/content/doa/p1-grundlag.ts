import type { Part } from '../types'
import { k, BOOK } from './paths'

export const grundlag: Part = {
  id: 'grundlag',
  title: 'Grundlag: C++, søgning og analyse',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'pointere-iteratorer',
      title: 'Pointere, referencer og iteratorer',
      short: 'Pointere og iteratorer',
      week: 'Lektion 1',
      definition:
        'En **pointer** er en variabel, der gemmer adressen på en anden variabel; en **reference** er et nyt navn (alias) for et eksisterende objekt; en **iterator** er et objekt, der repræsenterer en position i en STL-container og kan flyttes med `++`. Lektion 1 bygger dem op fra hukommelsesmodellen (stack og heap) over templates og STL til `vector` og iteratorer, fordi alle kursets datastrukturer senere implementeres med netop disse byggesten.',
      intro: [
        'Lektionen hedder “Pointers, iterators and searching”, men den originale PDF (43 slides) indeholder ingen søgning. Søgedelen står under [[soegning|Lineær og binær søgning]].',
      ],
      concepts: [
        {
          term: 'Stack og heap',
          body: [
            'Når et C++-program startes, lægger operativsystemet koden i hukommelsen, initialiserer globale og statiske variable og sætter **stack** og **heap** op (L01 s. 3). Stacken rummer lokale variable, parametre og returadresser. Hvert funktionskald lægger en **stack frame** på stacken, som fjernes igen, når funktionen returnerer — LIFO, fast størrelse, automatisk oprydning (s. 5).',
            'Heapen bruges til **dynamisk allokering**: `new` allokerer, `delete` frigiver. Den er større end stacken og kan vokse, men det er programmørens ansvar at frigive; ellers opstår **memory leaks** (s. 6). Slide 12: “All that is made without new command is stored in the stack (except global variables and initialized char*)”. Eksemplerne er `int *i = new int;`, `string *str = new string("hi there, heap is cozy!");` og `int *arr = new int[5];`, frigivet med `delete i;`, `delete str;` og `delete[] arr;`.',
            'Weiss understreger, at C++ ikke har garbage collection, og giver reglen: brug ikke `new`, når en automatisk (lokal) variabel kan bruges i stedet (s. 22). Samme hukommelsesmodel gennemgås fra OS-siden i [[sys/hukommelse-allokering|SYS: hukommelse og allokering]].',
          ],
        },
        {
          term: 'Pointere, dereference og pointeraritmetik',
          body: [
            'Slide 7: `int *foo;` erklærer en pointer til en `int`, `foo = &x;` gemmer adressen på `x`, og `*foo` er værdien, `foo` peger på. En pointer skal have en værdi, før den må dereferences: `int *x; *x=3;` er “ERROR! Overrode the value located in some address!”, mens `int foo; int *x; x = &foo; *x=3;` er i orden (s. 8). Slide 9 viser pointere til pointere: `int **y` peger på en `int*`, som peger på en `int`.',
            'Et arraynavn er “basically a const pointer” til første element, og `[]` virker også på pointere (s. 10). `int A[5];` giver en blok på 5 × 4 bytes på stacken. **Pointeraritmetik** (s. 11): `+`, `-`, `++`, `--`, `+=` og `-=` virker på pointere, og en inkrementering flytter pointeren med størrelsen af den type, den peger på. Med `int a[5]; int *ptr = a;` er `*ptr` = `a[0]`, `*(ptr+2)` = `a[2]` og `*(ptr+4)` = `a[4]`.',
            'Weiss (1.5.1, s. 21–23) tilføjer `->` til at tilgå medlemmer gennem en pointer og slår fast, at pointer-sammenligning sammenligner **adresser**: to pointere er kun ens, hvis de peger på samme objekt.',
          ],
        },
        {
          term: 'Faldgruber: segfault, dangling pointer, memory leak',
          body: [
            '**Segmentation fault** (s. 13): at skrive gennem en uinitialiseret pointer (`int *p; *p = 3;`), en `NULL`-pointer (`int *p = NULL; *p = 4;`) eller en slettet pointer (`int *p = new int; delete p; *p = 5;`). “All of these cases end up with segmentation fault!”',
            '**Dangling pointer** (s. 14): `p` og `q` peger på samme heap-blok; `delete q;` frigiver blokken, og `*p = 3;` er nu en ulovlig tildeling, fordi `p` peger på frigivet hukommelse.',
            '**Memory leak** (s. 15–16): `int *p = new int; p = NULL;` fjerner den eneste reference til blokken, før den er frigivet, så den kan aldrig ryddes op. Reglen er “Must free memory block before changing reference”. Kurset anbefaler `valgrind` til at finde lækager.',
            '**Safe delete** (s. 12): `if (0 != p){ delete p; p=0; }` — og “DO NOT DELETE A POINTER NOT ALLOCATED BY new”. I SYS løses de samme problemer strukturelt med [[sys/raii|RAII]] og [[sys/smart-pointers|smart pointers]]; de indgår ikke i DOA-materialet.',
          ],
        },
        {
          term: 'Lvalues, rvalues og referencer',
          body: [
            'En **lvalue** er et udtryk, der identificerer et ikke-midlertidigt objekt (et variabelnavn); en **rvalue** identificerer et midlertidigt objekt eller en værdi, der ikke er knyttet til et objekt (L01 s. 35–36; Weiss s. 23). I `vector<string> arr( 3 ); const int x = 2; int y; int z = x + y; string str = "foo";` er `arr`, `str`, `x`, `y`, `z` lvalues og `2`, `"foo"`, `x+y` rvalues. Slide 35 spørger, om der er en rvalue i `vector<string> arr(3);` — efter Weiss’ regel om literaler (s. 23) er `3` en rvalue.',
            'En **reference** (`&` efter typen) er et alias for en lvalue (s. 33): `string & rstr = str; rstr += \'o\';` ændrer `str` til `"hello"`, og `&str == &rstr` er sand. `string & bad1 = "hello";`, `string & bad2 = str + "";` og `string & sub = str.substr( 0, 4 );` er ulovlige, fordi højresiden ikke er en (modificerbar) lvalue.',
            'Hvorfor referencer? Slide 34 (= Weiss s. 24) viser `auto & whichList = theLists[ myhash( x, theLists.size( ) ) ];` fra hashtabellen i [[separate-chaining|separate chaining]]. Uden `&` ville `auto` lave en **kopi**, og `push_back` ville ramme kopien, ikke listen i tabellen. Weiss nævner to andre brug: `for( auto & x : arr ) ++x;` i en range-for og `auto & x = findMax( arr );` for at undgå en kopi (s. 24–25).',
          ],
        },
        {
          term: 'Templates og initializer lists',
          body: [
            'En template er “a template or blueprint for creating a generic class or function” og er ikke selv en klasse (s. 17). Kun **instansieringen** kan oversættes: `Box<int> intBox(123);` får compileren til at generere og oversætte en `Box` med `int value;` (s. 18–19). Det kaldes *instantiation-style polymorphism*; den afgøres ved compile-time, er effektiv og giver typetjek ved oversættelse (s. 21). Funktionstemplates virker på samme måde: `template<typename T> T add(T a, T b)` (s. 20).',
            'Weiss’ eksempel er `MemoryCell<Object>` (1.6.2, s. 38, figur 1.21), som kursets kode også har i `MemoryCell.h`: `MemoryCell<int> m1;` og `MemoryCell<string> m2{ "hello" };`. Parametre er `const Object &`, fordi `Object` kan være en stor klassetype.',
            '**Initializer list** er delen efter `:` og før konstruktørens krop, fx `Box(T v) : value(v) {}`. Den initialiserer medlemmet direkte i stedet for først at default-konstruere og derefter tildele (s. 22). Den bruges også til at kalde basisklassens konstruktør (`Derived(int x, int y) : Base(x)`) og til at initialisere arrays (`arr{1, 2, 3, 4, 5}`) (s. 23). `()` er direkte initialisering og tillader narrowing; `{}` er list initialization og forhindrer den: `int x = 1.5;` giver 1, `int x{1.5};` er en fejl (s. 24–26).',
          ],
        },
        {
          term: 'STL-containere og vector',
          body: [
            'STL består ifølge slidet af 10 containerklasser i tre grupper (s. 27–29): **sequence** (`vector`, `deque`, `list` — data efter position), **adapter** (`stack`, `queue`, `priority_queue` — bygget oven på en anden container) og **associative** (`set`, `multiset`, `map`, `multimap` — data efter nøgle).',
            'En `vector` er en template-klasse over et dynamisk array: elementer tilgås med indeks 0 til n−1, og den kan vokse og skrumpe i enden samt indsætte og fjerne midt i uden, at man selv skriver koden til at flytte elementer (s. 30–31). Slide 32 bruger `push_back(10)`, `push_back(20)`, `push_back(30)`, `numbers[0]`, `numbers.at(1)`, en range-for, `numbers[1] = 25;`, `pop_back()`, `numbers.insert(numbers.begin() + 1, 15);` og `numbers.erase(numbers.begin() + 2);`.',
            'Weiss’ egen `Vector` (3.4, s. 86–91; kursets `Vector.h`) viser, hvad der ligger under: tre datamedlemmer `theSize`, `theCapacity` og `Object * objects`. `push_back` kalder `reserve( 2 * theCapacity + 1 )`, når arrayet er fuldt; `reserve` allokerer et nyt array, flytter de gamle elementer over med `std::move` og sletter det gamle (s. 89).',
          ],
        },
        {
          term: 'Iteratorer og begin/end',
          body: [
            'En iterator er “an object that can iterate over elements” og repræsenterer en position i en container; den giver en ensartet grænseflade uanset containertype og er “somewhat analogous to pointers, but with additional functionality and safety features” (s. 37–38).',
            'Operatorerne (s. 39–43) på `std::vector<int> numbers = {10, 20, 30, 40};`: `*it` giver elementet (`numbers.begin()` → 10); `++it` går til næste; `--it` går tilbage og findes kun for **bidirectional** og **random access** iteratorer — fra `numbers.end()` på en `std::list` giver første `--it` 40 og næste 30; `==` og `!=` sammenligner positioner, og løkken `while (it != numbers.end())` skriver alle fire; `+`, `-` og `[]` findes kun for random access iteratorer (`vector`, `deque`): `it += 2` giver 30, og `it[-2]` giver 10.',
            '`end()` peger **efter** sidste element (s. 41; Weiss s. 82: “the endmarker … the position after the last item”). Intervaller er derfor fra og med `begin` til, men ikke med, `end`: `erase( start, end )` “removes all items beginning at position start, up to, but not including end” (Weiss s. 83). En tom container har `begin() == end()`.',
            'I Weiss’ `Vector` er iteratoren bare en pointer: `typedef Object * iterator;`, `begin()` returnerer `&objects[ 0 ]` og `end()` returnerer `&objects[ size( ) ]` (figur 3.8, s. 90). Derfor opfører `++`, `*` og `+` på en vector-iterator sig præcis som pointeraritmetikken på s. 11. `const_iterator` returnerer en konstant reference ved `*itr`, og compileren vælger den selv på en `const` container (s. 84–85).',
            '`erase( itr )` returnerer positionen efter det slettede element og gør `itr` ugyldig (“stale”) (s. 83). Derfor skriver Weiss `itr = lst.erase( itr );` i `removeEveryOtherItem` (figur 3.5, s. 84), som tager lineær tid på en `list` men kvadratisk tid på en `vector`, fordi hver `erase` i en vector er O(N) — se [[lister|Lister: array vs. linked]].',
          ],
        },
      ],
      viz: 'doa-iterators',
      keyPoints: [
        'Stack: lokale variable, automatisk oprydning, LIFO. Heap: `new`/`delete`, programmørens ansvar (L01 s. 5–6, 12).',
        '`&x` er adressen, `*p` er værdien; `ptr + 2` flytter to elementer, ikke to bytes (s. 7, 11).',
        'Uinitialiseret, `NULL` eller slettet pointer → segfault; `delete` gennem én af to pointere → dangling; ny værdi før `delete` → leak (s. 13–15).',
        'En reference er et alias for en lvalue; `auto &` undgår en kopi, `auto` alene laver en (s. 33–34).',
        'Templates instansieres ved compile-time: `Box<int>` bliver til en konkret klasse (s. 17–21).',
        'Iteratorer: `*`, `++`, `--` (bidirectional), `==`/`!=`, `+`/`-`/`[]` (random access) (s. 39–43).',
        '`end()` er positionen **efter** sidste element; `erase(start, end)` tager ikke `end` med (Weiss s. 82–83).',
        'Kompleksitet (Weiss s. 80–81): `vector` indeksering `operator[]` “constant time” · bedste/gennemsnit/værste ikke angivet separat · plads ikke angivet.',
        'Kompleksitet (Weiss s. 81, 83, 89): `push_back`/`pop_back` “constant time” for både `vector` og `list`; `insert`/`erase` midt i er konstant for `list` men ikke for `vector` (O(N) pr. `erase`, s. 83); når en `vector` er fuld, kopierer `reserve` alle elementer · amortiseret tid og plads ikke angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Dangling pointer, memory leak og safe delete (uddrag, tre slides)',
          source: 'Pointers iterators and searching.pdf s. 12, 14, 15',
          code: `{   // s. 14: dangling pointer
    int *p, *q;
    p = new int;
    q = p;
    delete q;
    *p = 3; //illegal assignment!
}
{   // s. 15: memory leak
    int *p = new int;
    p = NULL;//or a new other value
}
{   // s. 12: safe delete
    int *p = new int;
    if (0 != p){
        delete p;
        p=0;
    }
}`,
        },
        {
          lang: 'cpp',
          title: 'Random access-iterator: += og []',
          source: 'Pointers iterators and searching.pdf s. 43',
          code: `#include <iostream>
#include <vector>

int main() {
    std::vector<int> numbers = {10, 20, 30, 40};

    std::vector<int>::iterator it = numbers.begin();

    it += 2;  // Move the iterator forward by 2 positions
    std::cout << "Third element: " << *it << std::endl;

    std::cout << "First element (using []): " << it[-2] << std::endl;

    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Vector: iteratoren er en pointer (uddrag)',
          source: 'Vector.h (kildekode_part7.md); Weiss s. 90, fig. 3.8',
          code: `      // Iterator stuff: not bounds checked
    typedef Object * iterator;
    typedef const Object * const_iterator;

    iterator begin( )
      { return &objects[ 0 ]; }
    const_iterator begin( ) const
      { return &objects[ 0 ]; }
    iterator end( )
      { return &objects[ size( ) ]; }
    const_iterator end( ) const
      { return &objects[ size( ) ]; }`,
        },
      ],
      exam: [
        'En pointer gemmer en adresse, og `*p` følger den. En reference er et alias, der skal bindes til en lvalue og ikke kan omdirigeres. En iterator er en position i en container med pointerlignende operatorer; i Weiss’ `Vector` er den bogstaveligt talt en `Object *`.',
        'Heap-hukommelse lever, til nogen kalder `delete`. Sletter man gennem én pointer, bliver alle andre pointere til blokken dangling; flytter man den eneste pointer, før man sletter, lækker blokken.',
        '`end()` peger efter sidste element, så en løkke kører `while (it != c.end())`, og `erase(start, end)` fjerner fra og med `start` til, men ikke med, `end`. Efter `erase(itr)` er `itr` ugyldig, så man bruger returværdien.',
        'Sådan løser du ‘hvad sker der i denne pointerkode’: 1) tegn hver lokal variabel som en boks på stacken; 2) tegn hver `new` som en boks på heapen; 3) tegn hver tildeling `p = …` som en pil; 4) ved `delete` krydses heap-boksen ud — alle pile dertil er nu dangling; 5) en heap-boks uden pile er en leak; 6) dereference af uinitialiseret, `NULL` eller slettet pointer er segfault. (Opgavetype udledt af eksemplerne i L01 s. 8, 13–15, ikke af eksamenssæt.)',
        'Sådan løser du ‘hvad peger iteratoren på’: skriv containeren som indekseret array, sæt `begin()` = 0 og `end()` = size, og følg hver `++`, `--`, `+= k` og `it[k]` som indeksregning. `--` kræver bidirectional og `+=`/`[]` random access. (Udledt af slide-eksemplerne L01 s. 39–43.)',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture01_Pointers_Iterators_Searching.md'), original: 'Pointers iterators and searching.pdf', pages: 's. 3–43' },
        { path: k('context/book/AOD_Ch01-03_Intro_CPP_and_Searching.md'), original: BOOK, pages: 's. 21–25', note: '1.5.1 Pointers, 1.5.2 Lvalues, rvalues and references' },
        { path: k('context/book/AOD_Ch01-03_Intro_CPP_and_Searching.md'), original: BOOK, pages: 's. 38', note: '1.6.2 Class templates, figur 1.21 MemoryCell' },
        { path: k('context/book/AOD_Ch01-03_Intro_CPP_and_Searching.md'), original: BOOK, pages: 's. 80–91', note: '3.3 vector og list i STL, 3.3.1 iteratorer, 3.3.3 const_iterator, 3.4 implementation af vector' },
        { path: k('context/kode/kildekode_part7.md'), note: 'Vector.h' },
        { path: k('context/kode/kildekode_part4.md'), note: 'MemoryCell.h' },
        { path: k('context/kode/kildekode_part8.md'), note: 'Fig01_11.cpp (IntCell via pointer), Fig01_21.cpp (MemoryCell)' },
        { path: k('context/videos/SW2ADS_Video_Week01_STL_Vector.md'), original: 'week1 C++ Tutorial  Using the STL stdvector.txt', note: 'push_back, range-for med const &, erase(begin()+1, end()-1)' },
      ],
      gaps: [
        'Lektionen hedder “Pointers, iterators and searching”, og markdown-titlen gentager det, men den originale PDF (43 slides) har ingen slides om søgning. Bogudsnittet `AOD_Ch01-03_Intro_CPP_and_Searching.md` har heller ingen søgning; binær søgning (Weiss 2.4.4) ligger i `AOD_Ch02-03_BigO_ADT.md`.',
        'Slide 40 (“Increment Operator (++)”) viser samme kode som slide 39 — der er ingen `++` i eksemplet. Markdown-konverteringen (afsnit 10.4) gentager fejlen.',
        'Kursets `Vector.h` har `static const int SPARE_CAPACITY = 2;` og bounds-check i `operator[]` samt `UnderflowException` i `pop_back`/`back`; Weiss’ figur 3.8 har `SPARE_CAPACITY = 16` og ingen tjek. Markdown-bogudsnittet følger bogen (16).',
        'Bogudsnittets markdown påstår “amortiseret O(1)” for `push_back` med beviset 1 + 2 + 4 + … + n = 2n − 1. Det står ikke i Weiss 3.4; bogen siger kun, at `push_back` er “constant time” (s. 81), og at udvidelse af kapaciteten er “very expensive” (s. 89). Amortiseret analyse er ikke dækket af pensum i disse udsnit.',
        'Markdown-konverteringen af L01 tilføjer punkter, der ikke står på slides: “References cannot be null”, “Key benefits of references”, en appendix med “double free” og “`delete` vs. `delete[]`”, og et `std::list`-eksempel til `--`, der dog findes på slide 41. Brug slides.',
        'Slide 35 stiller spørgsmålet “Is there a rvalue for `vector<string> arr(3);`?” uden svar. Svaret her (`3` er en rvalue) er udledt af Weiss’ regel om literaler (s. 23).',
        'Ordet “halvåbent interval” bruges ikke i materialet; Weiss beskriver det som “up to, but not including end” (s. 83).',
        'Iteratorkategorierne nævnes kun i forbifarten (bidirectional og random access, s. 41 og 43); forward/input/output iteratorer er ikke dækket af pensum.',
        'Smart pointers og RAII indgår ikke i DOA-materialet; Weiss’ `IntCell` med big five (Fig01_18.cpp) er det nærmeste.',
      ],
      keywords: ['ADS', 'AOD', 'SW2ADS', 'DOA', 'pointer', 'peger', 'reference', 'alias', 'iterator', 'begin', 'end', 'endmarker', 'halvåbent interval', 'const_iterator', 'random access iterator', 'bidirectional iterator', 'dereference', 'address-of', '&', '*', '->', 'pointer arithmetic', 'pointeraritmetik', 'stack', 'heap', 'stack frame', 'new', 'delete', 'delete[]', 'nullptr', 'NULL', 'segmentation fault', 'segfault', 'dangling pointer', 'memory leak', 'hukommelseslæk', 'valgrind', 'lvalue', 'rvalue', 'auto &', 'template', 'skabelon', 'instantiation-style polymorphism', 'initializer list', 'narrowing', 'brace initialization', 'STL', 'container', 'sequence container', 'adapter container', 'associative container', 'vector', 'std::vector', 'Vector.h', 'push_back', 'pop_back', 'insert', 'erase', 'reserve', 'capacity', 'SPARE_CAPACITY', 'MemoryCell', 'IntCell', 'removeEveryOtherItem'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'soegning',
      title: 'Lineær og binær søgning',
      short: 'Søgning',
      week: 'Lektion 2, 8 og 12',
      definition:
        '**Lineær søgning** kigger elementerne igennem fra venstre mod højre og tager lineær tid. **Binær søgning** kræver et **sorteret** array: den sammenligner med midterelementet og fortsætter i kun den ene halvdel, så søgeområdet halveres pr. trin og tiden bliver O(log N). Kurset møder søgning i Lektion 2 (Mentimeter og ordbogsrefleksionen), gennemgår binær søgning trin for trin i Lektion 8 og bruger den som eksempel på *reduction* i Lektion 12.',
      concepts: [
        {
          term: 'Lineær søgning',
          body: [
            'Weiss: “The obvious solution consists of scanning through the list from left to right and runs in linear time” — men den udnytter ikke, at listen er sorteret (s. 67). I STL er det `find( begin( c ), end( c ), x )`, som returnerer `end( c )`, hvis `x` ikke findes; kurset bruger mønstret `if( find( … ) != end( whichList ) )` på L01 s. 34 (Weiss s. 24).',
            'Weiss skriver om begge STL-lister: “Both vector and list are inefficient for searches” (s. 81), og L08 s. 3 konkluderer, at man med de hidtidige datastrukturer “can only perform these operations in linear time, which is not fast enough for large inputs”.',
          ],
        },
        {
          term: 'Binær søgning i Weiss (figur 2.9)',
          body: [
            'Problemet (s. 67): givet `X` og heltal `A0, A1, …, AN−1`, som er **presorted and already in memory**, find `i` så `Ai = X`, eller returnér −1. Strategien er at tjekke midterelementet; er `X` mindre, fortsæt i venstre halvdel, er den større, i højre.',
            'Koden (`Fig02_09.cpp`) holder `low = 0` og `high = a.size( ) - 1`, og så længe `low <= high` beregnes `mid = ( low + high ) / 2`. Er `a[ mid ] < x`, sættes `low = mid + 1`; er `a[ mid ] > x`, sættes `high = mid - 1`; ellers returneres `mid`. Når `low > high`, returneres `NOT_FOUND` (−1). Det er “two comparisons per level”.',
            'Testprogrammet fylder `a[ i ] = i * 2` for `SIZE = 8`, altså `0, 2, 4, …, 14`, og søger efter `j = 0 … 15`. Lige tal findes på indeks `j / 2`; ulige tal giver −1.',
          ],
        },
        {
          term: 'Kursets gennemgang: low, mid og high (L08)',
          body: [
            'L08 s. 4–16 går trin for trin gennem `int sorted_temp_readings[DAY_COUNT] = {9, 16, 18, 28, 32, 35};` med “check value” 28. Start: `low` = indeks 0 (9), `high` = indeks 5 (35). 28 ligger mellem 9 og 35, så midten beregnes: `(0+5)/2 = 2`, værdi 18 (s. 7–8).',
            '28 er større end 18, så `low` sættes til `mid` (2), og `high` sænkes med én til 4 (32) — “because we already checked if the high value equals the check value” (s. 9–10). 28 ligger mellem 18 og 32; `(2+4)/2 = 3`, værdi 28 (s. 11–12).',
            'Slide 14 har en bemærkning: man *kunne* stoppe her, fordi tjekværdien er lig midterværdien, men så skal programmet have et ekstra lighedstest. I stedet sættes en grænse til `mid`, og lighed testes mod grænserne i starten af løkken. `low` bliver 3, `high` sænkes til 3 (s. 15), og da 28 er lig både low- og high-værdien, er resultatet “check value FOUND” (s. 16).',
            'L08 kalder binær søgning “an example of a divide-and-conquer strategy” (s. 5). L12 s. 10–11 præciserer, at binær søgning er en rekursiv algoritme, der ikke nødvendigvis er divide-and-conquer, men “merely reduce[s] the original problem to a simpler case”: “Search space is halved per step. The other half is never visited.” Se [[designteknikker|Greedy, divide and conquer og backtracking]].',
          ],
        },
        {
          term: 'Rekursiv version (L12)',
          body: [
            'L12 s. 11 viser en rekursiv `binarySearch(int arr[], int low, int high, int x)`: hvis `high >= low`, beregn `mid = low + (high - low) / 2`; returnér `mid` ved lighed, søg i `low … mid - 1`, hvis `arr[mid] > x`, ellers i `mid + 1 … high`. Er intervallet tomt, returneres −1.',
            'Driveren søger efter `query = 90` i `{ 2, 3, 4, 10, 40 }`. Med `n = 5` bliver kaldene `(0, 4)` → mid 2 (4 < 90) → `(3, 4)` → mid 3 (10 < 90) → `(4, 4)` → mid 4 (40 < 90) → `(5, 4)`, som er tomt: “Element is not present in array”.',
            'Rekursionen er halerekursiv og svarer til Weiss’ løkke; se [[rekursion|Rekursion]] for rekurrensligninger.',
          ],
        },
        {
          term: 'Hvorfor O(log N)',
          body: [
            'Weiss’ generelle regel (2.4.4, s. 66): “An algorithm is O(log N) if it takes constant (O(1)) time to cut the problem size by a fraction (which is usually 1/2).” Tager det konstant tid bare at gøre problemet én mindre, er algoritmen O(N).',
            'For binær søgning (s. 68): arbejdet i løkken er O(1) pr. gennemløb. Løkken starter med `high - low = N − 1` og slutter, når `high - low ≥ −1`; hver gang mindst halveres forskellen, så antallet af gennemløb er højst ⌈log(N − 1)⌉ + 2. Eksempel: med `high - low = 128` er de største værdier efter hvert gennemløb 64, 32, 16, 8, 4, 2, 1, 0, −1.',
            'Weiss’ eksempel fra kemien: det periodiske system med ca. 118 grundstoffer kræver højst otte opslag med binær søgning (s. 68). Se tabellen i [[big-o|Big-O, Ω og Θ]], hvor log n kun når 10 ved n = 1024 (L02 s. 19).',
          ],
        },
        {
          term: 'Sorteret array som datastruktur',
          body: [
            'Weiss kalder binær søgning “our first data-structure implementation”: `contains` er O(log N), men alle andre operationer, især `insert`, er O(N) (s. 68). Det passer til statiske data, der sorteres én gang og derefter slås op i mange gange.',
            'L08 s. 17 spørger: “What is the time complexity of insert and delete in a sorted array?” Den dynamiske løsning er et søgetræ: se [[bst|Binære søgetræer]] og [[avl|AVL-træer]], hvor L08 s. 34 spørger, hvornår man vælger et sorteret array frem for et BST.',
            'I Menti-opgaven L02 s. 7–8 er binær søgning byggestenen i “Method 2” og “Method 3” til at finde elementer fra `B` i `A`: først sorteres `A` (M·log M), derefter en binær søgning pr. element i `B` (log M hver). Se [[loekkeanalyse|Analyse af løkker]].',
          ],
        },
      ],
      viz: 'doa-binary-search',
      keyPoints: [
        'Lineær søgning scanner fra venstre mod højre: lineær tid, og ingen forudsætning om sortering (Weiss s. 67).',
        'Binær søgning kræver et **sorteret** array i hukommelsen og halverer søgeområdet pr. trin.',
        'Weiss: `low = mid + 1` hvis `a[mid] < x`, `high = mid - 1` hvis `a[mid] > x`, ellers fundet; stop når `low > high` (figur 2.9).',
        'L08’s gennemgang på `{9, 16, 18, 28, 32, 35}` finder 28 via mid = 2 (18) og mid = 3 (28) (s. 5–16).',
        'Regel: konstant arbejde for at halvere problemet → O(log N); konstant arbejde for at skrumpe det med én → O(N) (Weiss s. 66).',
        'Sorteret array: hurtig `contains`, men `insert` er O(N) — velegnet til statiske data (Weiss s. 68).',
        'Kompleksitet (Weiss s. 67; L08 s. 3): lineær søgning bedste ikke angivet · gennemsnit ikke angivet · værste O(N) (“linear time”) · plads ikke angivet.',
        'Kompleksitet (Weiss s. 68): binær søgning (`contains`) bedste ikke angivet · gennemsnit ikke angivet · værste O(log N), højst ⌈log(N − 1)⌉ + 2 gennemløb · plads ikke angivet.',
        'Kompleksitet (Weiss s. 68): `insert` i sorteret array bedste ikke angivet · gennemsnit ikke angivet · værste O(N) · plads ikke angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Binær søgning, iterativ (Weiss figur 2.9)',
          source: 'Fig02_09.cpp (kildekode_part8.md); Weiss s. 67, fig. 2.9',
          code: `#include <iostream>
#include <vector>
using namespace std;

const int NOT_FOUND = -1;

/**
 * Performs the standard binary search using two comparisons per level.
 * Returns index where item is found or -1 if not found
 */
template <typename Comparable>
int binarySearch( const vector<Comparable> & a, const Comparable & x )
{
    int low = 0, high = a.size( ) - 1;

    while( low <= high )
    {
        int mid = ( low + high ) / 2;

        if( a[ mid ] < x )
            low = mid + 1;
        else if( a[ mid ] > x )
            high = mid - 1;
        else
            return mid;   // Found
    }
    return NOT_FOUND;     // NOT_FOUND is defined as -1
}

// Test program
int main( )
{
    const int SIZE = 8;
    vector<int> a( SIZE );

    for( int i = 0; i < SIZE; ++i )
        a[ i ] = i * 2;

    for( int j = 0; j < SIZE * 2; ++j )
        cout << "Found " << j << " at " << binarySearch( a, j ) << endl;

    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Binær søgning, rekursiv (“reduction”)',
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
      ],
      exam: [
        'Lineær søgning virker på alt, men tager lineær tid. Binær søgning kræver, at data er sorteret og ligger i et array med konstant-tids indeksering; så halverer hvert trin søgeområdet, og køretiden bliver O(log N).',
        'Argumentet for O(log N): hvert gennemløb koster O(1), og `high - low` mindst halveres hver gang. Fra N kan man kun halvere cirka log N gange, før intervallet er tomt.',
        'Et sorteret array er godt til statiske data med mange opslag, fordi det sorteres én gang. Skal der indsættes og slettes løbende, koster hver `insert` O(N), og et balanceret søgetræ er bedre.',
        'Sådan løser du ‘udfør binær søgning i hånden’: 1) skriv arrayet med indeks under; 2) sæt `low = 0`, `high = n − 1`; 3) beregn `mid = (low + high) / 2` med heltalsdivision og sammenlign `a[mid]` med x; 4) opdatér `low = mid + 1` eller `high = mid − 1` (Weiss) og skriv én linje pr. trin i en tabel low/high/mid/a[mid]; 5) stop ved lighed eller når `low > high` (−1). Angiv hvilken variant du følger — L08’s gennemgang sætter `low = mid` og sænker `high` med én. (Opgavetype udledt af gennemgangen L08 s. 5–16 og refleksionen s. 17, ikke af eksamenssæt.)',
        'Sådan løser du ‘argumentér for, at binær søgning er bedre end O(n)’: 1) arbejdet pr. gennemløb er konstant; 2) intervallets længde mindst halveres; 3) efter k gennemløb er længden højst N/2^k; 4) løkken stopper, når den er under 1, dvs. efter omkring log₂ N gennemløb. (Refleksionsspørgsmål L08 s. 17 og s. 32.)',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture08_SearchTrees.md'), original: 'Lecture08.pdf', pages: 's. 3–17', note: 'Binær søgning trin for trin og refleksion' },
        { path: k('context/lessons/SW2ADS_Lecture12_Algorithm_Design_Techniques.md'), original: 'Lecture12.pdf', pages: 's. 10–11', note: 'Binær søgning som reduction, rekursiv kode' },
        { path: k('context/lessons/SW2ADS_Lecture02_BigO_ADT.md'), original: 'Lecture02.pdf', pages: 's. 7–10, 28', note: 'Menti “items from B in A” og ordbogsrefleksionen' },
        { path: k('context/book/AOD_Ch02-03_BigO_ADT.md'), original: BOOK, pages: 's. 66–68', note: '2.4.4 Logarithms in the running time — binary search, figur 2.9' },
        { path: k('context/book/AOD_Ch01-03_Intro_CPP_and_Searching.md'), original: BOOK, pages: 's. 24, 81', note: '`find` på en liste; “inefficient for searches”' },
        { path: k('context/kode/kildekode_part8.md'), note: 'Fig02_09.cpp' },
      ],
      gaps: [
        'Lektion 1 hedder “Pointers, iterators and searching”, men PDF’en indeholder ingen søgning. Lineær søgning har hverken slide eller kode i kurset; den står kun i én sætning hos Weiss (s. 67) og som `find` i L01 s. 34.',
        'L08’s gennemgang (s. 5–16) følger ikke Weiss’ kode: den sammenligner tjekværdien med low- og high-*værdierne*, sætter `low = mid` (ikke `mid + 1`) og sænker `high` med én, fordi high-værdien allerede er tjekket. Der er ingen kode til L08-varianten. Weiss (figur 2.9) og L12 s. 11 bruger `low = mid + 1` / `high = mid − 1`.',
        'Slides angiver ingen køretid for binær søgning. L08 s. 17 og s. 32 stiller det som spørgsmål (“why … better than O(n)?”, “complexity of insert and delete in a sorted array?”). Markdown-konverteringen af L08 skriver “Tidskompleksitet: O(log n)” og svaret O(n) på spørgsmål 2 som om det stod på slides; det gør det ikke. Kilden er Weiss s. 68.',
        'Bedste og gennemsnitlige tilfælde for søgning er ikke angivet i materialet (heller ikke at binær søgning kan finde elementet i første gennemløb). Pladsforbrug er ikke angivet.',
        'Bogudsnittets markdown (`AOD_Ch02-03_BigO_ADT.md`) har et gennemregnet eksempel på `[1, 3, 5, 7, 9, 11, 13]`, der ikke findes i Weiss. Brug L08’s array eller `Fig02_09.cpp`.',
        'L08 s. 5 kalder binær søgning “divide-and-conquer”; L12 s. 10 siger, at den “merely reduce[s] the original problem to a simpler case” og ikke nødvendigvis er divide-and-conquer.',
        'Uden for materialet: `(low + high) / 2` kan give overløb for meget store `int`-indeks; L12’s kode bruger `low + (high - low) / 2`, men ingen af kilderne forklarer hvorfor.',
      ],
      keywords: ['søgning', 'search', 'linear search', 'lineær søgning', 'sekventiel søgning', 'sequential search', 'binary search', 'binær søgning', 'binarySearch', 'low', 'mid', 'high', 'NOT_FOUND', 'check value', 'sorted array', 'sorteret array', 'find', 'std::find', 'contains', 'O(log N)', 'logaritmisk', 'halvering', 'reduction', 'divide and conquer', 'Fig02_09', 'sorted_temp_readings', 'ordbog', 'dictionary'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'big-o',
      title: 'Big-O, Ω og Θ',
      week: 'Lektion 2',
      definition:
        '**Big-O** siger, at en funktion højst vokser som en anden, op til en konstant og for store N: f(N) er O(g(N)), hvis der findes konstanter c > 0 og n₀, så 0 ≤ f(N) ≤ c·g(N) for alle N ≥ n₀. Kurset bruger det til at udtrykke køretid og plads som funktion af én primær parameter N, typisk i værste tilfælde, og ignorerer konstanter og lavere led. **Ω** (nedre grænse) og **Θ** (samme vækst) defineres i Weiss, ikke på slides.',
      concepts: [
        {
          term: 'Model og primær parameter',
          body: [
            'Kurset adskiller analyse fra implementering: hvad er den abstrakte operation (tid), og hvad er hukommelsesenheden (plads)? Modellen er, at simple operationer tager 1 tidsenhed og simple variable 1 lagerenhed, og man tæller for ideelt input (**best case**), tilfældigt input (**average case**) og dårligt input (**worst case**) (L02 s. 5, 15).',
            'De fleste algoritmer har en **primær parameter** N, der påvirker køretiden mest — polynomiets grad, filens størrelse, strengens længde, billedets dimensioner. Har man flere, udtrykker man den ene som funktion af den anden. Målet er at skrive alle ressourcer som en funktion T af N, “typically in the worst case” (s. 17).',
            'Weiss’ model er den samme: en almindelig computer, hvor alt simpelt tager præcis én tidsenhed, med faste heltal og uendelig hukommelse (2.2, s. 54). Han definerer T_avg(N) og T_worst(N) med T_avg(N) ≤ T_worst(N); best case er “often of little interest”, og worst case er standard, fordi det er en garanti for alt input (s. 54–55).',
          ],
        },
        {
          term: 'Hvorfor ikke bare måle?',
          body: [
            'Empirisk analyse har faldgruber (s. 12): det tager tid at implementere alle algoritmer, og man skal vælge input (real, good, random, ideal, perverse) og platform (compiler, CPU, hukommelse, OS). Slide 13 viser det med `count.c`: tre indlejrede løkker til N = 1000 giver `count = 1000000000` på 2260 ms uden optimering og 0 ms med `-O1`.',
            'Slide 44 advarer: forskelle i processor, hukommelse, compiler og OS; processorer, der skruer op afhængigt af miljøet; svært at vælge realistisk workload; fristende at benchmarke under optimistiske forhold. Videoen om Big-O gør samme pointe med Alice og Bob: tidsmålinger er “machine dependent” (week2).',
          ],
        },
        {
          term: 'Definitionen af O',
          body: [
            'L02 s. 30: “A function f(N) is said to be O(g(N)) if there exist constants c and n₀ such that 0 ≤ f(N) ≤ c·g(N) for c > 0 and all N ≥ n₀.” Slide 31 giver en grænseværdi-version: f(N) er O(g(N)), hvis lim f(N)/g(N) for N → ∞ ligger i [0, ∞).',
            'Weiss’ definition 2.1 (s. 51): T(N) = O(f(N)), hvis der findes positive konstanter c og n₀, så T(N) ≤ c·f(N) når N ≥ n₀. Eksempel (s. 52): 1.000N er større end N² for små N, men N² vokser hurtigere; med n₀ = 1.000 og c = 1 (eller n₀ = 10 og c = 100) er 1.000N = O(N²).',
            'O er en **øvre grænse**: f(N) = O(g(N)) betyder, at f ikke vokser hurtigere end g. Derfor er g(N) = 2N² både O(N⁴), O(N³) og O(N²), men O(N²) er det bedste svar (s. 52). Weiss kalder det “very bad style” at skrive O(2N²) eller O(N² + N); svaret er O(N²). f(N) ≤ O(g(N)) er dårlig stil, og f(N) ≥ O(g(N)) giver ingen mening (s. 53).',
          ],
        },
        {
          term: 'Ω, Θ og o (Weiss)',
          body: [
            'Weiss’ fire definitioner (s. 51): **Ω** — T(N) = Ω(g(N)), hvis der findes positive c og n₀, så T(N) ≥ c·g(N) når N ≥ n₀. **Θ** — T(N) = Θ(h(N)), hvis og kun hvis T(N) = O(h(N)) og T(N) = Ω(h(N)). **little-o** — T(N) = o(p(N)), hvis T(N) < c·p(N) for *alle* positive c fra et n₀; mindre formelt O men ikke Θ.',
            'Som uligheder mellem vækstrater (s. 52): O er ≤, Ω er ≥, Θ er =, o er <. Er T(N) = O(f(N)), er f(N) = Ω(T(N)). N² og 2N² vokser lige hurtigt, så begge er O og Ω af hinanden; at skrive g(N) = Θ(N²) siger ikke kun O(N²), men at grænsen er “as good (tight) as possible”.',
            'Grænseværdimetoden (s. 53): lim f(N)/g(N) = 0 → f = o(g); = c ≠ 0 → f = Θ(g); = ∞ → g = o(f); findes ikke → ingen relation.',
            'Slides bruger Θ og Ω senere uden at definere dem: “complexity Θ(V²)” og “space Θ(|V|+|E|)” (L09 s. 16–17), “at least Ω(n log n) comparisons in the worst case” og “log(N!) = Ω(n lg n)” (L06 s. 24, 28), “Runtime: Θ(n²)” (L13 s. 10–11). Se [[sortering-nedre-graense|Nedre grænse for sortering]].',
          ],
        },
        {
          term: 'Kun det dominerende led',
          body: [
            'L02 s. 18 og 32 spørger: en algoritme tager (n + 1)² skridt — hvorfor kalde den O(n²) og ikke O((n + 1)²)? Første plot viser, at n² altid ligger *under* (n + 1)². Men da hvert skridt har en ukendt konstant pris c, kan man vælge c = 2: plottet af 2n² ligger over (n + 1)² for store n. “This is why it is often enough, in the worst case analysis, to consider the terms with the highest order”.',
            'Slide 22: “it is likely that the runtime of a program will involve constants and minor terms. We ignore those and consider only the dominant term.” Weiss’ regler (s. 52–53): **1)** T1 + T2 = O(max(f, g)) og T1·T2 = O(f·g); **2)** et polynomium af grad k er Θ(Nᵏ); **3)** logᵏ N = O(N) for enhver konstant k — logaritmer vokser meget langsomt.',
            'Videoen i week2 viser samme konstruktion for f(n) = 3n² + 5n + 4: med c = 3 er c·n² endnu ikke over f, med c = 4 er den; ingen konstant gør c·n større end f for store n, så f er ikke O(n). En anden video beviser log₂(n³) = O(log₂ n) med c = 4 og k = 1: log₂(n³) = 3·log₂ n ≤ 4·log₂ n.',
          ],
        },
        {
          term: 'Vækstklasser og asymptotisk opførsel',
          body: [
            'L02 s. 23: tiden er næsten altid proportional med én af **konstant** (1), **logaritmisk** (log N — “base of the log does not matter”), **lineær** (N), **linearitmisk** (N log N — “usually arises in recursive algorithms”), **kvadratisk** (N² — alle par), **kubisk** (N³ — alle tripler) og **eksponentiel** (2ᴺ — typisk brute force). “Same idea applies to space!” Weiss’ figur 2.1 (s. 53) har samme liste plus log² N.',
            'Tabellen s. 19 gør det konkret: ved n = 1024 er log n = 10, √n = 32, n log n = 10240, n² = 1048576 og n³ = 1073741824; 2ⁿ er allerede 1,34 × 10¹⁵⁴ ved n = 512. Tabellen s. 21 viser N lg N = 19931569 og N² = 1000000000000 ved N = 1000000.',
            'Slide 22 oversætter til tid: med 10⁹ operationer pr. sekund og problemstørrelse 1 milliard tager N og N lg N sekunder, men N² årtier. Plottene s. 25–26 (= Weiss figur 2.3–2.4, s. 56–57) viser, at kurverne for lineær, N log N, kvadratisk og kubisk skærer hinanden for små N; for store N — **asymptotisk opførsel**, “when N goes to infinity” — er rækkefølgen fast.',
          ],
        },
      ],
      viz: 'doa-growth',
      keyPoints: [
        'O-definitionen (L02 s. 30): 0 ≤ f(N) ≤ c·g(N) for alle N ≥ n₀, c > 0. Find ét par (c, n₀), så er beviset færdigt.',
        'O er en øvre grænse (≤), Ω en nedre (≥), Θ begge (=) — Ω og Θ defineres kun i Weiss (s. 51–52).',
        'Smid konstanter og lavere led væk: O(2N²) og O(N² + N) er dårlig stil; skriv O(N²) (Weiss s. 53).',
        'Summer → det største led; produkter (indlejring) → gang sammen (Weiss regel 1, s. 52).',
        'Rækkefølge: 1 < log N < N < N log N < N² < N³ < 2ᴺ (L02 s. 23; Weiss figur 2.1).',
        'Logaritmens grundtal er ligegyldigt i O-notation (L02 s. 23).',
        'Worst case er standard: det er en garanti for alt input og lettere at beregne end gennemsnittet (Weiss s. 55).',
        'Kompleksitet (Weiss s. 53; L02 s. 19): emnet har ingen egen algoritme — tabellen s. 19 er referencen for, hvordan 1, log n, √n, n, n log n, n², n³ og 2ⁿ vokser.',
      ],
      code: [
        {
          lang: 'c',
          title: 'count.c — samme løkke, forskellig compiler-optimering',
          source: 'Lecture02.pdf s. 13',
          code: `#include <stdio.h>
#include <stdlib.h>
#include <time.h>

int main(void)
{
  int N;
  long count = 0;
  printf("input N: ");
  scanf("%d", &N);
  int msec = 0, trigger = 10; /* 10ms */
  clock_t before = clock();
  for (int i = 0; i < N; i++) {
    for (int j = 0; j < N; j++) {
      for (int k = 0; k < N; k++) {
        count++;
      }
    }
  }
  clock_t taken = clock()-before;
  msec = taken * 1000/CLOCKS_PER_SEC;
  printf("count = %ld, msek taken = %d", count, msec);
}`,
        },
      ],
      exam: [
        'Big-O er en øvre grænse op til en konstant for store N: f(N) er O(g(N)), hvis der findes c > 0 og n₀, så f(N) ≤ c·g(N) for alle N ≥ n₀. Ω er den tilsvarende nedre grænse, og Θ betyder, at begge gælder, så væksten er den samme.',
        'Vi ignorerer konstanter, fordi hvert skridt alligevel har en ukendt maskinafhængig pris; konstanten c i definitionen opsluger den. Vi ignorerer lavere led, fordi det dominerende led bestemmer væksten, når N bliver stor.',
        'O(n²) er et ærligt svar for noget, der vokser som n; det er bare ikke det stramme svar. Når man vil sige, at grænsen er stram, siger man Θ.',
        'Sådan løser du ‘bevis at f(n) er O(g(n))’: 1) skriv definitionen op: 0 ≤ f(n) ≤ c·g(n) for n ≥ n₀; 2) gæt c ud fra det dominerende led (lidt større end dets koefficient); 3) omskriv c·g(n) − f(n) ≥ 0 og find den mindste n, hvor det gælder — det er n₀; 4) tjek en værdi under og over n₀. For f(n) = (n + 1)² og g(n) = n² giver c = 2: 2n² − (n + 1)² = n² − 2n − 1, som er −1 ved n = 2 og 2 ved n = 3, så n₀ = 3 — det skæringspunkt plottet på s. 32 viser. (Refleksionsopgaven L02 s. 33.)',
        'Sådan løser du ‘ordn disse funktioner efter vækst’: 1) skær konstanter og lavere led væk; 2) placér hver i klasserne 1, log N, N, N log N, N², N³, 2ᴺ; 3) inden for samme klasse sammenlign eksponenter; 4) i tvivl: beregn lim f/g (0 → f vokser langsommere, konstant → Θ, ∞ → hurtigere). (Udledt af L02 s. 23 og Weiss s. 53, ikke af eksamenssæt.)',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture02_BigO_ADT.md'), original: 'Lecture02.pdf', pages: 's. 5, 11–34, 44' },
        { path: k('context/book/AOD_Ch02-03_BigO_ADT.md'), original: BOOK, pages: 's. 51–57', note: '2.1 Mathematical background (definition 2.1–2.4, regel 1–3, figur 2.1), 2.2 Model, 2.3 What to analyze' },
        { path: k('context/videos/SW2ADS_Video_Week02_Big-O.md'), original: 'week2.txt', note: '“What Is Big O Notation?” (Alice og Bob, 3n² + 5n + 4) og “Prove log(n^3) is O(log n)”' },
        { path: k('context/lessons/SW2ADS_Lecture06_ArraySorting.md'), original: 'Lecture06.pdf', pages: 's. 24, 28', note: 'Ω brugt uden definition' },
        { path: k('context/lessons/SW2ADS_Lecture09_Graphs.md'), original: 'Lecture9.pdf', pages: 's. 16–17', note: 'Θ brugt uden definition' },
      ],
      gaps: [
        'Ω og Θ defineres ikke på slides. L02 definerer kun O (s. 30–31); Ω og Θ bruges senere uden definition (L06 s. 24, 28; L09 s. 16–17; L13 s. 10–11). Definitionerne her er Weiss’ (s. 51–52). little-o nævnes kun i bogen.',
        'Slidets definition har “0 ≤ f(N) ≤ c·g(N)”; Weiss’ har kun “T(N) ≤ c·f(N)” med positive c og n₀. Slide 31 siger lim f/g ∈ [0, ∞); videoen i week2 siger “limit … of g(n) over f(n) must be equal to some constant c where c is greater than 0” — omvendt brøk og uden 0, dvs. snarere Θ. Slides og bog vinder.',
        'Bogudsnittets markdown skriver, at Ω “bruges til at beskrive best-case”. Det står ikke i Weiss: notationerne er grænser for en vilkårlig funktion T(N) (s. 51), og best/average/worst case er separate funktioner (T_avg, T_worst, s. 54). Man kan give både O og Ω for værste tilfælde.',
        'Slide 20 regner Menti-metoderne ud med M = N = 1000: 1000·1000 = 1E6, “1000·log2(1000) + 1000·log2(1000) = 20000” og “… = 19959” for Method 3. 2·1000·log₂ 1000 er ca. 19932, så tallene er afrundede, og Method 3 kan ikke være mindre end Method 2’s to første led. Brug dem kun som størrelsesorden.',
        'Slide 13’s tider (2260 ms uden, 0 ms med `-O1`) er fra `clang-7` på forelæserens maskine. Uden for materialet: nyere compilere fjerner ikke nødvendigvis løkken; med `gcc -O1` tog den ca. 230 ms ved test.',
        'L02 har footer “SPRING 2025” og titlen “Program analysis, Big-O & ADT”; ADT-delen (s. 46–62) hører under [[adt|Abstrakte datatyper]].',
      ],
      keywords: ['Big-O', 'Big-Oh', 'store O', 'O-notation', 'Omega', 'Ω', 'Big-Omega', 'Theta', 'Θ', 'Big-Theta', 'little-o', 'lille o', 'asymptotisk', 'asymptotic behavior', 'upper bound', 'øvre grænse', 'lower bound', 'nedre grænse', 'tight bound', 'stram grænse', 'growth rate', 'vækstrate', 'vækstklasse', 'konstant', 'logaritmisk', 'lineær', 'linearitmisk', 'N log N', 'kvadratisk', 'kubisk', 'eksponentiel', 'dominant term', 'dominerende led', 'n0', 'c', 'primary parameter', 'primær parameter', 'best case', 'average case', 'worst case', 'T(N)', 'L’Hôpital', 'benchmarking', 'count.c', 'model of computation'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'loekkeanalyse',
      title: 'Analyse af løkker og pladskompleksitet',
      short: 'Løkkeanalyse og plads',
      week: 'Lektion 2',
      definition:
        'At **analysere en løkke** er at tælle, hvor mange gange kroppen udføres som funktion af N, gange med prisen pr. gennemløb og beholde det dominerende led. Kurset giver tre hurtigregler — løkker ganges, indlejrede løkker ganges med hinanden, if/else koster testen plus den dyreste gren — og øver dem på `partialsum.c`, insertion sort, Alice og Bob og tre måder at finde elementer fra B i A. **Pladskompleksitet** tælles på samme måde i hukommelsesenheder.',
      concepts: [
        {
          term: 'Præcis optælling: partialsum.c',
          body: [
            'L02 s. 35 beregner Σ i³ for i = 1 … N og tæller operationer linje for linje: linje 2 (`int i, partialSum = 0;`) koster 1 initialisering; linje 4 (`for (i = 1; i <= n; i++)`) koster 1 initialisering, **N + 1** sammenligninger og N inkrementeringer; linje 5 koster 2 multiplikationer, 1 addition og 1 tildeling pr. gennemløb, i alt 4N; linje 7 (`return`) koster 1. Total: **T(N) = 6N + 4**, altså O(N).',
            'Slide 36 gør det samme i O-notation: linje 2 er O(1), linje 4 er O(N) i alt, linje 5 er O(1) pr. gennemløb, linje 7 er O(1); total O(N) + 3·O(1) = O(N). Pointen er, at det ikke betyder noget, om linje 5 koster 2, 3 eller 4 enheder — Weiss kalder det “silly” at tælle præcist (2.4.1, s. 58).',
          ],
        },
        {
          term: 'Hurtigreglerne',
          body: [
            'L02 s. 37: **Loops** — gang prisen for kroppen med antal gennemløb. **Nested loops** — det samme, “but be careful about numbers of iterations”. **Conditionals** — testens pris plus den største af de to grene. Rekursive funktioner kommer senere (se [[rekursion|Rekursion]]).',
            'Weiss 2.4.2 (s. 58–59) har de samme fire regler: FOR-løkker; indlejrede løkker analyseres indefra og ud — prisen for sætningen gange produktet af alle løkkers størrelse (`for i < n` om `for j < n` om `++k` er O(N²)); **consecutive statements** lægges sammen, så den største tæller (O(N) efterfulgt af O(N²) er O(N²)); if/else er aldrig mere end testen plus den dyreste gren — “can be an overestimate … but it is never an underestimate”.',
            'Funktionskald analyseres først. `factorial` er “really just a simple loop” og O(N); `fib( n - 1 ) + fib( n - 2 )` giver T(N) = T(N − 1) + T(N − 2) + 2 og vokser eksponentielt, fordi samme delproblem regnes igen og igen (Weiss s. 59–60). Videoen i week2 tæller kald for en funktion med to kald til f(n − 1): 1, 3, 7, 15, 31 → 2ᵏ − 1 → O(2ⁿ). Se [[dynamisk-programmering|Dynamisk programmering]].',
          ],
        },
        {
          term: 'Alice og Bob',
          body: [
            'L02 s. 4 og 27: find alle sæt af ikke-negative heltal (a, b, c) med a + b + c = n. **Bob** prøver alle kombinationer af (a, b, c) og printer, hvis summen er n. **Alice** prøver alle (a, b), sætter c = n − (a + b) og printer, hvis c ≥ 0. Spørgsmålene: hvem er mest effektiv, betyder det noget, hvem der er hurtigst med pen og papir, og hvor mange skridt tager hver for et givet n?',
            'Slides giver ikke svaret; kursusvideoen (week2, “What Is Big O Notation?”) gør. Tæller man if-testen, løber Bob a, b og c fra 0 til n — ved n = 20 er det 21³ = 9261 tests — mens Alice kun løber a og b og har præcis ét c pr. par: 21² = 441. Generelt (n + 1)³ mod (n + 1)², dvs. **O(n³) mod O(n²)**. Den primære parameter er n (s. 10).',
            'Pen-og-papir-spørgsmålet er pointen fra s. 5 og 15: vi tæller abstrakte skridt, ikke hvor hurtigt en bestemt person eller maskine udfører dem. Videoen målte Bob til ca. 58 s og Alice til ca. 15 s ved n = 10.000 på én maskine, men det tal ændrer sig med maskinen; væksten gør ikke.',
          ],
        },
        {
          term: 'Menti: hvor mange elementer fra B findes i A?',
          body: [
            'L02 s. 7–8: `A[M] = 1, 4, 7, 4, 6, 12, 56, 22, 4, 64, 5` (M = 11) og `B[N] = 12, 76, 13` (N = 3). **Method 1**: for hvert `i` i `B`, for hvert `j` i `A`, tæl ved `B[i] == A[j]`. Slidets skelet er “For each N { For each M { C } }” → O(N·M).',
            '**Method 2**: sortér `A` (“M·log(M) itr (Quicksort)”), og for hvert element i `B` find det i `A` med binær søgning (“C·log(M) (Div-Conquer)”) → O(M log M + N log M). **Method 3**: sortér både `A` og `B` (N·log N + M·log M), og søg hvert `B[i]` i `A[s..M−1]`, hvor `s` flyttes frem til sidste fund → O(M log M + N log N + N log M). Se [[soegning|binær søgning]] og [[quicksort|Quicksort]].',
            'Slide 20 sætter M = N = 1000: Method 1 = 1000·1000 = 10⁶, Method 2 ≈ 20000, Method 3 ≈ 19959 — to størrelsesordener mellem den naive og de sorterende metoder, og næsten ingen forskel mellem Method 2 og 3 i O-notation.',
          ],
        },
        {
          term: 'Insertion sort og tre indlejrede løkker',
          body: [
            'L02 s. 38–39 beder om tidskompleksiteten af `insertion_sort.c`. `swap` er fire sætninger uden løkke → O(1). Den ydre løkke kører `i = 1 … n − 1`; den indre kører `j = i` ned mod 0 og stopper (`break`), så snart `x[j] > x[j − 1]`. I værste fald (omvendt sorteret) kører den indre løkke i gange: 1 + 2 + … + (n − 1) = n(n − 1)/2 → O(n²). Er input allerede sorteret, stopper den indre løkke straks → O(n).',
            'Weiss bekræfter (7.2.3, s. 294–295): “Because of the nested loops, each of which can take N iterations, insertion sort is O(N²)”; grænsen er stram, fordi omvendt input når den, og præsorteret input giver O(N). Gennemsnittet er Θ(N²). Algoritmen selv står under [[insertion-sort|Insertion sort]].',
            'Eksemplet på s. 6 har tre indlejrede løkker til N = 1000 og en `count`, der tælles op i den første løkke (N gange) og i den inderste (N·N·N gange): N + N³ → O(N³). Løkke-grænser, der afhænger af den ydre variabel, er det, “be careful about numbers of iterations” advarer om.',
          ],
        },
        {
          term: 'Pladskompleksitet',
          body: [
            'L02 s. 40: “Space complexity of an algorithm is the total amount of memory it requires to execute”, dvs. **input storage**, **auxiliary space** (fx midlertidige arrays og rekursionsstakke) og en **fast del** (konstanter og programinstruktioner). Svaret gives i O af den primære parameter.',
            'Menti s. 41 spørger om `swap(int a, int b, int *x, int n)`: den bruger kun den ene hjælpevariabel `t` uanset n → O(1) ekstra plads. Menti s. 42 spørger om `fibonacci(int n)`, som opretter `std::vector<int> fib(n)` og fylder den ud → O(n) ekstra plads. Slides giver ikke svarene; de følger af definitionen på s. 40.',
            'Weiss’ maksimal-delsum-algoritme 4 er “online”: den læser hvert `a[i]` én gang og behøver ikke gemme det, så den kører i lineær tid med konstant ekstra plads — “just about as good as possible” (s. 66). Det er modstykket til `fibonacci`, der gemmer hele tabellen.',
          ],
        },
      ],
      viz: 'doa-loop-count',
      keyPoints: [
        'Løkke: pris pr. gennemløb × antal gennemløb. Indlejret: gang antal gennemløb sammen. Efter hinanden: læg sammen, den største vinder. if/else: test + dyreste gren (L02 s. 37; Weiss s. 58–59).',
        '`for (i = 1; i <= n; i++)` koster 1 + (N + 1) + N; `partialsum.c` ender på T(N) = 6N + 4 = O(N) (L02 s. 35).',
        'Bob (alle a, b, c) er (n + 1)³ → O(n³); Alice (alle a, b, beregn c) er (n + 1)² → O(n²) (week2-videoen; L02 s. 27).',
        'Find B i A: Method 1 O(N·M); Method 2 O(M log M + N log M); Method 3 O(M log M + N log N + N log M) (L02 s. 8).',
        'En indre løkke, der stopper tidligt, giver forskel på bedste og værste tilfælde — insertion sort O(n) mod O(n²).',
        'Plads = input + auxiliary + fast del; tæl hjælpevariable og allokerede arrays (L02 s. 40).',
        'Kompleksitet (L02 s. 35; Weiss s. 58): `partialsum` bedste O(N) · gennemsnit O(N) · værste O(N) (alle input giver 6N + 4) · plads ikke angivet.',
        'Kompleksitet (Weiss s. 294–295; L02 s. 38–39): insertion sort bedste O(N) (præsorteret) · gennemsnit Θ(N²) · værste O(N²) (omvendt sorteret) · plads ikke angivet.',
        'Kompleksitet (L02 s. 41–42, udledt af s. 40): `swap` tid O(1) · plads O(1); `fibonacci` tid O(n) · plads O(n) — slides giver ikke svarene, bedste/gennemsnit ikke angivet.',
      ],
      code: [
        {
          lang: 'c',
          title: 'partialsum.c — 6N + 4 operationer',
          source: 'Lecture02.pdf s. 35',
          code: `int sum(int n) {
    int i, partialSum = 0;

    for (i = 1; i <= n; i++) {
        partialSum = partialSum + (i * i * i);
    }
    return partialSum;
}`,
        },
        {
          lang: 'c',
          title: 'insertion_sort.c — analysér tidskompleksiteten',
          source: 'Lecture02.pdf s. 38–39',
          code: `/*
 * Insertion sort
 */

#include <assert.h>             /* assert */

void swap(int a, int b, int *x, int n) {
    /* pre-condition */
    /* a and b are within bounds of x array */
    assert(0 <= a && a < n && 0 <= b && b < n);

    /* post-condition */
    int t;  /* temporary variable for swapping */
    t = x[a];
    x[a] = x[b];
    x[b] = t;
}

void insertion_sort(int n, int *x) {
    int i;  /* counter variable */
    int j;  /* counter variable */

    /* pre-condition */
    assert(0 <= n);

    /* post-condition: x[0..n] is sorted */
    for (i = 1; i < n; i = i + 1) {
        /* invariant: x[0..i-1] is sorted */
        j = i;
        /* insert next element j into
         * ordered position
         */
        for (; j > 0; j = j - 1) {
            if (x[j] > x[j - 1])
                break;          /* jth element is in correct position */
            else
                swap(j, j - 1, x, n);
        }
    }
}`,
        },
        {
          lang: 'cpp',
          title: 'Menti: pladskompleksiteten af fibonacci',
          source: 'Lecture02.pdf s. 42',
          code: `#include <iostream>
#include <vector>

int fibonacci(int n) {
    std::vector<int> fib(n);
    fib[0] = 0;
    fib[1] = 1;

    for (int i = 2; i < n; i++) {
        fib[i] = fib[i - 1] + fib[i - 2];  // Computing Fibonacci numbers iteratively
    }

    return fib[n - 1]; // Returning the last Fibonacci number
}

int main() {
    std::cout << fibonacci(10) << std::endl;
    return 0;
}`,
        },
      ],
      exam: [
        'Jeg analyserer indefra og ud: prisen for den inderste sætning gange antallet af gennemløb for hver omsluttende løkke. Løkker efter hinanden lægges sammen, og kun den største overlever i O-notation.',
        'Den præcise optælling for `partialsum` giver 6N + 4, men i O-notation er det O(N): konstanten 6 og leddet 4 forsvinder, fordi de ikke ændrer væksten.',
        'Alice er bedre end Bob, fordi hun erstatter den tredje løkke med en beregning: c = n − (a + b). Det reducerer (n + 1)³ til (n + 1)² tests, altså fra O(n³) til O(n²) — uanset hvem der regner hurtigst.',
        'Sådan løser du ‘bestem Big-O af denne løkke’: 1) find den primære parameter N; 2) for hver løkke: skriv hvor mange gange den kører, og om det afhænger af en ydre variabel (så summér, fx 1 + 2 + … + (n − 1) = n(n − 1)/2); 3) gang prisen for kroppen med antallet, indefra og ud; 4) læg sekventielle dele sammen og behold det største led; 5) ved `break`/`if`: angiv bedste og værste tilfælde hver for sig. (Opgavetype udledt af L02 s. 6, 35–39 og Menti s. 7–8, ikke af eksamenssæt.)',
        'Sådan løser du ‘hvad er pladskompleksiteten’: 1) ignorér koden, tæl hukommelsen; 2) input tæller med, men angiv den ekstra (auxiliary) plads separat; 3) faste variable er O(1); 4) et array eller en `vector` af størrelse n er O(n); 5) rekursion koster en stack frame pr. aktivt kald. (Menti L02 s. 41–42.)',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture02_BigO_ADT.md'), original: 'Lecture02.pdf', pages: 's. 4, 6–10, 20, 27–28, 35–42' },
        { path: k('context/book/AOD_Ch02-03_BigO_ADT.md'), original: BOOK, pages: 's. 58–66', note: '2.4.1 A simple example, 2.4.2 General rules, 2.4.3 Maximum subsequence sum' },
        { path: k('context/book/AOD_Ch07_Array_Sorting.md'), original: BOOK, pages: 's. 294–295', note: '7.2.3 Analysis of insertion sort' },
        { path: k('context/videos/SW2ADS_Video_Week02_Big-O.md'), original: 'week2.txt', note: 'Alice og Bob: (n + 1)³ mod (n + 1)²; optælling af rekursive kald' },
        { path: k('context/kode/kildekode_part9.md'), note: 'MaxSumTest.cpp (maxSubSum1–4: O(N³), O(N²), O(N log N), O(N))' },
      ],
      gaps: [
        'Slides giver ingen svar på refleksions- og Menti-spørgsmålene (Alice og Bob s. 4 og 27, insertion sort s. 38–39, swap s. 41, fibonacci s. 42, ordbogen s. 10 og 28). Markdown-konverteringen af L02 skriver “Answer: …” ved dem, som om de stod på slides. Svarene her er udledt med reglerne på s. 37/40, Weiss og week2-videoen.',
        'Menti “Method 1” (s. 7–8) kalder `exit();` inde i den indre løkke. Uden for materialet: `exit()` stopper hele programmet ved første fund; det må være ment som `break`. Slide 20 regner alligevel Method 1 som fulde B·A = 10⁶ skridt.',
        'Slide 20’s tal for Method 2 (20000) og Method 3 (19959) er afrundede; 2 · 1000 · log₂ 1000 ≈ 19932. Se [[big-o|Big-O]].',
        'Kommentaren i `insertion_sort.c` siger “post-condition: x[0..n] is sorted”, men arrayet har indeks 0 … n − 1. `swap`’s `assert` står under kommentaren “pre-condition”, mens tildelingerne står under “post-condition”.',
        'Uden for materialet: Menti-koden `fibonacci(n)` skriver `fib[1]` selv når n = 1 (vektoren har kun ét element) og returnerer `fib[n - 1]`, så `fibonacci(10)` giver 34 (F₉), ikke F₁₀ = 55. Det ændrer ikke pladssvaret O(n).',
        'Slide 5 og 15 nævner best, average og worst case, men kurset regner kun værste tilfælde i Lektion 2. Gennemsnitsanalyse er ikke dækket af pensum her; Weiss siger, at den “usually [is] much more difficult to compute” (s. 55).',
        'Amortiseret analyse (fx `vector::push_back`) er ikke dækket af pensum i Lektion 2.',
      ],
      keywords: ['løkkeanalyse', 'loop analysis', 'nested loops', 'indlejrede løkker', 'consecutive statements', 'if/else', 'quick analysis rules', 'hurtigregler', 'partialsum', 'partialsum.c', '6N+4', 'Alice', 'Bob', 'a+b+c=n', 'Menti', 'Mentimeter', 'items from B in A', 'Method 1', 'Method 2', 'Method 3', 'insertion sort', 'insertion_sort.c', 'swap', 'fibonacci', 'space complexity', 'pladskompleksitet', 'auxiliary space', 'hjælpeplads', 'input storage', 'tidskompleksitet', 'time complexity', 'maxSubSum', 'MaxSumTest', 'maximum subsequence sum', 'online algorithm', 'n(n-1)/2', 'Σ i'],
    },
  ],
}
