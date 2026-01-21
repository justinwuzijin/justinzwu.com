import Image from 'next/image'
import Link from 'next/link'
import styles from './ExperienceCard.module.css'

interface ExperienceCardProps {
  company: string
  logo: string
  role: string
  type: string
  description: string
  secondaryLogo?: string
  link?: string
}

export function ExperienceCard({ company, logo, role, type, description, secondaryLogo, link }: ExperienceCardProps) {
  const getLogoPath = () => {
    switch (logo) {
      case 'ontario':
        return '/assets/svg/OPS.svg'
      case 'clipabit':
        return '/assets/svg/CLIPABIT.svg'
      case 'cursor':
        return '/assets/svg/Cursor.png'
      case 'socratica':
        return '/assets/svg/socratica.png'
      case 'bridging':
        return '/assets/svg/BG.svg'
      default:
        return null
    }
  }

  const logoPath = getLogoPath()

  const logoArea = (
    <div className={styles.logoArea}>
      {logoPath && (
        <Image
          src={logoPath}
          alt={`${company} logo`}
          fill
          className={styles.logoImage}
          sizes="(max-width: 768px) 100vw, 50vw"
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
          <h3 className={styles.role}>{role}</h3>
          <span className={styles.type}>{type}</span>
        </div>
        <p className={styles.description}>{description}</p>
      </div>
    </article>
  )
}
