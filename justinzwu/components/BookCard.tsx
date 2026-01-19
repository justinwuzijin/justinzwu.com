'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import styles from './BookCard.module.css'

interface BookCardProps {
  title: string
  author: string
  cover: string
  rating?: number
  showRating?: boolean
}

export function BookCard({ title, author, cover, rating, showRating = false }: BookCardProps) {
  return (
    <article className={styles.card}>
      <div className={styles.coverWrapper}>
        <Image
          src={cover}
          alt={`${title} by ${author}`}
          fill
          className={styles.bookCover}
          sizes="(max-width: 768px) 50vw, 33vw"
        />
      </div>
      {rating !== undefined && (
        <motion.div
          className={styles.rating}
          initial={{ opacity: 0 }}
          animate={{ opacity: showRating ? 1 : 0 }}
          transition={{ 
            delay: showRating ? 0.6 : 0, 
            duration: 0.5, 
            ease: 'easeOut'
          }}
          style={{ visibility: showRating ? 'visible' : 'hidden' }}
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
