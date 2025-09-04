export const STORAGE = {
  LESSONS: 'ai_grammar_lessons',
  CURRENT: 'ai_grammar_current',
}

export type Lesson = any

export function getLessons(): Lesson[] {
  try { return JSON.parse(localStorage.getItem(STORAGE.LESSONS) || '[]') } catch { return [] }
}

export function saveLesson(lesson: Lesson) {
  const list = getLessons()
  const withTime = { ...lesson, createdAt: lesson.createdAt || Date.now() }
  list.unshift(withTime)
  localStorage.setItem(STORAGE.LESSONS, JSON.stringify(list))
}

export function deleteLessonByTitle(title: string) {
  const list = getLessons().filter(l => l.title !== title)
  localStorage.setItem(STORAGE.LESSONS, JSON.stringify(list))
}

export function findLessonByTitle(title: string): Lesson | undefined {
  return getLessons().find(l => l.title === title)
}

export function exportLesson(lesson: Lesson) {
  const blob = new Blob([JSON.stringify(lesson, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `${(lesson.title || 'lesson').replace(/[^a-z0-9-_]+/gi,'_')}.json`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export function setCurrentLesson(lesson: Lesson | null){
  if(!lesson){ localStorage.removeItem(STORAGE.CURRENT); return }
  localStorage.setItem(STORAGE.CURRENT, JSON.stringify(lesson))
}

export function getCurrentLesson(): Lesson | null {
  try { return JSON.parse(localStorage.getItem(STORAGE.CURRENT) || 'null') } catch { return null }
}


