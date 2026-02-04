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
import { RandomVideoPopup } from '@/components/RandomVideoPopup'
import { TopRightControls } from '@/components/TopRightControls'

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
      <body className={inter.variable}>
        <ThemeProvider>
          {/* Random video popups near mouse */}
          <RandomVideoPopup />
          
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
