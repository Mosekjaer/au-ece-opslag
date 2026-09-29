import type { Course, CourseId, Part, Topic } from './types'
import { bad } from './bad/index'
import { fed } from './fed/index'
import { swt } from './swt/index'
import { swd } from './swd'
import { oop } from './oop'
import { pla } from './pla'
import { sts } from './sts'
import { doa } from './doa'
import { sys } from './sys'
import { knp } from './knp'
import { projekt } from './projekt'
import { oprg } from './oprg'
import { ide } from './ide'
import { msys } from './msys'
import { lmek } from './lmek'

/* Registret over fag. Et nyt fag = én datafil + én linje her. */
export const courses: Course[] = [projekt, bad, fed, swt, swd, sys, knp, doa, oop, pla, sts, oprg, ide, msys, lmek]

/** Fag grupperet efter semester, nyeste først. Fag uden semester (på tværs) står øverst. */
export function coursesBySemester(): { semester?: number; courses: Course[] }[] {
  // Array.sort lægger altid undefined sidst, så semestrene sorteres uden, og på tværs sættes forrest.
  const sems = [...new Set(courses.map((c) => c.semester))].filter((s) => s !== undefined).sort((a, b) => b - a)
  const all: (number | undefined)[] = courses.some((c) => c.semester === undefined) ? [undefined, ...sems] : sems
  return all.map((semester) => ({ semester, courses: courses.filter((c) => c.semester === semester) }))
}

export function getCourse(id: string | undefined): Course | undefined {
  return courses.find((c) => c.id === id)
}

export function allTopics(course: Course): { topic: Topic; part: Part; index: number }[] {
  const out: { topic: Topic; part: Part; index: number }[] = []
  course.parts?.forEach((part) => part.topics.forEach((topic) => out.push({ topic, part, index: out.length })))
  return out
}

export function findTopic(course: Course, slug: string | undefined) {
  const list = allTopics(course)
  const i = list.findIndex((x) => x.topic.slug === slug)
  if (i < 0) return undefined
  return { ...list[i], prev: list[i - 1], next: list[i + 1], total: list.length }
}

export function topicCount(course: Course): number {
  return course.parts?.reduce((n, p) => n + p.topics.length, 0) ?? 0
}

export function outlineCount(course: Course): number {
  return course.outline?.reduce((n, g) => n + g.items.length, 0) ?? 0
}

export const semesterLabel = (s: number | undefined) => (s ? `${s}. semester` : 'På tværs')

export type { Course, CourseId }
