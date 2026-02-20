'use client'

import { useEffect, useRef } from 'react'
import styles from './CollageContextMenu.module.css'

interface ContextMenuPosition {
  x: number
  y: number
}

interface CollageContextMenuProps {
  position: ContextMenuPosition
  selectedCount: number
  onClose: () => void
  onBringToFront: () => void
  onBringForward: () => void
  onSendBackward: () => void
  onSendToBack: () => void
  onDelete: () => void
  onResetSize: () => void
  onResetRotation: () => void
}

export function CollageContextMenu({
  position,
  selectedCount,
  onClose,
  onBringToFront,
  onBringForward,
  onSendBackward,
  onSendToBack,
  onDelete,
  onResetSize,
  onResetRotation,
}: CollageContextMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose()
      }
    }

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [onClose])

  const handleAction = (action: () => void) => {
    action()
    onClose()
  }

  const itemLabel = selectedCount > 1 ? `${selectedCount} items` : 'item'

  return (
    <div
      ref={menuRef}
      className={styles.menu}
      style={{ left: position.x, top: position.y }}
    >
      <div className={styles.section}>
        <button className={styles.item} onClick={() => handleAction(onBringToFront)}>
          <span className={styles.label}>Bring to Front</span>
          <span className={styles.shortcut}>⌘]</span>
        </button>
        <button className={styles.item} onClick={() => handleAction(onBringForward)}>
          <span className={styles.label}>Bring Forward</span>
          <span className={styles.shortcut}>]</span>
        </button>
        <button className={styles.item} onClick={() => handleAction(onSendBackward)}>
          <span className={styles.label}>Send Backward</span>
          <span className={styles.shortcut}>[</span>
        </button>
        <button className={styles.item} onClick={() => handleAction(onSendToBack)}>
          <span className={styles.label}>Send to Back</span>
          <span className={styles.shortcut}>⌘[</span>
        </button>
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.section}>
        <button className={styles.item} onClick={() => handleAction(onResetSize)}>
          <span className={styles.label}>Reset Size</span>
        </button>
        <button className={styles.item} onClick={() => handleAction(onResetRotation)}>
          <span className={styles.label}>Reset Rotation</span>
        </button>
      </div>
      
      <div className={styles.divider} />
      
      <div className={styles.section}>
        <button className={`${styles.item} ${styles.danger}`} onClick={() => handleAction(onDelete)}>
          <span className={styles.label}>Delete {itemLabel}</span>
          <span className={styles.shortcut}>⌫</span>
        </button>
      </div>
    </div>
  )
}
