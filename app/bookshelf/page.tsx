'use client'

import React from "react"
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { BookCard } from '@/components/BookCard'
import { BookSidePanel } from '@/components/BookSidePanel'
import { useTheme } from '@/components/ThemeProvider'
import { useSoundEffects } from '@/hooks/useSoundEffects'
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
  'to read': '#fca5a5',
  'reading': '#fde047',
  'read': '#86efac',
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
  const { playClick, playDeselect } = useSoundEffects()
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
        <UnderlineHighlight delay={0.5}>think before you speak</UnderlineHighlight>. <UnderlineHighlight delay={1.8}> read before you think</UnderlineHighlight>.
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
          const isActive = activeShelf === shelf
          
          return (
            <motion.button
              key={shelf}
              onClick={() => {
                playClick()
                handleShelfClick(shelf)
              }}
              className={`${styles.tab} ${isActive ? styles.activeTab : ''}`}
              style={{ 
                '--tab-color': color 
              } as React.CSSProperties}
              variants={fadeInUp}
            >
              <span 
                className={`${styles.tabDot} ${isActive ? '' : styles.inactiveDot}`}
                style={isActive ? { backgroundColor: color } : undefined}
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
                playClick()
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
            playDeselect()
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
  // Generate stable random values for pile effect (seeded by book id)
  const pileVariations = React.useMemo(() => {
    return books.map((book, index) => {
      const seed = book.id
      const pseudoRandom = (n: number) => {
        const x = Math.sin(seed * 9999 + n * 1234) * 10000
        return x - Math.floor(x)
      }
      
      const col = index % 3
      
      return {
        rotation: (pseudoRandom(1) - 0.5) * 2, // -1 to +1 degrees (nearly flat)
        jitterX: 0,  // no x jitter - stack precisely
        jitterY: 0,  // no y jitter - stack precisely
        zIndex: col + 1, // col 0=1, col 1=2, col 2=3 - third book on top
      }
    })
  }, [books])

  // Calculate horizontal offset to collapse each row into ONE tight pile on the LEFT
  const getRowPileOffset = (index: number) => {
    const col = index % 3 // 0, 1, or 2
    
    // Move ALL books to column 0 position (left side)
    // col 0 stays, col 1 moves left by 1 cell, col 2 moves left by 2 cells
    // Using larger cellWidth to ensure complete overlap
    const cellWidth = 230 // increased significantly to fully hide books underneath
    
    return {
      x: -col * cellWidth,
      y: 0,
    }
  }

  // Staggered timing: rows animate one after another, books within row expand sequentially
  const getRowDelay = (index: number) => {
    const row = Math.floor(index / 3)
    const col = index % 3
    // Longer delays for slower, more visible animation
    // Row delay + within-row stagger (rightmost books expand last)
    return 0.3 + row * 0.35 + col * 0.12
  }

  return (
    <motion.div
      className={styles.booksGrid}
      initial="hidden"
      animate="visible"
    >
      {books.map((book, index) => {
        const pileOffset = getRowPileOffset(index)
        const variation = pileVariations[index]
        const delay = getRowDelay(index)
        
        return (
          <motion.div
            key={book.id}
            initial={{
              opacity: 1,
              scale: 0.95,
              x: pileOffset.x,
              y: pileOffset.y,
              rotate: variation.rotation,
              zIndex: variation.zIndex,
            }}
            animate={{
              opacity: 1,
              scale: 1,
              x: 0,
              y: 0,
              rotate: 0,
              zIndex: 1,
            }}
            transition={{
              type: 'spring',
              stiffness: 60,
              damping: 12,
              mass: 0.8,
              delay: delay,
            }}
            style={{ position: 'relative' }}
          >
            <BookCard 
              {...book} 
              showRating={showRating}
              onClick={() => onBookClick(book)}
              isExpanded={expandedBookId === book.id}
            />
          </motion.div>
        )
      })}
    </motion.div>
  )
}
