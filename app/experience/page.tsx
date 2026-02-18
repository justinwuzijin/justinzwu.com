'use client'

import { motion } from 'framer-motion'
import styles from './page.module.css'
import { ExperienceCard } from '@/components/ExperienceCard'

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
}

const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

const experiences = [
  {
    id: 'ontario',
    company: 'Ontario',
    logo: 'ontario',
    role: 'Software Engineer',
    type: 'internship',
    description: 'During Winter 2026, I worked @ONgov (Ministry of Public and Business Service Delivery and Procurement) as a software developer.',
    link: 'https://www.ontario.ca/page/ministry-public-and-business-service-delivery-and-procurement',
  },
  {
    id: 'clipabit',
    company: 'Clipabit',
    logo: 'clipabit',
    role: 'Full Stack Developer',
    type: 'design team',
    description: 'During Fall 2025 and Winter 2026, I worked with seven other UW students to build ClipABit, a semantic search DaVinci Resolve plug-in that uses natural language queries to find exact clips straight from your library.',
    secondaryLogo: 'watai',
    link: 'https://clipabit.web.app/',
  },
  {
    id: 'cursor',
    company: 'Campus Ambassador',
    logo: 'cursor',
    role: 'Campus Ambassador',
    type: 'community',
    description: 'Official uWaterloo Cursor Campus Ambassador for Winter 2026 and Summer 2026 term. Running campus-wide events such as Cafe Cursor.',
    link: 'https://cursor.com/home?utm_source=google&utm_campaign=[Static]_New_Search_Brand_[B2C]_[Brand]_[Desktop]&utm_term=cursor&utm_creative=&utm_medium=cpc&utm_content=793094759454&cc_platform=google&cc_campaignid=23463995700&cc_adgroupid=190461701206&cc_adid=793094759454&cc_keyword=cursor&cc_matchtype=b&cc_device=c&cc_network=g&cc_placement=&cc_location=9000960&cc_adposition=&gad_source=1&gad_campaignid=23463995700&gbraid=0AAAABAkdGgRLBOhMPres5hNm_dUO7NAsJ&gclid=CjwKCAiAybfLBhAjEiwAI0mBBj7ruc_XixYDWlwTQNHEmPRIbquTKVCLH0KB3ydsei3N_UwNI4CsnRoCaBoQAvD_BwE',
    zoom: 1.01,
  },
  {
    id: 'socratica',
    company: 'Socratica',
    logo: 'socratica',
    role: 'Socratica',
    type: 'community',
    description: 'Helped facilitate events and create promotional and recap content for Socratica during Fall 2025.',
    link: 'https://www.socratica.info/',
    zoom: 1.01,
  },
  {
    id: 'bridging',
    company: 'Bridging Generations',
    logo: 'bridging',
    role: 'Bridging Generations',
    type: 'non-profit',
    description: "Producing Bridging Generations' fourth documentary: The International Experience. Interviewed four UW international students on their experience, voices, stories, and perspectives, scheduled to come out February.",
    link: 'https://www.bridginggens.com/',
  },
]

export default function ExperiencePage() {
  return (
    <div className={styles.container}>
      <motion.h1 
        className={styles.pageTitle}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <span className={styles.orangeDot} />
        experience
      </motion.h1>

      <motion.div 
        className={styles.experienceGrid}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {experiences.map((exp, index) => {
          const delays = [0.3, 0.3, 0.9, 0.9, 1.5]
          return (
            <motion.div key={exp.id} variants={cardVariant}>
              <ExperienceCard {...exp} highlightDelay={delays[index] || 0.3} />
            </motion.div>
          )
        })}
      </motion.div>
    </div>
  )
}
