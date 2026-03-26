'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import { VinylRecordPlayer } from './VinylRecordPlayer'
import { useSoundEffects } from '@/hooks/useSoundEffects'
import styles from './SidebarNav.module.css'

const navItems = [
  { href: '/me', label: 'me' },
  { href: '/experience', label: 'experience' },
  { href: '/drawer-of-thoughts', label: 'drawer of thoughts' },
  { href: '/bookshelf', label: 'bookshelf' },
  { href: '/art-gallery', label: 'art gallery' },
]

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: 20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] as const },
  },
}

export function SidebarNav() {
  const pathname = usePathname()
  const { digitalDroplets, setDigitalDroplets } = useTheme()
  const { playSelect } = useSoundEffects()

  return (
    <motion.nav 
      className={styles.nav} 
      aria-label="Main navigation"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <motion.ul className={styles.navList} variants={containerVariants}>
        {navItems.map((item, index) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/me')
          return (
            <motion.li key={item.href} variants={itemVariants}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
                onClick={playSelect}
              >
                {item.label}
              </Link>
            </motion.li>
          )
        })}
      </motion.ul>
      
      {/* Digital droplets toggle - commented out
      <div className={styles.dropletsContainer}>
        <button
          onClick={() => setDigitalDroplets(!digitalDroplets)}
          className={`${styles.dropletsButton} ${digitalDroplets ? styles.dropletsActive : styles.toggleOff}`}
          aria-label={`${digitalDroplets ? 'Disable' : 'Enable'} digital droplets`}
          title={`${digitalDroplets ? 'Disable' : 'Enable'} digital droplets`}
        >
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill={digitalDroplets ? 'currentColor' : 'none'}
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z" />
          </svg>
        </button>
        <span className={styles.dropletsLabel}>(activate digital stream)</span>
      </div>
      */}
      
      {/* Vinyl Record Player */}
      <motion.div 
        className={styles.vinylContainer}
        variants={itemVariants}
      >
        <VinylRecordPlayer 
          tracks={[
            {
              title: 'RUNITUP',
              artist: 'Tyler, The Creator',
              src: `/music/${encodeURIComponent('RUNITUP 4.mp3')}`,
              cover: '/music/runitup.jpg',
            },
            {
              title: 'WILSHIRE',
              artist: 'Tyler, The Creator',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/wilshire.mp3',
              cover: '/music/estate-sale-cover.png',
            },
            {
              title: 'mucho, poquito, nada',
              artist: 'Margarita',
              src: `/music/${encodeURIComponent('mucho, poquito, nada.mp3')}`,
              cover: '/music/mucho.jpg',
            },
            {
              title: '夢中人',
              artist: '王菲',
              src: `/music/${encodeURIComponent('夢中人 (電影《重慶森林》歌曲) 4.mp3')}`,
              cover: '/music/af953adbf312fd1c13ea1b14e4e73b4b.1000x1000x1.jpg',
            },
            {
              title: '姐姐',
              artist: '夏之禹',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/jiejie.mp3',
              cover: '/music/xiazhiyu-cover.jpg',
            },
            {
              title: 'Enjoy Right Now, Today',
              artist: 'Tyler, The Creator',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/enjoy-right-now.mp3',
              cover: '/music/flower-boy-cover.png',
            },
            {
              title: 'Warmpop',
              artist: 'ESPRIT 空想',
              src: `/music/${encodeURIComponent('Warmpop.mp3')}`,
              cover: '/music/warmpop.jpg',
            },
            {
              title: 'Dramatic Girl',
              artist: 'Various Artists',
              src: `/music/${encodeURIComponent('Dramatic Girl.mp3')}`,
              cover: `/music/${encodeURIComponent('dramatic girl.png')}`,
            },
            {
              title: '關於小熊',
              artist: 'Soft Lipa',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/guan-yu-xiao-xiong.mp3',
              cover: '/music/soft-lipa-cover.jpg',
            },
            {
              title: 'Baby Blues',
              artist: 'AUDREY NUNA',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/baby-blues.mp3',
              cover: '/music/audrey-nuna-cover.jpg',
            },
            {
              title: 'No Merci',
              artist: 'Little Simz',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/no-merci.mp3',
              cover: '/music/little-simz-cover.jpg',
            },
            {
              title: 'Stop Playing With Me',
              artist: 'Tyler, The Creator',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/stop-playing-with-me.mp3',
              cover: '/music/chromakopia-cover.webp',
            },
            {
              title: 'Stateside',
              artist: 'PinkPantheress',
              src: 'https://personal-site-music.s3.us-east-1.amazonaws.com/Stateside%20-%20PinkPantheress%20(youtube).mp3',
              cover: '/music/pinkpantheress-cover.jpg',
            },
          ]}
        />
      </motion.div>
    </motion.nav>
  )
}
