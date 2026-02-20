'use client'

import React, { useState, useEffect, useRef, useCallback, MouseEvent as ReactMouseEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useTheme } from './ThemeProvider'
import { SelectableCollageItem } from './SelectableCollageItem'
import { CollageContextMenu } from './CollageContextMenu'
import { MarqueeSelect } from './MarqueeSelect'
import { useCollageSelection } from '@/hooks/useCollageSelection'
import { useSoundEffects } from '@/hooks/useSoundEffects'
import { 
  collageItems,
  getItemConfig,
  loadTransforms, 
  saveTransforms,
  type ItemTransform 
} from '@/lib/collageItems'
import styles from './Footer.module.css'

const MOBILE_BREAKPOINT = 768

interface WebringMember {
  website: string
  name: string
}

interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
}

function Webring() {
  const { theme } = useTheme()
  const [members, setMembers] = useState<WebringMember[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000)

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
  const { playClick } = useSoundEffects()
  const preFooterRef = useRef<HTMLDivElement>(null)
  const [transforms, setTransforms] = useState<ItemTransform[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0 })
  
  const {
    selectedIds,
    selectedCount,
    hasSelection,
    select,
    selectMultiple,
    selectAll,
    deselectAll,
    isSelected,
  } = useCollageSelection()

  useEffect(() => {
    setIsClient(true)
    setTransforms(loadTransforms())
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isClient && transforms.length > 0) {
      saveTransforms(transforms)
    }
  }, [transforms, isClient])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!hasSelection) return
      
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return

      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault()
        handleDelete()
      }
      
      if (e.key === 'Escape') {
        deselectAll()
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        selectAll(transforms.map(t => t.id))
      }
      
      
      if (e.key === ']') {
        if (e.metaKey || e.ctrlKey) {
          handleBringToFront()
        } else {
          handleBringForward()
        }
      }
      
      if (e.key === '[') {
        if (e.metaKey || e.ctrlKey) {
          handleSendToBack()
        } else {
          handleSendBackward()
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [hasSelection, selectedIds, transforms, deselectAll, selectAll])

  const handleSelect = useCallback((id: string, addToSelection: boolean) => {
    select(id, addToSelection)
  }, [select])

  const handleTransformChange = useCallback((id: string, updates: Partial<ItemTransform>) => {
    setTransforms(prev => 
      prev.map(t => t.id === id ? { ...t, ...updates } : t)
    )
  }, [])

  const handleContextMenu = useCallback((e: ReactMouseEvent, id: string) => {
    if (!isSelected(id)) {
      select(id, false)
    }
    setContextMenu({ isOpen: true, x: e.clientX, y: e.clientY })
  }, [isSelected, select])

  const handleCloseContextMenu = useCallback(() => {
    setContextMenu({ isOpen: false, x: 0, y: 0 })
  }, [])

  const handleBackgroundClick = useCallback((e: ReactMouseEvent) => {
    if ((e.target as HTMLElement).closest('[data-collage-item]')) return
    if (hasSelection) {
      playClick()
    }
    deselectAll()
  }, [deselectAll, hasSelection, playClick])

  const handleMarqueeSelect = useCallback((ids: string[], addToSelection: boolean) => {
    selectMultiple(ids, addToSelection)
  }, [selectMultiple])

  const handleBringToFront = useCallback(() => {
    if (!hasSelection) return
    const maxZ = Math.max(...transforms.map(t => t.zIndex))
    let nextZ = maxZ + 1
    setTransforms(prev => 
      prev.map(t => selectedIds.has(t.id) ? { ...t, zIndex: nextZ++ } : t)
    )
  }, [hasSelection, selectedIds, transforms])

  const handleBringForward = useCallback(() => {
    if (!hasSelection) return
    setTransforms(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex)
      const result = [...prev]
      
      for (const id of selectedIds) {
        const currentIndex = sorted.findIndex(t => t.id === id)
        if (currentIndex < sorted.length - 1) {
          const current = result.find(t => t.id === id)!
          const above = sorted[currentIndex + 1]
          const aboveInResult = result.find(t => t.id === above.id)!
          const tempZ = current.zIndex
          current.zIndex = aboveInResult.zIndex
          aboveInResult.zIndex = tempZ
        }
      }
      return result
    })
  }, [hasSelection, selectedIds])

  const handleSendBackward = useCallback(() => {
    if (!hasSelection) return
    setTransforms(prev => {
      const sorted = [...prev].sort((a, b) => a.zIndex - b.zIndex)
      const result = [...prev]
      
      for (const id of selectedIds) {
        const currentIndex = sorted.findIndex(t => t.id === id)
        if (currentIndex > 0) {
          const current = result.find(t => t.id === id)!
          const below = sorted[currentIndex - 1]
          const belowInResult = result.find(t => t.id === below.id)!
          const tempZ = current.zIndex
          current.zIndex = belowInResult.zIndex
          belowInResult.zIndex = tempZ
        }
      }
      return result
    })
  }, [hasSelection, selectedIds])

  const handleSendToBack = useCallback(() => {
    if (!hasSelection) return
    const minZ = Math.min(...transforms.map(t => t.zIndex))
    let nextZ = minZ - selectedIds.size
    setTransforms(prev => 
      prev.map(t => selectedIds.has(t.id) ? { ...t, zIndex: nextZ++ } : t)
    )
  }, [hasSelection, selectedIds, transforms])

  const handleDelete = useCallback(() => {
    setTransforms(prev => prev.filter(t => !selectedIds.has(t.id)))
    deselectAll()
  }, [selectedIds, deselectAll])

  const handleResetSize = useCallback(() => {
    setTransforms(prev => 
      prev.map(t => {
        if (!selectedIds.has(t.id)) return t
        const config = getItemConfig(t.id)
        if (!config) return t
        return { ...t, width: config.width, height: config.height }
      })
    )
  }, [selectedIds])

  const handleResetRotation = useCallback(() => {
    setTransforms(prev => 
      prev.map(t => {
        if (!selectedIds.has(t.id)) return t
        const config = getItemConfig(t.id)
        if (!config) return t
        return { ...t, rotation: config.rotation }
      })
    )
  }, [selectedIds])

  const logoSrc = theme === 'orange' 
    ? '/assets/svg/zijin(orange).svg' 
    : theme === 'dark' 
    ? '/assets/svg/zijin(dm).svg' 
    : '/assets/svg/zijin.svg'
  
  const justinwuTextSrc = '/assets/collection/justinwu-text-white.png'
  
  const preFooterStaticSrc = theme === 'orange' || theme === 'dark'
    ? '/assets/svg/Pre-Footer(dm).png' 
    : '/assets/svg/Pre-Footer.png'

  return (
    <footer className={styles.footer}>
      {isMobile ? (
        <div className={styles.preFooter}>
          <Image 
            src={preFooterStaticSrc} 
            alt="Pre-footer collage" 
            className={styles.preFooterImage}
            width={1200}
            height={400}
            loading="lazy"
            quality={85}
          />
        </div>
      ) : (
        <div 
          ref={preFooterRef}
          className={styles.preFooter}
          onClick={handleBackgroundClick}
        >
          <img 
            src={justinwuTextSrc}
            alt="@JUSTINWU"
            className={styles.preFooterBackground}
            draggable={false}
          />
          
          {isClient && (
            <MarqueeSelect
              containerRef={preFooterRef}
              transforms={transforms}
              onSelectionChange={handleMarqueeSelect}
            />
          )}
          
          {isClient && transforms.map(transform => {
            const item = collageItems.find(i => i.id === transform.id)
            if (!item) return null
            
            return (
              <div key={transform.id} data-collage-item>
                <SelectableCollageItem
                  item={item}
                  transform={transform}
                  containerRef={preFooterRef}
                  isSelected={isSelected(transform.id)}
                  onSelect={handleSelect}
                  onTransformChange={handleTransformChange}
                  onContextMenu={handleContextMenu}
                />
              </div>
            )
          })}
        </div>
      )}
      
      {contextMenu.isOpen && (
        <CollageContextMenu
          position={{ x: contextMenu.x, y: contextMenu.y }}
          selectedCount={selectedCount}
          onClose={handleCloseContextMenu}
          onBringToFront={handleBringToFront}
          onBringForward={handleBringForward}
          onSendBackward={handleSendBackward}
          onSendToBack={handleSendToBack}
          onDelete={handleDelete}
          onResetSize={handleResetSize}
          onResetRotation={handleResetRotation}
        />
      )}
          
      <div className={styles.footerBar}>
        <div className={styles.footerContent}>
          <div>
            <Link href="/" className={styles.logoSection}>
              <img 
                src={logoSrc} 
                alt="Zijin" 
                className={styles.logoImage}
              />
            </Link>
          </div>
          
          <div className={styles.copyrightSection}>
            <p className={styles.copyright}>@2026 justinzwu.com</p>
          </div>
          
          <div className={styles.webringContainer}>
            <Webring />
          </div>
        </div>
        
        <div className={styles.attribution}>
          <p className={styles.attributionText}>
            designed on figma. built with next.js. deployed on vercel. sound from envato. help from V0 and Cursor.
          </p>
        </div>
      </div>
    </footer>
  )
}
