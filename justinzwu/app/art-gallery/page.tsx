import styles from './page.module.css'

export default function ArtGalleryPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <span className={styles.orangeDot} />
        art gallery
      </h1>

      {/* Masonry gallery section */}
      <section className={styles.gallery}>
        <div className={styles.masonryGrid}>
          {/* Polaroid grid */}
          <div className={`${styles.galleryItem} ${styles.polaroidGrid}`}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.polaroid}>
                <div className={styles.polaroidImage} />
              </div>
            ))}
          </div>
          
          {/* badge */}
          <div className={styles.floatingBadge}>
            <span></span>
          </div>
          
          {/* SYDE shirt */}
          <div className={`${styles.galleryItem} ${styles.shirtItem}`}>
            <div className={styles.shirtPlaceholder}>
              <span></span>
            </div>
          </div>
          
        </div>
      </section>
    </div>
  )
}
