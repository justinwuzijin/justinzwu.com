'use client'

import { useState } from 'react'
import styles from './VideoStill.module.css'

interface VideoStillProps {
  /** YouTube video ID (e.g., "dQw4w9WgXcQ") or full YouTube URL */
  youtubeId?: string
  /** Vimeo video ID or full Vimeo URL */
  vimeoId?: string
  /** Self-hosted video URL (MP4, WebM, etc.) */
  videoUrl?: string
  /** Custom thumbnail image URL (optional - will auto-generate for YouTube/Vimeo) */
  thumbnail?: string
  /** Alt text for the thumbnail */
  alt?: string
  /** Title of the video */
  title?: string
  /** Whether to show a play button overlay */
  showPlayButton?: boolean
  /** Custom className */
  className?: string
  /** Aspect ratio (default: 16/9) */
  aspectRatio?: number
}

/**
 * VideoStill Component
 * Displays a video thumbnail/still that opens a modal/lightbox when clicked
 */
export function VideoStill({
  youtubeId,
  vimeoId,
  videoUrl,
  thumbnail,
  alt,
  title,
  showPlayButton = true,
  className,
  aspectRatio = 16 / 9,
}: VideoStillProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Determine video source and get embed URL
  const getEmbedUrl = (): string | null => {
    if (youtubeId) {
      // Handle both ID and full URL
      const id = youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')
        ? extractYouTubeId(youtubeId)
        : youtubeId
      return `https://www.youtube.com/embed/${id}?autoplay=1&mute=1&rel=0`
    }
    if (vimeoId) {
      const id = vimeoId.includes('vimeo.com')
        ? extractVimeoId(vimeoId)
        : vimeoId
      return `https://player.vimeo.com/video/${id}?autoplay=1&muted=1`
    }
    if (videoUrl) {
      return videoUrl
    }
    return null
  }

  // Get thumbnail URL
  const getThumbnailUrl = (): string => {
    if (thumbnail) return thumbnail
    
    if (youtubeId) {
      const id = youtubeId.includes('youtube.com') || youtubeId.includes('youtu.be')
        ? extractYouTubeId(youtubeId)
        : youtubeId
      return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`
    }
    
    if (vimeoId) {
      const id = vimeoId.includes('vimeo.com')
        ? extractVimeoId(vimeoId)
        : vimeoId
      // Vimeo requires API call for thumbnail, so use a placeholder or require thumbnail prop
      return thumbnail || '/assets/svg/placeholder-video.jpg'
    }
    
    return thumbnail || '/assets/svg/placeholder-video.jpg'
  }

  const embedUrl = getEmbedUrl()
  const thumbnailUrl = getThumbnailUrl()

  if (!embedUrl) {
    console.warn('VideoStill: No valid video source provided')
    return null
  }

  return (
    <>
      <div
        className={`${styles.videoStill} ${className || ''}`}
        style={{ aspectRatio: aspectRatio }}
        onClick={() => setIsOpen(true)}
      >
        <img
          src={thumbnailUrl}
          alt={alt || title || 'Video thumbnail'}
          className={styles.thumbnail}
        />
        {showPlayButton && (
          <div className={styles.playButton}>
            <svg
              width="64"
              height="64"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polygon points="5 3 19 12 5 21 5 3" fill="currentColor" />
            </svg>
          </div>
        )}
        {title && <div className={styles.titleOverlay}>{title}</div>}
      </div>

      {/* Modal/Lightbox */}
      {isOpen && (
        <div className={styles.modal} onClick={() => setIsOpen(false)}>
          <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <button
              className={styles.closeButton}
              onClick={() => setIsOpen(false)}
              aria-label="Close video"
            >
              ×
            </button>
            {youtubeId || vimeoId ? (
              <iframe
                src={embedUrl}
                className={styles.videoFrame}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={title || 'Video player'}
              />
            ) : (
              <video
                src={embedUrl}
                controls
                autoPlay
                muted
                className={styles.videoPlayer}
              />
            )}
          </div>
        </div>
      )}
    </>
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
  
  return url // Return as-is if no pattern matches (might already be an ID)
}

function extractVimeoId(url: string): string {
  const match = url.match(/vimeo\.com\/(\d+)/)
  return match ? match[1] : url
}
