import pool from '../lib/db'

/**
 * Script to find and fix broken book covers
 * Checks each Open Library cover URL and replaces broken ones with Google Books covers
 */

async function checkImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (!response.ok) return false
    
    // Open Library returns a 1x1 pixel image for missing covers
    // Check content-length - real covers are usually > 1000 bytes
    const contentLength = response.headers.get('content-length')
    if (contentLength && parseInt(contentLength) < 1000) {
      return false
    }
    
    return true
  } catch {
    return false
  }
}

async function searchGoogleBooks(title: string, author: string): Promise<string | null> {
  try {
    const searchQuery = `intitle:${title} inauthor:${author}`.trim()
    const apiKey = process.env.GOOGLE_BOOKS_API_KEY
    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=1${apiKey ? `&key=${apiKey}` : ''}`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null

    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      const volumeInfo = data.items[0].volumeInfo
      
      if (volumeInfo.imageLinks) {
        const coverUrl = volumeInfo.imageLinks.extraLarge ||
                        volumeInfo.imageLinks.large ||
                        volumeInfo.imageLinks.medium ||
                        volumeInfo.imageLinks.small ||
                        volumeInfo.imageLinks.thumbnail
        
        if (coverUrl) {
          return coverUrl.replace('http:', 'https:').replace('&edge=curl', '')
        }
      }
    }
    
    return null
  } catch (error) {
    console.error('Google Books search error:', error)
    return null
  }
}

async function fixBrokenCovers() {
  try {
    console.log('🔍 Checking all book covers for broken images...\n')

    // Get all books with Open Library covers
    const { rows: books } = await pool.query(`
      SELECT id, title, author, isbn, isbn13, cover_url
      FROM books
      WHERE cover_url IS NOT NULL AND cover_url != ''
      ORDER BY id
    `)

    console.log(`Found ${books.length} books to check\n`)

    let checked = 0
    let broken = 0
    let fixed = 0
    let unfixable = 0

    for (const book of books) {
      checked++
      process.stdout.write(`\r[${checked}/${books.length}] Checking: ${book.title.substring(0, 40).padEnd(40)}`)

      // Check if current cover is valid
      const isValid = await checkImageUrl(book.cover_url)
      
      if (!isValid) {
        broken++
        console.log(`\n   ❌ Broken cover for: "${book.title}"`)
        console.log(`      Current URL: ${book.cover_url}`)
        
        // Try to find a replacement from Google Books
        const newCoverUrl = await searchGoogleBooks(book.title, book.author)
        
        if (newCoverUrl) {
          // Verify the new URL works
          const newIsValid = await checkImageUrl(newCoverUrl)
          
          if (newIsValid) {
            await pool.query(
              'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
              [newCoverUrl, book.id]
            )
            fixed++
            console.log(`      ✅ Replaced with: ${newCoverUrl}`)
          } else {
            unfixable++
            console.log(`      ⚠️  Google Books cover also broken`)
          }
        } else {
          unfixable++
          console.log(`      ⚠️  No replacement found on Google Books`)
        }
        
        // Rate limit
        await new Promise(resolve => setTimeout(resolve, 300))
      }
    }

    console.log('\n\n📊 Summary:')
    console.log(`   📚 Total checked: ${checked} books`)
    console.log(`   ❌ Broken covers found: ${broken}`)
    console.log(`   ✅ Successfully fixed: ${fixed}`)
    console.log(`   ⚠️  Could not fix: ${unfixable}`)

    process.exit(0)
  } catch (error: any) {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Run the script
fixBrokenCovers()
