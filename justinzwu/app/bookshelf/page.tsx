'use client'

import React from "react"
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './page.module.css'
import { BookCard } from '@/components/BookCard'

type ShelfType = 'to read' | 'reading' | 'read'

const books = {
  'to read': [
    { id: 1, title: 'Sapiens', author: 'Yuval Noah Harari', cover: '/assets/svg/81YfoqcSp6L._UF1000,1000_QL80_.jpg' },
    { id: 2, title: 'Kokoro', author: 'Natsume Sōseki', cover: '/assets/svg/71liK4Q6NeL._UF1000,1000_QL80_.jpg' },
  ],
  'reading': [
    { id: 3, title: 'Flow', author: 'Mihaly Csikszentmihalyi', cover: '/assets/svg/610GM3WYL7L.jpg' },
    { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', cover: '/assets/svg/81YfoqcSp6L._UF1000,1000_QL80_.jpg' },
    { id: 5, title: 'The Remains of the Day', author: 'Kazuo Ishiguro', cover: '/assets/svg/4929 copy.jpg' },
    { id: 6, title: 'Kokoro', author: 'Natsume Sōseki', cover: '/assets/svg/71liK4Q6NeL._UF1000,1000_QL80_.jpg' },
  ],
  'read': [
    { id: 7, title: 'Meditations', author: 'Marcus Aurelius', cover: '/assets/svg/41alKvN9GwL.jpg', rating: 5 },
    { id: 8, title: 'Flow', author: 'Mihaly Csikszentmihalyi', cover: '/assets/svg/610GM3WYL7L.jpg', rating: 5 },
    { id: 9, title: 'Sapiens', author: 'Yuval Noah Harari', cover: '/assets/svg/81YfoqcSp6L._UF1000,1000_QL80_.jpg', rating: 3 },
    { id: 10, title: 'The Remains of the Day', author: 'Kazuo Ishiguro', cover: '/assets/svg/4929 copy.jpg', rating: 4 },
    { id: 11, title: 'Kafka on the Shore', author: 'Haruki Murakami', cover: '/assets/svg/28921.jpg', rating: 5 },
    { id: 12, title: 'Kokoro', author: 'Natsume Sōseki', cover: '/assets/svg/71liK4Q6NeL._UF1000,1000_QL80_.jpg', rating: 4 },
  ],
}

const shelfColors: Record<ShelfType, string> = {
  'to read': '#8b4513',
  'reading': '#c45a1c',
  'read': '#2d8a4e',
}

export default function BookshelfPage() {
  const [activeShelf, setActiveShelf] = useState<ShelfType | null>(null)

  const shelves: ShelfType[] = ['to read', 'reading', 'read']

  const handleShelfClick = (shelf: ShelfType) => {
    if (activeShelf === shelf) {
      // Clicking the same tab again resets to no selection
      setActiveShelf(null)
    } else {
      // Clicking a different tab shows that section
      setActiveShelf(shelf)
    }
  }

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

      {/* Show books for active shelf only */}
      <AnimatePresence mode="wait">
        {activeShelf && (
          <AnimatedBookGrid
            key={activeShelf}
            books={books[activeShelf]}
            isExpanded={true}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

interface AnimatedBookGridProps {
  books: Array<{ id: number; title: string; author: string; cover: string; rating?: number }>
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
        type: 'spring',
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
        type: 'spring',
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
