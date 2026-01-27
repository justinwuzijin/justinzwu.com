import pool from '../lib/db'

/**
 * Pre-populate cover URLs for ALL books in the database
 * This validates each cover URL actually exists before saving
 * Run with: bun run scripts/prepopulate-all-covers.ts
 */

// Check if an image URL actually returns a valid image (not a 1x1 placeholder)
async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return false
    
    // Check content-length - Open Library returns tiny images for missing covers
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) < 1000) {
      return false // Too small, likely a placeholder
    }
    
    return true
  } catch {
    return false
  }
}

// Try multiple cover sources and return the first valid one
async function findValidCover(book: {
  isbn: string | null
  isbn13: string | null
  title: string
  author: string
}): Promise<string | null> {
  const { isbn, isbn13, title, author } = book
  
  // Sources to try in order (using -M for faster loading)
  const sources: string[] = []
  
  // 1. Open Library with ISBN13
  if (isbn13) {
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn13}-M.jpg`)
  }
  
  // 2. Open Library with ISBN10
  if (isbn && isbn !== isbn13) {
    sources.push(`https://covers.openlibrary.org/b/isbn/${isbn}-M.jpg`)
  }
  
  // 3. Try Google Books API (search by ISBN or title)
  if (isbn13 || isbn) {
    const isbnToUse = isbn13 || isbn
    sources.push(`https://books.google.com/books/content?vid=ISBN${isbnToUse}&printsec=frontcover&img=1&zoom=1`)
  }
  
  // 4. Try Google Books search by title/author
  const query = encodeURIComponent(`${title} ${author}`)
  sources.push(`https://books.google.com/books/content?vid=ISBN&printsec=frontcover&img=1&zoom=1&q=${query}`)
  
  // Try each source
  for (const url of sources) {
    const isValid = await validateImageUrl(url)
    if (isValid) {
      return url
    }
  }
  
  return null
}

async function prepopulateAllCovers() {
  try {
    console.log('📚 Pre-populating cover URLs for all books...\n')

    // Get ALL books, even those with covers (to validate them)
    const { rows: allBooks } = await pool.query(`
      SELECT id, title, author, isbn, isbn13, cover_url
      FROM books
      ORDER BY title
    `)

    console.log(`Found ${allBooks.length} total books\n`)

    let alreadyValid = 0
    let updated = 0
    let notFound = 0
    let errors = 0

    for (let i = 0; i < allBooks.length; i++) {
      const book = allBooks[i]
      const progress = `[${i + 1}/${allBooks.length}]`
      
      try {
        // Check if current cover is valid
        const currentCoverValid = book.cover_url && 
          !book.cover_url.includes('placeholder') &&
          !book.cover_url.includes('data:image') &&
          await validateImageUrl(book.cover_url)

        if (currentCoverValid) {
          alreadyValid++
          console.log(`${progress} ✅ Already valid: "${book.title}"`)
          continue
        }

        // Search for a valid cover
        console.log(`${progress} 🔍 Searching: "${book.title}" by ${book.author}`)
        
        const newCoverUrl = await findValidCover({
          isbn: book.isbn,
          isbn13: book.isbn13,
          title: book.title,
          author: book.author,
        })

        if (newCoverUrl) {
          // Update the database
          await pool.query(
            'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [newCoverUrl, book.id]
          )
          updated++
          console.log(`   ✅ Found: ${newCoverUrl}`)
        } else {
          notFound++
          console.log(`   ⚠️  No cover found`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200))
        
      } catch (error: any) {
        errors++
        console.error(`${progress} ❌ Error for "${book.title}": ${error.message}`)
      }
    }

    console.log('\n' + '='.repeat(50))
    console.log('📊 SUMMARY')
    console.log('='.repeat(50))
    console.log(`✅ Already valid: ${alreadyValid} books`)
    console.log(`🔄 Updated: ${updated} books`)
    console.log(`⚠️  Not found: ${notFound} books`)
    console.log(`❌ Errors: ${errors} books`)
    console.log(`📚 Total: ${allBooks.length} books`)
    console.log('='.repeat(50))

  } catch (error: any) {
    console.error('❌ Script failed:', error)
  } finally {
    await pool.end()
    process.exit(0)
  }
}

prepopulateAllCovers()
