import pool from '../lib/db'

/**
 * Standalone script to find and update ALL books with missing covers
 * Searches directly using Open Library and Google Books APIs
 * No need for dev server to be running
 */

interface SearchResult {
  coverUrl: string | null
  source: string
}

async function searchOpenLibrary(title: string, author: string): Promise<SearchResult | null> {
  try {
    const searchQuery = `${title} ${author}`.trim()
    const searchUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(searchQuery)}&limit=3`
    
    const response = await fetch(searchUrl, {
      headers: { 'Accept': 'application/json' },
    })

    if (!response.ok) return null

    const data = await response.json()
    
    if (data.docs && data.docs.length > 0) {
      // Try each result until we find one with a cover
      for (const book of data.docs) {
        // Try ISBN first
        if (book.isbn && book.isbn.length > 0) {
          const isbn = book.isbn[book.isbn.length - 1]
          const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbn}-L.jpg`
          // Test if cover exists by checking response
          const coverTest = await fetch(coverUrl, { method: 'HEAD' })
          if (coverTest.ok) {
            return { coverUrl, source: 'openlibrary-search-isbn' }
          }
        }
        
        // Try cover_i
        if (book.cover_i) {
          const coverUrl = `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
          const coverTest = await fetch(coverUrl, { method: 'HEAD' })
          if (coverTest.ok) {
            return { coverUrl, source: 'openlibrary-search-id' }
          }
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

async function searchGoogleBooks(title: string, author: string): Promise<SearchResult | null> {
  try {
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    if (!apiKey) return null

    const searchQuery = `intitle:${title} inauthor:${author}`.trim()
    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=3&key=${apiKey}`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null

    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const volumeInfo = item.volumeInfo
        if (volumeInfo.imageLinks) {
          const coverUrl = volumeInfo.imageLinks.thumbnail?.replace('zoom=1', 'zoom=3') || 
                          volumeInfo.imageLinks.medium ||
                          volumeInfo.imageLinks.small ||
                          volumeInfo.imageLinks.thumbnail
          
          if (coverUrl) {
            return { coverUrl, source: 'google-books' }
          }
        }
      }
    }
    
    return null
  } catch (error) {
    return null
  }
}

async function tryDirectISBN(isbn13: string | null, isbn: string | null): Promise<SearchResult | null> {
  const isbnToUse = isbn13 || isbn
  if (!isbnToUse) return null

  try {
    const coverUrl = `https://covers.openlibrary.org/b/isbn/${isbnToUse}-L.jpg`
    const response = await fetch(coverUrl, { method: 'HEAD' })
    if (response.ok) {
      return { coverUrl, source: 'openlibrary-isbn-direct' }
    }
  } catch {
    // Ignore errors
  }
  return null
}

async function findAndUpdateAllMissingCovers() {
  try {
    console.log('🔍 Finding ALL books with missing covers...\n')

    const { rows: booksToUpdate } = await pool.query(`
      SELECT id, title, author, isbn, isbn13, cover_url
      FROM books
      WHERE cover_url IS NULL 
         OR cover_url = ''
         OR cover_url LIKE '%placeholder%'
         OR cover_url LIKE '%via.placeholder%'
         OR cover_url LIKE '%data:image/svg%'
      ORDER BY id
    `)

    console.log(`Found ${booksToUpdate.length} books without covers\n`)

    if (booksToUpdate.length === 0) {
      console.log('✅ All books have covers!')
      process.exit(0)
    }

    let updated = 0
    let failed = 0
    let notFound = 0

    for (let i = 0; i < booksToUpdate.length; i++) {
      const book = booksToUpdate[i]
      try {
        console.log(`[${i + 1}/${booksToUpdate.length}] Searching: "${book.title}" by ${book.author}`)

        let result: SearchResult | null = null

        // Try multiple sources in order
        // 1. Direct ISBN lookup (fastest)
        result = await tryDirectISBN(book.isbn13, book.isbn)
        
        // 2. Google Books (best quality)
        if (!result) {
          result = await searchGoogleBooks(book.title, book.author || '')
        }
        
        // 3. Open Library search
        if (!result) {
          result = await searchOpenLibrary(book.title, book.author || '')
        }

        if (result && result.coverUrl) {
          await pool.query(
            'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [result.coverUrl, book.id]
          )

          updated++
          console.log(`   ✅ Found: ${result.source}\n`)
        } else {
          notFound++
          console.log(`   ⚠️  No cover found\n`)
        }

        // Rate limiting delay
        await new Promise(resolve => setTimeout(resolve, 300))
      } catch (error: any) {
        failed++
        console.error(`   ❌ Error: ${error.message}\n`)
      }
    }

    console.log('\n📊 Final Summary:')
    console.log(`   ✅ Updated: ${updated} books`)
    console.log(`   ⚠️  Not found: ${notFound} books`)
    console.log(`   ❌ Failed: ${failed} books`)
    console.log(`   📚 Total: ${booksToUpdate.length} books\n`)

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

findAndUpdateAllMissingCovers()
