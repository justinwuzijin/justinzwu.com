'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import { useSoundEffects } from '@/hooks/useSoundEffects'
import styles from './TopRightControls.module.css'

export function TopRightControls() {
  const { theme, setTheme } = useTheme()
  const { playMenu } = useSoundEffects()
  const [isExpanded, setIsExpanded] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  // Track mount state for initial animation and detect mobile
  useEffect(() => {
    setMounted(true)
    setIsMobile(window.innerWidth <= 480)
    
    const handleResize = () => setIsMobile(window.innerWidth <= 480)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const socialLinks = [
    { 
      name: 'X (Twitter)', 
      url: 'https://x.com/byjustinwu',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    { 
      name: 'GitHub', 
      url: 'https://github.com/justinwuzijin',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      )
    },
    { 
      name: 'LinkedIn', 
      url: 'https://www.linkedin.com/in/justinzijinwu/',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
        </svg>
      )
    },
    { 
      name: 'YouTube', 
      url: 'https://www.youtube.com/@byjustinwu',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      )
    },
    { 
      name: 'Email', 
      url: 'mailto:jz3wu@uwaterloo.ca',
      icon: (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      )
    },
  ]

  const toggleTheme = () => {
    playMenu()
    setTheme(theme === 'dark' ? 'light' : 'dark')
  }

  const toggleOrangeMode = () => {
    playMenu()
    setTheme(theme === 'orange' ? 'light' : 'orange')
  }

  const toggleSocialLinks = () => {
    playMenu()
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div 
      className={styles.topRightControls}
      data-fixed-controls="true"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: mounted ? 1 : 0, y: mounted ? 0 : -20 }}
      transition={{ duration: 0.3, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as const }}
    >
      {/* Top row: Hamburger, Shift+o, and Light/Dark mode */}
      <div className={styles.topRow}>
        <div className={styles.socialControls}>
          <div className={styles.fluidContainer} data-expanded={isExpanded}>
            <button
              onClick={toggleSocialLinks}
              className={styles.triggerButton}
              aria-label={isExpanded ? 'Collapse social links' : 'Expand social links'}
              aria-expanded={isExpanded}
            >
              <img
                src="/assets/svg/hamburgericon.svg"
                alt="Social menu"
                className={`${styles.hamburgerImage} ${styles.hamburgerLight}`}
              />
              <img
                src="/assets/svg/hamburger(orange).svg"
                alt="Social menu"
                className={`${styles.hamburgerImage} ${styles.hamburgerOrange}`}
              />
            </button>
            
            {socialLinks.map((link, index) => (
              <a
                key={link.name}
                href={link.url}
                target={link.name === 'Email' ? '_self' : '_blank'}
                rel={link.name === 'Email' ? undefined : 'noopener noreferrer'}
                className={styles.socialIcon}
                aria-label={link.name}
                style={{
                  transform: `translateX(${isExpanded ? -(index + 1) * (isMobile ? 32 : 36) : 0}px)`,
                  opacity: isExpanded ? 1 : 0,
                  zIndex: 40 - index,
                  clipPath: index === socialLinks.length - 1 
                    ? 'circle(50% at 50% 50%)' 
                    : 'circle(50% at 55% 50%)',
                  transition: `transform ${isExpanded ? '300ms' : '300ms'} cubic-bezier(0.4, 0, 0.2, 1),
                             opacity ${isExpanded ? '300ms' : '350ms'}`,
                  backfaceVisibility: 'hidden',
                  WebkitFontSmoothing: 'antialiased',
                  pointerEvents: isExpanded ? 'auto' : 'none',
                }}
              >
                <img
                  src="/assets/svg/menuitem.svg"
                  alt=""
                  className={`${styles.menuItemBg} ${styles.menuItemLight}`}
                  aria-hidden="true"
                />
                <img
                  src="/assets/svg/menuitem(orange).svg"
                  alt=""
                  className={`${styles.menuItemBg} ${styles.menuItemOrange}`}
                  aria-hidden="true"
                />
                <span className={styles.iconWrapper}>
                  {link.icon}
                </span>
              </a>
            ))}
          </div>
        </div>

        {/* Orange mode button (shift+o) - to the left of light/dark */}
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
    </motion.div>
  )
}
