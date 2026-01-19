import styles from './BookCard.module.css'

interface BookCardProps {
  title: string
  author: string
  cover: string
  rating?: number
}

export function BookCard({ title, author, rating }: BookCardProps) {
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
        <div className={styles.rating}>
          {Array.from({ length: 5 }).map((_, i) => (
            <span 
              key={i} 
              className={`${styles.star} ${i < Math.floor(rating) ? styles.filled : ''} ${i === Math.floor(rating) && rating % 1 !== 0 ? styles.half : ''}`}
            >
              ★
            </span>
          ))}
        </div>
      )}
    </article>
  )
}
