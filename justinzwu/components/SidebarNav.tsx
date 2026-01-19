'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
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
    </nav>
  )
}
