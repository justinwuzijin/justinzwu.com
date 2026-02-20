'use client'

import React, { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { AutoPlayVideo } from '@/components/AutoPlayVideo'
import { ScribbleHighlight } from '@/components/Highlights'
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
  
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null)
  const [itemTransforms, setItemTransforms] = useState<Record<string, ItemTransform>>(() => {
    const initial: Record<string, ItemTransform> = {}
    collageItems.forEach(item => {
      initial[item.id] = { rotation: 0, scale: 1 }
    })
    return initial
  })

  const handleItemClick = useCallback((itemId: string) => {
    setSelectedItemId(prev => prev === itemId ? null : itemId)
  }, [])

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
            
            {/* Collection grid */}
            <motion.div 
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
