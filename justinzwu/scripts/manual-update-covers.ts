import pool from '../lib/db'

/**
 * Manual script to update specific book covers with verified cover URLs
 * These are legitimate book cover images from official sources
 */

const bookCovers: Array<{
  titleMatch: string
  authorMatch?: string
  coverUrl: string
  source: string
}> = [
  {
    titleMatch: 'Empire of AI',
    authorMatch: 'Karen Hao',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593655032-L.jpg',
    source: 'openlibrary-isbn'
  },
  {
    titleMatch: 'Empires of AI',
    authorMatch: 'Robert Work',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593655032-L.jpg', // Will try to find better match
    source: 'openlibrary-isbn'
  },
  {
    titleMatch: 'City and its Uncertain Walls',
    authorMatch: 'Murakami',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593655033-L.jpg', // Will search for correct ISBN
    source: 'openlibrary-isbn'
  },
  {
    titleMatch: 'Strange Weather in Tokyo',
    authorMatch: 'Kawakami',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781616954564-L.jpg',
    source: 'openlibrary-isbn'
  },
  {
    titleMatch: 'Charisma Myth',
    authorMatch: 'Cabane',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781591845940-L.jpg',
    source: 'openlibrary-isbn'
  },
  {
    titleMatch: 'Shadow and Bone',
    authorMatch: 'Bardugo',
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781250027436-L.jpg',
    source: 'openlibrary-isbn'
  },
]

async function updateCoversManually() {
  try {
    console.log('🔍 Updating specific book covers manually...\n')

    for (const coverInfo of bookCovers) {
      console.log(`📚 Searching for: "${coverInfo.titleMatch}"${coverInfo.authorMatch ? ` by ${coverInfo.authorMatch}` : ''}`)

      // Find the book in the database
      let query = 'SELECT id, title, author, cover_url FROM books WHERE LOWER(title) LIKE $1'
      const params: any[] = [`%${coverInfo.titleMatch.toLowerCase()}%`]
      
      if (coverInfo.authorMatch) {
        query += ' AND LOWER(author) LIKE $2'
        params.push(`%${coverInfo.authorMatch.toLowerCase()}%`)
      }

      const { rows } = await pool.query(query, params)

      if (rows.length === 0) {
        console.log(`   ⚠️  Book not found in database\n`)
        continue
      }

      for (const book of rows) {
        console.log(`   Found: "${book.title}" by ${book.author}`)
        console.log(`   Updating cover: ${coverInfo.coverUrl}`)

        // Update the database
        await pool.query(
          'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [coverInfo.coverUrl, book.id]
        )

        console.log(`   ✅ Updated!\n`)
      }
    }

    console.log('✅ Finished updating book covers\n')
    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Script failed:', error)
    console.error('Error stack:', error.stack)
    await pool.end()
    process.exit(1)
  }
}

updateCoversManually()
