import type { Part } from '../types'
import { k } from './paths'

export const implementering: Part = {
  id: 'implementering',
  title: 'Implementering og test',
  topics: [
    {
      slug: 'design-til-kode',
      title: 'Fra applikationsmodel til kode: minuturet',
      short: 'Design til kode',
      week: 'Hver iteration',
      definition:
        'Applikationsmodellen omsættes til kode ved at lade hver klasse blive en klasse (eller et C-modul), hver tilstand en `enum`-værdi og hver hændelse en public operation med en `switch` på tilstanden. Minuturet viser det på fire platforme: C, C++ med polling, C++ med interrupts og C#/WPF. **Controlleren `Ur` og dens tilstandsmaskine er den samme hver gang**; kun boundary-klasserne og “hovedprogrammet” tilpasses platformen.',
      intro: [
        'Kursets eneste gennemarbejdede eksempel på vejen fra model til kode er et digitalt minutur med tre knapper (Start, Stop, Reset) og et display i formatet `mm:ss`. Udgangspunktet er applikationsmodellen fra [[applikationsmodel|applikationsmodellen]]: klassediagram med `«boundary»` (`KnapPanel`, `Display`, `Timer`) og `«controller»` (`Ur`), et tilstandsdiagram for `Ur` og et sekvensdiagram. Se [[state-machine|state machine]] og [[sekvensdiagram|sekvensdiagram]] for notationen.',
      ],
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'Når en use case er analyseret til en applikationsmodel i den aktuelle iteration. Modellen skal være “omhyggeligt udarbejdet” før man koder, og den omformes i et mellemtrin, hvis platformen kræver det (L22-siden på Brightspace).',
            'I en iterativ proces sker det én gang pr. iteration og pr. use case — ikke én gang for hele systemet. Se [[ece-model|ECE-modellen]] og [[udviklingsprocesser|udviklingsprocesser]].',
          ],
        },
        {
          term: 'Tilstandsmaskinen bliver en switch',
          body: [
            'Tilstandene `Stoppet` og `Startet` bliver `enum Tilstand { STARTET, STOPPET}` og et felt `tilstand`. Hver hændelse i STM’en (`start`, `stop`, `reset`, `timeout`) bliver en public operation på `Ur`. Inde i operationen står en `switch (tilstand)` med én `case` pr. tilstand.',
            'En transition bliver til koden i sin `case`: `start / timerObj.start()` fra `Stoppet` er `case STOPPET: timerObjPtr->start(); tilstand = STARTET; break;`. Actions bliver kald, og måltilstanden bliver en tildeling. Findes der ingen transition for hændelsen i en tilstand, er `case`’n tom (`case STARTET: break;`) — hændelsen ignoreres. Initialtransitionen `/ nulstil()` bliver constructoren.',
            'Private hjælpeoperationer fra klassediagrammet (`nulstil()`, `taelOp()`) er private, fordi de kun kaldes via tilstandsmaskinen (UML-Light s. 29). SWD viser alternativerne, tabelbaseret og GoF State, og hvorfor switch bliver uoverskuelig i store maskiner: [[swd/state|State-pattern]].',
          ],
        },
        {
          term: 'Associationer bliver pointere eller includes',
          body: [
            'I C++ er `Ur → Timer` og `Ur → Display` pointere, der gives i constructoren: `Ur(Timer *timerPtr, Display * displayPt)`. `main()` opretter de fire objekter og kobler dem: `Ur ur(&timerObj, &display);`.',
            'I C med højst ét objekt pr. klasse er hver klasse et modul (`.c`/`.h`). Private attributter og operationer er `static` i `.c`-filen, og associationerne er *implicitte*: et modul inkluderer kun headerne for de klasser, det har associationer til. Skal der være flere objekter af en klasse, bliver den en `typedef struct`, og hver operation får en `this`-pointer som første parameter (UML-Light §5.4.1–5.4.2).',
          ],
        },
        {
          term: 'Omformningen: hvem leverer hændelserne?',
          body: [
            'I applikationsmodellen er `KnapPanel` og `Timer` aktive: de sender selv `start()` og `timeout()` til `Ur`. En Arduino uden interrupts har kun én tråd, så modellen omformes: en ny klasse `Hovedprogram` ejer de fire objekter og kører `loop [forever]`, `KnapPanel` får `checkForTast()`/`checkTast(tast)`, `Timer` får `checkForTimeout() : bool`, og associationerne `KnapPanel → Ur` og `Timer → Ur` fjernes.',
            'Med interrupts beholdes retningen `Timer → Ur`: `ISR(TIMER1_OVF_vect)` kalder `globalUrObj.timeout()`, og kun knapperne polles. Objekterne skal derfor være globale, så ISR’en kan nå dem. I WPF kommer hændelserne som `Click`-events og `DispatcherTimer.Tick` — ingen polling, og `loop [until stopped]` giver igen mening. Interrupts undervises i SW3SYS (sys).',
          ],
        },
        {
          term: 'Boundary-klasserne absorberer platformen',
          body: [
            'På Arduino skriver `Display::vis()` til `PORTB` (8 LED’er, `pattern = (min << 6) + sek`), og `Timer` sætter AVR Timer 1 op til overflow efter 1 s. I WPF wrapper `DisplayBoundary` en `TextBox` (`Text = "mm:ss"`), og `TimerBoundary` wrapper en `DispatcherTimer`. `Ur` kender aldrig WPF eller registre.',
            'Mapperne `Boundary/` og `Control/` i WPF-løsningen afspejler stereotyperne direkte. Klassediagrammet i `ImplementationFinalGUI.pdf` tegner framework-klasserne (`TextBox`, `DispatchTimer`) ind for at vise, at boundary-klasserne står *mellem* controlleren og frameworket.',
          ],
        },
        {
          term: 'Hvad censor kigger efter',
          body: [
            'Læringsmålet er at “anvende objektorienteret analyse og design i systemudvikling”. Det skal kunne ses, at koden kommer fra modellen: samme klassenavne, samme operationer, og en tilstandsmaskine der kan læses ud af koden. UML-Light siger det direkte: “Prøv at sammenligne koden med klassediagrammet og se den fine sammenhæng mellem design og kode.”',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'Afvigelser mellem model og kode uden at modellen opdateres. Materialet har selv eksempler: klassediagrammet staver `checkTest`, sekvensdiagrammet og koden `checkTast`; C-versionen har kun én tæller `tid` i stedet for `minutter`/`sekunder`; WPF-koden kalder ikke `timer.start()` ved hvert timeout, selvom STM’en gør det. Den slags skal kunne forklares, ikke opdages af censor.',
            'Et sekvensdiagram, der kun viser happy path. `ImplementationIntermediate.pdf` viser ikke, hvad der sker, når `checkTast()` returnerer `false`; `ImplementationFinal.pdf` retter det med `opt` og `alt`.',
          ],
        },
      ],
      viz: 'stm-til-kode',
      keyPoints: [
        'Tilstand → `enum`-værdi. Hændelse → public operation. Transition → kode i den `case`, der svarer til kildetilstanden.',
        'Ingen transition for en hændelse i en tilstand → tom `case` (hændelsen ignoreres). Det er `Ur`’s ansvar, ikke hovedprogrammets.',
        'Initialtransitionens action (`nulstil()`) kaldes fra constructoren / `urInit()`.',
        'Polling: `Hovedprogram` poller `checkForTast()` og `checkForTimeout()` og kalder `Ur`. Interrupt: ISR’en kalder `timeout()` direkte. WPF: `Click` og `Tick`.',
        '`Ur` er uændret på alle platforme. Boundary-klasserne og hovedprogrammet skifter.',
        'C uden klasser: modul pr. klasse, `static` = privat, public funktioner hedder `<klasse><Operation>`.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Ur.cpp: to hændelser, én switch hver',
          source: 'MinutUrCpp.zip, Ur.cpp (L22-løsningsforslag); indrykning normaliseret',
          code: `void Ur::start()
{
    switch (tilstand)
    {
        case STOPPET:
        timerObjPtr->start();
        tilstand = STARTET;
        break;

        case STARTET:
        break;
    }
}

void Ur::timeout()
{
    switch (tilstand)
    {
        case STOPPET:
        break;

        case STARTET:
        timerObjPtr->start();
        taelOp();
        displayObjPtr->vis(minutter, sekunder);
        break;
    }
}`,
        },
        {
          lang: 'cpp',
          title: 'main.cpp: Hovedprogram poller og videresender hændelser',
          source: 'MinutUrCpp.zip, main.cpp (svarer til sekvensdiagrammet i ImplementationFinal.pdf s. 3)',
          code: `int main(void)
{
    Display display;
    Timer timerObj;
    KnapPanel knapper;

    Ur ur(&timerObj, &display);

    while (1)
    {
        if (knapper.checkForTast())
        {
            if (knapper.checkTast(START))
            {
                ur.start();
            }
            else if (knapper.checkTast(STOP))
            {
                ur.stop();
            }
            else if (knapper.checkTast(RESET))
            {
                ur.reset();
            }
        }

        if (timerObj.checkForTimeout())
        {
            ur.timeout();
        }
    }
}`,
        },
        {
          lang: 'cpp',
          title: 'Interrupt-versionen: timeout kommer fra ISR’en',
          source: 'MinutUrCppInt.zip, main.cpp (kun main.cpp og Timer.cpp er ændret)',
          code: `Timer globalTimerObj;

Display globalDisplayObj;

Ur globalUrObj(&globalTimerObj, &globalDisplayObj);

ISR (TIMER1_OVF_vect)
{
    globalUrObj.timeout();
}`,
        },
        {
          lang: 'c',
          title: 'Samme hændelse i C: modul med static tilstand',
          source: 'MinutUrC.zip, ur.c',
          code: `enum TILSTAND { STARTET, STOPPET };
static enum TILSTAND Tilstand;

static unsigned char tid;

void urStart()
{
    switch (Tilstand)
    {
    case STOPPET:
        Tilstand = STARTET;
        timerStart();
        break;

    case STARTET:
        break;
    }
}`,
        },
        {
          lang: 'csharp',
          title: 'WPF: MainWindow kobler objekterne, TimerBoundary leverer timeout',
          source: 'MinuturWPF-solution, MainWindow.xaml.cs og Boundary/TimerBoundary.cs (L23)',
          code: `public MainWindow()
{
    InitializeComponent();

    _display = new DisplayBoundary(Display);
    _timer = new TimerBoundary();

    _ur = new Ur(_timer, _display);
    _timer.MitUr = _ur;
}

private void Start_Click(object sender, RoutedEventArgs e)
{
    _ur.Start();
}

// TimerBoundary
private void HandleTimerTick(object sender, EventArgs e)
{
    MitUr.TimeOut();
}`,
        },
      ],
      exam: [
        '“Hvordan kommer I fra tilstandsdiagrammet til koden?” Hver tilstand er en værdi i en enum, hver hændelse en metode på controlleren, og i metoden switcher vi på tilstanden. En transition bliver koden i den case, der hører til kildetilstanden; en tom case betyder, at hændelsen ignoreres.',
        '“Hvorfor er der en klasse `Hovedprogram`, som ikke står i applikationsmodellen?” Fordi platformen ikke kan levere hændelserne selv. Uden interrupts må main polle knapper og timer og kalde controlleren; modellen omformes, men controlleren og dens STM er uændret.',
        '“Hvad ændrer sig, hvis I bruger interrupts eller en GUI?” Kun hvem der kalder `timeout()` og `start()`: en ISR eller en `Tick`-handler i stedet for main-løkken. Det er boundary-laget, der absorberer platformen.',
        '“Hvor i koden kan jeg se jeres klassediagram?” Klasserne har samme navne og operationer, associationerne er pointere givet i constructoren, og mapperne `Boundary/` og `Control/` følger stereotyperne.',
        'Afviger koden fra modellen, så sig det og begrund det — fx at en periodisk timer gør et genstart-kald i STM’en overflødigt.',
      ],
      sources: [
        { path: k('11-implementation/uml-light-ur.md'), original: 'UML-Light-Ur.pdf', pages: 's. 1–12 (bogsider 24–35)' },
        { path: k('11-implementation/applikationsmodel-minutur.md'), original: 'ApplicationModel.pdf', pages: 's. 1–3' },
        { path: k('11-implementation/implementation-minutur-arduino.md'), original: 'ImplementationIntermediate.pdf + ImplementationFinal.pdf', pages: 's. 1–3 + s. 1–3' },
        { path: k('11-implementation/implementation-minutur-gui-wpf.md'), original: 'ImplementationFinalGUI.pdf', pages: 's. 1–4' },
        { path: k('11-implementation/kode-minutur-c.md'), original: 'MinutUrC.zip', note: 'main.c, ur.c, timer.c + MSYS-driverne led/switch' },
        { path: k('11-implementation/kode-minutur-cpp.md'), original: 'MinutUrCpp.zip', note: 'main.cpp, Ur, Timer, KnapPanel, Display' },
        { path: k('11-implementation/kode-minutur-cpp-interrupt.md'), original: 'MinutUrCppInt.zip', note: 'main.cpp og Timer.cpp med ISR(TIMER1_OVF_vect)' },
        { path: k('11-implementation/kode-minutur-wpf.md'), original: 'MinuturWPF (Visual Studio-solution)', note: 'MainWindow, Boundary/, Control/' },
        { path: k('11-implementation/README.md'), note: 'Brightspace L22–L23: pointen om at controlleren er uændret' },
      ],
      gaps: [
        'Materialet viser kun switch-implementeringen af en STM med to tilstande. Hvordan man implementerer nested states, guards eller en STM med mange tilstande, står ikke i ISE-materialet; SWD dækker tabelbaseret og GoF State ([[swd/state|State-pattern]]).',
        'WPF-løsningen bruger code-behind (`Start_Click` i `MainWindow.xaml.cs`). MVVM og data binding, som FED underviser i ([[fed/mvvm|MVVM]], [[fed/data-binding|data binding]]), nævnes ikke, og hvordan `«boundary»`/`«controller»` mapper til View/ViewModel/Model, er ikke dækket.',
        'Materialet siger intet om, hvordan man implementerer applikationsmodellen for en webbackend, en database eller netværkskommunikation, selvom PRJ4-læringsmålene kræver “grafiske brugergrænseflader, databaser og netværkskommunikation”. Minuturet er eneste eksempel.',
        'Interrupts introduceres kun med et link til Wikipedia (L22-siden). At et objekt, der deles mellem ISR og hovedløkke, kan kræve `volatile` eller beskyttelse mod samtidig adgang, nævnes ikke — *uden for materialet*, se SW3SYS.',
        'Modellen og koden er inkonsistente flere steder (bevaret i konverteringen): `checkTest`/`checkTast`, `vis`/`visTid`, `timeout`/`TimeOut`, `DispatchTimer`/`DispatcherTimer`, og WPF’s `TimeOut()` genstarter ikke timeren, selvom STM’en siger `timerObj.start()`. UML-Light’s `Ur_timeout` med flere objekter bruger `Display_vis(minutter,sekunder)` uden `this->`.',
      ],
      keywords: ['minutur', 'MinutUr', 'Ur', 'switch', 'enum', 'tilstandsmaskine', 'STM', 'polling', 'interrupt', 'ISR', 'TIMER1_OVF_vect', 'Hovedprogram', 'boundary', 'controller', 'WPF', 'DispatcherTimer', 'Arduino', 'ATmega2560', 'UML-Light', 'implementation', 'code-behind'],
    },

    {
      slug: 'kvalitetssikring',
      title: 'Kvalitetssikring: review og konfigurationsstyring',
      short: 'Kvalitetssikring',
      week: 'Hele forløbet',
      definition:
        '**Quality Management** er aktiviteter, der sikrer, at kvaliteten er *planlagt, kontrolleret, sikret og forbedret*. Test **finder** fejl; **review** og **konfigurationsstyring** skal **forhindre**, at de bliver implementeret. Et review er et struktureret møde, hvor andre end forfatteren kritiserer et færdigt dokument; konfigurationsstyring holder styr på, hvilke revisioner af hvilke artefakter der hører til en version.',
      concepts: [
        {
          term: 'Hvornår i projektet',
          body: [
            'Reviews lægges i projektplanen fra starten og holdes typisk ved milepæle, fx når en fase afsluttes (SPU s. 217). Det præcise tidspunkt bestemmer forfatteren: et dokument sendes ikke til review, før det er færdigt. I PRJ4 reviewer grupperne hinandens kravspecifikation efter den første iteration — gruppe 2 reviewer gruppe 1, gruppe 3 gruppe 2 osv., med vejleder til stede hos den gruppe, der bliver reviewet.',
            'Peckol anbefaler design reviews undervejs: et indledende, et før den arkitektoniske fase, og mindst ét før prototypen, så fordelingen af funktioner på processorer og hardware er gennemtænkt (s. 406–407). Versionsstyring bruges fra første dag.',
          ],
        },
        {
          term: 'Reviewets faser',
          body: [
            'SPU har fem faser: **planlægning** (tidspunkt, deltagere, dokumentet klargøres, materiale findes, indkaldelse), **formøde** (formål, roller, overordnet gennemgang af produkt og dokument), **forberedelse** (reviewerne gennemgår hver for sig dokumentet — “reviewets vigtigste fase”), **reviewmøde** og **efterbehandling** (referat, rettelser, evt. nyt review).',
            'Slides har fire: planning, preparation, meeting, post-meeting. Formødet er foldet ind i *preparation*, hvor dokumentejerne fryser dokumentet, distribuerer det med dagsorden og fordeler roller. Brightspace-siden for lektionen lister SPU’s fem.',
            'Tommelfingerregler fra SPU: mødet varer **højst 2 timer**, dokumentet er typisk **20–30 sider**, der er normalt **to** reviewere (ikke over 3–4), og forberedelsen tager **3–6 minutter pr. side**.',
          ],
        },
        {
          term: 'Roller',
          body: [
            'SPU: **forfatteren**, **reviewerne**, **reviewlederen** (indkaldelse, kopiering, mødeledelse; helst uden for projektgruppen), **referenten** (noterer kritikpunkterne; normalt forfatteren selv) og **tilhørerne** (skal “holde mund”). **Ledelsen deltager ikke**: det er dokumentet, der reviewes, ikke forfatteren.',
            'Slides deler rollerne anderledes: dokumentejerne stiller med **review leader (chair)** og **review secretary**, der skriver og distribuerer Minutes of Meeting (MoM) og sørger for at action items bliver fulgt. Reviewerne kaldes “review opponents”.',
          ],
        },
        {
          term: 'Reviewerens regler',
          body: [
            'Slides (s. 11): vær forberedt, vær venlig og empatisk, opfør dig ordentligt, **peg på problemer, ikke løsninger**, undgå diskussioner om stil, hold dig til emnet. SPU har samme liste fra Freedman og tilføjer *giv også positiv kritik* — fortræffeligheder skal påpeges, så de ikke forsvinder ved rettelsen.',
            'Kommentarer forberedes i tre grupper: korrektur (afleveres skriftligt), afvigelser fra standarden (dokumentets form) og logiske fejl, mangler og fortræffeligheder (reviewernes egentlige opgave). “Jeg forstår ikke helt …” lander bedre end “Hvorfor …”.',
          ],
        },
        {
          term: 'Artefaktet: referat og rettet dokument',
          body: [
            'Resultatet er **referatet** (SPU) eller **MoM** (slides): alle kritikpunkter, også de positive, og en evt. konklusion, distribueret hurtigst muligt. Derefter retter forfatteren, og der besluttes om dokumentet frigives, eller der skal holdes nyt review.',
            'Varianter: uformelt review (inden for gruppen, løsningsforslag tilladt), korrekturlæsning, teknisk gennemgang (walk-through, *under* fremstillingen), kodegranskning (skrivebordstest af kildetekst) og Fagan-inspektion (endnu mere formel).',
          ],
        },
        {
          term: 'Konfigurationsstyring og baselines',
          body: [
            'Formålet er at fange **baselinen** for en version af produktet og sikre, at den kan genskabes fra bunden. En baseline er aftalt information, der fastlægger produktets attributter på et tidspunkt og er grundlaget for ændringer. Den angiver, hvilken **revision** af hver **configuration item** (CI: dokumenter, HW, SW, værktøjer) der hører til versionen, fx `SW rev. 1523`, `uC HW rev. A08`, `RS rev. 1.2`, `AT rev. 1.2`, `SDD rev. 1.5` for version 1.0.',
            '**Versioner defineres ved planlægning; baselines defineres, når en version er færdig (released).** Hver CI har sit eget revisionsnummer uafhængigt af produktets versionsnummer.',
            'Versionsstyring (Git, Subversion) giver historik, tilgængelighed og deling. Git-kommandoerne i slides er `clone`, `add`, `commit`, `push`, `pull`. PRJ4 lister Git med GitHub, GitLab AU eller Bitbucket. Dybden ligger i SWT: [[swt/git|Git]], [[swt/git-workflows|Git workflows og merge requests]], [[swt/merge-rebase|merge og rebase]] og [[swt/ci|Continuous Integration]].',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'Review af et halvfærdigt dokument — det giver højst irritation over fejl, forfatteren allerede kender. At udskyde et review, fordi der “ikke er tid”. At reviewere foreslår løsninger på mødet eller diskuterer stil. At bruge reviewet til at vise, at man er klogere end de andre (slide 6). At “bluffe sig igennem” uden forberedelse.',
          ],
        },
      ],
      viz: 'review-forloeb',
      keyPoints: [
        'Test finder fejl. Review og konfigurationsstyring forhindrer dem.',
        'SPU: planlægning → formøde → forberedelse → reviewmøde → efterbehandling. Slides: planning → preparation → meeting → post-meeting.',
        'Forberedelsen er den vigtigste fase. Mødet varer højst 2 timer; to reviewere er normalt nok.',
        'Påpeg, løs ikke. Ingen stildiskussion. Giv også positiv kritik. Ledelsen deltager ikke.',
        'Resultatet er et referat (MoM), rettelser og en beslutning: frigiv eller nyt review.',
        'Baseline = hvilke revisioner af hvilke CI’er der udgør en version. Versioner planlægges; baselines fastlægges ved release.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Dagsorden for reviewmødet',
          source: 'Quality Management.pdf slide 12',
          code: `1. Welcome, opening remarks (chair)
2. General remarks (opponents)
3. Detailed run-through of review item (opponents)
4. Conclusion (chair, secretary)
5. Actions to be taken - rework, corrections (all)
6. Closing remarks (all)`,
        },
        {
          lang: 'text',
          title: 'To baselines for samme produkt',
          source: 'Quality Management.pdf slide 19',
          code: `Ver. 1.0 Baseline      Ver. 1.1 Baseline
SW rev. 1523           SW rev. 1999
PC HW rev. 001         PC HW rev. 002
uC HW rev. A08         uC HW rev. A09
RS rev. 1.2            RS rev. 1.3
AT rev. 1.2            AT rev. 1.3.1
SDD rev. 1.5           SDD rev. 1.8`,
        },
      ],
      exam: [
        '“Hvordan har I sikret kvaliteten af kravspecifikationen?” Den blev reviewet af en anden gruppe, da den var færdig. Vi planlagde reviewet, reviewerne forberedte sig hver for sig, og referatet førte til konkrete rettelser — vis gerne et eksempel på et fund og rettelsen.',
        '“Hvad er forskellen på test og review?” Test finder fejl, der allerede er implementeret; review og konfigurationsstyring skal forhindre, at de kommer ind.',
        '“Hvad er en baseline?” Den liste af revisioner — kode, hardware, kravspecifikation, accepttest, design — der tilsammen udgør én version, så den kan genskabes. Versioner planlægges; baselinen fastlægges, når versionen er færdig.',
        '“Hvorfor må reviewerne ikke foreslå løsninger?” Fordi mødet er kort, og det er forfatterens opgave at løse problemet på sin egen måde. Reviewerens job er at påpege.',
        'Kan I pege på et tag eller en release i jeres repository, der svarer til den afleverede rapport? Det er en baseline i praksis.',
      ],
      sources: [
        { path: k('08-kvalitetssikring/quality-management.md'), original: 'Quality Management.pdf', pages: 'slide 3–27' },
        { path: k('bog/06-spu-vejledning-review.md'), original: 'SPU: Vejledning i review', pages: 's. 217–236' },
        { path: k('bog/03-peckol-ch10-hardware-test-debug.md'), original: 'Peckol, Embedded Systems Design, kap. 10', pages: 's. 406–407', note: 'Egoless design og design reviews' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 9, 11', note: 'Peer review af kravspecifikation mellem grupper; værktøjer til versionsstyring' },
        { path: k('08-kvalitetssikring/README.md'), note: 'Brightspace-siden: reviewets fem faser inkl. formøde' },
      ],
      gaps: [
        'Slides og SPU er uenige om fasernes antal (4 mod 5, formødet) og om rollerne: slides lader dokumentejerne stille med chair og secretary; SPU vil have reviewlederen uden for projektgruppen og lader forfatteren være referent.',
        'Ordet “reviewrapport” bruges ikke i materialet. SPU kalder resultatet *referat*, slides *Minutes of Meeting*. Der er ingen skabelon for referatet ud over SPU’s krav til indholdet (alle kritikpunkter, også positive, og en evt. konklusion).',
        'PRJ4-introduktionen beskriver kun rækkefølgen for peer review af kravspecifikationen, ikke hvilken reviewform (formel, uformel), og om reviewet ender med godkendelse.',
        'SPU henviser til en *Vejledning i Konfigurationsstyring* (fx formularen til problem-/ændringsrapporter), men den er ikke i materialet. Branching-strategier, merge requests og CI dækkes ikke i ISE; se SWT.',
        'Slide-sættet viser Subversion i detaljer, men Git kun som en kommandotabel. PRJ4 lister Git-værktøjer. Git-workflows er *uden for ISE-materialet* og findes i [[swt/git-workflows|SWT]].',
        'Statisk analyse og automatiske kodetjek nævnes ikke som del af kvalitetssikringen i ISE; SWT dækker det i [[swt/statisk-analyse|statisk analyse]].',
      ],
      keywords: ['quality management', 'QM', 'review', 'reviewmøde', 'formøde', 'referat', 'MoM', 'minutes of meeting', 'chair', 'secretary', 'reviewleder', 'referent', 'inspektion', 'walk-through', 'kodegranskning', 'configuration management', 'konfigurationsstyring', 'baseline', 'configuration item', 'CI', 'revision', 'versionsstyring', 'Git', 'Subversion', 'SVN', 'peer review'],
    },

    {
      slug: 'integration-systemtest',
      title: 'Integrationstest og systemtest i projektet',
      short: 'Integration og systemtest',
      week: 'Hver iteration og afslutning',
      definition:
        'Testarbejdet deles i niveauer, der hver tester mod sit eget referencedokument: **unit test** mod moduldesignet, **integrationstest** mod arkitekturen og grænsefladerne, **systemtest** mod systemdesignet og **accepttest** mod kravspecifikationen. Hvert niveau har en **testspecifikation**, der skrives tidligt, og en **testrapport**, der skrives når testen køres.',
      concepts: [
        {
          term: 'V-modellen: niveau for niveau',
          body: [
            'Slides tegner V’et med udviklingen ned ad venstre ben (Requirements Analysis → System Design → Architectural Design → Module Design → Module Impl.) og testen op ad højre (Unit → Integration → System → Acceptance). Hvert niveau er koblet vandret: kravanalysen til accepttesten, systemdesignet til systemtesten, arkitekturen til integrationstesten og moduldesignet til unit testen.',
            '**Verification** — *build the thing right* — er intern og sker i alle faser (unit, integration, system). **Validation** — *build the right thing* — er ekstern og tester produktet mod krav og brugerbehov (system og accept).',
          ],
        },
        {
          term: 'Hvornår i projektet',
          body: [
            'Forberedelsen ligger tidligt, udførelsen sent. I SPU specificeres accepttesten allerede i kravfasen, og hver testtype gennemgår aktiviteterne **specificer → design → implementer → kør → evaluer**. De tre første ligger så tidligt som muligt; det opdager uklarheder i specifikationerne og giver tid til at bygge testomgivelser.',
            'Slides viser mareridtet: implementeringen skrider, og testen bliver presset sammen lige før deadline. Mantraet er *test early, test often, test enough*. I en iterativ proces integreres og testes der i hver iteration — se [[swt/agil-integration|agil integration]].',
          ],
        },
        {
          term: 'Integrationstest: strategi',
          body: [
            'Integrationstest samler allerede unit-testede komponenter og tester **samspillet og grænsefladerne** — ikke en gentagelse af unit testen. Strategierne i slides: **big bang**, **bottom-up** (starter i bladene i dependency-træet og kræver *drivers*), **top-down** (starter i roden og kræver *stubs*) og **sandwich**.',
            'SPU kalder det *trinvis* mod *samlet* integration: trinvis gør fejl lokaliserbare til det senest tilføjede. Top-down kan hurtigt demonstrere programstrukturen og de øverste funktioner. I praksis vælges et kompromis efter programmets struktur, hvilke moduler der bliver færdige først, om hardwaren er tilgængelig, og hvad der er vigtigt at afprøve tidligt.',
            'Dybden ligger i SWT: [[swt/integrationstest|dependency tree]], [[swt/integrationsmoenstre|integrationsmønstre]], [[swt/integrationsplan|integrationsplan]] og [[swt/stub-mock|stubs og mocks]].',
          ],
        },
        {
          term: 'Systemtest og accepttest',
          body: [
            'Accepttesten viser, om systemet opfylder **kravspecifikationen**. Den gennemføres med kunden, der skriver under. Hver use case mappes til test: scenariets trin bliver testens trin, præ- og postbetingelser tjekkes, og **hver sti gennem use casen skal have sit eget testscenarie**. Se [[accepttest|accepttest og sporbarhed]] og [[fully-dressed-uc|fully dressed use case]].',
            'Ud over det funktionelle tester SPU kvalitetsfaktorerne: stress-, volumen-, bruger-, sikkerheds-, ydeevne-, lager-, konfigurations-, kompatibilitets-, pålideligheds- og fejlbehandlingstest. Det er her, målbare [[ikke-funktionelle-krav|ikke-funktionelle krav]] bliver testet. Automatiserede system- og accepttests: [[swt/systemtest|SWT]].',
          ],
        },
        {
          term: 'Artefaktet: testspecifikation og testrapport',
          body: [
            '**Testspecifikationen** (SPU fig. 12) har indledning (formål, referencer, omfang og begrænsninger, **godkendelseskriterium**), testemner, testdesign, testimplementation og udførelse. Testemnerne er “testens kravspecifikation”: en nummereret liste, hvor hvert emne peger på ét afsnit i grundspecifikationen.',
            '**Testrapporten** (SPU fig. 14) har reference til testspecifikationen, identifikation af den testede version og testomgivelserne, testresultater, afvigelser og problemrapporter, og en konklusion. Den kan være en kopi af testspecifikationen påført dato, resultater og konklusion.',
            'Peckol bruger samme kæde for hardware: **test plan** (hvad, ud fra kravspecifikationen) → **test specification** (konkrete værdier og tolerancer) → **test procedure og test cases** (trin, stimuli, forventede målinger). Beslægtede test cases udgør en *test suite*.',
          ],
        },
        {
          term: 'Sporing tilbage til krav',
          body: [
            'Sporingen går begge veje: testemne → afsnit i grundspecifikationen (SPU s. 190), testresultat → punkt i testspecifikationen (SPU s. 205), og accepttestscenarie → use case-scenarie (slide 28). Testcases, der kun er tilføjet for at nå et dækningskriterium, mærkes separat, så formålet med hver testcase kan spores. Se [[kravspecifikation|kravspecifikation]] og [[rygrad|projektets rygrad]].',
          ],
        },
        {
          term: 'Typiske fejl',
          body: [
            'At køre testen uden at have defineret det forventede resultat (slide 7: “Do not proceed until expected test result is defined”). At lade udvikleren teste sin egen kode alene. At afgøre aflevering efter datoen i stedet for et objektivt godkendelseskriterium (SPU fig. 13). At gentage unit testen og kalde det integrationstest. At en use case med flere stier kun får én test.',
          ],
        },
      ],
      viz: 'v-model-sporing',
      keyPoints: [
        'Unit ↔ moduldesign, integration ↔ arkitektur, system ↔ systemdesign, accept ↔ krav.',
        'Specificér testen tidligt (venstre ben), kør den sent (højre ben). Hver testtype: specificer → design → implementer → kør → evaluer.',
        'Integrationstest tester samspil og grænseflader. Bottom-up kræver drivers, top-down stubs.',
        'Accepttest: hver sti gennem en use case får sit eget testscenarie. Kvalitetsfaktorer testes også.',
        'Testspecifikation med godkendelseskriterium før; testrapport med version, resultater, afvigelser og konklusion efter.',
        'Forventet resultat defineres, før testen køres.',
      ],
      code: [
        {
          lang: 'text',
          title: 'Indholdsfortegnelse for en testspecifikation',
          source: 'SPU, Vejledning i softwaretest s. 201 (fig. 12)',
          code: `1. Indledning
   1.1 Formål
   1.2 Referencer
   1.3 Testens omfang og begrænsninger
   1.4 Godkendelse
2. Testemner
3. Testdesign
4. Testimplementation
5. Udførelse af test
Bilag`,
        },
        {
          lang: 'text',
          title: 'Indholdsfortegnelse for en testrapport',
          source: 'SPU, Vejledning i softwaretest s. 204 (fig. 14)',
          code: `1. Indledning
   1.1 Reference
   1.2 Identifikation
2. Testresultater
3. Afvigelser og kommentar
   3.1 Afvigelser fra normal afvikling
   3.2 Problem/ændringsrapporter
4. Konklusion`,
        },
      ],
      exam: [
        '“Hvordan sporer I krav 7 til en test?” Kravet er dækket af en use case; hver sti gennem use casen har et scenarie i accepttestspecifikationen, og testrapporten viser resultatet for netop det scenarie med dato og version.',
        '“Hvilken integrationsstrategi valgte I, og hvorfor?” Svar med jeres dependency-træ: fx bottom-up fra hardware-nære komponenter med drivers, fordi de blev færdige først — eller top-down med stubs, fordi brugergrænsefladen skulle kunne demonstreres tidligt.',
        '“Hvad er forskellen på verifikation og validering?” Verifikation er, om vi bygger tingen rigtigt — mod design og delkrav, internt, i alle faser. Validering er, om vi bygger den rigtige ting — mod krav og brugerbehov, med kunden, i system- og accepttesten.',
        '“Hvornår skrev I testene?” Accepttesten blev specificeret sammen med kravene, integrationstesten ud fra arkitekturen. Udførelsen kom, når komponenterne var klar.',
        '“Hvornår var produktet færdigt?” Når godkendelseskriteriet i testspecifikationen var opfyldt — ikke når datoen var nået.',
      ],
      sources: [
        { path: k('03-systemtest/system-test.md'), original: 'System Test.pdf (2024, 31 slides)', pages: 'slide 2–30' },
        { path: k('bog/04-spu-vejledning-softwaretest.md'), original: 'SPU: Vejledning i softwaretest', pages: 's. 172–207' },
        { path: k('bog/03-peckol-ch10-hardware-test-debug.md'), original: 'Peckol, Embedded Systems Design, kap. 10', pages: 's. 401–407' },
        { path: k('03-systemtest/eksempel-accepttestspecifikation-ttt.md'), original: 'TTT_Accepttestspecifikation.pdf', note: 'Eksempel på en accepttestspecifikation fra et 3.-semesterprojekt' },
        { path: k('00-kursus/sw4prj4-introduktion.md'), original: 'SW4PRJ4 Introduktion.pdf', pages: 'slide 4', note: 'Læringsmål: teknikker, metoder og værktøjer til softwaretest' },
      ],
      gaps: [
        'Slides og SPU bruger forskellige niveauer. Slides: unit, integration, system, acceptance. SPU: modultest, modulintegration, procesintegration og accepttest — uden et selvstændigt systemtest-niveau, og med integrationen delt i to.',
        'Slide 15 (2024-udgaven) regner systemtesten under både verification og validation; 2016-udgaven har kun “Unit + Integration Test” under verification. Materialet forklarer ikke, hvorfor systemtesten står begge steder.',
        'Hvad en *systemtest* konkret indeholder, og hvordan den adskiller sig fra accepttesten i et studieprojekt, forklares ikke ud over V-modellens kobling til System Design.',
        'Slide 25 stiller spørgsmålene om fordele ved top-down og bottom-up som diskussion uden svar. SPU nævner kun top-downs fordel (tidlig demonstration) og kriterierne for valget.',
        'Materialet har ingen skabelon for en integrationstestspecifikation i et projekt. SPU’s indholdsfortegnelser er generelle og fra et vandfaldsforløb; integrationsplanen som artefakt findes i SWT ([[swt/integrationsplan|integrationsplan]]).',
        'SPU’s kapitler om debugging og testværktøjer (s. 208–211) er ikke med i kompendiet.',
      ],
      keywords: ['integrationstest', 'systemtest', 'accepttest', 'unit test', 'modultest', 'V-model', 'verification', 'validation', 'verifikation', 'validering', 'bottom-up', 'top-down', 'big bang', 'sandwich', 'driver', 'stub', 'testspecifikation', 'testrapport', 'testemne', 'test plan', 'test procedure', 'test case', 'test suite', 'godkendelseskriterium', 'kvalitetsfaktorer', 'sporbarhed', 'traceability'],
    },
  ],
}
