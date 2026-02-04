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
  const [isMobile, setIsMobile] = useState(false)
  
  // Use refs for rapidly-changing values to avoid re-renders
  const isOverInteractiveRef = useRef(false)
  const isMouseOnScreenRef = useRef(true)
  const isMouseMovingRef = useRef(false)
  const isSelectingTextRef = useRef(false)
  const hasInitialMousePosRef = useRef(false)
  
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

  useEffect(() => {
    const isActive = digitalDroplets && popups.length > 0
    document.documentElement.setAttribute('data-droplets-active', isActive ? 'true' : 'false')
  }, [digitalDroplets, popups.length])

  // For rendering state (isOverInteractive affects opacity)
  const [isOverInteractive, setIsOverInteractive] = useState(false)

  // Preload videos ONLY when digital droplets is enabled - saves 4.7MB on initial load
  useEffect(() => {
    // Skip on mobile or if digital droplets is disabled
    if (window.innerWidth <= 768 || !digitalDroplets) return

    // Shuffle array and preload first 5 videos when user enables the feature
    const shuffled = [...videoFiles].sort(() => Math.random() - 0.5)
    const priorityVideos = shuffled.slice(0, 5)
    const remainingVideos = shuffled.slice(5)
    
    // Preload priority videos when feature is enabled
    priorityVideos.forEach((videoFile) => {
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
    
    // Preload remaining videos after mouse movement is detected
    const timeoutId = setTimeout(() => {
      if (!digitalDroplets) return // Double-check still enabled
      
      remainingVideos.forEach((videoFile) => {
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
    }, 2000) // Delay until user is actually interacting

    return () => {
      clearTimeout(timeoutId)
      preloadedVideos.current.forEach((video) => {
        video.pause()
        video.removeAttribute('src')
        if (video.parentNode) {
          video.parentNode.removeChild(video)
        }
      })
      preloadedVideos.current.clear()
    }
  }, [digitalDroplets]) // Run immediately on mount, no dependencies

  // Track text selection - only block when actually selecting text
  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()
      isSelectingTextRef.current = selection !== null && selection.toString().length > 0
    }
    
    document.addEventListener('selectionchange', handleSelectionChange)
    
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
    }
  }, [])

  // Track mouse position and movement
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const newPos = { x: e.clientX, y: e.clientY }
      
      // Mark that we now have a valid mouse position
      hasInitialMousePosRef.current = true
      
      // Check if mouse actually moved
      if (newPos.x !== lastMousePos.current.x || newPos.y !== lastMousePos.current.y) {
        lastMousePos.current = newPos
        isMouseMovingRef.current = true
        isMouseOnScreenRef.current = true
        
        // Clear existing timer
        if (mouseStopTimer.current) {
          clearTimeout(mouseStopTimer.current)
        }
        
        // Set timer to detect when mouse stops (longer delay for smoother trail)
        mouseStopTimer.current = setTimeout(() => {
          isMouseMovingRef.current = false
        }, 150)
      }
      
      // Only stop on: links with images, link previews, images that are clickable
      const target = e.target as HTMLElement
      
      // Check if hovering over a link that contains an image, or a link preview
      const linkWithImage = target.closest('a')?.querySelector('img')
      const isLinkPreview = target.closest('[class*="linkPreview"], [class*="LinkPreview"], [class*="preview"]')
      const isClickableImage = target.closest('a img, a [class*="image"], a [class*="Image"], a [class*="cover"], a [class*="Cover"]')
      const isImageLink = target.tagName === 'IMG' && target.closest('a')
      
      const overInteractive = !!(linkWithImage || isLinkPreview || isClickableImage || isImageLink)
      isOverInteractiveRef.current = overInteractive
      setIsOverInteractive(overInteractive) // For rendering opacity
    }
    
    const handleMouseEnter = () => {
      isMouseOnScreenRef.current = true
    }
    const handleMouseLeave = () => {
      isMouseOnScreenRef.current = false
      isMouseMovingRef.current = false
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
  // Using refs for conditions so this callback stays stable
  const spawnVideo = useCallback(() => {
    // Check all conditions using refs (no state dependency = stable callback)
    if (!digitalDroplets) return
    if (isOverInteractiveRef.current) return
    if (isMobile) return
    if (!isMouseOnScreenRef.current) return
    if (!isMouseMovingRef.current) return
    if (isSelectingTextRef.current) return
    if (!hasInitialMousePosRef.current) return
    
    setPopups(prev => {
      if (prev.length >= 7) return prev
      
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
      }, 300)
      
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
  }, [digitalDroplets, isMobile]) // Only re-create when these change (rarely)

  // Spawn videos more frequently for trail effect
  useEffect(() => {
    if (isMobile) return
    
    const interval = setInterval(spawnVideo, 150)
    return () => clearInterval(interval)
  }, [spawnVideo, isMobile])

  // Don't render on mobile or when disabled
  if (isMobile || !digitalDroplets) return null

  return (
    <div className={styles.container} style={{ opacity: isOverInteractive ? 0 : 1 }}>
      {popups.map(popup => (
        <div
          key={popup.id}
          className={styles.popup}
          style={{
            left: popup.x,
            top: popup.y,
            zIndex: popup.zIndex,
          }}
        >
          <video
            src={popup.videoUrl}
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
            preload="auto"
            className={styles.video}
            style={{
              width: popup.width,
              height: popup.height,
            }}
          />
        </div>
      ))}
    </div>
  )
}
