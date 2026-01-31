'use client'

import { motion } from 'framer-motion'
import styles from './page.module.css'
import { ProjectCard } from '@/components/ProjectCard'
import { TitleHover } from '@/components/TitleHover'
import { HeroHeader } from '@/components/HeroHeader'
import { LinkPreview } from '@/components/ui/link-preview'

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

const projectCardVariant = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

const projects = [
  {
    id: 'skema',
    title: 'Skema',
    date: "Jan '26",
    description: 'An npm package that transforms your localhost into an interactive whiteboard where you can draw new components, edit directly on your live website.',
    image: '/assets/svg/skeeeemaar.png',
    url: 'https://devpost.com/software/skema-wta8kn?ref_content=user-portfolio&ref_feature=in_progress',
    dark: false,
  },
  {
    id: 'cision',
    title: 'Cision',
    date: "Jan '26",
    description: 'Cursor for city planners. Built an interactive 3D heatmap that redesigns dangerous Toronto intersections. Users can find high-risk locations, generate improvements in real-time, and chat with voice agent stakeholders.',
    image: '/assets/svg/Copy of Untitled Design.png',
    url: 'https://github.com/Lemirq/cision',
    dark: true,
  },
  {
    id: 'recollect',
    title: 'Recollect',
    date: "Nov '25",
    description: 'An app that allows you to scan your receipts and turns your everyday, mundane purchases into a meaningful digital scrapbook of memories you can collect, decorate, and share.',
    image: '/assets/svg/recollect.svg',
    url: 'https://devpost.com/software/recollect-t5okgv?ref_content=user-portfolio&ref_feature=in_progress',
    dark: false,
    zoom:1.01
  },
  {
    id: 'performeter',
    title: 'Performeter',
    date: "Oct '25",
    description: 'A Chrome extension for Tinder.com. It scrapes bio text and calls an LLM with a structured prompt to output a score of how "performative" someones profile is. (Toronto Stupid Hackathon project)',
    image: '/assets/svg/performeter.svg',
    url: 'https://github.com/justinwuzijin/performeter67',
    dark: false,
    zoom: 1.01,
  },
  {
    id: '4sight',
    title: '4Sight',
    date: "May '25",
    description: 'An at-home vision screening app. Simulates gaze-tracking, peripheral, and Snellen tests to provide an estimated prescription and recommended treatment options.',
    image: '/assets/svg/Copy of Untitled Design copy.png',
    url: 'https://github.com/justinwuzijin/eye-tester-app',
    dark: false,
    zoom: 1.045,
  },
  {
    id: '3d-gallery',
    title: '3D Interactive Stills Gallery',
    date: "Aug '25",
    description: 'An interactive sphere-based gallery that showcases stills from my youtube videos in a dynamic 3D environment.',
    image: '/assets/svg/art2.png',
    url: 'https://github.com/justinwuzijin/spinning-3d-gallery',
    dark: false,
  },
  {
    id: 'takeone',
    title: 'TakeOne',
    date: 'Ongoing',
    description: 'A creative network platform that matches indie filmmakers in Toronto with industry professionals.',
    image: '/assets/svg/takeonenoee.png',
    url: 'https://www.figma.com/design/VPNthnTDvDgzUz8DNFteew/takeone-beta?node-id=0-1&t=pSdgZlzq8D3XCA8F-1',
    dark: false,
  },
]

export default function MePage() {
  return (
    <div className={styles.container}>
      {/* Hero section with header and hover title */}
      <motion.section 
        className={styles.hero}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        <motion.div variants={fadeInUp}>
          <HeroHeader />
        </motion.div>
        <motion.div variants={fadeInUp}>
          <TitleHover />
        </motion.div>
        <motion.div className={styles.subtitle} variants={fadeInUp}>
          <LinkPreview url="https://uwaterloo.ca/future-students/programs/systems-design-engineering" className={styles.highlightYellow}>Systems Design Engineering</LinkPreview>{' '}
            @UWaterloo
        </motion.div>
      </motion.section>

      {/* About section */}
      <motion.section 
        className={styles.about}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={staggerContainer}
      >
        <motion.h2 className={styles.sectionTitle} variants={fadeInUp}>i like creating and building cool stuff:</motion.h2>
        <motion.ul className={styles.bulletList} variants={staggerContainer}>
          <motion.li variants={fadeInUp}>
            {'>'} developing enterprise government systems{' '}
            <LinkPreview 
              url="https://www.ontario.ca/page/ministry-public-and-business-service-delivery-and-procurement" 
              className={styles.highlightGreen}
            >
              @ONgov
            </LinkPreview>
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} building ClipABit, a semantic search DaVinci Resolve plug-in{' '}
            <LinkPreview 
              url="https://clipabit.web.app/" 
              className={styles.highlightYellow}
            >
              @WAT.ai
            </LinkPreview>
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} starting a{' '}
            <LinkPreview 
              url="https://cursor.com/home?from=agents" 
              className={styles.highlightGrey}
            >
              Cursor
            </LinkPreview>{' '}
            campus community @Waterloo
          </motion.li>
      
          <motion.li variants={fadeInUp}>
            {'>'} produced videos for{' '}
            <LinkPreview 
              url="https://www.bridginggens.com/" 
              className={styles.highlightBlue}
            >
              Bridging Gens
            </LinkPreview>
            ,{' '}
            <LinkPreview 
              url="https://www.socratica.info/" 
              className={styles.highlightBlue}
            >
              Socratica
            </LinkPreview>
            ,{' '}
            <LinkPreview 
              url="https://www.figma.com/" 
              className={styles.highlightBlue}
            >
              Figma Waterloo
            </LinkPreview>
            ,{' '}
            <LinkPreview 
              url="https://cursor.com/home?from=agents" 
              className={styles.highlightGrey}
            >
              Cursor
            </LinkPreview>{' '}
            in 1A
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} lead{' '}
            <LinkPreview 
              url="https://www.tsac.ca/" 
              className={styles.highlightRed}
            >
             TrudeauSAC
            </LinkPreview>
              as president in gr11 & 12 
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} made films with{' '}
            <LinkPreview 
              url="https://www.instagram.com/five24.film/" 
              className={styles.highlightPurple}
              isStatic
              imageSrc="/assets/svg/Screenshot 2026-01-21 at 2.44.58 PM.png"
            >
              five24
            </LinkPreview>{' '}
            and cool youtube videos{' '}
            <LinkPreview 
              url="https://www.youtube.com/@byjustinwu" 
              className={styles.highlightPurple}
            >
              @byjustinwu
            </LinkPreview>{' '}
            in hs
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} seeking <b>fall 2026</b> internship opportunities!
          </motion.li>
        </motion.ul>
      </motion.section>

      {/* Projects section */}
      <motion.section 
        className={styles.projects}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-50px" }}
        variants={staggerContainer}
      >
        <motion.h2 className={styles.projectsTitle} variants={fadeInUp}>
          <span className={styles.orangeDot} />
          projects
        </motion.h2>
        <motion.div 
          className={styles.projectsGrid}
          variants={staggerContainer}
        >
          {projects.map((project, index) => (
            <motion.div key={project.id} variants={projectCardVariant}>
              <ProjectCard {...project} />
            </motion.div>
          ))}
        </motion.div>
      </motion.section>
    </div>
  )
}
