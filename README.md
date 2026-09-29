# Opslagsværk — softwareteknologi, AU

Visuelt opslagsværk til eksamenslæsning. 4. semester: BAD, FED, SWT, SWD. 3. semester:
SYS, KNP, DOA. 2. semester: OOP, PLA, STS. 1. semester: OPRG, IDE, MSYS, LMEK. Plus en generisk projektguide. Fagene grupperes
efter `semester` i datafilen. Materialet til 1.–3. semester ligger i `context/` (1. semester i `context/sem1/`). BAD (27 emner), FED
(30 emner i to spor: MAUI og web), SWT (25 emner), SWD (30 emner), SYS (31 emner), DOA (27 emner) og projektguiden (28 emner) er fuldt udfyldt med
figur, forklaring, kode, eksamenssætninger og kildehenvisninger. De øvrige fag har en stub
med læringsmål og eksamensform.

## Start

```bash
npm install
npm run dev
```

Åbn den adresse, Vite skriver (typisk http://localhost:5173).
`npm run build` bygger en statisk udgave til `dist/`, og `npm run preview` serverer den.

Genveje: `Ctrl K` / `⌘ K` eller `/` søger på tværs af alle fag. `←` / `→` skifter emne.
Når en figur har fokus, går `←` / `→` trin for trin i stedet.

## Struktur

```
src/
  content/            Indhold. Én datafil (eller mappe) pr. fag.
    types.ts          Datamodellen: Course → Part → Topic → Concept
    index.ts          Registret over fag
    bad/ fed/ swt/ swd/  De udfyldte fag: index.ts + én fil pr. del
  viz/
    kit/              Figur-rammen (autoplay, replay, trin, reduced motion) og primitiver
    bad/ fed/ swt/ swd/  Fagenes visualiseringer, én .tsx + .css pr. figur
    README.md         Forfatterguide til nye figurer
  components/         Layout og sider. Læser kun datamodellen.
  styles/             Tokens (typeskala, farver, grid), layout, kode, figurer
```

Indhold og layout er adskilt: komponenterne kender kun typerne i `content/types.ts`.

## Tilføj indhold til et nyt fag

Eksempel: SWT skal udfyldes (FED og BAD er gjort sådan).

1. **Gør faget klar.** I `src/content/swt.ts` sættes `status: 'ready'`, og `outline`
   erstattes af `parts`. Det letteste er at kopiere strukturen fra `src/content/bad/`:
   en mappe `src/content/swt/` med `index.ts` og én fil pr. del, og så ændre importen i
   `src/content/index.ts` til `./swt/index`.
2. **Skriv emnerne.** Hvert `Topic` har `definition`, `concepts` (forklaringen),
   `keyPoints`, evt. `code`, `exam` (sætninger man kan sige højt), `sources` (sti
   relativ til sem4-mappen og evt. slidenumre) og `gaps` (det materialet ikke dækker).
   Tekst må bruge `` `kode` ``, `**fed**`, `*kursiv*` og `[[slug|link til andet emne]]`.
3. **Lav figurer.** Opret `src/viz/swt/<id>.tsx` (+ `.css`), der eksporterer en
   `VizDef`, og sæt `viz: '<id>'` på emnet. Registret finder filen selv. Følg
   `src/viz/README.md`.
4. **Accentfarven** findes allerede (`--fed`, `--swt`, `--swd` i `styles/tokens.css`).

Et helt nyt fag: lav datafilen, tilføj den i `courses` i `src/content/index.ts`,
tilføj `CourseId` i `types.ts` og en accentfarve i `tokens.css`. Layoutet skal ikke røres.

## Værktøjer og prompter

- `scripts/qa-figurer.cjs` — headless QA af et fags figurer: klikker alle trin igennem,
  melder ustabil højde, vandret overløb og konsolfejl, og gemmer slutrammer som billeder.
  `QA_URL=http://localhost:5173 node scripts/qa-figurer.cjs bad 1440,1280,375 /tmp/qa`
- `scripts/sideindeks.py` — finder slidenumre i originalernes PDF/PPTX (læser kun).
- `prompts/` — færdige prompter til at udfylde de resterende fag. Rækkefølge og brug i
  `prompts/README.md`; fælles regler og erfaringer fra BAD i `faelles.md`.

## Principper

- Indholdet bygger på kursusmaterialet i `../bad/context/` m.fl., ikke på generel viden.
  Hvor materialet er tavst eller modsiger sig selv, står det under “Huller i materialet”.
- Figurer starter når de kommer i view, har forfattet timing, ender på en læsbar
  slutramme og kan afspilles igen eller gås igennem trin for trin. Med
  `prefers-reduced-motion` vises slutrammen direkte.
- “Jeg kan forklare det”-markeringer gemmes kun lokalt i browseren.
