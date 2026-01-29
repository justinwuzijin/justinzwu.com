'use client'

import { useMemo, useRef, useEffect, useState } from 'react'
import styles from './page.module.css'
import { AutoPlayVideo } from '@/components/AutoPlayVideo'

// Lazy-loaded video wrapper component
function LazyVideo({ videoUrl, aspectRatio, className }: { videoUrl: string; aspectRatio: number; className?: string }) {
  const [isVisible, setIsVisible] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Check if already in viewport on mount
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect()
      if (rect.top < window.innerHeight + 500) {
        setIsVisible(true)
        return
      }
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      {
        rootMargin: '500px', // Start loading 500px before entering viewport
        threshold: 0,
      }
    )

    if (containerRef.current) {
      observer.observe(containerRef.current)
    }

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={containerRef} className={className} style={{ aspectRatio: aspectRatio, backgroundColor: '#111', minHeight: '100px' }}>
      {isVisible ? (
        <AutoPlayVideo
          videoUrl={videoUrl}
          aspectRatio={aspectRatio}
          className={styles.distortedVideo}
        />
      ) : (
        <div style={{ width: '100%', height: '100%', backgroundColor: '#111' }} />
      )}
    </div>
  )
}

// List of all videos in public/assets/videos-short/ (2-second trimmed versions for fast loading)
const VIDEO_BASE_PATH = '/assets/videos-short'

const videoFiles = [
  'Screen Recording 2024-06-22 at 10.53.30 AM.mp4',
  'Screen Recording 2024-06-22 at 10.56.15 AM.mp4',
  'Screen Recording 2024-06-22 at 10.56.26 AM.mp4',
  'Screen Recording 2024-06-22 at 10.56.44 AM.mp4',
  'Screen Recording 2024-06-22 at 10.57.05 AM.mp4',
  'Screen Recording 2024-06-22 at 10.57.23 AM.mp4',
  'Screen Recording 2024-06-22 at 10.57.52 AM.mp4',
  'Screen Recording 2024-07-24 at 12.00.48 PM.mp4',
  'Screen Recording 2024-07-24 at 12.03.27 PM.mp4',
  'Screen Recording 2024-07-24 at 12.04.28 PM.mp4',
  'Screen Recording 2025-04-23 at 9.38.28 PM.mp4',
  'Screen Recording 2025-04-23 at 9.38.59 PM.mp4',
  'Screen Recording 2025-04-23 at 9.39.21 PM.mp4',
  'Screen Recording 2025-04-23 at 9.39.40 PM.mp4',
  'Screen Recording 2025-07-22 at 8.41.58 AM.mp4',
  'Screen Recording 2025-07-22 at 8.42.33 AM.mp4',
  'Screen Recording 2025-07-28 at 12.19.38 PM.mp4',
  'Screen Recording 2025-09-15 at 8.54.20 AM.mp4',
  'Screen Recording 2025-12-25 at 8.31.06 PM.mp4',
  'Screen Recording 2025-12-25 at 8.33.41 PM.mp4',
  'Screen Recording 2025-12-25 at 8.34.06 PM.mp4',
  'Screen Recording 2025-12-25 at 8.34.23 PM.mp4',
]

// Generate random distortion and grid placement for each video
function getRandomVideoConfig(index: number) {
  // Random distortion factors (0.3 to 2.0 for dramatic stretching/squishing)
  const widthDistortion = 0.3 + Math.random() * 1.7
  const heightDistortion = 0.3 + Math.random() * 1.7
  
  // Base aspect ratio (16:9)
  const baseAspectRatio = 16 / 9
  
  // Apply distortion to aspect ratio - this will stretch/squish the video
  const distortedAspectRatio = (baseAspectRatio * widthDistortion) / heightDistortion
  
  // Random grid span (some videos take more space for variety)
  const colSpan = Math.random() > 0.75 ? 2 : 1
  const rowSpan = Math.random() > 0.7 ? 2 : 1
  
  return {
    videoUrl: `${VIDEO_BASE_PATH}/${videoFiles[index]}`,
    aspectRatio: distortedAspectRatio,
    widthDistortion,
    heightDistortion,
    colSpan,
    rowSpan,
  }
}

export default function ArtGalleryPage() {
  // Generate configurations for each video (memoized for consistency)
  const videoConfigs = useMemo(() => {
    return videoFiles.map((_, index) => getRandomVideoConfig(index))
  }, [])

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <span className={styles.orangeDot} />
        art gallery
      </h1>
      <p className={styles.workInProgress}>work in progress;</p>

      {/* Masonry gallery section */}
      <section className={styles.gallery}>
        <div className={styles.masonryGrid}>
          {videoConfigs.map((config, index) => (
            <div
              key={index}
              className={`${styles.galleryItem} ${styles.artItem} ${styles.videoItem}`}
              style={{
                gridColumn: `span ${config.colSpan}`,
                gridRow: `span ${config.rowSpan}`,
              }}
            >
              <LazyVideo
                videoUrl={config.videoUrl}
                aspectRatio={config.aspectRatio}
                className={styles.distortedVideo}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
