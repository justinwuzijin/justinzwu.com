'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { BookCard } from '@/components/BookCard'
import { BookSidePanel } from '@/components/BookSidePanel'
import { useTheme } from '@/components/ThemeProvider'
import { UnderlineHighlight, CircleHighlight } from '@/components/Highlights'

type ShelfType = 'to read' | 'reading' | 'read'

interface Book {
  id: number
  title: string
  author: string
  cover: string | null
  isbn?: string | null
  isbn13?: string | null
  rating?: number
  goodreadsId?: string | null
  review?: string | null
}

const shelfColors: Record<ShelfType, string> = {
  'to read': '#dc2626',
  'reading': '#eab308',
  'read': '#16a34a',
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as const }
  }
}

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    }
  }
}

export default function BookshelfPage() {
  const { theme } = useTheme()
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
  const [selectedBook, setSelectedBook] = useState<Book | null>(null)
  const [expandedBookId, setExpandedBookId] = useState<number | null>(null)

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
      <motion.h1 
        className={styles.pageTitle}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        <span className={styles.orangeDot} />
        bookshelf
      </motion.h1>

      <motion.p
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className={styles.quote}
      >
        <UnderlineHighlight delay={0.5}>think before you <CircleHighlight delay={1.2}>speak</CircleHighlight></UnderlineHighlight>. <UnderlineHighlight delay={1.8}><CircleHighlight delay={2.5}>read</CircleHighlight> before you <CircleHighlight delay={3.2}>think</CircleHighlight></UnderlineHighlight>.
      </motion.p>

      {/* Filter tabs */}
      <motion.div 
        className={styles.tabs}
        initial="hidden"
        animate="visible"
        variants={staggerContainer}
      >
        {shelves.map((shelf) => {
          const color = shelfColors[shelf]
          
          return (
            <motion.button
              key={shelf}
              onClick={() => handleShelfClick(shelf)}
              className={`${styles.tab} ${activeShelf === shelf ? styles.activeTab : ''}`}
              style={{ 
                '--tab-color': color 
              } as React.CSSProperties}
              variants={fadeInUp}
            >
              <span 
                className={styles.tabDot} 
                style={{ backgroundColor: color }}
              />
              {shelf}
            </motion.button>
          )
        })}
      </motion.div>
      
      {/* Attribution note */}
      <motion.p 
        className={styles.attributionNote}
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
      >
        Goodreads data stored in PostgreSQL. Book synopses generated with Gemini. Images fetched from Google Books API.
      </motion.p>

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
              showRating={activeShelf === 'read'}
              expandedBookId={expandedBookId}
              onBookClick={(book) => {
                setExpandedBookId(book.id)
                setSelectedBook(book)
              }}
            />
          )}
        </div>
      </AnimatePresence>

      {/* Side Panel */}
      {selectedBook && (
        <BookSidePanel
          book={selectedBook}
          shelf={activeShelf}
          isOpen={true}
          onClose={() => {
            setSelectedBook(null)
            setExpandedBookId(null)
          }}
        />
      )}
    </div>
  )
}

interface AnimatedBookGridProps {
  books: Array<{ id: number; title: string; author: string; cover: string | null; isbn?: string | null; isbn13?: string | null; rating?: number; review?: string | null }>
  showRating: boolean
  expandedBookId: number | null
  onBookClick: (book: Book) => void
}

function AnimatedBookGrid({ books, showRating, expandedBookId, onBookClick }: AnimatedBookGridProps) {
  const containerVariants = {
    hidden: {
      opacity: 1,
    },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.03,
        delayChildren: 0.05,
      },
    },
  }

  const bookVariants = {
    hidden: {
      opacity: 0,
      scale: 0.8,
      y: 20,
    },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        type: 'spring' as const,
        stiffness: 400,
        damping: 25,
      },
    },
  }

  return (
    <motion.div
      className={styles.booksGrid}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {books.map((book) => (
        <motion.div
          key={book.id}
          variants={bookVariants}
          style={{ position: 'relative' }}
        >
          <BookCard 
            {...book} 
            showRating={showRating}
            onClick={() => onBookClick(book)}
            isExpanded={expandedBookId === book.id}
          />
        </motion.div>
      ))}
    </motion.div>
  )
}
