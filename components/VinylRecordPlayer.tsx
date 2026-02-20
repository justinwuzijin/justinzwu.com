'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from './ThemeProvider'
import { useSoundEffects } from '@/hooks/useSoundEffects'
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
  const { playClick, playSelect, playDeselect } = useSoundEffects()
  const [isPlaying, setIsPlaying] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [preloadedCovers, setPreloadedCovers] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement>(null)
  const wasPlayingRef = useRef(false)
  const prevTrackIndexRef = useRef(currentTrackIndex)

  const currentTrack = tracks[currentTrackIndex]

  // Preload adjacent track covers for instant switching
  useEffect(() => {
    const indicesToPreload = [
      currentTrackIndex,
      (currentTrackIndex + 1) % tracks.length,
      (currentTrackIndex - 1 + tracks.length) % tracks.length,
    ]
    
    indicesToPreload.forEach(index => {
      const cover = tracks[index]?.cover
      if (cover && !preloadedCovers.has(cover)) {
        const img = new Image()
        img.src = cover
        setPreloadedCovers(prev => new Set(prev).add(cover))
      }
    })
  }, [currentTrackIndex, tracks, preloadedCovers])

  // Set initial audio source on mount
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return
    
    audio.src = currentTrack.src
    audio.load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Handle track changes - only runs when track index actually changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

    // Only update if track actually changed
    if (prevTrackIndexRef.current !== currentTrackIndex) {
      const shouldAutoPlay = wasPlayingRef.current && hasUserInteracted
      
      audio.src = currentTrack.src
      audio.load()
      
      if (shouldAutoPlay) {
        audio.play().catch(console.error)
      }
      
      prevTrackIndexRef.current = currentTrackIndex
    }
  }, [currentTrackIndex, currentTrack, hasUserInteracted])

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const handleEnded = () => {
      wasPlayingRef.current = true
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
      wasPlayingRef.current = true
    }

    const handlePause = () => {
      setIsPlaying(false)
      wasPlayingRef.current = false
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

    playClick()
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

  const skipNext = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    playSelect()
    // Preserve playing state before changing track
    wasPlayingRef.current = isPlaying
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    } else {
      setCurrentTrackIndex(0) // Loop to first
    }
  }, [currentTrackIndex, tracks.length, isPlaying, playSelect])

  const skipPrev = useCallback((e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    playDeselect()
    // Preserve playing state before changing track
    wasPlayingRef.current = isPlaying
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    } else {
      setCurrentTrackIndex(tracks.length - 1) // Loop to last
    }
  }, [currentTrackIndex, tracks.length, isPlaying, playDeselect])

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
                key={currentTrack.cover}
                src={currentTrack.cover} 
                alt={`${currentTrack.title} cover`}
                className={styles.recordCover}
                loading="eager"
                decoding="async"
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
