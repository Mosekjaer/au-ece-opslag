import type { Course } from '../types'
import { fundament } from './p1-fundament'
import { databaser } from './p2-databaser'
import { webapi } from './p3-webapi'
import { drift } from './p4-drift'
import { udOverRest } from './p5-ud-over-rest'

export const bad: Course = {
  id: 'bad',
  code: 'SW4BAD-01',
  name: 'Back-end udvikling og databaser',
  short: 'BAD',
  semester: 4,
  ects: '10 ECTS',
  status: 'ready',
  intro:
    'Backend = servere + API + databaser. Faget lærer dig at bygge et Web API i .NET, der gemmer data i en relationel eller dokumentbaseret database, og at køre det i containere. Hovedfokus er REST; GraphQL introduceres.',
  introSource: 'bad/context/00-kursus/kursusbeskrivelse.md',
  exam: {
    form: 'Løbende bedømmelse: 4 afleveringer med “check”, bestået/ikke bestået, ingen censur.',
    quote:
      'Løbende evaluering. Samlet vurdering af 4–6 afleverede opgaver og mundtlige oplæg/diskussion, målt mod kvalifikationsbeskrivelsen.',
    quoteSource: 'bad/context/00-kursus/kursusbeskrivelse.md',
    points: [
      'Fire afleveringer: to individuelle og to i grupper. Alle skal bestås. En dumpet aflevering kan genafleveres, men skal være godkendt senest 14 dage efter deadline.',
      'Hver aflevering har et **check**: en uformel samtale, hvor løsningen kører på din egen maskine, du pitcher hvad du har lavet, og du diskuterer dine valg.',
      'I gruppeafleveringer skal du kunne forklare **al** koden — også det, en anden har skrevet.',
      'Ingen reeksamen: dumper man, løser man de nye afleveringer næste gang faget udbydes.',
      'Afleveringerne bygger oven på hinanden: Docker (1), ER-model og SQL-skema for MovieVault (2), et Web API med EF Core, Serilog og MongoDB-logs (3). Aflevering 4 ligger ikke i materialet endnu.',
    ],
  },
  goalsSource: 'bad/context/00-kursus/kursusbeskrivelse.md',
  goals: [
    { text: 'Konstruere og implementere et WebAPI som omfatter persistering af data i en database.', topics: ['aspnet-pipeline', 'rest', 'ef-core', 'sql-fra-csharp'] },
    { text: 'Anvende container-teknologier til at deploye applikationer til produktionsmiljøer.', topics: ['docker', 'https-deployment'] },
    { text: 'Anvende bruger-autentifikation og -autorisation.', topics: ['auth', 'jwt'] },
    { text: 'Anvende software-biblioteker til to-vejs kommunikation over WebSocket-protokollen.', topics: ['signalr'] },
    { text: 'Sammenfatte metoder til udvælgelse og modellering af en konkret databaseteknik.', topics: ['er-model', 'relational-mapping', 'mongodb'] },
    { text: 'Sammenligne datastrukturer i databaser med datastrukturer i applikationer.', topics: ['ef-core', 'mongodb', 'di-levetider'] },
    { text: 'Anvende standard netværksteknologier til at give netværksadgang til en database.', topics: ['sql-fra-csharp', 'docker'] },
    { text: 'Analysere teknikker til at sikre korrekte data samt ansvarsdeling mellem database og applikation.', topics: ['noegler', 'normalisering', 'transaktioner', 'model-binding'] },
    { text: 'Anvende forskellige typer databaser i applikationsudvikling.', topics: ['sql', 'mongodb'] },
    { text: 'Beskrive de mest almindelige databasefagudtryk.', topics: ['noegler', 'sql', 'normalisering'] },
  ],
  gaps: [
    'Lektionsplanens lektion “Stored procedures + indexing” (uge 3) har ingen slides. Stored procedures er dækket via EF Core- og Dapper-slides; indekser er ikke.',
    'Aflevering 4 findes ikke i mappen endnu; kun aflevering 1–3.',
    'Kursusbeskrivelsen nævner gRPC, men materialet dækker det kun med én linje.',
    'Velkomst-slides nævner DMaD-bogen og en MongoDB-bog; ingen af dem ligger i materialet. Lærebogen *Building Web APIs with ASP.NET Core* gør.',
  ],
  parts: [fundament, databaser, webapi, drift, udOverRest],
}
