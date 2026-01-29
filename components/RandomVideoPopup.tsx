'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useTheme } from './ThemeProvider'
import styles from './RandomVideoPopup.module.css'

// Using trimmed 2-second videos for faster loading (4.7MB total vs 302MB original)
const VIDEO_BASE_PATH = '/assets/videos-short'

const videoFiles = [
  'Screen Recording 2024-06-22 at 10.53.30 AM.mp4',
  'Screen Recording 2024-06-22 at 10.56.15 AM.mp4',
  'Screen Recording 2024-06-22 at 10.56.26 AM.mp4',
  'Screen Recording 2024-06-22 at 10.56.44 AM.mp4',
  'Screen Recording 2024-06-22 at 10.57.05 AM.mp4',
  'Screen Recording 2024-06-22 at 10.57.23 AM.mp4',
  'Screen Recording 2024-06-22 at 10.57.52 AM.mp4',
  'Screen Recording 2024-07-24 at 12.00.48 PM.mp4',
  'Screen Recording 2024-07-24 at 12.03.27 PM.mp4',
  'Screen Recording 2024-07-24 at 12.04.28 PM.mp4',
  'Screen Recording 2025-04-23 at 9.38.28 PM.mp4',
  'Screen Recording 2025-04-23 at 9.38.59 PM.mp4',
  'Screen Recording 2025-04-23 at 9.39.21 PM.mp4',
  'Screen Recording 2025-04-23 at 9.39.40 PM.mp4',
  'Screen Recording 2025-07-22 at 8.41.58 AM.mp4',
  'Screen Recording 2025-07-22 at 8.42.33 AM.mp4',
  'Screen Recording 2025-07-28 at 12.19.38 PM.mp4',
  'Screen Recording 2025-09-15 at 8.54.20 AM.mp4',
  'Screen Recording 2025-12-25 at 8.31.06 PM.mp4',
  'Screen Recording 2025-12-25 at 8.33.41 PM.mp4',
  'Screen Recording 2025-12-25 at 8.34.06 PM.mp4',
  'Screen Recording 2025-12-25 at 8.34.23 PM.mp4',
]

interface VideoPopup {
  id: number
  videoUrl: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
}

