'use client'

import { useRef, useEffect } from 'react'
import styles from './AutoPlayVideo.module.css'

interface AutoPlayVideoProps {
  /** YouTube video ID (e.g., "dQw4w9WgXcQ") or full YouTube URL */
  youtubeId?: string
  /** Vimeo video ID or full Vimeo URL */
  vimeoId?: string
  /** Self-hosted video URL (MP4, WebM, etc.) */
  videoUrl?: string
  /** Poster/thumbnail image (shown before video loads) */
  poster?: string
  /** Alt text for the video */
  alt?: string
  /** Title of the video */
  title?: string
  /** Whether to loop the video (default: true) */
  loop?: boolean
  /** Whether to mute the video (default: true, required for autoplay) */
  muted?: boolean
  /** Whether to show controls (default: false) */
  controls?: boolean
  /** Custom className */
  className?: string
  /** Aspect ratio (default: 16/9) */
  aspectRatio?: number
}

/**
 * AutoPlayVideo Component
 * Displays a video that auto-plays, loops, and is always visible on the page
 */
export function AutoPlayVideo({
  youtubeId,
  vimeoId,
  videoUrl,
  poster,
  alt,
  title,
  loop = true,
  muted = true,
  controls = false,
  className,
  aspectRatio = 16 / 9,
}: AutoPlayVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Handle self-hosted video autoplay
  useEffect(() => {
    if (videoRef.current && videoUrl) {
      videoRef.current.play().catch((error) => {
        console.warn('Autoplay prevented:', error)
      })
    }
  }, [videoUrl])

  // Get embed URL for YouTube/Vimeo
  const getEmbedUrl = (): string | null => {
    if (youtubeId) {
      const id = youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')
        ? extractYouTubeId(youtubeId)
        : youtubeId
      return `https://www.youtube.com/embed/${id}?autoplay=1&loop=1&playlist=${id}&mute=1&controls=${controls ? 1 : 0}&rel=0`
    }
    if (vimeoId) {
      const id = vimeoId.includes('vimeo.com')
        ? extractVimeoId(vimeoId)
        : vimeoId
      return `https://player.vimeo.com/video/${id}?autoplay=1&loop=1&muted=1&controls=${controls ? 1 : 0}`
    }
    return null
  }

  const embedUrl = getEmbedUrl()

  return (
    <div
      className={`${styles.videoContainer} ${className || ''}`}
      style={{ aspectRatio: aspectRatio }}
    >
      {videoUrl ? (
        // Self-hosted video
        <video
          ref={videoRef}
          src={videoUrl}
          poster={poster}
          loop={loop}
          muted={muted}
          controls={controls}
          playsInline
          autoPlay
          preload="none"
          loading="lazy"
          className={styles.video}
          aria-label={alt || title}
        />
      ) : embedUrl ? (
        // YouTube or Vimeo embed
        <iframe
          ref={iframeRef}
          src={embedUrl}
          className={styles.iframe}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || alt || 'Video player'}
        />
      ) : (
        <div className={styles.error}>No valid video source provided</div>
      )}
    </div>
  )
}

// Helper functions
function extractYouTubeId(url: string): string {
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/.*[?&]v=([^&\n?#]+)/,
  ]
  
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }
  
  return url
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : url
}
