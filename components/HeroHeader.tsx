import Link from 'next/link'
import styles from './HeroHeader.module.css'

/**
 * HeroHeader Component
 * 
 * Simple header with just the Zijin logo.
 * Uses CSS-based image switching to avoid hydration mismatch with orange mode.
 * The header controls (hamburger, shift+o, light/dark) are in TopRightControls
 * which is rendered in layout.tsx for all pages.
 */
export function HeroHeader() {
  return (
    <div className={styles.heroHeader}>
      <Link href="/" className={styles.logo}>
        <img 
          src="/assets/svg/zijin.svg" 
          alt="Zijin" 
          className={`${styles.logoImage} ${styles.logoLight}`}
        />
        <img 
          src="/assets/svg/zijin(dm).svg" 
          alt="Zijin" 
          className={`${styles.logoImage} ${styles.logoDark}`}
        />
        <img 
          src="/assets/svg/zijin(orange).svg" 
          alt="Zijin" 
          className={`${styles.logoImage} ${styles.logoOrange}`}
        />
      </Link>
    </div>
  )
}
