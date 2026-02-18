export interface CollageItemConfig {
  id: string
  src: string
  alt: string
  width: number
  height: number
  defaultX: number  // percentage from left (0-100)
  defaultY: number  // percentage from top (0-100)
  rotation: number  // degrees
}

export const collageItems: CollageItemConfig[] = [
  // Basketball - far left
  {
    id: 'basketball',
    src: '/assets/collection/basketball.png',
    alt: 'Wilson Evolution Basketball',
    width: 180,
    height: 180,
    defaultX: -2,
    defaultY: 15,
    rotation: 0,
  },
  // Ping pong ball - left side below basketball
  {
    id: 'ping-pong-ball',
    src: '/assets/collection/ping-pong-ball.png',
    alt: 'Marty Supreme Ping Pong Ball',
    width: 160,
    height: 160,
    defaultX: 1,
    defaultY: 60,
    rotation: 0,
  },
  // Dr Martens - upper area, left of center
  {
    id: 'dr-martens',
    src: '/assets/collection/dr-martens.png',
    alt: 'Dr. Martens Oxford Shoes',
    width: 200,
    height: 100,
    defaultX: 18,
    defaultY: -2,
    rotation: -3,
  },
  // Stay Winning - upper center
  {
    id: 'stay-winning',
    src: '/assets/collection/stay-winning.png',
    alt: 'Stay Winning Sticky Note',
    width: 240,
    height: 100,
    defaultX: 28,
    defaultY: 5,
    rotation: 2,
  },
  // Fujifilm camera - left-center area
  {
    id: 'fujifilm-camera',
    src: '/assets/collection/fujifilm-camera.png',
    alt: 'Fujifilm QuickSnap Disposable Camera',
    width: 220,
    height: 140,
    defaultX: 8,
    defaultY: 32,
    rotation: 8,
  },
  // Photo collage - center-left, overlapping
  {
    id: 'photo-collage',
    src: '/assets/collection/photo-collage.png',
    alt: 'Photo memories collage',
    width: 420,
    height: 360,
    defaultX: 18,
    defaultY: 28,
    rotation: -1,
  },
  // Kafka book - upper center
  {
    id: 'kafka-book',
    src: '/assets/collection/kafka-book.png',
    alt: 'Kafka on the Shore by Haruki Murakami',
    width: 180,
    height: 250,
    defaultX: 38,
    defaultY: -5,
    rotation: 3,
  },
  // Polar jeans - upper center-right
  {
    id: 'polar-jeans',
    src: '/assets/collection/polar-jeans.png',
    alt: 'Polar Big Boy Jeans',
    width: 260,
    height: 440,
    defaultX: 52,
    defaultY: -8,
    rotation: 0,
  },
  // Noodle bowl - center-right
  {
    id: 'noodle-bowl',
    src: '/assets/collection/noodle-bowl.png',
    alt: 'Noodle Bowl',
    width: 170,
    height: 170,
    defaultX: 68,
    defaultY: 5,
    rotation: 0,
  },
  // Mahjong tiles - center
  {
    id: 'mahjong-tiles',
    src: '/assets/collection/mahjong-tiles.png',
    alt: 'Mahjong Dragon Tiles',
    width: 300,
    height: 130,
    defaultX: 35,
    defaultY: 55,
    rotation: -2,
  },
  // Group photo - center area
  {
    id: 'group-photo',
    src: '/assets/collection/group-photo.png',
    alt: 'Group Photo',
    width: 300,
    height: 200,
    defaultX: 42,
    defaultY: 42,
    rotation: 2,
  },
  // Murakami - center-right portrait
  {
    id: 'murakami',
    src: '/assets/collection/murakami.png',
    alt: 'Haruki Murakami',
    width: 320,
    height: 420,
    defaultX: 52,
    defaultY: 25,
    rotation: 0,
  },
  // Sony camera - right of center
  {
    id: 'sony-camera',
    src: '/assets/collection/sony-camera.png',
    alt: 'Sony Alpha Camera',
    width: 200,
    height: 200,
    defaultX: 62,
    defaultY: 50,
    rotation: 2,
  },
  // Arc'teryx jacket - far right
  {
    id: 'arcteryx-jacket',
    src: '/assets/collection/arcteryx-jacket.png',
    alt: "Arc'teryx Beta Jacket",
    width: 240,
    height: 320,
    defaultX: 82,
    defaultY: -5,
    rotation: 0,
  },
  // Noodle restaurant - far right bottom
  {
    id: 'noodle-restaurant',
    src: '/assets/collection/noodle-restaurant.png',
    alt: 'Noodle Restaurant',
    width: 240,
    height: 170,
    defaultX: 78,
    defaultY: 55,
    rotation: 0,
  },
]

export const STORAGE_KEY = 'prefooter-collage-positions'

export interface ItemPosition {
  id: string
  x: number
  y: number
  zIndex: number
}

export interface ItemTransform {
  id: string
  x: number           // position % from left
  y: number           // position % from top
  width: number       // current width in px
  height: number      // current height in px
  rotation: number    // rotation in degrees
  zIndex: number
}

export function getDefaultTransforms(): ItemTransform[] {
  return collageItems.map((item, index) => ({
    id: item.id,
    x: item.defaultX,
    y: item.defaultY,
    width: item.width,
    height: item.height,
    rotation: item.rotation,
    zIndex: index + 1,
  }))
}

export function loadTransforms(): ItemTransform[] {
  if (typeof window === 'undefined') return getDefaultTransforms()
  
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as (ItemPosition | ItemTransform)[]
      if (parsed.length === collageItems.length) {
        // Check if it's already the new format (has width, height, rotation)
        if (parsed.every(p => 'width' in p && 'height' in p && 'rotation' in p)) {
          return parsed as ItemTransform[]
        }
        // Otherwise migrate from old ItemPosition format - preserve x, y, zIndex
        const migratedTransforms = parsed.map(pos => {
          const config = collageItems.find(i => i.id === pos.id)
          return {
            id: pos.id,
            x: pos.x,
            y: pos.y,
            width: config?.width ?? 100,
            height: config?.height ?? 100,
            rotation: config?.rotation ?? 0,
            zIndex: pos.zIndex,
          }
        })
        // Save the migrated format back
        saveTransforms(migratedTransforms)
        return migratedTransforms
      }
    }
  } catch (e) {
    console.warn('Failed to load collage transforms:', e)
  }
  
  return getDefaultTransforms()
}

export function saveTransforms(transforms: ItemTransform[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(transforms))
  } catch (e) {
    console.warn('Failed to save collage transforms:', e)
  }
}

export function resetTransforms(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(STORAGE_KEY)
}

export function getItemConfig(id: string): CollageItemConfig | undefined {
  return collageItems.find(item => item.id === id)
}

// Keep old functions for backward compatibility
export function getDefaultPositions(): ItemPosition[] {
  return collageItems.map((item, index) => ({
    id: item.id,
    x: item.defaultX,
    y: item.defaultY,
    zIndex: index + 1,
  }))
}

export function loadPositions(): ItemPosition[] {
  const transforms = loadTransforms()
  return transforms.map(t => ({
    id: t.id,
    x: t.x,
    y: t.y,
    zIndex: t.zIndex,
  }))
}

export function savePositions(positions: ItemPosition[]): void {
  const currentTransforms = loadTransforms()
  const newTransforms = positions.map(pos => {
    const existing = currentTransforms.find(t => t.id === pos.id)
    return {
      ...existing!,
      x: pos.x,
      y: pos.y,
      zIndex: pos.zIndex,
    }
  })
  saveTransforms(newTransforms)
}
