import type { Course } from '../types'
import { md } from './paths'
import { unitTest } from './p1-unit-test'
import { gitCi } from './p2-git-ci'
import { testbartDesign } from './p3-testbart-design'
import { testkvalitet } from './p4-testkvalitet'
import { softwarekvalitet } from './p5-softwarekvalitet'
import { integration } from './p6-integration'

export const swt: Course = {
  id: 'swt',
  code: 'SW4SWT-01',
  name: 'Softwaretest',
  short: 'SWT',
  semester: 4,
  status: 'ready',
  intro:
    'Faget skal sætte dig i stand til at kvalitetssikre din egen programkode og større systemer, som udvikles af flere udviklere. Det følger V-modellens højre ben: unit test med NUnit og NSubstitute, testbart design, testkvalitet, versionsstyring og CI på GitLab, integrationstest og automatiseret system- og accepttest.',
  introSource: md('01.1-introduktion-unit-test/01-Introduction.pdf.md'),
  exam: {
    form: '24-timers individuel skriftlig opgave (PDF-journal + kode som GitLab-release i zip), derefter 20 min mundtlig eksamen med ekstern censur. 7-trinsskalaen.',
    quote:
      'Eksamen i faget er en 24-timers skriftlig opgave, efterfulgt af en mundtlig eksamen af 20 minutters varighed med ekstern censur. Præstationen vurderes efter 7-trinsskalaen.',
    quoteSource: md('eksamensinformation/02-Detajleret-beskrivelse-af-eksamen.md'),
    points: [
      '**Forløb:** ca. 5 min hvor eksaminator og censor læser journal og kode, **lodtrækning** om et af delspørgsmålene, **3–4 min egen fremlæggelse** af det trukne delspørgsmål (med journal og kode på projektoren), **6–7 min uddybende spørgsmål** — til dette og andre delspørgsmål, til koden og “ikke mindst din testkode” — og ca. 5 min votering og karakter. Det mundtlige vægter mest. (Instruktion-F2025.pdf s. 1–2)',
      '**Forudsætning:** alle tre obligatoriske gruppeafleveringer skal være godkendt: [[ci|CI-kørekort]], Ladeskabet ([[design-for-testability|testbart design]], [[events|events]], [[coverage|coverage]]) og mikrobølgeovnen ([[git-workflows|feature branches og merge requests]], [[integrationsplan|dependency tree og integrationsplan]]). Afleveringerne bedømmes ikke, men du må gerne bruge dem som eksempler til eksamen.',
      '**Sættene følger et fast mønster** (F19re, E19, S22, S22re, V22-23): et system med use cases, designskitse og sekvensdiagrammer, og så 9–11 delopgaver. Delopgave 1–4 er ens i alle fem sæt; resten skifter.',
      '**Delopgave 1 — testbart design** (UML-klassediagram i korrekt notation; “redegør for, hvad der gør dit design testbart”): [[design-for-testability|design for testability]], [[events|events]], [[state-machines|tilstandsmaskiner]].',
      '**Delopgave 2 — implementering** med interfaces til afhængighederne: [[design-for-testability|III]], [[exceptions|exceptions]], [[events|events]].',
      '**Delopgave 3 — unit tests og testsuitens opbygning** (“hvilke slags test har du lavet?”): [[unit-test|NUnit og AAA]], [[assertions|assertions]], [[stub-mock|state- vs. interaktionsbaseret]], [[zombie|ZOMBIE]].',
      '**Delopgave 4 — hvor har du draget nytte af det testbare design?**: [[design-for-testability|design for testability]], [[nsubstitute|NSubstitute]].',
      '**Coverage** (E19, S22, S22re, V22-23; “hvordan har du suppleret coverage for at finde de nødvendige og tilstrækkelige test cases?”): [[coverage|coverage]], [[ep-bva|EP og BVA]], [[zombie|ZOMBIE]].',
      '**Isolation framework, fordele og ulemper** (F19re, E19, S22, S22re): [[nsubstitute|NSubstitute]], [[stub-mock|stub og mock]].',
      '**Black box og white box i dine tests** (S22, S22re, V22-23): [[black-white-box|black og white box]]. **Adfærds- vs. tilstandsbaseret test** (F19re): [[stub-mock|testtyper]]. **BVA** (F19re): [[ep-bva|EP og BVA]]. **Test af log-fil** (F19re): [[design-for-testability|usynlige afhængigheder]].',
      '**Softwarekvalitet:** software quality metrics — cyklomatisk kompleksitet og maintainability index (E19), “hvad er statisk analyse? 5 linjer” (S22re), “hvad er dynamisk analyse? 5 linjer” (V22-23): [[statisk-analyse|statisk analyse]], [[dynamisk-analyse|dynamisk analyse]].',
      '**Integration:** dependency tree og integrationsplan (E19, F19re): [[integrationstest|dependency tree]], [[integrationsmoenstre|mønstre]], [[integrationsplan|plan]]. “Forskellen mellem unit test og integrationstest? 5 linjer” (V22-23): [[integrationstest|integrationstest]].',
      '**Proces:** git-workflow og branching-strategi (S22, V22-23): [[git-workflows|workflows]], [[merge-rebase|merge og rebase]]. Continuous Integration — “elementer, samspil og fordele” (F19re, S22, S22re): [[ci|CI]].',
      '**Brug opgaven til at komme rundt i pensum.** Eksaminationen starter i det trukne delspørgsmål, men er ikke begrænset til det: “vi kommer også rundt til de andre spørgsmål, og evt. også andre dele af pensum”. Samarbejde om 24-timersopgaven er eksamenssnyd, og koden må ikke ligge i et offentligt repository.',
    ],
  },
  goalsSource: md('01.1-introduktion-unit-test/01-Introduction.pdf.md'),
  goals: [
    { text: 'Anvende et unit test framework til kvalitetssikring af programkode.', topics: ['unit-test', 'assertions', 'exceptions'] },
    { text: 'Identificere afhængigheder i software og anvende designteknikker til at reducere disse.', topics: ['design-for-testability', 'events', 'black-white-box'] },
    { text: 'Beskrive og anvende et isolation framework til isolering af programenheder.', topics: ['stub-mock', 'nsubstitute', 'state-machines'] },
    { text: 'Beskrive, sammenligne og anvende udvalgte typer af code coverage til kvalitetssikring af tests.', topics: ['coverage'] },
    { text: 'Foretage grænseværdianalyse til kvalitetssikring af tests.', topics: ['ep-bva', 'zombie'] },
    { text: 'Anvende udvalgte værktøjer til kvalitetssikring af programkode og tests.', topics: ['statisk-analyse', 'dynamisk-analyse', 'coverage'] },
    { text: 'Anvende versionsstyringsværktøjer til versionskontrol og sikring af programkode.', topics: ['git', 'merge-rebase'] },
    { text: 'Beskrive anvendelsen af versionsstyringsværktøjer i en moderne udviklingsproces.', topics: ['git-workflows', 'merge-rebase'] },
    { text: 'Beskrive en Continuous Integration proces.', topics: ['ci', 'agil-integration'] },
    { text: 'Anvende et Continuous Integration værktøj til automatisk build, test og integration af programkode.', topics: ['ci', 'coverage'] },
    { text: 'Beskrive, planlægge og udføre integrationstest.', topics: ['integrationstest', 'integrationsmoenstre', 'integrationsplan', 'agil-integration'] },
    { text: 'Beskrive og anvende værktøjer til specifikation og gennemførelse af system- og accepttest.', topics: ['softwaretest', 'systemtest', 'gherkin'] },
  ],
  gaps: [
    'ECTS-point er ikke angivet noget sted i materialet.',
    'Lektionsplanen på Brightspace har efterårsdatoer (uge 35–49), mens intro-slides og afleveringsdatoer er fra foråret 2026 (Introduction.pdf s. 9). I uge 10 har planerne forskelligt indhold: “Intro Handin 3” mod “Git Workflow 2 – branches og releases, CI”.',
    'Noten om hold og afleveringer (januar 2023) siger, at den mundtlige eksamen varer **30 minutter**; eksamensinstruktionen (F2025) siger 20 minutter inkl. votering. Instruktionen er den gældende (“Det er den, der gælder”).',
    'Der er ingen opgavetekst til aflevering 1 (CI-kørekort), og kravspecifikationerne til Ladeskabet og mikrobølgeovnen ligger på GitLab, ikke i materialet — kun introduktions-slides og diagrammer.',
    'Faget har ingen lærebog. Osherove, *The Art of Unit Testing* (2. udg., C#), er foreslået som supplerende læsning, og flere slides henviser til den (“TAOUT”), men den er ikke i materialet. Binder kap. 13 er det eneste bogudsnit.',
    'De gamle eksamenssæt er fra 2019–2023 og nævner Jenkins og Digital Eksamen; kurset bruger nu GitLab CI og WiseFlow.',
  ],
  parts: [unitTest, gitCi, testbartDesign, testkvalitet, softwarekvalitet, integration],
}
