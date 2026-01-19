import Image from 'next/image'
import styles from './ExperienceCard.module.css'

interface ExperienceCardProps {
  company: string
  logo: string
  role: string
  type: string
  description: string
  secondaryLogo?: string
}

export function ExperienceCard({ company, logo, role, type, description, secondaryLogo }: ExperienceCardProps) {
  const getLogoPath = () => {
    switch (logo) {
      case 'ontario':
        return '/assets/svg/OPS.svg'
      case 'clipabit':
        return '/assets/svg/CLIPABIT.svg'
      case 'cursor':
        return '/assets/svg/cursor.svg'
      case 'socratica':
        return '/assets/svg/socratica.svg'
      case 'bridging':
        return '/assets/svg/BG.svg'
      default:
        return null
    }
  }

  const logoPath = getLogoPath()

  return (
    <article className={styles.card}>
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
