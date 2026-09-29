import { useEffect, useState } from 'react'
import type { CodeSample } from '../content/types'

const LANG_LABEL: Record<CodeSample['lang'], string> = {
  csharp: 'C#',
  sql: 'SQL',
  json: 'JSON',
  yaml: 'YAML',
  bash: 'Shell',
  dockerfile: 'Dockerfile',
  javascript: 'JavaScript',
  graphql: 'GraphQL',
  xml: 'XML',
  http: 'HTTP',
  html: 'HTML',
  css: 'CSS',
  typescript: 'TypeScript',
  jsx: 'JSX',
  tsx: 'TSX',
  cpp: 'C++',
  c: 'C',
  python: 'Python',
  gherkin: 'Gherkin',
  cmake: 'CMake',
  makefile: 'Makefile',
  text: 'Tekst',
}

/* Koden vises straks som ren tekst i samme skrift og linjehøjde,
   så farvelægningen ikke flytter noget, når den lander. */
export function CodeBlock({ sample }: { sample: CodeSample }) {
  const code = sample.code.replace(/\n+$/, '')
  const [html, setHtml] = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    if (sample.lang === 'text') return
    // Highlighteren (Shiki) er stor og hentes først, når der er kode at vise.
    import('../lib/highlight')
      .then(({ getHighlighterFor, THEME_NAME }) => getHighlighterFor(sample.lang).then((h) => ({ h, THEME_NAME })))
      .then(({ h, THEME_NAME }) => {
        if (!alive) return
        setHtml(h.codeToHtml(code, { lang: sample.lang, theme: THEME_NAME }))
      })
    return () => {
      alive = false
    }
  }, [code, sample.lang])

  return (
    <figure className="code">
      <figcaption className="code-head">
        <span className="code-title">{sample.title ?? ''}</span>
        <span className="code-lang">{LANG_LABEL[sample.lang]}</span>
      </figcaption>
      {html ? (
        <div className="code-body" dangerouslySetInnerHTML={{ __html: html }} />
      ) : (
        <div className="code-body">
          <pre>
            <code>{code}</code>
          </pre>
        </div>
      )}
      {sample.source && <div className="code-source">{sample.source}</div>}
    </figure>
  )
}
