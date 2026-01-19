import styles from './page.module.css'

export default function ArtGalleryPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <span className={styles.orangeDot} />
        art gallery
      </h1>

      {/* Hero collage area */}
      <section className={styles.heroCollage}>
        <div className={styles.collageGrid}>
          {/* Main large collage placeholder */}
          <div className={styles.mainCollage}>
            <div className={styles.collagePlaceholder}>
              {/* TODO: Add hero collage image */}
              <span>Photo Collage</span>
            </div>
          </div>
          
          {/* Floating J badge */}
          <div className={styles.jBadge}>J</div>
        </div>
      </section>

      {/* Masonry gallery section */}
      <section className={styles.gallery}>
        <div className={styles.masonryGrid}>
          {/* Congratulations letter */}
          <div className={`${styles.galleryItem} ${styles.letterItem}`}>
            <div className={styles.letterPlaceholder}>
              <h3>CONGRATULATIONS!</h3>
              <p>Systems Design Engineering</p>
              <p className={styles.signature}>Justin :)</p>
            </div>
          </div>
          
          {/* Hackathon photos */}
          <div className={`${styles.galleryItem} ${styles.hackathonItem}`}>
            <div className={styles.imagePlaceholder} style={{ backgroundColor: '#6b21a8' }}>
              <span>JAMHacks 9</span>
            </div>
          </div>
          
          {/* Waterloo acceptance */}
          <div className={`${styles.galleryItem} ${styles.acceptanceItem}`}>
            <div className={styles.acceptancePlaceholder}>
              <span>WATERLOO | ENGINEERING</span>
              <p className={styles.gotIn}>I got in!</p>
            </div>
          </div>
          
          {/* Polaroid grid */}
          <div className={`${styles.galleryItem} ${styles.polaroidGrid}`}>
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className={styles.polaroid}>
                <div className={styles.polaroidImage} />
              </div>
            ))}
          </div>
          
          {/* J badge */}
          <div className={styles.floatingBadge}>
            <span>J</span>
          </div>
          
          {/* SYDE shirt */}
          <div className={`${styles.galleryItem} ${styles.shirtItem}`}>
            <div className={styles.shirtPlaceholder}>
              <span>SYDE</span>
            </div>
          </div>
          
          {/* Art piece */}
          <div className={`${styles.galleryItem} ${styles.artItem}`}>
            <div className={styles.artPlaceholder}>
              {/* TODO: Add art image */}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
