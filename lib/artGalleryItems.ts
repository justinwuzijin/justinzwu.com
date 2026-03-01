import { collageItems, getItemConfig, type CollageItemConfig, type ItemTransform } from './collageItems'

export const ART_GALLERY_STORAGE_KEY = 'art-gallery-collage-positions-v11'

// Art gallery specific default positions - matching screenshot orientation with proper sizes
// Positions are percentages from left (x) and top (y) of the container
// All sizes use correct aspect ratios based on actual image dimensions
export const artGalleryDefaults: Record<string, { x: number; y: number; width: number; height: number; rotation: number; zIndex: number }> = {
  // Row 1 - Top row
  'murakami': { x: 0, y: 0, width: 200, height: 131, rotation: 0, zIndex: 1 },
  'stay-winning': { x: 14, y: 2, width: 220, height: 105, rotation: 0, zIndex: 2 },
  'basketball': { x: 32, y: 0, width: 140, height: 140, rotation: 0, zIndex: 3 },
  'noodle-bowl': { x: 52, y: 0, width: 150, height: 115, rotation: 0, zIndex: 4 },
  'fujifilm-camera': { x: 72, y: 2, width: 170, height: 118, rotation: 0, zIndex: 5 },
  
  // Row 2 - Upper middle
  'mahjong-tiles': { x: 2, y: 22, width: 150, height: 107, rotation: 0, zIndex: 6 },
  'group-photo': { x: 18, y: 18, width: 270, height: 180, rotation: 0, zIndex: 7 },
  'polar-jeans': { x: 46, y: 12, width: 130, height: 166, rotation: 0, zIndex: 8 },
  'arcteryx-jacket': { x: 62, y: 6, width: 170, height: 215, rotation: 0, zIndex: 9 },
  
  // Row 3 - Lower section
  'ping-pong-ball': { x: 0, y: 52, width: 130, height: 129, rotation: 0, zIndex: 10 },
  'dr-martens': { x: 14, y: 50, width: 180, height: 107, rotation: 0, zIndex: 11 },
  'kafka-book': { x: 32, y: 45, width: 140, height: 168, rotation: 0, zIndex: 12 },
  'sony-camera': { x: 50, y: 48, width: 150, height: 147, rotation: 0, zIndex: 13 },
  'noodle-restaurant': { x: 66, y: 50, width: 200, height: 132, rotation: 0, zIndex: 14 },
  'photo-collage': { x: 82, y: 45, width: 300, height: 191, rotation: 0, zIndex: 15 },
  'running-shoes': { x: 82, y: 28, width: 200, height: 98, rotation: -5, zIndex: 16 },
  
  // New items - all with correct aspect ratios
  'waterloo-bottle': { x: 88, y: 0, width: 130, height: 130, rotation: 0, zIndex: 17 },
  'oakley-carabiner': { x: 44, y: 6, width: 100, height: 100, rotation: 15, zIndex: 18 },
  'thisisneverthat-tee': { x: 0, y: 38, width: 130, height: 173, rotation: 2, zIndex: 19 },
  'onitsuka-tiger': { x: 28, y: 68, width: 190, height: 143, rotation: -3, zIndex: 20 },
  'tyler-creator': { x: 78, y: 18, width: 140, height: 140, rotation: 0, zIndex: 21 },
  'thisisneverthat-beanie': { x: 52, y: 70, width: 115, height: 144, rotation: 5, zIndex: 22 },
  'yunshang-noodle': { x: 56, y: 32, width: 160, height: 160, rotation: 0, zIndex: 23 },
  'taekwondo-headgear': { x: 8, y: 58, width: 130, height: 149, rotation: 5, zIndex: 24 },
  'roasted-seaweed': { x: 38, y: 76, width: 150, height: 150, rotation: -2, zIndex: 25 },
  'marshall-headphones': { x: 72, y: 62, width: 140, height: 140, rotation: 0, zIndex: 26 },
  'salomon-xt6': { x: 20, y: 72, width: 200, height: 113, rotation: 3, zIndex: 27 },
}

export function getArtGalleryDefaultTransforms(): ItemTransform[] {
  return collageItems.map((item) => {
    const defaults = artGalleryDefaults[item.id]
    if (defaults) {
      return {
        id: item.id,
        x: defaults.x,
        y: defaults.y,
        width: defaults.width,
        height: defaults.height,
        rotation: defaults.rotation,
        zIndex: defaults.zIndex,
      }
    }
    return {
      id: item.id,
      x: item.defaultX,
      y: item.defaultY,
      width: item.width,
      height: item.height,
      rotation: item.rotation,
      zIndex: 1,
    }
  })
}

export function loadArtGalleryTransforms(): ItemTransform[] {
  if (typeof window === 'undefined') return getArtGalleryDefaultTransforms()
  
  try {
    const saved = localStorage.getItem(ART_GALLERY_STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved) as ItemTransform[]
      if (parsed.length === collageItems.length) {
        return parsed
      }
    }
  } catch (e) {
    console.warn('Failed to load art gallery transforms:', e)
  }
  
  return getArtGalleryDefaultTransforms()
}

export function saveArtGalleryTransforms(transforms: ItemTransform[]): void {
  if (typeof window === 'undefined') return
  
  try {
    localStorage.setItem(ART_GALLERY_STORAGE_KEY, JSON.stringify(transforms))
  } catch (e) {
    console.warn('Failed to save art gallery transforms:', e)
  }
}

export function resetArtGalleryTransforms(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem(ART_GALLERY_STORAGE_KEY)
}

export { collageItems, getItemConfig, type CollageItemConfig, type ItemTransform }
