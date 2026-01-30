'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
import { VinylRecordPlayer } from './VinylRecordPlayer'
import styles from './SidebarNav.module.css'

const navItems = [
  { href: '/me', label: 'me' },
  { href: '/experience', label: 'experience' },
  { href: '/drawer-of-thoughts', label: 'drawer of thoughts' },
  { href: '/bookshelf', label: 'bookshelf' },
  { href: '/art-gallery', label: 'art gallery' },
]

export function SidebarNav() {
  const pathname = usePathname()
  const { digitalDroplets, setDigitalDroplets } = useTheme()

  return (
    <nav className={styles.nav} aria-label="Main navigation">
      <ul className={styles.navList}>
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname === '/' && item.href === '/me')
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
      
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
      <div className={styles.vinylContainer}>
        <VinylRecordPlayer 
          tracks={[
            {
              title: 'WILSHIRE',
              artist: 'Tyler, The Creator',
              src: '/music/wilshire.mp3',
              cover: '/music/estate-sale-cover.png',
            },
            {
              title: 'Enjoy Right Now, Today',
              artist: 'Tyler, The Creator',
              src: '/music/enjoy-right-now.mp3',
              cover: '/music/flower-boy-cover.png',
            },
            {
              title: 'Stop Playing With Me',
              artist: 'Tyler, The Creator',
              src: '/music/stop-playing-with-me.mp3',
              cover: '/music/chromakopia-cover.webp',
            },
            {
              title: 'Baby Blues',
              artist: 'AUDREY NUNA',
              src: '/music/baby-blues.mp3',
              cover: '/music/audrey-nuna-cover.jpg',
            },
            {
              title: 'No Merci',
              artist: 'Little Simz',
              src: '/music/no-merci.mp3',
              cover: '/music/little-simz-cover.jpg',
            },
            {
              title: '關於小熊',
              artist: 'Soft Lipa',
              src: '/music/guan-yu-xiao-xiong.mp3',
              cover: '/music/soft-lipa-cover.jpg',
            },
            {
              title: '姐姐',
              artist: '夏之禹',
              src: '/music/jiejie.mp3',
              cover: '/music/xiazhiyu-cover.jpg',
            },
            {
              title: 'Stateside',
              artist: 'PinkPantheress',
              src: '/music/Stateside - PinkPantheress (youtube).mp3',
              cover: '/music/pinkpantheress-cover.jpg',
            },
          ]}
        />
      </div>
    </nav>
  )
}
