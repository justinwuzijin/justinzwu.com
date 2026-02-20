'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import styles from './ProjectCard.module.css'
import { UnderlineHighlight, CircleHighlight } from '@/components/Highlights'

interface ProjectCardProps {
  id: string
  title: string
  date: string
  description: string
  image: string
  url?: string
  dark?: boolean
  zoom?: number
  highlightDelay?: number
  videoUrl?: string
  videoPoster?: string
  videoZoom?: number
  videoPosition?: string
  videoSpeed?: number
}

export function ProjectCard({ title, date, description, image, url, dark, zoom, highlightDelay = 0, videoUrl, videoPoster, videoZoom, videoPosition, videoSpeed }: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)
  const [posterLoaded, setPosterLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [videoReady, setVideoReady] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container || !videoUrl) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting),
      { threshold: 0.3 }
    )
    observer.observe(container)
    return () => observer.disconnect()
  }, [videoUrl])

  useEffect(() => {
    const video = videoRef.current
    if (!video || !videoUrl) return

    const handleReady = () => {
      setVideoReady(true)
      if (videoSpeed) {
        video.playbackRate = videoSpeed
      }
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
  }, [videoUrl, videoSpeed])

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

  const imageContent = (
    <div 
      ref={containerRef} 
      className={`${styles.imageWrapper} ${dark ? styles.darkBg : ''}`}
    >
      {videoUrl ? (
        <>
          {videoPoster && (
            <Image
              src={videoPoster}
              alt={title}
              fill
              className={`${styles.projectImage} ${posterLoaded ? styles.imageVisible : styles.imageHidden} ${videoReady ? styles.imageHidden : ''}`}
              sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
              style={{
                ...(videoZoom && { transform: `scale(${videoZoom})` }),
                ...(videoPosition && { objectPosition: videoPosition }),
              }}
              onLoad={() => setPosterLoaded(true)}
              priority
            />
          )}
          {!posterLoaded && <div className={styles.imagePlaceholder} />}
          <video
            ref={videoRef}
            src={videoUrl}
            loop
            muted
            playsInline
            preload="auto"
            className={`${styles.projectVideo} ${videoReady ? styles.imageVisible : styles.imageHidden}`}
            style={{
              ...(videoZoom && { transform: `scale(${videoZoom})` }),
              ...(videoPosition && { objectPosition: videoPosition }),
            }}
          />
        </>
      ) : (
        <>
          {!imageLoaded && !imageError && (
            <div className={styles.imagePlaceholder} />
          )}
          <Image 
            src={image} 
            alt={title}
            className={`${styles.projectImage} ${imageLoaded ? styles.imageVisible : styles.imageHidden}`}
            fill
            sizes="(max-width: 480px) 100vw, (max-width: 768px) 50vw, 33vw"
            style={zoom ? { transform: `scale(${zoom})` } : undefined}
            onLoad={() => setImageLoaded(true)}
            onError={() => setImageError(true)}
            loading="lazy"
            quality={85}
          />
        </>
      )}
    </div>
  )

  return (
    <article className={styles.card}>
      {url ? (
        <Link href={url} target="_blank" rel="noopener noreferrer" className={styles.imageLink}>
          {imageContent}
        </Link>
      ) : (
        imageContent
      )}
      <div className={styles.content}>
        <div className={styles.header}>
          <h3 className={styles.title}><UnderlineHighlight delay={highlightDelay}>{title}</UnderlineHighlight></h3>
          <span className={styles.date}><CircleHighlight delay={highlightDelay + 0.2}>{date}</CircleHighlight></span>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  )
}
