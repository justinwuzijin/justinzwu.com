'use client'

import { motion, AnimatePresence } from 'framer-motion'
import type { CollageItemConfig } from '@/lib/collageItems'
import styles from './CollectionBottomSheet.module.css'

interface CollectionBottomSheetProps {
  item: CollageItemConfig | null
  isOpen: boolean
  onClose: () => void
  onDetailsClick: () => void
}

export function CollectionBottomSheet({
  item,
  isOpen,
  onClose,
  onDetailsClick,
}: CollectionBottomSheetProps) {
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
            className={styles.sheet}
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            <div className={styles.handle} />
            
            <div className={styles.content}>
              <div className={styles.thumbnail}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className={styles.image}
                />
              </div>
              
              <div className={styles.info}>
                <h3 className={styles.name}>{item.alt}</h3>
                <p className={styles.brand}>{item.brand}</p>
              </div>
              
              <button
                className={styles.detailsButton}
                onClick={onDetailsClick}
                aria-label="View details"
              >
                Details
                <svg
                  width="16"
                  height="16"
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
            
            <button
              className={styles.closeButton}
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
