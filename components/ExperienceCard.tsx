'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './ExperienceCard.module.css'
import { UnderlineHighlight, CircleHighlight } from '@/components/Highlights'

interface ExperienceCardProps {
  company: string
  logo: string
  role: string
  type: string
  description: string
  secondaryLogo?: string
  link?: string
  zoom?: number
  highlightDelay?: number
  videoUrl?: string
  vimeoId?: string
  videoPoster?: string
  videoAspectRatio?: number
  videoZoom?: number
  videoPosition?: string
  videoStartTime?: number
}

export function ExperienceCard({ company, logo, role, type, description, secondaryLogo, link, zoom, highlightDelay = 0, videoUrl, vimeoId, videoPoster, videoAspectRatio, videoZoom, videoPosition, videoStartTime }: ExperienceCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [posterLoaded, setPosterLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasBeenInView, setHasBeenInView] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const [iframeLoaded, setIframeLoaded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const hasVideo = videoUrl || vimeoId

  useEffect(() => {
    const container = containerRef.current
    if (!container || !hasVideo) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting)
        if (entry.isIntersecting) {
          setHasBeenInView(true)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [hasVideo])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    let onSeekedRef: (() => void) | null = null

    const handleReady = () => {
      if (videoStartTime != null && videoStartTime > 0) {
        video.currentTime = videoStartTime
        onSeekedRef = () => {
          setVideoReady(true)
          video.removeEventListener('seeked', onSeekedRef!)
        }
        video.addEventListener('seeked', onSeekedRef)
      } else {
        setVideoReady(true)
      }
    }

    video.addEventListener('loadeddata', handleReady)

    if (video.readyState >= 2) {
      handleReady()
    }

    return () => {
      video.removeEventListener('loadeddata', handleReady)
      if (onSeekedRef) {
        video.removeEventListener('seeked', onSeekedRef)
      }
    }
  }, [videoUrl, videoStartTime])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoReady) return

    if (isInView) {
      video.play().catch((error) => {
        console.warn('Autoplay prevented:', error)
      })
    } else {
      video.pause()
    }
  }, [isInView, videoReady])

  const getLogoPath = () => {
    switch (logo) {
      case 'ontario':
        return '/assets/svg/bestttonee.png'
      case 'clipabit':
        return '/assets/svg/clipp.png'
      case 'cursor':
        return '/assets/svg/Cursor.png'
      case 'socratica':
        return '/assets/svg/socratica.png'
      case 'bridging':
        return '/assets/svg/bgbggbbg.png'
      case 'youtuber':
        return '/assets/svg/youtuber.png'
      case 'createmarkham':
        return '/assets/svg/createmarkham.png'
      case 'studentcouncil':
        return '/assets/svg/studentcouncil.png'
      case 'anniversary':
        return '/assets/svg/anniversary.png'
      case 'placeholder':
        return null
      default:
        return null
    }
  }

  const isPlaceholder = logo === 'placeholder'

  const logoPath = getLogoPath()

  const logoArea = (
    <div 
      ref={containerRef}
      className={styles.logoArea}
      style={videoAspectRatio ? { aspectRatio: videoAspectRatio } : undefined}
    >
      {vimeoId ? (
        <>
          {videoPoster && (
            <Image
              src={videoPoster}
              alt={`${company} preview`}
              fill
              className={`${styles.logoImage} ${posterLoaded ? styles.logoVisible : styles.logoHidden} ${iframeLoaded ? styles.logoHidden : ''}`}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{
                ...(videoZoom && { transform: `scale(${videoZoom})` }),
                ...(videoPosition && { objectPosition: videoPosition }),
              }}
              onLoad={() => setPosterLoaded(true)}
              priority
            />
          )}
          {!posterLoaded && !iframeLoaded && <div className={styles.logoPlaceholder} />}
          {hasBeenInView && (
            <iframe
              src={`https://player.vimeo.com/video/${vimeoId}?autoplay=1&loop=1&muted=1&background=1&quality=auto`}
              className={`${styles.logoVideo} ${iframeLoaded ? styles.logoVisible : styles.logoHidden}`}
              style={{
                transform: [
                  videoZoom ? `scale(${videoZoom})` : '',
                  videoPosition ? `translateY(${videoPosition})` : '',
                ].filter(Boolean).join(' ') || undefined,
              }}
              allow="autoplay; fullscreen"
              frameBorder="0"
              onLoad={() => setIframeLoaded(true)}
            />
          )}
        </>
      ) : videoUrl ? (
        <>
          {videoPoster && (
            <Image
              src={videoPoster}
              alt={`${company} preview`}
              fill
              className={`${styles.logoImage} ${posterLoaded ? styles.logoVisible : styles.logoHidden} ${videoReady ? styles.logoHidden : ''}`}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={{
                ...(videoZoom && { transform: `scale(${videoZoom})` }),
                ...(videoPosition && { objectPosition: videoPosition }),
              }}
              onLoad={() => setPosterLoaded(true)}
              priority
            />
          )}
          {!posterLoaded && <div className={styles.logoPlaceholder} />}
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            muted
            playsInline
            preload="auto"
            className={`${styles.logoVideo} ${videoReady ? styles.logoVisible : styles.logoHidden}`}
            style={{
              ...(videoZoom && { transform: `scale(${videoZoom})` }),
              ...(videoPosition && { objectPosition: videoPosition }),
            }}
          />
        </>
      ) : isPlaceholder ? (
        <div className={styles.placeholderIcon}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
        </div>
      ) : (
        <>
          {!imageLoaded && !imageError && logoPath && (
            <div className={styles.logoPlaceholder} />
          )}
          {logoPath && (
            <Image
              src={logoPath}
              alt={`${company} logo`}
              fill
              className={`${styles.logoImage} ${imageLoaded ? styles.logoVisible : styles.logoHidden}`}
              sizes="(max-width: 768px) 100vw, 50vw"
              style={zoom ? { transform: `scale(${zoom})` } : undefined}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
              loading="lazy"
              quality={85}
            />
          )}
        </>
      )}
    </div>
  )

  return (
    <article className={styles.card}>
      {link ? (
        <Link href={link} target="_blank" rel="noopener noreferrer">
          {logoArea}
        </Link>
      ) : (
        logoArea
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.role}><UnderlineHighlight delay={highlightDelay}>{role}</UnderlineHighlight></h3>
          <span className={styles.type}><CircleHighlight delay={highlightDelay + 0.15}>{type}</CircleHighlight></span>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  )
}
