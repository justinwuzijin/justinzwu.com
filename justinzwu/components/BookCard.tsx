'use client'

import { motion } from 'framer-motion'
import styles from './BookCard.module.css'

interface BookCardProps {
  title: string
  author: string
  cover: string
  rating?: number
  showRating?: boolean
}

export function BookCard({ title, author, rating, showRating = false }: BookCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.coverWrapper}>
        {/* TODO: Replace with actual book cover images */}
        <div className={styles.coverPlaceholder}>
          <span className={styles.bookTitle}>{title}</span>
          <span className={styles.bookAuthor}>{author}</span>
        </div>
      </div>
      {rating !== undefined && (
        <motion.div
          className={styles.rating}
          initial={{ opacity: 0, y: 10 }}
          animate={showRating ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ delay: 0.5, duration: 0.4 }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span 
              key={i} 
              className={`${styles.star} ${i < Math.floor(rating) ? styles.filled : ''} ${i === Math.floor(rating) && rating % 1 !== 0 ? styles.half : ''}`}
            >
              ★
            </span>
          ))}
        </motion.div>
      )}
    </article>
  )
}
