import pool from '../lib/db'
import { getCoverUrlFallbacks } from '../lib/bookCovers'

/**
 * Script to update missing or broken book covers
 * Tries multiple cover sources for books that don't have covers
 */

async function updateMissingCovers() {
  try {
    console.log('🔍 Finding books with missing or placeholder covers...\n')

    // Find books with missing covers or placeholder covers
    const { rows: booksToUpdate } = await pool.query(`
      SELECT id, title, author, isbn, isbn13, cover_url
      FROM books
      WHERE cover_url IS NULL 
         OR cover_url = ''
         OR cover_url LIKE '%placeholder%'
         OR cover_url LIKE '%via.placeholder%'
      ORDER BY id
    `)

    console.log(`Found ${booksToUpdate.length} books to update\n`)

    if (booksToUpdate.length === 0) {
      console.log('✅ All books already have covers!')
      process.exit(0)
    }

    let updated = 0
    let failed = 0

    for (const book of booksToUpdate) {
      try {
        // Get fallback cover URLs
        const fallbacks = getCoverUrlFallbacks({
          isbn: book.isbn,
          isbn13: book.isbn13,
          title: book.title,
          author: book.author,
        })

        // Use the first fallback (best option)
        const newCoverUrl = fallbacks[0]

        // Update the book
        await pool.query(
          'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [newCoverUrl, book.id]
        )

        updated++
        console.log(`✅ Updated: "${book.title}" by ${book.author}`)
        console.log(`   New cover: ${newCoverUrl}\n`)

        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100))
      } catch (error: any) {
        failed++
        console.error(`❌ Failed to update "${book.title}":`, error.message)
      }
    }

    console.log('\n📊 Summary:')
    console.log(`   Updated: ${updated} books`)
    console.log(`   Failed: ${failed} books`)
    console.log(`   Total: ${booksToUpdate.length} books\n`)

    process.exit(0)
  } catch (error: any) {
    console.error('❌ Script failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

updateMissingCovers()
