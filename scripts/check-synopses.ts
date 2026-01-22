import pool from '../lib/db'

async function checkSynopses() {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total,
        COUNT(synopsis) as with_synopsis,
        COUNT(*) - COUNT(synopsis) as without_synopsis
      FROM books
    `)
    
    const stats = result.rows[0]
    console.log('\n📊 Book Synopsis Statistics:')
    console.log('─────────────────────────────')
    console.log(`Total books: ${stats.total}`)
    console.log(`Books with synopsis: ${stats.with_synopsis}`)
    console.log(`Books without synopsis: ${stats.without_synopsis}`)
    console.log(`Completion: ${((stats.with_synopsis / stats.total) * 100).toFixed(1)}%`)
    
    if (stats.without_synopsis > 0) {
      const missing = await pool.query(`
        SELECT title, author 
        FROM books 
        WHERE synopsis IS NULL 
        ORDER BY title 
        LIMIT 10
      `)
      console.log('\n📚 Sample books without synopsis:')
      missing.rows.forEach((book, i) => {
        console.log(`  ${i + 1}. "${book.title}" by ${book.author}`)
      })
      if (stats.without_synopsis > 10) {
        console.log(`  ... and ${stats.without_synopsis - 10} more`)
      }
    }
    
    await pool.end()
  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

checkSynopses()
