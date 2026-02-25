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
  "M 3 8 L 15 3 L 40 2 L 60 3 L 85 2 L 97 8 L 98 18 L 97 32 L 85 38 L 60 39 L 40 38 L 15 39 L 3 32 L 2 18 Z",
  "M 4 10 L 20 4 L 50 3 L 80 4 L 96 10 L 97 20 L 96 30 L 80 37 L 50 38 L 20 37 L 4 30 L 3 20 Z",
  "M 2 12 L 12 5 L 35 2 L 65 2 L 88 5 L 98 12 L 99 20 L 98 28 L 88 36 L 65 39 L 35 39 L 12 36 L 2 28 L 1 20 Z",
  "M 5 9 L 18 2 L 45 1 L 55 1 L 82 2 L 95 9 L 96 20 L 95 31 L 82 38 L 55 40 L 45 40 L 18 38 L 5 31 L 4 20 Z",
]

const circlePathsWide = [
  "M 3 8 L 20 3 L 60 2 L 100 1 L 140 2 L 180 3 L 197 8 L 198 18 L 197 32 L 180 38 L 140 39 L 100 40 L 60 39 L 20 38 L 3 32 L 2 18 Z",
  "M 4 10 L 25 4 L 70 3 L 100 2 L 130 3 L 175 4 L 196 10 L 197 20 L 196 30 L 175 37 L 130 38 L 100 39 L 70 38 L 25 37 L 4 30 L 3 20 Z",
  "M 2 12 L 15 5 L 55 2 L 100 1 L 145 2 L 185 5 L 198 12 L 199 20 L 198 28 L 185 36 L 145 39 L 100 40 L 55 39 L 15 36 L 2 28 L 1 20 Z",
  "M 5 9 L 22 2 L 65 1 L 100 0 L 135 1 L 178 2 L 195 9 L 196 20 L 195 31 L 178 38 L 135 40 L 100 41 L 65 40 L 22 38 L 5 31 L 4 20 Z",
]

let circleIndex = 0

function CircleHighlight({ children, className = '', delay = 0, wide = false }: { children: React.ReactNode; className?: string; delay?: number; wide?: boolean }) {
  const paths = wide ? circlePathsWide : circlePaths
  const pathIndex = circleIndex++ % paths.length
  const viewBox = wide ? "0 0 200 40" : "0 0 100 40"
  
  return (
    <span className={`${styles.circleHighlight} ${wide ? styles.circleWide : ''} ${className}`}>
      <motion.svg 
        viewBox={viewBox}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.path
          d={paths[pathIndex]}
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
    url: 'https://camcraft.vercel.app/',
    dark: true,
    videoUrl: '/assets/experience-videos/camcraft.mp4',
    videoPoster: '/assets/experience-videos/posters/camcraft.jpg',
    videoZoom: 1.22,
    videoPosition: 'center 30%',
    videoSpeed: 2,
  },
  {
    id: 'skema',
    title: 'Skema',
    date: "Jan '26",
    description: 'An npm package that transforms your localhost into an interactive whiteboard where you can draw new components, edit directly on your live website.',
    image: '/assets/svg/skeeeemaar.png',
    url: 'https://useskema.vercel.app/',
    dark: false,
    videoUrl: '/assets/experience-videos/schema.mp4',
    videoPoster: '/assets/experience-videos/posters/schema.jpg',
    videoZoom: 1.15,
  },
  {
    id: 'cision',
    title: 'Cision',
    date: "Jan '26",
    description: 'Cursor for city planners. Built an interactive 3D heatmap that redesigns dangerous Toronto intersections. Users can find high-risk locations, generate improvements in real-time, and chat with voice agent stakeholders.',
    image: '/assets/svg/Copy of Untitled Design.png',
    url: 'https://www.cisionai.tech/',
    dark: true,
    videoUrl: '/assets/experience-videos/cision.mp4',
    videoPoster: '/assets/experience-videos/posters/cision.jpg',
  },
  {
    id: 'recollect',
    title: 'Recollect',
    date: "Nov '25",
    description: 'An app that allows you to scan your receipts and turns your everyday, mundane purchases into a meaningful digital scrapbook of memories you can collect, decorate, and share.',
    image: '/assets/svg/recollect.svg',
    url: 'https://devpost.com/software/recollect-t5okgv?ref_content=user-portfolio&ref_feature=in_progress',
    dark: false,
    zoom:1.01,
    videoUrl: '/assets/experience-videos/recollect.mp4',
    videoPoster: '/assets/experience-videos/posters/recollect.jpg',
    videoZoom: 1.15,
  },
  {
    id: '4sight',
    title: '4Sight',
    date: "May '25",
    description: 'An at-home vision screening app. Simulates gaze-tracking, peripheral, and Snellen tests to provide an estimated prescription and recommended treatment options.',
    image: '/assets/svg/Copy of Untitled Design copy.png',
    url: 'https://eye-tester-app.vercel.app/',
    dark: false,
    zoom: 1.045,
    videoUrl: '/assets/experience-videos/4sight.mp4',
    videoPoster: '/assets/experience-videos/posters/4sight.jpg',
    videoZoom: 1.15,
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
  /**{
    id: 'takeone',
    title: 'TakeOne',
    date: 'Ongoing',
    description: 'A creative network platform that matches indie filmmakers in Toronto with industry professionals.',
    image: '/assets/svg/takeonenoee.png',
    url: 'https://www.figma.com/design/VPNthnTDvDgzUz8DNFteew/takeone-beta?node-id=0-1&t=pSdgZlzq8D3XCA8F-1',
    dark: false,
  }, */
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
            {'>'} building ClipABit, a semantic search <UnderlineHighlight delay={2.0}>DaVinci Resolve</UnderlineHighlight> <UnderlineHighlight delay={2.0}>plug-in</UnderlineHighlight>{' '}
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
            {'>'} seeking <CircleHighlight delay={2.5}>fall 2026</CircleHighlight>{' '}
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
