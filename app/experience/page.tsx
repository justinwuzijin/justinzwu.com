'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { ExperienceCard } from '@/components/ExperienceCard'

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
    videoUrl: '/assets/experience-videos/clipabit.mov',
    videoZoom: 1.07,
  },
  {
    id: 'cursor',
    company: 'Cursor Campus Ambassador',
    logo: 'cursor',
    role: 'Cursor Campus Ambassador',
    type: 'community',
    description: 'Official uWaterloo Cursor Campus Ambassador for Winter 2026 and Summer 2026 term. Running campus-wide events such as Cafe Cursor.',
    link: 'https://cursor.com/home?utm_source=google&utm_campaign=[Static]_New_Search_Brand_[B2C]_[Brand]_[Desktop]&utm_term=cursor&utm_creative=&utm_medium=cpc&utm_content=793094759454&cc_platform=google&cc_campaignid=23463995700&cc_adgroupid=190461701206&cc_adid=793094759454&cc_keyword=cursor&cc_matchtype=b&cc_device=c&cc_network=g&cc_placement=&cc_location=9000960&cc_adposition=&gad_source=1&gad_campaignid=23463995700&gbraid=0AAAABAkdGgRLBOhMPres5hNm_dUO7NAsJ&gclid=CjwKCAiAybfLBhAjEiwAI0mBBj7ruc_XixYDWlwTQNHEmPRIbquTKVCLH0KB3ydsei3N_UwNI4CsnRoCaBoQAvD_BwE',
    zoom: 1.01,
    videoUrl: '/assets/experience-videos/youtube-filmmaker.mp4',
  },
  {
    id: 'socratica',
    company: 'Socratica',
    logo: 'socratica',
    role: 'Socratica Member',
    type: 'community',
    description: 'Helped facilitate events and create promotional and recap content for Socratica during Fall 2025.',
    link: 'https://www.socratica.info/',
    zoom: 1.01,
    videoUrl: '/assets/experience-videos/cursor-ambassador.mp4',
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
    videoUrl: '/assets/experience-videos/bridging-generations.m4v',
    videoZoom: 1.18,
  },
  {
    id: 'youtuber',
    company: 'Youtuber',
    logo: 'youtuber',
    role: 'Youtube Filmmaker',
    type: 'personal',
    description: 'Sharing my coming-of-age stories, short films, video journal entries.',
    link: 'https://www.youtube.com/@byjustinwu',
    videoUrl: '/assets/art-gallery/central-piece.mp4',
  },
]

const highSchoolExperiences = [
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
    link: 'https://www.createmarkham.ca/',
    videoUrl: '/assets/experience-videos/create-conference.mp4',
  },
  {
    id: 'anniversary',
    company: '20th Anniversary Film',
    logo: 'anniversary',
    role: '20th Anniversary Film Director',
    type: 'high school',
    description: 'Premiering a 30-minute film to an audience of past alumni in May 2026. Directed and edited a documentary celebrating 20 years of school community history.',
    link: 'https://www.instagram.com/trudeau20thfilm/',
    videoUrl: '/assets/experience-videos/anniversary-film.mp4',
    videoPosition: 'center 20%',
  },
]

export default function ExperiencePage() {
  const [activeTab, setActiveTab] = useState<TabType>('current')
  const tabs: TabType[] = ['current', 'past']
  
  const experiences = activeTab === 'current' ? currentExperiences : highSchoolExperiences

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
              onClick={() => setActiveTab(tab)}
              className={`${styles.tab} ${activeTab === tab ? styles.activeTab : ''}`}
              variants={fadeInUp}
            >
              <span className={`${styles.tabDot} ${dotClass}`} />
              {tab}
            </motion.button>
          )
        })}
      </motion.div>

      {/* Experience grid with animation */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          className={styles.experienceGrid}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0 }}
          variants={staggerContainer}
        >
          {experiences.map((exp, index) => {
            const delays = [0.3, 0.3, 0.9, 0.9, 1.5, 1.5]
            return (
              <motion.div key={exp.id} variants={cardVariant}>
                <ExperienceCard {...exp} highlightDelay={delays[index] || 0.3} />
              </motion.div>
            )
          })}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
