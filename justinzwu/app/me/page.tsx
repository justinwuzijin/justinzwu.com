import styles from './page.module.css'
import { ProjectCard } from '@/components/ProjectCard'
import { TitleHover } from '@/components/TitleHover'
import { HeroHeader } from '@/components/HeroHeader'
import { LinkPreview } from '@/components/ui/link-preview'

const projects = [
  {
    id: 'cision',
    title: 'Cision',
    date: "Jan '26",
    description: 'Cursor for city planners. We built an interactive 3D map that redesigns dangerous Toronto intersections. User can find high-risk locations on our heatmap view, generated improvements in real-time, and chat with voice agent stakeholders.',
    image: '/assets/svg/cision.svg',
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
  },
  {
    id: 'performeter',
    title: 'Performeter',
    date: "Oct '25",
    description: 'A Chrome extension for Tinder.com. It scrapes bio text and calls an LLM with a structured prompt to output a score of how "performative" someones profile is. (Toronto Stupid Hackathon project)',
    image: '/assets/svg/performeter.svg',
    url: 'https://github.com/justinwuzijin/performeter67',
    dark: false,
  },
  {
    id: '4sight',
    title: '4Sight',
    date: "May '25",
    description: 'An at-home vision screening app. Simulates gaze-tracking, peripheral, and Snellen tests to provide an estimated prescription and recommended treatment options.',
    image: '/assets/svg/4sight.svg',
    url: 'https://github.com/justinwuzijin/eye-tester-app',
    dark: false,
  },
  {
    id: '3d-gallery',
    title: '3D Interactive Stills Gallery',
    date: "Aug '25",
    description: 'An interactive sphere-based gallery that showcases stills from my youtube videos in a dynamic 3D environment.',
    image: '/assets/svg/3d.svg',
    url: 'https://github.com/justinwuzijin/spinning-3d-gallery',
    dark: false,
  },
  {
    id: 'takeone',
    title: 'TakeOne',
    date: 'Ongoing',
    description: 'A creative network platform that matches indie filmmakers in Toronto with industry professionals.',
    image: '/assets/svg/takeone.svg',
    url: 'https://github.com/justinwuzijin/takeone',
    dark: false,
  },
]

export default function MePage() {
  return (
    <div className={styles.container}>
      {/* Hero section with header and hover title */}
      <section className={styles.hero}>
        <HeroHeader />
        <TitleHover />
        <p className={styles.subtitle}>
          Systems Design Engineering{' '}
          <LinkPreview url="https://uwaterloo.ca/" className={styles.highlightOrange}>
            @UWaterloo
          </LinkPreview>
        </p>
      </section>

      {/* About section */}
      <section className={styles.about}>
        <h2 className={styles.sectionTitle}>i like creating and building cool stuff:</h2>
        <ul className={styles.bulletList}>
          <li>
            {'>'} developing enterprise government systems{' '}
            <LinkPreview 
              url="https://www.ontario.ca/page/ministry-public-and-business-service-delivery-and-procurement" 
              className={styles.highlightGreen}
            >
              @ONgov
            </LinkPreview>
          </li>
          <li>
            {'>'} building ClipABit, a DaVinci Resolve semantic search plug-in{' '}
            <LinkPreview 
              url="https://clipabit.web.app/" 
              className={styles.highlightOrange}
            >
              @WAT.ai
            </LinkPreview>
          </li>
          <li>
            {'>'} building a{' '}
            <LinkPreview 
              url="https://cursor.com/home?from=agents" 
              className={styles.highlightGrey}
            >
              Cursor
            </LinkPreview>{' '}
            community in Waterloo and running campus events
          </li>
          <li>
            {'>'} working on TakeOne; a centralized LinkedIn for indie filmmakers in the gta
          </li>
          <li>
            {'>'} produced videos for{' '}
            <LinkPreview 
              url="https://cursor.com/home?from=agents" 
              className={styles.highlightGrey}
            >
              Cursor
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
            , and{' '}
            <LinkPreview 
              url="https://www.bridginggens.com/" 
              className={styles.highlightBlue}
            >
              Bridging Generations
            </LinkPreview>{' '}
            in 1a
          </li>
          <li>
            {'>'} lead{' '}
            <LinkPreview 
              url="https://www.tsac.ca/" 
              className={styles.highlightRed}
            >
              TrudeauSAC
            </LinkPreview>
            , my hs student council, as president in gr11 & 12
          </li>
          <li>
            {'>'} made films with{' '}
            <LinkPreview 
              url="https://www.yorkregion.com/news/markham-teens-heartwarming-piece-wins-people-s-choice-award-for-24-hour-film-challenge/article_adc3510e-8599-556e-9867-71ba2ba3234b.html" 
              className={styles.highlightPurple}
            >
              five24
            </LinkPreview>{' '}
            and personal youtube videos in hs
          </li>
        </ul>
      </section>

      {/* Projects section */}
      <section className={styles.projects}>
        <h2 className={styles.projectsTitle}>
          <span className={styles.orangeDot} />
          Projects
        </h2>
        <div className={styles.projectsGrid}>
          {projects.map((project) => (
            <ProjectCard key={project.id} {...project} />
          ))}
        </div>
      </section>
    </div>
  )
}
