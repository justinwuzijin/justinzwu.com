import pool from '../lib/db'

/**
 * Script to update specific book covers with verified cover images
 * Searches for legitimate book cover images (not photos of physical books)
 */

interface BookSearch {
  title: string
  author?: string
  isbn13?: string
  isbn?: string
}

const booksToUpdate: BookSearch[] = [
  { title: 'Empires of AI', author: 'Robert Work' },
  { title: 'Empire of AI', author: 'Karen Hao' }, // Alternative title
  { title: 'The City and its Uncertain Walls', author: 'Haruki Murakami' },
  { title: 'The City and Its Uncertain Walls', author: 'Haruki Murakami' }, // Alternative capitalization
  { title: 'Strange Weather in Tokyo', author: 'Hiromi Kawakami' },
  { title: 'The Charisma Myth', author: 'Olivia Fox Cabane' },
  { title: 'Charisma Myth', author: 'Olivia Fox Cabane' },
  { title: 'Shadow and Bone', author: 'Leigh Bardugo' },
]

async function searchGoogleBooks(title: string, author?: string): Promise<string | null> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    if (!apiKey) {
      console.log('⚠️  No Google Books API key found, skipping Google Books search')
      return null
    }

    let query = `intitle:${title}`
    if (author) {
      query += ` inauthor:${author}`
    }

    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=10&key=${apiKey}`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null

    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      // Try to find the best match
      for (const item of data.items) {
        const volumeInfo = item.volumeInfo
        const itemTitle = (volumeInfo.title || '').toLowerCase().trim()
        const itemAuthor = (volumeInfo.authors?.[0] || '').toLowerCase().trim()
        const searchTitle = title.toLowerCase().trim()
        const searchAuthor = author?.toLowerCase().trim() || ''
        
        // Check if title matches reasonably well
        const titleMatches = itemTitle.includes(searchTitle) || 
                            searchTitle.includes(itemTitle) ||
                            itemTitle.replace(/[^a-z0-9]/g, '') === searchTitle.replace(/[^a-z0-9]/g, '')
        
        // If author provided, check author match too
        const authorMatches = !searchAuthor || 
                             !itemAuthor ||
                             itemAuthor.includes(searchAuthor) || 
                             searchAuthor.includes(itemAuthor)
        
        if (titleMatches && authorMatches) {
          if (volumeInfo.imageLinks) {
            // Prefer extraLarge, then large, then medium, then small, then thumbnail
            let coverUrl = volumeInfo.imageLinks.extraLarge ||
                          volumeInfo.imageLinks.large ||
                          volumeInfo.imageLinks.medium ||
                          volumeInfo.imageLinks.small ||
                          volumeInfo.imageLinks.thumbnail
            
            if (coverUrl) {
              // Remove any edge effects and ensure we get a clean cover
              // Also remove zoom parameters that might show book edges
              const cleanUrl = coverUrl
                .replace('&edge=curl', '')
                .replace(/&zoom=\d+/, '&zoom=0')
                .replace('&fife=w400-h600', '')
              
              // Verify it's a legitimate cover (not a placeholder)
              if (!cleanUrl.includes('books.google.com/books/content') || 
                  cleanUrl.includes('thumbnail') ||
                  cleanUrl.includes('smallThumbnail')) {
                return cleanUrl
              }
            }
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Google Books search error:', error)
    return null
  }
}

async function searchOpenLibrary(title: string, author?: string): Promise<string | null> {
  try {
    let searchQuery = title
    if (author) {
      searchQuery += ` ${author}`
    }

    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=5`
    
    const response = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) return null

    const data = await response.json()
    
    if (data.docs && data.docs.length > 0) {
      for (const book of data.docs) {
        const bookTitle = book.title?.toLowerCase() || ''
        
        // Check if title matches
        if (bookTitle.includes(title.toLowerCase()) || title.toLowerCase().includes(bookTitle)) {
          // Try ISBN first
          if (book.isbn && book.isbn.length > 0) {
            const isbn = book.isbn[book.isbn.length - 1] // Usually ISBN13 is last
            const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
            
            // Verify the cover exists
            const coverTest = await fetch(coverUrl, { method: 'HEAD' })
            if (coverTest.ok && coverTest.headers.get('content-type')?.startsWith('image')) {
              return coverUrl
            }
          }
          
          // Try cover_i
          if (book.cover_i) {
            const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
            const coverTest = await fetch(coverUrl, { method: 'HEAD' })
            if (coverTest.ok && coverTest.headers.get('content-type')?.startsWith('image')) {
              return coverUrl
            }
          }
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Open Library search error:', error)
    return null
  }
}

async function updateSpecificBooks() {
  try {
    console.log('🔍 Searching for specific book covers...\n')
    console.log('Connecting to database...\n')

    for (const bookSearch of booksToUpdate) {
      console.log(`📚 Searching for: "${bookSearch.title}"${bookSearch.author ? ` by ${bookSearch.author}` : ''}`)

      // First, find the book in the database
      let query = 'SELECT id, title, author, cover_url FROM books WHERE LOWER(title) LIKE $1'
      const params: any[] = [`%${bookSearch.title.toLowerCase()}%`]
      
      if (bookSearch.author) {
        query += ' AND LOWER(author) LIKE $2'
        params.push(`%${bookSearch.author.toLowerCase()}%`)
      }

      const { rows } = await pool.query(query, params)

      if (rows.length === 0) {
        console.log(`   ⚠️  Book not found in database\n`)
        continue
      }

      const book = rows[0]
      console.log(`   Found: "${book.title}" by ${book.author}`)

      // Search for cover
      let coverUrl: string | null = null

      // Try Google Books first (better quality)
      coverUrl = await searchGoogleBooks(bookSearch.title, bookSearch.author)
      
      // Try Open Library if Google Books didn't work
      if (!coverUrl) {
        coverUrl = await searchOpenLibrary(bookSearch.title, bookSearch.author)
      }

      if (coverUrl) {
        // Update the database
        await pool.query(
          'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [coverUrl, book.id]
        )

        console.log(`   ✅ Updated cover: ${coverUrl}\n`)
      } else {
        console.log(`   ❌ No cover found\n`)
      }

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    console.log('✅ Finished updating specific book covers\n')
    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Script failed:', error)
    console.error('Error stack:', error.stack)
    await pool.end()
    process.exit(1)
  }
}

updateSpecificBooks()
