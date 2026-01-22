import pool from '../lib/db'
import { parse } from 'csv-parse/sync'
import { readFileSync } from 'fs'

interface GoodReadsBook {
  'Book Id': string
  'Title': string
  'Author': string
  'Exclusive Shelf': string
  'My Review': string
}

/**
 * Script to update ONLY the my_review column from CSV without touching other fields
 * This preserves any manual edits you've made to other columns
 */
async function updateReviewsOnly(csvPath: string) {
  try {
    console.log(`Reading CSV file: ${csvPath}`)
    const csvContent = readFileSync(csvPath, 'utf-8')
    
    // Parse CSV
    const records: GoodReadsBook[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    })
    
    console.log(`Found ${records.length} books in CSV`)
    
    // Count how many books have reviews in the CSV
    const booksWithReviews = records.filter(r => r['My Review']?.trim())
    console.log(`   Books with reviews in CSV: ${booksWithReviews.length}`)
    console.log()
    
    let updated = 0
    let skipped = 0
    let errors = 0
    
    for (const record of records) {
      try {
        const goodreadsId = record['Book Id'].trim()
        if (!goodreadsId) {
          skipped++
          continue
        }
        
        const review = record['My Review']?.trim() || null
        
        // Skip if no review to update
        if (!review) {
          continue
        }
        
        // Try to find book by goodreads_id first
        let checkQuery = await pool.query(
          'SELECT id, title, my_review, goodreads_id FROM books WHERE goodreads_id = $1',
          [goodreadsId]
        )
        
        // If not found by goodreads_id, try matching by title (case-insensitive)
        if (checkQuery.rows.length === 0) {
          checkQuery = await pool.query(
            'SELECT id, title, my_review, goodreads_id FROM books WHERE LOWER(TRIM(title)) = LOWER(TRIM($1))',
            [record['Title'].trim()]
          )
        }
        
        // If still not found, try matching by title AND author
        if (checkQuery.rows.length === 0 && record['Author']?.trim()) {
          checkQuery = await pool.query(
            'SELECT id, title, my_review, goodreads_id FROM books WHERE LOWER(TRIM(title)) = LOWER(TRIM($1)) AND LOWER(TRIM(author)) = LOWER(TRIM($2))',
            [record['Title'].trim(), record['Author'].trim()]
          )
        }
        
        if (checkQuery.rows.length === 0) {
          skipped++
          if (skipped <= 5) {
            console.log(`   ⚠️  Book not found: "${record['Title']}" by ${record['Author'] || 'Unknown'}`)
          }
          continue
        }
        
        // If multiple matches, use the first one
        const dbBook = checkQuery.rows[0]
        const bookId = dbBook.id
        
        // Update both my_review AND goodreads_id (if it's NULL)
        // This way future imports will match by goodreads_id
        const updateQuery = `
          UPDATE books 
          SET my_review = $1,
              goodreads_id = COALESCE(goodreads_id, $2),
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $3
        `
        
        const result = await pool.query(updateQuery, [review, goodreadsId, bookId])
        
        if (result.rowCount === 1) {
          updated++
          const existingReview = dbBook.my_review
          const hadReview = existingReview && existingReview.trim().length > 0
          const matchedBy = dbBook.goodreads_id ? 'goodreads_id' : 'title'
          if (updated <= 5 || updated % 10 === 0) {
            console.log(`   ✅ Updated: "${record['Title']}" ${hadReview ? '(replaced existing review)' : '(new review)'} [matched by ${matchedBy}]`)
          }
        } else {
          skipped++
          console.log(`   ⚠️  Update failed for: "${record['Title']}"`)
        }
      } catch (error: any) {
        errors++
        console.error(`   ❌ Error updating review for "${record['Title']}":`, error.message)
      }
    }
    
    console.log('\n✅ Review update completed!')
    console.log(`   Updated: ${updated} reviews`)
    console.log(`   Skipped: ${skipped} books (not found in database or no review in CSV)`)
    console.log(`   Errors: ${errors} books`)
    
    if (updated === 0 && booksWithReviews.length > 0) {
      console.log('\n⚠️  WARNING: No reviews were updated!')
      console.log('   Possible issues:')
      console.log('   1. Books in CSV don\'t match books in database (check goodreads_id)')
      console.log('   2. Database connection issue')
      console.log('   3. Column name mismatch')
      
      // Show sample of what we're trying to match
      console.log('\n   Sample books with reviews from CSV:')
      const samples = booksWithReviews.slice(0, 3)
      for (const sample of samples) {
        console.log(`     - "${sample['Title']}" (Book Id: ${sample['Book Id']})`)
      }
    }
    
    // Show summary of reviews
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(my_review) FILTER (WHERE my_review IS NOT NULL AND my_review != '') as books_with_review
      FROM books
    `)
    console.log(`\n📊 Database stats:`)
    console.log(`   Total books: ${stats.rows[0].total_books}`)
    console.log(`   Books with reviews: ${stats.rows[0].books_with_review}`)
    
    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Update failed:', error.message)
    console.error('Full error:', error)
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

// Get CSV path from command line argument
const csvPath = process.argv[2]
if (!csvPath) {
  console.error('Usage: bun run scripts/update-reviews-only.ts <path-to-csv>')
  console.log('\nExample: bun run scripts/update-reviews-only.ts /Users/justinwu/Desktop/goodreads_library_export.csv')
  process.exit(1)
}

updateReviewsOnly(csvPath)
