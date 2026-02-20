export interface CollageItemConfig {
  id: string
  src: string
  alt: string
  brand: string
  description: string
  width: number
  height: number
  defaultX: number  // percentage from left (0-100)
  defaultY: number  // percentage from top (0-100)
  rotation: number  // degrees
}

export const collageItems: CollageItemConfig[] = [
  {
    id: 'basketball',
    src: '/assets/collection/basketball.png',
    alt: 'favorite basketball',
    brand: 'Wilson',
    description: 'The official game ball that got me through countless pickup games. Best grip and bounce I\'ve ever played with.',
    width: 145,
    height: 145,
    defaultX: -2,
    defaultY: 35,
    rotation: 0,
  },
  {
    id: 'ping-pong-ball',
    src: '/assets/collection/ping-pong-ball.png',
    alt: 'marty supreme ping pong ball',
    brand: 'Marty Supreme',
    description: 'Premium table tennis balls for those intense matches. The perfect weight and spin response.',
    width: 152,
    height: 150,
    defaultX: 1,
    defaultY: 60,
    rotation: 0,
  },
  {
    id: 'dr-martens',
    src: '/assets/collection/dr-martens.png',
    alt: 'dr. martens',
    brand: 'Dr. Martens',
    description: 'Classic Oxford shoes that pair with everything. Broken in perfectly after years of wear.',
    width: 175,
    height: 104,
    defaultX: 10,
    defaultY: 52,
    rotation: -3,
  },
  {
    id: 'stay-winning',
    src: '/assets/collection/stay-winning.png',
    alt: 'favorite sticky note',
    brand: 'Personal',
    description: 'A daily reminder stuck on my desk. Mindset is everything.',
    width: 253,
    height: 120,
    defaultX: 28,
    defaultY: 18,
    rotation: 2,
  },
  {
    id: 'fujifilm-camera',
    src: '/assets/collection/fujifilm-camera.png',
    alt: 'best disposable camera',
    brand: 'Fujifilm',
    description: 'There\'s something special about disposable cameras. No previews, no deletes—just pure moments.',
    width: 192,
    height: 133,
    defaultX: 8,
    defaultY: 42,
    rotation: 8,
  },
  {
    id: 'photo-collage',
    src: '/assets/svg/art.jpg',
    alt: 'my youtube videos',
    brand: 'Memories',
    description: 'A collection of printed photos from travels and moments with friends. Physical photos hit different.',
    width: 350,
    height: 224,
    defaultX: 18,
    defaultY: 38,
    rotation: -1,
  },
  {
    id: 'kafka-book',
    src: '/assets/collection/kafka-book.png',
    alt: 'kafka on the shore',
    brand: 'Haruki Murakami',
    description: 'My favorite Murakami novel. A surreal journey that stays with you long after the last page.',
    width: 130,
    height: 156,
    defaultX: 38,
    defaultY: 18,
    rotation: 3,
  },
  {
    id: 'polar-jeans',
    src: '/assets/collection/polar-jeans.png',
    alt: 'favorite jeans',
    brand: 'Polar Skate Co.',
    description: 'The baggiest, most comfortable jeans I own. Perfect silhouette for skating and everyday wear.',
    width: 154,
    height: 197,
    defaultX: 52,
    defaultY: 18,
    rotation: 0,
  },
  {
    id: 'noodle-bowl',
    src: '/assets/collection/noodle-bowl.png',
    alt: 'triple b',
    brand: 'Comfort Food',
    description: 'Late night noodles are a ritual. Nothing beats a steaming bowl after a long day.',
    width: 160,
    height: 123,
    defaultX: 68,
    defaultY: 25,
    rotation: 0,
  },
  {
    id: 'mahjong-tiles',
    src: '/assets/collection/mahjong-tiles.png',
    alt: 'mahjong',
    brand: 'Traditional',
    description: 'Family game nights around the mahjong table. The sound of shuffling tiles is nostalgic.',
    width: 160,
    height: 114,
    defaultX: 35,
    defaultY: 55,
    rotation: -2,
  },
  {
    id: 'group-photo',
    src: '/assets/collection/group-photo.png',
    alt: 'syde c/o 2030',
    brand: 'Friends',
    description: 'The crew. Some of my favorite people captured in one frame.',
    width: 240,
    height: 160,
    defaultX: 42,
    defaultY: 42,
    rotation: 2,
  },
  {
    id: 'murakami',
    src: '/assets/collection/murakami.png',
    alt: 'haruki murakami',
    brand: 'Inspiration',
    description: 'The author who changed how I see storytelling. His work blends reality and dreams seamlessly.',
    width: 285,
    height: 187,
    defaultX: 52,
    defaultY: 35,
    rotation: 0,
  },
  {
    id: 'sony-camera',
    src: '/assets/collection/sony-camera.png',
    alt: 'my current camera',
    brand: 'Sony',
    description: 'My main shooter for video and photo work. The dynamic range and autofocus are unmatched.',
    width: 160,
    height: 157,
    defaultX: 62,
    defaultY: 50,
    rotation: 2,
  },
  {
    id: 'arcteryx-jacket',
    src: '/assets/collection/arcteryx-jacket.png',
    alt: "my orange arcteryx",
    brand: "Arc'teryx",
    description: 'The ultimate shell jacket. Waterproof, breathable, and built to last through any weather.',
    width: 172,
    height: 218,
    defaultX: 82,
    defaultY: 18,
    rotation: 0,
  },
  {
    id: 'noodle-restaurant',
    src: '/assets/collection/noodle-restaurant.png',
    alt: 'magic noodle',
    brand: 'Tokyo',
    description: 'A tiny ramen shop discovered while wandering Tokyo streets. Best tonkotsu I\'ve ever had.',
    width: 208,
    height: 138,
    defaultX: 78,
    defaultY: 55,
    rotation: 0,
  },
  {
    id: 'running-shoes',
    src: '/assets/art-gallery/my-running-shoes.png',
    alt: 'my running shoes',
    brand: 'Hoka',
    description: 'My Hoka Clifton 9s. The cushioning is unreal—feels like running on clouds.',
    width: 206,
    height: 101,
    defaultX: 85,
    defaultY: 35,
    rotation: -5,
  },
]

export const STORAGE_KEY = 'prefooter-collage-positions-v9'

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
