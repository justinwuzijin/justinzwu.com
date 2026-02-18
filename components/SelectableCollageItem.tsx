'use client'

import { useRef, useEffect, useState, useCallback, MouseEvent as ReactMouseEvent } from 'react'
import type { CollageItemConfig, ItemTransform } from '@/lib/collageItems'
import styles from './SelectableCollageItem.module.css'

type HandlePosition = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w'

interface SelectableCollageItemProps {
  item: CollageItemConfig
  transform: ItemTransform
  containerRef: React.RefObject<HTMLDivElement | null>
  isSelected: boolean
  onSelect: (id: string, addToSelection: boolean) => void
  onTransformChange: (id: string, updates: Partial<ItemTransform>) => void
  onContextMenu: (e: ReactMouseEvent, id: string) => void
}

export function SelectableCollageItem({
  item,
  transform,
  containerRef,
  isSelected,
  onSelect,
  onTransformChange,
  onContextMenu,
}: SelectableCollageItemProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [isResizing, setIsResizing] = useState(false)
  const [isRotating, setIsRotating] = useState(false)
  const [activeHandle, setActiveHandle] = useState<HandlePosition | null>(null)
  
  const dragStartRef = useRef({ x: 0, y: 0, startX: 0, startY: 0 })
  const resizeStartRef = useRef({ 
    x: 0, y: 0, 
    width: 0, height: 0, 
    startX: 0, startY: 0,
    aspectRatio: 1
  })
  const rotateStartRef = useRef({ angle: 0, startRotation: 0 })

  const handleMouseDown = useCallback((e: ReactMouseEvent) => {
    if (isResizing || isRotating) return
    e.stopPropagation()
    
    const addToSelection = e.shiftKey || e.metaKey || e.ctrlKey
    onSelect(item.id, addToSelection)
    
    if (!containerRef.current) return
    
    setIsDragging(true)
    const containerRect = containerRef.current.getBoundingClientRect()
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      startX: (transform.x / 100) * containerRect.width,
      startY: (transform.y / 100) * containerRect.height,
    }
  }, [item.id, transform, containerRef, onSelect, isResizing, isRotating])

  const handleResizeStart = useCallback((e: ReactMouseEvent, handle: HandlePosition) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!containerRef.current) return
    
    setIsResizing(true)
    setActiveHandle(handle)
    
    const containerRect = containerRef.current.getBoundingClientRect()
    resizeStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      width: transform.width,
      height: transform.height,
      startX: (transform.x / 100) * containerRect.width,
      startY: (transform.y / 100) * containerRect.height,
      aspectRatio: transform.width / transform.height,
    }
  }, [transform, containerRef])

  const handleRotateStart = useCallback((e: ReactMouseEvent) => {
    e.stopPropagation()
    e.preventDefault()
    
    if (!elementRef.current || !containerRef.current) return
    
    setIsRotating(true)
    
    const rect = elementRef.current.getBoundingClientRect()
    const centerX = rect.left + rect.width / 2
    const centerY = rect.top + rect.height / 2
    
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
    
    rotateStartRef.current = {
      angle,
      startRotation: transform.rotation,
    }
  }, [transform.rotation, containerRef])

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const deltaX = e.clientX - dragStartRef.current.x
      const deltaY = e.clientY - dragStartRef.current.y
      
      const newX = dragStartRef.current.startX + deltaX
      const newY = dragStartRef.current.startY + deltaY
      
      const newXPercent = (newX / containerRect.width) * 100
      const newYPercent = (newY / containerRect.height) * 100
      
      onTransformChange(item.id, { x: newXPercent, y: newYPercent })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, item.id, containerRef, onTransformChange])

  useEffect(() => {
    if (!isResizing || !activeHandle) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!containerRef.current) return
      
      const containerRect = containerRef.current.getBoundingClientRect()
      const deltaX = e.clientX - resizeStartRef.current.x
      const deltaY = e.clientY - resizeStartRef.current.y
      const { width: startWidth, height: startHeight, aspectRatio } = resizeStartRef.current
      
      let newWidth = startWidth
      let newHeight = startHeight
      let newX = transform.x
      let newY = transform.y
      
      const maintainAspect = !e.shiftKey
      const minSize = 50

      switch (activeHandle) {
        case 'e':
          newWidth = Math.max(minSize, startWidth + deltaX)
          if (maintainAspect) newHeight = newWidth / aspectRatio
          break
        case 'w':
          newWidth = Math.max(minSize, startWidth - deltaX)
          if (maintainAspect) newHeight = newWidth / aspectRatio
          newX = ((resizeStartRef.current.startX + deltaX) / containerRect.width) * 100
          break
        case 's':
          newHeight = Math.max(minSize, startHeight + deltaY)
          if (maintainAspect) newWidth = newHeight * aspectRatio
          break
        case 'n':
          newHeight = Math.max(minSize, startHeight - deltaY)
          if (maintainAspect) newWidth = newHeight * aspectRatio
          newY = ((resizeStartRef.current.startY + deltaY) / containerRect.height) * 100
          break
        case 'se':
          if (maintainAspect) {
            const delta = Math.max(deltaX, deltaY)
            newWidth = Math.max(minSize, startWidth + delta)
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = Math.max(minSize, startWidth + deltaX)
            newHeight = Math.max(minSize, startHeight + deltaY)
          }
          break
        case 'sw':
          if (maintainAspect) {
            const delta = Math.max(-deltaX, deltaY)
            newWidth = Math.max(minSize, startWidth + delta)
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = Math.max(minSize, startWidth - deltaX)
            newHeight = Math.max(minSize, startHeight + deltaY)
          }
          newX = ((resizeStartRef.current.startX + (startWidth - newWidth)) / containerRect.width) * 100
          break
        case 'ne':
          if (maintainAspect) {
            const delta = Math.max(deltaX, -deltaY)
            newWidth = Math.max(minSize, startWidth + delta)
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = Math.max(minSize, startWidth + deltaX)
            newHeight = Math.max(minSize, startHeight - deltaY)
          }
          newY = ((resizeStartRef.current.startY + (startHeight - newHeight)) / containerRect.height) * 100
          break
        case 'nw':
          if (maintainAspect) {
            const delta = Math.max(-deltaX, -deltaY)
            newWidth = Math.max(minSize, startWidth + delta)
            newHeight = newWidth / aspectRatio
          } else {
            newWidth = Math.max(minSize, startWidth - deltaX)
            newHeight = Math.max(minSize, startHeight - deltaY)
          }
          newX = ((resizeStartRef.current.startX + (startWidth - newWidth)) / containerRect.width) * 100
          newY = ((resizeStartRef.current.startY + (startHeight - newHeight)) / containerRect.height) * 100
          break
      }
      
      onTransformChange(item.id, { 
        width: newWidth, 
        height: newHeight,
        x: newX,
        y: newY,
      })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setActiveHandle(null)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isResizing, activeHandle, item.id, transform, containerRef, onTransformChange])

  useEffect(() => {
    if (!isRotating) return

    const handleMouseMove = (e: globalThis.MouseEvent) => {
      if (!elementRef.current) return
      
      const rect = elementRef.current.getBoundingClientRect()
      const centerX = rect.left + rect.width / 2
      const centerY = rect.top + rect.height / 2
      
      const currentAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX) * (180 / Math.PI)
      const deltaAngle = currentAngle - rotateStartRef.current.angle
      let newRotation = rotateStartRef.current.startRotation + deltaAngle
      
      if (e.shiftKey) {
        newRotation = Math.round(newRotation / 15) * 15
      }
      
      onTransformChange(item.id, { rotation: newRotation })
    }

    const handleMouseUp = () => {
      setIsRotating(false)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isRotating, item.id, onTransformChange])

  const handleContextMenuEvent = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onContextMenu(e, item.id)
  }, [item.id, onContextMenu])

  const positionStyle = containerRef.current ? {
    left: `${transform.x}%`,
    top: `${transform.y}%`,
    width: transform.width,
    height: transform.height,
    zIndex: transform.zIndex + (isDragging ? 1000 : 0),
    transform: `rotate(${transform.rotation}deg)`,
  } : {}

  const handles: HandlePosition[] = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w']

  return (
    <div
      ref={elementRef}
      className={`${styles.item} ${isSelected ? styles.selected : ''} ${isDragging ? styles.dragging : ''}`}
      style={positionStyle}
      onMouseDown={handleMouseDown}
      onContextMenu={handleContextMenuEvent}
    >
      <img
        src={item.src}
        alt={item.alt}
        className={styles.image}
        draggable={false}
      />
      
      {isSelected && (
        <>
          <div className={styles.selectionBox} />
          
          {handles.map((handle) => (
            <div
              key={handle}
              className={`${styles.handle} ${styles[`handle_${handle}`]}`}
              onMouseDown={(e) => handleResizeStart(e, handle)}
            />
          ))}
          
          <div
            className={styles.rotateHandle}
            onMouseDown={handleRotateStart}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
              <path d="M21 3v5h-5" />
            </svg>
          </div>
          
          <div className={styles.rotateLine} />
        </>
      )}
    </div>
  )
}
