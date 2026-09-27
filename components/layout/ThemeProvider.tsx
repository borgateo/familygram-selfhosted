'use client'
import { useEffect } from 'react'

export function ThemeProvider({
  theme,
  children,
}: {
  theme: 'light' | 'dark' | 'system'
  children: React.ReactNode
}) {
  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', prefersDark)
    } else {
      root.classList.toggle('dark', theme === 'dark')
    }
  }, [theme])

  return <>{children}</>
}
