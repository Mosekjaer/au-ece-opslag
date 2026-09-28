import { useEffect, useState } from 'react'
import { load, save } from './storage'

export type ThemeChoice = 'system' | 'light' | 'dark'

export function useTheme(): [ThemeChoice, (t: ThemeChoice) => void] {
  const [theme, setTheme] = useState<ThemeChoice>(() => {
    const t = load('opslag:theme')
    return t === 'light' || t === 'dark' ? t : 'system'
  })
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') delete root.dataset.theme
    else root.dataset.theme = theme
    save('opslag:theme', theme === 'system' ? null : theme)
  }, [theme])
  return [theme, setTheme]
}
