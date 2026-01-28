'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import styles from './BookCard.module.css'

interface BookCardProps {
  title: string
  author: string
  cover: string | null
  isbn?: string | null
  isbn13?: string | null
  rating?: number
  showRating?: boolean
  onClick?: () => void
  isExpanded?: boolean
}

// Note: Previously used pollinations.ai for AI-generated covers, but that service has migrated.
// If you want AI covers, you'll need to find an alternative service or use the new pollinations endpoint.

// Generate a placeholder cover using a nice gradient
function getPlaceholderCover(title: string, author: string): string {
  // Create a beautiful dark gradient SVG as data URI
  const svg = `<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#333333;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#1a1a1a;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="300" height="450" fill="url(#grad)"/>
    <rect width="10" height="450" fill="rgba(255,255,255,0.05)"/>
  </svg>`.trim().replace(/\n/g, '')
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// Generate fallback cover URLs to try
function getCoverFallbacks(cover: string | null, isbn13: string | null, isbn: string | null, title: string, author: string): string[] {
  const fallbacks: string[] = []
  
  // Add the primary cover if it exists
  if (cover) {
    fallbacks.push(cover)
  }
  
  // Try Open Library with ISBN13 (use -M for medium size, much faster than -L)
  if (isbn13) {
    fallbacks.push(`https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`)
  }
  
  // Try Open Library with ISBN10
  if (isbn && isbn !== isbn13) {
    fallbacks.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`)
  }
  
  return fallbacks
}

export function BookCard({ title, author, cover, isbn, isbn13, rating, showRating = false, onClick, isExpanded = false }: BookCardProps) {
  const { theme } = useTheme()
  const [currentCover, setCurrentCover] = React.useState<string>(cover || getPlaceholderCover(title, author))
  const [fallbackIndex, setFallbackIndex] = React.useState(0)
  const [isSearching, setIsSearching] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  const [imageLoaded, setImageLoaded] = React.useState(false)
  
  // Generate fallback URLs
  const fallbacks = React.useMemo(() => {
    const urls = getCoverFallbacks(cover, isbn13 || null, isbn || null, title, author)
    return urls.length > 0 ? urls : [getPlaceholderCover(title, author)]
  }, [cover, isbn13, isbn, title, author])
  
  // Set initial cover and auto-search if missing
  React.useEffect(() => {
    if (fallbacks.length > 0) {
      setCurrentCover(fallbacks[0])
      setFallbackIndex(0)
    }
    
    // If no cover URL exists in database, immediately search for one
    if (!cover && !isSearching && !hasSearched && title && author) {
      // Delay search slightly to avoid blocking initial render
      const timer = setTimeout(() => {
        searchForCover()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [cover, title, author]) // eslint-disable-line react-hooks/exhaustive-deps
  
  // Search for cover on the web
  const searchForCover = React.useCallback(async () => {
    if (isSearching || hasSearched) return
    
    setIsSearching(true)
    try {
      const params = new URLSearchParams({
        title: title,
        author: author,
      })
      
      if (isbn13) params.append('isbn13', isbn13)
      if (isbn) params.append('isbn', isbn)
      
      const response = await fetch(`/api/book-cover-search?${params.toString()}`)
      
      if (response.ok) {
        const data = await response.json()
        if (data.coverUrl) {
          setCurrentCover(data.coverUrl)
          setHasSearched(true)
          return
        }
      }
    } catch (error) {
      console.error('Error searching for cover:', error)
    } finally {
      setIsSearching(false)
      setHasSearched(true)
    }
  }, [title, author, isbn, isbn13, isSearching, hasSearched])
  
  const handleImageError = () => {
    // If the image failed, we want to try the next fallback
    // But first, let's make sure we're not just seeing a white screen
    setImageLoaded(false);

    if (fallbackIndex < fallbacks.length - 1) {
      const nextIndex = fallbackIndex + 1
      setFallbackIndex(nextIndex)
      setCurrentCover(fallbacks[nextIndex])
    } else if (!hasSearched) {
      // All static fallbacks failed, search the web
      searchForCover()
    } else {
      // Everything, including search and AI gen, has failed. Use the final local gradient.
      setCurrentCover(getPlaceholderCover(title, author))
    }
  }
  
  return (
    <motion.article 
      className={styles.card}
      onClick={onClick}
      whileHover={{ 
        scale: 1.05,
        y: -5,
        transition: { type: 'spring', stiffness: 400, damping: 17 }
      }}
      whileTap={{ scale: 0.98 }}
      style={{ cursor: onClick ? 'pointer' : 'default' }}
      animate={isExpanded ? { scale: 1.1, zIndex: 10 } : { scale: 1, zIndex: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <div className={styles.coverWrapper}>
        {!imageLoaded && <div className={styles.loadingGradient} />}
        <Image
          src={currentCover}
          alt={`${title} by ${author}`}
          fill
          className={styles.bookCover}
          sizes="(max-width: 768px) 33vw, 25vw"
          onLoad={() => setImageLoaded(true)}
          onError={handleImageError}
          priority={false}
          unoptimized={currentCover.startsWith('http')}
        />
      </div>
      {rating !== undefined && showRating && (
        <motion.div
          className={styles.rating}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: 0.8, 
            duration: 0.4, 
            ease: 'easeOut'
          }}
        >
          {Array.from({ length: rating }).map((_, i) => {
            const isOrangeMode = theme === 'orange'
            const starClass = isOrangeMode ? styles.starWhite : styles.filled
            
            return (
              <span 
                key={i} 
                className={`${styles.star} ${starClass}`}
              >
                ★
              </span>
            )
          })}
        </motion.div>
      )}
    </motion.article>
  )
}
