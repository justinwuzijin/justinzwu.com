import pool from '../lib/db'

/**
 * Script to check if my_review column exists and query for Birthday Girl review
 */

async function checkReviews() {
  try {
    console.log('🔍 Checking database structure and reviews...\n')

    // 1. Check if my_review column exists (checking both singular and plural)
    console.log('1. Checking if my_review column exists...')
    const columnCheck = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'books' AND (column_name = 'my_review' OR column_name = 'my_reviews')
    `)

    if (columnCheck.rows.length === 0) {
      console.log('❌ Column my_review or my_reviews does NOT exist in books table!\n')
      console.log('💡 Run: bun run scripts/add-my-review-column.ts\n')
    } else {
      const column = columnCheck.rows[0]
      console.log(`✅ Column ${column.column_name} exists!`)
      console.log('   Type:', column.data_type)
      console.log('   Nullable:', column.is_nullable)
      if (column.column_name === 'my_reviews') {
        console.log('   ⚠️  WARNING: Column is named "my_reviews" (plural) but code expects "my_review" (singular)!')
      }
      console.log()
    }

    // 2. Check table structure
    console.log('2. Checking books table structure...')
    const tableStructure = await pool.query(`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns 
      WHERE table_name = 'books'
      ORDER BY ordinal_position
    `)
    console.log(`   Found ${tableStructure.rows.length} columns:`)
    tableStructure.rows.forEach((row: any) => {
      console.log(`   - ${row.column_name} (${row.data_type})`)
    })
    console.log()

    // 3. Query for Birthday Girl (checking both column names)
    console.log('3. Searching for "Birthday Girl"...')
    
    // First check which column name exists
    const columnName = columnCheck.rows.length > 0 ? columnCheck.rows[0].column_name : 'my_review'
    
    const birthdayGirl = await pool.query(`
      SELECT id, title, author, ${columnName} as my_review, 
             CASE WHEN ${columnName} IS NULL THEN 'NULL' 
                  WHEN ${columnName} = '' THEN 'EMPTY STRING'
                  ELSE 'HAS REVIEW' END as review_status,
             LENGTH(${columnName}) as review_length
      FROM books
      WHERE LOWER(title) LIKE '%birthday girl%'
      ORDER BY id
    `)

    if (birthdayGirl.rows.length === 0) {
      console.log('❌ No book found with "Birthday Girl" in the title\n')
    } else {
      console.log(`✅ Found ${birthdayGirl.rows.length} book(s):\n`)
      birthdayGirl.rows.forEach((book: any) => {
        console.log(`   Book ID: ${book.id}`)
        console.log(`   Title: ${book.title}`)
        console.log(`   Author: ${book.author || 'N/A'}`)
        console.log(`   Review Status: ${book.review_status}`)
        if (book.review_length) {
          console.log(`   Review Length: ${book.review_length} characters`)
        }
        if (book.my_review) {
          console.log(`   Review Preview: ${book.my_review.substring(0, 100)}...`)
        }
        console.log()
      })
    }

    // 4. Count books with reviews
    console.log('4. Statistics:')
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(${columnName}) as books_with_review,
        COUNT(*) FILTER (WHERE ${columnName} IS NOT NULL AND ${columnName} != '') as books_with_non_empty_review
      FROM books
    `)
    console.log(`   Total books: ${stats.rows[0].total_books}`)
    console.log(`   Books with review (non-null): ${stats.rows[0].books_with_review}`)
    console.log(`   Books with non-empty review: ${stats.rows[0].books_with_non_empty_review}`)
    console.log()

    await pool.end()
    process.exit(0)
  } catch (error: any) {
    console.error('❌ Error:', error.message)
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

checkReviews()
