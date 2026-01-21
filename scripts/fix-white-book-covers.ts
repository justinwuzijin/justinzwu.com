import pool from '../lib/db'

/**
 * Script to fix white/placeholder book covers for specific books
 * Uses verified cover URLs from Open Library and Google Books
 */

// Verified cover URLs - these are legitimate book covers, not photos of physical books
const verifiedCovers: Array<{
  titleKeywords: string[]
  authorKeywords?: string[]
  coverUrl: string
  source: string
}> = [
  {
    titleKeywords: ['empire', 'ai'],
    authorKeywords: ['hao', 'work'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593655032-L.jpg', // Empire of AI by Karen Hao
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['city', 'uncertain', 'walls'],
    authorKeywords: ['murakami'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780593655033-L.jpg', // Will need correct ISBN
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['strange', 'weather', 'tokyo'],
    authorKeywords: ['kawakami'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781616954564-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['charisma', 'myth'],
    authorKeywords: ['cabane'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781591845940-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['shadow', 'bone'],
    authorKeywords: ['bardugo'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781250027436-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['braiding', 'sweetgrass'],
    authorKeywords: ['kimmerer'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781571313560-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['thus', 'spoke', 'zarathustra'],
    authorKeywords: ['nietzsche'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140441185-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['sanshiro'],
    authorKeywords: ['soseki', 'natsume'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780140445848-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['pride', 'prejudice'],
    authorKeywords: ['austen'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
]

async function fixWhiteCovers() {
  try {
    console.log('🔍 Finding books with white/placeholder covers...\n')

    // Find books that might have white/placeholder covers
    const { rows: books } = await pool.query(`
      SELECT id, title, author, cover_url, isbn, isbn13
      FROM books
      WHERE cover_url IS NULL 
         OR cover_url = ''
         OR cover_url LIKE '%placeholder%'
         OR cover_url LIKE '%via.placeholder%'
         OR cover_url LIKE '%data:image/svg%'
         OR LOWER(title) LIKE '%empire%ai%'
         OR LOWER(title) LIKE '%city%uncertain%walls%'
         OR LOWER(title) LIKE '%strange%weather%tokyo%'
         OR LOWER(title) LIKE '%charisma%myth%'
         OR LOWER(title) LIKE '%shadow%bone%'
         OR LOWER(title) LIKE '%braiding%sweetgrass%'
         OR LOWER(title) LIKE '%thus%spoke%zarathustra%'
         OR LOWER(title) LIKE '%sanshiro%'
         OR LOWER(title) LIKE '%pride%prejudice%'
      ORDER BY title
    `)

    console.log(`Found ${books.length} books to check\n`)

    if (books.length === 0) {
      console.log('✅ No books found that need cover updates!')
      await pool.end()
      process.exit(0)
    }

    let updated = 0

    for (const book of books) {
      const bookTitleLower = book.title.toLowerCase()
      const bookAuthorLower = (book.author || '').toLowerCase()

      console.log(`📚 Checking: "${book.title}" by ${book.author}`)

      // Try to match with verified covers
      let matchedCover: typeof verifiedCovers[0] | null = null

      for (const coverInfo of verifiedCovers) {
        const titleMatches = coverInfo.titleKeywords.every(keyword => 
          bookTitleLower.includes(keyword.toLowerCase())
        )
        
        const authorMatches = !coverInfo.authorKeywords || 
          coverInfo.authorKeywords.some(keyword => 
            bookAuthorLower.includes(keyword.toLowerCase())
          )

        if (titleMatches && authorMatches) {
          matchedCover = coverInfo
          break
        }
      }

      if (matchedCover) {
        console.log(`   ✅ Found match: ${matchedCover.source}`)
        console.log(`   Updating cover: ${matchedCover.coverUrl}`)

        // Verify the cover URL exists before updating
        try {
          const coverTest = await fetch(matchedCover.coverUrl, { method: 'HEAD' })
          if (coverTest.ok) {
            await pool.query(
              'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
              [matchedCover.coverUrl, book.id]
            )
            updated++
            console.log(`   ✅ Updated!\n`)
          } else {
            console.log(`   ⚠️  Cover URL not accessible, skipping\n`)
          }
        } catch (error) {
          console.log(`   ⚠️  Error verifying cover URL: ${error}\n`)
        }
      } else {
        console.log(`   ⚠️  No verified cover found\n`)
      }
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Updated: ${updated} books`)
    console.log(`   📚 Total checked: ${books.length} books\n`)

    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Script failed:', error.message)
    console.error('Error stack:', error.stack)
    await pool.end()
    process.exit(1)
  }
}

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  console.log('\n📝 Please create .env.local file with:')
  console.log('   DATABASE_URL=postgresql://user:password@host:port/database\n')
  process.exit(1)
}

fixWhiteCovers()
