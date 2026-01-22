import pool from '../lib/db'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'

/**
 * Debug script to see why reviews aren't matching
 * Checks if goodreads_id values match between CSV and database
 */

interface GoodReadsBook {
  'Book Id': string
  'Title': string
  'Author': string
  'My Review': string
}

async function debugMatching(csvPath: string) {
  try {
    console.log(`Reading CSV file: ${csvPath}`)
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    const records: GoodReadsBook[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
    
    const booksWithReviews = records.filter(r => r['My Review']?.trim())
    console.log(`Found ${booksWithReviews.length} books with reviews in CSV\n`)
    
    // Check first 5 books with reviews
    console.log('📋 Sample books with reviews from CSV:')
    const samples = booksWithReviews.slice(0, 5)
    for (const book of samples) {
      const goodreadsId = book['Book Id'].trim()
      console.log(`\n   "${book['Title']}" by ${book['Author']}`)
      console.log(`   CSV Book Id: "${goodreadsId}"`)
      console.log(`   Review length: ${book['My Review']?.trim().length || 0} chars`)
      
      // Check if this book exists in database
      const dbCheck = await pool.query(
        'SELECT id, title, author, goodreads_id, my_review FROM books WHERE goodreads_id = $1',
        [goodreadsId]
      )
      
      if (dbCheck.rows.length === 0) {
        console.log(`   ❌ NOT FOUND in database (no matching goodreads_id)`)
        
        // Try to find by title/author
        const titleMatch = await pool.query(
          'SELECT id, title, author, goodreads_id FROM books WHERE LOWER(title) = LOWER($1)',
          [book['Title'].trim()]
        )
        if (titleMatch.rows.length > 0) {
          console.log(`   💡 Found by title: goodreads_id in DB = "${titleMatch.rows[0].goodreads_id}"`)
          console.log(`      CSV has: "${goodreadsId}"`)
          console.log(`      DB has:  "${titleMatch.rows[0].goodreads_id}"`)
          if (titleMatch.rows[0].goodreads_id !== goodreadsId) {
            console.log(`      ⚠️  MISMATCH!`)
          }
        }
      } else {
        const dbBook = dbCheck.rows[0]
        console.log(`   ✅ FOUND in database`)
        console.log(`      DB goodreads_id: "${dbBook.goodreads_id}"`)
        console.log(`      Current review: ${dbBook.my_review ? `${dbBook.my_review.length} chars` : 'NULL/EMPTY'}`)
      }
    }
    
    // Check database stats
    console.log('\n📊 Database stats:')
    const dbStats = await pool.query(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(goodreads_id) as books_with_goodreads_id,
        COUNT(*) FILTER (WHERE goodreads_id IS NULL) as books_without_goodreads_id
      FROM books
    `)
    console.log(`   Total books: ${dbStats.rows[0].total_books}`)
    console.log(`   Books with goodreads_id: ${dbStats.rows[0].books_with_goodreads_id}`)
    console.log(`   Books without goodreads_id: ${dbStats.rows[0].books_without_goodreads_id}`)
    
    // Check if goodreads_ids match
    console.log('\n🔍 Checking goodreads_id matching:')
    const csvGoodreadsIds = new Set(booksWithReviews.map(r => r['Book Id'].trim()))
    const dbGoodreadsIds = await pool.query('SELECT DISTINCT goodreads_id FROM books WHERE goodreads_id IS NOT NULL')
    const dbGoodreadsIdsSet = new Set(dbGoodreadsIds.rows.map((r: any) => r.goodreads_id))
    
    const matching = Array.from(csvGoodreadsIds).filter(id => dbGoodreadsIdsSet.has(id))
    const notMatching = Array.from(csvGoodreadsIds).filter(id => !dbGoodreadsIdsSet.has(id))
    
    console.log(`   CSV goodreads_ids with reviews: ${csvGoodreadsIds.size}`)
    console.log(`   DB goodreads_ids: ${dbGoodreadsIdsSet.size}`)
    console.log(`   Matching: ${matching.length}`)
    console.log(`   NOT matching: ${notMatching.length}`)
    
    if (notMatching.length > 0 && notMatching.length <= 5) {
      console.log(`\n   ⚠️  Non-matching goodreads_ids (first few):`)
      notMatching.slice(0, 5).forEach(id => {
        const csvBook = booksWithReviews.find(r => r['Book Id'].trim() === id)
        console.log(`      "${csvBook?.Title}" - CSV ID: ${id}`)
      })
    }
    
    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
    console.error('Full error:', error)
    await pool.end()
    process.exit(1)
  }
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  process.exit(1)
}

const csvPath = process.argv[2] || '/Users/justinwu/Desktop/goodreads_library_export.csv'
debugMatching(csvPath)
