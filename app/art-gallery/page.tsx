'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { AutoPlayVideo } from '@/components/AutoPlayVideo'
import { ScribbleHighlight } from '@/components/Highlights'
import { useSoundEffects } from '@/hooks/useSoundEffects'
import { 
  collageItems,
  type CollageItemConfig,
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

const gridItemVariant = {
  hidden: { opacity: 0, y: 10 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

interface VideoConfig {
  id: string
  aspectRatio: number
  gridColumn?: string
  gridRow?: string
  videoUrl?: string
}

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

const handDrawnBorderPaths = [
  {
    top: "M 0 2 L 15 3 L 30 2 L 45 3 L 60 2 L 75 3 L 90 2 L 100 3",
    right: "M 98 0 L 97 15 L 98 30 L 97 45 L 98 60 L 97 75 L 98 90 L 97 100",
    bottom: "M 100 98 L 85 97 L 70 98 L 55 97 L 40 98 L 25 97 L 10 98 L 0 97",
    left: "M 2 100 L 3 85 L 2 70 L 3 55 L 2 40 L 3 25 L 2 10 L 3 0",
  },
  {
    top: "M 0 3 L 12 2 L 25 3 L 38 2 L 50 3 L 62 2 L 75 3 L 88 2 L 100 3",
    right: "M 97 0 L 98 12 L 97 25 L 98 38 L 97 50 L 98 62 L 97 75 L 98 88 L 97 100",
    bottom: "M 100 97 L 88 98 L 75 97 L 62 98 L 50 97 L 38 98 L 25 97 L 12 98 L 0 97",
    left: "M 3 100 L 2 88 L 3 75 L 2 62 L 3 50 L 2 38 L 3 25 L 2 12 L 3 0",
  },
  {
    top: "M 0 2 L 20 3 L 35 2 L 50 3 L 65 2 L 80 3 L 100 2",
    right: "M 98 0 L 97 20 L 98 35 L 97 50 L 98 65 L 97 80 L 98 100",
    bottom: "M 100 98 L 80 97 L 65 98 L 50 97 L 35 98 L 20 97 L 0 98",
    left: "M 2 100 L 3 80 L 2 65 L 3 50 L 2 35 L 3 20 L 2 0",
  },
  {
    top: "M 0 3 L 18 2 L 32 3 L 48 2 L 65 3 L 82 2 L 100 3",
    right: "M 97 0 L 98 18 L 97 32 L 98 48 L 97 65 L 98 82 L 97 100",
    bottom: "M 100 97 L 82 98 L 65 97 L 48 98 L 32 97 L 18 98 L 0 97",
    left: "M 3 100 L 2 82 L 3 65 L 2 48 L 3 32 L 2 18 L 3 0",
  },
]

let borderPathIndex = 0

function CollectionGridItem({ 
  item, 
  isSelected,
  onClick,
  rotation,
  scale,
  onRotationChange,
  onScaleChange,
}: { 
  item: CollageItemConfig
  isSelected: boolean
  onClick: () => void
  rotation: number
  scale: number
  onRotationChange: (rotation: number) => void
  onScaleChange: (scale: number) => void
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const pathSet = handDrawnBorderPaths[borderPathIndex++ % handDrawnBorderPaths.length]
  const [isDraggingRotate, setIsDraggingRotate] = useState(false)
  const [isDraggingScale, setIsDraggingScale] = useState(false)

  const handleRotateStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setIsDraggingRotate(true)
  }

  const handleScaleStart = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation()
    setIsDraggingScale(true)
  }

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2

    if (isDraggingRotate) {
      const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
      onRotationChange(angle + 90)
    }

    if (isDraggingScale) {
      const distance = Math.sqrt(
        Math.pow(e.clientX - centerX, 2) + Math.pow(e.clientY - centerY, 2)
      )
      const maxDistance = Math.min(rect.width, rect.height) / 2
      const newScale = Math.max(0.3, Math.min(1.5, distance / maxDistance))
      onScaleChange(newScale)
    }
  }, [isDraggingRotate, isDraggingScale, onRotationChange, onScaleChange])

  const handleMouseUp = useCallback(() => {
    setIsDraggingRotate(false)
    setIsDraggingScale(false)
  }, [])

  React.useEffect(() => {
    if (isDraggingRotate || isDraggingScale) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      return () => {
        window.removeEventListener('mousemove', handleMouseMove)
        window.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDraggingRotate, isDraggingScale, handleMouseMove, handleMouseUp])

  return (
    <motion.div
      ref={containerRef}
      className={`${styles.collectionItem} ${isSelected ? styles.collectionItemSelected : ''}`}
      variants={gridItemVariant}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <AnimatePresence>
        {isSelected && (
          <motion.div 
            className={styles.itemTag}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
          >
            <span>{item.alt}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <svg className={styles.handDrawnBorder} viewBox="0 0 100 100" preserveAspectRatio="none">
        <path d={pathSet.top} />
        <path d={pathSet.right} />
        <path d={pathSet.bottom} />
        <path d={pathSet.left} />
      </svg>

      <div className={styles.collectionImageContainer}>
        <img
          src={item.src}
          alt={item.alt}
          className={styles.collectionImage}
          style={{
            transform: `rotate(${rotation}deg) scale(${scale})`,
          }}
          draggable={false}
        />
      </div>

      {/* Rotation and scale controls - only show when selected */}
      {isSelected && (
        <>
          <div
            className={styles.rotateHandle}
            onMouseDown={handleRotateStart}
            title="Drag to rotate"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 11-6.219-8.56" />
              <polyline points="21 3 21 9 15 9" />
            </svg>
          </div>
          <div
            className={styles.scaleHandle}
            onMouseDown={handleScaleStart}
            title="Drag to resize"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 3 21 3 21 9" />
              <polyline points="9 21 3 21 3 15" />
              <line x1="21" y1="3" x2="14" y2="10" />
              <line x1="3" y1="21" x2="10" y2="14" />
            </svg>
          </div>
        </>
      )}
    </motion.div>
  )
}

interface ItemTransform {
  rotation: number
  scale: number
}

export default function ArtGalleryPage() {
  const [activeTab, setActiveTab] = useState<GalleryTab>('my mind')
  const tabs: GalleryTab[] = ['my room', 'my mind']
  const { playClick } = useSoundEffects()
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [itemTransforms, setItemTransforms] = useState<Record<string, ItemTransform>>(() => {
    const initial: Record<string, ItemTransform> = {}
    collageItems.forEach(item => {
      initial[item.id] = { rotation: 0, scale: 1 }
    })
    return initial
  })

  const handleItemClick = useCallback((itemId: string) => {
    playClick()
    setSelectedItemId(prev => prev === itemId ? null : itemId)
  }, [playClick])

  const handleRotationChange = useCallback((itemId: string, rotation: number) => {
    setItemTransforms(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], rotation }
    }))
  }, [])

  const handleScaleChange = useCallback((itemId: string, scale: number) => {
    setItemTransforms(prev => ({
      ...prev,
      [itemId]: { ...prev[itemId], scale }
    }))
  }, [])

  const gridRef = useRef<HTMLDivElement>(null)

  const getGridColumns = useCallback(() => {
    if (!gridRef.current) return 4
    const gridStyle = window.getComputedStyle(gridRef.current)
    const columns = gridStyle.gridTemplateColumns.split(' ').length
    return columns
  }, [])

  const navigateGrid = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!selectedItemId) return
    
    const currentIndex = collageItems.findIndex(item => item.id === selectedItemId)
    if (currentIndex === -1) return
    
    const columns = getGridColumns()
    const totalItems = collageItems.length
    const currentRow = Math.floor(currentIndex / columns)
    const currentCol = currentIndex % columns
    const totalRows = Math.ceil(totalItems / columns)
    
    let newIndex: number | null = null
    
    switch (direction) {
      case 'left':
        if (currentCol > 0) {
          newIndex = currentIndex - 1
        }
        break
      case 'right':
        if (currentCol < columns - 1 && currentIndex + 1 < totalItems) {
          newIndex = currentIndex + 1
        }
        break
      case 'up':
        if (currentRow > 0) {
          newIndex = currentIndex - columns
        }
        break
      case 'down':
        if (currentRow < totalRows - 1) {
          const targetIndex = currentIndex + columns
          if (targetIndex < totalItems) {
            newIndex = targetIndex
          }
        }
        break
    }
    
    if (newIndex !== null && newIndex >= 0 && newIndex < totalItems) {
      playClick()
      setSelectedItemId(collageItems[newIndex].id)
    }
  }, [selectedItemId, playClick, getGridColumns])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedItemId || activeTab !== 'my mind') return
      
      const key = e.key.toLowerCase()
      
      if (key === 'arrowleft' || key === 'a') {
        e.preventDefault()
        navigateGrid('left')
      } else if (key === 'arrowright' || key === 'd') {
        e.preventDefault()
        navigateGrid('right')
      } else if (key === 'arrowup' || key === 'w') {
        e.preventDefault()
        navigateGrid('up')
      } else if (key === 'arrowdown' || key === 's') {
        e.preventDefault()
        navigateGrid('down')
      } else if (key === 'escape') {
        e.preventDefault()
        setSelectedItemId(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedItemId, activeTab, navigateGrid])

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
              onClick={() => {
                playClick()
                setActiveTab(tab)
              }}
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
            
            {/* Collection grid */}
            <motion.div 
              ref={gridRef}
              className={styles.collectionGrid}
              variants={staggerContainer}
            >
              {collageItems.map((item) => (
                <CollectionGridItem
                  key={item.id}
                  item={item}
                  isSelected={selectedItemId === item.id}
                  onClick={() => handleItemClick(item.id)}
                  rotation={itemTransforms[item.id]?.rotation ?? 0}
                  scale={itemTransforms[item.id]?.scale ?? 1}
                  onRotationChange={(r) => handleRotationChange(item.id, r)}
                  onScaleChange={(s) => handleScaleChange(item.id, s)}
                />
              ))}
            </motion.div>
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
    </div>
  )
}
