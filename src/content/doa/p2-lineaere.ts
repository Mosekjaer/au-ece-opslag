import type { Part } from '../types'
import { k, BOOK } from './paths'

export const lineaere: Part = {
  id: 'lineaere',
  title: 'ADT’er og lineære strukturer',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'adt',
      title: 'Abstrakte datatyper',
      short: 'ADT',
      week: 'Lektion 2–3',
      definition:
        'En **abstrakt datatype (ADT)** er “a value or set of values that can be accessed only through an *interface*” (L02 s. 46). Bogen siger det samme med andre ord: en mængde objekter sammen med en mængde operationer, hvor definitionen intet siger om, *hvordan* operationerne er implementeret. Målet er at adskille interface fra implementering, så klienten ikke afhænger af detaljerne, og implementeringen kan udskiftes.',
      intro: [
        'ADT-afsnittet afslutter Lektion 2 (L02 s. 45–62) og er grundlaget for resten af kurset: [[lister|lister]], [[stakke-koeer|stakke og køer]], [[hashtabeller|sets og maps]] og [[binaer-heap|prioritetskøer]] præsenteres alle som en ADT med én eller flere implementeringer. Lektion 3 bygger videre med List-ADT’en og “inheritance-metoden” (L03 s. 4, 36, 57).',
      ],
      concepts: [
        {
          term: 'Hvorfor datastrukturer — arrays’ begrænsninger',
          body: [
            'Slidet starter med arrayet: vi kan effektivt gemme, tilgå og ændre data i det, og spørger “What is the time complexity of these operations?” (L02 s. 48). Svaret står ikke på slidet; bogen giver det: `findKth` er konstant tid, mens indsættelse og sletning forrest kræver, at hele arrayet flyttes, altså O(N) (Weiss s. 78).',
            'Begrænsningerne (L02 s. 49): kapaciteten er i princippet fastlagt ved erklæringen, og elementer kan ikke let fjernes, så dynamiske data er svære. Det sker ofte i praksis — fx når man læser fra en fil eller fra tastaturet og ikke kender antallet på forhånd.',
            'Pointen er abstraktion: “We will define the abstract objects we want to manipulate and the operations we perform, initially without worrying about how to represent the data” (L02 s. 50). Kurset går fra C-structs med pointere til C++-klasser.',
          ],
        },
        {
          term: 'Definitionen og målet',
          body: [
            'Definitionsboksen (L02 s. 46 og 51): en ADT er en værdi eller mængde af værdier, der kun kan tilgås gennem et **interface**. Man kan også se den som en matematisk abstraktion, hvor de offentlige funktioner er interfacet.',
            'Målet er det samme uanset metode: “separate the interface from the implementation, and therefore hide (i.e., decouple) the implementation details from the client” (L02 s. 51).',
            'Bogen (3.1, s. 77) tilføjer to ting. Der er ingen regel for, hvilke operationer en ADT skal have — det er et designvalg; en set-ADT kan have `add`, `remove`, `size` og `contains`, eller kun `union` og `find`, og så er det en *anden* ADT. Og hvis implementeringen skal ændres, bør det kunne ske ved kun at ændre de rutiner, der udfører operationerne, “completely transparent to the rest of the program”.',
          ],
        },
        {
          term: 'List-ADT’en og tre implementeringer',
          body: [
            'Slidets eksempel er en generisk `List<T>` i UML med operationerne `headInsert(const T& x)`, `headRemove()`, `insert(const T& data, unsigned int index)`, `remove(unsigned int index)`, `length(): unsigned int`, `clear()` og `at(unsigned int i): T` (L02 s. 46).',
            'Klassediagrammet på s. 47 viser tre klasser, der realiserer interfacet (stiplede pile med hul trekant): `VectorList` (privat `vector<T> myList`, afhænger af «library» `std::Vector`), `LinkedList` (privat `Node<T> root`, hvor `Node` har `value` og `next`) og `DoublyLinkedList` (privat `DllNode<T> root`, hvor `DllNode` har `value`, `next` og `prev`). Alle tre har præcis samme offentlige operationer — klienten kan skifte mellem dem uden at ændre sin kode.',
            'Lektion 3 definerer listen matematisk: en sekvens `A0, A1, …, AN-1` af størrelse `N`; den tomme liste har størrelse 0; `Ai` efterfølger `Ai-1`, og positionen af `Ai` er `i` (L03 s. 4; Weiss 3.2, s. 78). Bogens operationer er `printList`, `makeEmpty`, `find`, `insert`, `remove` og `findKth`, med eksemplet 34, 12, 52, 16, 12: `find(52)` giver 2, `insert(x,2)` giver 34, 12, x, 52, 16, 12.',
          ],
        },
        {
          term: 'Point-ADT’en: to måder at definere en ADT i C++',
          body: [
            '**Method 1: Use inheritance** (L02 s. 52). `point.h` er en klasse med kun offentlige *pure virtual* metoder: `distance(Point& a)`, `getX()` og `getY()`. `pointimpl.h` definerer `class PointImpl : public Point` med de private felter `float x, y`, to konstruktører og implementeringerne. Slidets pointe: `distance` tager en `Point&` — “The distance only needs another Point, and not another PointImpl.” Testkoden gemmer `PointImpl`-objekter i en `vector` og kalder `array[i].distance(array[j])` (pass by reference).',
            '**Method 2: Use abstract classes (method preferred by the book)** (L02 s. 53). Her er `Point` en almindelig klasse med private `float x, y` og offentlige `Point()`, `~Point()` og `distance(Point a)`; implementeringen ligger i `point.cpp`. Konstruktøren laver et tilfældigt punkt, destruktøren er triviel (automatisk hukommelse), og `distance()` kan tilgå de interne data direkte (s. 54).',
            'Testprogrammet `test_point.cpp` (s. 55) læser `N` og `d` fra kommandolinjen, allokerer `Point *array = new Point[N]`, tæller par med `distance < d` i en dobbeltløkke og slutter med `delete [] array`. Slidet fremhæver namespace, blandingen med C-biblioteksfunktioner (`atoi`, `atof`) og dynamisk allokering.',
            '`point_plus` (s. 56–57) forbedrer interfacet: `distance` bliver en `static` klassefunktion (`Point::distance(a, b)`), og der tilføjes `friend`-operatorerne `operator==` (afstand under `EPSILON 0.001f`) og `operator<<`. Så kan `Point` printes og sammenlignes “as if Point was a basic type” — uden at klienten kender implementeringen.',
          ],
        },
        {
          term: 'Inheritance- vs. abstract class-tilgangen (MaxHeap)',
          body: [
            'Slides 58–61 gentager de to tilgange med en `MaxHeap` (operationerne `isEmpty`, `size`, `insert`, `findMax`, `deleteMax`; selve heapen kommer i [[binaer-heap|Binær heap]]).',
            '**Inheritance approach** (s. 58–59): interfacet er en **abstract base class** med kun offentlige *pure virtual* metodeerklæringer i en separat header. `class MaxHeapVector : public MaxHeap` implementerer den med en privat `vector<int> v`. Flere implementeringer kan eksistere side om side (“MaxHeapVector or MaxHeapList”), og basisklassen kan ikke instantieres, men kan bruges som pointer- og referencetype: `MaxHeap *m = new MaxHeapVector();`.',
            '**Abstract class approach** (s. 60–61): interfacet er de offentlige metoder i én almindelig klasse; implementeringen er privat (`vector<int>* elements`). Brugen er standard — `MaxHeap heap = MaxHeap();` — og der er ingen arv, så der kan kun være **én** implementering af interfacet.',
            'Det er samme skel som Point-eksemplet: metode 1 = arv fra et rent interface (flere implementeringer), metode 2 = én klasse med private/public (én implementering). Skellet svarer til “programmér mod kontrakten” i [[swd/oo-grundbegreber|OO-grundbegreber og interfaces]].',
          ],
        },
        {
          term: 'ADT’er i Lektion 3: fra int-liste til template og arv',
          body: [
            'L03 viser tre trin i samme retning. Først skjules pointerne i en klasse med privat `Node`-type og head/tail-markører, så “the interface does not leak implementation details” (L03 s. 8). Så gøres listen generisk med `template <typename Object>`, fordi en int-liste ikke kan genbruges til andre typer (s. 32–35). Til sidst defineres List-ADT’en som abstrakt basisklasse `simple_list.h` med pure virtual `size`, `empty`, `clear`, `push_front`, `push_back`, `pop_front`, `pop_back` og `find_kth`, som både `LinkedList` (s. 36) og `DoubleLinkedList` (s. 57) arver fra — “the same interface as the one implemented for Linked Lists”.',
            'Stakken og køen genbruger bagefter listen direkte (s. 63, 71): “That is again the power of abstraction.” Se [[stakke-koeer|Stakke og køer]].',
          ],
        },
        {
          term: 'Pre- og postconditions',
          body: [
            'Idéen: brug **assertions** til at håndhæve kontrakter mellem en funktion/et objekt og dets klienter (L02 s. 62). Slidet stiller diskussionsspørgsmålene “is this a good idea or a bad one?”, “What does a contract mean?” og “What are the alternatives?” og henviser til et eksempel på riptutorial.com.',
            'Fordele: kontrakten håndhæves aktivt, det overholder *fail-first*-princippet, og assertions fungerer som dokumentation af *hvad* en funktion gør uden at vise *hvordan*. Ulempe: mere kode = mere vedligehold.',
            'Kursets egen kode bruger mønstret: `assert(pos >= 0 && pos < theSize)` i `insert`, `find_kth` og `remove` (L03 s. 18, 29), `assert(size < N)` i køens `put` og `assert(empty() == false)` i `get` (L03 s. 68). `test_point.cpp` og MaxHeap-testen inkluderer `<assert.h>`/`<cassert>` (L02 s. 55, 61). Bogen kalder `pop` eller `top` på en tom stak “an error in the stack ADT”, mens at løbe tør for plads ved `push` er “an implementation limit but not an ADT error” (Weiss s. 103).',
          ],
        },
      ],
      viz: 'doa-adt',
      keyPoints: [
        'ADT = værdier, der kun kan tilgås gennem et interface; hvad, ikke hvordan (L02 s. 46; Weiss s. 77).',
        'Målet er at skjule implementeringen for klienten, så den kan udskiftes uden at klientkoden ændres (L02 s. 51).',
        'Hvilke operationer en ADT har, er et designvalg — andre operationer giver en anden ADT (Weiss s. 77).',
        'Method 1/inheritance: rent virtuelt interface + arvende implementeringer; tillader flere implementeringer og brug via pointer/reference (L02 s. 52, 58–59).',
        'Method 2/“abstract class”: én klasse med private data og offentlige metoder; kun én implementering (L02 s. 53, 60–61).',
        'Klassediagrammet: `List` realiseres af `VectorList`, `LinkedList` og `DoublyLinkedList` med identisk interface (L02 s. 47).',
        'Pre/postconditions med `assert`: håndhæver kontrakten, fail-first, dokumentation — men mere kode (L02 s. 62).',
        'Kompleksitet (Weiss s. 78): array-listen `findKth` O(1) · `printList` O(N) · indsæt/slet forrest værste O(N), gennemsnit O(N) (halvdelen flyttes) · indsæt/slet bagerst O(1) · plads ikke angivet. ADT’en selv fastlægger ingen kompleksitet — den afhænger af implementeringen, se [[lister|Lister]].',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Method 1: inheritance — point.h og pointimpl.h (`cy` rettet til `dy`)',
          source: 'Lecture02.pdf s. 52',
          code: `// point.h
#pragma once
class Point
{
    /*Represents a point in a
      two dimentional plane*/
public:
    /*calculates the distance
      from this point to a */
    virtual float distance(Point& a) = 0;
    virtual float getX() = 0;
    virtual float getY() = 0;
};

// pointimpl.h
#pragma once
#include "point.h"
#include <math.h>
class PointImpl:
    public Point
{
private:
    float x, y;
public:
    PointImpl(float xp, float yp) {
        x = xp;
        y = yp;
    }
    PointImpl() {
        x = 1.0 * rand() / RAND_MAX;
        y = 1.0 * rand() / RAND_MAX;
    }
    ~PointImpl() {}
    inline float getX() { return x; }
    inline float getY() { return y; }
    float distance(Point& a) {
        float dx = x - a.getX();
        float dy = y - a.getY();
        return sqrt(dx * dx + dy * dy);
    }
};`,
        },
        {
          lang: 'cpp',
          title: 'Method 2: “abstract classes” — point.h og point.cpp',
          source: 'Lecture02.pdf s. 53',
          code: `// point.h
#ifndef _POINT_H_
#define _POINT_H_

class Point {
    private:
        float x, y;

    public:
        Point();
        ~Point();
        float distance(Point a);
};

#endif

// point.cpp
#include <math.h>
#include "point.h"
#include <stdlib.h>

/* Constructor of a point. */
Point::Point() {
  x = 1.0 * rand() / RAND_MAX;
  y = 1.0 * rand() / RAND_MAX;
}

/* Destructor of a point. */
Point::~Point() {}

/* Compute the distance to another point. */
float Point::distance(Point a) {
  float dx = x - a.x;
  float dy = y - a.y;
  return sqrt(dx * dx + dy * dy);
}`,
        },
        {
          lang: 'cpp',
          title: 'MaxHeap som abstrakt basisklasse + brug via pointer (uddrag)',
          source: 'Lecture02.pdf s. 58–59',
          code: `// MaxHeap.h
#pragma once
#include <vector>

using namespace std;

class MaxHeap {

public:
  // is the heap empty?
  virtual bool isEmpty() const = 0;

  // number of elements in the heap
  virtual int size() = 0;

  // add an element to the heap
  virtual void insert(const int x) = 0;

  // find the maximum element in the heap
  virtual const int findMax() const = 0;

  // delete and return the maximum element of the heap
  virtual int deleteMax() = 0;
};

// Main.cpp (uddrag; MaxHeapVector : public MaxHeap står på s. 59)
int main(void){
    MaxHeap *m = new MaxHeapVector();
    m->insert(2);
    m->insert(3);
    m->insert(-1);
    // ...
}`,
        },
      ],
      exam: [
        'En ADT er en mængde værdier, der kun kan tilgås gennem et interface. Den siger hvilke operationer der findes og hvad de gør, men ikke hvordan; derfor kan jeg udskifte `VectorList` med `LinkedList` bag samme `List`-interface uden at røre klientkoden.',
        'Kurset viser to måder i C++: med arv, hvor interfacet er en klasse med pure virtual metoder og implementeringerne arver fra den — det tillader flere implementeringer og brug via `MaxHeap*` — eller med én klasse, hvor data er private og metoderne offentlige, hvilket kun giver én implementering. Bogen foretrækker den sidste.',
        'Hvilken implementering jeg vælger, afhænger af operationerne: et array giver `findKth` i O(1), men indsættelse forrest i O(N); en hægtet liste er omvendt. ADT’en fastlægger ikke kompleksiteten — det gør implementeringen.',
        'Pre- og postconditions skriver jeg som `assert`, fx `assert(pos >= 0 && pos < theSize)`. De håndhæver kontrakten og fejler tidligt, og de dokumenterer hvad funktionen kræver; prisen er mere kode at vedligeholde.',
        'Sådan løser du “design en ADT og vis implementeringer” (opgavetype udledt af L02 s. 46–47 og L03 s. 36/57, ikke af eksamenssæt): 1) skriv interfacet som UML-klasse eller C++-header med kun operationerne (pure virtual ved arv); 2) tegn en implementeringsklasse pr. datastruktur med dens private felter (`vector<T>`, `Node* head` …) og realiseringspil op til interfacet; 3) angiv pr. operation hvilken kompleksitet hver implementering giver; 4) begrund valget ud fra de operationer, opgaven bruger mest.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture02_BigO_ADT.md'), original: 'Lecture02.pdf', pages: 's. 45–62', note: 'Data structures, ADT, Point, MaxHeap, pre/post conditions' },
        { path: k('context/lessons/SW2ADS_Lecture03_Lists_Stacks_Queues.md'), original: 'Lecture03.pdf', pages: 's. 4, 8, 32–36, 57', note: 'List-ADT’en, templates og inheritance-metoden' },
        { path: k('context/book/AOD_Ch02-03_BigO_ADT.md'), original: BOOK, pages: 's. 77–78', note: '3.1 Abstract Data Types (ADTs)' },
        { path: k('context/book/AOD_Ch03_Lists_Stacks_and_Queues.md'), original: BOOK, pages: 's. 78–79, 103', note: '3.2 List ADT og 3.2.1 array-implementering; 3.6.1 fejl i stack-ADT’en' },
      ],
      gaps: [
        'Navngivningen er forvirrende: “Method 1: Use inheritance” (L02 s. 52) bruger en klasse med kun pure virtual metoder — altså en abstrakt klasse i C++-forstand — mens “Method 2: Use abstract classes (method preferred by the book)” (s. 53) og “Abstract class – approach” (s. 60) er en almindelig, konkret klasse uden virtuelle metoder. Slide 58 kalder selv inheritance-tilgangens interface en “abstract base class”.',
        'Slidet påstår at bogen foretrækker metode 2 (L02 s. 53). Bogen siger kun at C++-klassen tillader ADT-implementering med skjulte detaljer (s. 77) og at arv er “a powerful construct not otherwise used in the book” (s. 93) — ingen eksplicit sammenligning.',
        '`pointimpl.h` på L02 s. 52 har en tastefejl: `return sqrt(dx * dx + cy * dy);` — `cy` findes ikke, så koden kompilerer ikke. Kodeeksemplet ovenfor bruger `dy`.',
        '`point_plus.cpp` (L02 s. 56) skriver i `operator<<` til `cout` i stedet for til parameteren `t`, og `operator==` returnerer `int`. Uden for materialet: det virker kun, fordi `t` i testen er `cout`.',
        '`MaxHeap.h` (L02 s. 58) har ingen virtuel destruktor, og `const int findMax()` giver advarslen “type qualifiers ignored on function return type” med `-Wextra`. Uden for materialet: `delete` gennem en `MaxHeap*` uden virtuel destruktor er udefineret adfærd; slidet kalder aldrig `delete m`.',
        'Klassediagrammet (L02 s. 47) skriver `insert(const &T data, …)` i stedet for `const T&`, og `DllNode` har `+Node next`/`+Node prev` i stedet for `DllNode`.',
        'Pre/post-slidet (L02 s. 62) har kun en link til riptutorial.com og ingen kode. Markdown-konverteringen (afsnit 9.3) tilføjer `swap`- og `insertion_sort`-eksempler med `assert`, som ikke står i PDF’en.',
        'Slidet spørger om arrayoperationernes tidskompleksitet (L02 s. 48) uden at svare; værdierne ovenfor er fra bogen (s. 78).',
        'Sidetal: henvisningerne “L02 s. N” er PDF-sidetal. Sidefoden på slidene viser et højere tal (fx PDF-side 48 = slide 51, PDF-side 58 = slide 62), fordi der er skjulte slides.',
      ],
      keywords: ['ADS', 'AOD', 'SW2ADS', 'ADT', 'abstract data type', 'abstrakt datatype', 'interface', 'grænseflade', 'implementering', 'information hiding', 'encapsulation', 'pure virtual', 'abstract base class', 'abstrakt basisklasse', 'inheritance', 'arv', 'Point', 'PointImpl', 'MaxHeap', 'MaxHeapVector', 'List ADT', 'VectorList', 'LinkedList', 'DoublyLinkedList', 'klassediagram', 'precondition', 'postcondition', 'assert', 'kontrakt', 'fail-first', 'friend', 'static'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'lister',
      title: 'Lister: array vs. linked',
      short: 'Lister',
      week: 'Lektion 3',
      definition:
        'List-ADT’en kan implementeres med et **array** (sammenhængende hukommelse, fx `vector`) eller en **hægtet liste** (*linked list*), hvor hvert element ligger i en node med et link til næste node. Arrayet giver opslag på position i O(1), men indsættelse og sletning forrest i O(N); den hægtede liste giver indsættelse og sletning i O(1), når man står det rigtige sted, men opslag på position i O(N). En **doubly linked list** har også et link til forgængeren og kan derfor også ændres i O(1) bagerst.',
      intro: [
        'Lektion 3 bygger listen op i trin: en enkelt-hægtet int-liste med head/tail-sentineller (`simple_int_list`), en template-version (`simple_list`), en version med arv fra et abstrakt List-interface, og til sidst en dobbelt-hægtet liste (`double_list`). Bogen (Weiss 3.2–3.5) gør det samme med STL’s `vector` og `list` og sine egne `Vector` og `List`.',
      ],
      concepts: [
        {
          term: 'Array-implementeringen',
          body: [
            'Bogen (3.2.1, s. 78): alle List-operationer kan laves med et array. `vector` gemmer internt et array og fordobler kapaciteten, når det er fuldt, så man ikke længere behøver at kende maksimumstørrelsen. `printList` er lineær, `findKth` er konstant tid. Men indsættelse på position 0 kræver at hele arrayet skubbes én plads, og sletning af første element flytter alle op; i gennemsnit flyttes halvdelen, så begge er lineære. Sker alle ændringer i den høje ende, flyttes intet, og de tager O(1).',
            'Konklusionen: bygges listen op ved indsættelser bagerst og derefter kun opslag, er arrayet godt. Sker der indsættelser og sletninger overalt — især forrest — er det ikke (s. 79).',
            'Kursets `Vector.h` (Weiss fig. 3.7–3.8) gemmer `theSize`, `theCapacity` og `Object * objects`. `push_back` kalder `reserve( 2 * theCapacity + 1 )`, når `theSize == theCapacity`; `reserve` allokerer et nyt array, flytter elementerne over og frigiver det gamle (Weiss s. 90). Vektorens iteratorer er blot pointere: `typedef Object * iterator` (s. 90–91; se [[pointere-iteratorer|Pointere og iteratorer]]).',
          ],
        },
        {
          term: 'Linked list, noder og sentinel',
          body: [
            'Definitionen: “A *linked list* is a set of items where each item is part of a *node* that also contains a *link* to another node” (L03 s. 5). I C manipulerede man pointerne direkte, og det “breaks the abstraction”. Det er typisk at bruge en **sentinel node** til at markere slutningen, men der er andre konventioner (NULL-pointer eller cirkulær liste). Slidets figur er `4 → 6 → 1 → s` med en pointer `p` på første node.',
            'Slide 7 stiller “Happy” op som array (indeks 0–4, sammenhængende) og som hægtet liste (fem noder med `item` og `next`); slide 41 tilføjer den dobbelt-hægtede variant med `prev`, `item` og `next`.',
            '`simple_int_list.h` (L03 s. 8) skjuler pointerne: en privat `struct Node { int value; Node *next; }`, felterne `theSize`, `head` og `tail` og en offentlig grænseflade `size`, `empty`, `clear`, `push_front`, `insert`, `find_kth`, `pop_front` og `remove`. `head` og `tail` er markørnoder: `h → 4 → 6 → 1 → t`. Konstruktøren opretter de to noder og sætter `head->next = tail`; destruktøren kalder `clear()` og sletter dem (s. 10).',
            'Bogen kalder de ekstra noder **sentinel nodes** — header node forrest og tail node bagerst — og begrunder dem: de fjerner specialtilfælde, fx at fjernelse af første node ellers kræver at listens link til første node opdateres, fordi der ingen node er før den (Weiss s. 92, fig. 3.9–3.10).',
          ],
        },
        {
          term: 'Operationerne i den enkelt-hægtede liste',
          body: [
            '**`clear()`** (L03 s. 9–15) går fra `p = head->next` til `p == tail`: gem `t = p->next`, `delete p`, `p = t`, `head->next = t`. Animationen på `h → 4 → 6 → 1 → t` sletter 4, så 6, så 1, til `head->next == tail` og listen er tom. Refleksionen på s. 17 spørger, om der er en fejl: `theSize` sættes aldrig til 0.',
            '**`push_front(x)`** (s. 18–20): ny node `p`, `p->next = head->next`, `head->next = p`, `theSize++`. Et konstant antal skridt — O(1).',
            '**`insert(x, pos)`** (s. 21–26) skal først finde **forgængeren**: `p = head->next`, og mens `pos > 1`: `p = p->next; pos--`. Så `q->next = p->next; p->next = q`. Slidets eksempel er `insert(x,2)` på `h → 4 → 6 → t`: `p` starter på 4 med `pos = 2`, går til 6 med `pos = 1`, og `x` hægtes ind efter 6, så listen bliver `h → 4 → 6 → x → t`.',
            '**`find_kth(pos)`** (s. 27–28) går `pos` skridt fra `head->next` med betingelsen `pos > 0` — ikke `pos > 1` som i `insert`, fordi `insert` skal stoppe på forgængeren, mens `find_kth` skal stå *på* elementet. Fællesøvelsen er `find_kth(2)` på `h → 4 → 6 → 3 → t` (svar: 3).',
            '**`pop_front()`** er O(1); **`remove(pos)`** skal igen finde forgængeren (s. 29). `size()` returnerer blot `theSize`, som holdes opdateret ved hver indsættelse og sletning (s. 30).',
          ],
        },
        {
          term: 'Bagerst i en enkelt-hægtet liste',
          body: [
            'Inheritance-versionen `LinkedList : public List<Object>` (L03 s. 36) har `push_back`, der starter i `head` og går til `last->next == tail`, og `pop_back`, der går til `second_to_last->next->next == tail`. Begge løkker gennemløber listen. Slidet skriver om de to nye operationer, at de er “introduced for the sake of motivating the next data structure”.',
            'Fællesøvelsen spørger om kompleksiteten af at fjerne/indsætte bagerst (s. 38), og Menti-spørgsmålet (s. 39), om det ville hjælpe at gemme næstsidste node i et privat felt ligesom `tail`. Bogen svarer på det sidste: at indsætte bagerst kan være O(1) med en pointer til sidste node, men at fjerne sidste element kræver næstsidste, og “the obvious idea of maintaining a third link to the next-to-last node doesn’t work, because it too would need to be updated during a remove” (Weiss s. 80). Løsningen er en forgængerpointer i hver node.',
          ],
        },
        {
          term: 'Doubly linked list',
          body: [
            'Definition: “A *doubly linked list* is a linked list where each node has references to the previous and the next node” (L03 s. 40). `double_list.h` (s. 42) tilføjer `Node *prev` i noden og `push_back`/`pop_back` i interfacet; konstruktøren sætter `head->next = tail`, `tail->prev = head` og `head->prev = tail->next = nullptr`. “Basically we need to update more pointers inside the operations.”',
            '**`push_front(x)`** fra tom liste (s. 43–46): `t = head->next`; `p->prev = head`, `p->next = t`, `t->prev = p`, `head->next = p`. **`push_back(x)`** på listen `h ⇄ y ⇄ t` (s. 47–50): `t = tail->prev` (her `y`); `p->prev = t`, `p->next = tail`, `t->next = p`, `tail->prev = p`. Ingen løkke.',
            '**`pop_front()`/`pop_back()`** (s. 52–55): hægt nabonoderne sammen uden om `p` og `delete p`. “Now we can remove elements at the end/front in O(1) by just adjusting the pointers!” Og mere generelt: man kan fjerne *ethvert* element i O(1) givet en pointer — men det bryder abstraktionen, “so we will need iterators to make it elegant again” (s. 56).',
            'Slide 57 viser `DoubleLinkedList : public List<Object>` med samme interface som den enkelt-hægtede liste, og Menti på s. 58 spørger om kompleksiteten af `push_back` og `pop_back`.',
          ],
        },
        {
          term: 'Iteratorer: O(1) på en kendt position',
          body: [
            'Det slidet lover på s. 56, leverer bogen i 3.3.1 og 3.5. En position repræsenteres af en indlejret type `iterator`; `begin()` giver første element og `end()` endmarkøren efter sidste. `insert(iterator pos, x)` indsætter *før* `pos` og er konstant tid for `list`, men ikke for `vector`; `erase(iterator pos)` fjerner elementet, returnerer positionen efter, og gør `pos` ugyldig (Weiss s. 82–83).',
            'I Weiss’ `List.h` (fig. 3.18, 3.20) er det én linje hver: `p->prev = p->prev->next = new Node{ x, p->prev, p }` ved insert, og `p->prev->next = p->next; p->next->prev = p->prev;` ved erase. `push_front`, `push_back`, `pop_front` og `pop_back` er blot `insert`/`erase` på `begin()` og `--end()` (Weiss s. 100–101).',
            '`removeEveryOtherItem` (fig. 3.5) fjerner hvert andet element med `itr = lst.erase( itr )`: 6, 5, 1, 4, 2 bliver til 5, 4. På en `list` er det lineært, fordi hvert `erase` er O(1); på en `vector` er det kvadratisk, fordi hvert `erase` er O(N). Bogens målinger: 0,039 s for 800.000 elementer i en `list`, næsten fem minutter i en `vector` (Weiss s. 83–84).',
          ],
        },
        {
          term: 'Templates',
          body: [
            'En int-liste kan kun rumme `int`. “C++ provides a meta-programming facility called templates that fits the job” (L03 s. 32). `simple_list.h` erklærer `template <typename Object> class List` med `Object data` i noden (s. 33). Templates har ingen separat implementeringsfil, så simple funktioner står i headeren, og de komplekse ligger i `simple_list.tpp`, som headeren `#include`’er til sidst.',
            'Ændringen i implementeringen er lille — “The compiler deals with the abstraction” — men hver funktion skal have `template <typename Object>` foran (s. 34). Testen bruger samme operationer på `List<int>` og `List<float>` (s. 35).',
          ],
        },
      ],
      viz: 'doa-list-insert',
      keyPoints: [
        'Array: sammenhængende, opslag på position i O(1), ændringer forrest O(N). Linked list: noder med links, ændringer O(1) på kendt position, opslag O(N).',
        'Sentinel-noderne `head` og `tail` fjerner specialtilfælde ved første og sidste element (L03 s. 8; Weiss s. 92).',
        '`insert` og `remove` på position skal finde **forgængeren** (`pos > 1`); `find_kth` stopper *på* elementet (`pos > 0`).',
        'En enkelt-hægtet liste kan ikke fjerne bagerst hurtigt — man mangler næstsidste node. Doubly linked list løser det med `prev`.',
        'Iteratorer giver O(1) `insert`/`erase` på en kendt position uden at afsløre noderne (L03 s. 56; Weiss s. 83).',
        'Kompleksitet (L03 s. 37; Weiss s. 78–79): `find_kth`/opslag på position — array O(1) · singly og doubly O(N) værste (bog: `findKth(i)` er O(i)) · bedste og gennemsnit ikke angivet.',
        'Kompleksitet (L03 s. 18–20, 29, 37; Weiss s. 78): `push_front`/`pop_front` — singly og doubly O(1) · array O(N) værste og gennemsnit.',
        'Kompleksitet (L03 s. 36, 52, 55; Weiss s. 78, 80): `push_back`/`pop_back` — array O(1) · doubly O(1) · singly: slidene spørger kun (s. 38); koden på s. 36 gennemløber listen, altså O(N).',
        'Kompleksitet (L03 s. 30, 37; Weiss s. 79, 81, 83): `insert`/`remove` på indeks O(N) i en linked list (søgningen efter forgængeren) · givet pointer/iterator O(1) i doubly (`list`), O(N) i `vector` · `size()` O(1) med `theSize` · søgning efter værdi O(N) i begge · plads ikke angivet (doubly bruger én pointer mere pr. node).',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'simple_int_list.cpp: push_front, insert og find_kth',
          source: 'Lecture03.pdf s. 18',
          code: `void List::push_front(int x) {
    Node *p = new Node;
    p->value = x;
    p->next = head->next;
    head->next = p;
    theSize++;
}

void List::insert(int x, int pos) {
    assert(pos >= 0 && pos < theSize);
    Node *p = head->next;
    while (pos > 1) {
        p = p->next;
        pos--;
    }
    Node *q = new Node;
    q->value = x;
    q->next = p->next;
    p->next = q;
    theSize++;
}

int List::find_kth(int pos) {
    assert(pos >= 0 && pos < theSize);
    Node *p = head->next;
    while (pos > 0) {
        p = p->next;
        pos--;
    }
    return p->value;
}`,
        },
        {
          lang: 'cpp',
          title: 'double_list.tpp: push_back og pop_back i O(1)',
          source: 'Lecture03.pdf s. 46 og 55',
          code: `template <typename Object>
void List<Object>::push_back(const Object x) {
    Node *p = new Node;
    Node *t = tail->prev;
    p->data = x;
    p->prev = t;
    p->next = tail;
    t->next = p;
    tail->prev = p;
    theSize++;
}

template <typename Object>
Object List<Object>::pop_back() {
    Node *p = tail->prev;
    Node *t = p->prev;
    Object x = p->data;
    t->next = tail;
    tail->prev = t;
    theSize--;
    delete p;
    return x;
}`,
        },
        {
          lang: 'cpp',
          title: 'removeEveryOtherItem: lineær for list, kvadratisk for vector',
          source: 'RemoveEveryOtherItem.cpp (kildekode_part9.md); Weiss s. 84, fig. 3.5',
          code: `template <typename Container>
void removeEveryOtherItem( Container & lst )
{
    auto itr = lst.begin( );     // itr is a Container::iterator

    while( itr != lst.end( ) )
    {
        itr = lst.erase( itr );
        if( itr != lst.end( ) )
            ++itr;
    }
}`,
        },
      ],
      exam: [
        'Et array ligger sammenhængende, så jeg kan slå position `i` op i O(1), men indsætter jeg forrest, skal alle elementer én plads til højre — O(N). En hægtet liste har hvert element i sin egen node med et link, så indsættelse er et par pointerændringer, men for at nå position `i` må jeg følge `i` links — O(N).',
        '`head` og `tail` er sentinel-noder uden data. De betyder, at hvert rigtigt element altid har en forgænger og en efterfølger, så indsættelse og sletning forrest og bagerst ikke er specialtilfælde.',
        'I en enkelt-hægtet liste er `pop_back` O(N), fordi jeg skal finde næstsidste node, og en ekstra pointer til den hjælper ikke, for den skal selv opdateres ved næste `pop_back`. En doubly linked list har `prev` i hver node, så `tail->prev` giver sidste node direkte, og både `push_back` og `pop_back` er O(1).',
        'Jeg vælger `vector`, når listen bygges bagfra og ellers mest indekseres; `list`, når der indsættes og slettes midt i via iteratorer. `removeEveryOtherItem` er lineær på en `list` men kvadratisk på en `vector`, fordi hvert `erase` i vektoren flytter resten.',
        'Sådan løser du “kør operationen med pen og papir og angiv output” (opgavetype fra fællesøvelsen L03 s. 27 og Menti s. 16 og 31, ikke fra eksamenssæt): 1) tegn listen med `h` og `t` og noderne i rækkefølge — husk at `push_front` vender rækkefølgen, så 10, 5, 3, 7 giver `h → 7 → 3 → 5 → 10 → t`; 2) sæt `p = head->next` og skriv `pos` ved siden af; 3) lav ét løkkeskridt ad gangen med den rigtige betingelse (`pos > 1` for `insert`/`remove`, `pos > 0` for `find_kth`); 4) tegn pointerændringerne i den rækkefølge koden laver dem; 5) opdatér `theSize` — og tjek om funktionen overhovedet gør det (`clear()` gør ikke).',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture03_Lists_Stacks_Queues.md'), original: 'Lecture03.pdf', pages: 's. 3–58', note: 'Part 1 Lists og Part 2 Doubly linked lists' },
        { path: k('context/book/AOD_Ch03_Lists_Stacks_and_Queues.md'), original: BOOK, pages: 's. 78–102', note: '3.2 List ADT, 3.3 vector og list i STL, 3.4 Vector, 3.5 List' },
        { path: k('context/kode/kildekode_part4.md'), note: 'List.h' },
        { path: k('context/kode/kildekode_part7.md'), note: 'Vector.h' },
        { path: k('context/kode/kildekode_part9.md'), note: 'RemoveEveryOtherItem.cpp' },
        { path: k('context/kode/kildekode_part11.md'), note: 'TestList.cpp' },
      ],
      gaps: [
        'Slidets eget eksempel `insert(x,2)` på `h → 4 → 6 → t` (L03 s. 21–26) kan ikke køre: listen har `theSize == 2`, og `assert(pos >= 0 && pos < theSize)` fejler for `pos = 2`. Animationen springer assertionen over. At indsætte bagerst med `insert` er altså umuligt med den kode.',
        '`insert(x, 0)` og `insert(x, 1)` gør det samme i slidets kode: løkken `while (pos > 1)` kører ikke for nogen af dem, og `x` hægtes ind efter første element. Det samme gælder `remove(0)`, som fjerner element 1 (L03 s. 18, 29; afprøvet i testfilen). Bogens definition, hvor `insert(x,2)` placerer `x` på position 2 (Weiss s. 78), passer kun, når `pos ≥ 1`.',
        '`clear()` sætter ikke `theSize = 0` (L03 s. 10, 34, 57). Det er svaret på refleksionen s. 17 og på Menti s. 16, hvor rigtigt svar er Output A (“Size: 4” to gange). Slidene giver ikke svaret; markdown-konverteringen gør.',
        'Slidene svarer ikke på fællesøvelsen om `push_back`/`pop_back` i en enkelt-hægtet liste (s. 38), Menti om næstsidste-pointeren (s. 39), Menti om `size()` uden `theSize` (s. 30) eller Menti om doubly `push_back`/`pop_back` (s. 58). Markdown-konverteringen har tilføjet svar og en samlet kompleksitetstabel, som ikke står i PDF’en. Svarene ovenfor er bogens (s. 80) eller læst af koden.',
        'Hverken slides eller bog angiver bedste og gennemsnitlige tilfælde for listeoperationerne ud over arrayets gennemsnit (“half of the list needs to be moved”, Weiss s. 78), og ingen af dem angiver pladsforbrug.',
        'Bogen kalder vektorens udvidelse fordobling (s. 78), men `Vector.h` bruger `2 * theCapacity + 1` (s. 90). Uden for materialet: at `push_back` er amortiseret O(1) står ikke i kapitel 3; markdown-resuméet af bogen skriver det alligevel.',
        '`LinkedList::find_kth` på L03 s. 36 har `assert(pos >= 0 && p != NULL)` efter løkken; i slidets liste peger den sidste `next` på `tail`, ikke `NULL`, så den assertion fanger intet.',
        'Markdown-konverteringen beskriver figuren på s. 5 som om `p` peger på noden med 6. På PDF’en peger `p` på første node (4).',
        'Iteratorer bruges ikke i slidenes egen liste — s. 56 nævner kun, at de er nødvendige. Iterator-baseret `insert`/`erase` er fra bogen og `List.h`. Se også [[pointere-iteratorer|Pointere og iteratorer]] fra Lektion 1.',
        'Sidetal: “L03 s. N” er PDF-sidetal. Fra PDF-side 63 viser slidenes sidefod ét mere (skjult slide).',
      ],
      keywords: ['linked list', 'hægtet liste', 'kædet liste', 'singly linked list', 'doubly linked list', 'dobbelt-hægtet liste', 'node', 'sentinel', 'header node', 'tail node', 'head', 'tail', 'array', 'vector', 'std::list', 'push_front', 'push_back', 'pop_front', 'pop_back', 'insert', 'erase', 'remove', 'find_kth', 'findKth', 'clear', 'theSize', 'iterator', 'begin', 'end', 'template', 'removeEveryOtherItem', 'List.h', 'Vector.h', 'reserve', 'capacity'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'stakke-koeer',
      title: 'Stakke og køer',
      short: 'Stakke og køer',
      week: 'Lektion 3',
      definition:
        'En **stak** (*stack*) er en ADT med `push` og `pop`, hvor kun det øverste element er tilgængeligt: **LIFO**, last in, first out. En **kø** (*queue*) er en ADT med `put` og `get`, hvor der indsættes i den ene ende og tages ud i den anden: **FIFO**, first in, first out. Begge kan implementeres med en hægtet liste eller et array, og alle operationerne tager O(1).',
      intro: [
        'Lektion 3 (Part 3–4) viser, at stakken og køen næsten er gratis, når man først har en doubly linked list: de bruger blot listens `push_front`, `push_back`, `pop_front` og `find_kth(0)`. Køen implementeres også med et **cirkulært array** med fast kapacitet. Bogen (Weiss 3.6–3.7) giver array-stakken og tre anvendelser af stakke.',
      ],
      concepts: [
        {
          term: 'Stack-ADT’en',
          body: [
            'Definition: “A *stack* is an ADT with two operations to *push* (insert) and *pop* (remove) an item. Sometimes a *peek* operation is also implemented.” Kun toppen er tilgængelig, og stakken implementerer et LIFO-adgangsmønster (L03 s. 60). Figuren viser stakken `5` (top), `40`, `6`, `-1`.',
            'Bogen (3.6, s. 103): en stak er en liste med den begrænsning, at indsættelse og sletning kun sker i én position, enden, kaldet **top**. `pop` sletter det senest indsatte; `top` kigger på det uden at fjerne det. `pop` eller `top` på en tom stak er en fejl i ADT’en; at løbe tør for plads ved `push` er en implementeringsgrænse, ikke en ADT-fejl. Bogens figur 3.24: 6, 3, 1, 4, 2 med 2 øverst.',
          ],
        },
        {
          term: 'Stak oven på den dobbelt-hægtede liste',
          body: [
            'Tankeeksperimentet spørger, om man kan implementere en stak med en doubly linked list, og hvad `push` og `pop` så koster (L03 s. 62). `stack_class.h` (s. 63) svarer: en privat `List<Object> *list`; `push(x)` er `list->push_front(x)`, `pop()` er `list->pop_front()`, `top()` er `list->find_kth(0)` og `empty()` er `list->size() == 0`.',
            'Toppen er altså listens forreste element. Testen (s. 64) pusher 10, 5, 3, 7; `top()` giver 7, og løkken popper 7, 3, 5, 10.',
            'Bogen (3.6.2, s. 104) bruger en **enkelt**-hægtet liste til det samme: `push` indsætter forrest, `pop` sletter forrest, `top` returnerer forreste. Det er nok, fordi stakken aldrig rører bagenden.',
          ],
        },
        {
          term: 'Array-stakken',
          body: [
            'Bogens alternativ, “probably the more popular solution” (s. 104): et array `theArray` og et indeks `topOfStack`, som er `-1` for en tom stak. `push(x)`: øg `topOfStack` og sæt `theArray[topOfStack] = x`. `pop`: returnér `theArray[topOfStack]` og formindsk `topOfStack`. Det svarer til `vector`s `back`, `push_back` og `pop_back`.',
            'Operationerne er ikke bare konstant tid, men “very fast constant time” — på nogle maskiner én instruktion. Bogen kalder stakken “probably the most fundamental data structure in computer science, after the array”. Slidene viser ikke en array-stak.',
          ],
        },
        {
          term: 'Anvendelser af stakke (bogen)',
          body: [
            '**Balancerede symboler** (s. 104–105): læs tegn for tegn; en åbnende parentes/klamme/tuborg pushes; ved en lukkende er det en fejl, hvis stakken er tom, ellers pop og tjek at det passer. Er stakken ikke tom til sidst, er det en fejl. `[()]` er lovlig, `[(])` er ikke. Én gennemgang, lineær tid.',
            '**Postfix-udtryk** (s. 105–107): et tal pushes; en operator popper to tal og pusher resultatet. Bogens eksempel `6 5 2 3 + 8 ∗ + 3 + ∗` giver stakkene 6 5 2 3 → 6 5 5 → 6 5 5 8 → 6 5 40 → 6 45 → 6 45 3 → 6 48 → 288. Tiden er O(N).',
            '**Infix til postfix** (s. 108–110) med en operatorstak, også O(N), og **funktionskald** (s. 110–112): hvert kald gemmer sine variable og returadresse i en *activation record* på en stak — det er sådan [[rekursion|rekursion]] er implementeret. Ingen af de tre anvendelser er på slidene.',
          ],
        },
        {
          term: 'Queue-ADT’en',
          body: [
            'Definition: “A *queue* is an ADT with two operations to *put* (insert) and *get* (remove) an item.” Kun den forreste er tilgængelig, og køen implementerer et FIFO-mønster (L03 s. 66). Figuren: `2` (front), `5`, `3`, `-1`.',
            'Bemærkningen på samme slide: “The doubly head-tail linked list we implemented is also called a *double-ended queue* (deque).” Weiss’ `List.h` kalder `front`, `back`, `push_front`, `push_back`, `pop_front` og `pop_back` for “the basic double-ended queue operations”.',
            'Bogen (3.7.1, s. 113) kalder operationerne `enqueue` (indsæt bagerst, *rear*) og `dequeue` (fjern og returnér forrest, *front*). Anvendelser (3.7.3): printerkøer, telefonkøer, filservere og køteori; mange graf-algoritmer bruger køer — fx [[dfs-bfs|BFS]].',
          ],
        },
        {
          term: 'Køen som cirkulært array',
          body: [
            '`queue_class_array.h` (L03 s. 68) har `int N` (kapacitet), `int head, tail, size` og `Object *data`. Konstruktøren sætter `head = N` og `size = tail = 0`. `put(x)`: `assert(size < N)`, `data[tail] = x`, `tail = (tail + 1) % N`, `size++`. `get()`: `assert(empty() == false)`, `head = head % N`, `x = data[head++]`, `size--`. `front()` returnerer `data[head % N]`. “Note how size and capacity must be handled.”',
            '`tail` peger altså på næste ledige plads, og `% N` får indekserne til at løbe rundt (wraparound). `head` normaliseres først, når der læses, så den kan stå på `N` mellem kaldene.',
            'Menti-øvelsen (s. 69) kører `Queue<int>(4)`: `put` 10, 5, 3, 7 fylder `data[0..3]` og sender `tail` rundt til 0. To `get` giver `10,5` (`head` 0 → 2). `put(2)` og `put(4)` lægges i `data[0]` og `data[1]`. Tømningen giver `3 7 2 4`: `head` går 2 → 3 → 4, normaliseres til 0, og går 0 → 1 → 2.',
            'Bogen (3.7.2, s. 113–115) bruger `front`, `back` og `currentSize`; `enqueue` øger `back` før skrivning, så `back` peger på sidste element. Uden wraparound ser køen fuld ud efter 10 `enqueue`, selv om der er plads forrest. Bogens gennemgang starter med 2 og 4 bagerst i arrayet og viser `enqueue(1)`, `enqueue(3)` og fire `dequeue`, som returnerer 2, 4, 1, 3. Uden `currentSize` er køen fuld ved `capacity() - 1` elementer.',
          ],
        },
        {
          term: 'Køen oven på den dobbelt-hægtede liste',
          body: [
            'Tankeeksperimentet (L03 s. 70): man kan få fleksibilitet ved at allokere et nyt array, når køen er fuld — “What is the time complexity for this variant?” Slidet svarer ikke. I stedet løses maksimumstørrelsen med den dobbelt-hægtede liste, og “Put or get take O(1). Looking at the back element also takes O(1).”',
            '`queue_class.h` (s. 71): `put(x)` er `list->push_back(x)`, `get()` er `list->pop_front()`, `front()` er `list->find_kth(0)`. Køen bruger begge ender — det er derfor den doubly linked list, og ikke den enkelt-hægtede fra s. 36, hvor `push_back` gennemløber listen.',
          ],
        },
      ],
      viz: 'doa-stack-queue',
      keyPoints: [
        'Stak = LIFO, kun toppen er tilgængelig; kø = FIFO, der indsættes bagerst og tages forrest (L03 s. 60, 66).',
        'Stakken på listen: `push`/`pop`/`top` = `push_front`/`pop_front`/`find_kth(0)`. Køen: `put` = `push_back`, `get` = `pop_front` (L03 s. 63, 71).',
        'Den dobbelt-hægtede head/tail-liste er en **deque**: indsæt og fjern i begge ender (L03 s. 66).',
        'Array-kø: `tail = (tail + 1) % N`, og `get` læser `data[head++]` efter `head = head % N`; `size` skelner tom fra fuld (L03 s. 68).',
        'Array-stak: `topOfStack = -1` er tom; `push` = `++topOfStack`, `pop` = `topOfStack--` (Weiss s. 104).',
        'Tom stak/kø ved `pop`/`get` er en ADT-fejl; fuld kapacitet ved `push`/`put` er en implementeringsgrænse (Weiss s. 103).',
        'Kompleksitet (L03 s. 70; Weiss s. 104): `push`/`pop`/`top` på stak — O(1) med både liste og array · bedste og gennemsnit ikke angivet · plads ikke angivet.',
        'Kompleksitet (L03 s. 70; Weiss s. 113): `put`/`get`/`front` på kø — O(1) med både doubly linked list og cirkulært array · kø der udvides ved fuld: ikke angivet (spørgsmål uden svar, s. 70).',
        'Kompleksitet (Weiss s. 105, 107, 110): balancerede symboler, postfix-evaluering og infix → postfix er hver O(N) i én gennemgang.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'stack_class.h: stakken bruger listens forende',
          source: 'Lecture03.pdf s. 63',
          code: `#ifndef _STACK_H_
#define _STACK_H_

#include "../list/double_list.h"

template <typename Object>
class Stack {
  private:
    List<Object> *list;

  public:
    Stack() {
        list = new List<Object>();
    }

    ~Stack() { delete list; }

    bool empty() { return (list->size() == 0); }
    Object top() { return list->find_kth(0); }
    Object pop() { return list->pop_front(); }

    void push(const Object x) {
        list->push_front(x);
    }
};

#endif`,
        },
        {
          lang: 'cpp',
          title: 'queue_class_array.h: kø som cirkulært array',
          source: 'Lecture03.pdf s. 68',
          code: `#ifndef _QUEUE_H_
#define _QUEUE_H_

#include <cassert>

template <typename Object>
class Queue {
  private:
    int N;
    int head, tail, size;
    Object *data;

  public:
    Queue(int capacity) {
        data = new Object[capacity];
        N = capacity;
        head = N;
        size = tail = 0;
    }

    ~Queue() { delete[] data; }
    bool empty() { return (size == 0); }

    Object front() {
        assert(empty() == false);
        return data[head % N];
    }

    Object get() {
        assert(empty() == false);
        head = head % N;
        Object x = data[head++];
        size--;
        return x;
    }

    void put(const Object x) {
        assert(size < N);
        data[tail] = x;
        tail = (tail + 1) % N;
        size++;
    }
};

#endif`,
        },
        {
          lang: 'cpp',
          title: 'queue_class.h: køen bruger begge ender af listen',
          source: 'Lecture03.pdf s. 71',
          code: `#ifndef _QUEUE_H_
#define _QUEUE_H_

#include "../list/double_list.h"

template <typename Object>
class Queue {
  private:
    List<Object> *list;

  public:
    Queue() {
        list = new List<Object>();
    }

    ~Queue() { delete list; }

    bool empty() { return (list->size() == 0); }
    Object front() { return list->find_kth(0); };
    Object get() { return list->pop_front(); };

    void put(const Object x) {
        list->push_back(x);
    };
};

#endif`,
        },
      ],
      exam: [
        'En stak er LIFO: jeg kan kun se og fjerne det senest indsatte. En kø er FIFO: jeg indsætter bagerst og tager ud forrest. Begge er begrænsede lister, og netop begrænsningen gør, at alle operationer kan laves i O(1).',
        'Kurset bygger stakken på den dobbelt-hægtede liste med `push_front`, `pop_front` og `find_kth(0)`, og køen med `push_back` og `pop_front`. Køen skal bruge begge ender, så en enkelt-hægtet liste uden hurtig bagende ville gøre `put` O(N); stakken klarer sig med én ende.',
        'Array-køen er et cirkulært array: `tail = (tail + 1) % N` får indekset til at løbe rundt, så pladsen forrest genbruges efter `get`. Et separat `size`-felt skelner en tom kø fra en fuld; uden det må man lade én plads stå tom.',
        'Jeg vælger stak, når det senest sete skal behandles først — balancerede parenteser, postfix-udtryk, funktionskald — og kø, når rækkefølgen skal bevares, fx job til en printer eller BFS i en graf.',
        'Sådan løser du “udfør operationerne på array-køen og hold styr på alle variable” (opgavetype fra Menti L03 s. 69, ikke fra eksamenssæt): 1) lav en tabel med kolonnerne operation, `data[0..N-1]`, `head`, `tail`, `size` og output, og start med `head = N`, `tail = size = 0`; 2) ved `put`: skriv i `data[tail]`, sæt `tail = (tail + 1) % N`, `size++`; 3) ved `get`: sæt først `head = head % N`, læs `data[head]`, øg `head`, `size--`; 4) gamle værdier bliver stående i arrayet — de er bare uden for køen; 5) kontrollér mod `assert`: `put` ved `size == N` og `get` ved `size == 0` stopper programmet. For `Queue<int>(4)` med put 10, 5, 3, 7, get, get, put 2, 4 og tømning giver det `10,5` og `3 7 2 4`.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture03_Lists_Stacks_Queues.md'), original: 'Lecture03.pdf', pages: 's. 59–71', note: 'Part 3 Stacks og Part 4 Queues' },
        { path: k('context/book/AOD_Ch03_Lists_Stacks_and_Queues.md'), original: BOOK, pages: 's. 103–116', note: '3.6 The Stack ADT og 3.7 The Queue ADT' },
        { path: k('context/kode/kildekode_part4.md'), note: 'List.h — deque-operationerne front/back/push_*/pop_*' },
      ],
      gaps: [
        'Slidene angiver ingen kompleksitet for stakken; tankeeksperimentet (L03 s. 62) spørger kun. O(1) er bogens (s. 104) og følger af koden.',
        'Tankeeksperimentet om en kø, der allokerer et nyt array når den er fuld (L03 s. 70), besvares ikke på slidet og ikke i bogens kapitel 3. Markdown-konverteringen skriver “Amortized O(1) … worst-case O(N)” som svar. Uden for materialet: det er korrekt, hvis kapaciteten fordobles, men står ikke i kildematerialet.',
        'L03 s. 70 siger “Looking at the back element also takes O(1)”, men `queue_class.h` (s. 71) har ingen `back()`-metode — kun `front()`.',
        '`queue_class_array.h` (s. 68) og `queue_class.h` (s. 71) bruger begge include-guarden `_QUEUE_H_` og klassenavnet `Queue`, så de kan ikke inkluderes i samme program. Array-køen initialiserer `head = N` og normaliserer først i `get()`; bogens version (s. 113) holder `front` og `back` inden for arrayet hele tiden, og `back` peger på sidste element, ikke næste ledige.',
        'Anvendelserne balancerede symboler, postfix, infix → postfix og funktionskaldsstakken (Weiss 3.6.3) er ikke på slidene. Deque nævnes kun som en bemærkning (L03 s. 66); bogen har deque som øvelse 3.28 (s. 119).',
        'Stack-figuren på L03 s. 60 (5, 40, 6, -1) er ikke den samme som testens data (10, 5, 3, 7 på s. 64); køfiguren (2, 5, 3, -1 på s. 66) svarer heller ikke til Menti-øvelsen på s. 69.',
        'Menti-svaret på s. 69 står ikke i PDF’en; `10,5` / `3 7 2 4` er fundet ved at køre slidets kode (testet) og stemmer med markdown-konverteringen.',
        'Ingen af kilderne angiver pladskompleksitet eller bedste/gennemsnitlige tilfælde for stak- og køoperationerne.',
      ],
      keywords: ['stack', 'stak', 'queue', 'kø', 'LIFO', 'FIFO', 'push', 'pop', 'top', 'peek', 'put', 'get', 'front', 'back', 'enqueue', 'dequeue', 'deque', 'double-ended queue', 'cirkulært array', 'circular array', 'ringbuffer', 'wraparound', 'modulo', 'topOfStack', 'stack_class.h', 'queue_class_array.h', 'queue_class.h', 'balancing symbols', 'balancerede parenteser', 'postfix', 'reverse Polish notation', 'infix', 'call stack', 'activation record'],
    },
  ],
}
