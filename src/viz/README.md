# Visualiseringer — forfatterguide

Hver visualisering er én `.tsx`-fil i `src/viz/<fag>/`, der eksporterer en `VizDef` som default.
Registret (`registry.ts`) finder filen automatisk; emnet i datafilen peger på `id`.
Reference-eksempler: `bad/middleware-pipeline.tsx` (noder + rejsende token) og
`bad/normalization.tsx` (tabeller der splittes).

## Kontrakten

```ts
const viz: VizDef = {
  id: 'normalization',                 // matcher topic.viz i datafilen
  title: 'Fra tavlens rå data til 3NF', // kort, konkret, uden kolon
  steps: [                              // trin 0 = udgangsbillede, sidste = slutramme
    { caption: 'Hvad der sker i dette beat …', hold: 2200 },
  ],
  Component: ({ step }) => …,           // ren funktion af step
}
export default viz
```

`Figure` (i `kit/`) står for alt omkring: start når figuren kommer i view, autoplay med
hvert trins `hold`, replay, trin-for-trin, piletaster og `prefers-reduced-motion`
(viser straks sidste trin). Komponenten skal kun tegne tilstanden for et givet `step`.

## Regler

1. **Bevægelsen skal forklare indholdet.** Hvis animationen stadig gav mening med
   lorem ipsum, handler den ikke om noget. Hvert trin viser ét beat i processen.
2. **Slutrammen kan læses i ro.** Sidste trin viser hele billedet: alle labels, alle
   resultater. Ingen information må kun findes midt i en animation.
3. **Rolig footprint.** Figuren må ikke hoppe i højden mellem trin. Reservér pladsen
   fra trin 0 (skjul med opacity, eller brug `tone="ghost"`), eller sæt `min-height`.
4. **Forfattet timing.** `hold` er læsetid for billedteksten plus animationen: ca.
   1400 ms for et kort beat, 2200–3000 ms for et vigtigt. Vigtige øjeblikke må ånde.
5. **Bevægelser fra `kit/motion.ts`** — `t.place` (lander med let overshoot),
   `t.settle` (rolig), `t.travel` (A → B), `t.launch` (afsæt med tilløb), `t.fade`.
   Ingen andre easing-kurver, ingen uendelige loops, ingen dekorative effekter.
6. **Ét visuelt sprog.** Brug primitiverne i `kit/primitives.tsx` (`Node`, `Link`
   (`vertical` for en lodret pil), `Token`/`Tag` (`wrap` for lange labels), `VTable`, `Swap`
   (varianter stablet i én celle, så højden er stabil)) og tonerne `idle | focus | muted | ok | neg | ghost`.
   Farver kun via CSS-variabler (`--accent`, `--ink-*`, `--rule*`, `--paper*`,
   `--neg`) — aldrig hex-værdier, så lys og mørk tilstand virker.
7. **Skrift.** Pladen bruger UI-fonten (IBM Plex Sans). Kode og identifikatorer i
   `<code>` eller `.mono`. Ingen versaler, ingen spærret tekst.
8. **Smal skærm.** Pladen er en container (`container-type: inline-size`). Brug
   `@container (max-width: 40rem)` til at stable layoutet lodret. Intet må flyde ud
   af pladen ved 320 px bredde; brede tabeller får `overflow-x: auto`.
9. **Indhold fra kilden.** Labels, eksempeldata og billedtekster kommer fra
   kursusmaterialet (`bad/context/…`). Billedteksten er dansk, kort, i nutid, og må
   bruge `kode`, **fed** og *kursiv*.
10. **Egen CSS** i en fil ved siden af (`<id>.css`) med et klassepræfiks, der er
    unikt for figuren.
