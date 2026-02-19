'use client'

import React, { useState, useEffect, useRef, useCallback, MouseEvent as ReactMouseEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { AutoPlayVideo } from '@/components/AutoPlayVideo'
import { ScribbleHighlight } from '@/components/Highlights'
import { SelectableCollageItem } from '@/components/SelectableCollageItem'
import { CollageContextMenu } from '@/components/CollageContextMenu'
import { MarqueeSelect } from '@/components/MarqueeSelect'
import { useCollageSelection } from '@/hooks/useCollageSelection'
import { 
  collageItems,
  getItemConfig,
  loadArtGalleryTransforms, 
  saveArtGalleryTransforms,
  type ItemTransform 
} from '@/lib/artGalleryItems'

type GalleryTab = 'my room' | 'my mind'

const tabColors: Record<GalleryTab, string> = {
  'my room': '#93c5fd',
  'my mind': '#c4b5fd',
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.04,
      delayChildren: 0.1,
    }
  }
}

const videoItemVariant = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

interface ContextMenuState {
  isOpen: boolean
  x: number
  y: number
}

interface InfoPopupState {
  isOpen: boolean
  itemId: string | null
}

interface VideoConfig {
  id: string
  aspectRatio: number
  gridColumn?: string
  gridRow?: string
  videoUrl?: string
}

// Boundaries for draggable items: can't go over sidebar (left), video (top), or pre-footer (bottom)
const ITEM_BOUNDARIES = {
  minX: 0,    // Left edge of collage container (sidebar is outside)
  minY: 0,    // Top edge of collage container (video is above)
  maxY: 100,  // Bottom edge of collage container (pre-footer is below)
}

const MOBILE_BREAKPOINT = 768

const myRoomVideos: VideoConfig[] = [
  { id: 'room-1', aspectRatio: 16/9, gridColumn: 'span 2' },
  { id: 'room-2', aspectRatio: 9/16 },
  { id: 'room-3', aspectRatio: 9/16 },
  { id: 'room-4', aspectRatio: 4/3 },
  { id: 'room-5', aspectRatio: 4/3 },
  { id: 'room-6', aspectRatio: 32/9, gridColumn: 'span 3' },
  { id: 'room-7', aspectRatio: 4/3 },
  { id: 'room-8', aspectRatio: 16/9 },
  { id: 'room-9', aspectRatio: 9/16 },
  { id: 'room-10', aspectRatio: 16/9, gridColumn: 'span 2' },
  { id: 'room-11', aspectRatio: 4/3 },
]

function VideoPlaceholder({ config }: { config: VideoConfig }) {
  const { aspectRatio, gridColumn, gridRow, videoUrl } = config
  
  return (
    <motion.div
      className={styles.videoItem}
      style={{
        gridColumn: gridColumn || 'span 1',
        gridRow: gridRow || 'span 1',
      }}
      variants={videoItemVariant}
    >
      <div 
        className={styles.videoContainer}
        style={{ aspectRatio }}
      >
        {videoUrl ? (
          <AutoPlayVideo
            videoUrl={videoUrl}
            aspectRatio={aspectRatio}
            className={styles.video}
          />
        ) : (
          <div className={styles.placeholder} />
        )}
      </div>
    </motion.div>
  )
}

