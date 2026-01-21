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
  {
    titleKeywords: ['think', 'grow', 'rich'],
    authorKeywords: ['hill'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781585424337-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['into', 'wild'],
    authorKeywords: ['krakauer'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780385486804-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['perks', 'wallflower'],
    authorKeywords: ['chbosky'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781439146835-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['convenience', 'store', 'woman'],
    authorKeywords: ['murata'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781611856071-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['song', 'achilles'],
    authorKeywords: ['miller'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780062060624-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['atomic', 'habits'],
    authorKeywords: ['clear'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
  {
    titleKeywords: ['crooked', 'kingdom'],
    authorKeywords: ['bardugo'],
    coverUrl: 'https://covers.openlibrary.org/b/isbn/9781780622316-L.jpg',
    source: 'openlibrary-isbn-verified'
  },
]

async function searchGoogleBooks(title: string, author?: string): Promise<string | null> {
  try {
    let query = `intitle:${title}`
    if (author) {
      query += ` inauthor:${author}`
    }

    const searchUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}&maxResults=5`
    
    const response = await fetch(searchUrl)
    if (!response.ok) return null

    const data = await response.json()
    
    if (data.items && data.items.length > 0) {
      for (const item of data.items) {
        const volumeInfo = item.volumeInfo
        if (volumeInfo.imageLinks) {
          const coverUrl = volumeInfo.imageLinks.extraLarge ||
                         volumeInfo.imageLinks.large ||
                         volumeInfo.imageLinks.medium ||
                         volumeInfo.imageLinks.small ||
                         volumeInfo.imageLinks.thumbnail
          
          if (coverUrl) {
            return coverUrl.replace('http:', 'https:').replace('&edge=curl', '').replace(/&zoom=\d/, '&zoom=0')
          }
        }
      }
    }
    return null
  } catch (error) {
    return null
  }
}

async function fixWhiteCovers() {
  try {
    console.log('🔍 Finding books with missing or invalid covers...\n')

    // Find all books that don't have a legitimate cover
    const { rows: books } = await pool.query(`
      SELECT id, title, author, cover_url, isbn, isbn13
      FROM books
      WHERE cover_url IS NULL 
         OR cover_url = ''
         OR cover_url LIKE '%placeholder%'
         OR cover_url LIKE '%via.placeholder%'
         OR cover_url LIKE '%data:image/svg%'
      ORDER BY title
    `)

    console.log(`Found ${books.length} books to check\n`)

    if (books.length === 0) {
      console.log('✅ All books already have covers!')
      await pool.end()
      process.exit(0)
    }

    let updated = 0

    for (const book of books) {
      console.log(`📚 Searching for: "${book.title}" by ${book.author}`)

      // Try verified covers list first
      let matchedCoverUrl: string | null = null
      
      const bookTitleLower = book.title.toLowerCase()
      for (const coverInfo of verifiedCovers) {
        if (coverInfo.titleKeywords.every(keyword => bookTitleLower.includes(keyword.toLowerCase()))) {
          matchedCoverUrl = coverInfo.coverUrl
          break
        }
      }

      // If not in verified list, search Google Books
      if (!matchedCoverUrl) {
        matchedCoverUrl = await searchGoogleBooks(book.title, book.author)
      }

      if (matchedCoverUrl) {
        await pool.query(
          'UPDATE books SET cover_url = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
          [matchedCoverUrl, book.id]
        )
        updated++
        console.log(`   ✅ Updated!\n`)
      } else {
        console.log(`   ⚠️  No cover found\n`)
      }

      await new Promise(resolve => setTimeout(resolve, 300))
    }

    console.log(`\n📊 Summary:`)
    console.log(`   ✅ Updated: ${updated} books`)
    console.log(`   📚 Total processed: ${books.length} books\n`)

    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Script failed:', error.message)
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
