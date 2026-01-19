'use client'

import { useState } from 'react'
import styles from './TitleHover.module.css'

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
      <img
        src="/assets/svg/JUSTINWU.svg"
        alt="Justin Wu"
        className={`${styles.titleImage} ${!isHovered ? styles.visible : styles.hidden}`}
      />
      <img
        src="/assets/svg/吴子晋.svg"
        alt="吴子晋"
        className={`${styles.titleImage} ${isHovered ? styles.visible : styles.hidden}`}
      />
    </div>
  )
}
