'use client'

import { useTheme } from './ThemeProvider'
import styles from './TopRightControls.module.css'

export function TopRightControls() {
  const { theme, setTheme } = useTheme()

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const toggleOrangeMode = () => {
    setTheme(theme === 'orange' ? 'light' : 'orange')
  }

  return (
    <div className={styles.topRightControls}>
      {/* Orange mode button (shift+o) */}
      <button
        onClick={toggleOrangeMode}
        className={`${styles.controlButton} ${styles.shiftOButton}`}
        aria-label={theme === 'orange' ? 'Exit orange mode' : 'Enter orange mode'}
        title="Shift+O for orange mode"
      >
        <span className={styles.shiftIcon}>⇧</span>
        <span className={styles.shiftText}>shift</span>
        <span className={styles.shiftPlus}>+</span>
        <span className={styles.shiftOKey}>o</span>
      </button>

      {/* Light/Dark mode toggle */}
      <button
        onClick={toggleTheme}
        className={styles.controlButton}
        aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      >
        {theme === 'dark' ? (
          // Sun icon - shown when in dark mode (clicking switches to light)
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="4"/>
            <path d="M12 2v2"/>
            <path d="M12 20v2"/>
            <path d="m4.93 4.93 1.41 1.41"/>
            <path d="m17.66 17.66 1.41 1.41"/>
            <path d="M2 12h2"/>
            <path d="M20 12h2"/>
            <path d="m6.34 17.66-1.41 1.41"/>
            <path d="m19.07 4.93-1.41 1.41"/>
          </svg>
        ) : (
          // Moon icon - shown when in light mode (clicking switches to dark)
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        )}
      </button>
    </div>
  )
}
