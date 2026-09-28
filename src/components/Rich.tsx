import { Fragment, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

/* Minimal inline-markup til indholdsfilerne:
   `kode`  **fed**  *kursiv*  [[slug|tekst]]  [[fag/slug|tekst]]
   Mere behøves ikke; alt andet er struktur i datamodellen. */

const TOKEN = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[\[[^\]]+\]\])/g

export function rich(text: string, course?: string): ReactNode {
  const parts = text.split(TOKEN)
  return parts.map((p, i) => {
    if (!p) return null
    if (p.startsWith('`')) return <code key={i}>{p.slice(1, -1)}</code>
    if (p.startsWith('**')) return <strong key={i}>{rich(p.slice(2, -2), course)}</strong>
    if (p.startsWith('[[')) {
      const [target, label] = p.slice(2, -2).split('|')
      const href = target.includes('/') ? `/${target}` : `/${course ?? 'bad'}/${target}`
      return (
        <Link key={i} to={href} className="xref">
          {label ?? target}
        </Link>
      )
    }
    if (p.startsWith('*') && p.endsWith('*') && p.length > 2) return <em key={i}>{p.slice(1, -1)}</em>
    return <Fragment key={i}>{p}</Fragment>
  })
}

/** Fjerner markup, fx til søgning. */
export function plain(text: string): string {
  return text
    .replace(/\[\[[^|\]]+\|([^\]]+)\]\]/g, '$1')
    .replace(/\[\[([^\]]+)\]\]/g, '$1')
    .replace(/[`*]/g, '')
}
