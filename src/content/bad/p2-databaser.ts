import type { Part } from '../types'
import { ctx } from './paths'

export const databaser: Part = {
  id: 'databaser',
  title: 'Relationelle databaser',
  topics: [
    {
      slug: 'er-model',
      title: 'Datamodellering med ER (Chen)',
      short: 'ER-modellering',
      week: 'Uge 2',
      definition:
        'En ER-model er en **konceptuel** model af et domæne: entitetstyper, relationer mellem dem og deres attributter. I SW4BAD tegnes den i **Chen-notation**.',
      intro: [
        'ER-modellen er første del af databasens livscyklus: krav → **logisk design** (modellér, integrér views, transformér til tabeller, normalisér) → fysisk design (indekser, evt. denormalisering) → implementering → overvågning, og så forfra når kravene ændrer sig. Kurset fokuserer på det logiske design.',
      ],
      concepts: [
        {
          term: 'Byggestenene i Chen',
          body: [
            '**Entitet** (rektangel), **svag entitet** (dobbelt rektangel — findes ikke uden sin forælder, fx en afdrag uden et lån), **relation** (rombe) og **attributter** (ovaler). En nøgleattribut understreges; en flerværdi-attribut har dobbelt streg; en sammensat attribut har under-attributter (fx `address` → `street`, `city` …).',
          ],
        },
        {
          term: 'Grad og kardinalitet',
          body: [
            'Graden er antallet af entiteter i relationen: binær (mest almindelig), binær rekursiv (samme entitet i begge ender, fx `manages` med rollerne manager/subordinate), ternær og n-ær. N-ære relationer bør nedbrydes til binære og ternære.',
            'Kardinaliteten er 1:1, 1:N eller N:N. **Kursets konvention:** N er et maksimum og betyder *mindst 1*; et konkret tal som 3 er tilladt. Materialet understreger selv, at det ikke er standard, men at det er standarden i kurset.',
          ],
        },
        {
          term: 'Eksistens: valgfri eller obligatorisk',
          body: [
            'En lille cirkel på linjen betyder at relationen er **valgfri** for den side: nogle instanser er ikke relateret. Står der ingen cirkel, er eksistensen obligatorisk som angivet af 1 eller N. Eksempel: `Department 1 ○— is-managed-by — 1 Employee` — ikke alle medarbejdere er ledere.',
          ],
        },
        {
          term: 'Relationsattributter',
          body: [
            'På N:N-relationer er attributter entydige og bør lægges på relationen (fx `start-date` på `works-on`). På 1:1 og 1:N kan en attribut være tvetydig — er `start-date` afdelingens eller medarbejderens? — så undgå det dér.',
          ],
        },
        {
          term: 'Generalisering',
          body: [
            'Fælles attributter løftes op i en **supertype**. Subtyperne forbindes via en cirkel med `d` (**disjoint**: gensidigt udelukkende) eller `o` (**overlapping**). Dobbelt streg mellem supertype og cirklen betyder *total* dækning.',
          ],
        },
        {
          term: 'Ternære relationer og FD’er',
          body: [
            'Bruges når tre entiteter ikke kan beskrives med binære relationer. Reglen: hver entitet, der er en “1”-side, har sin nøgle på højresiden af præcis én funktionel afhængighed. 1:1:1 giver tre FD’er, 1:1:N to, 1:N:N én, N:N:N ingen. Se [[normalisering|Normalisering]] for FD’er.',
          ],
        },
        {
          term: 'Metoden',
          body: [
            'For hvert view: find entitetstyper (navneord), find relationer (transitive verber), find attributter (tillægsord; biord for relationsattributter), bestem kandidat- og primærnøgler, overvej strukturer, tjek modellen (redundans? understøtter den de forventede CRUD-operationer?), og gennemgå den med kunden.',
            'I biludlejnings-eksemplet giver første gennemlæsning bl.a. `car`, `customer`, `location` og `insurance`. Ved genlæsning opdages de to procesnavneord **rental** og **reservation**, som også skal være entiteter. Design er iterativt; “there is not one correct design”.',
          ],
        },
      ],
      viz: 'er-chen',
      keyPoints: [
        'ER er konceptuel: den beskriver data og regler i domænet, ikke processer eller kode.',
        'Chen: rektangel = entitet, rombe = relation, oval = attribut, understreget = nøgle, dobbelt = svag/flerværdi.',
        'Kursuskonvention: N = maksimum og mindst 1. Ingen cirkel = obligatorisk; cirkel = valgfri.',
        'Attributter på relationen kun ved N:N.',
        'Generalisering: `d` = disjoint, `o` = overlapping; dobbelt streg = total.',
        'N-ære relationer nedbrydes til binære og ternære.',
      ],
      exam: [
        'Jeg starter med kravene og finder entiteter som navneord og relationer som verber. Så bestemmer jeg for hver relation grad, kardinalitet og om den er valgfri.',
        'I Chen-notation er N et maksimum og betyder mindst én; en cirkel på linjen gør relationen valgfri for den side.',
        'Attributter lægges kun på relationen ved mange-til-mange, fordi de ellers er tvetydige.',
        'Modellen er konceptuel. Den bliver først til tabeller i næste trin, relational mapping.',
      ],
      sources: [
        { path: ctx('02-databaser-intro/er-modellering.md'), original: 'SW4BAD - Entity-Relationship Modelling.pdf', pages: 's. 3–21' },
        { path: ctx('02-databaser-intro/database-life-cycle.md'), original: 'SW4BAD - Database Life Cycle.pdf', pages: 's. 2–10' },
        { path: ctx('02-databaser-intro/conceptual-data-modeling.md'), original: 'SW4BAD - Conceptual Data Modeling.pdf', pages: 's. 2–14' },
        { path: 'bad/assignment2/Assignment 2.pdf', note: 'Aflevering 2: MovieVault ER-model og SQL-skema' },
      ],
      gaps: [
        'Materialet nævner *aggregation* sammen med generalisering i oversigten, men viser kun eksempler på generalisering.',
      ],
      keywords: ['Chen', 'entity', 'relationship', 'cardinality', 'kardinalitet', 'weak entity', 'svag entitet', 'ternary', 'ternær', 'disjoint', 'overlapping', 'livscyklus', 'crow’s foot'],
    },

    {
      slug: 'noegler',
      title: 'Relationer, nøgler og referentiel integritet',
      short: 'Nøgler og integritet',
      week: 'Uge 2–3',
      definition:
        'En **relation** er en todimensionel tabel; en **nøgle** udpeger en række entydigt. **Referentiel integritet** kræver, at enhver fremmednøgle peger på en række, der findes.',
      concepts: [
        {
          term: 'Relation, tuple og skema',
          body: [
            'Attribut = kolonne, tuple = række = record. Skemaet er relationens navn plus attributterne, fx `Movies(title, year, genre, length)`; rækkefølgen af attributterne er ligegyldig, og hver attribut kan have et domæne (type). Et databaseskema er samlingen af relationsskemaer.',
          ],
        },
        {
          term: 'Super-, kandidat- og primærnøgle',
          body: [
            'En **supernøgle** er ethvert sæt attributter, der tilsammen udpeger en række entydigt; ethvert supersæt af en supernøgle er også en supernøgle. En **kandidatnøgle** er en *minimal* supernøgle: fjerner man én attribut, er den ikke længere en supernøgle.',
            '**Primærnøglen** vælges blandt kandidatnøglerne; de øvrige kaldes sekundære/alternative nøgler. Primærnøglen er determinanten, må ikke være `NULL` og skal have en værdi ved indsættelse.',
            'I Movies er `title` ikke nok, fordi *A Star Is Born* findes fra både 1976 og 2018. Nøglen er den sammensatte **(title, year)**.',
          ],
        },
        {
          term: 'Surrogat- og sammensatte nøgler',
          body: [
            'En **surrogatnøgle** er kunstig og genereres af systemet (fx `IDENTITY`). Den har ingen betydning i domænet og beskytter mod kaskadeopdatering af fremmednøgler. En **sammensat nøgle** består af flere attributter. Med en surrogatnøgle som PK er BCNF typisk overholdt, jf. normaliseringsslides.',
          ],
        },
        {
          term: 'Fremmednøgle og referentiel integritet',
          body: [
            'En fremmednøgle er et sæt attributter, der refererer til primærnøglen i en anden tabel. Den refererede tabel skal findes, de refererede attributter skal være dens primærnøgle, og type og størrelse skal matche.',
            'DBMS’et tjekker automatisk reglerne ved **CUD**-operationer; læsning ændrer intet og er uproblematisk. Ændringer i *barnet* (den der peger) bryder ikke reglen. Problemet opstår, når *forælderen* slettes eller dens nøgle ændres.',
          ],
        },
        {
          term: 'Referentielle handlinger',
          body: [
            '`NO ACTION` (standard) afviser ændringen, og du får fejlen “The DELETE statement conflicted with the REFERENCE constraint”. `CASCADE` sletter eller opdaterer børnene med. `SET NULL` sætter fremmednøglen til `NULL`. `SET DEFAULT` sætter den til kolonnens standardværdi.',
          ],
        },
      ],
      viz: 'keys-integrity',
      keyPoints: [
        'Supernøgle ⊇ kandidatnøgle (minimal) ⊇ primærnøgle (den valgte). Resten er alternative nøgler.',
        'PK: unik, aldrig NULL, sat ved INSERT.',
        'FK peger på en PK; type og størrelse skal matche.',
        'Integritet tjekkes ved Create, Update, Delete — ikke ved Read.',
        'Sletning i forælderen: NO ACTION (afvis), CASCADE, SET NULL eller SET DEFAULT.',
      ],
      code: [
        {
          lang: 'sql',
          title: 'Sammensat PK og FK med kaskadeopdatering',
          source: 'SW2BAD - DDL #2.pdf s. 2, 7',
          code: `CREATE TABLE Movies (
  title NVARCHAR(100),
  year INT,
  genre NVARCHAR(20),
  length INT,
  CONSTRAINT PK_Movies PRIMARY KEY (title, year)
);

CREATE TABLE StarsIn (
  MovieTitle NVARCHAR(100),
  MovieYear INT,
  StarName NVARCHAR(100) FOREIGN KEY REFERENCES MovieStar (NAME) ON UPDATE CASCADE
);`,
        },
      ],
      exam: [
        'En supernøgle udpeger en række entydigt; en kandidatnøgle er en minimal supernøgle; primærnøglen er den kandidatnøgle, vi vælger. Den må aldrig være NULL.',
        'Referentiel integritet betyder at hver fremmednøgle peger på en række der findes. DBMS’et håndhæver det ved create, update og delete.',
        'Når forælderen slettes, bestemmer den referentielle handling hvad der sker: afvis, kaskadér, sæt NULL eller sæt standardværdi.',
      ],
      sources: [
        { path: ctx('02-databaser-intro/relational-model.md'), original: 'SW4BAD - Relational Model.pdf', pages: 's. 8–22' },
        { path: ctx('03-sql/functional-dependency.md'), original: 'Au-ECEI4DAB-FunctionalDependency.pptx', pages: 'slide 2–6' },
        { path: ctx('03-sql/ddl.md'), original: 'SW2BAD - DDL #2.pdf', pages: 's. 2–7' },
        { path: ctx('05-ef-core/key-concepts.md'), original: 'KeyConcepts.png', note: 'Diagram over nøglebegreberne' },
      ],
      keywords: ['primary key', 'primærnøgle', 'foreign key', 'fremmednøgle', 'superkey', 'supernøgle', 'candidate key', 'kandidatnøgle', 'surrogate', 'surrogatnøgle', 'CASCADE', 'SET NULL', 'NO ACTION', 'tuple', 'skema'],
    },

    {
      slug: 'relational-mapping',
      title: 'Fra ER-model til tabeller',
      short: 'ER til tabeller',
      week: 'Uge 2',
      definition:
        '**Relational mapping** omsætter den færdige ER-model til SQL-tabeller: hver entitet bliver en tabel, og hver N:N-, rekursiv N:N- og ternær relation bliver en **junction-tabel**.',
      concepts: [
        {
          term: 'Tre slags tabeller',
          body: [
            'Resultatet er (1) tabeller med samme indhold som entiteten, (2) tabeller hvor forælderens nøgle er indlejret som fremmednøgle — ved 1:N og 1:1 — og (3) junction-tabeller afledt af en relation, med fremmednøglerne fra alle deltagende entiteter.',
          ],
        },
        {
          term: '1:1',
          body: [
            'Begge obligatoriske: barnet får en fremmednøgle, der er `not null unique` (Report — Abbreviation). Én valgfri: den *obligatoriske* side bærer nøglen som `not null unique` (Department bærer `mgr_id`). Begge valgfri: fremmednøglen er nullable og `on delete set null` (Engineer — Desktop).',
          ],
        },
        {
          term: '1:N',
          body: [
            'N-siden bærer fremmednøglen til 1-siden. Er relationen obligatorisk for N-siden, er fremmednøglen `not null`; er den valgfri, er den nullable (`on delete set null`). Eksempel: `employee.dept_no not null` vs. `report.dept_no` nullable.',
          ],
        },
        {
          term: 'N:N og rekursive relationer',
          body: [
            'En N:N-relation bliver en junction-tabel, hvis primærnøgle er kombinationen af de to fremmednøgler — det svarer til to 1:N-relationer (`belongs_to(emp_id, assoc_name)`). Rekursiv 1:1 og 1:N bliver en selvrefererende fremmednøgle (`spouse_id`, `leader_id`); rekursiv N:N bliver en junction med to fremmednøgler til samme tabel (`coauthor`).',
          ],
        },
        {
          term: 'Ternære relationer',
          body: [
            'Bliver altid en junction-tabel med alle tre fremmednøgler. Primærnøglen består af nøglerne fra **“mange”-siderne**, som FD’erne bestemmer. Kombinationer der skal være unikke for “1”-siderne får `unique`-constraints. Ved N:N:N er alle tre nøgler primærnøglen.',
          ],
        },
        {
          term: 'Generalisering',
          body: [
            'Tre muligheder: (1) en tabel for supertypen med de fælles attributter og en tabel pr. subtype med supertypens nøgle som FK, (2) én tabel pr. subtype hvor de fælles attributter skubbes ned, eller (3) én tabel med alle attributter og NULL, hvor en subtype ikke har attributten. Det gælder både disjoint og overlapping.',
          ],
        },
      ],
      viz: 'er-mapping',
      keyPoints: [
        'Entitet → tabel.',
        '1:N → FK på N-siden. `not null` hvis obligatorisk, nullable hvis valgfri.',
        '1:1 → FK med `unique` på den obligatoriske side (eller nullable hvis begge er valgfri).',
        'N:N → junction-tabel; PK = de to FK’er.',
        'Ternær → junction-tabel; PK = “mange”-sidernes nøgler, `unique` for “1”-siderne.',
        'Generalisering: supertype + subtyper, kun subtyper, eller én samlet tabel.',
      ],
      code: [
        {
          lang: 'sql',
          title: 'N:N → junction-tabel (Engineer — Prof-assoc)',
          source: 'SW4BAD - Relational Mapping.pdf s. 6',
          code: `create table engineer
    (emp_id char(10),
     primary key (emp_id));
create table prof_assoc
    (assoc_name varchar(256),
     primary key (assoc_name));
create table belongs_to
    (emp_id char(10),
     assoc_name varchar(256),
     primary key (emp_id, assoc_name),
     foreign key (emp_id) references engineer
         on delete cascade on update cascade,
     foreign key (assoc_name) references prof_assoc
         on delete cascade on update cascade);`,
        },
        {
          lang: 'sql',
          title: '1:N, obligatorisk → not null FK på N-siden',
          source: 'SW4BAD - Relational Mapping.pdf s. 5',
          code: `create table department
    (dept_no integer,
     dept_name char(20),
     primary key (dept_no));
create table employee
    (emp_id char(10),
     emp_name char(20),
     dept_no integer not null,
     primary key (emp_id),
     foreign key (dept_no) references department
         on delete set default on update cascade);`,
        },
      ],
      exam: [
        'Hver entitet bliver en tabel. Ved én-til-mange lægger jeg fremmednøglen på mange-siden, og den er not null, hvis relationen er obligatorisk.',
        'Mange-til-mange kan ikke udtrykkes med én fremmednøgle, så den bliver en junction-tabel, hvor primærnøglen er de to fremmednøgler tilsammen.',
        'En ternær relation bliver også en junction-tabel; primærnøglen er nøglerne fra mange-siderne, og én-siderne får unique-constraints.',
      ],
      sources: [
        { path: ctx('02-databaser-intro/relational-mapping.md'), original: 'SW4BAD - Relational Mapping.pdf', pages: 's. 2–11' },
      ],
      gaps: [
        'Slides viser mapping-kataloget som øvelser. Hvilken referentiel handling (`cascade`, `set null`, `set default`) der vælges i hvert eksempel, begrundes ikke — det følger DMaD-bogen.',
      ],
      keywords: ['mapping', 'junction table', 'junction-tabel', 'join table', 'many-to-many', 'mange-til-mange', 'one-to-many', 'ternary', 'generalization'],
    },

    {
      slug: 'sql',
      title: 'SQL: DDL og DML',
      short: 'SQL: DDL og DML',
      week: 'Uge 2–3',
      definition:
        'SQL er sproget til relationelle databaser. **DDL** erklærer strukturen (`CREATE`, `ALTER`, `DROP`, constraints); **DML** læser og ændrer data (`SELECT`, `INSERT`, `UPDATE`, `DELETE`). SQL Server’s dialekt hedder T-SQL.',
      concepts: [
        {
          term: 'DBMS og klient',
          body: [
            'Et DBMS (database server, database engine) er en applikation, der administrerer data: i stedet for at læse og skrive filer tilbyder det standardiserede CRUD-operationer, netværksadgang og mange samtidige forbindelser. Man forbinder via klient-server — i kurset med Azure Data Studio eller `sqlcmd`.',
          ],
        },
        {
          term: 'DDL og constraints',
          body: [
            '`CREATE DATABASE`/`TABLE` opretter, `DROP` fjerner, `ALTER TABLE … ADD`/`DROP COLUMN` ændrer skemaet. Husk `USE streamDB;` — ellers havner tabellen let i `master`.',
            'Constraints: `PRIMARY KEY` og `FOREIGN KEY` (inline eller navngivet med `CONSTRAINT`), `CHECK` (på kolonnen eller på tværs af kolonner), `DEFAULT` og `NOT NULL`. `IDENTITY(1,1)` genererer en unik værdi ved hver indsættelse.',
          ],
        },
        {
          term: 'DML',
          body: [
            '`INSERT` kan angive alle værdier i kolonnerækkefølge eller udvalgte kolonner; resten bliver `NULL` eller default. `UPDATE` og `DELETE` bruger `WHERE` til at vælge rækker — **uden `WHERE` rammer de alle rækker**.',
            'Typiske fejl: “conflicted with the FOREIGN KEY constraint” (du har glemt at indsætte i den refererede tabel først) og “Violation of PRIMARY KEY constraint” (dublet i nøglen).',
          ],
        },
        {
          term: 'Forespørgsler',
          body: [
            '`ORDER BY` (standard `ASC`), `DISTINCT`, `BETWEEN`, `IN (…)`, `LIKE \'A Star %\'` og indlejrede forespørgsler: `WHERE Name IN (SELECT StarName FROM StarsIn WHERE MovieYear = 2022)`.',
            'Aggregater (`MIN`, `MAX`, `COUNT`, `AVG`, `SUM`) beregner én værdi over rækker. `GROUP BY` samler rækker med samme værdi til én sumrække pr. gruppe — “find salget for hver …”.',
          ],
        },
        {
          term: 'Stored procedures',
          body: [
            'En stored procedure er forudkompilerede SQL-sætninger, der ligger i databasen. Den passer til komplekse forespørgsler og logik, der skal ligge på databasesiden, og kan både returnere rækker og udføre ændringer. Dapper kan kalde dem direkte, og fra EF Core bruges `FromSqlRaw("EXEC …")` eller `ExecuteSqlRaw`.',
            'Skal en procedure have mange rækker ind på én gang, bruges et **Table Valued Parameter**: en tabeltype (`CREATE TYPE … AS TABLE`) som `READONLY`-parameter. EF understøtter det ikke direkte, så det kaldes med rå SQL — se [[ef-core|EF Core]].',
          ],
        },
        {
          term: 'Joins',
          body: [
            '`CROSS JOIN` giver alle kombinationer: 5 toys × 4 boys = 20 rækker. Undgå det på store tabeller. `INNER JOIN … ON` returnerer kun de kombinationer, hvor betingelsen matcher, typisk fremmednøgle = primærnøgle. Aliaser (`AS t`) forkorter tabelnavne.',
          ],
        },
      ],
      viz: 'sql-join-group',
      keyPoints: [
        'DDL = struktur, DML = data.',
        '`UPDATE`/`DELETE` uden `WHERE` rammer alle rækker.',
        'Indsæt i forælderen før barnet, ellers fejler FK-constrainten.',
        'INNER JOIN matcher rækker på en betingelse; CROSS JOIN giver alle kombinationer.',
        'GROUP BY + aggregat = én række pr. gruppe.',
      ],
      code: [
        {
          lang: 'sql',
          title: 'Constraints: CHECK, DEFAULT og IDENTITY',
          source: 'SW2BAD - DDL #2.pdf s. 8–9',
          code: `CREATE TABLE MovieStar (
  name NVARCHAR(100),
  address NVARCHAR(200) DEFAULT 'TBA',
  gender CHAR,
  birthdate DATE DEFAULT GETDATE()
);

CREATE TABLE Goods (
  GoodID INT IDENTITY(1,1),
  Name VARCHAR(128),
  CONSTRAINT PK_Goods PRIMARY KEY (GoodID)
);`,
        },
        {
          lang: 'sql',
          title: 'Join, aggregat og gruppering',
          source: 'SW4BAD - DML .pdf s. 14, 18',
          code: `SELECT mc.last_name, mc.first_name, p.profession
FROM my_contacts AS mc
INNER JOIN profession AS p
ON mc.prof_id = p.prof_id;

SELECT first_name, SUM(sales)
FROM cookie_sales
GROUP BY first_name
ORDER BY SUM(sales);`,
        },
      ],
      exam: [
        'DDL definerer strukturen — tabeller, nøgler og constraints — mens DML arbejder på data med SELECT, INSERT, UPDATE og DELETE.',
        'En INNER JOIN kombinerer rækker fra to tabeller, hvor join-betingelsen passer, typisk fremmednøgle mod primærnøgle.',
        'GROUP BY samler rækker med samme værdi, så en aggregatfunktion som SUM giver én værdi pr. gruppe.',
      ],
      sources: [
        { path: ctx('02-databaser-intro/intro-til-databaser.md'), original: 'SW4BAD - Intro To Databases.pdf' },
        { path: ctx('02-databaser-intro/relational-model.md'), original: 'SW4BAD - Relational Model.pdf', pages: 's. 26–28' },
        { path: ctx('03-sql/ddl.md'), original: 'SW2BAD - DDL #2.pdf', pages: 's. 2–9' },
        { path: ctx('03-sql/dml.md'), original: 'SW4BAD - DML .pdf', pages: 's. 2–19' },
        { path: ctx('05-ef-core/ef-core-advanced.md'), original: 'EF Core Advanced.pdf', pages: 's. 15–16', note: 'Stored procedures og Table Valued Parameters' },
        { path: ctx('04-webapi-rest/dbup-og-dapper.md'), original: 'DbUp & Dapper.pdf', pages: 's. 16, 29' },
      ],
      gaps: [
        'Lektionsplanen har “Stored procedures + indexing” i uge 3, men der ligger ingen slides fra den lektion. Stored procedures er dækket ovenfor ud fra EF Core- og Dapper-slides. **Indekser** nævnes kun som et trin i fysisk design (“select indexes”) i databasens livscyklus — hvordan de oprettes og virker, står ikke i materialet.',
        'DML-slide 14 viser resultatet af `ORDER BY SUM(sales)` sorteret faldende (Britney 107.91 øverst), selvom forespørgslen ikke har `DESC`. `ORDER BY` er stigende som standard (samme slidesæt, s. 10), så skærmbilledet passer ikke til forespørgslen.',
      ],
      keywords: ['stored procedure', 'EXEC', 'Table Valued Parameter', 'TVP', 'DDL', 'DML', 'SELECT', 'INSERT', 'UPDATE', 'DELETE', 'JOIN', 'INNER JOIN', 'CROSS JOIN', 'GROUP BY', 'ORDER BY', 'aggregate', 'T-SQL', 'IDENTITY', 'CHECK', 'DEFAULT', 'DBMS', 'CRUD'],
    },

    {
      slug: 'normalisering',
      title: 'Funktionelle afhængigheder og normalisering',
      short: 'Normalisering',
      week: 'Uge 3',
      definition:
        'Normalisering er et tjek af det logiske design: man undersøger med **funktionelle afhængigheder**, om tabellerne opfylder 1NF, 2NF, 3NF, BCNF og 4NF — og splitter dem, hvis ikke. Målet er at undgå redundans og sikre konsistens.',
      concepts: [
        {
          term: 'Funktionel afhængighed',
          body: [
            '`X → Y`: to rækker med samme værdi af X skal have samme værdi af Y. X er **determinanten**, Y den afhængige. Klassisk: postnr → by. Tænk på det som en matematisk funktion mellem kolonner. FD’er kræver kendskab til domænets regler — ikke kun til de data, der tilfældigvis står i tabellen.',
            'En **partiel** afhængighed går fra en del af en sammensat nøgle. En **transitiv** afhængighed er `A → B` og `B → C`, så `A → C` indirekte.',
          ],
        },
        {
          term: 'Anomalier',
          body: [
            'Den unormaliserede tabel gentager data og giver tre slags fejl. **Indsættelse:** skal Jensen på projekt 3, skal navn og afdeling gentages. **Opdatering:** skal “Hovedkvarter” omdøbes, skal det ske tre steder — misses ét, er Hansen ansat i to afdelinger. **Sletning:** sletter vi Jensen, forsvinder oplysningen om forskningsafdelingen.',
          ],
        },
        {
          term: '1NF',
          body: [
            'Der er en primærnøgle, hver celle har præcis én (atomar) værdi, og der er ingen gentagne grupper (“en tabel i tabellen”). Rækkefølgen af rækker må ikke bære information, og en kolonne må ikke blande typer. Gentagne grupper flyttes ud i en ny tabel med en kopi af primærnøglen.',
          ],
        },
        {
          term: '2NF',
          body: [
            '1NF, og alle ikke-nøgle-felter afhænger af **hele** primærnøglen — ingen partielle afhængigheder. I `Projekt(Mnr, Pnr, Pnavn, TimerPrUge)` afhænger `Pnavn` kun af `Pnr`, så `Pnr, Pnavn` flyttes ud.',
          ],
        },
        {
          term: '3NF',
          body: [
            '2NF og ingen **transitive** afhængigheder af primærnøglen. Formelt: for hver ikke-triviel FD `X → A` er X en supernøgle, *eller* A er del af en kandidatnøgle. I `Medarbejder(Mnr, Navn, Afdnr, Afdnavn)` gælder `Mnr → Afdnr → Afdnavn`, så `Afdnr, Afdnavn` flyttes til en `Afdeling`-tabel, og `Afdnr` bliver fremmednøgle.',
          ],
        },
        {
          term: 'BCNF og 4NF',
          body: [
            '**BCNF:** hver determinant er en kandidatnøgle — for hver FD `X → A` er X en supernøgle. Det fjerner 3NF’s undtagelse “A er del af en kandidatnøgle”. `ClientInterview` er i 3NF men ikke BCNF, fordi `staffNo, interviewDate → roomNo` har en determinant, der ikke er en supernøgle.',
            '**4NF:** ingen flerværdiede afhængigheder (`A →→ B`: A bestemmer et *sæt* af B-værdier, fx Amt →→ Kommune). Om en MVD gælder, afgør domænet. Er en database vist at være i 4NF, er 1NF–3NF og BCNF pr. definition overholdt.',
          ],
        },
      ],
      viz: 'normalization',
      keyPoints: [
        'Redundans giver indsættelses-, opdaterings- og sletteanomalier.',
        '1NF: PK, atomare værdier, ingen gentagne grupper.',
        '2NF: ingen partielle afhængigheder af en sammensat PK.',
        '3NF: ingen transitive afhængigheder.',
        'BCNF: alle determinanter er kandidatnøgler. 4NF: ingen MVD’er — domænet bestemmer.',
        'Jo højere normalform, desto mindre sårbar er tabellen over for anomalier. Fysisk design kan bevidst denormalisere.',
      ],
      exam: [
        'Normalisering er et tjek af designet med funktionelle afhængigheder. Målet er at fjerne redundans, så vi undgår indsættelses-, opdaterings- og sletteanomalier.',
        '2NF fjerner partielle afhængigheder af en sammensat nøgle; 3NF fjerner transitive afhængigheder. I begge tilfælde flytter jeg de afhængige felter ud i en ny tabel sammen med deres determinant, som så bliver fremmednøgle.',
        'BCNF er strengere end 3NF: hver determinant skal være en kandidatnøgle.',
        'Har jeg modelleret ER-modellen ordentligt, er tabellerne typisk allerede næsten normaliserede — normaliseringen er kontrollen.',
      ],
      sources: [
        { path: ctx('03-sql/normalisering-intro.md'), original: 'AU-ECE-I4DAB-NormaliseringIntro.pptx', pages: 'slide 3–29' },
        { path: ctx('03-sql/normalization.md'), original: 'Normalization.pdf', pages: 's. 2–17' },
        { path: ctx('03-sql/functional-dependency.md'), original: 'Au-ECEI4DAB-FunctionalDependency.pptx', pages: 'slide 7–8' },
        { path: ctx('03-sql/multi-valued-dependency.md'), original: 'Multi valued dpendency.html' },
      ],
      keywords: ['1NF', '2NF', '3NF', 'BCNF', '4NF', 'normal form', 'normalform', 'functional dependency', 'FD', 'MVD', 'anomaly', 'anomali', 'partial dependency', 'transitive', 'determinant', 'redundans'],
    },

    {
      slug: 'transaktioner',
      title: 'Transaktioner og ACID',
      short: 'Transaktioner',
      week: 'Uge 3',
      definition:
        'En **transaktion** er flere operationer udført som én enhed: enten gennemføres alle (`COMMIT`), eller ingen (`ROLLBACK`). ACID beskriver de garantier, vi vil have.',
      concepts: [
        {
          term: 'Problemet',
          body: [
            'Overfør 100 kr. fra konto A til B: læs A (1000), skriv A (900), læs B (300), skriv B (400). Afbrydes processen midtvejs, forsvinder penge eller opstår ud af det blå.',
          ],
        },
        {
          term: 'ACID',
          body: [
            '**Atomicity**: alle operationer eller ingen. **Consistency**: en transaktion udført alene bevarer databasens konsistens. **Isolation**: selvom transaktioner kører samtidigt, ser det for Ti ud som om Tj enten var færdig før, eller startede efter. **Durability**: når transaktionen er gennemført, overlever ændringerne selv systemfejl.',
          ],
        },
        {
          term: 'Hvordan egenskaberne opnås',
          body: [
            'Durability kræver **stabil lagring** — teoretisk umulig, i praksis flere kopier på ikke-flygtig lagring. Atomicity opnås med **logging**: DBMS’et logger operationerne, så de kan rulles tilbage.',
            'Isolation er triviel hvis transaktioner kører serielt, men vi vil have samtidighed. Et flettet skema er korrekt, hvis det er **serialiserbart** — ækvivalent med en seriel kørsel.',
          ],
        },
        {
          term: 'Et ikke-serialiserbart skema',
          body: [
            'T1 overfører 50 fra A til B; T2 overfører 10 % af A til B. Hvis T2 læser A, efter at T1 har beregnet den nye værdi men *før* T1 har skrevet den, bliver T2’s `write(A)` overskrevet af T1’s. Opdateringen går tabt, og A + B er ikke længere bevaret. Samtidighedskontrol skal forhindre sådanne skemaer.',
          ],
        },
        {
          term: 'I SQL og i EF Core',
          body: [
            '`BEGIN TRANSACTION` … `COMMIT` eller `ROLLBACK`. Uden eksplicit transaktion kører SQL Server i **autocommit**: hver sætning er sin egen transaktion. I EF Core: `context.Database.BeginTransaction()`, `transaction.Commit()`, `transaction.Rollback()`. Mongo har sin egen historie — se [[mongodb|MongoDB]].',
          ],
        },
      ],
      viz: 'transactions',
      keyPoints: [
        'Atomicity, Consistency, Isolation, Durability.',
        'Atomicity via logging; durability via (tilnærmet) stabil lagring.',
        'Et flettet skema er korrekt, hvis det er serialiserbart.',
        'Tabt opdatering: en transaktion læser en værdi, en anden skriver ovenpå.',
        'Autocommit: hver sætning uden for en eksplicit transaktion er atomar for sig.',
      ],
      code: [
        {
          lang: 'sql',
          title: 'Overførsel som én transaktion',
          source: 'SW2BAD - Transactions.pdf s. 9',
          code: `BEGIN TRANSACTION
  UPDATE Account SET balance = balance + 100
  WHERE accNo = 1
  UPDATE Account SET balance = balance - 100
  WHERE accNo = 2
IF (something went wrong)
  ROLLBACK
ELSE
  COMMIT`,
        },
        {
          lang: 'csharp',
          title: 'Samme idé i EF Core',
          source: 'EF Core Advanced.pdf s. 13',
          code: `using (var transaction = context.Database.BeginTransaction())
{
    try
    {
        // Perform database operations
        context.SaveChanges();
        transaction.Commit();
    }
    catch
    {
        transaction.Rollback();
    }
}`,
        },
      ],
      exam: [
        'En transaktion samler flere operationer til én enhed, så de enten alle gennemføres eller alle rulles tilbage. Bankoverførslen er eksemplet: uden transaktion kan pengene forsvinde midtvejs.',
        'ACID står for atomicity, consistency, isolation og durability. Atomicity opnås med logging, durability med stabil lagring.',
        'Samtidige transaktioner er korrekte, hvis skemaet er serialiserbart. Ellers kan en opdatering gå tabt, fordi en transaktion skriver oven i en værdi, som en anden allerede har læst.',
      ],
      sources: [
        { path: ctx('03-sql/transactions.md'), original: 'SW2BAD - Transactions.pdf', pages: 's. 2–16' },
        { path: ctx('05-ef-core/ef-core-advanced.md'), original: 'EF Core Advanced.pdf', pages: 's. 13' },
      ],
      gaps: [
        'Materialet nævner ikke isolationsniveauer (fx READ COMMITTED) eller låsning — kun serialiserbarhed som begreb.',
      ],
      keywords: ['transaction', 'ACID', 'atomicity', 'isolation', 'durability', 'consistency', 'commit', 'rollback', 'serializable', 'serialiserbar', 'schedule', 'lost update', 'autocommit'],
    },
  ],
}
