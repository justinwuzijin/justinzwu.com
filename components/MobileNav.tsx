'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import styles from './MobileNav.module.css'

const navItems = [
  { href: '/me', label: 'me' },
  { href: '/experience', label: 'experience' },
  { href: '/drawer-of-thoughts', label: 'drawer of thoughts' },
  { href: '/bookshelf', label: 'bookshelf' },
  { href: '/art-gallery', label: 'art gallery' },
]

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  // Close menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  // Hide header on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // Don't hide if menu is open
      if (isOpen) {
        setIsVisible(true)
        return
      }
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        // Scrolling down and past 100px - hide
        setIsVisible(false)
      } else {
        // Scrolling up - show
        setIsVisible(true)
      }
      
      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY, isOpen])

  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  return (
    <>
      {/* Mobile Header Bar with Hamburger only */}
      <div className={`${styles.mobileHeader} ${isVisible ? styles.visible : styles.hidden}`}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`${styles.hamburger} ${isOpen ? styles.hamburgerOpen : ''}`}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
        >
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
          <span className={styles.hamburgerLine}></span>
        </button>
      </div>

      {/* Transparent Overlay Sidebar */}
      {isOpen && (
        <div 
          className={styles.overlay} 
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}
      
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <nav className={styles.nav} aria-label="Main navigation">
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const isActive = pathname === item.href || (pathname === '/' && item.href === '/me')
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    aria-current={isActive ? 'page' : undefined}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
          
          {/* Theme toggle buttons - side by side */}
          <div className={styles.themeToggleContainer}>
            {/* Light/Dark mode toggle */}
            <button
              onClick={toggleTheme}
              className={styles.themeToggle}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
            >
              {theme === 'dark' ? (
                <svg
                  width="20"
                  height="20"
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
                <svg
                  width="20"
                  height="20"
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
            
            {/* Orange mode toggle */}
            <button
              onClick={() => setTheme(theme === 'orange' ? 'light' : 'orange')}
              className={styles.orangeToggle}
              aria-label={theme === 'orange' ? 'Exit orange mode' : 'Enter orange mode'}
            >
              <img 
                src={theme === 'orange' ? '/assets/svg/hamburger(orange).svg' : '/assets/svg/hamburgericon.svg'} 
                alt="Orange mode"
                className={styles.orangeIcon}
              />
            </button>
          </div>
          
          <p className={styles.orangeModeHint}>click for orange-mode</p>
        </nav>
      </aside>
    </>
  )
}
