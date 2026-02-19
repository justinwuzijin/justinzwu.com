'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { AutoPlayVideo } from '@/components/AutoPlayVideo'
import { ScribbleHighlight } from '@/components/Highlights'

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

interface PuzzlePiece {
  id: string
  x: number      // percentage from left
  y: number      // percentage from top
  width: number  // percentage width
  height: number // percentage height
  videoUrl?: string
}

// Spaced out vertical layout - even gaps between clips
const puzzlePieces: PuzzlePiece[] = [
  // Row 1
  { id: 'p1', x: 0, y: 0, width: 48, height: 8 },
  { id: 'p2', x: 52, y: 0, width: 48, height: 6 },
  
  // Row 2
  { id: 'p3', x: 0, y: 10, width: 30, height: 10 },
  { id: 'p4', x: 34, y: 10, width: 32, height: 7 },
  { id: 'p5', x: 70, y: 8, width: 30, height: 12 },
  
  // Row 3
  { id: 'p6', x: 0, y: 22, width: 40, height: 7 },
  { id: 'p7', x: 44, y: 19, width: 28, height: 9 },
  { id: 'p8', x: 76, y: 22, width: 24, height: 8 },
  
  // Row 4
  { id: 'p9', x: 0, y: 31, width: 25, height: 12 },
  { id: 'p10', x: 29, y: 30, width: 42, height: 8 },
  { id: 'p11', x: 75, y: 32, width: 25, height: 10 },
  
  // Row 5
  { id: 'p12', x: 0, y: 45, width: 35, height: 7 },
  { id: 'p13', x: 39, y: 40, width: 30, height: 10 },
  { id: 'p14', x: 73, y: 44, width: 27, height: 8 },
  
  // Row 6
  { id: 'p15', x: 0, y: 54, width: 28, height: 9 },
  { id: 'p16', x: 32, y: 52, width: 36, height: 7 },
  { id: 'p17', x: 72, y: 54, width: 28, height: 10 },
  
  // Row 7
  { id: 'p18', x: 0, y: 65, width: 45, height: 8 },
  { id: 'p19', x: 49, y: 63, width: 25, height: 11 },
  { id: 'p20', x: 78, y: 66, width: 22, height: 8 },
  
  // Row 8
  { id: 'p21', x: 0, y: 75, width: 32, height: 10 },
  { id: 'p22', x: 36, y: 76, width: 30, height: 7 },
  { id: 'p23', x: 70, y: 76, width: 30, height: 9 },
  
  // Row 9
  { id: 'p24', x: 0, y: 87, width: 40, height: 7 },
  { id: 'p25', x: 44, y: 85, width: 28, height: 9 },
  { id: 'p26', x: 76, y: 87, width: 24, height: 8 },
  
  // Row 10
  { id: 'p27', x: 0, y: 96, width: 48, height: 4 },
  { id: 'p28', x: 52, y: 96, width: 48, height: 4 },
]

function PuzzlePlaceholder({ piece, index }: { piece: PuzzlePiece; index: number }) {
  return (
    <motion.div
      className={styles.puzzlePiece}
      style={{
        left: `${piece.x}%`,
        top: `${piece.y}%`,
        width: `${piece.width}%`,
        height: `${piece.height}%`,
      }}
      variants={videoItemVariant}
      custom={index}
    >
      {piece.videoUrl ? (
        <AutoPlayVideo
          videoUrl={piece.videoUrl}
          aspectRatio={piece.width / piece.height}
          className={styles.video}
        />
      ) : (
        <div className={styles.placeholder} />
      )}
    </motion.div>
  )
}

interface VideoConfig {
  id: string
  aspectRatio: number
  gridColumn?: string
  gridRow?: string
  videoUrl?: string
}

// "my room" - layout matches Figma positioning
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
            
            {/* Puzzle arrangement below */}
            <motion.div className={styles.puzzleContainer} variants={staggerContainer}>
              {puzzlePieces.map((piece, index) => (
                <PuzzlePlaceholder key={piece.id} piece={piece} index={index} />
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
