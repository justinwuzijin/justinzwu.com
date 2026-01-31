'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
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

  // Letter-by-letter reveal using clip-path animation
  const letterRevealVariants = {
    hidden: { 
      clipPath: 'inset(0 100% 0 0)' 
    },
    visible: { 
      clipPath: 'inset(0 0% 0 0)',
      transition: { 
        duration: 1,
        ease: [0.22, 1, 0.36, 1],
        delay: 0.3
      }
    }
  }

  return (
    <div
      className={styles.titleContainer}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsHovered(true)}
      onTouchEnd={() => setIsHovered(false)}
    >
      <motion.div
        initial="hidden"
        animate="visible"
        variants={letterRevealVariants}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      >
        <img
          src={justinwuSrc}
          alt="Justin Wu"
          className={`${styles.titleImage} ${!isHovered ? styles.visible : styles.hidden}`}
        />
      </motion.div>
      <img
        src={zijinSrc}
        alt="吴子晋"
        className={`${styles.titleImage} ${isHovered ? styles.visible : styles.hidden}`}
      />
    </div>
  )
}
