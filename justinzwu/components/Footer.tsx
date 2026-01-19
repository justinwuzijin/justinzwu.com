'use client'

import { useTheme } from './ThemeProvider'
import styles from './Footer.module.css'

export function Footer() {
  const { theme } = useTheme()
  const logoSrc = theme === 'dark' ? '/assets/svg/zijin(dm).svg' : '/assets/svg/zijin.svg'
  const preFooterSrc = theme === 'dark' ? '/assets/svg/Pre-Footer(dm).svg' : '/assets/svg/Pre-Footer.svg'

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
          <div className={styles.logoSection}>
            <img 
              src={logoSrc} 
              alt="Zijin" 
              className={styles.logoImage}
            />
          </div>
          
          {/* Center: Copyright text */}
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>@2026 justinzwu.com</p>
          </div>
          
          {/* Right: Waterloo Network logo placeholder */}
          <div className={styles.logoPlaceholder}>
          <script 
  src="https://uwaterloo.network/embed.js" 
  data-webring
  data-user="justin-wu"
></script>
          </div>
        </div>
      </div>
    </footer>
  )
}
