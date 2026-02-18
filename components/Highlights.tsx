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
  "M 3 8 L 15 3 L 40 2 L 60 3 L 85 2 L 97 8 L 98 18 L 97 32 L 85 38 L 60 39 L 40 38 L 15 39 L 3 32 L 2 18 Z",
  "M 4 10 L 20 4 L 50 3 L 80 4 L 96 10 L 97 20 L 96 30 L 80 37 L 50 38 L 20 37 L 4 30 L 3 20 Z",
  "M 2 12 L 12 5 L 35 2 L 65 2 L 88 5 L 98 12 L 99 20 L 98 28 L 88 36 L 65 39 L 35 39 L 12 36 L 2 28 L 1 20 Z",
  "M 5 9 L 18 2 L 45 1 L 55 1 L 82 2 L 95 9 L 96 20 L 95 31 L 82 38 L 55 40 L 45 40 L 18 38 L 5 31 L 4 20 Z",
]

const circlePathsWide = [
  "M 3 8 L 20 3 L 60 2 L 100 1 L 140 2 L 180 3 L 197 8 L 198 18 L 197 32 L 180 38 L 140 39 L 100 40 L 60 39 L 20 38 L 3 32 L 2 18 Z",
  "M 4 10 L 25 4 L 70 3 L 100 2 L 130 3 L 175 4 L 196 10 L 197 20 L 196 30 L 175 37 L 130 38 L 100 39 L 70 38 L 25 37 L 4 30 L 3 20 Z",
  "M 2 12 L 15 5 L 55 2 L 100 1 L 145 2 L 185 5 L 198 12 L 199 20 L 198 28 L 185 36 L 145 39 L 100 40 L 55 39 L 15 36 L 2 28 L 1 20 Z",
  "M 5 9 L 22 2 L 65 1 L 100 0 L 135 1 L 178 2 L 195 9 L 196 20 L 195 31 L 178 38 L 135 40 L 100 41 L 65 40 L 22 38 L 5 31 L 4 20 Z",
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
