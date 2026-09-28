import { useEffect } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { allTopics, getCourse, outlineCount, topicCount } from '../content'
import type { Course } from '../content/types'
import { isKnown, useProgressVersion } from '../lib/progress'
import { slugify } from '../lib/search'
import { rich } from './Rich'
import { Check, roman } from './Shell'

export function CoursePage() {
  const { course: id } = useParams()
  const course = getCourse(id)

  useEffect(() => {
    if (course) document.title = `${course.short} · ${course.name} · Opslagsværk`
  }, [course])

  if (!course) return <Navigate to="/" replace />

  return (
    <div className="course page">
      <CourseHead course={course} />
      {course.status === 'ready' ? <ReadyBody course={course} /> : <SoonBody course={course} />}
      <ExamSection course={course} />
      <GoalsSection course={course} />
      {course.gaps && course.gaps.length > 0 && (
        <section className="course-section" id="huller">
          <h2 className="section-label">Huller i materialet</h2>
          <ul className="gap-list">
            {course.gaps.map((g, i) => (
              <li key={i}>{rich(g, course.id)}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  )
}

function CourseHead({ course }: { course: Course }) {
  const n = course.status === 'ready' ? topicCount(course) : outlineCount(course)
  return (
    <header className="course-head">
      <p className="course-code label">{course.code}</p>
      <h1 className="course-title">{course.name}</h1>
      <p className="course-meta meta">
        {[course.ects, course.status === 'ready' ? `${n} emner` : n > 0 ? `${n} emner i oversigten` : undefined]
          .filter(Boolean)
          .join(' · ')}
      </p>
      {course.intro && <p className="lede course-intro">{rich(course.intro, course.id)}</p>}
      {course.status === 'soon' && n === 0 && (
        <div className="soon-note">
          <p className="soon-note-title">Kun kursusbeskrivelsen er lagt ind.</p>
          <p>Læringsmål og eksamensform herunder er fra kursuskataloget. Emneoversigt og indhold kommer.</p>
        </div>
      )}
      {course.status === 'soon' && n > 0 && (
        <div className="soon-note">
          <p className="soon-note-title">Emneoversigten er klar. Indholdet kommer.</p>
          <p>
            Emnerne herunder er udledt af lektionsplanen og slides, med kildefil ved hvert emne. Når faget fyldes ud,
            får hvert emne samme opbygning som i{' '}
            <Link className="xref" to="/bad">
              BAD
            </Link>
            : definition, figur, forklaring, nøglepointer, kode og hvad du skal kunne sige.
          </p>
        </div>
      )}
    </header>
  )
}

function ReadyBody({ course }: { course: Course }) {
  useProgressVersion() // gen-render når noget markeres
  const topics = allTopics(course)
  const known = topics.filter((t) => isKnown(course.id, t.topic.slug)).length
  return (
    <section className="course-section" aria-label="Emner">
      <div className="progress">
        <div className="progress-bar" aria-hidden="true">
          <span style={{ transform: `scaleX(${topics.length ? known / topics.length : 0})` }} />
        </div>
        <p className="meta">
          {known} af {topics.length} emner markeret “jeg kan forklare det”
        </p>
      </div>

      {course.parts!.map((part, pi) => (
        <div className="part" key={part.id} id={part.id}>
          <h2 className="part-title">
            <span className="part-num">{roman(pi + 1)}</span>
            {part.title}
          </h2>
          <ol className="topic-rows">
            {part.topics.map((t) => {
              const idx = topics.findIndex((x) => x.topic.slug === t.slug)
              const k = isKnown(course.id, t.slug)
              return (
                <li key={t.slug}>
                  <Link to={`/${course.id}/${t.slug}`} className="topic-row">
                    <span className="topic-row-num">{idx + 1}</span>
                    <span className="topic-row-main">
                      <span className="topic-row-title">{t.title}</span>
                      <span className="topic-row-def">{rich(t.definition, course.id)}</span>
                    </span>
                    <span className="topic-row-week meta">{t.week}</span>
                    <span className="topic-row-known" aria-label={k ? 'Kan' : undefined}>
                      {k && <Check />}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ol>
        </div>
      ))}
    </section>
  )
}

function SoonBody({ course }: { course: Course }) {
  return (
    <section className="course-section" aria-label="Emneoversigt">
      {course.outline!.map((g, gi) => (
        <div className="part" key={g.title} id={slugify(g.title)}>
          <h2 className="part-title">
            <span className="part-num">{roman(gi + 1)}</span>
            {g.title}
          </h2>
          <ol className="topic-rows is-outline">
            {g.items.map((it) => (
              <li key={it.title} className="topic-row">
                <span className="topic-row-num" aria-hidden="true">
                  –
                </span>
                <span className="topic-row-main">
                  <span className="topic-row-title">{it.title}</span>
                  <span className="topic-row-def">{rich(it.description, course.id)}</span>
                  <span className="topic-row-src">
                    {it.sources.map((s) => (
                      <code key={s} title={s}>
                        {s.split('/').pop()}
                      </code>
                    ))}
                  </span>
                </span>
                <span className="topic-row-week meta">{it.lesson}</span>
                <span />
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  )
}

function ExamSection({ course }: { course: Course }) {
  const e = course.exam
  return (
    <section className="course-section exam-info" id="bedoemmelse">
      <h2 className="section-label">Sådan bliver du bedømt</h2>
      <p className="exam-form">{e.form}</p>
      {e.quote && (
        <blockquote className="quote">
          <p>“{e.quote}”</p>
          {e.quoteSource && <footer className="meta">{e.quoteSource}</footer>}
        </blockquote>
      )}
      <ul className="plain-list">
        {e.points.map((p, i) => (
          <li key={i}>{rich(p, course.id)}</li>
        ))}
      </ul>
    </section>
  )
}

function GoalsSection({ course }: { course: Course }) {
  const topics = allTopics(course)
  return (
    <section className="course-section" id="laeringsmaal">
      <h2 className="section-label">Læringsmål</h2>
      <ol className="goals">
        {course.goals.map((g, i) => (
          <li key={i}>
            <span className="goal-text">{g.text}</span>
            {g.topics && g.topics.length > 0 && (
              <span className="goal-topics">
                {g.topics.map((slug) => {
                  const t = topics.find((x) => x.topic.slug === slug)
                  return t ? (
                    <Link key={slug} to={`/${course.id}/${slug}`} className="chip">
                      {t.topic.short ?? t.topic.title}
                    </Link>
                  ) : null
                })}
              </span>
            )}
          </li>
        ))}
      </ol>
      {course.goalsSource && <p className="meta goals-source">Kilde: {course.goalsSource}</p>}
    </section>
  )
}
