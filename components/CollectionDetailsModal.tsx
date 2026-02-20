'use client'

import { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { CollageItemConfig } from '@/lib/collageItems'
import styles from './CollectionDetailsModal.module.css'

interface CollectionDetailsModalProps {
  item: CollageItemConfig | null
  items: CollageItemConfig[]
  isOpen: boolean
  onClose: () => void
  onNavigate: (item: CollageItemConfig) => void
}

export function CollectionDetailsModal({
  item,
  items,
  isOpen,
  onClose,
  onNavigate,
}: CollectionDetailsModalProps) {
  const currentIndex = item ? items.findIndex(i => i.id === item.id) : -1
  const hasPrev = currentIndex > 0
  const hasNext = currentIndex < items.length - 1

  const handlePrev = useCallback(() => {
    if (hasPrev) {
      onNavigate(items[currentIndex - 1])
    }
  }, [hasPrev, items, currentIndex, onNavigate])

  const handleNext = useCallback(() => {
    if (hasNext) {
      onNavigate(items[currentIndex + 1])
    }
  }, [hasNext, items, currentIndex, onNavigate])

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      } else if (e.key === 'ArrowLeft') {
        handlePrev()
      } else if (e.key === 'ArrowRight') {
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, handlePrev, handleNext])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!item) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            className={styles.backdrop}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6L6 18" />
                <path d="M6 6l12 12" />
              </svg>
            </button>

            <div className={styles.content}>
              <div className={styles.imageContainer}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className={styles.image}
                />
              </div>
              
              <div className={styles.details}>
                <h2 className={styles.name}>{item.alt}</h2>
                <p className={styles.brand}>{item.brand}</p>
                <p className={styles.description}>{item.description}</p>
              </div>
            </div>

            <div className={styles.navigation}>
              <button
                className={`${styles.navButton} ${!hasPrev ? styles.disabled : ''}`}
                onClick={handlePrev}
                disabled={!hasPrev}
                aria-label="Previous item"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M15 18l-6-6 6-6" />
                </svg>
              </button>
              
              <span className={styles.counter}>
                {currentIndex + 1} / {items.length}
              </span>
              
              <button
                className={`${styles.navButton} ${!hasNext ? styles.disabled : ''}`}
                onClick={handleNext}
                disabled={!hasNext}
                aria-label="Next item"
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 18l6-6-6-6" />
                </svg>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
