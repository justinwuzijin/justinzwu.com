'use client'

import React from "react"

import { useState } from 'react'
import styles from './page.module.css'
import { BookCard } from '@/components/BookCard'

type ShelfType = 'to read' | 'reading' | 'read'

const books = {
  'to read': [
    { id: 1, title: 'Sapiens', author: 'Yuval Noah Harari', cover: '/images/sapiens.jpg' },
    { id: 2, title: 'Kokoro', author: 'Natsume Sōseki', cover: '/images/kokoro.jpg' },
  ],
  'reading': [
    { id: 3, title: 'Flow', author: 'Mihaly Csikszentmihalyi', cover: '/images/flow.jpg' },
    { id: 4, title: 'Sapiens', author: 'Yuval Noah Harari', cover: '/images/sapiens.jpg' },
    { id: 5, title: 'The Remains of the Day', author: 'Kazuo Ishiguro', cover: '/images/remains.jpg' },
    { id: 6, title: 'Kokoro', author: 'Natsume Sōseki', cover: '/images/kokoro.jpg' },
  ],
  'read': [
    { id: 7, title: 'Meditations', author: 'Marcus Aurelius', cover: '/images/meditations.jpg', rating: 4.5 },
    { id: 8, title: 'Flow', author: 'Mihaly Csikszentmihalyi', cover: '/images/flow.jpg', rating: 5 },
    { id: 9, title: 'Sapiens', author: 'Yuval Noah Harari', cover: '/images/sapiens.jpg', rating: 3 },
    { id: 10, title: 'The Remains of the Day', author: 'Kazuo Ishiguro', cover: '/images/remains.jpg', rating: 4 },
    { id: 11, title: 'Norwegian Wood', author: 'Haruki Murakami', cover: '/images/norwegian.jpg', rating: 4.5 },
    { id: 12, title: 'Kokoro', author: 'Natsume Sōseki', cover: '/images/kokoro.jpg', rating: 3.5 },
  ],
}

const shelfColors: Record<ShelfType, string> = {
  'to read': '#8b4513',
  'reading': '#c45a1c',
  'read': '#2d8a4e',
}

export default function BookshelfPage() {
  const [activeShelf, setActiveShelf] = useState<ShelfType | 'all'>('all')

  const shelves: ShelfType[] = ['to read', 'reading', 'read']

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
            onClick={() => setActiveShelf(activeShelf === shelf ? 'all' : shelf)}
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

      {/* Book grids */}
      {shelves.map((shelf) => (
        (activeShelf === 'all' || activeShelf === shelf) && (
          <section key={shelf} className={styles.shelfSection}>
            {activeShelf === 'all' && (
              <h2 className={styles.shelfTitle}>
                <span 
                  className={styles.shelfDot} 
                  style={{ backgroundColor: shelfColors[shelf] }}
                />
                {shelf}
              </h2>
            )}
            <div className={styles.booksGrid}>
              {books[shelf].map((book) => (
                <BookCard key={book.id} {...book} />
              ))}
            </div>
          </section>
        )
      ))}
    </div>
  )
}
