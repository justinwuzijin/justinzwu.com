import styles from './page.module.css'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.pageTitle}>
          <span className={styles.orangeDot} />
          bookshelf
        </h1>
      </div>

      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
        </div>
        <p className={styles.loadingText}>Loading books...</p>
      </div>
    </div>
  )
}
