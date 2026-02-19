import { collageItems, getItemConfig, type CollageItemConfig, type ItemTransform } from './collageItems'

export const ART_GALLERY_STORAGE_KEY = 'art-gallery-collage-positions'

// Art gallery specific default positions matching the screenshot layout exactly
// Positions are percentages from left (x) and top (y) of the container
export const artGalleryDefaults: Record<string, { x: number; y: number; width: number; height: number; rotation: number; zIndex: number }> = {
  // Row 1 - Top items
  'basketball': { x: -2, y: 2, width: 120, height: 120, rotation: 0, zIndex: 1 },
  'murakami': { x: 5, y: 12, width: 180, height: 240, rotation: 0, zIndex: 2 },
  'photo-collage': { x: 12, y: -8, width: 520, height: 280, rotation: 0, zIndex: 3 },
  'stay-winning': { x: 28, y: 18, width: 200, height: 80, rotation: 2, zIndex: 4 },
  'noodle-bowl': { x: 52, y: 10, width: 120, height: 120, rotation: 0, zIndex: 5 },
  'polar-jeans': { x: 62, y: 2, width: 140, height: 240, rotation: 0, zIndex: 6 },
  'arcteryx-jacket': { x: 82, y: -2, width: 160, height: 220, rotation: 0, zIndex: 15 },
  
  // Row 2 - Middle items
  'group-photo': { x: 8, y: 35, width: 240, height: 180, rotation: 0, zIndex: 7 },
  'dr-martens': { x: 35, y: 38, width: 180, height: 100, rotation: 0, zIndex: 8 },
  'fujifilm-camera': { x: 55, y: 38, width: 140, height: 100, rotation: 0, zIndex: 9 },
  'sony-camera': { x: 72, y: 42, width: 160, height: 140, rotation: 0, zIndex: 10 },
  
  // Row 3 - Bottom items
  'ping-pong-ball': { x: 8, y: 60, width: 130, height: 130, rotation: 0, zIndex: 11 },
  'mahjong-tiles': { x: 22, y: 58, width: 120, height: 80, rotation: 0, zIndex: 12 },
  'kafka-book': { x: 48, y: 50, width: 150, height: 220, rotation: 0, zIndex: 13 },
  'noodle-restaurant': { x: 78, y: 58, width: 180, height: 130, rotation: 0, zIndex: 14 },
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
