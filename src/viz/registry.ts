import { useEffect, useState } from 'react'
import type { VizDef } from './kit/types'

/* Alle visualiseringer, slået op på id. Én mappe pr. fag (viz/bad, viz/fed …);
   hver fil hedder <id>.tsx og eksporterer en VizDef som default. Et emne peger
   på id’et i datafilen. Figurerne indlæses først, når deres emne åbnes. */
const loaders = import.meta.glob<{ default: VizDef }>(['./*/*.tsx', '!./kit/*'])

const byId: Record<string, () => Promise<{ default: VizDef }>> = Object.fromEntries(
  Object.entries(loaders).map(([path, load]) => [path.split('/').pop()!.replace(/\.tsx$/, ''), load]),
)

const cache: Record<string, VizDef> = {}

export const hasViz = (id: string | undefined) => !!id && id in byId

/** Henter en figur. Returnerer null, mens den indlæses (og hvis id’et ikke findes). */
export function useViz(id: string | undefined): VizDef | null {
  const [viz, setViz] = useState<VizDef | null>(() => (id ? (cache[id] ?? null) : null))
  useEffect(() => {
    if (!id || !byId[id]) {
      setViz(null)
      return
    }
    if (cache[id]) {
      setViz(cache[id])
      return
    }
    let alive = true
    setViz(null)
    byId[id]().then((m) => {
      cache[id] = m.default
      if (alive) setViz(m.default)
    })
    return () => {
      alive = false
    }
  }, [id])
  return viz
}
