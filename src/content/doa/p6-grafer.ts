import type { Part } from '../types'
import { k, BOOK } from './paths'

export const grafer: Part = {
  id: 'grafer',
  title: 'Grafer og korteste veje',
  topics: [
    // ------------------------------------------------------------------
    {
      slug: 'grafer',
      title: 'Grafer og repræsentation',
      week: 'Lektion 9',
      definition:
        'En **graf** `G = (V, E)` er en mængde knuder (*vertices*) og en mængde kanter (*edges*). I en uorienteret graf er hver kant en mængde `{v, w}`; i en orienteret graf (*digraph*) er den et ordnet par `(v, w)`, og en kant kan have en tredje komponent, en **vægt** eller **cost**. Kurset gemmer grafer som **adjacency matrix** (plads Θ(|V|²), god til tætte grafer) eller **adjacency lists** (plads Θ(|V| + |E|), god til tynde grafer), og valget styrer algoritmernes køretid.',
      intro: [
        'Lektion 9 åbner med at slå fast, at “graf” her er en datastruktur og ikke et diagram (L09 s. 2). Grafer modellerer virkelige problemer — byer og veje, computernetværk — og kurset bruger dem til to problemtyper: korteste vej mellem to byer ([[dijkstra|Dijkstra]]) og det billigste fibernet mellem computere ([[mst|minimum spanning tree]]) (L09 s. 14).',
      ],
      concepts: [
        {
          term: 'Mængder, følger og definitionen af en graf',
          body: [
            'Slidene starter med to begreber, der bærer resten: en **mængde** er en samling af *forskellige* elementer uden rækkefølge, med kardinaliteten `|A|` som antal elementer; en **følge** er ordnet og må gentage elementer (L09 s. 3–4).',
            'En graf er et par `(V, E)`, hvor `V` er ikke-tom og hver kant er en mængde med to knuder fra `V`. Eksemplet er `V = {a, b, c, d, e}` og `E = {{a,b}, {a,c}, {b,c}, {b,d}, {c,d}, {c,e}, {d,e}}` (L09 s. 6). Pointen på s. 7: `E` er en mængde af mængder, ikke af par, så `E’ = {{b,a}, {c,a}, {c,b}, {d,b}, {d,c}}` er lig med `E` i firknudeeksemplet — rækkefølgen inde i en kant betyder intet.',
            'Givet kanten `{a, b}` er `a` og `b` kantens **ender**, de er **adjacent** (naboer), og kanten er **incident** til dem. En graf er **simpel**, hvis den hverken har **loops** (kant fra en knude til sig selv) eller **multiple edges** (flere kanter mellem samme par) (L09 s. 8).',
          ],
        },
        {
          term: 'Grad og handshaking lemma',
          body: [
            '**Graden** `D(v)` er antallet af kanter incident til `v`. **Handshaking lemma**: summen af alle graders er `2|E|`, fordi hver kant tælles i begge ender (L09 s. 9).',
            'Slidets eksempel har et loop på `c` og en dobbeltkant mellem `d` og `e`: `D(a) = 2`, `D(b) = 3`, `D(c) = 6`, `D(d) = 4`, `D(e) = 3`. Summen er 18, altså `|E| = 9` — loopet tæller 2 i `c`’s grad.',
          ],
        },
        {
          term: 'Stier, cykler og sammenhæng',
          body: [
            'En **sti** er en følge `(w1, …, wN)`, hvor `{wi, wi+1} ∈ E` for `1 ≤ i < N`. **Længden** er antal kanter, `N − 1`. En **simpel sti** gentager ingen knuder, og en **cyklus** er en sti med `w1 = wN` (L09 s. 10). På slidets graf er `(a, b, c, d, e, c)` en sti, `(a, b, c, d, e)` en simpel sti og `(a, b, c, d, e, c, a)` en cyklus.',
            'Bogen er lidt mere præcis: en simpel sti må have samme første og sidste knude, en cyklus i en orienteret graf skal have længde mindst 1, og i en uorienteret graf skal kanterne være forskellige, så `u, v, u` ikke tæller som cyklus (Weiss s. 379).',
            'En graf er **sammenhængende** (*connected*), hvis der er en sti mellem hvert par af knuder; ellers deles den i **connected components** (L09 s. 11). Bogen tilføjer begreberne for orienterede grafer: **strongly connected** (sti hver vej mellem alle par) og **weakly connected** (kun sammenhængende, når retningen ignoreres), samt **complete graph** (kant mellem alle par) (Weiss s. 380).',
          ],
        },
        {
          term: 'Orienterede, vægtede grafer og DAG',
          body: [
            'Er kanterne ordnede, er grafen **orienteret** (*digraph*): hver kant er et par `(v, w)`. Eksemplet på L09 s. 13 har samme syv kanter som den uorienterede graf, nu med retning. En kant kan have en tredje komponent, **vægt** eller **cost**; slidet “Weighted directed graph” har vægtene 5, 4, 9, 2, 3, 1 og 6 (L09 s. 12).',
            'En orienteret graf uden cykler er en **DAG** (*directed acyclic graph*) (Weiss s. 379). Den er forudsætningen for [[dfs-bfs|topologisk sortering]]. Bogen giver to eksempler på modellering: lufthavne med ikke-stop-flyruter som vægtede, orienterede kanter og gadekryds med gader som kanter (Weiss s. 380).',
          ],
        },
        {
          term: 'Adjacency matrix',
          body: [
            'For en simpel graf er adjacency-matricen en `|V| × |V|`-matrix `A`, hvor `A[i,j] = 1` hvis og kun hvis `(i,j) ∈ E` (L09 s. 16). Slidet viser samme femknudegraf uorienteret (symmetrisk matrix, fx række `c` = `1 1 0 1 1`) og orienteret (række `b` = `1 0 0 1 0`).',
            'Fordelen er, at det er let at tjekke om en kant findes; ulempen er plads Θ(V²). Slidet kalder den “adequate to represent dense graphs”. Bogen regner på et gadekort med 3.000 kryds og ca. 12.000 kanter: matricen får 9.000.000 pladser, næsten alle nul (Weiss s. 381). Vægtede kanter lagres som vægten i `A[u][v]` med ∞ som vagtværdi for ikke-eksisterende kanter.',
            'Kursets egen graf-klasse bruger begge dele: `adj` som adjacency lists og, fra Dijkstra og frem, en `weight`-matrix initialiseret til `INFINITY` (L09 s. 51). Eksamensspørgsmålet i L11 s. 3 giver en `dataLossMatrix` på 8 × 8 med husnumre som indeks og beder om grafens karakteristika — se [[mst|MST]].',
          ],
        },
        {
          term: 'Adjacency lists',
          body: [
            'Hver knude har en **linked list** med sine naboer, i vilkårlig rækkefølge (L09 s. 17). For femknudegrafen er listerne `a → b → c`, `b → a → c → d`, `c → a → b → d → e`, `d → b → c → e`, `e → c → d`. Håndskriften på slidet markerer, at der er `|V|` lister og i alt `|E|`-proportionalt mange elementer: plads Θ(|V| + |E|).',
            'Fordelen er, at det er let at gennemløbe en knudes nabolag; den er “adequate to represent sparse graphs”. Bogen kalder adjacency lists “the standard way to represent graphs”; i en uorienteret graf optræder hver kant i to lister, så pladsen fordobles (Weiss s. 381).',
            'Valget afhænger af, hvilke operationer der dominerer algoritmens køretid (L09 s. 15). Traversering ([[dfs-bfs|DFS/BFS]]) gennemløber nabolag og er O(|V| + |E|) med lister; Dijkstra og Prim med lineær scanning er O(|V|²) uanset repræsentation.',
          ],
        },
      ],
      viz: 'doa-graph-repr',
      keyPoints: [
        '`G = (V, E)`: uorienteret kant = mængde `{v, w}`, orienteret kant = par `(v, w)`, evt. med vægt.',
        'Simpel graf: ingen loops og ingen multiple edges. Handshaking lemma: `ΣD(v) = 2|E|`.',
        'Stilængde = antal kanter = `N − 1`. Cyklus: `w1 = wN`. DAG = orienteret graf uden cykler.',
        'Sammenhængende: sti mellem alle par; ellers connected components. Digraphs: strongly/weakly connected.',
        'Kompleksitet (L09 s. 16; Weiss s. 381): `adjacency matrix` plads Θ(|V|²) · kanttjek “easy to verify”, Big-O ikke angivet på slidet · egnet til tætte grafer (|E| = Θ(|V|²)).',
        'Kompleksitet (L09 s. 17; Weiss s. 381): `adjacency lists` plads Θ(|V| + |E|) · naboer gennemløbes i tid proportional med antal naboer · egnet til tynde grafer.',
        'Uorienteret graf: matricen er symmetrisk, og hver kant står i to lister.',
        'Kursets `Graph`-klasse: `vector<vector<int>> adj` (lister) + `vector<vector<int>> weight` (matrix, `INFINITY` = ingen kant).',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'graph_class.h — adjacency lists (uddrag; implementering af addEdge m.fl. vises ikke)',
          source: 'Lecture9.pdf s. 21',
          code: `using namespace std;
#include <vector>
#include <queue>
#include <stack>
#include <iostream>
#include <climits>

#define INFINITY INT_MAX

class Graph {
  private:
    vector<vector<int>> adj;

    void dfs(int v, vector<bool>& visited, vector<int>& path, stack<int>& sorting) {
        visited[v] = true;
        for (auto w : adj[v]) {
            if (!visited[w]) {
                path[w] = v;
                dfs(w, visited, path, sorting);
            }
        }
        sorting.push(v);
    }

  public:
    Graph(int vertices = 0) : adj(vertices) { }

    void addEdge(int u, int v);
    void addDirectedEdge(int u, int v);
    void dfs(int v, vector<int>& path);
    void bfs(int s, vector<int>& path, vector<int>& dist);
    void topsort(int v);
    int components();
    void print();
};`,
        },
        {
          lang: 'cpp',
          title: 'graph_class.h — udvidet med vægtmatrix (uddrag)',
          source: 'Lecture9.pdf s. 51',
          code: `#define INFINITY 1000000

class Graph {
  private:
    vector<vector<int>> adj;
    vector<vector<int>> weight;
    // ... dfs som før

  public:
    Graph(int vertices = 1) : adj(vertices), weight(vertices) {
        for (int i = 0; i < vertices; i++) {
            weight[i].resize(vertices, INFINITY);
        }
    }

    void addEdge(int u, int v);
    void addDirectedEdge(int u, int v);
    void addWeightedEdge(int u, int v, int w);
    void dfs(int v, vector<int>& path);
    void bfs(int s, vector<int>& path, vector<int>& dist);
    void topsort(int v);
    int components();
    void dijkstra(int s, vector<int>& path, vector<int>& dist);
    void print();
};`,
        },
      ],
      exam: [
        'En graf er `G = (V, E)`. I en uorienteret graf er en kant en mængde `{v, w}`, så `{a,b}` og `{b,a}` er samme kant; i en orienteret graf er den et par `(v, w)`. Vægtede grafer giver hver kant en cost, og det er den, Dijkstra og Prim minimerer.',
        'Adjacency matrix bruger Θ(|V|²) plads uanset antallet af kanter og er derfor til tætte grafer; adjacency lists bruger Θ(|V| + |E|) og er til tynde grafer. Traversering skal gennemløbe nabolag, og det er billigt med lister — derfor bliver DFS og BFS O(|V| + |E|).',
        'Sådan løser du “tegn adjacency matrix og adjacency lists for grafen” (opgavetype udledt af L09 s. 16–17 og eksamensspørgsmålet L11 s. 3, ikke af eksamenssæt): 1) nummerér knuderne i en fast rækkefølge; 2) for hver kant sæt `A[u][v] = 1` (eller vægten) — og også `A[v][u]`, hvis grafen er uorienteret; 3) skriv én liste pr. knude med dens naboer; 4) kommentér: er matricen symmetrisk (uorienteret)? er den tæt eller tynd, og hvilken repræsentation passer derfor?',
        'Handshaking lemma siger, at summen af grader er `2|E|`, fordi hver kant har to ender; et loop tæller 2 i sin knudes grad, som `D(c) = 6` på L09 s. 9 viser.',
        'Er en matrix asymmetrisk, som `dataLossMatrix` i L11 s. 3, er grafen orienteret og vægtet — `M[i][j] ≠ M[j][i]`.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture09_Graphs.md'), original: 'Lecture9.pdf', pages: 's. 2–17, 51', note: 'Definitioner, repræsentationer, vægtmatrix' },
        { path: k('context/book/AOD_Ch09_Graph_Search_and_Pathfinding_with_Dijkstra.md'), original: BOOK, pages: 's. 379–382', note: '9.1 Definitions, 9.1.1 Representation of Graphs' },
        { path: k('context/lessons/SW2ADS_Lecture11_MST.md'), original: 'Lecture11.pdf', pages: 's. 3', note: 'Eksamensspørgsmål med dataLossMatrix' },
      ],
      gaps: [
        'Slidenumre angives som PDF-sidenummer. Sidefoden i Lecture9.pdf viser andre tal (fx står “19” på PDF-side 16 og “20” på PDF-side 17), og Lecture11.pdf har sidefod “FALL 2025”, mens Lecture9/10 har “SPRING 2025”.',
        'L09 s. 16 skriver “Easy to verify if (u,v) ∈ V” — der skal stå `E`. Slidet angiver ingen Big-O for kantopslag; markdown-konverteringen tilføjer “O(1) lookup time”, og dens opsummeringstabel (“Adjacency matrix O(V²) space, O(1) edge lookup”) findes ikke i PDF’en.',
        '`addEdge`, `addDirectedEdge`, `addWeightedEdge` og `print` er kun deklareret i `graph_class.h`; implementeringen vises ikke på slidene, så det er uklart, om `addEdge` indsætter begge retninger (det kræver slidenes BFS-/DFS-eksempler).',
        'Headeren på L09 s. 51 deklarerer `dijkstra(...)`, men implementeringen på s. 52 hedder `Graph::dijkstra_pq(...)`. `INFINITY` defineres som `INT_MAX` på s. 21 og som `1000000` på s. 51.',
        'Slidets definition af simpel sti (“no repetition of vertices”) er strengere end bogens (første og sidste knude må være ens, Weiss s. 379).',
        'Strongly/weakly connected og complete graph står kun i bogen (Weiss s. 380), ikke på slidene.',
        'Markdown-konverteringen beskriver den vægtede graf på L09 s. 12 med kanterne “b→a”, “a→d”, “c→e” m.fl.; retningerne kan ikke alle aflæses entydigt af billedet, så brug slidet selv.',
      ],
      keywords: ['ADS', 'AOD', 'SW2ADS', 'DOA', 'graf', 'graph', 'vertex', 'vertices', 'knude', 'node', 'edge', 'kant', 'digraph', 'orienteret graf', 'directed graph', 'uorienteret', 'undirected', 'vægtet graf', 'weighted graph', 'cost', 'adjacency matrix', 'nabomatrix', 'adjacency list', 'naboliste', 'dense', 'sparse', 'tæt', 'tynd', 'degree', 'grad', 'handshaking lemma', 'path', 'sti', 'simple path', 'cycle', 'cyklus', 'loop', 'multiple edges', 'simple graph', 'connected', 'sammenhængende', 'connected components', 'strongly connected', 'DAG', 'directed acyclic graph', 'graph_class.h', 'addEdge', 'addWeightedEdge', 'weight'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'dfs-bfs',
      title: 'DFS og BFS',
      week: 'Lektion 9–10',
      definition:
        '**Depth-first search** (DFS) går så dybt som muligt: en nabo besøges, så snart den opdages, og en knude afsluttes først, når hele dens nabolag er udforsket. **Breadth-first search** (BFS) går lag for lag med en kø: en knude afsluttes, før naboernes naboer udforskes, så knuderne besøges i voksende afstand fra kilden. Begge kører i O(|V| + |E|) med adjacency lists; DFS giver connected components og topologisk sortering, BFS giver korteste veje i antal kanter.',
      concepts: [
        {
          term: 'DFS i kursets kode',
          body: [
            'DFS “explores the neighborhood before finishing a vertex” (L09 s. 21). Den private, rekursive `dfs(v, visited, path, sorting)` markerer `v` besøgt, kalder sig selv på hver ubesøgt nabo `w` efter at have sat `path[w] = v`, og skubber til sidst `v` på stakken `sorting`. Den offentlige `dfs(vertex, path)` nulstiller `visited` og starter rekursionen.',
            'Algoritmen bygger samtidig en **depth-first forest** (forgængeren i `path`) og en **sortering** af knuderne i afslutningsrækkefølge (L09 s. 20). Refleksionsspørgsmålet på s. 31 spørger netop, hvad `path` og `sorting` repræsenterer.',
            'Rekursionen er en implicit stak ([[rekursion|rekursion]]). Refleksionsspørgsmål 3 (s. 31) beder om en iterativ version med en eksplicit [[stakke-koeer|stak]]; slidene giver ikke svaret.',
          ],
        },
        {
          term: 'DFS-eksemplet fra t',
          body: [
            'Grafen på L09 s. 21 har knuderne `r s t u / v w x y` og kanterne `r–s`, `r–v`, `s–w`, `t–u`, `t–w`, `t–x`, `u–x`, `u–y`, `w–x`, `x–y`. Slide 22–30 farver knuderne i den rækkefølge DFS fra `t` opdager dem: **t, u, x, w, s, r, v, y**.',
            'Trækanterne (fede på s. 30) er `t–u`, `u–x`, `x–w`, `w–s`, `s–r`, `r–v` og `x–y`. Fra `v` er der ingen ubesøgte naboer, så rekursionen går tilbage gennem `r`, `s` og `w` til `x`, hvor `y` er den sidste ubesøgte nabo. Rækkefølgen svarer til alfabetisk sorterede adjacency lists (verificeret ved at køre koden).',
          ],
        },
        {
          term: 'Anvendelse 1: connected components',
          body: [
            '`components()` (L09 s. 32) løber alle knuder igennem og starter en ny DFS fra hver knude, der endnu ikke er besøgt. Antallet af DFS-kald er antallet af sammenhængskomponenter. Slidets graf `{a, b}`, `{c, d, e}`, `{f, g}` har tre komponenter.',
            'Bogen formulerer det samme som testen “an undirected graph is connected if and only if a depth-first search starting from any node visits every node” (Weiss s. 420).',
          ],
        },
        {
          term: 'Anvendelse 2: topologisk sortering',
          body: [
            'En **topologisk sortering** af en DAG er en rækkefølge, hvor `vj` kommer efter `vi`, hvis der er en sti fra `vi` til `vj` (L09 s. 33). `topsort(v)` kører DFS fra `v` og popper derefter `sorting`-stakken: en knude skubbes først på, når alle dens efterfølgere er færdige, så den omvendte afslutningsrækkefølge er topologisk.',
            'Slidets DAG (samme som Weiss fig. 9.4) har kanterne `v1→v2`, `v1→v3`, `v1→v4`, `v2→v4`, `v2→v5`, `v3→v6`, `v4→v3`, `v4→v6`, `v4→v7`, `v5→v4`, `v5→v7`, `v7→v6`. Resultatet på slidet er **(v1, v2, v5, v4, v7, v3, v6)**. Bogen nævner både den og `v1, v2, v5, v4, v3, v7, v6` — sorteringen er ikke entydig (Weiss s. 382).',
            'Bogens egen algoritme er en anden: gentag “find en knude med indegree 0, udskriv og fjern den”. Med sekventiel søgning er den O(|V|²); med en kø af knuder med indegree 0 er den O(|E| + |V|) (Weiss s. 382–385). En cyklus gør topologisk sortering umulig.',
          ],
        },
        {
          term: 'BFS i kursets kode og eksemplet fra t',
          body: [
            'BFS “finishes a vertex before exploring the neighborhood” og udforsker “one level at a time by increasing distance from the source” (L09 s. 35–36). `bfs(s, path, dist)` sætter alle `dist` til `INT_MAX`, lægger `s` i en `queue` og tager derefter forreste knude, sætter `dist[w] = dist[s] + 1` og `path[w] = s` for hver ubesøgt nabo og lægger den bagerst i køen (L09 s. 37). Den bygger et **breadth-first tree** og afstanden i antal kanter.',
            'Samme graf fra `t` (s. 37–46): køen går `{t}` → `{u w x}` → `{w x y}` → `{x y s}` → `{y s}` → `{s}` → `{r}` → `{v}` → `{}`. Afstandene bliver `t = 0`, `u = w = x = 1`, `y = s = 2`, `r = 3`, `v = 4`.',
            'Hovedanvendelsen er afstanden i antal kanter fra kilden, og “this intuition will help to build a single-source shortest path algorithm due to Dijkstra” (s. 47). Bogen udleder BFS fra en O(|V|²)-version med dobbeltløkke (fig. 9.16) og viser, at køen gør den O(|E| + |V|) (fig. 9.18, Weiss s. 390–392). Kursets `WordLadder.cpp` (`findChain`) er BFS på et `map<string, vector<string>>`.',
          ],
        },
        {
          term: 'Frontier, early exit og path reconstruction (Lecture 10)',
          body: [
            'Lektion 10 genbruger BFS på et 2D-gitter: én knude pr. felt, kanter til nabofelter, 4-vejs eller med diagonaler (8-vejs) (L10 s. 8–10). Den abstrakte algoritme er: tag en knude fra **frontier** (køen), find dens naboer, og læg hver ubesøgt nabo i frontier og markér den besøgt. Red Blob kalder det “an expanding ring called the frontier”, på gitre “flood fill” (Red Blob s. 4).',
            '`n.prev` gør to ting: `prev == null` betyder “ikke besøgt”, og pointeren gemmer vejen (L10 s. 9). Stien bygges **baglæns** fra målet ved at følge `prev`/`came_from`, og det gælder for alle søgealgoritmer i kurset (L10 s. 11; Red Blob s. 6–7).',
            '**Early exit**: stop, når målet tages ud af frontier — `if (current == t) return;` (L10 s. 9; Red Blob s. 7–8). Red Blob tjekker bevidst ved *udtagning* og ikke ved indsættelse, fordi det sidste kun virker for BFS og går galt, når kanterne har forskellige costs (Red Blob s. 9).',
          ],
        },
        {
          term: 'DFS mod BFS',
          body: [
            'DFS bruger en stak (her rekursionen) og går i dybden; BFS bruger en [[stakke-koeer|kø]] og går i bredden. På samme graf fra `t` giver DFS `t, u, x, w, s, r, v, y` og BFS `t, u, w, x, y, s, r, v`.',
            'BFS’ træ giver korteste veje i antal kanter; DFS’ træ gør ikke (DFS når `y` via `t–u–x–y` i tre kanter, BFS via `t–u–y` i to). Til gengæld giver DFS’ afslutningsrækkefølge topologisk sortering. BFS finder korteste veje i uvægtede grafer, fordi “all edges cost 1” (L10 s. 7); med vægte skal man bruge [[dijkstra|Dijkstra]].',
          ],
        },
      ],
      viz: 'doa-bfs-dfs',
      keyPoints: [
        'DFS: rekursion (stak), besøg nabo med det samme, `sorting.push(v)` når `v` er færdig.',
        'BFS: kø, afslut knuden før nabolaget, `dist[w] = dist[s] + 1`.',
        'Kompleksitet (L10 s. 7; Weiss s. 391): `BFS` bedste ikke angivet · gennemsnit ikke angivet · værste O(|V| + |E|) med adjacency lists · plads ikke angivet.',
        'Kompleksitet (Weiss s. 420; L09 s. 31 stiller spørgsmålet): `DFS` bedste ikke angivet · gennemsnit ikke angivet · værste O(|E| + |V|) med adjacency lists · plads ikke angivet.',
        'Kompleksitet (Weiss s. 383–385): `topologisk sortering` med indegree-kø O(|E| + |V|) · med sekventiel søgning O(|V|²) · plads ikke angivet.',
        'Kompleksitet (Weiss s. 391): `unweighted` uden kø (fig. 9.16) O(|V|²) — køen fjerner den lineære søgning.',
        'Antal DFS-kald i `components()` = antal connected components.',
        'Topologisk orden = `sorting`-stakken poppet: omvendt afslutningsrækkefølge. Kun for DAG’er, og ikke entydig.',
        'Stier bygges baglæns fra målet via `path[]`/`prev`/`came_from`. Early exit tjekkes når målet tages ud af frontier.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'DFS, connected components og topologisk sortering',
          source: 'Lecture9.pdf s. 21, 32–33 (graph_class.cpp)',
          code: `void Graph::dfs(int vertex, vector<int>& path) {
    stack<int> sorting;
    vector<bool> visited(adj.size());

    for (int v = 0; v < adj.size(); ++v) {
        visited[v] = false;
    }
    dfs(vertex, visited, path, sorting);
}

int Graph::components() {
    int components = 0;
    stack<int> sorting;
    vector<int> path(adj.size());
    vector<bool> visited(adj.size());
    for (int v = 0; v < adj.size(); ++v) {
        visited[v] = false;
    }

    for (int v = 0; v < adj.size(); ++v) {
        if (!visited[v]) {
            ++components;
            dfs(v, visited, path, sorting);
        }
    }

    return components;
}

void Graph::topsort(int v) {
    stack<int> sorting;
    vector<int> path(adj.size());
    vector<bool> visited(adj.size());

    for (int v = 0; v < adj.size(); ++v) {
        visited[v] = false;
    }
    dfs(v, visited, path, sorting);
    while (sorting.empty() == false) {
        cout << sorting.top() << " ";
        sorting.pop();
    }
}`,
        },
        {
          lang: 'cpp',
          title: 'BFS med afstand og forgænger',
          source: 'Lecture9.pdf s. 37 (graph_class.cpp)',
          code: `void Graph::bfs(int s, vector<int>& path, vector<int>& dist) {
    queue<int> q;
    vector<bool> visited(adj.size());

    for (int v = 0; v < adj.size(); ++v) {
        dist[v] = INT_MAX;
        visited[v] = false;
    }
    dist[s] = 0;
    visited[s] = true;
    q.push(s);

    while (!q.empty()) {
        s = q.front();
        q.pop();
        for (auto w : adj[s]) {
            if (!visited[w]) {
                dist[w] = dist[s] + 1;
                visited[w] = true;
                path[w] = s;
                q.push(w);
            }
        }
    }
}`,
        },
        {
          lang: 'python',
          title: 'Red Blob: BFS med early exit og path reconstruction',
          source: 'Introduction to the A_ Algorithm.pdf s. 7–8',
          code: `frontier = Queue()
frontier.put(start)
came_from = dict()
came_from[start] = None

while not frontier.empty():
   current = frontier.get()

   if current == goal:
      break

   for next in graph.neighbors(current):
      if next not in came_from:
         frontier.put(next)
         came_from[next] = current

current = goal
path = []
while current != start:
   path.append(current)
   current = came_from[current]
path.append(start) # optional
path.reverse() # optional`,
        },
      ],
      exam: [
        'DFS går i dybden: den besøger en nabo, så snart den er opdaget, og afslutter først en knude, når hele nabolaget er udforsket. BFS går i bredden med en kø og afslutter en knude, før den går videre, så knuderne kommer i voksende afstand fra kilden. Begge er O(|V| + |E|) med adjacency lists, fordi hver knude og hver kant behandles én gang.',
        'Sådan løser du “angiv DFS- og BFS-besøgsrækkefølgen fra t” (opgavetype udledt af L09 s. 21–46 og refleksionsopgaven s. 31, ikke af eksamenssæt): 1) skriv adjacency lists og aftal naborækkefølgen (slidene bruger alfabetisk); 2) DFS: gå til første ubesøgte nabo, skriv knuden, og gå tilbage, når der ingen er — hold styr på rekursionsstakken; 3) BFS: skriv køen efter hvert trin, tag forreste, læg ubesøgte naboer bagerst og notér `dist = forælder + 1`; 4) tegn trækanterne (`path[w] = v`) og tjek, at BFS-afstandene er antal kanter.',
        'Sådan løser du “topologisk sortering af DAG’en”: 1) kør DFS og skub en knude på stakken, når alle dens efterfølgere er færdige; 2) pop stakken — eller brug bogens metode: udskriv gentagne gange en knude med indegree 0 og fjern dens udgående kanter; 3) tjek at hver kant `(u, v)` har `u` før `v`. Slidets svar er `(v1, v2, v5, v4, v7, v3, v6)`.',
        'Iterativ DFS (refleksionsspørgsmål L09 s. 31): erstat rekursionen med en eksplicit stak; pop en knude, spring den over hvis den er besøgt, ellers markér den og push dens ubesøgte naboer.',
        'BFS giver korteste veje, når alle kanter koster det samme. Så snart vægtene er forskellige, skal køen erstattes af en prioritetskø ordnet efter afstand — det er [[dijkstra|Dijkstra]].',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture09_Graphs.md'), original: 'Lecture9.pdf', pages: 's. 18–47', note: 'DFS, anvendelser, BFS; refleksion s. 31' },
        { path: k('context/lessons/SW2ADS_Lecture10_Pathfinding_AStar.md'), original: 'Lecture10.pdf', pages: 's. 3–11', note: 'Grafdesign på gitre, BFS-recap, path representation' },
        { path: k('context/lessons/SW2ADS_Lecture10_A_Star_Algorithm.md'), original: 'Introduction to the A_ Algorithm.pdf', pages: 's. 4–9', note: 'Frontier, came_from, early exit' },
        { path: k('context/book/AOD_Ch09_Graph_Search_and_Pathfinding_with_Dijkstra.md'), original: BOOK, pages: 's. 382–392', note: '9.2 Topological Sort, 9.3.1 Unweighted Shortest Paths' },
        { path: k('context/book/AOD_Ch09_Graph_Search_and_Pathfinding_with_Dijkstra.md'), original: BOOK, pages: 's. 419–420', note: '9.6 Applications of Depth-First Search (DFS-template, O(|E| + |V|))' },
        { path: k('context/kode/kildekode_part12.md'), note: 'WordLadder.cpp — findChain er BFS (Weiss s. 405, fig. 9.38)' },
      ],
      gaps: [
        'Markdown-konverteringen angiver DFS-rækkefølgen fra `t` som “t → u → y → x → w → s → r → v”. PDF-billederne (s. 22–30) viser t, u, x, w, s, r, v, y. På s. 28 er `y` allerede farvet, på s. 29 er den hvid igen — en animationsfejl på slidet.',
        'Markdown beskriver DAG’en på s. 33 forkert (fx “v₁ points to v₃, v₄”, “v₆ points to v₇”). Billedet viser `v1→v2`, `v1→v3`, `v1→v4` og `v7→v6`.',
        'Svarene på refleksionsspørgsmålene (s. 31) og tabellen “DFS O(V + E), O(V) space” i markdown findes ikke i PDF’en. Slidene angiver ingen køretid for DFS; den kommer fra bogen (Weiss s. 420). Plads er ikke angivet nogen steder.',
        '`topsort(v)` kører kun DFS fra én knude. Er ikke alle knuder nåbare fra `v`, udelades resten; bogens indegree-algoritme har ikke det problem. Slidene diskuterer det ikke (fra `v1` er alle knuder nåbare).',
        'L09 s. 21 og s. 37 har pilen “Adjencacy Matrix — Class property — Set elsewhere” ved `adj`, men `adj` er `vector<vector<int>>` med naboer, altså adjacency lists.',
        'Markdown til Lecture10 (Pathfinding_AStar) indeholder en “C++ Implementation af BFS”; PDF’en har kun pseudokode (s. 9–11). Koden er L09’s `bfs`.',
        'Kursets kode sammenligner `int v` med `adj.size()` og giver `-Wsign-compare`-advarsler ved `g++ -Wall -Wextra`; den kompilerer og giver slidenes resultater.',
      ],
      keywords: ['DFS', 'depth-first search', 'dybde-først', 'BFS', 'breadth-first search', 'bredde-først', 'traversal', 'gennemløb', 'frontier', 'flood fill', 'queue', 'kø', 'stack', 'stak', 'visited', 'path', 'prev', 'came_from', 'early exit', 'path reconstruction', 'depth-first forest', 'breadth-first tree', 'connected components', 'components()', 'topological sort', 'topologisk sortering', 'topsort', 'DAG', 'indegree', 'sorting', 'iterativ DFS', 'unweighted shortest path', 'WordLadder', 'findChain', 'Red Blob'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'dijkstra',
      title: 'Dijkstra',
      week: 'Lektion 9–10',
      definition:
        '**Dijkstras algoritme** løser single-source shortest path i en vægtet graf uden negative kanter. Den starter med afstand ∞ til alle andre end kilden, tager gentagne gange den ukendte knude med mindst foreløbig afstand ud af en **prioritetskø** og **relaxer** dens udgående kanter: er `dist[u] + w(u,v) < dist[v]`, opdateres `dist[v]` og `path[v]`. Med binær heap er køretiden O((|E| + |V|) log |V|); med lineær søgning i et array O(|V|²).',
      concepts: [
        {
          term: 'Problemet',
          body: [
            'Givet en orienteret graf, hvor hver kant `(u, v)` har vægten `W(u, v)`: find en sti med minimal vægt mellem `s` og `t` (*single-destination*). Slidets observation: det er tilsyneladende ikke sværere at finde den korteste vej fra `s` til **alle** andre knuder (*single-source*), og algoritmen er en variant af BFS, der giver både længden og selve stien (L09 s. 49).',
            'Bogen definerer den **vægtede stilængde** som summen af kanternes costs og den uvægtede som antal kanter (Weiss s. 386). Grafen i bogens fig. 9.8 — den samme som slidets eksempel — har korteste vægtede vej `v1 → v4 → v7 → v6` med cost 6, mens den korteste uvægtede har længde 2.',
          ],
        },
        {
          term: 'Intuition og relaxation',
          body: [
            'Slidets tre trin (L09 s. 50): 1) start med et dårligt estimat (∞) for afstanden til alle knuder; 2) find den ubesøgte knude, der er tættest på de besøgte; 3) tjek om den kan forbedre estimaterne — **relaxation**.',
            'Figuren: `u` har afstand 5, `v` har 9, og kanten `u → v` vejer 2. Da `5 + 2 = 7 < 9`, bliver `v`’s afstand 7. Samme figur går igen i L10 s. 12: “Relax if cheaper path”.',
            'Bogen kalder algoritmen “a prime example of a greedy algorithm” — den gør det, der ser bedst ud i hvert trin og erklærer den valgte knudes afstand for endelig (Weiss s. 392). Se [[designteknikker|greedy]].',
          ],
        },
        {
          term: 'Prioritetskøen i kursets kode',
          body: [
            '`dijkstra_pq` (L09 s. 52) bruger `priority_queue<pair<int,int>, vector<pair<int,int>>, pair_comp>` med par `(afstand, knude)`. Komparatoren returnerer `a.first > b.first`, så køen bliver en **min-heap** på afstand — se [[binaer-heap|binær heap]].',
            'I stedet for `decreaseKey` lægger koden et nyt par i køen, hver gang en afstand forbedres. Samme knude kan derfor ligge i køen flere gange med forskellig afstand. Bogen beskriver netop dette alternativ: køen kan vokse til |E| elementer, men da `log |E| ≤ 2 log |V|` er køretiden stadig O(|E| log |V|); til gengæld kræver det |E| `deleteMin` i stedet for |V| (Weiss s. 398–399).',
            'Recap-versionen i L10 s. 12 har ingen `visited`-markering og spørger “Why don’t we need to mark nodes as visited?”. Svaret ligger i relax-betingelsen: en knude lægges kun i køen igen, hvis dens cost bliver *mindre*, og det sker ikke for en knude, der allerede er taget ud med sin endelige afstand, når ingen kant er negativ. L10-versionen har også early exit (`if (current == t) return;`).',
          ],
        },
        {
          term: 'Gennemregnet eksempel fra v1',
          body: [
            'Grafen på L09 s. 52 (= Weiss fig. 9.20) har kanterne `v1→v2` 2, `v1→v4` 1, `v2→v4` 3, `v2→v5` 10, `v3→v1` 4, `v3→v6` 5, `v4→v3` 2, `v4→v5` 2, `v4→v6` 8, `v4→v7` 4, `v5→v7` 6, `v7→v6` 1. Tabellen har kolonnerne `known`, `dv` og `pv`.',
            'Trin (s. 53–58): **v1** (0): `v2 = 2`, `v4 = 1`. **v4** (1): `v3 = 3`, `v5 = 3`, `v7 = 5`, `v6 = 9`. **v2** (2): `v4` er kendt; `v5 = 12` er ikke bedre. **v3** (3): `v1` er kendt; `v6 = 3 + 5 = 8` — opdatér. **v5** (3): `v7 = 9` er ikke bedre. **v7** (5): `v6 = 1 + 4 + 1 = 6` — opdatér. **v6** (6): ingen udgående kanter. Køen er tom.',
            'Resultat: `v1 = 0`, `v2 = 2` (via v1), `v3 = 3` (v4), `v4 = 1` (v1), `v5 = 3` (v4), `v6 = 6` (v7), `v7 = 5` (v4) — identisk med bogens fig. 9.27. Stien til `v6` læses baglæns: `v6 ← v7 ← v4 ← v1`. Bogens `printPath` gør det rekursivt (fig. 9.30, Weiss s. 398).',
          ],
        },
        {
          term: 'Kompleksitet og repræsentation',
          body: [
            'L09 s. 59 siger kun, at algoritmen “extracts the minimum |V| times and decreases distances at most |E| times”. L10 s. 12 giver resultatet: O((|E| + |V|) · log |V|), hvor log-leddet skyldes prioritetskøen.',
            'Bogen regner tre varianter (Weiss s. 396–400): med sekventiel scanning efter mindste `dv` koster hvert trin O(|V|), i alt O(|E| + |V|²) = O(|V|²) — “essentially optimal” for tætte grafer. Med binær heap og `decreaseKey` bliver det O(|E| log |V| + |V| log |V|) = O(|E| log |V|), bedst for tynde grafer. Med Fibonacci heap O(|E| + |V| log |V|).',
            'Refleksionsspørgsmål 3 (L09 s. 60): med alle vægte 1 opfører Dijkstra sig som [[dfs-bfs|BFS]], men BFS klarer det i O(|V| + |E|) med en simpel kø.',
          ],
        },
        {
          term: 'Negative vægte',
          body: [
            'Refleksionsspørgsmål 2 (L09 s. 60) spørger, om Dijkstra virker med negative kanter. Bogen svarer nej: når `u` er erklæret kendt, kan der fra en anden, ukendt knude `v` gå en meget negativ vej tilbage til `u` (Weiss s. 396, 400).',
            'At lægge en konstant til alle kanter virker ikke, fordi stier med mange kanter straffes mere end stier med få. Bogens løsning dropper begrebet “known” og lægger knuder tilbage i en kø, når deres afstand falder; det virker uden negative cykler og koster O(|E| · |V|) (Weiss s. 400). For acykliske grafer kan knuderne vælges i topologisk rækkefølge, og så er det O(|E| + |V|) uden prioritetskø.',
          ],
        },
      ],
      viz: 'doa-dijkstra',
      keyPoints: [
        'Initialisér `dist = ∞`, `dist[s] = 0`; tag mindste ukendte knude; relax: `if (dist[u] + w < dist[v])`.',
        'Greedy: en knude, der tages ud af køen, har sin endelige afstand — kun når ingen kant er negativ.',
        'Kompleksitet (L10 s. 12; Weiss s. 397): `Dijkstra, binær heap` O((|E| + |V|) log |V|) = O(|E| log |V|) · bedste og gennemsnit ikke angivet (“no meaningful average-case results”, Weiss s. 400) · plads ikke angivet.',
        'Kompleksitet (Weiss s. 396): `Dijkstra, lineær scanning/array` O(|E| + |V|²) = O(|V|²) · optimal for tætte grafer.',
        'Kompleksitet (Weiss s. 399): `Dijkstra med gentagen insert i køen` stadig O(|E| log |V|) · køen op til |E| elementer · |E| `deleteMin`.',
        'Kompleksitet (Weiss s. 400): `Fibonacci heap` O(|E| + |V| log |V|) · `negative kanter (kø-algoritme)` O(|E| · |V|) · `acyklisk graf i topologisk orden` O(|E| + |V|).',
        'L09 s. 59: `extract-min` |V| gange, `decrease` højst |E| gange — det er det, køretiden bygger på.',
        'Kursets kode: `priority_queue` med `pair_comp` (`a.first > b.first`) = min-heap på `(dist, vertex)`.',
        'Alle vægte 1 → samme resultat som BFS, men BFS er billigere.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'dijkstra_pq — prioritetskø med (afstand, knude)',
          source: 'Lecture9.pdf s. 52',
          code: `void Graph::dijkstra_pq(int s, vector<int>& path, vector<int>& dist) {
    struct pair_comp {
        constexpr bool operator()(pair<int, int> const& a,
                                  pair<int, int> const& b) const noexcept {
            return a.first > b.first;
        }
    };
    priority_queue<pair<int, int>,
                   vector<pair<int, int>>, pair_comp> q;
    vector<bool> visited(adj.size());

    for (int v = 0; v < adj.size(); ++v) {
        dist[v] = INFINITY;
        visited[v] = false;
        path[v] = -1;
    }
    dist[s] = 0;
    q.push(make_pair(dist[s], s));

    while (!q.empty()) {
        int u = q.top().second;
        q.pop();
        visited[u] = true;
        for (auto v : adj[u]) {
            if (!visited[v] && dist[u] != INT_MAX
                    && dist[u] + weight[u][v] < dist[v]) {
                dist[v] = dist[u] + weight[u][v];
                path[v] = u;
                q.push(make_pair(dist[v], v));
            }
        }
    }
}`,
        },
        {
          lang: 'text',
          title: 'Recap-pseudokode med early exit (ingen visited)',
          source: 'Lecture10.pdf s. 12',
          code: `FindPathDijkstra(Graph g, Node s, Node t)
{
    // Initializing
    frontier = new PriorityQueue();
    s.prev = None;
    s.cost = 0
    frontier.push(s, s.cost);

    // Explore nodes
    while(!frontier.isEmpty())
    {
        current = frontier.get();
        if(current == t) return; // early exit
        foreach(Node n in current.neighbors)
        {
            if(current.cost + edge(current, n).weight < n.cost)
            {
                n.cost = current.cost + edge(current, n).weight;
                n.prev = current;
                frontier.push(n, n.cost);
            }
        }
    }
}`,
        },
        {
          lang: 'text',
          title: 'Bogens pseudokode',
          source: 'Weiss s. 399, fig. 9.31',
          code: `void Graph::dijkstra( Vertex s )
{
    for each Vertex v
    {
        v.dist = INFINITY;
        v.known = false;
    }

    s.dist = 0;

    while( there is an unknown distance vertex )
    {
        Vertex v = smallest unknown distance vertex;

        v.known = true;

        for each Vertex w adjacent to v
            if( !w.known )
            {
                DistType cvw = cost of edge from v to w;

                if( v.dist + cvw < w.dist )
                {
                    // Update w
                    decrease( w.dist to v.dist + cvw );
                    w.path = v;
                }
            }
    }
}`,
        },
      ],
      exam: [
        'Dijkstra finder korteste veje fra én kilde til alle knuder i en vægtet graf uden negative kanter. Den tager hele tiden den ukendte knude med mindst foreløbig afstand ud af en prioritetskø og relaxer dens kanter: hvis `dist[u] + w(u,v) < dist[v]`, opdateres `dist[v]` og `path[v] = u`.',
        'Sådan løser du “udfør Dijkstra i hånden fra A” (opgavetype fra refleksionsopgaven L09 s. 60 og gennemgangen s. 52–58, ikke fra eksamenssæt): 1) lav en tabel med kolonnerne `known`, `dv`, `pv` — kilden 0, resten ∞; 2) vælg den ukendte knude med mindst `dv` (skriv hvordan uafgjort brydes) og sæt `known = T`; 3) relax hver udgående kant til en ukendt nabo og ret `dv`/`pv`, hvis summen er mindre; 4) gentag til alle nåbare knuder er kendte, og skriv én tabel eller én linje pr. trin; 5) læs stierne baglæns via `pv`. På refleksionsgrafen (`A→B` 3, `A→D` 1, `B→C` 4, `B→D` 2, `B→E` 11, `C→G` 2, `C→E` 6, `E→F` 0, `F→E` 4, `H→E` 1) giver det rækkefølgen A 0, D 1, B 3, C 7, G 9, E 13, F 13; `H` er ikke nåbar fra A og forbliver ∞.',
        'Med binær heap er køretiden O((|E| + |V|) log |V|), fordi der tages minimum ud |V| gange og afstande sænkes højst |E| gange, hver til O(log |V|). Med et array og lineær søgning er det O(|V|²), hvilket er bedst, når grafen er tæt og gemt som matrix.',
        'Dijkstra virker ikke med negative kanter, fordi en knude, der allerede er erklæret kendt, senere kan nås billigere via en negativ kant. Et modeksempel til refleksionsspørgsmål 2 skal have en kant med negativ vægt, der fører tilbage til en allerede kendt knude.',
        'Er alle vægte 1, giver Dijkstra samme afstande som BFS, men BFS klarer det i O(|V| + |E|) med en almindelig kø.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture09_Graphs.md'), original: 'Lecture9.pdf', pages: 's. 49–60', note: 'Problem, relaxation, kode, gennemregnet eksempel, refleksion' },
        { path: k('context/lessons/SW2ADS_Lecture10_Pathfinding_AStar.md'), original: 'Lecture10.pdf', pages: 's. 12', note: 'Recap: pseudokode og kompleksitet' },
        { path: k('context/book/AOD_Ch09_Graph_Search_and_Pathfinding_with_Dijkstra.md'), original: BOOK, pages: 's. 386–400', note: '9.3 Shortest-Path Algorithms, 9.3.2 Dijkstra, 9.3.3 negative kanter, 9.3.4 acykliske grafer' },
        { path: k('context/videos/SW2ADS_Video_Week09_Dijkstra.md'), original: 'data/video transcripts/week9.txt', note: 'Computerphile: Dijkstra på et vejnet med prioritetskø' },
      ],
      gaps: [
        'Markdown-konverteringen tegner eksempelgrafen forkert: den har “v₁ → v₃: 4”, “v₃ → v₄: 2” og “v₆ → v₇”. PDF-billedet (s. 52) og Weiss fig. 9.20 har `v3 → v1` 4, `v4 → v3` 2 og kun `v7 → v6`. Tekstboksen på s. 56 (“Investigate V3’s neighbours: V1, V6”) bekræfter billedet.',
        'Markdown til refleksionsgrafen (s. 60) er forkert (“D → E: 11”, “D → C: 6”). Billedet viser `B → E` 11 og `C → E` 6. Svarene på refleksionsspørgsmålene og modeksemplet med A, B, C i markdown står ikke i PDF’en; løsningen på refleksionsgrafen ovenfor er regnet her, ikke hentet fra materialet.',
        'L09 s. 59 angiver ingen Big-O; markdown tilføjer “Total complexity O((V + E) log V)”, “O(V²) for dense graphs with adjacency matrix” og en Fibonacci-række. Tallene findes i L10 s. 12 og Weiss s. 396–400, ikke på L09-slidet. Plads er ikke angivet i materialet.',
        'Koden sætter `dist[v] = INFINITY` (1000000, s. 51), men tester `dist[u] != INT_MAX`. Testen er altid sand; den skader ikke, fordi en knude med afstand ∞ aldrig tages ud af køen.',
        'Koden springer ikke forældede kø-elementer over: en knude, der ligger i køen flere gange, tages ud igen og gennemløber sine naboer påny. `!visited[v]` forhindrer forkerte opdateringer, men det er det ekstra arbejde, Weiss s. 399 beskriver. Slidene nævner det ikke.',
        'Videoopsummeringen (week 9) indeholder en kompleksitetstabel, som ikke findes i transskriptionen — videoen (Computerphile) nævner ingen køretid.',
        'Bogen skriver “(apparently) becomes harder” om det vægtede tilfælde, og slidet “Apparently, it is not harder…” om single-destination. Hverken slides eller bog beviser korrektheden; bogen nævner kun “a proof by contradiction” (Weiss s. 396).',
      ],
      keywords: ['Dijkstra', 'Dijkstras algoritme', 'shortest path', 'korteste vej', 'single-source shortest path', 'SSSP', 'single-destination', 'relaxation', 'relax', 'prioritetskø', 'priority queue', 'priority_queue', 'min-heap', 'pair_comp', 'dijkstra_pq', 'decreaseKey', 'deleteMin', 'extract-min', 'known', 'dv', 'pv', 'dist', 'path', 'greedy', 'grådig', 'negative weights', 'negative kanter', 'negative-cost cycle', 'Fibonacci heap', 'weighted path length', 'printPath', 'Computerphile', 'uniform cost search'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'a-stjerne',
      title: 'A*',
      week: 'Lektion 10',
      definition:
        'Algoritmen A* (Hart, Nilsson og Raphael 1968) er **Dijkstra med en målrettet prioritet**: den tager den knude ud af frontier, der minimerer `f(n) = g(n) + h(n)`, hvor `g(n)` er cost fra kilden og `h(n)` en **heuristik**, der estimerer resten af vejen til målet. Med `h = 0` er A* Dijkstra; med kun `h` er den greedy best-first search. Er `h` admissible, finder A* en korteste vej og udvider typisk langt færre knuder end Dijkstra.',
      concepts: [
        {
          term: 'Problemet med Dijkstra og BFS',
          body: [
            'Dijkstra og BFS prioriterer knuder, der er billige at nå — nyttigt, hvis man vil have korteste vej til *alle* knuder. Vil man kun til ét mål, udforsker de i alle retninger: på visualiseringen på L10 s. 13 koster alle kanter det samme, målet ligger til højre, og alligevel udfylder frontier en hel diamant. “Why go left when the node is on the right!?”',
            'Årsagen er, at alle knuder på frontier har samme prioritet, fordi de har samme afstand fra start (L10 s. 14). Løsningsidéen på s. 15: sæt prioriteten til afstanden til målet langs den vandrette akse — så udvides knuderne til højre først (tallene 17 til højre mod 31 til venstre på slidet).',
          ],
        },
        {
          term: 'Greedy best-first search (heuristisk søgning)',
          body: [
            'Heuristisk søgning bruger kun det estimerede restcost som prioritet. Den kræver, at man kan beregne heuristikken for enhver knude i forhold til målet; på plane grafer bruges knudernes koordinater (L10 s. 16). Red Blob skriver den som Dijkstra uden `cost_so_far` med `priority = heuristic(goal, next)` (Red Blob s. 12–13).',
            'Problemet (L10 s. 17): den er **greedy**, heuristikken afspejler ikke den reelle cost, og stien er ikke optimal. Slidets eksempel viser Dijkstra og greedy best-first ved en U-formet mur: greedy løber ind i muren mod målet og ender med en længere sti. Red Blob: “So this algorithm runs faster when there aren’t a lot of obstacles, but the paths aren’t as good” (s. 14).',
          ],
        },
        {
          term: 'f(n) = g(n) + h(n)',
          body: [
            'A* kombinerer de to: “like Dijkstra” bruger den cost fra kilden, “like heuristic search” cost til målet (L10 s. 18). Den vælger den knude på frontier, der minimerer `f(n) = g(n) + h(n)`: `g(n)` er cost fra `s` til `n`, `h(n)` estimerer cost på den optimale vej fra `n` til `t` (L10 s. 19).',
            'Koden er Dijkstras med én ændret linje: `priority = n.cost + h(n,t)` i stedet for `priority = n.cost` (L10 s. 20). `n.cost` (= `g`) opdateres præcis som i Dijkstra, og stien gemmes i `n.prev`. Er `h(n) = 0`, reduceres A* til Dijkstra (s. 19).',
            'Heuristikken er et bedste gæt og kan være upræcis, fordi den ikke kan se grafen (fx mure). Eksempler: fysisk (euklidisk) afstand eller afstand i koordinatsystemet. “Search complexity depends on heuristic” (L10 s. 18). Hvordan man vælger `h`, står under [[heuristikker|heuristikker]].',
          ],
        },
        {
          term: 'Det gennemregnede gittereksempel',
          body: [
            'Refleksionsopgave 1 (L10 s. 27): udfør A* med Manhattan-heuristik på et 4-vejs gitter, indsæt naboer i frontier med uret, og notér `g`, `h` og `f` for hvert trin. Gitteret er 10 × 10 med **S i (x = 2, y = 7)** og **T i (6, 5)**. Muren består af felterne (3,3), (4,3), (5,3) og (5,4), (5,5), (5,6) — et omvendt L mellem S og T (s. 28).',
            'Hvert felt viser `g` øverst, `h` i midten og `f` nederst til højre (s. 30). S udvides først: op (2,6) og højre (3,7) får `g = 1, h = 5, f = 6`; ned (2,8) og venstre (1,7) får `g = 1, h = 7, f = 8`. Tallet nederst til venstre på de udvidede (røde) felter er udvidelsesrækkefølgen: (2,6), (3,7), (2,5), (3,6), (4,7), (3,5), (4,6), (5,7), (4,5), (6,7), (6,6) og til sidst T (s. 31–50).',
            'Alle udvidede felter har `f = 6`; frontier-felterne omkring dem (gule) har `f = 8`. T nås med `g = 6, h = 0` via (6,6): stien er S → (3,7) → (4,7) → (5,7) → (6,7) → (6,6) → T, cost 6. “Target found” står på s. 50, da T tages ud af køen — ikke da den blev lagt i.',
          ],
        },
        {
          term: 'Dijkstra mod A* visuelt',
          body: [
            'L10 s. 23 viser samme start og mål: Dijkstra udvider en stor, næsten cirkulær rød plet med en gul frontier om; A* udvider kun et smalt bånd langs den hvide sti. Red Blob sammenligner de tre algoritmer ved en mur og konkluderer, at når greedy finder den rigtige vej, gør A* det også med samme udforskning; når greedy fejler, finder A* den korteste vej som Dijkstra, men udforsker mindre (Red Blob s. 15).',
            'Red Blob: “As long as the heuristic does not overestimate distances, A* finds an optimal path, like Dijkstra’s Algorithm does” (s. 15). Jo mindre heuristikken er, jo mere ligner A* Dijkstra; jo større, jo mere greedy best-first (s. 16).',
          ],
        },
        {
          term: 'Hvilken algoritme skal man vælge?',
          body: [
            'Red Blob’s valgguide (s. 16): skal du finde veje fra eller til *alle* steder, så brug BFS (ens costs) eller Dijkstra (varierende costs). Skal du til ét sted eller det nærmeste af flere mål, så brug greedy best-first eller A* — “prefer A* in most cases”.',
            'Optimalitet: BFS og Dijkstra finder altid korteste vej; greedy best-first gør ikke; A* gør, hvis heuristikken aldrig er større end den sande afstand. Ydelse: det bedste er at fjerne unødvendige knuder i grafen og så bruge den simpleste algoritme, der virker — enklere køer er hurtigere (s. 16–17).',
            'Grafdesign tæller: algoritmerne ser kun grafen, og kompleksiteten er lineær i dens størrelse (knuder + kanter). “Small graph = good, big graph = bad”; søgealgoritmerne virker på alle grafer, ikke kun 2D-kort (L10 s. 5–6; Red Blob s. 2–3).',
          ],
        },
      ],
      viz: 'doa-astar',
      keyPoints: [
        'A* vælger mindste `f(n) = g(n) + h(n)`: cost hertil + estimat herfra.',
        'Samme kode som Dijkstra; kun `priority = n.cost + h(n,t)` er ændret.',
        '`h = 0` → Dijkstra. Kun `h` → greedy best-first: hurtig, men ikke optimal.',
        'Admissible `h` (aldrig større end den sande rest-cost) → A* finder en korteste vej.',
        'Kompleksitet (L10 s. 18): `A*` “search complexity depends on heuristic” · bedste: med eksakt `h` udvides kun den bedste sti (L10 s. 26) · gennemsnit og værste ikke angivet som Big-O · plads ikke angivet.',
        'Kompleksitet (L10 s. 7, 12): til sammenligning `BFS` O(|V| + |E|) og `Dijkstra` O((|E| + |V|) log |V|).',
        'Early exit: stop når målet tages *ud* af frontier (L10 s. 20, 50; Red Blob s. 9).',
        'Gittereksemplet: S (2,7), T (6,5), Manhattan; alle udvidede felter har `f = 6`, stien koster 6.',
        'Valg: alle mål → BFS/Dijkstra; ét mål → A*.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Dijkstra og A* side om side — kun prioriteten er forskellig',
          source: 'Lecture10.pdf s. 20',
          code: `FindPathAStar(Graph g, Node s, Node t)
{
    // Initializing
    frontier = new PriorityQueue();
    s.prev = None;
    s.cost = 0
    frontier.push(s, 0);

    // Explore nodes
    while(!frontier.isEmpty())
    {
        current = frontier.get();
        if(current == t) return;    // early exit
        foreach(Node n in current.neighbors)
        {
            if(current.cost + edge(current, n).weight < n.cost)
            {
                n.cost = current.cost + edge(current, n).weight;
                priority = n.cost + h(n,t);   // Dijkstra: priority = n.cost;
                n.prev = current;
                frontier.push(n, priority);
            }
        }
    }
}`,
        },
        {
          lang: 'python',
          title: 'Red Blob: A* (uddrag, linjerne er afskåret i PDF’en)',
          source: 'Introduction to the A_ Algorithm.pdf s. 14',
          code: `frontier = PriorityQueue()
frontier.put(start, 0)
came_from = dict()
cost_so_far = dict()
came_from[start] = None
cost_so_far[start] = 0

while not frontier.empty():
   current = frontier.get()

   if current == goal:
      break

   for next in graph.neighbors(current):
      new_cost = cost_so_far[current] + graph.cost(...)
      if next not in cost_so_far or new_cost < cost_...:
         cost_so_far[next] = new_cost
         priority = new_cost + heuristic(goal, next ...)
         frontier.put(next, priority)
         came_from[next] = current`,
        },
      ],
      exam: [
        'A* er Dijkstra med en målrettet prioritet: frontier ordnes efter `f(n) = g(n) + h(n)`, hvor `g` er den kendte cost fra start og `h` et estimat af resten. Dijkstra udvider i alle retninger, fordi alle knuder i samme afstand har samme prioritet; A* foretrækker dem, der ser ud til at føre mod målet.',
        'Sådan løser du “udfør A* i hånden på gitteret” (opgavetype fra refleksionsopgaven L10 s. 27 og eksemplet s. 28–51, ikke fra eksamenssæt): 1) skriv `h` for felterne med Manhattan `|Δx| + |Δy|` til T; 2) start med S (`g = 0`); 3) tag feltet med mindst `f` fra frontier (skriv tie-break-reglen — her “med uret” og indsættelsesrækkefølge); 4) for hver fri nabo: `g = g(forælder) + 1`, `f = g + h`, og opdatér kun hvis `g` er mindre end før; notér `g`, `h`, `f` og en pil til forælderen; 5) stop når T *tages ud*; 6) følg pilene baglæns for stien.',
        'Sådan løser du “giv et eksempel, hvor en overestimerende h giver en forkert sti” (refleksionsopgave L10 s. 52): 1) tegn to veje fra S til T, en kort og en lang; 2) giv en knude på den korte vej en `h` større end dens sande rest-cost, så dens `f` bliver større end den lange vejs; 3) vis at A* tager T ud via den lange vej først og stopper. Slidet giver ikke svaret.',
        'Admissibility er garantien: hvis `h(n)` aldrig overstiger den sande cost til målet, finder A* en korteste vej. Med `h = 0` er A* præcis Dijkstra; med en overestimerende `h` kan A* blive hurtigere, men mister garantien.',
        'Valget: skal jeg bruge afstande til alle knuder, så BFS (ens costs) eller Dijkstra; skal jeg kun til ét mål med koordinater, så A* med en heuristik, der passer til bevægelsen.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture10_Pathfinding_AStar.md'), original: 'Lecture10.pdf', pages: 's. 3–23, 27–52', note: 'Begrænsninger, heuristisk søgning, A*, eksempel, refleksion' },
        { path: k('context/lessons/SW2ADS_Lecture10_A_Star_Algorithm.md'), original: 'Introduction to the A_ Algorithm.pdf', pages: 's. 1–17', note: 'Red Blob Games: BFS → Dijkstra → greedy best-first → A*, valgguide' },
        { path: k('context/videos/SW2ADS_Video_Week10_AStar_Pathfinding.md'), original: 'data/video transcripts/week10.txt', note: 'Computerphile: A*, stop først når målet er udvidet' },
      ],
      gaps: [
        'Markdown til Lecture10 angiver gittereksemplets koordinater som “S ved (1, 5)” og “T ved (5, 3)”. PDF-billederne (s. 28–51) har S i (2,7) og T i (6,5) med akserne 0–9.',
        'Betydningen af tallet nederst til venstre i felterne (s. 30: “p=1”) forklares ikke. På de udvidede felter svarer det til udvidelsesrækkefølgen 1–12; på frontier-felterne gentages tallene (fx har både (2,6) og (2,8) værdien 1), og reglen kan ikke aflæses.',
        'Markdown giver et svar på refleksionsopgave 2 (graf med A, B, C, D og `h(A) = 10`); svaret står ikke i PDF’en og mangler de fleste kantvægte.',
        'Red Blob-PDF’en er en udskrift af en webside: kodelinjerne er afskåret i højre side (fx `graph.cost(` og `cost_`), og animationerne mangler. Udsnittet ovenfor viser de afskårne steder med `...`.',
        'Red Blob skriver, at dens Dijkstra/A* “differs from what’s in algorithms textbooks” og ligger tættere på Uniform Cost Search (s. 11); forskellen forklares på en side, der ikke er i materialet.',
        'Videoopsummeringen (week 10) har en kompleksitetstabel med “Best Case O(d · log d)” for A*; den findes ikke i transskriptionen. Transskriptionen siger kun, at man skal vente til målet er udvidet (“super-sneaky” sti, week10.txt 11:40–12:05).',
        'Ingen Big-O for A* i materialet ud over “depends on heuristic” (L10 s. 18).',
      ],
      keywords: ['A*', 'A-stjerne', 'A star', 'AStar', 'FindPathAStar', 'f(n)', 'g(n)', 'h(n)', 'f = g + h', 'heuristic search', 'heuristisk søgning', 'greedy best-first search', 'best-first', 'frontier', 'open set', 'priority', 'early exit', 'target found', 'Manhattan', 'grid', 'gitter', '4-way', '8-way', 'Hart Nilsson Raphael', 'targeting algorithm', 'Red Blob Games', 'Dijkstra vs A*', 'pathfinding', 'stifinding', 'algoritmevalg', 'Computerphile'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'heuristikker',
      title: 'Heuristikker',
      week: 'Lektion 10',
      definition:
        'En **heuristik** `h(n)` giver A* et estimat af den mindste cost fra `n` til målet. Er `h` **admissible** — aldrig større end den sande cost — finder A* en korteste vej; jo tættere `h` er på den sande cost, jo færre knuder udvides. En heuristik, der overestimerer, gør A* hurtigere, men ikke længere optimal. På gitre vælges afstandsmålet efter den tilladte bevægelse: **Manhattan** (4 retninger), **diagonal** (8 retninger), **euklidisk** (vilkårlig retning), og `g` og `h` skal være i samme skala.',
      concepts: [
        {
          term: 'Heuristikken styrer A*',
          body: [
            'Amits “Heuristics” beskriver spektret (Heuristics.pdf s. 1): er `h(n) = 0`, spiller kun `g(n)` en rolle, og A* bliver Dijkstra. Er `h(n)` altid lavere end eller lig med den sande cost, finder A* en korteste vej — men jo lavere `h`, jo flere knuder udvides. Er `h(n)` præcis den sande cost, følger A* kun den bedste sti. Er `h(n)` nogle gange større, er der ingen garanti, men A* kan køre hurtigere. Er `h(n)` meget stor i forhold til `g(n)`, bliver A* greedy best-first search.',
            'L10 s. 26 siger det samme i punktform: `h(n) ≤` den sande optimale cost fra `n` til `T` → A* finder en korteste vej (**admissible**); `h` lig med den sande cost → kun den bedste sti udvides (“unlikely case”); `h` kan være større → A* finder måske ikke korteste vej, “but may run even faster”.',
          ],
        },
        {
          term: 'Admissibility og consistency',
          body: [
            '**Admissible**: `h(n)` er aldrig større end den faktiske optimale cost fra `n` til målet (L10 s. 26). Amit bemærker, at algoritmen strengt taget hedder A (ikke A*), når heuristikken ikke underestimerer, men at spilmiljøet ikke skelner (Heuristics.pdf s. 2).',
            '**Consistent**: for hver knude `n` og hver efterfølger `n’` via handling `a` gælder `h(n) ≤ c(n, a, n’) + h(n’)`. Så er `f(n)` ikke-aftagende langs enhver sti. Slidet siger, at consistency “may additionally” kræves for optimalitet, afhængigt af om algoritmen tillader genindsættelse i køen eller bruger en visited-mængde (L10 s. 26).',
            'L10 s. 26: “The heuristics Manhattan and Euclidian are consistent and admissible.” Det gælder for de bevægelser, de er beregnet til (4-vejs hhv. vilkårlig retning, med skalaen `D` sat til mindste skridt-cost).',
          ],
        },
        {
          term: 'Hastighed eller nøjagtighed',
          body: [
            'Man kan vælge, hvad man vil have ud af A*: præcise estimater giver korteste veje hurtigt, for lave giver korteste veje langsomt, for høje giver hurtigere, men ikke korteste veje (Heuristics.pdf s. 2). I spil er en “god” sti ofte nok.',
            'Amits terræneksempel (s. 3): fladt land koster 1, bjerge 3. A* søger så tre gange så langt på fladt land for at finde en vej uden om bjergene. Sætter man heuristikken til 1,5 pr. felt — eller bjergenes cost til 2 — søger A* mindre og giver afkald på den ideelle sti. Afvejningen kan gøres dynamisk med `g’(n) = 1 + alpha * (g(n) - 1)`: `alpha = 0` ignorerer terrænet, `alpha = 1` giver den fulde cost.',
            'Man kan også lade heuristikken returnere det *forventede* minimum i stedet for det absolutte: er kortet mest græs (cost 2) med få veje (cost 1), kan `h` antage “ingen veje” og returnere `2 * distance` (s. 4).',
          ],
        },
        {
          term: 'Skala',
          body: [
            'A* lægger `g(n)` og `h(n)` sammen, så de skal være i samme enhed. Måles `g` i timer og `h` i meter, vægter A* den ene for meget eller for lidt og giver enten dårligere stier eller kører langsommere (Heuristics.pdf s. 4).',
            'Reglen er at gange afstanden i skridt med mindste cost for et skridt: 3 felter à 15 m giver `h = 45` m; 3 felter à mindst 4 minutter giver 12 minutter (s. 7). Tjek for Manhattan: uden forhindringer og på terræn med mindste cost `D` øger et skridt mod målet `g` med `D` og mindsker `h` med `D`, så `f` er uændret — “a sign that the heuristic and cost function scales match”.',
            'En eksakt heuristik giver konstant `f` langs den optimale sti, så A* aldrig forlader den. Den kan forudberegnes (korteste vej mellem alle par, eller mellem waypoints: `h(n) = h’(n, w1) + distance(w1, w2) + h’(w2, goal)`) eller er lineær på et kort uden forhindringer (s. 5–6).',
          ],
        },
        {
          term: 'Manhattan, diagonal og euklidisk',
          body: [
            'Vælg afstanden efter bevægelsen (Heuristics.pdf s. 6): 4 retninger → **Manhattan** (L1); 8 retninger → **diagonal** (L∞); vilkårlig retning → måske **euklidisk** (L2); hexagon-gitter → Manhattan tilpasset hexagoner.',
            '**Manhattan**: `D * (dx + dy)` med `dx = |x − goal.x|`, `dy = |y − goal.y|` og `D` = laveste cost mellem nabofelter (s. 7). L10 s. 24 skriver den som `h(n) = |Δx| + |Δy|` for 4-vejs bevægelse, med en rød L-formet linje uden om muren.',
            '**Diagonal**: `D * (dx + dy) + (D2 − 2 * D) * min(dx, dy)` — antal skridt uden diagonaler minus de skridt, en diagonal sparer; hver af de `min(dx, dy)` diagonaler koster `D2` og sparer `2 * D`. `D = D2 = 1` giver **Chebyshev**, `D = 1, D2 = √2` giver **octile** (s. 8–9). Manhattan for (4 øst, 4 nord) er `8 * D`, men 4 diagonale skridt koster kun `4 * D2`.',
            '**Euklidisk**: `D * sqrt(dx * dx + dy * dy)` for enheder, der kan bevæge sig i alle vinkler (s. 9). L10 s. 24 skriver `h(n) = sqrt(|Δx|^2 + |Δy|^2)` med en ret linje gennem muren. Bruges den på et gitter, er den kortere end Manhattan og diagonal afstand, så man får stadig korteste veje, men A* kører længere.',
          ],
        },
        {
          term: '“Euclidean squared” — gør ikke dette',
          body: [
            'Nogle sider anbefaler at spare kvadratroden med `D * (dx * dx + dy * dy)`. Amits dom: “Do not do this!” (Heuristics.pdf s. 10). Kvadratet af afstanden bliver langt større end `g`, så heuristikken overestimerer; på lange afstande forsvinder `g`’s bidrag til `f`, og A* bliver greedy best-first search.',
            'Skalerer man heuristikken ned for at rette det, får man det modsatte problem på korte afstande: `h` bliver for lille, og A* bliver Dijkstra (s. 11). Er kvadratroden reelt en flaskehals efter profilering, så brug en hurtig tilnærmelse eller diagonal afstand som tilnærmelse til euklidisk.',
          ],
        },
        {
          term: 'Tie-breaking',
          body: [
            'På gitre uden terrænvariation er der mange lige lange stier, og A* kan udforske alle med samme `f` (Heuristics.pdf s. 12). Tie-breakeren skal være deterministisk i forhold til knuden og gøre `f`-værdierne forskellige.',
            'Skaler `h` lidt **op**: `heuristic *= (1.0 + p)` med `p < (mindste skridt-cost) / (forventet maksimal stilængde)`, fx `p = 1/1000` for stier under 1000 skridt. Så foretrækker A* knuder tæt på målet. Det bryder admissibility en smule, “but in games it almost never matters” (s. 13). At skalere ned gør det omvendte og foretrækker knuder nær start.',
            'Andre måder (s. 15–18): sammenlign `h`, når `f` er ens (Steven van Dijk); læg et deterministisk “tilfældigt” tal (hash af koordinaterne) til; foretræk stier langs den rette linje fra start til mål via krydsproduktet `cross = abs(dx1*dy2 - dx2*dy1)`, `heuristic += cross*0.001` — pæne stier uden forhindringer, mærkelige (men stadig optimale) med; lad nyere indsættelser med samme `f` vinde i køen; eller straf drejninger. Amit kalder dem alle et “band aid” for, at grafen har for mange lige gode veje.',
          ],
        },
      ],
      viz: 'doa-heuristics',
      keyPoints: [
        '`h = 0` → Dijkstra. `h ≤` sand cost (admissible) → korteste vej. `h =` sand cost → kun bedste sti udvides. `h >` sand cost → hurtigere, ingen garanti. `h ≫ g` → greedy best-first.',
        'Consistent: `h(n) ≤ c(n, a, n’) + h(n’)` → `f` ikke-aftagende langs stier.',
        'Manhattan `|Δx| + |Δy|` (4-vejs), diagonal `D(dx+dy) + (D2−2D)·min(dx,dy)` (8-vejs), euklidisk `sqrt(dx² + dy²)` (vilkårlig retning).',
        '`g` og `h` i samme skala: gang antal skridt med mindste skridt-cost `D`.',
        'Euklidisk i anden: overestimerer → A* bliver greedy. “Do not do this!”',
        'Tie-breaking: `h *= (1.0 + p)` med lille `p` — prioriterer knuder nær målet, bryder admissibility en smule.',
        'Kompleksitet (L10 s. 18, 26; Heuristics.pdf s. 1): `A* med h` bedste: `h` eksakt → kun den bedste sti udvides · lav `h` → flere udvidelser, `h = 0` = Dijkstra · Big-O for gennemsnit og værste ikke angivet · plads ikke angivet.',
        'Kompleksitet (Heuristics.pdf s. 5): `precomputed exact heuristic` (alle par) “not feasible for most game maps” — ingen Big-O angivet.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Manhattan, diagonal og euklidisk afstand',
          source: 'Heuristics.pdf s. 7–9',
          code: `function heuristic(node) =
    dx = abs(node.x - goal.x)
    dy = abs(node.y - goal.y)
    return D * (dx + dy)                          // Manhattan (4 retninger)

function heuristic(node) =
    dx = abs(node.x - goal.x)
    dy = abs(node.y - goal.y)
    return D * (dx + dy) + (D2 - 2 * D) * min(dx, dy)   // diagonal (8 retninger)

function heuristic(node) =
    dx = abs(node.x - goal.x)
    dy = abs(node.y - goal.y)
    return D * sqrt(dx * dx + dy * dy)            // euklidisk (vilkårlig retning)`,
        },
        {
          lang: 'text',
          title: 'Euclidean squared (gør ikke dette) og tie-breaking',
          source: 'Heuristics.pdf s. 10, 13, 15',
          code: `// s. 10 — overestimerer: A* degraderer til greedy best-first
function heuristic(node) =
    dx = abs(node.x - goal.x)
    dy = abs(node.y - goal.y)
    return D * (dx * dx + dy * dy)

// s. 13 — skalér h en smule op
heuristic *= (1.0 + p)

// s. 15 — foretræk stier langs linjen start → mål
dx1 = current.x - goal.x
dy1 = current.y - goal.y
dx2 = start.x - goal.x
dy2 = start.y - goal.y
cross = abs(dx1*dy2 - dx2*dy1)
heuristic += cross*0.001`,
        },
      ],
      exam: [
        'Heuristikken er det estimat af den resterende cost, som A* ordner frontier efter. Er den admissible — aldrig større end den sande cost — finder A* en korteste vej; jo tættere den er på den sande cost, jo færre knuder udvides. Overestimerer den, kan A* blive hurtigere, men stien er ikke længere garanteret korteste.',
        'Sådan løser du “vælg og begrund en heuristik” (opgavetype udledt af L10 s. 24–27 og Heuristics.pdf s. 6–10, ikke af eksamenssæt): 1) find den tilladte bevægelse — 4 retninger → Manhattan, 8 → diagonal, vilkårlig → euklidisk; 2) sæt skalaen `D` til den mindste cost for ét skridt, så `g` og `h` har samme enhed; 3) tjek admissibility: kan heuristikken nogensinde overstige den sande cost? 4) nævn konsekvensen: for lav → langsommere (mod Dijkstra), for høj → ikke optimal (mod greedy best-first).',
        'Sådan beregner du `h` i hånden: skriv `dx = |x − xT|`, `dy = |y − yT|`; Manhattan `dx + dy`; diagonal med `D = 1, D2 = √2` (octile) `max(dx, dy) + (√2 − 1)·min(dx, dy)`; euklidisk `√(dx² + dy²)`. For S (2,7) og T (6,5) i L10’s eksempel er Manhattan 6.',
        'Euklidisk afstand i anden er en klassisk fejl: den har forkert skala, overestimerer på lange afstande og gør A* til greedy best-first. Skalerer man den ned, bliver den for lille på korte afstande, og A* bliver Dijkstra.',
        'Tie-breaking løser, at mange stier på et gitter har samme `f`. Man skalerer `h` en anelse op, så knuder tættere på målet vinder — det koster en smule admissibility, men A* udvider langt færre knuder.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture10_Heuristics.md'), original: 'Heuristics.pdf', pages: 's. 1–18', note: 'Amit Patel, “Heuristics” (Red Blob Games)' },
        { path: k('context/lessons/SW2ADS_Lecture10_Pathfinding_AStar.md'), original: 'Lecture10.pdf', pages: 's. 18–19, 24–27', note: 'Heuristic function: Manhattan, euklidisk, admissible, consistent' },
        { path: k('context/lessons/SW2ADS_Lecture10_A_Star_Algorithm.md'), original: 'Introduction to the A_ Algorithm.pdf', pages: 's. 12, 15–16', note: 'Heuristik i greedy best-first og A*' },
      ],
      gaps: [
        'L10 s. 26 kalder Manhattan og euklidisk både consistent og admissible uden forbehold. Heuristics.pdf viser, at det afhænger af bevægelsen og skalaen: Manhattan er kun admissible, når der ikke er diagonale skridt, og `D` er den laveste skridt-cost (s. 6–7).',
        'L10 s. 24 kalder euklidisk “any-way”; Heuristics.pdf siger om vilkårlig bevægelse, at man “might or might not want” euklidisk afstand, og at `g` og `h` så ikke passer sammen på et gitter (s. 6, 9).',
        'Consistency står kun på L10 s. 26; Heuristics.pdf definerer det ikke. Slidet forklarer ikke, hvornår “re-queuing” eller en visited-mængde gør consistency nødvendig.',
        'Heuristics.pdf har mange figurer (søgeområder med og uden tie-breaking), som ikke er med i PDF-udskriften; kun billedteksterne står der. Links til ALT A*, Jump Point Search, Fringe Search m.fl. (s. 18–20) er uden for kursets slides og ikke uddybet.',
        'Ingen Big-O for heuristikker eller for A* med forskellige heuristikker i materialet.',
        'Diagonal-funktionen på Heuristics.pdf s. 8 er afskåret efter `min(dx,` i PDF’en; `min(dx, dy)` er udfyldt ud fra teksten på s. 9. Kommentarerne i kodeeksemplet er tilføjet her.',
        'Markdown-konverteringen (Lecture10_Heuristics.md) er en dansk genfortælling med formler i LaTeX; indholdet svarer til PDF’en, men sidenumre står ikke i den.',
      ],
      keywords: ['heuristik', 'heuristic', 'h(n)', 'admissible', 'tilladelig', 'consistent', 'konsistent', 'monotone', 'overestimate', 'overestimering', 'underestimate', 'Manhattan distance', 'L1', 'diagonal distance', 'Chebyshev', 'octile', 'L∞', 'Euclidean distance', 'euklidisk', 'L2', 'Euclidean squared', 'scale', 'skala', 'D', 'D2', 'speed vs accuracy', 'hastighed', 'nøjagtighed', 'tie-breaking', 'tie breaker', 'cross product', 'exact heuristic', 'waypoints', 'greedy best-first', 'Amit Patel', 'Red Blob Games'],
    },

    // ------------------------------------------------------------------
    {
      slug: 'mst',
      title: 'Minimum spanning tree',
      week: 'Lektion 11',
      definition:
        'Et **minimum spanning tree** (MST) af en sammenhængende, uorienteret, vægtet graf er et udspændende træ — alle knuder, |V| − 1 kanter, ingen cykler — med mindst mulig samlet vægt. Kurset løser det med to **greedy** algoritmer, der begge tilføjer en **light edge** over et snit: **Prim** gror ét træ fra en rod og er O(|V|²) med vector eller O((|V| + |E|) log |V|) med min-heap; **Kruskal** tager kanterne i stigende orden og afviser dem, der lukker en cyklus, med **disjoint sets** — O(|E| log |E|).',
      intro: [
        'Lektionen starter med tre eksamensspørgsmål om samme boligområde (L11 s. 3–5): en asymmetrisk `dataLossMatrix` mellem otte huse, den tilsvarende orienterede, vægtede graf, og spørgsmålet “If using a wired network, which set of connections provides the overall shortest cable length?” — et MST-problem.',
      ],
      concepts: [
        {
          term: 'Eksamensspørgsmålene (L11 s. 3–5)',
          body: [
            's. 3 giver `houseNumberToIndex` (`"7"`→0, `"8"`→1, `"10"`→2, `"12"`→3, `"12a"`→4, `"12b"`→5, `"13"`→6, `"69"`→7) og en 8 × 8 `dataLossMatrix`, fx række 0 = `{0, 50, 40, 160, 160, 160, 160, 160}` og række 1 = `{55, 0, 160, 160, 20, 40, 160, 160}`. Spørgsmålene: hvilke karakteristika har en graf, der kan repræsentere dette? Og hvilken metode fra kurset er nyttig til at kortlægge alle-til-alle-forbindelser?',
            'Matricen er asymmetrisk (`M[0][1] = 50`, `M[1][0] = 55`), så grafen er **orienteret og vægtet**; s. 4 tegner den med pile og vægte (fx `12b → 12` med 5). Værdien 160 optræder, hvor der ikke er en direkte forbindelse. Alle-til-alle-spørgsmålet peger på **all-pairs shortest path** (se nedenfor) — slidene giver ikke svarene.',
            's. 5 skifter model: husene er knuder, kablerne er **uorienterede, vægtede** kanter med kabellængden som vægt, og den billigste måde at forbinde alle huse på er et MST.',
          ],
        },
        {
          term: 'Problemet og den generiske greedy-tilgang',
          body: [
            'En **spanning graph** af `G` er en delgraf `H` med `V’ = V` og `E’ ⊆ E`. MST-problemet: givet `(V, E, W)`, find den sammenhængende udspændende delgraf `T` med mindst total vægt. Det kan kun løses, hvis grafen er sammenhængende (L11 s. 6). Bogen: et MST har |V| − 1 kanter, er acyklisk og udspændende; tilføjes en kant, opstår en cyklus, og fjernes en kant på cyklussen, er det igen et træ (Weiss s. 413).',
            'Den generiske greedy-algoritme (L11 s. 7) vedligeholder en kantmængde `A`, der ved starten af hver iteration er indeholdt i et MST, og tilføjer en kant `(u, v)` af minimal vægt, så `A ∪ {(u, v)}` stadig er det. Sådan en kant hedder en **light edge** for `A`.',
            'Et **snit** (*cut*): del knuderne i `S` og `V − S`; kanterne med én ende i hver krydser snittet, og en krydsende kant er **light**, hvis den har minimal vægt (L11 s. 8). Prim og Kruskal specialiserer begge den generiske tilgang med denne egenskab. Bogens argument for, at greedy virker: en kant, der tilføjes som den billigste, der ikke laver en cyklus, kan ikke erstattes af en billigere (Weiss s. 413).',
          ],
        },
        {
          term: 'Prims algoritme',
          body: [
            'I Prim er `A` ét træ med en vilkårligt valgt rod `r`. I hver iteration betragtes snittet mellem træets knuder og resten, og en light edge over snittet tilføjes, til `A` er et MST (L11 s. 10). Bogen: Prim er “essentially identical to Dijkstra’s algorithm”, bortset fra at `dv` er vægten af den korteste kant fra `v` til en kendt knude, så opdateringen er `dw = min(dw, cw,v)` (Weiss s. 414).',
            'Slidets eksempel (s. 11–19) er grafen med knuderne `a–i` og kanterne `a–b` 4, `a–h` 8, `b–c` 8, `b–h` 11, `c–d` 7, `c–f` 4, `c–i` 2, `d–e` 9, `d–f` 14, `e–f` 10, `g–f` 2, `h–g` 1, `h–i` 7, `i–g` 6. Fra `a` tilføjes: `a–b` 4, `b–c` 8, `c–i` 2, `c–f` 4, `f–g` 2, `g–h` 1, `c–d` 7, `d–e` 9 — i alt 37.',
            'Kursets `primMST()` (s. 20) holder en vector `key` (mindste kant ind i træet) og `parent`. I hver af |V| iterationer findes den ubesøgte knude med mindst `key` ved lineær søgning; den markeres besøgt, dens vægt lægges til `mst_wt`, og naboernes `key`/`parent` opdateres. Rod er altid knude 0.',
          ],
        },
        {
          term: 'Kruskals algoritme og disjoint sets',
          body: [
            'I Kruskal er `H = (V, A)` en **skov**. I hver iteration vælges en light edge, der forbinder to *forskellige* træer i skoven, og den tilføjes, til `A` er et MST (L11 s. 24). Bogen: tag kanterne i stigende vægt og accepter en kant, hvis den ikke laver en cyklus; skoven starter med |V| enkeltknude-træer og ender som ét (Weiss s. 417–418).',
            'På samme graf (s. 26–34) accepteres `h–g` 1, `c–i` 2, `g–f` 2, `a–b` 4, `c–f` 4; `i–g` 6 afvises (pilen på s. 33 — `i` og `g` er allerede forbundet); så `c–d` 7 og `a–h` 8; til sidst `d–e` 9 (s. 34). Summen er igen 37, men træet er et andet end Prims: Kruskal har `a–h`, Prim har `b–c` — begge vejer 8.',
            'Cyklustesten er **union/find** (Weiss kap. 8): to knuder er i samme mængde, hvis og kun hvis de er forbundet i den nuværende skov. Er `find(u) == find(v)`, afvises kanten; ellers accepteres den, og mængderne slås sammen (Weiss s. 418). Kursets `DisjSets` bruger *union by rank* (højde) og *path compression*: `s[x] < 0` betyder rod, og `find` sætter `s[x] = find(s[x])` på vejen op.',
            'Kursets `kruskalMST()` (s. 35) lægger alle kanter som `{weight[i][j], {i, j}}` i en vector, sorterer den, opretter `DisjSets ds(adj.size())` og kører listen igennem: `if (set_u != set_v)` → udskriv kanten, læg vægten til og `ds.unionSets(set_u, set_v)`.',
          ],
        },
        {
          term: 'Kompleksitet og sammenligning',
          body: [
            'Prim udfører |V| iterationer, tager minimum ud |V| gange og sænker afstande højst |E| gange (L11 s. 21): med **vector** O(|V|² + |E|) = O(|V|²), med **min-heap** O((|V| + |E|) lg |V|). Bogen: O(|V|²) uden heaps er optimal for tætte grafer, O(|E| log |V|) med binær heap er godt for tynde (Weiss s. 417). Kursets `primMST()` er vector-versionen.',
            'Kruskal (L11 s. 25, bogens fig. 9.60 med annoteringer): opbyg prioritetskø O(|E| log |E|); while-løkken kører til |V| − 1 kanter er valgt, annoteret O(|V|); `pop` O(log |E|); `find` “Max O(log |E|) – amortized O(1)”; `union` O(log |E|). Samlet O(|E| log |E|); da |E| = O(|V|²), er det O(|E| log |V|) (Weiss s. 418–419). Bogen anbefaler at bygge en heap i lineær tid frem for at sortere, fordi man ofte kan stoppe før alle kanter er testet.',
            'Refleksionsspørgsmål 2 (L11 s. 22): hvornår giver en prioritetskø en speedup i forhold til vector? Formlerne svarer: når grafen er tynd, så (|V| + |E|) log |V| er mindre end |V|². For en tæt graf med |E| ≈ |V|² er vector-versionen bedre.',
          ],
        },
        {
          term: 'All-pairs shortest path (Floyd)',
          body: [
            'Agendaen i L11 s. 23 afkrydser “All-pairs shortest-paths”, men slidene har intet indhold om det; stoffet ligger i videoen (week 11) og bogen 10.3.4. Problemet: korteste vej mellem **alle** par. Man kan køre Dijkstra fra hver knude — O(|V|³) på tætte grafer — men bogens [[dynamisk-programmering|dynamisk-programmerings]]algoritme er enklere og har tættere løkker (Weiss s. 491).',
            'Definer `D(k,i,j)` som vægten af den korteste vej fra `vi` til `vj`, der kun bruger `v1 … vk` som mellemknuder. `D(0,i,j) = c(i,j)` (∞ hvis ingen kant), og `D(k,i,j) = min{ D(k−1,i,j), D(k−1,i,k) + D(k−1,k,j) }`. Da stadie `k` kun afhænger af `k − 1`, og brug af `k` som mellemknude ikke ændrer `d[i][k]` eller `d[k][j]`, kan det gøres i én matrix (Weiss s. 492–493).',
            'Køretiden er O(|V|³) (tre løkker; `k` skal være yderst). Algoritmen virker også med negative kanter, så længe der ikke er negative cykler — det gør Dijkstra ikke; en negativ cyklus viser sig som `d[i][i] < 0` (Weiss s. 492–493). Videoen kalder algoritmen Floyd-Warshall og gennemregner en 4 × 4-matrix; bogen giver den intet navn.',
          ],
        },
      ],
      viz: 'doa-prim-kruskal',
      keyPoints: [
        'MST: alle knuder, |V| − 1 kanter, ingen cykler, minimal sum. Kræver sammenhængende, uorienteret graf.',
        'Light edge = billigste kant over et snit. Prim og Kruskal tilføjer begge kun light edges (greedy).',
        'Prim: ét træ fra en rod, tilføj billigste kant fra træet til en ny knude — som Dijkstra med `dw = min(dw, cw,v)`.',
        'Kruskal: kanter i stigende orden, afvis kanter inden for samme mængde (`find(u) == find(v)`), ellers `unionSets`.',
        'Kompleksitet (L11 s. 21; Weiss s. 417): `Prim` vector O(|V|² + |E|) = O(|V|²) · min-heap O((|V| + |E|) log |V|) (bogen: O(|E| log |V|)) · bedste/gennemsnit ikke angivet · plads ikke angivet.',
        'Kompleksitet (L11 s. 25; Weiss s. 418–419): `Kruskal` værste O(|E| log |E|) = O(|E| log |V|) · `pop` O(log |E|) · `find` maks O(log |E|), amortiseret O(1) · `union` O(log |E|) (slidets annotering) · bedste/gennemsnit ikke angivet · plads ikke angivet.',
        'Kompleksitet (Weiss s. 491–492; video week 11): `all-pairs (Floyd)` O(|V|³), videoen Θ(n³) · virker med negative kanter uden negative cykler · plads én |V| × |V|-matrix.',
        'Slidegrafen `a–i`: Prim fra `a` og Kruskal giver begge vægt 37, men forskellige træer (`b–c` 8 mod `a–h` 8).',
        'Asymmetrisk matrix → orienteret, vægtet graf. “Alle-til-alle” → all-pairs shortest path.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'primMST — vector-baseret Prim',
          source: 'Lecture11.pdf s. 20 (graph_class.cpp)',
          code: `int Graph::primMST() {
    int mst_wt = 0;                     // Initialize result
    vector<int> parent(adj.size());     // Array to store MST
    vector<int> key(adj.size());        // Values to pick minimum weight edge in cut
    vector<bool> visited(adj.size());   // To represent set of vertices included

    // Initialize all keys as INFINITE
    for (int i = 0; i < adj.size(); i++) {
        key[i] = INFINITY, visited[i] = false;
    }

    // Always include first 1st vertex in MST, make sure it is picked first.
    key[0] = 0;
    parent[0] = -1; // First node is always root of MST

    // The MST will have V vertices
    for (int count = 0; count < adj.size(); count++) {
        // Pick the minimum key vertex not yet included in MST
        int min = INFINITY, u;
        for (int v = 0; v < adj.size(); v++) {
            if (visited[v] == false && key[v] < min) {
                min = key[v], u = v;
            }
        }
        // Add the picked vertex to the MST Set
        visited[u] = true;
        if (u != 0) {
            mst_wt += min;
            cout << u << " - " << parent[u] << ", ";
        }

        // Update key/parent of the adjacent vertices of the picked vertex.
        for (auto v : adj[u]) {
            if (weight[u][v] && visited[v] == false && weight[u][v] < key[v]) {
                parent[v] = u, key[v] = weight[u][v];
            }
        }
    }
    return mst_wt;
}`,
        },
        {
          lang: 'cpp',
          title: 'kruskalMST — sorterede kanter og disjoint sets',
          source: 'Lecture11.pdf s. 35 (graph_class.cpp)',
          code: `int Graph::kruskalMST() {
    int mst_wt = 0; // Initialize result
    vector<pair<int, pair<int, int>>> edges;

    for (int i = 0; i < adj.size(); i++) {
        for (auto j : adj[i]) {
            edges.push_back({weight[i][j], {i, j}});
        }
    }

    // Sort edges in increasing order on basis of cost
    sort(edges.begin(), edges.end());

    // Create disjoint sets
    DisjSets ds(adj.size());

    // Iterate through all sorted edges
    vector<pair<int, pair<int, int>>>::iterator it;
    for (it = edges.begin(); it != edges.end(); it++) {
        int u = it->second.first;
        int v = it->second.second;

        int set_u = ds.find(u);
        int set_v = ds.find(v);

        // Check if the selected edge is creating
        // a cycle or not (Cycle is created if u
        // and v belong to same set)
        if (set_u != set_v) {
            // Current edge will be in the MST
            cout << u << " - " << v << ", ";

            // Update MST weight
            mst_wt += it->first;

            // Merge two sets
            ds.unionSets(set_u, set_v);
        }
    }

    return mst_wt;
}`,
        },
        {
          lang: 'cpp',
          title: 'DisjSets — union by rank og path compression (uddrag, const-find udeladt)',
          source: 'DisjSets.cpp (kildekode_part8.md), DisjSets.h (kildekode_part3.md)',
          code: `DisjSets::DisjSets( int numElements ) : s( numElements, -1 )
{
}

void DisjSets::unionSets( int root1, int root2 )
{
    if( s[ root2 ] < s[ root1 ] )  // root2 is deeper
        s[ root1 ] = root2;        // Make root2 new root
    else
    {
        if( s[ root1 ] == s[ root2 ] )
            --s[ root1 ];          // Update height if same
        s[ root2 ] = root1;        // Make root1 new root
    }
}

int DisjSets::find( int x )
{
    if( s[ x ] < 0 )
        return x;
    else
        return s[ x ] = find( s[ x ] );
}`,
        },
        {
          lang: 'cpp',
          title: 'All-pairs shortest path (Floyd)',
          source: 'Weiss s. 493, fig. 10.53 (Fig10_53.cpp i kildekode_part8.md)',
          code: `void allPairs( const matrix<int> & a,
               matrix<int> & d, matrix<int> & path )
{
    int n = a.numrows( );

    // Initialize d and path
    for( int i = 0; i < n; ++i )
        for( int j = 0; j < n; ++j )
        {
            d[ i ][ j ] = a[ i ][ j ];
            path[ i ][ j ] = NOT_A_VERTEX;
        }

    for( int k = 0; k < n; ++k )
        // Consider each vertex as an intermediate
        for( int i = 0; i < n; ++i )
            for( int j = 0; j < n; ++j )
                if( d[ i ][ k ] + d[ k ][ j ] < d[ i ][ j ] )
                {
                    // Update shortest path
                    d[ i ][ j ] = d[ i ][ k ] + d[ k ][ j ];
                    path[ i ][ j ] = k;
                }
}`,
        },
      ],
      exam: [
        'Et minimum spanning tree forbinder alle knuder i en sammenhængende, uorienteret, vægtet graf med |V| − 1 kanter og mindst mulig samlet vægt. Prim og Kruskal er begge greedy: de tilføjer kun light edges — den billigste kant over et snit — og det kan bevises aldrig at give et dårligere træ.',
        'Sådan løser du “udfør Prim fra a” (opgavetype fra “MST warm-up”-øvelsen L11 s. 22 og gennemgangen s. 11–19, ikke fra eksamenssæt): 1) start med træet `{a}`; 2) find alle kanter med præcis én ende i træet og vælg den billigste (skriv tie-break); 3) tilføj kanten og dens nye knude; 4) gentag til alle |V| knuder er med; 5) skriv kanterne i rækkefølge og summen. På slidegrafen: `a–b` 4, `b–c` 8, `c–i` 2, `c–f` 4, `f–g` 2, `g–h` 1, `c–d` 7, `d–e` 9 = 37.',
        'Sådan løser du “udfør Kruskal”: 1) sortér alle kanter stigende; 2) gå listen igennem og skriv for hver kant “accepteret” eller “afvist (cyklus)” — afvist, hvis begge ender allerede er i samme træ (samme `find`); 3) stop efter |V| − 1 accepterede kanter; 4) skriv summen. På slidegrafen: `h–g` 1, `c–i` 2, `g–f` 2, `a–b` 4, `c–f` 4, `i–g` 6 afvist, `h–i` 7 afvist, `c–d` 7, `a–h` 8 (eller `b–c` 8), `d–e` 9 = 37.',
        'Prim med vector er O(|V|²) og passer til tætte grafer; med min-heap er den O((|V| + |E|) log |V|) og passer til tynde grafer. Kruskal er O(|E| log |E|), domineret af at ordne kanterne, og bruger disjoint sets til cyklustesten. Det svarer på refleksionsspørgsmålet: en prioritetskø hjælper, når |E| er meget mindre end |V|².',
        'Sådan løser du eksamensspørgsmålet om `dataLossMatrix` (L11 s. 3): 1) er matricen symmetrisk? Nej → orienteret graf; tal i cellerne → vægtet; 2) “alle-til-alle forbindelser” → all-pairs shortest path: Floyds algoritme med `D(k,i,j) = min(D(k−1,i,j), D(k−1,i,k) + D(k−1,k,j))` i O(|V|³), eller Dijkstra fra hver knude; 3) skal husene kobles med mindst mulig kabellængde (s. 5), er kablerne uorienterede, og det er et MST.',
      ],
      sources: [
        { path: k('context/lessons/SW2ADS_Lecture11_MST.md'), original: 'Lecture11.pdf', pages: 's. 3–35', note: 'Eksamensspørgsmål, generisk greedy, Prim, Kruskal, kode, refleksion s. 22' },
        { path: k('context/book/AOD_Ch09.5_10.3.4_Week_11_MST.md'), original: BOOK, pages: 's. 413–419', note: '9.5 Minimum Spanning Tree, 9.5.1 Prim, 9.5.2 Kruskal, fig. 9.60' },
        { path: k('context/book/AOD_Ch09.5_10.3.4_Week_11_MST.md'), original: BOOK, pages: 's. 491–493', note: '10.3.4 All-Pairs Shortest Path, fig. 10.53' },
        { path: k('context/videos/SW2ADS_Video_Week11_MST_APSP.md'), original: 'data/video transcripts/week11.txt', note: 'Abdul Bari: 4.2 All Pairs Shortest Path (Floyd-Warshall), 3.5 Prim og Kruskal' },
        { path: k('context/kode/kildekode_part3.md'), note: 'DisjSets.h' },
        { path: k('context/kode/kildekode_part8.md'), note: 'DisjSets.cpp og Fig10_53.cpp (allPairs)' },
        { path: k('context/kode/kildekode_part7.md'), note: 'matrix.h (bruges af allPairs)' },
      ],
      gaps: [
        'L11 s. 23 afkrydser “All-pairs shortest-paths” på agendaen, men decket har ingen slides om emnet. Stoffet findes kun i videoen (week 11) og bogen 10.3.4. Agendaen på s. 2 har rækkefølgen Kruskal–Prim, s. 9 og s. 23 Prim–Kruskal.',
        'Eksamensspørgsmålene på s. 3–4 har ingen svar i PDF’en. Markdown tilføjer svaret “Floyd-Warshall algoritmen (fra tidligere lektion om all-pairs shortest-paths)” — der er ingen tidligere lektion om det i materialet. Betydningen af værdien 160 i `dataLossMatrix` forklares ikke.',
        'Markdownens sammenligningstabel (Prim “bedst for dense”, Kruskal “bedst for sparse”, Kruskal optimeret O(|E| log |V|)) og svaret på refleksionsspørgsmål 2 findes ikke i PDF’en.',
        'L11 s. 25 annoterer `union` med O(log |E|), men kursets `DisjSets::unionSets` er konstant tid (to sammenligninger og en tildeling); omkostningen ligger i `find`. Annoteringen “O(|V|)” ved while-løkken tæller kun accepterede kanter — løkken kan køre op til |E| gange (bogens eksempel med `v8` og kant af cost 100, Weiss s. 418).',
        'Weiss’ pseudokode (fig. 9.60) kalder `ds.union(...)`, kursets `DisjSets` har `unionSets(...)` (`union` er et reserveret ord i C++).',
        '`kruskalMST()` lægger hver uorienteret kant ind to gange (`{i, j}` og `{j, i}`) og sorterer med `std::sort` i stedet for at bruge en prioritetskø; den stopper heller ikke efter |V| − 1 kanter. Resultatet er det samme (testet på slidegrafen: 37).',
        '`primMST()` antager, at grafen er sammenhængende: er den ikke, forbliver `u` uinitialiseret i den iteration, hvor ingen ubesøgt knude har `key < INFINITY`. Slidet nævner ikke kravet ved koden (kun generelt på s. 6).',
        'Videoopsummeringen siger, at Prim starter med “den globalt billigste kant”; slidene og bogen starter fra en vilkårlig rod. Videoopsummeringens kompleksitetstabel (Prim O(V·E) naiv, Kruskal O(E·V) naiv) og udsagnet om negative kanter i Floyd står ikke i transskriptionen; negative kanter er dækket af bogen (Weiss s. 492).',
        'Bogen og kildekoden kalder all-pairs-algoritmen `allPairs` uden navn; “Floyd-Warshall” står kun i videoen.',
        'Markdown til Lecture11 beskriver snit-figuren på s. 8 som “Skillelinjen går mellem {d, e} og resten”; billedet viser `S` = de grå knuder `a`, `b`, `d`, `e` og snittet som en bølget linje.',
      ],
      keywords: ['MST', 'minimum spanning tree', 'minimum udspændende træ', 'spanning tree', 'udspændende træ', 'spanning graph', 'Prim', 'Prims algoritme', 'primMST', 'Kruskal', 'Kruskals algoritme', 'kruskalMST', 'greedy', 'grådig', 'light edge', 'cut', 'snit', 'cut property', 'forest', 'skov', 'disjoint sets', 'union-find', 'union/find', 'DisjSets', 'unionSets', 'find', 'path compression', 'union by rank', 'key', 'parent', 'mst_wt', 'all-pairs shortest path', 'APSP', 'Floyd', 'Floyd-Warshall', 'allPairs', 'dataLossMatrix', 'houseNumberToIndex', 'kabelnetværk', 'fiber', 'exam question'],
    },
  ],
}
