import { createHighlighterCore, createCssVariablesTheme, type HighlighterCore, type LanguageInput } from 'shiki/core'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

/* Én highlighter, indlæst ved første kodeblok. Farverne er CSS-variabler
   (--code-token-*), så lys/mørk skifter uden at farve koden igen. */

const theme = createCssVariablesTheme({ name: 'opslag', variablePrefix: '--code-', fontStyle: true })

let promise: Promise<HighlighterCore> | null = null

export function getHighlighter(): Promise<HighlighterCore> {
  promise ??= createHighlighterCore({
    themes: [theme],
    langs: [
      import('shiki/langs/csharp.mjs'),
      import('shiki/langs/sql.mjs'),
      import('shiki/langs/json.mjs'),
      import('shiki/langs/yaml.mjs'),
      import('shiki/langs/bash.mjs'),
      import('shiki/langs/dockerfile.mjs'),
      import('shiki/langs/javascript.mjs'),
      import('shiki/langs/graphql.mjs'),
      import('shiki/langs/xml.mjs'),
      import('shiki/langs/http.mjs'),
      import('shiki/langs/html.mjs'),
      import('shiki/langs/css.mjs'),
      import('shiki/langs/typescript.mjs'),
      import('shiki/langs/jsx.mjs'),
      import('shiki/langs/tsx.mjs'),
    ],
    engine: createJavaScriptRegexEngine(),
  })
  return promise
}

/* Sjældne sprog (de tidligere semestre, Gherkin i SWT) hentes først, når en
   kodeblok bruger dem. C++-grammatikken alene er ca. 800 kB. */
const lazyLangs: Record<string, LanguageInput> = {
  cpp: () => import('shiki/langs/cpp.mjs'),
  c: () => import('shiki/langs/c.mjs'),
  python: () => import('shiki/langs/python.mjs'),
  gherkin: () => import('shiki/langs/gherkin.mjs'),
  cmake: () => import('shiki/langs/cmake.mjs'),
  makefile: () => import('shiki/langs/makefile.mjs'),
}

export async function getHighlighterFor(lang: string): Promise<HighlighterCore> {
  const h = await getHighlighter()
  const load = lazyLangs[lang]
  if (load && !h.getLoadedLanguages().includes(lang)) {
    await h.loadLanguage(load)
  }
  return h
}

export const THEME_NAME = 'opslag'
