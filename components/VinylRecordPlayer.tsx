'use client'

import { useState, useEffect, useRef } from 'react'
import { useTheme } from './ThemeProvider'
import styles from './VinylRecordPlayer.module.css'

interface Track {
  title: string
  artist: string
  src: string
  cover?: string
}

interface VinylRecordPlayerProps {
  track: Track
  onTogglePlay?: (isPlaying: boolean) => void
}

export function VinylRecordPlayer({ track, onTogglePlay }: VinylRecordPlayerProps) {
  const { theme } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const audioRef = useRef<HTMLAudioElement>(null)

  // Initialize audio source
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !track) return

    // Set src if not already set or if track changed
    const currentSrc = audio.src
    const newSrc = track.src.startsWith('http') ? track.src : track.src
    
    if (!currentSrc || !currentSrc.includes(track.src)) {
      audio.src = track.src
    }
  }, [track])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      setIsPlaying(false)
      audio.currentTime = 0 // Reset to beginning when ended
    }

    const handlePlay = () => {
      setIsPlaying(true)
    }

    const handlePause = () => {
      setIsPlaying(false)
    }

    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [])

  const togglePlay = (e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation()
    }
    const audio = audioRef.current
    if (!audio) return

    setHasUserInteracted(true)

    if (isPlaying) {
      // Pause and save current time (audio already tracks this)
      audio.pause()
    } else {
      // Resume from saved time (audio.currentTime is preserved)
      audio.play().catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })
    }
  }

  return (
    <div className={styles.vinylPlayer}>
      <audio ref={audioRef} preload="metadata" />
      
      <div 
        className={`${styles.container} ${isPlaying ? styles.playing : ''}`}
        onClick={togglePlay}
      >
        <div className={`${styles.record} ${isPlaying ? styles.spinning : ''}`}>
          {track.cover ? (
            <img 
              src={track.cover} 
              alt={`${track.title} cover`}
              className={styles.recordCover}
            />
          ) : (
            <div className={styles.recordGrooves} />
          )}
          <div className={styles.recordCenter} />
        </div>
        
        <button
          onClick={togglePlay}
          className={styles.playButton}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          {isPlaying ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1"/>
              <rect x="14" y="4" width="4" height="16" rx="1"/>
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5v14l11-7z"/>
            </svg>
          )}
        </button>
      </div>
    </div>
  )
}
