'use client'

import { useState } from 'react'
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
}

export function ExperienceCard({ company, logo, role, type, description, secondaryLogo, link, zoom, highlightDelay = 0 }: ExperienceCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

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
      default:
        return null
    }
  }

  const logoPath = getLogoPath()

  const logoArea = (
    <div className={styles.logoArea}>
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
