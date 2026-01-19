'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { BookCard } from '@/components/BookCard'

type ShelfType = 'to read' | 'reading' | 'read'

interface Book {
  id: number
  title: string
  author: string
  cover: string | null
  isbn?: string | null
  isbn13?: string | null
  rating?: number
}

const shelfColors: Record<ShelfType, string> = {
  'to read': '#8b4513',
  'reading': '#c45a1c',
  'read': '#2d8a4e',
}

export default function BookshelfPage() {
  const [activeShelf, setActiveShelf] = useState<ShelfType>('read')
  const [books, setBooks] = useState<Record<ShelfType, Book[]>>({
    'to read': [],
    'reading': [],
    'read': [],
  })
  const [loading, setLoading] = useState<Record<ShelfType, boolean>>({
    'to read': false,
    'reading': false,
    'read': false,
  })
  const [error, setError] = useState<string | null>(null)

  const shelves: ShelfType[] = ['to read', 'reading', 'read']

  const handleShelfClick = (shelf: ShelfType) => {
    // Clicking a tab shows that section (no reset on same tab click)
    setActiveShelf(shelf)
  }

  useEffect(() => {
    const fetchBooks = async (shelf: ShelfType) => {
      setLoading(prev => ({ ...prev, [shelf]: true }))
      setError(null)

      try {
        const response = await fetch(`/api/books?shelf=${encodeURIComponent(shelf)}`)
        
        if (!response.ok) {
          // Try to get error details from response
          let errorMessage = 'Failed to fetch books'
          try {
            const errorData = await response.json()
            errorMessage = errorData.details || errorData.error || errorMessage
            console.error('API Error:', errorData)
          } catch (e) {
            console.error('Failed to parse error response:', e)
          }
          throw new Error(errorMessage)
        }
        
        const data: Book[] = await response.json()
        console.log(`✅ Loaded ${data.length} books for shelf: ${shelf}`)
        setBooks(prev => ({ ...prev, [shelf]: data }))
        setError(null) // Clear any previous errors
      } catch (err: any) {
        console.error('Error fetching books:', err)
        const errorMessage = err.message || 'Failed to load books. Please try again later.'
        setError(errorMessage)
      } finally {
        setLoading(prev => ({ ...prev, [shelf]: false }))
      }
    }

    // Fetch books if not already loaded
    if (books[activeShelf].length === 0 && !loading[activeShelf]) {
      fetchBooks(activeShelf)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeShelf])

  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <span className={styles.orangeDot} />
        bookshelf
      </h1>

      {/* Filter tabs */}
      <div className={styles.tabs}>
        {shelves.map((shelf) => (
          <button
            key={shelf}
            onClick={() => handleShelfClick(shelf)}
            className={`${styles.tab} ${activeShelf === shelf ? styles.activeTab : ''}`}
            style={{ 
              '--tab-color': shelfColors[shelf] 
            } as React.CSSProperties}
          >
            <span 
              className={styles.tabDot} 
              style={{ backgroundColor: shelfColors[shelf] }}
            />
            {shelf}
          </button>
        ))}
      </div>

      {/* Show books for active shelf */}
      <AnimatePresence mode="wait">
        <div key={activeShelf}>
          {loading[activeShelf] ? (
            <div className={styles.loading}>Loading books...</div>
          ) : error ? (
            <div className={styles.error}>{error}</div>
          ) : books[activeShelf].length === 0 ? (
            <div className={styles.empty}>No books found in this shelf.</div>
          ) : (
            <AnimatedBookGrid
              books={books[activeShelf]}
              isExpanded={true}
            />
          )}
        </div>
      </AnimatePresence>
    </div>
  )
}

interface AnimatedBookGridProps {
  books: Array<{ id: number; title: string; author: string; cover: string | null; isbn?: string | null; isbn13?: string | null; rating?: number }>
  isExpanded: boolean
}

function AnimatedBookGrid({ books, isExpanded }: AnimatedBookGridProps) {
  const containerVariants = {
    stacked: {
      transition: {
        staggerChildren: 0.05,
      },
    },
    expanded: {
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      },
    },
  }

  const bookVariants = {
    stacked: (index: number) => ({
      x: index * 20,
      y: index * 15,
      scale: 1 - index * 0.05,
      rotate: index * 2,
      zIndex: books.length - index,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
      },
    }),
    expanded: {
      x: 0,
      y: 0,
      scale: 1,
      rotate: 0,
      zIndex: 1,
      transition: {
        type: 'spring' as const,
        stiffness: 300,
        damping: 25,
      },
    },
  }

  return (
    <motion.div
      className={styles.booksGrid}
      variants={containerVariants}
      initial="stacked"
      animate="expanded"
      layout
    >
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          custom={index}
          variants={bookVariants}
          layout
          style={
            {
              position: 'relative',
            }
          }
        >
          <BookCard {...book} showRating={isExpanded} />
        </motion.div>
      ))}
    </motion.div>
  )
}
