import type { Part } from '../types'
import { k } from './paths'

export const messagePassing: Part = {
  id: 'message-passing',
  title: 'Message passing',
  topics: [
    {
      slug: 'message-passing',
      title: 'Message passing og beskedkøer',
      short: 'Message passing',
      week: 'Uge 8 · L8.1',
      definition:
        'Med **message passing** interagerer tråde ved at sende *immutable messages* over en delt kommunikationskanal i stedet for at dele mutable hukommelse. Kanalen er en **blocking queue**: `push` blokerer, når køen er fuld, og `pop` blokerer, når den er tom. Køen ejer dataen, og kommunikationen bliver eksplicit frem for indirekte via “sæt værdi, derefter notify”.',
      concepts: [
        {
          term: 'Motivation og producer–consumer genopfrisket',
          body: [
            'Decket åbner (s. 2) med de to IPC-modeller fra Process Management: **shared memory** og **message passing**. En proces med flere tråde er et eksempel på *shared (mutable) memory concurrency* og kræver synkronisering med al dens kompleksitet. Med message passing sender tråde beskeder, som modtageren ikke kan ændre, over en kanal — i IPC var kanalen en pipe (se [[ipc|IPC]]).',
            'Slidets argument er, at det er **sikrere**, og at kommunikationen går gennem en eksplicit kanal i stedet for indirekte, som med conditionals. Bogen (3.4, Figur 3.11) tegner de samme to modeller, men vægter anderledes: message passing er nemt til små datamængder og distribuerede systemer, men går gennem kernen med systemkald, mens shared memory er hurtigere, fordi kernen kun er med, når regionen oprettes.',
            'Slide 3 viser bogens busy-wait-version (Abraham10 sektion 6.0): produceren spinner i `while (count == BUFFER_SIZE)`, consumeren i `while (count == 0)`, og begge ændrer den delte `count` uden beskyttelse — race condition og spildt CPU-tid.',
            'Slide 4 er semafor-versionen (sektion 7.1.1): `wait(empty); wait(mutex); … signal(mutex); signal(full);` hos produceren og det spejlvendte hos consumeren. Pointen står nederst: “We write data to a buffer, but use mutex/conditional to control/signal its validity!” Selve løsningen gennemgås i [[bounded-buffer|bounded buffer]].',
            'Slide 5 er message passing-versionen: produceren kalder `queue.push(item)`, consumeren `item = queue.pop()`, og al synkronisering ligger i den fælles `BlockingQueue queue`. `pop` “Returns a value, NOT a pointer!” — “The queue manages memory, we don´t!”. Bogens Figur 3.14–3.15 er den samme idé med `send(next_produced)` og `receive(next_consumed)`.',
          ],
        },
        {
          term: 'Blocking queue, send/receive og flere consumers',
          body: [
            '`MessageQueue` på s. 14 har kun interfacet `void push(Message msg)` (blokerer, hvis fuld) og `bool pop(Message& msg)` (blokerer, hvis tom). Slidet siger bare, at køen skal være en blokerende kø som i P/C-eksemplet. At blokere til en betingelse er opfyldt er præcis, hvad en mutex plus condition variable gør — `cv.wait(lock, pred)` og `notify_one()` fra [[monitor-cv|monitor og condition variables]].',
            'Bogen (3.6.2) kalder det **blocking** og **nonblocking** (synkron/asynkron): blocking send venter, til beskeden er modtaget af processen eller mailboxen; nonblocking receive returnerer en gyldig besked eller null. Er både send og receive blocking, har man et **rendezvous**, og producer–consumer bliver trivielt.',
            'Bogens 3.6.3 skelner mellem tre kapaciteter: **zero capacity** (senderen blokerer til modtageren tager beskeden — “no buffering”), **bounded capacity** (længde `n`; senderen blokerer kun, når køen er fuld) og **unbounded capacity** (senderen blokerer aldrig). Slidets “blocks if full” svarer til bounded capacity. Bogens 3.6.1 skelner desuden mellem direkte (`send(P, message)`) og indirekte kommunikation via **mailboxes** (`send(A, message)`) — forløberen for brokeren i [[messaging-system|messaging systems]].',
            'Mange producers og én consumer på samme kø er fint (s. 23). Én producer og flere consumers på samme kø er ikke: consumeren `pop`’er, så hver besked når kun én af dem — “we need to somehow copy messages…”.',
            'Løsningen på s. 24: **consumeren ejer køen**, én kø pr. consumer. Skal en producer sende det samme til flere consumers eller broadcaste til et ukendt antal, skal beskederne distribueres — det er emnet for [[messaging-system|messaging systems]].',
          ],
        },
        {
          term: 'Space Shooter: shared memory mod message passing',
          body: [
            'Spillet har `Enemy`, `Bullet`, `GameState` og `GameCtrl`. I shared memory-versionen (s. 25–26) sætter game state’ens condition variable collision detection i gang: `GameCtrl` tager `Lock` og kalder `Wait`; `Enemy` tager `Lock`, kalder `updateEnemies()`, `UnLock` og `Notify`; `GameCtrl` vågner, kører `detectCollision()`, låser op, låser igen og venter. Det samme gentager sig med `Bullet` og `updateBullets()`, og ved et træf sendes `Hit!` til `User`.',
            'I message passing-versionen (s. 27–28) pusher `Enemy` og `Bullet` en `EnemyMessage` og en `BulletMessage` til én `Message queue`. `GameCtrl` kalder `pop(gameMsg)`, `Handle(enemyMsg)` gemmer `enemyMessage = enemyMsg` og kalder `detectCollision()`; næste `pop` giver `Handle(bulletMsg)`. Handlerne gemmer den seneste enemy/bullet-vektor.',
            'Slidet slutter med en afvejning: collision detection *kunne* sende opdaterede vektorer tilbage til `Enemy`/`Bullet`, så de har noget at arbejde med — “Not a silver bullet!” Tilstanden forsvinder ikke; den flyttes ind i den tråd, der ejer køen.',
          ],
        },
        {
          term: 'Flere beskedtyper: fra mange køer til én',
          body: [
            'Med én kø pr. beskedtype (s. 7: `LoginMessage`, `LogoutMessage`, `OtherMessage`) skal consumeren have en handler **og en tråd** pr. type (`t1`, `t2`, `t3`). Nye datatyper giver nye køer, handlers og tråde — “scales poorly!”. Med én kø til alle typer (s. 8) multiplexer produceren, og consumeren demultiplexer og kalder den rigtige handler; nye typer kræver kun nye handlers, og der er kun én tråd.',
            'Slide 9 giver fire måder at identificere typen på. **Inheritance og `dynamic_cast`** (s. 10): polymorf base `Message` og RTTI. Nemt med eksisterende hierarkier og ingen ID-register, men RTTI kan være langsomt i hot paths og giver kode fuld af typetjek — til prototyper og små systemer. **Explicit type ID** (s. 11): virtuel `getType()`, fx `LoginMessage` returnerer 18 og `LogoutMessage` 21, og `switch(message.getType())`. Hurtigt (et virtuelt kald og en int-sammenligning), let at sende over netværk og virker uden RTTI, men mere boilerplate, og fejl fanges først ved runtime — til distribuerede systemer, IPC og messaging systems.',
            '**Algebraic data type** (s. 12): beskeder som **sum type** med `std::variant` og `std::visit`. Ingen RTTI eller manuelle ID’er, ofte mere effektivt end polymorfi, og forkerte eller manglende handlers er **compile-time-fejl**; til gengæld skal alle beskedtyper kendes ved compile-time — protokoller, game engine events. Den fjerde, **Visitor Pattern**, står kun i parentes.',
          ],
        },
        {
          term: 'std::variant, std::visit og consumer-klassen',
          body: [
            'En sum type er en union af typer: `t = int OR double OR float` (s. 15). `variant<int, float> v; v = 42;` indeholder en int, `get<int>(v)` giver 42, og efter `v = (float)42.1` er `holds_alternative<float>(v)` sand. Beskedtyperne (s. 16) er `struct LoginData { std::string username; }`, `LogoutData` og `SendMessageData { from; text; }`, samlet i `using MessageData = std::variant<LoginData, LogoutData, SendMessageData>` og pakket i `struct Message { MessageData data; }` — den ene kø kan nu bære alle typer.',
            '`std::visit` vælger “the most specific overload of a function” der matcher den aktuelle type i varianten (s. 17). Den komponent, der gør det, kaldes en **dispatcher** — “the canonical term in C++ when you take a type or ID and send it to the correct function” (s. 13).',
            '`Consumer` (s. 19) tager en `MessageQueue&` i konstruktøren, og `dispatchMessages()` kører `while (queue.pop(msg))` med `std::visit([](auto&& data) { handle(data); }, msg.data)`. De statiske `handle(const LoginData&)` og `handle(const LogoutData&)` er overloads, én pr. type. I `main` (s. 18) kører consumeren i sin egen `std::thread`, og en producer-tråd pusher `{LoginData{"Gerd Muller"}}` og `{LogoutData{"Roberto Baggio"}}`.',
          ],
        },
        {
          term: 'Moving data: copy og move semantics',
          body: [
            'Message passing gøres effektivt ved at **flytte ejerskab** i stedet for at kopiere (s. 20): køen kan bruge `std::move` i `push` (producer → kø) og i `pop` (kø → consumer).',
            '**Copy** laver et nyt objekt med samme indhold, kalder `T(const T&)` og efterlader kilden uændret. **Move** overfører ressourcerne, kalder `T(T&&)` og efterlader kilden “valid but unspecified (usually empty)” — billigere for objekter med dynamisk hukommelse som `std::string`, fordi der ikke allokeres (s. 21).',
            'Eksemplet på s. 22 med `LoginData`: `LoginData b = a;` kalder copy ctor (lvalue), `LoginData c = std::move(a);` kalder move ctor, og `LoginData d = LoginData{"bob"};` er markeret move ctor (temporary rvalue). Ejerskab og move går igen i [[smart-pointers|smart pointers]].',
          ],
        },
        {
          term: 'Konsekvens: reaktiv programmering',
          body: [
            'En blokerende kø giver **reactive** eller **event-driven programming** (s. 6): en tråd venter på en event og reagerer ved at håndtere den. Eksemplet har en UI med `Button` (`bmq.push(buttonMsg)`), `DropDown` (`xmq.push(dropdownMsg)`) og en `LED` (`ledMsg = lmq.pop(); ledSet(ledMsg.state)`).',
            'Business logic’en popper `btnMsg = bmq.pop()`, sætter `ledMsg.on` efter `btnMsg.state == 1` og pusher til `lmq`. UI og logik kalder ikke hinanden direkte; alt går gennem køer med én ejer hver.',
          ],
        },
      ],
      viz: 'message-queue',
      keyPoints: [
        'Message passing: immutable beskeder over en eksplicit kanal i stedet for delt mutable state.',
        'Blocking queue: `push` blokerer når fuld, `pop` når tom — køen ejer dataen og synkroniseringen.',
        'Bogen: blocking/nonblocking send og receive; begge blocking = rendezvous. Kapacitet zero, bounded eller unbounded.',
        'Mange producers → én consumer er fint; flere consumers kræver én kø pr. consumer (consumer ejer køen).',
        'Én kø til alle typer skalerer bedre end én kø og én tråd pr. type.',
        'Typeidentifikation: RTTI/`dynamic_cast`, enum/`getType()`, `std::variant` + `std::visit` (compile-time-tjek).',
        '`std::visit` er dispatcheren: vælger den overload af `handle`, der matcher variantens aktuelle type.',
        'Move frem for copy: `std::move` i `push` og `pop` flytter ejerskab uden ny allokering.',
        'Blokerende køer giver event-driven programmering — og Space Shooter viser, at det ikke er en silver bullet.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'P/C med blocking queue og MessageQueue-interfacet',
          source: '08.1-Message-Passing-and-Queues.pdf s. 5 og 14',
          code: `// Producer                          // Consumer
while (true) {                         while (true) {
  /* produce an item */                  /* take item from queue
                                            will block if queue is empty */
  /* put item into blocking queue        item = queue.pop();
     will block if queue is full */    }
  queue.push(item);
}

BlockingQueue queue; // The shared queue

// s. 14
class MessageQueue {
public:
  void push(Message msg) {}
  bool pop(Message& msg) {}
};`,
        },
        {
          lang: 'cpp',
          title: 'Beskedtyper som std::variant og main',
          source: '08.1-Message-Passing-and-Queues.pdf s. 18',
          code: `struct LoginData { std::string text; };
struct LogoutData { std::string text; };
using MessageData = std::variant<LoginData, LogoutData>;
struct Message { MessageData data; };

int main() {
    MessageQueue queue;
    Consumer consumer(queue);

    // Consumer thread
    std::thread consumerThread([&] { consumer.dispatchMessages(); });

    // Producer thread
    std::thread producer1([&] {
        queue.push({LoginData{"Gerd Muller"}});
        queue.push({LogoutData{"Roberto Baggio"}});
    });

    producer1.join();
    consumer.join();
    return 0;
}`,
        },
        {
          lang: 'cpp',
          title: 'Consumer: dispatch med std::visit og overloadede handlers',
          source: '08.1-Message-Passing-and-Queues.pdf s. 19',
          code: `class Consumer {
public:
 Consumer(MessageQueue& q) : queue(q) {}
    void dispatchMessages() {
        Message msg{};
        while (queue.pop(msg)) {
            std::visit([](auto&& data) { handle(data); }, msg.data);
        }                                   // slidet: "Move constructor!"
    }

private:
    MessageQueue& queue;

     // Overloaded handlers
     static void handle(const LoginData& data) {
         std::cout << "User " << data.text << " logged in.\\n";
     }
     static void handle(const LogoutData& data) {
         std::cout << "User " << data.text << " logged out.\\n";
     }
};`,
        },
        {
          lang: 'cpp',
          title: 'Copy- og move-konstruktør',
          source: '08.1-Message-Passing-and-Queues.pdf s. 22',
          code: `#include <iostream>
#include <string>

struct LoginData {
    std::string username;

     LoginData(std::string u) :
           username(std::move(u)) {}

     LoginData(const LoginData& other) {
         std::cout << "Copy ctor\\n";
         username = other.username;
     }

     LoginData(LoginData&& other) {
         std::cout << "Move ctor\\n";
         username = std::move(other.username);
     }
};

int main() {
    LoginData a{"alice"};             // construct
    LoginData b = a;                  // copy ctor (lvalue)
    LoginData c = std::move(a);       // move ctor (rvalue)
    LoginData d = LoginData{"bob"};   // move ctor (temporary rvalue)
}`,
        },
      ],
      exam: [
        'Message passing betyder, at tråde kommunikerer ved at sende beskeder over en kanal i stedet for at dele mutable hukommelse. Kanalen er en blocking queue: `push` blokerer, når den er fuld, og `pop` blokerer, når den er tom — i bogens termer bounded capacity, og med blocking send og receive et rendezvous.',
        'Sammenlignet med bounded buffer med `empty`, `full` og `mutex` flyttes al synkronisering ind i køen. Producer og consumer kalder bare `push` og `pop`, og `pop` returnerer en værdi, ikke en pointer, så køen ejer dataen. Internt bygges blokeringen med en mutex og condition variables.',
        'Skal flere beskedtyper over én kø, skal consumeren demultiplexe. Kurset viser tre måder: RTTI med `dynamic_cast`, et enum-ID via `getType()`, og `std::variant` med `std::visit`. I kursets `Consumer` popper `dispatchMessages()` en `Message` og kalder `std::visit` med en lambda, der vælger den overloadede `handle(const LoginData&)` eller `handle(const LogoutData&)`.',
        'Variant-løsningen giver compile-time-fejl ved manglende handlers, men alle typer skal være kendt ved compile-time. Til netværk og IPC er et type-ID bedre, fordi det kan serialiseres. For at undgå kopier flytter køen ejerskabet med `std::move` i både `push` og `pop`.',
        'Faldgruben er flere consumers: `pop` fjerner beskeden, så kun én consumer får den. Løsningen er én kø pr. consumer, og så skal nogen distribuere beskederne — det er brokeren i messaging systems. Og som Space Shooter-eksemplet viser, er det ikke en silver bullet: tilstanden flytter bare ind i den tråd, der ejer køen.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture08_1_MessagePassingAndQueues.md'), original: '08.1-Message-Passing-and-Queues.pdf', pages: 's. 2–28' },
        { path: k('context/book/SW3SYS-01_Ch03_Processes.md'), original: 'Silberschatz, Operating System Concepts (Global Edition)', pages: 's. 129–138', note: 'Sektion 3.4–3.6 (IPC, shared memory, message passing: naming, synchronization, buffering)' },
        { path: k('context/slides/SW3SYS-01_Lecture06_1_SynchronisationExamples.md'), original: '06.1-Synchronisation-Examples.pdf', note: '`std::condition_variable` — værktøjet bag en blokerende kø' },
      ],
      gaps: [
        '`MessageQueue` findes kun som tomt interface (08.1 s. 14). Hverken slides eller `lecture-code-main` har en implementering med mutex og condition variable, og der er ingen kodemappe til uge 8–9 om message passing. At køen er “internt synkroniseret med mutex og condition variables”, står kun i markdown-konverteringen, ikke på slidet.',
        '`bool pop(Message& msg)` (s. 14) returnerer `bool`, men det står ingen steder, hvornår den returnerer `false`. `dispatchMessages()` (s. 19) kører `while (queue.pop(msg))`, så consumer-tråden stopper aldrig. Slide 5 har en anden signatur: `item = queue.pop()` returnerer værdien.',
        '`main` på s. 18 kalder `consumer.join()` på et `Consumer`-objekt, som ingen `join()` har, og joiner aldrig `consumerThread`.',
        'Feltnavnene skifter: `LoginData` har `username` på s. 16 og s. 22, men `text` på s. 18–19. Slide 12 skriver `std::variant MessageData = std::variant<…>;`, som ikke er gyldig C++; s. 16 bruger korrekt `using MessageData = …`.',
        'RTTI-eksemplet på s. 10 har en manglende parentes og stavefejlen `messsage`, og `dynamic_cast<LoginMessage>(message)` bruger ikke en pointer- eller referencetype. Resultatet tildeles en `Message` (base-typen).',
        'Visitor Pattern står kun i parentes (s. 9) og forklares ikke. Dropdownens kø på s. 6 hedder `xmq` med typen “??”.',
        'Slides og bog vægter forskelligt: slidet (s. 2) kalder message passing sikrere, bogen (3.4, s. 131) fremhæver, at det kræver systemkald og er langsommere end shared memory for store datamængder. Slidenes kø er intra-process mellem tråde; bogens er en kerne-kø mellem processer.',
        'Space Shooter-koden findes ikke i materialet — kun de to sekvensdiagrammer (s. 26 og 28).',
        'Uden for materialet: Annotationen “Move constructor!” ved `[](auto&& data)` (s. 19) holder ikke. `msg.data` er en lvalue, så `auto&&` binder som lvalue-reference, og handlerne tager `const&` — der sker ingen move. Move sker kun, hvis køen selv bruger `std::move` i `push` og `pop`, som s. 20 foreslår.',
        'Uden for materialet: `LoginData d = LoginData{"bob"};` (s. 22) kalder ikke move-konstruktøren fra C++17, fordi copy elision er garanteret for prvalues. Programmet udskriver kun “Copy ctor” og én “Move ctor”.',
      ],
      keywords: ['message passing', 'beskedoverførsel', 'message queue', 'beskedkø', 'blocking queue', 'BlockingQueue', 'MessageQueue', 'push', 'pop', 'producer', 'consumer', 'IPC', 'send', 'receive', 'rendezvous', 'mailbox', 'zero capacity', 'bounded capacity', 'unbounded capacity', 'multiplexing', 'demultiplexing', 'dispatcher', 'RTTI', 'dynamic_cast', 'typeid', 'getType', 'std::variant', 'std::visit', 'sum type', 'algebraic data type', 'holds_alternative', 'std::move', 'move semantics', 'copy semantics', 'rvalue', 'reactive programming', 'event-driven', 'Space Shooter'],
    },

    {
      slug: 'messaging-system',
      title: 'Messaging systems og publish–subscribe',
      short: 'Messaging systems',
      week: 'Uge 10 · L10.1',
      definition:
        'Et **messaging system** løser det, en enkelt kø ikke kan: at kopiere og distribuere beskeder til flere consumers. Kernen er en **message broker** — et “post office”, der validerer og router beskeder, så producers og consumers ikke kender hinanden. Kurset bygger en intra-process **publish–subscribe**-broker som Singleton med topics og handlers.',
      concepts: [
        {
          term: 'Message broker, scope og models',
          body: [
            'Recap (s. 2): med flere consumers skal beskeder kopieres og distribueres. Løsningen (s. 3) er et “post office” mellem producers og consumers med *validation and routing logic*. Det øger fleksibiliteten og løsner koblingen, og det kaldes en **message broker**.',
            'Slide 4 citerer Wikipedia: brokeren er et arkitekturmønster for validering, transformation og routing, der minimerer den gensidige viden, applikationerne skal have om hinanden — “effectively implementing decoupling”. Figuren viser to roller: *Register services* og *Route messages*. Mønstret fastlægger hverken scope eller model.',
            'Bogens nærmeste modstykke er **indirect communication** via mailboxes (3.6.1): `send(A, message)` til en mailbox i stedet for til en navngiven proces, og et link kan dække mere end to processer. Direkte navngivning er ifølge bogen *hard-coding* — det er den kobling, brokeren fjerner. Se [[message-passing|message passing]].',
            '**Scope** (s. 5): *intra-process* (tråde, der pusher til og popper fra en broker-tråd, via function calls — “OUR FOCUS!!!”), *inter-process* (processer via pipes og sockets, fx `~/pipe1`) og *distributed* (noder via netværk, fx TCP/UDP mellem `192.168.0.3` og `192.168.0.4`).',
            '**Models** (s. 6). *Direct point-to-point*: sendes til én bestemt modtager, abstraktionen er en kø, og hver besked leveres til præcis én consumer — blocking message queues, POSIX message queues; “Send this message to process B”. *Publish/subscribe*: sendes til et **topic**, og modtagere abonnerer; hver besked leveres til alle subscribers på topic’et — MQTT, Apache Kafka, IoT, Qt Signals/Slots, .NET events. *Broadcast*: leveres til alle lyttere uden abonnement — system-wide signals, DHCP. Pub/sub er fokus.',
          ],
        },
        {
          term: 'Observer og publish–subscribe',
          body: [
            'Observer-mønstret (s. 7) er grundlaget: `Subject` (“the Publisher”) har `attach(Observer)`, `detach(Observer)` og `notify()`, som kalder `o->update()` for alle observers (`0..*`). `ConcreteObserver` (“the Subscriber”) henter tilstand med `observerState = subject->getState()`. Samme mønster i C# står i [[swd/observer|Observer i SWD]].',
            'Sekvensdiagrammet for **push-varianten** (s. 8): `Client` kalder `attach(ObsA)` og `attach(ObsB)`; ved en state change kalder `notify(newState)` `update(newState)` på hver observer, som svarer med `acknowledgment`. Pub/sub-diagrammet (s. 9) er det samme med en broker indimellem: Subscriber A og B kalder `subscribe("topic1")` på `MessageBroker`, publisheren kalder `publish("topic1", message)`, og brokeren kalder `onMessage(message)` på hver subscriber og får `ack` tilbage.',
          ],
        },
        {
          term: 'Beskedtyper og grunddesign med Singleton-broker',
          body: [
            'Fra [[message-passing|message passing]] kender vi RTTI/`dynamic_cast`, explicit type-ID (enum), sum types og Visitor. Der valgte man `std::variant` plus `std::visit` — elegant intra-process med typer kendt ved compile-time, men “too restricted” som generel tilgang (s. 10).',
            'Et generelt system skal kunne sende beskeder mellem tråde, processer og over netværk, så man bruger et **explicit type-ID — et topic** af en simpel type som `int` eller `string` (s. 11). `GeneralMessage` har `topic : string` og `data : payloadType`, og payloaden afhænger af scope: in-memory objekter/structs intra-process, serialiserbare strukturer (C-structs, JSON, byte arrays) inter-process, og JSON, BSON eller Protobuf distribueret. Eksemplet: `{"message": {"topic" : "21", "data": {"username": "Gerd Muller"}}}`.',
            'Klassediagrammet (s. 12): `Producer` med `publish(topic: string, data: MessageData)`, `Consumer` med `onMessage(message: Message)`, og `«Singleton» Broker` med `- subscribers: map<string, vector<function>>`, `getInstance() : Broker`, `subscribe(topic: string, handler: function)` og `publish(message: Message)`. `Message` har `topic : string` og `data : MessageData`, og `LoginMessage`/`LogoutMessage` arver fra `MessageData`. Bemærkningen: med arv skal data sendes som pointer (`unique` eller `shared`), ellers sker **object slicing**, når afledte objekter sendes by value som base.',
            '**Singleton** (s. 13) løser, at flere instanser af et systemdækkende objekt giver inkonsistent tilstand: præcis én instans og et globalt adgangspunkt — messaging system, configuration manager, logging, game engine. En statisk `Singleton& getInstance()` opretter instansen ved første kald og returnerer den samme reference bagefter.',
            'Faldgruben er race conditions ved oprettelsen: “The double-checking locking idiom is UNSAFE!” (sammenlignet med Peterson’s solution). Fra C++11 er initialisering af en `static` lokal variabel garanteret atomisk og sker kun én gang, også med flere tråde (s. 14). For fuldstændighedens skyld bør copy- og move-konstruktører slettes.',
          ],
        },
        {
          term: 'Handler/callback og flowet',
          body: [
            'En **handler** eller callback er en funktion, der registreres til automatisk at blive kaldt, når en bestemt event eller besked indtræffer (s. 15). `Broker::subscribe(string topic, function<void(string, Message)> handler)` er en **second order function** — den tager en funktion som argument (se [[higher-order|higher-order functions]]) og gemmer den under topic’et. `Broker::publish` kalder `handler(message)` for hver subscriber på `message.topic`.',
            'Flowet (s. 16): `Main` opretter `Consumer`, kalder `getInstance().subscribe("login", Consumer.onMessage)`, og brokeren lægger handleren i `subscribers["login"]`. `Main` opretter `Producer`. Ved publish laver produceren `create("login", LoginMessage)` og kalder `publish(message)`; brokeren slår `subscribers["login"]` op, kalder `onMessage(message)`, consumeren kører `Dispatch(message.topic)`, og `(processed)` returnerer til brokeren.',
          ],
        },
        {
          term: 'Synkron publish, buffering og deadlock',
          body: [
            'Designet er **synkront** (s. 17): `publish` kalder consumerens `onMessage` og venter, til den er færdig. Det er den unbuffered consumer — publisher-tråden udfører selv consumerens arbejde.',
            'En **buffered** consumer (s. 18) lader `onMessage` gøre én ting: `queue.push(message)`. En anden tråd, `messageProcessingThread()`, kører `queue.pop()` og `dispatchMessage(message)`. “Remember: the consumer owns the queue!” — det er præcis én kø pr. consumer fra [[message-passing|message passing]], nu fodret af brokeren.',
            '`Broker::publish` skal beskyttes, mens den løber listen af subscribers igennem, fordi nye subscribers kan tilføjes eller fjernes parallelt, og andre tråde kan publicere samtidig (s. 17). Slidet skriver `[lock???]`.',
            'Problemet: `onMessage` kan selv publicere — slidets consumer publicerer `{"logout", data}`, når den får `"login"`. Fordi designet er synkront, sker det publish-kald, mens det første `publish` stadig kører på samme tråd. “This may however result in a deadlock, if we are not careful how we lock in publish. Why? How can we avoid this?” Slidet svarer ikke; spørgsmålet hører til [[deadlock-betingelser|deadlock-betingelserne]] og ejerskabet af låsen i [[mutex-spinlock|mutex]].',
            'Den buffered consumer fra s. 18 er materialets eget værktøj her: når `onMessage` kun pusher til en kø, kalder brokeren aldrig noget, der publicerer inde fra publish.',
          ],
        },
        {
          term: 'Case: hvem ejer consumeren?',
          body: [
            'Decket om resource management (11.1 s. 15–18) bruger messaging systemet til at forklare `std::weak_ptr`: en smart pointer med en ikke-ejende reference, der ikke øger reference count og kan bryde cirkulære afhængigheder. Diagrammet markerer Broker ↔ Consumer som “Circular dependency!”.',
            'Med rå referencer (`std::map<std::string, std::vector<Consumer>>`, s. 16) giver `onMessage` **undefined behaviour**, hvis consumeren slettes i main. Med `shared_ptr<Consumer>` (s. 17) holder brokeren consumeren i live — den bliver ikke slettet som forventet. Med `weak_ptr<Consumer>` (s. 18) får brokeren kun midlertidigt ejerskab med `if (auto d = c.lock())`; er consumeren væk, er `d` tom, og slettes den, mens den er låst lokalt, forsvinder den, når `d` går ud af scope. Mere i [[smart-pointers|smart pointers]].',
          ],
        },
        {
          term: 'Designprincipper og udvidede krav',
          body: [
            '**Perspectives** (s. 19): kun brokeren og beskedtyperne er kendt i systemet; producer og consumer er fuldstændigt afkoblet. En producer kan ikke skrive til en bestemt consumer (det ville øge koblingen), og en consumer abonnerer på en type uden at vide, hvem der producerer den. Broadcast laves med en broadcast-beskedtype (“Alarm!!!”). Eksemplet: en `Temperature sensor` publicerer `tempMessage`, og `Logger`, `GUI` og `Notification` modtager den.',
            '**Extended requirements** (s. 20): *serialization format* (binær, tekst, JSON), *schema evolution* (versionering, bagudkompatibilitet), *metadata* (timestamp, topic, headers, QoS), *delivery semantics* — at-most-once (best effort), at-least-once (med retries), exactly-once — *chronology/ordering* (FIFO eller parallel levering, tidszoner, netværksforsinkelse), *security* og *backpressure & flow control* (buffering, dropping, throttling). Slide 21 viser MQTT, ØMQ, Kafka, RabbitMQ og Redis som populære frameworks.',
          ],
        },
      ],
      viz: 'pubsub-broker',
      keyPoints: [
        'En broker validerer og router beskeder, så producers og consumers ikke kender hinanden.',
        'Scope: intra-process (kursets fokus), inter-process, distributed.',
        'Point-to-point = kø, én modtager. Pub/sub = topic, alle subscribers. Broadcast = alle lyttere.',
        'Pub/sub er Observer med en broker imellem: `subscribe(topic, handler)` og `publish(message)`.',
        'Generel beskedtype: `topic` (string/int) + payload, der kan serialiseres efter scope.',
        'Brokeren er Singleton; en `static` lokal variabel er thread-safe fra C++11. Double-checked locking er unsafe.',
        'Synkron publish kalder `onMessage` direkte; publicerer den igen, kan en lås i `publish` give deadlock.',
        'Buffered consumer: `onMessage` pusher bare til consumerens egen kø, og en tråd popper og dispatcher.',
        'Brokeren bør holde `weak_ptr<Consumer>`: rå reference giver UB, `shared_ptr` holder consumeren i live.',
      ],
      code: [
        {
          lang: 'cpp',
          title: 'Broker som Singleton i C++11',
          source: '10.1-Messaging-Systems.pdf s. 14',
          code: `#include <iostream>

class Broker {
public:
static Broker& getInstance() {
    // Following is guaranteed thread-safe
    // in C++11 and later
        static Broker instance;
        return instance;
    }
      void doSomething() {
          std::cout << "Singleton is working!\\n";
      }

private:
    Broker() {}
    ~Broker() = default;
};

int main() {
    Broker& b1 = Broker::getInstance();
    Broker& b2 = Broker::getInstance();

    b1.doSomething();

    // Verify both refs point to same instance
    assert(&b1 == &b2);
}`,
        },
        {
          lang: 'cpp',
          title: 'Handler/callback: subscribe og publish (slidets pseudokode)',
          source: '10.1-Messaging-Systems.pdf s. 15',
          code: `int Broker::subscribe(string topic,
    function<void(string, Message)> handler)
{
  addSubscriber(topic, handler);
}

int Broker::publish(Message message)
{
  [for each subscriber of message.topic]
    handler(message);
}

void Consumer::onMessage(Message message)
{
  if message.topic.compare("login")
    handleLogin(message);
}

int main()
{
  Consumer consumer1;
  Broker::getInstance().addSubscriber("login",
      consumer1.onMessage);
}`,
        },
        {
          lang: 'cpp',
          title: 'Protecting publish og buffered consumer (slidets pseudokode)',
          source: '10.1-Messaging-Systems.pdf s. 17–18',
          code: `// s. 17 — publish skal beskyttes, men hvordan?
int Broker::publish(Message message)
{
  [lock???]
  [for each subscriber of message.topic]
    handler(message);
}

void Consumer::onMessage(Message message)
{
  if message.topic.compare("login")
    Broker::getInstance().publish({"logout", data});
}

// s. 18 — buffered consumer: consumeren ejer køen
void Consumer::onMessage(Message message)
{
  queue.push(message);
}

Void messageProcessingThread()
{
  Message message = queue.pop();
  dispatchMessage(message);
}`,
        },
        {
          lang: 'cpp',
          title: 'Broker med weak_ptr<Consumer>',
          source: '11.1-Automatic_ressource_management.pdf s. 18',
          code: `// Broker
// subscribers : map<std::string, vector<weak_ptr<Consumer>>
// subscribe(const string &topic, shared_ptr<Consumer> consumer)
// publish(const string& topic, const Message& msg)

void Broker::publish(const std::string& topic, const Message& msg) {
  std::lock_guard<std::mutex> lock(mtx);
  auto it = subscribers.find(topic);
  if (it != subscribers.end()) {
    for (weak_ptr<Consumer> c : it->second) {
      if (auto d = c.lock()) // Get temp ownership
        d->onMessage(msg);
    }
  }
}`,
        },
      ],
      exam: [
        'Et messaging system løser problemet med flere consumers: en message broker står som et posthus mellem producers og consumers, validerer og router beskeder og afkobler de to sider. Kurset laver pub/sub intra-process: consumers abonnerer på et topic, og hver besked leveres til alle subscribers på topic’et, i modsætning til point-to-point, hvor hver besked kun når én consumer.',
        'Mekanismen er Observer-mønstret med en broker imellem. `Broker::subscribe(topic, handler)` er en higher-order function, der gemmer handleren i `map<string, vector<function>>`, og `publish(message)` slår topic’et op og kalder handleren — typisk consumerens `onMessage`. Brokeren er en Singleton, og i C++11 er en `static Broker instance` i `getInstance()` thread-safe, mens double-checked locking er unsafe.',
        'Da beskederne skal kunne krydse tråde, processer og netværk, bruger man et topic som type-ID og en payload, der kan serialiseres — ikke `std::variant` som i message passing. Sendes afledte beskeder via arv, skal det være pointers, ellers sker object slicing.',
        'Den store faldgrube er synkron publish: `publish` kalder `onMessage` på samme tråd, og hvis `onMessage` selv publicerer, mens `publish` holder sin lås, kan man få deadlock. Den buffered consumer fra slidene hjælper: `onMessage` pusher bare til consumerens egen kø, og en separat tråd popper og dispatcher.',
        'Ejerskab er det andet problem, fra case’en i 11.1. Holder brokeren rå referencer til consumers, giver en slettet consumer undefined behaviour; holder den `shared_ptr`, lever consumeren for evigt. Med `weak_ptr` og `c.lock()` får brokeren kun midlertidigt ejerskab under kaldet.',
      ],
      sources: [
        { path: k('context/slides/SW3SYS-01_Lecture10.1_MessagingSystems.md'), original: '10.1-Messaging-Systems.pdf', pages: 's. 2–21' },
        { path: k('context/slides/SW3SYS-01_Lecture11_1_automatic_resource_management.md'), original: '11.1-Automatic_ressource_management.pdf', pages: 's. 15–18', note: 'Messaging System — Case Study (raw, shared_ptr, weak_ptr)' },
        { path: k('context/slides/SW3SYS-01_Lecture08_1_MessagePassingAndQueues.md'), original: '08.1-Message-Passing-and-Queues.pdf', pages: 's. 9–12, 23–24', note: 'Typeidentifikation og én kø pr. consumer' },
        { path: k('context/book/SW3SYS-01_Ch03_Processes.md'), original: 'Silberschatz, Operating System Concepts (Global Edition)', pages: 's. 134–136', note: 'Sektion 3.6.1: direct vs. indirect communication (mailboxes)' },
      ],
      gaps: [
        'Slide 17 spørger “Why? How can we avoid this?” om deadlock i `publish`, men giver intet svar. De fire “løsningsretninger” i markdown-konverteringen (recursive mutex, kopiér subscriber-listen under lås, asynkron publish, buffering) står ikke på slidet. Kun den buffered consumer (s. 18) er materialets eget.',
        'Slide 21 viser kun logoer (MQTT, ØMQ, Kafka, RabbitMQ, Redis). Beskrivelserne af frameworkene i konverteringen står ikke på slidet. Det samme gælder navnet “Meyers’ Singleton”.',
        'Case’en i 11.1 (s. 16–18) holder en `std::lock_guard<std::mutex>` under hele løkken og kalder `onMessage` inden for låsen — netop det mønster, 10.1 s. 17 advarer om giver deadlock, hvis `onMessage` publicerer. De to decks kobler det ikke sammen.',
        '11.1 s. 16 hedder “Raw pointer”, men koden gemmer `std::vector<Consumer>` by value, itererer med `Consumer& c` og kalder `c->onMessage(msg)` — det compiler ikke. `subscribe` tager `Consumer&`.',
        'Brokerens subscribers er `map<string, vector<function>>` i 10.1 (s. 12), men `map<string, vector<Consumer>>` / `vector<weak_ptr<Consumer>>` i 11.1. Handlersignaturen på s. 15 er `function<void(string, Message)>`, mens `onMessage` tager én `Message`, og `main` kalder `addSubscriber` i stedet for `subscribe`.',
        'Slide 18 skriver `Void messageProcessingThread()` uden løkke, så tråden behandler kun én besked. Hvordan brokeren kender consumerens kø, siges ikke.',
        'Double-checked locking kaldes “UNSAFE! (problem ~ Peterson’s solution)” (s. 13) uden forklaring. Delivery semantics, schema evolution og backpressure (s. 20) nævnes kun.',
        'Kun intra-process scope implementeres. Inter-process og distribueret (s. 5) vises kun som diagram, og der er ingen kode til messaging systemet i `lecture-code-main`.',
        'Bogen dækker ikke pub/sub eller brokers. Det nærmeste er indirect communication via mailboxes (3.6.1), hvor bogen lader systemet vælge én modtager (fx round robin), når flere deler en mailbox — det modsatte af pub/sub, hvor alle subscribers får beskeden.',
        'Uden for materialet: `consumer1.onMessage` (s. 15) kan ikke gives som `std::function` uden et objekt — det kræver en lambda eller `std::bind`. Og `message.topic.compare("login")` returnerer 0 ved lighed, så betingelsen i slidets pseudokode er omvendt.',
        'Uden for materialet: En `std::mutex` er ikke rekursiv; tager samme tråd den igen, er opførslen udefineret og typisk en selv-deadlock. Det er forklaringen på “Why?” på s. 17.',
      ],
      keywords: ['messaging system', 'message broker', 'broker', 'publish-subscribe', 'pub/sub', 'publish', 'subscribe', 'topic', 'point-to-point', 'broadcast', 'observer', 'subject', 'attach', 'notify', 'update', 'Singleton', 'getInstance', 'double-checked locking', 'handler', 'callback', 'onMessage', 'second order function', 'buffered consumer', 'unbuffered consumer', 'object slicing', 'GeneralMessage', 'serialization', 'JSON', 'Protobuf', 'delivery semantics', 'at-least-once', 'exactly-once', 'backpressure', 'MQTT', 'Kafka', 'ZeroMQ', 'RabbitMQ', 'Redis', 'weak_ptr', 'lock_guard', 'decoupling'],
    },
  ],
}
