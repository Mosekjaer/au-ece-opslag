import { useEffect } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { findTopic, getCourse } from '../content'
import type { SourceRef } from '../content/types'
import { useKnown } from '../lib/progress'
import { slugify } from '../lib/search'
import { hasViz, useViz } from '../viz/registry'
import { Figure } from '../viz/kit/Figure'
import { CodeBlock } from './CodeBlock'
import { rich } from './Rich'
import { Check, roman } from './Shell'

export function TopicPage() {
  const { course: courseId, slug } = useParams()
  const course = getCourse(courseId)
  const found = course ? findTopic(course, slug) : undefined
  const navigate = useNavigate()
  const viz = useViz(found?.topic.viz)

  // ← / → skifter emne, medmindre fokus er i en figur eller et felt.
  useEffect(() => {
    if (!found) return
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return
      const el = e.target as HTMLElement
      if (el.closest('input, textarea, .fig, [role="dialog"]')) return
      if (e.key === 'ArrowRight' && found.next) navigate(`/${courseId}/${found.next.topic.slug}`)
      if (e.key === 'ArrowLeft' && found.prev) navigate(`/${courseId}/${found.prev.topic.slug}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [found, courseId, navigate])

  useEffect(() => {
    if (found && course) document.title = `${found.topic.title} · ${course.short} · Opslagsværk`
  }, [found, course])

  if (!course) return <Navigate to="/" replace />
  if (!found) return <Navigate to={`/${course.id}`} replace />

  const { topic, part, index, prev, next, total } = found
  const showFig = hasViz(topic.viz)
  const partIndex = course.parts!.indexOf(part) + 1
  const c = course.id

  const toc = [
    showFig && { id: 'figur', label: 'Figur' },
    ...topic.concepts.map((x) => ({ id: slugify(x.term), label: x.term })),
    { id: 'noeglepointer', label: 'Nøglepointer' },
    topic.code?.length && { id: 'kode', label: 'Kode' },
    { id: 'eksamen', label: 'Til eksamen' },
    topic.gaps?.length && { id: 'huller', label: 'Huller i materialet' },
  ].filter(Boolean) as { id: string; label: string }[]

  return (
    <article className="topic page">
      <header className="topic-head">
        <nav className="crumbs meta" aria-label="Placering">
          <Link to={`/${c}`}>{course.short}</Link>
          <span aria-hidden="true">/</span>
          <span>
            {roman(partIndex)} · {part.title}
          </span>
        </nav>
        <p className="topic-num label">
          Emne {index + 1} af {total} · {topic.week}
        </p>
        <h1 className="topic-title">{topic.title}</h1>
        <p className="lede">{rich(topic.definition, c)}</p>
      </header>

      <aside className="topic-aside" aria-label="Om emnet">
        <KnownToggle course={c} slug={topic.slug} />
        <Sources sources={topic.sources} />
      </aside>

      {showFig && (
        <div className="topic-figure" id="figur">
          {viz && viz.id === topic.viz ? (
            <Figure key={viz.id} viz={viz} number={index + 1} course={c} />
          ) : (
            <div className="fig fig-loading" aria-hidden="true" />
          )}
        </div>
      )}

      <nav className="topic-toc" aria-label="På siden">
        <div className="toc-inner">
          <p className="label">På siden</p>
          <ol>
            {toc.map((t) => (
              <li key={t.id}>
                <a href={`#${t.id}`}>{t.label}</a>
              </li>
            ))}
          </ol>
        </div>
      </nav>

      <div className="topic-body">
        <section className="prose" aria-label="Forklaring">
          <h2 className="section-label">Forklaring</h2>
          {topic.intro?.map((p, i) => (
            <p key={i}>{rich(p, c)}</p>
          ))}
          {topic.concepts.map((concept) => (
            <section key={concept.term} className="concept" id={slugify(concept.term)}>
              <h3 className="concept-title">{concept.term}</h3>
              {concept.body.map((p, i) => (
                <p key={i}>{rich(p, c)}</p>
              ))}
            </section>
          ))}
        </section>

        <section className="keypoints" id="noeglepointer">
          <h2 className="section-label">Nøglepointer</h2>
          <ol>
            {topic.keyPoints.map((k, i) => (
              <li key={i}>{rich(k, c)}</li>
            ))}
          </ol>
        </section>

        {topic.code && topic.code.length > 0 && (
          <section className="codes" id="kode">
            <h2 className="section-label">Kode</h2>
            {topic.code.map((s, i) => (
              <CodeBlock key={i} sample={s} />
            ))}
          </section>
        )}

        <section className="exam" id="eksamen">
          <h2 className="section-label">Det skal du kunne sige til eksamen</h2>
          <div className="exam-body">
            {topic.exam.map((e, i) => (
              <p key={i}>{rich(e, c)}</p>
            ))}
          </div>
        </section>

        {topic.gaps && topic.gaps.length > 0 && (
          <section className="gaps" id="huller">
            <h2 className="section-label">Huller i materialet</h2>
            <ul>
              {topic.gaps.map((g, i) => (
                <li key={i}>{rich(g, c)}</li>
              ))}
            </ul>
          </section>
        )}

        <nav className="pager" aria-label="Emner">
          {prev ? (
            <Link to={`/${c}/${prev.topic.slug}`} className="pager-link is-prev">
              <span className="label">
                <kbd>←</kbd> Forrige
              </span>
              <span className="pager-title">{prev.topic.title}</span>
            </Link>
          ) : (
            <span />
          )}
          {next ? (
            <Link to={`/${c}/${next.topic.slug}`} className="pager-link is-next">
              <span className="label">
                Næste <kbd>→</kbd>
              </span>
              <span className="pager-title">{next.topic.title}</span>
            </Link>
          ) : (
            <Link to={`/${c}`} className="pager-link is-next">
              <span className="label">Tilbage</span>
              <span className="pager-title">Oversigt over {course.short}</span>
            </Link>
          )}
        </nav>
      </div>
    </article>
  )
}

function KnownToggle({ course, slug }: { course: string; slug: string }) {
  const [known, toggle] = useKnown(course, slug)
  return (
    <button className="known-toggle" aria-pressed={known} onClick={toggle}>
      <span className="known-box">{known && <Check />}</span>
      <span>{known ? 'Jeg kan forklare det' : 'Markér: jeg kan forklare det'}</span>
    </button>
  )
}

function Sources({ sources }: { sources: SourceRef[] }) {
  return (
    <div className="sources">
      <p className="label">Kilder</p>
      <ul>
        {sources.map((s, i) => (
          <li key={i}>
            <span className="source-file">{s.original ?? fileName(s.path)}</span>
            {s.pages && <span className="source-pages">{s.pages}</span>}
            {s.note && <span className="source-note">{s.note}</span>}
            <code className="source-path" title={s.path}>
              {s.path}
            </code>
          </li>
        ))}
      </ul>
    </div>
  )
}

const fileName = (p: string) => p.split('/').pop() ?? p
