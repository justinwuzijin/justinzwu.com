'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'

type Theme = 'light' | 'dark' | 'orange'

interface ThemeContextType {
  theme: Theme
  setTheme: (theme: Theme) => void
  digitalDroplets: boolean
  setDigitalDroplets: (enabled: boolean) => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  const [digitalDroplets, setDigitalDroplets] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && ['light', 'dark', 'orange'].includes(savedTheme)) {
      setTheme(savedTheme)
    }
    const savedDigitalDroplets = localStorage.getItem('digitalDroplets')
    if (savedDigitalDroplets !== null) {
      setDigitalDroplets(savedDigitalDroplets === 'true')
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      document.documentElement.setAttribute('data-theme', theme)
      localStorage.setItem('theme', theme)
    }
  }, [theme, mounted])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('digitalDroplets', String(digitalDroplets))
    }
  }, [digitalDroplets, mounted])

  // Keyboard shortcut for orange mode: Press 'Shift+O' (only when not typing in an input)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only trigger if not typing in an input/textarea
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }
      
      if (e.key.toLowerCase() === 'o' && e.shiftKey && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault()
        setTheme((prev) => (prev === 'orange' ? 'light' : 'orange'))
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <ThemeContext.Provider value={{ theme, setTheme, digitalDroplets, setDigitalDroplets }}>
      {children}
    </ThemeContext.Provider>
  )
}
