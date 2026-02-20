'use client'

import { useEffect } from 'react'
import { useSoundEffects } from '@/hooks/useSoundEffects'

const INTERACTIVE_ELEMENTS = ['BUTTON', 'A', 'INPUT', 'TEXTAREA', 'SELECT', 'AUDIO', 'VIDEO']
const INTERACTIVE_ROLES = ['button', 'link', 'menuitem', 'tab', 'checkbox', 'radio', 'switch']

export function GlobalClickSound() {
  const { playClick } = useSoundEffects()

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      
      // Skip if clicking on interactive elements that have their own sounds
      if (INTERACTIVE_ELEMENTS.includes(target.tagName)) return
      
      // Skip if element has interactive role
      const role = target.getAttribute('role')
      if (role && INTERACTIVE_ROLES.includes(role)) return
      
      // Skip if clicking inside elements that handle their own sounds
      if (target.closest('button, a, [role="button"], [data-collage-item], [data-no-click-sound]')) return
      
      // Skip if clicking on sidebar navigation
      if (target.closest('[data-sidebar]')) return
      
      // Skip if clicking on fixed controls
      if (target.closest('[data-fixed-controls]')) return
      
      // Play click sound for general page clicks
      playClick()
    }

    document.addEventListener('click', handleClick)
    return () => document.removeEventListener('click', handleClick)
  }, [playClick])

  return null
}
