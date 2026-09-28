import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { search, type SearchItem } from '../lib/search'
import { courses, allTopics } from '../content'

/* Søgning på tværs af alle fag. Åbnes med ⌘K / Ctrl+K eller "/". */

export function SearchPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const navigate = useNavigate()

  const results: SearchItem[] = useMemo(() => {
    if (q.trim().length < 2) {
      // Uden søgeord: vis emnerne i det fyldte fag som genveje.
      const ready = courses.find((c) => c.status === 'ready')
      if (!ready) return []
      return allTopics(ready)
        .slice(0, 8)
        .map(({ topic, part }) => ({
          kind: 'Emne',
          course: ready.id,
          courseShort: ready.short,
          title: topic.title,
          context: part.title,
          text: '',
          keywords: '',
          href: `/${ready.id}/${topic.slug}`,
        }))
    }
    return search(q)
  }, [q])

  useEffect(() => {
    if (!open) return
    setQ('')
    setActive(0)
    input.current?.focus()
    const onEsc = (e: globalThis.KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onEsc)
    return () => window.removeEventListener('keydown', onEsc)
  }, [open, onClose])

  useEffect(() => setActive(0), [q])

  useEffect(() => {
    list.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: 'nearest' })
  }, [active])

  const choose = (item: SearchItem | undefined) => {
    if (!item) return
    onClose()
    navigate(item.href)
  }

  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActive((a) => Math.min(a + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActive((a) => Math.max(a - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      choose(results[active])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="palette-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.16 }}
          onMouseDown={(e) => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className="palette"
            role="dialog"
            aria-modal="true"
            aria-label="Søg i opslagsværket"
            initial={{ opacity: 0, y: -8, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.99 }}
            transition={{ type: 'spring', stiffness: 520, damping: 38 }}
          >
            <div className="palette-field">
              <SearchIcon />
              <input
                ref={input}
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                onKeyDown={onKey}
                placeholder="Søg efter emne eller begreb …"
                aria-label="Søg"
                aria-controls="palette-results"
                aria-activedescendant={results[active] ? `hit-${active}` : undefined}
                spellCheck={false}
                autoComplete="off"
              />
              <kbd>Esc</kbd>
            </div>

            <ul className="palette-results" id="palette-results" ref={list} role="listbox">
              {q.trim().length < 2 && <li className="palette-hint label">Genveje</li>}
              {results.length === 0 && (
                <li className="palette-empty">
                  Intet fundet for “{q}”. Prøv et engelsk fagudtryk — materialet er delvist på engelsk.
                </li>
              )}
              {results.map((r, i) => (
                <li
                  key={r.href + i}
                  id={`hit-${i}`}
                  role="option"
                  aria-selected={i === active}
                  data-active={i === active}
                  data-course={r.course}
                  className="palette-hit"
                  onMouseMove={() => setActive(i)}
                  onClick={() => choose(r)}
                >
                  <span className="palette-kind">
                    <span className="palette-dot" />
                    {r.courseShort}
                  </span>
                  <span className="palette-main">
                    <span className="palette-title">{r.title}</span>
                    <span className="palette-context">
                      {r.kind === 'Begreb' ? `Begreb i ${r.context}` : r.kind === 'Kommer' ? `${r.context} · kommer` : r.context}
                    </span>
                  </span>
                </li>
              ))}
            </ul>
            <div className="palette-foot meta">
              <span>
                <kbd>↑</kbd> <kbd>↓</kbd> vælg
              </span>
              <span>
                <kbd>↵</kbd> åbn
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

export function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="m10.5 10.5 3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}