export function RandomVideoPopup() {
  const { digitalDroplets } = useTheme()
  const [popups, setPopups] = useState<VideoPopup[]>([])
  const [readyPopups, setReadyPopups] = useState<Set<number>>(new Set())
  const [isOverInteractive, setIsOverInteractive] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMouseOnScreen, setIsMouseOnScreen] = useState(false)
  const [isMouseMoving, setIsMouseMoving] = useState(false)
  const [isSelectingText, setIsSelectingText] = useState(false)
  const idCounter = useRef(0)
  const lastMousePos = useRef({ x: 0, y: 0 })
  const lastPopupPos = useRef({ x: 0, y: 0, width: 0, height: 0 })
  const mouseStopTimer = useRef<NodeJS.Timeout | null>(null)
  const preloadedVideos = useRef<Map<string, HTMLVideoElement>>(new Map())

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Preload videos in background for smoother playback
  // Videos are small (~200KB) so they can load on-demand if needed
  useEffect(() => {
    // Skip on mobile
    if (window.innerWidth <= 768) return

    // Preload videos in background
    videoFiles.forEach((videoFile) => {
      const videoUrl = `${VIDEO_BASE_PATH}/${videoFile}`
      if (preloadedVideos.current.has(videoUrl)) return

      const video = document.createElement('video')
      video.src = videoUrl
      video.preload = 'auto'
      video.muted = true
      video.playsInline = true
      video.setAttribute('webkit-playsinline', 'true')
      video.style.cssText = 'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;z-index:-9999;'
      
      video.load()
      preloadedVideos.current.set(videoUrl, video)
      document.body.appendChild(video)
    })

    return () => {
      preloadedVideos.current.forEach((video) => {
        video.pause()
        video.removeAttribute('src')
        if (video.parentNode) {
          video.parentNode.removeChild(video)
        }
      })
      preloadedVideos.current.clear()
    }
  }, []) // Run immediately on mount, no dependencies

  // Track text selection
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      setIsSelectingText(selection !== null && selection.toString().length > 0)
    }
    
    const handleMouseDown = () => {
      // User might be starting to select text
      setIsSelectingText(true)
    }
    
    const handleMouseUp = () => {
      // Check if there's actual selection after mouse up
      setTimeout(() => {
        const selection = window.getSelection()
        setIsSelectingText(selection !== null && selection.toString().length > 0)
      }, 10)
    }
    
    document.addEventListener('selectionchange', handleSelectionChange)
    document.addEventListener('mousedown', handleMouseDown)
    document.addEventListener('mouseup', handleMouseUp)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      document.removeEventListener('mousedown', handleMouseDown)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [])

  // Track mouse position and movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY }
      
      // Check if mouse actually moved
      if (newPos.x !== lastMousePos.current.x || newPos.y !== lastMousePos.current.y) {
        lastMousePos.current = newPos
        setIsMouseMoving(true)
        
        // Clear existing timer
        if (mouseStopTimer.current) {
          clearTimeout(mouseStopTimer.current)
        }
        
        // Set timer to detect when mouse stops
        mouseStopTimer.current = setTimeout(() => {
          setIsMouseMoving(false)
        }, 100)
      }
      
      // Only stop on: links with images, link previews, images that are clickable
      const target = e.target as HTMLElement
      
      // Check if hovering over a link that contains an image, or a link preview
      const linkWithImage = target.closest('a')?.querySelector('img')
      const isLinkPreview = target.closest('[class*="linkPreview"], [class*="LinkPreview"], [class*="preview"]')
      const isClickableImage = target.closest('a img, a [class*="image"], a [class*="Image"], a [class*="cover"], a [class*="Cover"]')
      const isImageLink = target.tagName === 'IMG' && target.closest('a')
      
      setIsOverInteractive(!!(linkWithImage || isLinkPreview || isClickableImage || isImageLink))
    }
    
    const handleMouseEnter = () => setIsMouseOnScreen(true)
    const handleMouseLeave = () => {
      setIsMouseOnScreen(false)
      setIsMouseMoving(false)
    }
    
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseenter', handleMouseEnter)
    document.addEventListener('mouseleave', handleMouseLeave)
    
    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseenter', handleMouseEnter)
      document.removeEventListener('mouseleave', handleMouseLeave)
      if (mouseStopTimer.current) clearTimeout(mouseStopTimer.current)
    }
  }, [])

  // Spawn video at current mouse position with overlap effect
  const spawnVideo = useCallback(() => {
    if (!digitalDroplets || isOverInteractive || isMobile || !isMouseOnScreen || !isMouseMoving || isSelectingText) return
    
    setPopups(prev => {
      if (prev.length >= 15) return prev
      
      // Prefer videos that are already preloaded and ready
      const preloadedUrls = Array.from(preloadedVideos.current.keys())
      const randomUrl = preloadedUrls.length > 0 
        ? preloadedUrls[Math.floor(Math.random() * preloadedUrls.length)]
        : `${VIDEO_BASE_PATH}/${videoFiles[Math.floor(Math.random() * videoFiles.length)]}`
      const videoUrl = randomUrl
      
      // Small random distortion
      const distortionType = Math.random()
      let width: number
      let height: number
      
      if (distortionType < 0.4) {
        // Tall and narrow
        width = 15 + Math.random() * 25 // 15-40px
        height = 50 + Math.random() * 70 // 50-120px
      } else if (distortionType < 0.8) {
        // Wide and short
        width = 50 + Math.random() * 70 // 50-120px
        height = 15 + Math.random() * 25 // 15-40px
      } else {
        // Small square-ish
        width = 25 + Math.random() * 35 // 25-60px
        height = 25 + Math.random() * 35 // 25-60px
      }
      
      // Position exactly at mouse
      let x = lastMousePos.current.x
      let y = lastMousePos.current.y
      
      // If we have a previous popup, create slight offset for partial overlap
      if (lastPopupPos.current.width > 0) {
        // Calculate overlap offset (10-30% of the previous element's size)
        const overlapX = lastPopupPos.current.width * (0.1 + Math.random() * 0.2)
        const overlapY = lastPopupPos.current.height * (0.1 + Math.random() * 0.2)
        
        // Random direction for the offset
        const offsetX = (Math.random() - 0.5) * overlapX * 2
        const offsetY = (Math.random() - 0.5) * overlapY * 2
        
        x = lastMousePos.current.x + offsetX
        y = lastMousePos.current.y + offsetY
      }
      
      // Store this popup's position for next overlap calculation
      lastPopupPos.current = { x, y, width, height }
      
      const newId = idCounter.current++
      const zIndex = 100 + (newId % 20)
      
      // All videos disappear after 0.5 seconds
      setTimeout(() => {
        setPopups(p => p.filter(popup => popup.id !== newId))
        setReadyPopups(prev => {
          const next = new Set(prev)
          next.delete(newId)
          return next
        })
      }, 500)
      
      return [...prev, {
        id: newId,
        videoUrl,
        x,
        y,
        width,
        height,
        zIndex,
      }]
    })
  }, [digitalDroplets, isOverInteractive, isMobile, isMouseOnScreen, isMouseMoving, isSelectingText])

  // Spawn videos more frequently for trail effect
  useEffect(() => {
    if (isMobile) return
    
    const interval = setInterval(spawnVideo, 100)
    return () => clearInterval(interval)
  }, [spawnVideo, isMobile])

  // Don't render on mobile or when disabled
  if (isMobile || !digitalDroplets) return null

  return (
    <div className={styles.container} style={{ opacity: isOverInteractive ? 0 : 1 }}>
      {popups.map(popup => {
        const isReady = readyPopups.has(popup.id)
        return (
          <div
            key={popup.id}
            className={styles.popup}
            style={{
              left: popup.x,
              top: popup.y,
              zIndex: popup.zIndex,
              display: isReady ? 'block' : 'none',
            }}
          >
            <video
              src={popup.videoUrl}
              autoPlay
              muted
              loop
              playsInline
              webkit-playsinline="true"
              preload="metadata"
              className={styles.video}
              data-ready={isReady ? 'true' : undefined}
              style={{
                width: popup.width,
                height: popup.height,
              }}
              onLoadedData={(e) => {
                const video = e.currentTarget
                setReadyPopups(prev => new Set(prev).add(popup.id))
                video.play().catch(() => {
                  setTimeout(() => video.play().catch(() => {}), 50)
                })
              }}
              onCanPlay={(e) => {
                const video = e.currentTarget
                if (!readyPopups.has(popup.id)) {
                  setReadyPopups(prev => new Set(prev).add(popup.id))
                  video.play().catch(() => {
                    setTimeout(() => video.play().catch(() => {}), 50)
                  })
                }
              }}
            />
          </div>
        )
      })}
    </div>
  )
}
