'use client'

import Link from 'next/link'
import Script from 'next/script'
import { useTheme } from './ThemeProvider'
import styles from './Footer.module.css'

export function Footer() {
  const { theme } = useTheme()
  const logoSrc = theme === 'orange' 
    ? '/assets/svg/zijin(orange).svg' 
    : theme === 'dark' 
    ? '/assets/svg/zijin(dm).svg' 
    : '/assets/svg/zijin.svg'
  const preFooterSrc = theme === 'orange' 
    ? '/assets/svg/Pre-Footer(orange).svg' 
    : theme === 'dark' 
    ? '/assets/svg/Pre-Footer(dm).svg' 
    : '/assets/svg/Pre-Footer.svg'

  return (
    <footer className={styles.footer}>
      {/* Pre-Footer collage banner */}
      <div className={styles.preFooter}>
        <img 
          src={preFooterSrc} 
          alt="Pre-footer collage" 
          className={styles.preFooterImage}
        />
          </div>
          
      {/* Footer bar */}
      <div className={styles.footerBar}>
        <div className={styles.footerContent}>
          {/* Left: Zijin logo */}
          <Link href="/" className={styles.logoSection}>
            <img 
              src={logoSrc} 
              alt="Zijin" 
              className={styles.logoImage}
            />
          </Link>
          
          {/* Center: Copyright text */}
          <Link href="/" className={styles.copyrightSection}>
            <p className={styles.copyright}>@2026 justinzwu.com</p>
          </Link>
          
          {/* Right: Waterloo Network webring */}
          <div className={styles.logoPlaceholder} suppressHydrationWarning>
            <Script 
              src="https://uwaterloo.network/embed.js" 
              strategy="lazyOnload"
              data-webring
              data-user="justin-wu"
            />
          </div>
        </div>
      </div>
    </footer>
  )
}
