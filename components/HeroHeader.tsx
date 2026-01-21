'use client'

import Link from 'next/link'
import { TopRightControls } from './TopRightControls'
import { useTheme } from './ThemeProvider'
import styles from './HeroHeader.module.css'

export function HeroHeader() {
  const { theme } = useTheme()
  const logoSrc = theme === 'orange' 
    ? '/assets/svg/zijin(orange).svg' 
    : theme === 'dark' 
    ? '/assets/svg/zijin(dm).svg' 
    : '/assets/svg/zijin.svg'

  return (
    <div className={styles.heroHeader}>
      <Link href="/" className={styles.logo}>
        <img 
          src={logoSrc} 
          alt="Zijin" 
          className={styles.logoImage}
        />
      </Link>
      <TopRightControls />
    </div>
  )
}
