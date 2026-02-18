'use client'

import { motion, useMotionValue } from 'framer-motion'
import { RefObject, useEffect, useRef } from 'react'
import type { CollageItemConfig } from '@/lib/collageItems'

interface DraggableCollageItemProps {
  item: CollageItemConfig
  x: number  // percentage
  y: number  // percentage
  zIndex: number
  containerRef: RefObject<HTMLDivElement | null>
  onDragStart: (id: string) => void
  onDragEnd: (id: string, xPercent: number, yPercent: number) => void
}

export function DraggableCollageItem({
  item,
  x,
  y,
  zIndex,
  containerRef,
  onDragStart,
  onDragEnd,
}: DraggableCollageItemProps) {
  const elementRef = useRef<HTMLImageElement>(null)
  
  // Use motion values for pixel-based positioning (Figma-like behavior)
  const motionX = useMotionValue(0)
  const motionY = useMotionValue(0)
  
  // Convert percentage to pixels when container is available
  useEffect(() => {
    if (!containerRef.current) return
    const containerRect = containerRef.current.getBoundingClientRect()
    motionX.set((x / 100) * containerRect.width)
    motionY.set((y / 100) * containerRect.height)
  }, [x, y, containerRef, motionX, motionY])

  const handleDragEnd = () => {
    if (!containerRef.current) return
    
    const containerRect = containerRef.current.getBoundingClientRect()
    const containerWidth = containerRect.width
    const containerHeight = containerRect.height
    
    // Get current pixel position from motion values (no clamping - allow items outside bounds)
    const currentX = motionX.get()
    const currentY = motionY.get()
    
    // Convert back to percentage for storage (can be negative or >100)
    const newXPercent = (currentX / containerWidth) * 100
    const newYPercent = (currentY / containerHeight) * 100
    
    onDragEnd(item.id, newXPercent, newYPercent)
  }

  return (
    <motion.img
      ref={elementRef}
      src={item.src}
      alt={item.alt}
      draggable={false}
      drag
      dragMomentum={false}
      dragElastic={0}
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        x: motionX,
        y: motionY,
        width: item.width,
        height: item.height,
        zIndex,
        rotate: item.rotation,
        cursor: 'grab',
        objectFit: 'contain',
        userSelect: 'none',
        touchAction: 'none',
      }}
      whileHover={{ 
        scale: 1.02,
        transition: { duration: 0.15 }
      }}
      whileDrag={{ 
        scale: 1.05, 
        cursor: 'grabbing',
        filter: 'drop-shadow(0 10px 20px rgba(0,0,0,0.3))',
        zIndex: 1000,
      }}
      onDragStart={() => onDragStart(item.id)}
      onDragEnd={handleDragEnd}
    />
  )
}
