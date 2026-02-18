'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import Link from 'next/link'
import { useTheme } from './ThemeProvider'
import { DraggableCollageItem } from './DraggableCollageItem'
import { 
  collageItems, 
  loadPositions, 
  savePositions,
  type ItemPosition 
} from '@/lib/collageItems'
import styles from './Footer.module.css'

interface WebringMember {
  website: string
  name: string
}

function Webring() {
  const { theme } = useTheme()
  const [members, setMembers] = useState<WebringMember[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    // Add timeout to prevent slow API from blocking
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 second timeout

    setIsLoading(true)
    fetch('https://www.uwaterloo.network/api/webring?user=justin-wu', {
      signal: controller.signal
    })
      .then(res => {
        clearTimeout(timeoutId)
        if (!res.ok) throw new Error('Network response was not ok')
        return res.json()
      })
      .then(data => {
        if (data.members && data.members.length > 0) {
          setMembers(data.members)
          setCurrentIndex(Math.floor(Math.random() * data.members.length))
          setHasError(false)
        }
      })
      .catch(err => {
        clearTimeout(timeoutId)
        console.error('Webring error:', err)
        setHasError(true)
      })
      .finally(() => {
        setIsLoading(false)
      })

    return () => {
      clearTimeout(timeoutId)
      controller.abort()
    }
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

  // Show minimal loading or error state - don't block page render
  if (hasError || members.length === 0) {
    return (
      <div className={styles.webring}>
        <a 
          href="https://www.uwaterloo.network" 
          target="_blank" 
          rel="noopener noreferrer"
          className={styles.webringIconLink}
          title="Visit uwaterloo.network"
        >
          <img src={iconSrc} alt="UWaterloo Webring" className={styles.webringIcon} />
        </a>
      </div>
    )
  }

  return (
    <div className={styles.webring}>
      <button 
        onClick={() => navigate('prev')} 
        className={styles.webringArrow}
        aria-label="Previous member"
        disabled={isLoading}
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
        disabled={isLoading}
      >
        →
      </button>
    </div>
  )
}

export function Footer() {
  const { theme } = useTheme()
  const preFooterRef = useRef<HTMLDivElement>(null)
  const [positions, setPositions] = useState<ItemPosition[]>([])
  const [isClient, setIsClient] = useState(false)

  // Load positions from localStorage on mount
  useEffect(() => {
    setIsClient(true)
    setPositions(loadPositions())
  }, [])

  // Save positions when they change
  useEffect(() => {
    if (isClient && positions.length > 0) {
      savePositions(positions)
    }
  }, [positions, isClient])

  const handleDragStart = useCallback((id: string) => {
    // Bring item to front by giving it the highest z-index
    setPositions(prev => {
      const maxZ = Math.max(...prev.map(p => p.zIndex))
      return prev.map(p => 
        p.id === id ? { ...p, zIndex: maxZ + 1 } : p
      )
    })
  }, [])

  const handleDragEnd = useCallback((id: string, newX: number, newY: number) => {
    setPositions(prev => 
      prev.map(p => 
        p.id === id ? { ...p, x: newX, y: newY } : p
      )
    )
  }, [])

  const logoSrc = theme === 'orange' 
    ? '/assets/svg/zijin(orange).svg' 
    : theme === 'dark' 
    ? '/assets/svg/zijin(dm).svg' 
    : '/assets/svg/zijin.svg'
  
  // Always use white text since the pre-footer background is always black
  const justinwuTextSrc = '/assets/collection/justinwu-text-white.png'

  return (
    <footer className={styles.footer}>
      {/* Pre-Footer draggable collage */}
      <div 
        ref={preFooterRef}
        className={styles.preFooter}
      >
        {/* Static @JUSTINWU text background */}
        <img 
          src={justinwuTextSrc}
          alt="@JUSTINWU"
          className={styles.preFooterBackground}
          draggable={false}
        />
        
        {/* Draggable items layer */}
        {isClient && positions.map(pos => {
          const item = collageItems.find(i => i.id === pos.id)
          if (!item) return null
          
          return (
            <DraggableCollageItem
              key={item.id}
              item={item}
              x={pos.x}
              y={pos.y}
              zIndex={pos.zIndex}
              containerRef={preFooterRef}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          )
        })}
      </div>
          
      {/* Footer bar */}
      <div className={styles.footerBar}>
        <div className={styles.footerContent}>
          {/* Left: Zijin logo */}
          <div>
            <Link href="/" className={styles.logoSection}>
              <img 
                src={logoSrc} 
                alt="Zijin" 
                className={styles.logoImage}
              />
            </Link>
          </div>
          
          {/* Center: Copyright text */}
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>@2026 justinzwu.com</p>
          </div>
          
          {/* Right: Waterloo Network webring */}
          <div className={styles.webringContainer}>
            <Webring />
          </div>
        </div>
        
        {/* Attribution text */}
        <div className={styles.attribution}>
          <p className={styles.attributionText}>
            designed on Figma. built with Next.js. deployed on Vercel. made with help from V0 and Cursor.
          </p>
        </div>
      </div>
    </footer>
  )
}
