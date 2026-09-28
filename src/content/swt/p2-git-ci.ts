import type { Part } from '../types'
import { md } from './paths'

export const gitCi: Part = {
  id: 'git-ci',
  title: 'Versionsstyring og CI',
  topics: [
    {
      slug: 'git',
      title: 'Git: lokalt repository, remotes og pull–test–push',
      short: 'Git-grundlag',
      week: 'Uge 1 · 01.2',
      definition:
        'Git er et **distribueret** versionsstyringssystem: hver klient har en fuld klon af repositoriet med al historik, ikke kun seneste version. Git gemmer **snapshots**, ikke forskelle. En ændring går fra working directory over staging area til det lokale repository og deles med `push`; kurset kræver en **pull–test–push**-cyklus, så man aldrig pusher noget, der ikke er testet sammen med de andres kode.',
      concepts: [
        {
          term: 'Distribueret og snapshots',
          body: [
            'Fordele ved en distribueret VCS: versionskontrol, arbejde offline, skift til enhver tracked branch, og serveren kan genskabes fra en hvilken som helst arbejdskopi (med streng disciplin). Ulempen er pladsforbruget til alle versioner og branches.',
            'Systemer, der gemmer **forskelle**, genskaber filer fra deltaer, hvilket kan tage lang tid for gamle versioner. Git gemmer **snapshots** — mini-filsystemer — så alle versioner er tilgængelige med det samme.',
          ],
        },
        {
          term: 'Filtilstande og lokale operationer',
          body: [
            'Tre områder: **working directory**, **staging area** og **git directory** (repositoriet). En fil er *untracked* eller *tracked*; en tracked fil er *unmodified*, *modified* eller *staged*. `git add` stager, `git commit` gemmer snapshot i repositoriet.',
            'Slidene advarer om, at Visual Studios “Commit” og TortoiseGits “commit → master” slår stage og commit sammen i ét trin.',
          ],
        },
        {
          term: 'Pull–test–push',
          body: [
            'Kursets procedure: 1) kod, 2) skriv tests og kør dem, 3) ret koden, 4) commit, når alle tests består, 5) **pull** fra det fælles remote, 6) løs merge-konflikter, 7) **test igen** og ret, til alt består, 8) commit merges og ændringer, 9) **push**. 10) Har nogen pushet siden sidste pull, så start forfra fra pull.',
            'Pointen er trin 7: det er først efter pull, at din kode er integreret med de andres, og det er den kombination, der skal være grøn, før den deles. Samme cyklus går igen som proceduren for [[git-workflows|trunk-based workflow]].',
          ],
        },
        {
          term: 'Remotes, GitLab og .gitignore',
          body: [
            'Gruppen opretter en GitLab-gruppe og et repository pr. øvelse eller aflevering, helst med SSH-nøgler (`git@gitlab.au.dk:…`). Et nyt repo oprettes lokalt (create, add, commit) og publiceres til et remote (opret/find remote og push — i GUI’er ofte samlet som “publish”).',
            'Mellemfiler og build-output skal ikke i repositoriet: `*.suo`, `*.user`, `*.pdb`, `*.obj`, mapperne `bin`, `obj`, `Debug`, `Release`. En `.gitignore` i solution-mappen styrer det. Er den glemt ved første push, fjernes filerne fra versionsstyring med `git rm -r --cached .`, `git add .` og en commit.',
          ],
        },
      ],
      viz: 'git-states',
      keyPoints: [
        'Distribueret: hver klon har hele historikken.',
        'Snapshots, ikke forskelle.',
        'Working directory → staging area (`add`) → repository (`commit`) → remote (`push`).',
        'Pull–test–push: test igen *efter* pull, før du pusher.',
        '`.gitignore` i solution-mappen; `bin`, `obj`, `*.user`, `*.suo` hører ikke til i repoet.',
        '**Eksamen:** grundlaget for delspørgsmålet om git-workflow.',
      ],
      code: [
        {
          lang: 'bash',
          title: 'Glemt .gitignore ved første push',
          source: '01.2 · Hjælp - Jeg glemte en .gitignore',
          code: `# Kør i solution-mappen, efter .gitignore er lagt ind
git rm -r --cached .
git add .
git commit -m "Removed unnecessary tracking of files"`,
        },
      ],
      exam: [
        'Git er distribueret: hver udvikler har en fuld kopi af repositoriet med historik, og Git gemmer snapshots i stedet for forskelle.',
        'Vi arbejder efter pull–test–push: jeg committer lokalt, når testene er grønne, puller de andres ændringer, løser konflikter og kører testene igen, før jeg pusher. Så er det, der ligger på serveren, altid testet i integreret form.',
      ],
      sources: [
        { path: md('01.2-exceptions-git-workflow/05-GitWorkflow.pdf.md'), original: 'GitWorkflow.pdf', pages: 's. 2–16' },
        { path: md('01.2-exceptions-git-workflow/10-Hjaelp---Jeg-glemte-en-.gitignore-foerste-gang-jeg-pushede.md') },
        { path: md('01.2-exceptions-git-workflow/50-Git-Basics---Exercise.md'), original: 'Git Basics - Exercise.pdf' },
      ],
      gaps: [
        'Pro Git og GitMagic ligger i materialet, men er markeret som supplerende læsning, ikke pensum.',
        'GitWorkflow.pdf s. 16 udskyder merge-konflikter og branching til senere; de dækkes i [[merge-rebase|lektion 02.2]].',
      ],
      keywords: ['git', 'versionsstyring', 'version control', 'VCS', 'DVCS', 'distribueret', 'snapshot', 'working directory', 'staging area', 'index', 'commit', 'push', 'pull', 'clone', 'remote', 'origin', 'GitLab', '.gitignore', 'pull test push', 'SSH'],
    },

    {
      slug: 'ci',
      title: 'Continuous Integration med GitLab',
      short: 'Continuous Integration',
      week: 'Uge 2 · 02.1',
      definition:
        'Continuous Integration er en praksis, hvor teamets medlemmer integrerer deres arbejde ofte — mindst dagligt — og hver integration verificeres af et **automatiseret build med test**, så integrationsfejl opdages hurtigst muligt (Fowler, 2006). I kurset trigger et push til GitLab en pipeline, der er beskrevet i `.gitlab-ci.yml`, og en runner bygger og tester i et rent miljø.',
      concepts: [
        {
          term: 'Princippet',
          body: [
            'Udviklerne checker kode ind i et repository. CI-serveren henter koden, starter et build i build-værktøjet og får status tilbage. Er status rød, sendes en notifikation til udviklerne; resultatet rapporteres også til kunder, testere og teamledere.',
            'Agil udvikling leverer funktionelle tilvækster, der kan integreres løbende — det er CI.',
          ],
        },
        {
          term: 'Fordele',
          body: [
            'Intet “integration hell” i slutningen af projektet. Aldrig mere end timer fra et fungerende build. Hurtig feedback. Flere niveauer af builds (kontinuerlig, nightly). Målinger af kode- og testkvalitet er aldrig forældede. Et certificeret og kontrolleret afviklingsmiljø på CI-serveren.',
            'Build-serveren kan køre forskellige jobs: *fast integration* (build + grøn zone-tests) ved hvert push, og *nightly* (build + grøn zone + coverage + integrationstests + kodeinspektion + rapportering).',
          ],
        },
        {
          term: 'Et typisk CI-job',
          body: [
            'Fire trin: 1) pull projektet fra SCM-repositoriet (og branch), 2) byg fra bunden, 3) kør tests og/eller andre værktøjer, 4) publicér resultaterne. Trigger og tidsplan kan konfigureres.',
            'I GitLab: brugeren committer og pusher; git-serveren trigger CI-serveren; den beder en **runner** køre jobbet; runneren puller, bygger og kører testene og sender testresultaterne tilbage; CI-serveren viser testrapporten. Runneren henter et container-image med .NET SDK, fx fra Microsofts image-repository.',
          ],
        },
        {
          term: '.gitlab-ci.yml og testrapporten',
          body: [
            'Filen skal hedde `.gitlab-ci.yml` og ligge i solution-mappen sammen med `.sln` og `.git`. Den angiver image (`mcr.microsoft.com/dotnet/sdk:10.0` — skal passe til projektets .NET-version), et job `build-and-test` i stage `test`, scriptet `dotnet clean`, `dotnet build`, `dotnet test` med JUnit-logger, og `artifacts: reports: junit`, så GitLab kan vise hver test.',
            'Testprojektet skal have NuGet-pakken `JunitXml.TestLogger`, fordi GitLab læser JUnit-formatet, udover `NUnit`, `NUnit3TestAdapter` og `Microsoft.NET.Test.Sdk`. Med coverage kommer `coverlet.collector` og `ReportGenerator` til, se [[coverage|code coverage]].',
          ],
        },
        {
          term: 'Når pipelinen fejler',
          body: [
            'Øvelsen nævner fire årsager: fejl i `.gitlab-ci.yml`, compile-/build-fejl, fejl i afviklingen af testene, eller tests der kører men fejler. “Failed Jobs” viser hvad der gik galt; jobbets konsol-log er en terminaldump, der kan læses. Man får en mail, når noget fejler.',
            'Den første obligatoriske aflevering hedder **CI-kørekort** (deadline i uge 2–3). Kurset kører CI på GitLab i alle tre afleveringer.',
          ],
        },
      ],
      viz: 'gitlab-ci-run',
      keyPoints: [
        'Integrér ofte; hver integration verificeres af automatisk build + test.',
        'Push → trigger → runner: pull, clean, build, test → rapport tilbage.',
        '`.gitlab-ci.yml` i solution-mappen; image-versionen skal passe til .NET-versionen.',
        '`JunitXml.TestLogger` gør testene synlige i GitLab.',
        'Fejler pipelinen: script, build, testafvikling eller en rød test.',
        'Fast integration ved hvert push; tunge ting (coverage, integrationstests) evt. nightly.',
        '**Eksamen:** delspørgsmålet “beskriv CI: elementer, samspil, fordele” (F19re, S22, S22re).',
      ],
      code: [
        {
          lang: 'yaml',
          title: 'Pipeline-specifikationen',
          source: 'Continuous-Integration.pdf s. 12',
          code: `# See https://docs.gitlab.com/ee/ci/testing/unit_test_report_examples.html
image: mcr.microsoft.com/dotnet/sdk:10.0

build-and-test:
  stage: test
  variables:
    GIT_STRATEGY: clone
  script:
    - 'dotnet clean'
    - 'dotnet build'
    - 'dotnet test --logger:"junit;MethodFormat=Class;FailureBodyFormat=Verbose"'
  artifacts:
    when: always
    reports:
      junit:
        - ./**/TestResults.xml`,
        },
        {
          lang: 'bash',
          title: 'Loggeren tilføjes testprojektet',
          source: 'Continuous-Integration.pdf s. 11',
          code: `dotnet add package JunitXml.TestLogger`,
        },
      ],
      exam: [
        'Continuous Integration betyder, at vi integrerer ofte, og at hver integration verificeres af et automatisk build med tests, så integrationsfejl findes med det samme i stedet for i slutningen af projektet.',
        'I GitLab trigger et push en pipeline. Runneren henter et image med .NET SDK, puller koden, bygger fra bunden og kører testene, og JUnit-rapporten vises i GitLab. Fejler noget, får vi besked.',
        'Fordelen er hurtig feedback, at vi aldrig er langt fra et fungerende build, og at testene kører i et kontrolleret miljø og ikke bare på min egen maskine.',
      ],
      sources: [
        { path: md('02.1-continuous-integration/01-Continuous-Integration.md'), original: 'Continuous-Integration.pdf', pages: 's. 2–14' },
        { path: md('02.1-continuous-integration/50-GitLab-CI---Exercise.md'), original: 'GitLab CI - Exercise.pdf', pages: 's. 1–3' },
        { path: md('01.1-introduktion-unit-test/01-Introduction.pdf.md'), original: 'Introduction.pdf', pages: 's. 9', note: 'CI-kørekort som aflevering 1' },
      ],
      gaps: [
        'Der er ingen opgavetekst til aflevering 1 (“CI-kørekort”) i materialet — kun navnet og datoerne (Introduction.pdf s. 9).',
        'Pakkeversionerne på s. 11 (NUnit 3.13.3, `coverlet.collector` 3.1.2) er ældre end SDK-imaget `dotnet/sdk:10.0` på s. 12. Slidene siger kun, at imaget skal passe til projektets .NET-version.',
        'Eksamenssættet V22-23 forbyder at oprette et **Jenkins**-job; kurset bruger nu GitLab CI. Sættet er ældre end værktøjsskiftet.',
      ],
      keywords: ['CI', 'continuous integration', 'GitLab CI', 'pipeline', 'runner', '.gitlab-ci.yml', 'yaml', 'JUnit', 'JunitXml.TestLogger', 'dotnet test', 'build', 'nightly', 'integration hell', 'Fowler', 'CI-kørekort', 'aflevering 1', 'handin 1'],
    },

    {
      slug: 'git-workflows',
      title: 'Git workflows og merge requests',
      short: 'Git workflows',
      week: 'Uge 2 · 02.2',
      definition:
        'Et git workflow beskriver, hvordan Git bruges i en udviklingsproces. Kurset har to hovedformer: **trunk-based** (alle integrerer direkte på `main`) og **feature branch** (hver feature på sin egen kortlivede branch, der integreres via en **merge request** med code review og pipeline). GitHub flow, git-flow og GitLab flow er varianter af feature branch.',
      concepts: [
        {
          term: 'Generelle retningslinjer',
          body: [
            'Der findes ikke ét workflow, der passer alle. Det skal være simpelt og øge produktiviteten; branches skal være kortlivede og integreres ofte; det skal muliggøre code review og CI, minimere og forenkle reverts, og understøtte projektets releasemodel.',
          ],
        },
        {
          term: 'Trunk-based',
          body: [
            '`main` er den eneste offentlige branch. Man committer direkte til `main` eller bruger kortlivede, typisk lokale feature branches, og integrerer ved at merge `main` ind i sit lokale arbejde og pushe, hvis det er sundt. Proceduren er [[git|pull–test–push]]. “Probably what you have been doing so far!”',
          ],
        },
        {
          term: 'Feature branch og varianterne',
          body: [
            'Features ligger på kortlivede branches, der pushes til serveren for CI og code review, og integreres først, når de er færdige — så historikken ikke er fyldt med halve features. Integrationen sker via en merge/pull request.',
            '**GitHub flow**: små teams og web-apps med hyppige, små releases. `main` er altid deploybar; alle branches laves fra `main`; test alle branches, også efter at have merget `main` ind i featuren og før featuren merges til `main`. **Git-flow**: apps med flere planlagte releases; branches *develop*, *feature*, *release* og *hotfix*; features integreres kun i develop. **GitLab flow**: midt imellem; *feature* → *master* → *staging* → *production*, med automatiske tests ved staging.',
          ],
        },
        {
          term: 'GitHub flow trin for trin',
          body: [
            '1) pull seneste, 2) opret ny branch og checkout, 3) kod, 4) skriv tests og kør dem, 5) ret koden, 6) commit, når testene består, 7) **fetch main**, 8) **merge main ind i din branch**, 9) test igen, 10) commit, 11) push branchen, 12) opret merge request (eller merge selv til main og push), 13) slet branchen lokalt og remote — men **ikke** i aflevering 3, hvor historikken skal kunne ses.',
          ],
        },
        {
          term: 'Merge request i GitLab',
          body: [
            'Feature branchen pushes, og i GitLab oprettes en merge request mod `main`. Pipelinen kører på branchen og viser test og coverage; under *Changes* er linjer uden coverage markeret røde. En reviewer markerer linjer og kommenterer; tråden løses, koden rettes og pushes, pipelinen kører igen, og revieweren kan godkende. Så merges featuren ind i `main`.',
            'I kursets eksempel (mikrobølgeovnen, feature “Buzzer”) står coverage først på 97,50 %. Revieweren skriver “No coverage, but overload is not used either, why not delete?”; efter rettelsen er alle tråde løst og coverage 100,00 %.',
          ],
        },
        {
          term: 'Branch-navne og tags',
          body: [
            'Følg firmaets navnepolitik, fx `main` (trunk), `feature/XXX`, `release/YYY` og `user/ZZZ` (eksperimenter). Et **tag** er et bogmærke for en bestemt commit — til releases eller sidste grønne CI-build. I modsætning til en branch kan der ikke committes videre på et tag. `git tag -a <tag> -m "…"` laver et annoteret tag; `git push origin --tags` pusher dem.',
          ],
        },
        {
          term: 'Aflevering 3',
          body: [
            'Mikrobølgeovnen skal udvides med nye features (obligatorisk: en buzzer, konfigurerbar effekt på power tube, ændring af tilberedningstid under tilberedning) i et **obligatorisk workflow**: én feature branch pr. feature, arbejde parallelt, merge ofte fra `main` (fetch først), commit ofte, og til sidst fetch og merge eller rebase fra `main`, test, commit, merge request og code review. Feature branches må ikke slettes.',
          ],
        },
      ],
      viz: 'merge-request',
      keyPoints: [
        'Trunk-based: alle på `main`, pull–test–push.',
        'Feature branch: kortlivet branch → push → merge request → review + pipeline → merge.',
        'Merge `main` ind i featuren og test, *før* featuren merges til `main`.',
        'GitHub flow (main altid deploybar) · git-flow (develop, release, hotfix) · GitLab flow (staging, production).',
        'MR-pipelinen viser test og coverage; udækkede linjer er røde i *Changes*.',
        'Tag = bogmærke for én commit, fx en release.',
        '**Eksamen:** delspørgsmålet om git-workflow og branching-strategi (S22 delopgave 8, V22-23 delopgave 9).',
      ],
      code: [
        {
          lang: 'bash',
          title: 'Feature branch: opret, commit, del',
          source: 'Git-Workflows.pdf s. 24',
          code: `git checkout -b feature/myfeature
git push -u origin feature/myfeature

git commit      # gentag lokalt
git commit

git push        # del til CI og code review`,
        },
      ],
      exam: [
        'Vi bruger et feature branch workflow: hver feature får sin egen kortlivede branch. Før den integreres, fetcher jeg `main`, merger den ind i branchen og kører testene. Så pusher jeg og opretter en merge request.',
        'På merge requesten kører pipelinen med test og coverage, og en anden i teamet laver code review. Først når tråde er løst, pipelinen er grøn og requesten godkendt, merges featuren ind i `main`.',
        'Fordelen er, at `main` altid er stabil, at flere kan arbejde parallelt, og at historikken viser hver feature samlet og kan spores.',
      ],
      sources: [
        { path: md('02.2-git-workflow/02-Git-Workflows.md'), original: 'Git-Workflows.pdf', pages: 's. 3–25' },
        { path: md('02.2-git-workflow/04-GitLab-Merge-Request-Example.md'), original: 'GitWorkflow-GitlabMergeRequestExample.pdf', pages: 's. 2–8' },
        { path: md('10.1-10.2-hand-in-3/01-SWT-IntroductionHandin3.md'), original: 'SWT-IntroductionHandin3.pdf', pages: 's. 5–9' },
      ],
      gaps: [
        'Slidene kalder trunk-based og feature branch “two main workflows”, men viser trunk-based med kortlivede lokale feature branches — grænsen er flydende i materialet.',
        'Introduction.pdf s. 7 har lektionerne “Git Workflow 2 – branches og releases” i uge 10; lektionsplanen på Brightspace har “Intro Handin 3” der. De to planer er ikke ens.',
      ],
      keywords: ['git workflow', 'trunk-based', 'feature branch', 'GitHub flow', 'git-flow', 'GitLab flow', 'merge request', 'pull request', 'code review', 'branch', 'tag', 'release', 'hotfix', 'develop', 'aflevering 3', 'handin 3', 'buzzer'],
    },

    {
      slug: 'merge-rebase',
      title: 'Fetch, pull, merge og rebase',
      short: 'Merge og rebase',
      week: 'Uge 2 · 02.2',
      definition:
        '`git fetch` henter remote-ændringer ind i de lokale *remote tracking branches* (fx `origin/main`) uden at røre dit arbejde. `git pull` er `fetch` + `merge`. **Merge** samler to branches — med en merge-commit eller som *fast-forward* — og bevarer historikken. **Rebase** flytter dine commits oven på den anden branch og skriver historikken om til en lineær linje.',
      concepts: [
        {
          term: 'Remote tracking branches',
          body: [
            'Et remote er et lokalt navn for en adresse; klon laver automatisk `origin`. Lokalt holder Git en reference til remote-branchens tilstand (`origin/main`) og opdaterer den ved netværkskommunikation. `git log main..origin/main` viser, hvad der er kommet på serveren.',
          ],
        },
        {
          term: 'Push afvises, hvis du er bagud',
          body: [
            'Er din branch bagud i forhold til remote, afviser Git dit push (`non-fast-forward`): “Integrate the remote changes (e.g. `git pull …`) before pushing again.” Løsningen er pull, som laver merge-commit `M` med både dine og de andres commits, og så push.',
          ],
        },
        {
          term: 'Merge-strategier',
          body: [
            '**Fast-forward** (standard) er kun mulig, når der ikke er divergens: `main` flyttes bare frem til featurens sidste commit, uden merge-commit. **No fast-forward** (`--no-ff`) laver altid en merge-commit. **Squash merge** samler alle featurens commits til én commit `S` på `main` — så `main` viser én commit, ikke alle 17 små.',
            'Opstår en konflikt, skal den løses, og resultatet bliver en separat merge-commit.',
          ],
        },
        {
          term: 'Rebase — kun til øvede',
          body: [
            'Rebase lægger den aktuelle branchs commits til side, fast-forwarder til den anden branch og lægger dem på igen som *nye* commits (`F′`, `G′`). Det giver en ren historik uden merge-commits, men konflikter skal stadig løses, og de gamle commits forsvinder.',
            '**Den gyldne regel**: rebase aldrig en branch, der er publiceret — medmindre man tør og ved, hvordan man force-pusher (`--force-with-lease`). `git pull --rebase` får pull til at rebase i stedet for at merge.',
          ],
        },
        {
          term: 'Hvornår hvad',
          body: [
            'Merge er ikke-destruktiv, bevarer historik og sporbarhed, gør revert lettere, men kan give mange merge-commits. Bruges typisk, når en feature integreres i `main`. Rebase er destruktiv, giver lineær historik, men ingen branch-historik og sværere revert. Bruges typisk til gentagne gange at hente `main` ind i en feature branch og til at rydde op i en lokal branch (`git rebase -i`).',
            'Kursets anbefaling: **rebase, når feature branchen opdateres; merge, når `main` opdateres.** `git cherry-pick` tager enkelte commits, fx over på en release branch.',
          ],
        },
      ],
      viz: 'merge-rebase',
      keyPoints: [
        '`fetch` opdaterer `origin/main`, ikke dit arbejde.',
        '`pull` = `fetch` + `merge`.',
        'Push afvises, hvis du er bagud: pull (og test) først.',
        'Fast-forward (ingen merge-commit), `--no-ff` (altid merge-commit), `--squash` (én commit).',
        'Rebase skriver historik om; aldrig på publicerede branches.',
        'Rebase ved opdatering af feature; merge ved opdatering af `main`.',
        '**Eksamen:** “hvordan vil du vha. Git få integreret mellem branches?” (S22 delopgave 8).',
      ],
      code: [
        {
          lang: 'bash',
          title: 'Hent main ind i featuren, integrér featuren i main',
          source: 'Git-Workflows.pdf s. 29, 35, 39',
          code: `# Se hvad der er kommet på serveren
git fetch origin main
git log main..origin/main

# Opdatér featuren (rebase)
git checkout feature/delta
git rebase main

# Integrér featuren (merge)
git checkout main
git merge feature/delta`,
        },
      ],
      exam: [
        '`git pull` er `fetch` plus `merge`. Fetch opdaterer kun min kopi af remote-branchen; merge samler den med mit arbejde.',
        'Merge bevarer historikken og laver en merge-commit, hvis branches er divergeret; ellers kan det blive en fast-forward. Rebase flytter mine commits oven på `main` og giver en lineær historik, men skriver historik om, så man må aldrig rebase en publiceret branch.',
        'Kurset anbefaler rebase, når feature branchen opdateres med `main`, og merge, når featuren integreres i `main`.',
      ],
      sources: [
        { path: md('02.2-git-workflow/02-Git-Workflows.md'), original: 'Git-Workflows.pdf', pages: 's. 26–42' },
        { path: md('02.2-git-workflow/50-demo-af-git-og-brug-af-branches-transskription.md'), note: 'Transskription af demo-video' },
      ],
      gaps: [
        'Slide 36 skriver, at fast-forward kun er muligt “if no merge conflicts”. Uden for materialet: fast-forward kræver, at `main` ikke har fået nye commits siden forgreningen — det handler om divergens, ikke konflikter.',
        'Squash-slidet (s. 37) viser ikke, hvad der sker med feature branchen bagefter.',
      ],
      keywords: ['git fetch', 'git pull', 'git push', 'git merge', 'git rebase', 'fast-forward', 'no-ff', 'squash', 'merge commit', 'origin/main', 'remote tracking branch', 'non-fast-forward', 'force-with-lease', 'cherry-pick', 'interactive rebase', 'merge conflict', 'merge-konflikt'],
    },
  ],
}
