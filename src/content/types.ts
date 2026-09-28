/* Indholdsmodellen. Et fag er én datafil, der eksporterer et `Course`.
   Layout og komponenter læser kun disse typer. */

export type CourseId = 'bad' | 'fed' | 'swt' | 'swd' | 'oop' | 'pla' | 'sts' | 'doa' | 'knp' | 'sys' | 'projekt'

/** Henvisning til kursusmaterialet. `path` er relativ til sem4-mappen. */
export interface SourceRef {
  path: string
  /** Slide- eller sidenumre i originalen, fx "s. 12–15". */
  pages?: string
  /** Den oprindelige fil (PDF/PPTX), hvis `path` er en markdown-konvertering. */
  original?: string
  note?: string
}

export interface CodeSample {
  lang: 'csharp' | 'sql' | 'json' | 'yaml' | 'bash' | 'dockerfile' | 'javascript' | 'graphql' | 'xml' | 'http' | 'html' | 'css' | 'typescript' | 'jsx' | 'tsx' | 'cpp' | 'c' | 'python' | 'gherkin' | 'text'
  title?: string
  code: string
  /** Kort kildehenvisning vist under koden. */
  source?: string
}

/** Et begreb inde i et emne. Vises som afsnit i forklaringen og er søgbart. */
export interface Concept {
  term: string
  /** Afsnit. Understøtter `kode`, **fed**, *kursiv* og [[slug|tekst]]-links. */
  body: string[]
}

export interface Topic {
  slug: string
  title: string
  /** Kort titel til navigation, hvis titlen er lang. */
  short?: string
  week: string
  /** Kort definition — emnets lede. */
  definition: string
  /** Indledende forklaring før begreberne. */
  intro?: string[]
  concepts: Concept[]
  /** Id i viz-registret for emnets visualisering. */
  viz?: string
  keyPoints: string[]
  code?: CodeSample[]
  /** "Det skal du kunne sige til eksamen" — sætninger man kan sige højt. */
  exam: string[]
  sources: SourceRef[]
  /** Ting materialet ikke dækker eller er uklart om. Vises tydeligt. */
  gaps?: string[]
  /** Ekstra søgeord (synonymer, forkortelser). */
  keywords?: string[]
}

export interface Part {
  id: string
  title: string
  topics: Topic[]
}

/** Emne i en emneoversigt for et fag, der endnu ikke er udfyldt. */
export interface OutlineItem {
  title: string
  description: string
  lesson: string
  sources: string[]
}

export interface OutlineGroup {
  title: string
  items: OutlineItem[]
}

export interface ExamInfo {
  form: string
  /** Direkte citat fra kursusmaterialet, hvis det findes. */
  quote?: string
  quoteSource?: string
  points: string[]
}

export interface Course {
  id: CourseId
  code: string
  name: string
  /** Kort navn i navigation. */
  short: string
  ects?: string
  /** Semester faget hører til. Udeladt = på tværs af semestre (fx projektguiden). */
  semester?: number
  status: 'ready' | 'soon'
  /** Et par sætninger om hvad faget handler om, fra kursusbeskrivelsen. */
  intro?: string
  introSource?: string
  exam: ExamInfo
  goals: { text: string; topics?: string[] }[]
  goalsSource?: string
  /** Fuldt udfyldt fag. */
  parts?: Part[]
  /** Emneoversigt for fag, der kommer senere. */
  outline?: OutlineGroup[]
  /** Huller i materialet på fagniveau. */
  gaps?: string[]
}
