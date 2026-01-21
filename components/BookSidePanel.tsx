'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from './ThemeProvider'
import styles from './BookSidePanel.module.css'

interface BookSidePanelProps {
  book: {
    id: number
    title: string
    author: string
    rating?: number
    goodreadsId?: string | null
    review?: string | null
  }
  shelf: 'to read' | 'reading' | 'read'
  isOpen: boolean
  onClose: () => void
}

export function BookSidePanel({ book, shelf, isOpen, onClose }: BookSidePanelProps) {
  const { theme } = useTheme()
  const isOrangeMode = theme === 'orange'
  const [synopsis, setSynopsis] = useState<string | null>(null)
  const [synopsisLoading, setSynopsisLoading] = useState(false)
  const [synopsisError, setSynopsisError] = useState<string | null>(null)

  // Determine if we should show review or synopsis
  const shouldShowSynopsis = shelf === 'to read' || shelf === 'reading'
  const shouldShowReview = shelf === 'read'
  const hasReview = book.review && book.review.trim().length > 0

  // Fetch synopsis when panel opens and we need it
  useEffect(() => {
    if (isOpen && shouldShowSynopsis && !synopsis && !synopsisLoading && !synopsisError) {
      setSynopsisLoading(true)
      setSynopsisError(null)
      
      fetch(`/api/book-synopsis?title=${encodeURIComponent(book.title)}&author=${encodeURIComponent(book.author)}`)
        .then(res => res.json())
        .then(data => {
          if (data.synopsis) {
            setSynopsis(data.synopsis)
          } else {
            setSynopsisError(data.error || 'Failed to generate synopsis')
          }
        })
        .catch(err => {
          console.error('Error fetching synopsis:', err)
          setSynopsisError('Failed to load synopsis')
        })
        .finally(() => {
          setSynopsisLoading(false)
        })
    }
  }, [isOpen, shouldShowSynopsis, book.title, book.author, synopsis, synopsisLoading, synopsisError])

  // Reset synopsis when panel closes
  useEffect(() => {
    if (!isOpen) {
      setSynopsis(null)
      setSynopsisError(null)
      setSynopsisLoading(false)
    }
  }, [isOpen])
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          {/* Side Panel */}
          <motion.div
            className={styles.panel}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Close button */}
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close panel"
            >
              ×
            </button>

            {/* Content */}
            <div className={styles.content}>
              {/* Title */}
              <h2 className={styles.title}>{book.title}</h2>
              
              {/* Author */}
              <p className={styles.author}>by {book.author}</p>
              
              {/* Rating */}
              {shelf === 'read' && book.rating !== undefined && (
                <div className={styles.rating}>
                  {Array.from({ length: book.rating }).map((_, i) => {
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
                </div>
              )}
              
              {/* Review or Synopsis */}
              {shouldShowReview && (
                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewTitle}>My Review</h3>
                  {hasReview ? (
                    <div 
                      className={styles.review}
                      dangerouslySetInnerHTML={{ __html: book.review.replace(/\n/g, '<br />') }}
                    />
                  ) : (
                    <p className={styles.noReview}>No review written yet.</p>
                  )}
                </div>
              )}

              {shouldShowSynopsis && (
                <div className={styles.reviewSection}>
                  <h3 className={styles.reviewTitle}>Synopsis</h3>
                  {synopsisLoading ? (
                    <p className={styles.loading}>Generating synopsis...</p>
                  ) : synopsisError ? (
                    <p className={styles.noReview}>{synopsisError}</p>
                  ) : synopsis ? (
                    <p className={styles.review}>{synopsis}</p>
                  ) : (
                    <p className={styles.noReview}>Loading synopsis...</p>
                  )}
                </div>
              )}

              {/* Goodreads Link */}
              {book.goodreadsId && (
                <div className={styles.goodreadsSection}>
                  <a
                    href={`https://www.goodreads.com/book/show/${book.goodreadsId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.goodreadsButton}
                  >
                    View on Goodreads
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
