'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface LinkPreviewProps {
  url: string
  children: React.ReactNode
  className?: string
  width?: number
  height?: number
  quality?: number
  layout?: string
  isStatic?: boolean
  imageSrc?: string
}

export function LinkPreview({
  children,
  url,
  className = '',
  width = 200,
  height = 125,
  quality = 50,
  layout = 'fixed',
  isStatic = false,
  imageSrc = '',
}: LinkPreviewProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  const ref = useRef<HTMLAnchorElement>(null)
  const [coords, setCoords] = useState({ x: 0, y: 0 })
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    if (ref.current && isHovering) {
      const updateCoords = () => {
        if (ref.current) {
          const rect = ref.current.getBoundingClientRect()
          const scrollY = window.scrollY || window.pageYOffset
          setCoords({ 
            x: rect.left + rect.width / 2, 
            y: rect.top + scrollY - 10 
          })
        }
      }
      updateCoords()
      window.addEventListener('scroll', updateCoords, { passive: true })
      window.addEventListener('resize', updateCoords)
      return () => {
        window.removeEventListener('scroll', updateCoords)
        window.removeEventListener('resize', updateCoords)
      }
    }
  }, [isHovering])

  const handleMouseEnter = () => {
    setIsHovering(true)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 300) // Delay to prevent accidental triggers
  }

  const handleMouseLeave = () => {
    setIsHovering(false)
    setIsOpen(false)
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
  }

  const imageUrl = isStatic 
    ? imageSrc 
    : `https://api.microlink.io/api/screenshot?url=${encodeURIComponent(url)}&width=${width}&height=${height}&quality=${quality}&screenshot=true&embed=screenshot.url`

  return (
    <a
      ref={ref}
      className={`relative inline-block ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      {children}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 10 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            style={{
              position: 'fixed',
              left: `${coords.x}px`,
              top: `${coords.y}px`,
              transform: 'translateX(-50%) translateY(-100%)',
              zIndex: 9999,
              pointerEvents: 'none',
            }}
            className="flex flex-col items-center justify-center rounded-lg shadow-xl"
          >
            <img
              src={imageUrl}
              alt="Link preview"
              width={width}
              height={height}
              className="rounded-lg object-cover"
              onError={() => {
                setIsOpen(false)
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </a>
  )
}
