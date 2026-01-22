import pool from '../lib/db'

/**
 * Script to verify reviews in the database
 * Shows books with reviews and their review status
 */

async function verifyReviews() {
  try {
    console.log('🔍 Checking if reviews exist in database...\n')

    // 1. Count books with reviews
    const stats = await pool.query(`
      SELECT 
        COUNT(*) as total_books,
        COUNT(*) FILTER (WHERE my_review IS NOT NULL AND my_review != '') as books_with_review,
        COUNT(*) FILTER (WHERE my_review IS NULL) as books_with_null_review,
        COUNT(*) FILTER (WHERE my_review = '') as books_with_empty_review
      FROM books
    `)
    
    const hasReviews = parseInt(stats.rows[0].books_with_review) > 0
    
    console.log('📊 Review Statistics:')
    console.log(`   Total books: ${stats.rows[0].total_books}`)
    console.log(`   Books with reviews: ${stats.rows[0].books_with_review}`)
    console.log(`   Books with NULL reviews: ${stats.rows[0].books_with_null_review}`)
    console.log(`   Books with empty reviews: ${stats.rows[0].books_with_empty_review}`)
    console.log()
    
    if (hasReviews) {
      console.log('✅ YES - Reviews exist in the database!')
    } else {
      console.log('❌ NO - No reviews found in the database')
      console.log('   All reviews are either NULL or empty strings')
    }
    console.log()

    // 2. Show ALL books with reviews
    console.log('📚 All books with reviews:')
    const booksWithReviews = await pool.query(`
      SELECT id, title, author, 
             LENGTH(my_review) as review_length,
             LEFT(my_review, 80) as review_preview,
             goodreads_id,
             exclusive_shelf
      FROM books
      WHERE my_review IS NOT NULL 
        AND my_review != ''
      ORDER BY updated_at DESC, id DESC
    `)

    if (booksWithReviews.rows.length === 0) {
      console.log('   ❌ No books with reviews found!')
    } else {
      console.log(`   Found ${booksWithReviews.rows.length} books with reviews:\n`)
      booksWithReviews.rows.forEach((book: any, index: number) => {
        console.log(`   ${index + 1}. "${book.title}" by ${book.author || 'Unknown'}`)
        console.log(`      Shelf: ${book.exclusive_shelf || 'N/A'}`)
        console.log(`      Review: ${book.review_length} chars - "${book.review_preview}..."`)
        console.log(`      Goodreads ID: ${book.goodreads_id || 'NULL'}`)
        console.log()
      })
    }

    // 3. Check "Birthday Girl" specifically
    console.log('\n🎂 Checking "Birthday Girl":')
    const birthdayGirl = await pool.query(`
      SELECT id, title, author, 
             my_review,
             CASE 
               WHEN my_review IS NULL THEN 'NULL'
               WHEN my_review = '' THEN 'EMPTY STRING'
               ELSE 'HAS REVIEW'
             END as review_status,
             LENGTH(my_review) as review_length,
             goodreads_id
      FROM books
      WHERE LOWER(title) LIKE '%birthday girl%'
    `)

    if (birthdayGirl.rows.length === 0) {
      console.log('   ❌ "Birthday Girl" not found in database')
    } else {
      birthdayGirl.rows.forEach((book: any) => {
        console.log(`   Title: ${book.title}`)
        console.log(`   Author: ${book.author || 'Unknown'}`)
        console.log(`   Review Status: ${book.review_status}`)
        console.log(`   Review Length: ${book.review_length || 0} characters`)
        console.log(`   Goodreads ID: ${book.goodreads_id}`)
        if (book.my_review) {
          console.log(`   Review Preview: ${book.my_review.substring(0, 150)}...`)
        }
        console.log()
      })
    }

    // 4. Show books on "read" shelf without reviews
    console.log('\n📖 Books on "read" shelf WITHOUT reviews:')
    const booksWithoutReviews = await pool.query(`
      SELECT id, title, author, goodreads_id
      FROM books
      WHERE exclusive_shelf = 'read' 
        AND (my_review IS NULL OR my_review = '')
      ORDER BY id DESC
      LIMIT 10
    `)

    if (booksWithoutReviews.rows.length === 0) {
      console.log('   ✅ All books on "read" shelf have reviews!')
    } else {
      console.log(`   Found ${booksWithoutReviews.rows.length} books without reviews (showing first 10):\n`)
      booksWithoutReviews.rows.forEach((book: any, index: number) => {
        console.log(`   ${index + 1}. "${book.title}" by ${book.author || 'Unknown'}`)
        console.log(`      Goodreads ID: ${book.goodreads_id}`)
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

// Check DATABASE_URL
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!')
  console.log('\n📝 Please create .env.local file with:')
  console.log('   DATABASE_URL=postgresql://user:password@host:port/database\n')
  process.exit(1)
}

verifyReviews()
