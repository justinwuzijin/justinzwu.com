'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '@/components/ThemeProvider'
import styles from './LoadingScreen.module.css'

export function LoadingScreen() {
  const { theme } = useTheme()
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 2500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  const logoSrc = theme === 'orange' 
    ? '/assets/svg/zijin(orange).svg'
    : theme === 'dark'
    ? '/assets/svg/zijin(dm).svg'
    : '/assets/svg/zijin.svg'

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className={styles.loadingScreen}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
        >
          <motion.img 
            src={logoSrc}
            alt="Zijin"
            className={styles.logoImage}
            initial={{ 
              opacity: 0, 
              scale: 0.5,
              rotate: -180 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1,
              rotate: 0 
            }}
            transition={{
              duration: 1,
              ease: [0.43, 0.13, 0.23, 0.96],
              rotate: { duration: 1.2, ease: "easeOut" }
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
