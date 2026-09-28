import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import type { Course } from '../content/types'
import { coursesBySemester, outlineCount, semesterLabel, topicCount } from '../content'
import { modKey } from '../lib/platform'

export function Home() {
  useEffect(() => {
    document.title = 'Opslagsværk'
  }, [])
  return (
    <div className="home page">
      <header className="home-head">
        <p className="label">Diplomingeniør i softwareteknologi · AU</p>
        <h1 className="home-title">Opslagsværk</h1>
        <p className="lede">
          Fagene fra 2.–4. semester og en generisk projektguide, bygget på kursusmaterialet og med henvisning til kilden ved hvert emne. Find et begreb med{' '}
          <kbd>{modKey}</kbd> <kbd>K</kbd> eller <kbd>/</kbd>.
        </p>
      </header>

      {coursesBySemester().map((g) => (
        <section className="home-semester" key={g.semester ?? 'x'} aria-label={semesterLabel(g.semester)}>
          <h2 className="home-semester-title label">{semesterLabel(g.semester)}</h2>
          <ol className="home-courses">
            {g.courses.map((c) => (
              <li key={c.id} data-course={c.id}>
                <Link to={`/${c.id}`} className="home-course">
                  <span className="home-course-code">{c.code}</span>
                  <span className="home-course-name">{c.name}</span>
                  <span className="home-course-status meta">{courseStatus(c)}</span>
                  <span className="home-course-exam meta">{c.exam.form}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </div>
  )
}

function courseStatus(c: Course): string {
  if (c.status === 'ready') return `${topicCount(c)} emner`
  const n = outlineCount(c)
  return n > 0 ? `Emneoversigt · ${n} emner · indhold kommer` : 'Kursusbeskrivelse · indhold kommer'
}
