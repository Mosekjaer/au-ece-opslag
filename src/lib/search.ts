import Fuse from 'fuse.js'
import { courses, allTopics } from '../content'
import { plain } from '../components/Rich'

export type HitKind = 'Emne' | 'Begreb' | 'Kommer' | 'Fag'

export interface SearchItem {
  kind: HitKind
  course: string
  courseShort: string
  title: string
  context: string
  text: string
  keywords: string
  href: string
}

export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

function build(): SearchItem[] {
  const items: SearchItem[] = []
  for (const c of courses) {
    items.push({
      kind: 'Fag',
      course: c.id,
      courseShort: c.short,
      title: c.name,
      context: c.code,
      text: c.exam.form,
      keywords: `${c.code} ${c.short}`,
      href: `/${c.id}`,
    })
    for (const { topic, part } of allTopics(c)) {
      items.push({
        kind: 'Emne',
        course: c.id,
        courseShort: c.short,
        title: topic.title,
        context: part.title,
        text: plain(topic.definition),
        keywords: [...(topic.keywords ?? []), ...topic.concepts.map((x) => x.term)].join(' '),
        href: `/${c.id}/${topic.slug}`,
      })
      for (const concept of topic.concepts) {
        items.push({
          kind: 'Begreb',
          course: c.id,
          courseShort: c.short,
          title: concept.term,
          context: topic.title,
          text: plain(concept.body[0] ?? '').slice(0, 220),
          keywords: '',
          href: `/${c.id}/${topic.slug}#${slugify(concept.term)}`,
        })
      }
    }
    c.outline?.forEach((g) =>
      g.items.forEach((it) =>
        items.push({
          kind: 'Kommer',
          course: c.id,
          courseShort: c.short,
          title: it.title,
          context: g.title,
          text: plain(it.description),
          keywords: it.lesson,
          href: `/${c.id}#${slugify(g.title)}`,
        }),
      ),
    )
  }
  return items
}

let fuse: Fuse<SearchItem> | null = null

export function search(q: string, limit = 24): SearchItem[] {
  fuse ??= new Fuse(build(), {
    keys: [
      { name: 'title', weight: 3 },
      { name: 'keywords', weight: 1.6 },
      { name: 'text', weight: 1 },
      { name: 'context', weight: 0.6 },
    ],
    threshold: 0.34,
    ignoreLocation: true,
    minMatchCharLength: 2,
  })
  const kindOrder: Record<HitKind, number> = { Fag: 0, Emne: 1, Begreb: 2, Kommer: 3 }
  return fuse
    .search(q, { limit: limit * 2 })
    .sort((a, b) => (a.score ?? 0) - (b.score ?? 0) + (kindOrder[a.item.kind] - kindOrder[b.item.kind]) * 0.04)
    .slice(0, limit)
    .map((r) => r.item)
}