export default function ArtGalleryPage() {
  const [activeTab, setActiveTab] = useState<GalleryTab>('my mind')
  const tabs: GalleryTab[] = ['my room', 'my mind']
  
  const collageRef = useRef<HTMLDivElement>(null)
  const [transforms, setTransforms] = useState<ItemTransform[]>([])
  const [isClient, setIsClient] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [contextMenu, setContextMenu] = useState<ContextMenuState>({ isOpen: false, x: 0, y: 0 })
  const [infoPopup, setInfoPopup] = useState<InfoPopupState>({ isOpen: false, itemId: null })
  
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
    setTransforms(loadArtGalleryTransforms())
    
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= MOBILE_BREAKPOINT)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (isClient && transforms.length > 0) {
      saveArtGalleryTransforms(transforms)
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
        setInfoPopup({ isOpen: false, itemId: null })
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'a') {
        e.preventDefault()
        selectAll(transforms.map(t => t.id))
      }
      
      if ((e.metaKey || e.ctrlKey) && e.key === 'd') {
        e.preventDefault()
        handleDuplicate()
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

  const handleItemClick = useCallback((id: string) => {
    setInfoPopup(prev => 
      prev.isOpen && prev.itemId === id 
        ? { isOpen: false, itemId: null }
        : { isOpen: true, itemId: id }
    )
  }, [])

  const handleCloseInfoPopup = useCallback(() => {
    setInfoPopup({ isOpen: false, itemId: null })
  }, [])

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
    deselectAll()
    setInfoPopup({ isOpen: false, itemId: null })
  }, [deselectAll])

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

  const handleDuplicate = useCallback(() => {
    const newItems: ItemTransform[] = []
    const maxZ = Math.max(...transforms.map(t => t.zIndex))
    let nextZ = maxZ + 1
    
    for (const id of selectedIds) {
      const original = transforms.find(t => t.id === id)
      if (original) {
        newItems.push({
          ...original,
          id: `${original.id}-copy-${Date.now()}`,
          x: original.x + 2,
          y: original.y + 2,
          zIndex: nextZ++,
        })
      }
    }
    
    setTransforms(prev => [...prev, ...newItems])
    selectMultiple(newItems.map(i => i.id), false)
  }, [selectedIds, transforms, selectMultiple])

  return (
    <div className={styles.container}>
      <motion.h1 
        className={styles.pageTitle}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <span className={styles.orangeDot} />
        art gallery
      </motion.h1>

      <motion.div 
        className={styles.tabs}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {tabs.map((tab) => {
          const color = tabColors[tab]
          const isActive = activeTab === tab
          const isDisabled = tab === 'my room'
          
          if (isDisabled) {
            return (
              <motion.span
                key={tab}
                className={`${styles.tab} ${styles.disabledTab}`}
                variants={fadeInUp}
              >
                <span className={`${styles.tabDot} ${styles.inactiveDot}`} />
                <ScribbleHighlight delay={0.5}>{tab}</ScribbleHighlight>
              </motion.span>
            )
          }
          
          return (
            <motion.button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
              style={{ 
                '--tab-color': color 
              } as React.CSSProperties}
              variants={fadeInUp}
            >
              <span 
                className={`${styles.tabDot} ${isActive ? '' : styles.inactiveDot}`}
                style={isActive ? { backgroundColor: color } : undefined}
              />
              {tab}
            </motion.button>
          )
        })}
      </motion.div>

      <AnimatePresence mode="wait">
        {activeTab === 'my mind' ? (
          <motion.section 
            key="my-mind"
            className={styles.gallery}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={staggerContainer}
          >
            {/* Central video - full width */}
            <motion.div className={styles.centralVideo} variants={videoItemVariant}>
              <AutoPlayVideo
                videoUrl="/assets/art-gallery/central-piece.mp4"
                aspectRatio={16/9}
                className={styles.video}
              />
            </motion.div>
            
            {/* Interactive collage area - hidden on mobile */}
            {!isMobile && (
              <motion.div 
                ref={collageRef}
                className={styles.collageContainer}
                onClick={handleBackgroundClick}
                variants={videoItemVariant}
              >
                {isClient && (
                  <MarqueeSelect
                    containerRef={collageRef}
                    transforms={transforms}
                    onSelectionChange={handleMarqueeSelect}
                  />
                )}
                
                {isClient && transforms.map(transform => {
                  const item = collageItems.find(i => i.id === transform.id)
                  if (!item) return null
                  
                  return (
                    <div 
                      key={transform.id} 
                      data-collage-item
                      onClick={(e) => {
                        if (!e.shiftKey && !e.metaKey && !e.ctrlKey) {
                          handleItemClick(transform.id)
                        }
                      }}
                    >
                      <SelectableCollageItem
                        item={item}
                        transform={transform}
                        containerRef={collageRef}
                        isSelected={isSelected(transform.id)}
                        onSelect={handleSelect}
                        onTransformChange={handleTransformChange}
                        onContextMenu={handleContextMenu}
                        boundaries={ITEM_BOUNDARIES}
                      />
                    </div>
                  )
                })}
                
                {/* Info popups positioned using transform data */}
                <AnimatePresence>
                  {infoPopup.isOpen && infoPopup.itemId && (() => {
                    const transform = transforms.find(t => t.id === infoPopup.itemId)
                    const item = collageItems.find(i => i.id === infoPopup.itemId)
                    if (!transform || !item) return null
                    
                    return (
                      <motion.div
                        key="info-popup"
                        className={styles.infoPopup}
                        style={{
                          left: `calc(${transform.x}% + ${transform.width / 2}px)`,
                          top: `${transform.y}%`,
                        }}
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2 }}
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button className={styles.infoPopupClose} onClick={handleCloseInfoPopup}>×</button>
                        <p className={styles.infoPopupText}>{item.alt}</p>
                      </motion.div>
                    )
                  })()}
                </AnimatePresence>
              </motion.div>
            )}
          </motion.section>
        ) : (
          <motion.section 
            key="my-room"
            className={styles.gallery}
            initial="hidden"
            animate="visible"
            exit={{ opacity: 0 }}
            variants={staggerContainer}
          >
            <motion.div className={styles.videoGrid} variants={staggerContainer}>
              {myRoomVideos.map((config) => (
                <VideoPlaceholder key={config.id} config={config} />
              ))}
            </motion.div>
          </motion.section>
        )}
      </AnimatePresence>
      
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
          onDuplicate={handleDuplicate}
        />
      )}
      
    </div>
  )
}
