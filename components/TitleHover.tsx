'use client'

import { useState } from 'react'
import { useTheme } from './ThemeProvider'
import styles from './TitleHover.module.css'

export function TitleHover() {
  const [isHovered, setIsHovered] = useState(false)
  const { theme } = useTheme()

  const justinwuSrc = theme === 'orange' 
    ? '/assets/svg/JUSTINWU(orange).svg' 
    : '/assets/svg/JUSTINWU.svg'
  
  const zijinSrc = theme === 'orange' 
    ? '/assets/svg/吴子晋(orange).svg' 
    : '/assets/svg/吴子晋.svg'

  return (
    <div
      className={styles.titleContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <img
        src={justinwuSrc}
        alt="Justin Wu"
        className={`${styles.titleImage} ${!isHovered ? styles.visible : styles.hidden}`}
      />
      <img
        src={zijinSrc}
        alt="吴子晋"
        className={`${styles.titleImage} ${isHovered ? styles.visible : styles.hidden}`}
      />
    </div>
  )
}
