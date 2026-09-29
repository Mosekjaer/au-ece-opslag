import type { Part } from '../types'
import { k, BOOK } from './paths'

const L04 = k('context/lessons/SW2ADS_Lecture04_Sets_Maps_Hashing.md')
const CH45 = k('context/book/AOD_Ch04-05_Sets_Dictionaries_Hashing.md')

export const hashing: Part = {
  id: 'hashing',
  title: 'Mængder, maps og hashing',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'hashtabeller',
      title: 'Sets, maps og hashfunktioner',
      short: 'Sets, maps og hashfunktioner',
      week: 'Lektion 4',
      definition:
        'Et **set** er en uordnet samling uden dubletter; et **map** (dictionary, key-value store) er en samling af værdier indekseret af unikke **nøgler**. Begge har operationerne `insert`, `contains` og `remove`. En **hashtabel** implementerer dem med et array af fast størrelse *M*, hvor en **hashfunktion** afbilder hver nøgle til et indeks i `[0, M-1]`, så operationerne i gennemsnit koster O(1). Kursets to spørgsmål er derefter: hvilken hashfunktion, og hvad gør man ved **kollisioner**?',
      intro: [
        'Lektion 4 starter med ADT’erne og slutter med to implementeringer af hashtabellen (chaining og probing, se [[separate-chaining|separate chaining]] og [[open-addressing|open addressing]]). Dette emne dækker ADT’erne, STL’s to familier af containere og selve hashfunktionen.',
      ],
      concepts: [
        {
          term: 'Set og map som ADT',
          body: [
            'Slidets definition af et **map**: “an unordered collection of items of any type indexed by keys (of a simple type (integer or string))”. Nøglerne skal være unikke. Et map har tre operationer, `insert`, `contains` og `remove`, som tilføjer, søger og sletter et (nøgle, værdi)-par, og kurset abstraherer derefter værdierne væk og ser kun på nøglerne (L04 s. 6). Det “virkelige” map er bogens stikordsregister: stikord → sidetal (s. 7).',
            'Et **set** er “an unordered collection of items of any type where no duplicates are allowed” — en implementering af den matematiske endelige mængde, med `insert(e)`, `contains(e)` og `remove(e)` (s. 9). Forskellen ses i signaturen: `Dictionary<KeyType, ValueType>::contains(const KeyType&)` slår en nøgle op, og `get(key)` returnerer værdien, mens `Set<T>::contains(const T&)` spørger efter selve elementet (s. 8 og 11).',
            'Se [[adt|abstrakte datatyper]] for ADT-begrebet generelt.',
          ],
        },
        {
          term: 'STL: set/map (træ) mod unordered_set/unordered_map (hash)',
          body: [
            'Bogen (4.8) præsenterer STL’s `set` og `map` som **ordnede** containere: `set` er “an ordered container that does not allow duplicates”, og nøglerne i et `map` holdes “in logically sorted order”. C++ kræver `insert`, `erase` og `find` i “logarithmic worst-case time”, så de implementeres som et balanceret søgetræ, typisk et red-black tree (Weiss s. 173–176; se [[bst|binære søgetræer]] og [[avl|AVL-træer]]).',
            '`set::insert` returnerer `pair<iterator,bool>`: `second` er `false`, hvis elementet fandtes i forvejen. `map::operator[]` indsætter nøglen med en default-værdi, hvis den mangler — derfor skriver `cout << salaries["Jan"]` både 0 og indsætter “Jan”. Vil man ikke indsætte, bruger man `find` og sammenligner med `end()` (figur 4.68, s. 175; `mapDemo.cpp`).',
            'Hashversionerne hedder `unordered_set` og `unordered_map` (C++11). Elementerne skal have `operator==` og en hashfunktion; de kan instantieres med funktionsobjekter, der giver en anden hash og lighed, fx den case-insensitive `unordered_set<string,CaseInsensitiveStringHash,CaseInsensitiveStringHash>` (figur 5.23, s. 211–212; `CaseInsensitiveHashTable.cpp`). Bogens råd: brug dem, når rækkefølgen er ligegyldig; et `unordered_map` er ofte hurtigere end et `map`, “but it is hard to know for sure without writing the code both ways” (s. 212). Kursets `WordLadder.cpp` bruger `map` og noterer i toppen “Elapsed time FAST: 2.01 (unordered_map 1.47)”.',
          ],
        },
        {
          term: 'Hashtabellen og telefonbogen',
          body: [
            'Diskussionsopgaven “The efficient phonebook” (s. 12) bygger idéen op: Q1 et usorteret register, Q2 et sorteret, Q3 millioner af navne — “how do you look up a word in a dictionary?”, og Q4 en funktion, der afbilder et navn til en sektion, der er mere specifik end forbogstavet. Q1–Q2 svarer til [[soegning|lineær og binær søgning]].',
            'Svaret er hashtabellen: “an array of fixed size M. Each key is mapped into some number in [0, M-1] and stored in the corresponding position” (s. 13). Slidets eksempel har M = 11 med `John (25000)` på plads 3, `Phil (31250)` på 4, `Dave (27500)` på 6 og `Mary (28200)` på 7 — bogens figur 5.1 med tabelstørrelse 10 (Weiss s. 194).',
            'Afbildningen kaldes en **hashfunktion**. Den skal være enkel at beregne og fordele nøglerne jævnt. Tilbage står to problemer: at vælge hashfunktionen og at bestemme, hvad der sker, når to nøgler hasher til samme værdi — en **kollision** (s. 14; Weiss s. 193–194).',
          ],
        },
        {
          term: 'Fra nøgle til indeks i to trin',
          body: [
            'Slide 17 tegner hashing som to afbildninger: “All possible keys” (John Smith, Lisa Smith, Sam Doe, Sandra Dee, …) → **hashfunktion** → “All possible indexes” `0 … 4294967295` (alle `unsigned int`) → “Resizing” til M → indeks `0 … M-1`. Koden under figuren er `hashFunction` (summen af tegnenes ASCII-værdier) og `hashToArray`, der returnerer `hashFunction(key) % M`.',
            'Menti-spørgsmålet “Where can collisions occur?” (s. 25) bruger samme figur. Der kan ske kollisioner i begge pile: to nøgler kan få samme hashværdi, og to forskellige hashværdier kan give samme rest modulo M.',
            'Kursets egen implementering deler på samme måde: `std::hash<HashedObj>` returnerer en `size_t`, og den private `myhash` tager resten: `return hf(x) % theLists.size();` (s. 34; figur 5.7, s. 198).',
          ],
        },
        {
          term: 'Heltal: x mod M med M primtal',
          body: [
            'For heltal er `Key mod TableSize` “generally a reasonable strategy”, men ikke hvis nøglerne har uheldige egenskaber: er tabelstørrelsen 10 og ender alle nøgler på 0, lander de i samme celle. Derfor bør tabelstørrelsen være et **primtal** (Weiss s. 194).',
            'Slidet siger det samme: vælg et primtal M, så tilfældige nøgler fordeles jævnt i `[0, M-1]` — i telefonbogen skal man altså dele i M sektioner med M primtal, og hashtabellen skal altid allokere et array af primtalsstørrelse (s. 18). Begrundelsen ligger i `explanation_primes.ipynb`/`explanation_primes.pdf`, som slide 19 kun henviser til.',
            'Kursets hjælpefunktioner `isPrime` og `nextPrime` sikrer det: konstruktøren kalder `nextPrime(size)`, og `rehash` kalder `nextPrime(2 * theLists.size())` (s. 34).',
          ],
        },
        {
          term: 'Strenge: tegnsum, tre tegn og Horner med 37',
          body: [
            'Bogen gennemgår tre hashfunktioner for strenge. **Tegnsummen** (figur 5.2) er hurtig, men fordeler dårligt i store tabeller: med `TableSize = 10007` og nøgler på højst 8 tegn kan summen kun ramme 0–1016 (127 · 8) (Weiss s. 194). **De tre første tegn** vægtet med 27 og 729 (figur 5.3) giver 26³ = 17 576 kombinationer, men en ordbog har kun 2 851 forskellige, så højst 28 % af tabellen bruges (s. 195).',
            '**Figur 5.4** bruger alle tegn og beregner polynomiet Σ `Key[KeySize − i − 1] · 37^i` med **Horners regel**: `hashVal = 37 * hashVal + ch`. Den udnytter, at overflow er tilladt, og bruger `unsigned int` for at undgå negative tal (s. 195–196). Slide 20 viser præcis denne funktion under navnet “djb2 – By dan Bernstein” og en tabel over danske bogstavfrekvenser (E 16,09 %, R 7,63 %, N 7,32 % …) som begrundelse for, at bogstaver ikke er jævnt fordelt.',
            'Menti-spørgsmålet “Which of the following is the best example of a hash function?” (s. 15) stiller fire kandidater op: A) tegnsum, B) `key.length()`, C) produkt af tegnværdier i en `int`, D) `return 1;`. Med bogens kriterier (jævn fordeling, enkel beregning) er D og B de dårligste: D sender alt til samme celle, og B giver kun få forskellige værdier. A er bogens figur 5.2.',
          ],
        },
        {
          term: 'Egne hashfunktioner: std::hash som funktionsobjekt',
          body: [
            'C++11 udtrykker hashfunktioner som funktionsobjekt-skabelonen `template <typename Key> class hash { public: size_t operator()(const Key& k) const; };`. Standarden har implementeringer for fx `int` og `string`, og man kan udvide til egne typer (s. 21; Weiss s. 197–198). `size_t` er en usigneret type, der altid kan rumme et array-indeks.',
            'Slidets `Employee` har `name`, `salary` og `seniority` og en `operator==`, der sammenligner alle tre. `EmployeeHash::operator()` hasher kun `name` med `std::hash<std::string>` (s. 21–22). Slidet opsummerer: “We reduce hashing instances of user-defined classes to hashing members using the default implementations” (s. 23). Bogens figur 5.8 gør det samme med en specialisering `template<> class hash<Employee>`, men dens `operator==` sammenligner kun navnet (Weiss s. 199).',
            'Kravet til en nøgletype i kursets hashtabeller er derfor to ting: en hashfunktion og lighed (`operator==` eller `!=`) — ikke en ordning som i søgetræet (Weiss s. 197). Lige nøgler skal give samme hash; slidets `EmployeeHash` opfylder det, fordi lige medarbejdere har samme navn.',
          ],
        },
        {
          term: 'Set bygget på en STL-hashtabel',
          body: [
            'Kursets `Set<T>` (s. 11 og s. 51) har ét datamedlem, `std::unordered_map<T, bool> hashTable`. `insert` skriver `hashTable[element] = true`, `contains` tester `find(element) != end()`, `remove` finder og kalder `erase(it)` og skriver “Element not found!”, hvis elementet mangler; `size` og `isEmpty` videresender til `size()` og `empty()`.',
            'Den bool-værdi, der gemmes, bruges aldrig — mappet bruges kun for nøglerne. `main` på s. 11 indsætter 10, 20, 30, 40, tester `contains(20)` og fjerner 30, og gør det samme med strengene "apple", "banana" og "cherry".',
          ],
        },
      ],
      viz: 'doa-hash-function',
      keyPoints: [
        'Set: uordnet, ingen dubletter. Map: værdier indekseret af unikke nøgler. Begge: `insert`, `contains`, `remove` (L04 s. 6, 9).',
        'STL `set`/`map` er ordnede balancerede søgetræer med logaritmisk værste tid; `unordered_set`/`unordered_map` er hashtabeller (Weiss s. 173–176, 210–212).',
        'Hashtabel = array af størrelse M; hashfunktion afbilder nøgle → hashværdi → `% M` → indeks i `[0, M-1]` (L04 s. 13, 17).',
        'Kollisioner kan opstå både i hashfunktionen og i `% M` (L04 s. 25).',
        'Gode hashfunktioner er enkle at beregne og fordeler jævnt; M skal være et primtal (L04 s. 14, 18; Weiss s. 194).',
        'Strenge: `hashVal = 37 * hashVal + ch` (Horner) — tegnsummen og tre-tegns-funktionen fordeler dårligt i store tabeller (Weiss s. 194–196).',
        'Egne typer: skriv et funktionsobjekt, der hasher et medlem med `std::hash`, og giv typen `operator==` (L04 s. 21–23).',
        'Kompleksitet (L04 s. 4; Weiss s. 212, 236): hashtabel `insert`/`contains`/`remove` bedste ikke angivet · gennemsnit O(1) · værste ikke angivet · plads ikke angivet.',
        'Kompleksitet (Weiss s. 173, 175): STL `set`/`map` `insert`/`erase`/`find` bedste ikke angivet · gennemsnit ikke angivet · værste O(log N) · plads ikke angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Fra nøgle til indeks — tegnsum og Horner med 37',
          source: 'Lecture04.pdf s. 17 og s. 20 (Weiss s. 195, fig. 5.4)',
          code: `// s. 17: hashfunktion + "resizing" til M
unsigned int hashFunction(const std::string& key) {
    unsigned int sum = 0;
    for (char c : key) {
        sum += static_cast<int>(c);
    }
    return sum;
}

unsigned int M;
unsigned int hashToArray(const std::string& key)
{
    return hashFunction(key) % M;
}

// s. 20: bogens figur 5.4 (Horners regel med 37)
unsigned int hash(const string& key) {
    unsigned int hashVal = 0;
    for( char ch : key ) hashVal = 37 * hashVal + ch;
    return hashVal;
}`,
        },
        {
          lang: 'cpp',
          title: 'Custom hash: Employee som nøgle',
          source: 'Lecture04.pdf s. 21 (også s. 28)',
          code: `// Employee class as a custom key
class Employee {
public:
    std::string name;
    double salary;
    int seniority;  // Years of experience or seniority level

    // Constructor
    Employee(const std::string& name, double salary, int seniority)
        : name(name), salary(salary), seniority(seniority) {}

    // Equality operator
    bool operator==(const Employee& other) const {
        return name == other.name && salary == other.salary && seniority == other.seniority;
    }
};

// Custom hash function for the Employee class
struct EmployeeHash {
    std::size_t operator()(const Employee& employee) const {
        std::hash<std::string> hf;
        return hf(employee.name);
    }
};`,
        },
        {
          lang: 'cpp',
          title: 'Set implementeret med std::unordered_map',
          source: 'Lecture04.pdf s. 51',
          code: `template <typename T>
class Set {
private:
    std::unordered_map<T, bool> hashTable;

public:
    // Function to add an element to the set
    void insert(const T& element) {
        hashTable[element] = true;  // Insert element with a value of true
    }

    // Function to remove an element from the set
    void remove(const T& element) {
        auto it = hashTable.find(element);
        if (it != hashTable.end()) {
            hashTable.erase(it);  // Remove element if found
        }
        else {
            std::cout << "Element not found!\\n";
        }
    }

    // Function to check if an element exists in the set
    bool contains(const T& element) const {
        return hashTable.find(element) != hashTable.end();
    }

    // Function to get the size of the set
    size_t size() const {
        return hashTable.size();
    }

    // Function to check if the set is empty
    bool isEmpty() const {
        return hashTable.empty();
    }
};`,
        },
      ],
      exam: [
        'Et set er en uordnet samling uden dubletter, et map afbilder unikke nøgler til værdier. Begge kan implementeres med et balanceret søgetræ — det gør STL’s `set` og `map`, med logaritmisk værste tid og sorteret gennemløb — eller med en hashtabel som `unordered_set` og `unordered_map`, der giver O(1) i gennemsnit, men ingen orden.',
        'En hashtabel er et array af størrelse M. Hashfunktionen giver nøglen en hashværdi, og `% M` gør den til et indeks. Tabelstørrelsen skal være et primtal, og for strenge bruger kurset Horners regel `hashVal = 37 * hashVal + ch`, fordi den bruger alle tegn og fordeler godt.',
        'Sådan løser du ‘placér nøgler med en given hashfunktion’ (opgavetype fra slide 13–17 og Menti-spørgsmålene s. 15 og 25, ikke fra eksamenssæt): 1) beregn hashværdien (heltal: nøglen selv; streng: kursets funktion); 2) tag resten modulo M; 3) skriv nøglen i den celle; 4) markér, hvor to nøgler rammer samme indeks — det er en kollision, og den skal løses med chaining eller probing.',
        'Sådan vurderer du ‘hvilken hashfunktion er bedst?’ (Menti s. 15): tjek om den bruger hele nøglen, om den kan give mange forskellige værdier, og om den er billig at beregne. `return 1` og `key.length()` giver næsten kun kollisioner; tegnsummen er bogens figur 5.2, der kun kan ramme 0–1016 for nøgler på højst 8 tegn; Horner med 37 er bogens “good hash function”.',
        'Vælg søgetræ frem for hashtabel, når du har brug for orden — mindste element, intervaller eller sorteret output. Bogen siger direkte, at man ikke kan finde minimum i en hashtabel, og at sorteret input kan ødelægge et ubalanceret søgetræ, mens hashingens værste tilfælde typisk skyldes en implementeringsfejl (Weiss s. 236).',
      ],
      sources: [
        { path: L04, original: 'Lecture04.pdf', pages: 's. 4–25, 51', note: 'Sets, maps, hashfunktioner og STL-set' },
        { path: CH45, original: BOOK, pages: 's. 173–176', note: '4.8 Sets and Maps in the Standard Library' },
        { path: CH45, original: BOOK, pages: 's. 193–199', note: '5.1 General Idea, 5.2 Hash Function, std::hash (5.3)' },
        { path: CH45, original: BOOK, pages: 's. 210–212, 236', note: '5.6 Hash Tables in the Standard Library; kapitlets Summary' },
        { path: k('context/kode/kildekode_part12.md'), note: 'mapDemo.cpp (figur 4.68) og WordLadder.cpp (map vs. unordered_map)' },
        { path: k('context/kode/kildekode_part7.md'), note: 'CaseInsensitiveHashTable.cpp (figur 5.23)' },
        { path: k('context/kode/kildekode_part9.md'), note: 'SeparateChaining.cpp: hash(string) med 37, isPrime, nextPrime' },
      ],
      gaps: [
        'Slide 20 kalder `hashVal = 37 * hashVal + ch` for “djb2 – By dan Bernstein”. Funktionen er bogens figur 5.4 (Weiss s. 195), og bogen nævner ikke djb2. Uden for materialet: djb2 starter normalt i 5381 og ganger med 33.',
        'Menti s. 15 (“best hash function”) og s. 31–32 (load factor) har intet facit i PDF’en. Markdown-konverteringen tilføjer “Best Answer: A or C” og svar til telefonbog-spørgsmålene Q1–Q4 (s. 12), som ikke står på slidene.',
        'Slide 19 henviser kun til `explanation_primes.pdf`/`explanation_primes.ipynb`. Markdown-konverteringen gengiver et afsnit derfra (eksempel med `k mod 12`), men filen findes ikke i materialet, så teksten kan ikke tjekkes.',
        'Slide 13 siger M = 11 (celler 0–10); bogens figur 5.1 med de samme fire navne har 10 celler (Weiss s. 194).',
        'Slide 8 viser det private datamedlem i `Dictionary` afkortet (“st…”); markdown-konverteringen skriver `std::unordered_map<KeyType, ValueType> hashTable`, hvilket ikke kan ses på slidet.',
        'Slidets `Employee::operator==` sammenligner navn, løn og anciennitet; bogens figur 5.8 sammenligner kun navnet (Weiss s. 199). Begge hasher kun navnet, så lige objekter får samme hash i begge versioner.',
        'Værste tid for en hashtabel angives hverken på slides eller i bogens kapitel 5 som et Big-O. Bogen giver kun, at den forventede længste kæde ved λ = 1 er Θ(log N / log log N) (5.7, s. 213), og at hashingens værste tilfælde “generally results from an implementation error” (s. 236). Markdown-konverteringen af bogen skriver “Worst-case O(N)”, som ikke står i bogen.',
        'Bogens 4.8.1–4.8.2 sætter ikke tid på ordnede `set`/`map` ud over “logarithmic” og kræver logaritmisk værste tid i 4.8.3 (s. 173–175). Gennemsnit og bedste tilfælde er ikke angivet.',
        '`CaseInsensitiveHashTable.cpp` bruger `ptr_fun`, som er fjernet i C++17-standarden. Den oversætter stadig med GCC 13 (`-std=c++17`), men ikke nødvendigvis med andre compilere.',
      ],
      keywords: ['ADS', 'AOD', 'SW2ADS', 'set', 'mængde', 'map', 'dictionary', 'ordbog', 'key-value store', 'nøgle', 'værdi', 'hashtabel', 'hash table', 'hashfunktion', 'hash function', 'std::hash', 'size_t', 'unordered_set', 'unordered_map', 'std::set', 'std::map', 'operator[]', 'pair<iterator,bool>', 'kollision', 'collision', 'primtal', 'prime table size', 'Horner', 'Horners regel', '37 * hashVal', 'djb2', 'tegnsum', 'EmployeeHash', 'myhash', 'hashToArray', 'telefonbog', 'phonebook', 'CaseInsensitive', 'mapDemo', 'WordLadder'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'separate-chaining',
      title: 'Separate chaining',
      week: 'Lektion 4',
      definition:
        '**Separate chaining** løser kollisioner ved at lade hver celle i hashtabellen pege på en linked list med alle de elementer, der hasher dertil. En operation hasher til den rette liste og søger lineært i den. **Load factor** λ = antal elementer / tabelstørrelse er listernes gennemsnitslængde, så operationerne koster O(λ) i gennemsnit og O(1), når λ holdes omkring 1 eller derunder.',
      concepts: [
        {
          term: 'Idéen: en liste pr. celle',
          body: [
            '“In separate chaining, each position of the array point to a linked list of colliding items” (L04 s. 28). Kolliderende elementer skelnes ved, at listen gemmer selve nøglen og nøgletypen har `operator==`, så man sammenligner nøglerne direkte.',
            'Figuren (s. 26, 28 og 30) er bogens figur 5.5: de ti første kvadrattal `0, 1, 4, 9, 16, 25, 36, 49, 64, 81` med `hash(x) = x mod 10`. Celle 0: `0`; 1: `81 → 1`; 4: `64 → 4`; 5: `25`; 6: `36 → 16`; 9: `49 → 9`; cellerne 2, 3, 7 og 8 er tomme. Tabelstørrelsen 10 er ikke et primtal, men “is used here for simplicity” (Weiss s. 196).',
            'Bogen nævner, at listen kunne være et søgetræ eller endda en ny hashtabel, men at listerne bør være korte, hvis tabellen er stor og hashfunktionen god, så simple lister er nok (s. 198). Se [[lister|lister]] for `std::list`.',
          ],
        },
        {
          term: 'Klassen: vector<list<HashedObj>>',
          body: [
            'Kursets `hash_table_chaining.h` (s. 27) er en skabelon med tre egenskaber: konstruktøren bruger en primtalsstørrelse (`theLists.resize(nextPrime(size))`, default 101), den interne struktur er en `vector<list<HashedObj>> theLists` (“The array of Lists”), og `myhash` hasher nøglen modulo M. `currentSize` tæller elementerne.',
            'Offentlige operationer: `makeEmpty`, `contains`, `insert`, `remove`. Private: `myhash` og `rehash`. Implementeringen står i `hash_table_chaining.tpp`, som inkluderes nederst i headeren. Bogens figur 5.6 har samme interface plus `insert(HashedObj&&)` (Weiss s. 197).',
          ],
        },
        {
          term: 'contains, insert og remove',
          body: [
            'Hver operation starter med at hashe til en liste: `auto& whichList = theLists[myhash(x)];`. Derefter bruges `std::find` i stedet for en eksplicit iteratorløkke (s. 29). `contains` returnerer `find(...) != end(whichList)`.',
            '`insert` returnerer `false`, hvis `x` allerede er i listen (ingen dubletter), ellers `push_back(x)`. Bagefter: `if (++currentSize > theLists.size()) rehash();` — tabellen vokser, når λ overstiger 1. `remove` finder iteratoren, returnerer `false` ved `end`, ellers `erase(itr)` og `--currentSize` (s. 29–30; figur 5.9–5.10, Weiss s. 200).',
            'Bogen bemærker, at et nyt element kan indsættes forrest, fordi nyligt indsatte ofte bliver slået op igen; `push_back` er blot det bekvemmeste i koden (s. 197–198).',
          ],
        },
        {
          term: 'Load factor λ',
          body: [
            'λ er “the ratio of elements in the table to the table size” (s. 30; Weiss s. 198). Figuren med kvadrattallene har 10 elementer i 10 celler, altså λ = 1,0.',
            'Menti-spørgsmålene “What is its load factor?” (s. 31–32) bruger to tabeller med 10 buckets. I den første ligger `20, 30, 40` i 0, `1, 11` i 1, `13` i 3, `14, 24` i 4, `6, 16` i 6 og `18, 28` i 8 — 12 nøgler, så λ = 12/10 = 1,2. I den anden har alle ti buckets tre nøgler (`10, 20, 30` … `19, 29, 39`) — 30 nøgler, λ = 3,0.',
            'Ved chaining kan λ blive større end 1, fordi listerne kan vokse. Ved probing kan λ aldrig overstige 1,0 (s. 39).',
          ],
        },
        {
          term: 'Analyse: O(λ) i gennemsnit',
          body: [
            'Slidet: “Operations cost O(λ) in average, since this is the expected length of each list. If the load factor is kept below 1.0, operations run in O(1) in average, assuming that objects will be evenly distributed” (s. 33).',
            'Bogen er mere præcis. En mislykket søgning gennemløber i gennemsnit λ knuder. En vellykket søgning gennemløber ca. 1 + λ/2: listen indeholder den ene knude med matchet plus i forventning (N − 1)/M = λ − 1/M ≈ λ andre, og man gennemsøger halvdelen af dem. Konklusionen: “the table size is not really important but the load factor is”, og tommelfingerreglen er λ ≈ 1 (Weiss s. 198–199).',
            'Ulempen er hukommelsen til de mange lister (s. 33), og bogen tilføjer, at allokering af nye celler kan gøre det langsommere og kræver en ekstra datastruktur (s. 201). Det er motivationen for [[open-addressing|open addressing]].',
          ],
        },
        {
          term: 'Rehash i chaining-tabellen',
          body: [
            '`rehash` (s. 34; figur 5.22, Weiss s. 211) kopierer `theLists` til `oldLists`, gør `theLists` til `nextPrime(2 * theLists.size())` tomme lister, sætter `currentSize = 0` og indsætter hvert element fra de gamle lister med `insert(std::move(x))`. Hvert element skal hashes igen, fordi `% M` ændres med M.',
            'Slidet opsummerer: “If capacity is reached and load factor degenerates, rehash() increases table” (s. 30), og tabellen holdes på et primtal (s. 34). Selve omkostningen gennemgås under [[open-addressing|rehashing]].',
          ],
        },
      ],
      viz: 'doa-chaining',
      keyPoints: [
        'Hver celle er en liste; kolliderende nøgler ligger i samme liste og skelnes med `operator==` (L04 s. 28).',
        'Datastruktur: `vector<list<HashedObj>> theLists` med primtalsstørrelse; `myhash(x) = hf(x) % theLists.size()` (L04 s. 27, 34).',
        'Alle operationer: hash til listen, derefter `std::find` i den (L04 s. 29).',
        'λ = elementer / tabelstørrelse = gennemsnitlig listelængde; λ kan overstige 1 (L04 s. 30).',
        'Kursets kode rehasher, når `++currentSize > theLists.size()`, altså når λ > 1 (L04 s. 29; Weiss s. 200).',
        'Ulempe: hukommelse og en ekstra datastruktur til listerne (L04 s. 33; Weiss s. 201).',
        'Kompleksitet (L04 s. 33; Weiss s. 199): `contains`/`insert`/`remove` bedste ikke angivet · gennemsnit O(λ), dvs. O(1) når λ < 1 · værste ikke angivet · plads ikke angivet.',
        'Kompleksitet (Weiss s. 199): søgning, forventet antal undersøgte knuder — mislykket λ · vellykket 1 + λ/2.',
        'Kompleksitet (Weiss s. 209): `rehash` O(N) for N elementer; bedste, gennemsnit og plads ikke angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Interface: hash_table_chaining.h',
          source: 'Lecture04.pdf s. 27',
          code: `#ifndef _SEPARATE_CHAINING_H_
#define _SEPARATE_CHAINING_H_

#include <vector>
#include <list>
#include <string>
#include <algorithm>
#include <functional>
using namespace std;

int nextPrime(int n);
bool isPrime(int n);

template<typename HashedObj>
class HashTable {
  public:
    HashTable(int size = 101):currentSize {0} {
        theLists.resize(nextPrime(size));
    }

    void makeEmpty();
    bool contains(const HashedObj& x) const;
    bool insert(const HashedObj& x);
    bool remove(const HashedObj& x);

  private:
    vector<list<HashedObj>> theLists;   // The array of Lists
    int currentSize;

    size_t myhash(const HashedObj& x) const;
    void rehash();
};

#include "hash_table_chaining.tpp"

#endif`,
        },
        {
          lang: 'cpp',
          title: 'contains, insert og remove (hash_table_chaining.tpp)',
          source: 'Lecture04.pdf s. 29 (Weiss s. 200, fig. 5.9–5.10)',
          code: `template<typename HashedObj>
bool HashTable<HashedObj>::contains(const HashedObj& x) const {
    auto& whichList = theLists[myhash(x)];
    return find(begin(whichList), end(whichList), x) != end(whichList);
}

template<typename HashedObj>
bool HashTable<HashedObj>::insert(const HashedObj& x) {
    auto& whichList = theLists[myhash(x)];
    if (find(begin(whichList), end(whichList), x) != end(whichList))
        return false;
    whichList.push_back(x);

    // Rehash; see Section 5.5
    if (++currentSize > theLists.size())
        rehash();

    return true;
}

template<typename HashedObj>
bool HashTable<HashedObj>::remove(const HashedObj& x) {
    auto& whichList = theLists[myhash(x)];
    auto itr = find(begin(whichList), end(whichList), x);

    if (itr == end(whichList))
        return false;

    whichList.erase(itr);
    --currentSize;
    return true;
}`,
        },
        {
          lang: 'cpp',
          title: 'myhash, rehash og primtalshjælpere (hash_table_chaining.tpp)',
          source: 'Lecture04.pdf s. 34 (Weiss s. 198, fig. 5.7; s. 211, fig. 5.22)',
          code: `template<typename HashedObj>
size_t HashTable<HashedObj>::myhash(const HashedObj& x) const {
    static hash<HashedObj> hf;
    return hf(x) % theLists.size();
}

template<typename HashedObj>
void HashTable<HashedObj>::rehash() {
    vector <list<HashedObj>> oldLists = theLists;

    // Create new double-sized, empty table
    theLists.resize(nextPrime(2 * theLists.size()));
    for (auto & thisList:theLists) {
        thisList.clear();
    }

    // Copy table over
    currentSize = 0;
    for (auto& thisList:oldLists) {
        for (auto& x:thisList) {
            insert(std::move(x));
        }
    }
}

int nextPrime(int n) {
    n += (n % 2 ? 0 : 1);
    while (!isPrime(n)) n += 2;
    return n;
}

bool isPrime(int n) {
    if (n == 2 || n == 3) return true;
    if (n == 1 || n % 2 == 0) return false;
    for (int i = 3; i * i <= n; i += 2)
        if (n % i == 0)
            return false;

    return true;
}`,
        },
      ],
      exam: [
        'Separate chaining gemmer alle nøgler, der hasher til samme celle, i en linked list i den celle. `contains`, `insert` og `remove` hasher til listen og søger lineært i den, så prisen er listens længde — i gennemsnit λ.',
        'Load factor er antal elementer divideret med tabelstørrelsen. Holder man λ omkring 1, er de gennemsnitlige operationer O(1); bogen giver λ knuder for en mislykket og 1 + λ/2 for en vellykket søgning. Kursets kode rehasher til `nextPrime(2 * M)`, når antallet overstiger M.',
        'Sådan løser du ‘beregn load factor’ (opgavetype fra Menti s. 31–32, ikke fra eksamenssæt): 1) tæl alle nøgler i alle buckets; 2) tæl buckets, også de tomme; 3) divider. Tabellen på s. 31 giver 12/10 = 1,2, tabellen på s. 32 giver 30/10 = 3,0.',
        'Sådan løser du ‘indsæt i en chaining-tabel i hånden’ (opgavetype fra figuren s. 26–30 med kvadrattallene og `x mod 10`): 1) beregn `x mod M` for hver nøgle i rækkefølge; 2) tilføj nøglen bagerst i den liste (`push_back`, som i kursets kode); 3) spring dubletter over; 4) tæl λ efter hver indsættelse, og rehash til `nextPrime(2M)` og indsæt alle igen, hvis λ overstiger grænsen.',
        'Chaining er enkelt og tåler λ over 1, men bruger ekstra hukommelse til listerne og kræver en ekstra datastruktur. Det er grunden til at kurset derefter viser open addressing, der bruger tabellens tomme celler i stedet.',
      ],
      sources: [
        { path: L04, original: 'Lecture04.pdf', pages: 's. 23–34', note: 'Hash Table with Chaining, load factor og Menti' },
        { path: CH45, original: BOOK, pages: 's. 196–201', note: '5.3 Separate Chaining (figur 5.5–5.10)' },
        { path: CH45, original: BOOK, pages: 's. 209–211', note: '5.5 Rehashing, figur 5.22' },
        { path: k('context/kode/kildekode_part5.md'), note: 'SeparateChaining.h' },
        { path: k('context/kode/kildekode_part9.md'), note: 'SeparateChaining.cpp (isPrime, nextPrime, hash)' },
        { path: k('context/kode/kildekode_part11.md'), note: 'TestSeparateChaining.cpp' },
      ],
      gaps: [
        'Markdown-konverteringen svarer λ = 13/10 = 1,3 på Menti s. 31. Tabellen i PDF’en har 12 nøgler (20, 30, 40, 1, 11, 13, 14, 24, 6, 16, 18, 28), altså λ = 1,2. PDF’en selv giver intet facit.',
        'Slide 48 anbefaler at rehashe en chaining-tabel ved λ ≥ 0,7. Bogen siger “let λ ≈ 1” (s. 199), og både slidets og bogens kode rehasher først, når `currentSize` overstiger tabelstørrelsen (λ > 1).',
        'Slidet siger O(λ) i gennemsnit (s. 33); markdown-konverteringens opsummeringstabel skriver O(1 + λ) for søgning og sletning, som ikke står på slidene. Bogen tæller knuder (λ og 1 + λ/2), ikke Big-O.',
        'Kursets `SeparateChaining.h` i kildekoden ignorerer konstruktørens `size` og kalder altid `theLists.resize(101)`; slidets `hash_table_chaining.h` bruger `nextPrime(size)` (s. 27).',
        'Værste tid for chaining (alle nøgler i én liste) og pladsforbruget angives ikke som Big-O i slides eller bog. Bogen giver kun den forventede længste liste ved λ = 1: Θ(log N / log log N) (5.7, s. 213).',
        'Uden for materialet: `++currentSize > theLists.size()` sammenligner `int` med `size_t` og giver `-Wsign-compare`-advarsel med `-Wall -Wextra`. Koden virker.',
      ],
      keywords: ['separate chaining', 'chaining', 'kædning', 'kædehashing', 'linked list', 'std::list', 'bucket', 'theLists', 'vector<list<HashedObj>>', 'load factor', 'belastningsfaktor', 'λ', 'lambda', 'myhash', 'rehash', 'nextPrime', 'isPrime', 'std::find', 'hash_table_chaining.h', 'hash_table_chaining.tpp', 'SeparateChaining.h', 'kvadrattal', 'O(λ)'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'open-addressing',
      title: 'Open addressing og rehashing',
      short: 'Open addressing',
      week: 'Lektion 4',
      definition:
        '**Open addressing** (probing) gemmer alle elementer direkte i tabellen. Ved kollision prøves cellerne `hᵢ(x) = (hash(x) + f(i)) mod M` for i = 0, 1, 2, …, til der findes en fri celle. Kurset viser **linear probing** (`f(i) = i`), **quadratic probing** (`f(i) = i²`) og **double hashing** (`f(i) = i · hash₂(x)`). Sletning kræver **lazy deletion**, λ kan højst blive 1, og quadratic probing kræver et primtal som tabelstørrelse og λ < 0,5 (Theorem 5.1) — ellers skal tabellen **rehashes**.',
      concepts: [
        {
          term: 'Idéen: brug tabellens tomme celler',
          body: [
            'Chaining kræver en ekstra datastruktur og hukommelse til listerne. “What if we use the hash table idle space? This is called open-addressing.” Ved en kollision itereres hashfunktionen, til en fri celle findes: `hᵢ(x) = hash(x) + f(i) mod M` (L04 s. 36).',
            'Bogen skriver `hᵢ(x) = (hash(x) + f(i)) mod TableSize` med `f(0) = 0` og kalder `f` for “the collision resolution strategy”. Fordi alle data ligger i tabellen, skal den være større end ved chaining; generelt bør λ være under 0,5 (Weiss s. 201).',
            'Fordi hvert element optager én celle, kan λ aldrig overstige 1,0 ved probing (s. 39).',
          ],
        },
        {
          term: 'Linear probing og primary clustering',
          body: [
            '`f(i) = i`: cellerne prøves i rækkefølge (med wraparound). Slidet indsætter `89, 18, 49, 58, 69` i en tabel med 10 celler og `x mod 10` (s. 37; figur 5.11, Weiss s. 201): 89 → 9; 18 → 8; 49 rammer 9 og går til **0**; 58 rammer 8, 9 og 0 og går til **1**; 69 rammer 9, 0 og 1 og går til **2**.',
            'Blokke af optagede celler begynder at vokse sammen: **primary clustering**. Enhver nøgle, der hasher ind i en klynge, skal bruge flere forsøg og gør derefter klyngen større (s. 37; Weiss s. 201). Slide 46: tiden er proportional med længden af den sammenhængende blok, operationen starter i; en maksimal blok på *k* celler rammes med sandsynlighed k/N og koster O(k).',
            'Bogen giver det forventede antal probes: ca. ½(1 + 1/(1 − λ)²) for indsættelse og mislykket søgning og ½(1 + 1/(1 − λ)) for vellykket søgning. Ved λ = 0,5 er det 2,5 og 1,5; ved λ = 0,75 er det 8,5 for indsættelse og ved λ = 0,9 omkring 50. Uden clustering (tilfældig strategi) ville det være 4 og 10 probes. Konklusion: linear probing er en dårlig idé, hvis tabellen er mere end halvt fuld (Weiss s. 201–202, figur 5.12).',
          ],
        },
        {
          term: 'Quadratic probing og secondary clustering',
          body: [
            '`f(i) = i²`: cellerne prøves i voksende afstand 1, 4, 9, … (s. 38; figur 5.13, Weiss s. 203). Samme input: 89 → 9; 18 → 8; 49 rammer 9 og går 1 frem til **0**; 58 rammer 8, prøver 9 (optaget) og så 8 + 4 = 12 → **2**; 69 rammer 9, prøver 0 og så 9 + 4 = 13 → **3**.',
            'Quadratic probing fjerner primary clustering, men nøgler med samme hashværdi prøver de samme alternative celler: **secondary clustering**. Bogen kalder det “a slight theoretical blemish”, der ifølge simuleringer koster under en halv ekstra probe pr. søgning (Weiss s. 207).',
            'Kursets `findPos` beregner kvadraterne uden multiplikation: `currentPos += offset; offset += 2;`, fordi `f(i) = f(i − 1) + 2i − 1`. Går positionen ud over tabellen, trækkes `array.size()` fra (s. 43; Weiss s. 205–206). Bogens advarsel: rækkefølgen af de to tests i `while` (`info != EMPTY` før `element != x`) må ikke byttes (s. 206).',
          ],
        },
        {
          term: 'Double hashing',
          body: [
            '`f(i) = i · hash₂(x)` kræver en anden, ukorreleret hashfunktion. Slidet: “marginally statistically better than quadratic probing but typically slower due to additional hashing. Quadratic probing suffices for us” (s. 39).',
            'Bogen: `hash₂` må aldrig give 0, og alle celler skal kunne nås. Med `hash₂(x) = R − (x mod R)` og R = 7 på samme input: 49 → `hash₂ = 7`, position 6; 58 → `hash₂ = 5`, position 3; 69 → `hash₂ = 1`, position 0 (figur 5.18). Fordi tabelstørrelsen 10 ikke er et primtal, har 23 kun én alternativ celle (Weiss s. 207–208).',
          ],
        },
        {
          term: 'Sletning: lazy deletion',
          body: [
            'Tankeeksperimentet (s. 40–41) bruger en linear-probing-tabel med 10 celler: `16` i 0, `6` i 1, `56` i 6, `46` i 7, `36` i 8 og `26` i 9. `contains(26)` starter i 6 og prøver 6, 7, 8 og finder 26 i 9. Efter en almindelig `remove(36)` er celle 8 tom — og så stopper `contains(26)` ved 8 og svarer forkert “ikke fundet”.',
            'Bogen siger det samme: fjerner man 89 fra eksemplet, fejler næsten alle andre `find` (Weiss s. 204). Løsningen er **lazy deletion**: hver celle har en status `enum EntryType { ACTIVE, EMPTY, DELETED }`, og `remove` sætter kun `info = DELETED`. En søgning fortsætter forbi `DELETED`, men stopper ved `EMPTY` (s. 42; figur 5.14).',
            'Prisen er, at slettede celler tæller med som optagede. Bogen: “This can cause problems, because the table can get too full prematurely” (s. 205).',
          ],
        },
        {
          term: 'Kursets QuadraticProbing.h: findPos og findPosToInsert',
          body: [
            'Tabellen er en `vector<HashEntry>`, hvor hver `HashEntry` har `element` og `info`; konstruktøren bruger `nextPrime(size)` (s. 42). `findPos(x)` bruges af `contains` og `remove` og prober kvadratisk, til den finder `x` eller en `EMPTY` celle (s. 43).',
            'Kursets version har desuden `findPosToInsert(x)`, som bruges af `insert`. Den stopper ved én af tre betingelser: cellen er `EMPTY`, cellen er `DELETED` (“available for reuse”), eller cellen er `ACTIVE` og indeholder `x`. Slidet spørger: “compare findPosToInsert with findPos. What are the differences?” (s. 44). Forskellen er betingelse 2 — `insert` genbruger slettede celler, mens `findPos` går forbi dem.',
            '`insert` (s. 45) returnerer `false`, hvis cellen er aktiv. Ellers tælles `currentSize` kun op, hvis cellen ikke var `DELETED`, elementet skrives, `info = ACTIVE`, og `if (currentSize > array.size() / 2) rehash();`. `remove` bruger `findPos`, returnerer `false` ved en ikke-aktiv celle og sætter ellers `info = DELETED`. `contains` er `isActive(findPos(x))`.',
          ],
        },
        {
          term: 'Theorem 5.1: primtal og λ < 0,5',
          body: [
            'Quadratic probing kan løbe uendeligt i en tabel, der er fyldt nok, men ikke fuld. Slide 47: tabelstørrelse 7, `hash(x) = x mod 7`, cellerne 0, 1, 3 og 6 optaget, og nøglen 6. Positionerne `(6 + i²) mod 7` for i = 0 … 9 er 6, 0, 3, 1, 1, 3, 0, 6, 0, 3 — sekvensen rammer aldrig 2, 4 eller 5, selv om de er tomme.',
            '**Theorem 5.1**: “If quadratic probing is used, and the table size is prime, then a new element can always be inserted if the table is at least half empty” (s. 48; Weiss s. 204). Beviset (s. 52–56, markeret “Optional”): antag at to af de første ⌈M/2⌉ positioner `h(x) + i²` og `h(x) + j²` er ens med i ≠ j. Så er `(i − j)(i + j) = 0 (mod M)`; da M er et primtal, må en af faktorerne være 0 mod M, men i ≠ j og `0 ≤ i, j ≤ ⌊M/2⌋` udelukker begge. De første ⌈M/2⌉ positioner er altså forskellige, og er højst ⌊M/2⌋ optaget, er én af dem fri.',
            'Reglen at huske: “always keep λ < 0.5”. Er λ ≥ 0,5, skal tabellen rehashes — obligatorisk ved quadratic probing. For chaining og linear probing anbefales rehash ved λ ≥ 0,7 (s. 48). Bogen: er tabellen blot én mere end halvt fuld, kan indsættelsen fejle, og uden primtal kan antallet af alternative celler blive stærkt reduceret — ved størrelse 16 er de eneste alternativer 1, 4 og 9 væk (Weiss s. 204).',
          ],
        },
        {
          term: 'Rehashing og dens pris',
          body: [
            'Slidets opskrift (s. 49): 1) alloker en ny tabel med `Capacity = NextPrime(2*OldCapacity)`; 2) indsæt hvert element fra den gamle tabel i den nye med den nye hashfunktion `hash(e) = e mod Capacity`; 3) slet den gamle tabel. `rehash()` i `QuadraticProbing.h` gør det og indsætter kun `ACTIVE` elementer, én ad gangen (s. 50; figur 5.22).',
            'Eksemplet er bogens (figur 5.19–5.21): 13, 15, 24 og 6 indsættes med linear probing i en tabel med 7 celler og `x mod 7` (13 → 6, 15 → 1, 24 → 3, 6 → 6 optaget → 0). Indsættes 23 (23 mod 7 = 2, fri), er tabellen over 70 % fuld. Ny størrelse er 17 — det første primtal, der er dobbelt så stort — og `x mod 17` giver 6 → 6, 15 → 15, 23 → 6 optaget → 7, 24 → 7 optaget → 8, 13 → 13 (Weiss s. 209–210; slide 49 viser før/efter).',
            'Pris: rehashing er O(N), fordi N elementer skal indsættes igen i en tabel på ca. 2N. Men der må have været N/2 indsættelser siden sidste rehash, så det “essentially adds a constant cost to each insertion” — derfor fordobles tabellen. En interaktiv bruger, hvis indsættelse udløser rehashen, kan dog mærke en forsinkelse (Weiss s. 209). Bogen nævner tre strategier for quadratic probing: rehash når tabellen er halvt fuld, først når en indsættelse fejler, eller ved en valgt λ-grænse (s. 210).',
          ],
        },
      ],
      viz: 'doa-probing',
      keyPoints: [
        'Probe-sekvens `hᵢ(x) = (hash(x) + f(i)) mod M`, `f(0) = 0`; linear `f(i) = i`, quadratic `f(i) = i²`, double `f(i) = i · hash₂(x)` (L04 s. 36–39; Weiss s. 201).',
        'Kursets input `89, 18, 49, 58, 69` med `x mod 10`: linear → 49, 58, 69 i celle 0, 1, 2; quadratic → 0, 2, 3 (L04 s. 37–38).',
        'Linear probing giver primary clustering, quadratic giver secondary clustering; double hashing kræver en ekstra hashfunktion (L04 s. 37–39, 46).',
        'Sletning skal være lazy: `ACTIVE`/`EMPTY`/`DELETED`, ellers afbrydes søgninger for tidligt (L04 s. 40–42; Weiss s. 204).',
        'Theorem 5.1: primtalsstørrelse + tabellen mindst halvt tom ⇒ quadratic probing finder altid en fri celle. Hold λ < 0,5; rehash ellers (L04 s. 47–48).',
        'Rehash: ny størrelse `nextPrime(2 * M)`, indsæt alle aktive elementer igen med den nye `mod` (L04 s. 49–50).',
        'Kompleksitet (L04 s. 4, 46, 48): `insert`/`contains`/`remove` med quadratic probing og λ < 0,5 bedste ikke angivet · gennemsnit O(1) · værste ikke angivet · plads ikke angivet; slide 46: en operation, der starter i en klynge på k celler, koster O(k).',
        'Kompleksitet (Weiss s. 201–202): linear probing, forventet antal probes — indsættelse/mislykket søgning ½(1 + 1/(1 − λ)²), vellykket søgning ½(1 + 1/(1 − λ)); λ = 0,5 giver 2,5 og 1,5.',
        'Kompleksitet (Weiss s. 209): `rehash` O(N), amortiseret en konstant ekstra pris pr. indsættelse; bedste og plads ikke angivet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'findPos og findPosToInsert (QuadraticProbing.h, kursets version)',
          source: 'Lecture04.pdf s. 43–44',
          code: `bool isActive( int currentPos ) const
  { return array[ currentPos ].info == ACTIVE; }

int findPos( const HashedObj & x ) const
{
    int offset = 1;
    int currentPos = myhash( x );

    while( array[ currentPos ].info != EMPTY &&
           array[ currentPos ].element != x )
    {
        currentPos += offset;  // Compute ith probe
        offset += 2;
        if( currentPos >= array.size( ) )
            currentPos -= array.size( );
    }

    return currentPos;
}

int findPosToInsert( const HashedObj & x ) const
{
    int offset = 1;
    int currentPos = myhash( x );

    // We wish to stop looping when one of the following conditions are met:
    // 1. the element is empty
    // 2. the element is marked as deleted and thus available for reuse, or
    // 3. the element is active and matches the new element to be inserted
    //    (in which case no new insertion will be made)
    while( ! (
           (array[ currentPos ].info == EMPTY) // 1
        || (array[ currentPos ].info == DELETED) // 2
        || (array[ currentPos ].info == ACTIVE
            && array[ currentPos ].element == x) // 3
        ))
    {
        currentPos += offset;  // Compute ith probe
        offset += 2;
        if( currentPos >= array.size( ) )
            currentPos -= array.size( );
    }

    return currentPos;
}`,
        },
        {
          lang: 'cpp',
          title: 'contains, insert og remove med lazy deletion',
          source: 'Lecture04.pdf s. 45',
          code: `bool contains( const HashedObj & x ) const
{
    return isActive( findPos( x ) );
}

bool insert( const HashedObj & x )
{
        // Insert x as active
    int currentPos = findPosToInsert( x );
    if( isActive( currentPos ) ){
        assert(array[ currentPos ].element == x);
        return false;
    }

    if( array[ currentPos ].info != DELETED )
        ++currentSize;

    array[ currentPos ] = std::move( x );
    array[ currentPos ].info = ACTIVE;

        // Rehash; see Section 5.5
    if( currentSize > array.size( ) / 2 )
        rehash( );

    return true;
}

bool remove( const HashedObj & x )
{
    int currentPos = findPos( x );
    if( !isActive( currentPos ) )
        return false;

    array[ currentPos ].info = DELETED;
    return true;
}

enum EntryType { ACTIVE, EMPTY, DELETED };`,
        },
        {
          lang: 'cpp',
          title: 'rehash for quadratic probing',
          source: 'Lecture04.pdf s. 50 (Weiss s. 211, fig. 5.22)',
          code: `void rehash( )
{
    vector<HashEntry> oldArray = array;

        // Create new double-sized, empty table
    array.resize( nextPrime( 2 * oldArray.size( ) ) );
    for( auto & entry : array )
        entry.info = EMPTY;

        // Copy table over
    currentSize = 0;
    for( auto & entry : oldArray )
        if( entry.info == ACTIVE )
            insert( std::move( entry.element ) );
}

size_t myhash( const HashedObj & x ) const
{
    static hash<HashedObj> hf;
    return hf( x ) % array.size( );
}`,
        },
      ],
      exam: [
        'Open addressing gemmer alt i selve tabellen og prøver `(hash(x) + f(i)) mod M` for i = 0, 1, 2, …. Linear probing (`f(i) = i`) giver primary clustering, quadratic probing (`f(i) = i²`) fjerner den, men har secondary clustering, og double hashing fjerner begge på bekostning af en ekstra hashfunktion. Kurset bruger quadratic probing.',
        'Sådan løser du ‘indsæt en sekvens med linear eller quadratic probing i hånden’ (opgavetype fra tabellerne på slide 37–38 med `89, 18, 49, 58, 69` og `x mod 10`, ikke fra eksamenssæt): 1) tegn tabellen med indeks 0 … M−1 og en kolonne pr. indsættelse; 2) beregn `x mod M`; 3) er cellen optaget, prøv `+1, +2, +3 …` (linear) eller `+1, +4, +9 …` (quadratic), altid `mod M`; 4) skriv nøglen i den første frie celle; 5) tæl λ og rehash, hvis grænsen overskrides.',
        'Sådan løser du ‘hvad gør contains efter remove?’ (tankeeksperimentet s. 40–41): 1) følg probe-sekvensen fra `hash(x)`; 2) vis at en fysisk tømt celle stopper søgningen for tidligt (`contains(26)` stopper ved celle 8 efter `remove(36)`); 3) forklar lazy deletion — `DELETED` springes over ved søgning, men må genbruges ved indsættelse, hvilket er forskellen på `findPos` og `findPosToInsert` (s. 44).',
        'Theorem 5.1 siger, at quadratic probing altid finder en fri celle, hvis tabelstørrelsen er et primtal og tabellen er mindst halvt tom, fordi de første ⌈M/2⌉ probe-positioner er forskellige. Derfor rehasher kursets kode, når `currentSize > array.size() / 2`. Uden primtal eller over halv fyld kan sekvensen gå i ring, som tabellen med 7 celler og nøglen 6 på slide 47 viser.',
        'Sådan løser du ‘rehash i hånden’ (opgavetype fra slide 49 og bogens figur 5.19–5.21): 1) ny størrelse = første primtal ≥ 2 · gammel størrelse (7 → 17); 2) gennemløb den gamle tabel fra indeks 0 og tag kun aktive elementer; 3) indsæt hvert med `x mod ny størrelse` og samme kollisionsstrategi. Rehash koster O(N), men kun efter ca. N/2 indsættelser, så det er en konstant ekstra pris pr. indsættelse.',
      ],
      sources: [
        { path: L04, original: 'Lecture04.pdf', pages: 's. 35–56', note: 'Hash Table with Probing, lazy deletion, Theorem 5.1, rehashing' },
        { path: CH45, original: BOOK, pages: 's. 201–208', note: '5.4 Hash Tables without Linked Lists (figur 5.11–5.18)' },
        { path: CH45, original: BOOK, pages: 's. 208–211', note: '5.5 Rehashing (figur 5.19–5.22)' },
        { path: k('context/kode/kildekode_part5.md'), note: 'QuadraticProbing.h (bogens version, uden findPosToInsert)' },
        { path: k('context/kode/kildekode_part9.md'), note: 'QuadraticProbing.cpp (isPrime, nextPrime)' },
        { path: k('context/kode/kildekode_part11.md'), note: 'TestQuadraticProbing.cpp' },
      ],
      gaps: [
        'Slide 36 skriver `hi(x) = hash(x) + f(i) mod M` uden parenteser; bogen skriver `(hash(x) + f(i)) mod TableSize` (Weiss s. 201). Det er bogens betydning, der gælder.',
        '`findPosToInsert` findes kun i slidenes `QuadraticProbing.h` (s. 44–45). Kildekodens `QuadraticProbing.h` (kildekode_part5.md) er bogens version, hvor `insert` bruger `findPos` og derfor kun genbruger en `DELETED` celle, der tilfældigvis indeholder samme nøgle. Bogens figur 5.17 tæller desuden `currentSize` op uden at tjekke for `DELETED`.',
        'Uden for materialet: slidenes `findPosToInsert` stopper ved den første `DELETED` celle uden at tjekke, om `x` ligger længere fremme i sekvensen. Testet i størrelse 7: `insert(3)`, `insert(10)` (→ celle 4), `remove(3)`, `insert(10)` returnerer `true` og skriver 10 i celle 3, så den gamle 10 i celle 4 bliver en usynlig dublet, der optager plads.',
        'Slide 54 (“Optional – notes on Theorem 5.1”) viser tabellen [0, 1, _, _, _] med størrelse 5 og placerer 10 (10 % 5 = 0) i celle **2** efter “i=1”. Med `f(i) = i²` er positionerne fra 0 kun 0, 1, 4 (0 + 4 = 4), og kursets `findPos` giver også 4. Slide 53–54 nummererer desuden det første spring 1 væk som “i=0”, hvor bogen kalder det i = 1. Markdown-konverteringens gennemgang af eksemplet er selvmodsigende.',
        'Slide 48 anbefaler rehash ved λ ≥ 0,7 for linear probing; bogen siger, at linear probing er en dårlig idé over halv fyld, og at λ generelt bør være under 0,5 for probing-tabeller (Weiss s. 201–202).',
        'Slide 47 kalder tabellen “table with 7 elements”; det er tabelstørrelsen (7 celler), hvoraf 4 er optaget.',
        'Slidenes trykte sidenumre er ét højere end PDF-sidetallet fra s. 35 og frem (fx står “38” på PDF-side 37). Henvisningerne her bruger PDF-sidetallet.',
        'Slidene angiver ingen værste tid og ingen pris for rehashing; O(N) og den amortiserede konstante pris står kun i bogen (s. 209). Ordet “amortiseret” bruges ikke i materialet — bogen siger “essentially adds a constant cost to each insertion”.',
        'Markdown-konverteringen af bogen skriver, at 69 ved double hashing havner i 0 “efter flere probes”; bogen siger, at 69 placeres `hash₂(69) = 1` væk, altså i første forsøg (s. 208).',
        'Cuckoo hashing (5.7) og `CuckooHashTable.h` findes i bog og kildekode, men nævnes ikke på slidene: ikke dækket af lektion 4.',
      ],
      keywords: ['open addressing', 'åben adressering', 'probing', 'probe', 'linear probing', 'lineær probing', 'quadratic probing', 'kvadratisk probing', 'double hashing', 'dobbelt hashing', 'hash2', 'primary clustering', 'secondary clustering', 'klynge', 'lazy deletion', 'doven sletning', 'ACTIVE', 'EMPTY', 'DELETED', 'EntryType', 'HashEntry', 'findPos', 'findPosToInsert', 'isActive', 'offset += 2', 'Theorem 5.1', 'Sætning 5.1', 'λ < 0.5', 'halvt tom', 'rehashing', 'rehash', 'nextPrime', 'amortiseret', 'QuadraticProbing.h', 'cuckoo'],
    },
  ],
}
