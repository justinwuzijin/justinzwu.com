'use client'

import { useState, useCallback, useEffect, RefObject } from 'react'
import type { ItemTransform } from '@/lib/collageItems'
import styles from './MarqueeSelect.module.css'

interface MarqueeSelectProps {
  containerRef: RefObject<HTMLDivElement | null>
  transforms: ItemTransform[]
  onSelectionChange: (ids: string[], addToSelection: boolean) => void
  disabled?: boolean
}

interface MarqueeRect {
  startX: number
  startY: number
  currentX: number
  currentY: number
}

export function MarqueeSelect({
  containerRef,
  transforms,
  onSelectionChange,
  disabled = false,
}: MarqueeSelectProps) {
  const [isSelecting, setIsSelecting] = useState(false)
  const [marquee, setMarquee] = useState<MarqueeRect | null>(null)
  const [addToSelection, setAddToSelection] = useState(false)

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (disabled) return
    if ((e.target as HTMLElement).closest('[data-collage-item]')) return
    
    const container = containerRef.current
    if (!container) return
    
    const rect = container.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    
    setIsSelecting(true)
    setAddToSelection(e.shiftKey || e.metaKey || e.ctrlKey)
    setMarquee({
      startX: x,
      startY: y,
      currentX: x,
      currentY: y,
    })
  }, [containerRef, disabled])

  useEffect(() => {
    if (!isSelecting) return

    const handleMouseMove = (e: MouseEvent) => {
      const container = containerRef.current
      if (!container) return
      
      const rect = container.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      setMarquee(prev => prev ? {
        ...prev,
        currentX: x,
        currentY: y,
      } : null)
    }

    const handleMouseUp = () => {
      if (marquee && containerRef.current) {
        const container = containerRef.current
        const containerRect = container.getBoundingClientRect()
        
        const left = Math.min(marquee.startX, marquee.currentX)
        const right = Math.max(marquee.startX, marquee.currentX)
        const top = Math.min(marquee.startY, marquee.currentY)
        const bottom = Math.max(marquee.startY, marquee.currentY)
        
        const selectedIds = transforms.filter(transform => {
          const itemLeft = (transform.x / 100) * containerRect.width
          const itemTop = (transform.y / 100) * containerRect.height
          const itemRight = itemLeft + transform.width
          const itemBottom = itemTop + transform.height
          
          return !(itemRight < left || itemLeft > right || itemBottom < top || itemTop > bottom)
        }).map(t => t.id)
        
        if (selectedIds.length > 0) {
          onSelectionChange(selectedIds, addToSelection)
        }
      }
      
      setIsSelecting(false)
      setMarquee(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isSelecting, marquee, transforms, containerRef, onSelectionChange, addToSelection])

  const getMarqueeStyle = () => {
    if (!marquee) return {}
    
    const left = Math.min(marquee.startX, marquee.currentX)
    const top = Math.min(marquee.startY, marquee.currentY)
    const width = Math.abs(marquee.currentX - marquee.startX)
    const height = Math.abs(marquee.currentY - marquee.startY)
    
    return { left, top, width, height }
  }

  return (
    <div 
      className={styles.container}
      onMouseDown={handleMouseDown}
    >
      {isSelecting && marquee && (
        <div className={styles.marquee} style={getMarqueeStyle()} />
      )}
    </div>
  )
}
