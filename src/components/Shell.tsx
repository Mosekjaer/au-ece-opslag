import { useCallback, useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation, useParams } from 'react-router-dom'
import { courses, coursesBySemester, semesterLabel } from '../content'
import type { Course } from '../content/types'
import { useKnown } from '../lib/progress'
import { useTheme, type ThemeChoice } from '../lib/theme'
import { SearchIcon, SearchPalette } from './SearchPalette'
import { modKey } from '../lib/platform'

export function Shell({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const closeSearch = useCallback(() => setSearchOpen(false), [])
  const location = useLocation()
  const courseId = location.pathname.split('/')[1] || undefined

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const typing = (e.target as HTMLElement)?.closest('input, textarea, [contenteditable]')
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        setSearchOpen((o) => !o)
      } else if (e.key === '/' && !typing && !searchOpen) {
        e.preventDefault()
        setSearchOpen(true)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [searchOpen])

  // Luk mobilmenuen ved navigation; rul til top eller til anker.
  useEffect(() => {
    setNavOpen(false)
    if (location.hash) {
      const el = document.getElementById(decodeURIComponent(location.hash.slice(1)))
      if (el) {
        requestAnimationFrame(() => el.scrollIntoView({ block: 'start' }))
        return
      }
    }
    window.scrollTo(0, 0)
  }, [location.pathname, location.hash])

  return (
    <div className="shell" data-course={courseId && courses.some((c) => c.id === courseId) ? courseId : undefined}>
      <header className="topbar">
        <Link to="/" className="wordmark">
          Opslagsværk
        </Link>
        <div className="topbar-actions">
          <button className="icon-btn" onClick={() => setSearchOpen(true)} aria-label="Søg">
            <SearchIcon />
          </button>
          <button
            className="icon-btn"
            onClick={() => setNavOpen((o) => !o)}
            aria-label={navOpen ? 'Luk menu' : 'Åbn menu'}
            aria-expanded={navOpen}
            aria-controls="sidebar"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
              {navOpen ? (
                <path d="M4 4l10 10M14 4 4 14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M3 5.5h12M3 9h12M3 12.5h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </header>

      <aside className="sidebar" id="sidebar" data-open={navOpen}>
        <div className="sidebar-inner">
          <Link to="/" className="wordmark sidebar-wordmark">
            Opslagsværk
          </Link>
          <p className="meta sidebar-sub">Softwareteknologi · AU ECE</p>

          <button className="search-trigger" onClick={() => setSearchOpen(true)}>
            <SearchIcon />
            <span>Søg</span>
            <span className="search-keys">
              <kbd>{modKey}</kbd>
              <kbd>K</kbd>
            </span>
          </button>

          <nav aria-label="Fag">
            {coursesBySemester().map((g) => (
              <div className="nav-semester" key={g.semester ?? 'x'}>
                <p className="nav-semester-label label">{semesterLabel(g.semester)}</p>
                <ul className="nav-courses">
                  {g.courses.map((c) => (
                    <CourseNav key={c.id} course={c} active={c.id === courseId} />
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          <ThemeSwitch />
        </div>
      </aside>
      {navOpen && <div className="scrim" onClick={() => setNavOpen(false)} aria-hidden="true" />}

      <main className="main" id="main">
        {children}
      </main>

      <SearchPalette open={searchOpen} onClose={closeSearch} />
    </div>
  )
}

function CourseNav({ course, active }: { course: Course; active: boolean }) {
  // Det aktive fag er foldet ud. Brugeren kan folde det sammen; skifter man fag og
  // kommer tilbage, er det foldet ud igen.
  const [open, setOpen] = useState(true)
  const [wasActive, setWasActive] = useState(active)
  if (active !== wasActive) {
    setWasActive(active)
    if (active) setOpen(true)
  }
  const expandable = active && !!course.parts
  const partsId = `nav-parts-${course.id}`
  return (
    <li className="nav-course" data-course={course.id} data-active={active}>
      <NavLink to={`/${course.id}`} end className="nav-course-link">
        <span className="nav-dot" aria-hidden="true" />
        <span className="nav-course-short">{course.short}</span>
        <span className="nav-course-name">{course.name}</span>
        {course.status === 'soon' && <span className="nav-soon">kommer</span>}
      </NavLink>
      {expandable && (
        <button
          type="button"
          className="nav-course-toggle"
          aria-expanded={open}
          aria-controls={partsId}
          aria-label={open ? `Fold ${course.short} sammen` : `Fold ${course.short} ud`}
          onClick={() => setOpen((o) => !o)}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
            <path d="M3 4.5 6 7.5l3-3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      )}
      {expandable && open && (
        <ol className="nav-parts" id={partsId}>
          {course.parts!.map((p, pi) => (
            <li key={p.id}>
              <div className="nav-part">
                <span className="nav-part-num">{roman(pi + 1)}</span>
                {p.title}
              </div>
              <ol className="nav-topics">
                {p.topics.map((t) => (
                  <TopicNav key={t.slug} course={course.id} slug={t.slug} title={t.short ?? t.title} />
                ))}
              </ol>
            </li>
          ))}
        </ol>
      )}
    </li>
  )
}

function TopicNav({ course, slug, title }: { course: string; slug: string; title: string }) {
  const [known] = useKnown(course, slug)
  const { slug: current } = useParams()
  return (
    <li>
      <NavLink
        to={`/${course}/${slug}`}
        className="nav-topic"
        aria-current={current === slug ? 'page' : undefined}
      >
        <span className="nav-topic-title">{title}</span>
        {known && (
          <span className="nav-known" aria-label="Markeret som kan">
            <Check />
          </span>
        )}
      </NavLink>
    </li>
  )
}

function ThemeSwitch() {
  const [theme, setTheme] = useTheme()
  const opts: { v: ThemeChoice; label: string }[] = [
    { v: 'light', label: 'Lys' },
    { v: 'dark', label: 'Mørk' },
    { v: 'system', label: 'Auto' },
  ]
  return (
    <div className="theme-switch" role="radiogroup" aria-label="Farvetema">
      {opts.map((o) => (
        <button key={o.v} role="radio" aria-checked={theme === o.v} onClick={() => setTheme(o.v)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Check() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true">
      <path d="M2.5 6.3 5 8.6l4.5-5.2" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export const roman = (n: number) => ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][n - 1] ?? String(n)
