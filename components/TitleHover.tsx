'use client'

import { useState } from 'react'
import styles from './TitleHover.module.css'

/**
 * TitleHover Component
 * 
 * Displays Justin Wu / 吴子晋 title with hover swap effect.
 * Uses CSS-based image switching for theme to avoid hydration mismatch with orange mode.
 */
export function TitleHover() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div
      className={styles.titleContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      {/* Justin Wu images - visible when not hovered */}
      <img
        src="/assets/svg/JUSTINWU.svg"
        alt="Justin Wu"
        className={`${styles.titleImage} ${styles.justinLight} ${!isHovered ? styles.visible : styles.hidden}`}
      />
      <img
        src="/assets/svg/JUSTINWU(orange).svg"
        alt="Justin Wu"
        className={`${styles.titleImage} ${styles.justinOrange} ${!isHovered ? styles.visible : styles.hidden}`}
      />
      
      {/* Chinese name images - visible when hovered */}
      <img
        src="/assets/svg/吴子晋.svg"
        alt="吴子晋"
        className={`${styles.titleImage} ${styles.zijinLight} ${isHovered ? styles.visible : styles.hidden}`}
      />
      <img
        src="/assets/svg/吴子晋(orange).svg"
        alt="吴子晋"
        className={`${styles.titleImage} ${styles.zijinOrange} ${isHovered ? styles.visible : styles.hidden}`}
      />
    </div>
  )
}
