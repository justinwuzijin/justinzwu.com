/**
 * Book Cover URL Generator
 * 
 * Generates book cover URLs using multiple sources with fallbacks:
 * 1. Open Library (by ISBN) - Free, no auth required
 * 2. Google Books API (by ISBN) - Free, requires API key (optional)
 * 3. GoodReads (by GoodReads ID) - Free, no auth
 * 4. Placeholder fallback
 */

interface CoverOptions {
  isbn?: string | null
  isbn13?: string | null
  goodreadsId?: string | null
  title?: string
  author?: string
}

/**
 * Generate book cover URL with fallbacks
 * Returns the best available cover URL
 */
export function getBookCoverUrl(options: CoverOptions): string {
  const { isbn, isbn13, goodreadsId, title, author } = options

  // Try Open Library with ISBN13 first (most reliable) - use -M for faster loading
  if (isbn13) {
    const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`
    // Return URL - we'll validate on the frontend
    return openLibraryUrl
  }

  // Try Open Library with ISBN10
  if (isbn) {
    const openLibraryUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`
    return openLibraryUrl
  }

  // Try GoodReads cover (if we have GoodReads ID)
  if (goodreadsId) {
    // GoodReads cover URL format
    return `https://images-na.ssl-images-amazon.com/images/P/${goodreadsId}.01.L.jpg`
  }

  // Fallback: Use Google Books API search (requires title/author)
  if (title && author) {
    // This would require an API call, so we'll use a placeholder for now
    // In production, you could create an API endpoint that fetches from Google Books
    return getPlaceholderCover(title, author)
  }

  // Ultimate fallback: generic placeholder
  return getPlaceholderCover(title || 'Unknown', author || 'Unknown')
}

/**
 * Generate a placeholder cover using a service like placeholder.com
 * or a custom placeholder API
 */
function getPlaceholderCover(title: string, author: string): string {
  // Option 1: Use a placeholder service
  // return `https://via.placeholder.com/300x450/cccccc/666666?text=${encodeURIComponent(title)}`
  
  // Option 2: Use a book-specific placeholder service
  // return `https://covers.openlibrary.org/b/id/${hash(title + author)}-L.jpg`
  
  // Option 3: Use a data URI with a simple design
  // For now, return a simple placeholder URL
  // You can replace this with a better placeholder service
  return `https://via.placeholder.com/300x450/8b7355/ffffff?text=${encodeURIComponent(title.substring(0, 20))}`
}

/**
 * Clean ISBN - removes formatting characters
 */
export function cleanISBN(isbn: string | null | undefined): string | null {
  if (!isbn) return null
  // Remove quotes, equals signs, and whitespace
  const cleaned = isbn.replace(/^="?/, '').replace(/"?$/, '').trim()
  return cleaned || null
}

/**
 * Validate if a cover URL is likely to exist
 * (This is a simple check - actual validation requires HTTP request)
 */
export function isValidCoverUrl(url: string): boolean {
  if (!url || url.includes('placeholder')) return false
  // Check if it's a valid URL format
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

/**
 * Get multiple cover URL options for fallback
 * Returns array of URLs in order of preference
 */
export function getCoverUrlFallbacks(options: CoverOptions): string[] {
  const urls: string[] = []
  const { isbn, isbn13, goodreadsId, title, author } = options

  // 1. Open Library ISBN13 (use -M for faster loading)
  if (isbn13) {
    urls.push(`https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`)
  }

  // 2. Open Library ISBN10
  if (isbn) {
    urls.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`)
  }

  // 3. GoodReads
  if (goodreadsId) {
    urls.push(`https://images-na.ssl-images-amazon.com/images/P/${goodreadsId}.01.L.jpg`)
  }

  // 4. Placeholder
  urls.push(getPlaceholderCover(title || 'Unknown', author || 'Unknown'))

  return urls
}
