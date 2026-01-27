import Link from 'next/link'
import styles from './ProjectCard.module.css'

interface ProjectCardProps {
  id: string
  title: string
  date: string
  description: string
  image: string
  url?: string
  dark?: boolean
  zoom?: number
}

export function ProjectCard({ title, date, description, image, url, dark, zoom }: ProjectCardProps) {
  const imageContent = (
    <div className={`${styles.imageWrapper} ${dark ? styles.darkBg : ''}`}>
      <img 
        src={image} 
        alt={title}
        className={styles.projectImage}
        style={zoom ? { transform: `scale(${zoom})` } : undefined}
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
          <h3 className={styles.title}>{title}</h3>
          <span className={styles.date}>{date}</span>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  )
}
