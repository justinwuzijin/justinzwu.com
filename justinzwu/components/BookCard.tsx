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
      {rating !== undefined && showRating && (
        <motion.div
          className={styles.rating}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ 
            delay: 0.8, 
            duration: 0.4, 
            ease: 'easeOut'
          }}
        >
          {Array.from({ length: 5 }).map((_, i) => (
            <span 
              key={i} 
              className={`${styles.star} ${i < rating ? styles.filled : ''}`}
            >
              ★
            </span>
          ))}
        </motion.div>
      )}
    </article>
  )
}
