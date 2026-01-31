'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import styles from './Footer.module.css'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.6, ease: 'easeOut' }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    }
  }
}

interface WebringMember {
  website: string
  name: string
}

function Webring() {
  const { theme } = useTheme()
  const [members, setMembers] = useState<WebringMember[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    fetch('https://www.uwaterloo.network/api/webring?user=justin-wu')
      .then(res => res.json())
      .then(data => {
        if (data.members && data.members.length > 0) {
          setMembers(data.members)
          setCurrentIndex(Math.floor(Math.random() * data.members.length))
        }
      })
      .catch(err => console.error('Webring error:', err))
  }, [])

  const navigate = (direction: 'prev' | 'next') => {
    if (members.length === 0) return
    let newIndex
    if (direction === 'prev') {
      newIndex = (currentIndex - 1 + members.length) % members.length
    } else {
      newIndex = (currentIndex + 1) % members.length
    }
    setCurrentIndex(newIndex)
    window.open(members[newIndex].website, '_blank', 'noopener,noreferrer')
  }

  const iconSrc = theme === 'orange' || theme === 'dark'
    ? 'https://www.uwaterloo.network/iconwhite.svg'
    : 'https://www.uwaterloo.network/icon.svg'

  return (
    <div className={styles.webring}>
      <button 
        onClick={() => navigate('prev')} 
        className={styles.webringArrow}
        aria-label="Previous member"
      >
        ←
      </button>
      <a 
        href="https://www.uwaterloo.network" 
        target="_blank" 
        rel="noopener noreferrer"
        className={styles.webringIconLink}
        title="Visit uwaterloo.network"
      >
        <img src={iconSrc} alt="UWaterloo Webring" className={styles.webringIcon} />
      </a>
      <button 
        onClick={() => navigate('next')} 
        className={styles.webringArrow}
        aria-label="Next member"
      >
        →
      </button>
    </div>
  )
}

export function Footer() {
  const { theme } = useTheme()
  const logoSrc = theme === 'orange' 
    ? '/assets/svg/zijin(orange).svg' 
    : theme === 'dark' 
    ? '/assets/svg/zijin(dm).svg' 
    : '/assets/svg/zijin.svg'
  const preFooterSrc = theme === 'orange' || theme === 'dark'
    ? '/assets/svg/Pre-Footer(dm).png' 
    : '/assets/svg/Pre-Footer.png'

  return (
    <footer className={styles.footer}>
      {/* Pre-Footer collage banner */}
      <motion.div 
        className={styles.preFooter}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={fadeInUp}
      >
        <img 
          src={preFooterSrc} 
          alt="Pre-footer collage" 
          className={styles.preFooterImage}
        />
      </motion.div>
          
      {/* Footer bar */}
      <motion.div 
        className={styles.footerBar}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.div className={styles.footerContent} variants={staggerContainer}>
          {/* Left: Zijin logo */}
          <motion.div variants={fadeInUp}>
            <Link href="/" className={styles.logoSection}>
              <img 
                src={logoSrc} 
                alt="Zijin" 
                className={styles.logoImage}
              />
            </Link>
          </motion.div>
          
          {/* Center: Copyright text */}
          <motion.div className={styles.copyrightSection} variants={fadeInUp}>
            <p className={styles.copyright}>@2026 justinzwu.com</p>
          </motion.div>
          
          {/* Right: Waterloo Network webring */}
          <motion.div className={styles.webringContainer} variants={fadeInUp}>
            <Webring />
          </motion.div>
        </motion.div>
        
        {/* Attribution text */}
        <motion.div className={styles.attribution} variants={fadeInUp}>
          <p className={styles.attributionText}>
            designed on Figma. built with Next.js. deployed on Vercel. made with help from V0 and Cursor.
          </p>
        </motion.div>
      </motion.div>
    </footer>
  )
}
