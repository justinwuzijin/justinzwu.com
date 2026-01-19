import styles from './page.module.css'

const thoughts = [
  {
    grade: 'grade 9',
    items: [
      'Realistically no one knows where they are going for life (people act like they know they have their shit together when they dont)',
    ],
  },
  {
    grade: 'grade 10',
    items: [
      "it's so interesting pondering about how other people — close or not — think of you and when they spill things about their interpretation on you, it's very surprising. surprising in a way that they know/offer things about you that you wouldn't expect them to have enough evidence to make that",
    ],
  },
  {
    grade: 'grade 11',
    items: [
      'becoming a lot more cognizant of my external image in a non-verbal social setting.',
    ],
  },
  {
    grade: 'grade 12',
    items: [
      'not being afraid of showing your work + branding + marketing. you work so hard, just to throw out a story post and not write anything about it.',
    ],
  },
  {
    grade: '1a & 1st co-op',
    items: [
      'i am feeling more and more appreciative of my family. being away from them for 4 weeks and seeing them all for the first time, i was able to step back and actually see in a bigger picture how much they support me',
    ],
  },
]

export default function DrawerOfThoughtsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.pageTitle}>
        <span className={styles.orangeDot} />
        drawer of thoughts
      </h1>

      <div className={styles.thoughtsList}>
        {thoughts.map((section) => (
          <section key={section.grade} className={styles.section}>
            <h2 className={styles.gradeTitle}>
              <span className={styles.smallOrangeDot} />
              {section.grade}
            </h2>
            <ul className={styles.itemsList}>
              {section.items.map((item, index) => (
                <li key={index} className={styles.thoughtItem}>
                  {item}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  )
}
