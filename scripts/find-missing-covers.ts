import pool from '../lib/db'

/**
 * Script to find books with missing covers and search for them
 * This will update the database with found covers
 */

async function findAndUpdateMissingCovers() {
  try {
    console.log('🔍 Finding books with missing or invalid covers...\n')

    // Find books that need covers
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

    for (const book of booksToUpdate) {
      try {
        console.log(`🔍 Searching for: "${book.title}" by ${book.author}`)

        // Build search API URL - use the internal search function logic
        const params = new URLSearchParams({
          title: book.title,
          author: book.author || '',
        })
        
        if (book.isbn13) params.append('isbn13', book.isbn13)
        if (book.isbn) params.append('isbn', book.isbn)

        // Call the search API (requires dev server to be running)
        const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
        const searchUrl = `${baseUrl}/api/book-cover-search?${params.toString()}`
        
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

findAndUpdateMissingCovers()
