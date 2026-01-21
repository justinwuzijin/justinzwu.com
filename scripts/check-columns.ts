import pool from '../lib/db'

async function checkColumns() {
  try {
    const result = await pool.query(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'books'
    `)
    console.log('Columns in books table:')
    result.rows.forEach(row => console.log(`- ${row.column_name}`))
    
    const sample = await pool.query(`SELECT title, my_review FROM books WHERE my_review IS NOT NULL LIMIT 3`)
    if (sample.rows.length > 0) {
      console.log('\nSample reviews found:')
      sample.rows.forEach(row => console.log(`- ${row.title}: ${row.my_review.substring(0, 50)}...`))
    } else {
      console.log('\nNo non-null reviews found in the database.')
    }
    
    process.exit(0)
  } catch (err: any) {
    console.error('Error:', err.message)
    process.exit(1)
  }
}

checkColumns()
