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
          {/* byjustinwu SVG */}
          <div className={`${styles.galleryItem} ${styles.artItem}`}>
            <div className={styles.svgContainer}>
              <img 
                src="/assets/svg/byjustinwu.svg" 
                alt="byjustinwu" 
                className={styles.artImage}
              />
            </div>
            <div>
            <h3>coming soon.</h3>
          </div>
          </div>
          
        </div>
      </section>
    </div>
  )
}
