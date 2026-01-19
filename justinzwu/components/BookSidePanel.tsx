'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import styles from './BookSidePanel.module.css'

interface BookSidePanelProps {
  book: {
    id: number
    title: string
    author: string
    rating?: number
  }
  isOpen: boolean
  onClose: () => void
}

export function BookSidePanel({ book, isOpen, onClose }: BookSidePanelProps) {
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
              {book.rating !== undefined && (
                <div className={styles.rating}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <span
                      key={i}
                      className={`${styles.star} ${i < book.rating! ? styles.filled : ''}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              )}
              
              {/* Review */}
              <div className={styles.reviewSection}>
                <h3 className={styles.reviewTitle}>My Review</h3>
                <p className={styles.noReview}>No review available.</p>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
