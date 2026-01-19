import React from "react"
import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Serif_SC } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import styles from './layout.module.css'
import { SidebarNav } from '@/components/SidebarNav'
import { Footer } from '@/components/Footer'
import { ThemeProvider } from '@/components/ThemeProvider'

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter'
})

const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  variable: '--font-noto-serif-sc'
})

export const metadata: Metadata = {
  title: 'Justin Wu | justinzwu.com',
  description: 'Personal website of Justin Wu - Systems Design Engineering at UWaterloo',
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
      <body className={`${inter.variable} ${notoSerifSC.variable}`}>
        <ThemeProvider>
          <div className={styles.appContainer}>
            <div className={styles.mainWrapper}>
              <aside className={styles.sidebar}>
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
