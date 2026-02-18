'use client'

import { motion } from 'framer-motion'
import styles from './Highlights.module.css'

const drawVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 1.8, ease: [0.43, 0.13, 0.23, 0.96] as const, delay },
      opacity: { duration: 0.3, delay },
    },
  }),
}

const scribbleVariants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (delay: number = 0) => ({
    pathLength: 1,
    opacity: 1,
    transition: {
      pathLength: { duration: 0.4, ease: [0.43, 0.13, 0.23, 0.96] as const, delay },
      opacity: { duration: 0.1, delay },
    },
  }),
}

const circlePaths = [
  "M 8 20 C 8 8, 20 4, 50 4 C 80 4, 94 10, 94 20 C 94 30, 80 36, 50 36 C 20 36, 8 32, 8 20",
  "M 6 18 C 4 6, 25 2, 52 3 C 82 4, 96 12, 95 22 C 94 32, 75 38, 48 37 C 18 36, 8 30, 6 18",
  "M 10 22 C 12 10, 28 5, 55 6 C 78 7, 92 14, 90 24 C 88 34, 70 37, 45 36 C 22 35, 8 28, 10 22",
  "M 5 19 C 3 7, 22 3, 48 4 C 76 5, 95 11, 96 21 C 97 31, 78 37, 50 38 C 20 39, 7 31, 5 19",
]

const circlePathsWide = [
  "M 4 20 C 4 8, 15 4, 100 4 C 185 4, 196 10, 196 20 C 196 30, 185 36, 100 36 C 15 36, 4 32, 4 20",
  "M 3 18 C 2 6, 20 2, 100 3 C 180 4, 198 12, 197 22 C 196 32, 175 38, 100 37 C 25 36, 4 30, 3 18",
  "M 5 22 C 6 10, 22 5, 100 6 C 178 7, 195 14, 194 24 C 193 34, 170 37, 100 36 C 30 35, 4 28, 5 22",
  "M 3 19 C 2 7, 18 3, 100 4 C 182 5, 198 11, 198 21 C 198 31, 180 37, 100 38 C 20 39, 4 31, 3 19",
]

const underlinePaths = [
  "M 2 5 Q 50 8, 100 4 T 198 6",
  "M 2 6 Q 40 3, 90 7 Q 140 4, 198 5",
  "M 2 4 Q 60 7, 110 3 T 198 6",
  "M 2 5 Q 45 2, 95 6 Q 150 3, 198 5",
  "M 2 6 Q 55 4, 105 7 T 198 4",
]

const scribblePaths = [
  "M 2 3 L 198 7 M 5 5 L 195 4 M 3 7 L 197 6",
  "M 2 4 L 198 5 M 4 6 L 196 7 M 3 3 L 197 4",
  "M 2 5 L 198 4 M 5 7 L 195 6 M 3 4 L 197 5",
]

let circleIndex = 0
let underlineIndex = 0
let scribbleIndex = 0

export function CircleHighlight({ children, className = '', delay = 0, wide = false }: { children: React.ReactNode; className?: string; delay?: number; wide?: boolean }) {
  const paths = wide ? circlePathsWide : circlePaths
  const pathIndex = circleIndex++ % paths.length
  const viewBox = wide ? "0 0 200 40" : "0 0 100 40"
  
  return (
    <span className={`${styles.circleHighlight} ${wide ? styles.circleWide : ''} ${className}`}>
      <motion.svg 
        viewBox={viewBox}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.path
          d={paths[pathIndex]}
          variants={drawVariants}
          custom={delay}
        />
      </motion.svg>
      {children}
    </span>
  )
}

export function UnderlineHighlight({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const pathIndex = underlineIndex++ % underlinePaths.length
  
  return (
    <span className={styles.underlineHighlight}>
      <motion.svg
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.path
          d={underlinePaths[pathIndex]}
          variants={drawVariants}
          custom={delay}
        />
      </motion.svg>
      {children}
    </span>
  )
}

export function ScribbleHighlight({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const pathIndex = scribbleIndex++ % scribblePaths.length
  
  return (
    <span className={styles.scribbleHighlight}>
      <motion.svg
        viewBox="0 0 200 10"
        preserveAspectRatio="none"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        {scribblePaths[pathIndex].split(' M ').map((segment, i) => (
          <motion.path
            key={i}
            d={i === 0 ? segment : `M ${segment}`}
            variants={scribbleVariants}
            custom={delay + i * 0.1}
          />
        ))}
      </motion.svg>
      {children}
    </span>
  )
}
