'use client'

import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './BookCard.module.css'

interface BookCardProps {
  title: string
  author: string
  cover: string | null
  isbn?: string | null
  isbn13?: string | null
  rating?: number
  showRating?: boolean
}

// Generate a placeholder cover using data URI (no external service needed)
function getPlaceholderCover(title: string, author: string): string {
  // Create a simple SVG placeholder as data URI
  const text = title.substring(0, 30).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const svg = `<svg width="300" height="450" xmlns="http://www.w3.org/2000/svg"><rect width="300" height="450" fill="#8b7355"/><text x="150" y="225" font-family="Arial, sans-serif" font-size="16" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${text}</text></svg>`
  // Encode SVG for data URI (works in browser)
  return `data:image/svg+xml,${encodeURIComponent(svg)}`
}

// Generate fallback cover URLs to try
function getCoverFallbacks(cover: string | null, isbn13: string | null, isbn: string | null): string[] {
  const fallbacks: string[] = []
  
  // Add the primary cover if it exists
  if (cover) {
    fallbacks.push(cover)
  }
  
  // Try Open Library with ISBN13
  if (isbn13) {
    fallbacks.push(`https://covers.openlibrary.org/b/isbn/${isbn13}-L.jpg`)
  }
  
  // Try Open Library with ISBN10
  if (isbn && isbn !== isbn13) {
    fallbacks.push(`https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`)
  }
  
  return fallbacks
}

export function BookCard({ title, author, cover, isbn, isbn13, rating, showRating = false }: BookCardProps) {
  const [currentCover, setCurrentCover] = React.useState<string>(cover || getPlaceholderCover(title, author))
  const [fallbackIndex, setFallbackIndex] = React.useState(0)
  const [isSearching, setIsSearching] = React.useState(false)
  const [hasSearched, setHasSearched] = React.useState(false)
  
  // Generate fallback URLs
  const fallbacks = React.useMemo(() => {
    const urls = getCoverFallbacks(cover, isbn13 || null, isbn || null)
    return urls.length > 0 ? urls : [getPlaceholderCover(title, author)]
  }, [cover, isbn13, isbn, title, author])
  
  // Set initial cover
  React.useEffect(() => {
    if (fallbacks.length > 0) {
      setCurrentCover(fallbacks[0])
      setFallbackIndex(0)
      setHasSearched(false)
    }
  }, [fallbacks])
  
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
    // Try next fallback
    if (fallbackIndex < fallbacks.length - 1) {
      const nextIndex = fallbackIndex + 1
      setFallbackIndex(nextIndex)
      setCurrentCover(fallbacks[nextIndex])
    } else if (!hasSearched) {
      // All fallbacks failed, search the web
      searchForCover()
    } else {
      // All options exhausted, use placeholder
      setCurrentCover(getPlaceholderCover(title, author))
    }
  }
  
  return (
    <article className={styles.card}>
      <div className={styles.coverWrapper}>
        <Image
          src={currentCover}
          alt={`${title} by ${author}`}
          fill
          className={styles.bookCover}
          sizes="(max-width: 768px) 50vw, 33vw"
          onError={handleImageError}
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
          {Array.from({ length: 5 }).map((_, i) => (
            <span 
              key={i} 
              className={`${styles.star} ${i < rating ? styles.filled : ''}`}
            >
              ★
            </span>
          ))}
        </motion.div>
      )}
    </article>
  )
}
