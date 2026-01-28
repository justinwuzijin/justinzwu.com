import pool from '../lib/db'

/**
 * Script to search the web for book covers and update the database
 * Uses the book-cover-search API to find covers for books with missing/invalid covers
 */

async function searchAndUpdateCovers() {
  try {
    console.log('🔍 Finding books with missing or invalid covers...\n')

    // Find books that might need cover updates
    // We'll check books with placeholder covers, no covers, or broken pollinations.ai URLs
    const { rows: booksToUpdate } = await pool.query(`
      SELECT id, title, author, isbn, isbn13, cover_url
      FROM books
      WHERE cover_url IS NULL 
         OR cover_url = ''
         OR cover_url LIKE '%placeholder%'
         OR cover_url LIKE '%via.placeholder%'
         OR cover_url LIKE '%data:image/svg%'
         OR cover_url LIKE '%pollinations.ai%'
      ORDER BY id
      LIMIT 200
    `)

    console.log(`Found ${booksToUpdate.length} books to search for covers\n`)

    if (booksToUpdate.length === 0) {
      console.log('✅ No books need cover updates!')
      process.exit(0)
    }

    let updated = 0
    let failed = 0
    let notFound = 0

    for (const book of booksToUpdate) {
      try {
        console.log(`🔍 Searching for: "${book.title}" by ${book.author}`)

        // Build search API URL
        const params = new URLSearchParams({
          title: book.title,
          author: book.author || '',
        })
        
        if (book.isbn13) params.append('isbn13', book.isbn13)
        if (book.isbn) params.append('isbn', book.isbn)

        // Call the search API (requires dev server to be running)
        // Or you can import and call the search functions directly
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const searchUrl = `${baseUrl}/api/book-cover-search?${params.toString()}`
        
        // Note: This requires the Next.js dev server to be running
        // Make sure to run: bun run dev (in another terminal) before running this script
        const response = await fetch(searchUrl, {
          headers: {
            'Accept': 'application/json',
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            notFound++
            console.log(`   ⚠️  No cover found\n`)
          } else {
            failed++
            console.log(`   ❌ Search failed: ${response.status}\n`)
          }
          continue
        }

        const data = await response.json()

        if (data.coverUrl) {
          // Update the book with the new cover URL
          await pool.query(
            'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
            [data.coverUrl, book.id]
          )

          updated++
          console.log(`   ✅ Found cover from ${data.source}: ${data.coverUrl}\n`)
        } else {
          notFound++
          console.log(`   ⚠️  No cover found\n`)
        }

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500))
      } catch (error: any) {
        failed++
        console.error(`   ❌ Error: ${error.message}\n`)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   ✅ Updated: ${updated} books`)
    console.log(`   ⚠️  Not found: ${notFound} books`)
    console.log(`   ❌ Failed: ${failed} books`)
    console.log(`   📚 Total processed: ${booksToUpdate.length} books\n`)

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

// Check if running as script
if (require.main === module) {
  searchAndUpdateCovers()
}

export { searchAndUpdateCovers }
