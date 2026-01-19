import styles from './page.module.css'
import { ExperienceCard } from '@/components/ExperienceCard'

const experiences = [
  {
    id: 'ontario',
    company: 'Ontario',
    logo: 'ontario',
    role: 'Software Engineer',
    type: 'internship',
    description: 'During Winter 2026, I worked @ONgov (Ministry of Public and Business Service Delivery and Procurement) as a software developer.',
  },
  {
    id: 'clipabit',
    company: 'Clipabit',
    logo: 'clipabit',
    role: 'Full Stack Developer',
    type: 'design team',
    description: 'During Fall 2025 and Winter 2026, I worked as a full-stack developer with six other UW students. Building ClipABit, a semantic search plug-in that uses natural language queries to find exact clips straight from your DaVinci Resolve library.',
    secondaryLogo: 'watai',
  },
  {
    id: 'cursor',
    company: 'Campus Ambassador',
    logo: 'cursor',
    role: 'Campus Ambassador',
    type: 'community',
    description: 'Official uWaterloo Cursor Campus Ambassador for Winter 2026 and Summer 2026 term. Running campus-wide events such as Cafe Cursor.',
  },
  {
    id: 'socratica',
    company: 'Socratica',
    logo: 'socratica',
    role: 'Socratica',
    type: 'community',
    description: 'Helped facilitate events and create promotional and recap content for Socratica during Fall 2025.',
  },
  {
    id: 'bridging',
    company: 'Bridging Generations',
    logo: 'bridging',
    role: 'Bridging Generations',
    type: 'non-profit',
    description: "Producing Bridging Generations' fourth documentary: The International Experience. Interviewed four UW international students on their experience, voices, stories, and perspectives, scheduled to come out February.",
  },
]

export default function ExperiencePage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <span className={styles.orangeDot} />
        experience
      </h1>

      <div className={styles.experienceGrid}>
        {experiences.map((exp) => (
          <ExperienceCard key={exp.id} {...exp} />
        ))}
      </div>
    </div>
  )
}
