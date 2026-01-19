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
  return (
    <article className={styles.card}>
      <div className={styles.logoArea}>
        <div className={styles.logo}>
          {logo === 'ontario' && (
            <span className={styles.ontarioLogo}>
              Ontario <span className={styles.trillium}>🔱</span>
            </span>
          )}
          {logo === 'clipabit' && (
            <div className={styles.clipabitWrapper}>
              <span className={styles.clipabitLogo}>✖lipabit</span>
              {secondaryLogo === 'watai' && (
                <span className={styles.wataiLogo}>🦋</span>
              )}
            </div>
          )}
          {logo === 'cursor' && (
            <span className={styles.cursorLogo}>⬛ CURSOR</span>
          )}
          {logo === 'socratica' && (
            <span className={styles.socraticaLogo}>CREATE ALL NIGHT</span>
          )}
          {logo === 'bridging' && (
            <span className={styles.bridgingLogo}>BRIDGING ⬌ GENERATIONS</span>
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
