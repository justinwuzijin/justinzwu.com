'use client'

import { useState } from 'react'
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
}

export function ProjectCard({ title, date, description, image, url, dark, zoom, highlightDelay = 0 }: ProjectCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  const imageContent = (
    <div className={`${styles.imageWrapper} ${dark ? styles.darkBg : ''}`}>
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
