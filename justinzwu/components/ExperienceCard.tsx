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
        return '/assets/svg/OPS.png'
      case 'clipabit':
        return '/assets/svg/ClipABit.png'
      case 'cursor':
        return '/assets/svg/Cursor.png'
      case 'socratica':
        return '/assets/svg/socratica.png'
      case 'bridging':
        return '/assets/svg/BG.png'
      default:
        return null
    }
  }

  const logoPath = getLogoPath()

  return (
    <article className={styles.card}>
      <div className={styles.logoArea}>
        <div className={styles.logo}>
          {logoPath && (
            <Image
              src={logoPath}
              alt={`${company} logo`}
              width={200}
              height={60}
              className={styles.logoImage}
              style={{ objectFit: 'contain', height: 'auto', width: 'auto' }}
            />
          )}
        </div>
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
