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

const drawVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] as const, delay },
      opacity: { duration: 0.3, delay },
    },
  }),
}

const circlePaths = [
  "M 8 20 C 8 8, 20 4, 50 4 C 80 4, 94 10, 94 20 C 94 30, 80 36, 50 36 C 20 36, 8 32, 8 20",
  "M 6 18 C 4 6, 25 2, 52 3 C 82 4, 96 12, 95 22 C 94 32, 75 38, 48 37 C 18 36, 8 30, 6 18",
  "M 10 22 C 12 10, 28 5, 55 6 C 78 7, 92 14, 90 24 C 88 34, 70 37, 45 36 C 22 35, 8 28, 10 22",
  "M 5 19 C 3 7, 22 3, 48 4 C 76 5, 95 11, 96 21 C 97 31, 78 37, 50 38 C 20 39, 7 31, 5 19",
]

let circleIndex = 0

function CircleHighlight({ children, className = '', delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  const pathIndex = circleIndex++ % circlePaths.length
  
  return (
    <span className={`${styles.circleHighlight} ${className}`}>
      <motion.svg 
        viewBox="0 0 100 40"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.path
          d={circlePaths[pathIndex]}
          variants={drawVariants}
          custom={delay}
        />
      </motion.svg>
      {children}
    </span>
  )
}

const underlinePaths = [
  "M 2 5 Q 50 8, 100 4 T 198 6",
  "M 2 6 Q 40 3, 90 7 Q 140 4, 198 5",
  "M 2 4 Q 60 7, 110 3 T 198 6",
  "M 2 5 Q 45 2, 95 6 Q 150 3, 198 5",
  "M 2 6 Q 55 4, 105 7 T 198 4",
]

let underlineIndex = 0

function UnderlineHighlight({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const pathIndex = underlineIndex++ % underlinePaths.length
  
  return (
    <span className={styles.underlineHighlight}>
      <motion.svg
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.path
          d={underlinePaths[pathIndex]}
          variants={drawVariants}
          custom={delay}
        />
      </motion.svg>
      {children}
    </span>
  )
}

const projects = [
  {
    id: 'camcraft',
    title: 'CamCraft',
    date: "Feb '26",
    description: 'A virtual playground for exploring cameras and locations. Step into a 360-degree panoramic view of anywhere in the world. Navigate a scene using trained hand gestures and take photos rendered with camera-specific settings.',
    image: '/assets/svg/camcraft.png',
    url: 'https://github.com/petersenmatthew/camcraft',
    dark: true,
  },
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
    image: '/assets/svg/performeter.png',
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
            <LinkPreview url="https://uwaterloo.ca/future-students/programs/systems-design-engineering" className={styles.highlightYellow}>Systems Design Engineering</LinkPreview> @UWaterloo
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
        <motion.h2 className={styles.sectionTitle} variants={fadeInUp}>
          i <UnderlineHighlight delay={0.5}>build</UnderlineHighlight> and <UnderlineHighlight delay={0.5}>create</UnderlineHighlight> <CircleHighlight delay={1.5}>cool stuff</CircleHighlight>:
        </motion.h2>
        <motion.ul className={styles.bulletList} variants={staggerContainer}>
          <motion.li variants={fadeInUp}>
            {'>'} developing enterprise  <UnderlineHighlight delay={1.5}>government systems</UnderlineHighlight>{' '}
            <LinkPreview 
              url="https://www.ontario.ca/page/ministry-public-and-business-service-delivery-and-procurement" 
              className={styles.highlightGreen}
            >
              @ONgov
            </LinkPreview>
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} building ClipABit, a semantic search <UnderlineHighlight delay={2.0}>DaVinci Resolve plug-in</UnderlineHighlight>{' '}
            <LinkPreview 
              url="https://clipabit.web.app/" 
              className={styles.highlightYellow}
            >
              @WAT.ai
            </LinkPreview>
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} growing a{' '}
            <LinkPreview 
              url="https://cursor.com/home?from=agents" 
              className={styles.highlightGrey}
            >
              Cursor
            </LinkPreview>{' '}
            <UnderlineHighlight delay={1.5}>campus community</UnderlineHighlight> @Waterloo
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
            <UnderlineHighlight delay={2.5}>in 1A</UnderlineHighlight>
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} lead{' '}
            <LinkPreview 
              url="https://www.tsac.ca/" 
              className={styles.highlightRed}
            >
             TrudeauSAC
            </LinkPreview> as president in gr11 & 12 
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} creating <UnderlineHighlight delay={2.5}>short-films</UnderlineHighlight> with{' '}
            <LinkPreview 
              url="https://www.instagram.com/five24.film/" 
              className={styles.highlightPurple}
              isStatic
              imageSrc="/assets/svg/Screenshot 2026-01-21 at 2.44.58 PM.png"
            >
              five24
            </LinkPreview>{' '}
            and youtube videos {' '}
            <LinkPreview 
              url="https://www.youtube.com/@byjustinwu" 
              className={styles.highlightPurple}
            >
              @byjustinwu
            </LinkPreview>{' '}
          </motion.li>
          <motion.li variants={fadeInUp}>
            {'>'} seeking <CircleHighlight delay={2.5}><b>fall 2026</b></CircleHighlight>{' '}
            <UnderlineHighlight delay={2.5}>internship opportunities!</UnderlineHighlight>
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
          {projects.map((project, index) => {
            const delays = [0.3, 0.3, 0.8, 0.8, 1.3, 1.3, 1.8, 1.8]
            return (
              <motion.div key={project.id} variants={projectCardVariant}>
                <ProjectCard {...project} highlightDelay={delays[index] || 0.3} />
              </motion.div>
            )
          })}
        </motion.div>
      </motion.section>
    </div>
  )
}
