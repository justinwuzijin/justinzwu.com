'use client'

import { useState, useEffect } from 'react'
import { TopRightControls } from './TopRightControls'
import styles from './Header.module.css'

export function Header() {
  const [isVisible, setIsVisible] = useState(true)
  const [lastScrollY, setLastScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY

      // Show header when scrolling up or at the top
      if (currentScrollY < lastScrollY || currentScrollY < 10) {
        setIsVisible(true)
      } 
      // Hide header when scrolling down
      else if (currentScrollY > lastScrollY && currentScrollY > 10) {
        setIsVisible(false)
      }

      setLastScrollY(currentScrollY)
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [lastScrollY])

  return (
    <header className={`${styles.header} ${isVisible ? styles.visible : styles.hidden}`}>
      <a href="/" className={styles.logo}>JUSTINZWU.COM</a>
      <TopRightControls />
    </header>
  )
}
