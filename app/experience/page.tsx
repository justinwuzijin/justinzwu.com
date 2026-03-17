'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import styles from './page.module.css'
import { ExperienceCard } from '@/components/ExperienceCard'
import { useSoundEffects } from '@/hooks/useSoundEffects'

type TabType = 'current' | 'past'

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

const currentExperiences = [
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
    vimeoId: '1172749355',
    videoPoster: '/assets/experience-videos/posters/clipabit.jpg',
    videoZoom: 1.15,
  },
  {
    id: 'cursor',
    company: 'Cursor Campus Lead',
    logo: 'cursor',
    role: 'Cursor Campus Lead',
    type: 'community',
    description: 'Official uWaterloo Cursor Campus Lead for Winter 2026 and Summer 2026 term. Running campus-wide events such as Cafe Cursor.',
    link: 'https://cursor-waterloo.vercel.app/',
    zoom: 1.01,
    vimeoId: '1172727625',
    videoPoster: '/assets/experience-videos/posters/youtube-filmmaker.jpg',
    videoZoom: 1.20,
  },
  {
    id: 'summerhacks',
    company: 'SummerHacks',
    logo: 'placeholder',
    role: 'SummerHacks Executive',
    type: 'hackathon',
    description: 'Build under open skies. Hosting a hackathon in August 2026.',
    link: 'https://summerhacks.ca/',
    vimeoId: '1172727462',
    videoPoster: '/assets/experience-videos/posters/summerhacks.jpg',
    videoZoom: 1.15,
  },
  {
    id: 'bridging',
    company: 'Bridging Generations',
    logo: 'bridging',
    role: 'Bridging Generations Executive ',
    type: 'non-profit',
    description: "Producing Bridging Generations' fourth documentary: The International Experience. Interviewed four UW international students on their experience, voices, stories, and perspectives, scheduled to come out February.",
    link: 'https://www.bridginggens.com/',
    zoom: 1.01,
    vimeoId: '1172727440',
    videoPoster: '/assets/experience-videos/posters/bridging-generations.jpg',
    videoZoom: 1.42,
  },
  {
    id: 'youtuber',
    company: 'Youtuber',
    logo: 'youtuber',
    role: 'Youtube Filmmaker',
    type: 'personal',
    description: 'Sharing my coming-of-age stories, short films, video journal entries.',
    link: 'https://www.youtube.com/@byjustinwu/featured',
    vimeoId: '1172726594',
    videoPoster: '/assets/art-gallery/posters/central-piece.jpg',
    videoZoom: 1.12,
  },
]

const highSchoolExperiences = [
  {
    id: 'socratica',
    company: 'Socratica',
    logo: 'socratica',
    role: 'Socratica Member',
    type: 'community',
    description: 'Helped facilitate events and create promotional and recap content for Socratica during Fall 2025.',
    link: 'https://www.socratica.info/',
    zoom: 1.10,
    vimeoId: '1172751915',
    videoPoster: '/assets/experience-videos/posters/cursor-ambassador.jpg',
    videoZoom: 1.40,
  },
  {
    id: 'president',
    company: 'Student Council',
    logo: 'studentcouncil',
    role: 'Student Council President',
    type: 'high school',
    description: 'Elected president for 2 consecutive years. Oversaw operations for a 25+ member council. Led planning for 8+ school-wide events annually for 1850+ students.',
    link: 'https://www.tsac.ca/',
  },
  {
    id: 'createmarkham',
    company: 'CREATE Markham',
    logo: 'createmarkham',
    role: 'CREATE Markham Executive', 
    type: 'high school',
    description: 'Organized 200+ attendee leadership conference for students in the GTA. Led team of 11 delegates to work with Asian Roots Collective on a 100+ attendee youth basketball and wellness event.',
    link: 'https://www.instagram.com/createmarkham/',
    vimeoId: '1172750796',
    videoPoster: '/assets/experience-videos/posters/create-conference.jpg',
    videoZoom: 1.12,
  },
  {
    id: 'anniversary',
    company: '20th Anniversary Film',
    logo: 'anniversary',
    role: '20th Anniversary Film Director',
    type: 'high school',
    description: 'Premiering a 30-minute film to an audience of past alumni in May 2026. Directed and edited a documentary celebrating 20 years of school community history.',
    link: 'https://drive.google.com/file/d/1T9E8hcpMLcUBIqRNCxzvCWNxfFiP7HjG/view',
    vimeoId: '1172727503',
    videoPoster: '/assets/experience-videos/posters/anniversary-film.jpg',
    videoPosition: '5%',
    videoZoom: 1.30,
  },
]

export default function ExperiencePage() {
  const [activeTab, setActiveTab] = useState<TabType>('current')
  const { playClick } = useSoundEffects()
  const tabs: TabType[] = ['current', 'past']
  

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

      {/* Filter tabs */}
      <motion.div 
        className={styles.tabs}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {tabs.map((tab) => {
          const dotClass = tab === 'current' ? styles.dotCurrent : styles.dotHighSchool
          
          return (
            <motion.button
              key={tab}
              onClick={() => {
                playClick()
                setActiveTab(tab)
              }}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              variants={fadeInUp}
            >
              <span className={`${styles.tabDot} ${dotClass}`} />
              {tab}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Experience grids - both rendered, inactive hidden to preserve iframe state */}
      {(['current', 'past'] as const).map((tab) => {
        const items = tab === 'current' ? currentExperiences : highSchoolExperiences
        const isActive = activeTab === tab
        return (
          <motion.div
            key={tab}
            className={styles.experienceGrid}
            initial="hidden"
            animate={isActive ? 'visible' : 'hidden'}
            variants={staggerContainer}
            style={{ display: isActive ? undefined : 'none' }}
          >
            {items.map((exp, index) => {
              const delays = [0.3, 0.3, 0.9, 0.9, 1.5, 1.5]
              return (
                <motion.div key={exp.id} variants={cardVariant}>
                  <ExperienceCard {...exp} highlightDelay={delays[index] || 0.3} />
                </motion.div>
              )
            })}
          </motion.div>
        )
      })}
    </div>
  )
}
