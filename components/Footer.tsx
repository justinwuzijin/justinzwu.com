'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import styles from './Footer.module.css'

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
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>@2026 justinzwu.com</p>
          </div>
          
          {/* Right: Waterloo Network webring */}
          <div className={styles.webringContainer}>
            <Webring />
          </div>
        </div>
      </div>
    </footer>
  )
}
