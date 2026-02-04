import styles from './page.module.css'

export default function Loading() {
  return (
    <div className={styles.container}>
      <div className={styles.loadingState}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner} />
        </div>
        <p>Loading...</p>
      </div>
    </div>
  )
}
