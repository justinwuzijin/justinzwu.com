import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import styles from './layout.module.css'
import { SidebarNav } from '@/components/SidebarNav'
import { MobileNav } from '@/components/MobileNav'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'
import { TopRightControls } from '@/components/TopRightControls'
import { LazyRandomVideoPopup } from '@/components/LazyRandomVideoPopup'
import { GlobalClickSound } from '@/components/GlobalClickSound'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'justinzwu.com',
}

export const viewport: Viewport = {
  themeColor: '#c45a1c',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline script to set theme before first paint — prevents flash of wrong theme */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme && ['light', 'dark', 'orange'].includes(theme)) {
                    document.documentElement.setAttribute('data-theme', theme);
                  }
                } catch(e) {}
              })();
            `,
          }}
        />
      </head>
      <body className={inter.variable}>
        <ThemeProvider>
          {/* Global click sound for ambient page interactions */}
          <GlobalClickSound />
          
          {/* Random video popups near mouse — dynamically loaded, not needed for initial render */}
          <LazyRandomVideoPopup />
          
          {/* Top right controls - fixed position, hides on scroll */}
          <TopRightControls />
          
          {/* Mobile Navigation - Always visible on mobile */}
          <MobileNav />
          
          <div className={styles.appContainer}>
            <div className={styles.mainWrapper}>
              {/* Desktop Sidebar */}
              <aside className={styles.sidebar} data-sidebar="true">
                <SidebarNav />
              </aside>
              
              <main className={styles.mainContent}>
                {children}
              </main>
            </div>
            
            <Footer />
          </div>
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  )
}
