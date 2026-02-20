'use client'

import { useCallback, useRef, useEffect } from 'react'

const SOUND_CONFIG = {
  click: { path: '/assets/sfx/1.wav', volume: 0.14 },
  select: { path: '/assets/sfx/2.wav', volume: 0.10 },
  deselect: { path: '/assets/sfx/3.wav', volume: 0.11 },
  menu: { path: '/assets/sfx/4.wav', volume: 0.08 },
} as const

type SoundType = keyof typeof SOUND_CONFIG

class SoundManager {
  private sounds: Map<SoundType, HTMLAudioElement[]> = new Map()
  private poolSize = 3
  private initialized = false

  init() {
    if (this.initialized || typeof window === 'undefined') return
    
    Object.entries(SOUND_CONFIG).forEach(([key, config]) => {
      const pool: HTMLAudioElement[] = []
      for (let i = 0; i < this.poolSize; i++) {
        const audio = new Audio(config.path)
        audio.volume = config.volume
        audio.preload = 'auto'
        pool.push(audio)
      }
      this.sounds.set(key as SoundType, pool)
    })
    
    this.initialized = true
  }

  play(type: SoundType) {
    if (!this.initialized) this.init()
    
    const pool = this.sounds.get(type)
    if (!pool) return

    const audio = pool.find(a => a.paused || a.ended) || pool[0]
    if (audio) {
      audio.currentTime = 0
      audio.play().catch(() => {})
    }
  }
}

const soundManager = new SoundManager()

export function useSoundEffects() {
  const initialized = useRef(false)

  useEffect(() => {
    if (!initialized.current) {
      soundManager.init()
      initialized.current = true
    }
  }, [])

  const playClick = useCallback(() => {
    soundManager.play('click')
  }, [])

  const playSelect = useCallback(() => {
    soundManager.play('select')
  }, [])

  const playDeselect = useCallback(() => {
    soundManager.play('deselect')
  }, [])

  const playMenu = useCallback(() => {
    soundManager.play('menu')
  }, [])

  return {
    playClick,
    playSelect,
    playDeselect,
    playMenu,
  }
}

export { soundManager }
