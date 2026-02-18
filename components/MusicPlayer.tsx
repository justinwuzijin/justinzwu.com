'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from './ThemeProvider'
import styles from './MusicPlayer.module.css'

interface MusicTrack {
  title: string
  artist: string
  src: string // URL to MP3 file
  cover?: string // URL to album cover image
  spotifyUrl?: string // Optional Spotify link
}

interface MusicPlayerProps {
  tracks?: MusicTrack[]
  defaultTrack?: MusicTrack
  autoPlay?: boolean
}

const defaultTracks: MusicTrack[] = [
  {
    title: 'Example Track',
    artist: 'Artist Name',
    src: '/music/example.mp3',
    cover: '/music/cover.jpg',
  },
]

export function MusicPlayer({ 
  tracks = defaultTracks, 
  defaultTrack,
  autoPlay = false 
}: MusicPlayerProps) {
  const { theme } = useTheme()
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const [hasUserInteracted, setHasUserInteracted] = useState(false)
  const [preloadedCovers, setPreloadedCovers] = useState<Set<string>>(new Set())
  const audioRef = useRef<HTMLAudioElement>(null)
  const wasPlayingRef = useRef(false)
  const prevTrackIndexRef = useRef(currentTrackIndex)

  const currentTrack = defaultTrack || tracks[currentTrackIndex]

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

  // Initialize audio event listeners
  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return

    const updateTime = () => setCurrentTime(audio.currentTime)
    const updateDuration = () => setDuration(audio.duration)
    const handleEnded = () => {
      wasPlayingRef.current = true
      if (currentTrackIndex < tracks.length - 1) {
        setCurrentTrackIndex(currentTrackIndex + 1)
      } else {
        setIsPlaying(false)
        wasPlayingRef.current = false
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

    audio.addEventListener('timeupdate', updateTime)
    audio.addEventListener('loadedmetadata', updateDuration)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.removeEventListener('timeupdate', updateTime)
      audio.removeEventListener('loadedmetadata', updateDuration)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [currentTrackIndex, tracks.length])

  // Update audio source only when track index actually changes
  useEffect(() => {
    const audio = audioRef.current
    if (!audio || !currentTrack) return

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

  // Handle autoplay (browsers block autoplay without user interaction)
  useEffect(() => {
    if (autoPlay && hasUserInteracted && audioRef.current) {
      audioRef.current.play().catch(console.error)
      setIsPlaying(true)
    }
  }, [autoPlay, hasUserInteracted])

  const togglePlay = () => {
    const audio = audioRef.current
    if (!audio) return

    setHasUserInteracted(true)

    if (isPlaying) {
      audio.pause()
      setIsPlaying(false)
    } else {
      audio.play().catch((error) => {
        console.error('Error playing audio:', error)
        setIsPlaying(false)
      })
      setIsPlaying(true)
    }
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current
    if (!audio) return

    const rect = e.currentTarget.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const percentage = clickX / rect.width
    audio.currentTime = percentage * duration
  }

  const formatTime = (seconds: number) => {
    if (isNaN(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0

  const skipPrev = useCallback(() => {
    wasPlayingRef.current = isPlaying
    if (currentTrackIndex > 0) {
      setCurrentTrackIndex(currentTrackIndex - 1)
    } else {
      setCurrentTrackIndex(tracks.length - 1)
    }
  }, [currentTrackIndex, tracks.length, isPlaying])

  const skipNext = useCallback(() => {
    wasPlayingRef.current = isPlaying
    if (currentTrackIndex < tracks.length - 1) {
      setCurrentTrackIndex(currentTrackIndex + 1)
    } else {
      setCurrentTrackIndex(0)
    }
  }, [currentTrackIndex, tracks.length, isPlaying])

  const selectTrack = useCallback((index: number) => {
    wasPlayingRef.current = isPlaying
    setCurrentTrackIndex(index)
  }, [isPlaying])

  return (
    <div className={`${styles.musicPlayer} ${isExpanded ? styles.expanded : ''}`}>
      <audio ref={audioRef} preload="metadata" />
      
      {/* Compact view */}
      <div className={styles.compactView}>
        <button
          onClick={togglePlay}
          className={styles.vinylButton}
          aria-label={isPlaying ? 'Pause' : 'Play'}
        >
          <div className={`${styles.vinyl} ${isPlaying ? styles.spinning : ''}`}>
            {currentTrack.cover ? (
              <img 
                key={currentTrack.cover}
                src={currentTrack.cover} 
                alt={`${currentTrack.title} cover`}
                className={styles.vinylCover}
                loading="eager"
                decoding="async"
              />
            ) : (
              <div className={styles.vinylGrooves} />
            )}
            <div className={styles.vinylCenter} />
          </div>
        </button>
        
        <div className={styles.trackInfo}>
          <div className={styles.trackTitle}>{currentTrack.title}</div>
          <div className={styles.trackArtist}>{currentTrack.artist}</div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={styles.expandButton}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          {isExpanded ? '▼' : '▲'}
        </button>
      </div>

      {/* Expanded view */}
      {isExpanded && (
        <div className={styles.expandedView}>
          <div className={styles.controls}>
            <button
              onClick={skipPrev}
              className={styles.controlButton}
              aria-label="Previous track"
            >
              ⏮
            </button>
            
            <button
              onClick={togglePlay}
              className={styles.playButton}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? '⏸' : '▶'}
            </button>
            
            <button
              onClick={skipNext}
              className={styles.controlButton}
              aria-label="Next track"
            >
              ⏭
            </button>
          </div>

          <div className={styles.progressContainer}>
            <span className={styles.time}>{formatTime(currentTime)}</span>
            <div 
              className={styles.progressBar}
              onClick={handleProgressClick}
            >
              <div 
                className={styles.progressFill}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className={styles.time}>{formatTime(duration)}</span>
          </div>

          {tracks.length > 1 && (
            <div className={styles.trackList}>
              {tracks.map((track, index) => (
                <button
                  key={index}
                  onClick={() => selectTrack(index)}
                  className={`${styles.trackItem} ${index === currentTrackIndex ? styles.active : ''}`}
                >
                  {track.title} - {track.artist}
                </button>
              ))}
            </div>
          )}

          {currentTrack.spotifyUrl && (
            <a
              href={currentTrack.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.spotifyLink}
            >
              Open in Spotify →
            </a>
          )}
        </div>
      )}
    </div>
  )
}
