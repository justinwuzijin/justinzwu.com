'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useTheme } from './ThemeProvider'
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
      
      {/* Digital droplets toggle */}
      <div className={styles.dropletsContainer}>
        <button
          onClick={() => setDigitalDroplets(!digitalDroplets)}
          className={`${styles.dropletsButton} ${digitalDroplets ? styles.dropletsActive : styles.toggleOff}`}
          aria-label={`${digitalDroplets ? 'Disable' : 'Enable'} digital droplets`}
          title={`${digitalDroplets ? 'Disable' : 'Enable'} digital droplets`}
        >
          {/* Droplet icon */}
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
    </nav>
  )
}
