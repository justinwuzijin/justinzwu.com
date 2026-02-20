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
  videoAspectRatio?: number
  videoZoom?: number
  videoPosition?: string
}

export function ExperienceCard({ company, logo, role, type, description, secondaryLogo, link, zoom, highlightDelay = 0, videoUrl, videoAspectRatio, videoZoom, videoPosition }: ExperienceCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [videoLoaded, setVideoLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Lazy load: only load video when in viewport
  useEffect(() => {
    if (!videoUrl || !containerRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true)
          observer.disconnect()
        }
      },
      { rootMargin: '100px' }
    )

    observer.observe(containerRef.current)
    return () => observer.disconnect()
  }, [videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl || !isInView) return

    const handleReady = () => {
      setVideoLoaded(true)
      video.play().catch((error) => {
        console.warn('Autoplay prevented:', error)
      })
    }

    video.addEventListener('loadeddata', handleReady)
    video.addEventListener('canplay', handleReady)
    
    if (video.readyState >= 2) {
      handleReady()
    }

    return () => {
      video.removeEventListener('loadeddata', handleReady)
      video.removeEventListener('canplay', handleReady)
    }
  }, [videoUrl, isInView])

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
      {videoUrl ? (
        <>
          {!videoLoaded && <div className={styles.logoPlaceholder} />}
          {isInView && (
            <video
              ref={videoRef}
              src={videoUrl}
              loop
              muted
              playsInline
              autoPlay
              preload="metadata"
              onLoadedData={() => setVideoLoaded(true)}
              className={`${styles.logoVideo} ${videoLoaded ? styles.logoVisible : styles.logoHidden}`}
              style={{
                ...(videoZoom && { transform: `scale(${videoZoom})` }),
                ...(videoPosition && { objectPosition: videoPosition }),
              }}
            />
          )}
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
