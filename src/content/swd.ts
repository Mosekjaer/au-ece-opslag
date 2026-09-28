import type { Course } from './types'

const m = (f: string) => `swd/markdown/${f}`

export const swd: Course = {
  id: 'swd',
  code: 'SW4SWD-01',
  name: 'Softwaredesign',
  short: 'SWD',
  semester: 4,
  ects: '5 ECTS',
  status: 'soon',
  exam: {
    form: 'Mundtlig, 20 minutter, ekstern censur, 7-trinsskala. Ingen forberedelse.',
    quote: 'Mundtlig, 20 minutter, ekstern censur, 7-trinsskala',
    quoteSource: m('kursus/SW4SWD-01_Course_Description.md'),
    points: [
      'Ca. 20 min inklusive votering. Spørgsmålene udleveres på forhånd.',
      'Obligatorisk opgave: der vælges et designmønster (deadline uge 43); afleveres uge 45.',
      'Forudsætning: 1 obligatorisk gruppeopgave plus 2 individuelle reviews skal være godkendt.',
      'Der er ingen liste over eksamensspørgsmål og ingen gamle sæt i materialet.',
    ],
  },
  goalsSource: m('kursus/SW4SWD-01_Course_Description.md'),
  goals: [
    { text: 'Anvende UML som modellerings- og dokumentationsværktøj.' },
    { text: 'Gengive, kombinere og anvende OO-principper.' },
    { text: 'Gengive og anvende softwarearkitektur og relaterede designprincipper.' },
    { text: 'Gengive, kombinere, anvende, analysere og sammenligne designmønstre.' },
    { text: 'Beskrive, sammenligne og anvende redskaber til parallelle programmer.' },
    { text: 'Arbejde selvstændigt og tage ansvar for egen læring.' },
    { text: 'Formidle egne undersøgelser mundtligt.' },
  ],
  gaps: ['Eksamensspørgsmålene udleveres “engang i november” og findes ikke i materialet endnu.'],
  outline: [
    {
      title: 'OO-grundlag, UML og XP',
      items: [
        { title: 'C#-interfaces', description: 'Grundlæggende interfaces i C# (selvstudie).', lesson: 'uge 0', sources: [m('noter/SW4SWD-01_CSharp_Interfaces_Basics.md')] },
        { title: 'OO-grundbegreber', description: 'Indkapsling, abstraktion, arv, polymorfi; is-a vs. behaves-like.', lesson: 'uge 1', sources: [m('slides/SW4SWD-01_W01.1b_OO_Basics.md')] },
        { title: 'UML-klassediagrammer', description: 'Notation, associationer, multiplicitet, komposition og realisering.', lesson: 'uge 1', sources: [m('slides/SW4SWD-01_W01.1c_UML_Class_Diagrams.md')] },
        { title: 'Extreme Programming', description: 'XP’s fem værdier, principper og praksisser.', lesson: 'uge 1', sources: [m('slides/SW4SWD-01_W01.2_Extreme_Programming.md')] },
      ],
    },
    {
      title: 'Design smells og SOLID',
      items: [
        { title: 'Design smells', description: 'Teknisk gæld, rigidity, fragility, viscosity, DRY og YAGNI.', lesson: 'uge 2', sources: [m('slides/SW4SWD-01_W02a_Design_Smells.md')] },
        { title: 'SRP og OCP', description: 'Én grund til at ændres; åben for udvidelse, lukket for ændring.', lesson: 'uge 2', sources: [m('slides/SW4SWD-01_W02b_SOLID_SRP_OCP.md')] },
        { title: 'LSP og Design by Contract', description: 'Substituerbarhed, pre/postconditions og invarianter.', lesson: 'uge 3', sources: [m('slides/SW4SWD-01_W03a_SOLID_LSP.md')] },
        { title: 'ISP og DIP', description: 'Små klientspecifikke interfaces; afhæng af abstraktioner.', lesson: 'uge 3', sources: [m('slides/SW4SWD-01_W03b_SOLID_ISP_DIP.md')] },
      ],
    },
    {
      title: 'Softwarearkitektur',
      items: [
        { title: 'Arkitekturproces', description: 'Architectural drivers, kvalitetsattributter (ISO 25010) og views.', lesson: 'uge 4', sources: [m('slides/SW4SWD-01_W04.1_Architecture_Process_1.md')] },
        { title: 'Arkitekturstile', description: 'Layers, client/server, N-tier, pipes-and-filters og message bus.', lesson: 'uge 4', sources: [m('slides/SW4SWD-01_W04.2_Architecture_Process_2.md')] },
        { title: 'VideoFlix-øvelsen', description: 'Key scenarios, kvalitetsattributter og kandidatløsninger.', lesson: 'uge 4', sources: [m('opgaver/SW4SWD-01_Architecture_Exercise_VideoFlix.md')] },
        { title: 'Arkitekturdokumentation', description: 'Viewpoints, C4-modellen og 4+1 view model.', lesson: 'uge 5', sources: [m('slides/SW4SWD-01_W05_Architecture_Documentation.md'), m('artikler/SW4SWD-01_C4_Model.md')] },
      ],
    },
    {
      title: 'Designmønstre, refactoring og DDD',
      items: [
        { title: 'Introduktion til design patterns', description: 'Alexander, GoF-kataloget, kategorier og anti-patterns.', lesson: 'uge 6', sources: [m('slides/SW4SWD-01_W06a_Design_Patterns_Intro.md')] },
        { title: 'Observer', description: 'Subject/Observer, push vs. pull og `IObserver<T>`/events i C#.', lesson: 'uge 6', sources: [m('slides/SW4SWD-01_W06b_GoF_Observer.md'), m('bog/SW4SWD-01_HFDP_Ch02_Observer.md')] },
        { title: 'Template Method og Strategy', description: 'Hollywood-princippet; arv vs. delegation.', lesson: 'uge 7', sources: [m('slides/SW4SWD-01_W07.1_GoF_Template_Method_Strategy.md')] },
        { title: 'Factory Method og Abstract Factory', description: 'Creational patterns med SRP/OCP/DIP som motivation.', lesson: 'uge 7', sources: [m('slides/SW4SWD-01_W07.2_GoF_Factory_Abstract_Factory.md')] },
        { title: 'State machines og State', description: 'Switch/case, tabel og GoF State.', lesson: 'uge 8', sources: [m('slides/SW4SWD-01_W08a_GoF_State.md'), m('bog/SW4SWD-01_HFDP_Ch10_State.md')] },
        { title: 'Nested og orthogonal states', description: 'Hierarkiske states via arv, entry/exit; State vs. Strategy.', lesson: 'uge 8', sources: [m('slides/SW4SWD-01_W08b_State_Nested_Orthogonal.md')] },
        { title: 'Refactoring', description: 'Code smells, Extract Method/Class, Replace Conditional with Polymorphism.', lesson: 'uge 9', sources: [m('slides/SW4SWD-01_W09.1_Refactoring.md')] },
        { title: 'Domain Driven Design', description: 'Ubiquitous language, bounded context, aggregates og value objects.', lesson: 'uge 9', sources: [m('slides/SW4SWD-01_W09.2_Domain_Driven_Design.md')] },
      ],
    },
    {
      title: 'Parallelitet og fejlhåndtering',
      items: [
        { title: 'Threading i C#', description: 'Thread, join, baggrundstråde, thread pool og Amdahl’s lov.', lesson: 'før uge 11', sources: [m('slides/SW4SWD-01_W10_Threading_in_CSharp.md')] },
        { title: 'Parallelle tasks', description: 'TPL, `Task.Run`, `Parallel.Invoke`, work-stealing og async/await.', lesson: 'uge 11', sources: [m('slides/SW4SWD-01_W11.1_Concurrency_Parallel_Tasks.md')] },
        { title: 'Parallelle loops', description: '`Parallel.For`/`ForEach`, partitionering og faldgruber.', lesson: 'uge 11', sources: [m('slides/SW4SWD-01_W11.2_Concurrency_Parallel_Loops.md')] },
        { title: 'Dependencies og futures', description: 'DAG, continuations, `Task<TResult>` og Barrier.', lesson: 'uge 12', sources: [m('slides/SW4SWD-01_W12.1_Concurrency_Dependencies_Futures.md')] },
        { title: 'Pipelines', description: 'Producer-consumer, `BlockingCollection`, flaskehalse og cancellation.', lesson: 'uge 12', sources: [m('slides/SW4SWD-01_W12.2_Concurrency_Pipelines.md')] },
        { title: 'Aggregation og MapReduce', description: 'Thread-local aggregering, Partitioner, MapReduce og PLINQ.', lesson: 'uge 13', sources: [m('slides/SW4SWD-01_W13.1_Concurrency_Aggregation_MapReduce.md')] },
        { title: 'Fejlhåndtering', description: 'Fault/error/failure, redundans, heartbeat og watchdog.', lesson: 'uge 13–14', sources: [m('slides/SW4SWD-01_W13.2_Error_Handling.md')] },
      ],
    },
  ],
}
