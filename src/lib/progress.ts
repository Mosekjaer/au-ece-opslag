import { useCallback, useSyncExternalStore } from 'react'
import { load, save } from './storage'

/* "Jeg kan forklare det" pr. emne. Kun en bekvemmelighed pr. læser;
   gemmes lokalt i browseren. */

const listeners = new Set<() => void>()
const key = (course: string, slug: string) => `opslag:kan:${course}:${slug}`

function subscribe(cb: () => void) {
  listeners.add(cb)
  const onStorage = (e: StorageEvent) => e.key?.startsWith('opslag:kan:') && cb()
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(cb)
    window.removeEventListener('storage', onStorage)
  }
}

export function isKnown(course: string, slug: string): boolean {
  return load(key(course, slug)) === '1'
}

export function useKnown(course: string, slug: string): [boolean, () => void] {
  const known = useSyncExternalStore(subscribe, () => isKnown(course, slug), () => false)
  const toggle = useCallback(() => {
    save(key(course, slug), isKnown(course, slug) ? null : '1')
    listeners.forEach((l) => l())
  }, [course, slug])
  return [known, toggle]
}

/** Abonnér på alle ændringer, fx til fremdrift på oversigtssiden. */
export function useProgressVersion(): number {
  return useSyncExternalStore(
    subscribe,
    () => {
      let n = 0
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          if (window.localStorage.key(i)?.startsWith('opslag:kan:')) n++
        }
      } catch {
        /* intet */
      }
      return n
    },
    () => 0,
  )
}
