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
  tracks: Track[]
  onTogglePlay?: (isPlaying: boolean) => void
}

export function VinylRecordPlayer({ tracks, onTogglePlay }: VinylRecordPlayerProps) {
  const { theme } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const audioRef = useRef<HTMLAudioElement>(null)

  const currentTrack = tracks[currentTrackIndex]

  // Initialize audio source
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    // Set src if not already set or if track changed
    const currentSrc = audio.src
    
    if (!currentSrc || !currentSrc.includes(currentTrack.src)) {
      audio.src = currentTrack.src
      // If was playing, continue playing new track
      if (isPlaying && hasUserInteracted) {
        audio.play().catch(console.error)
      }
    }
  }, [currentTrack, isPlaying, hasUserInteracted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      // Auto-skip to next track
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1)
      } else {
        // Loop back to first track
        setCurrentTrackIndex(0)
      }
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
  }, [currentTrackIndex, tracks.length])

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

  const skipNext = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    } else {
      setCurrentTrackIndex(0) // Loop to first
    }
  }

  const skipPrev = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    } else {
      setCurrentTrackIndex(tracks.length - 1) // Loop to last
    }
  }

  return (
    <div className={styles.vinylPlayer}>
      <audio ref={audioRef} preload="metadata" />
      
      <div className={styles.playerRow}>
        {/* Previous track button */}
        <button 
          onClick={skipPrev}
          className={styles.controlButton}
          aria-label="Previous track"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
          </svg>
        </button>
        
        <div 
          className={`${styles.container} ${isPlaying ? styles.playing : ''}`}
          onClick={togglePlay}
        >
          <div className={`${styles.record} ${isPlaying ? styles.spinning : ''}`}>
            {currentTrack?.cover ? (
              <img 
                src={currentTrack.cover} 
                alt={`${currentTrack.title} cover`}
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
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <rect x="6" y="4" width="4" height="16" rx="1"/>
                <rect x="14" y="4" width="4" height="16" rx="1"/>
              </svg>
            ) : (
              <svg width="8" height="8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8 5v14l11-7z"/>
              </svg>
            )}
          </button>
        </div>
        
        {/* Next track button */}
        <button 
          onClick={skipNext}
          className={styles.controlButton}
          aria-label="Next track"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
          </svg>
        </button>
      </div>
      
      {/* Track info */}
      <div className={styles.trackInfo}>
        <div className={styles.trackTitleRow}>
          <svg className={styles.musicIcon} width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 3v10.55c-.59-.34-1.27-.55-2-.55-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4V7h4V3h-6z"/>
          </svg>
          <span className={styles.trackTitle}>{currentTrack?.title || ''}</span>
        </div>
      </div>
    </div>
  )
}
