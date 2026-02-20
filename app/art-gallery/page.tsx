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

// Each set has paths for: top lines, right lines, bottom lines, left lines
// Multiple strokes per side for sketchy effect
const scribbleBoxPathSets = [
  {
    top: ["M 2 2 Q 30 0, 50 3 T 98 2", "M 3 4 Q 40 2, 60 5 T 97 3", "M 1 3 Q 25 1, 55 2 T 99 4"],
    right: ["M 98 2 Q 100 30, 97 50 T 98 98", "M 97 3 Q 99 35, 98 55 T 97 97", "M 99 4 Q 101 25, 98 60 T 99 99"],
    bottom: ["M 98 98 Q 70 100, 50 97 T 2 98", "M 97 97 Q 60 99, 40 98 T 3 97", "M 99 99 Q 75 101, 45 99 T 1 99"],
    left: ["M 2 98 Q 0 70, 3 50 T 2 2", "M 3 97 Q 1 65, 2 45 T 3 4", "M 1 99 Q -1 75, 2 40 T 1 3"],
  },
  {
    top: ["M 3 3 Q 35 1, 55 4 T 97 3", "M 2 2 Q 45 0, 65 3 T 98 2", "M 4 4 Q 30 2, 50 5 T 96 4"],
    right: ["M 97 3 Q 99 35, 98 60 T 97 97", "M 98 2 Q 100 40, 97 55 T 98 98", "M 96 4 Q 98 30, 99 65 T 96 96"],
    bottom: ["M 97 97 Q 65 99, 45 98 T 3 97", "M 98 98 Q 55 100, 35 97 T 2 98", "M 96 96 Q 70 98, 50 99 T 4 96"],
    left: ["M 3 97 Q 1 65, 2 40 T 3 3", "M 2 98 Q 0 55, 3 35 T 2 2", "M 4 96 Q 2 70, 1 45 T 4 4"],
  },
  {
    top: ["M 2 4 Q 25 1, 60 3 T 98 2", "M 4 2 Q 35 0, 55 4 T 96 3", "M 1 3 Q 30 -1, 65 2 T 99 4"],
    right: ["M 98 2 Q 100 25, 99 55 T 98 98", "M 96 3 Q 98 35, 97 50 T 96 96", "M 99 4 Q 101 30, 100 60 T 99 99"],
    bottom: ["M 98 98 Q 75 100, 40 99 T 2 98", "M 96 96 Q 65 98, 35 97 T 4 96", "M 99 99 Q 70 101, 45 100 T 1 99"],
    left: ["M 2 98 Q 0 75, 1 45 T 2 4", "M 4 96 Q 2 65, 3 40 T 4 2", "M 1 99 Q -1 70, 0 50 T 1 3"],
  },
  {
    top: ["M 4 2 Q 40 0, 70 3 T 96 4", "M 2 3 Q 30 1, 60 2 T 98 2", "M 3 4 Q 45 2, 65 4 T 97 3"],
    right: ["M 96 4 Q 98 40, 97 70 T 96 96", "M 98 2 Q 100 35, 99 60 T 98 98", "M 97 3 Q 99 45, 98 65 T 97 97"],
    bottom: ["M 96 96 Q 60 98, 30 97 T 4 96", "M 98 98 Q 70 100, 40 99 T 2 98", "M 97 97 Q 55 99, 35 98 T 3 97"],
    left: ["M 4 96 Q 2 60, 3 30 T 4 2", "M 2 98 Q 0 70, 1 40 T 2 3", "M 3 97 Q 1 55, 2 35 T 3 4"],
  },
]

let scribbleBoxIndex = 0

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
  const pathSetIndex = scribbleBoxIndex++ % scribbleBoxPathSets.length
  const pathSet = scribbleBoxPathSets[pathSetIndex]
  const allPaths = [...pathSet.top, ...pathSet.right, ...pathSet.bottom, ...pathSet.left]

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
      {/* Scribble border - multiple separate strokes per side for sketchy effect */}
      <svg 
        className={styles.scribbleBorder}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        {allPaths.map((path, i) => (
          <motion.path
            key={i}
            d={path}
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ 
              duration: 0.4, 
              ease: [0.43, 0.13, 0.23, 0.96],
              delay: i * 0.03
            }}
          />
        ))}
      </svg>

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
